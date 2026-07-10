const assert = require("assert");
const { Readable } = require("stream");
const contactHandler = require("../api/contact");
const { _store } = require("../lib/api/rate-limit");

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value || ""; },
  };
}

async function runHandler(body, ip = "198.51.100.20") {
  const req = Readable.from([JSON.stringify(body)]);
  req.method = "POST";
  req.headers = { "content-type": "application/json", "user-agent": "TVF test", "x-forwarded-for": ip };
  req.socket = { remoteAddress: ip };
  const res = createResponse();
  await contactHandler(req, res);
  return { statusCode: res.statusCode, headers: res.headers, json: res.body ? JSON.parse(res.body) : null };
}

async function main() {
  process.env.NODE_ENV = "test";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  process.env.EMAIL_PROVIDER = "brevo";
  process.env.BREVO_API_KEY = "brevo_test";
  process.env.TVF_NOTIFICATION_EMAIL = "contact@territoiresvivantsfrance.fr";
  process.env.TVF_EMAIL_FROM = "Territoires Vivants France <contact@territoiresvivantsfrance.fr>";
  _store.clear();

  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return { ok: true, status: 201, async text() { return ""; } };
  };

  try {
    const accepted = await runHandler({
      formKind: "rendez-vous",
      submittedAfterMs: 2500,
      fields: {
        profil: "collectivite",
        nom: "Commune test",
        email: "contact@example.fr",
        territoire: "Saint-Etienne",
        objet: "Demande de rendez-vous",
        message: "Nous souhaitons qualifier un besoin territorial avec TVF.",
        consent: "true",
      },
    });
    assert.strictEqual(accepted.statusCode, 200);
    assert.strictEqual(accepted.json.ok, true);
    assert.strictEqual(accepted.headers["X-RateLimit-Limit"], "8");
    assert.strictEqual(accepted.json.email.internal, "sent");
    assert.strictEqual(accepted.json.email.confirmation, "sent");
    assert.strictEqual(calls.filter((call) => call.url.includes("supabase.co/rest/v1/contacts")).length, 1);
    assert.strictEqual(calls.filter((call) => call.url.includes("api.brevo.com")).length, 2);

    const withoutConsent = await runHandler({ fields: { objet: "Test", message: "Message suffisamment detaille." } }, "198.51.100.21");
    assert.strictEqual(withoutConsent.statusCode, 400);
    assert.strictEqual(withoutConsent.json.code, "CONSENT_REQUIRED");

    const spam = await runHandler({ website: "https://spam.example", fields: { objet: "Spam", message: "Message", consent: "true" } }, "198.51.100.22");
    assert.strictEqual(spam.statusCode, 204);

    console.log("Contact API tests passed");
  } finally {
    global.fetch = originalFetch;
    _store.clear();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });