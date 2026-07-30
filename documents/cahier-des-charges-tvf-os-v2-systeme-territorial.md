# TVF OS V2 - Systeme territorial de revitalisation

## Positionnement verrouille

TVF OS n'est pas un simple CRM. C'est le systeme d'exploitation interne de l'Agence Territoriale de Revitalisation Immobiliere. Il doit piloter toute la chaine de revitalisation d'un bien, depuis son reperage jusqu'a sa remise en usage, sa cloture ou son orientation.

L'utilisateur ne doit pas avoir l'impression d'utiliser un logiciel administratif. Il doit avoir l'impression de piloter un territoire.

## Principe central

Toute l'interface est organisee autour de trois objets metier :

- le bien ou la ressource observee ;
- le dossier de revitalisation ;
- les acteurs mobilises autour de ce dossier.

Le parcours de reference est :

Reperer -> Qualifier -> Contacter -> Accompagner -> Mobiliser -> Transformer -> Remettre en usage -> Suivre.

## Les huit espaces TVF OS

| Espace | Role principal | Objectif utilisateur |
| --- | --- | --- |
| Tableau de bord territorial | Vision direction et priorites | Savoir quoi traiter aujourd'hui |
| Observatoire | Reperage, qualification, cartographie | Comprendre la vacance et les situations suivies |
| Dossiers de revitalisation | Fiche centrale par bien ou projet | Centraliser proprietaire, historique, documents, etapes et decisions |
| Parcours d'accompagnement | Etapes guidees | Connaitre la prochaine action |
| Reseau territorial | Proprietaires, collectivites, entreprises, partenaires | Mobiliser les bons interlocuteurs |
| Materiatheque solidaire | Ressources, stocks, dons, reservations | Tracer les entrees, sorties et affectations |
| Gestion interne | Courriers, documents, calendrier, utilisateurs | Organiser la vie de l'agence |
| TVF IA | Assistance redactionnelle et analytique | Rediger, resumer, preparer, analyser |

## Roles utilisateurs

- Directeur : vision complete, arbitrages, indicateurs, alertes.
- Charge de mission : qualification, dossiers, visites, taches, comptes rendus.
- Collectivite : acces limite aux dossiers et indicateurs de son territoire.
- Proprietaire : suivi de son dossier, depots de documents, rendez-vous.
- Partenaire : acces limite aux dossiers sur lesquels il intervient.

## Tableau de bord cible

L'accueil TVF OS doit afficher :

- une recherche universelle ;
- une carte territoriale centrale ;
- les signalements, dossiers, actions et alertes ;
- les priorites du jour ;
- les rendez-vous et taches ;
- un acces direct a TVF IA ;
- les huit espaces operationnels.

## Fiche dossier cible

Chaque dossier doit fonctionner comme une fiche operationnelle de revitalisation :

- photo ou visuel principal ;
- adresse ;
- reference automatique ;
- statut ;
- priorite ;
- charge de mission ;
- proprietaire ou interlocuteur ;
- documents ;
- photos ;
- diagnostics ;
- devis ;
- partenaires ;
- calendrier ;
- historique ;
- decisions ;
- prochaine action.

## Timeline metier

La timeline doit etre visible dans chaque dossier :

1. Signalement
2. Qualification
3. Recherche ou contact proprietaire
4. Visite
5. Etude
6. Orientation
7. Mobilisation partenaires
8. Suivi
9. Remise en usage
10. Cloture

Chaque etape doit pouvoir contenir notes, documents, photos et decisions.

## Design system cible

- Style SaaS premium, sobre et territorial.
- Fond blanc casse et vert foret dominant.
- Cartes arrondies de 16 a 24 px.
- Ombres legeres.
- Ic?nes fines et coherentes.
- Carte territoriale au centre de l'experience.
- Menus clairs et orientes metier.
- Responsive terrain pour usage mobile.

## Regle de developpement

Aucune refonte ne doit casser les connexions existantes : formulaires, Supabase, API admin, TVF Mobile, documents internes et authentification doivent rester fonctionnels.

Les anciennes pages techniques peuvent rester accessibles si necessaire, mais elles ne doivent pas guider l'experience principale.


## Processus operationnels guides

