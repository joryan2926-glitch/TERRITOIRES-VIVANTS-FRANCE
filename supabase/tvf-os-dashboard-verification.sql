-- Territoires Vivants France
-- TVF OS - Module Dashboard
-- Verification post-migration Supabase.
-- Objectif : confirmer tables, colonnes, index, RLS, policies et donnees source.

-- 1. Colonnes operationnelles attendues sur public.contacts
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'contacts'
  and column_name in (
    'status',
    'priority',
    'category',
    'assigned_to',
    'internal_notes',
    'last_follow_up_at',
    'closed_at',
    'updated_at'
  )
order by column_name;

-- 2. Tables Dashboard attendues
select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'dashboard_preferences',
    'dashboard_snapshots',
    'dashboard_alerts'
  )
order by table_name;

-- 3. RLS activee sur les tables Dashboard
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'dashboard_preferences',
    'dashboard_snapshots',
    'dashboard_alerts'
  )
order by tablename;

-- 4. Policies RLS Dashboard
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'dashboard_preferences',
    'dashboard_snapshots',
    'dashboard_alerts'
  )
order by tablename, policyname;

-- 5. Index utiles Dashboard et contacts
select
  schemaname,
  tablename,
  indexname
from pg_indexes
where schemaname = 'public'
  and (
    tablename in ('dashboard_preferences', 'dashboard_snapshots', 'dashboard_alerts')
    or indexname in (
      'contacts_status_idx',
      'contacts_priority_idx',
      'contacts_category_idx',
      'contacts_created_at_idx'
    )
  )
order by tablename, indexname;

-- 6. Donnees source disponibles pour le Dashboard
select
  count(*) as total_contacts,
  count(*) filter (where created_at >= now() - interval '30 days') as contacts_30_days,
  count(*) filter (where status in ('nouveau', 'a_qualifier', 'en_cours', 'rendez_vous', 'en_attente', 'accepte')) as active_contacts,
  count(*) filter (where assigned_to is null or assigned_to = '') as unassigned_contacts,
  count(*) filter (where priority = 'urgente') as urgent_contacts
from public.contacts;

-- 7. Donnees de test Dashboard si elles ont ete inserees
select
  status,
  priority,
  category,
  count(*) as count
from public.contacts
where source_page = 'dashboard-test'
  and subject like '[TEST DASHBOARD]%'
group by status, priority, category
order by status, priority, category;
