# TERRITOIRES VIVANTS FRANCE
## Dossier d'architecture technique - TVF OS

Version : 0.1 - architecture cible avant developpement  
Statut : a valider avant toute implementation technique  
Documents sources valides :

- `documents/cahier-des-charges-tvf-os.md`
- `documents/dossier-conception-ux-ui-tvf-os.md`

Usage : reference technique unique pour concevoir la base de donnees, les permissions, le backend, les API, les automatisations, les integrations, la securite, les fichiers, les notifications, les sauvegardes, la performance et le decoupage de developpement de TVF OS.

---

## 0. Principe directeur

TVF OS doit etre une plateforme interne robuste, securisee, modulaire et evolutive. Elle doit permettre a Territoires Vivants France de piloter une organisation nationale et des antennes locales avec les memes methodes, tout en respectant la confidentialite, la tracabilite et la validation humaine.

Cette architecture ne lance aucun developpement. Elle definit le cadre technique cible afin que chaque future implementation soit coherente avec les besoins fonctionnels et UX/UI deja valides.

Principes non negociables :

- une seule source de verite pour les donnees metier ;
- une separation claire entre donnees nationales, donnees d'antenne et donnees sensibles ;
- une securite appliquee au niveau base de donnees, API et interface ;
- des permissions fines par role, antenne, objet et niveau de confidentialite ;
- une architecture compatible IA, mais controlee par validation humaine ;
- une tracabilite complete des actions critiques ;
- une capacite de deploiement progressif, module par module ;
- une structure suffisamment generique pour accueillir de nouvelles antennes et de nouveaux poles.

---

## 1. Vue d'ensemble de l'architecture cible

### 1.1 Choix d'architecture recommande

Architecture cible recommandee :

- Frontend web applicatif pour l'interface TVF OS ;
- Supabase comme socle base de donnees, authentification, stockage et temps reel ;
- Backend applicatif sous forme d'API securisee et de fonctions serveur ;
- Services d'automatisation pour e-mails, IA, notifications et workflows ;
- Stockage documentaire securise ;
- Moteur IA connecte aux donnees autorisees et a une base de connaissances indexee ;
- Integrations externes : Brevo, Google Workspace, Stripe, cartographie, stockage/export, outils IA ;
- Journal d'audit transversal ;
- supervision, sauvegardes, monitoring et alertes.

### 1.2 Schema logique

```text
Utilisateurs
   |
Interface TVF OS
   |
Backend applicatif / API securisee
   |
+----------------------+----------------------+----------------------+
| Supabase Auth        | Supabase Database    | Supabase Storage     |
| roles, sessions      | donnees metier       | fichiers, documents  |
+----------------------+----------------------+----------------------+
   |
+----------------------+----------------------+----------------------+
| Automatisations      | IA                   | Integrations         |
| workflows, relances  | tri, synthese, RAG   | Brevo, Google, Stripe|
+----------------------+----------------------+----------------------+
   |
Audit, logs, sauvegardes, monitoring, exports
```

### 1.3 Separations techniques

La plateforme doit separer :

- interface utilisateur ;
- logique metier ;
- acces aux donnees ;
- automatisations ;
- integrations externes ;
- moteur IA ;
- stockage documentaire ;
- audit et conformite.

Cette separation evite qu'un changement d'interface modifie les regles metier, ou qu'une integration externe contourne les permissions.

---

## 2. Environnements

### 2.1 Environnements obligatoires

| Environnement | Usage | Donnees |
|---|---|---|
| Local | Developpement individuel | Donnees fictives |
| Preview / staging | Tests fonctionnels et validation | Donnees de test anonymisees |
| Production | Usage reel TVF | Donnees reelles protegees |

### 2.2 Regles

- Aucune donnee personnelle reelle ne doit etre utilisee en local.
- Les tests doivent disposer d'un jeu de donnees fictif representatif : antennes, demandes, contacts, dossiers, documents.
- Les integrations externes doivent avoir des cles separees par environnement.
- Les migrations de base doivent etre versionnees.
- Les changements de schema doivent etre testes sur staging avant production.

---

## 3. Modele de donnees global

### 3.1 Domaines fonctionnels

La base doit etre organisee par domaines :

1. Identite et permissions
2. Organisation TVF
3. CRM et relations externes
4. Demandes et dossiers
5. Projets et actions
6. Documents et fichiers
7. Procedures et connaissances
8. IA et automatisations
9. Communication et notifications
10. Finances et paiements
11. Cartographie et observatoire
12. Gouvernance, risques et audit
13. Parametres et referentiels

### 3.2 Conventions de donnees

Chaque table metier doit prevoir autant que possible :

- identifiant unique ;
- dates de creation et mise a jour ;
- createur ;
- dernier modificateur ;
- antenne de rattachement si applicable ;
- niveau de confidentialite ;
- statut ;
- archivage logique ;
- trace d'origine ;
- champs de recherche ;
- metadonnees si besoin.

### 3.3 Identifiants metier

Les identifiants techniques ne doivent pas remplacer les numeros metier visibles.

Exemples :

| Objet | Identifiant metier |
|---|---|
| Demande | TVF-AAAA-0001 |
| Dossier | DOS-AAAA-0001 ou TVF-AAAA-0001 si issu d'une demande |
| Projet | PRJ-AAAA-0001 |
| Antenne | ANT-CODETERRITOIRE |
| Convention | CNV-AAAA-0001 |
| Document | DOC-AAAA-0001 |

Le format exact pourra etre valide en phase de specification detaillee.

---

## 4. Tables Supabase recommandees

Cette section decrit les tables cibles. Elle ne constitue pas du SQL executable.

### 4.1 Identite et utilisateurs

#### `profiles`

Role : fiche interne liee a l'utilisateur authentifie.

Champs principaux :

- id ;
- auth_user_id ;
- first_name ;
- last_name ;
- email ;
- phone ;
- status ;
- default_branch_id ;
- avatar_file_id ;
- last_seen_at ;
- onboarding_completed_at.

Relations :

- un profil peut appartenir a plusieurs antennes via `user_branch_memberships` ;
- un profil peut avoir plusieurs roles via `user_roles` ;
- un profil peut etre responsable de demandes, dossiers, taches, projets.

