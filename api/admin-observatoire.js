const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const SOURCE_TYPES = new Set(["public_data", "internal", "partner", "field", "press", "funding", "legal", "map", "other"]);
const RELIABILITY_LEVELS = new Set(["faible", "moyen", "fort", "officiel"]);
const REFRESH_FREQUENCIES = new Set(["ponctuelle", "mensuelle", "trimestrielle", "annuelle"]);
const SOURCE_STATUSES = new Set(["active", "a_verifier", "archive"]);
const CONFIDENTIALITY_LEVELS = new Set(["public", "interne", "confidentiel", "sensible"]);
const INDICATOR_TYPES = new Set(["logements_vacants", "commerces_vacants", "friches", "materiaux", "insertion", "partenaires", "financement", "risques", "population", "autre"]);
const TRENDS = new Set(["hausse", "stable", "baisse", "inconnu"]);
const PRIORITY_LEVELS = new Set(["faible", "moyen", "fort", "critique"]);
const INDICATOR_STATUSES = new Set(["brouillon", "valide", "a_reviser", "archive"]);
const DIAGNOSTIC_STATUSES = new Set(["brouillon", "a_valider", "valide", "en_revision", "archive"]);
const MATURITY_LEVELS = new Set(["idee", "prefiguration", "lancement", "operationnelle", "confirmee"]);
const WATCH_TYPES = new Set(["appel_a_projet", "actualite", "dispositif", "donnee_publique", "risque", "partenaire", "autre"]);
const WATCH_STATUSES = new Set(["a_qualifier", "utile", "ignore", "archive"]);

function sendJson(res, statusCode, payload) { res.statusCode = statusCode; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(payload)); }
function clean(value, max = 1200) { if (typeof value !== "string") return ""; return value.replace(/\s+/g, " ").trim().slice(0, max); }
function cleanEnvToken(value, max = 3000) { return clean(value || "", max).replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, ""); }
function cleanEnvUrl(value) { return clean(value || "", 600).replace(/^[`'\",;]+|[`'\",;]+$/g, ""); }
function normalizeSupabaseRestUrl(rawUrl) { const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$/, ""); if (!cleaned) return ""; return cleaned.endsWith("/rest/v1") ? cleaned : `${cleaned}/rest/v1`; }
async function readJsonBody(req) { let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 100 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 }); } if (!body) return {}; try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); } }
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
function normalizeForMatch(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function validateEnum(set, value, message) { if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 }); }
function validateUuid(value, label = "Identifiant") { const cleaned = clean(value || "", 80); if (cleaned && !/^[0-9a-f-]{32,36}$/i.test(cleaned)) throw Object.assign(new Error(`${label} invalide.`), { statusCode: 400 }); return cleaned || null; }
function numberValue(value, fallback = null) { const num = Number(value); return Number.isFinite(num) ? num : fallback; }
function arrayValue(value, maxItems = 12) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 160)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 1400).split(/[;\n]/).map((item) => clean(item, 160)).filter(Boolean).slice(0, maxItems); }
function dateValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString(); }

