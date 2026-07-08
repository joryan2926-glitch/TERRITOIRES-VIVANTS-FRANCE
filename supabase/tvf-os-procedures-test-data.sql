-- TVF OS - Module Procedures
-- Donnees de test non destructives pour validation production.

insert into public.procedures (
  procedure_key,
  title,
  scope,
  module_key,
  pole,
  status,
  mandatory_level,
  owner_label,
  summary,
  tags,
  related_template_keys
)
values (
  'test-qualification-bien-vacant',
  'Test - qualification d un bien vacant',
  'national',
  'Dossiers',
  'Habitat vivant',
  'active',
  'obligatoire',
  'Referent procedures TVF',
  'Procedure de test pour valider les checklists actives du module Procedures.',
  array['bien vacant','qualification','decision'],
  array['test-demande-pieces-complementaires']
)
on conflict (procedure_key) do update set
  title = excluded.title,
  status = excluded.status,
  mandatory_level = excluded.mandatory_level,
  owner_label = excluded.owner_label,
  summary = excluded.summary,
  tags = excluded.tags,
  related_template_keys = excluded.related_template_keys,
  updated_at = now();

insert into public.procedure_steps (procedure_id, step_order, title, step_type, description, required, evidence_required, expected_document_type, responsible_role)
select p.id, v.step_order, v.title, v.step_type, v.description, v.required, v.evidence_required, v.expected_document_type, v.responsible_role
from public.procedures p
cross join (values
  (1, 'Identifier le demandeur et le bien', 'verification', 'Verifier les coordonnees, adresse, contexte et source.', true, false, null, 'Referent dossier'),
  (2, 'Demander les pieces utiles', 'document', 'Lister photos, autorisation, mandat ou justificatif si necessaire.', true, true, 'piece', 'Referent dossier'),
  (3, 'Preparer la decision humaine', 'decision', 'Synthese des risques, suites possibles et points de validation.', true, false, null, 'Responsable pole')
) as v(step_order, title, step_type, description, required, evidence_required, expected_document_type, responsible_role)
where p.procedure_key = 'test-qualification-bien-vacant'
on conflict (procedure_id, step_order) do update set
  title = excluded.title,
  step_type = excluded.step_type,
  description = excluded.description,
  required = excluded.required,
  evidence_required = excluded.evidence_required,
  expected_document_type = excluded.expected_document_type,
  responsible_role = excluded.responsible_role,
  updated_at = now();

with target as (
  select id from public.procedures where procedure_key = 'test-qualification-bien-vacant'
), kept as (
  select min(a.id::text)::uuid as keep_id
  from public.procedure_applications a
  join target t on t.id = a.procedure_id
  where a.related_object_type = 'none' and a.related_object_id is null
)
delete from public.procedure_applications a
using target t, kept k
where a.procedure_id = t.id
  and a.related_object_type = 'none'
  and a.related_object_id is null
  and k.keep_id is not null
  and a.id <> k.keep_id;

insert into public.procedure_applications (procedure_id, related_object_type, related_object_id, assigned_to, status)
select p.id, 'none', null, 'Referent TVF test', 'active'
from public.procedures p
where p.procedure_key = 'test-qualification-bien-vacant'
  and not exists (
    select 1 from public.procedure_applications a
    where a.procedure_id = p.id and a.related_object_type = 'none' and a.related_object_id is null
  );

select p.procedure_key, p.status, p.mandatory_level, count(distinct s.id) as steps, count(distinct a.id) as applications
from public.procedures p
left join public.procedure_steps s on s.procedure_id = p.id
left join public.procedure_applications a on a.procedure_id = p.id
where p.procedure_key = 'test-qualification-bien-vacant'
group by p.id;
