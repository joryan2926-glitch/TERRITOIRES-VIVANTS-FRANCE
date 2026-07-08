-- TVF OS - Module Impact et statistiques
-- Migration production : indicateurs, valeurs, preuves, bilans et exports.

create extension if not exists pgcrypto;

create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text unique,
  metric_name text not null,
  metric_type text not null default 'impact',
  metric_scope text not null default 'national',
  unit text,
  description text,
  calculation_method text,
  status text not null default 'active',
  required_proof_type text,
  ai_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_metrics_type_check check (metric_type in ('activity','impact','finance','territory','volunteer','material','partner','case','other')),
  constraint impact_metrics_scope_check check (metric_scope in ('national','branch','pole','project','case')),
  constraint impact_metrics_status_check check (status in ('active','draft','archive'))
);

create table if not exists public.impact_proofs (
  id uuid primary key default gen_random_uuid(),
  proof_title text not null,
  proof_type text not null default 'document',
  status text not null default 'pending',
  document_id uuid,
  url text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  confidentiality_level text not null default 'interne',
  checked_by text,
  checked_at timestamptz,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_proofs_type_check check (proof_type in ('document','photo','report','invoice','attendance','decision','external_source','other')),
  constraint impact_proofs_status_check check (status in ('pending','validated','rejected','archive')),
  constraint impact_proofs_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible'))
);

create table if not exists public.impact_values (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references public.impact_metrics(id) on delete cascade,
  branch_id uuid,
  pole_key text,
  related_project_id uuid,
  related_case_id uuid,
  period_start timestamptz,
  period_end timestamptz,
  value_numeric numeric(14,2) not null default 0,
  value_text text,
  before_value numeric(14,2) not null default 0,
  after_value numeric(14,2) not null default 0,
  status text not null default 'draft',
  reliability_level text not null default 'moyen',
  proof_id uuid references public.impact_proofs(id) on delete set null,
  source_label text,
  notes text,
  validated_by text,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_values_status_check check (status in ('draft','validated','rejected','archive')),
  constraint impact_values_reliability_check check (reliability_level in ('faible','moyen','fort','verifie'))
);

create table if not exists public.impact_reports (
  id uuid primary key default gen_random_uuid(),
  report_title text not null,
  report_type text not null default 'national',
  branch_id uuid,
  pole_key text,
  related_project_id uuid,
  period_start timestamptz,
  period_end timestamptz,
  status text not null default 'draft',
  summary text,
  metric_ids text[] not null default '{}',
  proof_ids text[] not null default '{}',
  generated_by text,
  validated_by text,
  validated_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_reports_type_check check (report_type in ('national','branch','pole','project','funder','public')),
  constraint impact_reports_status_check check (status in ('draft','to_validate','validated','published','archive'))
);

create table if not exists public.impact_exports (
  id uuid primary key default gen_random_uuid(),
  export_title text not null,
  export_format text not null default 'csv',
  status text not null default 'queued',
  filters jsonb not null default '{}'::jsonb,
  file_url text,
  generated_by text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_exports_status_check check (status in ('queued','ready','failed','expired'))
);

create or replace function public.set_impact_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_value_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'validated' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.status = 'validated' and new.proof_id is not null then
    new.reliability_level := case when new.reliability_level in ('faible','moyen') then 'fort' else new.reliability_level end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_proof_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'validated' and new.checked_at is null then
    new.checked_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_impact_report_metadata()
returns trigger language plpgsql as $$
begin
  if new.status in ('validated','published') and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.report_title || ' - bilan ' || new.status || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_impact_metrics_updated_at on public.impact_metrics;
create trigger set_impact_metrics_updated_at before insert or update on public.impact_metrics for each row execute function public.set_impact_updated_at();
drop trigger if exists set_impact_value_metadata on public.impact_values;
create trigger set_impact_value_metadata before insert or update on public.impact_values for each row execute function public.set_impact_value_metadata();
drop trigger if exists set_impact_proof_metadata on public.impact_proofs;
create trigger set_impact_proof_metadata before insert or update on public.impact_proofs for each row execute function public.set_impact_proof_metadata();
drop trigger if exists set_impact_report_metadata on public.impact_reports;
create trigger set_impact_report_metadata before insert or update on public.impact_reports for each row execute function public.set_impact_report_metadata();
drop trigger if exists set_impact_exports_updated_at on public.impact_exports;
create trigger set_impact_exports_updated_at before insert or update on public.impact_exports for each row execute function public.set_impact_updated_at();

