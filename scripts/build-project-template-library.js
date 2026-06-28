const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const modelDir = path.join(root, "documents", "modeles");
fs.mkdirSync(modelDir, { recursive: true });

function writeModel(name, content) {
  fs.writeFileSync(path.join(modelDir, name), `${content.trim()}\n`, "utf8");
}

function extract(file, pattern, label) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const match = source.match(pattern);
  if (!match) throw new Error(`Missing ${label} in ${file}`);
  return match[0];
}

const disclaimer = `Statut : modele de travail TVF a adapter.
Ce document ne vaut pas conseil juridique, fiscal, comptable, technique ou assurantiel.
Toute action doit etre validee par les parties concernees et, si necessaire, par des professionnels competents.`;

const models = {
  "README.md": `# Bibliotheque de modeles TVF

Cette bibliotheque regroupe les trames de travail utiles pour transformer une situation locale en dossier TVF instruisible.

## Principe

Un projet TVF ne doit jamais demarrer uniquement sur une idee ou une intention. Il doit etre documente par :

- une fiche de reperage ;
- une fiche de pre-projet ou de projet complet ;
- une verification des points a verrouiller ;
- un budget previsionnel ;
- un cadre de convention adapte ;
- des indicateurs de suivi ;
- des preuves conservables.

## Fichiers principaux

- fiche-00-reperage-terrain.md
- fiche-01-pre-projet-territorial.md
- fiche-02-projet-complet.md
- fiche-03-budget-financement.md
- fiche-04-indicateurs-impact.md
- checklist-points-a-verrouiller-avant-action.md
- procedure-instruction-projet-territorial.md
- modele-convention-usage-temporaire-bien.md
- modele-convention-cooperation-territoriale.md
- modele-convention-valorisation-materiaux.md
- modele-convention-mecenat-financement.md

## Regle de prudence

Aucun projet ne doit etre annonce comme valide, finance, conventionne ou realise tant que les preuves correspondantes ne sont pas disponibles.
`,

  "fiche-00-reperage-terrain.md": `# Fiche 00 - Reperage terrain

${disclaimer}

Objectif : documenter une situation observee avant toute qualification.

## 1. Informations generales

- Date du reperage :
- Nom du signalant :
- Contact du signalant :
- Statut du signalant : habitant / proprietaire / collectivite / entreprise / association / autre
- Commune :
- Quartier ou secteur :
- Adresse precise ou repere :
- Coordonnees GPS si disponibles :

## 2. Type de situation

- Logement vacant :
- Immeuble degrade :
- Commerce ferme :
- Batiment abandonne :
- Terrain inutilise :
- Friche :
- Materiaux disponibles :
- Depot sauvage :
- Autre :

## 3. Description factuelle

- Ce qui est visible :
- Depuis quand la situation semble exister :
- Signes d'occupation ou d'abandon :
- Risques apparents : effondrement, incendie, amiante suspectee, acces dangereux, insalubrite, pollution, autre.
- Photos disponibles : oui / non
- Autorisation de transmettre les photos : oui / non / a verifier

## 4. Premier besoin territorial pressenti

- Logement :
- Commerce ou activite locale :
- Local associatif :
- Espace vert ou biodiversite :
- Formation ou insertion :
- Reemploi de materiaux :
- Securisation ou proprete :
- Autre besoin :

## 5. Informations manquantes

- Proprietaire inconnu :
- Statut juridique inconnu :
- Etat technique inconnu :
- Autorisations inconnues :
- Interlocuteur local inconnu :
- Donnees publiques a rechercher :

## 6. Decision de premiere lecture

- A completer :
- A qualifier :
- A orienter vers un autre service :
- A mettre en attente :
- Hors cadre TVF :

## 7. Pieces jointes

- Photos :
- Plan ou croquis :
- Capture cartographique :
- Message initial :
- Autres documents :
`,

  "fiche-01-pre-projet-territorial.md": `# Fiche 01 - Pre-projet territorial

${disclaimer}

Objectif : passer d'un reperage a une hypothese de projet presentable a une commune, un EPCI, un proprietaire ou un partenaire.

## 1. Resume du pre-projet

- Nom de travail :
- Territoire :
- Adresse ou perimetre :
- Type de bien ou ressource :
- Probleme traite :
- Usage envisage :
- Statut du dossier : idee / en qualification / a completer / non retenu

## 2. Besoin public identifie

- Besoin local :
- Public concerne :
- Donnees disponibles :
- Source des donnees :
- Cadre public compatible : PLH / OPAH-RU / Action Coeur de Ville / PCAET / ZAN / Contrat de Ville / ESS / autre
- Pourquoi TVF peut etre utile :

## 3. Bien ou ressource concernee

- Proprietaire connu : oui / non / a confirmer
- Interlocuteur identifie :
- Disponibilite :
- Etat apparent :
- Contraintes visibles :
- Diagnostics necessaires :
- Ressources de reemploi possibles :

## 4. Acteurs a mobiliser

- Proprietaire :
- Commune :
- EPCI :
- Services techniques :
- Associations :
- Entreprises :
- Artisans :
- Financeurs ou mecenes potentiels :
- Habitants ou benevoles :

## 5. Hypothese de convention

- Type de convention : usage temporaire / cooperation territoriale / valorisation materiaux / contribution / mecenat / autre
- Duree indicative :
- Contributions envisagees :
- Responsabilites a clarifier :
- Points bloquants :

## 6. Budget de premiere approche

- Etudes et diagnostics :
- Travaux ou securisation :
- Materiaux :
- Logistique :
- Assurance :
- Animation :
- Gestion :
- Imprévus :
- Total estime :
- Financement confirme :
- Financement a rechercher :

## 7. Decision attendue

- Poursuivre en fiche projet complete :
- Demander des informations complementaires :
- Organiser une visite :
- Rechercher le proprietaire :
- Solliciter une collectivité :
- Orienter vers un dispositif existant :
- Abandonner / mettre en attente :
`,

  "fiche-02-projet-complet.md": `# Fiche 02 - Projet complet TVF

${disclaimer}

Objectif : disposer d'un dossier pret a instruire avant mobilisation operationnelle, recherche de financement ou signature de convention.

## 1. Identite du projet

- Nom du projet :
- Territoire :
- Adresse :
- Commune :
- EPCI :
- Quartier :
- Referent TVF :
- Referent externe :
- Date de creation :
- Date de mise a jour :
- Statut : etude / mobilisation / financement / convention / realisation / suspendu / termine

## 2. Situation de depart

- Description du bien, local, terrain, friche ou ressource :
- Historique connu :
- Etat actuel :
- Probleme territorial traite :
- Donnees publiques mobilisees :
- Sources :
- Limites des informations :

## 3. Objectifs du projet

- Objectif principal :
- Objectifs secondaires :
- Publics beneficiaires :
- Usage futur :
- Resultats attendus :
- Ce qui ne doit pas etre promis :

## 4. Diagnostic

- Situation juridique :
- Proprietaire et droits :
- Urbanisme :
- Diagnostics techniques :
- Securite :
- Assurance :
- Accessibilite :
- Reseaux :
- Environnement :
- Pollution ou risques :
- Besoin d'expertise externe :

## 5. Montage operationnel

- Etapes :
- Calendrier :
- Intervenants :
- Gouvernance :
- Reunions de suivi :
- Livrables :
- Autorisations necessaires :
- Conditions de lancement :
- Conditions d'arret :

## 6. Convention

- Type de convention :
- Parties :
- Objet :
- Duree :
- Droits d'usage :
- Contributions :
- Responsabilites :
- Assurances :
- Communication :
- Suivi :
- Fin de convention :
- Annexes obligatoires :

## 7. Budget et financement

- Budget total estime :
- Devis obtenus :
- Contributions en nature :
- Financements confirmes :
- Financements sollicites :
- Reste a financer :
- Risques budgetaires :
- Regle de transparence :

## 8. Indicateurs d'impact

- Indicateurs de realisation :
- Indicateurs d'usage :
- Indicateurs sociaux :
- Indicateurs environnementaux :
- Indicateurs economiques :
- Preuves attendues :
- Frequence de suivi :

## 9. Communication

- Informations publiables :
- Informations confidentielles :
- Logos autorises :
- Validation des partenaires :
- Photos autorisees :
- Mentions interdites tant que non confirmees :

## 10. Decision

- Avis TVF :
- Avis proprietaire :
- Avis collectivite :
- Avis technique :
- Decision : poursuivre / ajourner / reorienter / abandonner
- Motifs :
- Prochaine etape :
`,

  "fiche-03-budget-financement.md": `# Fiche 03 - Budget et financement

${disclaimer}

Objectif : separer les besoins, les devis, les contributions confirmees et les financements a rechercher.

## 1. Synthese budgetaire

- Nom du projet :
- Date :
- Version :
- Budget total estime :
- Budget confirme :
- Contributions en nature :
- Reste a financer :
- Niveau de fiabilite : estimation / devis / engagement / convention

## 2. Depenses

| Poste | Description | Montant estime | Devis recu | Montant confirme | Commentaire |
| --- | --- | ---: | --- | ---: | --- |
| Etudes et diagnostics |  |  |  |  |  |
| Securisation |  |  |  |  |  |
| Gros oeuvre |  |  |  |  |  |
| Second oeuvre |  |  |  |  |  |
| Materiaux |  |  |  |  |  |
| Logistique et transport |  |  |  |  |  |
| Assurance |  |  |  |  |  |
| Animation / insertion |  |  |  |  |  |
| Gestion et suivi |  |  |  |  |  |
| Communication autorisee |  |  |  |  |  |
| Imprévus |  |  |  |  |  |

## 3. Ressources

| Source | Nature | Montant ou valeur | Statut | Preuve |
| --- | --- | ---: | --- | --- |
| TVF |  |  | non confirme / confirme |  |
| Collectivite |  |  | non confirme / confirme |  |
| Entreprise |  |  | non confirme / confirme |  |
| Mecene |  |  | non confirme / confirme |  |
| Fondation |  |  | non confirme / confirme |  |
| Dons citoyens |  |  | non confirme / confirme |  |
| Materiaux en nature |  |  | non confirme / confirme |  |

## 4. Regles de prudence

- Ne pas presenter une subvention comme acquise sans notification.
- Ne pas presenter un mecene comme partenaire sans accord ecrit.
- Ne pas valoriser des materiaux sans accord sur l'etat, le retrait et l'affectation.
- Ne pas communiquer de reduction fiscale sans validation juridique.
- Ne pas lancer une action si les assurances et responsabilites ne sont pas claires.
`,

  "fiche-04-indicateurs-impact.md": `# Fiche 04 - Indicateurs et preuves d'impact

${disclaimer}

Objectif : mesurer uniquement ce qui est documente.

## 1. Informations generales

- Projet :
- Territoire :
- Referent :
- Periode de suivi :
- Statut du projet :

## 2. Indicateurs de realisation

| Indicateur | Valeur cible | Valeur reelle | Preuve | Date |
| --- | ---: | ---: | --- | --- |
| Bien qualifie |  |  | fiche projet |  |
| Convention signee |  |  | convention |  |
| Travaux engages |  |  | devis / photos / facture |  |
| Bien remis en usage |  |  | attestation / photos |  |
| Local ou espace ouvert |  |  | convention / constat |  |

## 3. Indicateurs materiaux

| Indicateur | Valeur cible | Valeur reelle | Preuve |
| --- | ---: | ---: | --- |
| Materiaux proposes |  |  | fiche materiaux |
| Materiaux acceptes |  |  | validation TVF |
| Materiaux reemployes |  |  | registre d'affectation |
| Destination des materiaux |  |  | fiche projet |

## 4. Indicateurs sociaux

- Personnes accueillies :
- Benevoles mobilises :
- Heures benevoles :
- Heures d'insertion :
- Ateliers organises :
- Publics concernes :

## 5. Indicateurs environnementaux

- Surface requalifiee :
- Dechets evites :
- Materiaux reemployes :
- Artificialisation evitee :
- Biodiversite ou vegetation :
- Limites de calcul :

## 6. Preuves a conserver

- Photos avant / pendant / apres :
- Autorisations de diffusion :
- Factures :
- Devis :
- Conventions :
- Comptes rendus :
- Feuilles de presence :
- Registre materiaux :
- Bilan final :
`,

  "checklist-points-a-verrouiller-avant-action.md": `# Checklist - Points a verrouiller avant toute action

${disclaimer}

Cette checklist doit etre completee avant visite publique, chantier, communication, collecte de materiaux, occupation, recherche de financement ou signature de convention.

## 1. Identification

- [ ] Adresse ou perimetre confirme
- [ ] Type de bien ou ressource confirme
- [ ] Photos autorisees ou sourcees
- [ ] Referent TVF identifie
- [ ] Interlocuteur externe identifie

## 2. Propriete et droits

- [ ] Proprietaire identifie
- [ ] Accord de principe du proprietaire obtenu
- [ ] Mandat, indivision, copropriete ou representation clarifies
- [ ] Droit d'acces au site clarifie
- [ ] Droit d'usage envisage clarifie

## 3. Securite et technique

- [ ] Risques visibles releves
- [ ] Besoin de diagnostic technique identifie
- [ ] Acces securise
- [ ] Presence potentielle d'amiante, plomb, pollution ou insalubrite signalee
- [ ] Public non autorise tenu a l'ecart
- [ ] Intervenants competents identifies

## 4. Urbanisme et autorisations

- [ ] Regles d'urbanisme a verifier
- [ ] Autorisations de travaux a verifier
- [ ] Reglement ERP a verifier si accueil du public
- [ ] Accessibilite a verifier si usage public
- [ ] Obligations environnementales a verifier

## 5. Assurance et responsabilites

- [ ] Responsabilite civile identifiee
- [ ] Assurance occupation / chantier / benevoles a verifier
- [ ] Responsabilite du proprietaire clarifiee
- [ ] Responsabilite de TVF clarifiee
- [ ] Responsabilite des entreprises ou artisans clarifiee

## 6. Budget et financement

- [ ] Budget preliminaire etabli
- [ ] Devis ou estimations distingues
- [ ] Contributions confirmees separees des pistes
- [ ] Reste a financer calcule
- [ ] Aucun financeur annonce sans accord
- [ ] Aucun avantage fiscal promis sans validation

## 7. Convention

- [ ] Type de convention identifie
- [ ] Parties identifiees
- [ ] Objet redige
- [ ] Duree proposee
- [ ] Contributions listees
- [ ] Sortie ou restitution prevues
- [ ] Annexes preparees

## 8. Donnees, images et communication

- [ ] Donnees personnelles limitees au necessaire
- [ ] Droit a l'image verifie
- [ ] Adresse sensible non publiee sans base claire
- [ ] Logos partenaires non utilises sans accord
- [ ] Statut du projet affiche : idee / etude / convention / realise
- [ ] Aucun chiffre d'impact publie sans preuve

## 9. Decision finale avant action

- [ ] Le projet est-il utile au territoire ?
- [ ] Le cadre juridique est-il suffisamment clair ?
- [ ] Les risques sont-ils proportionnes ?
- [ ] Les moyens sont-ils disponibles ?
- [ ] Les responsabilites sont-elles acceptees ?
- [ ] La gouvernance est-elle lisible ?
- [ ] La decision est-elle documentee ?
`,

  "procedure-instruction-projet-territorial.md": `# Procedure - Instruction d'un projet territorial TVF

${disclaimer}

## Etape 1 - Reception

- Recevoir un signalement, une proposition de bien, une proposition de materiaux ou une sollicitation.
- Attribuer un numero interne.
- Accuser reception sans promettre de suite favorable.

## Etape 2 - Premier tri

- Verifier l'adresse ou le perimetre.
- Identifier le type de situation.
- Controler les informations manquantes.
- Classer : a completer / a qualifier / hors cadre / urgent a orienter.

## Etape 3 - Qualification

- Completer la fiche de reperage.
- Rechercher les donnees publiques disponibles.
- Identifier les acteurs concernes.
- Evaluer les risques principaux.
- Verifier si une visite est pertinente.

## Etape 4 - Pre-projet

- Rediger une fiche de pre-projet.
- Relier la situation a un besoin public.
- Identifier les cadres compatibles : PLH, OPAH-RU, PCAET, ZAN, Action Coeur de Ville, Contrat de Ville, ESS, autres.
- Identifier le type de convention possible.

## Etape 5 - Arbitrage interne

- Examiner utilite territoriale, faisabilite, risques, moyens et coherence TVF.
- Decider : poursuivre, ajourner, reorienter ou abandonner.
- Documenter les motifs.

## Etape 6 - Montage complet

- Rediger la fiche projet complete.
- Construire le budget.
- Definir les indicateurs.
- Preparer la convention adaptee.
- Identifier les pieces annexes.

## Etape 7 - Validation externe

- Faire relire par les parties concernees.
- Verifier assurances, autorisations, fiscalite, securite, donnees, communication.
- Ne pas lancer tant que les points bloquants ne sont pas leves.

## Etape 8 - Lancement encadre

- Signer la convention si necessaire.
- Nommer un referent.
- Ouvrir un registre de suivi.
- Conserver les preuves.
- Communiquer uniquement ce qui est autorise.

## Etape 9 - Suivi et bilan

- Mettre a jour les indicateurs.
- Conserver les justificatifs.
- Produire un bilan intermediaire puis final.
- Publier uniquement les resultats verifies.
`,

  "modele-convention-usage-temporaire-bien.md": `# Modele - Convention d'usage temporaire d'un bien

${disclaimer}

## 1. Parties

- Proprietaire :
- Occupant ou utilisateur autorise :
- Territoires Vivants France :
- Referents :

## 2. Bien concerne

- Adresse :
- Nature du bien :
- Surface :
- Etat d'entree :
- Annexes : photos, plans, diagnostics, inventaire.

## 3. Objet

La convention definit les conditions dans lesquelles le bien peut etre etudie, securise, valorise, occupe ou remis en usage temporaire dans un objectif d'utilite territoriale.

## 4. Propriete

Le proprietaire conserve la pleine propriete du bien. La convention ne cree aucun transfert de propriete.

## 5. Usage autorise

- Usage principal :
- Usages exclus :
- Publics accueillis :
- Horaires :
- Conditions d'acces :
- Interdictions specifiques :

## 6. Duree

- Date de debut :
- Date de fin :
- Renouvellement :
- Sortie anticipee :
- Conditions de suspension :

## 7. Travaux et amenagements

- Travaux autorises :
- Travaux interdits :
- Autorisations administratives :
- Responsabilite de maitrise d'ouvrage :
- Materiaux de reemploi :
- Remise en etat :

## 8. Charges, entretien et assurance

- Charges proprietaire :
- Charges utilisateur :
- Assurance proprietaire :
- Assurance utilisateur :
- Entretien courant :
- Reparations :
- Gestion des incidents :

## 9. Securite

- Diagnostic securite :
- Regles d'acces :
- Accueil du public :
- Intervention de benevoles :
- Entreprises autorisees :
- Registre des incidents :

## 10. Suivi

- Comite de suivi :
- Frequence :
- Indicateurs :
- Pieces justificatives :
- Bilan :

## 11. Communication

- Informations publiables :
- Logos autorises :
- Photos autorisees :
- Validation avant publication :

## 12. Fin de convention

- Etat de sortie :
- Restitution des cles :
- Sort des materiaux restants :
- Bilan d'usage :
- Archivage :
`,

  "modele-convention-cooperation-territoriale.md": `# Modele - Convention de cooperation territoriale

${disclaimer}

## 1. Parties

- Collectivite :
- EPCI :
- Service referent :
- Territoires Vivants France :
- Autres parties :

## 2. Objet de la cooperation

- Diagnostic territorial :
- Cartographie :
- Reperage de biens vacants :
- Reemploi de materiaux :
- Mobilisation citoyenne :
- Fiches projets :
- Animation territoriale :

## 3. Perimetre

- Commune :
- Quartiers :
- Types de biens :
- Publics concernes :
- Duree :

## 4. Contributions de la collectivite

- Donnees partageables :
- Locaux ou terrains :
- Materiaux ou equipements :
- Mise en relation :
- Appui logistique :
- Participation au suivi :

## 5. Contributions de TVF

- Methodologie :
- Formulaires :
- Fiches projets :
- Animation :
- Documentation :
- Suivi d'impact :
- Restitution :

## 6. Gouvernance

- Referents :
- Comite de suivi :
- Frequence :
- Circuit de decision :
- Gestion des conflits :
- Confidentialite :

## 7. Donnees

- Sources :
- Droits d'acces :
- Donnees personnelles :
- Donnees sensibles :
- Publication :
- Archivage :

## 8. Livrables

- Fiches de reperage :
- Cartographie preparatoire :
- Fiches projets :
- Tableaux de suivi :
- Bilan :
- Recommandations :

## 9. Communication

- Mentions autorisees :
- Logos :
- Validation :
- Communication de crise :

## 10. Fin de cooperation

- Bilan final :
- Remise des donnees :
- Suppression ou archivage :
- Suites possibles :
`,

  "modele-convention-valorisation-materiaux.md": `# Modele - Convention de valorisation de materiaux

${disclaimer}

## 1. Parties

- Contributeur :
- Statut : entreprise / collectivite / association / particulier
- Territoires Vivants France :
- Referents :

## 2. Materiaux concernes

| Categorie | Quantite | Etat | Localisation | Photos | Documents |
| --- | ---: | --- | --- | --- | --- |
| Bois |  |  |  |  |  |
| Portes |  |  |  |  |  |
| Fenetres |  |  |  |  |  |
| Sanitaires |  |  |  |  |  |
| Mobilier |  |  |  |  |  |
| Autres |  |  |  |  |  |

## 3. Conditions d'acceptation

- Etat verifie :
- Risques sanitaires :
- Conformite :
- Demontage :
- Transport :
- Stockage :
- Assurance :
- Delai de retrait :

## 4. Affectation

Les materiaux ne sont pas distribues automatiquement. TVF peut :

- accepter ;
- refuser ;
- differer ;
- demander des informations complementaires ;
- affecter vers un projet valide ;
- orienter vers une filiere plus adaptee.

## 5. Tracabilite

- Date de proposition :
- Date d'acceptation :
- Date de retrait :
- Projet destinataire :
- Quantite reemployee :
- Quantite non retenue :
- Preuves :

## 6. Communication

- Mention du contributeur :
- Logo :
- Photos :
- Chiffres d'impact :
- Validation avant publication :

## 7. Fin

- Sort des materiaux non retires :
- Annulation :
- Bilan :
- Archivage :
`,

  "modele-convention-mecenat-financement.md": `# Modele - Convention de soutien financier ou mecenat

${disclaimer}

## 1. Parties

- Soutien / mecene / financeur :
- Territoires Vivants France :
- Projet concerne :
- Referents :

## 2. Nature du soutien

- Don financier :
- Mecenat de competences :
- Contribution en nature :
- Soutien affecte a un projet :
- Soutien non affecte :

## 3. Montant ou valeur

- Montant :
- Echeancier :
- Conditions de versement :
- Valorisation en nature :
- Justificatifs :

## 4. Affectation

- Projet :
- Budget previsionnel :
- Depenses eligibles :
- Depenses exclues :
- Modification possible :
- Reste a financer :

## 5. Reporting

- Frequence :
- Documents transmis :
- Indicateurs :
- Limites :
- Bilan final :

## 6. Fiscalite

Toute information fiscale doit etre verifiee selon le statut de TVF, la nature du soutien et la situation du contributeur. TVF ne doit pas promettre de reduction fiscale sans base juridique confirmee.

## 7. Communication

- Mention publique :
- Logo :
- Communique :
- Photos :
- Validation :
- Confidentialite :

## 8. Fin ou suspension

- Conditions de suspension :
- Restitution impossible ou possible :
- Reaffectation :
- Bilan :
`,

  "fiche-projet-tvf.md": `# Fiche projet TVF - Modele historique conserve

${disclaimer}

Statut : fichier conserve pour compatibilite avec les anciens liens du site.
Modele recommande : fiche-02-projet-complet.md

## Utilisation

Cette fiche peut servir de version courte lorsqu'un projet est encore au stade de l'idee. Pour un dossier presentable a une collectivite, un proprietaire, une entreprise, un financeur ou un partenaire, utiliser la fiche complete.

## 1. Identification rapide

- Nom du projet :
- Commune :
- Adresse ou secteur :
- Type : logement / commerce / friche / terrain / materiaux / insertion / autre
- Porteur pressenti :
- Referent TVF :
- Date :

## 2. Probleme traite

- Situation actuelle :
- Besoin territorial :
- Publics concernes :
- Consequences locales :
- Urgence ou priorite :

## 3. Solution envisagee

- Usage futur :
- Beneficiaires :
- Acteurs a mobiliser :
- Ressources necessaires :
- Freins connus :

## 4. Points a verifier avant suite

- Proprietaire ou responsable identifie :
- Droit d'acces :
- Securite :
- Urbanisme :
- Assurance :
- Budget :
- Convention :
- Communication :

## 5. Suite recommandee

- Completer fiche-00-reperage-terrain.md :
- Completer fiche-01-pre-projet-territorial.md :
- Completer fiche-02-projet-complet.md :
- Passer la checklist avant action :
- Choisir une trame de convention :
`,

  "fiche-signalement-lieu-vacant.md": `# Fiche de signalement d'un lieu vacant

${disclaimer}

Statut : fichier conserve pour compatibilite avec les anciens liens du site.
Modele recommande : fiche-00-reperage-terrain.md

## 1. Signalement

- Date :
- Nom du signalant :
- Contact facultatif :
- Commune :
- Adresse ou repere :
- Type : logement vacant / commerce ferme / batiment abandonne / terrain abandonne / friche / autre
- Description factuelle :

## 2. Elements disponibles

- Photos :
- Coordonnees GPS :
- Risques visibles :
- Proprietaire connu :
- Occupation apparente :
- Informations publiques deja trouvees :

## 3. Orientation TVF

- A qualifier :
- A transmettre a un acteur competent :
- Hors cadre TVF :
- Informations manquantes :

Pour aller plus loin, completer la fiche 00 de reperage terrain.
`,

  "fiche-proposition-materiaux.md": `# Fiche de proposition de materiaux

${disclaimer}

Statut : fichier conserve pour compatibilite avec les anciens liens du site.
Modele recommande : modele-convention-valorisation-materiaux.md

## 1. Contributeur

- Nom :
- Statut : particulier / entreprise / collectivite / association / autre
- Contact :
- Commune :
- Adresse de retrait ou stockage :

## 2. Materiaux proposes

- Categorie :
- Quantite :
- Etat :
- Photos :
- Contraintes de retrait :
- Delai :
- Risques ou reserves :

## 3. Cadre TVF

Les materiaux proposes ne sont pas distribues automatiquement. TVF qualifie leur etat, accepte ou refuse la contribution, puis peut les affecter a un projet valide dans le cadre d'une convention de valorisation.

## 4. Suite recommandee

- Completer la convention de valorisation de materiaux :
- Verifier transport, stockage, assurance et tracabilite :
- Identifier le projet destinataire :
`,

  "registre-suivi-impact.md": `# Registre de suivi d'impact

${disclaimer}

Statut : fichier conserve pour compatibilite avec les anciens liens du site.
Modele recommande : fiche-04-indicateurs-impact.md

## Principe

TVF ne publie aucun chiffre d'impact sans preuve. Les indicateurs doivent distinguer :

- objectif ;
- estimation ;
- resultat en cours ;
- resultat valide ;
- source ;
- preuve associee.

## Tableau de suivi rapide

| Indicateur | Objectif | Resultat valide | Source | Preuve | Date |
| --- | ---: | ---: | --- | --- | --- |
| Logements remis en usage |  |  |  |  |  |
| Commerces accompagnes |  |  |  |  |  |
| Friches qualifiees |  |  |  |  |  |
| Materiaux reemployes |  |  |  |  |  |
| Beneficiaires |  |  |  |  |  |
| Benevoles mobilises |  |  |  |  |  |

Pour un suivi complet, utiliser la fiche 04 indicateurs et preuves d'impact.
`,
};

