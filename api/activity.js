const { isConfigured, sendJson, readBody, supabaseFetch, requireUser, isAdmin, logActivity } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configurÃ© sur Vercel." });
  try {
    const { user } = await requireUser(req);
    if (req.method === "GET") {
      if (!(await isAdmin(user.id))) return sendJson(res, 403, { error: "AccÃ¨s administrateur requis" });
      const rows = await supabaseFetch("/rest/v1/activity_log?select=*&order=created_at.desc&limit=100", { prefer: "" });
      return sendJson(res, 200, { data: rows });
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      await logActivity({
        actorAuthUserId: user.id,
        action: body.action || "event",
        tableName: body.table_name || null,
        recordId: body.record_id || null,
        metadata: body.metadata || {}
      });
      return sendJson(res, 201, { data: { recorded: true } });
    }
    return sendJson(res, 405, { error: "MÃ©thode non autorisÃ©e" });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
};
