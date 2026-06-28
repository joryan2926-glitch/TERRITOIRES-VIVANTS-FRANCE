const fs = require("fs");
const path = require("path");

const root = process.cwd();

const sources = {
  inseeSaintEtienne: "https://www.insee.fr/fr/statistiques/2011101?geo=COM-42218",
  inseeFrance: "https://www.insee.fr/fr/statistiques/2011101?geo=FE-1",
  sdesWaste: "https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france",
  cartofriches: "https://cartofriches.cerema.fr/cartofriches/",
  fondsFriches: "https://fonds-friches.beta.gouv.fr/",
  actionCoeurVille: "https://agence-cohesion-territoires.gouv.fr/action-coeur-de-ville-42",
};

function upsertSection(file, id, html) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return false;
  let page = fs.readFileSync(full, "utf8");
  const marker = `data-phase2-credibility="${id}"`;
  const blockPattern = new RegExp(`\\s*<section[^>]*${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^>]*>[\\s\\S]*?<\\/section>`, "i");
  page = page.replace(blockPattern, "");
  const insertion = `\n${html.trim()}\n`;
  if (/<\/main>/i.test(page)) {
    page = page.replace(/<\/main>/i, `${insertion}    </main>`);
  } else {
    page = page.replace(/<footer/i, `${insertion}<footer`);
  }
  fs.writeFileSync(full, page, "utf8");
  return true;
}

const saintEtienneBlock = `
      <section class="phase2-section data-dossier" data-phase2-credibility="saint-etienne-kpis" aria-labelledby="phase2-ste-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Données officielles à jour</span>
          <h2 id="phase2-ste-title">Saint-Étienne : repères clés pour prioriser l'action TVF</h2>
          <p>Ces chiffres ne sont pas des résultats de TVF. Ils servent à objectiver les besoins du territoire pilote, à préparer le dialogue avec les collectivités et à identifier les sujets qui méritent une qualification de terrain.</p>
        </div>
        <div class="phase2-kpi-grid">
          <article><strong>173 136</strong><span>habitants en 2023</span><small>Population municipale INSEE.</small></article>
          <article><strong>12 175</strong><span>logements vacants en 2023</span><small>Environ 12 % du parc de logements communal.</small></article>
          <article><strong>30,4 %</strong><span>taux de pauvreté en 2023</span><small>Indicateur Filosofi, à relier aux enjeux de logement et d'insertion.</small></article>
          <article><strong>19 %</strong><span>chômage au sens du recensement</span><small>Population de 15 à 64 ans, INSEE 2023.</small></article>
        </div>
        <div class="phase2-analysis-grid">
          <article>
            <h3>Ce que ces données changent</h3>
            <p>Une vacance élevée ne signifie pas que tous les logements sont immédiatement mobilisables. Elle indique surtout qu'un travail de qualification est nécessaire : état du bien, propriété, blocages juridiques, coût de remise en état, potentiel d'usage et compatibilité avec les politiques publiques locales.</p>
          </article>
          <article>
            <h3>Le rôle utile de TVF</h3>
            <p>TVF peut apporter une méthode complémentaire : repérer, documenter, orienter les propriétaires, rapprocher les ressources de réemploi, préparer des scénarios conventionnés et suivre les effets réels lorsque les projets existent.</p>
          </article>
        </div>
        <p class="phase2-source">Sources : <a href="${sources.inseeSaintEtienne}" target="_blank" rel="noopener">INSEE, dossier complet Saint-Étienne</a>.</p>
      </section>`;

