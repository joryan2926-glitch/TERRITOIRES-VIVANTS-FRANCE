const fs = require("fs");
const path = require("path");

const site = {
  name: "Territoires Vivants France",
  url: "https://www.territoiresvivantsfrance.fr",
  description:
    "Plateforme nationale de coopération pour remettre en usage les logements, commerces, bâtiments, terrains et matériaux inutilisés.",
};

const nav = [
  ["Accueil", "index.html"],
  ["L'association", "qui-sommes-nous.html"],
  ["Nos actions", "nos-actions.html"],
  ["Nos pôles", "nos-poles.html"],
  ["Observatoire", "observatoire.html"],
  ["Saint-Étienne", "saint-etienne.html"],
  ["Agir", "agir-avec-nous.html"],
  ["Contact", "contact.html"],
];

const pages = [
  {
    file: "index.html",
    title: "Accueil",
    meta:
      "Territoires Vivants France coordonne propriétaires, collectivités, entreprises, associations et citoyens pour redonner vie aux biens et ressources inutilisés.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Association nationale en création",
    h1: "Redonner vie aux lieux utiles aux habitants.",
    intro:
      "Territoires Vivants France agit comme une plateforme de coopération : repérer les ressources inutilisées, mobiliser les bons acteurs, organiser les conventions, faciliter les projets et suivre leur impact.",
    ctas: [
      ["Comprendre TVF", "qui-sommes-nous.html"],
      ["Proposer un bien", "agir-avec-nous.html#proposer"],
      ["Nous contacter", "contact.html"],
    ],
    sections: [
      sectionIntro(
        "Une mission simple, un cadre clair",
        "TVF part d'un constat : des logements restent vacants, des commerces ferment, des matériaux encore utiles sont jetés et des terrains restent inutilisés. L'association veut transformer ces situations en projets locaux utiles, sans promettre de résultats non mesurés et sans se substituer aux acteurs publics existants.",
        [
          ["Observer", "Identifier les biens, matériaux et besoins territoriaux à partir de signalements et de données vérifiables."],
          ["Qualifier", "Analyser la faisabilité, les contraintes, les propriétaires concernés et les usages possibles."],
          ["Coordonner", "Réunir collectivités, propriétaires, entreprises, associations, financeurs et habitants autour d'un cadre commun."],
        ]
      ),
      cards(
        "Les portes d'entrée",
        "Chaque public doit comprendre rapidement comment agir avec TVF.",
        [
          ["Collectivité", "Structurer un diagnostic, identifier des biens vacants, préparer une coopération territoriale.", "agir-avec-nous.html#collectivite"],
          ["Propriétaire", "Proposer un logement, un commerce, un bâtiment ou un terrain inutilisé.", "agir-avec-nous.html#proprietaire"],
          ["Entreprise", "Valoriser matériaux, compétences, locaux ou mécénat dans un projet utile au territoire.", "agir-avec-nous.html#entreprise"],
          ["Citoyen", "Signaler un lieu, devenir bénévole ou participer à une démarche locale.", "agir-avec-nous.html#citoyen"],
        ]
      ),
      timeline(
        "Le parcours TVF",
        [
          ["1", "Repérage", "Un lieu, un besoin ou une ressource est signalé."],
          ["2", "Diagnostic", "TVF vérifie la situation, les contraintes et les acteurs à réunir."],
          ["3", "Convention", "Les engagements sont formalisés avant toute action de terrain."],
          ["4", "Mise en usage", "Le projet est coordonné, suivi et documenté."],
        ]
      ),
      highlight(
        "Territoire pilote : Saint-Étienne",
        "Le siège national est situé à Saint-Étienne. Le territoire pilote doit permettre de tester la méthode TVF sur des sujets concrets : habitat vacant, commerces inoccupés, matériaux de réemploi, friches et mobilisation citoyenne.",
        "Découvrir le pilote",
        "saint-etienne.html",
        "assets/photos/france-saint-etienne-jean-jaures.jpg"
      ),
    ],
  },
  {
    file: "qui-sommes-nous.html",
    title: "Qui sommes-nous ?",
    meta:
      "Découvrez Territoires Vivants France, association nationale en création basée à Saint-Étienne.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "L'association",
    h1: "Une plateforme de coopération territoriale.",
    intro:
      "TVF rassemble les acteurs qui peuvent transformer un bien inutilisé en ressource pour les habitants : propriétaires, collectivités, entreprises, associations, bénévoles, financeurs et citoyens.",
    ctas: [["Notre méthode", "nos-actions.html"], ["Contact", "contact.html"]],
    sections: [
      textBlock(
        "Notre raison d'être",
        "Un bâtiment fermé, un logement dégradé, un commerce vide ou un stock de matériaux oublié ne sont pas seulement des problèmes immobiliers. Ce sont aussi des occasions manquées pour le logement, l'activité locale, l'insertion, la transition écologique et la qualité de vie. TVF veut créer le cadre qui permet de passer du constat à l'action."
      ),
      split(
        "Une association en création",
        "Le projet est porté depuis Saint-Étienne avec une ambition nationale progressive. Cette phase demande de bâtir une méthode crédible, des documents solides, des conventions claires et des premiers partenariats réels avant toute communication de résultats.",
        "assets/photos/community-garden-paris.webp"
      ),
      cards("Nos engagements", "TVF avance avec prudence et exigence.", [
        ["Clarté", "Ne pas annoncer de chiffres d'impact tant qu'ils ne sont pas mesurés."],
        ["Traçabilité", "Documenter les décisions, conventions, ressources et projets."],
        ["Complémentarité", "Aider les politiques publiques et les acteurs locaux sans les remplacer."],
        ["Utilité", "Orienter chaque action vers un bénéfice concret pour le territoire."],
      ]),
    ],
  },
  {
    file: "nos-actions.html",
    title: "Nos actions",
    meta:
      "Les actions de TVF : logements vacants, commerces inoccupés, matériaux de réemploi, friches, insertion et coordination territoriale.",
    heroImage: "assets/photos/france-commerce-paris.jpg",
    eyebrow: "Actions",
    h1: "Passer du patrimoine inutilisé au projet utile.",
    intro:
      "TVF organise ses actions autour de besoins concrets : repérer, qualifier, conventionner, mobiliser, réhabiliter et remettre en usage.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Voir les pôles", "nos-poles.html"]],
    sections: [
      cards("Six leviers opérationnels", "Une lecture simple des interventions possibles.", [
        ["Logements vacants", "Identifier les biens inutilisés et accompagner les conditions d'un retour à l'usage."],
        ["Commerces inoccupés", "Étudier les cellules fermées et les usages possibles : commerce, atelier, association, service."],
        ["Matériaux de réemploi", "Collecter et affecter les matériaux à des projets validés par TVF."],
        ["Friches et terrains", "Transformer des espaces délaissés en lieux utiles, verts ou partagés."],
        ["Solidarité et insertion", "Construire des parcours de bénévolat, formation et chantier solidaire."],
        ["Financement", "Préparer des dossiers lisibles pour collectivités, mécènes et financeurs."],
      ]),
      timeline("Méthode d'intervention", [
        ["A", "Identifier", "Repérage du bien, du besoin ou de la ressource."],
        ["B", "Évaluer", "Analyse technique, juridique, économique et sociale."],
        ["C", "Mobiliser", "Recherche des acteurs, ressources et financements compatibles."],
        ["D", "Contractualiser", "Convention de coopération, règles d'usage et responsabilités."],
        ["E", "Suivre", "Indicateurs, documentation, retour d'expérience et transparence."],
      ]),
      textBlock(
        "Ce que TVF ne promet pas",
        "TVF ne présente pas de faux projets réalisés, ne revendique pas de financeurs non engagés et ne communique pas de chiffres non vérifiés. Les objectifs sont distingués des résultats mesurés."
      ),
    ],
  },
  {
    file: "nos-poles.html",
    title: "Nos 5 pôles",
    meta:
      "Les cinq pôles de Territoires Vivants France : Habitat Vivant, Matériauthèque Solidaire, Commerce Vivant, Friches & Terrains Vivants, Solidarité & Insertion.",
    heroImage: "assets/photos/france-ressourcerie-vichy.jpg",
    eyebrow: "Organisation",
    h1: "Cinq pôles pour couvrir tout le cycle de revitalisation.",
    intro:
      "Les pôles structurent l'action de TVF : du repérage d'un bien à son nouvel usage, en intégrant les matériaux, les acteurs et l'impact social.",
    ctas: [["Nos actions", "nos-actions.html"], ["Devenir partenaire", "agir-avec-nous.html#partenaire"]],
    sections: [
      cards("Les pôles TVF", "Chaque pôle répond à un enjeu précis.", [
        ["Habitat Vivant", "Logements vacants, habitat dégradé, propriétaires, usages solidaires."],
        ["Matériauthèque Solidaire", "Matériaux réemployables, collecte, diagnostic, affectation à des projets."],
        ["Commerce Vivant", "Locaux fermés, rez-de-chaussée actifs, artisans, services de proximité."],
        ["Friches & Terrains Vivants", "Terrains délaissés, nature en ville, usages collectifs, biodiversité."],
        ["Solidarité & Insertion", "Bénévolat, chantiers, formation, inclusion et engagement citoyen."],
      ]),
      split(
        "Une logique de coopération",
        "Un même projet peut mobiliser plusieurs pôles. Un logement vacant peut nécessiter des matériaux de réemploi, une convention avec un propriétaire, un chantier solidaire et un suivi d'impact. TVF sert à organiser cette coordination.",
        "assets/photos/france-saint-etienne-chateaucreux.jpg"
      ),
    ],
  },
  {
    file: "observatoire.html",
    title: "Observatoire",
    meta:
      "L'observatoire TVF prépare le repérage des biens vacants, commerces fermés, friches, terrains et ressources inutilisées.",
    heroImage: "assets/photos/france-friche-pcuk.jpg",
    eyebrow: "Observatoire",
    h1: "Voir, comprendre, prioriser.",
    intro:
      "L'observatoire doit aider les territoires à mieux identifier les ressources inutilisées avant de décider où agir.",
    ctas: [["Signaler un lieu", "agir-avec-nous.html#signalement"], ["Saint-Étienne", "saint-etienne.html"]],
    sections: [
      cards("Ce que l'observatoire suit", "Les catégories sont volontairement simples.", [
        ["Logements vacants", "Biens inutilisés ou dégradés à qualifier avec prudence."],
        ["Commerces fermés", "Cellules commerciales sans activité visible."],
        ["Bâtiments abandonnés", "Immeubles ou équipements sans usage identifié."],
        ["Friches et terrains", "Espaces délaissés pouvant accueillir un projet utile."],
        ["Matériaux disponibles", "Ressources réemployables proposées ou identifiées."],
      ]),
      textBlock(
        "Données et responsabilité",
        "Les données publiques, les signalements citoyens et les diagnostics de terrain doivent être vérifiés avant publication opérationnelle. L'observatoire n'a pas vocation à stigmatiser des propriétaires, mais à créer les conditions d'une solution."
      ),
    ],
  },
  {
    file: "saint-etienne.html",
    title: "Saint-Étienne",
    meta:
      "Saint-Étienne est le territoire pilote de Territoires Vivants France et le siège national de l'association.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Territoire pilote",
    h1: "Saint-Étienne, point de départ de la méthode TVF.",
    intro:
      "TVF souhaite expérimenter à Saint-Étienne une démarche de coopération sur l'habitat vacant, les commerces inoccupés, les matériaux de réemploi, les friches et l'engagement citoyen.",
    ctas: [["Proposer une coopération", "contact.html"], ["Agir avec nous", "agir-avec-nous.html"]],
    sections: [
      cards("Axes prioritaires", "Les priorités restent à formaliser avec les acteurs locaux.", [
        ["Habitat", "Repérer les logements vacants ou dégradés et comprendre les blocages."],
        ["Commerce", "Identifier les locaux fermés et les possibilités de réactivation."],
        ["Matériaux", "Structurer une filière locale de réemploi affectée à des projets utiles."],
        ["Friches", "Analyser les espaces délaissés et leurs usages possibles."],
        ["Citoyens", "Organiser le bénévolat, les signalements et les chantiers participatifs."],
      ]),
      textBlock(
        "Pourquoi un pilote local ?",
        "Un dispositif national doit d'abord prouver sa méthode sur un territoire concret. Saint-Étienne permet de travailler sur des sujets représentatifs : reconversion, patrimoine existant, centres-villes, transition écologique, économie circulaire et solidarité."
      ),
    ],
  },
  {
    file: "agir-avec-nous.html",
    title: "Agir avec nous",
    meta:
      "Collectivités, propriétaires, entreprises, associations et citoyens peuvent rejoindre Territoires Vivants France.",
    heroImage: "assets/photos/community-garden-paris.webp",
    eyebrow: "Engagement",
    h1: "Chaque acteur peut apporter une partie de la solution.",
    intro:
      "TVF propose des parcours simples pour entrer en relation, qualifier un besoin et préparer une coopération utile.",
    ctas: [["Écrire à TVF", "contact.html"], ["Proposer un bien", "#proposer"]],
    sections: [
      cards("Choisir son parcours", "Un seul objectif : transformer une intention en démarche claire.", [
        ["Je suis une collectivité", "Préparer un diagnostic, une coopération ou une expérimentation territoriale."],
        ["Je suis propriétaire", "Proposer un logement, commerce, bâtiment ou terrain inutilisé."],
        ["Je suis une entreprise", "Valoriser matériaux, compétences, locaux ou mécénat."],
        ["Je suis bénévole", "Participer à une mission, un chantier ou une action locale."],
        ["Je souhaite financer", "Soutenir un projet avec un cadre de suivi et de transparence."],
      ]),
      formSection(),
    ],
  },
  {
    file: "contact.html",
    title: "Contact",
    meta:
      "Contacter Territoires Vivants France, association nationale en création basée à Saint-Étienne.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Contact",
    h1: "Entrer en relation avec TVF.",
    intro:
      "Vous représentez une collectivité, une entreprise, une association, un propriétaire ou un collectif citoyen ? Présentez votre besoin en quelques lignes.",
    ctas: [["Envoyer un message", "#contact-form"], ["Voir les parcours", "agir-avec-nous.html"]],
    sections: [
      contactSection(),
      textBlock(
        "Siège national",
        "Territoires Vivants France - 25 rue Élise Gervais, 42000 Saint-Étienne. Président fondateur : Edryan Rangoly. Secrétaire et trésorier : M. Lambeau Jordan."
      ),
    ],
  },
  {
    file: "transparence.html",
    title: "Transparence",
    meta:
      "Transparence, gouvernance, données et feuille de route de Territoires Vivants France.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Transparence",
    h1: "Avancer avec méthode et preuve.",
    intro:
      "TVF distingue clairement ce qui est déjà établi, ce qui est en cours de structuration et ce qui devra être validé par convention, données ou partenariats réels.",
    ctas: [["Documents", "#documents"], ["Contact", "contact.html"]],
    sections: [
      cards("Principes de publication", "Une règle simple : pas de chiffres ni de partenaires inventés.", [
        ["Données", "Publier uniquement des données sourcées ou des objectifs explicitement identifiés."],
        ["Partenariats", "Afficher les partenaires seulement lorsqu'un accord réel existe."],
        ["Projets", "Distinguer projet envisagé, projet en instruction et projet réalisé."],
        ["Impact", "Mesurer avant de communiquer des résultats."],
      ]),
      timeline("Feuille de route sobre", [
        ["1", "Structurer", "Documents, statuts, conventions, critères de sélection."],
        ["2", "Expérimenter", "Territoire pilote, premiers diagnostics, premiers contacts."],
        ["3", "Formaliser", "Partenariats, financements, projets validés."],
        ["4", "Déployer", "Antennes locales et observatoire national lorsque la méthode est éprouvée."],
      ]),
    ],
  },
  {
    file: "mentions-legales.html",
    title: "Mentions légales",
    meta: "Mentions légales de Territoires Vivants France.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Cadre légal",
    h1: "Mentions légales.",
    intro:
      "Cette page est préparée pour être mise à jour après les formalités administratives officielles de l'association.",
    ctas: [["Contact", "contact.html"], ["Transparence", "transparence.html"]],
    sections: [
      legalSection(),
    ],
  },
];

