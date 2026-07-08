-- TVF OS - Module Gestion des antennes
-- Migration production : antennes, poles actifs, checklist, equipes et formation.

create extension if not exists pgcrypto;

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  territory_name text not null,
  territory_type text not null default 'city',
  city text,
  department text,
  region text,
  status text not null default 'prefiguration',
  maturity_level text not null default 'idee',
  national_validation_status text not null default 'draft',
  responsible_name text,
  responsible_email text,
  responsible_phone text,
  launch_date date,
  target_launch_date date,
  legal_host text,
  workspace_url text,
  description text,
  needs text[] not null default '{}',
  risks text[] not null default '{}',
  next_actions text[] not null default '{}',
  ai_summary text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_territory_type_check check (territory_type in ('city','intermunicipality','department','region','multi_territory','national')),
  constraint branches_status_check check (status in ('prefiguration','launching','operational','paused','closed','archive')),
  constraint branches_maturity_check check (maturity_level in ('idee','prefiguration','lancement','operationnelle','confirmee','formatrice')),
  constraint branches_validation_check check (national_validation_status in ('draft','to_review','validated','rejected','suspended'))
);

create table if not exists public.poles (
  id uuid primary key default gen_random_uuid(),
  pole_key text unique not null,
  pole_name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poles_status_check check (status in ('active','paused','archive'))
);

create table if not exists public.branch_poles (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  pole_id uuid references public.poles(id) on delete set null,
  pole_key text not null,
  status text not null default 'planned',
  referent_name text,
  referent_email text,
  activated_at timestamptz,
  objectives text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_poles_unique unique (branch_id, pole_key),
  constraint branch_poles_status_check check (status in ('planned','active','paused','archive'))
);

create table if not exists public.branch_launch_checklist_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  item_key text not null,
  label text not null,
  category text not null default 'general',
  status text not null default 'todo',
  priority_level text not null default 'moyen',
  due_date date,
  completed_at timestamptz,
  completed_by text,
  evidence_document_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_checklist_unique unique (branch_id, item_key),
  constraint branch_checklist_status_check check (status in ('todo','in_progress','blocked','done','waived')),
  constraint branch_checklist_priority_check check (priority_level in ('faible','moyen','fort','critique'))
);

create table if not exists public.branch_team_members (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  full_name text not null,
  email text,
  role_label text not null default 'Membre antenne',
  pole_key text,
  status text not null default 'invited',
  availability text,
  skills text[] not null default '{}',
  onboarded_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_team_status_check check (status in ('invited','active','paused','left','archive'))
);

create table if not exists public.branch_training_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  training_key text not null,
  title text not null,
  status text not null default 'todo',
  assigned_to text,
  due_date date,
  completed_at timestamptz,
  score integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_training_unique unique (branch_id, training_key),
  constraint branch_training_status_check check (status in ('todo','in_progress','done','waived')),
  constraint branch_training_score_check check (score >= 0 and score <= 100)
);

create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists branches_set_updated_at on public.branches;
create trigger branches_set_updated_at before update on public.branches for each row execute function public.tvf_set_updated_at();
drop trigger if exists poles_set_updated_at on public.poles;
create trigger poles_set_updated_at before update on public.poles for each row execute function public.tvf_set_updated_at();
drop trigger if exists branch_poles_set_updated_at on public.branch_poles;
create trigger branch_poles_set_updated_at before update on public.branch_poles for each row execute function public.tvf_set_updated_at();
drop trigger if exists branch_launch_checklist_set_updated_at on public.branch_launch_checklist_items;
create trigger branch_launch_checklist_set_updated_at before update on public.branch_launch_checklist_items for each row execute function public.tvf_set_updated_at();
drop trigger if exists branch_team_set_updated_at on public.branch_team_members;
create trigger branch_team_set_updated_at before update on public.branch_team_members for each row execute function public.tvf_set_updated_at();
drop trigger if exists branch_training_set_updated_at on public.branch_training_items;
create trigger branch_training_set_updated_at before update on public.branch_training_items for each row execute function public.tvf_set_updated_at();

