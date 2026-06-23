const { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured, sendJson } = require("../lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Méthode non autorisée" });
  return sendJson(res, 200, {
    configured: isConfigured(),
    supabaseUrl: SUPABASE_URL || "",
    supabaseAnonKey: SUPABASE_ANON_KEY || ""
  });
};
