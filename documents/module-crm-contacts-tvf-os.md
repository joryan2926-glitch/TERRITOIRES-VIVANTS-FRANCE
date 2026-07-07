# TVF OS - Module CRM / Contacts

Statut : developpe localement, pret pour migration Supabase puis validation production.

Page : `admin-crm.html`  
Script : `admin-crm.js`  
API : `/api/admin-crm`  
Migration : `supabase/tvf-os-crm.sql`

## Objectif

Centraliser les personnes et structures en relation avec Territoires Vivants France : proprietaires, elus, techniciens, entreprises, benevoles, financeurs, journalistes, collectivites, associations, institutions et partenaires.

Le module CRM est le socle relationnel qui permet aux demandes entrantes d'etre rattachees a des personnes et organisations fiables. Il ne developpe pas encore les modules Dossiers, Taches, Agenda, Documents ou E-mails automatiques.

## Fonctionnalites livrees

- Acces securise par `TVF_ADMIN_TOKEN`.
- Vue Contacts.
- Vue Organisations.
- Vue Doublons a verifier.
- Indicateurs CRM : contacts, organisations, consentements manquants, relances en retard, doublons.
- Creation de contact.
- Creation d'organisation.
- Fiche contact editable.
- Fiche organisation editable.
- Consentement RGPD.
- Niveau de confidentialite.
- Tags.
- Notes internes.
- Prochaine action et echeance.
- Historique relationnel.
- Rattachements contact-organisation cote base de donnees.
- Export CSV.

## Assistant IA

Le module integre un assistant deterministe, testable et explicable. Il propose :

- type de contact ;
- type d'organisation ;
- synthese relationnelle ;
- points manquants ;
- prochaine action ;
- echeance ;
- cle de detection doublon.

L'objectif est de fiabiliser le CRM sans appel IA externe dans cette phase MVP.

## Base de donnees

Tables creees :

- `crm_contacts` : personnes physiques ;
- `organizations` : structures externes ;
- `organization_contacts` : relations n-n ;
- `relationship_history` : journal relationnel ;
- `crm_duplicate_suggestions` : doublons a verifier.

La table historique `contacts` reste reservee au module Demandes entrantes et n'est pas modifiee par ce module CRM.

## API

`GET /api/admin-crm?entity=contacts`

- Liste les contacts CRM.
- Filtres : `q`, `contact_type`, `consent_status`.

`GET /api/admin-crm?entity=organizations`

- Liste les organisations.
- Filtres : `q`, `organization_type`, `relation_status`.

`GET /api/admin-crm?entity=history`

- Liste l'historique d'un contact ou d'une organisation.

`GET /api/admin-crm?entity=duplicates`

- Liste les doublons en attente.

`GET /api/admin-crm?entity=dashboard`

- Retourne les indicateurs CRM.

`POST /api/admin-crm`

- `type: contact` : cree un contact ;
- `type: organization` : cree une organisation ;
- `type: history` : ajoute une note ou interaction ;
- `type: link` : rattache contact et organisation.

`PATCH /api/admin-crm`

- `type: contact` : met a jour un contact ;
- `type: organization` : met a jour une organisation ;
- `type: duplicate` : confirme ou ignore un doublon.

## Securite

- API protegee par `TVF_ADMIN_TOKEN`.
- Cle Supabase service role uniquement cote serveur.
- RLS activee sur toutes les tables CRM.
- Policies preparees pour futurs roles Supabase Auth : `national_admin`, `branch_manager`, `crm_manager`, `request_manager`.

## Tests

Commandes validees localement :

```bash
node tests/admin-crm-api.test.js
node tests/admin-contacts-api.test.js
node tests/dashboard-api.test.js
node --check api/admin-crm.js
node --check admin-crm.js
```

## Limites assumees

- Pas encore de fusion automatique destructrice de doublons : les suggestions sont confirmees/ignorees.
- Pas encore de rattachement automatique depuis une demande entrante en production UI, seulement le socle API/base est pret.
- Pas encore de gestion documentaire/conventions dans l'interface, seulement les champs relationnels et historiques.
- Pas encore de comptes utilisateurs Supabase Auth ; l'acces production reste protege par token admin serveur.
