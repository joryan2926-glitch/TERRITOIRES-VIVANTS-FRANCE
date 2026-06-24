const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, html) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

function updateHead(html, { title, description, slug, image = "assets/photos/institutional-meeting.jpg" }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="https://www.territoiresvivantsfrance.fr/${slug}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="https://www.territoiresvivantsfrance.fr/${slug}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/>/i, `<meta property="og:image" content="https://www.territoiresvivantsfrance.fr/${image}" />`);
  return html;
}

function replaceMain(file, main, head) {
  let html = read(file);
  html = html.replace(/\s*<main\b[\s\S]*?<\/main>/i, `\n${main}`);
  html = updateHead(html, head);
  write(file, html);
}

function injectBeforeMainEnd(file, marker, section) {
  let html = read(file);
  if (html.includes(marker)) return false;
  html = html.replace(/\s*<\/main>/i, `\n${section}\n    </main>`);
  write(file, html);
  return true;
}

function afterHeroHome() {
  let html = read("index.html");
  if (html.includes('id="tvf-clear-summary"')) return;
  const summary = `\n      <section class="page-wrap clear-summary" id="tvf-clear-summary" aria-labelledby="tvf-summary-title">\n        <span class="dossier-kicker">En cinq lignes</span>\n        <h2 id="tvf-summary-title" class="section-heading">Ce que fait Territoires Vivants France</h2>\n        <div class="summary-lines">\n          <p>TVF rep&egrave;re les logements vacants, commerces ferm&eacute;s, friches, b&acirc;timents inutilis&eacute;s et mat&eacute;riaux encore utiles.</p>\n          <p>TVF qualifie chaque situation avant d'agir : propri&eacute;t&eacute;, &eacute;tat, besoins du territoire, risques, faisabilit&eacute; et usage possible.</p>\n          <p>TVF mobilise habitants, propri&eacute;taires, collectivit&eacute;s, entreprises, associations, b&eacute;n&eacute;voles et financeurs autour de projets utiles.</p>\n          <p>TVF oriente les ressources vers la r&eacute;habilitation, le r&eacute;emploi, l'insertion, les usages partag&eacute;s et la revitalisation de proximit&eacute;.</p>\n          <p>TVF mesure uniquement les r&eacute;sultats prouv&eacute;s : aucun chiffre d'impact, partenaire ou projet r&eacute;alis&eacute; n'est affich&eacute; sans validation.</p>\n        </div>\n        <div class="summary-actions"><a class="button primary" href="pourquoi-tvf-existe.html">Comprendre pourquoi TVF existe</a><a class="button secondary" href="notre-methode.html">Voir la m&eacute;thode</a></div>\n      </section>\n`;
  html = html.replace(/\s*<section class="poles-strip"/i, `${summary}\n      <section class="poles-strip"`);
  write("index.html", html);
}

