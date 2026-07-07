# TERRITOIRES VIVANTS FRANCE
## Dossier de conception UX/UI - TVF OS

Version : 0.1 - conception interface avant developpement  
Statut : a valider avant toute maquette haute fidelite et tout developpement  
Document source : `documents/cahier-des-charges-tvf-os.md` valide comme base de travail  
Usage : reference UX/UI pour concevoir l'interface, les parcours, les ecrans, les composants et les regles de navigation de TVF OS

---

## 0. Intention UX

TVF OS doit etre un logiciel metier moderne, sobre, rapide a comprendre et capable d'accompagner des utilisateurs aux niveaux tres differents : direction nationale, responsables d'antennes, referents de poles, charges de dossier, benevoles encadres et auditeurs.

L'interface doit donner une sensation de controle et de clarte. L'utilisateur doit toujours savoir :

- ou il se trouve ;
- ce qui est prioritaire ;
- quel dossier ou objet est concerne ;
- quelle est la prochaine action ;
- ce que l'IA propose ;
- ce qui doit etre valide par un humain ;
- quelles informations manquent ;
- quels risques bloquent la suite.

TVF OS ne doit pas ressembler a un site vitrine. Il doit ressembler a un espace de pilotage metier : dense, calme, lisible, fiable, concu pour travailler tous les jours.

---

## 1. Principes UX fondamentaux

### 1.1 Priorite a l'action suivante

Chaque ecran doit faire apparaitre l'action la plus utile :

- qualifier une demande ;
- relancer un contact ;
- verifier une piece ;
- valider une proposition IA ;
- preparer un rendez-vous ;
- prendre une decision ;
- cloturer ou archiver.

Un utilisateur ne doit pas chercher longtemps quoi faire. TVF OS doit transformer l'information en file de travail.

### 1.2 Une navigation par objets metier

La navigation doit etre organisee autour des objets que les equipes manipulent :

- demandes ;
- dossiers ;
- contacts ;
- organisations ;
- projets ;
- antennes ;
- documents ;
- taches ;
- connaissances ;
- indicateurs.

Les modules doivent etre relies, mais chaque objet doit avoir une fiche claire.

### 1.3 L'IA comme copilote visible mais encadre

L'IA doit etre presente dans tous les modules sous forme :

- de panneau lateral contextuel ;
- de suggestions actionnables ;
- de resume ;
- de brouillon ;
- de controle de completude ;
- de recherche dans les procedures ;
- d'alerte de risque.

L'IA ne doit jamais masquer la responsabilite humaine. Toutes les propositions importantes doivent avoir trois etats : propose, accepte, refuse.

### 1.4 Une interface progressive

TVF OS doit etre simple au premier regard et complet quand on entre dans le detail.

Principe :

- niveau 1 : tableau de bord et priorites ;
- niveau 2 : listes et files de travail ;
- niveau 3 : fiche metier ;
- niveau 4 : onglets de detail ;
- niveau 5 : historique, audit, traces, exports.

### 1.5 Une experience adaptee aux antennes

Chaque antenne doit retrouver la meme structure, avec son propre contexte :

- tableau de bord local ;
- demandes locales ;
- dossiers locaux ;
- contacts locaux ;
- carte locale ;
- taches locales ;
- documents locaux ;
- indicateurs locaux.

Le national garde une vue transverse, mais l'utilisateur local travaille dans son territoire.

---

## 2. Personas et besoins UX

| Persona | Besoin UX prioritaire | Interface ideale |
|---|---|---|
| Direction nationale | Voir l'etat global, arbitrer, detecter les risques | Tableau de bord national, alertes, comparaisons |
| Responsable d'antenne | Piloter le quotidien et distribuer le travail | Accueil antenne, file de travail, calendrier, carte |
| Referent de pole | Instruire les dossiers de son domaine | Vue pole, dossiers filtres, checklists, documents |
| Charge de dossier | Savoir quoi faire et garder la trace | Fiche dossier, taches, historique, assistant IA |
| Benevole encadre | Acceder uniquement a ses missions | Portail simplifie, missions, consignes, compte rendu |
| Administratif | Gerer documents, conventions, finances | Bibliotheques, validations, echeances, exports |
| Communication | Valoriser uniquement ce qui est valide | Dossiers communicables, preuves, kit media |
| Auditeur | Verifier la conformite sans modifier | Journal, traces, decisions, exports |

---

## 3. Architecture d'information globale

### 3.1 Navigation principale

La navigation principale doit etre verticale, stable et toujours visible sur desktop. Sur mobile, elle devient un menu compact.

Arborescence cible :

1. Accueil
2. File de travail
3. Demandes
4. Dossiers
5. Projets
6. Contacts
7. Organisations
8. Carte
9. Agenda
10. Documents
11. Modeles
12. Procedures
13. Connaissances
14. Antennes
15. Finances
16. Impact
17. Gouvernance
18. Risques
19. Assistant IA
20. Parametres

Les entrees visibles dependent du role.

### 3.2 Navigation secondaire

Chaque module doit avoir une barre secondaire :

- filtres ;
- vues enregistrees ;
- recherche ;
- actions rapides ;
- exports ;
- aide IA.

### 3.3 Navigation contextuelle dans une fiche

Les fiches metier doivent partager une structure commune :

1. En-tete : titre, statut, priorite, responsable, actions.
2. Synthese : resume, prochaine action, alertes.
3. Onglets :
   - Apercu
   - Informations
   - Taches
   - Documents
   - Echanges
   - Decisions
   - Risques
   - Historique
