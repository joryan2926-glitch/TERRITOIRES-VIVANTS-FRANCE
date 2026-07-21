# TVF Mobile - Fiche securite des donnees

Ce document prepare les reponses au questionnaire de securite des donnees des stores. Il doit etre relu avant publication officielle.

## 1. Donnees collectees selon l'usage

TVF Mobile peut collecter uniquement les donnees renseignees volontairement par l'utilisateur ou autorisees par lui.

| Categorie store | Donnees concernees | Finalite TVF |
| --- | --- | --- |
| Informations personnelles | Nom, prenom, e-mail, telephone | Recontacter la personne et qualifier la demande |
| Localisation | Adresse, commune, coordonnees GPS si autorisees | Situer un lieu, un bien ou un stock de materiaux |
| Photos et videos | Photos ajoutees volontairement | Documenter une situation ou un lot de materiaux |
| Contenu utilisateur | Description libre, objectif, disponibilites, competences | Comprendre la demande et orienter le dossier |
| Identifiants internes | Reference TVF, statut de transmission | Suivre la demande dans TVF Mobile et TVF OS |

## 2. Donnees non collectees

TVF Mobile ne collecte pas :

- donnees de paiement ;
- contacts du telephone ;
- historique d'appels ;
- SMS ;
- donnees de sante ;
- donnees publicitaires ;
- identifiants publicitaires ;
- localisation en arriere-plan ;
- suivi inter-applications.

## 3. Partage des donnees

Les donnees sont transmises a Territoires Vivants France pour traitement interne via TVF OS.

Elles ne sont pas vendues. Elles ne doivent pas etre utilisees a des fins publicitaires.

Selon le dossier, TVF pourra recontacter la personne ou demander des informations complementaires avant toute instruction.

## 4. Securite et stockage

Les demandes peuvent etre transmises a Supabase, utilise par TVF pour stocker les demandes et les photos associees.

Points a confirmer avant publication publique :

- politiques RLS actives ;
- buckets photos configures ;
- acces TVF OS limite aux personnes autorisees ;
- aucune cle `service_role` dans l'application mobile ;
- procedure d'effacement disponible sur demande.

## 5. Consentement utilisateur

L'utilisateur choisit volontairement :

- de remplir un formulaire ;
- d'ajouter ou non une photo ;
- d'autoriser ou non la localisation ;
- de laisser ou non un contact selon le parcours.

L'application doit rester exploitable avec une adresse saisie manuellement lorsque le GPS n'est pas autorise.

## 6. Droits des personnes

Contact pour les demandes relatives aux donnees : contact@territoiresvivantsfrance.fr

Demandes possibles :

- acces ;
- rectification ;
- suppression lorsque applicable ;
- information sur le traitement ;
- retrait ou limitation lorsque applicable.

## 7. Reponses indicatives pour Google Play

| Question | Reponse preparee |
| --- | --- |
| L'application collecte-t-elle des donnees ? | Oui |
| Les donnees sont-elles chiffrees en transit ? | Oui, transmission via HTTPS/Supabase ; a revalider dans le formulaire store final |
| Les donnees peuvent-elles etre supprimees ? | Oui, via demande a TVF |
| Les donnees sont-elles partagees avec des tiers ? | Non a des fins commerciales ; stockage technique Supabase |
| L'application utilise-t-elle la localisation ? | Oui, uniquement si autorisee et pour localiser une demande |
| L'application utilise-t-elle la camera ou les photos ? | Oui, uniquement pour joindre des photos a une demande |
| L'application utilise-t-elle la publicite ? | Non |

## 8. Points a valider juridiquement

Avant publication officielle :

- URL publique de confidentialite ;
- durees de conservation ;
- base legale du traitement ;
- responsable de traitement ;
- sous-traitants techniques ;
- procedure de suppression ;
- mentions compatibles avec le site TVF.
## 9. Matrice permissions mobile

| Permission | Utilisation TVF Mobile | Obligatoire ? | Alternative sans permission |
| --- | --- | --- | --- |
| Camera | Prendre une photo de terrain pour documenter une demande | Non | Choisir une photo existante ou envoyer sans photo |
| Photos / galerie | Ajouter une photo deja presente sur le telephone | Non | Envoyer la demande sans photo |
| Localisation precise | Positionner un lieu, un bien ou un stock de materiaux | Non | Saisir une adresse ou une commune manuellement |
| Localisation approximative | Aider a situer la commune ou le secteur | Non | Saisie manuelle |

## 10. Formulation store recommandee

TVF Mobile utilise les permissions uniquement lorsque l'utilisateur choisit une action qui en a besoin : ajouter une photo ou localiser une demande. L'application ne collecte pas la localisation en arriere-plan et n'accede pas aux contacts, SMS, appels ou donnees de paiement du telephone.