const whyMain = `    <main class="dossier-shell" data-professional-enrichment="public-page">
      <section class="page-hero">
        <div><span class="page-status">Raison d'&ecirc;tre</span><h1>Pourquoi <span>TVF existe</span></h1><p>Comprendre le probl&egrave;me public auquel Territoires Vivants France veut r&eacute;pondre : des lieux utiles restent vacants, des ressources sont perdues et des territoires manquent de moyens pour agir ensemble.</p></div>
        <img decoding="async" fetchpriority="high" class="page-hero-photo" src="assets/photos/urban-renewal-street.jpg" alt="Rue urbaine observee dans une demarche de revitalisation" width="1800" height="1200" />
      </section>
      <div class="page-wrap">
        <section class="dossier-intro" aria-labelledby="why-intro">
          <div><span class="dossier-kicker">Le constat</span><h2 id="why-intro">La France ne manque pas seulement de projets ; elle manque souvent de liens entre les ressources, les besoins et les acteurs</h2><p>Dans de nombreuses communes, un logement peut rester vide alors qu'une famille cherche une solution, un commerce peut rester ferm&eacute; alors qu'un centre-ville manque d'activit&eacute;, une friche peut demeurer inaccessible alors qu'un quartier manque d'espaces utiles, et des mat&eacute;riaux encore utilisables peuvent &ecirc;tre d&eacute;truits alors qu'une association ou un chantier local en aurait besoin.</p><p>TVF na&icirc;t de cette tension : l'utilit&eacute; existe, mais elle est fragment&eacute;e. Les informations sont dispers&eacute;es, les responsabilit&eacute;s sont parfois floues, les moyens financiers manquent, les propri&eacute;taires ne savent pas toujours vers qui se tourner et les collectivit&eacute;s doivent prioriser avec des budgets contraints.</p></div>
          <aside class="dossier-summary"><strong>Ce que TVF apporte</strong><ul><li>Une m&eacute;thode commune de rep&eacute;rage</li><li>Une qualification avant publication</li><li>Un cadre de coop&eacute;ration territoriale</li><li>Une culture du r&eacute;emploi et de l'usage utile</li><li>Une mesure d'impact sans chiffres invent&eacute;s</li></ul></aside>
        </section>

        <section class="dossier-section" id="chiffres-france"><span class="dossier-kicker">Chiffres cl&eacute;s de contexte</span><h2>Des enjeux nationaux qui demandent une lecture locale</h2><div class="indicator-strip"><article class="indicator-block"><strong>2,99 M</strong><span>logements vacants</span><small>France, recensement INSEE 2022.</small></article><article class="indicator-block"><strong>310 Mt</strong><span>d&eacute;chets produits</span><small>France, bilan SDES 2020.</small></article><article class="indicator-block"><strong>244</strong><span>communes Action C&oelig;ur de Ville</span><small>ANCT, programme national 2025.</small></article><article class="indicator-block"><strong>0</strong><span>impact TVF invent&eacute;</span><small>Publication apr&egrave;s preuve et validation.</small></article></div><p>Ces chiffres ne signifient pas que chaque bien peut &ecirc;tre repris, que chaque mat&eacute;riau peut &ecirc;tre r&eacute;employ&eacute; ou que chaque projet est faisable. Ils indiquent l'ampleur d'un sujet national qui doit &ecirc;tre travaill&eacute; commune par commune, avec des donn&eacute;es dat&eacute;es, des droits respect&eacute;s et des moyens r&eacute;alistes.</p></section>

        <section class="dossier-section"><span class="dossier-kicker">Pourquoi le probl&egrave;me persiste</span><h2>Les causes sont rarement uniques</h2><div class="dossier-grid"><article class="dossier-card"><h3>Information dispers&eacute;e</h3><p>Les donn&eacute;es existent mais elles sont souvent r&eacute;parties entre fichiers publics, connaissances locales, propri&eacute;taires, services techniques et observations de terrain.</p></article><article class="dossier-card"><h3>Co&ucirc;ts de remise en &eacute;tat</h3><p>Travaux, normes, diagnostics, assurances et charges futures peuvent bloquer des biens qui ont pourtant un potentiel d'usage.</p></article><article class="dossier-card"><h3>Propri&eacute;t&eacute; complexe</h3><p>Indivisions, successions, copropri&eacute;t&eacute;s, dettes, incertitudes juridiques ou absence de contact peuvent ralentir toute solution.</p></article><article class="dossier-card"><h3>Financements fragment&eacute;s</h3><p>Subventions, m&eacute;c&eacute;nat, fonds propres, dons et participation citoyenne ne se mobilisent pas sans dossier solide et gouvernance claire.</p></article><article class="dossier-card"><h3>Usages mal d&eacute;finis</h3><p>Un lieu vide ne devient utile que si son usage r&eacute;pond &agrave; un besoin local : logement, activit&eacute;, association, formation, culture ou service.</p></article><article class="dossier-card"><h3>Manque de suivi</h3><p>Sans indicateurs, les bonnes intentions ne suffisent pas. Il faut tracer les signalements, d&eacute;cisions, conventions et r&eacute;sultats.</p></article></div></section>

        <section class="dossier-section"><span class="dossier-kicker">Cons&eacute;quences</span><h2>La vacance produit des effets sociaux, &eacute;conomiques et environnementaux</h2><div class="method-register"><article><h3>Social</h3><p>Un patrimoine inutilis&eacute; peut accentuer le manque de locaux associatifs, de solutions temporaires, de services et de lieux de rencontre.</p></article><article><h3>&Eacute;conomique</h3><p>Des commerces ferm&eacute;s fragilisent les rues actives, r&eacute;duisent les flux et peuvent d&eacute;courager de nouvelles implantations.</p></article><article><h3>Environnemental</h3><p>Ne pas r&eacute;utiliser l'existant augmente la pression sur les ressources, les d&eacute;chets et l'artificialisation lorsque des alternatives sont possibles.</p></article></div></section>

        <section class="dossier-section"><span class="dossier-kicker">La r&eacute;ponse TVF</span><h2>Une m&eacute;thode en six &eacute;tapes, avant toute promesse</h2><div class="decision-flow"><article><h3>Identifier</h3><p>Rep&eacute;rer lieux, biens et ressources.</p></article><article><h3>Cartographier</h3><p>Structurer les informations utiles.</p></article><article><h3>Qualifier</h3><p>V&eacute;rifier les droits, risques et besoins.</p></article><article><h3>Mobiliser</h3><p>Relier les acteurs concern&eacute;s.</p></article><article><h3>Conventionner</h3><p>Clarifier r&ocirc;les, usages et dur&eacute;e.</p></article><article><h3>Mesurer</h3><p>Publier seulement les r&eacute;sultats prouv&eacute;s.</p></article></div></section>

        <section class="dossier-section"><span class="dossier-kicker">Cas types, non r&eacute;alisations TVF</span><h2>Des exemples pour comprendre les situations vis&eacute;es</h2><div class="case-study-grid"><article class="case-card"><h3>Cas type : logement vacant</h3><p>Un propri&eacute;taire poss&egrave;de un logement d&eacute;grad&eacute; mais ne peut pas financer seul la remise en &eacute;tat. TVF peut &eacute;tudier un accompagnement, des mat&eacute;riaux de r&eacute;emploi et une convention d'usage temporaire, sans transfert de propri&eacute;t&eacute;.</p></article><article class="case-card"><h3>Cas type : local commercial ferm&eacute;</h3><p>Une cellule vide peut &ecirc;tre qualifi&eacute;e pour tester un usage de proximit&eacute; : atelier, association, commerce temporaire ou formation, si les conditions juridiques et techniques le permettent.</p></article><article class="case-card"><h3>Cas type : mat&eacute;riaux disponibles</h3><p>Une entreprise propose des surplus. TVF ne les distribue pas automatiquement : les ressources sont orient&eacute;es vers des projets valid&eacute;s selon leur &eacute;tat, leur tra&ccedil;abilit&eacute; et leur utilit&eacute; territoriale.</p></article></div></section>

        <section class="dossier-section"><span class="dossier-kicker">Sources de r&eacute;f&eacute;rence</span><h2>Des donn&eacute;es publiques, pas des affirmations isol&eacute;es</h2><div class="source-register"><span><a href="https://www.insee.fr/fr/statistiques/2011101" rel="noopener" target="_blank">INSEE, dossiers complets territoriaux</a> &mdash; population, logement, emploi, revenus.</span><span><a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener" target="_blank">Z&eacute;ro Logement Vacant</a> &mdash; outil public de mobilisation des logements vacants.</span><span><a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener" target="_blank">Cartofriches, Cerema</a> &mdash; rep&eacute;rage des friches.</span><span><a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener" target="_blank">SDES, bilan national des d&eacute;chets</a> &mdash; donn&eacute;es environnementales.</span><span><a href="https://anct.gouv.fr/programmes-dispositifs/action-coeur-de-ville" rel="noopener" target="_blank">ANCT, Action C&oelig;ur de Ville</a> &mdash; revitalisation des centralit&eacute;s.</span></div></section>

        <section class="institutional-callout"><div><h2>Passer du constat &agrave; l'action</h2><p>TVF se construit avec les territoires. Un signalement, une ressource, une comp&eacute;tence ou une proposition de coop&eacute;ration peut devenir utile s'il est qualifi&eacute; et inscrit dans un cadre clair.</p></div><a class="button" href="agir-avec-nous.html">Agir avec nous</a></section>
      </div>
    </main>`;

