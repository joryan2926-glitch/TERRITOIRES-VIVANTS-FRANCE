select 'email_tables' as check_name, count(*) as value from information_schema.tables where table_schema = 'public' and table_name in ('email_messages','email_attachments','email_ai_suggestions','email_tasks','email_workflow_events')
union all
select 'email_rls_enabled', count(*) from pg_tables where schemaname = 'public' and tablename in ('email_messages','email_attachments','email_ai_suggestions','email_tasks','email_workflow_events') and rowsecurity = true
union all
select 'email_policies', count(*) from pg_policies where schemaname = 'public' and tablename in ('email_messages','email_attachments','email_ai_suggestions','email_tasks','email_workflow_events')
union all
select 'email_indexes', count(*) from pg_indexes where schemaname = 'public' and indexname in ('email_messages_status_idx','email_messages_priority_idx','email_messages_received_idx','email_messages_thread_idx','email_attachments_message_idx','email_ai_suggestions_message_idx','email_tasks_message_idx','email_tasks_status_idx','email_workflow_events_message_idx')
union all
select 'email_test_messages', count(*) from public.email_messages where external_message_id = 'test-email-001'
union all
select 'email_test_suggestions', count(*) from public.email_ai_suggestions s join public.email_messages m on m.id = s.email_message_id where m.external_message_id = 'test-email-001'
union all
select 'email_test_tasks', count(*) from public.email_tasks t join public.email_messages m on m.id = t.email_message_id where m.external_message_id = 'test-email-001';
