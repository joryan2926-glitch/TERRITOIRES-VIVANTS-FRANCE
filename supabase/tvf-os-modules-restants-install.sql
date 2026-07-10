-- TERRITOIRES VIVANTS FRANCE - TVF OS
-- INSTALLATION DES MODULES RESTANTS
-- A copier-coller integralement dans Supabase SQL Editor, puis cliquer sur Run.
-- Ordre : Parametres, Gouvernance, Finances, Risques, Impact.
-- Ce fichier ne contient aucune donnee de test.

-- ============================================================================
-- DEBUT : tvf-os-settings.sql
-- ============================================================================
-- TVF OS - Module Parametres et configuration
-- Migration production : configuration globale, integrations, modules, automatisations, sante systeme et audit.

create extension if not exists pgcrypto;

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  category text not null default 'system',
  label text not null,
  setting_type text not null default 'text',
  setting_value jsonb not null default '{}'::jsonb,
  visibility text not null default 'internal',
  status text not null default 'active',
  requires_restart boolean not null default false,
  updated_by text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint system_settings_category_check check (category in ('system','security','ai','email','finance','workspace','notifications','data','other')),
  constraint system_settings_type_check check (setting_type in ('text','number','boolean','json','select','url','email')),
  constraint system_settings_visibility_check check (visibility in ('public','internal','restricted','secret_reference')),
  constraint system_settings_status_check check (status in ('active','draft','paused','archive'))
);

create table if not exists public.integration_configs (
  id uuid primary key default gen_random_uuid(),
  provider_key text unique not null,
  provider_name text not null,
  integration_type text not null default 'api',
  environment text not null default 'production',
  status text not null default 'not_configured',
  health_status text not null default 'unknown',
  required_env_vars text[] not null default '{}',
  webhook_url text,
  last_checked_at timestamptz,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_configs_type_check check (integration_type in ('api','email','payment','workspace','ai','storage','analytics','webhook','other')),
  constraint integration_configs_environment_check check (environment in ('local','preview','production','shared')),
  constraint integration_configs_status_check check (status in ('not_configured','configured','needs_attention','disabled','archive')),
  constraint integration_configs_health_check check (health_status in ('healthy','degraded','down','unknown'))
);

-- Compatibilite avec les installations anterieures : CREATE TABLE IF NOT EXISTS
-- ne met pas a jour une contrainte deja presente.
alter table public.integration_configs
  drop constraint if exists integration_configs_type_check;

alter table public.integration_configs
  add constraint integration_configs_type_check
  check (integration_type in ('api','database','email','payment','workspace','ai','storage','analytics','webhook','other'));

create table if not exists public.module_feature_flags (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  module_name text not null,
  flag_key text not null,
  is_enabled boolean not null default true,
  rollout_scope text not null default 'all',
  status text not null default 'active',
  owner_pole text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_key, flag_key),
  constraint module_feature_flags_scope_check check (rollout_scope in ('all','national','branch','pilot','hidden')),
  constraint module_feature_flags_status_check check (status in ('active','paused','planned','archive'))
);

create table if not exists public.automation_settings (
  id uuid primary key default gen_random_uuid(),
  rule_key text unique not null,
  title text not null,
  trigger_module text not null,
  target_module text not null,
  status text not null default 'active',
  priority text not null default 'P2',
  conditions jsonb not null default '{}'::jsonb,
  action_template jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automation_settings_status_check check (status in ('active','paused','draft','archive')),
  constraint automation_settings_priority_check check (priority in ('P1','P2','P3'))
);

create table if not exists public.system_health_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text unique not null,
  check_name text not null,
  check_type text not null default 'configuration',
  status text not null default 'unknown',
  severity text not null default 'medium',
  last_checked_at timestamptz,
  details text,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint system_health_checks_type_check check (check_type in ('configuration','security','database','integration','performance','backup','other')),
  constraint system_health_checks_status_check check (status in ('healthy','warning','critical','unknown')),
  constraint system_health_checks_severity_check check (severity in ('low','medium','high','critical'))
);