function sectionIntro(title, text, items) {
  return `<section class="section"><div class="container intro-grid"><div><p class="section-kicker">Fondation</p><h2>${title}</h2><p>${text}</p></div><div class="mini-list">${items
    .map(([h, p]) => `<article><strong>${h}</strong><span>${p}</span></article>`)
    .join("")}</div></div></section>`;
}

function cards(title, intro, items) {
  return `<section class="section soft"><div class="container"><div class="section-head"><p class="section-kicker">Repères</p><h2>${title}</h2><p>${intro}</p></div><div class="card-grid">${items
    .map(([h, p, href]) => `<article class="card"><span class="card-icon" aria-hidden="true">${iconFor(h)}</span><h3>${h}</h3><p>${p}</p>${href ? `<a class="text-link" href="${href}">Découvrir</a>` : ""}</article>`)
    .join("")}</div></div></section>`;
}

function timeline(title, items) {
  return `<section class="section"><div class="container"><div class="section-head"><p class="section-kicker">Méthode</p><h2>${title}</h2></div><div class="timeline">${items
    .map(([n, h, p]) => `<article><span>${n}</span><div><h3>${h}</h3><p>${p}</p></div></article>`)
    .join("")}</div></div></section>`;
}

function highlight(title, text, label, href, image) {
  return `<section class="section feature"><div class="container feature-grid"><img src="${image}" alt="Vue urbaine française liée à la revitalisation territoriale" loading="lazy"><div><p class="section-kicker">Pilote</p><h2>${title}</h2><p>${text}</p><a class="btn primary" href="${href}">${label}</a></div></div></section>`;
}

