const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const architecturePath = path.join(root, "PUBLIC_ARCHITECTURE.md");
const architecture = fs.existsSync(architecturePath) ? fs.readFileSync(architecturePath, "utf8") : "";
const publicPages = new Set([...architecture.matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]));
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

const genericFaqIntro =
  /<p>Des r&eacute;ponses courtes pour comprendre le cadre, les limites et les prochaines &eacute;tapes avant de contacter TVF ou de proposer une action\.<\/p>/g;
const genericEngagementIntro =
  /<h2 id="engagement-journey-title">[\s\S]*?<\/h2>\s*<p>Chaque acteur peut contribuer &agrave; sa mani&egrave;re : signaler, proposer, financer, accueillir, r&eacute;employer, documenter ou porter un projet local\.<\/p>/i;
const engagementSection = /\s*<section class="engagement-journey"[\s\S]*?<\/section>/gi;
const documentarySection = /\s*<section class="doc-section compact"[^>]*data-deep-refonte="socle-documentaire"[\s\S]*?<\/section>/gi;
const auditEditorialSection = /\s*<section class="editorial-section"\s+data-audit-enrichment="true"[\s\S]*?<\/section>/gi;

const keepEngagement = new Set([
  "index.html",
  "nos-actions.html",
  "agir-avec-nous.html",
  "signalement.html",
  "proprietaires.html",
  "espace-collectivites.html",
  "espace-entreprises.html",
  "partenariats-strategiques.html",
  "faire-un-don.html",
  "contact.html"
]);