#### `roles`

Role : referentiel des roles.

Roles cibles :

- super_admin_national ;
- admin_national ;
- responsable_antenne ;
- referent_pole ;
- charge_dossier ;
- contributeur ;
- benevole_encadre ;
- lecteur_interne ;
- auditeur ;
- comptabilite ;
- communication.

#### `permissions`

Role : liste fine des droits disponibles.

Exemples :

- read_demands ;
- update_demands ;
- assign_demands ;
- close_cases ;
- manage_branch ;
- validate_documents ;
- export_personal_data ;
- manage_users ;
- manage_ai_settings.

#### `role_permissions`

Role : relation entre roles et permissions.

#### `user_roles`

Role : attribution d'un role a un utilisateur, potentiellement limitee a une antenne.

Champs :

- user_id ;
- role_id ;
- branch_id optionnel ;
- scope ;
- valid_from ;
- valid_until ;
- assigned_by.

#### `user_branch_memberships`

Role : rattacher un utilisateur a une ou plusieurs antennes.

Champs :

- user_id ;
- branch_id ;
- membership_status ;
- joined_at ;
- left_at ;
- primary_role_label.

### 4.2 Organisation TVF

#### `branches`

Role : antennes TVF.

Champs :

- id ;
- code ;
- name ;
- territory_name ;
- territory_type ;
- city ;
- department ;
- region ;
- status ;
- maturity_level ;
- responsible_user_id ;
- launch_date ;
- national_validation_status ;
- description.

Relations :

- une antenne a plusieurs utilisateurs ;
- une antenne a plusieurs demandes, dossiers, projets, contacts, organisations ;
- une antenne active plusieurs poles via `branch_poles`.

#### `poles`

Role : referentiel national des poles.

Exemples :

- Habitat Vivant ;
- Commerce Vivant ;
- Materiautheque Solidaire ;
- Friches & Terrains Vivants ;
- Solidarite & Insertion ;
- Collectivites & Territoires ;
- Financement & Mecenat ;
- Observatoire & Donnees ;
- Communication ;
- Gouvernance & Conformite.

#### `branch_poles`

Role : poles actifs par antenne.

Champs :

- branch_id ;
- pole_id ;
- status ;
- referent_user_id ;
- activated_at.

#### `branch_launch_checklist_items`

Role : checklist de lancement d'antenne.

Champs :

- branch_id ;
- item_key ;
- label ;
- status ;
- due_date ;
- completed_at ;
- completed_by ;
- evidence_document_id.

### 4.3 CRM et organisations externes

#### `contacts`

Role : personnes physiques externes ou internes non utilisatrices.

Champs :

- id ;
- branch_id ;
- first_name ;
- last_name ;
- email ;
- phone ;
- contact_type ;
- consent_status ;
- consent_source ;
- confidentiality_level ;
- notes ;
- source ;
- archived_at.

Types :

- proprietaire ;
- elu ;
- technicien ;
- entreprise_contact ;
- benevole ;
- financeur ;
- journaliste ;
- citoyen ;
- partenaire ;
- autre.

#### `organizations`

Role : structures externes.

Champs :

- id ;
- branch_id ;
- name ;
- organization_type ;
- sub_type ;
- siret ;
- website ;
- email ;
- phone ;
- address ;
- city ;
- department ;
- region ;
- relation_status ;
- confidentiality_level ;
- notes.

Types :

- collectivite ;
- entreprise ;
- association ;
- financeur ;
- institution ;
- media ;
- proprietaire_personne_morale ;
- partenaire ;
- fournisseur.

#### `organization_contacts`

Role : relation plusieurs-a-plusieurs entre contacts et organisations.

Champs :

- organization_id ;
- contact_id ;
- role_label ;
- is_primary ;
- start_date ;
- end_date.

#### `relationship_history`

Role : journal relationnel metier.

Champs :

- related_contact_id ;
- related_organization_id ;
- branch_id ;
- interaction_type ;
- subject ;
- summary ;
- occurred_at ;
- created_by ;
- related_case_id ;
- related_project_id.

### 4.4 Demandes et dossiers

#### `incoming_requests`

Role : demandes entrantes, quel que soit le canal.

Champs principaux :

- id ;
- request_number ;
- branch_id ;
- channel ;
- form_code ;
- category ;
- priority ;
- status ;
- subject ;
- message ;
- requester_contact_id ;
- requester_organization_id ;
- assigned_to ;
- pole_id ;
- source_email_id ;
- next_action ;
- next_action_due_at ;
- received_at ;
- closed_at ;
- closure_reason ;
- ai_summary ;
- ai_confidence.

Relations :

- peut devenir un dossier via `cases.source_request_id` ;
- peut avoir des pieces via `request_documents` ;
- peut avoir des taches.

#### `cases`

Role : dossiers metier.

Champs :

- id ;
- case_number ;
- source_request_id ;
- branch_id ;
- case_type ;
- title ;
- status ;
- priority ;
- main_pole_id ;
- assigned_to ;
- maturity_score ;
- confidentiality_level ;
- summary ;
- next_action ;
- next_action_due_at ;
- decision_status ;
- opened_at ;
- closed_at ;
- archived_at.

Types :

- bien_vacant ;
- commerce_inoccupe ;
- materiaux ;
- collectivite ;
- entreprise ;
- benevole ;
- financeur ;
- signalement ;
- friche_terrain ;
- presse ;
- gouvernance ;
- autre.

#### `case_poles`

Role : poles associes a un dossier.

Champs :

- case_id ;
- pole_id ;
- involvement_type ;
- referent_user_id.

#### `case_participants`

Role : contacts, organisations ou utilisateurs impliques dans un dossier.

Champs :

- case_id ;
- participant_type ;
- contact_id ;
- organization_id ;
- user_id ;
- role_label ;
- is_primary.

#### `case_status_history`

Role : historique des changements de statut.

#### `case_checklist_items`

Role : checklist dynamique selon type de dossier.

Champs :

- case_id ;
- checklist_key ;
- label ;
- status ;
- required ;
- due_date ;
- completed_at ;
- completed_by.