function split(title, text, image) {
  return `<section class="section"><div class="container split"><img src="${image}" alt="${title}" loading="lazy"><div><p class="section-kicker">Approche</p><h2>${title}</h2><p>${text}</p></div></div></section>`;
}

function textBlock(title, text) {
  return `<section class="section"><div class="container narrow"><p class="section-kicker">Analyse</p><h2>${title}</h2><p>${text}</p></div></section>`;
}

function formSection() {
  return `<section class="section" id="proposer"><div class="container form-panel"><div><p class="section-kicker">Premier contact</p><h2>Présenter une situation</h2><p>Ce formulaire statique prépare les informations utiles. L'envoi réel sera relié à un outil sécurisé lorsque le cadre opérationnel sera finalisé.</p></div><form><label>Votre profil<select><option>Collectivité</option><option>Propriétaire</option><option>Entreprise</option><option>Association</option><option>Citoyen</option></select></label><label>Objet<input type="text" placeholder="Ex. logement vacant, matériaux, partenariat"></label><label>Message<textarea placeholder="Décrivez le besoin, le lieu, les acteurs concernés et les délais."></textarea></label><a class="btn primary" href="contact.html">Passer par la page contact</a></form></div></section>`;
}

function contactSection() {
  return `<section class="section" id="contact-form"><div class="container form-panel"><div><p class="section-kicker">Message</p><h2>Décrivez votre demande</h2><p>Indiquez votre profil, votre commune, le type de bien ou de coopération, et les informations déjà disponibles.</p></div><form><label>Nom / structure<input type="text" placeholder="Votre nom ou organisme"></label><label>E-mail<input type="email" placeholder="contact@exemple.fr"></label><label>Message<textarea placeholder="Votre message"></textarea></label><button class="btn primary" type="button">Préparer l'envoi</button></form></div></section>`;
}

