const assert = require("assert");
const handler = require("../lib/api/admin-emails");
const { normalizeSupabaseRestUrl, inferCategory, inferPriority, analyzeEmail, emailPayload, taskPayload } = handler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-emails", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferCategory("La mairie souhaite parler d'un local vacant"), "local_authority");
  assert.strictEqual(inferPriority("Urgent risque securite demain"), "P1");
  const analysis = analyzeEmail({ subject: "Don de materiaux", body_text: "Nous avons des palettes et du bois" });
  assert.strictEqual(analysis.category, "materials");
  assert.ok(analysis.draft_response.includes("Materiautheque"));
  assert.strictEqual(emailPayload({ from_email: "A@TEST.FR", subject: "Rdv mairie", body_text: "Bonjour la commune" }).from_email, "a@test.fr");
  assert.throws(() => taskPayload({ email_message_id: "bad" }), /E-mail invalide/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndCreate() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/email_messages?") && !options.method) return mockResponse([{ id: "e1", status: "analyzed", priority: "P1" }]);
    if (u.includes("/email_ai_suggestions?") && !options.method) return mockResponse([{ id: "s1", status: "proposed" }]);
    if (u.includes("/email_tasks?") && !options.method) return mockResponse([{ id: "t1", status: "todo" }]);
    if (u.includes("/email_workflow_events?") && !options.method) return mockResponse([]);
    if (u.includes("/email_messages?select=*") && options.method === "POST") return mockResponse([{ id: "e2", ...JSON.parse(options.body) }], 201);
    if (u.includes("/email_workflow_events?select=*") && options.method === "POST") return mockResponse([{ id: "ev1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/email_ai_suggestions?select=*") && options.method === "POST") return mockResponse([{ id: "s2", ...JSON.parse(options.body) }], 201);
    if (u.includes("/email_tasks?select=*") && options.method === "POST") return mockResponse([{ id: "t2", ...JSON.parse(options.body) }], 201);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-emails?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.urgent, 1);
    const created = await runHandler({ method: "POST", body: { type: "email", from_email: "mairie@example.test", subject: "Local vacant", body_text: "Bonjour commune local vacant" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.email.category, "local_authority");
    assert.ok(created.json.suggestion.payload.draft_response);
  } finally { global.fetch = originalFetch; }
}async function testWebhookEmailToRequest() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.TVF_EMAIL_WEBHOOK_SECRET = "mail-secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;
    if (u.includes("/email_messages?select=*") && method === "POST") {
      calls.push("email_messages");
      assert.strictEqual(body.to_email, "contact@territoiresvivantsfrance.fr");
      return mockResponse([{ id: "00000000-0000-0000-0000-00000000e001", ...body }], 201);
    }
    if (u.includes("/email_workflow_events?select=*") && method === "POST") return mockResponse([{ id: "00000000-0000-0000-0000-00000000e002", ...body }], 201);
    if (u.includes("/email_ai_suggestions?select=*") && method === "POST") return mockResponse([{ id: "00000000-0000-0000-0000-00000000e003", ...body }], 201);
    if (u.includes("/email_tasks?select=*") && method === "POST") return mockResponse([{ id: "00000000-0000-0000-0000-00000000e004", ...body }], 201);
    if (u.includes("/email_messages?select=*") && method === "GET") return mockResponse([{ id: "00000000-0000-0000-0000-00000000e001", from_email: "mairie@example.fr", from_name: "Mairie", to_email: "contact@territoiresvivantsfrance.fr", subject: "Local vacant", body_text: "Bonjour, la commune souhaite echanger sur un local vacant.", status: "analyzed", priority: "P2", category: "local_authority", pole: "Collectivites & Territoires", missing_pieces: ["territoire concerne"], next_action: "Qualifier", next_action_due_at: "2026-07-07T10:00:00.000Z" }]);
    if (u.includes("/contacts?select=*") && method === "POST") {
      calls.push("contacts");
      assert.strictEqual(body.channel, "email");
      assert.strictEqual(body.category, "collectivite-territoire");
      return mockResponse([{ id: "00000000-0000-0000-0000-00000000c001", ...body }], 201);
    }
    if (u.includes("/email_messages?") && method === "PATCH") return mockResponse([{ id: "00000000-0000-0000-0000-00000000e001", status: "converted", contact_id: "00000000-0000-0000-0000-00000000c001" }]);
    throw new Error("Unexpected webhook URL " + method + " " + u);
  };
  try {
    const result = await runHandler({ method: "POST", url: "/api/admin-emails?webhook_secret=mail-secret", token: "", body: { type: "email_to_request", from_email: "mairie@example.fr", from_name: "Mairie", subject: "Local vacant", body_text: "Bonjour, la commune souhaite echanger sur un local vacant." } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.contact.category, "collectivite-territoire");
    assert.deepStrictEqual(calls, ["email_messages", "contacts"]);
  } finally {
    global.fetch = originalFetch;
    delete process.env.TVF_EMAIL_WEBHOOK_SECRET;
  }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndCreate(); await testWebhookEmailToRequest(); console.log("Emails API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
