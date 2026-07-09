-- TVF OS - Journal d'audit transversal
-- Version compatible sans fonction current_user_has_permission.
-- A executer dans Supabase SQL Editor pour activer la table dediee audit_logs.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  module_key text not null default 'tvf_os',
  object_type text not null default 'tvf_os',
  object_id uuid,
  action text not null,
  summary text,
  performed_by text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_module_created_idx
  on public.audit_logs (module_key, created_at desc);

create index if not exists audit_logs_object_idx
  on public.audit_logs (object_type, object_id);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_service_role" on public.audit_logs;
create policy "audit_logs_select_service_role"
  on public.audit_logs
  for select
  using (auth.role() = 'service_role');

drop policy if exists "audit_logs_insert_service_role" on public.audit_logs;
create policy "audit_logs_insert_service_role"
  on public.audit_logs
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists "audit_logs_update_service_role" on public.audit_logs;
create policy "audit_logs_update_service_role"
  on public.audit_logs
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "audit_logs_delete_service_role" on public.audit_logs;
create policy "audit_logs_delete_service_role"
  on public.audit_logs
  for delete
  using (auth.role() = 'service_role');
