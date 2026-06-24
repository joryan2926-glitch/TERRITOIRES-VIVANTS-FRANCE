const fs = require("fs");
const path = require("path");

const root = process.cwd();

const publicPages = [
  "index.html",
  "qui-sommes-nous.html",
  "pourquoi-tvf-existe.html",
  "nos-actions.html",
  "notre-methode.html",
  "vision-france-2035.html",
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
  "observatoire-national.html",
  "carte-territoires.html",
  "impact-resultats.html",
  "dossier-saint-etienne.html",
  "banque-materiaux.html",
  "bien-solidaire-usage-partage.html",
  "financer-projets.html",
  "projets-pilotes.html",
  "agir-avec-nous.html",
  "signalement.html",
  "proprietaires.html",
  "parcours-demande.html",
  "antennes-locales.html",
  "espace-collectivites.html",
  "espace-entreprises.html",
  "espace-benevoles.html",
  "partenariats-strategiques.html",
  "ressources.html",
  "sources-donnees.html",
  "faq.html",
  "gouvernance.html",
  "transparence.html",
  "documents-officiels.html",
  "ce-que-tvf-ne-fait-pas.html",
  "statuts.html",
  "faire-un-don.html",
  "contact.html",
  "mentions-legales.html",
  "politique-confidentialite.html"
];

const publicSet = new Set(publicPages);

const pageMeta = {
  "index.html": ["Accueil", "Accueil"],
  "qui-sommes-nous.html": ["Association", "Qui sommes-nous ?"],
  "pourquoi-tvf-existe.html": ["Association", "Pourquoi TVF existe"],
  "gouvernance.html": ["Association", "Gouvernance"],
  "transparence.html": ["Association", "Transparence"],
  "documents-officiels.html": ["Association", "Documents et conventions"],
  "statuts.html": ["Association", "Statuts"],
  "vision-france-2035.html": ["Association", "Vision France 2035"],
  "nos-actions.html": ["Nos actions", "Vue d'ensemble"],
  "notre-methode.html": ["Nos actions", "Notre m&eacute;thode"],
  "action-logements-vacants.html": ["Nos actions", "Logements vacants"],
  "action-commerces-inoccupes.html": ["Nos actions", "Commerces inoccup&eacute;s"],
  "action-materiaux-reemploi.html": ["Nos actions", "Mat&eacute;riaux de r&eacute;emploi"],
  "action-espaces-abandonnes.html": ["Nos actions", "Espaces abandonn&eacute;s"],
  "action-solidarite-insertion.html": ["Nos actions", "Solidarit&eacute; et insertion"],
  "nos-poles.html": ["Nos p&ocirc;les", "Vue d'ensemble"],
  "pole-habitat-vivant.html": ["Nos p&ocirc;les", "Habitat Vivant"],
  "pole-materiautheque-solidaire.html": ["Nos p&ocirc;les", "Mat&eacute;riauth&egrave;que Solidaire"],
  "pole-commerce-vivant.html": ["Nos p&ocirc;les", "Commerce Vivant"],
  "pole-friches-terrains-vivants.html": ["Nos p&ocirc;les", "Friches et Terrains Vivants"],
  "pole-solidarite-insertion.html": ["Nos p&ocirc;les", "Solidarit&eacute; et Insertion"],
  "observatoire-national.html": ["Observatoire", "Observatoire national"],
  "dossier-saint-etienne.html": ["Observatoire", "Dossier Saint-&Eacute;tienne"],
  "carte-territoires.html": ["Observatoire", "Carte des territoires"],
  "impact-resultats.html": ["Observatoire", "Impact et r&eacute;sultats"],
  "banque-materiaux.html": ["Dispositifs", "Banque de Mat&eacute;riaux TVF"],
  "bien-solidaire-usage-partage.html": ["Dispositifs", "Bien Solidaire &agrave; Usage Partag&eacute;"],
  "financer-projets.html": ["Dispositifs", "Financer les projets"],
  "projets-pilotes.html": ["Dispositifs", "Projets pilotes"],
  "agir-avec-nous.html": ["Agir", "Agir avec nous"],
  "signalement.html": ["Agir", "Signaler un lieu"],
  "proprietaires.html": ["Par public", "Propri&eacute;taires"],
  "parcours-demande.html": ["Agir", "Parcours d'une demande"],
  "antennes-locales.html": ["Agir", "Antennes locales"],
  "espace-benevoles.html": ["Agir", "Espace b&eacute;n&eacute;voles"],
  "espace-collectivites.html": ["Partenariats", "Collectivit&eacute;s"],
  "espace-entreprises.html": ["Partenariats", "Entreprises"],
  "partenariats-strategiques.html": ["Partenariats", "Coop&eacute;rations"],
  "ressources.html": ["Ressources", "Centre de ressources"],
  "sources-donnees.html": ["Ressources", "Sources et donn&eacute;es"],
  "faq.html": ["Informations", "Questions fr&eacute;quentes"],
  "ce-que-tvf-ne-fait-pas.html": ["Association", "Ce que TVF ne fait pas"],
  "faire-un-don.html": ["Agir", "Faire un don"],
  "contact.html": ["Contact", "Contact"],
  "mentions-legales.html": ["Informations", "Mentions l&eacute;gales"],
  "politique-confidentialite.html": ["Informations", "Politique de confidentialit&eacute;"]
};

