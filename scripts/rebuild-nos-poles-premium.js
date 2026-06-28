const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "nos-poles.html");

let html = fs.readFileSync(file, "utf8");

const poles = [
  {
    kicker: "Habitat et usages",
    title: "Habitat Vivant",
    href: "pole-habitat-vivant.html",
    image: "assets/photos/abandoned-house-reunion.jpg",
    alt: "Logement rénové illustrant la remise en usage de l'habitat vacant",
    width: 1800,
    height: 1201,
    intro:
      "Habitat Vivant s'intéresse aux logements vacants, dégradés ou sous-utilisés lorsque leur remise en usage peut répondre à un besoin local : logement temporaire, habitat intergénérationnel, accueil associatif ou solution solidaire.",
    why:
      "Le pôle existe parce que la vacance n'est pas seulement un problème immobilier : elle touche le cadre de vie, l'attractivité des centres-bourgs, la dignité de l'habitat et la capacité des territoires à répondre aux besoins des habitants.",
    missions: ["Repérage des logements vacants", "Dialogue avec les propriétaires", "Scénarios de remise en usage", "Lien avec le programme Bien Solidaire"],
    publics: "Propriétaires, communes, habitants, acteurs de l'habitat, associations locales",
    stat: "+ 1 M de logements vacants depuis plus de deux ans recensés en 2020 par Zéro Logement Vacant.",
    example: "Exemple type : un logement fermé depuis plusieurs années peut être diagnostiqué, sécurisé juridiquement puis orienté vers une solution d'usage temporaire ou solidaire.",
    documents: "Fiche diagnostic logement, trame de convention d'usage, critères de qualification.",
  },
  {
    kicker: "Ressources et réemploi",
    title: "Matériauthèque Solidaire",
    href: "pole-materiautheque-solidaire.html",
    image: "assets/photos/brownfield-lille.jpg",
    alt: "Matériaux triés dans un entrepôt pour une démarche de réemploi",
    width: 1800,
    height: 1201,
    intro:
      "La Matériauthèque Solidaire organise la valorisation territoriale des matériaux encore utiles. Elle ne fonctionne pas comme une distribution libre : les ressources sont qualifiées, tracées et affectées à des projets validés.",
    why:
      "Ce pôle répond au gaspillage de ressources, au coût croissant des matériaux et au besoin de soutenir des projets locaux qui manquent de moyens techniques ou financiers.",
    missions: ["Identifier les stocks disponibles", "Évaluer l'état et l'usage possible", "Orienter vers les projets validés", "Documenter le suivi"],
    publics: "Entreprises, artisans, collectivités, particuliers, associations, porteurs de projets",
    stat: "310 Mt de déchets ont été produits en France en 2020 ; 66 % des tonnages sont des déchets minéraux issus de la construction selon le SDES.",
    example: "Exemple type : des menuiseries, palettes, sanitaires ou luminaires peuvent être intégrés à une rénovation associative si leur état et leur usage sont compatibles.",
    documents: "Fiche ressource, grille de tri, convention de valorisation, registre d'affectation.",
  },
  {
    kicker: "Centralités et proximité",
    title: "Commerce Vivant",
    href: "pole-commerce-vivant.html",
    image: "assets/photos/abandoned-shop-paris.jpg",
    alt: "Commerce de proximité actif dans une rue commerçante",
    width: 1800,
    height: 1201,
    intro:
      "Commerce Vivant vise les rez-de-chaussée et cellules commerciales inoccupés afin de préparer des usages utiles : commerces de proximité, ateliers, boutiques éphémères, tiers-lieux ou locaux associatifs.",
    why:
      "Un local fermé peut fragiliser toute une rue : baisse des flux, sentiment d'abandon, perte de services et difficulté pour de nouveaux porteurs d'activité à s'installer.",
    missions: ["Recenser les vitrines fermées", "Qualifier les locaux", "Tester des usages transitoires", "Accompagner les porteurs d'activité"],
    publics: "Collectivités, propriétaires de locaux, commerçants, artisans, associations, entrepreneurs",
    stat: "244 communes sont concernées par Action cœur de ville en 2025, signe de l'enjeu national des centralités commerciales.",
    example: "Exemple type : une ancienne boutique peut être étudiée pour accueillir un atelier d'artisan, une permanence associative ou un commerce temporaire.",
    documents: "Fiche local commercial, grille d'usage, modèle de convention d'occupation.",
  },
  {
    kicker: "Sols, friches et biodiversité",
    title: "Friches & Terrains Vivants",
    href: "pole-friches-terrains-vivants.html",
    image: "assets/photos/brownfield-lille.jpg",
    alt: "Friche urbaine à qualifier avant transformation en espace utile et durable",
    width: 960,
    height: 640,
    intro:
      "Friches & Terrains Vivants transforme la lecture des espaces abandonnés : plutôt que de les considérer seulement comme des vides, le pôle recherche des usages sobres, temporaires, écologiques ou collectifs.",
    why:
      "Les friches et terrains délaissés croisent plusieurs enjeux : foncier, biodiversité, sécurité, mémoire des lieux, cadre de vie et sobriété face à l'artificialisation.",
    missions: ["Observer l'état des sites", "Identifier les contraintes", "Préparer des usages réversibles", "Relier nature, culture et services"],
    publics: "Communes, habitants, associations, aménageurs, acteurs environnementaux",
    stat: "Cartofriches, outil du Cerema, structure le repérage national des friches et leur documentation territoriale.",
    example: "Exemple type : un terrain inutilisé peut devenir jardin partagé, espace nourricier, lieu pédagogique ou espace culturel temporaire.",
    documents: "Fiche terrain, grille risques-usages, trame d'animation locale.",
  },
  {
    kicker: "Humain et parcours",
    title: "Solidarité & Insertion",
    href: "pole-solidarite-insertion.html",
    image: "assets/photos/community-garden-paris.jpg",
    alt: "Bénévoles et habitants mobilisés dans une action collective",
    width: 1800,
    height: 1196,
    intro:
      "Solidarité & Insertion relie les projets de revitalisation à l'engagement citoyen, aux compétences locales, aux chantiers participatifs et aux parcours vers l'emploi.",
    why:
      "Un territoire vivant ne se résume pas à ses bâtiments : il repose aussi sur les habitants, les bénévoles, les jeunes, les seniors, les associations et les personnes qui cherchent une place dans l'activité locale.",
    missions: ["Accueillir les bénévoles", "Construire des missions utiles", "Préparer des ateliers pratiques", "Valoriser les compétences"],
    publics: "Bénévoles, associations, jeunes, seniors, structures d'insertion, acteurs de l'emploi",
    stat: "L'ESS représente une part importante de l'emploi salarié en France ; TVF s'inscrit dans cette logique d'utilité sociale et territoriale.",
    example: "Exemple type : un chantier participatif peut devenir support d'apprentissage, de lien social et de transmission de savoir-faire.",
    documents: "Fiche mission bénévole, charte d'engagement, cadre sécurité chantier.",
  },
];

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function poleSection(pole, index) {
  return `<section class="poles-feature${index % 2 ? " is-reversed" : ""}">
          <figure class="poles-feature-media">
            <img decoding="async" loading="lazy" src="${pole.image}" alt="${pole.alt}" width="${pole.width}" height="${pole.height}" />
          </figure>
          <div class="poles-feature-copy">
            <span class="actions-eyebrow">${pole.kicker}</span>
            <h2>${pole.title}</h2>
            <p>${pole.intro}</p>
            <div class="poles-statline"><strong>Repère national</strong><span>${pole.stat}</span></div>
            <div class="poles-detail-grid">
              <article><strong>Pourquoi ce pôle existe</strong><p>${pole.why}</p></article>
              <article><strong>Missions</strong><ul>${list(pole.missions)}</ul></article>
              <article><strong>Publics concernés</strong><p>${pole.publics}</p></article>
              <article><strong>Exemple de projet</strong><p>${pole.example}</p></article>
              <article><strong>Documents à préparer</strong><p>${pole.documents}</p></article>
              <article><strong>FAQ courte</strong><p>Chaque demande est qualifiée avant publication : faisabilité, statut, risques, utilité territoriale et capacité de suivi.</p></article>
            </div>
            <a class="button primary" href="${pole.href}">Découvrir le pôle</a>
          </div>
        </section>`;
}

