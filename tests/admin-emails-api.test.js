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
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndCreate(); console.log("Emails API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
