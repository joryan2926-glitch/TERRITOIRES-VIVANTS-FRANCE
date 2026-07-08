-- TVF OS - Module Finances
-- Migration production : budgets, depenses, financeurs, paiements, Stripe et reporting.

create extension if not exists pgcrypto;

create table if not exists public.funders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  contact_id uuid,
  funder_name text not null,
  funder_type text not null default 'other',
  status text not null default 'prospect',
  priority_level text not null default 'moyen',
  territory_label text,
  contact_email text,
  website text,
  notes text,
  tags text[] not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funders_type_check check (funder_type in ('public','private','foundation','corporate','individual','institution','other')),
  constraint funders_status_check check (status in ('prospect','active','paused','archive')),
  constraint funders_priority_check check (priority_level in ('faible','moyen','fort','critique'))
);

create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  funder_id uuid references public.funders(id) on delete set null,
  opportunity_key text unique,
  title text not null,
  opportunity_type text not null default 'grant',
  status text not null default 'veille',
  amount_min numeric(12,2),
  amount_max numeric(12,2),
  deadline_at timestamptz,
  url text,
  territory_label text,
  eligibility_notes text,
  restrictions text,
  priority_score integer not null default 35,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funding_opportunities_type_check check (opportunity_type in ('grant','sponsorship','call_for_projects','donation','public_subsidy','loan','other')),
  constraint funding_opportunities_status_check check (status in ('veille','a_qualifier','eligible','candidature','en_attente','accepte','refuse','archive')),
  constraint funding_opportunities_priority_score_check check (priority_score >= 0 and priority_score <= 100),
  constraint funding_opportunities_amount_check check ((amount_min is null or amount_min >= 0) and (amount_max is null or amount_max >= 0))
);

create table if not exists public.funding_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.funding_opportunities(id) on delete set null,
  funder_id uuid references public.funders(id) on delete set null,
  branch_id uuid,
  related_project_id uuid,
  related_case_id uuid,
  application_title text not null,
  requested_amount numeric(12,2) not null default 0,
  granted_amount numeric(12,2),
  status text not null default 'brouillon',
  deadline_at timestamptz,
  submitted_at timestamptz,
  decision_at timestamptz,
  reporting_due_at timestamptz,
  owner_name text,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funding_applications_status_check check (status in ('brouillon','a_deposer','deposee','en_instruction','acceptee','refusee','archive')),
  constraint funding_applications_amount_check check (requested_amount >= 0 and (granted_amount is null or granted_amount >= 0))
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  budget_key text unique,
  branch_id uuid,
  related_project_id uuid,
  related_case_id uuid,
  budget_name text not null,
  budget_type text not null default 'project',
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  planned_income numeric(12,2) not null default 0,
  planned_expenses numeric(12,2) not null default 0,
  confirmed_income numeric(12,2) not null default 0,
  committed_expenses numeric(12,2) not null default 0,
  spent_amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  risk_level text not null default 'modere',
  restrictions text,
  ai_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_type_check check (budget_type in ('project','branch','national','action','grant')),
  constraint budgets_status_check check (status in ('draft','active','to_review','closed','archive')),
  constraint budgets_risk_check check (risk_level in ('faible','modere','eleve','critique')),
  constraint budgets_amount_check check (planned_income >= 0 and planned_expenses >= 0 and confirmed_income >= 0 and committed_expenses >= 0 and spent_amount >= 0)
);

create table if not exists public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  line_type text not null default 'expense',
  category text,
  label text not null,
  planned_amount numeric(12,2) not null default 0,
  confirmed_amount numeric(12,2) not null default 0,
  spent_amount numeric(12,2) not null default 0,
  funding_source_id uuid references public.funders(id) on delete set null,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_lines_type_check check (line_type in ('income','expense')),
  constraint budget_lines_status_check check (status in ('planned','confirmed','spent','cancelled')),
  constraint budget_lines_amount_check check (planned_amount >= 0 and confirmed_amount >= 0 and spent_amount >= 0)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid references public.budgets(id) on delete set null,
  budget_line_id uuid references public.budget_lines(id) on delete set null,
  branch_id uuid,
  related_project_id uuid,
  expense_date timestamptz not null default now(),
  vendor_name text,
  label text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  tax_amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  payment_method text,
  receipt_document_id uuid,
  approved_by text,
  paid_at timestamptz,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_status_check check (status in ('draft','to_approve','approved','paid','rejected','archive')),
  constraint expenses_amount_check check (amount >= 0 and tax_amount >= 0)
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'manual',
  provider_payment_id text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  payment_status text not null default 'pending',
  payer_contact_id uuid,
  payer_organization_id uuid,
  related_project_id uuid,
  related_branch_id uuid,
  receipt_document_id uuid,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_records_status_check check (payment_status in ('pending','succeeded','failed','refunded','cancelled')),
  constraint payment_records_amount_check check (amount >= 0)
);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  processing_status text not null default 'received',
  error_message text,
  created_at timestamptz not null default now(),
  constraint stripe_events_status_check check (processing_status in ('received','processed','ignored','failed'))
);

