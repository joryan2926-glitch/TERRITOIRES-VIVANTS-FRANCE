const assert = require("assert");
const financesHandler = require("../api/admin-finances");
const { normalizeSupabaseRestUrl, opportunityScore, budgetHealth, assistantForBudget, assistantForExpense, assistantForReport, funderPayload, opportunityPayload, applicationPayload, budgetPayload, linePayload, expensePayload, paymentPayload, reportPayload } = financesHandler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-finances", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await financesHandler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.ok(opportunityScore({ status: "eligible", amount_max: 60000, deadline_at: new Date(Date.now() + 6 * 86400000).toISOString() }) >= 80);
  const health = budgetHealth({ planned_income: 8000, planned_expenses: 10000 }, [], [{ amount: 12000, status: "paid" }]);
  assert.ok(health.alerts.includes("budget_depasse"));
  assert.strictEqual(assistantForBudget({ budget_name: "Budget", planned_expenses: 1000 }, [], [{ amount: 200, status: "paid" }]).execution_ratio, 20);
  assert.ok(assistantForExpense({ label: "Achat", amount: 100, status: "to_approve" }).missing_fields.includes("justificatif"));
  assert.strictEqual(assistantForReport({ required_documents: ["Budget"], missing_documents: ["Justificatif"] }, []).suggested_status, "draft");
  assert.strictEqual(funderPayload({ funder_name: "Fondation", funder_type: "foundation" }).funder_type, "foundation");
  assert.strictEqual(opportunityPayload({ title: "AAP", opportunity_type: "call_for_projects", amount_max: "15000" }).opportunity_type, "call_for_projects");
  assert.strictEqual(applicationPayload({ application_title: "Demande", requested_amount: "12000" }).requested_amount, 12000);
  assert.strictEqual(budgetPayload({ budget_name: "Budget", planned_expenses: "9000" }).planned_expenses, 9000);
  assert.strictEqual(linePayload({ budget_id: "00000000-0000-0000-0000-000000000001", label: "Ligne", line_type: "income" }).line_type, "income");
  assert.strictEqual(expensePayload({ label: "Depense", amount: "42.555" }).amount, 42.56);
  assert.strictEqual(paymentPayload({ amount: "100", payment_status: "succeeded" }).payment_status, "succeeded");
  assert.deepStrictEqual(reportPayload({ report_title: "Reporting", required_documents: "Budget;Justificatifs" }).required_documents, ["Budget", "Justificatifs"]);
  assert.throws(() => funderPayload({ funder_name: "X", funder_type: "bad" }), /Type de financeur/);
}
async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
}
async function testDashboardAndBudgets() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/budgets?") && u.includes("select=id")) return mockResponse([{ id: "b1", status: "active", planned_income: 10000, planned_expenses: 8000, confirmed_income: 5000, committed_expenses: 1000, spent_amount: 0, risk_level: "modere" }]);
    if (u.includes("/expenses?") && u.includes("select=id")) return mockResponse([{ id: "e1", status: "to_approve", amount: 900, receipt_document_id: null }]);
    if (u.includes("/funding_applications?") && u.includes("select=id")) return mockResponse([{ id: "a1", status: "a_deposer", requested_amount: 12000, granted_amount: 0 }]);
    if (u.includes("/funding_opportunities?") && u.includes("select=id")) return mockResponse([{ id: "o1", status: "eligible", priority_score: 75 }]);
    if (u.includes("/finance_reports?") && u.includes("select=id")) return mockResponse([{ id: "r1", status: "draft", missing_documents: ["Justificatif"] }]);
    if (u.includes("/payment_records?") && u.includes("select=id")) return mockResponse([{ id: "p1", payment_status: "succeeded", amount: 1500 }]);
    if (u.includes("/budgets?")) return mockResponse([{ id: "b1", budget_name: "Budget", budget_type: "project", status: "active", planned_income: 10000, planned_expenses: 8000 }]);
    if (u.includes("/budget_lines?")) return mockResponse([{ id: "l1", budget_id: "b1", line_type: "expense", label: "Ligne", planned_amount: 3000 }]);
    if (u.includes("/expenses?")) return mockResponse([{ id: "e1", budget_id: "b1", status: "paid", amount: 900, label: "Depense" }]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-finances?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.missing_receipts, 1);
    const budgets = await runHandler({ url: "/api/admin-finances?entity=budgets" });
    assert.strictEqual(budgets.json.budgets[0].assistant.execution_ratio, 11);
  } finally { global.fetch = originalFetch; }
}
async function testCreateAndGenerateReport() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/budgets?select=*") && options.method === "POST") { const payload = JSON.parse(options.body); return mockResponse([{ id: "00000000-0000-0000-0000-000000000101", ...payload }], 201); }
    if (u.includes("/budget_lines?")) return mockResponse([]);
    if (u.includes("/expenses?") && u.includes("budget_id=eq.")) return mockResponse([{ id: "e1", budget_id: "00000000-0000-0000-0000-000000000101", label: "Depense", amount: 300, status: "paid", receipt_document_id: null }]);
    if (u.includes("/expenses?") && u.includes("related_project_id=eq.")) return mockResponse([{ id: "e2", related_project_id: "00000000-0000-0000-0000-000000000201", label: "Depense projet", amount: 200, status: "paid", receipt_document_id: null }]);
    if (u.includes("/budgets?") && u.includes("id=eq.")) return mockResponse([{ id: "00000000-0000-0000-0000-000000000101", budget_name: "Budget test", related_project_id: "00000000-0000-0000-0000-000000000201" }]);
    if (u.includes("/finance_reports?select=*") && options.method === "POST") { const payload = JSON.parse(options.body); return mockResponse([{ id: "r1", ...payload }], 201); }
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "budget", budget_name: "Budget test", planned_expenses: 1000 } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.budget.budget_name, "Budget test");
    const report = await runHandler({ method: "POST", body: { type: "generate_report", budget_id: "00000000-0000-0000-0000-000000000101" } });
    assert.strictEqual(report.statusCode, 201);
    assert.ok(report.json.report.missing_documents.includes("justificatifs"));
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testDashboardAndBudgets();
  await testCreateAndGenerateReport();
  console.log("Finances API tests passed");
}
main().catch((error) => { console.error(error); process.exit(1); });