const topicSections = {
  "action-logements-vacants.html": {
    marker: "contenu-institutionnel-logements",
    title: "Logements vacants : passer du chiffre au parcours de remise en usage",
    lead: "La vacance n'a pas une seule cause. Succession, travaux, indivision, co&ucirc;t de r&eacute;novation, performance &eacute;nerg&eacute;tique, loyers, copropri&eacute;t&eacute; ou crainte administrative peuvent bloquer un bien. TVF intervient d'abord par qualification, puis par orientation vers les bons acteurs.",
    figures: [["2,99 M", "logements vacants", "France, INSEE 2022"], ["100 000+", "propri&eacute;taires contact&eacute;s", "Z&eacute;ro Logement Vacant, outil public"], ["0", "logement TVF invent&eacute;", "Aucun r&eacute;sultat publi&eacute; sans preuve"]],
    caseTitle: "Cas type : propri&eacute;taire sans moyens de r&eacute;novation",
    caseText: "Un logement ancien est vacant depuis plusieurs ann&eacute;es. TVF peut aider &agrave; clarifier l'&eacute;tat du bien, le besoin local, les ressources disponibles et une convention possible, notamment via le programme Bien Solidaire &agrave; Usage Partag&eacute;.",
    cta: ["Proposer un bien", "bien-solidaire-usage-partage.html"]
  },
  "action-commerces-inoccupes.html": {
    marker: "contenu-institutionnel-commerces",
    title: "Commerces inoccup&eacute;s : r&eacute;activer les rez-de-chauss&eacute;e utiles",
    lead: "La vacance commerciale se mesure difficilement sans p&eacute;rim&egrave;tre pr&eacute;cis. TVF ne publie pas de taux sans relev&eacute; dat&eacute;, mais peut aider &agrave; qualifier les cellules ferm&eacute;es, leurs usages possibles et les conditions de retour &agrave; une activit&eacute; locale.",
    figures: [["244", "communes Action C&oelig;ur de Ville", "ANCT, programme national"], ["1", "p&eacute;rim&egrave;tre &agrave; dater", "Rue, centre-ville ou commune"], ["0", "taux invent&eacute;", "Publication apr&egrave;s m&eacute;thode"]],
    caseTitle: "Cas type : cellule commerciale ferm&eacute;e",
    caseText: "Un local vide peut &ecirc;tre test&eacute; pour une activit&eacute; de proximit&eacute;, un atelier, une association ou un tiers-lieu temporaire si l'acc&egrave;s, la s&eacute;curit&eacute;, le bail et les charges sont compatibles.",
    cta: ["Signaler un commerce", "signalement.html"]
  },
  "action-materiaux-reemploi.html": {
    marker: "contenu-institutionnel-materiaux",
    title: "Mat&eacute;riaux de r&eacute;emploi : pr&eacute;server la valeur avant qu'elle ne disparaisse",
    lead: "Le r&eacute;emploi ne consiste pas &agrave; distribuer gratuitement des objets. Il s'agit d'identifier une ressource, de v&eacute;rifier son &eacute;tat, sa s&eacute;curit&eacute;, son stockage, son transport et sa destination dans un projet valid&eacute;.",
    figures: [["310 Mt", "d&eacute;chets produits", "France, SDES 2020"], ["66 %", "d&eacute;chets min&eacute;raux", "Principalement construction"], ["74 %", "valorisation mati&egrave;re", "Ne signifie pas r&eacute;emploi"]],
    caseTitle: "Cas type : surplus de chantier",
    caseText: "Une entreprise dispose de portes, luminaires ou bois inutilis&eacute;s. TVF peut &eacute;tudier la tra&ccedil;abilit&eacute;, l'&eacute;tat et l'affectation &agrave; un projet territorial, sans distribution automatique.",
    cta: ["Proposer une ressource", "banque-materiaux.html#contribuer"]
  },
  "action-espaces-abandonnes.html": {
    marker: "contenu-institutionnel-espaces",
    title: "Espaces abandonn&eacute;s : choisir l'usage avant l'am&eacute;nagement",
    lead: "Une friche ou un terrain inutilis&eacute; n'est pas automatiquement disponible. Propri&eacute;t&eacute;, pollution, risques, documents d'urbanisme, acc&egrave;s, entretien et acceptabilit&eacute; locale doivent &ecirc;tre clarifi&eacute;s avant de parler de jardin, ferme urbaine ou espace culturel.",
    figures: [["1", "site &agrave; qualifier", "Propri&eacute;t&eacute;, risques, usage"], ["Cartofriches", "outil Cerema", "Inventaires &agrave; v&eacute;rifier localement"], ["0", "friche TVF invent&eacute;e", "Publication apr&egrave;s validation"]],
    caseTitle: "Cas type : terrain d&eacute;laiss&eacute;",
    caseText: "Un terrain rep&eacute;r&eacute; peut devenir jardin partag&eacute;, espace nourricier ou lieu associatif seulement si la propri&eacute;t&eacute;, les usages voisins, l'eau, l'entretien et la s&eacute;curit&eacute; sont compatibles.",
    cta: ["Signaler un espace", "signalement.html"]
  },
  "action-solidarite-insertion.html": {
    marker: "contenu-institutionnel-solidarite",
    title: "Solidarit&eacute; et insertion : relier les projets aux comp&eacute;tences",
    lead: "La r&eacute;habilitation d'un lieu peut devenir un support d'apprentissage, de b&eacute;n&eacute;volat et de retour vers l'emploi. Cela demande un cadre s&eacute;rieux : encadrement, s&eacute;curit&eacute;, assurances, partenaires comp&eacute;tents et objectifs r&eacute;alistes.",
    figures: [["1", "parcours &agrave; construire", "B&eacute;n&eacute;volat, formation ou insertion"], ["0", "b&eacute;n&eacute;ficiaire invent&eacute;", "Chiffres apr&egrave;s suivi"], ["6", "familles de missions", "Rep&eacute;rage, chantier, accueil, logistique, donn&eacute;es, animation"]],
    caseTitle: "Cas type : chantier participatif encadr&eacute;",
    caseText: "Un chantier l&eacute;ger peut accueillir des habitants et b&eacute;n&eacute;voles si les gestes sont adapt&eacute;s, les risques ma&icirc;tris&eacute;s et la coordination confi&eacute;e &agrave; des personnes qualifi&eacute;es.",
    cta: ["Devenir b&eacute;n&eacute;vole", "agir-avec-nous.html#benevole"]
  }
};

