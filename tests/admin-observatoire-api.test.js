const assert = require("assert");
const observatoireHandler = require("../lib/api/admin-observatoire");
const { normalizeSupabaseRestUrl, inferIndicatorType, priorityScore, dataQualityScore, assistantForDiagnostic, sourcePayload, indicatorPayload, diagnosticPayload, watchPayload } = observatoireHandler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-observatoire", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await observatoireHandler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferIndicatorType({ label: "Commerces vacants centre-ville" }), "commerces_vacants");
  assert.ok(priorityScore({ indicator_type: "risques", priority_level: "critique", trend: "hausse" }) >= 80);
  assert.ok(dataQualityScore({ sources: [{ reliability_level: "officiel", last_checked_at: "2026-01-01" }], indicators: [{ status: "valide" }] }) >= 46);
  const assistant = assistantForDiagnostic({ territory_label: "Saint-Etienne", priority_score: 70 }, [], [], [{ status: "a_qualifier" }]);
  assert.ok(assistant.missing_fields.includes("sources"));
  assert.strictEqual(assistant.watch_to_qualify, 1);
  const source = sourcePayload({ source_name: "INSEE", source_type: "public_data", reliability_level: "officiel" });
  assert.strictEqual(source.source_name, "INSEE");
  const indicator = indicatorPayload({ territory_label: "Loire", label: "Friches a qualifier", priority_level: "fort" });
  assert.strictEqual(indicator.indicator_type, "friches");
  assert.ok(indicator.priority_score >= 60);
  const diagnostic = diagnosticPayload({ territory_label: "Loire", opportunities: "A;B", risks: "C" });
  assert.deepStrictEqual(diagnostic.opportunities, ["A", "B"]);
  const watch = watchPayload({ title: "AAP test", watch_type: "appel_a_projet", opportunity_level: "fort" });
  assert.strictEqual(watch.watch_type, "appel_a_projet");
  assert.throws(() => sourcePayload({ source_name: "X", source_type: "bad" }), /Type de source/);
}
async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
}
async function testListAndDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/territorial_sources?") && u.includes("select=id")) return mockResponse([{ id: "s1", status: "a_verifier", reliability_level: "officiel", territory_label: "Loire" }]);
    if (u.includes("/territorial_indicators?") && u.includes("select=id")) return mockResponse([{ id: "i1", status: "valide", indicator_type: "friches", priority_level: "fort", priority_score: 76, territory_label: "Loire" }]);
    if (u.includes("/territorial_diagnostics?") && u.includes("select=id")) return mockResponse([{ id: "d1", status: "a_valider", priority_score: 76, data_quality_score: 70, territory_label: "Loire" }]);
    if (u.includes("/territorial_watch_items?") && u.includes("select=id")) return mockResponse([{ id: "w1", status: "a_qualifier", watch_type: "dispositif", opportunity_level: "fort", territory_label: "Loire" }]);
    if (u.includes("/territorial_sources?")) return mockResponse([{ id: "s1", source_name: "Source", source_type: "public_data", status: "active", reliability_level: "officiel", territory_label: "Loire" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const list = await runHandler({ url: "/api/admin-observatoire?entity=sources&q=Source" });
    assert.strictEqual(list.statusCode, 200);
    assert.strictEqual(list.json.sources.length, 1);
    const dashboard = await runHandler({ url: "/api/admin-observatoire?entity=dashboard" });
    assert.strictEqual(dashboard.json.dashboard.sources_total, 1);
    assert.strictEqual(dashboard.json.dashboard.high_priorities, 1);
  } finally { global.fetch = originalFetch; }
}
async function testCreateAndGenerateDiagnostic() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/territorial_sources?select=*") && options.method === "POST") { assert.strictEqual(options.method, "POST"); const payload = JSON.parse(options.body); assert.strictEqual(payload.source_name, "Source test"); return mockResponse([{ id: "s1", ...payload }], 201); }
    if (u.includes("/territorial_indicators?") && u.includes("territory_label=ilike")) return mockResponse([{ id: "i1", label: "Indicateur", priority_score: 82, status: "valide", territory_label: "Loire" }]);
    if (u.includes("/territorial_sources?") && u.includes("territory_label=ilike")) return mockResponse([{ id: "s1", reliability_level: "officiel", last_checked_at: "2026-01-01", territory_label: "Loire" }]);
    if (u.includes("/territorial_watch_items?") && u.includes("territory_label=ilike")) return mockResponse([{ id: "w1", status: "a_qualifier", territory_label: "Loire" }]);
    if (u.includes("/territorial_diagnostics?select=*")) { const payload = JSON.parse(options.body); return mockResponse([{ id: "d1", ...payload }], 201); }
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "source", source_name: "Source test", territory_label: "Loire" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.source.source_name, "Source test");
    const diagnostic = await runHandler({ method: "POST", body: { type: "diagnostic_from_indicators", territory_label: "Loire" } });
    assert.strictEqual(diagnostic.statusCode, 201);
    assert.ok(diagnostic.json.diagnostic.priority_score >= 82);
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListAndDashboard();
  await testCreateAndGenerateDiagnostic();
  console.log("Observatoire API tests passed");
}
main().catch((error) => { console.error(error); process.exit(1); });

