const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const DECISION_TYPES = new Set(["strategic", "operational", "financial", "legal", "branch", "partnership", "risk", "hr", "other"]);
const DECISION_STATUSES = new Set(["draft", "to_validate", "validated", "rejected", "executing", "done", "archive"]);
const COMMITTEE_STATUSES = new Set(["scheduled", "in_progress", "closed", "cancelled", "archive"]);
const MINUTES_STATUSES = new Set(["not_started", "draft", "to_validate", "validated", "published", "archive"]);
const ITEM_STATUSES = new Set(["open", "ready", "decided", "deferred", "cancelled", "archive"]);
const ACTION_STATUSES = new Set(["todo", "in_progress", "blocked", "done", "cancelled", "archive"]);
const DELEGATION_STATUSES = new Set(["draft", "active", "paused", "expired", "revoked", "archive"]);
const PRIORITIES = new Set(["faible", "moyen", "fort", "critique"]);
const RELATED_TYPES = new Set(["none", "request", "case", "contact", "organization", "document", "procedure", "knowledge", "branch", "project", "finance", "impact", "risk"]);

function sendJson(res, statusCode, payload) { res.statusCode = statusCode; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(payload)); }
function clean(value, max = 1200) { if (typeof value !== "string") return ""; return value.replace(/\s+/g, " ").trim().slice(0, max); }
function cleanEnvToken(value, max = 3000) { return clean(value || "", max).replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, ""); }
function cleanEnvUrl(value) { return clean(value || "", 600).replace(/^[`'\",;]+|[`'\",;]+$/g, ""); }
function normalizeSupabaseRestUrl(rawUrl) { const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$/, ""); if (!cleaned) return ""; return cleaned.endsWith("/rest/v1") ? cleaned : `${cleaned}/rest/v1`; }
async function readJsonBody(req) { let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 90 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 }); } if (!body) return {}; try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); } }
function adminToken() { return cleanEnvToken(process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "", 3000); }
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
function safeEqual(a, b) { if (!a || !b) return false; const left = Buffer.from(a); const right = Buffer.from(b); if (left.length !== right.length) return false; return crypto.timingSafeEqual(left, right); }
function requireAdmin(req) { const expected = adminToken(); if (!expected) throw Object.assign(new Error("Back-office non configure : ajoutez TVF_ADMIN_TOKEN dans Vercel."), { statusCode: 503, code: "ADMIN_TOKEN_MISSING" }); if (!safeEqual(tokenFromRequest(req), expected)) throw Object.assign(new Error("Acces admin refuse."), { statusCode: 401, code: "ADMIN_UNAUTHORIZED" }); }
function supabaseConfig() { const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL); const key = cleanEnvToken(process.env.SUPABASE_SERVICE_ROLE_KEY || "", 3000); if (!restUrl || !key) throw Object.assign(new Error("Supabase admin non configure : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."), { statusCode: 503, code: "SUPABASE_ADMIN_NOT_CONFIGURED" }); return { restUrl, key }; }
function supabaseHeaders(key, extra = {}) { const headers = { apikey: key, "Content-Type": "application/json", ...extra }; if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`; return headers; }
async function fetchWithTimeout(url, options = {}) { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS); try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timeout); } }
async function supabaseRequest(path, options = {}) { const { restUrl, key } = supabaseConfig(); const response = await fetchWithTimeout(`${restUrl}/${path}`, { ...options, headers: supabaseHeaders(key, options.headers || {}) }); const text = await response.text(); if (!response.ok) throw Object.assign(new Error("Requete Supabase impossible."), { statusCode: 502, details: text }); return text ? JSON.parse(text) : null; }
function queryUrl(req) { return new URL(req.url, "https://admin.local"); }
function validateEnum(set, value, message) { if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 }); }
function validateUuid(value, label = "Identifiant") { const cleaned = clean(value || "", 80); if (cleaned && !/^[0-9a-f-]{32,36}$/i.test(cleaned)) throw Object.assign(new Error(`${label} invalide.`), { statusCode: 400 }); return cleaned || null; }
function dateTimeValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString(); }
function dateValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10); }
function arrayValue(value, maxItems = 24) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 220)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 3000).split(/[;\n]/).map((item) => clean(item, 220)).filter(Boolean).slice(0, maxItems); }
function compactPayload(fields, input, partial, defaults = []) { const payload = {}; Object.entries(fields).forEach(([key, value]) => { if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) { if (value !== "" && value !== undefined) payload[key] = value; else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null; } }); return payload; }
function percent(done, total) { if (!total) return 0; return Math.round((done / total) * 100); }
function autoNumber(prefix) { return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

function decisionPayload(input, partial = false) {
  const type = clean(input.decision_type || "", 80) || (!partial ? "operational" : "");
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  const priority = clean(input.priority_level || "", 80) || (!partial ? "moyen" : "");
  const related = clean(input.related_object_type || "", 80) || (!partial ? "none" : "");
  validateEnum(DECISION_TYPES, type, "Type de decision invalide."); validateEnum(DECISION_STATUSES, status, "Statut decision invalide."); validateEnum(PRIORITIES, priority, "Priorite invalide."); validateEnum(RELATED_TYPES, related, "Objet lie invalide.");
  const fields = { decision_number: clean(input.decision_number || "", 120) || (!partial ? autoNumber("DEC") : ""), branch_id: validateUuid(input.branch_id || "", "Antenne"), decision_type: type, title: clean(input.title || "", 280), summary: clean(input.summary || "", 4000), status, priority_level: priority, decided_by: clean(input.decided_by || "", 180), decided_at: dateTimeValue(input.decided_at) || (status === "validated" && !partial ? new Date().toISOString() : null), validation_required: input.validation_required === false || input.validation_required === "false" ? false : true, related_object_type: related, related_object_id: validateUuid(input.related_object_id || "", "Objet lie"), committee_id: validateUuid(input.committee_id || "", "Comite"), minutes_document_id: validateUuid(input.minutes_document_id || "", "PV"), source_document_ids: arrayValue(input.source_document_ids || ""), tags: arrayValue(input.tags || ""), ai_summary: clean(input.ai_summary || "", 1200), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de decision requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["decision_type", "status", "priority_level", "related_object_type"]);
}
function committeePayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "scheduled" : ""); const minutes = clean(input.minutes_status || "", 80) || (!partial ? "not_started" : ""); const type = clean(input.committee_type || "", 80) || (!partial ? "governance" : "");
  validateEnum(COMMITTEE_STATUSES, status, "Statut comite invalide."); validateEnum(MINUTES_STATUSES, minutes, "Statut PV invalide."); validateEnum(new Set(["national", "branch", "governance", "finance", "impact", "risk", "project", "other"]), type, "Type de comite invalide.");
  const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), committee_key: clean(input.committee_key || "", 120) || (!partial ? autoNumber("COM") : ""), title: clean(input.title || "", 280), committee_type: type, status, scheduled_at: dateTimeValue(input.scheduled_at), location_label: clean(input.location_label || "", 180), facilitator_name: clean(input.facilitator_name || "", 180), attendees: arrayValue(input.attendees || ""), agenda_summary: clean(input.agenda_summary || input.summary || "", 4000), minutes_status: minutes, minutes_document_id: validateUuid(input.minutes_document_id || "", "PV"), ai_summary: clean(input.ai_summary || "", 1200), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de comite requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["committee_type", "status", "minutes_status"]);
}
function itemPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "open" : ""); const type = clean(input.item_type || "", 80) || (!partial ? "discussion" : ""); validateEnum(ITEM_STATUSES, status, "Statut point invalide."); validateEnum(new Set(["information", "discussion", "decision", "validation", "action", "risk", "other"]), type, "Type de point invalide."); const fields = { committee_id: validateUuid(input.committee_id || "", "Comite"), decision_id: validateUuid(input.decision_id || "", "Decision"), item_order: Math.max(1, Number(input.item_order || 1)), item_type: type, title: clean(input.title || "", 280), summary: clean(input.summary || "", 2400), presenter_name: clean(input.presenter_name || "", 180), status, expected_outcome: clean(input.expected_outcome || "", 1000) }; if (!partial && (!fields.committee_id || !fields.title)) throw Object.assign(new Error("Comite et titre requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["item_type", "status", "item_order"]); }
function votePayload(input) { const vote = clean(input.vote_value || "approve", 80); validateEnum(new Set(["approve", "reject", "abstain", "needs_changes"]), vote, "Vote invalide."); const fields = { decision_id: validateUuid(input.decision_id || "", "Decision"), voter_name: clean(input.voter_name || "", 180), voter_role: clean(input.voter_role || "", 160), vote_value: vote, comment: clean(input.comment || "", 1400) }; if (!fields.decision_id || !fields.voter_name) throw Object.assign(new Error("Decision et votant requis."), { statusCode: 400 }); return fields; }
function delegationPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "active" : ""); validateEnum(DELEGATION_STATUSES, status, "Statut delegation invalide."); const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), delegation_key: clean(input.delegation_key || "", 120) || (!partial ? autoNumber("DEL") : ""), delegated_to: clean(input.delegated_to || "", 180), delegated_by: clean(input.delegated_by || "", 180), scope: clean(input.scope || "", 2400), status, starts_at: dateValue(input.starts_at), ends_at: dateValue(input.ends_at), decision_id: validateUuid(input.decision_id || "", "Decision"), limits: clean(input.limits || "", 1800) }; if (!partial && (!fields.delegated_to || !fields.scope)) throw Object.assign(new Error("Delegataire et perimetre requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status"]); }
function actionPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "todo" : ""); const priority = clean(input.priority_level || "", 80) || (!partial ? "moyen" : ""); validateEnum(ACTION_STATUSES, status, "Statut action invalide."); validateEnum(PRIORITIES, priority, "Priorite invalide."); const fields = { decision_id: validateUuid(input.decision_id || "", "Decision"), committee_id: validateUuid(input.committee_id || "", "Comite"), branch_id: validateUuid(input.branch_id || "", "Antenne"), action_title: clean(input.action_title || input.title || "", 280), owner_name: clean(input.owner_name || "", 180), status, priority_level: priority, due_at: dateTimeValue(input.due_at), completed_at: status === "done" ? (dateTimeValue(input.completed_at) || new Date().toISOString()) : null, notes: clean(input.notes || "", 1800) }; if (!partial && !fields.action_title) throw Object.assign(new Error("Titre d'action requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status", "priority_level"]); }

function decisionAssistant(decision = {}, votes = [], actions = []) { const approvals = votes.filter((v) => v.vote_value === "approve").length; const blockers = votes.filter((v) => ["reject", "needs_changes"].includes(v.vote_value)).length; const openActions = actions.filter((a) => !["done", "cancelled", "archive"].includes(a.status)).length; const overdueActions = actions.filter((a) => a.due_at && new Date(a.due_at) < new Date() && !["done", "cancelled", "archive"].includes(a.status)).length; const validationScore = votes.length ? percent(approvals, votes.length) : 0; const ready = decision.status === "to_validate" && approvals > blockers && blockers === 0; return { approvals, blockers, open_actions: openActions, overdue_actions: overdueActions, validation_score: validationScore, ready_to_validate: ready, suggested_status: ready ? "validated" : blockers ? "to_validate" : decision.status, summary: `${decision.title || "Decision"} : ${validationScore}% d'avis favorables, ${openActions} action(s) ouverte(s), ${overdueActions} retard(s).`, next_actions: blockers ? ["Traiter les demandes de modification", "Reporter la validation"] : openActions ? ["Suivre les actions issues", "Verifier les echeances"] : ["Archiver la decision ou publier le PV"] }; }
function committeeAssistant(committee = {}, items = [], decisions = []) { const readyItems = items.filter((i) => ["ready", "decided"].includes(i.status)).length; const decisionItems = items.filter((i) => ["decision", "validation"].includes(i.item_type)).length; const decisionsToValidate = decisions.filter((d) => d.committee_id === committee.id && d.status === "to_validate").length; return { agenda_readiness: percent(readyItems, items.length), decision_items: decisionItems, decisions_to_validate: decisionsToValidate, summary: `${committee.title || "Comite"} : ${items.length} point(s), ${decisionItems} decision(s), PV ${committee.minutes_status || "non demarre"}.` }; }
function enrichDecisions(decisions = [], votes = [], actions = []) { return decisions.map((d) => ({ ...d, assistant: decisionAssistant(d, votes.filter((v) => v.decision_id === d.id), actions.filter((a) => a.decision_id === d.id)) })); }

function addFilters(params, url, statusSet, statusName = "status", searchColumns = ["title", "summary"]) { const status = clean(url.searchParams.get("status") || "", 80); const q = clean(url.searchParams.get("q") || "", 180).replace(/[*,()]/g, " "); if (status && status !== "all" && statusSet.has(status)) params.set(statusName, `eq.${status}`); if (q) params.set("or", `(${searchColumns.map((c) => `${c}.ilike.*${q}*`).join(",")})`); }
async function listTable(req, table, statusSet, order = "updated_at.desc", searchColumns) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order, limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 220), 1), 800)) }); addFilters(params, url, statusSet, "status", searchColumns); const branchId = validateUuid(url.searchParams.get("branch_id") || "", "Antenne"); if (branchId) params.set("branch_id", `eq.${branchId}`); return supabaseRequest(`${table}?${params.toString()}`); }
async function dashboard() { const [decisions, committees, items, votes, delegations, actions] = await Promise.all([supabaseRequest("decisions?select=*&limit=700"), supabaseRequest("committees?select=*&limit=500"), supabaseRequest("committee_items?select=*&limit=1000"), supabaseRequest("decision_votes?select=*&limit=1000"), supabaseRequest("delegations?select=*&limit=500"), supabaseRequest("decision_actions?select=*&limit=1000")]); const enriched = enrichDecisions(decisions || [], votes || [], actions || []); const openActions = (actions || []).filter((a) => !["done", "cancelled", "archive"].includes(a.status)); const overdue = openActions.filter((a) => a.due_at && new Date(a.due_at) < new Date()); return { total_decisions: enriched.length, to_validate: enriched.filter((d) => d.status === "to_validate").length, validated: enriched.filter((d) => d.status === "validated").length, committees_open: (committees || []).filter((c) => ["scheduled", "in_progress"].includes(c.status)).length, minutes_to_validate: (committees || []).filter((c) => c.minutes_status === "to_validate").length, active_delegations: (delegations || []).filter((d) => d.status === "active").length, open_actions: openActions.length, overdue_actions: overdue.length, alerts: [...enriched.filter((d) => d.assistant.blockers || d.status === "to_validate").slice(0, 6), ...overdue.slice(0, 4).map((a) => ({ title: a.action_title, status: a.status, assistant: { summary: `Action en retard : ${a.action_title}` } }))], assistant: { summary: `${enriched.length} decision(s), ${openActions.length} action(s) ouverte(s), ${overdue.length} retard(s), ${(committees || []).length} comite(s).`, priorities: [overdue.length ? "Traiter les actions en retard" : "Aucun retard critique", enriched.some((d) => d.status === "to_validate") ? "Valider les decisions en attente" : "Registre decisions a jour", (committees || []).some((c) => c.minutes_status === "draft") ? "Finaliser les PV brouillons" : "PV sous controle"] } }; }
async function listDecisions(req) { const decisions = await listTable(req, "decisions", DECISION_STATUSES, "updated_at.desc", ["title", "summary", "decision_number"]); const ids = (decisions || []).map((d) => d.id); if (!ids.length) return []; const filter = `decision_id=in.(${ids.join(",")})`; const [votes, actions] = await Promise.all([supabaseRequest(`decision_votes?select=*&${filter}&limit=1000`), supabaseRequest(`decision_actions?select=*&${filter}&limit=1000`)]); return enrichDecisions(decisions || [], votes || [], actions || []); }
async function createRecord(table, payload) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function updateRecord(table, id, payload) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function generateMinutes(committeeId) { const committees = await supabaseRequest(`committees?${new URLSearchParams({ select: "*", id: `eq.${committeeId}`, limit: "1" }).toString()}`); const committee = committees?.[0]; if (!committee) throw Object.assign(new Error("Comite introuvable."), { statusCode: 404 }); const [items, decisions, actions] = await Promise.all([supabaseRequest(`committee_items?select=*&committee_id=eq.${committeeId}&limit=500`), supabaseRequest(`decisions?select=*&committee_id=eq.${committeeId}&limit=500`), supabaseRequest(`decision_actions?select=*&committee_id=eq.${committeeId}&limit=500`)]); const assistant = committeeAssistant(committee, items || [], decisions || []); return { committee, assistant, minutes: { title: `PV - ${committee.title}`, generated_at: new Date().toISOString(), attendees: committee.attendees || [], agenda: (items || []).map((i) => i.title), decisions: (decisions || []).map((d) => `${d.decision_number} - ${d.title} - ${d.status}`), actions: (actions || []).map((a) => `${a.action_title} - ${a.owner_name || "non assigne"}`), summary: assistant.summary } }; }

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    if (req.method === "GET") {
      const entity = clean(queryUrl(req).searchParams.get("entity") || "dashboard", 80);
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboard() });
      if (entity === "decisions") return sendJson(res, 200, { ok: true, decisions: await listDecisions(req) });
      if (entity === "committees") return sendJson(res, 200, { ok: true, committees: await listTable(req, "committees", COMMITTEE_STATUSES, "scheduled_at.desc", ["title", "agenda_summary", "committee_key"]) });
      if (entity === "items") return sendJson(res, 200, { ok: true, items: await listTable(req, "committee_items", ITEM_STATUSES, "item_order.asc", ["title", "summary"]) });
      if (entity === "votes") return sendJson(res, 200, { ok: true, votes: await supabaseRequest("decision_votes?select=*&order=created_at.desc&limit=1000") });
      if (entity === "delegations") return sendJson(res, 200, { ok: true, delegations: await listTable(req, "delegations", DELEGATION_STATUSES, "updated_at.desc", ["delegated_to", "scope", "delegation_key"]) });
      if (entity === "actions") return sendJson(res, 200, { ok: true, actions: await listTable(req, "decision_actions", ACTION_STATUSES, "due_at.asc", ["action_title", "owner_name", "notes"]) });
      throw Object.assign(new Error("Entite inconnue."), { statusCode: 400 });
    }
    const input = await readJsonBody(req);
    const type = clean(input.type || "decision", 80);
    if (req.method === "POST") {
      if (type === "decision") return sendJson(res, 201, { ok: true, decision: await createRecord("decisions", decisionPayload(input)) });
      if (type === "committee") return sendJson(res, 201, { ok: true, committee: await createRecord("committees", committeePayload(input)) });
      if (type === "item") return sendJson(res, 201, { ok: true, item: await createRecord("committee_items", itemPayload(input)) });
      if (type === "vote") return sendJson(res, 201, { ok: true, vote: await createRecord("decision_votes", votePayload(input)) });
      if (type === "delegation") return sendJson(res, 201, { ok: true, delegation: await createRecord("delegations", delegationPayload(input)) });
      if (type === "action") return sendJson(res, 201, { ok: true, action: await createRecord("decision_actions", actionPayload(input)) });
      if (type === "generate_minutes") return sendJson(res, 200, { ok: true, minutes_pack: await generateMinutes(validateUuid(input.committee_id || "", "Comite")) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(input.id || "", "Identifiant"); if (!id) throw Object.assign(new Error("Identifiant requis."), { statusCode: 400 });
      if (type === "decision") return sendJson(res, 200, { ok: true, decision: await updateRecord("decisions", id, decisionPayload(input, true)) });
      if (type === "committee") return sendJson(res, 200, { ok: true, committee: await updateRecord("committees", id, committeePayload(input, true)) });
      if (type === "item") return sendJson(res, 200, { ok: true, item: await updateRecord("committee_items", id, itemPayload(input, true)) });
      if (type === "delegation") return sendJson(res, 200, { ok: true, delegation: await updateRecord("delegations", id, delegationPayload(input, true)) });
      if (type === "action") return sendJson(res, 200, { ok: true, action: await updateRecord("decision_actions", id, actionPayload(input, true)) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Gouvernance indisponible pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
};

module.exports._private = { normalizeSupabaseRestUrl, decisionPayload, committeePayload, actionPayload, delegationPayload, itemPayload, votePayload, decisionAssistant, committeeAssistant, percent };
