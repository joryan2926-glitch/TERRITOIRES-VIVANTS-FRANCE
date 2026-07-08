-- TVF OS - Module Risques et conformite
-- Migration production : risques, conformite, incidents, autorisations et journal d'audit.

create extension if not exists pgcrypto;

create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  risk_key text unique,
  risk_type text not null default 'operational',
  severity text not null default 'medium',
  likelihood text not null default 'possible',
  status text not null default 'open',
  title text not null,
  description text,
  mitigation_plan text,
  owner_name text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  due_at timestamptz,
  reviewed_at timestamptz,
  ai_summary text,
  created_by text not null default 'TVF OS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint risks_type_check check (risk_type in ('rgpd','image_rights','visit_authorization','insurance','field_safety','conflict_interest','sensitive_data','financial','legal','operational','incident','other')),
  constraint risks_severity_check check (severity in ('low','medium','high','critical')),
  constraint risks_likelihood_check check (likelihood in ('rare','possible','likely','almost_certain')),
  constraint risks_status_check check (status in ('open','mitigating','blocked','accepted','resolved','closed','archive')),
  constraint risks_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  check_key text,
  check_type text not null default 'rgpd',
  title text not null,
  status text not null default 'missing',
  required boolean not null default true,
  blocking boolean not null default false,
  related_object_type text not null default 'none',
  related_object_id uuid,
  evidence_document_id uuid,
  owner_name text,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compliance_checks_unique unique (branch_id, check_key, related_object_type, related_object_id),
  constraint compliance_checks_type_check check (check_type in ('rgpd','image_rights','visit_authorization','insurance','field_safety','conflict_interest','publication','document','audit','other')),
  constraint compliance_checks_status_check check (status in ('missing','to_review','valid','expired','rejected','waived','archive')),
  constraint compliance_checks_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  incident_key text unique,
  incident_type text not null default 'operational',
  severity text not null default 'medium',
  status text not null default 'new',
  title text not null,
  description text,
  occurred_at timestamptz,
  reported_by text,
  owner_name text,
  immediate_actions text,
  corrective_actions text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  closed_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incidents_type_check check (incident_type in ('rgpd','security','field','insurance','image_rights','conflict_interest','financial','operational','other')),
  constraint incidents_severity_check check (severity in ('low','medium','high','critical')),
  constraint incidents_status_check check (status in ('new','triage','investigating','corrective_action','closed','archive')),
  constraint incidents_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','procedure','knowledge','branch','project','finance','impact','decision','committee'))
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  person_name text not null,
  consent_type text not null default 'data_processing',
  status text not null default 'pending',
  related_object_type text not null default 'none',
  related_object_id uuid,
  evidence_document_id uuid,
  valid_from date,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_records_type_check check (consent_type in ('data_processing','image_rights','visit_authorization','newsletter','minor_authorization','other')),
  constraint consent_records_status_check check (status in ('pending','valid','expired','revoked','rejected','archive')),
  constraint consent_records_related_type_check check (related_object_type in ('none','request','case','contact','organization','document','branch','project','event'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_name text,
  action text not null,
  object_type text not null,
  object_id uuid,
  branch_id uuid,
  severity text not null default 'info',
  before_snapshot jsonb,
  after_snapshot jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_severity_check check (severity in ('info','notice','warning','critical'))
);

create or replace function public.tvf_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists risks_set_updated_at on public.risks;
create trigger risks_set_updated_at before update on public.risks for each row execute function public.tvf_set_updated_at();
drop trigger if exists compliance_checks_set_updated_at on public.compliance_checks;
create trigger compliance_checks_set_updated_at before update on public.compliance_checks for each row execute function public.tvf_set_updated_at();
drop trigger if exists incidents_set_updated_at on public.incidents;
create trigger incidents_set_updated_at before update on public.incidents for each row execute function public.tvf_set_updated_at();
drop trigger if exists consent_records_set_updated_at on public.consent_records;
create trigger consent_records_set_updated_at before update on public.consent_records for each row execute function public.tvf_set_updated_at();

create index if not exists risks_status_idx on public.risks(status, severity);
create index if not exists risks_branch_idx on public.risks(branch_id, risk_type);
create index if not exists compliance_checks_status_idx on public.compliance_checks(status, blocking);
create index if not exists compliance_checks_branch_idx on public.compliance_checks(branch_id, check_type);
create index if not exists incidents_status_idx on public.incidents(status, severity);
create index if not exists consent_records_status_idx on public.consent_records(status, consent_type);
create index if not exists audit_logs_object_idx on public.audit_logs(object_type, object_id, created_at desc);

alter table public.risks enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.incidents enable row level security;
alter table public.consent_records enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "TVF risks can read" on public.risks;
create policy "TVF risks can read" on public.risks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF risks can manage" on public.risks;
create policy "TVF risks can manage" on public.risks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF compliance checks can read" on public.compliance_checks;
create policy "TVF compliance checks can read" on public.compliance_checks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF compliance checks can manage" on public.compliance_checks;
create policy "TVF compliance checks can manage" on public.compliance_checks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF incidents can read" on public.incidents;
create policy "TVF incidents can read" on public.incidents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF incidents can manage" on public.incidents;
create policy "TVF incidents can manage" on public.incidents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF consent records can read" on public.consent_records;
create policy "TVF consent records can read" on public.consent_records for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF consent records can manage" on public.consent_records;
create policy "TVF consent records can manage" on public.consent_records for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','risk_manager','compliance_manager'));

drop policy if exists "TVF audit logs can read" on public.audit_logs;
create policy "TVF audit logs can read" on public.audit_logs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','risk_manager','compliance_manager','auditor'));
drop policy if exists "TVF audit logs can insert" on public.audit_logs;
create policy "TVF audit logs can insert" on public.audit_logs for insert with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','risk_manager','compliance_manager'));
