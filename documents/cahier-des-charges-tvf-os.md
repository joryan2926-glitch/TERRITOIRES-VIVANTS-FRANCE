# TERRITOIRES VIVANTS FRANCE
## Cahier des charges fonctionnel - TVF OS

Version : 0.1 - document de conception avant validation  
Statut : a valider avant tout developpement  
Usage : reference unique pour concevoir, prioriser et developper la future plateforme interne TVF OS

---

## 0. Principe directeur

TVF OS est le futur systeme d'exploitation interne de Territoires Vivants France. Sa finalite n'est pas seulement de stocker des informations, mais d'organiser toute l'association autour d'une methode commune : recevoir, qualifier, instruire, documenter, decider, agir, mesurer et transmettre.

Aucune fonctionnalite ne doit etre developpee avant validation de ce cahier des charges. Toute future decision technique devra rester subordonnee a ce document fonctionnel.

TVF OS doit permettre a une personne autorisee de creer, gerer et developper une antenne TVF partout en France avec les memes methodes, les memes procedures, les memes modeles, les memes circuits de validation et les memes exigences de prudence.

---

## 1. Vision du projet

### 1.1 Objectifs

Les objectifs principaux de TVF OS sont :

- centraliser toutes les informations utiles a TVF dans un espace interne unique ;
- standardiser les procedures nationales et locales ;
- assurer la tracabilite complete des demandes, dossiers, decisions, conventions, actions et resultats ;
- aider chaque antenne locale a appliquer la methode TVF sans repartir de zero ;
- automatiser les taches repetitives sans supprimer la validation humaine ;
- faire de l'assistant IA le copilote operationnel des equipes ;
- transformer chaque document, procedure et experience terrain en connaissance reutilisable ;
- proteger les donnees sensibles, les personnes, les proprietaires, les partenaires et la credibilite de l'association ;
- produire des indicateurs fiables pour piloter l'action, rendre compte et developper TVF nationalement.

### 1.2 Utilisateurs

TVF OS devra servir plusieurs familles d'utilisateurs :

| Utilisateur | Besoin principal |
|---|---|
| Direction nationale | Piloter TVF, valider les antennes, suivre les indicateurs, controler les risques |
| Responsables d'antenne | Creer et gerer une antenne locale, suivre les dossiers, coordonner les poles |
| Referents de pole | Instruire les dossiers relevant de leur domaine |
| Charge de relation partenaires | Suivre collectivites, entreprises, financeurs, associations et proprietaires |
| Benevoles internes | Contribuer a des taches encadrees avec acces limite |
| Equipe administrative | Gerer documents, conventions, finances, adherents, reporting |
| Equipe communication | Preparer contenus, preuves, kit media et valorisation des actions validees |
| Assistant IA | Lire, classer, proposer, relancer, synthetiser, rechercher, apprendre |
| Auditeurs ou controleurs internes | Verifier la conformite, les decisions, les traces et les donnees |

### 1.3 Fonctionnement general

TVF OS doit fonctionner comme une chaine operationnelle :

1. Une entree arrive : e-mail, formulaire, appel, WhatsApp, signalement, rendez-vous, import, action terrain.
2. Le systeme cree ou rattache l'information a une entite existante : contact, organisation, antenne, territoire, dossier, projet, bien, materiau, financeur.
3. L'assistant IA analyse le contenu, propose une categorie, une priorite, un pole responsable, un statut et les prochaines actions.
4. Un humain valide ou corrige.
5. Le dossier suit un workflow clair avec pieces, taches, echeances, responsables et decisions.
6. Les documents sont produits depuis des modeles valides.
7. Les echanges sont conserves dans l'historique du dossier.
8. Les decisions sont tracees.
9. Les resultats alimentent les statistiques, l'impact et la base de connaissances.
10. Les enseignements servent aux autres antennes.

### 1.4 Architecture globale fonctionnelle

TVF OS doit etre organise autour de six blocs :

| Bloc | Role |
|---|---|
| Socle organisationnel | Antennes, roles, utilisateurs, permissions, gouvernance |
| Socle relationnel | Contacts, organisations, partenaires, proprietaires, collectivites, entreprises |
| Socle operationnel | Demandes, dossiers, projets, taches, workflows, documents |
| Socle connaissance | Procedures, modeles, base documentaire, retours d'experience, FAQ interne |
| Socle IA | Analyse, tri, generation, recherche, synthese, recommandations, apprentissage |
| Socle pilotage | Tableaux de bord, finances, impact, risques, cartographie, reporting |

---

## 2. Organisation de TVF

### 2.1 Organisation nationale

Le niveau national doit garantir l'unite de TVF :

- definition de la methode TVF ;
- validation des procedures ;
- creation et supervision des antennes ;
- validation des roles sensibles ;
- controle des risques juridiques, financiers et reputationnels ;
- gestion des modeles officiels ;
- suivi des indicateurs nationaux ;
- capitalisation des bonnes pratiques ;
- arbitrage des dossiers complexes ;
- relations nationales avec institutions, financeurs, partenaires et reseaux.

### 2.2 Antennes locales

Une antenne locale est une unite operationnelle territoriale rattachee a TVF national. Elle peut couvrir une commune, une intercommunalite, un departement ou un bassin de vie.

Chaque antenne doit disposer :

- d'un nom officiel ;
- d'un territoire d'intervention ;
- d'un responsable ;
- d'une equipe ;
- d'une liste de poles actifs ;
- d'un tableau de bord local ;
- d'un registre de demandes ;
- d'un portefeuille de contacts et partenaires ;
- d'une cartographie des sujets locaux ;
- d'un plan d'action ;
- d'un niveau de maturite.

### 2.3 Niveaux de maturite des antennes

