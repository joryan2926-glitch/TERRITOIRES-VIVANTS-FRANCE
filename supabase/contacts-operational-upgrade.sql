-- Territoires Vivants France
-- Migration operationnelle facultative pour le suivi des demandes entrantes.
-- A executer dans Supabase SQL Editor apres sauvegarde et verification.

alter table if exists public.contacts
  add column if not exists status text not null default 'nouveau',
  add column if not exists priority text not null default 'normale',
  add column if not exists category text,
  add column if not exists assigned_to text,
  add column if not exists internal_notes text,
  add column if not exists last_follow_up_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.contacts
  drop constraint if exists contacts_status_check;

alter table if exists public.contacts
  add constraint contacts_status_check
  check (status in ('nouveau', 'a_qualifier', 'en_cours', 'rendez_vous', 'en_attente', 'accepte', 'refuse', 'archive'));

alter table if exists public.contacts
  drop constraint if exists contacts_priority_check;

alter table if exists public.contacts
  add constraint contacts_priority_check
  check (priority in ('normale', 'haute', 'urgente'));

create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists contacts_priority_idx on public.contacts(priority);
create index if not exists contacts_category_idx on public.contacts(category);
create index if not exists contacts_created_at_idx on public.contacts(created_at desc);

create or replace function public.set_contacts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_contacts_updated_at();

comment on column public.contacts.status is 'Statut interne de traitement TVF.';
comment on column public.contacts.priority is 'Priorite de qualification interne.';
comment on column public.contacts.category is 'Categorie operationnelle inferee par le formulaire.';
comment on column public.contacts.assigned_to is 'Personne ou role charge du suivi interne.';
comment on column public.contacts.internal_notes is 'Notes internes non publiques.';
