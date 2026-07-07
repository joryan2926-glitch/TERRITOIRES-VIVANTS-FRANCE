-- TVF OS - Verification module CRM / Contacts
-- A executer apres tvf-os-crm.sql.

with expected_tables as (
  select unnest(array['crm_contacts','organizations','organization_contacts','relationship_history','crm_duplicate_suggestions']) as table_name
)
select e.table_name, case when t.table_name is null then false else true end as exists
from expected_tables e
left join information_schema.tables t on t.table_schema = 'public' and t.table_name = e.table_name
order by e.table_name;

select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in ('crm_contacts','organizations','organization_contacts','relationship_history','crm_duplicate_suggestions')
order by relname;

select tablename, count(*) as policies
from pg_policies
where schemaname = 'public'
  and tablename in ('crm_contacts','organizations','organization_contacts','relationship_history','crm_duplicate_suggestions')
group by tablename
order by tablename;

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'crm_contacts_email_idx',
    'crm_contacts_type_idx',
    'crm_contacts_consent_idx',
    'crm_contacts_duplicate_key_idx',
    'crm_contacts_next_action_idx',
    'crm_contacts_tags_gin_idx',
    'organizations_type_idx',
    'organizations_duplicate_key_idx',
    'organizations_city_idx',
    'organizations_next_action_idx',
    'organizations_tags_gin_idx',
    'organization_contacts_contact_idx',
    'organization_contacts_organization_idx',
    'relationship_history_contact_idx',
    'relationship_history_organization_idx',
    'crm_duplicate_suggestions_status_idx'
  )
order by indexname;

select
  (select count(*) from public.crm_contacts where archived_at is null) as crm_contacts_active,
  (select count(*) from public.organizations where archived_at is null) as organizations_active,
  (select count(*) from public.organization_contacts where end_date is null) as active_links,
  (select count(*) from public.relationship_history) as history_items,
  (select count(*) from public.crm_duplicate_suggestions where status = 'pending') as pending_duplicates;