4. Panneau IA lateral.

### 3.4 Recherche globale

La recherche globale doit etre accessible partout.

Elle doit chercher dans :

- demandes ;
- dossiers ;
- contacts ;
- organisations ;
- documents ;
- procedures ;
- connaissances ;
- antennes ;
- projets.

Resultat attendu :

- resultats groupes par type ;
- indicateur de confidentialite ;
- action rapide ;
- resume IA si autorise.

---

## 4. Layout general

### 4.1 Structure desktop

Wireframe global :

```text
+--------------------------------------------------------------------------------+
| Top bar : recherche globale | antenne active | notifications | profil | IA      |
+----------------------+---------------------------------------------------------+
| Navigation principale | Fil d'Ariane / Titre / Actions principales             |
|                      |---------------------------------------------------------|
| Accueil              | Zone contenu module                                     |
| Demandes             |                                                         |
| Dossiers             |  [Filtres] [Vue] [Recherche] [Action]                   |
| Projets              |                                                         |
| Contacts             |  Table / Kanban / Carte / Detail                        |
| Documents            |                                                         |
| ...                  |---------------------------------------------------------|
|                      | Panneau IA contextuel optionnel                         |
+----------------------+---------------------------------------------------------+
```

### 4.2 Structure fiche metier

```text
+--------------------------------------------------------------------------------+
| Dossier TVF-2026-0042 | P1 | En qualification | Resp. : A. Martin | Actions    |
+--------------------------------------------------------------------------------+
| Resume court | Prochaine action | Pieces manquantes | Alertes risques          |
+--------------------------------------------------------------------------------+
| Onglets : Apercu | Informations | Taches | Documents | Echanges | Decisions     |
+------------------------------------------------------+-------------------------+
| Contenu de l'onglet                                   | Assistant IA            |
|                                                       | - Resume                |
|                                                       | - Suggestions           |
|                                                       | - Brouillon reponse     |
|                                                       | - Sources               |
+------------------------------------------------------+-------------------------+
```

### 4.3 Structure mobile

Le mobile sert surtout a consulter, valider, saisir rapidement et travailler sur le terrain.

Principes :

- navigation basse ou menu compact ;
- priorite a "mes taches", "mes dossiers", "ajouter une note", "ajouter une photo", "valider/refuser" ;
- fiches en accordions ;
- IA sous forme de panneau ouvrable ;
- mode terrain avec saisie simplifiee.

---

## 5. Design system fonctionnel

### 5.1 Ton visuel

TVF OS doit etre :

- professionnel ;
- institutionnel ;
- calme ;
- lisible ;
- moderne ;
- dense mais pas surcharge ;
- adapte a un usage quotidien.

La palette doit eviter une dominante trop decorative. Les couleurs servent a hierarchiser, pas a decorer.

### 5.2 Couleurs fonctionnelles

| Usage | Couleur indicative | Regle |
|---|---|---|
| Action principale | Vert profond ou bleu sobre | Une seule action primaire par zone |
| Information | Bleu | Etat neutre, lien, aide |
| Succes | Vert | Validation, completude, accord |
| Attention | Ambre | Piece manquante, attente, delai |
| Danger | Rouge | Risque, refus, retard critique |
| IA | Teinte specifique discrete | Suggestions IA, jamais confusion avec validation |
| Archive | Gris | Dossier clos, ancien, non actif |

### 5.3 Typographie

Regles :

- titres courts ;
- libelles explicites ;
- pas de jargon technique ;
- statuts toujours visibles ;
- dates au format lisible ;
- textes longs replies par defaut avec resume.

### 5.4 Composants communs

Composants obligatoires :

- barre de recherche globale ;
- selecteur d'antenne ;
- badge de statut ;
- badge de priorite ;
- badge de confidentialite ;
- fil d'Ariane ;
- tableau filtrable ;
- vue kanban ;
- vue carte ;
- fiche metier ;
- timeline ;
- panneau IA ;
- tiroir lateral ;
- modal de confirmation ;
- checklist ;
- bloc pieces manquantes ;
- bloc prochaine action ;
- bloc risque ;
- bouton de validation ;
- bouton de refus ;
- commentaire interne ;
- journal d'audit ;
- export CSV/PDF ;
- toast de confirmation ;
- notification ;
- centre d'aide contextuel.

### 5.5 Etats d'interface

Chaque liste et fiche doit prevoir :

- chargement ;
- vide ;
- erreur ;
- acces refuse ;
- donnees partielles ;
- hors ligne ;
- conflit de modification ;
- sauvegarde en cours ;
- sauvegarde reussie ;
- besoin de validation.

### 5.6 Statuts visuels standards

Demandes :

- Recue ;
- A completer ;
- En qualification ;
- Rendez-vous propose ;
- En attente retour ;
- A instruire ;
- Acceptee pour etude ;
- Reorientee ;
- Refusee ;
- Cloturee ;
- Archivee.

Priorites :

- P1 : critique ou strategique ;
- P2 : operationnelle ;
- P3 : generale.

Validation IA :

- Suggestion ;
- Acceptee ;
- Modifiee ;
- Refusee ;
- Ignoree.

---

## 6. Regles de navigation

### 6.1 Regle "un objet, une fiche"

Chaque objet majeur doit avoir une fiche unique :

- demande ;
- dossier ;
- contact ;
- organisation ;
- projet ;
- antenne ;
- document ;
- modele ;
- procedure ;
- connaissance ;
- risque ;
- decision.

