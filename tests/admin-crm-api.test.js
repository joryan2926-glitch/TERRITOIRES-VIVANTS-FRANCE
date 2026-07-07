const assert = require("assert");
const crmHandler = require("../api/admin-crm");

const {
  inferContactType,
  inferOrganizationType,
  crmAssistant,
  contactPayload,
  organizationPayload,
  historyPayload,
  linkPayload,
} = crmHandler._private;

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}

function createRequest({ method = "GET", url = "/api/admin-crm", token = "secret", body = null }) {
  return {
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    async *[Symbol.asyncIterator]() {
      if (body) yield JSON.stringify(body);
    },
  };
}

async function runHandler(options) {
  const res = createResponse();
  await crmHandler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

function testRules() {
  assert.strictEqual(inferContactType({ notes: "Maire adjointe habitat" }), "elu");
  assert.strictEqual(inferContactType({ notes: "Proprietaire bailleur" }), "proprietaire");
  assert.strictEqual(inferOrganizationType({ name: "Mairie de Demo" }), "collectivite");
  assert.strictEqual(inferOrganizationType({ name: "SAS Bois Reemploi" }), "entreprise");

  const contact = contactPayload({ display_name: "Alice Demo", email: "ALICE@EXAMPLE.FR", notes: "Elue" });
  assert.strictEqual(contact.email, "alice@example.fr");
  assert.strictEqual(contact.contact_type, "elu");
  assert.strictEqual(contact.consent_status, "unknown");
  assert.ok(contact.next_action.includes("consentement"));

  const org = organizationPayload({ name: "Mairie Demo", city: "Saint-Etienne" });
  assert.strictEqual(org.organization_type, "collectivite");
  assert.strictEqual(org.relation_status, "prospect");
  assert.ok(org.next_action.includes("partenariat"));

  const assistant = crmAssistant({ display_name: "Bob", contact_type: "autre", consent_status: "unknown" }, "contact");
  assert.ok(assistant.missing_fields.includes("coordonnees"));
  assert.ok(assistant.missing_fields.includes("consentement RGPD"));

  assert.throws(() => contactPayload({ display_name: "X", contact_type: "bad" }), /Type de contact invalide/);
  assert.throws(() => organizationPayload({ name: "X", relation_status: "bad" }), /Niveau de relation invalide/);
  assert.throws(() => historyPayload({ subject: "Sans cible" }), /contact ou une organisation/);
  assert.throws(() => linkPayload({ contact_id: "x" }), /Contact et organisation/);
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testListContacts() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/crm_contacts?"));
    assert.ok(String(url).includes("contact_type=eq.elu"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "1", display_name: "Alice", email: "alice@example.fr", contact_type: "elu", consent_status: "granted" }]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-crm?entity=contacts&contact_type=elu" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.contacts.length, 1);
    assert.strictEqual(result.json.contacts[0].assistant.missing_fields.length, 0);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateContact() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).includes("/crm_contacts?"));
    assert.strictEqual(options.method, "POST");
    const payload = JSON.parse(options.body);
    assert.strictEqual(payload.display_name, "Alice Demo");
    assert.strictEqual(payload.contact_type, "elu");
    return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000201", ...payload }]); } };
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "contact", display_name: "Alice Demo", notes: "Elue", email: "alice@example.fr" } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.contact.contact_type, "elu");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateOrganizationAndHistory() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options.method });
    const payload = JSON.parse(options.body);
    if (String(url).includes("/organizations?")) {
      assert.strictEqual(payload.organization_type, "collectivite");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000301", ...payload }]); } };
    }
    if (String(url).includes("/relationship_history?")) {
      assert.strictEqual(payload.interaction_type, "note");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000302", ...payload }]); } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const org = await runHandler({ method: "POST", body: { type: "organization", name: "Mairie Demo" } });
    assert.strictEqual(org.statusCode, 201);
    const history = await runHandler({ method: "POST", body: { type: "history", organization_id: "00000000-0000-0000-0000-000000000301", subject: "Premier contact" } });
    assert.strictEqual(history.statusCode, 201);
    assert.strictEqual(calls.length, 2);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const textUrl = String(url);
    if (textUrl.includes("crm_contacts")) return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "1", consent_status: "unknown", next_action_due_at: "2026-01-01T00:00:00.000Z" }]); } };
    if (textUrl.includes("organizations")) return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "2", relation_status: "prospect" }]); } };
    if (textUrl.includes("crm_duplicate_suggestions")) return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "3", status: "pending" }]); } };
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ url: "/api/admin-crm?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.contacts_total, 1);
    assert.strictEqual(result.json.dashboard.consent_missing, 1);
    assert.strictEqual(result.json.dashboard.duplicates_pending, 1);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListContacts();
  await testCreateContact();
  await testCreateOrganizationAndHistory();
  await testDashboard();
  console.log("CRM API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
