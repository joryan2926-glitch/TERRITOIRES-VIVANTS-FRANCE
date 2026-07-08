# Module Procedures - TVF OS

Statut : pret pour validation production.

## Objectif

Le module Procedures garantit que chaque antenne TVF applique les memes circuits, les memes controles et les memes validations. Il rend les methodes TVF directement utilisables dans les dossiers, avec des checklists actives et un assistant question-reponse.

## Perimetre fonctionnel

- Repertoire des procedures nationales, locales, par pole ou par module.
- Creation et modification d'une procedure.
- Gestion des niveaux : obligatoire, recommande, optionnel, experimental.
- Statuts : brouillon, active, en revision, remplacee, archivee.
- Checklist modele par procedure.
- Application d'une procedure a un dossier ou objet metier.
- Checklist active avec progression, blocage et completion automatique.
- Historique de version initial.
- Assistant procedure deterministe : champs manquants, revision, procedure conseillee, premiere action.
- Question-reponse sur les procedures.
- Export CSV.

## Backend et donnees

Fichier API : `api/admin-procedures.js`.

Tables Supabase :

- `procedures` : fiche procedure, perimetre, statut, version, niveau, responsable, revision, resume et tags.
- `procedure_steps` : etapes modele de la checklist.
- `procedure_versions` : historique de versions.
- `procedure_applications` : procedure appliquee a un dossier, une demande, une organisation ou un autre objet.
- `procedure_step_instances` : checklist active issue des etapes modele.
- `procedure_questions` : questions et reponses de l'assistant procedures.

## Automatisations

- Generation automatique de cle procedure si absente.
- Date de revision automatique selon le niveau obligatoire/recommande.
- Version initiale tracee a la creation.
- Creation automatique des etapes actives lors de l'application d'une procedure.
- Recalcul automatique de la completion.
- Passage automatique en `bloquee` si une etape est bloquee.
- Passage automatique en `terminee` si les etapes requises sont terminees ou non applicables.

## RLS et securite

RLS est activee sur les 6 tables du module. Les politiques preparent les futurs roles Supabase Auth :

- lecture : `national_admin`, `branch_manager`, `case_manager`, `procedure_manager`, `document_manager`, `auditor` ;
- gestion des procedures et etapes modele : `national_admin`, `procedure_manager` ;
- application et checklists actives : `national_admin`, `branch_manager`, `case_manager`, `procedure_manager`.

L'API production utilise la service role Supabase et reste protegee par `TVF_ADMIN_TOKEN`.

## Interface

Page : `admin-procedures.html`.
Script : `admin-procedures.js`.
Styles : `styles.css`.

Ecrans :

- connexion admin ;
- indicateurs procedures ;
- vues Procedures, Obligatoires, En revision, Checklists actives, Archives ;
- recherche et filtres ;
- fiche procedure ;
- assistant procedure ;
- checklist modele ;
- historique versions ;
- checklist active ;
- creation procedure ;
- question rapide IA.

## Tests et verification

Tests locaux :

- `node tests/admin-procedures-api.test.js`
- `node --check api/admin-procedures.js`
- `node --check admin-procedures.js`

Migration :

1. Appliquer `supabase/tvf-os-procedures.sql`.
2. Executer `supabase/tvf-os-procedures-verification.sql`.
3. Injecter si besoin `supabase/tvf-os-procedures-test-data.sql`.
4. Verifier `/admin-procedures` en production avec `TVF_ADMIN_TOKEN`.
5. Verifier `/api/admin-procedures` sans token : attendu `401`.
6. Creer une procedure, ajouter une etape, appliquer la procedure, changer une etape de checklist et exporter CSV.

## Limites volontaires

- La Base de connaissances n'est pas encore ouverte : les questions/reponses sont journalisees mais non indexees semantiquement.
- L'IA est deterministe locale au module ; le modele IA global sera branche lors du module Assistant IA.
- Les variantes locales avancees par antenne seront approfondies avec le module Gestion des antennes.
