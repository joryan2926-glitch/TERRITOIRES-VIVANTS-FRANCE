-- TERRITOIRES VIVANTS FRANCE
-- Nettoyage prudent des demandes de test formulees pendant la validation production.
-- A executer dans Supabase SQL Editor apres verification visuelle des lignes retournees.

-- 1. Controler les demandes de test
select
  id,
  created_at,
  full_name,
  email,
  subject,
  status,
  category,
  priority
from contacts
where lower(coalesce(subject, '')) like '%test technique%'
   or lower(coalesce(message, '')) like '%test technique%'
   or lower(coalesce(full_name, '')) like '%test tvf%'
   or lower(coalesce(source_page, '')) like '%test-codex%'
order by created_at desc;

-- 2. Option recommandee : archiver les tests plutot que supprimer
update contacts
set
  status = 'archive',
  internal_notes = concat_ws(E'\n', coalesce(internal_notes, ''), 'Archive automatique : demande de test technique production TVF.'),
  closed_at = now(),
  updated_at = now()
where lower(coalesce(subject, '')) like '%test technique%'
   or lower(coalesce(message, '')) like '%test technique%'
   or lower(coalesce(full_name, '')) like '%test tvf%'
   or lower(coalesce(source_page, '')) like '%test-codex%';

-- 3. Verification apres archivage
select
  id,
  created_at,
  full_name,
  subject,
  status,
  closed_at
from contacts
where lower(coalesce(subject, '')) like '%test technique%'
   or lower(coalesce(message, '')) like '%test technique%'
   or lower(coalesce(full_name, '')) like '%test tvf%'
   or lower(coalesce(source_page, '')) like '%test-codex%'
order by created_at desc;
