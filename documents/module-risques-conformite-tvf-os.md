# Module Risques et conformite - TVF OS

Date : 2026-07-08
Statut : developpement MVP production pret pour validation.

## Objectif

Le module Risques et conformite protege TVF en rendant visibles les blocages avant l'erreur : RGPD, droits d'image, autorisations, assurances, securite terrain, conflits d'interets, donnees sensibles, incidents et audit.

## Perimetre livre

- Registre des risques.
- Controle conformite par objet lie.
- Incidents RGPD, terrain, securite, assurance ou operationnels.
- Consentements et autorisations.
- Journal d'audit des actions sensibles.
- Score de conformite.
- Detection de controles bloquants.
- Detection des risques critiques et incidents ouverts.
- Export CSV de la vue active.
- Assistant deterministe : blocage recommande, mesures correctives, relances et regularisations.

## Fichiers livres

- `admin-risks.html`
- `admin-risks.js`
- `api/admin-risks.js`
- `supabase/tvf-os-risks.sql`
- `supabase/tvf-os-risks-test-data.sql`
- `supabase/tvf-os-risks-verification.sql`
- `tests/admin-risks-api.test.js`

## Tables Supabase

- `risks`
- `compliance_checks`
- `incidents`
- `consent_records`
- `audit_logs`

## RLS

RLS est activee sur les 5 tables. Les policies preparent les roles futurs :

- lecture : `national_admin`, `branch_manager`, `risk_manager`, `compliance_manager`, `auditor` ;
- gestion : `national_admin`, `branch_manager`, `risk_manager`, `compliance_manager` ;
- audit : lecture pour roles d'audit/conformite, insertion pour roles habilites.

L'API serveur reste protegee par `TVF_ADMIN_TOKEN` et utilise `SUPABASE_SERVICE_ROLE_KEY`.

## API

Endpoint : `/api/admin-risks`

GET :

- `entity=dashboard`
- `entity=risks`
- `entity=checks`
- `entity=incidents`
- `entity=consents`
- `entity=audit`

POST/PATCH :

- `type=risk`
- `type=check`
- `type=incident`
- `type=consent`

## Assistant IA local

Le module embarque une logique deterministe avant branchement IA externe :

- score risque severite x probabilite ;
- niveau faible/modere/eleve/critique ;
- recommandation de blocage ;
- controles bloquants ;
- retards de mitigation ;
- score global de conformite ;
- priorites de regularisation.

## Procedure Supabase

1. Appliquer `supabase/tvf-os-risks.sql`.
2. Appliquer `supabase/tvf-os-risks-test-data.sql`.
3. Executer `supabase/tvf-os-risks-verification.sql`.

Resultats attendus :

- `risks_tables = 5`
- `risks_rls_enabled = 5`
- `risks_policies = 10`
- `risks_indexes = 7`
- `risks_test_risks >= 2`
- `risks_test_checks >= 3`
- `risks_test_incidents = 1`
- `risks_test_consents >= 2`
- `risks_test_audit >= 1`

## Tests

```bash
node --check admin-risks.js
node --check api/admin-risks.js
node tests/admin-risks-api.test.js
```

## Limites connues

- La detection automatique de donnees personnelles dans les documents sera renforcee avec l'IA externe et les integrations documentaires.
- Les blocages sont visibles et calcules, mais les modules metier devront progressivement consommer ces signaux pour bloquer certaines actions sensibles.
- Les audits sont journalises au niveau API du module ; le journal transversal complet sera etendu avec les futurs parametres/roles.
