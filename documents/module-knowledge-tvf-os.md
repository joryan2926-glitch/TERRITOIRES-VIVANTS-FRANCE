# Module Base de connaissances - TVF OS

Statut : pret pour validation production.

## Objectif

Le module Base de connaissances transforme l'activite TVF en memoire collective exploitable par les equipes et par les futures fonctions IA. Il centralise les articles internes, FAQ, retours d'experience, erreurs a eviter, decisions types, cas d'usage et sources citees.

## Perimetre fonctionnel

- Recherche dans les articles et FAQ.
- Creation, edition, validation et archivage d'articles.
- Gestion des sources citees.
- Retours d'experience a capitaliser.
- Transformation d'un retour d'experience en article a valider.
- Question assistee avec reponse sourcee depuis les articles valides.
- Indicateurs : articles valides, a valider, en revision, FAQ, retours a capitaliser.
- Export CSV.
- Acces securise par `TVF_ADMIN_TOKEN`.

## Backend et donnees

Fichier API : `api/admin-knowledge.js`.

Tables Supabase :

- `knowledge_articles` : articles, FAQ, cas, erreurs, decisions types et connaissances validees.
- `knowledge_sources` : sources citees et rattachements.
- `lessons_learned` : retours d'experience a capitaliser.
- `knowledge_questions` : historique des questions/reponses avec sources.

## Automatisations

- Cle d'article automatique.
- Date de revision automatique a 12 mois.
- Passage en revision si la date de revision est depassee.
- Synthese IA deterministe depuis contenu/resume.
- Reponse sourcee depuis les articles valides.
- Proposition d'article depuis un retour d'experience.

## RLS et securite

RLS est activee sur les 4 tables. Les politiques preparent les futurs roles Supabase Auth : `national_admin`, `branch_manager`, `case_manager`, `document_manager`, `procedure_manager`, `knowledge_manager`, `auditor`.

L'API production utilise la service role Supabase et reste protegee par `TVF_ADMIN_TOKEN`.

## Interface

Page : `admin-knowledge.html`.
Script : `admin-knowledge.js`.
Styles : `styles.css`.

Ecrans :

- connexion admin ;
- indicateurs connaissance ;
- question assistee ;
- vues Articles, FAQ, Retours, Erreurs, A valider, A capitaliser ;
- liste ;
- fiche article ;
- sources citees ;
- creation article ;
- retour d'experience ;
- capitalisation en article.

## Tests et verification

Tests locaux :

- `node tests/admin-knowledge-api.test.js`
- `node --check api/admin-knowledge.js`
- `node --check admin-knowledge.js`

Migration :

1. Appliquer `supabase/tvf-os-knowledge.sql`.
2. Executer `supabase/tvf-os-knowledge-verification.sql`.
3. Injecter si besoin `supabase/tvf-os-knowledge-test-data.sql`.
4. Verifier `/admin-knowledge` en production avec `TVF_ADMIN_TOKEN`.
5. Verifier `/api/admin-knowledge` sans token : attendu `401`.

## Limites volontaires

- La recherche semantique est preparee par recherche texte et scoring deterministe ; les embeddings/vector search seront branches dans le module Assistant IA global.
- La suggestion automatique apres cloture de dossier est preparee par `lessons_learned`, mais le declenchement automatique sera traite dans les workflows/automatisations avances.
