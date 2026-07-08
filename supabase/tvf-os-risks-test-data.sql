-- TVF OS - Module Risques et conformite - donnees de test

insert into public.risks (risk_key, risk_type, severity, likelihood, status, title, description, mitigation_plan, owner_name, related_object_type, due_at, ai_summary)
values
  ('RISK-TEST-RGPD-001', 'rgpd', 'high', 'possible', 'mitigating', 'Consentement manquant sur une publication', 'Une photo exploitable publiquement doit etre bloquee tant que le consentement n est pas fourni.', 'Demander consentement et preuve documentaire avant publication.', 'Referent conformite', 'document', now() + interval '7 days', 'Blocage recommande avant toute publication.'),
  ('RISK-TEST-TERRAIN-001', 'field_safety', 'critical', 'likely', 'open', 'Visite terrain sans autorisation', 'Une visite est planifiee sans autorisation signee ni assurance verifiee.', 'Reporter la visite ou collecter les autorisations.', 'Responsable antenne', 'case', now() + interval '2 days', 'Risque critique : visite a bloquer.')
on conflict (risk_key) do update set updated_at = now();

insert into public.compliance_checks (check_key, check_type, title, status, required, blocking, related_object_type, owner_name, due_at, notes, ai_summary)
values
  ('CHECK-TEST-CONSENTEMENT', 'image_rights', 'Consentement droit image', 'missing', true, true, 'document', 'Referent conformite', now() + interval '5 days', 'Piece manquante.', 'Publication bloquee tant que le consentement est manquant.'),
  ('CHECK-TEST-ASSURANCE', 'insurance', 'Assurance visite terrain', 'to_review', true, true, 'case', 'Responsable antenne', now() + interval '3 days', 'Attestation a verifier.', 'Verification requise avant visite.'),
  ('CHECK-TEST-RGPD', 'rgpd', 'Minimisation donnees personnelles', 'valid', true, false, 'document', 'DPO TVF', now() + interval '30 days', 'Controle OK.', 'Conforme.')
on conflict (branch_id, check_key, related_object_type, related_object_id) do update set updated_at = now();

insert into public.incidents (incident_key, incident_type, severity, status, title, description, occurred_at, reported_by, owner_name, immediate_actions, corrective_actions, related_object_type, ai_summary)
values ('INC-TEST-001', 'rgpd', 'medium', 'triage', 'Signalement donnees personnelles', 'Un document contient des donnees personnelles non masquees.', now() - interval '1 day', 'Equipe TVF', 'Referent conformite', 'Restreindre la diffusion.', 'Masquer les donnees et documenter la correction.', 'document', 'Incident a traiter sous controle RGPD.')
on conflict (incident_key) do update set updated_at = now();

insert into public.consent_records (person_name, consent_type, status, related_object_type, valid_from, valid_until, notes)
values
  ('Personne test', 'image_rights', 'pending', 'document', current_date, current_date + interval '365 days', 'Consentement en attente.'),
  ('Benevole test', 'visit_authorization', 'valid', 'case', current_date - interval '5 days', current_date + interval '90 days', 'Autorisation valide.');

insert into public.audit_logs (actor_name, action, object_type, severity, after_snapshot)
values ('TVF OS', 'risk_module_seed', 'risks', 'notice', '{"module":"risks","seed":true}'::jsonb);
