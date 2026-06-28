const fs = require('fs');

function write(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    return true;
  }
  return false;
}

let changed = 0;

changed += write('dossier-saint-etienne.html', (html) => html
  .replace(
    /<p>Saint-&Eacute;tienne est le si&egrave;ge national de Territoires Vivants France[\s\S]*?proportionn&eacute;es &agrave; ses moyens\.<\/p>/,
    '<p>Saint-&Eacute;tienne est le si&egrave;ge national de TVF et le premier territoire retenu pour tester sa m&eacute;thode.</p><div class="decision-flow"><article><h3>Ce que cela signifie</h3><p>Construire une contribution locale &agrave; partir d&rsquo;un diagnostic transparent et d&rsquo;un dialogue avec les acteurs existants.</p></article><article><h3>Ce que cela ne signifie pas</h3><p>TVF ne revendique aucun projet public ou priv&eacute; d&eacute;j&agrave; engag&eacute; sur la commune.</p></article><article><h3>Cadre de lecture</h3><p>Les donn&eacute;es sont sourc&eacute;es, dat&eacute;es et &agrave; actualiser &agrave; chaque nouveau mill&eacute;sime.</p></article></div>'
  )
  .replace(
    /<p>En 2022, l&rsquo;INSEE recense 12&nbsp;313 logements vacants[\s\S]*?vacance structurelle\.<\/p>/,
    '<p>En 2022, l&rsquo;INSEE recense 12&nbsp;313 logements vacants &agrave; Saint-&Eacute;tienne, contre 11&nbsp;070 en 2011.</p><div class="dossier-grid"><article class="dossier-card"><h3>Part du parc</h3><p>Environ 12,2&nbsp;% &agrave; Saint-&Eacute;tienne, contre 8,5&nbsp;% en Auvergne-Rh&ocirc;ne-Alpes et 8,0&nbsp;% en France.</p></article><article class="dossier-card"><h3>Situations possibles</h3><p>Rotation, travaux, indivision, d&eacute;gradation, inad&eacute;quation du logement ou vacance structurelle.</p></article><article class="dossier-card"><h3>R&ocirc;le TVF</h3><p>Qualifier les situations avant toute action : dur&eacute;e, propri&eacute;t&eacute;, &eacute;tat, potentiel d&rsquo;usage et contraintes.</p></article></div>'
  )
  .replace(
    /<p>Le taux de ch&ocirc;mage au sens du recensement atteint 19,1&nbsp;%[\s\S]*?pouvoir d&rsquo;agir des habitants\.<\/p>/,
    '<p>Les indicateurs sociaux invitent &agrave; relier revitalisation, emploi, formation et services de proximit&eacute;.</p><div class="dossier-grid"><article class="dossier-card"><h3>Ch&ocirc;mage</h3><p>19,1&nbsp;% au sens du recensement 2022 &agrave; Saint-&Eacute;tienne, contre 10,0&nbsp;% en Auvergne-Rh&ocirc;ne-Alpes.</p></article><article class="dossier-card"><h3>Pauvret&eacute;</h3><p>30,4&nbsp;% en 2023 &agrave; l&rsquo;&eacute;chelle communale, contre 14,2&nbsp;% dans la r&eacute;gion.</p></article><article class="dossier-card"><h3>Lecture TVF</h3><p>La remise en usage de lieux doit aussi soutenir l&rsquo;insertion, les comp&eacute;tences et le pouvoir d&rsquo;agir.</p></article></div>'
  )
  .replace(
    /<p>L&rsquo;INSEE documente les commerces en activit&eacute;[\s\S]*?signalements qualifi&eacute;s\.<\/p>/,
    '<p>L&rsquo;INSEE documente les commerces en activit&eacute; : en 2024, Saint-&Eacute;tienne compte notamment 145 boulangeries-p&acirc;tisseries, 121 &eacute;piceries ou sup&eacute;rettes et 230 &eacute;tablissements de coiffure.</p><div class="dossier-grid"><article class="dossier-card"><h3>Donn&eacute;e disponible</h3><p>Le tissu commercial actif peut &ecirc;tre lu par cat&eacute;gorie d&rsquo;&eacute;tablissement.</p></article><article class="dossier-card"><h3>Donn&eacute;e non disponible</h3><p>Le dossier ne dispose pas d&rsquo;un taux harmonis&eacute; de vacance commerciale locale.</p></article><article class="dossier-card"><h3>M&eacute;thode propos&eacute;e</h3><p>Croiser donn&eacute;es autoris&eacute;es, connaissance des rues, acteurs consulaires et signalements qualifi&eacute;s.</p></article></div>'
  )
  .replace(
    /<p>Saint-&Eacute;tienne dispose d&rsquo;un &eacute;cosyst&egrave;me public de renouvellement urbain[\s\S]*?r&eacute;alisations de TVF\.<\/p>/,
    '<p>Saint-&Eacute;tienne dispose d&rsquo;un &eacute;cosyst&egrave;me public de renouvellement urbain d&eacute;j&agrave; document&eacute;.</p><div class="dossier-grid"><article class="dossier-card"><h3>Ce qui existe</h3><p>Friche Termoz, transformations de Jacquard, r&eacute;activation commerciale, OPAH-RU Saint-Roch et exp&eacute;rimentation de mat&eacute;riauth&egrave;que.</p></article><article class="dossier-card"><h3>Statut des mentions</h3><p>Ces initiatives sont cit&eacute;es comme contexte territorial existant, pas comme partenariats annonc&eacute;s.</p></article><article class="dossier-card"><h3>Position TVF</h3><p>Comprendre l&rsquo;existant avant de proposer une contribution compl&eacute;mentaire et proportionn&eacute;e.</p></article></div>'
  )) ? 1 : 0;

