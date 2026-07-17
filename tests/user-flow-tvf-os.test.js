const assert = require("assert");
const { Readable } = require("stream");

const publicContactHandler = require("../api/contact");
const adminContactsHandler = require("../lib/api/admin-contacts");
const adminCrmHandler = require("../lib/api/admin-crm");
const adminCasesHandler = require("../lib/api/admin-cases");
const adminDocumentsHandler = require("../lib/api/admin-documents");
const adminEmailsHandler = require("../lib/api/admin-emails");
const { _store } = require("../lib/api/rate-limit");

const UUIDS = {
  contactRequest: "00000000-0000-0000-0000-000000001001",
  crmContact: "00000000-0000-0000-0000-000000001002",
  case: "00000000-0000-0000-0000-000000001003",
  file: "00000000-0000-0000-0000-000000001004",
  document: "00000000-0000-0000-0000-000000001005",
  email: "00000000-0000-0000-0000-000000001006",
  suggestion: "00000000-0000-0000-0000-000000001007",
  task: "00000000-0000-0000-0000-000000001008",
};

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value || ""; },
  };
}

function createRequest({ method = "GET", url = "/", body = null, admin = false, ip = "198.51.100.80" }) {
  const req = body ? Readable.from([JSON.stringify(body)]) : Readable.from([]);
  req.method = method;
  req.url = url;
  req.headers = {
    "content-type": "application/json",
    "user-agent": "TVF user-flow test",
    "x-forwarded-for": ip,
    ...(admin ? { authorization: "Bearer test-admin-token", "x-admin-user": "TVF OS Test" } : {}),
  };
  req.socket = { remoteAddress: ip };
  return req;
}

async function runHandler(handler, options) {
  const res = createResponse();
  await handler(createRequest(options), res);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    json: res.body ? JSON.parse(res.body) : null,
    body: res.body,
  };
}

function textResponse(payload = [], status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      if (payload === "") return "";
      return JSON.stringify(payload);
    },
  };
}

function newStore() {
  return {
    contacts: [],
    crm_contacts: [],
    cases: [],
    case_status_history: [],
    case_participants: [],
    files: [],
    documents: [],
    document_audit_logs: [],
    email_messages: [],
    email_ai_suggestions: [],
    email_tasks: [],
    email_workflow_events: [],
    brevoCalls: [],
    storageUploads: [],
  };
}

function parseUrl(value) {
  return new URL(String(value));
}