### 4.5 Objets metier specialises

#### `properties`

Role : biens, logements, locaux, immeubles, commerces, terrains.

Champs :

- id ;
- branch_id ;
- property_type ;
- title ;
- address ;
- city ;
- department ;
- region ;
- latitude ;
- longitude ;
- geolocation_precision ;
- owner_contact_id ;
- owner_organization_id ;
- occupancy_status ;
- condition_status ;
- access_status ;
- visit_authorization_status ;
- confidentiality_level ;
- notes.

#### `property_usage_scenarios`

Role : scenarios d'usage pour un bien.

Champs :

- property_id ;
- scenario_title ;
- usage_type ;
- feasibility_level ;
- estimated_budget ;
- risks ;
- partners_needed ;
- status.

#### `material_batches`

Role : lots de materiaux, mobilier ou equipements.

Champs :

- id ;
- branch_id ;
- source_organization_id ;
- source_contact_id ;
- title ;
- material_type ;
- quantity ;
- unit ;
- condition_status ;
- location_address ;
- availability_deadline ;
- pickup_constraints ;
- acceptance_status ;
- assigned_project_id ;
- assigned_case_id ;
- storage_location_id ;
- notes.

#### `storage_locations`

Role : lieux de stockage.

Champs :

- branch_id ;
- name ;
- address ;
- capacity_description ;
- access_conditions ;
- security_status ;
- responsible_user_id.

#### `field_visits`

Role : visites terrain.

Champs :

- case_id ;
- property_id ;
- visit_type ;
- scheduled_at ;
- participants ;
- authorization_document_id ;
- safety_status ;
- summary ;
- completed_at ;
- created_by.

#### `citizen_reports`

Role : signalements citoyens.

Champs :

- branch_id ;
- report_type ;
- description ;
- location_text ;
- latitude ;
- longitude ;
- precision_level ;
- reporter_contact_id ;
- verification_status ;
- converted_case_id ;
- confidentiality_level.

### 4.6 Projets et actions

#### `projects`

Role : projets territoriaux regroupant dossiers, partenaires, budget et impact.

Champs :

- id ;
- project_number ;
- branch_id ;
- title ;
- project_type ;
- status ;
- territory ;
- lead_user_id ;
- summary ;
- start_date ;
- target_end_date ;
- actual_end_date ;
- budget_estimated ;
- budget_confirmed ;
- main_pole_id ;
- confidentiality_level.

#### `project_cases`

Role : relation projets-dossiers.

#### `project_partners`

Role : partenaires associes a un projet.

#### `project_milestones`

Role : jalons projet.

#### `project_indicators`

Role : indicateurs rattaches au projet.

### 4.7 Taches, agenda et workflows

#### `tasks`

Role : taches et relances.

Champs :

- id ;
- branch_id ;
- title ;
- description ;
- status ;
- priority ;
- assigned_to ;
- due_at ;
- completed_at ;
- related_object_type ;
- related_object_id ;
- source ;
- created_by ;
- ai_generated ;
- recurrence_rule_id.

#### `events`

Role : agenda.

Champs :

- branch_id ;
- title ;
- event_type ;
- starts_at ;
- ends_at ;
- location ;
- video_link ;
- related_object_type ;
- related_object_id ;
- organizer_user_id ;
- agenda_status ;
- minutes_document_id.

#### `event_participants`

Role : participants aux evenements.

#### `workflow_definitions`

Role : definition des workflows par type.

Champs :

- workflow_key ;
- label ;
- object_type ;
- active ;
- version ;
- description.

#### `workflow_steps`

Role : etapes de workflow.

Champs :

- workflow_id ;
- step_order ;
- step_key ;
- label ;
- required ;
- required_permission ;
- creates_task ;
- blocks_next_step_if_missing.

#### `workflow_instances`

Role : workflow applique a un objet.

#### `workflow_step_instances`

Role : etapes realisees ou restantes pour un objet.

### 4.8 Documents, fichiers et modeles

#### `files`

Role : metadonnees des fichiers stockes.

Champs :

- id ;
- storage_bucket ;
- storage_path ;
- original_filename ;
- mime_type ;
- size_bytes ;
- checksum ;
- uploaded_by ;
- branch_id ;
- confidentiality_level ;
- virus_scan_status ;
- created_at.

#### `documents`

Role : objet documentaire metier.

Champs :

- id ;
- document_number ;
- title ;
- document_type ;
- status ;
- version ;
- file_id ;
- branch_id ;
- related_object_type ;
- related_object_id ;
- template_id ;
- validated_by ;
- validated_at ;
- expires_at ;
- confidentiality_level ;
- ai_summary.

#### `document_versions`

Role : historique des versions.

#### `document_links`

Role : rattacher un document a plusieurs objets.

#### `templates`

Role : modeles officiels.

Champs :

- template_key ;
- title ;
- template_type ;
- status ;
- version ;
- national_validated ;
- file_id ;
- required_fields ;
- description.

#### `generated_documents`

Role : documents produits depuis modele.

Champs :

- template_id ;
- document_id ;
- generated_by ;
- generated_from_object_type ;
- generated_from_object_id ;
- generation_status ;
- validation_status.

### 4.9 Procedures et connaissances

#### `procedures`

Role : procedures nationales ou locales.

Champs :

- procedure_key ;
- title ;
- scope ;
- branch_id optionnel ;
- pole_id optionnel ;
- status ;
- version ;
- mandatory_level ;
- content_document_id ;
- reviewed_at ;
- next_review_at ;
- owner_user_id.

#### `knowledge_articles`

Role : base de connaissances.

Champs :

- title ;
- article_type ;
- content ;
- status ;
- source_object_type ;
- source_object_id ;
- validated_by ;
- validated_at ;
- next_review_at ;
- tags ;
- confidentiality_level.

#### `knowledge_sources`

Role : sources citees par un article ou une reponse IA.

#### `lessons_learned`

Role : retours d'experience.

### 4.10 IA et automatisations

#### `ai_suggestions`

Role : journal des propositions IA.

Champs :

