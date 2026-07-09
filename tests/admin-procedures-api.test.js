const assert = require("assert");
const proceduresHandler = require("../lib/api/admin-procedures");

const {
  normalizeSupabaseRestUrl,
  slugify,
  inferScope,
  inferMandatoryLevel,
  procedureAssistant,
  applicationAssistant,
  procedurePayload,
  stepPayload,
  applicationPayload,
  stepInstancePayload,
} = proceduresHandler._private;

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}

function createRequest({ method = "GET", url = "/api/admin-procedures", token = "secret", body = null }) {
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
  await proceduresHandler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(slugify("Procédure Bien Vacant !"), "procedure-bien-vacant");
  assert.strictEqual(inferScope({ title: "Procedure locale antenne" }), "local");
  assert.strictEqual(inferMandatoryLevel({ summary: "Validation obligatoire RGPD" }), "obligatoire");

  const payload = procedurePayload({ title: "Qualification bien vacant", summary: "Validation obligatoire" });
  assert.strictEqual(payload.scope, "national");
  assert.strictEqual(payload.mandatory_level, "obligatoire");
  assert.ok(payload.procedure_key.includes("qualification"));

  const assistant = procedureAssistant({ status: "brouillon", procedure_steps: [], procedure_applications: [] });
  assert.ok(assistant.missing_fields.includes("responsable"));
  assert.ok(assistant.missing_fields.includes("etapes"));

  const appAssistant = applicationAssistant({ procedure_step_instances: [{ title: "Etape 1", required: true, status: "termine" }, { title: "Etape 2", required: true, status: "a_faire" }] });
  assert.strictEqual(appAssistant.completion_rate, 50);
  assert.strictEqual(appAssistant.next_step, "Etape 2");

  assert.strictEqual(stepPayload({ procedure_id: "00000000-0000-0000-0000-000000000601", title: "Verifier" }).required, true);
  assert.strictEqual(applicationPayload({ procedure_id: "x" }).related_object_type, "case");
  assert.ok(stepInstancePayload({ status: "termine" }).completed_at);

  assert.throws(() => procedurePayload({ title: "X", status: "bad" }), /Statut de procedure invalide/);
  assert.throws(() => stepPayload({ procedure_id: "x", title: "X", step_type: "bad" }), /Type d'etape invalide/);
  assert.throws(() => stepInstancePayload({ status: "bad" }), /Statut d'etape invalide/);
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testListProcedures() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/procedures?"));
    assert.ok(String(url).includes("mandatory_level=eq.obligatoire"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000601", procedure_key: "test", title: "Procedure", status: "active", scope: "national", mandatory_level: "obligatoire", procedure_steps: [{ title: "A", required: true }], procedure_applications: [] }]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-procedures?mandatory_level=obligatoire" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.procedures.length, 1);
    assert.strictEqual(result.json.procedures[0].assistant.required_steps, 1);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateProcedureAndStep() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push(String(url));
    if (String(url).includes("/procedures?select=")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.title, "Procedure demo");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000602", ...payload, procedure_steps: [], procedure_applications: [], procedure_versions: [] }]); } };
    }
    if (String(url).includes("/procedure_steps?select=*")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.title, "Verifier pieces");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000603", ...payload }]); } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const proc = await runHandler({ method: "POST", body: { type: "procedure", title: "Procedure demo" } });
    assert.strictEqual(proc.statusCode, 201);
    const step = await runHandler({ method: "POST", body: { type: "step", procedure_id: "00000000-0000-0000-0000-000000000602", title: "Verifier pieces" } });
    assert.strictEqual(step.statusCode, 201);
    assert.strictEqual(calls.length, 2);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testApplyProcedure() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).includes("/procedure_applications?select="));
    assert.strictEqual(options.method, "POST");
    const payload = JSON.parse(options.body);
    assert.strictEqual(payload.related_object_type, "case");
    return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000604", ...payload, procedure_step_instances: [{ title: "Verifier", required: true, status: "a_faire" }] }]); } };
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "application", procedure_id: "00000000-0000-0000-0000-000000000602", related_object_type: "case" } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.application.assistant.next_step, "Verifier");
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
    const textUrl = String(url);
    if (textUrl.includes("/procedures?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([
      { id: "1", status: "active", mandatory_level: "obligatoire" },
      { id: "2", status: "en_revision", mandatory_level: "recommande" }
    ]); } };
    if (textUrl.includes("/procedure_applications?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([
      { id: "3", status: "active", completion_rate: 50 },
      { id: "4", status: "bloquee", completion_rate: 20 }
    ]); } };
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ url: "/api/admin-procedures?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.procedures_total, 2);
    assert.strictEqual(result.json.dashboard.obligatoires, 1);
    assert.strictEqual(result.json.dashboard.applications_blocked, 1);
    assert.strictEqual(result.json.dashboard.average_completion, 35);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListProcedures();
  await testCreateProcedureAndStep();
  await testApplyProcedure();
  await testDashboard();
  console.log("Procedures API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