const statusMeta = {
  "dossier-saint-etienne.html": ["pilot", "Projet pilote officiel"],
  "projets-pilotes.html": ["pilot", "Projets pilotes"],
  "observatoire-national.html": ["experimental", "Observatoire exp&eacute;rimental"],
  "carte-territoires.html": ["experimental", "Cartographie exp&eacute;rimentale"],
  "banque-materiaux.html": ["experimental", "Dispositif exp&eacute;rimental"],
  "bien-solidaire-usage-partage.html": ["experimental", "Programme en pr&eacute;figuration"],
  "financer-projets.html": ["experimental", "Cadre en pr&eacute;figuration"],
  "proprietaires.html": ["experimental", "Parcours propri&eacute;taires en structuration"]
};

const redirects = {
  "/vision-2035.html": "/vision-france-2035.html",
  "/feuille-route-2026-2035.html": "/vision-france-2035.html",
  "/association-nationale.html": "/qui-sommes-nous.html",
  "/action-antennes-locales.html": "/antennes-locales.html",
  "/devenir-antenne-locale.html": "/antennes-locales.html#devenir-antenne",
  "/recrutement.html": "/espace-benevoles.html",
  "/espace-adherents.html": "/agir-avec-nous.html",
  "/espace-partenaires.html": "/partenariats-strategiques.html",
  "/observatoire-patrimoine-vacant.html": "/observatoire-national.html",
  "/observatoire-avance.html": "/observatoire-national.html",
  "/observatoire-temps-reel.html": "/observatoire-national.html",
  "/pole-observatoire-patrimoine-vacant.html": "/observatoire-national.html",
  "/tableau-de-bord.html": "/impact-resultats.html",
  "/tableau-bord-national.html": "/impact-resultats.html",
  "/carte-interactive-nationale.html": "/carte-territoires.html",
  "/banque-materiaux-collaborative.html": "/banque-materiaux.html",
  "/materiaux-reels.html": "/banque-materiaux.html",
  "/proposer-materiaux.html": "/banque-materiaux.html#contribuer",
  "/faq-bien-solidaire.html": "/bien-solidaire-usage-partage.html#faq",
  "/proposer-un-bien.html": "/proprietaires.html",
  "/carte-biens-candidats.html": "/bien-solidaire-usage-partage.html",
  "/projets-realises-bien-solidaire.html": "/projets-pilotes.html",
  "/devenir-proprietaire-partenaire.html": "/proprietaires.html",
  "/fonds-investissement-solidaire.html": "/financer-projets.html",
  "/devenir-investisseur-solidaire.html": "/financer-projets.html#contribuer",
  "/devenir-mecene.html": "/financer-projets.html#mecenat",
  "/projets-a-financer.html": "/financer-projets.html#projets",
  "/impact-investisseurs.html": "/financer-projets.html#impact",
  "/partenariat-collectivites.html": "/espace-collectivites.html",
  "/partenariat-entreprises.html": "/espace-entreprises.html",
  "/partenariat-associations.html": "/partenariats-strategiques.html",
  "/partenariat-ecoles.html": "/partenariats-strategiques.html",
  "/partenariat-universites.html": "/partenariats-strategiques.html",
  "/partenariat-bailleurs.html": "/partenariats-strategiques.html",
  "/partenariat-fondations.html": "/partenariats-strategiques.html",
  "/publications-etudes.html": "/ressources.html",
  "/centre-ressources.html": "/ressources.html",
  "/espace-presse.html": "/ressources.html#presse",
  "/mesure-impact.html": "/impact-resultats.html",
  "/plateforme-operationnelle.html": "/nos-actions.html",
  "/tvf-mobile.html": "/vision-france-2035.html"
};

