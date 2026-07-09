-- TVF OS - Installation complete MVP
-- Version corrigee : ajoute les colonnes de compatibilite avant usage pour les tables deja existantes, dont search_vector.
-- Executer dans Supabase SQL Editor.



-- ============================================================
-- supabase\tvf-os-demandes-entrantes.sql
-- ============================================================

-- TVF OS - Module Demandes entrantes
-- Migration production : structure metier, RLS, historique, IA et pieces.
-- A executer apres la migration contacts operationnelle et avant de publier le module.

create extension if not exists pgcrypto;

create sequence if not exists public.contacts_request_number_seq;

alter table if exists public.contacts
  add column if not exists request_number text,
  add column if not exists channel text not null default 'site_web',
  add column if not exists form_code text,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists subject text,
  add column if not exists message text,
  add column if not exists status text not null default 'nouveau',
  add column if not exists priority text not null default 'normale',
  add column if not exists category text not null default 'demande-generale',
  add column if not exists assigned_to text,
  add column if not exists source_page text,
  add column if not exists user_agent text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists pole text,
  add column if not exists next_action text,
  add column if not exists next_action_due_at timestamptz,
  add column if not exists closure_reason text,
  add column if not exists ai_summary text,
  add column if not exists ai_confidence numeric(4,2) not null default 0.72,
  add column if not exists qualification_score integer not null default 0,
  add column if not exists missing_pieces text[] not null default '{}';

alter table if exists public.contacts
  drop constraint if exists contacts_channel_check;

alter table if exists public.contacts
  add constraint contacts_channel_check
  check (channel in ('site_web', 'email', 'telephone', 'whatsapp', 'rendez_vous', 'import'));

alter table if exists public.contacts
  drop constraint if exists contacts_ai_confidence_check;

alter table if exists public.contacts
  add constraint contacts_ai_confidence_check
  check (ai_confidence >= 0 and ai_confidence <= 1);

alter table if exists public.contacts
  drop constraint if exists contacts_qualification_score_check;

alter table if exists public.contacts
  add constraint contacts_qualification_score_check
  check (qualification_score >= 0 and qualification_score <= 100);

create unique index if not exists contacts_request_number_unique_idx
  on public.contacts(request_number)
  where request_number is not null;

create index if not exists contacts_channel_idx on public.contacts(channel);
create index if not exists contacts_pole_idx on public.contacts(pole);
create index if not exists contacts_next_action_due_at_idx on public.contacts(next_action_due_at);
create index if not exists contacts_missing_pieces_gin_idx on public.contacts using gin(missing_pieces);

create or replace function public.tvf_category_to_pole(category_value text)
returns text
language sql
stable
as $$
  select case coalesce(category_value, 'demande-generale')
    when 'collectivite-territoire' then 'Developpement territorial'
    when 'bien-vacant-proprietaire' then 'Habitat vivant'
    when 'materiaux-reemploi' then 'Materiautheque solidaire'
    when 'entreprise-partenariat' then 'Partenariats & RSE'
    when 'benevolat-insertion' then 'Mobilisation citoyenne'
    when 'financement-mecenat' then 'Financement & mecenat'
    when 'presse-institutionnel' then 'Communication institutionnelle'
    else 'Accueil & orientation'
  end;
$$;

create or replace function public.tvf_priority_sla_days(priority_value text)
returns integer
language sql
stable
as $$
  select case coalesce(priority_value, 'normale')
    when 'urgente' then 1
    when 'haute' then 2
    else 5
  end;
$$;

create or replace function public.set_contacts_request_metadata()
returns trigger
language plpgsql
as $$
begin
  if new.request_number is null or new.request_number = '' then
    new.request_number := 'TVF-' || to_char(coalesce(new.created_at, now()), 'YYYY') || '-' || lpad(nextval('public.contacts_request_number_seq')::text, 4, '0');
  end if;

  if new.pole is null or new.pole = '' then
    new.pole := public.tvf_category_to_pole(new.category);
  end if;

  if new.next_action is null or new.next_action = '' then
    if coalesce(array_length(new.missing_pieces, 1), 0) > 0 then
      new.next_action := 'Demander les pieces manquantes';
    else
      new.next_action := 'Qualifier la demande';
    end if;
  end if;

  if new.next_action_due_at is null and coalesce(new.status, 'nouveau') not in ('archive', 'refuse') then
    new.next_action_due_at := coalesce(new.created_at, now()) + make_interval(days => public.tvf_priority_sla_days(new.priority));
  end if;

  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := coalesce(new.pole, public.tvf_category_to_pole(new.category)) || ' - demande a qualifier, categorie ' || coalesce(new.category, 'demande-generale') || '.';
  end if;

  new.qualification_score := least(100,
    25
    + case when coalesce(new.email, '') <> '' then 15 else 0 end
    + case when coalesce(new.subject, '') <> '' then 15 else 0 end
    + case when length(coalesce(new.message, '')) > 120 then 20 else 0 end
    + case when coalesce(new.category, 'demande-generale') <> 'demande-generale' then 10 else 0 end
    + case when coalesce(new.assigned_to, '') <> '' then 10 else 0 end
    + case when coalesce(array_length(new.missing_pieces, 1), 0) = 0 then 5 else 0 end
  );

  return new;
end;
$$;

drop trigger if exists set_contacts_request_metadata on public.contacts;
create trigger set_contacts_request_metadata
before insert or update on public.contacts
for each row
execute function public.set_contacts_request_metadata();

update public.contacts
set request_number = 'TVF-' || to_char(coalesce(created_at, now()), 'YYYY') || '-' || lpad(nextval('public.contacts_request_number_seq')::text, 4, '0')
where request_number is null;

update public.contacts
set pole = public.tvf_category_to_pole(category)
where pole is null or pole = '';

update public.contacts
set next_action_due_at = coalesce(created_at, now()) + make_interval(days => public.tvf_priority_sla_days(priority))
where next_action_due_at is null
  and coalesce(status, 'nouveau') not in ('archive', 'refuse');

create table if not exists public.request_activity_log (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  event_type text not null,
  event_label text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  constraint request_activity_log_event_type_check
    check (event_type in ('created', 'status_changed', 'qualification_updated', 'email_prepared', 'pieces_requested', 'case_prepared', 'note'))
);

create index if not exists request_activity_log_contact_idx
  on public.request_activity_log(contact_id, created_at desc);

create table if not exists public.request_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  suggestion_type text not null,
  suggestion jsonb not null default '{}'::jsonb,
  confidence numeric(4,2) not null default 0.72,
  status text not null default 'proposed',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint request_ai_suggestions_type_check
    check (suggestion_type in ('category', 'priority', 'pole', 'missing_pieces', 'response', 'next_action', 'case_conversion')),
  constraint request_ai_suggestions_status_check
    check (status in ('proposed', 'accepted', 'edited', 'rejected')),
  constraint request_ai_suggestions_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create index if not exists request_ai_suggestions_contact_idx
  on public.request_ai_suggestions(contact_id, status, created_at desc);

create table if not exists public.request_documents (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  file_name text not null,
  file_path text,
  document_type text,
  status text not null default 'received',
  uploaded_by text,
  created_at timestamptz not null default now(),
  constraint request_documents_status_check
    check (status in ('expected', 'received', 'validated', 'rejected'))
);

create index if not exists request_documents_contact_idx
  on public.request_documents(contact_id, status, created_at desc);

alter table public.request_activity_log enable row level security;
alter table public.request_ai_suggestions enable row level security;
alter table public.request_documents enable row level security;

-- Service role bypass RLS. Les policies ci-dessous preparent les futurs comptes Supabase Auth TVF.
drop policy if exists "TVF admins can read request activity" on public.request_activity_log;
create policy "TVF admins can read request activity"
  on public.request_activity_log
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

drop policy if exists "TVF admins can manage request activity" on public.request_activity_log;
create policy "TVF admins can manage request activity"
  on public.request_activity_log
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

