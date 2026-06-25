const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "nos-actions.html");

let html = fs.readFileSync(file, "utf8");

const actions = [
  {
    eyebrow: "Habitat vacant",
    title: "Logements vacants",
    href: "action-logements-vacants.html",
    image: "assets/photos/abandoned-house-reunion.jpg",
    alt: "Maison vacante illustrant le potentiel de remise en usage du patrimoine existant",
    width: 960,
    height: 638,
    text:
      "Identifier les logements durablement inoccupés, comprendre les blocages et préparer des solutions de remise en usage avec les propriétaires, les collectivités et les acteurs locaux.",
    objectives: ["Repérer les biens", "Qualifier les causes de vacance", "Orienter vers une solution réaliste"],
    publics: "Propriétaires, communes, habitants, acteurs de l'habitat",
  },
  {
    eyebrow: "Usage partagé",
    title: "Bien Solidaire à Usage Partagé",
    href: "bien-solidaire-usage-partage.html",
    image: "assets/photos/renovated-building.jpg",
    alt: "Bâtiment rénové pouvant accueillir un usage partagé et utile au territoire",
    width: 1800,
    height: 1200,
    text:
      "Permettre à un propriétaire de conserver son bien tout en étudiant une rénovation encadrée par une convention d'usage temporaire, proportionnée à l'investissement mobilisé.",
    objectives: ["Étudier le bien", "Définir un usage utile", "Construire une convention claire"],
    publics: "Propriétaires, associations, collectivités, financeurs",
  },
  {
    eyebrow: "Ressources",
    title: "Matériaux de réemploi",
    href: "action-materiaux-reemploi.html",
    image: "assets/photos/salvage-warehouse.jpg",
    alt: "Entrepôt de matériaux de réemploi triés pour de futurs projets territoriaux",
    width: 960,
    height: 549,
    text:
      "Transformer des matériaux disponibles localement en ressources qualifiées pour des projets validés : rénovation, aménagement, locaux associatifs ou chantiers solidaires.",
    objectives: ["Collecter", "Trier", "Affecter aux projets validés"],
    publics: "Entreprises, particuliers, collectivités, associations",
  },
  {
    eyebrow: "Centralités",
    title: "Commerces inoccupés",
    href: "action-commerces-inoccupes.html",
    image: "assets/photos/abandoned-shop-paris.jpg",
    alt: "Vitrine commerciale fermée dans une rue urbaine",
    width: 960,
    height: 640,
    text:
      "Qualifier les cellules commerciales vacantes et préparer des usages capables de recréer de l'activité : commerce de proximité, atelier, association, tiers-lieu ou boutique temporaire.",
    objectives: ["Repérer les vitrines fermées", "Évaluer le potentiel", "Tester des usages de proximité"],
    publics: "Communes, propriétaires, commerçants, entrepreneurs locaux",
  },
  {
    eyebrow: "Foncier sobre",
    title: "Friches et espaces abandonnés",
    href: "action-espaces-abandonnes.html",
    image: "assets/photos/brownfield-lille.jpg",
    alt: "Friche urbaine à qualifier avant transformation en espace utile",
    width: 960,
    height: 640,
    text:
      "Révéler le potentiel des friches, terrains et espaces délaissés en privilégiant des usages sobres, progressifs et utiles : nature en ville, pédagogie, culture, rencontre ou production locale.",
    objectives: ["Observer l'état du site", "Identifier les contraintes", "Imaginer des usages temporaires ou durables"],
    publics: "Collectivités, habitants, associations, aménageurs",
  },
  {
    eyebrow: "Engagement",
    title: "Solidarité & Insertion",
    href: "action-solidarite-insertion.html",
    image: "assets/photos/volunteers.jpg",
    alt: "Bénévoles mobilisés dans une action collective",
    width: 1600,
    height: 1067,
    text:
      "Relier les projets de revitalisation à des parcours d'engagement, de formation et d'insertion, avec une attention aux personnes éloignées de l'emploi et aux habitants volontaires.",
    objectives: ["Accueillir les bénévoles", "Construire des missions utiles", "Valoriser les compétences"],
    publics: "Bénévoles, jeunes, structures sociales, acteurs de l'emploi",
  },
  {
    eyebrow: "Maillage national",
    title: "Antennes locales",
    href: "antennes-locales.html",
    image: "assets/photos/institutional-meeting.jpg",
    alt: "Réunion locale préparant la structuration d'une antenne territoriale",
    width: 1800,
    height: 1200,
    text:
      "Préparer un réseau d'équipes locales capables d'observer leur territoire, d'animer les coopérations et de faire remonter les besoins dans un cadre national partagé.",
    objectives: ["Former des référents", "Mutualiser les outils", "Animer les territoires"],
    publics: "Habitants, élus, associations, référents locaux",
  },
  {
    eyebrow: "Financement",
    title: "Financer les projets",
    href: "financer-projets.html",
    image: "assets/photos/documents-resources.jpg",
    alt: "Dossier de financement et convention préparés pour un projet territorial",
    width: 1800,
    height: 1201,
    text:
      "Structurer les dossiers afin de mobiliser, uniquement lorsqu'ils sont confirmés, dons citoyens, mécénat, contributions d'entreprises, subventions et financements solidaires.",
    objectives: ["Qualifier les besoins", "Préparer le budget", "Publier des informations vérifiées"],
    publics: "Mécènes, fondations, entreprises, citoyens, collectivités",
  },
];

