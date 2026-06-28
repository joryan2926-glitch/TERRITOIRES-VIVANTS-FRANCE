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
    h1: "Transformer les lieux inutilisés en solutions concrètes.",
    intro:
      "TVF agit sur les logements vacants, commerces fermés, friches, terrains, matériaux et besoins locaux en construisant des parcours simples : repérer, qualifier, mobiliser, conventionner, réaliser et suivre.",
    ctas: [["Agir avec nous", "agir-avec-nous.html"], ["Voir les pôles", "nos-poles.html"]],
    sections: [
      sectionIntro(
        "Une action TVF commence toujours par un besoin réel",
        "L'objectif n'est pas d'empiler des projets, mais de transformer une situation bloquée en démarche compréhensible : qui possède le bien, quel usage serait utile, quelles ressources existent, quelles responsabilités doivent être écrites et quelles preuves permettront de suivre l'action.",
        [
          ["Un lieu", "Logement vacant, commerce fermé, bâtiment inutilisé, friche ou terrain délaissé."],
          ["Une ressource", "Matériaux, mobilier, compétences, locaux, temps bénévole ou financement."],
          ["Un usage", "Logement, activité économique, lieu associatif, espace vert, atelier, formation ou service local."],
        ]
      ),
      cards("Huit leviers opérationnels", "Chaque action correspond à un besoin lisible pour les habitants, les propriétaires, les entreprises et les collectivités.", [
        ["Logements vacants", "Identifier, qualifier et accompagner les conditions de remise en usage de logements aujourd'hui inutilisés.", "proprietaires.html"],
        ["Commerces inoccupés", "Étudier les cellules fermées et préparer des usages réalistes : commerce, atelier, association, service ou activité temporaire."],
        ["Matériaux de réemploi", "Repérer, trier et affecter des matériaux encore utiles à des projets validés, sans distribution automatique."],
        ["Friches et terrains", "Analyser des espaces délaissés et préparer leur reconversion vers des usages verts, sociaux, économiques ou pédagogiques."],
        ["Solidarité et insertion", "Construire des missions encadrées pour bénévoles, habitants, publics en insertion et partenaires associatifs.", "benevoles-citoyens.html"],
        ["Territoires partenaires", "Aider une commune ou un EPCI à cadrer un diagnostic, une expérimentation ou une coopération locale.", "collectivites.html"],
        ["Financer les projets", "Préparer des budgets, cofinancements et dossiers lisibles pour mécènes, fondations et financeurs.", "financeurs-mecenes.html"],
        ["Observatoire", "Organiser les signalements, données, sources et priorités pour décider où agir en premier.", "observatoire.html"],
      ]),
      tableSection("Ce que chaque action produit", "TVF doit toujours produire un livrable clair, même lorsque le projet n'est pas encore lancé.", [
        ["Action", "Problème traité", "Ce que TVF prépare", "Sortie concrète"],
        ["Logement vacant", "Bien inutilisé, propriétaire isolé, contraintes mal connues", "Fiche propriétaire, visite, scénarios d'usage, risques", "Dossier de décision"],
        ["Commerce fermé", "Vitrine inactive, rez-de-chaussée sans usage, besoin local", "Analyse d'usage, acteurs économiques, contraintes d'accès", "Scénario de réactivation"],
        ["Matériaux", "Ressources jetées ou stockées sans destination", "Bordereau, tri, état, quantité, affectation possible", "Registre de réemploi"],
        ["Friche ou terrain", "Espace délaissé, manque d'usage, risque de dégradation", "Qualification, sécurité, accès, usages compatibles", "Note d'opportunité"],
        ["Action solidaire", "Besoin d'engagement citoyen ou d'insertion", "Mission, encadrement, sécurité, feuille d'émargement", "Action documentée"],
      ]),
      split(
        "La Banque de matériaux est un outil de projet",
        "Les matériaux proposés à TVF ne sont pas distribués librement. Ils sont qualifiés, tracés puis orientés vers des besoins utiles : remise en état d'un local associatif, aménagement d'un lieu partagé, soutien à un chantier encadré ou expérimentation territoriale. Cette logique protège les contributeurs et garantit que chaque ressource garde une utilité collective.",
        "assets/photos/france-ressourcerie-vichy.jpg"
      ),
      timeline("Méthode d'intervention", [
        ["1", "Recevoir", "Une demande, un signalement ou une contribution est enregistré avec un numéro de dossier."],
        ["2", "Qualifier", "Le besoin, le bien, la ressource, les risques et les pièces manquantes sont analysés."],
        ["3", "Orienter", "TVF décide de compléter, visiter, instruire, réorienter ou classer le dossier."],
        ["4", "Mobiliser", "Les acteurs utiles sont identifiés : propriétaire, collectivité, entreprise, association, financeur ou bénévole."],
        ["5", "Formaliser", "Les engagements, usages, responsabilités, budgets et limites sont écrits avant action."],
        ["6", "Suivre", "Le projet est documenté avec indicateurs, photos autorisées, comptes rendus et reporting."],
      ]),
      cards("À qui s'adressent les actions ?", "Chaque public doit comprendre immédiatement où il intervient dans la chaîne de revitalisation.", [
        ["Collectivités", "Diagnostiquer, prioriser et structurer une coopération territoriale.", "collectivites.html"],
        ["Propriétaires", "Étudier un bien vacant sans perdre la propriété ni s'engager prématurément.", "proprietaires.html"],
        ["Entreprises", "Valoriser matériaux, locaux, compétences ou mécénat dans un cadre traçable.", "entreprises.html"],
        ["Associations", "Exprimer un besoin de local, d'équipement, de bénévolat ou d'appui projet.", "partenaires.html"],
        ["Bénévoles", "Participer à des missions utiles, encadrées et documentées.", "benevoles-citoyens.html"],
        ["Financeurs", "Soutenir des dossiers instruits avec budget, suivi et reporting.", "financeurs-mecenes.html"],
      ]),
      faqSection([
        ["TVF réalise-t-elle directement les travaux ?", "TVF prépare, coordonne et documente les projets. Les travaux nécessitent un cadre adapté, des compétences, des assurances et des responsabilités clairement définies."],
        ["Un signalement devient-il automatiquement un projet ?", "Non. Un signalement déclenche une phase de qualification. Il peut être complété, orienté, classé ou transformé en dossier seulement si les conditions sont réunies."],
        ["Les matériaux sont-ils gratuits ?", "Non. La matériauthèque TVF est un outil de valorisation territoriale : les ressources sont affectées à des projets validés, selon leur état, leur utilité et leur traçabilité."],
        ["Quand les chiffres d'impact seront-ils publiés ?", "Lorsque des projets seront réellement instruits, conventionnés, réalisés puis mesurés. TVF ne publie pas de résultats non vérifiés."],
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
      "Les pôles structurent l'action de TVF : repérer un lieu ou une ressource, comprendre le besoin, mobiliser les bons acteurs, préparer un cadre écrit et suivre le retour à l'usage.",
    ctas: [["Nos actions", "nos-actions.html"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Une organisation lisible pour passer de l'idée au terrain",
        "Les pôles ne sont pas des silos. Ils permettent de répartir les responsabilités, de clarifier les sujets à traiter et d'éviter qu'un projet reste bloqué parce qu'il manque un propriétaire, un usage, des matériaux, une collectivité, un financement ou une équipe locale.",
        [
          ["Repérer", "Identifier les logements, commerces, friches, terrains, matériaux et besoins associatifs."],
          ["Assembler", "Relier le bon pôle principal aux pôles complémentaires selon la nature du projet."],
          ["Suivre", "Documenter la décision, les conventions, les ressources mobilisées et les résultats mesurables."],
        ]
      ),
      cards("Les pôles TVF", "Chaque pôle apporte une compétence précise au service d'un même objectif : remettre en usage ce qui peut redevenir utile.", [
        ["Habitat Vivant", "Logements vacants, habitat dégradé, propriétaires, occupation temporaire, usages solidaires.", "proprietaires.html"],
        ["Matériauthèque Solidaire", "Matériaux réemployables, collecte, diagnostic, stockage, affectation à des projets validés.", "entreprises.html"],
        ["Commerce Vivant", "Locaux fermés, vitrines inactives, artisans, services de proximité et usages temporaires."],
        ["Friches & Terrains Vivants", "Terrains délaissés, espaces verts, jardins partagés, biodiversité et nouveaux usages collectifs."],
        ["Solidarité & Insertion", "Bénévolat, missions encadrées, formation, participation citoyenne et inclusion.", "benevoles-citoyens.html"],
      ]),
      tableSection("Rôle détaillé de chaque pôle", "Chaque pôle doit produire des informations utiles à la décision, pas seulement une intention.", [
        ["Pôle", "Pourquoi il existe", "Missions principales", "Livrables possibles"],
        ["Habitat Vivant", "Des biens restent inutilisés alors que les besoins locaux existent", "Qualifier le bien, dialoguer avec le propriétaire, étudier les usages", "Fiche propriétaire, scénarios, accord de principe"],
        ["Matériauthèque Solidaire", "Des ressources encore utiles sortent des circuits de projet", "Recenser, trier, sécuriser et affecter les matériaux", "Bordereau, registre, PV de remise"],
        ["Commerce Vivant", "Des locaux fermés fragilisent les rues et les centres-villes", "Comprendre le local, tester des usages, relier porteurs et acteurs locaux", "Fiche local, scénario d'usage, convention"],
        ["Friches & Terrains Vivants", "Des espaces délaissés peuvent devenir utiles au cadre de vie", "Qualifier l'accès, les risques, les usages verts ou partagés", "Audit terrain, note d'opportunité, plan d'action"],
        ["Solidarité & Insertion", "Les projets locaux peuvent créer de l'engagement et des parcours", "Cadrer les missions, encadrer les actions, suivre la participation", "Fiche mission, émargement, compte rendu"],
      ]),
      split(
        "Habitat Vivant",
        "Ce pôle s'adresse d'abord aux propriétaires, collectivités et habitants confrontés à des logements vacants, dégradés ou sans usage clair. TVF ne promet pas une rénovation immédiate : l'objectif est de qualifier le bien, comprendre les contraintes, identifier les usages réalistes et préparer un cadre de coopération.",
        "assets/photos/france-saint-etienne-jean-jaures.jpg"
      ),
      split(
        "Matériauthèque Solidaire",
        "Ce pôle transforme les matériaux disponibles en ressources de projet. Une porte, du bois, du carrelage, du mobilier ou un équipement technique ne sont utiles que s'ils sont identifiés, stockables, sécurisés et affectés à un usage concret.",
        "assets/photos/france-ressourcerie-vichy.jpg"
      ),
      split(
        "Commerce Vivant",
        "Ce pôle travaille sur les vitrines fermées, locaux vacants et rez-de-chaussée sans activité. L'objectif est de préparer des usages réalistes : activité de proximité, artisanat, association, atelier, service, occupation temporaire ou expérimentation locale.",
        "assets/photos/france-commerce-paris.jpg"
      ),
      split(
        "Friches & Terrains Vivants",
        "Ce pôle regarde les espaces délaissés comme des réserves d'usage possible : jardin partagé, espace pédagogique, lieu associatif, biodiversité, équipement temporaire ou projet territorial. La sécurité, l'accès et la propriété restent toujours les premiers points à vérifier.",
        "assets/photos/france-friche-pcuk.jpg"
      ),
      split(
        "Solidarité & Insertion",
        "Ce pôle permet aux habitants, bénévoles, associations et publics accompagnés de participer à des actions utiles sans improvisation. Les missions doivent être claires, encadrées, sécurisées et documentées.",
        "assets/photos/community-garden-paris.webp"
      ),
      split(
        "Une logique de coopération",
        "Un même projet peut mobiliser plusieurs pôles. Un logement vacant peut nécessiter des matériaux de réemploi, une convention avec un propriétaire, un appui de collectivité, un chantier encadré et un suivi d'impact. TVF sert à organiser cette coordination étape par étape.",
        "assets/photos/france-saint-etienne-chateaucreux.jpg"
      ),
      timeline("Comment les pôles travaillent ensemble", [
        ["1", "Repérage", "Un lieu, une ressource ou un besoin est identifié."],
        ["2", "Pôle principal", "TVF choisit le pôle qui porte l'analyse principale."],
        ["3", "Pôles associés", "Les autres pôles complètent : matériaux, insertion, commerce, friche ou habitat."],
        ["4", "Cadre écrit", "Convention, autorisation, budget, sécurité et responsabilités sont préparés."],
        ["5", "Action suivie", "Les résultats ne sont publiés qu'après réalisation et vérification."],
      ]),
      faqSection([
        ["Pourquoi organiser TVF en pôles ?", "Les pôles rendent la méthode lisible. Ils permettent de traiter séparément l'habitat, les commerces, les friches, les matériaux et l'engagement humain, tout en les reliant dans un même projet."],
        ["Un projet peut-il relever de plusieurs pôles ?", "Oui. C'est même fréquent : un bâtiment vacant peut mobiliser Habitat Vivant, Matériauthèque Solidaire, Solidarité & Insertion et parfois Commerce Vivant."],
        ["Qui décide du pôle principal ?", "TVF l'identifie après qualification du besoin, des contraintes, des acteurs et de l'usage envisagé."],
        ["Les pôles correspondent-ils à des résultats déjà obtenus ?", "Non. Ils structurent la méthode et les futurs dossiers. Les résultats seront communiqués uniquement lorsqu'ils seront vérifiés."],
      ]),
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
      sectionIntro(
        "Un observatoire pour décider avec méthode",
        "L'observatoire TVF n'est pas une carte décorative. Il doit servir à transformer des informations dispersées en dossiers exploitables : signalements citoyens, données publiques, visites autorisées, photos, contraintes, priorités et suites possibles.",
        [
          ["Centraliser", "Regrouper les informations utiles sans exposer de données sensibles."],
          ["Qualifier", "Distinguer une intuition, un signalement, une donnée vérifiée et un dossier orienté."],
          ["Prioriser", "Aider les territoires à concentrer leurs efforts sur les situations les plus utiles et faisables."],
        ]
      ),
      cards("Ce que l'observatoire suit", "Les catégories sont volontairement simples.", [
        ["Logements vacants", "Biens inutilisés ou dégradés à qualifier avec prudence."],
        ["Commerces fermés", "Cellules commerciales sans activité visible."],
        ["Bâtiments abandonnés", "Immeubles ou équipements sans usage identifié."],
        ["Friches et terrains", "Espaces délaissés pouvant accueillir un projet utile."],
        ["Matériaux disponibles", "Ressources réemployables proposées ou identifiées."],
      ]),
      tableSection("Sources à croiser", "Une donnée isolée ne suffit pas. TVF doit croiser plusieurs niveaux d'information avant de prioriser.", [
        ["Source", "Ce qu'elle apporte", "Précaution"],
        ["Données publiques", "Contexte démographique, habitat, économie locale, environnement", "Citer la source et la date de consultation"],
        ["Signalement citoyen", "Information de terrain rapide sur un lieu ou une ressource", "À vérifier avant toute conclusion"],
        ["Collectivité", "Périmètre, priorités, programmes, contraintes publiques", "Respecter les procédures et validations"],
        ["Propriétaire", "Droit d'accès, intention, état connu, usage acceptable", "Ne rien publier sans accord"],
        ["Visite autorisée", "État apparent, accès, risques, photos internes", "Ne vaut pas diagnostic technique complet"],
      ]),
      tableSection("Qualité des données", "L'observatoire doit distinguer signalement, vérification et décision.", [
        ["Niveau", "Statut", "Usage"],
        ["Signalé", "Information reçue", "À vérifier"],
        ["Qualifié", "Adresse, type, état et contraintes documentés", "À instruire"],
        ["Orienté", "Acteurs identifiés et piste d'usage crédible", "À conventionner"],
      ]),
      timeline("Cycle d'un signalement", [
        ["1", "Réception", "Le lieu ou la ressource est enregistré avec une description minimale."],
        ["2", "Protection", "Les données personnelles, photos sensibles et informations privées sont limitées."],
        ["3", "Qualification", "TVF vérifie le type de bien, la localisation, l'état apparent et les sources disponibles."],
        ["4", "Orientation", "Le dossier est classé : à compléter, à visiter, à instruire, à réorienter ou sans suite."],
        ["5", "Suivi", "Les décisions et livrables sont archivés pour éviter les doublons et les annonces imprécises."],
      ]),
      cards("Indicateurs à suivre", "Les indicateurs doivent être remplis seulement avec des données vérifiables.", [
        ["Biens signalés", "Nombre de logements, commerces, bâtiments, friches ou terrains reçus dans le registre."],
        ["Dossiers qualifiés", "Part des signalements disposant d'informations suffisantes pour instruction."],
        ["Ressources matériaux", "Matériaux proposés, acceptés, refusés, stockés, réservés ou affectés."],
        ["Dossiers orientés", "Situations ayant une piste d'usage, un acteur responsable ou une suite proposée."],
        ["Projets conventionnés", "Dossiers disposant d'un cadre écrit et de responsabilités définies."],
        ["Résultats vérifiés", "Effets publiés uniquement après réalisation et preuves associées."],
      ]),
      textBlock(
        "Responsabilité",
        "L'observatoire n'a pas vocation à stigmatiser des propriétaires. Il sert à créer les conditions d'une solution avec des données vérifiées, des démarches respectueuses et un cadre de dialogue."
      ),
      faqSection([
        ["Un signalement est-il publié automatiquement ?", "Non. TVF doit d'abord vérifier les informations, protéger les données sensibles et éviter toute exposition injustifiée d'un propriétaire ou d'un site."],
        ["L'observatoire remplace-t-il les données publiques ?", "Non. Il les complète par une méthode de qualification terrain, de traçabilité et d'orientation opérationnelle."],
        ["Une carte nationale peut-elle afficher tous les biens ?", "Pas sans règles strictes. Certains éléments doivent rester internes pour respecter la propriété, la sécurité, la confidentialité et la protection des données."],
      ]),
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
      sectionIntro(
        "Un territoire pilote pour tester une méthode nationale",
        "Saint-Étienne n'est pas présentée comme un résultat déjà obtenu, mais comme le premier terrain de structuration de la méthode TVF. L'objectif est de prouver qu'une démarche claire peut relier patrimoine vacant, matériaux disponibles, acteurs locaux, habitants, entreprises et collectivités.",
        [
          ["Tester", "Mettre à l'épreuve les fiches, registres, conventions et parcours utilisateurs."],
          ["Apprendre", "Documenter ce qui fonctionne, ce qui bloque et ce qui doit être adapté."],
          ["Reproduire", "Créer une méthode duplicable dans d'autres communes, EPCI et territoires."],
        ]
      ),
      cards("Axes prioritaires", "Les priorités restent à formaliser avec les acteurs locaux.", [
        ["Habitat", "Repérer les logements vacants ou dégradés et comprendre les blocages."],
        ["Commerce", "Identifier les locaux fermés et les possibilités de réactivation."],
        ["Matériaux", "Structurer une filière locale de réemploi affectée à des projets utiles."],
        ["Friches", "Analyser les espaces délaissés et leurs usages possibles."],
        ["Citoyens", "Organiser le bénévolat, les signalements et les chantiers participatifs."],
      ]),
      tableSection("Enjeux stéphanois et réponse TVF", "TVF doit se positionner comme outil de coordination, pas comme promesse de remplacement des dispositifs existants.", [
        ["Enjeu à traiter", "Réponse TVF", "Livrable attendu"],
        ["Logements ou immeubles inutilisés", "Qualifier les propriétaires, l'état, l'accès et les usages possibles", "Fiche propriétaire et scénarios"],
        ["Commerces fermés", "Comprendre le local, le besoin de rue et les porteurs potentiels", "Scénario de réactivation"],
        ["Matériaux de réemploi", "Recenser les ressources disponibles et leur destination possible", "Registre matériaux"],
        ["Friches et terrains", "Analyser sécurité, accès, propriété, usages verts ou partagés", "Audit terrain"],
        ["Engagement citoyen", "Cadrer les missions bénévoles et actions terrain", "Fiche mission et compte rendu"],
      ]),
      textBlock(
        "Pourquoi un pilote local ?",
        "Un dispositif national doit d'abord prouver sa méthode sur un territoire concret. Saint-Étienne permet de travailler sur des sujets représentatifs : reconversion, patrimoine existant, centres-villes, transition écologique, économie circulaire et solidarité."
      ),
      tableSection("Premiers travaux à cadrer", "Le pilote doit avancer par dossiers courts, vérifiables et utiles.", [
        ["Dossier", "Objectif", "Livrable", "Point de prudence"],
        ["Habitat vacant", "Comprendre les blocages propriétaires", "Fiche de qualification", "Pas d'accès sans autorisation"],
        ["Commerce fermé", "Identifier des usages réalistes", "Scénario d'occupation", "Ne pas annoncer de porteur sans accord"],
        ["Matériaux", "Tester une chaîne de réemploi", "Registre de ressources", "Refuser les matériaux dangereux ou inutilisables"],
        ["Friche ou terrain", "Étudier sécurité, propriété et usage possible", "Note d'opportunité", "Ne pas cartographier publiquement un site sensible"],
        ["Action citoyenne", "Créer une mission simple et encadrée", "Fiche mission", "Pas de chantier sans cadre sécurité"],
      ]),
      timeline("Déploiement pilote", [
        ["1", "Cadrage local", "Définir les premiers périmètres, interlocuteurs et priorités."],
        ["2", "Observation", "Recueillir signalements, données publiques, besoins et ressources disponibles."],
        ["3", "Dossiers tests", "Sélectionner quelques situations simples à instruire sans effet d'annonce."],
        ["4", "Coopérations", "Préparer les conventions, autorisations, budgets et responsabilités."],
        ["5", "Bilan", "Comparer objectifs, livrables, blocages et apprentissages avant duplication."],
      ]),
      cards("Ce que Saint-Étienne doit permettre de valider", "La réussite du pilote se mesure d'abord à la qualité de la méthode.", [
        ["Parcours propriétaire", "Peut-on passer d'un bien identifié à une décision claire et sécurisée ?"],
        ["Parcours collectivité", "Peut-on produire des livrables utiles à une décision publique ?"],
        ["Parcours entreprise", "Peut-on affecter une ressource à un projet sans confusion ni gaspillage ?"],
        ["Parcours bénévole", "Peut-on mobiliser des citoyens avec un cadre simple et sûr ?"],
        ["Parcours financeur", "Peut-on présenter un dossier lisible, chiffrable et vérifiable ?"],
      ]),
      faqSection([
        ["Saint-Étienne est-elle déjà un projet réalisé ?", "Non. La page présente un territoire pilote de méthode. Les résultats seront publiés seulement lorsqu'ils seront réellement vérifiés."],
        ["Pourquoi commencer par un territoire pilote ?", "Parce qu'un modèle national doit d'abord être testé, corrigé et documenté sur un terrain concret avant d'être reproduit ailleurs."],
        ["Que peut faire un acteur stéphanois maintenant ?", "Présenter un bien, signaler une ressource, proposer une coopération, devenir bénévole ou demander un échange de cadrage."],
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
        ["Je souhaite financer", "Soutenir un projet avec un cadre de suivi et de transparence.", "financeurs-mecenes.html"],
      ]),
      audienceSection(),
      formSection(),
    ],
  },

  {
    file: "collectivites.html",
    title: "Collectivités",
    meta:
      "Parcours collectivités de Territoires Vivants France : diagnostic, coopération, expérimentation territoriale et suivi.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Collectivités",
    h1: "Un cadre simple pour devenir territoire partenaire.",
    intro:
      "TVF aide les collectivités à passer d'un besoin local à une démarche cadrée : repérage, diagnostic, acteurs, convention, suivi et indicateurs.",
    ctas: [["Préparer une fiche", "documents/fiche-collectivite.md"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un outil d'appui pour passer du constat à l'action",
        "Une collectivité peut connaître la vacance, les locaux fermés ou les friches sans disposer du temps, des outils ou des relais pour transformer chaque situation en dossier opérationnel. TVF propose une méthode de cadrage complémentaire : qualifier, prioriser, réunir les acteurs, sécuriser les engagements et préparer le suivi.",
        [
          ["Clarifier", "Transformer un besoin territorial en périmètre de travail lisible."],
          ["Coordonner", "Faire dialoguer propriétaires, entreprises, associations, habitants et financeurs."],
          ["Documenter", "Produire des livrables utiles aux décisions publiques et aux financeurs."],
        ]
      ),
      cards("Ce que TVF peut apporter", "Un appui méthodologique avant toute action opérationnelle.", [
        ["Diagnostic", "Structurer les premiers constats sur les biens, commerces, friches ou matériaux."],
        ["Cartographie", "Préparer une lecture territoriale des lieux, ressources et besoins à qualifier."],
        ["Coordination", "Identifier les acteurs à réunir et clarifier leurs rôles."],
        ["Convention", "Préparer un cadre de coopération lisible et adapté au territoire."],
        ["Financements", "Mettre en forme les besoins, budgets et cofinancements sans annoncer de soutien non acquis."],
        ["Suivi", "Définir des indicateurs avant de communiquer des résultats."],
      ]),
      tableSection("Besoins publics et réponse TVF", "TVF aide à structurer les sujets sans se substituer à la décision publique.", [
        ["Besoin de la collectivité", "Réponse TVF", "Livrable utile"],
        ["Identifier des biens vacants", "Organiser les signalements, sources et qualifications", "Registre et fiche de qualification"],
        ["Réactiver un local ou commerce", "Étudier les usages possibles et les acteurs à mobiliser", "Scénario d'usage"],
        ["Valoriser des matériaux", "Repérer les ressources réemployables et leur destination possible", "Bordereau et registre matériaux"],
        ["Mobiliser le tissu local", "Créer un cadre de dialogue avec associations, entreprises, habitants", "Compte rendu de cadrage"],
        ["Chercher des soutiens", "Formaliser besoin, budget, impact attendu et pièces à fournir", "Plan de financement"],
      ]),
      tableSection("Parcours collectivité", "Le parcours doit rester compatible avec les procédures publiques.", [
        ["Étape", "Objectif", "Livrable"],
        ["Cadrage", "Comprendre le besoin et le périmètre", "Fiche collectivité"],
        ["Diagnostic", "Qualifier les biens, ressources et acteurs", "Note de situation"],
        ["Coopération", "Définir les responsabilités", "Convention"],
        ["Suivi", "Documenter les effets", "Grille d'impact"],
      ]),
      timeline("Devenir territoire partenaire", [
        ["1", "Premier échange", "La collectivité expose son besoin, son périmètre et les sujets prioritaires."],
        ["2", "Cadrage", "TVF identifie les données utiles, acteurs à mobiliser et contraintes de procédure."],
        ["3", "Diagnostic", "Les situations sont classées : signalées, qualifiées, orientées ou à écarter."],
        ["4", "Convention", "Le cadre de coopération précise les rôles, limites, livrables et modalités de suivi."],
        ["5", "Pilotage", "Un comité de suivi documente les décisions, les suites et les indicateurs."],
      ]),
      textBlock("Point de vigilance", "TVF n'agit pas à la place de la collectivité. L'association propose un cadre de coopération qui doit respecter les compétences, les décisions, les procédures publiques, les règles de communication et la protection des données."),
      faqSection([
        ["Une collectivité doit-elle déjà avoir un projet identifié ?", "Non. TVF peut intervenir dès la phase de cadrage, lorsqu'il existe seulement un besoin, un périmètre ou une priorité à clarifier."],
        ["TVF peut-elle annoncer un partenariat avec une mairie ?", "Uniquement après accord formalisé. Aucun logo ni nom de collectivité ne doit être utilisé sans validation."],
        ["Quels documents préparer pour un premier échange ?", "Une fiche collectivité, le périmètre concerné, les données disponibles, les interlocuteurs et les contraintes déjà connues."],
      ]),
    ],
  },
  {
    file: "proprietaires.html",
    title: "Propriétaires",
    meta:
      "Parcours propriétaires TVF : proposer un bien vacant, dégradé ou inutilisé et préparer un cadre de coopération.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Propriétaires",
    h1: "Proposer un bien sans perdre le cadre.",
    intro:
      "Un propriétaire peut présenter un logement, commerce, bâtiment ou terrain inutilisé. TVF étudie ensuite les usages possibles, les contraintes et les conditions d'une convention.",
    ctas: [["Remplir la fiche", "documents/fiche-proprietaire.md"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Le propriétaire reste au centre de la décision",
        "TVF ne prend pas la place du propriétaire et ne transforme pas un bien sans accord écrit. La démarche vise d'abord à comprendre la situation : état du bien, contraintes, coûts possibles, usages utiles au territoire et conditions d'une coopération équilibrée.",
        [
          ["Propriété conservée", "Le bien reste la propriété de son détenteur."],
          ["Usage encadré", "Toute occupation, visite ou intervention doit être formalisée."],
          ["Valorisation possible", "Un bien inutilisé peut devenir logement, local associatif, commerce, atelier ou lieu partagé."],
        ]
      ),
      cards("Ce qui peut être étudié", "Chaque bien doit être qualifié avant d'imaginer un usage.", [
        ["Logement", "Vacant, dégradé, sous-utilisé ou difficile à remettre en état."],
        ["Commerce", "Cellule fermée, local inoccupé, rez-de-chaussée à réactiver."],
        ["Bâtiment", "Immeuble, atelier, équipement ou local sans usage clair."],
        ["Terrain", "Espace délaissé pouvant accueillir un usage collectif ou transitoire."],
      ]),
      tableSection("Scénarios possibles", "Les usages dépendent toujours de l'état du bien, du droit applicable, du budget et des responsabilités.", [
        ["Scénario", "Usage possible", "Points à cadrer"],
        ["Usage temporaire", "Occupation limitée pour tester un besoin local", "Durée, assurance, accès, restitution"],
        ["Usage solidaire", "Logement, local associatif, atelier ou espace partagé", "Public concerné, gestion, sécurité"],
        ["Valorisation progressive", "Travaux par étapes, réemploi de matériaux, recherche de soutiens", "Budget, devis, convention, suivi"],
        ["Réorientation", "Transmission vers un acteur plus adapté si TVF n'est pas le bon cadre", "Motif, contact utile, limites"],
      ]),
      tableSection("Points à vérifier", "Un projet sérieux commence par les contraintes.", [
        ["Sujet", "Question", "Document utile"],
        ["Propriété", "Qui peut autoriser l'usage ?", "Justificatif ou accord"],
        ["État", "Le bien est-il accessible et sécurisé ?", "Photos, diagnostics"],
        ["Usage", "Quel usage est réaliste ?", "Fiche projet"],
        ["Durée", "Quelle durée de coopération est acceptable ?", "Convention"],
      ]),
      timeline("Parcours propriétaire", [
        ["1", "Présentation du bien", "Le propriétaire transmet les informations disponibles sans engagement automatique."],
        ["2", "Qualification", "TVF analyse l'état apparent, les contraintes, les usages possibles et les pièces manquantes."],
        ["3", "Visite autorisée", "Une visite peut être organisée seulement avec accord écrit et règles de sécurité."],
        ["4", "Scénarios", "Plusieurs usages sont comparés : temporaire, solidaire, économique, associatif ou réorientation."],
        ["5", "Convention", "Si une suite est retenue, les rôles, durées, responsabilités et conditions de restitution sont écrits."],
      ]),
      textBlock("Principe", "Le propriétaire conserve ses droits. Toute intervention doit être encadrée par un accord clair, précisant les usages, la durée, les responsabilités, l'assurance, la communication et les limites de l'intervention."),
      faqSection([
        ["Proposer un bien engage-t-il le propriétaire ?", "Non. La première étape sert uniquement à étudier la situation. Aucun usage, travaux ou affichage public ne doit être engagé sans écrit."],
        ["TVF peut-elle financer automatiquement une rénovation ?", "Non. Les financements doivent être recherchés, vérifiés, accordés et tracés. Aucun soutien ne doit être annoncé comme acquis sans preuve."],
        ["Un bien très dégradé peut-il être étudié ?", "Oui, mais la sécurité, l'accès, les diagnostics, les responsabilités et la faisabilité financière deviennent prioritaires."],
      ]),
    ],
  },
  {
    file: "entreprises.html",
    title: "Entreprises",
    meta:
      "Parcours entreprises TVF : matériaux, compétences, locaux, mécénat, RSE et contribution territoriale.",
    heroImage: "assets/photos/france-ressourcerie-vichy.jpg",
    eyebrow: "Entreprises",
    h1: "Transformer une contribution en impact territorial.",
    intro:
      "Les entreprises peuvent contribuer par des matériaux, compétences, locaux, logistique ou mécénat. TVF aide à relier ces contributions à des projets cadrés et traçables.",
    ctas: [["Remplir la fiche", "documents/fiche-entreprise.md"], ["Devenir partenaire", "partenaires.html"]],
    sections: [
      sectionIntro(
        "Contribuer sans déclasser la ressource",
        "TVF aide les entreprises à transformer des ressources disponibles en contribution territoriale utile. Un surplus de chantier, du mobilier, une compétence ou un local ne sont pas traités comme un simple don isolé : ils sont qualifiés, tracés puis reliés à un besoin réel.",
        [
          ["Réemploi", "Donner une seconde utilité à des matériaux ou équipements encore exploitables."],
          ["RSE concrète", "Relier l'engagement de l'entreprise à un projet local documenté."],
          ["Traçabilité", "Conserver les preuves d'affectation, de décision et de communication."],
        ]
      ),
      cards("Formes de contribution", "Chaque contribution doit être décrite, localisée et affectée à un besoin validé.", [
        ["Matériaux", "Surplus, invendus, éléments de chantier ou équipements réutilisables."],
        ["Compétences", "Expertise technique, juridique, logistique, architecturale ou financière."],
        ["Locaux", "Espaces temporairement disponibles ou à remettre en usage."],
        ["Mécénat", "Soutien financier ou en nature avec traçabilité."],
      ]),
      tableSection("Ce que l'entreprise gagne en clarté", "La valeur d'une contribution repose sur son utilité, sa traçabilité et son affectation.", [
        ["Situation", "Risque si rien n'est cadré", "Cadre TVF"],
        ["Matériaux disponibles", "Stockage inutile, gaspillage, coût d'évacuation", "Bordereau, état, quantité, destination possible"],
        ["Compétence proposée", "Action ponctuelle difficile à valoriser", "Mission, périmètre, livrable, compte rendu"],
        ["Local disponible", "Usage flou ou responsabilité mal définie", "Convention, assurance, accès, durée"],
        ["Mécénat", "Communication fragile ou impact non vérifiable", "Projet instruit, budget, reporting"],
      ]),
      tableSection("Bénéfices pour l'entreprise", "Le partenariat doit être utile au territoire et clair pour l'entreprise.", [
        ["Bénéfice", "Description", "Preuve"],
        ["RSE", "Contribution concrète à l'économie circulaire et locale", "Fiche contribution"],
        ["Traçabilité", "Suivi de l'affectation des ressources", "Registre ou convention"],
        ["Ancrage local", "Participation à un projet du territoire", "Compte rendu"],
        ["Communication", "Valorisation possible après accord", "Validation commune"],
      ]),
      timeline("Du contact à la contribution", [
        ["1", "Description", "L'entreprise présente ce qu'elle peut apporter : matériaux, locaux, compétences ou soutien."],
        ["2", "Qualification", "TVF vérifie l'état, la disponibilité, la sécurité, la logistique et l'utilité."],
        ["3", "Affectation", "La ressource est orientée vers un projet validé ou mise en attente."],
        ["4", "Formalisation", "Les responsabilités, limites et droits de communication sont écrits."],
        ["5", "Suivi", "La contribution est tracée et peut être valorisée après accord."],
      ]),
      textBlock("Ce que TVF refuse", "TVF n'est pas une déchetterie ni une plateforme de déstockage libre. Les contributions doivent être réutilisables, utiles et compatibles avec un projet validé."),
      faqSection([
        ["Une entreprise peut-elle donner des matériaux ?", "Oui, si les matériaux sont réutilisables, décrits, accessibles, sécurisés et compatibles avec un projet ou une mise en attente cadrée."],
        ["Le logo de l'entreprise sera-t-il affiché ?", "Seulement après accord formalisé. TVF ne publie pas de faux partenaires ni de logos non autorisés."],
        ["Une contribution peut-elle être refusée ?", "Oui. TVF peut refuser ou réorienter une ressource si elle est dangereuse, inutilisable, impossible à stocker ou sans destination réaliste."],
      ]),
    ],
  },

  {
    file: "benevoles-citoyens.html",
    title: "Bénévoles & citoyens",
    meta:
      "Parcours bénévoles et citoyens de Territoires Vivants France : signaler, participer, documenter et agir localement.",
    heroImage: "assets/photos/community-garden-paris.webp",
    eyebrow: "Citoyens",
    h1: "Agir utilement, avec un cadre clair.",
    intro:
      "Les citoyens et bénévoles peuvent aider TVF à repérer les situations, documenter les besoins, participer à des actions encadrées et relayer les projets locaux.",
    ctas: [["Remplir la fiche", "documents/fiche-benevole.md"], ["Nous contacter", "contact.html"]],
    sections: [
      sectionIntro(
        "Un engagement utile, encadré et progressif",
        "Les bénévoles et citoyens sont essentiels pour repérer, documenter, relayer et participer. Mais l'engagement doit rester sécurisé : pas d'entrée dans un bien privé sans autorisation, pas de chantier sans encadrement, pas de représentation officielle sans mandat.",
        [
          ["Repérer", "Faire remonter une situation visible ou connue localement."],
          ["Documenter", "Aider à collecter des informations vérifiables et utiles."],
          ["Participer", "Rejoindre une mission claire, limitée et encadrée."],
        ]
      ),
      cards("Façons de participer", "L'engagement doit rester simple, utile et sécurisé.", [
        ["Signaler", "Transmettre une situation : bien vacant, commerce fermé, terrain délaissé ou matériau disponible."],
        ["Documenter", "Aider à collecter des informations publiques, photos, contacts et éléments de contexte."],
        ["Participer", "Rejoindre une action locale ou un chantier uniquement lorsqu'il est encadré."],
        ["Relayer", "Mettre en relation TVF avec des acteurs du territoire."],
      ]),
      tableSection("Missions possibles", "Chaque mission doit avoir une durée, un référent et une limite claire.", [
        ["Mission", "Exemple", "Condition"],
        ["Signalement citoyen", "Local fermé, terrain délaissé, matériau disponible", "Rester factuel et respecter la propriété"],
        ["Appui documentaire", "Recherche de sources publiques, photos de contexte, contacts locaux", "Ne pas collecter de données sensibles inutilement"],
        ["Action terrain", "Tri, inventaire, animation, jardin, chantier encadré", "Plan de prévention et référent présent"],
        ["Relais local", "Mettre en relation TVF avec une association, artisan, élu ou habitant", "Ne pas engager TVF sans validation"],
      ]),
      tableSection("Cadre bénévole", "Chaque mission doit être claire avant de commencer.", [
        ["Point", "Question", "Réponse attendue"],
        ["Mission", "Que faut-il faire ?", "Tâche précise et limitée"],
        ["Encadrement", "Qui suit la mission ?", "Référent identifié"],
        ["Sécurité", "Y a-t-il un risque ?", "Consignes et limites"],
        ["Données", "Que peut-on publier ?", "Accord et respect de la vie privée"],
      ]),
      timeline("Parcours bénévole", [
        ["1", "Se présenter", "Le bénévole indique son territoire, ses disponibilités et ses compétences."],
        ["2", "Choisir une mission", "TVF propose une mission adaptée au besoin et au niveau d'encadrement disponible."],
        ["3", "Cadrer", "Objectifs, limites, sécurité, données et référent sont précisés."],
        ["4", "Agir", "L'action est réalisée dans le cadre défini, avec émargement si nécessaire."],
        ["5", "Restituer", "Un court compte rendu permet de garder une trace utile."],
      ]),
      textBlock("Règle importante", "Un bénévole ne doit jamais entrer dans un bien privé, intervenir sur un chantier ou représenter TVF officiellement sans cadre validé."),
      faqSection([
        ["Puis-je signaler un bien vacant ?", "Oui, mais un signalement reste une information à qualifier. Il ne doit pas conduire à entrer sur un site ou à contacter un propriétaire au nom de TVF sans cadre."],
        ["Puis-je participer à un chantier ?", "Oui uniquement si le chantier est encadré, sécurisé et documenté. TVF doit préciser le référent, les consignes et les limites."],
        ["Faut-il des compétences techniques ?", "Pas forcément. TVF peut avoir besoin de relais locaux, d'appui administratif, de documentation, de communication prudente ou d'aide lors d'actions simples."],
      ]),
    ],
  },
  {
    file: "financeurs-mecenes.html",
    title: "Financeurs & mécènes",
    meta:
      "Parcours financeurs et mécènes TVF : soutenir des projets instruits, avec gouvernance, transparence et suivi d'impact.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Financement",
    h1: "Soutenir des projets cadrés, pas des promesses floues.",
    intro:
      "TVF prépare une logique de financement responsable : chaque soutien doit être relié à un projet instruit, une convention, des indicateurs et une transparence de suivi.",
    ctas: [["Remplir la fiche", "documents/fiche-financeur.md"], ["Voir l'impact", "impact.html"]],
    sections: [
      sectionIntro(
        "Financer ce qui est instruit, mesurable et utile",
        "TVF veut éviter les promesses floues. Un financeur doit savoir quel besoin il soutient, à quel stade se trouve le projet, quelles pièces existent, quelles dépenses sont éligibles, quels risques sont identifiés et quels indicateurs pourront être suivis.",
        [
          ["Clarté", "Un objet de financement précis, rattaché à un dossier."],
          ["Traçabilité", "Un budget, un plan de financement et des justificatifs."],
          ["Impact vérifiable", "Des indicateurs publiés seulement après mesure."],
        ]
      ),
      cards("Ce qui peut être soutenu", "Le financement doit être orienté vers des besoins précis.", [
        ["Diagnostic", "Repérage, qualification et documentation de biens ou ressources."],
        ["Réemploi", "Logistique, stockage, tri et affectation de matériaux réutilisables."],
        ["Projet local", "Remise en usage d'un bien, commerce, local associatif ou espace partagé."],
        ["Insertion", "Chantiers encadrés, bénévolat, formation et accompagnement."],
      ]),
      tableSection("Ce qu'un financeur doit pouvoir vérifier", "La confiance repose sur la preuve, pas sur l'effet d'annonce.", [
        ["Question", "Réponse attendue", "Document utile"],
        ["Quel est le besoin ?", "Bien, ressource, territoire et public concernés", "Fiche projet"],
        ["Quel est le budget ?", "Coûts, postes, devis, reste à financer", "Budget prévisionnel"],
        ["Qui porte quoi ?", "Rôles, responsabilités, convention", "Convention ou lettre d'intention"],
        ["Quels risques ?", "Sécurité, propriété, financement, calendrier", "Matrice des risques"],
        ["Quel impact suivre ?", "Indicateurs réalistes et mesurables", "Grille d'impact"],
      ]),
      tableSection("Garanties attendues", "Un financeur doit pouvoir comprendre ce qu'il soutient.", [
        ["Garantie", "Contenu", "Support"],
        ["Projet instruit", "Besoin, acteurs, risques et objectifs définis", "Fiche projet"],
        ["Cadre", "Responsabilités et modalités de suivi", "Convention"],
        ["Traçabilité", "Utilisation des fonds ou ressources", "Compte rendu"],
        ["Impact", "Indicateurs publiés seulement après vérification", "Grille d'impact"],
      ]),
      timeline("Parcours financeur", [
        ["1", "Échange", "TVF présente le besoin, le territoire et le niveau de maturité du dossier."],
        ["2", "Instruction", "Le financeur examine budget, risques, pièces et objectifs."],
        ["3", "Cadrage", "Les modalités de soutien, de communication et de reporting sont définies."],
        ["4", "Suivi", "L'utilisation du soutien est documentée avec justificatifs."],
        ["5", "Restitution", "TVF transmet un reporting honnête : résultats, limites et suites."],
      ]),
      textBlock("Principe", "TVF ne doit pas promettre un rendement, un impact ou une visibilité qui ne seraient pas contractualisés et vérifiables. Le mécénat et le financement doivent rester transparents."),
      faqSection([
        ["TVF peut-elle garantir un impact chiffré avant projet ?", "Non. Les objectifs peuvent être formulés, mais les résultats ne seront publiés qu'après réalisation et vérification."],
        ["Un financeur peut-il soutenir une phase de diagnostic ?", "Oui. Le diagnostic est souvent l'étape indispensable pour éviter de financer un projet mal cadré."],
        ["Comment TVF rend-elle compte ?", "Avec des pièces de suivi : budget, décisions, compte rendu, preuves d'utilisation, indicateurs et limites clairement mentionnées."],
      ]),
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
        ["Diagnostic territorial", "Cadrer le périmètre, les données, la méthode et les livrables d'un diagnostic TVF.", "documents/cahier-charges-diagnostic-territorial.md"],
        ["Convention territoriale", "Formaliser une coopération avec une collectivité sans engagement financier automatique.", "documents/convention-cooperation-territoriale.md"],
        ["Comité de pilotage", "Organiser les acteurs, décisions, réunions et règles de suivi territorial.", "documents/fiche-comite-pilotage.md"],
        ["Plan d'action territorial", "Transformer un diagnostic en actions, responsables, échéances et indicateurs.", "documents/plan-action-territorial.md"],
        ["Fiche propriétaire", "Présenter un bien, son état, ses contraintes et les usages envisageables.", "documents/fiche-proprietaire.md"],
        ["Bien solidaire", "Étudier un bien proposé pour un usage temporaire, solidaire ou partagé.", "documents/fiche-bien-solidaire-usage-partage.md"],
        ["Accord propriétaire", "Autoriser l'étude d'un bien sans créer d'occupation, de travaux ou d'engagement prématuré.", "documents/accord-principe-proprietaire.md"],
        ["Scénarios d'usage", "Comparer les usages possibles d'un bien avant de choisir une solution.", "documents/scenarios-usage-bien.md"],
        ["Suivi et restitution", "Suivre un bien pendant la coopération et préparer sa restitution au propriétaire.", "documents/suivi-restitution-bien.md"],
        ["Fiche entreprise", "Décrire des matériaux, compétences, locaux ou contributions possibles.", "documents/fiche-entreprise.md"],
        ["Signalement lieu", "Décrire un logement, commerce, bâtiment, terrain, friche ou matériau à qualifier.", "documents/fiche-signalement-lieu.md"],
        ["Qualification signalement", "Traiter un signalement sans le confondre avec un projet validé.", "documents/protocole-qualification-signalement.md"],
        ["Sources territoriales", "Tracer les sources utilisées dans les diagnostics, cartes et indicateurs.", "documents/registre-sources-donnees-territoriales.md"],
        ["Cartographie TVF", "Préparer les couches, statuts, règles de confidentialité et légendes d'une carte.", "documents/fiche-cartographie-territoriale.md"],
        ["Fiche projet", "Cadrer un projet territorial, son usage, ses acteurs, ses risques et ses livrables.", "documents/fiche-projet.md"],
        ["Pièces à fournir", "Lister les documents utiles selon le type de demande : collectivité, propriétaire, entreprise ou bénévole.", "documents/pieces-a-fournir.md"],
        ["Registre demandes", "Tracer les demandes reçues, leurs statuts, responsables, priorités et prochaines actions.", "documents/registre-demandes-entrantes.md"],
        ["Accusé de réception", "Répondre proprement à une demande sans créer d'engagement prématuré.", "documents/accuse-reception-demande.md"],
        ["Grille d'instruction", "Analyser l'utilité, les risques, les pièces et la faisabilité d'un dossier.", "documents/grille-instruction-dossier.md"],
        ["Décision d'orientation", "Formaliser la suite donnée à un dossier : compléter, visiter, instruire ou classer.", "documents/fiche-decision-orientation.md"],
        ["Fiche d’audit terrain", "Documenter une visite, l’état apparent, les ressources, les risques et les suites à donner.", "documents/fiche-audit-terrain.md"],
        ["Autorisation de visite", "Encadrer l'accès à un bien ou site avant toute observation de terrain.", "documents/autorisation-visite-bien.md"],
        ["Droit à l'image", "Autoriser ou limiter l'usage de photos, vidéos, témoignages, logos ou citations.", "documents/autorisation-droit-image.md"],
        ["Données personnelles", "Informer les personnes sur l'utilisation des informations transmises à TVF.", "documents/consentement-donnees-personnelles.md"],
        ["Évaluation sécurité", "Identifier les risques d'un site avant visite, collecte ou action terrain.", "documents/evaluation-securite-site.md"],
        ["Plan de prévention", "Cadrer une action terrain avec responsabilités, équipements et mesures de prudence.", "documents/plan-prevention-action-terrain.md"],
        ["PV remise matériaux", "Tracer la réception, les réserves et l'affectation provisoire des matériaux.", "documents/proces-verbal-remise-materiaux.md"],
        ["Fiche incident", "Documenter un incident, presque-incident ou point de vigilance pendant une action.", "documents/fiche-incident-action.md"],
        ["Mission bénévole", "Cadrer une mission bénévole avant une action, une visite ou un chantier encadré.", "documents/fiche-mission-benevole.md"],
        ["Consignes sécurité", "Préparer les règles de sécurité minimales avant une action terrain.", "documents/consignes-securite-action-terrain.md"],
        ["Feuille d'émargement", "Tracer les présences, horaires, contacts et signatures lors d'une action.", "documents/feuille-emargement-action.md"],
        ["Compte rendu terrain", "Documenter les objectifs, résultats, risques, décisions et suites d'une action.", "documents/compte-rendu-action-terrain.md"],
        ["Budget prévisionnel", "Estimer les dépenses, ressources, contributions en nature et reste à financer.", "documents/budget-previsionnel-projet.md"],
        ["Demande de devis", "Solliciter un prestataire sans créer de commande ou engagement prématuré.", "documents/demande-devis-prestation.md"],
        ["Comparatif devis", "Comparer prix, périmètre, délais, garanties et critères qualitatifs.", "documents/tableau-comparatif-devis.md"],
        ["Engagement dépense", "Autoriser une dépense avec budget, pièces, plafond et validation interne.", "documents/fiche-engagement-depense.md"],
        ["Réception prestation", "Constater le service fait, les réserves et les justificatifs avant paiement.", "documents/proces-verbal-reception-prestation.md"],
        ["Registre financements", "Suivre les dispositifs, appels à projets, statuts, échéances et sources officielles.", "documents/registre-financements-appels-projets.md"],
        ["Éligibilité financement", "Vérifier si un projet correspond à un dispositif sans annoncer de montant acquis.", "documents/fiche-eligibilite-financement.md"],
        ["Plan financement", "Présenter coûts, ressources, contributions en nature et reste à financer.", "documents/plan-financement-territorial.md"],
        ["Cofinancement projet", "Distinguer montants pressentis, demandés, accordés, conventionnés et versés.", "documents/tableau-cofinancement-projet.md"],
        ["Demande de soutien", "Présenter une demande financière claire, factuelle et rattachée à un projet instruit.", "documents/demande-soutien-financier.md"],
        ["Impact prévisionnel", "Distinguer objectifs, estimations, hypothèses et résultats vérifiés après action.", "documents/note-impact-previsionnel.md"],
        ["Suivi contribution", "Tracer une contribution promise, reçue, affectée et justifiée.", "documents/suivi-contribution-financeur.md"],
        ["Reporting financeur", "Restituer l'utilisation du soutien, l'avancement, les indicateurs et les limites.", "documents/reporting-financeur.md"],
        ["Réunion de cadrage", "Organiser un premier échange clair avec objectifs, décisions, pièces et suites.", "documents/ordre-du-jour-reunion-cadrage.md"],
        ["Matrice des risques", "Identifier les risques juridiques, techniques, financiers, humains et de communication.", "documents/matrice-risques-projet.md"],
        ["Fiche territoire", "Présenter un territoire candidat, ses besoins, acteurs, programmes et premières actions possibles.", "documents/fiche-territoire-partenaire.md"],
        ["Note d’opportunité", "Synthétiser l'intérêt d'une coopération TVF avant un rendez-vous institutionnel.", "documents/note-opportunite-territoriale.md"],
        ["Lettre d’intention", "Formaliser une volonté de coopération sans créer d'engagement opérationnel prématuré.", "documents/lettre-intention-cooperation.md"],
        ["Courrier propriétaire", "Contacter un propriétaire pour étudier un bien sans créer d'engagement prématuré.", "documents/courrier-proprietaire-proposition-bien.md"],
        ["Courrier collectivité", "Proposer un échange institutionnel à une commune, un EPCI ou une collectivité.", "documents/courrier-collectivite-territoire-partenaire.md"],
        ["Courrier entreprise", "Présenter une contribution possible en matériaux, compétences, locaux ou mécénat.", "documents/courrier-entreprise-contribution.md"],
        ["Courrier financeur", "Demander un échange avec une fondation, un mécène ou un financeur potentiel.", "documents/courrier-financeur-mecene.md"],
        ["Partenaire potentiel", "Qualifier un acteur avant toute annonce, logo ou coopération publique.", "documents/fiche-partenaire-potentiel.md"],
        ["Officialisation partenariat", "Vérifier les étapes avant d'afficher un partenaire ou d'utiliser son logo.", "documents/protocole-officialisation-partenariat.md"],
        ["Partenariat associatif", "Cadrer une coopération avec une association locale ou thématique.", "documents/convention-partenariat-association.md"],
        ["Mise à disposition", "Préparer l'usage temporaire d'un bien, local ou terrain avec responsabilités claires.", "documents/convention-mise-disposition-bien.md"],
        ["Contribution entreprise", "Cadrer les matériaux, compétences, locaux, mécénat ou appuis proposés par une entreprise.", "documents/fiche-contribution-entreprise.md"],
        ["Bordereau matériaux", "Décrire précisément les matériaux proposés, leur état, leur retrait et leur affectation possible.", "documents/bordereau-don-materiaux.md"],
        ["Convention mécénat", "Préparer un soutien financier, matériel ou de compétences sans promesse fiscale automatique.", "documents/convention-mecenat-preparatoire.md"],
        ["Registre matériaux", "Tracer les matériaux proposés, acceptés, refusés, stockés, réservés ou affectés.", "documents/registre-materiaux-reemploi.md"],
        ["Dossier TVF", "Présenter l'association, sa méthode, ses publics et ses conditions de coopération.", "documents/dossier-presentation-tvf.md"],
        ["Modèle de convention", "Préparer les clauses de coopération à adapter avec les parties concernées.", "documents/modele-convention.md"],
        ["Grille d'impact", "Suivre les indicateurs sans inventer de chiffres ni de résultats.", "documents/grille-impact.md"],
        ["Charte éthique", "Fixer les règles de transparence, de prudence, de traçabilité et de communication.", "documents/charte-ethique.md"],
        ["Critères de sélection", "Évaluer l’utilité, la faisabilité, les risques et la priorité d’un dossier.", "documents/criteres-selection-projets.md"],
        ["Bulletin d'adhésion", "Recueillir une demande d'adhésion avec identité, motivation, cotisation et engagement.", "documents/bulletin-adhesion.md"],
        ["Registre adhérents", "Suivre les adhésions, statuts, cotisations, compétences et données à protéger.", "documents/registre-adherents.md"],
        ["Procès-verbal", "Tracer les réunions, décisions, votes, responsables et suites à donner.", "documents/proces-verbal-reunion.md"],
        ["Délégation de pouvoir", "Cadrer une représentation, signature ou mission limitée au nom de TVF.", "documents/delegation-pouvoir.md"],
        ["Règlement intérieur préparatoire", "Cadrer les règles internes avant adoption officielle.", "documents/reglement-interieur-preparatoire.md"],
        ["Registre de décisions", "Tracer les décisions, les motifs, les responsables et les échéances.", "documents/registre-suivi-decisions.md"],
        ["Kit média", "Centraliser les formulations publiques, l’usage du logo et les règles presse.", "documents/kit-media.md"],
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
    file: "gouvernance.html",
    title: "Gouvernance & éthique",
    meta:
      "Gouvernance, éthique, responsabilités et règles de décision de Territoires Vivants France.",
    heroImage: "assets/photos/france-saint-etienne-chateaucreux.jpg",
    eyebrow: "Cadre institutionnel",
    h1: "Une gouvernance lisible pour inspirer confiance.",
    intro:
      "TVF doit être capable de dialoguer avec des collectivités, propriétaires, entreprises et financeurs. Cela suppose un cadre clair : qui décide, sur quels critères, avec quelles preuves et quelles limites de communication.",
    ctas: [["Lire la charte", "documents/charte-ethique.md"], ["Voir la transparence", "transparence.html"]],
    sections: [
      cards("Principes de gouvernance", "Chaque décision doit pouvoir être expliquée simplement.", [
        ["Intérêt général", "Prioriser les projets utiles aux habitants, au territoire et à la transition écologique."],
        ["Traçabilité", "Conserver les éléments qui justifient une décision, une convention ou une affectation de ressource."],
        ["Complémentarité", "Coopérer avec les acteurs existants sans se présenter comme substitut aux dispositifs publics."],
        ["Sobriété", "Communiquer uniquement sur les faits établis, les objectifs assumés et les documents disponibles."],
      ]),
      tableSection("Processus de décision", "Un dossier ne doit pas passer directement de l'idée à la communication publique.", [
        ["Étape", "Décision attendue", "Preuve ou livrable"],
        ["Réception", "Le besoin entre-t-il dans l'objet TVF ?", "Fiche de contact ou fiche projet"],
        ["Qualification", "Les risques et contraintes sont-ils identifiés ?", "Diagnostic initial"],
        ["Priorisation", "Le projet répond-il à un besoin territorial réel ?", "Barème de priorisation"],
        ["Convention", "Les rôles et responsabilités sont-ils cadrés ?", "Convention adaptée"],
        ["Suivi", "Les résultats peuvent-ils être vérifiés ?", "Grille d'impact"],
      ]),
      timeline("Rythme de suivi", [
        ["1", "Cadrer", "Identifier le référent, le périmètre, les documents et les points de vigilance."],
        ["2", "Décider", "Valider l'intérêt, la faisabilité et les conditions minimales du dossier."],
        ["3", "Formaliser", "Écrire les engagements, usages, limites, responsabilités et modalités de suivi."],
        ["4", "Publier", "Communiquer seulement ce qui est vérifié, signé ou explicitement présenté comme objectif."],
      ]),
      textBlock(
        "Responsabilités identifiées",
        "Président fondateur : Edryan Rangoly. Secrétaire et trésorier : M. Lambeau Jordan. Les responsabilités pourront être complétées après formalisation officielle de l'association et publication des documents administratifs à jour."
      ),
    ],
  },
  {
    file: "kit-media.html",
    title: "Kit média",
    meta:
      "Kit média de Territoires Vivants France : logo officiel, présentation, règles de citation et documents presse.",
    heroImage: "assets/photos/france-saint-etienne-jean-jaures.jpg",
    eyebrow: "Presse & communication",
    h1: "Des éléments publics cohérents et vérifiables.",
    intro:
      "Le kit média centralise les éléments qui peuvent être repris dans une présentation, un article, une note de synthèse ou un échange institutionnel, sans créer de confusion sur l'état réel du projet.",
    ctas: [["Télécharger le dossier TVF", "documents/dossier-presentation-tvf.md"], ["Nous contacter", "contact.html"]],
    sections: [
      cards("Éléments disponibles", "Des supports simples pour parler de TVF avec justesse.", [
        ["Logo officiel", "Utiliser le logo officiel TVF sans le déformer, le recadrer excessivement ou modifier ses couleurs.", "assets/logo-tvf-officiel-fond-blanc.png"],
        ["Présentation courte", "TVF coordonne la remise en usage de biens, lieux et ressources inutilisés au service des territoires.", "documents/kit-media.md"],
        ["Dossier TVF", "Un document de présentation plus complet pour collectivités, entreprises et financeurs.", "documents/dossier-presentation-tvf.md"],
        ["Crédits images", "Les visuels utilisés sur le site sont documentés dans le fichier de crédits.", "assets/photos/CREDITS.md"],
      ]),
      tableSection("Formulations recommandées", "Les mots utilisés doivent rester précis et crédibles.", [
        ["Sujet", "Formulation recommandée", "À éviter"],
        ["Nature", "Association nationale en création", "Institution publique ou opérateur officiel"],
        ["Rôle", "Plateforme de coopération et de coordination territoriale", "Remplacement des collectivités ou dispositifs existants"],
        ["Impact", "Indicateurs à mesurer après projets conventionnés", "Résultats chiffrés non vérifiés"],
        ["Partenaires", "Partenaires à afficher uniquement après accord réel", "Logos ou références non officialisés"],
      ]),
      textBlock(
        "Règle de communication",
        "TVF doit rester exigeante dans sa communication : pas de faux partenaire, pas de résultat inventé, pas de promesse non cadrée. Cette discipline éditoriale protège l'association, les partenaires et les futurs bénéficiaires."
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
        ["Gouvernance", "Rendre lisibles les responsabilités, les décisions et les critères de sélection.", "gouvernance.html"],
        ["Kit média", "Mettre à disposition les éléments publics validés et les règles d'usage.", "kit-media.html"],
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
      <div><h2>Ressources</h2><a href="notre-methode.html">Notre méthode</a><a href="impact.html">Impact</a><a href="gouvernance.html">Gouvernance</a><a href="kit-media.html">Kit média</a><a href="documents.html">Documents</a><a href="faq.html">FAQ</a><a href="transparence.html">Transparence</a><a href="mentions-legales.html">Mentions légales</a><a href="contact.html">Contact</a></div>
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
