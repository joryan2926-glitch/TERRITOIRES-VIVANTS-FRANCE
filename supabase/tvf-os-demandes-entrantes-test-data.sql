-- TVF OS - Donnees de test module Demandes entrantes
-- A executer uniquement sur un environnement de test ou avec suppression immediate.

insert into public.contacts (
  full_name,
  email,
  subject,
  message,
  consent,
  source_page,
  channel,
  status,
  priority,
  category,
  assigned_to,
  missing_pieces,
  internal_notes
) values
(
  'Commune test TVF',
  'commune-test@example.fr',
  'Diagnostic territorial urgent',
  'La mairie souhaite qualifier une friche sur son territoire et organiser un rendez-vous rapidement.',
  true,
  'demandes-entrantes-test',
  'email',
  'nouveau',
  'haute',
  'collectivite-territoire',
  'Referent test',
  array['perimetre geographique', 'interlocuteur referent'],
  'Donnee de test module Demandes entrantes.'
),
(
  'Proprietaire test TVF',
  'proprietaire-test@example.fr',
  'Bien vacant a remettre en usage',
  'Je suis proprietaire d un logement vacant. Adresse communiquee, photos a transmettre.',
  true,
  'demandes-entrantes-test',
  'telephone',
  'a_qualifier',
  'normale',
  'bien-vacant-proprietaire',
  null,
  array['photos recentes', 'situation de propriete ou mandat'],
  'Donnee de test module Demandes entrantes.'
),
(
  'Entreprise materiaux test TVF',
  'materiaux-test@example.fr',
  'Don de materiaux bois',
  'Stock de bois et portes disponibles sous dix jours, quantite a preciser.',
  true,
  'demandes-entrantes-test',
  'whatsapp',
  'en_cours',
  'urgente',
  'materiaux-reemploi',
  'Referent test',
  array['photos', 'conditions d enlevement'],
  'Donnee de test module Demandes entrantes.'
);

select
  request_number,
  channel,
  status,
  priority,
  category,
  pole,
  qualification_score,
  missing_pieces
from public.contacts
where source_page = 'demandes-entrantes-test'
order by created_at desc;

-- Nettoyage apres test :
-- delete from public.contacts where source_page = 'demandes-entrantes-test';
