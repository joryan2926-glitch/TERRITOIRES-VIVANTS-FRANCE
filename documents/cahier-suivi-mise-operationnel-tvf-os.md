# Cahier de suivi - Mise a l'operationnel TVF OS

Version : 1.0  
Statut : document interne de pilotage  
Usage : suivre le passage de TVF OS d'un socle beta avance vers un outil operationnel exploitable par Territoires Vivants France.

---

## 1. Objectif du cahier

Ce cahier sert a suivre, module par module, la mise a l'operationnel de TVF OS. Il ne remplace pas le cahier des charges, le dossier UX/UI ou le dossier d'architecture technique : il les transforme en plan d'action verifiable.

Objectif final : obtenir une chaine complete et tracable :

**formulaire / e-mail / contact -> qualification -> dossier -> tache -> document -> decision -> action terrain -> impact -> reporting**.

---

## 2. Regle de pilotage

Un module TVF OS est considere operationnel uniquement si les elements suivants sont reunis :

| Critere | Attendu |
|---|---|
| Interface | Page admin accessible, claire, sans double connexion |
| API | Endpoint securise, teste, sans erreur 500/502 |
| Base de donnees | Tables Supabase presentes, RLS active, index utiles |
| Donnees de test | Donnees de demonstration internes, non publiques |
| Procedure | Usage metier documente, responsable et prochaine action clairs |
| Trace | Journal ou historique disponible pour les actions importantes |
| Parcours | L'utilisateur sait quoi faire ensuite |
| Reporting | Donnees exportables ou exploitables dans un bilan |

---

## 3. Etat fonctionnel cible par bloc

| Bloc | Modules | Niveau cible | Priorite |
|---|---|---|---|
| Entrees | Demandes, e-mails, CRM | Recevoir, qualifier et orienter | P1 |
| Instruction | Dossiers, taches, documents, procedures | Instruire et tracer | P1 |
| Territoires | Carte, observatoire, antennes, impact | Situer et mesurer | P2 |
| Pilotage | Finances, gouvernance, risques | Decider et securiser | P2 |
| Systeme | Utilisateurs, parametres, activite, connaissances, IA | Administrer et capitaliser | P1/P2 |

---

## 4. Matrice de suivi operationnel

| Module | Objectif operationnel | Etat actuel | Prochaine action |
|---|---|---|---|
| Dashboard | Donner une vue globale TVF OS | Base fonctionnelle | Tester avec donnees reelles apres migrations |
| Demandes entrantes | Recevoir et qualifier les formulaires | Fonctionnel cote API/tests | Confirmer le flux production vers Supabase et e-mail |
| CRM | Centraliser contacts et organisations | Base fonctionnelle | Rattacher automatiquement les contacts aux demandes |
| E-mails intelligents | Trier, qualifier, proposer reponses et taches | Schema et tests prets | Brancher une vraie boite entrante quand le canal est valide |
| Dossiers | Transformer une demande en dossier suivi | Base fonctionnelle | Tester creation dossier depuis demande reelle |
| Taches / agenda | Organiser relances et actions | Base fonctionnelle | Creer taches depuis e-mail/dossier |
| Documents | Centraliser modeles et pieces | Base fonctionnelle | Relier pieces a un dossier et statut de validation |
| Procedures | Standardiser les methodes TVF | Base documentaire presente | Lier procedures aux modules et aux statuts |
| Cartographie | Localiser biens, actions, antennes | Socle prepare | Tester cartes avec donnees qualifiees |
| Observatoire | Suivre indicateurs territoriaux | Socle prepare | Connecter aux sources et fiches territoire |
| Antennes | Gerer territoires et maturite | Socle prepare | Definir cycle prefiguration -> lancement -> operationnel |
| Impact | Mesurer resultats et preuves | Socle prepare | Alimenter par dossiers clotures, pas par chiffres inventes |
| Finances | Suivre besoins, financements, contributions | Socle prepare | Relier budgets aux dossiers/projets |
| Gouvernance | Tracer decisions et validations | Socle prepare | Formaliser decisions engageantes et signatures |
| Risques | Identifier points sensibles | Socle prepare | Ajouter seuils d'alerte et responsables |
| Utilisateurs | Gerer acces et roles | Base fonctionnelle | Tester profils reels et permissions |
| Parametres | Piloter integrations et configuration | Base fonctionnelle | Controler Vercel/Supabase/Brevo apres chaque changement |
| Activite | Tracer les actions admin | Base fonctionnelle | Verifier journal apres actions reelles |
| Connaissances | Capitaliser procedures, FAQ, retours | Socle prepare | Alimenter avec decisions et cas terrain |
| Assistant IA | Aider au tri, synthese, reponse | Socle prepare | Garder validation humaine obligatoire |

