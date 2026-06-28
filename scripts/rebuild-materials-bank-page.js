const fs = require("fs");
const path = require("path");

const root = process.cwd();
const file = path.join(root, "banque-materiaux.html");
let html = fs.readFileSync(file, "utf8");

const main = `
    <main class="materials-bank-page">
      <section class="page-hero materials-bank-hero">
        <div>
          <span class="page-status" data-status="experimental">Dispositif exp&eacute;rimental</span>
          <span class="hero-eyebrow">Economie circulaire et revitalisation</span>
          <h1>Banque de <span>Mat&eacute;riaux TVF</span></h1>
          <p>Un dispositif territorial pour identifier, qualifier et orienter les ressources inutilis&eacute;es vers des projets utiles aux habitants, aux associations et aux territoires.</p>
          <div class="hero-actions">
            <a class="button primary" href="proposer-materiaux.html">Proposer une ressource</a>
            <a class="button secondary" href="#fonctionnement">Comprendre le dispositif</a>
          </div>
        </div>
        <img decoding="async" fetchpriority="high" class="page-hero-photo" src="assets/photos/brownfield-lille.jpg" alt="Professionnels r&eacute;unis sur un chantier de construction" />
      </section>

      <div class="page-wrap">
        <section class="materials-bank-intro" data-professional-enrichment="materials" aria-labelledby="materials-position-title">
          <div>
            <span class="materials-kicker">Notre positionnement</span>
            <h2 id="materials-position-title">Donner une destination territoriale aux ressources encore utiles</h2>
            <p>La Banque de Mat&eacute;riaux TVF n&rsquo;est pas une plateforme de distribution gratuite. Elle constitue un outil de valorisation territoriale : chaque ressource propos&eacute;e est examin&eacute;e au regard de son &eacute;tat, de sa tra&ccedil;abilit&eacute;, des contraintes de retrait et surtout de son utilit&eacute; pour un projet identifi&eacute;.</p>
            <p>Le dispositif relie des ressources dormantes &agrave; des besoins concrets : r&eacute;habilitation d&rsquo;un local associatif, am&eacute;nagement d&rsquo;un espace de proximit&eacute;, chantier solidaire, remise en usage d&rsquo;un bien vacant ou &eacute;quipement d&rsquo;une activit&eacute; locale. TVF qualifie les projets et d&eacute;cide de l&rsquo;affectation des ressources selon leur utilit&eacute; territoriale, leur s&eacute;curit&eacute; et les conventions applicables. Un don ne cr&eacute;e aucun droit &agrave; une distribution libre ou automatique.</p>
          </div>
          <aside class="materials-positioning" aria-label="Principe directeur">
            <strong>Principe directeur</strong>
            <p>Une ressource n&rsquo;entre dans le dispositif que si elle peut &ecirc;tre document&eacute;e, mobilis&eacute;e dans des conditions s&ucirc;res et affect&eacute;e &agrave; un usage territorial coh&eacute;rent.</p>
          </aside>
        </section>

        <section class="materials-section" aria-labelledby="why-title">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Pourquoi agir</span><h2 id="why-title">Des ressources disponibles, mais des fili&egrave;res encore fragment&eacute;es</h2></div>
            <p>Le gaspillage ne r&eacute;sulte pas seulement d&rsquo;un manque de volont&eacute;. Il vient aussi d&rsquo;un d&eacute;faut d&rsquo;inventaire, de temps, de stockage, de qualification technique et de coordination entre les acteurs.</p>
          </div>
          <div class="materials-issues">
            <article class="materials-issue"><h3>Gaspillage de ressources</h3><p>Des portes, menuiseries, sanitaires, luminaires, outils ou mobiliers peuvent perdre toute valeur d&rsquo;usage faute d&rsquo;&ecirc;tre rep&eacute;r&eacute;s avant un chantier, un d&eacute;m&eacute;nagement ou une fermeture.</p></article>
            <article class="materials-issue"><h3>Poids des d&eacute;chets du BTP</h3><p>La construction concentre l&rsquo;essentiel des d&eacute;chets min&eacute;raux produits en France. Recycler est utile, mais pr&eacute;server l&rsquo;objet ou le mat&eacute;riau avant qu&rsquo;il devienne un d&eacute;chet conserve davantage de valeur.</p></article>
            <article class="materials-issue"><h3>Co&ucirc;t des approvisionnements</h3><p>La hausse et la volatilit&eacute; des prix fragilisent les petits projets. Le r&eacute;emploi local peut compl&eacute;ter l&rsquo;achat neuf lorsque les dimensions, l&rsquo;&eacute;tat et le calendrier sont compatibles.</p></article>
            <article class="materials-issue"><h3>Patrimoine vacant</h3><p>La remise en usage d&rsquo;un logement, d&rsquo;un commerce ou d&rsquo;un local suppose souvent des travaux que les propri&eacute;taires ou porteurs de projet ne peuvent financer seuls.</p></article>
            <article class="materials-issue"><h3>Associations sous contraintes</h3><p>Les structures locales ont besoin de mobilier, d&rsquo;outillage et d&rsquo;&eacute;quipements, mais disposent rarement du temps, des comp&eacute;tences logistiques ou des budgets n&eacute;cessaires pour organiser seules le r&eacute;emploi.</p></article>
            <article class="materials-issue"><h3>Projets publics &agrave; arbitrer</h3><p>Les collectivit&eacute;s doivent concilier entretien du patrimoine, services &agrave; la population et sobri&eacute;t&eacute; budg&eacute;taire. Une ressource inutilis&eacute;e peut devenir un levier pour un projet local encadr&eacute;.</p></article>
          </div>

          <div class="materials-data-band" aria-label="Chiffres publics de contexte">
            <article class="materials-data-item"><strong>310 Mt</strong><span>de d&eacute;chets produits en France en 2020</span><small>Dernier bilan national consolid&eacute; publi&eacute; par le SDES.</small></article>
            <article class="materials-data-item"><strong>66 %</strong><span>des tonnages sont des d&eacute;chets min&eacute;raux</span><small>Ils proviennent principalement du secteur de la construction.</small></article>
            <article class="materials-data-item"><strong>74 %</strong><span>des d&eacute;chets min&eacute;raux sont valoris&eacute;s</span><small>La valorisation mati&egrave;re ne doit pas &ecirc;tre confondue avec le r&eacute;emploi.</small></article>
            <article class="materials-data-item"><strong>35 Mt</strong><span>environ de d&eacute;chets inertes du b&acirc;timent</span><small>Auxquels s&rsquo;ajoutent environ 10 Mt de d&eacute;chets non dangereux non inertes.</small></article>
          </div>
          <p class="materials-source-note">Sources : <a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener" target="_blank">SDES, Bilan 2020 de la production de d&eacute;chets en France</a> ; <a href="https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb" rel="noopener" target="_blank">Minist&egrave;re de la Transition &eacute;cologique, fili&egrave;re PMCB</a>. Ces chiffres d&eacute;crivent le contexte national et non les r&eacute;sultats de TVF.</p>
        </section>

        <section class="materials-section" aria-labelledby="contributors-title">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Qui peut contribuer</span><h2 id="contributors-title">Quatre portes d&rsquo;entr&eacute;e, une m&ecirc;me exigence de tra&ccedil;abilit&eacute;</h2></div>
            <p>La contribution peut porter sur un bien, du mobilier, des mat&eacute;riaux, un &eacute;quipement ou des comp&eacute;tences. Elle fait toujours l&rsquo;objet d&rsquo;une qualification avant toute orientation.</p>
          </div>
          <div class="materials-actors">
            <article class="materials-actor">
              <span class="materials-actor-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V9l8-5 8 5v12M8 21v-5h8v5M8 11h.01M12 11h.01M16 11h.01"/></svg></span>
              <div><h3>Collectivit&eacute;s</h3><p>Communes et intercommunalit&eacute;s peuvent signaler ou mettre &agrave; disposition des ressources publiques devenues sans usage imm&eacute;diat.</p></div>
              <ul class="materials-list"><li>mat&eacute;riaux et mobilier</li><li>b&acirc;timents ou locaux vacants</li><li>terrains et espaces inutilis&eacute;s</li><li>&eacute;quipements publics</li></ul>
            </article>
            <article class="materials-actor">
              <span class="materials-actor-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V8l5-3v16M10 10l9-4v15M7 11h1M7 14h1M13 11h2M13 14h2M13 17h2"/></svg></span>
              <div><h3>Entreprises</h3><p>Les entreprises peuvent anticiper la seconde vie de ressources issues d&rsquo;un chantier, d&rsquo;un renouvellement d&rsquo;&eacute;quipement ou d&rsquo;un changement d&rsquo;activit&eacute;.</p></div>
              <ul class="materials-list"><li>surplus et invendus</li><li>mat&eacute;riaux de chantier</li><li>mobilier professionnel</li><li>&eacute;quipements techniques</li></ul>
            </article>
            <article class="materials-actor">
              <span class="materials-actor-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M9 11h6M12 8v6"/></svg></span>
              <div><h3>Associations</h3><p>Une association peut proposer du mat&eacute;riel, partager des comp&eacute;tences ou rejoindre la mobilisation autour d&rsquo;un projet territorial.</p></div>
              <ul class="materials-list"><li>mat&eacute;riels et &eacute;quipements</li><li>comp&eacute;tences techniques</li><li>b&eacute;n&eacute;volat de terrain</li><li>connaissance des besoins locaux</li></ul>
            </article>
            <article class="materials-actor">
              <span class="materials-actor-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 21v-3M16 21v-3"/></svg></span>
              <div><h3>Particuliers</h3><p>Chaque citoyen peut contribuer &agrave; la revitalisation de son territoire en signalant des objets ou mat&eacute;riaux encore utilisables, sans garantie d&rsquo;acceptation automatique.</p></div>
              <ul class="materials-list"><li>meubles, outils et luminaires</li><li>portes, fen&ecirc;tres et quincaillerie</li><li>mat&eacute;riaux de bricolage et peintures identifi&eacute;es</li><li>&eacute;quipements r&eacute;utilisables</li></ul>
            </article>
          </div>
        </section>

        <section class="materials-section" id="fonctionnement" data-copy-expansion="materials" aria-labelledby="copy-banque-materiaux">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Fonctionnement</span><h2 id="copy-banque-materiaux">De la ressource inutilis&eacute;e au projet territorial</h2></div>
            <p>Le parcours est con&ccedil;u pour &eacute;viter les annonces impr&eacute;cises, les stocks fictifs et les d&eacute;placements inutiles. Chaque &eacute;tape produit une information utile &agrave; la suivante.</p>
          </div>
          <div class="materials-flow" aria-label="Parcours en six &eacute;tapes">
            <article class="materials-step"><h3>Identification</h3><p>Le contributeur d&eacute;crit la ressource, son propri&eacute;taire, sa localisation, sa quantit&eacute; et sa date de disponibilit&eacute;.</p></article>
            <article class="materials-step"><h3>Diagnostic</h3><p>TVF v&eacute;rifie les informations, les photos, les dimensions, les conditions de d&eacute;pose et les contraintes d&rsquo;acc&egrave;s.</p></article>
            <article class="materials-step"><h3>&Eacute;valuation</h3><p>L&rsquo;&eacute;tat, la s&eacute;curit&eacute;, la valeur d&rsquo;usage, les besoins logistiques et les &eacute;ventuels co&ucirc;ts sont appr&eacute;ci&eacute;s.</p></article>
            <article class="materials-step"><h3>Valorisation</h3><p>La solution adapt&eacute;e est recherch&eacute;e : r&eacute;emploi direct, r&eacute;paration, stockage temporaire, transformation ou orientation vers une fili&egrave;re comp&eacute;tente.</p></article>
            <article class="materials-step"><h3>Affectation</h3><p>La ressource est reli&eacute;e &agrave; un projet qualifi&eacute;, avec accord des parties et calendrier de retrait ou de mise &agrave; disposition.</p></article>
            <article class="materials-step"><h3>Suivi et impact</h3><p>Le devenir de la ressource est document&eacute; : usage final, territoire b&eacute;n&eacute;ficiaire, quantit&eacute; mobilis&eacute;e et preuves disponibles.</p></article>
          </div>
        </section>

        <section class="materials-section" aria-labelledby="cooperation-title">
          <div class="materials-cooperation">
            <div class="materials-cooperation-diagram" aria-label="Sch&eacute;ma de coop&eacute;ration territoriale">
              <span>Ressources confi&eacute;es</span><span>Projet qualifi&eacute;</span><span>Convention de valorisation</span><span>B&eacute;n&eacute;fices partag&eacute;s</span>
            </div>
            <div class="materials-coop-copy">
              <span class="materials-kicker">Coop&eacute;ration territoriale</span>
              <h3 id="cooperation-title">Une convention pour maintenir la valeur sur le territoire</h3>
              <p>Lorsqu&rsquo;une collectivit&eacute; contribue, une convention de valorisation peut pr&eacute;ciser la destination des ressources, les responsabilit&eacute;s, la dur&eacute;e, le suivi et les usages rendus possibles. L&rsquo;objectif est que les ressources confi&eacute;es continuent &agrave; b&eacute;n&eacute;ficier au territoire.</p>
              <ul class="materials-list"><li>utilisation ponctuelle d&rsquo;espaces r&eacute;nov&eacute;s</li><li>organisation d&rsquo;activit&eacute;s pour les habitants</li><li>accueil d&rsquo;associations et de services de proximit&eacute;</li><li>actions &eacute;ducatives, animations culturelles et ateliers</li><li>engagement r&eacute;ciproque sur le suivi du projet</li></ul>
              <a class="button secondary" href="espace-collectivites.html">Espace Collectivit&eacute;s</a>
            </div>
          </div>

          <div class="materials-owner">
            <div class="materials-owner-copy">
              <span class="materials-kicker">Propri&eacute;taires</span>
              <h3>Relier les mat&eacute;riaux au programme Bien Solidaire &agrave; Usage Partag&eacute;</h3>
              <p>Un propri&eacute;taire peut conserver la pleine propri&eacute;t&eacute; de son bien tout en recherchant, avec TVF, une solution de r&eacute;novation et d&rsquo;usage temporaire encadr&eacute;e par convention. Les mat&eacute;riaux de r&eacute;emploi peuvent contribuer &agrave; la faisabilit&eacute; du projet sans se substituer aux diagnostics, aux assurances et aux r&egrave;gles techniques.</p>
              <a class="button" href="bien-solidaire-usage-partage.html">D&eacute;couvrir le programme</a>
            </div>
            <ul class="materials-list"><li>conservation de la propri&eacute;t&eacute;</li><li>diagnostic et projet de r&eacute;novation</li><li>convention d&rsquo;utilisation d&eacute;finie dans le temps</li><li>valorisation du patrimoine</li><li>service ou activit&eacute; utile au territoire</li></ul>
          </div>
        </section>

        <section class="materials-section" aria-labelledby="companies-title">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Entreprises et RSE</span><h2 id="companies-title">Transformer une contrainte de fin d&rsquo;usage en engagement territorial</h2></div>
            <p>TVF propose un cadre de coop&eacute;ration pour documenter les ressources, identifier les usages possibles et rendre compte de leur destination r&eacute;elle.</p>
          </div>
          <div class="materials-company-grid">
            <article><strong>Pr&eacute;vention des d&eacute;chets</strong><p>Rep&eacute;rer les ressources avant qu&rsquo;elles ne soient m&eacute;lang&eacute;es ou &eacute;vacu&eacute;es augmente les possibilit&eacute;s de r&eacute;emploi.</p></article>
            <article><strong>&Eacute;conomie circulaire</strong><p>Le dispositif favorise des boucles locales et recherche l&rsquo;usage le plus pertinent avant le recyclage.</p></article>
            <article><strong>Engagement territorial</strong><p>Les ressources peuvent soutenir un projet associatif, un local de proximit&eacute; ou une r&eacute;habilitation utile au bassin de vie.</p></article>
            <article><strong>Tra&ccedil;abilit&eacute; et visibilit&eacute;</strong><p>La valorisation publique reste proportionn&eacute;e, factuelle et conditionn&eacute;e &agrave; un projet effectivement r&eacute;alis&eacute; et document&eacute;.</p></article>
          </div>
          <div class="materials-cta-row"><a class="button primary" href="espace-entreprises.html">Construire un partenariat</a><a class="button secondary" href="proposer-materiaux.html">Proposer des mat&eacute;riaux</a></div>
        </section>

        <section class="materials-section materials-boundaries" aria-labelledby="boundaries-title">
          <div><span class="materials-kicker">Cadre d&rsquo;intervention</span><h2 id="boundaries-title">Ce que TVF ne fait pas</h2><p>La clart&eacute; du dispositif prot&egrave;ge les contributeurs, les b&eacute;n&eacute;ficiaires et l&rsquo;association. Une proposition peut &ecirc;tre refus&eacute;e si elle est dangereuse, non tra&ccedil;able, inutilisable ou sans destination r&eacute;aliste.</p></div>
          <div class="materials-not-grid"><span>TVF n&rsquo;est pas une d&eacute;chetterie</span><span>TVF n&rsquo;est pas une plateforme de dons libres</span><span>TVF n&rsquo;est pas un site de revente classique</span><span>TVF n&rsquo;est pas un syst&egrave;me de distribution automatique</span></div>
        </section>

        <section class="materials-section" data-deep-refonte="materiaux" aria-labelledby="impact-title">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Impacts recherch&eacute;s</span><h2 id="impact-title">Mesurer ce que la ressource rend possible</h2></div>
            <p>TVF ne publiera que des r&eacute;sultats issus de projets valid&eacute;s et document&eacute;s. En phase de lancement, ces objectifs constituent un cadre de mesure, pas un bilan d&eacute;j&agrave; acquis.</p>
          </div>
          <div class="materials-impact-grid">
            <article class="materials-impact"><h3>Centres-villes revitalis&eacute;s</h3><p>Contribuer &agrave; la remise en usage de locaux, commerces et logements qui structurent la vie quotidienne.</p></article>
            <article class="materials-impact"><h3>D&eacute;chets &eacute;vit&eacute;s</h3><p>Suivre les quantit&eacute;s effectivement r&eacute;employ&eacute;es, avec unit&eacute;s, preuves d&rsquo;affectation et destination finale.</p></article>
            <article class="materials-impact"><h3>B&acirc;timents r&eacute;habilit&eacute;s</h3><p>Mobiliser le r&eacute;emploi comme l&rsquo;un des leviers d&rsquo;une r&eacute;novation techniquement et financi&egrave;rement coh&eacute;rente.</p></article>
            <article class="materials-impact"><h3>Associations soutenues</h3><p>Faciliter l&rsquo;acc&egrave;s &agrave; des &eacute;quipements utiles dans le cadre d&rsquo;un projet accompagn&eacute; et d&rsquo;un besoin v&eacute;rifi&eacute;.</p></article>
            <article class="materials-impact"><h3>Activit&eacute;s et emplois</h3><p>Faire &eacute;merger des besoins de collecte, diagnostic, d&eacute;pose, r&eacute;paration, logistique, m&eacute;diation et am&eacute;nagement.</p></article>
            <article class="materials-impact"><h3>Cadre de vie am&eacute;lior&eacute;</h3><p>Orienter les ressources vers des services, espaces et usages visibles qui r&eacute;pondent aux besoins locaux.</p></article>
          </div>
        </section>

        <section class="materials-section" id="contribuer" aria-labelledby="contribute-title">
          <div class="materials-section-heading">
            <div><span class="materials-kicker">Proposer une ressource</span><h2 id="contribute-title">Transmettre une proposition pour qualification</h2></div>
            <p>La transmission du formulaire ne vaut ni acceptation, ni collecte, ni affectation. TVF examine la ressource et peut demander des informations compl&eacute;mentaires avant toute d&eacute;cision.</p>
          </div>
          <form class="contact-form" data-materiau-form>
            <div class="field-row"><label>Type<select name="type" required><option>Bois</option><option>Portes</option><option>Fen&ecirc;tres</option><option>Sanitaires</option><option>Cuisines</option><option>Luminaires</option><option>Carrelage</option><option>Mobilier</option><option>M&eacute;taux</option><option>Outillage</option><option>Autre ressource</option></select></label><label>Quantit&eacute;<input type="text" name="quantite" required /></label></div>
            <div class="field-row"><label>&Eacute;tat apparent<select name="etat" required><option>&Agrave; v&eacute;rifier</option><option>Bon &eacute;tat apparent</option><option>&Agrave; nettoyer</option><option>&Agrave; r&eacute;parer</option><option>&Agrave; expertiser</option></select></label><label>Commune ou localisation<input type="text" name="localisation" required /></label></div>
            <label>Photographie<input type="file" name="photo" accept="image/*" /></label>
            <label>Description, dimensions et conditions de retrait<textarea name="description" required></textarea></label>
            <label>Coordonn&eacute;e de contact<input type="text" name="contact_source" required /></label>
            <label class="consent-label"><input type="checkbox" required /> J&rsquo;accepte que ces informations soient utilis&eacute;es pour qualifier ma proposition et &ecirc;tre recontact&eacute;.</label>
            <button class="button primary" type="submit">Transmettre pour qualification</button>
            <p class="form-status" data-form-status>La proposition restera non publique tant qu&rsquo;elle n&rsquo;aura pas &eacute;t&eacute; v&eacute;rifi&eacute;e et valid&eacute;e.</p>
          </form>
        </section>

        <section class="materials-vision" aria-labelledby="vision-title">
          <span class="materials-kicker">Vision 2035</span>
          <h2 id="vision-title">Construire le premier r&eacute;seau national de valorisation territoriale des ressources inutilis&eacute;es</h2>
          <p>TVF souhaite relier progressivement les territoires, les antennes locales, les contributeurs et les porteurs de projet autour d&rsquo;une m&eacute;thode commune : identifier, qualifier, conventionner, affecter et mesurer. Cette ambition suppose des outils num&eacute;riques, mais surtout une capacit&eacute; d&rsquo;animation locale et une gouvernance transparente.</p>
          <blockquote>&laquo; Aucune ressource encore utile ne devrait &ecirc;tre d&eacute;truite lorsqu&rsquo;elle peut contribuer &agrave; redonner vie &agrave; un territoire. &raquo;</blockquote>
          <div class="materials-cta-row"><a class="button primary" href="proposer-materiaux.html">Proposer une ressource</a><a class="button secondary" href="contact.html">Parler &agrave; l&rsquo;&eacute;quipe TVF</a></div>
        </section>

        <section class="materials-section" aria-labelledby="faq-title">
          <span class="materials-kicker">Questions fr&eacute;quentes</span>
          <h2 id="faq-title">FAQ de la Banque de Mat&eacute;riaux TVF</h2>
          <div class="materials-faq">
            <details><summary>Les mat&eacute;riaux sont-ils distribu&eacute;s gratuitement ?</summary><p>Non. La Banque de Mat&eacute;riaux TVF n&rsquo;est pas un service de libre distribution. Les conditions de mobilisation d&eacute;pendent de la ressource, de son propri&eacute;taire, de la logistique, du projet d&rsquo;affectation et de la convention applicable.</p></details>
            <details><summary>Une proposition est-elle automatiquement accept&eacute;e ?</summary><p>Non. TVF v&eacute;rifie notamment l&rsquo;&eacute;tat, la tra&ccedil;abilit&eacute;, la s&eacute;curit&eacute;, la quantit&eacute;, les conditions de retrait et l&rsquo;existence d&rsquo;un usage r&eacute;aliste. Les d&eacute;chets dangereux ou ressources sans fili&egrave;re adapt&eacute;e sont refus&eacute;s ou r&eacute;orient&eacute;s.</p></details>
            <details><summary>Qui reste propri&eacute;taire avant l&rsquo;affectation ?</summary><p>La propri&eacute;t&eacute; et les responsabilit&eacute;s sont pr&eacute;cis&eacute;es au cas par cas. Une publication ou un signalement ne vaut pas transfert de propri&eacute;t&eacute;. Aucun retrait ne doit intervenir sans accord formalis&eacute;.</p></details>
            <details><summary>TVF organise-t-elle le transport et le stockage ?</summary><p>Pas syst&eacute;matiquement. Le diagnostic d&eacute;termine qui assure la d&eacute;pose, le chargement, le transport et, si n&eacute;cessaire, le stockage temporaire. Ces conditions doivent &ecirc;tre connues avant l&rsquo;affectation.</p></details>
            <details><summary>Quels mat&eacute;riaux peuvent &ecirc;tre propos&eacute;s par un particulier ?</summary><p>Mobilier, outils, luminaires, portes, fen&ecirc;tres, quincaillerie, mat&eacute;riaux de bricolage identifi&eacute;s ou autres &eacute;quipements r&eacute;utilisables peuvent &ecirc;tre signal&eacute;s. Des photos, dimensions, quantit&eacute;s et informations d&rsquo;&eacute;tat sont demand&eacute;es.</p></details>
            <details><summary>Comment une collectivit&eacute; peut-elle participer ?</summary><p>Elle peut signaler des ressources ou biens inutilis&eacute;s, proposer un projet territorial et construire avec TVF une convention de valorisation pr&eacute;cisant les usages, responsabilit&eacute;s, b&eacute;n&eacute;fices partag&eacute;s et modalit&eacute;s de suivi.</p></details>
            <details><summary>Comment l&rsquo;impact sera-t-il calcul&eacute; ?</summary><p>Les indicateurs reposeront sur des donn&eacute;es valid&eacute;es : quantit&eacute;s r&eacute;employ&eacute;es, ressources affect&eacute;es, projets servis, territoires concern&eacute;s et preuves de destination. Aucun chiffre ne sera publi&eacute; avant v&eacute;rification.</p></details>
            <details><summary>Quelle diff&eacute;rence entre r&eacute;emploi, r&eacute;utilisation et recyclage ?</summary><p>Le r&eacute;emploi maintient un produit dans son usage sans qu&rsquo;il devienne un d&eacute;chet. La r&eacute;utilisation concerne un produit devenu d&eacute;chet puis pr&eacute;par&eacute; pour un nouvel usage. Le recyclage transforme la mati&egrave;re. TVF recherche prioritairement la conservation de la valeur d&rsquo;usage lorsque cela est possible et s&ucirc;r.</p></details>
          </div>
          <div class="materials-sources">
            <strong>Sources publiques et rep&egrave;res m&eacute;thodologiques</strong>
            <span><a href="https://www.statistiques.developpement-durable.gouv.fr/bilan-2020-de-la-production-de-dechets-en-france" rel="noopener" target="_blank">SDES &mdash; Bilan 2020 de la production de d&eacute;chets en France</a></span>
            <span><a href="https://www.ecologie.gouv.fr/politiques-publiques/produits-materiaux-construction-du-secteur-du-batiment-pmcb" rel="noopener" target="_blank">Minist&egrave;re de la Transition &eacute;cologique &mdash; Produits et mat&eacute;riaux de construction du secteur du b&acirc;timent</a></span>
            <span><a href="https://zerologementvacant.beta.gouv.fr/" rel="noopener" target="_blank">Z&eacute;ro Logement Vacant &mdash; outil public d&rsquo;accompagnement des collectivit&eacute;s</a></span>
          </div>
        </section>
      </div>
    </main>`;