drop policy if exists "TVF admins can read request ai suggestions" on public.request_ai_suggestions;
create policy "TVF admins can read request ai suggestions"
  on public.request_ai_suggestions
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

drop policy if exists "TVF admins can manage request ai suggestions" on public.request_ai_suggestions;
create policy "TVF admins can manage request ai suggestions"
  on public.request_ai_suggestions
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

drop policy if exists "TVF admins can read request documents" on public.request_documents;
create policy "TVF admins can read request documents"
  on public.request_documents
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

drop policy if exists "TVF admins can manage request documents" on public.request_documents;
create policy "TVF admins can manage request documents"
  on public.request_documents
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin', 'branch_manager', 'request_manager'));

comment on column public.contacts.request_number is 'Numero metier unique TVF OS, format TVF-AAAA-0001.';
comment on column public.contacts.channel is 'Canal d entree de la demande : site, e-mail, telephone, WhatsApp, rendez-vous ou import.';
comment on column public.contacts.pole is 'Pole TVF propose ou confirme pour traiter la demande.';
comment on column public.contacts.next_action is 'Prochaine action operationnelle attendue.';
comment on column public.contacts.next_action_due_at is 'Echeance de la prochaine action selon SLA.';
comment on column public.contacts.ai_summary is 'Resume assistant IA de qualification.';
comment on column public.contacts.missing_pieces is 'Liste des pieces manquantes detectees ou confirmees.';


-- ============================================================
-- supabase\tvf-os-crm.sql
-- ============================================================

-- TVF OS - Module CRM / Contacts
-- Migration production : contacts relationnels, organisations, rattachements, historique, doublons.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  first_name text,
  last_name text,
  display_name text not null,
  email text,
  phone text,
  mobile text,
  contact_type text not null default 'autre',
  consent_status text not null default 'unknown',
  consent_source text,
  confidentiality_level text not null default 'standard',
  source text not null default 'manual',
  tags text[] not null default '{}',
  notes text,
  ai_summary text,
  duplicate_key text,
  last_interaction_at timestamptz,
  next_action text,
  next_action_due_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_contacts_type_check check (contact_type in ('proprietaire','elu','technicien','entreprise_contact','benevole','financeur','journaliste','citoyen','partenaire','autre')),
  constraint crm_contacts_consent_check check (consent_status in ('unknown','pending','granted','refused','expired')),
  constraint crm_contacts_confidentiality_check check (confidentiality_level in ('public','standard','confidentiel','sensible'))
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  name text not null,
  organization_type text not null default 'partenaire',
  sub_type text,
  siret text,
  website text,
  email text,
  phone text,
  address text,
  city text,
  department text,
  region text,
  relation_status text not null default 'prospect',
  confidentiality_level text not null default 'standard',
  contribution_potential text,
  next_action text,
  next_action_due_at timestamptz,
  tags text[] not null default '{}',
  notes text,
  ai_summary text,
  duplicate_key text,
  last_interaction_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_type_check check (organization_type in ('collectivite','entreprise','association','financeur','institution','media','proprietaire_personne_morale','partenaire','fournisseur','autre')),
  constraint organizations_relation_status_check check (relation_status in ('prospect','actif','conventionne','ancien','sensible')),
  constraint organizations_confidentiality_check check (confidentiality_level in ('public','standard','confidentiel','sensible'))
);

create table if not exists public.organization_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  role_label text,
  is_primary boolean not null default false,
  start_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, contact_id, role_label)
);

create table if not exists public.relationship_history (
  id uuid primary key default gen_random_uuid(),
  related_contact_id uuid references public.crm_contacts(id) on delete cascade,
  related_organization_id uuid references public.organizations(id) on delete cascade,
  branch_id uuid,
  interaction_type text not null default 'note',
  subject text not null,
  summary text,
  channel text,
  occurred_at timestamptz not null default now(),
  created_by text,
  created_at timestamptz not null default now(),
  constraint relationship_history_target_check check (related_contact_id is not null or related_organization_id is not null),
  constraint relationship_history_type_check check (interaction_type in ('note','email','appel','rendez_vous','document','demande','relance','decision'))
);

create table if not exists public.crm_duplicate_suggestions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  primary_entity_id uuid not null,
  duplicate_entity_id uuid not null,
  confidence numeric(4,2) not null default 0.75,
  reason text,
  status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint crm_duplicate_suggestions_entity_check check (entity_type in ('contact','organization')),
  constraint crm_duplicate_suggestions_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint crm_duplicate_suggestions_status_check check (status in ('pending','confirmed','ignored','merged')),
  constraint crm_duplicate_suggestions_pair_check check (primary_entity_id <> duplicate_entity_id)
);

create or replace function public.tvf_normalize_key(value text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(lower(unaccent(coalesce(value, ''))), '[^a-z0-9@.+-]+', '', 'g'), '');
$$;

create or replace function public.set_crm_contact_metadata()
returns trigger
language plpgsql
as $$
begin
  new.display_name := nullif(trim(coalesce(new.display_name, '')), '');
  if new.display_name is null then
    new.display_name := nullif(trim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, '')), '');
  end if;
  if new.display_name is null then
    new.display_name := coalesce(nullif(new.email, ''), 'Contact TVF');
  end if;
  new.email := nullif(lower(trim(coalesce(new.email, ''))), '');
  new.duplicate_key := public.tvf_normalize_key(coalesce(new.email, new.display_name));
  new.ai_summary := coalesce(nullif(new.ai_summary, ''), 'Contact ' || new.contact_type || ' - consentement ' || new.consent_status || '.');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_organization_metadata()
returns trigger
language plpgsql
as $$
begin
  new.name := nullif(trim(coalesce(new.name, '')), '');
  if new.name is null then
    raise exception 'Organization name is required';
  end if;
  new.email := nullif(lower(trim(coalesce(new.email, ''))), '');
  new.duplicate_key := public.tvf_normalize_key(coalesce(new.siret, new.email, new.name));
  new.ai_summary := coalesce(nullif(new.ai_summary, ''), 'Organisation ' || new.organization_type || ' - relation ' || new.relation_status || '.');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_relationship_touch()
returns trigger
language plpgsql
as $$
begin
  if new.related_contact_id is not null then
    update public.crm_contacts set last_interaction_at = greatest(coalesce(last_interaction_at, new.occurred_at), new.occurred_at) where id = new.related_contact_id;
  end if;
  if new.related_organization_id is not null then
    update public.organizations set last_interaction_at = greatest(coalesce(last_interaction_at, new.occurred_at), new.occurred_at) where id = new.related_organization_id;
  end if;
  return new;
end;
$$;

drop trigger if exists set_crm_contact_metadata on public.crm_contacts;
create trigger set_crm_contact_metadata
before insert or update on public.crm_contacts
for each row execute function public.set_crm_contact_metadata();

drop trigger if exists set_organization_metadata on public.organizations;
create trigger set_organization_metadata
before insert or update on public.organizations
for each row execute function public.set_organization_metadata();

drop trigger if exists set_relationship_touch on public.relationship_history;
create trigger set_relationship_touch
after insert on public.relationship_history
for each row execute function public.set_relationship_touch();

create index if not exists crm_contacts_email_idx on public.crm_contacts(email);
create index if not exists crm_contacts_type_idx on public.crm_contacts(contact_type, archived_at);
create index if not exists crm_contacts_consent_idx on public.crm_contacts(consent_status);
create index if not exists crm_contacts_duplicate_key_idx on public.crm_contacts(duplicate_key);
create index if not exists crm_contacts_next_action_idx on public.crm_contacts(next_action_due_at) where archived_at is null;
create index if not exists crm_contacts_tags_gin_idx on public.crm_contacts using gin(tags);

create index if not exists organizations_type_idx on public.organizations(organization_type, relation_status);
create index if not exists organizations_duplicate_key_idx on public.organizations(duplicate_key);
create index if not exists organizations_city_idx on public.organizations(city, department, region);
create index if not exists organizations_next_action_idx on public.organizations(next_action_due_at) where archived_at is null;
create index if not exists organizations_tags_gin_idx on public.organizations using gin(tags);

