const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();

const sourceNote =
  'Sources publiques de contexte : <a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener">Zero Logement Vacant</a> pour la vacance residentielle et l\'outillage des collectivites ; <a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener">Cartofriches - Cerema</a> pour le reperage et le recyclage des friches. Ces reperes ne sont pas des resultats de Territoires Vivants France.';

const commonEvidence = `
  <div class="evidence-grid" aria-label="Reperes publics nationaux">
    <article class="evidence-card"><strong>+1 million</strong><span>Logements vacants depuis plus de deux ans recenses en 2020</span><p>Un ordre de grandeur national qui justifie une methode de reperage, de qualification et d'accompagnement local.</p></article>
    <article class="evidence-card"><strong>+1000</strong><span>Collectivites mobilisees sur Zero Logement Vacant</span><p>Le sujet est deja porte par de nombreux territoires, avec un besoin d'outils simples et de cooperation de proximite.</p></article>
    <article class="evidence-card"><strong>1 382</strong><span>Projets soutenus par le Fonds friches</span><p>Le recyclage foncier est un levier national de revitalisation, souvent porte par des collectivites et acteurs publics.</p></article>
    <article class="evidence-card"><strong>3 375 ha</strong><span>de friches dont le recyclage etait vise par les projets soutenus</span><p>Ce repere illustre l'echelle des espaces a transformer sans artificialiser davantage les sols.</p></article>
  </div>`;

