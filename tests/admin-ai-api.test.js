const assert = require("assert");
const aiHandler = require("../api/admin-ai");

const {
  normalizeSupabaseRestUrl,
  inferPole,
  inferPriority,
  inferCategory,
  missingPiecesForCategory,
  buildAnswer,
  interactionPayload,
  suggestionPayload,
  emailAnalysisPayload,
} = aiHandler._private;

function createResponse() {
  return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } };
}
function createRequest({ method = "GET", url = "/api/admin-ai", token = "secret", body = null }) {
  return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } };
}
async function runHandler(options) {
  const res = createResponse();
  await aiHandler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}
function mockResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } };
}
function demoFetch({ assertPatch = false } = {}) {
  return async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/knowledge_articles?")) return mockResponse([{ id: "k1", article_key: "test-pieces-bien-vacant", title: "Pieces bien vacant", article_type: "faq", summary: "Demander adresse, photos et autorisation de visite.", content: "Pour un proprietaire de bien vacant, demander photos, adresse precise et autorisation.", tags: ["bien", "photos"], knowledge_sources: [] }]);
    if (u.includes("/procedures?")) return mockResponse([{ id: "p1", procedure_key: "national-qualification-bien", title: "Qualification bien vacant", module_key: "Dossiers", pole: "Habitat Vivant", summary: "Verifier pieces et autorisation avant visite.", ai_summary: "Procedure qualification bien vacant", tags: ["bien"] }]);
    if (u.includes("/documents?")) return mockResponse([{ id: "d1", document_number: "DOC-2026-0001", title: "Autorisation visite", document_type: "formulaire", status: "valide", ai_summary: "Modele autorisation de visite", classification_notes: "Bien vacant", confidentiality_level: "interne" }]);
    if (u.includes("/cases?")) return mockResponse([{ id: "c1", case_number: "DOS-2026-0001", title: "Bien vacant test", case_type: "bien_vacant", status: "qualification", priority: "haute", main_pole: "Habitat Vivant", summary: "Dossier test", next_action: "Demander photos", ai_summary: "Bien vacant a qualifier", risk_level: "modere", decision_status: "non_preparee" }]);
    if (u.includes("/ai_interactions?select=*")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.ok(payload.sources.includes("knowledge:test-pieces-bien-vacant"));
      return mockResponse([{ id: "00000000-0000-0000-0000-000000000901", ...payload }], 201);
    }
    if (u.includes("/ai_suggestions?select=*")) {
      const payload = JSON.parse(options.body || "{}");
      if (options.method === "POST") return mockResponse([{ id: "00000000-0000-0000-0000-000000000902", ...payload }], 201);
      if (options.method === "PATCH") {
        if (assertPatch) assert.strictEqual(payload.status, "accepted");
        return mockResponse([{ id: "00000000-0000-0000-0000-000000000902", title: "Suggestion", status: payload.status, reviewed_by: payload.reviewed_by }]);
      }
    }
    if (u.includes("/ai_interactions?") && !u.includes("select=*")) return mockResponse([{ id: "i1", status: "completed", interaction_type: "question", confidence: 0.82 }]);
    if (u.includes("/ai_suggestions?") && !u.includes("select=*")) return mockResponse([{ id: "s1", status: "proposed", suggestion_type: "email_triage", confidence: 0.78 }]);
    if (u.includes("/ai_feedback?select=id")) return mockResponse([]);
    if (u.includes("/ai_automation_rules?")) return mockResponse([{ id: "r1", rule_key: "email-triage", rule_name: "Tri e-mail", enabled: true }]);
    if (u.includes("/ai_automation_runs?")) return mockResponse([]);
    if (u.includes("/ai_feedback?select=*")) return mockResponse([{ id: "f1", feedback_type: "useful" }], 201);
    throw new Error("Unexpected URL " + u);
  };
}

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferPole("don de materiaux et stockage"), "Materiautheque Solidaire");
  assert.strictEqual(inferPriority("danger urgent demain"), "P1");
  assert.strictEqual(inferCategory("mairie et territoire"), "collectivite");
  assert.ok(missingPiecesForCategory("bien_vacant").includes("photos"));

  const answer = buildAnswer("bien vacant photos", { knowledge: [{ article_key: "pieces", title: "Pieces", summary: "photos bien vacant" }], procedures: [], documents: [], cases: [] });
  assert.ok(answer.sources.includes("knowledge:pieces"));
  assert.strictEqual(answer.suggested_pole, "Habitat Vivant");

  const interaction = interactionPayload({ prompt: "Question", context_object_type: "case" }, answer);
  assert.strictEqual(interaction.interaction_type, "question");
  assert.strictEqual(interaction.context_object_type, "case");

  const suggestion = suggestionPayload({ title: "Test", suggestion_type: "next_action" }, answer);
  assert.strictEqual(suggestion.status, "proposed");
  assert.strictEqual(suggestion.proposed_value.pole, "Habitat Vivant");

  const email = emailAnalysisPayload({ message: "Bonjour, je suis proprietaire d'un bien vacant" }, answer);
  assert.strictEqual(email.suggestion_type, "email_triage");
  assert.ok(email.proposed_value.draft_response.includes("Habitat Vivant"));

  assert.throws(() => interactionPayload({ prompt: "x", context_object_type: "bad" }, answer), /Type de contexte/);
  assert.throws(() => suggestionPayload({ title: "x", suggestion_type: "bad" }, answer), /Type de suggestion/);
}
async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}
async function testAsk() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = demoFetch();
  try {
    const result = await runHandler({ method: "POST", body: { type: "ask", prompt: "Quelles photos demander pour un bien vacant ?" } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.interaction.id, "00000000-0000-0000-0000-000000000901");
    assert.ok(result.json.response.sources.length >= 1);
  } finally { global.fetch = originalFetch; }
}
async function testEmailAnalysis() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = demoFetch();
  try {
    const result = await runHandler({ method: "POST", body: { type: "email_analysis", subject: "Bien vacant", message: "Bonjour, je possede un bien vacant avec visite possible." } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.suggestion.suggestion_type, "email_triage");
    assert.ok(result.json.suggestion.proposed_value.missing_information.includes("photos"));
  } finally { global.fetch = originalFetch; }
}
async function testReviewSuggestion() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = demoFetch({ assertPatch: true });
  try {
    const result = await runHandler({ method: "PATCH", body: { type: "suggestion", id: "00000000-0000-0000-0000-000000000902", status: "accepted", reviewed_by: "Test" } });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.suggestion.status, "accepted");
  } finally { global.fetch = originalFetch; }
}
async function testDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = demoFetch();
  try {
    const result = await runHandler({ url: "/api/admin-ai?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.suggestions_pending, 1);
    assert.strictEqual(result.json.dashboard.sources.knowledge, 1);
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testAsk();
  await testEmailAnalysis();
  await testReviewSuggestion();
  await testDashboard();
  console.log("Assistant IA API tests passed");
}
main().catch((error) => { console.error(error); process.exit(1); });
