-- TVF OS - Module Gestion des antennes - verification

select 'branches_tables' as check_name, count(*)::int as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('branches','poles','branch_poles','branch_launch_checklist_items','branch_team_members','branch_training_items')
union all
select 'branches_rls_enabled', count(*)::int
from pg_tables
where schemaname = 'public'
  and tablename in ('branches','poles','branch_poles','branch_launch_checklist_items','branch_team_members','branch_training_items')
  and rowsecurity = true
union all
select 'branches_policies', count(*)::int
from pg_policies
where schemaname = 'public'
  and tablename in ('branches','poles','branch_poles','branch_launch_checklist_items','branch_team_members','branch_training_items')
union all
select 'branches_indexes', count(*)::int
from pg_indexes
where schemaname = 'public'
  and indexname in ('branches_status_idx','branches_maturity_idx','branches_territory_idx','branch_poles_branch_idx','branch_checklist_branch_idx','branch_team_branch_idx','branch_training_branch_idx')
union all
select 'branches_seed_poles', count(*)::int from public.poles
union all
select 'branches_test_branch', count(*)::int from public.branches where code = 'TVF-42-STETIENNE'
union all
select 'branches_test_poles', count(*)::int from public.branch_poles bp join public.branches b on b.id = bp.branch_id where b.code = 'TVF-42-STETIENNE'
union all
select 'branches_test_checklist', count(*)::int from public.branch_launch_checklist_items c join public.branches b on b.id = c.branch_id where b.code = 'TVF-42-STETIENNE'
union all
select 'branches_test_team', count(*)::int from public.branch_team_members t join public.branches b on b.id = t.branch_id where b.code = 'TVF-42-STETIENNE'
union all
select 'branches_test_training', count(*)::int from public.branch_training_items tr join public.branches b on b.id = tr.branch_id where b.code = 'TVF-42-STETIENNE';
