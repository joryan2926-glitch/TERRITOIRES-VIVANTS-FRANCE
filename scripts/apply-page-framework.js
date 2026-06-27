const fs = require("fs");
const path = require("path");

const root = process.cwd();
const architecturePath = path.join(root, "PUBLIC_ARCHITECTURE.md");
const publicPages = fs.existsSync(architecturePath)
  ? new Set([...fs.readFileSync(architecturePath, "utf8").matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]))
  : new Set();

const pageBriefs = {
  "qui-sommes-nous.html": ["L'association", "Collectivités, partenaires, habitants, bénévoles", "Comprendre le cadre TVF", "ce-que-fait-tvf.html"],
  "ce-que-fait-tvf.html": ["Rôle exact de TVF", "Tous les publics", "Voir la méthode", "notre-methode.html"],
  "pourquoi-tvf-existe.html": ["La valeur ajoutée de TVF", "Collectivités, financeurs, partenaires", "Comparer les approches", "ce-que-fait-tvf.html"],
  "nos-actions.html": ["Les leviers d'action", "Tous les porteurs de projets", "Choisir une action", "agir-avec-nous.html"],
  "notre-methode.html": ["La méthode TVF", "Porteurs de projets et partenaires", "Passer au parcours demande", "parcours-demande.html"],
  "nos-poles.html": ["Les 5 pôles", "Partenaires et acteurs locaux", "Explorer les pôles", "pole-habitat-vivant.html"],
  "banque-materiaux.html": ["Valorisation des ressources", "Entreprises, collectivités, particuliers", "Proposer des matériaux", "banque-materiaux.html#contribuer"],
  "bien-solidaire-usage-partage.html": ["Remise en usage encadrée", "Propriétaires, collectivités, financeurs", "Proposer un bien", "proprietaires.html"],
  "dossier-saint-etienne.html": ["Territoire pilote", "Collectivités, financeurs, acteurs locaux", "Lire les enjeux locaux", "tvf-enjeux-saint-etienne.html"],
  "tvf-enjeux-saint-etienne.html": ["Alignement territorial", "Saint-Étienne et partenaires publics", "Voir les fiches projet", "fiches-projets-territorialisees.html"],
  "fiches-projets-territorialisees.html": ["Outil de terrain", "Collectivités, propriétaires, partenaires", "Construire une fiche", "parcours-demande.html"],
  "etude-impact-saint-etienne.html": ["Impact prévisionnel", "Financeurs et décideurs publics", "Consulter les sources", "sources-etude-saint-etienne.html"],
  "carte-territoires.html": ["Lecture territoriale", "Habitants, collectivités, antennes", "Signaler un lieu", "signalement.html"],
  "impact-resultats.html": ["Indicateurs réels", "Partenaires et financeurs", "Comprendre la mesure", "mesure-impact.html"],
  "agir-avec-nous.html": ["Choisir un parcours", "Citoyens, propriétaires, entreprises, collectivités", "Contacter TVF", "contact.html"],
  "signalement.html": ["Signalement terrain", "Habitants, bénévoles, collectivités", "Remplir le formulaire", "signalement.html#formulaire"],
  "proprietaires.html": ["Parcours propriétaire", "Propriétaires de biens vacants", "Proposer un bien", "proposer-un-bien.html"],
  "espace-collectivites.html": ["Coopération publique", "Communes, EPCI, acteurs publics", "Demander un échange", "contact.html"],
  "espace-entreprises.html": ["Engagement territorial", "Entreprises, artisans, réseaux économiques", "Proposer une contribution", "contact.html"],
  "espace-benevoles.html": ["Engagement citoyen", "Bénévoles, habitants, associations", "Rejoindre une mission", "agir-avec-nous.html#benevole"],
  "financer-projets.html": ["Financement solidaire", "Mécènes, fondations, investisseurs", "Étudier un soutien", "contact.html"],
  "partenariats-strategiques.html": ["Cadre de partenariat", "Associations, bailleurs, écoles, fondations", "Construire une convention", "documents-officiels.html"],
  "ressources.html": ["Documents utiles", "Porteurs de projets et partenaires", "Consulter les documents", "documents-officiels.html"],
  "sources-donnees.html": ["Données publiques", "Lecteurs, financeurs, collectivités", "Vérifier les sources", "sources-donnees.html"],
  "gouvernance.html": ["Organisation", "Adhérents, partenaires, financeurs", "Voir la transparence", "transparence.html"],
  "transparence.html": ["Preuves et limites", "Partenaires, financeurs, citoyens", "Lire la charte", "charte-ethique.html"],
  "charte-ethique.html": ["Principes d'action", "Équipe, partenaires, bénévoles", "Voir les documents", "documents-officiels.html"],
  "documents-officiels.html": ["Modèles et cadres", "Administration, collectivités, partenaires", "Télécharger les dossiers", "documents-officiels.html"],
  "faire-un-don.html": ["Soutien financier", "Donateurs et mécènes", "Contacter TVF", "contact.html"],
  "contact.html": ["Orientation des demandes", "Tous les publics", "Envoyer une demande", "contact.html#formulaire"],
  "faq.html": ["Réponses rapides", "Tous les visiteurs", "Contacter TVF", "contact.html"],
};