changed += write('tvf-enjeux-saint-etienne.html', (html) => html
  .replace(/Saint-�tienne/g, 'Saint-&Eacute;tienne')
  .replace(/d�j�/g, 'd&eacute;j&agrave;')
  .replace(/m�tropolitain/g, 'm&eacute;tropolitain')
  .replace(/�conomie/g, '&eacute;conomie')
  .replace(
    /<p class="lead-block">Saint-&Eacute;tienne et Saint-&Eacute;tienne M&eacute;tropole disposent d&eacute;j&agrave;[\s\S]*?suivre les impacts\.<\/p>/,
    '<p class="lead-block">Saint-&Eacute;tienne dispose d&eacute;j&agrave; de politiques publiques structur&eacute;es. La valeur de TVF consiste &agrave; relier les besoins de terrain aux bons cadres d&rsquo;action.</p><div class="dossier-grid"><article class="dossier-card"><h3>Programmes &agrave; lire</h3><p>Projet m&eacute;tropolitain, PLH, Action c&oelig;ur de ville, Contrat de Ville, NPNRU, PCAET, strat&eacute;gie fonci&egrave;re et PLIE.</p></article><article class="dossier-card"><h3>R&ocirc;le TVF</h3><p>Identifier, documenter, mobiliser les acteurs, orienter les ressources et suivre les impacts.</p></article><article class="dossier-card"><h3>Principe</h3><p>TVF compl&egrave;te les dispositifs existants ; elle ne les remplace pas.</p></article></div>'
  )
  .replace(
    /<p class="lead-block">TVF ne doit pas annoncer de subventions comme acquises[\s\S]*?l&rsquo;instruction des financeurs\.<\/p>/,
    '<p class="lead-block">TVF ne pr&eacute;sente aucune subvention comme acquise. L&rsquo;association peut en revanche aider &agrave; construire un plan de financement solide.</p><div class="dossier-grid"><article class="dossier-card"><h3>Base du dossier</h3><p>Besoin public, dispositif compatible, devis, calendrier, convention, preuves d&rsquo;impact et reste &agrave; financer.</p></article><article class="dossier-card"><h3>Statut des montants</h3><p>Les montants cit&eacute;s sont des rep&egrave;res indicatifs soumis &agrave; &eacute;ligibilit&eacute;, plafonds, arbitrages et instruction.</p></article><article class="dossier-card"><h3>Objectif</h3><p>Rendre le dossier lisible pour une commune, un EPCI, un financeur ou un partenaire priv&eacute;.</p></article></div>'
  )) ? 1 : 0;

changed += write('banque-materiaux.html', (html) => html
  .replace(
    /<p>Le dispositif relie des ressources dormantes[\s\S]*?distribution libre ou automatique\.<\/p>/,
    '<p>Le dispositif relie des ressources dormantes &agrave; des besoins concrets valid&eacute;s par TVF.</p><div class="dossier-grid"><article class="dossier-card"><h3>Usages possibles</h3><p>Local associatif, espace de proximit&eacute;, chantier solidaire, bien vacant ou activit&eacute; locale.</p></article><article class="dossier-card"><h3>Crit&egrave;res d&rsquo;affectation</h3><p>Utilit&eacute; territoriale, s&eacute;curit&eacute;, &eacute;tat, tra&ccedil;abilit&eacute; et conventions applicables.</p></article><article class="dossier-card"><h3>Limite claire</h3><p>Un don ne cr&eacute;e aucun droit &agrave; une distribution libre ou automatique.</p></article></div>'
  )) ? 1 : 0;

console.log(`Excellence content polish changed ${changed} files.`);
