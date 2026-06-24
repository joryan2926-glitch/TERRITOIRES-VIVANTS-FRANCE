const fs = require("fs");
const path = require("path");

const root = process.cwd();
const replacements = [
  [/Contrepartie et dur&eacute;es/gi, "Coop&eacute;ration territoriale et dur&eacute;es"],
  [/Contrepartie et durées/gi, "Coop&eacute;ration territoriale et dur&eacute;es"],
  [/R&eacute;novation contre usage temporaire/gi, "R&eacute;novation avec usage temporaire conventionn&eacute;"],
  [/Rénovation contre usage temporaire/gi, "R&eacute;novation avec usage temporaire conventionn&eacute;"],
  [/R&eacute;novation contre loyer solidaire/gi, "R&eacute;novation avec loyer solidaire"],
  [/Rénovation contre loyer solidaire/gi, "R&eacute;novation avec loyer solidaire"],
  [/R&eacute;novation contre partage des revenus/gi, "R&eacute;novation avec valorisation partag&eacute;e des revenus"],
  [/Rénovation contre partage des revenus/gi, "R&eacute;novation avec valorisation partag&eacute;e des revenus"],
  [/contreparties/gi, "engagements r&eacute;ciproques"],
  [/contrepartie/gi, "coop&eacute;ration territoriale"]
];

let changed = 0;
const failures = [];
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  for (const [pattern, replacement] of replacements) html = html.replace(pattern, replacement);
  if (html !== before) {
    try {
      fs.writeFileSync(full, html, "utf8");
      changed += 1;
    } catch (error) {
      failures.push({ file, code: error.code });
    }
  }
}

console.log(JSON.stringify({ changed, failures }, null, 2));
