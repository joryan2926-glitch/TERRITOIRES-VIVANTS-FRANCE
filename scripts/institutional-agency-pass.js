const fs = require("fs");
const path = require("path");

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();

const francePhotos = {
  saintEtienne: {
    src: "assets/photos/saint-etienne-design.webp",
    alt: "Saint-Etienne, territoire pilote de Territoires Vivants France",
  },
  parisShop: {
    src: "assets/photos/abandoned-shop-paris.webp",
    alt: "Vitrine commerciale fermee a Paris, symbole de commerce vacant a requalifier",
  },
  juraShop: {
    src: "assets/photos/old-grocery-jura.webp",
    alt: "Ancienne epicerie dans le Jura, exemple de commerce de proximite inoccupe",
  },
  reunionHouse: {
    src: "assets/photos/abandoned-house-reunion.webp",
    alt: "Maison vacante a La Reunion illustrant les enjeux de patrimoine inoccupe",
  },
  parisGarden: {
    src: "assets/photos/community-garden-paris.webp",
    alt: "Jardin partage a Paris, exemple d espace urbain transforme en lieu utile",
  },
  lilleBrownfield: {
    src: "assets/photos/brownfield-lille.webp",
    alt: "Friche urbaine a Lille, exemple d espace delaisse pouvant retrouver un usage",
  },
};

const themes = {
  home: [
    francePhotos.saintEtienne,
    francePhotos.parisShop,
    francePhotos.lilleBrownfield,
    francePhotos.parisGarden,
  ],
  saintEtienne: [
    francePhotos.saintEtienne,
    francePhotos.parisShop,
    francePhotos.lilleBrownfield,
    francePhotos.parisGarden,
  ],
  housing: [
    francePhotos.reunionHouse,
    francePhotos.saintEtienne,
    francePhotos.lilleBrownfield,
    francePhotos.parisGarden,
  ],
  commerce: [
    francePhotos.parisShop,
    francePhotos.juraShop,
    francePhotos.saintEtienne,
    francePhotos.parisGarden,
  ],
  materials: [
    francePhotos.lilleBrownfield,
    francePhotos.saintEtienne,
    francePhotos.parisShop,
    francePhotos.parisGarden,
  ],
  friches: [
    francePhotos.lilleBrownfield,
    francePhotos.parisGarden,
    francePhotos.saintEtienne,
    francePhotos.reunionHouse,
  ],
  solidarity: [
    francePhotos.parisGarden,
    francePhotos.saintEtienne,
    francePhotos.juraShop,
    francePhotos.lilleBrownfield,
  ],
  observatory: [
    francePhotos.saintEtienne,
    francePhotos.lilleBrownfield,
    francePhotos.parisShop,
    francePhotos.reunionHouse,
  ],
  institution: [
    francePhotos.saintEtienne,
    francePhotos.parisGarden,
    francePhotos.juraShop,
    francePhotos.lilleBrownfield,
  ],
  default: [
    francePhotos.saintEtienne,
    francePhotos.parisShop,
    francePhotos.parisGarden,
    francePhotos.lilleBrownfield,
  ],
};

function themeFor(file) {
  if (file === "index.html") return themes.home;
  if (/saint-etienne|dossier-saint|etude-impact|tvf-enjeux|sources-etude/i.test(file)) return themes.saintEtienne;
  if (/habitat|logement|proprietaire|proposer-un-bien|bien-solidaire|bailleur/i.test(file)) return themes.housing;
  if (/commerce|commerces|boutique/i.test(file)) return themes.commerce;
  if (/materiau|materiautheque|reemploi|banque-materiaux|ressource/i.test(file)) return themes.materials;
  if (/friche|terrain|espace-abandonne|biodiversite/i.test(file)) return themes.friches;
  if (/benevole|solidarite|insertion|recrutement|adherent/i.test(file)) return themes.solidarity;
  if (/observatoire|carte|territoire|tableau|statistique|impact|donnees/i.test(file)) return themes.observatory;
  if (/collectivite|entreprise|partenaire|gouvernance|transparence|charte|statuts|document|publication|presse|faq|contact|mentions|confidentialite|association|qui-sommes-nous|don|mecene|investisseur|financer/i.test(file)) return themes.institution;
  return themes.default;
}

function seedFor(file, length) {
  if (file === "index.html") return 0;
  return [...file].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;
}

function updateImages(html, file) {
  const theme = themeFor(file);
  let index = seedFor(file, theme.length);
  return html.replace(/<img\b([^>]*?)\s+src="assets\/photos\/[^"]+"([^>]*)>/gi, (tag, beforeSrc, afterSrc) => {
    const photo = theme[index % theme.length];
    index += 1;
    let attrs = `${beforeSrc} src="${photo.src}"${afterSrc}`;
    attrs = attrs.replace(/\s+alt="[^"]*"/i, ` alt="${photo.alt}"`);
    if (!/\s+alt="/i.test(attrs)) attrs += ` alt="${photo.alt}"`;
    attrs = attrs.replace(/\s+width="\d+"/i, ' width="960"');
    attrs = attrs.replace(/\s+height="\d+"/i, ' height="640"');
    if (!/\s+width="/i.test(attrs)) attrs += ' width="960"';
    if (!/\s+height="/i.test(attrs)) attrs += ' height="640"';
    attrs = attrs.replace(/\s+data-france-photo="[^"]*"/i, "");
    attrs += ' data-france-photo="verified"';
    return `<img${attrs}>`;
  });
}

let changed = 0;
for (const file of htmlFiles) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const after = updateImages(before, file);
  if (after !== before) {
    fs.writeFileSync(full, after, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed, francePhotos: Object.values(francePhotos).map((photo) => photo.src) }, null, 2));
