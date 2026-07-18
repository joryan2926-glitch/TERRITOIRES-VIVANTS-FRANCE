# Activation Supabase - TVF Mobile

Ce fichier sert de procedure courte pour activer l'enregistrement reel des demandes terrain depuis l'application mobile TVF.

## Objectif

Permettre a TVF Mobile d'enregistrer dans Supabase :

- les signalements de lieux vacants ou abandonnes ;
- les propositions de materiaux ;
- les propositions de biens ;
- les candidatures benevoles ;
- les photos et informations de localisation associees.

## Variables locales

Dans `mobile/tvf-mobile/.env`, renseigner uniquement les variables publiques Expo :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

La cle `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais etre ajoutee dans l'application mobile. Elle peut rester uniquement dans l'environnement serveur ou dans le `.env` local racine pour les scripts de controle internes.

## Etape 1 - Executer le schema mobile

Dans Supabase, ouvrir SQL Editor puis executer le fichier :

```text
supabase/tvf-mobile-requests.sql
```

Ce script cree :

- la table `public.mobile_requests` ;
- les colonnes de suivi utiles aux demandes mobiles ;
- les politiques RLS minimales ;
- les buckets Storage `signalements` et `materiaux` ;
- les politiques d'upload photo pour la preversion mobile.

## Etape 2 - Verifier Supabase

Executer ensuite :

```text
supabase/verify-tvf-mobile-requests.sql
```

Les valeurs attendues doivent confirmer :

- `mobile_requests_table` non nul ;
- `photo_path_column` a `true` ;
- `public_insert_policy` a `true` ;
- `signalements_bucket` a `true` ;
- `materiaux_bucket` a `true` ;
- `mobile_upload_policy` a `true`.

## Etape 3 - Tester depuis le projet mobile

Depuis `mobile/tvf-mobile` :

```bash
npm run test:supabase
```

Succes attendu :

```text
TVF_MOBILE_SUPABASE_INSERT_OK reference=...
TVF_MOBILE_SUPABASE_CLEANUP_OK reference=...
```

Si le test indique que `public.mobile_requests` est introuvable, le script SQL mobile n'a pas encore ete applique au bon projet Supabase ou le cache schema Supabase doit etre rafraichi.

## Etape 4 - Tester le passage vers TVF OS

Depuis la racine du depot :

```bash
npm run test:mobile-os
```

Succes attendu :

```text
TVF_MOBILE_TO_OS_OK reference=... contact=... dossier=...
```

Cette recette cree une demande mobile technique, l'importe dans TVF OS, genere un dossier d'instruction, verifie les rattachements, puis supprime automatiquement les donnees de test.

## Etape 5 - Relancer Expo Go

Depuis `mobile/tvf-mobile` :

```bash
npm run start:tunnel
```

Scanner le QR code dans Expo Go. Les formulaires mobiles pourront alors envoyer les demandes vers Supabase lorsque les variables publiques sont bien chargees.