Les modules peuvent afficher l'objet, mais ne doivent pas creer plusieurs endroits contradictoires.

### 6.2 Regle "retour au contexte"

Quand l'utilisateur ouvre une fiche depuis une liste, le retour doit le ramener :

- a la meme liste ;
- avec les memes filtres ;
- au meme endroit ;
- sans perdre la selection.

### 6.3 Regle "action critique confirmee"

Les actions suivantes exigent confirmation :

- refuser une demande ;
- archiver un dossier ;
- envoyer un e-mail externe ;
- valider une convention ;
- publier une connaissance ;
- exporter des donnees personnelles ;
- modifier les droits d'un utilisateur ;
- changer le responsable d'une antenne.

### 6.4 Regle "IA explicable"

Toute suggestion IA doit afficher :

- ce qui est propose ;
- pourquoi ;
- a partir de quelles donnees ;
- niveau de confiance ;
- action humaine attendue.

### 6.5 Regle "jamais d'impasse"

Chaque ecran vide doit proposer une action :

- creer ;
- importer ;
- demander a l'IA ;
- consulter un modele ;
- revenir au tableau de bord.

---

## 7. Parcours utilisateurs transverses

### 7.1 Traiter une nouvelle demande

Parcours :

1. L'utilisateur arrive sur "File de travail".
2. Il voit les nouvelles demandes triees par priorite.
3. Il ouvre une demande.
4. L'IA propose categorie, pole, priorite, responsable et pieces manquantes.
5. L'utilisateur accepte ou corrige.
6. Il choisit : demander des precisions, proposer rendez-vous, creer dossier, reorienter, refuser, archiver.
7. TVF OS cree les taches et brouillons necessaires.
8. L'utilisateur valide la reponse.

Wireframe :

```text
File de travail
+-------------------+------------+----------+-------------+----------------+
| Priorite          | Demande    | Profil   | IA propose  | Action         |
+-------------------+------------+----------+-------------+----------------+
| P1                | Bien vacant| Propriet.| Habitat     | Qualifier      |
| P2                | Materiaux  | Entrepr. | Materiaux   | Ouvrir         |
+-------------------+------------+----------+-------------+----------------+
```

### 7.2 Instruire un dossier

Parcours :

1. Ouvrir dossier.
2. Lire resume et prochaine action.
3. Consulter checklist.
4. Completer informations.
5. Ajouter pieces.
6. Creer ou traiter taches.
7. Demander avis IA ou procedure applicable.
8. Preparer decision.
9. Valider decision humaine.
10. Generer document ou cloturer.

### 7.3 Creer une antenne

Parcours :

1. Direction nationale ouvre "Antennes".
2. Action "Creer une antenne".
3. Assistant etape par etape :
   - territoire ;
   - responsable ;
   - maturite ;
   - poles actifs ;
   - droits ;
   - kit de lancement ;
   - formations ;
   - validation.
4. TVF OS genere l'espace local.
5. L'antenne apparait avec checklist de lancement.

### 7.4 Preparer un rendez-vous

Parcours :

1. Depuis dossier ou agenda, ouvrir evenement.
2. Voir participants, objectif, pieces, historique.
3. L'IA propose ordre du jour et questions.
4. L'utilisateur ajuste.
5. Apres rendez-vous, compte rendu.
6. L'IA extrait decisions et taches.
7. Validation humaine.

### 7.5 Chercher une procedure

Parcours :

1. Recherche globale ou assistant procedure.
2. Question en langage naturel.
3. Resultat avec procedure source.
4. Reponse courte.
5. Liens vers modele, checklist, dossier lie.
6. Possibilite d'ajouter la procedure au dossier.

---

## 8. Modules UX/UI detailles

### 8.1 Accueil / Tableau de bord national

Utilisateurs : direction nationale, administrateurs, auditeurs.

Objectif UX : comprendre en moins de 30 secondes l'etat national de TVF.

Arborescence :

- Vue nationale
- Antennes
- Poles
- Alertes
- Indicateurs
- Activite recente
- Exports

Ecrans :

- dashboard national ;
- comparaison des antennes ;
- alertes critiques ;
- indicateurs par pole ;
- carte nationale ;
- rapport hebdomadaire.

Composants :

- cartes KPI ;
- carte France ;
- tableau antennes ;
- liste alertes ;
- graphique activite ;
- panneau IA "synthese nationale".

Interactions :

- filtrer par periode, pole, statut, antenne ;
- cliquer une antenne pour basculer sur son tableau de bord ;
- generer synthese IA ;
- exporter rapport ;
- ouvrir alerte.

Wireframe :

```text
Dashboard national
+ KPI demandes + KPI dossiers + KPI alertes + KPI finances +
+ Carte antennes ----------------+ Alertes critiques --------+
|                                | - Dossiers P1 en retard    |
|                                | - Conventions a revoir     |
+--------------------------------+----------------------------+
+ Tableau antennes -------------------------------------------+
```

### 8.2 Accueil / Tableau de bord antenne

Utilisateurs : responsables d'antenne, referents, charges de dossier.

Objectif UX : lancer la journee de travail locale.

Arborescence :

- Priorites du jour
- Demandes a qualifier
- Dossiers actifs
- Taches
- Agenda
- Carte locale
- Indicateurs

Ecrans :

- accueil antenne ;
- file locale ;
- priorites par pole ;
- planning semaine ;
- activite recente.

Composants :

- bloc "a faire aujourd'hui" ;
- liste demandes P1/P2/P3 ;
- mini carte ;
- taches en retard ;
- prochains rendez-vous ;
- assistant "plan de journee".

