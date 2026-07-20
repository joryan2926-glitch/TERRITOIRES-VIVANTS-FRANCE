# TVF Mobile - Checklist de recette et publication

Ce document sert de suivi avant toute diffusion officielle de TVF Mobile. Il ne remplace pas les tests sur telephone : il cadre les points a verifier pour passer d'une preversion terrain Expo Go a une version publiable.

## 1. Objectif de la recette terrain

TVF Mobile doit permettre a un utilisateur de terrain de :

- creer une demande claire ;
- joindre une ou plusieurs photos ;
- localiser une situation ;
- transmettre la demande vers TVF OS ;
- conserver une reference exploitable ;
- renvoyer une demande si la transmission echoue ;
- retrouver la demande depuis l'historique local.

La recette doit etre realisee sur un vrai telephone avec Expo Go, en condition proche du terrain.

## 2. Parcours a tester

### Signalement

- Ouvrir "Signaler un lieu".
- Choisir une categorie : logement, commerce, batiment, friche, depot ou autre.
- Ajouter une adresse manuelle.
- Tester la geolocalisation.
- Ajouter 1 photo, puis refaire le test avec 2 a 4 photos.
- Envoyer la demande.
- Verifier la reference creee.
- Ouvrir la fiche demande.
- Tester le lien de localisation.
- Verifier la remontee dans TVF OS.

### Materiaux

- Ouvrir "Proposer des materiaux".
- Choisir une categorie.
- Renseigner quantite, etat, lieu de stockage et disponibilite.
- Ajouter au moins un moyen de contact.
- Ajouter plusieurs photos.
- Envoyer vers TVF OS.
- Verifier que les photos sont stockees et que la demande reste lisible.

### Bien propose

- Ouvrir "Proposer un bien".
- Choisir le type de bien.
- Renseigner adresse, etat general et objectif recherche.
- Ajouter plusieurs photos utiles.
- Envoyer la demande.
- Ouvrir la fiche.
- Tester le renvoi si la demande n'est pas transmise.

### Benevolat

- Ouvrir "Devenir benevole".
- Renseigner nom, e-mail, competences et disponibilites.
- Tester un e-mail invalide pour verifier le blocage.
- Envoyer la candidature.
- Retrouver la reference dans "Mes demandes".

## 3. Points techniques a verifier

- Expo Go SDK 57 ouvre correctement l'application.
- Le serveur Metro fonctionne en LAN et, si besoin, en tunnel.
- Les variables publiques Supabase sont presentes dans `.env`.
- Aucune cle `service_role` n'est embarquee dans l'application mobile.
- Les buckets Supabase acceptent les photos attendues.
- La table `mobile_requests` recoit les demandes.
- TVF OS peut importer une demande mobile en contact et dossier.
- Le bouton de renvoi ne cree pas de confusion dans l'historique local.

## 4. Accessibilite et lisibilite mobile

A verifier sur telephone :

- textes lisibles sans zoom ;
- boutons assez grands ;
- champs faciles a remplir ;
- aucun texte coupe ;
- contraste suffisant ;
- navigation basse utilisable au pouce ;
- messages d'erreur comprensibles ;
- etat de transmission clair.

## 5. Avant publication officielle

Avant une version Play Store ou App Store, prevoir :

- politique de confidentialite mobile publiee ;
- cadrage interne disponible dans `PRIVACY_MOBILE.md` ;
- conditions d'utilisation si necessaire ;
- captures officielles Android et iOS ;
- textes de fiche application prepares dans `STORE_LISTING.md` ;
- compte developpeur Google Play ;
- compte Apple Developer si diffusion iOS ;
- configuration EAS Build dans `eas.json` ;
- nom, icone, description courte et description longue ;
- tests internes ;
- validation RGPD des donnees collecte es ;
- procedure de suppression ou demande d'acces aux donnees.

## 6. Commandes utiles

```bash
npm run check
npm run test:supabase
npm run test:mobile-os
npm run start:lan
npm run start:tunnel
npm run build:android:preview
npm run build:android:production
npm run build:ios:production
```

## 7. Statut actuel

- Expo SDK 57 : pret pour recette.
- Connexion Supabase : active si variables presentes.
- Envoi vers TVF OS : teste par script.
- Photos multiples : implementees, a verifier sur telephone.
- Publication store : non lancee, a preparer en phase dediee.