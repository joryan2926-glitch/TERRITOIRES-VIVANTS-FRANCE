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
| Session admin | `/api/admin-session` | OK | 18 ms | Lecture valide |
| Dashboard public admin | `/api/dashboard?range=30&status=all&priority=all&category=all` | OK | 969 ms | Lecture valide |
| Demandes entrantes | `/api/admin-contacts?limit=5` | OK | 126 ms | Lecture valide |
| CRM / contacts | `/api/admin-crm?entity=dashboard` | OK | 111 ms | Lecture valide |
| E-mails intelligents | `/api/admin-emails?entity=dashboard` | OK | 152 ms | Lecture valide |
| Dossiers | `/api/admin-cases?entity=dashboard` | OK | 74 ms | Lecture valide |
| Taches / agenda | `/api/admin-work?entity=dashboard` | OK | 129 ms | Lecture valide |
| Documents | `/api/admin-documents?entity=dashboard` | OK | 138 ms | Lecture valide |
| Procedures | `/api/admin-procedures?entity=dashboard` | OK | 126 ms | Lecture valide |
| Cartographie | `/api/admin-map?entity=dashboard` | OK | 75 ms | Lecture valide |
| Observatoire | `/api/admin-observatoire?entity=dashboard` | OK | 80 ms | Lecture valide |
| Antennes | `/api/admin-branches?entity=dashboard` | OK | 130 ms | Lecture valide |
| Impact | `/api/admin-impact?entity=dashboard` | OK | 75 ms | Lecture valide |
| Finances | `/api/admin-finances?entity=dashboard` | OK | 122 ms | Lecture valide |
| Gouvernance | `/api/admin-governance?entity=dashboard` | OK | 133 ms | Lecture valide |
| Risques / conformite | `/api/admin-risks?entity=dashboard` | OK | 80 ms | Lecture valide |
| Utilisateurs / roles | `/api/admin-users?entity=dashboard` | OK | 81 ms | Lecture valide |
| Parametres | `/api/admin-settings?entity=dashboard` | OK | 122 ms | Lecture valide |
| Connaissances | `/api/admin-knowledge?entity=dashboard` | OK | 140 ms | Lecture valide |
| Assistant IA | `/api/admin-ai?entity=dashboard` | OK | 159 ms | Lecture valide |

## Lecture operationnelle

Tous les modules controles repondent en lecture avec les variables locales et Supabase. TVF OS est pret pour les tests de parcours reels : formulaire, demande, dossier, tache, document et reporting.

## Prochaines validations terrain

1. Envoyer une demande publique reelle depuis le site.
2. Verifier son arrivee dans Supabase et le module Demandes.
3. La rattacher a un contact CRM.
4. Creer un dossier depuis cette demande.
5. Ajouter une tache, un document et une decision.
6. Controler que l'activite est tracee et exportable.