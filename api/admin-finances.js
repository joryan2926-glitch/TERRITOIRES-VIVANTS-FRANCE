const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const FUNDER_TYPES = new Set(["public", "private", "foundation", "corporate", "individual", "institution", "other"]);
const FUNDER_STATUSES = new Set(["prospect", "active", "paused", "archive"]);
const OPPORTUNITY_TYPES = new Set(["grant", "sponsorship", "call_for_projects", "donation", "public_subsidy", "loan", "other"]);
const OPPORTUNITY_STATUSES = new Set(["veille", "a_qualifier", "eligible", "candidature", "en_attente", "accepte", "refuse", "archive"]);
const APPLICATION_STATUSES = new Set(["brouillon", "a_deposer", "deposee", "en_instruction", "acceptee", "refusee", "archive"]);
const BUDGET_TYPES = new Set(["project", "branch", "national", "action", "grant"]);
const BUDGET_STATUSES = new Set(["draft", "active", "to_review", "closed", "archive"]);
const LINE_TYPES = new Set(["income", "expense"]);
const LINE_STATUSES = new Set(["planned", "confirmed", "spent", "cancelled"]);
const EXPENSE_STATUSES = new Set(["draft", "to_approve", "approved", "paid", "rejected", "archive"]);
const PAYMENT_STATUSES = new Set(["pending", "succeeded", "failed", "refunded", "cancelled"]);
const REPORT_TYPES = new Set(["funder_report", "budget_review", "expense_summary", "grant_report"]);
const REPORT_STATUSES = new Set(["draft", "to_send", "sent", "validated", "archive"]);
const PRIORITY_LEVELS = new Set(["faible", "moyen", "fort", "critique"]);
const RISK_LEVELS = new Set(["faible", "modere", "eleve", "critique"]);

function sendJson(res, statusCode, payload) { res.statusCode = statusCode; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(payload)); }
function clean(value, max = 1200) { if (typeof value !== "string") return ""; return value.replace(/\s+/g, " ").trim().slice(0, max); }
function cleanEnvToken(value, max = 3000) { return clean(value || "", max).replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, ""); }
function cleanEnvUrl(value) { return clean(value || "", 600).replace(/^[`'\",;]+|[`'\",;]+$/g, ""); }
function normalizeSupabaseRestUrl(rawUrl) { const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$/, ""); if (!cleaned) return ""; return cleaned.endsWith("/rest/v1") ? cleaned : `${cleaned}/rest/v1`; }
async function readJsonBody(req) { let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 120 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 }); } if (!body) return {}; try { return JSON.parse(body); } catch { throw Object.assign(new Error("JSON invalide."), { statusCode: 400 }); } }
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
function money(value, fallback = 0) { const num = Number(value); return Number.isFinite(num) ? Math.round(num * 100) / 100 : fallback; }
function nullableMoney(value) { const num = Number(value); return Number.isFinite(num) ? Math.round(num * 100) / 100 : null; }
function dateValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString(); }
function arrayValue(value, maxItems = 16) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 180)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 1800).split(/[;\n]/).map((item) => clean(item, 180)).filter(Boolean).slice(0, maxItems); }
function compactPayload(fields, input, partial, defaults = []) { const payload = {}; Object.entries(fields).forEach(([key, value]) => { if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) { if (value !== "" && value !== undefined) payload[key] = value; else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null; } }); return payload; }

