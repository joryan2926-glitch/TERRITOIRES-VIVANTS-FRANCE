const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicArchitecturePath = path.join(root, "PUBLIC_ARCHITECTURE.md");
const publicPages = [...fs.readFileSync(publicArchitecturePath, "utf8").matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]);
const newPage = "ce-que-fait-tvf.html";

const sourceLinks = [
  ["ANRU", "https://www.anru.fr/"],
  ["Banque des Territoires", "https://www.banquedesterritoires.fr/"],
  ["Cerema", "https://www.cerema.fr/fr/cerema"],
  ["ADEME", "https://www.ademe.fr/"],
  ["ANCT", "https://agence-cohesion-territoires.gouv.fr/"],
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function extract(file, pattern, label) {
  const match = read(file).match(pattern);
  if (!match) throw new Error(`Missing ${label} in ${file}`);
  return match[0];
}

const base = read("index.html");
let header = extract("index.html", /<header class="site-header"[\s\S]*?<\/header>/, "header");
const footer = extract("index.html", /<footer class="site-footer"[\s\S]*?<\/footer>/, "footer");

const associationMenuLink = `<a class="mega-link" href="ce-que-fait-tvf.html"><span class="mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h5l3-6 3 12 3-6h2"/><circle cx="12" cy="12" r="9"/></svg></span><span class="mega-copy"><strong>Ce que fait TVF</strong><small>La valeur ajoutée d'une plateforme de coordination.</small></span></a>`;

function addAssociationLink(html) {
  if (html.includes('href="ce-que-fait-tvf.html"')) return html;
  return html.replace(
    /(<a class="mega-link" href="pourquoi-tvf-existe\.html"[\s\S]*?<\/a>)/,
    `$1${associationMenuLink}`,
  );
}

header = addAssociationLink(header);

const breadcrumb = `<nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span><span>Association</span><span class="breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">Ce que fait TVF</span></nav>`;

const differenceBlock = `<section class="tvf-difference-section" id="pourquoi-territoires-vivants-france" data-strategic-differentiation="true">
        <div class="tvf-difference-copy">
          <span class="dossier-kicker">Pourquoi TERRITOIRES VIVANTS FRANCE ?</span>
          <h2>Une plateforme nationale de coordination, pas un dispositif isolé</h2>
          <p>TVF ne remplace pas les acteurs publics, techniques ou financiers existants. Son rôle est de relier les particuliers, propriétaires, entreprises, artisans, associations, collectivités, fondations, mécènes, investisseurs et bénévoles autour d'un même objectif : redonner vie aux bâtiments, commerces, terrains, matériaux et territoires.</p>
          <p>Aujourd'hui, les expertises existent mais restent souvent dispersées : rénovation urbaine, financement, ingénierie, transition écologique, accompagnement des collectivités, mobilisation citoyenne et réemploi. TVF propose une méthode de coordination pour transformer ces ressources séparées en projets locaux suivis.</p>
          <a class="button primary" href="ce-que-fait-tvf.html">Comprendre la différence TVF</a>
        </div>
        <div class="tvf-difference-graphic" aria-label="Schéma de coordination TVF">
          <div class="fragmented-model">
            <strong>Aujourd'hui</strong>
            <span>Particuliers → interlocuteur A</span>
            <span>Collectivités → interlocuteur B</span>
            <span>Entreprises → interlocuteur C</span>
            <span>Matériaux → filière séparée</span>
            <span>Patrimoine → dossier isolé</span>
          </div>
          <div class="tvf-hub-model">
            <strong>Avec TVF</strong>
            <span>Plateforme nationale unique de coordination</span>
            <small>Observation, qualification, conventions, ressources, partenariats, suivi et impact.</small>
          </div>
        </div>
      </section>`;

const pageMain = `    <main class="differentiation-page" data-professional-enrichment="public-page">
      <section class="actions-hero-premium differentiation-hero">
        <img decoding="async" fetchpriority="high" src="assets/photos/institutional-meeting.jpg" alt="Réunion de coordination entre acteurs territoriaux autour d'un projet local" width="1800" height="1200" />
        <div class="actions-hero-overlay">
          <span class="page-status" data-status="public">Positionnement stratégique</span>
          <h1>Ce que fait TERRITOIRES VIVANTS FRANCE</h1>
          <p>TVF est une plateforme nationale de coordination de la revitalisation territoriale. Elle ne remplace pas les dispositifs existants : elle les relie, les rend lisibles et organise le passage d'une ressource inutilisée à un projet utile.</p>
          <div class="actions-hero-buttons">
            <a class="button primary" href="#comparatif">Voir le comparatif</a>
            <a class="button secondary" href="#schema-tvf">Voir le schéma</a>
          </div>
        </div>
      </section>

      <section class="actions-intro-panel differentiation-intro" aria-labelledby="difference-intro-title">
        <div>
          <span class="dossier-kicker">Notre différence</span>
          <h2 id="difference-intro-title">Réunir dans une même méthode ce qui est habituellement séparé</h2>
          <p>Les politiques publiques, l'ingénierie territoriale, le financement, la transition écologique et l'action citoyenne existent déjà. Le problème n'est donc pas l'absence totale d'acteurs : c'est la difficulté à relier les propriétaires, les collectivités, les ressources disponibles, les financements, les bénévoles et les usages concrets dans un parcours unique.</p>
          <p>TVF se positionne comme un écosystème national de coordination : observation du patrimoine vacant, mobilisation des propriétaires, réemploi des matériaux, revitalisation des commerces, appui aux collectivités, conventions d'occupation, projets solidaires, partenariats publics/privés, outils numériques de suivi et indicateurs d'impact.</p>
        </div>
        <div class="actions-proof-card">
          <strong>Ce que TVF n'affirme pas</strong>
          <p>TVF ne se présente pas comme l'ANRU, la Banque des Territoires, le Cerema, l'ADEME ou l'ANCT. La plateforme est complémentaire : elle oriente, coordonne, documente et prépare les dossiers locaux.</p>
        </div>
      </section>

      <section id="schema-tvf" class="coordination-diagram-section" aria-labelledby="schema-title">
        <span class="dossier-kicker">Schéma de coordination</span>
        <h2 id="schema-title">D'une action dispersée à une plateforme reliée</h2>
        <div class="coordination-diagram">
          <div class="diagram-column">
            <h3>Aujourd'hui : parcours fragmentés</h3>
            <ul>
              <li>Particuliers → organisme A</li>
              <li>Collectivités → organisme B</li>
              <li>Entreprises → organisme C</li>
              <li>Associations → organisme D</li>
              <li>Matériaux → organisme E</li>
              <li>Patrimoine → organisme F</li>
            </ul>
            <p>Résultat fréquent : informations dispersées, responsabilités difficiles à lire, ressources non reliées et suivi d'impact incomplet.</p>
          </div>
          <div class="diagram-hub">
            <span>TVF</span>
            <strong>Coordonne</strong>
          </div>
          <div class="diagram-column is-positive">
            <h3>Avec TVF : plateforme nationale</h3>
            <ul>
              <li>Observation et qualification des biens</li>
              <li>Mobilisation des propriétaires</li>
              <li>Réemploi orienté vers les projets validés</li>
              <li>Conventions d'usage et partenariats</li>
              <li>Participation citoyenne et bénévolat</li>
              <li>Suivi numérique et indicateurs d'impact</li>
            </ul>
            <p>Objectif : transformer les ressources abandonnées en projets utiles, sans inventer de résultats ni de partenaires.</p>
          </div>
        </div>
      </section>

      <section id="comparatif" class="differentiation-comparison" aria-labelledby="comparison-title">
        <span class="dossier-kicker">Complémentarité institutionnelle</span>
        <h2 id="comparison-title">Ce que fait TVF, en complément des acteurs existants</h2>
        <table class="stat-comparison">
          <thead><tr><th>Acteur / approche</th><th>Champ principal</th><th>Ce que TVF ajoute</th></tr></thead>
          <tbody>
            <tr><th>ANRU</th><td>Renouvellement urbain et transformation de quartiers dans le cadre de programmes dédiés.</td><td>TVF peut repérer et coordonner des situations plus diffuses : logements, locaux, matériaux, friches et acteurs citoyens hors logique de grand programme.</td></tr>
            <tr><th>Banque des Territoires</th><td>Financement, accompagnement et investissement au service des territoires.</td><td>TVF prépare les dossiers locaux, relie les contributeurs et documente les besoins avant toute recherche de financement confirmée.</td></tr>
            <tr><th>Cerema</th><td>Expertise publique, ingénierie, données et accompagnement technique des territoires.</td><td>TVF n'est pas un bureau d'études public : elle organise la coopération terrain, les signalements, les ressources, les conventions et les parcours citoyens.</td></tr>
            <tr><th>ADEME</th><td>Transition écologique, énergie, déchets, économie circulaire et appui aux politiques environnementales.</td><td>TVF applique une logique de réemploi dans des projets locaux concrets : matériaux, bâtiments, usages, bénévolat et suivi territorial.</td></tr>
            <tr><th>ANCT</th><td>Accompagnement des collectivités et cohésion territoriale à travers des programmes nationaux.</td><td>TVF agit comme plateforme associative de mise en relation entre habitants, propriétaires, entreprises, associations et collectivités.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="differentiation-ecosystem" aria-labelledby="ecosystem-title">
        <span class="dossier-kicker">Écosystème TVF</span>
        <h2 id="ecosystem-title">Une même plateforme pour dix fonctions complémentaires</h2>
        <div class="differentiation-grid">
          <article><strong>Observer</strong><p>Identifier logements vacants, commerces fermés, bâtiments abandonnés, friches et matériaux disponibles.</p></article>
          <article><strong>Qualifier</strong><p>Vérifier statut, risques, contraintes techniques, accord des parties et utilité territoriale.</p></article>
          <article><strong>Connecter</strong><p>Relier propriétaires, collectivités, entreprises, associations, artisans, bénévoles et financeurs.</p></article>
          <article><strong>Conventionner</strong><p>Préparer des cadres clairs : occupation, usage partagé, valorisation de ressources, responsabilités.</p></article>
          <article><strong>Réemployer</strong><p>Orienter les matériaux vers des projets validés plutôt que vers une distribution automatique.</p></article>
          <article><strong>Suivre</strong><p>Documenter les étapes, les décisions, les ressources mobilisées et les indicateurs réels.</p></article>
        </div>
      </section>

      <section class="doc-section compact" aria-labelledby="sources-difference">
        <span class="doc-kicker">Sources de positionnement</span>
        <h2 id="sources-difference">Des acteurs reconnus, une approche TVF complémentaire</h2>
        <p>Les références ci-dessous servent à situer les champs d'intervention des organismes existants. TVF ne revendique aucun mandat, partenariat ou financement de leur part sans confirmation officielle.</p>
        <div class="source-list"><strong>Sources citées</strong>${sourceLinks.map(([label, href]) => `<span><a href="${href}" rel="noopener" target="_blank">${label}</a></span>`).join("")}</div>
      </section>
    </main>`;

const pageHtml = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ce que fait TVF | TERRITOIRES VIVANTS FRANCE</title>
    <meta name="description" content="Comprendre la valeur ajoutée de Territoires Vivants France : une plateforme nationale de coordination de la revitalisation territoriale, complémentaire des acteurs publics existants." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.territoiresvivantsfrance.fr/ce-que-fait-tvf.html" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:site_name" content="TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:title" content="Ce que fait TVF | TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:description" content="TVF coordonne les acteurs, les ressources et les usages pour redonner vie aux bâtiments, commerces, terrains, matériaux et territoires." />
    <meta property="og:url" content="https://www.territoiresvivantsfrance.fr/ce-que-fait-tvf.html" />
    <meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/institutional-meeting.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#3f7115" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
    <link rel="manifest" href="site.webmanifest" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    ${header}
    ${breadcrumb}
${pageMain}
    ${footer}
    <script defer src="navigation.js"></script>
  </body>
</html>
`;

write(newPage, pageHtml);

const allHtmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
for (const file of allHtmlFiles) {
  let html = read(file);
  html = addAssociationLink(html);
  if (file !== newPage && publicPages.includes(file) && !html.includes('data-strategic-differentiation="true"')) {
    html = html.replace(/<\/main>/i, `${differenceBlock}\n    </main>`);
  }
  write(file, html);
}

if (!publicPages.includes(newPage)) {
  const updatedPages = [...publicPages];
  const insertAfter = updatedPages.indexOf("pourquoi-tvf-existe.html");
  updatedPages.splice(insertAfter + 1, 0, newPage);
  const publicArchitecture = `# Architecture publique TVF

Mise a jour : 25 juin 2026.

- Pages publiques indexables : ${updatedPages.length}
- Anciennes URL redirigees : 41
- Autres pages : interfaces internes, techniques ou evolutions futures en noindex.

## Pages publiques

${updatedPages.map((file) => `- ${file}`).join("\n")}
`;
  write("PUBLIC_ARCHITECTURE.md", publicArchitecture);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${updatedPages
  .map((file) => {
    const loc = file === "index.html" ? "https://www.territoiresvivantsfrance.fr/" : `https://www.territoiresvivantsfrance.fr/${file}`;
    const priority = file === "index.html" ? "1.0" : ["observatoire-national.html", "dossier-saint-etienne.html", "nos-actions.html", "nos-poles.html", "ce-que-fait-tvf.html", "banque-materiaux.html"].includes(file) ? "0.9" : "0.7";
    return `  <url><loc>${loc}</loc><lastmod>2026-06-25</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n")}
</urlset>
`;
  write("sitemap.xml", sitemap);
}

const rationalizePath = path.join(root, "scripts", "rationalize-public-site.js");
let rationalize = fs.readFileSync(rationalizePath, "utf8");
if (!rationalize.includes(`"${newPage}"`)) {
  rationalize = rationalize.replace(`  "pourquoi-tvf-existe.html",`, `  "pourquoi-tvf-existe.html",\n  "${newPage}",`);
  rationalize = rationalize.replace(`  "pourquoi-tvf-existe.html": ["Association", "Pourquoi TVF existe"],`, `  "pourquoi-tvf-existe.html": ["Association", "Pourquoi TVF existe"],\n  "${newPage}": ["Association", "Ce que fait TVF"],`);
}
fs.writeFileSync(rationalizePath, rationalize, "utf8");

console.log(JSON.stringify({ updated: true, publicPage: newPage, publicPages: publicPages.includes(newPage) ? publicPages.length : publicPages.length + 1 }, null, 2));
