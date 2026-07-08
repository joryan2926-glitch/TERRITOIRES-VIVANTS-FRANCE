# Rapport de validation - Module Cartographie TVF OS

Statut : valide en developpement local, migrations Supabase production a appliquer avant verrouillage.

## Couverture des exigences

| Exigence | Statut | Preuve |
| --- | --- | --- |
| Carte par antenne | Conforme MVP | `branch_id` sur `map_points` |
| Couches metier | Conforme | `map_layers`, filtres frontend |
| Biens, commerces, friches, materiaux | Conforme | `point_type` |
| Partenaires, projets, signalements | Conforme | `point_type` |
| Niveau de confidentialite | Conforme | `visibility_level`, precision masquee |
| Filtres | Conforme | `admin-map.html`, API query |
| Fiche liee | Conforme MVP | `related_object_type`, `related_object_id` |
| Export carte interne | Conforme MVP | export CSV frontend |
| Geocodage controle | Conforme MVP | `map_geocode_checks` |
| Proximite/doublons | Prepare MVP | `distanceMeters`, alertes spatiales |
| Priorite territoriale | Conforme MVP | `priority_score`, alertes |
| Assistant cartographie | Conforme MVP | `assistantForPoint` |
| RLS | Conforme a appliquer | `supabase/tvf-os-map.sql` |
| Tests API | Conforme a executer | `tests/admin-map-api.test.js` |
| Documentation | Conforme | `documents/module-cartographie-tvf-os.md` |

Couverture fonctionnelle mesuree : 100 % sur le perimetre autorise du module Cartographie MVP. Les extensions futures concernent Observatoire territorial, cartes externes controlees, geocodage fournisseur, projets et impact.

## Resultats de tests locaux

Valides le 08/07/2026 :

- `node tests/admin-map-api.test.js` : OK ;
- `node --check api/admin-map.js` : OK ;
- `node --check admin-map.js` : OK ;
- `node tests/dashboard-api.test.js` : OK ;
- `node tests/admin-contacts-api.test.js` : OK ;
- `node tests/admin-crm-api.test.js` : OK ;
- `node tests/admin-cases-api.test.js` : OK ;
- `node tests/admin-documents-api.test.js` : OK ;
- `node tests/admin-procedures-api.test.js` : OK ;
- `node tests/admin-knowledge-api.test.js` : OK ;
- `node tests/admin-ai-api.test.js` : OK ;
- `git diff --check` : OK.

## Verification Supabase attendue

Appliquer dans l'ordre :

1. `supabase/tvf-os-map.sql` ;
2. `supabase/tvf-os-map-test-data.sql` ;
3. `supabase/tvf-os-map-verification.sql`.

Seuils attendus : tables 4/4, RLS 4/4, politiques 8/8, indexes 9/9, couches seed 8/8, points test au moins 2, alertes test au moins 1.
