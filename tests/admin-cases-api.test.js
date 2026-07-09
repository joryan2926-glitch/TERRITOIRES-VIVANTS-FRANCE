const assert = require("assert");
const casesHandler = require("../lib/api/admin-cases");

const {
  inferCaseType,
  poleFromCaseType,
  assistantForCase,
  casePayload,
  checklistPayload,
  riskPayload,
  decisionPayload,
} = casesHandler._private;

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}

function createRequest({ method = "GET", url = "/api/admin-cases", token = "secret", body = null }) {
  return {
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    async *[Symbol.asyncIterator]() {
      if (body) yield JSON.stringify(body);
    },
  };
}

async function runHandler(options) {
  const res = createResponse();
  await casesHandler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

function testRules() {
  assert.strictEqual(inferCaseType({ title: "Don de materiaux bois" }), "materiaux");
  assert.strictEqual(inferCaseType({ title: "Mairie cherche une solution friche" }), "collectivite");
  assert.strictEqual(poleFromCaseType("bien_vacant"), "Habitat vivant");
  assert.strictEqual(poleFromCaseType("financeur"), "Financement & mecenat");

  const payload = casePayload({ title: "Maison vacante", summary: "Proprietaire avec logement vacant", priority: "haute" });
  assert.strictEqual(payload.case_type, "bien_vacant");
  assert.strictEqual(payload.status, "ouvert");
  assert.strictEqual(payload.main_pole, "Habitat vivant");
  assert.ok(payload.next_action_due_at);

  const assistant = assistantForCase({
    case_type: "materiaux",
    status: "instruction",
    case_checklist_items: [
      { label: "Identite", required: true, status: "valide" },
      { label: "Photos", required: true, status: "manquant" },
      { label: "Decision", required: true, status: "a_verifier" },
    ],
  });
  assert.strictEqual(assistant.maturity_score, 33);
  assert.ok(assistant.missing_items.includes("Photos"));

  assert.throws(() => casePayload({ title: "X", status: "inconnu" }), /Statut de dossier invalide/);
  assert.throws(() => checklistPayload({ status: "bad" }), /Statut checklist invalide/);
  assert.throws(() => riskPayload({ risk_label: "X", risk_level: "bad" }), /Niveau de risque invalide/);
  assert.throws(() => decisionPayload({ proposed_decision: "X", decision_status: "bad" }), /Statut de decision invalide/);
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testListCases() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/cases?"));
    assert.ok(String(url).includes("status=eq.instruction"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000401", case_number: "DOS-2026-0001", title: "Test", case_type: "materiaux", status: "instruction", priority: "haute", maturity_score: 50, case_checklist_items: [] }]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-cases?status=instruction" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.cases.length, 1);
    assert.strictEqual(result.json.cases[0].assistant.suggested_status, "instruction");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateCase() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    if (String(url).includes("/cases?select=*") && options.method === "POST") {
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.title, "Bien vacant demo");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000402", ...payload }]); } };
    }
    if (String(url).endsWith("/case_status_history")) {
      return { ok: true, status: 201, async text() { return ""; } };
    }
    if (String(url).includes("/cases?id=eq.00000000-0000-0000-0000-000000000402")) {
      return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000402", case_number: "DOS-2026-0002", title: "Bien vacant demo", case_type: "bien_vacant", status: "ouvert", priority: "normale", maturity_score: 0, case_checklist_items: [{ label: "Identite", status: "a_verifier", required: true }] }]); } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "case", title: "Bien vacant demo", summary: "Logement vacant proprietaire" } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.case.case_type, "bien_vacant");
    assert.strictEqual(calls.length, 3);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testUpdateChecklist() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.includes("/case_status_history")) {
      assert.strictEqual(options.method, "POST");
      return { ok: true, status: 201, async text() { return JSON.stringify([]); } };
    }
    assert.ok(target.includes("/case_checklist_items?id=eq.00000000-0000-0000-0000-000000000403"));
    if (!options.method || options.method === "GET") {
      return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000403", case_id: "00000000-0000-0000-0000-000000000001", label: "Autorisation", status: "recu" }]); } };
    }
    assert.strictEqual(options.method, "PATCH");
    const payload = JSON.parse(options.body);
    assert.strictEqual(payload.status, "valide");
    assert.ok(payload.completed_at);
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000403", ...payload }]); } };
  };
  try {
    const result = await runHandler({ method: "PATCH", body: { type: "checklist", id: "00000000-0000-0000-0000-000000000403", status: "valide" } });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.item.status, "valide");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    assert.ok(String(url).includes("/cases?select=id,status,priority,maturity_score,next_action_due_at,archived_at"));
    return { ok: true, status: 200, async text() { return JSON.stringify([
      { id: "1", status: "instruction", priority: "urgente", maturity_score: 40, next_action_due_at: "2026-01-01T00:00:00.000Z" },
      { id: "2", status: "a_decision", priority: "haute", maturity_score: 90, next_action_due_at: "2027-01-01T00:00:00.000Z" },
      { id: "3", status: "cloture", priority: "normale", maturity_score: 100 }
    ]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-cases?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.total, 3);
    assert.strictEqual(result.json.dashboard.active, 2);
    assert.strictEqual(result.json.dashboard.a_decision, 1);
    assert.strictEqual(result.json.dashboard.average_maturity, 65);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListCases();
  await testCreateCase();
  await testUpdateChecklist();
  await testDashboard();
  console.log("Dossiers API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
