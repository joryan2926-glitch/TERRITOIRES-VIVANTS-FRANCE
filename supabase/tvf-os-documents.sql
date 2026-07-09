-- TVF OS - Module Gestion documentaire
-- Migration production : fichiers, documents, versions, liens, modeles, generations et journal.

create extension if not exists pgcrypto;
create sequence if not exists public.documents_number_seq;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tvf-documents',
  'tvf-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'tvf-documents',
  storage_path text not null unique,
  original_filename text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  checksum text,
  uploaded_by text,
  branch_id uuid,
  confidentiality_level text not null default 'interne',
  virus_scan_status text not null default 'pending',
  ai_summary text,
  sensitive_detected boolean not null default false,
  created_at timestamptz not null default now(),
  constraint files_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible')),
  constraint files_virus_scan_check check (virus_scan_status in ('pending','clean','suspect','blocked')),
  constraint files_size_check check (size_bytes >= 0 and size_bytes <= 10485760)
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  title text not null,
  template_type text not null default 'autre',
  status text not null default 'brouillon',
  version integer not null default 1,
  national_validated boolean not null default false,
  file_id uuid references public.files(id) on delete set null,
  required_fields text[] not null default '{}',
  description text,
  branch_id uuid,
  ai_summary text,
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(ai_summary,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_type_check check (template_type in ('courrier','email','convention','fiche','registre','budget','kit_antenne','formulaire','grille','compte_rendu','financeur','autre')),
  constraint templates_status_check check (status in ('brouillon','a_valider','officiel','remplace','archive')),
  constraint templates_version_check check (version >= 1)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  document_number text unique,
  title text not null,
  document_type text not null default 'piece',
  status text not null default 'a_classer',
  version integer not null default 1,
  file_id uuid references public.files(id) on delete set null,
  branch_id uuid,
  related_object_type text not null default 'none',
  related_object_id uuid,
  template_id uuid references public.templates(id) on delete set null,
  validated_by text,
  validated_at timestamptz,
  expires_at timestamptz,
  confidentiality_level text not null default 'interne',
  ai_summary text,
  classification_notes text,
  sensitive_detected boolean not null default false,
  indexed_in_knowledge boolean not null default false,
  search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(classification_notes,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_type_check check (document_type in ('piece','photo','convention','courrier','email','budget','compte_rendu','fiche','registre','formulaire','kit','preuve','modele_genere','autre')),
  constraint documents_status_check check (status in ('brouillon','a_classer','a_valider','valide','remplace','archive')),
  constraint documents_version_check check (version >= 1),
  constraint documents_confidentiality_check check (confidentiality_level in ('public','interne','confidentiel','sensible')),
  constraint documents_related_type_check check (related_object_type in ('case','request','contact','organization','project','branch','template','none'))
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null,
  file_id uuid references public.files(id) on delete set null,
  change_summary text,
  created_by text,
  created_at timestamptz not null default now(),
  unique(document_id, version),
  constraint document_versions_version_check check (version >= 1)
);

create table if not exists public.document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  related_object_type text not null,
  related_object_id uuid not null,
  relation_label text,
  created_at timestamptz not null default now(),
  unique(document_id, related_object_type, related_object_id),
  constraint document_links_related_type_check check (related_object_type in ('case','request','contact','organization','project','branch','template'))
);

create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  generated_by text,
  generated_from_object_type text not null default 'none',
  generated_from_object_id uuid,
  generation_status text not null default 'draft_created',
  validation_status text not null default 'non_soumis',
  missing_fields text[] not null default '{}',
  field_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint generated_documents_object_type_check check (generated_from_object_type in ('case','request','contact','organization','project','branch','template','none')),
  constraint generated_documents_generation_status_check check (generation_status in ('draft_created','missing_fields','submitted','validated','failed')),
  constraint generated_documents_validation_status_check check (validation_status in ('non_soumis','a_valider','valide','refuse'))
);

