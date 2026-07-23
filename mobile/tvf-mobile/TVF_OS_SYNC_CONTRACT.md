# Contrat de liaison TVF Mobile vers TVF OS

Document interne pour verrouiller ce que TVF Mobile transmet a TVF OS et comment verifier que les demandes terrain deviennent exploitables.

## Objectif

TVF Mobile ne doit pas seulement enregistrer une demande sur le telephone. Chaque demande utile doit pouvoir etre retrouvee, qualifiee et transformee en dossier dans TVF OS.

## Flux couverts

| Flux mobile | Usage terrain | Destination TVF OS | Priorite initiale |
|---|---|---|---|
| signal | Signaler un logement, commerce, batiment, friche ou depot | Demandes recues | Normale |
| materials | Proposer des materiaux ou equipements | Materiotheque / demandes recues | Normale |
| property | Proposer un bien vacant ou inutilise | Dossiers en pre-etude | Haute |
| volunteer | Proposer une aide benevole | CRM contacts | Basse |

## Table de reception

La table de reception attendue est `mobile_requests`.

Champs minimum attendus :

| Champ | Role |
|---|---|
| `reference` | Numero local TVF conserve par l'utilisateur |
| `flow` | Type de parcours mobile |
| `category` | Categorie choisie dans l'application |
| `status` | Statut initial, par defaut `received_mobile` |
| `raw_address` | Adresse ou repere saisi |
| `latitude` / `longitude` | Coordonnees GPS si disponibles |
| `photo_bucket` / `photo_path` | Premiere photo stockee si disponible |
| `contact_name` | Nom de l'interlocuteur si renseigne |
| `contact_email` | E-mail si renseigne |
| `contact_phone` | Telephone si renseigne |
| `payload` | Donnees completes pour TVF OS |

## Table photos

La table complementaire `mobile_request_photos` peut etre utilisee pour tracer plusieurs photos liees a une meme demande mobile lorsque le suivi detaille des medias est active cote Supabase.

## Photos et stockage

| Flux | Bucket attendu |
|---|---|
| Proposition de materiaux | `materiaux` |
| Autres demandes terrain | `signalements` |

Les photos ne valent pas acceptation d'un dossier. Elles servent uniquement a qualifier la demande et a faciliter la premiere analyse.

## Regle de qualification

Une demande mobile doit etre examinee dans TVF OS avant toute suite :

1. verifier la categorie ;
2. verifier l'adresse ou les coordonnees ;
3. verifier les photos ;
4. verifier les coordonnees ;
5. qualifier la priorite ;
6. rattacher a un contact ;
7. transformer en dossier si le sujet justifie une instruction.

## Go / No-Go

| Controle | Go |
|---|---|
| Envoi mobile | Une ligne apparait dans `mobile_requests` |
| Photos | Les chemins de stockage sont renseignes quand une photo est envoyee |
| TVF OS | La demande est visible ou rattachable dans le module demandes |
| Contact | Les coordonnees sont exploitables si une reponse est necessaire |
| Dossier | Une demande qualifiee peut devenir un dossier |
| Historique local | L'utilisateur conserve une reference sur son telephone |

## Tests a realiser

- envoyer un signalement avec adresse et photo ;
- envoyer une proposition de materiaux avec quantite et etat ;
- envoyer une proposition de bien avec objectif ;
- envoyer une candidature benevole ;
- verifier les lignes Supabase ;
- verifier la lecture dans TVF OS ;
- verifier le renvoi en cas d'echec reseau.