-- TVF OS - Module Dossiers
-- Migration production : dossiers metier, checklist, participants, historique, risques et decisions.

create extension if not exists pgcrypto;
create sequence if not exists public.cases_number_seq;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique,
  source_request_id uuid references public.contacts(id) on delete set null,
  branch_id uuid,
  case_type text not null default 'autre',
  title text not null,
  status text not null default 'ouvert',
  priority text not null default 'normale',
  main_pole text,
  associated_poles text[] not null default '{}',
  assigned_to text,
  maturity_score integer not null default 0,
  confidentiality_level text not null default 'standard',
  summary text,
  next_action text,
  next_action_due_at timestamptz,
  decision_status text not null default 'non_preparee',
  decision_summary text,
  risk_level text not null default 'modere',
  territory text,
  ai_summary text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_type_check check (case_type in ('bien_vacant','commerce_inoccupe','materiaux','collectivite','entreprise','benevole','financeur','signalement','friche_terrain','presse','gouvernance','autre')),
  constraint cases_status_check check (status in ('ouvert','qualification','instruction','attente_pieces','visite','a_decision','decision_validee','cloture','archive')),
  constraint cases_priority_check check (priority in ('normale','haute','urgente')),
  constraint cases_maturity_check check (maturity_score >= 0 and maturity_score <= 100),
  constraint cases_confidentiality_check check (confidentiality_level in ('public','standard','confidentiel','sensible')),
  constraint cases_decision_status_check check (decision_status in ('non_preparee','a_preparer','proposee','validee','refusee','ajournee')),
  constraint cases_risk_level_check check (risk_level in ('faible','modere','eleve','critique'))
);

create table if not exists public.case_participants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  participant_type text not null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  display_name text,
  role_label text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint case_participants_type_check check (participant_type in ('contact','organization','user','external')),
  constraint case_participants_target_check check (contact_id is not null or organization_id is not null or display_name is not null)
);

create table if not exists public.case_checklist_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  checklist_key text not null,
  label text not null,
  status text not null default 'a_verifier',
  required boolean not null default true,
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(case_id, checklist_key),
  constraint case_checklist_status_check check (status in ('a_verifier','manquant','recu','valide','non_applicable'))
);

create table if not exists public.case_status_history (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_risks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  risk_label text not null,
  risk_level text not null default 'modere',
  mitigation text,
  owner text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_risks_level_check check (risk_level in ('faible','modere','eleve','critique')),
  constraint case_risks_status_check check (status in ('open','mitigated','accepted','closed'))
);

create table if not exists public.case_decisions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  decision_type text not null default 'orientation',
  proposed_decision text not null,
  final_decision text,
  decision_status text not null default 'proposee',
  decided_by text,
  decided_at timestamptz,
  next_step text,
  created_at timestamptz not null default now(),
  constraint case_decisions_type_check check (decision_type in ('orientation','poursuite','refus','cloture','convention','visite','autre')),
  constraint case_decisions_status_check check (decision_status in ('proposee','validee','refusee','ajournee'))
);

create or replace function public.tvf_case_type_pole(case_type_value text)
returns text language sql stable as $$
  select case coalesce(case_type_value, 'autre')
    when 'bien_vacant' then 'Habitat vivant'
    when 'commerce_inoccupe' then 'Habitat vivant'
    when 'friche_terrain' then 'Developpement territorial'
    when 'materiaux' then 'Materiautheque solidaire'
    when 'collectivite' then 'Developpement territorial'
    when 'entreprise' then 'Partenariats & RSE'
    when 'benevole' then 'Mobilisation citoyenne'
    when 'financeur' then 'Financement & mecenat'
    when 'presse' then 'Communication institutionnelle'
    else 'Accueil & orientation'
  end;
$$;

create or replace function public.tvf_case_maturity(case_id_value uuid)
returns integer language sql stable as $$
  with items as (
    select * from public.case_checklist_items where case_id = case_id_value and required = true
  )
  select case when count(*) = 0 then 0 else round(100.0 * count(*) filter (where status in ('recu','valide','non_applicable')) / count(*))::integer end
  from items;
$$;

create or replace function public.set_case_metadata()
returns trigger language plpgsql as $$
begin
  if new.case_number is null or new.case_number = '' then
    new.case_number := 'DOS-' || to_char(coalesce(new.opened_at, now()), 'YYYY') || '-' || lpad(nextval('public.cases_number_seq')::text, 4, '0');
  end if;
  if new.main_pole is null or new.main_pole = '' then
    new.main_pole := public.tvf_case_type_pole(new.case_type);
  end if;
  if new.next_action is null or new.next_action = '' then
    new.next_action := case
      when new.status = 'a_decision' then 'Preparer ou valider la decision humaine'
      when new.status = 'attente_pieces' then 'Relancer les pieces manquantes'
      when new.status = 'cloture' then 'Capitaliser le retour d experience'
      else 'Completer la checklist d instruction'
    end;
  end if;
  if new.next_action_due_at is null and new.status not in ('cloture','archive') then
    new.next_action_due_at := now() + case new.priority when 'urgente' then interval '1 day' when 'haute' then interval '3 days' else interval '7 days' end;
  end if;
  new.ai_summary := coalesce(nullif(new.ai_summary, ''), new.main_pole || ' - dossier ' || new.case_type || ', statut ' || new.status || '.');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_default_case_checklist()
