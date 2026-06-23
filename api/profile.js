const { isConfigured, sendJson, readBody, supabaseFetch, requireUser, isAdmin, pick } = require("../lib/supabase");

module.exports = async function handler(req, res) {
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configuré sur Vercel." });
  try {
    const { user } = await requireUser(req);
    if (req.method === "GET") {
      const rows = await supabaseFetch(`/rest/v1/user_profiles?select=*&auth_user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
      return sendJson(res, 200, { data: rows[0] || null, authUser: { id: user.id, email: user.email } });
    }
    if (req.method === "POST" || req.method === "PATCH") {
      const body = await readBody(req);
      if (body.role === "administrateur" && !(await isAdmin(user.id))) {
        return sendJson(res, 403, { error: "Le rôle administrateur doit être attribué directement par l'association." });
      }
      const row = {
        ...pick(body, ["role", "structure", "territoire_id", "statut_validation"]),
        auth_user_id: user.id
      };
      const saved = await supabaseFetch(`/rest/v1/user_profiles?on_conflict=auth_user_id`, {
        method: "POST",
        body: row,
        prefer: "resolution=merge-duplicates,return=representation"
      });
      return sendJson(res, 200, { data: saved[0] || saved });
    }
    return sendJson(res, 405, { error: "Méthode non autorisée" });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
};
