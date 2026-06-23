const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();

const replacements = [
  ["Developpement", "D&eacute;veloppement"],
  ["developpement", "d&eacute;veloppement"],
  ["editoriale", "&eacute;ditoriale"],
  ["editorial", "&eacute;ditorial"],
  ["operationnelles", "op&eacute;rationnelles"],
  ["operationnelle", "op&eacute;rationnelle"],
  ["operationnels", "op&eacute;rationnels"],
  ["operationnel", "op&eacute;rationnel"],
  ["preparer", "pr&eacute;parer"],
  ["prepare", "pr&eacute;pare"],
  ["preparation", "pr&eacute;paration"],
  ["protege", "prot&egrave;ge"],
  ["protegent", "prot&egrave;gent"],
  ["verifiees", "v&eacute;rifi&eacute;es"],
  ["verifiee", "v&eacute;rifi&eacute;e"],
  ["verifies", "v&eacute;rifi&eacute;s"],
  ["verifie", "v&eacute;rifie"],
  ["moderation", "mod&eacute;ration"],
  ["modere", "mod&egrave;re"],
  ["clarte", "clart&eacute;"],
  ["collectivites", "collectivit&eacute;s"],
  ["donnees", "donn&eacute;es"],
  ["donnee", "donn&eacute;e"],
  ["roles", "r&ocirc;les"],
  ["materiaux", "mat&eacute;riaux"],
  ["activites", "activit&eacute;s"],
  ["activite", "activit&eacute;"],
  ["tra&ccedil;abilite", "tra&ccedil;abilit&eacute;"],
  ["montee", "mont&eacute;e"],
  ["validees", "valid&eacute;es"],
  ["validee", "valid&eacute;e"],
  ["publiees", "publi&eacute;es"],
  ["publiee", "publi&eacute;e"],
  ["reponse", "r&eacute;ponse"],
  ["reponses", "r&eacute;ponses"],
  ["decision", "d&eacute;cision"],
  ["decisions", "d&eacute;cisions"],
  ["disponibilite", "disponibilit&eacute;"],
  ["etat", "&eacute;tat"],
  ["couts", "co&ucirc;ts"],
  ["cout", "co&ucirc;t"],
  ["qualifiees", "qualifi&eacute;es"],
  ["qualifiee", "qualifi&eacute;e"],
  ["qualifies", "qualifi&eacute;s"],
  ["qualifie", "qualifi&eacute;"],
  ["securisee", "s&eacute;curis&eacute;e"],
  ["securise", "s&eacute;curis&eacute;"],
  ["securite", "s&eacute;curit&eacute;"],
  ["credibilite", "cr&eacute;dibilit&eacute;"],
  ["methode", "m&eacute;thode"],
  ["methodes", "m&eacute;thodes"],
  ["proprietaires", "propri&eacute;taires"],
  ["proprietaire", "propri&eacute;taire"],
  ["renovation", "r&eacute;novation"],
  ["degradees", "d&eacute;grad&eacute;es"],
  ["degradee", "d&eacute;grad&eacute;e"],
  ["degrades", "d&eacute;grad&eacute;s"],
  ["degrade", "d&eacute;grad&eacute;"],
  ["reels", "r&eacute;els"],
  ["reel", "r&eacute;el"],
  ["reelle", "r&eacute;elle"],
  ["echelle", "&eacute;chelle"],
  ["developper", "d&eacute;velopper"],
  ["batiments", "b&acirc;timents"],
  ["batiment", "b&acirc;timent"],
  ["proximite", "proximit&eacute;"],
  ["generale", "g&eacute;n&eacute;rale"],
  ["associee", "associ&eacute;e"],
  ["associe", "associ&eacute;"],
  ["economiques", "&eacute;conomiques"],
  ["economique", "&eacute;conomique"],
  ["ecologique", "&eacute;cologique"],
  ["economie", "&eacute;conomie"],
  ["eviter", "&eacute;viter"],
  ["reutilisables", "r&eacute;utilisables"],
  ["reutilisable", "r&eacute;utilisable"],
  ["reemploi", "r&eacute;emploi"],
  ["inexploitees", "inexploit&eacute;es"],
  ["idee", "id&eacute;e"],
  ["realises", "r&eacute;alis&eacute;s"],
  ["realise", "r&eacute;alis&eacute;"],
  ["realiste", "r&eacute;aliste"],
  ["realisee", "r&eacute;alis&eacute;e"],
  ["responsabilite", "responsabilit&eacute;"],
  ["necessaires", "n&eacute;cessaires"],
  ["necessaire", "n&eacute;cessaire"],
  ["depot", "d&eacute;p&ocirc;t"],
  ["delai", "d&eacute;lai"],
  ["differents", "diff&eacute;rents"],
  ["differente", "diff&eacute;rente"],
  ["deposees", "d&eacute;pos&eacute;es"],
  ["deposee", "d&eacute;pos&eacute;e"],
  ["deposes", "d&eacute;pos&eacute;s"],
  ["deposer", "d&eacute;poser"],
  ["previsionnel", "pr&eacute;visionnel"],
  ["finan&ccedil;able", "finan&ccedil;able"],
  ["Communiquer", "Communiquer"],
  ["delaissees", "d&eacute;laiss&eacute;es"],
  ["delaisse", "d&eacute;laiss&eacute;"],
  ["presenter", "pr&eacute;senter"],
  ["presente", "pr&eacute;sente"],
  ["presentees", "pr&eacute;sent&eacute;es"],
  ["ambitieuse", "ambitieuse"],
  ["limitee", "limit&eacute;e"],
  ["limites", "limites"],
  ["role", "r&ocirc;le"],
  ["R&ocirc;le", "R&ocirc;le"],
  ["strategie", "strat&eacute;gie"],
  ["strategie", "strat&eacute;gie"],
  ["ecouter", "&eacute;couter"],
  ["accueillir", "accueillir"],
  ["utilite", "utilit&eacute;"],
  ["ecole", "&eacute;cole"],
  ["ecoles", "&eacute;coles"],
  ["etablissements", "&eacute;tablissements"],
  ["enseignement", "enseignement"],
  ["competence", "comp&eacute;tence"],
  ["competences", "comp&eacute;tences"],
  ["coherence", "coh&eacute;rence"],
  ["referents", "r&eacute;f&eacute;rents"],
  ["reseau", "r&eacute;seau"],
  ["Region", "R&eacute;gion"],
  ["deploiement", "d&eacute;ploiement"],
  ["Deploiement", "D&eacute;ploiement"],
  ["Accompagner", "Accompagner"],
  ["territorialisee", "territorialis&eacute;e"],
  ["Mission", "Mission"],
  ["b&eacute;nevoles", "b&eacute;n&eacute;voles"],
  ["benevoles", "b&eacute;n&eacute;voles"],
  ["benevole", "b&eacute;n&eacute;vole"],
  ["mecenat", "m&eacute;c&eacute;nat"],
  ["mecenes", "m&eacute;c&egrave;nes"],
  ["mecene", "m&eacute;c&egrave;ne"],
  ["fenetre", "fen&ecirc;tre"],
  ["fenetres", "fen&ecirc;tres"],
  ["definir", "d&eacute;finir"],
  ["definis", "d&eacute;finis"],
  ["definie", "d&eacute;finie"],
  ["reference", "r&eacute;f&eacute;rence"],
  ["priorite", "priorit&eacute;"],
  ["priorites", "priorit&eacute;s"],
  ["capacite", "capacit&eacute;"],
  ["donateur", "donateur"],
  ["donateurs", "donateurs"],
  ["interet", "int&eacute;r&ecirc;t"],
  ["interets", "int&eacute;r&ecirc;ts"],
  ["generer", "g&eacute;n&eacute;rer"],
  ["genere", "g&eacute;n&egrave;re"],
  ["complete", "compl&egrave;te"],
  ["controle", "contr&ocirc;le"],
  ["publique", "publique"],
  ["publiques", "publiques"],
  ["possibilite", "possibilit&eacute;"],
  ["possibilites", "possibilit&eacute;s"],
  ["commune", "commune"],
  ["communautaire", "communautaire"],
];

