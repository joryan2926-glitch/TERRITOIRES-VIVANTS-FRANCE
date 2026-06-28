const fs = require("fs");

function extract(file, pattern, label) {
  const source = fs.readFileSync(file, "utf8");
  const match = source.match(pattern);
  if (!match) throw new Error(`Missing ${label} in ${file}`);
  return match[0];
}

const header = extract("index.html", /<header class="site-header"[\s\S]*?<\/header>/, "header");
const footer = extract("index.html", /<footer class="site-footer"[\s\S]*?<\/footer>/, "footer");

const breadcrumb = `<nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span><span>Association</span><span class="breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">Ce que fait TVF</span></nav>`;
const structuredData = `<script id="global-structured-data" type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.territoiresvivantsfrance.fr/#organization","name":"Territoires Vivants France","url":"https://www.territoiresvivantsfrance.fr/","logo":"https://www.territoiresvivantsfrance.fr/assets/logo-territoires-vivants-france.png","address":{"@type":"PostalAddress","streetAddress":"25 rue Elise Gervais","postalCode":"42000","addressLocality":"Saint-Etienne","addressCountry":"FR"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.territoiresvivantsfrance.fr/"},{"@type":"ListItem","position":2,"name":"Association","item":"https://www.territoiresvivantsfrance.fr/qui-sommes-nous.html"},{"@type":"ListItem","position":3,"name":"Ce que fait TVF","item":"https://www.territoiresvivantsfrance.fr/ce-que-fait-tvf.html"}]}]}</script>`;