create index if not exists organization_contacts_contact_idx on public.organization_contacts(contact_id);
create index if not exists organization_contacts_organization_idx on public.organization_contacts(organization_id, is_primary);
create index if not exists relationship_history_contact_idx on public.relationship_history(related_contact_id, occurred_at desc);
create index if not exists relationship_history_organization_idx on public.relationship_history(related_organization_id, occurred_at desc);
create index if not exists crm_duplicate_suggestions_status_idx on public.crm_duplicate_suggestions(entity_type, status, confidence desc);

alter table public.crm_contacts enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_contacts enable row level security;
alter table public.relationship_history enable row level security;
alter table public.crm_duplicate_suggestions enable row level security;

-- Service role bypass RLS. Policies preparent les futurs comptes Supabase Auth TVF.
drop policy if exists "TVF CRM can read contacts" on public.crm_contacts;
create policy "TVF CRM can read contacts" on public.crm_contacts for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager','request_manager'));
drop policy if exists "TVF CRM can manage contacts" on public.crm_contacts;
create policy "TVF CRM can manage contacts" on public.crm_contacts for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));

drop policy if exists "TVF CRM can read organizations" on public.organizations;
create policy "TVF CRM can read organizations" on public.organizations for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager','request_manager'));
drop policy if exists "TVF CRM can manage organizations" on public.organizations;
create policy "TVF CRM can manage organizations" on public.organizations for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));

drop policy if exists "TVF CRM can read organization contacts" on public.organization_contacts;
create policy "TVF CRM can read organization contacts" on public.organization_contacts for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager','request_manager'));
drop policy if exists "TVF CRM can manage organization contacts" on public.organization_contacts;
create policy "TVF CRM can manage organization contacts" on public.organization_contacts for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));

drop policy if exists "TVF CRM can read history" on public.relationship_history;
create policy "TVF CRM can read history" on public.relationship_history for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager','request_manager'));
drop policy if exists "TVF CRM can manage history" on public.relationship_history;
create policy "TVF CRM can manage history" on public.relationship_history for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));

drop policy if exists "TVF CRM can read duplicate suggestions" on public.crm_duplicate_suggestions;
create policy "TVF CRM can read duplicate suggestions" on public.crm_duplicate_suggestions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));
drop policy if exists "TVF CRM can manage duplicate suggestions" on public.crm_duplicate_suggestions;
create policy "TVF CRM can manage duplicate suggestions" on public.crm_duplicate_suggestions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','crm_manager'));

comment on table public.crm_contacts is 'CRM TVF OS - personnes physiques externes ou internes non utilisatrices.';
comment on table public.organizations is 'CRM TVF OS - structures externes : collectivites, entreprises, associations, financeurs, institutions, partenaires.';
comment on table public.organization_contacts is 'CRM TVF OS - relation n-n entre contacts et organisations.';
comment on table public.relationship_history is 'CRM TVF OS - historique des interactions relationnelles.';
comment on table public.crm_duplicate_suggestions is 'CRM TVF OS - suggestions de doublons a verifier.';


-- ============================================================
-- supabase\tvf-os-dossiers.sql
-- ============================================================

-- TVF OS - Module Dossiers
-- Migration production : dossiers metier, checklist, participants, historique, risques et decisions.

create extension if not exists pgcrypto;
create sequence if not exists public.cases_number_seq;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique,
  source_request_id uuid references public.contacts(id) on delete set null,
  branch_id uuid,
  case_type text not null default 'autre',
  title text not null,
  status text not null default 'ouvert',
  priority text not null default 'normale',
  main_pole text,
  associated_poles text[] not null default '{}',
  assigned_to text,
  maturity_score integer not null default 0,
  confidentiality_level text not null default 'standard',
  summary text,
  next_action text,
  next_action_due_at timestamptz,
  decision_status text not null default 'non_preparee',
  decision_summary text,
  risk_level text not null default 'modere',
  territory text,
  ai_summary text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_type_check check (case_type in ('bien_vacant','commerce_inoccupe','materiaux','collectivite','entreprise','benevole','financeur','signalement','friche_terrain','presse','gouvernance','autre')),
  constraint cases_status_check check (status in ('ouvert','qualification','instruction','attente_pieces','visite','a_decision','decision_validee','cloture','archive')),
  constraint cases_priority_check check (priority in ('normale','haute','urgente')),
  constraint cases_maturity_check check (maturity_score >= 0 and maturity_score <= 100),
  constraint cases_confidentiality_check check (confidentiality_level in ('public','standard','confidentiel','sensible')),
  constraint cases_decision_status_check check (decision_status in ('non_preparee','a_preparer','proposee','validee','refusee','ajournee')),
  constraint cases_risk_level_check check (risk_level in ('faible','modere','eleve','critique'))
);

create table if not exists public.case_participants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  participant_type text not null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  display_name text,
  role_label text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint case_participants_type_check check (participant_type in ('contact','organization','user','external')),
  constraint case_participants_target_check check (contact_id is not null or organization_id is not null or display_name is not null)
);

create table if not exists public.case_checklist_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  checklist_key text not null,
  label text not null,
  status text not null default 'a_verifier',
  required boolean not null default true,
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(case_id, checklist_key),
  constraint case_checklist_status_check check (status in ('a_verifier','manquant','recu','valide','non_applicable'))
);

create table if not exists public.case_status_history (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_risks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  risk_label text not null,
  risk_level text not null default 'modere',
  mitigation text,
  owner text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_risks_level_check check (risk_level in ('faible','modere','eleve','critique')),
  constraint case_risks_status_check check (status in ('open','mitigated','accepted','closed'))
);

create table if not exists public.case_decisions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  decision_type text not null default 'orientation',
  proposed_decision text not null,
  final_decision text,
  decision_status text not null default 'proposee',
  decided_by text,
  decided_at timestamptz,
  next_step text,
  created_at timestamptz not null default now(),
  constraint case_decisions_type_check check (decision_type in ('orientation','poursuite','refus','cloture','convention','visite','autre')),
  constraint case_decisions_status_check check (decision_status in ('proposee','validee','refusee','ajournee'))
);

create or replace function public.tvf_case_type_pole(case_type_value text)
returns text language sql stable as $$
  select case coalesce(case_type_value, 'autre')
    when 'bien_vacant' then 'Habitat vivant'
    when 'commerce_inoccupe' then 'Habitat vivant'
    when 'friche_terrain' then 'Developpement territorial'
    when 'materiaux' then 'Materiautheque solidaire'
    when 'collectivite' then 'Developpement territorial'
    when 'entreprise' then 'Partenariats & RSE'
    when 'benevole' then 'Mobilisation citoyenne'
    when 'financeur' then 'Financement & mecenat'
    when 'presse' then 'Communication institutionnelle'
    else 'Accueil & orientation'
  end;
$$;

create or replace function public.tvf_case_maturity(case_id_value uuid)
returns integer language sql stable as $$
  with items as (
    select * from public.case_checklist_items where case_id = case_id_value and required = true
  )
  select case when count(*) = 0 then 0 else round(100.0 * count(*) filter (where status in ('recu','valide','non_applicable')) / count(*))::integer end
  from items;
$$;

create or replace function public.set_case_metadata()
returns trigger language plpgsql as $$
begin
  if new.case_number is null or new.case_number = '' then
    new.case_number := 'DOS-' || to_char(coalesce(new.opened_at, now()), 'YYYY') || '-' || lpad(nextval('public.cases_number_seq')::text, 4, '0');
  end if;
  if new.main_pole is null or new.main_pole = '' then
    new.main_pole := public.tvf_case_type_pole(new.case_type);
  end if;
  if new.next_action is null or new.next_action = '' then
    new.next_action := case
      when new.status = 'a_decision' then 'Preparer ou valider la decision humaine'
      when new.status = 'attente_pieces' then 'Relancer les pieces manquantes'
      when new.status = 'cloture' then 'Capitaliser le retour d experience'
      else 'Completer la checklist d instruction'
    end;
  end if;
  if new.next_action_due_at is null and new.status not in ('cloture','archive') then
    new.next_action_due_at := now() + case new.priority when 'urgente' then interval '1 day' when 'haute' then interval '3 days' else interval '7 days' end;
  end if;
  new.ai_summary := coalesce(nullif(new.ai_summary, ''), new.main_pole || ' - dossier ' || new.case_type || ', statut ' || new.status || '.');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_default_case_checklist()
