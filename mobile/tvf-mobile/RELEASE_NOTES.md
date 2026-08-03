# TVF Mobile - Notes de version

## 0.1.1 - Raccordement notifications TVF

Date de mise a jour : 03/08/2026
Statut : preversion terrain mise a jour

### Objectif de la version

Cette version conserve le fonctionnement hors Play Store avec Expo Go ou APK interne, tout en ajoutant le raccordement de notification e-mail via l'API contact du site TVF.

### Evolutions principales

- Envoi des demandes mobile vers TVF OS maintenu via Supabase.
- Notification e-mail declenchee via l'API officielle du site lorsque `EXPO_PUBLIC_TVF_CONTACT_API_URL` est configuree.
- Adresse publique conservee : contact@territoiresvivantsfrance.fr.
- Notification interne routee cote serveur vers Gmail selon la configuration Resend.
- Aucune cle Resend ni cle service Supabase n'est exposee dans l'application mobile.
- Profils EAS development, preview et production prepares avec l'URL publique de l'API contact.

### Validation recommandee

Tester un signalement reel depuis Expo Go ou APK interne, verifier sa presence dans TVF OS, puis confirmer la reception de la notification sur la boite Gmail interne.

## 0.1.0 - Production candidate terrain

Date de validation terrain : 21/07/2026
Statut : production candidate

### Objectif de la version

Cette version sert a tester et diffuser TVF Mobile dans un cadre maitrise avant publication publique. Elle permet de creer des demandes terrain structurées et de les transmettre vers TVF OS.

### Fonctionnalites disponibles

- Signalement de lieu vacant, commerce ferme, batiment inutilise, friche, terrain ou depot.
- Proposition de materiaux ou equipements reutilisables.
- Proposition de bien dormant pour une premiere etude TVF.
- Candidature benevole.
- Ajout de photo depuis camera ou galerie.
- Localisation GPS ou adresse manuelle.
- Generation d'une reference TVF.
- Ticket de suivi apres envoi.
- Historique local des demandes.
- Renvoi d'une demande si la transmission echoue.
- Acces aux canaux officiels TVF : telephone, e-mail, WhatsApp, Instagram, Facebook.
- Documents de preparation par type de besoin.

### Validations realisees

- Controle projet mobile : OK.
- Controle production mobile : OK.
- Test Supabase mobile : OK.
- Recette utilisateur sur telephone : OK selon retour du 21/07/2026.
- Remontee vers TVF OS : validee cote usage.

### Limites connues

- Publication Play Store / App Store non lancee.
- Captures officielles store encore a produire.
- Politique de confidentialite mobile a publier sur une URL publique avant diffusion publique.
- Questionnaire securite des donnees a finaliser dans les stores.
- Validation RGPD finale a effectuer avant publication large.

### Decision recommandee

Utiliser cette version en test interne ou en diffusion limitee. Passer au build production uniquement apres validation des captures, de la politique publique et des comptes developpeur.
