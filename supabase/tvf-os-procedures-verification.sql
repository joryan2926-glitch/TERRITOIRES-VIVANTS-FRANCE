-- TVF OS - Module Procedures
-- Verification post-migration : tables, RLS, politiques, indexes, fonctions et triggers.

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('procedures','procedure_steps','procedure_versions','procedure_applications','procedure_step_instances','procedure_questions')
order by tablename, policyname;

with expected(metric, expected_count) as (
  values
    ('tables', 6),
    ('rls_enabled', 6),
    ('policies', 12),
    ('indexes', 9),
    ('functions', 7),
    ('triggers', 5)
), actual(metric, actual_count) as (
  select 'tables', count(*)::int
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('procedures','procedure_steps','procedure_versions','procedure_applications','procedure_step_instances','procedure_questions')
  union all
  select 'rls_enabled', count(*)::int
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('procedures','procedure_steps','procedure_versions','procedure_applications','procedure_step_instances','procedure_questions')
    and c.relrowsecurity = true
  union all
  select 'policies', count(*)::int
  from pg_policies
  where schemaname = 'public'
    and tablename in ('procedures','procedure_steps','procedure_versions','procedure_applications','procedure_step_instances','procedure_questions')
  union all
  select 'indexes', count(*)::int
  from pg_indexes
  where schemaname = 'public'
    and indexname in ('procedures_status_idx','procedures_review_idx','procedures_search_idx','procedure_steps_procedure_idx','procedure_versions_procedure_idx','procedure_applications_procedure_idx','procedure_applications_object_idx','procedure_step_instances_application_idx','procedure_questions_procedure_idx')
  union all
  select 'functions', count(*)::int
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('tvf_slugify','set_procedure_metadata','set_procedure_step_metadata','create_initial_procedure_version','create_application_step_instances','tvf_application_completion','update_application_completion')
  union all
  select 'triggers', count(distinct t.tgname)::int
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal
    and t.tgname in ('set_procedure_metadata','set_procedure_step_metadata','create_initial_procedure_version','create_application_step_instances','update_application_completion')
)
select e.metric, e.expected_count, coalesce(a.actual_count, 0) as actual_count,
       case when coalesce(a.actual_count, 0) >= e.expected_count then 'ok' else 'missing' end as status
from expected e
left join actual a using(metric)
order by e.metric;
