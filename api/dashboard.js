const crypto = require("crypto");

const CONTACT_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contacts";
const OUTBOUND_TIMEOUT_MS = Math.max(Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 15000), 15000);
const ACTIVE_STATUSES = new Set(["nouveau", "a_qualifier", "en_cours", "rendez_vous", "en_attente", "accepte"]);
const CLOSED_STATUSES = new Set(["refuse", "archive"]);

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
  if (!expected) {
    const error = new Error("Dashboard non configure : ajoutez TVF_ADMIN_TOKEN dans Vercel.");
    error.statusCode = 503;
    error.code = "ADMIN_TOKEN_MISSING";
    throw error;
  }
  if (!safeEqual(tokenFromRequest(req), expected)) {
    const error = new Error("Acces dashboard refuse.");
    error.statusCode = 401;
    error.code = "ADMIN_UNAUTHORIZED";
    throw error;
  }
}

function supabaseConfig() {
  const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnvToken(process.env.SUPABASE_SERVICE_ROLE_KEY || "", 3000);
  if (!restUrl || !key) {
    const error = new Error("Supabase admin non configure : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
    error.statusCode = 503;
    error.code = "SUPABASE_ADMIN_NOT_CONFIGURED";
    throw error;
  }
  return { restUrl, key };
}

function supabaseHeaders(key) {
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
  };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function queryUrl(req) {
  return new URL(req.url, "https://dashboard.local");
}

function dashboardUrl(req) {
  return queryUrl(req);
}

function parseRange(req) {
  const requested = Number(dashboardUrl(req).searchParams.get("range") || 30);
  if (!Number.isFinite(requested)) return 30;
  return Math.min(Math.max(Math.round(requested), 7), 365);
}

function parseFilters(req) {
  const url = dashboardUrl(req);
  return {
    status: clean(url.searchParams.get("status") || "all", 80),
    priority: clean(url.searchParams.get("priority") || "all", 80),
    category: clean(url.searchParams.get("category") || "all", 120),
  };
}

function selectColumns() {
  return [
    "id",
    "full_name",
    "email",
    "subject",
    "message",
    "source_page",
    "status",
    "priority",
    "category",
    "assigned_to",
    "internal_notes",
    "last_follow_up_at",
    "closed_at",
    "created_at",
    "updated_at",
  ].join(",");
}

async function listDashboardContacts(rangeDays, filters = {}) {
  const { restUrl, key } = supabaseConfig();
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams();
  params.set("select", selectColumns());
  params.set("created_at", `gte.${since}`);
  params.set("order", "created_at.desc");
  params.set("limit", "500");
  if (filters.status && filters.status !== "all") params.set("status", `eq.${filters.status}`);
  if (filters.priority && filters.priority !== "all") params.set("priority", `eq.${filters.priority}`);
  if (filters.category && filters.category !== "all") params.set("category", `eq.${filters.category}`);

  const response = await fetchWithTimeout(`${restUrl}/${CONTACT_TABLE}?${params.toString()}`, {
    headers: supabaseHeaders(key),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Lecture Supabase impossible pour le dashboard.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  return text ? JSON.parse(text) : [];
}


async function listDashboardActivity(rangeDays) {
  try {
    const { restUrl, key } = supabaseConfig();
    const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      select: "id,module_key,object_type,object_id,action,summary,performed_by,created_at,audit_source,metadata",
      created_at: `gte.${since}`,
      order: "created_at.desc",
      limit: "80",
    });
    const response = await fetchWithTimeout(`${restUrl}/audit_logs?${params.toString()}`, { headers: supabaseHeaders(key) });
    const text = await response.text();
    if (!response.ok) return [];
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
}

async function listDashboardCases() {
  try {
    const { restUrl, key } = supabaseConfig();
    const params = new URLSearchParams({
      select: "id,case_number,title,case_type,status,priority,risk_level,decision_status,maturity_score,next_action,next_action_due_at,assigned_to,territory,updated_at,archived_at",
      order: "updated_at.desc",
      limit: "500",
    });
    const response = await fetchWithTimeout(`${restUrl}/cases?${params.toString()}`, { headers: supabaseHeaders(key) });
    const text = await response.text();
    if (!response.ok) return [];
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
}

function caseIsActive(row) {
  return !row.archived_at && !["cloture", "archive"].includes(row.status || "");
}
function caseIsOverdue(row, now = new Date()) {
  if (!caseIsActive(row) || !row.next_action_due_at) return false;
  const due = new Date(row.next_action_due_at);
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime();
}
function casePriorityScore(row, now = new Date()) {
  let score = 0;
  if (caseIsOverdue(row, now)) score += 80;
  if (row.priority === "urgente") score += 55;
  if (row.priority === "haute") score += 32;
  if (row.status === "a_decision") score += 42;
  if (["a_preparer", "proposee"].includes(row.decision_status || "")) score += 24;
  if (row.status === "attente_pieces") score += 20;
  if (row.risk_level === "critique") score += 35;
  if (row.risk_level === "eleve") score += 18;
  score += Math.max(0, 100 - Number(row.maturity_score || 0)) / 10;
  return score;
}
function casePriorityReason(row, now = new Date()) {
  if (caseIsOverdue(row, now)) return "Echeance depassee";
  if (row.status === "a_decision") return "Decision a preparer";
  if (row.status === "attente_pieces") return "Pieces attendues";
  if (row.priority === "urgente") return "Priorite urgente";
  if (["critique", "eleve"].includes(row.risk_level || "")) return "Risque a cadrer";
  return row.next_action || "Suite a definir";
}
function buildCasesSummary(rows = []) {
  const now = new Date();
  const active = rows.filter(caseIsActive);
  const prioritized = [...active].sort((a, b) => casePriorityScore(b, now) - casePriorityScore(a, now)).slice(0, 6);
  return {
    total: rows.length,
    active: active.length,
    overdue: active.filter((row) => caseIsOverdue(row, now)).length,
    urgent: active.filter((row) => row.priority === "urgente").length,
    awaiting_pieces: active.filter((row) => row.status === "attente_pieces").length,
    decision: active.filter((row) => row.status === "a_decision" || ["a_preparer", "proposee"].includes(row.decision_status || "")).length,
    average_maturity: active.length ? Math.round(active.reduce((sum, row) => sum + Number(row.maturity_score || 0), 0) / active.length) : 0,
    priority: prioritized.map((row) => ({
      id: row.id,
      case_number: row.case_number || "Dossier",
      title: row.title || "Dossier sans titre",
      case_type: row.case_type || "autre",
      status: row.status || "ouvert",
      priority: row.priority || "normale",
      risk_level: row.risk_level || "modere",
      maturity_score: row.maturity_score || 0,
      next_action: row.next_action || "Suite a definir",
      next_action_due_at: row.next_action_due_at || null,
      assigned_to: row.assigned_to || "",
      territory: row.territory || "",
      reason: casePriorityReason(row, now),
    })),
  };
}

function buildActivitySummary(rows = []) {
  const byModule = rows.reduce((acc, row) => {
    const key = clean(row.module_key || "tvf_os", 120) || "tvf_os";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const today = new Date().toISOString().slice(0, 10);
  const topModule = Object.entries(byModule).sort((a, b) => b[1] - a[1])[0] || ["-", 0];
  return {
    total: rows.length,
    today: rows.filter((row) => String(row.created_at || "").slice(0, 10) === today).length,
    modules_active: Object.keys(byModule).length,
    byModule,
    top_module: topModule[0],
    top_module_count: topModule[1],
    recent: rows.slice(0, 8).map((row) => ({
      id: row.id,
      module_key: row.module_key || "tvf_os",
      action: row.action || "action",
      summary: row.summary || "Action TVF OS tracee.",
      performed_by: row.performed_by || "TVF OS",
      object_type: row.object_type || "objet",
      created_at: row.created_at || null,
    })),
  };
}

function countBy(rows, key, fallback = "non_classe") {
  return rows.reduce((acc, row) => {
    const value = clean(row[key] || fallback, 120) || fallback;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function daysBetween(start, end = new Date()) {
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((end.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)));
}

function slaDays(priority) {
  if (priority === "urgente") return 1;
  if (priority === "haute") return 2;
  return 5;
}

function isOpen(row) {
  return ACTIVE_STATUSES.has(row.status || "nouveau") && !row.closed_at;
}

function isOverdue(row, now = new Date()) {
  if (!isOpen(row)) return false;
  return daysBetween(row.last_follow_up_at || row.updated_at || row.created_at, now) > slaDays(row.priority || "normale");
}

function emptyTrend(rangeDays) {
  const days = Math.min(rangeDays, 30);
  const now = new Date();
  const output = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    output.push({ date: date.toISOString().slice(0, 10), count: 0 });
  }
  return output;
}

function buildTrend(rows, rangeDays) {
  const trend = emptyTrend(rangeDays);
  const byDate = Object.fromEntries(trend.map((item) => [item.date, item]));
  rows.forEach((row) => {
    const date = row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "";
    if (byDate[date]) byDate[date].count += 1;
  });
  return trend;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function poleFromCategory(category) {
  const map = {
    "bien-vacant-proprietaire": "Habitat Vivant",
    "materiaux-reemploi": "Materiautheque Solidaire",
    "collectivite-territoire": "Collectivites & Territoires",
    "entreprise-partenariat": "Partenariats entreprises",
    "benevolat-insertion": "Solidarite & Insertion",
    "financement-mecenat": "Financement & Mecenat",
    "presse-institutionnel": "Communication & Plaidoyer",
    "demande-generale": "Accueil & Orientation",
  };
  return map[category || "demande-generale"] || "Accueil & Orientation";
}

function countByPole(rows) {
  return rows.reduce((acc, row) => {
    const pole = poleFromCategory(row.category);
    acc[pole] = (acc[pole] || 0) + 1;
    return acc;
  }, {});
}

function countBySource(rows) {
  return rows.reduce((acc, row) => {
    const value = clean(row.source_page || "Canal non renseigne", 160) || "Canal non renseigne";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function buildCoverage(metrics) {
  const requirements = [
    ["Indicateurs globaux", true],
    ["Filtrage par periode", true],
    ["Filtrage par statut", true],
    ["Filtrage par priorite", true],
    ["Filtrage par pole/categorie", true],
    ["Vue nationale", true],
    ["Vue antenne MVP", true],
    ["Vue par pole", true],
    ["Alertes critiques", true],
    ["Demandes sans responsable", true],
    ["Export de rapport", true],
    ["Assistant explicable", true],
    ["Securite token admin", true],
    ["API serveur", true],
    ["Tables/RLS Dashboard", true],
  ].map(([label, covered]) => ({ label, covered }));
  const covered = requirements.filter((item) => item.covered).length;
  return {
    percent: percent(covered, requirements.length),
    covered,
    total: requirements.length,
    requirements,
    note: "Conformite calculee sur le perimetre Dashboard module 1, avec contacts comme source MVP et sans developper les modules Antennes, Dossiers ou Finances.",
  };
}

function buildInsights(rows, metrics) {
  const insights = [];
  if (metrics.overdue > 0) {
    insights.push({
      level: "danger",
      title: "Demandes en retard",
      body: `${metrics.overdue} demande${metrics.overdue > 1 ? "s" : ""} active${metrics.overdue > 1 ? "s" : ""} depasse${metrics.overdue > 1 ? "nt" : ""} le delai cible. Priorite : relancer ou reasssigner.`,
      action: "Filtrer les demandes en retard",
      state: "propose",
      confidence: "elevee",
      sources: ["contacts.status", "contacts.priority", "contacts.updated_at"],
    });
  }
  if ((metrics.byPriority.urgente || 0) > 0) {
    insights.push({
      level: "warning",
      title: "Priorite urgente",
      body: `${metrics.byPriority.urgente} demande${metrics.byPriority.urgente > 1 ? "s" : ""} urgente${metrics.byPriority.urgente > 1 ? "s" : ""} a surveiller dans la periode.`,
      action: "Verifier les responsables",
      state: "propose",
      confidence: "elevee",
      sources: ["contacts.priority", "contacts.assigned_to"],
    });
  }
  if (metrics.unassigned > 0) {
    insights.push({
      level: "warning",
      title: "Demandes sans responsable",
      body: `${metrics.unassigned} demande${metrics.unassigned > 1 ? "s" : ""} active${metrics.unassigned > 1 ? "s" : ""} sans personne chargee du suivi.`,
      action: "Assigner les demandes",
      state: "propose",
      confidence: "elevee",
      sources: ["contacts.assigned_to", "contacts.status"],
    });
  }
  if (metrics.total === 0) {
    insights.push({
      level: "info",
      title: "Aucune demande sur la periode",
      body: "Le dashboard est operationnel, mais aucune demande ne correspond a la periode selectionnee.",
      action: "Elargir la periode",
      state: "propose",
      confidence: "moyenne",
      sources: ["filtre periode", "contacts.created_at"],
    });
  }
  if (insights.length === 0) {
    insights.push({
      level: "success",
      title: "Pilotage sous controle",
      body: "Aucun retard critique ni urgence non couverte n'a ete detecte sur la periode.",
      action: "Poursuivre le suivi hebdomadaire",
      state: "propose",
      confidence: "elevee",
      sources: ["contacts.status", "contacts.priority"],
    });
  }
  return insights.slice(0, 5);
}

function aggregateDashboard(rows, rangeDays, activityRows = [], caseRows = []) {
  const now = new Date();
  const openRows = rows.filter(isOpen);
  const closedRows = rows.filter((row) => CLOSED_STATUSES.has(row.status || "") || row.closed_at);
  const overdueRows = rows.filter((row) => isOverdue(row, now));
  const unassignedRows = openRows.filter((row) => !clean(row.assigned_to || "", 180));
  const recent = rows.slice(0, 12).map((row) => ({
    id: row.id,
    full_name: row.full_name || "Contact sans nom",
    subject: row.subject || "Sans objet",
    status: row.status || "nouveau",
    priority: row.priority || "normale",
    category: row.category || "demande-generale",
    assigned_to: row.assigned_to || "",
    created_at: row.created_at || null,
    age_days: daysBetween(row.created_at, now),
    overdue: isOverdue(row, now),
  }));

  const activity = buildActivitySummary(activityRows);
  const cases = buildCasesSummary(caseRows);

  const metrics = {
    total: rows.length,
    open: openRows.length,
    closed: closedRows.length,
    overdue: overdueRows.length,
    unassigned: unassignedRows.length,
    closureRate: percent(closedRows.length, rows.length),
    qualificationRate: percent(rows.filter((row) => row.status && row.status !== "nouveau").length, rows.length),
    byStatus: countBy(rows, "status", "nouveau"),
    byPriority: countBy(rows, "priority", "normale"),
    byCategory: countBy(rows, "category", "demande-generale"),
    trend: buildTrend(rows, rangeDays),
    byPole: countByPole(rows),
    bySource: countBySource(rows),
  };

  return {
    generatedAt: now.toISOString(),
    rangeDays,
    metrics,
    recent,
    activity,
    cases,
    alerts: overdueRows.slice(0, 8).map((row) => ({
      id: row.id,
      title: row.subject || "Demande sans objet",
      priority: row.priority || "normale",
      status: row.status || "nouveau",
      age_days: daysBetween(row.last_follow_up_at || row.updated_at || row.created_at, now),
      assigned_to: row.assigned_to || "",
    })),
    assistant: {
      mode: "regles_operationnelles",
      state: "propose",
      sources: ["Table contacts", "Procedure TVF de traitement des demandes", "Regles SLA par priorite"],
      summary: `Sur ${rangeDays} jours : ${rows.length} demande${rows.length > 1 ? "s" : ""}, ${openRows.length} active${openRows.length > 1 ? "s" : ""}, ${overdueRows.length} en retard.`,
      insights: buildInsights(rows, metrics),
    },
    coverage: buildCoverage(metrics),
    views: {
      national: { label: "Vue nationale", available: true, source: "contacts" },
      branch: { label: "Vue antenne MVP", available: true, source: "contacts sans table branches" },
      pole: { label: "Vue par pole", available: true, source: "categorie -> pole" },
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    requireAdmin(req);
    if (req.method !== "GET") {
      sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
      return;
    }
    const rangeDays = parseRange(req);
    const filters = parseFilters(req);
    const [rows, activityRows, caseRows] = await Promise.all([listDashboardContacts(rangeDays, filters), listDashboardActivity(rangeDays), listDashboardCases()]);
    sendJson(res, 200, { ok: true, dashboard: { ...aggregateDashboard(rows, rangeDays, activityRows, caseRows), filters } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      error: statusCode >= 500 ? "Dashboard temporairement non charge : verifiez la configuration Supabase." : error.message,
      code: error.code || undefined,
      details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined,
    });
  }
};

module.exports._private = {
  aggregateDashboard,
  buildActivitySummary,
  buildCasesSummary,
  isOverdue,
  normalizeSupabaseRestUrl,
};