returns trigger language plpgsql as $$
begin
  insert into public.case_checklist_items(case_id, checklist_key, label, required)
  values
    (new.id, 'identity', 'Identite et coordonnees du demandeur', true),
    (new.id, 'territory', 'Territoire ou localisation precise', true),
    (new.id, 'need', 'Description du besoin ou de la ressource', true),
    (new.id, 'documents', 'Pieces, photos ou justificatifs utiles', true),
    (new.id, 'risks', 'Risques identifies et mesures de maitrise', true),
    (new.id, 'decision', 'Decision humaine preparee et tracee', true)
  on conflict do nothing;

  if new.case_type in ('bien_vacant','commerce_inoccupe','friche_terrain') then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'ownership', 'Propriete, mandat ou autorisation clarifiee', true),
      (new.id, 'visit', 'Visite ou diagnostic terrain a organiser', false)
    on conflict do nothing;
  elsif new.case_type = 'materiaux' then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'quantity', 'Quantite, etat et conditions d enlevement', true),
      (new.id, 'reuse_fit', 'Compatibilite avec un projet TVF', true)
    on conflict do nothing;
  elsif new.case_type = 'collectivite' then
    insert into public.case_checklist_items(case_id, checklist_key, label, required)
    values
      (new.id, 'public_need', 'Besoin public ou territorial qualifie', true),
      (new.id, 'referent', 'Interlocuteur referent identifie', true)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.update_case_maturity_from_checklist()
returns trigger language plpgsql as $$
begin
  update public.cases set maturity_score = public.tvf_case_maturity(coalesce(new.case_id, old.case_id)), updated_at = now()
  where id = coalesce(new.case_id, old.case_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists set_case_metadata on public.cases;
create trigger set_case_metadata before insert or update on public.cases for each row execute function public.set_case_metadata();

drop trigger if exists create_default_case_checklist on public.cases;
create trigger create_default_case_checklist after insert on public.cases for each row execute function public.create_default_case_checklist();

drop trigger if exists update_case_maturity_from_checklist on public.case_checklist_items;
create trigger update_case_maturity_from_checklist after insert or update or delete on public.case_checklist_items for each row execute function public.update_case_maturity_from_checklist();

create index if not exists cases_status_idx on public.cases(status, priority, next_action_due_at);
create index if not exists cases_type_idx on public.cases(case_type, main_pole);
create index if not exists cases_source_request_idx on public.cases(source_request_id);
create index if not exists cases_assigned_to_idx on public.cases(assigned_to);
create index if not exists case_participants_case_idx on public.case_participants(case_id, is_primary);
create index if not exists case_checklist_case_idx on public.case_checklist_items(case_id, status);
create index if not exists case_status_history_case_idx on public.case_status_history(case_id, created_at desc);
create index if not exists case_risks_case_idx on public.case_risks(case_id, status, risk_level);
create index if not exists case_decisions_case_idx on public.case_decisions(case_id, decision_status, created_at desc);

alter table public.cases enable row level security;
alter table public.case_participants enable row level security;
alter table public.case_checklist_items enable row level security;
alter table public.case_status_history enable row level security;
alter table public.case_risks enable row level security;
alter table public.case_decisions enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF cases can read" on public.cases;
create policy "TVF cases can read" on public.cases for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF cases can manage" on public.cases;
create policy "TVF cases can manage" on public.cases for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case participants can read" on public.case_participants;
create policy "TVF case participants can read" on public.case_participants for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF case participants can manage" on public.case_participants;
create policy "TVF case participants can manage" on public.case_participants for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case checklist can read" on public.case_checklist_items;
create policy "TVF case checklist can read" on public.case_checklist_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF case checklist can manage" on public.case_checklist_items;
create policy "TVF case checklist can manage" on public.case_checklist_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case history can read" on public.case_status_history;
create policy "TVF case history can read" on public.case_status_history for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case history can manage" on public.case_status_history;
create policy "TVF case history can manage" on public.case_status_history for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case risks can read" on public.case_risks;
create policy "TVF case risks can read" on public.case_risks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case risks can manage" on public.case_risks;
create policy "TVF case risks can manage" on public.case_risks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

drop policy if exists "TVF case decisions can read" on public.case_decisions;
create policy "TVF case decisions can read" on public.case_decisions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','auditor'));
drop policy if exists "TVF case decisions can manage" on public.case_decisions;
create policy "TVF case decisions can manage" on public.case_decisions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager'));

comment on table public.cases is 'TVF OS - dossiers metier suivis jusqu a decision ou cloture.';
comment on table public.case_checklist_items is 'TVF OS - checklist dynamique d instruction par dossier.';
comment on table public.case_decisions is 'TVF OS - decisions humaines rattachees aux dossiers.';
