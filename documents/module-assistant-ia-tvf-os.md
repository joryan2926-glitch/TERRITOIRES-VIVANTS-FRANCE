# Module Assistant IA global - TVF OS

Statut : developpement initial termine, validation locale automatisee requise avant migration production.

## Objectif

Le module Assistant IA global devient le copilote operationnel transversal de TVF OS. Il ne decide pas a la place des responsables : il lit le contexte autorise, recherche les sources internes, propose une orientation, explique son raisonnement, cite les sources et attend une validation humaine.

## Perimetre livre

- Interface admin `admin-ai.html` protegee par `TVF_ADMIN_TOKEN`.
- API serverless `api/admin-ai.js`.
- Tables Supabase `ai_interactions`, `ai_suggestions`, `ai_feedback`, `ai_automation_rules`, `ai_automation_runs`.
- Politiques RLS pour lecture, gestion et audit selon roles TVF futurs.
- Recherche contextuelle dans les modules deja ouverts : Base de connaissances, Procedures, Documents, Dossiers.
- Conversation sourcee avec journalisation.
- Analyse MVP d'un e-mail entrant : categorie, pole, priorite, pieces manquantes, brouillon de reponse, taches.
- Suggestions actionnables avec statuts : proposee, acceptee, modifiee, refusee, ignoree, appliquee.
- Feedback IA pour apprentissage progressif.
- Regles d'automatisation preparees avec validation humaine obligatoire.

## Parcours utilisateur

1. L'utilisateur ouvre `admin-ai` depuis la navigation TVF OS.
2. Il saisit le `TVF_ADMIN_TOKEN`.
3. Il pose une question ou colle un e-mail entrant.
4. L'assistant recherche les sources internes disponibles.
5. Il propose categorie, pole, priorite, prochaines actions et informations manquantes.
6. Il cite les sources internes trouvees.
7. Le resultat est journalise dans `ai_interactions`.
8. Les propositions importantes sont creees dans `ai_suggestions`.
9. L'utilisateur accepte, applique, refuse ou ignore chaque suggestion.
10. Les retours alimentent `ai_feedback`.

## API

### GET `/api/admin-ai?entity=dashboard`
Retourne les indicateurs : interactions, suggestions, taux d'acceptation, sources disponibles, automatisations.

### GET `/api/admin-ai?entity=suggestions`
Liste les suggestions IA. Filtres : `status`, `suggestion_type`, `limit`.

### GET `/api/admin-ai?entity=interactions`
Liste le journal des interactions. Filtres : `interaction_type`, `limit`.

### GET `/api/admin-ai?entity=automations`
Liste les regles d'automatisation IA et leurs executions.

### GET `/api/admin-ai?entity=sources`
Compte les sources disponibles par module.

### POST `/api/admin-ai`
Types supportes :

- `ask` : question globale sourcee ;
- `email_analysis` : analyse d'un e-mail entrant ;
- `suggestion` : creation manuelle d'une suggestion IA ;
- `feedback` : retour utilisateur sur une interaction ou suggestion.

### PATCH `/api/admin-ai`
Type supporte :

- `suggestion` : changement de statut humain (`accepted`, `rejected`, `ignored`, `applied`, `modified`).

## Tables Supabase

### `ai_interactions`
Journal conversationnel et operationnel : prompt, contexte, reponse JSON, resume, sources, confiance, modele, statut.

### `ai_suggestions`
Propositions IA actionnables : objet lie, type, valeur proposee JSON, explication, sources, confiance, statut de validation humaine.

### `ai_feedback`
Corrections et retours utilisateur : utile, incorrect, incomplet, dangereux, source manquante, autre.

### `ai_automation_rules`
Regles d'automatisation preparees : tri e-mail, qualification demande, synthese dossier, reponse sourcee.

### `ai_automation_runs`
Journal des executions d'automatisation, pour usage futur par webhooks ou jobs planifies.

## Securite

- Aucune cle IA ou Supabase n'est exposee au frontend.
- L'API exige `TVF_ADMIN_TOKEN`.
- Les tables ont RLS activees.
- Les politiques preparent les roles : `national_admin`, `branch_manager`, `case_manager`, `document_manager`, `procedure_manager`, `knowledge_manager`, `ai_manager`, `auditor`.
- Toute decision engageante reste humaine.
- Les reponses indiquent sources et niveau de confiance.

## Limites volontaires du MVP

- Le module fonctionne sans dependance a un fournisseur IA externe.
- Le moteur actuel est deterministe et source les contenus existants.
- L'appel a un modele externe pourra etre ajoute derriere l'API, sans modifier le frontend ni les tables principales.
- Les automatisations sont preparees mais pas executees automatiquement sans validation humaine et sans module e-mail/webhook ouvert.

## Fichiers

- `admin-ai.html`
- `admin-ai.js`
- `api/admin-ai.js`
- `supabase/tvf-os-ai.sql`
- `supabase/tvf-os-ai-test-data.sql`
- `supabase/tvf-os-ai-verification.sql`
- `tests/admin-ai-api.test.js`
