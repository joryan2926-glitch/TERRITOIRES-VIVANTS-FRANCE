# Module E-mails intelligents - TVF OS

## Objectif

Le module E-mails intelligents transforme les messages entrants en actions exploitables : lecture, triage IA, brouillon de reponse, pieces manquantes, taches, suivi et conversion en demande entrante.

## Fichiers livres

- `admin-emails.html`
- `admin-emails.js`
- `api/admin-emails.js`
- `supabase/tvf-os-emails.sql`
- `supabase/tvf-os-emails-test-data.sql`
- `supabase/tvf-os-emails-verification.sql`
- `tests/admin-emails-api.test.js`

## Tables Supabase

- `email_messages`
- `email_attachments`
- `email_ai_suggestions`
- `email_tasks`
- `email_workflow_events`

## Parcours utilisateur

1. L'utilisateur ouvre le module via la navigation TVF OS.
2. Il entre le token admin si la session n'est pas deja active.
3. Il consulte les KPIs : e-mails ouverts, urgences, suggestions et taches.
4. Il ouvre un e-mail entrant.
5. TVF OS affiche le pole, la priorite, les pieces manquantes et un brouillon de reponse.
6. L'utilisateur valide ou modifie le statut, copie le brouillon ou convertit l'e-mail en demande.
7. Les taches et evenements gardent la trace du workflow.

## Automatisations IA

L'analyse automatique deduit :

- categorie ;
- pole concerne ;
- priorite ;
- pieces manquantes ;
- prochaine action ;
- echeance ;
- brouillon de reponse ;
- besoin de conversion en demande.

Toute sortie externe doit rester validee par un humain.

## Integrations prevues

- Brevo : reception webhook, tags, templates et envoi controle.
- Google Workspace : synchronisation future Gmail/Drive.
- CRM et Demandes : conversion et rattachement.
- Documents : pieces jointes indexables.
- Assistant IA : historisation des suggestions.
