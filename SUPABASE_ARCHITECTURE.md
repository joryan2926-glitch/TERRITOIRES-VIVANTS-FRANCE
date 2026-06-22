# Architecture Supabase - Territoires Vivants France

Cette architecture prépare la phase 3 de la plateforme collaborative. Elle n'est pas connectée au site statique actuel et ne contient aucune donnée réelle.

## Tables prévues

- `users` : profils utilisateurs et rôles applicatifs.
- `antennes` : fiches d'antennes locales.
- `logements_vacants` : biens d'habitat repérés ou qualifiés.
- `commerces_fermes` : locaux commerciaux sans activité.
- `friches` : friches, terrains vacants et espaces abandonnés.
- `materiaux` : matériaux disponibles, état, quantité, localisation et disponibilité.
- `signalements` : dépôts citoyens à modérer.
- `partenaires` : collectivités, associations, entreprises, bailleurs, écoles et universités.
- `benevoles` : disponibilités, compétences et rattachement territorial.
- `projets` : projets TVF en préparation, en cours ou clôturés.

## Principes

- Aucune donnée signalée ne doit être publiée sans validation humaine.
- Les photos doivent être stockées dans Supabase Storage ou un service équivalent.
- Les indicateurs publics doivent utiliser uniquement les lignes validées.
- Les politiques RLS devront être définies avant toute ouverture publique.
- Les contacts personnels doivent être minimisés et protégés.

## Fichier SQL

Le fichier `supabase/schema.sql` propose une base de départ à relire avant exécution dans Supabase.