create table if not exists public.document_audit_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  template_id uuid references public.templates(id) on delete cascade,
  action text not null,
  details text,
  created_by text,
  created_at timestamptz not null default now()
);

-- Compatibilite : complete les tables deja creees par une ancienne tentative.
alter table if exists public.files
  add column if not exists storage_bucket text not null default 'tvf-documents',
  add column if not exists storage_path text,
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint not null default 0,
  add column if not exists checksum text,
  add column if not exists uploaded_by text,
  add column if not exists branch_id uuid,
  add column if not exists confidentiality_level text not null default 'interne',
  add column if not exists virus_scan_status text not null default 'pending',
  add column if not exists ai_summary text,
  add column if not exists sensitive_detected boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.templates
  add column if not exists template_key text,
  add column if not exists title text,
  add column if not exists template_type text not null default 'autre',
  add column if not exists status text not null default 'brouillon',
  add column if not exists version integer not null default 1,
  add column if not exists national_validated boolean not null default false,
  add column if not exists file_id uuid,
  add column if not exists required_fields text[] not null default '{}',
  add column if not exists description text,
  add column if not exists branch_id uuid,
  add column if not exists ai_summary text,
  add column if not exists search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(ai_summary,''))) stored,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.documents
  add column if not exists document_number text,
  add column if not exists title text,
  add column if not exists document_type text not null default 'piece',
  add column if not exists status text not null default 'a_classer',
  add column if not exists version integer not null default 1,
  add column if not exists file_id uuid,
  add column if not exists branch_id uuid,
  add column if not exists related_object_type text not null default 'none',
  add column if not exists related_object_id uuid,
  add column if not exists template_id uuid,
  add column if not exists validated_by text,
  add column if not exists validated_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists confidentiality_level text not null default 'interne',
  add column if not exists ai_summary text,
  add column if not exists classification_notes text,
  add column if not exists sensitive_detected boolean not null default false,
  add column if not exists indexed_in_knowledge boolean not null default false,
  add column if not exists search_vector tsvector generated always as (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(ai_summary,'') || ' ' || coalesce(classification_notes,''))) stored,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.document_versions
  add column if not exists document_id uuid,
  add column if not exists version integer not null default 1,
  add column if not exists file_id uuid,
  add column if not exists change_summary text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.document_links
  add column if not exists document_id uuid,
  add column if not exists related_object_type text,
  add column if not exists related_object_id uuid,
  add column if not exists relation_label text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.generated_documents
  add column if not exists template_id uuid,
  add column if not exists document_id uuid,
  add column if not exists generated_by text,
  add column if not exists generated_from_object_type text not null default 'none',
  add column if not exists generated_from_object_id uuid,
  add column if not exists generation_status text not null default 'draft_created',
  add column if not exists validation_status text not null default 'non_soumis',
  add column if not exists missing_fields text[] not null default '{}',
  add column if not exists field_values jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.document_audit_logs
  add column if not exists document_id uuid,
  add column if not exists template_id uuid,
  add column if not exists action text,
  add column if not exists details text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz not null default now();
create or replace function public.tvf_detect_sensitive_document(text_value text)
returns boolean language sql immutable as $$
  select coalesce(text_value, '') ~* '(rib|iban|piece d identite|identite|cni|passeport|avis d impot|impot|salaire|medical|sante|signature|donnees personnelles|rgpd|contrat|mandat)';
$$;

