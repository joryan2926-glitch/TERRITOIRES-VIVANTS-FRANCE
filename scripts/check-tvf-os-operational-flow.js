const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fichier manquant : ${file}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

function assertIncludes(file, tokens) {
  const content = read(file);
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length) {
    throw new Error(`${file} ne contient pas : ${missing.join(", ")}`);
  }
}

function assertFile(file) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Fichier manquant : ${file}`);
  }
}

const requiredFiles = [
  "admin-login.html",
  "admin.html",
  "admin-demandes.html",
  "admin-demandes.js",
  "admin-crm.html",
  "admin-crm.js",
  "admin-dossiers.html",
  "admin-dossiers.js",
  "admin-documents.html",
  "admin-documents.js",
  "admin-emails.html",
  "admin-emails.js",
  "admin-activity.html",
  "admin-activity.js",
  "admin-nav.js",
  "lib/api/admin-contacts.js",
  "lib/api/admin-emails.js",
  "lib/api/admin-cases.js",
  "lib/api/admin-documents.js",
  "scripts/test-mobile-tvf-os-real.js",
  "SUIVI_OPERATIONNEL_FORMULAIRES.md",
];

requiredFiles.forEach(assertFile);

assertIncludes("admin-demandes.js", [
  "mobile-import-case",
  "Transformer en dossier",
  "data-create-case",
  "Voir le dossier",
  "Repondre par e-mail",
  "Bibliotheque",
]);

assertIncludes("admin-emails.js", [
  "Convertir en demande",
  "Ouvrir la reponse",
  "Copier le brouillon",
  "data-convert-email",
]);

assertIncludes("admin-documents.js", [
  "Bibliotheque interne TVF",
  "Liste des pieces par demande",
  "Convention valorisation de materiaux",
  "Courriers types prets a envoyer",
]);

assertIncludes("admin-dossiers.js", [
  "case_number",
  "status",
  "priority",
]);

assertIncludes("scripts/test-mobile-tvf-os-real.js", [
  "mobile_requests",
  "mobile-import-case",
  "cleanup(created)",
  "TVF_MOBILE_TO_OS_OK",
]);

assertIncludes("SUIVI_OPERATIONNEL_FORMULAIRES.md", [
  "Formulaire public",
  "TVF Mobile",
  "dossier d'instruction",
  "Documents",
  "type courte",
]);

console.log("TVF_OS_OPERATIONAL_FLOW_OK modules=7 parcours=demande-contact-dossier-documents-reponse");
