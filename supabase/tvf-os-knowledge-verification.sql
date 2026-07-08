-- TVF OS - Module Base de connaissances
-- Verification post-migration : tables, RLS, politiques, indexes, fonctions et triggers.

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('knowledge_articles','knowledge_sources','lessons_learned','knowledge_questions')
order by tablename, policyname;

with expected(metric, expected_count) as (
  values
    ('tables', 4),
    ('rls_enabled', 4),
    ('policies', 8),
    ('indexes', 10),
    ('functions', 3),
    ('triggers', 3)
), actual(metric, actual_count) as (
  select 'tables', count(*)::int
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('knowledge_articles','knowledge_sources','lessons_learned','knowledge_questions')
  union all
  select 'rls_enabled', count(*)::int
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('knowledge_articles','knowledge_sources','lessons_learned','knowledge_questions')
    and c.relrowsecurity = true
  union all
  select 'policies', count(*)::int
  from pg_policies
  where schemaname = 'public'
    and tablename in ('knowledge_articles','knowledge_sources','lessons_learned','knowledge_questions')
  union all
  select 'indexes', count(*)::int
  from pg_indexes
  where schemaname = 'public'
    and indexname in ('knowledge_articles_status_idx','knowledge_articles_review_idx','knowledge_articles_source_idx','knowledge_articles_search_idx','knowledge_articles_tags_idx','knowledge_sources_article_idx','knowledge_sources_object_idx','lessons_learned_status_idx','lessons_learned_source_idx','knowledge_questions_status_idx')
  union all
  select 'functions', count(*)::int
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('tvf_knowledge_slug','set_knowledge_article_metadata','set_lesson_metadata')
  union all
  select 'triggers', count(distinct t.tgname)::int
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal
    and t.tgname in ('set_knowledge_article_metadata','mark_article_review_overdue','set_lesson_metadata')
)
select e.metric, e.expected_count, coalesce(a.actual_count, 0) as actual_count,
       case when coalesce(a.actual_count, 0) >= e.expected_count then 'ok' else 'missing' end as status
from expected e
left join actual a using(metric)
order by e.metric;
