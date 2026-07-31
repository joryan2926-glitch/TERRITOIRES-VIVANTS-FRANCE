# Controle production TVF OS

Date : 2026-07-31

## Synthese

- Variables locales chargees : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, TVF_EMAIL_FROM, TVF_EMAIL_REPLY_TO, TVF_NOTIFICATION_EMAIL, TVF_NOTIFICATION_BACKUP_EMAIL, TVF_OUTBOUND_TIMEOUT_MS, TVF_ADMIN_TOKEN, ADMIN_TOKEN, TVF_EMAIL_WEBHOOK_SECRET, RESEND_API_KEY
- Modules testes : 17
- Modules OK : 17
- Capacite de lecture reelle : 100 %
- Mode : lecture seule, aucune creation de donnee.
- Secrets : aucune valeur sensible n'est affichee.

## Resultat module par module

| Module | URL testee | Statut | Temps | Observation |
|---|---|---:|---:|---|
| Session admin | `/api/admin-session` | OK | 52 ms | Lecture valide |
| Tableau de bord | `/api/dashboard?range=30&status=all&priority=all&category=all` | OK | 1684 ms | Lecture valide |
| Demandes entrantes | `/api/admin-contacts?limit=5` | OK | 159 ms | Lecture valide |
| Contacts | `/api/admin-crm?entity=dashboard` | OK | 170 ms | Lecture valide |
| Boite mail | `/api/admin-emails?entity=dashboard` | OK | 91 ms | Lecture valide |
| Dossiers | `/api/admin-cases?entity=dashboard` | OK | 76 ms | Lecture valide |
| Taches | `/api/admin-work?entity=dashboard` | OK | 743 ms | Lecture valide |
| Documents | `/api/admin-documents?entity=dashboard` | OK | 147 ms | Lecture valide |
| Procedures | `/api/admin-procedures?entity=dashboard` | OK | 149 ms | Lecture valide |
| Cartographie | `/api/admin-map?entity=dashboard` | OK | 77 ms | Lecture valide |
| Observatoire | `/api/admin-observatoire?entity=dashboard` | OK | 80 ms | Lecture valide |
| Resultats | `/api/admin-impact?entity=dashboard` | OK | 73 ms | Lecture valide |
| Finances | `/api/admin-finances?entity=dashboard` | OK | 194 ms | Lecture valide |
| Utilisateurs / roles | `/api/admin-users?entity=dashboard` | OK | 116 ms | Lecture valide |
| Reglages | `/api/admin-settings?entity=dashboard` | OK | 103 ms | Lecture valide |
| Base interne | `/api/admin-knowledge?entity=dashboard` | OK | 163 ms | Lecture valide |
| Assistant | `/api/admin-ai?entity=dashboard` | OK | 159 ms | Lecture valide |

## Lecture operationnelle

Tous les modules controles repondent en lecture avec les variables locales et Supabase. TVF OS est pret pour les tests de parcours reels : formulaire, demande, dossier, tache, document et reporting.

## Prochaines validations terrain

1. Envoyer une demande publique reelle depuis le site.
2. Verifier son arrivee dans Supabase et le module Demandes.
3. La rattacher a un contact.
4. Creer un dossier depuis cette demande.
5. Ajouter une tache, un document et une decision.
6. Controler que l'activite est tracee et exportable.