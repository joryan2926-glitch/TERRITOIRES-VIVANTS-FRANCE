const { isConfigured, sendJson, supabaseFetch } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Méthode non autorisée" });
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configuré sur Vercel." });
  try {
    const rows = await supabaseFetch("/rest/v1/dashboard_national?select=*", { prefer: "" });
    return sendJson(res, 200, { data: rows[0] || {} });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
};
