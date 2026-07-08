-- TVF OS - Module Assistant IA global
-- Migration production : interactions, suggestions, feedback et automatisations IA.

create extension if not exists pgcrypto;

create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  user_label text,
  context_object_type text not null default 'none',
  context_object_id uuid,
  interaction_type text not null default 'question',
  prompt text not null,
  prompt_summary text,
  response jsonb not null default '{}'::jsonb,
  response_summary text,
  sources text[] not null default '{}',
  confidence numeric(4,2) not null default 0.50,
  model_used text not null default 'tvf-os-deterministic-v1',
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  constraint ai_interactions_context_type_check check (context_object_type in ('none','request','case','document','procedure','knowledge','contact','organization','branch','email')),
  constraint ai_interactions_type_check check (interaction_type in ('question','classification','synthesis','draft','search','risk_alert','workflow_help','email_analysis','other')),
  constraint ai_interactions_status_check check (status in ('completed','needs_review','failed')),
  constraint ai_interactions_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  user_label text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  suggestion_type text not null default 'next_action',
  title text not null,
  proposed_value jsonb not null default '{}'::jsonb,
  explanation text,
  sources text[] not null default '{}',
  confidence numeric(4,2) not null default 0.60,
  status text not null default 'proposed',
  reviewed_by text,
  reviewed_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_suggestions_related_type_check check (related_object_type in ('none','request','case','document','procedure','knowledge','contact','organization','branch','email')),
  constraint ai_suggestions_type_check check (suggestion_type in ('classification','priority','pole','responsible','next_action','draft_response','missing_pieces','checklist','procedure','risk','knowledge','email_triage','other')),
  constraint ai_suggestions_status_check check (status in ('proposed','accepted','modified','rejected','ignored','applied')),
  constraint ai_suggestions_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid references public.ai_interactions(id) on delete cascade,
  suggestion_id uuid references public.ai_suggestions(id) on delete cascade,
  feedback_type text not null default 'other',
  note text,
  created_by text,
  created_at timestamptz not null default now(),
  constraint ai_feedback_target_check check (interaction_id is not null or suggestion_id is not null),
  constraint ai_feedback_type_check check (feedback_type in ('useful','incorrect','incomplete','unsafe','source_missing','other'))
);

create table if not exists public.ai_automation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  rule_name text not null,
  description text,
  trigger_type text not null default 'manual',
  target_module text not null default 'assistant_ia',
  enabled boolean not null default true,
  requires_human_validation boolean not null default true,
  rule_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_automation_rules_trigger_check check (trigger_type in ('manual','email_received','request_created','case_updated','document_validated','scheduled','webhook'))
);

create table if not exists public.ai_automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.ai_automation_rules(id) on delete set null,
  related_object_type text not null default 'none',
  related_object_id uuid,
  status text not null default 'queued',
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  constraint ai_automation_runs_related_type_check check (related_object_type in ('none','request','case','document','procedure','knowledge','contact','organization','branch','email')),
  constraint ai_automation_runs_status_check check (status in ('queued','running','completed','failed','cancelled','needs_validation'))
);

create or replace function public.set_ai_suggestion_metadata()
returns trigger language plpgsql as $$
begin
  if new.status <> 'proposed' and new.reviewed_at is null then
    new.reviewed_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_ai_automation_rule_metadata()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_ai_suggestion_metadata on public.ai_suggestions;
create trigger set_ai_suggestion_metadata before insert or update on public.ai_suggestions for each row execute function public.set_ai_suggestion_metadata();

drop trigger if exists set_ai_automation_rule_metadata on public.ai_automation_rules;
create trigger set_ai_automation_rule_metadata before insert or update on public.ai_automation_rules for each row execute function public.set_ai_automation_rule_metadata();

create index if not exists ai_interactions_created_idx on public.ai_interactions(created_at desc, interaction_type, status);
create index if not exists ai_interactions_context_idx on public.ai_interactions(context_object_type, context_object_id);
create index if not exists ai_interactions_sources_idx on public.ai_interactions using gin(sources);
create index if not exists ai_suggestions_status_idx on public.ai_suggestions(status, suggestion_type, created_at desc);
create index if not exists ai_suggestions_related_idx on public.ai_suggestions(related_object_type, related_object_id);
create index if not exists ai_suggestions_sources_idx on public.ai_suggestions using gin(sources);
create index if not exists ai_feedback_interaction_idx on public.ai_feedback(interaction_id, created_at desc);
create index if not exists ai_feedback_suggestion_idx on public.ai_feedback(suggestion_id, created_at desc);
create index if not exists ai_automation_rules_enabled_idx on public.ai_automation_rules(enabled, trigger_type, target_module);
create index if not exists ai_automation_runs_status_idx on public.ai_automation_runs(status, started_at desc);

