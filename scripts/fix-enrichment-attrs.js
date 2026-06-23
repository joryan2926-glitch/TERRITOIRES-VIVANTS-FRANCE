const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html"));
const replacements = [
  [/Temoignages a recueillir/g, "Témoignages à recueillir"],
  [/Appel a l'action/g, "Appel à l'action"],
  [/Appel a l’action/g, "Appel à l’action"],
];

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), html);
  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`Fixed generated aria labels in ${changed} pages`);
