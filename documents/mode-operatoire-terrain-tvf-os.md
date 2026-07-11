# Mode operatoire terrain TVF OS

Date de mise a jour : 2026-07-11

## Objectif

Ce document sert de procedure interne pour verifier que TVF OS est utilisable comme ERP/CRM simple avant une utilisation quotidienne. Il ne remplace pas les tests utilisateurs reels, mais fixe le parcours minimum a valider.

## Parcours de reference

| Etape | Module | Action a realiser | Preuve attendue |
|---|---|---|---|
| 1 | Demandes | Recevoir ou creer une demande test | Demande visible avec statut et categorie |
| 2 | Contacts | Completer le contact ou l'organisation | Fiche interlocuteur renseignee |
| 3 | Dossiers | Creer ou rattacher un dossier | Dossier avec type, responsable et prochaine action |
| 4 | Taches | Planifier une relance, visite ou action | Tache visible avec echeance |
| 5 | Documents | Rattacher une piece, courrier ou modele | Document classe avec lien au dossier |
| 6 | Resultats | Renseigner un indicateur ou une preuve | Element d'impact ou de reporting conserve |
| 7 | Journal | Verifier la trace des actions | Evenement visible dans le journal |

## Tests a faire avant ouverture quotidienne

- Tester une demande issue du formulaire public.
- Tester une demande creee manuellement depuis TVF OS.
- Tester la creation d'un contact particulier.
- Tester la creation d'une organisation : collectivite, entreprise, financeur ou association.
- Tester la creation d'un dossier depuis une demande.
- Tester la creation d'une tache depuis une demande ou un dossier.
- Tester l'ajout d'un document et son export.
- Tester l'export CSV des demandes, contacts, dossiers, taches et documents.
- Tester la session unique sur ordinateur et mobile.
- Tester au moins deux profils administrateurs avant ouverture a plusieurs utilisateurs.

## Regles d'usage interne

| Situation | Regle TVF OS |
|---|---|
| Nouvelle sollicitation | Toujours creer ou verifier une demande avant toute action. |
| Interlocuteur recurrent | Rattacher la demande a une fiche contact ou organisation. |
| Demande exploitable | Ouvrir un dossier avec responsable, statut et prochaine action. |
| Piece manquante | Creer une tache de relance et noter la piece attendue. |
| Engagement externe | Conserver une trace dans Documents et Journal. |
| Resultat terrain | Ajouter une preuve ou un indicateur dans Resultats. |

## Points de controle hebdomadaires

- Demandes sans responsable.
- Dossiers en retard.
- Taches non traitees.
- Documents manquants.
- Decisions non tracees.
- Exports utiles pour le suivi.

## Limites a lever progressivement

- Brancher les e-mails entrants reels dans une procedure de tri stable.
- Valider les roles avec de vrais utilisateurs.
- Tester les temps de reponse en production avec des donnees plus nombreuses.
- Finaliser les modeles documentaires internes selon les besoins administratifs definitifs.