| Niveau | Description | Droits associes |
|---|---|---|
| Idee | Territoire identifie, pas encore active | Diagnostic et prefiguration |
| Prefiguration | Responsable pressenti, premiers contacts | Acces limite aux modeles et CRM local |
| Lancement | Antenne autorisee a traiter les premieres demandes | Workflows complets avec supervision nationale |
| Operationnelle | Antenne capable de gerer plusieurs dossiers | Autonomie encadree |
| Confirmee | Antenne avec resultats, partenaires et reporting regulier | Capacite de former d'autres antennes |

### 2.4 Poles TVF

Les poles structurent l'action. Ils ne sont pas des silos : un dossier peut mobiliser plusieurs poles.

| Pole | Perimetre |
|---|---|
| Habitat Vivant | Logements vacants, immeubles inutilises, proprietaires, scenarios d'usage |
| Commerce Vivant | Commerces fermes, rez-de-chaussee vacants, activation economique ou associative |
| Materiautheque Solidaire | Materiaux, mobilier, equipements, reemploi, tri, stockage, affectation |
| Friches & Terrains Vivants | Friches, terrains delaisses, espaces inutilises, usages temporaires |
| Solidarite & Insertion | Benevoles, habitants, associations, missions encadrees, insertion |
| Collectivites & Territoires | Communes, EPCI, diagnostics, cooperation publique, conventions |
| Financement & Mecenat | Financeurs, fondations, budgets, appels a projets, reporting |
| Observatoire & Donnees | Signalements, sources, cartographie, indicateurs territoriaux |
| Communication & Plaidoyer | Valorisation, kit media, contenus, relations presse |
| Gouvernance & Conformite | Decisions, risques, RGPD, conventions, transparence |

### 2.5 Roles et permissions

#### Roles principaux

| Role | Capacites |
|---|---|
| Super administrateur national | Acces complet, parametres critiques, creation antennes |
| Administrateur national | Supervision nationale, procedures, modeles, tableaux de bord |
| Responsable d'antenne | Pilotage local, attribution dossiers, validation locale |
| Referent de pole | Instruction des dossiers de son pole |
| Charge de dossier | Gestion operationnelle d'un dossier attribue |
| Contributeur | Ajout de notes, pieces, comptes rendus sur dossiers autorises |
| Benevole encadre | Acces a missions et documents strictement necessaires |
| Lecteur interne | Consultation limitee |
| Auditeur | Lecture des traces, decisions, historiques et exports conformite |
| Assistant IA | Acces encadre aux donnees necessaires selon contexte et droits utilisateur |

#### Principes de permission

- Un utilisateur ne voit que ce qui est utile a sa mission.
- Les donnees sensibles sont compartimentees par antenne, role et niveau de confidentialite.
- Les decisions engageantes exigent une validation humaine.
- Les suppressions sont exceptionnelles ; l'archivage est privilegie.
- Toute action critique doit produire une trace : auteur, date, contexte, ancien et nouveau statut.
- L'IA ne doit jamais accorder elle-meme une autorisation, signer une convention, accepter un engagement financier ou publier une information sensible.

---

## 3. Cartographie complete de la plateforme

### 3.1 Modules socles

1. Tableau de bord national
2. Tableau de bord antenne
3. CRM contacts
4. Organisations
5. Collectivites
6. Entreprises
7. Partenaires
8. Proprietaires
9. Financeurs et mecenes
10. Benevoles et adherents
11. Demandes entrantes
12. Dossiers
13. Projets
14. Taches et relances
15. Agenda
16. E-mails et communications
17. Gestion documentaire
18. Bibliotheque de modeles
19. Procedures
20. Base de connaissances
21. Assistant IA
22. Cartographie
23. Observatoire territorial
24. Finances
25. Impact et statistiques
26. Gestion des antennes
27. Gestion des poles
28. Gouvernance et decisions
29. Risques et conformite
30. Parametres

### 3.2 Modules metiers specifiques TVF

| Module | Utilite |
|---|---|
| Biens vacants | Suivre logements, immeubles, locaux, proprietaires, visites, scenarios |
| Commerces inoccupes | Qualifier cellules, rues, usages possibles, porteurs, contraintes |
| Materiaux de reemploi | Tracer propositions, stocks, criteres, affectations, bordereaux |
| Friches et terrains | Qualifier sites, risques, acces, usages, cartographie |
| Missions solidaires | Gerer missions benevoles, chantiers encadres, emargements, securite |
| Conventions | Suivre accords, versions, signatures, echeances, obligations |
| Visites terrain | Preparations, autorisations, comptes rendus, photos, risques |
| Signalements citoyens | Recevoir, verifier, qualifier, classer ou transformer en dossier |
| Appels a projets | Reperer, qualifier, candidater, suivre les financements |
| Reporting financeur | Produire bilans, preuves, indicateurs, pieces justificatives |
| Kit de lancement antenne | Parcours complet de creation d'une antenne |
| Formation interne | Modules de formation, quiz, validation de competences |
| Retours d'experience | Capitaliser ce qui a marche, bloque ou doit etre evite |
| Annuaire territorial | Contacts locaux utiles par territoire |
| Veille territoriale | Sources publiques, dispositifs, appels a projets, actualites locales |

---

## 4. Detail des modules

### 4.1 Tableau de bord national

Objectif : donner a la direction une vision fiable de l'activite TVF.

Utilisateurs : direction nationale, administrateurs nationaux, auditeurs.

Fonctionnalites :

- indicateurs globaux par antenne, pole, statut, priorite et periode ;
- demandes recues, qualifiees, en retard, acceptees, archivees ;
- cartographie des antennes et territoires actifs ;
- dossiers sensibles ou bloquants ;
- financements demandes, obtenus, a justifier ;
- alertes conformite, RGPD, conventions echues, risques ouverts ;
- comparaison entre antennes ;
- export pour reunion nationale.

Automatisations :