html = html.replace(/\s*<main\b[\s\S]*?<\/main>/i, main);
html = html.replace(/<title>[\s\S]*?<\/title>/i, "<title>Banque de Mat&eacute;riaux TVF | Valorisation territoriale et r&eacute;emploi</title>");
html = html.replace(/<meta name="description" content="[^"]*" \/>/i, '<meta name="description" content="La Banque de Mat&eacute;riaux TVF qualifie et oriente les ressources inutilis&eacute;es vers des projets territoriaux : fonctionnement, contributeurs, conventions, impacts et FAQ." />');
html = html.replace(/<meta property="og:type"[\s\S]*?<meta name="twitter:card" content="summary_large_image" \/>/i,
  '<meta property="og:type" content="website" /><meta property="og:locale" content="fr_FR" /><meta property="og:site_name" content="TERRITOIRES VIVANTS FRANCE" /><meta property="og:title" content="Banque de Mat&eacute;riaux TVF | Valorisation territoriale" /><meta property="og:description" content="Transformer les ressources inutilis&eacute;es en projets utiles aux habitants et aux territoires." /><meta property="og:url" content="https://www.territoiresvivantsfrance.fr/banque-materiaux.html" /><meta property="og:image" content="https://www.territoiresvivantsfrance.fr/assets/photos/brownfield-lille.jpg" /><meta name="twitter:card" content="summary_large_image" />');

