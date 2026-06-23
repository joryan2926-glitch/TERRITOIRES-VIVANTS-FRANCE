# Territoires-Vivants-France

Site vitrine de TERRITOIRES VIVANTS FRANCE, association nationale en création pour la revitalisation des territoires.

## Pages

- Accueil
- Qui sommes-nous ?
- Nos actions
  - Notre méthode
  - Comment financer les projets
  - Vision France 2035
  - Logements vacants
  - Commerces inoccupés
  - Matériaux de réemploi
  - Espaces abandonnés
  - Solidarité & Insertion
  - Antennes locales
  - Observatoire du patrimoine vacant
  - Observatoire national du patrimoine vacant
  - Banque de matériaux
  - Proposer des matériaux
  - Nos projets pilotes
  - Impact & résultats
  - Tableau de bord
  - Carte des territoires
  - Signalement citoyen
  - Antennes locales
  - Architecture Supabase
  - Ressources
  - Publications & études
  - Centre de ressources
  - Observatoire national avancé
  - Mesure d'impact
  - Espace presse
  - Gouvernance
  - FAQ générale
  - Vision 2035
  - Devenir antenne locale
  - Association nationale
  - Partenariats stratégiques
  - Transparence
  - Plateforme opérationnelle
  - Carte interactive nationale
  - Banque de matériaux collaborative
  - Tableau de bord national
  - Comptes utilisateurs
  - Formulaires Supabase
  - Espace projet
  - Observatoire temps réel
  - TVF Mobile
  - Feuille de route 2026-2035
  - Architecture multi-territoires
  - Plateforme bêta
  - Authentification
  - Carte connectée
  - Matériaux réels
  - Admin bêta
  - Centre documentaire bêta
  - API publique
  - Bien Solidaire à Usage Partagé
  - Proposer un bien
  - Carte des biens candidats
  - Projets réalisés Bien Solidaire
  - Devenir propriétaire partenaire
  - Fonds Territoires Vivants Investissement Solidaire
  - Devenir investisseur solidaire
  - Devenir mécène
  - Projets à financer
  - Impact investisseurs
- Nos 5 pôles
  - Habitat Vivant
  - Matériauthèque Solidaire
  - Solidarité & Insertion
  - Friches & Terrains Vivants
  - Observatoire du patrimoine vacant
- Agir avec nous
  - Devenir bénévole
  - Devenir adhérent
  - Faire un don
  - Devenir partenaire
  - Créer une antenne locale
  - Espace collectivités
  - Espace entreprises
  - Espace bénévoles
  - Espace adhérents
  - Espace partenaires
  - Recrutement
- Nos statuts
- Contact
- Mentions légales

## Phase 5

La phase 5 crédibilise la dimension nationale :

- publications et études, centre de ressources et espace presse préparés sans faux documents ;
- observatoire national avancé avec carte, fiches territoires et préparation Supabase ;
- projets pilotes structurés pour Saint-Étienne, Martinique, Guadeloupe, Réunion et Guyane ;
- parcours "Devenir antenne locale" et préparation de l'association nationale ;
- pages dédiées aux partenariats stratégiques : collectivités, entreprises, associations, écoles, universités, bailleurs et fondations ;
- mesure d'impact avec indicateurs prêts à renseigner, sans chiffres fictifs ;
- gouvernance, transparence et organisation nationale en structuration.

## Phase 6

La phase 6 prépare le passage du site vitrine à une plateforme opérationnelle :

- hub `plateforme-operationnelle.html` pour centraliser les outils ;
- carte interactive nationale avec signalement préparé pour Supabase ;
- banque de matériaux collaborative avec filtres et modèle de fiche ;
- tableau de bord national sans chiffres fictifs ;
- comptes utilisateurs et rôles : citoyen, bénévole, entreprise, collectivité, administrateur ;
- formulaires prêts à connecter : matériaux, lieu vacant, bénévole, partenaire, antenne locale ;
- espace projet avec pipeline idée, étude, mobilisation, financement, réalisation, terminé ;
- observatoire temps réel, TVF Mobile, feuille de route 2026-2035 et architecture multi-territoires ;
- schéma `supabase/schema.sql` enrichi pour les tables, photos, réservations, projets et vue dashboard.

