-- TVF OS - Module Gestion documentaire
-- Donnees de test non destructives pour validation production.

insert into public.templates (
  template_key,
  title,
  template_type,
  status,
  national_validated,
  required_fields,
  description,
  ai_summary
)
values (
  'test-demande-pieces-complementaires',
  'Test - demande de pieces complementaires',
  'courrier',
  'officiel',
  true,
  array['nom','dossier','pieces_manquantes'],
  'Modele de test pour valider la bibliotheque documentaire TVF OS.',
  'Modele officiel de test utilisable pour generer un brouillon.'
)
on conflict (template_key) do update set
  title = excluded.title,
  status = excluded.status,
  national_validated = excluded.national_validated,
  required_fields = excluded.required_fields,
  description = excluded.description,
  ai_summary = excluded.ai_summary,
  updated_at = now();

insert into public.documents (
  document_number,
  title,
  document_type,
  status,
  related_object_type,
  confidentiality_level,
  ai_summary,
  classification_notes
)
values (
  'TEST-DOCUMENTS-001',
  'Test production - piece de classement documentaire',
  'piece',
  'a_valider',
  'none',
  'interne',
  'Document de test cree pour valider le module Gestion documentaire TVF OS.',
  'Classement de test sans fichier binaire.'
)
on conflict (document_number) do update set
  title = excluded.title,
  status = excluded.status,
  confidentiality_level = excluded.confidentiality_level,
  ai_summary = excluded.ai_summary,
  classification_notes = excluded.classification_notes,
  updated_at = now();

insert into public.generated_documents (
  template_id,
  document_id,
  generated_by,
  generated_from_object_type,
  generation_status,
  validation_status,
  missing_fields,
  field_values
)
select t.id, d.id, 'TVF OS', 'none', 'draft_created', 'non_soumis', '{}', '{"nom":"Test TVF"}'::jsonb
from public.templates t
join public.documents d on d.document_number = 'TEST-DOCUMENTS-001'
where t.template_key = 'test-demande-pieces-complementaires'
on conflict (template_id, document_id) do update set
  generation_status = excluded.generation_status,
  validation_status = excluded.validation_status,
  missing_fields = excluded.missing_fields,
  field_values = excluded.field_values;

select d.document_number, d.status, d.document_type, d.confidentiality_level, d.indexed_in_knowledge, t.template_key
from public.documents d
left join public.generated_documents g on g.document_id = d.id
left join public.templates t on t.id = g.template_id
where d.document_number = 'TEST-DOCUMENTS-001';