---

## 5. Routine de mise en service

### Chaque jour de travail

1. Ouvrir TVF OS via `admin-login`.
2. Verifier Dashboard, Demandes, E-mails, Dossiers, Taches.
3. Traiter les demandes nouvelles.
4. Creer ou mettre a jour les dossiers utiles.
5. Ajouter les taches et pieces manquantes.
6. Tracer les decisions importantes.
7. Exporter ou noter les points bloquants.

### Chaque semaine

1. Lancer `npm run check`.
2. Lancer `npm run audit:tvf-os`.
3. Lire `documents/rapport-audit-operationnel-tvf-os.md`.
4. Verifier les modules P1 en production.
5. Nettoyer les donnees de test visibles dans les tableaux.
6. Mettre a jour ce cahier si un module change de niveau.

---

## 6. Criteres avant ouverture a plusieurs utilisateurs

| Critere | Statut attendu |
|---|---|
| Connexion admin unique | Validee desktop et mobile |
| Sessions | Pas de double demande de code entre modules |
| Permissions | Roles testes avec vrais profils |
| Supabase | Toutes les migrations utiles executees |
| RLS | Active et testee sur les tables sensibles |
| Formulaires publics | Enregistrement, notification interne et accuse demandeur valides |
| E-mails | Reception ou import maitrise, pas d'automatisation non validee |
| Documents | Modeles internes separes des documents publics |
| RGPD | Information, consentement, duree de conservation et procedure de suppression documentes |
| Audit | Journal d'activite disponible pour les actions sensibles |

---

## 7. Registre des decisions

| Date | Decision | Impact | Statut |
|---|---|---|---|
| 2026-07-10 | Mettre TVF OS sous suivi operationnel formel | Passage d'une logique de modules a une logique d'exploitation | Actif |
| 2026-07-10 | Ajouter un audit local reproductible `npm run audit:tvf-os` | Mesure reguliere de la capacite fonctionnelle | Actif |
| 2026-07-10 | Prioriser le parcours demande -> dossier -> document -> impact | Evite la dispersion entre modules | Actif |

---

## 8. Prochain lot de travail recommande

| Ordre | Action | Resultat attendu |
|---|---|---|
| 1 | Verifier tous les endpoints admin en production apres Vercel | Liste definitive OK / partiel / bloque |
| 2 | Tester 5 formulaires publics avec cas reels | Demandes visibles, notifiees et classables |
| 3 | Rattacher une demande test a un contact puis un dossier | Demonstration complete du coeur TVF OS |
| 4 | Generer une tache depuis un dossier | Pilotage operationnel concret |
| 5 | Produire un mini-reporting impact sans chiffres inventes | Preuve de suivi credible |

---

## 9. Limites actuelles connues

- Le depot local prouve la structure, mais Supabase production doit rester la source de verite pour les tables reellement executees.
- Le module e-mails est structure mais ne doit pas envoyer de reponses automatiques sans validation humaine.
- Les modules impact, finances et cartographie doivent etre alimentes uniquement par des donnees reelles ou explicitement marquees comme objectifs.
- L'ouverture multi-utilisateurs necessite une phase dediee de roles, permissions et tests RLS.

---

## 10. Definition de termine

TVF OS sera considere operationnel V1 lorsque :

1. les modules P1 repondent en production ;
2. une demande publique peut devenir un dossier suivi ;
3. un dossier peut recevoir pieces, taches, decision et statut ;
4. les documents utiles sont rattaches au bon parcours ;
5. un reporting simple peut etre produit ;
6. les roles et traces sont verifies ;
7. les limites IA, e-mail et RGPD sont clairement encadrees.
