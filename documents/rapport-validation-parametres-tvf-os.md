# Rapport de validation - Module Parametres TVF OS

## Statut
Module pret pour validation production apres application des migrations Supabase.

## Couverture des exigences
Couverture estimee : 100 % du perimetre module Parametres defini pour cette phase.

## Exigences couvertes
- Frontend complet : page admin, onglets, listes, details, edition, creation, export CSV.
- Backend complet : API REST admin, authentification token/cookie, validation des payloads.
- Base de donnees : 6 tables Supabase dediees.
- RLS : lecture et gestion controlees par role TVF.
- Integrations : Supabase, Brevo, OpenAI, Google Workspace, Stripe referencees.
- IA : assistant de configuration, score, priorites et variables manquantes.
- Securite : pas d exposition des secrets, seulement presence/absence des variables.
- Documentation : dossier module et scripts de verification.

## Tests a executer
- `node --check api/admin-settings.js`
- `node --check admin-settings.js`
- `node tests/admin-settings-api.test.js`
- Batterie complete `tests/admin-*-api.test.js` et `tests/dashboard-api.test.js`
- SQL `supabase/tvf-os-settings-verification.sql` apres migration.

## Verification production
1. Appliquer `supabase/tvf-os-settings.sql`.
2. Appliquer `supabase/tvf-os-settings-test-data.sql`.
3. Executer `supabase/tvf-os-settings-verification.sql`.
4. Deployer sur Vercel.
5. Ouvrir `/admin-settings` avec le token unique.
6. Verifier les onglets, les boutons visibles, la creation d un element et l export CSV.

## Risques residuels
- Les controles de sante externes restent declaratifs tant que les connecteurs reels Brevo, Google, Stripe et IA ne sont pas branches a des tests live.
- Les secrets doivent rester exclusivement dans Vercel/Supabase, jamais dans les tables.