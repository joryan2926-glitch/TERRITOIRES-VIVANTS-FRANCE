const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const photoDir = path.join(root, "assets", "photos");

const imageDimensions = new Map();
try {
  const python = "C:\\Users\\jowst\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
  const code = `
from PIL import Image, ImageFile
from pathlib import Path
ImageFile.LOAD_TRUNCATED_IMAGES = True
for p in Path("assets/photos").glob("*.jpg"):
    im = Image.open(p)
    print(f"{p.as_posix()}|{im.width}|{im.height}")
`;
  const output = execFileSync(python, ["-c", code], { cwd: root, encoding: "utf8" });
  for (const line of output.trim().split(/\r?\n/)) {
    const [src, width, height] = line.split("|");
    if (src && width && height) imageDimensions.set(src, { width, height });
  }
} catch {
  // Dimensions are an enhancement. The script still harmonizes image choices if PIL is unavailable.
}

const themeImages = [
  {
    image: "assets/photos/housing-renovation.jpg",
    keywords: ["logement", "habitat", "proprietaire", "propriétaire", "bien-solidaire", "bien", "bailleurs"]
  },
  {
    image: "assets/photos/local-commerce.jpg",
    keywords: ["commerce", "commerces", "commercial"]
  },
  {
    image: "assets/photos/materials-warehouse.jpg",
    keywords: ["materiau", "materiaux", "matériau", "matériaux", "materiautheque", "matériauthèque", "reemploi", "réemploi", "banque-materiaux"]
  },
  {
    image: "assets/photos/urban-garden-community.jpg",
    keywords: ["friche", "friches", "terrain", "terrains", "espaces-abandonnes", "biodiversite", "biodiversité"]
  },
  {
    image: "assets/photos/community-volunteers.jpg",
    keywords: ["benevole", "bénévole", "benevoles", "bénévoles", "solidarite", "solidarité", "insertion", "recrutement"]
  },
  {
    image: "assets/photos/territorial-map.jpg",
    keywords: ["observatoire", "carte", "cartographie", "territoire", "territoires", "tableau", "statistique", "impact", "resultats", "résultats"]
  },
  {
    image: "assets/photos/institutional-meeting.jpg",
    keywords: ["collectivite", "collectivité", "collectivites", "collectivités", "gouvernance", "transparence", "partenariat", "partenariats", "association", "qui-sommes-nous"]
  },
  {
    image: "assets/photos/construction-reuse.jpg",
    keywords: ["financer", "finance", "investisseur", "mecene", "mécène", "fonds", "projet", "projets", "pilote"]
  },
  {
    image: "assets/photos/documents-resources.jpg",
    keywords: ["document", "documents", "ressources", "statuts", "mentions", "faq", "presse", "publication", "etudes", "études"]
  },
  {
    image: "assets/photos/urban-renewal-street.jpg",
    keywords: ["vision", "methode", "méthode", "antennes", "nationale", "plateforme", "mobile"]
  }
];

const fallbackImage = "assets/photos/urban-renewal-street.jpg";

function imageFor(file) {
  const key = file.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (const theme of themeImages) {
    if (theme.keywords.some((word) => key.includes(word.normalize("NFD").replace(/\p{Diacritic}/gu, "")))) {
      return theme.image;
    }
  }
  return fallbackImage;
}

function withDimensions(tag, src) {
  const dims = imageDimensions.get(src);
  if (!dims) return tag;
  let next = tag.replace(/\swidth="[^"]*"/i, "").replace(/\sheight="[^"]*"/i, "");
  return next.replace(/\s\/?>$/, ` width="${dims.width}" height="${dims.height}"$&`);
}

function replacePhotoSrcs(html, file) {
  const selected = imageFor(file);
  return html.replace(/<img\b([^>]*?)src="assets\/photos\/[^"]+\.jpg"([^>]*)>/gi, (tag, before, after) => {
    const isLogo = /logo/i.test(tag);
    if (isLogo) return tag;
    let src = selected;
    if (/page-hero-photo|panel-photo|priority-photo|ambition-photo|photo-panel|gallery-grid/i.test(tag)) {
      src = selected;
    } else if (/pole-photo/i.test(tag)) {
      const context = `${before} ${after}`.toLowerCase();
      if (context.includes("materiaux") || context.includes("matériaux")) src = "assets/photos/materials-warehouse.jpg";
      else src = selected;
    }
    return withDimensions(tag.replace(/src="assets\/photos\/[^"]+\.jpg"/i, `src="${src}"`), src);
  });
}

function tuneHome(html) {
  const homeReplacements = [
    ["assets/photos/neighborhood-renovation.jpg", "assets/photos/urban-renewal-street.jpg"],
    ["assets/photos/local-shop.jpg", "assets/photos/local-commerce.jpg"],
    ["assets/photos/reuse-materials.jpg", "assets/photos/materials-warehouse.jpg"],
    ["assets/photos/urban-green.jpg", "assets/photos/urban-garden-community.jpg"],
    ["assets/photos/renovated-building.jpg", "assets/photos/housing-renovation.jpg"],
    ["assets/photos/volunteers.jpg", "assets/photos/community-volunteers.jpg"]
  ];
  for (const [from, to] of homeReplacements) {
    html = html.split(from).join(to);
  }
  html = html
    .replace(/class="pole-photo" src="assets\/photos\/local-commerce\.jpg"/i, 'class="pole-photo" src="assets/photos/territorial-map.jpg"')
    .replace(/class="panel-photo" src="assets\/photos\/urban-renewal-street\.jpg"/i, 'class="panel-photo" src="assets/photos/urban-renewal-street.jpg"')
    .replace(/class="priority-photo" src="assets\/photos\/urban-garden-community\.jpg"/i, 'class="priority-photo" src="assets/photos/territorial-map.jpg"')
    .replace(/class="ambition-photo" src="assets\/photos\/community-volunteers\.jpg"/i, 'class="ambition-photo" src="assets/photos/institutional-meeting.jpg"');
  return html.replace(/<img\b[^>]*src="assets\/photos\/[^"]+\.jpg"[^>]*>/gi, (tag) => {
    const src = (tag.match(/src="([^"]+)"/i) || [])[1];
    return src ? withDimensions(tag, src) : tag;
  });
}

let changed = 0;
for (const filePath of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, filePath);
  const before = fs.readFileSync(full, "utf8");
  let html = filePath === "index.html" ? tuneHome(before) : replacePhotoSrcs(before, filePath);
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed, photos: fs.readdirSync(photoDir).filter((name) => name.endsWith(".jpg")).length }, null, 2));
