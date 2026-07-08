# Module Parametres TVF OS

## Objectif
Le module Parametres devient le centre de controle technique et fonctionnel de TVF OS. Il permet de suivre la configuration globale, les integrations, les drapeaux de modules, les automatisations, la sante systeme et l audit des changements sans exposer les secrets.

## Utilisateurs concernes
- Administrateur national : configuration et validation production.
- Responsable technique : suivi integrations, variables, sante et automatisations.
- Auditeur : consultation des controles et de l historique.
- Responsable antenne : lecture des parametres utiles au deploiement local.

## Perimetre livre
- Page `admin-settings.html` avec session admin unique.
- API `api/admin-settings.js` protegee par `TVF_ADMIN_TOKEN` ou cookie de session signe.
- Tables Supabase : `system_settings`, `integration_configs`, `module_feature_flags`, `automation_settings`, `system_health_checks`, `settings_audit_log`.
- RLS sur toutes les tables avec lecture controlee et gestion limitee au role national.
- Assistant de configuration avec score, variables manquantes, integrations degradees et prochaines actions.
- Export CSV, recherche, filtres, edition et creation rapide.

## Parcours utilisateur
1. L utilisateur ouvre Accueil admin puis Parametres.
2. Le token unique ouvre la session si elle n est pas deja hydratee par cookie.
3. Le dashboard du module presente score de configuration, integrations, variables et alertes.
4. L utilisateur consulte les onglets Parametres, Integrations, Modules, Automatisations, Sante et Audit.
5. Il cree ou modifie un element, puis relance les tests ou verifications de production.

## Automatisations prevues
- Transformation d un e-mail prioritaire en tache.
- Relance automatique de dossier incomplet.
- Creation d un risque en cas d integration degradee.
- Audit systematique des changements sensibles.

## Points de securite
- Aucune valeur secrete n est affichee, seules les presences de variables sont retournees.
- Les modifications critiques sont cote serveur.
- Les RLS limitent la gestion aux administrateurs nationaux.
- Les exports restent reserves a la session admin.

## Fichiers
- `admin-settings.html`
- `admin-settings.js`
- `api/admin-settings.js`
- `supabase/tvf-os-settings.sql`
- `supabase/tvf-os-settings-test-data.sql`
- `supabase/tvf-os-settings-verification.sql`
- `tests/admin-settings-api.test.js`