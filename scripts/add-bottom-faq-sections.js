const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const architecture = fs.readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8");
const publicPages = [...architecture.matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]);

const commonQuestions = [
  [
    "TVF affiche-t-elle uniquement des informations v&eacute;rifi&eacute;es ?",
    "Oui. Les projets, partenaires, financements et r&eacute;sultats sont publi&eacute;s seulement lorsqu'ils peuvent &ecirc;tre document&eacute;s. Les &eacute;l&eacute;ments en pr&eacute;paration sont clairement pr&eacute;sent&eacute;s comme tels.",
  ],
  [
    "Comment participer sans engager tout de suite un projet ?",
    "Il est possible de prendre contact, signaler une situation, proposer une ressource ou demander un premier &eacute;change. TVF qualifie ensuite la demande avant toute publication ou action.",
  ],
  [
    "O&ugrave; trouver les informations institutionnelles ?",
    "Les statuts, la gouvernance, les mentions l&eacute;gales, la politique de confidentialit&eacute; et les documents officiels sont regroup&eacute;s dans les pages de transparence du site.",
  ],
];

const faqByPage = {
  "index.html": [
    ["Que fait concr&egrave;tement Territoires Vivants France ?", "TVF rep&egrave;re des biens, espaces et ressources inutilis&eacute;s, qualifie leur potentiel, mobilise les acteurs concern&eacute;s et pr&eacute;pare des projets utiles aux habitants dans un cadre v&eacute;rifiable."],
    ["L'association est-elle d&eacute;j&agrave; en activit&eacute; partout en France ?", "Non. TVF se structure progressivement depuis Saint-&Eacute;tienne. Le site pr&eacute;sente l'ambition nationale et les outils pr&eacute;par&eacute;s, sans annoncer de r&eacute;seau actif non constitu&eacute;."],
    ["Comment proposer un lieu ou des mat&eacute;riaux ?", "Les pages de signalement, de proposition de mat&eacute;riaux et de contact permettent de transmettre les premi&egrave;res informations. Chaque proposition doit ensuite &ecirc;tre qualifi&eacute;e."],
  ],
  "qui-sommes-nous.html": [
    ["TVF est-elle une association en cr&eacute;ation ?", "Oui. Les contenus sont structur&eacute;s pour &ecirc;tre facilement mis &agrave; jour apr&egrave;s les formalit&eacute;s officielles, les validations internes et les premi&egrave;res conventions."],
    ["Qui porte la gouvernance actuelle ?", "La page pr&eacute;sente le pr&eacute;sident fondateur Edryan Rangoly ainsi que M. Jordan Lambeau, secr&eacute;taire et tr&eacute;sorier, avec un cadre institutionnel appel&eacute; &agrave; &eacute;voluer."],
    ["Pourquoi parler d'une ambition nationale ?", "Parce que les sujets trait&eacute;s par TVF existent dans de nombreux territoires : vacance, friches, mat&eacute;riaux inutilis&eacute;s, besoin d'ing&eacute;nierie locale et mobilisation citoyenne."],
  ],
  "nos-actions.html": [
    ["Une action TVF correspond-elle toujours &agrave; un chantier ?", "Non. Une action peut commencer par un rep&eacute;rage, un diagnostic, une mise en relation, une convention ou une orientation vers le bon dispositif avant toute intervention physique."],
    ["Les exemples de situations sont-ils des projets r&eacute;alis&eacute;s ?", "Non lorsqu'ils sont pr&eacute;sent&eacute;s comme sc&eacute;narios p&eacute;dagogiques. Les r&eacute;alisations ne seront publi&eacute;es qu'apr&egrave;s validation et documentation."],
    ["Comment choisir la bonne action ?", "Le choix d&eacute;pend du sujet principal : logement, commerce, friche, mat&eacute;riaux, insertion, antenne locale ou financement. TVF peut orienter vers le parcours adapt&eacute;."],
  ],
  "nos-poles.html": [
    ["Pourquoi TVF organise-t-elle son action en p&ocirc;les ?", "Les p&ocirc;les permettent de traiter chaque sujet avec une m&eacute;thode claire : habitat, mat&eacute;riaux, commerces, friches, insertion et observation territoriale."],
    ["Les p&ocirc;les fonctionnent-ils s&eacute;par&eacute;ment ?", "Non. Un m&ecirc;me projet peut mobiliser plusieurs p&ocirc;les, par exemple un logement vacant avec des mat&eacute;riaux de r&eacute;emploi et un chantier participatif."],
    ["Peut-on rejoindre un p&ocirc;le en particulier ?", "Oui, selon les comp&eacute;tences et disponibilit&eacute;s : rep&eacute;rage, chantier, logistique, documentation, animation locale, m&eacute;diation ou appui technique."],
  ],
  "banque-materiaux.html": [
    ["La Banque de Mat&eacute;riaux TVF distribue-t-elle gratuitement les mat&eacute;riaux ?", "Non. Les ressources sont qualifi&eacute;es, trac&eacute;es et affect&eacute;es &agrave; des projets valid&eacute;s. TVF n'est ni une d&eacute;chetterie, ni une plateforme de dons libres."],
    ["Qui peut proposer des mat&eacute;riaux ?", "Collectivit&eacute;s, entreprises, associations et particuliers peuvent proposer des ressources r&eacute;utilisables, sous r&eacute;serve d'acceptation, de s&eacute;curit&eacute;, de logistique et de pertinence."],
    ["Comment les mat&eacute;riaux sont-ils orient&eacute;s ?", "Ils sont affect&eacute;s selon l'&eacute;tat, la quantit&eacute;, le lieu, les contraintes de stockage et les besoins d'un projet territorial valid&eacute;."],
  ],
  "bien-solidaire-usage-partage.html": [
    ["Le propri&eacute;taire conserve-t-il son bien ?", "Oui. Le principe repose sur la conservation de la propri&eacute;t&eacute; et sur une convention d'usage temporaire, proportionn&eacute;e au projet et aux investissements mobilis&eacute;s."],
    ["La dur&eacute;e de convention est-elle automatique ?", "Non. Des dur&eacute;es comme 5, 10 ou 15 ans peuvent &ecirc;tre &eacute;tudi&eacute;es, mais elles d&eacute;pendent du bien, du budget, du cadre juridique et de l'usage pr&eacute;vu."],
    ["Quels biens peuvent &ecirc;tre propos&eacute;s ?", "Logements vacants, immeubles d&eacute;grad&eacute;s, commerces ferm&eacute;s, b&acirc;timents inutilis&eacute;s ou terrains abandonn&eacute;s peuvent &ecirc;tre &eacute;tudi&eacute;s."],
  ],
  "financer-projets.html": [
    ["TVF annonce-t-elle des financements d&eacute;j&agrave; obtenus ?", "Non. Les financements sont pr&eacute;sent&eacute;s comme des pistes mobilisables ou des cadres &agrave; construire, sauf lorsqu'un soutien est officiellement confirm&eacute;."],
    ["Qui peut financer un projet ?", "Citoyens, entreprises, fondations, m&eacute;c&egrave;nes, investisseurs &agrave; impact et acteurs publics peuvent &ecirc;tre mobilis&eacute;s selon la nature du projet."],
    ["Comment l'impact financier sera-t-il suivi ?", "Chaque contribution devra &ecirc;tre rattach&eacute;e &agrave; un projet, un usage, un calendrier, un budget pr&eacute;visionnel et des indicateurs de suivi."],
  ],
  "carte-territoires.html": [
    ["La carte affiche-t-elle des donn&eacute;es r&eacute;elles ?", "La carte est pr&eacute;par&eacute;e pour afficher des donn&eacute;es qualifi&eacute;es. Les points non valid&eacute;s ne doivent pas &ecirc;tre pr&eacute;sent&eacute;s comme des projets actifs."],
    ["Pourquoi pr&eacute;voir une carte nationale ?", "Elle permettra de visualiser les signalements, ressources, territoires pilotes, antennes et projets lorsque les donn&eacute;es seront connect&eacute;es et valid&eacute;es."],
    ["Les adresses sensibles seront-elles publiques ?", "Non. Les informations pouvant identifier un bien ou une personne devront &ecirc;tre prot&eacute;g&eacute;es et publi&eacute;es uniquement dans un cadre autoris&eacute;."],
  ],
  "tvf-enjeux-saint-etienne.html": [
    ["Pourquoi Saint-&Eacute;tienne est-elle le premier territoire pilote ?", "Parce que le si&egrave;ge national y est situ&eacute; et que le territoire concentre plusieurs enjeux compatibles avec la m&eacute;thode TVF : habitat ancien, vacance, friches, r&eacute;emploi et revitalisation."],
    ["TVF remplace-t-elle les politiques publiques locales ?", "Non. TVF peut aider &agrave; rendre ces politiques plus op&eacute;rationnelles en reliant propri&eacute;taires, collectivit&eacute;s, entreprises, associations et citoyens."],
    ["Les montants financiers pr&eacute;sent&eacute;s sont-ils garantis ?", "Non. Les montants doivent &ecirc;tre compris comme des dispositifs ou ordres de grandeur mobilisables, sous conditions d'&eacute;ligibilit&eacute; et de validation."],
  ],
  "fiches-projets-territorialisees.html": [
    ["Pourquoi utiliser des fiches projet territorialis&eacute;es ?", "Elles transforment un besoin local en dossier concret : bien identifi&eacute;, besoin public, dispositif compatible, acteurs, convention, budget et indicateurs."],
    ["Une fiche projet vaut-elle validation ?", "Non. Elle sert &agrave; instruire et comparer les options. La validation d&eacute;pend ensuite des propri&eacute;taires, collectivit&eacute;s, financeurs et conditions techniques."],
    ["Quels points doivent &ecirc;tre verrouill&eacute;s ?", "Propri&eacute;t&eacute;, assurance, usage, budget, responsabilit&eacute;s, autorisations, calendrier, communication et suivi d'impact."],
  ],
  "contact.html": [
    ["Quel est le meilleur moyen de contacter TVF ?", "Le formulaire de contact permet de qualifier la demande : information g&eacute;n&eacute;rale, proposition de bien, mat&eacute;riaux, partenariat, b&eacute;n&eacute;volat ou collectivit&eacute;."],
    ["Faut-il envoyer des informations sensibles ?", "Non. Il vaut mieux transmettre une description synth&eacute;tique. Les informations d&eacute;taill&eacute;es seront demand&eacute;es uniquement si elles sont n&eacute;cessaires."],
    ["Une r&eacute;ponse engage-t-elle automatiquement TVF ?", "Non. Toute demande doit &ecirc;tre &eacute;tudi&eacute;e avant qu'un engagement, une convention ou une publication ne soit envisag&eacute;."],
  ],
};

