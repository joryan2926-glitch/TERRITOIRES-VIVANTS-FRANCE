# TVF OS - Cahier des charges fonctionnel et direction d'interface

Version : 1.0
Date : 2026-07-11
Statut : cadrage de la refonte ERP simplifiee

## 1. Objet

TVF OS doit devenir l'espace de travail unique de Territoires Vivants France. La plateforme rassemble les demandes recues par formulaire ou par e-mail, les contacts, les dossiers, les documents, les taches, les reponses, les conventions, les suivis financiers et l'historique.

La premiere version gere une seule structure nationale TVF. La gestion de plusieurs antennes, territoires ou entites est exclue du perimetre initial afin de privilegier la simplicite et la fiabilite.

## 2. Promesse d'usage

Un membre de l'equipe doit pouvoir ouvrir TVF OS et repondre a cinq questions :

1. Quelles demandes sont arrivees ?
2. Que dois-je traiter aujourd'hui ?
3. Quels dossiers sont en attente ?
4. Quelles pieces ou reponses manquent ?
5. Quelle est la prochaine action a effectuer ?

Regle directrice : chaque demande doit avoir un proprietaire, un statut, une prochaine action et un historique.

## 3. Perimetre fonctionnel

### Inclus dans le MVP ERP

- boite de reception centralisee des formulaires et e-mails ;
- CRM des personnes et organisations ;
- creation et suivi de dossiers ;
- classement par motif, besoin et interlocuteur ;
- reponse e-mail depuis un dossier ;
- transfert d'un e-mail avec ses pieces jointes ;
- bibliotheque documentaire et recherche ;
- demandes de pieces manquantes ;
- taches, echeances et relances ;
- journal d'activite ;
- tableau de bord de traitement ;
- modeles de courriers et de documents ;
- droits d'acces et protection des donnees.

### Hors perimetre initial

- gestion de plusieurs antennes ;
- comptabilite complete ;
- paie ;
- gestion de stocks physiques ;
- application mobile native ;
- automatisation d'une decision sensible sans validation humaine.

## 4. Utilisateurs

| Profil | Besoin principal | Acces recommande |
|---|---|---|
| Administrateur | Configurer, controler, auditer | Complet |
| Responsable TVF | Suivre les dossiers et valider | Dossiers, CRM, documents, pilotage |
| Instructeur | Traiter une demande et repondre | Reception, dossiers, documents, taches |
| Contributeur | Realiser des taches et ajouter des pieces | Dossiers affectes, documents autorises |
| Observateur | Consulter des tableaux de bord | Lecture seule |

## 5. Modele de donnees fonctionnel

### 5.1 Contact / organisation

Un contact peut etre une personne ou appartenir a une organisation. Une organisation peut etre une collectivite, une entreprise, une association, une fondation ou tout autre interlocuteur.

Champs essentiels : nom, prenom, e-mail, telephone, fonction, organisation, type d'interlocuteur, consentement, notes, dernier contact, prochaine action.

### 5.2 Demande entrante

Toute entree provenant du site ou de la boite e-mail devient une demande.

Champs essentiels : numero, date, source, objet, motif, description, urgence, contact, organisation, territoire, pieces jointes, statut, responsable et date de qualification.

Statuts : `Nouvelle`, `A qualifier`, `En cours`, `Convertie en dossier`, `En attente`, `Classee`.

### 5.3 Dossier

Le dossier est l'objet central. Il regroupe une ou plusieurs demandes, un ou plusieurs contacts, les echanges, les pieces, les taches, les decisions et les resultats.

Champs essentiels : numero de dossier, titre, type, motif, priorite, statut, responsable, contact principal, organisation, date d'ouverture, prochaine action, echeance et date de cloture.

Types de dossiers : partenariat, collectivite, proprietaire, materiaux, benevolat, financement, projet, communication, administratif, autre.

Statuts : `Ouvert`, `Qualification`, `Instruction`, `En attente de pieces`, `Decision`, `Execution`, `Cloture`, `Archive`.

### 5.4 Echange e-mail

Chaque e-mail entrant ou sortant est rattache au contact et au dossier lorsqu'une correspondance est connue.

Champs essentiels : expediteur, destinataires, objet, contenu, date, sens entrant ou sortant, dossier, pieces jointes, modele utilise, statut d'envoi et erreur eventuelle.

### 5.5 Document

Un document peut etre rattache a un contact, une organisation, une demande et un dossier.

Champs essentiels : nom, type, categorie, version, statut, date, auteur, dossier, mots-cles, niveau de confidentialite, fichier, empreinte et historique.