alter table public.ai_interactions enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.ai_automation_rules enable row level security;
alter table public.ai_automation_runs enable row level security;

-- Service role bypass RLS. Policies preparent Supabase Auth et les roles TVF futurs.
drop policy if exists "TVF AI interactions can read" on public.ai_interactions;
create policy "TVF AI interactions can read" on public.ai_interactions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','ai_manager','auditor'));
drop policy if exists "TVF AI interactions can manage" on public.ai_interactions;
create policy "TVF AI interactions can manage" on public.ai_interactions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','ai_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','ai_manager'));

drop policy if exists "TVF AI suggestions can read" on public.ai_suggestions;
create policy "TVF AI suggestions can read" on public.ai_suggestions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','ai_manager','auditor'));
drop policy if exists "TVF AI suggestions can manage" on public.ai_suggestions;
create policy "TVF AI suggestions can manage" on public.ai_suggestions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','ai_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','ai_manager'));

drop policy if exists "TVF AI feedback can read" on public.ai_feedback;
create policy "TVF AI feedback can read" on public.ai_feedback for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','ai_manager','auditor'));
drop policy if exists "TVF AI feedback can manage" on public.ai_feedback;
create policy "TVF AI feedback can manage" on public.ai_feedback for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','ai_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','ai_manager'));

drop policy if exists "TVF AI automation rules can read" on public.ai_automation_rules;
create policy "TVF AI automation rules can read" on public.ai_automation_rules for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','procedure_manager','knowledge_manager','ai_manager','auditor'));
drop policy if exists "TVF AI automation rules can manage" on public.ai_automation_rules;
create policy "TVF AI automation rules can manage" on public.ai_automation_rules for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','ai_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','ai_manager'));

drop policy if exists "TVF AI automation runs can read" on public.ai_automation_runs;
create policy "TVF AI automation runs can read" on public.ai_automation_runs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','procedure_manager','knowledge_manager','ai_manager','auditor'));
drop policy if exists "TVF AI automation runs can manage" on public.ai_automation_runs;
create policy "TVF AI automation runs can manage" on public.ai_automation_runs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','ai_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','ai_manager'));

insert into public.ai_automation_rules (rule_key, rule_name, description, trigger_type, target_module, enabled, requires_human_validation, rule_config)
values
  ('email-triage-human-validation', 'Tri IA des e-mails entrants', 'Lit un e-mail, propose categorie, pole, priorite, pieces et brouillon de reponse.', 'email_received', 'emails', true, true, '{"creates":"ai_suggestions","human_validation":"required"}'::jsonb),
  ('request-qualification-suggestion', 'Qualification IA des demandes', 'Propose categorie, pole responsable, prochaine action et pieces manquantes.', 'request_created', 'demandes', true, true, '{"creates":"ai_suggestions","scope":"request"}'::jsonb),
  ('case-synthesis-review', 'Synthese IA des dossiers', 'Prepare une synthese et les risques avant decision humaine.', 'case_updated', 'dossiers', true, true, '{"creates":"ai_interactions","scope":"case"}'::jsonb),
  ('knowledge-answer-sourced', 'Reponse sourcee procedures et connaissances', 'Recherche dans les sources validees et cite les references internes.', 'manual', 'knowledge', true, true, '{"requires_sources":true}'::jsonb)
on conflict (rule_key) do update set
  rule_name = excluded.rule_name,
  description = excluded.description,
  trigger_type = excluded.trigger_type,
  target_module = excluded.target_module,
  enabled = excluded.enabled,
  requires_human_validation = excluded.requires_human_validation,
  rule_config = excluded.rule_config;

comment on table public.ai_interactions is 'TVF OS - journal des conversations et traitements IA.';
comment on table public.ai_suggestions is 'TVF OS - propositions IA actionnables, toujours soumises a validation humaine.';
comment on table public.ai_feedback is 'TVF OS - corrections et retours utilisateurs sur les sorties IA.';
comment on table public.ai_automation_rules is 'TVF OS - regles d automatisation IA configurees.';
comment on table public.ai_automation_runs is 'TVF OS - executions et traces des automatisations IA.';
