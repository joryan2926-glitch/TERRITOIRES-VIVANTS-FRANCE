-- TVF OS - Observatoire territorial - donnees de test production controlables.

with src as (
  insert into public.territorial_sources (
    source_key,
    source_name,
    source_type,
    territory_label,
    url,
    reliability_level,
    refresh_frequency,
    last_checked_at,
    next_check_at,
    status,
    notes,
    tags,
    confidentiality_level,
    created_by
  )
  values (
    'test-saint-etienne-observatoire',
    'Jeu test observatoire Saint-Etienne',
    'public_data',
    'Saint-Etienne',
    'https://www.insee.fr',
    'officiel',
    'trimestrielle',
    now(),
    now() + interval '90 days',
    'active',
    'Source de test pour verifier le module Observatoire territorial.',
    array['test','saint-etienne','diagnostic'],
    'interne',
    'TVF OS test'
  )
  on conflict (source_key) do update set
    source_name = excluded.source_name,
    territory_label = excluded.territory_label,
    status = excluded.status,
    last_checked_at = excluded.last_checked_at,
    next_check_at = excluded.next_check_at
  returning id
)
insert into public.territorial_indicators (
  indicator_key,
  territory_label,
  indicator_type,
  label,
  value_numeric,
  unit,
  period_label,
  source_id,
  trend,
  priority_level,
  priority_score,
  confidence,
  status,
  ai_summary
)
select
  'test-logements-vacants-saint-etienne',
  'Saint-Etienne',
  'logements_vacants',
  'Logements vacants a qualifier',
  72,
  'signalements',
  '2026',
  src.id,
  'hausse',
  'fort',
  76,
  0.82,
  'valide',
  'Priorite forte pour preparer un diagnostic habitat vivant.'
from src
on conflict (indicator_key) do update set
  value_numeric = excluded.value_numeric,
  trend = excluded.trend,
  priority_level = excluded.priority_level,
  priority_score = excluded.priority_score,
  status = excluded.status;

insert into public.territorial_diagnostics (
  diagnostic_key,
  territory_label,
  status,
  maturity_level,
  summary,
  opportunities,
  risks,
  recommended_actions,
  map_readiness_score,
  data_quality_score,
  priority_score,
  next_review_at
)
values (
  'test-diagnostic-saint-etienne',
  'Saint-Etienne',
  'a_valider',
  'prefiguration',
  'Diagnostic test genere pour valider le module Observatoire territorial.',
  array['Qualifier les logements vacants','Rattacher les points cartographiques'],
  array['Donnees terrain a confirmer'],
  array['Verifier les sources','Organiser une revue antenne','Creer les priorites operationnelles'],
  65,
  78,
  76,
  now() + interval '45 days'
)
on conflict (diagnostic_key) do update set
  status = excluded.status,
  summary = excluded.summary,
  opportunities = excluded.opportunities,
  risks = excluded.risks,
  recommended_actions = excluded.recommended_actions,
  map_readiness_score = excluded.map_readiness_score,
  data_quality_score = excluded.data_quality_score,
  priority_score = excluded.priority_score,
  next_review_at = excluded.next_review_at;

insert into public.territorial_watch_items (
  territory_label,
  title,
  watch_type,
  status,
  opportunity_level,
  due_at,
  url,
  summary,
  created_by
)
values (
  'Saint-Etienne',
  'Veille test - dispositif centre-ville',
  'dispositif',
  'a_qualifier',
  'fort',
  now() + interval '30 days',
  'https://www.territoiresvivantsfrance.fr',
  'Element de veille test a qualifier par l antenne.',
  'TVF OS test'
)
on conflict do nothing;
