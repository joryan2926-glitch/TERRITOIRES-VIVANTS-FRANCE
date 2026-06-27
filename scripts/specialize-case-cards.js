const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const logementCaseBlock =
  /<article class="case-card"><h3>Logement vacant en centre-bourg<\/h3><p>Identifier le bien, comprendre les causes de vacance, orienter le propriétaire vers une solution de rénovation ou de convention d'usage\.<\/p><\/article><article class="case-card"><h3>Immeuble dégradé à qualifier<\/h3><p>Croiser état apparent, statut d'occupation, risques techniques et acteurs compétents avant toute communication publique\.<\/p><\/article><article class="case-card"><h3>Habitat solidaire temporaire<\/h3><p>Étudier une occupation encadrée pour répondre à un besoin local, seulement après accord du propriétaire et sécurisation du cadre\.<\/p><\/article>/g;

const bienCtaText =
  /<div><h2>Signaler ou proposer un bien<\/h2><p>Un bien ne doit être publié qu'après validation de son statut, de sa source et des conditions de diffusion\.<\/p><\/div>/g;

const signalementCaseBlock =
  /<article class="case-card"><h3>Signalement utile<\/h3><p>Adresse, commune, description, photo éventuelle et contact facultatif pour permettre une vérification\.<\/p><\/article><article class="case-card"><h3>Mission (?:benevole|b&eacute;n&eacute;vole)<\/h3><p>Accueil, cartographie, collecte, chantier, documentation ou animation selon le territoire\.<\/p><\/article><article class="case-card"><h3>Antenne locale<\/h3><p>Candidature, &eacute;tude du territoire, référents, convention et lancement progressif\.<\/p><\/article>/g;

