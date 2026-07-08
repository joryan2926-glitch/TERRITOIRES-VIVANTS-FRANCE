-- TVF OS - Module Observatoire territorial
-- Migration production : sources, indicateurs, diagnostics et veille territoriale.

create extension if not exists pgcrypto;

create table if not exists public.territorial_sources (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  source_key text unique,
  source_name text not null,
  source_type text not null default 'public_data',
  territory_label text,
  url text,
  reliability_level text not null default 'moyen',
  refresh_frequency text not null default 'trimestrielle',
  last_checked_at timestamptz,
  next_check_at timestamptz,
  status text not null default 'a_verifier',
  notes text,
  tags text[] not null default '{}',
  confidentiality_level text not null default 'interne',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint territorial_sources_type_check check (source_type in ('public_data','internal','partner','field','press','funding','legal','map','other')),
  constraint territorial_sources_reliability_check check (reliability_level in ('faible','moyen','fort','officiel')),
  constraint territorial_sources_frequency_check check (refresh_frequency in ('ponctuelle','mensuelle','trimestrielle','annuelle')),
  constraint territorial_sources_status_check check (status in ('active','a_verifier','archive')),
  constraint territorial_sources_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible'))
);

create table if not exists public.territorial_indicators (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  indicator_key text unique,
  territory_label text not null,
  indicator_type text not null default 'logements_vacants',
  label text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  period_label text,
  source_id uuid references public.territorial_sources(id) on delete set null,
  trend text not null default 'inconnu',
  priority_level text not null default 'moyen',
  priority_score integer not null default 35,
  confidence numeric(4,2) not null default 0.50,
  status text not null default 'brouillon',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint territorial_indicators_type_check check (indicator_type in ('logements_vacants','commerces_vacants','friches','materiaux','insertion','partenaires','financement','risques','population','autre')),
  constraint territorial_indicators_trend_check check (trend in ('hausse','stable','baisse','inconnu')),
  constraint territorial_indicators_priority_check check (priority_level in ('faible','moyen','fort','critique')),
  constraint territorial_indicators_priority_score_check check (priority_score >= 0 and priority_score <= 100),
  constraint territorial_indicators_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint territorial_indicators_status_check check (status in ('brouillon','valide','a_reviser','archive'))
);

create table if not exists public.territorial_diagnostics (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  diagnostic_key text unique,
  territory_label text not null,
  status text not null default 'brouillon',
  maturity_level text not null default 'prefiguration',
  summary text,
  opportunities text[] not null default '{}',
  risks text[] not null default '{}',
  recommended_actions text[] not null default '{}',
  map_readiness_score integer not null default 0,
  data_quality_score integer not null default 0,
  priority_score integer not null default 35,
  validated_by text,
  validated_at timestamptz,
  next_review_at timestamptz,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint territorial_diagnostics_status_check check (status in ('brouillon','a_valider','valide','en_revision','archive')),
  constraint territorial_diagnostics_maturity_check check (maturity_level in ('idee','prefiguration','lancement','operationnelle','confirmee')),
  constraint territorial_diagnostics_map_score_check check (map_readiness_score >= 0 and map_readiness_score <= 100),
  constraint territorial_diagnostics_quality_score_check check (data_quality_score >= 0 and data_quality_score <= 100),
  constraint territorial_diagnostics_priority_score_check check (priority_score >= 0 and priority_score <= 100)
);

create table if not exists public.territorial_watch_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.territorial_sources(id) on delete set null,
  territory_label text,
  title text not null,
  watch_type text not null default 'actualite',
  status text not null default 'a_qualifier',
  opportunity_level text not null default 'moyen',
  due_at timestamptz,
  url text,
  summary text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint territorial_watch_type_check check (watch_type in ('appel_a_projet','actualite','dispositif','donnee_publique','risque','partenaire','autre')),
  constraint territorial_watch_status_check check (status in ('a_qualifier','utile','ignore','archive')),
  constraint territorial_watch_opportunity_check check (opportunity_level in ('faible','moyen','fort','critique'))
);

create or replace function public.set_territorial_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_territorial_indicator_metadata()
returns trigger language plpgsql as $$
begin
  if new.priority_score is null then
    new.priority_score := 35;
  end if;
  if new.priority_level = 'critique' then
    new.priority_score := greatest(new.priority_score, 82);
  elsif new.priority_level = 'fort' then
    new.priority_score := greatest(new.priority_score, 68);
  elsif new.priority_level = 'moyen' then
    new.priority_score := greatest(new.priority_score, 45);
  end if;
  if new.trend = 'hausse' and new.indicator_type in ('logements_vacants','commerces_vacants','friches','risques') then
    new.priority_score := least(100, new.priority_score + 8);
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.label || ' - indicateur ' || new.indicator_type || ', priorite ' || new.priority_level || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_territorial_diagnostic_metadata()
returns trigger language plpgsql as $$
begin
  if new.status = 'valide' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.territory_label || ' - diagnostic territorial ' || new.status || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_territorial_sources_updated_at on public.territorial_sources;
create trigger set_territorial_sources_updated_at before insert or update on public.territorial_sources for each row execute function public.set_territorial_updated_at();