const themeCopy = {
  logement: {
    kicker: "Habitat vacant",
    title: "Faire du logement vacant une ressource utile, pas un angle mort",
    intro:
      "La page gagne en credibilite lorsqu'elle distingue clairement le reperage, la qualification juridique, le dialogue avec les proprietaires et les usages possibles. TVF peut ainsi parler aux communes, aux habitants et aux proprietaires sans annoncer de resultat non verifie.",
    cases: [
      ["Logement vacant en centre-bourg", "Identifier le bien, comprendre les causes de vacance, orienter le proprietaire vers une solution de renovation ou de convention d'usage."],
      ["Immeuble degrade a qualifier", "Croiser etat apparent, statut d'occupation, risques techniques et acteurs competents avant toute communication publique."],
      ["Habitat solidaire temporaire", "Etudier une occupation encadree pour repondre a un besoin local, seulement apres accord du proprietaire et securisation du cadre."],
    ],
    listening: ["Proprietaires confrontes au cout des travaux", "Collectivites cherchant une methode de reperage", "Habitants concernes par la vacance de rue ou d'immeuble"],
    cta: ["Signaler ou proposer un bien", "Un bien ne doit etre publie qu'apres validation de son statut, de sa source et des conditions de diffusion.", "proposer-un-bien.html"],
  },
  commerce: {
    kicker: "Commerce de proximite",
    title: "Redonner une fonction locale aux vitrines fermees",
    intro:
      "La vacance commerciale se traite par diagnostic fin : emplacement, flux, loyers, etat du local, besoins des habitants et capacite des porteurs de projets. La page doit montrer cette methode avant de promettre une reouverture.",
    cases: [
      ["Ancienne boutique de centre-ville", "Qualifier le bail, l'etat du local et les usages possibles : commerce de proximite, atelier, boutique ephemere ou service associatif."],
      ["Local en pied d'immeuble", "Travailler avec proprietaires, collectivite et habitants pour eviter les vitrines durablement fermees."],
      ["Tiers-lieu de quartier", "Tester un usage mixte, sobre et progressif lorsque le local n'est pas immediatement compatible avec une activite commerciale classique."],
    ],
    listening: ["Commercants et artisans locaux", "Proprietaires de cellules commerciales", "Communes confrontees a des rues moins actives"],
    cta: ["Proposer un commerce vacant", "Les informations transmises doivent permettre une premiere qualification sans exposer publiquement d'adresse sensible.", "signalement.html"],
  },
  materials: {
    kicker: "Reemploi",
    title: "Transformer les materiaux disponibles en ressources locales",
    intro:
      "Le reemploi exige une chaine claire : reperage, depose, tri, stockage, tracabilite, disponibilite et usage final. Le contenu doit rassurer les entreprises comme les collectivites sur la methode et les limites techniques.",
    cases: [
      ["Menuiseries recuperables", "Portes, fenetres, volets ou escaliers peuvent etre proposes si leur etat, leurs dimensions et leur localisation sont documentes."],
      ["Sanitaires et equipements", "Lavabos, WC, douches ou luminaires doivent etre qualifies avant toute reutilisation, avec photo et conditions de retrait."],
      ["Stock solidaire local", "Une materiaux peut aider les projets associatifs ou chantiers sobres lorsque la disponibilite est confirmee."],
    ],
    listening: ["Entreprises disposant de surplus", "Artisans habitues aux contraintes de chantier", "Associations recherchant des materiaux sobres"],
    cta: ["Proposer des materiaux", "Chaque proposition doit preciser categorie, quantite, etat, localisation et disponibilite reelle.", "proposer-materiaux.html"],
  },
  friche: {
    kicker: "Friches et espaces",
    title: "Passer du terrain delaisse au lieu utile et durable",
    intro:
      "Une friche ou un terrain abandonne demande une approche prudente : propriete, pollution eventuelle, usages anterieurs, securite, biodiversite, acces et attentes locales. La credibilite vient de cette methode progressive.",
    cases: [
      ["Friche de proximite", "Reperer l'espace, qualifier les contraintes et imaginer un usage transitoire avant un projet definitif."],
      ["Jardin ou verger citoyen", "Transformer un terrain disponible en support de lien social, d'apprentissage et de vegetalisation."],
      ["Espace culturel ou pedagogique", "Preparer un usage leger, securise et reversible lorsque le site ne peut pas etre renove immediatement."],
    ],
    listening: ["Habitants voisins des espaces delaisses", "Collectivites proprietaires ou gestionnaires", "Associations souhaitant animer un lieu utile"],
    cta: ["Signaler un espace abandonne", "La carte doit rester un outil de qualification, pas un inventaire public non verifie.", "signalement.html"],
  },
  insertion: {
    kicker: "Insertion",
    title: "Faire des projets locaux des supports d'engagement et d'emploi",
    intro:
      "L'insertion se construit avec des parcours realistes : accueil, formation, encadrement, chantiers adaptes, progression et relais vers l'emploi. Le contenu renforce la credibilite en montrant les conditions d'un accompagnement serieux.",
    cases: [
      ["Chantier participatif encadre", "Mobiliser benevoles et publics accompagnes sur des taches compatibles avec la securite et les competences disponibles."],
      ["Atelier de valorisation", "Apprendre a trier, nettoyer, inventorier et preparer des materiaux pour un nouvel usage."],
      ["Decouverte des metiers", "Relier renovation, reemploi, mediation et animation territoriale a des parcours professionnels possibles."],
    ],
    listening: ["Benevoles souhaitant agir concretement", "Personnes en recherche de parcours utile", "Structures sociales et acteurs de l'emploi"],
    cta: ["Devenir benevole", "Les missions seront ouvertes progressivement selon les besoins reels et l'encadrement disponible.", "agir-avec-nous.html#benevole"],
  },
  observatory: {
    kicker: "Donnees territoriales",
    title: "Observer avant d'agir, publier seulement ce qui est verifie",
    intro:
      "L'observatoire doit inspirer confiance : sources identifiees, statut de validation, donnees sensibles protegees, filtres utiles et indicateurs dates. Les cartes prevues servent d'aide a la decision, pas de vitrine de chiffres inventes.",
    cases: [
      ["Signalement citoyen qualifie", "Recevoir une information, verifier son origine, completer le contexte et decider si elle peut etre cartographiee."],
      ["Diagnostic communal", "Regrouper logements, commerces, friches et materiaux pour aider une commune a prioriser ses actions."],
      ["Carte multi-territoires", "Preparer des couches distinctes pour Metropole, Martinique, Guadeloupe, Guyane, Reunion et Mayotte."],
    ],
    listening: ["Referents locaux qui verifient les donnees", "Collectivites qui demandent un diagnostic", "Citoyens qui signalent sans exposer publiquement un bien"],
    cta: ["Consulter la carte", "Les donnees affichees doivent rester moderees, datees et rattachees a une source claire.", "carte-territoires.html"],
  },
  funding: {
    kicker: "Financement solidaire",
    title: "Financer sans promettre ce qui n'est pas encore engage",
    intro:
      "La credibilite financiere repose sur la transparence : budget previsionnel, etat d'avancement, gouvernance, affectation des fonds, conventions et mesure d'impact. Les mecenes et investisseurs doivent voir une methode avant des promesses.",
    cases: [
      ["Projet a instruire", "Decrire le besoin, le bien concerne, les risques, les etapes et le budget avant toute collecte."],
      ["Mecenat de competences", "Mobiliser expertise juridique, batiment, energie, urbanisme ou communication sans annoncer de partenaire acquis."],
      ["Contribution flechee", "Prevoir un suivi clair des dons ou apports : destination, statut, justificatifs et bilan publie."],
    ],
    listening: ["Mecenes recherchant un cadre transparent", "Entreprises souhaitant contribuer utilement", "Citoyens voulant financer un projet local verifiable"],
    cta: ["Decouvrir le fonds solidaire", "Les projets a financer doivent rester vides ou en instruction tant qu'aucun dossier n'est valide.", "fonds-investissement-solidaire.html"],
  },
  partnership: {
    kicker: "Cooperation",
    title: "Construire des partenariats utiles sans afficher de faux partenaires",
    intro:
      "Une page partenaire credible explique les modalites de cooperation, les responsabilites, les apports possibles et les etapes de validation. Elle doit eviter tout logo ou reference tant qu'un accord n'est pas signe.",
    cases: [
      ["Collectivite", "Demande de diagnostic, cartographie, animation locale ou projet pilote avec cadre de cooperation a definir."],
      ["Entreprise", "Don de materiaux, mecenat de competences, locaux disponibles ou soutien financier encadre."],
      ["Association ou ecole", "Mobilisation citoyenne, ateliers, pedagogie, chantiers ou documentation locale."],
    ],
    listening: ["Collectivites en phase de diagnostic", "Entreprises avec ressources disponibles", "Associations et etablissements souhaitant contribuer"],
    cta: ["Devenir partenaire", "Une cooperation doit etre qualifiee, documentee et validee avant toute publication publique.", "espace-partenaires.html"],
  },
  engagement: {
    kicker: "Participation citoyenne",
    title: "Rendre l'engagement simple, clair et responsable",
    intro:
      "Les visiteurs doivent comprendre immediatement comment aider : signaler, donner des materiaux, rejoindre une mission, proposer un bien, soutenir financierement ou creer une antenne. Chaque formulaire doit cadrer les informations utiles.",
    cases: [
      ["Signalement utile", "Adresse, commune, description, photo eventuelle et contact facultatif pour permettre une verification."],
      ["Mission benevole", "Accueil, cartographie, collecte, chantier, documentation ou animation selon le territoire."],
      ["Antenne locale", "Candidature, etude du territoire, referents, convention et lancement progressif."],
    ],
    listening: ["Habitants qui connaissent leur quartier", "Benevoles prets a documenter et agir", "Proprietaires ou entreprises disposant de ressources"],
    cta: ["Agir maintenant", "Chaque contribution doit etre qualifiee avant integration dans les outils publics.", "agir-avec-nous.html"],
  },
  platform: {
    kicker: "Plateforme operationnelle",
    title: "Preparer une plateforme fiable avant l'ouverture large",
    intro:
      "Les pages techniques deviennent credibles lorsqu'elles expliquent la securite, la validation, les roles, les etats vides, les API et la moderation. L'objectif est une beta utilisable sans exposer de donnees non verifiees.",
    cases: [
      ["Compte utilisateur", "Inscription, connexion, profil et role doivent etre testes avec Supabase Auth et RLS."],
      ["Formulaire connecte", "Chaque depot doit creer un enregistrement, rattacher les photos au bon bucket et conserver un statut de validation."],
      ["Administration", "Les administrateurs valident, corrigent, publient ou archivent les signalements, materiaux et projets."],
    ],
    listening: ["Utilisateurs testeurs", "Administrateurs et referents locaux", "Developpeurs charges de l'API mobile future"],
    cta: ["Voir la plateforme beta", "La production doit conserver des etats vides lorsque la base ne contient pas encore de donnees validees.", "plateforme-beta.html"],
  },
  resources: {
    kicker: "Ressources",
    title: "Publier moins, mais publier mieux",
    intro:
      "Les publications, guides et ressources doivent etre dates, sources, versionnes et faciles a mettre a jour. Pour une association en creation, la credibilite vient autant de la prudence que de l'ambition nationale.",
    cases: [
      ["Guide pratique", "Document court avec objectif, public vise, methode, limites et date de mise a jour."],
      ["Retour d'experience", "Publication uniquement apres projet reel, accord des personnes concernees et validation des informations."],
      ["Dossier presse", "Presentation officielle, logo, contacts medias et elements de langage sans chiffres non verifies."],
    ],
    listening: ["Lecteurs institutionnels", "Benevoles et referents locaux", "Journalistes ou partenaires cherchant une information fiable"],
    cta: ["Consulter les ressources", "Chaque document doit etre publie avec un statut clair : brouillon, valide, archive ou mis a jour.", "centre-ressources.html"],
  },
  institution: {
    kicker: "Association nationale",
    title: "Assumer le stade de creation tout en montrant une methode nationale",
    intro:
      "Le site doit presenter TVF comme une structure en construction serieuse : gouvernance, transparence, statuts, adresse, roles, methode, protection des donnees et calendrier progressif.",
    cases: [
      ["Gouvernance", "Clarifier les responsabilites, circuits de validation, regles de publication et decisions importantes."],
      ["Transparence", "Prevoir rapports, comptes, statuts, charte ethique et mises a jour apres declaration officielle."],
      ["Deploiement national", "Decrire l'ambition sans afficher de reseau actif tant que les antennes ne sont pas constituees."],
    ],
    listening: ["Collectivites qui evaluent la solidite du projet", "Mecenes attentifs a la gouvernance", "Habitants souhaitant comprendre qui porte l'association"],
    cta: ["Comprendre l'association", "Les informations institutionnelles doivent rester faciles a modifier apres les formalites officielles.", "qui-sommes-nous.html"],
  },
  legal: {
    kicker: "Cadre officiel",
    title: "Preparer des pages juridiques faciles a tenir a jour",
    intro:
      "Les pages juridiques n'ont pas vocation a convaincre par des chiffres. Elles doivent etre exactes, sobres, modifiables et compatibles avec l'evolution officielle de l'association.",
    cases: [
      ["Identite editoriale", "President fondateur, adresse, responsable de publication et mentions a completer apres declaration officielle."],
      ["Protection des donnees", "Informer clairement sur les formulaires, les finalites, les droits des personnes et les durees de conservation."],
      ["Documents officiels", "Publier statuts, charte, rapports et comptes uniquement lorsqu'ils sont valides."],
    ],
    listening: ["Usagers demandant leurs droits sur les donnees", "Partenaires souhaitant verifier le cadre", "Administrateurs charges de mettre a jour les informations"],
    cta: ["Contacter l'association", "Toute modification officielle devra etre reportee sur les mentions, statuts et pages de transparence.", "contact.html"],
  },
  home: {
    kicker: "Lecture nationale",
    title: "Une ambition nationale, presentee sans faux resultats",
    intro:
      "La page d'accueil doit donner confiance en quelques secondes : probleme public reel, methode claire, association en creation, appels a contribution, sources nationales et absence de chiffres d'impact inventes.",
    cases: [
      ["Identifier les ressources inexploitees", "Logements, commerces, friches, batiments et materiaux doivent etre reperes puis qualifies avant publication."],
      ["Mobiliser autour d'un territoire", "Collectivites, proprietaires, habitants, entreprises et associations peuvent agir avec des roles complementaires."],
      ["Mesurer progressivement", "Les indicateurs d'impact ne seront affiches qu'apres validation des donnees issues du terrain."],
    ],
    listening: ["Citoyens souhaitant signaler", "Collectivites en recherche d'outils", "Mecenes et entreprises cherchant un cadre fiable"],
    cta: ["Agir avec nous", "Le site assume une phase de structuration et prepare une montee en charge nationale.", "agir-avec-nous.html"],
  },
};

