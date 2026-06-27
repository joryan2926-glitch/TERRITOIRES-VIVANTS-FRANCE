const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const architecture = fs.readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8");
const publicPages = [...architecture.matchAll(/^- ([^\r\n]+\.html)$/gm)]
  .map((match) => match[1])
  .filter((file) => fs.existsSync(path.join(root, file)));

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "e")
    .replace(/&Eacute;/g, "E")
    .replace(/&egrave;/g, "e")
    .replace(/&agrave;/g, "a")
    .replace(/&ocirc;/g, "o")
    .replace(/&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageLabel(file, html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return h1 ? stripHtml(h1[1]) : file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function item(question, answer) {
  return `<details><summary>${question}</summary><p>${answer}</p></details>`;
}

function faqItems(file, label) {
  const safe = escapeHtml(label);

  if (/saint-etienne|territorial/i.test(file)) {
    return [
      item("Comment lire les donn&eacute;es territoriales ?", `${safe} distingue les sources publiques, les analyses de TVF et les projections qui devront &ecirc;tre confirm&eacute;es sur le terrain.`),
      item("Pourquoi ce territoire pilote est-il utile ?", `Dans ${safe}, Saint-&Eacute;tienne sert de terrain d'&eacute;tude pour relier habitat ancien, centralit&eacute;, vacance, &eacute;conomie circulaire et mobilisation locale.`),
      item("Que faut-il v&eacute;rifier avant une fiche projet ?", `Pour ${safe}, la fiche doit pr&eacute;ciser adresse, propri&eacute;t&eacute;, programme public compatible, budget, acteurs mobilisables, convention, risques techniques et indicateurs.`)
    ];
  }

  if (/logement|habitat|proprietaire|bien-solidaire/i.test(file)) {
    return [
      item("Un bien vacant peut-il &ecirc;tre &eacute;tudi&eacute; sans engagement imm&eacute;diat ?", `Oui. ${safe} sert d'abord &agrave; qualifier le statut du bien, l'&eacute;tat apparent, les contraintes et les usages possibles avant toute convention.`),
      item("Le propri&eacute;taire conserve-t-il son bien ?", `Dans ${safe}, le cadre recherch&eacute; repose sur une coop&eacute;ration &eacute;crite : propri&eacute;t&eacute; conserv&eacute;e, travaux ou usage encadr&eacute;s, dur&eacute;e pr&eacute;cis&eacute;e et responsabilit&eacute;s formalis&eacute;es.`),
      item("Quelles preuves sont n&eacute;cessaires ?", `Pour ${safe}, un diagnostic, des photos autoris&eacute;es, les contraintes juridiques, les besoins locaux, les co&ucirc;ts estimatifs et les accords de publication doivent &ecirc;tre rassembl&eacute;s.`)
    ];
  }

  if (/materia|materiaux|banque/i.test(file)) {
    return [
      item("Les mat&eacute;riaux sont-ils distribu&eacute;s librement ?", `Non. Dans ${safe}, les ressources sont qualifi&eacute;es, trac&eacute;es puis affect&eacute;es &agrave; des projets valid&eacute;s selon leur &eacute;tat, leur utilit&eacute; et les contraintes logistiques.`),
      item("Qui peut proposer une ressource ?", `Pour ${safe}, collectivit&eacute;s, entreprises, associations et particuliers peuvent proposer des mat&eacute;riaux, du mobilier, des &eacute;quipements ou des surplus r&eacute;utilisables.`),
      item("Que regarde TVF avant acceptation ?", `Pour ${safe}, les points cl&eacute;s sont l'origine, la quantit&eacute;, l'&eacute;tat, le retrait, le stockage, l'assurance, la destination possible et la tra&ccedil;abilit&eacute;.`)
    ];
  }

  if (/commerce/i.test(file)) {
    return [
      item("Un commerce ferm&eacute; peut-il changer d'usage ?", `Oui. ${safe} &eacute;tudie cette possibilit&eacute; si le local, le bail, la copropri&eacute;t&eacute;, la r&egrave;glementation et le besoin local le permettent.`),
      item("Qui doit &ecirc;tre associ&eacute; ?", `Pour ${safe}, propri&eacute;taire, commune, EPCI, chambres consulaires, artisans, commer&ccedil;ants, associations de centre-ville et porteurs d'activit&eacute; peuvent &ecirc;tre mobilis&eacute;s.`),
      item("Quel est le premier crit&egrave;re de r&eacute;ussite ?", `Pour ${safe}, la priorit&eacute; est de relier un local disponible &agrave; un besoin r&eacute;el, un porteur fiable et un mod&egrave;le &eacute;conomique soutenable.`)
    ];
  }

  if (/friche|espaces|terrain|carte/i.test(file)) {
    return [
      item("Une friche peut-elle &ecirc;tre transform&eacute;e rapidement ?", `Dans ${safe}, une transformation n'est envisageable qu'apr&egrave;s clarification des risques, de la propri&eacute;t&eacute;, de la pollution potentielle, de l'acc&egrave;s et de l'assurance.`),
      item("Quels usages sont envisageables ?", `Pour ${safe}, jardins partag&eacute;s, espaces nourriciers, lieux associatifs, ateliers, usages culturels ou am&eacute;nagements provisoires peuvent &ecirc;tre &eacute;tudi&eacute;s selon le site.`),
      item("Pourquoi cartographier avant d'agir ?", `${safe} doit relier chaque lieu &agrave; son contexte urbain, &eacute;cologique, social et foncier pour &eacute;viter les actions isol&eacute;es.`)
    ];
  }

  if (/solidarite|benevole|insertion/i.test(file)) {
    return [
      item("Un chantier participatif est-il ouvert &agrave; tous ?", `Pour ${safe}, les missions doivent &ecirc;tre adapt&eacute;es aux comp&eacute;tences, encadr&eacute;es et s&eacute;curis&eacute;es ; les gestes techniques restent confi&eacute;s &agrave; des professionnels qualifi&eacute;s.`),
      item("Comment l'insertion est-elle envisag&eacute;e ?", `Dans ${safe}, l'insertion passe par des parcours progressifs : d&eacute;couverte des m&eacute;tiers, ateliers pratiques, logistique, m&eacute;diation, animation locale et orientation.`),
      item("Que peut apporter un b&eacute;n&eacute;vole ?", `Sur ${safe}, un b&eacute;n&eacute;vole peut aider au rep&eacute;rage, &agrave; la documentation, &agrave; l'animation, &agrave; la logistique ou &agrave; la mobilisation locale.`)
    ];
  }

  if (/collectivite/i.test(file)) {
    return [
      item("Pourquoi une collectivit&eacute; rejoindrait-elle TVF ?", `Avec ${safe}, la collectivit&eacute; peut relier observation, propri&eacute;taires, ressources, usages, financements et indicateurs de suivi dans un m&ecirc;me cadre.`),
      item("La convention est-elle obligatoire ?", `Pour ${safe}, une convention devient n&eacute;cessaire d&egrave;s qu'une ressource publique, un local, une donn&eacute;e, une action de terrain ou une communication commune est engag&eacute;e.`),
      item("Comment &eacute;viter les doublons avec les dispositifs existants ?", `${safe} doit s'articuler avec les programmes d&eacute;j&agrave; ouverts : habitat, commerce, climat, friches, insertion, ESS ou politique de la ville.`)
    ];
  }

  if (/entreprise|partenariat|partenaire|mecene|invest|don/i.test(file)) {
    return [
      item("Quelle contribution une entreprise peut-elle proposer ?", `Dans ${safe}, mat&eacute;riaux, mobilier, comp&eacute;tences, locaux, logistique, financement, m&eacute;c&eacute;nat ou appui technique peuvent &ecirc;tre &eacute;tudi&eacute;s.`),
      item("Comment la visibilit&eacute; est-elle encadr&eacute;e ?", `Pour ${safe}, aucun logo ni statut de partenaire n'est publi&eacute; sans accord explicite, cadre de coop&eacute;ration, p&eacute;rim&egrave;tre clair et validation de la communication.`),
      item("Quel int&eacute;r&ecirc;t RSE ?", `${safe} permet de documenter une contribution utile : r&eacute;duction du gaspillage, ancrage territorial, &eacute;conomie circulaire et impact social mesurable.`)
    ];
  }

  if (/observatoire|impact|sources|donnees/i.test(file)) {
    return [
      item("Les chiffres TVF sont-ils d&eacute;j&agrave; des r&eacute;sultats ?", `Non. Dans ${safe}, les r&eacute;sultats propres &agrave; l'association ne doivent appara&icirc;tre qu'apr&egrave;s action r&eacute;elle, validation et tra&ccedil;abilit&eacute;.`),
      item("Quelles sources sont privil&eacute;gi&eacute;es ?", `Pour ${safe}, les sources prioritaires sont INSEE, SDES, ADEME, ANCT, Cerema, minist&egrave;res, data.gouv.fr et donn&eacute;es locales publi&eacute;es.`),
      item("Comment les indicateurs seront-ils mis &agrave; jour ?", `${safe} pr&eacute;voit une mise &agrave; jour progressive via les formulaires, les validations territoriales et les futures connexions de donn&eacute;es.`)
    ];
  }

  if (/gouvernance|transparence|charte|statuts|documents|mentions|confidentialite|ce-que-tvf-ne-fait-pas|pourquoi-tvf|ce-que-fait-tvf|methode|vision/i.test(file)) {
    return [
      item("Pourquoi cette page est-elle structurante ?", `${safe} fixe une partie du cadre institutionnel : responsabilit&eacute;s, limites, m&eacute;thode, transparence ou conditions d'action.`),
      item("Ces informations peuvent-elles &eacute;voluer ?", `Oui. ${safe} doit rester modifiable apr&egrave;s les formalit&eacute;s officielles, les assembl&eacute;es, les conventions et les premi&egrave;res actions document&eacute;es.`),
      item("Comment TVF &eacute;vite-t-elle les promesses excessives ?", `${safe} s&eacute;pare clairement les ambitions, les dispositifs en pr&eacute;paration, les donn&eacute;es publiques, les estimations et les r&eacute;sultats v&eacute;rifi&eacute;s.`)
    ];
  }

  if (/contact|agir|signalement/i.test(file)) {
    return [
      item("Quel formulaire choisir ?", `${safe} oriente la demande selon sa nature : lieu vacant, mat&eacute;riaux, partenariat, b&eacute;n&eacute;volat, don ou projet territorial.`),
      item("Que faut-il pr&eacute;parer avant d'&eacute;crire ?", `Pour ${safe}, adresse, commune, description, photos autoris&eacute;es, contact, statut connu et urgence &eacute;ventuelle permettent de qualifier plus vite la demande.`),
      item("Une r&eacute;ponse vaut-elle validation du projet ?", `Non. Dans ${safe}, toute action doit encore &ecirc;tre v&eacute;rifi&eacute;e, document&eacute;e et, si besoin, encadr&eacute;e par une convention.`)
    ];
  }

  return [
    item("Quel est l'objectif de cette page ?", `${safe} apporte une lecture op&eacute;rationnelle du sujet et renvoie vers les d&eacute;marches adapt&eacute;es.`),
    item("Quelles informations sont attendues ?", `Pour ${safe}, les informations utiles sont celles qui permettent de qualifier le besoin, le territoire, les acteurs concern&eacute;s et les contraintes.`),
    item("Quand passer &agrave; l'action ?", `Dans ${safe}, le passage &agrave; l'action suppose un cadre juridique, technique, financier et partenarial assez clair pour coop&eacute;rer.`)
  ];
}

function faqIntro(file, label) {
  const safe = escapeHtml(label);
  if (/saint-etienne|territorial/i.test(file)) return `<p>${safe} r&eacute;pond aux questions de diagnostic, de sources publiques et de passage du pilote local &agrave; l'action.</p>`;
  if (/logement|habitat|proprietaire|bien-solidaire/i.test(file)) return `<p>${safe} traite les questions li&eacute;es aux biens vacants, aux propri&eacute;taires, aux conventions et &agrave; la remise en &eacute;tat.</p>`;
  if (/materia|materiaux|banque/i.test(file)) return `<p>${safe} pr&eacute;cise les conditions de qualification, de tra&ccedil;abilit&eacute; et d'affectation des ressources r&eacute;employables.</p>`;
  if (/commerce/i.test(file)) return `<p>${safe} clarifie les conditions de r&eacute;activation des locaux commerciaux et les acteurs &agrave; associer.</p>`;
  if (/friche|espaces|terrain|carte/i.test(file)) return `<p>${safe} pr&eacute;cise les pr&eacute;cautions n&eacute;cessaires avant de transformer un espace d&eacute;laiss&eacute;.</p>`;
  if (/solidarite|benevole|insertion/i.test(file)) return `<p>${safe} explique comment encadrer l'engagement citoyen, les chantiers solidaires et les parcours d'insertion.</p>`;
  if (/collectivite/i.test(file)) return `<p>${safe} synth&eacute;tise les conditions d'une coop&eacute;ration claire avec les acteurs publics locaux.</p>`;
  if (/entreprise|partenariat|partenaire|mecene|invest|don/i.test(file)) return `<p>${safe} pr&eacute;cise les modalit&eacute;s de contribution, de visibilit&eacute; et de suivi d'impact.</p>`;
  if (/observatoire|impact|sources|donnees/i.test(file)) return `<p>${safe} distingue sources, indicateurs, projections et donn&eacute;es &agrave; valider.</p>`;
  if (/gouvernance|transparence|charte|statuts|documents|mentions|confidentialite|ce-que-tvf-ne-fait-pas|pourquoi-tvf|ce-que-fait-tvf|methode|vision/i.test(file)) return `<p>${safe} pr&eacute;cise le cadre institutionnel, les limites et les garanties de transparence.</p>`;
  if (/contact|agir|signalement/i.test(file)) return `<p>${safe} aide &agrave; choisir le bon parcours avant de transmettre une demande ou une ressource.</p>`;
  return `<p>${safe} rassemble les r&eacute;ponses pratiques propres &agrave; cette page, sans r&eacute;p&eacute;ter le cadre g&eacute;n&eacute;ral du site.</p>`;
}

const actionCopy = {
  "action-logements-vacants.html": {
    cause: "Un logement vacant doit &ecirc;tre compris &agrave; partir de son statut, de son &eacute;tat, de son propri&eacute;taire, des travaux n&eacute;cessaires et du besoin local en habitat.",
    solution: "TVF propose un parcours habitat : rep&eacute;rage, contact propri&eacute;taire, diagnostic, sc&eacute;nario d'usage, recherche de ressources et convention.",
    status: "un logement n'est pr&eacute;sent&eacute; comme mobilisable qu'apr&egrave;s v&eacute;rification du statut, accord du propri&eacute;taire et qualification des travaux."
  },
  "action-commerces-inoccupes.html": {
    cause: "Un commerce ferm&eacute; doit &ecirc;tre analys&eacute; avec son bail, son emplacement, son loyer, son &eacute;tat, le flux pi&eacute;ton et les besoins du centre-ville.",
    solution: "TVF structure la r&eacute;activation : rep&eacute;rage du local, lecture commerciale, recherche de porteurs, usages temporaires et coop&eacute;ration avec les acteurs locaux.",
    status: "un local commercial ne devient public qu'apr&egrave;s accord de diffusion, qualification du propri&eacute;taire et lecture du potentiel d'usage."
  },
  "action-materiaux-reemploi.html": {
    cause: "Un lot de mat&eacute;riaux doit &ecirc;tre &eacute;valu&eacute; par origine, quantit&eacute;, &eacute;tat, dimensions, retrait, stockage, conformit&eacute; et destination possible.",
    solution: "TVF organise une cha&icirc;ne de r&eacute;emploi : proposition, tri, tra&ccedil;abilit&eacute;, stockage provisoire, affectation &agrave; un projet valid&eacute; et suivi.",
    status: "une ressource n'est publi&eacute;e qu'apr&egrave;s v&eacute;rification de son &eacute;tat, de son origine, de sa disponibilit&eacute; et des conditions de retrait."
  },
  "action-espaces-abandonnes.html": {
    cause: "Un terrain d&eacute;laiss&eacute; doit &ecirc;tre lu avec son foncier, son acc&egrave;s, son usage possible, ses risques, sa biodiversit&eacute; et son lien avec les habitants.",
    solution: "TVF pr&eacute;pare la transformation : cartographie, diagnostic, usages temporaires, acteurs de proximit&eacute;, convention et suivi des b&eacute;n&eacute;fices locaux.",
    status: "un espace abandonn&eacute; n'est valoris&eacute; qu'apr&egrave;s accord de publication, lecture des risques et clarification du cadre d'intervention."
  },
  "action-solidarite-insertion.html": {
    cause: "Un parcours solidaire doit partir des comp&eacute;tences, de la s&eacute;curit&eacute;, de l'encadrement, des besoins du chantier et des acteurs sociaux mobilisables.",
    solution: "TVF relie engagement citoyen et action utile : missions adapt&eacute;es, ateliers pratiques, chantiers encadr&eacute;s, orientation et suivi des participants.",
    status: "une mission participative n'est ouverte qu'apr&egrave;s cadrage des risques, des assurances, des encadrants et des t&acirc;ches confi&eacute;es."
  }
};

let changed = 0;

for (const file of publicPages) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  const label = pageLabel(file, html);

  html = html.replace(
    /(<div class="tvf-page-faq-header">[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>\s*)<p>[\s\S]*?<\/p>/i,
    `$1${faqIntro(file, label)}`
  );

  html = html.replace(
    /<div class="tvf-page-faq-list">[\s\S]*?<\/div>\s*<a class="button secondary" href="faq\.html">/i,
    `<div class="tvf-page-faq-list">\n          ${faqItems(file, label).join("")}\n        </div>\n        <a class="button secondary" href="faq.html">`
  );

  if (actionCopy[file]) {
    const copy = actionCopy[file];
    html = html
      .replace(
        /Chaque situation doit &ecirc;tre lue avec ses causes propres : droit, co&ucirc;t, &eacute;tat technique, besoin local, portage, financement et capacit&eacute; d'exploitation\./g,
        copy.cause
      )
      .replace(
        /TVF apporte un cadre : signalement, qualification, orientation, coop&eacute;ration, convention, suivi et publication prudente des r&eacute;sultats\./g,
        copy.solution
      )
      .replace(
        /les informations op&eacute;rationnelles deviennent publiques apr&egrave;s v&eacute;rification, accord de publication et rattachement &agrave; un territoire clairement identifi&eacute;\./g,
        copy.status
      );
  }

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
