const crypto = require("crypto");
const { writeAdminAudit } = require("./admin-audit");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const METRIC_TYPES = new Set(["activity", "impact", "finance", "territory", "volunteer", "material", "partner", "case", "other"]);
const METRIC_SCOPES = new Set(["national", "branch", "pole", "project", "case"]);
const METRIC_STATUSES = new Set(["active", "draft", "archive"]);
const VALUE_STATUSES = new Set(["draft", "validated", "rejected", "archive"]);
const PROOF_TYPES = new Set(["document", "photo", "report", "invoice", "attendance", "decision", "external_source", "other"]);
const PROOF_STATUSES = new Set(["pending", "validated", "rejected", "archive"]);
const RELIABILITY_LEVELS = new Set(["faible", "moyen", "fort", "verifie"]);
const REPORT_TYPES = new Set(["national", "branch", "pole", "project", "funder", "public"]);
const REPORT_STATUSES = new Set(["draft", "to_validate", "validated", "published", "archive"]);
const EXPORT_STATUSES = new Set(["queued", "ready", "failed", "expired"]);

function sendJson(res, statusCode, payload) { res.statusCode = statusCode; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(payload)); }
function clean(value, max = 1200) { if (typeof value !== "string") return ""; return value.replace(/\s+/g, " ").trim().slice(0, max); }
function cleanEnvToken(value, max = 3000) { return clean(value || "", max).replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, ""); }
function cleanEnvUrl(value) { return clean(value || "", 600).replace(/^[`'\",;]+|[`'\",;]+$/g, ""); }
function normalizeSupabaseRestUrl(rawUrl) { const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$/, ""); if (!cleaned) return ""; return cleaned.endsWith("/rest/v1") ? cleaned : `${cleaned}/rest/v1`; }
async function readJsonBody(req) { let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 110 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 }); } if (!body) return {}; try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); } }
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
function numberValue(value, fallback = 0) { const num = Number(value); return Number.isFinite(num) ? Math.round(num * 100) / 100 : fallback; }
function dateValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString(); }
function arrayValue(value, maxItems = 18) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 180)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 2000).split(/[;\n]/).map((item) => clean(item, 180)).filter(Boolean).slice(0, maxItems); }
function compactPayload(fields, input, partial, defaults = []) { const payload = {}; Object.entries(fields).forEach(([key, value]) => { if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) { if (value !== "" && value !== undefined) payload[key] = value; else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null; } }); return payload; }