- detection des retards ;
- synthese hebdomadaire par IA ;
- alerte sur antenne inactive ;
- detection de dossiers sans responsable ;
- proposition de priorites nationales.

Liens :

- antennes, dossiers, finances, impact, risques, IA.

Ecrans :

- vue nationale ;
- vue par antenne ;
- vue par pole ;
- vue alertes ;
- exports.

### 4.2 Tableau de bord antenne

Objectif : permettre a un responsable local de piloter son territoire.

Utilisateurs : responsable d'antenne, referents de pole, charges de dossier.

Fonctionnalites :

- demandes locales a traiter ;
- dossiers actifs ;
- taches du jour ;
- prochains rendez-vous ;
- partenaires a relancer ;
- documents recents ;
- carte locale ;
- indicateurs d'activite ;
- alertes de priorite.

Automatisations :

- resume quotidien ;
- proposition de plan de semaine ;
- relances automatiques a valider ;
- rappel des dossiers P1/P2/P3.

Liens :

- demandes, dossiers, agenda, CRM, cartographie, IA.

Ecrans :

- accueil antenne ;
- file de travail ;
- priorites ;
- calendrier ;
- indicateurs locaux.

### 4.3 CRM contacts

Objectif : centraliser toutes les personnes physiques en lien avec TVF.

Utilisateurs : tous les utilisateurs internes selon droits.

Fonctionnalites :

- fiche contact ;
- coordonnees ;
- consentement RGPD ;
- role externe : proprietaire, elu, technicien, entreprise, benevole, financeur, journaliste ;
- rattachement a une ou plusieurs organisations ;
- historique des echanges ;
- dossiers lies ;
- notes internes ;
- niveau de confidentialite.

Automatisations :

- dedoublonnage ;
- enrichissement depuis un formulaire ;
- rappel de consentement manquant ;
- proposition de rattachement organisation/dossier ;
- synthese de relation avant rendez-vous.

Liens :

- organisations, e-mails, dossiers, agenda, documents.

Ecrans :

- liste contacts ;
- fiche contact ;
- historique ;
- relations ;
- import/export.

### 4.4 Organisations

Objectif : gerer les structures : collectivites, entreprises, associations, financeurs, institutions, partenaires.

Fonctionnalites :

- fiche organisation ;
- type et sous-type ;
- territoire ;
- contacts rattaches ;
- niveau de relation : prospect, actif, conventionne, ancien, sensible ;
- documents et conventions ;
- contributions possibles ;
- historique des interactions.

Automatisations :

- classification par IA ;
- creation depuis e-mail ou formulaire ;
- alerte convention a renouveler ;
- proposition de prochaines actions.

Ecrans :

- annuaire organisations ;
- fiche organisation ;
- reseau de relations ;
- historique ;
- documents lies.

### 4.5 Demandes entrantes

Objectif : transformer toute entree en objet suivi et qualifie.

Utilisateurs : responsables d'antenne, charges de dossier, referents, IA.

Fonctionnalites :

- reception des formulaires F-01 a F-12 ;
- import manuel d'une demande recue par telephone, e-mail, WhatsApp ou rendez-vous ;
- numero unique au format `TVF-AAAA-0001` ;
- statut : recue, a completer, en qualification, rendez-vous propose, en attente retour, a instruire, acceptee pour etude, reorientee, refusee, cloturee/archivee ;
- priorite P1/P2/P3 ;
- categorie operationnelle ;
- pieces recues et manquantes ;
- responsable ;
- prochaine action ;
- decision possible.

Automatisations :

- lecture du message ;
- detection du profil ;
- proposition de categorie ;
- proposition de priorite ;
- proposition de pole principal ;
- creation d'une reponse d'accuse de reception ;
- detection de pieces manquantes ;
- creation de taches ;
- transformation en dossier apres validation.

Liens :

- CRM, e-mails, dossiers, documents, IA, agenda.

Ecrans :

- file des demandes ;
- fiche demande ;
- qualification assistee ;
- conversion en dossier ;
- historique.

### 4.6 Dossiers

Objectif : suivre tout sujet operationnel jusqu'a decision ou cloture.

Fonctionnalites :

- numero de dossier ;
- type : bien, materiaux, collectivite, entreprise, benevole, financeur, projet, signalement, presse ;
- statut et etape ;
- pole principal ;
- poles associes ;
- responsable ;
- parties prenantes ;
- pieces ;
- taches ;
- decisions ;
- risques ;
- documents generes ;
- historique complet.

Automatisations :

- generation de checklist selon type ;
- suggestion de pieces ;
- rappel d'echeance ;
- synthese automatique ;
- detection de blocage ;
- preparation de decision ;
- proposition de documents a generer.

Ecrans :

- liste dossiers ;
- fiche dossier ;
- chronologie ;
- pieces ;
- taches ;
- decision ;
- synthese IA.

### 4.7 Projets

Objectif : regrouper plusieurs dossiers autour d'une action territoriale.

Fonctionnalites :

- fiche projet ;
- territoire ;
- objectifs ;
- poles impliques ;
- partenaires ;
- budget ;
- calendrier ;
- risques ;
- indicateurs ;
- livrables ;
- comites et decisions ;
- reporting.

Automatisations :

- creation depuis dossier accepte ;
- proposition de plan d'action ;
- generation de budget previsionnel a partir de modele ;
- preparation de note d'opportunite ;
- reporting automatique.

Ecrans :

- portefeuille projets ;
- fiche projet ;
- planning ;
- budget ;
- impact ;
- documents.

### 4.8 Gestion documentaire

Objectif : centraliser, classer, versionner et proteger les documents TVF.

Fonctionnalites :

- depot de documents ;
- classement par antenne, dossier, projet, organisation et type ;
- versionning ;
- statut : brouillon, a valider, valide, remplace, archive ;
- droits d'acces ;
- recherche plein texte ;
- lien vers modeles ;
- journal des modifications.

