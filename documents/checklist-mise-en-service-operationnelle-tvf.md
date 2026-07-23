# Checklist de mise en service opérationnelle TVF

Document interne de contrôle avant lancement terrain. Il sert à vérifier que le site public, TVF OS, les formulaires, Supabase, Brevo, TVF Mobile et les documents internes sont cohérents avant réception de demandes réelles.

## 1. Décision de mise en service

| Domaine | Statut attendu | Contrôle |
|---|---:|---|
| Site public | Prêt | Les pages principales sont accessibles, lisibles et sans liens bloquants. |
| Formulaires | Prêt | Chaque formulaire enregistre une demande et déclenche les e-mails attendus. |
| TVF OS | Prêt | Une demande peut être reçue, qualifiée, transformée en dossier et suivie. |
| TVF Mobile | Prêt terrain | Une demande mobile arrive dans le même flux que les demandes du site. |
| Documents internes | Prêt interne | Les modèles sont rangés dans TVF OS et utilisables sans publication publique. |
| Supabase | À contrôler en production | Tables, RLS, migrations et Storage doivent être vérifiés dans le tableau de bord Supabase. |
| Brevo | À contrôler en production | Expéditeur, domaine, DKIM/SPF et accusés de réception doivent rester actifs. |

## 2. Variables indispensables

| Variable | Usage | Emplacement |
|---|---|---|
| `SUPABASE_URL` | Connexion base de données | Vercel et environnement local sécurisé |
| `SUPABASE_SERVICE_ROLE_KEY` | Lecture/écriture serveur | Vercel uniquement |
| `BREVO_API_KEY` | Notifications e-mail | Vercel uniquement |
| `TVF_NOTIFICATION_EMAIL` | Réception interne | `contact@territoiresvivantsfrance.fr` |
| `TVF_EMAIL_REPLY_TO` | Adresse de réponse | `contact@territoiresvivantsfrance.fr` |
| `TVF_EMAIL_FROM` | Expéditeur vérifié | Domaine TVF validé dans Brevo |
| `TVF_ADMIN_TOKEN` | Accès TVF OS | Vercel uniquement, non partagé |

## 3. Parcours utilisateur à tester

### Demande depuis le site

1. Ouvrir une page publique contenant un formulaire.
2. Envoyer une demande avec nom, e-mail, téléphone, commune, sujet et message.
3. Vérifier l'enregistrement dans Supabase.
4. Vérifier la notification reçue par TVF.
5. Vérifier l'accusé de réception reçu par l'utilisateur.
6. Ouvrir TVF OS.
7. Retrouver la demande dans les demandes reçues.
8. Qualifier la demande : catégorie, priorité, statut.
9. Créer ou rattacher le contact.
10. Transformer la demande en dossier.
11. Ajouter une note d'instruction.
12. Joindre ou générer un document utile.
13. Préparer une réponse.
14. Marquer l'étape suivante.

### Demande depuis TVF Mobile

1. Ouvrir TVF Mobile dans Expo Go ou sur build de test.
2. Créer une demande terrain.
3. Vérifier l'enregistrement Supabase dans la table mobile prévue.
4. Vérifier la remontée ou le rattachement dans TVF OS.
5. Qualifier la demande comme une demande site.

### Demande externe par e-mail

1. Recevoir un e-mail à `contact@territoiresvivantsfrance.fr`.
2. Créer manuellement un dossier dans TVF OS si la demande ne vient pas du site.
3. Renseigner l'interlocuteur, la catégorie, le besoin et la priorité.
4. Déposer les pièces reçues dans le dossier.
5. Lancer l'instruction.

## 4. Contrôles Supabase

Exécuter ou vérifier dans Supabase SQL Editor :

| Fichier | Objectif |
|---|---|
| `supabase/contacts-operational-upgrade.sql` | Colonnes de pilotage des demandes reçues. |
| `supabase/tvf-os-mvp-install-complet.sql` | Socle TVF OS. |
| `supabase/tvf-os-modules-restants-install.sql` | Modules complémentaires. |
| `supabase/tvf-os-documents.sql` | Bibliothèque interne de documents. |
| `supabase/tvf-mobile-requests.sql` | Réception des demandes TVF Mobile. |
| `supabase/verify-tvf-mobile-requests.sql` | Vérification de la partie mobile. |

Point de vigilance : ne jamais coller de clé service role dans le navigateur, dans le site public ou dans un document partagé.

## 5. Contrôles Vercel

| Contrôle | Résultat attendu |
|---|---|
| Build Vercel | Déploiement sans erreur. |
| Domaine | `territoiresvivantsfrance.fr` accessible en HTTPS. |
| `/api/contact` | Enregistre la demande et déclenche l'e-mail. |
| `/api/admin-session` | Protège l'accès TVF OS. |
| `/api/admin-contacts` | Lit et met à jour les demandes. |
| `/api/dashboard` | Retourne les indicateurs sans erreur serveur. |

## 6. Contrôles locaux

Commandes à lancer avant validation :

```bash
npm run check:operational
npm run check
```

La première commande vérifie que les fichiers, scripts, guides, migrations et modules attendus existent dans le dépôt. La seconde lance la batterie complète déjà prévue.

## 7. Points qui restent externes au code

| Sujet | Pourquoi ce n'est pas automatisable |
|---|---|
| Validation juridique des conventions | Nécessite une relecture par une personne compétente. |
| Mentions légales définitives | Dépendent des informations administratives finales. |
| Politique RGPD finale | Dépend des traitements réellement retenus et de leur durée de conservation. |
| DNS e-mail | Se vérifie dans Brevo, le registrar et Vercel. |
| Données réelles | Ne doivent pas être inventées ; elles arrivent avec les premières demandes. |
| Rôles multi-utilisateurs avancés | À ouvrir quand plusieurs personnes utiliseront TVF OS. |

## 8. Feu vert opérationnel

TVF peut recevoir les premières demandes réelles lorsque :

- les formulaires site, mobile et création manuelle de dossier fonctionnent ;
- TVF reçoit les notifications sur `contact@territoiresvivantsfrance.fr` ;
- l'utilisateur reçoit un accusé de réception ;
- une demande peut être transformée en dossier dans TVF OS ;
- les documents internes sont accessibles depuis TVF OS ;
- les données sensibles ne sont pas exposées publiquement ;
- les informations juridiques affichées sont cohérentes avec les éléments officiels disponibles.

## 9. Suivi après lancement

Chaque semaine au démarrage :

| Action | Responsable | Trace attendue |
|---|---|---|
| Vérifier les demandes non traitées | TVF | Liste des dossiers à relancer |
| Vérifier les e-mails envoyés | TVF | Journal ou historique Brevo |
| Vérifier les erreurs Vercel | TVF | Logs sans erreur récurrente |
| Contrôler les dossiers incomplets | TVF | Pièces manquantes identifiées |
| Mettre à jour les documents | TVF | Version datée et archivée |