create table if not exists public.finance_reports (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  related_project_id uuid,
  funder_id uuid references public.funders(id) on delete set null,
  application_id uuid references public.funding_applications(id) on delete set null,
  report_title text not null,
  report_type text not null default 'funder_report',
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  due_at timestamptz,
  sent_at timestamptz,
  summary text,
  required_documents text[] not null default '{}',
  missing_documents text[] not null default '{}',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_reports_type_check check (report_type in ('funder_report','budget_review','expense_summary','grant_report')),
  constraint finance_reports_status_check check (status in ('draft','to_send','sent','validated','archive'))
);

create or replace function public.set_finance_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_opportunity_metadata()
returns trigger language plpgsql as $$
declare
  days_left integer;
begin
  if new.priority_score is null then
    new.priority_score := 35;
  end if;
  if new.status in ('eligible','candidature','en_attente') then
    new.priority_score := greatest(new.priority_score, 58);
  elsif new.status = 'a_qualifier' then
    new.priority_score := greatest(new.priority_score, 45);
  end if;
  if coalesce(new.amount_max, new.amount_min, 0) >= 50000 then
    new.priority_score := least(100, new.priority_score + 16);
  elsif coalesce(new.amount_max, new.amount_min, 0) >= 10000 then
    new.priority_score := least(100, new.priority_score + 10);
  end if;
  if new.deadline_at is not null then
    days_left := ceil(extract(epoch from (new.deadline_at - now())) / 86400.0);
    if days_left <= 7 then
      new.priority_score := least(100, new.priority_score + 22);
    elsif days_left <= 30 then
      new.priority_score := least(100, new.priority_score + 14);
    end if;
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.title || ' - financement ' || new.status || ', score ' || new.priority_score || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_budget_metadata()
returns trigger language plpgsql as $$
begin
  if new.planned_expenses > 0 and new.spent_amount > new.planned_expenses then
    new.risk_level := 'critique';
    new.status := case when new.status = 'archive' then 'archive' else 'to_review' end;
  elsif new.planned_expenses > 0 and new.committed_expenses > new.planned_expenses then
    new.risk_level := 'eleve';
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.budget_name || ' - budget ' || new.status || ', depenses prevues ' || new.planned_expenses || ' ' || new.currency || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_finance_expense_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'paid' and new.paid_at is null then
    new.paid_at := now();
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.label || ' - depense ' || new.status || ', montant ' || new.amount || ' ' || new.currency || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_funders_updated_at on public.funders;
create trigger set_funders_updated_at before insert or update on public.funders for each row execute function public.set_finance_updated_at();
drop trigger if exists set_funding_opportunity_metadata on public.funding_opportunities;
create trigger set_funding_opportunity_metadata before insert or update on public.funding_opportunities for each row execute function public.set_finance_opportunity_metadata();
drop trigger if exists set_funding_applications_updated_at on public.funding_applications;
create trigger set_funding_applications_updated_at before insert or update on public.funding_applications for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_budget_metadata on public.budgets;
create trigger set_finance_budget_metadata before insert or update on public.budgets for each row execute function public.set_finance_budget_metadata();
drop trigger if exists set_budget_lines_updated_at on public.budget_lines;
create trigger set_budget_lines_updated_at before insert or update on public.budget_lines for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_expense_metadata on public.expenses;
create trigger set_finance_expense_metadata before insert or update on public.expenses for each row execute function public.set_finance_expense_metadata();
drop trigger if exists set_payment_records_updated_at on public.payment_records;
create trigger set_payment_records_updated_at before insert or update on public.payment_records for each row execute function public.set_finance_updated_at();
drop trigger if exists set_finance_reports_updated_at on public.finance_reports;
create trigger set_finance_reports_updated_at before insert or update on public.finance_reports for each row execute function public.set_finance_updated_at();

