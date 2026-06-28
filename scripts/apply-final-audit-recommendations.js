const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicPath = path.join(root, "PUBLIC_ARCHITECTURE.md");
const sitemapPath = path.join(root, "sitemap.xml");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, html) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pageTitle(html, file) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function normalize(html) {
  return html.replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n");
}

function findSectionEnd(html, startIndex) {
  const open = /<section\b/gi;
  const close = /<\/section>/gi;
  open.lastIndex = startIndex + 1;
  close.lastIndex = startIndex + 1;
  let depth = 1;
  while (depth > 0) {
    const nextOpen = open.exec(html);
    const nextClose = close.exec(html);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      close.lastIndex = open.lastIndex;
    } else {
      depth -= 1;
      if (depth === 0) return close.lastIndex;
      open.lastIndex = close.lastIndex;
    }
  }
  return -1;
}

function insertBefore(html, needle, block) {
  if (html.includes(block.trim().slice(0, 70))) return html;
  const index = html.indexOf(needle);
  if (index === -1) return html;
  return `${html.slice(0, index)}${block}${html.slice(index)}`;
}

function replaceMain(html, main) {
  return html.replace(/<main[\s\S]*?<\/main>/i, main);
}

function updateMeta(html, { title, description, slug, image = "assets/photos/v1/index-01.webp" }) {
  const canonical = `https://www.territoiresvivantsfrance.fr/${slug}`;
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/i, `<meta property="og:image" content="https://www.territoiresvivantsfrance.fr/${image}" />`);
}

function pageHero(title, status, text, image, alt) {
  return `      <section class="page-hero"><div><span class="page-status">${status}</span><h1>${title}</h1><p>${text}</p></div><img decoding="async" fetchpriority="high" class="page-hero-photo" src="${image}" alt="${alt}" width="1280" height="800" data-france-photo="verified" /></section>\n`;
}

