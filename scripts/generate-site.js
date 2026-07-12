const fs = require("fs");
const path = require("path");

const site = {
  name: "Territoires Vivants France",
  url: "https://www.territoiresvivantsfrance.fr",
  lastModified: "2026-07-04",
  description:
    "Plateforme nationale de coopération pour remettre en usage les logements, commerces, bâtiments, terrains et matériaux inutilisés.",
};

const contact = {
  email: "contact@territoiresvivantsfrance.fr",
  phone: "06 22 03 93 24",
  phoneHref: "+33622039324",
  address: "25 rue Élise Gervais, 42000 Saint-Étienne",
};

const socialLinks = {
  whatsapp: "https://wa.me/message/SKYLJHX46E43C1",
  facebook: "https://www.facebook.com/share/18wj5mVw1w/",
};

const whatsappQr = "assets/qr-whatsapp-tvf.png";

const official = {
  status: "Association loi 1901 déclarée",
  rna: "W423016361",
  siren: "107 226 128",
  siret: "107 226 128 00018",
  legalCategory: "9220 - Association déclarée",
  ape: "94.99Z - Autres organisations fonctionnant par adhésion volontaire",
  ess: "Oui",
  sireneDate: "7 juillet 2026",
  activeSince: "1er juillet 2026",
  declarationDate: "1er juillet 2026",
  decisionDate: "22 juin 2026",
  receiptDate: "2 juillet 2026",
  receiptPlace: "Roanne",
  authority: "Préfet de la Loire - Sous-préfecture de Roanne",
  receiptLabel: "Récépissé de déclaration de création n° W423016361",
};

const statutes = {
  signedDate: "22 juin 2026",
  signedPlace: "Saint-Étienne",
  duration: "indéterminée",
  founders: "Edryan Rangoly et Jordan Lambeau",
  object: "revitalisation, réhabilitation et valorisation des territoires urbains, ruraux et ultramarins",
};

