-- TVF OS - Verification globale socle MVP
-- Usage : coller ce fichier dans Supabase SQL Editor apres execution des migrations prioritaires.
-- Ce script ne modifie aucune donnee. Il verifie les tables, RLS, policies, indexes, fonctions et buckets essentiels.

-- 1. Tables essentielles attendues
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'),
    ('Demandes entrantes', 'request_activity_log'),
    ('Demandes entrantes', 'request_ai_suggestions'),
    ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'),
    ('CRM', 'organizations'),
    ('CRM', 'organization_contacts'),
    ('CRM', 'relationship_history'),
    ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'),
    ('Dossiers', 'case_participants'),
    ('Dossiers', 'case_checklist_items'),
    ('Dossiers', 'case_status_history'),
    ('Dossiers', 'case_risks'),
    ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'),
    ('Taches agenda', 'work_tasks'),
    ('Taches agenda', 'work_events'),
    ('Taches agenda', 'work_automation_rules'),
    ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'),
    ('Documents', 'documents'),
    ('Documents', 'document_versions'),
    ('Documents', 'document_links'),
    ('Documents', 'templates'),
    ('Documents', 'generated_documents'),
    ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'),
    ('Utilisateurs', 'roles'),
    ('Utilisateurs', 'permissions'),
    ('Utilisateurs', 'role_permissions'),
    ('Utilisateurs', 'user_roles'),
    ('Utilisateurs', 'user_branch_memberships'),
    ('Utilisateurs', 'user_invitations'),
    ('Utilisateurs', 'access_reviews')
), found_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.module_name,
  e.table_name,
  case when f.table_name is null then 'missing' else 'ok' end as status
from expected_tables e
left join found_tables f on f.table_name = e.table_name
order by e.module_name, e.table_name;

-- 2. Synthese par module : tables presentes
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
), found_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.module_name,
  count(*) as expected_tables,
  count(f.table_name) as found_tables,
  case when count(*) = count(f.table_name) then 'ok' else 'missing' end as status
from expected_tables e
left join found_tables f on f.table_name = e.table_name
group by e.module_name
order by e.module_name;

-- 3. RLS activee sur les tables essentielles presentes
with expected_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
)
select
  e.module_name,
  e.table_name,
  coalesce(c.relrowsecurity, false) as rls_enabled
from expected_tables e
left join pg_class c on c.relname = e.table_name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by e.module_name, e.table_name;

-- 4. Policies RLS par module
with module_tables(module_name, table_name) as (
  values
    ('Demandes entrantes', 'contacts'), ('Demandes entrantes', 'request_activity_log'), ('Demandes entrantes', 'request_ai_suggestions'), ('Demandes entrantes', 'request_documents'),
    ('CRM', 'crm_contacts'), ('CRM', 'organizations'), ('CRM', 'organization_contacts'), ('CRM', 'relationship_history'), ('CRM', 'crm_duplicate_suggestions'),
    ('Dossiers', 'cases'), ('Dossiers', 'case_participants'), ('Dossiers', 'case_checklist_items'), ('Dossiers', 'case_status_history'), ('Dossiers', 'case_risks'), ('Dossiers', 'case_decisions'),
    ('Taches agenda', 'work_projects'), ('Taches agenda', 'work_tasks'), ('Taches agenda', 'work_events'), ('Taches agenda', 'work_automation_rules'), ('Taches agenda', 'work_activity_log'),
    ('Documents', 'files'), ('Documents', 'documents'), ('Documents', 'document_versions'), ('Documents', 'document_links'), ('Documents', 'templates'), ('Documents', 'generated_documents'), ('Documents', 'document_audit_logs'),
    ('Utilisateurs', 'profiles'), ('Utilisateurs', 'roles'), ('Utilisateurs', 'permissions'), ('Utilisateurs', 'role_permissions'), ('Utilisateurs', 'user_roles'), ('Utilisateurs', 'user_branch_memberships'), ('Utilisateurs', 'user_invitations'), ('Utilisateurs', 'access_reviews')
)
select
  mt.module_name,
  mt.table_name,
  count(p.policyname) as policies
from module_tables mt
left join pg_policies p on p.schemaname = 'public' and p.tablename = mt.table_name
group by mt.module_name, mt.table_name
order by mt.module_name, mt.table_name;

-- 5. Bucket documentaire prioritaire
select
  'Documents' as module_name,
  'storage bucket tvf-documents' as check_name,
  case when exists (select 1 from storage.buckets where id = 'tvf-documents' and public = false) then 'ok' else 'missing' end as status;

-- 6. Fonctions critiques attendues
with expected_functions(module_name, function_name) as (
  values
    ('Dossiers', 'tvf_case_type_pole'),
    ('Dossiers', 'tvf_case_maturity'),
    ('Dossiers', 'set_case_metadata'),
    ('Dossiers', 'create_default_case_checklist'),
    ('Dossiers', 'update_case_maturity_from_checklist'),
    ('Documents', 'tvf_detect_sensitive_document'),
    ('Documents', 'tvf_document_type_from_title'),
    ('Documents', 'set_file_metadata'),
    ('Documents', 'set_template_metadata'),
    ('Documents', 'set_document_metadata'),
    ('Documents', 'create_initial_document_version'),
    ('Documents', 'log_document_status_change')
)
select
  e.module_name,
  e.function_name,
  case when p.proname is null then 'missing' else 'ok' end as status
from expected_functions e
left join pg_proc p on p.proname = e.function_name
left join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
order by e.module_name, e.function_name;