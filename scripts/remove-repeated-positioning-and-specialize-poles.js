const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

const dedicatedPage = "ce-que-fait-tvf.html";
const differenceSectionPattern = /\s*<section class="tvf-difference-section"[\s\S]*?<\/section>/g;

const menuTextReplacements = [
  ["La valeur ajout&eacute;e d'une plateforme de coordination.", "R&ocirc;le, limites et m&eacute;thode."],
  ["La valeur ajoutée d'une plateforme de coordination.", "R&ocirc;le, limites et m&eacute;thode."],
  [
    "Relier TVF aux priorit&eacute;s publiques locales.",
    "Priorit&eacute;s publiques et actions locales."
  ],
  [
    "Aligner l'action TVF avec les priorit&eacute;s publiques locales.",
    "Priorit&eacute;s publiques et actions locales."
  ],
];

const wordingReplacements = [
  [
    "sans se substituer aux dispositifs existants",
    "avec les structures comp&eacute;tentes"
  ],
  [
    "sans se substituer &agrave; eux",
    "avec eux dans un cadre formalis&eacute;"
  ],
  [
    "sans se substituer aux dispositifs existants.",
    "avec les structures comp&eacute;tentes."
  ],
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function applyCommonCleanup(file) {
  let html = read(file);
  const before = html;

  if (file !== dedicatedPage) {
    html = html.replace(differenceSectionPattern, "");
  }

  for (const [from, to] of menuTextReplacements) {
    html = html.split(from).join(to);
  }

  if (file !== dedicatedPage) {
    for (const [from, to] of wordingReplacements) {
      html = html.split(from).join(to);
    }
  }

  if (html !== before) write(file, html);
  return html !== before;
}

function poleBlock(id, html) {
  return `
        <section class="doc-section pole-specific-section" data-unique-pole-content="${id}" aria-labelledby="${id}-unique-title">
${html.trim()}
        </section>
`;
}

const uniquePoleBlocks = {
  "pole-habitat-vivant.html": poleBlock(
    "habitat-vivant",
    `
          <span class="doc-kicker">Logements vacants</span>
          <h2 id="habitat-vivant-unique-title">Du logement inoccup&eacute; &agrave; une solution d'habitat utile</h2>
          <p>Habitat Vivant traite d'abord une question tr&egrave;s concr&egrave;te : pourquoi un logement reste vide, dans quel &eacute;tat il se trouve, qui peut d&eacute;cider, quels travaux sont n&eacute;cessaires et quel usage peut &ecirc;tre rendu possible sans fragiliser le propri&eacute;taire ni les futurs occupants.</p>
          <div class="data-grid" aria-label="Rep&egrave;res habitat">
            <article class="data-card"><strong>2,99 M</strong><span>logements vacants en France</span><small>INSEE, recensement 2022.</small></article>
            <article class="data-card"><strong>+ 1 M</strong><span>logements vacants de longue dur&eacute;e</span><small>Ordre de grandeur Z&eacute;ro Logement Vacant.</small></article>
            <article class="data-card"><strong>6</strong><span>points &agrave; qualifier</span><small>Propri&eacute;t&eacute;, &eacute;tat, travaux, usage, budget, convention.</small></article>
          </div>
          <div class="decision-flow" aria-label="Parcours propri&eacute;taire">
            <article><h3>1. Proposer</h3><p>Le propri&eacute;taire ou un acteur local signale un logement vacant, d&eacute;grad&eacute; ou sous-utilis&eacute;.</p></article>
            <article><h3>2. V&eacute;rifier</h3><p>TVF rassemble les informations minimales : adresse, statut, &eacute;tat visible, contraintes et interlocuteurs.</p></article>
            <article><h3>3. Diagnostiquer</h3><p>Une visite ou une analyse technique doit pr&eacute;ciser les risques, les travaux, les diagnostics et l'assurance.</p></article>
            <article><h3>4. Sc&eacute;nariser</h3><p>Usage possible : logement temporaire, habitat partag&eacute;, solution &eacute;tudiante, interg&eacute;n&eacute;rationnelle ou solidaire.</p></article>
            <article><h3>5. Conventionner</h3><p>Dur&eacute;e, travaux, charges, usage, responsabilit&eacute;s et restitution doivent &ecirc;tre &eacute;crits.</p></article>
            <article><h3>6. Suivre</h3><p>Le projet est suivi avec des preuves : devis, photos autoris&eacute;es, compte rendu, indicateurs et bilan.</p></article>
          </div>
          <div class="table-scroll"><table class="impact-data-table"><thead><tr><th>Public concern&eacute;</th><th>Besoin</th><th>R&eacute;ponse Habitat Vivant</th></tr></thead><tbody><tr><td>Propri&eacute;taire</td><td>Sortir d'une vacance subie sans perdre la propri&eacute;t&eacute; du bien.</td><td>Diagnostic, sc&eacute;nario d'usage, convention, recherche de ressources et suivi.</td></tr><tr><td>Collectivit&eacute;</td><td>Remettre du logement dans le parc existant et limiter la d&eacute;gradation.</td><td>Rep&eacute;rage, priorisation, lien avec les dispositifs habitat et lecture territoriale.</td></tr><tr><td>Habitants</td><td>Acc&eacute;der &agrave; des lieux remis en &eacute;tat et utiles.</td><td>Usages adapt&eacute;s au besoin local, sans annoncer de logement disponible avant validation.</td></tr></tbody></table></div>
          <div class="doc-faq" aria-label="FAQ Habitat Vivant"><article><h3>TVF devient-elle propri&eacute;taire du logement ?</h3><p>Non. Le propri&eacute;taire conserve son bien. Le cadre peut pr&eacute;voir un usage temporaire, une coop&eacute;ration ou un accompagnement, selon le projet.</p></article><article><h3>Un logement signal&eacute; est-il automatiquement retenu ?</h3><p>Non. Il doit &ecirc;tre juridiquement, techniquement et financi&egrave;rement qualifi&eacute;.</p></article><article><h3>Quels partenaires peuvent &ecirc;tre concern&eacute;s ?</h3><p>Propri&eacute;taires, communes, EPCI, op&eacute;rateurs habitat, artisans, assureurs, financeurs, associations et habitants.</p></article></div>
    `
  ),

  "pole-materiautheque-solidaire.html": poleBlock(
    "materiautheque-solidaire",
    `
          <span class="doc-kicker">R&eacute;emploi des mat&eacute;riaux</span>
          <h2 id="materiautheque-solidaire-unique-title">Qualifier, tracer et affecter les ressources au bon projet</h2>
          <p>La Mat&eacute;riauth&egrave;que Solidaire n'est pas une distribution libre. Son r&ocirc;le est de transformer des surplus, invendus, d&eacute;poses de chantier ou mobiliers inutilis&eacute;s en ressources territoriales orient&eacute;es vers des projets valid&eacute;s.</p>
          <div class="data-grid" aria-label="Rep&egrave;res mat&eacute;riaux">
            <article class="data-card"><strong>310 Mt</strong><span>d&eacute;chets produits en France</span><small>SDES, bilan national 2020.</small></article>
            <article class="data-card"><strong>66 %</strong><span>tonnages min&eacute;raux issus de la construction</span><small>SDES, bilan 2020.</small></article>
            <article class="data-card"><strong>0</strong><span>distribution automatique</span><small>Chaque ressource doit &ecirc;tre accept&eacute;e et affect&eacute;e.</small></article>
          </div>
          <div class="decision-flow" aria-label="Cycle des mat&eacute;riaux">
            <article><h3>1. Proposer</h3><p>Une entreprise, collectivit&eacute;, association ou personne propose bois, portes, fen&ecirc;tres, sanitaires, mobilier ou &eacute;quipements.</p></article>
            <article><h3>2. Qualifier</h3><p>TVF v&eacute;rifie l'&eacute;tat, la quantit&eacute;, les dimensions, les risques, la conformit&eacute; et les conditions de retrait.</p></article>
            <article><h3>3. Trier</h3><p>Les ressources sont class&eacute;es par cat&eacute;gorie, usage possible, urgence de retrait et contraintes de stockage.</p></article>
            <article><h3>4. Stocker</h3><p>Un stockage temporaire peut &ecirc;tre organis&eacute; seulement si la logistique, l'assurance et la s&eacute;curit&eacute; sont clarifi&eacute;es.</p></article>
            <article><h3>5. Affecter</h3><p>Les mat&eacute;riaux sont orient&eacute;s vers un projet valid&eacute; : habitat, local associatif, chantier solidaire, formation ou am&eacute;nagement.</p></article>
            <article><h3>6. Prouver</h3><p>La tra&ccedil;abilit&eacute; conserve origine, quantit&eacute;, destination, photos autoris&eacute;es et bilan de r&eacute;emploi.</p></article>
          </div>
          <div class="table-scroll"><table class="impact-data-table"><thead><tr><th>Contributeur</th><th>Apport possible</th><th>Cadre attendu</th></tr></thead><tbody><tr><td>Entreprise</td><td>Surplus, invendus, mat&eacute;riaux de chantier, mobilier professionnel.</td><td>Convention de valorisation, tra&ccedil;abilit&eacute;, calendrier, communication valid&eacute;e.</td></tr><tr><td>Collectivit&eacute;</td><td>Mat&eacute;riaux, mobilier, &eacute;quipements publics inutilis&eacute;s.</td><td>Coop&eacute;ration territoriale et affectation &agrave; des usages utiles localement.</td></tr><tr><td>Particulier</td><td>Outils, meubles, luminaires, portes, fen&ecirc;tres, &eacute;quipements r&eacute;utilisables.</td><td>Acceptation apr&egrave;s qualification ; pas de d&eacute;p&ocirc;t sauvage ni de collecte non valid&eacute;e.</td></tr></tbody></table></div>
          <div class="doc-faq" aria-label="FAQ Mat&eacute;riauth&egrave;que"><article><h3>Peut-on venir prendre des mat&eacute;riaux librement ?</h3><p>Non. Les mat&eacute;riaux sont affect&eacute;s &agrave; des projets qualifi&eacute;s par TVF.</p></article><article><h3>Quels mat&eacute;riaux sont refus&eacute;s ?</h3><p>Tout &eacute;l&eacute;ment dangereux, non tra&ccedil;able, trop d&eacute;grad&eacute;, impossible &agrave; stocker ou incompatible avec les usages pr&eacute;vus.</p></article><article><h3>Quels partenaires sont concern&eacute;s ?</h3><p>Entreprises du BTP, d&eacute;constructeurs, artisans, collectivit&eacute;s, associations, ressourceries, logisticiens et lieux de stockage.</p></article></div>
    `
  ),

  "pole-commerce-vivant.html": poleBlock(
    "commerce-vivant",
    `
          <span class="doc-kicker">Commerces vacants</span>
          <h2 id="commerce-vivant-unique-title">Rendre un local commercial lisible, testable et utile</h2>
          <p>Commerce Vivant se concentre sur les vitrines ferm&eacute;es, cellules vides et rez-de-chauss&eacute;e sans usage. Le sujet n'est pas seulement immobilier : un commerce vacant modifie la perception d'une rue, les flux pi&eacute;tons, la confiance des porteurs de projet et la vie quotidienne des habitants.</p>
          <div class="data-grid" aria-label="Rep&egrave;res commerces">
            <article class="data-card"><strong>244</strong><span>communes Action C&oelig;ur de Ville</span><small>ANCT, programme national.</small></article>
            <article class="data-card"><strong>Local</strong><span>vacance commerciale &agrave; mesurer</span><small>Le taux pertinent doit &ecirc;tre relev&eacute; par rue, quartier et centralit&eacute;.</small></article>
            <article class="data-card"><strong>5</strong><span>usages testables</span><small>Boutique, atelier, tiers-lieu, association, service de proximit&eacute;.</small></article>
          </div>
          <div class="decision-flow" aria-label="Parcours local commercial">
            <article><h3>1. Rep&eacute;rer</h3><p>Identifier la cellule, son &eacute;tat, sa visibilit&eacute;, son environnement et sa dur&eacute;e apparente de fermeture.</p></article>
            <article><h3>2. Comprendre</h3><p>Qualifier les freins : loyer, travaux, accessibilit&eacute;, copropri&eacute;t&eacute;, destination, stationnement, flux ou image de rue.</p></article>
            <article><h3>3. Rencontrer</h3><p>Identifier propri&eacute;taire, gestionnaire, commune, association de commer&ccedil;ants et porteurs potentiels.</p></article>
            <article><h3>4. Tester</h3><p>Imaginer un usage temporaire : boutique &eacute;ph&eacute;m&egrave;re, atelier, permanence, exposition, service local ou formation.</p></article>
            <article><h3>5. Encadrer</h3><p>Pr&eacute;ciser dur&eacute;e, charges, assurances, travaux l&eacute;gers, communication et conditions de sortie.</p></article>
            <article><h3>6. Mesurer</h3><p>Suivre ouverture, fr&eacute;quentation qualitative, satisfaction, besoins de travaux et suite possible.</p></article>
          </div>
          <div class="table-scroll"><table class="impact-data-table"><thead><tr><th>Situation</th><th>Risque</th><th>R&eacute;ponse Commerce Vivant</th></tr></thead><tbody><tr><td>Vitrine ferm&eacute;e en centre-ville</td><td>Rue per&ccedil;ue comme en d&eacute;clin.</td><td>Diagnostic de vitrine, usage temporaire et recherche de porteur local.</td></tr><tr><td>Local trop grand ou trop cher</td><td>Aucune activit&eacute; ne peut s'installer durablement.</td><td>Sc&eacute;nario de partage, occupation progressive ou usage associatif encadr&eacute;.</td></tr><tr><td>Local d&eacute;grad&eacute;</td><td>Travaux bloquants et incertitude sur le co&ucirc;t.</td><td>Estimation, r&eacute;emploi de mat&eacute;riaux possible, priorisation des travaux utiles.</td></tr></tbody></table></div>
          <div class="doc-faq" aria-label="FAQ Commerce Vivant"><article><h3>TVF ouvre-t-elle directement des commerces ?</h3><p>Non. Le p&ocirc;le qualifie les locaux, les besoins et les sc&eacute;narios possibles, puis travaille avec les porteurs et acteurs concern&eacute;s.</p></article><article><h3>Un local peut-il devenir autre chose qu'un commerce ?</h3><p>Oui, selon son statut et le besoin local : atelier, lieu associatif, service, formation ou activit&eacute; temporaire.</p></article><article><h3>Quels partenaires sont concern&eacute;s ?</h3><p>Propri&eacute;taires, fonci&egrave;res, communes, managers de commerce, chambres consulaires, artisans, associations et porteurs de projet.</p></article></div>
    `
  ),

  "pole-friches-terrains-vivants.html": poleBlock(
    "friches-terrains-vivants",
    `
          <span class="doc-kicker">Friches et terrains</span>
          <h2 id="friches-terrains-vivants-unique-title">Passer d'un espace d&eacute;laiss&eacute; &agrave; un usage sobre et s&eacute;curis&eacute;</h2>
          <p>Friches &amp; Terrains Vivants traite les espaces o&ugrave; rien ne semble possible au premier regard : anciennes emprises, dents creuses, terrains en attente, sols contraints, abords d&eacute;grad&eacute;s ou espaces publics sous-utilis&eacute;s.</p>
          <div class="data-grid" aria-label="Rep&egrave;res friches">
            <article class="data-card"><strong>Cartofriches</strong><span>inventaires territoriaux</span><small>Cerema, outil national de rep&eacute;rage.</small></article>
            <article class="data-card"><strong>2050</strong><span>objectif ZAN</span><small>Z&eacute;ro artificialisation nette : limiter l'extension sur sols naturels.</small></article>
            <article class="data-card"><strong>4</strong><span>vigilances de base</span><small>Propri&eacute;t&eacute;, pollution, s&eacute;curit&eacute;, usage compatible.</small></article>
          </div>
          <div class="decision-flow" aria-label="Parcours friche">
            <article><h3>1. Localiser</h3><p>Cartographier l'emprise, les acc&egrave;s, les limites, le voisinage et les usages informels.</p></article>
            <article><h3>2. S&eacute;curiser</h3><p>Identifier risques visibles, cl&ocirc;tures, pollution suspect&eacute;e, d&eacute;p&ocirc;ts et contraintes d'acc&egrave;s.</p></article>
            <article><h3>3. Qualifier</h3><p>Analyser propri&eacute;t&eacute;, urbanisme, sols, biodiversit&eacute;, r&eacute;seaux et compatibilit&eacute; des usages.</p></article>
            <article><h3>4. Choisir l'usage</h3><p>Jardin partag&eacute;, verger, espace associatif, p&eacute;dagogique, culturel, biodiversit&eacute; ou usage transitoire.</p></article>
            <article><h3>5. Encadrer</h3><p>Convention, assurance, entretien, responsabilit&eacute;s, r&egrave;gles d'ouverture et sortie du dispositif.</p></article>
            <article><h3>6. Entretenir</h3><p>Un espace vivant exige un calendrier, des r&eacute;f&eacute;rents, des usages clairs et un suivi dans le temps.</p></article>
          </div>
          <div class="table-scroll"><table class="impact-data-table"><thead><tr><th>Usage possible</th><th>Conditions minimales</th><th>B&eacute;n&eacute;fice attendu</th></tr></thead><tbody><tr><td>Jardin partag&eacute;</td><td>Sol compatible, acc&egrave;s, eau, r&egrave;gles d'usage et animation.</td><td>Cadre de vie, lien social, biodiversit&eacute; de proximit&eacute;.</td></tr><tr><td>Occupation transitoire</td><td>Dur&eacute;e, assurance, s&eacute;curit&eacute;, responsabilit&eacute;s et sortie clarifi&eacute;es.</td><td>Eviter l'abandon prolong&eacute; et tester un usage.</td></tr><tr><td>Espace culturel ou p&eacute;dagogique</td><td>Accueil du public, accessibilit&eacute;, s&eacute;curit&eacute;, autorisations.</td><td>Redonner une fonction collective &agrave; un lieu d&eacute;laiss&eacute;.</td></tr></tbody></table></div>
          <div class="doc-faq" aria-label="FAQ Friches"><article><h3>Peut-on occuper une friche sans autorisation ?</h3><p>Non. Propri&eacute;t&eacute;, acc&egrave;s, s&eacute;curit&eacute; et assurance doivent &ecirc;tre clarifi&eacute;s avant toute action.</p></article><article><h3>Une friche pollu&eacute;e peut-elle &ecirc;tre transform&eacute;e ?</h3><p>Oui dans certains cas, mais uniquement apr&egrave;s diagnostics et avec des usages compatibles.</p></article><article><h3>Quels partenaires sont concern&eacute;s ?</h3><p>Collectivit&eacute;s, propri&eacute;taires fonciers, urbanistes, paysagistes, associations, services environnement et habitants.</p></article></div>
    `
  ),

  "pole-solidarite-insertion.html": poleBlock(
    "solidarite-insertion",
    `
          <span class="doc-kicker">Insertion et engagement</span>
          <h2 id="solidarite-insertion-unique-title">Construire des missions utiles, encadr&eacute;es et progressives</h2>
          <p>Solidarit&eacute; &amp; Insertion transforme les projets de terrain en supports d'engagement : observer, trier, inventorier, accueillir, jardiner, entretenir, documenter, participer &agrave; un atelier ou aider &agrave; une action locale. Chaque mission doit rester adapt&eacute;e aux personnes, aux comp&eacute;tences et au niveau d'encadrement disponible.</p>
          <div class="data-grid" aria-label="Rep&egrave;res insertion">
            <article class="data-card"><strong>15,4 %</strong><span>taux de pauvret&eacute; en 2023</span><small>INSEE, France m&eacute;tropolitaine.</small></article>
            <article class="data-card"><strong>9,8 M</strong><span>personnes sous le seuil de pauvret&eacute;</span><small>INSEE, niveau de vie et pauvret&eacute;.</small></article>
            <article class="data-card"><strong>4</strong><span>conditions avant mission</span><small>R&eacute;f&eacute;rent, assurance, consignes, p&eacute;rim&egrave;tre.</small></article>
          </div>
          <div class="decision-flow" aria-label="Parcours b&eacute;n&eacute;vole et insertion">
            <article><h3>1. Accueillir</h3><p>Comprendre disponibilit&eacute;s, envies, contraintes, exp&eacute;riences et besoin d'accompagnement.</p></article>
            <article><h3>2. Orienter</h3><p>Proposer une mission compatible : rep&eacute;rage, inventaire, logistique, jardin, accueil, atelier ou documentation.</p></article>
            <article><h3>3. Encadrer</h3><p>Nommer un r&eacute;f&eacute;rent, fixer les horaires, les limites, les consignes et les responsabilit&eacute;s.</p></article>
            <article><h3>4. Former</h3><p>Pr&eacute;voir une initiation courte aux gestes, outils, risques et objectifs de la mission.</p></article>
            <article><h3>5. Valoriser</h3><p>Attestation, retour d'exp&eacute;rience, comp&eacute;tences acquises et orientation vers les acteurs comp&eacute;tents.</p></article>
            <article><h3>6. Evaluer</h3><p>Suivre participation, satisfaction, difficult&eacute;s et suites possibles sans inventer de r&eacute;sultat.</p></article>
          </div>
          <div class="table-scroll"><table class="impact-data-table"><thead><tr><th>Mission</th><th>Pour qui</th><th>Points de vigilance</th></tr></thead><tbody><tr><td>Rep&eacute;rage citoyen</td><td>Habitants et b&eacute;n&eacute;voles</td><td>Ne pas entrer sur un site priv&eacute;, respecter les donn&eacute;es et les images.</td></tr><tr><td>Atelier mat&eacute;riaux</td><td>B&eacute;n&eacute;voles, publics accompagn&eacute;s, associations</td><td>S&eacute;curit&eacute;, port de charge, outillage, tri et stockage.</td></tr><tr><td>Chantier participatif</td><td>Equipe encadr&eacute;e</td><td>T&acirc;ches adapt&eacute;es, assurance, professionnels pour les travaux techniques.</td></tr></tbody></table></div>
          <div class="doc-faq" aria-label="FAQ Solidarit&eacute;"><article><h3>Faut-il une comp&eacute;tence technique pour participer ?</h3><p>Non pour les missions simples. Les travaux techniques doivent rester confi&eacute;s &agrave; des personnes comp&eacute;tentes et encadr&eacute;es.</p></article><article><h3>Les missions sont-elles ouvertes tout de suite ?</h3><p>Elles seront ouvertes progressivement selon les projets valid&eacute;s, les r&eacute;f&eacute;rents disponibles et les assurances.</p></article><article><h3>Quels partenaires sont concern&eacute;s ?</h3><p>Associations d'insertion, missions locales, organismes de formation, collectivit&eacute;s, entreprises, b&eacute;n&eacute;voles et habitants.</p></article></div>
    `
  ),
};

function specializePole(file) {
  let html = read(file);
  const block = uniquePoleBlocks[file];
  if (!block || html.includes("data-unique-pole-content=")) return false;

  const marker = /\s*<\/div>\s*<\/main>/;
  if (!marker.test(html)) {
    throw new Error(`Cannot find page-wrap closing marker in ${file}`);
  }

  html = html.replace(marker, `${block}      </div>\n    </main>`);
  write(file, html);
  return true;
}

let cleaned = 0;
let specialized = 0;

for (const file of htmlFiles) {
  if (applyCommonCleanup(file)) cleaned += 1;
}

for (const file of Object.keys(uniquePoleBlocks)) {
  if (specializePole(file)) specialized += 1;
}

console.log(JSON.stringify({ cleaned, specialized, dedicatedPage }, null, 2));