create or replace function public.tvf_document_type_from_title(text_value text)
returns text language sql immutable as $$
  select case
    when coalesce(text_value, '') ~* '(photo|image|jpg|jpeg|png|webp)' then 'photo'
    when coalesce(text_value, '') ~* '(convention|partenariat|mise a disposition)' then 'convention'
    when coalesce(text_value, '') ~* '(courrier|lettre)' then 'courrier'
    when coalesce(text_value, '') ~* '(email|mail)' then 'email'
    when coalesce(text_value, '') ~* '(budget|finance|financement|devis|facture)' then 'budget'
    when coalesce(text_value, '') ~* '(compte rendu|proces verbal|reunion)' then 'compte_rendu'
    when coalesce(text_value, '') ~* '(fiche|formulaire|grille)' then 'fiche'
    when coalesce(text_value, '') ~* '(registre|suivi|tableau)' then 'registre'
    when coalesce(text_value, '') ~* '(kit|pack)' then 'kit'
    when coalesce(text_value, '') ~* '(preuve|justificatif|attestation|rib|cni|identite)' then 'preuve'
    else 'piece'
  end;
$$;

create or replace function public.set_file_metadata()
returns trigger language plpgsql as $$
begin
  new.sensitive_detected := coalesce(new.sensitive_detected, false) or public.tvf_detect_sensitive_document(coalesce(new.original_filename,'') || ' ' || coalesce(new.ai_summary,''));
  if new.sensitive_detected and new.confidentiality_level in ('public','interne') then
    new.confidentiality_level := 'sensible';
  end if;
  return new;
end;
$$;

