const { isConfigured, sendJson, readBody, supabaseFetch, requireUser, isAdmin, pick } = require("./_supabase");

const TABLES = {
  signalements: ["statut_validation"],
  materiaux: ["statut_validation", "disponibilite"],
  partenaires: ["statut"],
  antennes: ["statut"]
};

module.exports = async function handler(req, res) {
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configuré sur Vercel." });
  try {
    const { user } = await requireUser(req);
    if (!(await isAdmin(user.id))) return sendJson(res, 403, { error: "Accès administrateur requis" });
    if (req.method === "GET") {
      const [signalements, materiaux, partenaires, antennes] = await Promise.all([
        supabaseFetch("/rest/v1/signalements?select=*&statut_validation=eq.a_moderer&order=created_at.desc&limit=30", { prefer: "" }),
        supabaseFetch("/rest/v1/materiaux?select=*&statut_validation=eq.a_moderer&order=created_at.desc&limit=30", { prefer: "" }),
        supabaseFetch("/rest/v1/partenaires?select=*&statut=eq.a_valider&order=created_at.desc&limit=30", { prefer: "" }),
        supabaseFetch("/rest/v1/antennes?select=*&statut=eq.prefiguration&order=created_at.desc&limit=30", { prefer: "" })
      ]);
      return sendJson(res, 200, { data: { signalements, materiaux, partenaires, antennes } });
    }
    if (req.method === "PATCH") {
      const body = await readBody(req);
      const table = body.table;
      if (!TABLES[table]) return sendJson(res, 400, { error: "Table non autorisée" });
      const id = body.id;
      if (!id) return sendJson(res, 400, { error: "Identifiant manquant" });
      const update = pick(body, TABLES[table]);
      const saved = await supabaseFetch(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: update
      });
      return sendJson(res, 200, { data: saved });
    }
    return sendJson(res, 405, { error: "Méthode non autorisée" });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
};
