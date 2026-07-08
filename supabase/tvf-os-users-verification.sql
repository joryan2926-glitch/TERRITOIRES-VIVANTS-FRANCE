-- TVF OS - Module Utilisateurs, roles et permissions - verification

select 'users_tables' as check_name, count(*)::int as value
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles','roles','permissions','role_permissions','user_roles','user_branch_memberships','user_invitations','access_reviews')
union all
select 'users_rls_enabled', count(*)::int
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','roles','permissions','role_permissions','user_roles','user_branch_memberships','user_invitations','access_reviews')
  and rowsecurity = true
union all
select 'users_policies', count(*)::int
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','roles','permissions','role_permissions','user_roles','user_branch_memberships','user_invitations','access_reviews')
union all
select 'users_indexes', count(*)::int
from pg_indexes
where schemaname = 'public'
  and indexname in ('profiles_status_idx','roles_status_idx','permissions_module_idx','role_permissions_role_idx','user_roles_profile_idx','user_branch_memberships_profile_idx','user_invitations_status_idx','access_reviews_status_idx')
union all
select 'users_seed_roles', count(*)::int from public.roles
union all
select 'users_seed_permissions', count(*)::int from public.permissions
union all
select 'users_role_permissions', count(*)::int from public.role_permissions
union all
select 'users_test_profile', count(*)::int from public.profiles where email = 'camille.martin@example.test'
union all
select 'users_test_role_assignments', count(*)::int from public.user_roles ur join public.profiles p on p.id = ur.profile_id where p.email = 'camille.martin@example.test'
union all
select 'users_test_invitations', count(*)::int from public.user_invitations where email = 'benevole.test@example.test';
