-- TVF OS - Journal d'audit transversal
-- A executer dans Supabase SQL Editor lorsque vous souhaitez activer la table dediee.

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

create index if not exists audit_logs_module_created_idx on public.audit_logs (module_key, created_at desc);
create index if not exists audit_logs_object_idx on public.audit_logs (object_type, object_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (
    public.current_user_has_permission('settings.read')
    or public.current_user_has_permission('users.manage')
    or public.current_user_has_permission('governance.manage')
  );

drop policy if exists "audit_logs_insert_service" on public.audit_logs;
create policy "audit_logs_insert_service"
  on public.audit_logs for insert
  with check (
    public.current_user_has_permission('settings.manage')
    or public.current_user_has_permission('users.manage')
    or auth.role() = 'service_role'
  );
