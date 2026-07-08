const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const PROCEDURE_SCOPES = new Set(["national", "local", "pole", "module"]);
const PROCEDURE_STATUSES = new Set(["brouillon", "active", "en_revision", "remplacee", "archivee"]);
const MANDATORY_LEVELS = new Set(["obligatoire", "recommande", "optionnel", "experimental"]);
const STEP_TYPES = new Set(["information", "verification", "decision", "document", "validation", "action", "risque"]);
const STEP_STATUSES = new Set(["a_faire", "en_cours", "termine", "bloque", "non_applicable"]);
const APPLICATION_STATUSES = new Set(["active", "terminee", "bloquee", "annulee"]);
const RELATED_TYPES = new Set(["case", "request", "contact", "organization", "project", "branch", "none"]);

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}
function clean(value, max = 1200) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}
function cleanEnvToken(value, max = 3000) {
  return clean(value || "", max).replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, "");
}
function cleanEnvUrl(value) {
  return clean(value || "", 600).replace(/^[`'\",;]+|[`'\",;]+$/g, "");
}
function normalizeSupabaseRestUrl(rawUrl) {
  const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$/, "");
  if (!cleaned) return "";
  return cleaned.endsWith("/rest/v1") ? cleaned : `${cleaned}/rest/v1`;
}
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 80 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 });
  }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); }
}
function adminToken() {
  return cleanEnvToken(process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "", 3000);
}
function tokenFromRequest(req) {
  const authorization = clean(req.headers.authorization || "", 4000);
  if (authorization.toLowerCase().startsWith("bearer ")) return cleanEnvToken(authorization.slice(7), 3000);
  return cleanEnvToken(req.headers["x-admin-token"] || "", 3000);
}
function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
function requireAdmin(req) {
  const expected = adminToken();
  if (!expected) throw Object.assign(new Error("Back-office non configure : ajoutez TVF_ADMIN_TOKEN dans Vercel."), { statusCode: 503, code: "ADMIN_TOKEN_MISSING" });
  if (!safeEqual(tokenFromRequest(req), expected)) throw Object.assign(new Error("Acces admin refuse."), { statusCode: 401, code: "ADMIN_UNAUTHORIZED" });
}
function supabaseConfig() {
  const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnvToken(process.env.SUPABASE_SERVICE_ROLE_KEY || "", 3000);
  if (!restUrl || !key) throw Object.assign(new Error("Supabase admin non configure : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."), { statusCode: 503, code: "SUPABASE_ADMIN_NOT_CONFIGURED" });
  return { restUrl, key };
}
function supabaseHeaders(key, extra = {}) {
  const headers = { apikey: key, "Content-Type": "application/json", ...extra };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS);
  try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timeout); }
}
async function supabaseRequest(path, options = {}) {
  const { restUrl, key } = supabaseConfig();
  const response = await fetchWithTimeout(`${restUrl}/${path}`, { ...options, headers: supabaseHeaders(key, options.headers || {}) });
  const text = await response.text();
  if (!response.ok) throw Object.assign(new Error("Requete Supabase impossible."), { statusCode: 502, details: text });
  return text ? JSON.parse(text) : null;
}
function queryUrl(req) {
  return new URL(req.url, "https://admin.local");
}
function normalizeForMatch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function validateEnum(set, value, message) {
  if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 });
}
function slugify(value) {
  return normalizeForMatch(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "procedure";
}
function arrayValue(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 160)).filter(Boolean).slice(0, 30);
  return clean(value || "", 2000).split(/[;,\n]/).map((item) => clean(item, 160)).filter(Boolean).slice(0, 30);
}
function inferScope(input) {
  const text = normalizeForMatch([input.scope, input.title, input.module_key, input.pole, input.summary].join(" "));
  if (/local|antenne|branche/.test(text)) return "local";
  if (/pole|habitat|materiautheque|finance|communication/.test(text)) return "pole";
  if (/module|dashboard|crm|document|dossier/.test(text)) return "module";
  return "national";
}
function inferMandatoryLevel(input) {
  const text = normalizeForMatch([input.mandatory_level, input.title, input.summary, input.content].join(" "));
  if (/obligatoire|doit|imperatif|rgpd|securite|validation/.test(text)) return "obligatoire";
  if (/test|pilote|experimental/.test(text)) return "experimental";
  if (/optionnel|selon cas/.test(text)) return "optionnel";
  return "recommande";
}
function dueDateForReview(level) {
  const date = new Date();
  date.setMonth(date.getMonth() + (level === "obligatoire" ? 6 : 12));
  return date.toISOString();
}
function procedureAssistant(row) {
  const steps = row.procedure_steps || [];
  const required = steps.filter((step) => step.required !== false);
  const applications = row.procedure_applications || [];
  const missing = [];
  if (!row.owner_label) missing.push("responsable");
  if (!row.next_review_at) missing.push("date de revision");
  if (!steps.length) missing.push("etapes");
  if (row.status === "brouillon") missing.push("validation nationale ou locale");
  const overdueReview = row.next_review_at && new Date(row.next_review_at).getTime() < Date.now();
  return {
    required_steps: required.length,
    active_applications: applications.filter((app) => app.status === "active").length,
    missing_fields: missing,
    overdue_review: overdueReview,
    suggested_status: overdueReview ? "en_revision" : missing.length ? "brouillon" : row.status || "active",
    answer_hint: required.length ? `Procedure en ${required.length} etapes obligatoires/recommandees.` : "Ajouter les etapes avant application.",
    summary: row.ai_summary || `${row.title || "Procedure"} - ${row.mandatory_level || "niveau a definir"}.`,
  };
}
function applicationAssistant(row) {
  const items = row.procedure_step_instances || [];
  const required = items.filter((item) => item.required !== false);
  const done = required.filter((item) => ["termine", "non_applicable"].includes(item.status));
  const blocked = required.filter((item) => item.status === "bloque");
  const completion = required.length ? Math.round((done.length / required.length) * 100) : row.completion_rate || 0;
  return {
    completion_rate: row.completion_rate || completion,
    blocked_steps: blocked.map((item) => item.title).slice(0, 6),
    suggested_status: blocked.length ? "bloquee" : completion >= 100 ? "terminee" : row.status || "active",
    next_step: required.find((item) => ["a_faire", "en_cours", "bloque"].includes(item.status))?.title || "Procedure terminee ou non applicable.",
  };
}
function enrichProcedure(row) {
  return { ...row, assistant: procedureAssistant(row || {}) };
}
function enrichApplication(row) {
  return { ...row, assistant: applicationAssistant(row || {}) };
}
function procedurePayload(input, partial = false) {
  const payload = {};
  const scope = clean(input.scope || "", 80) || (!partial ? inferScope(input) : "");
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  const level = clean(input.mandatory_level || "", 80) || (!partial ? inferMandatoryLevel(input) : "");
  validateEnum(PROCEDURE_SCOPES, scope, "Perimetre de procedure invalide.");
  validateEnum(PROCEDURE_STATUSES, status, "Statut de procedure invalide.");
  validateEnum(MANDATORY_LEVELS, level, "Niveau obligatoire invalide.");
  const title = clean(input.title || "", 260);
  const fields = {
    procedure_key: clean(input.procedure_key || "", 160),
    title,
    scope,
    module_key: clean(input.module_key || "", 120),
    pole: clean(input.pole || "", 160),
    branch_id: clean(input.branch_id || "", 80),
    status,
    mandatory_level: level,
    content_document_id: clean(input.content_document_id || "", 80),
    owner_label: clean(input.owner_label || "", 180),
    reviewed_at: clean(input.reviewed_at || "", 80),
    next_review_at: clean(input.next_review_at || "", 80),
    summary: clean(input.summary || "", 4000),
    ai_summary: clean(input.ai_summary || input.summary || "", 2400),
  };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de procedure requis."), { statusCode: 400 });
  if (!partial && !fields.procedure_key) fields.procedure_key = slugify(`${scope}-${title}`);
  if (!partial && !fields.next_review_at) fields.next_review_at = dueDateForReview(level);
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["scope", "status", "mandatory_level"].includes(key)) {
      if (value) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (Object.prototype.hasOwnProperty.call(input, "tags")) payload.tags = arrayValue(input.tags);
  if (Object.prototype.hasOwnProperty.call(input, "related_template_keys")) payload.related_template_keys = arrayValue(input.related_template_keys);
  if (!payload.ai_summary) payload.ai_summary = `${payload.title || title} - procedure ${level}.`;
  return payload;
}
function stepPayload(input, partial = false) {
  const type = clean(input.step_type || "verification", 80);
  validateEnum(STEP_TYPES, type, "Type d'etape invalide.");
  const fields = {
    procedure_id: clean(input.procedure_id || "", 80),
    step_order: Number(input.step_order || 1),
    title: clean(input.title || "", 260),
    step_type: type,
    description: clean(input.description || "", 3000),
    required: input.required === false || input.required === "false" ? false : true,
    evidence_required: input.evidence_required === true || input.evidence_required === "true",
    expected_document_type: clean(input.expected_document_type || "", 120),
    responsible_role: clean(input.responsible_role || "", 160),
  };
  if (!partial && !fields.procedure_id) throw Object.assign(new Error("Procedure requise."), { statusCode: 400 });
  if (!partial && !fields.title) throw Object.assign(new Error("Titre d'etape requis."), { statusCode: 400 });
  const payload = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || key === "step_type") {
      if (value !== "" && !Number.isNaN(value)) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  return payload;
}
function applicationPayload(input) {
  const relatedType = clean(input.related_object_type || "case", 80);
  validateEnum(RELATED_TYPES, relatedType, "Type d'objet invalide.");
  return {
    procedure_id: clean(input.procedure_id || "", 80),
    related_object_type: relatedType,
    related_object_id: clean(input.related_object_id || "", 80) || null,
    assigned_to: clean(input.assigned_to || "", 180) || null,
    status: "active",
    due_at: clean(input.due_at || "", 80) || null,
  };
}
function stepInstancePayload(input) {
  const status = clean(input.status || "", 80);
  validateEnum(STEP_STATUSES, status, "Statut d'etape invalide.");
  return {
    status,
    notes: clean(input.notes || "", 1600) || null,
    evidence_document_id: clean(input.evidence_document_id || "", 80) || null,
    completed_at: ["termine", "non_applicable"].includes(status) ? new Date().toISOString() : null,
  };
}
function procedureSelect() {
  return "*,procedure_steps(*),procedure_applications(*),procedure_versions(*)";
}
function applicationSelect() {
  return "*,procedures(*),procedure_step_instances(*)";
}
async function listProcedures(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: procedureSelect(), order: "updated_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const scope = clean(url.searchParams.get("scope") || "", 80);
  const level = clean(url.searchParams.get("mandatory_level") || "", 80);
  const q = clean(url.searchParams.get("q") || "", 120).replace(/[*,()]/g, " ");
  if (status && status !== "all" && PROCEDURE_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (scope && scope !== "all" && PROCEDURE_SCOPES.has(scope)) params.set("scope", `eq.${scope}`);
  if (level && level !== "all" && MANDATORY_LEVELS.has(level)) params.set("mandatory_level", `eq.${level}`);
  if (q) params.set("or", `(procedure_key.ilike.*${q}*,title.ilike.*${q}*,summary.ilike.*${q}*,module_key.ilike.*${q}*,pole.ilike.*${q}*)`);
  const rows = await supabaseRequest(`procedures?${params.toString()}`);
  return (rows || []).map(enrichProcedure);
}
async function listApplications(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: applicationSelect(), order: "updated_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const relatedType = clean(url.searchParams.get("related_object_type") || "", 80);
  const relatedId = clean(url.searchParams.get("related_object_id") || "", 80);
  if (status && status !== "all" && APPLICATION_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (relatedType && relatedType !== "all" && RELATED_TYPES.has(relatedType)) params.set("related_object_type", `eq.${relatedType}`);
  if (relatedId) params.set("related_object_id", `eq.${relatedId}`);
  const rows = await supabaseRequest(`procedure_applications?${params.toString()}`);
  return (rows || []).map(enrichApplication);
}
async function dashboardProcedures() {
  const procedures = await supabaseRequest("procedures?select=id,status,scope,mandatory_level,next_review_at&limit=1000");
  const apps = await supabaseRequest("procedure_applications?select=id,status,completion_rate,due_at&limit=1000");
  const now = Date.now();
  return {
    procedures_total: procedures.length,
    active: procedures.filter((p) => p.status === "active").length,
    obligatoires: procedures.filter((p) => p.mandatory_level === "obligatoire").length,
    en_revision: procedures.filter((p) => p.status === "en_revision" || (p.next_review_at && new Date(p.next_review_at).getTime() < now)).length,
    applications_active: apps.filter((a) => a.status === "active").length,
    applications_blocked: apps.filter((a) => a.status === "bloquee").length,
    average_completion: apps.length ? Math.round(apps.reduce((sum, app) => sum + Number(app.completion_rate || 0), 0) / apps.length) : 0,
  };
}
async function createProcedure(input) {
  const payload = procedurePayload(input);
  const rows = await supabaseRequest(`procedures?select=${encodeURIComponent(procedureSelect())}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichProcedure(rows?.[0]);
}
async function updateProcedure(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant de procedure invalide."), { statusCode: 400 });
  const payload = procedurePayload(input, true);
  const params = new URLSearchParams({ id: `eq.${id}`, select: procedureSelect() });
  const rows = await supabaseRequest(`procedures?${params.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichProcedure(rows?.[0]);
}
async function createStep(input) {
  const payload = stepPayload(input);
  const rows = await supabaseRequest("procedure_steps?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0] || null;
}
async function updateStep(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant d'etape invalide."), { statusCode: 400 });
  const rows = await supabaseRequest(`procedure_steps?id=eq.${id}&select=*`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(stepPayload(input, true)) });
  return rows?.[0] || null;
}
async function applyProcedure(input) {
  const payload = applicationPayload(input);
  if (!payload.procedure_id) throw Object.assign(new Error("Procedure requise."), { statusCode: 400 });
  const rows = await supabaseRequest(`procedure_applications?select=${encodeURIComponent(applicationSelect())}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichApplication(rows?.[0]);
}
async function updateStepInstance(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant de checklist invalide."), { statusCode: 400 });
  const rows = await supabaseRequest(`procedure_step_instances?id=eq.${id}&select=*`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(stepInstancePayload(input)) });
  return rows?.[0] || null;
}
async function askProcedure(input) {
  const question = clean(input.question || "", 500);
  if (!question) throw Object.assign(new Error("Question requise."), { statusCode: 400 });
  const procedureId = clean(input.procedure_id || "", 80);
  const rows = procedureId && /^[0-9a-f-]{32,36}$/i.test(procedureId)
    ? await supabaseRequest(`procedures?id=eq.${procedureId}&select=${encodeURIComponent(procedureSelect())}`)
    : await supabaseRequest(`procedures?status=eq.active&select=${encodeURIComponent(procedureSelect())}&limit=20`);
  const procedures = (rows || []).map(enrichProcedure);
  const q = normalizeForMatch(question);
  const chosen = procedures.find((p) => normalizeForMatch([p.title, p.summary, p.module_key, p.pole, (p.tags || []).join(" ")].join(" ")).split(" ").some((word) => word.length > 4 && q.includes(word))) || procedures[0];
  const steps = chosen?.procedure_steps || [];
  const answer = chosen
    ? `Procedure conseillee : ${chosen.title}. Niveau : ${chosen.mandatory_level}. Premiere action : ${steps[0]?.title || "consulter la fiche procedure"}. ${chosen.summary || chosen.ai_summary || ""}`
    : "Aucune procedure active ne correspond encore a cette question.";
  const payload = { procedure_id: chosen?.id || null, question, answer, sources: chosen ? [chosen.procedure_key] : [], confidence: chosen ? 0.76 : 0.25, created_by: "TVF OS" };
  const saved = await supabaseRequest("procedure_questions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return saved?.[0] || payload;
}
async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "procedures", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardProcedures() });
      if (entity === "applications") return sendJson(res, 200, { ok: true, applications: await listApplications(req) });
      return sendJson(res, 200, { ok: true, procedures: await listProcedures(req) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "procedure", 80);
    if (req.method === "POST") {
      if (type === "procedure") return sendJson(res, 201, { ok: true, procedure: await createProcedure(data) });
      if (type === "step") return sendJson(res, 201, { ok: true, step: await createStep(data) });
      if (type === "application") return sendJson(res, 201, { ok: true, application: await applyProcedure(data) });
      if (type === "question") return sendJson(res, 201, { ok: true, response: await askProcedure(data) });
    }
    if (req.method === "PATCH") {
      if (type === "procedure") return sendJson(res, 200, { ok: true, procedure: await updateProcedure(data) });
      if (type === "step") return sendJson(res, 200, { ok: true, step: await updateStep(data) });
      if (type === "step_instance") return sendJson(res, 200, { ok: true, item: await updateStepInstance(data) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Procedures indisponibles pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}
module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, slugify, inferScope, inferMandatoryLevel, procedureAssistant, applicationAssistant, procedurePayload, stepPayload, applicationPayload, stepInstancePayload };
