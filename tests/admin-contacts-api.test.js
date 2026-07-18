const assert = require("assert");
const adminContactsHandler = require("../lib/api/admin-contacts");

const {
  inferCategory,
  inferPriority,
  poleFromCategory,
  missingPieces,
  buildAssistant,
  createPayload,
  updatePayload,
  enrichMobileRequest,
  contactPayloadFromMobile,
} = adminContactsHandler._private;

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(value = "") {
      this.body = value;
    },
  };
}

function createRequest({ method = "GET", url = "/api/admin-contacts", token = "secret", body = null }) {
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
  await adminContactsHandler(createRequest(options), res);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    json: res.body ? JSON.parse(res.body) : null,
  };
}

function testAssistantRules() {
  assert.strictEqual(inferCategory({ subject: "Maison vacante proprietaire", message: "adresse et photos" }), "bien-vacant-proprietaire");
  assert.strictEqual(inferPriority({ subject: "Rendez-vous mairie", message: "commune partenaire" }), "haute");
  assert.strictEqual(poleFromCategory("materiaux-reemploi"), "Materiautheque solidaire");
  assert.ok(missingPieces("bien-vacant-proprietaire", "Bien vacant a Saint-Etienne").includes("photos recentes"));

  const assistant = buildAssistant({
    id: "00000000-0000-0000-0000-000000000123",
    created_at: "2026-07-07T10:00:00.000Z",
    subject: "Stock materiaux",
    message: "Don de materiaux bois a recuperer rapidement",
    category: "materiaux-reemploi",
    priority: "urgente",
  });
  assert.strictEqual(assistant.request_number, "TVF-2026-0123");
  assert.strictEqual(assistant.suggested_pole, "Materiautheque solidaire");
  assert.strictEqual(assistant.suggested_priority, "urgente");
}

function testPayloadValidation() {
  const payload = createPayload({
    channel: "telephone",
    full_name: "Mairie demo",
    subject: "Rendez-vous collectivite",
    message: "La commune souhaite qualifier une friche.",
  });
  assert.strictEqual(payload.channel, "telephone");
  assert.strictEqual(payload.category, "collectivite-territoire");
  assert.strictEqual(payload.priority, "haute");
  assert.strictEqual(payload.pole, "Developpement territorial");

  assert.throws(() => createPayload({ channel: "fax", subject: "x" }), /Canal invalide/);
  assert.throws(() => updatePayload({ status: "inconnu" }), /Statut invalide/);
  assert.deepStrictEqual(updatePayload({ missing_pieces: "photos\nadresse" }).missing_pieces, ["photos", "adresse"]);
}

