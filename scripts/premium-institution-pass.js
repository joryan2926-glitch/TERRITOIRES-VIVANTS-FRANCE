const fs = require('fs');
const path = require('path');

const root = process.cwd();
const archPath = path.join(root, 'PUBLIC_ARCHITECTURE.md');
const publicPages = new Set([...fs.readFileSync(archPath, 'utf8').matchAll(/^- ([^\r\n]+\.html)$/gm)].map((m) => m[1]));
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html')).sort();

const pageProfiles = {
  'index.html': ['Comprendre TVF rapidement', 'Choisir le bon parcours', 'agir-avec-nous.html', 'Trouver mon parcours'],
  'qui-sommes-nous.html': ['Vérifier l’identité et la gouvernance', 'Identifier les responsables et le cadre', 'gouvernance.html', 'Voir la gouvernance'],
  'pourquoi-tvf-existe.html': ['Comprendre la valeur ajoutée TVF', 'Comparer les dispositifs existants', 'ce-que-fait-tvf.html', 'Comprendre le rôle TVF'],
  'ce-que-fait-tvf.html': ['Clarifier le périmètre d’action', 'Savoir ce que TVF coordonne ou ne fait pas', 'notre-methode.html', 'Voir la méthode'],
  'nos-actions.html': ['Identifier les leviers d’action', 'Orienter un besoin vers le bon parcours', 'parcours-demande.html', 'Construire une demande'],
  'notre-methode.html': ['Comprendre le processus opérationnel', 'Passer du constat au projet qualifié', 'documents-officiels.html', 'Voir les modèles'],
  'vision-france-2035.html': ['Lire la trajectoire nationale', 'Relier vision, territoires et impact', 'transparence.html', 'Voir la feuille de route'],
  'action-logements-vacants.html': ['Traiter un logement vacant', 'Qualifier propriétaire, usage et remise en état', 'proprietaires.html', 'Parcours propriétaire'],
  'action-commerces-inoccupes.html': ['Réactiver un commerce vacant', 'Relier local, porteur et utilité de proximité', 'signalement.html', 'Signaler un commerce'],
  'action-materiaux-reemploi.html': ['Valoriser des matériaux', 'Comprendre collecte, tri, affectation et suivi', 'banque-materiaux.html', 'Voir la Banque de Matériaux'],
  'action-espaces-abandonnes.html': ['Qualifier une friche ou un terrain', 'Identifier un usage utile et réaliste', 'signalement.html', 'Signaler un espace'],
  'action-solidarite-insertion.html': ['Relier projets et insertion', 'Cadrer bénévolat, chantier et formation', 'espace-benevoles.html', 'Devenir bénévole'],
  'nos-poles.html': ['Comprendre les cinq pôles', 'Voir comment les expertises se complètent', 'notre-methode.html', 'Voir la méthode'],
  'observatoire-national.html': ['Objectiver les besoins territoriaux', 'Lire les données avant d’agir', 'sources-donnees.html', 'Voir les sources'],
  'carte-territoires.html': ['Visualiser les territoires', 'Lire les couches de signalement et de projets', 'signalement.html', 'Contribuer à la carte'],
  'impact-resultats.html': ['Comprendre les indicateurs', 'Distinguer objectifs, résultats et preuves', 'mesure-impact.html', 'Voir la méthode d’impact'],
  'dossier-saint-etienne.html': ['Lire le diagnostic pilote', 'Comprendre les besoins de Saint-Étienne', 'tvf-enjeux-saint-etienne.html', 'Voir les enjeux locaux'],
  'tvf-enjeux-saint-etienne.html': ['Aligner TVF avec les politiques locales', 'Identifier les dispositifs compatibles', 'fiches-projets-territorialisees.html', 'Créer une fiche projet'],
  'fiches-projets-territorialisees.html': ['Transformer une idée en fiche action', 'Cadrer besoin, budget, convention et indicateurs', 'documents-officiels.html', 'Télécharger les modèles'],
  'etude-impact-saint-etienne.html': ['Lire l’impact prévisionnel', 'Distinguer données réelles et estimations', 'sources-etude-saint-etienne.html', 'Voir les sources'],
  'banque-materiaux.html': ['Comprendre la valorisation des ressources', 'Déposer ou orienter des matériaux utiles', 'proposer-materiaux.html', 'Proposer des matériaux'],
  'bien-solidaire-usage-partage.html': ['Étudier un bien inutilisé', 'Comprendre convention, usage, travaux et restitution', 'proposer-un-bien.html', 'Proposer un bien'],
  'financer-projets.html': ['Comprendre les financements possibles', 'Choisir mécénat, don, projet ou investissement', 'devenir-mecene.html', 'Devenir mécène'],
  'projets-pilotes.html': ['Lire les territoires pilotes', 'Comprendre les priorités sans faux résultat', 'dossier-saint-etienne.html', 'Voir Saint-Étienne'],
  'agir-avec-nous.html': ['Choisir comment contribuer', 'Accéder au parcours adapté à son profil', 'contact.html', 'Contacter TVF'],
  'signalement.html': ['Signaler une situation utile', 'Transmettre un lieu à qualifier avec prudence', 'carte-territoires.html', 'Voir la carte'],
  'proprietaires.html': ['Comprendre le parcours propriétaire', 'Cadrer bien, responsabilités, usage et convention', 'proposer-un-bien.html', 'Proposer un bien'],
  'parcours-demande.html': ['Choisir la bonne demande', 'Préparer pièces, interlocuteurs et décisions', 'documents-officiels.html', 'Voir les documents'],
  'antennes-locales.html': ['Comprendre l’implantation locale', 'Préparer un relais territorial crédible', 'devenir-antenne-locale.html', 'Créer une antenne'],
  'espace-collectivites.html': ['Comprendre l’intérêt pour une collectivité', 'Relier diagnostic, projet, convention et impact', 'contact.html', 'Devenir territoire partenaire'],
  'espace-entreprises.html': ['Comprendre l’engagement entreprise', 'Valoriser matériaux, compétences, mécénat et RSE', 'partenariat-entreprises.html', 'Devenir entreprise partenaire'],
  'espace-benevoles.html': ['Trouver une mission utile', 'Comprendre cadre, référent, sécurité et engagement', 'contact.html', 'Rejoindre une mission'],
  'partenaires.html': ['Comprendre les coopérations TVF', 'Identifier modalités et garanties sans faux partenaire', 'partenariats-strategiques.html', 'Voir les partenariats'],
  'partenariats-strategiques.html': ['Choisir un cadre de partenariat', 'Définir rôle, gouvernance, preuves et communication', 'contact.html', 'Proposer un partenariat'],
  'ressources.html': ['Accéder aux supports utiles', 'Trouver documents, guides, modèles et sources', 'documents-officiels.html', 'Voir les documents'],
  'kit-media.html': ['Utiliser l’identité TVF', 'Télécharger logo, présentation et règles d’usage', 'contact.html', 'Demander une validation'],
  'sources-donnees.html': ['Vérifier les sources nationales', 'Contrôler l’origine des chiffres publics', 'observatoire-national.html', 'Retour à l’observatoire'],
  'faq.html': ['Obtenir une réponse rapide', 'Orienter vers la bonne page ou le bon contact', 'contact.html', 'Poser une question'],
  'gouvernance.html': ['Comprendre la décision interne', 'Lire responsabilités, contrôle et transparence', 'transparence.html', 'Voir la transparence'],
  'transparence.html': ['Vérifier les garanties publiques', 'Accéder aux documents, feuille de route et limites', 'documents-officiels.html', 'Voir les documents'],
  'charte-ethique.html': ['Comprendre les principes TVF', 'Identifier limites, conflits d’intérêts et données', 'ce-que-tvf-ne-fait-pas.html', 'Voir les limites'],
  'documents-officiels.html': ['Télécharger les trames utiles', 'Cadrer conventions, pièces et décisions', 'parcours-demande.html', 'Préparer un dossier'],
  'ce-que-tvf-ne-fait-pas.html': ['Éviter les confusions', 'Comprendre les limites et responsabilités', 'ce-que-fait-tvf.html', 'Voir ce que fait TVF'],
  'statuts.html': ['Consulter le cadre statutaire', 'Identifier objet, siège et gouvernance', 'gouvernance.html', 'Voir la gouvernance'],
  'faire-un-don.html': ['Soutenir TVF', 'Comprendre affectation, transparence et suivi', 'financer-projets.html', 'Voir les financements'],
  'contact.html': ['Contacter le bon interlocuteur', 'Orienter une demande vers le bon parcours', 'parcours-demande.html', 'Préparer ma demande'],
  'mentions-legales.html': ['Vérifier les informations légales', 'Identifier l’éditeur et le cadre de publication', 'contact.html', 'Contacter TVF'],
  'politique-confidentialite.html': ['Comprendre l’usage des données', 'Vérifier finalités, droits et sécurité', 'contact.html', 'Exercer un droit']
};

