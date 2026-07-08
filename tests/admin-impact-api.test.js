const assert = require("assert");
const impactHandler = require("../api/admin-impact");
const { normalizeSupabaseRestUrl, reliabilityScore, assistantForMetric, assistantForReport, metricPayload, valuePayload, proofPayload, reportPayload, exportPayload } = impactHandler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-impact", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await impactHandler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.ok(reliabilityScore([{ status: "validated", proof_id: "p1" }], [{ status: "validated" }]) >= 60);
  const assistant = assistantForMetric({ metric_name: "Heures", description: "Test" }, [{ status: "validated", proof_id: "p1" }], [{ status: "validated" }]);
  assert.ok(assistant.reliability_score > 0);
  assert.strictEqual(assistantForReport({ report_title: "Bilan" }, [{ reliability_score: 80 }], []).suggested_status, "to_validate");
  assert.strictEqual(metricPayload({ metric_name: "Dossiers", metric_type: "case" }).metric_type, "case");
  assert.strictEqual(valuePayload({ metric_id: "00000000-0000-0000-0000-000000000001", value_numeric: "12.5", status: "validated" }).value_numeric, 12.5);
  assert.strictEqual(proofPayload({ proof_title: "Preuve", proof_type: "attendance" }).proof_type, "attendance");
  assert.deepStrictEqual(reportPayload({ report_title: "Bilan", metric_ids: "a;b" }).metric_ids, ["a", "b"]);
  assert.strictEqual(exportPayload({ export_title: "Export", export_format: "csv" }).export_format, "csv");
  assert.throws(() => metricPayload({ metric_name: "X", metric_type: "bad" }), /Type d'indicateur/);
}
async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
}
async function testDashboardAndMetrics() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/impact_metrics?") && u.includes("select=id")) return mockResponse([{ id: "m1", status: "active", metric_type: "impact", metric_scope: "national" }]);
    if (u.includes("/impact_values?") && u.includes("select=id")) return mockResponse([{ id: "v1", status: "validated", value_numeric: 12, metric_id: "m1", reliability_level: "verifie" }]);
    if (u.includes("/impact_proofs?") && u.includes("select=id")) return mockResponse([{ id: "p1", status: "validated", proof_type: "document" }]);
    if (u.includes("/impact_reports?") && u.includes("select=id")) return mockResponse([{ id: "r1", status: "to_validate", report_type: "national" }]);
    if (u.includes("/impact_metrics?")) return mockResponse([{ id: "m1", metric_name: "Heures", metric_type: "volunteer", metric_scope: "branch", status: "active", description: "Test" }]);
    if (u.includes("/impact_values?")) return mockResponse([{ id: "v1", metric_id: "m1", status: "validated", proof_id: "p1" }]);
    if (u.includes("/impact_proofs?")) return mockResponse([{ id: "p1", status: "validated" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-impact?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.publishable_ratio, 100);
    const metrics = await runHandler({ url: "/api/admin-impact?entity=metrics" });
    assert.strictEqual(metrics.json.metrics[0].assistant.validated_count, 1);
  } finally { global.fetch = originalFetch; }
}
async function testCreateAndGenerateReport() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/impact_metrics?select=*") && options.method === "POST") { const payload = JSON.parse(options.body); return mockResponse([{ id: "m1", ...payload }], 201); }
    if (u.includes("/impact_metrics?select=*") && u.includes("status=eq.active")) return mockResponse([{ id: "m1", metric_name: "Heures", status: "active", description: "Test" }]);
    if (u.includes("/impact_values?") && u.includes("metric_id=eq.m1")) return mockResponse([{ id: "v1", metric_id: "m1", status: "validated", proof_id: "p1" }]);
    if (u.includes("/impact_proofs?select=*") && u.includes("status=eq.validated")) return mockResponse([{ id: "p1", status: "validated" }]);
    if (u.includes("/impact_proofs?")) return mockResponse([{ id: "p1", status: "validated" }]);
    if (u.includes("/impact_reports?select=*") && options.method === "POST") { const payload = JSON.parse(options.body); return mockResponse([{ id: "r1", ...payload }], 201); }
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "metric", metric_name: "Heures test", metric_type: "volunteer" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.metric.metric_name, "Heures test");
    const report = await runHandler({ method: "POST", body: { type: "generate_report", report_title: "Bilan test" } });
    assert.strictEqual(report.statusCode, 201);
    assert.strictEqual(report.json.report.status, "to_validate");
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testDashboardAndMetrics();
  await testCreateAndGenerateReport();
  console.log("Impact API tests passed");
}
main().catch((error) => { console.error(error); process.exit(1); });
