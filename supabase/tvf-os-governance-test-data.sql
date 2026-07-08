-- TVF OS - Module Gouvernance et decisions - donnees de test

with committee_seed as (
  insert into public.committees (committee_key, title, committee_type, status, scheduled_at, location_label, facilitator_name, attendees, agenda_summary, minutes_status, ai_summary)
  values ('COM-TEST-GOUV-001', 'Comite de gouvernance pilote', 'governance', 'scheduled', now() + interval '7 days', 'Visio TVF', 'Direction nationale', array['Direction nationale','Responsable antenne test'], 'Validation antenne pilote, budget initial et actions de lancement.', 'draft', 'Comite a preparer : 3 decisions attendues, PV a valider.')
  on conflict (committee_key) do update set updated_at = now()
  returning id
), selected_committee as (
  select id from committee_seed
  union all select id from public.committees where committee_key = 'COM-TEST-GOUV-001'
  limit 1
), decision_seed as (
  insert into public.decisions (decision_number, committee_id, decision_type, title, summary, status, priority_level, decided_by, decided_at, validation_required, related_object_type, ai_summary)
  select 'DEC-TEST-001', id, 'branch', 'Valider le lancement de l antenne pilote', 'Decision de validation du lancement operationnel d une antenne test.', 'to_validate', 'critique', 'Direction nationale', null, true, 'branch', 'Decision critique : validation humaine requise avant execution.' from selected_committee
  on conflict (decision_number) do update set updated_at = now()
  returning id, committee_id
), selected_decision as (
  select id, committee_id from decision_seed
  union all select id, committee_id from public.decisions where decision_number = 'DEC-TEST-001'
  limit 1
)
insert into public.committee_items (committee_id, decision_id, item_order, item_type, title, summary, presenter_name, status, expected_outcome)
select committee_id, id, 1, 'decision', 'Validation antenne pilote', 'Statuer sur le passage en lancement.', 'Direction nationale', 'ready', 'Decision validee ou reportee' from selected_decision
on conflict do nothing;

with selected_decision as (select id from public.decisions where decision_number = 'DEC-TEST-001' limit 1)
insert into public.decision_votes (decision_id, voter_name, voter_role, vote_value, comment)
select id, 'Direction nationale', 'national_admin', 'approve', 'Favorable sous reserve de finaliser le kit.' from selected_decision
union all select id, 'Responsable antenne', 'branch_manager', 'needs_changes', 'Besoin de clarifier les actions de lancement.' from selected_decision;

with selected_decision as (select id from public.decisions where decision_number = 'DEC-TEST-001' limit 1)
insert into public.decision_actions (decision_id, action_title, owner_name, status, priority_level, due_at, notes)
select id, 'Finaliser le kit de lancement', 'Responsable antenne', 'in_progress', 'fort', now() + interval '10 days', 'Modeles et checklist a finaliser.' from selected_decision
union all select id, 'Planifier le PV de validation', 'Direction nationale', 'todo', 'moyen', now() + interval '8 days', 'PV a generer apres decision.' from selected_decision;

with selected_decision as (select id from public.decisions where decision_number = 'DEC-TEST-001' limit 1)
insert into public.delegations (delegation_key, delegated_to, delegated_by, scope, status, starts_at, ends_at, decision_id, limits)
select 'DEL-TEST-001', 'Responsable antenne test', 'Direction nationale', 'Animation locale et suivi de lancement', 'active', current_date, current_date + interval '180 days', id, 'Aucune depense engageante sans validation nationale.' from selected_decision
on conflict (delegation_key) do update set updated_at = now();
