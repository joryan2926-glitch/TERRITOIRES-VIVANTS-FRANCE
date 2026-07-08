const assert = require("assert");
const handler = require("../api/admin-risks");
const { normalizeSupabaseRestUrl, riskPayload, checkPayload, riskScore, riskAssistant, complianceAssistant } = handler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-risks", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(riskPayload({ title: "RGPD", risk_type: "rgpd" }).risk_type, "rgpd");
  assert.strictEqual(checkPayload({ title: "Consentement", blocking: "true" }).blocking, true);
  assert.strictEqual(riskScore({ severity: "critical", likelihood: "likely" }), 12);
  const assistant = riskAssistant({ title: "R", severity: "critical", likelihood: "likely", status: "open" }, [{ blocking: true, status: "missing" }]);
  assert.strictEqual(assistant.should_block, true);
  assert.ok(complianceAssistant([{ required: true, status: "valid" }], [], [], []).compliance_score >= 100);
  assert.throws(() => riskPayload({ title: "X", severity: "bad" }), /Severite/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndList() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/risks?")) return mockResponse([{ id: "r1", title: "Consentement", risk_type: "rgpd", severity: "high", likelihood: "possible", status: "open" }]);
    if (u.includes("/compliance_checks?")) return mockResponse([{ id: "c1", title: "Consentement", status: "missing", blocking: true, required: true }]);
    if (u.includes("/incidents?")) return mockResponse([{ id: "i1", title: "Incident", status: "triage", severity: "medium" }]);
    if (u.includes("/consent_records?")) return mockResponse([{ id: "co1", person_name: "Test", status: "pending" }]);
    if (u.includes("/audit_logs?")) return mockResponse([{ id: "a1", action: "seed" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-risks?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.blocking_checks, 1);
    const list = await runHandler({ url: "/api/admin-risks?entity=risks" });
    assert.strictEqual(list.json.risks[0].assistant.level, "modere");
  } finally { global.fetch = originalFetch; }
}
async function testCreateRisk() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/risks?select=*") && options.method === "POST") return mockResponse([{ id: "r1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/audit_logs?select=*") && options.method === "POST") return mockResponse([{ id: "a1", ...JSON.parse(options.body) }], 201);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "risk", title: "Risque test", severity: "critical", likelihood: "likely" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.risk.title, "Risque test");
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndList(); await testCreateRisk(); console.log("Risks API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
