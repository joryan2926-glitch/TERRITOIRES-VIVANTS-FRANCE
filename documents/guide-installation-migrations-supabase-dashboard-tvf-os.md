# TERRITOIRES VIVANTS FRANCE
## Guide d'installation Supabase - Module Dashboard TVF OS

Date : 2026-07-07  
Module : Tableau de bord / Dashboard  
Statut : a executer avant validation production definitive

---

## 1. Objectif

Ce guide explique comment appliquer pas a pas les migrations Supabase necessaires au module Dashboard TVF OS, verifier les tables, les colonnes, les politiques RLS, inserer des donnees de test, executer les tests reels, puis confirmer la conformite 100 % en developpement et en production.

Le module suivant ne doit pas etre developpe tant que :

- les migrations sont appliquees ;
- les verifications SQL sont positives ;
- les tests locaux passent ;
- les tests sur environnement reel passent ;
- le rapport de validation est confirme.

---

## 2. Fichiers concernes

Migrations :

- `supabase/contacts-operational-upgrade.sql`
- `supabase/tvf-os-dashboard.sql`

Donnees de test :

- `supabase/tvf-os-dashboard-test-data.sql`

Verification :

- `supabase/tvf-os-dashboard-verification.sql`

Tests :

- `tests/dashboard-api.test.js`
- `tests/dashboard-real-env.test.js`

Documentation :

- `documents/module-dashboard-tvf-os.md`
- `documents/rapport-validation-dashboard-tvf-os.md`

---

## 3. Pre-requis

Avant execution :

1. Acceder au projet Supabase TVF.
2. Verifier que la table `public.contacts` existe.
3. Faire une sauvegarde ou un export de la table `contacts`.
4. Confirmer que l'environnement cible est le bon : staging ou production.
5. Disposer des variables :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_CONTACTS_TABLE=contacts`
   - `TVF_ADMIN_TOKEN`

Ne jamais coller les cles secretes dans un document versionne.

---

## 4. Ordre d'application des migrations

### Etape 1 - Sauvegarde

Dans Supabase :

1. Ouvrir Table Editor.
2. Selectionner `contacts`.
3. Exporter les donnees en CSV ou effectuer une sauvegarde projet.
4. Noter la date et l'heure de sauvegarde.

### Etape 2 - Colonnes operationnelles contacts

Dans Supabase SQL Editor :

1. Ouvrir `supabase/contacts-operational-upgrade.sql`.
2. Copier tout le contenu.
3. Coller dans SQL Editor.
4. Executer.

Effet attendu :

- ajout des colonnes `status`, `priority`, `category`, `assigned_to`, `internal_notes`, `last_follow_up_at`, `closed_at`, `updated_at` ;
- contraintes sur statuts et priorites ;
- index de pilotage ;
- trigger `updated_at`.

### Etape 3 - Tables Dashboard et RLS

Dans Supabase SQL Editor :

1. Ouvrir `supabase/tvf-os-dashboard.sql`.
2. Copier tout le contenu.
3. Coller dans SQL Editor.
4. Executer.

Effet attendu :

- creation de `dashboard_preferences` ;
- creation de `dashboard_snapshots` ;
- creation de `dashboard_alerts` ;
- activation RLS ;
- creation des policies MVP ;
- creation des index ;
- creation des triggers `updated_at`.

---

## 5. Donnees de test

### Option recommandee : staging

Executer `supabase/tvf-os-dashboard-test-data.sql` en staging.

Ce fichier ajoute trois demandes anonymisees :

- une demande urgente proprietaire ;
- une demande haute collectivite ;
- une demande archivee materiaux.

Ces donnees permettent de verifier :

- KPI ;
- retards ;
- priorites ;
- categories ;
- poles ;
- taux de cloture ;
- affichage des dernieres demandes.

### Option production

Si les tests doivent etre faits en production :

1. Executer le fichier de test.
2. Faire les verifications.
3. Executer immediatement le nettoyage indique a la fin du fichier :

```sql
delete from public.contacts
where source_page = 'dashboard-test'
  and subject like '[TEST DASHBOARD]%';
