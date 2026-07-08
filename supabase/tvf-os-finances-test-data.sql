-- TVF OS - Finances - donnees de test production controlables.

with funder as (
  insert into public.funders (
    funder_name,
    funder_type,
    status,
    priority_level,
    territory_label,
    contact_email,
    notes,
    tags,
    created_by
  )
  values (
    'Financeur test TVF',
    'foundation',
    'active',
    'fort',
    'Saint-Etienne',
    'test-financeur@territoiresvivantsfrance.fr',
    'Financeur de test pour valider le module Finances.',
    array['test','financeur','reporting'],
    'TVF OS test'
  )
  returning id
),
opportunity as (
  insert into public.funding_opportunities (
    funder_id,
    opportunity_key,
    title,
    opportunity_type,
    status,
    amount_min,
    amount_max,
    deadline_at,
    territory_label,
    eligibility_notes,
    restrictions,
    priority_score
  )
  select
    funder.id,
    'test-appel-projets-finances',
    'Appel a projets test TVF',
    'call_for_projects',
    'eligible',
    5000,
    25000,
    now() + interval '45 days',
    'Saint-Etienne',
    'Eligibilite test a confirmer avant depot.',
    'Utilisation limitee aux actions documentees.',
    70
  from funder
  on conflict (opportunity_key) do update set
    title = excluded.title,
    status = excluded.status,
    amount_max = excluded.amount_max,
    deadline_at = excluded.deadline_at
  returning id, funder_id
),
budget as (
  insert into public.budgets (
    budget_key,
    budget_name,
    budget_type,
    status,
    planned_income,
    planned_expenses,
    confirmed_income,
    committed_expenses,
    spent_amount,
    risk_level,
    restrictions,
    created_by
  )
  values (
    'test-budget-finances-saint-etienne',
    'Budget test Saint-Etienne',
    'project',
    'active',
    18000,
    15000,
    8000,
    3200,
    1200,
    'modere',
    'Depenses uniquement avec justificatifs.',
    'TVF OS test'
  )
  on conflict (budget_key) do update set
    budget_name = excluded.budget_name,
    status = excluded.status,
    planned_income = excluded.planned_income,
    planned_expenses = excluded.planned_expenses,
    confirmed_income = excluded.confirmed_income,
    committed_expenses = excluded.committed_expenses,
    spent_amount = excluded.spent_amount
  returning id
),
application as (
  insert into public.funding_applications (
    opportunity_id,
    funder_id,
    application_title,
    requested_amount,
    granted_amount,
    status,
    deadline_at,
    reporting_due_at,
    owner_name,
    notes
  )
  select
    opportunity.id,
    opportunity.funder_id,
    'Demande test TVF',
    12000,
    0,
    'a_deposer',
    now() + interval '30 days',
    now() + interval '180 days',
    'TVF OS',
    'Demande de financement test.'
  from opportunity
  returning id, funder_id
)
insert into public.budget_lines (
  budget_id,
  line_type,
  category,
  label,
  planned_amount,
  confirmed_amount,
  spent_amount,
  status,
  notes
)
select budget.id, 'expense', 'coordination', 'Coordination test', 5000, 1000, 600, 'confirmed', 'Ligne test coordination.'
from budget
on conflict do nothing;

insert into public.expenses (
  budget_id,
  label,
  vendor_name,
  amount,
  status,
  payment_method,
  notes
)
select id, 'Depense test sans justificatif', 'Fournisseur test', 480, 'to_approve', 'virement', 'Depense de test pour rappel justificatif.'
from public.budgets
where budget_key = 'test-budget-finances-saint-etienne'
limit 1;

insert into public.payment_records (
  provider,
  provider_payment_id,
  amount,
  currency,
  payment_status,
  paid_at,
  notes
)
values (
  'manual',
  'test-payment-finances',
  1500,
  'EUR',
  'succeeded',
  now(),
  'Paiement test module Finances.'
)
on conflict do nothing;

insert into public.finance_reports (
  report_title,
  report_type,
  status,
  due_at,
  summary,
  required_documents,
  missing_documents
)
values (
  'Reporting test financeur',
  'funder_report',
  'draft',
  now() + interval '60 days',
  'Reporting test a valider apres justificatifs.',
  array['Budget','Depenses','Justificatifs'],
  array['Justificatifs']
)
on conflict do nothing;