create index if not exists impact_metrics_type_idx on public.impact_metrics(metric_type, metric_scope, status);
create index if not exists impact_values_metric_idx on public.impact_values(metric_id, status, reliability_level);
create index if not exists impact_values_scope_idx on public.impact_values(branch_id, pole_key, related_project_id, related_case_id);
create index if not exists impact_values_period_idx on public.impact_values(period_start, period_end);
create index if not exists impact_proofs_status_idx on public.impact_proofs(status, proof_type, checked_at);
create index if not exists impact_proofs_related_idx on public.impact_proofs(related_object_type, related_object_id);
create index if not exists impact_reports_status_idx on public.impact_reports(status, report_type, updated_at desc);
create index if not exists impact_reports_scope_idx on public.impact_reports(branch_id, pole_key, related_project_id);
create index if not exists impact_exports_status_idx on public.impact_exports(status, export_format, created_at desc);

alter table public.impact_metrics enable row level security;
alter table public.impact_values enable row level security;
alter table public.impact_proofs enable row level security;
alter table public.impact_reports enable row level security;
alter table public.impact_exports enable row level security;

drop policy if exists "TVF impact metrics can read" on public.impact_metrics;
create policy "TVF impact metrics can read" on public.impact_metrics for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact metrics can manage" on public.impact_metrics;
create policy "TVF impact metrics can manage" on public.impact_metrics for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact values can read" on public.impact_values;
create policy "TVF impact values can read" on public.impact_values for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact values can manage" on public.impact_values;
create policy "TVF impact values can manage" on public.impact_values for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact proofs can read" on public.impact_proofs;
create policy "TVF impact proofs can read" on public.impact_proofs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','case_manager','finance_manager','auditor'));
drop policy if exists "TVF impact proofs can manage" on public.impact_proofs;
create policy "TVF impact proofs can manage" on public.impact_proofs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact reports can read" on public.impact_reports;
create policy "TVF impact reports can read" on public.impact_reports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','finance_manager','auditor'));
drop policy if exists "TVF impact reports can manage" on public.impact_reports;
create policy "TVF impact reports can manage" on public.impact_reports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

drop policy if exists "TVF impact exports can read" on public.impact_exports;
create policy "TVF impact exports can read" on public.impact_exports for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','impact_manager','finance_manager','auditor'));
drop policy if exists "TVF impact exports can manage" on public.impact_exports;
create policy "TVF impact exports can manage" on public.impact_exports for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','impact_manager','branch_manager'));

insert into public.impact_metrics (metric_key, metric_name, metric_type, metric_scope, unit, description, calculation_method, status, required_proof_type, created_by)
values
  ('demandes-recues', 'Demandes recues', 'activity', 'national', 'demandes', 'Nombre de demandes entrantes recues.', 'Compter uniquement les demandes enregistrees.', 'active', 'report', 'TVF OS'),
  ('dossiers-qualifies', 'Dossiers qualifies', 'case', 'national', 'dossiers', 'Dossiers qualifies avec decision ou suite claire.', 'Compter les dossiers valides.', 'active', 'decision', 'TVF OS'),
  ('heures-benevoles', 'Heures benevoles', 'volunteer', 'branch', 'heures', 'Heures benevoles documentees.', 'Somme des emargements valides.', 'active', 'attendance', 'TVF OS'),
  ('financements-obtenus', 'Financements obtenus', 'finance', 'national', 'EUR', 'Financements confirmes et documentes.', 'Somme des montants acceptes avec preuve.', 'active', 'document', 'TVF OS')
on conflict (metric_key) do update set metric_name = excluded.metric_name, metric_type = excluded.metric_type, metric_scope = excluded.metric_scope, unit = excluded.unit, description = excluded.description, calculation_method = excluded.calculation_method, status = excluded.status, required_proof_type = excluded.required_proof_type;

comment on table public.impact_metrics is 'TVF OS - definitions des indicateurs d activite et d impact.';
comment on table public.impact_values is 'TVF OS - valeurs d impact, exclues des bilans tant qu elles ne sont pas validees.';
comment on table public.impact_proofs is 'TVF OS - preuves documentaires associees aux resultats.';
comment on table public.impact_reports is 'TVF OS - bilans d impact et statistiques exportables.';
comment on table public.impact_exports is 'TVF OS - exports impact et statistiques.';
