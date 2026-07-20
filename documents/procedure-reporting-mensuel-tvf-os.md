# Procedure de reporting mensuel TVF OS

Ce document sert a produire un point mensuel fiable a partir de TVF OS. Il est destine au pilotage interne de Territoires Vivants France et a la preparation de rendez-vous avec une collectivite, une entreprise, une fondation, un financeur ou un partenaire institutionnel.

## 1. Objectif du reporting

Le reporting mensuel doit repondre a cinq questions simples :

1. Combien de demandes ont ete recues ?
2. Quelles demandes sont devenues des dossiers d'instruction ?
3. Quels sujets reviennent le plus souvent ?
4. Quels blocages ralentissent l'action ?
5. Quelles suites doivent etre decidees le mois suivant ?

Le reporting ne doit jamais transformer des objectifs en resultats. Les indicateurs doivent rester factuels, sourcables et rattaches a des donnees presentes dans TVF OS.

## 2. Perimetre a extraire

| Bloc | Module TVF OS | Donnees attendues |
|---|---|---|
| Demandes recues | Demandes | numero, date, source, profil, categorie, commune, statut, priorite |
| Contacts | CRM | personne, structure, type d'acteur, coordonnees, rattachement dossier |
| Dossiers | Dossiers | numero, categorie, statut, responsable, prochaine action, echeance |
| Documents | Documents | pieces recues, pieces manquantes, conventions, courriers, modeles utilises |
| E-mails | Boite mail | messages a traiter, brouillons, conversions en demandes, relances |
| Taches | Taches | actions ouvertes, retard, rendez-vous, visites, relances |
| Journal | Activite | decisions, validations, changements de statut, actions sensibles |

## 3. Nommage des exports

Utiliser toujours le meme format :

`TVF-OS-reporting-AAAA-MM-[module].csv`

Exemples :

- `TVF-OS-reporting-2026-07-demandes.csv`
- `TVF-OS-reporting-2026-07-dossiers.csv`
- `TVF-OS-reporting-2026-07-documents.csv`
- `TVF-OS-reporting-2026-07-synthese.md`

## 4. Controle avant export

Avant chaque export, verifier :

- les filtres actifs dans le module ;
- la periode du mois traite ;
- les demandes de test a exclure ou archiver ;
- les doublons evidents ;
- les demandes sans categorie ;
- les dossiers sans prochaine action ;
- les documents non rattaches ;
- les e-mails convertis en demande mais non traites.

## 5. Tableau de synthese mensuelle

| Indicateur | Valeur | Source TVF OS | Commentaire |
|---|---:|---|---|
| Demandes recues |  | Demandes | Ne compter que les demandes du mois |
| Demandes qualifiees |  | Demandes | Demandes avec categorie, priorite et prochaine action |
| Dossiers crees |  | Dossiers | Dossiers ouverts depuis une demande ou creation manuelle |
| Dossiers actifs |  | Dossiers | Statuts non archives |
| Dossiers en attente de pieces |  | Dossiers / Documents | A relancer |
| Rendez-vous ou visites a programmer |  | Taches | A planifier |
| E-mails a traiter |  | Boite mail | Messages non clos |
| Documents rattaches |  | Documents | Pieces, photos, courriers, conventions |
| Decisions tracees |  | Journal | Validations, refus, classements |

## 6. Lecture qualitative

Le reporting ne doit pas etre seulement un tableau. Ajouter une analyse courte :

- sujets les plus frequents ;
- besoins recurrrents des demandeurs ;
- territoires ou communes les plus cites ;
- points de blocage administratifs ou techniques ;
- ressources manquantes ;
- opportunites a prioriser ;
- decisions a prendre ;
- risques a surveiller.

## 7. Modele de synthese a transmettre

Titre : `Point mensuel TVF OS - [mois annee]`

Structure conseillee :

1. Resume en cinq lignes.
2. Donnees principales du mois.
3. Demandes nouvelles.
4. Dossiers ouverts ou suivis.
5. Documents et pieces manquantes.
6. E-mails et relances.
7. Blocages et arbitrages.
8. Decisions demandees.
9. Priorites du mois suivant.

## 8. Regles de prudence

- Ne pas diffuser un export brut contenant des donnees personnelles hors cadre interne.
- Ne pas publier de noms, adresses, photos ou documents sans base legale ou accord valable.
- Ne pas presenter un dossier comme valide si le statut TVF OS ne le confirme pas.
- Ne pas annoncer de partenaire, financeur ou resultat non officialise.
- Ne pas confondre une demande recue avec un projet accepte.

## 9. Routine mensuelle recommandee

| Moment | Action | Sortie attendue |
|---|---|---|
| J+1 a J+3 | Nettoyer les demandes de test et les doublons | Liste propre des demandes du mois |
| J+3 a J+5 | Qualifier les demandes sans categorie | Demandes exploitables |
| J+5 a J+7 | Exporter demandes, dossiers, documents et e-mails | Fichiers CSV internes |
| J+7 a J+10 | Rediger la synthese mensuelle | Note de pilotage |
| J+10 a J+15 | Arbitrer les priorites | Plan d'action du mois suivant |

## 10. Resultat attendu

A la fin du mois, TVF doit disposer :

- d'une liste claire des demandes recues ;
- d'une liste des dossiers actifs ;
- d'une liste des dossiers en attente ;
- d'une liste des pieces manquantes ;
- d'un suivi des reponses et relances ;
- d'un journal des decisions importantes ;
- d'une synthese courte exploitable en reunion.

Ce reporting permet de passer d'une reception de demandes a un pilotage operationnel lisible, tracable et presentable.
