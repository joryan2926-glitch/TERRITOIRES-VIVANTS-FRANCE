const crypto = require("crypto");
const { writeAdminAudit } = require("./admin-audit");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const CASE_TYPES = new Set(["bien_vacant", "commerce_inoccupe", "materiaux", "collectivite", "entreprise", "benevole", "financeur", "signalement", "friche_terrain", "presse", "gouvernance", "autre"]);
const CASE_STATUSES = new Set(["ouvert", "qualification", "instruction", "attente_pieces", "visite", "a_decision", "decision_validee", "cloture", "archive"]);
const PRIORITIES = new Set(["normale", "haute", "urgente"]);
const CONFIDENTIALITY = new Set(["public", "standard", "confidentiel", "sensible"]);
const DECISION_STATUSES = new Set(["non_preparee", "a_preparer", "proposee", "validee", "refusee", "ajournee"]);
const RISK_LEVELS = new Set(["faible", "modere", "eleve", "critique"]);
const CHECKLIST_STATUSES = new Set(["a_verifier", "manquant", "recu", "valide", "non_applicable"]);

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
  const cleaned = cleanEnvUrl(rawUrl);
  if (!cleaned) return "";
  const trimmed = cleaned.replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 40 * 1024) throw Object.assign(new Error("Payload too large"), { statusCode: 413 });
  }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); }
}
function adminToken() {
  return cleanEnvToken(process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "", 3000);
}
function adminCookieSignature() {
  const token = adminToken();
  if (!token) return "";
  return crypto.createHmac("sha256", token).update("tvf-os-admin-session-v1").digest("hex");
}
function cookieValue(req, name = "tvf_admin_session") {
  const cookieHeader = clean(req.headers.cookie || "", 6000);
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  return found ? cleanEnvToken(decodeURIComponent(found.slice(name.length + 1)), 3000) : "";
}
function tokenFromRequest(req) {
  const expectedCookie = adminCookieSignature();
  const receivedCookie = cookieValue(req);
  if (expectedCookie && receivedCookie && safeEqual(receivedCookie, expectedCookie)) return adminToken();
  const authorization = clean(req.headers.authorization || "", 4000);
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const bearer = cleanEnvToken(authorization.slice(7), 3000);
    if (bearer) return bearer;
  }
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
function queryUrl(req) {
  return new URL(req.url, "https://admin.local");
}
function normalizeForMatch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function inferCaseType(input) {
  const text = normalizeForMatch([input.case_type, input.title, input.summary, input.category, input.message].join(" "));
  if (/materiau|materiaux|reemploi|bois|stock/.test(text)) return "materiaux";
  if (/collectivite|mairie|commune|epci|territoire/.test(text)) return "collectivite";
  if (/commerce/.test(text)) return "commerce_inoccupe";
  if (/friche|terrain/.test(text)) return "friche_terrain";
  if (/proprietaire|logement|immeuble|bien vacant|batiment/.test(text)) return "bien_vacant";
  if (/entreprise|rse|partenariat/.test(text)) return "entreprise";
  if (/benevole|insertion/.test(text)) return "benevole";
  if (/financeur|mecene|financement/.test(text)) return "financeur";
  if (/presse|journaliste|media/.test(text)) return "presse";
  if (/signalement/.test(text)) return "signalement";
  return "autre";
}
function poleFromCaseType(type) {
  return {
    bien_vacant: "Habitat vivant",
    commerce_inoccupe: "Habitat vivant",
    friche_terrain: "Developpement territorial",
    materiaux: "Materiautheque solidaire",
    collectivite: "Developpement territorial",
    entreprise: "Partenariats & RSE",
    benevole: "Mobilisation citoyenne",
    financeur: "Financement & mecenat",
    presse: "Communication institutionnelle",
    gouvernance: "Gouvernance",
  }[type] || "Accueil & orientation";
}
function dueDate(priority) {
  const date = new Date();
  date.setDate(date.getDate() + (priority === "urgente" ? 1 : priority === "haute" ? 3 : 7));
  return date.toISOString();
}
function assistantForCase(row) {
  const checklist = row.case_checklist_items || [];
  const required = checklist.filter((item) => item.required !== false);
  const done = required.filter((item) => ["recu", "valide", "non_applicable"].includes(item.status));
  const missing = required.filter((item) => ["a_verifier", "manquant"].includes(item.status)).map((item) => item.label).slice(0, 6);
  const score = required.length ? Math.round((done.length / required.length) * 100) : row.maturity_score || 0;
  const blocked = missing.length >= 3 || row.risk_level === "critique";
  return {
    maturity_score: row.maturity_score || score,
    missing_items: missing,
    blocked,
    suggested_status: blocked ? "attente_pieces" : score >= 80 ? "a_decision" : row.status || "instruction",
    suggested_decision: score >= 80 ? "Preparer une decision humaine argumentee" : "Completer l instruction avant decision",
    summary: row.ai_summary || `${row.main_pole || poleFromCaseType(row.case_type)} - dossier ${row.case_type || "autre"}, maturite ${score}%.`,
  };
}
function enrichCase(row) {
  const assistant = assistantForCase(row || {});
  return { ...row, maturity_score: row.maturity_score || assistant.maturity_score, assistant };
}
function validateEnum(set, value, message) {
  if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 });
}
function arrayValue(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 120)).filter(Boolean).slice(0, 12);
  return clean(value || "", 1000).split(/[;,\n]/).map((item) => clean(item, 120)).filter(Boolean).slice(0, 12);
}
function casePayload(input, partial = false) {
  const payload = {};
  const type = clean(input.case_type || "", 80) || (!partial ? inferCaseType(input) : "");
  const status = clean(input.status || "", 80) || (!partial ? "ouvert" : "");
  const priority = clean(input.priority || "", 80) || (!partial ? "normale" : "");
  const confidentiality = clean(input.confidentiality_level || "", 80) || (!partial ? "standard" : "");
  const decisionStatus = clean(input.decision_status || "", 80) || (!partial ? "non_preparee" : "");
  const riskLevel = clean(input.risk_level || "", 80) || (!partial ? "modere" : "");
  validateEnum(CASE_TYPES, type, "Type de dossier invalide.");
  validateEnum(CASE_STATUSES, status, "Statut de dossier invalide.");
  validateEnum(PRIORITIES, priority, "Priorite invalide.");
  validateEnum(CONFIDENTIALITY, confidentiality, "Niveau de confidentialite invalide.");
  validateEnum(DECISION_STATUSES, decisionStatus, "Statut de decision invalide.");
  validateEnum(RISK_LEVELS, riskLevel, "Niveau de risque invalide.");
  const fields = {
    source_request_id: clean(input.source_request_id || "", 80),
    case_type: type,
    title: clean(input.title || "", 260),
    status,
    priority,
    main_pole: clean(input.main_pole || "", 160) || (type ? poleFromCaseType(type) : ""),
    assigned_to: clean(input.assigned_to || "", 180),
    confidentiality_level: confidentiality,
    summary: clean(input.summary || "", 5000),
    next_action: clean(input.next_action || "", 260),
    next_action_due_at: clean(input.next_action_due_at || "", 80),
    decision_status: decisionStatus,
    decision_summary: clean(input.decision_summary || "", 2000),
    risk_level: riskLevel,
    territory: clean(input.territory || "", 220),
  };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de dossier requis."), { statusCode: 400 });
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["case_type", "status", "priority", "main_pole", "confidentiality_level", "decision_status", "risk_level"].includes(key)) {
      if (value) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (Object.prototype.hasOwnProperty.call(input, "associated_poles")) payload.associated_poles = arrayValue(input.associated_poles);
  if (!partial) {
    payload.next_action = payload.next_action || (status === "a_decision" ? "Preparer la decision humaine" : "Completer la checklist d instruction");
    payload.next_action_due_at = payload.next_action_due_at || dueDate(priority);
  }
  payload.ai_summary = `${payload.main_pole || poleFromCaseType(type)} - dossier ${type || "autre"}, statut ${status || "a mettre a jour"}.`;
  return payload;
}
function checklistPayload(input) {
  const status = clean(input.status || "", 80);
  validateEnum(CHECKLIST_STATUSES, status, "Statut checklist invalide.");
  return {
    status,
    notes: clean(input.notes || "", 1200) || null,
    completed_at: ["recu", "valide", "non_applicable"].includes(status) ? new Date().toISOString() : null,
  };
}
function riskPayload(input) {
  const riskLevel = clean(input.risk_level || "modere", 80);
  validateEnum(RISK_LEVELS, riskLevel, "Niveau de risque invalide.");
  return {
    case_id: clean(input.case_id || "", 80),
    risk_label: clean(input.risk_label || "", 260),
    risk_level: riskLevel,
    mitigation: clean(input.mitigation || "", 1200) || null,
    owner: clean(input.owner || "", 180) || null,
  };
}
function decisionPayload(input) {
  const decisionStatus = clean(input.decision_status || "proposee", 80);
  validateEnum(new Set(["proposee", "validee", "refusee", "ajournee"]), decisionStatus, "Statut de decision invalide.");
  return {
    case_id: clean(input.case_id || "", 80),
    decision_type: clean(input.decision_type || "orientation", 80),
    proposed_decision: clean(input.proposed_decision || "", 2000),
    final_decision: clean(input.final_decision || "", 2000) || null,
    decision_status: decisionStatus,
    decided_by: clean(input.decided_by || "", 180) || null,
    decided_at: decisionStatus === "validee" ? new Date().toISOString() : null,
    next_step: clean(input.next_step || "", 1000) || null,
  };
}
function historyPayload(caseId, fromStatus, toStatus, note) {
  return { case_id: caseId, from_status: fromStatus || null, to_status: toStatus, note: clean(note || "", 1200) || null, created_by: "TVF OS" };
}
async function supabaseRequest(path, options = {}) {
  const { restUrl, key } = supabaseConfig();
  const response = await fetchWithTimeout(`${restUrl}/${path}`, { ...options, headers: supabaseHeaders(key, options.headers || {}) });
  const text = await response.text();
  if (!response.ok) throw Object.assign(new Error("Requete Supabase impossible."), { statusCode: 502, details: text });
  return text ? JSON.parse(text) : null;
}
function caseSelect() {
  return "*,case_checklist_items(*),case_participants(*),case_risks(*),case_decisions(*),case_status_history(*)";
}
async function getCaseById(id) {
  const params = new URLSearchParams({ id: `eq.${id}`, select: caseSelect(), limit: "1" });
  const rows = await supabaseRequest(`cases?${params.toString()}`);
  return rows?.[0] ? enrichCase(rows[0]) : null;
}
async function listCases(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams();
  params.set("select", caseSelect());
  params.set("order", "updated_at.desc");
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("case_type") || "", 80);
  const priority = clean(url.searchParams.get("priority") || "", 80);
  const q = clean(url.searchParams.get("q") || "", 120).replace(/[*,()]/g, " ");
  if (status && status !== "all" && CASE_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && CASE_TYPES.has(type)) params.set("case_type", `eq.${type}`);
  if (priority && priority !== "all" && PRIORITIES.has(priority)) params.set("priority", `eq.${priority}`);
  if (q) params.set("or", `(case_number.ilike.*${q}*,title.ilike.*${q}*,summary.ilike.*${q}*,territory.ilike.*${q}*,assigned_to.ilike.*${q}*)`);
  const rows = await supabaseRequest(`cases?${params.toString()}`);
  return (rows || []).map(enrichCase);
}
async function dashboardCases() {
  const rows = await supabaseRequest("cases?select=id,status,priority,maturity_score,next_action_due_at,archived_at&limit=1000");
  const active = (rows || []).filter((row) => !row.archived_at && !["cloture", "archive"].includes(row.status));
  const now = Date.now();
  return {
    total: (rows || []).length,
    active: active.length,
    a_decision: active.filter((row) => row.status === "a_decision").length,
    overdue: active.filter((row) => row.next_action_due_at && new Date(row.next_action_due_at).getTime() < now).length,
    urgent: active.filter((row) => row.priority === "urgente").length,
    average_maturity: active.length ? Math.round(active.reduce((sum, row) => sum + Number(row.maturity_score || 0), 0) / active.length) : 0,
  };
}
async function createCase(input, req) {
  const payload = casePayload(input);
  const rows = await supabaseRequest("cases?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  const created = rows?.[0];
  if (created?.id) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(created.id, null, created.status, "Creation du dossier")) });
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "cases", action: "create_case", objectType: "case", objectId: created?.id, summary: `Creation du dossier ${created?.case_number || created?.title || "TVF"}.`, metadata: { case_type: created?.case_type || payload.case_type, status: created?.status || payload.status, priority: created?.priority || payload.priority } });
  return created?.id ? await getCaseById(created.id) : enrichCase(created);
}
async function updateCase(input, req) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant de dossier invalide."), { statusCode: 400 });
  const previous = (await supabaseRequest(`cases?id=eq.${id}&select=id,status`))?.[0];
  const payload = casePayload(input, true);
  const params = new URLSearchParams({ id: `eq.${id}`, select: "*" });
  const rows = await supabaseRequest(`cases?${params.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  const updated = rows?.[0];
  if (payload.status && previous?.status !== payload.status) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(id, previous?.status, payload.status, input.status_note || "Changement de statut")) });
  else if (input.status_note) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(id, previous?.status, previous?.status || payload.status || "instruction", input.status_note)) });
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "cases", action: "update_case", objectType: "case", objectId: updated?.id || id, summary: `Mise a jour du dossier ${updated?.case_number || updated?.title || id}.`, metadata: { changed_fields: Object.keys(payload || {}), previous_status: previous?.status || null, status: updated?.status || payload.status || null } });
  return updated?.id ? await getCaseById(updated.id) : enrichCase(updated);
}
async function updateChecklist(input, req) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant checklist invalide."), { statusCode: 400 });
  const previous = (await supabaseRequest(`case_checklist_items?id=eq.${id}&select=id,case_id,label,status`))?.[0];
  const rows = await supabaseRequest(`case_checklist_items?id=eq.${id}&select=*`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(checklistPayload(input)) });
  const updated = rows?.[0] || null;
  if (previous?.case_id && updated?.status && previous.status !== updated.status) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(previous.case_id, null, updated.status, `Checklist - ${previous.label || "piece"} : ${previous.status || "a verifier"} -> ${updated.status}`)) });
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "cases", action: "update_checklist", objectType: "case_checklist_item", objectId: updated?.id || id, summary: `Checklist mise a jour : ${previous?.label || "piece"}.`, metadata: { case_id: previous?.case_id || null, previous_status: previous?.status || null, status: updated?.status || null } });
  return updated;
}
async function createRisk(input, req) {
  const payload = riskPayload(input);
  if (!payload.case_id || !payload.risk_label) throw Object.assign(new Error("Risque incomplet."), { statusCode: 400 });
  const rows = await supabaseRequest("case_risks?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  if (rows?.[0]?.case_id) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(rows[0].case_id, null, "instruction", `Risque ajoute - ${rows[0].risk_label} (${rows[0].risk_level})`)) });
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "cases", action: "create_risk", objectType: "case_risk", objectId: rows?.[0]?.id, summary: `Risque ajoute : ${rows?.[0]?.risk_label || payload.risk_label}.`, metadata: { case_id: rows?.[0]?.case_id || payload.case_id, risk_level: rows?.[0]?.risk_level || payload.risk_level } });
  return rows?.[0] || null;
}
async function createDecision(input, req) {
  const payload = decisionPayload(input);
  if (!payload.case_id || !payload.proposed_decision) throw Object.assign(new Error("Decision incomplete."), { statusCode: 400 });
  const rows = await supabaseRequest("case_decisions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  if (rows?.[0]?.case_id) await supabaseRequest("case_status_history", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(historyPayload(rows[0].case_id, null, payload.decision_status, `Decision tracee - ${payload.proposed_decision.slice(0, 140)}`)) });
  if (payload.decision_status === "validee") await updateCase({ id: payload.case_id, status: "decision_validee", decision_status: "validee", decision_summary: payload.final_decision || payload.proposed_decision, status_note: "Decision validee" }, req);
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "cases", action: "create_decision", objectType: "case_decision", objectId: rows?.[0]?.id, summary: `Decision tracee pour un dossier TVF OS.`, metadata: { case_id: rows?.[0]?.case_id || payload.case_id, decision_status: payload.decision_status } });
  return rows?.[0] || null;
}
async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "cases", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardCases() });
      return sendJson(res, 200, { ok: true, cases: await listCases(req) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "case", 80);
    if (req.method === "POST") {
      if (type === "case") return sendJson(res, 201, { ok: true, case: await createCase(data, req) });
      if (type === "risk") return sendJson(res, 201, { ok: true, risk: await createRisk(data, req) });
      if (type === "decision") return sendJson(res, 201, { ok: true, decision: await createDecision(data, req) });
    }
    if (req.method === "PATCH") {
      if (type === "case") return sendJson(res, 200, { ok: true, case: await updateCase(data, req) });
      if (type === "checklist") return sendJson(res, 200, { ok: true, item: await updateChecklist(data, req) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Dossiers temporairement non charges : vérifiez la configuration Supabase du module." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}
module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, inferCaseType, poleFromCaseType, assistantForCase, enrichCase, casePayload, checklistPayload, riskPayload, decisionPayload };
