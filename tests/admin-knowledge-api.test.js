const assert = require("assert");
const knowledgeHandler = require("../lib/api/admin-knowledge");

const {
  normalizeSupabaseRestUrl,
  slugify,
  inferArticleType,
  inferConfidentiality,
  articleAssistant,
  lessonAssistant,
  articlePayload,
  sourcePayload,
  lessonPayload,
  questionPayload,
} = knowledgeHandler._private;

function createResponse() {
  return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } };
}
function createRequest({ method = "GET", url = "/api/admin-knowledge", token = "secret", body = null }) {
  return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } };
}
async function runHandler(options) {
  const res = createResponse();
  await knowledgeHandler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(slugify("FAQ pièces bien vacant"), "faq-pieces-bien-vacant");
  assert.strictEqual(inferArticleType({ title: "Question reponse pieces" }), "faq");
  assert.strictEqual(inferArticleType({ title: "Erreur a eviter visite" }), "erreur_a_eviter");
  assert.strictEqual(inferConfidentiality({ content: "RIB et donnees personnelles" }), "sensible");

  const payload = articlePayload({ title: "Pieces bien vacant", content: "Question reponse pour qualifier un bien vacant avec photos et autorisations." });
  assert.strictEqual(payload.article_type, "faq");
  assert.strictEqual(payload.status, "brouillon");
  assert.ok(payload.article_key.includes("pieces"));

  const assistant = articleAssistant({ status: "brouillon", content: "court", tags: [], knowledge_sources: [] });
  assert.ok(assistant.missing_fields.includes("contenu detaille"));
  assert.ok(assistant.missing_fields.includes("sources citees"));

  assert.strictEqual(lessonAssistant({ title: "X", lesson: "Y", status: "a_capitaliser", lesson_type: "erreur", impact_level: "fort" }).suggested_article_type, "erreur_a_eviter");
  assert.strictEqual(sourcePayload({ article_id: "a", source_label: "Doc" }).source_type, "document");
  assert.strictEqual(lessonPayload({ title: "Retour", lesson_type: "terrain", lesson: "A retenir" }).status, "a_capitaliser");
  assert.strictEqual(questionPayload("Q", "A", ["source"]).confidence, 0.78);

  assert.throws(() => articlePayload({ title: "X", status: "bad" }), /Statut d'article invalide/);
  assert.throws(() => lessonPayload({ title: "X", lesson_type: "bad" }), /Type de retour/);
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testListArticles() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/knowledge_articles?"));
    assert.ok(String(url).includes("article_type=eq.faq"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000701", article_key: "faq", title: "FAQ", article_type: "faq", status: "valide", content: "Contenu long suffisamment documente pour repondre aux equipes TVF.", tags: ["faq"], knowledge_sources: [{ source_label: "Doc" }] }]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-knowledge?article_type=faq" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.articles.length, 1);
    assert.strictEqual(result.json.articles[0].assistant.can_answer, true);
  } finally { global.fetch = originalFetch; }
}

async function testCreateArticleAndSource() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push(String(url));
    if (String(url).includes("/knowledge_articles?select=")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.title, "Article demo");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000702", ...payload, knowledge_sources: [] }]); } };
    }
    if (String(url).includes("/knowledge_sources?select=*")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.source_label, "Procedure source");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000703", ...payload }]); } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const article = await runHandler({ method: "POST", body: { type: "article", title: "Article demo", content: "Contenu demo assez long pour etre exploitable par TVF OS." } });
    assert.strictEqual(article.statusCode, 201);
    const source = await runHandler({ method: "POST", body: { type: "source", article_id: "00000000-0000-0000-0000-000000000702", source_label: "Procedure source" } });
    assert.strictEqual(source.statusCode, 201);
    assert.strictEqual(calls.length, 2);
  } finally { global.fetch = originalFetch; }
}

async function testAskKnowledge() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    if (String(url).includes("/knowledge_articles?status=eq.valide")) {
      return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "1", article_key: "pieces-bien", title: "Pieces bien vacant", summary: "Demander photos et autorisation.", content: "Pour un bien vacant demander photos adresse autorisation.", tags: ["bien", "photos"], knowledge_sources: [] }]); } };
    }
    if (String(url).includes("/knowledge_questions?select=*")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.ok(payload.sources.includes("pieces-bien"));
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "q1", ...payload }]); } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "question", question: "Quelles photos demander pour bien vacant ?" } });
    assert.strictEqual(result.statusCode, 201);
    assert.ok(result.json.response.answer.includes("Sources"));
  } finally { global.fetch = originalFetch; }
}

async function testDashboard() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/knowledge_articles?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "1", status: "valide", article_type: "faq" }, { id: "2", status: "a_valider", article_type: "article", confidentiality_level: "sensible" }]); } };
    if (u.includes("/lessons_learned?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "3", status: "a_capitaliser", impact_level: "fort" }]); } };
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ url: "/api/admin-knowledge?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.articles_total, 2);
    assert.strictEqual(result.json.dashboard.a_valider, 1);
    assert.strictEqual(result.json.dashboard.lessons_to_capitalize, 1);
  } finally { global.fetch = originalFetch; }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListArticles();
  await testCreateArticleAndSource();
  await testAskKnowledge();
  await testDashboard();
  console.log("Knowledge API tests passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
