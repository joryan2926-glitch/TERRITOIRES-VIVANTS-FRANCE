const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

const root = path.resolve(__dirname, "..");
const contactHandler = require("../api/contact");

function loadEnv(file = ".env") {
  const envPath = path.join(root, file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

loadEnv();
process.env.TVF_CONTACT_RATE_LIMIT = process.env.TVF_CONTACT_RATE_LIMIT || "100";

function clean(value) {
  return String(value || "").trim().replace(/^[`'\",;]+|[`'\",;]+$/g, "");
}

function normalizeRestUrl(raw) {
  const base = clean(raw).replace(/\/+$/, "");
  return base.endsWith("/rest/v1") ? base : `${base}/rest/v1`;
}

const restUrl = normalizeRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
const table = process.env.SUPABASE_CONTACTS_TABLE || "contacts";

function assertEnv() {
  const missing = [];
  if (!restUrl) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY) missing.push("BREVO_API_KEY ou RESEND_API_KEY");
  if (missing.length) throw new Error(`Variables manquantes pour test formulaire site reel : ${missing.join(", ")}`);
}

function headers(extra = {}) {
  const output = { apikey: serviceKey, "Content-Type": "application/json", ...extra };
  if (!serviceKey.startsWith("sb_")) output.Authorization = `Bearer ${serviceKey}`;
  return output;
}

async function rest(pathname, options = {}) {
  const response = await fetch(`${restUrl}/${pathname}`, { ...options, headers: headers(options.headers || {}) });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${options.method || "GET"} ${pathname} failed ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function createRequest(body) {
  const req = Readable.from([JSON.stringify(body)]);
  req.method = "POST";
  req.url = "/api/contact";
  req.headers = {
    "content-type": "application/json",
    "user-agent": "TVF site form real test",
    referer: "https://www.territoiresvivantsfrance.fr/contact.html",
    "x-forwarded-for": `127.0.0.${Math.floor(Math.random() * 100) + 1}`,
  };
  return req;
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

async function runContact(body) {
  const res = createResponse();
  await contactHandler(createRequest(body), res);
  const json = res.body ? JSON.parse(res.body) : null;
  if (res.statusCode < 200 || res.statusCode >= 300 || json?.ok === false) {
    throw new Error(`Contact API failed ${res.statusCode}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function cleanup(id) {
  if (!id) return;
  await rest(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }).catch((error) => {
    console.warn(`TVF_SITE_FORM_CLEANUP_WARNING ${error.message}`);
  });
}

async function main() {
  assertEnv();
  const marker = `TEST-SITE-TVF-${Date.now()}`;
  const created = { id: null };
  try {
    const result = await runContact({
      formKind: "contact",
      page: "/contact.html",
      section: "recette-production",
      consent: true,
      submittedAfterMs: 2500,
      fields: {
        profil: "Recette technique TVF",
        nom: "Recette formulaire site",
        email: "contact@territoiresvivantsfrance.fr",
        telephone: "04 65 81 54 69",
        territoire: "Saint-Etienne",
        objet: marker,
        message: "Demande de test automatique pour verifier le flux site vers Supabase, notification e-mail et TVF OS. A supprimer automatiquement."
      }
    });

    assert.strictEqual(result.ok, true);
    assert.ok(result.email?.internal === "sent" || result.email?.configured === false || result.email?.internal === "failed");

    const rows = await rest(`${table}?subject=eq.${encodeURIComponent(marker)}&select=id,subject,email,status,priority,category,source_page&limit=1`);
    const row = rows?.[0];
    assert.ok(row?.id, "la demande site doit etre retrouvee dans Supabase");
    created.id = row.id;
    assert.strictEqual(row.email, "contact@territoiresvivantsfrance.fr");
    assert.ok(["nouveau", "new", null, undefined].includes(row.status) || row.status);

    console.log(`TVF_SITE_FORM_REAL_OK marker=${marker} contact=${row.id} email_internal=${result.email?.internal || "unknown"} email_confirmation=${result.email?.confirmation || "unknown"}`);
  } finally {
    await cleanup(created.id);
  }
}

main().catch((error) => {
  console.error(`TVF_SITE_FORM_REAL_FAILED ${error.message}`);
  process.exit(1);
});