function cleanTitle(html, file) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || file.replace(/\.html$/, "");
  return h1
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function classify(file) {
  if (file === "index.html") return "home";
  if (/mentions-legales|statuts/.test(file)) return "legal";
  if (/qui-sommes-nous|gouvernance|transparence|association-nationale|nos-poles|pole-/.test(file)) return "institution";
  if (/logement|habitat|proprietaire|bien-solidaire|proposer-un-bien|carte-biens|projets-realises|nos-actions|notre-methode|vision|projets-pilotes|action-/.test(file)) return "logement";
  if (/commerce/.test(file)) return "commerce";
  if (/materia|banque-materiaux|materiaux/.test(file)) return "materials";
  if (/friches|espaces-abandonnes/.test(file)) return "friche";
  if (/solidarite|insertion|benevoles|recrutement/.test(file)) return "insertion";
  if (/observatoire|carte-territoires|carte-interactive|carte-connectee|tableau|impact|mesure|statistiques/.test(file)) return "observatory";
  if (/financer|fonds|investisseur|mecene|projets-a-financer/.test(file)) return "funding";
  if (/partenariat|partenaires|collectivites|entreprises|bailleurs|fondations|universites|ecoles/.test(file)) return "partnership";
  if (/agir|contact|faire-un-don|signalement|antenne|adherents|faq/.test(file)) return "engagement";
  if (/plateforme|authentification|comptes|formulaires|espace-projet|supabase|api|admin|beta|mobile|architecture|temps-reel|reels|centre-documentaire/.test(file)) return "platform";
  if (/ressources|publications|presse|centre-ressources/.test(file)) return "resources";
  return "institution";
}

