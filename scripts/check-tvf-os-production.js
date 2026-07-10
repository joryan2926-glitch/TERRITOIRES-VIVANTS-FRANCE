const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const reportPath = path.join(root, "documents", "rapport-controle-production-tvf-os.md");

function loadDotEnv(file = ".env") {
  const envPath = path.join(root, file);
  if (!fs.existsSync(envPath)) return [];
  const loaded = [];
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
    loaded.push(key);
  }
  return loaded;
}

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(value = "") { this.body = String(value || ""); },
  };
}

function createRequest({ method = "GET", url, token, body = null }) {
  return {
    method,
    url,
    headers: {
      authorization: token ? `Bearer ${token}` : "",
      "user-agent": "TVF OS production control",
      "x-tvf-actor": "Controle operationnel TVF OS",
    },
    async *[Symbol.asyncIterator]() {
      if (body) yield JSON.stringify(body);
    },
  };
}

async function runHandler(handler, test) {
  const res = createResponse();
  await handler(createRequest(test), res);
  let json = null;
  try { json = res.body ? JSON.parse(res.body) : null; } catch {}
  return { statusCode: res.statusCode, json, body: res.body, headers: res.headers };
}

const loadedEnv = loadDotEnv();
process.env.TVF_DISABLE_ADMIN_AUDIT = process.env.TVF_DISABLE_ADMIN_AUDIT || "1";

