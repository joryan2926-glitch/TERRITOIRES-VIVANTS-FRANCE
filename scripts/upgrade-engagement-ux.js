const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const architecture = fs.readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8");
const publicPages = [...architecture.matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]);

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, html) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

const journeyHub = `
      <section class="engagement-journey" aria-labelledby="engagement-journey-title" data-engagement-upgrade="true">
        <div class="engagement-heading">
          <span class="dossier-kicker">Rejoindre TVF</span>
          <h2 id="engagement-journey-title">Quel est votre r&ocirc;le dans la revitalisation du territoire ?</h2>
          <p>Chaque acteur peut contribuer &agrave; sa mani&egrave;re : signaler, proposer, financer, accueillir, r&eacute;employer, documenter ou porter un projet local.</p>
        </div>
        <div class="journey-grid">
          <a class="journey-card" href="espace-collectivites.html"><span>Collectivit&eacute;</span><strong>Devenir territoire partenaire</strong><small>Diagnostic, donn&eacute;es, coop&eacute;ration, indicateurs.</small></a>
          <a class="journey-card" href="proprietaires.html"><span>Propri&eacute;taire</span><strong>Proposer un bien</strong><small>Logement, commerce, b&acirc;timent ou terrain &agrave; qualifier.</small></a>
          <a class="journey-card" href="espace-entreprises.html"><span>Entreprise</span><strong>Contribuer &agrave; l'&eacute;conomie circulaire</strong><small>Mat&eacute;riaux, comp&eacute;tences, locaux, m&eacute;c&eacute;nat.</small></a>
          <a class="journey-card" href="partenariats-strategiques.html"><span>Association</span><strong>Construire une action locale</strong><small>Besoins, publics, b&eacute;n&eacute;volat, animation.</small></a>
          <a class="journey-card" href="signalement.html"><span>Citoyen</span><strong>Signaler une ressource</strong><small>Lieu vacant, mat&eacute;riau disponible, besoin local.</small></a>
          <a class="journey-card" href="financer-projets.html"><span>Investisseur</span><strong>Financer un impact v&eacute;rifiable</strong><small>Projet qualifi&eacute;, budget, reporting, transparence.</small></a>
          <a class="journey-card" href="espace-benevoles.html"><span>B&eacute;n&eacute;vole</span><strong>Rejoindre le mouvement</strong><small>Missions, chantiers, documentation, terrain.</small></a>
        </div>
      </section>
`;

