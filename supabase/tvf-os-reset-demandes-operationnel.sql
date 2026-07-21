-- TVF OS - Remise a zero operationnelle des demandes
-- Objectif : vider les files de reception sans supprimer les tables ni la configuration.
-- A executer dans Supabase SQL Editor uniquement apres sauvegarde/export si necessaire.

begin;

-- E-mails entrants et objets lies
truncate table if exists public.email_workflow_events restart identity cascade;
truncate table if exists public.email_tasks restart identity cascade;
truncate table if exists public.email_ai_suggestions restart identity cascade;
truncate table if exists public.email_attachments restart identity cascade;
truncate table if exists public.email_messages restart identity cascade;

-- Demandes mobiles en attente/importees
truncate table if exists public.mobile_requests restart identity cascade;

-- Demandes formulaires site / imports manuels / demandes converties
truncate table if exists public.contacts restart identity cascade;

-- Journal minimal de remise a zero si la table d'audit existe
insert into public.admin_audit_logs (module_key, action, object_type, object_id, summary, metadata)
select
  'requests',
  'operational_reset_sql',
  'tvf_os_reception',
  null,
  'Remise a zero operationnelle des demandes TVF OS',
  jsonb_build_object('official_email','contact@territoiresvivantsfrance.fr','source','supabase_sql_editor')
where exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'admin_audit_logs'
);

commit;

-- Verification rapide apres execution
select 'contacts' as table_name, count(*)::int as rows from public.contacts
union all select 'mobile_requests', count(*)::int from public.mobile_requests
union all select 'email_messages', count(*)::int from public.email_messages
union all select 'email_tasks', count(*)::int from public.email_tasks;