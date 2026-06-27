const { isConfigured, sendJson, readBody, supabaseFetch, pick, logActivity } = require("../lib/supabase");

const ALLOWED_FIELDS = [
  "profil",
  "nom",
  "organisation",
  "email",
  "telephone",
  "territoire",
  "sujet",
  "message",
  "source_page",
  "consentement"
];

function normalizeString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = async function handler(req, res) {
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configuré sur Vercel." });
  if (req.method !== "POST") return sendJson(res, 405, { error: "Méthode non autorisée" });

  try {
    const body = pick(await readBody(req), ALLOWED_FIELDS);
    const row = {
      profil: normalizeString(body.profil, 80) || "demande_generale",
      nom: normalizeString(body.nom, 160),
      organisation: normalizeString(body.organisation, 180),
      email: normalizeString(body.email, 180),
      telephone: normalizeString(body.telephone, 80),
      territoire: normalizeString(body.territoire, 180),
      sujet: normalizeString(body.sujet, 180),
      message: normalizeString(body.message, 4000),
      source_page: normalizeString(body.source_page, 220),
      consentement: body.consentement === true || body.consentement === "on" || body.consentement === "true",
      statut: "a_traiter"
    };

    if (!row.message) return sendJson(res, 400, { error: "Le message est obligatoire." });

    const inserted = await supabaseFetch("/rest/v1/contacts", { method: "POST", body: row });
    await logActivity({
      actorAuthUserId: null,
      action: "public_contact_create",
      tableName: "contacts",
      recordId: inserted?.[0]?.id,
      metadata: { profil: row.profil, sujet: row.sujet, source_page: row.source_page }
    });
    return sendJson(res, 201, { data: { id: inserted?.[0]?.id, statut: "a_traiter" } });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
};