const main = `    <main class="poles-premium" data-professional-enrichment="public-page">
      <section class="actions-hero-premium poles-hero-premium">
        <img decoding="async" fetchpriority="high" src="assets/photos/saint-etienne-design.jpg" alt="Centre-ville en transformation dans une démarche de revitalisation territoriale" width="1800" height="1200" />
        <div class="actions-hero-overlay">
          <span class="page-status" data-status="public">Dossier public</span>
          <span class="poles-hero-label">Les 5 pôles de TERRITOIRES VIVANTS FRANCE</span>
          <h1>Une architecture nationale pour transformer les ressources abandonnées</h1>
          <p>Les cinq pôles couvrent l'ensemble de la revitalisation territoriale : identifier un bien, qualifier son potentiel, mobiliser les acteurs, réemployer les matériaux, accompagner les usages et mesurer les résultats réels.</p>
          <div class="actions-hero-buttons">
            <a class="button primary" href="#poles-detail">Découvrir les pôles</a>
            <a class="button secondary" href="#poles-ensemble">Voir la méthode commune</a>
          </div>
        </div>
      </section>

      <section class="actions-intro-panel poles-intro" aria-labelledby="poles-intro-title">
        <div>
          <span class="dossier-kicker">Vision nationale</span>
          <h2 id="poles-intro-title">Cinq pôles pour ne pas traiter les problèmes en silos</h2>
          <p>Un logement vacant peut nécessiter des matériaux de réemploi, un chantier participatif, un accord avec une collectivité et un usage temporaire. Une friche peut devenir un lieu nourricier, culturel ou associatif. Un commerce fermé peut retrouver une fonction si le bon usage, le bon cadre et les bons acteurs sont réunis. Les pôles TVF servent à relier ces dimensions dans une méthode lisible.</p>
        </div>
        <div class="actions-proof-card">
          <strong>Association en création</strong>
          <p>Les pôles décrivent une organisation cible et une méthode de travail. Aucun projet réalisé, partenaire acquis, financeur confirmé ou résultat d'impact n'est affiché sans preuve.</p>
        </div>
      </section>

      <section class="actions-keyfigures poles-keyfigures" aria-labelledby="poles-figures-title">
        <div>
          <span class="dossier-kicker">Chiffres de contexte</span>
          <h2 id="poles-figures-title">Des signaux nationaux qui justifient une approche intégrée</h2>
          <p>Ces repères éclairent les sujets traités par les pôles. Ils ne sont pas des résultats de Territoires Vivants France.</p>
        </div>
        <div class="actions-figure-grid">
          <article><strong>+ 1 M</strong><span>logements vacants depuis plus de deux ans en 2020</span><small>Zéro Logement Vacant, ministère chargé du Logement.</small></article>
          <article><strong>310 Mt</strong><span>de déchets produits en France en 2020</span><small>SDES, bilan national de la production de déchets.</small></article>
          <article><strong>66 %</strong><span>des tonnages sont des déchets minéraux issus de la construction</span><small>SDES, contexte national du BTP.</small></article>
          <article><strong>244</strong><span>communes Action cœur de ville en 2025</span><small>ANCT, programme national de revitalisation.</small></article>
        </div>
      </section>

      <section id="poles-detail" class="poles-feature-list" aria-label="Présentation détaillée des cinq pôles">
        <div class="actions-section-heading">
          <span class="dossier-kicker">Les cinq domaines d'action</span>
          <h2>Chaque pôle porte une expertise, mais la réponse se construit collectivement</h2>
          <p>La page présente les pôles comme des modules professionnels : objectifs, publics, missions, documents à préparer, exemples types et limites de publication.</p>
        </div>
        ${poles.map(poleSection).join("\n")}
      </section>

      <section id="poles-ensemble" class="poles-flow-section" aria-labelledby="flow-title">
        <div class="actions-section-heading">
          <span class="dossier-kicker">Infographie de coopération</span>
          <h2 id="flow-title">Comment les pôles travaillent ensemble</h2>
          <p>Un dossier TVF ne suit pas toujours le même chemin, mais la méthode doit rester lisible, vérifiable et progressive.</p>
        </div>
        <div class="poles-flow">
          <article><span>01</span><strong>Repérage du bien</strong><p>Signalement, observation ou donnée publique.</p></article>
          <article><span>02</span><strong>Diagnostic</strong><p>Statut, état, risques, besoins et potentiel.</p></article>
          <article><span>03</span><strong>Pôle principal</strong><p>Habitat, commerce, friche, matériaux ou insertion.</p></article>
          <article><span>04</span><strong>Mobilisation croisée</strong><p>Les autres pôles apportent ressources et compétences.</p></article>
          <article><span>05</span><strong>Financement</strong><p>Dons, mécénat, subventions ou financement solidaire confirmés.</p></article>
          <article><span>06</span><strong>Convention</strong><p>Rôles, usages, durée, responsabilités et publication.</p></article>
          <article><span>07</span><strong>Travaux et réemploi</strong><p>Matériaux, chantiers, sécurité et suivi technique.</p></article>
          <article><span>08</span><strong>Nouvel usage</strong><p>Logement, local, jardin, atelier, formation ou service.</p></article>
          <article><span>09</span><strong>Suivi d'impact</strong><p>Indicateurs réels, datés et territorialisés.</p></article>
        </div>
      </section>

      <section class="actions-map-section poles-map-section" aria-labelledby="poles-map-title">
        <div>
          <span class="dossier-kicker">Carte interactive préparée</span>
          <h2 id="poles-map-title">Visualiser les futurs territoires de déploiement</h2>
          <p>La carte prépare l'affichage futur des territoires pilotes, antennes locales, collectivités contributrices et ressources qualifiées. Les points restent illustratifs tant qu'aucune implantation n'est officiellement constituée.</p>
          <a class="button secondary" href="carte-territoires.html">Ouvrir la carte des territoires</a>
        </div>
        <div class="actions-france-map" aria-label="Carte illustrative du futur réseau de pôles">
          <svg viewBox="0 0 360 360" role="img" aria-label="Carte de France illustrative des futurs territoires TVF">
            <path d="M174 31 245 55 307 118 291 196 315 256 237 312 170 332 97 306 57 244 33 165 74 91Z" />
            <circle cx="195" cy="205" r="7" />
            <circle cx="132" cy="132" r="5" />
            <circle cx="247" cy="136" r="5" />
            <circle cx="103" cy="237" r="5" />
            <circle cx="232" cy="268" r="5" />
          </svg>
          <div class="actions-map-legend">
            <span><i></i>Saint-Étienne : territoire pilote</span>
            <span><i></i>Métropole : territoires à qualifier</span>
            <span><i></i>Outre-mer : développement futur</span>
          </div>
        </div>
      </section>

      <section class="poles-comparison" aria-labelledby="comparison-title">
        <span class="dossier-kicker">Lecture comparative</span>
        <h2 id="comparison-title">Ce que chaque pôle apporte à un projet</h2>
        <table class="stat-comparison">
          <thead><tr><th>Pôle</th><th>Apport principal</th><th>Donnée à suivre</th><th>Garde-fou</th></tr></thead>
          <tbody>
            <tr><th>Habitat Vivant</th><td>Remise en usage de logements</td><td>Biens repérés et qualifiés</td><td>Aucun bien publié sans accord et diagnostic</td></tr>
            <tr><th>Matériauthèque Solidaire</th><td>Valorisation des ressources</td><td>Matériaux proposés, état, affectation</td><td>Pas de distribution automatique</td></tr>
            <tr><th>Commerce Vivant</th><td>Réactivation des centralités</td><td>Locaux recensés et usages testés</td><td>Pas de promesse d'activité sans porteur identifié</td></tr>
            <tr><th>Friches & Terrains Vivants</th><td>Usages sobres des espaces délaissés</td><td>Contraintes, risques, usages possibles</td><td>Pas d'occupation sans cadre sécurisé</td></tr>
            <tr><th>Solidarité & Insertion</th><td>Engagement et parcours utiles</td><td>Missions, bénévoles, compétences</td><td>Pas de chantier sans sécurité ni encadrement</td></tr>
          </tbody>
        </table>
      </section>

      <section class="actions-faq poles-faq" aria-labelledby="poles-faq-title">
        <div><span class="dossier-kicker">FAQ</span><h2 id="poles-faq-title">Questions fréquentes sur les pôles</h2></div>
        <div class="materials-faq">
          <details><summary>Les cinq pôles sont-ils déjà opérationnels partout ?</summary><p>Non. Ils décrivent la structure nationale cible. Leur activation dépendra des territoires, des compétences disponibles, des conventions et des ressources confirmées.</p></details>
          <details><summary>Un projet peut-il mobiliser plusieurs pôles ?</summary><p>Oui. C'est même l'intérêt du modèle TVF : un bien vacant peut mobiliser habitat, matériaux, insertion, financement et observatoire.</p></details>
          <details><summary>Pourquoi ne pas afficher de partenaires par pôle ?</summary><p>Parce qu'aucun partenaire ne doit être présenté comme acquis sans convention, accord de publication ou confirmation officielle.</p></details>
          <details><summary>Quels documents seront publiés ?</summary><p>Les documents seront ajoutés progressivement : grilles de diagnostic, modèles de convention, critères de sélection, fiches ressources et rapports d'impact validés.</p></details>
        </div>
      </section>

      <section class="actions-final-cta poles-final-cta" aria-label="Appel à l'action Nos pôles">
        <div>
          <span class="dossier-kicker">Construire une méthode nationale</span>
          <h2>Un territoire, un bien ou une ressource peut devenir le point de départ d'un projet utile</h2>
          <p>TVF qualifie les situations avant d'agir et oriente chaque demande vers le ou les pôles adaptés.</p>
        </div>
        <div class="actions-cta-buttons">
          <a class="button primary" href="signalement.html">Signaler un lieu</a>
          <a class="button secondary" href="banque-materiaux.html">Proposer une ressource</a>
          <a class="button secondary" href="contact.html">Contacter TVF</a>
        </div>
      </section>

      <section class="doc-section compact" data-copy-expansion="documentary" aria-labelledby="sources-poles">
        <span class="doc-kicker">Sources et limites</span>
        <h2 id="sources-poles">Des repères publics, pas des résultats TVF inventés</h2>
        <p>Les chiffres cités servent à comprendre les enjeux nationaux. Les indicateurs propres aux pôles TVF seront publiés seulement lorsqu'ils seront produits, vérifiés et rattachés à un territoire.</p>
        <div class="source-list"><strong>Sources citées</strong><span><a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener" target="_blank">Zéro Logement Vacant - Ministère de la Ville et du Logement</a></span><span><a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener" target="_blank">SDES - Bilan 2020 de la production de déchets</a></span><span><a href="https://anct.gouv.fr/programmes-dispositifs/action-coeur-de-ville" rel="noopener" target="_blank">ANCT - Action cœur de ville</a></span><span><a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener" target="_blank">Cerema - Cartofriches</a></span><span><a href="https://artificialisation.developpement-durable.gouv.fr/" rel="noopener" target="_blank">Portail national de l'artificialisation des sols</a></span></div>
      </section>
    </main>`;