const franceObservatoryBlock = `
      <section class="phase2-section national-observatory" data-phase2-credibility="france-kpis" aria-labelledby="phase2-france-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Chiffres clés France</span>
          <h2 id="phase2-france-title">Un enjeu national : vacance, friches et ressources gaspillées</h2>
          <p>TVF doit être compris comme un outil de coordination : les données nationales montrent l'ampleur du sujet, mais l'action ne peut être crédible qu'à partir de diagnostics locaux sourcés.</p>
        </div>
        <div class="phase2-kpi-grid">
          <article><strong>2,97 M</strong><span>logements vacants en France en 2023</span><small>INSEE, France hors Mayotte.</small></article>
          <article><strong>7,8 %</strong><span>part des logements vacants</span><small>Repère national INSEE 2023.</small></article>
          <article><strong>310 Mt</strong><span>déchets produits en 2020</span><small>SDES, bilan national des déchets.</small></article>
          <article><strong>3 375 ha</strong><span>friches recyclées ou en recyclage via le Fonds friches</span><small>Données publiques Fonds friches / Cerema.</small></article>
        </div>
        <div class="phase2-analysis-grid">
          <article>
            <h3>Ce qu'il faut éviter</h3>
            <p>Un chiffre national ne suffit pas à lancer un projet. Il faut distinguer vacance statistique, vacance durable, friche disponible, propriété maîtrisée, contraintes environnementales et faisabilité économique.</p>
          </article>
          <article>
            <h3>Ce que l'observatoire TVF doit apporter</h3>
            <p>Un langage commun entre habitants, propriétaires, collectivités, entreprises et financeurs : localisation, qualification, statut, ressources mobilisables, niveau de maturité et indicateurs d'impact vérifiables.</p>
          </article>
        </div>
        <p class="phase2-source">Sources : <a href="${sources.inseeFrance}" target="_blank" rel="noopener">INSEE France</a>, <a href="${sources.sdesWaste}" target="_blank" rel="noopener">SDES déchets</a>, <a href="${sources.cartofriches}" target="_blank" rel="noopener">Cartofriches Cerema</a>, <a href="${sources.fondsFriches}" target="_blank" rel="noopener">Fonds friches</a>.</p>
      </section>`;

const caseStudiesBlock = `
      <section class="phase2-section case-studies" data-phase2-credibility="case-studies" aria-labelledby="phase2-cases-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Études de cas types</span>
          <h2 id="phase2-cases-title">Trois scénarios réalistes pour comprendre la méthode TVF</h2>
          <p>Ces exemples sont des scénarios pédagogiques, pas des projets réalisés. Ils montrent comment un besoin local pourrait être transformé en dossier qualifié, conventionné et mesurable.</p>
        </div>
        <div class="phase2-case-grid">
          <article>
            <span>Avant / Après</span>
            <h3>Commerce fermé en rez-de-chaussée</h3>
            <p><strong>Avant :</strong> vitrine fermée, propriétaire isolé, incertitude sur les travaux et absence de porteur d'activité.</p>
            <p><strong>Après visé :</strong> boutique test, atelier d'artisan, local associatif ou service de proximité, avec convention d'usage et indicateurs de fréquentation.</p>
            <ul><li>Acteurs : commune, propriétaire, porteur d'activité, artisans.</li><li>Preuves : état initial, budget, autorisations, usage, durée, suivi.</li></ul>
          </article>
          <article>
            <span>Avant / Après</span>
            <h3>Logement vacant ancien</h3>
            <p><strong>Avant :</strong> logement non occupé, travaux coûteux, propriétaire sans solution opérationnelle.</p>
            <p><strong>Après visé :</strong> logement temporaire, intergénérationnel, étudiant ou associatif, si les diagnostics et la convention le permettent.</p>
            <ul><li>Acteurs : propriétaire, collectivité, financeurs, artisans.</li><li>Preuves : diagnostics, devis, financement, convention, remise en usage.</li></ul>
          </article>
          <article>
            <span>Avant / Après</span>
            <h3>Friche ou terrain délaissé</h3>
            <p><strong>Avant :</strong> espace peu utilisé, image dégradée, usages informels, absence de projet partagé.</p>
            <p><strong>Après visé :</strong> jardin partagé, espace pédagogique, lieu culturel temporaire ou réserve de biodiversité selon les contraintes.</p>
            <ul><li>Acteurs : collectivité, habitants, associations, techniciens.</li><li>Preuves : maîtrise foncière, sécurité, entretien, impact social et environnemental.</li></ul>
          </article>
        </div>
      </section>`;