function pageSpecificTheme(file) {
  if (/action-commerces|pole-commerce/.test(file)) return "commerce";
  if (/action-materiaux|materiautheque|banque-materiaux|proposer-materiaux|materiaux-reels/.test(file)) return "materials";
  if (/action-espaces|friches/.test(file)) return "friche";
  if (/solidarite|insertion|benevoles|recrutement/.test(file)) return "insertion";
  if (/observatoire|carte|tableau|impact|mesure|statistiques/.test(file)) return "observatory";
  if (/financer|fonds|investisseur|mecene|projets-a-financer/.test(file)) return "funding";
  if (/partenariat|partenaires|collectivites|entreprises|bailleurs|fondations|universites|ecoles/.test(file)) return "partnership";
  if (/plateforme|authentification|comptes|formulaires|espace-projet|supabase|api|admin|beta|mobile|architecture|temps-reel|reels|centre-documentaire/.test(file)) return "platform";
  if (/ressources|publications|presse|centre-ressources/.test(file)) return "resources";
  if (/mentions-legales|statuts/.test(file)) return "legal";
  if (file === "index.html") return "home";
  return classify(file);
}

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;");
}

function slugFor(file) {
  return file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-");
}

function sectionFor(file, html) {
  const key = pageSpecificTheme(file);
  const data = themeCopy[key] || themeCopy.institution;
  const title = cleanTitle(html, file);
  const evidence =
    key === "legal" || key === "platform" || key === "resources" || key === "institution"
      ? '<div class="evidence-grid" aria-label="Garanties editoriales"><article class="evidence-card"><strong>0</strong><span>Chiffre d\'impact fictif</span><p>Les resultats TVF restent absents tant qu\'ils ne sont pas produits, valides et dates.</p></article><article class="evidence-card"><strong>4</strong><span>Preuves a documenter</span><p>Source, date, responsable, statut de validation : chaque donnee publique doit garder sa tracabilite.</p></article><article class="evidence-card"><strong>1</strong><span>Parcours de mise a jour</span><p>Les contenus officiels doivent pouvoir evoluer apres declaration, convention ou validation interne.</p></article><article class="evidence-card"><strong>RGPD</strong><span>Donnees personnelles protegees</span><p>Les formulaires doivent limiter les informations collectees et expliquer les finalites.</p></article></div>'
      : commonEvidence;
  const cases = data.cases.map(([heading, text]) => `<article class="case-card"><h3>${heading}</h3><p>${text}</p></article>`).join("");
  const listeningItems = data.listening.map((item) => `<li>${item}</li>`).join("");
  const source =
    key === "legal" || key === "platform" || key === "resources" || key === "institution"
      ? "Ce bloc sert d'audit editorial interne : il precise les garanties a maintenir avant publication de documents officiels, de donnees utilisateurs ou de resultats d'impact."
      : sourceNote;

  return `

        <section class="evidence-section" data-professional-enrichment="${escapeAttr(key)}" aria-labelledby="professional-${slugFor(file)}">
          <span class="evidence-kicker">${data.kicker}</span>
          <h2 id="professional-${slugFor(file)}">${data.title}</h2>
          <p>${data.intro}</p>
          ${evidence}
          <p class="source-note">${source}</p>
        </section>

        <h2 class="section-heading">Cas d'usage a documenter</h2>
        <section class="case-study-grid" aria-label="Cas d'usage pour ${escapeAttr(title)}">
          ${cases}
        </section>

        <h2 class="section-heading">Retours terrain a recueillir</h2>
        <section class="listening-grid" aria-label="Temoignages a recueillir pour ${escapeAttr(title)}">
          <article class="listening-card"><h3>Temoignages utiles</h3><p>Les temoignages ne doivent pas etre inventes. Ils seront publies uniquement apres accord explicite et verification du contexte.</p></article>
          <article class="listening-card"><h3>Voix a ecouter</h3><ul>${listeningItems}</ul></article>
          <article class="listening-card"><h3>Preuves attendues</h3><ul><li>date et territoire</li><li>autorisation de publication</li><li>lien avec une action verifiable</li></ul></article>
        </section>

        <div class="impact-empty" role="note">
          <strong>Indicateurs d'impact</strong>
          <p>Les chiffres propres a Territoires Vivants France doivent rester a zero ou en attente tant que les signalements, projets, materiaux, benevoles et territoires ne sont pas enregistres puis valides dans Supabase. Cette page est prete a accueillir des indicateurs reels, dates et verifiables.</p>
        </div>

        <section class="cta-band" aria-label="Appel a l'action ${escapeAttr(title)}">
          <div><h2>${data.cta[0]}</h2><p>${data.cta[1]}</p></div>
          <a class="button" href="${data.cta[2]}">Continuer</a>
        </section>`;
}

let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("data-professional-enrichment=")) continue;
  const section = sectionFor(file, html);
  let next;

  if (file === "index.html") {
    next = html.replace(/\s*<section class="news-section"/i, `${section}\n\n      <section class="news-section"`);
  } else {
    next = html.replace(/\s*<\/div>\s*<\/main>/i, `${section}\n      </div>\n    </main>`);
  }

  if (next === html) {
    console.warn("No insertion point for", file);
    continue;
  }

  fs.writeFileSync(file, next, "utf8");
  changed += 1;
}

console.log(`Enriched ${changed} pages`);
