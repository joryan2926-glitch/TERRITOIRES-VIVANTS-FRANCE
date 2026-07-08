# Module Observatoire territorial TVF OS

Statut : developpe, en attente de validation production authentifiee.

## Objectif

Transformer les donnees territoriales en priorites operationnelles pour TVF : sources fiables, indicateurs, diagnostics, notes de veille et preparation des antennes.

## Utilisateurs

- Direction nationale : vision des priorites et diagnostics.
- Responsables d'antenne : suivi du territoire et arbitrage local.
- Pole Observatoire & Donnees : qualification, fiabilite, veille.
- Cartographie / dossiers : rattachement aux points et actions terrain.
- Auditeurs : lecture controlee des sources, indicateurs et diagnostics.

## Fonctionnalites livrees

- Page admin securisee `admin-observatoire.html` par `TVF_ADMIN_TOKEN`.
- API `api/admin-observatoire.js` avec authentification, validation et acces Supabase service role.
- Gestion des sources territoriales : type, fiabilite, frequence, controle, confidentialite.
- Gestion des indicateurs : type, valeur, tendance, priorite, score, source.
- Gestion des diagnostics : maturite, statut, synthese, opportunites, risques, actions recommandees.
- Gestion de la veille : actualites, dispositifs, appels a projets, risques et partenaires.
- Assistant Observatoire : scores, champs manquants, statut suggere, qualite de donnees.
- Generation de diagnostic depuis les indicateurs/sources/veille d'un territoire.
- Filtres par recherche, territoire, type et statut.
- Edition en fiche detail, archivage, creation et export CSV.
- Navigation depuis Dashboard, Cartographie et modules admin existants.

## Tables Supabase

- `territorial_sources`
- `territorial_indicators`
- `territorial_diagnostics`
- `territorial_watch_items`

La migration `supabase/tvf-os-observatoire.sql` cree les tables, contraintes, triggers, index, RLS et policies.

## RLS

Lecture autorisee aux roles :

- `national_admin`
- `branch_manager`
- `case_manager`
- `map_manager`
- `observatory_manager`
- `auditor`

Gestion autorisee aux roles :

- `national_admin`
- `branch_manager`
- `map_manager`
- `observatory_manager`

## Automatisations

- Calcul et securisation des scores d'indicateurs par trigger.
- Mise a jour automatique des `updated_at`.
- Validation automatique de `validated_at` quand un diagnostic passe en `valide`.
- Syntheses IA de secours si aucun resume n'est fourni.
- Generation d'un diagnostic a partir des donnees territoriales disponibles.

## Guide migration production

1. Appliquer la migration :

```bash
supabase db query --linked --file supabase/tvf-os-observatoire.sql
```

2. Inserer les donnees de test :

```bash
supabase db query --linked --file supabase/tvf-os-observatoire-test-data.sql
```

3. Verifier la migration :

```bash
supabase db query --linked --file supabase/tvf-os-observatoire-verification.sql --output json
```

Tous les controles doivent retourner :

- `observatoire_tables = 4`
- `observatoire_rls_enabled = 4`
- `observatoire_policies = 8`
- `observatoire_indexes >= 10`
- `observatoire_seed_sources = 3`
- `observatoire_test_source = 1`
- `observatoire_test_indicator = 1`
- `observatoire_test_diagnostic = 1`
- `observatoire_watch_to_qualify >= 1`

## Tests locaux

```bash
node tests/admin-observatoire-api.test.js
```

## Tests production attendus

- `https://www.territoiresvivantsfrance.fr/admin-observatoire` doit repondre `200`.
- `https://www.territoiresvivantsfrance.fr/api/admin-observatoire` sans token doit repondre `401`.
- Avec token admin, les vues Sources, Indicateurs, Diagnostics et Veille doivent charger.
- Le bouton Observatoire doit etre visible depuis le Dashboard et la Cartographie.
- La creation d'une source de test doit fonctionner.
- La generation d'un diagnostic depuis un territoire doit fonctionner.

## Critere de verrouillage

Le module sera verrouille apres validation authentifiee sur production, verification Supabase reelle et rapport de conformite a 100 %.
