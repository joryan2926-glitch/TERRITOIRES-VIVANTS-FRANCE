-- TVF OS - Cartographie - Verification Supabase

select 'map_tables' as check_name, count(*) as found
from information_schema.tables
where table_schema = 'public'
  and table_name in ('map_layers','map_points','map_geocode_checks','map_spatial_alerts');

select 'map_rls_enabled' as check_name, count(*) as found
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('map_layers','map_points','map_geocode_checks','map_spatial_alerts')
  and c.relrowsecurity = true;

select 'map_policies' as check_name, count(*) as found
from pg_policies
where schemaname = 'public'
  and tablename in ('map_layers','map_points','map_geocode_checks','map_spatial_alerts');

select 'map_indexes' as check_name, count(*) as found
from pg_indexes
where schemaname = 'public'
  and indexname in ('map_layers_type_idx','map_points_type_idx','map_points_visibility_idx','map_points_related_idx','map_points_geo_idx','map_points_city_idx','map_geocode_point_idx','map_alerts_status_idx','map_alerts_point_idx');

select 'map_layers_seed' as check_name, count(*) as found
from public.map_layers
where layer_key in ('biens','commerces','friches','materiaux','partenaires','projets','signalements','antennes');

select 'map_test_points' as check_name, count(*) as found
from public.map_points
where source_label = 'TVF OS Test';

select 'map_test_alerts' as check_name, count(*) as found
from public.map_spatial_alerts
where message ilike '%test%';
