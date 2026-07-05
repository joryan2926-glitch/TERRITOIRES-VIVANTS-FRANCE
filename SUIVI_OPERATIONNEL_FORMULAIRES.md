# Processus de traitement des demandes entrantes TVF

Ce document sert de mode d'emploi interne pour traiter les formulaires recus depuis le site Territoires Vivants France.

## 1. Ou arrivent les demandes ?

Chaque formulaire envoye depuis le site suit trois chemins :

1. Enregistrement dans Supabase, table `contacts`.
2. Notification interne envoyee a l'adresse configuree dans Vercel (`TVF_NOTIFICATION_EMAIL`).
3. Accuse de reception envoye automatiquement au demandeur si son e-mail est renseigne.

Adresse temporaire conseillee pour la phase de lancement : `territoiresvivantsfrance@gmail.com`.

## 2. Lecture d'une demande

A reception, verifier :

- profil du demandeur ;
- nom ou structure ;
- e-mail ;
- telephone ;
- commune ou territoire ;
- objet ;
- categorie interne ;
- priorite ;
- message ;
- consentement RGPD.

## 3. Statuts internes recommandes

| Statut | Quand l'utiliser | Action attendue |
|---|---|---|
| nouveau | Demande recue, pas encore lue | Lire et qualifier sous 48 h ouvrables |
| a_qualifier | Informations insuffisantes | Demander les pieces manquantes |
| en_cours | Dossier en instruction | Suivre les echanges et prochaines etapes |
| rendez_vous | Rendez-vous propose ou confirme | Preparer ordre du jour et pieces utiles |
| en_attente | Attente d'une reponse externe | Relancer a date fixe |
| accepte | Demande retenue pour suite | Creer fiche projet ou fiche partenaire |
| refuse | Demande non compatible | Repondre clairement et archiver |
| archive | Dossier clos | Garder trace sans action active |

## 4. Priorites

| Priorite | Critere | Delai indicatif |
|---|---|---|
| urgente | Securite, danger, habitat indigne, risque immediat | Reponse rapide, idealement 24 h |
| haute | Collectivite, financeur, partenaire structurant, rendez-vous | Reponse sous 48 h ouvrables |
| normale | Demande generale, information, orientation | Reponse sous 5 jours ouvrables |

## 5. Categories operationnelles

| Categorie | Exemples | Suite logique |
|---|---|---|
| collectivite-territoire | commune, EPCI, diagnostic, territoire partenaire | proposer un rendez-vous de cadrage |
| bien-vacant-proprietaire | logement, immeuble, local, commerce, terrain, friche | demander adresse, photos, titre ou mandat, contraintes |
| materiaux-reemploi | bois, portes, fenetres, mobilier, stock, chantier | demander quantite, etat, localisation, delai, conditions de retrait |
| entreprise-partenariat | RSE, locaux, competences, stockage, transport | qualifier l'engagement possible et le cadre de convention |
| benevolat-insertion | benevole, association, chantier, insertion | orienter vers une mission ou un chantier encadre |
| financement-mecenat | fondation, mecene, investisseur, subvention | preparer une note d'opportunite et un budget |
| presse-institutionnel | journaliste, media, communication | transmettre kit media et contact officiel |
| demande-generale | autre demande | orienter vers la bonne categorie |

## 6. Reponse type courte

Bonjour,

Merci pour votre message et pour l'interet porte a Territoires Vivants France.

Votre demande a bien ete recue. Nous allons la qualifier afin d'identifier la suite la plus adaptee : demande de precisions, rendez-vous, orientation vers un parcours TVF ou classement si le sujet n'entre pas dans le cadre actuel.

Pour avancer, pouvez-vous nous transmettre les elements suivants :

- commune ou territoire concerne ;
- description precise de la situation ;
- photos ou documents utiles si disponibles ;
- delai souhaite ;
- interlocuteur a contacter.

Cordialement,

Territoires Vivants France
contact@territoiresvivantsfrance.fr
06 22 03 93 24

## 7. Regles de prudence

- Ne jamais promettre une aide financiere avant instruction.
- Ne jamais annoncer de partenaire non officialise.
- Ne jamais publier une donnee personnelle sans consentement.
- Ne jamais visiter un bien sans autorisation ecrite.
- Ne jamais accepter des materiaux sans qualification de securite, etat, quantite et retrait.
- Tracer les decisions importantes dans Supabase ou dans le registre interne.

## 8. Routine hebdomadaire

Chaque semaine :

1. Exporter ou consulter les nouvelles demandes.
2. Classer par statut, categorie et priorite.
3. Relancer les demandes en attente.
4. Creer les fiches projet pour les dossiers retenus.
5. Mettre a jour les indicateurs : demandes recues, demandes qualifiees, rendez-vous, dossiers acceptes, dossiers archives.

## 9. Utilisation du back-office

Acces : `admin-demandes.html`.

Routine conseillee :

1. Ouvrir le back-office avec le token admin.
2. Filtrer les demandes `nouveau`.
3. Lire chaque demande.
4. Verifier la categorie et la priorite.
5. Ajouter une note interne courte.
6. Passer le statut a `a_qualifier`, `en_cours`, `rendez_vous`, `refuse` ou `archive`.
7. Utiliser le modele de reponse adapte.
8. Repondre depuis la messagerie Gmail ou la messagerie officielle.
9. Exporter les demandes filtrees en CSV avant une reunion de suivi ou un bilan hebdomadaire.

## 10. Modeles de reponse disponibles dans le back-office

Le back-office contient des modeles prets a adapter :

- reponse collectivite ;
- reponse proprietaire ;
- reponse materiaux ;
- reponse entreprise ;
- reponse benevole / association ;
- reponse financeur / mecene ;
- reponse presse / institution ;
- demande de pieces complementaires ;
- proposition de rendez-vous ;
- reponse non compatible.

Ces modeles sont des bases de travail : ils doivent etre relus avant envoi et adaptes au contexte. Aucun engagement financier, technique ou partenarial ne doit etre formule sans validation interne.

## 11. Nettoyage des tests

Les demandes techniques dont l'objet commence par `[TEST` doivent etre passees en `archive` apres verification. Elles ne doivent pas etre supprimees si elles servent a documenter un controle de fonctionnement recent.

## 12. Export de suivi

Le bouton `Exporter CSV` du back-office exporte uniquement les demandes affichees avec les filtres actifs. Utilisations recommandees :

- preparation d'un point hebdomadaire ;
- transmission interne des demandes a qualifier ;
- suivi des demandes en attente ;
- archivage d'un etat de reception avant une reunion.

Le fichier CSV contient des donnees personnelles. Il doit rester interne, etre stocke dans un espace securise et etre supprime lorsqu'il n'est plus utile.