const homeEngagement = `
      <section class="home-engagement-boost" aria-labelledby="home-engagement-title" data-engagement-upgrade="true">
        <div class="engagement-heading">
          <span class="dossier-kicker">Plateforme nationale de coop&eacute;ration</span>
          <h2 id="home-engagement-title">Un lieu unique pour transformer les ressources inutilis&eacute;es en projets utiles</h2>
          <p>TVF rend visibles les biens vacants, les mat&eacute;riaux disponibles, les besoins locaux et les acteurs pr&ecirc;ts &agrave; agir. L'objectif : acc&eacute;l&eacute;rer les projets sans inventer de r&eacute;sultats, en documentant chaque &eacute;tape.</p>
        </div>
        <div class="engagement-action-grid">
          <article><span>01</span><h3>Identifier</h3><p>Rep&eacute;rer logements, commerces, friches, terrains, b&acirc;timents et mat&eacute;riaux encore utiles.</p></article>
          <article><span>02</span><h3>Qualifier</h3><p>V&eacute;rifier la propri&eacute;t&eacute;, l'&eacute;tat, les risques, les besoins locaux et les conditions de publication.</p></article>
          <article><span>03</span><h3>F&eacute;d&eacute;rer</h3><p>Relier collectivit&eacute;s, propri&eacute;taires, entreprises, associations, habitants et financeurs.</p></article>
          <article><span>04</span><h3>Agir</h3><p>Construire un projet, une convention, un budget, une affectation de ressources et un suivi d'impact.</p></article>
        </div>
      </section>

      <section class="collectivity-spotlight" aria-labelledby="collectivity-spotlight-title" data-engagement-upgrade="true">
        <div>
          <span class="dossier-kicker">Collectivit&eacute;s</span>
          <h2 id="collectivity-spotlight-title">Pourquoi rejoindre TVF en tant que collectivit&eacute; ?</h2>
          <p>Une collectivit&eacute; rejoint TVF pour gagner en lisibilit&eacute;, f&eacute;d&eacute;rer les acteurs locaux et transformer plus vite les ressources inutilis&eacute;es en usages concrets pour les habitants.</p>
          <a class="button primary" href="espace-collectivites.html">Devenir territoire partenaire</a>
        </div>
        <div class="benefit-cloud">
          <span>Revitaliser plus rapidement</span>
          <span>F&eacute;d&eacute;rer les acteurs locaux</span>
          <span>Acc&eacute;l&eacute;rer les projets</span>
          <span>Am&eacute;liorer le cadre de vie</span>
          <span>Valoriser les politiques publiques</span>
          <span>Attirer des partenaires</span>
          <span>Suivre des indicateurs d'impact</span>
          <span>Faciliter les financements</span>
          <span>Renforcer l'&eacute;conomie circulaire</span>
        </div>
      </section>

      <section class="company-spotlight" aria-labelledby="company-spotlight-title" data-engagement-upgrade="true">
        <div class="engagement-heading">
          <span class="dossier-kicker">Entreprises engag&eacute;es</span>
          <h2 id="company-spotlight-title">Une contribution concr&egrave;te, tra&ccedil;able et utile au territoire</h2>
          <p>Les entreprises peuvent donner des mat&eacute;riaux, proposer du mat&eacute;riel, offrir des locaux, apporter des comp&eacute;tences, financer des projets, accueillir des personnes en insertion ou devenir partenaires.</p>
        </div>
        <div class="company-benefits">
          <article><h3>Valorisation RSE</h3><p>Relier l'engagement &agrave; des projets locaux document&eacute;s.</p></article>
          <article><h3>R&eacute;duction des d&eacute;chets</h3><p>Orienter les surplus et invendus vers le r&eacute;emploi.</p></article>
          <article><h3>Impact social</h3><p>Soutenir des usages utiles, l'insertion et l'engagement citoyen.</p></article>
          <article><h3>R&eacute;seau territorial</h3><p>Coop&eacute;rer avec collectivit&eacute;s, associations et acteurs locaux.</p></article>
        </div>
        <div class="partner-gallery" aria-label="Nos entreprises engag&eacute;es">
          <h3>Nos entreprises engag&eacute;es</h3>
          <div class="placeholder-logos">
            <span>Logo &agrave; venir</span><span>Fiche &agrave; valider</span><span>Localisation</span><span>Type d'engagement</span>
          </div>
          <p>Aucune entreprise n'est affich&eacute;e sans convention, accord de publication et description factuelle de l'engagement.</p>
        </div>
      </section>

      <section class="impact-tomorrow" aria-labelledby="impact-tomorrow-title" data-engagement-upgrade="true">
        <div class="engagement-heading">
          <span class="dossier-kicker">Les impacts de demain</span>
          <h2 id="impact-tomorrow-title">Des compteurs pr&ecirc;ts pour des r&eacute;sultats r&eacute;els</h2>
          <p>Ces indicateurs resteront &agrave; z&eacute;ro tant qu'aucune donn&eacute;e TVF n'est valid&eacute;e. Ils sont pr&eacute;par&eacute;s pour afficher des impacts v&eacute;rifiables, territoire par territoire.</p>
        </div>
        <div class="future-counter-grid">
          <article><strong data-counter-value="0">0</strong><span>logements remis en usage</span></article>
          <article><strong data-counter-value="0">0</strong><span>commerces r&eacute;activ&eacute;s</span></article>
          <article><strong data-counter-value="0">0</strong><span>friches transform&eacute;es</span></article>
          <article><strong data-counter-value="0">0</strong><span>tonnes de mat&eacute;riaux r&eacute;employ&eacute;s</span></article>
          <article><strong data-counter-value="0">0</strong><span>tonnes de CO2 &eacute;vit&eacute;es</span></article>
          <article><strong data-counter-value="0">0</strong><span>b&eacute;n&eacute;voles mobilis&eacute;s</span></article>
          <article><strong data-counter-value="0">0</strong><span>entreprises partenaires</span></article>
          <article><strong data-counter-value="0">0</strong><span>collectivit&eacute;s engag&eacute;es</span></article>
        </div>
      </section>

      <section class="national-map-vision" aria-labelledby="national-map-title" data-engagement-upgrade="true">
        <div>
          <span class="dossier-kicker">Carte nationale &eacute;volutive</span>
          <h2 id="national-map-title">Visualiser les territoires, projets et ressources TVF</h2>
          <p>La carte est pr&eacute;par&eacute;e pour afficher les territoires pilotes, antennes locales, partenaires, projets, mat&eacute;riaux disponibles, biens propos&eacute;s et collectivit&eacute;s adh&eacute;rentes lorsque les donn&eacute;es seront qualifi&eacute;es.</p>
          <a class="button secondary" href="carte-territoires.html">Explorer la carte des territoires</a>
        </div>
        <div class="interactive-france-card" aria-label="Carte de France interactive en pr&eacute;paration">
          <svg viewBox="0 0 360 360" role="img" aria-label="Carte illustrative de France">
            <path d="M174 31 245 55 307 118 291 196 315 256 237 312 170 332 97 306 57 244 33 165 74 91Z" />
            <circle class="map-node active" cx="195" cy="205" r="8" data-label="Saint-&Eacute;tienne" />
            <circle class="map-node" cx="132" cy="132" r="6" data-label="Territoire &agrave; qualifier" />
            <circle class="map-node" cx="247" cy="136" r="6" data-label="Antenne future" />
            <circle class="map-node" cx="103" cy="237" r="6" data-label="Projet futur" />
            <circle class="map-node" cx="232" cy="268" r="6" data-label="Ressource future" />
          </svg>
          <div class="map-tooltip">Saint-&Eacute;tienne : territoire pilote</div>
        </div>
      </section>

      <section class="trust-builder" aria-labelledby="trust-builder-title" data-engagement-upgrade="true">
        <div class="engagement-heading">
          <span class="dossier-kicker">Ils construiront TVF</span>
          <h2 id="trust-builder-title">Des espaces pr&ecirc;ts pour afficher les soutiens confirm&eacute;s</h2>
          <p>Collectivit&eacute;s, entreprises, fondations, m&eacute;c&egrave;nes, associations, experts, &eacute;tablissements d'enseignement et r&eacute;seaux professionnels seront affich&eacute;s uniquement apr&egrave;s accord explicite.</p>
        </div>
        <div class="trust-placeholder-grid">
          <article><span>Collectivit&eacute;s partenaires</span><i></i></article>
          <article><span>Entreprises engag&eacute;es</span><i></i></article>
          <article><span>Fondations et m&eacute;c&egrave;nes</span><i></i></article>
          <article><span>Associations</span><i></i></article>
          <article><span>Experts</span><i></i></article>
          <article><span>&Eacute;coles et universit&eacute;s</span><i></i></article>
        </div>
      </section>
`;

