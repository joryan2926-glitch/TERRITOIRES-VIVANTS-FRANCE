const assert = require("assert");
const handler = require("../api/admin-governance");
const { normalizeSupabaseRestUrl, decisionPayload, committeePayload, actionPayload, decisionAssistant, committeeAssistant } = handler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-governance", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(decisionPayload({ title: "Valider antenne", decision_type: "branch" }).decision_type, "branch");
  assert.strictEqual(committeePayload({ title: "Comite" }).minutes_status, "not_started");
  assert.strictEqual(actionPayload({ action_title: "Faire", status: "done" }).status, "done");
  assert.throws(() => decisionPayload({ title: "X", status: "bad" }), /Statut decision/);
  const assistant = decisionAssistant({ title: "Decision", status: "to_validate" }, [{ vote_value: "approve" }, { vote_value: "approve" }], [{ status: "todo" }]);
  assert.strictEqual(assistant.ready_to_validate, true);
  assert.ok(committeeAssistant({ title: "Comite", minutes_status: "draft" }, [{ status: "ready", item_type: "decision" }], []).agenda_readiness > 0);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndList() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/decisions?") && u.includes("limit=700")) return mockResponse([{ id: "d1", title: "Valider", decision_number: "DEC-1", status: "to_validate" }]);
    if (u.includes("/decisions?")) return mockResponse([{ id: "d1", title: "Valider", decision_number: "DEC-1", status: "to_validate" }]);
    if (u.includes("/committees?")) return mockResponse([{ id: "c1", title: "Comite", status: "scheduled", minutes_status: "draft" }]);
    if (u.includes("/committee_items?")) return mockResponse([{ id: "i1", committee_id: "c1", status: "ready", item_type: "decision", title: "Point" }]);
    if (u.includes("/decision_votes?")) return mockResponse([{ id: "v1", decision_id: "d1", vote_value: "approve" }]);
    if (u.includes("/delegations?")) return mockResponse([{ id: "g1", status: "active", delegated_to: "Camille", scope: "Local" }]);
    if (u.includes("/decision_actions?")) return mockResponse([{ id: "a1", decision_id: "d1", status: "todo", action_title: "Faire", due_at: "2099-01-01T00:00:00.000Z" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-governance?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.total_decisions, 1);
    const list = await runHandler({ url: "/api/admin-governance?entity=decisions" });
    assert.strictEqual(list.json.decisions[0].assistant.approvals, 1);
  } finally { global.fetch = originalFetch; }
}
async function testCreateAndMinutes() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/decisions?select=*") && options.method === "POST") return mockResponse([{ id: "d1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/committees?") && u.includes("id=eq.00000000")) return mockResponse([{ id: "00000000-0000-0000-0000-000000000001", title: "Comite", minutes_status: "draft", attendees: ["A", "B"] }]);
    if (u.includes("/committee_items?")) return mockResponse([{ id: "i1", title: "Point", item_type: "decision", status: "ready" }]);
    if (u.includes("/decisions?") && u.includes("committee_id=eq.00000000")) return mockResponse([{ id: "d1", decision_number: "DEC-1", title: "Decision", status: "to_validate" }]);
    if (u.includes("/decision_actions?")) return mockResponse([{ id: "a1", action_title: "Action", owner_name: "Camille" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "decision", title: "Nouvelle decision", decision_type: "operational" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.decision.title, "Nouvelle decision");
    const minutes = await runHandler({ method: "POST", body: { type: "generate_minutes", committee_id: "00000000-0000-0000-0000-000000000001" } });
    assert.strictEqual(minutes.statusCode, 200);
    assert.ok(minutes.json.minutes_pack.minutes.title.includes("PV"));
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndList(); await testCreateAndMinutes(); console.log("Governance API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
