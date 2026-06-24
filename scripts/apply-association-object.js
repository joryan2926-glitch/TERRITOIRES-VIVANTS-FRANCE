const fs = require("fs");
const path = require("path");

const root = process.cwd();

const objectWordingHtml =
  "Territoires Vivants France a pour objet de contribuer &agrave; la revitalisation des territoires par le rep&eacute;rage, la qualification, la r&eacute;habilitation, le r&eacute;emploi et la remise en usage de biens, d'espaces et de ressources inutilis&eacute;s, notamment les logements vacants, commerces ferm&eacute;s, b&acirc;timents abandonn&eacute;s, friches, terrains d&eacute;laiss&eacute;s et mat&eacute;riaux r&eacute;employables, au b&eacute;n&eacute;fice des habitants, des collectivit&eacute;s, des associations et des acteurs locaux.";

const objectWordingText =
  "Territoires Vivants France a pour objet de contribuer à la revitalisation des territoires par le repérage, la qualification, la réhabilitation, le réemploi et la remise en usage de biens, d'espaces et de ressources inutilisés, notamment les logements vacants, commerces fermés, bâtiments abandonnés, friches, terrains délaissés et matériaux réemployables, au bénéfice des habitants, des collectivités, des associations et des acteurs locaux.";

const missionsHtml = [
  ["Identifier", "Rep&eacute;rer et documenter les logements vacants, commerces ferm&eacute;s, b&acirc;timents abandonn&eacute;s, friches, terrains inutilis&eacute;s et ressources encore utiles."],
  ["Qualifier", "Analyser les contraintes juridiques, techniques, sociales, environnementales et territoriales avant toute orientation."],
  ["Accompagner", "Aider les propri&eacute;taires, collectivit&eacute;s, associations, entreprises et habitants &agrave; transformer une ressource inutilis&eacute;e en projet utile."],
  ["R&eacute;employer", "Organiser la valorisation des mat&eacute;riaux disponibles dans une logique d'&eacute;conomie circulaire et de coop&eacute;ration territoriale."],
  ["Mobiliser", "Structurer l'engagement citoyen, le b&eacute;n&eacute;volat, les comp&eacute;tences, les partenariats et les financements effectivement confirm&eacute;s."],
  ["Transmettre", "Produire des donn&eacute;es, des outils, des m&eacute;thodes et des retours d'exp&eacute;rience pour aider les territoires &agrave; agir avec rigueur."],
];

const missionsText = [
  ["Identifier", "Repérer et documenter les logements vacants, commerces fermés, bâtiments abandonnés, friches, terrains inutilisés et ressources encore utiles."],
  ["Qualifier", "Analyser les contraintes juridiques, techniques, sociales, environnementales et territoriales avant toute orientation."],
  ["Accompagner", "Aider les propriétaires, collectivités, associations, entreprises et habitants à transformer une ressource inutilisée en projet utile."],
  ["Réemployer", "Organiser la valorisation des matériaux disponibles dans une logique d'économie circulaire et de coopération territoriale."],
  ["Mobiliser", "Structurer l'engagement citoyen, le bénévolat, les compétences, les partenariats et les financements effectivement confirmés."],
  ["Transmettre", "Produire des données, des outils, des méthodes et des retours d'expérience pour aider les territoires à agir avec rigueur."],
];

const guardrailsHtml = [
  "Aucun partenaire, financeur, chiffre d'impact ou projet r&eacute;alis&eacute; n'est pr&eacute;sent&eacute; comme acquis s'il n'est pas confirm&eacute;.",
  "Chaque projet est instruit avant engagement : diagnostic, faisabilit&eacute;, cadre juridique, ressources et capacit&eacute; de suivi.",
  "Les ressources confi&eacute;es &agrave; TVF sont orient&eacute;es vers des projets valid&eacute;s ; elles ne sont pas distribu&eacute;es automatiquement.",
  "Les informations statutaires et administratives seront actualis&eacute;es apr&egrave;s la d&eacute;claration officielle de l'association.",
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content);
}

