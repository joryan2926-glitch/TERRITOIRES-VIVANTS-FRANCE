const fs = require("fs");
const path = require("path");

const root = process.cwd();
const today = "2026-06-25";
const impactPage = "etude-impact-saint-etienne.html";
const sourcesPage = "sources-etude-saint-etienne.html";

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function extractBetween(html, startRe, endRe) {
  const start = html.search(startRe);
  const end = html.search(endRe);
  if (start < 0 || end < 0 || end <= start) throw new Error("Unable to extract template part");
  return html.slice(start, end);
}

const indexHtml = read("index.html");
let header = extractBetween(indexHtml, /<header class="site-header">/i, /<nav class="breadcrumb"|<main/i);
const footer = indexHtml.match(/<footer[\s\S]*?<\/footer>/i)?.[0] || "";

function addObservatoryLinks(html) {
  if (!html.includes(impactPage)) {
    html = html.replace(
      /(<a class="mega-link" href="dossier-saint-etienne\.html">[\s\S]*?<\/a>)/,
      `$1<a class="mega-link" href="${impactPage}"><span class="mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-7"/></svg></span><span class="mega-copy"><strong>&Eacute;tude d'impact Saint-&Eacute;tienne</strong><small>Donn&eacute;es, projections et indicateurs de suivi.</small></span></a><a class="mega-link" href="${sourcesPage}"><span class="mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14v14H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg></span><span class="mega-copy"><strong>Sources Saint-&Eacute;tienne</strong><small>Registre des donn&eacute;es officielles mobilis&eacute;es.</small></span></a>`
    );
  }
  return html;
}

header = addObservatoryLinks(header);

function structuredData(title, file) {
  return `<script id="global-structured-data" type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.territoiresvivantsfrance.fr/#organization","name":"Territoires Vivants France","url":"https://www.territoiresvivantsfrance.fr/","logo":"https://www.territoiresvivantsfrance.fr/assets/logo-territoires-vivants-france.png","address":{"@type":"PostalAddress","streetAddress":"25 rue Elise Gervais","postalCode":"42000","addressLocality":"Saint-Etienne","addressCountry":"FR"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.territoiresvivantsfrance.fr/"},{"@type":"ListItem","position":2,"name":"Observatoire","item":"https://www.territoiresvivantsfrance.fr/observatoire-national.html"},{"@type":"ListItem","position":3,"name":"${title}","item":"https://www.territoiresvivantsfrance.fr/${file}"}]}]}</script>`;
}

