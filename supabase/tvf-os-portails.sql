-- TVF OS - Portails externes securises
-- A executer apres les scripts socle TVF OS deja en place.
-- Objectif : preparer les acces proprietaires, collectivites, entreprises,
-- prestataires et terrain sans ouvrir les donnees internes.

create extension if not exists pgcrypto;

create table if not exists public.portal_accesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  display_name text,
  access_type text not null check (access_type in (
    'owner',
    'collectivity',
    'company',
    'contractor',
    'field_agent'
  )),
  status text not null default 'invited' check (status in (
    'invited',
    'active',
    'suspended',
    'revoked',
    'expired'
  )),
  contact_id uuid,
  organization_id uuid,
  property_id uuid,
  case_id uuid,
  territory_code text,
  scope jsonb not null default '{}'::jsonb,
  invited_by text,
  invited_at timestamptz not null default now(),
  last_login_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_threads (
  id uuid primary key default gen_random_uuid(),
  portal_access_id uuid not null references public.portal_accesses(id) on delete cascade,
  case_id uuid,
  contact_id uuid,
  subject text not null,
  status text not null default 'open' check (status in (
    'open',
    'waiting_tvf',
    'waiting_external',
    'closed',
    'archived'
  )),
  created_by_type text not null default 'tvf' check (created_by_type in ('tvf', 'external', 'system')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.portal_threads(id) on delete cascade,
  portal_access_id uuid not null references public.portal_accesses(id) on delete cascade,
  direction text not null check (direction in (
    'tvf_to_external',
    'external_to_tvf',
    'internal_note'
  )),
  author_name text,
  author_email text,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'sent' check (status in (
    'draft',
    'sent',
    'read',
    'archived'
  )),
  created_at timestamptz not null default now()
);

create table if not exists public.portal_document_requests (
  id uuid primary key default gen_random_uuid(),
  portal_access_id uuid not null references public.portal_accesses(id) on delete cascade,
  case_id uuid,
  property_id uuid,
  document_id uuid,
  requested_by text,
  document_type text not null,
  title text not null,
  instructions text,
  status text not null default 'requested' check (status in (
    'requested',
    'submitted',
    'accepted',
    'rejected',
    'expired',
    'cancelled'
  )),
  due_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_appointments (
  id uuid primary key default gen_random_uuid(),
  portal_access_id uuid not null references public.portal_accesses(id) on delete cascade,
  case_id uuid,
  property_id uuid,
  title text not null,
  appointment_type text not null default 'meeting' check (appointment_type in (
    'call',
    'meeting',
    'visit',
    'video'
  )),
  status text not null default 'proposed' check (status in (
    'proposed',
    'confirmed',
    'completed',
    'cancelled',
    'missed'
  )),
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_activity_log (
  id uuid primary key default gen_random_uuid(),
  portal_access_id uuid references public.portal_accesses(id) on delete set null,
  object_type text not null,
  object_id uuid,
  action text not null,
  actor_type text not null default 'system' check (actor_type in ('tvf', 'external', 'system')),
  actor_label text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.tvf_set_portal_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_portal_accesses_updated_at on public.portal_accesses;
create trigger trg_portal_accesses_updated_at
before update on public.portal_accesses
for each row execute function public.tvf_set_portal_updated_at();

drop trigger if exists trg_portal_threads_updated_at on public.portal_threads;
create trigger trg_portal_threads_updated_at
before update on public.portal_threads
for each row execute function public.tvf_set_portal_updated_at();

drop trigger if exists trg_portal_document_requests_updated_at on public.portal_document_requests;
create trigger trg_portal_document_requests_updated_at
before update on public.portal_document_requests
for each row execute function public.tvf_set_portal_updated_at();

drop trigger if exists trg_portal_appointments_updated_at on public.portal_appointments;
create trigger trg_portal_appointments_updated_at
before update on public.portal_appointments
for each row execute function public.tvf_set_portal_updated_at();

create index if not exists idx_portal_accesses_user_id on public.portal_accesses(user_id);
create index if not exists idx_portal_accesses_email on public.portal_accesses(lower(email));
create index if not exists idx_portal_accesses_case_id on public.portal_accesses(case_id);
create index if not exists idx_portal_accesses_territory_code on public.portal_accesses(territory_code);
create index if not exists idx_portal_threads_access on public.portal_threads(portal_access_id);
create index if not exists idx_portal_messages_thread on public.portal_messages(thread_id, created_at desc);
create index if not exists idx_portal_document_requests_access on public.portal_document_requests(portal_access_id, status);
create index if not exists idx_portal_appointments_access on public.portal_appointments(portal_access_id, starts_at);
create index if not exists idx_portal_activity_access on public.portal_activity_log(portal_access_id, created_at desc);

alter table public.portal_accesses enable row level security;
alter table public.portal_threads enable row level security;
alter table public.portal_messages enable row level security;
alter table public.portal_document_requests enable row level security;
alter table public.portal_appointments enable row level security;
alter table public.portal_activity_log enable row level security;

drop policy if exists portal_accesses_internal_manage on public.portal_accesses;
create policy portal_accesses_internal_manage
on public.portal_accesses
for all
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'))
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_accesses_external_read_own on public.portal_accesses;
create policy portal_accesses_external_read_own
on public.portal_accesses
for select
using (user_id = auth.uid() and status = 'active');

drop policy if exists portal_threads_internal_manage on public.portal_threads;
create policy portal_threads_internal_manage
on public.portal_threads
for all
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'))
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_threads_external_read_own on public.portal_threads;
create policy portal_threads_external_read_own
on public.portal_threads
for select
using (
  exists (
    select 1
    from public.portal_accesses pa
    where pa.id = portal_threads.portal_access_id
      and pa.user_id = auth.uid()
      and pa.status = 'active'
  )
);

drop policy if exists portal_messages_internal_manage on public.portal_messages;
create policy portal_messages_internal_manage
on public.portal_messages
for all
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'))
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_messages_external_read_own on public.portal_messages;
create policy portal_messages_external_read_own
on public.portal_messages
for select
using (
  exists (
    select 1
    from public.portal_accesses pa
    where pa.id = portal_messages.portal_access_id
      and pa.user_id = auth.uid()
      and pa.status = 'active'
  )
);

drop policy if exists portal_messages_external_insert_own on public.portal_messages;
create policy portal_messages_external_insert_own
on public.portal_messages
for insert
with check (
  direction = 'external_to_tvf'
  and exists (
    select 1
    from public.portal_accesses pa
    where pa.id = portal_messages.portal_access_id
      and pa.user_id = auth.uid()
      and pa.status = 'active'
  )
);

drop policy if exists portal_document_requests_internal_manage on public.portal_document_requests;
create policy portal_document_requests_internal_manage
on public.portal_document_requests
for all
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'))
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_document_requests_external_read_own on public.portal_document_requests;
create policy portal_document_requests_external_read_own
on public.portal_document_requests
for select
using (
  exists (
    select 1
    from public.portal_accesses pa
    where pa.id = portal_document_requests.portal_access_id
      and pa.user_id = auth.uid()
      and pa.status = 'active'
  )
);

drop policy if exists portal_appointments_internal_manage on public.portal_appointments;
create policy portal_appointments_internal_manage
on public.portal_appointments
for all
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'))
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_appointments_external_read_own on public.portal_appointments;
create policy portal_appointments_external_read_own
on public.portal_appointments
for select
using (
  exists (
    select 1
    from public.portal_accesses pa
    where pa.id = portal_appointments.portal_access_id
      and pa.user_id = auth.uid()
      and pa.status = 'active'
  )
);

drop policy if exists portal_activity_log_internal_read on public.portal_activity_log;
create policy portal_activity_log_internal_read
on public.portal_activity_log
for select
using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

drop policy if exists portal_activity_log_internal_insert on public.portal_activity_log;
create policy portal_activity_log_internal_insert
on public.portal_activity_log
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('admin', 'direction', 'responsable', 'mission', 'accueil'));

comment on table public.portal_accesses is 'Acces limites aux portails externes TVF OS.';
comment on table public.portal_document_requests is 'Demandes de pieces visibles depuis les portails externes.';
comment on table public.portal_messages is 'Messages rattaches aux acces externes et conserves dans TVF OS.';
comment on table public.portal_appointments is 'Rendez-vous proposes ou confirmes dans les portails externes.';