TVF OS doit guider le travail des equipes. L'utilisateur ne doit jamais se demander quelle action mener ensuite. Chaque dossier affiche son etat, son historique, ses pieces, ses interlocuteurs et la prochaine action recommandee.

### Processus 1 - Signalement d'un bien

1. Reception d'un signalement depuis le site, TVF Mobile, un e-mail, un appel, WhatsApp ou un charge de mission.
2. Attribution automatique d'une reference de type TVF-2026-000154.
3. Geolocalisation du bien ou de la ressource sur la carte.
4. Verification des informations fournies.
5. Attribution d'un charge de mission.
6. Definition d'un niveau de priorite.
7. Ouverture du dossier lorsque le suivi est justifie.

### Processus 2 - Qualification

Le charge de mission est guide par une sequence de questions : type de bien, etat apparent, duree supposee de vacance, photos disponibles, proprietaire identifie, documents existants. A la fin, TVF OS produit une fiche de qualification.

### Processus 3 - Contact

TVF OS propose les actions adaptees : appeler, envoyer un e-mail, generer un courrier, programmer un rendez-vous ou programmer une visite. Chaque action est ajoutee a la chronologie du dossier.

### Processus 4 - Visite

Sur mobile, le charge de mission peut ajouter photos, localisation, commentaires, etat du batiment, points de vigilance, estimation indicative et signature eventuelle. Le rapport de visite est ensuite genere automatiquement.

### Processus 5 - Analyse

TVF OS ouvre une grille d'analyse : potentiel du bien, contraintes, partenaires a mobiliser, pistes de reutilisation et prochaines etapes. Une synthese facilite la decision.

### Processus 6 - Mobilisation

Le charge de mission rattache les partenaires concernes : collectivite, entreprise, artisan, architecte, notaire, association ou autre acteur habilite. Chaque partenaire ne doit recevoir que les informations utiles a son intervention.

### Processus 7 - Mise en oeuvre

Le dossier suit les conventions, travaux, recherches d'occupants, photos, comptes rendus, partenaires et decisions. La progression reste visible en temps reel.

### Processus 8 - Cloture

TVF OS verifie les documents, actions terminees et resultat du dossier. La cloture peut produire un bilan, archiver le dossier et mettre a jour les indicateurs de l'Observatoire lorsque les donnees sont verifiees.

## Statuts standardises

| Statut | Usage |
| --- | --- |
| Nouveau signalement | Information recue mais non qualifiee |
| En qualification | Verification et fiche de qualification en cours |
| En contact | Proprietaire ou interlocuteur a contacter ou deja contacte |
| Visite realisee | Visite terrain effectuee, rapport attendu ou depose |
| Etude en cours | Analyse des solutions, contraintes et partenaires |
| Partenaires mobilises | Acteurs rattaches au dossier |
| Projet engage | Mise en oeuvre ou conventionnement en cours |
| Bien remis en usage | Usage retrouve et preuve rattachee |
| Dossier cloture | Dossier archive, oriente ou sans suite |

## Roles operationnels

| Role | Capacite principale |
| --- | --- |
| Accueil | Creer les demandes et repondre aux premiers contacts |
| Charge de mission | Qualifier, visiter, instruire et suivre les dossiers |
| Responsable de pole | Repartir les dossiers, valider les decisions et suivre les indicateurs |
| Direction | Piloter l'ensemble, analyser les resultats et arbitrer |
| Collectivite | Consulter les dossiers de son territoire selon les droits accordes |
| Proprietaire | Suivre son dossier, deposer des documents et prendre rendez-vous |
| Partenaire | Consulter uniquement les dossiers sur lesquels il intervient |

## Automatisations attendues

- Creation de numero de dossier.
- Generation de courriers.
- Rappels de rendez-vous.
- Alertes sur dossiers inactifs.
- Relances automatiques.
- Generation de comptes rendus.
- Mise a jour d'indicateurs.
- Archivage des dossiers clotures.

## Centre de notifications

Chaque utilisateur doit voir les notifications utiles a son role : nouvelle demande, rendez-vous a venir, document ajoute, dossier en attente, tache en retard ou message partenaire.

## Fil d'activite dossier

Chaque dossier conserve une chronologie lisible : signalement recu, dossier cree, charge de mission affecte, premier contact, visite programmee, rapport depose, courrier envoye, convention signee, bien remis en usage.
