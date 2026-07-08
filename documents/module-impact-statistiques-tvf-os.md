# Module Impact et statistiques TVF OS

Statut : developpe, en attente de validation production authentifiee.

## Objectif

Mesurer uniquement ce qui est documente, valide et prouve. Le module Impact evite les chiffres inventes ou non fiabilises et sert aux bilans internes, financeurs et publics.

## Utilisateurs

- Direction nationale : impact global et arbitrage.
- Responsables d'antenne : resultats locaux prouves.
- Pole communication : valorisation uniquement validee.
- Financeurs : reporting d'impact.
- Auditeurs : controle des preuves et exclusions.

## Fonctionnalites livrees

- Page admin securisee `admin-impact.html`.
- API `api/admin-impact.js`.
- Indicateurs d'activite et d'impact.
- Valeurs avant/apres, par antenne, pole, projet ou dossier.
- Preuves associees : documents, photos, rapports, factures, emargements, decisions, sources externes.
- Exclusion automatique des valeurs non validees des bilans.
- Bilans d'impact generes depuis les indicateurs prouvables.
- Exports CSV/JSON/PDF-ready.
- Assistant impact : score de fiabilite, preuves manquantes, statut publiable.
- Navigation depuis Dashboard, Finances et modules admin.

## Tables Supabase

- `impact_metrics`
- `impact_values`
- `impact_proofs`
- `impact_reports`
- `impact_exports`

## RLS

Lecture autorisee aux roles :

- `national_admin`
- `branch_manager`
- `impact_manager`
- `case_manager`
- `finance_manager`
- `auditor`

Gestion autorisee aux roles :

- `national_admin`
- `impact_manager`
- `branch_manager`

## Automatisations

- Validation automatique de `validated_at`.
- Fiabilite renforcee quand une valeur validee possede une preuve.
- Bilans generes uniquement depuis les indicateurs publiables.
- Exclusion des brouillons et valeurs rejetees.
- Detection des preuves en attente.

## Guide migration production

```bash
supabase db query --linked --file supabase/tvf-os-impact.sql
supabase db query --linked --file supabase/tvf-os-impact-test-data.sql
supabase db query --linked --file supabase/tvf-os-impact-verification.sql --output json
```

Controles attendus :

- `impact_tables = 5`
- `impact_rls_enabled = 5`
- `impact_policies = 10`
- `impact_indexes >= 9`
- `impact_seed_metrics = 4`
- `impact_test_metric = 1`
- `impact_validated_values >= 1`
- `impact_validated_proofs >= 1`
- `impact_reports_to_validate >= 1`
- `impact_exports_ready >= 1`

## Tests locaux

```bash
node tests/admin-impact-api.test.js
```

## Tests production attendus

- `/admin-impact` doit repondre `200`.
- `/api/admin-impact` sans token doit repondre `401`.
- Avec token admin, les vues Indicateurs, Valeurs, Preuves, Bilans et Exports doivent charger.
- Le bouton Impact doit etre visible depuis le Dashboard.
- La generation d'un bilan doit fonctionner.

## Critere de verrouillage

Le module sera verrouille apres validation production a 100 %.