create table if not exists public.settings_audit_log (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id uuid,
  action text not null,
  summary text not null,
  performed_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.tvf_set_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists system_settings_set_updated_at on public.system_settings;
create trigger system_settings_set_updated_at before update on public.system_settings for each row execute function public.tvf_set_settings_updated_at();
drop trigger if exists integration_configs_set_updated_at on public.integration_configs;
create trigger integration_configs_set_updated_at before update on public.integration_configs for each row execute function public.tvf_set_settings_updated_at();
drop trigger if exists module_feature_flags_set_updated_at on public.module_feature_flags;
create trigger module_feature_flags_set_updated_at before update on public.module_feature_flags for each row execute function public.tvf_set_settings_updated_at();
drop trigger if exists automation_settings_set_updated_at on public.automation_settings;
create trigger automation_settings_set_updated_at before update on public.automation_settings for each row execute function public.tvf_set_settings_updated_at();
drop trigger if exists system_health_checks_set_updated_at on public.system_health_checks;
create trigger system_health_checks_set_updated_at before update on public.system_health_checks for each row execute function public.tvf_set_settings_updated_at();

create index if not exists system_settings_category_idx on public.system_settings(category, status);
create index if not exists integration_configs_status_idx on public.integration_configs(status, health_status);
create index if not exists module_feature_flags_module_idx on public.module_feature_flags(module_key, status);
create index if not exists automation_settings_status_idx on public.automation_settings(status, priority);
create index if not exists system_health_checks_status_idx on public.system_health_checks(status, severity);
create index if not exists settings_audit_object_idx on public.settings_audit_log(object_type, object_id, created_at desc);

insert into public.system_settings (setting_key, category, label, setting_type, setting_value, visibility, status, requires_restart, updated_by, ai_summary) values
  ('platform_name','system','Nom plateforme','text','{"value":"TVF OS"}'::jsonb,'internal','active',false,'TVF OS','Nom de reference affiche dans le back-office.'),
  ('admin_session_policy','security','Session admin unique','json','{"cookie":"tvf_admin_session","sameSite":"Strict","storage":"sessionStorage sentinel"}'::jsonb,'restricted','active',false,'TVF OS','Le token unique ouvre tous les modules via cookie serveur signe.'),
  ('ai_assistant_mode','ai','Mode assistant IA','select','{"value":"assisted","allowed":["off","assisted","automatic"]}'::jsonb,'restricted','active',false,'TVF OS','Mode assiste par defaut pour garder une validation humaine.'),
  ('notification_channels','notifications','Canaux notifications','json','{"email":true,"in_app":true,"sms":false}'::jsonb,'internal','active',false,'TVF OS','Canaux actives pour les alertes operationnelles.')
on conflict (setting_key) do update set label = excluded.label, setting_value = excluded.setting_value, status = excluded.status, ai_summary = excluded.ai_summary;

insert into public.integration_configs (provider_key, provider_name, integration_type, environment, status, health_status, required_env_vars, notes, ai_summary) values
  ('supabase','Supabase','database','production','configured','unknown',array['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],'Base de donnees, RLS et fichiers.','Verifier la cle service role et les migrations avant chaque module.'),
  ('brevo','Brevo','email','production','not_configured','unknown',array['BREVO_API_KEY','BREVO_SENDER_EMAIL'],'E-mails transactionnels et campagnes.','Activer pour les notifications et reponses e-mail.'),
  ('openai','OpenAI','ai','production','not_configured','unknown',array['OPENAI_API_KEY'],'Assistant IA, syntheses et classement.','Activer uniquement avec garde-fous et journalisation.'),
  ('google_workspace','Google Workspace','workspace','production','not_configured','unknown',array['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET'],'Agenda, Drive, Gmail si besoin.','Connecteur a activer progressivement par antenne.'),
  ('stripe','Stripe','payment','production','not_configured','unknown',array['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'],'Paiements, dons et abonnements.','Requis avant automatisation financiere publique.')
on conflict (provider_key) do update set provider_name = excluded.provider_name, required_env_vars = excluded.required_env_vars, notes = excluded.notes, ai_summary = excluded.ai_summary;

insert into public.module_feature_flags (module_key, module_name, flag_key, is_enabled, rollout_scope, status, owner_pole, notes) values
  ('dashboard','Dashboard','production_ready',true,'all','active','Pilotage','Module verrouille apres validation.'),
  ('emails','E-mails intelligents','ai_triage',true,'national','active','Operations','Triage IA avec validation humaine.'),
  ('work','Taches et agenda','planning_core',true,'all','active','Operations','Planning operationnel transversal.'),
  ('settings','Parametres','configuration_center',true,'national','active','Systeme','Centre de controle TVF OS.')
on conflict (module_key, flag_key) do update set is_enabled = excluded.is_enabled, rollout_scope = excluded.rollout_scope, status = excluded.status, notes = excluded.notes;

insert into public.automation_settings (rule_key, title, trigger_module, target_module, status, priority, conditions, action_template, ai_summary) values
  ('email_to_task','Transformer e-mail prioritaire en tache','emails','work','active','P1','{"priority":["P1","P2"]}'::jsonb,'{"create":"work_task","assign":"pole_owner"}'::jsonb,'Cree une tache quand un e-mail necessite une action.'),
  ('case_missing_document','Relancer dossier incomplet','dossiers','documents','active','P2','{"missing_documents":true}'::jsonb,'{"notify":"owner","create_task":true}'::jsonb,'Relance les pieces manquantes et trace le suivi.'),
  ('integration_health_warning','Alerter integration degradee','settings','risks','active','P2','{"health_status":["degraded","down"]}'::jsonb,'{"create_risk":"integration"}'::jsonb,'Transforme un probleme technique en risque suivi.')
on conflict (rule_key) do update set title = excluded.title, status = excluded.status, conditions = excluded.conditions, action_template = excluded.action_template, ai_summary = excluded.ai_summary;

insert into public.system_health_checks (check_key, check_name, check_type, status, severity, details, recommendation) values
  ('rls_enabled','RLS active','security','healthy','critical','Les migrations TVF OS activent RLS par module.','Executer les scripts de verification apres chaque migration.'),
  ('admin_token','Token admin configure','security','unknown','critical','TVF_ADMIN_TOKEN doit exister en production.','Verifier les variables Vercel avant validation production.'),
  ('backups','Sauvegardes Supabase','backup','unknown','high','Les sauvegardes doivent etre surveillees cote Supabase.','Activer retention et export regulier selon criticite.')
on conflict (check_key) do update set check_name = excluded.check_name, details = excluded.details, recommendation = excluded.recommendation;

do $$
begin
  if to_regclass('public.permissions') is not null then
    insert into public.permissions (permission_key, permission_name, module_key, description, risk_level, status) values
      ('manage_settings','Gerer parametres','settings','Configurer integrations, modules, automatisations et sante systeme.', 'critical', 'active')
    on conflict (permission_key) do update set permission_name = excluded.permission_name, module_key = excluded.module_key, risk_level = excluded.risk_level, status = 'active';
  end if;
end $$;

alter table public.system_settings enable row level security;
alter table public.integration_configs enable row level security;
alter table public.module_feature_flags enable row level security;
alter table public.automation_settings enable row level security;
alter table public.system_health_checks enable row level security;
alter table public.settings_audit_log enable row level security;

drop policy if exists "TVF settings can read settings" on public.system_settings;
create policy "TVF settings can read settings" on public.system_settings for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF settings can manage settings" on public.system_settings;
create policy "TVF settings can manage settings" on public.system_settings for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF settings can read integrations" on public.integration_configs;
create policy "TVF settings can read integrations" on public.integration_configs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF settings can manage integrations" on public.integration_configs;
create policy "TVF settings can manage integrations" on public.integration_configs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF settings can read feature flags" on public.module_feature_flags;
create policy "TVF settings can read feature flags" on public.module_feature_flags for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF settings can manage feature flags" on public.module_feature_flags;
create policy "TVF settings can manage feature flags" on public.module_feature_flags for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF settings can read automations" on public.automation_settings;
create policy "TVF settings can read automations" on public.automation_settings for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF settings can manage automations" on public.automation_settings;
create policy "TVF settings can manage automations" on public.automation_settings for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF settings can read health" on public.system_health_checks;
create policy "TVF settings can read health" on public.system_health_checks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','user_manager','auditor'));
drop policy if exists "TVF settings can manage health" on public.system_health_checks;
create policy "TVF settings can manage health" on public.system_health_checks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

drop policy if exists "TVF settings can read audit" on public.settings_audit_log;
create policy "TVF settings can read audit" on public.settings_audit_log for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','auditor'));
drop policy if exists "TVF settings can manage audit" on public.settings_audit_log;
create policy "TVF settings can manage audit" on public.settings_audit_log for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin'));

-- FIN : tvf-os-settings.sql

-- ============================================================================
-- DEBUT : tvf-os-governance.sql
-- ============================================================================
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


-- FIN : tvf-os-governance.sql

-- ============================================================================
-- DEBUT : tvf-os-finances.sql
-- ============================================================================
-- TVF OS - Module Finances
-- Migration production : budgets, depenses, financeurs, paiements, Stripe et reporting.

create extension if not exists pgcrypto;

create table if not exists public.funders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  contact_id uuid,
  funder_name text not null,
  funder_type text not null default 'other',
  status text not null default 'prospect',
  priority_level text not null default 'moyen',
  territory_label text,
  contact_email text,
  website text,
  notes text,
  tags text[] not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funders_type_check check (funder_type in ('public','private','foundation','corporate','individual','institution','other')),
  constraint funders_status_check check (status in ('prospect','active','paused','archive')),
  constraint funders_priority_check check (priority_level in ('faible','moyen','fort','critique'))
);

create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  funder_id uuid references public.funders(id) on delete set null,
  opportunity_key text unique,
  title text not null,
  opportunity_type text not null default 'grant',
  status text not null default 'veille',
  amount_min numeric(12,2),
  amount_max numeric(12,2),
  deadline_at timestamptz,
  url text,
  territory_label text,
  eligibility_notes text,
  restrictions text,
  priority_score integer not null default 35,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funding_opportunities_type_check check (opportunity_type in ('grant','sponsorship','call_for_projects','donation','public_subsidy','loan','other')),
  constraint funding_opportunities_status_check check (status in ('veille','a_qualifier','eligible','candidature','en_attente','accepte','refuse','archive')),
  constraint funding_opportunities_priority_score_check check (priority_score >= 0 and priority_score <= 100),
  constraint funding_opportunities_amount_check check ((amount_min is null or amount_min >= 0) and (amount_max is null or amount_max >= 0))
);

create table if not exists public.funding_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.funding_opportunities(id) on delete set null,
  funder_id uuid references public.funders(id) on delete set null,
  branch_id uuid,
  related_project_id uuid,
  related_case_id uuid,
  application_title text not null,
  requested_amount numeric(12,2) not null default 0,
  granted_amount numeric(12,2),
  status text not null default 'brouillon',
  deadline_at timestamptz,
  submitted_at timestamptz,
  decision_at timestamptz,
  reporting_due_at timestamptz,
  owner_name text,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funding_applications_status_check check (status in ('brouillon','a_deposer','deposee','en_instruction','acceptee','refusee','archive')),
  constraint funding_applications_amount_check check (requested_amount >= 0 and (granted_amount is null or granted_amount >= 0))
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  budget_key text unique,
  branch_id uuid,
  related_project_id uuid,
  related_case_id uuid,
  budget_name text not null,
  budget_type text not null default 'project',
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  planned_income numeric(12,2) not null default 0,
  planned_expenses numeric(12,2) not null default 0,
  confirmed_income numeric(12,2) not null default 0,
  committed_expenses numeric(12,2) not null default 0,
  spent_amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  risk_level text not null default 'modere',
  restrictions text,
  ai_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_type_check check (budget_type in ('project','branch','national','action','grant')),
  constraint budgets_status_check check (status in ('draft','active','to_review','closed','archive')),
  constraint budgets_risk_check check (risk_level in ('faible','modere','eleve','critique')),
  constraint budgets_amount_check check (planned_income >= 0 and planned_expenses >= 0 and confirmed_income >= 0 and committed_expenses >= 0 and spent_amount >= 0)
);

