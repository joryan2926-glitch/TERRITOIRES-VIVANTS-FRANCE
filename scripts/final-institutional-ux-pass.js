const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicPages = fs
  .readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8")
  .match(/^- (.+\.html)$/gm)
  .map((line) => line.replace(/^- /, ""));

const skipStory = new Set([
  "index.html",
  "faq.html",
  "contact.html",
  "mentions-legales.html",
  "politique-confidentialite.html",
  "statuts.html",
]);

const skipFaq = new Set([...skipStory, "sources-donnees.html", "sources-etude-saint-etienne.html"]);

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, html) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pageTitle(html, file) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function classify(file) {
  const f = file.toLowerCase();
  if (/logement|habitat|proprietaire|bien-solidaire|proposer-un-bien/.test(f)) return "habitat";
  if (/commerce/.test(f)) return "commerce";
  if (/materiaux|materiautheque|banque-materiaux/.test(f)) return "materials";
  if (/friche|terrain|espaces-abandonnes/.test(f)) return "land";
  if (/solidarite|insertion|benevole|recrutement/.test(f)) return "solidarity";
  if (/saint-etienne|impact|observatoire|carte|territoire|sources/.test(f)) return "observatory";
  if (/collectivite/.test(f)) return "collectivity";
  if (/entreprise|partenaire|partenariat|bailleur|fondation|mecene|investisseur|financer|don/.test(f)) return "partners";
  if (/gouvernance|transparence|ethique|documents|statuts/.test(f)) return "governance";
  if (/methode|vision|actions|poles|pilotes|antenne/.test(f)) return "strategy";
  return "default";
}

function typography(value) {
  return value
    .replaceAll(" a ", " &agrave; ")
    .replaceAll("A ", "&Agrave; ")
    .replaceAll("degrade", "d&eacute;grad&eacute;")
    .replaceAll("degrades", "d&eacute;grad&eacute;s")
    .replaceAll("degradee", "d&eacute;grad&eacute;e")
    .replaceAll("delaisse", "d&eacute;laiss&eacute;")
    .replaceAll("delaissee", "d&eacute;laiss&eacute;e")
    .replaceAll("delaissees", "d&eacute;laiss&eacute;es")
    .replaceAll("reemploi", "r&eacute;emploi")
    .replaceAll("reutilise", "r&eacute;utilis&eacute;")
    .replaceAll("reutilisee", "r&eacute;utilis&eacute;e")
    .replaceAll("reutilisees", "r&eacute;utilis&eacute;es")
    .replaceAll("dechets", "d&eacute;chets")
    .replaceAll("dechet", "d&eacute;chet")
    .replaceAll("proprietaire", "propri&eacute;taire")
    .replaceAll("proprietaires", "propri&eacute;taires")
    .replaceAll("collectivites", "collectivit&eacute;s")
    .replaceAll("collectivite", "collectivit&eacute;")
    .replaceAll("batiment", "b&acirc;timent")
    .replaceAll("batiments", "b&acirc;timents")
    .replaceAll("materiaux", "mat&eacute;riaux")
    .replaceAll("materiau", "mat&eacute;riau")
    .replaceAll("operationnelle", "op&eacute;rationnelle")
    .replaceAll("operationnel", "op&eacute;rationnel")
    .replaceAll("securise", "s&eacute;curis&eacute;")
    .replaceAll("securisee", "s&eacute;curis&eacute;e")
    .replaceAll("verifie", "v&eacute;rifi&eacute;")
    .replaceAll("verifiee", "v&eacute;rifi&eacute;e")
    .replaceAll("donnees", "donn&eacute;es")
    .replaceAll("donnee", "donn&eacute;e")
    .replaceAll("Donnees", "Donn&eacute;es")
    .replaceAll("Donnee", "Donn&eacute;e")
    .replaceAll("Strategie", "Strat&eacute;gie")
    .replaceAll("Reemploi", "R&eacute;emploi")
    .replaceAll("Collectivites", "Collectivit&eacute;s")
    .replaceAll("Methode", "M&eacute;thode")
    .replaceAll("Etudier", "&Eacute;tudier")
    .replaceAll("realise", "r&eacute;alis&eacute;")
    .replaceAll("realisee", "r&eacute;alis&eacute;e")
    .replaceAll("territorialise", "territorialis&eacute;")
    .replaceAll("territoriale", "territoriale")
    .replaceAll("Etat", "&Eacute;tat")
    .replaceAll("ethique", "&eacute;thique")
    .replaceAll("mecene", "m&eacute;c&egrave;ne")
    .replaceAll("mecennes", "m&eacute;c&egrave;nes")
    .replaceAll("interets", "int&eacute;r&ecirc;ts")
    .replaceAll("decisions", "d&eacute;cisions")
    .replaceAll("strategie", "strat&eacute;gie")
    .replaceAll("elargit", "&eacute;largit")
    .replaceAll("Saint-Etienne", "Saint-&Eacute;tienne")
    .replaceAll("fonde", "fond&eacute;")
    .replaceAll("fondee", "fond&eacute;e")
    .replaceAll("prepare", "pr&eacute;pare")
    .replaceAll("preparee", "pr&eacute;par&eacute;e")
    .replaceAll("separees", "s&eacute;par&eacute;es")
    .replaceAll("separes", "s&eacute;par&eacute;s")
    .replaceAll("qualifie", "qualifi&eacute;")
    .replaceAll("qualifiee", "qualifi&eacute;e")
    .replaceAll("capacites", "capacit&eacute;s")
    .replaceAll("resultats", "r&eacute;sultats")
    .replaceAll("methode", "m&eacute;thode");
}