const territoryMapBlock = `
      <section class="phase2-section future-map" data-phase2-credibility="future-map" aria-labelledby="phase2-map-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Carte interactive à faire évoluer</span>
          <h2 id="phase2-map-title">Une carte nationale conçue pour suivre les futurs territoires pilotes</h2>
          <p>La carte doit devenir un outil de lecture rapide : où TVF observe, où des besoins sont signalés, où des ressources sont disponibles, où un territoire pourrait devenir partenaire.</p>
        </div>
        <div class="phase2-map-layout">
          <div class="phase2-france-map" aria-hidden="true">
            <span class="map-pin pilot">Saint-Étienne</span>
            <span class="map-pin west">Ouest</span>
            <span class="map-pin antilles">Antilles</span>
            <span class="map-pin indian">Océan Indien</span>
          </div>
          <div class="phase2-map-list">
            <h3>Couches prévues</h3>
            <ul>
              <li>Territoires pilotes et antennes en préparation.</li>
              <li>Signalements qualifiés : logements, commerces, friches, terrains.</li>
              <li>Ressources : matériaux, locaux, équipements, compétences.</li>
              <li>Partenaires confirmés après accord de publication.</li>
              <li>Indicateurs d'impact réellement vérifiés.</li>
            </ul>
          </div>
        </div>
      </section>`;

const partnersBlock = `
      <section class="phase2-section partners-v1" data-phase2-credibility="partners-v1" aria-labelledby="phase2-partners-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Partenaires et financeurs</span>
          <h2 id="phase2-partners-title">Préparer des espaces partenaires sans annoncer de faux soutiens</h2>
          <p>Cette page doit présenter les modalités de coopération, les bénéfices attendus et les preuves à produire. Aucun logo ne doit être affiché tant qu'un accord de publication n'existe pas.</p>
        </div>
        <div class="phase2-partner-grid">
          <article><h3>Collectivités</h3><p>Diagnostic territorial, repérage des biens, animation locale, conventions de coopération, tableau de bord et reporting.</p><a href="espace-collectivites.html">Parcours collectivité</a></article>
          <article><h3>Entreprises</h3><p>Dons de matériaux, mécénat de compétences, locaux, visibilité RSE encadrée et traçabilité des contributions.</p><a href="espace-entreprises.html">Parcours entreprise</a></article>
          <article><h3>Financeurs</h3><p>Fiches projet, budget, statut d'avancement, indicateurs, gouvernance et rapport d'affectation.</p><a href="financer-projets.html">Financer les projets</a></article>
        </div>
      </section>`;

const impactBlock = `
      <section class="phase2-section impact-framework" data-phase2-credibility="impact-framework" aria-labelledby="phase2-impact-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Mesure d'impact</span>
          <h2 id="phase2-impact-title">Mesurer uniquement ce qui est réel, daté et vérifiable</h2>
          <p>La page Impact doit devenir le tableau de bord de confiance de TVF. Les compteurs resteront à zéro tant que les projets ne sont pas réalisés ou validés.</p>
        </div>
        <table class="phase2-table">
          <thead><tr><th>Indicateur</th><th>Définition</th><th>Preuve attendue</th></tr></thead>
          <tbody>
            <tr><th>Logements remis en usage</th><td>Logements effectivement occupés après intervention documentée.</td><td>Convention, diagnostics, état initial/final, preuve d'occupation.</td></tr>
            <tr><th>Commerces accompagnés</th><td>Locaux vacants ayant fait l'objet d'un diagnostic ou d'un usage activé.</td><td>Fiche local, accord propriétaire, usage, durée.</td></tr>
            <tr><th>Matériaux réemployés</th><td>Matériaux affectés à un projet validé, non simplement donnés.</td><td>Inventaire, photos, destination, estimation de poids/volume.</td></tr>
            <tr><th>Déchets évités</th><td>Quantité estimée de matériaux détournés de l'élimination.</td><td>Méthode de calcul, bordereaux si disponibles, traçabilité.</td></tr>
            <tr><th>Bénévoles mobilisés</th><td>Personnes ayant participé à une action encadrée.</td><td>Feuilles de présence, missions, heures réalisées.</td></tr>
          </tbody>
        </table>
      </section>`;

const pressBlock = `
      <section class="phase2-section press-room" data-phase2-credibility="press-room" aria-labelledby="phase2-press-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Espace presse</span>
          <h2 id="phase2-press-title">Préparer un kit média sobre, vérifiable et réutilisable</h2>
          <p>La presse doit pouvoir comprendre TVF rapidement sans confondre ambition, expérimentation et résultats acquis.</p>
        </div>
        <div class="phase2-press-grid">
          <article><h3>Dossier de presse</h3><p>Présentation de l'association, objet, siège, gouvernance connue, territoire pilote, méthode et limites actuelles.</p></article>
          <article><h3>Kit média</h3><p>Logo, photos autorisées, éléments de langage, charte d'utilisation et contacts presse à compléter.</p></article>
          <article><h3>Communiqués</h3><p>Modèles prêts à l'emploi : lancement, appel à contribution, ouverture d'antenne, publication d'un rapport, partenariat confirmé.</p></article>
        </div>
      </section>`;