create index if not exists funders_status_idx on public.funders(status, funder_type, priority_level);
create index if not exists funders_organization_idx on public.funders(organization_id, contact_id);
create index if not exists funding_opportunities_status_idx on public.funding_opportunities(status, priority_score desc, deadline_at);
create index if not exists funding_opportunities_funder_idx on public.funding_opportunities(funder_id);
create index if not exists funding_applications_status_idx on public.funding_applications(status, deadline_at, reporting_due_at);
create index if not exists funding_applications_funder_idx on public.funding_applications(funder_id, opportunity_id);
create index if not exists budgets_status_idx on public.budgets(status, budget_type, risk_level);
create index if not exists budgets_related_idx on public.budgets(branch_id, related_project_id, related_case_id);
create index if not exists budget_lines_budget_idx on public.budget_lines(budget_id, line_type, status);
create index if not exists expenses_status_idx on public.expenses(status, expense_date desc);
create index if not exists expenses_budget_idx on public.expenses(budget_id, budget_line_id);
create index if not exists expenses_receipt_idx on public.expenses(receipt_document_id) where receipt_document_id is null;
create index if not exists payment_records_status_idx on public.payment_records(payment_status, provider, created_at desc);
create index if not exists stripe_events_type_idx on public.stripe_events(event_type, processing_status, created_at desc);
create index if not exists finance_reports_status_idx on public.finance_reports(status, due_at);
create index if not exists finance_reports_related_idx on public.finance_reports(funder_id, application_id, related_project_id);

alter table public.funders enable row level security;
alter table public.funding_opportunities enable row level security;
alter table public.funding_applications enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_lines enable row level security;
alter table public.expenses enable row level security;
alter table public.payment_records enable row level security;
alter table public.stripe_events enable row level security;
alter table public.finance_reports enable row level security;

drop policy if exists "TVF finances funders can read" on public.funders;
create policy "TVF finances funders can read" on public.funders for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances funders can manage" on public.funders;
create policy "TVF finances funders can manage" on public.funders for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances opportunities can read" on public.funding_opportunities;
create policy "TVF finances opportunities can read" on public.funding_opportunities for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances opportunities can manage" on public.funding_opportunities;
create policy "TVF finances opportunities can manage" on public.funding_opportunities for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances applications can read" on public.funding_applications;
create policy "TVF finances applications can read" on public.funding_applications for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances applications can manage" on public.funding_applications;
create policy "TVF finances applications can manage" on public.funding_applications for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances budgets can read" on public.budgets;
create policy "TVF finances budgets can read" on public.budgets for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances budgets can manage" on public.budgets;
create policy "TVF finances budgets can manage" on public.budgets for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances budget lines can read" on public.budget_lines;
create policy "TVF finances budget lines can read" on public.budget_lines for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances budget lines can manage" on public.budget_lines;
create policy "TVF finances budget lines can manage" on public.budget_lines for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances expenses can read" on public.expenses;
create policy "TVF finances expenses can read" on public.expenses for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances expenses can manage" on public.expenses;
create policy "TVF finances expenses can manage" on public.expenses for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

drop policy if exists "TVF finances payments can read" on public.payment_records;
create policy "TVF finances payments can read" on public.payment_records for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','auditor'));
drop policy if exists "TVF finances payments can manage" on public.payment_records;
create policy "TVF finances payments can manage" on public.payment_records for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager'));

drop policy if exists "TVF finances stripe events can read" on public.stripe_events;
create policy "TVF finances stripe events can read" on public.stripe_events for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','auditor'));
drop policy if exists "TVF finances stripe events can manage" on public.stripe_events;
create policy "TVF finances stripe events can manage" on public.stripe_events for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager'));

drop policy if exists "TVF finances reports can read" on public.finance_reports;
create policy "TVF finances reports can read" on public.finance_reports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','finance_manager','case_manager','auditor'));
drop policy if exists "TVF finances reports can manage" on public.finance_reports;
create policy "TVF finances reports can manage" on public.finance_reports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','finance_manager','branch_manager'));

insert into public.funders (funder_name, funder_type, status, priority_level, territory_label, notes, tags, created_by)
values
  ('Financeur public a qualifier', 'public', 'prospect', 'moyen', 'France', 'Seed de reference pour les financements publics.', array['public','subvention'], 'TVF OS'),
  ('Mecene entreprise a qualifier', 'corporate', 'prospect', 'moyen', 'France', 'Seed de reference pour le mecenat et la RSE.', array['mecenat','rse'], 'TVF OS')
on conflict do nothing;

comment on table public.funders is 'TVF OS - financeurs, mecenes et partenaires financiers.';
comment on table public.funding_opportunities is 'TVF OS - appels a projets, subventions et dispositifs de financement.';
comment on table public.funding_applications is 'TVF OS - demandes de financement et candidatures.';
comment on table public.budgets is 'TVF OS - budgets projet, antenne, national ou action.';
comment on table public.budget_lines is 'TVF OS - lignes budgetaires recettes et depenses.';
comment on table public.expenses is 'TVF OS - depenses, engagements, justificatifs et validations.';
comment on table public.payment_records is 'TVF OS - paiements, dons, cotisations et transactions Stripe ou manuelles.';
comment on table public.stripe_events is 'TVF OS - journal des webhooks Stripe.';
comment on table public.finance_reports is 'TVF OS - reporting financeur, budgetaire et justificatif.';

