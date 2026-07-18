# Maquettes fonctionnelles - TVF Mobile V1

**Territoires Vivants France**  
**Application : TVF Mobile**  
**Version : V1 - Prototype avant développement**  
**Date : juillet 2026**

---

## 1. Objectif des maquettes

Ces maquettes servent à valider l'expérience utilisateur de TVF Mobile avant de développer l'application en Expo / React Native.

L'objectif est de garder une application :

- simple à comprendre ;
- rapide à utiliser sur le terrain ;
- cohérente avec TVF OS ;
- capable de créer des demandes exploitables ;
- adaptée aux citoyens, propriétaires, entreprises et bénévoles.

TVF Mobile ne remplace pas TVF OS. L'application mobile collecte l'information ; TVF OS qualifie, instruit, classe et répond.

---

## 2. Écrans prévus

### 2.1 Accueil

Rôle : orienter immédiatement l'utilisateur vers l'action utile.

Actions visibles :

- signaler un lieu ;
- proposer des matériaux ;
- proposer un bien ;
- devenir bénévole ;
- suivre ma demande.

### 2.2 Choix du signalement

Rôle : qualifier rapidement la situation observée.

Catégories :

- logement ;
- commerce ;
- bâtiment ;
- friche ;
- dépôt sauvage ;
- autre situation.

### 2.3 Photo et localisation

Rôle : rendre le signalement exploitable.

Champs :

- photo ;
- localisation ou adresse ;
- description courte.

### 2.4 Proposer des matériaux

Rôle : permettre à un particulier ou une entreprise de signaler une ressource.

Champs :

- catégorie ;
- quantité ;
- état ;
- photos ;
- localisation ;
- disponibilité.

### 2.5 Proposer un bien

Rôle : permettre à un propriétaire de présenter un bien dormant.

Champs :

- type de bien ;
- adresse ;
- état général ;
- objectif recherché ;
- photos ;
- demande de rendez-vous.

### 2.6 Suivi de demande

Rôle : éviter que l'utilisateur reste sans nouvelle.

Fonctions :

- recherche par e-mail ou numéro TVF ;
- statut ;
- demande à compléter ;
- lien de complément.

### 2.7 Documents utiles

Rôle : préparer les dossiers sans surcharger l'application.

Documents prioritaires :

- liste des pièces à fournir particuliers ;
- brochure propriétaires ;
- brochure matériaux ;
- fiche contact TVF.

### 2.8 Contact rapide

Rôle : permettre de joindre TVF simplement.

Canaux :

- WhatsApp ;
- e-mail ;
- téléphone ;
- adresse du siège.

---

## 3. Parcours cible

1. L'utilisateur choisit une action.
2. Il renseigne uniquement les informations essentielles.
3. Il ajoute une photo si nécessaire.
4. Il confirme la localisation.
5. Il transmet la demande.
6. Supabase enregistre la demande.
7. TVF OS la reçoit.
8. TVF qualifie la demande.
9. L'utilisateur reçoit une réponse ou une demande de complément.

---

## 4. Règles UX à respecter

- Un écran ne doit pas contenir trop de champs.
- Les actions principales doivent être visibles dès l'accueil.
- Le vocabulaire doit rester simple.
- Chaque demande doit rappeler qu'elle est soumise à étude.
- Les photos et la géolocalisation doivent être expliquées avant envoi.
- Les statuts doivent être identiques entre TVF Mobile et TVF OS.

---

## 5. Suite logique

Après validation de ces maquettes :

1. créer le projet Expo / React Native ;
2. mettre en place la navigation ;
3. créer les écrans statiques ;
4. connecter Supabase ;
5. ajouter photo et géolocalisation ;
6. connecter TVF OS ;
7. tester les parcours ;
8. préparer l'icône et le splash screen.

