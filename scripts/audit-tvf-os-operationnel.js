const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));

const modules = [
  { key: "dashboard", label: "Tableau de bord", group: "Accueil", page: "dashboard.html", js: "dashboard.js", api: "api/dashboard.js", test: "tests/dashboard-api.test.js", doc: "documents/module-dashboard-tvf-os.md", report: "documents/rapport-validation-dashboard-tvf-os.md", priority: "P1" },
  { key: "demandes", label: "Demandes entrantes", group: "Reception", page: "admin-demandes.html", js: "admin-demandes.js", api: "lib/api/admin-contacts.js", test: "tests/admin-contacts-api.test.js", sql: "supabase/tvf-os-demandes-entrantes.sql", verification: "supabase/tvf-os-demandes-entrantes-verification.sql", seed: "supabase/tvf-os-demandes-entrantes-test-data.sql", doc: "documents/module-demandes-entrantes-tvf-os.md", report: "documents/rapport-validation-demandes-entrantes-tvf-os.md", priority: "P1" },
  { key: "emails", label: "Boite mail", group: "Reception", page: "admin-emails.html", js: "admin-emails.js", api: "lib/api/admin-emails.js", test: "tests/admin-emails-api.test.js", sql: "supabase/tvf-os-emails.sql", verification: "supabase/tvf-os-emails-verification.sql", seed: "supabase/tvf-os-emails-test-data.sql", doc: "documents/module-emails-intelligents-tvf-os.md", report: "documents/rapport-validation-emails-intelligents-tvf-os.md", priority: "P1" },
  { key: "crm", label: "Contacts", group: "Reception", page: "admin-crm.html", js: "admin-crm.js", api: "lib/api/admin-crm.js", test: "tests/admin-crm-api.test.js", sql: "supabase/tvf-os-crm.sql", verification: "supabase/tvf-os-crm-verification.sql", seed: "supabase/tvf-os-crm-test-data.sql", doc: "documents/module-crm-contacts-tvf-os.md", report: "documents/rapport-validation-crm-contacts-tvf-os.md", priority: "P1" },
  { key: "dossiers", label: "Dossiers", group: "Instruction", page: "admin-dossiers.html", js: "admin-dossiers.js", api: "lib/api/admin-cases.js", test: "tests/admin-cases-api.test.js", sql: "supabase/tvf-os-dossiers.sql", verification: "supabase/tvf-os-dossiers-verification.sql", seed: "supabase/tvf-os-dossiers-test-data.sql", doc: "documents/module-dossiers-tvf-os.md", report: "documents/rapport-validation-dossiers-tvf-os.md", priority: "P1" },
  { key: "work", label: "Taches", group: "Instruction", page: "admin-work.html", js: "admin-work.js", api: "lib/api/admin-work.js", test: "tests/admin-work-api.test.js", sql: "supabase/tvf-os-work.sql", verification: "supabase/tvf-os-work-verification.sql", seed: "supabase/tvf-os-work-test-data.sql", doc: "documents/module-taches-agenda-tvf-os.md", report: "documents/rapport-validation-taches-agenda-tvf-os.md", priority: "P1" },
  { key: "documents", label: "Documents", group: "Instruction", page: "admin-documents.html", js: "admin-documents.js", api: "lib/api/admin-documents.js", test: "tests/admin-documents-api.test.js", sql: "supabase/tvf-os-documents.sql", verification: "supabase/tvf-os-documents-verification.sql", seed: "supabase/tvf-os-documents-test-data.sql", doc: "documents/module-documents-tvf-os.md", report: "documents/rapport-validation-documents-tvf-os.md", priority: "P1" },
  { key: "procedures", label: "Procedures", group: "Instruction", page: "admin-procedures.html", js: "admin-procedures.js", api: "lib/api/admin-procedures.js", test: "tests/admin-procedures-api.test.js", sql: "supabase/tvf-os-procedures.sql", verification: "supabase/tvf-os-procedures-verification.sql", seed: "supabase/tvf-os-procedures-test-data.sql", doc: "documents/module-procedures-tvf-os.md", report: "documents/rapport-validation-procedures-tvf-os.md", priority: "P2" },
  { key: "map", label: "Cartographie", group: "Suivi", page: "admin-map.html", js: "admin-map.js", api: "lib/api/admin-map.js", test: "tests/admin-map-api.test.js", sql: "supabase/tvf-os-map.sql", verification: "supabase/tvf-os-map-verification.sql", seed: "supabase/tvf-os-map-test-data.sql", doc: "documents/module-cartographie-tvf-os.md", report: "documents/rapport-validation-cartographie-tvf-os.md", priority: "P2" },
  { key: "observatoire", label: "Observatoire", group: "Suivi", page: "admin-observatoire.html", js: "admin-observatoire.js", api: "lib/api/admin-observatoire.js", test: "tests/admin-observatoire-api.test.js", sql: "supabase/tvf-os-observatoire.sql", verification: "supabase/tvf-os-observatoire-verification.sql", seed: "supabase/tvf-os-observatoire-test-data.sql", doc: "documents/module-observatoire-territorial-tvf-os.md", report: "documents/rapport-validation-observatoire-territorial-tvf-os.md", priority: "P2" },
  { key: "impact", label: "Resultats", group: "Suivi", page: "admin-impact.html", js: "admin-impact.js", api: "lib/api/admin-impact.js", test: "tests/admin-impact-api.test.js", sql: "supabase/tvf-os-impact.sql", verification: "supabase/tvf-os-impact-verification.sql", seed: "supabase/tvf-os-impact-test-data.sql", doc: "documents/module-impact-statistiques-tvf-os.md", report: "documents/rapport-validation-impact-statistiques-tvf-os.md", priority: "P2" },
  { key: "finances", label: "Finances", group: "Pilotage", page: "admin-finances.html", js: "admin-finances.js", api: "lib/api/admin-finances.js", test: "tests/admin-finances-api.test.js", sql: "supabase/tvf-os-finances.sql", verification: "supabase/tvf-os-finances-verification.sql", seed: "supabase/tvf-os-finances-test-data.sql", doc: "documents/module-finances-tvf-os.md", report: "documents/rapport-validation-finances-tvf-os.md", priority: "P2" },
  { key: "users", label: "Utilisateurs / roles", group: "Outils", page: "admin-users.html", js: "admin-users.js", api: "lib/api/admin-users.js", test: "tests/admin-users-api.test.js", sql: "supabase/tvf-os-users.sql", verification: "supabase/tvf-os-users-verification.sql", seed: "supabase/tvf-os-users-test-data.sql", doc: "documents/module-utilisateurs-roles-permissions-tvf-os.md", report: "documents/rapport-validation-utilisateurs-roles-permissions-tvf-os.md", priority: "P1" },
  { key: "settings", label: "Reglages", group: "Outils", page: "admin-settings.html", js: "admin-settings.js", api: "lib/api/admin-settings.js", test: "tests/admin-settings-api.test.js", sql: "supabase/tvf-os-settings.sql", verification: "supabase/tvf-os-settings-verification.sql", seed: "supabase/tvf-os-settings-test-data.sql", doc: "documents/module-parametres-tvf-os.md", report: "documents/rapport-validation-parametres-tvf-os.md", priority: "P1" },
  { key: "activity", label: "Journal activite", group: "Outils", page: "admin-activity.html", js: "admin-activity.js", api: "lib/api/admin-audit.js", test: "tests/admin-audit-api.test.js", sql: "supabase/tvf-os-audit-transversal.sql", doc: "documents/rapport-conformite-tvf-os.md", report: "documents/rapport-conformite-tvf-os.md", priority: "P1" },
  { key: "knowledge", label: "Base interne", group: "Outils", page: "admin-knowledge.html", js: "admin-knowledge.js", api: "lib/api/admin-knowledge.js", test: "tests/admin-knowledge-api.test.js", sql: "supabase/tvf-os-knowledge.sql", verification: "supabase/tvf-os-knowledge-verification.sql", seed: "supabase/tvf-os-knowledge-test-data.sql", doc: "documents/module-knowledge-tvf-os.md", report: "documents/rapport-validation-knowledge-tvf-os.md", priority: "P2" },
  { key: "ai", label: "Assistant", group: "Outils", page: "admin-ai.html", js: "admin-ai.js", api: "lib/api/admin-ai.js", test: "tests/admin-ai-api.test.js", sql: "supabase/tvf-os-ai.sql", verification: "supabase/tvf-os-ai-verification.sql", seed: "supabase/tvf-os-ai-test-data.sql", doc: "documents/module-assistant-ia-tvf-os.md", report: "documents/rapport-validation-assistant-ia-tvf-os.md", priority: "P2" },
];