const icon = {
  house:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/></svg>',
  map:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/></svg>',
  leaf:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19Z"/><path d="M5 19c3-5 7-8 12-10"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 20a4 4 0 0 1 7 0"/></svg>',
};

function actionSection(item, index) {
  const steps = item.objectives.map((objective) => `<li>${objective}</li>`).join("");
  return `<section class="actions-feature${index % 2 ? " is-reversed" : ""}">
          <figure class="actions-feature-media">
            <img decoding="async" loading="lazy" src="${item.image}" alt="${item.alt}" width="${item.width}" height="${item.height}" />
          </figure>
          <div class="actions-feature-copy">
            <span class="actions-eyebrow">${item.eyebrow}</span>
            <h2>${item.title}</h2>
            <p>${item.text}</p>
            <div class="actions-mini-grid">
              <article><strong>Objectifs</strong><ul>${steps}</ul></article>
              <article><strong>Publics concernés</strong><p>${item.publics}</p></article>
            </div>
            <a class="button primary" href="${item.href}">En savoir plus</a>
          </div>
        </section>`;
}

const main = `    <main class="actions-premium" data-professional-enrichment="public-page">
      <section class="actions-hero-premium">
        <img decoding="async" fetchpriority="high" src="assets/photos/urban-renewal-street.jpg" alt="Rue urbaine en transformation dans un quartier en renouvellement" width="1800" height="1200" />
        <div class="actions-hero-overlay">
          <span class="page-status" data-status="public">Dossier public</span>
          <h1>Nos actions pour redonner vie aux territoires</h1>
          <p>Territoires Vivants France structure une méthode nationale pour repérer, qualifier, réhabiliter, réemployer et remettre en usage les ressources abandonnées : logements, commerces, bâtiments, friches, matériaux et espaces délaissés.</p>
          <div class="actions-hero-buttons">
            <a class="button primary" href="#actions-principales">Découvrir les actions</a>
            <a class="button secondary" href="notre-methode.html">Voir la méthode TVF</a>
          </div>
        </div>
      </section>

      <section class="actions-intro-panel" aria-labelledby="actions-intro-title">
        <div>
          <span class="dossier-kicker">Positionnement</span>
          <h2 id="actions-intro-title">Une association en création, une architecture d'action déjà structurée</h2>
          <p>TVF ne présente pas de projets réalisés, de partenaires acquis ou de chiffres d'impact propres tant qu'ils ne sont pas vérifiés. La page expose une méthode de travail et des dispositifs à déployer progressivement avec les propriétaires, collectivités, habitants, entreprises, mécènes et associations.</p>
        </div>
        <div class="actions-proof-card">
          <strong>Principe de crédibilité</strong>
          <p>Chaque action doit partir d'une situation qualifiée : statut du bien, contraintes techniques, besoin local, cadre juridique, financement possible et suivi mesurable.</p>
        </div>
      </section>

      <section class="actions-method-strip" aria-label="Méthode d'action TVF">
        <article>${icon.map}<strong>Identifier</strong><span>Repérer les biens, ressources et besoins locaux.</span></article>
        <article>${icon.house}<strong>Qualifier</strong><span>Vérifier droits, état, risques, usages et faisabilité.</span></article>
        <article>${icon.users}<strong>Mobiliser</strong><span>Relier propriétaires, collectivités, habitants et partenaires.</span></article>
        <article>${icon.leaf}<strong>Transformer</strong><span>Réhabiliter, réemployer, animer et mesurer.</span></article>
      </section>

      <section class="actions-keyfigures" aria-labelledby="figures-title">
        <div>
          <span class="dossier-kicker">Chiffres de contexte national</span>
          <h2 id="figures-title">Des enjeux nationaux, à traiter territoire par territoire</h2>
          <p>Ces chiffres décrivent le contexte français. Ils ne constituent pas des résultats TVF.</p>
        </div>
        <div class="actions-figure-grid">
          <article><strong>+ 1 M</strong><span>logements vacants de plus de deux ans recensés en 2020</span><small>Source : Zéro Logement Vacant, ministère de la Ville et du Logement.</small></article>
          <article><strong>310 Mt</strong><span>de déchets produits en France en 2020</span><small>Source : SDES, bilan national des déchets.</small></article>
          <article><strong>66 %</strong><span>des tonnages sont des déchets minéraux issus de la construction</span><small>Source : SDES, bilan 2020.</small></article>
          <article><strong>244</strong><span>communes lauréates Action cœur de ville en 2025</span><small>Source : ANCT.</small></article>
        </div>
      </section>

      <section id="actions-principales" class="actions-feature-list" aria-label="Actions principales de Territoires Vivants France">
        <div class="actions-section-heading">
          <span class="dossier-kicker">Huit leviers complémentaires</span>
          <h2>Chaque action répond à un besoin précis, mais aucune ne fonctionne seule</h2>
          <p>La force du modèle TVF est de croiser patrimoine vacant, réemploi des matériaux, mobilisation citoyenne, ingénierie territoriale et financement responsable.</p>
        </div>
        ${actions.map(actionSection).join("\n")}
      </section>

      <section class="actions-process" aria-labelledby="process-title">
        <div class="actions-section-heading">
          <span class="dossier-kicker">Processus d'intervention</span>
          <h2 id="process-title">Passer d'une situation abandonnée à un projet utile</h2>
        </div>
        <div class="actions-timeline">
          <article><span>01</span><h3>Signalement ou repérage</h3><p>Un lieu, un bien ou une ressource est identifié par un habitant, une collectivité, un propriétaire ou l'observatoire.</p></article>
          <article><span>02</span><h3>Diagnostic</h3><p>TVF vérifie le statut, les contraintes, les risques, la disponibilité, les besoins locaux et les conditions de publication.</p></article>
          <article><span>03</span><h3>Scénario d'usage</h3><p>Plusieurs usages sont étudiés : logement, commerce, local associatif, jardin, atelier, formation ou occupation temporaire.</p></article>
          <article><span>04</span><h3>Coopération</h3><p>Les rôles sont formalisés : propriétaire, collectivité, bénévoles, entreprises, financeurs et bénéficiaires.</p></article>
          <article><span>05</span><h3>Mise en œuvre</h3><p>Le projet peut mobiliser travaux, matériaux de réemploi, chantier solidaire, financement ou animation locale.</p></article>
          <article><span>06</span><h3>Suivi</h3><p>Les résultats sont publiés seulement lorsqu'ils sont réels, datés, vérifiés et rattachés au bon territoire.</p></article>
        </div>
      </section>

      <section class="actions-map-section" aria-labelledby="map-title">
        <div>
          <span class="dossier-kicker">Déploiement national</span>
          <h2 id="map-title">Une carte préparée pour les futurs territoires TVF</h2>
          <p>La carte illustre l'architecture cible : un premier territoire pilote à Saint-Étienne, puis des territoires à qualifier en métropole et en Outre-mer. Aucun point ne vaut antenne active tant qu'il n'est pas officiellement constitué.</p>
          <a class="button secondary" href="carte-territoires.html">Voir la carte des territoires</a>
        </div>
        <div class="actions-france-map" aria-label="Carte illustrative des futurs territoires">
          <svg viewBox="0 0 360 360" role="img" aria-label="Carte de France illustrative avec Saint-Étienne et futurs territoires à qualifier">
            <path d="M174 31 245 55 307 118 291 196 315 256 237 312 170 332 97 306 57 244 33 165 74 91Z" />
            <circle cx="195" cy="205" r="7" />
            <circle cx="132" cy="132" r="5" />
            <circle cx="247" cy="136" r="5" />
            <circle cx="103" cy="237" r="5" />
            <circle cx="232" cy="268" r="5" />
          </svg>
          <div class="actions-map-legend">
            <span><i></i>Saint-Étienne : territoire pilote</span>
            <span><i></i>Territoires à qualifier</span>
            <span><i></i>Outre-mer : développement futur</span>
          </div>
        </div>
      </section>

      <section class="actions-scenarios" aria-labelledby="scenario-title">
        <div class="actions-section-heading">
          <span class="dossier-kicker">Scénarios pédagogiques</span>
          <h2 id="scenario-title">Exemples de situations possibles, non présentés comme des projets réalisés</h2>
        </div>
        <div class="case-study-grid">
          <article class="case-card"><h3>Un logement vacant en centre-bourg</h3><p>Le propriétaire ne sait pas comment financer les travaux. TVF peut étudier un diagnostic, des matériaux de réemploi, une convention d'usage et un usage social temporaire.</p></article>
          <article class="case-card"><h3>Une vitrine commerciale fermée</h3><p>La commune souhaite éviter une rue inactive. TVF peut aider à qualifier le local, chercher un usage transitoire et préparer une mise en relation avec des porteurs d'activité.</p></article>
          <article class="case-card"><h3>Un stock de matériaux inutilisés</h3><p>Une entreprise dispose de surplus. TVF ne distribue pas librement : les ressources sont vérifiées, tracées puis affectées à un projet validé.</p></article>
        </div>
      </section>

      <section class="actions-faq" aria-labelledby="actions-faq-title">
        <div>
          <span class="dossier-kicker">FAQ</span>
          <h2 id="actions-faq-title">Questions fréquentes</h2>
        </div>
        <div class="materials-faq">
          <details><summary>TVF intervient-elle déjà partout en France ?</summary><p>Non. Territoires Vivants France est en structuration. L'ambition nationale est présentée, mais les antennes et projets seront publiés uniquement lorsqu'ils seront constitués et vérifiables.</p></details>
          <details><summary>Peut-on proposer un logement, un commerce ou un terrain ?</summary><p>Oui. Une proposition peut être transmise pour qualification. Le bien n'est jamais publié comme projet TVF tant que le statut, l'accord du propriétaire, les risques et les conditions d'usage ne sont pas vérifiés.</p></details>
          <details><summary>La Banque de Matériaux distribue-t-elle gratuitement les ressources ?</summary><p>Non. Les matériaux sont intégrés à une stratégie de valorisation territoriale. TVF décide de leur affectation vers des projets validés, dans un cadre de coopération clair.</p></details>
          <details><summary>Comment les résultats seront-ils mesurés ?</summary><p>Les indicateurs TVF seront publiés après collecte réelle : signalements qualifiés, biens accompagnés, matériaux orientés, bénévoles mobilisés, projets validés et territoires couverts.</p></details>
        </div>
      </section>

      <section class="actions-final-cta" aria-label="Appel à l'action Nos actions">
        <div>
          <span class="dossier-kicker">Agir avec méthode</span>
          <h2>Vous avez un lieu, une ressource ou une compétence à proposer ?</h2>
          <p>TVF peut qualifier la situation, orienter vers le bon dispositif et préparer une coopération adaptée au territoire.</p>
        </div>
        <div class="actions-cta-buttons">
          <a class="button primary" href="signalement.html">Signaler un lieu</a>
          <a class="button secondary" href="banque-materiaux.html">Proposer des matériaux</a>
          <a class="button secondary" href="contact.html">Contacter TVF</a>
        </div>
      </section>

      <section class="doc-section compact" data-copy-expansion="documentary" aria-labelledby="sources-actions">
        <span class="doc-kicker">Sources et limites</span>
        <h2 id="sources-actions">Des données publiques pour cadrer l'action, pas pour inventer l'impact</h2>
        <p>Les chiffres cités décrivent des enjeux nationaux. Les résultats propres à Territoires Vivants France seront publiés uniquement après enregistrement, validation et rattachement territorial.</p>
        <div class="source-list"><strong>Sources citées</strong><span><a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener" target="_blank">Zéro Logement Vacant - Ministère de la Ville et du Logement</a></span><span><a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener" target="_blank">SDES - Bilan 2020 de la production de déchets en France</a></span><span><a href="https://anct.gouv.fr/programmes-dispositifs/action-coeur-de-ville" rel="noopener" target="_blank">ANCT - Action cœur de ville</a></span><span><a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener" target="_blank">Cerema - Cartofriches</a></span></div>
      </section>
    </main>`;