create or replace function public.set_template_metadata()
returns trigger language plpgsql as $$
begin
  if new.template_key is null or new.template_key = '' then
    new.template_key := lower(regexp_replace(new.template_type || '-' || new.title, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  if new.status = 'officiel' then
    new.national_validated := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_document_metadata()
returns trigger language plpgsql as $$
begin
  if new.document_number is null or new.document_number = '' then
    new.document_number := 'DOC-' || to_char(coalesce(new.created_at, now()), 'YYYY') || '-' || lpad(nextval('public.documents_number_seq')::text, 4, '0');
  end if;
  if new.document_type is null or new.document_type = '' then
    new.document_type := public.tvf_document_type_from_title(new.title);
  end if;
  new.sensitive_detected := coalesce(new.sensitive_detected, false) or public.tvf_detect_sensitive_document(coalesce(new.title,'') || ' ' || coalesce(new.ai_summary,'') || ' ' || coalesce(new.classification_notes,''));
  if new.sensitive_detected and new.confidentiality_level in ('public','interne') then
    new.confidentiality_level := 'sensible';
  end if;
  if new.status = 'valide' and new.validated_at is null then
    new.validated_at := now();
  end if;
  if new.status = 'valide' and new.confidentiality_level <> 'sensible' then
    new.indexed_in_knowledge := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.create_initial_document_version()
returns trigger language plpgsql as $$
begin
  if new.file_id is not null then
    insert into public.document_versions(document_id, version, file_id, change_summary, created_by)
    values (new.id, new.version, new.file_id, 'Version initiale', 'TVF OS')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.log_document_status_change()
returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status then
    insert into public.document_audit_logs(document_id, action, details, created_by)
    values (new.id, 'changement_statut', coalesce(old.status, 'nouveau') || ' -> ' || new.status, 'TVF OS');
  end if;
  return new;
end;
$$;

drop trigger if exists set_file_metadata on public.files;
create trigger set_file_metadata before insert or update on public.files for each row execute function public.set_file_metadata();

drop trigger if exists set_template_metadata on public.templates;
create trigger set_template_metadata before insert or update on public.templates for each row execute function public.set_template_metadata();

drop trigger if exists set_document_metadata on public.documents;
create trigger set_document_metadata before insert or update on public.documents for each row execute function public.set_document_metadata();

drop trigger if exists create_initial_document_version on public.documents;
create trigger create_initial_document_version after insert on public.documents for each row execute function public.create_initial_document_version();

drop trigger if exists log_document_status_change on public.documents;
create trigger log_document_status_change after update on public.documents for each row execute function public.log_document_status_change();

create index if not exists files_bucket_path_idx on public.files(storage_bucket, storage_path);
create index if not exists files_confidentiality_idx on public.files(confidentiality_level, virus_scan_status);
create index if not exists documents_status_idx on public.documents(status, document_type, updated_at desc);
create index if not exists documents_related_idx on public.documents(related_object_type, related_object_id);
create index if not exists documents_file_idx on public.documents(file_id);
create index if not exists documents_template_idx on public.documents(template_id);
create index if not exists documents_search_idx on public.documents using gin(search_vector);
create index if not exists document_versions_document_idx on public.document_versions(document_id, version desc);
create index if not exists document_links_object_idx on public.document_links(related_object_type, related_object_id);
create index if not exists templates_status_idx on public.templates(status, template_type, updated_at desc);
create index if not exists templates_search_idx on public.templates using gin(search_vector);
create index if not exists generated_documents_template_idx on public.generated_documents(template_id, generation_status);
create index if not exists generated_documents_object_idx on public.generated_documents(generated_from_object_type, generated_from_object_id);
create index if not exists document_audit_logs_document_idx on public.document_audit_logs(document_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'generated_documents_template_document_unique'
  ) then
    alter table public.generated_documents
      add constraint generated_documents_template_document_unique unique(template_id, document_id);
  end if;
end $$;

alter table public.files enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_links enable row level security;
alter table public.templates enable row level security;
alter table public.generated_documents enable row level security;
alter table public.document_audit_logs enable row level security;

-- Service role bypass RLS. Policies preparent les futurs roles Supabase Auth TVF.
drop policy if exists "TVF files can read" on public.files;
create policy "TVF files can read" on public.files for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF files can manage" on public.files;
create policy "TVF files can manage" on public.files for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF documents can read" on public.documents;
create policy "TVF documents can read" on public.documents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF documents can manage" on public.documents;
create policy "TVF documents can manage" on public.documents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF document versions can read" on public.document_versions;
create policy "TVF document versions can read" on public.document_versions for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','auditor'));
drop policy if exists "TVF document versions can manage" on public.document_versions;
create policy "TVF document versions can manage" on public.document_versions for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF document links can read" on public.document_links;
create policy "TVF document links can read" on public.document_links for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF document links can manage" on public.document_links;
create policy "TVF document links can manage" on public.document_links for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF templates can read" on public.templates;
create policy "TVF templates can read" on public.templates for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF templates can manage" on public.templates;
create policy "TVF templates can manage" on public.templates for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','document_manager'));

drop policy if exists "TVF generated documents can read" on public.generated_documents;
create policy "TVF generated documents can read" on public.generated_documents for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','auditor'));
drop policy if exists "TVF generated documents can manage" on public.generated_documents;
create policy "TVF generated documents can manage" on public.generated_documents for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','case_manager'));

drop policy if exists "TVF document audit can read" on public.document_audit_logs;
create policy "TVF document audit can read" on public.document_audit_logs for select using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager','auditor'));
drop policy if exists "TVF document audit can manage" on public.document_audit_logs;
create policy "TVF document audit can manage" on public.document_audit_logs for all using ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check ((auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

drop policy if exists "TVF storage documents can read" on storage.objects;
create policy "TVF storage documents can read" on storage.objects for select using (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','case_manager','document_manager','request_manager','crm_manager','auditor'));
drop policy if exists "TVF storage documents can manage" on storage.objects;
create policy "TVF storage documents can manage" on storage.objects for all using (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager')) with check (bucket_id = 'tvf-documents' and (auth.jwt() -> 'app_metadata' ->> 'tvf_role') in ('national_admin','branch_manager','document_manager'));

comment on table public.files is 'TVF OS - metadonnees des fichiers stockes dans Supabase Storage.';
comment on table public.documents is 'TVF OS - objets documentaires metier classes, versionnes et validables.';
comment on table public.templates is 'TVF OS - bibliotheque des modeles officiels et locaux.';
comment on table public.generated_documents is 'TVF OS - documents produits depuis un modele.';
