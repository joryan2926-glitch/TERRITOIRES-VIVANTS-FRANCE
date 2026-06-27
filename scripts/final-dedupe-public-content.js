const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

const documentaryCopy = /\s*<section class="doc-section compact"[^>]*data-copy-expansion="documentary"[\s\S]*?<\/section>/gi;
const logementDocumentaryCopy = /\s*<section class="doc-section"[^>]*data-deep-refonte="logements"[^>]*data-copy-expansion="documentary"[\s\S]*?<\/section>/gi;

const associationObject =
  /Territoires Vivants France a pour objet de contribuer &agrave; la revitalisation des territoires par le rep&eacute;rage, la qualification, la r&eacute;habilitation, le r&eacute;emploi et la remise en usage de biens, ressources et espaces aujourd'hui vacants ou sous-utilis&eacute;s\./g;
const associationObjectLong =
  /Territoires Vivants France a pour objet de contribuer &agrave; la revitalisation des territoires par le rep&eacute;rage, la qualification, la r&eacute;habilitation, le r&eacute;emploi et la remise en usage de biens, d'espaces et de ressources inutilis&eacute;s, notamment les logements vacants, commerces ferm&eacute;s, b&acirc;timents abandonn&eacute;s, friches, terrains d&eacute;laiss&eacute;s et mat&eacute;riaux r&eacute;employables\./g;
const associationObjectExtended =
  /Territoires Vivants France a pour objet de contribuer &agrave; la revitalisation des territoires par le rep&eacute;rage, la qualification, la r&eacute;habilitation, le r&eacute;emploi et la remise en usage de biens, d'espaces et de ressources inutilis&eacute;s, notamment les logements vacants, commerces ferm&eacute;s, b&acirc;timents abandonn&eacute;s, friches, terrains d&eacute;laiss&eacute;s et mat&eacute;riaux r&eacute;employables,[\s\S]*?\./g;

const associationObjectByPage = {
  "index.html":
    "Territoires Vivants France agit pour remettre en mouvement les logements, commerces, terrains, mat&eacute;riaux et comp&eacute;tences qui peuvent redevenir utiles aux habitants.",
  "qui-sommes-nous.html":
    "L'association se construit autour d'une id&eacute;e simple : relier l'observation de terrain, les propri&eacute;taires, les ressources de r&eacute;emploi et les acteurs locaux dans un cadre clair.",
  "pourquoi-tvf-existe.html":
    "TVF existe pour traiter les situations qui restent souvent entre plusieurs dispositifs : un bien vacant, un mat&eacute;riau disponible, un besoin local et des acteurs qui ne se rencontrent pas encore.",
  "gouvernance.html":
    "La gouvernance doit garantir que chaque action TVF reste tra&ccedil;able, d&eacute;cid&eacute;e dans un cadre clair et publi&eacute;e sans annoncer de r&eacute;sultat non v&eacute;rifi&eacute;.",
  "statuts.html":
    "L'objet statutaire vise la revitalisation des territoires par le rep&eacute;rage, la qualification, la r&eacute;habilitation, le r&eacute;emploi et la remise en usage de biens, ressources et espaces vacants ou sous-utilis&eacute;s.",
  "mentions-legales.html":
    "Cette page pr&eacute;sente les informations l&eacute;gales disponibles sur TERRITOIRES VIVANTS FRANCE et les &eacute;l&eacute;ments appel&eacute;s &agrave; &ecirc;tre compl&eacute;t&eacute;s apr&egrave;s formalisation officielle."
};

const housingDuplicates = [
  /<p>La vacance r&eacute;sidentielle n&rsquo;est pas un stock homog&egrave;ne de logements imm&eacute;diatement disponibles\.[\s\S]*?<\/p>/g,
  /<p>Pour Territoires Vivants France, l&rsquo;enjeu est donc de ne pas r&eacute;duire la vacance &agrave; un simple inventaire\.[\s\S]*?<\/p>/g,
  /<p>La hausse des co&ucirc;ts de travaux, les exigences &eacute;nerg&eacute;tiques, la complexit&eacute; des successions[\s\S]*?<\/p>/g,
  /<p>Un logement vacant durable r&eacute;duit la population r&eacute;sidente, affaiblit la client&egrave;le des commerces[\s\S]*?<\/p>/g,
  /<p>TVF peut intervenir comme tiers de confiance : signalement, qualification, dialogue avec le propri&eacute;taire[\s\S]*?<\/p>/g,
  /<p>Dans une commune moyenne, une maison ferm&eacute;e depuis dix ans pourrait &ecirc;tre &eacute;tudi&eacute;e comme logement temporaire[\s\S]*?<\/p>/g
];