Automatisations :

- reconnaissance du type de document ;
- extraction de resume ;
- detection des donnees sensibles ;
- suggestion de classement ;
- rappel d'expiration ;
- indexation dans la base de connaissances si document valide.

Ecrans :

- bibliotheque ;
- fiche document ;
- comparaison versions ;
- validation ;
- recherche.

### 4.9 Bibliotheque des modeles

Objectif : mettre a disposition les modeles officiels TVF.

Contenu attendu :

- fiches ;
- registres ;
- conventions ;
- courriers ;
- e-mails ;
- budgets ;
- plans d'action ;
- comptes rendus ;
- grilles d'instruction ;
- formulaires ;
- kits de lancement ;
- documents financeurs.

Automatisations :

- recommandation du bon modele selon dossier ;
- pre-remplissage depuis les donnees ;
- controle des champs manquants ;
- proposition de pieces jointes ;
- generation d'une version brouillon a valider.

Ecrans :

- catalogue ;
- fiche modele ;
- generation depuis modele ;
- historique des versions ;
- validation nationale.

### 4.10 Procedures

Objectif : garantir que chaque antenne suit les memes circuits.

Fonctionnalites :

- procedures nationales ;
- variantes locales autorisees ;
- checklist par procedure ;
- responsable de validation ;
- date d'application ;
- historique ;
- niveau obligatoire ou recommande.

Automatisations :

- affichage de la procedure applicable dans chaque dossier ;
- rappel des etapes non realisees ;
- detection d'action hors procedure ;
- question-reponse IA sur les procedures.

Ecrans :

- repertoire procedures ;
- fiche procedure ;
- checklist active ;
- changements recents.

### 4.11 Base de connaissances

Objectif : transformer l'activite TVF en memoire collective.

Fonctionnalites :

- articles internes ;
- FAQ ;
- retours d'experience ;
- decisions types ;
- erreurs a eviter ;
- cas d'usage ;
- sources territoriales ;
- lecons apprises ;
- validation editoriale.

Automatisations :

- proposition d'article apres cloture d'un dossier ;
- synthese des enseignements ;
- detection de questions frequentes ;
- recherche semantique ;
- reponse IA avec sources citees.

Ecrans :

- accueil connaissance ;
- recherche ;
- article ;
- suggestion IA ;
- validation.

### 4.12 E-mails et communications

Objectif : suivre les echanges entrants et sortants dans les dossiers.

Fonctionnalites :

- boite de reception connectee ;
- classement par dossier ;
- modeles de reponse ;
- brouillons IA ;
- pieces jointes ;
- envoi avec validation ;
- historique relationnel ;
- relances.

Automatisations :

- lecture automatique ;
- rattachement au bon contact/dossier ;
- detection du besoin ;
- proposition de reponse ;
- proposition de pieces jointes ;
- creation de taches ;
- relance programmee.

Ecrans :

- boite TVF ;
- fiche e-mail ;
- assistant de reponse ;
- relances ;
- historique.

### 4.13 Agenda

Objectif : organiser rendez-vous, visites, reunions, comites, actions terrain.

Fonctionnalites :

- calendrier par utilisateur, antenne, dossier et projet ;
- rendez-vous ;
- visites terrain ;
- reunions de comite ;
- rappels ;
- ordre du jour ;
- compte rendu.

Automatisations :

- proposition de preparation ;
- generation d'ordre du jour ;
- rappel des pieces a lire ;
- compte rendu IA a valider ;
- creation des taches issues du rendez-vous.

Ecrans :

- calendrier ;
- evenement ;
- preparation ;
- compte rendu ;
- taches issues.

### 4.14 Taches et relances

Objectif : eviter les oublis et rendre le suivi visible.

Fonctionnalites :

- tache ;
- responsable ;
- echeance ;
- priorite ;
- lien dossier/projet/contact ;
- statut ;
- commentaires ;
- pieces attendues ;
- relances.

Automatisations :

- creation depuis workflow ;
- rappel ;
- escalade en cas de retard ;
- proposition de replanification ;
- resume des taches du jour.

Ecrans :

- mes taches ;
- taches d'antenne ;
- kanban ;
- retard ;
- relances.

### 4.15 Cartographie

Objectif : visualiser les territoires, biens, signalements, ressources et partenaires.

Fonctionnalites :

- carte par antenne ;
- couches : biens, commerces, friches, materiaux, partenaires, projets, signalements ;
- niveau de confidentialite ;
- filtres ;
- fiche liee ;
- export de carte interne.

Automatisations :

- geocodage controle ;
- detection de proximite entre ressource et projet ;
- alerte sur doublons geographiques ;
- suggestion de priorite territoriale.

Ecrans :

- carte globale ;
- carte antenne ;
- fiche point ;
- couches ;
- analyse.

### 4.16 Finances

Objectif : suivre budgets, depenses, financements et obligations de reporting.

Fonctionnalites :

- budgets previsionnels ;
- depenses ;
- engagements ;
- recettes ;
- financeurs ;
- appels a projets ;
- justificatifs ;
- reporting ;
- restrictions d'usage.

Automatisations :

- alerte budget depasse ;
- rappel justificatif ;
- generation de reporting ;
- detection d'incoherence budget/action ;
- proposition de sources de financement.

Ecrans :

- tableau financier ;
- budget projet ;
- financement ;
- depense ;
- reporting.

### 4.17 Impact et statistiques

Objectif : mesurer uniquement ce qui est documente.

Fonctionnalites :

- indicateurs d'activite ;
- indicateurs d'impact ;
- indicateurs par pole ;
- preuves associees ;
- tableaux exportables ;
- suivi avant/apres ;
- transparence.

Exemples d'indicateurs :

