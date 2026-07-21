const fs = require("node:fs");
const handler = require("../lib/api/admin-emails");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

function clean(value) {
  return String(value || "").trim().replace(/^[`'\",;]+|[`'\",;]+$/g, "");
}

function normalizeRestUrl(raw) {
  const base = clean(raw).replace(/\/+$/, "");
  return base.endsWith("/rest/v1") ? base : `${base}/rest/v1`;
}

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}

async function runWebhook(secret) {
  const req = {
    method: "POST",
    url: `/api/admin-emails?webhook_secret=${encodeURIComponent(secret)}`,
    headers: {},
    async *[Symbol.asyncIterator]() {
      yield JSON.stringify({
        type: "email_to_request",
        provider: "test-webhook-local",
        from_email: "test-webhook@territoiresvivantsfrance.fr",
        from_name: "Test TVF OS",
        to_email: "contact@territoiresvivantsfrance.fr",
        subject: "TEST WEBHOOK TVF OS - a supprimer automatiquement",
        body_text: "Message de test technique pour verifier que les e-mails entrants arrivent dans TVF OS puis dans Demandes recues. Ce message est supprime automatiquement par le script.",
      });
    },
  };
  const res = createResponse();
  await handler(req, res);
  const payload = res.body ? JSON.parse(res.body) : {};
  if (res.statusCode >= 300 || payload.ok === false) {
    throw new Error(`Webhook e-mail refuse: ${res.statusCode} ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function deleteById(table, id) {
  if (!id) return false;
  const restUrl = normalizeRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const headers = { apikey: key, Prefer: "return=minimal" };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`${restUrl}/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers });
  if (!response.ok) throw new Error(`Nettoyage ${table} impossible: ${response.status} ${await response.text().catch(() => "")}`);
  return true;
}

async function main() {
  loadEnv(".env");
  const secret = clean(process.env.TVF_EMAIL_WEBHOOK_SECRET || process.env.EMAIL_WEBHOOK_SECRET);
  if (!secret) {
    console.error("TVF_EMAIL_WEBHOOK_SECRET manquant. Ajoutez cette variable dans .env et Vercel avant le test reel.");
    process.exit(1);
  }
  if (!clean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) || !clean(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour le test webhook reel.");
    process.exit(1);
  }

  const result = await runWebhook(secret);
  const emailId = result.email?.id || result.converted_email?.id;
  const contactId = result.contact?.id;
  await deleteById("contacts", contactId);
  await deleteById("email_messages", emailId);
  console.log("TVF_EMAIL_WEBHOOK_TO_REQUEST_OK");
  console.log(JSON.stringify({ email_id: emailId, contact_id: contactId, cleaned: true }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});