function legalSection() {
  return `<section class="section"><div class="container legal"><h2>Éditeur</h2><p><strong>Territoires Vivants France</strong><br>Association nationale en création<br>25 rue Élise Gervais, 42000 Saint-Étienne</p><h2>Responsables</h2><p>Président fondateur : Edryan Rangoly.<br>Secrétaire et trésorier : M. Lambeau Jordan.</p><h2>Données personnelles</h2><p>Les formulaires présentés dans cette version sont préparatoires. Aucune collecte opérationnelle ne doit être considérée comme active tant que les outils sécurisés et les mentions RGPD définitives ne sont pas publiés.</p><h2>Propriété intellectuelle</h2><p>Les textes, logos et éléments graphiques du site sont destinés à présenter le projet Territoires Vivants France. Toute réutilisation doit faire l'objet d'une autorisation.</p></div></section>`;
}

function iconFor(text) {
  const t = text.toLowerCase();
  if (t.includes("logement") || t.includes("habitat") || t.includes("propri")) return "⌂";
  if (t.includes("commerce")) return "▦";
  if (t.includes("mat")) return "♻";
  if (t.includes("friche") || t.includes("terrain")) return "◎";
  if (t.includes("solid") || t.includes("béné") || t.includes("citoy")) return "✦";
  if (t.includes("collect")) return "⌁";
  if (t.includes("entreprise")) return "◫";
  if (t.includes("finance")) return "◆";
  return "•";
}