const pageSpecificHousing = {
  "pole-habitat-vivant.html": `
        <section class="doc-section compact" data-unique-housing-copy="pole-habitat-vivant">
          <span class="doc-kicker">Lecture du p&ocirc;le</span>
          <h2>Habitat Vivant : transformer une vacance subie en usage utile</h2>
          <p>Cette page se concentre sur la cha&icirc;ne habitat : rep&eacute;rage du logement, dialogue avec le propri&eacute;taire, diagnostic, sc&eacute;nario d'usage et cadre de travaux. L'objectif n'est pas de publier une liste de biens, mais de faire &eacute;merger des solutions habitables, s&ucirc;res et adapt&eacute;es aux besoins locaux.</p>
          <div class="doc-grid">
            <article class="doc-card"><h3>Propri&eacute;taire</h3><p>Clarifier les contraintes, les co&ucirc;ts, les possibilit&eacute;s d'usage temporaire et la convention avant toute mobilisation.</p></article>
            <article class="doc-card"><h3>Collectivit&eacute;</h3><p>Relier le logement au besoin territorial : centre-ville, jeunesse, seniors, urgences sociales ou parcours r&eacute;sidentiels.</p></article>
            <article class="doc-card"><h3>Habitants</h3><p>Pr&eacute;parer des usages utiles sans promettre de logement disponible avant diagnostic, financement et validation.</p></article>
          </div>
        </section>`,
  "bien-solidaire-usage-partage.html": `
        <section class="doc-section compact" data-unique-housing-copy="bien-solidaire">
          <span class="doc-kicker">Dispositif propri&eacute;taire</span>
          <h2>Bien Solidaire : une convention avant toute remise en usage</h2>
          <p>Le programme Bien Solidaire &agrave; Usage Partag&eacute; traite un cas pr&eacute;cis : un propri&eacute;taire conserve son bien, mais accepte d'&eacute;tudier un usage temporaire ou partag&eacute; si une remise en &eacute;tat peut &ecirc;tre structur&eacute;e. La dur&eacute;e, les travaux, les charges, l'assurance, les responsabilit&eacute;s et la restitution doivent &ecirc;tre fix&eacute;s par &eacute;crit.</p>
          <div class="doc-grid">
            <article class="doc-card"><h3>Convention</h3><p>Elle pr&eacute;cise les droits d'usage, les engagements r&eacute;ciproques, les preuves attendues et les conditions de fin de dispositif.</p></article>
            <article class="doc-card"><h3>Valorisation</h3><p>Le bien peut gagner en usage, en entretien et en valeur patrimoniale si le projet est techniquement et financi&egrave;rement viable.</p></article>
            <article class="doc-card"><h3>Territoire</h3><p>Le projet doit r&eacute;pondre &agrave; un besoin local : logement, commerce, association, formation, tiers-lieu ou service de proximit&eacute;.</p></article>
          </div>
        </section>`
};

let changed = 0;

for (const file of files) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;

  html = html.replace(documentaryCopy, "");

  if (associationObjectByPage[file]) {
    html = html.replace(associationObject, associationObjectByPage[file]);
    html = html.replace(associationObjectLong, associationObjectByPage[file]);
    html = html.replace(associationObjectExtended, associationObjectByPage[file]);
  }

  if (file === "pole-habitat-vivant.html" || file === "bien-solidaire-usage-partage.html") {
    html = html.replace(logementDocumentaryCopy, "");
    for (const pattern of housingDuplicates) html = html.replace(pattern, "");
    if (!html.includes("data-unique-housing-copy")) {
      html = html.replace(/(<section class="tvf-page-faq")/i, `${pageSpecificHousing[file]}\n$1`);
    }
  }

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