const replacements = {
  "notre-methode.html": {
    caseBlock:
      '<article class="case-card"><h3>1. Observer</h3><p>Repérer les biens, ressources et besoins locaux sans conclure trop vite sur leur faisabilité.</p></article><article class="case-card"><h3>2. Qualifier</h3><p>Vérifier statut, risques, acteurs compétents, contraintes techniques et conditions de publication.</p></article><article class="case-card"><h3>3. Conventionner</h3><p>Formaliser les engagements avant tout chantier, usage temporaire ou mobilisation de ressources.</p></article>',
    cta:
      '<div><h2>Appliquer la méthode à un cas réel</h2><p>La méthode TVF sert à passer d’une idée locale à une fiche qualifiée, vérifiable et conventionnable.</p></div>'
  },
  "vision-france-2035.html": {
    caseBlock:
      '<article class="case-card"><h3>2026-2027</h3><p>Structurer le territoire pilote, documenter les premiers besoins et consolider les règles de publication.</p></article><article class="case-card"><h3>2028-2030</h3><p>Étendre l’observatoire, les antennes locales et la banque de matériaux à plusieurs territoires volontaires.</p></article><article class="case-card"><h3>2035</h3><p>Disposer d’un réseau national capable de relier patrimoine vacant, réemploi et projets locaux suivis.</p></article>',
    cta:
      '<div><h2>Transformer la vision en feuille de route</h2><p>Chaque étape nationale doit rester rattachée à des territoires pilotes, des conventions et des indicateurs vérifiables.</p></div>'
  },
  "action-logements-vacants.html": {
    caseBlock:
      '<article class="case-card"><h3>Maison vacante</h3><p>Comprendre pourquoi le logement est fermé, identifier le propriétaire et évaluer les travaux nécessaires.</p></article><article class="case-card"><h3>Immeuble ancien</h3><p>Repérer les risques techniques, les diagnostics manquants et les acteurs à associer avant toute orientation.</p></article><article class="case-card"><h3>Usage temporaire</h3><p>Étudier un logement étudiant, solidaire ou intergénérationnel lorsque le cadre juridique et assurantiel le permet.</p></article>',
    cta:
      '<div><h2>Signaler ou proposer un logement</h2><p>Un logement n’est étudié qu’après vérification du statut, accord du propriétaire et qualification des contraintes.</p></div>'
  },
  "bien-solidaire-usage-partage.html": {
    caseBlock:
      '<article class="case-card"><h3>Bien sans budget travaux</h3><p>Évaluer si une remise en état peut être liée à un usage temporaire utile au territoire.</p></article><article class="case-card"><h3>Convention d’usage</h3><p>Définir durée, responsabilités, accès, entretien, assurance, charges et conditions de restitution.</p></article><article class="case-card"><h3>Usage partagé</h3><p>Orienter le bien vers logement, commerce, association, formation ou tiers-lieu selon le besoin local.</p></article>',
    cta:
      '<div><h2>Proposer un bien solidaire</h2><p>Le propriétaire conserve son bien ; l’usage et les engagements sont étudiés puis encadrés par convention.</p></div>'
  },
  "projets-pilotes.html": {
    caseBlock:
      '<article class="case-card"><h3>Saint-Étienne</h3><p>Documenter un pilote associant habitat ancien, matériaux, centralités commerciales et besoins sociaux.</p></article><article class="case-card"><h3>Outre-mer</h3><p>Préparer des déclinaisons adaptées aux contraintes insulaires, climatiques, foncières et logistiques.</p></article><article class="case-card"><h3>Modèle reproductible</h3><p>Transformer chaque expérimentation en méthode, fiche projet, convention et indicateurs partageables.</p></article>',
    cta:
      '<div><h2>Préparer un territoire pilote</h2><p>Un pilote doit partir d’un besoin public identifié, d’acteurs mobilisables et de moyens vérifiables.</p></div>'
  },
  "agir-avec-nous.html": {
    signalBlock:
      '<article class="case-card"><h3>Je signale</h3><p>Transmettre un lieu vacant, un matériau ou un besoin local avec les informations minimales de vérification.</p></article><article class="case-card"><h3>Je participe</h3><p>Rejoindre une mission compatible avec ses compétences, son temps disponible et le cadre de sécurité.</p></article><article class="case-card"><h3>Je structure</h3><p>Aider à créer une antenne, un partenariat ou une fiche projet avec des responsabilités claires.</p></article>'
  },
  "signalement.html": {
    signalBlock:
      '<article class="case-card"><h3>Lieu à qualifier</h3><p>Décrire précisément l’adresse, l’état apparent, le type de bien et les informations déjà connues.</p></article><article class="case-card"><h3>Photo utile</h3><p>Ajouter une photo autorisée, sans entrer sur une propriété privée ni exposer de données personnelles.</p></article><article class="case-card"><h3>Après l’envoi</h3><p>Le signalement doit être vérifié, dédoublonné et classé avant toute diffusion publique.</p></article>'
  },
  "antennes-locales.html": {
    signalBlock:
      '<article class="case-card"><h3>Référent local</h3><p>Identifier une personne ou une équipe capable de coordonner les premiers échanges sur le territoire.</p></article><article class="case-card"><h3>Diagnostic partagé</h3><p>Recenser les besoins, ressources, acteurs et contraintes avant d’annoncer une antenne active.</p></article><article class="case-card"><h3>Lancement progressif</h3><p>Formaliser le périmètre, les responsabilités, les outils communs et la communication locale.</p></article>'
  },
  "faire-un-don.html": {
    signalBlock:
      '<article class="case-card"><h3>Don citoyen</h3><p>Soutenir la structuration, les outils, les diagnostics et les actions locales lorsqu’elles seront engagées.</p></article><article class="case-card"><h3>Don affecté</h3><p>Préparer une contribution liée à un projet, sous réserve d’un cadre validé et d’un suivi transparent.</p></article><article class="case-card"><h3>Preuve d’usage</h3><p>Publier les résultats uniquement après dépenses réelles, justificatifs et indicateurs vérifiés.</p></article>'
  },
  "contact.html": {
    signalBlock:
      '<article class="case-card"><h3>Demande générale</h3><p>Présenter le sujet, le territoire concerné et le type de réponse attendue.</p></article><article class="case-card"><h3>Projet local</h3><p>Préciser le bien, le besoin, les acteurs déjà identifiés et le calendrier envisagé.</p></article><article class="case-card"><h3>Partenariat</h3><p>Indiquer la contribution possible : compétence, matériau, financement, local ou relais territorial.</p></article>'
  }
};

let changed = 0;

for (const [file, replacement] of Object.entries(replacements)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  const before = html;

  if (replacement.caseBlock) html = html.replace(logementCaseBlock, replacement.caseBlock);
  if (replacement.cta) html = html.replace(bienCtaText, replacement.cta);
  if (replacement.signalBlock) html = html.replace(signalementCaseBlock, replacement.signalBlock);

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
