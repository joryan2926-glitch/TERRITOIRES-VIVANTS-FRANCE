const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const photoDir = path.join(root, "assets", "photos");

const photos = {
  housing: ["abandoned-house-reunion.jpg", "Maison vacante à La Réunion, représentative des enjeux de remise en usage"],
  closedShop: ["abandoned-shop-paris.jpg", "Local commercial fermé à Paris en attente d'un nouvel usage"],
  oldGrocery: ["old-grocery-jura.jpg", "Ancienne épicerie fermée dans le Jura, exemple de vacance commerciale rurale"],
  localCommerce: ["local-commerce.jpg", "Commerce de proximité en activité dans un centre-ville"],
  materials: ["salvage-warehouse.jpg", "Lieu de collecte et de valorisation de matériaux issus du bâtiment"],
  brownfield: ["brownfield-lille.jpg", "Friche urbaine à Lille observée avant sa transformation"],
  garden: ["community-garden-paris.jpg", "Jardin partagé aménagé au cœur d'un quartier parisien"],
  volunteers: ["solidarity-volunteers.jpg", "Bénévoles réunis pour participer à une action collective"],
  worksite: ["construction-team.jpg", "Équipe professionnelle mobilisée sur un chantier de construction"],
  method: ["construction-reuse.jpg", "Plans de rénovation étudiés avant l'engagement d'un projet"],
  institution: ["institutional-meeting.jpg", "Réunion de travail entre acteurs d'un projet territorial"],
  documents: ["documents-resources.jpg", "Documents de travail préparés pour instruire un projet"],
  saintEtienne: ["saint-etienne-design.jpg", "Cité du Design à Saint-Étienne, territoire de préfiguration de TVF"],
};

const pageThemes = {
  "qui-sommes-nous.html": "institution",
  "pourquoi-tvf-existe.html": "brownfield",
  "nos-actions.html": "worksite",
  "notre-methode.html": "method",
  "vision-france-2035.html": "saintEtienne",
  "action-logements-vacants.html": "housing",
  "action-commerces-inoccupes.html": "closedShop",
  "action-materiaux-reemploi.html": "materials",
  "action-espaces-abandonnes.html": "brownfield",
  "action-solidarite-insertion.html": "volunteers",
  "nos-poles.html": "worksite",
  "pole-habitat-vivant.html": "housing",
  "pole-materiautheque-solidaire.html": "materials",
  "pole-commerce-vivant.html": "localCommerce",
  "pole-friches-terrains-vivants.html": "garden",
  "pole-solidarite-insertion.html": "volunteers",
  "observatoire-national.html": "saintEtienne",
  "carte-territoires.html": "saintEtienne",
  "impact-resultats.html": "institution",
  "dossier-saint-etienne.html": "saintEtienne",
  "banque-materiaux.html": "materials",
  "bien-solidaire-usage-partage.html": "housing",
  "financer-projets.html": "institution",
  "projets-pilotes.html": "saintEtienne",
  "agir-avec-nous.html": "volunteers",
  "signalement.html": "oldGrocery",
  "proprietaires.html": "housing",
  "parcours-demande.html": "method",
  "antennes-locales.html": "saintEtienne",
  "espace-collectivites.html": "institution",
  "espace-entreprises.html": "materials",
  "espace-benevoles.html": "volunteers",
  "partenariats-strategiques.html": "institution",
  "ressources.html": "documents",
  "sources-donnees.html": "documents",
  "faq.html": "institution",
  "gouvernance.html": "institution",
  "transparence.html": "institution",
  "documents-officiels.html": "documents",
  "ce-que-tvf-ne-fait-pas.html": "materials",
  "statuts.html": "documents",
  "faire-un-don.html": "institution",
  "contact.html": "saintEtienne",
  "mentions-legales.html": "documents",
  "politique-confidentialite.html": "documents",
};

const fallbackRules = [
  [/logement|habitat|proprietaire|proposer-un-bien|bien-solidaire|bailleur/, "housing"],
  [/commerce/, "closedShop"],
  [/materiau|materiautheque|reemploi|banque-materiaux/, "materials"],
  [/friche|terrain|espace-abandonne/, "brownfield"],
  [/jardin|biodiversite|ferme-urbaine/, "garden"],
  [/benevole|solidarite|insertion|recrutement/, "volunteers"],
  [/observatoire|carte|territoire|tableau|statistique|impact/, "saintEtienne"],
  [/collectivite|gouvernance|transparence|partenariat|association/, "institution"],
  [/financ|investisseur|mecene|faire-un-don/, "institution"],
  [/entreprise/, "materials"],
  [/document|ressource|statut|mention|faq|presse|publication|etude/, "documents"],
  [/methode|diagnostic|parcours/, "method"],
  [/projet|pilote|chantier/, "worksite"],
  [/vision|antenne|national/, "saintEtienne"],
];

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
  // The selected image and alt text are still applied if dimensions cannot be read.
}

function themeFor(file) {
  if (pageThemes[file]) return pageThemes[file];
  const normalized = file.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return fallbackRules.find(([pattern]) => pattern.test(normalized))?.[1] || "saintEtienne";
}

function applyPhoto(tag, theme) {
  const [name, alt] = photos[theme];
  const src = `assets/photos/${name}`;
  const dims = imageDimensions.get(src);
  let next = tag
    .replace(/src="assets\/photos\/[^"]+\.jpg"/i, `src="${src}"`)
    .replace(/\salt="[^"]*"/i, ` alt="${alt}"`)
    .replace(/\swidth="[^"]*"/i, "")
    .replace(/\sheight="[^"]*"/i, "");
  if (!/\salt=/i.test(next)) next = next.replace(/\s\/?>$/, ` alt="${alt}"$&`);
  if (dims) next = next.replace(/\s\/?>$/, ` width="${dims.width}" height="${dims.height}"$&`);
  return next;
}

function tuneHome(html) {
  const sequence = [
    "saintEtienne",
    "closedShop",
    "materials",
    "garden",
    "housing",
    "materials",
    "localCommerce",
    "garden",
    "volunteers",
    "worksite",
    "saintEtienne",
    "institution",
  ];
  let index = 0;
  return html.replace(/<img\b[^>]*src="assets\/photos\/[^"]+\.jpg"[^>]*>/gi, (tag) => {
    const theme = sequence[index] || "saintEtienne";
    index += 1;
    return applyPhoto(tag, theme);
  });
}

function updateSocialImage(html, theme) {
  const [name] = photos[theme];
  const absolute = `https://www.territoiresvivantsfrance.fr/assets/photos/${name}`;
  return html.replace(/(<meta\s+property="og:image"\s+content=")[^"]+("\s*\/?>)/i, `$1${absolute}$2`);
}

let changed = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const theme = themeFor(file);
  let html = file === "index.html"
    ? tuneHome(before)
    : before.replace(/<img\b[^>]*src="assets\/photos\/[^"]+\.jpg"[^>]*>/gi, (tag) => applyPhoto(tag, theme));
  html = updateSocialImage(html, file === "index.html" ? "saintEtienne" : theme);
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed, photos: fs.readdirSync(photoDir).filter((name) => name.endsWith(".jpg")).length }, null, 2));