function reliabilityScore(values = [], proofs = []) {
  const validatedValues = values.filter((v) => v.status === "validated");
  const validatedProofs = proofs.filter((p) => p.status === "validated");
  if (!validatedValues.length) return 0;
  let score = Math.min(55, validatedValues.length * 28) + Math.min(40, validatedProofs.length * 32);
  if (validatedValues.every((v) => v.proof_id)) score += 10;
  return Math.max(0, Math.min(100, score));
}
function assistantForMetric(metric = {}, values = [], proofs = []) {
  const validated = values.filter((v) => v.status === "validated");
  const draft = values.filter((v) => v.status === "draft");
  const missing = [];
  if (!validated.length) missing.push("valeurs validees");
  if (!proofs.filter((p) => p.status === "validated").length) missing.push("preuves validees");
  if (!metric.description) missing.push("definition");
  const score = reliabilityScore(values, proofs);
  return { reliability_score: score, validated_count: validated.length, draft_count: draft.length, missing_fields: missing, publishable: score >= 70 && !missing.length, summary: metric.ai_summary || `${metric.metric_name || "Indicateur"} - ${validated.length} valeur(s) validee(s), fiabilite ${score}%.` };
}
function assistantForReport(report = {}, metrics = [], proofs = []) {
  const publishableMetrics = metrics.filter((m) => Number(m.reliability_score || 0) >= 70).length;
  const missingProofs = proofs.filter((p) => p.status !== "validated").length;
  return { publishable_metrics: publishableMetrics, missing_proofs: missingProofs, suggested_status: publishableMetrics && !missingProofs ? "to_validate" : "draft", summary: report.ai_summary || `${report.report_title || "Bilan"} - ${publishableMetrics} indicateur(s) publiable(s), ${missingProofs} preuve(s) a verifier.` };
}
function metricPayload(input, partial = false) {
  const type = clean(input.metric_type || "", 80) || (!partial ? "impact" : "");
  const scope = clean(input.metric_scope || "", 80) || (!partial ? "national" : "");
  const status = clean(input.status || "", 80) || (!partial ? "active" : "");
  validateEnum(METRIC_TYPES, type, "Type d'indicateur invalide.");
  validateEnum(METRIC_SCOPES, scope, "Portee d'indicateur invalide.");
  validateEnum(METRIC_STATUSES, status, "Statut indicateur invalide.");
  const fields = { metric_key: clean(input.metric_key || "", 120), metric_name: clean(input.metric_name || input.label || "", 260), metric_type: type, metric_scope: scope, unit: clean(input.unit || "", 80), description: clean(input.description || input.summary || "", 2400), calculation_method: clean(input.calculation_method || "", 2400), status, required_proof_type: clean(input.required_proof_type || "", 120), ai_summary: clean(input.ai_summary || "", 1000), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.metric_name) throw Object.assign(new Error("Nom de l'indicateur requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["metric_type", "metric_scope", "status"]);
}
function valuePayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  validateEnum(VALUE_STATUSES, status, "Statut de valeur invalide.");
  const fields = { metric_id: validateUuid(input.metric_id || "", "Indicateur"), branch_id: validateUuid(input.branch_id || "", "Antenne"), pole_key: clean(input.pole_key || "", 120), related_project_id: validateUuid(input.related_project_id || "", "Projet"), related_case_id: validateUuid(input.related_case_id || "", "Dossier"), period_start: dateValue(input.period_start), period_end: dateValue(input.period_end), value_numeric: numberValue(input.value_numeric, 0), value_text: clean(input.value_text || "", 300), before_value: numberValue(input.before_value, 0), after_value: numberValue(input.after_value, 0), status, reliability_level: clean(input.reliability_level || "moyen", 80), proof_id: validateUuid(input.proof_id || "", "Preuve"), source_label: clean(input.source_label || "TVF OS", 180), notes: clean(input.notes || input.summary || "", 2200), validated_by: clean(input.validated_by || "", 180), validated_at: dateValue(input.validated_at) };
  validateEnum(RELIABILITY_LEVELS, fields.reliability_level, "Fiabilite invalide.");
  if (!partial && !fields.metric_id) throw Object.assign(new Error("Indicateur requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["status", "reliability_level", "value_numeric", "before_value", "after_value"]);
}
function proofPayload(input, partial = false) {
  const type = clean(input.proof_type || "", 80) || (!partial ? "document" : "");
  const status = clean(input.status || "", 80) || (!partial ? "pending" : "");
  validateEnum(PROOF_TYPES, type, "Type de preuve invalide.");
  validateEnum(PROOF_STATUSES, status, "Statut de preuve invalide.");
  const fields = { proof_title: clean(input.proof_title || input.title || "", 260), proof_type: type, status, document_id: validateUuid(input.document_id || "", "Document"), url: clean(input.url || "", 700), related_object_type: clean(input.related_object_type || "none", 80), related_object_id: validateUuid(input.related_object_id || "", "Objet lie"), confidentiality_level: clean(input.confidentiality_level || "interne", 80), checked_by: clean(input.checked_by || "", 180), checked_at: dateValue(input.checked_at), notes: clean(input.notes || input.summary || "", 2200), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.proof_title) throw Object.assign(new Error("Titre de preuve requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["proof_type", "status", "confidentiality_level"]);
}
function reportPayload(input, partial = false) {
  const type = clean(input.report_type || "", 80) || (!partial ? "national" : "");
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  validateEnum(REPORT_TYPES, type, "Type de bilan invalide.");
  validateEnum(REPORT_STATUSES, status, "Statut de bilan invalide.");
  const fields = { report_title: clean(input.report_title || input.title || "", 280), report_type: type, branch_id: validateUuid(input.branch_id || "", "Antenne"), pole_key: clean(input.pole_key || "", 120), related_project_id: validateUuid(input.related_project_id || "", "Projet"), period_start: dateValue(input.period_start), period_end: dateValue(input.period_end), status, summary: clean(input.summary || "", 4200), metric_ids: arrayValue(input.metric_ids || ""), proof_ids: arrayValue(input.proof_ids || ""), generated_by: clean(input.generated_by || "TVF OS", 180), validated_by: clean(input.validated_by || "", 180), validated_at: dateValue(input.validated_at), ai_summary: clean(input.ai_summary || "", 1200) };
  if (!partial && !fields.report_title) throw Object.assign(new Error("Titre du bilan requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["report_type", "status"]);
}
function exportPayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "queued" : "");
  validateEnum(EXPORT_STATUSES, status, "Statut export invalide.");
  const fields = { export_title: clean(input.export_title || input.title || "", 260), export_format: clean(input.export_format || "csv", 40), status, filters: input.filters && typeof input.filters === "object" ? input.filters : {}, file_url: clean(input.file_url || "", 700), generated_by: clean(input.generated_by || "TVF OS", 180), expires_at: dateValue(input.expires_at) };
  if (!partial && !fields.export_title) throw Object.assign(new Error("Titre d'export requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["status", "export_format"]);
}
function addFilters(params, url, { statusSet, typeSet, typeName, searchColumns = [] }) {
  const q = clean(url.searchParams.get("q") || "", 160).replace(/[*,()]/g, " ");
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("type") || "", 80);
  if (status && status !== "all" && statusSet?.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && typeSet?.has(type)) params.set(typeName, `eq.${type}`);
  if (q && searchColumns.length) params.set("or", `(${searchColumns.map((column) => `${column}.ilike.*${q}*`).join(",")})`);
}
async function listTable(req, table, options = {}) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: "*", order: options.order || "updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 180), 1), 500)) });
  addFilters(params, url, options);
  return supabaseRequest(`${table}?${params.toString()}`);
}
async function enrichedMetric(row) {
  if (!row?.id) return row;
  const [values, proofs] = await Promise.all([
    supabaseRequest(`impact_values?${new URLSearchParams({ select: "*", metric_id: `eq.${row.id}`, limit: "300" }).toString()}`),
    supabaseRequest(`impact_proofs?${new URLSearchParams({ select: "*", limit: "300" }).toString()}`)
  ]);
  return { ...row, values: values || [], assistant: assistantForMetric(row, values || [], proofs || []) };
}
async function dashboardImpact() {
  const [metrics, values, proofs, reports] = await Promise.all([
    supabaseRequest("impact_metrics?select=id,status,metric_type,metric_scope&limit=2000"),
    supabaseRequest("impact_values?select=id,status,value_numeric,metric_id,reliability_level&limit=4000"),
    supabaseRequest("impact_proofs?select=id,status,proof_type&limit=2000"),
    supabaseRequest("impact_reports?select=id,status,report_type&limit=1000")
  ]);
  const validatedValues = values.filter((v) => v.status === "validated");
  return { metrics_total: metrics.length, active_metrics: metrics.filter((m) => m.status === "active").length, validated_values: validatedValues.length, draft_values: values.filter((v) => v.status === "draft").length, proofs_total: proofs.length, validated_proofs: proofs.filter((p) => p.status === "validated").length, pending_proofs: proofs.filter((p) => p.status === "pending").length, reports_total: reports.length, reports_to_validate: reports.filter((r) => r.status === "to_validate").length, publishable_ratio: values.length ? Math.round((validatedValues.length / values.length) * 100) : 0, by_type: Object.fromEntries([...METRIC_TYPES].map((type) => [type, metrics.filter((m) => m.metric_type === type).length])) };
}
async function createRecord(table, payload, req, objectType = table) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); const record = rows?.[0] || null; if (req && record) await writeAdminAudit({ supabaseRequest, req, moduleKey: "impact", action: `create_${objectType}`, objectType, objectId: record.id, summary: `Creation ${objectType} dans Impact.`, metadata: { table, status: record.status || null, metric_id: record.metric_id || null } }); return record; }
async function updateRecord(table, id, payload, req, objectType = table) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); const record = rows?.[0] || null; if (req && record) await writeAdminAudit({ supabaseRequest, req, moduleKey: "impact", action: `update_${objectType}`, objectType, objectId: record.id || id, summary: `Mise a jour ${objectType} dans Impact.`, metadata: { table, status: record.status || payload.status || null, changed_fields: Object.keys(payload || {}) } }); return record; }
async function generateReport(input, req) {
  const title = clean(input.report_title || input.title || "Bilan impact TVF", 280);
  const [metrics, proofs] = await Promise.all([
    supabaseRequest("impact_metrics?select=*&status=eq.active&limit=300"),
    supabaseRequest("impact_proofs?select=*&status=eq.validated&limit=300")
  ]);
  const enriched = await Promise.all((metrics || []).slice(0, 30).map(enrichedMetric));
  const publishable = enriched.filter((m) => m.assistant?.publishable);
  const report = await createRecord("impact_reports", reportPayload({ report_title: title, report_type: input.report_type || "national", status: publishable.length ? "to_validate" : "draft", summary: `Bilan genere depuis ${publishable.length} indicateur(s) publiable(s) et ${proofs.length} preuve(s) validee(s).`, metric_ids: publishable.map((m) => m.id), proof_ids: proofs.map((p) => p.id).slice(0, 60), ai_summary: `Bilan impact pret pour revue : ${publishable.length} indicateur(s) prouve(s).` }), req, "report");
  return { ...report, assistant: assistantForReport(report, publishable, proofs || []) };
}

async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "overview", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardImpact() });
      if (entity === "metrics") return sendJson(res, 200, { ok: true, metrics: await Promise.all((await listTable(req, "impact_metrics", { statusSet: METRIC_STATUSES, typeSet: METRIC_TYPES, typeName: "metric_type", searchColumns: ["metric_name", "description", "ai_summary"] }) || []).map(enrichedMetric)) });
      if (entity === "values") return sendJson(res, 200, { ok: true, values: await listTable(req, "impact_values", { statusSet: VALUE_STATUSES, searchColumns: ["value_text", "source_label", "notes"] }) });
      if (entity === "proofs") return sendJson(res, 200, { ok: true, proofs: await listTable(req, "impact_proofs", { statusSet: PROOF_STATUSES, typeSet: PROOF_TYPES, typeName: "proof_type", searchColumns: ["proof_title", "notes", "url"] }) });
      if (entity === "reports") return sendJson(res, 200, { ok: true, reports: await listTable(req, "impact_reports", { statusSet: REPORT_STATUSES, typeSet: REPORT_TYPES, typeName: "report_type", searchColumns: ["report_title", "summary", "ai_summary"] }) });
      if (entity === "exports") return sendJson(res, 200, { ok: true, exports: await listTable(req, "impact_exports", { statusSet: EXPORT_STATUSES, searchColumns: ["export_title", "file_url"] }) });
      return sendJson(res, 200, { ok: true, dashboard: await dashboardImpact(), metrics: await Promise.all((await listTable(req, "impact_metrics", { statusSet: METRIC_STATUSES, typeSet: METRIC_TYPES, typeName: "metric_type", searchColumns: ["metric_name", "description"] }) || []).map(enrichedMetric)) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "metric", 80);
    if (req.method === "POST") {
      if (type === "metric") return sendJson(res, 201, { ok: true, metric: await enrichedMetric(await createRecord("impact_metrics", metricPayload(data), req, type)) });
      if (type === "value") return sendJson(res, 201, { ok: true, value: await createRecord("impact_values", valuePayload(data), req, type) });
      if (type === "proof") return sendJson(res, 201, { ok: true, proof: await createRecord("impact_proofs", proofPayload(data), req, type) });
      if (type === "report") return sendJson(res, 201, { ok: true, report: await createRecord("impact_reports", reportPayload(data), req, type) });
      if (type === "export") return sendJson(res, 201, { ok: true, export_job: await createRecord("impact_exports", exportPayload(data), req, type) });
      if (type === "generate_report") return sendJson(res, 201, { ok: true, report: await generateReport(data, req) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(data.id || "", "Element");
      if (!id) throw Object.assign(new Error("Element requis."), { statusCode: 400 });
      if (type === "metric") return sendJson(res, 200, { ok: true, metric: await enrichedMetric(await updateRecord("impact_metrics", id, metricPayload(data, true), req, type)) });
      if (type === "value") return sendJson(res, 200, { ok: true, value: await updateRecord("impact_values", id, valuePayload(data, true), req, type) });
      if (type === "proof") return sendJson(res, 200, { ok: true, proof: await updateRecord("impact_proofs", id, proofPayload(data, true), req, type) });
      if (type === "report") return sendJson(res, 200, { ok: true, report: await updateRecord("impact_reports", id, reportPayload(data, true), req, type) });
      if (type === "export") return sendJson(res, 200, { ok: true, export_job: await updateRecord("impact_exports", id, exportPayload(data, true), req, type) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Impact temporairement non charge : vérifiez la configuration Supabase du module." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}

module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, reliabilityScore, assistantForMetric, assistantForReport, metricPayload, valuePayload, proofPayload, reportPayload, exportPayload };
