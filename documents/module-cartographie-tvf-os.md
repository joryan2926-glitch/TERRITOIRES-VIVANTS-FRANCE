# Module Cartographie - TVF OS

Statut : developpement initial termine, validation locale automatisee requise avant migration production.

## Objectif

Le module Cartographie permet a TVF de visualiser les territoires, biens, commerces, friches, ressources, partenaires, projets, antennes et signalements avec des niveaux de precision et de confidentialite controles.

## Perimetre livre

- Interface admin `admin-map.html` protegee par `TVF_ADMIN_TOKEN`.
- API serverless `api/admin-map.js`.
- Tables Supabase `map_points`, `map_layers`, `map_geocode_checks`, `map_spatial_alerts`.
- Carte interne sans fournisseur externe de tuiles.
- Couches metier filtrables.
- Fiche point editable.
- Export CSV interne.
- Assistant cartographie : score de priorite, champs manquants, precision suggeree, alertes.
- Geocodage controle : trace de validation sans appel automatique a un fournisseur tiers.
- Alertes : priorite territoriale, precision manquante, localisation sensible.

## Securite

- Aucune cle externe cote frontend.
- Coordonnees sensibles masquees ou arrondies par regle SQL.
- RLS activee sur toutes les tables.
- Lecture/gestion preparees pour roles `national_admin`, `branch_manager`, `case_manager`, `map_manager`, `auditor`.

## Limites MVP

- Pas de fond OpenStreetMap/IGN pour eviter une dependance externe et une exposition involontaire de points sensibles.
- Pas de geocodage automatique externe : l'utilisateur renseigne ou verifie les coordonnees.
- Les modules Observatoire, Projets, Antennes et Impact pourront enrichir ces donnees plus tard.
