-- Verification TVF OS - Portails externes securises

select
  'portal_tables' as check_name,
  count(*) as found,
  6 as expected
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'portal_accesses',
    'portal_threads',
    'portal_messages',
    'portal_document_requests',
    'portal_appointments',
    'portal_activity_log'
  );

select
  'portal_rls_enabled' as check_name,
  count(*) as found,
  6 as expected
from pg_tables
where schemaname = 'public'
  and tablename in (
    'portal_accesses',
    'portal_threads',
    'portal_messages',
    'portal_document_requests',
    'portal_appointments',
    'portal_activity_log'
  )
  and rowsecurity = true;

select
  'portal_policies' as check_name,
  count(*) as found,
  12 as minimum_expected
from pg_policies
where schemaname = 'public'
  and tablename in (
    'portal_accesses',
    'portal_threads',
    'portal_messages',
    'portal_document_requests',
    'portal_appointments',
    'portal_activity_log'
  );

select
  'portal_indexes' as check_name,
  count(*) as found,
  9 as minimum_expected
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_portal_accesses_user_id',
    'idx_portal_accesses_email',
    'idx_portal_accesses_case_id',
    'idx_portal_accesses_territory_code',
    'idx_portal_threads_access',
    'idx_portal_messages_thread',
    'idx_portal_document_requests_access',
    'idx_portal_appointments_access',
    'idx_portal_activity_access'
  );

select
  'portal_no_demo_data' as check_name,
  (
    (select count(*) from public.portal_accesses) +
    (select count(*) from public.portal_threads) +
    (select count(*) from public.portal_messages) +
    (select count(*) from public.portal_document_requests) +
    (select count(*) from public.portal_appointments)
  ) as current_business_rows,
  '0 attendu juste apres installation, hors donnees reelles creees ensuite' as note;
