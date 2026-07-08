-- TVF OS - Module Gouvernance et decisions - verification

select 'governance_tables' as check_name, count(*)::int as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('decisions','committees','committee_items','decision_votes','delegations','decision_actions')
union all
select 'governance_rls_enabled', count(*)::int
from pg_tables
where schemaname = 'public'
  and tablename in ('decisions','committees','committee_items','decision_votes','delegations','decision_actions')
  and rowsecurity = true
union all
select 'governance_policies', count(*)::int
from pg_policies
where schemaname = 'public'
  and tablename in ('decisions','committees','committee_items','decision_votes','delegations','decision_actions')
union all
select 'governance_indexes', count(*)::int
from pg_indexes
where schemaname = 'public'
  and indexname in ('decisions_status_idx','decisions_branch_idx','committees_status_idx','committee_items_committee_idx','decision_votes_decision_idx','delegations_branch_idx','decision_actions_status_idx')
union all
select 'governance_test_decisions', count(*)::int from public.decisions where decision_number = 'DEC-TEST-001'
union all
select 'governance_test_committees', count(*)::int from public.committees where committee_key = 'COM-TEST-GOUV-001'
union all
select 'governance_test_items', count(*)::int from public.committee_items ci join public.decisions d on d.id = ci.decision_id where d.decision_number = 'DEC-TEST-001'
union all
select 'governance_test_votes', count(*)::int from public.decision_votes v join public.decisions d on d.id = v.decision_id where d.decision_number = 'DEC-TEST-001'
union all
select 'governance_test_actions', count(*)::int from public.decision_actions a join public.decisions d on d.id = a.decision_id where d.decision_number = 'DEC-TEST-001'
union all
select 'governance_test_delegations', count(*)::int from public.delegations where delegation_key = 'DEL-TEST-001';