const iconPaths = {
  institution: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  action: '<path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-7"/>',
  pole: '<path d="M4 9.5 12 5l8 4.5-8 4.5-8-4.5Z"/><path d="M4 9.5V16l8 4.5 8-4.5V9.5"/>',
  observe: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  engage: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  audience: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7 0"/>'
};

function megaLink(href, title, description, icon) {
  return `<a class="mega-link" href="${href}"><span class="mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[icon]}</svg></span><span class="mega-copy"><strong>${title}</strong><small>${description}</small></span></a>`;
}

function dropdown(label, href, heading, description, links) {
  return `<div class="nav-dropdown"><a class="nav-drop-toggle" href="${href}"><span class="nav-label">${label}</span><svg class="nav-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a><div class="nav-dropdown-menu" aria-label="Sous-menu ${label}"><div class="mega-menu-heading"><strong>${heading}</strong><span>${description}</span></div>${links.join("")}</div></div>`;
}

const header = `<header class="site-header"><a class="brand" href="index.html" aria-label="Territoires Vivants France - Accueil"><img decoding="async" fetchpriority="high" src="assets/logo-territoires-vivants-france.png" alt="Logo Territoires Vivants France" /></a><nav class="main-nav" aria-label="Navigation principale"><a href="index.html">Accueil</a>${dropdown("Association", "qui-sommes-nous.html", "Association", "Comprendre l'identit&eacute;, la raison d'&ecirc;tre, la gouvernance et les engagements de TVF.", [megaLink("qui-sommes-nous.html", "Qui sommes-nous ?", "Mission, origine et positionnement.", "institution"),megaLink("pourquoi-tvf-existe.html", "Pourquoi TVF existe", "Le probl&egrave;me public, les causes et la r&eacute;ponse TVF.", "institution"),megaLink("gouvernance.html", "Gouvernance", "Responsabilit&eacute;s et d&eacute;cisions.", "institution"),megaLink("transparence.html", "Transparence", "Documents et informations confirm&eacute;es.", "institution"),megaLink("documents-officiels.html", "Documents et conventions", "R&egrave;gles, crit&egrave;res et mod&egrave;les.", "institution"),megaLink("vision-france-2035.html", "Vision France 2035", "Trajectoire nationale progressive.", "institution")])}${dropdown("Nos actions", "nos-actions.html", "Nos actions", "Des dossiers th&eacute;matiques pour comprendre les enjeux et les solutions propos&eacute;es.", [megaLink("nos-actions.html", "Vue d'ensemble", "Les leviers d'intervention de TVF.", "action"),megaLink("notre-methode.html", "Notre m&eacute;thode", "Identifier, qualifier, mobiliser et suivre.", "action"),megaLink("action-logements-vacants.html", "Logements vacants", "Rep&eacute;rer et accompagner la remise en usage.", "action"),megaLink("action-commerces-inoccupes.html", "Commerces inoccup&eacute;s", "R&eacute;activer les rez-de-chauss&eacute;e utiles.", "action"),megaLink("action-materiaux-reemploi.html", "Mat&eacute;riaux de r&eacute;emploi", "Pr&eacute;server la valeur des ressources.", "action"),megaLink("action-espaces-abandonnes.html", "Espaces abandonn&eacute;s", "Qualifier friches et terrains d&eacute;laiss&eacute;s.", "action"),megaLink("action-solidarite-insertion.html", "Solidarit&eacute; et insertion", "Relier projets, comp&eacute;tences et emploi.", "action")])}${dropdown("Nos p&ocirc;les", "nos-poles.html", "Nos p&ocirc;les", "Les expertises appel&eacute;es &agrave; structurer l'action nationale.", [megaLink("nos-poles.html", "Vue d'ensemble", "Comment les cinq p&ocirc;les coop&egrave;rent.", "pole"),megaLink("pole-habitat-vivant.html", "Habitat Vivant", "Logements vacants et habitat digne.", "pole"),megaLink("pole-materiautheque-solidaire.html", "Mat&eacute;riauth&egrave;que Solidaire", "R&eacute;emploi et ressources territoriales.", "pole"),megaLink("pole-commerce-vivant.html", "Commerce Vivant", "Locaux et activit&eacute;s de proximit&eacute;.", "pole"),megaLink("pole-friches-terrains-vivants.html", "Friches et Terrains Vivants", "Usages sobres et biodiversit&eacute;.", "pole"),megaLink("pole-solidarite-insertion.html", "Solidarit&eacute; et Insertion", "Parcours et engagement citoyen.", "pole")])}${dropdown("Observatoire", "observatoire-national.html", "Observatoire", "Des donn&eacute;es sourc&eacute;es, dat&eacute;es et territorialis&eacute;es.", [megaLink("observatoire-national.html", "Observatoire national", "Logements, commerces, friches et mat&eacute;riaux.", "observe"),megaLink("dossier-saint-etienne.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote.", "observe"),megaLink("carte-territoires.html", "Carte des territoires", "Visualisation et couches th&eacute;matiques.", "observe"),megaLink("impact-resultats.html", "Impact et r&eacute;sultats", "Indicateurs r&eacute;els et m&eacute;thode de mesure.", "observe")])}${dropdown("Agir", "agir-avec-nous.html", "Agir avec TVF", "Signaler, contribuer, coop&eacute;rer ou soutenir l'association.", [megaLink("agir-avec-nous.html", "Toutes les formes d'engagement", "Trouver le parcours adapt&eacute;.", "engage"),megaLink("signalement.html", "Signaler un lieu", "Transmettre une situation &agrave; qualifier.", "engage"),megaLink("banque-materiaux.html", "Proposer une ressource", "Contribuer &agrave; la Banque de Mat&eacute;riaux.", "engage"),megaLink("bien-solidaire-usage-partage.html", "Proposer un bien", "&Eacute;tudier un bien vacant ou inutilis&eacute;.", "engage"),megaLink("antennes-locales.html", "Antennes locales", "Pr&eacute;parer une implantation territoriale.", "engage"),megaLink("faire-un-don.html", "Faire un don", "Soutenir la structuration de TVF.", "engage")])}</nav><a class="donate-button" href="contact.html">Nous contacter <span aria-hidden="true">&rarr;</span></a></header>`;

