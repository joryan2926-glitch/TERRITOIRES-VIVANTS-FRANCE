# TVF OS ERP - Cahier des charges de refonte

Version : 1.0
Date : 2026-07-11
Statut : socle de refonte valide pour transformation progressive de TVF OS en ERP interne

---

## 1. Objectif general

TVF OS doit devenir l'ERP interne de Territoires Vivants France. Il ne doit plus etre seulement une addition de modules administratifs, mais un systeme central de pilotage permettant de gerer l'activite complete de l'association : demandes, contacts, organisations, dossiers, pieces, conventions, taches, finances, risques, decisions, territoires, impact et historique.

L'objectif n'est pas de repartir de zero. Le socle actuel est conserve. La refonte consiste a ajouter une couche ERP commune au-dessus des modules existants afin que chaque information soit rattachee a un dossier, un tiers, un responsable, un statut, une action et une preuve.

---

## 2. Principe directeur ERP

La logique centrale doit etre :

```text
Tiers -> Demande -> Dossier -> Pieces -> Instruction -> Decision -> Convention -> Budget -> Action terrain -> Impact -> Archivage
```

Chaque module doit servir cette chaine. Aucun module ne doit fonctionner comme un silo isole.

---

## 3. Objets ERP principaux

| Objet | Role | Exemple TVF |
|---|---|---|
| Tiers | Personne ou structure en relation avec TVF | Proprietaire, mairie, entreprise, benevole, financeur |
| Organisation | Structure collective | Commune, EPCI, association, entreprise, fondation |
| Demande | Point d'entree initial | Formulaire, e-mail, appel, WhatsApp, signalement |
| Dossier | Unite centrale d'instruction | Bien vacant, materiaux, partenariat, financement |
| Piece | Document ou preuve | Photo, justificatif, convention, autorisation |
| Tache | Action a faire | Relance, visite, analyse, rendez-vous |
| Decision | Validation humaine tracee | Acceptation, refus, ajournement, convention |
| Budget | Suivi financier du dossier ou projet | Besoin, depense, subvention, mecenat |
| Risque | Point de vigilance | RGPD, assurance, securite, droit d'usage |
| Impact | Resultat attendu ou constate | Logement remis en usage, materiaux reutilises |
| Journal | Historique auditable | Qui a fait quoi, quand, pourquoi |

---

## 4. Modules ERP cibles

### 4.1 CRM / Tiers

Objectif : disposer d'un referentiel propre de tous les contacts et organisations.

Fonctions attendues :

- fiche contact complete ;
- fiche organisation complete ;
- rattachement contact -> organisation ;
- rattachement contact -> dossier ;
- historique des echanges ;
- qualification par type : collectivite, proprietaire, entreprise, association, benevole, financeur ;
- niveau de priorite ;
- consentement RGPD ;
- prochaine action.

### 4.2 Demandes entrantes

Objectif : capter tout ce qui arrive et le transformer en dossier si necessaire.

Fonctions attendues :

- lecture des demandes formulaire ;
- classement par type ;
- creation ou rattachement a un tiers ;
- conversion en dossier ;
- attribution a un responsable ;
- creation automatique d'une tache de qualification ;
- statut : nouveau, a qualifier, en cours, converti, classe, archive.

### 4.3 Dossier unique

Objectif : faire du dossier le coeur de TVF OS.

Chaque dossier doit afficher :

- identifiant dossier ;
- type de dossier ;
- statut ;
- priorite ;
- responsable ;
- territoire ;
- tiers rattaches ;
- demandes sources ;
- pieces attendues ;
- documents generes ;
- taches ;
- risques ;
- decisions ;
- budget ;
- impact ;
- historique.

Workflow standard :

| Etape | Description | Sortie attendue |
|---|---|---|
| Reception | Demande recue | Tiers ou demande creee |
| Qualification | Sujet, urgence, acteur, territoire | Dossier ouvert |
| Instruction | Pieces, faisabilite, risques | Note d'instruction |
| Decision | Validation humaine | Decision tracee |
| Convention | Cadre d'engagement | Document signe ou refuse |
| Execution | Actions terrain | Taches et preuves |
| Impact | Resultats et indicateurs | Reporting |
| Archivage | Cloture propre | Historique complet |

### 4.4 Documents

Objectif : produire et tracer les pieces utiles.

Documents attendus :

- fiche d'instruction ;
- demande de pieces ;
- courrier de partenariat ;
- convention ;
- note de decision ;
- compte rendu de visite ;
- reporting financeur ;
- piece justificative ;
- preuve d'impact.

Chaque document doit etre rattache a un dossier, un tiers, un statut et une version.

### 4.5 Taches / Agenda

Objectif : ne laisser aucun dossier sans prochaine action.

Fonctions attendues :