const required = ["TVF_ADMIN_TOKEN", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((key) => !process.env[key]);
const token = process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "";

const checks = [
  { key: "session", label: "Session admin", handler: require("../lib/api/admin-session"), url: "/api/admin-session" },
  { key: "dashboard", label: "Dashboard public admin", handler: require("../api/dashboard"), url: "/api/dashboard?range=30&status=all&priority=all&category=all" },
  { key: "demandes", label: "Demandes entrantes", handler: require("../lib/api/admin-contacts"), url: "/api/admin-contacts?limit=5" },
  { key: "crm", label: "CRM / contacts", handler: require("../lib/api/admin-crm"), url: "/api/admin-crm?entity=dashboard" },
  { key: "emails", label: "E-mails intelligents", handler: require("../lib/api/admin-emails"), url: "/api/admin-emails?entity=dashboard" },
  { key: "dossiers", label: "Dossiers", handler: require("../lib/api/admin-cases"), url: "/api/admin-cases?entity=dashboard" },
  { key: "work", label: "Taches / agenda", handler: require("../lib/api/admin-work"), url: "/api/admin-work?entity=dashboard" },
  { key: "documents", label: "Documents", handler: require("../lib/api/admin-documents"), url: "/api/admin-documents?entity=dashboard" },
  { key: "procedures", label: "Procedures", handler: require("../lib/api/admin-procedures"), url: "/api/admin-procedures?entity=dashboard" },
  { key: "map", label: "Cartographie", handler: require("../lib/api/admin-map"), url: "/api/admin-map?entity=dashboard" },
  { key: "observatoire", label: "Observatoire", handler: require("../lib/api/admin-observatoire"), url: "/api/admin-observatoire?entity=dashboard" },
  { key: "branches", label: "Antennes", handler: require("../lib/api/admin-branches"), url: "/api/admin-branches?entity=dashboard" },
  { key: "impact", label: "Impact", handler: require("../lib/api/admin-impact"), url: "/api/admin-impact?entity=dashboard" },
  { key: "finances", label: "Finances", handler: require("../lib/api/admin-finances"), url: "/api/admin-finances?entity=dashboard" },
  { key: "governance", label: "Gouvernance", handler: require("../lib/api/admin-governance"), url: "/api/admin-governance?entity=dashboard" },
  { key: "risks", label: "Risques / conformite", handler: require("../lib/api/admin-risks"), url: "/api/admin-risks?entity=dashboard" },
  { key: "users", label: "Utilisateurs / roles", handler: require("../lib/api/admin-users"), url: "/api/admin-users?entity=dashboard" },
  { key: "settings", label: "Parametres", handler: require("../lib/api/admin-settings"), url: "/api/admin-settings?entity=dashboard" },
  { key: "knowledge", label: "Connaissances", handler: require("../lib/api/admin-knowledge"), url: "/api/admin-knowledge?entity=dashboard" },
  { key: "ai", label: "Assistant IA", handler: require("../lib/api/admin-ai"), url: "/api/admin-ai?entity=dashboard" },
];

function errorLabel(result) {
  if (!result.json) return result.body.slice(0, 240) || "Reponse non JSON";
  return result.json.code || result.json.error || `HTTP ${result.statusCode}`;
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [];
  if (missing.length) {
    fs.writeFileSync(reportPath, [
      "# Controle production TVF OS",
      "",
      `Date : ${today}`,
      "",
      "## Resultat",
      "",
      `Controle non execute : variables manquantes : ${missing.join(", ")}.`,
      "",
      "Aucune valeur de secret n'est affichee dans ce rapport.",
    ].join("\n"), "utf8");
    console.log(`TVF_OS_PRODUCTION_CHECK_SKIPPED missing=${missing.join(",")}`);
    return;
  }

  for (const check of checks) {
    const started = Date.now();
    try {
      const result = await runHandler(check.handler, { url: check.url, token });
      const ok = result.statusCode >= 200 && result.statusCode < 300 && result.json?.ok !== false;
      rows.push({ ...check, ok, statusCode: result.statusCode, duration: Date.now() - started, error: ok ? "" : errorLabel(result) });
    } catch (error) {
      rows.push({ ...check, ok: false, statusCode: 0, duration: Date.now() - started, error: error.message || "Erreur inconnue" });
    }
  }

  const okCount = rows.filter((row) => row.ok).length;
  const percent = Math.round((okCount / rows.length) * 100);
  const lines = [];
  lines.push("# Controle production TVF OS");
  lines.push("");
  lines.push(`Date : ${today}`);
  lines.push("");
  lines.push("## Synthese");
  lines.push("");
  lines.push(`- Variables locales chargees : ${loadedEnv.length ? loadedEnv.join(", ") : "aucune"}`);
  lines.push(`- Modules testes : ${rows.length}`);
  lines.push(`- Modules OK : ${okCount}`);
  lines.push(`- Capacite de lecture reelle : ${percent} %`);
  lines.push("- Mode : lecture seule, aucune creation de donnee.");
  lines.push("- Secrets : aucune valeur sensible n'est affichee.");
  lines.push("");
  lines.push("## Resultat module par module");
  lines.push("");
  lines.push("| Module | URL testee | Statut | Temps | Observation |");
  lines.push("|---|---|---:|---:|---|");
  for (const row of rows) {
    lines.push(`| ${row.label} | \`${row.url}\` | ${row.ok ? "OK" : `Erreur ${row.statusCode || "JS"}`} | ${row.duration} ms | ${row.error || "Lecture valide"} |`);
  }
  lines.push("");
  lines.push("## Lecture operationnelle");
  lines.push("");
  if (percent === 100) {
    lines.push("Tous les modules controles repondent en lecture avec les variables locales et Supabase. TVF OS est pret pour les tests de parcours reels : formulaire, demande, dossier, tache, document et reporting.");
  } else {
    lines.push("Certains modules ne repondent pas encore en lecture reelle. Les erreurs ci-dessus indiquent generalement une migration Supabase manquante, une table absente, une contrainte RLS ou une variable d'environnement incomplete.");
  }
  lines.push("");
  lines.push("## Prochaines validations terrain");
  lines.push("");
  lines.push("1. Envoyer une demande publique reelle depuis le site.");
  lines.push("2. Verifier son arrivee dans Supabase et le module Demandes.");
  lines.push("3. La rattacher a un contact CRM.");
  lines.push("4. Creer un dossier depuis cette demande.");
  lines.push("5. Ajouter une tache, un document et une decision.");
  lines.push("6. Controler que l'activite est tracee et exportable.");
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(`TVF_OS_PRODUCTION_CHECK_OK percent=${percent} ok=${okCount}/${rows.length}`);
  const failed = rows.filter((row) => !row.ok);
  if (failed.length) {
    for (const row of failed) console.log(`FAILED ${row.key} status=${row.statusCode} error=${row.error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