for (const [name, content] of Object.entries(models)) writeModel(name, content);

const header = extract("index.html", /<header class="site-header"[\s\S]*?<\/header>/, "header");
const footer = extract("index.html", /<footer class="site-footer"[\s\S]*?<\/footer>/, "footer");

const structuredData = `<script id="global-structured-data" type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.territoiresvivantsfrance.fr/#organization","name":"Territoires Vivants France","url":"https://www.territoiresvivantsfrance.fr/","logo":"https://www.territoiresvivantsfrance.fr/assets/logo-territoires-vivants-france.png","address":{"@type":"PostalAddress","streetAddress":"25 rue Elise Gervais","postalCode":"42000","addressLocality":"Saint-Etienne","addressCountry":"FR"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.territoiresvivantsfrance.fr/"},{"@type":"ListItem","position":2,"name":"Observatoire","item":"https://www.territoiresvivantsfrance.fr/observatoire-national.html"},{"@type":"ListItem","position":3,"name":"Fiches projet territorialis&eacute;es","item":"https://www.territoiresvivantsfrance.fr/fiches-projets-territorialisees.html"}]}]}</script>`;

const downloads = [
  ["Fiche 00 - Rep&eacute;rage terrain", "Premi&egrave;re lecture d'une adresse, d'un bien, d'un terrain, d'une friche ou d'une ressource.", "fiche-00-reperage-terrain.md"],
  ["Fiche 01 - Pr&eacute;-projet territorial", "Hypoth&egrave;se de projet &agrave; pr&eacute;senter &agrave; une commune, un EPCI, un propri&eacute;taire ou un partenaire.", "fiche-01-pre-projet-territorial.md"],
  ["Fiche 02 - Projet complet TVF", "Dossier pr&ecirc;t &agrave; instruire avec diagnostic, convention, budget, gouvernance et indicateurs.", "fiche-02-projet-complet.md"],
  ["Budget et financement", "Tableau pour distinguer estimations, devis, financements confirm&eacute;s, contributions en nature et reste &agrave; financer.", "fiche-03-budget-financement.md"],
  ["Indicateurs et preuves d'impact", "Registre pour mesurer uniquement ce qui est document&eacute; et v&eacute;rifiable.", "fiche-04-indicateurs-impact.md"],
  ["Checklist avant action", "Points &agrave; verrouiller avant visite, chantier, collecte, communication ou convention.", "checklist-points-a-verrouiller-avant-action.md"],
  ["Proc&eacute;dure d'instruction", "Parcours interne de la r&eacute;ception d'une demande jusqu'au bilan final.", "procedure-instruction-projet-territorial.md"],
  ["Convention d'usage temporaire", "Trame pour encadrer un bien vacant ou inutilis&eacute;, la dur&eacute;e, les usages, charges et restitution.", "modele-convention-usage-temporaire-bien.md"],
  ["Convention de coop&eacute;ration territoriale", "Trame pour travailler avec une commune, un EPCI ou un acteur public territorial.", "modele-convention-cooperation-territoriale.md"],
  ["Convention de valorisation de mat&eacute;riaux", "Trame pour accepter, refuser, tracer ou affecter des ressources de r&eacute;emploi.", "modele-convention-valorisation-materiaux.md"],
  ["Convention de soutien financier", "Trame pour cadrer don, m&eacute;c&eacute;nat, contribution en nature, reporting et communication.", "modele-convention-mecenat-financement.md"],
];