function stripTags(s) { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function pageTitle(html, file) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).replace(/\s+/g, ' ');
  return file.replace(/\.html$/, '').replace(/-/g, ' ');
}
function defaultProfile(html, file) {
  const title = pageTitle(html, file);
  return ['Comprendre ' + title, 'Identifier l’information utile et le parcours adapté', 'contact.html', 'Contacter TVF'];
}
function insertBeforeMainEnd(html, block) {
  const idx = html.lastIndexOf('</main>');
  if (idx === -1) return html;
  return html.slice(0, idx) + block + '\n    ' + html.slice(idx);
}
function insertAfterHero(html, block) {
  if (html.includes('class="premium-decision-strip"')) return html;
  const heroEnd = html.search(/<\/section>\s*(?:<nav class="in-page-nav"|<section|<div class="page-wrap"|<main|$)/i);
  if (heroEnd === -1) return insertBeforeMainEnd(html, block);
  const endTag = html.indexOf('</section>', html.indexOf('<main'));
  if (endTag === -1) return insertBeforeMainEnd(html, block);
  const insertAt = endTag + '</section>'.length;
  return html.slice(0, insertAt) + '\n' + block + html.slice(insertAt);
}
function decisionStrip(profile) {
  const [why, useful, href, label] = profile;
  return `
      <section class="premium-decision-strip" aria-label="Lecture utile de la page">
        <article><span>Pourquoi cette page ?</span><strong>${why}</strong></article>
        <article><span>Ce qu’elle permet</span><strong>${useful}</strong></article>
        <article><span>Prochaine étape</span><a href="${href}">${label}</a></article>
      </section>`;
}
function audienceCta(file) {
  if (file === 'index.html') return '';
  return `
      <section class="premium-audience-cta" aria-label="Parcours par public">
        <div>
          <span class="dossier-kicker">Passer à l’action</span>
          <h2>Choisir le parcours adapté à votre rôle</h2>
          <p>Chaque demande doit être orientée vers un cadre clair : besoin territorial, propriétaire, ressource, financement, bénévolat ou coopération institutionnelle.</p>
        </div>
        <div class="audience-cta-grid">
          <a href="espace-collectivites.html"><strong>Collectivité</strong><span>Diagnostic, convention, données, impact.</span></a>
          <a href="proprietaires.html"><strong>Propriétaire</strong><span>Bien vacant, usage partagé, restitution.</span></a>
          <a href="espace-entreprises.html"><strong>Entreprise</strong><span>Matériaux, compétences, mécénat, RSE.</span></a>
          <a href="financer-projets.html"><strong>Financeur</strong><span>Projet qualifié, reporting, transparence.</span></a>
          <a href="espace-benevoles.html"><strong>Bénévole</strong><span>Mission utile, encadrement, suivi.</span></a>
          <a href="signalement.html"><strong>Citoyen</strong><span>Signalement, ressource, information terrain.</span></a>
        </div>
      </section>`;
}
function indexMatrix() {
  return `
      <section class="homepage-orientation-matrix" aria-labelledby="orientation-matrix-title">
        <span class="dossier-kicker">Orientation rapide</span>
        <h2 id="orientation-matrix-title">À qui s’adresse Territoires Vivants France ?</h2>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Vous êtes</th><th>Votre besoin</th><th>Parcours conseillé</th></tr></thead><tbody>
          <tr><td>Collectivité</td><td>Objectiver la vacance, les friches, les ressources et les priorités locales.</td><td><a href="espace-collectivites.html">Espace collectivités</a></td></tr>
          <tr><td>Propriétaire</td><td>Étudier un bien vacant, dégradé ou inutilisé dans un cadre sécurisé.</td><td><a href="proprietaires.html">Parcours propriétaire</a></td></tr>
          <tr><td>Entreprise</td><td>Valoriser matériaux, compétences, locaux ou mécénat dans une démarche territoriale.</td><td><a href="espace-entreprises.html">Espace entreprises</a></td></tr>
          <tr><td>Financeur ou mécène</td><td>Soutenir des projets qualifiés, traçables et utiles aux habitants.</td><td><a href="financer-projets.html">Financer les projets</a></td></tr>
          <tr><td>Habitant ou bénévole</td><td>Signaler, documenter, aider ou rejoindre une action encadrée.</td><td><a href="agir-avec-nous.html">Agir avec TVF</a></td></tr>
        </tbody></table></div>
      </section>`;
}

