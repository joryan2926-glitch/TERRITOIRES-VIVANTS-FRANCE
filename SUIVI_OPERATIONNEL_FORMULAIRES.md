# Processus de traitement des demandes entrantes TVF

Ce document sert de mode d'emploi interne pour recevoir, qualifier, instruire et suivre les demandes recues par Territoires Vivants France.

## 1. Ou arrivent les demandes ?

Chaque formulaire envoye depuis le site suit trois chemins :

1. Enregistrement dans Supabase, table `contacts`.
2. Notification interne envoyee a l'adresse configuree dans Vercel (`TVF_NOTIFICATION_EMAIL`).
3. Accuse de reception envoye automatiquement au demandeur si son e-mail est renseigne.

Adresse officielle de reception : `contact@territoiresvivantsfrance.fr`.

## 2. Sources de reception

| Source | Module TVF OS | Suite attendue |
|---|---|---|
| Formulaire public | `Demandes` | Qualifier, prioriser, repondre ou transformer en dossier |
| TVF Mobile | `Demandes` puis `Dossiers` | Importer la demande, creer le dossier et rattacher la photo terrain |
| E-mail entrant | `Boite mail` / `Demandes` | Classer le motif, rattacher au contact ou au dossier |
| Appel / WhatsApp | `Demandes` | Creer une demande manuelle avec les coordonnees et le motif |
| Rendez-vous | `Dossiers` / `Taches` | Creer une action de suivi et ajouter les documents utiles |

## 3. Lecture d'une demande

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
- pieces ou photos deja transmises ;
- base legale ou accord de contact lorsque des donnees personnelles sont traitees.

## 4. Statuts internes recommandes

| Statut | Quand l'utiliser | Action attendue |
|---|---|---|
| nouveau | Demande recue, pas encore lue | Lire et qualifier sous 48 h ouvrables |
| a_qualifier | Informations insuffisantes | Demander les pieces manquantes |
| en_cours | Dossier en instruction | Suivre les echanges et prochaines etapes |
| rendez_vous | Rendez-vous propose ou confirme | Preparer ordre du jour et pieces utiles |
| en_attente | Attente d'une reponse externe | Relancer a date fixe |
| accepte | Demande retenue pour suite | Creer ou ouvrir un dossier d'instruction |
| refuse | Demande non compatible | Repondre clairement et archiver |
| archive | Dossier clos | Garder trace sans action active |

## 5. Priorites

| Priorite | Critere | Delai indicatif |
|---|---|---|
| urgente | Securite, danger, habitat indigne, risque immediat | Reponse rapide, idealement 24 h |
| haute | Collectivite, financeur, partenaire structurant, rendez-vous | Reponse sous 48 h ouvrables |
| normale | Demande generale, information, orientation | Reponse sous 5 jours ouvrables |

## 6. Categories operationnelles

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

## 7. Parcours TVF Mobile vers TVF OS

Quand une demande arrive depuis TVF Mobile :

1. Ouvrir `Demandes`.
2. Reperer le bloc `TVF Mobile`.
3. Cliquer sur `Importer + dossier`.
4. Verifier que la demande apparait dans la liste.
5. Ouvrir la fiche demande et controler le bloc `Origine TVF Mobile`.
6. Cliquer sur `Voir le dossier` lorsque le dossier a ete cree automatiquement.
7. Verifier dans `Documents` que la photo terrain est referencee si une photo a ete transmise.
8. Completer l'instruction : categorie, pieces manquantes, tache, prochaine action, statut.

Ce parcours evite la ressaisie : les coordonnees, l'adresse, le motif, la photo et la reference mobile doivent etre conserves dans le dossier.

## 8. Transformation en dossier d'instruction

Une demande devient un dossier lorsque TVF doit suivre une action dans le temps : visite, diagnostic, convention, collecte de materiaux, rendez-vous partenaire, demande de financement ou suivi territorial.

Avant de transformer :

- verifier que l'identite du demandeur est suffisante ;
- verifier le motif exact ;
- attribuer une categorie ;
- choisir une priorite ;
- noter les pieces manquantes ;
- definir la prochaine action ;
- rattacher les documents disponibles.

## 9. Documents et pieces utiles

| Sujet | Pieces utiles au demarrage |
|---|---|
| Bien vacant | adresse, photos, description, situation de propriete, contraintes connues |
| Materiaux | photos, quantite, etat, lieu de stockage, delai, conditions d'enlevement |
| Collectivite | besoin public, perimetre, service referent, calendrier, documents territoriaux |
| Entreprise | type de contribution, stock ou ressource, interlocuteur, contraintes logistiques |
| Benevolat | disponibilites, competences, mobilite, type de mission souhaite |
| Financement | type de soutien, criteres, calendrier, montant ou enveloppe si connu |

