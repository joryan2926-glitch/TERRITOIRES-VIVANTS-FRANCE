# TERRITOIRES VIVANTS FRANCE
## TVF OS - Module Dashboard

Statut : module 1 developpe  
Perimetre : tableau de bord operationnel des demandes entrantes  
Page : `dashboard.html`  
API : `/api/dashboard`  
Migration Supabase : `supabase/tvf-os-dashboard.sql`

---

## 1. Objectif du module

Le module Dashboard donne une vue de pilotage rapide sur l'activite entrante TVF :

- demandes recues sur une periode ;
- demandes actives ;
- demandes en retard ;
- demandes sans responsable ;
- taux de qualification ;
- taux de cloture ;
- repartition par statut, priorite et categorie ;
- tendance quotidienne ;
- alertes operationnelles ;
- dernieres demandes ;
- synthese d'assistance operationnelle.

Ce module est volontairement limite au Dashboard. Il ne developpe pas les autres modules TVF OS.

---

## 2. Frontend

Fichiers :

- `dashboard.html`
- `dashboard.js`
- styles ajoutes dans `styles.css`

Fonctionnalites :

- acces prive par `TVF_ADMIN_TOKEN` ;
- reutilisation du stockage de session du back-office demandes ;
- selection de periode : 7 jours, 30 jours, 90 jours, 12 mois ;
- actualisation manuelle ;
- navigation vers le back-office demandes ;
- affichage responsive desktop/mobile ;
- etats : connexion, chargement, erreur, donnees vides.

---

## 3. Backend

Fichier :

- `api/dashboard.js`

Fonctionnement :

1. Verifie le token admin.
2. Verifie la configuration Supabase.
3. Lit la table `contacts` via l'API REST Supabase avec la cle service role.
4. Agrege les donnees cote serveur.
5. Retourne les KPI, tendances, alertes, dernieres demandes et recommandations operationnelles.

La cle Supabase n'est jamais exposee au navigateur.

---

## 4. Source de donnees MVP

Le Dashboard utilise la table existante `contacts`, enrichie par la migration operationnelle :

- `status`
- `priority`
- `category`
- `assigned_to`
- `internal_notes`
- `last_follow_up_at`
- `closed_at`
- `updated_at`

Cette approche permet de livrer le premier module TVF OS sur le socle existant sans attendre tous les futurs objets `incoming_requests`, `cases` et `branches`.

---

## 5. Tables Supabase du module

La migration `supabase/tvf-os-dashboard.sql` prepare trois tables dediees :

- `dashboard_preferences` : preferences utilisateur futures ;
- `dashboard_snapshots` : historisation future des indicateurs ;
- `dashboard_alerts` : alertes operationnelles persistantes futures.

Le Dashboard actuel calcule les alertes en temps reel depuis `contacts`. Les tables sont pretes pour les phases suivantes.

---

## 6. RLS

Les tables Dashboard ont la RLS activee.

Mode MVP :

- l'interface appelle `/api/dashboard` ;
- l'API utilise la cle service role cote serveur ;
- le token admin protege l'acces ;
- aucune donnee Dashboard n'est accessible publiquement.

Mode futur :

- les utilisateurs authentifies liront leurs preferences ;
- les snapshots et alertes seront filtres par role, antenne et permissions ;
- les policies devront etre renforcees quand les tables `profiles`, `branches` et `user_roles` seront developpees.

---

## 7. Automatisations

Automatisations integrees dans le module :

- detection des demandes en retard selon priorite ;
- detection des demandes actives sans responsable ;
- detection des demandes urgentes ;
- generation d'alertes operationnelles ;
- generation d'une synthese assistant.

Automatisations futures :

- snapshot quotidien ;
- notification quotidienne des retards ;
- rapport hebdomadaire ;
- persistance des alertes dans `dashboard_alerts`.

---

## 8. IA

Le module n'appelle pas encore de fournisseur IA externe.

Il integre une assistance operationnelle deterministe :

- synthese automatique ;
- recommandations basees sur les regles TVF ;
- signalement des retards, urgences et absences de responsable.

Cette approche respecte le principe de prudence : l'assistant aide a piloter mais ne prend aucune decision.

---

## 9. Securite

Mesures :

- page `noindex` ;
- protection par token admin ;
- API avec comparaison securisee du token ;
- cache des reponses desactive ;
- cle service role uniquement cote serveur ;
- Dashboard ajoute a `robots.txt` ;
- CSP existante limite les connexions a `self`.

---

## 10. Variables d'environnement

Obligatoires :

- `TVF_ADMIN_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_CONTACTS_TABLE=contacts`

Optionnelle :

- `TVF_OUTBOUND_TIMEOUT_MS`

---

## 11. Tests

Tests ajoutes :

- `tests/dashboard-api.test.js`

Couverture :

- aggregation KPI ;
- detection de retard ;
- endpoint refuse sans token ;
- endpoint retourne les indicateurs avec token valide et Supabase simule.

Commande :

```bash
node tests/dashboard-api.test.js
```

---

## 12. Limites connues du module 1

- Le module Dashboard ne gere pas encore les antennes, car le module Antennes n'est pas developpe.
- Les alertes ne sont pas encore persistantes.
- L'assistant est regle-metier, sans appel IA externe.
- Les indicateurs reposent sur `contacts`, en attendant les futures tables `incoming_requests` et `cases`.

Ces limites sont volontaires pour respecter le developpement module par module.
