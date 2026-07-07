# Module Gestion documentaire - TVF OS

Statut : pret pour validation production.

## Objectif

Le module Gestion documentaire centralise les pieces, preuves, documents internes et modeles officiels TVF. Il permet de deposer, classer, proteger, versionner, valider et retrouver les documents necessaires aux dossiers, demandes, contacts, organisations et futures antennes.

## Perimetre fonctionnel

- Bibliotheque des documents avec recherche et filtres.
- Depot de fichier dans Supabase Storage prive.
- Creation d'un document sans fichier pour brouillon ou generation depuis modele.
- Fiche document editable : titre, type, statut, rattachement, confidentialite, expiration, resume et notes de classement.
- Detection deterministe des documents sensibles.
- Assistant documentaire : classement propose, champs manquants, confidentialite proposee, indexation connaissance possible.
- Validation humaine : brouillon, a classer, a valider, valide, remplace, archive.
- Telechargement securise via API avec `TVF_ADMIN_TOKEN`.
- Bibliotheque de modeles : categories, champs requis, statut officiel, validation nationale.
- Generation d'un brouillon depuis modele avec controle des champs manquants.
- Journal d'audit documentaire.
- Export CSV.

## Backend et donnees

Fichier API : `api/admin-documents.js`.

Tables Supabase :

- `files` : metadonnees des fichiers stockes dans le bucket prive `tvf-documents`.
- `documents` : objet documentaire metier avec numero, statut, version, rattachement, confidentialite et synthese IA.
- `document_versions` : historique des versions d'un document.
- `document_links` : rattachement d'un document a plusieurs objets metier.
- `templates` : bibliotheque des modeles officiels et locaux.
- `generated_documents` : documents produits depuis un modele.
- `document_audit_logs` : journal des changements et actions.

Bucket Supabase Storage :

- `tvf-documents` ;
- prive ;
- limite 10 Mo ;
- types autorises : PDF, images, texte, CSV, Word, Excel, PowerPoint.

## Automatisations

- Numerotation automatique `DOC-YYYY-0001`.
- Detection de sensibilite sur titre, nom de fichier et resume.
- Rehausse automatique de confidentialite vers `sensible` si necessaire.
- Generation d'une premiere version si un fichier est rattache.
- Journalisation des changements de statut.
- Indexation connaissance preparee pour les documents valides non sensibles.
- Validation nationale automatique quand un modele passe au statut `officiel`.

## RLS et securite

RLS est activee sur les 7 tables publiques et des politiques sont creees pour les futurs roles Supabase Auth :

- lecture : `national_admin`, `branch_manager`, `case_manager`, `document_manager`, `request_manager`, `crm_manager`, `auditor` selon les tables ;
- ecriture : `national_admin`, `branch_manager`, `document_manager`, `case_manager` selon les tables ;
- modeles officiels : ecriture reservee a `national_admin` et `document_manager` ;
- Storage : politiques de lecture/ecriture sur le bucket `tvf-documents`.

L'API production utilise la service role Supabase et reste protegee par `TVF_ADMIN_TOKEN`.

## Interface

Page : `admin-documents.html`.
Script : `admin-documents.js`.
Styles : `styles.css`.

Ecrans :

- connexion admin ;
- indicateurs documentaires ;
- vues Documents, A classer, A valider, Valides, Modeles, Archives ;
- filtres par type, confidentialite, rattachement et recherche ;
- liste documents/modeles ;
- fiche document ;
- assistant documentaire ;
- depot document ;
- fiche modele ;
- creation modele ;
- generation de brouillon ;
- telechargement securise.

## Tests et verification

Tests locaux :

- `node tests/admin-documents-api.test.js`
- `node --check api/admin-documents.js`
- `node --check admin-documents.js`

Migration :

1. Appliquer `supabase/tvf-os-documents.sql`.
2. Executer `supabase/tvf-os-documents-verification.sql`.
3. Injecter si besoin `supabase/tvf-os-documents-test-data.sql`.
4. Verifier `/admin-documents` en production avec `TVF_ADMIN_TOKEN`.
5. Verifier `/api/admin-documents` sans token : attendu `401`.
6. Deposer un document de test, creer un modele, generer un brouillon et exporter CSV.

## Limites volontaires

- Le scan antivirus est prepare par statut, mais le moteur externe n'est pas encore branche.
- L'OCR, la comparaison visuelle de versions et l'edition collaborative seront traites dans des phases ulterieures.
- L'indexation reelle dans la Base de connaissances sera activee quand ce module sera ouvert.
