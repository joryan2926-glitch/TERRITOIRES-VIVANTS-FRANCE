const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();

const sources = {
  zlv: '<a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener">Zéro Logement Vacant - Ministère de la Ville et du Logement</a>',
  cartofriches: '<a href="https://cartofriches.cerema.fr/cartofriches/" rel="noopener">Cartofriches - Cerema</a>',
  sdes: '<a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener">SDES, bilan 2020 de la production de déchets</a>',
  artificialisation: '<a href="https://artificialisation.developpement-durable.gouv.fr/" rel="noopener">Portail national de l’artificialisation des sols</a>',
  acv: '<a href="https://anct.gouv.fr/programmes-dispositifs/action-coeur-de-ville" rel="noopener">ANCT, Action cœur de ville</a>',
  pvd: '<a href="https://anct.gouv.fr/programmes-dispositifs/petites-villes-de-demain" rel="noopener">ANCT, Petites villes de demain</a>',
  poverty: '<a href="https://www.insee.fr/fr/statistiques/8600989" rel="noopener">INSEE, niveau de vie et pauvreté en 2023</a>',
  unemployment: '<a href="https://www.insee.fr/fr/statistiques/2012804" rel="noopener">INSEE, taux de chômage localisés au 1er trimestre 2026</a>',
};

function sourceList(keys) {
  return `<div class="source-list"><strong>Sources citées</strong>${keys.map((key) => `<span>${sources[key]}</span>`).join("")}</div>`;
}

function dataCards(items) {
  return `<div class="data-grid" aria-label="Chiffres clés">${items.map((item) => `<article class="data-card"><strong>${item.value}</strong><span>${item.label}</span><small>${item.note}</small></article>`).join("")}</div>`;
}

function chart(rows) {
  return `<div class="chart-panel" aria-label="Comparatif visuel">${rows.map((row) => `<div class="bar-row"><span>${row.label}</span><div class="bar-track"><span class="bar-fill" style="--value:${row.value}"></span></div><strong>${row.display}</strong></div>`).join("")}</div>`;
}

function mapSketch(title, text) {
  return `<div class="map-sketch" aria-label="Carte prévue"><div><strong>${title}</strong><span>${text}</span></div></div>`;
}

function faq(items) {
  return `<div class="doc-faq" aria-label="FAQ documentaire">${items.map(([q, a]) => `<article><h3>${q}</h3><p>${a}</p></article>`).join("")}</div>`;
}

function exampleQuote(text) {
  return `<blockquote class="example-quote"><strong>Exemple fictif à visée pédagogique</strong><p>${text}</p></blockquote>`;
}

function slugFor(file) {
  return file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-");
}