const engagementCopy = {
  "index.html": [
    "Rejoindre le mouvement",
    "Choisir le bon point d'entr&eacute;e pour contribuer &agrave; un projet territorial, selon son r&ocirc;le et ses ressources disponibles."
  ],
  "nos-actions.html": [
    "Passer de l'action au bon interlocuteur",
    "Chaque action renvoie vers un parcours clair : signalement, mat&eacute;riaux, partenariat, financement ou mobilisation locale."
  ],
  "agir-avec-nous.html": [
    "Choisir le bon parcours d'engagement",
    "La page oriente les citoyens, propri&eacute;taires, entreprises, associations et collectivit&eacute;s vers la d&eacute;marche la plus adapt&eacute;e."
  ],
  "signalement.html": [
    "Apr&egrave;s le signalement",
    "Un signalement utile doit pouvoir &ecirc;tre qualifi&eacute;, document&eacute; et orient&eacute; vers un interlocuteur ou un dispositif adapt&eacute;."
  ],
  "proprietaires.html": [
    "Pr&eacute;parer un bien &agrave; qualifier",
    "Le parcours propri&eacute;taire aide &agrave; clarifier le statut du bien, les contraintes, les usages possibles et le cadre de convention."
  ],
  "espace-collectivites.html": [
    "Impliquer une collectivit&eacute; dans un projet TVF",
    "La collectivit&eacute; peut apporter une lecture territoriale, un besoin public, une mise en relation et un cadre de coop&eacute;ration."
  ],
  "espace-entreprises.html": [
    "Transformer une contribution en action territoriale",
    "Une entreprise peut proposer des mat&eacute;riaux, des comp&eacute;tences, des locaux ou un soutien financier dans un cadre trac&eacute;."
  ],
  "partenariats-strategiques.html": [
    "Construire une coop&eacute;ration territoriale",
    "Les partenariats sont pr&eacute;par&eacute;s autour d'objectifs, de responsabilit&eacute;s, de preuves d'impact et de r&egrave;gles de communication."
  ],
  "faire-un-don.html": [
    "Soutenir avec transparence",
    "Le don doit financer des actions document&eacute;es, sans afficher de r&eacute;sultat tant qu'il n'a pas &eacute;t&eacute; mesur&eacute;."
  ],
  "contact.html": [
    "Orienter votre demande",
    "Le formulaire de contact permet de qualifier le besoin avant de proposer un rendez-vous, une visite ou une mise en relation."
  ]
};

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;\s]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageLabel(file, html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]).replace(/\s+/g, " ").trim();
  return file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function faqIntro(file, label) {
  if (/saint-etienne|territorial/i.test(file)) {
    return "<p>Des rep&egrave;res cibl&eacute;s pour comprendre le diagnostic territorial, les donn&eacute;es disponibles et les conditions d'une action locale.</p>";
  }
  if (/logement|habitat|proprietaire|bien-solidaire/i.test(file)) {
    return "<p>Des r&eacute;ponses centr&eacute;es sur les biens vacants, les propri&eacute;taires, les conventions d'usage et la remise en &eacute;tat.</p>";
  }
  if (/materia|materiaux|banque/i.test(file)) {
    return "<p>Des r&eacute;ponses sur la qualification, la tra&ccedil;abilit&eacute;, le stockage et l'affectation des mat&eacute;riaux de r&eacute;emploi.</p>";
  }
  if (/commerce/i.test(file)) {
    return "<p>Des r&eacute;ponses sur la qualification des cellules vacantes, les usages possibles et les conditions de r&eacute;activation commerciale.</p>";
  }
  if (/friche|espaces|terrain|carte/i.test(file)) {
    return "<p>Des r&eacute;ponses sur l'identification des espaces d&eacute;laiss&eacute;s, leur transformation possible et les pr&eacute;cautions &agrave; prendre.</p>";
  }
  if (/solidarite|benevole|insertion/i.test(file)) {
    return "<p>Des r&eacute;ponses sur l'engagement citoyen, les chantiers solidaires, les parcours d'insertion et les missions b&eacute;n&eacute;voles.</p>";
  }
  if (/collectivite/i.test(file)) {
    return "<p>Des r&eacute;ponses pour cadrer une coop&eacute;ration avec une commune, un EPCI ou un acteur public local.</p>";
  }
  if (/entreprise|partenariat|partenaire|mecene|invest/i.test(file)) {
    return "<p>Des r&eacute;ponses pour structurer un partenariat, un don de ressources, un m&eacute;c&eacute;nat ou une contribution territoriale.</p>";
  }
  if (/observatoire|impact|sources|donnees/i.test(file)) {
    return "<p>Des r&eacute;ponses sur les sources, les indicateurs, la mise &agrave; jour des donn&eacute;es et la distinction entre faits et projections.</p>";
  }
  if (/gouvernance|transparence|charte|statuts|documents|mentions|confidentialite/i.test(file)) {
    return "<p>Des r&eacute;ponses sur le cadre institutionnel, les documents de r&eacute;f&eacute;rence, la transparence et les responsabilit&eacute;s de l'association.</p>";
  }
  if (/contact|agir|signalement|don/i.test(file)) {
    return "<p>Des r&eacute;ponses pratiques pour orienter une demande, proposer une ressource ou choisir le bon parcours de contact.</p>";
  }
  return `<p>Des r&eacute;ponses cibl&eacute;es sur ${label || "cette page"} pour aller &agrave; l'essentiel sans r&eacute;p&eacute;ter le cadre g&eacute;n&eacute;ral du site.</p>`;
}

let changed = 0;
const touched = [];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  const label = pageLabel(file, html);

  html = html.replace(auditEditorialSection, "");
  html = html.replace(documentarySection, "");
  html = html.replace(genericFaqIntro, faqIntro(file, label));

  if (keepEngagement.has(file)) {
    const [title, copy] = engagementCopy[file] || [
      "Choisir le bon parcours",
      "Cette page oriente chaque demande vers la bonne action et les bons interlocuteurs."
    ];
    html = html.replace(
      genericEngagementIntro,
      `<h2 id="engagement-journey-title">${title}</h2>\n          <p>${copy}</p>`
    );
  } else {
    html = html.replace(engagementSection, "");
  }

  if (publicPages.has(file) && (html.match(/data-professional-enrichment=/g) || []).length === 0) {
    html = html.replace(/<main\b([^>]*)>/i, '<main$1 data-professional-enrichment="deduplicated-page">');
  }

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
    touched.push(file);
  }
}

console.log(JSON.stringify({ changed, touched }, null, 2));
