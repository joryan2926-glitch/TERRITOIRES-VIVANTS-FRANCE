# TVF OS - Protocole de construction et de validation des modules

Version : 1.0
Date : 2026-07-11
Statut : protocole de travail interne - perimetre verrouille

## 1. Objectif

Ce protocole definit la methode obligatoire pour construire, relier, tester et valider chaque module de TVF OS.

TVF OS est construit comme un outil unique pour une seule structure nationale : Territoires Vivants France. Chaque module doit contribuer au meme parcours de travail :

```text
Reception -> Qualification -> Contact -> Dossier -> Pieces -> Action -> Reponse -> Suivi -> Cloture
```

Un module ne doit jamais etre developpe comme une page independante sans lien avec les autres donnees.

## 2. Regles non negociables

- Une seule structure TVF dans la version initiale.
- Aucun module ne cree une seconde fiche pour une information deja connue.
- Toute demande doit pouvoir etre rattachee a un contact et a un dossier.
- Tout dossier doit avoir un statut, un responsable et une prochaine action.
- Tout e-mail important doit etre conserve dans l'historique.
- Tout document doit etre rattache a un dossier ou a une bibliotheque classee.
- Toute decision sensible doit rester humaine, explicite et tracee.
- Aucun chiffre, partenaire, resultat ou document ne doit etre invente.
- Une fonctionnalite n'est pas consideree comme terminee tant que son parcours utilisateur n'est pas teste.
- Une modification ne doit pas casser les modules deja valides.

## 3. Fiche standard d'un module

Avant toute modification, remplir cette fiche :

| Rubrique | Reponse attendue |
|---|---|
| Nom du module | Nom court et compris par l'equipe |
| Objectif | Probleme concret resolu |
| Utilisateur principal | Administrateur, responsable, instructeur, contributeur ou observateur |
| Point d'entree | Accueil, demande, dossier, contact, document ou tache |
| Donnees utilisees | Tables, champs et relations existantes |
| Donnees produites | Resultat cree ou modifie |
| Modules relies | CRM, demandes, dossiers, documents, e-mails, taches, pilotage |
| Actions principales | Trois a cinq actions maximum |
| Statuts | Liste courte et definie |
| Droits | Qui peut lire, creer, modifier, valider ou supprimer |
| E-mails | Modeles, destinataires, pieces jointes, historique |
| Documents | Pieces attendues, generees ou archivees |
| Erreurs | Cas bloquants et message utilisateur |
| Test de validation | Scenario realiste reproductible |
| Critere de sortie | Conditions permettant de passer au module suivant |

## 4. Cycle de construction obligatoire

### Etape 1 - Cadrer

- Nommer le module.
- Ecrire son objectif en une phrase.
- Identifier le public interne.
- Lister les actions indispensables.
- Exclure les fonctions secondaires qui compliquent la premiere version.

Livrable : fiche standard du module validee.

### Etape 2 - Cartographier les liens

Pour chaque module, preciser :

```text
Entree -> Donnee principale -> Dossier lie -> Document lie -> Tache -> E-mail -> Historique
```

Livrable : schema des relations et liste des champs obligatoires.

### Etape 3 - Definir les statuts

Les statuts doivent etre courts, exclusifs et compréhensibles.

Exemple demande :

```text
Nouvelle -> A qualifier -> En cours -> Convertie -> En attente -> Classee
```

Chaque changement de statut doit avoir : auteur, date, ancien statut, nouveau statut et commentaire lorsque necessaire.

Livrable : tableau des statuts et transitions autorisees.

### Etape 4 - Construire l'ecran

L'ecran doit suivre cet ordre :

1. Titre et contexte.
2. Recherche et filtres utiles.
3. Information principale.
4. Prochaine action.
5. Documents et e-mails lies.
6. Historique.

Regle d'interface : une seule action primaire visible par ecran. Les actions secondaires restent accessibles sans prendre le dessus.

