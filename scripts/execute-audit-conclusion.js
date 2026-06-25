const fs = require("fs");

const descriptions = {
  "admin-dashboard.html":
    "Tableau de bord administrateur TVF pour valider les signalements, materiaux, partenaires, antennes locales, projets et documents avant publication ou suivi.",
  "carte-connectee.html":
    "Carte connectee Supabase de Territoires Vivants France pour enregistrer, qualifier, afficher et suivre les signalements territoriaux valides.",
  "action-solidarite-insertion.html":
    "Découvrez comment Territoires Vivants France relie chantiers participatifs, bénévolat, formation et insertion professionnelle autour de projets territoriaux utiles.",
  "agir-avec-nous.html":
    "Agir avec Territoires Vivants France : signaler un lieu vacant, proposer des matériaux, devenir bénévole, partenaire, propriétaire partenaire ou soutenir l'association.",
  "antennes-locales.html":
    "Comprendre le futur réseau d'antennes locales de Territoires Vivants France : rôle, méthode, animation territoriale, bénévoles et coopération avec les acteurs locaux.",
  "ce-que-tvf-ne-fait-pas.html":
    "Clarifier les limites de Territoires Vivants France : TVF coordonne, qualifie et accompagne les projets sans promettre de financement automatique ni de résultats fictifs.",
  "centre-documentaire-beta.html":
    "Préfiguration du centre documentaire TVF pour regrouper guides, fiches pratiques, études, rapports et documents utiles aux territoires et partenaires.",
  "charte-ethique.html":
    "Charte éthique de Territoires Vivants France : principes d'intérêt général, transparence, indépendance, gestion des conflits d'intérêts et respect des territoires.",
  "collectivites-beta.html":
    "Préfiguration de l'espace collectivités TVF pour les diagnostics territoriaux, la cartographie du patrimoine vacant et les demandes d'accompagnement.",
  "contact.html":
    "Contacter Territoires Vivants France pour proposer un bien, signaler une situation, contribuer au réemploi, devenir partenaire ou soutenir l'association.",
  "entreprises-beta.html":
    "Préfiguration de l'espace entreprises TVF pour les dons de matériaux, le mécénat, la valorisation RSE, les partenariats et la mise à disposition de ressources.",
  "espace-adherents.html":
    "Préfiguration de l'espace adhérents TVF pour suivre les actions, documents, adhésions et contributions au développement de l'association.",
  "espace-benevoles.html":
    "Espace bénévoles TVF : comprendre les missions possibles, les chantiers participatifs, la documentation, les formations et les formes d'engagement citoyen.",
  "espace-partenaires.html":
    "Préfiguration de l'espace partenaires TVF pour les collectivités, associations, entreprises, bailleurs, écoles, universités, fondations et acteurs locaux.",
  "espace-projet.html":
    "Préfiguration de l'espace projet TVF pour suivre les étapes d'une idée territoriale : étude, mobilisation, financement, réalisation et mesure d'impact.",
  "faire-un-don.html":
    "Soutenir Territoires Vivants France par un don pour contribuer à la structuration d'une plateforme nationale de revitalisation territoriale et de réemploi.",
  "formulaires-supabase.html":
    "Préfiguration des formulaires connectés à Supabase pour les signalements, matériaux, biens solidaires, partenaires, mécènes et projets territoriaux.",
  "impact-investisseurs.html":
    "Comprendre le suivi d'impact proposé aux investisseurs solidaires : affectation des contributions, avancement des projets, indicateurs réels et reporting.",
  "impact-resultats.html":
    "Mesure d'impact TVF : méthode de suivi des signalements, matériaux, projets, territoires accompagnés et résultats vérifiés sans chiffres fictifs.",
  "materiaux-reels.html":
    "Préfiguration des fiches matériaux TVF : catégorie, quantité, état, localisation, disponibilité, contact et affectation à des projets validés.",
  "mentions-legales.html":
    "Mentions légales de Territoires Vivants France : identité, adresse, responsable de publication, hébergement, propriété intellectuelle et cadre évolutif.",
  "mesure-impact.html":
    "Méthode de mesure d'impact TVF : indicateurs, collecte de preuves, transparence, suivi territorial et distinction entre données réelles et projections.",
  "partenariat-bailleurs.html":
    "Modalités de partenariat avec les bailleurs : biens vacants, réhabilitation, occupation temporaire, convention, usages sociaux et suivi territorial.",
  "partenariat-fondations.html":
    "Modalités de coopération avec les fondations et mécènes pour soutenir les projets TVF : sélection, transparence, affectation et mesure d'impact.",
  "pole-commerce-vivant.html":
    "Commerce Vivant : pôle TVF consacré aux locaux commerciaux vacants, rez-de-chaussée actifs, activités de proximité et revitalisation des centres-villes.",
  "pole-friches-terrains-vivants.html":
    "Friches et Terrains Vivants : pôle TVF dédié à la transformation d'espaces abandonnés en usages utiles, sobres, verts et ouverts aux habitants.",
  "pole-habitat-vivant.html":
    "Habitat Vivant : pôle TVF dédié au repérage des logements vacants, à l'accompagnement des propriétaires et à la remise en usage du patrimoine.",
  "pole-materiautheque-solidaire.html":
    "Matériauthèque Solidaire : pôle TVF consacré à la collecte, la qualification, la valorisation et l'affectation de matériaux de réemploi.",
  "pole-observatoire-patrimoine-vacant.html":
    "Pôle Observatoire du patrimoine vacant : identifier, documenter et qualifier logements, commerces, bâtiments, friches et ressources territoriales.",
  "pole-solidarite-insertion.html":
    "Solidarité et Insertion : pôle TVF dédié aux chantiers participatifs, parcours d'engagement, formations, bénévolat et inclusion sociale.",
  "pourquoi-tvf-existe.html":
    "Comprendre pourquoi Territoires Vivants France existe : vacance immobilière, friches, gaspillage de matériaux, besoins locaux et coordination territoriale.",
  "projets-realises-bien-solidaire.html":
    "Page préparatoire des projets réalisés du programme Bien Solidaire à Usage Partagé, destinée à présenter uniquement des projets validés et documentés.",
  "proposer-materiaux.html":
    "Proposer des matériaux à Territoires Vivants France : type, état, quantité, localisation, photos et affectation possible à des projets validés.",
  "qui-sommes-nous.html":
    "Découvrir Territoires Vivants France : association en création, mission, gouvernance, méthode, posture partenariale et ambition nationale.",
  "recrutement.html":
    "Rejoindre Territoires Vivants France : bénévoles, volontaires, stagiaires, services civiques et futurs profils salariés selon les besoins du projet.",
  "ressources.html":
    "Centre de ressources TVF : guides, fiches pratiques, études, données publiques, documentation, presse et supports pour les acteurs territoriaux.",
  "sources-etude-saint-etienne.html":
    "Sources de l'étude Saint-Étienne TVF : données publiques, organismes, documents institutionnels et références mobilisées pour le diagnostic territorial.",
  "statistiques-beta.html":
    "Préfiguration des statistiques TVF : signalements, matériaux, projets, territoires, antennes et indicateurs calculés depuis les données réelles.",
  "statuts.html":
    "Statuts de Territoires Vivants France : objet associatif, gouvernance, membres, fonctionnement, ressources et cadre modifiable après déclaration officielle."
};

