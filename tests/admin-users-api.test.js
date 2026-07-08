const assert = require("assert");
const handler = require("../api/admin-users");
const { normalizeSupabaseRestUrl, profilePayload, userRolePayload, invitationPayload, profileAssistant } = handler._private;

function createResponse() { return { statusCode: 0, headers: {}, body: "", setHeader(name, value) { this.headers[name] = value; }, end(value = "") { this.body = value; } }; }
function createRequest({ method = "GET", url = "/api/admin-users", token = "secret", body = null }) { return { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, async *[Symbol.asyncIterator]() { if (body) yield JSON.stringify(body); } }; }
async function runHandler(options) { const res = createResponse(); await handler(createRequest(options), res); return { statusCode: res.statusCode, json: res.body ? JSON.parse(res.body) : null }; }
function mockResponse(data, status = 200) { return { ok: status >= 200 && status < 300, status, async text() { return JSON.stringify(data); } }; }

function testRules() {
  assert.strictEqual(normalizeSupabaseRestUrl("https://demo.supabase.co"), "https://demo.supabase.co/rest/v1");
  assert.strictEqual(profilePayload({ email: "TEST@EXAMPLE.FR" }).email, "test@example.fr");
  assert.strictEqual(invitationPayload({ email: "invite@example.fr" }).status, "pending");
  assert.strictEqual(userRolePayload({ profile_id: "00000000-0000-0000-0000-000000000001", role_id: "00000000-0000-0000-0000-000000000002" }).scope, "global");
  const assistant = profileAssistant({ email: "a@test.fr", status: "active" }, [{ status: "active", is_sensitive: true }], [{ membership_status: "active" }], [{ review_status: "pending" }]);
  assert.strictEqual(assistant.should_review, true);
  assert.throws(() => profilePayload({ status: "bad", email: "x@y.fr" }), /Statut profil/);
}
async function testUnauthorized() { process.env.TVF_ADMIN_TOKEN = "secret"; const result = await runHandler({ token: "wrong" }); assert.strictEqual(result.statusCode, 401); }
async function testDashboardAndProfiles() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes("/profiles?")) return mockResponse([{ id: "p1", email: "camille@example.test", status: "active" }]);
    if (u.includes("/roles?")) return mockResponse([{ id: "r1", role_key: "responsable_antenne", role_name: "Responsable", is_sensitive: true, status: "active" }]);
    if (u.includes("/permissions?")) return mockResponse([{ id: "perm1", permission_key: "manage_users" }]);
    if (u.includes("/user_roles?")) return mockResponse([{ id: "ur1", profile_id: "p1", role_id: "r1", status: "active" }]);
    if (u.includes("/user_branch_memberships?")) return mockResponse([{ id: "m1", profile_id: "p1", membership_status: "active" }]);
    if (u.includes("/user_invitations?")) return mockResponse([{ id: "i1", email: "invite@example.test", status: "pending" }]);
    if (u.includes("/access_reviews?")) return mockResponse([{ id: "rv1", profile_id: "p1", review_status: "pending", risk_level: "high" }]);
    if (u.includes("/role_permissions?")) return mockResponse([]);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const dashboard = await runHandler({ url: "/api/admin-users?entity=dashboard" });
    assert.strictEqual(dashboard.statusCode, 200);
    assert.strictEqual(dashboard.json.dashboard.sensitive_assignments, 1);
    const profiles = await runHandler({ url: "/api/admin-users?entity=profiles" });
    assert.strictEqual(profiles.json.profiles[0].assistant.pending_reviews, 1);
  } finally { global.fetch = originalFetch; }
}
async function testCreateProfileAndInvitation() {
  process.env.TVF_ADMIN_TOKEN = "secret"; process.env.SUPABASE_URL = "https://demo.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_demo";
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/profiles?select=*") && options.method === "POST") return mockResponse([{ id: "p1", ...JSON.parse(options.body) }], 201);
    if (u.includes("/user_invitations?select=*") && options.method === "POST") return mockResponse([{ id: "i1", ...JSON.parse(options.body) }], 201);
    throw new Error("Unexpected URL " + u);
  };
  try {
    const created = await runHandler({ method: "POST", body: { type: "profile", email: "new@example.test", first_name: "New" } });
    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.json.profile.email, "new@example.test");
    const invited = await runHandler({ method: "POST", body: { type: "invitation", email: "invite@example.test" } });
    assert.strictEqual(invited.statusCode, 201);
    assert.strictEqual(invited.json.invitation.status, "pending");
  } finally { global.fetch = originalFetch; }
}
async function main() { testRules(); await testUnauthorized(); await testDashboardAndProfiles(); await testCreateProfileAndInvitation(); console.log("Users API tests passed"); }
main().catch((error) => { console.error(error); process.exit(1); });
