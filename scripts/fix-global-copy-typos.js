const fs = require("fs");
const path = require("path");

const root = process.cwd();
const files = fs.readdirSync(root).filter((name) => name.endsWith(".html"));

const replacements = [
  [/\bproposees\b/g, "propos&eacute;es"],
  [/\bproposes\b/g, "propos&eacute;s"],
  [/\bproposee\b/g, "propos&eacute;e"],
  [/\baffectees\b/g, "affect&eacute;es"],
  [/\baffectes\b/g, "affect&eacute;s"],
  [/\baffectee\b/g, "affect&eacute;e"],
  [/\bvalidees\b/g, "valid&eacute;es"],
  [/\bvalidee\b/g, "valid&eacute;e"],
  [/\bprojets valides par TVF\b/g, "projets valid&eacute;s par TVF"],
  [/\beviter\b/g, "&eacute;viter"],
  [/\bevite\b/g, "&eacute;vite"],
  [/\bevitent\b/g, "&eacute;vitent"],
  [/\bevitera\b/g, "&eacute;vitera"],
  [/\bevitent\b/g, "&eacute;vitent"],
  [/\bdevelopper\b/g, "d&eacute;velopper"],
  [/\bdeveloppement\b/g, "d&eacute;veloppement"],
  [/\bdeveloppee\b/g, "d&eacute;velopp&eacute;e"],
  [/\bdeveloppees\b/g, "d&eacute;velopp&eacute;es"],
  [/\bdeveloppe\b/g, "d&eacute;velopp&eacute;"],
  [/\bdeveloppes\b/g, "d&eacute;velopp&eacute;s"],
  [/\bdocumentee\b/g, "document&eacute;e"],
  [/\bdocumentees\b/g, "document&eacute;es"],
  [/\bdocumentes\b/g, "document&eacute;s"],
  [/\bencadree\b/g, "encadr&eacute;e"],
  [/\bencadrees\b/g, "encadr&eacute;es"],
  [/\bencadres\b/g, "encadr&eacute;s"],
  [/\bpreciser\b/g, "pr&eacute;ciser"],
  [/\bprecise\b/g, "pr&eacute;cise"],
  [/\bprecisee\b/g, "pr&eacute;cis&eacute;e"],
  [/\bprecisees\b/g, "pr&eacute;cis&eacute;es"],
  [/\bprecises\b/g, "pr&eacute;cis&eacute;s"],
  [/\bperimetre\b/g, "p&eacute;rim&egrave;tre"],
  [/\bperimetres\b/g, "p&eacute;rim&egrave;tres"],
  [/\bmodalites\b/g, "modalit&eacute;s"],
  [/\bresponsabilites\b/g, "responsabilit&eacute;s"],
  [/\bcollectivites\b/g, "collectivit&eacute;s"],
  [/\bCollectivites\b/g, "Collectivit&eacute;s"],
  [/\bproprietaires\b/g, "propri&eacute;taires"],
  [/\bbenefices\b/g, "b&eacute;n&eacute;fices"],
  [/\bbeneficiaires\b/g, "b&eacute;n&eacute;ficiaires"],
  [/\bbeneficiaire\b/g, "b&eacute;n&eacute;ficiaire"],
  [/\bmateriaux\b/g, "mat&eacute;riaux"],
  [/\breemploi\b/g, "r&eacute;emploi"],
  [/\bReemploi\b/g, "R&eacute;emploi"],
  [/\bbatiments\b/g, "b&acirc;timents"],
  [/\bbatiment\b/g, "b&acirc;timent"],
  [/\blogements rehabilites\b/g, "logements r&eacute;habilit&eacute;s"],
  [/\brehabilitation\b/g, "r&eacute;habilitation"],
  [/\brenovation\b/g, "r&eacute;novation"],
  [/\brenove\b/g, "r&eacute;nov&eacute;"],
  [/\brenoves\b/g, "r&eacute;nov&eacute;s"],
  [/\brenovee\b/g, "r&eacute;nov&eacute;e"],
  [/\brenovees\b/g, "r&eacute;nov&eacute;es"],
  [/\breutilisables\b/g, "r&eacute;utilisables"],
  [/\breutilisable\b/g, "r&eacute;utilisable"],
  [/\butilisees\b/g, "utilis&eacute;es"],
  [/\butilises\b/g, "utilis&eacute;s"],
  [/\binutilisees\b/g, "inutilis&eacute;es"],
  [/\binutilises\b/g, "inutilis&eacute;s"],
  [/\binutilisee\b/g, "inutilis&eacute;e"],
  [/\binutilise\b/g, "inutilis&eacute;"],
  [/\bsecurite\b/g, "s&eacute;curit&eacute;"],
  [/\bsecurisee\b/g, "s&eacute;curis&eacute;e"],
  [/\bsecurise\b/g, "s&eacute;curis&eacute;"],
  [/\btracabilite\b/g, "tra&ccedil;abilit&eacute;"],
  [/\bdecisions\b/g, "d&eacute;cisions"],
  [/\bdecision\b/g, "d&eacute;cision"],
  [/\bdemarche\b/g, "d&eacute;marche"],
  [/\bdemarches\b/g, "d&eacute;marches"],
  [/\beconomie\b/g, "&eacute;conomie"],
  [/\beconomique\b/g, "&eacute;conomique"],
  [/\beconomiques\b/g, "&eacute;conomiques"],
  [/\becologique\b/g, "&eacute;cologique"],
  [/\becologiques\b/g, "&eacute;cologiques"],
  [/\bemissions\b/g, "&eacute;missions"],
  [/\bemission\b/g, "&eacute;mission"],
  [/\betude\b/g, "&eacute;tude"],
  [/\betudes\b/g, "&eacute;tudes"],
  [/\bequipe\b/g, "&eacute;quipe"],
  [/\bequipements\b/g, "&eacute;quipements"],
  [/\bequipement\b/g, "&eacute;quipement"],
  [/\breseau\b/g, "r&eacute;seau"],
  [/\breseaux\b/g, "r&eacute;seaux"],
  [/\bpublics concernes\b/g, "publics concern&eacute;s"],
  [/\bresultats\b/g, "r&eacute;sultats"],
  [/\bresultat\b/g, "r&eacute;sultat"],
  [/\bstrategie\b/g, "strat&eacute;gie"],
  [/\bstrategique\b/g, "strat&eacute;gique"],
  [/\bstrategiques\b/g, "strat&eacute;giques"],
  [/\boperationnel\b/g, "op&eacute;rationnel"],
  [/\boperationnelle\b/g, "op&eacute;rationnelle"],
  [/\boperationnelles\b/g, "op&eacute;rationnelles"],
  [/\boperationnels\b/g, "op&eacute;rationnels"],
  [/\ba definir\b/g, "&agrave; d&eacute;finir"],
  [/\bA definir\b/g, "&Agrave; d&eacute;finir"],
  [/\ba completer\b/g, "&agrave; compl&eacute;ter"],
  [/\bA completer\b/g, "&Agrave; compl&eacute;ter"],
  [/\ba valider\b/g, "&agrave; valider"],
  [/\ba qualifier\b/g, "&agrave; qualifier"],
  [/\ba documenter\b/g, "&agrave; documenter"],
  [/\ba jour\b/g, "&agrave; jour"],
  [/\ba disposition\b/g, "&agrave; disposition"],
  [/\ba destination\b/g, "&agrave; destination"],
  [/\ba partir\b/g, "&agrave; partir"],
  [/\ba travers\b/g, "&agrave; travers"],
  [/\ba l'echelle\b/g, "&agrave; l'&eacute;chelle"],
  [/\bSaint-Etienne\b/g, "Saint-&Eacute;tienne"],
  [/\bElise Gervais\b/g, "&Eacute;lise Gervais"],
  [/\bAction coeur de ville\b/gi, "Action c&oelig;ur de ville"],
  [/\bcoeur de ville\b/gi, "c&oelig;ur de ville"],
  [/\bcoeur methodologique\b/g, "c&oelig;ur m&eacute;thodologique"],
  [/\bcoeur\b/g, "c&oelig;ur"],
  [/\bmain d'oeuvre\b/gi, "main-d'&oelig;uvre"],
  [/\bmaitrise d'ouvrage\b/gi, "ma&icirc;trise d'ouvrage"],
  [/\bmaitrise\b/gi, "ma&icirc;trise"],
  [/\bcouts\b/g, "co&ucirc;ts"],
  [/\bcout\b/g, "co&ucirc;t"],
  [/\brole\b/g, "r&ocirc;le"],
  [/\bRole\b/g, "R&ocirc;le"],
  [/\broles\b/g, "r&ocirc;les"],
  [/\bPole\b/g, "P&ocirc;le"],
  [/\bpole\b/g, "p&ocirc;le"],
  [/\bpoles\b/g, "p&ocirc;les"],
  [/\bPôles\b/g, "P&ocirc;les"],
  [/\bPôle\b/g, "P&ocirc;le"],
  [/\bplutot\b/g, "plut&ocirc;t"],
  [/\bProprietaires\b/g, "Propri&eacute;taires"],
  [/\bMateriaux\b/g, "Mat&eacute;riaux"],
  [/\bEconomie\b/g, "&Eacute;conomie"],
  [/\bEtude\b/g, "&Eacute;tude"],
  [/\bEquipe\b/g, "&Eacute;quipe"],
  [/\bDeveloppement\b/g, "D&eacute;veloppement"],
  [/\bDecision\b/g, "D&eacute;cision"],
  [/\bPreciser\b/g, "Pr&eacute;ciser"],
  [/\bmarche\b/g, "march&eacute;"],
  [/\baccompagnes\b/g, "accompagn&eacute;s"],
  [/\bactivite\b/g, "activit&eacute;"],
  [/\brevitalises\b/g, "revitalis&eacute;s"],
  [/\btransformes\b/g, "transform&eacute;s"],
  [/\bsite qualifie\b/g, "site qualifi&eacute;"],
  [/\borientes\b/g, "orient&eacute;s"],
  [/\bDechets\b/g, "D&eacute;chets"],
  [/\bdechets\b/g, "d&eacute;chets"],
  [/\bevites\b/g, "&eacute;vit&eacute;s"],
  [/\bdetournes\b/g, "d&eacute;tourn&eacute;s"],
  [/\bcreees\b/g, "cr&eacute;&eacute;es"],
  [/\bcrees\b/g, "cr&eacute;&eacute;s"],
  [/\bcree\b/g, "cr&eacute;&eacute;"],
  [/\bproximite\b/g, "proximit&eacute;"],
  [/\benvisage\b/g, "envisag&eacute;"],
  [/\bannoncee\b/g, "annonc&eacute;e"],
  [/\breferents\b/g, "r&eacute;f&eacute;rents"],
  [/\betudies\b/g, "&eacute;tudi&eacute;s"],
  [/\bajourne\b/g, "ajourn&eacute;"],
  [/\bmise en oeuvre\b/g, "mise en &oelig;uvre"],
];

const phraseReplacements = [
  [/Les ressources proposees sont qualifi&eacute;es puis affectees &agrave; des projets valides par TVF\. Cette approche evite les collectes inutiles, les promesses impossibles et les usages incompatibles avec la s&eacute;curit&eacute; ou l'int&eacute;r&ecirc;t territorial\./g,
    "Les ressources propos&eacute;es sont qualifi&eacute;es puis affect&eacute;es &agrave; des projets valid&eacute;s par TVF. Cette approche &eacute;vite les collectes inutiles, les promesses impossibles et les usages incompatibles avec la s&eacute;curit&eacute; ou l'int&eacute;r&ecirc;t territorial."],
  [/TVF agit pour la revitalisation des territoires en transformant les b&acirc;timents vacants, les mat&eacute;riaux inutilis&eacute;s et les espaces abandonn&eacute;s en opportunit&eacute;s pour les habitants\./g,
    "TVF agit pour la revitalisation des territoires en transformant les b&acirc;timents vacants, les mat&eacute;riaux inutilis&eacute;s et les espaces abandonn&eacute;s en ressources utiles pour les habitants."],
  [/TVF coordonne, qualifi&eacute;, oriente et documente\./g,
    "TVF coordonne, qualifie, oriente et documente."],
  [/commerces fermes/g, "commerces ferm&eacute;s"],
  [/r&eacute;sultats non mesures/g, "r&eacute;sultats non mesur&eacute;s"],
  [/(\d+) a (\d+)/g, "$1 &agrave; $2"],
];

function fixText(text) {
  let next = text;
  for (const [pattern, value] of phraseReplacements) next = next.replace(pattern, value);
  for (const [pattern, value] of replacements) next = next.replace(pattern, value);
  return next;
}

function fixHtml(html) {
  const protectedBlocks = [];
  const protectedHtml = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
    const token = `__TVF_PROTECTED_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return token;
  });

  const fixed = protectedHtml
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : fixText(part)))
    .join("");

  return fixed.replace(/__TVF_PROTECTED_BLOCK_(\d+)__/g, (_, index) => protectedBlocks[Number(index)]);
}

const changedFiles = [];
for (const file of files) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const after = fixHtml(before);
  if (after !== before) {
    fs.writeFileSync(full, after, "utf8");
    changedFiles.push(file);
  }
}

console.log(JSON.stringify({ changed: changedFiles.length, files: changedFiles }, null, 2));