- demandes recues ;
- dossiers qualifies ;
- biens et locaux instruits ;
- materiaux acceptes, refuses, affectes ;
- partenaires conventionnes ;
- heures benevoles ;
- missions realisees ;
- financements obtenus ;
- dossiers clos avec decision.

Automatisations :

- calcul depuis donnees validees ;
- exclusion des donnees non prouvees ;
- generation de bilan ;
- detection d'indicateurs manquants.

Ecrans :

- impact national ;
- impact antenne ;
- impact pole ;
- preuves ;
- exports.

### 4.18 Gestion des antennes

Objectif : creer, superviser et faire grandir les antennes TVF.

Fonctionnalites :

- creation d'antenne ;
- territoire ;
- responsable ;
- equipe ;
- poles actifs ;
- niveau de maturite ;
- checklist de lancement ;
- documents obligatoires ;
- formation ;
- supervision nationale.

Automatisations :

- assistant de creation ;
- generation du pack de lancement ;
- creation des tableaux de bord locaux ;
- creation des modeles locaux ;
- rappel des etapes manquantes.

Ecrans :

- liste antennes ;
- fiche antenne ;
- parcours de lancement ;
- equipe ;
- indicateurs.

### 4.19 Gouvernance et decisions

Objectif : tracer les decisions importantes.

Fonctionnalites :

- registre des decisions ;
- comites ;
- ordres du jour ;
- proces-verbaux ;
- votes ou validations ;
- arbitrages ;
- delegations ;
- historique.

Automatisations :

- preparation d'ordre du jour ;
- synthese des points a trancher ;
- generation de PV a valider ;
- rappel des decisions non executees.

Ecrans :

- registre ;
- decision ;
- comite ;
- PV ;
- actions liees.

### 4.20 Risques et conformite

Objectif : proteger TVF.

Fonctionnalites :

- registre des risques ;
- RGPD ;
- droits d'image ;
- autorisations de visite ;
- assurances ;
- securite terrain ;
- conflits d'interets ;
- donnees sensibles ;
- incidents.

Automatisations :

- alerte consentement manquant ;
- blocage d'une publication sans validation ;
- rappel assurance/autorisation ;
- detection de donnees personnelles dans un document ;
- proposition de mesures de reduction du risque.

Ecrans :

- tableau risques ;
- fiche risque ;
- conformite dossier ;
- incident ;
- audits.

### 4.21 Assistant IA

Objectif : etre le coeur intelligent de TVF OS.

L'assistant IA ne remplace pas les responsables. Il prepare, classe, propose, explique, synthetise et alerte. Les decisions engageantes restent humaines.

Fonctionnalites transversales :

- comprendre les demandes ;
- proposer categorie, priorite, pole et responsable ;
- creer brouillons de reponse ;
- proposer pieces jointes ;
- generer checklists ;
- rechercher dans les procedures ;
- produire syntheses de dossiers ;
- preparer rendez-vous ;
- proposer relances ;
- transformer une experience en connaissance ;
- detecter incoherences, oublis et risques ;
- expliquer pourquoi il propose une action.

Ecrans :

- assistant global ;
- assistant contextuel dans chaque dossier ;
- boite de suggestions ;
- historique des propositions ;
- centre d'apprentissage.

---

## 5. Assistant IA comme coeur de la plateforme

### 5.1 Logique generale

Chaque action importante dans TVF OS doit pouvoir etre accompagnee par l'IA :

- comprendre le contexte ;
- rechercher les precedents ;
- identifier la procedure applicable ;
- proposer une suite ;
- demander les informations manquantes ;
- produire un brouillon ;
- signaler les risques ;
- attendre validation humaine ;
- memoriser le resultat valide.

### 5.2 Exemple complet : arrivee d'un e-mail

Workflow cible :

1. Un e-mail arrive sur l'adresse officielle.
2. TVF OS enregistre l'e-mail et les pieces jointes.
3. L'IA lit le contenu.
4. Elle identifie le demandeur, son organisation et son territoire.
5. Elle detecte si le contact existe deja.
6. Elle propose la categorie : collectivite, proprietaire, entreprise, benevole, financeur, presse, signalement, autre.
7. Elle propose la priorite P1/P2/P3.
8. Elle identifie le pole principal et les poles associes.
9. Elle cree ou propose un dossier.
10. Elle liste les pieces recues et manquantes.
11. Elle propose une reponse adaptee.
12. Elle suggere les documents a joindre.
13. Elle cree les taches : verifier, appeler, demander pieces, proposer rendez-vous.
14. Elle propose un responsable selon antenne, pole et disponibilite.
15. Un humain valide ou corrige.
16. La reponse est envoyee apres validation.
17. Le suivi continue jusqu'a cloture.
18. A la cloture, l'IA propose un retour d'experience si utile.

### 5.3 Regles de securite IA

- L'IA doit citer ses sources internes lorsqu'elle repond a une question de procedure.
- L'IA doit distinguer fait, hypothese et recommandation.
- L'IA ne doit pas inventer de partenaire, financement, accord ou resultat.
- L'IA ne doit pas signer, valider ou engager TVF seule.
- L'IA doit demander validation humaine pour tout envoi externe important.
- L'IA doit respecter les droits d'acces de l'utilisateur.
- L'IA doit journaliser ses propositions.
- L'IA doit pouvoir etre corrigee ; les corrections alimentent l'apprentissage.

### 5.4 Types d'assistants IA

| Assistant | Mission |
|---|---|
| Assistant accueil | Trier les demandes entrantes |
| Assistant dossier | Aider a instruire un dossier |
| Assistant procedure | Repondre aux questions internes |
| Assistant document | Generer, relire, classer les documents |
| Assistant rendez-vous | Preparer les reunions et comptes rendus |
| Assistant antenne | Guider la creation et le pilotage local |
| Assistant finance | Aider budgets, financements, reporting |
| Assistant cartographie | Aider a analyser un territoire |
| Assistant impact | Produire bilans et indicateurs prouves |
| Assistant conformite | Identifier les risques et oublis |