const actionBriefs = [
  [/logements|habitat/i, ["Logements vacants", "Propriétaires, communes, habitants", "Voir le parcours propriétaire", "proprietaires.html"]],
  [/commerces/i, ["Commerces inoccupés", "Collectivités, commerçants, propriétaires", "Signaler un commerce", "signalement.html"]],
  [/materiaux|materia/i, ["Matériaux de réemploi", "Entreprises, particuliers, collectivités", "Proposer des matériaux", "banque-materiaux.html"]],
  [/espaces|friches|terrains/i, ["Espaces abandonnés", "Collectivités, associations, habitants", "Signaler un terrain", "signalement.html"]],
  [/solidarite|insertion|benevole/i, ["Insertion et engagement", "Bénévoles, associations, publics accompagnés", "Rejoindre TVF", "espace-benevoles.html"]],
  [/antenne/i, ["Antenne locale", "Habitants, référents, collectivités", "Préparer une antenne", "antennes-locales.html"]],
  [/commerce-vivant/i, ["Commerce Vivant", "Collectivités, propriétaires, entrepreneurs", "Lire le pôle", "pole-commerce-vivant.html"]],
  [/friches-terrains/i, ["Friches & terrains", "Collectivités, associations, habitants", "Lire le pôle", "pole-friches-terrains-vivants.html"]],
  [/habitat-vivant/i, ["Habitat Vivant", "Propriétaires, collectivités, habitants", "Lire le pôle", "pole-habitat-vivant.html"]],
  [/solidarite-insertion/i, ["Solidarité & insertion", "Bénévoles, associations, structures d'insertion", "Lire le pôle", "pole-solidarite-insertion.html"]],
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getH1(html, file) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function briefFor(file, html) {
  if (pageBriefs[file]) return pageBriefs[file];
  for (const [pattern, brief] of actionBriefs) {
    if (pattern.test(file)) return brief;
  }
  const title = getH1(html, file);
  if (/mentions|confidentialite|statuts/i.test(file)) {
    return ["Cadre officiel", "Lecteurs, partenaires, administration", "Contacter TVF", "contact.html"];
  }
  return [title, "Porteurs de projets et partenaires", "Contacter TVF", "contact.html"];
}

function pageBriefHtml(file, html) {
  const [subject, audience, action, href] = briefFor(file, html).map(escapeHtml);
  return `
      <section class="page-brief" aria-label="Lecture rapide de la page">
        <article><span>Sujet</span><strong>${subject}</strong></article>
        <article><span>Pour qui</span><strong>${audience}</strong></article>
        <article><span>Action directe</span><a href="${href}">${action}</a></article>
      </section>
`;
}

function findSectionEnd(html, startIndex) {
  const sectionOpen = /<section\b/gi;
  const sectionClose = /<\/section>/gi;
  sectionOpen.lastIndex = startIndex + 1;
  sectionClose.lastIndex = startIndex + 1;
  let depth = 1;
  while (depth > 0) {
    const nextOpen = sectionOpen.exec(html);
    const nextClose = sectionClose.exec(html);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      sectionClose.lastIndex = sectionOpen.lastIndex;
    } else {
      depth -= 1;
      if (depth === 0) return sectionClose.lastIndex;
      sectionOpen.lastIndex = sectionClose.lastIndex;
    }
  }
  return -1;
}

