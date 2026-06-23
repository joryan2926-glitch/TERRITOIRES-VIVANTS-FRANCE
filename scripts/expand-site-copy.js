const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();
const marker = "data-copy-expansion=";

function slugFor(file) {
  return file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function labelFor(file) {
  const raw = file.replace(/\.html$/, "").replace(/-/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function cards(items) {
  return `<div class="longform-grid">${items.map((item) => `<article class="longform-card"><h3>${item.title}</h3><p>${item.text}</p></article>`).join("")}</div>`;
}

function details(items) {
  return `<div class="module-detail-grid">${items.map((item) => `<article class="module-detail-card"><h3>${item.title}</h3><p>${item.text}</p></article>`).join("")}</div>`;
}

function path(items) {
  return `<ol class="longform-path">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

function section(file, family) {
  const id = `copy-${slugFor(file)}`;
  const label = labelFor(file);
  const template = templates[family] || templates.generic;
  return template(id, label);
}

const templates = {
  home: (id) => `
        <section class="longform-section" ${marker}"accueil" aria-labelledby="${id}">
          <span class="longform-kicker">Lecture approfondie</span>
          <h2 id="${id}">Une plateforme nationale pour transformer les ressources abandonn&eacute;es en utilit&eacute;s locales</h2>
          <p>La page d'accueil doit donner une vision imm&eacute;diate : Territoires Vivants France n'est pas seulement un site de pr&eacute;sentation, mais une architecture de travail destin&eacute;e &agrave; relier les habitants, les collectivit&eacute;s, les propri&eacute;taires, les entreprises, les b&eacute;n&eacute;voles et les financeurs autour de situations concr&egrave;tes.</p>
          <p>Chaque rubrique du site r&eacute;pond &agrave; une question op&eacute;rationnelle : o&ugrave; sont les biens ou les ressources inutilis&eacute;s, qui peut agir, sous quelles conditions, avec quels moyens, avec quelle transparence et selon quelle priorit&eacute; territoriale. Cette lecture permet de passer d'une intention associative &agrave; une m&eacute;thode nationale structur&eacute;e.</p>
          ${cards([
            { title: "Observer avant d'agir", text: "Les signalements, cartes, tableaux de bord et observatoires servent &agrave; qualifier les situations avant toute communication publique ou mobilisation de partenaires." },
            { title: "Relier les besoins", text: "Un logement vacant, un commerce ferm&eacute;, une friche ou un stock de mat&eacute;riaux peuvent devenir utiles si l'on relie le bon lieu, le bon usage et les bons acteurs." },
            { title: "Prouver progressivement", text: "Les indicateurs d'impact TVF doivent rester aliment&eacute;s par des donn&eacute;es v&eacute;rifi&eacute;es : source, date, territoire, statut de validation et limite d'interpr&eacute;tation." },
          ])}
          ${path([
            "Identifier les ressources inexploitees et les besoins locaux.",
            "Qualifier les informations avec une methode transparente.",
            "Mobiliser les acteurs capables de construire une reponse utile.",
            "Mesurer les resultats uniquement lorsque les donnees sont verifiees.",
          ])}
          <div class="longform-note"><strong>Intention editoriale :</strong> faire comprendre des la premiere page que TVF agit avec prudence, methode et ambition nationale, sans annoncer de faux resultats.</div>
        </section>`,

  habitat: (id, label) => `
        <section class="longform-section" ${marker}"habitat" aria-labelledby="${id}">
          <span class="longform-kicker">Developpement editorial</span>
          <h2 id="${id}">${label} : passer du bien vacant au projet d'usage</h2>
          <p>Un logement vacant ou un immeuble degrade ne devient pas utile par simple signalement. Il faut comprendre son histoire, son proprietaire, son etat technique, ses contraintes juridiques, son cout de remise en etat, son environnement urbain et les besoins reels du territoire. Cette page doit donc expliquer le chemin entre le constat d'abandon et une solution acceptable pour toutes les parties.</p>
          <p>TVF se positionne comme un tiers de confiance : l'association peut aider a verifier les informations, dialoguer avec les proprietaires, orienter vers les dispositifs publics, rechercher des materiaux de reemploi, mobiliser des benevoles lorsque c'est possible et preparer une convention d'usage temporaire si le cadre le permet.</p>
          ${cards([
            { title: "Comprendre la cause de vacance", text: "Succession, cout des travaux, absence de demande locale, acces difficile, normes, copropriete fragile ou proprietaire eloigne : chaque situation appelle une reponse differente." },
            { title: "Construire une solution realiste", text: "La remise en usage peut prendre la forme d'un logement solidaire, d'une occupation temporaire, d'un habitat partage, d'un usage associatif ou d'une orientation vers un dispositif public." },
            { title: "Proteger les personnes", text: "Aucune adresse sensible ne doit etre publiee sans verification. Le respect du proprietaire, des habitants et du voisinage fait partie de la credibilite du projet." },
          ])}
          ${details([
            { title: "Module proprietaire", text: "Le contenu doit rassurer : conserver la propriete, comprendre les options, evaluer les contreparties et obtenir une lecture claire des engagements possibles." },
            { title: "Module collectivite", text: "La commune a besoin d'une methode de reperage, de priorisation et de mediation, sans transformer chaque signalement en promesse de renovation." },
            { title: "Module habitant", text: "L'habitant peut signaler une situation, mais TVF doit expliquer que le signalement ouvre une qualification, pas une intervention automatique." },
          ])}
          ${path([
            "Recevoir ou creer un signalement documente.",
            "Verifier le statut du bien, les risques et les informations disponibles.",
            "Identifier un usage possible et les acteurs a mobiliser.",
            "Preparer un montage, une convention ou une orientation vers un dispositif adapte.",
          ])}
          <div class="longform-note"><strong>Positionnement TVF :</strong> remettre en usage l'existant sans deposseder, sans forcer, sans promettre trop vite, et en construisant des solutions utiles au territoire.</div>
        </section>`,

  commerce: (id, label) => `
        <section class="longform-section" ${marker}"commerce" aria-labelledby="${id}">
          <span class="longform-kicker">Centralite commerciale</span>
          <h2 id="${id}">${label} : redonner une fonction aux rez-de-chaussee vacants</h2>
          <p>Un local commercial ferme affaiblit plus qu'une rue : il reduit les flux, fragilise les autres activites, degrade l'image du centre et peut decourager les porteurs de projet. Le travail de TVF consiste a transformer une cellule vide en opportunite lisible : boutique test, atelier, service de proximite, espace associatif, tiers-lieu, formation ou commerce adapte au territoire.</p>
          <p>Le contenu doit aider les proprietaires, communes et entrepreneurs a comprendre que la reconversion d'un commerce ne depend pas seulement d'un bail. Elle implique un diagnostic du local, une lecture du marche local, des travaux parfois modestes mais decisifs, une strategie d'usage et une phase de test pour reduire le risque.</p>
          ${cards([
            { title: "Qualifier le local", text: "Surface, vitrine, accessibilite, securite, reseaux, etat interieur, bail, loyer et visibilite doivent etre documentes avant toute proposition." },
            { title: "Tester avant d'engager", text: "Les boutiques ephemeres, permanences associatives et ateliers partages permettent de verifier un usage sans immobiliser lourdement le proprietaire." },
            { title: "Relier commerce et habitat", text: "Un centre habite soutient les commerces ; des commerces actifs rendent l'habitat plus attractif. Les deux sujets doivent etre traites ensemble." },
          ])}
          ${path([
            "Recenser les cellules vacantes visibles et les locaux signales.",
            "Identifier les freins de remise en activite.",
            "Chercher des usages compatibles avec le quartier.",
            "Accompagner un test ou une mise en relation qualifiee.",
          ])}
          <div class="longform-note"><strong>Promesse de la page :</strong> montrer que le commerce vacant peut devenir un levier de service local, d'emploi, de lien social et d'attractivite.</div>
        </section>`,

  materials: (id, label) => `
        <section class="longform-section" ${marker}"materials" aria-labelledby="${id}">
          <span class="longform-kicker">Reemploi et logistique</span>
          <h2 id="${id}">${label} : organiser la seconde vie des materiaux</h2>
          <p>Le reemploi des materiaux ne repose pas uniquement sur la bonne volonte. Il exige une chaine claire : reperer les ressources avant demolition ou remplacement, prendre des photos, decrire l'etat, mesurer les quantites, definir les conditions de retrait, stocker lorsque c'est possible, puis relier l'offre a un chantier, une association, une collectivite ou un artisan.</p>
          <p>Cette page doit donc parler a plusieurs publics : entreprises qui souhaitent eviter le gaspillage, particuliers qui disposent d'equipements reutilisables, collectivites qui veulent soutenir l'economie circulaire, associations qui cherchent des ressources, et porteurs de projets qui doivent reduire les couts de renovation.</p>
          ${cards([
            { title: "Documenter pour rendre utile", text: "Une porte, une fenetre ou un lot de sanitaires n'est exploitable que si ses dimensions, son etat, sa localisation et sa disponibilite sont connus." },
            { title: "Eviter le faux stock", text: "La banque de materiaux doit distinguer les ressources disponibles, reservees, retirees, a verifier ou refusees pour raison de securite." },
            { title: "Construire une filiere locale", text: "Le reemploi devient credible lorsqu'il relie les chantiers, les depots, les ateliers, les associations et les besoins concrets d'un territoire." },
          ])}
          ${details([
            { title: "Depot", text: "Un formulaire doit guider le donateur vers une description complete, sans demander plus d'informations que necessaire." },
            { title: "Recherche", text: "Les filtres par categorie, localisation, etat et disponibilite permettent de transformer un inventaire en outil d'action." },
            { title: "Retrait", text: "Les conditions pratiques doivent etre explicites : delai, chargement, contact, responsabilite et confirmation avant deplacement." },
          ])}
          <div class="longform-note"><strong>Point de vigilance :</strong> TVF doit privilegier la tracabilite, la securite et l'utilite reelle plutot qu'un catalogue trop large impossible a maintenir.</div>
        </section>`,

  friches: (id, label) => `
        <section class="longform-section" ${marker}"friches" aria-labelledby="${id}">
          <span class="longform-kicker">Espaces abandonnes</span>
          <h2 id="${id}">${label} : transformer les espaces delaissees sans artificialiser davantage</h2>
          <p>Une friche, un terrain abandonne ou un batiment delaisse concentre souvent plusieurs problemes : securite, pollution potentielle, image degradee, rupture urbaine, absence d'usage et couts de transformation. Pourtant, ces lieux peuvent devenir des supports de biodiversite, de jardinage, de formation, d'activites culturelles, de sport, de rencontre ou de projets economiques sobres.</p>
          <p>Le role de TVF n'est pas de promettre une transformation immediate. Il est d'aider a qualifier le lieu, a identifier les usages possibles, a distinguer le provisoire du durable, a associer les habitants et a orienter les situations complexes vers les acteurs techniques competents.</p>
          ${cards([
            { title: "Analyser les contraintes", text: "Propriete, risques, pollution, acces, zonage, voisinage et cout de securisation conditionnent tout usage possible." },
            { title: "Imaginer des usages progressifs", text: "Un jardin temporaire, une exposition, un verger citoyen ou un espace pedagogique peut preparer une transformation plus ambitieuse." },
            { title: "Relier ecologie et social", text: "Les espaces abandonnes peuvent devenir des lieux de nature, mais aussi des lieux de lien, d'apprentissage et d'engagement local." },
          ])}
          ${path([
            "Reperer le site et recueillir les informations disponibles.",
            "Evaluer les risques et les contraintes d'usage.",
            "Choisir un scenario sobre, temporaire ou permanent.",
            "Associer habitants, proprietaires, collectivites et competences techniques.",
          ])}
          <div class="longform-note"><strong>Ambition :</strong> faire de chaque espace delaisse une question territoriale partagee plutot qu'un angle mort urbain.</div>
        </section>`,

  insertion: (id, label) => `
        <section class="longform-section" ${marker}"insertion" aria-labelledby="${id}">
          <span class="longform-kicker">Engagement et inclusion</span>
          <h2 id="${id}">${label} : creer des parcours utiles autour des projets locaux</h2>
          <p>La revitalisation territoriale peut devenir un support d'insertion si elle est organisee avec exigence. Inventorier des materiaux, preparer un chantier participatif, entretenir un espace partage, accueillir des habitants, documenter un projet ou participer a une action de terrain sont autant de missions pouvant redonner confiance, competence et utilite sociale.</p>
          <p>Cette page doit clarifier la difference entre benevolat, formation, chantier participatif, service civique, insertion professionnelle et emploi futur. Elle doit aussi rappeler que toute mission doit etre encadree, assuree, proportionnee et adaptee aux personnes concernees.</p>
          ${cards([
            { title: "Des missions progressives", text: "Certaines personnes peuvent commencer par l'observation ou l'accueil, puis aller vers des ateliers pratiques ou des chantiers encadres." },
            { title: "Un cadre securisant", text: "TVF doit definir les roles, les limites, les assurances, les competences requises et les referents avant chaque action." },
            { title: "Une utilite visible", text: "Les participants doivent comprendre l'impact concret de leur engagement : un lieu nettoye, un materiau sauve, une information verifiee, un habitant aide." },
          ])}
          ${path([
            "Identifier une mission utile et adaptee au territoire.",
            "Verifier les risques, les besoins d'encadrement et le niveau attendu.",
            "Accueillir, expliquer, accompagner et documenter.",
            "Valoriser l'engagement sans inventer de resultat.",
          ])}
          <div class="longform-note"><strong>Cadre editorial :</strong> parler d'insertion avec responsabilite, sans promettre d'emploi automatique ni de parcours qui n'existent pas encore.</div>
        </section>`,

  observatory: (id, label) => `
        <section class="longform-section" ${marker}"observatory" aria-labelledby="${id}">
          <span class="longform-kicker">Donnees et decision</span>
          <h2 id="${id}">${label} : transformer les signalements en connaissance territoriale</h2>
          <p>Un observatoire credible ne se limite pas a afficher des points sur une carte. Il doit expliquer d'ou viennent les donnees, comment elles sont verifiees, qui peut les consulter, quelles informations restent confidentielles et comment les indicateurs aident a prioriser les actions.</p>
          <p>Pour TVF, l'observatoire est le coeur methodologique de la plateforme : il relie logements vacants, commerces fermes, friches, materiaux disponibles, antennes locales, projets et indicateurs sociaux. Cette approche evite de traiter les sujets separement alors qu'ils se renforcent sur le terrain.</p>
          ${cards([
            { title: "Qualifier les donnees", text: "Chaque fiche doit avoir une source, une date, une commune, un statut de validation, un niveau de diffusion et des limites clairement identifiees." },
            { title: "Proteger les informations", text: "Les adresses sensibles, contacts et photos ne doivent pas etre publics tant que leur publication n'est pas legitime et securisee." },
            { title: "Aider a prioriser", text: "Une carte utile aide a choisir les rues, biens, locaux, friches ou gisements de materiaux a verifier en premier." },
          ])}
          ${details([
            { title: "Carte", text: "La carte doit pouvoir afficher des couches distinctes, filtrables par type de bien, commune, territoire, statut et source." },
            { title: "Tableau de bord", text: "Les indicateurs doivent venir de la base, sans chiffres fictifs, avec distinction entre signale, qualifie, valide et realise." },
            { title: "Fiche territoire", text: "Chaque territoire pourra regrouper diagnostic, priorites, besoins, ressources, acteurs et actions en cours." },
          ])}
          <div class="longform-note"><strong>Principe de confiance :</strong> mieux vaut afficher moins de donnees, mais les afficher avec methode, source et statut clair.</div>
        </section>`,

  financing: (id, label) => `
        <section class="longform-section" ${marker}"financing" aria-labelledby="${id}">
          <span class="longform-kicker">Financement responsable</span>
          <h2 id="${id}">${label} : financer sans perdre la transparence</h2>
          <p>Financer la revitalisation demande plus qu'un bouton de don. Les projets peuvent mobiliser dons citoyens, mecenat, contribution d'entreprise, mise a disposition de locaux, materiaux, subventions, financement participatif, investissement solidaire ou conventions avec des proprietaires. Chaque canal doit etre explique avec ses limites, ses obligations et sa tra&ccedil;abilite.</p>
          <p>TVF doit montrer comment un projet passe d'une idee a une fiche finançable : diagnostic, localisation, usage prevu, budget previsionnel, risques, calendrier, statut juridique, photos, besoins restants, gouvernance et indicateurs attendus. Aucun financement ne doit etre presente comme acquis sans preuve.</p>
          ${cards([
            { title: "Donner confiance", text: "Les donateurs, entreprises et mecenes doivent savoir a quoi sert leur contribution, comment elle est suivie et quand les resultats seront publies." },
            { title: "Selectionner les projets", text: "Un projet finançable doit etre utile localement, juridiquement encadre, techniquement realiste et compatible avec les moyens mobilisables." },
            { title: "Mesurer sans inventer", text: "L'impact doit etre relie aux donnees validees : biens remis en usage, materiaux reutilises, personnes accompagnees, lieux transformes." },
          ])}
          ${path([
            "Recevoir une idee ou un besoin territorial.",
            "Qualifier le projet, les risques et les couts.",
            "Choisir un canal de financement adapte.",
            "Publier un suivi transparent lorsque les donnees existent.",
          ])}
          <div class="longform-note"><strong>Exigence :</strong> chaque appel a financement doit etre documente avant publication, avec budget previsionnel, responsable, statut et conditions d'utilisation des fonds.</div>
        </section>`,

  engagement: (id, label) => `
        <section class="longform-section" ${marker}"engagement" aria-labelledby="${id}">
          <span class="longform-kicker">Participation citoyenne</span>
          <h2 id="${id}">${label} : rendre l'engagement simple, utile et bien encadre</h2>
          <p>Un site associatif national doit transformer l'envie d'agir en parcours clair. Signaler un lieu, proposer des materiaux, devenir benevole, rejoindre une antenne, proposer un bien, soutenir un projet ou devenir partenaire sont des gestes differents. Chacun doit avoir son formulaire, ses informations attendues, son delai de traitement et ses limites.</p>
          <p>TVF doit rassurer les personnes qui contribuent : elles ne portent pas seules la responsabilite d'une situation. Elles transmettent une information ou une intention, qui sera ensuite qualifiee par l'association avant publication, mobilisation ou orientation vers un acteur competent.</p>
          ${cards([
            { title: "Un parcours par besoin", text: "Le visiteur doit comprendre rapidement s'il doit signaler, proposer, donner, rejoindre, financer ou demander un accompagnement." },
            { title: "Des formulaires sobres", text: "Chaque formulaire doit demander les informations necessaires sans decourager l'utilisateur ni collecter de donnees inutiles." },
            { title: "Un suivi lisible", text: "Accuse de reception, statut, qualification, demande de complement et decision doivent former un parcours comprehensible." },
          ])}
          <div class="longform-note"><strong>Experience attendue :</strong> donner envie d'agir tout en expliquant que chaque contribution sera verifiee, priorisee et integree a une methode collective.</div>
        </section>`,

  platform: (id, label) => `
        <section class="longform-section" ${marker}"platform" aria-labelledby="${id}">
          <span class="longform-kicker">Plateforme operationnelle</span>
          <h2 id="${id}">${label} : preparer un outil fiable pour les premiers utilisateurs</h2>
          <p>Les pages operationnelles ne doivent pas seulement annoncer des fonctionnalites. Elles doivent expliquer comment la plateforme protege les donnees, organise les roles, verifie les contributions, modere les contenus et transforme les informations en actions utiles. Cette clarte est indispensable pour accueillir des citoyens, entreprises, collectivites et administrateurs.</p>
          <p>La connexion Supabase prepare une montee en charge progressive : authentification, profils, signalements, materiaux, projets, documents, antennes, partenaires et journal d'activite. Chaque module doit distinguer les donnees saisies, les donnees en attente, les donnees validees et les donnees publiables.</p>
          ${cards([
            { title: "Securite", text: "Les roles, les politiques RLS, les buckets de stockage et les pages admin doivent limiter l'acces aux informations sensibles." },
            { title: "Moderation", text: "Les signalements, photos, materiaux, partenaires et projets doivent etre verifies avant affichage public." },
            { title: "Tra&ccedil;abilite", text: "Chaque action importante doit etre reliee a un utilisateur, une date, un statut et une decision afin de construire un journal d'activite fiable." },
          ])}
          ${path([
            "Collecter une contribution utilisateur.",
            "Enregistrer la donnee avec un statut initial.",
            "Permettre la validation par un administrateur.",
            "Afficher seulement les donnees publiables et utiles.",
          ])}
          <div class="longform-note"><strong>Objectif beta :</strong> offrir une plateforme utilisable sans faire croire que toutes les donnees publiques ou tous les services sont deja complets.</div>
        </section>`,

  partnerships: (id, label) => `
        <section class="longform-section" ${marker}"partnerships" aria-labelledby="${id}">
          <span class="longform-kicker">Cooperation territoriale</span>
          <h2 id="${id}">${label} : construire des partenariats utiles et verificables</h2>
          <p>La revitalisation territoriale ne peut pas reposer sur un acteur seul. Collectivites, entreprises, associations, bailleurs, etablissements d'enseignement, fondations, artisans, architectes et habitants apportent chacun une competence differente. Cette page doit expliquer ce que TVF peut proposer, ce qu'elle attend et comment un partenariat est cadre.</p>
          <p>Pour rester credible, TVF ne doit pas afficher de partenaires non confirmes. Le contenu doit donc parler de modalites possibles : diagnostic, don de materiaux, mecenat, mise a disposition, expertise, formation, relais local, coorganisation ou soutien methodologique, sans presenter ces pistes comme deja acquises.</p>
          ${cards([
            { title: "Clarifier le besoin", text: "Chaque cooperation commence par un besoin precis : lieu a qualifier, materiaux a orienter, projet a financer, competence a mobiliser ou territoire a accompagner." },
            { title: "Formaliser le cadre", text: "Convention, responsabilites, calendrier, assurance, communication et indicateurs doivent etre definis avant toute annonce publique." },
            { title: "Rendre compte", text: "Un partenariat utile produit un suivi : actions menees, ressources mobilisees, limites rencontrees et resultats verifies." },
          ])}
          <div class="longform-note"><strong>Ton institutionnel :</strong> inviter a cooperer sans survendre, avec une logique de confiance, de responsabilite et de transparence.</div>
        </section>`,

  institutional: (id, label) => `
        <section class="longform-section" ${marker}"institutional" aria-labelledby="${id}">
          <span class="longform-kicker">Cadre associatif</span>
          <h2 id="${id}">${label} : expliquer le projet avec rigueur et transparence</h2>
          <p>Les pages institutionnelles construisent la confiance. Elles doivent expliquer qui porte le projet, comment l'association se structure, quelles sont ses limites actuelles, comment les decisions sont prises, quelles informations seront publiees et comment les personnes peuvent contacter TVF ou acceder aux documents utiles.</p>
          <p>Comme Territoires Vivants France est presentee comme une association en structuration, le contenu doit etre honnete : ambition nationale, methode preparee, outils en place, gouvernance a documenter, statuts et documents a tenir a jour apres declaration officielle. Cette prudence renforce la credibilite au lieu de l'affaiblir.</p>
          ${cards([
            { title: "Dire ce qui existe", text: "Les informations certaines doivent etre separees des dispositifs en preparation, des documents a venir et des indicateurs non encore disponibles." },
            { title: "Donner acces aux preuves", text: "Statuts, mentions legales, politique de confidentialite, rapports, gouvernance et comptes devront etre publies dans des espaces clairement identifies." },
            { title: "Faciliter le contact", text: "Les visiteurs doivent savoir a qui s'adresser selon leur profil : habitant, proprietaire, collectivite, entreprise, journaliste, benevole ou financeur." },
          ])}
          <div class="longform-note"><strong>Ligne editoriale :</strong> parler comme une organisation serieuse en construction : ambitieuse, transparente, prudente et orientee vers l'action.</div>
        </section>`,

  antenna: (id, label) => `
        <section class="longform-section" ${marker}"antenna" aria-labelledby="${id}">
          <span class="longform-kicker">Deploiement territorial</span>
          <h2 id="${id}">${label} : organiser un reseau local sans perdre la coherence nationale</h2>
          <p>Une antenne locale doit etre plus qu'un nom sur une carte. Elle doit disposer d'un territoire de reference, d'un responsable identifie, d'une methode commune, d'un cadre de validation, d'outils partages et d'un lien clair avec la gouvernance nationale. C'est cette coherence qui permet de grandir sans disperser l'association.</p>
          <p>Le developpement territorial de TVF doit rester progressif : commencer par des territoires pilotes, tester les formulaires, qualifier les premiers signalements, documenter les besoins, former des referents et formaliser les partenariats avant d'ouvrir largement le reseau.</p>
          ${cards([
            { title: "Une methode commune", text: "Chaque antenne doit utiliser les memes statuts de validation, les memes precautions de publication et les memes criteres de suivi." },
            { title: "Une adaptation locale", text: "Les priorites different entre ville moyenne, centre-bourg, outre-mer, quartier urbain dense ou territoire rural." },
            { title: "Un accompagnement national", text: "Le siege doit fournir outils, documentation, formation, support et controle de coherence." },
          ])}
          ${path([
            "Recevoir une candidature ou identifier un territoire prioritaire.",
            "Verifier l'equipe locale, les besoins et les ressources disponibles.",
            "Former les referents et cadrer la communication.",
            "Lancer progressivement les premiers signalements et projets qualifies.",
          ])}
          <div class="longform-note"><strong>Vision reseau :</strong> developper des antennes locales credibles, utiles et documentees avant toute annonce de couverture nationale.</div>
        </section>`,

  generic: (id, label) => `
        <section class="longform-section" ${marker}"generic" aria-labelledby="${id}">
          <span class="longform-kicker">Contenu renforce</span>
          <h2 id="${id}">${label} : donner plus de contexte, de methode et de lisibilite</h2>
          <p>Cette page s'inscrit dans l'architecture generale de Territoires Vivants France. Elle doit aider le visiteur a comprendre le probleme traite, le public concerne, le role de l'association, les donnees utiles, les limites actuelles et l'action possible. Le contenu doit donc depasser la simple presentation pour devenir une ressource de travail.</p>
          <p>La ligne editoriale retenue est institutionnelle : expliquer les enjeux, ne pas inventer de resultats, distinguer ce qui est operationnel de ce qui est prepare, et donner des chemins d'action clairs pour les habitants, collectivites, entreprises, proprietaires, benevoles et partenaires potentiels.</p>
          ${cards([
            { title: "Contexte", text: "Situer la page dans les enjeux nationaux de vacance, reemploi, insertion, sobriete fonciere et revitalisation locale." },
            { title: "Methode", text: "Montrer comment TVF qualifie les informations, mobilise les acteurs et construit une reponse progressive." },
            { title: "Action", text: "Orienter le visiteur vers le bon formulaire, la bonne ressource ou la bonne page de decision." },
          ])}
          <div class="longform-note"><strong>Regle de coherence :</strong> chaque page doit renforcer la confiance dans le projet national sans ajouter de chiffres ou de promesses non verifies.</div>
        </section>`,
};

function familyFor(file) {
  if (file === "index.html") return "home";
  if (/logements-vacants|habitat-vivant|bien-solidaire|proposer-un-bien|proprietaire/.test(file)) return "habitat";
  if (/commerces-inoccupes|commerce-vivant/.test(file)) return "commerce";
  if (/materiaux|materiautheque|banque-materiaux/.test(file)) return "materials";
  if (/friches|espaces-abandonnes/.test(file)) return "friches";
  if (/solidarite|insertion|benevoles|recrutement/.test(file)) return "insertion";
  if (/observatoire|carte|tableau|impact|mesure|statistiques/.test(file)) return "observatory";
  if (/financer|fonds|investisseur|mecene|don|projets-a-financer/.test(file)) return "financing";
  if (/signalement|agir|proposer|adherent|contact|faq/.test(file)) return "engagement";
  if (/admin|auth|api|supabase|plateforme|beta|comptes|formulaires|espace-projet|architecture|mobile/.test(file)) return "platform";
  if (/collectivites|entreprises|partenariat|partenaires|bailleurs|ecoles|universites|associations|fondations/.test(file)) return "partnerships";
  if (/antenne|association-nationale/.test(file)) return "antenna";
  if (/qui-sommes-nous|statuts|mentions|gouvernance|transparence|presse|ressources|centre|publications/.test(file)) return "institutional";
  if (/vision|feuille-route|methode/.test(file)) return "generic";
  return "generic";
}

function insertSection(html, section) {
  if (html.includes(marker)) return html;
  const docMatch = html.match(/\s*<section class="doc-section[^>]*data-deep-refonte=/i);
  if (docMatch && typeof docMatch.index === "number") {
    return html.slice(0, docMatch.index) + `\n${section}\n` + html.slice(docMatch.index);
  }
  return html.replace(/\s*<\/div>\s*<\/main>/i, `\n${section}\n      </div>\n    </main>`);
}

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = insertSection(html, section(file, familyFor(file)));
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`Expanded site copy in ${changed} pages`);