---

## 6. Gestion des connaissances

### 6.1 Principe

Chaque procedure, document, decision, question frequente ou experience utile doit pouvoir etre transformee en connaissance exploitable.

La connaissance TVF doit etre :

- structuree ;
- sourcee ;
- datee ;
- validee ;
- rattachee a un contexte ;
- consultable par recherche ;
- exploitable par l'IA ;
- revisable.

### 6.2 Cycle de vie d'une connaissance

1. Creation : document, procedure, retour terrain, reponse a une question.
2. Proposition : l'IA ou un utilisateur propose une entree de connaissance.
3. Validation : un responsable confirme la fiabilite.
4. Publication interne : l'information devient disponible.
5. Utilisation : l'IA peut la citer.
6. Revision : date de revue, mise a jour ou archivage.

### 6.3 Types de connaissances

- procedure nationale ;
- procedure locale ;
- modele officiel ;
- FAQ interne ;
- decision type ;
- cas d'usage ;
- retour d'experience ;
- erreur a eviter ;
- argumentaire ;
- source territoriale ;
- grille de decision ;
- note juridique ou conformite ;
- repertoire de partenaires ;
- parcours de formation.

### 6.4 Apprentissage progressif

TVF OS doit apprendre par validation, pas par accumulation brute.

Exemples :

- si plusieurs dossiers proprietaires bloquent sur les memes pieces, l'IA propose d'ajouter ces pieces a la checklist ;
- si une antenne cree un bon modele de courrier, elle peut le proposer au national ;
- si une procedure produit trop d'erreurs, le systeme signale un besoin de simplification ;
- si une question revient souvent, l'IA propose une FAQ ;
- si un risque apparait dans plusieurs dossiers, il devient un point de controle.

---

## 7. Deploiement d'une nouvelle antenne

### 7.1 Objectif

Une nouvelle antenne TVF doit pouvoir etre creee rapidement, mais sans improvisation. TVF OS doit guider le responsable local pas a pas.

### 7.2 Parcours de creation

Etape 1 - Demande ou decision de prefiguration :

- territoire pressenti ;
- responsable pressenti ;
- motivation ;
- premiers contacts ;
- enjeux locaux ;
- validation nationale.

Etape 2 - Diagnostic initial :

- territoire ;
- donnees publiques ;
- enjeux : logements vacants, commerces, friches, materiaux, insertion, partenaires ;
- cartographie initiale ;
- ressources disponibles ;
- risques.

Etape 3 - Mise en place administrative :

- fiche antenne ;
- droits utilisateurs ;
- adresse ou canal local si necessaire ;
- tableau de bord ;
- registre de demandes ;
- documents de lancement ;
- charte et procedures obligatoires.

Etape 4 - Formation :

- methode TVF ;
- poles ;
- traitement des demandes ;
- prudence juridique ;
- RGPD ;
- utilisation des modeles ;
- usage de l'IA ;
- reporting.

Etape 5 - Prospection encadree :

- collectivites ;
- proprietaires ;
- entreprises ;
- associations ;
- financeurs ;
- benevoles ;
- medias locaux si valide.

Etape 6 - Premier comite local :

- presentation du diagnostic ;
- priorites ;
- premiers dossiers ;
- calendrier ;
- responsables ;
- risques.

Etape 7 - Passage en antenne active :

- validation nationale ;
- poles actifs ;
- objectifs 30/60/90 jours ;
- indicateurs ;
- cadence de reporting.

### 7.3 Kit automatique d'antenne

TVF OS doit generer :

- fiche antenne ;
- plan d'action 30 jours ;
- plan d'action 90 jours ;
- registre des contacts locaux ;
- registre des demandes ;
- tableau de bord ;
- kit courriers ;
- kit presentation ;
- checklist RGPD ;
- checklist partenaires ;
- calendrier de lancement ;
- page interne antenne ;
- base documentaire locale.

---

## 8. Workflows complets

### 8.1 Workflow general d'une demande

1. Reception.
2. Creation numero unique.
3. Qualification initiale IA.
4. Validation humaine.
5. Verification completude.
6. Attribution priorite.
7. Attribution pole principal.
8. Creation de taches.
9. Reponse initiale.
10. Demande de pieces si besoin.
11. Rendez-vous ou instruction.
12. Decision : completer, instruire, reorienter, refuser, conventionner, archiver.
13. Cloture.
14. Capitalisation.

### 8.2 Workflow collectivite

1. Reception formulaire ou contact.
2. Verification territoire et interlocuteur.
3. Creation fiche collectivite.
4. Demande d'elements : besoin, service referent, perimetre, calendrier.
5. Preparation rendez-vous de cadrage.
6. Compte rendu.
7. Diagnostic ou note d'opportunite.
8. Proposition de cooperation.
9. Validation interne.
10. Convention ou classement.
11. Suivi et reporting.

### 8.3 Workflow proprietaire / bien vacant

1. Reception proposition.
2. Verification qualite du demandeur.
3. Creation fiche proprietaire et fiche bien.
4. Demande pieces : adresse, photos, etat, contraintes, titre ou mandat si necessaire.
5. Analyse preliminaire.
6. Autorisation de visite.
7. Visite et audit terrain.
8. Scenarios d'usage.
9. Analyse risques, budget, partenaires.
10. Decision : refus, attente, etude, convention.
11. Suivi du bien.

### 8.4 Workflow materiaux de reemploi