const titles = {
  "action-antennes-locales.html":
    "Action antennes locales | TERRITOIRES VIVANTS FRANCE",
  "pole-observatoire-patrimoine-vacant.html":
    "Pôle Observatoire du patrimoine vacant | TERRITOIRES VIVANTS FRANCE"
};

const quickReads = {
  "banque-materiaux.html": [
    "La Banque de Matériaux TVF n'est pas une plateforme de distribution gratuite.",
    "Les ressources sont qualifiées, tracées et affectées à des projets validés par TVF.",
    "Le dispositif sert la coopération territoriale, le réemploi et la revitalisation locale."
  ],
  "dossier-saint-etienne.html": [
    "Saint-Étienne constitue le territoire pilote de préfiguration de TVF.",
    "Le dossier distingue les données publiques, les constats territoriaux et les pistes d'intervention.",
    "La méthode pourra être dupliquée à d'autres communes, EPCI, départements et régions."
  ],
  "tvf-enjeux-saint-etienne.html": [
    "TVF est présenté comme un outil complémentaire des politiques publiques locales.",
    "La page relie besoins du territoire, dispositifs existants, réponse TVF et impacts attendus.",
    "Les fiches sont conçues pour être réutilisées sur d'autres territoires."
  ],
  "documents-officiels.html": [
    "Cette page rassemble les règles, conventions et documents de référence à structurer.",
    "Elle clarifie la sélection des projets, les responsabilités et les limites d'intervention.",
    "Les modèles restent évolutifs jusqu'à validation juridique complète."
  ],
  "proprietaires.html": [
    "Le propriétaire conserve son bien et peut entrer dans une coopération territoriale encadrée.",
    "La convention précise durée, usages, travaux, charges, responsabilités et restitution.",
    "TVF n'intervient qu'après qualification du bien, faisabilité et accord formalisé."
  ],
  "nos-poles.html": [
    "Les cinq pôles ne fonctionnent pas séparément : ils structurent une chaîne d'action.",
    "Chaque pôle traite une ressource inutilisée : habitat, matériaux, commerce, friche ou engagement.",
    "L'objectif est de coordonner les acteurs plutôt que remplacer les dispositifs existants."
  ],
  "nos-actions.html": [
    "Les actions TVF partent d'un diagnostic territorial et d'un besoin local documenté.",
    "Chaque action vise à remettre en usage une ressource abandonnée ou sous-utilisée.",
    "Le parcours associe observation, mobilisation, convention, mise en œuvre et suivi."
  ]
};

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function replaceMeta(html, name, value) {
  const escaped = escapeAttr(value);
  const meta = `<meta name="${name}" content="${escaped}" />`;
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
  return re.test(html) ? html.replace(re, meta) : html.replace("</title>", `</title>\n    ${meta}`);
}

