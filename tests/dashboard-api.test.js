const assert = require("assert");
const dashboardHandler = require("../api/dashboard");
const { aggregateDashboard, isOverdue, normalizeSupabaseRestUrl } = dashboardHandler._private;

function fixedDate(daysAgo) {
  const date = new Date("2026-07-07T12:00:00.000Z");
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

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

async function runHandler(req) {
  const res = createResponse();
  await dashboardHandler(req, res);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    json: res.body ? JSON.parse(res.body) : null,
  };
}

async function testAggregation() {
  const rows = [
    {
      id: "1",
      subject: "Bien vacant",
      status: "nouveau",
      priority: "urgente",
      category: "bien-vacant-proprietaire",
      created_at: fixedDate(4),
      updated_at: fixedDate(4),
    },
    {
      id: "2",
      subject: "Collectivite",
      status: "archive",
      priority: "haute",
      category: "collectivite-territoire",
      assigned_to: "Alice",
      created_at: fixedDate(1),
      closed_at: fixedDate(0),
    },
    {
      id: "3",
      subject: "Materiaux",
      status: "en_cours",
      priority: "normale",
      category: "materiaux-reemploi",
      assigned_to: "",
      created_at: fixedDate(2),
      updated_at: fixedDate(2),
    },
  ];

  const originalDate = Date;
  global.Date = class extends originalDate {
    constructor(...args) {
      if (args.length === 0) return new originalDate("2026-07-07T12:00:00.000Z");
      return new originalDate(...args);
    }
    static now() {
      return new originalDate("2026-07-07T12:00:00.000Z").getTime();
    }
    static parse(value) {
      return originalDate.parse(value);
    }
    static UTC(...args) {
      return originalDate.UTC(...args);
    }
  };

  try {
    const result = aggregateDashboard(rows, 30);
    assert.strictEqual(result.metrics.total, 3);
    assert.strictEqual(result.metrics.open, 2);
    assert.strictEqual(result.metrics.closed, 1);
    assert.strictEqual(result.metrics.overdue, 1);
    assert.strictEqual(result.metrics.unassigned, 2);
    assert.strictEqual(result.metrics.byPriority.urgente, 1);
    assert.strictEqual(result.metrics.byCategory["materiaux-reemploi"], 1);
    assert.strictEqual(result.metrics.byPole["Materiautheque Solidaire"], 1);
    assert.strictEqual(result.coverage.percent, 100);
    assert.ok(result.assistant.insights.some((item) => item.title === "Demandes en retard"));
  } finally {
    global.Date = originalDate;
  }
}

function testOverdue() {
  const now = new Date("2026-07-07T12:00:00.000Z");
  assert.strictEqual(
    isOverdue({ status: "nouveau", priority: "urgente", created_at: "2026-07-05T12:00:00.000Z" }, now),
    true
  );
  assert.strictEqual(
    isOverdue({ status: "archive", priority: "urgente", created_at: "2026-07-01T12:00:00.000Z" }, now),
    false
  );
}

function testUrlNormalization() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co/rest/v1"), "https://demo.supabase.co/rest/v1");
}

async function testUnauthorizedEndpoint() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({
    method: "GET",
    url: "/api/dashboard",
    headers: { authorization: "Bearer wrong" },
  });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.ok, false);
}

async function testEndpointWithSupabaseMock() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  process.env.SUPABASE_URL = "https://demo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";

  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://demo.supabase.co/rest/v1/contacts?"));
    assert.ok(String(url).includes("status=eq.nouveau"));
    assert.ok(String(url).includes("priority=eq.normale"));
    assert.ok(String(url).includes("category=eq.demande-generale"));
    assert.strictEqual(options.headers.apikey, "sb_secret_demo");
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify([
          {
            id: "1",
            full_name: "Demo",
            subject: "Question",
            status: "nouveau",
            priority: "normale",
            category: "demande-generale",
            created_at: new Date().toISOString(),
          },
        ]);
      },
    };
  };

  try {
    const result = await runHandler({
      method: "GET",
      url: "/api/dashboard?range=30&status=nouveau&priority=normale&category=demande-generale",
      headers: { authorization: "Bearer secret" },
    });
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.json.ok, true);
    assert.strictEqual(result.json.dashboard.metrics.total, 1);
    assert.strictEqual(result.json.dashboard.recent.length, 1);
    assert.strictEqual(result.json.dashboard.coverage.percent, 100);
  } finally {
    global.fetch = originalFetch;
  }
}

async function main() {
  await testAggregation();
  testOverdue();
  testUrlNormalization();
  await testUnauthorizedEndpoint();
  await testEndpointWithSupabaseMock();
  console.log("Dashboard API tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

