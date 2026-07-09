const assert = require("assert");
const documentsHandler = require("../lib/api/admin-documents");

const {
  normalizeSupabaseUrl,
  normalizeSupabaseRestUrl,
  inferDocumentType,
  inferTemplateType,
  detectSensitive,
  documentAssistant,
  templateAssistant,
  documentPayload,
  templatePayload,
  decodeBase64File,
  safeFilename,
} = documentsHandler._private;

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}

function createRequest({ method = "GET", url = "/api/admin-documents", token = "secret", body = null }) {
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
  await documentsHandler(createRequest(options), res);
  return { statusCode: res.statusCode, headers: res.headers, json: res.body ? JSON.parse(res.body) : null, body: res.body };
}

function testRules() {
  assert.strictEqual(normalizeSupabaseUrl("https://demo.supabase.co/rest/v1"), "https://demo.supabase.co");
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(inferDocumentType({ title: "Convention partenariat" }), "convention");
  assert.strictEqual(inferDocumentType({ original_filename: "photo-bien.png" }), "photo");
  assert.strictEqual(inferTemplateType({ title: "Kit lancement antenne" }), "kit_antenne");
  assert.strictEqual(detectSensitive({ title: "RIB et piece identite" }), true);
  assert.strictEqual(safeFilename("Pièce identité TVF.pdf"), "Piece-identite-TVF.pdf");

  const payload = documentPayload({ title: "RIB proprietaire", document_type: "preuve" });
  assert.strictEqual(payload.confidentiality_level, "sensible");
  assert.strictEqual(payload.sensitive_detected, true);

  const assistant = documentAssistant({ title: "Document", status: "a_classer", document_type: "piece", related_object_type: "case", file_id: null });
  assert.ok(assistant.missing_fields.includes("objet rattache"));
  assert.ok(assistant.missing_fields.includes("fichier source"));

  const template = templatePayload({ title: "Demande pieces", template_type: "courrier", status: "officiel", required_fields: "nom,dossier" });
  assert.strictEqual(template.national_validated, false);
  assert.deepStrictEqual(template.required_fields, ["nom", "dossier"]);
  assert.strictEqual(templateAssistant({ status: "officiel", national_validated: true, required_fields: ["nom"] }).generation_ready, true);

  const decoded = decodeBase64File({ file_base64: Buffer.from("demo").toString("base64") });
  assert.strictEqual(decoded.toString(), "demo");
  assert.throws(() => documentPayload({ title: "X", status: "bad" }), /Statut de document invalide/);
  assert.throws(() => templatePayload({ title: "X", template_type: "bad" }), /Type de modele invalide/);
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testListDocuments() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/documents?"));
    assert.ok(String(url).includes("status=eq.a_valider"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return { ok: true, status: 200, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000501", document_number: "DOC-2026-0001", title: "Piece", document_type: "piece", status: "a_valider", confidentiality_level: "interne", related_object_type: "none" }]); } };
  };
  try {
    const result = await runHandler({ url: "/api/admin-documents?status=a_valider" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.documents.length, 1);
    assert.strictEqual(result.json.documents[0].assistant.suggested_status, "a_classer");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateDocumentWithFile() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    if (String(url).includes("/storage/v1/object/tvf-documents/")) {
      assert.strictEqual(options.method, "POST");
      assert.strictEqual(options.headers.Authorization, "Bearer sb_secret_demo");
      return { ok: true, status: 200, async text() { return "{}"; } };
    }
    if (String(url).includes("/files?select=*")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.original_filename, "piece-test.txt");
      assert.strictEqual(payload.size_bytes, 4);
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000502", ...payload }]); } };
    }
    if (String(url).includes("/documents?select=")) {
      assert.strictEqual(options.method, "POST");
      const payload = JSON.parse(options.body);
      assert.strictEqual(payload.file_id, "00000000-0000-0000-0000-000000000502");
      return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000503", document_number: "DOC-2026-0002", ...payload, files: { id: payload.file_id, original_filename: "piece-test.txt" } }]); } };
    }
    if (String(url).endsWith("/document_audit_logs")) {
      return { ok: true, status: 201, async text() { return ""; } };
    }
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "document", title: "Piece test", file_name: "piece-test.txt", mime_type: "text/plain", file_base64: Buffer.from("demo").toString("base64") } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.document.files.original_filename, "piece-test.txt");
    assert.strictEqual(calls.length, 4);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testCreateTemplate() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).includes("/templates?select="));
    assert.strictEqual(options.method, "POST");
    const payload = JSON.parse(options.body);
    assert.strictEqual(payload.template_type, "courrier");
    assert.deepStrictEqual(payload.required_fields, ["nom", "dossier"]);
    return { ok: true, status: 201, async text() { return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000504", ...payload }]); } };
  };
  try {
    const result = await runHandler({ method: "POST", body: { type: "template", title: "Demande pieces", template_type: "courrier", required_fields: "nom,dossier" } });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.template.template_type, "courrier");
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
    if (textUrl.includes("/documents?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([
      { id: "1", status: "a_classer", confidentiality_level: "interne" },
      { id: "2", status: "a_valider", confidentiality_level: "sensible", sensitive_detected: true },
      { id: "3", status: "valide", confidentiality_level: "interne", expires_at: "2026-01-01T00:00:00.000Z" }
    ]); } };
    if (textUrl.includes("/templates?select=")) return { ok: true, status: 200, async text() { return JSON.stringify([
      { id: "4", status: "officiel", national_validated: true },
      { id: "5", status: "brouillon", national_validated: false }
    ]); } };
    throw new Error("Unexpected URL " + url);
  };
  try {
    const result = await runHandler({ url: "/api/admin-documents?entity=dashboard" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.dashboard.documents_total, 3);
    assert.strictEqual(result.json.dashboard.a_classer, 1);
    assert.strictEqual(result.json.dashboard.sensibles, 1);
    assert.strictEqual(result.json.dashboard.templates_officiels, 1);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  testRules();
  await testUnauthorized();
  await testListDocuments();
  await testCreateDocumentWithFile();
  await testCreateTemplate();
  await testDashboard();
  console.log("Documents API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
