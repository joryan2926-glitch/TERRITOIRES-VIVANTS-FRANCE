const fs = require("fs");
const path = require("path");

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
JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

for (const scriptName of ["start:clear", "start:lan", "start:tunnel", "test:supabase"]) {
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
  "@expo/ngrok"
]) {
  if (!dependencies[dependency]) {
    console.error(`MISSING dependency ${dependency}`);
    ok = false;
  }
}

const appSource = fs.readFileSync(path.join(root, "App.js"), "utf8");
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
  "longitude"
]) {
  if (!appSource.includes(token)) {
    console.error(`MISSING App.js token ${token}`);
    ok = false;
  }
}

const repositorySource = fs.readFileSync(path.join(root, "src/services/requestRepository.js"), "utf8");
for (const token of ["supabase.storage.from", "mobile_requests", "photo_bucket", "photo_path"]) {
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