- id ;
- branch_id ;
- user_id ;
- related_object_type ;
- related_object_id ;
- suggestion_type ;
- proposed_value ;
- explanation ;
- sources ;
- confidence ;
- status ;
- accepted_by ;
- accepted_at ;
- rejected_reason.

#### `ai_interactions`

Role : historique conversationnel et operationnel IA.

Champs :

- user_id ;
- branch_id ;
- context_object_type ;
- context_object_id ;
- prompt_summary ;
- response_summary ;
- model_used ;
- tokens_estimated ;
- created_at ;
- retention_policy.

#### `automation_rules`

Role : regles d'automatisation configurables.

Exemples :

- creer tache apres demande P1 ;
- relancer si pas de reponse apres 5 jours ;
- alerter si convention expire dans 30 jours ;
- proposer connaissance apres cloture.

#### `automation_runs`

Role : executions des automatisations.

#### `automation_actions`

Role : actions produites par automatisation.

### 4.11 Communications et notifications

#### `emails`

Role : e-mails entrants et sortants.

Champs :

- id ;
- branch_id ;
- direction ;
- provider ;
- provider_message_id ;
- from_email ;
- to_emails ;
- cc_emails ;
- subject ;
- body_text ;
- body_html_file_id ;
- received_at ;
- sent_at ;
- related_object_type ;
- related_object_id ;
- classification_status ;
- ai_summary ;
- confidentiality_level.

#### `email_attachments`

Role : pieces jointes e-mail.

#### `email_drafts`

Role : brouillons, notamment IA, avant validation humaine.

#### `notifications`

Role : notifications internes.

Champs :

- user_id ;
- branch_id ;
- notification_type ;
- title ;
- body ;
- related_object_type ;
- related_object_id ;
- priority ;
- read_at ;
- delivered_at.

#### `notification_preferences`

Role : preferences par utilisateur.

### 4.12 Finances, paiements et mecenat

#### `funders`

Role : financeurs et mecenes, peut lier une organisation.

#### `funding_opportunities`

Role : appels a projets, dispositifs, subventions.

#### `funding_applications`

Role : candidatures ou demandes de financement.

#### `budgets`

Role : budgets projet ou antenne.

#### `budget_lines`

Role : lignes budgetaires.

#### `expenses`

Role : depenses.

#### `payment_records`

Role : paiements, dons, cotisations, transactions Stripe.

Champs :

- provider ;
- provider_payment_id ;
- amount ;
- currency ;
- payment_status ;
- payer_contact_id ;
- payer_organization_id ;
- related_project_id ;
- related_branch_id ;
- receipt_document_id.

#### `stripe_events`

Role : journal des webhooks Stripe.

### 4.13 Cartographie et observatoire

#### `map_points`

Role : points cartographiques generiques.

Champs :

- branch_id ;
- point_type ;
- related_object_type ;
- related_object_id ;
- latitude ;
- longitude ;
- precision_level ;
- visibility_level ;
- label ;
- status.

#### `territorial_sources`

Role : sources publiques ou internes utilisees pour l'observatoire.

#### `territorial_indicators`

Role : indicateurs territoriaux.

#### `territorial_diagnostics`

Role : diagnostics d'un territoire.

### 4.14 Gouvernance, risques et audit

#### `decisions`

Role : decisions formelles.

Champs :

- decision_number ;
- branch_id ;
- decision_type ;
- title ;
- summary ;
- status ;
- decided_by ;
- decided_at ;
- related_object_type ;
- related_object_id ;
- minutes_document_id.

#### `committees`

Role : comites, reunions de gouvernance.

#### `committee_items`

Role : points d'ordre du jour.

#### `risks`

Role : registre des risques.

Champs :

- branch_id ;
- risk_type ;
- severity ;
- likelihood ;
- status ;
- title ;
- description ;
- mitigation_plan ;
- owner_user_id ;
- related_object_type ;
- related_object_id ;
- due_at.

#### `incidents`

Role : incidents securite, terrain, RGPD ou operationnels.

#### `audit_logs`

Role : journal transversal des actions sensibles.

Champs :

- actor_user_id ;
- action ;
- object_type ;
- object_id ;
- branch_id ;
- before_snapshot ;
- after_snapshot ;
- ip_address ;
- user_agent ;
- created_at ;
- severity.

### 4.15 Parametres et referentiels

Tables recommandees :

- `status_definitions` ;
- `priority_definitions` ;
- `category_definitions` ;
- `confidentiality_levels` ;
- `system_settings` ;
- `integration_settings` ;
- `numbering_sequences` ;
- `export_jobs` ;
- `import_jobs`.

---

## 5. Relations principales

### 5.1 Relations structurantes

| Relation | Cardinalite |
|---|---|
| Une antenne possede plusieurs demandes | 1 vers n |
| Une antenne possede plusieurs dossiers | 1 vers n |
| Une demande peut devenir un dossier | 1 vers 0/1 ou 1 |
| Un dossier peut impliquer plusieurs poles | n vers n |
| Un dossier peut impliquer plusieurs contacts et organisations | n vers n |
| Un projet regroupe plusieurs dossiers | n vers n |
| Un document peut etre lie a plusieurs objets | n vers n |
| Un utilisateur peut appartenir a plusieurs antennes | n vers n |
| Un utilisateur peut avoir plusieurs roles selon le contexte | n vers n |
| Une tache peut etre liee a tout objet metier | polymorphe controle |
| Une notification pointe vers un objet metier | polymorphe controle |

### 5.2 Regle de rattachement antenne

Tout objet operationnel doit etre rattache a une antenne, sauf :

- referentiels nationaux ;
- modeles nationaux ;
- procedures nationales ;
- roles et permissions ;
- configurations globales ;
- certains articles de connaissance nationaux.

### 5.3 Regle de confidentialite

Chaque objet sensible doit avoir un niveau :

- public interne ;
- antenne ;
- restreint ;
- sensible ;
- confidentiel national.

Ce niveau influence :

- affichage interface ;
- RLS ;
- exports ;
- IA ;
- notifications ;
- recherche.

---

## 6. Permissions et RLS Supabase

### 6.1 Principes RLS

La Row Level Security doit etre activee sur toutes les tables metier contenant des donnees internes, personnelles ou operationnelles.

