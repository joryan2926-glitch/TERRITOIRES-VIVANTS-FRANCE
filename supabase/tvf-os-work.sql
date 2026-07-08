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