Categories : justificatif, convention, courrier, photo, note, modele, rapport, piece administrative, budget, preuve d'impact.

### 5.6 Tache

Une tache represente la prochaine action concrete.

Champs essentiels : libelle, dossier, responsable, priorite, echeance, statut, commentaire, date de realisation et preuve associee.

Statuts : `A faire`, `En cours`, `Bloquee`, `Terminee`, `Annulee`.

## 6. Parcours principal

```text
Formulaire ou e-mail
        |
        v
Boite de reception TVF OS
        |
        v
Qualification : motif, contact, urgence, responsable
        |
        +--> Classement sans suite avec justification
        |
        v
Creation ou rattachement d'un dossier
        |
        v
Pieces, echanges et taches
        |
        v
Reponse, decision ou demande de complement
        |
        v
Cloture, archivage et historique
```

## 7. Boite de reception

La boite de reception est le point d'entree principal.

Fonctions :

- afficher les demandes par ordre d'arrivee ;
- filtrer par nouveau, urgent, en attente ou attribue ;
- rechercher par nom, objet, e-mail ou mot-cle ;
- identifier un contact existant ;
- creer un nouveau contact ;
- creer un dossier ou rattacher l'entree a un dossier existant ;
- affecter un responsable ;
- ajouter une tache de qualification ;
- repondre ou demander une piece ;
- conserver la trace de la decision de classement.

## 8. CRM simplifie

La fiche CRM doit rester lisible et utile. Elle affiche :

- identite et coordonnees ;
- type d'interlocuteur ;
- organisation ;
- dossiers lies ;
- demandes recues ;
- echanges recents ;
- documents ;
- prochaine action ;
- consentement et restrictions ;
- historique.

Une fiche contact ne doit pas dupliquer un dossier. Le contact represente l'interlocuteur ; le dossier represente le sujet traite.

## 9. Dossier de travail

L'ecran dossier est organise en cinq blocs :

1. En-tete : numero, titre, statut, priorite et responsable.
2. Prochaine action : tache a effectuer, echeance et bouton d'action.
3. Echanges : conversation e-mail et reponse directe.
4. Pieces : documents recus, manquants, produits ou envoyes.
5. Historique : toutes les actions, modifications et decisions.

Actions principales : `Repondre`, `Demander une piece`, `Creer une tache`, `Changer le statut`, `Ajouter un document`, `Cloturer`.

## 10. E-mails et pieces jointes

Depuis un dossier, l'utilisateur peut :

- repondre au demandeur ;
- utiliser un modele de courrier ;
- modifier le contenu avant envoi ;
- joindre un document de la bibliotheque ;
- joindre un fichier local autorise ;
- transférer un e-mail a un interlocuteur ;
- ajouter une note interne non envoyee ;
- demander une piece manquante ;
- consulter l'etat d'envoi ;
- retrouver l'e-mail dans l'historique.

Les pieces jointes sont controlees par taille, type, virus si le service le permet, niveau de confidentialite et droit d'acces.

## 11. Bibliotheque documentaire

La bibliotheque est un espace de documents reutilisables et de pieces de dossiers.

Fonctions :

- recherche plein texte et par mot-cle ;
- filtres par categorie, type, date, version et statut ;
- distinction `Modele valide`, `Document de dossier`, `Archive` ;
- apercu avant envoi ;
- rattachement a un ou plusieurs dossiers autorises ;
- telechargement controle ;
- version suivante sans ecraser la precedente ;
- date de revision ;
- responsable du document ;
- historique des telechargements et envois.

## 12. Modeles de reponse

Les modeles doivent etre classes par motif :

- accusé de reception ;
- demande de rendez-vous ;
- demande de pieces ;
- proposition de partenariat ;
- proposition de materiaux ;
- proposition de bien ;
- financement et mecenat ;
- benevolat ;
- reponse negative motivee ;
- cloture de dossier.

Un modele ne doit jamais partir automatiquement s'il contient une decision engageante. L'utilisateur doit pouvoir le relire et le valider.

## 13. Tableau de bord simple

Le tableau de bord ne doit afficher que les indicateurs utiles au quotidien :

- nouvelles demandes ;
- demandes a qualifier ;
- dossiers en attente de pieces ;
- taches echues ;
- dossiers sans prochaine action ;
- reponses a envoyer ;
- dossiers ouverts par statut ;
- activite recente.

Les indicateurs d'impact et les statistiques publiques restent dans les modules de pilotage, sans encombrer le traitement quotidien.

