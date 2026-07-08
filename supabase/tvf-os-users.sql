-- TVF OS - Module Utilisateurs, roles et permissions
-- Migration production : profils, roles, permissions, rattachements antennes et revues d'acces.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  status text not null default 'invited',
  default_branch_id uuid,
  avatar_file_id uuid,
  last_seen_at timestamptz,
  onboarding_completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_status_check check (status in ('invited','active','paused','suspended','left','archive'))
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text unique not null,
  role_name text not null,
  role_family text not null default 'operations',
  description text,
  is_sensitive boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_status_check check (status in ('active','paused','archive')),
  constraint roles_family_check check (role_family in ('national','branch','operations','support','audit','finance','communication','system'))
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text unique not null,
  permission_name text not null,
  module_key text not null,
  description text,
  risk_level text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_risk_check check (risk_level in ('low','medium','high','critical')),
  constraint permissions_status_check check (status in ('active','paused','archive'))
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  branch_id uuid,
  scope text not null default 'global',
  status text not null default 'active',
  valid_from date not null default current_date,
  valid_until date,
  assigned_by text,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_scope_check check (scope in ('global','national','branch','pole','module','temporary')),
  constraint user_roles_status_check check (status in ('active','paused','expired','revoked','archive'))
);

create table if not exists public.user_branch_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  branch_id uuid not null,
  membership_status text not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary_role_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, branch_id),
  constraint user_branch_memberships_status_check check (membership_status in ('invited','active','paused','left','archive'))
);

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by text,
  invited_role_key text,
  branch_id uuid,
  status text not null default 'pending',
  expires_at timestamptz,
  accepted_at timestamptz,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_invitations_status_check check (status in ('pending','accepted','expired','cancelled','archive'))
);

create table if not exists public.access_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  reviewer_name text,
  review_status text not null default 'pending',
  risk_level text not null default 'medium',
  due_at timestamptz,
  reviewed_at timestamptz,
  findings text,
  required_actions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_reviews_status_check check (review_status in ('pending','valid','changes_required','revoked','archive')),
  constraint access_reviews_risk_check check (risk_level in ('low','medium','high','critical'))
);

create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.tvf_set_updated_at();
drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at before update on public.roles for each row execute function public.tvf_set_updated_at();
drop trigger if exists permissions_set_updated_at on public.permissions;
create trigger permissions_set_updated_at before update on public.permissions for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at before update on public.user_roles for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_branch_memberships_set_updated_at on public.user_branch_memberships;
create trigger user_branch_memberships_set_updated_at before update on public.user_branch_memberships for each row execute function public.tvf_set_updated_at();
drop trigger if exists user_invitations_set_updated_at on public.user_invitations;
create trigger user_invitations_set_updated_at before update on public.user_invitations for each row execute function public.tvf_set_updated_at();
drop trigger if exists access_reviews_set_updated_at on public.access_reviews;
create trigger access_reviews_set_updated_at before update on public.access_reviews for each row execute function public.tvf_set_updated_at();

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists roles_status_idx on public.roles(status, role_family);
create index if not exists permissions_module_idx on public.permissions(module_key, risk_level);
create index if not exists role_permissions_role_idx on public.role_permissions(role_id);
create index if not exists user_roles_profile_idx on public.user_roles(profile_id, status);
create index if not exists user_branch_memberships_profile_idx on public.user_branch_memberships(profile_id, membership_status);
create index if not exists user_invitations_status_idx on public.user_invitations(status, expires_at);
create index if not exists access_reviews_status_idx on public.access_reviews(review_status, due_at);

insert into public.roles (role_key, role_name, role_family, description, is_sensitive) values
  ('super_admin_national','Super administrateur national','national','Acces complet et parametres critiques.', true),
  ('admin_national','Administrateur national','national','Pilotage national TVF OS.', true),
  ('responsable_antenne','Responsable antenne','branch','Pilotage local et validation antenne.', true),
  ('referent_pole','Referent pole','operations','Pilotage d un pole ou domaine.', false),
  ('charge_dossier','Charge de dossier','operations','Gestion operationnelle des dossiers.', false),
  ('contributeur','Contributeur','operations','Contribution encadree.', false),
  ('benevole_encadre','Benevole encadre','support','Acces limite aux actions assignees.', false),
  ('lecteur_interne','Lecteur interne','support','Consultation interne limitee.', false),
  ('auditeur','Auditeur','audit','Lecture traces, decisions et conformite.', true),
  ('comptabilite','Comptabilite','finance','Gestion finances et justificatifs.', true),
  ('communication','Communication','communication','Communication, contenus et publications.', false)
on conflict (role_key) do update set role_name = excluded.role_name, description = excluded.description, is_sensitive = excluded.is_sensitive, status = 'active';