const mobileMenuButton = `<button class="mobile-menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`;
const headerWithMenuButton = header.replace(
  '<nav class="main-nav" aria-label="Navigation principale">',
  `${mobileMenuButton}<nav id="main-navigation" class="main-nav" aria-label="Navigation principale">`
);

const audienceMenu = dropdown("Par public", "agir-avec-nous.html", "Votre profil", "Acc&eacute;der directement aux informations, services et parcours correspondant &agrave; votre situation.", [
  megaLink("proprietaires.html", "Propri&eacute;taires", "Proposer un bien et &eacute;tudier une remise en usage.", "audience"),
  megaLink("espace-collectivites.html", "Collectivit&eacute;s", "Diagnostic, cartographie et coop&eacute;ration territoriale.", "audience"),
  megaLink("espace-entreprises.html", "Entreprises", "Mat&eacute;riaux, comp&eacute;tences, locaux et m&eacute;c&eacute;nat.", "audience"),
  megaLink("espace-benevoles.html", "Citoyens et b&eacute;n&eacute;voles", "Missions, signalements et engagement local.", "audience"),
  megaLink("financer-projets.html", "M&eacute;c&egrave;nes et financeurs", "Soutenir des projets qualifi&eacute;s et suivis.", "audience"),
  megaLink("partenariats-strategiques.html", "Partenaires", "Construire une coop&eacute;ration dans un cadre clair.", "audience")
]);

const observatoryMenu = dropdown("Observatoire", "observatoire-national.html", "Observatoire", "Des donn&eacute;es sourc&eacute;es, dat&eacute;es et territorialis&eacute;es.", [
  megaLink("observatoire-national.html", "Observatoire national", "Logements, commerces, friches et mat&eacute;riaux.", "observe"),
  megaLink("dossier-saint-etienne.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote.", "observe"),
  megaLink("carte-territoires.html", "Carte des territoires", "Visualisation et couches th&eacute;matiques.", "observe"),
  megaLink("impact-resultats.html", "Impact et r&eacute;sultats", "Indicateurs r&eacute;els et m&eacute;thode de mesure.", "observe")
]);

const engagementMenu = dropdown("Agir", "agir-avec-nous.html", "Agir avec TVF", "Signaler, contribuer, coop&eacute;rer ou soutenir l'association.", [
  megaLink("agir-avec-nous.html", "Toutes les formes d'engagement", "Trouver le parcours adapt&eacute;.", "engage"),
  megaLink("signalement.html", "Signaler un lieu", "Transmettre une situation &agrave; qualifier.", "engage"),
  megaLink("banque-materiaux.html", "Proposer une ressource", "Contribuer &agrave; la Banque de Mat&eacute;riaux.", "engage"),
  megaLink("bien-solidaire-usage-partage.html", "Proposer un bien", "&Eacute;tudier un bien vacant ou inutilis&eacute;.", "engage"),
  megaLink("antennes-locales.html", "Antennes locales", "Pr&eacute;parer une implantation territoriale.", "engage"),
  megaLink("faire-un-don.html", "Faire un don", "Soutenir la structuration de TVF.", "engage")
]);