function inferIndicatorType(input) {
  const text = normalizeForMatch([input.indicator_type, input.label, input.summary, input.notes].join(" "));
  if (/commerce|boutique|cellule/.test(text)) return "commerces_vacants";
  if (/friche|terrain/.test(text)) return "friches";
  if (/materiau|reemploi|stock/.test(text)) return "materiaux";
  if (/insertion|benevole|mission|emploi/.test(text)) return "insertion";
  if (/partenaire|collectivite|association|entreprise/.test(text)) return "partenaires";
  if (/financement|subvention|appel a projet|mecenat/.test(text)) return "financement";
  if (/risque|alerte|contrainte/.test(text)) return "risques";
  if (/population|habitant|demographie/.test(text)) return "population";
  return "logements_vacants";
}
function priorityScore(input) {
  let score = 25;
  const priority = clean(input.priority_level || "", 80);
  const trend = clean(input.trend || "", 80);
  const value = numberValue(input.value_numeric, null);
  if (priority === "critique") score += 38; else if (priority === "fort") score += 28; else if (priority === "moyen") score += 12;
  if (trend === "hausse") score += 10;
  if (["risques", "friches", "logements_vacants", "commerces_vacants"].includes(clean(input.indicator_type || inferIndicatorType(input), 80))) score += 8;
  if (value != null && value > 50) score += 8;
  if (clean(input.status || "") === "a_reviser") score += 6;
  return Math.max(0, Math.min(100, score));
}
function dataQualityScore({ sources = [], indicators = [] }) {
  let score = 20;
  score += Math.min(35, sources.filter((s) => ["officiel", "fort"].includes(s.reliability_level)).length * 9);
  score += Math.min(35, indicators.filter((i) => i.status === "valide").length * 7);
  score += sources.some((s) => s.last_checked_at) ? 10 : 0;
  return Math.max(0, Math.min(100, score));
}
function assistantForDiagnostic(row, indicators = [], sources = [], watchItems = []) {
  const missing = [];
  if (!row.summary) missing.push("synthese");
  if (!indicators.length) missing.push("indicateurs");
  if (!sources.length) missing.push("sources");
  if (!row.next_review_at) missing.push("prochaine revue");
  const quality = row.data_quality_score ?? dataQualityScore({ sources, indicators });
  const highIndicators = indicators.filter((i) => Number(i.priority_score || 0) >= 70);
  return {
    missing_fields: missing,
    data_quality_score: quality,
    priority_score: row.priority_score ?? Math.max(0, ...highIndicators.map((i) => Number(i.priority_score || 0)), 35),
    suggested_status: missing.length ? "a_valider" : "valide",
    opportunities_count: Array.isArray(row.opportunities) ? row.opportunities.length : 0,
    watch_to_qualify: watchItems.filter((item) => item.status === "a_qualifier").length,
    summary: row.ai_summary || `${row.territory_label || "Territoire"} - ${highIndicators.length} priorite(s) territoriale(s) fortes a arbitrer.`
  };
}
function sourcePayload(input, partial = false) {
  const sourceType = clean(input.source_type || "", 80) || (!partial ? "public_data" : "");
  const reliability = clean(input.reliability_level || "", 80) || (!partial ? "moyen" : "");
  const frequency = clean(input.refresh_frequency || "", 80) || (!partial ? "trimestrielle" : "");
  const status = clean(input.status || "", 80) || (!partial ? "a_verifier" : "");
  const confidentiality = clean(input.confidentiality_level || "", 80) || (!partial ? "interne" : "");
  validateEnum(SOURCE_TYPES, sourceType, "Type de source invalide.");
  validateEnum(RELIABILITY_LEVELS, reliability, "Fiabilite invalide.");
  validateEnum(REFRESH_FREQUENCIES, frequency, "Frequence invalide.");
  validateEnum(SOURCE_STATUSES, status, "Statut source invalide.");
  validateEnum(CONFIDENTIALITY_LEVELS, confidentiality, "Confidentialite invalide.");
  const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), source_key: clean(input.source_key || "", 120), source_name: clean(input.source_name || input.label || "", 260), source_type: sourceType, territory_label: clean(input.territory_label || "", 180), url: clean(input.url || "", 700), reliability_level: reliability, refresh_frequency: frequency, last_checked_at: dateValue(input.last_checked_at), next_check_at: dateValue(input.next_check_at), status, notes: clean(input.notes || "", 2400), tags: arrayValue(input.tags || ""), confidentiality_level: confidentiality, created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.source_name) throw Object.assign(new Error("Nom de source requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["source_type", "reliability_level", "refresh_frequency", "status", "confidentiality_level"]);
}
function indicatorPayload(input, partial = false) {
  const type = clean(input.indicator_type || "", 80) || (!partial ? inferIndicatorType(input) : "");
  const trend = clean(input.trend || "", 80) || (!partial ? "inconnu" : "");
  const priority = clean(input.priority_level || "", 80) || (!partial ? "moyen" : "");
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  validateEnum(INDICATOR_TYPES, type, "Type d'indicateur invalide.");
  validateEnum(TRENDS, trend, "Tendance invalide.");
  validateEnum(PRIORITY_LEVELS, priority, "Priorite invalide.");
  validateEnum(INDICATOR_STATUSES, status, "Statut indicateur invalide.");
  const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), indicator_key: clean(input.indicator_key || "", 120), territory_label: clean(input.territory_label || "", 180), indicator_type: type, label: clean(input.label || "", 260), value_numeric: numberValue(input.value_numeric, null), value_text: clean(input.value_text || "", 300), unit: clean(input.unit || "", 80), period_label: clean(input.period_label || "", 120), source_id: validateUuid(input.source_id || "", "Source"), trend, priority_level: priority, confidence: Math.max(0, Math.min(1, numberValue(input.confidence, 0.5))), status, ai_summary: clean(input.ai_summary || "", 1000) };
  if (!partial && (!fields.territory_label || !fields.label)) throw Object.assign(new Error("Territoire et libelle requis."), { statusCode: 400 });
  fields.priority_score = priorityScore({ ...input, indicator_type: type, trend, priority_level: priority, status });
  if (!fields.ai_summary && fields.label) fields.ai_summary = `${fields.label} - ${fields.territory_label}, priorite ${fields.priority_score}.`;
  return compactPayload(fields, input, partial, ["indicator_type", "trend", "priority_level", "status", "confidence"]);
}
function diagnosticPayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  const maturity = clean(input.maturity_level || "", 80) || (!partial ? "prefiguration" : "");
  validateEnum(DIAGNOSTIC_STATUSES, status, "Statut diagnostic invalide.");
  validateEnum(MATURITY_LEVELS, maturity, "Maturite invalide.");
  const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), diagnostic_key: clean(input.diagnostic_key || "", 120), territory_label: clean(input.territory_label || "", 180), status, maturity_level: maturity, summary: clean(input.summary || "", 4000), opportunities: arrayValue(input.opportunities || ""), risks: arrayValue(input.risks || ""), recommended_actions: arrayValue(input.recommended_actions || ""), map_readiness_score: Math.max(0, Math.min(100, numberValue(input.map_readiness_score, 0))), data_quality_score: Math.max(0, Math.min(100, numberValue(input.data_quality_score, 0))), priority_score: Math.max(0, Math.min(100, numberValue(input.priority_score, 35))), validated_by: clean(input.validated_by || "", 180), validated_at: dateValue(input.validated_at), next_review_at: dateValue(input.next_review_at), ai_summary: clean(input.ai_summary || "", 1000) };
  if (!partial && !fields.territory_label) throw Object.assign(new Error("Territoire requis."), { statusCode: 400 });
  if (!fields.ai_summary && fields.territory_label) fields.ai_summary = `${fields.territory_label} - diagnostic territorial ${status}.`;
  return compactPayload(fields, input, partial, ["status", "maturity_level", "map_readiness_score", "data_quality_score", "priority_score"]);
}
function watchPayload(input, partial = false) {
  const type = clean(input.watch_type || "", 80) || (!partial ? "actualite" : "");
  const status = clean(input.status || "", 80) || (!partial ? "a_qualifier" : "");
  const priority = clean(input.opportunity_level || input.priority_level || "", 80) || (!partial ? "moyen" : "");
  validateEnum(WATCH_TYPES, type, "Type de veille invalide.");
  validateEnum(WATCH_STATUSES, status, "Statut veille invalide.");
  validateEnum(PRIORITY_LEVELS, priority, "Niveau d'opportunite invalide.");
  const fields = { source_id: validateUuid(input.source_id || "", "Source"), territory_label: clean(input.territory_label || "", 180), title: clean(input.title || input.label || "", 260), watch_type: type, status, opportunity_level: priority, due_at: dateValue(input.due_at), url: clean(input.url || "", 700), summary: clean(input.summary || "", 2200), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de veille requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["watch_type", "status", "opportunity_level"]);
}
function compactPayload(fields, input, partial, defaults = []) {
  const payload = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) {
      if (value !== "" && value !== undefined) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  return payload;
}

