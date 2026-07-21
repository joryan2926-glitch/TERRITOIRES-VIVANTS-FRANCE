# TVF Mobile - Guide de mise en production

Ce guide cadre le passage de TVF Mobile depuis la version de recette Expo Go vers une version distribuable. Il ne lance aucune publication automatiquement : la validation finale reste manuelle.

## 1. Objectif de la version production

TVF Mobile doit permettre a un utilisateur de terrain de transmettre une demande exploitable vers TVF OS : signalement de lieu, proposition de materiaux, proposition de bien ou candidature benevole.

La version production doit etre stable, lisible sur telephone, reliee a Supabase et conforme aux informations de confidentialite affichees par TVF.

## 2. Prerequis obligatoires

| Domaine | Exigence | Statut attendu |
| --- | --- | --- |
| Application | Expo SDK 57 installe et controle OK | `npm run check` OK |
| Donnees | Insertion Supabase testee | `npm run test:supabase` OK |
| TVF OS | Demande mobile recuperable dans TVF OS | Test manuel OK |
| Confidentialite | Politique mobile relue et publiee | URL publique a fournir au store |
| Android | Compte Google Play Console | A valider manuellement |
| iOS | Compte Apple Developer | A valider si publication iPhone |
| Identite | Logo, nom, package et bundle coherents | Controle production OK |
| Captures | Captures officielles Android/iOS | A produire apres build preview |

## 3. Controle local avant build

Depuis `mobile/tvf-mobile` :

```bash
npm run check
npm run test:supabase
npm run check:production
```

Depuis la racine du depot :

```bash
npm run check
npm run test:mobile-os
```

Si un controle echoue, ne pas lancer de build.

## 4. Build preview obligatoire avant production

Le build preview sert a installer une version APK interne, hors store, pour verifier le comportement sur un vrai telephone Android.

```bash
npm run build:android:preview
```

A verifier sur le telephone :

- ouverture de l'application ;
- logo et splash screen ;
- parcours signalement complet ;
- parcours materiaux complet ;
- parcours bien complet ;
- candidature benevole ;
- ajout de 1 a 4 photos ;
- geolocalisation ;
- envoi Supabase ;
- remontee dans TVF OS ;
- ticket de suivi ;
- renvoi d'une demande en erreur ;
- liens WhatsApp, e-mail, telephone et documents.

## 5. Go / No-Go

| Decision | Condition |
| --- | --- |
| Go production | Tous les tests locaux OK, APK preview valide, politique publiee, captures pretes |
| No-Go temporaire | Bug photo, GPS, formulaire, Supabase ou TVF OS |
| No-Go juridique | Politique de confidentialite ou mentions donnees incompletes |

## 6. Build production Android

Android Play Store utilise un Android App Bundle (`.aab`).

```bash
npm run build:android:production
```

Le profil `production` dans `eas.json` active :

- `autoIncrement` ;
- build Android en `app-bundle` ;
- environnement `APP_ENV=production`.

## 7. Build production iOS

A lancer seulement si le compte Apple Developer et les informations App Store Connect sont prets.

```bash
npm run build:ios:production
```

## 8. Publication Play Store

Elements a preparer dans Google Play Console :

- nom de l'application : TVF Mobile ;
- description courte ;
- description longue ;
- icone haute definition ;
- captures d'ecran ;
- politique de confidentialite publique ;
- questionnaire securite des donnees ;
- classification du contenu ;
- canal de test interne avant production publique.

Les textes sont prepares dans `STORE_LISTING.md`.

## 9. Donnees et confidentialite

TVF Mobile collecte uniquement les informations utiles a la qualification d'une demande : contact, localisation, description, categorie, photos ajoutees volontairement et reference de suivi.

Aucune cle `service_role` Supabase ne doit etre embarquee dans l'application mobile.

Avant diffusion publique, publier ou confirmer :

- politique de confidentialite mobile ;
- durees de conservation ;
- procedure d'acces, rectification et suppression ;
- contact officiel : contact@territoiresvivantsfrance.fr.

## 10. Ce qui reste manuel

- Connexion au compte Expo avec `npx eas login`.
- Lancement effectif des builds EAS.
- Recuperation des liens EAS.
- Installation APK sur telephone.
- Production des captures officielles.
- Creation ou configuration des comptes Google Play / Apple Developer.
- Validation juridique RGPD finale.
- Soumission aux stores.

## 11. Journal de production

| Date | Version | Plateforme | Profil | Resultat | Lien EAS | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 21/07/2026 | 0.1.0 | Android | preview / app installee | Valide utilisateur |  | Production candidate |
|  | 0.1.0 | Android | production |  |  |  |
|  | 0.1.0 | iOS | production |  |  |  |
## 12. Statut production candidate

Au 21/07/2026, l'application est confirmee fonctionnelle par retour utilisateur sur telephone.

La version peut avancer vers la preparation de publication, sous reserve des actions manuelles suivantes : captures officielles, politique de confidentialite publique, validation des comptes stores, questionnaire securite des donnees et decision de diffusion.