create table if not exists public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  line_type text not null default 'expense',
  category text,
  label text not null,
  planned_amount numeric(12,2) not null default 0,
  confirmed_amount numeric(12,2) not null default 0,
  spent_amount numeric(12,2) not null default 0,
  funding_source_id uuid references public.funders(id) on delete set null,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_lines_type_check check (line_type in ('income','expense')),
  constraint budget_lines_status_check check (status in ('planned','confirmed','spent','cancelled')),
  constraint budget_lines_amount_check check (planned_amount >= 0 and confirmed_amount >= 0 and spent_amount >= 0)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid references public.budgets(id) on delete set null,
  budget_line_id uuid references public.budget_lines(id) on delete set null,
  branch_id uuid,
  related_project_id uuid,
  expense_date timestamptz not null default now(),
  vendor_name text,
  label text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  tax_amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  payment_method text,
  receipt_document_id uuid,
  approved_by text,
  paid_at timestamptz,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_status_check check (status in ('draft','to_approve','approved','paid','rejected','archive')),
  constraint expenses_amount_check check (amount >= 0 and tax_amount >= 0)
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'manual',
  provider_payment_id text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  payment_status text not null default 'pending',
  payer_contact_id uuid,
  payer_organization_id uuid,
  related_project_id uuid,
  related_branch_id uuid,
  receipt_document_id uuid,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_records_status_check check (payment_status in ('pending','succeeded','failed','refunded','cancelled')),
  constraint payment_records_amount_check check (amount >= 0)
);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  processing_status text not null default 'received',
  error_message text,
  created_at timestamptz not null default now(),
  constraint stripe_events_status_check check (processing_status in ('received','processed','ignored','failed'))
);

