const fs = require("fs");
const path = require("path");

const root = process.cwd();
const replacements = [
  ['<span class="nav-label">Par public</span>', '<span class="nav-label">Je suis...</span>'],
  ["<strong>Par public : votre r&ocirc;le</strong>", "<strong>Choisir mon parcours</strong>"],
  ['aria-label="Sous-menu Par public"', 'aria-label="Sous-menu Je suis"'],
  ['<span class="nav-label">Agir</span>', '<span class="nav-label">Contribuer</span>'],
  ["<strong>Agir avec TVF</strong>", "<strong>Passer &agrave; l'action</strong>"],
  ['aria-label="Sous-menu Agir"', 'aria-label="Sous-menu Contribuer"'],
  ['<span class="nav-label">Observatoire</span>', '<span class="nav-label">Territoires</span>'],
  ["<strong>Observatoire &amp; territoires pilotes</strong>", "<strong>Comprendre le terrain</strong>"],
  ['aria-label="Sous-menu Observatoire"', 'aria-label="Sous-menu Territoires"'],
  ["Lecture par public", "Lecture par profil"],
  ['<span class="dossier-kicker">Par public</span>', '<span class="dossier-kicker">Par profil</span>'],
  [">Par public<", ">Parcours<"],
];

let changed = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const fullPath = path.join(root, file);
  let html = fs.readFileSync(fullPath, "utf8");
  const before = html;
  for (const [from, to] of replacements) {
    html = html.split(from).join(to);
  }
  if (html !== before) {
    fs.writeFileSync(fullPath, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
