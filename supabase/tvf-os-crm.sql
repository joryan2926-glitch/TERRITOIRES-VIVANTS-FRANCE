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