Interactions :

- assigner une demande ;
- basculer une tache ;
- ouvrir dossier ;
- demander un resume IA ;
- filtrer par pole.

### 8.3 File de travail

Objectif UX : centraliser tout ce qui attend une action.

Arborescence :

- Mes actions
- Mon antenne
- Mon pole
- En retard
- A valider
- Suggestions IA

Ecrans :

- liste priorisee ;
- vue kanban ;
- vue calendrier ;
- validations en attente.

Composants :

- tableau d'actions ;
- badges priorite/statut ;
- tri par urgence ;
- actions rapides ;
- selection multiple ;
- panneau IA de priorisation.

Interactions :

- accepter une suggestion ;
- reporter ;
- assigner ;
- passer en termine ;
- ouvrir l'objet lie.

### 8.4 Demandes entrantes

Objectif UX : qualifier vite et bien.

Arborescence :

- Toutes les demandes
- Nouvelles
- A completer
- En qualification
- Rendez-vous
- Refusees / archivees

Ecrans :

- liste demandes ;
- fiche demande ;
- qualification assistee ;
- conversion en dossier ;
- reponse externe.

Composants :

- resume demande ;
- proposition IA ;
- formulaire de qualification ;
- bloc pieces ;
- bloc contact ;
- bouton "creer dossier" ;
- brouillon e-mail.

Interactions :

- corriger categorie IA ;
- fusionner avec contact existant ;
- demander pieces ;
- transformer en dossier ;
- refuser avec motif ;
- archiver.

Wireframe fiche :

```text
Demande TVF-2026-0008 | P1 | En qualification
+ Message recu ------------------+ IA --------------------------------+
| Texte, canal, pieces           | Categorie proposee : Proprietaire   |
| Contact detecte                | Pole : Habitat Vivant               |
| Organisation detectee          | Pieces manquantes                   |
+--------------------------------+-------------------------------------+
| Actions : Demander pieces | Creer dossier | Reorienter | Refuser     |
```

### 8.5 Dossiers

Objectif UX : instruire sans perdre le fil.

Arborescence :

- Tous les dossiers
- Par statut
- Par pole
- Par responsable
- En retard
- A decision
- Archives

Ecrans :

- liste dossiers ;
- kanban par statut ;
- fiche dossier ;
- checklist ;
- timeline ;
- decision ;
- cloture.

Composants :

- score de maturite ;
- prochaine action ;
- barre de progression ;
- onglets ;
- timeline ;
- pieces manquantes ;
- risques ;
- assistant dossier.

Interactions :

- changer statut ;
- ajouter note ;
- joindre document ;
- creer tache ;
- generer document ;
- demander synthese ;
- preparer decision.

### 8.6 Projets

Objectif UX : regrouper plusieurs dossiers en action territoriale.

Arborescence :

- Portefeuille projets
- Projets actifs
- En cadrage
- En financement
- En realisation
- Clotures

Ecrans :

- portefeuille ;
- fiche projet ;
- planning ;
- budget ;
- partenaires ;
- indicateurs ;
- reporting.

Composants :

- fiche projet ;
- timeline projet ;
- budget resume ;
- matrice risques ;
- livrables ;
- dossiers lies ;
- panneau IA plan d'action.

Interactions :

- rattacher dossier ;
- definir jalons ;
- mettre a jour budget ;
- generer note d'opportunite ;
- produire reporting.

### 8.7 Contacts

Objectif UX : retrouver rapidement toute personne et son historique.

Arborescence :

- Tous les contacts
- Proprietaires
- Elus / techniciens
- Entreprises
- Benevoles
- Financeurs
- Presse
- Doublons a verifier

Ecrans :

- annuaire ;
- fiche contact ;
- historique ;
- consentement ;
- relations ;
- dossiers lies.

Composants :

- carte contact ;
- historique echanges ;
- badges roles ;
- consentement RGPD ;
- notes internes ;
- actions rapides : ecrire, appeler, creer tache.

Interactions :

- dedoublonner ;
- rattacher organisation ;
- changer role ;
- ajouter note ;
- voir dossiers lies.

### 8.8 Organisations

Objectif UX : piloter les relations avec les structures.

Arborescence :

- Toutes
- Collectivites
- Entreprises
- Associations
- Financeurs
- Institutions
- Partenaires actifs
- Prospects

Ecrans :

- annuaire organisations ;
- fiche organisation ;
- contacts associes ;
- conventions ;
- contributions ;
- historique.

Composants :

- niveau relation ;
- type organisation ;
- contacts principaux ;
- documents lies ;
- prochaines actions ;
- reseau de relations.

Interactions :

- creer contact rattache ;
- qualifier relation ;
- ajouter convention ;
- planifier relance ;
- transformer prospect en partenaire.

### 8.9 Collectivites

Objectif UX : cadrer les relations publiques et territoriales.

Arborescence :

- Collectivites suivies
- Rendez-vous
- Diagnostics
- Conventions
- Territoires partenaires

Ecrans :

- liste collectivites ;
- fiche collectivite ;
- diagnostic territorial ;
- comite ;
- convention cooperation.

Composants :

- territoire ;
- interlocuteurs ;
- besoins identifies ;
- dossiers lies ;
- calendrier politique/administratif ;
- documents publics.

Interactions :

- preparer rendez-vous ;
- generer fiche territoire ;
- creer diagnostic ;
- suivre convention.

### 8.10 Entreprises

Objectif UX : suivre les contributions et partenariats.

