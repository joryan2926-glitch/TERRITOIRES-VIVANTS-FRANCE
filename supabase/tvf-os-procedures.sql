-- TVF OS - Module Procedures
-- Migration production : procedures, etapes, versions, applications et assistant Q/R.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  procedure_key text not null unique,
  title text not null,
  scope text not null default 'national',
  module_key text,
  pole text,
  branch_id uuid,
  status text not null default 'brouillon',
  version integer not null default 1,
  mandatory_level text not null default 'recommande',
  content_document_id uuid references public.documents(id) on delete set null,
  owner_label text,
  reviewed_at timestamptz,
  next_review_at timestamptz,
  summary text,
  ai_summary text,
  tags text[] not null default '{}',
  related_template_keys text[] not null default '{}',
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(module_key,'') || ' ' || coalesce(pole,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint procedures_scope_check check (scope in ('national','local','pole','module')),
  constraint procedures_status_check check (status in ('brouillon','active','en_revision','remplacee','archivee')),
  constraint procedures_mandatory_check check (mandatory_level in ('obligatoire','recommande','optionnel','experimental')),
  constraint procedures_version_check check (version >= 1)
);

create table if not exists public.procedure_steps (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  step_order integer not null default 1,
  title text not null,
  step_type text not null default 'verification',
  description text,
  required boolean not null default true,
  evidence_required boolean not null default false,
  expected_document_type text,
  responsible_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(procedure_id, step_order),
  constraint procedure_steps_type_check check (step_type in ('information','verification','decision','document','validation','action','risque')),
  constraint procedure_steps_order_check check (step_order >= 1)
);

create table if not exists public.procedure_versions (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  version integer not null,
  status text not null,
  summary text,
  content_snapshot jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  unique(procedure_id, version),
  constraint procedure_versions_version_check check (version >= 1)
);

create table if not exists public.procedure_applications (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  related_object_type text not null default 'case',
  related_object_id uuid,
  assigned_to text,
  status text not null default 'active',
  completion_rate integer not null default 0,
  due_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint procedure_applications_related_check check (related_object_type in ('case','request','contact','organization','project','branch','none')),
  constraint procedure_applications_status_check check (status in ('active','terminee','bloquee','annulee')),
  constraint procedure_applications_completion_check check (completion_rate >= 0 and completion_rate <= 100)
);