function figureStrip(figures) {
  return `<div class="indicator-strip compact-strip">${figures.map(([value, label, source]) => `<article class="indicator-block"><strong>${value}</strong><span>${label}</span><small>${source}</small></article>`).join("")}</div>`;
}

function topicSection({ marker, title, lead, figures, caseTitle, caseText, cta }) {
  return `      <section class="page-wrap institutional-reference" id="${marker}">
        <span class="dossier-kicker">Renforcement institutionnel</span>
        <h2 class="section-heading">${title}</h2>
        <p class="lead-block">${lead}</p>
        ${figureStrip(figures)}
        <div class="dossier-grid">
          <article class="dossier-card"><h3>Causes &agrave; analyser</h3><p>Chaque situation doit &ecirc;tre lue avec ses causes propres : droit, co&ucirc;t, &eacute;tat technique, besoin local, portage, financement et capacit&eacute; d'exploitation.</p></article>
          <article class="dossier-card"><h3>Solution TVF</h3><p>TVF apporte un cadre : signalement, qualification, orientation, coop&eacute;ration, convention, suivi et publication prudente des r&eacute;sultats.</p></article>
          <article class="dossier-card"><h3>${caseTitle}</h3><p>${caseText}</p><p><em>Exemple fictif &agrave; vis&eacute;e p&eacute;dagogique, non pr&eacute;sent&eacute; comme une r&eacute;alisation TVF.</em></p></article>
        </div>
        <div class="flow-note"><p><strong>Statut de publication :</strong> les informations op&eacute;rationnelles deviennent publiques apr&egrave;s v&eacute;rification, accord de publication et rattachement &agrave; un territoire clairement identifi&eacute;.</p><a class="button" href="${cta[1]}">${cta[0]}</a></div>
      </section>`;
}

