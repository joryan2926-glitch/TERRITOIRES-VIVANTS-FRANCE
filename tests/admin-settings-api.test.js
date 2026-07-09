const assert = require("assert");
const handler = require("../lib/api/admin-settings");
const { normalizeSupabaseRestUrl, settingsAssistant, settingPayload, integrationPayload, featurePayload, automationPayload, healthPayload } = handler._private;
function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-settings", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }
function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(settingPayload({ setting_key: "platform_name", label: "Plateforme" }).status, "active");
  assert.deepStrictEqual(settingPayload({ setting_key: "json", label: "JSON", setting_value: "{\"value\":true}" }).setting_value, { value: true });
  assert.strictEqual(integrationPayload({ provider_key: "brevo", provider_name: "Brevo", status: "configured" }).status, "configured");
  assert.strictEqual(featurePayload({ module_key: "dashboard", module_name: "Dashboard", flag_key: "ready", is_enabled: "false" }).is_enabled, false);
  assert.strictEqual(automationPayload({ rule_key: "email_to_task", title: "E-mail vers tache" }).priority, "P2");
  assert.strictEqual(healthPayload({ check_key: "admin_token", check_name: "Token" }).status, "unknown");
  const assistant = settingsAssistant({ integrations: [{ status: "configured", health_status: "healthy" }], health: [{ status: "healthy" }], env: [{ key: "TVF_ADMIN_TOKEN", present: false }] });
  assert.strictEqual(assistant.missing_env[0], "TVF_ADMIN_TOKEN");
  assert.throws(() => settingPayload({ setting_key: "bad", label: "Bad", status: "nope" }), /Statut parametre/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndLists() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/system_settings?")) return mockResponse([{ id: "s1", setting_key: "platform_name", label: "TVF OS", status: "active" }]);
    if (u.includes("/integration_configs?")) return mockResponse([{ id: "i1", provider_key: "supabase", provider_name: "Supabase", status: "configured", health_status: "healthy" }]);
    if (u.includes("/module_feature_flags?")) return mockResponse([{ id: "f1", module_key: "dashboard", module_name: "Dashboard", flag_key: "ready", status: "active", is_enabled: true }]);
    if (u.includes("/automation_settings?")) return mockResponse([{ id: "a1", rule_key: "email_to_task", title: "E-mail", status: "active", priority: "P1" }]);
    if (u.includes("/system_health_checks?")) return mockResponse([{ id: "h1", check_key: "rls", check_name: "RLS", status: "healthy", severity: "critical" }]);
    if (u.includes("/settings_audit_log?")) return mockResponse([{ id: "l1", object_type: "settings", action: "verify", summary: "OK" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-settings?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.configured_integrations, 1);
    const integrations = await runHandler({ url: "/api/admin-settings?entity=integrations" });
    assert.strictEqual(integrations.json.integrations[0].provider_key, "supabase");
  } finally { global.fetch = originalFetch; }
}
async function testCreateSettingAndIntegration() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/system_settings?select=*") && options.method === "POST") return mockResponse([{ id: "s2", ...JSON.parse(options.body) }], 201);
    if (u.includes("/integration_configs?select=*") && options.method === "POST") return mockResponse([{ id: "i2", ...JSON.parse(options.body) }], 201);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const setting = await runHandler({ method: "POST", body: { type: "setting", setting_key: "demo", label: "Demo" } });
    assert.strictEqual(setting.statusCode, 201);
    assert.strictEqual(setting.json.setting.setting_key, "demo");
    const integration = await runHandler({ method: "POST", body: { type: "integration", provider_key: "brevo", provider_name: "Brevo", status: "configured" } });
    assert.strictEqual(integration.statusCode, 201);
    assert.strictEqual(integration.json.integration.status, "configured");
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndLists(); await testCreateSettingAndIntegration(); console.log("Settings API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });