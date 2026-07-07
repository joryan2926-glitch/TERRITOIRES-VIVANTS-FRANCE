-- TVF OS - Verification module Demandes entrantes
-- A executer dans Supabase SQL Editor apres tvf-os-demandes-entrantes.sql.

-- 1. Colonnes metier attendues sur public.contacts
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'contacts'
  and column_name in (
    'request_number',
    'channel',
    'form_code',
    'pole',
    'next_action',
    'next_action_due_at',
    'closure_reason',
    'ai_summary',
    'ai_confidence',
    'qualification_score',
    'missing_pieces'
  )
order by column_name;

-- 2. Tables dediees du module
select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('request_activity_log', 'request_ai_suggestions', 'request_documents')
order by table_name;

-- 3. RLS activee
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname in ('request_activity_log', 'request_ai_suggestions', 'request_documents')
order by relname;

-- 4. Policies RLS presentes
select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('request_activity_log', 'request_ai_suggestions', 'request_documents')
order by tablename, policyname;

-- 5. Index utiles
select
  indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'contacts_request_number_unique_idx',
    'contacts_channel_idx',
    'contacts_pole_idx',
    'contacts_next_action_due_at_idx',
    'contacts_missing_pieces_gin_idx',
    'request_activity_log_contact_idx',
    'request_ai_suggestions_contact_idx',
    'request_documents_contact_idx'
  )
order by indexname;

-- 6. Echantillon operationnel
select
  request_number,
  channel,
  status,
  priority,
  category,
  pole,
  qualification_score,
  next_action,
  next_action_due_at
from public.contacts
order by created_at desc
limit 10;
