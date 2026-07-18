const assert = require("assert");
const fs = require("node:fs");
const path = require("node:path");
const dashboardHandler = require("../api/dashboard");

function loadDotEnv(file = ".env") {
  const envPath = path.join(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

loadDotEnv();

const REQUIRED_ENV = ["TVF_ADMIN_TOKEN", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function missingEnv() {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
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
    json: res.body ? JSON.parse(res.body) : null,
  };
}

async function main() {
  const missing = missingEnv();
  if (missing.length) {
    console.log(`SKIP real environment Dashboard test. Missing env: ${missing.join(", ")}`);
    process.exit(0);
  }

  const result = await runHandler({
    method: "GET",
    url: "/api/dashboard?range=30&status=all&priority=all&category=all",
    headers: {
      authorization: `Bearer ${process.env.TVF_ADMIN_TOKEN}`,
    },
  });

  assert.strictEqual(result.statusCode, 200);
  assert.strictEqual(result.json.ok, true);
  assert.strictEqual(typeof result.json.dashboard.generatedAt, "string");
  assert.strictEqual(result.json.dashboard.coverage.percent, 100);
  assert.ok(result.json.dashboard.metrics);
  assert.ok(result.json.dashboard.assistant);
  assert.ok(result.json.dashboard.views);
  assert.ok(Array.isArray(result.json.dashboard.recent));

  console.log("Dashboard real environment test passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
