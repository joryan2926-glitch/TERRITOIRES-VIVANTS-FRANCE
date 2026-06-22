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
  auth_user_id uuid unique,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  created_by uuid,
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
  statut_validation text default 'a_moderer',
  created_by uuid,
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

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  type_document text,
  territoire text,
  description text,
  storage_path text,
  statut_validation text default 'a_moderer',
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists actualites (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  slug text unique,
  resume text,
  contenu text,
  image_url text,
  statut text default 'brouillon',
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace view dashboard_national as
select
  (select count(*) from signalements where statut_validation = 'valide') as signalements_valides,
  (select count(*) from materiaux where statut_validation = 'valide' and disponibilite = 'disponible') as materiaux_valides,
  (select count(*) from projets where statut not in ('termine', 'archive') and statut_validation = 'valide') as projets_en_cours,
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
create index if not exists documents_type_idx on documents(type_document);
create index if not exists actualites_slug_idx on actualites(slug);

alter table user_profiles enable row level security;
alter table signalements enable row level security;
alter table materiaux enable row level security;
alter table projets enable row level security;
alter table territoires enable row level security;
alter table antennes enable row level security;
alter table partenaires enable row level security;
alter table documents enable row level security;
alter table actualites enable row level security;

drop policy if exists "user_profiles_own_select" on user_profiles;
create policy "user_profiles_own_select" on user_profiles for select to authenticated using (auth_user_id = auth.uid());
drop policy if exists "user_profiles_own_insert" on user_profiles;
create policy "user_profiles_own_insert" on user_profiles for insert to authenticated with check (auth_user_id = auth.uid());
drop policy if exists "user_profiles_own_update" on user_profiles;
create policy "user_profiles_own_update" on user_profiles for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

drop policy if exists "public_signalements_valides" on signalements;
create policy "public_signalements_valides" on signalements for select using (statut_validation = 'valide');
drop policy if exists "authenticated_signalements_insert" on signalements;
create policy "authenticated_signalements_insert" on signalements for insert to authenticated with check (true);

drop policy if exists "public_materiaux_valides" on materiaux;
create policy "public_materiaux_valides" on materiaux for select using (statut_validation = 'valide');
drop policy if exists "authenticated_materiaux_insert" on materiaux;
create policy "authenticated_materiaux_insert" on materiaux for insert to authenticated with check (true);

drop policy if exists "public_projets_valides" on projets;
create policy "public_projets_valides" on projets for select using (statut_validation = 'valide');
drop policy if exists "authenticated_projets_insert" on projets;
create policy "authenticated_projets_insert" on projets for insert to authenticated with check (true);

drop policy if exists "public_territoires_read" on territoires;
create policy "public_territoires_read" on territoires for select using (true);
drop policy if exists "public_antennes_actives" on antennes;
create policy "public_antennes_actives" on antennes for select using (statut = 'active');

drop policy if exists "public_partenaires_valides" on partenaires;
create policy "public_partenaires_valides" on partenaires for select using (statut = 'valide');
drop policy if exists "authenticated_partenaires_insert" on partenaires;
create policy "authenticated_partenaires_insert" on partenaires for insert to authenticated with check (true);

drop policy if exists "public_documents_valides" on documents;
create policy "public_documents_valides" on documents for select using (statut_validation = 'valide');
drop policy if exists "authenticated_documents_insert" on documents;
create policy "authenticated_documents_insert" on documents for insert to authenticated with check (true);

drop policy if exists "public_actualites_publiees" on actualites;
create policy "public_actualites_publiees" on actualites for select using (statut = 'publie');

insert into storage.buckets (id, name, public)
values ('signalements', 'signalements', false), ('materiaux', 'materiaux', false), ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "authenticated_storage_upload" on storage.objects;
create policy "authenticated_storage_upload" on storage.objects for insert to authenticated with check (bucket_id in ('signalements', 'materiaux', 'documents'));
