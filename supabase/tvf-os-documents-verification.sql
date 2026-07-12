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
    ('triggers', 5),
    ('required_columns', 82)
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
  union all
  select 'required_columns', count(*)::int
  from information_schema.columns
  where table_schema = 'public'
    and (table_name, column_name) in (

        ('files','id'),('files','storage_bucket'),('files','storage_path'),('files','original_filename'),('files','mime_type'),('files','size_bytes'),('files','checksum'),('files','uploaded_by'),('files','branch_id'),('files','confidentiality_level'),('files','virus_scan_status'),('files','ai_summary'),('files','sensitive_detected'),('files','created_at'),
        ('templates','id'),('templates','template_key'),('templates','title'),('templates','template_type'),('templates','status'),('templates','version'),('templates','national_validated'),('templates','file_id'),('templates','required_fields'),('templates','description'),('templates','branch_id'),('templates','ai_summary'),('templates','search_vector'),('templates','created_at'),('templates','updated_at'),
        ('documents','id'),('documents','document_number'),('documents','title'),('documents','document_type'),('documents','status'),('documents','version'),('documents','file_id'),('documents','branch_id'),('documents','related_object_type'),('documents','related_object_id'),('documents','template_id'),('documents','validated_by'),('documents','validated_at'),('documents','expires_at'),('documents','confidentiality_level'),('documents','ai_summary'),('documents','classification_notes'),('documents','sensitive_detected'),('documents','indexed_in_knowledge'),('documents','search_vector'),('documents','created_at'),('documents','updated_at'),
        ('document_versions','id'),('document_versions','document_id'),('document_versions','version'),('document_versions','file_id'),('document_versions','change_summary'),('document_versions','created_by'),('document_versions','created_at'),
        ('document_links','id'),('document_links','document_id'),('document_links','related_object_type'),('document_links','related_object_id'),('document_links','relation_label'),('document_links','created_at'),
        ('generated_documents','id'),('generated_documents','template_id'),('generated_documents','document_id'),('generated_documents','generated_by'),('generated_documents','generated_from_object_type'),('generated_documents','generated_from_object_id'),('generated_documents','generation_status'),('generated_documents','validation_status'),('generated_documents','missing_fields'),('generated_documents','field_values'),('generated_documents','created_at'),
        ('document_audit_logs','id'),('document_audit_logs','document_id'),('document_audit_logs','template_id'),('document_audit_logs','action'),('document_audit_logs','details'),('document_audit_logs','created_by'),('document_audit_logs','created_at')
    )
)
select e.metric, e.expected_count, coalesce(a.actual_count, 0) as actual_count,
       case when coalesce(a.actual_count, 0) >= e.expected_count then 'ok' else 'missing' end as status
from expected e
left join actual a using(metric)
order by e.metric;

-- Colonnes requises par l'API TVF OS Documents.
with required_columns(table_name, column_name) as (
  values
    ('files','id'),('files','storage_bucket'),('files','storage_path'),('files','original_filename'),('files','mime_type'),('files','size_bytes'),('files','checksum'),('files','uploaded_by'),('files','branch_id'),('files','confidentiality_level'),('files','virus_scan_status'),('files','ai_summary'),('files','sensitive_detected'),('files','created_at'),
    ('templates','id'),('templates','template_key'),('templates','title'),('templates','template_type'),('templates','status'),('templates','version'),('templates','national_validated'),('templates','file_id'),('templates','required_fields'),('templates','description'),('templates','branch_id'),('templates','ai_summary'),('templates','search_vector'),('templates','created_at'),('templates','updated_at'),
    ('documents','id'),('documents','document_number'),('documents','title'),('documents','document_type'),('documents','status'),('documents','version'),('documents','file_id'),('documents','branch_id'),('documents','related_object_type'),('documents','related_object_id'),('documents','template_id'),('documents','validated_by'),('documents','validated_at'),('documents','expires_at'),('documents','confidentiality_level'),('documents','ai_summary'),('documents','classification_notes'),('documents','sensitive_detected'),('documents','indexed_in_knowledge'),('documents','search_vector'),('documents','created_at'),('documents','updated_at'),
    ('document_versions','id'),('document_versions','document_id'),('document_versions','version'),('document_versions','file_id'),('document_versions','change_summary'),('document_versions','created_by'),('document_versions','created_at'),
    ('document_links','id'),('document_links','document_id'),('document_links','related_object_type'),('document_links','related_object_id'),('document_links','relation_label'),('document_links','created_at'),
    ('generated_documents','id'),('generated_documents','template_id'),('generated_documents','document_id'),('generated_documents','generated_by'),('generated_documents','generated_from_object_type'),('generated_documents','generated_from_object_id'),('generated_documents','generation_status'),('generated_documents','validation_status'),('generated_documents','missing_fields'),('generated_documents','field_values'),('generated_documents','created_at'),
    ('document_audit_logs','id'),('document_audit_logs','document_id'),('document_audit_logs','template_id'),('document_audit_logs','action'),('document_audit_logs','details'),('document_audit_logs','created_by'),('document_audit_logs','created_at')
), actual_columns as (
  select table_name, column_name
  from information_schema.columns
  where table_schema = 'public'
)
select r.table_name, r.column_name, 'missing' as status
from required_columns r
left join actual_columns a using(table_name, column_name)
where a.column_name is null
order by r.table_name, r.column_name;
