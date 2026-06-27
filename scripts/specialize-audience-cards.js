const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const solidarityBlock =
  /<article class="case-card"><h3>Chantier participatif encadre<\/h3><p>Mobiliser bénévoles et publics accompagn&eacute;s sur des tâches compatibles avec la sécurité et les compétences disponibles\.<\/p><\/article><article class="case-card"><h3>Atelier de valorisation<\/h3><p>Apprendre a trier, nettoyer, inventorier et préparer des matériaux pour un nouvel usage\.<\/p><\/article><article class="case-card"><h3>Découverte des métiers<\/h3><p>Relier r&eacute;novation, réemploi, médiation et animation territoriale a des parcours professionnels possibles\.<\/p><\/article>/g;

const solidarityCta =
  /<div><h2>Devenir benevole<\/h2><p>Les missions seront ouvertes progressivement selon les besoins réels et l'encadrement disponible\.<\/p><\/div>/g;

const partnerBlock =
  /<article class="case-card"><h3>Collectivité<\/h3><p>Demande de diagnostic, cartographie, animation locale ou projet pilote avec cadre de coopération a définir\.<\/p><\/article><article class="case-card"><h3>Entreprise<\/h3><p>Don de matériaux, mecenat de compétences, locaux disponibles ou soutien financier encadre\.<\/p><\/article><article class="case-card"><h3>Association ou école<\/h3><p>Mobilisation citoyenne, ateliers, pédagogie, chantiers ou documentation locale\.<\/p><\/article>/g;

const partnerCta =
  /<div><h2>Devenir partenaire<\/h2><p>Une coopération doit être qualifiée, document&eacute;e et validée avant toute publication publique\.<\/p><\/div>/g;

const replacements = {
  "action-solidarite-insertion.html": {
    block:
      '<article class="case-card"><h3>Mission encadrée</h3><p>Construire des tâches simples, utiles et sécurisées autour d’un chantier ou d’un inventaire local.</p></article><article class="case-card"><h3>Atelier pratique</h3><p>Initier au tri, à la préparation et à la documentation des ressources sans remplacer une formation certifiante.</p></article><article class="case-card"><h3>Passerelle emploi</h3><p>Relier l’expérience de terrain aux acteurs compétents de l’orientation, de l’insertion et de la formation.</p></article>',
    cta:
      '<div><h2>Proposer une mission solidaire</h2><p>Une action d’insertion doit être définie avec un besoin réel, un encadrement identifié et un cadre de sécurité.</p></div>'
  },
  "pole-solidarite-insertion.html": {
    block:
      '<article class="case-card"><h3>Repérage des missions</h3><p>Identifier ce qui peut être confié à des bénévoles, à des apprenants ou à des professionnels.</p></article><article class="case-card"><h3>Encadrement</h3><p>Définir les responsabilités, assurances, limites techniques et conditions d’accueil des participants.</p></article><article class="case-card"><h3>Progression</h3><p>Transformer une participation ponctuelle en parcours d’apprentissage ou d’engagement durable.</p></article>',
    cta:
      '<div><h2>Structurer un parcours d’engagement</h2><p>Le pôle prépare les méthodes, les règles et les relais nécessaires avant l’ouverture de missions.</p></div>'
  },
  "espace-benevoles.html": {
    block:
      '<article class="case-card"><h3>Mission courte</h3><p>Aider à documenter un lieu, une ressource ou un besoin local pendant quelques heures.</p></article><article class="case-card"><h3>Mission régulière</h3><p>Participer à la cartographie, à l’accueil, à la logistique ou au suivi d’une antenne.</p></article><article class="case-card"><h3>Compétence métier</h3><p>Mettre à disposition une expertise utile : bâtiment, droit, urbanisme, communication, données ou animation.</p></article>',
    cta:
      '<div><h2>Rejoindre les futures missions</h2><p>Les bénévoles seront sollicités selon les territoires actifs, les besoins vérifiés et l’encadrement disponible.</p></div>'
  },
  "espace-collectivites.html": {
    block:
      '<article class="case-card"><h3>Diagnostic territorial</h3><p>Partager les besoins locaux, les périmètres prioritaires et les données publiques mobilisables.</p></article><article class="case-card"><h3>Cadre de coopération</h3><p>Définir les responsabilités de la collectivité, de TVF et des acteurs associés.</p></article><article class="case-card"><h3>Projet pilote</h3><p>Tester une action limitée, mesurable et compatible avec les politiques publiques locales.</p></article>',
    cta:
      '<div><h2>Devenir territoire partenaire</h2><p>Une collectivité peut initier un échange autour d’un besoin identifié, d’un quartier ou d’un patrimoine vacant.</p></div>'
  },
  "espace-entreprises.html": {
    block:
      '<article class="case-card"><h3>Ressources disponibles</h3><p>Proposer des matériaux, équipements, locaux ou compétences avec traçabilité et conditions de retrait.</p></article><article class="case-card"><h3>Engagement RSE</h3><p>Relier la contribution de l’entreprise à un projet territorial documenté et utile aux habitants.</p></article><article class="case-card"><h3>Mécénat</h3><p>Préparer un soutien financier, matériel ou de compétence dans un cadre validé avant communication.</p></article>',
    cta:
      '<div><h2>Proposer une contribution entreprise</h2><p>Chaque contribution doit être qualifiée, tracée et affectée à un projet compatible avec l’objet de TVF.</p></div>'
  },
  "partenariats-strategiques.html": {
    block:
      '<article class="case-card"><h3>Partenariat public</h3><p>Articuler diagnostic, données, politiques locales et projets pilotes avec les collectivités concernées.</p></article><article class="case-card"><h3>Partenariat privé</h3><p>Encadrer mécénat, ressources, compétences ou locaux sans publier d’engagement non confirmé.</p></article><article class="case-card"><h3>Partenariat associatif</h3><p>Construire des actions de terrain, de médiation, d’accueil ou de formation autour de besoins réels.</p></article>',
    cta:
      '<div><h2>Construire une coopération stratégique</h2><p>Un partenariat TVF doit préciser objectifs, responsabilités, preuves attendues et règles de communication.</p></div>'
  }
};

let changed = 0;

for (const [file, data] of Object.entries(replacements)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  html = html.replace(solidarityBlock, data.block).replace(solidarityCta, data.cta);
  html = html.replace(partnerBlock, data.block).replace(partnerCta, data.cta);
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