const patternRules = [
  [/^action-logements|pole-habitat|proprietaires|parcours-demande/, [
    ["Un propri&eacute;taire peut-il proposer un bien vacant ?", "Oui. La proposition ouvre une phase de qualification : statut, &eacute;tat, usage possible, besoins, risques, budget et conditions de convention."],
    ["TVF peut-elle financer directement les travaux ?", "TVF peut rechercher des financements, mat&eacute;riaux et partenaires, mais aucun financement n'est automatique ni garanti."],
    ["Le logement est-il publi&eacute; imm&eacute;diatement ?", "Non. Les informations sont prot&eacute;g&eacute;es et ne peuvent &ecirc;tre diffus&eacute;es qu'apr&egrave;s validation du cadre juridique et des accords n&eacute;cessaires."],
  ]],
  [/^action-commerces|pole-commerce/, [
    ["Comment TVF aborde-t-elle un commerce ferm&eacute; ?", "TVF commence par qualifier le local, son environnement, les contraintes, le propri&eacute;taire, les usages possibles et les acteurs &agrave; mobiliser."],
    ["Un commerce vacant peut-il devenir autre chose qu'une boutique ?", "Oui. Selon le lieu, il peut accueillir un atelier, un service de proximit&eacute;, une association, une boutique test, un tiers-lieu ou une formation."],
    ["La r&eacute;activation commerciale est-elle garantie ?", "Non. Elle d&eacute;pend du march&eacute; local, du loyer, des travaux, du porteur d'activit&eacute;, des autorisations et de la coop&eacute;ration territoriale."],
  ]],
  [/^action-materiaux|pole-materiautheque|ressources/, faqByPage["banque-materiaux.html"]],
  [/^action-espaces|pole-friches/, [
    ["Que peut devenir un espace abandonn&eacute; ?", "Selon le site, les usages peuvent &ecirc;tre &eacute;cologiques, sociaux, culturels, agricoles, associatifs ou temporaires."],
    ["Une friche peut-elle &ecirc;tre ouverte au public rapidement ?", "Pas sans diagnostic. Il faut v&eacute;rifier la propri&eacute;t&eacute;, la s&eacute;curit&eacute;, les sols, les acc&egrave;s, les assurances et les autorisations."],
    ["Comment TVF limite-t-elle l'artificialisation ?", "En privil&eacute;giant la remise en usage de l'existant et la transformation de lieux d&eacute;j&agrave; d&eacute;grad&eacute;s plut&ocirc;t que la consommation de nouveaux sols."],
  ]],
  [/^action-solidarite|pole-solidarite|espace-benevoles|signalement|agir-avec-nous/, [
    ["Comment devenir b&eacute;n&eacute;vole ?", "Il est possible de signaler son int&eacute;r&ecirc;t, ses disponibilit&eacute;s et ses comp&eacute;tences. Les missions seront propos&eacute;es selon les besoins r&eacute;els et le cadre de s&eacute;curit&eacute;."],
    ["Les chantiers participatifs sont-ils ouverts &agrave; tous ?", "Ils devront &ecirc;tre encadr&eacute;s, assur&eacute;s et adapt&eacute;s aux comp&eacute;tences des participants. Les missions &agrave; risque n&eacute;cessitent des professionnels."],
    ["TVF accompagne-t-elle l'insertion professionnelle ?", "L'objectif est de pr&eacute;parer des parcours utiles avec les acteurs comp&eacute;tents, sans annoncer de dispositif d'insertion avant structuration effective."],
  ]],
  [/observatoire|impact|dossier-saint|etude-impact|sources-etude|sources-donnees/, [
    ["Les donn&eacute;es publi&eacute;es sont-elles sourc&eacute;es ?", "Oui. Les pages d'observatoire et d'&eacute;tude distinguent les donn&eacute;es publiques, les estimations et les projections TVF."],
    ["Peut-on utiliser ces donn&eacute;es pour d&eacute;cider d'un projet ?", "Elles servent de base de discussion et de diagnostic. Une d&eacute;cision op&eacute;rationnelle exige toujours une v&eacute;rification locale."],
    ["Comment les indicateurs TVF seront-ils mis &agrave; jour ?", "Ils seront actualis&eacute;s lorsque les formulaires, bases de donn&eacute;es et validations territoriales permettront un suivi fiable."],
  ]],
  [/collectivites|partenariats|espace-entreprises|faire-un-don|antennes-locales|projets-pilotes/, [
    ["Une collectivit&eacute; ou entreprise peut-elle proposer une coop&eacute;ration ?", "Oui. La demande doit pr&eacute;ciser le territoire, le besoin, les ressources disponibles, les contraintes et le type d'engagement envisag&eacute;."],
    ["Une convention est-elle n&eacute;cessaire ?", "Oui d&egrave;s qu'il existe un engagement, une ressource, un usage, une responsabilit&eacute; ou une communication publique &agrave; encadrer."],
    ["TVF affiche-t-elle les partenaires automatiquement ?", "Non. Aucun partenaire, financeur ou m&eacute;c&egrave;ne n'est affich&eacute; sans accord explicite et validation du cadre de coop&eacute;ration."],
  ]],
  [/gouvernance|transparence|charte|documents-officiels|statuts|mentions|confidentialite|ce-que-tvf-ne-fait-pas|ce-que-fait-tvf|pourquoi-tvf|notre-methode|vision-france/, [
    ["Pourquoi ces pages institutionnelles sont-elles importantes ?", "Elles donnent un cadre clair : gouvernance, limites, responsabilit&eacute;s, documents officiels, protection des donn&eacute;es et m&eacute;thode de d&eacute;cision."],
    ["Les documents peuvent-ils &eacute;voluer ?", "Oui. Le site est pr&eacute;vu pour &ecirc;tre mis &agrave; jour apr&egrave;s les validations officielles, les assembl&eacute;es et les premi&egrave;res conventions."],
    ["Comment TVF &eacute;vite-t-elle les promesses excessives ?", "En distinguant les ambitions, les dispositifs en pr&eacute;paration, les donn&eacute;es publiques et les r&eacute;sultats r&eacute;ellement v&eacute;rifi&eacute;s."],
  ]],
];

