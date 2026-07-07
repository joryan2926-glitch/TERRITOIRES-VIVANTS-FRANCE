# TERRITOIRES VIVANTS FRANCE
## Checklist Brevo, DNS, RGPD et formulaires

Cette checklist regroupe les vérifications à réaliser pour sécuriser les emails automatiques et le traitement des demandes.

---

## 1. Emails automatiques

| Point à vérifier | Statut | Comment vérifier |
|---|---|---|
| Email interne envoyé à TVF | À contrôler régulièrement | Faire un test formulaire et vérifier contact@territoiresvivantsfrance.fr |
| Email de confirmation envoyé au demandeur | À contrôler régulièrement | Utiliser une adresse test externe |
| Clé Brevo active | À vérifier dans Brevo | Paramètres SMTP / API |
| Adresse expéditrice validée | À vérifier dans Brevo | Expéditeurs et domaines |
| Réponse possible par email | À vérifier | Répondre depuis contact@territoiresvivantsfrance.fr |

---

## 2. DNS recommandés

À vérifier chez le gestionnaire DNS du domaine `territoiresvivantsfrance.fr`.

| Type | Objectif | Statut |
|---|---|---|
| MX Google Workspace | Réception des emails | En place selon vérification précédente |
| SPF Google | Autoriser l'envoi Google | En place selon vérification précédente |
| DKIM Google | Améliorer la délivrabilité | À vérifier |
| DKIM Brevo | Autoriser Brevo à envoyer pour le domaine | À configurer / vérifier |
| DMARC | Protéger le domaine contre l'usurpation | À configurer / vérifier |

---

## 3. Exemple DMARC de démarrage

À adapter selon le fournisseur DNS :

```txt
Nom : _dmarc
Type : TXT
Valeur : v=DMARC1; p=none; rua=mailto:contact@territoiresvivantsfrance.fr; fo=1
```

Ce réglage est volontairement progressif. Il permet d'observer les flux avant de passer à une politique plus stricte.

---

## 4. RGPD - principes à respecter

TVF doit respecter les principes suivants :

- collecter uniquement les données nécessaires ;
- informer clairement la personne de l'usage de ses données ;
- limiter l'accès interne aux seules personnes habilitées ;
- ne pas conserver les demandes inutilement ;
- permettre la suppression ou la rectification sur demande ;
- ne pas transmettre les données à des partenaires sans base légitime ou accord.

---

## 5. Durées de conservation recommandées

| Donnée | Durée recommandée |
|---|---|
| Demande générale sans suite | 12 mois |
| Demande de partenariat non retenue | 24 mois |
| Dossier de projet en cours | Durée du projet + 5 ans |
| Convention signée | Durée légale ou contractuelle applicable |
| Données bénévoles | Durée d'engagement + 3 ans |
| Données de prospection | 3 ans maximum après dernier contact |

---

## 6. Message RGPD court à utiliser dans les formulaires

Les informations transmises sont utilisées par TERRITOIRES VIVANTS FRANCE pour traiter votre demande et vous recontacter. Elles ne sont pas revendues. Vous pouvez demander l'accès, la rectification ou la suppression de vos données à l'adresse contact@territoiresvivantsfrance.fr.


## 7. Verification DNS realisee le 07/07/2026

| Controle | Resultat observe | Suite a donner |
|---|---|---|
| MX Google Workspace | OK : aspmx.l.google.com et serveurs alternatifs visibles | Rien a corriger |
| SPF racine | OK : `v=spf1 include:_spf.google.com ~all` visible | Ajouter Brevo au SPF uniquement si Brevo le demande explicitement |
| Verification Brevo | OK : `brevo-code:...` visible | Rien a corriger |
| DMARC | OK : `_dmarc` publie avec `p=none` | Garder en observation puis durcir plus tard si besoin |
| DKIM Brevo | OK : `brevo1._domainkey` et `brevo2._domainkey` visibles | Rien a corriger cote Brevo |
| DKIM Google | Non visible avec le selecteur `google._domainkey` | A verifier dans Google Workspace si l'envoi Gmail officiel est utilise |

## 8. Conclusion email

La chaine Brevo fonctionne en production : les tests de formulaires ont ete recus sur `contact@territoiresvivantsfrance.fr` et les confirmations ont ete envoyees. Le dernier point de confort consiste a verifier DKIM Google dans l'administration Google Workspace si TVF envoie aussi des emails directement depuis Gmail.