```

Les donnees de test utilisent le prefixe `[TEST DASHBOARD]` pour etre identifiables.

---

## 6. Verification SQL

Apres migrations et donnees de test :

1. Ouvrir `supabase/tvf-os-dashboard-verification.sql`.
2. Executer chaque bloc ou tout le fichier.
3. Verifier les resultats.

Resultats attendus :

- les 8 colonnes operationnelles existent dans `contacts` ;
- les 3 tables Dashboard existent ;
- RLS est activee sur les 3 tables Dashboard ;
- les policies Dashboard existent ;
- les index Dashboard et contacts existent ;
- `contacts_30_days` retourne un nombre coherent ;
- les donnees `[TEST DASHBOARD]` apparaissent si elles ont ete inserees.

---

## 7. Configuration environnement

### Developpement local

Configurer temporairement les variables dans le terminal local avant test reel :

```powershell
$env:TVF_ADMIN_TOKEN=\"...\"
$env:SUPABASE_URL=\"https://votre-projet.supabase.co\"
$env:SUPABASE_SERVICE_ROLE_KEY=\"...\"
$env:SUPABASE_CONTACTS_TABLE=\"contacts\"
```

Ne pas commiter ces valeurs.

### Production Vercel

Dans Vercel :

1. Aller dans Project Settings.
2. Ouvrir Environment Variables.
3. Verifier :
   - `TVF_ADMIN_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_CONTACTS_TABLE`
4. Redeployer si une variable a ete modifiee.

---

## 8. Tests a executer

### Tests de developpement

```bash
node tests\dashboard-api.test.js
node --check api\dashboard.js
node --check dashboard.js
```

Resultat attendu :

- `Dashboard API tests passed`
- aucune erreur syntaxique.

### Test environnement reel

Apres configuration des variables :

```bash
node tests\dashboard-real-env.test.js
```

Resultat attendu :

```text
Dashboard real environment test passed
```

Si les variables ne sont pas disponibles, le test affiche :

```text
SKIP real environment Dashboard test. Missing env: ...
```

Dans ce cas, la validation production n'est pas terminee.

### Test HTTP local

Lancer ou verifier le serveur local :

```bash
node scripts/serve-preview.js
```

Ouvrir :

```text
http://127.0.0.1:4173/dashboard.html
```

Verifier :

- la page de connexion apparait ;
- le token ouvre le Dashboard ;
- les KPI s'affichent ;
- les filtres fonctionnent ;
- l'export CSV fonctionne ;
- l'impression est disponible ;
- le panneau de conformite affiche 100 %.

---

## 9. Verification production

Apres deploiement :

1. Ouvrir l'URL production du Dashboard :

```text
https://www.territoiresvivantsfrance.fr/dashboard
```

2. Entrer `TVF_ADMIN_TOKEN`.
3. Verifier :
   - chargement sans erreur ;
   - indicateurs presents ;
   - filtres periode/statut/priorite/pole ;
   - export CSV ;
   - panneau assistant ;
   - panneau conformite 100 % ;
   - aucune donnee de test restante si production.

4. Tester l'API avec token valide depuis un outil securise :

```text
GET /api/dashboard?range=30&status=all&priority=all&category=all
Authorization: Bearer <TVF_ADMIN_TOKEN>
```

Resultat attendu :

- `ok: true`
- `dashboard.coverage.percent: 100`
- `dashboard.metrics` present.

5. Tester l'API sans token :

Resultat attendu :

- HTTP 401 ;
- `ok: false`.

---

## 10. Nettoyage des donnees de test

Apres validation :

```sql
delete from public.contacts
where source_page = 'dashboard-test'
  and subject like '[TEST DASHBOARD]%';
```

Puis relancer :

```sql
select count(*)
from public.contacts
where source_page = 'dashboard-test'
  and subject like '[TEST DASHBOARD]%';
```

Resultat attendu :

- `0`

---

## 11. Criteres de validation finale

Le Dashboard est definitivement valide uniquement si :

- migrations appliquees ;
- RLS activee ;
- policies presentes ;
- donnees source lisibles ;
- tests locaux OK ;
- test environnement reel OK ;
- page production OK ;
- API production protegee ;
- rapport de conformite maintenu a 100 % ;
- donnees de test nettoyees si production.

---

## 12. Statut actuel

Statut au moment de creation de ce guide :

- code Dashboard : developpe ;
- tests locaux : OK ;
- rapport fonctionnel : 100 % sur perimetre module 1 ;
- migrations : pretes, a executer dans Supabase ;
- test environnement reel : a executer apres configuration des variables et application des migrations ;
- validation production definitive : en attente d'application Supabase et test reel.