Arborescence :

- Prospects
- Contributions materielles
- Competences
- Logistique
- Mecenat
- Partenaires actifs

Ecrans :

- liste entreprises ;
- fiche entreprise ;
- contribution ;
- convention ;
- historique.

Composants :

- type contribution ;
- potentiel ;
- contraintes ;
- materiaux lies ;
- contact referent ;
- prochaines relances.

Interactions :

- qualifier contribution ;
- creer proposition materiaux ;
- generer courrier ;
- planifier relance.

### 8.11 Proprietaires / Biens vacants

Objectif UX : separer clairement personne, bien et dossier.

Arborescence :

- Proprietaires
- Biens proposes
- Visites
- Scenarios
- Conventions

Ecrans :

- liste proprietaires ;
- fiche proprietaire ;
- fiche bien ;
- visite ;
- scenarios d'usage ;
- accord/convention.

Composants :

- carte bien ;
- statut accord ;
- autorisation visite ;
- photos ;
- contraintes ;
- risques ;
- usages possibles.

Interactions :

- creer bien depuis proprietaire ;
- demander pieces ;
- preparer visite ;
- comparer scenarios ;
- generer accord de principe.

### 8.12 Materiaux de reemploi

Objectif UX : tracer la ressource depuis la proposition jusqu'a l'affectation.

Arborescence :

- Propositions
- A qualifier
- Acceptes
- Refuses
- Stock
- Affectations
- Bordereaux

Ecrans :

- liste propositions ;
- fiche materiau/lot ;
- qualification ;
- stock ;
- affectation projet ;
- bordereau.

Composants :

- photos ;
- quantite ;
- etat ;
- localisation ;
- delai retrait ;
- criteres acceptation ;
- destination.

Interactions :

- accepter/refuser ;
- demander photos ;
- affecter a projet ;
- generer bordereau ;
- mettre a jour stock.

### 8.13 Friches et terrains

Objectif UX : qualifier avec prudence les sites sensibles.

Arborescence :

- Signalements
- Sites qualifies
- Audits
- Risques
- Usages possibles
- Cartographie

Ecrans :

- liste sites ;
- fiche site ;
- carte ;
- audit terrain ;
- risques ;
- note d'opportunite.

Composants :

- localisation approximative ou precise selon droits ;
- statut confidentialite ;
- proprietaire connu/inconnu ;
- acces ;
- risques ;
- photos ;
- usages potentiels.

Interactions :

- convertir signalement ;
- lancer audit ;
- masquer donnees sensibles ;
- generer note d'opportunite.

### 8.14 Missions solidaires / Benevoles

Objectif UX : donner un cadre simple aux missions.

Arborescence :

- Benevoles
- Missions ouvertes
- Missions attribuees
- Emargements
- Comptes rendus
- Formations

Ecrans :

- liste missions ;
- fiche mission ;
- fiche benevole ;
- consignes ;
- emargement ;
- compte rendu.

Composants :

- mission ;
- lieu ;
- date ;
- responsable ;
- consignes securite ;
- competences requises ;
- participants.

Interactions :

- affecter benevole ;
- valider consignes ;
- enregistrer presence ;
- saisir compte rendu.

### 8.15 E-mails et communications

Objectif UX : relier la communication aux dossiers.

Arborescence :

- Boite recue
- A traiter
- Brouillons IA
- Envoyes
- Relances
- Modeles

Ecrans :

- boite e-mail ;
- lecture ;
- rattachement dossier ;
- composition ;
- validation envoi ;
- historique.

Composants :

- message ;
- pieces jointes ;
- contacts detectes ;
- dossier suggere ;
- brouillon IA ;
- modeles.

Interactions :

- rattacher ;
- creer demande ;
- repondre avec modele ;
- valider brouillon IA ;
- programmer relance.

### 8.16 Agenda

Objectif UX : relier les evenements aux dossiers et taches.

Arborescence :

- Mon agenda
- Agenda antenne
- Visites
- Rendez-vous
- Comites
- Actions terrain

Ecrans :

- calendrier ;
- fiche evenement ;
- preparation ;
- compte rendu ;
- taches issues.

Composants :

- evenement ;
- participants ;
- ordre du jour ;
- documents a lire ;
- compte rendu ;
- decisions.

Interactions :

- creer evenement depuis dossier ;
- generer ordre du jour ;
- ajouter compte rendu ;
- extraire taches.

### 8.17 Taches et relances

Objectif UX : rendre le suivi impossible a oublier.

Arborescence :

- Mes taches
- Equipe
- En retard
- A valider
- Relances
- Termine

Ecrans :

- liste taches ;
- kanban ;
- fiche tache ;
- relances ;
- historique.

Composants :

- responsable ;
- date ;
- priorite ;
- objet lie ;
- checklist ;
- commentaire.

Interactions :

- terminer ;
- reporter ;
- assigner ;
- relancer ;
- ouvrir dossier lie.

### 8.18 Documents

Objectif UX : retrouver, classer, valider et proteger.

Arborescence :

- Tous les documents
- Recents
- A classer
- A valider
- Par dossier
- Par antenne
- Archives

Ecrans :

- bibliotheque ;
- fiche document ;
- lecteur ;
- versions ;
- validation ;
- classement.

Composants :

- type document ;
- statut ;
- version ;
- classification ;
- droits ;
- apercu ;
- liens objet.

Interactions :

- deposer ;
- classer ;
- versionner ;
- valider ;
- extraire resume IA ;
- lier a dossier.

### 8.19 Modeles