create table if not exists public.finance_reports (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  related_project_id uuid,
  funder_id uuid references public.funders(id) on delete set null,
  application_id uuid references public.funding_applications(id) on delete set null,
  report_title text not null,
  report_type text not null default 'funder_report',
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  due_at timestamptz,
  sent_at timestamptz,
  summary text,
  required_documents text[] not null default '{}',
  missing_documents text[] not null default '{}',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_reports_type_check check (report_type in ('funder_report','budget_review','expense_summary','grant_report')),
  constraint finance_reports_status_check check (status in ('draft','to_send','sent','validated','archive'))
);

create or replace function public.set_finance_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_opportunity_metadata()
returns trigger language plpgsql as $$
declare
  days_left integer;
begin
  if new.priority_score is null then
    new.priority_score := 35;
  end if;
  if new.status in ('eligible','candidature','en_attente') then
    new.priority_score := greatest(new.priority_score, 58);
  elsif new.status = 'a_qualifier' then
    new.priority_score := greatest(new.priority_score, 45);
  end if;
  if coalesce(new.amount_max, new.amount_min, 0) >= 50000 then
    new.priority_score := least(100, new.priority_score + 16);
  elsif coalesce(new.amount_max, new.amount_min, 0) >= 10000 then
    new.priority_score := least(100, new.priority_score + 10);
  end if;
  if new.deadline_at is not null then
    days_left := ceil(extract(epoch from (new.deadline_at - now())) / 86400.0);
    if days_left <= 7 then
      new.priority_score := least(100, new.priority_score + 22);
    elsif days_left <= 30 then
      new.priority_score := least(100, new.priority_score + 14);
    end if;
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.title || ' - financement ' || new.status || ', score ' || new.priority_score || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_budget_metadata()
returns trigger language plpgsql as $$
begin
  if new.planned_expenses > 0 and new.spent_amount > new.planned_expenses then
    new.risk_level := 'critique';
    new.status := case when new.status = 'archive' then 'archive' else 'to_review' end;
  elsif new.planned_expenses > 0 and new.committed_expenses > new.planned_expenses then
    new.risk_level := 'eleve';
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.budget_name || ' - budget ' || new.status || ', depenses prevues ' || new.planned_expenses || ' ' || new.currency || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_expense_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'paid' and new.paid_at is null then
    new.paid_at := now();
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.label || ' - depense ' || new.status || ', montant ' || new.amount || ' ' || new.currency || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_funders_updated_at on public.funders;
create trigger set_funders_updated_at before insert or update on public.funders for each row execute function public.set_finance_updated_at();
drop trigger if exists set_funding_opportunity_metadata on public.funding_opportunities;
create trigger set_funding_opportunity_metadata before insert or update on public.funding_opportunities for each row execute function public.set_finance_opportunity_metadata();
drop trigger if exists set_funding_applications_updated_at on public.funding_applications;
create trigger set_funding_applications_updated_at before insert or update on public.funding_applications for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_budget_metadata on public.budgets;
create trigger set_finance_budget_metadata before insert or update on public.budgets for each row execute function public.set_finance_budget_metadata();
drop trigger if exists set_budget_lines_updated_at on public.budget_lines;
create trigger set_budget_lines_updated_at before insert or update on public.budget_lines for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_expense_metadata on public.expenses;
create trigger set_finance_expense_metadata before insert or update on public.expenses for each row execute function public.set_finance_expense_metadata();
drop trigger if exists set_payment_records_updated_at on public.payment_records;
create trigger set_payment_records_updated_at before insert or update on public.payment_records for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_reports_updated_at on public.finance_reports;
create trigger set_finance_reports_updated_at before insert or update on public.finance_reports for each row execute function public.set_finance_updated_at();

