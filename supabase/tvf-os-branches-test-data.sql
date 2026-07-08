-- TVF OS - Module Gestion des antennes - donnees de test

with branch_seed as (
  insert into public.branches (
    code, name, territory_name, territory_type, city, department, region, status, maturity_level,
    national_validation_status, responsible_name, responsible_email, target_launch_date, description,
    needs, risks, next_actions, ai_summary, created_by
  ) values (
    'TVF-42-STETIENNE', 'TVF Saint-Etienne', 'Saint-Etienne Metropole', 'intermunicipality', 'Saint-Etienne', 'Loire', 'Auvergne-Rhone-Alpes',
    'launching', 'lancement', 'validated', 'Responsable test', 'antenne-test@territoiresvivantsfrance.fr', current_date + interval '45 days',
    'Antenne pilote pour tester le processus complet de lancement TVF OS.',
    array['referent juridique','kit partenaires','formation CRM'], array['equipe reduite','financement initial a confirmer'], array['finaliser la checklist','activer deux poles','planifier reunion collectivite'],
    'Antenne en lancement : priorite checklist, equipe et premiers partenariats.', 'TVF OS'
  )
  on conflict (code) do update set updated_at = now()
  returning id
), selected_branch as (
  select id from branch_seed
  union all select id from public.branches where code = 'TVF-42-STETIENNE'
  limit 1
)
insert into public.branch_poles (branch_id, pole_id, pole_key, status, referent_name, referent_email, activated_at, objectives)
select b.id, p.id, p.pole_key, 'active', 'Referent ' || p.pole_name, 'referent.' || p.pole_key || '@example.test', now(), 'Lancer le pole avec un premier diagnostic local.'
from selected_branch b
join public.poles p on p.pole_key in ('habitat_vivant','collectivites_territoires','observatoire_donnees')
on conflict (branch_id, pole_key) do update set status = excluded.status, updated_at = now();

with selected_branch as (select id from public.branches where code = 'TVF-42-STETIENNE' limit 1)
insert into public.branch_launch_checklist_items (branch_id, item_key, label, category, status, priority_level, due_date, completed_at, completed_by, notes)
select id, 'responsable_identifie', 'Responsable local identifie', 'gouvernance', 'done', 'critique', current_date - interval '5 days', now(), 'TVF OS', 'Responsable pilote confirme.' from selected_branch
union all select id, 'kit_lancement', 'Kit de lancement transmis', 'documents', 'in_progress', 'fort', current_date + interval '10 days', null, null, 'Modeles et courriers a adapter.' from selected_branch
union all select id, 'crm_initial', 'CRM local initialise', 'outils', 'todo', 'fort', current_date + interval '18 days', null, null, 'Importer contacts publics et partenaires.' from selected_branch
union all select id, 'premier_comite', 'Premier comite local planifie', 'gouvernance', 'blocked', 'critique', current_date + interval '25 days', null, null, 'Salle et ordre du jour a confirmer.' from selected_branch
on conflict (branch_id, item_key) do update set status = excluded.status, updated_at = now();

with selected_branch as (select id from public.branches where code = 'TVF-42-STETIENNE' limit 1)
insert into public.branch_team_members (branch_id, full_name, email, role_label, pole_key, status, availability, skills, onboarded_at, notes)
select id, 'Camille Martin', 'camille.martin@example.test', 'Responsable antenne', 'gouvernance_conformite', 'active', '2 jours/semaine', array['coordination','partenariats'], now(), 'Pilote local.' from selected_branch
union all select id, 'Nora Diallo', 'nora.diallo@example.test', 'Referente observatoire', 'observatoire_donnees', 'active', '1 jour/semaine', array['donnees','diagnostic'], now(), 'Prepare le diagnostic territorial.' from selected_branch
union all select id, 'Julien Petit', 'julien.petit@example.test', 'Benevole materiaux', 'materiautheque_solidaire', 'invited', 'ponctuel', array['logistique','terrain'], null, 'A confirmer.' from selected_branch;

with selected_branch as (select id from public.branches where code = 'TVF-42-STETIENNE' limit 1)
insert into public.branch_training_items (branch_id, training_key, title, status, assigned_to, due_date, completed_at, score, notes)
select id, 'formation_tvf_os', 'Prise en main TVF OS', 'in_progress', 'Camille Martin', current_date + interval '7 days', null, 45, 'Session initiale faite.' from selected_branch
union all select id, 'procedure_demandes', 'Traitement des demandes entrantes', 'todo', 'Equipe antenne', current_date + interval '14 days', null, 0, 'A planifier.' from selected_branch
union all select id, 'conformite_donnees', 'Confidentialite et donnees personnelles', 'done', 'Camille Martin', current_date - interval '3 days', now(), 100, 'Valide.' from selected_branch
on conflict (branch_id, training_key) do update set status = excluded.status, score = excluded.score, updated_at = now();
