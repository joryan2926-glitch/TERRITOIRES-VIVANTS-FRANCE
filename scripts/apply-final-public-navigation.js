const fs = require("fs");
const path = require("path");

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();

const publicPages = [
  "index.html",
  "qui-sommes-nous.html",
  "pourquoi-tvf-existe.html",
  "ce-que-fait-tvf.html",
  "notre-methode.html",
  "nos-actions.html",
  "action-logements-vacants.html",
  "action-commerces-inoccupes.html",
  "action-materiaux-reemploi.html",
  "action-espaces-abandonnes.html",
  "action-solidarite-insertion.html",
  "nos-poles.html",
  "pole-habitat-vivant.html",
  "pole-materiautheque-solidaire.html",
  "pole-commerce-vivant.html",
  "pole-friches-terrains-vivants.html",
  "pole-solidarite-insertion.html",
  "proprietaires.html",
  "espace-collectivites.html",
  "espace-entreprises.html",
  "espace-benevoles.html",
  "partenariats-strategiques.html",
  "financer-projets.html",
  "agir-avec-nous.html",
  "signalement.html",
  "banque-materiaux.html",
  "bien-solidaire-usage-partage.html",
  "antennes-locales.html",
  "faire-un-don.html",
  "observatoire-national.html",
  "carte-territoires.html",
  "dossier-saint-etienne.html",
  "tvf-enjeux-saint-etienne.html",
  "fiches-projets-territorialisees.html",
  "etude-impact-saint-etienne.html",
  "sources-etude-saint-etienne.html",
  "impact-resultats.html",
  "gouvernance.html",
  "transparence.html",
  "charte-ethique.html",
  "documents-officiels.html",
  "ressources.html",
  "faq.html",
  "kit-media.html",
  "contact.html",
  "mentions-legales.html",
  "politique-confidentialite.html",
];

const publicSet = new Set(publicPages);

const pageMeta = {
  "index.html": ["Accueil", "Accueil"],
  "qui-sommes-nous.html": ["Association", "Qui sommes-nous ?"],
  "pourquoi-tvf-existe.html": ["Association", "Pourquoi TVF existe"],
  "ce-que-fait-tvf.html": ["Association", "Ce que fait TVF"],
  "notre-methode.html": ["Association", "Notre m&eacute;thode"],
  "gouvernance.html": ["Association", "Gouvernance"],
  "transparence.html": ["Association", "Transparence"],
  "charte-ethique.html": ["Association", "Charte &eacute;thique"],
  "documents-officiels.html": ["Association", "Documents et conventions"],
  "nos-actions.html": ["Actions", "Vue d'ensemble"],
  "action-logements-vacants.html": ["Actions", "Logements vacants"],
  "action-commerces-inoccupes.html": ["Actions", "Commerces inoccup&eacute;s"],
  "action-materiaux-reemploi.html": ["Actions", "Mat&eacute;riaux de r&eacute;emploi"],
  "action-espaces-abandonnes.html": ["Actions", "Espaces abandonn&eacute;s"],
  "action-solidarite-insertion.html": ["Actions", "Solidarit&eacute; et insertion"],
  "nos-poles.html": ["P&ocirc;les", "Vue d'ensemble"],
  "pole-habitat-vivant.html": ["P&ocirc;les", "Habitat Vivant"],
  "pole-materiautheque-solidaire.html": ["P&ocirc;les", "Mat&eacute;riauth&egrave;que Solidaire"],
  "pole-commerce-vivant.html": ["P&ocirc;les", "Commerce Vivant"],
  "pole-friches-terrains-vivants.html": ["P&ocirc;les", "Friches et Terrains Vivants"],
  "pole-solidarite-insertion.html": ["P&ocirc;les", "Solidarit&eacute; et Insertion"],
  "proprietaires.html": ["Par public", "Propri&eacute;taires"],
  "espace-collectivites.html": ["Par public", "Collectivit&eacute;s"],
  "espace-entreprises.html": ["Par public", "Entreprises"],
  "espace-benevoles.html": ["Par public", "Citoyens et b&eacute;n&eacute;voles"],
  "partenariats-strategiques.html": ["Par public", "Partenaires"],
  "financer-projets.html": ["Par public", "M&eacute;c&egrave;nes et financeurs"],
  "agir-avec-nous.html": ["Agir", "Agir avec nous"],
  "signalement.html": ["Agir", "Signaler un lieu"],
  "banque-materiaux.html": ["Agir", "Proposer une ressource"],
  "bien-solidaire-usage-partage.html": ["Agir", "Proposer un bien"],
  "antennes-locales.html": ["Agir", "Antennes locales"],
  "faire-un-don.html": ["Agir", "Faire un don"],
  "observatoire-national.html": ["Territoires", "Observatoire national"],
  "carte-territoires.html": ["Territoires", "Carte des territoires"],
  "dossier-saint-etienne.html": ["Territoires", "Dossier Saint-&Eacute;tienne"],
  "tvf-enjeux-saint-etienne.html": ["Territoires", "Enjeux de Saint-&Eacute;tienne"],
  "fiches-projets-territorialisees.html": ["Territoires", "Fiches projet territorialis&eacute;es"],
  "etude-impact-saint-etienne.html": ["Territoires", "&Eacute;tude d'impact Saint-&Eacute;tienne"],
  "sources-etude-saint-etienne.html": ["Territoires", "Sources Saint-&Eacute;tienne"],
  "impact-resultats.html": ["Territoires", "Impact et r&eacute;sultats"],
  "ressources.html": ["Ressources", "Centre de ressources"],
  "faq.html": ["Ressources", "FAQ"],
  "kit-media.html": ["Ressources", "Kit m&eacute;dia"],
  "contact.html": ["Contact", "Contact"],
  "mentions-legales.html": ["Informations", "Mentions l&eacute;gales"],
  "politique-confidentialite.html": ["Informations", "Politique de confidentialit&eacute;"],
};