create index if not exists funders_status_idx on public.funders(status, funder_type, priority_level);
create index if not exists funders_organization_idx on public.funders(organization_id, contact_id);
create index if not exists funding_opportunities_status_idx on public.funding_opportunities(status, priority_score desc, deadline_at);
create index if not exists funding_opportunities_funder_idx on public.funding_opportunities(funder_id);
create index if not exists funding_applications_status_idx on public.funding_applications(status, deadline_at, reporting_due_at);
create index if not exists funding_applications_funder_idx on public.funding_applications(funder_id, opportunity_id);
create index if not exists budgets_status_idx on public.budgets(status, budget_type, risk_level);
create index if not exists budgets_related_idx on public.budgets(branch_id, related_project_id, related_case_id);
create index if not exists budget_lines_budget_idx on public.budget_lines(budget_id, line_type, status);
create index if not exists expenses_status_idx on public.expenses(status, expense_date desc);
create index if not exists expenses_budget_idx on public.expenses(budget_id, budget_line_id);
create index if not exists expenses_receipt_idx on public.expenses(receipt_document_id) where receipt_document_id is null;
create index if not exists payment_records_status_idx on public.payment_records(payment_status, provider, created_at desc);
create index if not exists stripe_events_type_idx on public.stripe_events(event_type, processing_status, created_at desc);
create index if not exists finance_reports_status_idx on public.finance_reports(status, due_at);
create index if not exists finance_reports_related_idx on public.finance_reports(funder_id, application_id, related_project_id);

alter table public.funders enable row level security;
alter table public.funding_opportunities enable row level security;
alter table public.funding_applications enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_lines enable row level security;
alter table public.expenses enable row level security;
alter table public.payment_records enable row level security;
alter table public.stripe_events enable row level security;
alter table public.finance_reports enable row level security;

drop policy if exists "TVF finances funders can read" on public.funders;
create policy "TVF finances funders can read" on public.funders for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances funders can manage" on public.funders;
create policy "TVF finances funders can manage" on public.funders for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances opportunities can read" on public.funding_opportunities;
create policy "TVF finances opportunities can read" on public.funding_opportunities for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances opportunities can manage" on public.funding_opportunities;
create policy "TVF finances opportunities can manage" on public.funding_opportunities for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances applications can read" on public.funding_applications;
create policy "TVF finances applications can read" on public.funding_applications for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances applications can manage" on public.funding_applications;
create policy "TVF finances applications can manage" on public.funding_applications for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances budgets can read" on public.budgets;
create policy "TVF finances budgets can read" on public.budgets for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances budgets can manage" on public.budgets;
create policy "TVF finances budgets can manage" on public.budgets for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances budget lines can read" on public.budget_lines;
create policy "TVF finances budget lines can read" on public.budget_lines for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances budget lines can manage" on public.budget_lines;
create policy "TVF finances budget lines can manage" on public.budget_lines for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances expenses can read" on public.expenses;
create policy "TVF finances expenses can read" on public.expenses for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances expenses can manage" on public.expenses;
create policy "TVF finances expenses can manage" on public.expenses for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances payments can read" on public.payment_records;
create policy "TVF finances payments can read" on public.payment_records for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','auditor'));
drop policy if exists "TVF finances payments can manage" on public.payment_records;
create policy "TVF finances payments can manage" on public.payment_records for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager'));

drop policy if exists "TVF finances stripe events can read" on public.stripe_events;
create policy "TVF finances stripe events can read" on public.stripe_events for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','auditor'));
drop policy if exists "TVF finances stripe events can manage" on public.stripe_events;
create policy "TVF finances stripe events can manage" on public.stripe_events for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager'));

drop policy if exists "TVF finances reports can read" on public.finance_reports;
create policy "TVF finances reports can read" on public.finance_reports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances reports can manage" on public.finance_reports;
create policy "TVF finances reports can manage" on public.finance_reports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