function audienceSection(file, marker, title, lead, cards, cta) {
  const section = `      <section class="page-wrap institutional-reference" id="${marker}">
        <span class="dossier-kicker">Lecture par public</span>
        <h2 class="section-heading">${title}</h2>
        <p class="lead-block">${lead}</p>
        <div class="dossier-grid">${cards.map((card) => `<article class="dossier-card"><h3>${card[0]}</h3><p>${card[1]}</p></article>`).join("")}</div>
        <div class="flow-note"><p><strong>Cadre commun :</strong> toute coop&eacute;ration doit pr&eacute;ciser les objectifs, responsabilit&eacute;s, moyens, donn&eacute;es publiables et conditions de suivi.</p><a class="button" href="${cta[1]}">${cta[0]}</a></div>
      </section>`;
  injectBeforeMainEnd(file, marker, section);
}

if (!fs.existsSync(path.join(root, "pourquoi-tvf-existe.html"))) {
  fs.copyFileSync(path.join(root, "qui-sommes-nous.html"), path.join(root, "pourquoi-tvf-existe.html"));
}

replaceMain("pourquoi-tvf-existe.html", whyMain, {
  title: "Pourquoi TVF existe | Territoires Vivants France",
  description: "Le dossier de r&eacute;f&eacute;rence qui explique la raison d'&ecirc;tre de Territoires Vivants France : vacance, friches, r&eacute;emploi, coop&eacute;ration territoriale et mesure d'impact.",
  slug: "pourquoi-tvf-existe.html",
  image: "assets/photos/urban-renewal-street.jpg"
});

