function clean(value, max = 1200) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function validUuid(value) {
  const text = clean(value || "", 80);
  return /^[0-9a-f-]{32,36}$/i.test(text) ? text : null;
}

function jsonSafe(value) {
  if (!value || typeof value !== "object") return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {};
  }
}

function actorFromRequest(req) {
  if (!req || !req.headers) return "TVF OS";
  return clean(req.headers["x-admin-user"] || req.headers["x-tvf-actor"] || "TVF OS", 180) || "TVF OS";
}

function ipFromRequest(req) {
  if (!req || !req.headers) return "";
  return clean(String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "").split(",")[0], 80);
}

async function writeAdminAudit({ supabaseRequest, req, moduleKey, action, objectType, objectId, summary, metadata }) {
  if (process.env.NODE_ENV === "test" || process.env.TVF_DISABLE_ADMIN_AUDIT === "1") return { ok: true, skipped: true };
  if (typeof supabaseRequest !== "function") return { ok: false, skipped: true };
  const common = {
    object_type: clean(objectType || moduleKey || "tvf_os", 120),
    object_id: validUuid(objectId),
    action: clean(action || "action", 120),
    summary: clean(summary || "Action TVF OS tracee.", 1800),
    performed_by: actorFromRequest(req),
    metadata: jsonSafe({ ...(metadata || {}), ip_address: ipFromRequest(req), user_agent: clean(req?.headers?.["user-agent"] || "", 300) }),
  };
  const auditLogsPayload = {
    module_key: clean(moduleKey || "tvf_os", 120),
    ...common,
    ip_address: common.metadata.ip_address || null,
    user_agent: common.metadata.user_agent || null,
  };
  try {
    await supabaseRequest("audit_logs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(auditLogsPayload) });
    return { ok: true, table: "audit_logs" };
  } catch (firstError) {
    try {
      await supabaseRequest("settings_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(common) });
      return { ok: true, table: "settings_audit_log", fallback: true };
    } catch (secondError) {
      return { ok: false, error: secondError?.message || firstError?.message || "audit_failed" };
    }
  }
}

module.exports = { writeAdminAudit };