insert into public.funders (funder_name, funder_type, status, priority_level, territory_label, notes, tags, created_by)
values
  ('Financeur public a qualifier', 'public', 'prospect', 'moyen', 'France', 'Seed de reference pour les financements publics.', array['public','subvention'], 'TVF OS'),
  ('Mecene entreprise a qualifier', 'corporate', 'prospect', 'moyen', 'France', 'Seed de reference pour le mecenat et la RSE.', array['mecenat','rse'], 'TVF OS')
on conflict do nothing;

comment on table public.funders is 'TVF OS - financeurs, mecenes et partenaires financiers.';
comment on table public.funding_opportunities is 'TVF OS - appels a projets, subventions et dispositifs de financement.';
comment on table public.funding_applications is 'TVF OS - demandes de financement et candidatures.';
comment on table public.budgets is 'TVF OS - budgets projet, antenne, national ou action.';
comment on table public.budget_lines is 'TVF OS - lignes budgetaires recettes et depenses.';
comment on table public.expenses is 'TVF OS - depenses, engagements, justificatifs et validations.';
comment on table public.payment_records is 'TVF OS - paiements, dons, cotisations et transactions Stripe ou manuelles.';
comment on table public.stripe_events is 'TVF OS - journal des webhooks Stripe.';
comment on table public.finance_reports is 'TVF OS - reporting financeur, budgetaire et justificatif.';



-- FIN : tvf-os-finances.sql

-- ============================================================================
-- DEBUT : tvf-os-risks.sql
-- ============================================================================
-- TVF OS - Module Risques et conformite
-- Migration production : risques, conformite, incidents, autorisations et journal d'audit.

create extension if not exists pgcrypto;

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  risk_key text unique,
  risk_type text not null default 'operational',
  severity text not null default 'medium',
  likelihood text not null default 'possible',
  status text not null default 'open',
  title text not null,
  description text,
  mitigation_plan text,
  owner_name text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  due_at timestamptz,
  reviewed_at timestamptz,
  ai_summary text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint risks_type_check check (risk_type in ('rgpd','image_rights','visit_authorization','insurance','field_safety','conflict_interest','sensitive_data','financial','legal','operational','incident','other')),
  constraint risks_severity_check check (severity in ('low','medium','high','critical')),
  constraint risks_likelihood_check check (likelihood in ('rare','possible','likely','almost_certain')),
  constraint risks_status_check check (status in ('open','mitigating','blocked','accepted','resolved','closed','archive')),
  constraint risks_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  check_key text,
  check_type text not null default 'rgpd',
  title text not null,
  status text not null default 'missing',
  required boolean not null default true,
  blocking boolean not null default false,
  related_object_type text not null default 'none',
  related_object_id uuid,
  evidence_document_id uuid,
  owner_name text,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compliance_checks_unique unique (branch_id, check_key, related_object_type, related_object_id),
  constraint compliance_checks_type_check check (check_type in ('rgpd','image_rights','visit_authorization','insurance','field_safety','conflict_interest','publication','document','audit','other')),
  constraint compliance_checks_status_check check (status in ('missing','to_review','valid','expired','rejected','waived','archive')),
  constraint compliance_checks_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  incident_key text unique,
  incident_type text not null default 'operational',
  severity text not null default 'medium',
  status text not null default 'new',
  title text not null,
  description text,
  occurred_at timestamptz,
  reported_by text,
  owner_name text,
  immediate_actions text,
  corrective_actions text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  closed_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incidents_type_check check (incident_type in ('rgpd','security','field','insurance','image_rights','conflict_interest','financial','operational','other')),
  constraint incidents_severity_check check (severity in ('low','medium','high','critical')),
  constraint incidents_status_check check (status in ('new','triage','investigating','corrective_action','closed','archive')),
  constraint incidents_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  person_name text not null,
  consent_type text not null default 'data_processing',
  status text not null default 'pending',
  related_object_type text not null default 'none',
  related_object_id uuid,
  evidence_document_id uuid,
  valid_from date,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_records_type_check check (consent_type in ('data_processing','image_rights','visit_authorization','newsletter','minor_authorization','other')),
  constraint consent_records_status_check check (status in ('pending','valid','expired','revoked','rejected','archive')),
  constraint consent_records_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','branch','project','event'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_name text,
  action text not null,
  object_type text not null,
  object_id uuid,
  branch_id uuid,
  severity text not null default 'info',
  before_snapshot jsonb,
  after_snapshot jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_severity_check check (severity in ('info','notice','warning','critical'))
);

create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists risks_set_updated_at on public.risks;
create trigger risks_set_updated_at before update on public.risks for each row execute function public.tvf_set_updated_at();
drop trigger if exists compliance_checks_set_updated_at on public.compliance_checks;
create trigger compliance_checks_set_updated_at before update on public.compliance_checks for each row execute function public.tvf_set_updated_at();
drop trigger if exists incidents_set_updated_at on public.incidents;
create trigger incidents_set_updated_at before update on public.incidents for each row execute function public.tvf_set_updated_at();
drop trigger if exists consent_records_set_updated_at on public.consent_records;
create trigger consent_records_set_updated_at before update on public.consent_records for each row execute function public.tvf_set_updated_at();

