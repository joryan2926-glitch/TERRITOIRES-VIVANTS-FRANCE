-- TVF OS - Donnees de test module Parametres

insert into public.system_settings (setting_key, category, label, setting_type, setting_value, visibility, status, updated_by, ai_summary)
values ('settings-test-mode','system','Mode test parametres','boolean','{"value":true}'::jsonb,'internal','active','test','Verification du module Parametres.')
on conflict (setting_key) do update set setting_value = excluded.setting_value, status = excluded.status;

insert into public.integration_configs (provider_key, provider_name, integration_type, environment, status, health_status, required_env_vars, notes)
values ('settings_test_provider','Integration test','api','preview','configured','healthy',array['TVF_ADMIN_TOKEN'],'Integration de validation.')
on conflict (provider_key) do update set status = excluded.status, health_status = excluded.health_status;

insert into public.module_feature_flags (module_key, module_name, flag_key, is_enabled, rollout_scope, status, owner_pole, notes)
values ('settings_test','Module test','flag_test',true,'pilot','active','Systeme','Drapeau de validation.')
on conflict (module_key, flag_key) do update set is_enabled = excluded.is_enabled, status = excluded.status;

insert into public.automation_settings (rule_key, title, trigger_module, target_module, status, priority, conditions, action_template, ai_summary)
values ('settings-test-rule','Regle test parametres','settings','work','active','P2','{"test":true}'::jsonb,'{"action":"noop"}'::jsonb,'Regle de validation.')
on conflict (rule_key) do update set status = excluded.status;

insert into public.system_health_checks (check_key, check_name, check_type, status, severity, details, recommendation)
values ('settings-test-health','Controle test parametres','configuration','healthy','low','Controle de validation.','Aucune action.')
on conflict (check_key) do update set status = excluded.status;

insert into public.settings_audit_log (object_type, action, summary, performed_by, metadata)
values ('settings_test','verify','Validation donnees de test Parametres','test','{"module":"settings"}'::jsonb);