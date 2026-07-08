const assert = require("assert");
const handler = require("../api/admin-work");
const { normalizeSupabaseRestUrl, inferPriority, taskAssistant, projectPayload, taskPayload, eventPayload } = handler._private;
function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-work", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }
function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferPriority("urgent mairie demain"), "P1");
  assert.strictEqual(projectPayload({ title: "Projet test" }).status, "active");
  assert.strictEqual(taskPayload({ title: "Relance finance" }).priority, "P2");
  assert.strictEqual(eventPayload({ title: "RDV" }).status, "scheduled");
  const assistant = taskAssistant({ status: "todo", priority: "P1", due_at: new Date(Date.now() - 86400000).toISOString() });
  assert.strictEqual(assistant.overdue, true);
  assert.throws(() => taskPayload({ title: "Bad", status: "nope" }), /Statut tache/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndCreate() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/work_projects?") && !options.method) return mockResponse([{ id: "p1", status: "active" }]);
    if (u.includes("/work_tasks?") && !options.method) return mockResponse([{ id: "t1", status: "todo", priority: "P1", due_at: new Date(Date.now() - 86400000).toISOString() }]);
    if (u.includes("/work_events?") && !options.method) return mockResponse([{ id: "e1", status: "scheduled", starts_at: new Date().toISOString() }]);
    if (u.includes("/work_automation_rules?") && !options.method) return mockResponse([{ id: "r1", status: "active" }]);
    if (u.includes("/work_tasks?select=*") && options.method === "POST") return mockResponse([{ id: "t2", ...JSON.parse(options.body) }], 201);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-work?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.overdue_tasks, 1);
    const created = await runHandler({ method: "POST", body: { type: "task", title: "Relancer mairie", description: "urgent" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.task.priority, "P1");
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndCreate(); console.log("Work API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
