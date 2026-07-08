with project_seed as (
  insert into public.work_projects (project_key, title, project_type, status, priority, pole, owner_name, summary, start_at, due_at, progress, ai_summary)
  values ('WORK-TEST-001', 'Lancement operationnel antenne test', 'branch_launch', 'active', 'P2', 'Pilotage national', 'Responsable antenne', 'Projet test de coordination des taches et rendez-vous.', current_date, current_date + interval '21 days', 35, 'Projet actif avec relances et rendez-vous a suivre.')
  on conflict (project_key) do update set updated_at = now()
  returning id
), task_seed as (
  insert into public.work_tasks (task_key, project_id, related_object_type, title, description, status, priority, pole, assigned_to, due_at, checklist, ai_summary, automation_source)
  select 'TASK-TEST-001', id, 'email', 'Relancer la mairie test', 'Demander les pieces manquantes et proposer un rendez-vous.', 'todo', 'P2', 'Collectivites & Territoires', 'Responsable antenne', now() + interval '2 days', array['verifier contact','envoyer brouillon','planifier rendez-vous'], 'Relance issue du triage e-mail.', 'email_triage'
  from project_seed
  on conflict (task_key) do update set updated_at = now()
  returning id, project_id
)
insert into public.work_events (event_key, project_id, task_id, title, event_type, status, starts_at, ends_at, location, attendees, organizer_name, notes, ai_summary)
select 'EVENT-TEST-001', project_id, id, 'Rendez-vous mairie test', 'meeting', 'scheduled', now() + interval '3 days', now() + interval '3 days 1 hour', 'Visio', array['Responsable antenne','Mairie Test'], 'TVF OS', 'Rendez-vous cree depuis le workflow de relance.', 'Evenement lie a la tache de relance.'
from task_seed
on conflict (event_key) do update set updated_at = now();

insert into public.work_automation_rules (rule_key, title, trigger_type, status, conditions, actions)
values ('RULE-EMAIL-P2', 'Creer une tache sur e-mail P1/P2', 'email_received', 'active', '{"priority":["P1","P2"]}'::jsonb, '{"create_task":true,"suggest_due_days":2}'::jsonb)
on conflict (rule_key) do update set updated_at = now();

with task_ref as (select id from public.work_tasks where task_key = 'TASK-TEST-001' limit 1)
insert into public.work_activity_log (object_type, object_id, action, actor_label, payload)
select 'task', id, 'test_task_created', 'TVF OS', jsonb_build_object('source','test-data') from task_ref;