Livrable : ecran lisible sur ordinateur, tablette et mobile.

### Etape 5 - Relier les actions

Verifier que l'utilisateur peut :

- ouvrir un contact depuis le module ;
- ouvrir le dossier lie ;
- ajouter une piece ;
- creer une tache ;
- repondre par e-mail ;
- retrouver l'action dans l'historique ;
- revenir au module sans perdre son contexte.

Livrable : parcours complet sans rupture ni doublon.

### Etape 6 - Tester

Executer quatre tests :

1. Parcours nominal : tout se passe correctement.
2. Donnee manquante : le message explique quoi faire.
3. Erreur d'autorisation : l'acces est refuse proprement.
4. Erreur technique : l'utilisateur est informe et l'action reste tracee.

Livrable : fiche de test avec resultat, date et personne qui a verifie.

### Etape 7 - Valider

Un module est valide seulement si :

- son objectif est atteint ;
- ses relations sont fonctionnelles ;
- ses droits sont testes ;
- son parcours mobile est lisible ;
- ses e-mails et documents sont traces ;
- les tests JavaScript et API restent verts ;
- aucune regression n'est constatee.

Livrable : statut `Valide` dans le registre des modules.

## 5. Ordre de construction recommande

### Module 1 - Session et securite

Objectif : garantir une connexion unique et un acces controle.

Doit permettre : connexion, deconnexion, session persistante, roles, expiration, refus d'acces et journalisation.

Dependances : aucune.

Critere de sortie : un utilisateur autorise arrive dans TVF OS ; un utilisateur non autorise est redirige vers la connexion.

### Module 2 - Boite de reception

Objectif : regrouper les formulaires et les e-mails entrants.

Doit permettre : liste, filtres, recherche, priorite, attribution et classement.

Dependances : session.

Critere de sortie : toute nouvelle demande est visible et possede un statut.

### Module 3 - CRM / Contacts

Objectif : eviter les doublons et disposer d'une fiche interlocuteur fiable.

Doit permettre : creer, rechercher, modifier, fusionner avec controle, rattacher a une organisation et voir les dossiers lies.

Dependances : reception.

Critere de sortie : une demande peut etre rattachee a un contact nouveau ou existant.

### Module 4 - Dossiers

Objectif : faire du dossier le centre de traitement.

Doit permettre : creer, rattacher, affecter, prioriser, changer de statut, voir les pieces, e-mails, taches et historique.

Dependances : reception, CRM.

Critere de sortie : une demande peut etre convertie en dossier en moins d'une minute.

### Module 5 - Documents

Objectif : classer les pieces et modeles utiles.

Doit permettre : televerser, rechercher, filtrer, versionner, rattacher, telecharger et archiver.

Dependances : dossiers, droits.

Critere de sortie : une piece jointe peut etre retrouvee depuis le dossier et la bibliotheque.

### Module 6 - E-mails et reponses

Objectif : repondre directement depuis le dossier.

Doit permettre : modele, edition, destinataire, copie, piece jointe, envoi, transfert, erreur d'envoi et historique.

Dependances : CRM, dossiers, documents, service e-mail.

Critere de sortie : une reponse est envoyee et visible dans la conversation du dossier.

### Module 7 - Taches et relances

Objectif : garantir une prochaine action pour chaque dossier.

Doit permettre : creation, affectation, echeance, priorite, relance, blocage et cloture.

Dependances : dossiers, e-mails.

Critere de sortie : aucun dossier ouvert ne reste sans prochaine action identifiee.

### Module 8 - Tableau de bord quotidien

Objectif : savoir quoi traiter en premier.

Indicateurs : nouvelles demandes, urgences, pieces manquantes, taches echues, reponses a envoyer, dossiers sans action.

Dependances : reception, dossiers, taches.

Critere de sortie : le tableau de bord permet de commencer la journee sans parcourir tous les modules.

### Module 9 - Modeles et procedures

