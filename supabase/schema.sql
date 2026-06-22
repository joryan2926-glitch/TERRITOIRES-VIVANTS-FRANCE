-- Territoires Vivants France - architecture Supabase préparatoire
-- Ce schéma est une base de travail. Il ne doit pas être exécuté en production sans revue sécurité, RLS et conformité RGPD.

create extension if not exists "pgcrypto";

create table if not exists territoires (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type_territoire text,
  parent_id uuid references territoires(id),
  code_insee text,
  code_postal text,
  region text,
  departement text,
  statut text default 'prefiguration',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  nom text,
  role text default 'citoyen',
  commune text,
  territoire_id uuid references territoires(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  user_id uuid references users(id),
  role text default 'citoyen',
  structure text,
  statut_validation text default 'a_verifier',
  territoire_id uuid references territoires(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists antennes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  territoire_id uuid references territoires(id),
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
  territoire_id uuid references territoires(id),
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
  territoire_id uuid references territoires(id),
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
  territoire_id uuid references territoires(id),
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

create table if not exists batiments_abandonnes (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  territoire_id uuid references territoires(id),
  region text,
  departement text,
  commune text,
  adresse text,
  latitude numeric,
  longitude numeric,
  ancien_usage text,
  etat text,
  description text,
  statut_validation text default 'a_verifier',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists materiaux (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  territoire_id uuid references territoires(id),
  type text not null,
  categorie text,
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

create table if not exists materiaux_photos (
  id uuid primary key default gen_random_uuid(),
  materiau_id uuid references materiaux(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  created_at timestamptz default now()
);

create table if not exists reservations_materiaux (
  id uuid primary key default gen_random_uuid(),
  materiau_id uuid references materiaux(id) on delete cascade,
  user_id uuid references users(id),
  statut text default 'demandee',
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists signalements (
  id uuid primary key default gen_random_uuid(),
  territoire_id uuid references territoires(id),
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

create table if not exists candidatures_antennes (
  id uuid primary key default gen_random_uuid(),
  territoire_id uuid references territoires(id),
  nom_contact text,
  email_contact text,
  commune text,
  equipe_resume text,
  motivations text,
  besoins text,
  statut text default 'recue',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists projets (
  id uuid primary key default gen_random_uuid(),
  antenne_id uuid references antennes(id),
  territoire_id uuid references territoires(id),
  titre text not null,
  type_projet text,
  commune text,
  description text,
  besoins text,
  statut text default 'idee',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists projet_etapes (
  id uuid primary key default gen_random_uuid(),
  projet_id uuid references projets(id) on delete cascade,
  etape text not null,
  statut text default 'a_faire',
  notes text,
  ordre integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists projet_documents (
  id uuid primary key default gen_random_uuid(),
  projet_id uuid references projets(id) on delete cascade,
  storage_path text not null,
  titre text,
  type_document text,
  created_at timestamptz default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  type_contribution text not null,
  user_id uuid references users(id),
  territoire_id uuid references territoires(id),
  payload jsonb default '{}'::jsonb,
  statut_validation text default 'a_moderer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace view dashboard_national as
select
  (select count(*) from signalements where statut_validation = 'valide') as signalements_valides,
  (select count(*) from materiaux where statut_validation = 'valide') as materiaux_valides,
  (select count(*) from projets where statut not in ('termine', 'archive')) as projets_en_cours,
  (select count(*) from territoires where statut = 'actif') as territoires_actifs,
  (select count(*) from antennes where statut = 'active') as antennes_actives;

create index if not exists territoires_nom_idx on territoires(nom);
create index if not exists logements_vacants_commune_idx on logements_vacants(commune);
create index if not exists commerces_fermes_commune_idx on commerces_fermes(commune);
create index if not exists friches_commune_idx on friches(commune);
create index if not exists batiments_abandonnes_commune_idx on batiments_abandonnes(commune);
create index if not exists materiaux_type_idx on materiaux(type);
create index if not exists materiaux_categorie_idx on materiaux(categorie);
create index if not exists signalements_type_idx on signalements(type_signalement);
create index if not exists projets_statut_idx on projets(statut);
