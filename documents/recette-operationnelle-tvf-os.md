# Recette opérationnelle TVF OS

Document interne pour tester le fonctionnement réel de TVF OS avant usage terrain. La recette doit être réalisée avec une demande volontairement créée pour le test, puis supprimée ou archivée après validation.

## Objectif

Vérifier que TVF peut traiter une demande de bout en bout : réception, qualification, création d'un contact, création d'un dossier, ajout de documents, instruction, réponse et suivi.

## Règle de travail

- Ne pas utiliser de données personnelles réelles sans accord.
- Identifier clairement toute demande de test.
- Ne pas supprimer une vraie demande reçue.
- Ne pas partager le token admin.
- Ne pas coller de clé Supabase dans une page publique.

## Scénario 1 - Demande depuis le site

| Étape | Action | Résultat attendu | Statut |
|---|---|---|---|
| 1 | Ouvrir une page publique avec formulaire | Le formulaire est visible et lisible | À tester |
| 2 | Envoyer une demande test | Message de confirmation affiché | À tester |
| 3 | Vérifier Supabase | Une ligne existe dans la table des demandes | À tester |
| 4 | Vérifier e-mail TVF | Notification reçue à l'adresse officielle | À tester |
| 5 | Vérifier e-mail usager | Accusé de réception reçu | À tester |
| 6 | Ouvrir TVF OS | Accès par code admin uniquement | À tester |
| 7 | Ouvrir Demandes reçues | La demande apparaît | À tester |
| 8 | Qualifier la demande | Catégorie, priorité et statut renseignés | À tester |
| 9 | Rattacher un contact | Fiche contact créée ou liée | À tester |
| 10 | Transformer en dossier | Numéro de dossier généré | À tester |
| 11 | Ajouter une pièce | Document visible dans le dossier | À tester |
| 12 | Ajouter une instruction | Étape et commentaire enregistrés | À tester |
| 13 | Préparer une réponse | Réponse prête depuis TVF OS ou messagerie | À tester |
| 14 | Clôturer ou archiver le test | Le dossier n'apparaît plus comme demande active | À tester |

## Scénario 2 - Demande depuis TVF Mobile

| Étape | Action | Résultat attendu | Statut |
|---|---|---|---|
| 1 | Ouvrir TVF Mobile | Application accessible | À tester |
| 2 | Créer un signalement test | Formulaire mobile envoyé | À tester |
| 3 | Vérifier Supabase | Ligne créée dans la table mobile | À tester |
| 4 | Vérifier TVF OS | Demande visible ou rattachable | À tester |
| 5 | Qualifier la demande | Statut et catégorie cohérents | À tester |
| 6 | Transformer en dossier | Dossier créé avec source mobile | À tester |

## Scénario 3 - Demande reçue par e-mail

| Étape | Action | Résultat attendu | Statut |
|---|---|---|---|
| 1 | Recevoir un e-mail externe | E-mail présent dans la boîte officielle | À tester |
| 2 | Créer manuellement une demande | Demande créée dans TVF OS | À tester |
| 3 | Créer ou rattacher un contact | Coordonnées centralisées | À tester |
| 4 | Ajouter les pièces jointes | Documents ajoutés au dossier | À tester |
| 5 | Lancer l'instruction | Étape de suivi créée | À tester |
| 6 | Répondre à l'interlocuteur | Réponse tracée dans le dossier | À tester |

## Critères de validation

TVF OS est considéré exploitable lorsque :

- une demande site arrive correctement ;
- une demande mobile arrive correctement ;
- une demande e-mail peut être créée manuellement ;
- chaque demande peut devenir un dossier ;
- un dossier peut contenir un contact, une catégorie, un statut, des notes, des pièces et une prochaine action ;
- les documents internes sont accessibles depuis le module Documents ;
- l'utilisateur ne se perd pas entre les modules ;
- aucun message technique inutile ne gêne l'usage.

## Compte rendu de recette

| Date | Testeur | Parcours testé | Résultat | Anomalie | Correction attendue |
|---|---|---|---|---|---|
| | | Site vers TVF OS | | | |
| | | Mobile vers TVF OS | | | |
| | | E-mail vers TVF OS | | | |
| | | Documents | | | |
| | | Réponse interlocuteur | | | |