const completeHeader = headerWithMenuButton.replace(
  `${observatoryMenu}${engagementMenu}`,
  `${audienceMenu}${engagementMenu}${observatoryMenu}`
);

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  html = html.replace(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/i, completeHeader);
  html = html.replace(/\s*<nav class="breadcrumb"[\s\S]*?<\/nav>/i, "");
  html = html.replace(/\s*<script\s+defer\s+src="navigation\.js"><\/script>/gi, "");

  const isPublic = publicSet.has(file);
  const meta = pageMeta[file] || ["Espace interne", stripTags(((html.match(/<title>(.*?)<\/title>/i) || [])[1] || file).split("|")[0])];
  const breadcrumb = `<nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span>${meta[0] !== "Accueil" ? `<span>${meta[0]}</span><span class="breadcrumb-separator" aria-hidden="true">/</span>` : ""}<span aria-current="page">${meta[1]}</span></nav>`;
  html = html.replace(/<\/header>/i, `</header>${breadcrumb}`);

  html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i, `<meta name="robots" content="${isPublic ? "index, follow" : "noindex, nofollow"}" />`);
  html = html.replace(/https:\/\/territoiresvivantsfrance\.fr/g, "https://www.territoiresvivantsfrance.fr");

  if (!/class="page-status"/.test(html)) {
    const status = isPublic ? (statusMeta[file] || ["public", "Dossier public"] ) : ["internal", "Espace interne - non index&eacute;"];
    html = html.replace(/(<section class="page-hero[^>]*>\s*<div>)/i, `$1<span class="page-status" data-status="${status[0]}">${status[1]}</span>`);
  }

  html = html.replace(/\s*<script id="global-structured-data"[\s\S]*?<\/script>/i, "");
  if (isPublic) {
    const url = file === "index.html" ? "https://www.territoiresvivantsfrance.fr/" : `https://www.territoiresvivantsfrance.fr/${file}`;
    const structured = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": "https://www.territoiresvivantsfrance.fr/#organization", name: "Territoires Vivants France", url: "https://www.territoiresvivantsfrance.fr/", logo: "https://www.territoiresvivantsfrance.fr/assets/logo-territoires-vivants-france.png", address: { "@type": "PostalAddress", streetAddress: "25 rue Elise Gervais", postalCode: "42000", addressLocality: "Saint-Etienne", addressCountry: "FR" } },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.territoiresvivantsfrance.fr/" }, { "@type": "ListItem", position: 2, name: stripTags(meta[1]), item: url }] }
      ]
    };
    html = html.replace("</head>", `    <script id="global-structured-data" type="application/ld+json">${JSON.stringify(structured)}</script>\n  </head>`);
  }
  html = html.replace(/\s*<\/body>/i, `\n    <script defer src="navigation.js"></script>\n  </body>`);
  fs.writeFileSync(full, html, "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((file) => {
  const loc = file === "index.html" ? "https://www.territoiresvivantsfrance.fr/" : `https://www.territoiresvivantsfrance.fr/${file}`;
  const priority = file === "index.html" ? "1.0" : ["observatoire-national.html", "dossier-saint-etienne.html", "nos-actions.html", "banque-materiaux.html"].includes(file) ? "0.9" : "0.7";
  return `  <url><loc>${loc}</loc><lastmod>2026-06-24</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
}).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin-dashboard.html\nDisallow: /authentification.html\nDisallow: /api/\n\nSitemap: https://www.territoiresvivantsfrance.fr/sitemap.xml\n`, "utf8");

const vercelPath = path.join(root, "vercel.json");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
vercel.redirects = Object.entries(redirects).map(([source, destination]) => ({ source, destination, permanent: true }));
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");

fs.writeFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), `# Architecture publique TVF\n\nMise a jour : 24 juin 2026.\n\n- Pages publiques indexables : ${publicPages.length}\n- Anciennes URL redirigees : ${Object.keys(redirects).length}\n- Autres pages : interfaces internes, techniques ou evolutions futures en noindex.\n\n## Pages publiques\n\n${publicPages.map((file) => `- ${file}`).join("\n")}\n`, "utf8");

console.log(JSON.stringify({ publicPages: publicPages.length, redirects: Object.keys(redirects).length, processedHtml: fs.readdirSync(root).filter((name) => name.endsWith(".html")).length }, null, 2));