const iconPaths = {
  institution: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  action: '<path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-7"/>',
  pole: '<path d="M4 9.5 12 5l8 4.5-8 4.5-8-4.5Z"/><path d="M4 9.5V16l8 4.5 8-4.5V9.5"/>',
  audience: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7 0"/>',
  engage: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  observe: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  resource: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h6"/>',
};

function megaLink(href, title, description, icon) {
  return `<a class="mega-link" href="${href}"><span class="mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[icon]}</svg></span><span class="mega-copy"><strong>${title}</strong><small>${description}</small></span></a>`;
}

function dropdown(label, href, heading, description, links) {
  return `<div class="nav-dropdown"><a class="nav-drop-toggle" href="${href}"><span class="nav-label">${label}</span><svg class="nav-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a><div class="nav-dropdown-menu" aria-label="Sous-menu ${label}"><div class="mega-menu-heading"><strong>${heading}</strong><span>${description}</span></div>${links.join("")}</div></div>`;
}

const mobileButton = `<button class="mobile-menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`;

let header = `<header class="site-header"><a class="brand" href="index.html" aria-label="Territoires Vivants France - Accueil"><img decoding="async" fetchpriority="high" src="assets/logo-territoires-vivants-france.png" alt="Logo Territoires Vivants France" /></a>${mobileButton}<nav id="main-navigation" class="main-nav" aria-label="Navigation principale"><a href="index.html">Accueil</a>${dropdown("Association", "qui-sommes-nous.html", "Association", "Comprendre l'identit&eacute;, les limites et les garanties publiques de TVF.", [
  megaLink("qui-sommes-nous.html", "Qui sommes-nous ?", "Mission, origine et gouvernance.", "institution"),
  megaLink("pourquoi-tvf-existe.html", "Pourquoi TVF existe", "Les enjeux qui justifient la d&eacute;marche.", "institution"),
  megaLink("ce-que-fait-tvf.html", "Ce que fait TVF", "R&ocirc;le, limites et compl&eacute;mentarit&eacute;.", "institution"),
  megaLink("notre-methode.html", "Notre m&eacute;thode", "Identifier, qualifier, mobiliser et suivre.", "institution"),
  megaLink("gouvernance.html", "Gouvernance", "Responsabilit&eacute;s et d&eacute;cisions.", "institution"),
  megaLink("transparence.html", "Transparence", "Documents, preuves et informations confirm&eacute;es.", "institution"),
])}${dropdown("Actions", "nos-actions.html", "Nos actions", "Les leviers concrets de revitalisation territoriale.", [
  megaLink("nos-actions.html", "Vue d'ensemble", "Comprendre les leviers TVF.", "action"),
  megaLink("action-logements-vacants.html", "Logements vacants", "Rep&eacute;rer et remettre en usage.", "action"),
  megaLink("action-commerces-inoccupes.html", "Commerces inoccup&eacute;s", "R&eacute;activer les locaux utiles.", "action"),
  megaLink("action-materiaux-reemploi.html", "Mat&eacute;riaux de r&eacute;emploi", "Valoriser les ressources encore utiles.", "action"),
  megaLink("action-espaces-abandonnes.html", "Espaces abandonn&eacute;s", "Qualifier friches, terrains et usages.", "action"),
  megaLink("action-solidarite-insertion.html", "Solidarit&eacute; et insertion", "Relier projets, comp&eacute;tences et engagement.", "action"),
  megaLink("financer-projets.html", "Financer les projets", "Comprendre les leviers de financement.", "action"),
])}${dropdown("P&ocirc;les", "nos-poles.html", "Nos p&ocirc;les", "Les expertises structurantes de TVF.", [
  megaLink("nos-poles.html", "Vue d'ensemble", "Voir comment les p&ocirc;les coop&egrave;rent.", "pole"),
  megaLink("pole-habitat-vivant.html", "Habitat Vivant", "Logements vacants et habitat digne.", "pole"),
  megaLink("pole-materiautheque-solidaire.html", "Mat&eacute;riauth&egrave;que Solidaire", "R&eacute;emploi et ressources territoriales.", "pole"),
  megaLink("pole-commerce-vivant.html", "Commerce Vivant", "Locaux et activit&eacute;s de proximit&eacute;.", "pole"),
  megaLink("pole-friches-terrains-vivants.html", "Friches et Terrains Vivants", "Usages sobres et biodiversit&eacute;.", "pole"),
  megaLink("pole-solidarite-insertion.html", "Solidarit&eacute; et Insertion", "Parcours et engagement citoyen.", "pole"),
])}${dropdown("Par public", "agir-avec-nous.html", "Choisir mon parcours", "Acc&eacute;der directement au parcours adapt&eacute; &agrave; votre r&ocirc;le.", [
  megaLink("espace-collectivites.html", "Collectivit&eacute;s", "Diagnostic, donn&eacute;es et projets territoriaux.", "audience"),
  megaLink("proprietaires.html", "Propri&eacute;taires", "Bien vacant, convention, travaux et usage.", "audience"),
  megaLink("espace-entreprises.html", "Entreprises", "Mat&eacute;riaux, RSE, locaux et comp&eacute;tences.", "audience"),
  megaLink("financer-projets.html", "Financeurs et m&eacute;c&egrave;nes", "Projet qualifi&eacute;, budget et reporting.", "audience"),
  megaLink("espace-benevoles.html", "Citoyens et b&eacute;n&eacute;voles", "Signaler, aider et rejoindre une mission.", "audience"),
  megaLink("partenariats-strategiques.html", "Partenaires", "Coop&eacute;ration, conventions et impact.", "audience"),
])}${dropdown("Territoires", "observatoire-national.html", "Territoires et impact", "Donn&eacute;es nationales, territoire pilote et mesure d'impact.", [
  megaLink("observatoire-national.html", "Observatoire national", "Logements, commerces, friches et ressources.", "observe"),
  megaLink("carte-territoires.html", "Carte des territoires", "Lecture cartographique et couches th&eacute;matiques.", "observe"),
  megaLink("dossier-saint-etienne.html", "Dossier Saint-&Eacute;tienne", "Premier territoire pilote document&eacute;.", "observe"),
  megaLink("tvf-enjeux-saint-etienne.html", "Enjeux de Saint-&Eacute;tienne", "Alignement avec les priorit&eacute;s publiques.", "observe"),
  megaLink("etude-impact-saint-etienne.html", "&Eacute;tude d'impact", "Donn&eacute;es, projections et indicateurs.", "observe"),
  megaLink("fiches-projets-territorialisees.html", "Fiches projet", "Transformer un besoin en dossier d'action.", "observe"),
  megaLink("impact-resultats.html", "Impact et r&eacute;sultats", "Mesurer sans inventer de r&eacute;sultats.", "observe"),
])}${dropdown("Agir", "agir-avec-nous.html", "Passer &agrave; l'action", "Signaler, proposer, soutenir ou contacter TVF.", [
  megaLink("agir-avec-nous.html", "Agir avec nous", "Trouver le bon parcours.", "engage"),
  megaLink("signalement.html", "Signaler un lieu", "Transmettre une situation &agrave; qualifier.", "engage"),
  megaLink("banque-materiaux.html", "Proposer des mat&eacute;riaux", "Contribuer &agrave; la Banque de Mat&eacute;riaux.", "engage"),
  megaLink("bien-solidaire-usage-partage.html", "Proposer un bien", "&Eacute;tudier un bien vacant ou inutilis&eacute;.", "engage"),
  megaLink("antennes-locales.html", "Antennes locales", "Pr&eacute;parer une implantation territoriale.", "engage"),
  megaLink("faire-un-don.html", "Faire un don", "Soutenir la structuration de TVF.", "engage"),
])}${dropdown("Ressources", "ressources.html", "Ressources", "Documents, questions fr&eacute;quentes et supports publics.", [
  megaLink("ressources.html", "Centre de ressources", "Guides, dossiers et supports utiles.", "resource"),
  megaLink("documents-officiels.html", "Documents officiels", "Statuts, conventions et cadres de r&eacute;f&eacute;rence.", "resource"),
  megaLink("charte-ethique.html", "Charte &eacute;thique", "Principes et garde-fous.", "resource"),
  megaLink("faq.html", "FAQ", "R&eacute;ponses par public et par sujet.", "resource"),
  megaLink("kit-media.html", "Kit m&eacute;dia", "Logo, pr&eacute;sentation et contact presse.", "resource"),
])}</nav><a class="donate-button" href="contact.html">Nous contacter <span aria-hidden="true">&rarr;</span></a></header>`;