const profiles = {
  habitat: {
    label: "Habitat et biens vacants",
    intro: "Cette page doit permettre de comprendre comment passer d'un bien vacant ou degrade a une remise en usage credible.",
    problem: "Un logement ou un batiment vacant peut degrader une rue, perdre de la valeur et priver le territoire d'un usage utile.",
    data: "Repere national : pres de 3 millions de logements vacants sont recenses en France selon l'INSEE.",
    solution: "TVF structure un parcours proprietaire : reperage, qualification, scenario d'usage, convention et suivi.",
    method: "Le bien n'est jamais annonce comme disponible avant verification juridique, technique, assurantielle et financiere.",
    partners: "Proprietaires, communes, EPCI, artisans, financeurs, associations, habitants et assureurs.",
    impact: "Remettre en usage le patrimoine existant, limiter la degradation et produire des lieux utiles sans artificialiser.",
    cta: ["Etudier le parcours proprietaire", "proprietaires.html"],
  },
  commerce: {
    label: "Commerce et centralites",
    intro: "Cette page explique comment une vitrine fermee peut redevenir un support d'activite locale.",
    problem: "Un local ferme fragilise l'image d'une rue, reduit les flux et accentue le sentiment de declin.",
    data: "Repere public : les programmes de revitalisation comme Action Coeur de Ville ciblent les centralites fragilisees.",
    solution: "TVF aide a qualifier le local, son etat, son potentiel d'usage et les acteurs capables de le reactiver.",
    method: "Chaque scenario distingue commerce durable, occupation temporaire, atelier, service local ou lieu associatif.",
    partners: "Proprietaires, collectivites, chambres consulaires, artisans, entrepreneurs, associations et financeurs.",
    impact: "Redonner une fonction visible aux rez-de-chaussee et renforcer l'attractivite de proximite.",
    cta: ["Signaler un commerce", "signalement.html"],
  },
  materials: {
    label: "Ressources et reemploi",
    intro: "Cette page montre comment transformer une ressource inutilisee en contribution territoriale documentee.",
    problem: "Des materiaux encore utiles sont souvent stockes, jetes ou mal orientes alors que des projets locaux manquent de moyens.",
    data: "Repere national : le SDES documente 310 millions de tonnes de dechets produits en France en 2020, tous secteurs confondus.",
    solution: "TVF prepare une Banque de Materiaux fondee sur la qualification, l'affectation a un projet et la tracabilite.",
    method: "Les materiaux ne sont pas distribues librement : ils sont acceptes, stockes ou orientes selon leur etat et l'usage prevu.",
    partners: "Entreprises, collectivites, artisans, associations, particuliers, logisticiens et lieux de stockage.",
    impact: "Reduire le gaspillage, limiter les couts de projet et donner une seconde vie a des ressources locales.",
    cta: ["Proposer des materiaux", "banque-materiaux.html"],
  },
  land: {
    label: "Friches, terrains et espaces",
    intro: "Cette page aide a comprendre comment qualifier un espace abandonne avant toute transformation.",
    problem: "Une friche ou un terrain delaisse peut bloquer un quartier, generer des risques et consommer l'attention publique.",
    data: "Repere public : Cartofriches du Cerema facilite l'identification et le partage d'informations sur les friches.",
    solution: "TVF relie diagnostic, usages compatibles, partenaires, regles d'acces, securite et suivi dans le temps.",
    method: "Aucune occupation n'est envisagee sans accord, assurance, autorisations, verification du sol et sortie clarifiee.",
    partners: "Collectivites, proprietaires fonciers, urbanistes, paysagistes, associations, habitants et services techniques.",
    impact: "Transformer des espaces delaissees en usages sobres : jardin, lieu associatif, biodiversite, formation ou culture.",
    cta: ["Voir la carte des territoires", "carte-territoires.html"],
  },
  solidarity: {
    label: "Insertion et engagement",
    intro: "Cette page precise comment l'action locale peut creer des parcours utiles, encadres et accessibles.",
    problem: "Les projets de revitalisation ont besoin de bras, de competences, de mediation et de cadres securises.",
    data: "Repere national : l'INSEE documente les situations de pauvrete, d'emploi et de fragilite sociale par territoire.",
    solution: "TVF prepare des missions adaptees : reperage, ateliers, tri, documentation, benevolat et chantiers encadres.",
    method: "Les travaux techniques restent confies a des professionnels ou a des equipes habilitees ; le benevolat est encadre.",
    partners: "Associations, missions locales, structures d'insertion, organismes de formation, collectivites et entreprises.",
    impact: "Relier engagement citoyen, competences locales et utilite concrete pour les habitants.",
    cta: ["Rejoindre une mission", "espace-benevoles.html"],
  },
  observatory: {
    label: "Donnees et territoire pilote",
    intro: "Cette page transforme des donnees dispersees en lecture operationnelle pour decider, prioriser et suivre.",
    problem: "Les donnees existent mais restent souvent separees : logement, commerce, foncier, environnement, insertion, financement.",
    data: "Sources mobilisables : INSEE, Cerema, ANCT, SDES, collectivites et jeux de donnees publics territoriaux.",
    solution: "TVF prepare une methode d'observation : reperer, qualifier, cartographier, documenter et mettre a jour.",
    method: "Les projections sont separees des resultats reels ; les indicateurs TVF restent a zero tant qu'ils ne sont pas verifies.",
    partners: "Collectivites, services de l'Etat, observatoires publics, chercheurs, associations, entreprises et habitants.",
    impact: "Aider les decideurs a passer du constat a la fiche projet territoriale, avec preuves et priorites lisibles.",
    cta: ["Consulter les sources", "sources-donnees.html"],
  },
  collectivity: {
    label: "Collectivites",
    intro: "Cette page doit montrer comment une commune ou un EPCI peut transformer une priorite publique en action de terrain.",
    problem: "Les collectivites doivent traiter vacance, friches, centralites, reemploi et insertion avec des moyens contraints.",
    data: "Repere public : les dispositifs nationaux existent, mais leur mise en oeuvre demande une coordination locale continue.",
    solution: "TVF peut apporter un cadre de cooperation : diagnostic, cartographie, fiche projet, convention et indicateurs.",
    method: "La convention fixe objectifs, roles, donnees partagees, responsabilites, calendrier, communication et suivi.",
    partners: "Communes, EPCI, departements, regions, services de l'Etat, bailleurs, entreprises, associations et habitants.",
    impact: "Gagner en lisibilite, accelerer les projets utiles et documenter les benefices pour le territoire.",
    cta: ["Devenir territoire partenaire", "contact.html"],
  },
  partners: {
    label: "Partenaires et financeurs",
    intro: "Cette page clarifie les contributions possibles et les garanties attendues avant toute publication.",
    problem: "Un projet territorial a besoin de moyens financiers, techniques, fonciers et humains clairement affectes.",
    data: "Repere de gouvernance : aucun partenaire, mecene ou financeur n'est affiche sans accord et information verifiable.",
    solution: "TVF prepare des fiches projet, budgets, conventions, pieces justificatives, jalons et indicateurs de restitution.",
    method: "Chaque contribution doit etre rattachee a un usage, un territoire, un calendrier et un suivi d'impact.",
    partners: "Entreprises, fondations, mecennes, investisseurs a impact, collectivites, associations et citoyens.",
    impact: "Transformer une contribution en preuve d'utilite territoriale, sociale et environnementale.",
    cta: ["Construire un partenariat", "partenariats-strategiques.html"],
  },
  governance: {
    label: "Gouvernance et garanties",
    intro: "Cette page donne les reperes necessaires pour evaluer le serieux, les limites et les responsabilites de TVF.",
    problem: "Un projet national doit etre clair sur ses decisions, ses preuves, ses limites et ses conditions de publication.",
    data: "Repere interne : TVF distingue les documents officiels, les modeles preparatoires et les elements a valider.",
    solution: "La gouvernance organise les roles, les criteres de selection, la transparence, l'ethique et la tracabilite.",
    method: "Toute decision sensible doit etre documentee : conflit d'interets, convention, budget, assurance, communication.",
    partners: "Adherents, dirigeants, collectivites, partenaires, contributeurs, financeurs, benevoles et administration.",
    impact: "Permettre a des acteurs publics et prives de cooperer dans un cadre lisible et defendable.",
    cta: ["Voir les documents", "documents-officiels.html"],
  },
  strategy: {
    label: "Strategie nationale",
    intro: "Cette page situe le sujet dans une trajectoire de deploiement progressif, documente et duplicable.",
    problem: "Les besoins sont nationaux, mais les solutions doivent etre construites territoire par territoire.",
    data: "Repere public : les politiques de revitalisation, sobriete fonciere et transition ecologique exigent des preuves locales.",
    solution: "TVF assemble une methode duplicable : diagnostic, acteurs, convention, ressources, financement et impact.",
    method: "Le deploiement part de Saint-Etienne, puis s'elargit uniquement avec des relais, donnees et capacites confirmees.",
    partners: "Collectivites, Etat, entreprises, associations, proprietaires, financeurs, benevoles et habitants.",
    impact: "Construire une plateforme utile, lisible et mesurable pour plusieurs territoires sans annoncer de resultats fictifs.",
    cta: ["Lire la methode", "notre-methode.html"],
  },
  default: {
    label: "Lecture operationnelle",
    intro: "Cette page donne un point d'entree pratique vers la methode, les documents et les parcours TVF.",
    problem: "Les acteurs ont besoin d'une information claire pour savoir quoi proposer, comment agir et quelles limites respecter.",
    data: "Repere : les donnees et resultats TVF doivent etre dates, sources et verifiables avant publication.",
    solution: "TVF oriente la demande vers le bon parcours, les bons documents et les bonnes responsabilites.",
    method: "Chaque suite doit etre qualifiee : besoin, interlocuteur, territoire, pieces, convention et calendrier.",
    partners: "Habitants, proprietaires, collectivites, entreprises, associations, financeurs et benevoles.",
    impact: "Faire gagner du temps, eviter les malentendus et transformer une intention en action realiste.",
    cta: ["Contacter TVF", "contact.html"],
  },
};