returns trigger language plpgsql as $$
begin
  insert into public.case_checklist_items(case_id, checklist_key, label, required)
  values
    (new.id, 'identity', 'Identite et coordonnees du demandeur', true),
    (new.id, 'territory', 'Territoire ou localisation precise', true),
    (new.id, 'need', 'Description du besoin ou de la ressource', true),
    (new.id, 'documents', 'Pieces, photos ou justificatifs utiles', true),
    (new.id, 'risks', 'Risques identifies et mesures de maitrise', true),
    (new.id, 'decision', 'Decision humaine preparee et tracee', true)
  on conflict do nothing;

  if new.case_type in ('bien_vacant','commerce_inoccupe','friche_terrain') then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'ownership', 'Propriete, mandat ou autorisation clarifiee', true),
      (new.id, 'visit', 'Visite ou diagnostic terrain a organiser', false)
    on conflict do nothing;
  elsif new.case_type = 'materiaux' then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'quantity', 'Quantite, etat et conditions d enlevement', true),
      (new.id, 'reuse_fit', 'Compatibilite avec un projet TVF', true)
    on conflict do nothing;
  elsif new.case_type = 'collectivite' then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'public_need', 'Besoin public ou territorial qualifie', true),
      (new.id, 'referent', 'Interlocuteur referent identifie', true)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.update_case_maturity_from_checklist()