La RLS doit appliquer :

- appartenance a une antenne ;
- role utilisateur ;
- permission fine ;
- niveau de confidentialite ;
- statut de l'objet ;
- cas particulier national ou audit.

### 6.2 Scopes d'acces

| Scope | Signification |
|---|---|
| own | Objets crees ou assignes a l'utilisateur |
| branch | Objets de l'antenne de l'utilisateur |
| pole | Objets du pole de l'utilisateur |
| national | Tous les objets autorises au niveau national |
| audit | Lecture des traces et donnees de controle |
| system | Acces reserve aux fonctions serveur |

### 6.3 Matrice de permissions simplifiee

| Role | Lecture | Ecriture | Validation | Administration |
|---|---|---|---|---|
| Super admin national | Tout | Tout | Tout | Tout |
| Admin national | National autorise | Large | Nationale | Parametres non critiques |
| Responsable antenne | Antenne | Antenne | Locale | Equipe locale |
| Referent pole | Pole/antenne | Dossiers pole | Selon delegation | Non |
| Charge dossier | Assignes/antenne | Assignes | Non ou limitee | Non |
| Contributeur | Assignes | Notes/pieces | Non | Non |
| Benevole encadre | Missions assignees | Compte rendu limite | Non | Non |
| Lecteur interne | Lecture limitee | Non | Non | Non |
| Auditeur | Lecture audit | Non | Non | Non |

### 6.4 Politiques RLS par famille de tables

#### Tables utilisateurs

Regles :

- un utilisateur peut lire son profil ;
- les responsables peuvent lire les profils de leur antenne ;
- les administrateurs nationaux peuvent gerer les profils autorises ;
- les modifications de roles exigent permission administrative.

#### Tables antennes

Regles :

- un membre peut lire son antenne ;
- le national peut lire toutes les antennes ;
- seul le national peut creer ou valider une antenne ;
- le responsable peut modifier certains champs locaux.

#### Tables demandes, dossiers, projets

Regles :

- lecture si utilisateur membre de l'antenne et permission adequate ;
- ecriture si role operationnel ou assignation ;
- cloture limitee au responsable, referent autorise ou national ;
- dossiers confidentiels visibles uniquement aux personnes autorisees ;
- audit en lecture pour auditeurs.

#### Tables contacts et organisations

Regles :

- acces par antenne ;
- donnees sensibles masquees selon role ;
- export reserve a permissions explicites ;
- suppression logique uniquement ;
- anonymisation selon politique RGPD.

#### Tables documents et fichiers

Regles :

- lecture selon objet lie et confidentialite ;
- validation reservee aux roles habilites ;
- documents confidentiels exclus des recherches non autorisees ;
- fichiers servis par URL signee courte duree.

#### Tables IA

Regles :

- un utilisateur voit ses interactions ;
- un responsable peut voir les suggestions liees a son antenne ;
- le national peut auditer les suggestions ;
- les prompts complets contenant des donnees sensibles doivent etre limites ou expurges selon retention.

### 6.5 RLS et fonctions serveur

Certaines operations doivent etre realisees par fonctions serveur avec role technique :

- ingestion e-mail ;
- webhooks Stripe ;
- classification IA ;
- generation de notifications ;
- traitements planifies ;
- exports administratifs ;
- synchronisation Google Workspace.

Ces fonctions doivent :

- verifier leur secret d'appel ;
- appliquer elles-memes les regles metier ;
- journaliser les actions ;
- ne jamais exposer la cle service cote client.

---

## 7. Architecture backend

### 7.1 Responsabilites du backend

Le backend doit gerer :

- authentification cote serveur si necessaire ;
- validations metier ;
- operations multi-tables ;
- appels aux services externes ;
- webhooks ;
- automatisations ;
- generation de documents ;
- orchestration IA ;
- exports ;
- notifications ;
- audit.

### 7.2 Types d'API

| Type | Usage |
|---|---|
| API interne frontend | Operations TVF OS depuis interface |
| API webhook | Brevo, Stripe, Google, autres services |
| API automation | Taches planifiees et traitements serveur |
| API IA | Classification, synthese, recherche, generation |
| API export/import | CSV, PDF, documents, donnees |

### 7.3 Principes API

- API versionnee ;
- validation stricte des entrees ;
- reponses standardisees ;
- pagination obligatoire sur listes ;
- filtres explicites ;
- rate limiting ;
- journalisation des erreurs ;
- idempotence pour webhooks ;
- verification des permissions avant action ;
- pas de logique critique uniquement cote frontend.

### 7.4 Endpoints conceptuels

Liste indicative, sans implementation :

Demandes :

- lister les demandes ;
- creer une demande manuelle ;
- qualifier une demande ;
- convertir en dossier ;
- demander des pieces ;
- refuser ou archiver ;
- generer une reponse.

Dossiers :

- lister les dossiers ;
- creer un dossier ;
- mettre a jour statut ;
- assigner ;
- ajouter participant ;
- ajouter document ;
- preparer decision ;
- cloturer.

IA :

- analyser une demande ;
- proposer une reponse ;
- synthetiser un dossier ;
- rechercher procedure ;
- generer checklist ;
- extraire taches d'un compte rendu ;
- journaliser une suggestion.

Documents :

- uploader fichier ;
- classer document ;
- generer depuis modele ;
- valider document ;
- creer lien signe ;
- exporter.

Integrations :

- recevoir webhook e-mail ;
- recevoir webhook Stripe ;
- synchroniser agenda ;
- envoyer e-mail ;
- envoyer notification.

---

## 8. Automatisations et workflows techniques

### 8.1 Moteur de workflow

TVF OS doit disposer d'un moteur de workflow configurable :

- definition du workflow ;
- etapes ;
- conditions ;
- actions automatiques ;
- blocages ;
- validations humaines ;
- historique.

Les workflows doivent etre stockes en base, pas codifies uniquement dans l'interface.

### 8.2 Workflow technique d'une demande entrante

