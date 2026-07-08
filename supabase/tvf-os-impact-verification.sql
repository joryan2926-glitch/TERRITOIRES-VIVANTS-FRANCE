-- TVF OS - Impact et statistiques - verifications post-migration.

select 'impact_tables' as check_name, count(*)::text as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('impact_metrics','impact_values','impact_proofs','impact_reports','impact_exports')
union all
select 'impact_rls_enabled', count(*)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('impact_metrics','impact_values','impact_proofs','impact_reports','impact_exports')
  and c.relrowsecurity = true
union all
select 'impact_policies', count(*)::text
from pg_policies
where schemaname = 'public'
  and tablename in ('impact_metrics','impact_values','impact_proofs','impact_reports','impact_exports')
union all
select 'impact_indexes', count(*)::text
from pg_indexes
where schemaname = 'public'
  and indexname like 'impact_%'
union all
select 'impact_seed_metrics', count(*)::text
from public.impact_metrics
where metric_key in ('demandes-recues','dossiers-qualifies','heures-benevoles','financements-obtenus')
union all
select 'impact_test_metric', count(*)::text
from public.impact_metrics
where metric_key = 'test-impact-heures-benevoles'
union all
select 'impact_validated_values', count(*)::text
from public.impact_values
where status = 'validated'
union all
select 'impact_validated_proofs', count(*)::text
from public.impact_proofs
where status = 'validated'
union all
select 'impact_reports_to_validate', count(*)::text
from public.impact_reports
where status = 'to_validate'
union all
select 'impact_exports_ready', count(*)::text
from public.impact_exports
where status = 'ready';
