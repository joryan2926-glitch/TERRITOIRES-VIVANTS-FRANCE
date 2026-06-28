const fs = require("fs");
const path = require("path");

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();

const imageMeta = {
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Vue de Saint-Etienne et de la Cite du Design, territoire pilote de Territoires Vivants France",
  },
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Rue urbaine francaise en transformation, symbole de revitalisation territoriale",
  },
  "assets/photos/abandoned-house-reunion.webp": {
    width: 960,
    height: 640,
    alt: "Batiment renove illustrant la remise en usage du patrimoine vacant",
  },
  "assets/photos/abandoned-house-reunion.webp": {
    width: 960,
    height: 640,
    alt: "Logement ancien en cours de renovation pour retrouver un usage utile",
  },
  "assets/photos/abandoned-house-reunion.webp": {
    width: 960,
    height: 640,
    alt: "Maison vacante a La Reunion illustrant les enjeux de patrimoine inoccupe",
  },
  "assets/photos/abandoned-shop-paris.webp": {
    width: 960,
    height: 640,
    alt: "Vitrine commerciale fermee en centre-ville en attente d une nouvelle activite",
  },
  "assets/photos/old-grocery-jura.webp": {
    width: 960,
    height: 640,
    alt: "Ancienne epicerie rurale illustrant la revitalisation commerciale de proximite",
  },
  "assets/photos/abandoned-shop-paris.webp": {
    width: 960,
    height: 640,
    alt: "Commerce de proximite actif dans une rue francaise",
  },
  "assets/photos/old-grocery-jura.webp": {
    width: 960,
    height: 640,
    alt: "Boutique de quartier illustrant la vie commerciale locale",
  },
  "assets/photos/brownfield-lille.webp": {
    width: 960,
    height: 640,
    alt: "Materiaux tries dans un espace de stockage pour le reemploi territorial",
  },
  "assets/photos/brownfield-lille.webp": {
    width: 960,
    height: 640,
    alt: "Materiaux de chantier recuperes et prepares pour une seconde vie",
  },
  "assets/photos/brownfield-lille.webp": {
    width: 960,
    height: 640,
    alt: "Chantier utilisant des ressources et materiaux reemployables",
  },
  "assets/photos/brownfield-lille.webp": {
    width: 960,
    height: 640,
    alt: "Friche urbaine francaise pouvant accueillir de nouveaux usages",
  },
  "assets/photos/community-garden-paris.webp": {
    width: 960,
    height: 640,
    alt: "Jardin partage urbain illustrant la transformation d un espace delaisse",
  },
  "assets/photos/community-garden-paris.webp": {
    width: 960,
    height: 640,
    alt: "Espace vert urbain anime par des habitants et associations locales",
  },
  "assets/photos/community-garden-paris.webp": {
    width: 960,
    height: 640,
    alt: "Benevoles mobilises sur une action collective et solidaire",
  },
  "assets/photos/community-garden-paris.webp": {
    width: 960,
    height: 640,
    alt: "Habitants et benevoles reunis autour d un projet local",
  },
  "assets/photos/community-garden-paris.webp": {
    width: 960,
    height: 640,
    alt: "Equipe de benevoles participant a une initiative citoyenne",
  },
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Artisans et techniciens mobilises sur un chantier de renovation",
  },
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Reunion institutionnelle entre acteurs publics, associatifs et techniques",
  },
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Documents de travail, plans et ressources pour cadrer un projet territorial",
  },
  "assets/photos/saint-etienne-design.webp": {
    width: 960,
    height: 640,
    alt: "Carte territoriale utilisee pour analyser les besoins et suivre les projets",
  },
};

