-- TVF OS - Donnees de test module CRM / Contacts
-- A executer uniquement en environnement de test ou a nettoyer ensuite.

with org as (
  insert into public.organizations (
    name,
    organization_type,
    relation_status,
    email,
    phone,
    city,
    department,
    region,
    tags,
    notes
  ) values (
    'Mairie Test TVF',
    'collectivite',
    'prospect',
    'mairie-test@example.fr',
    '0400000000',
    'Saint-Etienne',
    'Loire',
    'Auvergne-Rhone-Alpes',
    array['test-crm','collectivite'],
    'Donnee de test CRM.'
  ) returning id
), contact as (
  insert into public.crm_contacts (
    display_name,
    email,
    phone,
    contact_type,
    consent_status,
    consent_source,
    tags,
    notes
  ) values (
    'Alice Test TVF',
    'alice-test-crm@example.fr',
    '0600000000',
    'elu',
    'granted',
    'test CRM',
    array['test-crm','elu'],
    'Donnee de test CRM.'
  ) returning id
), link as (
  insert into public.organization_contacts (organization_id, contact_id, role_label, is_primary)
  select org.id, contact.id, 'Elue referente', true from org, contact
  returning id, organization_id, contact_id
)
insert into public.relationship_history (related_contact_id, related_organization_id, interaction_type, subject, summary, created_by)
select link.contact_id, link.organization_id, 'note', 'Test CRM', 'Historique de test du module CRM.', 'TVF OS test'
from link;

select c.display_name, o.name, oc.role_label, rh.subject
from public.organization_contacts oc
join public.crm_contacts c on c.id = oc.contact_id
join public.organizations o on o.id = oc.organization_id
left join public.relationship_history rh on rh.related_contact_id = c.id
where c.email = 'alice-test-crm@example.fr';

-- Nettoyage apres test :
-- delete from public.crm_contacts where email = 'alice-test-crm@example.fr';
-- delete from public.organizations where email = 'mairie-test@example.fr';
