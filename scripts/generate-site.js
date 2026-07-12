const fs = require("fs");
const path = require("path");

const site = {
  name: "Territoires Vivants France",
  url: "https://www.territoiresvivantsfrance.fr",
  lastModified: "2026-07-04",
  description:
    "Plateforme nationale de coopÃ©ration pour remettre en usage les logements, commerces, bÃ¢timents, terrains et matÃ©riaux inutilisÃ©s.",
};

const contact = {
  email: "contact@territoiresvivantsfrance.fr",
  phone: "04 65 81 54 69",
  phoneHref: "+33465815469",
  address: "25 rue Ã‰lise Gervais, 42000 Saint-Ã‰tienne",
};

const socialLinks = {
  whatsapp: "https://wa.me/message/SKYLJHX46E43C1",
  facebook: "https://www.facebook.com/share/1Ef3zqWypK/",
  instagram: "https://www.instagram.com/territoiresvivantsfrance?igsh=MW5uajF2MmQ3MW91OQ==",
};

const whatsappQr = "assets/qr-whatsapp-tvf.png";

const official = {
  status: "Association loi 1901 dÃ©clarÃ©e",
  rna: "W423016361",
  siren: "107 226 128",
  siret: "107 226 128 00018",
  legalCategory: "9220 - Association dÃ©clarÃ©e",
  ape: "94.99Z - Autres organisations fonctionnant par adhÃ©sion volontaire",
  ess: "Oui",
  sireneDate: "7 juillet 2026",
  activeSince: "1er juillet 2026",
  declarationDate: "1er juillet 2026",
  decisionDate: "22 juin 2026",
  receiptDate: "2 juillet 2026",
  receiptPlace: "Roanne",
  authority: "PrÃ©fet de la Loire - Sous-prÃ©fecture de Roanne",
  receiptLabel: "RÃ©cÃ©pissÃ© de dÃ©claration de crÃ©ation nÂ° W423016361",
};

const statutes = {
  signedDate: "22 juin 2026",
  signedPlace: "Saint-Ã‰tienne",
  duration: "indÃ©terminÃ©e",
  founders: "Edryan Rangoly et Jordan Lambeau",
  object: "revitalisation, rÃ©habilitation et valorisation des territoires urbains, ruraux et ultramarins",
};

const nav = [
  ["Accueil", "index.html"],
  ["L'association", "qui-sommes-nous.html"],
  ["Nos actions", "nos-actions.html"],
  ["Nos pÃ´les", "nos-poles.html"],
  ["Observatoire", "observatoire.html"],
  ["Saint-Ã‰tienne", "saint-etienne.html"],
  ["Agir", "agir-avec-nous.html"],
  ["Partenaires", "partenaires.html"],
  ["Contact", "contact.html"],
];

const imageSizes = {
  "assets/logo-territoires-vivants-france.png": [612, 408],
  "assets/logo-territoires-vivants-france-web.png": [583, 181],
  "assets/photos/community-garden-paris.webp": [960, 640],
  "assets/photos/artisan-menuiserie-bois.jpg": [1600, 1059],
  "assets/photos/batiment-rural-france.jpg": [801, 1200],
  "assets/photos/centre-ville-nantes.jpg": [1400, 1050],
  "assets/photos/chantier-renovation-lyon.jpg": [1400, 1050],
  "assets/photos/commerce-ferme-vichy.jpg": [802, 1200],
  "assets/photos/friche-industrielle-ronchamp.jpg": [1400, 934],
  "assets/photos/france-commerce-paris.jpg": [330, 495],
  "assets/photos/france-friche-pcuk.jpg": [960, 324],
  "assets/photos/france-ressourcerie-vichy.jpg": [960, 720],
  "assets/photos/materiaux-reemploi-echantillons.jpg": [1536, 1024],
  "assets/photos/materiaux-renovation-outils.jpg": [1536, 1024],
  "assets/photos/materiaux-durables-reemploi.jpg": [877, 887],
  "assets/photos/immeuble-renovation-meudon.jpg": [1400, 934],
  "assets/photos/jardin-partage-france.jpg": [1400, 1050],
  "assets/photos/saint-etienne-centre-commerce.jpg": [1200, 902],
  "assets/photos/france-saint-etienne-chateaucreux.jpg": [1280, 853],
  "assets/photos/france-saint-etienne-jean-jaures.jpg": [1200, 800],
  "assets/photos/saint-etienne-panorama.jpg": [1600, 215],
  "assets/photos/saint-etienne-rue-resistance.jpg": [955, 1200],
  "assets/qr-whatsapp-tvf.png": [900, 1600],
};

const operationalKitDocs = {
  zip: ["Kit complet formulaires et conventions", "documents/TVF-kit-formulaires-conventions-prets-a-utiliser.zip"],
  index: ["Index du kit", "documents/kit-formulaires-conventions-tvf/00-index/tvf-index-kit-formulaires-conventions.docx"],
  pieces: ["Liste des pieces par demande", "documents/kit-formulaires-conventions-tvf/14-listes-pieces/tvf-lp-01-liste-pieces-par-demande.docx"],
  courriers: ["Kit courriers prets a remplir", "documents/kit-formulaires-conventions-tvf/15-courriers-prets-a-envoyer/tvf-cour-01-kit-courriers-demandes.docx"],
};

const operationalForms = [
  ["Contact general", "Tout public", "Recevoir une demande et orienter vers le bon parcours.", "documents/kit-formulaires-conventions-tvf/01-contact-general/tvf-f-01-formulaire-de-contact-general.docx"],
  ["Collectivite / territoire", "Commune, EPCI, departement, region", "Preparer un rendez-vous, un diagnostic ou une cooperation.", "documents/kit-formulaires-conventions-tvf/02-collectivite-territoire/tvf-f-02-demande-collectivite---territoire-partenaire.docx"],
  ["Proprietaire / bien vacant", "Proprietaire, bailleur, mandataire", "Etudier un logement, commerce, local, terrain ou friche.", "documents/kit-formulaires-conventions-tvf/03-proprietaire-bien-vacant/tvf-f-03-proposition-de-bien-vacant-ou-inutilise.docx"],
  ["Materiaux de reemploi", "Entreprise, particulier, collectivite, artisan", "Qualifier des materiaux, mobiliers ou equipements disponibles.", "documents/kit-formulaires-conventions-tvf/04-materiaux-reemploi/tvf-f-04-proposition-de-materiaux-reemployables.docx"],
  ["Entreprise partenaire", "Entreprise, artisan, bailleur, logisticien", "Proposer materiaux, local, transport, competences, RSE ou soutien.", "documents/kit-formulaires-conventions-tvf/05-entreprise-partenariat/tvf-f-05-demande-entreprise---partenariat-territorial.docx"],
  ["Local de stockage", "Collectivite, entreprise, proprietaire", "Etudier un local pour stocker et trier des ressources.", "documents/kit-formulaires-conventions-tvf/06-local-stockage/tvf-f-06-mise-a-disposition-potentielle-dun-local-de-stockage.docx"],
  ["Transport / logistique", "Transporteur, loueur, collectivite, entreprise", "Recenser vehicule, chauffeur, manutention ou livraison.", "documents/kit-formulaires-conventions-tvf/07-transport-logistique/tvf-f-07-mise-a-disposition-transport-et-logistique.docx"],
  ["Benevole / citoyen", "Habitant, etudiant, volontaire", "Identifier competences, disponibilites et missions possibles.", "documents/kit-formulaires-conventions-tvf/08-benevole-engagement/tvf-f-08-candidature-benevole-ou-citoyenne.docx"],
  ["Association / insertion", "Association, SIAE, organisme formation", "Construire une action encadree, sociale ou participative.", "documents/kit-formulaires-conventions-tvf/09-association-insertion-chantier/tvf-f-09-cooperation-association-insertion-ou-chantier-participatif.docx"],
  ["Financeur / mecene", "Fondation, entreprise mecene, financeur", "Structurer un soutien financier, materiel ou en competences.", "documents/kit-formulaires-conventions-tvf/10-financeur-mecene/tvf-f-10-demande-financeur-mecene-ou-investisseur-solidaire.docx"],
  ["Signalement citoyen", "Habitant, association locale, citoyen", "Signaler un lieu, une friche ou une ressource a verifier.", "documents/kit-formulaires-conventions-tvf/11-signalement-citoyen/tvf-f-11-signalement-citoyen-dun-lieu-ou-dune-ressource.docx"],
  ["Presse / institution", "Journaliste, institution, service communication", "Traiter interview, demande d'information ou kit media.", "documents/kit-formulaires-conventions-tvf/12-presse-institutionnel/tvf-f-12-demande-presse-institution-ou-communication.docx"],
];

const operationalConventions = [
  ["Cooperation territoriale", "Collectivite, EPCI, service public", "Definir perimetre, objectifs, donnees, referents et suivi.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-01-convention-type-de-cooperation-territoriale.docx"],
  ["Mise a disposition d'un bien", "Proprietaire, bailleur, collectivite", "Encadrer etude, visite, usage temporaire ou restitution.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-02-convention-type-de-mise-a-disposition-dun-bien.docx"],
  ["Valorisation de materiaux", "Entreprise, collectivite, artisan, particulier", "Tracer collecte, tri, securite, affectation et responsabilites.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-03-convention-type-de-valorisation-de-materiaux.docx"],
  ["Partenariat entreprise", "Entreprise, artisan, logisticien, commerce", "Formaliser contribution RSE, visibilite, reporting et limites.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-04-convention-type-de-partenariat-entreprise.docx"],
  ["Soutien financier ou mecenat", "Mecene, fondation, financeur", "Cadrer affectation, versement, justificatifs et communication.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-05-convention-type-de-soutien-financier-ou-mecanat.docx"],
  ["Benevolat et chantier participatif", "Benevole, association, structure encadrante", "Fixer securite, mission, emargement, confidentialite et image.", "documents/kit-formulaires-conventions-tvf/13-conventions-types/tvf-conv-06-charte-type-benevole-et-chantier-participatif.docx"],
];

function directDownloadHref(href) {
  return href;
}

function downloadLink(label, href, variant = "text-link") {
  return `<a class="${variant}" href="${directDownloadHref(href)}" download aria-label="Telecharger : ${escapeAttr(label)}">Telecharger</a>`;
}

function documentDownloadCards(title, intro, items, id) {
  return `<section class="section soft document-library" ${sectionAttrs(title, id)}><div class="container"><div class="section-head"><p class="section-kicker">Telechargements</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><div class="card-grid">${items
    .map(([h, publicLabel, purpose, href]) => `<article class="card doc-download-card"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p><strong>Public :</strong> ${publicLabel}</p><p>${purpose}</p>${downloadLink(h, href, "btn secondary")}</article>`)
    .join("")}</div></div></section>`;
}

function documentOperationalKitSection() {
  return `<section class="section" ${sectionAttrs("Kit operationnel complet", "kit-operationnel-complet")}><div class="container intro-grid"><div><p class="section-kicker">Kit complet</p><h2>Tout telecharger en une seule fois.</h2><p class="section-lead">Le kit rassemble les formulaires, conventions types, courriers et listes de pieces. Il sert de base commune pour ouvrir un dossier, le qualifier, demander les pieces, formaliser une convention et archiver la suite.</p><div class="hero-actions"><a class="btn primary" href="${operationalKitDocs.zip[1]}" download>Telecharger le ZIP complet</a><a class="btn secondary" href="${operationalKitDocs.index[1]}" download>Telecharger l'index</a></div></div><div class="mini-list"><article><strong>21 fichiers Word</strong><span>Modeles modifiables, prets a remplir, avec entete TVF, numero de dossier, clauses et signatures.</span></article><article><strong>Classement par besoin</strong><span>Contact, collectivite, proprietaire, materiaux, entreprise, local, transport, benevole, financeur, signalement.</span></article><article><strong>Usage interne</strong><span>Adapter chaque document au dossier, verifier les pieces puis faire valider avant signature.</span></article></div></div></section>`;
}

function documentOrientationTableSection() {
  return tableSection("Choisir rapidement le bon document", "Ce tableau oriente vers le premier formulaire et les pieces a verifier selon le sujet. Il evite de multiplier les boutons et garde un parcours simple.", [
    ["Sujet", "Premier document", "Pieces a preparer", "Suite logique"],
    ["Demande generale", `<a href="${operationalForms[0][3]}" download>F-01 Contact general</a>`, "Coordonnees, message, territoire, pieces disponibles", "Orienter vers le bon formulaire"],
    ["Collectivite / EPCI", `<a href="${operationalForms[1][3]}" download>F-02 Collectivite</a>`, "Referent, perimetre, besoin public, donnees, calendrier", "Rendez-vous de cadrage"],
    ["Proprietaire / bien vacant", `<a href="${operationalForms[2][3]}" download>F-03 Proprietaire</a>`, "Adresse, preuve de propriete ou mandat, photos, contraintes", "Prequalification puis visite eventuelle"],
    ["Materiaux", `<a href="${operationalForms[3][3]}" download>F-04 Materiaux</a>`, "Nature, quantite, etat, photos, disponibilite, acces", "Acceptation, refus ou affectation"],
    ["Entreprise", `<a href="${operationalForms[4][3]}" download>F-05 Entreprise</a>`, "SIRET, contribution, conditions, attentes RSE", "Convention de partenariat si retenu"],
    ["Local de stockage", `<a href="${operationalForms[5][3]}" download>F-06 Local</a>`, "Adresse, surface, photos, acces, assurance, duree", "Visite technique puis convention"],
    ["Transport / vehicule", `<a href="${operationalForms[6][3]}" download>F-07 Logistique</a>`, "Vehicule, capacite, assurance, conducteur, disponibilites", "Accord ponctuel avant usage"],
    ["Benevole", `<a href="${operationalForms[7][3]}" download>F-08 Benevole</a>`, "Contact, disponibilites, competences, contraintes", "Mission encadree"],
    ["Association / insertion", `<a href="${operationalForms[8][3]}" download>F-09 Insertion</a>`, "Objet, publics, assurance, encadrement, action", "Convention partenariale"],
    ["Financeur / mecene", `<a href="${operationalForms[9][3]}" download>F-10 Financeur</a>`, "Objet du soutien, montant, criteres, reporting", "Note projet puis convention"],
    ["Signalement citoyen", `<a href="${operationalForms[10][3]}" download>F-11 Signalement</a>`, "Localisation, description, photos autorisees", "Verification prudente"],
  ]);
}

function documentFormsBySubjectSection() {
  return documentDownloadCards("Formulaires par sujet", "Un formulaire ouvre un dossier. Il permet de recevoir la demande avec les bonnes informations, sans demander toute la bibliotheque documentaire au premier contact.", operationalForms, "formulaires-par-sujet");
}

function documentPiecesBySubjectSection() {
  return `<section class="section" ${sectionAttrs("Pieces a fournir par sujet", "pieces-a-fournir-par-sujet")}><div class="container"><div class="section-head"><p class="section-kicker">Recevabilite</p><h2>Pieces a fournir par sujet</h2><p class="section-lead">Une seule checklist regroupe les pieces utiles selon le type de demande. Elle sert avant rendez-vous, instruction, visite ou convention.</p></div><div class="decision-list"><article><strong>Document principal</strong><p>Liste des pieces a fournir selon le type de demande : proprietaire, collectivite, entreprise, association, benevole, financeur, signalement.</p>${downloadLink(operationalKitDocs.pieces[0], operationalKitDocs.pieces[1], "btn primary")}</article><article><strong>Regle de travail</strong><p>Un dossier incomplet peut rester en brouillon, mais il ne doit pas etre presente comme retenu tant que les pieces essentielles ne sont pas fournies.</p></article><article><strong>Classement conseille</strong><p>Ranger chaque piece dans le dossier client : identite, sujet, pieces, convention, decision, preuve, suivi.</p></article></div></div></section>`;
}

function documentConventionsTypesSection() {
  return documentDownloadCards("Conventions et chartes types", "Ces modeles servent uniquement apres instruction. Ils cadrent les responsabilites, les limites, les assurances, la duree, les usages et la communication.", operationalConventions, "conventions-types");
}

function documentLettersAndUseSection() {
  return `<section class="section soft" ${sectionAttrs("Courriers et supports de travail", "courriers-et-supports")}><div class="container"><div class="section-head"><p class="section-kicker">Courriers</p><h2>Courriers prets a remplir</h2><p class="section-lead">Le kit courrier sert a contacter une collectivite, une entreprise, un proprietaire, un financeur, une structure d'insertion, ou a relancer des pieces manquantes.</p></div><div class="card-grid"><article class="card"><span class="card-icon" aria-hidden="true">C</span><h3>Kit courriers</h3><p>Modeles prets a remplir avec objet, introduction, demande, pieces jointes et signature TVF.</p>${downloadLink(operationalKitDocs.courriers[0], operationalKitDocs.courriers[1], "btn secondary")}</article><article class="card"><span class="card-icon" aria-hidden="true">I</span><h3>Index du kit</h3><p>Repertoire general pour retrouver rapidement chaque formulaire, convention et liste de pieces.</p>${downloadLink(operationalKitDocs.index[0], operationalKitDocs.index[1], "btn secondary")}</article><article class="card"><span class="card-icon" aria-hidden="true">Z</span><h3>Archive complete</h3><p>Telecharger tout le kit en une seule fois pour le modifier, l'imprimer ou le ranger en interne.</p>${downloadLink(operationalKitDocs.zip[0], operationalKitDocs.zip[1], "btn primary")}</article></div></div></section>`;
}

function documentWorkflowSection() {
  return timeline("Parcours documentaire simple", [
    ["1", "Reception", "La demande arrive par formulaire, e-mail, telephone ou rendez-vous. TVF ouvre une reference dossier."],
    ["2", "Formulaire adapte", "Le sujet determine le formulaire : collectivite, proprietaire, materiaux, entreprise, local, benevole, financeur ou signalement."],
    ["3", "Pieces", "La checklist indique ce qui manque avant instruction : identite, photos, adresse, autorisation, assurance, donnees ou budget."],
    ["4", "Instruction", "TVF decide si le dossier avance, reste en attente, doit etre complete, visite, conventionne ou classe."],
    ["5", "Convention", "Un modele type est adapte uniquement si les responsabilites, limites et conditions sont suffisamment claires."],
  ]);
}


const pages = [
  {
    file: "index.html",
    title: "Accueil",
    meta:
      "Territoires Vivants France coordonne propriÃ©taires, collectivitÃ©s, entreprises, associations et citoyens pour redonner vie aux biens et ressources inutilisÃ©s.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Plateforme nationale de coopÃ©ration",
    h1: "Redonner vie aux lieux utiles aux habitants.",
    intro:
      "Territoires Vivants France structure une mÃ©thode de coopÃ©ration pour repÃ©rer les ressources inutilisÃ©es, mobiliser les bons acteurs, prÃ©parer les conventions et accompagner des projets utiles aux territoires.",
    ctas: [
      ["Comprendre TVF", "qui-sommes-nous.html"],
      ["Agir avec nous", "agir-avec-nous.html"],
      ["Nous contacter", "contact.html"],
    ],
    sections: [
      sectionIntro(
        "Une mission lisible",
        "TVF part d'un constat simple : des logements restent vacants, des commerces ferment, des friches demeurent inutilisÃ©es et des matÃ©riaux encore utiles sortent des circuits de projet. L'association veut transformer ces situations en opportunitÃ©s locales, avec un cadre clair et traÃ§able.",
        [
          ["Observer", "Identifier les lieux, besoins et ressources Ã  partir de signalements, visites et donnÃ©es vÃ©rifiables."],
          ["Qualifier", "Analyser la faisabilitÃ©, les contraintes, les responsabilitÃ©s et les usages possibles."],
          ["Coordonner", "RÃ©unir propriÃ©taires, collectivitÃ©s, entreprises, associations, financeurs, bÃ©nÃ©voles et habitants."],
        ]
      ),
      homeClaritySection(),
      homeTrustSection(),
      launchNeedsSection(),
      tableSection("Ce que vous pouvez faire dÃ¨s maintenant", "L'accueil doit orienter vite vers le bon parcours, sans perdre le visiteur dans tout le site.", [
        ["Votre situation", "Action utile", "Page Ã  consulter"],
        ["Vous reprÃ©sentez une collectivitÃ©", "PrÃ©parer un pÃ©rimÃ¨tre pilote, un besoin public ou une coopÃ©ration", "CollectivitÃ©s"],
        ["Vous possÃ©dez un bien vacant", "DÃ©crire le bien, son Ã©tat, les contraintes et les usages possibles", "PropriÃ©taires"],
        ["Vous Ãªtes une entreprise", "Signaler des matÃ©riaux, compÃ©tences, locaux ou un soutien possible", "Entreprises"],
        ["Vous souhaitez aider", "Proposer du temps, une compÃ©tence, un signalement ou une mission locale", "Agir avec nous"],
        ["Vous voulez comprendre la mÃ©thode", "Lire les Ã©tapes, critÃ¨res de dÃ©cision et rÃ¨gles de preuve", "Notre mÃ©thode"],
      ]),
      cards(
        "Ã€ chacun son entrÃ©e",
        "Le site doit permettre Ã  chaque public de savoir quoi faire en moins de deux minutes.",
        [
          ["CollectivitÃ©", "PrÃ©parer un diagnostic, une expÃ©rimentation ou une coopÃ©ration territoriale.", "agir-avec-nous.html#collectivite"],
          ["PropriÃ©taire", "PrÃ©senter un logement, un commerce, un bÃ¢timent ou un terrain inutilisÃ©.", "agir-avec-nous.html#proprietaire"],
          ["Entreprise", "Valoriser des matÃ©riaux, compÃ©tences, locaux ou mÃ©cÃ©nat dans un projet utile.", "agir-avec-nous.html#entreprise"],
          ["Citoyen", "Signaler un lieu, participer Ã  une action locale ou rejoindre une mission bÃ©nÃ©vole.", "agir-avec-nous.html#citoyen"],
        ]
      ),
      timeline(
        "Le parcours TVF",
        [
          ["1", "RepÃ©rage", "Un lieu, un besoin ou une ressource est identifiÃ©."],
          ["2", "Diagnostic", "La situation est qualifiÃ©e avant toute annonce ou engagement."],
          ["3", "Convention", "Les rÃ´les, responsabilitÃ©s, usages et limites sont formalisÃ©s."],
          ["4", "Mise en usage", "Le projet est coordonnÃ©, documentÃ© puis suivi dans le temps."],
        ]
      ),
      highlight(
        "Saint-Ã‰tienne comme territoire pilote",
        "Le siÃ¨ge national est situÃ© Ã  Saint-Ã‰tienne. Le territoire pilote permet de tester la mÃ©thode TVF sur des enjeux concrets : habitat vacant, commerces fermÃ©s, friches, matÃ©riaux de rÃ©emploi et mobilisation citoyenne.",
        "DÃ©couvrir le pilote",
        "saint-etienne.html",
        "assets/photos/france-saint-etienne-jean-jaures.jpg"
      ),
    ],
  },
  {
    file: "qui-sommes-nous.html",
    title: "Qui sommes-nous ?",
    meta:
      "DÃ©couvrez Territoires Vivants France, association nationale de coopÃ©ration territoriale basÃ©e Ã  Saint-Ã‰tienne.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "L'association",
    h1: "Une plateforme de coopÃ©ration territoriale.",
    intro:
      "TVF rassemble les acteurs capables de transformer un bien inutilisÃ© en ressource pour les habitants : propriÃ©taires, collectivitÃ©s, entreprises, associations, bÃ©nÃ©voles, financeurs et citoyens.",
    ctas: [["Notre mÃ©thode", "notre-methode.html"], ["Transparence", "transparence.html"]],
    sections: [
      textBlock(
        "Notre rÃ´le",
        "TVF ne remplace ni les collectivitÃ©s, ni les dispositifs publics, ni les professionnels du bÃ¢timent. L'association cherche Ã  rendre les coopÃ©rations plus simples : repÃ©rer les situations, prÃ©parer les dossiers, mettre les acteurs autour de la mÃªme table et suivre ce qui est dÃ©cidÃ©."
      ),
      textBlock(
        "Objet social inscrit dans les statuts",
        "Les statuts signÃ©s Ã  Saint-Ã‰tienne le 22 juin 2026 donnent Ã  TVF un objet large : participer Ã  la revitalisation, la rÃ©habilitation et la valorisation des territoires urbains, ruraux et ultramarins. Cet objet couvre notamment le logement, l'habitat, la vacance immobiliÃ¨re, la rÃ©habilitation de bÃ¢timents dÃ©gradÃ©s, la revitalisation commerciale, le rÃ©emploi des matÃ©riaux, les friches, l'insertion, la solidaritÃ©, l'environnement, l'Ã©conomie circulaire, la formation et l'accompagnement des collectivitÃ©s, entreprises et habitants."
      ),
      nationalDataSection("Pourquoi une association comme TVF est utile"),
      associationNeedMatrixSection(),
      associationProofSection(),
      sectionIntro(
        "Ce que TVF apporte concrÃ¨tement",
        "L'association se positionne comme un cadre de travail : elle transforme une intention en dossier lisible, un signalement en situation qualifiÃ©e et une ressource inutilisÃ©e en contribution possible Ã  un projet territorial.",
        [
          ["Un cadre", "Des Ã©tapes, des piÃ¨ces Ã  fournir, des responsabilitÃ©s et des limites Ã©crites avant toute communication."],
          ["Un langage commun", "Une maniÃ¨re simple de relier propriÃ©taires, collectivitÃ©s, entreprises, associations et financeurs autour du mÃªme dossier."],
          ["Une continuitÃ©", "Un suivi depuis le premier contact jusqu'Ã  la dÃ©cision, la convention, l'action et la restitution des rÃ©sultats."],
        ]
      ),
      split(
        "Une mÃ©thode avant la communication",
        "La prioritÃ© est de construire une mÃ©thode crÃ©dible avant de communiquer des rÃ©sultats. Cela signifie : des documents propres, des conventions adaptÃ©es, des critÃ¨res de sÃ©lection, une traÃ§abilitÃ© des dÃ©cisions et une distinction nette entre objectifs, projets en instruction et actions rÃ©alisÃ©es.",
        "assets/photos/saint-etienne-rue-resistance.jpg"
      ),
      tableSection("Ce que TVF fait, et ce que TVF ne prÃ©tend pas faire", "Cette clarification protÃ¨ge la crÃ©dibilitÃ© du projet et Ã©vite les promesses trop rapides.", [
        ["Sujet", "TVF fait", "TVF ne fait pas"],
        ["Biens vacants", "Aide Ã  qualifier un bien, un usage possible, les risques et les acteurs Ã  mobiliser", "Ne dÃ©cide pas seule de l'avenir d'un bien sans accord du propriÃ©taire ou du cadre public compÃ©tent"],
        ["MatÃ©riaux", "Organise une valorisation orientÃ©e projet, avec traÃ§abilitÃ© et affectation", "Ne fonctionne pas comme une plateforme de dons libres ou une dÃ©chetterie"],
        ["CollectivitÃ©s", "PrÃ©pare un cadre de coopÃ©ration, un diagnostic et des documents d'aide Ã  la dÃ©cision", "Ne remplace pas les politiques publiques ni les services instructeurs"],
        ["Impact", "Mesure les rÃ©sultats lorsqu'ils sont documentÃ©s", "N'annonce pas de chiffres non vÃ©rifiÃ©s"],
      ]),
      cards("Nos engagements", "TVF avance avec prudence et exigence.", [
        ["ClartÃ©", "Ne pas annoncer de chiffres d'impact tant qu'ils ne sont pas mesurÃ©s."],
        ["TraÃ§abilitÃ©", "Documenter les dÃ©cisions, conventions, ressources et projets."],
        ["ComplÃ©mentaritÃ©", "Aider les acteurs existants sans se substituer Ã  eux."],
        ["UtilitÃ©", "Orienter chaque action vers un bÃ©nÃ©fice concret pour le territoire."],
      ]),
      tableSection("Lecture institutionnelle de TVF", "Ce cadre de lecture rÃ©sume ce qu'un interlocuteur public, Ã©conomique ou associatif doit comprendre avant un premier rendez-vous.", [
        ["Question", "RÃ©ponse TVF", "Preuve ou document associÃ©"],
        ["Pourquoi TVF existe ?", "RÃ©duire la dispersion entre biens vacants, ressources inutilisÃ©es, besoins locaux et acteurs capables d'agir", "MÃ©thode TVF, pages actions et pÃ´les"],
        ["Ã€ qui TVF s'adresse ?", "CollectivitÃ©s, propriÃ©taires, entreprises, associations, bÃ©nÃ©voles, financeurs et habitants", "Parcours publics et fiches dÃ©diÃ©es"],
        ["Comment TVF intervient ?", "Par qualification, coordination, convention, suivi et restitution documentÃ©e", "Fiches projet, registres, conventions"],
        ["Ce que TVF protÃ¨ge", "La propriÃ©tÃ©, les donnÃ©es sensibles, les responsabilitÃ©s et la crÃ©dibilitÃ© des partenaires", "Charte, transparence, mentions lÃ©gales"],
        ["Ce que TVF mesure", "Des rÃ©sultats uniquement lorsqu'ils sont rÃ©alisÃ©s, vÃ©rifiables et reliÃ©s Ã  une mÃ©thode", "Page Impact et grille d'indicateurs"],
      ]),
      timeline("Construction de la crÃ©dibilitÃ©", [
        ["1", "Cadrer", "DÃ©finir l'objet de l'association, les responsabilitÃ©s, les documents et les rÃ¨gles de communication."],
        ["2", "Tester", "Appliquer la mÃ©thode sur un territoire pilote avec des dossiers rÃ©els, sans annoncer de rÃ©sultat prÃ©maturÃ©."],
        ["3", "Formaliser", "Transformer les retours terrain en conventions, grilles de dÃ©cision et procÃ©dures reproductibles."],
        ["4", "DÃ©ployer", "Ouvrir progressivement le modÃ¨le Ã  d'autres territoires lorsque les conditions de suivi sont rÃ©unies."],
      ]),
      faqSection([
        ["TVF est-elle dÃ©jÃ  dÃ©ployÃ©e nationalement ?", "TVF pose les fondations d'une organisation nationale : mÃ©thode, outils, parcours, documents et rÃ¨gles de preuve. Le dÃ©ploiement opÃ©rationnel s'appuiera ensuite sur des actions documentÃ©es territoire par territoire."],
        ["Pourquoi parler de plateforme de coopÃ©ration ?", "Parce que la valeur de TVF n'est pas de faire seule, mais de relier les bons acteurs autour d'un dossier clair : bien, usage, ressources, responsabilitÃ©s, financement et impact."],
        ["Pourquoi ne pas afficher de partenaires partout ?", "Un partenaire ne doit Ãªtre affichÃ© que lorsqu'un accord rÃ©el existe. Cette rÃ¨gle Ã©vite toute confusion et renforce la confiance des collectivitÃ©s, entreprises et financeurs."],
      ]),
    ],
  },
  {
    file: "nos-actions.html",
    title: "Nos actions",
    meta:
      "Les actions de TVF : logements vacants, commerces inoccupÃ©s, matÃ©riaux de rÃ©emploi, friches, insertion et coordination territoriale.",
    heroImage: "assets/photos/centre-ville-nantes.jpg",
    eyebrow: "Actions",
    h1: "Transformer les lieux inutilisÃ©s en solutions concrÃ¨tes.",
    intro:
      "TVF agit sur les logements vacants, commerces fermÃ©s, friches, terrains, matÃ©riaux et besoins locaux en construisant des parcours simples : repÃ©rer, qualifier, mobiliser, conventionner, rÃ©aliser et suivre.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Voir les pÃ´les", "nos-poles.html"]],
    sections: [
      sectionIntro(
        "Une action TVF commence toujours par un besoin rÃ©el",
        "L'objectif n'est pas d'empiler des projets, mais de transformer une situation bloquÃ©e en dÃ©marche comprÃ©hensible : qui possÃ¨de le bien, quel usage serait utile, quelles ressources existent, quelles responsabilitÃ©s doivent Ãªtre Ã©crites et quelles preuves permettront de suivre l'action.",
        [
          ["Un lieu", "Logement vacant, commerce fermÃ©, bÃ¢timent inutilisÃ©, friche ou terrain dÃ©laissÃ©."],
          ["Une ressource", "MatÃ©riaux, mobilier, compÃ©tences, locaux, temps bÃ©nÃ©vole ou financement."],
          ["Un usage", "Logement, activitÃ© Ã©conomique, lieu associatif, espace vert, atelier, formation ou service local."],
        ]
      ),
      cards("Huit leviers opÃ©rationnels", "Chaque action correspond Ã  un besoin lisible pour les habitants, les propriÃ©taires, les entreprises et les collectivitÃ©s.", [
        ["Logements vacants", "Identifier, qualifier et accompagner les conditions de remise en usage de logements aujourd'hui inutilisÃ©s.", "proprietaires.html"],
        ["Commerces inoccupÃ©s", "Ã‰tudier les cellules fermÃ©es et prÃ©parer des usages rÃ©alistes : commerce, atelier, association, service ou activitÃ© temporaire.", "nos-poles.html#commerce-vivant"],
        ["MatÃ©riaux de rÃ©emploi", "RepÃ©rer, trier et affecter des matÃ©riaux encore utiles Ã  des projets validÃ©s, sans distribution automatique.", "nos-actions.html#la-banque-de-materiaux-est-un-outil-de-projet"],
        ["Friches et terrains", "Analyser des espaces dÃ©laissÃ©s et prÃ©parer leur reconversion vers des usages verts, sociaux, Ã©conomiques ou pÃ©dagogiques.", "nos-poles.html#friches-terrains-vivants"],
        ["SolidaritÃ© et insertion", "Construire des missions encadrÃ©es pour bÃ©nÃ©voles, habitants, publics en insertion et partenaires associatifs.", "benevoles-citoyens.html"],
        ["Territoires partenaires", "Aider une commune ou un EPCI Ã  cadrer un diagnostic, une expÃ©rimentation ou une coopÃ©ration locale.", "collectivites.html"],
        ["Financer les projets", "PrÃ©parer des budgets, cofinancements et dossiers lisibles pour mÃ©cÃ¨nes, fondations et financeurs.", "financeurs-mecenes.html"],
        ["Observatoire", "Organiser les signalements, donnÃ©es, sources et prioritÃ©s pour dÃ©cider oÃ¹ agir en premier.", "observatoire.html"],
      ]),
      nationalDataSection("DonnÃ©es publiques qui justifient ces actions"),
      tableSection("Ce que chaque action produit", "TVF doit toujours produire un livrable clair, mÃªme lorsque le projet n'est pas encore lancÃ©.", [
        ["Action", "ProblÃ¨me traitÃ©", "Ce que TVF prÃ©pare", "Sortie concrÃ¨te"],
        ["Logement vacant", "Bien inutilisÃ©, propriÃ©taire isolÃ©, contraintes mal connues", "Fiche propriÃ©taire, visite, scÃ©narios d'usage, risques", "Dossier de dÃ©cision"],
        ["Commerce fermÃ©", "Vitrine inactive, rez-de-chaussÃ©e sans usage, besoin local", "Analyse d'usage, acteurs Ã©conomiques, contraintes d'accÃ¨s", "ScÃ©nario de rÃ©activation"],
        ["MatÃ©riaux", "Ressources jetÃ©es ou stockÃ©es sans destination", "Bordereau, tri, Ã©tat, quantitÃ©, affectation possible", "Registre de rÃ©emploi"],
        ["Friche ou terrain", "Espace dÃ©laissÃ©, manque d'usage, risque de dÃ©gradation", "Qualification, sÃ©curitÃ©, accÃ¨s, usages compatibles", "Note d'opportunitÃ©"],
        ["Action solidaire", "Besoin d'engagement citoyen ou d'insertion", "Mission, encadrement, sÃ©curitÃ©, feuille d'Ã©margement", "Action documentÃ©e"],
      ]),
      actionsOperationalMatrixSection(),
      tableSection("Exemples de cas d'usage Ã  instruire", "Ces exemples ne sont pas prÃ©sentÃ©s comme des projets rÃ©alisÃ©s. Ils montrent comment TVF transforme une situation frÃ©quente en dossier vÃ©rifiable.", [
        ["Situation", "ProblÃ¨me de dÃ©part", "RÃ©ponse TVF", "Livrable attendu"],
        ["Logement vacant signalÃ© par un propriÃ©taire", "Bien inutilisÃ©, usage incertain, travaux possibles Ã  estimer", "Qualifier le bien, vÃ©rifier l'accÃ¨s, comparer les usages et prÃ©parer l'accord de principe", "Fiche propriÃ©taire et scÃ©narios d'usage"],
        ["Commerce fermÃ© en centre-ville", "Local visible mais sans activitÃ© et sans porteur identifiÃ©", "Analyser les contraintes, usages temporaires et acteurs Ã©conomiques ou associatifs possibles", "Note d'opportunitÃ© commerce"],
        ["Lot de matÃ©riaux disponible", "Ressource encore utile mais sans destination", "VÃ©rifier Ã©tat, quantitÃ©, retrait, stockage et affectation Ã  un projet validÃ©", "Bordereau matÃ©riaux et registre de suivi"],
        ["Terrain dÃ©laissÃ©", "Espace sans usage, risque de dÃ©gradation ou besoin de cadre de vie", "Qualifier propriÃ©tÃ©, sÃ©curitÃ©, accÃ¨s et usages temporaires verts ou partagÃ©s", "Fiche d'audit terrain"],
        ["Besoin associatif de local", "Association utile mais sans lieu adaptÃ©", "Relier besoin, bien possible, convention d'usage et responsabilitÃ©s", "Fiche projet et convention Ã  prÃ©parer"],
      ]),
      split(
        "La Banque de matÃ©riaux est un outil de projet",
        "Les matÃ©riaux proposÃ©s Ã  TVF ne sont pas distribuÃ©s librement. Ils sont qualifiÃ©s, tracÃ©s puis orientÃ©s vers des besoins utiles : remise en Ã©tat d'un local associatif, amÃ©nagement d'un lieu partagÃ©, soutien Ã  un chantier encadrÃ© ou expÃ©rimentation territoriale. Cette logique protÃ¨ge les contributeurs et garantit que chaque ressource garde une utilitÃ© collective.",
        "assets/photos/materiaux-reemploi-echantillons.jpg"
      ),
      timeline("MÃ©thode d'intervention", [
        ["1", "Recevoir", "Une demande, un signalement ou une contribution est enregistrÃ© avec un numÃ©ro de dossier."],
        ["2", "Qualifier", "Le besoin, le bien, la ressource, les risques et les piÃ¨ces manquantes sont analysÃ©s."],
        ["3", "Orienter", "TVF dÃ©cide de complÃ©ter, visiter, instruire, rÃ©orienter ou classer le dossier."],
        ["4", "Mobiliser", "Les acteurs utiles sont identifiÃ©s : propriÃ©taire, collectivitÃ©, entreprise, association, financeur ou bÃ©nÃ©vole."],
        ["5", "Formaliser", "Les engagements, usages, responsabilitÃ©s, budgets et limites sont Ã©crits avant action."],
        ["6", "Suivre", "Le projet est documentÃ© avec indicateurs, photos autorisÃ©es, comptes rendus et reporting."],
      ]),
      actionsDecisionSection(),
      cards("Ã€ qui s'adressent les actions ?", "Chaque public doit comprendre immÃ©diatement oÃ¹ il intervient dans la chaÃ®ne de revitalisation.", [
        ["CollectivitÃ©s", "Diagnostiquer, prioriser et structurer une coopÃ©ration territoriale.", "collectivites.html"],
        ["PropriÃ©taires", "Ã‰tudier un bien vacant sans perdre la propriÃ©tÃ© ni s'engager prÃ©maturÃ©ment.", "proprietaires.html"],
        ["Entreprises", "Valoriser matÃ©riaux, locaux, compÃ©tences ou mÃ©cÃ©nat dans un cadre traÃ§able.", "entreprises.html"],
        ["Associations", "Exprimer un besoin de local, d'Ã©quipement, de bÃ©nÃ©volat ou d'appui projet.", "partenaires.html"],
        ["BÃ©nÃ©voles", "Participer Ã  des missions utiles, encadrÃ©es et documentÃ©es.", "benevoles-citoyens.html"],
        ["Financeurs", "Soutenir des dossiers instruits avec budget, suivi et reporting.", "financeurs-mecenes.html"],
      ]),
      faqSection([
        ["TVF rÃ©alise-t-elle directement les travaux ?", "TVF prÃ©pare, coordonne et documente les projets. Les travaux nÃ©cessitent un cadre adaptÃ©, des compÃ©tences, des assurances et des responsabilitÃ©s clairement dÃ©finies."],
        ["Un signalement devient-il automatiquement un projet ?", "Non. Un signalement dÃ©clenche une phase de qualification. Il peut Ãªtre complÃ©tÃ©, orientÃ©, classÃ© ou transformÃ© en dossier seulement si les conditions sont rÃ©unies."],
        ["Les matÃ©riaux sont-ils gratuits ?", "Non. La matÃ©riauthÃ¨que TVF est un outil de valorisation territoriale : les ressources sont affectÃ©es Ã  des projets validÃ©s, selon leur Ã©tat, leur utilitÃ© et leur traÃ§abilitÃ©."],
        ["Quand les chiffres d'impact seront-ils publiÃ©s ?", "Lorsque des projets seront instruits, conventionnÃ©s, rÃ©alisÃ©s puis mesurÃ©s avec une mÃ©thode stable."],
      ]),
    ],
  },
  {
    file: "nos-poles.html",
    title: "Nos 5 pÃ´les",
    meta:
      "Les cinq pÃ´les de Territoires Vivants France : Habitat Vivant, MatÃ©riauthÃ¨que Solidaire, Commerce Vivant, Friches & Terrains Vivants, SolidaritÃ© & Insertion.",
    heroImage: "assets/photos/chantier-renovation-lyon.jpg",
    eyebrow: "Organisation",
    h1: "Cinq pÃ´les pour couvrir tout le cycle de revitalisation.",
    intro:
      "Les pÃ´les structurent l'action de TVF : repÃ©rer un lieu ou une ressource, comprendre le besoin, mobiliser les bons acteurs, prÃ©parer un cadre Ã©crit et suivre le retour Ã  l'usage.",
    ctas: [["Nos actions", "nos-actions.html"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Une organisation lisible pour passer de l'idÃ©e au terrain",
        "Les pÃ´les ne sont pas des silos. Ils permettent de rÃ©partir les responsabilitÃ©s, de clarifier les sujets Ã  traiter et d'Ã©viter qu'un projet reste bloquÃ© parce qu'il manque un propriÃ©taire, un usage, des matÃ©riaux, une collectivitÃ©, un financement ou une Ã©quipe locale.",
        [
          ["RepÃ©rer", "Identifier les logements, commerces, friches, terrains, matÃ©riaux et besoins associatifs."],
          ["Assembler", "Relier le bon pÃ´le principal aux pÃ´les complÃ©mentaires selon la nature du projet."],
          ["Suivre", "Documenter la dÃ©cision, les conventions, les ressources mobilisÃ©es et les rÃ©sultats mesurables."],
        ]
      ),
      cards("Les pÃ´les TVF", "Chaque pÃ´le apporte une compÃ©tence prÃ©cise au service d'un mÃªme objectif : remettre en usage ce qui peut redevenir utile.", [
        ["Habitat Vivant", "Logements vacants, habitat dÃ©gradÃ©, propriÃ©taires, occupation temporaire, usages solidaires.", "proprietaires.html"],
        ["MatÃ©riauthÃ¨que Solidaire", "MatÃ©riaux rÃ©employables, collecte, diagnostic, stockage, affectation Ã  des projets validÃ©s.", "entreprises.html"],
        ["Commerce Vivant", "Locaux fermÃ©s, vitrines inactives, artisans, services de proximitÃ© et usages temporaires.", "nos-poles.html#commerce-vivant"],
        ["Friches & Terrains Vivants", "Terrains dÃ©laissÃ©s, espaces verts, jardins partagÃ©s, biodiversitÃ© et nouveaux usages collectifs.", "nos-poles.html#friches-terrains-vivants"],
        ["SolidaritÃ© & Insertion", "BÃ©nÃ©volat, missions encadrÃ©es, formation, participation citoyenne et inclusion.", "benevoles-citoyens.html"],
      ]),
      tableSection("RÃ´le dÃ©taillÃ© de chaque pÃ´le", "Chaque pÃ´le doit produire des informations utiles Ã  la dÃ©cision, pas seulement une intention.", [
        ["PÃ´le", "Pourquoi il existe", "Missions principales", "Livrables possibles"],
        ["Habitat Vivant", "Des biens restent inutilisÃ©s alors que les besoins locaux existent", "Qualifier le bien, dialoguer avec le propriÃ©taire, Ã©tudier les usages", "Fiche propriÃ©taire, scÃ©narios, accord de principe"],
        ["MatÃ©riauthÃ¨que Solidaire", "Des ressources encore utiles sortent des circuits de projet", "Recenser, trier, sÃ©curiser et affecter les matÃ©riaux", "Bordereau, registre, PV de remise"],
        ["Commerce Vivant", "Des locaux fermÃ©s fragilisent les rues et les centres-villes", "Comprendre le local, tester des usages, relier porteurs et acteurs locaux", "Fiche local, scÃ©nario d'usage, convention"],
        ["Friches & Terrains Vivants", "Des espaces dÃ©laissÃ©s peuvent devenir utiles au cadre de vie", "Qualifier l'accÃ¨s, les risques, les usages verts ou partagÃ©s", "Audit terrain, note d'opportunitÃ©, plan d'action"],
        ["SolidaritÃ© & Insertion", "Les projets locaux peuvent crÃ©er de l'engagement et des parcours", "Cadrer les missions, encadrer les actions, suivre la participation", "Fiche mission, Ã©margement, compte rendu"],
      ]),
      tableSection("Exemples de dossiers par pÃ´le", "Cette synthÃ¨se aide un visiteur Ã  comprendre rapidement quel pÃ´le peut porter l'analyse principale d'un dossier.", [
        ["PÃ´le principal", "Dossier typique", "PÃ´les associÃ©s possibles", "Question de dÃ©cision"],
        ["Habitat Vivant", "Logement vacant proposÃ© par un propriÃ©taire", "MatÃ©riauthÃ¨que, SolidaritÃ©, Financement", "Le bien peut-il Ãªtre Ã©tudiÃ© et sÃ©curisÃ© pour un usage utile ?"],
        ["MatÃ©riauthÃ¨que Solidaire", "MatÃ©riaux de chantier ou mobilier professionnel disponibles", "Habitat, Commerce, Friches", "La ressource est-elle rÃ©employable, traÃ§able et affectable ?"],
        ["Commerce Vivant", "Vitrine fermÃ©e ou local commercial inoccupÃ©", "Habitat, SolidaritÃ©, Financement", "Un usage temporaire ou durable est-il rÃ©aliste ?"],
        ["Friches & Terrains Vivants", "Terrain ou espace dÃ©laissÃ© sans usage clair", "SolidaritÃ©, MatÃ©riauthÃ¨que, CollectivitÃ©s", "L'accÃ¨s, la sÃ©curitÃ© et la propriÃ©tÃ© permettent-ils une expÃ©rimentation ?"],
        ["SolidaritÃ© & Insertion", "Mission bÃ©nÃ©vole ou chantier participatif Ã  cadrer", "Tous les pÃ´les selon le support", "La mission est-elle utile, encadrÃ©e et proportionnÃ©e ?"],
      ]),
      polesOperationalMatrixSection(),
      nationalDataSection("RepÃ¨res nationaux par pÃ´le"),
      split(
        "Habitat Vivant",
        "Ce pÃ´le s'adresse d'abord aux propriÃ©taires, collectivitÃ©s et habitants confrontÃ©s Ã  des logements vacants, dÃ©gradÃ©s ou sans usage clair. TVF ne promet pas une rÃ©novation immÃ©diate : l'objectif est de qualifier le bien, comprendre les contraintes, identifier les usages rÃ©alistes et prÃ©parer un cadre de coopÃ©ration.",
        "assets/photos/immeuble-renovation-meudon.jpg"
      ),
      split(
        "MatÃ©riauthÃ¨que Solidaire",
        "Ce pÃ´le transforme les matÃ©riaux disponibles en ressources de projet. Une porte, du bois, du carrelage, du mobilier ou un Ã©quipement technique ne sont utiles que s'ils sont identifiÃ©s, stockables, sÃ©curisÃ©s et affectÃ©s Ã  un usage concret.",
        "assets/photos/materiaux-durables-reemploi.jpg"
      ),
      split(
        "Commerce Vivant",
        "Ce pÃ´le travaille sur les vitrines fermÃ©es, locaux vacants et rez-de-chaussÃ©e sans activitÃ©. L'objectif est de prÃ©parer des usages rÃ©alistes : activitÃ© de proximitÃ©, artisanat, association, atelier, service, occupation temporaire ou expÃ©rimentation locale.",
        "assets/photos/commerce-ferme-vichy.jpg"
      ),
      split(
        "Friches & Terrains Vivants",
        "Ce pÃ´le regarde les espaces dÃ©laissÃ©s comme des rÃ©serves d'usage possible : jardin partagÃ©, espace pÃ©dagogique, lieu associatif, biodiversitÃ©, Ã©quipement temporaire ou projet territorial. La sÃ©curitÃ©, l'accÃ¨s et la propriÃ©tÃ© restent toujours les premiers points Ã  vÃ©rifier.",
        "assets/photos/friche-industrielle-ronchamp.jpg"
      ),
      split(
        "SolidaritÃ© & Insertion",
        "Ce pÃ´le permet aux habitants, bÃ©nÃ©voles, associations et publics accompagnÃ©s de participer Ã  des actions utiles sans improvisation. Les missions doivent Ãªtre claires, encadrÃ©es, sÃ©curisÃ©es et documentÃ©es.",
        "assets/photos/jardin-partage-france.jpg"
      ),
      split(
        "Une logique de coopÃ©ration",
        "Un mÃªme projet peut mobiliser plusieurs pÃ´les. Un logement vacant peut nÃ©cessiter des matÃ©riaux de rÃ©emploi, une convention avec un propriÃ©taire, un appui de collectivitÃ©, un chantier encadrÃ© et un suivi d'impact. TVF sert Ã  organiser cette coordination Ã©tape par Ã©tape.",
        "assets/photos/centre-ville-nantes.jpg"
      ),
      polesCoordinationSection(),
      timeline("Comment les pÃ´les travaillent ensemble", [
        ["1", "RepÃ©rage", "Un lieu, une ressource ou un besoin est identifiÃ©."],
        ["2", "PÃ´le principal", "TVF choisit le pÃ´le qui porte l'analyse principale."],
        ["3", "PÃ´les associÃ©s", "Les autres pÃ´les complÃ¨tent : matÃ©riaux, insertion, commerce, friche ou habitat."],
        ["4", "Cadre Ã©crit", "Convention, autorisation, budget, sÃ©curitÃ© et responsabilitÃ©s sont prÃ©parÃ©s."],
        ["5", "Action suivie", "Les rÃ©sultats ne sont publiÃ©s qu'aprÃ¨s rÃ©alisation et vÃ©rification."],
      ]),
      faqSection([
        ["Pourquoi organiser TVF en pÃ´les ?", "Les pÃ´les rendent la mÃ©thode lisible. Ils permettent de traiter sÃ©parÃ©ment l'habitat, les commerces, les friches, les matÃ©riaux et l'engagement humain, tout en les reliant dans un mÃªme projet."],
        ["Un projet peut-il relever de plusieurs pÃ´les ?", "Oui. C'est mÃªme frÃ©quent : un bÃ¢timent vacant peut mobiliser Habitat Vivant, MatÃ©riauthÃ¨que Solidaire, SolidaritÃ© & Insertion et parfois Commerce Vivant."],
        ["Qui dÃ©cide du pÃ´le principal ?", "TVF l'identifie aprÃ¨s qualification du besoin, des contraintes, des acteurs et de l'usage envisagÃ©."],
        ["Les pÃ´les correspondent-ils Ã  des rÃ©sultats dÃ©jÃ  obtenus ?", "Ils structurent la mÃ©thode et les dossiers Ã  instruire. Les rÃ©sultats relÃ¨veront ensuite des pages Impact et Transparence."],
      ]),
    ],
  },
  {
    file: "observatoire.html",
    title: "Observatoire",
    meta:
      "Observatoire TVF : reperer, qualifier et prioriser les logements vacants, commerces fermes, friches, terrains et ressources inutilisees avec des donnees tracables.",
    heroImage: "assets/photos/friche-industrielle-ronchamp.jpg",
    eyebrow: "Observatoire",
    h1: "Voir, comprendre, prioriser.",
    intro:
      "L'observatoire doit aider les territoires Ã  mieux identifier les ressources inutilisÃ©es avant de dÃ©cider oÃ¹ agir.",
    ctas: [["Signaler un lieu", "agir-avec-nous.html#signalement"], ["Saint-Ã‰tienne", "saint-etienne.html"]],
    sections: [
      sectionIntro(
        "Un observatoire pour dÃ©cider avec mÃ©thode",
        "L'observatoire TVF n'est pas une carte dÃ©corative. Il doit servir Ã  transformer des informations dispersÃ©es en dossiers exploitables : signalements citoyens, donnÃ©es publiques, visites autorisÃ©es, photos, contraintes, prioritÃ©s et suites possibles.",
        [
          ["Centraliser", "Regrouper les informations utiles sans exposer de donnÃ©es sensibles."],
          ["Qualifier", "Distinguer une intuition, un signalement, une donnÃ©e vÃ©rifiÃ©e et un dossier orientÃ©."],
          ["Prioriser", "Aider les territoires Ã  concentrer leurs efforts sur les situations les plus utiles et faisables."],
        ]
      ),
      cards("Ce que l'observatoire suit", "Les catÃ©gories sont volontairement simples.", [
        ["Logements vacants", "Biens inutilisÃ©s ou dÃ©gradÃ©s Ã  qualifier avec prudence."],
        ["Commerces fermÃ©s", "Cellules commerciales sans activitÃ© visible."],
        ["BÃ¢timents abandonnÃ©s", "Immeubles ou Ã©quipements sans usage identifiÃ©."],
        ["Friches et terrains", "Espaces dÃ©laissÃ©s pouvant accueillir un projet utile."],
        ["MatÃ©riaux disponibles", "Ressources rÃ©employables proposÃ©es ou identifiÃ©es."],
      ]),
      tableSection("Sources Ã  croiser", "Une donnÃ©e isolÃ©e ne suffit pas. TVF doit croiser plusieurs niveaux d'information avant de prioriser.", [
        ["Source", "Ce qu'elle apporte", "PrÃ©caution"],
        ["DonnÃ©es publiques", "Contexte dÃ©mographique, habitat, Ã©conomie locale, environnement", "Citer la source et la date de consultation"],
        ["Signalement citoyen", "Information de terrain rapide sur un lieu ou une ressource", "Ã€ vÃ©rifier avant toute conclusion"],
        ["CollectivitÃ©", "PÃ©rimÃ¨tre, prioritÃ©s, programmes, contraintes publiques", "Respecter les procÃ©dures et validations"],
        ["PropriÃ©taire", "Droit d'accÃ¨s, intention, Ã©tat connu, usage acceptable", "Ne rien publier sans accord"],
        ["Visite autorisÃ©e", "Ã‰tat apparent, accÃ¨s, risques, photos internes", "Ne vaut pas diagnostic technique complet"],
      ]),
      observatoryDataSection(),
      observatoryDecisionMatrixSection(),
      observatoryMapReadinessSection(),
      tableSection("QualitÃ© des donnÃ©es", "L'observatoire doit distinguer signalement, vÃ©rification et dÃ©cision.", [
        ["Niveau", "Statut", "Usage"],
        ["SignalÃ©", "Information reÃ§ue", "Ã€ vÃ©rifier"],
        ["QualifiÃ©", "Adresse, type, Ã©tat et contraintes documentÃ©s", "Ã€ instruire"],
        ["OrientÃ©", "Acteurs identifiÃ©s et piste d'usage crÃ©dible", "Ã€ conventionner"],
      ]),
      timeline("Cycle d'un signalement", [
        ["1", "RÃ©ception", "Le lieu ou la ressource est enregistrÃ© avec une description minimale."],
        ["2", "Protection", "Les donnÃ©es personnelles, photos sensibles et informations privÃ©es sont limitÃ©es."],
        ["3", "Qualification", "TVF vÃ©rifie le type de bien, la localisation, l'Ã©tat apparent et les sources disponibles."],
        ["4", "Orientation", "Le dossier est classÃ© : Ã  complÃ©ter, Ã  visiter, Ã  instruire, Ã  rÃ©orienter ou sans suite."],
        ["5", "Suivi", "Les dÃ©cisions et livrables sont archivÃ©s pour Ã©viter les doublons et les annonces imprÃ©cises."],
      ]),
      cards("Indicateurs Ã  suivre", "Les indicateurs doivent Ãªtre remplis seulement avec des donnÃ©es vÃ©rifiables.", [
        ["Biens signalÃ©s", "Nombre de logements, commerces, bÃ¢timents, friches ou terrains reÃ§us dans le registre."],
        ["Dossiers qualifiÃ©s", "Part des signalements disposant d'informations suffisantes pour instruction."],
        ["Ressources matÃ©riaux", "MatÃ©riaux proposÃ©s, acceptÃ©s, refusÃ©s, stockÃ©s, rÃ©servÃ©s ou affectÃ©s."],
        ["Dossiers orientÃ©s", "Situations ayant une piste d'usage, un acteur responsable ou une suite proposÃ©e."],
        ["Projets conventionnÃ©s", "Dossiers disposant d'un cadre Ã©crit et de responsabilitÃ©s dÃ©finies."],
        ["RÃ©sultats vÃ©rifiÃ©s", "Effets publiÃ©s uniquement aprÃ¨s rÃ©alisation et preuves associÃ©es."],
      ]),
      textBlock(
        "ResponsabilitÃ©",
        "L'observatoire n'a pas vocation Ã  stigmatiser des propriÃ©taires. Il sert Ã  crÃ©er les conditions d'une solution avec des donnÃ©es vÃ©rifiÃ©es, des dÃ©marches respectueuses et un cadre de dialogue."
      ),
      faqSection([
        ["Un signalement est-il publiÃ© automatiquement ?", "Non. TVF doit d'abord vÃ©rifier les informations, protÃ©ger les donnÃ©es sensibles et Ã©viter toute exposition injustifiÃ©e d'un propriÃ©taire ou d'un site."],
        ["L'observatoire remplace-t-il les donnÃ©es publiques ?", "Non. Il les complÃ¨te par une mÃ©thode de qualification terrain, de traÃ§abilitÃ© et d'orientation opÃ©rationnelle."],
        ["Une carte nationale peut-elle afficher tous les biens ?", "Pas sans rÃ¨gles strictes. Certains Ã©lÃ©ments doivent rester internes pour respecter la propriÃ©tÃ©, la sÃ©curitÃ©, la confidentialitÃ© et la protection des donnÃ©es."],
      ]),
    ],
  },
  {
    file: "saint-etienne.html",
    title: "Saint-Ã‰tienne",
    meta:
      "Saint-Ã‰tienne est le territoire pilote de Territoires Vivants France et le siÃ¨ge national de l'association.",
    heroImage: "assets/photos/saint-etienne-centre-commerce.jpg",
    eyebrow: "Territoire pilote",
    h1: "Saint-Ã‰tienne, point de dÃ©part de la mÃ©thode TVF.",
    intro:
      "TVF souhaite expÃ©rimenter Ã  Saint-Ã‰tienne une dÃ©marche de coopÃ©ration sur l'habitat vacant, les commerces inoccupÃ©s, les matÃ©riaux de rÃ©emploi, les friches et l'engagement citoyen.",
    ctas: [["Proposer une coopÃ©ration", "contact.html"], ["Agir avec nous", "agir-avec-nous.html"]],
    sections: [
      sectionIntro(
        "Un territoire pilote pour tester une mÃ©thode nationale",
        "Saint-Ã‰tienne n'est pas prÃ©sentÃ©e comme un rÃ©sultat dÃ©jÃ  obtenu, mais comme le premier terrain de structuration de la mÃ©thode TVF. L'objectif est de prouver qu'une dÃ©marche claire peut relier patrimoine vacant, matÃ©riaux disponibles, acteurs locaux, habitants, entreprises et collectivitÃ©s.",
        [
          ["Tester", "Mettre Ã  l'Ã©preuve les fiches, registres, conventions et parcours utilisateurs."],
          ["Apprendre", "Documenter ce qui fonctionne, ce qui bloque et ce qui doit Ãªtre adaptÃ©."],
          ["Reproduire", "CrÃ©er une mÃ©thode duplicable dans d'autres communes, EPCI et territoires."],
        ]
      ),
      saintEtienneDataSection(),
      launchNeedsSection(),
      saintEtienneUsefulnessSection(),
      saintEtienneAlignmentSection(),
      saintEtienneProjectExamplesSection(),
      saintEtienneCommerceIdeasSection(),
      cards("Axes prioritaires", "Les prioritÃ©s restent Ã  formaliser avec les acteurs locaux.", [
        ["Habitat", "RepÃ©rer les logements vacants ou dÃ©gradÃ©s et comprendre les blocages."],
        ["Commerce", "Identifier les locaux fermÃ©s et les possibilitÃ©s de rÃ©activation."],
        ["MatÃ©riaux", "Structurer une filiÃ¨re locale de rÃ©emploi affectÃ©e Ã  des projets utiles."],
        ["Friches", "Analyser les espaces dÃ©laissÃ©s et leurs usages possibles."],
        ["Citoyens", "Organiser le bÃ©nÃ©volat, les signalements et les chantiers participatifs."],
      ]),
      tableSection("Enjeux stÃ©phanois et rÃ©ponse TVF", "TVF doit se positionner comme outil de coordination, pas comme promesse de remplacement des dispositifs existants.", [
        ["Enjeu Ã  traiter", "RÃ©ponse TVF", "Livrable attendu"],
        ["Logements ou immeubles inutilisÃ©s", "Qualifier les propriÃ©taires, l'Ã©tat, l'accÃ¨s et les usages possibles", "Fiche propriÃ©taire et scÃ©narios"],
        ["Commerces fermÃ©s", "Comprendre le local, le besoin de rue et les porteurs potentiels", "ScÃ©nario de rÃ©activation"],
        ["MatÃ©riaux de rÃ©emploi", "Recenser les ressources disponibles et leur destination possible", "Registre matÃ©riaux"],
        ["Friches et terrains", "Analyser sÃ©curitÃ©, accÃ¨s, propriÃ©tÃ©, usages verts ou partagÃ©s", "Audit terrain"],
        ["Engagement citoyen", "Cadrer les missions bÃ©nÃ©voles et actions terrain", "Fiche mission et compte rendu"],
      ]),
      saintEtiennePilotDashboardSection(),
      textBlock(
        "Pourquoi un pilote local ?",
        "Un dispositif national doit d'abord prouver sa mÃ©thode sur un territoire concret. Saint-Ã‰tienne permet de travailler sur des sujets reprÃ©sentatifs : reconversion, patrimoine existant, centres-villes, transition Ã©cologique, Ã©conomie circulaire et solidaritÃ©."
      ),
      tableSection("Premiers travaux Ã  cadrer", "Le pilote doit avancer par dossiers courts, vÃ©rifiables et utiles.", [
        ["Dossier", "Objectif", "Livrable", "Point de prudence"],
        ["Habitat vacant", "Comprendre les blocages propriÃ©taires", "Fiche de qualification", "Pas d'accÃ¨s sans autorisation"],
        ["Commerce fermÃ©", "Identifier des usages rÃ©alistes", "ScÃ©nario d'occupation", "Ne pas annoncer de porteur sans accord"],
        ["MatÃ©riaux", "Tester une chaÃ®ne de rÃ©emploi", "Registre de ressources", "Refuser les matÃ©riaux dangereux ou inutilisables"],
        ["Friche ou terrain", "Ã‰tudier sÃ©curitÃ©, propriÃ©tÃ© et usage possible", "Note d'opportunitÃ©", "Ne pas cartographier publiquement un site sensible"],
        ["Action citoyenne", "CrÃ©er une mission simple et encadrÃ©e", "Fiche mission", "Pas de chantier sans cadre sÃ©curitÃ©"],
      ]),
      timeline("DÃ©ploiement pilote", [
        ["1", "Cadrage local", "DÃ©finir les premiers pÃ©rimÃ¨tres, interlocuteurs et prioritÃ©s."],
        ["2", "Observation", "Recueillir signalements, donnÃ©es publiques, besoins et ressources disponibles."],
        ["3", "Dossiers tests", "SÃ©lectionner quelques situations simples Ã  instruire sans effet d'annonce."],
        ["4", "CoopÃ©rations", "PrÃ©parer les conventions, autorisations, budgets et responsabilitÃ©s."],
        ["5", "Bilan", "Comparer objectifs, livrables, blocages et apprentissages avant duplication."],
      ]),
      cards("Ce que Saint-Ã‰tienne doit permettre de valider", "La rÃ©ussite du pilote se mesure d'abord Ã  la qualitÃ© de la mÃ©thode.", [
        ["Parcours propriÃ©taire", "Peut-on passer d'un bien identifiÃ© Ã  une dÃ©cision claire et sÃ©curisÃ©e ?"],
        ["Parcours collectivitÃ©", "Peut-on produire des livrables utiles Ã  une dÃ©cision publique ?"],
        ["Parcours entreprise", "Peut-on affecter une ressource Ã  un projet sans confusion ni gaspillage ?"],
        ["Parcours bÃ©nÃ©vole", "Peut-on mobiliser des citoyens avec un cadre simple et sÃ»r ?"],
        ["Parcours financeur", "Peut-on prÃ©senter un dossier lisible, chiffrable et vÃ©rifiable ?"],
      ]),
      faqSection([
        ["Saint-Ã‰tienne est-elle dÃ©jÃ  un projet rÃ©alisÃ© ?", "Non. La page prÃ©sente un territoire pilote de mÃ©thode. Les rÃ©sultats seront publiÃ©s seulement lorsqu'ils seront rÃ©ellement vÃ©rifiÃ©s."],
        ["Pourquoi commencer par un territoire pilote ?", "Parce qu'un modÃ¨le national doit d'abord Ãªtre testÃ©, corrigÃ© et documentÃ© sur un terrain concret avant d'Ãªtre reproduit ailleurs."],
        ["Que peut faire un acteur stÃ©phanois maintenant ?", "PrÃ©senter un bien, signaler une ressource, proposer une coopÃ©ration, devenir bÃ©nÃ©vole ou demander un Ã©change de cadrage."],
      ]),
    ],
  },
  {
    file: "agir-avec-nous.html",
    title: "Agir avec nous",
    meta:
      "CollectivitÃ©s, propriÃ©taires, entreprises, associations et citoyens peuvent rejoindre Territoires Vivants France.",
    heroImage: "assets/photos/jardin-partage-france.jpg",
    eyebrow: "Engagement",
    h1: "Chaque acteur peut apporter une partie de la solution.",
    intro:
      "TVF propose des parcours simples pour entrer en relation, qualifier un besoin et prÃ©parer une coopÃ©ration utile.",
    ctas: [["Ã‰crire Ã  TVF", "contact.html"], ["Proposer un bien", "#proposer"]],
    sections: [
      sectionIntro(
        "Partir du bon profil pour gagner du temps",
        "La premiÃ¨re Ã©tape consiste Ã  formuler une demande claire : qui porte le besoin, quel territoire est concernÃ©, quelle ressource ou quel bien est disponible, et quelle dÃ©cision doit Ãªtre prÃ©parÃ©e.",
        [
          ["Comprendre", "Identifier le bon parcours avant de remplir un document."],
          ["Qualifier", "Rassembler les informations minimales pour Ã©viter les Ã©changes imprÃ©cis."],
          ["Orienter", "Diriger la demande vers le bon interlocuteur, la bonne fiche ou la bonne convention."],
        ]
      ),
      cards("Choisir son parcours", "Un seul objectif : transformer une intention en dÃ©marche claire.", [
        ["Je suis une collectivitÃ©", "PrÃ©parer un diagnostic, une coopÃ©ration ou une expÃ©rimentation territoriale.", "#collectivite"],
        ["Je suis propriÃ©taire", "Proposer un logement, commerce, bÃ¢timent ou terrain inutilisÃ©.", "#proprietaire"],
        ["Je suis une entreprise", "Valoriser matÃ©riaux, compÃ©tences, locaux ou mÃ©cÃ©nat.", "#entreprise"],
        ["Je suis bÃ©nÃ©vole", "Participer Ã  une mission, un chantier ou une action locale.", "#citoyen"],
        ["Je souhaite financer", "Soutenir un projet avec un cadre de suivi et de transparence.", "financeurs-mecenes.html"],
      ]),
      fastJourneySection(),
      launchNeedsSection(),
      tableSection("Parcours d'entrÃ©e", "Chaque demande doit Ãªtre orientÃ©e vers une suite lisible.", [
        ["Profil", "Ce que vous pouvez proposer", "PremiÃ¨re Ã©tape", "Suite possible"],
        ["CollectivitÃ©", "DonnÃ©es, pÃ©rimÃ¨tre, besoin public, expÃ©rimentation", "DÃ©crire le territoire et le problÃ¨me Ã  rÃ©soudre", "Diagnostic, rÃ©union de cadrage, convention"],
        ["PropriÃ©taire", "Logement, commerce, bÃ¢timent, terrain ou immeuble inutilisÃ©", "PrÃ©senter le bien, son Ã©tat et les contraintes connues", "Ã‰tude, visite, scÃ©narios d'usage"],
        ["Entreprise", "MatÃ©riaux, Ã©quipements, mÃ©cÃ©nat, compÃ©tences, locaux", "Lister la ressource et ses conditions de disponibilitÃ©", "Qualification, affectation, convention"],
        ["Association", "Besoin de local, animation, bÃ©nÃ©volat, projet social", "DÃ©crire l'usage et les publics concernÃ©s", "Mise en relation, dossier projet, coopÃ©ration"],
        ["Citoyen", "Signalement, bÃ©nÃ©volat, connaissance locale", "Transmettre une information factuelle et localisÃ©e", "Qualification ou mission encadrÃ©e"],
      ]),
      publicEntryMatrixSection(),
      audienceSection(),
      formSection(),
      timeline("Du contact Ã  l'action", [
        ["1", "DÃ©crire", "PrÃ©senter le besoin, le lieu, la ressource ou la coopÃ©ration envisagÃ©e."],
        ["2", "Qualifier", "VÃ©rifier les informations disponibles, les contraintes et les acteurs concernÃ©s."],
        ["3", "Orienter", "Choisir le bon parcours : document, Ã©change, visite, diagnostic ou mise en attente."],
        ["4", "Formaliser", "PrÃ©parer une convention, une mission, une affectation ou une dÃ©cision d'orientation."],
      ]),
      faqSection([
        ["Faut-il avoir un projet complet avant de contacter TVF ?", "Non. Il faut surtout dÃ©crire clairement la situation, le territoire, les acteurs connus et les contraintes dÃ©jÃ  identifiÃ©es."],
        ["Puis-je simplement signaler un lieu ?", "Oui, mais un signalement ne devient pas automatiquement un projet. Il doit Ãªtre vÃ©rifiÃ©, qualifiÃ© et rattachÃ© Ã  un besoin rÃ©el."],
        ["Quel parcours choisir si je suis Ã  la fois habitant et bÃ©nÃ©vole ?", "Commencez par le parcours citoyen ou bÃ©nÃ©vole, puis indiquez vos compÃ©tences, disponibilitÃ©s et le territoire concernÃ©."],
      ]),
    ],
  },

  {
    file: "collectivites.html",
    title: "CollectivitÃ©s",
    meta:
      "Parcours collectivitÃ©s de Territoires Vivants France : diagnostic, coopÃ©ration, expÃ©rimentation territoriale et suivi.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "CollectivitÃ©s",
    h1: "Un cadre simple pour devenir territoire partenaire.",
    intro:
      "TVF aide les collectivitÃ©s Ã  passer d'un besoin local Ã  une dÃ©marche cadrÃ©e : repÃ©rage, diagnostic, acteurs, convention, suivi et indicateurs.",
    ctas: [["PrÃ©parer une fiche", "documents/fiche-collectivite.md"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un outil d'appui pour passer du constat Ã  l'action",
        "Une collectivitÃ© peut connaÃ®tre la vacance, les locaux fermÃ©s ou les friches sans disposer du temps, des outils ou des relais pour transformer chaque situation en dossier opÃ©rationnel. TVF propose une mÃ©thode de cadrage complÃ©mentaire : qualifier, prioriser, rÃ©unir les acteurs, sÃ©curiser les engagements et prÃ©parer le suivi.",
        [
          ["Clarifier", "Transformer un besoin territorial en pÃ©rimÃ¨tre de travail lisible."],
          ["Coordonner", "Faire dialoguer propriÃ©taires, entreprises, associations, habitants et financeurs."],
          ["Documenter", "Produire des livrables utiles aux dÃ©cisions publiques et aux financeurs."],
        ]
      ),
      cards("Ce que TVF peut apporter", "Un appui mÃ©thodologique avant toute action opÃ©rationnelle.", [
        ["Diagnostic", "Structurer les premiers constats sur les biens, commerces, friches ou matÃ©riaux."],
        ["Cartographie", "PrÃ©parer une lecture territoriale des lieux, ressources et besoins Ã  qualifier."],
        ["Coordination", "Identifier les acteurs Ã  rÃ©unir et clarifier leurs rÃ´les."],
        ["Convention", "PrÃ©parer un cadre de coopÃ©ration lisible et adaptÃ© au territoire."],
        ["Financements", "Mettre en forme les besoins, budgets et cofinancements sans annoncer de soutien non acquis."],
        ["Suivi", "DÃ©finir des indicateurs avant de communiquer des rÃ©sultats."],
      ]),
      tableSection("Besoins publics et rÃ©ponse TVF", "TVF aide Ã  structurer les sujets sans se substituer Ã  la dÃ©cision publique.", [
        ["Besoin de la collectivitÃ©", "RÃ©ponse TVF", "Livrable utile"],
        ["Identifier des biens vacants", "Organiser les signalements, sources et qualifications", "Registre et fiche de qualification"],
        ["RÃ©activer un local ou commerce", "Ã‰tudier les usages possibles et les acteurs Ã  mobiliser", "ScÃ©nario d'usage"],
        ["Valoriser des matÃ©riaux", "RepÃ©rer les ressources rÃ©employables et leur destination possible", "Bordereau et registre matÃ©riaux"],
        ["Mobiliser le tissu local", "CrÃ©er un cadre de dialogue avec associations, entreprises, habitants", "Compte rendu de cadrage"],
        ["Chercher des soutiens", "Formaliser besoin, budget, impact attendu et piÃ¨ces Ã  fournir", "Plan de financement"],
      ]),
      tableSection("Parcours collectivitÃ©", "Le parcours doit rester compatible avec les procÃ©dures publiques.", [
        ["Ã‰tape", "Objectif", "Livrable"],
        ["Cadrage", "Comprendre le besoin et le pÃ©rimÃ¨tre", "Fiche collectivitÃ©"],
        ["Diagnostic", "Qualifier les biens, ressources et acteurs", "Note de situation"],
        ["CoopÃ©ration", "DÃ©finir les responsabilitÃ©s", "Convention"],
        ["Suivi", "Documenter les effets", "Grille d'impact"],
      ]),
      collectivityConventionSection(),
      collectivityDecisionMatrixSection(),
      timeline("Devenir territoire partenaire", [
        ["1", "Premier Ã©change", "La collectivitÃ© expose son besoin, son pÃ©rimÃ¨tre et les sujets prioritaires."],
        ["2", "Cadrage", "TVF identifie les donnÃ©es utiles, acteurs Ã  mobiliser et contraintes de procÃ©dure."],
        ["3", "Diagnostic", "Les situations sont classÃ©es : signalÃ©es, qualifiÃ©es, orientÃ©es ou Ã  Ã©carter."],
        ["4", "Convention", "Le cadre de coopÃ©ration prÃ©cise les rÃ´les, limites, livrables et modalitÃ©s de suivi."],
        ["5", "Pilotage", "Un comitÃ© de suivi documente les dÃ©cisions, les suites et les indicateurs."],
      ]),
      textBlock("Point de vigilance", "TVF n'agit pas Ã  la place de la collectivitÃ©. L'association propose un cadre de coopÃ©ration qui doit respecter les compÃ©tences, les dÃ©cisions, les procÃ©dures publiques, les rÃ¨gles de communication et la protection des donnÃ©es."),
      faqSection([
        ["Une collectivitÃ© doit-elle dÃ©jÃ  avoir un projet identifiÃ© ?", "Non. TVF peut intervenir dÃ¨s la phase de cadrage, lorsqu'il existe seulement un besoin, un pÃ©rimÃ¨tre ou une prioritÃ© Ã  clarifier."],
        ["TVF peut-elle annoncer un partenariat avec une mairie ?", "Uniquement aprÃ¨s accord formalisÃ©. Aucun logo ni nom de collectivitÃ© ne doit Ãªtre utilisÃ© sans validation."],
        ["Quels documents prÃ©parer pour un premier Ã©change ?", "Une fiche collectivitÃ©, le pÃ©rimÃ¨tre concernÃ©, les donnÃ©es disponibles, les interlocuteurs et les contraintes dÃ©jÃ  connues."],
      ]),
    ],
  },
  {
    file: "proprietaires.html",
    title: "PropriÃ©taires",
    meta:
      "Parcours propriÃ©taires TVF : proposer un bien vacant, dÃ©gradÃ© ou inutilisÃ© et prÃ©parer un cadre de coopÃ©ration.",
    heroImage: "assets/photos/immeuble-renovation-meudon.jpg",
    eyebrow: "PropriÃ©taires",
    h1: "Proposer un bien sans perdre le cadre.",
    intro:
      "Un propriÃ©taire peut prÃ©senter un logement, commerce, bÃ¢timent ou terrain inutilisÃ©. TVF Ã©tudie ensuite les usages possibles, les contraintes et les conditions d'une convention.",
    ctas: [["PrÃ©senter un bien", "contact.html"], ["Voir la mÃ©thode", "notre-methode.html"]],
    sections: [
      sectionIntro(
        "Le propriÃ©taire reste au centre de la dÃ©cision",
        "TVF ne prend pas la place du propriÃ©taire et ne transforme pas un bien sans accord Ã©crit. La dÃ©marche vise d'abord Ã  comprendre la situation : Ã©tat du bien, contraintes, coÃ»ts possibles, usages utiles au territoire et conditions d'une coopÃ©ration Ã©quilibrÃ©e.",
        [
          ["PropriÃ©tÃ© conservÃ©e", "Le bien reste la propriÃ©tÃ© de son dÃ©tenteur."],
          ["Usage encadrÃ©", "Toute occupation, visite ou intervention doit Ãªtre formalisÃ©e."],
          ["Valorisation possible", "Un bien inutilisÃ© peut devenir logement, local associatif, commerce, atelier ou lieu partagÃ©."],
        ]
      ),
      cards("Ce qui peut Ãªtre Ã©tudiÃ©", "Chaque bien doit Ãªtre qualifiÃ© avant d'imaginer un usage.", [
        ["Logement", "Vacant, dÃ©gradÃ©, sous-utilisÃ© ou difficile Ã  remettre en Ã©tat."],
        ["Commerce", "Cellule fermÃ©e, local inoccupÃ©, rez-de-chaussÃ©e Ã  rÃ©activer."],
        ["BÃ¢timent", "Immeuble, atelier, Ã©quipement ou local sans usage clair."],
        ["Terrain", "Espace dÃ©laissÃ© pouvant accueillir un usage collectif ou transitoire."],
      ]),
      tableSection("ScÃ©narios possibles", "Les usages dÃ©pendent toujours de l'Ã©tat du bien, du droit applicable, du budget et des responsabilitÃ©s.", [
        ["ScÃ©nario", "Usage possible", "Points Ã  cadrer"],
        ["Usage temporaire", "Occupation limitÃ©e pour tester un besoin local", "DurÃ©e, assurance, accÃ¨s, restitution"],
        ["Usage solidaire", "Logement, local associatif, atelier ou espace partagÃ©", "Public concernÃ©, gestion, sÃ©curitÃ©"],
        ["Valorisation progressive", "Travaux par Ã©tapes, rÃ©emploi de matÃ©riaux, recherche de soutiens", "Budget, devis, convention, suivi"],
        ["RÃ©orientation", "Transmission vers un acteur plus adaptÃ© si TVF n'est pas le bon cadre", "Motif, contact utile, limites"],
      ]),
      tableSection("Points Ã  vÃ©rifier", "Un projet sÃ©rieux commence par les contraintes.", [
        ["Sujet", "Question", "Document utile"],
        ["PropriÃ©tÃ©", "Qui peut autoriser l'usage ?", "Justificatif ou accord"],
        ["Ã‰tat", "Le bien est-il accessible et sÃ©curisÃ© ?", "Photos, diagnostics"],
        ["Usage", "Quel usage est rÃ©aliste ?", "Fiche projet"],
        ["DurÃ©e", "Quelle durÃ©e de coopÃ©ration est acceptable ?", "Convention"],
      ]),
      ownerConventionSection(),
      ownerReadinessMatrixSection(),
      timeline("Parcours propriÃ©taire", [
        ["1", "PrÃ©sentation du bien", "Le propriÃ©taire transmet les informations disponibles sans engagement automatique."],
        ["2", "Qualification", "TVF analyse l'Ã©tat apparent, les contraintes, les usages possibles et les piÃ¨ces manquantes."],
        ["3", "Visite autorisÃ©e", "Une visite peut Ãªtre organisÃ©e seulement avec accord Ã©crit et rÃ¨gles de sÃ©curitÃ©."],
        ["4", "ScÃ©narios", "Plusieurs usages sont comparÃ©s : temporaire, solidaire, Ã©conomique, associatif ou rÃ©orientation."],
        ["5", "Convention", "Si une suite est retenue, les rÃ´les, durÃ©es, responsabilitÃ©s et conditions de restitution sont Ã©crits."],
      ]),
      textBlock("Principe", "Le propriÃ©taire conserve ses droits. Toute intervention doit Ãªtre encadrÃ©e par un accord clair, prÃ©cisant les usages, la durÃ©e, les responsabilitÃ©s, l'assurance, la communication et les limites de l'intervention."),
      faqSection([
        ["Proposer un bien engage-t-il le propriÃ©taire ?", "Non. La premiÃ¨re Ã©tape sert uniquement Ã  Ã©tudier la situation. Aucun usage, travaux ou affichage public ne doit Ãªtre engagÃ© sans Ã©crit."],
        ["TVF peut-elle financer automatiquement une rÃ©novation ?", "Non. Les financements doivent Ãªtre recherchÃ©s, vÃ©rifiÃ©s, accordÃ©s et tracÃ©s. Aucun soutien ne doit Ãªtre annoncÃ© comme acquis sans preuve."],
        ["Un bien trÃ¨s dÃ©gradÃ© peut-il Ãªtre Ã©tudiÃ© ?", "Oui, mais la sÃ©curitÃ©, l'accÃ¨s, les diagnostics, les responsabilitÃ©s et la faisabilitÃ© financiÃ¨re deviennent prioritaires."],
      ]),
    ],
  },
  {
    file: "entreprises.html",
    title: "Entreprises",
    meta:
      "Parcours entreprises TVF : matÃ©riaux, compÃ©tences, locaux, mÃ©cÃ©nat, RSE et contribution territoriale.",
    heroImage: "assets/photos/materiaux-renovation-outils.jpg",
    eyebrow: "Entreprises",
    h1: "Transformer une contribution en impact territorial.",
    intro:
      "Les entreprises peuvent contribuer par des matÃ©riaux, compÃ©tences, locaux, logistique ou mÃ©cÃ©nat. TVF aide Ã  relier ces contributions Ã  des projets cadrÃ©s et traÃ§ables.",
    ctas: [["Remplir la fiche", "documents/fiche-entreprise.md"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Contribuer sans dÃ©classer la ressource",
        "TVF aide les entreprises Ã  transformer des ressources disponibles en contribution territoriale utile. Un surplus de chantier, du mobilier, une compÃ©tence ou un local ne sont pas traitÃ©s comme un simple don isolÃ© : ils sont qualifiÃ©s, tracÃ©s puis reliÃ©s Ã  un besoin rÃ©el.",
        [
          ["RÃ©emploi", "Donner une seconde utilitÃ© Ã  des matÃ©riaux ou Ã©quipements encore exploitables."],
          ["RSE concrÃ¨te", "Relier l'engagement de l'entreprise Ã  un projet local documentÃ©."],
          ["TraÃ§abilitÃ©", "Conserver les preuves d'affectation, de dÃ©cision et de communication."],
        ]
      ),
      cards("Formes de contribution", "Chaque contribution doit Ãªtre dÃ©crite, localisÃ©e et affectÃ©e Ã  un besoin validÃ©.", [
        ["MatÃ©riaux", "Surplus, invendus, Ã©lÃ©ments de chantier ou Ã©quipements rÃ©utilisables."],
        ["CompÃ©tences", "Expertise technique, juridique, logistique, architecturale ou financiÃ¨re."],
        ["Locaux", "Espaces temporairement disponibles ou Ã  remettre en usage."],
        ["MÃ©cÃ©nat", "Soutien financier ou en nature avec traÃ§abilitÃ©."],
      ]),
      tableSection("Ce que l'entreprise gagne en clartÃ©", "La valeur d'une contribution repose sur son utilitÃ©, sa traÃ§abilitÃ© et son affectation.", [
        ["Situation", "Risque si rien n'est cadrÃ©", "Cadre TVF"],
        ["MatÃ©riaux disponibles", "Stockage inutile, gaspillage, coÃ»t d'Ã©vacuation", "Bordereau, Ã©tat, quantitÃ©, destination possible"],
        ["CompÃ©tence proposÃ©e", "Action ponctuelle difficile Ã  valoriser", "Mission, pÃ©rimÃ¨tre, livrable, compte rendu"],
        ["Local disponible", "Usage flou ou responsabilitÃ© mal dÃ©finie", "Convention, assurance, accÃ¨s, durÃ©e"],
        ["MÃ©cÃ©nat", "Communication fragile ou impact non vÃ©rifiable", "Projet instruit, budget, reporting"],
      ]),
      tableSection("BÃ©nÃ©fices pour l'entreprise", "Le partenariat doit Ãªtre utile au territoire et clair pour l'entreprise.", [
        ["BÃ©nÃ©fice", "Description", "Preuve"],
        ["RSE", "Contribution concrÃ¨te Ã  l'Ã©conomie circulaire et locale", "Fiche contribution"],
        ["TraÃ§abilitÃ©", "Suivi de l'affectation des ressources", "Registre ou convention"],
        ["Ancrage local", "Participation Ã  un projet du territoire", "Compte rendu"],
        ["Communication", "Valorisation possible aprÃ¨s accord", "Validation commune"],
      ]),
      enterpriseOperationalSection(),
      enterpriseValueMatrixSection(),
      timeline("Du contact Ã  la contribution", [
        ["1", "Description", "L'entreprise prÃ©sente ce qu'elle peut apporter : matÃ©riaux, locaux, compÃ©tences ou soutien."],
        ["2", "Qualification", "TVF vÃ©rifie l'Ã©tat, la disponibilitÃ©, la sÃ©curitÃ©, la logistique et l'utilitÃ©."],
        ["3", "Affectation", "La ressource est orientÃ©e vers un projet validÃ© ou mise en attente."],
        ["4", "Formalisation", "Les responsabilitÃ©s, limites et droits de communication sont Ã©crits."],
        ["5", "Suivi", "La contribution est tracÃ©e et peut Ãªtre valorisÃ©e aprÃ¨s accord."],
      ]),
      textBlock("Ce que TVF refuse", "TVF n'est pas une dÃ©chetterie ni une plateforme de dÃ©stockage libre. Les contributions doivent Ãªtre rÃ©utilisables, utiles et compatibles avec un projet validÃ©."),
      faqSection([
        ["Une entreprise peut-elle donner des matÃ©riaux ?", "Oui, si les matÃ©riaux sont rÃ©utilisables, dÃ©crits, accessibles, sÃ©curisÃ©s et compatibles avec un projet ou une mise en attente cadrÃ©e."],
        ["Le logo de l'entreprise sera-t-il affichÃ© ?", "Seulement aprÃ¨s accord formalisÃ©. L'utilisation d'un logo suppose une autorisation Ã©crite, un pÃ©rimÃ¨tre clair et des rÃ¨gles de communication validÃ©es."],
        ["Une contribution peut-elle Ãªtre refusÃ©e ?", "Oui. TVF peut refuser ou rÃ©orienter une ressource si elle est dangereuse, inutilisable, impossible Ã  stocker ou sans destination rÃ©aliste."],
      ]),
    ],
  },

  {
    file: "benevoles-citoyens.html",
    title: "BÃ©nÃ©voles & citoyens",
    meta:
      "Parcours bÃ©nÃ©voles et citoyens de Territoires Vivants France : signaler, participer, documenter et agir localement.",
    heroImage: "assets/photos/jardin-partage-france.jpg",
    eyebrow: "Citoyens",
    h1: "Agir utilement, avec un cadre clair.",
    intro:
      "Les citoyens et bÃ©nÃ©voles peuvent aider TVF Ã  repÃ©rer les situations, documenter les besoins, participer Ã  des actions encadrÃ©es et relayer les projets locaux.",
    ctas: [["Proposer mon aide", "contact.html"], ["Choisir mon parcours", "agir-avec-nous.html"]],
    sections: [
      sectionIntro(
        "Un engagement utile, encadrÃ© et progressif",
        "Les bÃ©nÃ©voles et citoyens sont essentiels pour repÃ©rer, documenter, relayer et participer. Mais l'engagement doit rester sÃ©curisÃ© : pas d'entrÃ©e dans un bien privÃ© sans autorisation, pas de chantier sans encadrement, pas de reprÃ©sentation officielle sans mandat.",
        [
          ["RepÃ©rer", "Faire remonter une situation visible ou connue localement."],
          ["Documenter", "Aider Ã  collecter des informations vÃ©rifiables et utiles."],
          ["Participer", "Rejoindre une mission claire, limitÃ©e et encadrÃ©e."],
        ]
      ),
      cards("FaÃ§ons de participer", "L'engagement doit rester simple, utile et sÃ©curisÃ©.", [
        ["Signaler", "Transmettre une situation : bien vacant, commerce fermÃ©, terrain dÃ©laissÃ© ou matÃ©riau disponible."],
        ["Documenter", "Aider Ã  collecter des informations publiques, photos, contacts et Ã©lÃ©ments de contexte."],
        ["Participer", "Rejoindre une action locale ou un chantier uniquement lorsqu'il est encadrÃ©."],
        ["Relayer", "Mettre en relation TVF avec des acteurs du territoire."],
      ]),
      tableSection("Missions possibles", "Chaque mission doit avoir une durÃ©e, un rÃ©fÃ©rent et une limite claire.", [
        ["Mission", "Exemple", "Condition"],
        ["Signalement citoyen", "Local fermÃ©, terrain dÃ©laissÃ©, matÃ©riau disponible", "Rester factuel et respecter la propriÃ©tÃ©"],
        ["Appui documentaire", "Recherche de sources publiques, photos de contexte, contacts locaux", "Ne pas collecter de donnÃ©es sensibles inutilement"],
        ["Action terrain", "Tri, inventaire, animation, jardin, chantier encadrÃ©", "Plan de prÃ©vention et rÃ©fÃ©rent prÃ©sent"],
        ["Relais local", "Mettre en relation TVF avec une association, artisan, Ã©lu ou habitant", "Ne pas engager TVF sans validation"],
      ]),
      tableSection("Cadre bÃ©nÃ©vole", "Chaque mission doit Ãªtre claire avant de commencer.", [
        ["Point", "Question", "RÃ©ponse attendue"],
        ["Mission", "Que faut-il faire ?", "TÃ¢che prÃ©cise et limitÃ©e"],
        ["Encadrement", "Qui suit la mission ?", "RÃ©fÃ©rent identifiÃ©"],
        ["SÃ©curitÃ©", "Y a-t-il un risque ?", "Consignes et limites"],
        ["DonnÃ©es", "Que peut-on publier ?", "Accord et respect de la vie privÃ©e"],
      ]),
      volunteerOperationalSection(),
      volunteerMissionSelectorSection(),
      timeline("Parcours bÃ©nÃ©vole", [
        ["1", "Se prÃ©senter", "Le bÃ©nÃ©vole indique son territoire, ses disponibilitÃ©s et ses compÃ©tences."],
        ["2", "Choisir une mission", "TVF propose une mission adaptÃ©e au besoin et au niveau d'encadrement disponible."],
        ["3", "Cadrer", "Objectifs, limites, sÃ©curitÃ©, donnÃ©es et rÃ©fÃ©rent sont prÃ©cisÃ©s."],
        ["4", "Agir", "L'action est rÃ©alisÃ©e dans le cadre dÃ©fini, avec Ã©margement si nÃ©cessaire."],
        ["5", "Restituer", "Un court compte rendu permet de garder une trace utile."],
      ]),
      textBlock("RÃ¨gle importante", "Un bÃ©nÃ©vole ne doit jamais entrer dans un bien privÃ©, intervenir sur un chantier ou reprÃ©senter TVF officiellement sans cadre validÃ©."),
      faqSection([
        ["Puis-je signaler un bien vacant ?", "Oui, mais un signalement reste une information Ã  qualifier. Il ne doit pas conduire Ã  entrer sur un site ou Ã  contacter un propriÃ©taire au nom de TVF sans cadre."],
        ["Puis-je participer Ã  un chantier ?", "Oui uniquement si le chantier est encadrÃ©, sÃ©curisÃ© et documentÃ©. TVF doit prÃ©ciser le rÃ©fÃ©rent, les consignes et les limites."],
        ["Faut-il des compÃ©tences techniques ?", "Pas forcÃ©ment. TVF peut avoir besoin de relais locaux, d'appui administratif, de documentation, de communication prudente ou d'aide lors d'actions simples."],
      ]),
    ],
  },
  {
    file: "financeurs-mecenes.html",
    title: "Financeurs & mÃ©cÃ¨nes",
    meta:
      "Parcours financeurs et mÃ©cÃ¨nes TVF : soutenir des projets instruits, avec gouvernance, transparence et suivi d'impact.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Financement",
    h1: "Soutenir des projets cadrÃ©s, pas des promesses floues.",
    intro:
      "TVF prÃ©pare une logique de financement responsable : chaque soutien doit Ãªtre reliÃ© Ã  un projet instruit, une convention, des indicateurs et une transparence de suivi.",
    ctas: [["Remplir la fiche", "documents/fiche-financeur.md"], ["Voir l'impact", "impact.html"]],
    sections: [
      sectionIntro(
        "Financer ce qui est instruit, mesurable et utile",
        "TVF veut Ã©viter les promesses floues. Un financeur doit savoir quel besoin il soutient, Ã  quel stade se trouve le projet, quelles piÃ¨ces existent, quelles dÃ©penses sont Ã©ligibles, quels risques sont identifiÃ©s et quels indicateurs pourront Ãªtre suivis.",
        [
          ["ClartÃ©", "Un objet de financement prÃ©cis, rattachÃ© Ã  un dossier."],
          ["TraÃ§abilitÃ©", "Un budget, un plan de financement et des justificatifs."],
          ["Impact vÃ©rifiable", "Des indicateurs publiÃ©s seulement aprÃ¨s mesure."],
        ]
      ),
      cards("Ce qui peut Ãªtre soutenu", "Le financement doit Ãªtre orientÃ© vers des besoins prÃ©cis.", [
        ["Diagnostic", "RepÃ©rage, qualification et documentation de biens ou ressources."],
        ["RÃ©emploi", "Logistique, stockage, tri et affectation de matÃ©riaux rÃ©utilisables."],
        ["Projet local", "Remise en usage d'un bien, commerce, local associatif ou espace partagÃ©."],
        ["Insertion", "Chantiers encadrÃ©s, bÃ©nÃ©volat, formation et accompagnement."],
      ]),
      tableSection("Ce qu'un financeur doit pouvoir vÃ©rifier", "La confiance repose sur la preuve, pas sur l'effet d'annonce.", [
        ["Question", "RÃ©ponse attendue", "Document utile"],
        ["Quel est le besoin ?", "Bien, ressource, territoire et public concernÃ©s", "Fiche projet"],
        ["Quel est le budget ?", "CoÃ»ts, postes, devis, reste Ã  financer", "Budget prÃ©visionnel"],
        ["Qui porte quoi ?", "RÃ´les, responsabilitÃ©s, convention", "Convention ou lettre d'intention"],
        ["Quels risques ?", "SÃ©curitÃ©, propriÃ©tÃ©, financement, calendrier", "Matrice des risques"],
        ["Quel impact suivre ?", "Indicateurs rÃ©alistes et mesurables", "Grille d'impact"],
      ]),
      tableSection("Garanties attendues", "Un financeur doit pouvoir comprendre ce qu'il soutient.", [
        ["Garantie", "Contenu", "Support"],
        ["Projet instruit", "Besoin, acteurs, risques et objectifs dÃ©finis", "Fiche projet"],
        ["Cadre", "ResponsabilitÃ©s et modalitÃ©s de suivi", "Convention"],
        ["TraÃ§abilitÃ©", "Utilisation des fonds ou ressources", "Compte rendu"],
        ["Impact", "Indicateurs publiÃ©s seulement aprÃ¨s vÃ©rification", "Grille d'impact"],
      ]),
      financerOperationalSection(),
      financerDueDiligenceSection(),
      timeline("Parcours financeur", [
        ["1", "Ã‰change", "TVF prÃ©sente le besoin, le territoire et le niveau de maturitÃ© du dossier."],
        ["2", "Instruction", "Le financeur examine budget, risques, piÃ¨ces et objectifs."],
        ["3", "Cadrage", "Les modalitÃ©s de soutien, de communication et de reporting sont dÃ©finies."],
        ["4", "Suivi", "L'utilisation du soutien est documentÃ©e avec justificatifs."],
        ["5", "Restitution", "TVF transmet un reporting honnÃªte : rÃ©sultats, limites et suites."],
      ]),
      textBlock("Principe", "TVF ne doit pas promettre un rendement, un impact ou une visibilitÃ© qui ne seraient pas contractualisÃ©s et vÃ©rifiables. Le mÃ©cÃ©nat et le financement doivent rester transparents."),
      faqSection([
        ["TVF peut-elle garantir un impact chiffrÃ© avant projet ?", "Non. Les objectifs peuvent Ãªtre formulÃ©s, mais les rÃ©sultats ne seront publiÃ©s qu'aprÃ¨s rÃ©alisation et vÃ©rification."],
        ["Un financeur peut-il soutenir une phase de diagnostic ?", "Oui. Le diagnostic est souvent l'Ã©tape indispensable pour Ã©viter de financer un projet mal cadrÃ©."],
        ["Comment TVF rend-elle compte ?", "Avec des piÃ¨ces de suivi : budget, dÃ©cisions, compte rendu, preuves d'utilisation, indicateurs et limites clairement mentionnÃ©es."],
      ]),
    ],
  },
  {
    file: "partenaires.html",
    title: "Partenaires",
    meta:
      "Devenir partenaire de Territoires Vivants France : collectivitÃ©s, entreprises, associations, propriÃ©taires, mÃ©cÃ¨nes et financeurs.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "CoopÃ©ration",
    h1: "Construire des partenariats utiles et traÃ§ables.",
    intro:
      "Cette page prÃ©sente les formes de coopÃ©ration possibles, les responsabilitÃ©s attendues et le cadre Ã  formaliser avant toute communication publique.",
    ctas: [["PrÃ©senter une coopÃ©ration", "contact.html"], ["Demander les supports", "contact.html"]],
    sections: [
      sectionIntro(
        "Un partenariat doit Ãªtre utile, formalisÃ© et vÃ©rifiable",
        "TVF distingue l'Ã©change exploratoire, la coopÃ©ration en instruction et le partenariat officialisÃ©. Cette progression Ã©vite de communiquer trop vite et permet Ã  chaque acteur de comprendre son rÃ´le exact.",
        [
          ["UtilitÃ©", "Le partenariat rÃ©pond Ã  un besoin territorial, social, environnemental ou Ã©conomique clairement identifiÃ©."],
          ["Cadre", "Les responsabilitÃ©s, limites, usages, donnÃ©es et modalitÃ©s de communication sont Ã©crites."],
          ["Preuve", "Chaque contribution peut Ãªtre suivie : matÃ©riau, compÃ©tence, financement, local, temps bÃ©nÃ©vole ou donnÃ©e."],
        ]
      ),
      cards("Qui peut coopÃ©rer avec TVF ?", "Chaque partenariat doit avoir un objectif, des responsabilitÃ©s et des preuves. Chaque carte renvoie vers les Ã©lÃ©ments Ã  prÃ©parer avant Ã©tude.", [
        ["CollectivitÃ©s", "Diagnostic, donnÃ©es, pÃ©rimÃ¨tre pilote, mise Ã  disposition ou expÃ©rimentation locale.", "#pieces-collectivite"],
        ["Entreprises", "MatÃ©riaux, compÃ©tences, mÃ©cÃ©nat, locaux, logistique ou expertise technique.", "#pieces-entreprise"],
        ["Associations", "Besoins locaux, usage futur, relais habitants, bÃ©nÃ©volat ou projet solidaire.", "#pieces-association"],
        ["PropriÃ©taires", "Bien vacant, commerce, terrain, bÃ¢timent ou immeuble Ã  Ã©tudier sans engagement automatique.", "#pieces-proprietaire"],
        ["Particuliers", "Signalement, matÃ©riaux disponibles, bÃ©nÃ©volat, connaissance locale ou proposition citoyenne.", "#pieces-particulier"],
        ["Financeurs", "Soutien financier, mÃ©cÃ©nat, investissement Ã  impact, reporting et transparence.", "#pieces-financeur"],
        ["Artisans", "CompÃ©tences, diagnostic technique, intervention, devis, conseil ou accompagnement chantier.", "#pieces-artisan"],
        ["Logistique", "Stockage, transport, vÃ©hicule, manutention ou mise Ã  disposition temporaire.", "#pieces-logistique"],
      ]),
      partnerPreparationSection(),
      tableSection("BÃ©nÃ©fices par type d'acteur", "Un partenariat TVF doit produire un bÃ©nÃ©fice partagÃ©, sans contrepartie floue ni promesse non Ã©crite.", [
        ["Acteur", "Contribution possible", "BÃ©nÃ©fice recherchÃ©", "Point Ã  formaliser"],
        ["CollectivitÃ©", "DonnÃ©es, locaux, relais institutionnel, expÃ©rimentation", "AccÃ©lÃ©rer une rÃ©ponse locale et mieux suivre les effets", "PÃ©rimÃ¨tre, gouvernance, usage des donnÃ©es, calendrier"],
        ["Entreprise", "MatÃ©riaux, mÃ©cÃ©nat, compÃ©tences, logistique", "Valoriser une dÃ©marche RSE concrÃ¨te et rÃ©duire le gaspillage", "TraÃ§abilitÃ©, affectation, communication, justificatifs"],
        ["PropriÃ©taire", "Bien vacant, terrain, commerce ou bÃ¢timent Ã  Ã©tudier", "PrÃ©server et valoriser un patrimoine tout en rÃ©pondant Ã  un besoin local", "Droit d'usage, durÃ©e, responsabilitÃ©s, restitution"],
        ["Association", "Besoin d'usage, bÃ©nÃ©volat, animation, expertise sociale", "AccÃ©der Ã  un cadre de projet plus lisible et mieux soutenu", "Public concernÃ©, rÃ¨gles d'accueil, sÃ©curitÃ©, suivi"],
        ["Financeur", "Soutien financier ou ingÃ©nierie de projet", "Appuyer des projets instruits avec reporting et indicateurs", "Objet financÃ©, indicateurs, justificatifs, calendrier de reporting"],
      ]),
      tableSection("ModalitÃ©s de convention selon le partenariat", "La forme juridique et opÃ©rationnelle dÃ©pend de ce qui est rÃ©ellement apportÃ©. TVF doit donc choisir le bon niveau de formalisation avant toute action.", [
        ["Situation", "Convention ou document adaptÃ©", "Clauses Ã  prÃ©voir"],
        ["Mise Ã  disposition d'un bien", "Convention d'Ã©tude, d'usage temporaire ou de coopÃ©ration propriÃ©taire", "DurÃ©e, accÃ¨s, assurance, travaux autorisÃ©s, restitution, communication"],
        ["Contribution d'une collectivitÃ©", "Convention de coopÃ©ration territoriale ou lettre de cadrage", "PÃ©rimÃ¨tre, donnÃ©es, gouvernance, livrables, calendrier, usage public"],
        ["Don ou valorisation de matÃ©riaux", "Fiche contribution, bordereau matÃ©riaux, procÃ¨s-verbal de remise", "Ã‰tat, quantitÃ©, retrait, sÃ©curitÃ©, affectation, absence de distribution libre"],
        ["MÃ©cÃ©nat ou soutien financier", "Convention de mÃ©cÃ©nat ou lettre d'engagement", "Objet du soutien, montant, calendrier, justificatifs, reporting, rÃ¨gles de visibilitÃ©"],
        ["Mission bÃ©nÃ©vole ou associative", "Fiche mission et consignes d'intervention", "RÃ´le, encadrement, sÃ©curitÃ©, durÃ©e, rÃ©fÃ©rent, droit Ã  l'image"],
      ]),
      tableSection("Cadre de partenariat", "Un partenariat sÃ©rieux se formalise avant communication publique.", [
        ["Ã‰tape", "Contenu", "Preuve attendue"],
        ["Intention", "Ã‰change sur le besoin, le territoire et le rÃ´le possible", "Compte rendu"],
        ["Instruction", "VÃ©rification juridique, technique, financiÃ¨re et opÃ©rationnelle", "Fiche projet"],
        ["Convention", "ResponsabilitÃ©s, durÃ©e, usages, suivi et communication", "Document signÃ©"],
        ["Suivi", "Indicateurs, retours d'expÃ©rience et preuves d'action", "Tableau de bord"],
      ]),
      partnerOfficialisationSection(),
      timeline("De l'intention Ã  l'officialisation", [
        ["1", "Premier Ã©change", "Comprendre le besoin, le territoire, la contribution possible et les limites."],
        ["2", "Qualification", "Rassembler les piÃ¨ces, vÃ©rifier la faisabilitÃ© et identifier les risques."],
        ["3", "DÃ©cision", "Valider si la coopÃ©ration entre bien dans l'objet TVF et dans les capacitÃ©s disponibles."],
        ["4", "Convention", "Ã‰crire le rÃ´le de chacun, les engagements, la communication et le suivi."],
        ["5", "Publication", "Afficher le partenariat uniquement lorsque le cadre est validÃ©."],
      ]),
      faqSection([
        ["TVF peut-elle afficher mon logo immÃ©diatement ?", "Un logo ou une mention publique suppose un accord formalisÃ©, afin que le pÃ©rimÃ¨tre, la durÃ©e et les rÃ¨gles de communication soient clairs pour chacun."],
        ["Une entreprise peut-elle donner des matÃ©riaux sans projet identifiÃ© ?", "Elle peut signaler une ressource. TVF doit ensuite vÃ©rifier l'Ã©tat, les conditions de rÃ©cupÃ©ration et l'affectation possible Ã  un projet validÃ©."],
        ["Une collectivitÃ© peut-elle tester TVF sur un pÃ©rimÃ¨tre limitÃ© ?", "Oui, une coopÃ©ration peut commencer par un diagnostic, un quartier pilote, une typologie de biens ou une dÃ©marche de cartographie progressive."],
      ]),
    ],
  },
  {
    file: "documents.html",
    title: "Documents TVF",
    meta:
      "Bibliotheque documentaire operationnelle de Territoires Vivants France : formulaires, pieces a fournir, conventions types et courriers prets a remplir.",
    heroImage: "assets/photos/saint-etienne-rue-resistance.jpg",
    eyebrow: "Bibliotheque operationnelle",
    h1: "Les bons documents pour instruire chaque demande.",
    intro:
      "Formulaires, pieces a fournir, conventions et courriers sont ranges par sujet pour faciliter le travail TVF : recevoir une demande, ouvrir un dossier, verifier les pieces, formaliser une convention et suivre la suite.",
    ctas: [["Telecharger le kit complet", "documents/TVF-kit-formulaires-conventions-prets-a-utiliser.zip"], ["Trouver par sujet", "#pieces-a-fournir-par-sujet"]],
    sections: [
      documentOperationalKitSection(),
      documentOrientationTableSection(),
      documentFormsBySubjectSection(),
      documentPiecesBySubjectSection(),
      documentConventionsTypesSection(),
      documentLettersAndUseSection(),
      documentWorkflowSection(),
      faqSection([
        ["Faut-il remplir tous les documents ?", "Non. Chaque demande commence par le formulaire adapte au sujet, puis par les pieces indispensables. Les conventions ne servent qu'apres instruction du dossier."],
        ["Les documents sont-ils modifiables ?", "Oui. Les modeles Word sont faits pour etre completes, adaptes au dossier et relus avant toute signature."],
        ["Une convention type suffit-elle pour engager TVF ?", "Non. Elle sert de base de travail. L'engagement reel suppose une decision TVF, des pieces verifiees, les assurances utiles et une signature par les personnes habilitees."],
      ]),
    ],
  },
  {
    file: "faq.html",
    title: "FAQ",
    meta:
      "Questions frÃ©quentes sur Territoires Vivants France, ses dÃ©marches, ses publics, ses conventions et ses documents.",
    heroImage: "assets/photos/batiment-rural-france.jpg",
    eyebrow: "Questions frÃ©quentes",
    h1: "Comprendre TVF en quelques rÃ©ponses.",
    intro:
      "Cette FAQ clarifie le rÃ´le de l'association, les Ã©tapes d'une dÃ©marche, les documents Ã  prÃ©parer et les limites de cette premiÃ¨re version.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Des rÃ©ponses utiles avant le premier Ã©change",
        "La FAQ doit Ã©viter les malentendus : TVF n'est ni un guichet automatique, ni une plateforme de dons libres, ni un opÃ©rateur public. C'est un cadre de coopÃ©ration qui demande des informations prÃ©cises avant toute dÃ©cision.",
        [
          ["Pour dÃ©cider", "Comprendre si votre demande entre dans l'objet TVF."],
          ["Pour prÃ©parer", "Identifier les piÃ¨ces, le contexte et les responsabilitÃ©s Ã  clarifier."],
          ["Pour orienter", "Savoir quelle page ou quel document utiliser avant de contacter l'association."],
        ]
      ),
      tableSection("RÃ©ponse rapide par profil", "Chaque public doit pouvoir trouver son premier pas en moins d'une minute.", [
        ["Profil", "Question frÃ©quente", "PremiÃ¨re action conseillÃ©e", "Page utile"],
        ["CollectivitÃ©", "Comment tester TVF sur mon territoire ?", "PrÃ©parer le pÃ©rimÃ¨tre, les donnÃ©es disponibles et le besoin public", "Espace collectivitÃ©s"],
        ["PropriÃ©taire", "Que faire avec un bien vacant ou dÃ©gradÃ© ?", "DÃ©crire le bien, son Ã©tat, les contraintes et les usages possibles", "Espace propriÃ©taires"],
        ["Entreprise", "Comment valoriser matÃ©riaux ou compÃ©tences ?", "Lister les ressources, leur Ã©tat, leur localisation et les conditions de rÃ©cupÃ©ration", "Espace entreprises"],
        ["BÃ©nÃ©vole", "Comment aider concrÃ¨tement ?", "Indiquer ses compÃ©tences, disponibilitÃ©s et territoire d'action", "BÃ©nÃ©voles & citoyens"],
        ["Financeur", "Comment soutenir un projet avec des indicateurs fiables ?", "Demander un dossier instruit avec budget, indicateurs et preuve de suivi", "Financeurs & mÃ©cÃ¨nes"],
      ]),
      tableSection("Avant de contacter TVF", "Ce cadre de lecture Ã©vite les demandes trop vagues et accÃ©lÃ¨re l'orientation vers le bon parcours.", [
        ["Situation", "Ã€ prÃ©parer", "Ã€ Ã©viter"],
        ["Bien vacant ou dÃ©gradÃ©", "Adresse, photos si possible, statut connu, contraintes d'accÃ¨s, idÃ©e d'usage", "Demander une intervention sans prÃ©ciser le propriÃ©taire ou le cadre"],
        ["MatÃ©riaux disponibles", "Nature, quantitÃ©, Ã©tat, localisation, dÃ©lai de retrait, conditions de sÃ©curitÃ©", "PrÃ©senter TVF comme une dÃ©chetterie ou un dÃ©barras automatique"],
        ["Projet de collectivitÃ©", "PÃ©rimÃ¨tre, besoin public, donnÃ©es disponibles, interlocuteurs, calendrier politique", "Lancer une communication avant d'avoir dÃ©fini le cadre"],
        ["Partenariat entreprise", "Contribution proposÃ©e, valeur d'usage, traÃ§abilitÃ©, contraintes logistiques", "Afficher un partenariat sans accord Ã©crit"],
        ["Soutien financier", "Objet du financement, budget prÃ©visionnel, indicateurs et reporting attendus", "Demander un rÃ©sultat chiffrÃ© avant rÃ©alisation"],
      ]),
      tableSection("OÃ¹ aller selon votre besoin", "Cette matrice transforme la FAQ en orientation rapide vers le bon parcours public.", [
        ["Besoin", "Page Ã  consulter", "Document conseillÃ©", "RÃ©sultat attendu"],
        ["Comprendre l'association", "Qui sommes-nous ?", "Dossier TVF", "Savoir si TVF correspond Ã  votre besoin"],
        ["Proposer un bien", "PropriÃ©taires", "Fiche propriÃ©taire", "Qualifier le bien sans engagement automatique"],
        ["Travailler avec une commune ou un EPCI", "CollectivitÃ©s", "Fiche collectivitÃ©", "PrÃ©parer un pÃ©rimÃ¨tre de coopÃ©ration"],
        ["Valoriser des matÃ©riaux", "Entreprises", "Fiche entreprise ou bordereau matÃ©riaux", "VÃ©rifier l'Ã©tat, la quantitÃ© et l'affectation possible"],
        ["Soutenir financiÃ¨rement", "Financeurs & mÃ©cÃ¨nes", "Plan de financement", "Ã‰valuer un dossier, ses limites et son reporting"],
        ["Participer bÃ©nÃ©volement", "BÃ©nÃ©voles & citoyens", "Fiche mission", "Identifier une mission utile et encadrÃ©e"],
      ]),
      faqSection([
        ["Comment TVF progresse-t-elle vers une plateforme opÃ©rationnelle ?", "TVF avance par Ã©tapes : cadrage des parcours, documents de travail, qualification des demandes, conventions, puis publication d'indicateurs uniquement lorsque les actions sont vÃ©rifiÃ©es."],
        ["TVF remplace-t-elle les collectivitÃ©s ou dispositifs publics ?", "Non. TVF se positionne comme un outil de coopÃ©ration et de coordination. L'association aide Ã  cadrer les besoins, rÃ©unir les acteurs et documenter les projets."],
        ["Un propriÃ©taire peut-il proposer un bien ?", "Oui. Il peut prÃ©senter un logement, un commerce, un bÃ¢timent ou un terrain inutilisÃ©. TVF Ã©tudie ensuite l'Ã©tat du bien, les contraintes et les usages envisageables."],
        ["Les matÃ©riaux sont-ils distribuÃ©s gratuitement ?", "Non. Les matÃ©riaux doivent Ãªtre orientÃ©s vers des projets validÃ©s. TVF privilÃ©gie la traÃ§abilitÃ©, l'utilitÃ© territoriale et l'affectation cohÃ©rente des ressources."],
        ["Une collectivitÃ© peut-elle devenir territoire partenaire ?", "Oui, aprÃ¨s un Ã©change de cadrage. Les objectifs, responsabilitÃ©s, donnÃ©es disponibles et modalitÃ©s de coopÃ©ration doivent Ãªtre formalisÃ©s."],
        ["Les chiffres d'impact sont-ils dÃ©jÃ  affichÃ©s ?", "Non. TVF ne communique pas de rÃ©sultats non mesurÃ©s. Les indicateurs seront publiÃ©s lorsqu'ils seront vÃ©rifiÃ©s et documentÃ©s."],
        ["Pourquoi TVF demande-t-elle des piÃ¨ces avant d'avancer ?", "Parce qu'un bien, un chantier, un don de matÃ©riaux ou un financement peut engager des responsabilitÃ©s. Les piÃ¨ces permettent de vÃ©rifier la faisabilitÃ© et de protÃ©ger les parties."],
        ["Un projet peut-il Ãªtre simplement conseillÃ© puis orientÃ© ailleurs ?", "Oui. Si TVF n'est pas le bon cadre, l'association doit pouvoir recommander une orientation plus adaptÃ©e plutÃ´t que d'entretenir une promesse impossible."],
        ["Peut-on utiliser les documents TVF comme modÃ¨les de travail ?", "Oui, ils sont conÃ§us comme des bases modifiables. Ils doivent toutefois Ãªtre adaptÃ©s au contexte, relus et validÃ©s avant toute signature."],
        ["Combien de temps prend une premiÃ¨re qualification ?", "Le dÃ©lai dÃ©pend de la qualitÃ© des informations transmises. Une demande avec adresse, contexte, interlocuteurs et piÃ¨ces de base peut Ãªtre orientÃ©e beaucoup plus vite qu'une intention gÃ©nÃ©rale."],
        ["TVF peut-elle intervenir sans propriÃ©taire identifiÃ© ?", "TVF peut aider Ã  qualifier une situation, mais aucune Ã©tude approfondie, visite ou convention ne doit Ãªtre engagÃ©e sans cadre clair et autorisation adaptÃ©e."],
        ["Que se passe-t-il aprÃ¨s le premier message ?", "TVF doit d'abord comprendre la demande, demander les piÃ¨ces manquantes, proposer une orientation et dÃ©cider si un Ã©change, une fiche projet ou une convention est pertinente."],
      ]),
    ],
  },
  {
    file: "notre-methode.html",
    title: "Notre mÃ©thode",
    meta:
      "La mÃ©thode TVF pour repÃ©rer, qualifier, conventionner, mobiliser et suivre les projets de revitalisation territoriale.",
    heroImage: "assets/photos/chantier-renovation-lyon.jpg",
    eyebrow: "MÃ©thode",
    h1: "Une mÃ©thode courte, traÃ§able et progressive.",
    intro:
      "TVF avance par Ã©tapes pour Ã©viter les promesses floues : comprendre la situation, vÃ©rifier les contraintes, rÃ©unir les acteurs, formaliser les engagements et suivre ce qui est rÃ©ellement fait.",
    ctas: [["PrÃ©parer un dossier", "documents.html"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Une mÃ©thode de dÃ©cision avant une mÃ©thode de communication",
        "La mÃ©thode TVF sert d'abord Ã  Ã©viter les confusions : un signalement n'est pas un projet, une intention n'est pas une convention, un objectif n'est pas un rÃ©sultat et une contribution n'est utile que si elle est affectÃ©e Ã  un besoin validÃ©.",
        [
          ["Qualifier", "Rassembler les Ã©lÃ©ments factuels avant toute annonce."],
          ["DÃ©cider", "VÃ©rifier l'utilitÃ©, la faisabilitÃ© et le niveau de risque."],
          ["Tracer", "Conserver les piÃ¨ces qui justifient les dÃ©cisions et les rÃ©sultats."],
        ]
      ),
      timeline("Les six Ã©tapes", [
        ["1", "RepÃ©rer", "Identifier un bien, un besoin, une ressource ou une opportunitÃ© territoriale."],
        ["2", "Qualifier", "Documenter l'adresse, l'Ã©tat, les usages possibles, les contraintes et les acteurs concernÃ©s."],
        ["3", "Prioriser", "VÃ©rifier si le projet rÃ©pond Ã  un besoin local rÃ©el et si les conditions minimales sont rÃ©unies."],
        ["4", "Conventionner", "Formaliser les responsabilitÃ©s, la durÃ©e, les usages, la communication et le suivi."],
        ["5", "Mobiliser", "Rechercher les compÃ©tences, matÃ©riaux, bÃ©nÃ©voles, partenaires et financements nÃ©cessaires."],
        ["6", "Suivre", "Documenter les actions, les dÃ©cisions, les indicateurs et les retours d'expÃ©rience."],
      ]),
      tableSection("CritÃ¨res de dÃ©cision", "Un projet TVF doit Ãªtre utile, faisable et traÃ§able.", [
        ["CritÃ¨re", "Question posÃ©e", "Preuve attendue"],
        ["UtilitÃ©", "Le projet rÃ©pond-il Ã  un besoin territorial clair ?", "Besoin dÃ©crit, public concernÃ©, usage envisagÃ©"],
        ["FaisabilitÃ©", "Les contraintes sont-elles identifiÃ©es ?", "Ã‰tat du bien, accÃ¨s, sÃ©curitÃ©, propriÃ©tÃ©, budget"],
        ["CoopÃ©ration", "Les acteurs nÃ©cessaires sont-ils mobilisables ?", "RÃ©fÃ©rents, contacts, rÃ´le de chaque partie"],
        ["TraÃ§abilitÃ©", "Le projet peut-il Ãªtre documentÃ© ?", "Fiche projet, convention, indicateurs, compte rendu"],
      ]),
      tableSection("De la demande Ã  la dÃ©cision", "Chaque entrÃ©e doit produire une suite lisible, mÃªme lorsqu'elle n'aboutit pas immÃ©diatement.", [
        ["EntrÃ©e", "Question centrale", "Document utile", "DÃ©cision possible"],
        ["Signalement", "Le lieu existe-t-il et peut-il Ãªtre qualifiÃ© ?", "Fiche signalement", "Classer, complÃ©ter, visiter ou orienter"],
        ["Bien proposÃ©", "Le propriÃ©taire accepte-t-il une Ã©tude et un cadre d'usage ?", "Fiche propriÃ©taire", "Ã‰tude, refus motivÃ© ou convention Ã  prÃ©parer"],
        ["MatÃ©riaux", "La ressource est-elle rÃ©employable et rÃ©cupÃ©rable ?", "Fiche entreprise ou particulier", "Affecter, stocker, refuser ou complÃ©ter"],
        ["Projet local", "Le besoin est-il clair et rÃ©aliste ?", "Fiche projet", "Prioriser, mettre en attente ou rechercher des partenaires"],
        ["Financement", "Le projet est-il assez cadrÃ© pour Ãªtre prÃ©sentÃ© ?", "Plan de financement", "Chercher un soutien, retravailler ou reporter"],
      ]),
      tableSection("Niveau de maturitÃ© d'un dossier", "Cette synthÃ¨se permet d'Ã©viter de prÃ©senter trop tÃ´t un dossier comme un projet abouti.", [
        ["Niveau", "DÃ©finition", "Ce qui manque souvent", "Suite logique"],
        ["Intention", "Une idÃ©e ou un besoin est exprimÃ©", "Adresse, porteur, piÃ¨ces, contraintes", "Demander les informations minimales"],
        ["Signalement qualifiÃ©", "Le lieu, la ressource ou le besoin est documentÃ©", "Accord, accÃ¨s, Ã©tat rÃ©el, prioritÃ©s", "DÃ©cider d'une visite ou d'une orientation"],
        ["Dossier instruisable", "Les acteurs, risques et usages possibles sont identifiÃ©s", "Budget, responsabilitÃ©s, convention", "PrÃ©parer le cadrage opÃ©rationnel"],
        ["Projet conventionnable", "Les engagements peuvent Ãªtre Ã©crits", "Financement, calendrier, validation finale", "RÃ©diger et valider la convention"],
        ["Action suivie", "Le projet est rÃ©alisÃ© ou en cours avec preuves", "Indicateurs consolidÃ©s, bilan", "Publier uniquement les rÃ©sultats vÃ©rifiÃ©s"],
      ]),
      tableSection("Livrables attendus par Ã©tape", "Une mÃ©thode institutionnelle doit laisser des traces simples, utiles et rÃ©utilisables en rÃ©union.", [
        ["Ã‰tape", "Livrable principal", "UtilitÃ© pour les partenaires"],
        ["RepÃ©rage", "Fiche signalement ou fiche entrÃ©e", "Comprendre rapidement la situation"],
        ["Qualification", "Note de diagnostic court", "Identifier risques, piÃ¨ces manquantes et faisabilitÃ©"],
        ["Priorisation", "Grille de dÃ©cision", "Choisir ce qui avance, attend ou sort du pÃ©rimÃ¨tre"],
        ["Convention", "Projet de convention ou lettre de cadrage", "SÃ©curiser les responsabilitÃ©s"],
        ["Mobilisation", "Plan d'action et liste des contributions", "Coordonner les acteurs et ressources"],
        ["Suivi", "Tableau d'indicateurs et bilan", "Rendre compte sans exagÃ©rer les rÃ©sultats"],
      ]),
      cards("Ce que la mÃ©thode Ã©vite", "La mÃ©thode sert aussi Ã  protÃ©ger le projet.", [
        ["Annonces prÃ©maturÃ©es", "Ne pas prÃ©senter un projet comme acquis tant qu'il n'est pas cadrÃ©."],
        ["Flou juridique", "Identifier les responsabilitÃ©s avant toute action."],
        ["Ressources dispersÃ©es", "Affecter les matÃ©riaux et contributions Ã  des besoins validÃ©s."],
        ["Impact non mesurÃ©", "Distinguer clairement objectifs, actions et rÃ©sultats."],
      ]),
      faqSection([
        ["Pourquoi autant de documents ?", "Parce qu'un projet territorial implique souvent un bien, des personnes, des responsabilitÃ©s, des risques, des ressources et des dÃ©cisions. Les documents Ã©vitent les malentendus."],
        ["Une demande peut-elle Ãªtre refusÃ©e ?", "Oui. TVF doit pouvoir refuser, reporter ou rÃ©orienter une demande si elle n'est pas conforme Ã  l'objet, trop risquÃ©e, insuffisamment documentÃ©e ou impossible Ã  suivre."],
        ["La mÃ©thode sera-t-elle identique partout ?", "Le socle reste commun, mais chaque territoire devra adapter les prioritÃ©s, les interlocuteurs, les donnÃ©es et les conventions Ã  son contexte local."],
      ]),
    ],
  },
  {
    file: "impact.html",
    title: "Impact & suivi",
    meta:
      "Indicateurs TVF pour suivre biens remis en usage, matÃ©riaux rÃ©employÃ©s, projets accompagnÃ©s et coopÃ©ration territoriale avec des preuves claires.",
    heroImage: "assets/photos/saint-etienne-panorama.jpg",
    eyebrow: "Impact",
    h1: "Mesurer avant d'annoncer.",
    intro:
      "Cette page prÃ©sente les indicateurs qui devront Ãªtre suivis lorsque les premiers projets seront instruits, conventionnÃ©s puis rÃ©alisÃ©s, avec une mÃ©thode de preuve lisible.",
    ctas: [["Voir la transparence", "transparence.html"], ["Demander la grille", "contact.html"]],
    sections: [
      sectionIntro(
        "Mesurer avec mÃ©thode",
        "L'impact TVF doit Ãªtre lu comme une chaÃ®ne de preuves. Avant de publier un rÃ©sultat, il faut savoir d'oÃ¹ vient la donnÃ©e, qui l'a validÃ©e, Ã  quel projet elle correspond et quelles limites doivent Ãªtre indiquÃ©es.",
        [
          ["Objectifs", "Ce que l'association cherche Ã  atteindre sur un territoire ou un projet."],
          ["Indicateurs", "Ce qui sera mesurÃ© avec une dÃ©finition stable."],
          ["RÃ©sultats", "Ce qui sera publiÃ© aprÃ¨s rÃ©alisation et vÃ©rification."],
        ]
      ),
      nationalDataSection("Contexte public Ã  relier aux futurs indicateurs"),
      cards("Indicateurs Ã  suivre", "Les chiffres seront publiÃ©s uniquement lorsqu'ils seront vÃ©rifiÃ©s.", [
        ["Biens qualifiÃ©s", "Nombre de logements, commerces, bÃ¢timents, terrains ou friches documentÃ©s."],
        ["Biens remis en usage", "Nombre de biens effectivement rÃ©activÃ©s aprÃ¨s convention et action."],
        ["MatÃ©riaux orientÃ©s", "Nature, quantitÃ©, Ã©tat et destination des matÃ©riaux rÃ©employables."],
        ["Acteurs mobilisÃ©s", "CollectivitÃ©s, propriÃ©taires, entreprises, associations et bÃ©nÃ©voles impliquÃ©s."],
        ["Projets conventionnÃ©s", "Nombre de dossiers disposant d'un cadre signÃ© et d'un suivi."],
        ["BÃ©nÃ©ficiaires", "Publics ou usages rendus possibles par le projet."],
      ]),
      tableSection("Lecture des rÃ©sultats", "Chaque indicateur doit Ãªtre replacÃ© dans son niveau de preuve.", [
        ["Niveau", "Ce que cela signifie", "Communication possible"],
        ["Objectif", "Ce que TVF souhaite atteindre", "Ã€ prÃ©senter comme intention"],
        ["Instruction", "Dossier en cours d'analyse", "Ã€ prÃ©senter comme Ã©tude"],
        ["Convention", "Engagement formalisÃ©", "Ã€ prÃ©senter comme projet cadrÃ©"],
        ["RÃ©alisation", "Action terminÃ©e et documentÃ©e", "Ã€ prÃ©senter comme rÃ©sultat"],
      ]),
      tableSection("Preuves attendues par indicateur", "Un indicateur n'a de valeur que si sa dÃ©finition et sa preuve sont stables.", [
        ["Indicateur", "DÃ©finition", "Preuve minimale", "Moment de publication"],
        ["Bien qualifiÃ©", "Bien documentÃ© avec adresse, statut, contraintes et usage possible", "Fiche signalement ou fiche propriÃ©taire", "AprÃ¨s qualification interne"],
        ["Projet conventionnÃ©", "Projet disposant d'un cadre Ã©crit et acceptÃ©", "Convention ou dÃ©cision formalisÃ©e", "AprÃ¨s signature ou validation"],
        ["MatÃ©riau rÃ©employÃ©", "Ressource affectÃ©e Ã  un projet identifiÃ©", "PV de remise, suivi d'affectation, photo ou justificatif", "AprÃ¨s affectation vÃ©rifiÃ©e"],
        ["BÃ©nÃ©vole mobilisÃ©", "Personne ayant participÃ© Ã  une action encadrÃ©e", "Feuille d'Ã©margement ou fiche mission", "AprÃ¨s action"],
        ["Impact territorial", "Effet local documentÃ© sur usage, service, cadre de vie ou Ã©conomie circulaire", "Compte rendu, indicateur, tÃ©moignage vÃ©rifiÃ©", "AprÃ¨s bilan"],
      ]),
      impactDashboardModelSection(),
      impactPublicationRulesSection(),
      textBlock(
        "Pourquoi cette prudence ?",
        "La crÃ©dibilitÃ© d'une association nationale repose sur la preuve. Un chiffre non vÃ©rifiÃ© peut fragiliser la confiance des collectivitÃ©s, propriÃ©taires, financeurs et habitants. TVF prÃ©fÃ¨re publier moins, mais publier juste."
      ),
      faqSection([
        ["Pourquoi ne pas afficher de compteurs dÃ¨s maintenant ?", "Parce qu'un compteur sans donnÃ©es vÃ©rifiÃ©es donnerait une impression artificielle. TVF prÃ©pare les indicateurs avant de publier des rÃ©sultats."],
        ["Les objectifs peuvent-ils Ãªtre affichÃ©s ?", "Oui, Ã  condition de les prÃ©senter comme des objectifs ou des estimations, jamais comme des rÃ©sultats rÃ©alisÃ©s."],
        ["Qui pourra utiliser les indicateurs ?", "Les collectivitÃ©s, partenaires, financeurs et Ã©quipes TVF pourront les utiliser pour suivre les dossiers, dÃ©cider et rendre compte de maniÃ¨re plus transparente."],
      ]),
    ],
  },
  {
    file: "gouvernance.html",
    title: "Gouvernance & Ã©thique",
    meta:
      "Gouvernance et Ã©thique de Territoires Vivants France : responsabilitÃ©s, critÃ¨res de dÃ©cision, transparence, traÃ§abilitÃ© et prÃ©vention des risques.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Cadre institutionnel",
    h1: "Une gouvernance lisible pour inspirer confiance.",
    intro:
      "TVF doit Ãªtre capable de dialoguer avec des collectivitÃ©s, propriÃ©taires, entreprises et financeurs. Cela suppose un cadre clair : qui dÃ©cide, sur quels critÃ¨res, avec quelles preuves et quelles limites de communication.",
    ctas: [["Lire la charte", "documents/charte-ethique.md"], ["Voir la transparence", "transparence.html"]],
    sections: [
      sectionIntro(
        "Une gouvernance pensÃ©e pour la confiance",
        "La gouvernance TVF doit permettre de rÃ©pondre simplement Ã  trois questions : qui porte la dÃ©cision, pourquoi le dossier est priorisÃ© et comment l'information sera rendue traÃ§able.",
        [
          ["DÃ©cider", "Aucun dossier ne doit avancer sans critÃ¨res lisibles."],
          ["Tracer", "Les Ã©tapes, validations et rÃ©serves doivent rester consultables."],
          ["Rendre compte", "La communication publique doit rester alignÃ©e avec les faits Ã©tablis."],
        ]
      ),
      tableSection("RepÃ¨res statutaires", "Les statuts signÃ©s le 22 juin 2026 complÃ¨tent le rÃ©cÃ©pissÃ© de crÃ©ation et donnent un cadre de fonctionnement public.", [
        ["Sujet", "RÃ¨gle statutaire", "ConsÃ©quence pour TVF"],
        ["DurÃ©e", "DurÃ©e indÃ©terminÃ©e", "Permettre un projet national inscrit dans le temps long"],
        ["Membres fondateurs", "Edryan Rangoly et Jordan Lambeau", "Identifier clairement les personnes Ã  l'origine de l'association"],
        ["Bureau", "PrÃ©sident, secrÃ©taire et trÃ©sorier", "Organiser la gestion quotidienne et les responsabilitÃ©s"],
        ["RÃ©unions du bureau", "Au moins deux fois par an", "Assurer un suivi rÃ©gulier des dÃ©cisions"],
        ["AssemblÃ©es", "Convocation au moins 15 jours avant l'assemblÃ©e", "Garantir l'information des membres"],
        ["Voix des membres", "Chaque membre dispose d'une voix", "PrÃ©server une base associative lisible"],
      ]),
      cards("Principes de gouvernance", "Chaque dÃ©cision doit pouvoir Ãªtre expliquÃ©e simplement.", [
        ["IntÃ©rÃªt gÃ©nÃ©ral", "Prioriser les projets utiles aux habitants, au territoire et Ã  la transition Ã©cologique."],
        ["TraÃ§abilitÃ©", "Conserver les Ã©lÃ©ments qui justifient une dÃ©cision, une convention ou une affectation de ressource."],
        ["ComplÃ©mentaritÃ©", "CoopÃ©rer avec les acteurs existants sans se prÃ©senter comme substitut aux dispositifs publics."],
        ["SobriÃ©tÃ©", "Communiquer uniquement sur les faits Ã©tablis, les objectifs assumÃ©s et les documents disponibles."],
      ]),
      tableSection("ResponsabilitÃ©s dÃ©clarÃ©es et Ã  tenir", "Cette organisation prÃ©pare une gouvernance lisible sans prÃ©juger des informations administratives officielles Ã  complÃ©ter.", [
        ["Fonction", "RÃ´le attendu", "Preuve ou document associÃ©"],
        ["PrÃ©sidence", "Porter la vision, reprÃ©senter l'association et arbitrer les prioritÃ©s structurantes", "Statuts, registre de dÃ©cisions, dÃ©lÃ©gations Ã©ventuelles"],
        ["SecrÃ©tariat", "Tenir les documents, convocations, comptes rendus, registres et suivi administratif", "ProcÃ¨s-verbaux, registre adhÃ©rents, registre dÃ©cisions"],
        ["TrÃ©sorerie", "Suivre les dÃ©penses, contributions, justificatifs, budgets et engagements financiers", "Budget prÃ©visionnel, engagement de dÃ©pense, reporting"],
        ["RÃ©fÃ©rent dossier", "Qualifier une demande, collecter les piÃ¨ces et prÃ©parer la dÃ©cision", "Fiche projet, grille d'instruction, compte rendu"],
        ["ComitÃ© de suivi", "Examiner les projets sensibles, arbitrer les risques et suivre les engagements", "Ordre du jour, compte rendu, matrice des risques"],
      ]),
      tableSection("RÃ¨gles de vigilance", "Ces points doivent Ãªtre vÃ©rifiÃ©s avant toute dÃ©cision ou publication.", [
        ["Sujet", "Risque Ã  Ã©viter", "RÃ¨gle TVF"],
        ["Partenariat", "Afficher un soutien non officialisÃ©", "Ne publier un nom ou un logo qu'aprÃ¨s accord rÃ©el"],
        ["Projet", "PrÃ©senter une intention comme une rÃ©alisation", "Indiquer clairement le statut : idÃ©e, instruction, convention, rÃ©alisation"],
        ["Financement", "Annoncer une aide non obtenue", "Distinguer montant estimÃ©, demandÃ©, accordÃ©, versÃ©"],
        ["BÃ©nÃ©volat", "Engager des personnes sans cadre", "PrÃ©voir mission, consignes, sÃ©curitÃ© et Ã©margement"],
        ["DonnÃ©es", "Diffuser une information sensible ou non vÃ©rifiÃ©e", "Sourcer, anonymiser si nÃ©cessaire et limiter la publication"],
      ]),
      tableSection("Processus de dÃ©cision", "Un dossier ne doit pas passer directement de l'idÃ©e Ã  la communication publique.", [
        ["Ã‰tape", "DÃ©cision attendue", "Preuve ou livrable"],
        ["RÃ©ception", "Le besoin entre-t-il dans l'objet TVF ?", "Fiche de contact ou fiche projet"],
        ["Qualification", "Les risques et contraintes sont-ils identifiÃ©s ?", "Diagnostic initial"],
        ["Priorisation", "Le projet rÃ©pond-il Ã  un besoin territorial rÃ©el ?", "BarÃ¨me de priorisation"],
        ["Convention", "Les rÃ´les et responsabilitÃ©s sont-ils cadrÃ©s ?", "Convention adaptÃ©e"],
        ["Suivi", "Les rÃ©sultats peuvent-ils Ãªtre vÃ©rifiÃ©s ?", "Grille d'impact"],
      ]),
      timeline("Rythme de suivi", [
        ["1", "Cadrer", "Identifier le rÃ©fÃ©rent, le pÃ©rimÃ¨tre, les documents et les points de vigilance."],
        ["2", "DÃ©cider", "Valider l'intÃ©rÃªt, la faisabilitÃ© et les conditions minimales du dossier."],
        ["3", "Formaliser", "Ã‰crire les engagements, usages, limites, responsabilitÃ©s et modalitÃ©s de suivi."],
        ["4", "Publier", "Communiquer seulement ce qui est vÃ©rifiÃ©, signÃ© ou explicitement prÃ©sentÃ© comme objectif."],
      ]),
      tableSection("Documents de gouvernance Ã  tenir", "Ces supports donnent une base de contrÃ´le comprÃ©hensible par une collectivitÃ©, un financeur ou un partenaire.", [
        ["Document", "UtilitÃ©", "Moment d'utilisation"],
        ["Charte Ã©thique", "Fixer les principes de prudence, transparence, intÃ©rÃªt gÃ©nÃ©ral et traÃ§abilitÃ©", "Avant toute communication institutionnelle"],
        ["Registre de dÃ©cisions", "Conserver les arbitrages, motifs, responsables et Ã©chÃ©ances", "Ã€ chaque dÃ©cision significative"],
        ["CritÃ¨res de sÃ©lection", "Prioriser les dossiers avec une grille stable et explicable", "Avant instruction d'un projet"],
        ["Matrice des risques", "Identifier les risques juridiques, techniques, financiers, humains et d'image", "Avant convention ou action terrain"],
        ["Reporting", "Rendre compte de l'usage des ressources, limites et rÃ©sultats", "Pendant et aprÃ¨s un projet"],
      ]),
      textBlock(
        "ResponsabilitÃ©s identifiÃ©es",
        "PrÃ©sident fondateur : Edryan Rangoly. SecrÃ©taire et trÃ©sorier : M. Lambeau Jordan. TVF dispose dâ€™un rÃ©cÃ©pissÃ© de dÃ©claration de crÃ©ation sous le numÃ©ro RNA W423016361 ; toute Ã©volution de gouvernance devra Ãªtre dÃ©clarÃ©e et mise Ã  jour sur les supports officiels."
      ),
      faqSection([
        ["Pourquoi une page gouvernance dÃ¨s maintenant ?", "Parce que la confiance institutionnelle se construit avant les premiers projets. Les rÃ¨gles de dÃ©cision doivent Ãªtre visibles dÃ¨s le dÃ©part."],
        ["Qui valide les projets ?", "Les modalitÃ©s dÃ©finitives devront Ãªtre prÃ©cisÃ©es dans les statuts, le rÃ¨glement intÃ©rieur et les procÃ©dures internes. Le site prÃ©sente le cadre de dÃ©cision attendu."],
        ["Comment Ã©viter les conflits d'intÃ©rÃªts ?", "Chaque dÃ©cision sensible doit Ãªtre tracÃ©e, motivÃ©e et appuyÃ©e par des piÃ¨ces. Une charte Ã©thique doit prÃ©ciser les rÃ¨gles de dÃ©claration et d'abstention."],
      ]),
    ],
  },
  {
    file: "kit-media.html",
    title: "Kit mÃ©dia",
    meta:
      "Kit mÃ©dia de Territoires Vivants France : logo officiel, prÃ©sentation, rÃ¨gles de citation et documents presse.",
    heroImage: "assets/photos/saint-etienne-centre-commerce.jpg",
    eyebrow: "Presse & communication",
    h1: "Des Ã©lÃ©ments publics cohÃ©rents et vÃ©rifiables.",
    intro:
      "Le kit mÃ©dia centralise les Ã©lÃ©ments qui peuvent Ãªtre repris dans une prÃ©sentation, un article, une note de synthÃ¨se ou un Ã©change institutionnel, sans crÃ©er de confusion sur l'Ã©tat rÃ©el du projet.",
    ctas: [["TÃ©lÃ©charger le dossier TVF", "output/pdf/dossier-presentation-tvf.pdf"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un kit mÃ©dia pour parler juste de TVF",
        "Le kit mÃ©dia sert Ã  harmoniser la prÃ©sentation publique : mÃªmes mots, mÃªmes limites, mÃªmes visuels, mÃªme exigence de preuve. Il Ã©vite qu'un article, un post ou une prÃ©sentation donne une impression plus avancÃ©e que la rÃ©alitÃ© du projet.",
        [
          ["Identifier", "Utiliser le logo officiel, le nom complet et les formulations validÃ©es."],
          ["Expliquer", "PrÃ©senter TVF comme une association nationale de coopÃ©ration territoriale."],
          ["ProtÃ©ger", "Ne pas annoncer de partenaires, chiffres ou rÃ©sultats non formalisÃ©s."],
        ]
      ),
      tableSection("Quel support utiliser ?", "Le kit mÃ©dia doit aider chaque interlocuteur Ã  choisir le bon niveau d'information.", [
        ["Usage", "Support recommandÃ©", "PrÃ©caution"],
        ["Rendez-vous institutionnel", "Dossier TVF PDF et dossier collectivitÃ©", "PrÃ©senter les objectifs comme un cadre de travail, pas comme des rÃ©sultats acquis"],
        ["Article ou interview", "Pitch officiel, prÃ©sentation courte et coordonnÃ©es", "VÃ©rifier les citations et ne pas transformer une piste en partenariat"],
        ["Publication rÃ©seaux sociaux", "Scripts rÃ©seaux sociaux, logo officiel, visuels crÃ©ditÃ©s", "Rester sobre sur les chiffres et renvoyer vers les pages sources"],
        ["DÃ©marche entreprise", "Dossier entreprise et mÃ©cÃ¨ne, fiche contribution", "PrÃ©ciser traÃ§abilitÃ©, usage des logos et reporting"],
        ["PrÃ©sentation propriÃ©taire", "Dossier propriÃ©taire et fiche bien solidaire", "Expliquer que l'Ã©tude ne crÃ©e pas d'engagement automatique"],
      ]),
      cards("Ã‰lÃ©ments disponibles", "Des supports simples pour parler de TVF avec justesse.", [
        ["Logo officiel", "Utiliser le logo officiel TVF sans le dÃ©former, le recadrer excessivement ou modifier ses couleurs.", "assets/logo-territoires-vivants-france.png"],
        ["PrÃ©sentation courte", "TVF coordonne la remise en usage de biens, lieux et ressources inutilisÃ©s au service des territoires.", "documents/kit-media.md"],
        ["Dossier TVF", "Un document de prÃ©sentation plus complet pour collectivitÃ©s, entreprises et financeurs.", "documents/dossier-presentation-tvf.md"],
        ["Dossier de contact TVF", "CoordonnÃ©es, services, pÃ´les, actions et informations Ã  prÃ©parer avant un premier Ã©change.", "documents/dossier-contact-tvf.md"],
        ["Dossier prospection Saint-Ã‰tienne", "Contacts Ã  solliciter, prioritÃ©s, angles d'approche et scripts pour lancer TVF localement.", "documents/dossier-prospection-saint-etienne.md"],
        ["Glossaire et annuaire Saint-Ã‰tienne", "Contacts par secteur, pÃ´les, chantiers d'insertion, matÃ©riaux, stockage et suivi de prospection.", "documents/glossaire-annuaire-contacts-saint-etienne.md"],
        ["Kit courriers prÃªts Ã  l'emploi", "ModÃ¨les prÃªts Ã  adapter pour demander un rendez-vous, des matÃ©riaux, un local, un partenariat ou un soutien.", "documents/kit-courriers-partenariats-demandes-tvf.md"],
        ["Dossier TVF PDF", "Version prÃªte Ã  transmettre pour une premiÃ¨re prÃ©sentation institutionnelle.", "output/pdf/dossier-presentation-tvf.pdf"],
        ["Dossier collectivitÃ© PDF", "Support ciblÃ© pour commune, EPCI, dÃ©partement, rÃ©gion ou service public.", "output/pdf/dossier-collectivite-tvf.pdf"],
        ["Dossier entreprise et mÃ©cÃ¨ne PDF", "Support ciblÃ© pour contribution, RSE, mÃ©cÃ©nat, matÃ©riaux et reporting.", "output/pdf/dossier-entreprise-mecene-tvf.pdf"],
        ["Dossier propriÃ©taire PDF", "Support ciblÃ© pour prÃ©senter un bien sans crÃ©er d'engagement automatique.", "output/pdf/dossier-proprietaire-tvf.pdf"],
        ["Pitch officiel", "Des versions 30 secondes, 1 minute, 3 minutes et dossier institutionnel.", "documents/pitch-officiel-tvf.md"],
        ["Scripts rendez-vous", "Des trames adaptÃ©es aux collectivitÃ©s, propriÃ©taires, entreprises et financeurs.", "documents/scripts-rendez-vous-institutionnels.md"],
        ["Objections rÃ©ponses", "Des rÃ©ponses crÃ©dibles aux questions sensibles avant un rendez-vous.", "documents/objections-reponses.md"],
        ["Scripts rÃ©seaux sociaux", "Des scripts vidÃ©o, carrousels et posts pour lancer la communication TVF.", "documents/scripts-video-reseaux-sociaux.md"],
        ["CrÃ©dits images", "Les visuels utilisÃ©s sur le site sont documentÃ©s dans le fichier de crÃ©dits.", "assets/photos/CREDITS.md"],
      ]),
      tableSection("RÃ¨gles d'usage visuel", "La cohÃ©rence graphique contribue directement Ã  la crÃ©dibilitÃ© institutionnelle.", [
        ["Ã‰lÃ©ment", "Usage recommandÃ©", "Ã€ Ã©viter"],
        ["Logo", "Utiliser les fichiers officiels, conserver les proportions et laisser une zone de respiration", "DÃ©former, recolorer, compresser ou placer sur un fond illisible"],
        ["Photographies", "PrivilÃ©gier des images franÃ§aises, territoriales, humaines et liÃ©es au sujet", "Images gÃ©nÃ©riques, rÃ©pÃ©tÃ©es ou sans lien avec la revitalisation"],
        ["Couleurs", "Respecter la palette TVF : vert, bleu profond, blanc cassÃ© et accents sobres", "Multiplier les couleurs ou utiliser des effets trop dÃ©coratifs"],
        ["Chiffres", "Citer uniquement des donnÃ©es sourcÃ©es ou des objectifs clairement nommÃ©s", "Transformer une hypothÃ¨se en rÃ©sultat"],
      ]),
      tableSection("Formulations recommandÃ©es", "Les mots utilisÃ©s doivent rester prÃ©cis et crÃ©dibles.", [
        ["Sujet", "Formulation recommandÃ©e", "Ã€ Ã©viter"],
        ["Nature", "Association loi 1901 dÃ©clarÃ©e, en dÃ©ploiement progressif", "Institution publique ou opÃ©rateur officiel"],
        ["RÃ´le", "Plateforme de coopÃ©ration et de coordination territoriale", "Remplacement des collectivitÃ©s ou dispositifs existants"],
        ["Impact", "Indicateurs Ã  mesurer aprÃ¨s projets conventionnÃ©s", "RÃ©sultats chiffrÃ©s non vÃ©rifiÃ©s"],
        ["Partenaires", "Partenaires Ã  afficher uniquement aprÃ¨s accord rÃ©el", "Logos ou rÃ©fÃ©rences non officialisÃ©s"],
      ]),
      tableSection("Ã‰lÃ©ments de langage prÃªts Ã  reprendre", "Ces formulations permettent de prÃ©senter TVF avec un ton institutionnel, sans surpromesse.", [
        ["Format", "Texte recommandÃ©", "Usage"],
        ["Phrase courte", "Territoires Vivants France coordonne la remise en usage de lieux, biens et ressources inutilisÃ©s au service des territoires.", "Signature de prÃ©sentation"],
        ["Phrase institutionnelle", "TVF aide collectivitÃ©s, propriÃ©taires, entreprises, associations, citoyens et financeurs Ã  transformer des situations vacantes en projets cadrÃ©s, documentÃ©s et utiles localement.", "Dossier, rendez-vous, communiquÃ©"],
        ["Angle Ã©cologique", "La dÃ©marche relie sobriÃ©tÃ© fonciÃ¨re, rÃ©emploi des matÃ©riaux, revitalisation locale et suivi d'impact.", "PrÃ©sentation transition Ã©cologique"],
        ["Angle social", "TVF cherche Ã  crÃ©er des parcours d'engagement, de bÃ©nÃ©volat et d'insertion autour de projets territoriaux concrets.", "PrÃ©sentation associations et habitants"],
        ["Angle Ã©conomique", "Le modÃ¨le vise Ã  rÃ©activer des ressources existantes plutÃ´t qu'Ã  laisser des bÃ¢timents, commerces ou matÃ©riaux sortir de l'usage.", "PrÃ©sentation entreprises et financeurs"],
      ]),
      tableSection("Checklist avant diffusion externe", "Avant une publication, chaque support doit Ãªtre relu comme s'il Ã©tait envoyÃ© Ã  une collectivitÃ© ou Ã  un financeur.", [
        ["Point de contrÃ´le", "Question Ã  poser", "Validation attendue"],
        ["Exactitude", "Le texte annonce-t-il uniquement ce qui est Ã©tabli ?", "Aucune promesse non vÃ©rifiÃ©e"],
        ["Sources", "Les chiffres et donnÃ©es sont-ils sourcÃ©s ou prÃ©sentÃ©s comme objectifs ?", "Source, date ou mention d'objectif"],
        ["Image", "Le visuel correspond-il au sujet et respecte-t-il la charte ?", "Logo lisible, photo cohÃ©rente, crÃ©dits disponibles"],
        ["Partenariat", "Un logo ou un nom externe est-il autorisÃ© ?", "Accord rÃ©el ou retrait de la mention"],
        ["Action attendue", "Le lecteur sait-il quoi faire ensuite ?", "CTA clair vers contact, document ou parcours"],
      ]),
      timeline("Validation avant diffusion", [
        ["1", "Choisir le support", "Utiliser le dossier, la fiche ou le pitch adaptÃ© Ã  l'interlocuteur."],
        ["2", "VÃ©rifier les faits", "ContrÃ´ler les sources, dates, statuts de projet, noms et autorisations de logo."],
        ["3", "Adapter le message", "Conserver le sens TVF sans promettre plus que ce qui est Ã©tabli."],
        ["4", "Valider la publication", "Faire relire les contenus sensibles avant diffusion externe."],
      ]),
      textBlock(
        "RÃ¨gle de communication",
        "TVF doit rester exigeante dans sa communication : chaque partenaire, rÃ©sultat ou engagement public doit Ãªtre vÃ©rifiable, cadrÃ© et cohÃ©rent avec l'Ã©tat rÃ©el du projet. Cette discipline Ã©ditoriale protÃ¨ge l'association, les partenaires et les futurs bÃ©nÃ©ficiaires."
      ),
      faqSection([
        ["Un journaliste peut-il reprendre les textes du site ?", "Il peut s'appuyer sur les formulations publiques, Ã  condition de ne pas transformer les objectifs en rÃ©sultats ni les pistes en partenariats officialisÃ©s."],
        ["Quel logo utiliser ?", "Le logo officiel fourni dans les assets du site doit Ãªtre utilisÃ© sans modification de proportions, de couleurs ou de composition."],
        ["TVF peut-elle fournir des visuels pour une prÃ©sentation ?", "Oui, les visuels disponibles doivent Ãªtre choisis pour leur cohÃ©rence avec le sujet et accompagnÃ©s des crÃ©dits lorsqu'ils existent."],
      ]),
    ],
  },
  {
    file: "contact.html",
    title: "Contact",
    meta:
      "Demander un rendez-vous ou contacter Territoires Vivants France : collectivitÃ©, propriÃ©taire, entreprise, financeur, bÃ©nÃ©vole ou partenaire.",
    heroImage: "assets/photos/saint-etienne-rue-resistance.jpg",
    eyebrow: "Contact",
    h1: "PrÃ©parer un Ã©change utile avec TVF.",
    intro:
      "Que vous soyez collectivitÃ©, propriÃ©taire, entreprise, financeur, association ou citoyen, l'objectif est simple : dÃ©crire la situation, identifier le bon parcours et prÃ©parer une suite claire.",
    ctas: [["Demander un rendez-vous", "#contact-form"], ["PrÃ©parer les piÃ¨ces", "documents.html"]],
    sections: [
      sectionIntro(
        "Un bon contact commence par une situation claire",
        "TVF n'attend pas un dossier parfait dÃ¨s le premier message. En revanche, quelques informations de base permettent de comprendre rapidement le territoire, le type de besoin, les acteurs dÃ©jÃ  identifiÃ©s et la suite Ã  prÃ©parer.",
        [
          ["Qui ?", "Indiquer votre profil : collectivitÃ©, propriÃ©taire, entreprise, association, habitant, financeur."],
          ["Quoi ?", "DÃ©crire le bien, le matÃ©riau, le projet, le besoin ou la coopÃ©ration envisagÃ©e."],
          ["OÃ¹ ?", "PrÃ©ciser la commune, le quartier, l'adresse si elle peut Ãªtre transmise et les contraintes connues."],
        ]
      ),
      contactAppointmentSection(),
      contactProfileTriageSection(),
      contactDetailsSection(),
      socialContactSection(),
      contactSection(),
      firstMeetingSection(),
      tableSection("Informations utiles Ã  transmettre", "Ces Ã©lÃ©ments facilitent un premier tri sans crÃ©er d'engagement automatique.", [
        ["Type de demande", "Informations Ã  prÃ©parer", "Document conseillÃ©"],
        ["Bien vacant", "Adresse, propriÃ©taire, Ã©tat apparent, photos, usages possibles, contraintes", "Fiche propriÃ©taire ou signalement"],
        ["MatÃ©riaux", "CatÃ©gorie, quantitÃ©, Ã©tat, localisation, date possible de rÃ©cupÃ©ration", "Fiche entreprise ou fiche signalement"],
        ["CollectivitÃ©", "PÃ©rimÃ¨tre, besoin public, donnÃ©es disponibles, interlocuteur, calendrier", "Fiche collectivitÃ©"],
        ["Partenariat", "Objectif, contribution possible, limites, mode de communication souhaitÃ©", "Fiche partenaire ou entreprise"],
        ["Financement", "Projet concernÃ©, budget, statut du dossier, indicateurs attendus", "Fiche financeur"],
      ]),
      timeline("AprÃ¨s votre message", [
        ["1", "RÃ©ception", "La demande est lue comme une premiÃ¨re information, sans engagement automatique."],
        ["2", "Orientation", "TVF identifie le bon parcours : collectivitÃ©, propriÃ©taire, entreprise, citoyen, financeur ou partenaire."],
        ["3", "ComplÃ©ment", "Les piÃ¨ces ou informations manquantes peuvent Ãªtre demandÃ©es avant toute dÃ©cision."],
        ["4", "Cadrage", "Si la demande entre dans l'objet TVF, un Ã©change ou un document de cadrage peut Ãªtre proposÃ©."],
      ]),
      textBlock(
        "SiÃ¨ge national",
        `Territoires Vivants France - ${official.status}. RNA : ${official.rna}. SIREN : ${official.siren}. SIRET du siÃ¨ge : ${official.siret}. SiÃ¨ge national : ${contact.address}. E-mail : ${contact.email}. TÃ©lÃ©phone : ${contact.phone}. PrÃ©sident fondateur : Edryan Rangoly. SecrÃ©taire et trÃ©sorier : M. Lambeau Jordan.`
      ),
      faqSection([
        ["Que faut-il Ã©crire dans le premier message ?", "Indiquez votre profil, le territoire concernÃ©, le type de demande, les informations dÃ©jÃ  disponibles et ce que vous attendez de TVF."],
        ["Un message vaut-il engagement ?", "Non. Un message ouvre un Ã©change. Les engagements Ã©ventuels doivent Ãªtre ensuite cadrÃ©s, validÃ©s et formalisÃ©s."],
        ["Puis-je joindre des photos ou piÃ¨ces ?", "Oui, lorsqu'un canal de transmission adaptÃ© est dÃ©fini. Ã‰vitez de transmettre des informations sensibles sans cadre clair."],
      ]),
    ],
  },
  {
    file: "transparence.html",
    title: "Transparence",
    meta:
      "Transparence de Territoires Vivants France : gouvernance, preuve, publication des donnÃ©es, registres de suivi et feuille de route publique.",
    heroImage: "assets/photos/friche-industrielle-ronchamp.jpg",
    eyebrow: "Transparence",
    h1: "Avancer avec mÃ©thode et preuve.",
    intro:
      "TVF distingue clairement les informations Ã©tablies, les objectifs publics, les dossiers Ã  instruire et les Ã©lÃ©ments qui devront Ãªtre validÃ©s par convention, source ou preuve avant publication.",
    ctas: [["Documents", "documents.html"], ["Contact", "contact.html"]],
    sections: [
      sectionIntro(
        "Une transparence utile, pas dÃ©corative",
        "La transparence TVF doit aider les visiteurs Ã  comprendre l'Ã©tat rÃ©el du projet : ce qui est dÃ©jÃ  cadrÃ©, ce qui relÃ¨ve de l'objectif et ce qui devra Ãªtre validÃ© avant d'Ãªtre annoncÃ© publiquement.",
        [
          ["Ã‰tabli", "Informations institutionnelles, documents prÃ©paratoires, mÃ©thode et responsabilitÃ©s connues."],
          ["Ã€ instruire", "Dossiers, partenariats, financements et projets avant convention."],
          ["Ã€ publier", "RÃ©sultats, impacts et partenaires uniquement aprÃ¨s vÃ©rification."],
        ]
      ),
      cards("Principes de publication", "Une rÃ¨gle simple : pas de chiffres ni de partenaires inventÃ©s.", [
        ["DonnÃ©es", "Publier uniquement des donnÃ©es sourcÃ©es ou des objectifs explicitement identifiÃ©s."],
        ["Partenariats", "Afficher les partenaires seulement lorsqu'un accord rÃ©el existe."],
        ["Projets", "Distinguer projet envisagÃ©, projet en instruction et projet rÃ©alisÃ©."],
        ["Impact", "Mesurer avant de communiquer des rÃ©sultats."],
        ["Gouvernance", "Rendre lisibles les responsabilitÃ©s, les dÃ©cisions et les critÃ¨res de sÃ©lection.", "gouvernance.html"],
        ["Kit mÃ©dia", "Mettre Ã  disposition les Ã©lÃ©ments publics validÃ©s et les rÃ¨gles d'usage.", "kit-media.html"],
        ["Ã‰lÃ©ments en attente", "Tenir une liste des informations officielles Ã  publier uniquement aprÃ¨s preuve.", "documents/registre-elements-officiels-en-attente.md"],
      ]),
      tableSection("Ã‰lÃ©ments officiels mis en attente", "Ces informations doivent rester en attente tant qu'elles ne sont pas vÃ©rifiÃ©es, attribuÃ©es ou autorisÃ©es Ã  la publication.", [
        ["Ã‰lÃ©ment", "Statut de publication", "Preuve attendue"],
        ["RÃ©fÃ©rences administratives", `RNA ${official.rna} ; SIREN ${official.siren} ; SIRET du siÃ¨ge ${official.siret}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Partenaires", "Ne pas afficher sans accord rÃ©el", "Convention, courrier, autorisation de logo"],
        ["Financeurs ou mÃ©cÃ¨nes", "Ne pas prÃ©senter comme acquis sans dÃ©cision", "Convention, notification, accord Ã©crit"],
        ["Projets rÃ©alisÃ©s", "Ne pas communiquer avant rÃ©alisation vÃ©rifiÃ©e", "Compte rendu, convention, photos autorisÃ©es, indicateurs"],
        ["Chiffres d'impact", "Ne pas publier sans mÃ©thode de calcul", "Grille d'impact, source, date, preuve"],
      ]),
      textBlock(
        "RÃ©fÃ©rences administratives publiÃ©es",
        "TVF dispose du numÃ©ro RNA W423016361 et de lâ€™identifiant SIREN 107 226 128, avec SIRET du siÃ¨ge 107 226 128 00018, selon lâ€™avis de situation SIRENE du 7 juillet 2026. Les informations dâ€™hÃ©bergement et toute Ã©volution statutaire devront rester appuyÃ©es par une piÃ¨ce officielle."
      ),
      tableSection("Statuts et transparence associative", "Les statuts prÃ©cisent le cadre de fonctionnement interne et les ressources autorisÃ©es. Le site en publie une synthÃ¨se sans rendre les documents internes librement tÃ©lÃ©chargeables.", [
        ["Point statutaire", "Ce qui est prÃ©vu", "Publication sur le site"],
        ["Objet", "Revitalisation des territoires, habitat, commerces, friches, rÃ©emploi, insertion, solidaritÃ© et accompagnement", "SynthÃ¨se publique dans les pages institutionnelles"],
        ["Ressources", "Cotisations, subventions, prestations, dons et ressources autorisÃ©es par la loi", "PrÃ©sentation sans annoncer de financement non obtenu"],
        ["IndemnitÃ©s", "Fonctions exercÃ©es librement et volontairement, remboursements possibles sur justificatifs", "Principe de prudence et de traÃ§abilitÃ©"],
        ["Dissolution", "Actif net non rÃ©parti entre les membres et attribuÃ© Ã  une structure d'intÃ©rÃªt gÃ©nÃ©ral ou objet similaire", "Garantie d'intÃ©rÃªt gÃ©nÃ©ral"],
      ]),
      tableSection("Ce qui peut Ãªtre publiÃ©", "Chaque information doit Ãªtre reliÃ©e Ã  son niveau de preuve.", [
        ["Information", "Publication possible", "Condition"],
        ["Objectif", "Oui", "Mentionner qu'il s'agit d'une intention ou d'une cible"],
        ["Projet en discussion", "Avec prudence", "Ne pas le prÃ©senter comme acquis"],
        ["Partenaire", "Oui", "Accord ou convention rÃ©elle"],
        ["Montant de financement", "Oui", "Distinguer demandÃ©, accordÃ©, conventionnÃ© et versÃ©"],
        ["RÃ©sultat d'impact", "Oui", "AprÃ¨s rÃ©alisation, preuve et mÃ©thode de calcul"],
      ]),
      tableSection("Niveaux de preuve avant publication", "Cette rÃ¨gle Ã©ditoriale permet de publier avec confiance sans inventer de rÃ©sultat, de partenaire ou de financement.", [
        ["Niveau", "Ce que cela signifie", "Peut Ãªtre publiÃ© ?", "Formulation recommandÃ©e"],
        ["Information reÃ§ue", "Un acteur a transmis une indication non vÃ©rifiÃ©e", "Non, sauf mention interne", "Information Ã  qualifier"],
        ["Dossier qualifiÃ©", "Les piÃ¨ces minimales existent et le sujet entre dans l'objet TVF", "Oui avec prudence", "Dossier Ã  l'Ã©tude"],
        ["Accord Ã©crit", "Un accord, courrier ou convention encadre la relation", "Oui", "CoopÃ©ration formalisÃ©e"],
        ["Action rÃ©alisÃ©e", "L'action est terminÃ©e ou suffisamment documentÃ©e", "Oui", "Action rÃ©alisÃ©e, avec preuves"],
        ["Impact mesurÃ©", "Les rÃ©sultats sont calculÃ©s avec mÃ©thode et sources", "Oui", "RÃ©sultat vÃ©rifiÃ©, source et date"],
      ]),
      tableSection("Registres Ã  tenir", "Ces registres transforment la transparence en mÃ©thode de travail concrÃ¨te.", [
        ["Registre", "Ce qu'il trace", "Pourquoi c'est utile"],
        ["Demandes entrantes", "Origine, profil, territoire, objet, statut et prochaine action", "Ne pas perdre les sollicitations et prioriser proprement"],
        ["DÃ©cisions", "Motif, responsable, date, rÃ©serves et piÃ¨ces consultÃ©es", "Pouvoir expliquer pourquoi un dossier avance ou non"],
        ["Partenariats", "Type d'accord, pÃ©rimÃ¨tre, durÃ©e, communication autorisÃ©e", "Ã‰viter les faux partenaires et les ambiguÃ¯tÃ©s publiques"],
        ["Financements", "Montants estimÃ©s, demandÃ©s, accordÃ©s, conventionnÃ©s et versÃ©s", "Ne jamais confondre piste de financement et ressource acquise"],
        ["Impact", "Indicateurs, sources, limites et preuves disponibles", "Publier des rÃ©sultats vÃ©rifiables"],
      ]),
      timeline("Feuille de route sobre", [
        ["1", "Structurer", "Documents, statuts, conventions, critÃ¨res de sÃ©lection."],
        ["2", "ExpÃ©rimenter", "Territoire pilote, premiers diagnostics, premiers contacts."],
        ["3", "Formaliser", "Partenariats, financements, projets validÃ©s."],
        ["4", "DÃ©ployer", "Antennes locales et observatoire national lorsque la mÃ©thode est Ã©prouvÃ©e."],
      ]),
      faqSection([
        ["Pourquoi regrouper les Ã©lÃ©ments prudents sur cette page ?", "Pour Ã©viter de rÃ©pÃ©ter partout le mÃªme message et permettre aux autres pages d'aller directement au sujet."],
        ["TVF peut-elle publier des objectifs chiffrÃ©s ?", "Oui, si la page prÃ©cise clairement qu'il s'agit d'objectifs, d'hypothÃ¨ses ou d'estimations, et non de rÃ©sultats rÃ©alisÃ©s."],
        ["Quand les rÃ©sultats seront-ils publiÃ©s ?", "Lorsqu'un projet aura Ã©tÃ© instruit, conventionnÃ©, rÃ©alisÃ© puis documentÃ© avec une mÃ©thode de preuve cohÃ©rente."],
      ]),
    ],
  },
  {
    file: "mentions-legales.html",
    title: "Mentions lÃ©gales",
    meta:
      "Mentions lÃ©gales de Territoires Vivants France : Ã©diteur, contact, siÃ¨ge, donnÃ©es personnelles, propriÃ©tÃ© intellectuelle et responsabilitÃ©s.",
    heroImage: "assets/photos/batiment-rural-france.jpg",
    eyebrow: "Cadre lÃ©gal",
    h1: "Mentions lÃ©gales.",
    intro:
      "Cette page centralise les informations publiques de rÃ©fÃ©rence et prÃ©voit les champs administratifs Ã  actualiser Ã  chaque Ã©volution officielle de l'association.",
    ctas: [["Contact", "contact.html"], ["Transparence", "transparence.html"]],
    sections: [
      sectionIntro(
        "Un cadre lÃ©gal Ã©volutif et vÃ©rifiable",
        "Les mentions lÃ©gales doivent rester simples, exactes et faciles Ã  mettre Ã  jour. Cette page distingue les informations dÃ©jÃ  connues, les Ã©lÃ©ments administratifs qui seront ajoutÃ©s aprÃ¨s formalisation et les rÃ¨gles de prudence applicables au site.",
        [
          ["IdentitÃ©", "Nom, adresse, responsables identifiÃ©s et objet de prÃ©sentation."],
          ["ConformitÃ©", "DonnÃ©es personnelles, propriÃ©tÃ© intellectuelle, responsabilitÃ© Ã©ditoriale."],
          ["Ã‰volution", "Rubriques prÃ©vues pour intÃ©grer les rÃ©fÃ©rences officielles aprÃ¨s formalisation."],
        ]
      ),
      tableSection("Informations Ã  tenir Ã  jour", "Ce cadre de lecture permet de vÃ©rifier rapidement les mentions Ã  complÃ©ter lorsque l'association Ã©volue.", [
        ["Information", "Statut actuel", "Action Ã  prÃ©voir"],
        ["Adresse du siÃ¨ge", "25 rue Ã‰lise Gervais, 42000 Saint-Ã‰tienne", "Maintenir Ã  jour en cas de changement"],
        ["Responsables", "PrÃ©sident fondateur, secrÃ©taire et trÃ©sorier identifiÃ©s", "Actualiser aprÃ¨s toute dÃ©cision statutaire"],
        ["NumÃ©ro RNA", `${official.rna}`, `${official.receiptLabel}, dÃ©livrÃ© Ã  ${official.receiptPlace} le ${official.receiptDate}`],
        ["NumÃ©ro SIREN", `${official.siren}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Contact officiel", `${contact.email} - ${contact.phone}`, "Maintenir Ã  jour les canaux publics de contact"],
        ["HÃ©bergement", "Vercel Inc. - https://vercel.com", "Site hÃ©bergÃ© et dÃ©ployÃ© via Vercel ; coordonnÃ©es complÃ¨tes Ã  vÃ©rifier depuis le compte contractuel"],
        ["Prestataires techniques", "Vercel, Supabase, Brevo et GitHub selon les services activÃ©s", "Maintenir Ã  jour les services rÃ©ellement utilisÃ©s pour l'hÃ©bergement, les formulaires, les notifications et le dÃ©ploiement"],
      ]),
      tableSection("ProcÃ©dure de mise Ã  jour lÃ©gale", "Les mentions lÃ©gales doivent Ãªtre actualisÃ©es dÃ¨s qu'une information officielle change.", [
        ["DÃ©clencheur", "VÃ©rification Ã  faire", "PiÃ¨ce attendue"],
        ["DÃ©claration officielle", `RNA ${official.rna} - dÃ©claration du ${official.declarationDate}`, `${official.receiptLabel}`],
        ["Attribution SIREN", `${official.siren} - SIRET du siÃ¨ge ${official.siret}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Changement d'adresse", "Mettre Ã  jour siÃ¨ge, contact et supports publics", "DÃ©cision interne ou document administratif"],
        ["Ã‰volution des responsables", "Actualiser les noms, fonctions et responsabilitÃ©s affichÃ©es", "ProcÃ¨s-verbal ou dÃ©cision statutaire"],
        ["Changement d'hÃ©bergement", "Mettre Ã  jour l'identitÃ© de l'hÃ©bergeur et les informations obligatoires", "Contrat, facture ou fiche hÃ©bergeur"],
        ["Activation d'un nouveau prestataire", "Mettre Ã  jour les mentions lÃ©gales et la politique de confidentialitÃ©", "Contrat, documentation RGPD, finalitÃ© et lieu de traitement"],
      ]),
      tableSection("Informations issues des statuts", "Les statuts signÃ©s le 22 juin 2026 complÃ¨tent les informations administratives issues du rÃ©cÃ©pissÃ©.", [
        ["Information", "Contenu statutaire", "Publication"],
        ["DÃ©nomination", "TERRITOIRES VIVANTS FRANCE", "PubliÃ©e"],
        ["Sigle", "TVF", "PubliÃ©"],
        ["SiÃ¨ge social", "25 rue Ã‰lise Gervais, 42000 Saint-Ã‰tienne", "PubliÃ©"],
        ["DurÃ©e", "IndÃ©terminÃ©e", "PubliÃ©e"],
        ["Membres fondateurs", "Edryan Rangoly et Jordan Lambeau", "PubliÃ©s"],
        ["Exercice social", "DurÃ©e d'un an", "SynthÃ¨se publique"],
      ]),
      legalSection(),
      faqSection([
        ["Pourquoi certaines informations restent-elles Ã  complÃ©ter ?", `TVF dispose dÃ©sormais du RNA ${official.rna}, du SIREN ${official.siren} et du SIRET du siÃ¨ge ${official.siret}. Seuls les Ã©lÃ©ments Ã©volutifs, comme les coordonnÃ©es contractuelles complÃ¨tes de lâ€™hÃ©bergeur, une modification statutaire ou une Ã©volution de gouvernance, doivent Ãªtre complÃ©tÃ©s aprÃ¨s preuve officielle.`],
        ["Les documents du site ont-ils une valeur juridique automatique ?", "Non. Ils servent de bases de travail et doivent Ãªtre adaptÃ©s, relus et validÃ©s avant toute signature ou engagement."],
        ["Qui contacter en cas de demande relative aux donnÃ©es personnelles ?", `Les demandes peuvent Ãªtre adressÃ©es Ã  ${contact.email} ou prÃ©parÃ©es depuis la page contact. TVF devra ensuite traiter chaque demande selon le RGPD et les finalitÃ©s rÃ©ellement concernÃ©es.`],
      ]),
    ],
  },


  {
    file: "politique-confidentialite.html",
    title: "Politique de confidentialitÃ©",
    meta:
      "Politique de confidentialitÃ© de Territoires Vivants France : donnÃ©es collectÃ©es, finalitÃ©s, bases lÃ©gales, durÃ©es de conservation, droits et contact RGPD.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "DonnÃ©es personnelles",
    h1: "Une politique de confidentialitÃ© claire et Ã©volutive.",
    intro:
      "Territoires Vivants France limite la collecte aux informations nÃ©cessaires pour rÃ©pondre aux demandes, instruire les propositions et prÃ©parer les coopÃ©rations territoriales. Cette page prÃ©cise le cadre actuel du site et les informations Ã  complÃ©ter si de nouveaux services numÃ©riques sont activÃ©s.",
    ctas: [["Exercer vos droits", "contact.html"], ["Mentions lÃ©gales", "mentions-legales.html"]],
    sections: [
      sectionIntro(
        "Un cadre RGPD proportionnÃ© au fonctionnement actuel",
        "Le site public prÃ©sente TVF, ses parcours et ses documents. Les formulaires de contact et d'engagement peuvent dÃ©sormais transmettre une demande Ã  TVF via une fonction sÃ©curisÃ©e du site, puis l'enregistrer dans l'outil Supabase configurÃ© cÃ´tÃ© Vercel. Ils ne doivent pas Ãªtre confondus avec une plateforme de compte utilisateur ou une base opÃ©rationnelle publique.",
        [
          ["Minimisation", "Ne demander que les informations utiles au traitement de la demande."],
          ["Transparence", "Expliquer pourquoi les donnÃ©es sont collectÃ©es, qui y accÃ¨de et pendant combien de temps."],
          ["TraÃ§abilitÃ©", "Tenir un registre interne des demandes, dÃ©cisions et accÃ¨s autorisÃ©s."],
        ]
      ),
      tableSection("Responsable du traitement", "Ces informations permettent d'identifier clairement l'organisme Ã  contacter pour toute question liÃ©e aux donnÃ©es personnelles.", [
        ["Ã‰lÃ©ment", "Information"],
        ["Organisme", "Territoires Vivants France"],
        ["Statut", official.status],
        ["RNA", official.rna],
        ["SiÃ¨ge", contact.address],
        ["Contact RGPD", `${contact.email} - ${contact.phone}`],
      ]),
      tableSection("DonnÃ©es traitÃ©es selon les situations", "TVF doit conserver une logique de sobriÃ©tÃ© : aucune information sensible ne doit Ãªtre demandÃ©e si elle n'est pas nÃ©cessaire au dossier.", [
        ["Situation", "DonnÃ©es possibles", "UtilitÃ©"],
        ["Demande de contact", "Nom, prÃ©nom, organisation, e-mail, tÃ©lÃ©phone, commune, message", "RÃ©pondre, orienter la demande et proposer un rendez-vous"],
        ["Signalement ou proposition de bien", "Adresse ou commune, description, type de bien, informations transmises volontairement", "Qualifier le sujet, vÃ©rifier le pÃ©rimÃ¨tre et prÃ©parer une Ã©ventuelle instruction"],
        ["Proposition de matÃ©riaux", "Type de ressource, quantitÃ©, localisation, Ã©tat, coordonnÃ©es du contributeur", "Ã‰valuer l'intÃ©rÃªt, la faisabilitÃ© logistique et l'affectation possible"],
        ["BÃ©nÃ©volat ou partenariat", "Profil, compÃ©tences, disponibilitÃ©, structure, territoire", "Identifier une mission, un interlocuteur ou une coopÃ©ration pertinente"],
        ["Navigation du site", "DonnÃ©es techniques Ã©ventuellement traitÃ©es par l'hÃ©bergeur", "SÃ©curitÃ©, disponibilitÃ© et fonctionnement technique du site"],
      ]),
      tableSection("FinalitÃ©s et bases lÃ©gales", "Chaque traitement doit avoir une finalitÃ© prÃ©cise et une base juridique adaptÃ©e. Les bases ci-dessous doivent Ãªtre confirmÃ©es dans le registre interne selon les usages rÃ©els.", [
        ["FinalitÃ©", "Base lÃ©gale envisagÃ©e", "Exemple"],
        ["RÃ©pondre aux demandes", "IntÃ©rÃªt lÃ©gitime de l'association", "RÃ©ponse Ã  un message, orientation vers le bon parcours"],
        ["PrÃ©parer une coopÃ©ration", "Mesures prÃ©contractuelles ou intÃ©rÃªt lÃ©gitime", "Ã‰tude d'une proposition de bien, de matÃ©riaux ou de partenariat"],
        ["GÃ©rer l'adhÃ©sion ou la vie associative", "Contrat, obligation lÃ©gale ou statutaire selon le cas", "Suivi des membres, justificatifs administratifs"],
        ["SÃ©curiser le site", "IntÃ©rÃªt lÃ©gitime", "Logs techniques, prÃ©vention des abus"],
        ["Envoyer une newsletter", "Consentement", "Uniquement si un module d'inscription est activÃ©"],
      ]),
      tableSection("Stockage et destinataires", "Les destinataires doivent rester limitÃ©s aux personnes et prestataires nÃ©cessaires au traitement.", [
        ["Lieu ou outil", "DonnÃ©es concernÃ©es", "AccÃ¨s"],
        ["Navigateur de l'utilisateur", "Brouillons ou informations prÃ©parÃ©es localement si le parcours le prÃ©voit", "Utilisateur uniquement, jusqu'Ã  effacement local"],
        ["Messagerie TVF", "Demandes envoyÃ©es par e-mail", "Personnes habilitÃ©es Ã  traiter les demandes"],
        ["HÃ©bergement Vercel", "DonnÃ©es techniques liÃ©es au fonctionnement du site", "Prestataire d'hÃ©bergement et de dÃ©ploiement"],
        ["Base Supabase des demandes", "Demandes envoyÃ©es depuis les formulaires publics lorsque l'utilisateur valide l'envoi", "Personnes habilitÃ©es TVF et prestataires techniques nÃ©cessaires au traitement"],
        ["Fournisseur e-mail transactionnel", "Adresse e-mail et contenu nÃ©cessaire Ã  la notification interne ou Ã  l'accusÃ© de rÃ©ception", "Prestataire d'envoi configurÃ© cÃ´tÃ© Vercel, uniquement si le service est activÃ©"],
      ]),
      tableSection("DurÃ©es de conservation indicatives", "Ces durÃ©es servent de cadre de dÃ©part. Elles devront Ãªtre validÃ©es dans le registre RGPD interne et adaptÃ©es aux obligations applicables.", [
        ["CatÃ©gorie", "DurÃ©e recommandÃ©e", "Point de vigilance"],
        ["Demande de contact sans suite", "Jusqu'Ã  3 ans aprÃ¨s le dernier Ã©change", "Supprimer ou anonymiser si la demande n'a plus d'utilitÃ©"],
        ["Dossier en cours", "DurÃ©e d'instruction puis archivage proportionnÃ©", "Conserver les preuves utiles sans excÃ¨s"],
        ["AdhÃ©sion, comptabilitÃ©, piÃ¨ces administratives", "Selon les obligations lÃ©gales et statutaires", "SÃ©parer les archives administratives des demandes ordinaires"],
        ["Newsletter future", "Jusqu'au retrait du consentement", "PrÃ©voir un lien de dÃ©sinscription"],
        ["Brouillon local", "Jusqu'Ã  suppression par l'utilisateur", "Informer que l'utilisateur garde la maÃ®trise de son navigateur"],
      ]),
      textBlock(
        "Vos droits",
        "Toute personne concernÃ©e peut demander l'accÃ¨s Ã  ses donnÃ©es, leur rectification, leur effacement, la limitation du traitement, l'opposition au traitement ou, lorsque cela s'applique, la portabilitÃ©. Une personne peut Ã©galement retirer son consentement lorsqu'un traitement repose sur le consentement. Les demandes peuvent Ãªtre adressÃ©es Ã  TVF par e-mail ou depuis la page contact. En cas de difficultÃ© persistante, une rÃ©clamation peut Ãªtre introduite auprÃ¨s de la CNIL.",
        [["Contacter TVF", "contact.html"], ["CNIL", "https://www.cnil.fr/fr/agir"]]
      ),
      tableSection("Cookies et traceurs", "Le site doit rester sobre tant qu'aucun outil de mesure d'audience ou de publicitÃ© n'est nÃ©cessaire.", [
        ["Traceur", "Statut", "Action Ã  prÃ©voir"],
        ["Cookies strictement nÃ©cessaires", "Possibles si requis par le fonctionnement du site", "Informer simplement"],
        ["Mesure d'audience", "Ã€ activer seulement si nÃ©cessaire", "VÃ©rifier l'exemption ou demander le consentement selon l'outil"],
        ["PublicitÃ©, pixels sociaux, remarketing", "Non prÃ©vus dans la version actuelle", "BanniÃ¨re de consentement obligatoire avant activation"],
      ]),
      faqSection([
        ["Les formulaires enregistrent-ils automatiquement une demande ?", "Oui, lorsque l'utilisateur clique sur le bouton d'envoi, la demande est transmise Ã  l'API sÃ©curisÃ©e du site puis enregistrÃ©e dans la table de contact Supabase configurÃ©e cÃ´tÃ© Vercel. Les boutons de prÃ©paration, copie, tÃ©lÃ©chargement et e-mail restent des outils locaux ou de secours."],
        ["Supabase est-il utilisÃ© pour publier des donnÃ©es publiques ?", "Non. Supabase sert uniquement Ã  enregistrer les demandes entrantes lorsque les variables Vercel sont configurÃ©es. Les informations transmises ne sont pas publiÃ©es automatiquement et restent destinÃ©es au traitement interne de TVF."],
        ["Un e-mail de confirmation peut-il Ãªtre envoyÃ© ?", "Oui, si un fournisseur d'e-mail transactionnel est configurÃ© cÃ´tÃ© Vercel et si l'utilisateur renseigne son adresse e-mail. Cet accusÃ© de rÃ©ception ne remplace pas l'instruction du dossier."],
        ["Comment demander la suppression d'une information ?", `Il suffit d'Ã©crire Ã  ${contact.email} en prÃ©cisant la demande concernÃ©e et les informations permettant de retrouver le dossier.`],
        ["TVF peut-elle publier un signalement reÃ§u ?", "Pas sans qualification, anonymisation lorsque nÃ©cessaire et vÃ©rification des droits. Un bien privÃ© ne doit pas Ãªtre exposÃ© publiquement sans cadre adaptÃ©."],
      ]),
    ],
  },
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "section";
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sectionAttrs(label, id = slugify(label)) {
  return `id="${id}" data-page-section data-page-label="${escapeAttr(label)}"`;
}

function pageMiniNav(page) {
  const anchors = [];
  for (const section of page.sections) {
    const match = section.match(/id="([^"]+)" data-page-section data-page-label="([^"]+)"/);
    if (match) anchors.push([match[2], match[1]]);
  }

  if (anchors.length < 3) return "";

  return `<nav class="page-nav" aria-label="Dans cette page"><div class="container page-nav-inner"><span>Dans cette page</span>${anchors
    .slice(0, 6)
    .map(([label, id]) => `<a href="#${id}" aria-label="Aller Ã  la section : ${escapeAttr(label)}">${label}</a>`)
    .join("")}</div></nav>`;
}

function journeySection(page) {
  const skipJourney = new Set(["contact.html", "mentions-legales.html", "politique-confidentialite.html", "kit-media.html"]);
  if (skipJourney.has(page.file)) return "";
  const links = {
    "index.html": [
      ["Comprendre l'association", "qui-sommes-nous.html", "Lire le rÃ´le de TVF, son cadre et sa logique d'action."],
      ["Choisir un parcours", "agir-avec-nous.html", "Trouver l'entrÃ©e adaptÃ©e : collectivitÃ©, propriÃ©taire, entreprise ou citoyen."],
      ["Voir le territoire pilote", "saint-etienne.html", "Comprendre comment la mÃ©thode peut s'appliquer Ã  Saint-Ã‰tienne."],
    ],
    "qui-sommes-nous.html": [
      ["DÃ©couvrir la mÃ©thode", "notre-methode.html", "Passer de la mission gÃ©nÃ©rale aux Ã©tapes concrÃ¨tes d'intervention."],
      ["Lire la gouvernance", "gouvernance.html", "VÃ©rifier le cadre, la transparence et les responsabilitÃ©s."],
      ["Consulter les documents", "documents.html", "AccÃ©der aux fiches, conventions et modÃ¨les de travail."],
    ],
    "nos-actions.html": [
      ["Voir les pÃ´les", "nos-poles.html", "Relier chaque action aux pÃ´les opÃ©rationnels de TVF."],
      ["Mesurer l'impact", "impact.html", "Comprendre les indicateurs suivis et leur niveau de preuve."],
      ["Agir avec TVF", "agir-avec-nous.html", "Transformer une intention en premiÃ¨re demande qualifiÃ©e."],
    ],
    "nos-poles.html": [
      ["Approfondir les actions", "nos-actions.html", "Voir comment les pÃ´les deviennent des actions de terrain."],
      ["Lire l'observatoire", "observatoire.html", "Comprendre le rÃ´le des donnÃ©es et de la qualification territoriale."],
      ["Contacter TVF", "contact.html", "PrÃ©senter un besoin, un bien ou une coopÃ©ration possible."],
    ],
    "notre-methode.html": [
      ["PrÃ©parer un dossier", "documents.html", "Utiliser les fiches pour cadrer une demande ou une coopÃ©ration."],
      ["Voir les critÃ¨res", "gouvernance.html", "Comprendre les rÃ¨gles de dÃ©cision, de prudence et de traÃ§abilitÃ©."],
      ["Passer Ã  l'action", "agir-avec-nous.html", "Identifier le bon parcours selon votre profil."],
    ],
    "observatoire.html": [
      ["Voir Saint-Ã‰tienne", "saint-etienne.html", "Relier l'observation nationale Ã  un premier territoire pilote."],
      ["Mesurer l'impact", "impact.html", "Distinguer donnÃ©es publiques, objectifs et indicateurs vÃ©rifiÃ©s."],
      ["PrÃ©parer une source", "documents.html", "Tracer les donnÃ©es utilisÃ©es dans un diagnostic ou une carte."],
    ],
    "saint-etienne.html": [
      ["Lire l'observatoire", "observatoire.html", "Comprendre les donnÃ©es nÃ©cessaires au diagnostic territorial."],
      ["Voir les partenaires", "partenaires.html", "Identifier les coopÃ©rations possibles autour du territoire pilote."],
      ["Contacter TVF", "contact.html", "Proposer un Ã©change sur Saint-Ã‰tienne ou un autre territoire."],
    ],
    "agir-avec-nous.html": [
      ["Parcours collectivitÃ©s", "collectivites.html", "Comprendre les modalitÃ©s pour une commune, un EPCI ou une collectivitÃ©."],
      ["Parcours propriÃ©taires", "proprietaires.html", "PrÃ©parer la prÃ©sentation d'un bien vacant ou dÃ©gradÃ©."],
      ["Parcours entreprises", "entreprises.html", "Valoriser matÃ©riaux, compÃ©tences, locaux ou mÃ©cÃ©nat."],
    ],
    "collectivites.html": [
      ["Diagnostic territorial", "documents/cahier-charges-diagnostic-territorial.md", "PrÃ©parer les donnÃ©es, le pÃ©rimÃ¨tre et les livrables."],
      ["Convention territoriale", "documents/convention-cooperation-territoriale.md", "Cadrer une coopÃ©ration sans engagement prÃ©maturÃ©."],
      ["Nous contacter", "contact.html", "PrÃ©senter un territoire, un besoin ou un pÃ©rimÃ¨tre pilote."],
    ],
    "proprietaires.html": [
      ["Fiche propriÃ©taire", "documents/fiche-proprietaire.md", "Rassembler les informations essentielles sur le bien."],
      ["Bien solidaire", "documents/fiche-bien-solidaire-usage-partage.md", "Ã‰tudier un usage temporaire, solidaire ou partagÃ©."],
      ["Nous contacter", "contact.html", "PrÃ©senter le bien Ã  TVF pour une premiÃ¨re orientation."],
    ],
    "entreprises.html": [
      ["Fiche entreprise", "documents/fiche-entreprise.md", "DÃ©crire une contribution possible : matÃ©riaux, compÃ©tences, locaux ou soutien."],
      ["Bordereau matÃ©riaux", "documents/bordereau-don-materiaux.md", "Tracer les ressources avant toute affectation Ã  un projet."],
      ["Devenir partenaire", "partenaires.html", "Comprendre le cadre d'une coopÃ©ration responsable."],
    ],
    "benevoles-citoyens.html": [
      ["Agir avec nous", "agir-avec-nous.html", "Choisir le bon parcours d'engagement."],
      ["Mission bÃ©nÃ©vole", "documents/fiche-mission-benevole.md", "Cadrer une mission avant une action terrain."],
      ["Nous contacter", "contact.html", "Proposer une compÃ©tence, un signalement ou une disponibilitÃ©."],
    ],
    "financeurs-mecenes.html": [
      ["Voir l'impact", "impact.html", "Comprendre les indicateurs suivis et les limites de communication."],
      ["Demande de soutien", "documents/demande-soutien-financier.md", "PrÃ©parer une demande claire et rattachÃ©e Ã  un projet instruit."],
      ["Contacter TVF", "contact.html", "Proposer un Ã©change financeur ou mÃ©cÃ¨ne."],
    ],
    "partenaires.html": [
      ["Gouvernance", "gouvernance.html", "VÃ©rifier les rÃ¨gles d'officialisation et de transparence."],
      ["Documents", "documents.html", "AccÃ©der aux modÃ¨les de convention et fiches partenaires."],
      ["Contact", "contact.html", "PrÃ©senter une coopÃ©ration possible."],
    ],
    "documents.html": [
      ["Kit mÃ©dia", "kit-media.html", "Trouver les Ã©lÃ©ments publics et les rÃ¨gles de communication."],
      ["Gouvernance", "gouvernance.html", "Comprendre les rÃ¨gles d'usage des documents et conventions."],
      ["Contact", "contact.html", "Demander une orientation vers le bon modÃ¨le."],
    ],
    "kit-media.html": [
      ["Dossier TVF", "documents/dossier-presentation-tvf.md", "Partager une prÃ©sentation structurÃ©e de l'association."],
      ["Pitch officiel", "documents/pitch-officiel-tvf.md", "Utiliser des formulations courtes et cohÃ©rentes."],
      ["Contact presse", "contact.html", "PrÃ©parer un Ã©change mÃ©dia ou institutionnel."],
    ],
    "impact.html": [
      ["Observatoire", "observatoire.html", "Relier les indicateurs aux donnÃ©es territoriales."],
      ["Grille d'impact", "documents/grille-impact.md", "Structurer le suivi sans inventer de rÃ©sultats."],
      ["Transparence", "transparence.html", "Comprendre la diffÃ©rence entre objectifs et rÃ©sultats vÃ©rifiÃ©s."],
    ],
    "gouvernance.html": [
      ["Charte Ã©thique", "documents/charte-ethique.md", "Lire les principes de prudence, traÃ§abilitÃ© et transparence."],
      ["Transparence", "transparence.html", "Voir les informations Ã  maintenir Ã  jour."],
      ["Documents", "documents.html", "Retrouver les modÃ¨les utiles Ã  l'instruction."],
    ],
    "transparence.html": [
      ["Gouvernance", "gouvernance.html", "Comprendre les responsabilitÃ©s et le cadre de dÃ©cision."],
      ["Impact", "impact.html", "Voir comment les rÃ©sultats seront suivis."],
      ["Mentions lÃ©gales", "mentions-legales.html", "Consulter le cadre lÃ©gal prÃ©paratoire."],
    ],
    "faq.html": [
      ["Notre mÃ©thode", "notre-methode.html", "Lire les Ã©tapes complÃ¨tes de la dÃ©marche TVF."],
      ["Documents", "documents.html", "Trouver les fiches utiles aprÃ¨s une rÃ©ponse FAQ."],
      ["Contact", "contact.html", "Poser une question prÃ©cise Ã  TVF."],
    ],
    "contact.html": [
      ["Agir avec nous", "agir-avec-nous.html", "VÃ©rifier le parcours adaptÃ© avant d'Ã©crire."],
      ["Documents", "documents.html", "PrÃ©parer les piÃ¨ces utiles Ã  votre demande."],
      ["FAQ", "faq.html", "Lire les rÃ©ponses aux questions les plus frÃ©quentes."],
    ],
    "mentions-legales.html": [
      ["Transparence", "transparence.html", "Voir les informations Ã  suivre dans la durÃ©e."],
      ["Gouvernance", "gouvernance.html", "Comprendre le cadre de dÃ©cision TVF."],
      ["Contact", "contact.html", "Demander une prÃ©cision sur le site ou les documents."],
    ],
  };

  const items = links[page.file] || [
    ["Notre mÃ©thode", "notre-methode.html", "Comprendre le cadre d'intervention TVF."],
    ["Documents", "documents.html", "PrÃ©parer une demande avec les bons supports."],
    ["Contact", "contact.html", "Ã‰changer avec TVF sur une situation concrÃ¨te."],
  ];

  const copy = journeyCopyFor(page);
  const normalizedItems = items.map(([title, href, text]) => {
    if (isPrivateDocumentHref(href)) {
      return [title.startsWith("Demander") ? title : `Demander : ${title}`, "contact.html", "TVF transmettra le modÃ¨le adaptÃ© aprÃ¨s qualification du besoin."];
    }
    return [title, href, text];
  });
  const dedupedItems = [];
  const seenHrefs = new Set();
  for (const item of normalizedItems) {
    const key = hrefFor(item[1]);
    if (seenHrefs.has(key)) continue;
    seenHrefs.add(key);
    dedupedItems.push(item);
  }
  return `<section class="section journey-section"><div class="container"><div class="section-head"><p class="section-kicker">${copy.kicker}</p><h3>${copy.title}</h3><p>${copy.text}</p></div><div class="journey-grid">${dedupedItems
    .slice(0, 3)
    .map(([title, href, text]) => `<a class="journey-card" href="${hrefFor(href)}"><span class="card-icon" aria-hidden="true">${iconFor(title)}</span><strong>${title}</strong><small>${text}</small></a>`)
    .join("")}</div></div></section>`;
}

function journeyCopyFor(page) {
  const map = {
    "index.html": ["Orientation", "Comprendre TVF en trois portes", "Choisissez l'entrÃ©e la plus utile selon votre besoin : comprendre, agir ou Ã©tudier le territoire pilote."],
    "contact.html": ["AprÃ¨s contact", "PrÃ©parer une demande exploitable", "Ces liens Ã©vitent d'envoyer un message trop gÃ©nÃ©ral et aident Ã  joindre les bonnes piÃ¨ces."],
    "documents.html": ["Documents", "Passer du modÃ¨le Ã  l'action", "AprÃ¨s avoir identifiÃ© un document, vÃ©rifiez le cadre, le public concernÃ© et la prochaine dÃ©cision."],
    "saint-etienne.html": ["Pilote", "Transformer le diagnostic en dossier", "Le territoire pilote doit conduire vers des donnÃ©es, des acteurs et des documents directement exploitables."],
    "observatoire.html": ["DonnÃ©es", "Relier observation et dÃ©cision", "L'observatoire prend de la valeur lorsqu'il alimente une carte, un indicateur ou une dÃ©cision."],
    "impact.html": ["Preuve", "Lire les indicateurs avec prudence", "Chaque indicateur doit Ãªtre reliÃ© Ã  une source, un statut et une preuve avant publication."],
    "collectivites.html": ["CollectivitÃ©s", "Passer du besoin public au cadrage", "Ces ressources aident Ã  prÃ©parer un pÃ©rimÃ¨tre, une convention ou un premier diagnostic."],
    "proprietaires.html": ["PropriÃ©taires", "Passer du bien au scÃ©nario", "Ces ressources permettent de prÃ©senter un bien sans crÃ©er d'engagement prÃ©maturÃ©."],
    "entreprises.html": ["Entreprises", "Transformer une contribution en dossier", "Ces liens aident Ã  qualifier matÃ©riaux, locaux, compÃ©tences ou mÃ©cÃ©nat avant valorisation."],
    "financeurs-mecenes.html": ["Financeurs", "VÃ©rifier avant de soutenir", "Ces entrÃ©es permettent de comprendre le niveau de preuve, le budget et le reporting attendu."],
    "benevoles-citoyens.html": ["Engagement", "Choisir une mission utile", "Ces ressources aident Ã  signaler, documenter ou participer avec un cadre clair."],
  };
  const [kicker, title, text] = map[page.file] || ["Suite", "Choisir la prochaine Ã©tape", "Trois entrÃ©es ciblÃ©es pour poursuivre sans perdre le fil de votre parcours."];
  return { kicker, title, text };
}

function sectionIntro(title, text, items) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container intro-grid"><div><p class="section-kicker">Fondation</p><h2>${title}</h2><p class="section-lead">${text}</p></div><div class="mini-list">${items
    .map(([h, p]) => `<article><strong>${h}</strong><span>${p}</span></article>`)
    .join("")}</div></div></section>`;
}

function homeClaritySection() {
  return `<section class="section compact-section" ${sectionAttrs("TVF en lecture rapide")}><div class="container compact-grid"><article><p class="section-kicker">Mission</p><h2>TVF sert Ã  relier les bons acteurs autour d'un lieu inutile.</h2><p>Un logement, un commerce, une friche, un terrain ou des matÃ©riaux ne deviennent utiles que si le besoin, l'usage, les responsabilitÃ©s, les documents et le suivi sont clarifiÃ©s.</p></article><article><strong>Pour qui ?</strong><p>CollectivitÃ©s, propriÃ©taires, entreprises, associations, financeurs, bÃ©nÃ©voles et citoyens.</p><a class="text-link" href="${hrefFor("agir-avec-nous.html")}">Choisir mon parcours</a></article><article><strong>Premier geste</strong><p>DÃ©crire la situation en quelques lignes : lieu, ressource, besoin, acteurs connus et suite attendue.</p><a class="text-link" href="${hrefFor("contact.html")}">Demander un rendez-vous</a></article><article><strong>Document utile</strong><p>Commencer par le dossier TVF ou la fiche adaptÃ©e Ã  votre profil.</p><a class="text-link" href="${hrefFor("documents.html#les-documents-essentiels")}">Voir les essentiels</a></article></div></section>`;
}

function homeTrustSection() {
  return `<section class="section soft trust-section" ${sectionAttrs("Ce qui rend TVF prÃ©sentable Ã  une institution")}><div class="container"><div class="section-head"><p class="section-kicker">CrÃ©dibilitÃ©</p><h2>Ce qui rend TVF prÃ©sentable Ã  une institution.</h2><p>Avant de promettre un rÃ©sultat, TVF prÃ©pare un cadre lisible : donnÃ©es sourcÃ©es, responsabilitÃ©s Ã©crites, preuves d'action et indicateurs vÃ©rifiables.</p></div><div class="trust-grid"><article><span class="card-icon" aria-hidden="true">S</span><strong>DonnÃ©es sourcÃ©es</strong><p>Chaque diagnostic doit distinguer donnÃ©es publiques, signalement, visite autorisÃ©e et dÃ©cision interne.</p></article><article><span class="card-icon" aria-hidden="true">C</span><strong>Conventions</strong><p>Les rÃ´les, usages, durÃ©es, limites, assurances, donnÃ©es et communications sont Ã©crits avant action.</p></article><article><span class="card-icon" aria-hidden="true">I</span><strong>Impact vÃ©rifiable</strong><p>Les rÃ©sultats ne sont publiÃ©s qu'aprÃ¨s preuve : registre, compte rendu, PV, photos autorisÃ©es ou indicateurs.</p></article><article><span class="card-icon" aria-hidden="true">P</span><strong>Parcours par public</strong><p>CollectivitÃ©, propriÃ©taire, entreprise, bÃ©nÃ©vole ou financeur disposent d'une entrÃ©e et d'un document adaptÃ©.</p></article></div></div></section>`;
}


function launchNeedsSection() {
  return `<section class="section launch-needs" ${sectionAttrs("Ce que TVF recherche maintenant Ã  Saint-Ã‰tienne")}><div class="container"><div class="section-head"><p class="section-kicker">Lancement terrain</p><h2>Ce que TVF recherche maintenant Ã  Saint-Ã‰tienne.</h2><p class="section-lead">Pour passer du portail au terrain, TVF doit identifier des ressources concrÃ¨tes, des interlocuteurs utiles et des contributions compatibles avec une premiÃ¨re phase pilote.</p></div><div class="need-grid"><article><span class="card-icon" aria-hidden="true">L</span><h3>Local de stockage</h3><p>Un espace sec, accessible et encadrÃ© pour qualifier, stocker temporairement et organiser des matÃ©riaux rÃ©utilisables.</p></article><article><span class="card-icon" aria-hidden="true">T</span><h3>Transport et logistique</h3><p>Des solutions ponctuelles de transport, manutention ou prÃªt de vÃ©hicule pour tester une chaÃ®ne locale de rÃ©emploi.</p></article><article><span class="card-icon" aria-hidden="true">M</span><h3>MatÃ©riaux rÃ©utilisables</h3><p>Bois, portes, fenÃªtres, mobilier, sanitaires, outils ou Ã©quipements encore utiles, Ã  qualifier avant toute affectation.</p></article><article><span class="card-icon" aria-hidden="true">B</span><h3>Biens Ã  qualifier</h3><p>Logement, commerce, local, bÃ¢timent, terrain ou friche pouvant faire l'objet d'une premiÃ¨re Ã©tude sans engagement automatique.</p></article><article><span class="card-icon" aria-hidden="true">E</span><h3>Entreprises et artisans</h3><p>Acteurs du BTP, commerces, bureaux, transporteurs ou entreprises prÃªtes Ã  Ã©tudier une contribution RSE concrÃ¨te.</p></article><article><span class="card-icon" aria-hidden="true">C</span><h3>BÃ©nÃ©voles et relais locaux</h3><p>Habitants, associations et personnes ressources capables d'aider Ã  signaler, relayer, organiser ou documenter les besoins.</p></article></div><div class="launch-actions"><a class="btn primary" href="${hrefFor("contact.html")}">PrÃ©senter une ressource</a><a class="btn secondary" href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer">Ã‰crire sur WhatsApp</a></div></div></section>`;
}


function partnerPreparationSection() {
  const groups = [
    ["pieces-collectivite", "CollectivitÃ© ou EPCI", ["territoire concernÃ© et pÃ©rimÃ¨tre envisagÃ©", "besoin public identifiÃ©", "service ou Ã©lu rÃ©fÃ©rent", "donnÃ©es disponibles", "calendrier souhaitÃ©", "objectif de la coopÃ©ration", "contraintes connues"]],
    ["pieces-entreprise", "Entreprise", ["raison sociale et contact rÃ©fÃ©rent", "type de contribution", "matÃ©riaux, locaux, compÃ©tences ou soutien proposÃ©", "quantitÃ© ou volume estimÃ©", "localisation", "disponibilitÃ©", "conditions de retrait ou d'intervention", "photos si utile"]],
    ["pieces-association", "Association", ["objet de l'association", "besoin ou projet local", "publics concernÃ©s", "lieu ou territoire visÃ©", "capacitÃ© d'animation", "ressources dÃ©jÃ  mobilisÃ©es", "contraintes d'accueil ou de sÃ©curitÃ©"]],
    ["pieces-proprietaire", "PropriÃ©taire", ["adresse ou secteur du bien", "type de bien", "Ã©tat gÃ©nÃ©ral", "photos rÃ©centes", "surface approximative", "statut d'occupation", "intention du propriÃ©taire", "contraintes juridiques ou techniques connues"]],
    ["pieces-particulier", "Particulier / citoyen", ["type de proposition", "commune concernÃ©e", "description simple", "photos si possible", "coordonnÃ©es de contact", "disponibilitÃ©s", "accord pour Ãªtre recontactÃ©", "limites Ã  respecter"]],
    ["pieces-financeur", "Financeur, mÃ©cÃ¨ne ou investisseur solidaire", ["type de soutien envisagÃ©", "montant ou enveloppe indicative si connue", "thÃ©matique prioritaire", "territoire visÃ©", "critÃ¨res de sÃ©lection", "attentes de reporting", "calendrier de dÃ©cision"]],
    ["pieces-artisan", "Artisan ou professionnel technique", ["activitÃ© et compÃ©tences", "zone d'intervention", "type d'appui possible", "rÃ©fÃ©rences ou assurances utiles", "disponibilitÃ©s", "conditions d'intervention", "contraintes de sÃ©curitÃ©"]],
    ["pieces-logistique", "Stockage, transport ou logistique", ["type de ressource proposÃ©e", "adresse ou zone", "surface ou capacitÃ©", "conditions d'accÃ¨s", "durÃ©e possible", "contraintes d'assurance", "contact rÃ©fÃ©rent", "photos ou plan si disponible"]],
  ];
  return `<section class="section soft partner-prep" ${sectionAttrs("PiÃ¨ces Ã  prÃ©parer avant Ã©tude", "pieces-a-preparer")}><div class="container"><div class="section-head"><p class="section-kicker">PrÃ©-instruction</p><h2>PiÃ¨ces Ã  prÃ©parer avant Ã©tude de la demande</h2><p class="section-lead">Ces listes ne crÃ©ent aucun engagement. Elles servent uniquement Ã  vÃ©rifier si la demande peut Ãªtre Ã©tudiÃ©e, orientÃ©e ou transformÃ©e ensuite en dossier complet.</p></div><div class="prep-grid">${groups.map(([id, title, items]) => `<article id="${id}" class="prep-card"><h3>${title}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul><a class="text-link" href="${hrefFor("contact.html")}">Transmettre ces Ã©lÃ©ments</a></article>`).join("")}</div></div></section>`;
}

function cards(title, intro, items) {
  return `<section class="section soft" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">RepÃ¨res</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><div class="card-grid">${items
    .map(([h, p, href]) => `<article class="card"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p>${p}</p>${href ? smartCardLink(h, href) : ""}</article>`)
    .join("")}</div></div></section>`;
}

function documentTools() {
  const filters = [
    ["all", "Tous"],
    ["collectivites", "CollectivitÃ©s"],
    ["proprietaires", "PropriÃ©taires"],
    ["entreprises", "Entreprises & matÃ©riaux"],
    ["financement", "Financement"],
    ["communication", "Communication"],
    ["terrain", "Terrain"],
    ["cadre", "Cadre interne"],
  ];

  return `<section class="section doc-tools" aria-labelledby="documents-filter-title"><div class="container"><div class="doc-tool-panel"><div class="doc-search"><label for="document-search" id="documents-filter-title">Trouver rapidement le bon document</label><input id="document-search" type="search" placeholder="Rechercher un document, un public, une dÃ©marche..." autocomplete="off"></div><div class="doc-filters" aria-label="Filtrer les documents">${filters
    .map(([key, label], index) => `<button class="doc-filter${index === 0 ? " is-active" : ""}" type="button" data-doc-filter="${key}" aria-pressed="${index === 0 ? "true" : "false"}">${label}</button>`)
    .join("")}</div><p class="doc-count" data-doc-count></p></div></div></section>`;
}

function documentCards(title, intro, items) {
  return `<section class="section soft document-library" ${sectionAttrs(title, "documents-library")}><div class="container"><div class="section-head"><p class="section-kicker">RepÃ¨res</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><div class="card-grid">${items
    .map(([h, p, href]) => `<article class="card" data-doc-card data-doc-category="${docCategory(h, p, href)}"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p>${p}</p>${documentCardLink(h, href)}</article>`)
    .join("")}</div><p class="doc-empty" data-doc-empty hidden>Aucun document ne correspond Ã  cette recherche. Essayez un autre mot-clÃ© ou un autre filtre.</p></div></section>`;
}

function documentArchiveSection(title, intro, items) {
  const cardsMarkup = items
    .map(([h, p, href]) => {
      const category = docCategory(h, p, href);
      return `<article class="card doc-card-compact"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><strong class="doc-card-title">${h}</strong><small class="doc-card-meta">${docCategoryLabel(category)}</small>${documentCardLink(h, href)}</article>`;
    })
    .join("");

  return `<section class="section soft document-library document-archive-section" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">Archive</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><details class="document-archive"><summary><span>Afficher l'archive complÃ¨te</span><small>ModÃ¨les avancÃ©s, registres et supports internes restent disponibles en PDF.</small></summary><p class="archive-guidance">Cette archive est volontairement secondaire. Commencez par les documents essentiels, puis ouvrez cette liste uniquement si votre dossier nÃ©cessite une piÃ¨ce spÃ©cialisÃ©e.</p><div class="card-grid">${cardsMarkup}</div></details></div></section>`;
}

function smartCardLink(title, href) {
  if (!href) return "";
  if (/^(documents\/|output\/documents\/|output\/pdf\/)/i.test(href) || /\.pdf(?:$|[#?])/i.test(href)) {
    return documentCardLink(title, href);
  }
  const label = String(href).startsWith("#pieces-") ? "Voir les piÃ¨ces Ã  prÃ©parer" : "DÃ©couvrir";
  return `<a class="text-link" href="${hrefFor(href)}" aria-label="${label} : ${escapeAttr(title)}">${label}</a>`;
}

function documentCardLink(title, href) {
  if (!href) return "";
  const label = isPrivateDocumentHref(href) ? "Demander le document" : "DÃ©couvrir";
  return `<a class="text-link" href="${hrefFor(href)}" aria-label="${label} : ${escapeAttr(title)}">${label}</a>`;
}

function docCategory(title, text, href = "") {
  const source = `${title} ${text} ${href}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/discours|pitch|script|argumentaire|objection|prospection|media|presentation|reseaux|video|courrier/.test(source)) return "communication";
  if (/signalement|securite|prevention|incident|emargement|benevole|terrain|mission/.test(source)) return "terrain";
  if (/entreprise|materiaux|materiau|bordereau|reemploi|pv-remise/.test(source)) return "entreprises";
  if (/finance|mecen|soutien|budget|devis|cofinancement|contribution|reporting|depense|prestation/.test(source)) return "financement";
  if (/collectiv|territoire|diagnostic|cartograph|source|action-territorial|comite|commune|epci/.test(source)) return "collectivites";
  if (/propriet|bien|usage|restitution|visite/.test(source)) return "proprietaires";
  return "cadre";
}

function docCategoryLabel(category) {
  const labels = {
    collectivites: "CollectivitÃ©s",
    proprietaires: "PropriÃ©taires",
    entreprises: "Entreprises & matÃ©riaux",
    financement: "Financement",
    communication: "Communication",
    terrain: "Terrain",
    cadre: "Cadre interne",
  };

  return labels[category] || "Document TVF";
}

function timeline(title, items) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">MÃ©thode</p><h2>${title}</h2></div><div class="timeline">${items
    .map(([n, h, p]) => `<article><span>${n}</span><div><h3>${h}</h3><p>${p}</p></div></article>`)
    .join("")}</div></div></section>`;
}

function tableSection(title, intro, rows) {
  const [head, ...body] = rows;
  return `<section class="section" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">Cadre</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><p class="table-scroll-hint" aria-hidden="true">Faire glisser le tableau horizontalement sur mobile.</p><div class="table-wrap"><table><caption class="sr-only">${title}</caption><thead><tr>${head.map((cell) => `<th scope="col">${cell}</th>`).join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div></div></section>`;
}

function faqSection(items) {
  return `<section class="section soft" ${sectionAttrs("Questions frÃ©quentes")}><div class="container"><div class="section-head"><p class="section-kicker">FAQ</p><h2>Questions frÃ©quentes</h2><p>Des rÃ©ponses courtes pour comprendre le cadre TVF sans jargon.</p></div><div class="faq-list">${items
    .map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`)
    .join("")}</div></div></section>`;
}

function highlight(title, text, label, href, image) {
  return `<section class="section feature" ${sectionAttrs(title)}><div class="container feature-grid"><img src="${image}" ${imageAttrs(image)} alt="Vue urbaine franÃ§aise liÃ©e Ã  la revitalisation territoriale" loading="lazy" decoding="async"><div><p class="section-kicker">Pilote</p><h2>${title}</h2><p class="section-lead">${text}</p><a class="btn primary" href="${hrefFor(href)}">${label}</a></div></div></section>`;
}

function split(title, text, image) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container split"><img src="${image}" ${imageAttrs(image)} alt="${splitAlt(title, image)}" loading="lazy" decoding="async"><div><p class="section-kicker">Approche</p><h3>${title}</h3><p class="section-lead">${text}</p></div></div></section>`;
}

function splitAlt(title, image) {
  const alts = {
    "assets/photos/materiaux-reemploi-echantillons.jpg": "Ã‰chantillons de matÃ©riaux de construction rÃ©employables : bois, briques, verre, isolants et carrelage",
    "assets/photos/materiaux-durables-reemploi.jpg": "MatÃ©riaux durables, bois, briques, isolants et ressources de rÃ©emploi pour la MatÃ©riauthÃ¨que Solidaire",
  };
  return escapeAttr(alts[image] || title);
}
function textBlock(title, text) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container narrow"><p class="section-kicker">Analyse</p><h2>${title}</h2><p class="section-lead">${text}</p></div></section>`;
}

function extLink(label, url) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function nationalDataSection(title = "Chiffres publics de contexte") {
  return tableSection(title, "Ces repÃ¨res publics donnent l'Ã©chelle des sujets traitÃ©s par TVF et aident Ã  cadrer les diagnostics territoriaux.", [
    ["Sujet", "RepÃ¨re public rÃ©cent", "Source", "UtilitÃ© pour TVF"],
    ["Logements vacants", "3,1 millions de logements vacants en France en 2023, soit plus de 8 % du parc de logements.", extLink("INSEE, relayÃ© par Banque des Territoires / Localtis, janvier 2024", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "Cibler les territoires oÃ¹ la vacance est structurelle et prÃ©parer le dialogue avec les propriÃ©taires."],
    ["DÃ©chets du bÃ¢timent", "Environ 42 millions de tonnes de dÃ©chets par an pour le secteur du bÃ¢timent ; la filiÃ¨re REP PMCB vise collecte, traÃ§abilitÃ©, recyclage, rÃ©emploi et rÃ©utilisation.", extLink("MinistÃ¨re de la Transition Ã©cologique, page PMCB mise Ã  jour en novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Relier la matÃ©riauthÃ¨que TVF Ã  une logique de projet, de traÃ§abilitÃ© et d'Ã©conomie circulaire."],
    ["Friches", "Cartofriches consolide des donnÃ©es ouvertes, des observatoires locaux et des statuts de friches Ã  l'Ã©chelle nationale.", extLink("Cerema, Cartofriches", "https://cartofriches.cerema.fr/cartofriches/"), "PrÃ©parer des cartes et diagnostics sans exposer des sites sensibles ni inventer de recensement."],
    ["Recyclage foncier", "Les politiques de recyclage foncier et de sobriÃ©tÃ© fonciÃ¨re encouragent la rÃ©utilisation de sites dÃ©jÃ  artificialisÃ©s avant l'extension urbaine.", extLink("Cerema, Cartofriches et ressources friches", "https://cartofriches.cerema.fr/cartofriches/"), "Aider Ã  formuler des dossiers compatibles avec les politiques de recyclage foncier et de sobriÃ©tÃ© fonciÃ¨re."],
  ]);
}

function associationNeedMatrixSection() {
  return tableSection("Le besoin global auquel TVF rÃ©pond", "TVF existe parce que plusieurs enjeux publics se croisent sans toujours Ãªtre traitÃ©s dans un mÃªme parcours : vacance, rÃ©emploi, friches, commerces, insertion et financement. Cette lecture reste prudente : elle s'appuie sur des repÃ¨res publics et transforme ces constats en mÃ©thode de travail, pas en promesse de rÃ©sultat.", [
    ["Besoin observÃ©", "RepÃ¨re public vÃ©rifiable", "Source", "RÃ©ponse TVF"],
    ["Logements vacants", "3,1 millions de logements vacants en France en 2023.", extLink("INSEE, relayÃ© par Banque des Territoires / Localtis, janvier 2024", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "RepÃ©rer les biens, qualifier les blocages, dialoguer avec les propriÃ©taires et prÃ©parer des usages rÃ©alistes."],
    ["DÃ©chets et matÃ©riaux du bÃ¢timent", "Environ 42 millions de tonnes de dÃ©chets par an pour le bÃ¢timent ; la filiÃ¨re REP PMCB vise collecte, traÃ§abilitÃ©, rÃ©emploi et recyclage.", extLink("MinistÃ¨re de la Transition Ã©cologique, PMCB, mise Ã  jour novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Transformer des ressources inutilisÃ©es en apports affectÃ©s Ã  des projets validÃ©s, avec critÃ¨res d'acceptation et traÃ§abilitÃ©."],
    ["Friches et foncier dÃ©jÃ  artificialisÃ©", "Cartofriches consolide des donnÃ©es ouvertes et observatoires locaux sur les friches.", extLink("Cerema, Cartofriches", "https://cartofriches.cerema.fr/cartofriches/"), "Aider Ã  passer d'une localisation Ã  une note d'opportunitÃ© : propriÃ©tÃ©, risques, accÃ¨s, usages temporaires ou reconversion."],
    ["Commerces et rez-de-chaussÃ©e", "Les bases locales d'Ã©quipements et les diagnostics de centre-ville permettent d'objectiver l'offre existante avant d'imaginer un nouvel usage.", extLink("INSEE, Base permanente des Ã©quipements", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Ã‰tudier les besoins de rue et Ã©viter les commerces hors-sol : activitÃ© utile, porteur, convention, modÃ¨le Ã©conomique et calendrier."],
    ["Insertion et engagement citoyen", "Les indicateurs d'emploi, de pauvretÃ© et de formation doivent guider les projets qui mobilisent habitants, bÃ©nÃ©voles ou publics en parcours.", extLink("INSEE, dossiers communaux et intercommunaux", "https://www.insee.fr/fr/statistiques/2011101?geo=EPCI-244200770"), "CrÃ©er des missions encadrÃ©es, limitÃ©es, utiles et documentÃ©es, sans confondre bÃ©nÃ©volat, chantier d'insertion et prestation professionnelle."],
  ]);
}

function associationProofSection() {
  return tableSection("Ce qui rend l'association crÃ©dible avant les premiers projets", "La crÃ©dibilitÃ© de TVF ne repose pas sur des annonces, mais sur des preuves de mÃ©thode. Chaque demande doit pouvoir Ãªtre comprise, tracÃ©e, dÃ©cidÃ©e et suivie.", [
    ["Exigence", "Pourquoi c'est important", "Document ou preuve attendue"],
    ["NumÃ©roter les dossiers", "Permettre le suivi d'une demande sans perte d'information entre les interlocuteurs.", "Fiche de contact, fiche projet, registre de dÃ©cision."],
    ["Distinguer objectif, instruction et rÃ©sultat", "Ã‰viter de prÃ©senter une intention comme une rÃ©alisation.", "Statut du dossier : reÃ§u, qualifiÃ©, en instruction, conventionnÃ©, rÃ©alisÃ©, clÃ´turÃ©."],
    ["Sourcer les chiffres", "Rendre les constats vÃ©rifiables pour une collectivitÃ©, un financeur ou un journaliste.", "Lien INSEE, Cerema, ministÃ¨re, collectivitÃ© ou source publique datÃ©e."],
    ["Encadrer les conventions", "ProtÃ©ger propriÃ©taires, collectivitÃ©s, entreprises, bÃ©nÃ©voles et bÃ©nÃ©ficiaires.", "Convention de coopÃ©ration, autorisation de visite, bordereau matÃ©riaux, note de risques."],
    ["Mesurer l'impact aprÃ¨s action", "Ne publier que des rÃ©sultats Ã©tablis, vÃ©rifiables et utiles au territoire.", "Tableau d'indicateurs, preuves photos autorisÃ©es, compte rendu, bilan."],
  ]);
}
function saintEtienneDataSection() {
  return tableSection("DonnÃ©es publiques de cadrage - Saint-Ã‰tienne", "Ces repÃ¨res publics donnent un socle vÃ©rifiable au territoire pilote. Ils ne constituent pas des rÃ©sultats TVF : ils servent Ã  comprendre les besoins, prioriser les dossiers et prÃ©parer les Ã©changes avec les acteurs locaux.", [
    ["Indicateur", "DonnÃ©e publique", "Source", "Lecture TVF"],
    ["Population communale", "172 569 habitants en 2022.", extLink("INSEE, dossier complet Commune de Saint-Ã‰tienne, RP2022, paru le 03/07/2026", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Un territoire urbain suffisamment dense pour tester une mÃ©thode de coopÃ©ration reproductible."],
    ["Parc de logements", "101 006 logements en 2022, dont 86 292 rÃ©sidences principales.", extLink("INSEE, LOG T1, Commune de Saint-Ã‰tienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "La mÃ©thode Habitat Vivant peut partir d'un cadrage chiffrÃ© avant tout contact propriÃ©taire."],
    ["Logements vacants", "12 313 logements vacants en 2022, soit 12,2 % du parc communal.", extLink("INSEE, LOG T2, Commune de Saint-Ã‰tienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Un besoin direct de qualification : vacance courte, vacance structurelle, Ã©tat, propriÃ©taire, usage possible."],
    ["Typologie du parc", "86,5 % d'appartements et 10,8 % de maisons en 2022.", extLink("INSEE, LOG T2, Commune de Saint-Ã‰tienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Les scÃ©narios doivent tenir compte d'un parc majoritairement collectif : copropriÃ©tÃ©, accÃ¨s, parties communes, coÃ»ts et sÃ©curitÃ©."],
    ["Contexte emploi mÃ©tropolitain", "Saint-Ã‰tienne MÃ©tropole affiche un taux de chÃ´mage de 14,4 % des 15-64 ans en 2022 ; 24,5 % chez les 15-24 ans.", extLink("INSEE, dossier complet Saint-Ã‰tienne MÃ©tropole, EMP T4, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=EPCI-244200770"), "Justifie de relier certains projets Ã  des parcours d'insertion, de formation, de bÃ©nÃ©volat encadrÃ© et de dÃ©couverte mÃ©tiers."],
    ["Ã‰quipements et commerces", "La Base permanente des Ã©quipements 2024 recense notamment 145 boulangeries-pÃ¢tisseries, 121 Ã©piceries ou supÃ©rettes, 230 coiffeurs et 53 pharmacies.", extLink("INSEE, BPE 2024, Commune de Saint-Ã‰tienne", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Les idÃ©es de commerces doivent Ãªtre Ã©tudiÃ©es par quartier : complÃ©ter l'offre, Ã©viter les doublons et tester les besoins rÃ©els."],
    ["MatÃ©riaux du bÃ¢timent", "Ã€ l'Ã©chelle nationale, le bÃ¢timent gÃ©nÃ¨re environ 42 millions de tonnes de dÃ©chets par an.", extLink("MinistÃ¨re de la Transition Ã©cologique, PMCB, mise Ã  jour novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Le pilote peut tester une chaÃ®ne locale : repÃ©rage, tri, acceptation, stockage, affectation et preuve de rÃ©emploi."],
  ]);
}

function saintEtienneUsefulnessSection() {
  return tableSection("Pourquoi le programme est utile Ã  Saint-Ã‰tienne", "Le pilote TVF doit transformer les constats publics en dossiers de terrain. L'utilitÃ© se mesure par la qualitÃ© des situations qualifiÃ©es, des acteurs rÃ©unis et des dÃ©cisions rendues possibles.", [
    ["Constat local", "Besoin opÃ©rationnel", "Ce que TVF peut apporter", "Sortie concrÃ¨te"],
    ["Un volume significatif de logements vacants", "Comprendre quels biens peuvent rÃ©ellement Ãªtre remis en usage.", "Fiche propriÃ©taire, prÃ©diagnostic, scÃ©narios d'usage et orientation vers les bons dispositifs.", "Liste de dossiers qualifiÃ©s, non publiÃ©e sans accord."],
    ["Des rez-de-chaussÃ©e commerciaux Ã  rÃ©activer", "Ã‰viter les vitrines vides et tester des usages adaptÃ©s aux rues concernÃ©es.", "Analyse du local, besoin de quartier, porteurs possibles, usage temporaire ou pÃ©renne.", "Note commerce et scÃ©nario de rÃ©activation."],
    ["Des matÃ©riaux potentiellement rÃ©cupÃ©rables", "Limiter le gaspillage et rÃ©duire certains coÃ»ts de projets locaux.", "Bordereau matÃ©riaux, critÃ¨res d'acceptation, stockage possible, affectation Ã  un projet validÃ©.", "Registre de rÃ©emploi et preuve d'affectation."],
    ["Des besoins sociaux et d'emploi", "CrÃ©er des missions utiles sans improviser les responsabilitÃ©s.", "Fiche mission, partenaires d'insertion Ã  solliciter, cadre sÃ©curitÃ©, compte rendu.", "Chantier participatif ou mission encadrÃ©e."],
    ["Des acteurs nombreux", "Mettre autour de la table propriÃ©taires, collectivitÃ©s, entreprises, associations et citoyens.", "RÃ©union de cadrage, matrice dÃ©cisionnelle, documents communs.", "Dossier prÃªt Ã  prÃ©senter."],
  ]);
}

function saintEtienneProjectExamplesSection() {
  return tableSection("Exemples de projets faisables Ã  instruire", "Ces exemples sont des pistes rÃ©alistes Ã  Ã©tudier. Ils ne sont pas annoncÃ©s comme des projets TVF rÃ©alisÃ©s : chaque cas devra Ãªtre vÃ©rifiÃ©, autorisÃ©, chiffrÃ© et conventionnÃ©.", [
    ["Situation possible", "Usage Ã  Ã©tudier", "Pourquoi c'est pertinent", "Conditions Ã  verrouiller"],
    ["Appartement vacant dans un immeuble collectif", "Logement temporaire, logement Ã©tudiant, logement solidaire ou habitat intergÃ©nÃ©rationnel.", "Le parc stÃ©phanois est majoritairement collectif ; certains biens peuvent redevenir utiles si l'Ã©tat, la copropriÃ©tÃ© et le propriÃ©taire le permettent.", "Autorisation propriÃ©taire, Ã©tat technique, coÃ»t, assurances, convention d'usage, gestion locative ou associative."],
    ["Cellule commerciale fermÃ©e en centre-ville", "Atelier de rÃ©paration, boutique de rÃ©emploi, commerce de proximitÃ©, local associatif ou occupation temporaire.", "Un rez-de-chaussÃ©e actif amÃ©liore la rue, la sÃ©curitÃ© perÃ§ue et l'accÃ¨s aux services.", "Bail ou convention, accessibilitÃ©, modÃ¨le Ã©conomique, horaires, porteur, sÃ©curitÃ© du local."],
    ["Local ou bÃ¢timent inutilisÃ©", "Maison des associations, atelier partagÃ©, espace de formation, stockage de proximitÃ© ou tiers-lieu sobre.", "Les associations et porteurs locaux ont souvent besoin de lieux accessibles, modestes et bien encadrÃ©s.", "PropriÃ©tÃ©, accÃ¨s, normes, gouvernance du lieu, charges, responsabilitÃ©, calendrier."],
    ["Terrain dÃ©laissÃ© ou friche lÃ©gÃ¨re", "Jardin partagÃ©, verger citoyen, espace pÃ©dagogique, zone de biodiversitÃ© ou usage transitoire.", "Un espace non utilisÃ© peut devenir un support de lien social et de transition Ã©cologique.", "Statut foncier, pollution Ã©ventuelle, eau, clÃ´ture, entretien, assurance, convention temporaire."],
    ["Lots de matÃ©riaux disponibles", "RÃ©habilitation d'un local associatif, amÃ©nagement d'un atelier, mobilier de rÃ©emploi, chantier pÃ©dagogique.", "Le rÃ©emploi devient crÃ©dible lorsqu'un matÃ©riau est affectÃ© Ã  un besoin prÃ©cis et tracÃ©.", "Ã‰tat, quantitÃ©, stockage, transport, refus des matÃ©riaux Ã  risque, preuve d'utilisation."],
    ["Immeuble dÃ©gradÃ© avec propriÃ©taire volontaire", "Bien Solidaire Ã  Usage PartagÃ© : rÃ©novation contre usage temporaire encadrÃ©.", "Le propriÃ©taire conserve son bien, le territoire gagne un usage, TVF coordonne une convention adaptÃ©e.", "Ã‰tude juridique, budget, durÃ©e, rÃ©partition des charges, gouvernance, fin de convention."],
  ]);
}

function saintEtienneCommerceIdeasSection() {
  return tableSection("IdÃ©es de commerces et services Ã  Ã©tudier par quartier", "Ces pistes doivent Ãªtre confirmÃ©es par diagnostic de rue, Ã©changes avec les acteurs Ã©conomiques et analyse de viabilitÃ©. Elles servent Ã  orienter la rÃ©flexion, pas Ã  imposer un modÃ¨le unique.", [
    ["Besoin Ã  vÃ©rifier", "ActivitÃ© possible", "IntÃ©rÃªt territorial", "Vigilance"],
    ["RÃ©emploi et rÃ©paration", "Atelier vÃ©lo, rÃ©paration Ã©lectromÃ©nager, boutique de seconde main, dÃ©pÃ´t-atelier matÃ©riaux.", "RÃ©duit les dÃ©chets, crÃ©e des services de proximitÃ© et peut accueillir des missions bÃ©nÃ©voles ou formatives.", "Ne pas concurrencer inutilement l'existant ; cadrer sÃ©curitÃ©, garanties et responsabilitÃ©s."],
    ["Alimentation de proximitÃ©", "Ã‰picerie de quartier, produits locaux, vrac, panier solidaire ou commerce hybride.", "Renforce la vie de rue et peut rÃ©pondre Ã  des besoins d'accÃ¨s quotidien.", "Ã‰tudier flux, concurrence, prix, logistique, fournisseurs et modÃ¨le Ã©conomique."],
    ["Artisanat et savoir-faire", "Atelier partagÃ©, rÃ©paration textile, menuiserie lÃ©gÃ¨re, upcycling, petite fabrication locale.", "Relie Ã©conomie locale, formation, insertion et rÃ©emploi de matÃ©riaux.", "VÃ©rifier nuisances, normes, assurances, stockage et capacitÃ© d'encadrement."],
    ["Services aux habitants", "Conciergerie de quartier, aide administrative, permanence associative, espace numÃ©rique accompagnÃ©.", "Un local vacant peut devenir un service utile si le besoin est confirmÃ© par les habitants.", "DÃ©finir public cible, horaires, confidentialitÃ©, partenaires et financement de fonctionnement."],
    ["Jeunes, Ã©tudiants et actifs", "CafÃ© associatif, coworking de proximitÃ©, espace projet, lieu d'information logement ou emploi.", "Saint-Ã‰tienne dispose d'un tissu universitaire et de jeunes actifs ; certains quartiers peuvent bÃ©nÃ©ficier de lieux souples.", "Tester la demande, Ã©viter le lieu vitrine sans usage rÃ©el, prÃ©voir animation et gouvernance."],
    ["Culture et lien social", "Micro-galerie, scÃ¨ne ouverte, atelier artistique, ressourcerie culturelle, lieu d'exposition temporaire.", "RÃ©active les vitrines et rend visible la transformation d'un local.", "Convention courte, rÃ¨gles bruit/sÃ©curitÃ©, calendrier, assurance, respect du voisinage."],
  ]);
}
function saintEtienneAlignmentSection() {
  return tableSection("Besoins du territoire et rÃ©ponse TVF", "Cette synthÃ¨se transforme les donnÃ©es de cadrage en pistes de travail concrÃ¨tes pour le territoire pilote. Les dispositifs publics citÃ©s sont des cadres de rÃ©fÃ©rence Ã  articuler avec les acteurs compÃ©tents, pas des financements acquis.", [
    ["Besoin observÃ©", "DonnÃ©e ou source Ã  mobiliser", "Cadre public compatible", "RÃ©ponse TVF", "Document Ã  produire"],
    ["Logements vacants et habitat ancien", "INSEE : logements vacants, Ã¢ge du parc, statut d'occupation", "Politiques habitat, rÃ©novation, lutte contre l'habitat indigne, dispositifs locaux Ã  confirmer", "Qualifier les biens, comprendre les blocages propriÃ©taires, prÃ©parer des scÃ©narios d'usage", "Fiche propriÃ©taire, accord de principe, scÃ©narios d'usage"],
    ["Commerces fermÃ©s et rues fragilisÃ©es", extLink("EPASE : rÃ©habilitation de cellules commerciales vacantes du centre-ville et accompagnement de porteurs de projet", "https://www.epase.fr/implanter-son-commerce/"), "Revitalisation de centre-ville, commerce de proximitÃ©, occupation temporaire", "Identifier les locaux, tester des usages, rapprocher propriÃ©taires et porteurs, en complÃ©ment des dÃ©marches publiques existantes", "Fiche signalement, note d'opportunitÃ©, fiche projet"],
    ["Friches et foncier dÃ©laissÃ©", extLink("Cartofriches - Cerema", "https://cartofriches.cerema.fr/cartofriches/"), "Recyclage foncier, sobriÃ©tÃ© fonciÃ¨re, renaturation ou usage transitoire", "Qualifier sÃ©curitÃ©, accÃ¨s, propriÃ©tÃ©, usages verts ou collectifs", "Fiche d'audit terrain, matrice des risques, plan d'action"],
    ["MatÃ©riaux et ressources inutilisÃ©es", extLink("PMCB - MinistÃ¨re de la Transition Ã©cologique", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Ã‰conomie circulaire, rÃ©emploi, rÃ©duction des dÃ©chets du bÃ¢timent", "Recenser, tracer, accepter ou refuser puis affecter les ressources Ã  des projets validÃ©s", "Bordereau matÃ©riaux, registre de rÃ©emploi, PV de remise"],
    ["Insertion et mobilisation citoyenne", "INSEE : chÃ´mage, pauvretÃ©, contexte social du territoire", "ESS, bÃ©nÃ©volat, participation citoyenne, parcours d'insertion Ã  articuler avec les acteurs locaux", "CrÃ©er des missions encadrÃ©es, utiles, limitÃ©es et documentÃ©es", "Fiche mission, feuille d'Ã©margement, compte rendu terrain"],
  ]);
}

function saintEtiennePilotDashboardSection() {
  return tableSection("Tableau de bord du pilote Saint-Ã‰tienne", "Le pilote doit Ãªtre suivi comme une expÃ©rimentation professionnelle. Les compteurs restent Ã  zÃ©ro tant qu'aucun dossier n'est vÃ©rifiÃ© ; l'enjeu est d'abord de prÃ©parer des dÃ©finitions robustes.", [
    ["Indicateur", "DÃ©finition TVF", "Preuve attendue", "FrÃ©quence de mise Ã  jour", "Usage en rÃ©union"],
    ["Biens signalÃ©s", "Logements, commerces, bÃ¢timents, terrains ou friches reÃ§us dans le registre", "Fiche signalement, source, date, localisation non sensible", "Mensuelle pendant le pilote", "RepÃ©rer les sujets rÃ©currents"],
    ["Biens qualifiÃ©s", "Signalements complÃ©tÃ©s avec Ã©tat apparent, contraintes et suite proposÃ©e", "Fiche d'audit, photos autorisÃ©es, dÃ©cision d'orientation", "Mensuelle", "DÃ©cider ce qui mÃ©rite une visite ou une Ã©tude"],
    ["PropriÃ©taires accompagnÃ©s", "PropriÃ©taires ayant transmis un dossier exploitable ou autorisÃ© une Ã©tape d'Ã©tude", "Fiche propriÃ©taire, accord de principe, Ã©change tracÃ©", "Trimestrielle", "Mesurer l'adhÃ©sion au dispositif"],
    ["MatÃ©riaux proposÃ©s", "Ressources dÃ©crites avec catÃ©gorie, quantitÃ©, Ã©tat et disponibilitÃ©", "Bordereau, photos, conditions de retrait", "Mensuelle", "Orienter vers la matÃ©riauthÃ¨que TVF"],
    ["Missions citoyennes", "Actions bÃ©nÃ©voles ouvertes, rÃ©alisÃ©es ou reportÃ©es avec encadrement", "Fiche mission, Ã©margement, compte rendu", "AprÃ¨s chaque action", "SÃ©curiser l'engagement local"],
    ["Dossiers prÃªts Ã  prÃ©senter", "Dossiers disposant d'un besoin, d'un usage, d'un responsable et de piÃ¨ces suffisantes", "Fiche projet, budget, matrice des risques", "Avant chaque comitÃ©", "PrÃ©parer une dÃ©cision ou une demande de soutien"],
  ]);
}

function observatoryDataSection() {
  return tableSection("Sources publiques Ã  croiser", "L'observatoire TVF doit distinguer donnÃ©es publiques, signalements, visites autorisÃ©es et dÃ©cisions internes.", [
    ["Source", "Ce qu'elle permet", "Limite Ã  respecter"],
    [extLink("INSEE - dossiers communaux", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Population, logements, vacance, emploi, pauvretÃ©, Ã©quipements et activitÃ© Ã©conomique.", "La donnÃ©e dÃ©crit un contexte ; elle ne suffit pas Ã  qualifier un bien prÃ©cis."],
    [extLink("Cartofriches - Cerema", "https://cartofriches.cerema.fr/cartofriches/"), "Friches, statuts, types, observatoires locaux et donnÃ©es ouvertes.", "Certaines friches restent sensibles : la publication doit Ãªtre maÃ®trisÃ©e."],
    [extLink("PMCB - MinistÃ¨re de la Transition Ã©cologique", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Cadre de la filiÃ¨re bÃ¢timent, reprise, traÃ§abilitÃ©, rÃ©emploi et rÃ©utilisation.", "La banque de matÃ©riaux TVF doit rester orientÃ©e projet, pas distribution libre."],
    [extLink("Banque des Territoires / Localtis - logements vacants", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "SynthÃ¨se de l'Ã©tude INSEE sur la vacance, ses causes et ses contrastes territoriaux.", "Ne pas confondre vacance frictionnelle et vacance structurelle."],
  ]);
}

function observatoryDecisionMatrixSection() {
  return tableSection("Matrice donnÃ©e, carte, dÃ©cision", "L'observatoire devient crÃ©dible lorsqu'il ne se contente pas d'afficher des points sur une carte. Chaque donnÃ©e doit avoir un statut, une preuve et une dÃ©cision possible.", [
    ["Objet observÃ©", "DonnÃ©e minimale", "Statut possible", "DÃ©cision TVF", "Publication"],
    ["Logement vacant", "Adresse approximative, type, Ã©tat apparent, source, contact Ã©ventuel", "SignalÃ©, qualifiÃ©, propriÃ©taire contactÃ©, classÃ©", "Demander piÃ¨ces, organiser visite autorisÃ©e, orienter Habitat Vivant", "Jamais d'adresse privÃ©e sans accord"],
    ["Commerce fermÃ©", "Rue, type de local, Ã©tat de vitrine, usage antÃ©rieur si connu", "SignalÃ©, vÃ©rifiÃ© terrain, usage Ã  Ã©tudier, classÃ©", "Analyser le potentiel Commerce Vivant", "Publication possible par secteur, pas par propriÃ©taire"],
    ["BÃ¢timent abandonnÃ©", "Type de bÃ¢timent, accÃ¨s, risques apparents, propriÃ©tÃ© Ã  vÃ©rifier", "SignalÃ©, sensible, Ã  sÃ©curiser, Ã  rÃ©orienter", "Demander avis compÃ©tent ou classer par prudence", "Publication limitÃ©e si risque ou sÃ©curitÃ©"],
    ["Friche ou terrain", "Localisation, surface estimÃ©e, accÃ¨s, vÃ©gÃ©tation, usage possible", "SignalÃ©, croisÃ© Cartofriches, qualifiÃ©, orientÃ©", "PrÃ©parer audit Friches & Terrains Vivants", "Carte agrÃ©gÃ©e ou non sensible"],
    ["MatÃ©riaux disponibles", "CatÃ©gorie, quantitÃ©, Ã©tat, dÃ©lai, conditions de retrait", "ProposÃ©, acceptÃ©, refusÃ©, rÃ©servÃ©, affectÃ©", "Orienter MatÃ©riauthÃ¨que Solidaire", "Publication uniquement si contribution validÃ©e"],
  ]);
}

function observatoryMapReadinessSection() {
  return tableSection("PrÃ©parer une carte exploitable", "La carte TVF doit Ãªtre un outil de travail, pas une vitrine imprudente. Elle doit distinguer ce qui peut Ãªtre public, rÃ©servÃ© aux partenaires ou strictement interne.", [
    ["Couche cartographique", "Contenu", "Niveau de diffusion", "Raison"],
    ["Contexte territorial", "Population, logements, vacance, emploi, pauvretÃ©, sources publiques", "Public", "DonnÃ©es agrÃ©gÃ©es et sourcÃ©es"],
    ["Biens signalÃ©s", "Signalements reÃ§us avec statut interne", "Interne", "Protection des propriÃ©taires, sÃ©curitÃ© et donnÃ©es personnelles"],
    ["Dossiers qualifiÃ©s", "Biens ou ressources avec piÃ¨ces suffisantes", "Partenaires autorisÃ©s", "Aide Ã  la dÃ©cision sans exposition excessive"],
    ["Projets conventionnÃ©s", "PÃ©rimÃ¨tre, objectif, responsable, calendrier et indicateurs", "Public si accord Ã©crit", "Communication possible lorsque le cadre est formalisÃ©"],
    ["MatÃ©riaux disponibles", "CatÃ©gorie, quantitÃ©, disponibilitÃ©, conditions de retrait", "Interne ou partenaires", "Ã‰viter une logique de distribution libre"],
    ["RÃ©sultats vÃ©rifiÃ©s", "Actions rÃ©alisÃ©es avec preuve et indicateurs", "Public", "Valoriser seulement les rÃ©sultats Ã©tablis"],
  ]);
}

function contactDetailsSection() {
  return tableSection("Coordonnées officielles TVF", "Ces coordonnées sont les canaux de contact publics à utiliser pour les demandes institutionnelles, partenariales ou citoyennes.", [
    ["Canal", "Information", "Usage recommandé"],
    ["E-mail", `<a href="mailto:${contact.email}">${contact.email}</a>`, "Premier contact écrit, transmission d'une demande, prise de rendez-vous ou envoi d'un dossier."],
    ["Téléphone", `<a href="tel:${contact.phoneHref}">${contact.phone}</a>`, "Contact court, orientation rapide ou confirmation d'un rendez-vous."],
    ["WhatsApp", `<a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer">Écrire à TVF sur WhatsApp</a>`, "Canal rapide pour démarrer une discussion ou demander une orientation courte."],
    ["Facebook", `<a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer">Territoires Vivants France</a>`, "Suivi des actualités publiques et relais des communications de lancement."],
    ["Instagram", `<a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer">@territoiresvivantsfrance</a>`, "Visuels de lancement, mobilisation citoyenne et actualités terrain."],
    ["Siège national", contact.address, "Adresse institutionnelle de référence pour les mentions et documents TVF."],
  ]);
}
function socialContactSection() {
  return `<section class="section soft social-contact-section" ${sectionAttrs("WhatsApp et réseaux sociaux")}><div class="container social-contact-grid"><div class="social-contact-copy"><p class="section-kicker">Canaux rapides</p><h2>Écrire à TVF ou suivre l'association.</h2><p class="section-lead">Pour un premier échange court, WhatsApp permet de démarrer une discussion simplement. Facebook et Instagram servent à suivre les communications publiques de lancement, les visuels de mobilisation et les prochaines actualités de Territoires Vivants France.</p><div class="social-actions"><a class="social-action whatsapp" href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Écrire à Territoires Vivants France sur WhatsApp"><span aria-hidden="true">WA</span><strong>WhatsApp</strong><small>Démarrer une discussion</small></a><a class="social-action facebook" href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Suivre Territoires Vivants France sur Facebook"><span aria-hidden="true">FB</span><strong>Facebook</strong><small>Territoires Vivants France</small></a><a class="social-action instagram" href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Suivre Territoires Vivants France sur Instagram"><span aria-hidden="true">IG</span><strong>Instagram</strong><small>@territoiresvivantsfrance</small></a></div></div><figure class="qr-card"><img src="${whatsappQr}" ${imageAttrs(whatsappQr)} alt="QR code WhatsApp pour contacter Territoires Vivants France" loading="lazy" decoding="async"><figcaption>Scannez le QR code pour ouvrir directement la conversation WhatsApp TVF.</figcaption></figure></div></section>`;
}
function contactAppointmentSection() {
  return cards("Pourquoi contacter TVF maintenant ?", "Une demande peut commencer simplement. L'important est de savoir quel problÃ¨me vous souhaitez rÃ©soudre et quelles informations existent dÃ©jÃ .", [
    ["Vous avez un territoire Ã  diagnostiquer", "Commune, EPCI, quartier, rue commerÃ§ante, friche, parc de logements ou besoin public Ã  qualifier.", "collectivites.html"],
    ["Vous possÃ©dez un bien inutilisÃ©", "Logement, immeuble, commerce, bÃ¢timent ou terrain que vous souhaitez Ã©tudier dans un cadre sÃ©curisÃ©.", "proprietaires.html"],
    ["Vous pouvez contribuer", "MatÃ©riaux, locaux, compÃ©tences, mÃ©cÃ©nat, logistique ou expertise pouvant servir Ã  un projet utile.", "entreprises.html"],
    ["Vous voulez soutenir", "Financeur, mÃ©cÃ¨ne, fondation ou investisseur Ã  impact souhaitant comprendre la mÃ©thode, les preuves et le reporting.", "financeurs-mecenes.html"],
  ]);
}

function contactProfileTriageSection() {
  return tableSection("Quel message envoyer selon votre profil ?", "Ce cadre de lecture transforme la page Contact en outil de tri. Elle Ã©vite les Ã©changes trop gÃ©nÃ©raux et aide TVF Ã  orienter rapidement la demande.", [
    ["Profil", "Objet recommandÃ© du message", "Informations essentielles", "Document utile"],
    ["CollectivitÃ©", "Demande de rendez-vous territorial", "Commune ou EPCI, pÃ©rimÃ¨tre, besoin public, donnÃ©es disponibles, calendrier", "Fiche collectivitÃ©"],
    ["PropriÃ©taire", "Proposition de bien inutilisÃ©", "Adresse, type de bien, Ã©tat apparent, photos, contraintes, intention", "Fiche propriÃ©taire"],
    ["Entreprise", "Contribution matÃ©riaux, locaux, compÃ©tences ou mÃ©cÃ©nat", "Nature de la contribution, quantitÃ©, localisation, dÃ©lai, conditions", "Fiche entreprise ou bordereau matÃ©riaux"],
    ["Association", "Besoin d'usage ou projet local", "Publics concernÃ©s, usage souhaitÃ©, durÃ©e, capacitÃ© d'animation, partenaires connus", "Fiche projet"],
    ["BÃ©nÃ©vole ou citoyen", "Engagement ou signalement", "Commune, disponibilitÃ©, compÃ©tence, lieu signalÃ© ou mission souhaitÃ©e", "Fiche bÃ©nÃ©vole ou fiche signalement"],
    ["Financeur", "Ã‰change sur un dossier ou une mÃ©thode de reporting", "Type de soutien, critÃ¨res, calendrier, niveau de preuve attendu", "Plan de financement ou grille d'impact"],
  ]);
}

function firstMeetingSection() {
  return timeline("Premier rendez-vous TVF", [
    ["1", "Clarifier le besoin", "Identifier le territoire, le bien, la ressource, le public concernÃ© et la dÃ©cision attendue."],
    ["2", "VÃ©rifier les piÃ¨ces", "Lister ce qui existe dÃ©jÃ  : photos, donnÃ©es publiques, autorisations, contacts, budget ou contraintes."],
    ["3", "Choisir le parcours", "Orienter vers collectivitÃ©, propriÃ©taire, entreprise, bÃ©nÃ©vole, financeur ou partenaire."],
    ["4", "PrÃ©parer le document", "SÃ©lectionner la fiche utile : territoire, propriÃ©taire, entreprise, projet, financement ou signalement."],
    ["5", "DÃ©cider de la suite", "ComplÃ©ter, visiter, instruire, rÃ©orienter, conventionner ou classer le dossier."],
  ]);
}

function publicEntryMatrixSection() {
  return tableSection("Dossier minimum par profil", "Chaque demande doit pouvoir Ãªtre orientÃ©e rapidement. Ce rÃ©fÃ©rentiel indique le minimum utile Ã  transmettre avant un Ã©change approfondi.", [
    ["Profil", "Ã€ prÃ©parer", "Document utile", "DÃ©cision attendue"],
    ["CollectivitÃ©", "PÃ©rimÃ¨tre, besoin public, donnÃ©es disponibles, interlocuteur, calendrier", "Fiche collectivitÃ© + note d'opportunitÃ©", "Cadrer un diagnostic, une expÃ©rimentation ou une convention territoriale"],
    ["PropriÃ©taire", "Adresse, type de bien, Ã©tat apparent, photos, contraintes, intention du propriÃ©taire", "Fiche propriÃ©taire + accord de principe", "Ã‰tudier un usage, organiser une visite autorisÃ©e ou classer le dossier"],
    ["Entreprise", "Ressource proposÃ©e, quantitÃ©, Ã©tat, localisation, disponibilitÃ©, conditions de retrait", "Fiche entreprise + bordereau matÃ©riaux", "Accepter, refuser, mettre en attente ou affecter Ã  un projet"],
    ["Association", "Besoin d'usage, publics concernÃ©s, horaires, responsabilitÃ©s, capacitÃ© d'animation", "Fiche projet + convention partenariat", "Qualifier un usage possible ou rÃ©orienter vers un acteur adaptÃ©"],
    ["BÃ©nÃ©vole", "CompÃ©tences, territoire, disponibilitÃ©s, mobilitÃ©, limites d'intervention", "Fiche bÃ©nÃ©vole + fiche mission", "Proposer une mission encadrÃ©e ou constituer un vivier local"],
    ["Financeur", "Objet du soutien, budget, critÃ¨res, attentes de reporting, calendrier", "Fiche financeur + plan de financement", "VÃ©rifier si un dossier peut Ãªtre prÃ©sentÃ© sans promesse excessive"],
  ]);
}

function fastJourneySection() {
  return tableSection("Trouver son parcours en trois clics", "Cette matrice sert de boussole : elle indique la page, le document et l'action immÃ©diate selon le profil du visiteur.", [
    ["Je suis...", "Page Ã  ouvrir", "Document Ã  prÃ©parer", "Action immÃ©diate"],
    ["Une collectivitÃ©", `<a href="${hrefFor("collectivites.html")}">CollectivitÃ©s</a>`, "Fiche collectivitÃ© ou fiche territoire", "DÃ©crire le pÃ©rimÃ¨tre, le besoin public et les interlocuteurs"],
    ["Un propriÃ©taire", `<a href="${hrefFor("proprietaires.html")}">PropriÃ©taires</a>`, "Fiche propriÃ©taire ou accord de principe", "PrÃ©senter le bien, son Ã©tat, les contraintes et l'intention"],
    ["Une entreprise", `<a href="${hrefFor("entreprises.html")}">Entreprises</a>`, "Fiche entreprise ou bordereau matÃ©riaux", "DÃ©crire la contribution, sa disponibilitÃ© et ses limites"],
    ["Un bÃ©nÃ©vole ou citoyen", `<a href="${hrefFor("benevoles-citoyens.html")}">BÃ©nÃ©voles et citoyens</a>`, "Fiche bÃ©nÃ©vole ou fiche signalement", "Indiquer la commune, les disponibilitÃ©s ou le lieu signalÃ©"],
    ["Un financeur ou mÃ©cÃ¨ne", `<a href="${hrefFor("financeurs-mecenes.html")}">Financeurs et mÃ©cÃ¨nes</a>`, "Plan de financement ou dossier projet", "Demander un Ã©change sur un dossier instruit, pas sur une promesse vague"],
  ]);
}

function actionsOperationalMatrixSection() {
  return tableSection("Matrice opÃ©rationnelle des actions", "Cette matrice relie chaque action Ã  un problÃ¨me concret, Ã  un document de travail, Ã  une dÃ©cision attendue et Ã  un indicateur de suivi. Elle permet de comprendre rapidement ce que TVF produit rÃ©ellement avant toute communication publique.", [
    ["Action", "ProblÃ¨me traitÃ©", "RÃ©ponse TVF", "Document utile", "DÃ©cision attendue", "Impact attendu"],
    ["Logements vacants", "Bien inutilisÃ©, Ã©tat incertain, propriÃ©taire isolÃ© ou absence d'usage clair", "Qualifier le bien, organiser une visite autorisÃ©e, comparer les usages possibles et prÃ©parer le cadre propriÃ©taire", "Fiche propriÃ©taire, accord de principe, scÃ©narios d'usage", "ComplÃ©ter, visiter, instruire, conventionner ou classer", "Biens qualifiÃ©s, propriÃ©taires accompagnÃ©s, logements remis en usage uniquement aprÃ¨s preuve"],
    ["Commerces inoccupÃ©s", "Vitrine fermÃ©e, local sans projet, besoin Ã©conomique ou associatif non reliÃ© au propriÃ©taire", "DÃ©crire le local, analyser les usages compatibles et rapprocher les acteurs locaux", "Fiche signalement, fiche projet, note d'opportunitÃ©", "Tester un usage, rechercher un porteur, conventionner ou rÃ©orienter", "Locaux qualifiÃ©s, scÃ©narios d'activation, commerces ou usages accompagnÃ©s"],
    ["MatÃ©riaux de rÃ©emploi", "Surplus, invendus ou matÃ©riaux de chantier sans affectation utile", "Identifier, trier, tracer et affecter les ressources Ã  un projet validÃ©", "Fiche entreprise, bordereau matÃ©riaux, PV de remise", "Accepter, refuser, stocker, affecter ou mettre en attente", "MatÃ©riaux orientÃ©s vers des projets, dÃ©chets Ã©vitÃ©s lorsque la preuve existe"],
    ["Friches et terrains", "Espace dÃ©laissÃ©, propriÃ©tÃ© ou sÃ©curitÃ© Ã  clarifier, usage inexistant", "Qualifier l'accÃ¨s, les risques, les contraintes, les usages temporaires et les acteurs Ã  mobiliser", "Fiche d'audit terrain, matrice des risques, note d'opportunitÃ©", "Ã‰tudier, sÃ©curiser, conventionner, rÃ©orienter ou classer", "Sites qualifiÃ©s, usages temporaires ou projets de reconversion cadrÃ©s"],
    ["SolidaritÃ© et insertion", "VolontÃ© d'agir sans mission claire, besoin d'encadrement ou de parcours utile", "DÃ©finir des missions courtes, encadrÃ©es, traÃ§ables et compatibles avec les compÃ©tences disponibles", "Fiche mission bÃ©nÃ©vole, feuille d'Ã©margement, compte rendu terrain", "Ouvrir une mission, reporter, encadrer ou refuser", "BÃ©nÃ©voles mobilisÃ©s, heures suivies, missions rÃ©alisÃ©es avec sÃ©curitÃ©"],
    ["Territoires partenaires", "Besoin public identifiÃ© mais pÃ©rimÃ¨tre, gouvernance ou livrables encore flous", "Cadrer un diagnostic, une expÃ©rimentation, un quartier pilote ou une convention territoriale", "Fiche collectivitÃ©, convention territoriale, plan d'action", "Lancer un cadrage, signer une coopÃ©ration ou diffÃ©rer", "Territoires qualifiÃ©s, diagnostics produits, dÃ©cisions publiques facilitÃ©es"],
    ["Financer les projets", "IdÃ©e utile mais budget, risques, preuves ou reporting insuffisants", "Structurer un budget, un plan de financement, une grille de risques et des indicateurs", "Budget prÃ©visionnel, plan de financement, reporting financeur", "Dossier finanÃ§able, Ã  complÃ©ter, Ã  ajourner ou Ã  abandonner", "Demandes mieux cadrÃ©es, financements suivis sÃ©parÃ©ment des intentions"],
    ["Observatoire", "DonnÃ©es dispersÃ©es, signalements non vÃ©rifiÃ©s, prioritÃ©s difficiles Ã  hiÃ©rarchiser", "Croiser sources publiques, signalements, visites autorisÃ©es et statuts de dÃ©cision", "Registre sources, protocole signalement, fiche cartographie", "SignalÃ©, qualifiÃ©, orientÃ©, conventionnÃ© ou classÃ©", "Base de dÃ©cision territoriale, cartes et indicateurs fiables"],
  ]);
}

function actionsDecisionSection() {
  return tableSection("De la demande Ã  la dÃ©cision", "Une action TVF doit produire une suite claire, mÃªme lorsqu'elle n'aboutit pas. Ce processus Ã©vite les promesses floues et donne aux collectivitÃ©s, propriÃ©taires, entreprises et financeurs une lecture simple du dossier.", [
    ["Ã‰tape", "Question Ã  trancher", "Preuve attendue", "Suite possible"],
    ["1. Recevoir", "Qui demande quoi, sur quel territoire et avec quel niveau d'urgence ?", "Message, fiche d'entrÃ©e, coordonnÃ©es, localisation", "AccusÃ© de rÃ©ception et numÃ©ro de dossier"],
    ["2. Qualifier", "Les informations sont-elles suffisantes pour comprendre le bien, la ressource ou le besoin ?", "Photos, adresse, Ã©tat apparent, contraintes connues, interlocuteur", "Demande de piÃ¨ces, visite autorisÃ©e ou classement"],
    ["3. Prioriser", "Le dossier est-il utile, faisable, sÃ»r et cohÃ©rent avec la mission TVF ?", "Grille d'instruction, risques, utilitÃ© territoriale, moyens nÃ©cessaires", "Instruction, rÃ©orientation, mise en attente ou refus motivÃ©"],
    ["4. Formaliser", "Qui porte quoi, pendant combien de temps, avec quelles responsabilitÃ©s ?", "Convention, accord de principe, budget, autorisations, assurances", "Lancement d'une action encadrÃ©e ou report"],
    ["5. Suivre", "Que peut-on mesurer et publier sans exagÃ©rer ?", "Compte rendu, indicateurs, photos autorisÃ©es, piÃ¨ces justificatives", "Bilan, mise Ã  jour des indicateurs ou retour d'expÃ©rience"],
  ]);
}

function polesOperationalMatrixSection() {
  return tableSection("Matrice opÃ©rationnelle des pÃ´les", "Les pÃ´les donnent une organisation lisible au cÅ“ur mÃ©tier. Chaque pÃ´le doit savoir ce qu'il analyse, avec quels documents, pour quels publics et jusqu'Ã  quelle dÃ©cision.", [
    ["PÃ´le", "Sujet traitÃ©", "Publics principalement concernÃ©s", "Documents de rÃ©fÃ©rence", "DÃ©cision produite"],
    ["Habitat Vivant", "Logements vacants, immeubles dÃ©gradÃ©s, usages temporaires ou solidaires", "PropriÃ©taires, collectivitÃ©s, habitants, financeurs", "Fiche propriÃ©taire, accord de principe, scÃ©narios d'usage, suivi de restitution", "Ã‰tude, visite, convention, travaux Ã  cadrer ou classement"],
    ["MatÃ©riauthÃ¨que Solidaire", "MatÃ©riaux, mobilier, Ã©quipements, surplus, invendus ou ressources de chantier", "Entreprises, artisans, collectivitÃ©s, associations, particuliers", "Fiche entreprise, bordereau matÃ©riaux, PV de remise, registre matÃ©riaux", "Acceptation, refus, stockage, affectation ou rÃ©orientation"],
    ["Commerce Vivant", "Locaux commerciaux vacants, vitrines fermÃ©es, rez-de-chaussÃ©e sans activitÃ©", "PropriÃ©taires, commerÃ§ants, artisans, communes, associations", "Fiche local, fiche projet, note d'opportunitÃ©, convention d'usage", "Test d'usage, recherche de porteur, occupation temporaire ou classement"],
    ["Friches & Terrains Vivants", "Friches, terrains dÃ©laissÃ©s, espaces verts potentiels, sites Ã  sÃ©curiser", "CollectivitÃ©s, propriÃ©taires, associations, habitants, experts techniques", "Fiche d'audit terrain, matrice des risques, plan d'action territorial", "Ã‰tude, sÃ©curisation, usage transitoire, projet territorial ou classement"],
    ["SolidaritÃ© & Insertion", "Missions bÃ©nÃ©voles, chantiers encadrÃ©s, participation citoyenne, parcours d'utilitÃ©", "BÃ©nÃ©voles, associations, structures d'insertion, habitants, jeunes et seniors", "Fiche mission, consignes sÃ©curitÃ©, feuille d'Ã©margement, compte rendu", "Mission ouverte, mission reportÃ©e, encadrement renforcÃ© ou refus"],
  ]);
}

function polesCoordinationSection() {
  return tableSection("Comment les pÃ´les s'assemblent sur un dossier", "Un projet crÃ©dible ne dÃ©pend presque jamais d'un seul pÃ´le. Cette synthÃ¨se aide Ã  comprendre qui porte le dossier principal et quels pÃ´les interviennent en appui.", [
    ["Situation de dÃ©part", "PÃ´le principal", "PÃ´les associÃ©s", "Livrable final attendu"],
    ["Un logement vacant proposÃ© par un propriÃ©taire", "Habitat Vivant", "MatÃ©riauthÃ¨que Solidaire, SolidaritÃ© & Insertion, Financement", "ScÃ©nario d'usage, budget, accord propriÃ©taire, convention possible"],
    ["Un commerce fermÃ© en centre-ville", "Commerce Vivant", "Habitat Vivant, MatÃ©riauthÃ¨que Solidaire, CollectivitÃ©s", "Note d'opportunitÃ©, usage compatible, porteur identifiÃ© ou besoin de recherche"],
    ["Des matÃ©riaux disponibles chez une entreprise", "MatÃ©riauthÃ¨que Solidaire", "Habitat Vivant, Friches & Terrains Vivants, SolidaritÃ© & Insertion", "Registre, Ã©tat, conditions de retrait, affectation Ã  un projet validÃ©"],
    ["Un terrain dÃ©laissÃ© dans un quartier", "Friches & Terrains Vivants", "SolidaritÃ© & Insertion, CollectivitÃ©s, MatÃ©riauthÃ¨que Solidaire", "Audit terrain, risques, usages possibles, plan d'action local"],
    ["Une mission citoyenne ou bÃ©nÃ©vole", "SolidaritÃ© & Insertion", "Tous les pÃ´les selon le support de mission", "Fiche mission, consignes, rÃ©fÃ©rent, Ã©margement et compte rendu"],
  ]);
}

function impactDashboardModelSection() {
  return tableSection("ModÃ¨le de tableau de bord d'impact", "Ce modÃ¨le prÃ©pare les futurs reportings TVF. Les colonnes Ã©vitent de mÃ©langer objectifs, dossiers en cours et rÃ©sultats prouvÃ©s.", [
    ["Famille d'impact", "Indicateur", "Statut Ã  distinguer", "Source de preuve", "Lecture attendue"],
    ["Patrimoine", "Biens signalÃ©s, qualifiÃ©s, orientÃ©s, conventionnÃ©s, remis en usage", "SignalÃ© / qualifiÃ© / conventionnÃ© / rÃ©alisÃ©", "Registre demandes, fiche propriÃ©taire, convention, compte rendu", "Montrer la progression rÃ©elle d'un bien"],
    ["MatÃ©riaux", "MatÃ©riaux proposÃ©s, acceptÃ©s, refusÃ©s, affectÃ©s, rÃ©employÃ©s", "ProposÃ© / acceptÃ© / rÃ©servÃ© / affectÃ© / rÃ©employÃ©", "Bordereau, PV de remise, registre matÃ©riaux", "Ã‰viter de compter comme rÃ©employÃ© ce qui est seulement proposÃ©"],
    ["Territoires", "Communes, quartiers ou pÃ©rimÃ¨tres accompagnÃ©s", "Contact / diagnostic / coopÃ©ration / bilan", "Fiche collectivitÃ©, convention territoriale, plan d'action", "Distinguer intÃ©rÃªt, coopÃ©ration et action mesurÃ©e"],
    ["Citoyens", "BÃ©nÃ©voles inscrits, missions ouvertes, participations rÃ©alisÃ©es", "Inscrit / mobilisable / prÃ©sent / action rÃ©alisÃ©e", "Fiche bÃ©nÃ©vole, feuille d'Ã©margement, compte rendu", "Mesurer l'engagement rÃ©el et encadrÃ©"],
    ["Financement", "Montants estimÃ©s, demandÃ©s, accordÃ©s, conventionnÃ©s, versÃ©s", "Estimation / demande / accord / convention / versement", "Plan de financement, courrier, convention, justificatif", "Ne jamais confondre une piste avec un financement obtenu"],
  ]);
}

function impactPublicationRulesSection() {
  return tableSection("RÃ¨gles de publication des chiffres", "Un chiffre TVF doit pouvoir Ãªtre relu par une collectivitÃ©, un financeur ou un journaliste sans crÃ©er de doute sur son origine.", [
    ["RÃ¨gle", "Application concrÃ¨te", "Exemple de formulation prudente"],
    ["SÃ©parer objectif et rÃ©sultat", "Un objectif 2026 ne doit pas Ãªtre prÃ©sentÃ© comme dÃ©jÃ  atteint", "Objectif : qualifier les premiers biens du territoire pilote"],
    ["Citer la source", "Toute donnÃ©e nationale ou locale doit indiquer organisme, annÃ©e et lien", "Source : INSEE, RP2023, dossier communal de Saint-Ã‰tienne"],
    ["Indiquer le statut", "Un projet en instruction n'est pas un projet rÃ©alisÃ©", "Dossier en cours de qualification, sans convention Ã  ce stade"],
    ["Documenter la preuve", "Un indicateur doit renvoyer Ã  un registre, une fiche ou un compte rendu", "Indicateur calculÃ© Ã  partir du registre des demandes"],
    ["Mettre Ã  jour avec date", "Chaque tableau de bord doit avoir une date de mise Ã  jour", "Mise Ã  jour trimestrielle prÃ©vue aprÃ¨s dÃ©marrage du pilote"],
  ]);
}

function essentialDocumentsSection() {
  return cards("Les documents essentiels", "Cette sÃ©lection Ã©vite de commencer par toute la bibliothÃ¨que documentaire. Elle suffit pour prÃ©parer la majoritÃ© des premiers rendez-vous.", [
    ["Dossier TVF", "PrÃ©senter l'association, sa mÃ©thode, ses publics et ses limites de communication.", "documents/dossier-presentation-tvf.md"],
    ["Dossier de contact TVF", "Retrouver coordonnÃ©es, services, pÃ´les, actions et informations Ã  transmettre.", "documents/dossier-contact-tvf.md"],
    ["Dossier prospection Saint-Ã‰tienne", "PrÃ©parer les contacts Ã  solliciter pour lancer le pilote : collectivitÃ©s, entreprises, artisans, insertion, foncier et financeurs.", "documents/dossier-prospection-saint-etienne.md"],
    ["Glossaire et annuaire Saint-Ã‰tienne", "Centraliser contacts, glossaire, secteurs, pÃ´les, insertion, matÃ©riaux et local de stockage.", "documents/glossaire-annuaire-contacts-saint-etienne.md"],
    ["Kit courriers prÃªts Ã  l'emploi", "Envoyer des demandes cadrÃ©es pour partenariats, matÃ©riaux, local de stockage, insertion, propriÃ©taires et financeurs.", "documents/kit-courriers-partenariats-demandes-tvf.md"],
    ["Pack lancement Saint-Ã‰tienne", "RÃ©unir les documents indispensables pour les premiers rendez-vous du pilote.", "documents/pack-lancement-saint-etienne.md"],
    ["SynthÃ¨ses 1 page", "Utiliser une version courte pour collectivitÃ©, entreprise, propriÃ©taire ou financeur.", "documents/synthese-collectivite-1-page.md"],
    ["CritÃ¨res matÃ©riaux", "Savoir quoi accepter, refuser, orienter ou stocker avant tout retrait.", "documents/criteres-acceptation-materiaux.md"],
    ["Protocole stockage", "SÃ©curiser un local temporaire avant l'entrÃ©e de matÃ©riaux.", "documents/protocole-local-stockage.md"],
    ["Cadre insertion", "Encadrer les actions terrain sans improviser de chantier non habilitÃ©.", "documents/cadre-chantiers-insertion.md"],
    ["Dossier Saint-Ã‰tienne", "Appuyer le territoire pilote sur les donnÃ©es publiques, besoins, indicateurs et piÃ¨ces Ã  rÃ©unir.", "documents/dossier-territorial-saint-etienne.md"],
    ["Fiche collectivitÃ©", "DÃ©crire un territoire, un pÃ©rimÃ¨tre, un besoin public et les interlocuteurs.", "documents/fiche-collectivite.md"],
    ["Fiche propriÃ©taire", "Qualifier un bien vacant ou dÃ©gradÃ© avant Ã©tude, visite ou scÃ©nario d'usage.", "documents/fiche-proprietaire.md"],
    ["Fiche entreprise", "PrÃ©senter une contribution en matÃ©riaux, locaux, compÃ©tences ou mÃ©cÃ©nat.", "documents/fiche-entreprise.md"],
    ["Fiche projet", "Cadrer objectif, acteurs, risques, budget, preuves et dÃ©cision attendue.", "documents/fiche-projet.md"],
    ["Fiche signalement", "DÃ©crire un lieu, un commerce, une friche ou une ressource Ã  qualifier.", "documents/fiche-signalement-lieu.md"],
    ["Grille d'instruction", "DÃ©cider si le dossier doit Ãªtre complÃ©tÃ©, visitÃ©, instruit ou classÃ©.", "documents/grille-instruction-dossier.md"],
    ["ModÃ¨le de convention", "PrÃ©parer les clauses de coopÃ©ration Ã  adapter aux parties concernÃ©es.", "documents/modele-convention.md"],
    ["Grille d'impact", "Mesurer uniquement ce qui est dÃ©fini, prouvÃ© et traÃ§able.", "documents/grille-impact.md"],
  ]);
}


function documentQuickPacksSection() {
  return tableSection("Packs rapides par public", "Ces packs courts evitent d'ouvrir toute la bibliotheque documentaire. Ils donnent le bon ordre de lecture selon le rendez-vous.", [
    ["Public", "Documents a transmettre", "Decision attendue"],
    ["Collectivite", "Synthese collectivite 1 page, dossier TVF, fiche collectivite", "Choisir un perimetre et un referent"],
    ["Entreprise materiaux", "Synthese entreprise materiaux 1 page, criteres materiaux, bordereau", "Qualifier une ressource ou un local"],
    ["Proprietaire", "Synthese proprietaire 1 page, fiche proprietaire, accord de principe", "Autoriser une etude ou une visite"],
    ["Financeur", "Synthese financeur 1 page, fiche projet, budget, grille d'impact", "Verifier l'eligibilite d'un soutien"],
    ["Saint-Etienne", "Pack lancement Saint-Etienne, glossaire annuaire, kit courriers", "Lancer une prospection structuree"],
    ["Insertion", "Cadre chantiers insertion, fiche projet, consignes securite", "Identifier une action compatible"],
    ["Stockage", "Protocole local stockage, convention mise a disposition, registre materiaux", "Verifier un local avant usage"],
  ]);
}

function documentContactMatrixSection() {
  return tableSection("Qui contacter selon le besoin ?", "Cette matrice transforme la bibliotheque documentaire en parcours d'action lisible.", [
    ["Besoin", "Premier interlocuteur", "Document court", "Document de cadrage"],
    ["Presenter TVF a une mairie", "Cabinet, direction generale, service habitat, commerce ou transition", "Synthese collectivite", "Fiche collectivite"],
    ["Trouver un local de stockage", "Collectivite, bailleur, entreprise, proprietaire, fonciere", "Protocole stockage", "Convention mise a disposition"],
    ["Recuperer des materiaux", "Entreprise BTP, artisan, administration, commerce, collectivite", "Synthese entreprise materiaux", "Bordereau materiaux"],
    ["Etudier un bien vacant", "Proprietaire, mandataire, bailleur, service habitat", "Synthese proprietaire", "Fiche proprietaire"],
    ["Monter une action insertion", "PLIE, structure IAE, association habilitee, acteur emploi", "Cadre insertion", "Fiche projet"],
    ["Chercher un soutien financier", "Fondation, mecene, financeur public ou prive", "Synthese financeur", "Plan de financement"],
    ["Suivre une piste Saint-Etienne", "Acteur identifie dans l'annuaire", "Pack lancement Saint-Etienne", "Note opportunite territoriale"],
  ]);
}
function pdfPresentationPackSection() {
  return cards("Dossiers internes prÃªts Ã  prÃ©senter", "Ces supports sont transmis aprÃ¨s qualification d'un Ã©change. Les sources internes restent modifiables pour adapter chaque dossier.", [
    ["Dossier TVF PDF", "PrÃ©sentation gÃ©nÃ©rale de TVF, de sa mÃ©thode, de ses publics et de ses garanties de sÃ©rieux.", "output/pdf/dossier-presentation-tvf.pdf"],
    ["Dossier de contact PDF", "CoordonnÃ©es, services, pÃ´les, actions et informations Ã  prÃ©parer avant un Ã©change.", "output/documents/dossier-contact-tvf.pdf"],
    ["Dossier prospection Saint-Ã‰tienne PDF", "Liste opÃ©rationnelle des acteurs Ã  solliciter, prioritÃ©s, scripts et suivi de prospection.", "output/documents/dossier-prospection-saint-etienne.pdf"],
    ["Glossaire et annuaire Saint-Ã‰tienne PDF", "Contacts par secteur, poles, insertion, matÃ©riaux, stockage et tableaux de suivi.", "output/documents/glossaire-annuaire-contacts-saint-etienne.pdf"],
    ["Kit courriers prÃªts Ã  l'emploi PDF", "ModÃ¨les de courriers pour collectivitÃ©s, entreprises, propriÃ©taires, insertion, financeurs et demandes de local.", "output/documents/kit-courriers-partenariats-demandes-tvf.pdf"],
    ["Pack lancement Saint-Ã‰tienne PDF", "Documents et ordre logique pour lancer le pilote Saint-Ã‰tienne sans surcharger les rendez-vous.", "output/documents/pack-lancement-saint-etienne.pdf"],
    ["SynthÃ¨se collectivitÃ© PDF", "Version 1 page pour prÃ©senter TVF Ã  une mairie, un EPCI ou une collectivitÃ©.", "output/documents/synthese-collectivite-1-page.pdf"],
    ["SynthÃ¨se entreprise matÃ©riaux PDF", "Version 1 page pour solliciter matÃ©riaux, local, compÃ©tences ou RSE.", "output/documents/synthese-entreprise-materiaux-1-page.pdf"],
    ["SynthÃ¨se propriÃ©taire PDF", "Version 1 page pour expliquer comment proposer un bien sans engagement automatique.", "output/documents/synthese-proprietaire-1-page.pdf"],
    ["SynthÃ¨se financeur PDF", "Version 1 page pour prÃ©senter garanties, impact, budget et reporting.", "output/documents/synthese-financeur-1-page.pdf"],
    ["CritÃ¨res matÃ©riaux PDF", "CritÃ¨res d'acceptation, refus, orientation, stockage et traÃ§abilitÃ©.", "output/documents/criteres-acceptation-materiaux.pdf"],
    ["Protocole stockage PDF", "Cadre d'utilisation d'un local de stockage temporaire pour matÃ©riaux.", "output/documents/protocole-local-stockage.pdf"],
    ["Cadre insertion PDF", "Conditions minimales avant chantier d'insertion, action terrain ou mission encadrÃ©e.", "output/documents/cadre-chantiers-insertion.pdf"],
    ["Dossier collectivitÃ© PDF", "Support destinÃ© aux communes, EPCI, dÃ©partements, rÃ©gions et services publics.", "output/pdf/dossier-collectivite-tvf.pdf"],
    ["Dossier entreprise et mÃ©cÃ¨ne PDF", "Support pour entreprises, fondations, mÃ©cÃ¨nes, financeurs et acteurs Ã©conomiques.", "output/pdf/dossier-entreprise-mecene-tvf.pdf"],
    ["Dossier propriÃ©taire PDF", "Support pour expliquer comment proposer un bien sans engagement automatique.", "output/pdf/dossier-proprietaire-tvf.pdf"],
  ]);
}

function documentVisibilitySection() {
  return tableSection("Supports de prÃ©sentation et outils internes", "Tous les contenus restent disponibles, mais ils n'ont pas le mÃªme usage. Cette distinction Ã©vite de prÃ©senter un registre interne comme un support public.", [
    ["Niveau", "Ã€ utiliser pour", "Exemples", "Lecture recommandÃ©e"],
    ["Documents publics", "PrÃ©senter TVF Ã  une collectivitÃ©, un propriÃ©taire, une entreprise ou un financeur", "Dossier TVF, dossiers PDF, fiche collectivitÃ©, fiche propriÃ©taire, fiche entreprise", "Ã€ ouvrir en prioritÃ©"],
    ["Supports de rendez-vous", "PrÃ©parer une rÃ©union, qualifier une demande ou structurer une suite", "Fiche projet, piÃ¨ces Ã  fournir, note d'opportunitÃ©, modÃ¨le de convention", "Ã€ choisir selon le profil"],
    ["Outils internes", "Tracer les dÃ©cisions, risques, preuves, incidents, conventions et suivis", "Registres, grilles, PV, reporting, matrices", "Ã€ utiliser aprÃ¨s cadrage"],
  ]);
}

function documentPriorityPackSection() {
  return tableSection("Pack prioritaire pour prÃ©senter TVF", "Pour une rÃ©union avec une mairie, une mÃ©tropole, une entreprise ou un financeur, il vaut mieux arriver avec peu de documents, mais parfaitement choisis.", [
    ["Situation", "Documents Ã  prÃ©parer", "Objectif de la rÃ©union"],
    ["Premier rendez-vous collectivitÃ©", "Dossier TVF, fiche collectivitÃ©, fiche territoire partenaire, dossier Saint-Ã‰tienne si le pilote est concernÃ©", "Comprendre le besoin public et cadrer un pÃ©rimÃ¨tre rÃ©aliste"],
    ["Bien proposÃ© par un propriÃ©taire", "Fiche propriÃ©taire, accord de principe, autorisation de visite, scÃ©narios d'usage", "VÃ©rifier si le bien peut entrer dans un parcours TVF"],
    ["MatÃ©riaux proposÃ©s par une entreprise", "Fiche entreprise, bordereau matÃ©riaux, PV de remise, registre matÃ©riaux", "DÃ©cider si la ressource est utile, sÃ»re et affectable"],
    ["Projet Ã  financer", "Fiche projet, budget prÃ©visionnel, plan de financement, matrice des risques, grille d'impact", "PrÃ©senter un dossier lisible sans promesse excessive"],
    ["Action terrain ou bÃ©nÃ©vole", "Fiche mission, consignes sÃ©curitÃ©, feuille d'Ã©margement, compte rendu", "Encadrer une action courte, traÃ§able et sÃ©curisÃ©e"],
  ]);
}

function documentWorkflowSection() {
  return tableSection("ChaÃ®ne documentaire d'un dossier complet", "Un dossier TVF doit pouvoir Ãªtre suivi du premier contact au bilan. Cette chaÃ®ne Ã©vite les pertes d'information et les dÃ©cisions non tracÃ©es.", [
    ["Moment", "Document", "Ce qu'il sÃ©curise"],
    ["EntrÃ©e", "AccusÃ© de rÃ©ception + registre des demandes", "La date, le demandeur, le sujet et la prochaine action"],
    ["Qualification", "Fiche profil + piÃ¨ces Ã  fournir + grille d'instruction", "L'utilitÃ©, la faisabilitÃ©, les manques et les risques"],
    ["Orientation", "Fiche dÃ©cision d'orientation", "La suite donnÃ©e : complÃ©ter, visiter, instruire, rÃ©orienter ou classer"],
    ["Cadrage", "Fiche projet + matrice des risques + budget", "Le pÃ©rimÃ¨tre, les responsabilitÃ©s, les coÃ»ts et les limites"],
    ["Formalisation", "Convention adaptÃ©e ou lettre d'intention", "Les engagements rÃ©els avant toute communication publique"],
    ["Action", "Compte rendu, Ã©margement, PV de remise ou rÃ©ception", "Les preuves de ce qui s'est rÃ©ellement passÃ©"],
    ["Bilan", "Grille d'impact + reporting financeur si besoin", "Les rÃ©sultats vÃ©rifiables et les enseignements Ã  capitaliser"],
  ]);
}

function collectivityConventionSection() {
  return tableSection("Convention de coopÃ©ration territoriale", "La convention ne doit pas Ãªtre un simple symbole. Elle doit permettre Ã  la collectivitÃ© de savoir prÃ©cisÃ©ment ce qui est testÃ©, par qui, avec quelles limites et quels livrables.", [
    ["Clause", "Contenu Ã  prÃ©ciser", "Point de vigilance"],
    ["PÃ©rimÃ¨tre", "Quartier, commune, EPCI, type de biens ou thÃ©matique visÃ©e", "Ã‰viter un pÃ©rimÃ¨tre trop large au dÃ©marrage"],
    ["Objet", "Diagnostic, cartographie, mobilisation, expÃ©rimentation, accompagnement projet", "Ne pas transformer une phase exploratoire en engagement opÃ©rationnel"],
    ["Gouvernance", "RÃ©fÃ©rents, frÃ©quence des rÃ©unions, comptes rendus, dÃ©cisions attendues", "Identifier qui valide quoi avant communication"],
    ["DonnÃ©es", "Sources publiques, donnÃ©es transmises, rÃ¨gles de confidentialitÃ© et publication", "ProtÃ©ger les donnÃ©es sensibles et les biens privÃ©s"],
    ["Livrables", "Note d'opportunitÃ©, registre, carte, fiche projet, plan d'action, bilan", "DÃ©finir un livrable concret mÃªme si aucun projet n'est lancÃ©"],
    ["Communication", "Usage du nom, logos, photos, citations, calendrier de publication", "Aucun affichage public sans accord Ã©crit"],
  ]);
}

function collectivityDecisionMatrixSection() {
  return tableSection("DÃ©cisions Ã  prÃ©parer avec une collectivitÃ©", "Une collectivitÃ© doit pouvoir sortir d'un Ã©change avec une dÃ©cision simple : lancer un cadrage, cibler un pÃ©rimÃ¨tre, rÃ©unir les acteurs ou diffÃ©rer.", [
    ["DÃ©cision publique Ã  prÃ©parer", "Ce que TVF apporte", "PiÃ¨ce utile", "RÃ©sultat attendu de la rÃ©union"],
    ["Choisir un pÃ©rimÃ¨tre pilote", "Comparer quartier, rue, typologie de biens ou thÃ©matique prioritaire", "Fiche collectivitÃ©", "PÃ©rimÃ¨tre rÃ©aliste et interlocuteur dÃ©signÃ©"],
    ["Qualifier des biens ou ressources", "Proposer une mÃ©thode de statut : signalÃ©, qualifiÃ©, orientÃ©, classÃ©", "Protocole de qualification", "Liste de donnÃ©es et piÃ¨ces Ã  rÃ©unir"],
    ["Mobiliser les acteurs locaux", "Identifier propriÃ©taires, entreprises, associations, habitants et financeurs utiles", "Fiche comitÃ© de pilotage", "PremiÃ¨re composition d'un groupe de travail"],
    ["PrÃ©parer une coopÃ©ration", "DÃ©finir objet, durÃ©e, livrables, communication et rÃ¨gles de confidentialitÃ©", "Convention territoriale", "Projet de convention ou lettre d'intention"],
    ["Suivre l'impact", "DÃ©finir les indicateurs avant toute communication publique", "Grille d'impact", "Tableau de bord de suivi validÃ©"],
  ]);
}

function ownerConventionSection() {
  return tableSection("ModalitÃ©s de convention propriÃ©taire", "La convention doit sÃ©curiser le propriÃ©taire, TVF et les futurs usagers. Elle formalise un cadre d'Ã©tude ou d'usage sans ambiguÃ¯tÃ©.", [
    ["Sujet", "Ã€ cadrer", "Pourquoi c'est important"],
    ["PropriÃ©tÃ©", "Le propriÃ©taire conserve la pleine propriÃ©tÃ© du bien", "Ã‰viter toute confusion sur la maÃ®trise du bien"],
    ["AccÃ¨s", "Personnes autorisÃ©es, dates, conditions de visite, rÃ¨gles de sÃ©curitÃ©", "ProtÃ©ger les personnes et limiter la responsabilitÃ©"],
    ["Usage", "Usage envisagÃ© : Ã©tude, occupation temporaire, local associatif, atelier, logement solidaire", "Ne pas promettre un usage impossible ou non autorisÃ©"],
    ["DurÃ©e", "PÃ©riode d'Ã©tude, pÃ©riode d'usage, conditions de renouvellement ou d'arrÃªt", "Donner une visibilitÃ© claire aux parties"],
    ["Travaux", "Travaux exclus, travaux autorisÃ©s, responsabilitÃ©s, devis, assurances", "Ã‰viter tout chantier sans validation Ã©crite"],
    ["Restitution", "Ã‰tat de sortie, nettoyage, inventaire, documents remis", "PrÃ©server la valeur patrimoniale et la confiance"],
  ]);
}

function ownerReadinessMatrixSection() {
  return tableSection("Avant de proposer un bien", "Ce cadre de lecture aide le propriÃ©taire Ã  savoir si son dossier est prÃªt pour un premier Ã©change TVF.", [
    ["Question", "Pourquoi TVF la pose", "PiÃ¨ce ou rÃ©ponse utile", "Suite possible"],
    ["Qui peut autoriser l'Ã©tude ?", "TVF doit Ã©viter toute dÃ©marche sans personne habilitÃ©e", "IdentitÃ© du propriÃ©taire ou mandataire", "Accord de principe ou demande de prÃ©cision"],
    ["Quel est l'Ã©tat apparent ?", "La sÃ©curitÃ© et la faisabilitÃ© conditionnent tout le reste", "Photos, diagnostics disponibles, accÃ¨s, risques connus", "Visite autorisÃ©e, expertise Ã  prÃ©voir ou classement"],
    ["Quel usage est acceptable ?", "Un usage utile doit rester compatible avec la volontÃ© du propriÃ©taire", "Logement, local associatif, commerce, atelier, usage temporaire", "ScÃ©narios d'usage comparÃ©s"],
    ["Quelle durÃ©e peut Ãªtre envisagÃ©e ?", "La durÃ©e influence les investissements, travaux et responsabilitÃ©s", "DurÃ©e d'Ã©tude, occupation possible, conditions d'arrÃªt", "Convention courte, progressive ou reportÃ©e"],
    ["Quelles limites sont non nÃ©gociables ?", "Les rÃ¨gles doivent Ãªtre Ã©crites avant toute mobilisation", "AccÃ¨s, travaux interdits, communication, restitution", "Convention adaptÃ©e ou rÃ©orientation"],
  ]);
}

function enterpriseOperationalSection() {
  return tableSection("Cadre de contribution entreprise", "Une contribution entreprise doit Ãªtre utile, traÃ§able et compatible avec un projet. TVF ne transforme pas un surplus en visibilitÃ© automatique.", [
    ["Contribution", "Informations Ã  fournir", "Suite possible"],
    ["MatÃ©riaux", "CatÃ©gorie, quantitÃ©, dimensions, Ã©tat, photos, date limite, lieu de retrait", "Acceptation, refus motivÃ©, stockage ou affectation Ã  un projet"],
    ["CompÃ©tences", "MÃ©tier, disponibilitÃ©, pÃ©rimÃ¨tre, livrable possible, contraintes", "Mission ponctuelle, conseil, expertise ou mentorat"],
    ["Locaux", "Adresse, surface, Ã©tat, durÃ©e possible, accÃ¨s, charges, sÃ©curitÃ©", "Ã‰tude d'usage temporaire ou orientation vers un besoin associatif"],
    ["MÃ©cÃ©nat", "Objet soutenu, montant envisagÃ©, calendrier, critÃ¨res internes", "Instruction, convention, reporting et communication validÃ©e"],
    ["Logistique", "Transport, stockage, manutention, Ã©quipement, disponibilitÃ©", "Soutien Ã  une collecte, un chantier ou une opÃ©ration encadrÃ©e"],
  ]);
}

function enterpriseValueMatrixSection() {
  return tableSection("Ce que l'entreprise doit pouvoir valoriser", "L'intÃ©rÃªt d'une contribution n'est pas seulement de donner. C'est de prouver une action utile, traÃ§able et reliÃ©e au territoire.", [
    ["Objectif entreprise", "Condition TVF", "Preuve produite", "Communication possible"],
    ["RÃ©duire le gaspillage", "MatÃ©riaux rÃ©utilisables, dÃ©crits et affectables", "Bordereau, PV de remise, registre", "AprÃ¨s acceptation et affectation"],
    ["Structurer une dÃ©marche RSE", "Contribution reliÃ©e Ã  un besoin territorial", "Fiche contribution, compte rendu", "AprÃ¨s validation commune"],
    ["Mobiliser des compÃ©tences", "Mission courte, livrable clair, rÃ©fÃ©rent identifiÃ©", "Fiche mission ou convention", "AprÃ¨s rÃ©alisation ou bilan"],
    ["Mettre un local Ã  disposition", "DurÃ©e, accÃ¨s, charges, sÃ©curitÃ© et responsabilitÃ©s Ã©crits", "Convention de mise Ã  disposition", "Selon accord de communication"],
    ["Soutenir financiÃ¨rement", "Budget, objet, reporting et indicateurs dÃ©finis", "Convention mÃ©cÃ©nat ou plan de financement", "AprÃ¨s accord formalisÃ©"],
  ]);
}

function volunteerOperationalSection() {
  return tableSection("Cadre d'engagement citoyen", "Une mission bÃ©nÃ©vole doit Ãªtre simple, utile et sÃ©curisÃ©e. TVF doit Ã©viter les missions floues et les interventions improvisÃ©es.", [
    ["Ã‰tape", "Ce qui doit Ãªtre clair", "Document ou trace"],
    ["Inscription", "IdentitÃ©, commune, disponibilitÃ©, compÃ©tences, limites", "Fiche bÃ©nÃ©vole"],
    ["Mission", "Objectif, durÃ©e, lieu, rÃ©fÃ©rent, consignes", "Fiche mission bÃ©nÃ©vole"],
    ["SÃ©curitÃ©", "AccÃ¨s, risques, Ã©quipements, personnes autorisÃ©es", "Consignes sÃ©curitÃ© ou plan de prÃ©vention"],
    ["Action", "PrÃ©sences, horaires, tÃ¢ches rÃ©alisÃ©es, incidents Ã©ventuels", "Feuille d'Ã©margement et compte rendu"],
    ["Restitution", "Ce qui a Ã©tÃ© appris, ce qui reste Ã  faire, suites proposÃ©es", "Compte rendu terrain"],
  ]);
}

function volunteerMissionSelectorSection() {
  return tableSection("Choisir une mission adaptÃ©e", "Le bon engagement dÃ©pend du temps disponible, des compÃ©tences et du niveau d'encadrement possible.", [
    ["DisponibilitÃ©", "Mission adaptÃ©e", "Encadrement nÃ©cessaire", "Trace attendue"],
    ["Quelques minutes", "Signaler un lieu, une ressource ou un contact local", "Consignes de signalement", "Fiche signalement"],
    ["Quelques heures", "Aider Ã  documenter des sources publiques ou prÃ©parer une rÃ©union", "RÃ©fÃ©rent TVF", "Compte rendu court"],
    ["Une journÃ©e", "Participer Ã  une action terrain encadrÃ©e", "Plan de prÃ©vention, consignes, rÃ©fÃ©rent sur place", "Feuille d'Ã©margement"],
    ["RÃ©guliÃ¨rement", "Devenir relais local ou appui administratif", "Mission dÃ©finie, limites Ã©crites", "Fiche mission et suivi"],
    ["CompÃ©tence spÃ©cifique", "Apporter une expertise technique, juridique, communication ou bÃ¢timent", "PÃ©rimÃ¨tre et livrable prÃ©cis", "Note ou livrable datÃ©"],
  ]);
}

function financerOperationalSection() {
  return tableSection("Dossier financeur recevable", "Un financeur doit pouvoir distinguer une idÃ©e, un dossier instruit, une convention et un rÃ©sultat. TVF doit prÃ©parer cette lecture avant toute demande.", [
    ["Ã‰lÃ©ment", "Contenu attendu", "Document associÃ©"],
    ["Besoin", "Territoire, public concernÃ©, problÃ¨me traitÃ©, urgence ou opportunitÃ©", "Fiche projet"],
    ["Budget", "DÃ©penses, contributions en nature, cofinancements, reste Ã  financer", "Budget prÃ©visionnel + plan de financement"],
    ["Risque", "Juridique, technique, financier, humain, calendrier, communication", "Matrice des risques"],
    ["Cadre", "RÃ´les, responsabilitÃ©s, durÃ©e, conditions de communication", "Convention ou lettre d'intention"],
    ["Impact", "Indicateurs, mÃ©thode de calcul, limites, frÃ©quence de reporting", "Grille d'impact + reporting financeur"],
  ]);
}

function financerDueDiligenceSection() {
  return tableSection("Lecture financeur en 15 minutes", "Ce cadre de lecture permet Ã  un financeur ou mÃ©cÃ¨ne de savoir si un dossier TVF est assez mÃ»r pour Ãªtre Ã©tudiÃ©.", [
    ["Point de vÃ©rification", "Question Ã  poser", "RÃ©ponse attendue", "Document"],
    ["MaturitÃ©", "Le dossier est-il une idÃ©e, une instruction, une convention ou une rÃ©alisation ?", "Statut clair et datÃ©", "Fiche dÃ©cision"],
    ["Besoin", "Quel problÃ¨me territorial est traitÃ© ?", "Bien, public, territoire, urgence ou opportunitÃ©", "Fiche projet"],
    ["Budget", "Combien coÃ»te la phase demandÃ©e et que couvre-t-elle ?", "Postes, devis, contributions, reste Ã  financer", "Budget prÃ©visionnel"],
    ["Risque", "Quels sont les risques majeurs ?", "Juridique, technique, financier, humain, communication", "Matrice des risques"],
    ["Preuve", "Comment l'impact sera-t-il mesurÃ© ?", "Indicateurs, source, frÃ©quence, limites", "Grille d'impact"],
    ["Reporting", "Que recevra le financeur ?", "Compte rendu, justificatifs, indicateurs et bilan prudent", "Reporting financeur"],
  ]);
}

function partnerOfficialisationSection() {
  return tableSection("Statuts de coopÃ©ration", "Cette progression Ã©vite de prÃ©senter trop tÃ´t une relation comme un partenariat officiel.", [
    ["Statut", "DÃ©finition", "Ce qui peut Ãªtre communiquÃ©"],
    ["Contact exploratoire", "Premier Ã©change sans engagement", "Aucune annonce publique"],
    ["CoopÃ©ration en instruction", "Sujet identifiÃ©, piÃ¨ces en cours, faisabilitÃ© Ã  vÃ©rifier", "Mention interne uniquement"],
    ["Lettre d'intention", "VolontÃ© de travailler ensemble sur un pÃ©rimÃ¨tre limitÃ©", "Communication possible seulement si les deux parties valident"],
    ["Convention signÃ©e", "RÃ´les, durÃ©e, livrables, responsabilitÃ©s et communication formalisÃ©s", "Partenariat affichable selon les termes de la convention"],
    ["Bilan publiÃ©", "Action rÃ©alisÃ©e, preuves disponibles, indicateurs vÃ©rifiÃ©s", "RÃ©sultat communicable avec limites et sources"],
  ]);
}

function audienceSection() {
  return `<section class="section" ${sectionAttrs("Parcours par public", "parcours-publics")}><div class="container audience-grid"><article id="collectivite"><h3>CollectivitÃ©</h3><p>TVF peut aider Ã  prÃ©parer un diagnostic, identifier des biens ou ressources et structurer une expÃ©rimentation locale. La coopÃ©ration doit rester compatible avec les compÃ©tences, politiques publiques et procÃ©dures de la collectivitÃ©.</p></article><article id="proprietaire"><h3>PropriÃ©taire</h3><p>Un propriÃ©taire peut prÃ©senter un bien vacant ou dÃ©gradÃ©. TVF Ã©tudie alors l'Ã©tat du bien, les contraintes, les usages possibles et les conditions d'une convention adaptÃ©e.</p></article><article id="entreprise"><h3>Entreprise</h3><p>Une entreprise peut contribuer par des matÃ©riaux, du mÃ©cÃ©nat, des compÃ©tences, des locaux ou de la logistique. La contribution doit Ãªtre tracÃ©e et orientÃ©e vers un projet validÃ©.</p></article><article id="citoyen"><h3>Citoyen ou bÃ©nÃ©vole</h3><p>Un habitant peut signaler une situation, rejoindre une mission, participer Ã  un chantier encadrÃ© ou relayer les besoins de son territoire.</p></article></div></section>`;
}

function consentControl(id) {
  return `<label class="consent-field" for="${id}"><input id="${id}" name="consent" type="checkbox" value="true" data-summary-value="Oui"> J'accepte que Territoires Vivants France utilise ces informations pour rÃ©pondre Ã  ma demande, conformÃ©ment Ã  la <a href="${hrefFor("politique-confidentialite.html")}">politique de confidentialitÃ©</a>.</label>`;
}
function formSection() {
  return `<section class="section" ${sectionAttrs("PrÃ©parer une situation", "proposer")}><span class="anchor-target" id="signalement"></span><div class="container form-panel"><div><p class="section-kicker">Premier contact</p><h2>PrÃ©parer une situation</h2><p>PrÃ©parez une demande courte : profil, lieu, ressource, besoin et suite attendue. Le rÃ©sumÃ© pourra Ãªtre envoyÃ© Ã  TVF ou conservÃ©.</p></div><form data-prepare-form data-form-kind="situation" aria-describedby="preparation-note"><label class="hp-field" aria-hidden="true">Site web<input name="site" tabindex="-1" autocomplete="off"></label><label for="prep-profile">Votre profil</label><select id="prep-profile" name="profil"><option value="collectivite">CollectivitÃ©</option><option value="proprietaire">PropriÃ©taire</option><option value="entreprise">Entreprise</option><option value="association">Association</option><option value="citoyen">Citoyen</option></select><label for="prep-subject">Objet</label><input id="prep-subject" name="objet" type="text" autocomplete="off" placeholder="Ex. logement vacant, matÃ©riaux, partenariat"><label for="prep-message">Message</label><textarea id="prep-message" name="message" placeholder="DÃ©crivez le besoin, le lieu, les acteurs concernÃ©s et les dÃ©lais."></textarea><p class="form-note" id="preparation-note">Le rÃ©sumÃ© est prÃ©parÃ© localement. Vous pouvez ensuite l'envoyer Ã  TVF ou utiliser l'e-mail de secours.</p><p class="form-note" data-local-draft-status hidden role="status">Brouillon restaurÃ© depuis cet onglet. Vous pouvez le modifier, le prÃ©parer ou l'effacer.</p><p class="form-note" data-save-status hidden role="status">Brouillon sauvegardÃ© localement dans cet onglet.</p>${consentControl("prep-consent")}<button class="btn secondary" type="button" data-prepare-summary>CrÃ©er un rÃ©sumÃ©</button><a class="btn primary" href="mailto:${contact.email}" data-mailto-summary data-mailto-to="${contact.email}" data-mailto-subject="Demande TVF - situation Ã  qualifier" hidden>Ouvrir l'e-mail</a><button class="btn secondary" type="button" data-copy-summary hidden>Copier le rÃ©sumÃ©</button><button class="btn secondary" type="button" data-download-summary hidden>TÃ©lÃ©charger le rÃ©sumÃ©</button><button class="btn secondary" type="button" data-reset-form hidden>Effacer le brouillon</button><button class="btn primary" type="button" data-submit-form hidden>Envoyer Ã  TVF</button><p class="form-note" data-submit-status hidden role="status"></p><output class="form-summary" data-form-summary hidden aria-live="polite"></output><a class="btn secondary" href="${hrefFor("contact.html")}" data-transfer-summary>Passer par la page contact</a></form></div></section>`;
}

function contactSection() {
  return `<section class="section" ${sectionAttrs("Demander un rendez-vous", "contact-form")}><div class="container form-panel"><div><p class="section-kicker">Rendez-vous</p><h2>Demander un rendez-vous</h2><p>PrÃ©sentez votre demande en quelques Ã©lÃ©ments : profil, territoire, objet, piÃ¨ces disponibles et suite souhaitÃ©e. TVF peut ensuite vous rÃ©pondre par e-mail ou tÃ©lÃ©phone.</p></div><form data-prepare-form data-form-kind="rendez-vous" aria-describedby="contact-note"><label class="hp-field" aria-hidden="true">Site web<input name="site" tabindex="-1" autocomplete="off"></label><label for="contact-profile">Votre profil</label><select id="contact-profile" name="profil"><option value="">Choisir un profil</option><option value="collectivite">CollectivitÃ© / EPCI</option><option value="proprietaire">PropriÃ©taire</option><option value="entreprise">Entreprise</option><option value="association">Association</option><option value="benevole">BÃ©nÃ©vole / citoyen</option><option value="financeur">Financeur / mÃ©cÃ¨ne</option><option value="presse">Presse / institution</option></select><label for="contact-name">Nom / structure</label><input id="contact-name" name="nom" type="text" autocomplete="name" placeholder="Votre nom ou organisme"><label for="contact-email">E-mail</label><input id="contact-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="contact@exemple.fr"><label for="contact-phone">TÃ©lÃ©phone</label><input id="contact-phone" name="telephone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Votre numéro de téléphone"><label for="contact-location">Commune / territoire concernÃ©</label><input id="contact-location" name="territoire" type="text" autocomplete="address-level2" placeholder="Ex. Saint-Ã‰tienne, quartier, commune ou EPCI"><label for="contact-subject">Objet de la demande</label><input id="contact-subject" name="objet" type="text" autocomplete="off" placeholder="Ex. logement vacant, matÃ©riaux, friche, rendez-vous collectivitÃ©"><label for="contact-message">Message</label><textarea id="contact-message" name="message" autocomplete="off" placeholder="DÃ©crivez la situation, les piÃ¨ces disponibles, les acteurs connus et la suite souhaitÃ©e."></textarea><p class="form-note" id="contact-note">Votre rÃ©sumÃ© est prÃ©parÃ© dans le navigateur puis transmis Ã  TVF aprÃ¨s validation. L'e-mail reste disponible en solution de secours.</p><p class="form-note" data-draft-status hidden role="status">RÃ©sumÃ© rÃ©cupÃ©rÃ© depuis la page Agir avec nous. Relisez le message avant tout envoi officiel.</p><p class="form-note" data-local-draft-status hidden role="status">Brouillon restaurÃ© depuis cet onglet. Vous pouvez le modifier, le prÃ©parer ou l'effacer.</p><p class="form-note" data-save-status hidden role="status">Brouillon sauvegardÃ© localement dans cet onglet.</p>${consentControl("contact-consent")}<button class="btn primary" type="button" data-prepare-summary>PrÃ©parer l'envoi</button><a class="btn primary" href="mailto:${contact.email}" data-mailto-summary data-mailto-to="${contact.email}" data-mailto-subject="Demande de rendez-vous TVF" hidden>Ouvrir l'e-mail</a><button class="btn secondary" type="button" data-copy-summary hidden>Copier le rÃ©sumÃ©</button><button class="btn secondary" type="button" data-download-summary hidden>TÃ©lÃ©charger le rÃ©sumÃ©</button><button class="btn secondary" type="button" data-reset-form hidden>Effacer le brouillon</button><button class="btn primary" type="button" data-submit-form hidden>Envoyer Ã  TVF</button><p class="form-note" data-submit-status hidden role="status"></p><output class="form-summary" data-form-summary hidden aria-live="polite"></output></form></div></section>`;
}

function legalSection() {
  return `<section class="section" ${sectionAttrs("Mentions lÃ©gales", "mentions-legales-detail")}><div class="container legal"><h2>Cadre lÃ©gal du site</h2><h3>Ã‰diteur du site</h3><p><strong>Territoires Vivants France</strong><br>Nom du site : Territoires Vivants France<br>Adresse du site : <a href="https://www.territoiresvivantsfrance.fr" rel="noopener">www.territoiresvivantsfrance.fr</a><br>${official.status}<br>RNA : ${official.rna}<br>SIREN : ${official.siren}<br>SIRET du siÃ¨ge : ${official.siret}<br>${contact.address}<br>E-mail : <a href="mailto:${contact.email}">${contact.email}</a><br>TÃ©lÃ©phone : <a href="tel:${contact.phoneHref}">${contact.phone}</a></p><h3>Directeur de la publication</h3><p>Directeur de la publication : Edryan Rangoly, prÃ©sident fondateur de Territoires Vivants France.</p><h3>Responsables associatifs</h3><p>PrÃ©sident fondateur : Edryan Rangoly.<br>SecrÃ©taire et trÃ©sorier : M. Lambeau Jordan.</p><h3>RÃ©fÃ©rences administratives</h3><p>${official.receiptLabel}. DÃ©claration en date du ${official.declarationDate}. DÃ©cision prise le ${official.decisionDate}. RÃ©cÃ©pissÃ© dÃ©livrÃ© Ã  ${official.receiptPlace} le ${official.receiptDate} par ${official.authority}. SIREN : ${official.siren}. SIRET du siÃ¨ge : ${official.siret}. CatÃ©gorie juridique : ${official.legalCategory}. ActivitÃ© principale exercÃ©e (APE) : ${official.ape}. Appartenance au champ de lâ€™ESS : ${official.ess}. Entreprise active depuis le ${official.activeSince}. Informations issues de lâ€™avis de situation au rÃ©pertoire SIRENE Ã  la date du ${official.sireneDate}.</p><h3>Statuts</h3><p>Les statuts de Territoires Vivants France ont Ã©tÃ© Ã©tablis Ã  Saint-Ã‰tienne le 22 juin 2026. Ils prÃ©voient notamment une durÃ©e indÃ©terminÃ©e, un bureau composÃ© dâ€™un prÃ©sident, dâ€™un secrÃ©taire et dâ€™un trÃ©sorier, des ressources autorisÃ©es par la loi et une attribution de lâ€™actif net Ã  un organisme dâ€™intÃ©rÃªt gÃ©nÃ©ral ou Ã  objet similaire en cas de dissolution.</p><h3>HÃ©bergement</h3><p>Le site territoiresvivantsfrance.fr est hÃ©bergÃ© et dÃ©ployÃ© par <strong>Vercel Inc.</strong>, plateforme Vercel. Vercel fournit les services techniques dâ€™hÃ©bergement, de dÃ©ploiement et de diffusion du site. Site de lâ€™hÃ©bergeur : <a href="https://vercel.com" rel="noopener">https://vercel.com</a>. Les coordonnÃ©es postales et tÃ©lÃ©phoniques de lâ€™hÃ©bergeur doivent Ãªtre vÃ©rifiÃ©es Ã  partir des informations contractuelles du compte Vercel avant publication dâ€™une version dÃ©finitive des mentions.</p><h3>Prestataires techniques</h3><p>Le fonctionnement du site peut mobiliser plusieurs prestataires : Vercel pour lâ€™hÃ©bergement et le dÃ©ploiement, Supabase pour lâ€™enregistrement technique des demandes issues des formulaires lorsque le service est activÃ©, Brevo pour les notifications e-mail et accusÃ©s de rÃ©ception lorsque le service est configurÃ©, et GitHub pour la gestion du dÃ©pÃ´t de code et le dÃ©clenchement du dÃ©ploiement. Ces prestataires interviennent uniquement dans le cadre technique nÃ©cessaire au fonctionnement du site et au traitement des demandes.</p><h3>DonnÃ©es personnelles et RGPD</h3><p>TVF est responsable du traitement des donnÃ©es personnelles transmises via le site. Les formulaires et parcours prÃ©sentÃ©s servent Ã  prÃ©parer les informations utiles Ã  une demande : contact, signalement, proposition de bien, proposition de matÃ©riaux, partenariat ou demande de rendez-vous. Les donnÃ©es doivent Ãªtre traitÃ©es avec une finalitÃ© claire, une durÃ©e de conservation adaptÃ©e, un accÃ¨s limitÃ© aux personnes habilitÃ©es et un droit de contact pour les personnes concernÃ©es. La page <a href="politique-confidentialite.html">Politique de confidentialitÃ©</a> prÃ©cise les finalitÃ©s, les donnÃ©es concernÃ©es, les destinataires, les durÃ©es de conservation indicatives et les droits des personnes.</p><h3>DÃ©lÃ©guÃ© Ã  la protection des donnÃ©es</h3><p>TVF nâ€™a pas dÃ©signÃ© de dÃ©lÃ©guÃ© Ã  la protection des donnÃ©es Ã  ce stade. Toute demande relative aux donnÃ©es personnelles peut Ãªtre adressÃ©e Ã  <a href="mailto:${contact.email}">${contact.email}</a>.</p><h3>Cookies et traceurs</h3><p>Le site ne prÃ©voit pas, Ã  ce stade, de cookies publicitaires ou de traceurs de mesure dâ€™audience nÃ©cessitant un consentement prÃ©alable. Si un outil de mesure dâ€™audience, de publicitÃ©, de suivi social ou de remarketing est activÃ© ultÃ©rieurement, TVF devra mettre Ã  jour cette information et, lorsque nÃ©cessaire, recueillir le consentement de lâ€™utilisateur.</p><h3>CrÃ©dits et propriÃ©tÃ© intellectuelle</h3><p>Le logo, les textes, documents, visuels, gabarits et Ã©lÃ©ments graphiques associÃ©s Ã  Territoires Vivants France sont protÃ©gÃ©s. Toute rÃ©utilisation, modification, reproduction ou diffusion doit faire lâ€™objet dâ€™une autorisation prÃ©alable. Les photographies et illustrations utilisÃ©es sur le site doivent provenir de sources autorisÃ©es : images fournies par TVF, images libres de droits, licences adaptÃ©es ou crÃ©ations spÃ©cifiquement produites pour TVF.</p><h3>ResponsabilitÃ© Ã©ditoriale</h3><p>Les contenus du site prÃ©sentent une dÃ©marche associative, des mÃ©thodes et des documents de travail. Ils ne constituent pas un conseil juridique, technique, financier ou administratif personnalisÃ©. Chaque projet doit Ãªtre vÃ©rifiÃ© et adaptÃ© avec les interlocuteurs compÃ©tents, les propriÃ©taires, les collectivitÃ©s, les professionnels qualifiÃ©s et les autoritÃ©s concernÃ©es lorsque nÃ©cessaire.</p><h3>Dons, fiscalitÃ© et reÃ§us</h3><p>Les informations relatives aux dons, reÃ§us fiscaux, avantages fiscaux ou dispositifs de mÃ©cÃ©nat seront prÃ©cisÃ©es selon le cadre lÃ©gal applicable Ã  lâ€™association et uniquement aprÃ¨s vÃ©rification des conditions dâ€™Ã©ligibilitÃ©. Aucune rÃ©duction fiscale ne doit Ãªtre considÃ©rÃ©e comme acquise sans confirmation officielle.</p><h3>Signalement, rectification et contact</h3><p>Toute demande de correction, signalement de contenu, demande relative aux droits dâ€™auteur, demande RGPD ou question sur les mentions lÃ©gales peut Ãªtre adressÃ©e Ã  <a href="mailto:${contact.email}">${contact.email}</a>.</p><p><strong>DerniÃ¨re mise Ã  jour :</strong> juillet 2026.</p></div></section>`;
}

function iconFor(text) {
  const t = text.toLowerCase();
  if (t.includes("logement") || t.includes("habitat") || t.includes("propri")) return "H";
  if (t.includes("commerce")) return "C";
  if (t.includes("mat")) return "R";
  if (t.includes("friche") || t.includes("terrain")) return "F";
  if (t.includes("solid") || t.includes("bÃ©nÃ©") || t.includes("citoy")) return "S";
  if (t.includes("collect")) return "T";
  if (t.includes("entreprise")) return "E";
  if (t.includes("finance")) return "â‚¬";
  return "TVF";
}

function pageUrl(page) {
  return page.file === "index.html" ? `${site.url}/` : `${site.url}/${page.file.replace(/\.html$/, "")}`;
}

function pageByFile(file) {
  return pages.find((page) => page.file === file);
}

function breadcrumbTrail(page) {
  if (page.file === "index.html") return [];

  const parents = {
    "notre-methode.html": [["Nos actions", "nos-actions.html"]],
    "collectivites.html": [["Agir", "agir-avec-nous.html"]],
    "proprietaires.html": [["Agir", "agir-avec-nous.html"]],
    "entreprises.html": [["Agir", "agir-avec-nous.html"]],
    "benevoles-citoyens.html": [["Agir", "agir-avec-nous.html"]],
    "financeurs-mecenes.html": [["Agir", "agir-avec-nous.html"]],
    "saint-etienne.html": [["Observatoire", "observatoire.html"]],
    "impact.html": [["Observatoire", "observatoire.html"]],
    "kit-media.html": [["Documents", "documents.html"]],
    "mentions-legales.html": [["Transparence", "transparence.html"]],
    "politique-confidentialite.html": [["Mentions lÃ©gales", "mentions-legales.html"]],
  };

  return [["Accueil", "index.html"], ...(parents[page.file] || []), [page.title, page.file]];
}

function breadcrumbNav(page) {
  const items = breadcrumbTrail(page);
  if (!items.length) return "";

  return `<nav class="breadcrumbs" aria-label="Fil d'Ariane"><ol>${items
    .map(([label, href], index) => {
      const isLast = index === items.length - 1;
      return `<li>${isLast ? `<span aria-current="page">${label}</span>` : `<a href="${hrefFor(href)}">${label}</a>`}</li>`;
    })
    .join("")}</ol></nav>`;
}

function isDownloadableDocumentHref(href) {
  if (!href) return false;
  const [target] = href.split(/(?=[#?])/);
  return target === "documents/TVF-kit-formulaires-conventions-prets-a-utiliser.zip" || target.startsWith("documents/kit-formulaires-conventions-tvf/");
}

function isPrivateDocumentHref(href) {
  if (!href) return false;
  const [target] = href.split(/(?=[#?])/);
  if (target === "documents.html" || target === "documents" || isDownloadableDocumentHref(href)) return true;
  return target.startsWith("documents/") || target.startsWith("output/") || /\.pdf$/i.test(target);
}

function hrefFor(href) {
  if (!href || href.startsWith("#") || /^[a-z]+:/i.test(href) || href.startsWith("assets/")) return href;
  if (isPrivateDocumentHref(href)) return "contact";
  const [target, hash] = href.split("#");
  const clean = target === "index.html" ? "/" : target.endsWith(".html") ? target.replace(/\.html$/, "") : target;
  return `${clean}${hash ? `#${hash}` : ""}`;
}

function imageAttrs(src) {
  const size = imageSizes[src];
  return size ? `width="${size[0]}" height="${size[1]}"` : "";
}

function assetUrl(src) {
  return /^[a-z]+:/i.test(src) ? src : `${site.url}/${String(src).replace(/^\/+/, "")}`;
}

function imageObjectFor(page) {
  const src = page.heroImage || "assets/logo-territoires-vivants-france.png";
  const size = imageSizes[src];
  return {
    "@type": "ImageObject",
    url: assetUrl(src),
    ...(size ? { width: size[0], height: size[1] } : {}),
    caption: `${page.title} - ${site.name}`,
  };
}

function textFromHtml(value) {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function faqItemsFor(page) {
  const html = page.sections.join("\n");
  return [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((match) => ({
    question: textFromHtml(match[1]),
    answer: textFromHtml(match[2]),
  }));
}

function jsonLd(page) {
  const url = pageUrl(page);
  const graph = [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/assets/logo-territoires-vivants-france.png`,
      email: contact.email,
      telephone: contact.phoneHref,
      sameAs: [socialLinks.facebook, socialLinks.instagram, socialLinks.whatsapp],
      address: {
        "@type": "PostalAddress",
        streetAddress: "25 rue Ã‰lise Gervais",
        postalCode: "42000",
        addressLocality: "Saint-Ã‰tienne",
        addressCountry: "FR",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "fr-FR",
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: `${page.title} | ${site.name}`,
      description: page.meta,
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#organization` },
      primaryImageOfPage: imageObjectFor(page),
      dateModified: site.lastModified,
      inLanguage: "fr-FR",
    },
  ];

  const trail = breadcrumbTrail(page);
  if (trail.length) {
    graph[2].breadcrumb = { "@id": `${url}#breadcrumb` };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: trail.map(([label, href], index) => {
        const targetPage = pageByFile(href);
        return {
          "@type": "ListItem",
          position: index + 1,
          name: label,
          item: targetPage ? pageUrl(targetPage) : `${site.url}/${href.replace(/\.html$/, "")}`,
        };
      }),
    });
  }

  const faqItems = faqItemsFor(page);
  if (faqItems.length) {
    graph[2].mainEntity = { "@id": `${url}#faq` };
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
}

function ctaBandFor(page) {
  const skipCta = new Set(["contact.html", "mentions-legales.html", "politique-confidentialite.html"]);
  if (skipCta.has(page.file)) return "";
  const map = {
    "index.html": ["PremiÃ¨re Ã©tape", "Vous voulez savoir par oÃ¹ commencer ?", "Choisissez votre profil et prÃ©parez une premiÃ¨re demande lisible en quelques minutes.", [["Choisir mon parcours", "agir-avec-nous.html"], ["Demander un Ã©change", "contact.html"]]],
    "contact.html": ["Contact direct", "Votre demande est prÃªte Ã  Ãªtre envoyÃ©e ?", `Envoyez le rÃ©sumÃ© prÃ©parÃ© Ã  ${contact.email} ou appelez le ${contact.phone}.`, [["Ã‰crire Ã  TVF", `mailto:${contact.email}`]]],
    "documents.html": ["Documents", "Vous ne savez pas quel modÃ¨le choisir ?", "Commencez par les documents essentiels ou demandez une orientation avant de remplir un dossier complet.", [["Demander une orientation", "contact.html"], ["Voir les essentiels", "#les-documents-essentiels"]]],
    "saint-etienne.html": ["Territoire pilote", "Vous Ãªtes acteur Ã  Saint-Ã‰tienne ?", "PrÃ©sentez un bien, une ressource, un besoin public ou une coopÃ©ration possible pour alimenter le pilote.", [["PrÃ©senter une situation", "contact.html"]]],
    "observatoire.html": ["Signalement", "Vous connaissez un lieu ou une ressource Ã  qualifier ?", "Transmettez une information factuelle : TVF la traitera comme un signalement, pas comme un projet automatique.", [["Signaler une situation", "agir-avec-nous.html#signalement"], ["Voir la mÃ©thode", "notre-methode.html"]]],
    "impact.html": ["Preuve", "Vous souhaitez soutenir TVF avec un suivi clair ?", "Appuyez-vous sur la grille d'impact, le reporting et les statuts de preuve avant toute annonce.", [["Voir les financeurs", "financeurs-mecenes.html"], ["Demander la grille", "contact.html"]]],
    "collectivites.html": ["Territoire partenaire", "Votre collectivitÃ© veut tester un pÃ©rimÃ¨tre pilote ?", "PrÃ©parez une fiche collectivitÃ© avec le besoin public, les donnÃ©es disponibles et la dÃ©cision attendue.", [["Demander un rendez-vous", "contact.html"]]],
    "proprietaires.html": ["Bien inutilisÃ©", "Vous souhaitez Ã©tudier un bien sans engagement prÃ©maturÃ© ?", "PrÃ©sentez le bien, son Ã©tat, vos intentions et les limites Ã  respecter.", [["Demander un Ã©change", "contact.html"]]],
    "entreprises.html": ["Contribution", "Votre entreprise peut apporter une ressource utile ?", "DÃ©crivez les matÃ©riaux, locaux, compÃ©tences ou soutiens disponibles pour vÃ©rifier leur affectation possible.", [["Contacter TVF", "contact.html"]]],
    "benevoles-citoyens.html": ["Engagement", "Vous voulez aider sans improvisation ?", "Indiquez votre territoire, vos disponibilitÃ©s et le type de mission que vous pouvez rÃ©aliser.", [["Nous contacter", "contact.html"]]],
    "financeurs-mecenes.html": ["Soutien", "Vous souhaitez financer une dÃ©marche vÃ©rifiable ?", "Demandez un Ã©change sur un dossier instruit, avec budget, risques, indicateurs et reporting.", [["Contacter TVF", "contact.html"]]],
    "partenaires.html": ["CoopÃ©ration", "Vous envisagez une coopÃ©ration avec TVF ?", "Avant toute communication, clarifions le pÃ©rimÃ¨tre, les responsabilitÃ©s, la durÃ©e et les rÃ¨gles d'officialisation.", [["Contacter TVF", "contact.html"]]],
  };
  const [kicker, title, text, actions] = map[page.file] || ["Passer Ã  l'Ã©tape suivante", "Vous avez un bien, une ressource ou un besoin territorial ?", "PrÃ©sentez la situation Ã  TVF pour prÃ©parer un premier Ã©change clair et utile.", [["Agir avec nous", "agir-avec-nous.html"], ["Nous contacter", "contact.html"]]];
  return `<section class="cta-band"><div class="container cta-band-inner"><div><p class="section-kicker">${kicker}</p><h3>${title}</h3><p class="section-lead">${text}</p></div><div class="cta-band-actions">${actions.slice(0, 1)
    .map(([label, href]) => `<a class="btn primary" href="${hrefFor(href)}">${label}</a>`)
    .join("")}</div></div></section>`;
}

function institutionalNarrativeFor(page) {
  const narratives = {
    "index.html": [
      "Un portail de coopÃ©ration territoriale",
      "Territoires Vivants France se positionne comme un outil d'intÃ©rÃªt gÃ©nÃ©ral destinÃ© Ã  relier des situations aujourd'hui dispersÃ©es : biens vacants, ressources inutilisÃ©es, besoins locaux, compÃ©tences techniques et capacitÃ©s de financement. Le site doit Ãªtre lu comme une porte d'entrÃ©e vers une mÃ©thode de travail, pas comme une simple vitrine associative.",
      "La dÃ©marche proposÃ©e repose sur une exigence constante : qualifier avant d'annoncer, conventionner avant d'agir et documenter avant de publier un impact. Cette posture permet de dialoguer avec les collectivitÃ©s, les propriÃ©taires, les entreprises et les financeurs dans un cadre sÃ©rieux, comprÃ©hensible et vÃ©rifiable."
    ],
    "qui-sommes-nous.html": [
      "Une association nationale en structuration",
      "TVF porte une ambition nationale tout en assumant une Ã©tape de construction progressive. Son rÃ´le n'est pas de se substituer aux politiques publiques, mais de crÃ©er les conditions opÃ©rationnelles d'une coopÃ©ration entre acteurs qui, trop souvent, ne disposent pas du mÃªme langage, du mÃªme calendrier ou des mÃªmes outils.",
      "L'association doit donc avancer avec une double exigence : une vision forte pour la revitalisation des territoires et une mÃ©thode prudente, documentÃ©e, compatible avec les responsabilitÃ©s publiques, privÃ©es et associatives."
    ],
    "nos-actions.html": [
      "Des actions conÃ§ues pour produire des dÃ©cisions",
      "Les actions de TVF ne sont pas prÃ©sentÃ©es comme des promesses isolÃ©es. Elles constituent des cadres d'intervention permettant de transformer une situation bloquÃ©e en dossier lisible : un besoin identifiÃ©, un acteur responsable, des ressources mobilisables, des contraintes connues et une suite formalisable.",
      "Cette approche donne aux collectivitÃ©s, entreprises, propriÃ©taires et financeurs une base commune pour arbitrer, prioriser et engager une coopÃ©ration sans confusion entre intention, projet en instruction et action rÃ©alisÃ©e."
    ],
    "nos-poles.html": [
      "Une organisation mÃ©tier au service d'une chaÃ®ne complÃ¨te",
      "Les cinq pÃ´les ne sont pas de simples catÃ©gories de communication. Ils structurent les compÃ©tences nÃ©cessaires Ã  une revitalisation territoriale complÃ¨te : identifier un bien, qualifier son usage, mobiliser les matÃ©riaux, sÃ©curiser la participation humaine et prÃ©parer une remise en usage durable.",
      "Chaque pÃ´le permet d'isoler un enjeu technique ou social, tout en restant reliÃ© aux autres. C'est cette articulation qui donne Ã  TVF sa valeur : une capacitÃ© Ã  coordonner plutÃ´t qu'Ã  additionner des interventions dispersÃ©es."
    ],
    "observatoire.html": [
      "Une observation au service de la dÃ©cision publique et territoriale",
      "L'observatoire TVF vise Ã  transformer des informations Ã©parses en donnÃ©es exploitables. Il ne s'agit pas d'exposer des biens ou de publier des signalements bruts, mais de construire une lecture territoriale utile Ã  la priorisation, au dialogue et Ã  l'instruction de dossiers.",
      "Cette logique suppose un haut niveau de prudence : sources citÃ©es, statuts de vÃ©rification, respect des propriÃ©taires, protection des donnÃ©es sensibles et distinction claire entre information publique, donnÃ©e rÃ©servÃ©e et dÃ©cision interne."
    ],
    "saint-etienne.html": [
      "Saint-Ã‰tienne comme premiÃ¨re dÃ©monstration territoriale",
      "Le territoire stÃ©phanois constitue un terrain cohÃ©rent pour tester la mÃ©thode TVF : patrimoine existant, enjeux de centre-ville, reconversion, habitat ancien, Ã©conomie circulaire et mobilisation d'acteurs locaux. L'objectif n'est pas d'afficher des rÃ©sultats prÃ©maturÃ©s, mais de construire un pilote crÃ©dible.",
      "Ce pilote doit permettre de produire des dossiers courts, des conventions adaptÃ©es, des indicateurs suivis et une mÃ©thode rÃ©plicable dans d'autres territoires lorsque les conditions de gouvernance, de financement et de partenariat seront rÃ©unies."
    ],
    "collectivites.html": [
      "Un appui de structuration pour les territoires",
      "Une collectivitÃ© confrontÃ©e Ã  la vacance, aux friches, aux commerces fermÃ©s ou aux ressources inutilisÃ©es a souvent besoin d'un cadre de coordination plus que d'un dispositif supplÃ©mentaire. TVF propose une mÃ©thode pour relier diagnostic, acteurs, ressources, usages possibles et suivi d'impact.",
      "La coopÃ©ration doit toujours rester compatible avec les compÃ©tences de la collectivitÃ©, ses politiques publiques, ses procÃ©dures internes et ses rÃ¨gles de communication. C'est cette rigueur qui permet d'envisager une expÃ©rimentation locale crÃ©dible."
    ],
    "proprietaires.html": [
      "Un cadre respectueux de la propriÃ©tÃ© privÃ©e",
      "TVF s'adresse aux propriÃ©taires qui souhaitent Ã©tudier une solution pour un bien vacant, dÃ©gradÃ© ou sous-utilisÃ©, sans perdre la maÃ®trise de leur patrimoine. La premiÃ¨re Ã©tape reste une phase d'Ã©tude : comprendre l'Ã©tat du bien, les contraintes, les usages envisageables et les conditions d'une coopÃ©ration Ã©ventuelle.",
      "Aucune intervention sÃ©rieuse ne peut Ãªtre engagÃ©e sans autorisation, convention, assurance, rÃ¨gles d'accÃ¨s et responsabilitÃ©s clairement dÃ©finies. Cette sÃ©curisation protÃ¨ge Ã  la fois le propriÃ©taire, TVF, les partenaires et les futurs usagers."
    ],
    "entreprises.html": [
      "Une contribution Ã©conomique utile et traÃ§able",
      "Les entreprises peuvent jouer un rÃ´le dÃ©cisif dans la revitalisation territoriale : matÃ©riaux, Ã©quipements, logistique, compÃ©tences, mÃ©cÃ©nat, locaux ou soutien Ã  l'insertion. TVF doit transformer ces apports en contributions utiles, affectÃ©es Ã  un besoin rÃ©el et documentÃ©es.",
      "La valeur du partenariat ne repose pas sur une visibilitÃ© immÃ©diate, mais sur une preuve d'utilitÃ© territoriale : ressource qualifiÃ©e, destination validÃ©e, convention lorsque nÃ©cessaire et restitution claire de la contribution."
    ],
    "financeurs-mecenes.html": [
      "Un financement adossÃ© Ã  des dossiers instruits",
      "TVF doit offrir aux financeurs une lecture claire des projets : besoin territorial, phase financÃ©e, budget, risques, indicateurs et conditions de suivi. Cette exigence Ã©vite les promesses gÃ©nÃ©rales et permet de distinguer objectif, engagement, convention et rÃ©sultat.",
      "Le mÃ©cÃ©nat, les subventions, les contributions privÃ©es ou les financements solidaires n'ont de sens que s'ils soutiennent des objets prÃ©cis, suivis et compatibles avec l'intÃ©rÃªt gÃ©nÃ©ral poursuivi par l'association."
    ],
    "partenaires.html": [
      "Des partenariats fondÃ©s sur un cadre Ã©crit",
      "TVF distingue clairement le contact exploratoire, la coopÃ©ration en instruction et le partenariat officialisÃ©. Cette progression protÃ¨ge la crÃ©dibilitÃ© de l'association et Ã©vite toute confusion sur les rÃ´les, les engagements ou l'utilisation publique d'un nom ou d'un logo.",
      "Un partenariat institutionnel ou Ã©conomique doit prÃ©ciser le pÃ©rimÃ¨tre, les responsabilitÃ©s, la durÃ©e, les rÃ¨gles de communication, les livrables attendus et les conditions de suivi."
    ],
    "notre-methode.html": [
      "Une mÃ©thode avant tout opÃ©rationnelle",
      "La mÃ©thode TVF repose sur une conviction simple : un territoire ne manque pas toujours d'idÃ©es, mais souvent d'un cadre pour relier le bon bien, le bon usage, les bons acteurs et les bonnes ressources. La mÃ©thode sert Ã  transformer cette complexitÃ© en dÃ©cisions successives.",
      "Elle organise le passage du signalement Ã  l'instruction, de l'instruction Ã  la convention, puis de l'action au suivi d'impact. Cette chaÃ®ne documentaire est essentielle pour inspirer confiance aux institutions et aux financeurs."
    ],
    "impact.html": [
      "Une mesure d'impact fondÃ©e sur la preuve",
      "TVF ne doit pas confondre ambition et rÃ©sultat. Les indicateurs prÃ©sentÃ©s doivent distinguer les objectifs, les dossiers qualifiÃ©s, les conventions signÃ©es, les actions rÃ©alisÃ©es et les impacts vÃ©rifiÃ©s. Cette discipline est indispensable pour dialoguer avec des collectivitÃ©s, financeurs et journalistes.",
      "La mesure d'impact doit Ãªtre progressive, sourcÃ©e et datÃ©e. Elle permet de rendre compte sans surpromettre et de construire une crÃ©dibilitÃ© durable."
    ],
    "gouvernance.html": [
      "Une gouvernance lisible pour sÃ©curiser les dÃ©cisions",
      "La crÃ©dibilitÃ© de TVF dÃ©pend autant de sa mission que de sa capacitÃ© Ã  dÃ©cider proprement. Les critÃ¨res de sÃ©lection, les responsabilitÃ©s, les preuves, les conflits d'intÃ©rÃªts potentiels et les rÃ¨gles de communication doivent Ãªtre documentÃ©s.",
      "Cette gouvernance donne aux collectivitÃ©s, entreprises et financeurs un cadre de confiance avant toute coopÃ©ration formalisÃ©e."
    ],
  };

  const item = narratives[page.file];
  if (!item) return "";
  const [title, first, second] = item;
  return `<section class="institutional-narrative"><div class="container institutional-narrative-inner"><p class="section-kicker">Lecture institutionnelle</p><h2>${title}</h2><div><p>${first}</p><p>${second}</p></div></div></section>`;
}

function quickBriefFor(page) {
  const briefs = {
    "index.html": ["Positionnement", "TVF coordonne la remise en usage de biens, lieux et ressources inutilisÃ©s Ã  partir d'un cadre de coopÃ©ration territorial.", "Qualifier le profil, le territoire et le sujet Ã  instruire.", "Dossier TVF", "agir-avec-nous.html"],
    "nos-actions.html": ["Cadre d'intervention", "Les actions structurent les principaux leviers : habitat, commerce, matÃ©riaux, friches, insertion et financement.", "Orienter le dossier vers le levier prioritaire.", "Fiche projet", "contact.html"],
    "nos-poles.html": ["Organisation opÃ©rationnelle", "Les cinq pÃ´les donnent une lecture professionnelle des compÃ©tences mobilisables sur un dossier.", "Identifier le pÃ´le pilote et les pÃ´les associÃ©s.", "Grille d'instruction", "nos-actions.html"],
    "observatoire.html": ["Observation territoriale", "L'observatoire rassemble donnÃ©es publiques, signalements qualifiÃ©s et dÃ©cisions internes sans exposer d'informations sensibles.", "Documenter une situation factuelle.", "Fiche signalement", "agir-avec-nous.html#signalement"],
    "agir-avec-nous.html": ["Parcours d'engagement", "Chaque contribution doit Ãªtre reliÃ©e Ã  un besoin, un territoire, un cadre et une suite identifiable.", "PrÃ©senter le profil et la contribution envisagÃ©e.", "Fiche signalement", "#proposer"],
    "saint-etienne.html": ["Territoire pilote", "Saint-Ã‰tienne sert de socle d'expÃ©rimentation pour Ã©prouver la mÃ©thode TVF sur des dossiers concrets et vÃ©rifiables.", "Proposer un bien, une ressource ou un besoin local.", "Dossier Saint-Ã‰tienne", "documents/dossier-territorial-saint-etienne.md"],
    "contact.html": ["Relation institutionnelle", "La prise de contact doit permettre d'identifier le profil, le territoire, l'objet et le niveau de maturitÃ© du dossier.", "Transmettre les Ã©lÃ©ments utiles au premier cadrage.", "Fiche adaptÃ©e au profil", "#contact-form"],
    "documents.html": ["Base documentaire", "Les supports cadrent les Ã©changes, les conventions, les dÃ©cisions et les preuves avant toute action publique.", "SÃ©lectionner le pack adaptÃ© au rendez-vous.", "Dossier TVF", "#les-documents-essentiels"],
    "impact.html": ["Suivi d'impact", "Les indicateurs distinguent objectifs, dossiers instruits, conventions et rÃ©sultats vÃ©rifiÃ©s.", "Lire les chiffres avec leur source et leur statut.", "Grille d'impact", "documents/grille-impact.md"],
    "collectivites.html": ["Territoires partenaires", "Le cadre collectivitÃ© articule diagnostic, pÃ©rimÃ¨tre, gouvernance, convention et suivi.", "PrÃ©parer un premier pÃ©rimÃ¨tre de coopÃ©ration.", "Fiche collectivitÃ©", "documents/fiche-collectivite.md"],
    "proprietaires.html": ["Biens privÃ©s", "Un bien peut Ãªtre Ã©tudiÃ© sans engagement automatique, avec un cadre respectueux de la propriÃ©tÃ© et des responsabilitÃ©s.", "DÃ©crire le bien, ses contraintes et les usages envisageables.", "Fiche propriÃ©taire", "documents/fiche-proprietaire.md"],
    "entreprises.html": ["Contribution Ã©conomique", "MatÃ©riaux, locaux, compÃ©tences ou mÃ©cÃ©nat doivent Ãªtre qualifiÃ©s, traÃ§ables et affectÃ©s Ã  un besoin rÃ©el.", "PrÃ©senter la ressource et ses conditions de mobilisation.", "Fiche entreprise", "documents/fiche-entreprise.md"],
    "benevoles-citoyens.html": ["Mobilisation citoyenne", "L'engagement s'organise autour de missions utiles, sÃ©curisÃ©es, limitÃ©es et documentÃ©es.", "Choisir une mission compatible avec le temps et les compÃ©tences disponibles.", "Fiche bÃ©nÃ©vole", "documents/fiche-benevole.md"],
    "financeurs-mecenes.html": ["Financement responsable", "Un soutien doit s'appuyer sur un projet instruit, un budget, des risques identifiÃ©s et un reporting vÃ©rifiable.", "Demander une lecture financeur du dossier.", "Plan de financement", "documents/plan-financement-territorial.md"],
    "partenaires.html": ["CoopÃ©ration", "Un partenariat TVF repose sur un pÃ©rimÃ¨tre Ã©crit, des responsabilitÃ©s, une durÃ©e et une communication validÃ©e.", "Qualifier la forme de coopÃ©ration possible.", "Fiche partenaire", "documents/fiche-partenaire-potentiel.md"],
    "notre-methode.html": ["MÃ©thodologie", "La mÃ©thode transforme un signalement ou une proposition en dÃ©cision documentÃ©e, conventionnÃ©e ou classÃ©e.", "Suivre les Ã©tapes de qualification et de dÃ©cision.", "Grille d'instruction", "documents/grille-instruction-dossier.md"],
    "qui-sommes-nous.html": ["IdentitÃ©", "TVF porte une mission de coopÃ©ration nationale au service des territoires, des propriÃ©taires et des ressources inutilisÃ©es.", "Lire la mÃ©thode ou engager un Ã©change institutionnel.", "Dossier TVF", "documents/dossier-presentation-tvf.md"],
    "gouvernance.html": ["Gouvernance", "Les dÃ©cisions doivent Ãªtre tracÃ©es, argumentÃ©es et compatibles avec l'objet statutaire de l'association.", "VÃ©rifier le cadre avant tout engagement.", "Charte Ã©thique", "documents/charte-ethique.md"],
    "transparence.html": ["Transparence", "La communication distingue informations Ã©tablies, dossiers en instruction, objectifs et rÃ©sultats vÃ©rifiÃ©s.", "Appuyer toute annonce sur une preuve ou un statut clair.", "Registre dÃ©cisions", "documents/registre-suivi-decisions.md"],
    "faq.html": ["Questions clÃ©s", "Les rÃ©ponses orientent vers les pages, documents et interlocuteurs utiles sans multiplier les dÃ©tours.", "Rechercher par profil ou passer au contact.", "Documents essentiels", "documents.html#les-documents-essentiels"],
    "kit-media.html": ["Communication", "Le kit mÃ©dia fixe les mots, visuels et limites de communication publique autour de TVF.", "Utiliser les Ã©lÃ©ments validÃ©s pour toute prÃ©sentation.", "Pitch officiel", "documents/pitch-officiel-tvf.md"],
    "mentions-legales.html": ["Cadre lÃ©gal", "Les informations administratives publiques, les responsabilitÃ©s et les mentions d'hÃ©bergement sont centralisÃ©es ici.", "Contacter TVF pour toute prÃ©cision.", "Mentions", "contact.html"],
    "politique-confidentialite.html": ["DonnÃ©es personnelles", "La politique prÃ©cise les finalitÃ©s, donnÃ©es concernÃ©es, durÃ©es indicatives, destinataires et droits des personnes.", "Adresser toute demande RGPD au contact officiel.", "Mentions lÃ©gales", "mentions-legales.html"],
  };

  const brief = briefs[page.file];
  if (!brief) return "";

  const [label, objective, action, documentName, href] = brief;
  return `<aside class="quick-brief institutional-brief" aria-label="SynthÃ¨se institutionnelle"><div class="container quick-brief-grid"><div><p class="section-kicker">SynthÃ¨se</p><strong>${label}</strong></div><p><span>Enjeu</span>${objective}</p><p><span>Suite</span>${action}</p><p><span>RÃ©fÃ©rence</span><a href="${hrefFor(href)}">${documentName}</a></p></div></aside>`;
}

function decisionPanelFor(page) {
  const panels = {
    "index.html": {
      kicker: "Orientation",
      title: "Une porte d'entrÃ©e vers la coopÃ©ration territoriale.",
      text: "La page d'accueil prÃ©sente TVF comme une plateforme nationale capable de qualifier un besoin, d'orienter les acteurs et de prÃ©parer les premiers cadres de coopÃ©ration.",
      action: ["Engager une dÃ©marche", "agir-avec-nous.html"],
      items: [
        ["Mission", "Coordonner biens vacants, ressources inutilisÃ©es et acteurs territoriaux autour d'usages utiles."],
        ["Publics", "CollectivitÃ©s, propriÃ©taires, entreprises, bÃ©nÃ©voles, financeurs, associations et citoyens."],
        ["Suite", "Un premier Ã©change permet de qualifier le sujet, le territoire, les piÃ¨ces disponibles et le niveau de maturitÃ©."],
      ],
    },
    "nos-actions.html": {
      kicker: "Intervention",
      title: "Des leviers opÃ©rationnels reliÃ©s Ã  des livrables institutionnels.",
      text: "Chaque action est pensÃ©e comme un cadre d'instruction : identifier un problÃ¨me, qualifier les contraintes, formaliser les responsabilitÃ©s et produire une dÃ©cision exploitable.",
      action: ["PrÃ©parer une fiche projet", "documents/fiche-projet.md"],
      items: [
        ["Diagnostic", "Localiser le bien, la ressource ou le besoin qui bloque une dynamique territoriale."],
        ["Qualification", "Croiser acteurs, contraintes, usages possibles, risques et preuves disponibles."],
        ["DÃ©cision", "Aboutir Ã  une fiche, un scÃ©nario, une convention, un classement ou un indicateur."],
      ],
    },
    "nos-poles.html": {
      kicker: "Organisation",
      title: "Cinq pÃ´les pour structurer une chaÃ®ne complÃ¨te de revitalisation.",
      text: "Les pÃ´les donnent une lecture mÃ©tier du dispositif : habitat, matÃ©riaux, commerce, friches et mobilisation humaine sont reliÃ©s dans un mÃªme cadre de dÃ©cision.",
      action: ["Voir les actions", "nos-actions.html"],
      items: [
        ["Pilotage", "Un pÃ´le principal porte l'analyse selon la nature dominante du dossier."],
        ["Coordination", "Les pÃ´les associÃ©s complÃ¨tent l'instruction lorsque le sujet devient transversal."],
        ["Arbitrage", "TVF peut complÃ©ter, visiter, instruire, conventionner, reporter ou classer un dossier."],
      ],
    },
    "collectivites.html": {
      kicker: "Territoire partenaire",
      title: "Un cadre lisible pour expÃ©rimenter avec une commune ou un EPCI.",
      text: "La coopÃ©ration avec une collectivitÃ© repose sur un pÃ©rimÃ¨tre dÃ©fini, un rÃ©fÃ©rent identifiÃ©, des donnÃ©es mobilisables, des rÃ¨gles de communication et des livrables datÃ©s.",
      action: ["Remplir la fiche collectivitÃ©", "documents/fiche-collectivite.md"],
      items: [
        ["PÃ©rimÃ¨tre", "Quartier, rue, typologie de biens, friche ou besoin public clairement dÃ©limitÃ©."],
        ["Gouvernance", "RÃ©fÃ©rent, rythme de suivi, rÃ¨gles de communication et validation des livrables."],
        ["Livrables", "Diagnostic court, registre, note d'opportunitÃ©, convention ou tableau de bord."],
      ],
    },
    "proprietaires.html": {
      kicker: "PropriÃ©tÃ© sÃ©curisÃ©e",
      title: "Un parcours d'Ã©tude sans engagement prÃ©maturÃ© du propriÃ©taire.",
      text: "TVF Ã©tudie les biens proposÃ©s dans un cadre respectueux de la propriÃ©tÃ© : accÃ¨s autorisÃ©, usage compatible, responsabilitÃ©s Ã©crites et convention adaptÃ©e lorsque le dossier avance.",
      action: ["Remplir la fiche propriÃ©taire", "documents/fiche-proprietaire.md"],
      items: [
        ["Bien", "Type, adresse, Ã©tat apparent, photos, diagnostics, contraintes et accÃ¨s."],
        ["Intention", "Usage acceptable, durÃ©e possible, limites non nÃ©gociables et attentes du propriÃ©taire."],
        ["Suite", "Ã©tude, visite autorisÃ©e, scÃ©narios d'usage, convention ou rÃ©orientation."],
      ],
    },
    "entreprises.html": {
      kicker: "Contribution territoriale",
      title: "Une contribution Ã©conomique qualifiÃ©e, tracÃ©e et valorisable.",
      text: "MatÃ©riaux, compÃ©tences, locaux ou mÃ©cÃ©nat sont intÃ©grÃ©s Ã  une logique de projet. L'entreprise dispose d'un cadre clair et TVF conserve une affectation maÃ®trisÃ©e des ressources.",
      action: ["Remplir la fiche entreprise", "documents/fiche-entreprise.md"],
      items: [
        ["Ressource", "CatÃ©gorie, quantitÃ©, Ã©tat, localisation, dÃ©lai, conditions de retrait ou disponibilitÃ©."],
        ["Affectation", "Acceptation, refus, stockage, mission, mise Ã  disposition ou orientation vers un projet."],
        ["Preuve", "Bordereau, convention, procÃ¨s-verbal de remise, compte rendu ou reporting de contribution."],
      ],
    },
    "saint-etienne.html": {
      kicker: "Territoire pilote",
      title: "Saint-Ã‰tienne comme dÃ©monstrateur mÃ©thodologique.",
      text: "Le pilote doit documenter des dossiers courts, vÃ©rifiables et reproductibles avant tout dÃ©ploiement national : donnÃ©es, acteurs, blocages, conventions, coÃ»ts et conditions de duplication.",
      action: ["Lire le dossier Saint-Ã‰tienne", "documents/dossier-territorial-saint-etienne.md"],
      items: [
        ["Cadrage", "DonnÃ©es publiques, besoins locaux, acteurs et pÃ©rimÃ¨tres Ã  prioriser."],
        ["Dossiers tests", "Habitat, commerce, matÃ©riaux, friches et mobilisation citoyenne."],
        ["Bilan", "Ce qui fonctionne, ce qui bloque, ce qui peut Ãªtre dupliquÃ© ailleurs."],
      ],
    },
    "financeurs-mecenes.html": {
      kicker: "Financement",
      title: "Un soutien reliÃ© Ã  un objet, un budget et une preuve de suivi.",
      text: "La page financeur prÃ©pare une lecture institutionnelle : besoin, phase financÃ©e, risques, cadre juridique, indicateurs, calendrier et reporting.",
      action: ["PrÃ©parer une demande de soutien", "documents/demande-soutien-financier.md"],
      items: [
        ["Objet", "Phase financÃ©e, territoire, bÃ©nÃ©ficiaires, dÃ©penses et reste Ã  financer."],
        ["Risque", "Juridique, technique, financier, humain, calendrier et communication."],
        ["Reporting", "Justificatifs, indicateurs, limites et bilan transmis au financeur."],
      ],
    },
    "contact.html": {
      kicker: "Relation qualifiÃ©e",
      title: "Un premier contact orientÃ© vers l'instruction du dossier.",
      text: "La page Contact structure les informations nÃ©cessaires au premier Ã©change : profil, territoire, objet, documents disponibles et niveau d'urgence.",
      action: ["PrÃ©parer l'envoi", "#contact-form"],
      items: [
        ["Profil", "CollectivitÃ©, propriÃ©taire, entreprise, association, bÃ©nÃ©vole, financeur ou presse."],
        ["Territoire", "Commune, quartier, adresse ou pÃ©rimÃ¨tre concernÃ©."],
        ["Objet", "Bien, matÃ©riau, besoin public, partenariat, financement ou signalement."],
      ],
    },
  };

  const panel = panels[page.file];
  if (!panel) return "";

  return `<section class="decision-panel institutional-panel" ${sectionAttrs(panel.title)}><div class="container decision-panel-inner"><div class="decision-copy"><p class="section-kicker">${panel.kicker}</p><h2>${panel.title}</h2><p>${panel.text}</p><a class="btn primary" href="${hrefFor(panel.action[1])}">${panel.action[0]}</a></div><div class="decision-list">${panel.items
    .map(([title, text], index) => `<article><span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div><strong>${title}</strong><p>${text}</p></div></article>`)
    .join("")}</div></div></section>`;
}

function pageTemplate(page) {
  const active = page.file;
  const url = pageUrl(page);
  const title = `${page.title} | ${site.name}`;
  const socialImage = imageObjectFor(page);
  const socialAlt = escapeAttr(`${page.title} - ${site.name}`);
  const socialImageSize = socialImage.width && socialImage.height
    ? `  <meta property="og:image:width" content="${socialImage.width}">
  <meta property="og:image:height" content="${socialImage.height}">`
    : "";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${page.meta}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#183f22">
  <link rel="canonical" href="${url}">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${page.meta}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:updated_time" content="${site.lastModified}">
  <meta property="og:image" content="${socialImage.url}">
  <meta property="og:image:secure_url" content="${socialImage.url}">
${socialImageSize}
  <meta property="og:image:alt" content="${socialAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${page.meta}">
  <meta name="twitter:image" content="${socialImage.url}">
  <meta name="twitter:image:alt" content="${socialAlt}">
  <link rel="icon" href="assets/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="preload" as="image" href="${page.heroImage}">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${jsonLd(page)}</script>
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${hrefFor("index.html")}" aria-label="Accueil Territoires Vivants France"><img src="assets/logo-territoires-vivants-france-web.png" width="583" height="181" alt="Territoires Vivants France" decoding="async"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button>
      <nav class="main-nav" id="main-nav" aria-label="Navigation principale">${nav
        .map(([label, href]) => `<a href="${hrefFor(href)}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("")}</nav>
      <a class="btn header-cta" href="${hrefFor("contact.html")}">Nous contacter</a>
    </div>
  </header>
  <main id="contenu">
    <section class="hero" style="--hero-image:url('${page.heroImage}')">
      <div class="container hero-inner">
${breadcrumbNav(page)}
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.h1}</h1>
        <p>${page.intro}</p>
        <div class="hero-actions">${page.ctas.map(([label, href], i) => `<a class="btn ${i === 0 ? "primary" : "secondary"}" href="${hrefFor(href)}">${label}</a>`).join("")}</div>
      </div>
    </section>
    ${pageMiniNav(page)}
    ${institutionalNarrativeFor(page)}
    ${quickBriefFor(page)}${decisionPanelFor(page)}
    ${page.sections.join("\n")}
    ${journeySection(page)}
    ${ctaBandFor(page)}
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div><span class="footer-logo-box"><img src="assets/logo-territoires-vivants-france-web.png" width="583" height="181" alt="Territoires Vivants France" class="footer-logo" loading="lazy" decoding="async"></span><p>Plateforme nationale de coopÃ©ration pour redonner vie aux biens, lieux et ressources inutilisÃ©s.</p></div>
      <div><h3>Navigation</h3>${nav.slice(0, 7).map(([label, href]) => `<a href="${hrefFor(href)}">${label}</a>`).join("")}</div>
      <div><h3>Ressources</h3><a href="${hrefFor("faq.html")}">FAQ</a><a href="${hrefFor("kit-media.html")}">Kit mÃ©dia</a><a href="${hrefFor("gouvernance.html")}">Gouvernance</a><a href="${hrefFor("mentions-legales.html")}">Mentions lÃ©gales</a><a href="${hrefFor("politique-confidentialite.html")}">Politique de confidentialitÃ©</a></div>
      <div><h3>SiÃ¨ge</h3><p>25 rue Ã‰lise Gervais<br>42000 Saint-Ã‰tienne</p><p><a href="mailto:${contact.email}">${contact.email}</a><br><a href="tel:${contact.phoneHref}">${contact.phone}</a></p><div class="footer-social" aria-label="RÃ©seaux et messagerie TVF"><a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Ã‰crire Ã  TVF sur WhatsApp"><span aria-hidden="true">WA</span><span>WhatsApp</span></a><a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Suivre TVF sur Facebook"><span aria-hidden="true">FB</span><span>Facebook</span></a><a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Suivre TVF sur Instagram"><span aria-hidden="true">IG</span><span>Instagram</span></a></div><a class="btn secondary" href="${hrefFor("contact.html")}">Contacter TVF</a></div>
    </div>
    <div class="container footer-bottom"><span>Â© 2026 Territoires Vivants France - Tous droits rÃ©servÃ©s.</span><a class="footer-admin-link" href="${hrefFor("admin-demandes.html")}" rel="nofollow">AccÃ¨s administrateur</a></div>
  </footer>
  <script src="main.js" defer></script>
</body>
</html>`;
}

for (const page of pages) {
  fs.writeFileSync(path.join(process.cwd(), page.file), pageTemplate(page), "utf8");
}

fs.writeFileSync(
  "robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /documents\nDisallow: /documents/\nDisallow: /output/\nDisallow: /tmp/\nDisallow: /admin-demandes\nDisallow: /admin-demandes.html\nSitemap: ${site.url}/sitemap.xml\n`,
  "utf8"
);

fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => p.file !== "documents.html")
    .map((p) => {
      const priority = p.file === "index.html" ? "1.0" : ["qui-sommes-nous.html", "nos-actions.html", "nos-poles.html", "saint-etienne.html", "agir-avec-nous.html", "contact.html"].includes(p.file) ? "0.8" : "0.6";
      return `  <url><loc>${pageUrl(p)}</loc><lastmod>${site.lastModified}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
    })
    .join("\n")}\n</urlset>\n`,
  "utf8"
);

fs.writeFileSync(
  "site.webmanifest",
  JSON.stringify(
    {
      name: site.name,
      short_name: "TVF",
      start_url: "/",
      display: "standalone",
      background_color: "#f6f3ec",
      theme_color: "#245c2b",
      icons: [
        { src: "assets/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    null,
    2
  ),
  "utf8"
);

fs.writeFileSync(
  "vercel.json",
  JSON.stringify(
    {
      cleanUrls: true,
      trailingSlash: false,
      functions: { "api/admin/*.js": { includeFiles: "documents/**" } },
      rewrites: [{ source: "/api/admin-:module", destination: "/api/admin/:module" }],
      redirects: [
        { source: "/documents", destination: "/contact", permanent: false },
        { source: "/documents.html", destination: "/contact", permanent: false },
        { source: "/documents/:path*", destination: "/contact", permanent: false },
        { source: "/output/:path*", destination: "/contact", permanent: false },
        { source: "/tmp/:path*", destination: "/contact", permanent: false },
      ],
      headers: [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
            {
              key: "Content-Security-Policy",
              value:
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
            },
          ],
        },
        {
          source: "/assets/(.*)",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
        {
          source: "/(.*).html",
          headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
        },
      ],
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Generated ${pages.length} pages.`);