Objectif UX : produire des documents coherents et officiels.

Arborescence :

- Courriers
- E-mails
- Conventions
- Fiches
- Registres
- Budgets
- Kits antennes
- A valider

Ecrans :

- catalogue ;
- fiche modele ;
- generation ;
- previsualisation ;
- validation nationale.

Composants :

- categorie ;
- version ;
- statut officiel ;
- champs requis ;
- apercu ;
- bouton generer.

Interactions :

- choisir modele ;
- pre-remplir ;
- signaler champ manquant ;
- generer brouillon ;
- soumettre validation.

### 8.20 Procedures

Objectif UX : rendre la methode TVF directement applicable.

Arborescence :

- Procedures nationales
- Procedures locales
- Par module
- Obligatoires
- Recommandees
- En revision

Ecrans :

- repertoire ;
- fiche procedure ;
- checklist ;
- procedure liee a dossier ;
- historique versions.

Composants :

- etapes ;
- niveau obligatoire ;
- responsable ;
- date de revision ;
- modeles associes ;
- questions frequentes.

Interactions :

- appliquer a dossier ;
- poser question IA ;
- proposer revision ;
- consulter version precedente.

### 8.21 Base de connaissances

Objectif UX : repondre vite avec des sources fiables.

Arborescence :

- Recherche
- FAQ
- Retours d'experience
- Cas anonymises
- Erreurs a eviter
- Sources territoriales
- A valider

Ecrans :

- accueil connaissance ;
- recherche ;
- article ;
- suggestion IA ;
- validation ;
- revision.

Composants :

- article source ;
- tags ;
- contexte ;
- niveau validation ;
- date revision ;
- sources citees.

Interactions :

- rechercher ;
- demander reponse IA ;
- citer dans dossier ;
- proposer article ;
- valider connaissance.

### 8.22 Assistant IA

Objectif UX : centraliser l'aide intelligente sans creer de confusion.

Arborescence :

- Conversation globale
- Suggestions
- Brouillons
- Analyses
- Historique
- Parametres IA

Ecrans :

- assistant global ;
- panneau contextuel ;
- centre de suggestions ;
- validation des brouillons ;
- historique.

Composants :

- champ question ;
- cartes suggestion ;
- sources ;
- niveau confiance ;
- boutons accepter/modifier/refuser ;
- action creee.

Interactions :

- poser question ;
- appliquer suggestion ;
- transformer en tache ;
- creer brouillon ;
- expliquer une decision ;
- signaler erreur IA.

Wireframe panneau IA :

```text
Assistant IA
+ Resume du contexte
+ Suggestions
| 1. Classer en P1
| 2. Demander photos
| 3. Proposer RDV
+ Sources utilisees
+ Actions : Accepter | Modifier | Refuser
```

### 8.23 Cartographie

Objectif UX : visualiser sans exposer inutilement.

Arborescence :

- Carte nationale
- Carte antenne
- Biens
- Materiaux
- Friches
- Partenaires
- Projets
- Signalements

Ecrans :

- carte ;
- filtres couches ;
- fiche point ;
- analyse proximite ;
- export interne.

Composants :

- carte ;
- couches ;
- filtres ;
- panneau point ;
- niveau confidentialite ;
- legende.

Interactions :

- activer couche ;
- ouvrir point ;
- creer signalement ;
- rattacher a dossier ;
- masquer donnees sensibles.

### 8.24 Observatoire territorial

Objectif UX : transformer les donnees en priorites.

Arborescence :

- Sources
- Signalements
- Donnees publiques
- Diagnostics
- Notes d'opportunite
- Priorites

Ecrans :

- tableau sources ;
- fiche source ;
- diagnostic ;
- indicateurs territoire ;
- note d'opportunite.

Composants :

- source ;
- fiabilite ;
- territoire ;
- indicateur ;
- commentaire ;
- lien carte.

Interactions :

- ajouter source ;
- verifier source ;
- generer diagnostic ;
- rattacher a antenne.

### 8.25 Finances

Objectif UX : suivre budget, financements et obligations.

Arborescence :

- Vue financiere
- Budgets
- Depenses
- Financeurs
- Appels a projets
- Justificatifs
- Reporting

Ecrans :

- tableau financier ;
- budget projet ;
- fiche depense ;
- fiche financeur ;
- appel a projets ;
- reporting.

Composants :

- budget ;
- ligne depense ;
- statut justificatif ;
- echeance ;
- source financement ;
- alerte depassement.

Interactions :

- creer budget ;
- ajouter depense ;
- lier justificatif ;
- generer reporting ;
- alerter depassement.

### 8.26 Impact et statistiques

Objectif UX : montrer des resultats prouves.

Arborescence :

- National
- Antenne
- Pole
- Projets
- Preuves
- Exports

Ecrans :

- dashboard impact ;
- indicateurs ;
- preuves ;
- rapport ;
- comparaison.

Composants :

- KPI ;
- graphique ;
- filtre periode ;
- preuve liee ;
- statut de fiabilite.

Interactions :

- filtrer ;
- ouvrir preuve ;
- exclure donnees non validees ;
- generer bilan.

### 8.27 Gestion des antennes

Objectif UX : creer et superviser les antennes avec une checklist claire.

Arborescence :

- Toutes les antennes
- En prefiguration
- En lancement
- Operationnelles
- Checklist
- Equipes
- Formation

Ecrans :

- liste antennes ;
- fiche antenne ;
- assistant creation ;
- checklist lancement ;
- equipe ;
- maturite.