returns trigger language plpgsql as $$
begin
  update public.cases set maturity_score = public.tvf_case_maturity(coalesce(new.case_id, old.case_id)), updated_at = now()
  where id = coalesce(new.case_id, old.case_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists set_case_metadata on public.cases;
create trigger set_case_metadata before insert or update on public.cases for each row execute function public.set_case_metadata();

drop trigger if exists create_default_case_checklist on public.cases;
create trigger create_default_case_checklist after insert on public.cases for each row execute function public.create_default_case_checklist();

drop trigger if exists update_case_maturity_from_checklist on public.case_checklist_items;
create trigger update_case_maturity_from_checklist after insert or update or delete on public.case_checklist_items for each row execute function public.update_case_maturity_from_checklist();

create index if not exists cases_status_idx on public.cases(status, priority, next_action_due_at);
create index if not exists cases_type_idx on public.cases(case_type, main_pole);
create index if not exists cases_source_request_idx on public.cases(source_request_id);
create index if not exists cases_assigned_to_idx on public.cases(assigned_to);
create index if not exists case_participants_case_idx on public.case_participants(case_id, is_primary);
create index if not exists case_checklist_case_idx on public.case_checklist_items(case_id, status);
create index if not exists case_status_history_case_idx on public.case_status_history(case_id, created_at desc);
create index if not exists case_risks_case_idx on public.case_risks(case_id, status, risk_level);
create index if not exists case_decisions_case_idx on public.case_decisions(case_id, decision_status, created_at desc);

alter table public.cases enable row level security;
alter table public.case_participants enable row level security;
alter table public.case_checklist_items enable row level security;
alter table public.case_status_history enable row level security;
alter table public.case_risks enable row level security;
alter table public.case_decisions enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF cases can read" on public.cases;
create policy "TVF cases can read" on public.cases for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF cases can manage" on public.cases;
create policy "TVF cases can manage" on public.cases for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case participants can read" on public.case_participants;
create policy "TVF case participants can read" on public.case_participants for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF case participants can manage" on public.case_participants;
create policy "TVF case participants can manage" on public.case_participants for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case checklist can read" on public.case_checklist_items;
create policy "TVF case checklist can read" on public.case_checklist_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF case checklist can manage" on public.case_checklist_items;
create policy "TVF case checklist can manage" on public.case_checklist_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case history can read" on public.case_status_history;
create policy "TVF case history can read" on public.case_status_history for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case history can manage" on public.case_status_history;
create policy "TVF case history can manage" on public.case_status_history for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case risks can read" on public.case_risks;
create policy "TVF case risks can read" on public.case_risks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case risks can manage" on public.case_risks;
create policy "TVF case risks can manage" on public.case_risks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case decisions can read" on public.case_decisions;
create policy "TVF case decisions can read" on public.case_decisions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case decisions can manage" on public.case_decisions;
create policy "TVF case decisions can manage" on public.case_decisions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

comment on table public.cases is 'TVF OS - dossiers metier suivis jusqu a decision ou cloture.';
comment on table public.case_checklist_items is 'TVF OS - checklist dynamique d instruction par dossier.';
comment on table public.case_decisions is 'TVF OS - decisions humaines rattachees aux dossiers.';


-- ============================================================
-- supabase\tvf-os-work.sql
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.work_projects (
  id uuid primary key default gen_random_uuid(),
  project_key text unique,
  title text not null,
  project_type text not null default 'operation' check (project_type in ('operation','branch_launch','case','event','admin','finance','communication')),
  status text not null default 'active' check (status in ('draft','active','paused','completed','cancelled','archive')),
  priority text not null default 'P3' check (priority in ('P1','P2','P3')),
  pole text not null default 'Pilotage',
  branch_id uuid,
  owner_name text,
  summary text,
  start_at date,
  due_at date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_tasks (
  id uuid primary key default gen_random_uuid(),
  task_key text unique,
  project_id uuid references public.work_projects(id) on delete set null,
  related_object_type text not null default 'none' check (related_object_type in ('none','email','request','case','document','procedure','branch','finance','risk','governance')),
  related_object_id uuid,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','doing','waiting','done','cancelled','archive')),
  priority text not null default 'P3' check (priority in ('P1','P2','P3')),
  pole text not null default 'Pilotage',
  assigned_to text,
  branch_id uuid,
  start_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  checklist text[] not null default '{}',
  ai_summary text,
  automation_source text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_events (
  id uuid primary key default gen_random_uuid(),
  event_key text unique,
  project_id uuid references public.work_projects(id) on delete set null,
  task_id uuid references public.work_tasks(id) on delete set null,
  title text not null,
  event_type text not null default 'meeting' check (event_type in ('meeting','call','field_visit','deadline','committee','training','reminder','other')),
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','done','cancelled','archive')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  attendees text[] not null default '{}',
  organizer_name text,
  branch_id uuid,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_automation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text unique not null,
  title text not null,
  trigger_type text not null check (trigger_type in ('email_received','task_overdue','event_due','project_late','manual')),
  status text not null default 'active' check (status in ('active','paused','archive')),
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_activity_log (
  id uuid primary key default gen_random_uuid(),
  object_type text not null check (object_type in ('project','task','event','automation')),
  object_id uuid,
  action text not null,
  actor_label text not null default 'TVF OS',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.tvf_set_work_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tvf_work_projects_updated_at on public.work_projects;
create trigger tvf_work_projects_updated_at before update on public.work_projects for each row execute function public.tvf_set_work_updated_at();
drop trigger if exists tvf_work_tasks_updated_at on public.work_tasks;
create trigger tvf_work_tasks_updated_at before update on public.work_tasks for each row execute function public.tvf_set_work_updated_at();
drop trigger if exists tvf_work_events_updated_at on public.work_events;
create trigger tvf_work_events_updated_at before update on public.work_events for each row execute function public.tvf_set_work_updated_at();
drop trigger if exists tvf_work_automation_rules_updated_at on public.work_automation_rules;
create trigger tvf_work_automation_rules_updated_at before update on public.work_automation_rules for each row execute function public.tvf_set_work_updated_at();

create index if not exists work_projects_status_idx on public.work_projects(status);
create index if not exists work_projects_due_idx on public.work_projects(due_at);
create index if not exists work_tasks_status_idx on public.work_tasks(status);
create index if not exists work_tasks_due_idx on public.work_tasks(due_at);
create index if not exists work_tasks_project_idx on public.work_tasks(project_id);
create index if not exists work_events_starts_idx on public.work_events(starts_at);
create index if not exists work_events_status_idx on public.work_events(status);
create index if not exists work_automation_rules_status_idx on public.work_automation_rules(status);
create index if not exists work_activity_object_idx on public.work_activity_log(object_type, object_id);

alter table public.work_projects enable row level security;
alter table public.work_tasks enable row level security;
alter table public.work_events enable row level security;
alter table public.work_automation_rules enable row level security;
alter table public.work_activity_log enable row level security;

drop policy if exists "TVF work projects can read" on public.work_projects;
create policy "TVF work projects can read" on public.work_projects for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager','user_manager','auditor'));
drop policy if exists "TVF work projects can manage" on public.work_projects;
create policy "TVF work projects can manage" on public.work_projects for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager'));

drop policy if exists "TVF work tasks can read" on public.work_tasks;
create policy "TVF work tasks can read" on public.work_tasks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager','user_manager','auditor'));
drop policy if exists "TVF work tasks can manage" on public.work_tasks;
create policy "TVF work tasks can manage" on public.work_tasks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager'));

drop policy if exists "TVF work events can read" on public.work_events;
create policy "TVF work events can read" on public.work_events for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager','user_manager','auditor'));
drop policy if exists "TVF work events can manage" on public.work_events;
create policy "TVF work events can manage" on public.work_events for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager'));

drop policy if exists "TVF work rules can read" on public.work_automation_rules;
create policy "TVF work rules can read" on public.work_automation_rules for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager','auditor'));
drop policy if exists "TVF work rules can manage" on public.work_automation_rules;
create policy "TVF work rules can manage" on public.work_automation_rules for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','project_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','project_manager'));

drop policy if exists "TVF work activity can read" on public.work_activity_log;
create policy "TVF work activity can read" on public.work_activity_log for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager','user_manager','auditor'));
drop policy if exists "TVF work activity can manage" on public.work_activity_log;
create policy "TVF work activity can manage" on public.work_activity_log for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','project_manager'));


-- ============================================================
-- supabase\tvf-os-documents.sql
-- ============================================================

-- TVF OS - Module Gestion documentaire
-- Migration production : fichiers, documents, versions, liens, modeles, generations et journal.

create extension if not exists pgcrypto;
create sequence if not exists public.documents_number_seq;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tvf-documents',
  'tvf-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'tvf-documents',
  storage_path text not null unique,
  original_filename text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  checksum text,
  uploaded_by text,
  branch_id uuid,
  confidentiality_level text not null default 'interne',
  virus_scan_status text not null default 'pending',
  ai_summary text,
  sensitive_detected boolean not null default false,
  created_at timestamptz not null default now(),
  constraint files_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible')),
  constraint files_virus_scan_check check (virus_scan_status in ('pending','clean','suspect','blocked')),
  constraint files_size_check check (size_bytes >= 0 and size_bytes <= 10485760)
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  title text not null,
  template_type text not null default 'autre',
  status text not null default 'brouillon',
  version integer not null default 1,
  national_validated boolean not null default false,
  file_id uuid references public.files(id) on delete set null,
  required_fields text[] not null default '{}',
  description text,
  branch_id uuid,
  ai_summary text,
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(ai_summary,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_type_check check (template_type in ('courrier','email','convention','fiche','registre','budget','kit_antenne','formulaire','grille','compte_rendu','financeur','autre')),
  constraint templates_status_check check (status in ('brouillon','a_valider','officiel','remplace','archive')),
  constraint templates_version_check check (version >= 1)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_number text unique,
  title text not null,
  document_type text not null default 'piece',
  status text not null default 'a_classer',
  version integer not null default 1,
  file_id uuid references public.files(id) on delete set null,
  branch_id uuid,
  related_object_type text not null default 'none',
  related_object_id uuid,
  template_id uuid references public.templates(id) on delete set null,
  validated_by text,
  validated_at timestamptz,
  expires_at timestamptz,
  confidentiality_level text not null default 'interne',
  ai_summary text,
  classification_notes text,
  sensitive_detected boolean not null default false,
  indexed_in_knowledge boolean not null default false,
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(classification_notes,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_type_check check (document_type in ('piece','photo','convention','courrier','email','budget','compte_rendu','fiche','registre','formulaire','kit','preuve','modele_genere','autre')),
  constraint documents_status_check check (status in ('brouillon','a_classer','a_valider','valide','remplace','archive')),
  constraint documents_version_check check (version >= 1),
  constraint documents_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible')),
  constraint documents_related_type_check check (related_object_type in ('case','request','contact','organization','project','branch','template','none'))
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null,
  file_id uuid references public.files(id) on delete set null,
  change_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  unique(document_id, version),
  constraint document_versions_version_check check (version >= 1)
);

create table if not exists public.document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  related_object_type text not null,
  related_object_id uuid not null,
  relation_label text,
  created_at timestamptz not null default now(),
  unique(document_id, related_object_type, related_object_id),
  constraint document_links_related_type_check check (related_object_type in ('case','request','contact','organization','project','branch','template'))
);

create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  generated_by text,
  generated_from_object_type text not null default 'none',
  generated_from_object_id uuid,
  generation_status text not null default 'draft_created',
  validation_status text not null default 'non_soumis',
  missing_fields text[] not null default '{}',
  field_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint generated_documents_object_type_check check (generated_from_object_type in ('case','request','contact','organization','project','branch','template','none')),
  constraint generated_documents_generation_status_check check (generation_status in ('draft_created','missing_fields','submitted','validated','failed')),
  constraint generated_documents_validation_status_check check (validation_status in ('non_soumis','a_valider','valide','refuse'))
);

create table if not exists public.document_audit_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  template_id uuid references public.templates(id) on delete cascade,
  action text not null,
  details text,
  created_by text,
  created_at timestamptz not null default now()
);

-- Compatibilite : complete les tables deja creees par une ancienne tentative.
alter table if exists public.files
  add column if not exists storage_bucket text not null default 'tvf-documents',
  add column if not exists storage_path text,
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint not null default 0,
  add column if not exists checksum text,
  add column if not exists uploaded_by text,
  add column if not exists branch_id uuid,
  add column if not exists confidentiality_level text not null default 'interne',
  add column if not exists virus_scan_status text not null default 'pending',
  add column if not exists ai_summary text,
  add column if not exists sensitive_detected boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.templates
  add column if not exists template_key text,
  add column if not exists title text,
  add column if not exists template_type text not null default 'autre',
  add column if not exists status text not null default 'brouillon',
  add column if not exists version integer not null default 1,
  add column if not exists national_validated boolean not null default false,
  add column if not exists file_id uuid,
  add column if not exists required_fields text[] not null default '{}',
  add column if not exists description text,
  add column if not exists branch_id uuid,
  add column if not exists ai_summary text,
  add column if not exists search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(ai_summary,''))) stored,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.documents
  add column if not exists document_number text,
  add column if not exists title text,
  add column if not exists document_type text not null default 'piece',
  add column if not exists status text not null default 'a_classer',
  add column if not exists version integer not null default 1,
  add column if not exists file_id uuid,
  add column if not exists branch_id uuid,
  add column if not exists related_object_type text not null default 'none',
  add column if not exists related_object_id uuid,
  add column if not exists template_id uuid,
  add column if not exists validated_by text,
  add column if not exists validated_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists confidentiality_level text not null default 'interne',
  add column if not exists ai_summary text,
  add column if not exists classification_notes text,
  add column if not exists sensitive_detected boolean not null default false,
  add column if not exists indexed_in_knowledge boolean not null default false,
  add column if not exists search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(classification_notes,''))) stored,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.document_versions
  add column if not exists document_id uuid,
  add column if not exists version integer not null default 1,
  add column if not exists file_id uuid,
  add column if not exists change_summary text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.document_links
  add column if not exists document_id uuid,
  add column if not exists related_object_type text,
  add column if not exists related_object_id uuid,
  add column if not exists relation_label text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.generated_documents
  add column if not exists template_id uuid,
  add column if not exists document_id uuid,
  add column if not exists generated_by text,
  add column if not exists generated_from_object_type text not null default 'none',
  add column if not exists generated_from_object_id uuid,
  add column if not exists generation_status text not null default 'draft_created',
  add column if not exists validation_status text not null default 'non_soumis',
  add column if not exists missing_fields text[] not null default '{}',
  add column if not exists field_values jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.document_audit_logs
  add column if not exists document_id uuid,
  add column if not exists template_id uuid,
  add column if not exists action text,
  add column if not exists details text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz not null default now();