function testMobileMapping() {
  const mobile = enrichMobileRequest({
    id: "00000000-0000-0000-0000-000000000201",
    reference: "MOB-2026-0001",
    flow: "materials",
    category: "bois",
    raw_address: "Saint-Etienne",
    photo_bucket: "materiaux",
    photo_path: "MOB-2026-0001/photo.jpg",
    payload: {
      categoryLabel: "Bois et menuiseries",
      details: {
        title: "Stock de bois disponible",
        description: "Lots de bois propres et reutilisables.",
        quantity: "12 palettes",
      },
      contact: {
        name: "Entreprise demo",
        email: "contact@example.fr",
        phone: "0465000000",
      },
    },
  });
  assert.strictEqual(mobile.target_category, "materiaux-reemploi");
  assert.strictEqual(mobile.target_priority, "normale");
  assert.strictEqual(mobile.has_photo, true);

  const payload = contactPayloadFromMobile(mobile);
  assert.strictEqual(payload.source_page, "tvf-mobile");
  assert.strictEqual(payload.form_code, "MOB-01");
  assert.strictEqual(payload.category, "materiaux-reemploi");
  assert.ok(payload.message.includes("Reference mobile : MOB-2026-0001"));
  assert.ok(payload.internal_notes.includes("Piece photo"));
}
async function testUnauthorizedEndpoint() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ method: "GET", token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testGetEndpointWithSupabaseMock() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/contacts?"));
    assert.ok(String(url).includes("request_number"));
    assert.ok(String(url).includes("status=eq.nouveau"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000124",
            full_name: "Demo",
            email: "demo@example.fr",
            subject: "Bien vacant",
            message: "Proprietaire avec adresse mais sans photos.",
            status: "nouveau",
            priority: "normale",
            category: "bien-vacant-proprietaire",
            created_at: "2026-07-07T10:00:00.000Z",
          },
        ]);
      },
    };
  };

  try {
    const result = await runHandler({ method: "GET", url: "/api/admin-contacts?status=nouveau" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.ok, true);
    assert.strictEqual(result.json.contacts.length, 1);
    assert.strictEqual(result.json.contacts[0].request_number, "TVF-2026-0124");
    assert.strictEqual(result.json.contacts[0].assistant.suggested_pole, "Habitat vivant");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testPostEndpointWithSupabaseMock() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.strictEqual(options.method, "POST");
    const payload = JSON.parse(options.body);
    assert.strictEqual(payload.channel, "whatsapp");
    assert.strictEqual(payload.category, "materiaux-reemploi");
    assert.strictEqual(payload.pole, "Materiautheque solidaire");
    return {
      ok: true,
      status: 201,
      async text() {
        return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000125", ...payload, created_at: "2026-07-07T10:00:00.000Z" }]);
      },
    };
  };

  try {
    const result = await runHandler({
      method: "POST",
      body: {
        channel: "whatsapp",
        full_name: "Entreprise demo",
        subject: "Don de materiaux",
        message: "Stock de bois disponible rapidement.",
      },
    });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.contact.assistant.suggested_category, "materiaux-reemploi");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testMobileEndpointWithSupabaseMock() {
  process.env.NODE_ENV = "test";
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/mobile_requests?"));
    assert.ok(String(url).includes("status=eq.received_mobile"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000202",
            reference: "MOB-2026-0002",
            flow: "signal",
            category: "commerce ferme",
            status: "received_mobile",
            raw_address: "Rue de la Republique, Saint-Etienne",
            payload: { details: { description: "Vitrine fermee depuis plusieurs mois." } },
            created_at: "2026-07-07T10:00:00.000Z",
          },
        ]);
      },
    };
  };

  try {
    const result = await runHandler({ method: "GET", url: "/api/admin-contacts?action=mobile-pending" });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.mobileRequests.length, 1);
    assert.strictEqual(result.json.mobileRequests[0].target_category, "bien-vacant-proprietaire");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testMobileImportWithSupabaseMock() {
  process.env.NODE_ENV = "test";
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const method = options.method || "GET";
    const table = String(url).replace(/^https:\/\/demo\.supabase\.co\/rest\/v1\//, "").split("?")[0];
    calls.push({ table, method, url: String(url), body: options.body ? JSON.parse(options.body) : null });

    if (table === "mobile_requests" && method === "GET") {
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify([
            {
              id: "00000000-0000-0000-0000-000000000203",
              reference: "MOB-2026-0003",
              flow: "property",
              category: "logement vacant",
              status: "received_mobile",
              raw_address: "Saint-Etienne",
              contact_name: "Proprietaire demo",
              contact_email: "proprio@example.fr",
              payload: { details: { title: "Appartement vacant", description: "Logement a etudier pour remise en usage." } },
              created_at: "2026-07-07T10:00:00.000Z",
            },
          ]);
        },
      };
    }

    if (table === "contacts" && method === "POST") {
      assert.strictEqual(calls[calls.length - 1].body.source_page, "tvf-mobile");
      assert.strictEqual(calls[calls.length - 1].body.category, "bien-vacant-proprietaire");
      return {
        ok: true,
        status: 201,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000204", request_number: "TVF-2026-0204", ...calls[calls.length - 1].body, created_at: "2026-07-07T10:00:00.000Z" }]);
        },
      };
    }

    if (table === "mobile_requests" && method === "PATCH") {
      assert.strictEqual(calls[calls.length - 1].body.status, "imported_tvf_os");
      assert.strictEqual(calls[calls.length - 1].body.payload.tvf_os_import.request_number, "TVF-2026-0204");
      return { ok: true, status: 204, async text() { return ""; } };
    }

    throw new Error(`Unexpected call ${method} ${url}`);
  };

  try {
    const result = await runHandler({
      method: "POST",
      body: { type: "mobile-import", mobile_request_id: "00000000-0000-0000-0000-000000000203" },
    });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.contact.source_page, "tvf-mobile");
    assert.strictEqual(result.json.mobileRequest.status, "imported_tvf_os");
    assert.deepStrictEqual(calls.map((call) => `${call.method}:${call.table}`), ["GET:mobile_requests", "POST:contacts", "PATCH:mobile_requests"]);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testMobileImportCaseWithSupabaseMock() {
  process.env.NODE_ENV = "test";
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const method = options.method || "GET";
    const table = String(url).replace(/^https:\/\/demo\.supabase\.co\/rest\/v1\//, "").split("?")[0];
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ table, method, url: String(url), body });

    if (table === "mobile_requests" && method === "GET") {
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify([
            {
              id: "00000000-0000-0000-0000-000000000205",
              reference: "MOB-2026-0005",
              flow: "signal",
              category: "commerce ferme",
              status: "received_mobile",
              raw_address: "Rue de la Republique, Saint-Etienne",
              contact_name: "Citoyen terrain",
              contact_email: "citoyen@example.fr",
              contact_phone: "0465815469",
              photo_bucket: "signalements",
              photo_path: "MOB-2026-0005/photo-terrain.jpg",
              payload: { details: { title: "Commerce ferme", description: "Rideau baisse et local vacant a qualifier." } },
              created_at: "2026-07-07T10:00:00.000Z",
            },
          ]);
        },
      };
    }

    if (table === "contacts" && method === "POST") {
      assert.strictEqual(body.source_page, "tvf-mobile");
      assert.strictEqual(body.category, "bien-vacant-proprietaire");
      return {
        ok: true,
        status: 201,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000206", request_number: "TVF-2026-0206", ...body, created_at: "2026-07-07T10:00:00.000Z" }]);
        },
      };
    }

    if (table === "cases" && method === "POST") {
      assert.strictEqual(body.source_request_id, "00000000-0000-0000-0000-000000000206");
      assert.strictEqual(body.case_type, "commerce_inoccupe");
      assert.ok(body.summary.includes("MOB-2026-0005"));
      return {
        ok: true,
        status: 201,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000207", case_number: "DOS-2026-0007", ...body, created_at: "2026-07-07T10:00:00.000Z" }]);
        },
      };
    }

    if (table === "case_status_history" && method === "POST") {
      assert.strictEqual(body.case_id, "00000000-0000-0000-0000-000000000207");
      return { ok: true, status: 204, async text() { return ""; } };
    }

    if (table === "files" && method === "GET") {
      assert.ok(String(url).includes("storage_path=eq.MOB-2026-0005%2Fphoto-terrain.jpg"));
      return { ok: true, status: 200, async text() { return "[]"; } };
    }

    if (table === "files" && method === "POST") {
      assert.strictEqual(body.storage_bucket, "signalements");
      assert.strictEqual(body.storage_path, "MOB-2026-0005/photo-terrain.jpg");
      return {
        ok: true,
        status: 201,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000208", ...body }]);
        },
      };
    }

    if (table === "documents" && method === "POST") {
      assert.strictEqual(body.related_object_type, "case");
      assert.strictEqual(body.related_object_id, "00000000-0000-0000-0000-000000000207");
      assert.strictEqual(body.file_id, "00000000-0000-0000-0000-000000000208");
      return {
        ok: true,
        status: 201,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000209", document_number: "DOC-2026-0009", ...body }]);
        },
      };
    }

    if (table === "contacts" && method === "PATCH") {
      assert.strictEqual(body.status, "accepte");
      assert.ok(body.next_action.includes("DOS-2026-0007"));
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify([{ id: "00000000-0000-0000-0000-000000000206", request_number: "TVF-2026-0206", source_page: "tvf-mobile", category: "bien-vacant-proprietaire", status: "accepte", ...body, created_at: "2026-07-07T10:00:00.000Z" }]);
        },
      };
    }

    if (table === "mobile_requests" && method === "PATCH") {
      assert.strictEqual(body.status, "imported_tvf_os");
      assert.strictEqual(body.payload.tvf_os_import.request_number, "TVF-2026-0206");
      assert.strictEqual(body.payload.tvf_os_import.case_number, "DOS-2026-0007");
      assert.strictEqual(body.payload.tvf_os_import.document_id, "00000000-0000-0000-0000-000000000209");
      return { ok: true, status: 204, async text() { return ""; } };
    }

    throw new Error(`Unexpected call ${method} ${url}`);
  };

  try {
    const result = await runHandler({
      method: "POST",
      body: { type: "mobile-import-case", mobile_request_id: "00000000-0000-0000-0000-000000000205" },
    });
    assert.strictEqual(result.statusCode, 201);
    assert.strictEqual(result.json.contact.status, "accepte");
    assert.strictEqual(result.json.case.case_number, "DOS-2026-0007");
    assert.strictEqual(result.json.document.document_number, "DOC-2026-0009");
    assert.deepStrictEqual(calls.map((call) => `${call.method}:${call.table}`), [
      "GET:mobile_requests",
      "POST:contacts",
      "POST:cases",
      "POST:case_status_history",
      "GET:files",
      "POST:files",
      "POST:documents",
      "PATCH:contacts",
      "PATCH:mobile_requests",
    ]);
  } finally {
    global.fetch = originalFetch;
  }
}
async function testPatchEndpointWithSupabaseMock() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.strictEqual(options.method, "PATCH");
    assert.ok(String(url).includes("id=eq.00000000-0000-0000-0000-000000000126"));
    const payload = JSON.parse(options.body);
    assert.deepStrictEqual(payload.missing_pieces, ["photos", "adresse"]);
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000126",
            full_name: "Demo",
            email: "demo@example.fr",
            subject: "Qualification",
            message: "Message",
            status: "en_attente",
            priority: "haute",
            category: "bien-vacant-proprietaire",
            missing_pieces: payload.missing_pieces,
            created_at: "2026-07-07T10:00:00.000Z",
          },
        ]);
      },
    };
  };

  try {
    const result = await runHandler({
      method: "PATCH",
      body: {
        id: "00000000-0000-0000-0000-000000000126",
        status: "en_attente",
        missing_pieces: "photos\nadresse",
      },
    });
    assert.strictEqual(result.statusCode, 200);
    assert.deepStrictEqual(result.json.contact.missing_pieces, ["photos", "adresse"]);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  testAssistantRules();
  testPayloadValidation();
  testMobileMapping();
  await testUnauthorizedEndpoint();
  await testGetEndpointWithSupabaseMock();
  await testPostEndpointWithSupabaseMock();
  await testMobileEndpointWithSupabaseMock();
  await testMobileImportWithSupabaseMock();
  await testMobileImportCaseWithSupabaseMock();
  await testPatchEndpointWithSupabaseMock();
  console.log("Demandes entrantes API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