## Phase 7

La phase 7 active une bêta connectable à Supabase :

- authentification Supabase : inscription, connexion, mot de passe oublié et profil ;
- rôles : citoyen, bénévole, entreprise, collectivité, administrateur ;
- fonctions API Vercel pour `/signalements`, `/materiaux`, `/projets`, `/territoires` ;
- carte connectée avec dépôt de signalements en base ;
- banque de matériaux avec upload photo via Supabase Storage ;
- tableau de bord administrateur pour validation ;
- espaces collectivités, entreprises et centre documentaire ;
- statistiques automatiques via la vue `dashboard_national`.

## Programme Bien Solidaire à Usage Partagé

Dispositif stratégique ajouté au site :

- page programme dédiée ;
- FAQ dédiée ;
- formulaire "Proposer un bien" ;
- carte préparatoire des biens candidats ;
- page "Projets réalisés" sans projet fictif ;
- parcours "Devenir propriétaire partenaire".

Le programme est intégré dans Nos Actions, Habitat Vivant, Plateforme Opérationnelle, Espace Collectivités et Espace Entreprises.

## Fonds Territoires Vivants Investissement Solidaire

Programme national préparé pour mobiliser citoyens, entreprises, fondations, mécènes et investisseurs à impact :

- page de présentation du fonds ;
- parcours investisseur solidaire ;
- parcours mécène et entreprise ;
- espace projets à financer sans projet fictif ;
- mesure d'impact investisseurs sans chiffres fictifs ;
- tables préparatoires `projets_financement`, `investisseurs`, `mecenes`, `contributions` et `impact_projets`.

## Activation opérationnelle Supabase

La plateforme bêta dispose maintenant des endpoints réels pour :

- les signalements, matériaux, projets, territoires et documents ;
- les biens candidats du programme Bien Solidaire à Usage Partagé ;
- les demandes investisseur solidaire et mécénat ;
- le tableau de bord administrateur et le journal d'activité.

Les buckets Storage attendus sont `signalements`, `materiaux` et `documents`. Les tables et politiques RLS sont décrites dans `supabase/schema.sql`.

Variables Vercel nécessaires :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Phase 2

La phase 2 prépare une plateforme nationale évolutive autour de la carte des territoires, du signalement citoyen, des espaces bénévoles/adhérents/partenaires, des ressources, de la transparence et de la vision 2035.

Les pages restent statiques à ce stade. Les formulaires, cartes, documents et espaces membres sont préparés pour une future connexion à Supabase, sans stockage ni authentification active dans cette version.

## Phase 3

La phase 3 prépare la plateforme collaborative :

- observatoire national filtrable par région, département, commune et type de bien ;
- banque nationale de matériaux avec fiches structurées ;
- signalement de lieux avec photo, adresse, géolocalisation et description ;
- proposition de matériaux avec type, quantité, état, localisation et photo ;
- carte interactive, tableau de bord, fiches d'antennes locales ;
- espaces collectivités et entreprises enrichis pour les dépôts de projets, diagnostics, mécénat et mise à disposition de locaux ;
- architecture Supabase documentée dans `SUPABASE_ARCHITECTURE.md` et `supabase/schema.sql`.

## Phase 4

La phase 4 professionnalise le contenu :

- enrichissement des cinq pôles avec problèmes, objectifs, méthode, résultats attendus, exemples de projets et FAQ ;
- création des pages `notre-methode.html`, `financer-projets.html` et `vision-france-2035.html` ;
- ajout d'une section "Rejoindre le mouvement" pour les bénévoles, collectivités, entreprises, artisans, architectes, urbanistes, associations et habitants.

## Déploiement

Le site est statique et peut être déployé sur Vercel depuis la branche `main`.

Voir `DEPLOIEMENT.md` pour les points à compléter avant mise en production définitive.
