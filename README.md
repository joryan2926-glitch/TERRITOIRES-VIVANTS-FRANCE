# Territoires Vivants France

Site officiel de **TERRITOIRES VIVANTS FRANCE**, association nationale en création dédiée à la revitalisation des territoires par la remise en usage des logements, commerces, bâtiments, friches, terrains et matériaux inutilisés.

Le site est conçu comme une plateforme publique progressive : vitrine institutionnelle, observatoire territorial, parcours par public, documentation opérationnelle et préparation d'une future connexion Supabase.

## Positionnement

Territoires Vivants France ne se présente pas comme un dispositif public existant, ni comme un organisme qui remplace les acteurs déjà compétents. Le site positionne TVF comme une plateforme de coordination capable de relier :

- propriétaires ;
- collectivités ;
- entreprises ;
- associations ;
- bénévoles ;
- mécènes et financeurs ;
- habitants ;
- ressources et biens vacants.

Les projets, partenaires, chiffres d'impact et soutiens ne sont affichés que lorsqu'ils sont vérifiés ou explicitement présentés comme des estimations, scénarios ou éléments préparatoires.

## Architecture publique

Le site conserve une architecture publique resserrée autour d'environ 50 pages indexables, listées dans `PUBLIC_ARCHITECTURE.md` et `sitemap.xml`.

Rubriques principales :

- Accueil ;
- Association ;
- Nos actions ;
- Nos 5 pôles ;
- Par public ;
- Agir avec TVF ;
- Observatoire ;
- Saint-Étienne, territoire pilote ;
- Ressources ;
- Gouvernance et transparence ;
- Contact.

Les pages techniques, anciennes pages de phase, pages Supabase, pages bêta et pages d'administration sont conservées en noindex ou redirigées selon `vercel.json`.

## Pages stratégiques

- `index.html` : page d'accueil, mission, méthode, priorités, engagement et carte nationale préparée.
- `qui-sommes-nous.html` : identité, gouvernance en création, posture et cadre de confiance.
- `nos-actions.html` : actions opérationnelles, parcours d'intervention, scénarios et appels à l'action.
- `nos-poles.html` : architecture en cinq pôles et coopération entre expertises.
- `banque-materiaux.html` : Banque de Matériaux TVF, sans distribution libre ni promesse automatique.
- `bien-solidaire-usage-partage.html` : programme propriétaire et convention d'usage temporaire.
- `dossier-saint-etienne.html` : diagnostic territorial public du territoire pilote.
- `tvf-enjeux-saint-etienne.html` : alignement avec les priorités publiques locales.
- `fiches-projets-territorialisees.html` : logique de fiches projet prêtes à l'instruction.
- `espace-collectivites.html`, `espace-entreprises.html`, `proprietaires.html`, `espace-benevoles.html` : parcours par public.
- `gouvernance.html`, `transparence.html`, `charte-ethique.html`, `documents-officiels.html` : crédibilité institutionnelle.

## Supabase

L'architecture Supabase est préparée mais les données réelles doivent être connectées et validées avant production opérationnelle complète.

Variables attendues dans Vercel :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Schéma :

- `supabase/schema.sql`
- `SUPABASE_ARCHITECTURE.md`

Buckets attendus :

- `signalements`
- `materiaux`
- `documents`

## API Vercel

Le dossier `api/` a été rationalisé pour rester sous la limite Hobby de Vercel.

Fonctions principales :

- `api/[resource].js`
- `api/admin.js`
- `api/profile.js`
- `api/stats.js`
- `api/activity.js`
- `api/config.js`

Les routes publiques sont réécrites dans `vercel.json`.

## Documents opérationnels

Des modèles de documents sont disponibles dans :

- `documents/modeles/`
- `output/documents/pack-fondateur-tvf/`
- `output/documents/pack-institutionnel-tvf/`

Ces documents sont destinés à être adaptés avant signature ou transmission officielle : conventions, fiches projet, registres, grilles de priorisation, pièces à fournir, procédures et dossiers de présentation.

## Réseaux sociaux

Deux séries de visuels Instagram ont été préparées :

- `output/social/instagram-exemples-tvf/` : direction institutionnelle.
- `output/social/instagram-startup-tvf/` : direction plus dynamique, style startup.

## Déploiement

Le site est statique et peut être déployé sur Vercel depuis la branche `main`.

Avant présentation à une collectivité ou à un financeur :

1. Vérifier les informations administratives définitives de l'association.
2. Confirmer les coordonnées publiques à afficher.
3. Ne publier aucun partenaire sans accord écrit.
4. Tester les formulaires Supabase en production.
5. Valider les politiques RLS et les buckets Storage.
6. Relire les pages Saint-Étienne avec les millésimes de données les plus récents.

## Contrôles disponibles

Validation statique :

```bash
node scripts/validate-static.js
```

Scan de secrets :

```bash
node scripts/scan-secrets.js
```

Le projet ne dépend pas d'un build frontend : les fichiers HTML, CSS, JS et assets sont servis directement.
