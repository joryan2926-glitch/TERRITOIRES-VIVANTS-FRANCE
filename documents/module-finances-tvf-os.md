# Module Finances TVF OS

Statut : developpe, en attente de validation production authentifiee.

## Objectif

Suivre les budgets, depenses, financements, paiements, justificatifs et obligations de reporting de Territoires Vivants France.

## Utilisateurs

- Direction nationale : pilotage financier global.
- Responsables d'antenne : budgets locaux et depenses.
- Pole Financement & Mecenat : financeurs, appels a projets, candidatures.
- Equipe administrative : justificatifs, paiements, reporting.
- Auditeurs : lecture controlee des budgets, depenses et rapports.

## Fonctionnalites livrees

- Page admin securisee `admin-finances.html` par `TVF_ADMIN_TOKEN`.
- API `api/admin-finances.js` avec validation stricte des donnees financieres.
- Gestion des financeurs et mecenes.
- Gestion des appels a projets, dispositifs et opportunites de financement.
- Gestion des demandes de financement.
- Gestion des budgets projet, antenne, national, action ou subvention.
- Gestion des lignes budgetaires via API.
- Gestion des depenses, engagements et justificatifs.
- Gestion des paiements manuels ou Stripe-ready.
- Journal `stripe_events` pour les futurs webhooks Stripe.
- Reporting financeur, budgetaire et justificatif.
- Assistant finance : alertes de depassement, justificatifs manquants, incoherences budget/depenses, reporting a produire.
- Export CSV des vues.
- Navigation depuis Dashboard et modules admin existants.

## Tables Supabase

- `funders`
- `funding_opportunities`
- `funding_applications`
- `budgets`
- `budget_lines`
- `expenses`
- `payment_records`
- `stripe_events`
- `finance_reports`

## RLS

Lecture autorisee aux roles :

- `national_admin`
- `branch_manager`
- `finance_manager`
- `case_manager`
- `auditor`

Gestion autorisee selon sensibilite :

- budgets, depenses, financeurs, opportunites, candidatures, reporting : `national_admin`, `finance_manager`, `branch_manager`
- paiements et Stripe : `national_admin`, `finance_manager`

## Automatisations

- Score automatique des opportunites selon statut, montant et echeance.
- Alerte de depassement budgetaire.
- Passage budget en `to_review` si le budget est depasse.
- Rappel justificatif via assistant pour les depenses sans piece.
- Date de paiement automatique quand une depense passe en `paid`.
- Generation d'un reporting financeur depuis un budget ou une demande.

## Guide migration production

1. Appliquer la migration :

```bash
supabase db query --linked --file supabase/tvf-os-finances.sql
```

2. Inserer les donnees de test :

```bash
supabase db query --linked --file supabase/tvf-os-finances-test-data.sql
```

3. Verifier la migration :

```bash
supabase db query --linked --file supabase/tvf-os-finances-verification.sql --output json
```

Tous les controles doivent retourner :

- `finances_tables = 9`
- `finances_rls_enabled = 9`
- `finances_policies = 18`
- `finances_indexes = 16`
- `finances_seed_funders = 2`
- `finances_test_funder >= 1`
- `finances_test_opportunity = 1`
- `finances_test_budget = 1`
- `finances_expenses_to_approve >= 1`
- `finances_reports_draft >= 1`

## Tests locaux

```bash
node tests/admin-finances-api.test.js
```

## Tests production attendus

- `/admin-finances` doit repondre `200`.
- `/api/admin-finances` sans token doit repondre `401`.
- Avec token admin, les vues Budgets, Depenses, Financeurs, Appels a projets, Demandes, Paiements et Reporting doivent charger.
- Le bouton Finances doit etre visible depuis le Dashboard.
- La creation d'un budget test doit fonctionner.
- La generation d'un reporting doit fonctionner.

## Critere de verrouillage

Le module sera verrouille apres validation production a 100 %.