const globalReplacements = [
  [/Soutenir la structuration de TVF\./g, 'Soutenir TVF.'],
  [/Soutenir la structuration de TVF/g, 'Soutenir TVF'],
  [/Les expertises appel&eacute;es &agrave; structurer l'action nationale\./g, 'Les expertises de la revitalisation territoriale.'],
  [/Les expertises appelées à structurer l'action nationale\./g, 'Les expertises de la revitalisation territoriale.'],
  [/Association nationale en structuration/g, 'Association nationale basée à Saint-Étienne'],
  [/association en structuration/g, 'association nationale basée à Saint-Étienne'],
  [/en structuration/g, 'dans son déploiement national'],
  [/Pr&eacute;parer une implantation territoriale\./g, 'Créer un relais territorial encadré.'],
  [/Pr&eacute;parer une implantation territoriale/g, 'Créer un relais territorial encadré'],
  [/Pr&eacute;parer/g, 'Structurer'],
  [/pr&eacute;parer/g, 'structurer'],
  [/Préparer/g, 'Structurer'],
  [/préparer/g, 'structurer'],
  [/Pr&eacute;figuration/g, 'Territoire de référence'],
  [/Préfiguration/g, 'Territoire de référence'],
  [/pr&eacute;figuration/g, 'cadrage territorial'],
  [/préfiguration/g, 'cadrage territorial'],
  [/bêta/gi, 'opérationnel'],
  [/beta/gi, 'opérationnel'],
  [/B&ecirc;ta/g, 'Opérationnel'],
  [/Supabase/g, 'base de données sécurisée'],
  [/supabase/g, 'base de données sécurisée'],
  [/Non publi&eacute;/g, 'Donnée non publiée'],
  [/Non publié/g, 'Donnée non publiée']
];

let changed = [];
for (const file of htmlFiles) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;
  for (const [pattern, replacement] of globalReplacements) html = html.replace(pattern, replacement);
  // Demote headings inside repeated cards so the page hierarchy feels less noisy.
  html = html.replace(/(<article\b[^>]*class="[^"]*(?:strategy-card|resource-item|document-card|metric-card|antenna-profile|submenu-card|territory-card|dashboard-card)[^"]*"[^>]*>[\s\S]*?)<h2\b([^>]*)>/g, '$1<h3$2>');
  html = html.replace(/(<article\b[^>]*class="[^"]*(?:strategy-card|resource-item|document-card|metric-card|antenna-profile|submenu-card|territory-card|dashboard-card)[^"]*"[^>]*>[\s\S]*?)<\/h2>/g, '$1</h3>');
  if (publicPages.has(file)) {
    const profile = pageProfiles[file] || defaultProfile(html, file);
    html = insertAfterHero(html, decisionStrip(profile));
    if (!html.includes('class="premium-audience-cta"')) html = insertBeforeMainEnd(html, audienceCta(file));
    if (file === 'index.html' && !html.includes('class="homepage-orientation-matrix"')) html = insertBeforeMainEnd(html, indexMatrix());
  }
  if (html !== before) {
    fs.writeFileSync(full, html, 'utf8');
    changed.push(file);
  }
}

console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