const main = `    <main class="differentiation-page" data-professional-enrichment="public-page">
      <section class="actions-hero-premium differentiation-hero">
        <img decoding="async" fetchpriority="high" src="assets/photos/saint-etienne-design.jpg" alt="R&eacute;union de coordination entre collectivit&eacute;, association et acteurs territoriaux" width="1800" height="1200" />
        <div class="actions-hero-overlay">
          <span class="page-status" data-status="public">Positionnement strat&eacute;gique</span>
          <h1>Ce que fait TERRITOIRES VIVANTS FRANCE</h1>
          <p>TVF organise la rencontre entre ressources inutilis&eacute;es, besoins locaux et acteurs capables d'agir, afin de transformer des biens vacants ou des mat&eacute;riaux disponibles en projets utiles.</p>
          <div class="actions-hero-buttons">
            <a class="button primary" href="#schema-tvf">Voir le sch&eacute;ma</a>
            <a class="button secondary" href="#comparatif">Comparer les r&ocirc;les</a>
          </div>
        </div>
      </section>

      <section id="role-tvf" class="actions-intro-panel differentiation-intro" aria-labelledby="role-title">
        <div>
          <span class="dossier-kicker">Notre diff&eacute;rence</span>
          <h2 id="role-title">Une fonction de coordination au service des projets locaux</h2>
          <p>Les outils publics, techniques et financiers existent d&eacute;j&agrave;, mais ils ne se rencontrent pas toujours au bon moment. TVF intervient dans cet espace de coordination : elle aide &agrave; passer d'une information isol&eacute;e &agrave; un dossier compr&eacute;hensible, partageable et suivi.</p>
          <p>La m&eacute;thode reste volontairement prudente : observer une situation, qualifier le besoin, identifier les acteurs concern&eacute;s, pr&eacute;parer un cadre de coop&eacute;ration, orienter les ressources disponibles et documenter les r&eacute;sultats r&eacute;els.</p>
        </div>
        <div class="actions-proof-card">
          <strong>Positionnement</strong>
          <p>TVF agit en compl&eacute;ment des acteurs existants. L'association ne revendique aucun mandat, financement ou partenariat officiel sans validation formelle.</p>
        </div>
      </section>

      <section id="schema-tvf" class="coordination-diagram-section" aria-labelledby="schema-title">
        <span class="dossier-kicker">Lecture rapide</span>
        <h2 id="schema-title">Du parcours fragment&eacute; &agrave; la coordination territoriale</h2>
        <div class="coordination-diagram">
          <div class="diagram-column">
            <h3>Aujourd'hui : des d&eacute;marches s&eacute;par&eacute;es</h3>
            <ul>
              <li>Un propri&eacute;taire ne sait pas vers qui se tourner.</li>
              <li>Une collectivit&eacute; manque parfois de temps d'ing&eacute;nierie.</li>
              <li>Une entreprise dispose de mat&eacute;riaux sans projet local identifi&eacute;.</li>
              <li>Une association cherche un lieu ou des ressources.</li>
              <li>Un financeur demande un dossier structur&eacute; et suivi.</li>
            </ul>
            <p>Le risque : des biens restent vacants, des mat&eacute;riaux sont perdus et des projets utiles n'aboutissent pas.</p>
          </div>
          <div class="diagram-hub">
            <span>TVF</span>
            <strong>Relie</strong>
          </div>
          <div class="diagram-column is-positive">
            <h3>Avec TVF : un cadre commun</h3>
            <ul>
              <li>Observation et qualification des besoins.</li>
              <li>Mise en relation des acteurs concern&eacute;s.</li>
              <li>Convention de coop&eacute;ration ou d'usage.</li>
              <li>Affectation des ressources &agrave; des projets valid&eacute;s.</li>
              <li>Suivi des &eacute;tapes, preuves et indicateurs.</li>
            </ul>
            <p>L'objectif est simple : transformer une ressource dormante en utilit&eacute; locale mesurable.</p>
          </div>
        </div>
      </section>

      <section class="differentiation-ecosystem" aria-labelledby="ecosystem-title">
        <span class="dossier-kicker">Ce que TVF coordonne</span>
        <h2 id="ecosystem-title">Six fonctions utiles au terrain</h2>
        <div class="differentiation-grid">
          <article><strong>Observer</strong><p>Rep&eacute;rer logements vacants, commerces ferm&eacute;s, friches, terrains inutilis&eacute;s et ressources de r&eacute;emploi.</p></article>
          <article><strong>Qualifier</strong><p>V&eacute;rifier l'&eacute;tat, les contraintes, les risques, les besoins locaux et les conditions d'un projet r&eacute;aliste.</p></article>
          <article><strong>Mobiliser</strong><p>Relier propri&eacute;taires, collectivit&eacute;s, associations, entreprises, artisans, b&eacute;n&eacute;voles, m&eacute;c&egrave;nes et financeurs.</p></article>
          <article><strong>Conventionner</strong><p>Pr&eacute;parer des cadres clairs : usage partag&eacute;, valorisation de ressources, responsabilit&eacute;s, dur&eacute;e et suivi.</p></article>
          <article><strong>Orienter</strong><p>Affecter les mat&eacute;riaux et contributions &agrave; des projets utiles, valid&eacute;s et document&eacute;s, sans distribution automatique.</p></article>
          <article><strong>Mesurer</strong><p>Publier uniquement des r&eacute;sultats r&eacute;els : signalements qualifi&eacute;s, biens accompagn&eacute;s, mat&eacute;riaux r&eacute;employ&eacute;s, projets suivis.</p></article>
        </div>
      </section>

      <section id="comparatif" class="differentiation-comparison" aria-labelledby="comparison-title">
        <span class="dossier-kicker">Compl&eacute;mentarit&eacute;</span>
        <h2 id="comparison-title">TVF est compl&eacute;mentaire des grands acteurs publics et techniques</h2>
        <table class="stat-comparison">
          <thead><tr><th>Acteur ou dispositif</th><th>Champ principal</th><th>Apport sp&eacute;cifique de TVF</th></tr></thead>
          <tbody>
            <tr><th>ANRU</th><td>Renouvellement urbain dans le cadre de programmes d&eacute;di&eacute;s.</td><td>TVF peut traiter des situations plus diffuses : un logement, un local, une ressource, une friche ou un besoin associatif &agrave; qualifier localement.</td></tr>
            <tr><th>Banque des Territoires</th><td>Financement, investissement et accompagnement territorial.</td><td>TVF aide &agrave; documenter le besoin, structurer le projet et relier les contributeurs avant toute demande de financement confirm&eacute;e.</td></tr>
            <tr><th>Cerema</th><td>Expertise publique, donn&eacute;es et ing&eacute;nierie technique.</td><td>TVF n'est pas un bureau d'&eacute;tudes public : elle organise la coop&eacute;ration de terrain et le passage du signalement au projet.</td></tr>
            <tr><th>ADEME</th><td>Transition &eacute;cologique, d&eacute;chets, &eacute;nergie et &eacute;conomie circulaire.</td><td>TVF applique le r&eacute;emploi &agrave; des usages territoriaux concrets : b&acirc;timents, chantiers, associations, formation et suivi.</td></tr>
            <tr><th>ANCT</th><td>Coh&eacute;sion territoriale et accompagnement des collectivit&eacute;s.</td><td>TVF agit comme plateforme associative de mise en relation entre habitants, propri&eacute;taires, entreprises, associations et collectivit&eacute;s.</td></tr>
          </tbody>
        </table>
        <p class="source-note">Cette comparaison situe les champs d'action. Elle ne pr&eacute;sente aucun mandat, financement ou partenariat officiel non confirm&eacute;.</p>
      </section>

      <section class="doc-section compact" aria-labelledby="aller-plus-loin">
        <span class="doc-kicker">Aller plus loin</span>
        <h2 id="aller-plus-loin">O&ugrave; retrouver ce positionnement dans le site&nbsp;?</h2>
        <div class="dossier-grid">
          <article class="dossier-card"><h3>Notre m&eacute;thode</h3><p>Pour comprendre les &eacute;tapes : identifier, cartographier, mobiliser, conventionner, mettre en oeuvre et mesurer.</p><a class="text-link" href="notre-methode.html">Voir la m&eacute;thode</a></article>
          <article class="dossier-card"><h3>Dossier Saint-&Eacute;tienne</h3><p>Pour voir comment TVF applique cette logique &agrave; un premier territoire pilote avec des donn&eacute;es et besoins locaux.</p><a class="text-link" href="dossier-saint-etienne.html">Voir le dossier</a></article>
          <article class="dossier-card"><h3>Banque de Mat&eacute;riaux</h3><p>Pour comprendre pourquoi les ressources ne sont pas distribu&eacute;es librement mais affect&eacute;es &agrave; des projets valid&eacute;s.</p><a class="text-link" href="banque-materiaux.html">Voir le dispositif</a></article>
        </div>
      </section>
    </main>`;

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ce que fait TVF | TERRITOIRES VIVANTS FRANCE</title>
    <meta name="description" content="Comprendre le r&ocirc;le de Territoires Vivants France : une plateforme nationale de coordination qui relie biens vacants, mat&eacute;riaux, propri&eacute;taires, collectivit&eacute;s et acteurs locaux." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.territoiresvivantsfrance.fr/ce-que-fait-tvf.html" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:site_name" content="TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:title" content="Ce que fait TVF | TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:description" content="TVF ne remplace pas les dispositifs existants : elle relie les acteurs, les ressources et les usages pour redonner vie aux territoires." />
    <meta property="og:url" content="https://www.territoiresvivantsfrance.fr/ce-que-fait-tvf.html" />
    <meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/saint-etienne-design.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#3f7115" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
    <link rel="manifest" href="site.webmanifest" />
    <link rel="stylesheet" href="styles.css" />
    ${structuredData}
  </head>
  <body>
    ${header}
    ${breadcrumb}
${main}
    ${footer}
    <script defer src="navigation.js"></script>
  </body>
</html>
`;

fs.writeFileSync("ce-que-fait-tvf.html", html, "utf8");
console.log("ce-que-fait-tvf.html rebuilt");
