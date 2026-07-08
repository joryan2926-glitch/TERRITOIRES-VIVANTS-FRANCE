-- TVF OS - Module Gouvernance et decisions
-- Migration production : decisions, comites, ordres du jour, validations, delegations et actions issues.

create extension if not exists pgcrypto;

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  decision_number text unique not null,
  branch_id uuid,
  decision_type text not null default 'operational',
  title text not null,
  summary text,
  status text not null default 'draft',
  priority_level text not null default 'moyen',
  decided_by text,
  decided_at timestamptz,
  validation_required boolean not null default true,
  related_object_type text not null default 'none',
  related_object_id uuid,
  committee_id uuid,
  minutes_document_id uuid,
  source_document_ids text[] not null default '{}',
  tags text[] not null default '{}',
  ai_summary text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decisions_type_check check (decision_type in ('strategic','operational','financial','legal','branch','partnership','risk','hr','other')),
  constraint decisions_status_check check (status in ('draft','to_validate','validated','rejected','executing','done','archive')),
  constraint decisions_priority_check check (priority_level in ('faible','moyen','fort','critique')),
  constraint decisions_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','risk'))
);

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  committee_key text unique,
  title text not null,
  committee_type text not null default 'governance',
  status text not null default 'scheduled',
  scheduled_at timestamptz,
  location_label text,
  facilitator_name text,
  attendees text[] not null default '{}',
  agenda_summary text,
  minutes_status text not null default 'not_started',
  minutes_document_id uuid,
  ai_summary text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint committees_type_check check (committee_type in ('national','branch','governance','finance','impact','risk','project','other')),
  constraint committees_status_check check (status in ('scheduled','in_progress','closed','cancelled','archive')),
  constraint committees_minutes_status_check check (minutes_status in ('not_started','draft','to_validate','validated','published','archive'))
);

alter table public.decisions drop constraint if exists decisions_committee_fk;
alter table public.decisions add constraint decisions_committee_fk foreign key (committee_id) references public.committees(id) on delete set null;

create table if not exists public.committee_items (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  decision_id uuid references public.decisions(id) on delete set null,
  item_order integer not null default 1,
  item_type text not null default 'discussion',
  title text not null,
  summary text,
  presenter_name text,
  status text not null default 'open',
  expected_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint committee_items_type_check check (item_type in ('information','discussion','decision','validation','action','risk','other')),
  constraint committee_items_status_check check (status in ('open','ready','decided','deferred','cancelled','archive'))
);

create table if not exists public.decision_votes (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  voter_name text not null,
  voter_role text,
  vote_value text not null default 'approve',
  comment text,
  voted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint decision_votes_value_check check (vote_value in ('approve','reject','abstain','needs_changes'))
);

create table if not exists public.delegations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  delegation_key text unique,
  delegated_to text not null,
  delegated_by text,
  scope text not null,
  status text not null default 'active',
  starts_at date,
  ends_at date,
  decision_id uuid references public.decisions(id) on delete set null,
  limits text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delegations_status_check check (status in ('draft','active','paused','expired','revoked','archive'))
);

create table if not exists public.decision_actions (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references public.decisions(id) on delete cascade,
  committee_id uuid references public.committees(id) on delete set null,
  branch_id uuid,
  action_title text not null,
  owner_name text,
  status text not null default 'todo',
  priority_level text not null default 'moyen',
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decision_actions_status_check check (status in ('todo','in_progress','blocked','done','cancelled','archive')),
  constraint decision_actions_priority_check check (priority_level in ('faible','moyen','fort','critique'))
);

create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists decisions_set_updated_at on public.decisions;
create trigger decisions_set_updated_at before update on public.decisions for each row execute function public.tvf_set_updated_at();
drop trigger if exists committees_set_updated_at on public.committees;
create trigger committees_set_updated_at before update on public.committees for each row execute function public.tvf_set_updated_at();
drop trigger if exists committee_items_set_updated_at on public.committee_items;
create trigger committee_items_set_updated_at before update on public.committee_items for each row execute function public.tvf_set_updated_at();
drop trigger if exists delegations_set_updated_at on public.delegations;
create trigger delegations_set_updated_at before update on public.delegations for each row execute function public.tvf_set_updated_at();
drop trigger if exists decision_actions_set_updated_at on public.decision_actions;
create trigger decision_actions_set_updated_at before update on public.decision_actions for each row execute function public.tvf_set_updated_at();

create index if not exists decisions_status_idx on public.decisions(status);
create index if not exists decisions_branch_idx on public.decisions(branch_id);
create index if not exists committees_status_idx on public.committees(status, scheduled_at);
create index if not exists committee_items_committee_idx on public.committee_items(committee_id, item_order);
create index if not exists decision_votes_decision_idx on public.decision_votes(decision_id);
create index if not exists delegations_branch_idx on public.delegations(branch_id, status);
create index if not exists decision_actions_status_idx on public.decision_actions(status, due_at);

alter table public.decisions enable row level security;
alter table public.committees enable row level security;
alter table public.committee_items enable row level security;
alter table public.decision_votes enable row level security;
alter table public.delegations enable row level security;
alter table public.decision_actions enable row level security;

drop policy if exists "TVF governance decisions can read" on public.decisions;
create policy "TVF governance decisions can read" on public.decisions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance decisions can manage" on public.decisions;
create policy "TVF governance decisions can manage" on public.decisions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager'));

drop policy if exists "TVF governance committees can read" on public.committees;
create policy "TVF governance committees can read" on public.committees for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance committees can manage" on public.committees;
create policy "TVF governance committees can manage" on public.committees for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager'));

drop policy if exists "TVF governance items can read" on public.committee_items;
create policy "TVF governance items can read" on public.committee_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance items can manage" on public.committee_items;
create policy "TVF governance items can manage" on public.committee_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager'));

drop policy if exists "TVF governance votes can read" on public.decision_votes;
create policy "TVF governance votes can read" on public.decision_votes for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance votes can manage" on public.decision_votes;
create policy "TVF governance votes can manage" on public.decision_votes for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager'));

drop policy if exists "TVF governance delegations can read" on public.delegations;
create policy "TVF governance delegations can read" on public.delegations for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance delegations can manage" on public.delegations;
create policy "TVF governance delegations can manage" on public.delegations for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','governance_manager'));

drop policy if exists "TVF governance actions can read" on public.decision_actions;
create policy "TVF governance actions can read" on public.decision_actions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager','auditor'));
drop policy if exists "TVF governance actions can manage" on public.decision_actions;
create policy "TVF governance actions can manage" on public.decision_actions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','governance_manager'));
