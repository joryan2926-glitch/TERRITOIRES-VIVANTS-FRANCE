-- Territoires Vivants France
-- TVF OS - Module Dashboard
-- Donnees de test anonymisees et reversibles pour validation Supabase.
-- A executer uniquement en preproduction ou, si besoin, en production avec suppression immediate apres validation.

insert into public.contacts (
  full_name,
  email,
  subject,
  message,
  consent,
  source_page,
  status,
  priority,
  category,
  assigned_to,
  internal_notes,
  last_follow_up_at,
  closed_at,
  created_at,
  updated_at
)
values
  (
    '[TEST DASHBOARD] Proprietaire demo',
    'test-dashboard-proprietaire@territoiresvivantsfrance.fr',
    '[TEST DASHBOARD] Bien vacant a qualifier',
    'Donnee de test reversible pour valider le Dashboard TVF OS.',
    true,
    'dashboard-test',
    'nouveau',
    'urgente',
    'bien-vacant-proprietaire',
    null,
    'Test Dashboard - peut etre supprime.',
    now() - interval '3 days',
    null,
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '[TEST DASHBOARD] Collectivite demo',
    'test-dashboard-collectivite@territoiresvivantsfrance.fr',
    '[TEST DASHBOARD] Rendez-vous territoire',
    'Donnee de test reversible pour valider le Dashboard TVF OS.',
    true,
    'dashboard-test',
    'rendez_vous',
    'haute',
    'collectivite-territoire',
    'Referent TVF test',
    'Test Dashboard - peut etre supprime.',
    now() - interval '1 day',
    null,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '[TEST DASHBOARD] Materiaux demo',
    'test-dashboard-materiaux@territoiresvivantsfrance.fr',
    '[TEST DASHBOARD] Lot materiaux archive',
    'Donnee de test reversible pour valider le Dashboard TVF OS.',
    true,
    'dashboard-test',
    'archive',
    'normale',
    'materiaux-reemploi',
    'Referent TVF test',
    'Test Dashboard - peut etre supprime.',
    now() - interval '5 days',
    now() - interval '2 days',
    now() - interval '5 days',
    now() - interval '2 days'
  );

-- Verification rapide apres insertion :
select
  count(*) as dashboard_test_rows,
  count(*) filter (where status = 'nouveau') as nouveaux,
  count(*) filter (where priority = 'urgente') as urgentes,
  count(*) filter (where category = 'bien-vacant-proprietaire') as habitat
from public.contacts
where source_page = 'dashboard-test'
  and subject like '[TEST DASHBOARD]%';

-- Nettoyage apres validation :
-- delete from public.contacts
-- where source_page = 'dashboard-test'
--   and subject like '[TEST DASHBOARD]%';
