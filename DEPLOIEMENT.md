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