function deadlineScore(deadlineAt) {
  if (!deadlineAt) return 0;
  const days = Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return 22;
  if (days <= 7) return 28;
  if (days <= 30) return 18;
  if (days <= 90) return 8;
  return 0;
}
function opportunityScore(input) {
  let score = 25;
  const status = clean(input.status || "", 80);
  const amount = Math.max(money(input.amount_max, 0), money(input.amount_min, 0), money(input.requested_amount, 0));
  if (["eligible", "candidature", "en_attente"].includes(status)) score += 18;
  if (status === "a_qualifier") score += 10;
  if (amount >= 50000) score += 20; else if (amount >= 10000) score += 12; else if (amount >= 1000) score += 5;
  score += deadlineScore(input.deadline_at || input.deadline);
  return Math.max(0, Math.min(100, score));
}
function budgetHealth(budget = {}, lines = [], expenses = []) {
  const plannedIncome = money(budget.planned_income, 0) || lines.filter((l) => l.line_type === "income").reduce((sum, l) => sum + money(l.planned_amount, 0), 0);
  const plannedExpenses = money(budget.planned_expenses, 0) || lines.filter((l) => l.line_type === "expense").reduce((sum, l) => sum + money(l.planned_amount, 0), 0);
  const spent = money(budget.spent_amount, 0) || expenses.filter((e) => !["rejected", "archive"].includes(e.status)).reduce((sum, e) => sum + money(e.amount, 0), 0);
  const committed = money(budget.committed_expenses, 0) || expenses.filter((e) => ["to_approve", "approved", "paid"].includes(e.status)).reduce((sum, e) => sum + money(e.amount, 0), 0);
  const ratio = plannedExpenses > 0 ? Math.round((spent / plannedExpenses) * 100) : 0;
  const alerts = [];
  if (plannedExpenses > 0 && spent > plannedExpenses) alerts.push("budget_depasse");
  if (plannedIncome < plannedExpenses) alerts.push("recettes_insuffisantes");
  if (committed > plannedExpenses) alerts.push("engagements_superieurs_budget");
  return { planned_income: plannedIncome, planned_expenses: plannedExpenses, spent_amount: spent, committed_expenses: committed, execution_ratio: ratio, remaining_amount: Math.round((plannedExpenses - spent) * 100) / 100, alerts };
}
function assistantForBudget(budget = {}, lines = [], expenses = []) {
  const health = budgetHealth(budget, lines, expenses);
  const missing = [];
  if (!budget.period_start || !budget.period_end) missing.push("periode");
  if (!lines.length && !money(budget.planned_expenses, 0)) missing.push("lignes budgetaires");
  if (health.alerts.includes("budget_depasse")) missing.push("arbitrage depassement");
  return { ...health, missing_fields: missing, risk_level: health.alerts.includes("budget_depasse") ? "critique" : health.alerts.length ? "eleve" : budget.risk_level || "modere", summary: budget.ai_summary || `${budget.budget_name || "Budget"} - ${health.execution_ratio}% execute, reste ${health.remaining_amount} EUR.` };
}
function assistantForExpense(expense = {}) {
  const missing = [];
  if (!expense.receipt_document_id) missing.push("justificatif");
  if (!expense.budget_id) missing.push("budget");
  if (["to_approve", "approved"].includes(expense.status) && !expense.approved_by) missing.push("validateur");
  return { missing_fields: missing, requires_receipt: !expense.receipt_document_id, suggested_status: missing.includes("justificatif") ? "to_approve" : expense.status || "draft", summary: expense.ai_summary || `${expense.label || "Depense"} - ${money(expense.amount, 0)} ${expense.currency || "EUR"}, statut ${expense.status || "draft"}.` };
}
function assistantForReport(report = {}, expenses = []) {
  const missing = arrayValue(report.missing_documents || "");
  const required = arrayValue(report.required_documents || "");
  return { missing_documents: missing, required_documents: required, expenses_count: expenses.length, suggested_status: missing.length ? "draft" : "to_send", summary: report.ai_summary || `${report.report_title || "Reporting"} - ${required.length} piece(s) attendue(s), ${missing.length} manquante(s).` };
}

