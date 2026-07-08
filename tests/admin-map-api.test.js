const assert = require("assert");
const mapHandler = require("../api/admin-map");
const { normalizeSupabaseRestUrl, inferPointType, maskCoordinates, distanceMeters, priorityScore, assistantForPoint, pointPayload, geocodeCheckPayload, alertPayload } = mapHandler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-map", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await mapHandler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferPointType({ label: "Lot de materiaux" }), "materiau");
  assert.strictEqual(maskCoordinates(45.123456, 4.987654, "quartier").latitude, 45.123);
  assert.strictEqual(maskCoordinates(45.123456, 4.987654, "masque").latitude, null);
  assert.ok(distanceMeters({ latitude: 45.4397, longitude: 4.3872 }, { latitude: 45.4398, longitude: 4.3873 }) < 20);
  assert.ok(priorityScore({ point_type: "signalement", risk_level: "critique", visibility_level: "sensible" }) >= 80);
  const assistant = assistantForPoint({ label: "X", visibility_level: "sensible", precision_level: "exact", latitude: 45, longitude: 4 }, []);
  assert.ok(assistant.missing_fields.includes("adresse"));
  assert.strictEqual(assistant.suggested_precision, "quartier");
  const payload = pointPayload({ label: "Bien test", latitude: "45.4397", longitude: "4.3872", point_type: "bien" });
  assert.strictEqual(payload.point_type, "bien");
  assert.ok(payload.priority_score > 0);
  assert.strictEqual(geocodeCheckPayload({ point_id: "00000000-0000-0000-0000-000000000001", input_address: "Rue test" }).status, "propose");
  assert.strictEqual(alertPayload({ alert_type: "doublon", message: "Doublon" }).alert_type, "doublon");
  assert.throws(() => pointPayload({ label: "X", point_type: "bad" }), /Type de point/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testListAndDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/map_points?") && u.includes("select=id")) return mockResponse([{ id: "p1", point_type: "bien", status: "actif", visibility_level: "interne", risk_level: "modere", priority_score: 64, latitude: 45.43, longitude: 4.38 }]);
    if (u.includes("/map_points?")) return mockResponse([{ id: "p1", label: "Bien", point_type: "bien", status: "actif", visibility_level: "interne", precision_level: "quartier", risk_level: "modere", priority_score: 64, latitude: 45.43, longitude: 4.38 }]);
    if (u.includes("/map_spatial_alerts?")) return mockResponse([{ id: "a1", status: "ouverte", severity: "haute", alert_type: "priorite_territoriale" }]);
    if (u.includes("/map_layers?")) return mockResponse([{ layer_key: "biens", label: "Biens", point_type: "bien", enabled: true }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const list = await runHandler({ url: "/api/admin-map?point_type=bien" });
    assert.strictEqual(list.statusCode, 200);
    assert.strictEqual(list.json.points.length, 1);
    const dashboard = await runHandler({ url: "/api/admin-map?entity=dashboard" });
    assert.strictEqual(dashboard.json.dashboard.points_total, 1);
    assert.strictEqual(dashboard.json.dashboard.open_alerts, 1);
  } finally { global.fetch = originalFetch; }
}
async function testCreatePointAndAlert() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/map_points?select=*")) { assert.strictEqual(options.method, "POST"); const payload = JSON.parse(options.body); assert.strictEqual(payload.label, "Point sensible"); return mockResponse([{ id: "00000000-0000-0000-0000-000000000101", ...payload }], 201); }
    if (u.includes("/map_spatial_alerts?select=*")) { assert.strictEqual(options.method, "POST"); return mockResponse([{ id: "a1", status: "ouverte" }], 201); }
    throw new Error("Unexpected URL " + u);
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "point", label: "Point sensible", point_type: "bien", visibility_level: "sensible", precision_level: "exact", latitude: 45.439712, longitude: 4.387245 } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.point.precision_level, "exact");
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testListAndDashboard(); await testCreatePointAndAlert(); console.log("Cartographie API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
