const fs = require("fs");
const path = require("path");

const root = process.cwd();

const altByImage = {
  "assets/photos/community-garden-paris.jpg": "Benevoles mobilises sur une action collective locale",
  "assets/photos/brownfield-lille.jpg": "Plans et outils de renovation pour preparer un projet territorial",
  "assets/photos/saint-etienne-design.jpg": "Documents de travail et dossier administratif",
  "assets/photos/green-urban-space.jpg": "Espace vert urbain et biodiversite",
  "assets/photos/abandoned-house-reunion.jpg": "Logement renove pouvant retrouver un usage utile",
  "assets/photos/saint-etienne-design.jpg": "Reunion de travail entre acteurs d'un projet territorial",
  "assets/photos/abandoned-shop-paris.jpg": "Commerce de proximite amenage en centre-ville",
  "assets/photos/old-grocery-jura.jpg": "Commerce de proximite",
  "assets/photos/brownfield-lille.jpg": "Valorisation de materiaux et d'equipements reutilisables",
  "assets/photos/saint-etienne-design.jpg": "Rue urbaine observee dans une demarche de revitalisation",
  "assets/photos/abandoned-house-reunion.jpg": "Batiment renove",
  "assets/photos/brownfield-lille.jpg": "Materiaux de chantier prepares pour le reemploi",
  "assets/photos/solidarity-training.jpg": "Atelier collectif de formation et d'accompagnement",
  "assets/photos/saint-etienne-design.jpg": "Carte de travail pour l'analyse territoriale",
  "assets/photos/community-garden-paris.jpg": "Ressources alimentaires issues d'un espace nourricier",
  "assets/photos/community-garden-paris.jpg": "Jardin partage urbain et biodiversite de proximite",
  "assets/photos/saint-etienne-design.jpg": "Rue urbaine observee dans une demarche de revitalisation",
  "assets/photos/community-garden-paris.jpg": "Habitants et benevoles participant a une action locale"
};

let changed = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const html = before.replace(/<img\b[^>]*src="(assets\/photos\/[^"]+\.jpg)"[^>]*>/gi, (tag, src) => {
    const alt = altByImage[src];
    if (!alt) return tag;
    if (/\salt="[^"]*"/i.test(tag)) return tag.replace(/\salt="[^"]*"/i, ` alt="${alt}"`);
    return tag.replace(/\s\/?>$/, ` alt="${alt}"$&`);
  });
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
