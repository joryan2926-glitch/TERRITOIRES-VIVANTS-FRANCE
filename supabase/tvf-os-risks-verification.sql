-- TVF OS - Module Risques et conformite - verification

select 'risks_tables' as check_name, count(*)::int as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('risks','compliance_checks','incidents','consent_records','audit_logs')
union all
select 'risks_rls_enabled', count(*)::int
from pg_tables
where schemaname = 'public'
  and tablename in ('risks','compliance_checks','incidents','consent_records','audit_logs')
  and rowsecurity = true
union all
select 'risks_policies', count(*)::int
from pg_policies
where schemaname = 'public'
  and tablename in ('risks','compliance_checks','incidents','consent_records','audit_logs')
union all
select 'risks_indexes', count(*)::int
from pg_indexes
where schemaname = 'public'
  and indexname in ('risks_status_idx','risks_branch_idx','compliance_checks_status_idx','compliance_checks_branch_idx','incidents_status_idx','consent_records_status_idx','audit_logs_object_idx')
union all
select 'risks_test_risks', count(*)::int from public.risks where risk_key like 'RISK-TEST-%'
union all
select 'risks_test_checks', count(*)::int from public.compliance_checks where check_key like 'CHECK-TEST-%'
union all
select 'risks_test_incidents', count(*)::int from public.incidents where incident_key = 'INC-TEST-001'
union all
select 'risks_test_consents', count(*)::int from public.consent_records where person_name like '%test%'
union all
select 'risks_test_audit', count(*)::int from public.audit_logs where action = 'risk_module_seed';
