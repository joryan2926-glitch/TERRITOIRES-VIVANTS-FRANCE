# Module Gestion des antennes - TVF OS

Date : 2026-07-08
Statut : developpement MVP production pret pour validation.

## Objectif

Le module Gestion des antennes permet de creer, superviser et faire grandir les antennes TVF avec un processus unique : fiche antenne, territoire, responsable, poles actifs, equipe, checklist de lancement, formation, maturite et pack de lancement.

## Perimetre fonctionnel livre

- Creation et mise a jour d'une antenne.
- Suivi du statut : prefiguration, lancement, operationnelle, pause, cloturee, archive.
- Suivi de maturite : idee, prefiguration, lancement, operationnelle, confirmee, formatrice.
- Validation nationale.
- Poles actifs par antenne.
- Checklist de lancement avec priorite, echeance, statut et preuve future.
- Equipe locale avec role, pole, disponibilite, competences et statut.
- Parcours de formation par antenne.
- Assistant deterministe : score de preparation, blocages, maturite suggeree, prochaines actions.
- Generation d'un pack de lancement : fiche, checklist, modeles, formation, tableau de bord local.
- Export CSV de la liste des antennes.

## Fichiers livres

- `admin-branches.html`
- `admin-branches.js`
- `api/admin-branches.js`
- `supabase/tvf-os-branches.sql`
- `supabase/tvf-os-branches-test-data.sql`
- `supabase/tvf-os-branches-verification.sql`
- `tests/admin-branches-api.test.js`

## Tables Supabase

- `branches`
- `poles`
- `branch_poles`
- `branch_launch_checklist_items`
- `branch_team_members`
- `branch_training_items`

## RLS

La migration active RLS sur les 6 tables et prepare les roles Supabase Auth futurs :

- lecture : `national_admin`, `branch_manager`, `branch_builder`, `auditor` ;
- gestion antennes : `national_admin`, `branch_builder` ;
- gestion poles/checklist/equipe/formation : `national_admin`, `branch_builder`, `branch_manager` ;
- gestion du referentiel national `poles` : `national_admin`.

L'API serveur utilise `SUPABASE_SERVICE_ROLE_KEY` et reste protegee par `TVF_ADMIN_TOKEN`.

## API

Endpoint : `/api/admin-branches`

GET :

- `entity=dashboard`
- `entity=branches`
- `entity=poles`
- `entity=branch_poles`
- `entity=checklist`
- `entity=team`
- `entity=training`

POST :

- `type=branch`
- `type=pole`
- `type=checklist`
- `type=team`
- `type=training`
- `type=generate_pack`

PATCH :

- mise a jour selon `type` et `id`.

## Assistant IA local

Le module embarque une logique deterministe en attendant le branchement d'un modele IA externe :

- score checklist ;
- score formation ;
- equipe active ;
- poles actifs ;
- blocages critiques ;
- maturite suggeree ;
- prochaines actions ;
- contenu du pack de lancement.

## Procedure Supabase

1. Appliquer `supabase/tvf-os-branches.sql`.
2. Appliquer `supabase/tvf-os-branches-test-data.sql`.
3. Executer `supabase/tvf-os-branches-verification.sql`.

Resultats attendus :

- `branches_tables = 6`
- `branches_rls_enabled = 6`
- `branches_policies = 12`
- `branches_indexes = 7`
- `branches_seed_poles >= 10`
- `branches_test_branch = 1`
- `branches_test_poles >= 3`
- `branches_test_checklist >= 4`
- `branches_test_team >= 3`
- `branches_test_training >= 3`

## Tests

Commandes :

```bash
node --check api/admin-branches.js
node --check admin-branches.js
node tests/admin-branches-api.test.js
```

## Limites connues

- Les invitations utilisateurs reelles seront finalisees avec le futur module Utilisateurs/Roles.
- Les preuves documentaires utilisent `evidence_document_id` mais l'interface d'attachement fichier sera approfondie avec l'integration documentaire transverse.
- La cartographie physique des antennes pourra etre enrichie via le module Cartographie existant.