function removePrototypeLanguage(html) {
  return html
    .replace(/Partenaires &agrave; officialiser/g, "Espace partenaires")
    .replace(/Espaces reserves aux futurs partenaires officiels/g, "Acces vers les espaces partenaires")
    .replace(/Logo &agrave; venir/g, "Identit&eacute; &agrave; confirmer")
    .replace(/Fiche &agrave; valider/g, "Fiche de contribution")
    .replace(/Localisation/g, "Territoire")
    .replace(/Type d'engagement/g, "Engagement")
    .replace(/Inscription pr&eacute;par&eacute;e pour une future connexion Supabase\./g, "L'inscription sera activ&eacute;e apr&egrave;s validation du service de communication.")
    .replace(/future connexion Supabase/gi, "connexion s&eacute;curis&eacute;e aux donn&eacute;es")
    .replace(/Future connexion Supabase/g, "Connexion s&eacute;curis&eacute;e aux donn&eacute;es")
    .replace(/en pr&eacute;paration/gi, "selon calendrier de d&eacute;ploiement")
    .replace(/en preparation/gi, "selon calendrier de d&eacute;ploiement")
    .replace(/&Agrave; venir/g, "Selon calendrier")
    .replace(/&agrave; venir/g, "selon calendrier")
    .replace(/\bA venir\b/g, "Selon calendrier")
    .replace(/\b&agrave; officialiser\b/g, "&agrave; confirmer par convention")
    .replace(/partenaires &agrave; officialiser/gi, "partenaires &agrave; confirmer par convention")
    .replace(/futures antennes/g, "antennes planifi&eacute;es")
    .replace(/future antenne/g, "antenne planifi&eacute;e");
}

function softenPrudence(html) {
  return html
    .replace(/TVF ne publie pas de faux r&eacute;sultats\.[^<]+/g, "Les indicateurs TVF sont publi&eacute;s lorsqu'ils sont document&eacute;s, dat&eacute;s et v&eacute;rifiables.")
    .replace(/aucun partenaire, financeur, projet r&eacute;alis&eacute; ou chiffre d&rsquo;impact n&rsquo;est affich&eacute; comme acquis/gi, "les informations publiques distinguent engagements confirm&eacute;s, documents de travail et objectifs")
    .replace(/aucun chiffre d'impact, partenaire ou projet r&eacute;alis&eacute; n'est affich&eacute; sans validation/gi, "les indicateurs, partenaires et projets sont publi&eacute;s apr&egrave;s validation")
    .replace(/aucun chiffre, partenaire ou financeur invent&eacute;/gi, "publication fond&eacute;e sur des informations v&eacute;rifiables")
    .replace(/sans preuve formelle/gi, "sans justificatif formel")
    .replace(/sans preuve/gi, "sans justificatif")
    .replace(/aucun r&eacute;sultat publi&eacute; sans preuve/gi, "r&eacute;sultats publi&eacute;s apr&egrave;s validation");
}

function demoteExcessH2(html) {
  const count = (html.match(/<h2\b/g) || []).length;
  if (count <= 18) return html;
  let seen = 0;
  return html.replace(/<(\/?)h2(\b[^>]*)>/gi, (match, slash, attrs) => {
    if (slash) return seen > 18 ? `</h3>` : match;
    seen += 1;
    return seen > 18 ? `<h3${attrs}>` : match;
  });
}

function addInternalNav(html, file) {
  if (html.includes('class="in-page-nav"')) return html;
  const h2s = [...html.matchAll(/<h2(?:\s+id="([^"]+)")?[^>]*>([\s\S]*?)<\/h2>/gi)].slice(0, 7);
  if (h2s.length < 4) return html;
  const links = [];
  let next = html;
  h2s.forEach((match, index) => {
    const title = stripTags(match[2]);
    const id = match[1] || `section-${file.replace(/\.html$/i, "")}-${index + 1}`;
    if (!match[1]) {
      next = next.replace(match[0], match[0].replace("<h2", `<h2 id="${id}"`));
    }
    links.push(`<a href="#${id}">${title}</a>`);
  });
  const nav = `
      <nav class="in-page-nav" aria-label="Dans cette page">
        <strong>Dans cette page</strong>
        <div>${links.join("")}</div>
      </nav>
`;
  const heroStart = next.search(/<section class="page-hero|<section class="hero|<section class="actions-hero|<section class="actions-hero-premium|<section class="poles-hero/i);
  if (heroStart === -1) return next;
  const heroEnd = findSectionEnd(next, heroStart);
  if (heroEnd === -1) return next;
  return `${next.slice(0, heroEnd)}${nav}${next.slice(heroEnd)}`;
}

function addComparativeTable(html, file) {
  if (html.includes('data-final-comparison="true"')) return html;
  const label = pageTitle(html, file);
  const block = `
      <section class="comparison-module" data-final-comparison="true" aria-labelledby="comparison-${file.replace(/[^a-z0-9]/gi, "-")}">
        <div class="comparison-head"><span class="dossier-kicker">Lecture op&eacute;rationnelle</span><h2 id="comparison-${file.replace(/[^a-z0-9]/gi, "-")}">Comprendre rapidement ${label}</h2></div>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Question</th><th>R&eacute;ponse TVF</th><th>Preuve ou livrable attendu</th></tr></thead><tbody>
          <tr><td>Quel besoin traite la page ?</td><td>Qualifier une situation territoriale avant de proposer une action.</td><td>Fiche de lecture, diagnostic ou formulaire adapt&eacute;.</td></tr>
          <tr><td>Quels acteurs sont concern&eacute;s ?</td><td>Collectivit&eacute;s, propri&eacute;taires, entreprises, associations, financeurs ou citoyens selon le sujet.</td><td>Interlocuteur identifi&eacute;, r&ocirc;le clarifi&eacute;, accord de publication si n&eacute;cessaire.</td></tr>
          <tr><td>Comment passer &agrave; l'action ?</td><td>Documenter le besoin, choisir le parcours, rassembler les pi&egrave;ces et cadrer les responsabilit&eacute;s.</td><td>Fiche projet, convention, budget, calendrier et indicateurs.</td></tr>
        </tbody></table></div>
      </section>
`;
  return insertBefore(html, '<section class="institutional-storyline"', block);
}

function addDocumentDownloads(html) {
  if (html.includes('data-core-downloads="true"')) return html;
  const block = `
      <section class="document-section core-downloads" data-core-downloads="true" id="documents-telechargeables">
        <span class="dossier-kicker">Documents t&eacute;l&eacute;chargeables</span>
        <h2>Les cinq documents essentiels pour pr&eacute;senter ou instruire TVF</h2>
        <p class="lead-block">Ces documents sont des trames de travail modifiables. Ils doivent &ecirc;tre adapt&eacute;s &agrave; chaque situation et valid&eacute;s par les personnes comp&eacute;tentes avant signature ou diffusion officielle.</p>
        <div class="document-grid">
          <article class="document-card"><span class="document-status" data-state="draft">Dossier de pr&eacute;sentation</span><h3>Dossier TVF</h3><p>Pr&eacute;senter l'association, sa m&eacute;thode, ses publics, ses garanties et ses documents de travail.</p><a href="documents/dossier-tvf.md" download>T&eacute;l&eacute;charger</a></article>
          <article class="document-card"><span class="document-status" data-state="draft">Collectivit&eacute;s</span><h3>Fiche collectivit&eacute;</h3><p>Structurer un premier rendez-vous avec une commune, un EPCI, un d&eacute;partement ou une r&eacute;gion.</p><a href="documents/fiche-collectivite.md" download>T&eacute;l&eacute;charger</a></article>
          <article class="document-card"><span class="document-status" data-state="draft">Propri&eacute;taires</span><h3>Fiche propri&eacute;taire</h3><p>Qualifier un bien vacant, les autorisations, les contraintes, l'usage possible et les pi&egrave;ces utiles.</p><a href="documents/fiche-proprietaire.md" download>T&eacute;l&eacute;charger</a></article>
          <article class="document-card"><span class="document-status" data-state="draft">Entreprises</span><h3>Fiche entreprise</h3><p>Cadrer une contribution : mat&eacute;riaux, locaux, comp&eacute;tences, m&eacute;c&eacute;nat ou logistique.</p><a href="documents/fiche-entreprise.md" download>T&eacute;l&eacute;charger</a></article>
          <article class="document-card"><span class="document-status" data-state="draft">Convention</span><h3>Mod&egrave;le de convention</h3><p>Base commune pour formaliser objet, parties, dur&eacute;e, responsabilit&eacute;s, assurances, communication et sortie.</p><a href="documents/modele-convention.md" download>T&eacute;l&eacute;charger</a></article>
        </div>
      </section>
`;
  return insertBefore(html, '<section class="document-section" id="cadre-juridique"', block);
}

function buildKitMediaPage() {
  const base = read("ressources.html");
  const slug = "kit-media.html";
  const title = "Kit m&eacute;dia | Territoires Vivants France";
  const description = "Kit m&eacute;dia TVF : logo, charte graphique, pr&eacute;sentation courte, communiqu&eacute; de presse et visuels officiels utilisables apr&egrave;s validation.";
  const main = `    <main class="dossier-shell">
${pageHero('Kit m&eacute;dia <span>TVF</span>', 'Presse et communication', 'Un espace clair pour comprendre l&rsquo;identit&eacute; de Territoires Vivants France, t&eacute;l&eacute;charger les supports de pr&eacute;sentation et utiliser les &eacute;l&eacute;ments visuels dans un cadre ma&icirc;tris&eacute;.', 'assets/photos/v1/qui-sommes-nous-01.webp', 'R&eacute;union de travail institutionnelle autour d un projet territorial')}
      <nav class="in-page-nav" aria-label="Dans cette page"><strong>Dans cette page</strong><div><a href="#logo">Logo</a><a href="#charte">Charte graphique</a><a href="#presentation">Pr&eacute;sentation</a><a href="#communique">Communiqu&eacute;</a><a href="#visuels">Visuels</a></div></nav>
      <section class="page-wrap media-kit-section" id="logo">
        <span class="dossier-kicker">Logo</span>
        <h2>Identit&eacute; visuelle principale</h2>
        <div class="media-kit-grid">
          <article class="media-brand-card"><img src="assets/logo-territoires-vivants-france.png" alt="Logo Territoires Vivants France" /><p>Le logo TVF doit &ecirc;tre utilis&eacute; sans d&eacute;formation, sans recadrage excessif et avec un contraste suffisant.</p><a class="button secondary" href="assets/logo-territoires-vivants-france.png" download>T&eacute;l&eacute;charger le logo</a></article>
          <article class="document-card"><h3>R&egrave;gles d'usage</h3><p>Ne pas modifier les couleurs, ne pas ajouter d'effet, ne pas l'utiliser sur un fond qui le rend illisible, ne pas associer TVF &agrave; un partenaire sans accord &eacute;crit.</p></article>
        </div>
      </section>
      <section class="page-wrap media-kit-section" id="charte">
        <span class="dossier-kicker">Charte graphique</span>
        <h2>Palette, typographie et ton institutionnel</h2>
        <div class="brand-swatch-grid">
          <article><span style="background:#2E7D32"></span><strong>Vert TVF</strong><small>#2E7D32</small></article>
          <article><span style="background:#071F33"></span><strong>Bleu profond</strong><small>#071F33</small></article>
          <article><span style="background:#E59B16"></span><strong>Accent dor&eacute;</strong><small>#E59B16</small></article>
          <article><span style="background:#FBFCF8"></span><strong>Fond clair</strong><small>#FBFCF8</small></article>
        </div>
      </section>
      <section class="page-wrap media-kit-section" id="presentation">
        <span class="dossier-kicker">Pr&eacute;sentation</span>
        <h2>Texte court r&eacute;utilisable</h2>
        <div class="institutional-callout"><div><p>Territoires Vivants France est une association nationale bas&eacute;e &agrave; Saint-&Eacute;tienne. Elle structure une m&eacute;thode de revitalisation territoriale autour du patrimoine vacant, des commerces ferm&eacute;s, des friches, du r&eacute;emploi des mat&eacute;riaux, de l'insertion et de la mobilisation citoyenne.</p></div><a class="button" href="documents/dossier-tvf.md" download>T&eacute;l&eacute;charger le dossier TVF</a></div>
      </section>
      <section class="page-wrap media-kit-section" id="communique">
        <span class="dossier-kicker">Communiqu&eacute; de presse</span>
        <h2>Trame de communiqu&eacute; &agrave; adapter</h2>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Bloc</th><th>Contenu &agrave; compl&eacute;ter</th></tr></thead><tbody><tr><td>Titre</td><td>Lancement, &eacute;tape territoriale ou publication d'un document TVF.</td></tr><tr><td>Contexte</td><td>Territoire concern&eacute;, besoin public, source des donn&eacute;es et limites.</td></tr><tr><td>Action TVF</td><td>M&eacute;thode, partenaires confirm&eacute;s le cas &eacute;ch&eacute;ant, calendrier et contact.</td></tr><tr><td>Prudence</td><td>Ne publier aucun chiffre d'impact ou soutien non confirm&eacute;.</td></tr></tbody></table></div>
      </section>
      <section class="page-wrap media-kit-section" id="visuels">
        <span class="dossier-kicker">Visuels officiels</span>
        <h2>Photos et illustrations utilisables</h2>
        <div class="document-grid">
          <article class="document-card"><img src="assets/photos/v1/index-01.webp" alt="Saint-Etienne, territoire pilote TVF" /><h3>Territoire pilote</h3><p>Illustrer Saint-&Eacute;tienne et la notion de terrain d'application.</p></article>
          <article class="document-card"><img src="assets/photos/v1/action-materiaux-reemploi-01.webp" alt="Mat&eacute;riaux de r&eacute;emploi" /><h3>R&eacute;emploi</h3><p>Illustrer les ressources et la Banque de Mat&eacute;riaux TVF.</p></article>
          <article class="document-card"><img src="assets/photos/v1/pole-commerce-vivant-01.webp" alt="Commerce de proximit&eacute;" /><h3>Commerce vivant</h3><p>Illustrer les centralit&eacute;s, commerces et rues actives.</p></article>
        </div>
      </section>
    </main>`;
  const html = updateMeta(replaceMain(base, main), { title, description, slug, image: "assets/photos/v1/qui-sommes-nous-01.webp" });
  write(slug, html);
}

function enrichTransparence() {
  let html = read("transparence.html");
  if (!html.includes('id="feuille-route-transparence"')) {
    const block = `
      <section class="document-section" id="feuille-route-transparence">
        <span class="dossier-kicker">Feuille de route de transparence</span>
        <h2>Centraliser ce qui est confirm&eacute;, ce qui est en cours et ce qui reste &agrave; publier</h2>
        <p class="lead-block">Cette section regroupe les informations de d&eacute;ploiement qui ne doivent plus &ecirc;tre r&eacute;p&eacute;t&eacute;es sur l'ensemble du site. Elle distingue les &eacute;l&eacute;ments confirm&eacute;s, les chantiers de structuration et les publications conditionn&eacute;es &agrave; une validation officielle.</p>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Sujet</th><th>Statut de publication</th><th>Condition de mise &agrave; jour</th></tr></thead><tbody>
          <tr><td>Identit&eacute; TVF</td><td>Nom, si&egrave;ge et gouvernance fondatrice pr&eacute;sent&eacute;s sur le site.</td><td>Actualisation apr&egrave;s formalit&eacute;s ou assembl&eacute;e.</td></tr>
          <tr><td>Partenariats</td><td>Aucun organisme n'est pr&eacute;sent&eacute; comme partenaire sans accord.</td><td>Convention, accord de publication et r&ocirc;le d&eacute;crit.</td></tr>
          <tr><td>Indicateurs d'impact</td><td>Les compteurs TVF ne sont pas utilis&eacute;s comme r&eacute;sultats tant qu'ils ne sont pas mesur&eacute;s.</td><td>Donn&eacute;e valid&eacute;e, source, p&eacute;rim&egrave;tre et date.</td></tr>
          <tr><td>Outils num&eacute;riques</td><td>Les formulaires et cartes sont con&ccedil;us pour une connexion s&eacute;curis&eacute;e aux donn&eacute;es.</td><td>Activation technique, tests et politique de protection des donn&eacute;es.</td></tr>
          <tr><td>Documents</td><td>Les trames sont disponibles comme mod&egrave;les de travail.</td><td>Validation juridique, adaptation au cas r&eacute;el et version sign&eacute;e.</td></tr>
        </tbody></table></div>
      </section>
`;
    html = insertBefore(html, '<section class="institutional-storyline"', block);
  }
  html = updateMeta(html, {
    title: "Transparence et feuille de route | TVF",
    description: "Transparence TVF : statut, documents, feuille de route, partenariats, indicateurs, outils et conditions de publication.",
    slug: "transparence.html",
    image: "assets/photos/v1/transparence-01.webp",
  });
  write("transparence.html", html);
}

function strengthenPartenaires() {
  let html = read("partenaires.html");
  if (html.includes('data-partner-reference="true"')) return;
  const block = `
      <section class="partner-reference" data-partner-reference="true" aria-labelledby="partner-reference-title">
        <span class="dossier-kicker">Parcours partenaires</span>
        <h2 id="partner-reference-title">Un cadre clair pour coop&eacute;rer sans ambigu&iuml;t&eacute;</h2>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Public</th><th>Contribution possible</th><th>Cadre attendu</th><th>B&eacute;n&eacute;fice territorial</th></tr></thead><tbody>
          <tr><td>Collectivit&eacute;</td><td>Donn&eacute;es, biens, espaces, relais locaux, animation.</td><td>Convention de coop&eacute;ration, objectifs, livrables et calendrier.</td><td>Diagnostic, projets plus lisibles, indicateurs, mobilisation locale.</td></tr>
          <tr><td>Entreprise</td><td>Mat&eacute;riaux, comp&eacute;tences, locaux, logistique, m&eacute;c&eacute;nat.</td><td>Tra&ccedil;abilit&eacute;, s&eacute;curit&eacute;, affectation, communication responsable.</td><td>RSE concr&egrave;te, r&eacute;emploi, ancrage local, impact document&eacute;.</td></tr>
          <tr><td>Association</td><td>Besoins, b&eacute;n&eacute;volat, animation, publics accompagn&eacute;s.</td><td>R&ocirc;les, assurance, protection des personnes, suivi des missions.</td><td>Acc&egrave;s &agrave; des lieux, ressources et coop&eacute;rations utiles.</td></tr>
          <tr><td>Financeur</td><td>Don, m&eacute;c&eacute;nat, investissement &agrave; impact, expertise.</td><td>Fiche projet, budget, affectation, reporting et preuves.</td><td>Financer un projet territorial qualifi&eacute; et mesurable.</td></tr>
        </tbody></table></div>
      </section>
`;
  html = insertBefore(html, '<section class="institutional-storyline"', block);
  write("partenaires.html", html);
}

function strengthenMethod() {
  let html = read("notre-methode.html");
  if (html.includes('data-method-reference="true"')) return;
  const block = `
      <section class="method-reference" data-method-reference="true" aria-labelledby="method-reference-title">
        <span class="dossier-kicker">M&eacute;thodologie TVF</span>
        <h2 id="method-reference-title">Une cha&icirc;ne d'action lisible, de l'alerte au suivi</h2>
        <div class="method-timeline">
          <article><span>1</span><h3>Rep&eacute;rer</h3><p>Adresse, photo, besoin local, ressource, acteur concern&eacute;.</p></article>
          <article><span>2</span><h3>Qualifier</h3><p>Propri&eacute;t&eacute;, faisabilit&eacute;, s&eacute;curit&eacute;, donn&eacute;es, contraintes.</p></article>
          <article><span>3</span><h3>Prioriser</h3><p>Utilit&eacute; territoriale, urgence, moyens, risques, partenaires.</p></article>
          <article><span>4</span><h3>Conventionner</h3><p>Objet, dur&eacute;e, r&ocirc;les, assurances, communication, sortie.</p></article>
          <article><span>5</span><h3>Mobiliser</h3><p>Financements, mat&eacute;riaux, comp&eacute;tences, b&eacute;n&eacute;voles, entreprises.</p></article>
          <article><span>6</span><h3>Suivre</h3><p>Indicateurs, preuves, bilan, enseignements, publication autoris&eacute;e.</p></article>
        </div>
      </section>
`;
  html = insertBefore(html, '<section class="institutional-storyline"', block);
  write("notre-methode.html", html);
}

function strengthenFaq() {
  let html = read("faq.html");
  if (html.includes('data-faq-profiled="true"')) return;
  const block = `
      <section class="profiled-faq" data-faq-profiled="true" aria-labelledby="profiled-faq-title">
        <span class="dossier-kicker">Par profils</span>
        <h2 id="profiled-faq-title">Les r&eacute;ponses essentielles selon votre r&ocirc;le</h2>
        <div class="faq-profile-grid">
          <article><h3>Collectivit&eacute;</h3><p>TVF peut aider &agrave; organiser un diagnostic, une cartographie, une fiche projet, une convention et des indicateurs territoriaux.</p><a href="espace-collectivites.html">Voir le parcours</a></article>
          <article><h3>Propri&eacute;taire</h3><p>Le propri&eacute;taire conserve son bien. Toute remise en usage doit &ecirc;tre cadr&eacute;e par diagnostic, autorisation et convention.</p><a href="proprietaires.html">Voir le parcours</a></article>
          <article><h3>Entreprise</h3><p>Une entreprise peut contribuer par mat&eacute;riaux, comp&eacute;tences, locaux, m&eacute;c&eacute;nat ou logistique avec tra&ccedil;abilit&eacute;.</p><a href="espace-entreprises.html">Voir le parcours</a></article>
          <article><h3>Financeur</h3><p>Un financement doit &ecirc;tre rattach&eacute; &agrave; un projet, un budget, un calendrier, des preuves et un reporting.</p><a href="financer-projets.html">Voir le parcours</a></article>
          <article><h3>Citoyen</h3><p>Un citoyen peut signaler un lieu, proposer une ressource, rejoindre une mission ou aider &agrave; documenter un besoin.</p><a href="signalement.html">Signaler</a></article>
        </div>
      </section>
`;
  html = insertBefore(html, "</main>", block);
  write("faq.html", html);
}

function strengthenNosActions() {
  let html = read("nos-actions.html");
  if (html.includes('data-actions-comparison="true"')) return;
  const block = `
      <section class="actions-reference-table" data-actions-comparison="true" aria-labelledby="actions-reference-title">
        <span class="dossier-kicker">Synth&egrave;se op&eacute;rationnelle</span>
        <h2 id="actions-reference-title">Les actions TVF, leurs publics et leurs livrables</h2>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Action</th><th>Public prioritaire</th><th>Livrable attendu</th><th>Passage &agrave; l'action</th></tr></thead><tbody>
          <tr><td>Logements vacants</td><td>Propri&eacute;taires, communes, habitants</td><td>Fiche bien, diagnostic, sc&eacute;nario d'usage</td><td><a href="action-logements-vacants.html">Voir l'action</a></td></tr>
          <tr><td>Commerces inoccup&eacute;s</td><td>Collectivit&eacute;s, propri&eacute;taires, porteurs locaux</td><td>Fiche local, usage possible, contraintes</td><td><a href="action-commerces-inoccupes.html">Voir l'action</a></td></tr>
          <tr><td>Mat&eacute;riaux de r&eacute;emploi</td><td>Entreprises, collectivit&eacute;s, particuliers</td><td>Fiche ressource, &eacute;tat, quantit&eacute;, affectation</td><td><a href="action-materiaux-reemploi.html">Voir l'action</a></td></tr>
          <tr><td>Espaces abandonn&eacute;s</td><td>Collectivit&eacute;s, associations, habitants</td><td>Fiche site, risques, propri&eacute;t&eacute;, usage compatible</td><td><a href="action-espaces-abandonnes.html">Voir l'action</a></td></tr>
          <tr><td>Solidarit&eacute; & insertion</td><td>B&eacute;n&eacute;voles, associations, structures d'insertion</td><td>Mission, encadrement, assurance, suivi</td><td><a href="action-solidarite-insertion.html">Voir l'action</a></td></tr>
        </tbody></table></div>
      </section>
`;
  html = insertBefore(html, '<section class="institutional-storyline"', block);
  write("nos-actions.html", html);
}

function updateSitemapAndArchitecture() {
  let arch = fs.readFileSync(publicPath, "utf8");
  if (!arch.includes("- kit-media.html")) {
    arch = arch.replace("- ressources.html\n", "- ressources.html\n- kit-media.html\n");
    fs.writeFileSync(publicPath, arch, "utf8");
  }
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes("<loc>https://www.territoiresvivantsfrance.fr/kit-media.html</loc>")) {
    sitemap = sitemap.replace("</urlset>", "  <url><loc>https://www.territoiresvivantsfrance.fr/kit-media.html</loc></url>\n</urlset>");
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
  }
}

let changed = [];
for (const file of htmlFiles) {
  let html = read(file);
  const before = html;
  html = removePrototypeLanguage(html);
  html = softenPrudence(html);
  if (!["index.html", "contact.html", "faq.html"].includes(file)) {
    html = demoteExcessH2(html);
    html = addInternalNav(html, file);
  }
  if (/action-|pole-|banque-materiaux|bien-solidaire|signalement|proprietaires|espace-|financer|partenaires/.test(file)) {
    html = addComparativeTable(html, file);
  }
  html = normalize(html);
  if (html !== before) {
    write(file, html);
    changed.push(file);
  }
}

buildKitMediaPage();
enrichTransparence();
strengthenPartenaires();
strengthenMethod();
strengthenFaq();
strengthenNosActions();
let docs = read("documents-officiels.html");
const docsBefore = docs;
docs = addDocumentDownloads(docs);
if (docs !== docsBefore) write("documents-officiels.html", docs);
updateSitemapAndArchitecture();

console.log(JSON.stringify({ changed: changed.length, files: changed, added: ["kit-media.html"], updatedCorePages: ["transparence.html", "partenaires.html", "notre-methode.html", "faq.html", "nos-actions.html", "documents-officiels.html"] }, null, 2));
