# TVF OS - Ordre d'activation Supabase du socle MVP

Date : 2026-07-09
Usage : guide opérationnel pour activer les modules essentiels TVF OS dans Supabase sans se perdre dans tous les scripts.

## Objectif

Rendre utilisable le parcours prioritaire TVF OS :

Demande entrante -> CRM contact / organisation -> dossier -> tâche / agenda -> document / modèle -> décision et suivi.

## Avant de commencer

1. Ouvrir Supabase.
2. Aller dans SQL Editor.
3. Exécuter les scripts un par un, dans l'ordre ci-dessous.
4. Après chaque script principal, exécuter le script de vérification correspondant.
5. Ne pas exécuter les scripts `*-test-data.sql` en production sauf si vous voulez créer volontairement des données de test.

## Ordre prioritaire d'exécution

### 1. Demandes entrantes

Script principal :

```text
supabase/tvf-os-demandes-entrantes.sql
```

Vérification :

```text
supabase/tvf-os-demandes-entrantes-verification.sql
```

Rôle : enrichir les demandes issues des formulaires publics, préparer la qualification et l'historique.

### 2. CRM contacts et organisations

Script principal :

```text
supabase/tvf-os-crm.sql
```

Vérification :

```text
supabase/tvf-os-crm-verification.sql
```

Rôle : gérer contacts, organisations, historiques, doublons, consentements et rattachements.

### 3. Dossiers

Script principal :

```text
supabase/tvf-os-dossiers.sql
```

Vérification :

```text
supabase/tvf-os-dossiers-verification.sql
```

Rôle : convertir une demande en dossier suivi avec participants, checklist, risques et décisions.

### 4. Tâches, agenda et projets

Script principal :

```text
supabase/tvf-os-work.sql
```

Vérification :

```text
supabase/tvf-os-work-verification.sql
```

Rôle : suivre les tâches, relances, événements, actions et projets internes.

### 5. Gestion documentaire

Script principal :

```text
supabase/tvf-os-documents.sql
```

Vérification :

```text
supabase/tvf-os-documents-verification.sql
```

Rôle : créer la base documentaire, les modèles, les fichiers, le bucket `tvf-documents`, le versioning et l'audit documentaire.

### 6. Utilisateurs, rôles et permissions

Script principal :

```text
supabase/tvf-os-users.sql
```

Vérification :

```text
supabase/tvf-os-users-verification.sql
```

Rôle : préparer les profils, rôles, permissions, invitations et revues d'accès.

## Vérification globale MVP

Après les six modules ci-dessus, exécuter :

```text
supabase/tvf-os-mvp-verification.sql
```

Ce script vérifie en une seule fois :

- tables essentielles ;
- RLS activée ;
- policies par table ;
- bucket `tvf-documents` ;
- fonctions critiques Documents et Dossiers.

## Interprétation rapide

- `ok` : l'élément est présent.
- `missing` : le script du module concerné n'a probablement pas été exécuté ou a échoué partiellement.
- `rls_enabled = false` : la table existe mais la sécurité RLS n'est pas active, à corriger avant usage réel.
- `policies = 0` : la table existe mais aucune politique n'est appliquée, à corriger avant usage réel.

## Après activation

Tester dans TVF OS :

1. Ouvrir `/admin`.
2. Aller dans Demandes.
3. Aller dans CRM.
4. Aller dans Dossiers.
5. Aller dans Tâches.
6. Aller dans Documents.
7. Aller dans Utilisateurs.

Chaque module doit charger sans message de configuration manquante.

## Important

Les scripts `*-test-data.sql` sont réservés aux tests. Ne pas les exécuter sur une base de production sans volonté explicite de créer des données factices.