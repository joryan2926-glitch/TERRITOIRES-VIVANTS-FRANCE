-- TVF OS - Module Base de connaissances
-- Donnees de test non destructives pour validation production.

insert into public.knowledge_articles (
  article_key,
  title,
  article_type,
  status,
  content,
  summary,
  tags,
  confidentiality_level,
  validated_by
)
values (
  'test-pieces-bien-vacant',
  'Test - pieces a demander pour un bien vacant',
  'faq',
  'valide',
  'Pour qualifier un bien vacant, TVF verifie au minimum l identite du demandeur, l adresse du bien, les photos recentes, le contexte d occupation, les autorisations disponibles et les contraintes connues. Les pieces sensibles doivent rester en acces interne controle.',
  'Liste de pieces minimales pour qualifier un bien vacant avant decision humaine.',
  array['bien vacant','pieces','qualification'],
  'interne',
  'TVF OS'
)
on conflict (article_key) do update set
  title = excluded.title,
  article_type = excluded.article_type,
  status = excluded.status,
  content = excluded.content,
  summary = excluded.summary,
  tags = excluded.tags,
  confidentiality_level = excluded.confidentiality_level,
  validated_by = excluded.validated_by,
  updated_at = now();

insert into public.knowledge_sources (article_id, source_label, source_type, related_object_type, citation_note)
select id, 'Procedure test qualification bien vacant', 'procedure', 'procedure', 'Source de test issue du module Procedures.'
from public.knowledge_articles
where article_key = 'test-pieces-bien-vacant'
on conflict (article_id, source_label) do update set citation_note = excluded.citation_note;

insert into public.lessons_learned (
  title,
  lesson_type,
  source_object_type,
  context,
  lesson,
  impact_level,
  proposed_action,
  status,
  tags
)
values (
  'Test - verifier les photos avant visite',
  'bonne_pratique',
  'none',
  'Retour de test pour capitaliser une preparation de visite.',
  'Demander les photos recentes avant de mobiliser une visite terrain evite les deplacements inutiles.',
  'moyen',
  'Ajouter cette verification aux checklists de qualification.',
  'a_capitaliser',
  array['visite','photos','bien vacant']
)
on conflict do nothing;

select a.article_key, a.status, a.article_type, count(distinct s.id) as sources
from public.knowledge_articles a
left join public.knowledge_sources s on s.article_id = a.id
where a.article_key = 'test-pieces-bien-vacant'
group by a.id;