create or replace function public.tvf_detect_sensitive_document(text_value text)
returns boolean language sql immutable as $$
  select coalesce(text_value, '') ~* '(rib|iban|piece d identite|identite|cni|passeport|avis d impot|impot|salaire|medical|sante|signature|donnees personnelles|rgpd|contrat|mandat)';
$$;

create or replace function public.tvf_document_type_from_title(text_value text)
returns text language sql immutable as $$
  select case
    when coalesce(text_value, '') ~* '(photo|image|jpg|jpeg|png|webp)' then 'photo'
    when coalesce(text_value, '') ~* '(convention|partenariat|mise a disposition)' then 'convention'
    when coalesce(text_value, '') ~* '(courrier|lettre)' then 'courrier'
    when coalesce(text_value, '') ~* '(email|mail)' then 'email'
    when coalesce(text_value, '') ~* '(budget|finance|financement|devis|facture)' then 'budget'
    when coalesce(text_value, '') ~* '(compte rendu|proces verbal|reunion)' then 'compte_rendu'
    when coalesce(text_value, '') ~* '(fiche|formulaire|grille)' then 'fiche'
    when coalesce(text_value, '') ~* '(registre|suivi|tableau)' then 'registre'
    when coalesce(text_value, '') ~* '(kit|pack)' then 'kit'
    when coalesce(text_value, '') ~* '(preuve|justificatif|attestation|rib|cni|identite)' then 'preuve'
    else 'piece'
  end;
$$;

create or replace function public.set_file_metadata()
returns trigger language plpgsql as $$
begin
  new.sensitive_detected := coalesce(new.sensitive_detected, false) or public.tvf_detect_sensitive_document(coalesce(new.original_filename,'') || ' ' || coalesce(new.ai_summary,''));
  if new.sensitive_detected and new.confidentiality_level in ('public','interne') then
    new.confidentiality_level := 'sensible';
  end if;
  return new;
end;
$$;

create or replace function public.set_template_metadata()
returns trigger language plpgsql as $$
begin
  if new.template_key is null or new.template_key = '' then
    new.template_key := lower(regexp_replace(new.template_type || '-' || new.title, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  if new.status = 'officiel' then
    new.national_validated := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_document_metadata()
returns trigger language plpgsql as $$
begin
  if new.document_number is null or new.document_number = '' then
    new.document_number := 'DOC-' || to_char(coalesce(new.created_at, now()), 'YYYY') || '-' || lpad(nextval('public.documents_number_seq')::text, 4, '0');
  end if;
  if new.document_type is null or new.document_type = '' then
    new.document_type := public.tvf_document_type_from_title(new.title);
  end if;
  new.sensitive_detected := coalesce(new.sensitive_detected, false) or public.tvf_detect_sensitive_document(coalesce(new.title,'') || ' ' || coalesce(new.ai_summary,'') || ' ' || coalesce(new.classification_notes,''));
  if new.sensitive_detected and new.confidentiality_level in ('public','interne') then
    new.confidentiality_level := 'sensible';
  end if;
  if new.status = 'valide' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.status = 'valide' and new.confidentiality_level <> 'sensible' then
    new.indexed_in_knowledge := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_initial_document_version()
returns trigger language plpgsql as $$
begin
  if new.file_id is not null then
    insert into public.document_versions(document_id, version, file_id, change_summary, created_by)
    values (new.id, new.version, new.file_id, 'Version initiale', 'TVF OS')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.log_document_status_change()
returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status then
    insert into public.document_audit_logs(document_id, action, details, created_by)
    values (new.id, 'changement_statut', coalesce(old.status, 'nouveau') || ' -> ' || new.status, 'TVF OS');
  end if;
  return new;
end;
$$;

drop trigger if exists set_file_metadata on public.files;
create trigger set_file_metadata before insert or update on public.files for each row execute function public.set_file_metadata();

drop trigger if exists set_template_metadata on public.templates;
create trigger set_template_metadata before insert or update on public.templates for each row execute function public.set_template_metadata();

drop trigger if exists set_document_metadata on public.documents;
create trigger set_document_metadata before insert or update on public.documents for each row execute function public.set_document_metadata();

drop trigger if exists create_initial_document_version on public.documents;
create trigger create_initial_document_version after insert on public.documents for each row execute function public.create_initial_document_version();

drop trigger if exists log_document_status_change on public.documents;
create trigger log_document_status_change after update on public.documents for each row execute function public.log_document_status_change();

create index if not exists files_bucket_path_idx on public.files(storage_bucket, storage_path);
create index if not exists files_confidentiality_idx on public.files(confidentiality_level, virus_scan_status);
create index if not exists documents_status_idx on public.documents(status, document_type, updated_at desc);
create index if not exists documents_related_idx on public.documents(related_object_type, related_object_id);
create index if not exists documents_file_idx on public.documents(file_id);
create index if not exists documents_template_idx on public.documents(template_id);
create index if not exists documents_search_idx on public.documents using gin(search_vector);
create index if not exists document_versions_document_idx on public.document_versions(document_id, version desc);
create index if not exists document_links_object_idx on public.document_links(related_object_type, related_object_id);
create index if not exists templates_status_idx on public.templates(status, template_type, updated_at desc);
create index if not exists templates_search_idx on public.templates using gin(search_vector);
create index if not exists generated_documents_template_idx on public.generated_documents(template_id, generation_status);
create index if not exists generated_documents_object_idx on public.generated_documents(generated_from_object_type, generated_from_object_id);
create index if not exists document_audit_logs_document_idx on public.document_audit_logs(document_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'generated_documents_template_document_unique'
  ) then
    alter table public.generated_documents
      add constraint generated_documents_template_document_unique unique(template_id, document_id);
  end if;
end $$;

alter table public.files enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_links enable row level security;
alter table public.templates enable row level security;
alter table public.generated_documents enable row level security;
alter table public.document_audit_logs enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF files can read" on public.files;
create policy "TVF files can read" on public.files for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF files can manage" on public.files;
create policy "TVF files can manage" on public.files for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF documents can read" on public.documents;
create policy "TVF documents can read" on public.documents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF documents can manage" on public.documents;
create policy "TVF documents can manage" on public.documents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF document versions can read" on public.document_versions;
create policy "TVF document versions can read" on public.document_versions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','auditor'));
drop policy if exists "TVF document versions can manage" on public.document_versions;
create policy "TVF document versions can manage" on public.document_versions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF document links can read" on public.document_links;
create policy "TVF document links can read" on public.document_links for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF document links can manage" on public.document_links;
create policy "TVF document links can manage" on public.document_links for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF templates can read" on public.templates;
create policy "TVF templates can read" on public.templates for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF templates can manage" on public.templates;
create policy "TVF templates can manage" on public.templates for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','document_manager'));

drop policy if exists "TVF generated documents can read" on public.generated_documents;
create policy "TVF generated documents can read" on public.generated_documents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','auditor'));
drop policy if exists "TVF generated documents can manage" on public.generated_documents;
create policy "TVF generated documents can manage" on public.generated_documents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF document audit can read" on public.document_audit_logs;
create policy "TVF document audit can read" on public.document_audit_logs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','auditor'));
drop policy if exists "TVF document audit can manage" on public.document_audit_logs;
create policy "TVF document audit can manage" on public.document_audit_logs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF storage documents can read" on storage.objects;
create policy "TVF storage documents can read" on storage.objects for select using (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF storage documents can manage" on storage.objects;
create policy "TVF storage documents can manage" on storage.objects for all using (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

comment on table public.files is 'TVF OS - metadonnees des fichiers stockes dans Supabase Storage.';
comment on table public.documents is 'TVF OS - objets documentaires metier classes, versionnes et validables.';
comment on table public.templates is 'TVF OS - bibliotheque des modeles officiels et locaux.';
comment on table public.generated_documents is 'TVF OS - documents produits depuis un modele.';





-- ============================================================
-- supabase\tvf-os-users.sql
-- ============================================================

-- TVF OS - Module Utilisateurs, roles et permissions
-- Migration production : profils, roles, permissions, rattachements antennes et revues d'acces.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  status text not null default 'invited',
  default_branch_id uuid,
  avatar_file_id uuid,
  last_seen_at timestamptz,
  onboarding_completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_status_check check (status in ('invited','active','paused','suspended','left','archive'))
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text unique not null,
  role_name text not null,
  role_family text not null default 'operations',
  description text,
  is_sensitive boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_status_check check (status in ('active','paused','archive')),
  constraint roles_family_check check (role_family in ('national','branch','operations','support','audit','finance','communication','system'))
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text unique not null,
  permission_name text not null,
  module_key text not null,
  description text,
  risk_level text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_risk_check check (risk_level in ('low','medium','high','critical')),
  constraint permissions_status_check check (status in ('active','paused','archive'))
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  branch_id uuid,
  scope text not null default 'global',
  status text not null default 'active',
  valid_from date not null default current_date,
  valid_until date,
  assigned_by text,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_scope_check check (scope in ('global','national','branch','pole','module','temporary')),
  constraint user_roles_status_check check (status in ('active','paused','expired','revoked','archive'))
);

create table if not exists public.user_branch_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  branch_id uuid not null,
  membership_status text not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary_role_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, branch_id),
  constraint user_branch_memberships_status_check check (membership_status in ('invited','active','paused','left','archive'))
);

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by text,
  invited_role_key text,
  branch_id uuid,
  status text not null default 'pending',
  expires_at timestamptz,
  accepted_at timestamptz,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_invitations_status_check check (status in ('pending','accepted','expired','cancelled','archive'))
);

