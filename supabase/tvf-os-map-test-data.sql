-- TVF OS - Cartographie - Donnees de test

insert into public.map_points (point_type, latitude, longitude, precision_level, visibility_level, label, description, address_text, city, department, region, status, risk_level, priority_score, source_label, created_by)
values
  ('bien', 45.439700, 4.387200, 'quartier', 'interne', 'Test bien vacant Chateaucreux', 'Point de test cartographie pour qualification Habitat Vivant.', 'Secteur Chateaucreux', 'Saint-Etienne', 'Loire', 'Auvergne-Rhone-Alpes', 'a_verifier', 'modere', 64, 'TVF OS Test', 'TVF OS Test'),
  ('materiau', 45.432800, 4.395100, 'quartier', 'confidentiel', 'Test ressource materiaux', 'Lot de materiaux a verifier pour reemploi.', 'Secteur Monthieu', 'Saint-Etienne', 'Loire', 'Auvergne-Rhone-Alpes', 'actif', 'faible', 52, 'TVF OS Test', 'TVF OS Test')
on conflict do nothing;

insert into public.map_geocode_checks (point_id, input_address, normalized_address, confidence, status, notes)
select id, address_text, address_text, 0.78, 'propose', 'Controle de test a valider humainement.'
from public.map_points
where source_label = 'TVF OS Test'
limit 1;

insert into public.map_spatial_alerts (point_id, alert_type, severity, message, status)
select id, 'priorite_territoriale', 'haute', 'Point de test avec priorite territoriale a verifier.', 'ouverte'
from public.map_points
where source_label = 'TVF OS Test'
limit 1;