create index if not exists branches_status_idx on public.branches(status);
create index if not exists branches_maturity_idx on public.branches(maturity_level);
create index if not exists branches_territory_idx on public.branches(region, department, city);
create index if not exists branch_poles_branch_idx on public.branch_poles(branch_id);
create index if not exists branch_checklist_branch_idx on public.branch_launch_checklist_items(branch_id, status);
create index if not exists branch_team_branch_idx on public.branch_team_members(branch_id, status);
create index if not exists branch_training_branch_idx on public.branch_training_items(branch_id, status);

insert into public.poles (pole_key, pole_name, description) values
  ('habitat_vivant', 'Habitat Vivant', 'Logement, habitat vacant et transformation utile.'),
  ('commerce_vivant', 'Commerce Vivant', 'Commerces, rez-de-chaussee et activites locales.'),
  ('materiautheque_solidaire', 'Materiautheque Solidaire', 'Reemploi, collecte et redistribution de materiaux.'),
  ('friches_terrains', 'Friches & Terrains Vivants', 'Foncier vacant, friches et terrains a reactiver.'),
  ('solidarite_insertion', 'Solidarite & Insertion', 'Benevolat, insertion et actions solidaires.'),
  ('collectivites_territoires', 'Collectivites & Territoires', 'Relations publiques locales et diagnostics territoriaux.'),
  ('financement_mecenat', 'Financement & Mecenat', 'Subventions, financeurs, partenariats et mecennes.'),
  ('observatoire_donnees', 'Observatoire & Donnees', 'Veille, indicateurs et donnees territoriales.'),
  ('communication', 'Communication', 'Communication locale, presse et mobilisation.'),
  ('gouvernance_conformite', 'Gouvernance & Conformite', 'Organisation, risques, conformite et reporting.')
on conflict (pole_key) do update set pole_name = excluded.pole_name, description = excluded.description, status = 'active';

alter table public.branches enable row level security;
alter table public.poles enable row level security;
alter table public.branch_poles enable row level security;
alter table public.branch_launch_checklist_items enable row level security;
alter table public.branch_team_members enable row level security;
alter table public.branch_training_items enable row level security;

drop policy if exists "TVF branches can read" on public.branches;
create policy "TVF branches can read" on public.branches for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','auditor'));
drop policy if exists "TVF branches can manage" on public.branches;
create policy "TVF branches can manage" on public.branches for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder'));

drop policy if exists "TVF poles can read" on public.poles;
create policy "TVF poles can read" on public.poles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','case_manager','crm_manager','auditor'));
drop policy if exists "TVF poles can manage" on public.poles;
create policy "TVF poles can manage" on public.poles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF branch poles can read" on public.branch_poles;
create policy "TVF branch poles can read" on public.branch_poles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','auditor'));
drop policy if exists "TVF branch poles can manage" on public.branch_poles;
create policy "TVF branch poles can manage" on public.branch_poles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager'));

drop policy if exists "TVF branch checklist can read" on public.branch_launch_checklist_items;
create policy "TVF branch checklist can read" on public.branch_launch_checklist_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','auditor'));
drop policy if exists "TVF branch checklist can manage" on public.branch_launch_checklist_items;
create policy "TVF branch checklist can manage" on public.branch_launch_checklist_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager'));

drop policy if exists "TVF branch team can read" on public.branch_team_members;
create policy "TVF branch team can read" on public.branch_team_members for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','auditor'));
drop policy if exists "TVF branch team can manage" on public.branch_team_members;
create policy "TVF branch team can manage" on public.branch_team_members for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager'));

drop policy if exists "TVF branch training can read" on public.branch_training_items;
create policy "TVF branch training can read" on public.branch_training_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','branch_builder','auditor'));
drop policy if exists "TVF branch training can manage" on public.branch_training_items;
create policy "TVF branch training can manage" on public.branch_training_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_builder','branch_manager'));