header = header
  .replace(/<div class="nav-dropdown"><a class="nav-drop-toggle" href="nos-poles\.html">[\s\S]*?<\/div><\/div>/, "")
  .replace(
    megaLink("notre-methode.html", "Notre m&eacute;thode", "Identifier, qualifier, mobiliser et suivre.", "action"),
    `${megaLink("notre-methode.html", "Notre m&eacute;thode", "Identifier, qualifier, mobiliser et suivre.", "action")}${megaLink("nos-poles.html", "Nos 5 p&ocirc;les", "Comprendre les expertises TVF.", "action")}`,
  )
  .replace(/<a class="mega-link" href="gouvernance\.html">[\s\S]*?<\/a>/g, "")
  .replace(/<a class="mega-link" href="documents-officiels\.html">[\s\S]*?<\/a>/g, "")
  .replace(/<a class="mega-link" href="kit-media\.html">[\s\S]*?<\/a>/g, "");

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function currentTitle(html, file) {
  return stripTags(((html.match(/<title>(.*?)<\/title>/i) || [])[1] || file).split("|")[0]);
}

function breadcrumbFor(file, html) {
  const meta = pageMeta[file] || ["Archives", currentTitle(html, file)];
  return `<nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span>${meta[0] !== "Accueil" ? `<span>${meta[0]}</span><span class="breadcrumb-separator" aria-hidden="true">/</span>` : ""}<span aria-current="page">${meta[1]}</span></nav>`;
}

