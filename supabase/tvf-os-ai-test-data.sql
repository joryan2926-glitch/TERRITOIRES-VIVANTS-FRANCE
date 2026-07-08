-- TVF OS - Assistant IA - Donnees de test

insert into public.ai_interactions (user_label, context_object_type, interaction_type, prompt, prompt_summary, response, response_summary, sources, confidence, model_used, status)
values (
  'TVF OS Test',
  'none',
  'question',
  'Quelle suite proposer pour un proprietaire avec un bien vacant et des photos manquantes ?',
  'Question bien vacant photos manquantes',
  '{"answer_text":"Demander les photos, verifier le contact proprietaire et rattacher au pole Habitat Vivant.","suggested_category":"bien_vacant","suggested_pole":"Habitat Vivant","suggested_priority":"P2","next_actions":["Demander photos","Verifier autorisation"],"sources":["knowledge:test-pieces-bien-vacant"]}'::jsonb,
  'Demander les photos, verifier le contact proprietaire et rattacher au pole Habitat Vivant.',
  array['knowledge:test-pieces-bien-vacant'],
  0.82,
  'tvf-os-deterministic-v1',
  'completed'
);

insert into public.ai_suggestions (user_label, related_object_type, suggestion_type, title, proposed_value, explanation, sources, confidence, status)
values (
  'TVF OS Test',
  'email',
  'email_triage',
  'Test tri e-mail proprietaire bien vacant',
  '{"category":"bien_vacant","pole":"Habitat Vivant","priority":"P2","missing_information":["adresse precise","photos","autorisation de visite"]}'::jsonb,
  'Suggestion de test : tri e-mail a valider humainement.',
  array['knowledge:test-pieces-bien-vacant'],
  0.78,
  'proposed'
);