function pageTemplate(page) {
  const active = page.file;
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title} | ${site.name}</title>
  <meta name="description" content="${page.meta}">
  <meta property="og:title" content="${page.title} | ${site.name}">
  <meta property="og:description" content="${page.meta}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site.url}/${page.file}">
  <meta property="og:image" content="${site.url}/assets/logo-tvf-officiel-fond-blanc.png">
  <link rel="icon" href="assets/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="Accueil Territoires Vivants France"><img src="assets/logo-tvf-officiel-transparent.png" alt="Territoires Vivants France"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button>
      <nav class="main-nav" id="main-nav" aria-label="Navigation principale">${nav
        .map(([label, href]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("")}</nav>
      <a class="btn header-cta" href="contact.html">Nous contacter</a>
    </div>
  </header>
  <main id="contenu">
    <section class="hero" style="--hero-image:url('${page.heroImage}')">
      <div class="container hero-inner">
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.h1}</h1>
        <p>${page.intro}</p>
        <div class="hero-actions">${page.ctas.map(([label, href], i) => `<a class="btn ${i === 0 ? "primary" : "secondary"}" href="${href}">${label}</a>`).join("")}</div>
      </div>
    </section>
    ${page.sections.join("\n")}
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div><span class="footer-logo-box"><img src="assets/logo-tvf-officiel-transparent.png" alt="Territoires Vivants France" class="footer-logo"></span><p>Plateforme nationale de coopération pour redonner vie aux biens, lieux et ressources inutilisés.</p></div>
      <div><h2>Navigation</h2>${nav.slice(0, 6).map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div>
      <div><h2>Ressources</h2><a href="transparence.html">Transparence</a><a href="mentions-legales.html">Mentions légales</a><a href="contact.html">Contact</a></div>
      <div><h2>Siège</h2><p>25 rue Élise Gervais<br>42000 Saint-Étienne</p><a class="btn secondary" href="contact.html">Contacter TVF</a></div>
    </div>
    <div class="container footer-bottom">© 2026 Territoires Vivants France - Tous droits réservés.</div>
  </footer>
  <script src="main.js" defer></script>
</body>
</html>`;
}

for (const page of pages) {
  fs.writeFileSync(path.join(process.cwd(), page.file), pageTemplate(page), "utf8");
}

fs.writeFileSync(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
  "utf8"
);

fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url><loc>${site.url}/${p.file}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
  "utf8"
);

fs.writeFileSync(
  "site.webmanifest",
  JSON.stringify(
    {
      name: site.name,
      short_name: "TVF",
      start_url: "/",
      display: "standalone",
      background_color: "#f6f3ec",
      theme_color: "#245c2b",
      icons: [
        { src: "assets/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    null,
    2
  ),
  "utf8"
);

fs.writeFileSync(
  "vercel.json",
  JSON.stringify({ cleanUrls: true, trailingSlash: false }, null, 2),
  "utf8"
);

console.log(`Generated ${pages.length} pages.`);