const themes = {
  home: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/abandoned-shop-paris.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  saintEtienne: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  housing: [
    "assets/photos/abandoned-house-reunion.webp",
    "assets/photos/abandoned-house-reunion.webp",
    "assets/photos/abandoned-house-reunion.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  commerce: [
    "assets/photos/abandoned-shop-paris.webp",
    "assets/photos/old-grocery-jura.webp",
    "assets/photos/abandoned-shop-paris.webp",
    "assets/photos/old-grocery-jura.webp",
  ],
  materials: [
    "assets/photos/brownfield-lille.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  friches: [
    "assets/photos/brownfield-lille.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  solidarity: [
    "assets/photos/community-garden-paris.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  observatory: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  institutions: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  actions: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/abandoned-house-reunion.webp",
    "assets/photos/abandoned-shop-paris.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/community-garden-paris.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
  poles: [
    "assets/photos/abandoned-house-reunion.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/abandoned-shop-paris.webp",
    "assets/photos/brownfield-lille.webp",
    "assets/photos/community-garden-paris.webp",
  ],
  default: [
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
    "assets/photos/saint-etienne-design.webp",
  ],
};

function pickTheme(file) {
  if (file === "index.html") return themes.home;
  if (/saint-etienne|etude-impact|dossier-saint|tvf-enjeux|sources-etude/i.test(file)) return themes.saintEtienne;
  if (/nos-actions|notre-methode|vision|financer-projets|fonds|investisseur|mecene|projets/i.test(file)) return themes.actions;
  if (/nos-poles/i.test(file)) return themes.poles;
  if (/habitat|logement|proprietaire|bien-solidaire|proposer-un-bien/i.test(file)) return themes.housing;
  if (/commerce|boutique/i.test(file)) return themes.commerce;
  if (/materiautheque|materiaux|banque-materiaux|reemploi|ressource/i.test(file)) return themes.materials;
  if (/friche|terrain|espaces-abandonnes/i.test(file)) return themes.friches;
  if (/solidarite|insertion|benevole|recrutement|adherent/i.test(file)) return themes.solidarity;
  if (/observatoire|carte|impact|statistique|tableau|donnees|territoire/i.test(file)) return themes.observatory;
  if (/collectivite|entreprise|partenaire|gouvernance|transparence|charte|statuts|document|publication|presse|faq|contact|mentions|confidentialite|association|qui-sommes-nous/i.test(file)) return themes.institutions;
  return themes.default;
}

function replacePhotoImages(html, file) {
  const theme = pickTheme(file);
  const seed = file === "index.html"
    ? 0
    : [...file].reduce((total, char) => total + char.charCodeAt(0), 0) % theme.length;
  let index = seed;
  return html.replace(/<img\b([^>]*?)\s+src="assets\/photos\/[^"]+"([^>]*)>/gi, (tag, beforeSrc, afterSrc) => {
    const next = theme[index % theme.length];
    index += 1;
    const meta = imageMeta[next];
    let attrs = `${beforeSrc} src="${next}"${afterSrc}`;
    if (/assets\/photos\/neighborhood-renovation\.jpg|assets\/photos\/urban-green\.jpg|assets\/photos\/salvage-warehouse\.webp/i.test(tag)) {
      attrs = attrs.replace(/\s+src="assets\/photos\/(neighborhood-renovation\.jpg|urban-green\.jpg|salvage-warehouse\.webp)"/i, ` src="${next}"`);
    }
    attrs = attrs.replace(/\s+alt="[^"]*"/i, ` alt="${meta.alt}"`);
    if (!/\s+alt="/i.test(attrs)) attrs += ` alt="${meta.alt}"`;
    attrs = attrs.replace(/\s+width="\d+"/i, ` width="${meta.width}"`);
    attrs = attrs.replace(/\s+height="\d+"/i, ` height="${meta.height}"`);
    if (!/\s+width="/i.test(attrs)) attrs += ` width="${meta.width}"`;
    if (!/\s+height="/i.test(attrs)) attrs += ` height="${meta.height}"`;
    return `<img${attrs}>`;
  });
}

let changed = 0;
const report = [];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const after = replacePhotoImages(before, file)
    .split("assets/photos/saint-etienne-design.jpg").join("assets/photos/saint-etienne-design.webp")
    .split("assets/photos/community-garden-paris.jpg").join("assets/photos/community-garden-paris.webp")
    .split("assets/photos/brownfield-lille.webp").join("assets/photos/brownfield-lille.webp");

  if (after !== before) {
    fs.writeFileSync(full, after, "utf8");
    changed += 1;
    const images = [...after.matchAll(/src="(assets\/photos\/[^"]+)"/g)].map((match) => match[1]);
    report.push({ file, images: [...new Set(images)] });
  }
}

console.log(JSON.stringify({ changed, reportSample: report.slice(0, 12) }, null, 2));
