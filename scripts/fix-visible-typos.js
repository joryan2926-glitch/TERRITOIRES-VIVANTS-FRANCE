const fs = require("fs");

const replacements = [
  [/\bverifier\b/g, "v&eacute;rifier"],
  [/\bVerifier\b/g, "V&eacute;rifier"],
  [/\bcompleter\b/g, "compl&eacute;ter"],
  [/\bCompleter\b/g, "Compl&eacute;ter"],
  [/\baffichees\b/g, "affich&eacute;es"],
  [/\bAffichees\b/g, "Affich&eacute;es"],
  [/\bmoderees\b/g, "mod&eacute;r&eacute;es"],
  [/\bModerees\b/g, "Mod&eacute;r&eacute;es"],
  [/\brattachees\b/g, "rattach&eacute;es"],
  [/\bRattachees\b/g, "Rattach&eacute;es"],
  [/\ba prioriser\b/g, "&agrave; prioriser"],
  [/\bA prioriser\b/g, "&Agrave; prioriser"],
  [/\ba une source\b/g, "&agrave; une source"],
  [/\bA une source\b/g, "&Agrave; une source"],
  [/\ba un statut\b/g, "&agrave; un statut"],
  [/\ba valider\b/g, "&agrave; valider"],
  [/\ba qualifier\b/g, "&agrave; qualifier"],
  [/\ba documenter\b/g, "&agrave; documenter"],
  [/\ba jour\b/g, "&agrave; jour"]
];

function fixText(text) {
  let next = text;
  for (const [pattern, value] of replacements) {
    next = next.replace(pattern, value);
  }
  return next;
}

function fixHtml(html) {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : fixText(part)))
    .join("");
}

let changed = 0;
for (const file of fs.readdirSync(".").filter((name) => name.endsWith(".html"))) {
  const before = fs.readFileSync(file, "utf8");
  const after = fixHtml(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

console.log(`Visible typo pass applied to ${changed} HTML files.`);
