const assert = require("assert");
const handler = require("../lib/api/admin-branches");
const { normalizeSupabaseRestUrl, branchPayload, checklistPayload, branchAssistant } = handler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-branches", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(branchPayload({ name: "TVF Test", territory_name: "Loire" }).code, "TVF-TVF-TEST");
  assert.throws(() => branchPayload({ name: "X", status: "bad" }), /Statut antenne/);
  assert.strictEqual(checklistPayload({ branch_id: "00000000-0000-0000-0000-000000000001", item_key: "x", label: "X", status: "done" }).status, "done");
  const assistant = branchAssistant({ name: "TVF Test", status: "launching" }, [{ status: "done" }, { status: "blocked", priority_level: "critique", label: "Kit" }], [{ status: "active" }], [{ status: "done" }], [{ status: "active" }]);
  assert.ok(assistant.readiness_score > 0);
  assert.ok(assistant.blockers.includes("Kit"));
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
}

async function testDashboardAndList() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/branches?") && u.includes("limit=500")) return mockResponse([{ id: "b1", name: "TVF Saint-Etienne", status: "launching", maturity_level: "lancement", national_validation_status: "validated" }]);
    if (u.includes("/branches?")) return mockResponse([{ id: "b1", name: "TVF Saint-Etienne", status: "launching", maturity_level: "lancement", national_validation_status: "validated" }]);
    if (u.includes("/branch_launch_checklist_items?")) return mockResponse([{ id: "c1", branch_id: "b1", label: "Kit", status: "blocked", priority_level: "critique" }, { id: "c2", branch_id: "b1", label: "Responsable", status: "done" }]);
    if (u.includes("/branch_team_members?")) return mockResponse([{ id: "t1", branch_id: "b1", status: "active", full_name: "Camille" }]);
    if (u.includes("/branch_training_items?")) return mockResponse([{ id: "tr1", branch_id: "b1", status: "done", title: "TVF OS" }]);
    if (u.includes("/branch_poles?")) return mockResponse([{ id: "p1", branch_id: "b1", status: "active", pole_key: "habitat_vivant" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-branches?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.total, 1);
    assert.strictEqual(dashboard.json.dashboard.blocked_items, 1);
    const list = await runHandler({ url: "/api/admin-branches?entity=branches" });
    assert.strictEqual(list.json.branches[0].assistant.blockers[0], "Kit");
  } finally { global.fetch = originalFetch; }
}

async function testCreateAndPack() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/branches?select=*") && options.method === "POST") return mockResponse([{ id: "00000000-0000-0000-0000-000000000001", ...JSON.parse(options.body) }], 201);
    if (u.includes("/branch_launch_checklist_items?select=*") && options.method === "POST") return mockResponse([{ id: "c1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/branch_training_items?select=*") && options.method === "POST") return mockResponse([{ id: "tr1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/branches?") && u.includes("id=eq.00000000")) return mockResponse([{ id: "00000000-0000-0000-0000-000000000001", name: "TVF Test", status: "launching" }]);
    if (u.includes("/branch_launch_checklist_items?")) return mockResponse([{ id: "c1", branch_id: "00000000-0000-0000-0000-000000000001", label: "Responsable", status: "done" }]);
    if (u.includes("/branch_team_members?")) return mockResponse([{ id: "t1", branch_id: "00000000-0000-0000-0000-000000000001", status: "active" }]);
    if (u.includes("/branch_training_items?")) return mockResponse([{ id: "tr1", branch_id: "00000000-0000-0000-0000-000000000001", status: "done" }]);
    if (u.includes("/branch_poles?")) return mockResponse([{ id: "p1", branch_id: "00000000-0000-0000-0000-000000000001", status: "active" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "branch", name: "TVF Test", territory_name: "Loire", status: "launching" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.branch.name, "TVF Test");
    const pack = await runHandler({ method: "POST", body: { type: "generate_pack", branch_id: "00000000-0000-0000-0000-000000000001" } });
    assert.strictEqual(pack.statusCode, 200);
    assert.ok(pack.json.launch_pack.pack.documents.includes("Fiche antenne"));
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testDashboardAndList();
  await testCreateAndPack();
  console.log("Branches API tests passed");
}
main().catch((error) => { console.error(error); process.exit(1); });