const collectivityBlock = `
      <section class="audience-power-section collectivites-power" aria-labelledby="collectivites-power-title" data-engagement-upgrade="true">
        <div>
          <span class="dossier-kicker">Pourquoi rejoindre TVF ?</span>
          <h2 id="collectivites-power-title">Une collectivit&eacute; gagne un outil de coordination, pas une couche administrative de plus</h2>
          <p>TVF peut aider &agrave; rendre les priorit&eacute;s locales plus op&eacute;rationnelles : vacance, friches, commerces, r&eacute;emploi, insertion, cadre de vie et mobilisation citoyenne.</p>
          <a class="button primary" href="contact.html">Devenir territoire partenaire</a>
        </div>
        <div class="benefit-cloud compact">
          <span>Diagnostic territorial</span><span>Cartographie</span><span>Projets acc&eacute;l&eacute;r&eacute;s</span><span>Financements facilit&eacute;s</span><span>Indicateurs d'impact</span><span>Animation locale</span><span>&Eacute;conomie circulaire</span><span>Cadre de convention</span>
        </div>
      </section>
`;

const enterpriseBlock = `
      <section class="audience-power-section entreprises-power" aria-labelledby="entreprises-power-title" data-engagement-upgrade="true">
        <div>
          <span class="dossier-kicker">Entreprises engag&eacute;es</span>
          <h2 id="entreprises-power-title">Transformer une contribution RSE en impact territorial document&eacute;</h2>
          <p>Mat&eacute;riaux, locaux, comp&eacute;tences, logistique, m&eacute;c&eacute;nat ou accueil de publics en insertion : chaque contribution doit &ecirc;tre qualifi&eacute;e, trac&eacute;e et reli&eacute;e &agrave; un projet utile.</p>
          <a class="button primary" href="contact.html">Proposer un engagement entreprise</a>
        </div>
        <div class="partner-gallery compact">
          <h3>Galerie des entreprises engag&eacute;es</h3>
          <div class="placeholder-logos"><span>Logo</span><span>Fiche</span><span>Localisation</span><span>Engagement</span></div>
          <p>Affichage apr&egrave;s accord, convention et validation des informations publiables.</p>
        </div>
      </section>
`;