afterHeroHome();

for (const [file, config] of Object.entries(topicSections)) {
  injectBeforeMainEnd(file, config.marker, topicSection(config));
}

injectBeforeMainEnd("nos-actions.html", "contenu-institutionnel-nos-actions", `      <section class="page-wrap institutional-reference" id="contenu-institutionnel-nos-actions">
        <span class="dossier-kicker">Suite logique</span>
        <h2 class="section-heading">Comprendre l'action TVF en trois niveaux de lecture</h2>
        <p class="lead-block">La page Nos actions doit guider le visiteur sans le perdre : d'abord la raison d'agir, ensuite les leviers op&eacute;rationnels, enfin les dispositifs de financement et de mesure.</p>
        <div class="decision-flow"><article><h3>Pourquoi agir</h3><p>Vacance, friches, ressources perdues, centralit&eacute;s fragilis&eacute;es et besoins sociaux.</p></article><article><h3>Comment agir</h3><p>Rep&eacute;rer, qualifier, mobiliser, conventionner, financer et suivre.</p></article><article><h3>Avec qui</h3><p>Habitants, propri&eacute;taires, collectivit&eacute;s, entreprises, associations, b&eacute;n&eacute;voles.</p></article><article><h3>Avec quelles preuves</h3><p>Donn&eacute;es sourc&eacute;es, statuts de projet et r&eacute;sultats valid&eacute;s.</p></article><article><h3>Avec quels garde-fous</h3><p>Aucun chiffre, partenaire ou financeur invent&eacute;.</p></article><article><h3>Vers quoi</h3><p>Un r&eacute;seau national d'antennes et un observatoire territorial progressif.</p></article></div>
        <div class="source-register"><strong>Sources structurantes</strong><span>INSEE : logement, population, emploi et revenus.</span><span>Cerema : friches et outils territoriaux.</span><span>SDES/ADEME : d&eacute;chets, ressources et &eacute;conomie circulaire.</span><span>ANCT/Banque des Territoires : revitalisation et centralit&eacute;s.</span></div>
      </section>`);

