-- TVF OS - Verification module Parametres

select 'settings_tables' as check_name, count(*) as value
from information_schema.tables
where table_schema = 'public'
and table_name in ('system_settings','integration_configs','module_feature_flags','automation_settings','system_health_checks','settings_audit_log');

select 'settings_rls_enabled' as check_name, count(*) as value
from pg_tables
where schemaname = 'public'
and tablename in ('system_settings','integration_configs','module_feature_flags','automation_settings','system_health_checks','settings_audit_log')
and rowsecurity = true;

select 'settings_policies' as check_name, count(*) as value
from pg_policies
where schemaname = 'public'
and tablename in ('system_settings','integration_configs','module_feature_flags','automation_settings','system_health_checks','settings_audit_log');

select 'settings_indexes' as check_name, count(*) as value
from pg_indexes
where schemaname = 'public'
and indexname in ('system_settings_category_idx','integration_configs_status_idx','module_feature_flags_module_idx','automation_settings_status_idx','system_health_checks_status_idx','settings_audit_object_idx');

select 'settings_seed_rows' as check_name,
  (select count(*) from public.system_settings where setting_key = 'settings-test-mode') +
  (select count(*) from public.integration_configs where provider_key = 'settings_test_provider') +
  (select count(*) from public.module_feature_flags where module_key = 'settings_test') +
  (select count(*) from public.automation_settings where rule_key = 'settings-test-rule') +
  (select count(*) from public.system_health_checks where check_key = 'settings-test-health') as value;