function questionsFor(file) {
  if (faqByPage[file]) return faqByPage[file];
  const match = patternRules.find(([pattern]) => pattern.test(file));
  return match ? match[1] : commonQuestions;
}

function titleFor(file) {
  if (file.includes("saint-etienne")) return "Questions fr&eacute;quentes sur Saint-&Eacute;tienne";
  if (file.includes("materiaux") || file.includes("banque")) return "Questions fr&eacute;quentes sur les mat&eacute;riaux";
  if (file.includes("proprietaires") || file.includes("bien-solidaire")) return "Questions fr&eacute;quentes pour les propri&eacute;taires";
  if (file.includes("collectivites")) return "Questions fr&eacute;quentes pour les collectivit&eacute;s";
  if (file.includes("entreprises")) return "Questions fr&eacute;quentes pour les entreprises";
  if (file.includes("poles") || file.includes("pole-")) return "Questions fr&eacute;quentes sur ce p&ocirc;le";
  if (file.includes("action")) return "Questions fr&eacute;quentes sur cette action";
  return "Questions fr&eacute;quentes";
}

function sectionFor(file) {
  const items = questionsFor(file)
    .map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`)
    .join("");
  return `
      <section class="tvf-page-faq" aria-labelledby="faq-${file.replace(/[^a-z0-9]/gi, "-")}">
        <div class="tvf-page-faq-header">
          <span class="dossier-kicker">FAQ</span>
          <h2 id="faq-${file.replace(/[^a-z0-9]/gi, "-")}">${titleFor(file)}</h2>
          <p>Des r&eacute;ponses courtes pour comprendre le cadre, les limites et les prochaines &eacute;tapes avant de contacter TVF ou de proposer une action.</p>
        </div>
        <div class="tvf-page-faq-list">
          ${items}
        </div>
        <a class="button secondary" href="faq.html">Voir la FAQ g&eacute;n&eacute;rale</a>
      </section>
`;
}

let changed = 0;
for (const file of publicPages) {
  if (file === "faq.html") continue;
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  if (html.includes("class=\"tvf-page-faq\"")) continue;
  if (!html.includes("</main>")) continue;
  html = html.replace(/\s*<\/main>/, `${sectionFor(file)}    </main>`);
  fs.writeFileSync(full, html, "utf8");
  changed += 1;
}

console.log(JSON.stringify({ changed }, null, 2));
