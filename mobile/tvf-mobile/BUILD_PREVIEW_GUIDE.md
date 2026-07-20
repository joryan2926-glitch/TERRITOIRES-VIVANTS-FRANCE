# TVF Mobile - Guide build APK preview

Ce guide sert a produire une version installable de TVF Mobile apres validation de la recette terrain Expo Go.

## 1. Objectif

Le build `preview` permet de creer un APK Android interne, partageable a un cercle limite de testeurs TVF. Il ne correspond pas encore a une publication Play Store.

A utiliser uniquement lorsque :

- `npm run check` est OK ;
- `npm run test:supabase` est OK ;
- `npm run test:mobile-os` est OK ;
- la recette terrain `FIELD_TEST_REPORT.md` est remplie ;
- aucune anomalie bloquante n'est ouverte.

## 2. Prerequis

| Element | Statut attendu |
| --- | --- |
| Compte Expo | Connecte sur la machine |
| EAS CLI | Disponible via le script npm |
| Variables Supabase | Configurees dans `.env` pour les tests locaux |
| Politique de confidentialite | Preparee ou rattachee avant diffusion externe |
| Appareil Android | Disponible pour installer l'APK |
| Test TVF OS | Valide avant build |

Important : ne jamais integrer de cle `service_role` dans l'application mobile.

## 3. Controle avant build

Depuis `mobile/tvf-mobile` :

```bash
npm run check
npm run test:supabase
```

Depuis la racine du depot :

```bash
npm run test:mobile-os
```

Si un controle echoue, ne pas lancer le build.

## 4. Connexion Expo

Verifier la connexion au compte Expo :

```bash
npx eas whoami
```

Si necessaire :

```bash
npx eas login
```

## 5. Lancer un APK preview Android

Depuis `mobile/tvf-mobile` :

```bash
npm run build:android:preview
```

Le profil utilise est `preview` dans `eas.json` :

- distribution interne ;
- format APK ;
- environnement `APP_ENV=preview`.

## 6. Recuperer et installer l'APK

A la fin du build, EAS fournit un lien de telechargement.

Verifier :

1. installation sur telephone Android ;
2. ouverture de TVF Mobile ;
3. logo et ecran de lancement ;
4. creation d'un signalement ;
5. ajout photo ;
6. GPS ;
7. envoi Supabase ;
8. remontee TVF OS ;
9. historique local ;
10. renvoi si besoin.

## 7. Decision apres APK preview

| Decision | Condition |
| --- | --- |
| APK valide usage interne | Aucun bug bloquant, demandes visibles dans TVF OS |
| APK a corriger | Probleme formulaire, photo, GPS ou envoi |
| Passage production | Recette interne terminee, politique publiee, captures pretes |

## 8. Build production plus tard

Android production :

```bash
npm run build:android:production
```

iOS production :

```bash
npm run build:ios:production
```

A ne lancer qu'apres validation juridique, RGPD, captures store et comptes developpeur.

## 9. Journal de build

| Date | Version | Profil | Resultat | Lien EAS | Observations |
| --- | --- | --- | --- | --- | --- |
|  | 0.1.0 | preview |  |  |  |