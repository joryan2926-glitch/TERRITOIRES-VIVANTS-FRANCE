const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();

function slugFor(file) {
  return file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

const replacements = [
  ["acces", "acc&egrave;s"],
  ["Acces", "Acc&egrave;s"],
  ["copropriete", "copropri&eacute;t&eacute;"],
  ["eloigne", "&eacute;loign&eacute;"],
  ["Proteger", "Prot&eacute;ger"],
  ["Securite", "S&eacute;curit&eacute;"],
  ["Moderation", "Mod&eacute;ration"],
  ["Tra&ccedil;abilite", "Tra&ccedil;abilit&eacute;"],
  ["fonctionnalites", "fonctionnalit&eacute;s"],
  ["etre", "&ecirc;tre"],
  ["Etre", "&Ecirc;tre"],
  ["Verifier", "V&eacute;rifier"],
  ["verifier", "v&eacute;rifier"],
  ["Verification", "V&eacute;rification"],
  ["verification", "v&eacute;rification"],
  ["Creer", "Cr&eacute;er"],
  ["creer", "cr&eacute;er"],
  ["documente", "document&eacute;"],
  ["documentee", "document&eacute;e"],
  ["documentees", "document&eacute;es"],
  ["adapte", "adapt&eacute;"],
  ["adaptee", "adapt&eacute;e"],
  ["deposseder", "d&eacute;poss&eacute;der"],
  ["deja", "d&eacute;j&agrave;"],
  ["serieusement", "s&eacute;rieusement"],
  ["serieuse", "s&eacute;rieuse"],
  ["serieuses", "s&eacute;rieuses"],
  ["orientees", "orient&eacute;es"],
  ["orientee", "orient&eacute;e"],
  ["acceder", "acc&eacute;der"],
  ["legales", "l&eacute;gales"],
  ["confidentialite", "confidentialit&eacute;"],
  ["publies", "publi&eacute;s"],
  ["identifies", "identifi&eacute;s"],
  ["collectivite", "collectivit&eacute;"],
  ["apres", "apr&egrave;s"],
  ["declaration", "d&eacute;claration"],
  ["formalites", "formalit&eacute;s"],
  ["honnete", "honn&ecirc;te"],
  ["pr&eacute;sentee", "pr&eacute;sent&eacute;e"],
  ["pr&eacute;paree", "pr&eacute;par&eacute;e"],
  ["separees", "s&eacute;par&eacute;es"],
  ["reliee", "reli&eacute;e"],
  ["beta", "b&ecirc;ta"],
  ["utilite", "utilit&eacute;"],
  ["reperage", "rep&eacute;rage"],
  ["mediation", "m&eacute;diation"],
  ["evaluer", "&eacute;valuer"],
  ["propriete", "propri&eacute;t&eacute;"],
  ["partage", "partag&eacute;"],
  ["eloignee", "&eacute;loign&eacute;e"],
  ["recherche", "recherche"],
  ["distinguer", "distinguer"],
  ["Pr&eacute;parer", "Pr&eacute;parer"],
  ["Preparer", "Pr&eacute;parer"],
  ["preparer", "pr&eacute;parer"],
  ["oriente", "orient&eacute;"],
  ["verifier", "v&eacute;rifier"],
  ["a jour", "&agrave; jour"],
];

const phraseReplacements = [
  ["La commune &agrave; besoin", "La commune a besoin"],
  ["doit etre", "doit &ecirc;tre"],
  ["peut etre", "peut &ecirc;tre"],
  ["doivent etre", "doivent &ecirc;tre"],
  ["avant d'&ecirc;tre", "avant d&rsquo;&ecirc;tre"],
  ["d'une", "d&rsquo;une"],
  ["d'un", "d&rsquo;un"],
  ["l'existant", "l&rsquo;existant"],
  ["l'affaiblir", "l&rsquo;affaiblir"],
  ["l'habitant", "l&rsquo;habitant"],
  ["l'acc&egrave;s", "l&rsquo;acc&egrave;s"],
  ["c'est", "c&rsquo;est"],
  ["s'adresser", "s&rsquo;adresser"],
  ["d'abandon", "d&rsquo;abandon"],
  ["differente", "diff&eacute;rente"],
  ["differentes", "diff&eacute;rentes"],
  ["differents", "diff&eacute;rents"],
];

function refine(file, section) {
  const id = `copy-${slugFor(file)}`;
  let next = section;
  for (const [from, to] of replacements) next = next.split(from).join(to);
  for (const [from, to] of phraseReplacements) next = next.split(from).join(to);
  return next
    .replace(/(<section class="longform-section" data-copy-expansion="[^"]+"\s+)aria-labelledby="[^"]+"/, `$1aria-labelledby="${id}"`)
    .replace(/<h2 id="[^"]+"/, `<h2 id="${id}"`);
}

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(/<section class="longform-section" data-copy-expansion=[\s\S]*?<\/section>/g, (section) => refine(file, section));
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`Refined expanded copy in ${changed} pages`);