## 10. Reponse type courte

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
04 65 81 54 69

## 11. Modeles de reponse disponibles dans le back-office

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

## 12. Regles de prudence

- Ne jamais promettre une aide financiere avant instruction.
- Ne jamais annoncer de partenaire non officialise.
- Ne jamais publier une donnee personnelle sans cadre legal ou accord valable.
- Ne jamais visiter un bien sans autorisation ecrite.
- Ne jamais accepter des materiaux sans qualification de securite, etat, quantite et retrait.
- Tracer les decisions importantes dans Supabase ou dans le registre interne.

## 13. Routine hebdomadaire

Chaque semaine :

1. Consulter les nouvelles demandes.
2. Classer par statut, categorie et priorite.
3. Relancer les demandes en attente.
4. Creer ou completer les dossiers retenus.
5. Mettre a jour les documents et les taches.
6. Exporter les demandes filtrees si un point de suivi est prevu.
7. Mettre a jour les indicateurs : demandes recues, demandes qualifiees, rendez-vous, dossiers acceptes, dossiers archives.

## 14. Export de suivi

Le bouton `Exporter CSV` du back-office exporte uniquement les demandes affichees avec les filtres actifs.

Utilisations recommandees :

- preparation d'un point hebdomadaire ;
- transmission interne des demandes a qualifier ;
- suivi des demandes en attente ;
- archivage d'un etat de reception avant une reunion.

Le fichier CSV contient des donnees personnelles. Il doit rester interne, etre stocke dans un espace securise et etre supprime lorsqu'il n'est plus utile.

## 15. Nettoyage des tests

Les demandes techniques dont l'objet commence par `[TEST` doivent etre passees en `archive` apres verification. Elles ne doivent pas etre supprimees si elles servent a documenter un controle de fonctionnement recent.

## 16. Outils operationnels disponibles

| Document | Usage |
|---|---|
| `documents/procedure-traitement-formulaires-tvf.md` | Procedure complete pour recevoir, qualifier, prioriser et archiver les demandes |
| `documents/modeles-reponses-email-formulaires-tvf.md` | Modeles d'e-mails prets a adapter selon le profil du demandeur |
| `documents/tableau-suivi-demandes-operationnelles.md` | Tableau de pilotage manuel pour suivre les dossiers et les relances |
| `documents/checklist-brevo-dns-rgpd-formulaires.md` | Points de controle e-mail, DNS, Brevo, delivrabilite et donnees personnelles |
| `documents/plan-nettoyage-tests-supabase.md` | Methode prudente pour identifier et nettoyer les donnees de test |
| documents/procedure-reporting-mensuel-tvf-os.md | Procedure de reporting mensuel pour exporter, analyser et presenter les demandes, dossiers, documents et relances |
| documents/modele-synthese-mensuelle-tvf-os.md | Modele de synthese mensuelle pret a remplir apres les exports TVF OS |

## 17. Recette avant usage reel

1. Tester chaque formulaire avec une vraie adresse e-mail externe.
2. Verifier que l'e-mail interne arrive sur `contact@territoiresvivantsfrance.fr`.
3. Verifier que l'accuse de reception arrive chez le demandeur.
4. Tester une demande TVF Mobile avec photo.
5. Importer la demande mobile dans TVF OS.
6. Verifier la creation du dossier et le rattachement document/photo.
7. Reporter chaque test dans le tableau de suivi.
8. Archiver les tests dans Supabase avant les premiers usages publics.
9. Verifier DKIM et DMARC pour ameliorer la delivrabilite.
10. Utiliser les modeles de reponse pour traiter les premieres demandes reelles.

## 18. Recette operationnelle rapide

Avant d'utiliser TVF OS sur des demandes reelles, effectuer ce parcours complet :

| Etape | Module | Resultat attendu |
|---|---|---|
| 1 | Site public ou TVF Mobile | Une demande est creee avec coordonnees, motif et territoire. |
| 2 | Demandes | La demande apparait dans la liste, avec source, categorie et priorite. |
| 3 | Demandes | La demande peut etre transformee en dossier d'instruction. |
| 4 | Dossiers | Le numero de dossier, le statut, la priorite et le contact sont conserves. |
| 5 | Documents | Les pieces utiles sont rattachees ou identifiees comme manquantes. |
| 6 | E-mails | Une reponse peut etre preparee, copiee ou ouverte dans la messagerie. |
| 7 | Journal | Les actions importantes restent tracables. |
| 8 | Archivage | Les tests sont classes ou supprimes uniquement apres verification. |

Regle interne : aucune demande ne doit etre presentee comme acceptee tant que le dossier, les pieces, le cadre de responsabilite et la prochaine action ne sont pas renseignes.