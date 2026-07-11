# TVF OS - Registre de suivi de la refonte ERP

Version : 1.0
Date : 2026-07-11
Statut : perimetre verrouille

## Perimetre verrouille

La refonte suit une seule organisation : Territoires Vivants France. Les antennes multiples, la gestion multi-entites et les parcours territoriaux paralleles ne font pas partie de cette version.

Le parcours de reference est :

```text
Reception -> Qualification -> CRM -> Dossier -> Pieces -> Action -> Reponse -> Suivi -> Cloture
```

Toute nouvelle fonctionnalite doit etre rattachee a ce parcours. Toute demande hors perimetre est inscrite dans la liste d'evolutions, sans modification immediate du socle.

## Ligne de conduite

- Construire un module a la fois.
- Commencer par le besoin quotidien de l'equipe.
- Reutiliser les donnees et APIs existantes.
- Relier chaque information au contact, au dossier et a l'historique.
- Privilegier une action claire a une accumulation de boutons.
- Tester le parcours nominal et le parcours d'erreur.
- Ne passer au module suivant qu'apres validation du precedent.
- Conserver les fonctions existantes tant qu'une remplacement n'est pas valide.
- Ne jamais inventer de donnees ou automatiser une decision engageante.

## Ordre de travail verrouille

| Ordre | Module | Objectif de la phase | Etat |
|---:|---|---|---|
| 1 | Session et securite | Acces unique et droits | Existant, a controler |
| 2 | Reception | Centraliser formulaires et e-mails | En cours |
| 3 | CRM | Identifier et rattacher le contact | A construire |
| 4 | Dossiers | Transformer une demande en dossier suivi | A renforcer |
| 5 | Documents | Classer, rechercher et joindre les pieces | A renforcer |
| 6 | E-mails | Repondre et transferer depuis le dossier | A renforcer |
| 7 | Taches | Planifier et relancer | En place, a relier |
| 8 | Tableau de bord | Afficher les actions prioritaires | En place, a simplifier |
| 9 | Modeles | Repondre par motif et besoin | En place, a relier |
| 10 | Pilotage | Suivre decisions, risques, finances et impact | En place, a relier |

## Travail realise dans la phase actuelle

- Navigation TVF OS reduite a six groupes.
- Accueil recentre sur les demandes, dossiers et taches.
- Direction visuelle de poste de travail appliquee.
- Parcours Demandes recentre sur une structure nationale unique.
- Etape territoriale reformulee en qualification de perimetre.
- Lien vers la cartographie conserve sans dependance aux antennes.

## Fiche de validation a remplir pour chaque module

| Controle | Resultat |
|---|---|
| Objectif du module compris en une phrase | A renseigner |
| Entrees identifiees | A renseigner |
| Contact et organisation rattaches | A renseigner |
| Dossier cree ou retrouve | A renseigner |
| Documents et pieces joints | A renseigner |
| Tache ou prochaine action definie | A renseigner |
| E-mail ou reponse trace | A renseigner |
| Statuts testes | A renseigner |
| Droits testes | A renseigner |
| Parcours mobile verifie | A renseigner |
| Tests techniques valides | A renseigner |
| Responsable de validation | A renseigner |

## Regle de passage

Un module ne passe a l'etape suivante que lorsque sa fiche de validation est complete et que les tests suivants sont verts :

- test nominal ;
- test d'information manquante ;
- test de droit insuffisant ;
- test d'erreur API ;
- test de liaison avec le dossier ;
- test de conservation dans l'historique.

## Prochaine etape

La prochaine etape de travail est le module Reception : verifier qu'un formulaire et un e-mail peuvent etre qualifies de la meme maniere, rattaches a un contact existant ou nouveau, puis convertis en dossier avec une prochaine action obligatoire.