function removeFollowingCaseStudy(html) {
  let marker = html.search(/<h2 class="section-heading">Cas d['’]usage[\s\S]*?<\/h2>/i);
  while (marker !== -1) {
    const sectionStart = html.indexOf("<section", marker);
    const sectionEnd = sectionStart === -1 ? -1 : findSectionEnd(html, sectionStart);
    if (sectionStart === -1 || sectionEnd === -1) break;
    html = html.slice(0, marker) + html.slice(sectionEnd);
    marker = html.search(/<h2 class="section-heading">Cas d['’]usage[\s\S]*?<\/h2>/i);
  }
  return html;
}

function removeSectionsContaining(html, className, textPattern) {
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf(`<section class="${className}`, cursor);
    if (start === -1) break;
    const end = findSectionEnd(html, start);
    if (end === -1) break;
    const block = html.slice(start, end);
    if (textPattern.test(block)) {
      html = html.slice(0, start) + html.slice(end);
      cursor = start;
    } else {
      cursor = end;
    }
  }
  return html;
}

function removeSectionsByMarker(html, markerPattern) {
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf("<section", cursor);
    if (start === -1) break;
    const end = findSectionEnd(html, start);
    if (end === -1) break;
    const block = html.slice(start, end);
    if (markerPattern.test(block)) {
      html = html.slice(0, start) + html.slice(end);
      cursor = start;
    } else {
      cursor = end;
    }
  }
  return html;
}

function removeAllSectionsByClassExcept(html, className, keep) {
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf(`<section class="${className}`, cursor);
    if (start === -1) break;
    const end = findSectionEnd(html, start);
    if (end === -1) break;
    if (!keep) {
      html = html.slice(0, start) + html.slice(end);
      cursor = start;
    } else {
      cursor = end;
    }
  }
  return html;
}

function addBodyClass(html) {
  return html.replace(/<body(?![^>]*class=)([^>]*)>/i, '<body class="site-streamlined"$1>')
    .replace(/<body([^>]*class=")([^"]*)"/i, (match, prefix, classes) => {
      if (classes.split(/\s+/).includes("site-streamlined")) return match;
      return `<body${prefix}${classes} site-streamlined"`;
    });
}

function normalizeSpacing(html) {
  return html.replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n");
}

let changed = 0;
const touched = [];

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const fullPath = path.join(root, file);
  let html = fs.readFileSync(fullPath, "utf8");
  const before = html;
  const isPublic = publicPages.has(file);

  html = addBodyClass(html);
  html = removeFollowingCaseStudy(html);
  html = removeSectionsContaining(html, "cta-band", />Continuer<\/a>/i);
  html = removeSectionsContaining(html, "tvf-page-faq", /Quel est l['’]objectif de cette page|apporte une lecture op&eacute;rationnelle du sujet|propres &agrave; cette page/i);
  html = removeSectionsByMarker(html, /data-priority-upgrade=/i);
  html = removeAllSectionsByClassExcept(html, "page-wrap audit-quick-read", false);
  html = removeAllSectionsByClassExcept(html, "dossier-section association-object-block", file === "qui-sommes-nous.html");
  html = removeSectionsContaining(html, "dossier-section association-object-block", /Cadre de confiance/i);

  if (isPublic && file !== "index.html" && !html.includes('class="page-brief"')) {
    const heroStart = html.search(/<section class="page-hero/);
    const mainStart = html.search(/<main\b/i);
    const fallbackHeroStart = mainStart === -1 ? -1 : html.indexOf("<section", mainStart);
    const insertionStart = heroStart !== -1 ? heroStart : fallbackHeroStart;
    if (insertionStart !== -1) {
      const insertionEnd = findSectionEnd(html, insertionStart);
      if (insertionEnd !== -1) html = html.slice(0, insertionEnd) + pageBriefHtml(file, html) + html.slice(insertionEnd);
    }
  }

  html = normalizeSpacing(html);

  if (html !== before) {
    fs.writeFileSync(fullPath, html, "utf8");
    changed += 1;
    touched.push(file);
  }
}

console.log(JSON.stringify({ changed, touched }, null, 2));
