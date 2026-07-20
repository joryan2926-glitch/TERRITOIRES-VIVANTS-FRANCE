# TVF Mobile - Prototype terrain SDK 57

Prototype Expo / React Native de l'application mobile Territoires Vivants France.

## Objectif

TVF Mobile prepare l'usage terrain de Territoires Vivants France : signaler rapidement une situation, joindre une photo, localiser une ressource et transmettre une demande exploitable dans TVF OS.

L'application permet de preparer les parcours suivants :

- signaler un lieu vacant ou abandonne ;
- proposer des materiaux reutilisables ;
- proposer un bien dormant ;
- transmettre une candidature benevole ;
- consulter les documents utiles et les pieces a preparer ;
- contacter TVF par les canaux officiels ;
- preparer le suivi d'une demande rattachee a TVF OS ;
- partager une reference de demande par e-mail, message ou WhatsApp selon le telephone.

## Parcours disponibles

1. **Accueil** : choix rapide du besoin.
2. **Signaler un lieu** : categorie, localisation, description, photo et coordonnees.
3. **Proposer des materiaux** : categorie, quantite, etat, stockage et disponibilite.
4. **Proposer un bien** : type de bien, adresse, etat et objectif recherche.
5. **Devenir benevole** : coordonnees, competences et disponibilites.
6. **Suivre ma demande** : ecran prepare pour la synchronisation TVF OS.
7. **Documents** : bibliotheque mobile structuree par usage.
8. **Contact** : WhatsApp, e-mail, telephone, Facebook et Instagram officiels.

## Fonctionnement actuel

Cette version est une preversion terrain compatible Expo SDK 57 et Expo Go SDK 57.

- navigation locale ;
- formulaires controles cote interface ;
- champs obligatoires par parcours ;
- numero de demande genere cote application ;
- recapitulatif de demande ;
- prise de photo via Expo Image Picker ;
- geolocalisation via Expo Location ;
- connexion Supabase active lorsque les variables publiques Expo sont renseignees ;
- fallback local lisible : une demande non transmise reste identifiable avec sa reference ;
- upload photo prepare vers Supabase Storage ;
- aucune cle `service_role` dans l'application mobile.

## Identite applicative

- Nom affiche : **TVF Mobile**.
- Slug Expo : `tvf-mobile`.
- Bundle iOS / package Android : `fr.territoiresvivants.tvfmobile`.
- Icone et ecran de lancement : `assets/tvf-mobile-logo.png`.
- Style : portrait, interface claire, fond TVF blanc casse.
## Recette et publication

La procedure de verification avant diffusion est detaillee dans [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md).
Le cadrage confidentialite mobile est prepare dans [`PRIVACY_MOBILE.md`](./PRIVACY_MOBILE.md).
Les textes de fiche application sont prepares dans [`STORE_LISTING.md`](./STORE_LISTING.md).
## Prerequis

- Node.js 20 LTS recommande.
- Node.js 24 fonctionne pour les controles locaux si les dependances sont installees avec Expo SDK 57.
- Application Expo Go compatible SDK 57 installee sur le telephone.

## Lancement local

Depuis ce dossier :

```bash
npm install
npm run start
```

Si Expo Go ne detecte pas le projet sur le reseau local, utiliser le mode tunnel :

```bash
npm run start:tunnel
```

Si l'application reste bloquee sur un ancien ecran, vider le cache Metro :

```bash
npm run start:clear
```

Puis scanner le QR code avec Expo Go sur telephone. Le mode tunnel peut demander le paquet `@expo/ngrok`, deja ajoute au projet.

## Controles locaux

Depuis ce dossier :

```bash
npm run check
npx expo export --platform web --output-dir export-check
```

Depuis la racine du depot :

```bash
node scripts/check-encoding.js
```

Test d'enregistrement reel dans Supabase, avec creation puis suppression automatique d'une ligne technique :

```bash
npm run test:supabase
```

Depuis la racine du depot, tester le passage complet vers TVF OS :

```bash
npm run test:mobile-os
```

## Connexion Supabase preparee

La preversion peut fonctionner sans Supabase : les demandes restent alors en mode local.

Pour activer l'enregistrement reel :

1. Copier `.env.example` vers `.env`.
2. Renseigner uniquement les variables publiques Expo :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

3. Ne jamais mettre la cle `service_role` dans l'application mobile.
4. Executer le fichier SQL suivant dans Supabase SQL Editor :

```text
supabase/tvf-mobile-requests.sql
```

5. Verifier avec :

```text
supabase/verify-tvf-mobile-requests.sql
```

## Suite fonctionnelle prevue

- creation d'une demande dans Supabase ;
- generation d'un numero de dossier TVF OS ;
- upload photo dans Supabase Storage ;
- stockage latitude/longitude dans le dossier de demande ;
- notification e-mail vers TVF ;
- accuse de reception vers l'utilisateur ;
- suivi du statut depuis TVF OS ;
- orientation depuis l'ecran Contact vers le bon parcours de demande ;
- bibliotheque Documents plus complete et organisee par besoin.

## Points a valider avant publication native

- libelles definitifs des formulaires ;
- categories de signalement ;
- categories de materiaux ;
- documents affiches ;
- niveau de detail demande a l'utilisateur ;
- regles de confidentialite ;
- integration complete avec les processus internes TVF OS.