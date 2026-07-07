-- TVF OS - Module Dossiers
-- Verification post-migration : tables, RLS, politiques, indexes, fonctions et triggers.

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('cases','case_participants','case_checklist_items','case_status_history','case_risks','case_decisions')
order by tablename, policyname;

with expected(metric, expected_count) as (
  values
    ('tables', 6),
    ('rls_enabled', 6),
    ('policies', 12),
    ('indexes', 9),
    ('functions', 5),
    ('triggers', 3)
), actual(metric, actual_count) as (
  select 'tables', count(*)::int
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('cases','case_participants','case_checklist_items','case_status_history','case_risks','case_decisions')
  union all
  select 'rls_enabled', count(*)::int
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('cases','case_participants','case_checklist_items','case_status_history','case_risks','case_decisions')
    and c.relrowsecurity = true
  union all
  select 'policies', count(*)::int
  from pg_policies
  where schemaname = 'public'
    and tablename in ('cases','case_participants','case_checklist_items','case_status_history','case_risks','case_decisions')
  union all
  select 'indexes', count(*)::int
  from pg_indexes
  where schemaname = 'public'
    and indexname in ('cases_status_idx','cases_type_idx','cases_source_request_idx','cases_assigned_to_idx','case_participants_case_idx','case_checklist_case_idx','case_status_history_case_idx','case_risks_case_idx','case_decisions_case_idx')
  union all
  select 'functions', count(*)::int
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('tvf_case_type_pole','tvf_case_maturity','set_case_metadata','create_default_case_checklist','update_case_maturity_from_checklist')
  union all
  select 'triggers', count(distinct t.tgname)::int
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal
    and t.tgname in ('set_case_metadata','create_default_case_checklist','update_case_maturity_from_checklist')
)
select e.metric, e.expected_count, coalesce(a.actual_count, 0) as actual_count,
       case when coalesce(a.actual_count, 0) >= e.expected_count then 'ok' else 'missing' end as status
from expected e
left join actual a using(metric)
order by e.metric;
