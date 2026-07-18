-- Verification TVF Mobile - demandes terrain
select
  to_regclass('public.mobile_requests') as mobile_requests_table,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mobile_requests'
      and column_name = 'photo_path'
  ) as photo_path_column,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mobile_requests'
      and policyname = 'mobile_requests_public_insert'
  ) as public_insert_policy,
  exists (
    select 1 from storage.buckets
    where id = 'signalements'
  ) as signalements_bucket,
  exists (
    select 1 from storage.buckets
    where id = 'materiaux'
  ) as materiaux_bucket,
  exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'mobile_public_upload_photos'
  ) as mobile_upload_policy;