injectBeforeMainEnd("observatoire-national.html", "chiffres-cles-france", `      <section class="page-wrap institutional-reference" id="chiffres-cles-france">
        <span class="dossier-kicker">Chiffres cl&eacute;s de la France</span>
        <h2 class="section-heading">Un tableau de bord national &agrave; construire par preuves successives</h2>
        <p class="lead-block">L'Observatoire TVF doit distinguer les donn&eacute;es officielles disponibles, les donn&eacute;es territoriales &agrave; produire et les indicateurs internes qui n'existeront qu'apr&egrave;s les premiers projets.</p>
        <table class="stat-comparison"><thead><tr><th>Indicateur</th><th>Donn&eacute;e ou statut</th><th>Source / condition</th></tr></thead><tbody><tr><th>Logements vacants</th><td>2&nbsp;987&nbsp;746 en France en 2022</td><td>INSEE, recensement 2022</td></tr><tr><th>Commerces vacants</th><td>Pas de taux national unique repris par TVF</td><td>M&eacute;thode locale n&eacute;cessaire</td></tr><tr><th>Friches</th><td>Inventaires &agrave; consulter par territoire</td><td>Cartofriches, Cerema</td></tr><tr><th>D&eacute;chets produits</th><td>310 millions de tonnes en 2020</td><td>SDES, bilan national</td></tr><tr><th>Artificialisation</th><td>&Agrave; analyser par mill&eacute;sime et territoire</td><td>Portail national de l'artificialisation</td></tr><tr><th>Impact TVF</th><td>Non publi&eacute; tant que non mesur&eacute;</td><td>Supabase, validation interne future</td></tr></tbody></table>
      </section>`);

audienceSection("espace-collectivites.html", "contenu-public-collectivites", "Pour les collectivit&eacute;s : une aide &agrave; prioriser, pas une promesse automatique", "Une commune ou intercommunalit&eacute; peut manquer de temps, de donn&eacute;es consolid&eacute;es ou de portage pour transformer des lieux vacants. TVF peut apporter une m&eacute;thode de diagnostic et de coop&eacute;ration, sans se substituer aux comp&eacute;tences publiques.", [["Besoin", "Identifier les biens vacants, qualifier les contraintes, hi&eacute;rarchiser les urgences et relier les projets &agrave; l'int&eacute;r&ecirc;t local."], ["B&eacute;n&eacute;fice", "Disposer d'une lecture op&eacute;rationnelle pour dialoguer avec propri&eacute;taires, habitants, associations et entreprises."], ["Garde-fou", "Aucune intervention n'est pr&eacute;sent&eacute;e comme acquise sans convention, responsabilit&eacute;s et financement clarifi&eacute;s."]], ["Demander un contact", "contact.html"]);