create table if not exists public.access_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  reviewer_name text,
  review_status text not null default 'pending',
  risk_level text not null default 'medium',
  due_at timestamptz,
  reviewed_at timestamptz,
  findings text,
  required_actions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_reviews_status_check check (review_status in ('pending','valid','changes_required','revoked','archive')),
  constraint access_reviews_risk_check check (risk_level in ('low','medium','high','critical'))
);

-- Compatibilite : complete les tables utilisateurs deja creees par une ancienne tentative.
alter table if exists public.profiles
  add column if not exists auth_user_id uuid,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists status text not null default 'invited',
  add column if not exists default_branch_id uuid,
  add column if not exists avatar_file_id uuid,
  add column if not exists last_seen_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.roles
  add column if not exists role_key text,
  add column if not exists role_name text,
  add column if not exists role_family text not null default 'operations',
  add column if not exists description text,
  add column if not exists is_sensitive boolean not null default false,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.permissions
  add column if not exists permission_key text,
  add column if not exists permission_name text,
  add column if not exists module_key text,
  add column if not exists description text,
  add column if not exists risk_level text not null default 'medium',
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.role_permissions
  add column if not exists role_id uuid,
  add column if not exists permission_id uuid,
  add column if not exists granted boolean not null default true,
  add column if not exists conditions jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.user_roles
  add column if not exists profile_id uuid,
  add column if not exists role_id uuid,
  add column if not exists branch_id uuid,
  add column if not exists scope text not null default 'global',
  add column if not exists status text not null default 'active',
  add column if not exists valid_from date not null default current_date,
  add column if not exists valid_until date,
  add column if not exists assigned_by text,
  add column if not exists assigned_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_branch_memberships
  add column if not exists profile_id uuid,
  add column if not exists branch_id uuid,
  add column if not exists membership_status text not null default 'active',
  add column if not exists joined_at timestamptz not null default now(),
  add column if not exists left_at timestamptz,
  add column if not exists primary_role_label text,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_invitations
  add column if not exists email text,
  add column if not exists invited_by text,
  add column if not exists invited_role_key text,
  add column if not exists branch_id uuid,
  add column if not exists status text not null default 'pending',
  add column if not exists expires_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists message text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.access_reviews
  add column if not exists profile_id uuid,
  add column if not exists reviewer_name text,
  add column if not exists review_status text not null default 'pending',
  add column if not exists risk_level text not null default 'medium',
  add column if not exists due_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists findings text,
  add column if not exists required_actions text[] not null default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.tvf_set_updated_at();
drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at before update on public.roles for each row execute function public.tvf_set_updated_at();
drop trigger if exists permissions_set_updated_at on public.permissions;
create trigger permissions_set_updated_at before update on public.permissions for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at before update on public.user_roles for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_branch_memberships_set_updated_at on public.user_branch_memberships;
create trigger user_branch_memberships_set_updated_at before update on public.user_branch_memberships for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_invitations_set_updated_at on public.user_invitations;
create trigger user_invitations_set_updated_at before update on public.user_invitations for each row execute function public.tvf_set_updated_at();
drop trigger if exists access_reviews_set_updated_at on public.access_reviews;
create trigger access_reviews_set_updated_at before update on public.access_reviews for each row execute function public.tvf_set_updated_at();

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists roles_status_idx on public.roles(status, role_family);
create index if not exists permissions_module_idx on public.permissions(module_key, risk_level);
create index if not exists role_permissions_role_idx on public.role_permissions(role_id);
create index if not exists user_roles_profile_idx on public.user_roles(profile_id, status);
create index if not exists user_branch_memberships_profile_idx on public.user_branch_memberships(profile_id, membership_status);
create index if not exists user_invitations_status_idx on public.user_invitations(status, expires_at);
create index if not exists access_reviews_status_idx on public.access_reviews(review_status, due_at);

insert into public.roles (role_key, role_name, role_family, description, is_sensitive) values
  ('super_admin_national','Super administrateur national','national','Acces complet et parametres critiques.', true),
  ('admin_national','Administrateur national','national','Pilotage national TVF OS.', true),
  ('responsable_antenne','Responsable antenne','branch','Pilotage local et validation antenne.', true),
  ('referent_pole','Referent pole','operations','Pilotage d un pole ou domaine.', false),
  ('charge_dossier','Charge de dossier','operations','Gestion operationnelle des dossiers.', false),
  ('contributeur','Contributeur','operations','Contribution encadree.', false),
  ('benevole_encadre','Benevole encadre','support','Acces limite aux actions assignees.', false),
  ('lecteur_interne','Lecteur interne','support','Consultation interne limitee.', false),
  ('auditeur','Auditeur','audit','Lecture traces, decisions et conformite.', true),
  ('comptabilite','Comptabilite','finance','Gestion finances et justificatifs.', true),
  ('communication','Communication','communication','Communication, contenus et publications.', false)
on conflict (role_key) do update set role_name = excluded.role_name, description = excluded.description, is_sensitive = excluded.is_sensitive, status = 'active';

