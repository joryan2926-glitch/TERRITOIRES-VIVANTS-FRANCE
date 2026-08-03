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
  delete process.env.GMAIL_SMTP_USER;
  delete process.env.GMAIL_SMTP_APP_PASSWORD;
  delete process.env.TVF_EMAIL_DRY_RUN;
  process.env.RESEND_API_KEY = "re_test";
  process.env.TVF_NOTIFICATION_EMAIL = "contact@territoiresvivantsfrance.fr"; // ancienne valeur Vercel : doit etre routee vers Gmail
  process.env.TVF_EMAIL_FROM = "Territoires Vivants France <contact@territoiresvivantsfrance.fr>";
  _store.clear();

  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET", body: options.body || "" });
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
      attachments: [
        { filename: "photo-test.png", contentType: "image/png", content: "iVBORw0KGgo=" }
      ],
    });
    assert.strictEqual(accepted.statusCode, 200);
    assert.strictEqual(accepted.json.ok, true);
    assert.strictEqual(accepted.headers["X-RateLimit-Limit"], "8");
    assert.strictEqual(accepted.json.email.internal, "sent");
    assert.strictEqual(accepted.json.email.confirmation, "sent");
    assert.strictEqual(calls.filter((call) => call.url.includes("supabase.co/rest/v1/contacts")).length, 1);
        assert.strictEqual(calls.filter((call) => call.url.includes("api.resend.com")).length, 2);
    const internalEmailPayload = JSON.parse(calls.find((call) => call.url.includes("api.resend.com")).body);
    assert.deepStrictEqual(internalEmailPayload.to, ["territoiresvivantsfrance@gmail.com"]);
    assert.strictEqual(internalEmailPayload.reply_to, "contact@example.fr");
    assert.ok(Array.isArray(internalEmailPayload.attachments));
    assert.strictEqual(internalEmailPayload.attachments.length, 2);
    assert.strictEqual(internalEmailPayload.attachments[0].contentType, "application/pdf");
    assert.ok(internalEmailPayload.attachments[0].content.startsWith("JVBER"));
    assert.strictEqual(internalEmailPayload.attachments[1].filename, "photo-test.png");


    delete process.env.RESEND_API_KEY;
    process.env.GMAIL_SMTP_USER = "territoiresvivantsfrance@gmail.com";
    process.env.GMAIL_SMTP_APP_PASSWORD = "app_password_test";
    process.env.TVF_EMAIL_DRY_RUN = "1";
    global.__TVF_EMAIL_DRY_RUN__ = [];
    calls.length = 0;
    const gmailAccepted = await runHandler({
      formKind: "contact",
      submittedAfterMs: 2500,
      fields: {
        profil: "proprietaire",
        nom: "Proprietaire test",
        email: "proprietaire@example.fr",
        territoire: "Saint-Etienne",
        objet: "Bien vacant",
        message: "Je souhaite transmettre une situation de bien vacant.",
        consent: "true",
      },
    }, "198.51.100.23");
    assert.strictEqual(gmailAccepted.statusCode, 200);
    assert.strictEqual(gmailAccepted.json.email.internal, "sent");
    assert.strictEqual(global.__TVF_EMAIL_DRY_RUN__[0].provider, "gmail");
    assert.ok(global.__TVF_EMAIL_DRY_RUN__[0].message.attachments[0].content.startsWith("JVBER"));
    assert.strictEqual(calls.filter((call) => call.url.includes("api.resend.com")).length, 0);
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

