const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const root = path.resolve(__dirname, "..");
const repoRoot = path.resolve(root, "..", "..");
const required = [
  "package.json",
  "package-lock.json",
  "app.json",
  "babel.config.js",
  ".env.example",
  ".nvmrc",
  "SUPABASE_ACTIVATION.md",
  "RELEASE_CHECKLIST.md",
  "PRIVACY_MOBILE.md",
  "STORE_LISTING.md",
  "eas.json",
  "App.js",
  "src/theme.js",
  "src/data.js",
  "src/services/requestPayload.js",
  "src/services/requestRepository.js",
  "src/services/supabaseClient.js",
  "scripts/test-mobile-supabase.js",
  "assets/tvf-mobile-logo.png"
];

let ok = true;

for (const file of required) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING ${file}`);
    ok = false;
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const appJson = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
const easJson = JSON.parse(fs.readFileSync(path.join(root, "eas.json"), "utf8"));
const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
for (const [profileName, profile] of Object.entries({
  development: easJson.build?.development,
  preview: easJson.build?.preview,
  production: easJson.build?.production
})) {
  if (!profile) {
    console.error(`MISSING EAS profile ${profileName}`);
    ok = false;
  }
}

for (const [field, value] of Object.entries({
  "expo.name": appJson.expo?.name,
  "expo.slug": appJson.expo?.slug,
  "expo.scheme": appJson.expo?.scheme,
  "expo.description": appJson.expo?.description,
  "expo.ios.bundleIdentifier": appJson.expo?.ios?.bundleIdentifier,
  "expo.android.package": appJson.expo?.android?.package
})) {
  if (!value) {
    console.error(`MISSING app metadata ${field}`);
    ok = false;
  }
}

for (const scriptName of ["start:clear", "start:lan", "start:tunnel", "test:supabase", "build:android:preview", "build:android:production", "build:ios:production"]) {
  if (!pkg.scripts?.[scriptName]) {
    console.error(`MISSING script ${scriptName}`);
    ok = false;
  }
}

for (const dependency of [
  "expo-image-picker",
  "expo-location",
  "expo-font",
  "react-native-web",
  "@expo/metro-runtime",
  "@supabase/supabase-js",
  "react-native-url-polyfill",
  "@opentelemetry/api",
  "@expo/ngrok",
  "@react-native-async-storage/async-storage"
]) {
  if (!dependencies[dependency]) {
    console.error(`MISSING dependency ${dependency}`);
    ok = false;
  }
}

const appPath = path.join(root, "App.js");
const appSource = fs.readFileSync(appPath, "utf8");
try {
  babel.transformSync(appSource, {
    filename: appPath,
    presets: ["babel-preset-expo"],
    babelrc: false,
    configFile: false
  });
} catch (error) {
  console.error(`INVALID App.js syntax ${error.message}`);
  ok = false;
}
for (const token of [
  "buildRequestPayload",
  "submitMobileRequest",
  "getSupabaseConfigStatus",
  "flowCategoryOptions",
  "expo-image-picker",
  "expo-location",
  "ActivityIndicator",
  "Alert.alert",
  "photoUri",
  "latitude",
  "longitude",
  "AsyncStorage",
  "SUBMISSION_HISTORY_KEY",
  "retryRequest",
  "photoCount",
  "releaseReadiness",
  "fieldTestPlan"
]) {
  if (!appSource.includes(token)) {
    console.error(`MISSING App.js token ${token}`);
    ok = false;
  }
}

const dataSource = fs.readFileSync(path.join(root, "src/data.js"), "utf8");
for (const token of ["fieldTestPlan", "releaseReadiness"]) {
  if (!dataSource.includes(token)) {
    console.error(`MISSING mobile release token ${token}`);
    ok = false;
  }
}

const storeListingSource = fs.readFileSync(path.join(root, "STORE_LISTING.md"), "utf8");
for (const token of ["Description courte", "Description longue", "Captures d'ecran"]) {
  if (!storeListingSource.includes(token)) {
    console.error(`MISSING store listing section ${token}`);
    ok = false;
  }
}

const privacySource = fs.readFileSync(path.join(root, "PRIVACY_MOBILE.md"), "utf8");
for (const token of ["Donnees pouvant etre collectees", "Photos et localisation", "Droits des personnes"]) {
  if (!privacySource.includes(token)) {
    console.error(`MISSING privacy section ${token}`);
    ok = false;
  }
}

const repositorySource = fs.readFileSync(path.join(root, "src/services/requestRepository.js"), "utf8");
for (const token of ["supabase.storage.from", "mobile_requests", "photo_bucket", "photo_path", "storagePaths"]) {
  if (!repositorySource.includes(token)) {
    console.error(`MISSING requestRepository token ${token}`);
    ok = false;
  }
}

for (const sqlFile of ["supabase/tvf-mobile-requests.sql", "supabase/verify-tvf-mobile-requests.sql"]) {
  const fullPath = path.join(repoRoot, sqlFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING ${sqlFile}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log("TVF_MOBILE_PROJECT_CHECK_OK");