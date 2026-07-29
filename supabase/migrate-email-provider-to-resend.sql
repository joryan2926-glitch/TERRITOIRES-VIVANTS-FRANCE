-- Migration TVF OS : remplacement de Brevo par Resend
-- A exécuter une seule fois dans Supabase SQL Editor après sauvegarde.

begin;

delete from public.integration_configs
where provider_key = 'brevo'
  and exists (
    select 1
    from public.integration_configs existing
    where existing.provider_key = 'resend'
  );

update public.integration_configs
set
  provider_key = 'resend',
  provider_name = 'Resend',
  integration_type = 'email',
  environment = 'production',
  status = 'not_configured',
  health_status = 'unknown',
  required_env_vars = array['RESEND_API_KEY', 'TVF_EMAIL_FROM'],
  notes = 'Notifications transactionnelles du site et accusés de réception.',
  ai_summary = 'Vérifier la clé Resend, le domaine expéditeur et la délivrabilité avant mise en production.',
  updated_at = now()
where provider_key = 'brevo';

insert into public.integration_configs (
  provider_key,
  provider_name,
  integration_type,
  environment,
  status,
  health_status,
  required_env_vars,
  notes,
  ai_summary
)
values (
  'resend',
  'Resend',
  'email',
  'production',
  'not_configured',
  'unknown',
  array['RESEND_API_KEY', 'TVF_EMAIL_FROM'],
  'Notifications transactionnelles du site et accusés de réception.',
  'Vérifier la clé Resend, le domaine expéditeur et la délivrabilité avant mise en production.'
)
on conflict (provider_key) do update
set
  provider_name = excluded.provider_name,
  integration_type = excluded.integration_type,
  environment = excluded.environment,
  required_env_vars = excluded.required_env_vars,
  notes = excluded.notes,
  ai_summary = excluded.ai_summary,
  updated_at = now();

commit;

select
  provider_key,
  provider_name,
  integration_type,
  status,
  health_status,
  required_env_vars
from public.integration_configs
where provider_key in ('brevo', 'resend')
order by provider_key;
