# Architecture Supabase - Territoires Vivants France

Cette architecture prépare les phases 3 à 7 de la plateforme collaborative. Elle n'est pas connectée à des données réelles tant que les variables Supabase ne sont pas configurées dans Vercel.

## Tables prévues

- `users` : profils utilisateurs et rôles applicatifs.
- `user_profiles` : extension des comptes Supabase Auth avec rôle, structure et territoire.
- `territoires` : Métropole, territoires ultramarins, régions, départements ou antennes futures.
- `antennes` : fiches d'antennes locales.
- `logements_vacants` : biens d'habitat repérés ou qualifiés.
- `commerces_fermes` : locaux commerciaux sans activité.
- `friches` : friches, terrains vacants et espaces abandonnés.
- `batiments_abandonnes` : bâtiments signalés ou qualifiés hors logements/commerces.
- `materiaux` : matériaux disponibles, état, quantité, localisation et disponibilité.
- `materiaux_photos` : métadonnées des photos stockées dans Supabase Storage.
- `reservations_materiaux` : demandes de réservation et suivi des disponibilités.
- `signalements` : dépôts citoyens à modérer.
- `partenaires` : collectivités, associations, entreprises, bailleurs, écoles et universités.
- `benevoles` : disponibilités, compétences et rattachement territorial.
- `candidatures_antennes` : demandes de création d'antennes locales.
- `projets` : projets TVF en préparation, en cours ou clôturés.
- `projet_etapes` : pipeline idée, étude, mobilisation, financement, réalisation, terminé.
- `projet_documents` : documents rattachés aux projets.
- `contributions` : table tampon pour formulaires transversaux à modérer.
- `biens_candidats` : biens proposés au programme Bien Solidaire à Usage Partagé, avec confidentialité et validation.
- `projets_financement` : projets proposés au fonds, budgets prévisionnels et états d'avancement.
- `investisseurs` : citoyens, entreprises, fondations ou investisseurs à impact intéressés.
- `mecenes` : mécènes financiers, matériels, immobiliers ou de compétences.
- `contributions` : contributions affectées aux projets ou au fonds.
- `impact_projets` : indicateurs d'impact vérifiés par projet financé.
- `documents` : PDF, études, guides et fiches techniques envoyés via Storage.
- `actualites` : contenus publiables après validation.
- `activity_log` : journal d'activité des contributions et validations administrateur.

## Vues prévues

- `dashboard_national` : agrégation publique des lignes validées pour le tableau de bord.

## Phase 7 bêta

- Les pages bêta utilisent `beta-supabase.js` et les fonctions Vercel dans `api/`.
- Les écritures applicatives passent par les endpoints serveur et nécessitent une session Supabase.
- Les uploads utilisent les buckets Storage `signalements`, `materiaux` et `documents`.
- Les routes publiques `/signalements`, `/materiaux`, `/projets`, `/territoires`, `/biens-candidats`, `/investisseurs` et `/mecenes` sont réécrites par `vercel.json` vers une seule fonction dynamique `/api/[resource].js`.
- L'administration nécessite un profil `user_profiles.role = 'administrateur'` et permet la validation des signalements, matériaux, partenaires, antennes, biens candidats, projets, projets de financement, investisseurs et mécènes.

## Principes

- Aucune donnée signalée ne doit être publiée sans validation humaine.
- Les photos doivent être stockées dans Supabase Storage ou un service équivalent.
- Les indicateurs publics doivent utiliser uniquement les lignes validées.
- Les politiques RLS devront être définies avant toute ouverture publique.
- Les contacts personnels doivent être minimisés et protégés.
- Les rôles prévus sont `citoyen`, `benevole`, `entreprise`, `collectivite` et `administrateur`.
- La carte et l'observatoire temps réel devront filtrer les données selon le statut de validation et les droits d'accès.

## Fichier SQL

Le fichier `supabase/schema.sql` propose une base de départ à relire avant exécution dans Supabase.
