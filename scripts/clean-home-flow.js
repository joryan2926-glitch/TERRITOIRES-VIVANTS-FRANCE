const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "index.html");
let html = fs.readFileSync(file, "utf8");

const startMarker = '<section class="page-wrap">';
const endMarker = '<section class="news-section"';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  throw new Error("Unable to locate home flow block.");
}

const replacement = `      <section class="page-wrap tvf-flow" aria-labelledby="flow-title">
        <div class="flow-intro">
          <span class="dossier-kicker">Comprendre l'action TVF</span>
          <h2 id="flow-title" class="section-heading">Une m&eacute;thode simple : rep&eacute;rer, qualifier, mobiliser, remettre en usage</h2>
          <p class="lead-block">Territoires Vivants France se construit comme une association nationale de terrain. Son r&ocirc;le n'est pas d'annoncer des r&eacute;sultats avant qu'ils existent, mais d'organiser une m&eacute;thode fiable pour transformer des ressources inutilis&eacute;es en projets utiles.</p>
        </div>

        <div class="flow-steps" aria-label="Suite logique d'intervention">
          <article><strong>1</strong><h3>Observer</h3><p>Identifier les logements vacants, commerces ferm&eacute;s, friches, b&acirc;timents et mat&eacute;riaux disponibles.</p></article>
          <article><strong>2</strong><h3>Qualifier</h3><p>V&eacute;rifier la situation, les contraintes juridiques, techniques, sociales et la faisabilit&eacute; d'une action.</p></article>
          <article><strong>3</strong><h3>Mobiliser</h3><p>Rassembler habitants, propri&eacute;taires, collectivit&eacute;s, entreprises, associations et comp&eacute;tences locales.</p></article>
          <article><strong>4</strong><h3>Agir</h3><p>Construire des conventions, rechercher les moyens, orienter les mat&eacute;riaux et suivre les projets valid&eacute;s.</p></article>
        </div>

        <div class="impact-audiences" aria-label="B&eacute;n&eacute;fices pour les parties prenantes">
          <article class="audience-card"><h3>Pour les habitants</h3><p>Retrouver des lieux utiles : logements, activit&eacute;s de proximit&eacute;, espaces partag&eacute;s, services et projets associatifs.</p></article>
          <article class="audience-card"><h3>Pour les collectivit&eacute;s</h3><p>Disposer d'un cadre pour rep&eacute;rer les ressources inexploit&eacute;es, prioriser les besoins et pr&eacute;parer des coop&eacute;rations territoriales.</p></article>
          <article class="audience-card"><h3>Pour les propri&eacute;taires</h3><p>&Eacute;tudier des solutions lorsqu'un bien vacant, d&eacute;grad&eacute; ou inutilis&eacute; manque de moyens pour retrouver une fonction.</p></article>
          <article class="audience-card"><h3>Pour les entreprises</h3><p>Valoriser des mat&eacute;riaux, des comp&eacute;tences ou du m&eacute;c&eacute;nat dans une logique de responsabilit&eacute; territoriale.</p></article>
        </div>

        <div class="flow-note">
          <p><strong>Principe de confiance :</strong> TVF ne publie pas de faux chiffres d'impact, ne pr&eacute;sente pas de partenaires non confirm&eacute;s et distingue clairement les projets envisag&eacute;s, les dispositifs en construction et les r&eacute;sultats v&eacute;rifi&eacute;s.</p>
          <a class="button primary" href="notre-methode.html">Voir notre m&eacute;thode</a>
        </div>
      </section>

`;

html = html.slice(0, start) + replacement + html.slice(end);
fs.writeFileSync(file, html, "utf8");
console.log(JSON.stringify({ updated: "index.html", removedGenericHomeBlocks: true }, null, 2));
