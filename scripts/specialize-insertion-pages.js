const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const insertionDoc = /\s*<section class="doc-section"[^>]*data-deep-refonte="insertion"[^>]*data-copy-expansion="documentary"[\s\S]*?<\/section>/gi;

const blocks = {
  "pole-solidarite-insertion.html": `
        <section class="doc-section" data-unique-insertion-copy="pole-solidarite-insertion">
          <span class="doc-kicker">Doctrine du p&ocirc;le</span>
          <h2>Solidarit&eacute; &amp; Insertion : organiser des parcours utiles, encadr&eacute;s et progressifs</h2>
          <p>Le p&ocirc;le Solidarit&eacute; &amp; Insertion ne promet pas des emplois avant que les partenariats, les chantiers et les financements existent. Il d&eacute;crit une m&eacute;thode : transformer les besoins de revitalisation en missions adapt&eacute;es, s&eacute;curis&eacute;es et reli&eacute;es aux acteurs de l'emploi, de la formation et de l'accompagnement social.</p>
          <div class="data-grid" aria-label="Rep&egrave;res insertion">
            <article class="data-card"><strong>15,4 %</strong><span>taux de pauvret&eacute; en France m&eacute;tropolitaine en 2023</span><small>INSEE, seuil &agrave; 60 % du niveau de vie m&eacute;dian.</small></article>
            <article class="data-card"><strong>3 niveaux</strong><span>b&eacute;n&eacute;volat, formation, insertion</span><small>Les parcours doivent &ecirc;tre gradu&eacute;s et encadr&eacute;s.</small></article>
            <article class="data-card"><strong>0 mission</strong><span>sans cadre de s&eacute;curit&eacute;</span><small>Assurance, encadrement et comp&eacute;tences sont indispensables.</small></article>
          </div>
          <div class="analysis-columns">
            <article class="analysis-note"><strong>R&ocirc;le du p&ocirc;le</strong><p>Identifier les t&acirc;ches compatibles avec l'engagement citoyen : inventaire, m&eacute;diation, tri, logistique, animation, documentation et accueil.</p></article>
            <article class="analysis-note"><strong>Limite</strong><p>Les travaux techniques, dangereux ou r&eacute;glement&eacute;s restent confi&eacute;s &agrave; des professionnels qualifi&eacute;s.</p></article>
          </div>
        </section>`,
  "espace-benevoles.html": `
        <section class="doc-section" data-unique-insertion-copy="espace-benevoles">
          <span class="doc-kicker">Parcours b&eacute;n&eacute;voles</span>
          <h2>Des missions concr&egrave;tes, utiles et adapt&eacute;es au temps disponible</h2>
          <p>L'espace b&eacute;n&eacute;voles doit aider chacun &agrave; comprendre o&ugrave; il peut contribuer sans se surexposer : signalement, cartographie, inventaire de mat&eacute;riaux, appui logistique, accueil d'&eacute;v&eacute;nement, documentation, communication locale ou soutien &agrave; une antenne en cr&eacute;ation.</p>
          <div class="decision-flow" aria-label="Parcours b&eacute;n&eacute;vole">
            <article><h3>1. Se pr&eacute;senter</h3><p>Indiquer disponibilit&eacute;s, territoire, comp&eacute;tences et contraintes.</p></article>
            <article><h3>2. &Ecirc;tre orient&eacute;</h3><p>Recevoir une mission compatible avec le niveau d'encadrement disponible.</p></article>
            <article><h3>3. Agir</h3><p>Contribuer &agrave; une action document&eacute;e, sans intervenir sur des t&acirc;ches dangereuses.</p></article>
            <article><h3>4. Tracer</h3><p>Documenter le temps donn&eacute;, les besoins observ&eacute;s et les suites possibles.</p></article>
          </div>
          <div class="data-gap"><strong>Important :</strong> les missions b&eacute;n&eacute;voles seront ouvertes progressivement selon les besoins r&eacute;els, les assurances, l'encadrement et les projets valid&eacute;s.</div>
        </section>`
};

let changed = 0;

for (const [file, block] of Object.entries(blocks)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  html = html.replace(insertionDoc, "");
  if (!html.includes("data-unique-insertion-copy")) {
    html = html.replace(/(<section class="tvf-page-faq")/i, `${block}\n$1`);
  }
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