const downloadCards = downloads
  .map(([title, text, file]) => `<article class="document-card"><span class="document-status" data-state="draft">Mod&egrave;le de travail</span><h3>${title}</h3><p>${text}</p><a href="documents/modeles/${file}" download>T&eacute;l&eacute;charger</a></article>`)
  .join("");

const page = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fiches projet territorialis&eacute;es | TERRITOIRES VIVANTS FRANCE</title>
    <meta name="description" content="Mod&egrave;les TVF de fiches projet territorialis&eacute;es, conventions, budget, indicateurs et checklist des points &agrave; verrouiller avant toute action." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.territoiresvivantsfrance.fr/fiches-projets-territorialisees.html" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:site_name" content="TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:title" content="Fiches projet territorialis&eacute;es | TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:description" content="Transformer un bien, un besoin public ou une ressource en dossier op&eacute;rationnel : fiche projet, convention, budget, indicateurs et garde-fous." />
    <meta property="og:url" content="https://www.territoiresvivantsfrance.fr/fiches-projets-territorialisees.html" />
    <meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/saint-etienne-design.jpg" />
    <link rel="stylesheet" href="styles.css" />
    ${structuredData}
  </head>
  <body>
    ${header}
    <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span><span>Observatoire</span><span class="breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">Fiches projet territorialis&eacute;es</span></nav>
    <main class="impact-study-page" data-professional-enrichment="public-page">
      <section class="page-hero">
        <div><span class="page-status" data-status="pilot">Outil op&eacute;rationnel</span>
          <h1>Fiches projet <span>territorialis&eacute;es</span></h1>
          <p>Transformer un signalement, un bien vacant ou une ressource inutilis&eacute;e en dossier pr&ecirc;t &agrave; instruire : besoin public, dispositif compatible, acteurs &agrave; mobiliser, convention, budget et indicateurs.</p>
        </div>
        <img decoding="async" fetchpriority="high" class="page-hero-photo" src="assets/photos/saint-etienne-design.jpg" alt="Dossier de projet territorial avec documents, plans et budget" width="1800" height="1200" />
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Biblioth&egrave;que de mod&egrave;les</span>
        <h2>Des fichiers concrets pour passer de l'id&eacute;e au dossier op&eacute;rationnel</h2>
        <p class="lead-block">Chaque fichier est une trame de travail &agrave; adapter. Ces documents ne remplacent pas une validation juridique, technique, fiscale ou assurantielle, mais ils permettent de ne pas oublier les informations essentielles avant d'agir.</p>
        <div class="document-grid">${downloadCards}</div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Ordre recommand&eacute;</span>
        <h2>Utiliser les fiches dans une suite logique</h2>
        <div class="decision-flow">
          <article><h3>1. Rep&eacute;rer</h3><p>Remplir la fiche 00 avec l'adresse, les photos, le type de situation, les risques visibles et les informations manquantes.</p></article>
          <article><h3>2. Pr&eacute;-qualifier</h3><p>Utiliser la fiche 01 pour relier la situation &agrave; un besoin public et &agrave; un cadre territorial compatible.</p></article>
          <article><h3>3. Verrouiller</h3><p>Passer par la checklist avant toute visite publique, annonce, collecte, chantier, mobilisation ou convention.</p></article>
          <article><h3>4. Instruire</h3><p>Compl&eacute;ter la fiche 02 avec diagnostic, budget, acteurs, gouvernance, risques, convention et indicateurs.</p></article>
          <article><h3>5. Conventionner</h3><p>Choisir la trame adapt&eacute;e : usage temporaire, coop&eacute;ration territoriale, valorisation de mat&eacute;riaux ou soutien financier.</p></article>
          <article><h3>6. Suivre</h3><p>Renseigner les indicateurs uniquement avec des preuves : photos autoris&eacute;es, conventions, devis, registres, comptes rendus et bilans.</p></article>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Points &agrave; verrouiller</span>
        <h2>Aucun projet ne doit d&eacute;marrer sans garde-fous</h2>
        <div class="table-scroll">
          <table class="impact-data-table">
            <thead><tr><th>Bloc</th><th>&Agrave; v&eacute;rifier</th><th>Risque si oubli&eacute;</th></tr></thead>
            <tbody>
              <tr><td>Propri&eacute;t&eacute;</td><td>Propri&eacute;taire, droit d'acc&egrave;s, mandat, indivision, accord &eacute;crit.</td><td>Entr&eacute;e non autoris&eacute;e, conflit, projet bloqu&eacute;.</td></tr>
              <tr><td>S&eacute;curit&eacute;</td><td>Risques visibles, diagnostics, amiante ou plomb suspect&eacute;s, acc&egrave;s, public.</td><td>Mise en danger des personnes et responsabilit&eacute;s non ma&icirc;tris&eacute;es.</td></tr>
              <tr><td>Urbanisme</td><td>Destination, travaux, ERP, accessibilit&eacute;, environnement, autorisations.</td><td>Projet incompatible ou travaux irr&eacute;guliers.</td></tr>
              <tr><td>Assurance</td><td>Responsabilit&eacute; civile, chantier, occupation, b&eacute;n&eacute;voles, transport, stockage.</td><td>Dommages non couverts ou responsabilit&eacute;s floues.</td></tr>
              <tr><td>Budget</td><td>Estimations, devis, contributions confirm&eacute;es, reste &agrave; financer, impr&eacute;vus.</td><td>Promesse irr&eacute;aliste ou financement non s&eacute;curis&eacute;.</td></tr>
              <tr><td>Communication</td><td>Photos, logos, financeurs, partenaires, chiffres, statut du projet.</td><td>Perte de cr&eacute;dibilit&eacute; ou annonce non autoris&eacute;e.</td></tr>
              <tr><td>Convention</td><td>Objet, dur&eacute;e, contributions, responsabilit&eacute;s, sortie, bilan, annexes.</td><td>Action sans cadre clair et difficile &agrave; suivre.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Documents li&eacute;s</span>
        <h2>Pages &agrave; consulter avant de lancer une fiche</h2>
        <div class="document-grid">
          <article class="document-card"><h3>Dossier Saint-&Eacute;tienne</h3><p>Contexte territorial du premier territoire pilote.</p><a href="dossier-saint-etienne.html">Consulter</a></article>
          <article class="document-card"><h3>TVF et les enjeux de Saint-&Eacute;tienne</h3><p>Matrice besoin, dispositif existant, r&eacute;ponse TVF et impact attendu.</p><a href="tvf-enjeux-saint-etienne.html">Consulter</a></article>
          <article class="document-card"><h3>Documents et conventions</h3><p>Registre des cadres institutionnels, trames et statuts de projet.</p><a href="documents-officiels.html">Consulter</a></article>
          <article class="document-card"><h3>Parcours propri&eacute;taires</h3><p>Lecture d&eacute;taill&eacute;e des cas de biens vacants et usages temporaires.</p><a href="proprietaires.html">Consulter</a></article>
        </div>
      </section>

      <section class="cta-strip">
        <div>
          <h2>Construire une premi&egrave;re fiche projet</h2>
          <p>Le bon point de d&eacute;part reste une situation v&eacute;rifiable : adresse, besoin local, interlocuteur, cadre compatible et premi&egrave;res preuves.</p>
        </div>
        <a class="button" href="contact.html">Transmettre une situation</a>
      </section>
    </main>
    ${footer}
    <script defer src="navigation.js"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(root, "fiches-projets-territorialisees.html"), page, "utf8");

console.log(JSON.stringify({ models: Object.keys(models).length, page: "fiches-projets-territorialisees.html" }, null, 2));
