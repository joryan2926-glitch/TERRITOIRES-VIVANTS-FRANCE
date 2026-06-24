const fs = require("fs");
const path = require("path");

const root = process.cwd();

const altByImage = {
  "assets/photos/community-volunteers.jpg": "Benevoles mobilises sur une action collective locale",
  "assets/photos/construction-reuse.jpg": "Plans et outils de renovation pour preparer un projet territorial",
  "assets/photos/documents-resources.jpg": "Documents de travail et dossier administratif",
  "assets/photos/green-urban-space.jpg": "Espace vert urbain et biodiversite",
  "assets/photos/housing-renovation.jpg": "Logement renove pouvant retrouver un usage utile",
  "assets/photos/institutional-meeting.jpg": "Reunion de travail entre acteurs d'un projet territorial",
  "assets/photos/local-commerce.jpg": "Commerce de proximite amenage en centre-ville",
  "assets/photos/local-shop.jpg": "Commerce de proximite",
  "assets/photos/materials-warehouse.jpg": "Valorisation de materiaux et d'equipements reutilisables",
  "assets/photos/neighborhood-renovation.jpg": "Quartier en renovation",
  "assets/photos/renovated-building.jpg": "Batiment renove",
  "assets/photos/reuse-materials.jpg": "Materiaux de chantier prepares pour le reemploi",
  "assets/photos/solidarity-training.jpg": "Atelier collectif de formation et d'accompagnement",
  "assets/photos/territorial-map.jpg": "Carte de travail pour l'analyse territoriale",
  "assets/photos/urban-garden-community.jpg": "Ressources alimentaires issues d'un espace nourricier",
  "assets/photos/urban-green.jpg": "Espace naturel et vegetation",
  "assets/photos/urban-renewal-street.jpg": "Rue urbaine observee dans une demarche de revitalisation",
  "assets/photos/volunteers.jpg": "Habitants et benevoles participant a une action locale"
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