function storyBlock(file, html) {
  const profile = profiles[classify(file)] || profiles.default;
  const title = pageTitle(html, file);
  const [ctaLabel, ctaHref] = profile.cta;
  return `
      <section class="institutional-storyline" data-final-ux-story="true" aria-labelledby="story-${file.replace(/[^a-z0-9]/gi, "-")}">
        <div class="storyline-head">
          <span class="dossier-kicker">${typography(profile.label)}</span>
          <h2 id="story-${file.replace(/[^a-z0-9]/gi, "-")}">Du constat &agrave; l'action : ${title}</h2>
          <p>${typography(profile.intro)}</p>
        </div>
        <div class="storyline-grid">
          <article><span>01</span><h3>Probl&egrave;me</h3><p>${typography(profile.problem)}</p></article>
          <article><span>02</span><h3>Donn&eacute;e utile</h3><p>${typography(profile.data)}</p></article>
          <article><span>03</span><h3>Solution TVF</h3><p>${typography(profile.solution)}</p></article>
          <article><span>04</span><h3>M&eacute;thode</h3><p>${typography(profile.method)}</p></article>
          <article><span>05</span><h3>Acteurs</h3><p>${typography(profile.partners)}</p></article>
          <article><span>06</span><h3>Impact vis&eacute;</h3><p>${typography(profile.impact)}</p></article>
        </div>
        <div class="storyline-action">
          <a class="button primary" href="${ctaHref}">${typography(ctaLabel)}</a>
          <a class="button secondary" href="sources-donnees.html">Voir les sources nationales</a>
        </div>
      </section>
`;
}

