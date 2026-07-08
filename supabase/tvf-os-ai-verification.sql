-- TVF OS - Assistant IA - Verification Supabase

select 'ai_tables' as check_name, count(*) as found
from information_schema.tables
where table_schema = 'public'
  and table_name in ('ai_interactions','ai_suggestions','ai_feedback','ai_automation_rules','ai_automation_runs');

select 'ai_rls_enabled' as check_name, count(*) as found
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('ai_interactions','ai_suggestions','ai_feedback','ai_automation_rules','ai_automation_runs')
  and c.relrowsecurity = true;

select 'ai_policies' as check_name, count(*) as found
from pg_policies
where schemaname = 'public'
  and tablename in ('ai_interactions','ai_suggestions','ai_feedback','ai_automation_rules','ai_automation_runs');

select 'ai_indexes' as check_name, count(*) as found
from pg_indexes
where schemaname = 'public'
  and indexname in ('ai_interactions_created_idx','ai_interactions_context_idx','ai_interactions_sources_idx','ai_suggestions_status_idx','ai_suggestions_related_idx','ai_suggestions_sources_idx','ai_feedback_interaction_idx','ai_feedback_suggestion_idx','ai_automation_rules_enabled_idx','ai_automation_runs_status_idx');

select 'ai_automation_seed' as check_name, count(*) as found
from public.ai_automation_rules
where rule_key in ('email-triage-human-validation','request-qualification-suggestion','case-synthesis-review','knowledge-answer-sourced');

select 'ai_test_interactions' as check_name, count(*) as found
from public.ai_interactions
where user_label = 'TVF OS Test';

select 'ai_test_suggestions' as check_name, count(*) as found
from public.ai_suggestions
where user_label = 'TVF OS Test';