Composants :

- niveau maturite ;
- territoire ;
- responsable ;
- poles actifs ;
- checklist ;
- alertes national.

Interactions :

- creer antenne ;
- changer maturite ;
- activer pole ;
- inviter utilisateur ;
- generer kit.

### 8.28 Gestion des poles

Objectif UX : rendre les responsabilites lisibles.

Arborescence :

- Poles nationaux
- Poles par antenne
- Referents
- Dossiers par pole
- Procedures associees

Ecrans :

- vue poles ;
- fiche pole ;
- referents ;
- dossiers ;
- statistiques.

Composants :

- badge pole ;
- referent ;
- capacite ;
- dossiers actifs ;
- indicateurs.

Interactions :

- affecter referent ;
- filtrer dossiers ;
- activer/desactiver pole local.

### 8.29 Gouvernance et decisions

Objectif UX : tracer les decisions sans complexite.

Arborescence :

- Decisions
- Comites
- Ordres du jour
- PV
- Delegations
- Actions issues

Ecrans :

- registre decisions ;
- fiche decision ;
- comite ;
- ordre du jour ;
- PV ;
- delegations.

Composants :

- decision ;
- statut validation ;
- personnes presentes ;
- documents sources ;
- actions issues.

Interactions :

- creer decision depuis dossier ;
- valider ;
- generer PV ;
- assigner actions.

### 8.30 Risques et conformite

Objectif UX : rendre les blocages visibles avant l'erreur.

Arborescence :

- Risques ouverts
- RGPD
- Autorisations
- Securite terrain
- Incidents
- Audits

Ecrans :

- tableau risques ;
- fiche risque ;
- controle dossier ;
- incident ;
- audit.

Composants :

- niveau risque ;
- categorie ;
- mesure corrective ;
- responsable ;
- date limite ;
- statut.

Interactions :

- creer risque ;
- lier dossier ;
- valider mesure ;
- bloquer action sensible ;
- exporter audit.

### 8.31 Parametres

Objectif UX : configurer sans mettre en danger.

Arborescence :

- Utilisateurs
- Roles
- Permissions
- Antennes
- Statuts
- Categories
- Integrations
- IA
- Securite
- Exports

Ecrans :

- utilisateurs ;
- role ;
- matrice permissions ;
- integrations ;
- parametres IA ;
- journal.

Composants :

- table utilisateurs ;
- role ;
- interrupteur permission ;
- confirmation critique ;
- journal modification.

Interactions :

- inviter utilisateur ;
- changer role ;
- activer integration ;
- modifier statut ;
- consulter audit.

---

## 9. Arborescence MVP recommandee

Pour une premiere version utilisable, l'interface devrait se concentrer sur :

1. Accueil antenne
2. File de travail
3. Demandes
4. Dossiers
5. Contacts
6. Organisations
7. Taches
8. Documents
9. Modeles
10. Procedures
11. Assistant IA
12. Antennes
13. Parametres essentiels

Les modules Cartographie, Finances, Impact, Gouvernance avancee et Base de connaissances avancee peuvent etre prepares dans l'arborescence, mais actives progressivement.

---

## 10. Wireframes standards

### 10.1 Liste metier

```text
Titre module                                      [Action principale]
[Recherche] [Filtres] [Vue liste/kanban/carte] [Exporter]

+ Selection + Priorite + Statut + Nom + Type + Responsable + Echeance + Action +
|           | P1       | A qual. | ... | ...  | ...         | ...      | Ouvrir |
|           | P2       | En cours| ... | ...  | ...         | ...      | Ouvrir |

Panneau lateral si selection multiple :
- assigner
- changer statut
- exporter
- demander synthese IA
```

### 10.2 Fiche metier

```text
Fil d'Ariane
Titre fiche | Statut | Priorite | Responsable             [Actions]

+ Resume + Prochaine action + Alertes + Score de maturite +

Onglets : Apercu | Infos | Taches | Documents | Echanges | Decisions | Historique

Contenu principal                                      Assistant IA
```

### 10.3 Assistant de creation

```text
Creation d'une antenne
Etape 1/6 : Territoire

[Champ nom antenne]
[Territoire]
[Responsable pressenti]
[Niveau de maturite]

Progression : Territoire > Equipe > Poles > Droits > Kit > Validation

[Retour] [Enregistrer brouillon] [Continuer]
```

### 10.4 Validation IA

```text
Suggestion IA
Proposition : classer cette demande en P1, pole Habitat Vivant
Pourquoi : le message mentionne un bien vacant mobilisable et un proprietaire identifie.
Sources : message recu, procedure demandes, matrice formulaire.
Confiance : elevee

[Accepter] [Modifier] [Refuser]
```

---

## 11. Interactions detaillees

### 11.1 Creation rapide

Depuis n'importe quel ecran, un bouton "Creer" doit proposer selon les droits :

- demande ;
- dossier ;
- contact ;
- organisation ;
- tache ;
- document ;
- evenement ;
- note ;
- risque.

Le formulaire doit etre court au depart, puis enrichi apres creation.

### 11.2 Sauvegarde

Regles :

- sauvegarde automatique pour notes et brouillons ;
- bouton explicite pour actions engageantes ;
- message clair en cas d'erreur ;
- detection des conflits si deux personnes modifient.

### 11.3 Notifications

Types :

- tache assignee ;
- retard ;
- validation demandee ;
- reponse recue ;
- risque critique ;
- mention dans commentaire ;
- proposition IA importante.

Chaque notification doit mener a l'objet exact.

