-- TVF OS - Finances - verifications post-migration.

select 'finances_tables' as check_name, count(*)::text as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('funders','funding_opportunities','funding_applications','budgets','budget_lines','expenses','payment_records','stripe_events','finance_reports')
union all
select 'finances_rls_enabled', count(*)::text
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('funders','funding_opportunities','funding_applications','budgets','budget_lines','expenses','payment_records','stripe_events','finance_reports')
  and c.relrowsecurity = true
union all
select 'finances_policies', count(*)::text
from pg_policies
where schemaname = 'public'
  and tablename in ('funders','funding_opportunities','funding_applications','budgets','budget_lines','expenses','payment_records','stripe_events','finance_reports')
union all
select 'finances_indexes', count(*)::text
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'funders_status_idx','funders_organization_idx','funding_opportunities_status_idx','funding_opportunities_funder_idx',
    'funding_applications_status_idx','funding_applications_funder_idx','budgets_status_idx','budgets_related_idx',
    'budget_lines_budget_idx','expenses_status_idx','expenses_budget_idx','expenses_receipt_idx',
    'payment_records_status_idx','stripe_events_type_idx','finance_reports_status_idx','finance_reports_related_idx'
  )
union all
select 'finances_seed_funders', count(*)::text
from public.funders
where funder_name in ('Financeur public a qualifier','Mecene entreprise a qualifier')
union all
select 'finances_test_funder', count(*)::text
from public.funders
where funder_name = 'Financeur test TVF'
union all
select 'finances_test_opportunity', count(*)::text
from public.funding_opportunities
where opportunity_key = 'test-appel-projets-finances'
union all
select 'finances_test_budget', count(*)::text
from public.budgets
where budget_key = 'test-budget-finances-saint-etienne'
union all
select 'finances_expenses_to_approve', count(*)::text
from public.expenses
where status = 'to_approve'
union all
select 'finances_reports_draft', count(*)::text
from public.finance_reports
where status = 'draft';