function faqBlock(file) {
  const type = classify(file);
  const profile = profiles[type] || profiles.default;
  const [ctaLabel, ctaHref] = profile.cta;
  return `
      <section class="tvf-page-faq final-ux-faq" data-final-ux-faq="true" aria-labelledby="faq-${file.replace(/[^a-z0-9]/gi, "-")}">
        <div class="tvf-page-faq-header">
          <span class="dossier-kicker">FAQ</span>
          <h2 id="faq-${file.replace(/[^a-z0-9]/gi, "-")}">Questions utiles avant d'agir</h2>
          <p>Des r&eacute;ponses courtes pour comprendre le cadre, les limites et la prochaine action possible.</p>
        </div>
        <div class="tvf-page-faq-list">
          <details><summary>Que faut-il v&eacute;rifier avant toute action ?</summary><p>Le propri&eacute;taire, le droit d'usage, l'&eacute;tat du lieu ou de la ressource, les risques, l'assurance, les autorisations, le budget, le calendrier et les responsabilit&eacute;s.</p></details>
          <details><summary>TVF annonce-t-elle des r&eacute;sultats avant validation ?</summary><p>Non. Les partenaires, projets, montants, mat&eacute;riaux affect&eacute;s et impacts ne doivent &ecirc;tre publi&eacute;s qu'apr&egrave;s v&eacute;rification, accord et tra&ccedil;abilit&eacute;.</p></details>
          <details><summary>Quelle est la prochaine &eacute;tape ?</summary><p>La prochaine &eacute;tape consiste &agrave; documenter la situation, transmettre les informations utiles et choisir le bon parcours : <a href="${ctaHref}">${typography(ctaLabel)}</a>.</p></details>
        </div>
        <a class="button secondary" href="faq.html">Voir la FAQ generale</a>
      </section>
`;
}

