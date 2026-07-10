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