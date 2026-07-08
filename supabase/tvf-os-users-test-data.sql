-- TVF OS - Module Utilisateurs, roles et permissions - donnees de test

with profile_seed as (
  insert into public.profiles (first_name, last_name, email, phone, status, notes)
  values ('Camille', 'Martin', 'camille.martin@example.test', '0600000000', 'active', 'Profil test responsable antenne.')
  on conflict (email) do update set updated_at = now()
  returning id
), selected_profile as (
  select id from profile_seed
  union all select id from public.profiles where email = 'camille.martin@example.test'
  limit 1
), selected_role as (
  select id from public.roles where role_key = 'responsable_antenne' limit 1
), selected_branch as (
  select id from public.branches where code = 'TVF-42-STETIENNE' limit 1
)
insert into public.user_roles (profile_id, role_id, branch_id, scope, status, assigned_by)
select p.id, r.id, b.id, 'branch', 'active', 'TVF OS'
from selected_profile p cross join selected_role r left join selected_branch b on true;

with selected_profile as (select id from public.profiles where email = 'camille.martin@example.test' limit 1), selected_branch as (select id from public.branches where code = 'TVF-42-STETIENNE' limit 1)
insert into public.user_branch_memberships (profile_id, branch_id, membership_status, primary_role_label, notes)
select p.id, b.id, 'active', 'Responsable antenne', 'Rattachement test.'
from selected_profile p join selected_branch b on true
on conflict (profile_id, branch_id) do update set membership_status = excluded.membership_status, updated_at = now();

insert into public.user_invitations (email, invited_by, invited_role_key, status, expires_at, message)
values ('benevole.test@example.test', 'TVF OS', 'benevole_encadre', 'pending', now() + interval '14 days', 'Invitation test TVF OS.')
on conflict do nothing;

with selected_profile as (select id from public.profiles where email = 'camille.martin@example.test' limit 1)
insert into public.access_reviews (profile_id, reviewer_name, review_status, risk_level, due_at, findings, required_actions)
select id, 'Direction nationale', 'pending', 'high', now() + interval '30 days', 'Role sensible a revoir apres lancement.', array['Verifier rattachement antenne','Confirmer besoin manage_branch'] from selected_profile;