const collectivitesBlock = `
      <section class="phase2-section collectivite-journey" data-phase2-credibility="collectivite-journey" aria-labelledby="phase2-collectivites-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Devenir territoire partenaire</span>
          <h2 id="phase2-collectivites-title">Un parcours en sept étapes pour une collectivité</h2>
          <p>Le parcours doit rassurer les élus et les services : TVF n'intervient pas à la place de la collectivité, mais propose un cadre de coordination, de qualification et de suivi.</p>
        </div>
        <ol class="phase2-steps">
          <li><strong>Contact initial</strong><span>Identifier l'interlocuteur, le périmètre et le besoin prioritaire.</span></li>
          <li><strong>Note de cadrage</strong><span>Définir les objectifs, données disponibles, contraintes et livrables attendus.</span></li>
          <li><strong>Diagnostic rapide</strong><span>Repérer logements, commerces, friches, ressources et acteurs locaux.</span></li>
          <li><strong>Comité local</strong><span>Associer services, propriétaires, associations, entreprises et financeurs potentiels.</span></li>
          <li><strong>Fiches projet</strong><span>Transformer les situations repérées en dossiers qualifiés et arbitrables.</span></li>
          <li><strong>Convention</strong><span>Formaliser rôles, durée, responsabilités, données, communication et indicateurs.</span></li>
          <li><strong>Suivi public</strong><span>Publier uniquement les actions validées et les résultats démontrables.</span></li>
        </ol>
      </section>`;

const testimonialsBlock = `
      <section class="phase2-section testimonial-placeholders" data-phase2-credibility="testimonials" aria-labelledby="phase2-testimonials-title">
        <div class="phase2-head">
          <span class="dossier-kicker">Témoignages à intégrer progressivement</span>
          <h2 id="phase2-testimonials-title">Des retours terrain à publier seulement lorsqu'ils existent</h2>
          <p>Les témoignages ci-dessous sont des emplacements éditoriaux. Ils devront être remplacés par des citations réelles, validées et datées dès les premiers projets ou partenariats.</p>
        </div>
        <div class="phase2-testimonial-grid">
          <blockquote><p>« À compléter avec le retour d'une collectivité partenaire après diagnostic. »</p><cite>Collectivité - témoignage à venir</cite></blockquote>
          <blockquote><p>« À compléter avec le retour d'un propriétaire après convention. »</p><cite>Propriétaire - témoignage à venir</cite></blockquote>
          <blockquote><p>« À compléter avec le retour d'une entreprise contributrice. »</p><cite>Entreprise - témoignage à venir</cite></blockquote>
        </div>
      </section>`;

const insertions = [
  ["dossier-saint-etienne.html", "saint-etienne-kpis", saintEtienneBlock],
  ["tvf-enjeux-saint-etienne.html", "saint-etienne-kpis", saintEtienneBlock],
  ["observatoire-national.html", "france-kpis", franceObservatoryBlock],
  ["sources-donnees.html", "france-kpis", franceObservatoryBlock],
  ["projets-pilotes.html", "case-studies", caseStudiesBlock],
  ["nos-actions.html", "case-studies", caseStudiesBlock],
  ["carte-territoires.html", "future-map", territoryMapBlock],
  ["carte-interactive-nationale.html", "future-map", territoryMapBlock],
  ["partenaires.html", "partners-v1", partnersBlock],
  ["partenariats-strategiques.html", "partners-v1", partnersBlock],
  ["impact-resultats.html", "impact-framework", impactBlock],
  ["mesure-impact.html", "impact-framework", impactBlock],
  ["espace-presse.html", "press-room", pressBlock],
  ["espace-collectivites.html", "collectivite-journey", collectivitesBlock],
  ["partenariat-collectivites.html", "collectivite-journey", collectivitesBlock],
  ["qui-sommes-nous.html", "testimonials", testimonialsBlock],
  ["agir-avec-nous.html", "testimonials", testimonialsBlock],
];

let changed = 0;
for (const [file, id, html] of insertions) {
  if (upsertSection(file, id, html)) changed += 1;
}

console.log(JSON.stringify({ changed }, null, 2));