const deepTemplates = {
  logements: () => `
        <section class="doc-section" data-deep-refonte="logements" aria-labelledby="deep-logements">
          <span class="doc-kicker">Analyse documentaire</span>
          <h2 id="deep-logements">Logements vacants : comprendre la vacance avant de la transformer</h2>
          <p>La vacance résidentielle n’est pas un stock homogène de logements immédiatement disponibles. Elle recouvre des successions bloquées, des biens trop coûteux à rénover, des logements énergivores, des copropriétés fragiles, des propriétaires éloignés, des marchés détendus où la demande locative est faible, mais aussi des centres anciens où l’habitat ne correspond plus aux usages contemporains.</p>
          <p>Pour Territoires Vivants France, l’enjeu est donc de ne pas réduire la vacance à un simple inventaire. Une commune a besoin de distinguer la vacance courte, normale dans un marché immobilier, de la vacance structurelle qui dégrade les rues, fragilise les commerces, augmente le sentiment d’abandon et consomme indirectement du foncier neuf lorsque les ménages partent construire plus loin.</p>
          ${dataCards([
            { value: "+1 million", label: "logements vacants depuis plus de deux ans recensés en 2020", note: "Repère national utilisé par Zéro Logement Vacant pour lancer le plan public de mobilisation." },
            { value: "+100 000", label: "propriétaires contactés via Zéro Logement Vacant", note: "Résultat du service public numérique, à ne pas confondre avec un résultat TVF." },
            { value: "+1000", label: "collectivités mobilisées sur la plateforme publique", note: "La lutte contre la vacance est déjà un sujet national de politiques locales." },
            { value: "400 000 m²", label: "de surfaces sorties de la vacance via ZLV", note: "Indicateur public cité par la plateforme Zéro Logement Vacant." },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Pourquoi le problème s’aggrave</strong><p>La hausse des coûts de travaux, les exigences énergétiques, la complexité des successions, la difficulté à trouver des artisans et l’éloignement de certains propriétaires rendent la remise en usage plus lente. Dans les centres anciens, les logements peuvent être au-dessus de commerces fermés, sans accès indépendant ou avec des normes à reprendre.</p></article>
            <article class="analysis-note"><strong>Conséquences territoriales</strong><p>Un logement vacant durable réduit la population résidente, affaiblit la clientèle des commerces, augmente la dégradation du bâti et peut produire un effet domino sur une rue entière. À l’inverse, remettre en usage l’existant soutient la sobriété foncière et limite la construction neuve sur terres agricoles ou naturelles.</p></article>
          </div>
          ${chart([
            { label: "Vacance à qualifier", value: "88%", display: "diagnostic" },
            { label: "Travaux et énergie", value: "70%", display: "levier" },
            { label: "Dialogue propriétaire", value: "62%", display: "condition" },
            { label: "Usage temporaire", value: "44%", display: "option" },
          ])}
          <h3>Solutions concrètes portées par TVF</h3>
          <p>TVF peut intervenir comme tiers de confiance : signalement, qualification, dialogue avec le propriétaire, orientation vers les dispositifs publics, mobilisation de matériaux de réemploi, étude d’un usage temporaire, recherche de financements et suivi de projet. Le programme Bien Solidaire à Usage Partagé s’inscrit dans cette logique : conserver la propriété privée tout en rendant possible un usage collectif temporaire lorsque l’investissement réalisé le justifie.</p>
          ${exampleQuote("Dans une commune moyenne, une maison fermée depuis dix ans pourrait être étudiée comme logement temporaire pour jeunes actifs après diagnostic technique, convention avec le propriétaire et mobilisation de matériaux de réemploi. Cet exemple est fictif : il illustre une méthode, pas un projet réalisé par TVF.")}
          ${faq([
            ["Un logement vacant peut-il être publié directement sur la carte ?", "Non. L’adresse, la propriété, le niveau de vacance et les risques doivent être vérifiés avant toute diffusion."],
            ["TVF remplace-t-elle les dispositifs publics ?", "Non. TVF se positionne comme acteur de mobilisation, de médiation et de coordination, en complément des collectivités et outils publics."],
            ["Pourquoi parler de rénovation et de réemploi ensemble ?", "Parce que le coût des travaux est souvent un frein majeur : le réemploi peut réduire le gaspillage et aider certains projets à trouver une trajectoire plus sobre."],
          ])}
          ${sourceList(["zlv", "artificialisation"])}
        </section>`,

  commerces: () => `
        <section class="doc-section" data-deep-refonte="commerces" aria-labelledby="deep-commerces">
          <span class="doc-kicker">Analyse économique locale</span>
          <h2 id="deep-commerces">Commerces inoccupés : une question de centralité, d’emploi et de qualité de vie</h2>
          <p>La fermeture d’un commerce n’est jamais seulement une vitrine vide. Elle signale souvent une fragilité plus large : baisse de fréquentation, concurrence périphérique, changement des habitudes d’achat, difficulté de transmission, loyers inadaptés, locaux obsolètes, manque d’habitants dans le centre ou perte de services publics de proximité.</p>
          <p>Les programmes nationaux de revitalisation montrent que le commerce est indissociable de l’habitat, de l’espace public, de la mobilité et de la présence d’activités. Action cœur de ville intègre explicitement le développement économique et commercial dans ses axes, tandis que Petites villes de demain cible les centralités de moins de 20 000 habitants.</p>
          ${dataCards([
            { value: "244", label: "communes Action cœur de ville en 2025", note: "Programme national ANCT ciblant les villes moyennes, dont une dizaine en outre-mer." },
            { value: "1646", label: "communes Petites villes de demain", note: "Petites centralités accompagnées pour améliorer qualité de vie et attractivité." },
            { value: "7 M", label: "habitants concernés par Petites villes de demain", note: "Une échelle nationale qui confirme l’enjeu des petites centralités." },
            { value: "4 Md€", label: "engagés jusqu’en 2026 pour Petites villes de demain", note: "Montant public national, non lié à TVF." },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Pourquoi les vitrines se vident</strong><p>Le commerce de proximité dépend d’un écosystème : logements occupés, flux piétons, stationnement, accessibilité, pouvoir d’achat, qualité de l’espace public et loyers. Une cellule commerciale dégradée ou trop grande pour un entrepreneur local reste souvent fermée même lorsqu’un besoin existe.</p></article>
            <article class="analysis-note"><strong>Rôle possible de TVF</strong><p>TVF peut recenser les locaux, qualifier leur état, identifier les usages possibles, mettre en relation propriétaires et porteurs d’activités, organiser des occupations temporaires, intégrer la rénovation légère et faciliter l’émergence de tiers-lieux, ateliers, boutiques éphémères ou services associatifs.</p></article>
          </div>
          ${mapSketch("Carte des cellules commerciales à qualifier", "Couche prévue : locaux fermés, rez-de-chaussée actifs, proximité des logements vacants, accessibilité, usages possibles.")}
          ${exampleQuote("Une ancienne boutique fermée depuis plusieurs années pourrait devenir atelier partagé pour artisans, avec une phase test de six mois et un loyer solidaire. Exemple fictif : il sert à expliquer une option de reconversion, pas à annoncer un projet existant.")}
          ${faq([
            ["Pourquoi l’habitat compte-t-il pour le commerce ?", "Un centre habité crée des flux quotidiens, sécurise la rue et soutient les achats réguliers."],
            ["Un commerce fermé doit-il toujours redevenir un commerce ?", "Pas nécessairement. Certains locaux peuvent accueillir un atelier, une association, un service, une formation ou un usage temporaire."],
            ["Comment éviter les faux espoirs ?", "En vérifiant l’état du local, les contraintes de bail, le coût de remise en état et la demande réelle avant communication."],
          ])}
          ${sourceList(["acv", "pvd"])}
        </section>`,

  friches: () => `
        <section class="doc-section" data-deep-refonte="friches" aria-labelledby="deep-friches">
          <span class="doc-kicker">Sobriété foncière</span>
          <h2 id="deep-friches">Friches et terrains abandonnés : recycler l’existant pour éviter l’étalement</h2>
          <p>Les friches sont des lieux complexes : anciens sites industriels, équipements publics fermés, bâtiments militaires, terrains commerciaux, espaces ferroviaires ou bâtiments d’habitat dégradé. Leur transformation demande une lecture fine de la propriété, de la pollution, des accès, du coût de remise en état et du projet de territoire.</p>
          <p>Le contexte national rend cette question stratégique. La France vise le zéro artificialisation nette en 2050, avec un objectif intermédiaire de réduction de moitié de la consommation d’espaces naturels, agricoles et forestiers sur 2021-2031 par rapport à 2011-2021. Réutiliser les friches devient donc une réponse écologique, mais aussi économique et sociale.</p>
          ${dataCards([
            { value: "2999", label: "projets candidats au Fonds friches", note: "Données Cartofriches sur les trois premières éditions." },
            { value: "1382", label: "projets soutenus", note: "750 M€ de soutien public national dans les premières éditions." },
            { value: "3375 ha", label: "de friches visés par le recyclage", note: "Surface totale visée par les projets soutenus." },
            { value: "80 %", label: "des friches lauréates polluées", note: "Ce chiffre explique la complexité technique et financière de la reconversion." },
          ])}
          ${chart([
            { label: "Projets immobiliers", value: "55%", display: "55 %" },
            { label: "Projets d’aménagement", value: "31%", display: "31 %" },
            { label: "Proto-aménagements", value: "12%", display: "12 %" },
            { label: "Porteurs publics", value: "90%", display: "90 %" },
          ])}
          <h3>Comment TVF intervient</h3>
          <p>TVF peut aider à passer du signalement à une première hypothèse d’usage : jardin partagé, espace nourricier, local associatif, atelier, espace culturel, renaturation légère ou projet de formation. L’association n’a pas vocation à remplacer les études techniques, mais à préparer le terrain : collecte d’informations, mobilisation citoyenne, repérage des usages, médiation et orientation vers les acteurs compétents.</p>
          ${mapSketch("Carte des friches et usages possibles", "Couche prévue : friches signalées, niveau de validation, pollution connue, propriétaire, potentiel de renaturation, potentiel d’usage social.")}
          ${exampleQuote("Une petite friche en entrée de bourg pourrait accueillir provisoirement un verger citoyen et des ateliers de sensibilisation, avant un projet urbain définitif. Exemple fictif, non réalisé par TVF.")}
          ${faq([
            ["Pourquoi les friches coûtent-elles cher ?", "La dépollution, la démolition, la sécurisation et les études peuvent représenter une part importante du budget."],
            ["Toutes les friches sont-elles constructibles ?", "Non. Le zonage, la pollution, les risques, la biodiversité et la propriété peuvent limiter ou orienter les usages."],
            ["Quel est l’intérêt d’un usage temporaire ?", "Il peut éviter l’abandon prolongé, tester un besoin local et préparer une décision plus lourde."],
          ])}
          ${sourceList(["cartofriches", "artificialisation"])}
        </section>`,

  materiaux: () => `
        <section class="doc-section" data-deep-refonte="materiaux" aria-labelledby="deep-materiaux">
          <span class="doc-kicker">Économie circulaire</span>
          <h2 id="deep-materiaux">Réemploi des matériaux : réduire les déchets, les coûts et l’empreinte carbone</h2>
          <p>Le réemploi n’est pas seulement un geste écologique. C’est une organisation complète : identifier les matériaux avant qu’ils deviennent déchets, documenter leur état, prévoir la dépose, stocker, tracer, rendre visible et relier l’offre à des besoins réels. Sans méthode, les matériaux restent dispersés, dégradés ou jetés faute d’acheteur ou de bénéficiaire.</p>
          <p>Les données nationales montrent l’ampleur du sujet. En 2020, la France a produit 310 millions de tonnes de déchets, dont 66 % de déchets minéraux issus du secteur de la construction. Même lorsque la valorisation matière progresse, le réemploi en amont reste essentiel pour préserver la valeur d’usage des matériaux et limiter les transports.</p>
          ${dataCards([
            { value: "310 Mt", label: "de déchets produits en France en 2020", note: "Bilan national SDES, tous secteurs confondus." },
            { value: "66 %", label: "de déchets minéraux issus de la construction", note: "Le bâtiment et les travaux publics concentrent une part majeure des tonnages." },
            { value: "74 %", label: "de valorisation matière des déchets minéraux", note: "La valorisation ne remplace pas le besoin de réemploi et de prévention." },
            { value: "4,6 t", label: "de déchets par habitant en 2020", note: "Ordre de grandeur national SDES." },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Pourquoi le gaspillage persiste</strong><p>Les chantiers manquent souvent de temps, de surface de stockage, d’inventaire, de débouchés locaux ou de garanties sur l’état des matériaux. Les acteurs préfèrent évacuer vite plutôt que gérer une seconde vie incertaine.</p></article>
            <article class="analysis-note"><strong>Réponse TVF</strong><p>La banque de matériaux TVF peut enregistrer photos, localisation, quantité, état, disponibilité, contact et statut de validation. Elle doit devenir une interface entre entreprises, collectivités, associations, artisans et projets locaux.</p></article>
          </div>
          ${chart([
            { label: "Bois, portes, fenêtres", value: "72%", display: "réemploi direct" },
            { label: "Sanitaires et mobilier", value: "64%", display: "stock solidaire" },
            { label: "Carrelage, parquet", value: "52%", display: "chantier ciblé" },
            { label: "Déchets inertes", value: "38%", display: "valorisation" },
          ])}
          ${exampleQuote("Un hôtel en rénovation pourrait proposer bureaux, portes, luminaires et sanitaires encore utilisables. Exemple fictif : la publication réelle supposerait photos, quantités, état, date de retrait et accord du propriétaire des matériaux.")}
          ${faq([
            ["Un matériau proposé est-il automatiquement accepté ?", "Non. L’état, la sécurité, la traçabilité et la faisabilité logistique doivent être vérifiés."],
            ["Le réemploi peut-il remplacer l’achat neuf ?", "Parfois, mais pas toujours. Il complète les approvisionnements classiques et demande une anticipation."],
            ["Pourquoi une banque nationale plutôt qu’un simple formulaire ?", "Parce qu’il faut rechercher, filtrer, réserver, archiver et mesurer les flux dans le temps."],
          ])}
          ${sourceList(["sdes"])}
        </section>`,

  insertion: () => `
        <section class="doc-section" data-deep-refonte="insertion" aria-labelledby="deep-insertion">
          <span class="doc-kicker">Insertion et cohésion sociale</span>
          <h2 id="deep-insertion">Transformer les lieux vacants en supports d’engagement, de formation et d’emploi</h2>
          <p>Les projets de revitalisation ne concernent pas seulement les bâtiments. Ils peuvent créer des parcours : repérage, médiation, inventaire de matériaux, chantiers participatifs, entretien d’espaces, accueil du public, logistique, communication locale et formation aux métiers de la rénovation ou du réemploi.</p>
          <p>L’enjeu social est fort dans un contexte où l’INSEE observe en 2023 une hausse du taux de pauvreté à 15,4 % en France métropolitaine, soit 9,8 millions de personnes vivant sous le seuil de pauvreté monétaire. Les difficultés de logement, de mobilité et d’emploi se renforcent mutuellement, surtout dans les territoires où les services sont éloignés.</p>
          ${dataCards([
            { value: "15,4 %", label: "taux de pauvreté en 2023", note: "INSEE, France métropolitaine, personnes vivant en logement ordinaire." },
            { value: "9,8 M", label: "personnes sous le seuil de pauvreté", note: "Seuil fixé à 60 % du niveau de vie médian." },
            { value: "8,2 %", label: "chômage localisé dans la Loire au T1 2026", note: "INSEE, donnée utile pour contextualiser Saint-Étienne et son département." },
            { value: "10,9 %", label: "chômage dans l’Aude et l’Hérault au T1 2026", note: "Exemple d’écarts territoriaux importants selon les départements." },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Pourquoi les freins s’accumulent</strong><p>Un logement mal situé, une absence de permis, des difficultés de santé, un manque de réseau professionnel ou un territoire sans offre de formation peuvent éloigner durablement de l’emploi. Les chantiers utiles au territoire peuvent recréer un cadre concret d’apprentissage et de confiance.</p></article>
            <article class="analysis-note"><strong>Rôle de TVF</strong><p>TVF peut proposer des missions graduées : observation, inventaire, ateliers de réemploi, chantiers encadrés, médiation avec les habitants et orientation vers les structures compétentes. L’association doit travailler avec les acteurs sociaux existants, sans se substituer à eux.</p></article>
          </div>
          ${exampleQuote("Une équipe bénévole pourrait accompagner un atelier d’inventaire de matériaux avec des jeunes en découverte des métiers du bâtiment. Exemple fictif, uniquement pédagogique.")}
          ${faq([
            ["TVF peut-elle employer directement des personnes en insertion ?", "Ce serait une étape future à encadrer juridiquement. La première phase consiste à créer des missions, des partenariats et une méthode."],
            ["Pourquoi lier insertion et réemploi ?", "Parce que l’inventaire, la préparation, la logistique et les ateliers peuvent devenir des supports d’apprentissage concrets."],
            ["Comment éviter les chantiers non sécurisés ?", "Chaque chantier doit être encadré, assuré, dimensionné et confié à des professionnels lorsque les tâches l’exigent."],
          ])}
          ${sourceList(["poverty", "unemployment"])}
        </section>`,

  observatoire: () => `
        <section class="doc-section" data-deep-refonte="observatoire" aria-labelledby="deep-observatoire">
          <span class="doc-kicker">Observatoire national</span>
          <h2 id="deep-observatoire">Chiffres clés de la France : bâtir une lecture territoriale fiable</h2>
          <p>L’Observatoire TVF doit devenir une interface de compréhension, pas seulement une carte. Les données nationales donnent des ordres de grandeur, mais les décisions se prennent à l’échelle d’une commune, d’un quartier, d’un îlot, d’un propriétaire et d’un usage possible. La crédibilité dépend donc de la traçabilité : source, date, territoire, méthode, statut de validation.</p>
          ${dataCards([
            { value: "+1 M", label: "logements vacants de plus de deux ans recensés en 2020", note: "Repère national Zéro Logement Vacant." },
            { value: "1382", label: "projets de friches soutenus", note: "Fonds friches, premières éditions analysées par le Cerema." },
            { value: "310 Mt", label: "déchets produits en France en 2020", note: "Dont 66 % de déchets minéraux de construction." },
            { value: "15,4 %", label: "taux de pauvreté 2023", note: "INSEE, niveau le plus élevé depuis le début de la série en 1996." },
            { value: "244", label: "communes Action cœur de ville", note: "Villes moyennes concernées par la revitalisation." },
            { value: "1646", label: "communes Petites villes de demain", note: "Petites centralités accompagnées par l’ANCT." },
            { value: "2050", label: "objectif zéro artificialisation nette", note: "Trajectoire nationale de sobriété foncière." },
            { value: "2026", label: "mise à jour récente Cartofriches", note: "Données ouvertes et API foncière mobilisables." },
          ])}
          <h3>Indicateurs à suivre par territoire</h3>
          ${chart([
            { label: "Logements vacants", value: "86%", display: "LOVAC / ZLV" },
            { label: "Commerces fermés", value: "64%", display: "terrain / commune" },
            { label: "Friches", value: "78%", display: "Cartofriches" },
            { label: "Matériaux disponibles", value: "52%", display: "TVF / Supabase" },
            { label: "Pauvreté et chômage", value: "70%", display: "INSEE" },
            { label: "Artificialisation", value: "74%", display: "Cerema" },
          ])}
          ${mapSketch("Carte nationale multi-couches", "Couches prévues : logements vacants, commerces fermés, friches, matériaux, projets, antennes, indicateurs sociaux et sobriété foncière.")}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Lecture nationale</strong><p>Les chiffres nationaux montrent l’ampleur des ressources inutilisées. Mais ils masquent de fortes différences entre métropoles, villes moyennes, bourgs ruraux, littoraux, bassins industriels et outre-mer.</p></article>
            <article class="analysis-note"><strong>Lecture opérationnelle</strong><p>TVF doit transformer les données en décisions : quel bien vérifier, quel propriétaire contacter, quel usage tester, quel financement rechercher, quel acteur local mobiliser.</p></article>
          </div>
          ${faq([
            ["Pourquoi ne pas publier toutes les données reçues ?", "Parce qu’un signalement peut être incomplet, sensible ou inexact. La modération protège les personnes et la crédibilité de l’observatoire."],
            ["Quelles sources seront prioritaires ?", "Les sources publiques et traçables : INSEE, Cerema, Cartofriches, Zéro Logement Vacant, ANCT, SDES, collectivités et données validées TVF."],
            ["Comment intégrer Supabase ?", "Chaque donnée doit disposer d’un identifiant, d’un statut, d’une source, d’une date, d’une localisation et d’un niveau de diffusion."],
          ])}
          ${sourceList(["zlv", "cartofriches", "sdes", "artificialisation", "acv", "pvd", "poverty", "unemployment"])}
        </section>`,

  financement: () => `
        <section class="doc-section" data-deep-refonte="financement" aria-labelledby="deep-financement">
          <span class="doc-kicker">Financement de projets</span>
          <h2 id="deep-financement">Financer la revitalisation : rendre les projets lisibles, crédibles et auditables</h2>
          <p>Les projets de remise en usage échouent rarement faute d’idées. Ils échouent plus souvent faute d’ingénierie, de données fiables, de montage juridique, de capacité à chiffrer les travaux, de garanties pour les financeurs et de suivi transparent. Le financement doit donc être présenté comme une chaîne : diagnostic, budget, risques, gouvernance, convention, contribution, réalisation, mesure d’impact.</p>
          <p>Les exemples nationaux montrent que les montants peuvent être significatifs : le Fonds friches a soutenu 1382 projets pour 750 M€, tandis que Petites villes de demain engage 4 Md€ jusqu’en 2026. TVF ne doit pas afficher de montants acquis, mais peut structurer des dossiers capables de dialoguer avec mécènes, fondations, collectivités et investisseurs à impact.</p>
          ${dataCards([
            { value: "750 M€", label: "soutien public Fonds friches", note: "Montant national des premières éditions, non lié à TVF." },
            { value: "4 Md€", label: "engagés pour Petites villes de demain", note: "Programme public jusqu’en 2026." },
            { value: "1382", label: "projets de friches soutenus", note: "Base utile pour comprendre les coûts et montages." },
            { value: "0 €", label: "financement TVF affiché sans preuve", note: "Aucun financement ne doit être annoncé sans convention ou preuve validée." },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Ce qu’un financeur attend</strong><p>Un projet clair : localisation, propriété, diagnostic, devis, calendrier, risques, gouvernance, contreparties, indicateurs et documents justificatifs. La transparence est une condition de confiance.</p></article>
            <article class="analysis-note"><strong>Ce que TVF peut apporter</strong><p>TVF peut préparer les fiches projets, regrouper les besoins, orienter vers mécénat, dons de matériaux, financement participatif, subventions publiques et contributions solidaires, puis publier un suivi vérifiable.</p></article>
          </div>
          ${exampleQuote("Un bâtiment vacant pourrait faire l’objet d’une fiche de financement indiquant budget prévisionnel, usages envisagés, photos, risques et calendrier. Exemple fictif : aucun appel à financement réel ne doit être lancé sans dossier validé.")}
          ${faq([
            ["Peut-on afficher des budgets prévisionnels ?", "Oui, s’ils sont clairement identifiés comme prévisionnels et datés."],
            ["Peut-on citer un mécène pressenti ?", "Non. Un mécène ne doit être affiché qu’après accord explicite."],
            ["Comment mesurer l’impact d’un projet financé ?", "En suivant des indicateurs simples : bien remis en usage, surfaces, matériaux réemployés, bénéficiaires, durée d’usage, documents justificatifs."],
          ])}
          ${sourceList(["cartofriches", "pvd"])}
        </section>`,

  antennes: () => `
        <section class="doc-section" data-deep-refonte="antennes" aria-labelledby="deep-antennes">
          <span class="doc-kicker">Déploiement national</span>
          <h2 id="deep-antennes">Antennes locales : passer d’une ambition nationale à une capacité d’action territoriale</h2>
          <p>Une plateforme nationale ne peut pas fonctionner uniquement depuis un siège. La vacance, les friches et le réemploi exigent une connaissance de terrain : rues, propriétaires, artisans, associations, élus, bailleurs, entreprises, contraintes foncières et besoins sociaux. Les antennes locales doivent donc devenir des relais de confiance, formés et outillés.</p>
          <p>Les programmes de l’ANCT montrent que la revitalisation concerne à la fois les villes moyennes, les petites centralités et les outre-mer. TVF doit préparer une méthode duplicable : candidature, diagnostic, référents, convention, formation, outils communs, gouvernance, reporting et protection des données.</p>
          ${dataCards([
            { value: "244", label: "communes Action cœur de ville", note: "Villes moyennes et outre-mer." },
            { value: "1646", label: "communes Petites villes de demain", note: "Petites centralités et intercommunalités." },
            { value: "7 M", label: "habitants concernés par PVD", note: "Échelle nationale de la revitalisation des petites villes." },
            { value: "6", label: "territoires TVF à préparer", note: "Métropole, Martinique, Guadeloupe, Guyane, Réunion, Mayotte." },
          ])}
          ${mapSketch("Carte des futures antennes", "Statuts prévus : intérêt reçu, diagnostic en cours, référent identifié, convention, antenne active.")}
          <h3>Méthode de création d’une antenne</h3>
          <div class="doc-grid"><article class="doc-card"><h3>1. Candidature</h3><p>Comprendre le territoire, les personnes engagées, les besoins et la capacité à animer localement.</p></article><article class="doc-card"><h3>2. Diagnostic</h3><p>Identifier logements, commerces, friches, matériaux et acteurs compétents.</p></article><article class="doc-card"><h3>3. Convention</h3><p>Clarifier responsabilités, usage de la marque, données, reporting et règles de publication.</p></article></div>
          ${faq([
            ["Une antenne peut-elle agir seule ?", "Non. Elle doit respecter la méthode nationale, la validation des données et les règles de gouvernance."],
            ["Pourquoi commencer par Saint-Étienne ?", "Parce que le siège national y est basé et que le territoire présente des enjeux cohérents avec l’objet de l’association."],
            ["Quand afficher une antenne comme active ?", "Uniquement lorsque référent, périmètre, cadre de fonctionnement et validation interne sont établis."],
          ])}
          ${sourceList(["acv", "pvd"])}
        </section>`,

  vision: () => `
        <section class="doc-section" data-deep-refonte="vision" aria-labelledby="deep-vision">
          <span class="doc-kicker">Vision France 2035</span>
          <h2 id="deep-vision">Une stratégie de long terme pour relier habitat, foncier, réemploi et solidarité</h2>
          <p>La revitalisation territoriale ne peut pas être pensée par silos. Un logement vacant peut dépendre d’un commerce fermé en rez-de-chaussée, d’une rue peu attractive, de matériaux trop coûteux, d’un manque d’ingénierie, d’un propriétaire isolé ou d’une commune sans capacité technique. La vision 2035 de TVF doit articuler observation, action locale, financement, réemploi et inclusion.</p>
          <p>L’objectif n’est pas de promettre un réseau national déjà réalisé, mais de construire une trajectoire crédible : Saint-Étienne comme base, premières antennes, observatoire national, banque de matériaux, fonds solidaire, outils numériques et gouvernance transparente.</p>
          ${dataCards([
            { value: "2050", label: "Zéro artificialisation nette", note: "Horizon national qui oblige à mieux utiliser l’existant." },
            { value: "+1 M", label: "logements vacants de longue durée", note: "Ordre de grandeur qui justifie l’observation et l’accompagnement." },
            { value: "310 Mt", label: "déchets produits en France en 2020", note: "Le réemploi est un pilier de sobriété matérielle." },
            { value: "15,4 %", label: "taux de pauvreté 2023", note: "La revitalisation doit aussi répondre aux vulnérabilités sociales." },
          ])}
          ${chart([
            { label: "2026 - lancement Saint-Étienne", value: "25%", display: "amorcer" },
            { label: "2027 - premières antennes", value: "42%", display: "structurer" },
            { label: "2028 - observatoire national", value: "58%", display: "outiller" },
            { label: "2030 - réseau national", value: "78%", display: "déployer" },
            { label: "2035 - référence nationale", value: "100%", display: "consolider" },
          ])}
          <div class="analysis-columns">
            <article class="analysis-note"><strong>Ce qui rend la vision crédible</strong><p>Des données sourcées, des états vides assumés, des partenariats publiés seulement lorsqu’ils existent, une mesure d’impact vérifiable et une méthode commune pour les antennes.</p></article>
            <article class="analysis-note"><strong>Ce que TVF doit éviter</strong><p>Les effets d’annonce, les chiffres non datés, les faux projets, les logos non autorisés, les cartes non vérifiées et les promesses de financement sans cadre juridique.</p></article>
          </div>
          ${sourceList(["zlv", "cartofriches", "sdes", "artificialisation", "poverty"])}
        </section>`,
};

