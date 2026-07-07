-- TVF OS - Module Gestion documentaire
-- Verification post-migration : bucket, tables, RLS, politiques, indexes, fonctions et triggers.

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('files','documents','document_versions','document_links','templates','generated_documents','document_audit_logs')
order by tablename, policyname;

with expected(metric, expected_count) as (
  values
    ('bucket', 1),
    ('tables', 7),
    ('rls_enabled', 7),
    ('policies_public', 14),
    ('policies_storage', 2),
    ('indexes', 14),
    ('functions', 7),
    ('triggers', 5)
), actual(metric, actual_count) as (
  select 'bucket', count(*)::int
  from storage.buckets
  where id = 'tvf-documents' and public = false
  union all
  select 'tables', count(*)::int
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('files','documents','document_versions','document_links','templates','generated_documents','document_audit_logs')
  union all
  select 'rls_enabled', count(*)::int
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('files','documents','document_versions','document_links','templates','generated_documents','document_audit_logs')
    and c.relrowsecurity = true
  union all
  select 'policies_public', count(*)::int
  from pg_policies
  where schemaname = 'public'
    and tablename in ('files','documents','document_versions','document_links','templates','generated_documents','document_audit_logs')
  union all
  select 'policies_storage', count(*)::int
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in ('TVF storage documents can read','TVF storage documents can manage')
  union all
  select 'indexes', count(*)::int
  from pg_indexes
  where schemaname = 'public'
    and indexname in ('files_bucket_path_idx','files_confidentiality_idx','documents_status_idx','documents_related_idx','documents_file_idx','documents_template_idx','documents_search_idx','document_versions_document_idx','document_links_object_idx','templates_status_idx','templates_search_idx','generated_documents_template_idx','generated_documents_object_idx','document_audit_logs_document_idx')
  union all
  select 'functions', count(*)::int
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('tvf_detect_sensitive_document','tvf_document_type_from_title','set_file_metadata','set_template_metadata','set_document_metadata','create_initial_document_version','log_document_status_change')
  union all
  select 'triggers', count(distinct t.tgname)::int
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal
    and t.tgname in ('set_file_metadata','set_template_metadata','set_document_metadata','create_initial_document_version','log_document_status_change')
)
select e.metric, e.expected_count, coalesce(a.actual_count, 0) as actual_count,
       case when coalesce(a.actual_count, 0) >= e.expected_count then 'ok' else 'missing' end as status
from expected e
left join actual a using(metric)
order by e.metric;
