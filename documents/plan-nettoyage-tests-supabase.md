# TERRITOIRES VIVANTS FRANCE
## Plan de nettoyage des données de test Supabase

Ce document indique comment distinguer et nettoyer les données de test après les essais de formulaires.

---

## 1. Objectif

Après les tests techniques, la base Supabase peut contenir des demandes fictives ou incomplètes. Avant d'utiliser la plateforme avec de vrais utilisateurs, il faut nettoyer ces données pour éviter toute confusion.

---

## 2. Données à identifier

Rechercher les demandes contenant :

- `test` ;
- `demo` ;
- `essai` ;
- `codex` ;
- `formulaire test` ;
- des emails de test ;
- des noms manifestement fictifs ;
- des numéros de téléphone non réels ;
- des descriptions très courtes créées pour vérifier le fonctionnement.

---

## 3. Méthode prudente

Ne jamais supprimer massivement sans vérification.

Étapes recommandées :

1. Exporter la table concernée en CSV depuis Supabase.
2. Identifier les lignes de test.
3. Les marquer avec un statut `test` ou `archive_test` si la colonne existe.
4. Supprimer uniquement les lignes confirmées comme tests.
5. Conserver une trace de l'opération dans un registre interne.

---

## 4. Tables à vérifier

Selon le schéma actif, vérifier notamment :

- contacts ;
- demandes ;
- signalements ;
- materiaux ;
- partenaires ;
- benevoles ;
- projets ;
- biens solidaires ;
- logs éventuels.

---

## 5. Requête SQL de contrôle

À adapter selon les noms exacts des colonnes.

```sql
select *
from contacts
where lower(coalesce(nom, '')) like '%test%'
   or lower(coalesce(email, '')) like '%test%'
   or lower(coalesce(message, '')) like '%test%'
   or lower(coalesce(message, '')) like '%essai%';
```

---

## 6. Suppression prudente

Avant toute suppression, vérifier les lignes retournées.

Exemple à adapter uniquement après vérification :

```sql
delete from contacts
where lower(coalesce(email, '')) like '%test%'
   or lower(coalesce(message, '')) like '%essai%';
```

---

## 7. Règle interne

Toute suppression doit être notée avec :

- date ;
- table concernée ;
- nombre de lignes supprimées ;
- raison ;
- personne ayant réalisé l'opération.