## 14. Direction d'interface proposee

### Principe

TVF OS adopte une interface de travail claire, calme et fonctionnelle. L'ecran ne doit pas ressembler a un portail public ni a une collection de cartes decoratives.

### Structure visuelle

```text
┌──────────────────────────────────────────────────────────┐
│ TVF OS  | Rechercher... | + Nouvelle demande | Profil     │
├──────────────┬───────────────────────────────────────────┤
│ Boite de     │ Titre de l'ecran                          │
│ reception    │ Filtres                                   │
│ Demandes     │ Liste ou dossier principal                 │
│ Dossiers     │                                           │
│ Taches       │                                           │
│ Documents    │                                           │
│ Pilotage     │                                           │
│ Plus         │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### Navigation

Six entrees maximum :

1. Accueil
2. A traiter
3. Instruction
4. Territoires
5. Pilotage
6. Plus

Les liens secondaires sont affiches dans leur groupe et non dans une barre permanente.

### Design system

- fond general : vert gris tres clair ;
- surface de travail : blanc casse ;
- texte : bleu nuit ;
- action principale : vert TVF ;
- alerte : rouge reservee aux erreurs et risques ;
- attente : ambre ;
- rayon maximum : 10 px ;
- ombres tres discretes ;
- boutons courts, avec verbe d'action ;
- une seule colonne principale pour les listes ;
- panneaux lateraux uniquement pour le contexte ;
- aucun texte blanc sur fond clair ;
- contraste WCAG AA minimum ;
- responsive : navigation repliee sur mobile.

### Hierarchie des actions

Une seule action primaire par ecran. Les actions secondaires sont `Repondre`, `Ajouter`, `Affecter`, `Demander`, `Cloturer`. Les actions destructives ou irreversibles sont separees et confirmees.

## 15. Securite et conformite

- authentification unique ;
- role et permissions par action ;
- RLS Supabase ;
- acces aux pieces controle ;
- journal des actions sensibles ;
- limitation des telechargements ;
- conservation et suppression conformes a la politique RGPD ;
- secret de service uniquement cote serveur ;
- aucune cle sensible dans le navigateur ;
- sauvegarde et restauration documentees ;
- aucune decision automatique sans validation humaine.

## 16. Criteres d'acceptation

La refonte est validee lorsque :

- une demande de formulaire apparait dans la boite de reception ;
- un e-mail entrant peut etre transforme en demande ;
- une demande peut etre rattachee a un contact existant ;
- un dossier peut etre cree en moins d'une minute ;
- chaque dossier possede un statut et une prochaine action ;
- une reponse peut etre composee depuis le dossier ;
- un modele et une piece jointe peuvent etre ajoutes ;
- l'echange est visible dans l'historique ;
- un document peut etre retrouve par recherche ;
- une piece manquante peut etre demandee ;
- la cloture impose une justification ;
- les droits d'acces sont testes ;
- les erreurs d'envoi sont visibles ;
- aucun module existant ne perd son acces ;
- les tests JavaScript, API et production restent verts.

## 17. Phasage

### Phase 1 - Simplification de l'interface

- navigation courte ;
- accueil centre sur l'action ;
- groupe actif ouvert ;
- boite de reception comme point de depart ;
- recherche et filtres visibles.

### Phase 2 - Dossier unique

- liaison demande-contact-dossier ;
- statut et prochaine action ;
- historique commun ;
- pieces attendues et manquantes.

### Phase 3 - E-mails et documents

- reception e-mail ;
- envoi depuis dossier ;
- modeles ;
- bibliotheque ;
- version et recherche.

### Phase 4 - Pilotage

- taches et relances ;
- tableaux de bord ;
- finances ;
- risques ;
- gouvernance et impact.

## 18. Regles de simplicite

- Ne pas creer un module lorsqu'un dossier existant suffit.
- Ne pas afficher une information sans action possible.
- Ne pas demander deux fois la meme information.
- Ne pas multiplier les statuts.
- Ne pas envoyer un e-mail important sans validation humaine.
- Ne pas supprimer une piece ou un historique sans trace.
- Ne pas afficher les outils avances dans le parcours quotidien.

## 19. Resultat attendu

TVF OS doit devenir un poste de travail quotidien pour l'association : une seule boite d'entree, un CRM utile, un dossier unique, une bibliotheque documentaire et des reponses tracees. La plateforme doit aider l'equipe a traiter les demandes avec constance, sans multiplier les ecrans ni les manipulations.
