const fs = require("fs");
const path = require("path");

const root = process.cwd();

const requiredFiles = [
  "README.md",
  ".env.example",
  "admin.html",
  "admin-login.html",
  "admin-demandes.html",
  "contact.html",
  "api/contact.js",
  "api/admin/[module].js",
  "lib/api/admin-contacts.js",
  "lib/api/admin-session.js",
  "api/dashboard.js",
  "scripts/check-tvf-os-operational-flow.js",
  "scripts/check-tvf-os-production.js",
  "scripts/test-mobile-tvf-os-real.js",
  "scripts/test-email-webhook-tvf-os.js",
  "scripts/test-site-form-real.js",
  "documents/procedure-traitement-formulaires-tvf.md",
  "documents/procedure-connexion-email-officiel-tvf-os.md",
  "documents/checklist-brevo-dns-rgpd-formulaires.md",
  "documents/cahier-suivi-mise-operationnel-tvf-os.md",
  "documents/rapport-controle-production-tvf-os.md",
  "documents/registre-elements-officiels-en-attente.md",
  "documents/checklist-mise-en-service-operationnelle-tvf.md",
  "documents/recette-operationnelle-tvf-os.md",
  "documents/tableau-suivi-documents-envoyes.md",
  "documents/procedure-jour-j-lancement-operationnel-tvf.md",
  "documents/registre-incidents-exploitation-tvf-os.md",
  "supabase/contacts-operational-upgrade.sql",
  "supabase/tvf-os-mvp-install-complet.sql",
  "supabase/tvf-os-modules-restants-install.sql",
  "supabase/tvf-os-documents.sql",
  "supabase/tvf-mobile-requests.sql",
  "supabase/verify-tvf-mobile-requests.sql",
  "mobile/tvf-mobile/App.js",
  "mobile/tvf-mobile/package.json",
  "mobile/tvf-mobile/RELEASE_CHECKLIST.md",
  "mobile/tvf-mobile/PRODUCTION_RELEASE_GUIDE.md"
];

const requiredPackageScripts = [
  "check",
  "check:encoding",
  "check:js",
  "check:documents",
  "check:operational",
  "test:admin",
  "test:user-flow",
  "test:tvf-os-flow",
  "check:tvf-os:production",
  "test:mobile-os",
  "test:site-form",
  "check:mobile:production"
];

const requiredEnvNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BREVO_API_KEY",
  "TVF_NOTIFICATION_EMAIL",
  "TVF_EMAIL_REPLY_TO",
  "TVF_EMAIL_FROM",
  "TVF_ADMIN_TOKEN"
];

const missing = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    missing.push(`Fichier manquant: ${file}`);
  }
}

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  for (const script of requiredPackageScripts) {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      missing.push(`Script npm manquant: ${script}`);
    }
  }
} catch (error) {
  missing.push(`package.json illisible: ${error.message}`);
}

const envExamplePath = path.join(root, ".env.example");
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf8");
  for (const name of requiredEnvNames) {
    if (!envExample.includes(name)) {
      missing.push(`Variable absente de .env.example: ${name}`);
    }
  }
}

if (missing.length > 0) {
  console.error("TVF_OPERATIONAL_READINESS_KO");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("TVF_OPERATIONAL_READINESS_OK");
console.log("Controle local termine: site, TVF OS, Supabase, e-mail, documents et mobile sont couverts par les artefacts attendus.");