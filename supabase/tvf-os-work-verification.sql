select 'work_tables' as check_name, count(*) as value from information_schema.tables where table_schema = 'public' and table_name in ('work_projects','work_tasks','work_events','work_automation_rules','work_activity_log')
union all
select 'work_rls_enabled', count(*) from pg_tables where schemaname = 'public' and tablename in ('work_projects','work_tasks','work_events','work_automation_rules','work_activity_log') and rowsecurity = true
union all
select 'work_policies', count(*) from pg_policies where schemaname = 'public' and tablename in ('work_projects','work_tasks','work_events','work_automation_rules','work_activity_log')
union all
select 'work_indexes', count(*) from pg_indexes where schemaname = 'public' and indexname in ('work_projects_status_idx','work_projects_due_idx','work_tasks_status_idx','work_tasks_due_idx','work_tasks_project_idx','work_events_starts_idx','work_events_status_idx','work_automation_rules_status_idx','work_activity_object_idx')
union all
select 'work_test_projects', count(*) from public.work_projects where project_key = 'WORK-TEST-001'
union all
select 'work_test_tasks', count(*) from public.work_tasks where task_key = 'TASK-TEST-001'
union all
select 'work_test_events', count(*) from public.work_events where event_key = 'EVENT-TEST-001';
