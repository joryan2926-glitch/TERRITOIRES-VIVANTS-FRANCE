-- Territoires Vivants France
-- TVF OS - Module Dashboard
-- Migration de reference : tables de preferences, snapshots, alertes et RLS.
-- A executer dans Supabase SQL Editor apres sauvegarde.
-- Cette migration complete la table existante public.contacts utilisee comme source MVP du dashboard.

create table if not exists public.dashboard_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  branch_id uuid,
  preference_key text not null,
  preference_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, branch_id, preference_key)
);

create table if not exists public.dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  snapshot_scope text not null default 'national',
  range_days integer not null default 30,
  metrics jsonb not null default '{}'::jsonb,
  generated_by uuid,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint dashboard_snapshots_scope_check
    check (snapshot_scope in ('national', 'antenne', 'pole', 'utilisateur'))
);

create table if not exists public.dashboard_alerts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  related_object_type text,
  related_object_id uuid,
  alert_type text not null,
  severity text not null default 'info',
  title text not null,
  body text,
  status text not null default 'open',
  assigned_to uuid,
  first_detected_at timestamptz not null default now(),
  last_detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dashboard_alerts_severity_check
    check (severity in ('info', 'warning', 'danger')),
  constraint dashboard_alerts_status_check
    check (status in ('open', 'acknowledged', 'resolved', 'ignored'))
);

create index if not exists dashboard_preferences_user_idx
  on public.dashboard_preferences(user_id);

create index if not exists dashboard_preferences_branch_idx
  on public.dashboard_preferences(branch_id);

create index if not exists dashboard_snapshots_scope_idx
  on public.dashboard_snapshots(snapshot_scope, generated_at desc);

create index if not exists dashboard_snapshots_branch_idx
  on public.dashboard_snapshots(branch_id, generated_at desc);

create index if not exists dashboard_alerts_status_idx
  on public.dashboard_alerts(status, severity, last_detected_at desc);

create index if not exists dashboard_alerts_branch_idx
  on public.dashboard_alerts(branch_id, status);

create or replace function public.set_dashboard_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_dashboard_preferences_updated_at on public.dashboard_preferences;
create trigger set_dashboard_preferences_updated_at
before update on public.dashboard_preferences
for each row
execute function public.set_dashboard_updated_at();

drop trigger if exists set_dashboard_alerts_updated_at on public.dashboard_alerts;
create trigger set_dashboard_alerts_updated_at
before update on public.dashboard_alerts
for each row
execute function public.set_dashboard_updated_at();

alter table public.dashboard_preferences enable row level security;
alter table public.dashboard_snapshots enable row level security;
alter table public.dashboard_alerts enable row level security;

-- RLS MVP :
-- Le dashboard de production actuel lit les agregats via API serveur avec service role.
-- Ces policies preparent l'acces authentifie futur sans exposer les donnees publiquement.

drop policy if exists "dashboard_preferences_owner_select" on public.dashboard_preferences;
create policy "dashboard_preferences_owner_select"
on public.dashboard_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "dashboard_preferences_owner_write" on public.dashboard_preferences;
create policy "dashboard_preferences_owner_write"
on public.dashboard_preferences
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "dashboard_snapshots_authenticated_select" on public.dashboard_snapshots;
create policy "dashboard_snapshots_authenticated_select"
on public.dashboard_snapshots
for select
to authenticated
using (true);

drop policy if exists "dashboard_alerts_authenticated_select" on public.dashboard_alerts;
create policy "dashboard_alerts_authenticated_select"
on public.dashboard_alerts
for select
to authenticated
using (true);

drop policy if exists "dashboard_alerts_authenticated_update_assigned" on public.dashboard_alerts;
create policy "dashboard_alerts_authenticated_update_assigned"
on public.dashboard_alerts
for update
to authenticated
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

comment on table public.dashboard_preferences is 'Preferences utilisateur du module Dashboard TVF OS.';
comment on table public.dashboard_snapshots is 'Snapshots historises des indicateurs Dashboard.';
comment on table public.dashboard_alerts is 'Alertes operationnelles produites par le Dashboard.';