const phraseReplacements = [
  ["Qui sommes nous", "Qui sommes-nous"],
  ["Action logements vacants", "Logements vacants"],
  ["Action commerces inoccupes", "Commerces inoccup&eacute;s"],
  ["Action espaces abandonnes", "Espaces abandonn&eacute;s"],
  ["Action materiaux reemploi", "Mat&eacute;riaux de r&eacute;emploi"],
  ["Action solidarite insertion", "Solidarit&eacute; &amp; Insertion"],
  ["Pole habitat vivant", "Habitat Vivant"],
  ["Pole materiautheque solidaire", "Mat&eacute;riauth&egrave;que Solidaire"],
  ["Pole commerce vivant", "Commerce Vivant"],
  ["Pole friches terrains vivants", "Friches &amp; Terrains Vivants"],
  ["Pole observatoire patrimoine vacant", "Observatoire du Patrimoine Vacant"],
  ["Pole solidarite insertion", "Solidarit&eacute; &amp; Insertion"],
  ["Nos poles", "Nos p&ocirc;les"],
  ["Nos actions", "Nos actions"],
  ["Plateforme operationnelle", "Plateforme op&eacute;rationnelle"],
  ["Financer projets", "Financer les projets"],
  ["Fonds investissement solidaire", "Fonds d'investissement solidaire"],
  ["Faire un don", "Faire un don"],
  ["Vision france 2035", "Vision France 2035"],
];

function polish(section) {
  let next = section;
  for (const [from, to] of phraseReplacements) next = next.split(from).join(to);
  for (const [from, to] of replacements) next = next.split(from).join(to);
  next = next.split(" a ").join(" &agrave; ");
  next = next.split(" A ").join(" &Agrave; ");
  next = next.split(" d'action").join(" d&rsquo;action");
  next = next.split(" d'usage").join(" d&rsquo;usage");
  next = next.split(" d'emploi").join(" d&rsquo;emploi");
  next = next.split(" d'information").join(" d&rsquo;information");
  next = next.split(" d'insertion").join(" d&rsquo;insertion");
  next = next.split(" l'association").join(" l&rsquo;association");
  next = next.split(" l'utilisateur").join(" l&rsquo;utilisateur");
  next = next.split(" l'envie").join(" l&rsquo;envie");
  next = next.split(" l'impact").join(" l&rsquo;impact");
  next = next.split(" l'architecture").join(" l&rsquo;architecture");
  next = next.split(" l'action").join(" l&rsquo;action");
  next = next.split(" l'emploi").join(" l&rsquo;emploi");
  next = next.split(" n'est").join(" n&rsquo;est");
  next = next.split(" qu'un").join(" qu&rsquo;un");
  next = next.split(" s'inscrit").join(" s&rsquo;inscrit");
  next = next.split(" aujourd'hui").join(" aujourd&rsquo;hui");
  return next;
}

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(/<section class="longform-section" data-copy-expansion=[\s\S]*?<\/section>/g, polish);
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`Polished expanded copy in ${changed} pages`);