function card(title, text) {
  return `<article class="dossier-card"><h3>${title}</h3><p>${text}</p></article>`;
}

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function whoSection() {
  return `<section class="dossier-section association-object-block" id="objet-associatif-reference" data-association-object="true">
        <span class="dossier-kicker">Objet associatif</span>
        <h2>La formulation de r&eacute;f&eacute;rence de la mission TVF</h2>
        <p class="lead-block">${objectWordingHtml}</p>
        <div class="dossier-grid">
          ${missionsHtml.map(([title, text]) => card(title, text)).join("\n          ")}
        </div>
      </section>
      <section class="dossier-section association-object-block" id="cadre-de-credibilite-tvf">
        <span class="dossier-kicker">Cadre de confiance</span>
        <h2>Des engagements proportionn&eacute;s &agrave; une association en cr&eacute;ation</h2>
        <div class="source-register"><ul>${list(guardrailsHtml)}</ul></div>
      </section>`;
}

function statutesSection() {
  return `<section class="dossier-section association-object-block" id="objet-associatif-reference" data-association-object="true">
        <span class="dossier-kicker">Cadre statutaire</span>
        <h2>Une base &agrave; consolider dans les statuts d&eacute;finitifs</h2>
        <p class="lead-block">${objectWordingHtml}</p>
        <div class="dossier-grid">
          ${card("P&eacute;rim&egrave;tre", "L'objet couvre le patrimoine vacant, les ressources r&eacute;employables, la coop&eacute;ration territoriale et l'accompagnement de projets d'int&eacute;r&ecirc;t collectif.")}
          ${card("Moyens d'action", "Diagnostics, &eacute;tudes, conventions, chantiers encadr&eacute;s, collecte orient&eacute;e, animation territoriale, formation et production de ressources.")}
          ${card("Version officielle", "La version opposable sera celle des statuts sign&eacute;s et d&eacute;clar&eacute;s. Le site sera mis &agrave; jour avec les r&eacute;f&eacute;rences administratives d&eacute;finitives.")}
        </div>
      </section>`;
}

function governanceSection() {
  return `<section class="dossier-section association-object-block" id="objet-associatif-reference" data-association-object="true">
        <span class="dossier-kicker">Objet et d&eacute;cision</span>
        <h2>Chaque arbitrage doit servir la mission associative</h2>
        <p class="lead-block">${objectWordingHtml}</p>
        <div class="dossier-grid">
          ${card("Conformit&eacute;", "V&eacute;rifier que le projet entre dans l'objet, respecte les r&egrave;gles applicables et pr&eacute;sente une utilit&eacute; territoriale explicite.")}
          ${card("Proportionnalit&eacute;", "Adapter l'engagement de TVF aux comp&eacute;tences, financements, assurances et capacit&eacute;s de suivi effectivement disponibles.")}
          ${card("Impartialit&eacute;", "Identifier les int&eacute;r&ecirc;ts en pr&eacute;sence, pr&eacute;venir les conflits et documenter les conditions de s&eacute;lection.")}
          ${card("Tra&ccedil;abilit&eacute;", "Conserver l'origine de la demande, les avis, la d&eacute;cision, la convention applicable et les &eacute;tapes de suivi.")}
        </div>
      </section>`;
}

function legalSection() {
  return `<section class="dossier-section association-object-block" id="objet-associatif-reference" data-association-object="true">
        <span class="dossier-kicker">Information institutionnelle</span>
        <h2>Objet et statut des informations publi&eacute;es</h2>
        <p class="lead-block">${objectWordingHtml}</p>
        <div class="source-register"><ul>
          <li>TVF est pr&eacute;sent&eacute;e comme une association en cours de structuration tant que sa d&eacute;claration officielle n'est pas publi&eacute;e.</li>
          <li>Le num&eacute;ro RNA, l'identifiant SIREN ou SIRET, la date de parution au JOAFE et les coordonn&eacute;es d'h&eacute;bergement seront ajout&eacute;s apr&egrave;s confirmation.</li>
          <li>Les documents officiels pr&eacute;vaudront sur toute pr&eacute;sentation synth&eacute;tique du site.</li>
        </ul></div>
      </section>`;
}