function tableFromPath(pathname) {
  return pathname.replace(/^\/rest\/v1\//, "").split("/")[0];
}

function applyFilters(rows, url) {
  let result = [...rows];
  for (const [key, value] of url.searchParams.entries()) {
    if (["select", "order", "limit", "or"].includes(key)) continue;
    const match = value.match(/^eq\.(.*)$/);
    if (match) result = result.filter((row) => String(row[key] || "") === match[1]);
  }
  const limit = Number(url.searchParams.get("limit") || 0);
  return limit ? result.slice(0, limit) : result;
}

function responseRows(table, rows) {
  if (table === "contacts") {
    return rows.map((row, index) => ({
      id: row.id || UUIDS.contactRequest,
      request_number: row.request_number || `TVF-2026-${String(index + 1).padStart(4, "0")}`,
      full_name: row.full_name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      consent: row.consent,
      source_page: row.source_page,
      status: row.status || "nouveau",
      priority: row.priority || "normale",
      category: row.category || "demande-generale",
      pole: row.pole || null,
      assigned_to: row.assigned_to || null,
      internal_notes: row.internal_notes || "",
      missing_pieces: row.missing_pieces || [],
      created_at: row.created_at || "2026-07-17T10:00:00.000Z",
      updated_at: row.updated_at || "2026-07-17T10:00:00.000Z",
    }));
  }
  return rows;
}

function installFetchMock(store) {
  return async function fetchMock(urlValue, options = {}) {
    const url = parseUrl(urlValue);
    const method = options.method || "GET";

    if (url.hostname === "api.brevo.com") {
      store.brevoCalls.push(JSON.parse(options.body || "{}"));
      return textResponse("", 201);
    }

    if (url.pathname.startsWith("/storage/v1/object/tvf-documents/")) {
      store.storageUploads.push({ path: url.pathname, method });
      return textResponse({}, 200);
    }

    if (!url.pathname.startsWith("/rest/v1/")) {
      throw new Error(`Unexpected URL: ${urlValue}`);
    }

    const table = tableFromPath(url.pathname);
    if (!store[table]) store[table] = [];

    if (method === "GET") {
      return textResponse(responseRows(table, applyFilters(store[table], url)), 200);
    }

    if (method === "POST") {
      const payload = JSON.parse(options.body || "{}");
      const id = {
        contacts: UUIDS.contactRequest,
        crm_contacts: UUIDS.crmContact,
        cases: UUIDS.case,
        files: UUIDS.file,
        documents: UUIDS.document,
        email_messages: UUIDS.email,
        email_ai_suggestions: UUIDS.suggestion,
        email_tasks: UUIDS.task,
      }[table] || `00000000-0000-0000-0000-${String(store[table].length + 9000).padStart(12, "0")}`;
      const row = {
        id,
        created_at: "2026-07-17T10:00:00.000Z",
        updated_at: "2026-07-17T10:00:00.000Z",
        ...payload,
      };
      if (table === "cases") row.case_number = "DOS-2026-0001";
      if (table === "documents") row.document_number = "DOC-2026-0001";
      if (table === "files") row.original_filename = payload.original_filename || "piece-test.txt";
      store[table].push(row);
      const prefer = String(options.headers?.Prefer || "");
      return textResponse(prefer.includes("return=minimal") ? "" : [row], 201);
    }

    if (method === "PATCH") {
      const payload = JSON.parse(options.body || "{}");
      const idEq = [...url.searchParams.entries()].find(([key]) => key === "id")?.[1]?.replace(/^eq\./, "");
      const index = store[table].findIndex((row) => row.id === idEq);
      if (index >= 0) store[table][index] = { ...store[table][index], ...payload, updated_at: "2026-07-17T10:10:00.000Z" };
      return textResponse(index >= 0 ? [store[table][index]] : [], 200);
    }

    throw new Error(`Unexpected method ${method} for ${urlValue}`);
  };
}

async function main() {
  process.env.NODE_ENV = "test";
  process.env.TVF_DISABLE_ADMIN_AUDIT = "1";
  process.env.TVF_ADMIN_TOKEN = "test-admin-token";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  process.env.SUPABASE_ANON_KEY = "sb_publishable_demo";
  process.env.EMAIL_PROVIDER = "brevo";
  process.env.BREVO_API_KEY = "brevo_test";
  process.env.TVF_NOTIFICATION_EMAIL = "contact@territoiresvivantsfrance.fr";
  process.env.TVF_EMAIL_FROM = "Territoires Vivants France <contact@territoiresvivantsfrance.fr>";
  process.env.TVF_CONTACT_RATE_LIMIT = "20";

  _store.clear();
  const store = newStore();
  const originalFetch = global.fetch;
  global.fetch = installFetchMock(store);

  try {
    const publicSubmission = await runHandler(publicContactHandler, {
      method: "POST",
      body: {
        formKind: "rendez-vous",
        page: "/contact.html",
        submittedAfterMs: 2600,
        fields: {
          profil: "collectivite",
          nom: "Ville test",
          email: "mairie@example.fr",
          telephone: "0400000000",
          territoire: "Saint-Etienne",
          objet: "Demande de rendez-vous TVF",
          message: "Nous souhaitons étudier un local vacant et structurer une coopération avec TVF.",
          consent: "true",
        },
      },
    });
    assert.strictEqual(publicSubmission.statusCode, 200);
    assert.strictEqual(store.contacts.length, 1, "le formulaire public doit creer une demande");
    assert.strictEqual(store.brevoCalls.length, 2, "notification interne et confirmation usager attendues");

    const demandes = await runHandler(adminContactsHandler, {
      method: "GET",
      url: "/api/admin-contacts?status=nouveau",
      admin: true,
    });
    assert.strictEqual(demandes.statusCode, 200);
    assert.strictEqual(demandes.json.contacts.length, 1);
    const demande = demandes.json.contacts[0];
    assert.strictEqual(demande.category, "collectivite-territoire");
    assert.strictEqual(demande.assistant.suggested_priority, "haute");

    const qualified = await runHandler(adminContactsHandler, {
      method: "PATCH",
      admin: true,
      body: {
        id: demande.id,
        status: "a_qualifier",
        assigned_to: "TVF - Accueil",
        internal_notes: "Qualification initiale realisee dans le test parcours utilisateur.",
      },
    });
    assert.strictEqual(qualified.statusCode, 200);
    assert.strictEqual(qualified.json.contact.status, "a_qualifier");

    const crm = await runHandler(adminCrmHandler, {
      method: "POST",
      admin: true,
      body: {
        type: "contact",
        display_name: "Ville test - Service projet",
        email: "mairie@example.fr",
        phone: "0400000000",
        contact_type: "technicien",
        source: "formulaire_site",
        tags: ["collectivite", "saint-etienne", "demande"],
        notes: "Contact cree depuis une demande publique TVF.",
      },
    });
    assert.strictEqual(crm.statusCode, 201);
    assert.strictEqual(crm.json.contact.email, "mairie@example.fr");

    const dossier = await runHandler(adminCasesHandler, {
      method: "POST",
      admin: true,
      body: {
        type: "case",
        source_request_id: demande.id,
        case_type: "collectivite",
        title: "Rendez-vous Ville test - local vacant",
        priority: "haute",
        territory: "Saint-Etienne",
        summary: "Demande de rendez-vous pour qualifier un local vacant et etudier un usage territorial utile.",
        next_action: "Preparer la fiche d instruction et demander les pieces utiles.",
      },
    });
    assert.strictEqual(dossier.statusCode, 201);
    assert.strictEqual(dossier.json.case.case_number, "DOS-2026-0001");
    assert.strictEqual(dossier.json.case.source_request_id, demande.id);

    const document = await runHandler(adminDocumentsHandler, {
      method: "POST",
      admin: true,
      body: {
        type: "document",
        title: "Programme TVF - rendez-vous collectivite",
        document_type: "courrier",
        status: "a_valider",
        related_object_type: "case",
        related_object_id: dossier.json.case.id,
        confidentiality_level: "interne",
        file_name: "programme-tvf.txt",
        mime_type: "text/plain",
        file_base64: Buffer.from("Programme TVF a transmettre en rendez-vous.").toString("base64"),
      },
    });
    assert.strictEqual(document.statusCode, 201);
    assert.strictEqual(document.json.document.related_object_id, dossier.json.case.id);
    assert.strictEqual(store.storageUploads.length, 1, "le document doit etre depose dans le stockage simule");

    const responseEmail = await runHandler(adminEmailsHandler, {
      method: "POST",
      admin: true,
      body: {
        type: "email",
        provider: "manual",
        direction: "outbound",
        from_email: "contact@territoiresvivantsfrance.fr",
        from_name: "Territoires Vivants France",
        to_email: "mairie@example.fr",
        subject: "Suite a votre demande - rendez-vous TVF",
        body_text: "Bonjour, nous vous confirmons la prise en charge de votre demande et proposons un rendez-vous pour qualifier le besoin.",
        contact_id: crm.json.contact.id,
        case_id: dossier.json.case.id,
        status: "to_reply",
      },
    });
    assert.strictEqual(responseEmail.statusCode, 201);
    assert.strictEqual(responseEmail.json.email.direction, "outbound");
    assert.strictEqual(responseEmail.json.email.case_id, dossier.json.case.id);

    assert.deepStrictEqual({
      demandes: store.contacts.length,
      contacts: store.crm_contacts.length,
      dossiers: store.cases.length,
      fichiers: store.files.length,
      documents: store.documents.length,
      emails: store.email_messages.length,
    }, {
      demandes: 1,
      contacts: 1,
      dossiers: 1,
      fichiers: 1,
      documents: 1,
      emails: 1,
    });

    console.log("TVF OS user flow test passed");
  } finally {
    global.fetch = originalFetch;
    _store.clear();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