drop trigger if exists set_territorial_indicator_metadata on public.territorial_indicators;
create trigger set_territorial_indicator_metadata before insert or update on public.territorial_indicators for each row execute function public.set_territorial_indicator_metadata();

drop trigger if exists set_territorial_diagnostic_metadata on public.territorial_diagnostics;
create trigger set_territorial_diagnostic_metadata before insert or update on public.territorial_diagnostics for each row execute function public.set_territorial_diagnostic_metadata();

drop trigger if exists set_territorial_watch_updated_at on public.territorial_watch_items;
create trigger set_territorial_watch_updated_at before insert or update on public.territorial_watch_items for each row execute function public.set_territorial_updated_at();

create index if not exists territorial_sources_status_idx on public.territorial_sources(status, reliability_level, updated_at desc);
create index if not exists territorial_sources_territory_idx on public.territorial_sources(territory_label, source_type);
create index if not exists territorial_sources_next_check_idx on public.territorial_sources(next_check_at) where status <> 'archive';
create index if not exists territorial_indicators_territory_idx on public.territorial_indicators(territory_label, indicator_type, status);
create index if not exists territorial_indicators_priority_idx on public.territorial_indicators(priority_score desc, priority_level, updated_at desc);
create index if not exists territorial_indicators_source_idx on public.territorial_indicators(source_id);
create index if not exists territorial_diagnostics_territory_idx on public.territorial_diagnostics(territory_label, status);
create index if not exists territorial_diagnostics_priority_idx on public.territorial_diagnostics(priority_score desc, data_quality_score desc);
create index if not exists territorial_watch_status_idx on public.territorial_watch_items(status, opportunity_level, created_at desc);
create index if not exists territorial_watch_territory_idx on public.territorial_watch_items(territory_label, watch_type);

alter table public.territorial_sources enable row level security;
alter table public.territorial_indicators enable row level security;
alter table public.territorial_diagnostics enable row level security;
alter table public.territorial_watch_items enable row level security;

drop policy if exists "TVF observatoire sources can read" on public.territorial_sources;
create policy "TVF observatoire sources can read" on public.territorial_sources for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','observatory_manager','auditor'));
drop policy if exists "TVF observatoire sources can manage" on public.territorial_sources;
create policy "TVF observatoire sources can manage" on public.territorial_sources for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager'));

drop policy if exists "TVF observatoire indicators can read" on public.territorial_indicators;
create policy "TVF observatoire indicators can read" on public.territorial_indicators for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','observatory_manager','auditor'));
drop policy if exists "TVF observatoire indicators can manage" on public.territorial_indicators;
create policy "TVF observatoire indicators can manage" on public.territorial_indicators for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager'));

drop policy if exists "TVF observatoire diagnostics can read" on public.territorial_diagnostics;
create policy "TVF observatoire diagnostics can read" on public.territorial_diagnostics for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','observatory_manager','auditor'));
drop policy if exists "TVF observatoire diagnostics can manage" on public.territorial_diagnostics;
create policy "TVF observatoire diagnostics can manage" on public.territorial_diagnostics for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager'));

drop policy if exists "TVF observatoire watch can read" on public.territorial_watch_items;
create policy "TVF observatoire watch can read" on public.territorial_watch_items for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','observatory_manager','auditor'));
drop policy if exists "TVF observatoire watch can manage" on public.territorial_watch_items;
create policy "TVF observatoire watch can manage" on public.territorial_watch_items for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','map_manager','observatory_manager'));

insert into public.territorial_sources (source_key, source_name, source_type, territory_label, reliability_level, refresh_frequency, status, notes, tags, confidentiality_level)
values
  ('insee-base-territoire', 'INSEE - donnees territoriales de reference', 'public_data', 'France', 'officiel', 'annuelle', 'active', 'Source nationale de reference pour cadrer les diagnostics.', array['donnees publiques','population','territoire'], 'public'),
  ('cartographie-tvf-interne', 'Cartographie interne TVF OS', 'map', 'Reseau TVF', 'fort', 'mensuelle', 'active', 'Points internes issus du module Cartographie.', array['carte','signalements','biens'], 'interne'),
  ('veille-appels-a-projets', 'Veille appels a projets territoriaux', 'funding', 'France', 'moyen', 'mensuelle', 'a_verifier', 'Source de veille a qualifier par antenne.', array['financement','veille'], 'interne')
on conflict (source_key) do update set source_name = excluded.source_name, source_type = excluded.source_type, reliability_level = excluded.reliability_level, refresh_frequency = excluded.refresh_frequency, status = excluded.status, notes = excluded.notes, tags = excluded.tags, confidentiality_level = excluded.confidentiality_level;

comment on table public.territorial_sources is 'TVF OS - sources publiques, internes ou partenaires de l observatoire territorial.';
comment on table public.territorial_indicators is 'TVF OS - indicateurs territoriaux permettant de prioriser les actions.';
comment on table public.territorial_diagnostics is 'TVF OS - diagnostics territoriaux et notes d opportunite.';
comment on table public.territorial_watch_items is 'TVF OS - veille territoriale, dispositifs, appels a projets et alertes locales.';
