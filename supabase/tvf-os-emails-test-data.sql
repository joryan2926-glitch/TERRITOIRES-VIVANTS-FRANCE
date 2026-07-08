with email_seed as (
  insert into public.email_messages (external_message_id, thread_key, provider, direction, from_email, from_name, to_email, subject, body_text, status, priority, category, pole, assigned_to, ai_summary, ai_confidence, missing_pieces, draft_response, next_action, next_action_due_at)
  values (
    'test-email-001',
    'thread-test-email-001',
    'manual',
    'inbound',
    'mairie.test@example.test',
    'Mairie Test',
    'contact@territoiresvivantsfrance.fr',
    'Local vacant disponible pour projet associatif',
    'Bonjour, notre commune souhaite echanger avec TVF concernant un local vacant pouvant accueillir une action solidaire. Nous avons besoin de connaitre les pieces utiles et les prochaines etapes.',
    'analyzed',
    'P2',
    'local_authority',
    'Collectivites & Territoires',
    'Responsable antenne',
    'Demande collectivite a qualifier, local vacant et projet solidaire.',
    0.820,
    array['adresse precise','surface approximative','interlocuteur referent'],
    'Bonjour, merci pour votre message. Pouvez-vous nous transmettre l adresse precise, la surface et le contact referent afin de qualifier le local ?',
    'Demander les pieces manquantes puis proposer un rendez-vous',
    now() + interval '2 days'
  )
  on conflict (external_message_id) do update set updated_at = now()
  returning id
)
insert into public.email_ai_suggestions (email_message_id, suggestion_type, title, payload, confidence, status)
select id, 'triage', 'Triage automatique collectivite', jsonb_build_object('priority','P2','pole','Collectivites & Territoires','missing_pieces',array['adresse precise','surface approximative','interlocuteur referent']), 0.820, 'proposed'
from email_seed;

with msg as (select id from public.email_messages where external_message_id = 'test-email-001' limit 1)
insert into public.email_tasks (email_message_id, title, description, assigned_to, status, priority, due_at)
select id, 'Qualifier le local vacant', 'Verifier les pieces, rattacher au bon pole et proposer une reponse.', 'Responsable antenne', 'todo', 'P2', now() + interval '2 days'
from msg;

with msg as (select id from public.email_messages where external_message_id = 'test-email-001' limit 1)
insert into public.email_workflow_events (email_message_id, event_type, event_label, actor_label, payload)
select id, 'received', 'E-mail de test recu et analyse', 'TVF OS', jsonb_build_object('source','test-data')
from msg;