insert into public.permissions (permission_key, permission_name, module_key, description, risk_level) values
  ('read_dashboard','Lire dashboard','dashboard','Acceder au tableau de bord.', 'low'),
  ('read_demands','Lire demandes','demandes','Consulter les demandes entrantes.', 'medium'),
  ('update_demands','Modifier demandes','demandes','Qualifier et modifier les demandes.', 'medium'),
  ('assign_demands','Assigner demandes','demandes','Assigner demandes a un responsable.', 'medium'),
  ('manage_cases','Gerer dossiers','dossiers','Creer et suivre les dossiers.', 'medium'),
  ('validate_documents','Valider documents','documents','Valider les documents sensibles.', 'high'),
  ('manage_branch','Gerer antennes','branches','Creer et piloter les antennes.', 'high'),
  ('manage_finance','Gerer finances','finances','Gerer budgets, depenses et financeurs.', 'critical'),
  ('manage_governance','Gerer gouvernance','governance','Tracer decisions et delegations.', 'high'),
  ('manage_risks','Gerer risques','risks','Gerer risques, conformite et incidents.', 'critical'),
  ('export_personal_data','Exporter donnees personnelles','system','Exporter des donnees personnelles.', 'critical'),
  ('manage_users','Gerer utilisateurs','users','Inviter, rattacher et modifier les roles.', 'critical'),
  ('manage_ai_settings','Gerer IA','ai','Configurer usages IA sensibles.', 'critical')
on conflict (permission_key) do update set permission_name = excluded.permission_name, module_key = excluded.module_key, risk_level = excluded.risk_level, status = 'active';

insert into public.role_permissions (role_id, permission_id, granted)
select r.id, p.id, true
from public.roles r
join public.permissions p on (
  r.role_key = 'super_admin_national'
  or (r.role_key = 'admin_national' and p.permission_key <> 'manage_ai_settings')
  or (r.role_key = 'responsable_antenne' and p.permission_key in ('read_dashboard','read_demands','update_demands','assign_demands','manage_cases','manage_branch','manage_governance','manage_risks'))
  or (r.role_key = 'charge_dossier' and p.permission_key in ('read_dashboard','read_demands','update_demands','manage_cases'))
  or (r.role_key = 'auditeur' and p.permission_key in ('read_dashboard','read_demands','manage_governance','manage_risks'))
  or (r.role_key = 'comptabilite' and p.permission_key in ('read_dashboard','manage_finance','validate_documents'))
  or (r.role_key = 'communication' and p.permission_key in ('read_dashboard','validate_documents'))
  or (r.role_key in ('referent_pole','contributeur') and p.permission_key in ('read_dashboard','read_demands','update_demands','manage_cases'))
  or (r.role_key in ('benevole_encadre','lecteur_interne') and p.permission_key in ('read_dashboard'))
)
on conflict (role_id, permission_id) do update set granted = excluded.granted;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_branch_memberships enable row level security;
alter table public.user_invitations enable row level security;
alter table public.access_reviews enable row level security;

drop policy if exists "TVF users profiles can read" on public.profiles;
create policy "TVF users profiles can read" on public.profiles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users profiles can manage" on public.profiles;
create policy "TVF users profiles can manage" on public.profiles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users roles can read" on public.roles;
create policy "TVF users roles can read" on public.roles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users roles can manage" on public.roles;
create policy "TVF users roles can manage" on public.roles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users permissions can read" on public.permissions;
create policy "TVF users permissions can read" on public.permissions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users permissions can manage" on public.permissions;
create policy "TVF users permissions can manage" on public.permissions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users role permissions can read" on public.role_permissions;
create policy "TVF users role permissions can read" on public.role_permissions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users role permissions can manage" on public.role_permissions;
create policy "TVF users role permissions can manage" on public.role_permissions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users assignments can read" on public.user_roles;
create policy "TVF users assignments can read" on public.user_roles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users assignments can manage" on public.user_roles;
create policy "TVF users assignments can manage" on public.user_roles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));

drop policy if exists "TVF users memberships can read" on public.user_branch_memberships;
create policy "TVF users memberships can read" on public.user_branch_memberships for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users memberships can manage" on public.user_branch_memberships;
create policy "TVF users memberships can manage" on public.user_branch_memberships for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager'));

drop policy if exists "TVF users invitations can read" on public.user_invitations;
create policy "TVF users invitations can read" on public.user_invitations for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF users invitations can manage" on public.user_invitations;
create policy "TVF users invitations can manage" on public.user_invitations for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','branch_manager'));

drop policy if exists "TVF users access reviews can read" on public.access_reviews;
create policy "TVF users access reviews can read" on public.access_reviews for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager','auditor'));
drop policy if exists "TVF users access reviews can manage" on public.access_reviews;
create policy "TVF users access reviews can manage" on public.access_reviews for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','user_manager'));
