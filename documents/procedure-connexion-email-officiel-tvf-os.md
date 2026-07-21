# Procedure - Connexion de l'e-mail officiel a TVF OS

## Objectif

Centraliser les messages recus sur `contact@territoiresvivantsfrance.fr` dans TVF OS afin qu'ils deviennent des demandes exploitables : qualification, dossier, pieces, reponse et suivi.

## Principe de fonctionnement

1. Un interlocuteur ecrit a `contact@territoiresvivantsfrance.fr`.
2. Le fournisseur e-mail ou un relais technique transmet le contenu a TVF OS.
3. TVF OS cree une entree dans le module E-mails.
4. Le message peut etre automatiquement converti en demande entrante.
5. La demande est ensuite traitee dans le module Demandes : categorie, statut, priorite, responsable, dossier et reponse.

## Configuration requise

| Element | Role | Statut attendu |
| --- | --- | --- |
| `contact@territoiresvivantsfrance.fr` | Adresse officielle de reception | Active |
| `TVF_EMAIL_WEBHOOK_SECRET` | Secret de protection du webhook e-mail | A creer dans Vercel et `.env` local |
| `SUPABASE_URL` | Base TVF OS | Deja configuree |
| `SUPABASE_SERVICE_ROLE_KEY` | Ecriture serveur TVF OS | Deja configuree cote serveur uniquement |
| `/api/admin/emails` | Endpoint existant TVF OS | Ne cree pas de fonction Vercel supplementaire |

## Payload attendu par le webhook

```json
{
  "type": "email_to_request",
  "provider": "brevo-ou-relais-mail",
  "from_email": "interlocuteur@example.fr",
  "from_name": "Nom de l'interlocuteur",
  "to_email": "contact@territoiresvivantsfrance.fr",
  "subject": "Objet du message",
  "body_text": "Contenu texte du message"
}
```

Le secret peut etre transmis par l'en-tete `x-tvf-email-secret` ou par le parametre `webhook_secret`.

## Test local

Apres avoir ajoute `TVF_EMAIL_WEBHOOK_SECRET` dans `.env` :

```bash
npm run test:email-webhook
```

Le test cree un e-mail technique, le convertit en demande entrante, puis supprime automatiquement l'e-mail et la demande de test.

## Regles d'exploitation

- Ne jamais exposer `TVF_EMAIL_WEBHOOK_SECRET` sur le site public ou dans TVF Mobile.
- Ne pas envoyer de cle Supabase au fournisseur e-mail.
- Conserver l'adresse officielle `contact@territoiresvivantsfrance.fr` dans les courriers, formulaires et reponses.
- Verifier chaque matin les nouvelles demandes dans TVF OS.
- Convertir uniquement les e-mails utiles en dossiers d'instruction.
- Archiver les messages sans suite apres qualification.

## Resultat attendu

TVF OS devient le point d'entree unique : site public, e-mail officiel et TVF Mobile alimentent la meme file de demandes a traiter.