Objectif : repondre de facon coherente selon le motif de la demande.

Doit permettre : modeles de courriers, listes de pieces, procedures, versions, validation et date de revision.

Dependances : documents, dossiers.

Critere de sortie : chaque motif courant dispose d'un modele controle et facilement reutilisable.

### Module 10 - Pilotage et securite

Objectif : suivre les engagements et les risques.

Doit regrouper : finances, gouvernance, risques, impact et activite, avec liens vers les dossiers.

Dependances : dossiers, documents, taches, historique.

Critere de sortie : une decision ou un engagement peut etre justifie par des pieces et un historique.

## 6. Registre de suivi des modules

| N° | Module | Statut | Responsable | Prochaine action |
|---:|---|---|---|---|
| 1 | Session et securite | A verifier | A definir | Tester les roles |
| 2 | Boite de reception | A renforcer | A definir | Relier formulaires et e-mails |
| 3 | CRM / Contacts | A renforcer | A definir | Controler les doublons |
| 4 | Dossiers | A renforcer | A definir | Ajouter les relations transversales |
| 5 | Documents | A renforcer | A definir | Finaliser recherche et versions |
| 6 | E-mails et reponses | A renforcer | A definir | Tester envoi et pieces jointes |
| 7 | Taches et relances | En place | A definir | Relier aux dossiers |
| 8 | Tableau de bord | En place | A definir | Afficher les actions urgentes |
| 9 | Modeles et procedures | En place | A definir | Relier les modeles aux motifs |
| 10 | Pilotage et securite | En place | A definir | Completer les liens dossier |

## 7. Registre de liens entre modules

| Depuis | Action | Vers | Resultat attendu |
|---|---|---|---|
| Reception | Convertir | Dossiers | Creation d'un dossier avec contact |
| Reception | Identifier | CRM | Contact nouveau ou existant |
| Dossiers | Ajouter une piece | Documents | Document rattache et historise |
| Dossiers | Repondre | E-mails | Message conserve dans la conversation |
| Dossiers | Planifier | Taches | Prochaine action avec echeance |
| Documents | Joindre | E-mails | Piece autorisee envoyee depuis la bibliotheque |
| E-mails | Demander une piece | Dossiers | Statut en attente et tache de suivi |
| Taches | Terminer | Dossiers | Historique mis a jour et prochaine action visible |
| Pilotage | Controler | Dossiers | Risques, budgets et decisions relies |

## 8. Controle avant chaque modification

Avant de modifier un module, verifier :

- le module est-il bien celui qui doit porter cette information ?
- existe-t-il deja un champ ou une relation utilisable ?
- le changement cree-t-il un doublon ?
- quel est le parcours utilisateur complet ?
- quelle est la prochaine action apres cette modification ?
- quel e-mail ou document doit etre conserve ?
- quels roles peuvent effectuer l'action ?
- quel test prouve que cela fonctionne ?
- quelles pages ou APIs peuvent regresser ?

## 9. Definition de termine

Un module est termine lorsqu'il est :

- compris sans formation longue ;
- accessible par la navigation principale ou un lien contextuel ;
- relie au CRM et au dossier lorsque necessaire ;
- utilisable sur mobile ;
- protege par les droits appropries ;
- couvert par un test nominal et un test d'erreur ;
- documente dans ce protocole ;
- valide par une personne responsable ;
- compatible avec la prochaine etape du parcours.

## 10. Mode de travail pour la suite

Le developpement suit une boucle stricte :

```text
Choisir un module
    -> remplir sa fiche
    -> verifier les relations
    -> construire l'ecran
    -> relier les actions
    -> tester
    -> valider
    -> seulement ensuite passer au module suivant
```

La priorite de travail est donc : reception, CRM, dossiers, documents, e-mails, taches, tableau de bord, puis pilotage. Cette sequence construit d'abord le parcours quotidien avant les fonctions de gestion avancee.