function whySection() {
  return `<section class="dossier-section association-object-block" id="objet-associatif-reference" data-association-object="true">
        <span class="dossier-kicker">Raison d'&ecirc;tre</span>
        <h2>Relier les ressources d&eacute;laiss&eacute;es aux besoins du territoire</h2>
        <p class="lead-block">${objectWordingHtml}</p>
        <div class="dossier-grid">
          ${card("Un constat", "Des logements, commerces, b&acirc;timents, terrains et mat&eacute;riaux restent inutilis&eacute;s alors que des besoins locaux demeurent sans r&eacute;ponse.")}
          ${card("Une m&eacute;thode", "TVF propose d'identifier, qualifier puis orienter ces ressources vers des projets faisables, utiles et suivis dans le temps.")}
          ${card("Une finalit&eacute;", "Am&eacute;liorer le cadre de vie, soutenir les initiatives locales et limiter le gaspillage sans promettre de r&eacute;sultat avant l'instruction du projet.")}
        </div>
      </section>`;
}

function homeSection() {
  return `<section class="home-object-section" id="objet-associatif-reference" data-association-object="true">
      <div>
        <span class="section-kicker">Objet de l'association</span>
        <h2>Une mission nationale de revitalisation utile aux habitants</h2>
        <p>${objectWordingHtml}</p>
      </div>
      <div class="objective-list">
        <article><strong>Biens vacants</strong><span>Logements, commerces, b&acirc;timents, friches et terrains &agrave; qualifier.</span></article>
        <article><strong>Ressources utiles</strong><span>Mat&eacute;riaux, mobiliers et &eacute;quipements orient&eacute;s vers des projets valid&eacute;s.</span></article>
        <article><strong>Coop&eacute;ration locale</strong><span>Habitants, collectivit&eacute;s, propri&eacute;taires, associations et entreprises r&eacute;unis autour d'un cadre clair.</span></article>
      </div>
    </section>`;
}

function replaceOrInsert(file, section, pattern) {
  let html = read(file);
  if (pattern.test(html)) {
    html = html.replace(pattern, `\n      ${section}`);
  } else {
    html = html.replace(/\s*<\/main>/i, `\n      ${section}\n    </main>`);
  }
  write(file, html);
}

function updateStatutesObject() {
  const file = "statuts.html";
  const html = read(file);
  const replacement = `<article class="statut-article">
            <h2>Objet</h2>
            <p>${objectWordingHtml} Cette formulation constitue une base de travail &agrave; reprendre dans les statuts d&eacute;finitifs.</p>
          </article>`;
  const pattern = /<article class="statut-article">\s*<h2>Objet<\/h2>\s*<p>[\s\S]*?<\/p>\s*<\/article>/i;
  write(file, html.replace(pattern, replacement));
}

function updateReadme() {
  const file = "README.md";
  if (!fs.existsSync(path.join(root, file))) return;
  let md = read(file);
  const section = `## Objet de l'association\n\n${objectWordingText}\n\n### Missions principales\n\n${missionsText
    .map(([title, text]) => `- **${title}** : ${text}`)
    .join("\n")}\n\nCette formulation reste modifiable après déclaration officielle, validation des statuts et publication des informations administratives définitives.\n`;
  const marker = /\n\n## Objet de l'association[\s\S]*$/;
  md = marker.test(md) ? md.replace(marker, `\n\n${section}`) : `${md.trimEnd()}\n\n${section}`;
  write(file, md);
}

const institutionalPattern = /\s*<section class="dossier-section association-object-block" id="objet-associatif-reference"[\s\S]*?<\/section>(?:\s*<section class="dossier-section association-object-block" id="cadre-de-credibilite-tvf">[\s\S]*?<\/section>)?/i;
const homePattern = /\s*<section class="home-object-section" id="objet-associatif-reference"[\s\S]*?<\/section>/i;

replaceOrInsert("index.html", homeSection(), homePattern);
replaceOrInsert("qui-sommes-nous.html", whoSection(), institutionalPattern);
updateStatutesObject();
replaceOrInsert("statuts.html", statutesSection(), institutionalPattern);
replaceOrInsert("gouvernance.html", governanceSection(), institutionalPattern);
replaceOrInsert("mentions-legales.html", legalSection(), institutionalPattern);
replaceOrInsert("pourquoi-tvf-existe.html", whySection(), institutionalPattern);
updateReadme();

console.log(JSON.stringify({
  updated: [
    "index.html",
    "qui-sommes-nous.html",
    "statuts.html",
    "gouvernance.html",
    "mentions-legales.html",
    "pourquoi-tvf-existe.html",
    "README.md",
  ],
}, null, 2));