function statusFor(module) {
  const checks = [
    ["page", module.page],
    ["interface", module.js],
    ["api", module.api],
    ["test", module.test],
    ["schema", module.sql],
    ["verification", module.verification],
    ["donnees_test", module.seed],
    ["spec", module.doc],
    ["rapport", module.report],
  ].filter(([, file]) => Boolean(file));
  const done = checks.filter(([, file]) => exists(file));
  const missing = checks.filter(([, file]) => !exists(file)).map(([name, file]) => `${name}: ${file}`);
  const percent = Math.round((done.length / checks.length) * 100);
  let level = "Operationnel";
  if (percent < 60) level = "A reprendre";
  else if (percent < 85) level = "Partiel";
  else if (missing.length) level = "A finaliser";
  return { checks, done, missing, percent, level };
}

const results = modules.map((module) => ({ ...module, ...statusFor(module) }));
const average = Math.round(results.reduce((sum, item) => sum + item.percent, 0) / results.length);
const p1 = results.filter((item) => item.priority === "P1");
const p1Average = Math.round(p1.reduce((sum, item) => sum + item.percent, 0) / p1.length);
const missingItems = results.flatMap((item) => item.missing.map((missing) => ({ module: item.label, missing })));

const now = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push("# Audit operationnel TVF OS");
lines.push("");
lines.push(`Date de generation : ${now}`);
lines.push("");
lines.push("## Synthese");
lines.push("");
lines.push(`- Capacite documentaire et technique globale : ${average} %`);
lines.push(`- Capacite des modules prioritaires P1 : ${p1Average} %`);
lines.push(`- Modules controles : ${results.length}`);
lines.push(`- Points manquants detectes : ${missingItems.length}`);
lines.push("");
lines.push("Lecture : ce pourcentage mesure la presence des briques attendues dans le depot local : page, JS, API, tests, SQL, verification, donnees de test, specification et rapport. Il ne remplace pas un test utilisateur reel en production.");
lines.push("");
lines.push("## Capacite module par module");
lines.push("");
lines.push("| Module | Groupe | Priorite | Niveau | Capacite | Manquants |");
lines.push("|---|---|---:|---|---:|---|");
for (const item of results) {
  lines.push(`| ${item.label} | ${item.group} | ${item.priority} | ${item.level} | ${item.percent} % | ${item.missing.length ? item.missing.join("<br>") : "Aucun dans le depot"} |`);
}
lines.push("");
lines.push("## Chaine operationnelle cible");
lines.push("");
lines.push("1. Reception : formulaire public, e-mail, appel, WhatsApp ou rendez-vous.");
lines.push("2. Qualification : categorie, priorite, pole, contact, organisation et pieces utiles.");
lines.push("3. Instruction : creation ou rattachement a un dossier, taches, echeances, documents.");
lines.push("4. Decision : validation humaine, points de vigilance, financement, convention.");
lines.push("5. Execution : terrain local, cartographie, suivi des actions.");
lines.push("6. Preuve : resultats, reporting, documents, base interne.");
lines.push("");
lines.push("## Points de vigilance");
lines.push("");
lines.push("- La presence locale des fichiers ne garantit pas que toutes les migrations ont ete executees dans Supabase production.");
lines.push("- Les modules IA et e-mails restent a brancher sur des flux reels controles avant usage complet.");
lines.push("- Les roles et permissions doivent etre testes avec de vrais profils avant ouverture a plusieurs utilisateurs.");
lines.push("- Les documents et exports doivent rester internes tant que les informations administratives definitives ne sont pas completement renseignees.");
lines.push("");
lines.push("## Prochaines actions recommandees");
lines.push("");
lines.push("| Priorite | Action | Resultat attendu |");
lines.push("|---|---|---|");
lines.push("| P1 | Verifier en production chaque endpoint admin apres migrations Supabase | Aucun module en erreur 500/502 |");
lines.push("| P1 | Tester le parcours formulaire -> contact -> demande -> dossier | Traitement complet d'une demande reelle |");
lines.push("| P1 | Tester session unique admin sur mobile et desktop | Une seule connexion pour tous les modules |");
lines.push("| P2 | Relier e-mails entrants a une procedure de tri et de reponse | File de traitement exploitable |");
lines.push("| P2 | Formaliser les exports mensuels resultats / demandes / partenaires | Reporting financeur et pilotage |");
lines.push("| P3 | Ajouter des tests utilisateurs terrain avec 3 scenarios reels | Ajustements UX avant ouverture elargie |");
lines.push("");

fs.writeFileSync(path.join(root, "documents", "rapport-audit-operationnel-tvf-os.md"), lines.join("\n"), "utf8");
console.log(`TVF_OS_OPERATIONAL_AUDIT_OK average=${average} p1=${p1Average} missing=${missingItems.length}`);
