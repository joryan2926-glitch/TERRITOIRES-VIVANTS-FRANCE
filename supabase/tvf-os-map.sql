-- TVF OS - Module Cartographie
-- Migration production : points cartographiques, couches, geocodage controle et alertes spatiales.

create extension if not exists pgcrypto;

create table if not exists public.map_layers (
  id uuid primary key default gen_random_uuid(),
  layer_key text not null unique,
  label text not null,
  point_type text not null,
  color text not null default '#667085',
  enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  constraint map_layers_point_type_check check (point_type in ('bien','commerce','friche','materiau','partenaire','projet','signalement','antenne','autre'))
);

create table if not exists public.map_points (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  point_type text not null default 'bien',
  related_object_type text not null default 'none',
  related_object_id uuid,
  latitude numeric(9,6),
  longitude numeric(9,6),
  precision_level text not null default 'quartier',
  visibility_level text not null default 'interne',
  label text not null,
  description text,
  address_text text,
  city text,
  department text,
  region text,
  status text not null default 'a_verifier',
  risk_level text not null default 'modere',
  priority_score integer not null default 30,
  source_label text,
  created_by text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint map_points_type_check check (point_type in ('bien','commerce','friche','materiau','partenaire','projet','signalement','antenne','autre')),
  constraint map_points_related_type_check check (related_object_type in ('none','request','case','document','procedure','knowledge','contact','organization','branch','project')),
  constraint map_points_precision_check check (precision_level in ('exact','rue','quartier','commune','masque')),
  constraint map_points_visibility_check check (visibility_level in ('public','interne','confidentiel','sensible')),
  constraint map_points_status_check check (status in ('actif','a_verifier','inactif','archive')),
  constraint map_points_risk_check check (risk_level in ('faible','modere','eleve','critique')),
  constraint map_points_priority_check check (priority_score >= 0 and priority_score <= 100),
  constraint map_points_lat_check check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint map_points_lon_check check (longitude is null or (longitude >= -180 and longitude <= 180))
);

create table if not exists public.map_geocode_checks (
  id uuid primary key default gen_random_uuid(),
  point_id uuid not null references public.map_points(id) on delete cascade,
  input_address text not null,
  normalized_address text,
  confidence numeric(4,2) not null default 0.50,
  status text not null default 'propose',
  notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint map_geocode_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint map_geocode_status_check check (status in ('propose','valide','refuse','a_revoir'))
);

create table if not exists public.map_spatial_alerts (
  id uuid primary key default gen_random_uuid(),
  point_id uuid references public.map_points(id) on delete cascade,
  related_point_id uuid references public.map_points(id) on delete set null,
  alert_type text not null default 'priorite_territoriale',
  severity text not null default 'moyenne',
  message text not null,
  status text not null default 'ouverte',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint map_alert_type_check check (alert_type in ('doublon','proximite','localisation_sensible','precision_manquante','priorite_territoriale')),
  constraint map_alert_severity_check check (severity in ('faible','moyenne','haute','critique')),
  constraint map_alert_status_check check (status in ('ouverte','resolue','ignoree'))
);

create or replace function public.set_map_point_metadata()
returns trigger language plpgsql as $$
begin
  if new.visibility_level = 'sensible' and new.precision_level = 'exact' then
    new.precision_level := 'quartier';
    new.latitude := case when new.latitude is null then null else round(new.latitude::numeric, 3) end;
    new.longitude := case when new.longitude is null then null else round(new.longitude::numeric, 3) end;
  end if;
  if new.ai_summary is null or new.ai_summary = '' then
    new.ai_summary := new.label || ' - point ' || new.point_type || ', statut ' || new.status || '.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_map_point_metadata on public.map_points;
create trigger set_map_point_metadata before insert or update on public.map_points for each row execute function public.set_map_point_metadata();

create index if not exists map_layers_type_idx on public.map_layers(point_type, enabled, sort_order);
create index if not exists map_points_type_idx on public.map_points(point_type, status, priority_score desc);
create index if not exists map_points_visibility_idx on public.map_points(visibility_level, precision_level);
create index if not exists map_points_related_idx on public.map_points(related_object_type, related_object_id);
create index if not exists map_points_geo_idx on public.map_points(latitude, longitude) where latitude is not null and longitude is not null;
create index if not exists map_points_city_idx on public.map_points(city, department, region);
create index if not exists map_geocode_point_idx on public.map_geocode_checks(point_id, status, created_at desc);
create index if not exists map_alerts_status_idx on public.map_spatial_alerts(status, severity, created_at desc);
create index if not exists map_alerts_point_idx on public.map_spatial_alerts(point_id, alert_type);

alter table public.map_layers enable row level security;
alter table public.map_points enable row level security;
alter table public.map_geocode_checks enable row level security;
alter table public.map_spatial_alerts enable row level security;

drop policy if exists "TVF map layers can read" on public.map_layers;
create policy "TVF map layers can read" on public.map_layers for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','auditor'));
drop policy if exists "TVF map layers can manage" on public.map_layers;
create policy "TVF map layers can manage" on public.map_layers for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','map_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','map_manager'));

drop policy if exists "TVF map points can read" on public.map_points;
create policy "TVF map points can read" on public.map_points for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','auditor'));
drop policy if exists "TVF map points can manage" on public.map_points;
create policy "TVF map points can manage" on public.map_points for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager'));

drop policy if exists "TVF map geocode can read" on public.map_geocode_checks;
create policy "TVF map geocode can read" on public.map_geocode_checks for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','auditor'));
drop policy if exists "TVF map geocode can manage" on public.map_geocode_checks;
create policy "TVF map geocode can manage" on public.map_geocode_checks for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager'));

drop policy if exists "TVF map alerts can read" on public.map_spatial_alerts;
create policy "TVF map alerts can read" on public.map_spatial_alerts for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager','auditor'));
drop policy if exists "TVF map alerts can manage" on public.map_spatial_alerts;
create policy "TVF map alerts can manage" on public.map_spatial_alerts for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','map_manager'));

insert into public.map_layers (layer_key, label, point_type, color, sort_order)
values
  ('biens', 'Biens vacants', 'bien', '#2f7d32', 10),
  ('commerces', 'Commerces inoccupes', 'commerce', '#0e6f88', 20),
  ('friches', 'Friches et terrains', 'friche', '#8f5b24', 30),
  ('materiaux', 'Materiaux de reemploi', 'materiau', '#8a6f15', 40),
  ('partenaires', 'Partenaires', 'partenaire', '#355f91', 50),
  ('projets', 'Projets', 'projet', '#6f4aa8', 60),
  ('signalements', 'Signalements', 'signalement', '#b43b2f', 70),
  ('antennes', 'Antennes', 'antenne', '#183f22', 80)
on conflict (layer_key) do update set label = excluded.label, point_type = excluded.point_type, color = excluded.color, sort_order = excluded.sort_order;

comment on table public.map_points is 'TVF OS - points cartographiques internes, avec precision et confidentialite controlees.';
comment on table public.map_layers is 'TVF OS - couches de la carte metier.';
comment on table public.map_geocode_checks is 'TVF OS - controles de geocodage sans confiance aveugle dans un fournisseur externe.';
comment on table public.map_spatial_alerts is 'TVF OS - alertes de proximite, doublon, precision et priorite territoriale.';