function pageShell({ title, description, file, image, breadcrumb, main }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | TERRITOIRES VIVANTS FRANCE</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.territoiresvivantsfrance.fr/${file}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:site_name" content="TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:title" content="${title} | TERRITOIRES VIVANTS FRANCE" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://www.territoiresvivantsfrance.fr/${file}" />
    <meta property="og:image" content="https://www.territoiresvivantsfrance.fr/${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#3f7115" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
    <link rel="manifest" href="site.webmanifest" />
    ${structuredData(breadcrumb.at(-1), file)}
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    ${header}
    <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span class="breadcrumb-separator" aria-hidden="true">/</span><span>Observatoire</span><span class="breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">${breadcrumb.at(-1)}</span></nav>
    ${main}
    ${footer}
  </body>
</html>
`;
}

const impactMain = `<main class="impact-study-page" data-professional-enrichment="public-page">
      <section class="impact-hero">
        <img decoding="async" fetchpriority="high" src="assets/photos/saint-etienne-design.jpg" alt="Vue urbaine de Saint-Etienne, territoire pilote de Territoires Vivants France" width="1800" height="1200" />
        <div class="impact-hero-panel">
          <span class="page-status" data-status="public">Etude territoriale pilote</span>
          <h1>Etude d'impact - Saint-Etienne</h1>
          <p>Une lecture professionnelle du territoire pilote de TERRITOIRES VIVANTS FRANCE : diagnostic, besoins, leviers d'action, indicateurs de suivi et projections previsionnelles. Les donnees reelles sont distinguees des estimations TVF.</p>
          <div class="actions-hero-buttons">
            <a class="button primary" href="#diagnostic">Lire le diagnostic</a>
            <a class="button secondary" href="#projections">Voir les projections</a>
          </div>
        </div>
      </section>

      <section class="impact-disclaimer" aria-label="Méthode et prudence">
        <strong>Lecture importante</strong>
        <p>Les chiffres publics ci-dessous proviennent des sources citees, principalement INSEE, SIG Ville/ANCT et Cerema. Les volumes d'impact TVF sont des estimations previsionnelles internes, construites pour dimensionner une phase pilote : ils ne constituent ni des resultats realises, ni des engagements contractuels.</p>
      </section>

      <section id="diagnostic" class="impact-section">
        <span class="dossier-kicker">Diagnostic du territoire</span>
        <h2>Saint-Etienne concentre plusieurs enjeux que TVF sait relier</h2>
        <p>Le territoire stéphanois combine un parc de logements important, une vacance résidentielle mesurable, des quartiers prioritaires nombreux, un tissu commercial dense, une histoire industrielle forte et des besoins sociaux marqués. L'enjeu pour TVF n'est pas de remplacer les acteurs publics existants, mais de coordonner les propriétaires, les collectivités, les entreprises, les associations, les bénévoles et les ressources disponibles autour de projets concrets.</p>
        <div class="impact-key-grid">
          <article><strong>172 569</strong><span>habitants en 2022</span><small>INSEE RP2022</small></article>
          <article><strong>12 313</strong><span>logements vacants en 2022</span><small>INSEE LOG T1</small></article>
          <article><strong>12,2 %</strong><span>du parc de logements vacant</span><small>Calcul TVF d'apres INSEE</small></article>
          <article><strong>9</strong><span>quartiers prioritaires 2024</span><small>SIG Ville / ANCT</small></article>
          <article><strong>36 016</strong><span>habitants vivant en QPV</span><small>SIG Ville / ANCT 2024</small></article>
          <article><strong>30,4 %</strong><span>taux de pauvrete 2023</span><small>INSEE Filosofi 2023</small></article>
        </div>
      </section>

      <section class="impact-section split">
        <div>
          <span class="dossier-kicker">Données sourcées</span>
          <h2>Indicateurs territoriaux retenus</h2>
          <p>Cette premiere version retient uniquement les chiffres verifiables dans des bases publiques consultables. Les indicateurs plus fins, comme la vacance commerciale exacte par rue, les coproprietes fragiles ou les gisements de materiaux par chantier, devront etre consolides avec les acteurs locaux et les donnees metiers.</p>
        </div>
        <div class="impact-table-wrap">
          <table class="impact-data-table">
            <thead><tr><th>Theme</th><th>Donnee</th><th>Lecture TVF</th><th>Source</th></tr></thead>
            <tbody>
              <tr><td>Population</td><td>172 569 habitants en 2022 ; 170 049 en 2011</td><td>Territoire urbain dense, stabilise apres une longue mutation industrielle.</td><td>INSEE RP2022, POP T0</td></tr>
              <tr><td>Logements</td><td>101 006 logements en 2022, dont 86 292 residences principales</td><td>Un parc vaste, avec un besoin d'orientation fine entre remise en usage, renovation et usages temporaires.</td><td>INSEE LOG T1</td></tr>
              <tr><td>Vacance residentielle</td><td>12 313 logements vacants en 2022, contre 11 791 en 2016</td><td>Un gisement prioritaire pour Habitat Vivant et l'Observatoire TVF.</td><td>INSEE LOG T1</td></tr>
              <tr><td>Habitat ancien</td><td>15 295 residences principales achevees avant 1946, soit 17,7 % des residences principales</td><td>Un enjeu de renovation, confort, adaptation et reutilisation du patrimoine existant.</td><td>INSEE LOG T5, calcul TVF</td></tr>
              <tr><td>Quartiers prioritaires</td><td>9 QPV en 2024 ; 36 016 habitants, soit 20,7 % de la population municipale</td><td>TVF doit relier cadre de vie, insertion, locaux utiles et projets de proximite.</td><td>SIG Ville / ANCT</td></tr>
              <tr><td>Pauvrete</td><td>Taux de pauvrete de 30,4 % en 2023 ; niveau de vie median de 20 880 euros</td><td>Les projets doivent rester sobres, solidaires et accessibles.</td><td>INSEE Filosofi 2023</td></tr>
              <tr><td>Chomage</td><td>13 996 chomeurs au sens du recensement en 2022 ; taux de 19,1 %</td><td>Les chantiers participatifs et parcours d'insertion sont un levier social majeur.</td><td>INSEE EMP T4</td></tr>
              <tr><td>Economie locale</td><td>3 031 entreprises creees et 3 448 etablissements crees en 2025</td><td>TVF peut soutenir des usages economiques de proximite dans des locaux remis en activite.</td><td>INSEE SIDE 2025</td></tr>
              <tr><td>Commerces et services</td><td>145 boulangeries-patisseries, 121 epiceries/superettes, 230 etablissements de coiffure en 2024</td><td>Un tissu de proximite existe ; la vacance commerciale doit etre cartographiee rue par rue.</td><td>INSEE BPE 2024</td></tr>
              <tr><td>Friches</td><td>Donnee locale a extraire de Cartofriches et des observatoires locaux ; DDT de la Loire referencee comme producteur</td><td>Les friches doivent etre qualifiees par usage potentiel, pollution, foncier, accessibilite et mutabilite.</td><td>Cerema Cartofriches</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Pourquoi TVF est necessaire</span>
        <h2>Une reponse par poles, pas une action isolee</h2>
        <div class="impact-pole-grid">
          <article><h3>Habitat Vivant</h3><p>Priorite aux logements vacants, au patrimoine ancien, aux proprietaires sans solution et aux besoins d'usages solidaires. Le pole transforme le diagnostic en parcours : reperage, contact, faisabilite, convention, travaux, remise en usage.</p></article>
          <article><h3>Materiautheque Solidaire</h3><p>Les chantiers produisent et consomment des ressources. TVF organise l'identification, le tri, la qualification et l'affectation des materiaux vers des projets valides, sans distribution automatique.</p></article>
          <article><h3>Commerce Vivant</h3><p>Le tissu commercial doit etre observe a l'echelle fine : vitrines fermees, cellules sous-utilisees, besoins d'artisans, associations, services et commerces de proximite.</p></article>
          <article><h3>Friches & Terrains Vivants</h3><p>Les terrains et bâtiments delaissees necessitent une qualification technique avant action : statut, risques, pollution, desserte, usage possible, couts de remise en etat.</p></article>
          <article><h3>Solidarite & Insertion</h3><p>Les projets peuvent creer des missions utiles : chantiers participatifs, preparation de materiaux, mediation, animation, formation et orientation professionnelle.</p></article>
        </div>
      </section>

      <section id="projections" class="impact-section">
        <span class="dossier-kicker">Estimations TVF</span>
        <h2>Etude d'impact previsionnelle : 1, 3, 5 et 10 ans</h2>
        <p>Ces projections sont des hypotheses de dimensionnement. Elles supposent une equipe pilote structuree, une cooperation avec les acteurs locaux, une capacite de financement progressive, une validation juridique des conventions et une collecte de donnees continue.</p>
        <div class="impact-table-wrap">
          <table class="impact-data-table forecast">
            <thead><tr><th>Indicateur estime</th><th>1 an</th><th>3 ans</th><th>5 ans</th><th>10 ans</th></tr></thead>
            <tbody>
              <tr><td>Logements remis sur le marche ou en usage solidaire</td><td>3 a 6</td><td>20 a 35</td><td>50 a 80</td><td>150 a 250</td></tr>
              <tr><td>Proprietaires accompagnes</td><td>10 a 20</td><td>50 a 80</td><td>120 a 180</td><td>300 a 500</td></tr>
              <tr><td>Commerces ou locaux d'activite revitalises</td><td>1 a 2</td><td>6 a 10</td><td>15 a 25</td><td>40 a 70</td></tr>
              <tr><td>Friches ou espaces transformes</td><td>1 site qualifie</td><td>3 a 5</td><td>8 a 12</td><td>20 a 35</td></tr>
              <tr><td>Materiaux reutilisables orientes vers projets</td><td>15 a 30 t</td><td>120 a 250 t</td><td>400 a 700 t</td><td>1 500 a 2 500 t</td></tr>
              <tr><td>Dechets evites ou detournes</td><td>20 a 45 t</td><td>160 a 330 t</td><td>500 a 900 t</td><td>2 000 a 3 200 t</td></tr>
              <tr><td>Emissions evitees a calculer chantier par chantier</td><td>5 a 15 tCO2e</td><td>40 a 90 tCO2e</td><td>100 a 250 tCO2e</td><td>500 a 1 000 tCO2e</td></tr>
              <tr><td>Personnes accompagnees ou beneficiaires directs</td><td>20 a 40</td><td>90 a 160</td><td>200 a 350</td><td>700 a 1 200</td></tr>
              <tr><td>Heures d'insertion ou de participation encadree</td><td>300 a 800 h</td><td>2 000 a 4 000 h</td><td>6 000 a 12 000 h</td><td>25 000 a 50 000 h</td></tr>
              <tr><td>Valeur economique mobilisee ou generee</td><td>100 k a 250 k EUR</td><td>800 k a 1,8 M EUR</td><td>2,5 a 5 M EUR</td><td>10 a 25 M EUR</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Tableau de bord KPI</span>
        <h2>Indicateurs de suivi proposes</h2>
        <div class="kpi-board">
          <article><strong>Logements renovés</strong><span style="--value: 72%"></span><p>Suivi par statut : identifié, contacté, conventionné, rénové, remis en usage.</p></article>
          <article><strong>Commerces accompagnés</strong><span style="--value: 48%"></span><p>Suivi des cellules vacantes, usages temporaires, installations et pérennisation.</p></article>
          <article><strong>Matériaux récupérés</strong><span style="--value: 64%"></span><p>Suivi en tonnes, catégories, état, affectation et projet bénéficiaire.</p></article>
          <article><strong>Déchets évités</strong><span style="--value: 58%"></span><p>Estimation à partir des flux réemployés et des justificatifs de chantier.</p></article>
          <article><strong>Bénéficiaires</strong><span style="--value: 52%"></span><p>Habitants, associations, travailleurs, étudiants, familles et porteurs de projet.</p></article>
          <article><strong>CO2 évité</strong><span style="--value: 42%"></span><p>Calcul futur par facteur d'émission documenté et catégorie de matériau.</p></article>
        </div>
      </section>

      <section class="impact-section split">
        <div>
          <span class="dossier-kicker">Cartes interactives prévues</span>
          <h2>Un observatoire local connecté aux données publiques</h2>
          <p>La carte Saint-Etienne devra croiser les logements vacants, commerces vacants, friches, QPV, projets TVF, ressources de matériaux, équipements et partenaires. L'objectif est de passer d'une vision dispersée à une lecture opérationnelle par quartier.</p>
          <ul class="impact-check-list">
            <li>Couche logements vacants : INSEE, LOVAC et signalements qualifiés.</li>
            <li>Couche commerces : repérage terrain et données d'équipements INSEE.</li>
            <li>Couche friches : Cartofriches, données foncières Cerema et qualification locale.</li>
            <li>Couche sociale : QPV 2024, pauvreté, chômage, accessibilité et besoins associatifs.</li>
            <li>Couche projets : statut TVF, besoin, propriétaire, convention, financement, impact.</li>
          </ul>
        </div>
        <div class="impact-map-mock" aria-label="Carte préparatoire Saint-Etienne">
          <div class="map-zone center">Centre-ville</div>
          <div class="map-pin housing">Logements</div>
          <div class="map-pin commerce">Commerces</div>
          <div class="map-pin friche">Friches</div>
          <div class="map-pin qpv">QPV</div>
          <div class="map-legend"><span>Habitat</span><span>Commerce</span><span>Friches</span><span>QPV</span></div>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Chronologie opérationnelle</span>
        <h2>Déploiement proposé du pilote Saint-Etienne</h2>
        <div class="impact-timeline">
          <article><strong>0-6 mois</strong><p>Consolidation des sources, cartographie, repérage terrain, premiers propriétaires, premiers matériaux.</p></article>
          <article><strong>6-12 mois</strong><p>Conventions pilotes, chantiers tests, traçabilité matériaux, tableau de bord public.</p></article>
          <article><strong>Années 2-3</strong><p>Montée en charge des projets habitat, commerce et friches ; structuration de l'antenne locale.</p></article>
          <article><strong>Années 4-5</strong><p>Industrialisation de la méthode, partenariats structurants, documentation exportable vers d'autres territoires.</p></article>
        </div>
      </section>

      <section class="impact-section source-register-preview">
        <span class="dossier-kicker">Sources et traçabilité</span>
        <h2>Les sources sont séparées des projections</h2>
        <p>La page sources détaille les jeux de données utilisés, leur millésime, leur usage dans l'étude et les limites méthodologiques. Elle sert de registre public pour éviter toute confusion entre données officielles, calculs TVF et projections.</p>
        <a class="button primary" href="${sourcesPage}">Consulter les sources Saint-Etienne</a>
      </section>
    </main>`;

const sourcesMain = `<main class="impact-study-page sources-study-page" data-professional-enrichment="public-page">
      <section class="impact-hero compact">
        <img decoding="async" fetchpriority="high" src="assets/photos/documents-resources.jpg" alt="Documents, données et tableaux utilisés pour une étude territoriale" width="1800" height="1200" />
        <div class="impact-hero-panel">
          <span class="page-status" data-status="public">Registre des sources</span>
          <h1>Sources - Etude Saint-Etienne</h1>
          <p>Registre public des données mobilisées pour l'étude d'impact territoriale TVF Saint-Etienne. Les sources officielles sont distinguées des calculs TVF et des indicateurs à consolider.</p>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Méthode</span>
        <h2>Un registre pour sécuriser la crédibilité de l'étude</h2>
        <p>Chaque donnée intégrée à l'étude doit pouvoir être rattachée à une source, un millésime, une échelle géographique et une limite d'interprétation. Les données absentes ou non consolidées localement ne sont pas remplacées par des chiffres fictifs.</p>
      </section>

      <section class="impact-section">
        <div class="impact-table-wrap">
          <table class="impact-data-table sources">
            <thead><tr><th>Source</th><th>Données utilisées</th><th>Millésime</th><th>Usage dans l'étude</th><th>Lien</th></tr></thead>
            <tbody>
              <tr><td>INSEE - Dossier complet commune de Saint-Etienne (42218)</td><td>Population, logements, logements vacants, habitat ancien, chômage, revenus, pauvreté, établissements, commerces</td><td>RP2022, Filosofi 2023, BPE 2024, SIDE 2025</td><td>Diagnostic territorial et indicateurs de base</td><td><a href="https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218">Consulter</a></td></tr>
              <tr><td>SIG Ville / ANCT</td><td>Quartiers prioritaires 2024, population municipale vivant en QPV, part de population en QPV</td><td>2024</td><td>Lecture sociale et cartographie des quartiers prioritaires</td><td><a href="https://sig.ville.gouv.fr/territoire/42218">Consulter</a></td></tr>
              <tr><td>Cerema - Cartofriches</td><td>Inventaire national des friches, méthode d'observatoire local, API et données ouvertes, enseignements Fonds friches/Fonds vert</td><td>Mise à jour 15 juin 2026</td><td>Cadre de qualification des friches et futures cartes interactives</td><td><a href="https://cartofriches.cerema.fr/">Consulter</a></td></tr>
              <tr><td>ADEME - Librairie et ressources économie circulaire</td><td>Ressources documentaires sur déchets, réemploi, bâtiment et économie circulaire</td><td>Variable selon publication</td><td>Cadre documentaire pour le réemploi et la méthodologie matériaux</td><td><a href="https://librairie.ademe.fr/">Consulter</a></td></tr>
              <tr><td>Banque des Territoires</td><td>Références méthodologiques sur revitalisation, collectivités et ingénierie territoriale</td><td>Variable</td><td>Benchmark institutionnel et positionnement partenaire</td><td><a href="https://www.banquedesterritoires.fr/">Consulter</a></td></tr>
              <tr><td>ANCT</td><td>Politique de cohésion territoriale, QPV, observatoires, programmes territoriaux</td><td>Variable</td><td>Cadre de cohérence avec l'action publique territoriale</td><td><a href="https://agence-cohesion-territoires.gouv.fr/">Consulter</a></td></tr>
              <tr><td>TVF - Calculs internes</td><td>Taux de vacance, part du parc ancien, projections, KPI prévisionnels</td><td>2026</td><td>Lecture opérationnelle et dimensionnement du pilote</td><td><a href="${impactPage}">Etude</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="impact-section">
        <span class="dossier-kicker">Données à consolider</span>
        <h2>Indicateurs non chiffrés dans cette version</h2>
        <div class="impact-pole-grid">
          <article><h3>Copropriétés fragiles</h3><p>A consolider avec le registre national d'immatriculation des copropriétés, l'ANAH, la collectivité et les opérateurs habitat.</p></article>
          <article><h3>Vacance commerciale fine</h3><p>A produire par repérage terrain, données consulaires, fichiers locaux et observation des rez-de-chaussée actifs ou fermés.</p></article>
          <article><h3>Déchets du BTP locaux</h3><p>A estimer à partir des chantiers suivis, diagnostics PEMD, bordereaux de suivi et plateformes de réemploi partenaires.</p></article>
          <article><h3>Précarité énergétique</h3><p>A documenter avec les sources ONPE, DPE, aides à la rénovation et données locales disponibles.</p></article>
          <article><h3>Matériaux disponibles</h3><p>A créer par inventaire terrain et propositions d'entreprises, particuliers, bailleurs et collectivités.</p></article>
        </div>
      </section>

      <section class="impact-section source-register-preview">
        <span class="dossier-kicker">Retour à l'étude</span>
        <h2>Relier les données à la stratégie TVF</h2>
        <p>Les sources ne valent que si elles servent une décision : cibler, prioriser, conventionner, financer, agir, puis mesurer.</p>
        <a class="button primary" href="${impactPage}">Voir l'étude d'impact</a>
      </section>
    </main>`;

write(impactPage, pageShell({
  title: "Etude d'impact Saint-Etienne",
  description: "Etude territoriale TVF Saint-Etienne : diagnostic sourcé, projections previsionnelles, KPI, cartes et sources officielles.",
  file: impactPage,
  image: "assets/photos/saint-etienne-design.jpg",
  breadcrumb: ["Accueil", "Observatoire", "Etude d'impact Saint-Etienne"],
  main: impactMain
}));

write(sourcesPage, pageShell({
  title: "Sources Etude Saint-Etienne",
  description: "Sources officielles utilisees pour l'etude d'impact TVF Saint-Etienne : INSEE, SIG Ville, ANCT, Cerema, ADEME et calculs TVF.",
  file: sourcesPage,
  image: "assets/photos/documents-resources.jpg",
  breadcrumb: ["Accueil", "Observatoire", "Sources Saint-Etienne"],
  main: sourcesMain
}));

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  let html = read(file);
  html = addObservatoryLinks(html);
  if (file === "dossier-saint-etienne.html" && !html.includes("Voir l'etude d'impact Saint-Etienne")) {
    html = html.replace(
      /<\/main>/,
      `<section class="impact-section source-register-preview"><span class="dossier-kicker">Etude d'impact</span><h2>Approfondir le territoire pilote Saint-Etienne</h2><p>Une etude dediee rassemble les donnees officielles, les projections TVF, les KPI et les sources mobilisees pour presenter le potentiel d'impact du pilote.</p><a class="button primary" href="${impactPage}">Voir l'etude d'impact Saint-Etienne</a></section></main>`
    );
  }
  write(file, html);
}

let architecture = read("PUBLIC_ARCHITECTURE.md");
architecture = architecture.replace(/Pages publiques indexables : \d+/, "Pages publiques indexables : 49");
architecture = architecture.replace("Mise a jour : 25 juin 2026.", "Mise a jour : 25 juin 2026.");
if (!architecture.includes(`- ${impactPage}`)) {
  architecture = architecture.replace("- dossier-saint-etienne.html", `- dossier-saint-etienne.html\n- ${impactPage}\n- ${sourcesPage}`);
}
write("PUBLIC_ARCHITECTURE.md", architecture);

const publicPages = architecture
  .split(/\r?\n/)
  .filter((line) => line.startsWith("- ") && line.trim().endsWith(".html"))
  .map((line) => line.slice(2).trim());

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages
  .map((file) => {
    const priority = file === "index.html" ? "1.0" : ["observatoire-national.html", "dossier-saint-etienne.html", impactPage, "nos-actions.html", "banque-materiaux.html"].includes(file) ? "0.9" : "0.7";
    return `  <url><loc>https://www.territoiresvivantsfrance.fr/${file}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);

let rationalize = read("scripts/rationalize-public-site.js");
if (!rationalize.includes(`"${impactPage}"`)) {
  rationalize = rationalize.replace('"dossier-saint-etienne.html",', `"dossier-saint-etienne.html",\n  "${impactPage}",\n  "${sourcesPage}",`);
  rationalize = rationalize.replace('"dossier-saint-etienne.html": ["Observatoire", "Dossier Saint-&Eacute;tienne"],', `"dossier-saint-etienne.html": ["Observatoire", "Dossier Saint-&Eacute;tienne"],\n  "${impactPage}": ["Observatoire", "Etude d'impact Saint-Etienne"],\n  "${sourcesPage}": ["Observatoire", "Sources Saint-Etienne"],`);
  rationalize = rationalize.replace('"dossier-saint-etienne.html": ["pilot", "Projet pilote officiel"],', `"dossier-saint-etienne.html": ["pilot", "Projet pilote officiel"],\n  "${impactPage}": ["pilot", "Etude d'impact"],\n  "${sourcesPage}": ["reference", "Registre des sources"],`);
  rationalize = rationalize.replace(
    /megaLink\("dossier-saint-etienne\.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote\.", "observe"\),/,
    `megaLink("dossier-saint-etienne.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote.", "observe"),megaLink("${impactPage}", "&Eacute;tude d'impact Saint-&Eacute;tienne", "Donn&eacute;es, projections et indicateurs de suivi.", "observe"),megaLink("${sourcesPage}", "Sources Saint-&Eacute;tienne", "Registre des donn&eacute;es officielles mobilis&eacute;es.", "observe"),`
  );
  rationalize = rationalize.replace(
    /megaLink\("dossier-saint-etienne\.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote\.", "observe"\),\n/,
    `megaLink("dossier-saint-etienne.html", "Dossier Saint-&Eacute;tienne", "Premier diagnostic territorial pilote.", "observe"),\n  megaLink("${impactPage}", "&Eacute;tude d'impact Saint-&Eacute;tienne", "Donn&eacute;es, projections et indicateurs de suivi.", "observe"),\n  megaLink("${sourcesPage}", "Sources Saint-&Eacute;tienne", "Registre des donn&eacute;es officielles mobilis&eacute;es.", "observe"),\n`
  );
  rationalize = rationalize.replace(
    '["observatoire-national.html", "dossier-saint-etienne.html", "nos-actions.html", "banque-materiaux.html"]',
    `["observatoire-national.html", "dossier-saint-etienne.html", "${impactPage}", "nos-actions.html", "banque-materiaux.html"]`
  );
}
write("scripts/rationalize-public-site.js", rationalize);

console.log(JSON.stringify({ created: [impactPage, sourcesPage], publicPages: publicPages.length }, null, 2));
