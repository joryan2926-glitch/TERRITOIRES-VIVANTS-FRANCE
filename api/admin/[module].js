const path = require("path");

const MODULE_ALIASES = {
  cases: "cases",
  contacts: "contacts",
  session: "session",
  ai: "ai",
  branches: "branches",
  crm: "crm",
  documents: "documents",
  emails: "emails",
  finances: "finances",
  governance: "governance",
  impact: "impact",
  knowledge: "knowledge",
  map: "map",
  observatoire: "observatoire",
  procedures: "procedures",
  risks: "risks",
  settings: "settings",
  users: "users",
  work: "work",
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
  const moduleName = MODULE_ALIASES[normalizeModule(req.query.module)];
  if (!moduleName) {
    return sendJson(res, 404, { ok: false, error: "Module admin introuvable." });
  }

  const handlerPath = path.join(__dirname, "..", "..", "lib", "api", `admin-${moduleName}.js`);
  const moduleHandler = require(handlerPath);
  return moduleHandler(req, res);
};