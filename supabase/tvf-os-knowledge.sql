-- TVF OS - Module Base de connaissances
-- Migration production : articles, sources, retours d'experience et questions/reponses.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  article_key text not null unique,
  title text not null,
  article_type text not null default 'article',
  status text not null default 'brouillon',
  content text not null default '',
  summary text,
  ai_summary text,
  source_object_type text not null default 'none',
  source_object_id uuid,
  validated_by text,
  validated_at timestamptz,
  next_review_at timestamptz,
  tags text[] not null default '{}',
  confidentiality_level text not null default 'interne',
  usage_count integer not null default 0,
  helpful_count integer not null default 0,
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(content,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_articles_type_check check (article_type in ('article','faq','retour_experience','decision_type','erreur_a_eviter','cas_usage','source_territoriale','lecon_apprise','procedure','modele','autre')),
  constraint knowledge_articles_status_check check (status in ('brouillon','a_valider','valide','en_revision','archive')),
  constraint knowledge_articles_source_type_check check (source_object_type in ('case','request','document','procedure','contact','organization','project','branch','none')),
  constraint knowledge_articles_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible'))
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.knowledge_articles(id) on delete cascade,
  source_label text not null,
  source_type text not null default 'document',
  source_url text,
  related_object_type text not null default 'none',
  related_object_id uuid,
  citation_note text,
  created_at timestamptz not null default now(),
  constraint knowledge_sources_related_type_check check (related_object_type in ('case','request','document','procedure','contact','organization','project','branch','none'))
);

create table if not exists public.lessons_learned (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lesson_type text not null default 'autre',
  source_object_type text not null default 'none',
  source_object_id uuid,
  context text,
  lesson text not null default '',
  impact_level text not null default 'moyen',
  proposed_action text,
  status text not null default 'a_capitaliser',
  article_id uuid references public.knowledge_articles(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_learned_type_check check (lesson_type in ('bonne_pratique','risque','erreur','amelioration','decision','terrain','autre')),
  constraint lessons_learned_source_type_check check (source_object_type in ('case','request','document','procedure','contact','organization','project','branch','none')),
  constraint lessons_learned_impact_check check (impact_level in ('faible','moyen','fort')),
  constraint lessons_learned_status_check check (status in ('a_capitaliser','capitalise','ignore','archive'))
);

create table if not exists public.knowledge_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sources text[] not null default '{}',
  status text not null default 'answered',
  confidence numeric(4,2) not null default 0.50,
  created_by text,
  created_at timestamptz not null default now(),
  constraint knowledge_questions_status_check check (status in ('answered','unanswered','needs_review')),
  constraint knowledge_questions_confidence_check check (confidence >= 0 and confidence <= 1)
);

create or replace function public.tvf_knowledge_slug(value text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(value, 'connaissance'))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_knowledge_article_metadata()
returns trigger language plpgsql as $$
begin
  if new.article_key is null or new.article_key = '' then
    new.article_key := public.tvf_knowledge_slug(new.article_type || '-' || new.title);
  end if;
  if new.next_review_at is null then
    new.next_review_at := now() + interval '12 months';
  end if;
  if new.status = 'valide' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.status = 'valide' and (new.ai_summary is null or new.ai_summary = '') then
    new.ai_summary := left(coalesce(new.summary, new.content, new.title), 900);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_lesson_metadata()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.mark_article_review_overdue()
returns trigger language plpgsql as $$
begin
  if new.status = 'valide' and new.next_review_at is not null and new.next_review_at < now() then
    new.status := 'en_revision';
  end if;
  return new;
end;
$$;

drop trigger if exists set_knowledge_article_metadata on public.knowledge_articles;
create trigger set_knowledge_article_metadata before insert or update on public.knowledge_articles for each row execute function public.set_knowledge_article_metadata();

drop trigger if exists mark_article_review_overdue on public.knowledge_articles;
create trigger mark_article_review_overdue before update on public.knowledge_articles for each row execute function public.mark_article_review_overdue();

drop trigger if exists set_lesson_metadata on public.lessons_learned;
create trigger set_lesson_metadata before insert or update on public.lessons_learned for each row execute function public.set_lesson_metadata();

create index if not exists knowledge_articles_status_idx on public.knowledge_articles(status, article_type, updated_at desc);
create index if not exists knowledge_articles_review_idx on public.knowledge_articles(next_review_at, status);
create index if not exists knowledge_articles_source_idx on public.knowledge_articles(source_object_type, source_object_id);
create index if not exists knowledge_articles_search_idx on public.knowledge_articles using gin(search_vector);
create index if not exists knowledge_articles_tags_idx on public.knowledge_articles using gin(tags);
create index if not exists knowledge_sources_article_idx on public.knowledge_sources(article_id, source_type);
create index if not exists knowledge_sources_object_idx on public.knowledge_sources(related_object_type, related_object_id);
create index if not exists lessons_learned_status_idx on public.lessons_learned(status, lesson_type, impact_level);
create index if not exists lessons_learned_source_idx on public.lessons_learned(source_object_type, source_object_id);
create index if not exists knowledge_questions_status_idx on public.knowledge_questions(status, created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'knowledge_sources_article_label_unique') then
    alter table public.knowledge_sources add constraint knowledge_sources_article_label_unique unique(article_id, source_label);
  end if;
end $$;

alter table public.knowledge_articles enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.lessons_learned enable row level security;
alter table public.knowledge_questions enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF knowledge articles can read" on public.knowledge_articles;
create policy "TVF knowledge articles can read" on public.knowledge_articles for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','auditor'));
drop policy if exists "TVF knowledge articles can manage" on public.knowledge_articles;
create policy "TVF knowledge articles can manage" on public.knowledge_articles for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','knowledge_manager','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','knowledge_manager','procedure_manager'));

drop policy if exists "TVF knowledge sources can read" on public.knowledge_sources;
create policy "TVF knowledge sources can read" on public.knowledge_sources for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','auditor'));
drop policy if exists "TVF knowledge sources can manage" on public.knowledge_sources;
create policy "TVF knowledge sources can manage" on public.knowledge_sources for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','knowledge_manager','procedure_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','knowledge_manager','procedure_manager'));

drop policy if exists "TVF lessons can read" on public.lessons_learned;
create policy "TVF lessons can read" on public.lessons_learned for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','procedure_manager','knowledge_manager','auditor'));
drop policy if exists "TVF lessons can manage" on public.lessons_learned;
create policy "TVF lessons can manage" on public.lessons_learned for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','knowledge_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','knowledge_manager'));

drop policy if exists "TVF knowledge questions can read" on public.knowledge_questions;
create policy "TVF knowledge questions can read" on public.knowledge_questions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager','auditor'));
drop policy if exists "TVF knowledge questions can manage" on public.knowledge_questions;
create policy "TVF knowledge questions can manage" on public.knowledge_questions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','procedure_manager','knowledge_manager'));

comment on table public.knowledge_articles is 'TVF OS - articles, FAQ et memoire collective validee.';
comment on table public.knowledge_sources is 'TVF OS - sources citees par les articles de connaissance.';
comment on table public.lessons_learned is 'TVF OS - retours d experience a capitaliser.';
comment on table public.knowledge_questions is 'TVF OS - questions/reponses internes avec sources.';