1. Reception proposition.
2. Identification donneur.
3. Qualification : nature, volume, etat, localisation, delai, retrait.
4. Verification criteres d'acceptation.
5. Photos et pieces.
6. Decision : accepter, refuser, stocker, affecter, mettre en attente.
7. Bordereau de don.
8. Organisation logistique.
9. Affectation a projet.
10. Proces-verbal de remise si necessaire.
11. Mise a jour registre.

### 8.5 Workflow entreprise partenaire

1. Contact entrant ou prospection.
2. Creation fiche entreprise.
3. Identification contribution : materiaux, competences, transport, stockage, financement, mecenat.
4. Qualification des contraintes.
5. Proposition de cadre.
6. Validation interne.
7. Convention ou accord.
8. Suivi contribution.
9. Remerciement, reporting, renouvellement.

### 8.6 Workflow benevole / mission solidaire

1. Reception candidature.
2. Creation fiche benevole.
3. Verification disponibilites, competences, territoire.
4. Orientation vers mission.
5. Validation encadrement.
6. Transmission consignes.
7. Emargement.
8. Compte rendu.
9. Suivi engagement.
10. Capitalisation.

### 8.7 Workflow financeur / mecene

1. Identification financeur.
2. Fiche financeur.
3. Analyse criteres, calendrier, montants, priorites.
4. Selection de projets compatibles.
5. Note d'opportunite.
6. Budget previsionnel.
7. Validation nationale.
8. Depot ou rendez-vous.
9. Suivi.
10. Justificatifs.
11. Reporting.

### 8.8 Workflow signalement citoyen

1. Reception signalement.
2. Verification minimale : localisation, photos, source.
3. Ne pas publier.
4. Qualification : bien, commerce, friche, risque, doublon.
5. Recherche proprietaire ou acteur competent si autorise.
6. Decision : classer, completer, orienter, transformer en dossier.
7. Archivage avec prudence.

### 8.9 Workflow presse / institutionnel

1. Reception demande.
2. Identification media/interlocuteur.
3. Sujet, delai, angle.
4. Verification des elements communicables.
5. Kit media ou reponse ecrite.
6. Validation nationale.
7. Envoi.
8. Archivage.

### 8.10 Workflow visite terrain

1. Dossier eligible.
2. Autorisation ecrite.
3. Preparation : objectif, participants, risques.
4. Verification assurances et securite.
5. Visite.
6. Photos et observations.
7. Compte rendu.
8. Mise a jour risques.
9. Decision suivante.

### 8.11 Workflow convention

1. Decision de principe.
2. Choix du modele.
3. Pre-remplissage.
4. Verification juridique et operationnelle.
5. Validation interne.
6. Envoi partenaire.
7. Negociation.
8. Signature.
9. Archivage.
10. Suivi obligations et echeances.

### 8.12 Workflow cloture et apprentissage

1. Verification des taches terminees.
2. Decision finale.
3. Pieces archivees.
4. Indicateurs mis a jour.
5. Synthese de cloture.
6. Retour d'experience propose par IA.
7. Validation.
8. Publication dans base de connaissances si utile.

---

## 9. Architecture technique ideale

Cette section decrit une architecture cible sans developpement.

### 9.1 Principes

- application web securisee ;
- architecture modulaire ;
- base de donnees relationnelle centrale ;
- stockage documentaire securise ;
- moteur de recherche plein texte et semantique ;
- couche IA gouvernee ;
- journalisation complete ;
- API interne ;
- droits fins par role, antenne et objet ;
- possibilite d'integration e-mail, agenda, cartographie et stockage ;
- conformite RGPD des la conception.

### 9.2 Composants cibles

| Composant | Role |
|---|---|
| Interface web | Acces utilisateurs |
| API applicative | Logique metier et securite |
| Base relationnelle | Donnees structurees |
| Stockage fichiers | Documents, pieces, photos |
| Moteur de recherche | Recherche documentaire et dossiers |
| Index semantique | Recherche IA dans connaissances |
| Service IA | Classification, generation, synthese, assistance |
| Service e-mail | Reception, envoi, rattachement |
| Service agenda | Rendez-vous, rappels |
| Service cartographie | Geolocalisation et couches |
| Journal d'audit | Traces et conformite |
| Module reporting | Indicateurs et exports |

### 9.3 Objets de donnees principaux

- utilisateur ;
- role ;
- antenne ;
- pole ;
- contact ;
- organisation ;
- demande ;
- dossier ;
- projet ;
- tache ;
- evenement ;
- e-mail ;
- document ;
- modele ;
- procedure ;
- connaissance ;
- decision ;
- convention ;
- risque ;
- indicateur ;
- financement ;
- bien ;
- materiau ;
- signalement.

### 9.4 Securite et RGPD

Exigences :

- authentification forte ;
- gestion des roles ;
- journal d'audit ;
- consentements ;
- droit d'acces, rectification, suppression lorsque applicable ;
- politique de retention ;
- chiffrement des donnees sensibles ;
- cloisonnement entre antennes ;
- protection des pieces jointes ;
- controle avant export ;
- sauvegardes ;
- procedure d'incident.

### 9.5 Donnees et IA

L'IA doit fonctionner avec :

- donnees structurees du dossier ;
- documents valides ;
- procedures en vigueur ;
- base de connaissances ;
- historique autorise ;
- consignes de prudence ;
- niveau de droit de l'utilisateur.

Elle doit produire :

- proposition ;
- justification ;
- sources ;
- niveau de confiance ;
- action recommandee ;
- besoin de validation.

---

## 10. Roadmap de developpement

### Phase 0 - Validation du cahier des charges

Objectif : figer le perimetre fonctionnel initial.

Livrables :

- validation du present document ;
- liste des modules MVP ;
- regles de gouvernance ;
- priorites ;
- criteres de succes.

### Phase 1 - Socle organisationnel et demandes

Objectif : remplacer le suivi manuel par un back-office robuste.

Modules :

