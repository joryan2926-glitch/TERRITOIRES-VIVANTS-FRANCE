-- Territoires Vivants France - architecture Supabase préparatoire
-- Ce schéma est une base de travail. Il ne doit pas être exécuté en production sans revue sécurité, RLS et conformité RGPD.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  nom text,
  role text default 'visiteur',
  commune text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists antennes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  territoire text,
  presentation text,
  responsable_id uuid references users(id),
  projets_resume text,
  besoins text,
  benevoles_recherches text,
  statut text default 'prefiguration',
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists logements_vacants (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  region text,
  departement text,
  commune text,
  adresse text,
  latitude numeric,
  longitude numeric,
  etat text,
  description text,
  statut_validation text default 'a_verifier',
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists commerces_fermes (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  region text,
  departement text,
  commune text,
  adresse text,
  latitude numeric,
  longitude numeric,
  ancien_usage text,
  surface_estimee text,
  description text,
  statut_validation text default 'a_verifier',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists friches (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  region text,
  departement text,
  commune text,
  adresse text,
  latitude numeric,
  longitude numeric,
  type_friche text,
  potentiel_usage text,
  description text,
  statut_validation text default 'a_verifier',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists materiaux (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  type text not null,
  quantite text,
  etat text,
  localisation text,
  latitude numeric,
  longitude numeric,
  photo_url text,
  disponibilite text default 'a_verifier',
  statut_validation text default 'a_verifier',
  contact_source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists signalements (
  id uuid primary key default gen_random_uuid(),
  type_signalement text not null,
  adresse text,
  commune text,
  latitude numeric,
  longitude numeric,
  description text,
  photo_url text,
  contact_facultatif text,
  statut_validation text default 'a_moderer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists partenaires (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text,
  territoire text,
  contact text,
  intention text,
  statut text default 'prospect',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists benevoles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  territoire text,
  competences text,
  disponibilites text,
  statut text default 'interesse',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists projets (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  titre text not null,
  type_projet text,
  commune text,
  description text,
  besoins text,
  statut text default 'preparation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists logements_vacants_commune_idx on logements_vacants(commune);
create index if not exists commerces_fermes_commune_idx on commerces_fermes(commune);
create index if not exists friches_commune_idx on friches(commune);
create index if not exists materiaux_type_idx on materiaux(type);
create index if not exists signalements_type_idx on signalements(type_signalement);