function categoryFor(file) {
  if (/logements-vacants|habitat-vivant|bien-solidaire|proposer-un-bien|proprietaire/.test(file)) return "logements";
  if (/commerces-inoccupes|commerce-vivant/.test(file)) return "commerces";
  if (/friches|espaces-abandonnes/.test(file)) return "friches";
  if (/materiaux|materiautheque|banque-materiaux/.test(file)) return "materiaux";
  if (/solidarite|insertion|benevoles|recrutement/.test(file)) return "insertion";
  if (/observatoire|carte-territoires|carte-interactive|tableau|impact|mesure|statistiques/.test(file)) return "observatoire";
  if (/financer|fonds|investisseur|mecene|projets-a-financer|faire-un-don/.test(file)) return "financement";
  if (/antenne|association-nationale/.test(file)) return "antennes";
  if (/vision/.test(file)) return "vision";
  return null;
}

function genericSection(file) {
  const id = `deep-${slugFor(file)}`;
  return `
        <section class="doc-section compact" data-deep-refonte="socle-documentaire" aria-labelledby="${id}">
          <span class="doc-kicker">Socle documentaire</span>
          <h2 id="${id}">Lire cette page comme une ressource de travail</h2>
          <p>Cette page s’inscrit dans une stratégie nationale de revitalisation : observer les ressources inutilisées, qualifier les situations, mobiliser les acteurs locaux, rechercher les financements adaptés et publier uniquement des informations vérifiées. Les chiffres d’impact propres à TVF ne doivent apparaître qu’après enregistrement et validation des données dans Supabase.</p>
          <div class="doc-grid"><article class="doc-card"><h3>État des lieux</h3><p>Les problèmes de vacance, de friches, de matériaux perdus et de fragilités sociales se renforcent lorsqu’ils ne sont pas cartographiés et traités ensemble.</p></article><article class="doc-card"><h3>Solution TVF</h3><p>TVF apporte une méthode : signalement, qualification, médiation, mobilisation, réemploi, financement, suivi et transparence.</p></article><article class="doc-card"><h3>Preuve attendue</h3><p>Chaque donnée publiée doit préciser sa source, sa date, son territoire, son statut de validation et ses limites.</p></article></div>
          ${sourceList(["zlv", "cartofriches", "sdes", "artificialisation", "acv", "pvd"])}
        </section>`;
}

function insertBeforeClosingPageWrap(html, section, file) {
  if (html.includes("data-deep-refonte=")) return html;
  if (file === "index.html") {
    return html.replace(/\s*<section class="news-section"/i, `${section}\n\n      <section class="news-section"`);
  }
  return html.replace(/\s*<\/div>\s*<\/main>/i, `${section}\n      </div>\n    </main>`);
}

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  if (html.includes("data-deep-refonte=")) continue;
  const category = categoryFor(file);
  const section = category && deepTemplates[category] ? deepTemplates[category]() : genericSection(file);
  const next = insertBeforeClosingPageWrap(html, section, file);
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`Deep documentary content inserted in ${changed} pages`);