1. Reception par formulaire, e-mail ou saisie manuelle.
2. Creation `incoming_requests`.
3. Creation ou rattachement contact/organisation.
4. Enregistrement pieces jointes.
5. Execution classification IA.
6. Creation `ai_suggestions`.
7. Notification aux responsables.
8. Creation tache de qualification.
9. Attente validation humaine.
10. Conversion eventuelle en dossier.
11. Journalisation audit.

### 8.3 Workflow technique e-mail

1. E-mail recu via provider.
2. Webhook ou synchronisation.
3. Verification authenticite.
4. Stockage message.
5. Stockage pieces jointes.
6. Dedoublonnage par message id.
7. Analyse IA.
8. Rattachement propose a contact/dossier.
9. Creation demande si nouveau sujet.
10. Brouillon de reponse.
11. Validation humaine avant envoi.

### 8.4 Workflow technique document

1. Upload fichier.
2. Verification taille/type.
3. Scan antivirus ou controle securite.
4. Stockage bucket prive.
5. Creation metadonnees `files`.
6. Creation `documents`.
7. Extraction texte si possible.
8. Resume IA optionnel.
9. Classification.
10. Validation si document officiel.
11. Indexation recherche si autorisee.

### 8.5 Workflow technique IA

1. Recuperer contexte autorise.
2. Appliquer filtre permissions.
3. Construire contexte minimal.
4. Appeler modele IA.
5. Recevoir proposition.
6. Enregistrer `ai_suggestions`.
7. Afficher avec sources et confiance.
8. Attendre decision utilisateur.
9. Journaliser acceptation/refus.
10. Eventuellement ameliorer base de connaissances.

### 8.6 Automatisations planifiees

Automatisations recommandees :

- relances taches en retard ;
- alertes P1 sans responsable ;
- conventions arrivant a echeance ;
- documents a revoir ;
- demandes sans action depuis X jours ;
- rapport hebdomadaire antenne ;
- rapport mensuel national ;
- sauvegarde et controle d'integrite ;
- detection de doublons contacts ;
- proposition de connaissances apres cloture.

---

## 9. Integrations externes

### 9.1 Brevo

Usages :

- e-mails transactionnels ;
- accuses de reception ;
- notifications externes ;
- campagnes institutionnelles futures, si validees ;
- suivi delivrabilite.

Architecture :

- envoi uniquement cote serveur ;
- modeles e-mail stockes dans TVF OS ou Brevo selon choix ;
- journalisation de chaque envoi dans `emails`;
- webhooks pour statut : envoye, ouvert, rebond, spam si utile ;
- jamais de cle API cote frontend.

### 9.2 IA

Usages :

- classification ;
- synthese ;
- brouillons ;
- recherche procedure ;
- extraction de taches ;
- detection de risques ;
- aide a la creation d'antenne ;
- capitalisation.

Regles :

- minimisation des donnees envoyees ;
- pas d'envoi de documents sensibles sans base legale et validation technique ;
- journalisation ;
- possibilite de desactiver certaines fonctions ;
- separation entre reponse IA et decision humaine.

### 9.3 Google Workspace

Usages possibles :

- synchronisation Gmail ;
- agenda ;
- Drive si choisi comme stockage documentaire secondaire ;
- Docs/Sheets pour exports ou collaboration ;
- authentification SSO a terme.

Architecture :

- OAuth cote serveur ;
- scopes minimaux ;
- synchronisation par compte service ou comptes autorises ;
- journal des synchronisations ;
- gestion des erreurs et expirations de token ;
- rattachement e-mails/evenements aux objets TVF.

### 9.4 Stripe

Usages possibles :

- dons ;
- cotisations ;
- paiements de prestations ou contributions si le cadre associatif le permet ;
- recus ;
- suivi des transactions.

Architecture :

- checkout ou paiement heberge ;
- webhooks Stripe obligatoires ;
- idempotence sur evenements ;
- stockage des transactions dans `payment_records`;
- rapprochement avec contact, organisation, antenne ou projet ;
- exports comptables ;
- acces limite aux donnees financieres.

### 9.5 Cartographie

Options :

- OpenStreetMap ;
- Mapbox ;
- Google Maps ;
- IGN ou services publics selon besoin.

Regles :

- ne pas exposer publiquement les localisations sensibles ;
- precision geographique ajustable ;
- geocodage controle ;
- stockage latitude/longitude seulement si utile ;
- affichage masque pour certains roles.

### 9.6 Stockage et edition documentaire

Options :

- Supabase Storage comme stockage primaire ;
- Google Drive comme espace collaboratif optionnel ;
- generation PDF/DOCX future via backend ;
- visionneuse interne.

Regle : la reference metier reste dans TVF OS, meme si un fichier est aussi synchronise ailleurs.

---

## 10. Gestion des fichiers

### 10.1 Buckets recommandes

| Bucket | Usage | Acces |
|---|---|---|
| documents | documents metier valides ou brouillons | prive |
| attachments | pieces jointes e-mails/formulaires | prive |
| photos-terrain | photos de visites | prive, sensible |
| templates | modeles officiels | prive interne |
| exports | exports temporaires | prive, expiration |
| avatars | images profils | prive ou interne |

### 10.2 Regles

- buckets prives par defaut ;
- acces par URL signee ;
- duree courte des liens ;
- controle type MIME ;
- taille maximale selon type ;
- scan securite si possible ;
- checksum ;
- metadonnees obligatoires ;
- retention definie ;
- suppression logique cote document, suppression physique controlee.

### 10.3 Classification documentaire

Niveaux :

- interne standard ;
- antenne ;
- restreint ;
- sensible ;
- confidentiel national.

Documents sensibles :

- pieces personnelles ;
- autorisations ;
- proprietes ;
- photos de biens ;
- conventions ;
- donnees financieres ;
- incidents ;
- documents RGPD.

---

## 11. Notifications

### 11.1 Types

- nouvelle demande ;
- demande P1 ;
- tache assignee ;
- tache en retard ;
- validation requise ;
- e-mail recu ;
- piece manquante ;
- convention a echeance ;
- risque critique ;
- rapport disponible ;
- suggestion IA importante.

### 11.2 Canaux

