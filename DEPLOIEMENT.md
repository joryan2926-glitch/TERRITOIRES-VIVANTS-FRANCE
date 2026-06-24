# Déploiement production

Site préparé pour le domaine canonique :

```text
https://territoiresvivantsfrance.fr
```

Si le domaine final est différent, remplacer cette URL dans :

- `sitemap.xml`
- `robots.txt`
- les balises `canonical`, `og:url` et `og:image` des fichiers `.html`

Avant mise en ligne définitive, compléter dans `mentions-legales.html` :

- numéro RNA après déclaration officielle ;
- numéro SIREN/SIRET si attribué ;
- date de déclaration en préfecture ;
- publication au Journal officiel si applicable ;
- adresse e-mail officielle ;
- raison sociale, adresse et contact de l'hébergeur.

Fichiers production déjà présents :

- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `_headers`
- `assets/favicon-32.png`
- `assets/apple-touch-icon.png`
- `assets/icon-512.png`

Variables Vercel à configurer pour la bêta Supabase :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

À créer dans Supabase avant ouverture bêta :

- exécuter `supabase/schema.sql` après revue ;
- vérifier les politiques RLS ;
- vérifier les buckets Storage `signalements`, `materiaux` et `documents` ;
- créer au moins un profil `administrateur` dans `user_profiles`.

Contrôles réalisés :

- pages desktop et mobile sans débordement horizontal ;
- images et logo chargés ;
- liens internes vérifiés ;
- balises SEO, Open Graph, favicon et manifeste ajoutés.

Contrôles à lancer avant chaque push production :

```bash
node scripts/scan-secrets.js
node scripts/validate-static.js
node scripts/check-expanded-copy.js
node --check navigation.js
```

Point de sécurité important :

- si une clé `SUPABASE_SERVICE_ROLE_KEY` a été partagée hors Vercel ou Supabase, la régénérer immédiatement ;
- ne jamais placer de clé réelle dans le dépôt Git ;
- conserver uniquement `.env.example` comme modèle public.

Voir aussi `PRODUCTION_RESTANT.md` pour la liste des actions qui nécessitent un accès aux comptes Supabase, Vercel ou aux informations officielles de l'association.
