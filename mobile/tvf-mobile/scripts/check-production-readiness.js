const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
let ok = true;

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    console.error(`MOBILE_PRODUCTION_INVALID_JSON ${relativePath}: ${error.message}`);
    ok = false;
    return null;
  }
}

function requireFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`MOBILE_PRODUCTION_MISSING_FILE ${relativePath}`);
    ok = false;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requireIncludes(source, token, label) {
  if (!source.includes(token)) {
    console.error(`MOBILE_PRODUCTION_MISSING_TOKEN ${label}: ${token}`);
    ok = false;
  }
}

const app = readJson("app.json")?.expo || {};
const eas = readJson("eas.json") || {};
const pkg = readJson("package.json") || {};

if (app.name !== "TVF Mobile") {
  console.error("MOBILE_PRODUCTION_APP_NAME_INVALID");
  ok = false;
}

if (!/^\d+\.\d+\.\d+$/.test(app.version || "")) {
  console.error("MOBILE_PRODUCTION_VERSION_INVALID");
  ok = false;
}

if (pkg.version !== app.version) {
  console.error(`MOBILE_PRODUCTION_VERSION_MISMATCH package=${pkg.version} app=${app.version}`);
  ok = false;
}

if (app.android?.package !== "fr.territoiresvivants.tvfmobile") {
  console.error("MOBILE_PRODUCTION_ANDROID_PACKAGE_INVALID");
  ok = false;
}

if (app.ios?.bundleIdentifier !== "fr.territoiresvivants.tvfmobile") {
  console.error("MOBILE_PRODUCTION_IOS_BUNDLE_INVALID");
  ok = false;
}

for (const permission of ["CAMERA", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION", "READ_MEDIA_IMAGES"]) {
  if (!app.android?.permissions?.includes(permission)) {
    console.error(`MOBILE_PRODUCTION_ANDROID_PERMISSION_MISSING ${permission}`);
    ok = false;
  }
}

for (const key of ["NSLocationWhenInUseUsageDescription", "NSPhotoLibraryUsageDescription", "NSCameraUsageDescription"]) {
  if (!app.ios?.infoPlist?.[key]) {
    console.error(`MOBILE_PRODUCTION_IOS_PERMISSION_TEXT_MISSING ${key}`);
    ok = false;
  }
}

if (eas.build?.production?.android?.buildType !== "app-bundle") {
  console.error("MOBILE_PRODUCTION_ANDROID_AAB_MISSING");
  ok = false;
}

if (!eas.build?.preview || !eas.build?.production) {
  console.error("MOBILE_PRODUCTION_EAS_PROFILES_MISSING");
  ok = false;
}

for (const asset of ["assets/tvf-mobile-logo.png"]) {
  const fullPath = path.join(root, asset);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size < 10000) {
    console.error(`MOBILE_PRODUCTION_ASSET_INVALID ${asset}`);
    ok = false;
  }
}

const privacy = requireFile("PRIVACY_MOBILE.md");
for (const token of ["Finalite de l'application", "Donnees pouvant etre collectees", "Photos et localisation", "Droits des personnes", "contact@territoiresvivantsfrance.fr"]) {
  requireIncludes(privacy, token, "PRIVACY_MOBILE.md");
}

const store = requireFile("STORE_LISTING.md");
for (const token of ["Description courte", "Description longue", "Fonctionnalites principales", "Captures d'ecran a produire", "Points de vigilance avant diffusion"]) {
  requireIncludes(store, token, "STORE_LISTING.md");
}

const release = requireFile("RELEASE_CHECKLIST.md");
for (const token of ["Parcours a tester", "Avant publication officielle", "Decision de fin de chantier mobile"]) {
  requireIncludes(release, token, "RELEASE_CHECKLIST.md");
}

const productionGuide = requireFile("PRODUCTION_RELEASE_GUIDE.md");
for (const token of ["Go / No-Go", "Build production Android", "Publication Play Store", "Ce qui reste manuel"]) {
  requireIncludes(productionGuide, token, "PRODUCTION_RELEASE_GUIDE.md");
}

if (!ok) process.exit(1);
console.log("TVF_MOBILE_PRODUCTION_READINESS_OK");