# TVF OS - Module Demandes entrantes

Statut : developpe en module 2, apres verrouillage du Dashboard.

Page : `admin-demandes.html`  
Script : `admin-demandes.js`  
API : `/api/admin-contacts`  
Migration : `supabase/tvf-os-demandes-entrantes.sql`

## Objectif

Transformer toute entree recue par TVF en demande qualifiee, suivie, priorisee et prete a devenir un dossier metier lorsque le module Dossiers sera ouvert.

Le module reste strictement limite aux demandes entrantes. Il ne developpe pas le CRM, les Dossiers, les Taches, les E-mails ou les Antennes.

## Utilisateurs

- Responsable national
- Responsable d'antenne
- Charge de qualification
- Referent de pole
- Assistant IA TVF OS

## Fonctionnalites livrees

- Acces securise par `TVF_ADMIN_TOKEN`.
- File des demandes avec filtres recherche, statut, priorite, categorie.
- Vues rapides : toutes, nouvelles, a qualifier, en cours, rendez-vous, archivees.
- Fiche demande complete.
- Creation manuelle d'une demande recue par telephone, e-mail, WhatsApp, rendez-vous ou import.
- Numero metier `TVF-AAAA-0001` via migration Supabase, avec fallback API si besoin.
- Qualification : statut, priorite, categorie, canal, pole, responsable.
- Prochaine action et echeance SLA.
- Pieces manquantes modifiables.
- Motif de refus ou cloture.
- Notes internes.
- Brouillon de reponse externe pret a copier ou ouvrir en e-mail.
- Preparation de conversion en dossier sans developper le module Dossiers.
- Export CSV enrichi.

## Assistant IA

L'IA du module est implementee sous forme de moteur deterministe cote API afin de rester fiable et testable en production MVP.

Elle propose automatiquement :

- categorie operationnelle ;
- priorite ;
- pole concerne ;
- pieces manquantes ;
- prochaine action ;
- echeance selon SLA ;
- resume de qualification ;
- score de qualification.

Les propositions peuvent etre corrigees par l'utilisateur dans la fiche. Ces corrections deviennent la reference de la demande.

## Workflows

### Reception depuis formulaire public

1. Le formulaire public alimente `contacts`.
2. La migration complete les metadonnees metier.
3. Le module affiche la demande dans la file.
4. L'assistant propose categorie, priorite, pole, pieces et prochaine action.
5. L'utilisateur valide ou corrige.
6. Une reponse externe est preparee.
7. La demande est mise en attente, en rendez-vous, refusee, archivee ou acceptee pour etude.

### Import manuel

1. L'utilisateur clique sur `Nouvelle demande`.
2. Il indique canal, contact, objet, message et informations connues.
3. L'API applique les regles IA si categorie/priorite non renseignees.
4. Supabase cree la demande et son numero TVF.
5. La fiche s'ouvre immediatement.

### Demande de pieces

1. L'assistant liste les pieces manquantes.
2. L'utilisateur choisit le modele `Demande de pieces complementaires`.
3. Il copie ou ouvre l'e-mail prepare.
4. Le statut passe en attente et la prochaine action devient l'attente des pieces.

### Preparation dossier

1. La demande est marquee `accepte`.
2. La prochaine action indique la creation du dossier metier futur.
3. Aucune table `cases` n'est modifiee tant que le module Dossiers n'est pas developpe.

## Base de donnees

La table `contacts` reste la source MVP des demandes entrantes et recoit les colonnes metier :

- `request_number`
- `channel`
- `form_code`
- `pole`
- `next_action`
- `next_action_due_at`
- `closure_reason`
- `ai_summary`
- `ai_confidence`
- `qualification_score`
- `missing_pieces`

Tables preparees :

- `request_activity_log`
- `request_ai_suggestions`
- `request_documents`

RLS activee sur les trois tables dediees. Le service role utilise par l'API serveur bypass RLS, les policies preparent les futurs roles Supabase Auth TVF.

## API

`GET /api/admin-contacts`

- Authentification Bearer `TVF_ADMIN_TOKEN`.
- Filtres : `q`, `status`, `priority`, `category`, `limit`.
- Retour : demandes enrichies avec objet `assistant`.

`POST /api/admin-contacts`

- Creation manuelle d'une demande.
- Champs : `channel`, `full_name`, `email`, `subject`, `message`, `category`, `priority`, `assigned_to`, `next_action`.
- Classification automatique si categorie ou priorite absente.

`PATCH /api/admin-contacts`

- Mise a jour qualification et suivi.
- Champs : `status`, `priority`, `category`, `channel`, `pole`, `assigned_to`, `next_action`, `next_action_due_at`, `missing_pieces`, `closure_reason`, `internal_notes`.

## Tests

- `tests/admin-contacts-api.test.js`
- `tests/dashboard-api.test.js` pour verifier la non-regression Dashboard

Commandes :

```bash
node tests/admin-contacts-api.test.js
node tests/dashboard-api.test.js
```

## Limites assumees

- Pas de creation reelle de dossier tant que le module Dossiers n'est pas ouvert.
- Pas de stockage de pieces binaires dans l'interface tant que le module Documents/Fichiers n'est pas ouvert.
- Pas d'envoi e-mail automatique depuis ce module : le brouillon est prepare et ouvert par mailto.
- Pas de comptes utilisateurs Supabase Auth encore actifs ; l'acces production reste protege par token admin serveur.