async function listSources(req) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order: "updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 500)) }); addFilters(params, url, { statusSet: SOURCE_STATUSES, typeSet: SOURCE_TYPES, typeName: "source_type", searchColumns: ["source_name", "notes", "territory_label"] }); return supabaseRequest(`territorial_sources?${params.toString()}`); }
async function listIndicators(req) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order: "priority_score.desc,updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 160), 1), 500)) }); addFilters(params, url, { statusSet: INDICATOR_STATUSES, typeSet: INDICATOR_TYPES, typeName: "indicator_type", searchColumns: ["label", "ai_summary", "territory_label", "value_text"] }); return supabaseRequest(`territorial_indicators?${params.toString()}`); }
async function listDiagnostics(req) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order: "priority_score.desc,updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 300)) }); addFilters(params, url, { statusSet: DIAGNOSTIC_STATUSES, typeSet: null, typeName: "", searchColumns: ["territory_label", "summary", "ai_summary"] }); const rows = await supabaseRequest(`territorial_diagnostics?${params.toString()}`); return rows || []; }
async function listWatch(req) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 300)) }); addFilters(params, url, { statusSet: WATCH_STATUSES, typeSet: WATCH_TYPES, typeName: "watch_type", searchColumns: ["title", "summary", "territory_label"] }); return supabaseRequest(`territorial_watch_items?${params.toString()}`); }
function addFilters(params, url, { statusSet, typeSet, typeName, searchColumns = [] }) {
  const q = clean(url.searchParams.get("q") || "", 160).replace(/[*,()]/g, " ");
  const territory = clean(url.searchParams.get("territory_label") || "", 180).replace(/[*,()]/g, " ");
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("type") || "", 80);
  if (status && status !== "all" && statusSet?.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && typeSet?.has(type)) params.set(typeName, `eq.${type}`);
  if (territory) params.set("territory_label", `ilike.*${territory}*`);
  if (q && searchColumns.length) params.set("or", `(${searchColumns.map((column) => `${column}.ilike.*${q}*`).join(",")})`);
}
async function dashboardObservatoire() {
  const [sources, indicators, diagnostics, watchItems] = await Promise.all([
    supabaseRequest("territorial_sources?select=id,status,reliability_level,last_checked_at,next_check_at,territory_label&limit=2000"),
    supabaseRequest("territorial_indicators?select=id,status,indicator_type,priority_level,priority_score,territory_label&limit=2000"),
    supabaseRequest("territorial_diagnostics?select=id,status,priority_score,data_quality_score,territory_label&limit=1000"),
    supabaseRequest("territorial_watch_items?select=id,status,watch_type,opportunity_level,territory_label&limit=1000")
  ]);
  const territories = new Set([...(sources || []), ...(indicators || []), ...(diagnostics || []), ...(watchItems || [])].map((item) => item.territory_label).filter(Boolean));
  return { sources_total: sources.length, sources_to_verify: sources.filter((s) => s.status === "a_verifier").length, official_sources: sources.filter((s) => s.reliability_level === "officiel").length, indicators_total: indicators.length, high_priorities: indicators.filter((i) => Number(i.priority_score || 0) >= 70).length, diagnostics_total: diagnostics.length, diagnostics_to_validate: diagnostics.filter((d) => d.status === "a_valider").length, watch_to_qualify: watchItems.filter((w) => w.status === "a_qualifier").length, territories_total: territories.size, by_indicator_type: Object.fromEntries([...INDICATOR_TYPES].map((type) => [type, indicators.filter((i) => i.indicator_type === type).length])) };
}
async function createRecord(table, payload) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function updateRecord(table, id, payload) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function createDiagnosticFromIndicators(input) {
  const territory = clean(input.territory_label || "", 180);
  if (!territory) throw Object.assign(new Error("Territoire requis pour generer un diagnostic."), { statusCode: 400 });
  const [indicators, sources, watchItems] = await Promise.all([
    supabaseRequest(`territorial_indicators?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "200" }).toString()}`),
    supabaseRequest(`territorial_sources?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "120" }).toString()}`),
    supabaseRequest(`territorial_watch_items?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "120" }).toString()}`)
  ]);
  const quality = dataQualityScore({ sources, indicators });
  const maxPriority = Math.max(35, ...(indicators || []).map((i) => Number(i.priority_score || 0)));
  const high = (indicators || []).filter((i) => Number(i.priority_score || 0) >= 70).map((i) => i.label).slice(0, 6);
  const payload = diagnosticPayload({ territory_label: territory, status: quality >= 65 ? "a_valider" : "brouillon", summary: `Diagnostic genere depuis ${indicators.length} indicateur(s), ${sources.length} source(s) et ${watchItems.length} element(s) de veille.`, opportunities: high.length ? high : ["Qualifier les donnees territoriales prioritaires"], risks: quality < 50 ? ["Qualite de donnees insuffisante"] : [], recommended_actions: ["Verifier les sources", "Arbitrer les priorites", "Rattacher les points cartographiques utiles"], data_quality_score: quality, priority_score: maxPriority, map_readiness_score: Math.min(100, sources.length * 10 + indicators.length * 8) });
  const diagnostic = await createRecord("territorial_diagnostics", payload);
  return { ...diagnostic, assistant: assistantForDiagnostic(diagnostic, indicators, sources, watchItems) };
}
async function enrichedDiagnostic(row) {
  if (!row) return row;
  const territory = clean(row.territory_label || "", 180);
  const [indicators, sources, watchItems] = await Promise.all([
    territory ? supabaseRequest(`territorial_indicators?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "200" }).toString()}`) : [],
    territory ? supabaseRequest(`territorial_sources?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "120" }).toString()}`) : [],
    territory ? supabaseRequest(`territorial_watch_items?${new URLSearchParams({ select: "*", territory_label: `ilike.*${territory}*`, limit: "120" }).toString()}`) : []
  ]);
  return { ...row, assistant: assistantForDiagnostic(row, indicators || [], sources || [], watchItems || []) };
}

