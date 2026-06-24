# Points restants avant ouverture beta reelle

Mise a jour : 24 juin 2026.

## Deja traite dans le depot

- Menu public harmonise avec acces par profil.
- Header mobile compact avec bouton Menu.
- Sous-menus mobiles en accordéons fermes par defaut.
- Page d'accueil coherente avec les cinq poles publics.
- Pages de confiance ajoutees : proprietaires, parcours de demande, sources, limites d'intervention, confidentialite, FAQ.
- Sitemap, robots, redirections et architecture publique regeneres.
- Controle anti-secret local ajoute : `node scripts/scan-secrets.js`.
- Aucune cle Supabase concrete detectee dans le depot.
- Nombre de fonctions Vercel API : 6, donc sous la limite Hobby de 12.

## A faire hors depot, avec acces compte

1. Regenerer la cle `SUPABASE_SERVICE_ROLE_KEY` dans Supabase.
   Raison : une cle service role a ete partagee dans la conversation. Meme si elle n'est pas dans le depot, elle doit etre consideree comme compromise.

2. Remplacer la cle dans Vercel.
   Variables a verifier : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

3. Tester Supabase en production.
   Tests : inscription, connexion, mot de passe oublie, profil utilisateur, roles, signalement, materiau, upload photo, projet, validation admin.

4. Creer ou confirmer le premier administrateur.
   Le profil doit avoir le role `administrateur` et pouvoir acceder au tableau de bord.

5. Verifier les politiques RLS.
   Chaque table sensible doit refuser les lectures/ecritures non autorisees et limiter l'admin aux profils prevus.

6. Verifier les buckets Storage.
   Buckets attendus : `signalements`, `materiaux`, `documents`.

7. Completer les informations officielles apres declaration.
   RNA, SIREN/SIRET, date de declaration, publication JOAFE, email officiel, hebergeur complet.

8. Ajouter les premiers contenus reels.
   Projets pilotes confirmes, documents officiels, comptes rendus, photos autorisees, indicateurs mesures.

9. Mettre en place l'exploitation.
   Anti-spam, moderation, sauvegardes, journal d'erreurs, supervision, analytics respectueux du RGPD.

10. Realiser un test utilisateur.
    Tester le parcours avec un citoyen, un proprietaire, une collectivite, une entreprise et un administrateur.