html = html.replace(/\s*<script id="materials-bank-faq-schema"[\s\S]*?<\/script>/i, "");

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Les mat\u00e9riaux sont-ils distribu\u00e9s gratuitement ?", "acceptedAnswer": { "@type": "Answer", "text": "Non. La Banque de Mat\u00e9riaux TVF qualifie les ressources et les oriente vers des projets territoriaux selon des conditions d\u00e9finies avec les parties." } },
    { "@type": "Question", "name": "Une proposition est-elle automatiquement accept\u00e9e ?", "acceptedAnswer": { "@type": "Answer", "text": "Non. L'\u00e9tat, la tra\u00e7abilit\u00e9, la s\u00e9curit\u00e9, la logistique et l'existence d'un usage r\u00e9aliste sont v\u00e9rifi\u00e9s." } },
    { "@type": "Question", "name": "Comment une collectivit\u00e9 peut-elle participer ?", "acceptedAnswer": { "@type": "Answer", "text": "Elle peut signaler des ressources ou biens inutilis\u00e9s, proposer un projet territorial et construire une convention de valorisation avec TVF." } },
    { "@type": "Question", "name": "Comment l'impact sera-t-il calcul\u00e9 ?", "acceptedAnswer": { "@type": "Answer", "text": "Les indicateurs reposeront uniquement sur des donn\u00e9es valid\u00e9es et des preuves de destination des ressources." } }
  ]
};

html = html.replace("</head>", `    <script id="materials-bank-faq-schema" type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);

if (!html.includes('src="beta-app.js"')) {
  html = html.replace("</head>", '    <script defer src="beta-supabase.js"></script><script defer src="beta-app.js"></script>\n  </head>');
}
html = html.replace(/<body\b[^>]*>/i, '<body data-beta-page="materiaux">');

fs.writeFileSync(file, html, "utf8");
console.log("Rebuilt banque-materiaux.html");