for (const file of htmlFiles) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const isPublic = publicSet.has(file);

  html = html.replace(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/i, header);
  html = html.replace(/\s*<nav class="breadcrumb"[\s\S]*?<\/nav>/i, "");
  html = html.replace(/<\/header>/i, `</header>${breadcrumbFor(file, html)}`);

  if (/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i.test(html)) {
    html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i, `<meta name="robots" content="${isPublic ? "index, follow" : "noindex, nofollow"}" />`);
  } else {
    html = html.replace(/<meta\s+name="viewport"[^>]*>/i, (match) => `${match}\n    <meta name="robots" content="${isPublic ? "index, follow" : "noindex, nofollow"}" />`);
  }

  html = html.replace(/https:\/\/territoiresvivantsfrance\.fr/g, "https://www.territoiresvivantsfrance.fr");
  html = html.replace(/\s*<script id="global-structured-data"[\s\S]*?<\/script>/i, "");

  if (isPublic) {
    const meta = pageMeta[file] || ["TVF", currentTitle(html, file)];
    const url = file === "index.html" ? "https://www.territoiresvivantsfrance.fr/" : `https://www.territoiresvivantsfrance.fr/${file}`;
    const structured = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.territoiresvivantsfrance.fr/#organization",
          name: "Territoires Vivants France",
          url: "https://www.territoiresvivantsfrance.fr/",
          logo: "https://www.territoiresvivantsfrance.fr/assets/logo-territoires-vivants-france.png",
          address: {
            "@type": "PostalAddress",
            streetAddress: "25 rue Elise Gervais",
            postalCode: "42000",
            addressLocality: "Saint-Etienne",
            addressCountry: "FR",
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.territoiresvivantsfrance.fr/" },
            { "@type": "ListItem", position: 2, name: stripTags(meta[1]), item: url },
          ],
        },
      ],
    };
    html = html.replace("</head>", `    <script id="global-structured-data" type="application/ld+json">${JSON.stringify(structured)}</script>\n  </head>`);
  }

  html = html.replace(/\s*<script\s+defer\s+src="navigation\.js"><\/script>/gi, "");
  html = html.replace(/\s*<\/body>/i, `\n    <script defer src="navigation.js"></script>\n  </body>`);

  fs.writeFileSync(full, html, "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((file) => {
  const loc = file === "index.html" ? "https://www.territoiresvivantsfrance.fr/" : `https://www.territoiresvivantsfrance.fr/${file}`;
  const priority = file === "index.html" ? "1.0" : ["nos-actions.html", "observatoire-national.html", "dossier-saint-etienne.html", "etude-impact-saint-etienne.html", "banque-materiaux.html", "espace-collectivites.html", "proprietaires.html"].includes(file) ? "0.9" : "0.7";
  return `  <url><loc>${loc}</loc><lastmod>2026-06-28</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
}).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

const archived = htmlFiles.filter((file) => !publicSet.has(file));
const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://www.territoiresvivantsfrance.fr/sitemap.xml\n`;
fs.writeFileSync(path.join(root, "robots.txt"), robots, "utf8");

const vercelPath = path.join(root, "vercel.json");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
vercel.redirects = [];
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");

fs.writeFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), `# Architecture publique TVF\n\nMise a jour : 28 juin 2026.\n\n- Pages publiques indexables : ${publicPages.length}\n- Pages archivees hors navigation publique : ${archived.length}\n- Regle : aucun contenu n'est supprime. Les pages secondaires ou techniques restent accessibles par URL directe, mais ne sont plus exposees dans la navigation publique ni dans le sitemap.\n\n## Pages publiques prioritaires\n\n${publicPages.map((file) => `- ${file}`).join("\n")}\n\n## Pages archivees hors navigation publique\n\n${archived.map((file) => `* ${file}`).join("\n")}\n`, "utf8");

console.log(JSON.stringify({ publicPages: publicPages.length, archivedPages: archived.length, htmlFiles: htmlFiles.length }, null, 2));
