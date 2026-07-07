# Module Dossiers - TVF OS

Statut : pret pour validation production.

## Objectif

Le module Dossiers transforme une demande, un contact CRM ou une initiative interne en dossier metier suivi jusqu'a decision ou cloture. Il centralise l'instruction, les pieces attendues, les risques, les decisions humaines, les prochaines actions et l'historique.

## Perimetre fonctionnel

- Liste des dossiers avec filtres par statut, type, priorite et recherche libre.
- Creation d'un dossier depuis le back-office.
- Fiche dossier editable : titre, type, statut, priorite, pole, responsable, territoire, risque, echeance, resume et synthese decision.
- Checklist dynamique generee automatiquement selon le type de dossier.
- Score de maturite calcule depuis la checklist.
- Assistant IA deterministe : synthese, pieces manquantes, blocage, statut propose et prochaine decision.
- Gestion des risques rattaches au dossier.
- Traçabilite des decisions humaines.
- Timeline des changements de statut.
- Export CSV des dossiers affiches.
- Acces securise par `TVF_ADMIN_TOKEN`.

## Backend et donnees

Fichier API : `api/admin-cases.js`.

Tables Supabase :

- `cases` : fiche principale, numerotation, statut, pole, maturite, priorite, confidentialite, prochaine action, decision et synthese IA.
- `case_participants` : contacts, organisations ou intervenants externes rattaches au dossier.
- `case_checklist_items` : checklist d'instruction par dossier.
- `case_status_history` : historique des changements de statut.
- `case_risks` : risques et mesures de maitrise.
- `case_decisions` : decisions proposees, validees, refusees ou ajournees.

Automatisations Supabase :

- generation automatique du numero `DOS-YYYY-0001` ;
- attribution automatique du pole principal selon le type de dossier ;
- generation de checklist standard et de checklist specialisee ;
- recalcul automatique du score de maturite ;
- generation d'une prochaine action et d'une echeance par defaut.

## RLS et securite

La migration active RLS sur les 6 tables du module. Les politiques preparent les roles Supabase Auth futurs :

- lecture : `national_admin`, `branch_manager`, `case_manager`, `request_manager`, `crm_manager`, `auditor` selon les tables ;
- ecriture : `national_admin`, `branch_manager`, `case_manager` ;
- l'API production utilise la service role Supabase et reste protegee par `TVF_ADMIN_TOKEN`.

## Interface

Page : `admin-dossiers.html`.
Script : `admin-dossiers.js`.
Styles : `styles.css`.

Ecrans :

- connexion admin ;
- indicateurs dossiers ;
- vues par statut ;
- liste dossier ;
- fiche detail ;
- assistant dossier ;
- checklist ;
- risques ;
- decisions ;
- timeline ;
- creation dossier.

## Tests et verification

Tests locaux :

- `node tests/admin-cases-api.test.js`
- `node --check api/admin-cases.js`
- `node --check admin-dossiers.js`

Migration :

1. Appliquer `supabase/tvf-os-dossiers.sql`.
2. Executer `supabase/tvf-os-dossiers-verification.sql`.
3. Injecter si besoin `supabase/tvf-os-dossiers-test-data.sql`.
4. Verifier `/admin-dossiers` en production avec `TVF_ADMIN_TOKEN`.
5. Verifier `/api/admin-cases` sans token : attendu `401`.
6. Creer ou ouvrir le dossier `TEST-DOSSIERS-001` et verifier checklist, maturite, risque, decision et export CSV.

## Limites volontaires

- Les documents, taches, agenda et e-mails automatiques restent hors perimetre tant que leurs modules ne sont pas ouverts.
- L'IA est implementee en assistant deterministe local au module. Le branchement modele IA externe sera traite au moment du module Assistant IA global.
