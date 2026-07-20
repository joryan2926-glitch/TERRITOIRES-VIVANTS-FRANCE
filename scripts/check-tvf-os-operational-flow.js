const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) throw new Error(`Fichier manquant : ${file}`);
  return fs.readFileSync(fullPath, "utf8");
}

function assertFile(file) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Fichier manquant : ${file}`);
}

function assertIncludes(file, tokens) {
  const content = read(file);
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length) throw new Error(`${file} ne contient pas : ${missing.join(", ")}`);
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
  "documents/procedure-reporting-mensuel-tvf-os.md",
  "documents/modele-synthese-mensuelle-tvf-os.md",
  "documents/tableau-pilotage-quotidien-tvf-os.md",
];

requiredFiles.forEach(assertFile);

const checks = [
  ["admin-demandes.js", ["mobile-import-case", "Transformer en dossier", "data-create-case", "Voir le dossier", "Repondre par e-mail", "Bibliotheque"]],
  ["admin-emails.js", ["Convertir en demande", "Ouvrir la reponse", "Copier le brouillon", "data-convert-email"]],
  ["admin-documents.js", ["Bibliotheque interne TVF", "Liste des pieces par demande", "Convention valorisation de materiaux", "Courriers types prets a envoyer"]],
  ["admin-dossiers.js", ["case_number", "status", "priority"]],
  ["scripts/test-mobile-tvf-os-real.js", ["mobile_requests", "mobile-import-case", "cleanup(created)", "TVF_MOBILE_TO_OS_OK"]],
  ["SUIVI_OPERATIONNEL_FORMULAIRES.md", ["Formulaire public", "TVF Mobile", "dossier d'instruction", "Documents", "type courte", "procedure-reporting-mensuel-tvf-os.md", "modele-synthese-mensuelle-tvf-os.md", "tableau-pilotage-quotidien-tvf-os.md"]],
  ["documents/procedure-reporting-mensuel-tvf-os.md", ["reporting mensuel", "Demandes recues", "Dossiers", "Documents", "Regles de prudence"]],
  ["documents/modele-synthese-mensuelle-tvf-os.md", ["Synthese mensuelle TVF OS", "Indicateurs du mois", "Dossiers a suivre", "Pieces manquantes", "Regles de diffusion"]],
  ["documents/tableau-pilotage-quotidien-tvf-os.md", ["Tableau de pilotage quotidien TVF OS", "Routine du matin", "Tableau du jour", "Relances a envoyer", "Fin de journee"]],
];

checks.forEach(([file, tokens]) => assertIncludes(file, tokens));

console.log("TVF_OS_OPERATIONAL_FLOW_OK modules=10 parcours=demande-contact-dossier-documents-reponse-reporting-quotidien");