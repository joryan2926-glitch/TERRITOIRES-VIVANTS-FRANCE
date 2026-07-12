const MODULE_LOADERS = {
  cases: () => require("../../lib/api/admin-cases.js"),
  contacts: () => require("../../lib/api/admin-contacts.js"),
  session: () => require("../../lib/api/admin-session.js"),
  ai: () => require("../../lib/api/admin-ai.js"),
  branches: () => require("../../lib/api/admin-branches.js"),
  crm: () => require("../../lib/api/admin-crm.js"),
  documents: () => require("../../lib/api/admin-documents.js"),
  emails: () => require("../../lib/api/admin-emails.js"),
  finances: () => require("../../lib/api/admin-finances.js"),
  governance: () => require("../../lib/api/admin-governance.js"),
  impact: () => require("../../lib/api/admin-impact.js"),
  knowledge: () => require("../../lib/api/admin-knowledge.js"),
  map: () => require("../../lib/api/admin-map.js"),
  observatoire: () => require("../../lib/api/admin-observatoire.js"),
  procedures: () => require("../../lib/api/admin-procedures.js"),
  risks: () => require("../../lib/api/admin-risks.js"),
  settings: () => require("../../lib/api/admin-settings.js"),
  users: () => require("../../lib/api/admin-users.js"),
  work: () => require("../../lib/api/admin-work.js"),
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function normalizeModule(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

module.exports = async function handler(req, res) {
  const moduleLoader = MODULE_LOADERS[normalizeModule(req.query.module)];
  if (!moduleLoader) {
    return sendJson(res, 404, { ok: false, error: "Module admin introuvable." });
  }

  const moduleHandler = moduleLoader();
  return moduleHandler(req, res);
};