function replaceOg(html, property, value) {
  const escaped = escapeAttr(value);
  const meta = `<meta property="${property}" content="${escaped}" />`;
  const re = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, "i");
  return re.test(html) ? html.replace(re, meta) : html.replace(/<meta name="twitter:card"[^>]*>/i, `${meta}\n    $&`);
}

function addQuickRead(html, file, items) {
  if (html.includes("audit-quick-read")) return html;
  const list = items.map((item) => `<li>${item}</li>`).join("");
  const block = `
      <section class="page-wrap audit-quick-read" aria-labelledby="audit-quick-read-${file.replace(/[^a-z0-9]/gi, "-")}">
        <span class="dossier-kicker">Lecture rapide</span>
        <h2 id="audit-quick-read-${file.replace(/[^a-z0-9]/gi, "-")}">Ce qu'il faut retenir</h2>
        <ul>${list}</ul>
      </section>
`;
  const firstSectionEnd = html.indexOf("</section>");
  if (firstSectionEnd === -1) return html;
  return html.slice(0, firstSectionEnd + "</section>".length) + block + html.slice(firstSectionEnd + "</section>".length);
}

function tuneImages(html) {
  let seenContentImage = false;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;
    if (!/\bdecoding=/.test(next)) {
      next = next.replace("<img", '<img decoding="async"');
    }
    const isLogo = /logo-territoires-vivants-france\.png/.test(next);
    const isPriority = /\bfetchpriority=["']high["']/.test(next);
    if (!isLogo && !isPriority && !/\bloading=/.test(next)) {
      next = next.replace("<img", '<img loading="lazy"');
    }
    if (!isLogo && !seenContentImage && !/\bloading=/.test(tag) && !isPriority) {
      seenContentImage = true;
    }
    return next;
  });
}

let changed = 0;
for (const file of fs.readdirSync(".").filter((name) => name.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  if (descriptions[file]) {
    html = replaceMeta(html, "description", descriptions[file]);
    html = replaceOg(html, "og:description", descriptions[file]);
    html = replaceMeta(html, "twitter:description", descriptions[file]);
  }
  if (titles[file]) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titles[file]}</title>`);
    html = replaceOg(html, "og:title", titles[file]);
  }
  if (quickReads[file]) {
    html = addQuickRead(html, file, quickReads[file]);
  }
  html = tuneImages(html);
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

console.log(`Audit conclusion applied to ${changed} HTML files.`);
