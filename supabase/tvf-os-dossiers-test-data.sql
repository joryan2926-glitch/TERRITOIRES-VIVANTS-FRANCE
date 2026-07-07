-- TVF OS - Module Dossiers
-- Donnees de test non destructives pour validation production.

insert into public.cases (
  case_number,
  case_type,
  title,
  status,
  priority,
  main_pole,
  assigned_to,
  summary,
  next_action,
  decision_status,
  risk_level,
  territory
)
values (
  'TEST-DOSSIERS-001',
  'bien_vacant',
  'Test production - bien vacant a qualifier',
  'instruction',
  'haute',
  'Habitat vivant',
  'Referent TVF test',
  'Dossier de test cree pour valider le module Dossiers TVF OS en production.',
  'Verifier les pieces et preparer la decision humaine',
  'a_preparer',
  'modere',
  'Saint-Etienne'
)
on conflict (case_number) do update set
  title = excluded.title,
  status = excluded.status,
  priority = excluded.priority,
  assigned_to = excluded.assigned_to,
  summary = excluded.summary,
  next_action = excluded.next_action,
  decision_status = excluded.decision_status,
  risk_level = excluded.risk_level,
  territory = excluded.territory,
  updated_at = now();

update public.case_checklist_items
set status = 'valide', completed_at = now(), notes = 'Piece validee pour test production.'
where case_id = (select id from public.cases where case_number = 'TEST-DOSSIERS-001')
  and checklist_key in ('identity','territory','need');

insert into public.case_risks (case_id, risk_label, risk_level, mitigation, owner)
select id, 'Test risque juridique', 'modere', 'Verification humaine avant decision.', 'TVF OS'
from public.cases where case_number = 'TEST-DOSSIERS-001'
on conflict do nothing;

insert into public.case_decisions (case_id, decision_type, proposed_decision, decision_status, next_step)
select id, 'orientation', 'Poursuivre l instruction apres verification des pieces.', 'proposee', 'Planifier un point responsable.'
from public.cases where case_number = 'TEST-DOSSIERS-001'
on conflict do nothing;

insert into public.case_status_history (case_id, from_status, to_status, note, created_by)
select id, null, 'instruction', 'Initialisation du dossier de test production.', 'TVF OS'
from public.cases where case_number = 'TEST-DOSSIERS-001'
on conflict do nothing;

select c.case_number, c.status, c.priority, c.maturity_score, count(i.id) as checklist_items
from public.cases c
left join public.case_checklist_items i on i.case_id = c.id
where c.case_number = 'TEST-DOSSIERS-001'
group by c.id;
