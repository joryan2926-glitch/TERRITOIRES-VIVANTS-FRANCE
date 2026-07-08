-- TVF OS - Impact et statistiques - donnees de test production controlables.

with metric as (
  insert into public.impact_metrics (
    metric_key,
    metric_name,
    metric_type,
    metric_scope,
    unit,
    description,
    calculation_method,
    status,
    required_proof_type,
    created_by
  )
  values (
    'test-impact-heures-benevoles',
    'Heures benevoles test',
    'volunteer',
    'branch',
    'heures',
    'Indicateur test pour verifier les valeurs prouvees.',
    'Somme des heures validees avec preuve.',
    'active',
    'attendance',
    'TVF OS test'
  )
  on conflict (metric_key) do update set
    metric_name = excluded.metric_name,
    status = excluded.status
  returning id
),
proof as (
  insert into public.impact_proofs (
    proof_title,
    proof_type,
    status,
    url,
    related_object_type,
    confidentiality_level,
    checked_by,
    checked_at,
    notes,
    created_by
  )
  values (
    'Preuve test heures benevoles',
    'attendance',
    'validated',
    'https://www.territoiresvivantsfrance.fr',
    'impact',
    'interne',
    'TVF OS',
    now(),
    'Preuve test validee pour le module Impact.',
    'TVF OS test'
  )
  returning id
)
insert into public.impact_values (
  metric_id,
  period_start,
  period_end,
  value_numeric,
  value_text,
  before_value,
  after_value,
  status,
  reliability_level,
  proof_id,
  source_label,
  notes,
  validated_by
)
select
  metric.id,
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month',
  42,
  '42 heures benevoles documentees',
  0,
  42,
  'validated',
  'verifie',
  proof.id,
  'TVF OS test',
  'Valeur test validee avec preuve.',
  'TVF OS'
from metric, proof;

insert into public.impact_reports (
  report_title,
  report_type,
  status,
  summary,
  generated_by,
  ai_summary
)
values (
  'Bilan impact test',
  'national',
  'to_validate',
  'Bilan test genere pour verifier le module Impact.',
  'TVF OS test',
  'Bilan test pret pour validation humaine.'
)
on conflict do nothing;

insert into public.impact_exports (
  export_title,
  export_format,
  status,
  filters,
  generated_by
)
values (
  'Export impact test',
  'csv',
  'ready',
  '{"scope":"test"}'::jsonb,
  'TVF OS test'
)
on conflict do nothing;
