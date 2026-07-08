-- TVF OS - Observatoire territorial - verifications post-migration.

select 'observatoire_tables' as check_name, count(*)::text as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('territorial_sources','territorial_indicators','territorial_diagnostics','territorial_watch_items')
union all
select 'observatoire_rls_enabled', count(*)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('territorial_sources','territorial_indicators','territorial_diagnostics','territorial_watch_items')
  and c.relrowsecurity = true
union all
select 'observatoire_policies', count(*)::text
from pg_policies
where schemaname = 'public'
  and tablename in ('territorial_sources','territorial_indicators','territorial_diagnostics','territorial_watch_items')
union all
select 'observatoire_indexes', count(*)::text
from pg_indexes
where schemaname = 'public'
  and indexname like 'territorial_%'
union all
select 'observatoire_seed_sources', count(*)::text
from public.territorial_sources
where source_key in ('insee-base-territoire','cartographie-tvf-interne','veille-appels-a-projets')
union all
select 'observatoire_test_source', count(*)::text
from public.territorial_sources
where source_key = 'test-saint-etienne-observatoire'
union all
select 'observatoire_test_indicator', count(*)::text
from public.territorial_indicators
where indicator_key = 'test-logements-vacants-saint-etienne'
union all
select 'observatoire_test_diagnostic', count(*)::text
from public.territorial_diagnostics
where diagnostic_key = 'test-diagnostic-saint-etienne'
union all
select 'observatoire_watch_to_qualify', count(*)::text
from public.territorial_watch_items
where status = 'a_qualifier';