| Canal | Usage |
|---|---|
| Notification interne | Par defaut |
| E-mail | Alertes importantes et syntheses |
| Push mobile future | Terrain et urgences |
| Google Calendar | Evenements |
| Slack/Teams futur | Non prioritaire, optionnel |

### 11.3 Regles

- eviter la surcharge ;
- grouper les notifications non critiques ;
- escalader les retards importants ;
- respecter les preferences utilisateur ;
- ne pas inclure de donnees sensibles dans un e-mail de notification ;
- lien direct vers l'objet concerne.

---

## 12. Securite

### 12.1 Authentification

Exigences :

- authentification par e-mail securisee ;
- MFA recommande pour roles sensibles ;
- SSO Google Workspace possible a terme ;
- expiration de session ;
- reauthentification pour actions critiques ;
- journal des connexions.

### 12.2 Autorisation

Controle a trois niveaux :

1. Interface : masquer ou desactiver les actions non autorisees.
2. API : verifier permissions a chaque action.
3. Base : appliquer RLS.

### 12.3 Secrets

Regles :

- aucune cle secrete cote frontend ;
- stockage dans variables d'environnement securisees ;
- rotation periodique ;
- cles separees par environnement ;
- acces limite ;
- journalisation des usages critiques.

### 12.4 Donnees personnelles et RGPD

Exigences :

- consentement trace ;
- finalite claire ;
- minimisation ;
- retention ;
- droit d'acces ;
- droit de rectification ;
- droit d'effacement si applicable ;
- anonymisation lorsque possible ;
- exports controles ;
- registre d'incident.

### 12.5 Audit

Actions auditees :

- connexion ;
- creation/modification role ;
- export ;
- changement statut critique ;
- cloture/refus ;
- validation document ;
- envoi e-mail externe ;
- creation convention ;
- acces a document sensible ;
- modification de permission ;
- action serveur automatisée importante.

### 12.6 Protection contre erreurs metier

Garde-fous :

- confirmations ;
- statuts bloquants ;
- checklists obligatoires ;
- validation humaine ;
- alertes IA ;
- journal ;
- restauration version document ;
- blocage si consentement ou autorisation manquante.

---

## 13. Sauvegardes et reprise

### 13.1 Sauvegardes

Exigences :

- sauvegarde quotidienne base production ;
- sauvegarde fichiers ;
- retention definie ;
- tests reguliers de restauration ;
- sauvegarde avant migrations importantes ;
- export de secours des donnees critiques.

### 13.2 Plan de reprise

Objectifs :

- restaurer la base ;
- restaurer les fichiers ;
- reconstituer les integrations ;
- informer les utilisateurs ;
- documenter l'incident ;
- verifier l'integrite apres reprise.

### 13.3 Donnees critiques

Priorite de restauration :

1. utilisateurs, roles, antennes ;
2. demandes et dossiers ;
3. contacts et organisations ;
4. documents sensibles ;
5. taches et workflows ;
6. finances ;
7. audit ;
8. connaissances.

---

## 14. Performance

### 14.1 Principes

- pagination sur toutes les listes ;
- recherche indexee ;
- chargement progressif des fiches ;
- lazy loading des onglets ;
- cache cote frontend pour referentiels ;
- index base sur champs filtres frequemment ;
- limitation des pieces jointes chargees ;
- traitements lourds en arriere-plan.

### 14.2 Index a prevoir

Familles d'index :

- branch_id ;
- status ;
- priority ;
- assigned_to ;
- created_at ;
- received_at ;
- due_at ;
- related_object_type + related_object_id ;
- contact email ;
- organization name ;
- case_number ;
- request_number ;
- document_type ;
- confidentiality_level.

### 14.3 Recherche

Recherche a deux niveaux :

- recherche relationnelle rapide : numeros, noms, statuts, filtres ;
- recherche plein texte / semantique : documents, procedures, connaissances.

### 14.4 Traitements asynchrones

Doivent etre asynchrones :

- analyse IA ;
- extraction texte documents ;
- generation de gros exports ;
- envoi massif e-mails ;
- synchronisation Google ;
- rapports periodiques ;
- scan fichiers.

---

## 15. Scalabilite

### 15.1 Scalabilite fonctionnelle

L'architecture doit supporter :

- plusieurs antennes ;
- plusieurs milliers de contacts ;
- plusieurs milliers de demandes ;
- documents nombreux ;
- cartographie multi-territoires ;
- workflows evolutifs ;
- nouveaux poles ;
- nouvelles integrations.

### 15.2 Scalabilite organisationnelle

Prevoir :

- delegation locale ;
- supervision nationale ;
- modeles nationaux verrouilles ;
- variantes locales controlees ;
- reporting consolide ;
- droits multi-antennes.

### 15.3 Scalabilite technique

Prevoir :

- separation traitements lourds ;
- files d'attente ;
- webhooks idempotents ;
- cache ;
- monitoring ;
- nettoyage donnees obsoletes ;
- archivage.

---

## 16. Observabilite et monitoring

### 16.1 Logs

Logs necessaires :

- erreurs API ;
- webhooks ;
- appels IA ;
- automatisations ;
- envois e-mails ;
- synchronisations ;
- exports ;
- acces documents sensibles.

### 16.2 Metriques

Metriques techniques :

- temps de reponse API ;
- erreurs par endpoint ;
- volume e-mails ;
- echecs webhooks ;
- volume fichiers ;
- latence IA ;
- jobs en retard ;
- taille base ;
- connexions utilisateurs.

### 16.3 Alertes

Alertes :

- webhook critique en erreur ;
- e-mails non envoyes ;
- sauvegarde echouee ;
- taux erreur API eleve ;
- file de jobs bloquee ;
- depassement stockage ;
- tentative acces non autorisee repetee.

---

## 17. Gouvernance technique

### 17.1 Migrations

Regles :

- migrations versionnees ;
- revue avant production ;
- sauvegarde avant migration majeure ;
- rollback documente ;
- changelog schema.

### 17.2 Qualite

Exigences :

- conventions de nommage ;
- validations metier ;
- tests automatises futurs ;
- tests RLS ;
- tests integrations ;
- tests workflows ;
- tests de non-regression ;
- documentation API.

### 17.3 Documentation

Documents a maintenir :

