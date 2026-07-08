# Module Utilisateurs, roles et permissions - TVF OS

## Statut

Module developpe comme suite logique apres Risques et conformite. Il gere l'identite interne TVF OS, les roles, les permissions, les rattachements antennes, les invitations et les revues d'acces.

## Objectifs fonctionnels

- Centraliser les profils utilisateurs internes.
- Gerer les roles nationaux, locaux, operationnels, support, audit, finance, communication et systeme.
- Maintenir le catalogue de permissions par module.
- Attribuer les roles avec portee globale, nationale, antenne, pole, module ou temporaire.
- Suivre les rattachements des utilisateurs aux antennes.
- Piloter les invitations et l'onboarding.
- Organiser les revues d'acces et detecter les droits sensibles.
- Fournir une analyse IA simple des risques d'acces et des actions prioritaires.

## Frontend

Fichiers :

- `admin-users.html`
- `admin-users.js`
- `styles.css`
- liens ajoutes dans `admin.html` et `dashboard.html`

Ecrans disponibles :

- Connexion securisee par `TVF_ADMIN_TOKEN`.
- Vue KPI : score d'acces, profils actifs, invitations, roles, revues.
- Assistant acces : resume et prochaines actions.
- Filtres de recherche/statut.
- Onglets : Profils, Roles, Permissions, Invitations, Revues.
- Liste selectionnable.
- Detail editable pour profils, roles, invitations et revues.
- Detail lecture seule pour permissions.
- Creation rapide : profil, invitation, role, attribution de role, revue.
- Export CSV par vue.

## Backend

Fichier : `api/admin-users.js`

Endpoints :

- `GET /api/admin-users?entity=dashboard`
- `GET /api/admin-users?entity=profiles`
- `GET /api/admin-users?entity=roles`
- `GET /api/admin-users?entity=permissions`
- `GET /api/admin-users?entity=role_permissions`
- `GET /api/admin-users?entity=user_roles`
- `GET /api/admin-users?entity=memberships`
- `GET /api/admin-users?entity=invitations`
- `GET /api/admin-users?entity=reviews`
- `POST /api/admin-users`
- `PATCH /api/admin-users`

Protection : toutes les routes exigent `TVF_ADMIN_TOKEN` via `Authorization: Bearer ...` ou `x-admin-token`.

## Base de donnees Supabase

Migrations :

- `supabase/tvf-os-users.sql`
- `supabase/tvf-os-users-test-data.sql`
- `supabase/tvf-os-users-verification.sql`

Tables :

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `user_branch_memberships`
- `user_invitations`
- `access_reviews`

RLS : activee sur les 8 tables. Les politiques separent lecture et gestion pour administrateurs nationaux, responsables antennes, gestionnaires utilisateurs et auditeurs.

## Automatisations et IA

Le module calcule automatiquement :

- score d'acces par profil ;
- nombre de roles actifs ;
- rattachements actifs ;
- roles sensibles ;
- revues en attente ;
- actions recommandees ;
- alertes dashboard sur profils non actifs, roles sensibles et revues a faire.

Logique cible pour les phases suivantes : relier ces signaux aux notifications, aux revues periodiques, aux invitations Brevo et aux journaux d'audit centralises.

## Donnees de test

Le jeu de test cree :

- un profil Camille Martin ;
- une attribution de role responsable antenne ;
- un rattachement antenne si une antenne test existe ;
- une invitation en attente ;
- une revue d'acces en attente.

## Definition de termine

Le module est conforme lorsque :

- les 8 tables existent ;
- les 8 tables ont RLS active ;
- les politiques RLS existent ;
- les roles et permissions de base sont initialises ;
- l'API passe ses tests unitaires ;
- l'interface charge, filtre, affiche, edite et exporte ;
- la navigation depuis l'accueil admin et le dashboard fonctionne ;
- aucune regression n'est detectee sur les tests admin existants.
