# Controle production TVF OS

Date : 2026-07-11

## Synthese

- Variables locales chargees : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_CONTACTS_TABLE, EMAIL_PROVIDER, BREVO_API_KEY, TVF_EMAIL_FROM, TVF_EMAIL_REPLY_TO, TVF_NOTIFICATION_EMAIL, TVF_OUTBOUND_TIMEOUT_MS, TVF_ADMIN_TOKEN, ADMIN_TOKEN
- Modules testes : 20
- Modules OK : 20
- Capacite de lecture reelle : 100 %
- Mode : lecture seule, aucune creation de donnee.
- Secrets : aucune valeur sensible n'est affichee.

## Resultat module par module

| Module | URL testee | Statut | Temps | Observation |
|---|---|---:|---:|---|
| Session admin | `/api/admin-session` | OK | 10 ms | Lecture valide |
| Tableau de bord | `/api/dashboard?range=30&status=all&priority=all&category=all` | OK | 1566 ms | Lecture valide |
| Demandes entrantes | `/api/admin-contacts?limit=5` | OK | 165 ms | Lecture valide |
| Contacts | `/api/admin-crm?entity=dashboard` | OK | 111 ms | Lecture valide |
| Boite mail | `/api/admin-emails?entity=dashboard` | OK | 90 ms | Lecture valide |
| Dossiers | `/api/admin-cases?entity=dashboard` | OK | 76 ms | Lecture valide |
| Taches / agenda | `/api/admin-work?entity=dashboard` | OK | 189 ms | Lecture valide |
| Documents | `/api/admin-documents?entity=dashboard` | OK | 146 ms | Lecture valide |
| Procedures | `/api/admin-procedures?entity=dashboard` | OK | 152 ms | Lecture valide |
| Cartographie | `/api/admin-map?entity=dashboard` | OK | 149 ms | Lecture valide |
| Observatoire | `/api/admin-observatoire?entity=dashboard` | OK | 82 ms | Lecture valide |
| Territoires locaux | `/api/admin-branches?entity=dashboard` | OK | 186 ms | Lecture valide |
| Resultats | `/api/admin-impact?entity=dashboard` | OK | 80 ms | Lecture valide |
| Finances | `/api/admin-finances?entity=dashboard` | OK | 90 ms | Lecture valide |
| Decisions | `/api/admin-governance?entity=dashboard` | OK | 122 ms | Lecture valide |
| Controle interne | `/api/admin-risks?entity=dashboard` | OK | 90 ms | Lecture valide |
| Utilisateurs / roles | `/api/admin-users?entity=dashboard` | OK | 145 ms | Lecture valide |
| Reglages | `/api/admin-settings?entity=dashboard` | OK | 185 ms | Lecture valide |
| Base utile | `/api/admin-knowledge?entity=dashboard` | OK | 140 ms | Lecture valide |
| Assistant | `/api/admin-ai?entity=dashboard` | OK | 142 ms | Lecture valide |

## Lecture operationnelle

Tous les modules controles repondent en lecture avec les variables locales et Supabase. TVF OS est pret pour les tests de parcours reels : formulaire, demande, dossier, tache, document et reporting.

## Prochaines validations terrain

1. Envoyer une demande publique reelle depuis le site.
2. Verifier son arrivee dans Supabase et le module Demandes.
3. La rattacher a un contact.
4. Creer un dossier depuis cette demande.
5. Ajouter une tache, un document et une decision.
6. Controler que l'activite est tracee et exportable.