insert into public.permissions (permission_key, permission_name, module_key, description, risk_level) values
  ('read_dashboard','Lire dashboard','dashboard','Acceder au tableau de bord.', 'low'),
  ('read_demands','Lire demandes','demandes','Consulter les demandes entrantes.', 'medium'),
  ('update_demands','Modifier demandes','demandes','Qualifier et modifier les demandes.', 'medium'),
  ('assign_demands','Assigner demandes','demandes','Assigner demandes a un responsable.', 'medium'),
  ('manage_cases','Gerer dossiers','dossiers','Creer et suivre les dossiers.', 'medium'),
  ('validate_documents','Valider documents','documents','Valider les documents sensibles.', 'high'),
  ('manage_branch','Gerer antennes','branches','Creer et piloter les antennes.', 'high'),
  ('manage_finance','Gerer finances','finances','Gerer budgets, depenses et financeurs.', 'critical'),
  ('manage_governance','Gerer gouvernance','governance','Tracer decisions et delegations.', 'high'),
  ('manage_risks','Gerer risques','risks','Gerer risques, conformite et incidents.', 'critical'),
  ('export_personal_data','Exporter donnees personnelles','system','Exporter des donnees personnelles.', 'critical'),
  ('manage_users','Gerer utilisateurs','users','Inviter, rattacher et modifier les roles.', 'critical'),
  ('manage_ai_settings','Gerer IA','ai','Configurer usages IA sensibles.', 'critical')
on conflict (permission_key) do update set permission_name = excluded.permission_name, module_key = excluded.module_key, risk_level = excluded.risk_level, status = 'active';

insert into public.role_permissions (role_id, permission_id, granted)
select r.id, p.id, true
from public.roles r
join public.permissions p on (
  r.role_key = 'super_admin_national'
  or (r.role_key = 'admin_national' and p.permission_key <> 'manage_ai_settings')
  or (r.role_key = 'responsable_antenne' and p.permission_key in ('read_dashboard','read_demands','update_demands','assign_demands','manage_cases','manage_branch','manage_governance','manage_risks'))
  or (r.role_key = 'charge_dossier' and p.permission_key in ('read_dashboard','read_demands','update_demands','manage_cases'))
  or (r.role_key = 'auditeur' and p.permission_key in ('read_dashboard','read_demands','manage_governance','manage_risks'))
  or (r.role_key = 'comptabilite' and p.permission_key in ('read_dashboard','manage_finance','validate_documents'))
  or (r.role_key = 'communication' and p.permission_key in ('read_dashboard','validate_documents'))
  or (r.role_key in ('referent_pole','contributeur') and p.permission_key in ('read_dashboard','read_demands','update_demands','manage_cases'))
  or (r.role_key in ('benevole_encadre','lecteur_interne') and p.permission_key in ('read_dashboard'))
)
on conflict (role_id, permission_id) do update set granted = excluded.granted;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_branch_memberships enable row level security;
alter table public.user_invitations enable row level security;
alter table public.access_reviews enable row level security;

drop policy if exists "TVF users profiles can read" on public.profiles;
create policy "TVF users profiles can read" on public.profiles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users profiles can manage" on public.profiles;
create policy "TVF users profiles can manage" on public.profiles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users roles can read" on public.roles;
create policy "TVF users roles can read" on public.roles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users roles can manage" on public.roles;
create policy "TVF users roles can manage" on public.roles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users permissions can read" on public.permissions;
create policy "TVF users permissions can read" on public.permissions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users permissions can manage" on public.permissions;
create policy "TVF users permissions can manage" on public.permissions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users role permissions can read" on public.role_permissions;
create policy "TVF users role permissions can read" on public.role_permissions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users role permissions can manage" on public.role_permissions;
create policy "TVF users role permissions can manage" on public.role_permissions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users assignments can read" on public.user_roles;
create policy "TVF users assignments can read" on public.user_roles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users assignments can manage" on public.user_roles;
create policy "TVF users assignments can manage" on public.user_roles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users memberships can read" on public.user_branch_memberships;
create policy "TVF users memberships can read" on public.user_branch_memberships for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users memberships can manage" on public.user_branch_memberships;
create policy "TVF users memberships can manage" on public.user_branch_memberships for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager'));

drop policy if exists "TVF users invitations can read" on public.user_invitations;
create policy "TVF users invitations can read" on public.user_invitations for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users invitations can manage" on public.user_invitations;
create policy "TVF users invitations can manage" on public.user_invitations for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager'));

drop policy if exists "TVF users access reviews can read" on public.access_reviews;
create policy "TVF users access reviews can read" on public.access_reviews for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','auditor'));
drop policy if exists "TVF users access reviews can manage" on public.access_reviews;
create policy "TVF users access reviews can manage" on public.access_reviews for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));



-- ============================================================
-- supabase\tvf-os-mvp-verification.sql
-- ============================================================

-- TVF OS - Verification globale socle MVP
-- Usage : coller ce fichier dans Supabase SQL Editor apres execution des migrations prioritaires.
-- Ce script ne modifie aucune donnee. Il verifie les tables, RLS, policies, indexes, fonctions et buckets essentiels.

-- 1. Tables essentielles attendues
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'),
    ('Demandes entrantes', 'request_activity_log'),
    ('Demandes entrantes', 'request_ai_suggestions'),
    ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'),
    ('CRM', 'organizations'),
    ('CRM', 'organization_contacts'),
    ('CRM', 'relationship_history'),
    ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'),
    ('Dossiers', 'case_participants'),
    ('Dossiers', 'case_checklist_items'),
    ('Dossiers', 'case_status_history'),
    ('Dossiers', 'case_risks'),
    ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'),
    ('Taches agenda', 'work_tasks'),
    ('Taches agenda', 'work_events'),
    ('Taches agenda', 'work_automation_rules'),
    ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'),
    ('Documents', 'documents'),
    ('Documents', 'document_versions'),
    ('Documents', 'document_links'),
    ('Documents', 'templates'),
    ('Documents', 'generated_documents'),
    ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'),
    ('Utilisateurs', 'roles'),
    ('Utilisateurs', 'permissions'),
    ('Utilisateurs', 'role_permissions'),
    ('Utilisateurs', 'user_roles'),
    ('Utilisateurs', 'user_branch_memberships'),
    ('Utilisateurs', 'user_invitations'),
    ('Utilisateurs', 'access_reviews')
), found_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.module_name,
  e.table_name,
  case when f.table_name is null then 'missing' else 'ok' end as status
from expected_tables e
left join found_tables f on f.table_name = e.table_name
order by e.module_name, e.table_name;

-- 2. Synthese par module : tables presentes
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
), found_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.module_name,
  count(*) as expected_tables,
  count(f.table_name) as found_tables,
  case when count(*) = count(f.table_name) then 'ok' else 'missing' end as status
from expected_tables e
left join found_tables f on f.table_name = e.table_name
group by e.module_name
order by e.module_name;

-- 3. RLS activee sur les tables essentielles presentes
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
)
select
  e.module_name,
  e.table_name,
  coalesce(c.relrowsecurity, false) as rls_enabled
from expected_tables e
left join pg_class c on c.relname = e.table_name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by e.module_name, e.table_name;

-- 4. Policies RLS par module
with module_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
)
select
  mt.module_name,
  mt.table_name,
  count(p.policyname) as policies
from module_tables mt
left join pg_policies p on p.schemaname = 'public' and p.tablename = mt.table_name
group by mt.module_name, mt.table_name
order by mt.module_name, mt.table_name;

-- 5. Bucket documentaire prioritaire
select
  'Documents' as module_name,
  'storage bucket tvf-documents' as check_name,
  case when exists (select 1 from storage.buckets where id = 'tvf-documents' and public = false) then 'ok' else 'missing' end as status;

-- 6. Fonctions critiques attendues
with expected_functions(module_name, function_name) as (
  values
    ('Dossiers', 'tvf_case_type_pole'),
    ('Dossiers', 'tvf_case_maturity'),
    ('Dossiers', 'set_case_metadata'),
    ('Dossiers', 'create_default_case_checklist'),
    ('Dossiers', 'update_case_maturity_from_checklist'),
    ('Documents', 'tvf_detect_sensitive_document'),
    ('Documents', 'tvf_document_type_from_title'),
    ('Documents', 'set_file_metadata'),
    ('Documents', 'set_template_metadata'),
    ('Documents', 'set_document_metadata'),
    ('Documents', 'create_initial_document_version'),
    ('Documents', 'log_document_status_change')
)
select
  e.module_name,
  e.function_name,
  case when p.proname is null then 'missing' else 'ok' end as status
from expected_functions e
left join pg_proc p on p.proname = e.function_name
left join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
order by e.module_name, e.function_name;

