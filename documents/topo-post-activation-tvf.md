# Topo post-activation - TVF

## Ce qui a été fait

| Sujet | Statut | Détail |
|---|---|---|
| Domaine | OK | www.territoiresvivantsfrance.fr répond en production. |
| Formulaires | OK | L’API `/api/contact` accepte les POST et enregistre les demandes. |
| Supabase | OK côté formulaire | Les tests indiquent que les demandes sont enregistrées. |
| Brevo | OK | Après remplacement de la clé, notification interne et accusé de réception sont envoyés. |
| E-mail officiel | OK | contact@territoiresvivantsfrance.fr est utilisé comme adresse officielle. |
| Infos administratives | OK | RNA, SIREN, SIRET et APE ont été intégrés dans les pages administratives. |
| Documents | OK | Fiche identification SIRENE, kit matériaux, courriers, synthèses et plans sont disponibles. |

## Ce que je n’ai pas pu faire directement

| Sujet | Pourquoi | Comment le faire |
|---|---|---|
| Lire la boîte mail TVF | Je n’ai pas accès à la messagerie. | Vérifier manuellement la réception des tests dans contact@territoiresvivantsfrance.fr, y compris spam. |
| Nettoyer les tests dans Supabase | Il faut un accès admin Supabase ou back-office. | Ouvrir Supabase > table contacts > filtrer objet contenant TEST > passer statut archive/test ou supprimer uniquement si tu veux effacer les traces techniques. |
| Vérifier les logs Brevo détaillés | Il faut l’accès au compte Brevo. | Brevo > Transactionnel > Logs > chercher les objets TEST BREVO / TEST RECEPTION. |
| Vérifier les variables Vercel | Il faut l’accès au tableau de bord Vercel. | Vercel > Project > Settings > Environment Variables. |

## Vérifications à faire maintenant

1. Chercher dans la boîte `contact@territoiresvivantsfrance.fr` les derniers objets de test.
2. Dans Supabase, filtrer les demandes dont l’objet contient `TEST`.
3. Dans Brevo, confirmer le statut `delivered` des derniers tests.
4. Dans Vercel, vérifier :
   - `EMAIL_PROVIDER=brevo`
   - `BREVO_API_KEY` actif
   - `TVF_NOTIFICATION_EMAIL=contact@territoiresvivantsfrance.fr`
   - `TVF_EMAIL_REPLY_TO=contact@territoiresvivantsfrance.fr`
   - `TVF_EMAIL_FROM=Territoires Vivants France <contact@territoiresvivantsfrance.fr>`

## Prochaine action recommandée

Envoyer les premiers courriers à la Ville de Saint-Étienne, Saint-Étienne Métropole et EPASE pour obtenir un rendez-vous de cadrage autour du lancement local : local de stockage, matériaux, véhicule, insertion et financement de démarrage.
