const assert = require("assert");
const { writeAdminAudit } = require("../lib/api/admin-audit");

async function main() {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDisable = process.env.TVF_DISABLE_ADMIN_AUDIT;
  process.env.NODE_ENV = "development";
  process.env.TVF_DISABLE_ADMIN_AUDIT = "0";
  const req = { headers: { "x-admin-user": "Responsable TVF", "x-forwarded-for": "203.0.113.80", "user-agent": "TVF test" } };

  try {
    const calls = [];
    const result = await writeAdminAudit({
      supabaseRequest: async (path, options) => { calls.push({ path, payload: JSON.parse(options.body) }); return null; },
      req,
      moduleKey: "impact",
      action: "update_metric",
      objectType: "metric",
      objectId: "00000000-0000-0000-0000-000000000001",
      summary: "Mise a jour indicateur.",
      metadata: { status: "validated" },
    });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.table, "audit_logs");
    assert.strictEqual(calls[0].path, "audit_logs");
    assert.strictEqual(calls[0].payload.module_key, "impact");
    assert.strictEqual(calls[0].payload.performed_by, "Responsable TVF");

    const fallbackCalls = [];
    const fallback = await writeAdminAudit({
      supabaseRequest: async (path) => { fallbackCalls.push(path); if (path === "audit_logs") throw new Error("table absente"); return null; },
      req,
      moduleKey: "finances",
      action: "create_budget",
      objectType: "budget",
      summary: "Creation budget.",
    });
    assert.strictEqual(fallback.ok, true);
    assert.strictEqual(fallback.table, "settings_audit_log");
    assert.deepStrictEqual(fallbackCalls, ["audit_logs", "settings_audit_log"]);
    console.log("Admin audit tests passed");
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
    if (previousDisable === undefined) delete process.env.TVF_DISABLE_ADMIN_AUDIT; else process.env.TVF_DISABLE_ADMIN_AUDIT = previousDisable;
  }
}

main().catch((error) => { console.error(error); process.exit(1); });