### 11.4 Commentaires internes

Chaque fiche doit permettre :

- note interne ;
- mention d'un utilisateur ;
- lien vers document ;
- conversion en tache ;
- confidentialite du commentaire.

### 11.5 Historique

L'historique doit afficher :

- action ;
- utilisateur ;
- date ;
- objet ;
- ancienne valeur ;
- nouvelle valeur ;
- commentaire eventuel ;
- origine IA ou humaine.

---

## 12. Regles d'accessibilite et ergonomie

Exigences :

- contraste suffisant ;
- navigation clavier ;
- libelles explicites ;
- focus visible ;
- pas d'information uniquement par couleur ;
- tableaux lisibles ;
- filtres persistants ;
- taille de police confortable ;
- messages d'erreur comprehensibles ;
- confirmations pour actions critiques ;
- mobile utilisable pour terrain.

---

## 13. Strategie responsive

### Desktop

Usage principal :

- pilotage ;
- qualification ;
- instruction ;
- tableaux ;
- documents ;
- reporting.

### Tablette

Usage principal :

- reunions ;
- visites ;
- consultation ;
- validation ;
- prise de notes.

### Mobile

Usage principal :

- notifications ;
- taches ;
- terrain ;
- photos ;
- notes rapides ;
- appels ;
- validation simple.

Les actions complexes restent optimisees desktop.

---

## 14. Onboarding utilisateur

### 14.1 Premiere connexion

Parcours :

1. Bienvenue.
2. Role et antenne affiches.
3. Rappel des regles de prudence.
4. Tour rapide : file de travail, dossiers, IA, procedures.
5. Taches de demarrage.
6. Acces a la formation.

### 14.2 Onboarding responsable d'antenne

Contenu :

- comprendre le tableau de bord ;
- qualifier une demande ;
- assigner un dossier ;
- utiliser les procedures ;
- consulter l'IA ;
- produire un reporting ;
- gerer l'equipe.

### 14.3 Onboarding benevole

Contenu :

- mes missions ;
- consignes ;
- securite ;
- compte rendu ;
- limites d'acces ;
- qui contacter.

---

## 15. UX IA detaillee

### 15.1 Formes de presence IA

| Forme | Usage |
|---|---|
| Panneau contextuel | Aide sur fiche ou liste |
| Bouton "Analyser" | Declencher une analyse |
| Suggestion passive | Recommandation non bloquante |
| Alerte | Risque ou incoherence |
| Brouillon | E-mail, document, compte rendu |
| Recherche conversationnelle | Procedures et connaissances |
| Synthese | Dossier, rendez-vous, antenne |

### 15.2 Regles d'affichage

- L'IA ne doit jamais prendre toute la place par defaut.
- Les suggestions doivent etre courtes.
- Les details doivent etre deplieables.
- Les sources doivent etre visibles.
- Les actions doivent etre explicites.
- Les corrections humaines doivent etre faciles.

### 15.3 UX de confiance

Chaque proposition IA doit pouvoir etre corrigee. Le systeme doit demander :

- "Pourquoi refusez-vous cette suggestion ?" quand c'est utile ;
- "Voulez-vous transformer cette correction en regle ?" pour les administrateurs ;
- "Voulez-vous ajouter cela a la base de connaissances ?" apres cloture.

---

## 16. Permissions UX

L'interface doit expliquer les restrictions.

Exemples :

- bouton masque si action interdite ;
- bouton visible mais desactive si l'utilisateur doit comprendre qu'une validation est requise ;
- message "Vous pouvez consulter ce dossier, mais seul le responsable d'antenne peut le cloturer" ;
- demande d'escalade : "Demander validation nationale".

Les droits ne doivent pas produire une experience confuse.

---

## 17. Indicateurs UX de reussite

TVF OS sera bien concu si :

- une nouvelle demande peut etre qualifiee en moins de 3 minutes ;
- un responsable voit ses priorites en moins de 30 secondes ;
- un dossier affiche toujours une prochaine action ;
- aucune demande P1 ne reste sans responsable ;
- un utilisateur trouve une procedure en moins de 2 recherches ;
- une antenne peut etre creee avec checklist complete ;
- les documents officiels sont generes depuis les bons modeles ;
- l'IA explique ses suggestions ;
- les utilisateurs novices peuvent travailler sans connaitre toute l'organisation TVF ;
- les utilisateurs avances peuvent filtrer, exporter et piloter finement.

---

## 18. Backlog UX avant maquette

Avant de produire des maquettes graphiques, il faudra valider :

1. Les modules MVP visibles au lancement.
2. Les roles exacts et leurs menus.
3. Les statuts officiels par objet.
4. Les champs obligatoires des fiches principales.
5. Les workflows prioritaires.
6. Les actions critiques soumises a validation.
7. Les niveaux de confidentialite.
8. Les contenus exacts du panneau IA.
9. Les composants communs.
10. Les gabarits de liste et de fiche.

---

## 19. Synthese UX

TVF OS doit etre concu comme un logiciel metier de coordination territoriale. Son experience doit etre stable, rassurante et orientee action.

La bonne interface n'est pas celle qui montre le plus de donnees, mais celle qui permet a chaque personne de savoir quoi faire, dans quel ordre, avec quelles preuves, quelles limites et quelle validation.

L'IA doit rendre la plateforme plus intelligente, mais l'UX doit rester responsable : les humains valident, l'IA assiste, la trace demeure.

Ce dossier UX/UI est la base de conception avant toute maquette visuelle et avant tout developpement.
