const fs = require("fs");
const path = require("path");

const root = process.cwd();
const templateFile = "qui-sommes-nous.html";

function filePath(file) {
  return path.join(root, file);
}

function read(file) {
  return fs.readFileSync(filePath(file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(filePath(file), content, "utf8");
}

function polishFrenchText(text) {
  const replacements = [
    [/\bProprietaires\b/g, "Propri&eacute;taires"],
    [/\bproprietaires\b/g, "propri&eacute;taires"],
    [/\bproprietaire\b/g, "propri&eacute;taire"],
    [/\bMateriaux\b/g, "Mat&eacute;riaux"],
    [/\bmateriaux\b/g, "mat&eacute;riaux"],
    [/\bDonnees\b/g, "Donn&eacute;es"],
    [/\bdonnees\b/g, "donn&eacute;es"],
    [/\bdonnee\b/g, "donn&eacute;e"],
    [/\bcollectivites\b/g, "collectivit&eacute;s"],
    [/\bcollectivite\b/g, "collectivit&eacute;"],
    [/\bbenevoles\b/g, "b&eacute;n&eacute;voles"],
    [/\bbenevole\b/g, "b&eacute;n&eacute;vole"],
    [/\bmecenes\b/g, "m&eacute;c&egrave;nes"],
    [/\bmecene\b/g, "m&eacute;c&egrave;ne"],
    [/\bconfidentialite\b/g, "confidentialit&eacute;"],
    [/\bsecurite\b/g, "s&eacute;curit&eacute;"],
    [/\bpropriete\b/g, "propri&eacute;t&eacute;"],
    [/\butilite\b/g, "utilit&eacute;"],
    [/\binteret\b/g, "int&eacute;r&ecirc;t"],
    [/\bnecessaires\b/g, "n&eacute;cessaires"],
    [/\bnecessaire\b/g, "n&eacute;cessaire"],
    [/\brealistes\b/g, "r&eacute;alistes"],
    [/\brealiste\b/g, "r&eacute;aliste"],
    [/\brealises\b/g, "r&eacute;alis&eacute;s"],
    [/\brealise\b/g, "r&eacute;alis&eacute;"],
    [/\bverifiees\b/g, "v&eacute;rifi&eacute;es"],
    [/\bverifies\b/g, "v&eacute;rifi&eacute;s"],
    [/\bverifie\b/g, "v&eacute;rifi&eacute;"],
    [/\bverifier\b/g, "v&eacute;rifier"],
    [/\bverification\b/g, "v&eacute;rification"],
    [/\brenovation\b/g, "r&eacute;novation"],
    [/\brenove\b/g, "r&eacute;nov&eacute;"],
    [/\brenover\b/g, "r&eacute;nover"],
    [/\breemploi\b/g, "r&eacute;emploi"],
    [/\bbatiments\b/g, "b&acirc;timents"],
    [/\bbatiment\b/g, "b&acirc;timent"],
    [/\bdegrades\b/g, "d&eacute;grad&eacute;s"],
    [/\bdegrade\b/g, "d&eacute;grad&eacute;"],
    [/\binutilises\b/g, "inutilis&eacute;s"],
    [/\binutilise\b/g, "inutilis&eacute;"],
    [/\babandonnes\b/g, "abandonn&eacute;s"],
    [/\babandonne\b/g, "abandonn&eacute;"],
    [/\bduree\b/g, "dur&eacute;e"],
    [/\blimitee\b/g, "limit&eacute;e"],
    [/\becrit\b/g, "&eacute;crit"],
    [/\betude\b/g, "&eacute;tude"],
    [/\betudier\b/g, "&eacute;tudier"],
    [/\betudie\b/g, "&eacute;tudi&eacute;"],
    [/\betudiant\b/g, "&eacute;tudiant"],
    [/\bapres\b/g, "apr&egrave;s"],
    [/\breserve\b/g, "r&eacute;serve"],
    [/\bfaisabilite\b/g, "faisabilit&eacute;"],
    [/\bqualifiees\b/g, "qualifi&eacute;es"],
    [/\bqualifies\b/g, "qualifi&eacute;s"],
    [/\bqualifie\b/g, "qualifi&eacute;"],
    [/\bqualification\b/g, "qualification"],
    [/\bsysteme\b/g, "syst&egrave;me"],
    [/\bmodalites\b/g, "modalit&eacute;s"],
    [/\bbeneficiaires\b/g, "b&eacute;n&eacute;ficiaires"],
    [/\bdechets\b/g, "d&eacute;chets"],
    [/\breduction\b/g, "r&eacute;duction"],
    [/\bstrategie\b/g, "strat&eacute;gie"],
    [/\bactivites\b/g, "activit&eacute;s"],
    [/\bactivite\b/g, "activit&eacute;"],
    [/\brehabilitation\b/g, "r&eacute;habilitation"],
    [/\bprevisionnel\b/g, "pr&eacute;visionnel"],
    [/\bprevisionnelle\b/g, "pr&eacute;visionnelle"],
    [/\binterne\b/g, "interne"],
    [/\bdemarche\b/g, "d&eacute;marche"],
    [/\bdecision\b/g, "d&eacute;cision"],
    [/\breception\b/g, "r&eacute;ception"],
    [/\bprecisions\b/g, "pr&eacute;cisions"],
    [/\bprecision\b/g, "pr&eacute;cision"],
    [/\bpreciser\b/g, "pr&eacute;ciser"],
    [/\bcomplete\b/g, "compl&eacute;t&eacute;e"],
    [/\bpreparation\b/g, "pr&eacute;paration"],
    [/\bpreparee\b/g, "pr&eacute;par&eacute;e"],
    [/\bprepare\b/g, "pr&eacute;par&eacute;"],
    [/\breponse\b/g, "r&eacute;ponse"],
    [/\bgeolocalisation\b/g, "g&eacute;olocalisation"],
    [/\bcategorie\b/g, "cat&eacute;gorie"],
    [/\bquantite\b/g, "quantit&eacute;"],
    [/\betat\b/g, "&eacute;tat"],
    [/\bdisponibilite\b/g, "disponibilit&eacute;"],
    [/\bcompetences\b/g, "comp&eacute;tences"],
    [/\bcompetence\b/g, "comp&eacute;tence"],
    [/\bmediation\b/g, "m&eacute;diation"],
    [/\bfinalites\b/g, "finalit&eacute;s"],
    [/\bsuppression\b/g, "suppression"],
    [/\bevolution\b/g, "&eacute;volution"],
    [/\breferences\b/g, "r&eacute;f&eacute;rences"],
    [/\breference\b/g, "r&eacute;f&eacute;rence"],
    [/\bmillesime\b/g, "mill&eacute;sime"],
    [/\boperationnels\b/g, "op&eacute;rationnels"],
    [/\boperationnel\b/g, "op&eacute;rationnel"],
    [/\boperationnelle\b/g, "op&eacute;rationnelle"],
    [/\beconomique\b/g, "&eacute;conomique"],
    [/\bjuridique\b/g, "juridique"],
    [/\breglementees\b/g, "r&eacute;glement&eacute;es"],
    [/\bregles\b/g, "r&egrave;gles"],
    [/\bcriteres\b/g, "crit&egrave;res"],
    [/\bacces\b/g, "acc&egrave;s"],
    [/\bpieces\b/g, "pi&egrave;ces"],
    [/\bpiece\b/g, "pi&egrave;ce"],
    [/\bdelaisses\b/g, "d&eacute;laiss&eacute;s"],
    [/\bcreation\b/g, "cr&eacute;ation"],
    [/\bcreer\b/g, "cr&eacute;er"],
    [/\bcree\b/g, "cr&eacute;&eacute;"],
    [/\brepondre\b/g, "r&eacute;pondre"],
    [/\bequipe\b/g, "&eacute;quipe"],
    [/\betre\b/g, "&ecirc;tre"],
    [/\ba\b/g, "&agrave;"]
  ];
  return replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
}

function polishMainText(html) {
  return html.replace(/<main\b[\s\S]*?<\/main>/i, (main) => main.replace(/>([^<]+)</g, (match, text) => `>${polishFrenchText(text)}<`));
}

function ensureFile(file) {
  if (!fs.existsSync(filePath(file))) {
    fs.copyFileSync(filePath(templateFile), filePath(file));
  }
}

function updateHead(html, { title, description, slug, image }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="https://www.territoiresvivantsfrance.fr/${slug}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="https://www.territoiresvivantsfrance.fr/${slug}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/>/i, `<meta property="og:image" content="https://www.territoiresvivantsfrance.fr/${image}" />`);
  return html;
}

function renderPage({ file, title, description, status, h1, h1Accent, intro, image, imageAlt, sections, cta }) {
  ensureFile(file);
  const slug = file.replace(/\.html$/, "");
  const docSection = `
        <section class="doc-section compact" data-copy-expansion="documentary" aria-labelledby="copy-${slug}">
          <span class="doc-kicker">Socle documentaire</span>
          <h2 id="copy-${slug}">Lire cette page comme une ressource de travail</h2>
          <p>Cette page precise le cadre d'action de Territoires Vivants France : ce qui peut etre etudie, ce qui doit etre verifie, les limites de publication et les conditions de cooperation. Elle ne remplace ni une decision publique, ni un diagnostic technique, ni une convention signee.</p>
          <div class="doc-grid">
            <article class="doc-card"><h3>Preuve attendue</h3><p>Chaque donnee operationnelle doit indiquer sa source, sa date, son territoire, son statut de validation et ses limites.</p></article>
            <article class="doc-card"><h3>Role TVF</h3><p>TVF coordonne, qualifie, oriente et documente. L'association ne publie pas de faux partenaires, faux financeurs ou resultats non mesures.</p></article>
            <article class="doc-card"><h3>Evolution</h3><p>Les formulaires, cartes et tableaux de bord sont prepares pour une montee en charge progressive avec Supabase.</p></article>
          </div>
        </section>`;
  const main = `    <main data-professional-enrichment="public-page">
      <section class="page-hero">
        <div><span class="page-status" data-status="public">${status}</span><h1>${h1} <span>${h1Accent}</span></h1><p>${intro}</p></div>
        <img decoding="async" fetchpriority="high" class="page-hero-photo" src="${image}" alt="${imageAlt}" width="1800" height="1200" />
      </section>
      <div class="page-wrap">
${sections.join("\n")}
${cta ? `
        <section class="institutional-callout">
          <div><h2>${cta.title}</h2><p>${cta.text}</p></div>
          <a class="button" href="${cta.href}">${cta.label}</a>
        </section>` : ""}
${docSection}
      </div>
    </main>`;
  let html = read(file);
  html = html.replace(/\s*<main\b[\s\S]*?<\/main>/i, `\n${main}`);
  html = updateHead(html, { title: polishFrenchText(title), description: polishFrenchText(description), slug: file, image });
  write(file, html);
}

function cards(items) {
  return `<div class="dossier-grid">${items.map(([title, text]) => `<article class="dossier-card"><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>`;
}

function flow(items) {
  return `<div class="decision-flow">${items.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>`;
}

function table(rows) {
  return `<table class="stat-comparison"><thead><tr><th>Sujet</th><th>Position TVF</th><th>Condition de publication</th></tr></thead><tbody>${rows.map(([a, b, c]) => `<tr><th>${a}</th><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody></table>`;
}

function section(kicker, title, body) {
  return `        <section class="dossier-section"><span class="dossier-kicker">${kicker}</span><h2>${title}</h2>${body}</section>`;
}

renderPage({
  file: "proprietaires.html",
  title: "Proprietaires | Territoires Vivants France",
  description: "Parcours proprietaires TVF : proposer un logement vacant, commerce ferme, batiment inutilise ou terrain abandonne dans un cadre de cooperation territoriale.",
  status: "Parcours public",
  h1: "Proprietaires et",
  h1Accent: "biens vacants",
  intro: "Un proprietaire peut conserver la pleine propriete de son bien tout en etudiant avec TVF une remise en usage utile au territoire, sous reserve de diagnostic, faisabilite, financement et convention.",
  image: "assets/photos/housing-renovation.jpg",
  imageAlt: "Batiment residentiel en renovation",
  sections: [
    section("Principe", "Un cadre pour les biens qui ont un potentiel d'utilite territoriale", `<p class="lead-block">TVF peut etudier des situations concernant un logement vacant, un immeuble degrade, un commerce ferme, un batiment inutilise ou un terrain abandonne. L'objectif n'est pas de remplacer le proprietaire, mais de construire une cooperation lorsque le bien peut redevenir utile aux habitants.</p>${cards([["Biens concernes", "Logements vacants, locaux commerciaux fermes, batiments inutilises, immeubles a renover, terrains delaisses ou espaces pouvant accueillir un usage temporaire."], ["Propriete conservee", "Le proprietaire garde son bien. Toute utilisation par TVF ou un tiers doit etre encadree par une convention ecrite, datee et limitee."], ["Projet utile", "Le bien doit pouvoir repondre a un besoin local : logement solidaire, local associatif, activite de proximite, formation, atelier partage ou service aux habitants."]])}`),
    section("Ce que TVF peut faire", "Accompagner, coordonner et rechercher des solutions realistes", cards([["Diagnostic initial", "Collecter les informations disponibles : adresse, etat apparent, occupation, contraintes connues, photos, documents transmis et besoin local."], ["Mobilisation", "Rechercher les acteurs utiles : collectivite, benevoles, entreprises, artisans, associations, mecene ou financeur potentiel."], ["Ressources", "Etudier l'usage de materiaux de reemploi, dons, competences et moyens logistiques lorsque leur etat et leur destination sont compatibles."], ["Dossier", "Aider a structurer une proposition lisible : usage vise, duree, budget previsionnel, responsabilites, assurances, suivi et sortie du dispositif."], ["Convention", "Preparer une convention de valorisation ou d'usage partage si le projet est faisable et valide par les parties."], ["Suivi", "Documenter les etapes, publier uniquement ce qui est autorise et mesurer les resultats apres realisation."]])),
    section("Cooperation territoriale", "Trois scenarios possibles sans utiliser de logique automatique", cards([["Formule A : usage temporaire", "Une renovation ou remise en etat peut ouvrir un droit d'usage temporaire pour un projet utile, selon une duree proportionnee et conventionnee."], ["Formule B : loyer solidaire", "Le proprietaire peut percevoir un loyer modere lorsque l'equilibre economique, le cadre juridique et l'usage territorial le permettent."], ["Formule C : revenus partages", "Une partie des revenus d'exploitation peut etre affectee au proprietaire, au fonctionnement du projet ou a la poursuite de la renovation, selon convention."]])),
    section("Parcours", "De la proposition a la decision", flow([["1. Proposition", "Le proprietaire transmet les informations disponibles, sans garantie d'acceptation automatique."], ["2. Qualification", "TVF verifie les contraintes connues, l'interet territorial et les pieces manquantes."], ["3. Scenario", "Un ou plusieurs usages possibles sont etudies avec budget, duree et responsabilites."], ["4. Decision", "Le projet est ajourne, oriente ou prepare en convention selon sa faisabilite."], ["5. Mise en oeuvre", "Les travaux, usages et financements demarrent uniquement avec cadre valide."], ["6. Sortie", "A la fin de la convention, le proprietaire recupere son bien selon les conditions prevues."]])),
    section("Limites", "Ce que cette page ne promet pas", table([["Financement", "TVF peut rechercher ou orienter vers des financements.", "Aucune subvention ou aide n'est garantie."], ["Travaux", "TVF peut coordonner un cadre de projet.", "Aucun chantier n'est lance sans securite, assurance et responsables qualifies."], ["Publication", "TVF peut valoriser un projet autorise.", "Aucune adresse sensible n'est publiee sans validation."], ["Delai", "TVF peut instruire progressivement.", "Aucun delai n'est garanti avant diagnostic."]]))
  ],
  cta: { title: "Proposer un bien a etudier", text: "Le premier pas consiste a transmettre les informations utiles. TVF revient ensuite vers le proprietaire pour qualifier la situation.", href: "bien-solidaire-usage-partage.html#proposer", label: "Acceder au formulaire" }
});

renderPage({
  file: "parcours-demande.html",
  title: "Parcours d'une demande | Territoires Vivants France",
  description: "Comprendre comment TVF traite un signalement, une proposition de materiaux, une demande de partenariat ou un projet territorial.",
  status: "Methode publique",
  h1: "Parcours d'une",
  h1Accent: "demande",
  intro: "Pour rester credible, TVF distingue clairement la reception d'une demande, sa qualification, la decision interne, la convention eventuelle et la publication des resultats.",
  image: "assets/photos/institutional-meeting.jpg",
  imageAlt: "Equipe en reunion de qualification de projet",
  sections: [
    section("Vue d'ensemble", "Un parcours simple pour l'utilisateur, rigoureux pour l'association", `<p class="lead-block">Le visiteur doit comprendre ce qui se passe apres un formulaire. Une demande n'est pas automatiquement un projet TVF : elle devient un dossier a qualifier, puis une action seulement si les conditions sont reunies.</p>${flow([["Reception", "Le formulaire est enregistre avec les informations transmises et un statut initial."], ["Verification", "TVF controle les donnees essentielles : contact, territoire, type de demande, pieces et risques."], ["Qualification", "La demande est analysee au regard de l'utilite territoriale, des droits, du cout et de la faisabilite."], ["Orientation", "TVF peut classer, ajourner, demander des precisions, orienter vers un acteur ou preparer un projet."], ["Convention", "Si l'action se confirme, les responsabilites sont formalisees avant toute intervention."], ["Suivi", "Les resultats sont mesures et publies uniquement apres validation."]])}`),
    section("Statuts", "Eviter les confusions entre idee, piste et projet", cards([["Recu", "La demande est bien transmise mais n'a pas encore ete analysee."], ["A completer", "Des informations manquent : photos, adresse, contact, autorisation, documents ou contexte."], ["En qualification", "TVF etudie le potentiel, les contraintes et les acteurs a mobiliser."], ["Non retenu ou reoriente", "La demande ne correspond pas au cadre TVF ou releve d'un autre service."], ["En preparation", "Un scenario est travaille : budget, acteurs, usage, calendrier et cadre juridique."], ["Conventionne", "Un accord formalise permet de demarrer l'action dans des conditions claires."]])),
    section("Publication", "Proteger les personnes, les biens et la credibilite", `<p>TVF ne publie pas une adresse, une photo identifiable, un nom de proprietaire, un partenaire ou un financeur sans autorisation et validation. La transparence ne consiste pas a tout afficher : elle consiste a publier ce qui est exact, utile et compatible avec la protection des donnees.</p>${table([["Signalement", "Peut rester interne jusqu'a verification.", "Publication apres moderation et accord si necessaire."], ["Materiau", "Doit etre decrit, localise et qualifie.", "Publication apres controle de disponibilite."], ["Partenaire", "Mention uniquement apres accord explicite.", "Pas de faux logo ni fausse reference."], ["Impact", "Mesure apres action terminee.", "Aucun chiffre extrapole comme resultat TVF."]])}`),
    section("Pourquoi ce parcours compte", "Une plateforme nationale doit inspirer confiance", `<p>Les collectivites, entreprises, proprietaires, mecènes et habitants ont besoin de savoir comment une information devient une decision. Ce parcours rend TVF plus lisible : il evite les promesses trop rapides, structure les priorites et prepare la connexion Supabase sans exposer de donnees sensibles.</p>`)
  ],
  cta: { title: "Choisir le bon formulaire", text: "Signalement, materiaux, bien vacant, partenariat ou don : chaque entree suit le meme principe de qualification.", href: "agir-avec-nous.html", label: "Voir les parcours" }
});

renderPage({
  file: "sources-donnees.html",
  title: "Sources et donnees | Territoires Vivants France",
  description: "Registre des sources officielles utilisees par TVF : INSEE, ADEME, SDES, Cerema, ANCT, Banque des Territoires et ministeres.",
  status: "Registre public",
  h1: "Sources et",
  h1Accent: "donnees",
  intro: "TVF s'appuie sur des donnees publiques, datees et citees. Les chiffres nationaux servent a contextualiser ; les decisions locales exigent toujours une verification territoriale.",
  image: "assets/photos/documents-resources.jpg",
  imageAlt: "Documents de travail et donnees territoriales",
  sections: [
    section("Principe", "Une donnee n'est utile que si elle est sourcee, datee et contextualisee", `<p class="lead-block">Le site peut citer des chiffres officiels pour expliquer les enjeux, mais il ne transforme pas ces chiffres en resultats propres a TVF. Les impacts de l'association seront publies uniquement apres enregistrement, validation et controle.</p>${cards([["Source", "Nom de l'organisme, lien public et date de consultation ou millesime statistique."], ["Territoire", "France, region, departement, commune ou perimetre d'etude clairement indique."], ["Limite", "Preciser ce que la donnee ne dit pas : disponibilite juridique, cout de remise en etat, etat technique ou usage possible."]] )}`),
    section("Sources nationales", "Les references a privilegier", `<div class="source-register"><span><a href="https://www.insee.fr/fr/statistiques/2011101" rel="noopener" target="_blank">INSEE</a> : population, logement, emploi, revenus, dossiers complets communaux.</span><span><a href="https://www.statistiques.developpement-durable.gouv.fr/" rel="noopener" target="_blank">SDES</a> : dechets, environnement, construction, artificialisation et ressources.</span><span><a href="https://www.ademe.fr/" rel="noopener" target="_blank">ADEME</a> : economie circulaire, reemploi, dechets du batiment, guides methodologiques.</span><span><a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener" target="_blank">Cerema / Cartofriches</a> : reperage et documentation des friches.</span><span><a href="https://anct.gouv.fr/" rel="noopener" target="_blank">ANCT</a> : programmes de revitalisation territoriale.</span><span><a href="https://www.banquedesterritoires.fr/" rel="noopener" target="_blank">Banque des Territoires</a> : ressources, accompagnement et analyses territoriales.</span><span><a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener" target="_blank">Zero Logement Vacant</a> : outil public de mobilisation des logements vacants.</span><span><a href="https://artificialisation.developpement-durable.gouv.fr/" rel="noopener" target="_blank">Portail national de l'artificialisation</a> : suivi foncier et consommation d'espaces.</span></div>`),
    section("Regle de lecture", "Ne pas confondre contexte national et resultat TVF", table([["Logements vacants", "Chiffres INSEE ou outils publics.", "A contextualiser par commune et par statut du bien."], ["Commerces fermes", "Observation locale et perimetres a definir.", "Ne pas publier de taux sans releve date."], ["Friches", "Cartofriches et inventaires locaux.", "Verifier propriete, pollution et urbanisme."], ["Materiaux", "Donnees ADEME/SDES sur dechets et reemploi.", "Qualifier l'etat, la securite et la destination."], ["Impact TVF", "Donnees internes futures.", "Publier seulement les actions realisees et verifiees."]])),
    section("Mise a jour", "Un registre evolutif", `<p>Cette page a vocation a devenir le registre public des sources utilisees par TVF. Les futures fiches territoriales pourront indiquer le millesime des donnees, la methode de calcul, la date de mise a jour et le responsable de validation.</p>`)
  ],
  cta: { title: "Consulter l'Observatoire", text: "Les sources prennent leur sens lorsqu'elles sont reliees a un territoire et a un besoin concret.", href: "observatoire-national.html", label: "Voir l'observatoire" }
});

renderPage({
  file: "ce-que-tvf-ne-fait-pas.html",
  title: "Ce que TVF ne fait pas | Territoires Vivants France",
  description: "Les limites d'intervention de TVF : pas de promesse automatique, pas de distribution libre, pas de faux chiffres et pas de publication sans verification.",
  status: "Cadre de confiance",
  h1: "Ce que TVF",
  h1Accent: "ne fait pas",
  intro: "Pour etre credible, TVF doit expliquer ses limites aussi clairement que ses ambitions. Cette page protege les habitants, proprietaires, partenaires et financeurs contre les malentendus.",
  image: "assets/photos/institutional-meeting.jpg",
  imageAlt: "Reunion institutionnelle de cadrage",
  sections: [
    section("Garde-fous", "Des limites claires pour eviter les promesses floues", cards([["Pas une agence immobiliere", "TVF ne vend pas, n'achete pas et ne loue pas automatiquement les biens proposes."], ["Pas une dechetterie", "La Banque de Materiaux ne recupere pas tout et ne remplace pas les filieres agreees."], ["Pas une plateforme de dons libres", "Les materiaux ne sont pas distribues automatiquement. Leur affectation depend d'un projet valide."], ["Pas un guichet de subventions", "TVF peut rechercher des financements, mais ne garantit aucune aide publique ou privee."], ["Pas un service d'urgence", "Les situations dangereuses doivent etre signalees aux services competents."], ["Pas une publication automatique", "Adresses, photos, partenaires, financeurs et resultats sont verifies avant diffusion."]])),
    section("Travaux et securite", "Aucune action sans cadre technique", `<p>Les chantiers solidaires ou participatifs ne peuvent concerner que des actions compatibles avec la securite, les assurances, l'encadrement et les competences disponibles. TVF ne demande pas a des benevoles de realiser des interventions dangereuses, reglementees ou non encadrees.</p>`),
    section("Donnees et communication", "La confiance passe par la sobriete", table([["Partenaires", "Mention apres confirmation explicite.", "Aucun logo ajoute pour decorer."], ["Chiffres d'impact", "Publication apres mesure.", "Aucune projection presentee comme resultat."], ["Photos", "Images coherentes et autorisees.", "Pas d'image trompeuse avec texte integre."], ["Projets", "Statut visible : idee, pilote, conventionne ou realise.", "Aucun projet pretendu realise sans preuve."]])),
    section("Pourquoi cette page est importante", "La transparence renforce l'ambition nationale", `<p>Une association qui souhaite travailler avec des collectivites, fondations, entreprises et habitants doit montrer qu'elle sait dire non, ajourner, orienter ou attendre. Cette prudence n'affaiblit pas le projet : elle rend possible une montee en charge solide.</p>`)
  ],
  cta: { title: "Voir le parcours de decision", text: "Comprendre comment une demande passe du formulaire a la qualification puis a la decision.", href: "parcours-demande.html", label: "Voir le parcours" }
});

renderPage({
  file: "politique-confidentialite.html",
  title: "Politique de confidentialite | Territoires Vivants France",
  description: "Politique de confidentialite de TVF : donnees collectees, finalites, durees, droits des personnes et preparation Supabase.",
  status: "Protection des donnees",
  h1: "Politique de",
  h1Accent: "confidentialite",
  intro: "TVF collecte uniquement les informations necessaires a la qualification des demandes, a la relation avec les contributeurs et a la preparation d'une plateforme collaborative securisee.",
  image: "assets/photos/documents-resources.jpg",
  imageAlt: "Dossiers administratifs et documents de confidentialite",
  sections: [
    section("Responsable", "Une page facilement modifiable apres declaration officielle", `<p>Territoires Vivants France est une association nationale en creation, basee au 25 rue Elise Gervais, 42000 Saint-Etienne. Le president fondateur indique sur le site est M. Edryan Rangoly. Ces informations pourront etre completees apres declaration officielle et attribution des identifiants administratifs.</p>`),
    section("Donnees collectees", "Des informations proportionnees aux formulaires", cards([["Signalements", "Type de lieu, adresse ou repere, commune, description, photo eventuelle, geolocalisation si transmise et contact facultatif."], ["Materiaux", "Categorie, quantite, etat, localisation, disponibilite, photo, contact et conditions de recuperation."], ["Engagement", "Nom, contact, profil, commune, disponibilites, message, type d'engagement ou de cooperation demande."], ["Documents", "Fichiers transmis volontairement pour etudier un dossier, un partenariat ou une demande de diagnostic."]])),
    section("Finalites", "Pourquoi ces donnees sont utilisees", cards([["Qualification", "Comprendre la demande, verifier les informations essentielles et eviter les publications inexactes."], ["Contact", "Repondre a la personne, demander des precisions, orienter ou proposer une suite."], ["Moderation", "Eviter les contenus sensibles, injurieux, dangereux, non autorises ou non pertinents."], ["Suivi", "Preparer des indicateurs internes sans publier de donnees personnelles non autorisees."]])),
    section("Conservation et droits", "Un cadre a preciser avec la mise en production", table([["Contact simple", "Conservation limitee au traitement de la demande.", "Suppression ou archivage lorsque le suivi n'est plus necessaire."], ["Dossier en qualification", "Conservation pendant l'instruction.", "Mise a jour ou suppression possible sur demande legitime."], ["Projet conventionne", "Conservation selon les obligations contractuelles.", "Informations publiques limitees a ce qui est autorise."], ["Compte utilisateur futur", "Gestion par Supabase Auth.", "Droits d'acces, rectification et suppression a organiser."]])),
    section("Supabase", "Preparation technique", `<p>La plateforme est preparee pour Supabase afin de gerer l'authentification, les roles, le stockage de photos et les formulaires. Les politiques RLS, les droits administrateurs et les buckets doivent rester verifies avant toute ouverture a grande echelle.</p>`),
    section("Vos droits", "Demander l'acces, la correction ou la suppression", `<p>Une personne peut demander l'acces aux informations la concernant, leur rectification ou leur suppression lorsque le cadre juridique le permet. Les demandes peuvent etre adressees via la page Contact.</p>`)
  ],
  cta: { title: "Une question sur vos donnees ?", text: "Le contact reste le point d'entree le plus simple tant que la plateforme est en structuration.", href: "contact.html", label: "Contacter TVF" }
});

renderPage({
  file: "faq.html",
  title: "FAQ | Territoires Vivants France",
  description: "Questions frequentes sur TVF : signalement, benevolat, materiaux, proprietaires, antennes locales, dons, donnees et projets.",
  status: "FAQ centrale",
  h1: "Questions",
  h1Accent: "frequentes",
  intro: "Une FAQ centrale pour comprendre rapidement le role de TVF, les parcours possibles, les limites du dispositif et les prochaines etapes de la plateforme.",
  image: "assets/photos/institutional-meeting.jpg",
  imageAlt: "Echange de questions et reponses en reunion",
  sections: [
    section("Comprendre TVF", "Les questions essentielles", `<div class="faq-list"><details open><summary>Qui sommes-nous ?</summary><p>TVF est une association nationale en creation, basee a Saint-Etienne, qui veut redonner vie aux logements vacants, commerces fermes, friches, terrains inutilises et materiaux encore utiles.</p></details><details><summary>TVF est-elle deja une grande structure operationnelle ?</summary><p>Non. Le site prepare une plateforme nationale progressive. Les pages distinguent les dispositifs en structuration, les projets pilotes et les resultats qui seront publies uniquement apres validation.</p></details><details><summary>Pourquoi autant de prudence sur les chiffres ?</summary><p>Parce qu'un site institutionnel credible ne doit pas transformer des objectifs en resultats. Les chiffres nationaux cites servent au contexte ; les chiffres TVF viendront de donnees reelles.</p></details></div>`),
    section("Agir", "Signalements, materiaux et benevolat", `<div class="faq-list"><details><summary>Comment signaler un logement vacant ou un commerce ferme ?</summary><p>La page Signalement permet de transmettre le type de lieu, la commune, l'adresse ou un repere, une description, une photo eventuelle et un contact facultatif.</p></details><details><summary>Que se passe-t-il apres un signalement ?</summary><p>Le signalement est qualifie. Il peut etre complete, ajourne, oriente ou rattache a une demarche territoriale. Il n'est pas automatiquement publie.</p></details><details><summary>Puis-je donner des materiaux ?</summary><p>Oui, mais la Banque de Materiaux TVF n'est pas une plateforme de distribution libre. Les ressources sont etudiees puis affectees a des projets valides lorsque c'est pertinent.</p></details><details><summary>Comment devenir benevole ?</summary><p>Un benevole peut aider a documenter, accueillir, organiser, cartographier, animer, participer a des actions encadrees ou soutenir une future antenne locale.</p></details></div>`),
    section("Proprietaires et partenaires", "Cooperation territoriale", `<div class="faq-list"><details><summary>Un proprietaire garde-t-il son bien ?</summary><p>Oui. Dans le programme Bien Solidaire a Usage Partage, le proprietaire conserve la propriete. Une convention peut definir un usage temporaire, un loyer solidaire ou un partage de revenus.</p></details><details><summary>TVF garantit-elle les travaux ou les subventions ?</summary><p>Non. TVF peut rechercher des solutions, mobiliser des acteurs et structurer un dossier, mais ne garantit ni financement, ni travaux, ni delai.</p></details><details><summary>Une collectivite peut-elle cooperer avec TVF ?</summary><p>Oui, par diagnostic territorial, mise a disposition de ressources, signalement de biens, convention de cooperation ou appui a des projets utiles aux habitants.</p></details><details><summary>Une entreprise peut-elle contribuer ?</summary><p>Oui, par dons de materiaux, mecénat, competences, locaux, expertise ou soutien a des projets territoriaux, sous reserve d'une contribution confirmee et publiable.</p></details></div>`),
    section("Confiance", "Donnees, publication et dons", `<div class="faq-list"><details><summary>Les adresses signalees sont-elles publiques ?</summary><p>Non, pas automatiquement. TVF doit verifier, moderer et obtenir les autorisations necessaires avant toute publication sensible.</p></details><details><summary>Comment les dons seront-ils utilises ?</summary><p>Les dons doivent soutenir la structuration de l'association, les outils, les diagnostics, l'accompagnement territorial et les projets valides. Les avantages fiscaux ne sont pas annonces sans cadre officiel.</p></details><details><summary>Comment creer une antenne locale ?</summary><p>Une antenne suppose une candidature, un diagnostic territorial, des referents, une formation, un cadre national et une validation progressive.</p></details><details><summary>Ou trouver les sources ?</summary><p>La page Sources et donnees recense les organismes publics et les regles de lecture utilisees par TVF.</p></details></div>`)
  ],
  cta: { title: "Vous ne trouvez pas votre reponse ?", text: "Le formulaire de contact permet de poser une question ou d'orienter une demande vers le bon parcours.", href: "contact.html", label: "Contacter TVF" }
});

function injectBeforeMainEnd(file, marker, html) {
  let content = read(file);
  if (content.includes(marker)) return;
  content = content.replace(/\s*<\/main>/i, `\n${html}\n    </main>`);
  write(file, content);
}

injectBeforeMainEnd("signalement.html", "cadre-signalement-publication", `        <section class="dossier-section" id="cadre-signalement-publication">
          <span class="dossier-kicker">Cadre de publication</span>
          <h2>Un signalement n'est pas une publication automatique</h2>
          <p>Les informations transmises servent d'abord a qualifier une situation. TVF peut demander des precisions, masquer une adresse, refuser une publication ou orienter vers un service competent lorsque le sujet releve de la securite, de la salubrite ou d'une urgence.</p>
          ${cards([["Informations utiles", "Adresse ou repere, commune, description, photo, date d'observation, type de lieu et contact facultatif."], ["Protection", "Aucune donnee sensible n'est publiee sans verification et sans interet territorial clair."], ["Suite possible", "Classement interne, demande de precision, rattachement a une carte, orientation vers une collectivite ou preparation d'un dossier."]])}
        </section>`);

injectBeforeMainEnd("banque-materiaux.html", "renvoi-garde-fous-materiaux", `        <section class="dossier-section" id="renvoi-garde-fous-materiaux">
          <span class="dossier-kicker">Garde-fous</span>
          <h2>La Banque de Materiaux TVF n'est pas une distribution libre</h2>
          <p>Les ressources proposees sont qualifiees puis affectees a des projets valides par TVF. Cette approche evite les collectes inutiles, les promesses impossibles et les usages incompatibles avec la securite ou l'interet territorial.</p>
          <a class="button secondary" href="ce-que-tvf-ne-fait-pas.html">Voir les limites d'intervention</a>
        </section>`);

injectBeforeMainEnd("faire-un-don.html", "cadre-dons-transparence", `        <section class="dossier-section" id="cadre-dons-transparence">
          <span class="dossier-kicker">Transparence des dons</span>
          <h2>Un don soutient la structuration, pas une promesse non validee</h2>
          <p>Les dons doivent permettre de consolider les outils, les diagnostics, les formulaires, la coordination benevole, la documentation et les premiers dossiers territoriaux. TVF ne doit annoncer aucun avantage fiscal, financeur ou resultat tant que le cadre officiel n'est pas confirme.</p>
          ${cards([["Utilisations possibles", "Outils numeriques, cartographie, documentation, qualification des demandes, animation territoriale et preparation des projets."], ["Publication", "Les montants, affectations et resultats seront publies lorsqu'ils seront verifies et compatibles avec les obligations de transparence."], ["Prudence", "Aucune collecte ne doit etre presentee comme finançant un projet deja realise si celui-ci n'est pas documente."]])}
        </section>`);

injectBeforeMainEnd("projets-pilotes.html", "territoires-futurs-cadres", `        <section class="dossier-section" id="territoires-futurs-cadres">
          <span class="dossier-kicker">Territoires futurs</span>
          <h2>Saint-Etienne pilote, Outre-mer et nouveaux territoires a documenter</h2>
          <p>Saint-Etienne reste le territoire pilote officiel de TVF. Martinique, Guadeloupe, Guyane, Reunion, Mayotte et d'autres territoires pourront etre etudies progressivement, sans annoncer d'antenne ouverte, de partenaire ou de projet realise tant que les conditions ne sont pas confirmees.</p>
          ${table([["Saint-Etienne", "Territoire pilote de lancement.", "Dossier territorial a enrichir par donnees locales."], ["Martinique", "Developpement futur envisage.", "Aucune antenne annoncee sans validation."], ["Guadeloupe", "Developpement futur envisage.", "Diagnostic et referents a confirmer."], ["Reunion", "Developpement futur envisage.", "Besoins et acteurs a documenter."], ["Guyane / Mayotte", "Territoires a analyser.", "Aucun engagement public sans cadre."]])}
        </section>`);

injectBeforeMainEnd("mentions-legales.html", "renvoi-confidentialite-complete", `        <section class="dossier-section" id="renvoi-confidentialite-complete">
          <span class="dossier-kicker">Donnees personnelles</span>
          <h2>Une politique de confidentialite dediee</h2>
          <p>Les mentions legales conservent les informations d'identification du site. La politique de confidentialite detaille les donnees collectees, les finalites, la conservation, les droits des personnes et la preparation Supabase.</p>
          <a class="button secondary" href="politique-confidentialite.html">Lire la politique de confidentialite</a>
        </section>`);

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  let html = read(file);
  html = html.replace(/href="mentions-legales\.html#donnees-personnelles"/g, 'href="politique-confidentialite.html"');
  write(file, html);
}

for (const file of [
  "proprietaires.html",
  "parcours-demande.html",
  "sources-donnees.html",
  "ce-que-tvf-ne-fait-pas.html",
  "politique-confidentialite.html",
  "faq.html",
  "signalement.html",
  "banque-materiaux.html",
  "faire-un-don.html",
  "projets-pilotes.html",
  "mentions-legales.html"
]) {
  write(file, polishMainText(read(file)));
}

console.log(JSON.stringify({ completed: true, created: ["proprietaires.html", "parcours-demande.html", "sources-donnees.html", "ce-que-tvf-ne-fait-pas.html", "politique-confidentialite.html", "faq.html"] }, null, 2));
