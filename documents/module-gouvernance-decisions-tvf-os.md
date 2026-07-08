# Module Gouvernance et decisions - TVF OS

Date : 2026-07-08
Statut : developpement MVP production pret pour validation.

## Objectif

Le module Gouvernance et decisions trace les decisions importantes de TVF, les comites, les ordres du jour, les proces-verbaux, les votes ou validations, les delegations et les actions issues.

## Perimetre livre

- Registre des decisions.
- Fiche decision avec statut, priorite, objet lie, validation humaine et documents sources.
- Comites avec participants, agenda, statut et PV.
- Points d'ordre du jour.
- Votes et validations par decision.
- Delegations avec perimetre, dates, limites et decision support.
- Actions issues de decisions ou comites.
- Generation de PV sous forme de pack structure.
- Assistant deterministe : score de validation, blocages, actions ouvertes, retards et prochaines priorites.
- Export CSV de la vue active.

## Fichiers livres

- `admin-governance.html`
- `admin-governance.js`
- `api/admin-governance.js`
- `supabase/tvf-os-governance.sql`
- `supabase/tvf-os-governance-test-data.sql`
- `supabase/tvf-os-governance-verification.sql`
- `tests/admin-governance-api.test.js`

## Tables Supabase

- `decisions`
- `committees`
- `committee_items`
- `decision_votes`
- `delegations`
- `decision_actions`

## RLS

RLS est activee sur les 6 tables. Les policies preparent les roles futurs :

- lecture : `national_admin`, `branch_manager`, `governance_manager`, `auditor` ;
- gestion : `national_admin`, `branch_manager`, `governance_manager` ;
- delegations : gestion limitee a `national_admin` et `governance_manager`.

L'API serveur reste protegee par `TVF_ADMIN_TOKEN` et utilise `SUPABASE_SERVICE_ROLE_KEY`.

## API

Endpoint : `/api/admin-governance`

GET :

- `entity=dashboard`
- `entity=decisions`
- `entity=committees`
- `entity=items`
- `entity=votes`
- `entity=delegations`
- `entity=actions`

POST :

- `type=decision`
- `type=committee`
- `type=item`
- `type=vote`
- `type=delegation`
- `type=action`
- `type=generate_minutes`

PATCH :

- mise a jour selon `type` et `id`.

## Assistant IA local

Le module embarque une logique deterministe avant branchement IA externe :

- calcul du score de validation ;
- detection des votes bloquants ;
- detection des actions ouvertes et en retard ;
- suggestion de statut ;
- preparation de synthese PV ;
- priorites de gouvernance.

## Procedure Supabase

1. Appliquer `supabase/tvf-os-governance.sql`.
2. Appliquer `supabase/tvf-os-governance-test-data.sql`.
3. Executer `supabase/tvf-os-governance-verification.sql`.

Resultats attendus :

- `governance_tables = 6`
- `governance_rls_enabled = 6`
- `governance_policies = 12`
- `governance_indexes = 7`
- `governance_test_decisions = 1`
- `governance_test_committees = 1`
- `governance_test_items >= 1`
- `governance_test_votes >= 2`
- `governance_test_actions >= 2`
- `governance_test_delegations = 1`

## Tests

```bash
node --check admin-governance.js
node --check api/admin-governance.js
node tests/admin-governance-api.test.js
```

## Limites connues

- Les signatures electroniques et votes juridiquement opposables seront traites avec les integrations futures.
- Les PV sont generes sous forme de pack structure, pas encore en document PDF/DOCX automatique.
- Les liens profonds vers dossiers, documents et risques sont prepares par `related_object_type` et `related_object_id`.
