create extension if not exists pgcrypto;

create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  external_message_id text unique,
  thread_key text,
  provider text not null default 'manual',
  direction text not null default 'inbound' check (direction in ('inbound','outbound')),
  from_email text not null,
  from_name text,
  to_email text,
  cc_emails text[] not null default '{}',
  subject text not null,
  body_text text not null default '',
  body_html text,
  received_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','analyzed','to_reply','waiting_info','converted','closed','archive')),
  priority text not null default 'P3' check (priority in ('P1','P2','P3')),
  category text not null default 'general' check (category in ('general','owner','materials','local_authority','company','volunteer','finance','press','risk')),
  pole text not null default 'Accueil & orientation',
  assigned_to text,
  contact_id uuid,
  case_id uuid,
  ai_summary text,
  ai_confidence numeric(4,3) not null default 0.600,
  missing_pieces text[] not null default '{}',
  draft_response text,
  next_action text,
  next_action_due_at timestamptz,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_attachments (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages(id) on delete cascade,
  file_name text not null,
  mime_type text,
  file_size integer,
  storage_path text,
  ai_summary text,
  status text not null default 'received' check (status in ('received','indexed','blocked','archive')),
  created_at timestamptz not null default now()
);

create table if not exists public.email_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages(id) on delete cascade,
  suggestion_type text not null check (suggestion_type in ('triage','draft_response','missing_pieces','task','conversion','risk')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric(4,3) not null default 0.600,
  status text not null default 'proposed' check (status in ('proposed','accepted','modified','rejected','applied','archive')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_tasks (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages(id) on delete cascade,
  title text not null,
  description text,
  assigned_to text,
  status text not null default 'todo' check (status in ('todo','doing','waiting','done','cancelled','archive')),
  priority text not null default 'P3' check (priority in ('P1','P2','P3')),
  due_at timestamptz,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_workflow_events (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages(id) on delete cascade,
  event_type text not null check (event_type in ('received','analyzed','assigned','reply_drafted','task_created','converted','closed','note')),
  event_label text not null,
  actor_label text not null default 'TVF OS',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.tvf_set_email_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tvf_email_messages_updated_at on public.email_messages;
create trigger tvf_email_messages_updated_at before update on public.email_messages for each row execute function public.tvf_set_email_updated_at();
drop trigger if exists tvf_email_ai_suggestions_updated_at on public.email_ai_suggestions;
create trigger tvf_email_ai_suggestions_updated_at before update on public.email_ai_suggestions for each row execute function public.tvf_set_email_updated_at();
drop trigger if exists tvf_email_tasks_updated_at on public.email_tasks;
create trigger tvf_email_tasks_updated_at before update on public.email_tasks for each row execute function public.tvf_set_email_updated_at();

create index if not exists email_messages_status_idx on public.email_messages(status);
create index if not exists email_messages_priority_idx on public.email_messages(priority);
create index if not exists email_messages_received_idx on public.email_messages(received_at desc);
create index if not exists email_messages_thread_idx on public.email_messages(thread_key);
create index if not exists email_attachments_message_idx on public.email_attachments(email_message_id);
create index if not exists email_ai_suggestions_message_idx on public.email_ai_suggestions(email_message_id);
create index if not exists email_tasks_message_idx on public.email_tasks(email_message_id);
create index if not exists email_tasks_status_idx on public.email_tasks(status);
create index if not exists email_workflow_events_message_idx on public.email_workflow_events(email_message_id);

alter table public.email_messages enable row level security;
alter table public.email_attachments enable row level security;
alter table public.email_ai_suggestions enable row level security;
alter table public.email_tasks enable row level security;
alter table public.email_workflow_events enable row level security;

drop policy if exists "TVF email messages can read" on public.email_messages;
create policy "TVF email messages can read" on public.email_messages for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager','user_manager','auditor'));
drop policy if exists "TVF email messages can manage" on public.email_messages;
create policy "TVF email messages can manage" on public.email_messages for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager'));

drop policy if exists "TVF email attachments can read" on public.email_attachments;
create policy "TVF email attachments can read" on public.email_attachments for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager','user_manager','auditor'));
drop policy if exists "TVF email attachments can manage" on public.email_attachments;
create policy "TVF email attachments can manage" on public.email_attachments for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager'));

drop policy if exists "TVF email suggestions can read" on public.email_ai_suggestions;
create policy "TVF email suggestions can read" on public.email_ai_suggestions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager','user_manager','auditor'));
drop policy if exists "TVF email suggestions can manage" on public.email_ai_suggestions;
create policy "TVF email suggestions can manage" on public.email_ai_suggestions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager'));

drop policy if exists "TVF email tasks can read" on public.email_tasks;
create policy "TVF email tasks can read" on public.email_tasks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager','user_manager','auditor'));
drop policy if exists "TVF email tasks can manage" on public.email_tasks;
create policy "TVF email tasks can manage" on public.email_tasks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager'));

drop policy if exists "TVF email events can read" on public.email_workflow_events;
create policy "TVF email events can read" on public.email_workflow_events for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager','user_manager','auditor'));
drop policy if exists "TVF email events can manage" on public.email_workflow_events;
create policy "TVF email events can manage" on public.email_workflow_events for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','email_manager'));