- utilisateurs ;
- roles ;
- antennes ;
- demandes entrantes ;
- CRM contacts ;
- organisations ;
- taches ;
- premiers tableaux de bord ;
- journal d'audit.

### Phase 2 - Dossiers, documents et workflows

Objectif : structurer l'instruction.

Modules :

- dossiers ;
- workflows par type ;
- gestion documentaire ;
- bibliotheque de modeles ;
- generation de documents ;
- decisions ;
- conventions.

### Phase 3 - Assistant IA operationnel

Objectif : integrer l'IA dans la reception et le suivi.

Fonctions :

- classification des e-mails et demandes ;
- propositions de reponses ;
- checklists automatiques ;
- syntheses de dossiers ;
- recherche dans procedures ;
- preparation de rendez-vous.

### Phase 4 - Antennes et deploiement national

Objectif : permettre la replication territoriale.

Modules :

- creation d'antenne ;
- kit de lancement ;
- formation ;
- tableau de bord antenne ;
- reporting national ;
- niveaux de maturite.

### Phase 5 - Cartographie, observatoire et impact

Objectif : piloter par territoire et preuves.

Modules :

- cartographie ;
- observatoire territorial ;
- indicateurs ;
- impact ;
- sources publiques ;
- rapports.

### Phase 6 - Finances, mecenat et reporting avance

Objectif : professionnaliser les financements et obligations.

Modules :

- budgets ;
- depenses ;
- financeurs ;
- appels a projets ;
- reporting financeur ;
- pieces justificatives.

### Phase 7 - Intelligence collective et amelioration continue

Objectif : faire apprendre TVF OS.

Modules :

- base de connaissances avancee ;
- retours d'experience ;
- suggestions d'amelioration ;
- analyse des blocages ;
- recommandations strategiques.

---

## 11. Ameliorations recommandees

### 11.1 Score de maturite d'un dossier

Chaque dossier pourrait avoir un score indiquant s'il est pret pour :

- rendez-vous ;
- visite ;
- convention ;
- financement ;
- communication ;
- cloture.

Ce score serait calcule a partir des pieces, validations, risques, budget, responsables et decisions.

### 11.2 Mode "prudence"

Un mode obligatoire pour les sujets sensibles :

- proprietaires ;
- logements ;
- mineurs ;
- insertion ;
- donnees personnelles ;
- presse ;
- financement ;
- securite terrain.

Ce mode imposerait des validations supplementaires.

### 11.3 Bibliotheque de cas reels anonymises

Chaque antenne pourrait consulter des cas resolus :

- contexte ;
- blocage ;
- procedure appliquee ;
- documents utilises ;
- erreurs a eviter ;
- resultat ;
- enseignements.

### 11.4 Simulateur de creation d'antenne

Avant d'ouvrir officiellement une antenne, TVF OS pourrait simuler :

- charge de travail ;
- besoins humains ;
- partenaires prioritaires ;
- risques ;
- budget minimal ;
- calendrier realiste.

### 11.5 Controle qualite mensuel

Chaque mois, l'IA pourrait produire :

- dossiers sans prochaine action ;
- dossiers en retard ;
- documents non classes ;
- conventions a renouveler ;
- donnees incompletes ;
- procedures non respectees ;
- connaissances a creer.

### 11.6 Centre de formation integre

TVF OS pourrait contenir un parcours de formation :

- methode TVF ;
- roles ;
- poles ;
- traitement des demandes ;
- RGPD ;
- securite terrain ;
- usage IA ;
- relation proprietaire ;
- relation collectivite ;
- financement.

Chaque utilisateur obtiendrait des droits progressifs selon les formations validees.

### 11.7 Passeport benevole et referent

Un utilisateur pourrait avoir un passeport interne indiquant :

- formations suivies ;
- missions realisees ;
- competences ;
- habilitations ;
- restrictions ;
- antennes rattachees.

### 11.8 Bibliotheque nationale de partenaires types

TVF OS pourrait proposer par territoire :

- acteurs institutionnels a contacter ;
- types d'entreprises utiles ;
- financeurs possibles ;
- structures d'insertion ;
- associations ;
- reseaux professionnels.

### 11.9 Mode offline terrain

Pour les visites, une version mobile pourrait permettre :

- checklist hors connexion ;
- notes ;
- photos ;
- risques ;
- signature d'autorisation ;
- synchronisation au retour.

### 11.10 Comite IA ethique et qualite

TVF devrait prevoir une gouvernance de l'IA :

- validation des usages ;
- controle des erreurs ;
- audit des propositions ;
- mise a jour des consignes ;
- protection des donnees ;
- evaluation de l'utilite reelle.

---

## 12. Conditions de validation avant developpement

Avant tout developpement, TVF doit valider :

- les modules indispensables du MVP ;
- les roles et permissions ;
- les workflows prioritaires ;
- les statuts officiels ;
- les types de dossiers ;
- les donnees sensibles ;
- les documents officiels a integrer ;
- les regles IA ;
- la roadmap ;
- les criteres de reussite.

Critere de validation : le present cahier des charges doit permettre a une personne externe au projet de comprendre ce que TVF OS doit faire, pourquoi, pour qui, avec quels circuits, quelles limites et quelles priorites.

---

## 13. Synthese executive

TVF OS doit devenir le cerveau de Territoires Vivants France. La plateforme doit organiser les demandes, les contacts, les dossiers, les antennes, les documents, les procedures, les connaissances, les finances, l'impact et les decisions dans un systeme unique.

Son originalite doit etre double :

- une methode nationale reproductible partout en France ;
- une IA integree au coeur de chaque processus, mais toujours encadree par la validation humaine.

Le succes de TVF OS ne se mesurera pas seulement au nombre de fonctionnalites developpees. Il se mesurera a sa capacite a rendre TVF plus claire, plus prudente, plus rapide, plus apprenante et plus facile a deployer localement.
