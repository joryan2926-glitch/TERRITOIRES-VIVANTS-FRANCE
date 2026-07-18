-- TVF Mobile - table de reception des demandes terrain
-- A executer dans Supabase SQL Editor uniquement lorsque l'application mobile doit enregistrer les demandes.
-- Ne jamais exposer la cle service_role dans l'application mobile.

create table if not exists public.mobile_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  flow text not null check (flow in ('signal', 'materials', 'property', 'volunteer')),
  category text,
  status text not null default 'received_mobile',
  raw_address text,
  latitude double precision,
  longitude double precision,
  photo_bucket text,
  photo_path text,
  contact_name text,
  contact_email text,
  contact_phone text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mobile_requests
  add column if not exists photo_bucket text,
  add column if not exists photo_path text;

create index if not exists mobile_requests_flow_idx on public.mobile_requests(flow);
create index if not exists mobile_requests_status_idx on public.mobile_requests(status);
create index if not exists mobile_requests_created_at_idx on public.mobile_requests(created_at desc);
create index if not exists mobile_requests_reference_idx on public.mobile_requests(reference);

alter table public.mobile_requests enable row level security;

drop policy if exists "mobile_requests_public_insert" on public.mobile_requests;
create policy "mobile_requests_public_insert"
  on public.mobile_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mobile_requests_authenticated_read" on public.mobile_requests;
create policy "mobile_requests_authenticated_read"
  on public.mobile_requests
  for select
  to authenticated
  using (true);

drop policy if exists "mobile_requests_authenticated_update" on public.mobile_requests;
create policy "mobile_requests_authenticated_update"
  on public.mobile_requests
  for update
  to authenticated
  using (true)
  with check (true);

grant insert on public.mobile_requests to anon;
grant select, insert, update on public.mobile_requests to authenticated;

-- Buckets utilises par l'application mobile pour les photos.
-- Les buckets restent prives. Les fichiers sont consultables via TVF OS / Supabase selon les roles internes.
insert into storage.buckets (id, name, public)
values ('signalements', 'signalements', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materiaux', 'materiaux', false)
on conflict (id) do nothing;

-- Politique minimale pour permettre l'ajout de photos depuis la preversion mobile.
-- A renforcer avant publication publique large : authentification, limitation anti-spam et moderation.
drop policy if exists "mobile_public_upload_photos" on storage.objects;
create policy "mobile_public_upload_photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id in ('signalements', 'materiaux'));

drop policy if exists "mobile_authenticated_read_photos" on storage.objects;
create policy "mobile_authenticated_read_photos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id in ('signalements', 'materiaux'));