function funderPayload(input, partial = false) {
  const type = clean(input.funder_type || "", 80) || (!partial ? "other" : "");
  const status = clean(input.status || "", 80) || (!partial ? "prospect" : "");
  const priority = clean(input.priority_level || "", 80) || (!partial ? "moyen" : "");
  validateEnum(FUNDER_TYPES, type, "Type de financeur invalide.");
  validateEnum(FUNDER_STATUSES, status, "Statut financeur invalide.");
  validateEnum(PRIORITY_LEVELS, priority, "Priorite financeur invalide.");
  const fields = { organization_id: validateUuid(input.organization_id || "", "Organisation"), contact_id: validateUuid(input.contact_id || "", "Contact"), funder_name: clean(input.funder_name || input.label || "", 260), funder_type: type, status, priority_level: priority, territory_label: clean(input.territory_label || "", 180), contact_email: clean(input.contact_email || "", 220), website: clean(input.website || input.url || "", 700), notes: clean(input.notes || input.summary || "", 2400), tags: arrayValue(input.tags || ""), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.funder_name) throw Object.assign(new Error("Nom du financeur requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["funder_type", "status", "priority_level"]);
}
function opportunityPayload(input, partial = false) {
  const type = clean(input.opportunity_type || "", 80) || (!partial ? "grant" : "");
  const status = clean(input.status || "", 80) || (!partial ? "veille" : "");
  validateEnum(OPPORTUNITY_TYPES, type, "Type d'appel a projets invalide.");
  validateEnum(OPPORTUNITY_STATUSES, status, "Statut d'appel a projets invalide.");
  const fields = { funder_id: validateUuid(input.funder_id || "", "Financeur"), opportunity_key: clean(input.opportunity_key || "", 120), title: clean(input.title || input.label || "", 280), opportunity_type: type, status, amount_min: nullableMoney(input.amount_min), amount_max: nullableMoney(input.amount_max), deadline_at: dateValue(input.deadline_at), url: clean(input.url || "", 700), territory_label: clean(input.territory_label || "", 180), eligibility_notes: clean(input.eligibility_notes || input.notes || "", 2600), restrictions: clean(input.restrictions || "", 1600), ai_summary: clean(input.ai_summary || input.summary || "", 1200), priority_score: opportunityScore({ ...input, status }) };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de financement requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["opportunity_type", "status", "priority_score"]);
}
function applicationPayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  validateEnum(APPLICATION_STATUSES, status, "Statut candidature invalide.");
  const fields = { opportunity_id: validateUuid(input.opportunity_id || "", "Opportunite"), funder_id: validateUuid(input.funder_id || "", "Financeur"), branch_id: validateUuid(input.branch_id || "", "Antenne"), related_project_id: validateUuid(input.related_project_id || "", "Projet"), related_case_id: validateUuid(input.related_case_id || "", "Dossier"), application_title: clean(input.application_title || input.title || "", 280), requested_amount: money(input.requested_amount, 0), granted_amount: nullableMoney(input.granted_amount), status, deadline_at: dateValue(input.deadline_at), submitted_at: dateValue(input.submitted_at), decision_at: dateValue(input.decision_at), reporting_due_at: dateValue(input.reporting_due_at), owner_name: clean(input.owner_name || "", 180), notes: clean(input.notes || input.summary || "", 2600), ai_summary: clean(input.ai_summary || "", 1200) };
  if (!partial && !fields.application_title) throw Object.assign(new Error("Titre de demande requis."), { statusCode: 400 });
  if (!fields.ai_summary && fields.application_title) fields.ai_summary = `${fields.application_title} - demande ${status}, montant demande ${fields.requested_amount} EUR.`;
  return compactPayload(fields, input, partial, ["status", "requested_amount"]);
}
function budgetPayload(input, partial = false) {
  const type = clean(input.budget_type || "", 80) || (!partial ? "project" : "");
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  const risk = clean(input.risk_level || "", 80) || (!partial ? "modere" : "");
  validateEnum(BUDGET_TYPES, type, "Type de budget invalide.");
  validateEnum(BUDGET_STATUSES, status, "Statut budget invalide.");
  validateEnum(RISK_LEVELS, risk, "Risque budget invalide.");
  const fields = { budget_key: clean(input.budget_key || "", 120), branch_id: validateUuid(input.branch_id || "", "Antenne"), related_project_id: validateUuid(input.related_project_id || "", "Projet"), related_case_id: validateUuid(input.related_case_id || "", "Dossier"), budget_name: clean(input.budget_name || input.title || "", 280), budget_type: type, period_start: dateValue(input.period_start), period_end: dateValue(input.period_end), status, planned_income: money(input.planned_income, 0), planned_expenses: money(input.planned_expenses, 0), confirmed_income: money(input.confirmed_income, 0), committed_expenses: money(input.committed_expenses, 0), spent_amount: money(input.spent_amount, 0), currency: clean(input.currency || "EUR", 12).toUpperCase(), risk_level: risk, restrictions: clean(input.restrictions || "", 1600), ai_summary: clean(input.ai_summary || "", 1200), created_by: clean(input.created_by || "TVF OS", 180) };
  if (!partial && !fields.budget_name) throw Object.assign(new Error("Nom du budget requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["budget_type", "status", "risk_level", "currency", "planned_income", "planned_expenses", "confirmed_income", "committed_expenses", "spent_amount"]);
}
function linePayload(input, partial = false) {
  const type = clean(input.line_type || "", 80) || (!partial ? "expense" : "");
  const status = clean(input.status || "", 80) || (!partial ? "planned" : "");
  validateEnum(LINE_TYPES, type, "Type de ligne invalide.");
  validateEnum(LINE_STATUSES, status, "Statut ligne invalide.");
  const fields = { budget_id: validateUuid(input.budget_id || "", "Budget"), line_type: type, category: clean(input.category || "", 160), label: clean(input.label || input.title || "", 280), planned_amount: money(input.planned_amount, 0), confirmed_amount: money(input.confirmed_amount, 0), spent_amount: money(input.spent_amount, 0), funding_source_id: validateUuid(input.funding_source_id || "", "Source financement"), status, notes: clean(input.notes || "", 1600) };
  if (!partial && (!fields.budget_id || !fields.label)) throw Object.assign(new Error("Budget et libelle de ligne requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["line_type", "status", "planned_amount", "confirmed_amount", "spent_amount"]);
}
function expensePayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  validateEnum(EXPENSE_STATUSES, status, "Statut depense invalide.");
  const fields = { budget_id: validateUuid(input.budget_id || "", "Budget"), budget_line_id: validateUuid(input.budget_line_id || "", "Ligne budgetaire"), branch_id: validateUuid(input.branch_id || "", "Antenne"), related_project_id: validateUuid(input.related_project_id || "", "Projet"), expense_date: dateValue(input.expense_date) || new Date().toISOString(), vendor_name: clean(input.vendor_name || "", 220), label: clean(input.label || input.title || "", 280), amount: money(input.amount, 0), currency: clean(input.currency || "EUR", 12).toUpperCase(), tax_amount: money(input.tax_amount, 0), status, payment_method: clean(input.payment_method || "", 120), receipt_document_id: validateUuid(input.receipt_document_id || "", "Justificatif"), approved_by: clean(input.approved_by || "", 180), paid_at: dateValue(input.paid_at), notes: clean(input.notes || input.summary || "", 2200), ai_summary: clean(input.ai_summary || "", 1200) };
  if (!partial && (!fields.label || fields.amount <= 0)) throw Object.assign(new Error("Depense incomplete : libelle et montant requis."), { statusCode: 400 });
  if (!fields.ai_summary && fields.label) fields.ai_summary = `${fields.label} - ${fields.amount} ${fields.currency}, statut ${status}.`;
  return compactPayload(fields, input, partial, ["status", "currency", "amount", "tax_amount"]);
}
function paymentPayload(input, partial = false) {
  const status = clean(input.payment_status || input.status || "", 80) || (!partial ? "pending" : "");
  validateEnum(PAYMENT_STATUSES, status, "Statut paiement invalide.");
  const fields = { provider: clean(input.provider || "manual", 80), provider_payment_id: clean(input.provider_payment_id || "", 220), amount: money(input.amount, 0), currency: clean(input.currency || "EUR", 12).toUpperCase(), payment_status: status, payer_contact_id: validateUuid(input.payer_contact_id || "", "Contact payeur"), payer_organization_id: validateUuid(input.payer_organization_id || "", "Organisation payeur"), related_project_id: validateUuid(input.related_project_id || "", "Projet"), related_branch_id: validateUuid(input.related_branch_id || "", "Antenne"), receipt_document_id: validateUuid(input.receipt_document_id || "", "Recu"), paid_at: dateValue(input.paid_at), notes: clean(input.notes || "", 1600) };
  if (!partial && fields.amount <= 0) throw Object.assign(new Error("Montant du paiement requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["provider", "payment_status", "currency", "amount"]);
}
function reportPayload(input, partial = false) {
  const type = clean(input.report_type || "", 80) || (!partial ? "funder_report" : "");
  const status = clean(input.status || "", 80) || (!partial ? "draft" : "");
  validateEnum(REPORT_TYPES, type, "Type de reporting invalide.");
  validateEnum(REPORT_STATUSES, status, "Statut reporting invalide.");
  const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), related_project_id: validateUuid(input.related_project_id || "", "Projet"), funder_id: validateUuid(input.funder_id || "", "Financeur"), application_id: validateUuid(input.application_id || "", "Demande"), report_title: clean(input.report_title || input.title || "", 280), report_type: type, period_start: dateValue(input.period_start), period_end: dateValue(input.period_end), status, due_at: dateValue(input.due_at), sent_at: dateValue(input.sent_at), summary: clean(input.summary || "", 3200), required_documents: arrayValue(input.required_documents || ""), missing_documents: arrayValue(input.missing_documents || ""), ai_summary: clean(input.ai_summary || "", 1200) };
  if (!partial && !fields.report_title) throw Object.assign(new Error("Titre du reporting requis."), { statusCode: 400 });
  return compactPayload(fields, input, partial, ["report_type", "status"]);
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
  const params = new URLSearchParams({ select: "*", order: options.order || "updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 160), 1), 500)) });
  addFilters(params, url, options);
  return supabaseRequest(`${table}?${params.toString()}`);
}
async function listBudgets(req) { const rows = await listTable(req, "budgets", { statusSet: BUDGET_STATUSES, typeSet: BUDGET_TYPES, typeName: "budget_type", searchColumns: ["budget_name", "ai_summary", "restrictions"] }); return Promise.all((rows || []).map(enrichedBudget)); }
async function listReports(req) { const rows = await listTable(req, "finance_reports", { statusSet: REPORT_STATUSES, typeSet: REPORT_TYPES, typeName: "report_type", searchColumns: ["report_title", "summary", "ai_summary"] }); return Promise.all((rows || []).map(enrichedReport)); }
async function dashboardFinances() {
  const [budgets, expenses, applications, opportunities, reports, payments] = await Promise.all([
    supabaseRequest("budgets?select=id,status,planned_income,planned_expenses,confirmed_income,committed_expenses,spent_amount,risk_level&limit=2000"),
    supabaseRequest("expenses?select=id,status,amount,receipt_document_id&limit=2000"),
    supabaseRequest("funding_applications?select=id,status,requested_amount,granted_amount,deadline_at,reporting_due_at&limit=1000"),
    supabaseRequest("funding_opportunities?select=id,status,priority_score,deadline_at&limit=1000"),
    supabaseRequest("finance_reports?select=id,status,due_at,missing_documents&limit=1000"),
    supabaseRequest("payment_records?select=id,payment_status,amount&limit=1000")
  ]);
  const plannedExpenses = budgets.reduce((sum, b) => sum + money(b.planned_expenses, 0), 0);
  const spent = expenses.filter((e) => !["rejected", "archive"].includes(e.status)).reduce((sum, e) => sum + money(e.amount, 0), 0);
  return { budgets_total: budgets.length, active_budgets: budgets.filter((b) => b.status === "active").length, planned_income: budgets.reduce((sum, b) => sum + money(b.planned_income, 0), 0), planned_expenses: plannedExpenses, spent_amount: spent, execution_ratio: plannedExpenses > 0 ? Math.round((spent / plannedExpenses) * 100) : 0, expenses_to_approve: expenses.filter((e) => e.status === "to_approve").length, missing_receipts: expenses.filter((e) => !e.receipt_document_id && !["rejected", "archive"].includes(e.status)).length, funding_requested: applications.reduce((sum, a) => sum + money(a.requested_amount, 0), 0), funding_granted: applications.reduce((sum, a) => sum + money(a.granted_amount, 0), 0), open_opportunities: opportunities.filter((o) => !["accepte", "refuse", "archive"].includes(o.status)).length, high_priority_opportunities: opportunities.filter((o) => Number(o.priority_score || 0) >= 70).length, reports_due: reports.filter((r) => ["draft", "to_send"].includes(r.status)).length, payments_succeeded: payments.filter((p) => p.payment_status === "succeeded").reduce((sum, p) => sum + money(p.amount, 0), 0) };
}
async function createRecord(table, payload) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function updateRecord(table, id, payload) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function enrichedBudget(row) {
  if (!row?.id) return row;
  const [lines, expenses] = await Promise.all([
    supabaseRequest(`budget_lines?${new URLSearchParams({ select: "*", budget_id: `eq.${row.id}`, limit: "250" }).toString()}`),
    supabaseRequest(`expenses?${new URLSearchParams({ select: "*", budget_id: `eq.${row.id}`, limit: "250" }).toString()}`)
  ]);
  return { ...row, lines: lines || [], expenses: expenses || [], assistant: assistantForBudget(row, lines || [], expenses || []) };
}
async function enrichedReport(row) {
  if (!row?.related_project_id) return { ...row, assistant: assistantForReport(row, []) };
  const expenses = await supabaseRequest(`expenses?${new URLSearchParams({ select: "*", related_project_id: `eq.${row.related_project_id}`, limit: "250" }).toString()}`);
  return { ...row, assistant: assistantForReport(row, expenses || []) };
}
async function generateReport(input) {
  const budgetId = validateUuid(input.budget_id || "", "Budget");
  const applicationId = validateUuid(input.application_id || "", "Demande");
  const title = clean(input.report_title || input.title || "Reporting financeur TVF", 280);
  const required = arrayValue(input.required_documents || "Budget;Depenses;Justificatifs;Indicateurs");
  let budget = null; let expenses = []; let application = null;
  if (budgetId) {
    const budgets = await supabaseRequest(`budgets?${new URLSearchParams({ select: "*", id: `eq.${budgetId}`, limit: "1" }).toString()}`);
    budget = budgets?.[0] || null;
    expenses = await supabaseRequest(`expenses?${new URLSearchParams({ select: "*", budget_id: `eq.${budgetId}`, limit: "250" }).toString()}`);
  }
  if (applicationId) {
    const apps = await supabaseRequest(`funding_applications?${new URLSearchParams({ select: "*", id: `eq.${applicationId}`, limit: "1" }).toString()}`);
    application = apps?.[0] || null;
  }
  const missing = [];
  if (!budget) missing.push("budget");
  if ((expenses || []).some((e) => !e.receipt_document_id && !["rejected", "archive"].includes(e.status))) missing.push("justificatifs");
  const summary = `Reporting genere : ${expenses.length} depense(s), budget ${budget ? budget.budget_name : "non rattache"}, demande ${application ? application.application_title : "non rattachee"}.`;
  const report = await createRecord("finance_reports", reportPayload({ report_title: title, report_type: "funder_report", status: missing.length ? "draft" : "to_send", application_id: applicationId, funder_id: application?.funder_id || input.funder_id, related_project_id: budget?.related_project_id || application?.related_project_id, branch_id: budget?.branch_id || application?.branch_id, summary, required_documents: required, missing_documents: missing, due_at: input.due_at }));
  return enrichedReport(report);
}

async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "overview", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardFinances() });
      if (entity === "funders") return sendJson(res, 200, { ok: true, funders: await listTable(req, "funders", { statusSet: FUNDER_STATUSES, typeSet: FUNDER_TYPES, typeName: "funder_type", searchColumns: ["funder_name", "notes", "territory_label"] }) });
      if (entity === "opportunities") return sendJson(res, 200, { ok: true, opportunities: await listTable(req, "funding_opportunities", { order: "priority_score.desc,updated_at.desc", statusSet: OPPORTUNITY_STATUSES, typeSet: OPPORTUNITY_TYPES, typeName: "opportunity_type", searchColumns: ["title", "eligibility_notes", "territory_label"] }) });
      if (entity === "applications") return sendJson(res, 200, { ok: true, applications: await listTable(req, "funding_applications", { statusSet: APPLICATION_STATUSES, searchColumns: ["application_title", "notes", "owner_name"] }) });
      if (entity === "budgets") return sendJson(res, 200, { ok: true, budgets: await listBudgets(req) });
      if (entity === "lines") return sendJson(res, 200, { ok: true, lines: await listTable(req, "budget_lines", { statusSet: LINE_STATUSES, typeSet: LINE_TYPES, typeName: "line_type", searchColumns: ["label", "category", "notes"] }) });
      if (entity === "expenses") return sendJson(res, 200, { ok: true, expenses: (await listTable(req, "expenses", { statusSet: EXPENSE_STATUSES, searchColumns: ["label", "vendor_name", "notes"] }) || []).map((e) => ({ ...e, assistant: assistantForExpense(e) })) });
      if (entity === "payments") return sendJson(res, 200, { ok: true, payments: await listTable(req, "payment_records", { statusSet: PAYMENT_STATUSES, typeSet: null, searchColumns: ["provider", "provider_payment_id", "notes"] }) });
      if (entity === "reports") return sendJson(res, 200, { ok: true, reports: await listReports(req) });
      return sendJson(res, 200, { ok: true, dashboard: await dashboardFinances(), budgets: await listBudgets(req), expenses: (await listTable(req, "expenses", { statusSet: EXPENSE_STATUSES, searchColumns: ["label", "vendor_name", "notes"] }) || []).map((e) => ({ ...e, assistant: assistantForExpense(e) })) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "budget", 80);
    if (req.method === "POST") {
      if (type === "funder") return sendJson(res, 201, { ok: true, funder: await createRecord("funders", funderPayload(data)) });
      if (type === "opportunity") return sendJson(res, 201, { ok: true, opportunity: await createRecord("funding_opportunities", opportunityPayload(data)) });
      if (type === "application") return sendJson(res, 201, { ok: true, application: await createRecord("funding_applications", applicationPayload(data)) });
      if (type === "budget") return sendJson(res, 201, { ok: true, budget: await enrichedBudget(await createRecord("budgets", budgetPayload(data))) });
      if (type === "line") return sendJson(res, 201, { ok: true, line: await createRecord("budget_lines", linePayload(data)) });
      if (type === "expense") return sendJson(res, 201, { ok: true, expense: { ...(await createRecord("expenses", expensePayload(data))), assistant: assistantForExpense(expensePayload(data)) } });
      if (type === "payment") return sendJson(res, 201, { ok: true, payment: await createRecord("payment_records", paymentPayload(data)) });
      if (type === "report") return sendJson(res, 201, { ok: true, report: await enrichedReport(await createRecord("finance_reports", reportPayload(data))) });
      if (type === "generate_report") return sendJson(res, 201, { ok: true, report: await generateReport(data) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(data.id || "", "Element");
      if (!id) throw Object.assign(new Error("Element requis."), { statusCode: 400 });
      if (type === "funder") return sendJson(res, 200, { ok: true, funder: await updateRecord("funders", id, funderPayload(data, true)) });
      if (type === "opportunity") return sendJson(res, 200, { ok: true, opportunity: await updateRecord("funding_opportunities", id, opportunityPayload(data, true)) });
      if (type === "application") return sendJson(res, 200, { ok: true, application: await updateRecord("funding_applications", id, applicationPayload(data, true)) });
      if (type === "budget") return sendJson(res, 200, { ok: true, budget: await enrichedBudget(await updateRecord("budgets", id, budgetPayload(data, true))) });
      if (type === "line") return sendJson(res, 200, { ok: true, line: await updateRecord("budget_lines", id, linePayload(data, true)) });
      if (type === "expense") return sendJson(res, 200, { ok: true, expense: { ...(await updateRecord("expenses", id, expensePayload(data, true))), assistant: assistantForExpense(data) } });
      if (type === "payment") return sendJson(res, 200, { ok: true, payment: await updateRecord("payment_records", id, paymentPayload(data, true)) });
      if (type === "report") return sendJson(res, 200, { ok: true, report: await enrichedReport(await updateRecord("finance_reports", id, reportPayload(data, true))) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Finances indisponibles pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}

module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, opportunityScore, budgetHealth, assistantForBudget, assistantForExpense, assistantForReport, funderPayload, opportunityPayload, applicationPayload, budgetPayload, linePayload, expensePayload, paymentPayload, reportPayload };
