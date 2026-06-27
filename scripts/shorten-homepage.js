const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

html = html.replace(
  /<p>\s*TERRITOIRES VIVANTS FRANCE agit[\s\S]*?opportunités pour les habitants\.\s*<\/p>/,
  `<p>
            Un bien vacant, un commerce ferm&eacute;, des mat&eacute;riaux disponibles ou une friche : TVF aide &agrave; qualifier la situation, mobiliser les bons acteurs et passer &agrave; l'action.
          </p>`,
);

html = html.replace(
  /<div class="hero-actions" aria-label="Actions principales">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
  `<div class="hero-actions" aria-label="Actions principales">
            <a class="button primary" href="signalement.html">Signaler un lieu <span aria-hidden="true">&rarr;</span></a>
            <a class="button secondary" href="bien-solidaire-usage-partage.html">Proposer un bien</a>
            <a class="button accent" href="contact.html">Nous contacter</a>
          </div>
        </div>
      </section>`,
);

html = html.replace(
  /<span class="dossier-kicker">TVF en 20 secondes<\/span>\s*<h2 id="start-hub-title">[\s\S]*?<\/p>/,
  `<span class="dossier-kicker">D&eacute;marrer</span>
          <h2 id="start-hub-title">Vous avez une situation ? Choisissez l'action.</h2>
          <p>
            L'objectif est simple : ne pas laisser une ressource utile dormir. En quelques clics, orientez votre demande vers le bon parcours.
          </p>`,
);

html = html.replace(
  /<p>Chaque public arrive avec une question diff&eacute;rente[\s\S]*?<\/p>/,
  `<p>Un acc&egrave;s direct selon votre r&ocirc;le. Pas besoin de comprendre toute l'arborescence.</p>`,
);

const start = html.indexOf('      <section class="page-wrap clear-summary"');
const end = html.indexOf('      <section class="tvf-page-faq"', start);

if (start === -1 || end === -1) {
  throw new Error("Homepage replacement markers not found");
}

const directSections = `      <section class="home-direct-map" aria-labelledby="direct-map-title">
        <div class="direct-map-head">
          <span class="dossier-kicker">La m&eacute;thode</span>
          <h2 id="direct-map-title">3 &eacute;tapes, pas plus.</h2>
        </div>
        <div class="direct-map-grid">
          <article><span>1</span><h3>Rep&eacute;rer</h3><p>Un lieu vacant, un besoin local ou une ressource disponible.</p></article>
          <article><span>2</span><h3>Qualifier</h3><p>V&eacute;rifier l'usage possible, les contraintes, les acteurs et les moyens.</p></article>
          <article><span>3</span><h3>Activer</h3><p>Construire une convention, orienter les ressources et suivre le projet.</p></article>
        </div>
      </section>

      <section class="home-priority-routes" aria-label="Acc&egrave;s directs aux principaux parcours">
        <a href="signalement.html"><strong>J'ai rep&eacute;r&eacute; un lieu vacant</strong><span>Signaler une situation &agrave; qualifier.</span></a>
        <a href="banque-materiaux.html"><strong>J'ai des mat&eacute;riaux</strong><span>Proposer une ressource utile &agrave; un projet.</span></a>
        <a href="espace-collectivites.html"><strong>Je repr&eacute;sente une collectivit&eacute;</strong><span>Comprendre le cadre de coop&eacute;ration.</span></a>
        <a href="proprietaires.html"><strong>Je suis propri&eacute;taire</strong><span>&Eacute;tudier la remise en usage d'un bien.</span></a>
      </section>

      <section class="home-pilot-strip" aria-labelledby="pilot-strip-title">
        <div>
          <span class="dossier-kicker">Territoire pilote</span>
          <h2 id="pilot-strip-title">Saint-&Eacute;tienne sert de terrain d'application.</h2>
          <p>TVF part d'un territoire concret pour tester sa m&eacute;thode : patrimoine vacant, commerces ferm&eacute;s, friches, r&eacute;emploi et coop&eacute;ration locale.</p>
        </div>
        <div class="pilot-actions">
          <a class="button primary" href="dossier-saint-etienne.html">Voir le dossier</a>
          <a class="button secondary" href="carte-territoires.html">Voir la carte</a>
        </div>
      </section>

`;

html = html.slice(0, start) + directSections + html.slice(end);

fs.writeFileSync(file, html, "utf8");
console.log(JSON.stringify({ updated: file }, null, 2));
