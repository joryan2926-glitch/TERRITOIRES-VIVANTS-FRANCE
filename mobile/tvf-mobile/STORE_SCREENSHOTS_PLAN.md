# TVF Mobile - Plan des captures store

Ce document sert a produire des captures officielles pour Google Play, App Store ou diffusion interne. Les captures doivent etre faites apres un build preview valide, sur un telephone reel ou un simulateur propre.

## 1. Direction visuelle

Objectif : montrer une application de terrain simple, utile et fiable.

Principes :

- fonds clairs et lisibles ;
- texte suffisamment grand ;
- aucun vrai dossier personnel ;
- aucune adresse privee sensible ;
- aucune photo de personne reconnaissable sans autorisation ;
- utiliser des exemples neutres de recette ou des donnees de demonstration clairement non reelles.

## 2. Captures Android recommandees

| Ordre | Ecran | Message a montrer | Verification |
| --- | --- | --- | --- |
| 1 | Accueil | Choisir un parcours : signaler, proposer, suivre | Logo visible, boutons lisibles |
| 2 | Signalement | Localiser un lieu et joindre une photo | Permission GPS/photo claire |
| 3 | Materiaux | Decrire un lot reutilisable | Quantite, etat, lieu visibles |
| 4 | Proposition de bien | Presenter un bien dormant | Champs de pre-etude visibles |
| 5 | Confirmation | Reference TVF et ticket de suivi | Statut transmission clair |
| 6 | Documents | Pieces a preparer selon le besoin | Listes lisibles, pas trop denses |
| 7 | Contact | Appeler, WhatsApp, e-mail | Canaux officiels visibles |

## 3. Captures iOS recommandees

Reprendre les memes ecrans que pour Android, en verifiant :

- respect des marges de securite iPhone ;
- aucun element cache par la zone dynamique ;
- lisibilite des boutons bas ;
- textes de permissions iOS coherents avec `app.json`.

## 4. Textes courts a superposer si besoin

A utiliser uniquement si les stores ou les supports marketing demandent une lecture immediate :

- Signaler un lieu vacant en quelques minutes.
- Localiser, photographier, transmettre.
- Proposer des materiaux reutilisables.
- Presenter un bien dormant a TVF.
- Garder une reference et suivre la demande.
- Preparer les pieces utiles avant instruction.

## 5. Donnees de demonstration

Utiliser uniquement des donnees neutres :

- commune : Saint-Etienne ;
- adresse fictive ou partielle : secteur centre-ville, quartier, rue sans numero si necessaire ;
- reference de test : TVF-SIG-DEMO ;
- e-mail : contact@territoiresvivantsfrance.fr ;
- telephone : 04 65 81 54 69.

Ne jamais afficher :

- donnees personnelles reelles ;
- photos de proprietes privees identifiables sans autorisation ;
- demandes reelles issues de Supabase ;
- information confidentielle TVF OS.

## 6. Controle final des captures

Avant depot store :

- aucune faute visible ;
- aucun texte coupe ;
- aucun caractere casse ;
- aucun secret ni cle API ;
- aucun numero personnel ;
- logo net ;
- statut de l'application clair ;
- captures coherentes avec la politique de confidentialite.