function removeMarked(html) {
  return html
    .replace(/\s*<section class="institutional-storyline" data-final-ux-story="true"[\s\S]*?<\/section>/g, "")
    .replace(/\s*<section class="tvf-page-faq final-ux-faq" data-final-ux-faq="true"[\s\S]*?<\/section>/g, "");
}

function insertBefore(html, needle, block) {
  const index = html.indexOf(needle);
  if (index === -1) return html;
  return `${html.slice(0, index)}${block}${html.slice(index)}`;
}

let changed = 0;
const touched = [];

for (const file of publicPages) {
  let html = read(file);
  const before = html;
  html = removeMarked(html);

  const storyNeedle = html.includes('<section class="tvf-page-faq"')
    ? '<section class="tvf-page-faq"'
    : "</main>";

  if (!skipStory.has(file)) {
    html = insertBefore(html, storyNeedle, storyBlock(file, html));
  }

  const hasFaq = html.includes('class="tvf-page-faq"') || html.includes('class="actions-faq"') || html.includes('class="materials-faq"');
  if (!skipFaq.has(file) && !hasFaq) {
    html = insertBefore(html, "</main>", faqBlock(file));
  }

  html = html.replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n");
  if (html !== before) {
    write(file, html);
    changed += 1;
    touched.push(file);
  }
}

console.log(JSON.stringify({ changed, touched }, null, 2));