const nav = [
  ["Accueil", "index.html"],
  ["L'association", "qui-sommes-nous.html"],
  ["Nos actions", "nos-actions.html"],
  ["Nos pôles", "nos-poles.html"],
  ["Observatoire", "observatoire.html"],
  ["Saint-Étienne", "saint-etienne.html"],
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
      "Territoires Vivants France coordonne propriétaires, collectivités, entreprises, associations et citoyens pour redonner vie aux biens et ressources inutilisés.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Plateforme nationale de coopération",
    h1: "Redonner vie aux lieux utiles aux habitants.",
    intro:
      "Territoires Vivants France structure une méthode de coopération pour repérer les ressources inutilisées, mobiliser les bons acteurs, préparer les conventions et accompagner des projets utiles aux territoires.",
    ctas: [
      ["Comprendre TVF", "qui-sommes-nous.html"],
      ["Agir avec nous", "agir-avec-nous.html"],
      ["Nous contacter", "contact.html"],
    ],
    sections: [
      sectionIntro(
        "Une mission lisible",
        "TVF part d'un constat simple : des logements restent vacants, des commerces ferment, des friches demeurent inutilisées et des matériaux encore utiles sortent des circuits de projet. L'association veut transformer ces situations en opportunités locales, avec un cadre clair et traçable.",
        [
          ["Observer", "Identifier les lieux, besoins et ressources à partir de signalements, visites et données vérifiables."],
          ["Qualifier", "Analyser la faisabilité, les contraintes, les responsabilités et les usages possibles."],
          ["Coordonner", "Réunir propriétaires, collectivités, entreprises, associations, financeurs, bénévoles et habitants."],
        ]
      ),
      homeClaritySection(),
      homeTrustSection(),
      launchNeedsSection(),
      tableSection("Ce que vous pouvez faire dès maintenant", "L'accueil doit orienter vite vers le bon parcours, sans perdre le visiteur dans tout le site.", [
        ["Votre situation", "Action utile", "Page à consulter"],
        ["Vous représentez une collectivité", "Préparer un périmètre pilote, un besoin public ou une coopération", "Collectivités"],
        ["Vous possédez un bien vacant", "Décrire le bien, son état, les contraintes et les usages possibles", "Propriétaires"],
        ["Vous êtes une entreprise", "Signaler des matériaux, compétences, locaux ou un soutien possible", "Entreprises"],
        ["Vous souhaitez aider", "Proposer du temps, une compétence, un signalement ou une mission locale", "Agir avec nous"],
        ["Vous voulez comprendre la méthode", "Lire les étapes, critères de décision et règles de preuve", "Notre méthode"],
      ]),
      cards(
        "À chacun son entrée",
        "Le site doit permettre à chaque public de savoir quoi faire en moins de deux minutes.",
        [
          ["Collectivité", "Préparer un diagnostic, une expérimentation ou une coopération territoriale.", "agir-avec-nous.html#collectivite"],
          ["Propriétaire", "Présenter un logement, un commerce, un bâtiment ou un terrain inutilisé.", "agir-avec-nous.html#proprietaire"],
          ["Entreprise", "Valoriser des matériaux, compétences, locaux ou mécénat dans un projet utile.", "agir-avec-nous.html#entreprise"],
          ["Citoyen", "Signaler un lieu, participer à une action locale ou rejoindre une mission bénévole.", "agir-avec-nous.html#citoyen"],
        ]
      ),
      timeline(
        "Le parcours TVF",
        [
          ["1", "Repérage", "Un lieu, un besoin ou une ressource est identifié."],
          ["2", "Diagnostic", "La situation est qualifiée avant toute annonce ou engagement."],
          ["3", "Convention", "Les rôles, responsabilités, usages et limites sont formalisés."],
          ["4", "Mise en usage", "Le projet est coordonné, documenté puis suivi dans le temps."],
        ]
      ),
      highlight(
        "Saint-Étienne comme territoire pilote",
        "Le siège national est situé à Saint-Étienne. Le territoire pilote permet de tester la méthode TVF sur des enjeux concrets : habitat vacant, commerces fermés, friches, matériaux de réemploi et mobilisation citoyenne.",
        "Découvrir le pilote",
        "saint-etienne.html",
        "assets/photos/france-saint-etienne-jean-jaures.jpg"
      ),
    ],
  },
  {
    file: "qui-sommes-nous.html",
    title: "Qui sommes-nous ?",
    meta:
      "Découvrez Territoires Vivants France, association nationale de coopération territoriale basée à Saint-Étienne.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "L'association",
    h1: "Une plateforme de coopération territoriale.",
    intro:
      "TVF rassemble les acteurs capables de transformer un bien inutilisé en ressource pour les habitants : propriétaires, collectivités, entreprises, associations, bénévoles, financeurs et citoyens.",
    ctas: [["Notre méthode", "notre-methode.html"], ["Transparence", "transparence.html"]],
    sections: [
      textBlock(
        "Notre rôle",
        "TVF ne remplace ni les collectivités, ni les dispositifs publics, ni les professionnels du bâtiment. L'association cherche à rendre les coopérations plus simples : repérer les situations, préparer les dossiers, mettre les acteurs autour de la même table et suivre ce qui est décidé."
      ),
      textBlock(
        "Objet social inscrit dans les statuts",
        "Les statuts signés à Saint-Étienne le 22 juin 2026 donnent à TVF un objet large : participer à la revitalisation, la réhabilitation et la valorisation des territoires urbains, ruraux et ultramarins. Cet objet couvre notamment le logement, l'habitat, la vacance immobilière, la réhabilitation de bâtiments dégradés, la revitalisation commerciale, le réemploi des matériaux, les friches, l'insertion, la solidarité, l'environnement, l'économie circulaire, la formation et l'accompagnement des collectivités, entreprises et habitants."
      ),
      nationalDataSection("Pourquoi une association comme TVF est utile"),
      associationNeedMatrixSection(),
      associationProofSection(),
      sectionIntro(
        "Ce que TVF apporte concrètement",
        "L'association se positionne comme un cadre de travail : elle transforme une intention en dossier lisible, un signalement en situation qualifiée et une ressource inutilisée en contribution possible à un projet territorial.",
        [
          ["Un cadre", "Des étapes, des pièces à fournir, des responsabilités et des limites écrites avant toute communication."],
          ["Un langage commun", "Une manière simple de relier propriétaires, collectivités, entreprises, associations et financeurs autour du même dossier."],
          ["Une continuité", "Un suivi depuis le premier contact jusqu'à la décision, la convention, l'action et la restitution des résultats."],
        ]
      ),
      split(
        "Une méthode avant la communication",
        "La priorité est de construire une méthode crédible avant de communiquer des résultats. Cela signifie : des documents propres, des conventions adaptées, des critères de sélection, une traçabilité des décisions et une distinction nette entre objectifs, projets en instruction et actions réalisées.",
        "assets/photos/saint-etienne-rue-resistance.jpg"
      ),
      tableSection("Ce que TVF fait, et ce que TVF ne prétend pas faire", "Cette clarification protège la crédibilité du projet et évite les promesses trop rapides.", [
        ["Sujet", "TVF fait", "TVF ne fait pas"],
        ["Biens vacants", "Aide à qualifier un bien, un usage possible, les risques et les acteurs à mobiliser", "Ne décide pas seule de l'avenir d'un bien sans accord du propriétaire ou du cadre public compétent"],
        ["Matériaux", "Organise une valorisation orientée projet, avec traçabilité et affectation", "Ne fonctionne pas comme une plateforme de dons libres ou une déchetterie"],
        ["Collectivités", "Prépare un cadre de coopération, un diagnostic et des documents d'aide à la décision", "Ne remplace pas les politiques publiques ni les services instructeurs"],
        ["Impact", "Mesure les résultats lorsqu'ils sont documentés", "N'annonce pas de chiffres non vérifiés"],
      ]),
      cards("Nos engagements", "TVF avance avec prudence et exigence.", [
        ["Clarté", "Ne pas annoncer de chiffres d'impact tant qu'ils ne sont pas mesurés."],
        ["Traçabilité", "Documenter les décisions, conventions, ressources et projets."],
        ["Complémentarité", "Aider les acteurs existants sans se substituer à eux."],
        ["Utilité", "Orienter chaque action vers un bénéfice concret pour le territoire."],
      ]),
      tableSection("Lecture institutionnelle de TVF", "Ce cadre de lecture résume ce qu'un interlocuteur public, économique ou associatif doit comprendre avant un premier rendez-vous.", [
        ["Question", "Réponse TVF", "Preuve ou document associé"],
        ["Pourquoi TVF existe ?", "Réduire la dispersion entre biens vacants, ressources inutilisées, besoins locaux et acteurs capables d'agir", "Méthode TVF, pages actions et pôles"],
        ["À qui TVF s'adresse ?", "Collectivités, propriétaires, entreprises, associations, bénévoles, financeurs et habitants", "Parcours publics et fiches dédiées"],
        ["Comment TVF intervient ?", "Par qualification, coordination, convention, suivi et restitution documentée", "Fiches projet, registres, conventions"],
        ["Ce que TVF protège", "La propriété, les données sensibles, les responsabilités et la crédibilité des partenaires", "Charte, transparence, mentions légales"],
        ["Ce que TVF mesure", "Des résultats uniquement lorsqu'ils sont réalisés, vérifiables et reliés à une méthode", "Page Impact et grille d'indicateurs"],
      ]),
      timeline("Construction de la crédibilité", [
        ["1", "Cadrer", "Définir l'objet de l'association, les responsabilités, les documents et les règles de communication."],
        ["2", "Tester", "Appliquer la méthode sur un territoire pilote avec des dossiers réels, sans annoncer de résultat prématuré."],
        ["3", "Formaliser", "Transformer les retours terrain en conventions, grilles de décision et procédures reproductibles."],
        ["4", "Déployer", "Ouvrir progressivement le modèle à d'autres territoires lorsque les conditions de suivi sont réunies."],
      ]),
      faqSection([
        ["TVF est-elle déjà déployée nationalement ?", "TVF pose les fondations d'une organisation nationale : méthode, outils, parcours, documents et règles de preuve. Le déploiement opérationnel s'appuiera ensuite sur des actions documentées territoire par territoire."],
        ["Pourquoi parler de plateforme de coopération ?", "Parce que la valeur de TVF n'est pas de faire seule, mais de relier les bons acteurs autour d'un dossier clair : bien, usage, ressources, responsabilités, financement et impact."],
        ["Pourquoi ne pas afficher de partenaires partout ?", "Un partenaire ne doit être affiché que lorsqu'un accord réel existe. Cette règle évite toute confusion et renforce la confiance des collectivités, entreprises et financeurs."],
      ]),
    ],
  },
  {
    file: "nos-actions.html",
    title: "Nos actions",
    meta:
      "Les actions de TVF : logements vacants, commerces inoccupés, matériaux de réemploi, friches, insertion et coordination territoriale.",
    heroImage: "assets/photos/centre-ville-nantes.jpg",
    eyebrow: "Actions",
    h1: "Transformer les lieux inutilisés en solutions concrètes.",
    intro:
      "TVF agit sur les logements vacants, commerces fermés, friches, terrains, matériaux et besoins locaux en construisant des parcours simples : repérer, qualifier, mobiliser, conventionner, réaliser et suivre.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Voir les pôles", "nos-poles.html"]],
    sections: [
      sectionIntro(
        "Une action TVF commence toujours par un besoin réel",
        "L'objectif n'est pas d'empiler des projets, mais de transformer une situation bloquée en démarche compréhensible : qui possède le bien, quel usage serait utile, quelles ressources existent, quelles responsabilités doivent être écrites et quelles preuves permettront de suivre l'action.",
        [
          ["Un lieu", "Logement vacant, commerce fermé, bâtiment inutilisé, friche ou terrain délaissé."],
          ["Une ressource", "Matériaux, mobilier, compétences, locaux, temps bénévole ou financement."],
          ["Un usage", "Logement, activité économique, lieu associatif, espace vert, atelier, formation ou service local."],
        ]
      ),
      cards("Huit leviers opérationnels", "Chaque action correspond à un besoin lisible pour les habitants, les propriétaires, les entreprises et les collectivités.", [
        ["Logements vacants", "Identifier, qualifier et accompagner les conditions de remise en usage de logements aujourd'hui inutilisés.", "proprietaires.html"],
        ["Commerces inoccupés", "Étudier les cellules fermées et préparer des usages réalistes : commerce, atelier, association, service ou activité temporaire.", "nos-poles.html#commerce-vivant"],
        ["Matériaux de réemploi", "Repérer, trier et affecter des matériaux encore utiles à des projets validés, sans distribution automatique.", "nos-actions.html#la-banque-de-materiaux-est-un-outil-de-projet"],
        ["Friches et terrains", "Analyser des espaces délaissés et préparer leur reconversion vers des usages verts, sociaux, économiques ou pédagogiques.", "nos-poles.html#friches-terrains-vivants"],
        ["Solidarité et insertion", "Construire des missions encadrées pour bénévoles, habitants, publics en insertion et partenaires associatifs.", "benevoles-citoyens.html"],
        ["Territoires partenaires", "Aider une commune ou un EPCI à cadrer un diagnostic, une expérimentation ou une coopération locale.", "collectivites.html"],
        ["Financer les projets", "Préparer des budgets, cofinancements et dossiers lisibles pour mécènes, fondations et financeurs.", "financeurs-mecenes.html"],
        ["Observatoire", "Organiser les signalements, données, sources et priorités pour décider où agir en premier.", "observatoire.html"],
      ]),
      nationalDataSection("Données publiques qui justifient ces actions"),
      tableSection("Ce que chaque action produit", "TVF doit toujours produire un livrable clair, même lorsque le projet n'est pas encore lancé.", [
        ["Action", "Problème traité", "Ce que TVF prépare", "Sortie concrète"],
        ["Logement vacant", "Bien inutilisé, propriétaire isolé, contraintes mal connues", "Fiche propriétaire, visite, scénarios d'usage, risques", "Dossier de décision"],
        ["Commerce fermé", "Vitrine inactive, rez-de-chaussée sans usage, besoin local", "Analyse d'usage, acteurs économiques, contraintes d'accès", "Scénario de réactivation"],
        ["Matériaux", "Ressources jetées ou stockées sans destination", "Bordereau, tri, état, quantité, affectation possible", "Registre de réemploi"],
        ["Friche ou terrain", "Espace délaissé, manque d'usage, risque de dégradation", "Qualification, sécurité, accès, usages compatibles", "Note d'opportunité"],
        ["Action solidaire", "Besoin d'engagement citoyen ou d'insertion", "Mission, encadrement, sécurité, feuille d'émargement", "Action documentée"],
      ]),
      actionsOperationalMatrixSection(),
      tableSection("Exemples de cas d'usage à instruire", "Ces exemples ne sont pas présentés comme des projets réalisés. Ils montrent comment TVF transforme une situation fréquente en dossier vérifiable.", [
        ["Situation", "Problème de départ", "Réponse TVF", "Livrable attendu"],
        ["Logement vacant signalé par un propriétaire", "Bien inutilisé, usage incertain, travaux possibles à estimer", "Qualifier le bien, vérifier l'accès, comparer les usages et préparer l'accord de principe", "Fiche propriétaire et scénarios d'usage"],
        ["Commerce fermé en centre-ville", "Local visible mais sans activité et sans porteur identifié", "Analyser les contraintes, usages temporaires et acteurs économiques ou associatifs possibles", "Note d'opportunité commerce"],
        ["Lot de matériaux disponible", "Ressource encore utile mais sans destination", "Vérifier état, quantité, retrait, stockage et affectation à un projet validé", "Bordereau matériaux et registre de suivi"],
        ["Terrain délaissé", "Espace sans usage, risque de dégradation ou besoin de cadre de vie", "Qualifier propriété, sécurité, accès et usages temporaires verts ou partagés", "Fiche d'audit terrain"],
        ["Besoin associatif de local", "Association utile mais sans lieu adapté", "Relier besoin, bien possible, convention d'usage et responsabilités", "Fiche projet et convention à préparer"],
      ]),
      split(
        "La Banque de matériaux est un outil de projet",
        "Les matériaux proposés à TVF ne sont pas distribués librement. Ils sont qualifiés, tracés puis orientés vers des besoins utiles : remise en état d'un local associatif, aménagement d'un lieu partagé, soutien à un chantier encadré ou expérimentation territoriale. Cette logique protège les contributeurs et garantit que chaque ressource garde une utilité collective.",
        "assets/photos/materiaux-reemploi-echantillons.jpg"
      ),
      timeline("Méthode d'intervention", [
        ["1", "Recevoir", "Une demande, un signalement ou une contribution est enregistré avec un numéro de dossier."],
        ["2", "Qualifier", "Le besoin, le bien, la ressource, les risques et les pièces manquantes sont analysés."],
        ["3", "Orienter", "TVF décide de compléter, visiter, instruire, réorienter ou classer le dossier."],
        ["4", "Mobiliser", "Les acteurs utiles sont identifiés : propriétaire, collectivité, entreprise, association, financeur ou bénévole."],
        ["5", "Formaliser", "Les engagements, usages, responsabilités, budgets et limites sont écrits avant action."],
        ["6", "Suivre", "Le projet est documenté avec indicateurs, photos autorisées, comptes rendus et reporting."],
      ]),
      actionsDecisionSection(),
      cards("À qui s'adressent les actions ?", "Chaque public doit comprendre immédiatement où il intervient dans la chaîne de revitalisation.", [
        ["Collectivités", "Diagnostiquer, prioriser et structurer une coopération territoriale.", "collectivites.html"],
        ["Propriétaires", "Étudier un bien vacant sans perdre la propriété ni s'engager prématurément.", "proprietaires.html"],
        ["Entreprises", "Valoriser matériaux, locaux, compétences ou mécénat dans un cadre traçable.", "entreprises.html"],
        ["Associations", "Exprimer un besoin de local, d'équipement, de bénévolat ou d'appui projet.", "partenaires.html"],
        ["Bénévoles", "Participer à des missions utiles, encadrées et documentées.", "benevoles-citoyens.html"],
        ["Financeurs", "Soutenir des dossiers instruits avec budget, suivi et reporting.", "financeurs-mecenes.html"],
      ]),
      faqSection([
        ["TVF réalise-t-elle directement les travaux ?", "TVF prépare, coordonne et documente les projets. Les travaux nécessitent un cadre adapté, des compétences, des assurances et des responsabilités clairement définies."],
        ["Un signalement devient-il automatiquement un projet ?", "Non. Un signalement déclenche une phase de qualification. Il peut être complété, orienté, classé ou transformé en dossier seulement si les conditions sont réunies."],
        ["Les matériaux sont-ils gratuits ?", "Non. La matériauthèque TVF est un outil de valorisation territoriale : les ressources sont affectées à des projets validés, selon leur état, leur utilité et leur traçabilité."],
        ["Quand les chiffres d'impact seront-ils publiés ?", "Lorsque des projets seront instruits, conventionnés, réalisés puis mesurés avec une méthode stable."],
      ]),
    ],
  },
  {
    file: "nos-poles.html",
    title: "Nos 5 pôles",
    meta:
      "Les cinq pôles de Territoires Vivants France : Habitat Vivant, Matériauthèque Solidaire, Commerce Vivant, Friches & Terrains Vivants, Solidarité & Insertion.",
    heroImage: "assets/photos/chantier-renovation-lyon.jpg",
    eyebrow: "Organisation",
    h1: "Cinq pôles pour couvrir tout le cycle de revitalisation.",
    intro:
      "Les pôles structurent l'action de TVF : repérer un lieu ou une ressource, comprendre le besoin, mobiliser les bons acteurs, préparer un cadre écrit et suivre le retour à l'usage.",
    ctas: [["Nos actions", "nos-actions.html"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Une organisation lisible pour passer de l'idée au terrain",
        "Les pôles ne sont pas des silos. Ils permettent de répartir les responsabilités, de clarifier les sujets à traiter et d'éviter qu'un projet reste bloqué parce qu'il manque un propriétaire, un usage, des matériaux, une collectivité, un financement ou une équipe locale.",
        [
          ["Repérer", "Identifier les logements, commerces, friches, terrains, matériaux et besoins associatifs."],
          ["Assembler", "Relier le bon pôle principal aux pôles complémentaires selon la nature du projet."],
          ["Suivre", "Documenter la décision, les conventions, les ressources mobilisées et les résultats mesurables."],
        ]
      ),
      cards("Les pôles TVF", "Chaque pôle apporte une compétence précise au service d'un même objectif : remettre en usage ce qui peut redevenir utile.", [
        ["Habitat Vivant", "Logements vacants, habitat dégradé, propriétaires, occupation temporaire, usages solidaires.", "proprietaires.html"],
        ["Matériauthèque Solidaire", "Matériaux réemployables, collecte, diagnostic, stockage, affectation à des projets validés.", "entreprises.html"],
        ["Commerce Vivant", "Locaux fermés, vitrines inactives, artisans, services de proximité et usages temporaires.", "nos-poles.html#commerce-vivant"],
        ["Friches & Terrains Vivants", "Terrains délaissés, espaces verts, jardins partagés, biodiversité et nouveaux usages collectifs.", "nos-poles.html#friches-terrains-vivants"],
        ["Solidarité & Insertion", "Bénévolat, missions encadrées, formation, participation citoyenne et inclusion.", "benevoles-citoyens.html"],
      ]),
      tableSection("Rôle détaillé de chaque pôle", "Chaque pôle doit produire des informations utiles à la décision, pas seulement une intention.", [
        ["Pôle", "Pourquoi il existe", "Missions principales", "Livrables possibles"],
        ["Habitat Vivant", "Des biens restent inutilisés alors que les besoins locaux existent", "Qualifier le bien, dialoguer avec le propriétaire, étudier les usages", "Fiche propriétaire, scénarios, accord de principe"],
        ["Matériauthèque Solidaire", "Des ressources encore utiles sortent des circuits de projet", "Recenser, trier, sécuriser et affecter les matériaux", "Bordereau, registre, PV de remise"],
        ["Commerce Vivant", "Des locaux fermés fragilisent les rues et les centres-villes", "Comprendre le local, tester des usages, relier porteurs et acteurs locaux", "Fiche local, scénario d'usage, convention"],
        ["Friches & Terrains Vivants", "Des espaces délaissés peuvent devenir utiles au cadre de vie", "Qualifier l'accès, les risques, les usages verts ou partagés", "Audit terrain, note d'opportunité, plan d'action"],
        ["Solidarité & Insertion", "Les projets locaux peuvent créer de l'engagement et des parcours", "Cadrer les missions, encadrer les actions, suivre la participation", "Fiche mission, émargement, compte rendu"],
      ]),
      tableSection("Exemples de dossiers par pôle", "Cette synthèse aide un visiteur à comprendre rapidement quel pôle peut porter l'analyse principale d'un dossier.", [
        ["Pôle principal", "Dossier typique", "Pôles associés possibles", "Question de décision"],
        ["Habitat Vivant", "Logement vacant proposé par un propriétaire", "Matériauthèque, Solidarité, Financement", "Le bien peut-il être étudié et sécurisé pour un usage utile ?"],
        ["Matériauthèque Solidaire", "Matériaux de chantier ou mobilier professionnel disponibles", "Habitat, Commerce, Friches", "La ressource est-elle réemployable, traçable et affectable ?"],
        ["Commerce Vivant", "Vitrine fermée ou local commercial inoccupé", "Habitat, Solidarité, Financement", "Un usage temporaire ou durable est-il réaliste ?"],
        ["Friches & Terrains Vivants", "Terrain ou espace délaissé sans usage clair", "Solidarité, Matériauthèque, Collectivités", "L'accès, la sécurité et la propriété permettent-ils une expérimentation ?"],
        ["Solidarité & Insertion", "Mission bénévole ou chantier participatif à cadrer", "Tous les pôles selon le support", "La mission est-elle utile, encadrée et proportionnée ?"],
      ]),
      polesOperationalMatrixSection(),
      nationalDataSection("Repères nationaux par pôle"),
      split(
        "Habitat Vivant",
        "Ce pôle s'adresse d'abord aux propriétaires, collectivités et habitants confrontés à des logements vacants, dégradés ou sans usage clair. TVF ne promet pas une rénovation immédiate : l'objectif est de qualifier le bien, comprendre les contraintes, identifier les usages réalistes et préparer un cadre de coopération.",
        "assets/photos/immeuble-renovation-meudon.jpg"
      ),
      split(
        "Matériauthèque Solidaire",
        "Ce pôle transforme les matériaux disponibles en ressources de projet. Une porte, du bois, du carrelage, du mobilier ou un équipement technique ne sont utiles que s'ils sont identifiés, stockables, sécurisés et affectés à un usage concret.",
        "assets/photos/materiaux-durables-reemploi.jpg"
      ),
      split(
        "Commerce Vivant",
        "Ce pôle travaille sur les vitrines fermées, locaux vacants et rez-de-chaussée sans activité. L'objectif est de préparer des usages réalistes : activité de proximité, artisanat, association, atelier, service, occupation temporaire ou expérimentation locale.",
        "assets/photos/commerce-ferme-vichy.jpg"
      ),
      split(
        "Friches & Terrains Vivants",
        "Ce pôle regarde les espaces délaissés comme des réserves d'usage possible : jardin partagé, espace pédagogique, lieu associatif, biodiversité, équipement temporaire ou projet territorial. La sécurité, l'accès et la propriété restent toujours les premiers points à vérifier.",
        "assets/photos/friche-industrielle-ronchamp.jpg"
      ),
      split(
        "Solidarité & Insertion",
        "Ce pôle permet aux habitants, bénévoles, associations et publics accompagnés de participer à des actions utiles sans improvisation. Les missions doivent être claires, encadrées, sécurisées et documentées.",
        "assets/photos/jardin-partage-france.jpg"
      ),
      split(
        "Une logique de coopération",
        "Un même projet peut mobiliser plusieurs pôles. Un logement vacant peut nécessiter des matériaux de réemploi, une convention avec un propriétaire, un appui de collectivité, un chantier encadré et un suivi d'impact. TVF sert à organiser cette coordination étape par étape.",
        "assets/photos/centre-ville-nantes.jpg"
      ),
      polesCoordinationSection(),
      timeline("Comment les pôles travaillent ensemble", [
        ["1", "Repérage", "Un lieu, une ressource ou un besoin est identifié."],
        ["2", "Pôle principal", "TVF choisit le pôle qui porte l'analyse principale."],
        ["3", "Pôles associés", "Les autres pôles complètent : matériaux, insertion, commerce, friche ou habitat."],
        ["4", "Cadre écrit", "Convention, autorisation, budget, sécurité et responsabilités sont préparés."],
        ["5", "Action suivie", "Les résultats ne sont publiés qu'après réalisation et vérification."],
      ]),
      faqSection([
        ["Pourquoi organiser TVF en pôles ?", "Les pôles rendent la méthode lisible. Ils permettent de traiter séparément l'habitat, les commerces, les friches, les matériaux et l'engagement humain, tout en les reliant dans un même projet."],
        ["Un projet peut-il relever de plusieurs pôles ?", "Oui. C'est même fréquent : un bâtiment vacant peut mobiliser Habitat Vivant, Matériauthèque Solidaire, Solidarité & Insertion et parfois Commerce Vivant."],
        ["Qui décide du pôle principal ?", "TVF l'identifie après qualification du besoin, des contraintes, des acteurs et de l'usage envisagé."],
        ["Les pôles correspondent-ils à des résultats déjà obtenus ?", "Ils structurent la méthode et les dossiers à instruire. Les résultats relèveront ensuite des pages Impact et Transparence."],
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
      "L'observatoire doit aider les territoires à mieux identifier les ressources inutilisées avant de décider où agir.",
    ctas: [["Signaler un lieu", "agir-avec-nous.html#signalement"], ["Saint-Étienne", "saint-etienne.html"]],
    sections: [
      sectionIntro(
        "Un observatoire pour décider avec méthode",
        "L'observatoire TVF n'est pas une carte décorative. Il doit servir à transformer des informations dispersées en dossiers exploitables : signalements citoyens, données publiques, visites autorisées, photos, contraintes, priorités et suites possibles.",
        [
          ["Centraliser", "Regrouper les informations utiles sans exposer de données sensibles."],
          ["Qualifier", "Distinguer une intuition, un signalement, une donnée vérifiée et un dossier orienté."],
          ["Prioriser", "Aider les territoires à concentrer leurs efforts sur les situations les plus utiles et faisables."],
        ]
      ),
      cards("Ce que l'observatoire suit", "Les catégories sont volontairement simples.", [
        ["Logements vacants", "Biens inutilisés ou dégradés à qualifier avec prudence."],
        ["Commerces fermés", "Cellules commerciales sans activité visible."],
        ["Bâtiments abandonnés", "Immeubles ou équipements sans usage identifié."],
        ["Friches et terrains", "Espaces délaissés pouvant accueillir un projet utile."],
        ["Matériaux disponibles", "Ressources réemployables proposées ou identifiées."],
      ]),
      tableSection("Sources à croiser", "Une donnée isolée ne suffit pas. TVF doit croiser plusieurs niveaux d'information avant de prioriser.", [
        ["Source", "Ce qu'elle apporte", "Précaution"],
        ["Données publiques", "Contexte démographique, habitat, économie locale, environnement", "Citer la source et la date de consultation"],
        ["Signalement citoyen", "Information de terrain rapide sur un lieu ou une ressource", "À vérifier avant toute conclusion"],
        ["Collectivité", "Périmètre, priorités, programmes, contraintes publiques", "Respecter les procédures et validations"],
        ["Propriétaire", "Droit d'accès, intention, état connu, usage acceptable", "Ne rien publier sans accord"],
        ["Visite autorisée", "État apparent, accès, risques, photos internes", "Ne vaut pas diagnostic technique complet"],
      ]),
      observatoryDataSection(),
      observatoryDecisionMatrixSection(),
      observatoryMapReadinessSection(),
      tableSection("Qualité des données", "L'observatoire doit distinguer signalement, vérification et décision.", [
        ["Niveau", "Statut", "Usage"],
        ["Signalé", "Information reçue", "À vérifier"],
        ["Qualifié", "Adresse, type, état et contraintes documentés", "À instruire"],
        ["Orienté", "Acteurs identifiés et piste d'usage crédible", "À conventionner"],
      ]),
      timeline("Cycle d'un signalement", [
        ["1", "Réception", "Le lieu ou la ressource est enregistré avec une description minimale."],
        ["2", "Protection", "Les données personnelles, photos sensibles et informations privées sont limitées."],
        ["3", "Qualification", "TVF vérifie le type de bien, la localisation, l'état apparent et les sources disponibles."],
        ["4", "Orientation", "Le dossier est classé : à compléter, à visiter, à instruire, à réorienter ou sans suite."],
        ["5", "Suivi", "Les décisions et livrables sont archivés pour éviter les doublons et les annonces imprécises."],
      ]),
      cards("Indicateurs à suivre", "Les indicateurs doivent être remplis seulement avec des données vérifiables.", [
        ["Biens signalés", "Nombre de logements, commerces, bâtiments, friches ou terrains reçus dans le registre."],
        ["Dossiers qualifiés", "Part des signalements disposant d'informations suffisantes pour instruction."],
        ["Ressources matériaux", "Matériaux proposés, acceptés, refusés, stockés, réservés ou affectés."],
        ["Dossiers orientés", "Situations ayant une piste d'usage, un acteur responsable ou une suite proposée."],
        ["Projets conventionnés", "Dossiers disposant d'un cadre écrit et de responsabilités définies."],
        ["Résultats vérifiés", "Effets publiés uniquement après réalisation et preuves associées."],
      ]),
      textBlock(
        "Responsabilité",
        "L'observatoire n'a pas vocation à stigmatiser des propriétaires. Il sert à créer les conditions d'une solution avec des données vérifiées, des démarches respectueuses et un cadre de dialogue."
      ),
      faqSection([
        ["Un signalement est-il publié automatiquement ?", "Non. TVF doit d'abord vérifier les informations, protéger les données sensibles et éviter toute exposition injustifiée d'un propriétaire ou d'un site."],
        ["L'observatoire remplace-t-il les données publiques ?", "Non. Il les complète par une méthode de qualification terrain, de traçabilité et d'orientation opérationnelle."],
        ["Une carte nationale peut-elle afficher tous les biens ?", "Pas sans règles strictes. Certains éléments doivent rester internes pour respecter la propriété, la sécurité, la confidentialité et la protection des données."],
      ]),
    ],
  },
  {
    file: "saint-etienne.html",
    title: "Saint-Étienne",
    meta:
      "Saint-Étienne est le territoire pilote de Territoires Vivants France et le siège national de l'association.",
    heroImage: "assets/photos/saint-etienne-centre-commerce.jpg",
    eyebrow: "Territoire pilote",
    h1: "Saint-Étienne, point de départ de la méthode TVF.",
    intro:
      "TVF souhaite expérimenter à Saint-Étienne une démarche de coopération sur l'habitat vacant, les commerces inoccupés, les matériaux de réemploi, les friches et l'engagement citoyen.",
    ctas: [["Proposer une coopération", "contact.html"], ["Agir avec nous", "agir-avec-nous.html"]],
    sections: [
      sectionIntro(
        "Un territoire pilote pour tester une méthode nationale",
        "Saint-Étienne n'est pas présentée comme un résultat déjà obtenu, mais comme le premier terrain de structuration de la méthode TVF. L'objectif est de prouver qu'une démarche claire peut relier patrimoine vacant, matériaux disponibles, acteurs locaux, habitants, entreprises et collectivités.",
        [
          ["Tester", "Mettre à l'épreuve les fiches, registres, conventions et parcours utilisateurs."],
          ["Apprendre", "Documenter ce qui fonctionne, ce qui bloque et ce qui doit être adapté."],
          ["Reproduire", "Créer une méthode duplicable dans d'autres communes, EPCI et territoires."],
        ]
      ),
      saintEtienneDataSection(),
      launchNeedsSection(),
      saintEtienneUsefulnessSection(),
      saintEtienneAlignmentSection(),
      saintEtienneProjectExamplesSection(),
      saintEtienneCommerceIdeasSection(),
      cards("Axes prioritaires", "Les priorités restent à formaliser avec les acteurs locaux.", [
        ["Habitat", "Repérer les logements vacants ou dégradés et comprendre les blocages."],
        ["Commerce", "Identifier les locaux fermés et les possibilités de réactivation."],
        ["Matériaux", "Structurer une filière locale de réemploi affectée à des projets utiles."],
        ["Friches", "Analyser les espaces délaissés et leurs usages possibles."],
        ["Citoyens", "Organiser le bénévolat, les signalements et les chantiers participatifs."],
      ]),
      tableSection("Enjeux stéphanois et réponse TVF", "TVF doit se positionner comme outil de coordination, pas comme promesse de remplacement des dispositifs existants.", [
        ["Enjeu à traiter", "Réponse TVF", "Livrable attendu"],
        ["Logements ou immeubles inutilisés", "Qualifier les propriétaires, l'état, l'accès et les usages possibles", "Fiche propriétaire et scénarios"],
        ["Commerces fermés", "Comprendre le local, le besoin de rue et les porteurs potentiels", "Scénario de réactivation"],
        ["Matériaux de réemploi", "Recenser les ressources disponibles et leur destination possible", "Registre matériaux"],
        ["Friches et terrains", "Analyser sécurité, accès, propriété, usages verts ou partagés", "Audit terrain"],
        ["Engagement citoyen", "Cadrer les missions bénévoles et actions terrain", "Fiche mission et compte rendu"],
      ]),
      saintEtiennePilotDashboardSection(),
      textBlock(
        "Pourquoi un pilote local ?",
        "Un dispositif national doit d'abord prouver sa méthode sur un territoire concret. Saint-Étienne permet de travailler sur des sujets représentatifs : reconversion, patrimoine existant, centres-villes, transition écologique, économie circulaire et solidarité."
      ),
      tableSection("Premiers travaux à cadrer", "Le pilote doit avancer par dossiers courts, vérifiables et utiles.", [
        ["Dossier", "Objectif", "Livrable", "Point de prudence"],
        ["Habitat vacant", "Comprendre les blocages propriétaires", "Fiche de qualification", "Pas d'accès sans autorisation"],
        ["Commerce fermé", "Identifier des usages réalistes", "Scénario d'occupation", "Ne pas annoncer de porteur sans accord"],
        ["Matériaux", "Tester une chaîne de réemploi", "Registre de ressources", "Refuser les matériaux dangereux ou inutilisables"],
        ["Friche ou terrain", "Étudier sécurité, propriété et usage possible", "Note d'opportunité", "Ne pas cartographier publiquement un site sensible"],
        ["Action citoyenne", "Créer une mission simple et encadrée", "Fiche mission", "Pas de chantier sans cadre sécurité"],
      ]),
      timeline("Déploiement pilote", [
        ["1", "Cadrage local", "Définir les premiers périmètres, interlocuteurs et priorités."],
        ["2", "Observation", "Recueillir signalements, données publiques, besoins et ressources disponibles."],
        ["3", "Dossiers tests", "Sélectionner quelques situations simples à instruire sans effet d'annonce."],
        ["4", "Coopérations", "Préparer les conventions, autorisations, budgets et responsabilités."],
        ["5", "Bilan", "Comparer objectifs, livrables, blocages et apprentissages avant duplication."],
      ]),
      cards("Ce que Saint-Étienne doit permettre de valider", "La réussite du pilote se mesure d'abord à la qualité de la méthode.", [
        ["Parcours propriétaire", "Peut-on passer d'un bien identifié à une décision claire et sécurisée ?"],
        ["Parcours collectivité", "Peut-on produire des livrables utiles à une décision publique ?"],
        ["Parcours entreprise", "Peut-on affecter une ressource à un projet sans confusion ni gaspillage ?"],
        ["Parcours bénévole", "Peut-on mobiliser des citoyens avec un cadre simple et sûr ?"],
        ["Parcours financeur", "Peut-on présenter un dossier lisible, chiffrable et vérifiable ?"],
      ]),
      faqSection([
        ["Saint-Étienne est-elle déjà un projet réalisé ?", "Non. La page présente un territoire pilote de méthode. Les résultats seront publiés seulement lorsqu'ils seront réellement vérifiés."],
        ["Pourquoi commencer par un territoire pilote ?", "Parce qu'un modèle national doit d'abord être testé, corrigé et documenté sur un terrain concret avant d'être reproduit ailleurs."],
        ["Que peut faire un acteur stéphanois maintenant ?", "Présenter un bien, signaler une ressource, proposer une coopération, devenir bénévole ou demander un échange de cadrage."],
      ]),
    ],
  },
  {
    file: "agir-avec-nous.html",
    title: "Agir avec nous",
    meta:
      "Collectivités, propriétaires, entreprises, associations et citoyens peuvent rejoindre Territoires Vivants France.",
    heroImage: "assets/photos/jardin-partage-france.jpg",
    eyebrow: "Engagement",
    h1: "Chaque acteur peut apporter une partie de la solution.",
    intro:
      "TVF propose des parcours simples pour entrer en relation, qualifier un besoin et préparer une coopération utile.",
    ctas: [["Écrire à TVF", "contact.html"], ["Proposer un bien", "#proposer"]],
    sections: [
      sectionIntro(
        "Partir du bon profil pour gagner du temps",
        "La première étape consiste à formuler une demande claire : qui porte le besoin, quel territoire est concerné, quelle ressource ou quel bien est disponible, et quelle décision doit être préparée.",
        [
          ["Comprendre", "Identifier le bon parcours avant de remplir un document."],
          ["Qualifier", "Rassembler les informations minimales pour éviter les échanges imprécis."],
          ["Orienter", "Diriger la demande vers le bon interlocuteur, la bonne fiche ou la bonne convention."],
        ]
      ),
      cards("Choisir son parcours", "Un seul objectif : transformer une intention en démarche claire.", [
        ["Je suis une collectivité", "Préparer un diagnostic, une coopération ou une expérimentation territoriale.", "#collectivite"],
        ["Je suis propriétaire", "Proposer un logement, commerce, bâtiment ou terrain inutilisé.", "#proprietaire"],
        ["Je suis une entreprise", "Valoriser matériaux, compétences, locaux ou mécénat.", "#entreprise"],
        ["Je suis bénévole", "Participer à une mission, un chantier ou une action locale.", "#citoyen"],
        ["Je souhaite financer", "Soutenir un projet avec un cadre de suivi et de transparence.", "financeurs-mecenes.html"],
      ]),
      fastJourneySection(),
      launchNeedsSection(),
      tableSection("Parcours d'entrée", "Chaque demande doit être orientée vers une suite lisible.", [
        ["Profil", "Ce que vous pouvez proposer", "Première étape", "Suite possible"],
        ["Collectivité", "Données, périmètre, besoin public, expérimentation", "Décrire le territoire et le problème à résoudre", "Diagnostic, réunion de cadrage, convention"],
        ["Propriétaire", "Logement, commerce, bâtiment, terrain ou immeuble inutilisé", "Présenter le bien, son état et les contraintes connues", "Étude, visite, scénarios d'usage"],
        ["Entreprise", "Matériaux, équipements, mécénat, compétences, locaux", "Lister la ressource et ses conditions de disponibilité", "Qualification, affectation, convention"],
        ["Association", "Besoin de local, animation, bénévolat, projet social", "Décrire l'usage et les publics concernés", "Mise en relation, dossier projet, coopération"],
        ["Citoyen", "Signalement, bénévolat, connaissance locale", "Transmettre une information factuelle et localisée", "Qualification ou mission encadrée"],
      ]),
      publicEntryMatrixSection(),
      audienceSection(),
      formSection(),
      timeline("Du contact à l'action", [
        ["1", "Décrire", "Présenter le besoin, le lieu, la ressource ou la coopération envisagée."],
        ["2", "Qualifier", "Vérifier les informations disponibles, les contraintes et les acteurs concernés."],
        ["3", "Orienter", "Choisir le bon parcours : document, échange, visite, diagnostic ou mise en attente."],
        ["4", "Formaliser", "Préparer une convention, une mission, une affectation ou une décision d'orientation."],
      ]),
      faqSection([
        ["Faut-il avoir un projet complet avant de contacter TVF ?", "Non. Il faut surtout décrire clairement la situation, le territoire, les acteurs connus et les contraintes déjà identifiées."],
        ["Puis-je simplement signaler un lieu ?", "Oui, mais un signalement ne devient pas automatiquement un projet. Il doit être vérifié, qualifié et rattaché à un besoin réel."],
        ["Quel parcours choisir si je suis à la fois habitant et bénévole ?", "Commencez par le parcours citoyen ou bénévole, puis indiquez vos compétences, disponibilités et le territoire concerné."],
      ]),
    ],
  },

  {
    file: "collectivites.html",
    title: "Collectivités",
    meta:
      "Parcours collectivités de Territoires Vivants France : diagnostic, coopération, expérimentation territoriale et suivi.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Collectivités",
    h1: "Un cadre simple pour devenir territoire partenaire.",
    intro:
      "TVF aide les collectivités à passer d'un besoin local à une démarche cadrée : repérage, diagnostic, acteurs, convention, suivi et indicateurs.",
    ctas: [["Préparer une fiche", "documents/fiche-collectivite.md"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un outil d'appui pour passer du constat à l'action",
        "Une collectivité peut connaître la vacance, les locaux fermés ou les friches sans disposer du temps, des outils ou des relais pour transformer chaque situation en dossier opérationnel. TVF propose une méthode de cadrage complémentaire : qualifier, prioriser, réunir les acteurs, sécuriser les engagements et préparer le suivi.",
        [
          ["Clarifier", "Transformer un besoin territorial en périmètre de travail lisible."],
          ["Coordonner", "Faire dialoguer propriétaires, entreprises, associations, habitants et financeurs."],
          ["Documenter", "Produire des livrables utiles aux décisions publiques et aux financeurs."],
        ]
      ),
      cards("Ce que TVF peut apporter", "Un appui méthodologique avant toute action opérationnelle.", [
        ["Diagnostic", "Structurer les premiers constats sur les biens, commerces, friches ou matériaux."],
        ["Cartographie", "Préparer une lecture territoriale des lieux, ressources et besoins à qualifier."],
        ["Coordination", "Identifier les acteurs à réunir et clarifier leurs rôles."],
        ["Convention", "Préparer un cadre de coopération lisible et adapté au territoire."],
        ["Financements", "Mettre en forme les besoins, budgets et cofinancements sans annoncer de soutien non acquis."],
        ["Suivi", "Définir des indicateurs avant de communiquer des résultats."],
      ]),
      tableSection("Besoins publics et réponse TVF", "TVF aide à structurer les sujets sans se substituer à la décision publique.", [
        ["Besoin de la collectivité", "Réponse TVF", "Livrable utile"],
        ["Identifier des biens vacants", "Organiser les signalements, sources et qualifications", "Registre et fiche de qualification"],
        ["Réactiver un local ou commerce", "Étudier les usages possibles et les acteurs à mobiliser", "Scénario d'usage"],
        ["Valoriser des matériaux", "Repérer les ressources réemployables et leur destination possible", "Bordereau et registre matériaux"],
        ["Mobiliser le tissu local", "Créer un cadre de dialogue avec associations, entreprises, habitants", "Compte rendu de cadrage"],
        ["Chercher des soutiens", "Formaliser besoin, budget, impact attendu et pièces à fournir", "Plan de financement"],
      ]),
      tableSection("Parcours collectivité", "Le parcours doit rester compatible avec les procédures publiques.", [
        ["Étape", "Objectif", "Livrable"],
        ["Cadrage", "Comprendre le besoin et le périmètre", "Fiche collectivité"],
        ["Diagnostic", "Qualifier les biens, ressources et acteurs", "Note de situation"],
        ["Coopération", "Définir les responsabilités", "Convention"],
        ["Suivi", "Documenter les effets", "Grille d'impact"],
      ]),
      collectivityConventionSection(),
      collectivityDecisionMatrixSection(),
      timeline("Devenir territoire partenaire", [
        ["1", "Premier échange", "La collectivité expose son besoin, son périmètre et les sujets prioritaires."],
        ["2", "Cadrage", "TVF identifie les données utiles, acteurs à mobiliser et contraintes de procédure."],
        ["3", "Diagnostic", "Les situations sont classées : signalées, qualifiées, orientées ou à écarter."],
        ["4", "Convention", "Le cadre de coopération précise les rôles, limites, livrables et modalités de suivi."],
        ["5", "Pilotage", "Un comité de suivi documente les décisions, les suites et les indicateurs."],
      ]),
      textBlock("Point de vigilance", "TVF n'agit pas à la place de la collectivité. L'association propose un cadre de coopération qui doit respecter les compétences, les décisions, les procédures publiques, les règles de communication et la protection des données."),
      faqSection([
        ["Une collectivité doit-elle déjà avoir un projet identifié ?", "Non. TVF peut intervenir dès la phase de cadrage, lorsqu'il existe seulement un besoin, un périmètre ou une priorité à clarifier."],
        ["TVF peut-elle annoncer un partenariat avec une mairie ?", "Uniquement après accord formalisé. Aucun logo ni nom de collectivité ne doit être utilisé sans validation."],
        ["Quels documents préparer pour un premier échange ?", "Une fiche collectivité, le périmètre concerné, les données disponibles, les interlocuteurs et les contraintes déjà connues."],
      ]),
    ],
  },
  {
    file: "proprietaires.html",
    title: "Propriétaires",
    meta:
      "Parcours propriétaires TVF : proposer un bien vacant, dégradé ou inutilisé et préparer un cadre de coopération.",
    heroImage: "assets/photos/immeuble-renovation-meudon.jpg",
    eyebrow: "Propriétaires",
    h1: "Proposer un bien sans perdre le cadre.",
    intro:
      "Un propriétaire peut présenter un logement, commerce, bâtiment ou terrain inutilisé. TVF étudie ensuite les usages possibles, les contraintes et les conditions d'une convention.",
    ctas: [["Présenter un bien", "contact.html"], ["Voir la méthode", "notre-methode.html"]],
    sections: [
      sectionIntro(
        "Le propriétaire reste au centre de la décision",
        "TVF ne prend pas la place du propriétaire et ne transforme pas un bien sans accord écrit. La démarche vise d'abord à comprendre la situation : état du bien, contraintes, coûts possibles, usages utiles au territoire et conditions d'une coopération équilibrée.",
        [
          ["Propriété conservée", "Le bien reste la propriété de son détenteur."],
          ["Usage encadré", "Toute occupation, visite ou intervention doit être formalisée."],
          ["Valorisation possible", "Un bien inutilisé peut devenir logement, local associatif, commerce, atelier ou lieu partagé."],
        ]
      ),
      cards("Ce qui peut être étudié", "Chaque bien doit être qualifié avant d'imaginer un usage.", [
        ["Logement", "Vacant, dégradé, sous-utilisé ou difficile à remettre en état."],
        ["Commerce", "Cellule fermée, local inoccupé, rez-de-chaussée à réactiver."],
        ["Bâtiment", "Immeuble, atelier, équipement ou local sans usage clair."],
        ["Terrain", "Espace délaissé pouvant accueillir un usage collectif ou transitoire."],
      ]),
      tableSection("Scénarios possibles", "Les usages dépendent toujours de l'état du bien, du droit applicable, du budget et des responsabilités.", [
        ["Scénario", "Usage possible", "Points à cadrer"],
        ["Usage temporaire", "Occupation limitée pour tester un besoin local", "Durée, assurance, accès, restitution"],
        ["Usage solidaire", "Logement, local associatif, atelier ou espace partagé", "Public concerné, gestion, sécurité"],
        ["Valorisation progressive", "Travaux par étapes, réemploi de matériaux, recherche de soutiens", "Budget, devis, convention, suivi"],
        ["Réorientation", "Transmission vers un acteur plus adapté si TVF n'est pas le bon cadre", "Motif, contact utile, limites"],
      ]),
      tableSection("Points à vérifier", "Un projet sérieux commence par les contraintes.", [
        ["Sujet", "Question", "Document utile"],
        ["Propriété", "Qui peut autoriser l'usage ?", "Justificatif ou accord"],
        ["État", "Le bien est-il accessible et sécurisé ?", "Photos, diagnostics"],
        ["Usage", "Quel usage est réaliste ?", "Fiche projet"],
        ["Durée", "Quelle durée de coopération est acceptable ?", "Convention"],
      ]),
      ownerConventionSection(),
      ownerReadinessMatrixSection(),
      timeline("Parcours propriétaire", [
        ["1", "Présentation du bien", "Le propriétaire transmet les informations disponibles sans engagement automatique."],
        ["2", "Qualification", "TVF analyse l'état apparent, les contraintes, les usages possibles et les pièces manquantes."],
        ["3", "Visite autorisée", "Une visite peut être organisée seulement avec accord écrit et règles de sécurité."],
        ["4", "Scénarios", "Plusieurs usages sont comparés : temporaire, solidaire, économique, associatif ou réorientation."],
        ["5", "Convention", "Si une suite est retenue, les rôles, durées, responsabilités et conditions de restitution sont écrits."],
      ]),
      textBlock("Principe", "Le propriétaire conserve ses droits. Toute intervention doit être encadrée par un accord clair, précisant les usages, la durée, les responsabilités, l'assurance, la communication et les limites de l'intervention."),
      faqSection([
        ["Proposer un bien engage-t-il le propriétaire ?", "Non. La première étape sert uniquement à étudier la situation. Aucun usage, travaux ou affichage public ne doit être engagé sans écrit."],
        ["TVF peut-elle financer automatiquement une rénovation ?", "Non. Les financements doivent être recherchés, vérifiés, accordés et tracés. Aucun soutien ne doit être annoncé comme acquis sans preuve."],
        ["Un bien très dégradé peut-il être étudié ?", "Oui, mais la sécurité, l'accès, les diagnostics, les responsabilités et la faisabilité financière deviennent prioritaires."],
      ]),
    ],
  },
  {
    file: "entreprises.html",
    title: "Entreprises",
    meta:
      "Parcours entreprises TVF : matériaux, compétences, locaux, mécénat, RSE et contribution territoriale.",
    heroImage: "assets/photos/materiaux-renovation-outils.jpg",
    eyebrow: "Entreprises",
    h1: "Transformer une contribution en impact territorial.",
    intro:
      "Les entreprises peuvent contribuer par des matériaux, compétences, locaux, logistique ou mécénat. TVF aide à relier ces contributions à des projets cadrés et traçables.",
    ctas: [["Remplir la fiche", "documents/fiche-entreprise.md"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Contribuer sans déclasser la ressource",
        "TVF aide les entreprises à transformer des ressources disponibles en contribution territoriale utile. Un surplus de chantier, du mobilier, une compétence ou un local ne sont pas traités comme un simple don isolé : ils sont qualifiés, tracés puis reliés à un besoin réel.",
        [
          ["Réemploi", "Donner une seconde utilité à des matériaux ou équipements encore exploitables."],
          ["RSE concrète", "Relier l'engagement de l'entreprise à un projet local documenté."],
          ["Traçabilité", "Conserver les preuves d'affectation, de décision et de communication."],
        ]
      ),
      cards("Formes de contribution", "Chaque contribution doit être décrite, localisée et affectée à un besoin validé.", [
        ["Matériaux", "Surplus, invendus, éléments de chantier ou équipements réutilisables."],
        ["Compétences", "Expertise technique, juridique, logistique, architecturale ou financière."],
        ["Locaux", "Espaces temporairement disponibles ou à remettre en usage."],
        ["Mécénat", "Soutien financier ou en nature avec traçabilité."],
      ]),
      tableSection("Ce que l'entreprise gagne en clarté", "La valeur d'une contribution repose sur son utilité, sa traçabilité et son affectation.", [
        ["Situation", "Risque si rien n'est cadré", "Cadre TVF"],
        ["Matériaux disponibles", "Stockage inutile, gaspillage, coût d'évacuation", "Bordereau, état, quantité, destination possible"],
        ["Compétence proposée", "Action ponctuelle difficile à valoriser", "Mission, périmètre, livrable, compte rendu"],
        ["Local disponible", "Usage flou ou responsabilité mal définie", "Convention, assurance, accès, durée"],
        ["Mécénat", "Communication fragile ou impact non vérifiable", "Projet instruit, budget, reporting"],
      ]),
      tableSection("Bénéfices pour l'entreprise", "Le partenariat doit être utile au territoire et clair pour l'entreprise.", [
        ["Bénéfice", "Description", "Preuve"],
        ["RSE", "Contribution concrète à l'économie circulaire et locale", "Fiche contribution"],
        ["Traçabilité", "Suivi de l'affectation des ressources", "Registre ou convention"],
        ["Ancrage local", "Participation à un projet du territoire", "Compte rendu"],
        ["Communication", "Valorisation possible après accord", "Validation commune"],
      ]),
      enterpriseOperationalSection(),
      enterpriseValueMatrixSection(),
      timeline("Du contact à la contribution", [
        ["1", "Description", "L'entreprise présente ce qu'elle peut apporter : matériaux, locaux, compétences ou soutien."],
        ["2", "Qualification", "TVF vérifie l'état, la disponibilité, la sécurité, la logistique et l'utilité."],
        ["3", "Affectation", "La ressource est orientée vers un projet validé ou mise en attente."],
        ["4", "Formalisation", "Les responsabilités, limites et droits de communication sont écrits."],
        ["5", "Suivi", "La contribution est tracée et peut être valorisée après accord."],
      ]),
      textBlock("Ce que TVF refuse", "TVF n'est pas une déchetterie ni une plateforme de déstockage libre. Les contributions doivent être réutilisables, utiles et compatibles avec un projet validé."),
      faqSection([
        ["Une entreprise peut-elle donner des matériaux ?", "Oui, si les matériaux sont réutilisables, décrits, accessibles, sécurisés et compatibles avec un projet ou une mise en attente cadrée."],
        ["Le logo de l'entreprise sera-t-il affiché ?", "Seulement après accord formalisé. L'utilisation d'un logo suppose une autorisation écrite, un périmètre clair et des règles de communication validées."],
        ["Une contribution peut-elle être refusée ?", "Oui. TVF peut refuser ou réorienter une ressource si elle est dangereuse, inutilisable, impossible à stocker ou sans destination réaliste."],
      ]),
    ],
  },

  {
    file: "benevoles-citoyens.html",
    title: "Bénévoles & citoyens",
    meta:
      "Parcours bénévoles et citoyens de Territoires Vivants France : signaler, participer, documenter et agir localement.",
    heroImage: "assets/photos/jardin-partage-france.jpg",
    eyebrow: "Citoyens",
    h1: "Agir utilement, avec un cadre clair.",
    intro:
      "Les citoyens et bénévoles peuvent aider TVF à repérer les situations, documenter les besoins, participer à des actions encadrées et relayer les projets locaux.",
    ctas: [["Proposer mon aide", "contact.html"], ["Choisir mon parcours", "agir-avec-nous.html"]],
    sections: [
      sectionIntro(
        "Un engagement utile, encadré et progressif",
        "Les bénévoles et citoyens sont essentiels pour repérer, documenter, relayer et participer. Mais l'engagement doit rester sécurisé : pas d'entrée dans un bien privé sans autorisation, pas de chantier sans encadrement, pas de représentation officielle sans mandat.",
        [
          ["Repérer", "Faire remonter une situation visible ou connue localement."],
          ["Documenter", "Aider à collecter des informations vérifiables et utiles."],
          ["Participer", "Rejoindre une mission claire, limitée et encadrée."],
        ]
      ),
      cards("Façons de participer", "L'engagement doit rester simple, utile et sécurisé.", [
        ["Signaler", "Transmettre une situation : bien vacant, commerce fermé, terrain délaissé ou matériau disponible."],
        ["Documenter", "Aider à collecter des informations publiques, photos, contacts et éléments de contexte."],
        ["Participer", "Rejoindre une action locale ou un chantier uniquement lorsqu'il est encadré."],
        ["Relayer", "Mettre en relation TVF avec des acteurs du territoire."],
      ]),
      tableSection("Missions possibles", "Chaque mission doit avoir une durée, un référent et une limite claire.", [
        ["Mission", "Exemple", "Condition"],
        ["Signalement citoyen", "Local fermé, terrain délaissé, matériau disponible", "Rester factuel et respecter la propriété"],
        ["Appui documentaire", "Recherche de sources publiques, photos de contexte, contacts locaux", "Ne pas collecter de données sensibles inutilement"],
        ["Action terrain", "Tri, inventaire, animation, jardin, chantier encadré", "Plan de prévention et référent présent"],
        ["Relais local", "Mettre en relation TVF avec une association, artisan, élu ou habitant", "Ne pas engager TVF sans validation"],
      ]),
      tableSection("Cadre bénévole", "Chaque mission doit être claire avant de commencer.", [
        ["Point", "Question", "Réponse attendue"],
        ["Mission", "Que faut-il faire ?", "Tâche précise et limitée"],
        ["Encadrement", "Qui suit la mission ?", "Référent identifié"],
        ["Sécurité", "Y a-t-il un risque ?", "Consignes et limites"],
        ["Données", "Que peut-on publier ?", "Accord et respect de la vie privée"],
      ]),
      volunteerOperationalSection(),
      volunteerMissionSelectorSection(),
      timeline("Parcours bénévole", [
        ["1", "Se présenter", "Le bénévole indique son territoire, ses disponibilités et ses compétences."],
        ["2", "Choisir une mission", "TVF propose une mission adaptée au besoin et au niveau d'encadrement disponible."],
        ["3", "Cadrer", "Objectifs, limites, sécurité, données et référent sont précisés."],
        ["4", "Agir", "L'action est réalisée dans le cadre défini, avec émargement si nécessaire."],
        ["5", "Restituer", "Un court compte rendu permet de garder une trace utile."],
      ]),
      textBlock("Règle importante", "Un bénévole ne doit jamais entrer dans un bien privé, intervenir sur un chantier ou représenter TVF officiellement sans cadre validé."),
      faqSection([
        ["Puis-je signaler un bien vacant ?", "Oui, mais un signalement reste une information à qualifier. Il ne doit pas conduire à entrer sur un site ou à contacter un propriétaire au nom de TVF sans cadre."],
        ["Puis-je participer à un chantier ?", "Oui uniquement si le chantier est encadré, sécurisé et documenté. TVF doit préciser le référent, les consignes et les limites."],
        ["Faut-il des compétences techniques ?", "Pas forcément. TVF peut avoir besoin de relais locaux, d'appui administratif, de documentation, de communication prudente ou d'aide lors d'actions simples."],
      ]),
    ],
  },
  {
    file: "financeurs-mecenes.html",
    title: "Financeurs & mécènes",
    meta:
      "Parcours financeurs et mécènes TVF : soutenir des projets instruits, avec gouvernance, transparence et suivi d'impact.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Financement",
    h1: "Soutenir des projets cadrés, pas des promesses floues.",
    intro:
      "TVF prépare une logique de financement responsable : chaque soutien doit être relié à un projet instruit, une convention, des indicateurs et une transparence de suivi.",
    ctas: [["Remplir la fiche", "documents/fiche-financeur.md"], ["Voir l'impact", "impact.html"]],
    sections: [
      sectionIntro(
        "Financer ce qui est instruit, mesurable et utile",
        "TVF veut éviter les promesses floues. Un financeur doit savoir quel besoin il soutient, à quel stade se trouve le projet, quelles pièces existent, quelles dépenses sont éligibles, quels risques sont identifiés et quels indicateurs pourront être suivis.",
        [
          ["Clarté", "Un objet de financement précis, rattaché à un dossier."],
          ["Traçabilité", "Un budget, un plan de financement et des justificatifs."],
          ["Impact vérifiable", "Des indicateurs publiés seulement après mesure."],
        ]
      ),
      cards("Ce qui peut être soutenu", "Le financement doit être orienté vers des besoins précis.", [
        ["Diagnostic", "Repérage, qualification et documentation de biens ou ressources."],
        ["Réemploi", "Logistique, stockage, tri et affectation de matériaux réutilisables."],
        ["Projet local", "Remise en usage d'un bien, commerce, local associatif ou espace partagé."],
        ["Insertion", "Chantiers encadrés, bénévolat, formation et accompagnement."],
      ]),
      tableSection("Ce qu'un financeur doit pouvoir vérifier", "La confiance repose sur la preuve, pas sur l'effet d'annonce.", [
        ["Question", "Réponse attendue", "Document utile"],
        ["Quel est le besoin ?", "Bien, ressource, territoire et public concernés", "Fiche projet"],
        ["Quel est le budget ?", "Coûts, postes, devis, reste à financer", "Budget prévisionnel"],
        ["Qui porte quoi ?", "Rôles, responsabilités, convention", "Convention ou lettre d'intention"],
        ["Quels risques ?", "Sécurité, propriété, financement, calendrier", "Matrice des risques"],
        ["Quel impact suivre ?", "Indicateurs réalistes et mesurables", "Grille d'impact"],
      ]),
      tableSection("Garanties attendues", "Un financeur doit pouvoir comprendre ce qu'il soutient.", [
        ["Garantie", "Contenu", "Support"],
        ["Projet instruit", "Besoin, acteurs, risques et objectifs définis", "Fiche projet"],
        ["Cadre", "Responsabilités et modalités de suivi", "Convention"],
        ["Traçabilité", "Utilisation des fonds ou ressources", "Compte rendu"],
        ["Impact", "Indicateurs publiés seulement après vérification", "Grille d'impact"],
      ]),
      financerOperationalSection(),
      financerDueDiligenceSection(),
      timeline("Parcours financeur", [
        ["1", "Échange", "TVF présente le besoin, le territoire et le niveau de maturité du dossier."],
        ["2", "Instruction", "Le financeur examine budget, risques, pièces et objectifs."],
        ["3", "Cadrage", "Les modalités de soutien, de communication et de reporting sont définies."],
        ["4", "Suivi", "L'utilisation du soutien est documentée avec justificatifs."],
        ["5", "Restitution", "TVF transmet un reporting honnête : résultats, limites et suites."],
      ]),
      textBlock("Principe", "TVF ne doit pas promettre un rendement, un impact ou une visibilité qui ne seraient pas contractualisés et vérifiables. Le mécénat et le financement doivent rester transparents."),
      faqSection([
        ["TVF peut-elle garantir un impact chiffré avant projet ?", "Non. Les objectifs peuvent être formulés, mais les résultats ne seront publiés qu'après réalisation et vérification."],
        ["Un financeur peut-il soutenir une phase de diagnostic ?", "Oui. Le diagnostic est souvent l'étape indispensable pour éviter de financer un projet mal cadré."],
        ["Comment TVF rend-elle compte ?", "Avec des pièces de suivi : budget, décisions, compte rendu, preuves d'utilisation, indicateurs et limites clairement mentionnées."],
      ]),
    ],
  },
  {
    file: "partenaires.html",
    title: "Partenaires",
    meta:
      "Devenir partenaire de Territoires Vivants France : collectivités, entreprises, associations, propriétaires, mécènes et financeurs.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Coopération",
    h1: "Construire des partenariats utiles et traçables.",
    intro:
      "Cette page présente les formes de coopération possibles, les responsabilités attendues et le cadre à formaliser avant toute communication publique.",
    ctas: [["Présenter une coopération", "contact.html"], ["Demander les supports", "contact.html"]],
    sections: [
      sectionIntro(
        "Un partenariat doit être utile, formalisé et vérifiable",
        "TVF distingue l'échange exploratoire, la coopération en instruction et le partenariat officialisé. Cette progression évite de communiquer trop vite et permet à chaque acteur de comprendre son rôle exact.",
        [
          ["Utilité", "Le partenariat répond à un besoin territorial, social, environnemental ou économique clairement identifié."],
          ["Cadre", "Les responsabilités, limites, usages, données et modalités de communication sont écrites."],
          ["Preuve", "Chaque contribution peut être suivie : matériau, compétence, financement, local, temps bénévole ou donnée."],
        ]
      ),
      cards("Qui peut coopérer avec TVF ?", "Chaque partenariat doit avoir un objectif, des responsabilités et des preuves. Chaque carte renvoie vers les éléments à préparer avant étude.", [
        ["Collectivités", "Diagnostic, données, périmètre pilote, mise à disposition ou expérimentation locale.", "#pieces-collectivite"],
        ["Entreprises", "Matériaux, compétences, mécénat, locaux, logistique ou expertise technique.", "#pieces-entreprise"],
        ["Associations", "Besoins locaux, usage futur, relais habitants, bénévolat ou projet solidaire.", "#pieces-association"],
        ["Propriétaires", "Bien vacant, commerce, terrain, bâtiment ou immeuble à étudier sans engagement automatique.", "#pieces-proprietaire"],
        ["Particuliers", "Signalement, matériaux disponibles, bénévolat, connaissance locale ou proposition citoyenne.", "#pieces-particulier"],
        ["Financeurs", "Soutien financier, mécénat, investissement à impact, reporting et transparence.", "#pieces-financeur"],
        ["Artisans", "Compétences, diagnostic technique, intervention, devis, conseil ou accompagnement chantier.", "#pieces-artisan"],
        ["Logistique", "Stockage, transport, véhicule, manutention ou mise à disposition temporaire.", "#pieces-logistique"],
      ]),
      partnerPreparationSection(),
      tableSection("Bénéfices par type d'acteur", "Un partenariat TVF doit produire un bénéfice partagé, sans contrepartie floue ni promesse non écrite.", [
        ["Acteur", "Contribution possible", "Bénéfice recherché", "Point à formaliser"],
        ["Collectivité", "Données, locaux, relais institutionnel, expérimentation", "Accélérer une réponse locale et mieux suivre les effets", "Périmètre, gouvernance, usage des données, calendrier"],
        ["Entreprise", "Matériaux, mécénat, compétences, logistique", "Valoriser une démarche RSE concrète et réduire le gaspillage", "Traçabilité, affectation, communication, justificatifs"],
        ["Propriétaire", "Bien vacant, terrain, commerce ou bâtiment à étudier", "Préserver et valoriser un patrimoine tout en répondant à un besoin local", "Droit d'usage, durée, responsabilités, restitution"],
        ["Association", "Besoin d'usage, bénévolat, animation, expertise sociale", "Accéder à un cadre de projet plus lisible et mieux soutenu", "Public concerné, règles d'accueil, sécurité, suivi"],
        ["Financeur", "Soutien financier ou ingénierie de projet", "Appuyer des projets instruits avec reporting et indicateurs", "Objet financé, indicateurs, justificatifs, calendrier de reporting"],
      ]),
      tableSection("Modalités de convention selon le partenariat", "La forme juridique et opérationnelle dépend de ce qui est réellement apporté. TVF doit donc choisir le bon niveau de formalisation avant toute action.", [
        ["Situation", "Convention ou document adapté", "Clauses à prévoir"],
        ["Mise à disposition d'un bien", "Convention d'étude, d'usage temporaire ou de coopération propriétaire", "Durée, accès, assurance, travaux autorisés, restitution, communication"],
        ["Contribution d'une collectivité", "Convention de coopération territoriale ou lettre de cadrage", "Périmètre, données, gouvernance, livrables, calendrier, usage public"],
        ["Don ou valorisation de matériaux", "Fiche contribution, bordereau matériaux, procès-verbal de remise", "État, quantité, retrait, sécurité, affectation, absence de distribution libre"],
        ["Mécénat ou soutien financier", "Convention de mécénat ou lettre d'engagement", "Objet du soutien, montant, calendrier, justificatifs, reporting, règles de visibilité"],
        ["Mission bénévole ou associative", "Fiche mission et consignes d'intervention", "Rôle, encadrement, sécurité, durée, référent, droit à l'image"],
      ]),
      tableSection("Cadre de partenariat", "Un partenariat sérieux se formalise avant communication publique.", [
        ["Étape", "Contenu", "Preuve attendue"],
        ["Intention", "Échange sur le besoin, le territoire et le rôle possible", "Compte rendu"],
        ["Instruction", "Vérification juridique, technique, financière et opérationnelle", "Fiche projet"],
        ["Convention", "Responsabilités, durée, usages, suivi et communication", "Document signé"],
        ["Suivi", "Indicateurs, retours d'expérience et preuves d'action", "Tableau de bord"],
      ]),
      partnerOfficialisationSection(),
      timeline("De l'intention à l'officialisation", [
        ["1", "Premier échange", "Comprendre le besoin, le territoire, la contribution possible et les limites."],
        ["2", "Qualification", "Rassembler les pièces, vérifier la faisabilité et identifier les risques."],
        ["3", "Décision", "Valider si la coopération entre bien dans l'objet TVF et dans les capacités disponibles."],
        ["4", "Convention", "Écrire le rôle de chacun, les engagements, la communication et le suivi."],
        ["5", "Publication", "Afficher le partenariat uniquement lorsque le cadre est validé."],
      ]),
      faqSection([
        ["TVF peut-elle afficher mon logo immédiatement ?", "Un logo ou une mention publique suppose un accord formalisé, afin que le périmètre, la durée et les règles de communication soient clairs pour chacun."],
        ["Une entreprise peut-elle donner des matériaux sans projet identifié ?", "Elle peut signaler une ressource. TVF doit ensuite vérifier l'état, les conditions de récupération et l'affectation possible à un projet validé."],
        ["Une collectivité peut-elle tester TVF sur un périmètre limité ?", "Oui, une coopération peut commencer par un diagnostic, un quartier pilote, une typologie de biens ou une démarche de cartographie progressive."],
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
      "Questions fréquentes sur Territoires Vivants France, ses démarches, ses publics, ses conventions et ses documents.",
    heroImage: "assets/photos/batiment-rural-france.jpg",
    eyebrow: "Questions fréquentes",
    h1: "Comprendre TVF en quelques réponses.",
    intro:
      "Cette FAQ clarifie le rôle de l'association, les étapes d'une démarche, les documents à préparer et les limites de cette première version.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Des réponses utiles avant le premier échange",
        "La FAQ doit éviter les malentendus : TVF n'est ni un guichet automatique, ni une plateforme de dons libres, ni un opérateur public. C'est un cadre de coopération qui demande des informations précises avant toute décision.",
        [
          ["Pour décider", "Comprendre si votre demande entre dans l'objet TVF."],
          ["Pour préparer", "Identifier les pièces, le contexte et les responsabilités à clarifier."],
          ["Pour orienter", "Savoir quelle page ou quel document utiliser avant de contacter l'association."],
        ]
      ),
      tableSection("Réponse rapide par profil", "Chaque public doit pouvoir trouver son premier pas en moins d'une minute.", [
        ["Profil", "Question fréquente", "Première action conseillée", "Page utile"],
        ["Collectivité", "Comment tester TVF sur mon territoire ?", "Préparer le périmètre, les données disponibles et le besoin public", "Espace collectivités"],
        ["Propriétaire", "Que faire avec un bien vacant ou dégradé ?", "Décrire le bien, son état, les contraintes et les usages possibles", "Espace propriétaires"],
        ["Entreprise", "Comment valoriser matériaux ou compétences ?", "Lister les ressources, leur état, leur localisation et les conditions de récupération", "Espace entreprises"],
        ["Bénévole", "Comment aider concrètement ?", "Indiquer ses compétences, disponibilités et territoire d'action", "Bénévoles & citoyens"],
        ["Financeur", "Comment soutenir un projet avec des indicateurs fiables ?", "Demander un dossier instruit avec budget, indicateurs et preuve de suivi", "Financeurs & mécènes"],
      ]),
      tableSection("Avant de contacter TVF", "Ce cadre de lecture évite les demandes trop vagues et accélère l'orientation vers le bon parcours.", [
        ["Situation", "À préparer", "À éviter"],
        ["Bien vacant ou dégradé", "Adresse, photos si possible, statut connu, contraintes d'accès, idée d'usage", "Demander une intervention sans préciser le propriétaire ou le cadre"],
        ["Matériaux disponibles", "Nature, quantité, état, localisation, délai de retrait, conditions de sécurité", "Présenter TVF comme une déchetterie ou un débarras automatique"],
        ["Projet de collectivité", "Périmètre, besoin public, données disponibles, interlocuteurs, calendrier politique", "Lancer une communication avant d'avoir défini le cadre"],
        ["Partenariat entreprise", "Contribution proposée, valeur d'usage, traçabilité, contraintes logistiques", "Afficher un partenariat sans accord écrit"],
        ["Soutien financier", "Objet du financement, budget prévisionnel, indicateurs et reporting attendus", "Demander un résultat chiffré avant réalisation"],
      ]),
      tableSection("Où aller selon votre besoin", "Cette matrice transforme la FAQ en orientation rapide vers le bon parcours public.", [
        ["Besoin", "Page à consulter", "Document conseillé", "Résultat attendu"],
        ["Comprendre l'association", "Qui sommes-nous ?", "Dossier TVF", "Savoir si TVF correspond à votre besoin"],
        ["Proposer un bien", "Propriétaires", "Fiche propriétaire", "Qualifier le bien sans engagement automatique"],
        ["Travailler avec une commune ou un EPCI", "Collectivités", "Fiche collectivité", "Préparer un périmètre de coopération"],
        ["Valoriser des matériaux", "Entreprises", "Fiche entreprise ou bordereau matériaux", "Vérifier l'état, la quantité et l'affectation possible"],
        ["Soutenir financièrement", "Financeurs & mécènes", "Plan de financement", "Évaluer un dossier, ses limites et son reporting"],
        ["Participer bénévolement", "Bénévoles & citoyens", "Fiche mission", "Identifier une mission utile et encadrée"],
      ]),
      faqSection([
        ["Comment TVF progresse-t-elle vers une plateforme opérationnelle ?", "TVF avance par étapes : cadrage des parcours, documents de travail, qualification des demandes, conventions, puis publication d'indicateurs uniquement lorsque les actions sont vérifiées."],
        ["TVF remplace-t-elle les collectivités ou dispositifs publics ?", "Non. TVF se positionne comme un outil de coopération et de coordination. L'association aide à cadrer les besoins, réunir les acteurs et documenter les projets."],
        ["Un propriétaire peut-il proposer un bien ?", "Oui. Il peut présenter un logement, un commerce, un bâtiment ou un terrain inutilisé. TVF étudie ensuite l'état du bien, les contraintes et les usages envisageables."],
        ["Les matériaux sont-ils distribués gratuitement ?", "Non. Les matériaux doivent être orientés vers des projets validés. TVF privilégie la traçabilité, l'utilité territoriale et l'affectation cohérente des ressources."],
        ["Une collectivité peut-elle devenir territoire partenaire ?", "Oui, après un échange de cadrage. Les objectifs, responsabilités, données disponibles et modalités de coopération doivent être formalisés."],
        ["Les chiffres d'impact sont-ils déjà affichés ?", "Non. TVF ne communique pas de résultats non mesurés. Les indicateurs seront publiés lorsqu'ils seront vérifiés et documentés."],
        ["Pourquoi TVF demande-t-elle des pièces avant d'avancer ?", "Parce qu'un bien, un chantier, un don de matériaux ou un financement peut engager des responsabilités. Les pièces permettent de vérifier la faisabilité et de protéger les parties."],
        ["Un projet peut-il être simplement conseillé puis orienté ailleurs ?", "Oui. Si TVF n'est pas le bon cadre, l'association doit pouvoir recommander une orientation plus adaptée plutôt que d'entretenir une promesse impossible."],
        ["Peut-on utiliser les documents TVF comme modèles de travail ?", "Oui, ils sont conçus comme des bases modifiables. Ils doivent toutefois être adaptés au contexte, relus et validés avant toute signature."],
        ["Combien de temps prend une première qualification ?", "Le délai dépend de la qualité des informations transmises. Une demande avec adresse, contexte, interlocuteurs et pièces de base peut être orientée beaucoup plus vite qu'une intention générale."],
        ["TVF peut-elle intervenir sans propriétaire identifié ?", "TVF peut aider à qualifier une situation, mais aucune étude approfondie, visite ou convention ne doit être engagée sans cadre clair et autorisation adaptée."],
        ["Que se passe-t-il après le premier message ?", "TVF doit d'abord comprendre la demande, demander les pièces manquantes, proposer une orientation et décider si un échange, une fiche projet ou une convention est pertinente."],
      ]),
    ],
  },
  {
    file: "notre-methode.html",
    title: "Notre méthode",
    meta:
      "La méthode TVF pour repérer, qualifier, conventionner, mobiliser et suivre les projets de revitalisation territoriale.",
    heroImage: "assets/photos/chantier-renovation-lyon.jpg",
    eyebrow: "Méthode",
    h1: "Une méthode courte, traçable et progressive.",
    intro:
      "TVF avance par étapes pour éviter les promesses floues : comprendre la situation, vérifier les contraintes, réunir les acteurs, formaliser les engagements et suivre ce qui est réellement fait.",
    ctas: [["Préparer un dossier", "documents.html"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Une méthode de décision avant une méthode de communication",
        "La méthode TVF sert d'abord à éviter les confusions : un signalement n'est pas un projet, une intention n'est pas une convention, un objectif n'est pas un résultat et une contribution n'est utile que si elle est affectée à un besoin validé.",
        [
          ["Qualifier", "Rassembler les éléments factuels avant toute annonce."],
          ["Décider", "Vérifier l'utilité, la faisabilité et le niveau de risque."],
          ["Tracer", "Conserver les pièces qui justifient les décisions et les résultats."],
        ]
      ),
      timeline("Les six étapes", [
        ["1", "Repérer", "Identifier un bien, un besoin, une ressource ou une opportunité territoriale."],
        ["2", "Qualifier", "Documenter l'adresse, l'état, les usages possibles, les contraintes et les acteurs concernés."],
        ["3", "Prioriser", "Vérifier si le projet répond à un besoin local réel et si les conditions minimales sont réunies."],
        ["4", "Conventionner", "Formaliser les responsabilités, la durée, les usages, la communication et le suivi."],
        ["5", "Mobiliser", "Rechercher les compétences, matériaux, bénévoles, partenaires et financements nécessaires."],
        ["6", "Suivre", "Documenter les actions, les décisions, les indicateurs et les retours d'expérience."],
      ]),
      tableSection("Critères de décision", "Un projet TVF doit être utile, faisable et traçable.", [
        ["Critère", "Question posée", "Preuve attendue"],
        ["Utilité", "Le projet répond-il à un besoin territorial clair ?", "Besoin décrit, public concerné, usage envisagé"],
        ["Faisabilité", "Les contraintes sont-elles identifiées ?", "État du bien, accès, sécurité, propriété, budget"],
        ["Coopération", "Les acteurs nécessaires sont-ils mobilisables ?", "Référents, contacts, rôle de chaque partie"],
        ["Traçabilité", "Le projet peut-il être documenté ?", "Fiche projet, convention, indicateurs, compte rendu"],
      ]),
      tableSection("De la demande à la décision", "Chaque entrée doit produire une suite lisible, même lorsqu'elle n'aboutit pas immédiatement.", [
        ["Entrée", "Question centrale", "Document utile", "Décision possible"],
        ["Signalement", "Le lieu existe-t-il et peut-il être qualifié ?", "Fiche signalement", "Classer, compléter, visiter ou orienter"],
        ["Bien proposé", "Le propriétaire accepte-t-il une étude et un cadre d'usage ?", "Fiche propriétaire", "Étude, refus motivé ou convention à préparer"],
        ["Matériaux", "La ressource est-elle réemployable et récupérable ?", "Fiche entreprise ou particulier", "Affecter, stocker, refuser ou compléter"],
        ["Projet local", "Le besoin est-il clair et réaliste ?", "Fiche projet", "Prioriser, mettre en attente ou rechercher des partenaires"],
        ["Financement", "Le projet est-il assez cadré pour être présenté ?", "Plan de financement", "Chercher un soutien, retravailler ou reporter"],
      ]),
      tableSection("Niveau de maturité d'un dossier", "Cette synthèse permet d'éviter de présenter trop tôt un dossier comme un projet abouti.", [
        ["Niveau", "Définition", "Ce qui manque souvent", "Suite logique"],
        ["Intention", "Une idée ou un besoin est exprimé", "Adresse, porteur, pièces, contraintes", "Demander les informations minimales"],
        ["Signalement qualifié", "Le lieu, la ressource ou le besoin est documenté", "Accord, accès, état réel, priorités", "Décider d'une visite ou d'une orientation"],
        ["Dossier instruisable", "Les acteurs, risques et usages possibles sont identifiés", "Budget, responsabilités, convention", "Préparer le cadrage opérationnel"],
        ["Projet conventionnable", "Les engagements peuvent être écrits", "Financement, calendrier, validation finale", "Rédiger et valider la convention"],
        ["Action suivie", "Le projet est réalisé ou en cours avec preuves", "Indicateurs consolidés, bilan", "Publier uniquement les résultats vérifiés"],
      ]),
      tableSection("Livrables attendus par étape", "Une méthode institutionnelle doit laisser des traces simples, utiles et réutilisables en réunion.", [
        ["Étape", "Livrable principal", "Utilité pour les partenaires"],
        ["Repérage", "Fiche signalement ou fiche entrée", "Comprendre rapidement la situation"],
        ["Qualification", "Note de diagnostic court", "Identifier risques, pièces manquantes et faisabilité"],
        ["Priorisation", "Grille de décision", "Choisir ce qui avance, attend ou sort du périmètre"],
        ["Convention", "Projet de convention ou lettre de cadrage", "Sécuriser les responsabilités"],
        ["Mobilisation", "Plan d'action et liste des contributions", "Coordonner les acteurs et ressources"],
        ["Suivi", "Tableau d'indicateurs et bilan", "Rendre compte sans exagérer les résultats"],
      ]),
      cards("Ce que la méthode évite", "La méthode sert aussi à protéger le projet.", [
        ["Annonces prématurées", "Ne pas présenter un projet comme acquis tant qu'il n'est pas cadré."],
        ["Flou juridique", "Identifier les responsabilités avant toute action."],
        ["Ressources dispersées", "Affecter les matériaux et contributions à des besoins validés."],
        ["Impact non mesuré", "Distinguer clairement objectifs, actions et résultats."],
      ]),
      faqSection([
        ["Pourquoi autant de documents ?", "Parce qu'un projet territorial implique souvent un bien, des personnes, des responsabilités, des risques, des ressources et des décisions. Les documents évitent les malentendus."],
        ["Une demande peut-elle être refusée ?", "Oui. TVF doit pouvoir refuser, reporter ou réorienter une demande si elle n'est pas conforme à l'objet, trop risquée, insuffisamment documentée ou impossible à suivre."],
        ["La méthode sera-t-elle identique partout ?", "Le socle reste commun, mais chaque territoire devra adapter les priorités, les interlocuteurs, les données et les conventions à son contexte local."],
      ]),
    ],
  },
  {
    file: "impact.html",
    title: "Impact & suivi",
    meta:
      "Indicateurs TVF pour suivre biens remis en usage, matériaux réemployés, projets accompagnés et coopération territoriale avec des preuves claires.",
    heroImage: "assets/photos/saint-etienne-panorama.jpg",
    eyebrow: "Impact",
    h1: "Mesurer avant d'annoncer.",
    intro:
      "Cette page présente les indicateurs qui devront être suivis lorsque les premiers projets seront instruits, conventionnés puis réalisés, avec une méthode de preuve lisible.",
    ctas: [["Voir la transparence", "transparence.html"], ["Demander la grille", "contact.html"]],
    sections: [
      sectionIntro(
        "Mesurer avec méthode",
        "L'impact TVF doit être lu comme une chaîne de preuves. Avant de publier un résultat, il faut savoir d'où vient la donnée, qui l'a validée, à quel projet elle correspond et quelles limites doivent être indiquées.",
        [
          ["Objectifs", "Ce que l'association cherche à atteindre sur un territoire ou un projet."],
          ["Indicateurs", "Ce qui sera mesuré avec une définition stable."],
          ["Résultats", "Ce qui sera publié après réalisation et vérification."],
        ]
      ),
      nationalDataSection("Contexte public à relier aux futurs indicateurs"),
      cards("Indicateurs à suivre", "Les chiffres seront publiés uniquement lorsqu'ils seront vérifiés.", [
        ["Biens qualifiés", "Nombre de logements, commerces, bâtiments, terrains ou friches documentés."],
        ["Biens remis en usage", "Nombre de biens effectivement réactivés après convention et action."],
        ["Matériaux orientés", "Nature, quantité, état et destination des matériaux réemployables."],
        ["Acteurs mobilisés", "Collectivités, propriétaires, entreprises, associations et bénévoles impliqués."],
        ["Projets conventionnés", "Nombre de dossiers disposant d'un cadre signé et d'un suivi."],
        ["Bénéficiaires", "Publics ou usages rendus possibles par le projet."],
      ]),
      tableSection("Lecture des résultats", "Chaque indicateur doit être replacé dans son niveau de preuve.", [
        ["Niveau", "Ce que cela signifie", "Communication possible"],
        ["Objectif", "Ce que TVF souhaite atteindre", "À présenter comme intention"],
        ["Instruction", "Dossier en cours d'analyse", "À présenter comme étude"],
        ["Convention", "Engagement formalisé", "À présenter comme projet cadré"],
        ["Réalisation", "Action terminée et documentée", "À présenter comme résultat"],
      ]),
      tableSection("Preuves attendues par indicateur", "Un indicateur n'a de valeur que si sa définition et sa preuve sont stables.", [
        ["Indicateur", "Définition", "Preuve minimale", "Moment de publication"],
        ["Bien qualifié", "Bien documenté avec adresse, statut, contraintes et usage possible", "Fiche signalement ou fiche propriétaire", "Après qualification interne"],
        ["Projet conventionné", "Projet disposant d'un cadre écrit et accepté", "Convention ou décision formalisée", "Après signature ou validation"],
        ["Matériau réemployé", "Ressource affectée à un projet identifié", "PV de remise, suivi d'affectation, photo ou justificatif", "Après affectation vérifiée"],
        ["Bénévole mobilisé", "Personne ayant participé à une action encadrée", "Feuille d'émargement ou fiche mission", "Après action"],
        ["Impact territorial", "Effet local documenté sur usage, service, cadre de vie ou économie circulaire", "Compte rendu, indicateur, témoignage vérifié", "Après bilan"],
      ]),
      impactDashboardModelSection(),
      impactPublicationRulesSection(),
      textBlock(
        "Pourquoi cette prudence ?",
        "La crédibilité d'une association nationale repose sur la preuve. Un chiffre non vérifié peut fragiliser la confiance des collectivités, propriétaires, financeurs et habitants. TVF préfère publier moins, mais publier juste."
      ),
      faqSection([
        ["Pourquoi ne pas afficher de compteurs dès maintenant ?", "Parce qu'un compteur sans données vérifiées donnerait une impression artificielle. TVF prépare les indicateurs avant de publier des résultats."],
        ["Les objectifs peuvent-ils être affichés ?", "Oui, à condition de les présenter comme des objectifs ou des estimations, jamais comme des résultats réalisés."],
        ["Qui pourra utiliser les indicateurs ?", "Les collectivités, partenaires, financeurs et équipes TVF pourront les utiliser pour suivre les dossiers, décider et rendre compte de manière plus transparente."],
      ]),
    ],
  },
  {
    file: "gouvernance.html",
    title: "Gouvernance & éthique",
    meta:
      "Gouvernance et éthique de Territoires Vivants France : responsabilités, critères de décision, transparence, traçabilité et prévention des risques.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Cadre institutionnel",
    h1: "Une gouvernance lisible pour inspirer confiance.",
    intro:
      "TVF doit être capable de dialoguer avec des collectivités, propriétaires, entreprises et financeurs. Cela suppose un cadre clair : qui décide, sur quels critères, avec quelles preuves et quelles limites de communication.",
    ctas: [["Lire la charte", "documents/charte-ethique.md"], ["Voir la transparence", "transparence.html"]],
    sections: [
      sectionIntro(
        "Une gouvernance pensée pour la confiance",
        "La gouvernance TVF doit permettre de répondre simplement à trois questions : qui porte la décision, pourquoi le dossier est priorisé et comment l'information sera rendue traçable.",
        [
          ["Décider", "Aucun dossier ne doit avancer sans critères lisibles."],
          ["Tracer", "Les étapes, validations et réserves doivent rester consultables."],
          ["Rendre compte", "La communication publique doit rester alignée avec les faits établis."],
        ]
      ),
      tableSection("Repères statutaires", "Les statuts signés le 22 juin 2026 complètent le récépissé de création et donnent un cadre de fonctionnement public.", [
        ["Sujet", "Règle statutaire", "Conséquence pour TVF"],
        ["Durée", "Durée indéterminée", "Permettre un projet national inscrit dans le temps long"],
        ["Membres fondateurs", "Edryan Rangoly et Jordan Lambeau", "Identifier clairement les personnes à l'origine de l'association"],
        ["Bureau", "Président, secrétaire et trésorier", "Organiser la gestion quotidienne et les responsabilités"],
        ["Réunions du bureau", "Au moins deux fois par an", "Assurer un suivi régulier des décisions"],
        ["Assemblées", "Convocation au moins 15 jours avant l'assemblée", "Garantir l'information des membres"],
        ["Voix des membres", "Chaque membre dispose d'une voix", "Préserver une base associative lisible"],
      ]),
      cards("Principes de gouvernance", "Chaque décision doit pouvoir être expliquée simplement.", [
        ["Intérêt général", "Prioriser les projets utiles aux habitants, au territoire et à la transition écologique."],
        ["Traçabilité", "Conserver les éléments qui justifient une décision, une convention ou une affectation de ressource."],
        ["Complémentarité", "Coopérer avec les acteurs existants sans se présenter comme substitut aux dispositifs publics."],
        ["Sobriété", "Communiquer uniquement sur les faits établis, les objectifs assumés et les documents disponibles."],
      ]),
      tableSection("Responsabilités déclarées et à tenir", "Cette organisation prépare une gouvernance lisible sans préjuger des informations administratives officielles à compléter.", [
        ["Fonction", "Rôle attendu", "Preuve ou document associé"],
        ["Présidence", "Porter la vision, représenter l'association et arbitrer les priorités structurantes", "Statuts, registre de décisions, délégations éventuelles"],
        ["Secrétariat", "Tenir les documents, convocations, comptes rendus, registres et suivi administratif", "Procès-verbaux, registre adhérents, registre décisions"],
        ["Trésorerie", "Suivre les dépenses, contributions, justificatifs, budgets et engagements financiers", "Budget prévisionnel, engagement de dépense, reporting"],
        ["Référent dossier", "Qualifier une demande, collecter les pièces et préparer la décision", "Fiche projet, grille d'instruction, compte rendu"],
        ["Comité de suivi", "Examiner les projets sensibles, arbitrer les risques et suivre les engagements", "Ordre du jour, compte rendu, matrice des risques"],
      ]),
      tableSection("Règles de vigilance", "Ces points doivent être vérifiés avant toute décision ou publication.", [
        ["Sujet", "Risque à éviter", "Règle TVF"],
        ["Partenariat", "Afficher un soutien non officialisé", "Ne publier un nom ou un logo qu'après accord réel"],
        ["Projet", "Présenter une intention comme une réalisation", "Indiquer clairement le statut : idée, instruction, convention, réalisation"],
        ["Financement", "Annoncer une aide non obtenue", "Distinguer montant estimé, demandé, accordé, versé"],
        ["Bénévolat", "Engager des personnes sans cadre", "Prévoir mission, consignes, sécurité et émargement"],
        ["Données", "Diffuser une information sensible ou non vérifiée", "Sourcer, anonymiser si nécessaire et limiter la publication"],
      ]),
      tableSection("Processus de décision", "Un dossier ne doit pas passer directement de l'idée à la communication publique.", [
        ["Étape", "Décision attendue", "Preuve ou livrable"],
        ["Réception", "Le besoin entre-t-il dans l'objet TVF ?", "Fiche de contact ou fiche projet"],
        ["Qualification", "Les risques et contraintes sont-ils identifiés ?", "Diagnostic initial"],
        ["Priorisation", "Le projet répond-il à un besoin territorial réel ?", "Barème de priorisation"],
        ["Convention", "Les rôles et responsabilités sont-ils cadrés ?", "Convention adaptée"],
        ["Suivi", "Les résultats peuvent-ils être vérifiés ?", "Grille d'impact"],
      ]),
      timeline("Rythme de suivi", [
        ["1", "Cadrer", "Identifier le référent, le périmètre, les documents et les points de vigilance."],
        ["2", "Décider", "Valider l'intérêt, la faisabilité et les conditions minimales du dossier."],
        ["3", "Formaliser", "Écrire les engagements, usages, limites, responsabilités et modalités de suivi."],
        ["4", "Publier", "Communiquer seulement ce qui est vérifié, signé ou explicitement présenté comme objectif."],
      ]),
      tableSection("Documents de gouvernance à tenir", "Ces supports donnent une base de contrôle compréhensible par une collectivité, un financeur ou un partenaire.", [
        ["Document", "Utilité", "Moment d'utilisation"],
        ["Charte éthique", "Fixer les principes de prudence, transparence, intérêt général et traçabilité", "Avant toute communication institutionnelle"],
        ["Registre de décisions", "Conserver les arbitrages, motifs, responsables et échéances", "À chaque décision significative"],
        ["Critères de sélection", "Prioriser les dossiers avec une grille stable et explicable", "Avant instruction d'un projet"],
        ["Matrice des risques", "Identifier les risques juridiques, techniques, financiers, humains et d'image", "Avant convention ou action terrain"],
        ["Reporting", "Rendre compte de l'usage des ressources, limites et résultats", "Pendant et après un projet"],
      ]),
      textBlock(
        "Responsabilités identifiées",
        "Président fondateur : Edryan Rangoly. Secrétaire et trésorier : M. Lambeau Jordan. TVF dispose d’un récépissé de déclaration de création sous le numéro RNA W423016361 ; toute évolution de gouvernance devra être déclarée et mise à jour sur les supports officiels."
      ),
      faqSection([
        ["Pourquoi une page gouvernance dès maintenant ?", "Parce que la confiance institutionnelle se construit avant les premiers projets. Les règles de décision doivent être visibles dès le départ."],
        ["Qui valide les projets ?", "Les modalités définitives devront être précisées dans les statuts, le règlement intérieur et les procédures internes. Le site présente le cadre de décision attendu."],
        ["Comment éviter les conflits d'intérêts ?", "Chaque décision sensible doit être tracée, motivée et appuyée par des pièces. Une charte éthique doit préciser les règles de déclaration et d'abstention."],
      ]),
    ],
  },
  {
    file: "kit-media.html",
    title: "Kit média",
    meta:
      "Kit média de Territoires Vivants France : logo officiel, présentation, règles de citation et documents presse.",
    heroImage: "assets/photos/saint-etienne-centre-commerce.jpg",
    eyebrow: "Presse & communication",
    h1: "Des éléments publics cohérents et vérifiables.",
    intro:
      "Le kit média centralise les éléments qui peuvent être repris dans une présentation, un article, une note de synthèse ou un échange institutionnel, sans créer de confusion sur l'état réel du projet.",
    ctas: [["Télécharger le dossier TVF", "output/pdf/dossier-presentation-tvf.pdf"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un kit média pour parler juste de TVF",
        "Le kit média sert à harmoniser la présentation publique : mêmes mots, mêmes limites, mêmes visuels, même exigence de preuve. Il évite qu'un article, un post ou une présentation donne une impression plus avancée que la réalité du projet.",
        [
          ["Identifier", "Utiliser le logo officiel, le nom complet et les formulations validées."],
          ["Expliquer", "Présenter TVF comme une association nationale de coopération territoriale."],
          ["Protéger", "Ne pas annoncer de partenaires, chiffres ou résultats non formalisés."],
        ]
      ),
      tableSection("Quel support utiliser ?", "Le kit média doit aider chaque interlocuteur à choisir le bon niveau d'information.", [
        ["Usage", "Support recommandé", "Précaution"],
        ["Rendez-vous institutionnel", "Dossier TVF PDF et dossier collectivité", "Présenter les objectifs comme un cadre de travail, pas comme des résultats acquis"],
        ["Article ou interview", "Pitch officiel, présentation courte et coordonnées", "Vérifier les citations et ne pas transformer une piste en partenariat"],
        ["Publication réseaux sociaux", "Scripts réseaux sociaux, logo officiel, visuels crédités", "Rester sobre sur les chiffres et renvoyer vers les pages sources"],
        ["Démarche entreprise", "Dossier entreprise et mécène, fiche contribution", "Préciser traçabilité, usage des logos et reporting"],
        ["Présentation propriétaire", "Dossier propriétaire et fiche bien solidaire", "Expliquer que l'étude ne crée pas d'engagement automatique"],
      ]),
      cards("Éléments disponibles", "Des supports simples pour parler de TVF avec justesse.", [
        ["Logo officiel", "Utiliser le logo officiel TVF sans le déformer, le recadrer excessivement ou modifier ses couleurs.", "assets/logo-territoires-vivants-france.png"],
        ["Présentation courte", "TVF coordonne la remise en usage de biens, lieux et ressources inutilisés au service des territoires.", "documents/kit-media.md"],
        ["Dossier TVF", "Un document de présentation plus complet pour collectivités, entreprises et financeurs.", "documents/dossier-presentation-tvf.md"],
        ["Dossier de contact TVF", "Coordonnées, services, pôles, actions et informations à préparer avant un premier échange.", "documents/dossier-contact-tvf.md"],
        ["Dossier prospection Saint-Étienne", "Contacts à solliciter, priorités, angles d'approche et scripts pour lancer TVF localement.", "documents/dossier-prospection-saint-etienne.md"],
        ["Glossaire et annuaire Saint-Étienne", "Contacts par secteur, pôles, chantiers d'insertion, matériaux, stockage et suivi de prospection.", "documents/glossaire-annuaire-contacts-saint-etienne.md"],
        ["Kit courriers prêts à l'emploi", "Modèles prêts à adapter pour demander un rendez-vous, des matériaux, un local, un partenariat ou un soutien.", "documents/kit-courriers-partenariats-demandes-tvf.md"],
        ["Dossier TVF PDF", "Version prête à transmettre pour une première présentation institutionnelle.", "output/pdf/dossier-presentation-tvf.pdf"],
        ["Dossier collectivité PDF", "Support ciblé pour commune, EPCI, département, région ou service public.", "output/pdf/dossier-collectivite-tvf.pdf"],
        ["Dossier entreprise et mécène PDF", "Support ciblé pour contribution, RSE, mécénat, matériaux et reporting.", "output/pdf/dossier-entreprise-mecene-tvf.pdf"],
        ["Dossier propriétaire PDF", "Support ciblé pour présenter un bien sans créer d'engagement automatique.", "output/pdf/dossier-proprietaire-tvf.pdf"],
        ["Pitch officiel", "Des versions 30 secondes, 1 minute, 3 minutes et dossier institutionnel.", "documents/pitch-officiel-tvf.md"],
        ["Scripts rendez-vous", "Des trames adaptées aux collectivités, propriétaires, entreprises et financeurs.", "documents/scripts-rendez-vous-institutionnels.md"],
        ["Objections réponses", "Des réponses crédibles aux questions sensibles avant un rendez-vous.", "documents/objections-reponses.md"],
        ["Scripts réseaux sociaux", "Des scripts vidéo, carrousels et posts pour lancer la communication TVF.", "documents/scripts-video-reseaux-sociaux.md"],
        ["Crédits images", "Les visuels utilisés sur le site sont documentés dans le fichier de crédits.", "assets/photos/CREDITS.md"],
      ]),
      tableSection("Règles d'usage visuel", "La cohérence graphique contribue directement à la crédibilité institutionnelle.", [
        ["Élément", "Usage recommandé", "À éviter"],
        ["Logo", "Utiliser les fichiers officiels, conserver les proportions et laisser une zone de respiration", "Déformer, recolorer, compresser ou placer sur un fond illisible"],
        ["Photographies", "Privilégier des images françaises, territoriales, humaines et liées au sujet", "Images génériques, répétées ou sans lien avec la revitalisation"],
        ["Couleurs", "Respecter la palette TVF : vert, bleu profond, blanc cassé et accents sobres", "Multiplier les couleurs ou utiliser des effets trop décoratifs"],
        ["Chiffres", "Citer uniquement des données sourcées ou des objectifs clairement nommés", "Transformer une hypothèse en résultat"],
      ]),
      tableSection("Formulations recommandées", "Les mots utilisés doivent rester précis et crédibles.", [
        ["Sujet", "Formulation recommandée", "À éviter"],
        ["Nature", "Association loi 1901 déclarée, en déploiement progressif", "Institution publique ou opérateur officiel"],
        ["Rôle", "Plateforme de coopération et de coordination territoriale", "Remplacement des collectivités ou dispositifs existants"],
        ["Impact", "Indicateurs à mesurer après projets conventionnés", "Résultats chiffrés non vérifiés"],
        ["Partenaires", "Partenaires à afficher uniquement après accord réel", "Logos ou références non officialisés"],
      ]),
      tableSection("Éléments de langage prêts à reprendre", "Ces formulations permettent de présenter TVF avec un ton institutionnel, sans surpromesse.", [
        ["Format", "Texte recommandé", "Usage"],
        ["Phrase courte", "Territoires Vivants France coordonne la remise en usage de lieux, biens et ressources inutilisés au service des territoires.", "Signature de présentation"],
        ["Phrase institutionnelle", "TVF aide collectivités, propriétaires, entreprises, associations, citoyens et financeurs à transformer des situations vacantes en projets cadrés, documentés et utiles localement.", "Dossier, rendez-vous, communiqué"],
        ["Angle écologique", "La démarche relie sobriété foncière, réemploi des matériaux, revitalisation locale et suivi d'impact.", "Présentation transition écologique"],
        ["Angle social", "TVF cherche à créer des parcours d'engagement, de bénévolat et d'insertion autour de projets territoriaux concrets.", "Présentation associations et habitants"],
        ["Angle économique", "Le modèle vise à réactiver des ressources existantes plutôt qu'à laisser des bâtiments, commerces ou matériaux sortir de l'usage.", "Présentation entreprises et financeurs"],
      ]),
      tableSection("Checklist avant diffusion externe", "Avant une publication, chaque support doit être relu comme s'il était envoyé à une collectivité ou à un financeur.", [
        ["Point de contrôle", "Question à poser", "Validation attendue"],
        ["Exactitude", "Le texte annonce-t-il uniquement ce qui est établi ?", "Aucune promesse non vérifiée"],
        ["Sources", "Les chiffres et données sont-ils sourcés ou présentés comme objectifs ?", "Source, date ou mention d'objectif"],
        ["Image", "Le visuel correspond-il au sujet et respecte-t-il la charte ?", "Logo lisible, photo cohérente, crédits disponibles"],
        ["Partenariat", "Un logo ou un nom externe est-il autorisé ?", "Accord réel ou retrait de la mention"],
        ["Action attendue", "Le lecteur sait-il quoi faire ensuite ?", "CTA clair vers contact, document ou parcours"],
      ]),
      timeline("Validation avant diffusion", [
        ["1", "Choisir le support", "Utiliser le dossier, la fiche ou le pitch adapté à l'interlocuteur."],
        ["2", "Vérifier les faits", "Contrôler les sources, dates, statuts de projet, noms et autorisations de logo."],
        ["3", "Adapter le message", "Conserver le sens TVF sans promettre plus que ce qui est établi."],
        ["4", "Valider la publication", "Faire relire les contenus sensibles avant diffusion externe."],
      ]),
      textBlock(
        "Règle de communication",
        "TVF doit rester exigeante dans sa communication : chaque partenaire, résultat ou engagement public doit être vérifiable, cadré et cohérent avec l'état réel du projet. Cette discipline éditoriale protège l'association, les partenaires et les futurs bénéficiaires."
      ),
      faqSection([
        ["Un journaliste peut-il reprendre les textes du site ?", "Il peut s'appuyer sur les formulations publiques, à condition de ne pas transformer les objectifs en résultats ni les pistes en partenariats officialisés."],
        ["Quel logo utiliser ?", "Le logo officiel fourni dans les assets du site doit être utilisé sans modification de proportions, de couleurs ou de composition."],
        ["TVF peut-elle fournir des visuels pour une présentation ?", "Oui, les visuels disponibles doivent être choisis pour leur cohérence avec le sujet et accompagnés des crédits lorsqu'ils existent."],
      ]),
    ],
  },
  {
    file: "contact.html",
    title: "Contact",
    meta:
      "Demander un rendez-vous ou contacter Territoires Vivants France : collectivité, propriétaire, entreprise, financeur, bénévole ou partenaire.",
    heroImage: "assets/photos/saint-etienne-rue-resistance.jpg",
    eyebrow: "Contact",
    h1: "Préparer un échange utile avec TVF.",
    intro:
      "Que vous soyez collectivité, propriétaire, entreprise, financeur, association ou citoyen, l'objectif est simple : décrire la situation, identifier le bon parcours et préparer une suite claire.",
    ctas: [["Demander un rendez-vous", "#contact-form"], ["Préparer les pièces", "documents.html"]],
    sections: [
      sectionIntro(
        "Un bon contact commence par une situation claire",
        "TVF n'attend pas un dossier parfait dès le premier message. En revanche, quelques informations de base permettent de comprendre rapidement le territoire, le type de besoin, les acteurs déjà identifiés et la suite à préparer.",
        [
          ["Qui ?", "Indiquer votre profil : collectivité, propriétaire, entreprise, association, habitant, financeur."],
          ["Quoi ?", "Décrire le bien, le matériau, le projet, le besoin ou la coopération envisagée."],
          ["Où ?", "Préciser la commune, le quartier, l'adresse si elle peut être transmise et les contraintes connues."],
        ]
      ),
      contactAppointmentSection(),
      contactProfileTriageSection(),
      contactDetailsSection(),
      socialContactSection(),
      contactSection(),
      firstMeetingSection(),
      tableSection("Informations utiles à transmettre", "Ces éléments facilitent un premier tri sans créer d'engagement automatique.", [
        ["Type de demande", "Informations à préparer", "Document conseillé"],
        ["Bien vacant", "Adresse, propriétaire, état apparent, photos, usages possibles, contraintes", "Fiche propriétaire ou signalement"],
        ["Matériaux", "Catégorie, quantité, état, localisation, date possible de récupération", "Fiche entreprise ou fiche signalement"],
        ["Collectivité", "Périmètre, besoin public, données disponibles, interlocuteur, calendrier", "Fiche collectivité"],
        ["Partenariat", "Objectif, contribution possible, limites, mode de communication souhaité", "Fiche partenaire ou entreprise"],
        ["Financement", "Projet concerné, budget, statut du dossier, indicateurs attendus", "Fiche financeur"],
      ]),
      timeline("Après votre message", [
        ["1", "Réception", "La demande est lue comme une première information, sans engagement automatique."],
        ["2", "Orientation", "TVF identifie le bon parcours : collectivité, propriétaire, entreprise, citoyen, financeur ou partenaire."],
        ["3", "Complément", "Les pièces ou informations manquantes peuvent être demandées avant toute décision."],
        ["4", "Cadrage", "Si la demande entre dans l'objet TVF, un échange ou un document de cadrage peut être proposé."],
      ]),
      textBlock(
        "Siège national",
        `Territoires Vivants France - ${official.status}. RNA : ${official.rna}. SIREN : ${official.siren}. SIRET du siège : ${official.siret}. Siège national : ${contact.address}. E-mail : ${contact.email}. Téléphone : ${contact.phone}. Président fondateur : Edryan Rangoly. Secrétaire et trésorier : M. Lambeau Jordan.`
      ),
      faqSection([
        ["Que faut-il écrire dans le premier message ?", "Indiquez votre profil, le territoire concerné, le type de demande, les informations déjà disponibles et ce que vous attendez de TVF."],
        ["Un message vaut-il engagement ?", "Non. Un message ouvre un échange. Les engagements éventuels doivent être ensuite cadrés, validés et formalisés."],
        ["Puis-je joindre des photos ou pièces ?", "Oui, lorsqu'un canal de transmission adapté est défini. Évitez de transmettre des informations sensibles sans cadre clair."],
      ]),
    ],
  },
  {
    file: "transparence.html",
    title: "Transparence",
    meta:
      "Transparence de Territoires Vivants France : gouvernance, preuve, publication des données, registres de suivi et feuille de route publique.",
    heroImage: "assets/photos/friche-industrielle-ronchamp.jpg",
    eyebrow: "Transparence",
    h1: "Avancer avec méthode et preuve.",
    intro:
      "TVF distingue clairement les informations établies, les objectifs publics, les dossiers à instruire et les éléments qui devront être validés par convention, source ou preuve avant publication.",
    ctas: [["Documents", "documents.html"], ["Contact", "contact.html"]],
    sections: [
      sectionIntro(
        "Une transparence utile, pas décorative",
        "La transparence TVF doit aider les visiteurs à comprendre l'état réel du projet : ce qui est déjà cadré, ce qui relève de l'objectif et ce qui devra être validé avant d'être annoncé publiquement.",
        [
          ["Établi", "Informations institutionnelles, documents préparatoires, méthode et responsabilités connues."],
          ["À instruire", "Dossiers, partenariats, financements et projets avant convention."],
          ["À publier", "Résultats, impacts et partenaires uniquement après vérification."],
        ]
      ),
      cards("Principes de publication", "Une règle simple : pas de chiffres ni de partenaires inventés.", [
        ["Données", "Publier uniquement des données sourcées ou des objectifs explicitement identifiés."],
        ["Partenariats", "Afficher les partenaires seulement lorsqu'un accord réel existe."],
        ["Projets", "Distinguer projet envisagé, projet en instruction et projet réalisé."],
        ["Impact", "Mesurer avant de communiquer des résultats."],
        ["Gouvernance", "Rendre lisibles les responsabilités, les décisions et les critères de sélection.", "gouvernance.html"],
        ["Kit média", "Mettre à disposition les éléments publics validés et les règles d'usage.", "kit-media.html"],
        ["Éléments en attente", "Tenir une liste des informations officielles à publier uniquement après preuve.", "documents/registre-elements-officiels-en-attente.md"],
      ]),
      tableSection("Éléments officiels mis en attente", "Ces informations doivent rester en attente tant qu'elles ne sont pas vérifiées, attribuées ou autorisées à la publication.", [
        ["Élément", "Statut de publication", "Preuve attendue"],
        ["Références administratives", `RNA ${official.rna} ; SIREN ${official.siren} ; SIRET du siège ${official.siret}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Partenaires", "Ne pas afficher sans accord réel", "Convention, courrier, autorisation de logo"],
        ["Financeurs ou mécènes", "Ne pas présenter comme acquis sans décision", "Convention, notification, accord écrit"],
        ["Projets réalisés", "Ne pas communiquer avant réalisation vérifiée", "Compte rendu, convention, photos autorisées, indicateurs"],
        ["Chiffres d'impact", "Ne pas publier sans méthode de calcul", "Grille d'impact, source, date, preuve"],
      ]),
      textBlock(
        "Références administratives publiées",
        "TVF dispose du numéro RNA W423016361 et de l’identifiant SIREN 107 226 128, avec SIRET du siège 107 226 128 00018, selon l’avis de situation SIRENE du 7 juillet 2026. Les informations d’hébergement et toute évolution statutaire devront rester appuyées par une pièce officielle."
      ),
      tableSection("Statuts et transparence associative", "Les statuts précisent le cadre de fonctionnement interne et les ressources autorisées. Le site en publie une synthèse sans rendre les documents internes librement téléchargeables.", [
        ["Point statutaire", "Ce qui est prévu", "Publication sur le site"],
        ["Objet", "Revitalisation des territoires, habitat, commerces, friches, réemploi, insertion, solidarité et accompagnement", "Synthèse publique dans les pages institutionnelles"],
        ["Ressources", "Cotisations, subventions, prestations, dons et ressources autorisées par la loi", "Présentation sans annoncer de financement non obtenu"],
        ["Indemnités", "Fonctions exercées librement et volontairement, remboursements possibles sur justificatifs", "Principe de prudence et de traçabilité"],
        ["Dissolution", "Actif net non réparti entre les membres et attribué à une structure d'intérêt général ou objet similaire", "Garantie d'intérêt général"],
      ]),
      tableSection("Ce qui peut être publié", "Chaque information doit être reliée à son niveau de preuve.", [
        ["Information", "Publication possible", "Condition"],
        ["Objectif", "Oui", "Mentionner qu'il s'agit d'une intention ou d'une cible"],
        ["Projet en discussion", "Avec prudence", "Ne pas le présenter comme acquis"],
        ["Partenaire", "Oui", "Accord ou convention réelle"],
        ["Montant de financement", "Oui", "Distinguer demandé, accordé, conventionné et versé"],
        ["Résultat d'impact", "Oui", "Après réalisation, preuve et méthode de calcul"],
      ]),
      tableSection("Niveaux de preuve avant publication", "Cette règle éditoriale permet de publier avec confiance sans inventer de résultat, de partenaire ou de financement.", [
        ["Niveau", "Ce que cela signifie", "Peut être publié ?", "Formulation recommandée"],
        ["Information reçue", "Un acteur a transmis une indication non vérifiée", "Non, sauf mention interne", "Information à qualifier"],
        ["Dossier qualifié", "Les pièces minimales existent et le sujet entre dans l'objet TVF", "Oui avec prudence", "Dossier à l'étude"],
        ["Accord écrit", "Un accord, courrier ou convention encadre la relation", "Oui", "Coopération formalisée"],
        ["Action réalisée", "L'action est terminée ou suffisamment documentée", "Oui", "Action réalisée, avec preuves"],
        ["Impact mesuré", "Les résultats sont calculés avec méthode et sources", "Oui", "Résultat vérifié, source et date"],
      ]),
      tableSection("Registres à tenir", "Ces registres transforment la transparence en méthode de travail concrète.", [
        ["Registre", "Ce qu'il trace", "Pourquoi c'est utile"],
        ["Demandes entrantes", "Origine, profil, territoire, objet, statut et prochaine action", "Ne pas perdre les sollicitations et prioriser proprement"],
        ["Décisions", "Motif, responsable, date, réserves et pièces consultées", "Pouvoir expliquer pourquoi un dossier avance ou non"],
        ["Partenariats", "Type d'accord, périmètre, durée, communication autorisée", "Éviter les faux partenaires et les ambiguïtés publiques"],
        ["Financements", "Montants estimés, demandés, accordés, conventionnés et versés", "Ne jamais confondre piste de financement et ressource acquise"],
        ["Impact", "Indicateurs, sources, limites et preuves disponibles", "Publier des résultats vérifiables"],
      ]),
      timeline("Feuille de route sobre", [
        ["1", "Structurer", "Documents, statuts, conventions, critères de sélection."],
        ["2", "Expérimenter", "Territoire pilote, premiers diagnostics, premiers contacts."],
        ["3", "Formaliser", "Partenariats, financements, projets validés."],
        ["4", "Déployer", "Antennes locales et observatoire national lorsque la méthode est éprouvée."],
      ]),
      faqSection([
        ["Pourquoi regrouper les éléments prudents sur cette page ?", "Pour éviter de répéter partout le même message et permettre aux autres pages d'aller directement au sujet."],
        ["TVF peut-elle publier des objectifs chiffrés ?", "Oui, si la page précise clairement qu'il s'agit d'objectifs, d'hypothèses ou d'estimations, et non de résultats réalisés."],
        ["Quand les résultats seront-ils publiés ?", "Lorsqu'un projet aura été instruit, conventionné, réalisé puis documenté avec une méthode de preuve cohérente."],
      ]),
    ],
  },
  {
    file: "mentions-legales.html",
    title: "Mentions légales",
    meta:
      "Mentions légales de Territoires Vivants France : éditeur, contact, siège, données personnelles, propriété intellectuelle et responsabilités.",
    heroImage: "assets/photos/batiment-rural-france.jpg",
    eyebrow: "Cadre légal",
    h1: "Mentions légales.",
    intro:
      "Cette page centralise les informations publiques de référence et prévoit les champs administratifs à actualiser à chaque évolution officielle de l'association.",
    ctas: [["Contact", "contact.html"], ["Transparence", "transparence.html"]],
    sections: [
      sectionIntro(
        "Un cadre légal évolutif et vérifiable",
        "Les mentions légales doivent rester simples, exactes et faciles à mettre à jour. Cette page distingue les informations déjà connues, les éléments administratifs qui seront ajoutés après formalisation et les règles de prudence applicables au site.",
        [
          ["Identité", "Nom, adresse, responsables identifiés et objet de présentation."],
          ["Conformité", "Données personnelles, propriété intellectuelle, responsabilité éditoriale."],
          ["Évolution", "Rubriques prévues pour intégrer les références officielles après formalisation."],
        ]
      ),
      tableSection("Informations à tenir à jour", "Ce cadre de lecture permet de vérifier rapidement les mentions à compléter lorsque l'association évolue.", [
        ["Information", "Statut actuel", "Action à prévoir"],
        ["Adresse du siège", "25 rue Élise Gervais, 42000 Saint-Étienne", "Maintenir à jour en cas de changement"],
        ["Responsables", "Président fondateur, secrétaire et trésorier identifiés", "Actualiser après toute décision statutaire"],
        ["Numéro RNA", `${official.rna}`, `${official.receiptLabel}, délivré à ${official.receiptPlace} le ${official.receiptDate}`],
        ["Numéro SIREN", `${official.siren}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Contact officiel", `${contact.email} - ${contact.phone}`, "Maintenir à jour les canaux publics de contact"],
        ["Hébergement", "Vercel Inc. - https://vercel.com", "Site hébergé et déployé via Vercel ; coordonnées complètes à vérifier depuis le compte contractuel"],
        ["Prestataires techniques", "Vercel, Supabase, Brevo et GitHub selon les services activés", "Maintenir à jour les services réellement utilisés pour l'hébergement, les formulaires, les notifications et le déploiement"],
      ]),
      tableSection("Procédure de mise à jour légale", "Les mentions légales doivent être actualisées dès qu'une information officielle change.", [
        ["Déclencheur", "Vérification à faire", "Pièce attendue"],
        ["Déclaration officielle", `RNA ${official.rna} - déclaration du ${official.declarationDate}`, `${official.receiptLabel}`],
        ["Attribution SIREN", `${official.siren} - SIRET du siège ${official.siret}`, `Avis de situation SIRENE du ${official.sireneDate}`],
        ["Changement d'adresse", "Mettre à jour siège, contact et supports publics", "Décision interne ou document administratif"],
        ["Évolution des responsables", "Actualiser les noms, fonctions et responsabilités affichées", "Procès-verbal ou décision statutaire"],
        ["Changement d'hébergement", "Mettre à jour l'identité de l'hébergeur et les informations obligatoires", "Contrat, facture ou fiche hébergeur"],
        ["Activation d'un nouveau prestataire", "Mettre à jour les mentions légales et la politique de confidentialité", "Contrat, documentation RGPD, finalité et lieu de traitement"],
      ]),
      tableSection("Informations issues des statuts", "Les statuts signés le 22 juin 2026 complètent les informations administratives issues du récépissé.", [
        ["Information", "Contenu statutaire", "Publication"],
        ["Dénomination", "TERRITOIRES VIVANTS FRANCE", "Publiée"],
        ["Sigle", "TVF", "Publié"],
        ["Siège social", "25 rue Élise Gervais, 42000 Saint-Étienne", "Publié"],
        ["Durée", "Indéterminée", "Publiée"],
        ["Membres fondateurs", "Edryan Rangoly et Jordan Lambeau", "Publiés"],
        ["Exercice social", "Durée d'un an", "Synthèse publique"],
      ]),
      legalSection(),
      faqSection([
        ["Pourquoi certaines informations restent-elles à compléter ?", `TVF dispose désormais du RNA ${official.rna}, du SIREN ${official.siren} et du SIRET du siège ${official.siret}. Seuls les éléments évolutifs, comme les coordonnées contractuelles complètes de l’hébergeur, une modification statutaire ou une évolution de gouvernance, doivent être complétés après preuve officielle.`],
        ["Les documents du site ont-ils une valeur juridique automatique ?", "Non. Ils servent de bases de travail et doivent être adaptés, relus et validés avant toute signature ou engagement."],
        ["Qui contacter en cas de demande relative aux données personnelles ?", `Les demandes peuvent être adressées à ${contact.email} ou préparées depuis la page contact. TVF devra ensuite traiter chaque demande selon le RGPD et les finalités réellement concernées.`],
      ]),
    ],
  },


  {
    file: "politique-confidentialite.html",
    title: "Politique de confidentialité",
    meta:
      "Politique de confidentialité de Territoires Vivants France : données collectées, finalités, bases légales, durées de conservation, droits et contact RGPD.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Données personnelles",
    h1: "Une politique de confidentialité claire et évolutive.",
    intro:
      "Territoires Vivants France limite la collecte aux informations nécessaires pour répondre aux demandes, instruire les propositions et préparer les coopérations territoriales. Cette page précise le cadre actuel du site et les informations à compléter si de nouveaux services numériques sont activés.",
    ctas: [["Exercer vos droits", "contact.html"], ["Mentions légales", "mentions-legales.html"]],
    sections: [
      sectionIntro(
        "Un cadre RGPD proportionné au fonctionnement actuel",
        "Le site public présente TVF, ses parcours et ses documents. Les formulaires de contact et d'engagement peuvent désormais transmettre une demande à TVF via une fonction sécurisée du site, puis l'enregistrer dans l'outil Supabase configuré côté Vercel. Ils ne doivent pas être confondus avec une plateforme de compte utilisateur ou une base opérationnelle publique.",
        [
          ["Minimisation", "Ne demander que les informations utiles au traitement de la demande."],
          ["Transparence", "Expliquer pourquoi les données sont collectées, qui y accède et pendant combien de temps."],
          ["Traçabilité", "Tenir un registre interne des demandes, décisions et accès autorisés."],
        ]
      ),
      tableSection("Responsable du traitement", "Ces informations permettent d'identifier clairement l'organisme à contacter pour toute question liée aux données personnelles.", [
        ["Élément", "Information"],
        ["Organisme", "Territoires Vivants France"],
        ["Statut", official.status],
        ["RNA", official.rna],
        ["Siège", contact.address],
        ["Contact RGPD", `${contact.email} - ${contact.phone}`],
      ]),
      tableSection("Données traitées selon les situations", "TVF doit conserver une logique de sobriété : aucune information sensible ne doit être demandée si elle n'est pas nécessaire au dossier.", [
        ["Situation", "Données possibles", "Utilité"],
        ["Demande de contact", "Nom, prénom, organisation, e-mail, téléphone, commune, message", "Répondre, orienter la demande et proposer un rendez-vous"],
        ["Signalement ou proposition de bien", "Adresse ou commune, description, type de bien, informations transmises volontairement", "Qualifier le sujet, vérifier le périmètre et préparer une éventuelle instruction"],
        ["Proposition de matériaux", "Type de ressource, quantité, localisation, état, coordonnées du contributeur", "Évaluer l'intérêt, la faisabilité logistique et l'affectation possible"],
        ["Bénévolat ou partenariat", "Profil, compétences, disponibilité, structure, territoire", "Identifier une mission, un interlocuteur ou une coopération pertinente"],
        ["Navigation du site", "Données techniques éventuellement traitées par l'hébergeur", "Sécurité, disponibilité et fonctionnement technique du site"],
      ]),
      tableSection("Finalités et bases légales", "Chaque traitement doit avoir une finalité précise et une base juridique adaptée. Les bases ci-dessous doivent être confirmées dans le registre interne selon les usages réels.", [
        ["Finalité", "Base légale envisagée", "Exemple"],
        ["Répondre aux demandes", "Intérêt légitime de l'association", "Réponse à un message, orientation vers le bon parcours"],
        ["Préparer une coopération", "Mesures précontractuelles ou intérêt légitime", "Étude d'une proposition de bien, de matériaux ou de partenariat"],
        ["Gérer l'adhésion ou la vie associative", "Contrat, obligation légale ou statutaire selon le cas", "Suivi des membres, justificatifs administratifs"],
        ["Sécuriser le site", "Intérêt légitime", "Logs techniques, prévention des abus"],
        ["Envoyer une newsletter", "Consentement", "Uniquement si un module d'inscription est activé"],
      ]),
      tableSection("Stockage et destinataires", "Les destinataires doivent rester limités aux personnes et prestataires nécessaires au traitement.", [
        ["Lieu ou outil", "Données concernées", "Accès"],
        ["Navigateur de l'utilisateur", "Brouillons ou informations préparées localement si le parcours le prévoit", "Utilisateur uniquement, jusqu'à effacement local"],
        ["Messagerie TVF", "Demandes envoyées par e-mail", "Personnes habilitées à traiter les demandes"],
        ["Hébergement Vercel", "Données techniques liées au fonctionnement du site", "Prestataire d'hébergement et de déploiement"],
        ["Base Supabase des demandes", "Demandes envoyées depuis les formulaires publics lorsque l'utilisateur valide l'envoi", "Personnes habilitées TVF et prestataires techniques nécessaires au traitement"],
        ["Fournisseur e-mail transactionnel", "Adresse e-mail et contenu nécessaire à la notification interne ou à l'accusé de réception", "Prestataire d'envoi configuré côté Vercel, uniquement si le service est activé"],
      ]),
      tableSection("Durées de conservation indicatives", "Ces durées servent de cadre de départ. Elles devront être validées dans le registre RGPD interne et adaptées aux obligations applicables.", [
        ["Catégorie", "Durée recommandée", "Point de vigilance"],
        ["Demande de contact sans suite", "Jusqu'à 3 ans après le dernier échange", "Supprimer ou anonymiser si la demande n'a plus d'utilité"],
        ["Dossier en cours", "Durée d'instruction puis archivage proportionné", "Conserver les preuves utiles sans excès"],
        ["Adhésion, comptabilité, pièces administratives", "Selon les obligations légales et statutaires", "Séparer les archives administratives des demandes ordinaires"],
        ["Newsletter future", "Jusqu'au retrait du consentement", "Prévoir un lien de désinscription"],
        ["Brouillon local", "Jusqu'à suppression par l'utilisateur", "Informer que l'utilisateur garde la maîtrise de son navigateur"],
      ]),
      textBlock(
        "Vos droits",
        "Toute personne concernée peut demander l'accès à ses données, leur rectification, leur effacement, la limitation du traitement, l'opposition au traitement ou, lorsque cela s'applique, la portabilité. Une personne peut également retirer son consentement lorsqu'un traitement repose sur le consentement. Les demandes peuvent être adressées à TVF par e-mail ou depuis la page contact. En cas de difficulté persistante, une réclamation peut être introduite auprès de la CNIL.",
        [["Contacter TVF", "contact.html"], ["CNIL", "https://www.cnil.fr/fr/agir"]]
      ),
      tableSection("Cookies et traceurs", "Le site doit rester sobre tant qu'aucun outil de mesure d'audience ou de publicité n'est nécessaire.", [
        ["Traceur", "Statut", "Action à prévoir"],
        ["Cookies strictement nécessaires", "Possibles si requis par le fonctionnement du site", "Informer simplement"],
        ["Mesure d'audience", "À activer seulement si nécessaire", "Vérifier l'exemption ou demander le consentement selon l'outil"],
        ["Publicité, pixels sociaux, remarketing", "Non prévus dans la version actuelle", "Bannière de consentement obligatoire avant activation"],
      ]),
      faqSection([
        ["Les formulaires enregistrent-ils automatiquement une demande ?", "Oui, lorsque l'utilisateur clique sur le bouton d'envoi, la demande est transmise à l'API sécurisée du site puis enregistrée dans la table de contact Supabase configurée côté Vercel. Les boutons de préparation, copie, téléchargement et e-mail restent des outils locaux ou de secours."],
        ["Supabase est-il utilisé pour publier des données publiques ?", "Non. Supabase sert uniquement à enregistrer les demandes entrantes lorsque les variables Vercel sont configurées. Les informations transmises ne sont pas publiées automatiquement et restent destinées au traitement interne de TVF."],
        ["Un e-mail de confirmation peut-il être envoyé ?", "Oui, si un fournisseur d'e-mail transactionnel est configuré côté Vercel et si l'utilisateur renseigne son adresse e-mail. Cet accusé de réception ne remplace pas l'instruction du dossier."],
        ["Comment demander la suppression d'une information ?", `Il suffit d'écrire à ${contact.email} en précisant la demande concernée et les informations permettant de retrouver le dossier.`],
        ["TVF peut-elle publier un signalement reçu ?", "Pas sans qualification, anonymisation lorsque nécessaire et vérification des droits. Un bien privé ne doit pas être exposé publiquement sans cadre adapté."],
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
    .map(([label, id]) => `<a href="#${id}" aria-label="Aller à la section : ${escapeAttr(label)}">${label}</a>`)
    .join("")}</div></nav>`;
}

function journeySection(page) {
  const skipJourney = new Set(["contact.html", "mentions-legales.html", "politique-confidentialite.html", "kit-media.html"]);
  if (skipJourney.has(page.file)) return "";
  const links = {
    "index.html": [
      ["Comprendre l'association", "qui-sommes-nous.html", "Lire le rôle de TVF, son cadre et sa logique d'action."],
      ["Choisir un parcours", "agir-avec-nous.html", "Trouver l'entrée adaptée : collectivité, propriétaire, entreprise ou citoyen."],
      ["Voir le territoire pilote", "saint-etienne.html", "Comprendre comment la méthode peut s'appliquer à Saint-Étienne."],
    ],
    "qui-sommes-nous.html": [
      ["Découvrir la méthode", "notre-methode.html", "Passer de la mission générale aux étapes concrètes d'intervention."],
      ["Lire la gouvernance", "gouvernance.html", "Vérifier le cadre, la transparence et les responsabilités."],
      ["Consulter les documents", "documents.html", "Accéder aux fiches, conventions et modèles de travail."],
    ],
    "nos-actions.html": [
      ["Voir les pôles", "nos-poles.html", "Relier chaque action aux pôles opérationnels de TVF."],
      ["Mesurer l'impact", "impact.html", "Comprendre les indicateurs suivis et leur niveau de preuve."],
      ["Agir avec TVF", "agir-avec-nous.html", "Transformer une intention en première demande qualifiée."],
    ],
    "nos-poles.html": [
      ["Approfondir les actions", "nos-actions.html", "Voir comment les pôles deviennent des actions de terrain."],
      ["Lire l'observatoire", "observatoire.html", "Comprendre le rôle des données et de la qualification territoriale."],
      ["Contacter TVF", "contact.html", "Présenter un besoin, un bien ou une coopération possible."],
    ],
    "notre-methode.html": [
      ["Préparer un dossier", "documents.html", "Utiliser les fiches pour cadrer une demande ou une coopération."],
      ["Voir les critères", "gouvernance.html", "Comprendre les règles de décision, de prudence et de traçabilité."],
      ["Passer à l'action", "agir-avec-nous.html", "Identifier le bon parcours selon votre profil."],
    ],
    "observatoire.html": [
      ["Voir Saint-Étienne", "saint-etienne.html", "Relier l'observation nationale à un premier territoire pilote."],
      ["Mesurer l'impact", "impact.html", "Distinguer données publiques, objectifs et indicateurs vérifiés."],
      ["Préparer une source", "documents.html", "Tracer les données utilisées dans un diagnostic ou une carte."],
    ],
    "saint-etienne.html": [
      ["Lire l'observatoire", "observatoire.html", "Comprendre les données nécessaires au diagnostic territorial."],
      ["Voir les partenaires", "partenaires.html", "Identifier les coopérations possibles autour du territoire pilote."],
      ["Contacter TVF", "contact.html", "Proposer un échange sur Saint-Étienne ou un autre territoire."],
    ],
    "agir-avec-nous.html": [
      ["Parcours collectivités", "collectivites.html", "Comprendre les modalités pour une commune, un EPCI ou une collectivité."],
      ["Parcours propriétaires", "proprietaires.html", "Préparer la présentation d'un bien vacant ou dégradé."],
      ["Parcours entreprises", "entreprises.html", "Valoriser matériaux, compétences, locaux ou mécénat."],
    ],
    "collectivites.html": [
      ["Diagnostic territorial", "documents/cahier-charges-diagnostic-territorial.md", "Préparer les données, le périmètre et les livrables."],
      ["Convention territoriale", "documents/convention-cooperation-territoriale.md", "Cadrer une coopération sans engagement prématuré."],
      ["Nous contacter", "contact.html", "Présenter un territoire, un besoin ou un périmètre pilote."],
    ],
    "proprietaires.html": [
      ["Fiche propriétaire", "documents/fiche-proprietaire.md", "Rassembler les informations essentielles sur le bien."],
      ["Bien solidaire", "documents/fiche-bien-solidaire-usage-partage.md", "Étudier un usage temporaire, solidaire ou partagé."],
      ["Nous contacter", "contact.html", "Présenter le bien à TVF pour une première orientation."],
    ],
    "entreprises.html": [
      ["Fiche entreprise", "documents/fiche-entreprise.md", "Décrire une contribution possible : matériaux, compétences, locaux ou soutien."],
      ["Bordereau matériaux", "documents/bordereau-don-materiaux.md", "Tracer les ressources avant toute affectation à un projet."],
      ["Devenir partenaire", "partenaires.html", "Comprendre le cadre d'une coopération responsable."],
    ],
    "benevoles-citoyens.html": [
      ["Agir avec nous", "agir-avec-nous.html", "Choisir le bon parcours d'engagement."],
      ["Mission bénévole", "documents/fiche-mission-benevole.md", "Cadrer une mission avant une action terrain."],
      ["Nous contacter", "contact.html", "Proposer une compétence, un signalement ou une disponibilité."],
    ],
    "financeurs-mecenes.html": [
      ["Voir l'impact", "impact.html", "Comprendre les indicateurs suivis et les limites de communication."],
      ["Demande de soutien", "documents/demande-soutien-financier.md", "Préparer une demande claire et rattachée à un projet instruit."],
      ["Contacter TVF", "contact.html", "Proposer un échange financeur ou mécène."],
    ],
    "partenaires.html": [
      ["Gouvernance", "gouvernance.html", "Vérifier les règles d'officialisation et de transparence."],
      ["Documents", "documents.html", "Accéder aux modèles de convention et fiches partenaires."],
      ["Contact", "contact.html", "Présenter une coopération possible."],
    ],
    "documents.html": [
      ["Kit média", "kit-media.html", "Trouver les éléments publics et les règles de communication."],
      ["Gouvernance", "gouvernance.html", "Comprendre les règles d'usage des documents et conventions."],
      ["Contact", "contact.html", "Demander une orientation vers le bon modèle."],
    ],
    "kit-media.html": [
      ["Dossier TVF", "documents/dossier-presentation-tvf.md", "Partager une présentation structurée de l'association."],
      ["Pitch officiel", "documents/pitch-officiel-tvf.md", "Utiliser des formulations courtes et cohérentes."],
      ["Contact presse", "contact.html", "Préparer un échange média ou institutionnel."],
    ],
    "impact.html": [
      ["Observatoire", "observatoire.html", "Relier les indicateurs aux données territoriales."],
      ["Grille d'impact", "documents/grille-impact.md", "Structurer le suivi sans inventer de résultats."],
      ["Transparence", "transparence.html", "Comprendre la différence entre objectifs et résultats vérifiés."],
    ],
    "gouvernance.html": [
      ["Charte éthique", "documents/charte-ethique.md", "Lire les principes de prudence, traçabilité et transparence."],
      ["Transparence", "transparence.html", "Voir les informations à maintenir à jour."],
      ["Documents", "documents.html", "Retrouver les modèles utiles à l'instruction."],
    ],
    "transparence.html": [
      ["Gouvernance", "gouvernance.html", "Comprendre les responsabilités et le cadre de décision."],
      ["Impact", "impact.html", "Voir comment les résultats seront suivis."],
      ["Mentions légales", "mentions-legales.html", "Consulter le cadre légal préparatoire."],
    ],
    "faq.html": [
      ["Notre méthode", "notre-methode.html", "Lire les étapes complètes de la démarche TVF."],
      ["Documents", "documents.html", "Trouver les fiches utiles après une réponse FAQ."],
      ["Contact", "contact.html", "Poser une question précise à TVF."],
    ],
    "contact.html": [
      ["Agir avec nous", "agir-avec-nous.html", "Vérifier le parcours adapté avant d'écrire."],
      ["Documents", "documents.html", "Préparer les pièces utiles à votre demande."],
      ["FAQ", "faq.html", "Lire les réponses aux questions les plus fréquentes."],
    ],
    "mentions-legales.html": [
      ["Transparence", "transparence.html", "Voir les informations à suivre dans la durée."],
      ["Gouvernance", "gouvernance.html", "Comprendre le cadre de décision TVF."],
      ["Contact", "contact.html", "Demander une précision sur le site ou les documents."],
    ],
  };

  const items = links[page.file] || [
    ["Notre méthode", "notre-methode.html", "Comprendre le cadre d'intervention TVF."],
    ["Documents", "documents.html", "Préparer une demande avec les bons supports."],
    ["Contact", "contact.html", "Échanger avec TVF sur une situation concrète."],
  ];

  const copy = journeyCopyFor(page);
  const normalizedItems = items.map(([title, href, text]) => {
    if (isPrivateDocumentHref(href)) {
      return [title.startsWith("Demander") ? title : `Demander : ${title}`, "contact.html", "TVF transmettra le modèle adapté après qualification du besoin."];
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
    "index.html": ["Orientation", "Comprendre TVF en trois portes", "Choisissez l'entrée la plus utile selon votre besoin : comprendre, agir ou étudier le territoire pilote."],
    "contact.html": ["Après contact", "Préparer une demande exploitable", "Ces liens évitent d'envoyer un message trop général et aident à joindre les bonnes pièces."],
    "documents.html": ["Documents", "Passer du modèle à l'action", "Après avoir identifié un document, vérifiez le cadre, le public concerné et la prochaine décision."],
    "saint-etienne.html": ["Pilote", "Transformer le diagnostic en dossier", "Le territoire pilote doit conduire vers des données, des acteurs et des documents directement exploitables."],
    "observatoire.html": ["Données", "Relier observation et décision", "L'observatoire prend de la valeur lorsqu'il alimente une carte, un indicateur ou une décision."],
    "impact.html": ["Preuve", "Lire les indicateurs avec prudence", "Chaque indicateur doit être relié à une source, un statut et une preuve avant publication."],
    "collectivites.html": ["Collectivités", "Passer du besoin public au cadrage", "Ces ressources aident à préparer un périmètre, une convention ou un premier diagnostic."],
    "proprietaires.html": ["Propriétaires", "Passer du bien au scénario", "Ces ressources permettent de présenter un bien sans créer d'engagement prématuré."],
    "entreprises.html": ["Entreprises", "Transformer une contribution en dossier", "Ces liens aident à qualifier matériaux, locaux, compétences ou mécénat avant valorisation."],
    "financeurs-mecenes.html": ["Financeurs", "Vérifier avant de soutenir", "Ces entrées permettent de comprendre le niveau de preuve, le budget et le reporting attendu."],
    "benevoles-citoyens.html": ["Engagement", "Choisir une mission utile", "Ces ressources aident à signaler, documenter ou participer avec un cadre clair."],
  };
  const [kicker, title, text] = map[page.file] || ["Suite", "Choisir la prochaine étape", "Trois entrées ciblées pour poursuivre sans perdre le fil de votre parcours."];
  return { kicker, title, text };
}

function sectionIntro(title, text, items) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container intro-grid"><div><p class="section-kicker">Fondation</p><h2>${title}</h2><p class="section-lead">${text}</p></div><div class="mini-list">${items
    .map(([h, p]) => `<article><strong>${h}</strong><span>${p}</span></article>`)
    .join("")}</div></div></section>`;
}

function homeClaritySection() {
  return `<section class="section compact-section" ${sectionAttrs("TVF en lecture rapide")}><div class="container compact-grid"><article><p class="section-kicker">Mission</p><h2>TVF sert à relier les bons acteurs autour d'un lieu inutile.</h2><p>Un logement, un commerce, une friche, un terrain ou des matériaux ne deviennent utiles que si le besoin, l'usage, les responsabilités, les documents et le suivi sont clarifiés.</p></article><article><strong>Pour qui ?</strong><p>Collectivités, propriétaires, entreprises, associations, financeurs, bénévoles et citoyens.</p><a class="text-link" href="${hrefFor("agir-avec-nous.html")}">Choisir mon parcours</a></article><article><strong>Premier geste</strong><p>Décrire la situation en quelques lignes : lieu, ressource, besoin, acteurs connus et suite attendue.</p><a class="text-link" href="${hrefFor("contact.html")}">Demander un rendez-vous</a></article><article><strong>Document utile</strong><p>Commencer par le dossier TVF ou la fiche adaptée à votre profil.</p><a class="text-link" href="${hrefFor("documents.html#les-documents-essentiels")}">Voir les essentiels</a></article></div></section>`;
}

function homeTrustSection() {
  return `<section class="section soft trust-section" ${sectionAttrs("Ce qui rend TVF présentable à une institution")}><div class="container"><div class="section-head"><p class="section-kicker">Crédibilité</p><h2>Ce qui rend TVF présentable à une institution.</h2><p>Avant de promettre un résultat, TVF prépare un cadre lisible : données sourcées, responsabilités écrites, preuves d'action et indicateurs vérifiables.</p></div><div class="trust-grid"><article><span class="card-icon" aria-hidden="true">S</span><strong>Données sourcées</strong><p>Chaque diagnostic doit distinguer données publiques, signalement, visite autorisée et décision interne.</p></article><article><span class="card-icon" aria-hidden="true">C</span><strong>Conventions</strong><p>Les rôles, usages, durées, limites, assurances, données et communications sont écrits avant action.</p></article><article><span class="card-icon" aria-hidden="true">I</span><strong>Impact vérifiable</strong><p>Les résultats ne sont publiés qu'après preuve : registre, compte rendu, PV, photos autorisées ou indicateurs.</p></article><article><span class="card-icon" aria-hidden="true">P</span><strong>Parcours par public</strong><p>Collectivité, propriétaire, entreprise, bénévole ou financeur disposent d'une entrée et d'un document adapté.</p></article></div></div></section>`;
}


function launchNeedsSection() {
  return `<section class="section launch-needs" ${sectionAttrs("Ce que TVF recherche maintenant à Saint-Étienne")}><div class="container"><div class="section-head"><p class="section-kicker">Lancement terrain</p><h2>Ce que TVF recherche maintenant à Saint-Étienne.</h2><p class="section-lead">Pour passer du portail au terrain, TVF doit identifier des ressources concrètes, des interlocuteurs utiles et des contributions compatibles avec une première phase pilote.</p></div><div class="need-grid"><article><span class="card-icon" aria-hidden="true">L</span><h3>Local de stockage</h3><p>Un espace sec, accessible et encadré pour qualifier, stocker temporairement et organiser des matériaux réutilisables.</p></article><article><span class="card-icon" aria-hidden="true">T</span><h3>Transport et logistique</h3><p>Des solutions ponctuelles de transport, manutention ou prêt de véhicule pour tester une chaîne locale de réemploi.</p></article><article><span class="card-icon" aria-hidden="true">M</span><h3>Matériaux réutilisables</h3><p>Bois, portes, fenêtres, mobilier, sanitaires, outils ou équipements encore utiles, à qualifier avant toute affectation.</p></article><article><span class="card-icon" aria-hidden="true">B</span><h3>Biens à qualifier</h3><p>Logement, commerce, local, bâtiment, terrain ou friche pouvant faire l'objet d'une première étude sans engagement automatique.</p></article><article><span class="card-icon" aria-hidden="true">E</span><h3>Entreprises et artisans</h3><p>Acteurs du BTP, commerces, bureaux, transporteurs ou entreprises prêtes à étudier une contribution RSE concrète.</p></article><article><span class="card-icon" aria-hidden="true">C</span><h3>Bénévoles et relais locaux</h3><p>Habitants, associations et personnes ressources capables d'aider à signaler, relayer, organiser ou documenter les besoins.</p></article></div><div class="launch-actions"><a class="btn primary" href="${hrefFor("contact.html")}">Présenter une ressource</a><a class="btn secondary" href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp</a></div></div></section>`;
}


function partnerPreparationSection() {
  const groups = [
    ["pieces-collectivite", "Collectivité ou EPCI", ["territoire concerné et périmètre envisagé", "besoin public identifié", "service ou élu référent", "données disponibles", "calendrier souhaité", "objectif de la coopération", "contraintes connues"]],
    ["pieces-entreprise", "Entreprise", ["raison sociale et contact référent", "type de contribution", "matériaux, locaux, compétences ou soutien proposé", "quantité ou volume estimé", "localisation", "disponibilité", "conditions de retrait ou d'intervention", "photos si utile"]],
    ["pieces-association", "Association", ["objet de l'association", "besoin ou projet local", "publics concernés", "lieu ou territoire visé", "capacité d'animation", "ressources déjà mobilisées", "contraintes d'accueil ou de sécurité"]],
    ["pieces-proprietaire", "Propriétaire", ["adresse ou secteur du bien", "type de bien", "état général", "photos récentes", "surface approximative", "statut d'occupation", "intention du propriétaire", "contraintes juridiques ou techniques connues"]],
    ["pieces-particulier", "Particulier / citoyen", ["type de proposition", "commune concernée", "description simple", "photos si possible", "coordonnées de contact", "disponibilités", "accord pour être recontacté", "limites à respecter"]],
    ["pieces-financeur", "Financeur, mécène ou investisseur solidaire", ["type de soutien envisagé", "montant ou enveloppe indicative si connue", "thématique prioritaire", "territoire visé", "critères de sélection", "attentes de reporting", "calendrier de décision"]],
    ["pieces-artisan", "Artisan ou professionnel technique", ["activité et compétences", "zone d'intervention", "type d'appui possible", "références ou assurances utiles", "disponibilités", "conditions d'intervention", "contraintes de sécurité"]],
    ["pieces-logistique", "Stockage, transport ou logistique", ["type de ressource proposée", "adresse ou zone", "surface ou capacité", "conditions d'accès", "durée possible", "contraintes d'assurance", "contact référent", "photos ou plan si disponible"]],
  ];
  return `<section class="section soft partner-prep" ${sectionAttrs("Pièces à préparer avant étude", "pieces-a-preparer")}><div class="container"><div class="section-head"><p class="section-kicker">Pré-instruction</p><h2>Pièces à préparer avant étude de la demande</h2><p class="section-lead">Ces listes ne créent aucun engagement. Elles servent uniquement à vérifier si la demande peut être étudiée, orientée ou transformée ensuite en dossier complet.</p></div><div class="prep-grid">${groups.map(([id, title, items]) => `<article id="${id}" class="prep-card"><h3>${title}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul><a class="text-link" href="${hrefFor("contact.html")}">Transmettre ces éléments</a></article>`).join("")}</div></div></section>`;
}

function cards(title, intro, items) {
  return `<section class="section soft" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">Repères</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><div class="card-grid">${items
    .map(([h, p, href]) => `<article class="card"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p>${p}</p>${href ? smartCardLink(h, href) : ""}</article>`)
    .join("")}</div></div></section>`;
}

function documentTools() {
  const filters = [
    ["all", "Tous"],
    ["collectivites", "Collectivités"],
    ["proprietaires", "Propriétaires"],
    ["entreprises", "Entreprises & matériaux"],
    ["financement", "Financement"],
    ["communication", "Communication"],
    ["terrain", "Terrain"],
    ["cadre", "Cadre interne"],
  ];

  return `<section class="section doc-tools" aria-labelledby="documents-filter-title"><div class="container"><div class="doc-tool-panel"><div class="doc-search"><label for="document-search" id="documents-filter-title">Trouver rapidement le bon document</label><input id="document-search" type="search" placeholder="Rechercher un document, un public, une démarche..." autocomplete="off"></div><div class="doc-filters" aria-label="Filtrer les documents">${filters
    .map(([key, label], index) => `<button class="doc-filter${index === 0 ? " is-active" : ""}" type="button" data-doc-filter="${key}" aria-pressed="${index === 0 ? "true" : "false"}">${label}</button>`)
    .join("")}</div><p class="doc-count" data-doc-count></p></div></div></section>`;
}

function documentCards(title, intro, items) {
  return `<section class="section soft document-library" ${sectionAttrs(title, "documents-library")}><div class="container"><div class="section-head"><p class="section-kicker">Repères</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><div class="card-grid">${items
    .map(([h, p, href]) => `<article class="card" data-doc-card data-doc-category="${docCategory(h, p, href)}"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p>${p}</p>${documentCardLink(h, href)}</article>`)
    .join("")}</div><p class="doc-empty" data-doc-empty hidden>Aucun document ne correspond à cette recherche. Essayez un autre mot-clé ou un autre filtre.</p></div></section>`;
}

function documentArchiveSection(title, intro, items) {
  const cardsMarkup = items
    .map(([h, p, href]) => {
      const category = docCategory(h, p, href);
      return `<article class="card doc-card-compact"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><strong class="doc-card-title">${h}</strong><small class="doc-card-meta">${docCategoryLabel(category)}</small>${documentCardLink(h, href)}</article>`;
    })
    .join("");

  return `<section class="section soft document-library document-archive-section" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">Archive</p><h2>${title}</h2><p class="section-lead">${intro}</p></div><details class="document-archive"><summary><span>Afficher l'archive complète</span><small>Modèles avancés, registres et supports internes restent disponibles en PDF.</small></summary><p class="archive-guidance">Cette archive est volontairement secondaire. Commencez par les documents essentiels, puis ouvrez cette liste uniquement si votre dossier nécessite une pièce spécialisée.</p><div class="card-grid">${cardsMarkup}</div></details></div></section>`;
}

function smartCardLink(title, href) {
  if (!href) return "";
  if (/^(documents\/|output\/documents\/|output\/pdf\/)/i.test(href) || /\.pdf(?:$|[#?])/i.test(href)) {
    return documentCardLink(title, href);
  }
  const label = String(href).startsWith("#pieces-") ? "Voir les pièces à préparer" : "Découvrir";
  return `<a class="text-link" href="${hrefFor(href)}" aria-label="${label} : ${escapeAttr(title)}">${label}</a>`;
}

function documentCardLink(title, href) {
  if (!href) return "";
  const label = isPrivateDocumentHref(href) ? "Demander le document" : "Découvrir";
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
    collectivites: "Collectivités",
    proprietaires: "Propriétaires",
    entreprises: "Entreprises & matériaux",
    financement: "Financement",
    communication: "Communication",
    terrain: "Terrain",
    cadre: "Cadre interne",
  };

  return labels[category] || "Document TVF";
}

function timeline(title, items) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container"><div class="section-head"><p class="section-kicker">Méthode</p><h2>${title}</h2></div><div class="timeline">${items
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
  return `<section class="section soft" ${sectionAttrs("Questions fréquentes")}><div class="container"><div class="section-head"><p class="section-kicker">FAQ</p><h2>Questions fréquentes</h2><p>Des réponses courtes pour comprendre le cadre TVF sans jargon.</p></div><div class="faq-list">${items
    .map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`)
    .join("")}</div></div></section>`;
}

function highlight(title, text, label, href, image) {
  return `<section class="section feature" ${sectionAttrs(title)}><div class="container feature-grid"><img src="${image}" ${imageAttrs(image)} alt="Vue urbaine française liée à la revitalisation territoriale" loading="lazy" decoding="async"><div><p class="section-kicker">Pilote</p><h2>${title}</h2><p class="section-lead">${text}</p><a class="btn primary" href="${hrefFor(href)}">${label}</a></div></div></section>`;
}

function split(title, text, image) {
  return `<section class="section" ${sectionAttrs(title)}><div class="container split"><img src="${image}" ${imageAttrs(image)} alt="${splitAlt(title, image)}" loading="lazy" decoding="async"><div><p class="section-kicker">Approche</p><h3>${title}</h3><p class="section-lead">${text}</p></div></div></section>`;
}

function splitAlt(title, image) {
  const alts = {
    "assets/photos/materiaux-reemploi-echantillons.jpg": "Échantillons de matériaux de construction réemployables : bois, briques, verre, isolants et carrelage",
    "assets/photos/materiaux-durables-reemploi.jpg": "Matériaux durables, bois, briques, isolants et ressources de réemploi pour la Matériauthèque Solidaire",
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
  return tableSection(title, "Ces repères publics donnent l'échelle des sujets traités par TVF et aident à cadrer les diagnostics territoriaux.", [
    ["Sujet", "Repère public récent", "Source", "Utilité pour TVF"],
    ["Logements vacants", "3,1 millions de logements vacants en France en 2023, soit plus de 8 % du parc de logements.", extLink("INSEE, relayé par Banque des Territoires / Localtis, janvier 2024", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "Cibler les territoires où la vacance est structurelle et préparer le dialogue avec les propriétaires."],
    ["Déchets du bâtiment", "Environ 42 millions de tonnes de déchets par an pour le secteur du bâtiment ; la filière REP PMCB vise collecte, traçabilité, recyclage, réemploi et réutilisation.", extLink("Ministère de la Transition écologique, page PMCB mise à jour en novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Relier la matériauthèque TVF à une logique de projet, de traçabilité et d'économie circulaire."],
    ["Friches", "Cartofriches consolide des données ouvertes, des observatoires locaux et des statuts de friches à l'échelle nationale.", extLink("Cerema, Cartofriches", "https://cartofriches.cerema.fr/cartofriches/"), "Préparer des cartes et diagnostics sans exposer des sites sensibles ni inventer de recensement."],
    ["Recyclage foncier", "Les politiques de recyclage foncier et de sobriété foncière encouragent la réutilisation de sites déjà artificialisés avant l'extension urbaine.", extLink("Cerema, Cartofriches et ressources friches", "https://cartofriches.cerema.fr/cartofriches/"), "Aider à formuler des dossiers compatibles avec les politiques de recyclage foncier et de sobriété foncière."],
  ]);
}

function associationNeedMatrixSection() {
  return tableSection("Le besoin global auquel TVF répond", "TVF existe parce que plusieurs enjeux publics se croisent sans toujours être traités dans un même parcours : vacance, réemploi, friches, commerces, insertion et financement. Cette lecture reste prudente : elle s'appuie sur des repères publics et transforme ces constats en méthode de travail, pas en promesse de résultat.", [
    ["Besoin observé", "Repère public vérifiable", "Source", "Réponse TVF"],
    ["Logements vacants", "3,1 millions de logements vacants en France en 2023.", extLink("INSEE, relayé par Banque des Territoires / Localtis, janvier 2024", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "Repérer les biens, qualifier les blocages, dialoguer avec les propriétaires et préparer des usages réalistes."],
    ["Déchets et matériaux du bâtiment", "Environ 42 millions de tonnes de déchets par an pour le bâtiment ; la filière REP PMCB vise collecte, traçabilité, réemploi et recyclage.", extLink("Ministère de la Transition écologique, PMCB, mise à jour novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Transformer des ressources inutilisées en apports affectés à des projets validés, avec critères d'acceptation et traçabilité."],
    ["Friches et foncier déjà artificialisé", "Cartofriches consolide des données ouvertes et observatoires locaux sur les friches.", extLink("Cerema, Cartofriches", "https://cartofriches.cerema.fr/cartofriches/"), "Aider à passer d'une localisation à une note d'opportunité : propriété, risques, accès, usages temporaires ou reconversion."],
    ["Commerces et rez-de-chaussée", "Les bases locales d'équipements et les diagnostics de centre-ville permettent d'objectiver l'offre existante avant d'imaginer un nouvel usage.", extLink("INSEE, Base permanente des équipements", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Étudier les besoins de rue et éviter les commerces hors-sol : activité utile, porteur, convention, modèle économique et calendrier."],
    ["Insertion et engagement citoyen", "Les indicateurs d'emploi, de pauvreté et de formation doivent guider les projets qui mobilisent habitants, bénévoles ou publics en parcours.", extLink("INSEE, dossiers communaux et intercommunaux", "https://www.insee.fr/fr/statistiques/2011101?geo=EPCI-244200770"), "Créer des missions encadrées, limitées, utiles et documentées, sans confondre bénévolat, chantier d'insertion et prestation professionnelle."],
  ]);
}

function associationProofSection() {
  return tableSection("Ce qui rend l'association crédible avant les premiers projets", "La crédibilité de TVF ne repose pas sur des annonces, mais sur des preuves de méthode. Chaque demande doit pouvoir être comprise, tracée, décidée et suivie.", [
    ["Exigence", "Pourquoi c'est important", "Document ou preuve attendue"],
    ["Numéroter les dossiers", "Permettre le suivi d'une demande sans perte d'information entre les interlocuteurs.", "Fiche de contact, fiche projet, registre de décision."],
    ["Distinguer objectif, instruction et résultat", "Éviter de présenter une intention comme une réalisation.", "Statut du dossier : reçu, qualifié, en instruction, conventionné, réalisé, clôturé."],
    ["Sourcer les chiffres", "Rendre les constats vérifiables pour une collectivité, un financeur ou un journaliste.", "Lien INSEE, Cerema, ministère, collectivité ou source publique datée."],
    ["Encadrer les conventions", "Protéger propriétaires, collectivités, entreprises, bénévoles et bénéficiaires.", "Convention de coopération, autorisation de visite, bordereau matériaux, note de risques."],
    ["Mesurer l'impact après action", "Ne publier que des résultats établis, vérifiables et utiles au territoire.", "Tableau d'indicateurs, preuves photos autorisées, compte rendu, bilan."],
  ]);
}
function saintEtienneDataSection() {
  return tableSection("Données publiques de cadrage - Saint-Étienne", "Ces repères publics donnent un socle vérifiable au territoire pilote. Ils ne constituent pas des résultats TVF : ils servent à comprendre les besoins, prioriser les dossiers et préparer les échanges avec les acteurs locaux.", [
    ["Indicateur", "Donnée publique", "Source", "Lecture TVF"],
    ["Population communale", "172 569 habitants en 2022.", extLink("INSEE, dossier complet Commune de Saint-Étienne, RP2022, paru le 03/07/2026", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Un territoire urbain suffisamment dense pour tester une méthode de coopération reproductible."],
    ["Parc de logements", "101 006 logements en 2022, dont 86 292 résidences principales.", extLink("INSEE, LOG T1, Commune de Saint-Étienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "La méthode Habitat Vivant peut partir d'un cadrage chiffré avant tout contact propriétaire."],
    ["Logements vacants", "12 313 logements vacants en 2022, soit 12,2 % du parc communal.", extLink("INSEE, LOG T2, Commune de Saint-Étienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Un besoin direct de qualification : vacance courte, vacance structurelle, état, propriétaire, usage possible."],
    ["Typologie du parc", "86,5 % d'appartements et 10,8 % de maisons en 2022.", extLink("INSEE, LOG T2, Commune de Saint-Étienne, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Les scénarios doivent tenir compte d'un parc majoritairement collectif : copropriété, accès, parties communes, coûts et sécurité."],
    ["Contexte emploi métropolitain", "Saint-Étienne Métropole affiche un taux de chômage de 14,4 % des 15-64 ans en 2022 ; 24,5 % chez les 15-24 ans.", extLink("INSEE, dossier complet Saint-Étienne Métropole, EMP T4, RP2022", "https://www.insee.fr/fr/statistiques/2011101?geo=EPCI-244200770"), "Justifie de relier certains projets à des parcours d'insertion, de formation, de bénévolat encadré et de découverte métiers."],
    ["Équipements et commerces", "La Base permanente des équipements 2024 recense notamment 145 boulangeries-pâtisseries, 121 épiceries ou supérettes, 230 coiffeurs et 53 pharmacies.", extLink("INSEE, BPE 2024, Commune de Saint-Étienne", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Les idées de commerces doivent être étudiées par quartier : compléter l'offre, éviter les doublons et tester les besoins réels."],
    ["Matériaux du bâtiment", "À l'échelle nationale, le bâtiment génère environ 42 millions de tonnes de déchets par an.", extLink("Ministère de la Transition écologique, PMCB, mise à jour novembre 2025", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Le pilote peut tester une chaîne locale : repérage, tri, acceptation, stockage, affectation et preuve de réemploi."],
  ]);
}

function saintEtienneUsefulnessSection() {
  return tableSection("Pourquoi le programme est utile à Saint-Étienne", "Le pilote TVF doit transformer les constats publics en dossiers de terrain. L'utilité se mesure par la qualité des situations qualifiées, des acteurs réunis et des décisions rendues possibles.", [
    ["Constat local", "Besoin opérationnel", "Ce que TVF peut apporter", "Sortie concrète"],
    ["Un volume significatif de logements vacants", "Comprendre quels biens peuvent réellement être remis en usage.", "Fiche propriétaire, prédiagnostic, scénarios d'usage et orientation vers les bons dispositifs.", "Liste de dossiers qualifiés, non publiée sans accord."],
    ["Des rez-de-chaussée commerciaux à réactiver", "Éviter les vitrines vides et tester des usages adaptés aux rues concernées.", "Analyse du local, besoin de quartier, porteurs possibles, usage temporaire ou pérenne.", "Note commerce et scénario de réactivation."],
    ["Des matériaux potentiellement récupérables", "Limiter le gaspillage et réduire certains coûts de projets locaux.", "Bordereau matériaux, critères d'acceptation, stockage possible, affectation à un projet validé.", "Registre de réemploi et preuve d'affectation."],
    ["Des besoins sociaux et d'emploi", "Créer des missions utiles sans improviser les responsabilités.", "Fiche mission, partenaires d'insertion à solliciter, cadre sécurité, compte rendu.", "Chantier participatif ou mission encadrée."],
    ["Des acteurs nombreux", "Mettre autour de la table propriétaires, collectivités, entreprises, associations et citoyens.", "Réunion de cadrage, matrice décisionnelle, documents communs.", "Dossier prêt à présenter."],
  ]);
}

function saintEtienneProjectExamplesSection() {
  return tableSection("Exemples de projets faisables à instruire", "Ces exemples sont des pistes réalistes à étudier. Ils ne sont pas annoncés comme des projets TVF réalisés : chaque cas devra être vérifié, autorisé, chiffré et conventionné.", [
    ["Situation possible", "Usage à étudier", "Pourquoi c'est pertinent", "Conditions à verrouiller"],
    ["Appartement vacant dans un immeuble collectif", "Logement temporaire, logement étudiant, logement solidaire ou habitat intergénérationnel.", "Le parc stéphanois est majoritairement collectif ; certains biens peuvent redevenir utiles si l'état, la copropriété et le propriétaire le permettent.", "Autorisation propriétaire, état technique, coût, assurances, convention d'usage, gestion locative ou associative."],
    ["Cellule commerciale fermée en centre-ville", "Atelier de réparation, boutique de réemploi, commerce de proximité, local associatif ou occupation temporaire.", "Un rez-de-chaussée actif améliore la rue, la sécurité perçue et l'accès aux services.", "Bail ou convention, accessibilité, modèle économique, horaires, porteur, sécurité du local."],
    ["Local ou bâtiment inutilisé", "Maison des associations, atelier partagé, espace de formation, stockage de proximité ou tiers-lieu sobre.", "Les associations et porteurs locaux ont souvent besoin de lieux accessibles, modestes et bien encadrés.", "Propriété, accès, normes, gouvernance du lieu, charges, responsabilité, calendrier."],
    ["Terrain délaissé ou friche légère", "Jardin partagé, verger citoyen, espace pédagogique, zone de biodiversité ou usage transitoire.", "Un espace non utilisé peut devenir un support de lien social et de transition écologique.", "Statut foncier, pollution éventuelle, eau, clôture, entretien, assurance, convention temporaire."],
    ["Lots de matériaux disponibles", "Réhabilitation d'un local associatif, aménagement d'un atelier, mobilier de réemploi, chantier pédagogique.", "Le réemploi devient crédible lorsqu'un matériau est affecté à un besoin précis et tracé.", "État, quantité, stockage, transport, refus des matériaux à risque, preuve d'utilisation."],
    ["Immeuble dégradé avec propriétaire volontaire", "Bien Solidaire à Usage Partagé : rénovation contre usage temporaire encadré.", "Le propriétaire conserve son bien, le territoire gagne un usage, TVF coordonne une convention adaptée.", "Étude juridique, budget, durée, répartition des charges, gouvernance, fin de convention."],
  ]);
}

function saintEtienneCommerceIdeasSection() {
  return tableSection("Idées de commerces et services à étudier par quartier", "Ces pistes doivent être confirmées par diagnostic de rue, échanges avec les acteurs économiques et analyse de viabilité. Elles servent à orienter la réflexion, pas à imposer un modèle unique.", [
    ["Besoin à vérifier", "Activité possible", "Intérêt territorial", "Vigilance"],
    ["Réemploi et réparation", "Atelier vélo, réparation électroménager, boutique de seconde main, dépôt-atelier matériaux.", "Réduit les déchets, crée des services de proximité et peut accueillir des missions bénévoles ou formatives.", "Ne pas concurrencer inutilement l'existant ; cadrer sécurité, garanties et responsabilités."],
    ["Alimentation de proximité", "Épicerie de quartier, produits locaux, vrac, panier solidaire ou commerce hybride.", "Renforce la vie de rue et peut répondre à des besoins d'accès quotidien.", "Étudier flux, concurrence, prix, logistique, fournisseurs et modèle économique."],
    ["Artisanat et savoir-faire", "Atelier partagé, réparation textile, menuiserie légère, upcycling, petite fabrication locale.", "Relie économie locale, formation, insertion et réemploi de matériaux.", "Vérifier nuisances, normes, assurances, stockage et capacité d'encadrement."],
    ["Services aux habitants", "Conciergerie de quartier, aide administrative, permanence associative, espace numérique accompagné.", "Un local vacant peut devenir un service utile si le besoin est confirmé par les habitants.", "Définir public cible, horaires, confidentialité, partenaires et financement de fonctionnement."],
    ["Jeunes, étudiants et actifs", "Café associatif, coworking de proximité, espace projet, lieu d'information logement ou emploi.", "Saint-Étienne dispose d'un tissu universitaire et de jeunes actifs ; certains quartiers peuvent bénéficier de lieux souples.", "Tester la demande, éviter le lieu vitrine sans usage réel, prévoir animation et gouvernance."],
    ["Culture et lien social", "Micro-galerie, scène ouverte, atelier artistique, ressourcerie culturelle, lieu d'exposition temporaire.", "Réactive les vitrines et rend visible la transformation d'un local.", "Convention courte, règles bruit/sécurité, calendrier, assurance, respect du voisinage."],
  ]);
}
function saintEtienneAlignmentSection() {
  return tableSection("Besoins du territoire et réponse TVF", "Cette synthèse transforme les données de cadrage en pistes de travail concrètes pour le territoire pilote. Les dispositifs publics cités sont des cadres de référence à articuler avec les acteurs compétents, pas des financements acquis.", [
    ["Besoin observé", "Donnée ou source à mobiliser", "Cadre public compatible", "Réponse TVF", "Document à produire"],
    ["Logements vacants et habitat ancien", "INSEE : logements vacants, âge du parc, statut d'occupation", "Politiques habitat, rénovation, lutte contre l'habitat indigne, dispositifs locaux à confirmer", "Qualifier les biens, comprendre les blocages propriétaires, préparer des scénarios d'usage", "Fiche propriétaire, accord de principe, scénarios d'usage"],
    ["Commerces fermés et rues fragilisées", extLink("EPASE : réhabilitation de cellules commerciales vacantes du centre-ville et accompagnement de porteurs de projet", "https://www.epase.fr/implanter-son-commerce/"), "Revitalisation de centre-ville, commerce de proximité, occupation temporaire", "Identifier les locaux, tester des usages, rapprocher propriétaires et porteurs, en complément des démarches publiques existantes", "Fiche signalement, note d'opportunité, fiche projet"],
    ["Friches et foncier délaissé", extLink("Cartofriches - Cerema", "https://cartofriches.cerema.fr/cartofriches/"), "Recyclage foncier, sobriété foncière, renaturation ou usage transitoire", "Qualifier sécurité, accès, propriété, usages verts ou collectifs", "Fiche d'audit terrain, matrice des risques, plan d'action"],
    ["Matériaux et ressources inutilisées", extLink("PMCB - Ministère de la Transition écologique", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Économie circulaire, réemploi, réduction des déchets du bâtiment", "Recenser, tracer, accepter ou refuser puis affecter les ressources à des projets validés", "Bordereau matériaux, registre de réemploi, PV de remise"],
    ["Insertion et mobilisation citoyenne", "INSEE : chômage, pauvreté, contexte social du territoire", "ESS, bénévolat, participation citoyenne, parcours d'insertion à articuler avec les acteurs locaux", "Créer des missions encadrées, utiles, limitées et documentées", "Fiche mission, feuille d'émargement, compte rendu terrain"],
  ]);
}

function saintEtiennePilotDashboardSection() {
  return tableSection("Tableau de bord du pilote Saint-Étienne", "Le pilote doit être suivi comme une expérimentation professionnelle. Les compteurs restent à zéro tant qu'aucun dossier n'est vérifié ; l'enjeu est d'abord de préparer des définitions robustes.", [
    ["Indicateur", "Définition TVF", "Preuve attendue", "Fréquence de mise à jour", "Usage en réunion"],
    ["Biens signalés", "Logements, commerces, bâtiments, terrains ou friches reçus dans le registre", "Fiche signalement, source, date, localisation non sensible", "Mensuelle pendant le pilote", "Repérer les sujets récurrents"],
    ["Biens qualifiés", "Signalements complétés avec état apparent, contraintes et suite proposée", "Fiche d'audit, photos autorisées, décision d'orientation", "Mensuelle", "Décider ce qui mérite une visite ou une étude"],
    ["Propriétaires accompagnés", "Propriétaires ayant transmis un dossier exploitable ou autorisé une étape d'étude", "Fiche propriétaire, accord de principe, échange tracé", "Trimestrielle", "Mesurer l'adhésion au dispositif"],
    ["Matériaux proposés", "Ressources décrites avec catégorie, quantité, état et disponibilité", "Bordereau, photos, conditions de retrait", "Mensuelle", "Orienter vers la matériauthèque TVF"],
    ["Missions citoyennes", "Actions bénévoles ouvertes, réalisées ou reportées avec encadrement", "Fiche mission, émargement, compte rendu", "Après chaque action", "Sécuriser l'engagement local"],
    ["Dossiers prêts à présenter", "Dossiers disposant d'un besoin, d'un usage, d'un responsable et de pièces suffisantes", "Fiche projet, budget, matrice des risques", "Avant chaque comité", "Préparer une décision ou une demande de soutien"],
  ]);
}

function observatoryDataSection() {
  return tableSection("Sources publiques à croiser", "L'observatoire TVF doit distinguer données publiques, signalements, visites autorisées et décisions internes.", [
    ["Source", "Ce qu'elle permet", "Limite à respecter"],
    [extLink("INSEE - dossiers communaux", "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218"), "Population, logements, vacance, emploi, pauvreté, équipements et activité économique.", "La donnée décrit un contexte ; elle ne suffit pas à qualifier un bien précis."],
    [extLink("Cartofriches - Cerema", "https://cartofriches.cerema.fr/cartofriches/"), "Friches, statuts, types, observatoires locaux et données ouvertes.", "Certaines friches restent sensibles : la publication doit être maîtrisée."],
    [extLink("PMCB - Ministère de la Transition écologique", "https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb"), "Cadre de la filière bâtiment, reprise, traçabilité, réemploi et réutilisation.", "La banque de matériaux TVF doit rester orientée projet, pas distribution libre."],
    [extLink("Banque des Territoires / Localtis - logements vacants", "https://www.banquedesterritoires.fr/la-france-compte-plus-de-3-millions-de-logements-vacants"), "Synthèse de l'étude INSEE sur la vacance, ses causes et ses contrastes territoriaux.", "Ne pas confondre vacance frictionnelle et vacance structurelle."],
  ]);
}

function observatoryDecisionMatrixSection() {
  return tableSection("Matrice donnée, carte, décision", "L'observatoire devient crédible lorsqu'il ne se contente pas d'afficher des points sur une carte. Chaque donnée doit avoir un statut, une preuve et une décision possible.", [
    ["Objet observé", "Donnée minimale", "Statut possible", "Décision TVF", "Publication"],
    ["Logement vacant", "Adresse approximative, type, état apparent, source, contact éventuel", "Signalé, qualifié, propriétaire contacté, classé", "Demander pièces, organiser visite autorisée, orienter Habitat Vivant", "Jamais d'adresse privée sans accord"],
    ["Commerce fermé", "Rue, type de local, état de vitrine, usage antérieur si connu", "Signalé, vérifié terrain, usage à étudier, classé", "Analyser le potentiel Commerce Vivant", "Publication possible par secteur, pas par propriétaire"],
    ["Bâtiment abandonné", "Type de bâtiment, accès, risques apparents, propriété à vérifier", "Signalé, sensible, à sécuriser, à réorienter", "Demander avis compétent ou classer par prudence", "Publication limitée si risque ou sécurité"],
    ["Friche ou terrain", "Localisation, surface estimée, accès, végétation, usage possible", "Signalé, croisé Cartofriches, qualifié, orienté", "Préparer audit Friches & Terrains Vivants", "Carte agrégée ou non sensible"],
    ["Matériaux disponibles", "Catégorie, quantité, état, délai, conditions de retrait", "Proposé, accepté, refusé, réservé, affecté", "Orienter Matériauthèque Solidaire", "Publication uniquement si contribution validée"],
  ]);
}

function observatoryMapReadinessSection() {
  return tableSection("Préparer une carte exploitable", "La carte TVF doit être un outil de travail, pas une vitrine imprudente. Elle doit distinguer ce qui peut être public, réservé aux partenaires ou strictement interne.", [
    ["Couche cartographique", "Contenu", "Niveau de diffusion", "Raison"],
    ["Contexte territorial", "Population, logements, vacance, emploi, pauvreté, sources publiques", "Public", "Données agrégées et sourcées"],
    ["Biens signalés", "Signalements reçus avec statut interne", "Interne", "Protection des propriétaires, sécurité et données personnelles"],
    ["Dossiers qualifiés", "Biens ou ressources avec pièces suffisantes", "Partenaires autorisés", "Aide à la décision sans exposition excessive"],
    ["Projets conventionnés", "Périmètre, objectif, responsable, calendrier et indicateurs", "Public si accord écrit", "Communication possible lorsque le cadre est formalisé"],
    ["Matériaux disponibles", "Catégorie, quantité, disponibilité, conditions de retrait", "Interne ou partenaires", "Éviter une logique de distribution libre"],
    ["Résultats vérifiés", "Actions réalisées avec preuve et indicateurs", "Public", "Valoriser seulement les résultats établis"],
  ]);
}

function contactDetailsSection() {
  return tableSection("Coordonnées officielles TVF", "Ces coordonnées sont les canaux de contact publics à utiliser pour les demandes institutionnelles, partenariales ou citoyennes.", [
    ["Canal", "Information", "Usage recommandé"],
    ["E-mail", `<a href="mailto:${contact.email}">${contact.email}</a>`, "Premier contact écrit, transmission d'une demande, prise de rendez-vous ou envoi d'un dossier."],
    ["Téléphone", `<a href="tel:${contact.phoneHref}">${contact.phone}</a>`, "Contact court, orientation rapide ou confirmation d'un rendez-vous."],
    ["WhatsApp", `<a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer">Écrire à TVF sur WhatsApp</a>`, "Canal rapide pour démarrer une discussion ou demander une orientation courte."],
    ["Facebook", `<a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer">Suivre TVF sur Facebook</a>`, "Suivi des actualités publiques et relais des communications de lancement."],
    ["Siège national", contact.address, "Adresse institutionnelle de référence pour les mentions et documents TVF."],
  ]);
}

function socialContactSection() {
  return `<section class="section soft social-contact-section" ${sectionAttrs("WhatsApp et réseaux sociaux")}><div class="container social-contact-grid"><div class="social-contact-copy"><p class="section-kicker">Canaux rapides</p><h2>Écrire à TVF ou suivre l'association.</h2><p class="section-lead">Pour un premier échange court, WhatsApp permet de démarrer une discussion simplement. Facebook sert à suivre les communications publiques de lancement et les prochaines actualités de Territoires Vivants France.</p><div class="social-actions"><a class="social-action whatsapp" href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Écrire à Territoires Vivants France sur WhatsApp"><span aria-hidden="true">WA</span><strong>WhatsApp</strong><small>Démarrer une discussion</small></a><a class="social-action facebook" href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Suivre Territoires Vivants France sur Facebook"><span aria-hidden="true">FB</span><strong>Facebook</strong><small>Suivre les actualités</small></a></div></div><figure class="qr-card"><img src="${whatsappQr}" ${imageAttrs(whatsappQr)} alt="QR code WhatsApp pour contacter Territoires Vivants France" loading="lazy" decoding="async"><figcaption>Scannez le QR code pour ouvrir directement la conversation WhatsApp TVF.</figcaption></figure></div></section>`;
}

function contactAppointmentSection() {
  return cards("Pourquoi contacter TVF maintenant ?", "Une demande peut commencer simplement. L'important est de savoir quel problème vous souhaitez résoudre et quelles informations existent déjà.", [
    ["Vous avez un territoire à diagnostiquer", "Commune, EPCI, quartier, rue commerçante, friche, parc de logements ou besoin public à qualifier.", "collectivites.html"],
    ["Vous possédez un bien inutilisé", "Logement, immeuble, commerce, bâtiment ou terrain que vous souhaitez étudier dans un cadre sécurisé.", "proprietaires.html"],
    ["Vous pouvez contribuer", "Matériaux, locaux, compétences, mécénat, logistique ou expertise pouvant servir à un projet utile.", "entreprises.html"],
    ["Vous voulez soutenir", "Financeur, mécène, fondation ou investisseur à impact souhaitant comprendre la méthode, les preuves et le reporting.", "financeurs-mecenes.html"],
  ]);
}

function contactProfileTriageSection() {
  return tableSection("Quel message envoyer selon votre profil ?", "Ce cadre de lecture transforme la page Contact en outil de tri. Elle évite les échanges trop généraux et aide TVF à orienter rapidement la demande.", [
    ["Profil", "Objet recommandé du message", "Informations essentielles", "Document utile"],
    ["Collectivité", "Demande de rendez-vous territorial", "Commune ou EPCI, périmètre, besoin public, données disponibles, calendrier", "Fiche collectivité"],
    ["Propriétaire", "Proposition de bien inutilisé", "Adresse, type de bien, état apparent, photos, contraintes, intention", "Fiche propriétaire"],
    ["Entreprise", "Contribution matériaux, locaux, compétences ou mécénat", "Nature de la contribution, quantité, localisation, délai, conditions", "Fiche entreprise ou bordereau matériaux"],
    ["Association", "Besoin d'usage ou projet local", "Publics concernés, usage souhaité, durée, capacité d'animation, partenaires connus", "Fiche projet"],
    ["Bénévole ou citoyen", "Engagement ou signalement", "Commune, disponibilité, compétence, lieu signalé ou mission souhaitée", "Fiche bénévole ou fiche signalement"],
    ["Financeur", "Échange sur un dossier ou une méthode de reporting", "Type de soutien, critères, calendrier, niveau de preuve attendu", "Plan de financement ou grille d'impact"],
  ]);
}

function firstMeetingSection() {
  return timeline("Premier rendez-vous TVF", [
    ["1", "Clarifier le besoin", "Identifier le territoire, le bien, la ressource, le public concerné et la décision attendue."],
    ["2", "Vérifier les pièces", "Lister ce qui existe déjà : photos, données publiques, autorisations, contacts, budget ou contraintes."],
    ["3", "Choisir le parcours", "Orienter vers collectivité, propriétaire, entreprise, bénévole, financeur ou partenaire."],
    ["4", "Préparer le document", "Sélectionner la fiche utile : territoire, propriétaire, entreprise, projet, financement ou signalement."],
    ["5", "Décider de la suite", "Compléter, visiter, instruire, réorienter, conventionner ou classer le dossier."],
  ]);
}

function publicEntryMatrixSection() {
  return tableSection("Dossier minimum par profil", "Chaque demande doit pouvoir être orientée rapidement. Ce référentiel indique le minimum utile à transmettre avant un échange approfondi.", [
    ["Profil", "À préparer", "Document utile", "Décision attendue"],
    ["Collectivité", "Périmètre, besoin public, données disponibles, interlocuteur, calendrier", "Fiche collectivité + note d'opportunité", "Cadrer un diagnostic, une expérimentation ou une convention territoriale"],
    ["Propriétaire", "Adresse, type de bien, état apparent, photos, contraintes, intention du propriétaire", "Fiche propriétaire + accord de principe", "Étudier un usage, organiser une visite autorisée ou classer le dossier"],
    ["Entreprise", "Ressource proposée, quantité, état, localisation, disponibilité, conditions de retrait", "Fiche entreprise + bordereau matériaux", "Accepter, refuser, mettre en attente ou affecter à un projet"],
    ["Association", "Besoin d'usage, publics concernés, horaires, responsabilités, capacité d'animation", "Fiche projet + convention partenariat", "Qualifier un usage possible ou réorienter vers un acteur adapté"],
    ["Bénévole", "Compétences, territoire, disponibilités, mobilité, limites d'intervention", "Fiche bénévole + fiche mission", "Proposer une mission encadrée ou constituer un vivier local"],
    ["Financeur", "Objet du soutien, budget, critères, attentes de reporting, calendrier", "Fiche financeur + plan de financement", "Vérifier si un dossier peut être présenté sans promesse excessive"],
  ]);
}

function fastJourneySection() {
  return tableSection("Trouver son parcours en trois clics", "Cette matrice sert de boussole : elle indique la page, le document et l'action immédiate selon le profil du visiteur.", [
    ["Je suis...", "Page à ouvrir", "Document à préparer", "Action immédiate"],
    ["Une collectivité", `<a href="${hrefFor("collectivites.html")}">Collectivités</a>`, "Fiche collectivité ou fiche territoire", "Décrire le périmètre, le besoin public et les interlocuteurs"],
    ["Un propriétaire", `<a href="${hrefFor("proprietaires.html")}">Propriétaires</a>`, "Fiche propriétaire ou accord de principe", "Présenter le bien, son état, les contraintes et l'intention"],
    ["Une entreprise", `<a href="${hrefFor("entreprises.html")}">Entreprises</a>`, "Fiche entreprise ou bordereau matériaux", "Décrire la contribution, sa disponibilité et ses limites"],
    ["Un bénévole ou citoyen", `<a href="${hrefFor("benevoles-citoyens.html")}">Bénévoles et citoyens</a>`, "Fiche bénévole ou fiche signalement", "Indiquer la commune, les disponibilités ou le lieu signalé"],
    ["Un financeur ou mécène", `<a href="${hrefFor("financeurs-mecenes.html")}">Financeurs et mécènes</a>`, "Plan de financement ou dossier projet", "Demander un échange sur un dossier instruit, pas sur une promesse vague"],
  ]);
}

function actionsOperationalMatrixSection() {
  return tableSection("Matrice opérationnelle des actions", "Cette matrice relie chaque action à un problème concret, à un document de travail, à une décision attendue et à un indicateur de suivi. Elle permet de comprendre rapidement ce que TVF produit réellement avant toute communication publique.", [
    ["Action", "Problème traité", "Réponse TVF", "Document utile", "Décision attendue", "Impact attendu"],
    ["Logements vacants", "Bien inutilisé, état incertain, propriétaire isolé ou absence d'usage clair", "Qualifier le bien, organiser une visite autorisée, comparer les usages possibles et préparer le cadre propriétaire", "Fiche propriétaire, accord de principe, scénarios d'usage", "Compléter, visiter, instruire, conventionner ou classer", "Biens qualifiés, propriétaires accompagnés, logements remis en usage uniquement après preuve"],
    ["Commerces inoccupés", "Vitrine fermée, local sans projet, besoin économique ou associatif non relié au propriétaire", "Décrire le local, analyser les usages compatibles et rapprocher les acteurs locaux", "Fiche signalement, fiche projet, note d'opportunité", "Tester un usage, rechercher un porteur, conventionner ou réorienter", "Locaux qualifiés, scénarios d'activation, commerces ou usages accompagnés"],
    ["Matériaux de réemploi", "Surplus, invendus ou matériaux de chantier sans affectation utile", "Identifier, trier, tracer et affecter les ressources à un projet validé", "Fiche entreprise, bordereau matériaux, PV de remise", "Accepter, refuser, stocker, affecter ou mettre en attente", "Matériaux orientés vers des projets, déchets évités lorsque la preuve existe"],
    ["Friches et terrains", "Espace délaissé, propriété ou sécurité à clarifier, usage inexistant", "Qualifier l'accès, les risques, les contraintes, les usages temporaires et les acteurs à mobiliser", "Fiche d'audit terrain, matrice des risques, note d'opportunité", "Étudier, sécuriser, conventionner, réorienter ou classer", "Sites qualifiés, usages temporaires ou projets de reconversion cadrés"],
    ["Solidarité et insertion", "Volonté d'agir sans mission claire, besoin d'encadrement ou de parcours utile", "Définir des missions courtes, encadrées, traçables et compatibles avec les compétences disponibles", "Fiche mission bénévole, feuille d'émargement, compte rendu terrain", "Ouvrir une mission, reporter, encadrer ou refuser", "Bénévoles mobilisés, heures suivies, missions réalisées avec sécurité"],
    ["Territoires partenaires", "Besoin public identifié mais périmètre, gouvernance ou livrables encore flous", "Cadrer un diagnostic, une expérimentation, un quartier pilote ou une convention territoriale", "Fiche collectivité, convention territoriale, plan d'action", "Lancer un cadrage, signer une coopération ou différer", "Territoires qualifiés, diagnostics produits, décisions publiques facilitées"],
    ["Financer les projets", "Idée utile mais budget, risques, preuves ou reporting insuffisants", "Structurer un budget, un plan de financement, une grille de risques et des indicateurs", "Budget prévisionnel, plan de financement, reporting financeur", "Dossier finançable, à compléter, à ajourner ou à abandonner", "Demandes mieux cadrées, financements suivis séparément des intentions"],
    ["Observatoire", "Données dispersées, signalements non vérifiés, priorités difficiles à hiérarchiser", "Croiser sources publiques, signalements, visites autorisées et statuts de décision", "Registre sources, protocole signalement, fiche cartographie", "Signalé, qualifié, orienté, conventionné ou classé", "Base de décision territoriale, cartes et indicateurs fiables"],
  ]);
}

function actionsDecisionSection() {
  return tableSection("De la demande à la décision", "Une action TVF doit produire une suite claire, même lorsqu'elle n'aboutit pas. Ce processus évite les promesses floues et donne aux collectivités, propriétaires, entreprises et financeurs une lecture simple du dossier.", [
    ["Étape", "Question à trancher", "Preuve attendue", "Suite possible"],
    ["1. Recevoir", "Qui demande quoi, sur quel territoire et avec quel niveau d'urgence ?", "Message, fiche d'entrée, coordonnées, localisation", "Accusé de réception et numéro de dossier"],
    ["2. Qualifier", "Les informations sont-elles suffisantes pour comprendre le bien, la ressource ou le besoin ?", "Photos, adresse, état apparent, contraintes connues, interlocuteur", "Demande de pièces, visite autorisée ou classement"],
    ["3. Prioriser", "Le dossier est-il utile, faisable, sûr et cohérent avec la mission TVF ?", "Grille d'instruction, risques, utilité territoriale, moyens nécessaires", "Instruction, réorientation, mise en attente ou refus motivé"],
    ["4. Formaliser", "Qui porte quoi, pendant combien de temps, avec quelles responsabilités ?", "Convention, accord de principe, budget, autorisations, assurances", "Lancement d'une action encadrée ou report"],
    ["5. Suivre", "Que peut-on mesurer et publier sans exagérer ?", "Compte rendu, indicateurs, photos autorisées, pièces justificatives", "Bilan, mise à jour des indicateurs ou retour d'expérience"],
  ]);
}

function polesOperationalMatrixSection() {
  return tableSection("Matrice opérationnelle des pôles", "Les pôles donnent une organisation lisible au cœur métier. Chaque pôle doit savoir ce qu'il analyse, avec quels documents, pour quels publics et jusqu'à quelle décision.", [
    ["Pôle", "Sujet traité", "Publics principalement concernés", "Documents de référence", "Décision produite"],
    ["Habitat Vivant", "Logements vacants, immeubles dégradés, usages temporaires ou solidaires", "Propriétaires, collectivités, habitants, financeurs", "Fiche propriétaire, accord de principe, scénarios d'usage, suivi de restitution", "Étude, visite, convention, travaux à cadrer ou classement"],
    ["Matériauthèque Solidaire", "Matériaux, mobilier, équipements, surplus, invendus ou ressources de chantier", "Entreprises, artisans, collectivités, associations, particuliers", "Fiche entreprise, bordereau matériaux, PV de remise, registre matériaux", "Acceptation, refus, stockage, affectation ou réorientation"],
    ["Commerce Vivant", "Locaux commerciaux vacants, vitrines fermées, rez-de-chaussée sans activité", "Propriétaires, commerçants, artisans, communes, associations", "Fiche local, fiche projet, note d'opportunité, convention d'usage", "Test d'usage, recherche de porteur, occupation temporaire ou classement"],
    ["Friches & Terrains Vivants", "Friches, terrains délaissés, espaces verts potentiels, sites à sécuriser", "Collectivités, propriétaires, associations, habitants, experts techniques", "Fiche d'audit terrain, matrice des risques, plan d'action territorial", "Étude, sécurisation, usage transitoire, projet territorial ou classement"],
    ["Solidarité & Insertion", "Missions bénévoles, chantiers encadrés, participation citoyenne, parcours d'utilité", "Bénévoles, associations, structures d'insertion, habitants, jeunes et seniors", "Fiche mission, consignes sécurité, feuille d'émargement, compte rendu", "Mission ouverte, mission reportée, encadrement renforcé ou refus"],
  ]);
}

function polesCoordinationSection() {
  return tableSection("Comment les pôles s'assemblent sur un dossier", "Un projet crédible ne dépend presque jamais d'un seul pôle. Cette synthèse aide à comprendre qui porte le dossier principal et quels pôles interviennent en appui.", [
    ["Situation de départ", "Pôle principal", "Pôles associés", "Livrable final attendu"],
    ["Un logement vacant proposé par un propriétaire", "Habitat Vivant", "Matériauthèque Solidaire, Solidarité & Insertion, Financement", "Scénario d'usage, budget, accord propriétaire, convention possible"],
    ["Un commerce fermé en centre-ville", "Commerce Vivant", "Habitat Vivant, Matériauthèque Solidaire, Collectivités", "Note d'opportunité, usage compatible, porteur identifié ou besoin de recherche"],
    ["Des matériaux disponibles chez une entreprise", "Matériauthèque Solidaire", "Habitat Vivant, Friches & Terrains Vivants, Solidarité & Insertion", "Registre, état, conditions de retrait, affectation à un projet validé"],
    ["Un terrain délaissé dans un quartier", "Friches & Terrains Vivants", "Solidarité & Insertion, Collectivités, Matériauthèque Solidaire", "Audit terrain, risques, usages possibles, plan d'action local"],
    ["Une mission citoyenne ou bénévole", "Solidarité & Insertion", "Tous les pôles selon le support de mission", "Fiche mission, consignes, référent, émargement et compte rendu"],
  ]);
}

function impactDashboardModelSection() {
  return tableSection("Modèle de tableau de bord d'impact", "Ce modèle prépare les futurs reportings TVF. Les colonnes évitent de mélanger objectifs, dossiers en cours et résultats prouvés.", [
    ["Famille d'impact", "Indicateur", "Statut à distinguer", "Source de preuve", "Lecture attendue"],
    ["Patrimoine", "Biens signalés, qualifiés, orientés, conventionnés, remis en usage", "Signalé / qualifié / conventionné / réalisé", "Registre demandes, fiche propriétaire, convention, compte rendu", "Montrer la progression réelle d'un bien"],
    ["Matériaux", "Matériaux proposés, acceptés, refusés, affectés, réemployés", "Proposé / accepté / réservé / affecté / réemployé", "Bordereau, PV de remise, registre matériaux", "Éviter de compter comme réemployé ce qui est seulement proposé"],
    ["Territoires", "Communes, quartiers ou périmètres accompagnés", "Contact / diagnostic / coopération / bilan", "Fiche collectivité, convention territoriale, plan d'action", "Distinguer intérêt, coopération et action mesurée"],
    ["Citoyens", "Bénévoles inscrits, missions ouvertes, participations réalisées", "Inscrit / mobilisable / présent / action réalisée", "Fiche bénévole, feuille d'émargement, compte rendu", "Mesurer l'engagement réel et encadré"],
    ["Financement", "Montants estimés, demandés, accordés, conventionnés, versés", "Estimation / demande / accord / convention / versement", "Plan de financement, courrier, convention, justificatif", "Ne jamais confondre une piste avec un financement obtenu"],
  ]);
}

function impactPublicationRulesSection() {
  return tableSection("Règles de publication des chiffres", "Un chiffre TVF doit pouvoir être relu par une collectivité, un financeur ou un journaliste sans créer de doute sur son origine.", [
    ["Règle", "Application concrète", "Exemple de formulation prudente"],
    ["Séparer objectif et résultat", "Un objectif 2026 ne doit pas être présenté comme déjà atteint", "Objectif : qualifier les premiers biens du territoire pilote"],
    ["Citer la source", "Toute donnée nationale ou locale doit indiquer organisme, année et lien", "Source : INSEE, RP2023, dossier communal de Saint-Étienne"],
    ["Indiquer le statut", "Un projet en instruction n'est pas un projet réalisé", "Dossier en cours de qualification, sans convention à ce stade"],
    ["Documenter la preuve", "Un indicateur doit renvoyer à un registre, une fiche ou un compte rendu", "Indicateur calculé à partir du registre des demandes"],
    ["Mettre à jour avec date", "Chaque tableau de bord doit avoir une date de mise à jour", "Mise à jour trimestrielle prévue après démarrage du pilote"],
  ]);
}

function essentialDocumentsSection() {
  return cards("Les documents essentiels", "Cette sélection évite de commencer par toute la bibliothèque documentaire. Elle suffit pour préparer la majorité des premiers rendez-vous.", [
    ["Dossier TVF", "Présenter l'association, sa méthode, ses publics et ses limites de communication.", "documents/dossier-presentation-tvf.md"],
    ["Dossier de contact TVF", "Retrouver coordonnées, services, pôles, actions et informations à transmettre.", "documents/dossier-contact-tvf.md"],
    ["Dossier prospection Saint-Étienne", "Préparer les contacts à solliciter pour lancer le pilote : collectivités, entreprises, artisans, insertion, foncier et financeurs.", "documents/dossier-prospection-saint-etienne.md"],
    ["Glossaire et annuaire Saint-Étienne", "Centraliser contacts, glossaire, secteurs, pôles, insertion, matériaux et local de stockage.", "documents/glossaire-annuaire-contacts-saint-etienne.md"],
    ["Kit courriers prêts à l'emploi", "Envoyer des demandes cadrées pour partenariats, matériaux, local de stockage, insertion, propriétaires et financeurs.", "documents/kit-courriers-partenariats-demandes-tvf.md"],
    ["Pack lancement Saint-Étienne", "Réunir les documents indispensables pour les premiers rendez-vous du pilote.", "documents/pack-lancement-saint-etienne.md"],
    ["Synthèses 1 page", "Utiliser une version courte pour collectivité, entreprise, propriétaire ou financeur.", "documents/synthese-collectivite-1-page.md"],
    ["Critères matériaux", "Savoir quoi accepter, refuser, orienter ou stocker avant tout retrait.", "documents/criteres-acceptation-materiaux.md"],
    ["Protocole stockage", "Sécuriser un local temporaire avant l'entrée de matériaux.", "documents/protocole-local-stockage.md"],
    ["Cadre insertion", "Encadrer les actions terrain sans improviser de chantier non habilité.", "documents/cadre-chantiers-insertion.md"],
    ["Dossier Saint-Étienne", "Appuyer le territoire pilote sur les données publiques, besoins, indicateurs et pièces à réunir.", "documents/dossier-territorial-saint-etienne.md"],
    ["Fiche collectivité", "Décrire un territoire, un périmètre, un besoin public et les interlocuteurs.", "documents/fiche-collectivite.md"],
    ["Fiche propriétaire", "Qualifier un bien vacant ou dégradé avant étude, visite ou scénario d'usage.", "documents/fiche-proprietaire.md"],
    ["Fiche entreprise", "Présenter une contribution en matériaux, locaux, compétences ou mécénat.", "documents/fiche-entreprise.md"],
    ["Fiche projet", "Cadrer objectif, acteurs, risques, budget, preuves et décision attendue.", "documents/fiche-projet.md"],
    ["Fiche signalement", "Décrire un lieu, un commerce, une friche ou une ressource à qualifier.", "documents/fiche-signalement-lieu.md"],
    ["Grille d'instruction", "Décider si le dossier doit être complété, visité, instruit ou classé.", "documents/grille-instruction-dossier.md"],
    ["Modèle de convention", "Préparer les clauses de coopération à adapter aux parties concernées.", "documents/modele-convention.md"],
    ["Grille d'impact", "Mesurer uniquement ce qui est défini, prouvé et traçable.", "documents/grille-impact.md"],
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
  return cards("Dossiers internes prêts à présenter", "Ces supports sont transmis après qualification d'un échange. Les sources internes restent modifiables pour adapter chaque dossier.", [
    ["Dossier TVF PDF", "Présentation générale de TVF, de sa méthode, de ses publics et de ses garanties de sérieux.", "output/pdf/dossier-presentation-tvf.pdf"],
    ["Dossier de contact PDF", "Coordonnées, services, pôles, actions et informations à préparer avant un échange.", "output/documents/dossier-contact-tvf.pdf"],
    ["Dossier prospection Saint-Étienne PDF", "Liste opérationnelle des acteurs à solliciter, priorités, scripts et suivi de prospection.", "output/documents/dossier-prospection-saint-etienne.pdf"],
    ["Glossaire et annuaire Saint-Étienne PDF", "Contacts par secteur, poles, insertion, matériaux, stockage et tableaux de suivi.", "output/documents/glossaire-annuaire-contacts-saint-etienne.pdf"],
    ["Kit courriers prêts à l'emploi PDF", "Modèles de courriers pour collectivités, entreprises, propriétaires, insertion, financeurs et demandes de local.", "output/documents/kit-courriers-partenariats-demandes-tvf.pdf"],
    ["Pack lancement Saint-Étienne PDF", "Documents et ordre logique pour lancer le pilote Saint-Étienne sans surcharger les rendez-vous.", "output/documents/pack-lancement-saint-etienne.pdf"],
    ["Synthèse collectivité PDF", "Version 1 page pour présenter TVF à une mairie, un EPCI ou une collectivité.", "output/documents/synthese-collectivite-1-page.pdf"],
    ["Synthèse entreprise matériaux PDF", "Version 1 page pour solliciter matériaux, local, compétences ou RSE.", "output/documents/synthese-entreprise-materiaux-1-page.pdf"],
    ["Synthèse propriétaire PDF", "Version 1 page pour expliquer comment proposer un bien sans engagement automatique.", "output/documents/synthese-proprietaire-1-page.pdf"],
    ["Synthèse financeur PDF", "Version 1 page pour présenter garanties, impact, budget et reporting.", "output/documents/synthese-financeur-1-page.pdf"],
    ["Critères matériaux PDF", "Critères d'acceptation, refus, orientation, stockage et traçabilité.", "output/documents/criteres-acceptation-materiaux.pdf"],
    ["Protocole stockage PDF", "Cadre d'utilisation d'un local de stockage temporaire pour matériaux.", "output/documents/protocole-local-stockage.pdf"],
    ["Cadre insertion PDF", "Conditions minimales avant chantier d'insertion, action terrain ou mission encadrée.", "output/documents/cadre-chantiers-insertion.pdf"],
    ["Dossier collectivité PDF", "Support destiné aux communes, EPCI, départements, régions et services publics.", "output/pdf/dossier-collectivite-tvf.pdf"],
    ["Dossier entreprise et mécène PDF", "Support pour entreprises, fondations, mécènes, financeurs et acteurs économiques.", "output/pdf/dossier-entreprise-mecene-tvf.pdf"],
    ["Dossier propriétaire PDF", "Support pour expliquer comment proposer un bien sans engagement automatique.", "output/pdf/dossier-proprietaire-tvf.pdf"],
  ]);
}

function documentVisibilitySection() {
  return tableSection("Supports de présentation et outils internes", "Tous les contenus restent disponibles, mais ils n'ont pas le même usage. Cette distinction évite de présenter un registre interne comme un support public.", [
    ["Niveau", "À utiliser pour", "Exemples", "Lecture recommandée"],
    ["Documents publics", "Présenter TVF à une collectivité, un propriétaire, une entreprise ou un financeur", "Dossier TVF, dossiers PDF, fiche collectivité, fiche propriétaire, fiche entreprise", "À ouvrir en priorité"],
    ["Supports de rendez-vous", "Préparer une réunion, qualifier une demande ou structurer une suite", "Fiche projet, pièces à fournir, note d'opportunité, modèle de convention", "À choisir selon le profil"],
    ["Outils internes", "Tracer les décisions, risques, preuves, incidents, conventions et suivis", "Registres, grilles, PV, reporting, matrices", "À utiliser après cadrage"],
  ]);
}

function documentPriorityPackSection() {
  return tableSection("Pack prioritaire pour présenter TVF", "Pour une réunion avec une mairie, une métropole, une entreprise ou un financeur, il vaut mieux arriver avec peu de documents, mais parfaitement choisis.", [
    ["Situation", "Documents à préparer", "Objectif de la réunion"],
    ["Premier rendez-vous collectivité", "Dossier TVF, fiche collectivité, fiche territoire partenaire, dossier Saint-Étienne si le pilote est concerné", "Comprendre le besoin public et cadrer un périmètre réaliste"],
    ["Bien proposé par un propriétaire", "Fiche propriétaire, accord de principe, autorisation de visite, scénarios d'usage", "Vérifier si le bien peut entrer dans un parcours TVF"],
    ["Matériaux proposés par une entreprise", "Fiche entreprise, bordereau matériaux, PV de remise, registre matériaux", "Décider si la ressource est utile, sûre et affectable"],
    ["Projet à financer", "Fiche projet, budget prévisionnel, plan de financement, matrice des risques, grille d'impact", "Présenter un dossier lisible sans promesse excessive"],
    ["Action terrain ou bénévole", "Fiche mission, consignes sécurité, feuille d'émargement, compte rendu", "Encadrer une action courte, traçable et sécurisée"],
  ]);
}

function documentWorkflowSection() {
  return tableSection("Chaîne documentaire d'un dossier complet", "Un dossier TVF doit pouvoir être suivi du premier contact au bilan. Cette chaîne évite les pertes d'information et les décisions non tracées.", [
    ["Moment", "Document", "Ce qu'il sécurise"],
    ["Entrée", "Accusé de réception + registre des demandes", "La date, le demandeur, le sujet et la prochaine action"],
    ["Qualification", "Fiche profil + pièces à fournir + grille d'instruction", "L'utilité, la faisabilité, les manques et les risques"],
    ["Orientation", "Fiche décision d'orientation", "La suite donnée : compléter, visiter, instruire, réorienter ou classer"],
    ["Cadrage", "Fiche projet + matrice des risques + budget", "Le périmètre, les responsabilités, les coûts et les limites"],
    ["Formalisation", "Convention adaptée ou lettre d'intention", "Les engagements réels avant toute communication publique"],
    ["Action", "Compte rendu, émargement, PV de remise ou réception", "Les preuves de ce qui s'est réellement passé"],
    ["Bilan", "Grille d'impact + reporting financeur si besoin", "Les résultats vérifiables et les enseignements à capitaliser"],
  ]);
}

function collectivityConventionSection() {
  return tableSection("Convention de coopération territoriale", "La convention ne doit pas être un simple symbole. Elle doit permettre à la collectivité de savoir précisément ce qui est testé, par qui, avec quelles limites et quels livrables.", [
    ["Clause", "Contenu à préciser", "Point de vigilance"],
    ["Périmètre", "Quartier, commune, EPCI, type de biens ou thématique visée", "Éviter un périmètre trop large au démarrage"],
    ["Objet", "Diagnostic, cartographie, mobilisation, expérimentation, accompagnement projet", "Ne pas transformer une phase exploratoire en engagement opérationnel"],
    ["Gouvernance", "Référents, fréquence des réunions, comptes rendus, décisions attendues", "Identifier qui valide quoi avant communication"],
    ["Données", "Sources publiques, données transmises, règles de confidentialité et publication", "Protéger les données sensibles et les biens privés"],
    ["Livrables", "Note d'opportunité, registre, carte, fiche projet, plan d'action, bilan", "Définir un livrable concret même si aucun projet n'est lancé"],
    ["Communication", "Usage du nom, logos, photos, citations, calendrier de publication", "Aucun affichage public sans accord écrit"],
  ]);
}

function collectivityDecisionMatrixSection() {
  return tableSection("Décisions à préparer avec une collectivité", "Une collectivité doit pouvoir sortir d'un échange avec une décision simple : lancer un cadrage, cibler un périmètre, réunir les acteurs ou différer.", [
    ["Décision publique à préparer", "Ce que TVF apporte", "Pièce utile", "Résultat attendu de la réunion"],
    ["Choisir un périmètre pilote", "Comparer quartier, rue, typologie de biens ou thématique prioritaire", "Fiche collectivité", "Périmètre réaliste et interlocuteur désigné"],
    ["Qualifier des biens ou ressources", "Proposer une méthode de statut : signalé, qualifié, orienté, classé", "Protocole de qualification", "Liste de données et pièces à réunir"],
    ["Mobiliser les acteurs locaux", "Identifier propriétaires, entreprises, associations, habitants et financeurs utiles", "Fiche comité de pilotage", "Première composition d'un groupe de travail"],
    ["Préparer une coopération", "Définir objet, durée, livrables, communication et règles de confidentialité", "Convention territoriale", "Projet de convention ou lettre d'intention"],
    ["Suivre l'impact", "Définir les indicateurs avant toute communication publique", "Grille d'impact", "Tableau de bord de suivi validé"],
  ]);
}

function ownerConventionSection() {
  return tableSection("Modalités de convention propriétaire", "La convention doit sécuriser le propriétaire, TVF et les futurs usagers. Elle formalise un cadre d'étude ou d'usage sans ambiguïté.", [
    ["Sujet", "À cadrer", "Pourquoi c'est important"],
    ["Propriété", "Le propriétaire conserve la pleine propriété du bien", "Éviter toute confusion sur la maîtrise du bien"],
    ["Accès", "Personnes autorisées, dates, conditions de visite, règles de sécurité", "Protéger les personnes et limiter la responsabilité"],
    ["Usage", "Usage envisagé : étude, occupation temporaire, local associatif, atelier, logement solidaire", "Ne pas promettre un usage impossible ou non autorisé"],
    ["Durée", "Période d'étude, période d'usage, conditions de renouvellement ou d'arrêt", "Donner une visibilité claire aux parties"],
    ["Travaux", "Travaux exclus, travaux autorisés, responsabilités, devis, assurances", "Éviter tout chantier sans validation écrite"],
    ["Restitution", "État de sortie, nettoyage, inventaire, documents remis", "Préserver la valeur patrimoniale et la confiance"],
  ]);
}

function ownerReadinessMatrixSection() {
  return tableSection("Avant de proposer un bien", "Ce cadre de lecture aide le propriétaire à savoir si son dossier est prêt pour un premier échange TVF.", [
    ["Question", "Pourquoi TVF la pose", "Pièce ou réponse utile", "Suite possible"],
    ["Qui peut autoriser l'étude ?", "TVF doit éviter toute démarche sans personne habilitée", "Identité du propriétaire ou mandataire", "Accord de principe ou demande de précision"],
    ["Quel est l'état apparent ?", "La sécurité et la faisabilité conditionnent tout le reste", "Photos, diagnostics disponibles, accès, risques connus", "Visite autorisée, expertise à prévoir ou classement"],
    ["Quel usage est acceptable ?", "Un usage utile doit rester compatible avec la volonté du propriétaire", "Logement, local associatif, commerce, atelier, usage temporaire", "Scénarios d'usage comparés"],
    ["Quelle durée peut être envisagée ?", "La durée influence les investissements, travaux et responsabilités", "Durée d'étude, occupation possible, conditions d'arrêt", "Convention courte, progressive ou reportée"],
    ["Quelles limites sont non négociables ?", "Les règles doivent être écrites avant toute mobilisation", "Accès, travaux interdits, communication, restitution", "Convention adaptée ou réorientation"],
  ]);
}

function enterpriseOperationalSection() {
  return tableSection("Cadre de contribution entreprise", "Une contribution entreprise doit être utile, traçable et compatible avec un projet. TVF ne transforme pas un surplus en visibilité automatique.", [
    ["Contribution", "Informations à fournir", "Suite possible"],
    ["Matériaux", "Catégorie, quantité, dimensions, état, photos, date limite, lieu de retrait", "Acceptation, refus motivé, stockage ou affectation à un projet"],
    ["Compétences", "Métier, disponibilité, périmètre, livrable possible, contraintes", "Mission ponctuelle, conseil, expertise ou mentorat"],
    ["Locaux", "Adresse, surface, état, durée possible, accès, charges, sécurité", "Étude d'usage temporaire ou orientation vers un besoin associatif"],
    ["Mécénat", "Objet soutenu, montant envisagé, calendrier, critères internes", "Instruction, convention, reporting et communication validée"],
    ["Logistique", "Transport, stockage, manutention, équipement, disponibilité", "Soutien à une collecte, un chantier ou une opération encadrée"],
  ]);
}

function enterpriseValueMatrixSection() {
  return tableSection("Ce que l'entreprise doit pouvoir valoriser", "L'intérêt d'une contribution n'est pas seulement de donner. C'est de prouver une action utile, traçable et reliée au territoire.", [
    ["Objectif entreprise", "Condition TVF", "Preuve produite", "Communication possible"],
    ["Réduire le gaspillage", "Matériaux réutilisables, décrits et affectables", "Bordereau, PV de remise, registre", "Après acceptation et affectation"],
    ["Structurer une démarche RSE", "Contribution reliée à un besoin territorial", "Fiche contribution, compte rendu", "Après validation commune"],
    ["Mobiliser des compétences", "Mission courte, livrable clair, référent identifié", "Fiche mission ou convention", "Après réalisation ou bilan"],
    ["Mettre un local à disposition", "Durée, accès, charges, sécurité et responsabilités écrits", "Convention de mise à disposition", "Selon accord de communication"],
    ["Soutenir financièrement", "Budget, objet, reporting et indicateurs définis", "Convention mécénat ou plan de financement", "Après accord formalisé"],
  ]);
}

function volunteerOperationalSection() {
  return tableSection("Cadre d'engagement citoyen", "Une mission bénévole doit être simple, utile et sécurisée. TVF doit éviter les missions floues et les interventions improvisées.", [
    ["Étape", "Ce qui doit être clair", "Document ou trace"],
    ["Inscription", "Identité, commune, disponibilité, compétences, limites", "Fiche bénévole"],
    ["Mission", "Objectif, durée, lieu, référent, consignes", "Fiche mission bénévole"],
    ["Sécurité", "Accès, risques, équipements, personnes autorisées", "Consignes sécurité ou plan de prévention"],
    ["Action", "Présences, horaires, tâches réalisées, incidents éventuels", "Feuille d'émargement et compte rendu"],
    ["Restitution", "Ce qui a été appris, ce qui reste à faire, suites proposées", "Compte rendu terrain"],
  ]);
}

function volunteerMissionSelectorSection() {
  return tableSection("Choisir une mission adaptée", "Le bon engagement dépend du temps disponible, des compétences et du niveau d'encadrement possible.", [
    ["Disponibilité", "Mission adaptée", "Encadrement nécessaire", "Trace attendue"],
    ["Quelques minutes", "Signaler un lieu, une ressource ou un contact local", "Consignes de signalement", "Fiche signalement"],
    ["Quelques heures", "Aider à documenter des sources publiques ou préparer une réunion", "Référent TVF", "Compte rendu court"],
    ["Une journée", "Participer à une action terrain encadrée", "Plan de prévention, consignes, référent sur place", "Feuille d'émargement"],
    ["Régulièrement", "Devenir relais local ou appui administratif", "Mission définie, limites écrites", "Fiche mission et suivi"],
    ["Compétence spécifique", "Apporter une expertise technique, juridique, communication ou bâtiment", "Périmètre et livrable précis", "Note ou livrable daté"],
  ]);
}

function financerOperationalSection() {
  return tableSection("Dossier financeur recevable", "Un financeur doit pouvoir distinguer une idée, un dossier instruit, une convention et un résultat. TVF doit préparer cette lecture avant toute demande.", [
    ["Élément", "Contenu attendu", "Document associé"],
    ["Besoin", "Territoire, public concerné, problème traité, urgence ou opportunité", "Fiche projet"],
    ["Budget", "Dépenses, contributions en nature, cofinancements, reste à financer", "Budget prévisionnel + plan de financement"],
    ["Risque", "Juridique, technique, financier, humain, calendrier, communication", "Matrice des risques"],
    ["Cadre", "Rôles, responsabilités, durée, conditions de communication", "Convention ou lettre d'intention"],
    ["Impact", "Indicateurs, méthode de calcul, limites, fréquence de reporting", "Grille d'impact + reporting financeur"],
  ]);
}

function financerDueDiligenceSection() {
  return tableSection("Lecture financeur en 15 minutes", "Ce cadre de lecture permet à un financeur ou mécène de savoir si un dossier TVF est assez mûr pour être étudié.", [
    ["Point de vérification", "Question à poser", "Réponse attendue", "Document"],
    ["Maturité", "Le dossier est-il une idée, une instruction, une convention ou une réalisation ?", "Statut clair et daté", "Fiche décision"],
    ["Besoin", "Quel problème territorial est traité ?", "Bien, public, territoire, urgence ou opportunité", "Fiche projet"],
    ["Budget", "Combien coûte la phase demandée et que couvre-t-elle ?", "Postes, devis, contributions, reste à financer", "Budget prévisionnel"],
    ["Risque", "Quels sont les risques majeurs ?", "Juridique, technique, financier, humain, communication", "Matrice des risques"],
    ["Preuve", "Comment l'impact sera-t-il mesuré ?", "Indicateurs, source, fréquence, limites", "Grille d'impact"],
    ["Reporting", "Que recevra le financeur ?", "Compte rendu, justificatifs, indicateurs et bilan prudent", "Reporting financeur"],
  ]);
}

function partnerOfficialisationSection() {
  return tableSection("Statuts de coopération", "Cette progression évite de présenter trop tôt une relation comme un partenariat officiel.", [
    ["Statut", "Définition", "Ce qui peut être communiqué"],
    ["Contact exploratoire", "Premier échange sans engagement", "Aucune annonce publique"],
    ["Coopération en instruction", "Sujet identifié, pièces en cours, faisabilité à vérifier", "Mention interne uniquement"],
    ["Lettre d'intention", "Volonté de travailler ensemble sur un périmètre limité", "Communication possible seulement si les deux parties valident"],
    ["Convention signée", "Rôles, durée, livrables, responsabilités et communication formalisés", "Partenariat affichable selon les termes de la convention"],
    ["Bilan publié", "Action réalisée, preuves disponibles, indicateurs vérifiés", "Résultat communicable avec limites et sources"],
  ]);
}

function audienceSection() {
  return `<section class="section" ${sectionAttrs("Parcours par public", "parcours-publics")}><div class="container audience-grid"><article id="collectivite"><h3>Collectivité</h3><p>TVF peut aider à préparer un diagnostic, identifier des biens ou ressources et structurer une expérimentation locale. La coopération doit rester compatible avec les compétences, politiques publiques et procédures de la collectivité.</p></article><article id="proprietaire"><h3>Propriétaire</h3><p>Un propriétaire peut présenter un bien vacant ou dégradé. TVF étudie alors l'état du bien, les contraintes, les usages possibles et les conditions d'une convention adaptée.</p></article><article id="entreprise"><h3>Entreprise</h3><p>Une entreprise peut contribuer par des matériaux, du mécénat, des compétences, des locaux ou de la logistique. La contribution doit être tracée et orientée vers un projet validé.</p></article><article id="citoyen"><h3>Citoyen ou bénévole</h3><p>Un habitant peut signaler une situation, rejoindre une mission, participer à un chantier encadré ou relayer les besoins de son territoire.</p></article></div></section>`;
}

function consentControl(id) {
  return `<label class="consent-field" for="${id}"><input id="${id}" name="consent" type="checkbox" value="true" data-summary-value="Oui"> J'accepte que Territoires Vivants France utilise ces informations pour répondre à ma demande, conformément à la <a href="${hrefFor("politique-confidentialite.html")}">politique de confidentialité</a>.</label>`;
}
function formSection() {
  return `<section class="section" ${sectionAttrs("Préparer une situation", "proposer")}><span class="anchor-target" id="signalement"></span><div class="container form-panel"><div><p class="section-kicker">Premier contact</p><h2>Préparer une situation</h2><p>Préparez une demande courte : profil, lieu, ressource, besoin et suite attendue. Le résumé pourra être envoyé à TVF ou conservé.</p></div><form data-prepare-form data-form-kind="situation" aria-describedby="preparation-note"><label class="hp-field" aria-hidden="true">Site web<input name="site" tabindex="-1" autocomplete="off"></label><label for="prep-profile">Votre profil</label><select id="prep-profile" name="profil"><option value="collectivite">Collectivité</option><option value="proprietaire">Propriétaire</option><option value="entreprise">Entreprise</option><option value="association">Association</option><option value="citoyen">Citoyen</option></select><label for="prep-subject">Objet</label><input id="prep-subject" name="objet" type="text" autocomplete="off" placeholder="Ex. logement vacant, matériaux, partenariat"><label for="prep-message">Message</label><textarea id="prep-message" name="message" placeholder="Décrivez le besoin, le lieu, les acteurs concernés et les délais."></textarea><p class="form-note" id="preparation-note">Le résumé est préparé localement. Vous pouvez ensuite l'envoyer à TVF ou utiliser l'e-mail de secours.</p><p class="form-note" data-local-draft-status hidden role="status">Brouillon restauré depuis cet onglet. Vous pouvez le modifier, le préparer ou l'effacer.</p><p class="form-note" data-save-status hidden role="status">Brouillon sauvegardé localement dans cet onglet.</p>${consentControl("prep-consent")}<button class="btn secondary" type="button" data-prepare-summary>Créer un résumé</button><a class="btn primary" href="mailto:${contact.email}" data-mailto-summary data-mailto-to="${contact.email}" data-mailto-subject="Demande TVF - situation à qualifier" hidden>Ouvrir l'e-mail</a><button class="btn secondary" type="button" data-copy-summary hidden>Copier le résumé</button><button class="btn secondary" type="button" data-download-summary hidden>Télécharger le résumé</button><button class="btn secondary" type="button" data-reset-form hidden>Effacer le brouillon</button><button class="btn primary" type="button" data-submit-form hidden>Envoyer à TVF</button><p class="form-note" data-submit-status hidden role="status"></p><output class="form-summary" data-form-summary hidden aria-live="polite"></output><a class="btn secondary" href="${hrefFor("contact.html")}" data-transfer-summary>Passer par la page contact</a></form></div></section>`;
}

function contactSection() {
  return `<section class="section" ${sectionAttrs("Demander un rendez-vous", "contact-form")}><div class="container form-panel"><div><p class="section-kicker">Rendez-vous</p><h2>Demander un rendez-vous</h2><p>Présentez votre demande en quelques éléments : profil, territoire, objet, pièces disponibles et suite souhaitée. TVF peut ensuite vous répondre par e-mail ou téléphone.</p></div><form data-prepare-form data-form-kind="rendez-vous" aria-describedby="contact-note"><label class="hp-field" aria-hidden="true">Site web<input name="site" tabindex="-1" autocomplete="off"></label><label for="contact-profile">Votre profil</label><select id="contact-profile" name="profil"><option value="">Choisir un profil</option><option value="collectivite">Collectivité / EPCI</option><option value="proprietaire">Propriétaire</option><option value="entreprise">Entreprise</option><option value="association">Association</option><option value="benevole">Bénévole / citoyen</option><option value="financeur">Financeur / mécène</option><option value="presse">Presse / institution</option></select><label for="contact-name">Nom / structure</label><input id="contact-name" name="nom" type="text" autocomplete="name" placeholder="Votre nom ou organisme"><label for="contact-email">E-mail</label><input id="contact-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="contact@exemple.fr"><label for="contact-phone">Téléphone</label><input id="contact-phone" name="telephone" type="tel" autocomplete="tel" inputmode="tel" placeholder="06 00 00 00 00"><label for="contact-location">Commune / territoire concerné</label><input id="contact-location" name="territoire" type="text" autocomplete="address-level2" placeholder="Ex. Saint-Étienne, quartier, commune ou EPCI"><label for="contact-subject">Objet de la demande</label><input id="contact-subject" name="objet" type="text" autocomplete="off" placeholder="Ex. logement vacant, matériaux, friche, rendez-vous collectivité"><label for="contact-message">Message</label><textarea id="contact-message" name="message" autocomplete="off" placeholder="Décrivez la situation, les pièces disponibles, les acteurs connus et la suite souhaitée."></textarea><p class="form-note" id="contact-note">Votre résumé est préparé dans le navigateur puis transmis à TVF après validation. L'e-mail reste disponible en solution de secours.</p><p class="form-note" data-draft-status hidden role="status">Résumé récupéré depuis la page Agir avec nous. Relisez le message avant tout envoi officiel.</p><p class="form-note" data-local-draft-status hidden role="status">Brouillon restauré depuis cet onglet. Vous pouvez le modifier, le préparer ou l'effacer.</p><p class="form-note" data-save-status hidden role="status">Brouillon sauvegardé localement dans cet onglet.</p>${consentControl("contact-consent")}<button class="btn primary" type="button" data-prepare-summary>Préparer l'envoi</button><a class="btn primary" href="mailto:${contact.email}" data-mailto-summary data-mailto-to="${contact.email}" data-mailto-subject="Demande de rendez-vous TVF" hidden>Ouvrir l'e-mail</a><button class="btn secondary" type="button" data-copy-summary hidden>Copier le résumé</button><button class="btn secondary" type="button" data-download-summary hidden>Télécharger le résumé</button><button class="btn secondary" type="button" data-reset-form hidden>Effacer le brouillon</button><button class="btn primary" type="button" data-submit-form hidden>Envoyer à TVF</button><p class="form-note" data-submit-status hidden role="status"></p><output class="form-summary" data-form-summary hidden aria-live="polite"></output></form></div></section>`;
}

function legalSection() {
  return `<section class="section" ${sectionAttrs("Mentions légales", "mentions-legales-detail")}><div class="container legal"><h2>Cadre légal du site</h2><h3>Éditeur du site</h3><p><strong>Territoires Vivants France</strong><br>Nom du site : Territoires Vivants France<br>Adresse du site : <a href="https://www.territoiresvivantsfrance.fr" rel="noopener">www.territoiresvivantsfrance.fr</a><br>${official.status}<br>RNA : ${official.rna}<br>SIREN : ${official.siren}<br>SIRET du siège : ${official.siret}<br>${contact.address}<br>E-mail : <a href="mailto:${contact.email}">${contact.email}</a><br>Téléphone : <a href="tel:${contact.phoneHref}">${contact.phone}</a></p><h3>Directeur de la publication</h3><p>Directeur de la publication : Edryan Rangoly, président fondateur de Territoires Vivants France.</p><h3>Responsables associatifs</h3><p>Président fondateur : Edryan Rangoly.<br>Secrétaire et trésorier : M. Lambeau Jordan.</p><h3>Références administratives</h3><p>${official.receiptLabel}. Déclaration en date du ${official.declarationDate}. Décision prise le ${official.decisionDate}. Récépissé délivré à ${official.receiptPlace} le ${official.receiptDate} par ${official.authority}. SIREN : ${official.siren}. SIRET du siège : ${official.siret}. Catégorie juridique : ${official.legalCategory}. Activité principale exercée (APE) : ${official.ape}. Appartenance au champ de l’ESS : ${official.ess}. Entreprise active depuis le ${official.activeSince}. Informations issues de l’avis de situation au répertoire SIRENE à la date du ${official.sireneDate}.</p><h3>Statuts</h3><p>Les statuts de Territoires Vivants France ont été établis à Saint-Étienne le 22 juin 2026. Ils prévoient notamment une durée indéterminée, un bureau composé d’un président, d’un secrétaire et d’un trésorier, des ressources autorisées par la loi et une attribution de l’actif net à un organisme d’intérêt général ou à objet similaire en cas de dissolution.</p><h3>Hébergement</h3><p>Le site territoiresvivantsfrance.fr est hébergé et déployé par <strong>Vercel Inc.</strong>, plateforme Vercel. Vercel fournit les services techniques d’hébergement, de déploiement et de diffusion du site. Site de l’hébergeur : <a href="https://vercel.com" rel="noopener">https://vercel.com</a>. Les coordonnées postales et téléphoniques de l’hébergeur doivent être vérifiées à partir des informations contractuelles du compte Vercel avant publication d’une version définitive des mentions.</p><h3>Prestataires techniques</h3><p>Le fonctionnement du site peut mobiliser plusieurs prestataires : Vercel pour l’hébergement et le déploiement, Supabase pour l’enregistrement technique des demandes issues des formulaires lorsque le service est activé, Brevo pour les notifications e-mail et accusés de réception lorsque le service est configuré, et GitHub pour la gestion du dépôt de code et le déclenchement du déploiement. Ces prestataires interviennent uniquement dans le cadre technique nécessaire au fonctionnement du site et au traitement des demandes.</p><h3>Données personnelles et RGPD</h3><p>TVF est responsable du traitement des données personnelles transmises via le site. Les formulaires et parcours présentés servent à préparer les informations utiles à une demande : contact, signalement, proposition de bien, proposition de matériaux, partenariat ou demande de rendez-vous. Les données doivent être traitées avec une finalité claire, une durée de conservation adaptée, un accès limité aux personnes habilitées et un droit de contact pour les personnes concernées. La page <a href="politique-confidentialite.html">Politique de confidentialité</a> précise les finalités, les données concernées, les destinataires, les durées de conservation indicatives et les droits des personnes.</p><h3>Délégué à la protection des données</h3><p>TVF n’a pas désigné de délégué à la protection des données à ce stade. Toute demande relative aux données personnelles peut être adressée à <a href="mailto:${contact.email}">${contact.email}</a>.</p><h3>Cookies et traceurs</h3><p>Le site ne prévoit pas, à ce stade, de cookies publicitaires ou de traceurs de mesure d’audience nécessitant un consentement préalable. Si un outil de mesure d’audience, de publicité, de suivi social ou de remarketing est activé ultérieurement, TVF devra mettre à jour cette information et, lorsque nécessaire, recueillir le consentement de l’utilisateur.</p><h3>Crédits et propriété intellectuelle</h3><p>Le logo, les textes, documents, visuels, gabarits et éléments graphiques associés à Territoires Vivants France sont protégés. Toute réutilisation, modification, reproduction ou diffusion doit faire l’objet d’une autorisation préalable. Les photographies et illustrations utilisées sur le site doivent provenir de sources autorisées : images fournies par TVF, images libres de droits, licences adaptées ou créations spécifiquement produites pour TVF.</p><h3>Responsabilité éditoriale</h3><p>Les contenus du site présentent une démarche associative, des méthodes et des documents de travail. Ils ne constituent pas un conseil juridique, technique, financier ou administratif personnalisé. Chaque projet doit être vérifié et adapté avec les interlocuteurs compétents, les propriétaires, les collectivités, les professionnels qualifiés et les autorités concernées lorsque nécessaire.</p><h3>Dons, fiscalité et reçus</h3><p>Les informations relatives aux dons, reçus fiscaux, avantages fiscaux ou dispositifs de mécénat seront précisées selon le cadre légal applicable à l’association et uniquement après vérification des conditions d’éligibilité. Aucune réduction fiscale ne doit être considérée comme acquise sans confirmation officielle.</p><h3>Signalement, rectification et contact</h3><p>Toute demande de correction, signalement de contenu, demande relative aux droits d’auteur, demande RGPD ou question sur les mentions légales peut être adressée à <a href="mailto:${contact.email}">${contact.email}</a>.</p><p><strong>Dernière mise à jour :</strong> juillet 2026.</p></div></section>`;
}

function iconFor(text) {
  const t = text.toLowerCase();
  if (t.includes("logement") || t.includes("habitat") || t.includes("propri")) return "H";
  if (t.includes("commerce")) return "C";
  if (t.includes("mat")) return "R";
  if (t.includes("friche") || t.includes("terrain")) return "F";
  if (t.includes("solid") || t.includes("béné") || t.includes("citoy")) return "S";
  if (t.includes("collect")) return "T";
  if (t.includes("entreprise")) return "E";
  if (t.includes("finance")) return "€";
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
    "politique-confidentialite.html": [["Mentions légales", "mentions-legales.html"]],
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
      sameAs: [socialLinks.facebook, socialLinks.whatsapp],
      address: {
        "@type": "PostalAddress",
        streetAddress: "25 rue Élise Gervais",
        postalCode: "42000",
        addressLocality: "Saint-Étienne",
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
    "index.html": ["Première étape", "Vous voulez savoir par où commencer ?", "Choisissez votre profil et préparez une première demande lisible en quelques minutes.", [["Choisir mon parcours", "agir-avec-nous.html"], ["Demander un échange", "contact.html"]]],
    "contact.html": ["Contact direct", "Votre demande est prête à être envoyée ?", `Envoyez le résumé préparé à ${contact.email} ou appelez le ${contact.phone}.`, [["Écrire à TVF", `mailto:${contact.email}`]]],
    "documents.html": ["Documents", "Vous ne savez pas quel modèle choisir ?", "Commencez par les documents essentiels ou demandez une orientation avant de remplir un dossier complet.", [["Demander une orientation", "contact.html"], ["Voir les essentiels", "#les-documents-essentiels"]]],
    "saint-etienne.html": ["Territoire pilote", "Vous êtes acteur à Saint-Étienne ?", "Présentez un bien, une ressource, un besoin public ou une coopération possible pour alimenter le pilote.", [["Présenter une situation", "contact.html"]]],
    "observatoire.html": ["Signalement", "Vous connaissez un lieu ou une ressource à qualifier ?", "Transmettez une information factuelle : TVF la traitera comme un signalement, pas comme un projet automatique.", [["Signaler une situation", "agir-avec-nous.html#signalement"], ["Voir la méthode", "notre-methode.html"]]],
    "impact.html": ["Preuve", "Vous souhaitez soutenir TVF avec un suivi clair ?", "Appuyez-vous sur la grille d'impact, le reporting et les statuts de preuve avant toute annonce.", [["Voir les financeurs", "financeurs-mecenes.html"], ["Demander la grille", "contact.html"]]],
    "collectivites.html": ["Territoire partenaire", "Votre collectivité veut tester un périmètre pilote ?", "Préparez une fiche collectivité avec le besoin public, les données disponibles et la décision attendue.", [["Demander un rendez-vous", "contact.html"]]],
    "proprietaires.html": ["Bien inutilisé", "Vous souhaitez étudier un bien sans engagement prématuré ?", "Présentez le bien, son état, vos intentions et les limites à respecter.", [["Demander un échange", "contact.html"]]],
    "entreprises.html": ["Contribution", "Votre entreprise peut apporter une ressource utile ?", "Décrivez les matériaux, locaux, compétences ou soutiens disponibles pour vérifier leur affectation possible.", [["Contacter TVF", "contact.html"]]],
    "benevoles-citoyens.html": ["Engagement", "Vous voulez aider sans improvisation ?", "Indiquez votre territoire, vos disponibilités et le type de mission que vous pouvez réaliser.", [["Nous contacter", "contact.html"]]],
    "financeurs-mecenes.html": ["Soutien", "Vous souhaitez financer une démarche vérifiable ?", "Demandez un échange sur un dossier instruit, avec budget, risques, indicateurs et reporting.", [["Contacter TVF", "contact.html"]]],
    "partenaires.html": ["Coopération", "Vous envisagez une coopération avec TVF ?", "Avant toute communication, clarifions le périmètre, les responsabilités, la durée et les règles d'officialisation.", [["Contacter TVF", "contact.html"]]],
  };
  const [kicker, title, text, actions] = map[page.file] || ["Passer à l'étape suivante", "Vous avez un bien, une ressource ou un besoin territorial ?", "Présentez la situation à TVF pour préparer un premier échange clair et utile.", [["Agir avec nous", "agir-avec-nous.html"], ["Nous contacter", "contact.html"]]];
  return `<section class="cta-band"><div class="container cta-band-inner"><div><p class="section-kicker">${kicker}</p><h3>${title}</h3><p class="section-lead">${text}</p></div><div class="cta-band-actions">${actions.slice(0, 1)
    .map(([label, href]) => `<a class="btn primary" href="${hrefFor(href)}">${label}</a>`)
    .join("")}</div></div></section>`;
}

function institutionalNarrativeFor(page) {
  const narratives = {
    "index.html": [
      "Un portail de coopération territoriale",
      "Territoires Vivants France se positionne comme un outil d'intérêt général destiné à relier des situations aujourd'hui dispersées : biens vacants, ressources inutilisées, besoins locaux, compétences techniques et capacités de financement. Le site doit être lu comme une porte d'entrée vers une méthode de travail, pas comme une simple vitrine associative.",
      "La démarche proposée repose sur une exigence constante : qualifier avant d'annoncer, conventionner avant d'agir et documenter avant de publier un impact. Cette posture permet de dialoguer avec les collectivités, les propriétaires, les entreprises et les financeurs dans un cadre sérieux, compréhensible et vérifiable."
    ],
    "qui-sommes-nous.html": [
      "Une association nationale en structuration",
      "TVF porte une ambition nationale tout en assumant une étape de construction progressive. Son rôle n'est pas de se substituer aux politiques publiques, mais de créer les conditions opérationnelles d'une coopération entre acteurs qui, trop souvent, ne disposent pas du même langage, du même calendrier ou des mêmes outils.",
      "L'association doit donc avancer avec une double exigence : une vision forte pour la revitalisation des territoires et une méthode prudente, documentée, compatible avec les responsabilités publiques, privées et associatives."
    ],
    "nos-actions.html": [
      "Des actions conçues pour produire des décisions",
      "Les actions de TVF ne sont pas présentées comme des promesses isolées. Elles constituent des cadres d'intervention permettant de transformer une situation bloquée en dossier lisible : un besoin identifié, un acteur responsable, des ressources mobilisables, des contraintes connues et une suite formalisable.",
      "Cette approche donne aux collectivités, entreprises, propriétaires et financeurs une base commune pour arbitrer, prioriser et engager une coopération sans confusion entre intention, projet en instruction et action réalisée."
    ],
    "nos-poles.html": [
      "Une organisation métier au service d'une chaîne complète",
      "Les cinq pôles ne sont pas de simples catégories de communication. Ils structurent les compétences nécessaires à une revitalisation territoriale complète : identifier un bien, qualifier son usage, mobiliser les matériaux, sécuriser la participation humaine et préparer une remise en usage durable.",
      "Chaque pôle permet d'isoler un enjeu technique ou social, tout en restant relié aux autres. C'est cette articulation qui donne à TVF sa valeur : une capacité à coordonner plutôt qu'à additionner des interventions dispersées."
    ],
    "observatoire.html": [
      "Une observation au service de la décision publique et territoriale",
      "L'observatoire TVF vise à transformer des informations éparses en données exploitables. Il ne s'agit pas d'exposer des biens ou de publier des signalements bruts, mais de construire une lecture territoriale utile à la priorisation, au dialogue et à l'instruction de dossiers.",
      "Cette logique suppose un haut niveau de prudence : sources citées, statuts de vérification, respect des propriétaires, protection des données sensibles et distinction claire entre information publique, donnée réservée et décision interne."
    ],
    "saint-etienne.html": [
      "Saint-Étienne comme première démonstration territoriale",
      "Le territoire stéphanois constitue un terrain cohérent pour tester la méthode TVF : patrimoine existant, enjeux de centre-ville, reconversion, habitat ancien, économie circulaire et mobilisation d'acteurs locaux. L'objectif n'est pas d'afficher des résultats prématurés, mais de construire un pilote crédible.",
      "Ce pilote doit permettre de produire des dossiers courts, des conventions adaptées, des indicateurs suivis et une méthode réplicable dans d'autres territoires lorsque les conditions de gouvernance, de financement et de partenariat seront réunies."
    ],
    "collectivites.html": [
      "Un appui de structuration pour les territoires",
      "Une collectivité confrontée à la vacance, aux friches, aux commerces fermés ou aux ressources inutilisées a souvent besoin d'un cadre de coordination plus que d'un dispositif supplémentaire. TVF propose une méthode pour relier diagnostic, acteurs, ressources, usages possibles et suivi d'impact.",
      "La coopération doit toujours rester compatible avec les compétences de la collectivité, ses politiques publiques, ses procédures internes et ses règles de communication. C'est cette rigueur qui permet d'envisager une expérimentation locale crédible."
    ],
    "proprietaires.html": [
      "Un cadre respectueux de la propriété privée",
      "TVF s'adresse aux propriétaires qui souhaitent étudier une solution pour un bien vacant, dégradé ou sous-utilisé, sans perdre la maîtrise de leur patrimoine. La première étape reste une phase d'étude : comprendre l'état du bien, les contraintes, les usages envisageables et les conditions d'une coopération éventuelle.",
      "Aucune intervention sérieuse ne peut être engagée sans autorisation, convention, assurance, règles d'accès et responsabilités clairement définies. Cette sécurisation protège à la fois le propriétaire, TVF, les partenaires et les futurs usagers."
    ],
    "entreprises.html": [
      "Une contribution économique utile et traçable",
      "Les entreprises peuvent jouer un rôle décisif dans la revitalisation territoriale : matériaux, équipements, logistique, compétences, mécénat, locaux ou soutien à l'insertion. TVF doit transformer ces apports en contributions utiles, affectées à un besoin réel et documentées.",
      "La valeur du partenariat ne repose pas sur une visibilité immédiate, mais sur une preuve d'utilité territoriale : ressource qualifiée, destination validée, convention lorsque nécessaire et restitution claire de la contribution."
    ],
    "financeurs-mecenes.html": [
      "Un financement adossé à des dossiers instruits",
      "TVF doit offrir aux financeurs une lecture claire des projets : besoin territorial, phase financée, budget, risques, indicateurs et conditions de suivi. Cette exigence évite les promesses générales et permet de distinguer objectif, engagement, convention et résultat.",
      "Le mécénat, les subventions, les contributions privées ou les financements solidaires n'ont de sens que s'ils soutiennent des objets précis, suivis et compatibles avec l'intérêt général poursuivi par l'association."
    ],
    "partenaires.html": [
      "Des partenariats fondés sur un cadre écrit",
      "TVF distingue clairement le contact exploratoire, la coopération en instruction et le partenariat officialisé. Cette progression protège la crédibilité de l'association et évite toute confusion sur les rôles, les engagements ou l'utilisation publique d'un nom ou d'un logo.",
      "Un partenariat institutionnel ou économique doit préciser le périmètre, les responsabilités, la durée, les règles de communication, les livrables attendus et les conditions de suivi."
    ],
    "notre-methode.html": [
      "Une méthode avant tout opérationnelle",
      "La méthode TVF repose sur une conviction simple : un territoire ne manque pas toujours d'idées, mais souvent d'un cadre pour relier le bon bien, le bon usage, les bons acteurs et les bonnes ressources. La méthode sert à transformer cette complexité en décisions successives.",
      "Elle organise le passage du signalement à l'instruction, de l'instruction à la convention, puis de l'action au suivi d'impact. Cette chaîne documentaire est essentielle pour inspirer confiance aux institutions et aux financeurs."
    ],
    "impact.html": [
      "Une mesure d'impact fondée sur la preuve",
      "TVF ne doit pas confondre ambition et résultat. Les indicateurs présentés doivent distinguer les objectifs, les dossiers qualifiés, les conventions signées, les actions réalisées et les impacts vérifiés. Cette discipline est indispensable pour dialoguer avec des collectivités, financeurs et journalistes.",
      "La mesure d'impact doit être progressive, sourcée et datée. Elle permet de rendre compte sans surpromettre et de construire une crédibilité durable."
    ],
    "gouvernance.html": [
      "Une gouvernance lisible pour sécuriser les décisions",
      "La crédibilité de TVF dépend autant de sa mission que de sa capacité à décider proprement. Les critères de sélection, les responsabilités, les preuves, les conflits d'intérêts potentiels et les règles de communication doivent être documentés.",
      "Cette gouvernance donne aux collectivités, entreprises et financeurs un cadre de confiance avant toute coopération formalisée."
    ],
  };

  const item = narratives[page.file];
  if (!item) return "";
  const [title, first, second] = item;
  return `<section class="institutional-narrative"><div class="container institutional-narrative-inner"><p class="section-kicker">Lecture institutionnelle</p><h2>${title}</h2><div><p>${first}</p><p>${second}</p></div></div></section>`;
}

function quickBriefFor(page) {
  const briefs = {
    "index.html": ["Positionnement", "TVF coordonne la remise en usage de biens, lieux et ressources inutilisés à partir d'un cadre de coopération territorial.", "Qualifier le profil, le territoire et le sujet à instruire.", "Dossier TVF", "agir-avec-nous.html"],
    "nos-actions.html": ["Cadre d'intervention", "Les actions structurent les principaux leviers : habitat, commerce, matériaux, friches, insertion et financement.", "Orienter le dossier vers le levier prioritaire.", "Fiche projet", "contact.html"],
    "nos-poles.html": ["Organisation opérationnelle", "Les cinq pôles donnent une lecture professionnelle des compétences mobilisables sur un dossier.", "Identifier le pôle pilote et les pôles associés.", "Grille d'instruction", "nos-actions.html"],
    "observatoire.html": ["Observation territoriale", "L'observatoire rassemble données publiques, signalements qualifiés et décisions internes sans exposer d'informations sensibles.", "Documenter une situation factuelle.", "Fiche signalement", "agir-avec-nous.html#signalement"],
    "agir-avec-nous.html": ["Parcours d'engagement", "Chaque contribution doit être reliée à un besoin, un territoire, un cadre et une suite identifiable.", "Présenter le profil et la contribution envisagée.", "Fiche signalement", "#proposer"],
    "saint-etienne.html": ["Territoire pilote", "Saint-Étienne sert de socle d'expérimentation pour éprouver la méthode TVF sur des dossiers concrets et vérifiables.", "Proposer un bien, une ressource ou un besoin local.", "Dossier Saint-Étienne", "documents/dossier-territorial-saint-etienne.md"],
    "contact.html": ["Relation institutionnelle", "La prise de contact doit permettre d'identifier le profil, le territoire, l'objet et le niveau de maturité du dossier.", "Transmettre les éléments utiles au premier cadrage.", "Fiche adaptée au profil", "#contact-form"],
    "documents.html": ["Base documentaire", "Les supports cadrent les échanges, les conventions, les décisions et les preuves avant toute action publique.", "Sélectionner le pack adapté au rendez-vous.", "Dossier TVF", "#les-documents-essentiels"],
    "impact.html": ["Suivi d'impact", "Les indicateurs distinguent objectifs, dossiers instruits, conventions et résultats vérifiés.", "Lire les chiffres avec leur source et leur statut.", "Grille d'impact", "documents/grille-impact.md"],
    "collectivites.html": ["Territoires partenaires", "Le cadre collectivité articule diagnostic, périmètre, gouvernance, convention et suivi.", "Préparer un premier périmètre de coopération.", "Fiche collectivité", "documents/fiche-collectivite.md"],
    "proprietaires.html": ["Biens privés", "Un bien peut être étudié sans engagement automatique, avec un cadre respectueux de la propriété et des responsabilités.", "Décrire le bien, ses contraintes et les usages envisageables.", "Fiche propriétaire", "documents/fiche-proprietaire.md"],
    "entreprises.html": ["Contribution économique", "Matériaux, locaux, compétences ou mécénat doivent être qualifiés, traçables et affectés à un besoin réel.", "Présenter la ressource et ses conditions de mobilisation.", "Fiche entreprise", "documents/fiche-entreprise.md"],
    "benevoles-citoyens.html": ["Mobilisation citoyenne", "L'engagement s'organise autour de missions utiles, sécurisées, limitées et documentées.", "Choisir une mission compatible avec le temps et les compétences disponibles.", "Fiche bénévole", "documents/fiche-benevole.md"],
    "financeurs-mecenes.html": ["Financement responsable", "Un soutien doit s'appuyer sur un projet instruit, un budget, des risques identifiés et un reporting vérifiable.", "Demander une lecture financeur du dossier.", "Plan de financement", "documents/plan-financement-territorial.md"],
    "partenaires.html": ["Coopération", "Un partenariat TVF repose sur un périmètre écrit, des responsabilités, une durée et une communication validée.", "Qualifier la forme de coopération possible.", "Fiche partenaire", "documents/fiche-partenaire-potentiel.md"],
    "notre-methode.html": ["Méthodologie", "La méthode transforme un signalement ou une proposition en décision documentée, conventionnée ou classée.", "Suivre les étapes de qualification et de décision.", "Grille d'instruction", "documents/grille-instruction-dossier.md"],
    "qui-sommes-nous.html": ["Identité", "TVF porte une mission de coopération nationale au service des territoires, des propriétaires et des ressources inutilisées.", "Lire la méthode ou engager un échange institutionnel.", "Dossier TVF", "documents/dossier-presentation-tvf.md"],
    "gouvernance.html": ["Gouvernance", "Les décisions doivent être tracées, argumentées et compatibles avec l'objet statutaire de l'association.", "Vérifier le cadre avant tout engagement.", "Charte éthique", "documents/charte-ethique.md"],
    "transparence.html": ["Transparence", "La communication distingue informations établies, dossiers en instruction, objectifs et résultats vérifiés.", "Appuyer toute annonce sur une preuve ou un statut clair.", "Registre décisions", "documents/registre-suivi-decisions.md"],
    "faq.html": ["Questions clés", "Les réponses orientent vers les pages, documents et interlocuteurs utiles sans multiplier les détours.", "Rechercher par profil ou passer au contact.", "Documents essentiels", "documents.html#les-documents-essentiels"],
    "kit-media.html": ["Communication", "Le kit média fixe les mots, visuels et limites de communication publique autour de TVF.", "Utiliser les éléments validés pour toute présentation.", "Pitch officiel", "documents/pitch-officiel-tvf.md"],
    "mentions-legales.html": ["Cadre légal", "Les informations administratives publiques, les responsabilités et les mentions d'hébergement sont centralisées ici.", "Contacter TVF pour toute précision.", "Mentions", "contact.html"],
    "politique-confidentialite.html": ["Données personnelles", "La politique précise les finalités, données concernées, durées indicatives, destinataires et droits des personnes.", "Adresser toute demande RGPD au contact officiel.", "Mentions légales", "mentions-legales.html"],
  };

  const brief = briefs[page.file];
  if (!brief) return "";

  const [label, objective, action, documentName, href] = brief;
  return `<aside class="quick-brief institutional-brief" aria-label="Synthèse institutionnelle"><div class="container quick-brief-grid"><div><p class="section-kicker">Synthèse</p><strong>${label}</strong></div><p><span>Enjeu</span>${objective}</p><p><span>Suite</span>${action}</p><p><span>Référence</span><a href="${hrefFor(href)}">${documentName}</a></p></div></aside>`;
}

function decisionPanelFor(page) {
  const panels = {
    "index.html": {
      kicker: "Orientation",
      title: "Une porte d'entrée vers la coopération territoriale.",
      text: "La page d'accueil présente TVF comme une plateforme nationale capable de qualifier un besoin, d'orienter les acteurs et de préparer les premiers cadres de coopération.",
      action: ["Engager une démarche", "agir-avec-nous.html"],
      items: [
        ["Mission", "Coordonner biens vacants, ressources inutilisées et acteurs territoriaux autour d'usages utiles."],
        ["Publics", "Collectivités, propriétaires, entreprises, bénévoles, financeurs, associations et citoyens."],
        ["Suite", "Un premier échange permet de qualifier le sujet, le territoire, les pièces disponibles et le niveau de maturité."],
      ],
    },
    "nos-actions.html": {
      kicker: "Intervention",
      title: "Des leviers opérationnels reliés à des livrables institutionnels.",
      text: "Chaque action est pensée comme un cadre d'instruction : identifier un problème, qualifier les contraintes, formaliser les responsabilités et produire une décision exploitable.",
      action: ["Préparer une fiche projet", "documents/fiche-projet.md"],
      items: [
        ["Diagnostic", "Localiser le bien, la ressource ou le besoin qui bloque une dynamique territoriale."],
        ["Qualification", "Croiser acteurs, contraintes, usages possibles, risques et preuves disponibles."],
        ["Décision", "Aboutir à une fiche, un scénario, une convention, un classement ou un indicateur."],
      ],
    },
    "nos-poles.html": {
      kicker: "Organisation",
      title: "Cinq pôles pour structurer une chaîne complète de revitalisation.",
      text: "Les pôles donnent une lecture métier du dispositif : habitat, matériaux, commerce, friches et mobilisation humaine sont reliés dans un même cadre de décision.",
      action: ["Voir les actions", "nos-actions.html"],
      items: [
        ["Pilotage", "Un pôle principal porte l'analyse selon la nature dominante du dossier."],
        ["Coordination", "Les pôles associés complètent l'instruction lorsque le sujet devient transversal."],
        ["Arbitrage", "TVF peut compléter, visiter, instruire, conventionner, reporter ou classer un dossier."],
      ],
    },
    "collectivites.html": {
      kicker: "Territoire partenaire",
      title: "Un cadre lisible pour expérimenter avec une commune ou un EPCI.",
      text: "La coopération avec une collectivité repose sur un périmètre défini, un référent identifié, des données mobilisables, des règles de communication et des livrables datés.",
      action: ["Remplir la fiche collectivité", "documents/fiche-collectivite.md"],
      items: [
        ["Périmètre", "Quartier, rue, typologie de biens, friche ou besoin public clairement délimité."],
        ["Gouvernance", "Référent, rythme de suivi, règles de communication et validation des livrables."],
        ["Livrables", "Diagnostic court, registre, note d'opportunité, convention ou tableau de bord."],
      ],
    },
    "proprietaires.html": {
      kicker: "Propriété sécurisée",
      title: "Un parcours d'étude sans engagement prématuré du propriétaire.",
      text: "TVF étudie les biens proposés dans un cadre respectueux de la propriété : accès autorisé, usage compatible, responsabilités écrites et convention adaptée lorsque le dossier avance.",
      action: ["Remplir la fiche propriétaire", "documents/fiche-proprietaire.md"],
      items: [
        ["Bien", "Type, adresse, état apparent, photos, diagnostics, contraintes et accès."],
        ["Intention", "Usage acceptable, durée possible, limites non négociables et attentes du propriétaire."],
        ["Suite", "étude, visite autorisée, scénarios d'usage, convention ou réorientation."],
      ],
    },
    "entreprises.html": {
      kicker: "Contribution territoriale",
      title: "Une contribution économique qualifiée, tracée et valorisable.",
      text: "Matériaux, compétences, locaux ou mécénat sont intégrés à une logique de projet. L'entreprise dispose d'un cadre clair et TVF conserve une affectation maîtrisée des ressources.",
      action: ["Remplir la fiche entreprise", "documents/fiche-entreprise.md"],
      items: [
        ["Ressource", "Catégorie, quantité, état, localisation, délai, conditions de retrait ou disponibilité."],
        ["Affectation", "Acceptation, refus, stockage, mission, mise à disposition ou orientation vers un projet."],
        ["Preuve", "Bordereau, convention, procès-verbal de remise, compte rendu ou reporting de contribution."],
      ],
    },
    "saint-etienne.html": {
      kicker: "Territoire pilote",
      title: "Saint-Étienne comme démonstrateur méthodologique.",
      text: "Le pilote doit documenter des dossiers courts, vérifiables et reproductibles avant tout déploiement national : données, acteurs, blocages, conventions, coûts et conditions de duplication.",
      action: ["Lire le dossier Saint-Étienne", "documents/dossier-territorial-saint-etienne.md"],
      items: [
        ["Cadrage", "Données publiques, besoins locaux, acteurs et périmètres à prioriser."],
        ["Dossiers tests", "Habitat, commerce, matériaux, friches et mobilisation citoyenne."],
        ["Bilan", "Ce qui fonctionne, ce qui bloque, ce qui peut être dupliqué ailleurs."],
      ],
    },
    "financeurs-mecenes.html": {
      kicker: "Financement",
      title: "Un soutien relié à un objet, un budget et une preuve de suivi.",
      text: "La page financeur prépare une lecture institutionnelle : besoin, phase financée, risques, cadre juridique, indicateurs, calendrier et reporting.",
      action: ["Préparer une demande de soutien", "documents/demande-soutien-financier.md"],
      items: [
        ["Objet", "Phase financée, territoire, bénéficiaires, dépenses et reste à financer."],
        ["Risque", "Juridique, technique, financier, humain, calendrier et communication."],
        ["Reporting", "Justificatifs, indicateurs, limites et bilan transmis au financeur."],
      ],
    },
    "contact.html": {
      kicker: "Relation qualifiée",
      title: "Un premier contact orienté vers l'instruction du dossier.",
      text: "La page Contact structure les informations nécessaires au premier échange : profil, territoire, objet, documents disponibles et niveau d'urgence.",
      action: ["Préparer l'envoi", "#contact-form"],
      items: [
        ["Profil", "Collectivité, propriétaire, entreprise, association, bénévole, financeur ou presse."],
        ["Territoire", "Commune, quartier, adresse ou périmètre concerné."],
        ["Objet", "Bien, matériau, besoin public, partenariat, financement ou signalement."],
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
      <div><span class="footer-logo-box"><img src="assets/logo-territoires-vivants-france-web.png" width="583" height="181" alt="Territoires Vivants France" class="footer-logo" loading="lazy" decoding="async"></span><p>Plateforme nationale de coopération pour redonner vie aux biens, lieux et ressources inutilisés.</p></div>
      <div><h3>Navigation</h3>${nav.slice(0, 7).map(([label, href]) => `<a href="${hrefFor(href)}">${label}</a>`).join("")}</div>
      <div><h3>Ressources</h3><a href="${hrefFor("faq.html")}">FAQ</a><a href="${hrefFor("kit-media.html")}">Kit média</a><a href="${hrefFor("gouvernance.html")}">Gouvernance</a><a href="${hrefFor("mentions-legales.html")}">Mentions légales</a><a href="${hrefFor("politique-confidentialite.html")}">Politique de confidentialité</a></div>
      <div><h3>Siège</h3><p>25 rue Élise Gervais<br>42000 Saint-Étienne</p><p><a href="mailto:${contact.email}">${contact.email}</a><br><a href="tel:${contact.phoneHref}">${contact.phone}</a></p><div class="footer-social" aria-label="Réseaux et messagerie TVF"><a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Écrire à TVF sur WhatsApp"><span aria-hidden="true">WA</span><span>WhatsApp</span></a><a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Suivre TVF sur Facebook"><span aria-hidden="true">FB</span><span>Facebook</span></a></div><a class="btn secondary" href="${hrefFor("contact.html")}">Contacter TVF</a></div>
    </div>
    <div class="container footer-bottom"><span>© 2026 Territoires Vivants France - Tous droits réservés.</span><a class="footer-admin-link" href="${hrefFor("admin-demandes.html")}" rel="nofollow">Accès administrateur</a></div>
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