html = html
  .replace(
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
    '<meta name="description" content="Découvrez les cinq pôles de Territoires Vivants France : Habitat Vivant, Matériauthèque Solidaire, Commerce Vivant, Friches et Terrains Vivants, Solidarité & Insertion." />',
  )
  .replace(
    /<meta property="og:description"[\s\S]*?\/>/,
    '<meta property="og:description" content="Une page institutionnelle pour comprendre comment les cinq pôles TVF structurent la revitalisation des territoires." />',
  )
  .replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    '<meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/saint-etienne-design.jpg" />',
  )
  .replace(/<main[\s\S]*?<\/main>/, main);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Les cinq pôles sont-ils déjà opérationnels partout ?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Non. Ils décrivent la structure nationale cible. Leur activation dépendra des territoires, des compétences disponibles, des conventions et des ressources confirmées.",
      },
    },
    {
      "@type": "Question",
      name: "Un projet peut-il mobiliser plusieurs pôles ?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Oui. Un bien vacant peut mobiliser habitat, matériaux, insertion, financement et observatoire.",
      },
    },
  ],
};

html = html.replace(/\s*<script id="nos-poles-faq-schema"[\s\S]*?<\/script>/i, "");
html = html.replace("</head>", `    <script id="nos-poles-faq-schema" type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n  </head>`);

fs.writeFileSync(file, html, "utf8");
