# TERRITOIRES VIVANTS FRANCE
## Checklist Resend, DNS, RGPD et formulaires

Ce document interne encadre la vérification des notifications automatiques et du traitement des demandes.

## 1. Configuration Resend

| Contrôle | Attendu | Vérification |
|---|---|---|
| Clé API | `RESEND_API_KEY` active dans Vercel | Effectuer un envoi de recette sans afficher la clé |
| Domaine expéditeur | `territoiresvivantsfrance.fr` vérifié dans Resend | Contrôler le statut du domaine dans le tableau de bord Resend |
| Expéditeur | `Territoires Vivants France <contact@territoiresvivantsfrance.fr>` | Vérifier `TVF_EMAIL_FROM` |
| Réponse | `contact@territoiresvivantsfrance.fr` | Vérifier `TVF_EMAIL_REPLY_TO` |
| Notification interne | Reçue par TVF | Envoyer un formulaire test |
| Confirmation demandeur | Reçue sur une adresse externe | Contrôler également les indésirables |

## 2. DNS et délivrabilité

Les enregistrements DNS doivent être repris exactement depuis la page de vérification du domaine Resend. Les valeurs ne doivent pas être inventées ni dupliquées.

| Point | Objectif | Action |
|---|---|---|
| MX Google Workspace | Réception des e-mails officiels | Conserver les enregistrements actifs |
| SPF | Autoriser les services d’envoi légitimes | Vérifier qu’un seul enregistrement SPF existe |
| DKIM Google | Authentifier les messages envoyés depuis Google Workspace | Vérifier dans la console Google |
| DKIM Resend | Authentifier les notifications du site | Publier les valeurs fournies par Resend |
| DMARC | Surveiller puis protéger le domaine | Commencer en observation avant durcissement |

## 3. RGPD

- collecter uniquement les données nécessaires au traitement de la demande ;
- informer la personne de la finalité et de ses droits ;
- limiter l’accès aux personnes habilitées ;
- conserver une trace des traitements et incidents ;
- permettre l’accès, la rectification et l’effacement lorsque le droit s’applique ;
- ne pas transmettre les données sans fondement juridique approprié.

## 4. Recette obligatoire

1. Envoyer un formulaire depuis le site public.
2. Vérifier la création de la demande dans Supabase et TVF OS.
3. Vérifier la notification reçue par TVF.
4. Vérifier l’accusé de réception reçu par le demandeur.
5. Contrôler le statut `Delivered` dans Resend.
6. Supprimer la demande de test ou la marquer comme recette technique.

## 5. Variables Vercel

- `RESEND_API_KEY`
- `TVF_EMAIL_FROM`
- `TVF_EMAIL_REPLY_TO`
- `TVF_NOTIFICATION_EMAIL`
- `TVF_OUTBOUND_TIMEOUT_MS`

Ne jamais placer la clé Resend dans le navigateur, le dépôt Git ou un document public.