create index if not exists risks_status_idx on public.risks(status, severity);
create index if not exists risks_branch_idx on public.risks(branch_id, risk_type);
create index if not exists compliance_checks_status_idx on public.compliance_checks(status, blocking);
create index if not exists compliance_checks_branch_idx on public.compliance_checks(branch_id, check_type);
create index if not exists incidents_status_idx on public.incidents(status, severity);
create index if not exists consent_records_status_idx on public.consent_records(status, consent_type);
create index if not exists audit_logs_object_idx on public.audit_logs(object_type, object_id, created_at desc);

alter table public.risks enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.incidents enable row level security;
alter table public.consent_records enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "TVF risks can read" on public.risks;
create policy "TVF risks can read" on public.risks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF risks can manage" on public.risks;
create policy "TVF risks can manage" on public.risks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF compliance checks can read" on public.compliance_checks;
create policy "TVF compliance checks can read" on public.compliance_checks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF compliance checks can manage" on public.compliance_checks;
create policy "TVF compliance checks can manage" on public.compliance_checks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF incidents can read" on public.incidents;
create policy "TVF incidents can read" on public.incidents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF incidents can manage" on public.incidents;
create policy "TVF incidents can manage" on public.incidents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF consent records can read" on public.consent_records;
create policy "TVF consent records can read" on public.consent_records for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF consent records can manage" on public.consent_records;
create policy "TVF consent records can manage" on public.consent_records for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF audit logs can read" on public.audit_logs;
create policy "TVF audit logs can read" on public.audit_logs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF audit logs can insert" on public.audit_logs;
create policy "TVF audit logs can insert" on public.audit_logs for insert with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','risk_manager','compliance_manager'));


-- FIN : tvf-os-risks.sql

-- ============================================================================
-- DEBUT : tvf-os-impact.sql
-- ============================================================================
-- TVF OS - Module Impact et statistiques
-- Migration production : indicateurs, valeurs, preuves, bilans et exports.

create extension if not exists pgcrypto;

create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text unique,
  metric_name text not null,
  metric_type text not null default 'impact',
  metric_scope text not null default 'national',
  unit text,
  description text,
  calculation_method text,
  status text not null default 'active',
  required_proof_type text,
  ai_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_metrics_type_check check (metric_type in ('activity','impact','finance','territory','volunteer','material','partner','case','other')),
  constraint impact_metrics_scope_check check (metric_scope in ('national','branch','pole','project','case')),
  constraint impact_metrics_status_check check (status in ('active','draft','archive'))
);

create table if not exists public.impact_proofs (
  id uuid primary key default gen_random_uuid(),
  proof_title text not null,
  proof_type text not null default 'document',
  status text not null default 'pending',
  document_id uuid,
  url text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  confidentiality_level text not null default 'interne',
  checked_by text,
  checked_at timestamptz,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_proofs_type_check check (proof_type in ('document','photo','report','invoice','attendance','decision','external_source','other')),
  constraint impact_proofs_status_check check (status in ('pending','validated','rejected','archive')),
  constraint impact_proofs_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible'))
);

create table if not exists public.impact_values (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references public.impact_metrics(id) on delete cascade,
  branch_id uuid,
  pole_key text,
  related_project_id uuid,
  related_case_id uuid,
  period_start timestamptz,
  period_end timestamptz,
  value_numeric numeric(14,2) not null default 0,
  value_text text,
  before_value numeric(14,2) not null default 0,
  after_value numeric(14,2) not null default 0,
  status text not null default 'draft',
  reliability_level text not null default 'moyen',
  proof_id uuid references public.impact_proofs(id) on delete set null,
  source_label text,
  notes text,
  validated_by text,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_values_status_check check (status in ('draft','validated','rejected','archive')),
  constraint impact_values_reliability_check check (reliability_level in ('faible','moyen','fort','verifie'))
);

create table if not exists public.impact_reports (
  id uuid primary key default gen_random_uuid(),
  report_title text not null,
  report_type text not null default 'national',
  branch_id uuid,
  pole_key text,
  related_project_id uuid,
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  summary text,
  metric_ids text[] not null default '{}',
  proof_ids text[] not null default '{}',
  generated_by text,
  validated_by text,
  validated_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_reports_type_check check (report_type in ('national','branch','pole','project','funder','public')),
  constraint impact_reports_status_check check (status in ('draft','to_validate','validated','published','archive'))
);

create table if not exists public.impact_exports (
  id uuid primary key default gen_random_uuid(),
  export_title text not null,
  export_format text not null default 'csv',
  status text not null default 'queued',
  filters jsonb not null default '{}'::jsonb,
  file_url text,
  generated_by text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_exports_status_check check (status in ('queued','ready','failed','expired'))
);

create or replace function public.set_impact_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_value_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'validated' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.status = 'validated' and new.proof_id is not null then
    new.reliability_level := case when new.reliability_level in ('faible','moyen') then 'fort' else new.reliability_level end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_proof_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'validated' and new.checked_at is null then
    new.checked_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_report_metadata()
returns trigger language plpgsql as $$
begin
  if new.status in ('validated','published') and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.report_title || ' - bilan ' || new.status || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_impact_metrics_updated_at on public.impact_metrics;
