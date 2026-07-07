-- TVF OS - Module Demandes entrantes
-- Migration production : structure metier, RLS, historique, IA et pieces.
-- A executer apres la migration contacts operationnelle et avant de publier le module.

create extension if not exists pgcrypto;

create sequence if not exists public.contacts_request_number_seq;

alter table if exists public.contacts
  add column if not exists request_number text,
  add column if not exists channel text not null default 'site_web',
  add column if not exists form_code text,
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