- schema base ;
- dictionnaire donnees ;
- matrice permissions ;
- catalogue API ;
- catalogue webhooks ;
- procedures d'exploitation ;
- plan de sauvegarde ;
- guide incidents ;
- guide IA.

---

## 18. Decoupage du developpement par phases

### Phase 0 - Architecture et preparation

Objectif : figer les fondations.

Livrables :

- validation du present dossier ;
- dictionnaire de donnees MVP ;
- matrice roles/permissions ;
- choix techniques definitifs ;
- schema Supabase initial ;
- strategie RLS ;
- plan environnements ;
- plan migrations.

### Phase 1 - Socle identite, antennes et CRM

Objectif : installer l'ossature.

Modules techniques :

- auth ;
- profiles ;
- roles ;
- permissions ;
- branches ;
- poles ;
- contacts ;
- organizations ;
- audit minimal.

Critere de sortie :

- un utilisateur peut acceder a son antenne avec les bons droits ;
- les contacts et organisations sont gerables ;
- la RLS de base fonctionne.

### Phase 2 - Demandes, dossiers et taches

Objectif : couvrir le coeur operationnel.

Modules :

- incoming_requests ;
- cases ;
- case participants ;
- tasks ;
- status history ;
- checklists ;
- notifications internes.

Critere de sortie :

- une demande peut etre qualifiee, assignee, convertie en dossier et suivie.

### Phase 3 - Documents, modeles et fichiers

Objectif : structurer les pieces et documents.

Modules :

- storage prive ;
- files ;
- documents ;
- templates ;
- document links ;
- versions ;
- validations.

Critere de sortie :

- un dossier peut contenir des pieces, generer un document depuis modele et le valider.

### Phase 4 - IA controlee

Objectif : ajouter l'intelligence sans perdre le controle humain.

Modules :

- ai_suggestions ;
- ai_interactions ;
- analyse demande ;
- brouillon e-mail ;
- synthese dossier ;
- recherche procedure ;
- journalisation.

Critere de sortie :

- l'IA propose, l'humain valide, l'audit conserve.

### Phase 5 - E-mails et integrations Brevo / Google

Objectif : connecter les communications.

Modules :

- emails ;
- email attachments ;
- drafts ;
- Brevo ;
- Gmail/Google Calendar si valide ;
- relances.

Critere de sortie :

- les e-mails entrants et sortants sont rattaches aux objets TVF.

### Phase 6 - Projets, cartographie et observatoire

Objectif : passer du suivi dossier au pilotage territorial.

Modules :

- projects ;
- map_points ;
- territorial_sources ;
- diagnostics ;
- material batches ;
- properties ;
- visits.

Critere de sortie :

- une antenne peut visualiser ses biens, ressources, projets et signalements.

### Phase 7 - Finances, Stripe et reporting

Objectif : professionnaliser les flux financiers.

Modules :

- budgets ;
- budget lines ;
- expenses ;
- funders ;
- funding applications ;
- payment_records ;
- Stripe webhooks ;
- reporting.

Critere de sortie :

- les financements, depenses et paiements sont suivis et exportables.

### Phase 8 - Gouvernance, risques et conformite avancee

Objectif : securiser l'echelle nationale.

Modules :

- decisions ;
- committees ;
- risks ;
- incidents ;
- audits avances ;
- exports conformite ;
- retention RGPD.

Critere de sortie :

- les decisions, risques et audits sont exploitables nationalement.

### Phase 9 - Base de connaissances et apprentissage

Objectif : rendre TVF OS apprenant.

Modules :

- procedures ;
- knowledge_articles ;
- lessons_learned ;
- recherche semantique ;
- suggestions d'amelioration ;
- validation editoriale.

Critere de sortie :

- une experience locale peut devenir connaissance nationale validee.

---

## 19. Risques techniques et parades

| Risque | Impact | Parade |
|---|---|---|
| Permissions trop simples | Fuite de donnees | RLS fine des le debut |
| IA trop autonome | Engagement non controle | Validation humaine obligatoire |
| Documents mal classes | Perte d'information | Metadonnees et rattachement obligatoire |
| Trop de notifications | Fatigue utilisateur | Preferences et regroupement |
| Schema trop rigide | Difficultes d'evolution | Referentiels et workflows configurables |
| Donnees en doublon | CRM peu fiable | Dedoublonnage et contraintes |
| Integrations fragiles | Perte e-mails/paiements | Webhooks idempotents et retries |
| Exports non controles | Risque RGPD | Permission dediee et audit |
| Performance listes | Interface lente | Pagination, index, filtres |
| Antennes mal cloisonnees | Acces non autorise | branch_id obligatoire et policies testees |

---

## 20. Decisions a valider avant implementation

Avant tout developpement, TVF doit valider :

1. Le choix definitif Supabase comme socle.
2. Les roles et permissions MVP.
3. Les niveaux de confidentialite.
4. Les statuts officiels des demandes et dossiers.
5. Les types de dossiers MVP.
6. Les modules de phase 1 et phase 2.
7. Le mode d'integration e-mail : Brevo, Gmail, ou combinaison.
8. Le perimetre IA autorise en MVP.
9. La strategie Google Workspace.
10. La place de Stripe dans la premiere version.
11. Les regles de retention RGPD.
12. Les buckets fichiers et tailles maximales.
13. Les exports autorises.
14. Les indicateurs techniques de supervision.

---

## 21. Synthese technique

TVF OS doit etre construit comme une plateforme metier securisee, multi-antennes, orientee dossiers et connaissances.

Le coeur technique repose sur :

- Supabase pour les donnees, l'authentification, la RLS et le stockage ;
- un backend applicatif pour les operations sensibles, les automatisations et les integrations ;
- un modele de donnees centre sur antennes, demandes, dossiers, contacts, documents, workflows et audit ;
- une IA strictement encadree, journalisee et toujours soumise a validation humaine ;
- une architecture progressive permettant de demarrer par le socle operationnel puis d'etendre vers cartographie, finances, gouvernance et connaissance.

Ce dossier constitue la reference technique avant tout developpement. Toute implementation future devra s'y rattacher ou documenter explicitement les ecarts valides.
