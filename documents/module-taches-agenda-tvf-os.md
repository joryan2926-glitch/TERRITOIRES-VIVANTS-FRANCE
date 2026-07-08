# Module Taches et agenda - TVF OS

## Objectif

Centraliser les taches, rendez-vous, echeances, projets et automatisations de suivi de TVF OS. Ce module transforme les demandes, e-mails et dossiers en actions suivies par responsable, priorite et date.

## Fichiers livres

- `admin-work.html`
- `admin-work.js`
- `api/admin-work.js`
- `supabase/tvf-os-work.sql`
- `supabase/tvf-os-work-test-data.sql`
- `supabase/tvf-os-work-verification.sql`
- `tests/admin-work-api.test.js`

## Tables Supabase

- `work_projects`
- `work_tasks`
- `work_events`
- `work_automation_rules`
- `work_activity_log`

## Fonctionnalites

- Vue KPI : projets actifs, taches ouvertes, retards, agenda du jour, regles actives.
- Vues : Taches, Agenda, Projets, Automatisations.
- Creation rapide d'une tache, d'un evenement ou d'un projet.
- Edition du statut, responsable, pole et description.
- Export CSV par vue.
- Assistant planning : detection des retards, score d'urgence et prochaines actions.
- Session admin unique partagee avec tous les modules.

## Automatisations cibles

- Creer une tache depuis un e-mail urgent.
- Generer une relance quand une tache est en retard.
- Creer un evenement depuis un rendez-vous demande.
- Alerter le responsable quand un projet glisse.