create trigger set_impact_metrics_updated_at before insert or update on public.impact_metrics for each row execute function public.set_impact_updated_at();
drop trigger if exists set_impact_value_metadata on public.impact_values;
create trigger set_impact_value_metadata before insert or update on public.impact_values for each row execute function public.set_impact_value_metadata();
drop trigger if exists set_impact_proof_metadata on public.impact_proofs;
create trigger set_impact_proof_metadata before insert or update on public.impact_proofs for each row execute function public.set_impact_proof_metadata();
drop trigger if exists set_impact_report_metadata on public.impact_reports;
create trigger set_impact_report_metadata before insert or update on public.impact_reports for each row execute function public.set_impact_report_metadata();
drop trigger if exists set_impact_exports_updated_at on public.impact_exports;
create trigger set_impact_exports_updated_at before insert or update on public.impact_exports for each row execute function public.set_impact_updated_at();

create index if not exists impact_metrics_type_idx on public.impact_metrics(metric_type, metric_scope, status);
create index if not exists impact_values_metric_idx on public.impact_values(metric_id, status, reliability_level);
create index if not exists impact_values_scope_idx on public.impact_values(branch_id, pole_key, related_project_id, related_case_id);
create index if not exists impact_values_period_idx on public.impact_values(period_start, period_end);
create index if not exists impact_proofs_status_idx on public.impact_proofs(status, proof_type, checked_at);
create index if not exists impact_proofs_related_idx on public.impact_proofs(related_object_type, related_object_id);
create index if not exists impact_reports_status_idx on public.impact_reports(status, report_type, updated_at desc);
create index if not exists impact_reports_scope_idx on public.impact_reports(branch_id, pole_key, related_project_id);
create index if not exists impact_exports_status_idx on public.impact_exports(status, export_format, created_at desc);

alter table public.impact_metrics enable row level security;
alter table public.impact_values enable row level security;
alter table public.impact_proofs enable row level security;
alter table public.impact_reports enable row level security;
alter table public.impact_exports enable row level security;

drop policy if exists "TVF impact metrics can read" on public.impact_metrics;
create policy "TVF impact metrics can read" on public.impact_metrics for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact metrics can manage" on public.impact_metrics;
create policy "TVF impact metrics can manage" on public.impact_metrics for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact values can read" on public.impact_values;
create policy "TVF impact values can read" on public.impact_values for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact values can manage" on public.impact_values;
create policy "TVF impact values can manage" on public.impact_values for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact proofs can read" on public.impact_proofs;
create policy "TVF impact proofs can read" on public.impact_proofs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact proofs can manage" on public.impact_proofs;
create policy "TVF impact proofs can manage" on public.impact_proofs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact reports can read" on public.impact_reports;
create policy "TVF impact reports can read" on public.impact_reports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','finance_manager','auditor'));
drop policy if exists "TVF impact reports can manage" on public.impact_reports;
create policy "TVF impact reports can manage" on public.impact_reports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact exports can read" on public.impact_exports;
create policy "TVF impact exports can read" on public.impact_exports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','finance_manager','auditor'));
drop policy if exists "TVF impact exports can manage" on public.impact_exports;
create policy "TVF impact exports can manage" on public.impact_exports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

insert into public.impact_metrics (metric_key, metric_name, metric_type, metric_scope, unit, description, calculation_method, status, required_proof_type, created_by)
values
  ('demandes-recues', 'Demandes recues', 'activity', 'national', 'demandes', 'Nombre de demandes entrantes recues.', 'Compter uniquement les demandes enregistrees.', 'active', 'report', 'TVF OS'),
  ('dossiers-qualifies', 'Dossiers qualifies', 'case', 'national', 'dossiers', 'Dossiers qualifies avec decision ou suite claire.', 'Compter les dossiers valides.', 'active', 'decision', 'TVF OS'),
  ('heures-benevoles', 'Heures benevoles', 'volunteer', 'branch', 'heures', 'Heures benevoles documentees.', 'Somme des emargements valides.', 'active', 'attendance', 'TVF OS'),
  ('financements-obtenus', 'Financements obtenus', 'finance', 'national', 'EUR', 'Financements confirmes et documentes.', 'Somme des montants acceptes avec preuve.', 'active', 'document', 'TVF OS')
on conflict (metric_key) do update set metric_name = excluded.metric_name, metric_type = excluded.metric_type, metric_scope = excluded.metric_scope, unit = excluded.unit, description = excluded.description, calculation_method = excluded.calculation_method, status = excluded.status, required_proof_type = excluded.required_proof_type;

comment on table public.impact_metrics is 'TVF OS - definitions des indicateurs d activite et d impact.';
comment on table public.impact_values is 'TVF OS - valeurs d impact, exclues des bilans tant qu elles ne sont pas validees.';
comment on table public.impact_proofs is 'TVF OS - preuves documentaires associees aux resultats.';
comment on table public.impact_reports is 'TVF OS - bilans d impact et statistiques exportables.';
comment on table public.impact_exports is 'TVF OS - exports impact et statistiques.';


-- FIN : tvf-os-impact.sql