async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "overview", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardObservatoire() });
      if (entity === "sources") return sendJson(res, 200, { ok: true, sources: await listSources(req) });
      if (entity === "indicators") return sendJson(res, 200, { ok: true, indicators: await listIndicators(req) });
      if (entity === "diagnostics") return sendJson(res, 200, { ok: true, diagnostics: await Promise.all((await listDiagnostics(req)).map(enrichedDiagnostic)) });
      if (entity === "watch") return sendJson(res, 200, { ok: true, watch: await listWatch(req) });
      return sendJson(res, 200, { ok: true, dashboard: await dashboardObservatoire(), sources: await listSources(req), indicators: await listIndicators(req), diagnostics: await Promise.all((await listDiagnostics(req)).map(enrichedDiagnostic)), watch: await listWatch(req) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "source", 80);
    if (req.method === "POST") {
      if (type === "source") return sendJson(res, 201, { ok: true, source: await createRecord("territorial_sources", sourcePayload(data)) });
      if (type === "indicator") return sendJson(res, 201, { ok: true, indicator: await createRecord("territorial_indicators", indicatorPayload(data)) });
      if (type === "diagnostic") return sendJson(res, 201, { ok: true, diagnostic: await enrichedDiagnostic(await createRecord("territorial_diagnostics", diagnosticPayload(data))) });
      if (type === "watch") return sendJson(res, 201, { ok: true, watch_item: await createRecord("territorial_watch_items", watchPayload(data)) });
      if (type === "diagnostic_from_indicators") return sendJson(res, 201, { ok: true, diagnostic: await createDiagnosticFromIndicators(data) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(data.id || "", "Element");
      if (!id) throw Object.assign(new Error("Element requis."), { statusCode: 400 });
      if (type === "source") return sendJson(res, 200, { ok: true, source: await updateRecord("territorial_sources", id, sourcePayload(data, true)) });
      if (type === "indicator") return sendJson(res, 200, { ok: true, indicator: await updateRecord("territorial_indicators", id, indicatorPayload(data, true)) });
      if (type === "diagnostic") return sendJson(res, 200, { ok: true, diagnostic: await enrichedDiagnostic(await updateRecord("territorial_diagnostics", id, diagnosticPayload(data, true))) });
      if (type === "watch") return sendJson(res, 200, { ok: true, watch_item: await updateRecord("territorial_watch_items", id, watchPayload(data, true)) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Observatoire indisponible pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}

module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, inferIndicatorType, priorityScore, dataQualityScore, assistantForDiagnostic, sourcePayload, indicatorPayload, diagnosticPayload, watchPayload };
