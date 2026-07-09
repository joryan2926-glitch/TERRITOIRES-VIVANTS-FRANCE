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
  await testUnauthorizedEndpoint();
  await testGetEndpointWithSupabaseMock();
  await testPostEndpointWithSupabaseMock();
  await testPatchEndpointWithSupabaseMock();
  console.log("Demandes entrantes API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
