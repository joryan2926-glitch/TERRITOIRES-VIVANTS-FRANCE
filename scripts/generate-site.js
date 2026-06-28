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
  ["Partenaires", "partenaires.html"],
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
      "Territoires Vivants France structure une méthode de coopération pour repérer les ressources inutilisées, mobiliser les bons acteurs, préparer les conventions et accompagner des projets utiles aux territoires.",
    ctas: [
      ["Comprendre TVF", "qui-sommes-nous.html"],
      ["Agir avec nous", "agir-avec-nous.html"],
      ["Nous contacter", "contact.html"],
    ],
    sections: [
      sectionIntro(
        "Une mission lisible",
        "TVF part d'un constat simple : des logements restent vacants, des commerces ferment, des friches demeurent inutilisées et des matériaux encore utiles sortent des circuits de projet. L'association veut transformer ces situations en opportunités locales, avec un cadre clair et traçable.",
        [
          ["Observer", "Identifier les lieux, besoins et ressources à partir de signalements, visites et données vérifiables."],
          ["Qualifier", "Analyser la faisabilité, les contraintes, les responsabilités et les usages possibles."],
          ["Coordonner", "Réunir propriétaires, collectivités, entreprises, associations, financeurs, bénévoles et habitants."],
        ]
      ),
      cards(
        "À chacun son entrée",
        "Le site doit permettre à chaque public de savoir quoi faire en moins de deux minutes.",
        [
          ["Collectivité", "Préparer un diagnostic, une expérimentation ou une coopération territoriale.", "agir-avec-nous.html#collectivite"],
          ["Propriétaire", "Présenter un logement, un commerce, un bâtiment ou un terrain inutilisé.", "agir-avec-nous.html#proprietaire"],
          ["Entreprise", "Valoriser des matériaux, compétences, locaux ou mécénat dans un projet utile.", "agir-avec-nous.html#entreprise"],
          ["Citoyen", "Signaler un lieu, participer à une action locale ou rejoindre une mission bénévole.", "agir-avec-nous.html#citoyen"],
        ]
      ),
      timeline(
        "Le parcours TVF",
        [
          ["1", "Repérage", "Un lieu, un besoin ou une ressource est identifié."],
          ["2", "Diagnostic", "La situation est qualifiée avant toute annonce ou engagement."],
          ["3", "Convention", "Les rôles, responsabilités, usages et limites sont formalisés."],
          ["4", "Mise en usage", "Le projet est coordonné, documenté puis suivi dans le temps."],
        ]
      ),
      highlight(
        "Saint-Étienne comme territoire pilote",
        "Le siège national est situé à Saint-Étienne. Le territoire pilote permet de tester la méthode TVF sur des enjeux concrets : habitat vacant, commerces fermés, friches, matériaux de réemploi et mobilisation citoyenne.",
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
      "TVF rassemble les acteurs capables de transformer un bien inutilisé en ressource pour les habitants : propriétaires, collectivités, entreprises, associations, bénévoles, financeurs et citoyens.",
    ctas: [["Notre méthode", "notre-methode.html"], ["Transparence", "transparence.html"]],
    sections: [
      textBlock(
        "Notre rôle",
        "TVF ne remplace ni les collectivités, ni les dispositifs publics, ni les professionnels du bâtiment. L'association cherche à rendre les coopérations plus simples : repérer les situations, préparer les dossiers, mettre les acteurs autour de la même table et suivre ce qui est décidé."
      ),
      split(
        "Une association en création",
        "La priorité est de construire une méthode crédible avant de communiquer des résultats. Cela signifie : des documents propres, des conventions adaptées, des critères de sélection, une traçabilité des décisions et une distinction nette entre objectifs, projets en instruction et actions réalisées.",
        "assets/photos/community-garden-paris.webp"
      ),
      cards("Nos engagements", "TVF avance avec prudence et exigence.", [
        ["Clarté", "Ne pas annoncer de chiffres d'impact tant qu'ils ne sont pas mesurés."],
        ["Traçabilité", "Documenter les décisions, conventions, ressources et projets."],
        ["Complémentarité", "Aider les acteurs existants sans se substituer à eux."],
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
      tableSection("De l'idée à l'action", "Chaque action doit pouvoir être comprise, instruite et suivie.", [
        ["Sujet", "Ce que TVF prépare", "Résultat attendu"],
        ["Bien vacant", "Diagnostic, propriétaire, contraintes, usage possible", "Dossier de décision"],
        ["Matériaux", "Nature, état, quantité, stockage, affectation", "Ressource orientée vers un projet validé"],
        ["Projet local", "Acteurs, budget, convention, calendrier", "Cadre de coopération partagé"],
      ]),
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
    ctas: [["Nos actions", "nos-actions.html"], ["Devenir partenaire", "partenaires.html"]],
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
      tableSection("Qualité des données", "L'observatoire doit distinguer signalement, vérification et décision.", [
        ["Niveau", "Statut", "Usage"],
        ["Signalé", "Information reçue", "À vérifier"],
        ["Qualifié", "Adresse, type, état et contraintes documentés", "À instruire"],
        ["Orienté", "Acteurs identifiés et piste d'usage crédible", "À conventionner"],
      ]),
      textBlock(
        "Responsabilité",
        "L'observatoire n'a pas vocation à stigmatiser des propriétaires. Il sert à créer les conditions d'une solution avec des données vérifiées, des démarches respectueuses et un cadre de dialogue."
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
      tableSection("Premiers travaux à cadrer", "Le pilote doit avancer par dossiers courts, vérifiables et utiles.", [
        ["Dossier", "Objectif", "Livrable"],
        ["Habitat vacant", "Comprendre les blocages propriétaires", "Fiche de qualification"],
        ["Commerce fermé", "Identifier des usages réalistes", "Scénario d'occupation"],
        ["Matériaux", "Tester une chaîne de réemploi", "Registre de ressources"],
      ]),
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
        ["Je suis une collectivité", "Préparer un diagnostic, une coopération ou une expérimentation territoriale.", "#collectivite"],
        ["Je suis propriétaire", "Proposer un logement, commerce, bâtiment ou terrain inutilisé.", "#proprietaire"],
        ["Je suis une entreprise", "Valoriser matériaux, compétences, locaux ou mécénat.", "#entreprise"],
        ["Je suis bénévole", "Participer à une mission, un chantier ou une action locale.", "#citoyen"],
        ["Je souhaite financer", "Soutenir un projet avec un cadre de suivi et de transparence.", "partenaires.html"],
      ]),
      audienceSection(),
      formSection(),
    ],
  },

  {
    file: "collectivites.html",
    title: "Collectivit?s",
    meta:
      "Parcours collectivit?s de Territoires Vivants France : diagnostic, coop?ration, exp?rimentation territoriale et suivi.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Collectivit?s",
    h1: "Un cadre simple pour devenir territoire partenaire.",
    intro:
      "TVF aide les collectivit?s ? passer d'un besoin local ? une d?marche cadr?e : rep?rage, diagnostic, acteurs, convention, suivi et indicateurs.",
    ctas: [["Pr?parer une fiche", "documents/fiche-collectivite.md"], ["Nous contacter", "contact.html"]],
    sections: [
      cards("Ce que TVF peut apporter", "Un appui m?thodologique avant toute action op?rationnelle.", [
        ["Diagnostic", "Structurer les premiers constats sur les biens, commerces, friches ou mat?riaux."],
        ["Coordination", "Identifier les acteurs ? r?unir et clarifier leurs r?les."],
        ["Convention", "Pr?parer un cadre de coop?ration lisible et adapt? au territoire."],
        ["Suivi", "D?finir des indicateurs avant de communiquer des r?sultats."],
      ]),
      tableSection("Parcours collectivit?", "Le parcours doit rester compatible avec les proc?dures publiques.", [
        ["?tape", "Objectif", "Livrable"],
        ["Cadrage", "Comprendre le besoin et le p?rim?tre", "Fiche collectivit?"],
        ["Diagnostic", "Qualifier les biens, ressources et acteurs", "Note de situation"],
        ["Coop?ration", "D?finir les responsabilit?s", "Convention"],
        ["Suivi", "Documenter les effets", "Grille d'impact"],
      ]),
      textBlock("Point de vigilance", "TVF n'agit pas ? la place de la collectivit?. L'association propose un cadre de coop?ration qui doit respecter les comp?tences, les d?cisions et les proc?dures publiques."),
    ],
  },
  {
    file: "proprietaires.html",
    title: "Propri?taires",
    meta:
      "Parcours propri?taires TVF : proposer un bien vacant, d?grad? ou inutilis? et pr?parer un cadre de coop?ration.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Propri?taires",
    h1: "Proposer un bien sans perdre le cadre.",
    intro:
      "Un propri?taire peut pr?senter un logement, commerce, b?timent ou terrain inutilis?. TVF ?tudie ensuite les usages possibles, les contraintes et les conditions d'une convention.",
    ctas: [["Remplir la fiche", "documents/fiche-proprietaire.md"], ["Nous contacter", "contact.html"]],
    sections: [
      cards("Ce qui peut ?tre ?tudi?", "Chaque bien doit ?tre qualifi? avant d'imaginer un usage.", [
        ["Logement", "Vacant, d?grad?, sous-utilis? ou difficile ? remettre en ?tat."],
        ["Commerce", "Cellule ferm?e, local inoccup?, rez-de-chauss?e ? r?activer."],
        ["B?timent", "Immeuble, atelier, ?quipement ou local sans usage clair."],
        ["Terrain", "Espace d?laiss? pouvant accueillir un usage collectif ou transitoire."],
      ]),
      tableSection("Points ? v?rifier", "Un projet s?rieux commence par les contraintes.", [
        ["Sujet", "Question", "Document utile"],
        ["Propri?t?", "Qui peut autoriser l'usage ?", "Justificatif ou accord"],
        ["?tat", "Le bien est-il accessible et s?curis? ?", "Photos, diagnostics"],
        ["Usage", "Quel usage est r?aliste ?", "Fiche projet"],
        ["Dur?e", "Quelle dur?e de coop?ration est acceptable ?", "Convention"],
      ]),
      textBlock("Principe", "Le propri?taire conserve ses droits. Toute intervention doit ?tre encadr?e par un accord clair, pr?cisant les usages, la dur?e, les responsabilit?s et les limites."),
    ],
  },
  {
    file: "entreprises.html",
    title: "Entreprises",
    meta:
      "Parcours entreprises TVF : mat?riaux, comp?tences, locaux, m?c?nat, RSE et contribution territoriale.",
    heroImage: "assets/photos/france-ressourcerie-vichy.jpg",
    eyebrow: "Entreprises",
    h1: "Transformer une contribution en impact territorial.",
    intro:
      "Les entreprises peuvent contribuer par des mat?riaux, comp?tences, locaux, logistique ou m?c?nat. TVF aide ? relier ces contributions ? des projets cadr?s et tra?ables.",
    ctas: [["Remplir la fiche", "documents/fiche-entreprise.md"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      cards("Formes de contribution", "Chaque contribution doit ?tre d?crite, localis?e et affect?e ? un besoin valid?.", [
        ["Mat?riaux", "Surplus, invendus, ?l?ments de chantier ou ?quipements r?utilisables."],
        ["Comp?tences", "Expertise technique, juridique, logistique, architecturale ou financi?re."],
        ["Locaux", "Espaces temporairement disponibles ou ? remettre en usage."],
        ["M?c?nat", "Soutien financier ou en nature avec tra?abilit?."],
      ]),
      tableSection("B?n?fices pour l'entreprise", "Le partenariat doit ?tre utile au territoire et clair pour l'entreprise.", [
        ["B?n?fice", "Description", "Preuve"],
        ["RSE", "Contribution concr?te ? l'?conomie circulaire et locale", "Fiche contribution"],
        ["Tra?abilit?", "Suivi de l'affectation des ressources", "Registre ou convention"],
        ["Ancrage local", "Participation ? un projet du territoire", "Compte rendu"],
        ["Communication", "Valorisation possible apr?s accord", "Validation commune"],
      ]),
      textBlock("Ce que TVF refuse", "TVF n'est pas une d?chetterie ni une plateforme de d?stockage libre. Les contributions doivent ?tre r?utilisables, utiles et compatibles avec un projet valid?."),
    ],
  },
  {
    file: "partenaires.html",
    title: "Partenaires",
    meta:
      "Devenir partenaire de Territoires Vivants France : collectivités, entreprises, associations, propriétaires, mécènes et financeurs.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Coopération",
    h1: "Construire des partenariats utiles et traçables.",
    intro:
      "TVF ne publie pas de faux partenaires. Cette page présente les formes de coopération possibles et le cadre attendu avant toute officialisation.",
    ctas: [["Présenter une coopération", "contact.html"], ["Voir les documents", "documents.html"]],
    sections: [
      cards("Qui peut coopérer avec TVF ?", "Chaque partenariat doit avoir un objectif, des responsabilités et des preuves.", [
        ["Collectivités", "Diagnostic, mise à disposition d'informations, expérimentation locale, animation territoriale."],
        ["Entreprises", "Dons de matériaux, compétences, mécénat, locaux, logistique ou expertise technique."],
        ["Associations", "Besoins locaux, bénévolat, usage futur, relais habitants, actions solidaires."],
        ["Propriétaires", "Signalement de biens, convention d'usage, projet de remise en activité."],
        ["Financeurs", "Soutien à des dossiers instruits, reporting, indicateurs et transparence."],
      ]),
      tableSection("Cadre de partenariat", "Un partenariat sérieux se formalise avant communication publique.", [
        ["Étape", "Contenu", "Preuve attendue"],
        ["Intention", "Échange sur le besoin, le territoire et le rôle possible", "Compte rendu"],
        ["Instruction", "Vérification juridique, technique, financière et opérationnelle", "Fiche projet"],
        ["Convention", "Responsabilités, durée, usages, suivi et communication", "Document signé"],
        ["Suivi", "Indicateurs, retours d'expérience et preuves d'action", "Tableau de bord"],
      ]),
    ],
  },
  {
    file: "documents.html",
    title: "Documents",
    meta:
      "Documents préparatoires de Territoires Vivants France : fiches collectivité, propriétaire, entreprise et modèle de convention.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Ressources",
    h1: "Des documents simples pour cadrer les premières démarches.",
    intro:
      "Ces documents sont des bases de travail modifiables. Ils aident à préparer un échange sans se substituer à un conseil juridique ou technique.",
    ctas: [["Contacter TVF", "contact.html"], ["Voir la transparence", "transparence.html"]],
    sections: [
      cards("Documents disponibles", "Chaque modèle aide à collecter les informations nécessaires avant instruction.", [
        ["Fiche collectivité", "Qualifier un besoin territorial, un périmètre, des ressources et des interlocuteurs.", "documents/fiche-collectivite.md"],
        ["Fiche propriétaire", "Présenter un bien, son état, ses contraintes et les usages envisageables.", "documents/fiche-proprietaire.md"],
        ["Fiche entreprise", "Décrire des matériaux, compétences, locaux ou contributions possibles.", "documents/fiche-entreprise.md"],
        ["Fiche projet", "Cadrer un projet territorial, son usage, ses acteurs, ses risques et ses livrables.", "documents/fiche-projet.md"],
        ["Dossier TVF", "Présenter l'association, sa méthode, ses publics et ses conditions de coopération.", "documents/dossier-presentation-tvf.md"],
        ["Modèle de convention", "Préparer les clauses de coopération à adapter avec les parties concernées.", "documents/modele-convention.md"],
        ["Grille d'impact", "Suivre les indicateurs sans inventer de chiffres ni de résultats.", "documents/grille-impact.md"],
      ]),
      textBlock(
        "À utiliser avec prudence",
        "Ces documents sont volontairement préparatoires. Avant signature ou engagement, chaque projet doit être relu, adapté au contexte et validé par les personnes compétentes."
      ),
    ],
  },
  {
    file: "faq.html",
    title: "FAQ",
    meta:
      "Questions fréquentes sur Territoires Vivants France, ses démarches, ses publics, ses conventions et ses documents.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Questions fréquentes",
    h1: "Comprendre TVF en quelques réponses.",
    intro:
      "Cette FAQ clarifie le rôle de l'association, les étapes d'une démarche, les documents à préparer et les limites de cette première version.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Nous contacter", "contact.html"]],
    sections: [
      faqSection([
        ["TVF est-elle déjà une plateforme opérationnelle complète ?", "Non. TVF repart sur une base claire et progressive. Le site présente le cadre, les parcours et les documents préparatoires avant une montée en charge opérationnelle."],
        ["TVF remplace-t-elle les collectivités ou dispositifs publics ?", "Non. TVF se positionne comme un outil de coopération et de coordination. L'association aide à cadrer les besoins, réunir les acteurs et documenter les projets."],
        ["Un propriétaire peut-il proposer un bien ?", "Oui. Il peut présenter un logement, un commerce, un bâtiment ou un terrain inutilisé. TVF étudie ensuite l'état du bien, les contraintes et les usages envisageables."],
        ["Les matériaux sont-ils distribués gratuitement ?", "Non. Les matériaux doivent être orientés vers des projets validés. TVF privilégie la traçabilité, l'utilité territoriale et l'affectation cohérente des ressources."],
        ["Une collectivité peut-elle devenir territoire partenaire ?", "Oui, après un échange de cadrage. Les objectifs, responsabilités, données disponibles et modalités de coopération doivent être formalisés."],
        ["Les chiffres d'impact sont-ils déjà affichés ?", "Non. TVF ne communique pas de résultats non mesurés. Les indicateurs seront publiés lorsqu'ils seront vérifiés et documentés."],
      ]),
    ],
  },
  {
    file: "notre-methode.html",
    title: "Notre méthode",
    meta:
      "La méthode TVF pour repérer, qualifier, conventionner, mobiliser et suivre les projets de revitalisation territoriale.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Méthode",
    h1: "Une méthode courte, traçable et progressive.",
    intro:
      "TVF avance par étapes pour éviter les promesses floues : comprendre la situation, vérifier les contraintes, réunir les acteurs, formaliser les engagements et suivre ce qui est réellement fait.",
    ctas: [["Préparer un dossier", "documents.html"], ["Nous contacter", "contact.html"]],
    sections: [
      timeline("Les six étapes", [
        ["1", "Repérer", "Identifier un bien, un besoin, une ressource ou une opportunité territoriale."],
        ["2", "Qualifier", "Documenter l'adresse, l'état, les usages possibles, les contraintes et les acteurs concernés."],
        ["3", "Prioriser", "Vérifier si le projet répond à un besoin local réel et si les conditions minimales sont réunies."],
        ["4", "Conventionner", "Formaliser les responsabilités, la durée, les usages, la communication et le suivi."],
        ["5", "Mobiliser", "Rechercher les compétences, matériaux, bénévoles, partenaires et financements nécessaires."],
        ["6", "Suivre", "Documenter les actions, les décisions, les indicateurs et les retours d'expérience."],
      ]),
      tableSection("Critères de décision", "Un projet TVF doit être utile, faisable et traçable.", [
        ["Critère", "Question posée", "Preuve attendue"],
        ["Utilité", "Le projet répond-il à un besoin territorial clair ?", "Besoin décrit, public concerné, usage envisagé"],
        ["Faisabilité", "Les contraintes sont-elles identifiées ?", "État du bien, accès, sécurité, propriété, budget"],
        ["Coopération", "Les acteurs nécessaires sont-ils mobilisables ?", "Référents, contacts, rôle de chaque partie"],
        ["Traçabilité", "Le projet peut-il être documenté ?", "Fiche projet, convention, indicateurs, compte rendu"],
      ]),
      cards("Ce que la méthode évite", "La méthode sert aussi à protéger le projet.", [
        ["Annonces prématurées", "Ne pas présenter un projet comme acquis tant qu'il n'est pas cadré."],
        ["Flou juridique", "Identifier les responsabilités avant toute action."],
        ["Ressources dispersées", "Affecter les matériaux et contributions à des besoins validés."],
        ["Impact non mesuré", "Distinguer clairement objectifs, actions et résultats."],
      ]),
    ],
  },
  {
    file: "impact.html",
    title: "Impact & suivi",
    meta:
      "La page Impact de TVF présente les indicateurs à suivre sans chiffres inventés : biens remis en usage, matériaux réemployés, projets accompagnés et coopération territoriale.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Impact",
    h1: "Mesurer avant d'annoncer.",
    intro:
      "TVF ne publie pas de chiffres fictifs. Cette page présente les indicateurs qui devront être suivis lorsque les premiers projets seront réellement instruits, conventionnés puis réalisés.",
    ctas: [["Voir la transparence", "transparence.html"], ["Télécharger la grille", "documents/grille-impact.md"]],
    sections: [
      cards("Indicateurs à suivre", "Les chiffres seront publiés uniquement lorsqu'ils seront vérifiés.", [
        ["Biens qualifiés", "Nombre de logements, commerces, bâtiments, terrains ou friches documentés."],
        ["Biens remis en usage", "Nombre de biens effectivement réactivés après convention et action."],
        ["Matériaux orientés", "Nature, quantité, état et destination des matériaux réemployables."],
        ["Acteurs mobilisés", "Collectivités, propriétaires, entreprises, associations et bénévoles impliqués."],
        ["Projets conventionnés", "Nombre de dossiers disposant d'un cadre signé et d'un suivi."],
        ["Bénéficiaires", "Publics ou usages rendus possibles par le projet."],
      ]),
      tableSection("Lecture des résultats", "Chaque indicateur doit être replacé dans son niveau de preuve.", [
        ["Niveau", "Ce que cela signifie", "Communication possible"],
        ["Objectif", "Ce que TVF souhaite atteindre", "À présenter comme intention"],
        ["Instruction", "Dossier en cours d'analyse", "À présenter comme étude"],
        ["Convention", "Engagement formalisé", "À présenter comme projet cadré"],
        ["Réalisation", "Action terminée et documentée", "À présenter comme résultat"],
      ]),
      textBlock(
        "Pourquoi cette prudence ?",
        "La crédibilité d'une association nationale repose sur la preuve. Un chiffre non vérifié peut fragiliser la confiance des collectivités, propriétaires, financeurs et habitants. TVF préfère publier moins, mais publier juste."
      ),
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
      "TVF distingue clairement ce qui est établi, ce qui est en cours de structuration et ce qui devra être validé par convention, données ou partenariats réels.",
    ctas: [["Documents", "documents.html"], ["Contact", "contact.html"]],
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
    sections: [legalSection()],
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

function tableSection(title, intro, rows) {
  const [head, ...body] = rows;
  return `<section class="section"><div class="container"><div class="section-head"><p class="section-kicker">Cadre</p><h2>${title}</h2><p>${intro}</p></div><div class="table-wrap"><table><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div></div></section>`;
}

function faqSection(items) {
  return `<section class="section soft"><div class="container"><div class="section-head"><p class="section-kicker">FAQ</p><h2>Questions fréquentes</h2><p>Des réponses courtes pour comprendre le cadre TVF sans jargon.</p></div><div class="faq-list">${items
    .map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`)
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

function audienceSection() {
  return `<section class="section"><div class="container audience-grid"><article id="collectivite"><h2>Collectivité</h2><p>TVF peut aider à préparer un diagnostic, identifier des biens ou ressources et structurer une expérimentation locale. La coopération doit rester compatible avec les compétences, politiques publiques et procédures de la collectivité.</p></article><article id="proprietaire"><h2>Propriétaire</h2><p>Un propriétaire peut présenter un bien vacant ou dégradé. TVF étudie alors l'état du bien, les contraintes, les usages possibles et les conditions d'une convention adaptée.</p></article><article id="entreprise"><h2>Entreprise</h2><p>Une entreprise peut contribuer par des matériaux, du mécénat, des compétences, des locaux ou de la logistique. La contribution doit être tracée et orientée vers un projet validé.</p></article><article id="citoyen"><h2>Citoyen ou bénévole</h2><p>Un habitant peut signaler une situation, rejoindre une mission, participer à un chantier encadré ou relayer les besoins de son territoire.</p></article></div></section>`;
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
  if (t.includes("logement") || t.includes("habitat") || t.includes("propri")) return "H";
  if (t.includes("commerce")) return "C";
  if (t.includes("mat")) return "R";
  if (t.includes("friche") || t.includes("terrain")) return "F";
  if (t.includes("solid") || t.includes("béné") || t.includes("citoy")) return "S";
  if (t.includes("collect")) return "T";
  if (t.includes("entreprise")) return "E";
  if (t.includes("finance")) return "€";
  return "TVF";
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
    <section class="cta-band">
      <div class="container cta-band-inner">
        <div>
          <p class="section-kicker">Passer à l'étape suivante</p>
          <h2>Vous avez un bien, une ressource ou un besoin territorial ?</h2>
          <p>Présentez la situation à TVF pour préparer un premier échange clair et utile.</p>
        </div>
        <div class="cta-band-actions">
          <a class="btn primary" href="agir-avec-nous.html">Agir avec nous</a>
          <a class="btn secondary" href="contact.html">Nous contacter</a>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div><span class="footer-logo-box"><img src="assets/logo-tvf-officiel-transparent.png" alt="Territoires Vivants France" class="footer-logo"></span><p>Plateforme nationale de coopération pour redonner vie aux biens, lieux et ressources inutilisés.</p></div>
      <div><h2>Navigation</h2>${nav.slice(0, 7).map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div>
      <div><h2>Ressources</h2><a href="notre-methode.html">Notre méthode</a><a href="impact.html">Impact</a><a href="documents.html">Documents</a><a href="faq.html">FAQ</a><a href="transparence.html">Transparence</a><a href="mentions-legales.html">Mentions légales</a><a href="contact.html">Contact</a></div>
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