const investorBlock = `
      <section class="audience-power-section investor-power" aria-labelledby="investor-power-title" data-engagement-upgrade="true">
        <div>
          <span class="dossier-kicker">Pourquoi investir dans TVF ?</span>
          <h2 id="investor-power-title">Financer des projets territoriaux suivis, gouvern&eacute;s et mesurables</h2>
          <p>TVF pr&eacute;pare un cadre de financement fond&eacute; sur la transparence : fiche projet, budget, jalons, gouvernance, affectation des contributions, reporting annuel et indicateurs v&eacute;rifiables.</p>
          <a class="button primary" href="contact.html">Parler d'un financement</a>
        </div>
        <div class="investment-proof-grid">
          <article><h3>Impact environnemental</h3><p>R&eacute;emploi, sobri&eacute;t&eacute; fonci&egrave;re, d&eacute;chets &eacute;vit&eacute;s.</p></article>
          <article><h3>Impact social</h3><p>Usages locaux, insertion, b&eacute;n&eacute;volat, acc&egrave;s &agrave; des lieux utiles.</p></article>
          <article><h3>Impact territorial</h3><p>Centres-villes, quartiers, friches, commerces et services.</p></article>
          <article><h3>Reporting</h3><p>Donn&eacute;es, preuves, limites, bilan annuel et transparence.</p></article>
        </div>
      </section>
`;

function insertBeforeNeedle(html, needle, block) {
  if (html.includes(block.trim().slice(0, 80))) return html;
  const index = html.indexOf(needle);
  if (index === -1) return html;
  return `${html.slice(0, index)}${block}${html.slice(index)}`;
}

let changed = 0;

let index = read("index.html");
const beforeIndex = index;
index = insertBeforeNeedle(index, '<section class="news-section"', homeEngagement);
if (index !== beforeIndex) {
  write("index.html", index);
  changed += 1;
}

for (const [file, block, needle] of [
  ["espace-collectivites.html", collectivityBlock, '<section class="tvf-page-faq"'],
  ["espace-entreprises.html", enterpriseBlock, '<section class="tvf-page-faq"'],
  ["financer-projets.html", investorBlock, '<section class="tvf-page-faq"'],
]) {
  const html = read(file);
  const next = insertBeforeNeedle(html, needle, block);
  if (next !== html) {
    write(file, next);
    changed += 1;
  }
}

for (const file of publicPages) {
  if (file === "index.html") continue;
  const html = read(file);
  if (html.includes('class="engagement-journey"')) continue;
  const next = insertBeforeNeedle(html, '<section class="tvf-page-faq"', journeyHub);
  if (next !== html) {
    write(file, next);
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
