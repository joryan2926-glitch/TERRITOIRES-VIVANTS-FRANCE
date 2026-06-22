# Architecture Supabase - Territoires Vivants France

Cette architecture prépare les phases 3 à 6 de la plateforme collaborative. Elle n'est pas connectée au site statique actuel et ne contient aucune donnée réelle.

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

## Vues prévues

- `dashboard_national` : agrégation publique des lignes validées pour le tableau de bord.

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
