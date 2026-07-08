const assert = require("assert");
const handler = require("../api/admin-session");

function createResponse() {
  return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } };
}

function createRequest({ method = "GET", token = "secret" } = {}) {
  return { method, url: "/api/admin-session", headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() {} };
}

async function runHandler(options) {
  const res = createResponse();
  await handler(createRequest(options), res);
  return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

async function testMissingTokenConfig() {
  delete process.env.TVF_ADMIN_TOKEN;
  delete process.env.ADMIN_TOKEN;
  const result = await runHandler({ token: "secret" });
  assert.strictEqual(result.statusCode, 503);
  assert.strictEqual(result.json.code, "ADMIN_TOKEN_MISSING");
}

async function testUnauthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "wrong" });
  assert.strictEqual(result.statusCode, 401);
  assert.strictEqual(result.json.code, "ADMIN_UNAUTHORIZED");
}

async function testAuthorized() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ token: "secret" });
  assert.strictEqual(result.statusCode, 200);
  assert.strictEqual(result.json.ok, true);
  assert.strictEqual(result.json.session.scope, "tvf-os");
}

async function main() {
  await testMissingTokenConfig();
  await testUnauthorized();
  await testAuthorized();
  console.log("Admin session API tests passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