- tache rattachee a un dossier ;
- responsable ;
- echeance ;
- priorite ;
- statut ;
- relance ;
- historique ;
- creation automatique depuis demande, dossier, risque, finance ou gouvernance.

### 4.6 Finances

Objectif : suivre les besoins, budgets, depenses, financements et reporting.

Fonctions attendues :

- budget par dossier ou projet ;
- depenses ;
- justificatifs ;
- financeurs ;
- opportunites ;
- demandes de financement ;
- paiements ;
- reporting ;
- alertes : justificatif manquant, budget depasse, reporting attendu.

### 4.7 Gouvernance

Objectif : tracer toutes les decisions engageantes.

Fonctions attendues :

- registre des decisions ;
- comites ;
- votes ou avis ;
- proces-verbaux ;
- delegations ;
- actions issues ;
- lien avec dossier, finance, risque et document.

### 4.8 Risques / Conformite

Objectif : proteger TVF avant toute action sensible.

Risques suivis :

- RGPD ;
- autorisation de visite ;
- assurance ;
- droit d'image ;
- securite terrain ;
- conflit d'interet ;
- donnees sensibles ;
- engagement financier ;
- communication prematuree.

### 4.9 Impact

Objectif : mesurer les resultats sans inventer de chiffres.

Fonctions attendues :

- objectifs par dossier ;
- indicateurs reels ;
- preuves ;
- reporting ;
- consolidation par territoire ;
- separation claire entre objectif, prevision et resultat constate.

---

## 5. Navigation ERP cible

Navigation simple :

1. Accueil ERP
2. Entrees
3. Tiers / CRM
4. Dossiers
5. Documents
6. Taches
7. Finances
8. Gouvernance
9. Risques
10. Territoires
11. Impact
12. Systeme

Regle UX : un utilisateur doit savoir en moins de 10 secondes ou commencer.

---

## 6. Tableau de bord ERP cible

Le tableau de bord doit repondre a cinq questions :

1. Qu'est-ce qui vient d'arriver ?
2. Quels dossiers sont bloques ?
3. Quelles decisions attendent une validation ?
4. Quels moyens financiers ou pieces manquent ?
5. Quels impacts sont a prouver ?

---

## 7. Regles de refonte

- Ne pas supprimer les modules existants.
- Ne pas casser les API deja testees.
- Ajouter une couche de coherence au-dessus du code existant.
- Relier progressivement chaque module au dossier unique.
- Conserver les tests automatises.
- Ajouter des actions rapides uniquement si elles respectent les statuts autorises.
- Ne jamais inventer de donnees, financeurs, partenaires ou resultats.
- Privilegier l'archivage a la suppression.
- Toute action importante doit rester tracee.

---

## 8. Priorites de realisation

### Phase 1 - ERP Core

- Repositionner l'accueil admin en accueil ERP.
- Definir la chaine ERP commune.
- Clarifier le role de chaque module.
- Mettre en avant le dossier unique.
- Documenter le cahier des charges ERP.

### Phase 2 - Fiche dossier centrale

- Renforcer la fiche dossier comme centre de rattachement.
- Afficher les tiers, pieces, taches, risques, decisions, finances et impact.
- Ajouter des actions rapides coherentes.

### Phase 3 - Liens transversaux

- Depuis une demande : creer tiers + dossier + tache.
- Depuis un dossier : creer document + risque + decision + budget + tache.
- Depuis une finance : rattacher au dossier et au reporting.

### Phase 4 - Permissions et audit

- Role par utilisateur.
- Permissions par module.
- Journal d'activite lisible.
- Controle des actions sensibles.

### Phase 5 - Pilotage national

- Dashboard direction.
- Indicateurs par territoire.
- Reporting financeurs.
- Export institutionnel.

---

## 9. Pourcentage actuel estime

| Domaine | Avancement |
|---|---:|
| Modules existants | 75 % |
| API Supabase admin | 70 % |
| Tests automatises | 85 % |
| UX ERP unifiee | 45 % |
| Dossier unique central | 55 % |
| Workflow transversal | 45 % |
| Permissions avancees | 40 % |
| Reporting ERP | 50 % |
| Niveau ERP complet | 50 % |

Estimation globale : TVF OS est a environ 50 % d'un ERP complet. La base technique est solide, mais l'experience doit etre recentree autour du dossier unique et du workflow transversal.

---

## 10. Definition de termine

TVF OS pourra etre considere comme ERP operationnel lorsque :

- chaque demande peut devenir un dossier ;
- chaque dossier rattache contacts, organisation, pieces, taches, finances, risques, decisions et impact ;
- chaque module alimente le dossier unique ;
- chaque action critique est tracee ;
- les utilisateurs savent quoi faire sans se perdre ;
- les rapports peuvent etre presentes en reunion interne ou a un financeur ;
- les donnees sensibles sont protegees ;
- les tests automatises restent verts.
