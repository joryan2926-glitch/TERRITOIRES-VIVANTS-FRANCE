const assert = require("assert");
const handler = require("../lib/api/admin-session");

function createResponse() {
  return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } };
}

function createRequest({ method = "GET", token = "secret", cookie = "" } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (cookie) headers.cookie = cookie;
  return { method, url: "/api/admin-session", headers, async *[Symbol.asyncIterator]() {} };
}

async function runHandler(options) {
  const res = createResponse();
  await handler(createRequest(options), res);
  return { statusCode: res.statusCode, headers: res.headers, json: res.body ? JSON.parse(res.body) : null };
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
  assert.ok(String(result.headers["Set-Cookie"] || "").includes("tvf_admin_session="));
  assert.ok(String(result.headers["Set-Cookie"] || "").includes("HttpOnly"));
}

async function testCookieSession() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const signed = await runHandler({ token: "secret" });
  const cookie = String(signed.headers["Set-Cookie"] || "").split(";")[0];
  const result = await runHandler({ token: "", cookie });
  assert.strictEqual(result.statusCode, 200);
  assert.strictEqual(result.json.session.authenticated, true);
}

async function testLogoutClearsCookie() {
  process.env.TVF_ADMIN_TOKEN = "secret";
  const result = await runHandler({ method: "DELETE", token: "" });
  assert.strictEqual(result.statusCode, 200);
  assert.ok(String(result.headers["Set-Cookie"] || "").includes("Max-Age=0"));
}

async function main() {
  await testMissingTokenConfig();
  await testUnauthorized();
  await testAuthorized();
  await testCookieSession();
  await testLogoutClearsCookie();
  console.log("Admin session API tests passed");
}

main().catch((error) => { console.error(error); process.exit(1); });