html = html
  .replace(
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
    '<meta name="description" content="Découvrez les actions de Territoires Vivants France : logements vacants, biens solidaires, matériaux de réemploi, commerces inoccupés, friches, insertion, antennes locales et financement solidaire." />',
  )
  .replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    '<meta property="og:description" content="Une page institutionnelle pour comprendre comment Territoires Vivants France structure ses actions de revitalisation territoriale." />',
  )
  .replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    '<meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/urban-renewal-street.jpg" />',
  )
  .replace(/<main[\s\S]*?<\/main>/, main);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "TVF intervient-elle déjà partout en France ?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Non. Territoires Vivants France est en structuration. L'ambition nationale est présentée, mais les antennes et projets seront publiés uniquement lorsqu'ils seront constitués et vérifiables.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on proposer un logement, un commerce ou un terrain ?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Oui. Une proposition peut être transmise pour qualification. Le bien n'est jamais publié comme projet TVF tant que le statut, l'accord du propriétaire, les risques et les conditions d'usage ne sont pas vérifiés.",
      },
    },
    {
      "@type": "Question",
      name: "La Banque de Matériaux distribue-t-elle gratuitement les ressources ?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Non. Les matériaux sont intégrés à une stratégie de valorisation territoriale. TVF décide de leur affectation vers des projets validés, dans un cadre de coopération clair.",
      },
    },
  ],
};

html = html.replace(/\s*<script id="nos-actions-faq-schema"[\s\S]*?<\/script>/i, "");
html = html.replace("</head>", `    <script id="nos-actions-faq-schema" type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n  </head>`);

fs.writeFileSync(file, html, "utf8");