audienceSection("espace-entreprises.html", "contenu-public-entreprises", "Pour les entreprises : transformer une ressource inutilis&eacute;e en contribution territoriale", "Une entreprise peut contribuer par des mat&eacute;riaux, des comp&eacute;tences, du m&eacute;c&eacute;nat, des locaux ou une expertise. TVF doit encadrer ces contributions pour &eacute;viter la communication vide et garantir une affectation utile.", [["RSE concr&egrave;te", "Valoriser surplus, invendus, comp&eacute;tences et temps professionnel dans des projets locaux document&eacute;s."], ["Tra&ccedil;abilit&eacute;", "D&eacute;crire l'origine, l'&eacute;tat, l'affectation et le devenir de chaque ressource lorsque cela est possible."], ["Visibilit&eacute; responsable", "Mentionner une contribution uniquement si elle est confirm&eacute;e et publiable."]], ["Proposer une coop&eacute;ration", "contact.html"]);

audienceSection("agir-avec-nous.html", "contenu-public-citoyens", "Pour les citoyens : contribuer sans devoir &ecirc;tre expert", "Un habitant peut signaler un lieu, proposer une ressource, participer &agrave; une action, relayer un besoin ou rejoindre une future antenne. TVF doit rendre ces parcours simples, tout en prot&eacute;geant les donn&eacute;es et les personnes.", [["Signaler", "Transmettre une adresse, une description et, si possible, une photo. Le signalement est ensuite qualifi&eacute; avant toute publication."], ["Participer", "Aider &agrave; l'accueil, la logistique, la documentation, la mobilisation ou certains chantiers encadr&eacute;s."], ["Soutenir", "Adh&eacute;rer, donner ou mettre en relation TVF avec des acteurs utiles au territoire."]], ["Choisir une action", "agir-avec-nous.html#agir"]);

audienceSection("antennes-locales.html", "contenu-public-antennes", "Pour les futures antennes : une m&eacute;thode nationale, des priorit&eacute;s locales", "Le d&eacute;ploiement territorial doit rester progressif. Une antenne locale ne se cr&eacute;e pas seulement avec un nom : il faut des personnes r&eacute;f&eacute;rentes, un diagnostic, un cadre de donn&eacute;es, des partenaires confirm&eacute;s et une capacit&eacute; de suivi.", [["Candidature", "D&eacute;crire le territoire, les besoins observ&eacute;s, les personnes mobilisables et les sujets prioritaires."], ["Validation", "V&eacute;rifier la compatibilit&eacute; avec les statuts, la charte, la gouvernance et les capacit&eacute;s nationales."], ["Lancement", "Former les r&eacute;f&eacute;rents, fournir les outils, encadrer la communication et suivre les premi&egrave;res actions."]], ["Pr&eacute;parer une antenne", "contact.html"]);

injectBeforeMainEnd("documents-officiels.html", "contenu-statut-projets", `      <section class="page-wrap institutional-reference" id="contenu-statut-projets">
        <span class="dossier-kicker">Statuts de projet</span>
        <h2 class="section-heading">Clarifier ce qui est envisag&eacute;, engag&eacute;, valid&eacute; ou r&eacute;alis&eacute;</h2>
        <div class="status-ledger"><article><strong>En structuration</strong><p>Id&eacute;e, dispositif ou page pr&eacute;paratoire sans projet op&eacute;rationnel confirm&eacute;.</p></article><article><strong>Phase pilote</strong><p>Territoire ou action en exp&eacute;rimentation, avec m&eacute;thode &agrave; consolider.</p></article><article><strong>Conventionn&eacute;</strong><p>Accord sign&eacute; avec objectifs, responsabilit&eacute;s, dur&eacute;e et conditions.</p></article><article><strong>R&eacute;alis&eacute;</strong><p>Action termin&eacute;e, preuves disponibles et indicateurs valid&eacute;s.</p></article></div>
      </section>`);

console.log(JSON.stringify({ updated: true, page: "pourquoi-tvf-existe.html" }, null, 2));