create table if not exists public.procedure_step_instances (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.procedure_applications(id) on delete cascade,
  procedure_step_id uuid references public.procedure_steps(id) on delete set null,
  step_order integer not null default 1,
  title text not null,
  required boolean not null default true,
  evidence_required boolean not null default false,
  status text not null default 'a_faire',
  notes text,
  evidence_document_id uuid references public.documents(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint procedure_step_instances_status_check check (status in ('a_faire','en_cours','termine','bloque','non_applicable'))
);

create table if not exists public.procedure_questions (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references public.procedures(id) on delete set null,
  question text not null,
  answer text not null,
  sources text[] not null default '{}',
  confidence numeric(4,2) not null default 0.50,
  created_by text,
  created_at timestamptz not null default now(),
  constraint procedure_questions_confidence_check check (confidence >= 0 and confidence <= 1)
);

create or replace function public.tvf_slugify(value text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(value, 'procedure'))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_procedure_metadata()
returns trigger language plpgsql as $$
begin
  if new.procedure_key is null or new.procedure_key = '' then
    new.procedure_key := lower(regexp_replace(new.scope || '-' || new.title, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  if new.next_review_at is null then
    new.next_review_at := now() + case new.mandatory_level when 'obligatoire' then interval '6 months' else interval '12 months' end;
  end if;
  if new.status = 'active' and new.reviewed_at is null then
    new.reviewed_at := now();
  end if;
  new.ai_summary := coalesce(nullif(new.ai_summary, ''), new.title || ' - procedure ' || new.mandatory_level || '.');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_procedure_step_metadata()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_initial_procedure_version()
returns trigger language plpgsql as $$
begin
  insert into public.procedure_versions(procedure_id, version, status, summary, content_snapshot, created_by)
  values (new.id, new.version, new.status, new.summary, jsonb_build_object('title', new.title, 'scope', new.scope, 'mandatory_level', new.mandatory_level), 'TVF OS')
  on conflict do nothing;
  return new;
end;
$$;

create or replace function public.create_application_step_instances()
returns trigger language plpgsql as $$
begin
  insert into public.procedure_step_instances(application_id, procedure_step_id, step_order, title, required, evidence_required)
  select new.id, s.id, s.step_order, s.title, s.required, s.evidence_required
  from public.procedure_steps s
  where s.procedure_id = new.procedure_id
  order by s.step_order
  on conflict do nothing;
  return new;
end;
$$;

create or replace function public.tvf_application_completion(application_id_value uuid)
returns integer language sql stable as $$
  with items as (
    select * from public.procedure_step_instances where application_id = application_id_value and required = true
  )
  select case when count(*) = 0 then 0 else round(100.0 * count(*) filter (where status in ('termine','non_applicable')) / count(*))::integer end
  from items;
$$;

create or replace function public.update_application_completion()
returns trigger language plpgsql as $$
declare
  app_id uuid;
  completion integer;
begin
  app_id := coalesce(new.application_id, old.application_id);
  completion := public.tvf_application_completion(app_id);
  update public.procedure_applications
  set completion_rate = completion,
      status = case
        when exists (select 1 from public.procedure_step_instances where application_id = app_id and status = 'bloque') then 'bloquee'
        when completion >= 100 then 'terminee'
        else 'active'
      end,
      completed_at = case when completion >= 100 then now() else null end,
      updated_at = now()
  where id = app_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists set_procedure_metadata on public.procedures;
create trigger set_procedure_metadata before insert or update on public.procedures for each row execute function public.set_procedure_metadata();

drop trigger if exists set_procedure_step_metadata on public.procedure_steps;
create trigger set_procedure_step_metadata before insert or update on public.procedure_steps for each row execute function public.set_procedure_step_metadata();

drop trigger if exists create_initial_procedure_version on public.procedures;
create trigger create_initial_procedure_version after insert on public.procedures for each row execute function public.create_initial_procedure_version();

drop trigger if exists create_application_step_instances on public.procedure_applications;
create trigger create_application_step_instances after insert on public.procedure_applications for each row execute function public.create_application_step_instances();

drop trigger if exists update_application_completion on public.procedure_step_instances;
create trigger update_application_completion after insert or update or delete on public.procedure_step_instances for each row execute function public.update_application_completion();

create index if not exists procedures_status_idx on public.procedures(status, scope, mandatory_level);
create index if not exists procedures_review_idx on public.procedures(next_review_at, status);
create index if not exists procedures_search_idx on public.procedures using gin(search_vector);
create index if not exists procedure_steps_procedure_idx on public.procedure_steps(procedure_id, step_order);
create index if not exists procedure_versions_procedure_idx on public.procedure_versions(procedure_id, version desc);
create index if not exists procedure_applications_procedure_idx on public.procedure_applications(procedure_id, status);
create index if not exists procedure_applications_object_idx on public.procedure_applications(related_object_type, related_object_id);
create index if not exists procedure_step_instances_application_idx on public.procedure_step_instances(application_id, status, step_order);
create index if not exists procedure_questions_procedure_idx on public.procedure_questions(procedure_id, created_at desc);

alter table public.procedures enable row level security;
alter table public.procedure_steps enable row level security;
alter table public.procedure_versions enable row level security;
alter table public.procedure_applications enable row level security;
alter table public.procedure_step_instances enable row level security;
alter table public.procedure_questions enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF procedures can read" on public.procedures;
create policy "TVF procedures can read" on public.procedures for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','document_manager','auditor'));
drop policy if exists "TVF procedures can manage" on public.procedures;
create policy "TVF procedures can manage" on public.procedures for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager'));

drop policy if exists "TVF procedure steps can read" on public.procedure_steps;
create policy "TVF procedure steps can read" on public.procedure_steps for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','document_manager','auditor'));
drop policy if exists "TVF procedure steps can manage" on public.procedure_steps;
create policy "TVF procedure steps can manage" on public.procedure_steps for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager'));

drop policy if exists "TVF procedure versions can read" on public.procedure_versions;
create policy "TVF procedure versions can read" on public.procedure_versions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','auditor'));
drop policy if exists "TVF procedure versions can manage" on public.procedure_versions;
create policy "TVF procedure versions can manage" on public.procedure_versions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','procedure_manager'));

drop policy if exists "TVF procedure applications can read" on public.procedure_applications;
create policy "TVF procedure applications can read" on public.procedure_applications for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','auditor'));
drop policy if exists "TVF procedure applications can manage" on public.procedure_applications;
create policy "TVF procedure applications can manage" on public.procedure_applications for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager'));

drop policy if exists "TVF procedure step instances can read" on public.procedure_step_instances;
create policy "TVF procedure step instances can read" on public.procedure_step_instances for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','auditor'));
drop policy if exists "TVF procedure step instances can manage" on public.procedure_step_instances;
create policy "TVF procedure step instances can manage" on public.procedure_step_instances for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager'));

drop policy if exists "TVF procedure questions can read" on public.procedure_questions;
create policy "TVF procedure questions can read" on public.procedure_questions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','auditor'));
drop policy if exists "TVF procedure questions can manage" on public.procedure_questions;
create policy "TVF procedure questions can manage" on public.procedure_questions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager'));

comment on table public.procedures is 'TVF OS - procedures nationales, locales, par pole ou par module.';
comment on table public.procedure_applications is 'TVF OS - application active d une procedure a un dossier ou objet metier.';
comment on table public.procedure_questions is 'TVF OS - questions reponses IA deterministes sur les procedures.';
