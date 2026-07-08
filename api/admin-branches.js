const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const BRANCH_STATUSES = new Set(["prefiguration", "launching", "operational", "paused", "closed", "archive"]);
const MATURITY_LEVELS = new Set(["idee", "prefiguration", "lancement", "operationnelle", "confirmee", "formatrice"]);
const VALIDATION_STATUSES = new Set(["draft", "to_review", "validated", "rejected", "suspended"]);
const CHECKLIST_STATUSES = new Set(["todo", "in_progress", "blocked", "done", "waived"]);
const TEAM_STATUSES = new Set(["invited", "active", "paused", "left", "archive"]);
const TRAINING_STATUSES = new Set(["todo", "in_progress", "done", "waived"]);
const POLE_STATUSES = new Set(["planned", "active", "paused", "archive"]);
const PRIORITIES = new Set(["faible", "moyen", "fort", "critique"]);

const DEFAULT_CHECKLIST = [
  ["responsable_identifie", "Responsable local identifie", "gouvernance", "critique"],
  ["territoire_defini", "Territoire d'intervention defini", "territoire", "fort"],
  ["kit_lancement", "Kit de lancement transmis", "documents", "fort"],
  ["crm_initial", "CRM local initialise", "outils", "fort"],
  ["premier_comite", "Premier comite local planifie", "gouvernance", "critique"],
  ["formation_initiale", "Formation initiale realisee", "formation", "fort"],
  ["partenaires_prioritaires", "Partenaires prioritaires identifies", "partenariats", "moyen"],
  ["reporting_national", "Reporting national configure", "pilotage", "moyen"],
];
const DEFAULT_TRAINING = [
  ["formation_tvf_os", "Prise en main TVF OS"],
  ["procedure_demandes", "Traitement des demandes entrantes"],
  ["conformite_donnees", "Confidentialite et donnees personnelles"],
  ["kit_partenaires", "Presentation TVF aux partenaires locaux"],
];

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
function dateValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10); }
function arrayValue(value, maxItems = 18) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 180)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 2000).split(/[;\n]/).map((item) => clean(item, 180)).filter(Boolean).slice(0, maxItems); }
function compactPayload(fields, input, partial, defaults = []) { const payload = {}; Object.entries(fields).forEach(([key, value]) => { if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) { if (value !== "" && value !== undefined) payload[key] = value; else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null; } }); return payload; }
function percent(done, total) { if (!total) return 0; return Math.round((done / total) * 100); }

function branchPayload(input, partial = false) {
  const status = clean(input.status || "", 80) || (!partial ? "prefiguration" : "");
  const maturity = clean(input.maturity_level || "", 80) || (!partial ? "idee" : "");
  const validation = clean(input.national_validation_status || "", 80) || (!partial ? "draft" : "");
  const territoryType = clean(input.territory_type || "", 80) || (!partial ? "city" : "");
  validateEnum(BRANCH_STATUSES, status, "Statut antenne invalide.");
  validateEnum(MATURITY_LEVELS, maturity, "Niveau de maturite invalide.");
  validateEnum(VALIDATION_STATUSES, validation, "Statut de validation invalide.");
  validateEnum(new Set(["city", "intermunicipality", "department", "region", "multi_territory", "national"]), territoryType, "Type de territoire invalide.");
  const name = clean(input.name || input.branch_name || "", 260);
  const fields = {
    code: clean(input.code || "", 80).toUpperCase(), name, territory_name: clean(input.territory_name || name || "", 260), territory_type: territoryType,
    city: clean(input.city || "", 160), department: clean(input.department || "", 120), region: clean(input.region || "", 120), status,
    maturity_level: maturity, national_validation_status: validation, responsible_name: clean(input.responsible_name || "", 180), responsible_email: clean(input.responsible_email || "", 220), responsible_phone: clean(input.responsible_phone || "", 80), launch_date: dateValue(input.launch_date), target_launch_date: dateValue(input.target_launch_date), legal_host: clean(input.legal_host || "", 220), workspace_url: clean(input.workspace_url || "", 700), description: clean(input.description || "", 3000), needs: arrayValue(input.needs || ""), risks: arrayValue(input.risks || ""), next_actions: arrayValue(input.next_actions || ""), ai_summary: clean(input.ai_summary || "", 1200), created_by: clean(input.created_by || "TVF OS", 180)
  };
  if (!partial && !fields.name) throw Object.assign(new Error("Nom d'antenne requis."), { statusCode: 400 });
  if (!partial && !fields.code) fields.code = `TVF-${fields.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase().slice(0, 42) || "ANTENNE"}`;
  return compactPayload(fields, input, partial, ["status", "maturity_level", "national_validation_status", "territory_type"]);
}
function polePayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "planned" : ""); validateEnum(POLE_STATUSES, status, "Statut pole invalide."); const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), pole_id: validateUuid(input.pole_id || "", "Pole"), pole_key: clean(input.pole_key || "", 120), status, referent_name: clean(input.referent_name || "", 180), referent_email: clean(input.referent_email || "", 220), activated_at: input.activated_at ? new Date(input.activated_at).toISOString() : (status === "active" && !partial ? new Date().toISOString() : null), objectives: clean(input.objectives || "", 1800) }; if (!partial && !fields.branch_id) throw Object.assign(new Error("Antenne requise."), { statusCode: 400 }); if (!partial && !fields.pole_key) throw Object.assign(new Error("Pole requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status"]); }
function checklistPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "todo" : ""); const priority = clean(input.priority_level || "", 80) || (!partial ? "moyen" : ""); validateEnum(CHECKLIST_STATUSES, status, "Statut checklist invalide."); validateEnum(PRIORITIES, priority, "Priorite invalide."); const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), item_key: clean(input.item_key || "", 120), label: clean(input.label || "", 260), category: clean(input.category || "general", 120), status, priority_level: priority, due_date: dateValue(input.due_date), completed_at: status === "done" ? (input.completed_at ? new Date(input.completed_at).toISOString() : new Date().toISOString()) : null, completed_by: clean(input.completed_by || "", 180), evidence_document_id: validateUuid(input.evidence_document_id || "", "Document"), notes: clean(input.notes || "", 1800) }; if (!partial && (!fields.branch_id || !fields.item_key || !fields.label)) throw Object.assign(new Error("Antenne, cle et libelle requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status", "priority_level"]); }
function teamPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "invited" : ""); validateEnum(TEAM_STATUSES, status, "Statut membre invalide."); const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), full_name: clean(input.full_name || "", 220), email: clean(input.email || "", 220), role_label: clean(input.role_label || "Membre antenne", 180), pole_key: clean(input.pole_key || "", 120), status, availability: clean(input.availability || "", 180), skills: arrayValue(input.skills || ""), onboarded_at: input.onboarded_at ? new Date(input.onboarded_at).toISOString() : (status === "active" && !partial ? new Date().toISOString() : null), notes: clean(input.notes || "", 1600) }; if (!partial && (!fields.branch_id || !fields.full_name)) throw Object.assign(new Error("Antenne et nom du membre requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status"]); }
function trainingPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "todo" : ""); validateEnum(TRAINING_STATUSES, status, "Statut formation invalide."); const score = Math.max(0, Math.min(100, Number(input.score || 0))); const fields = { branch_id: validateUuid(input.branch_id || "", "Antenne"), training_key: clean(input.training_key || "", 120), title: clean(input.title || "", 260), status, assigned_to: clean(input.assigned_to || "", 180), due_date: dateValue(input.due_date), completed_at: status === "done" ? (input.completed_at ? new Date(input.completed_at).toISOString() : new Date().toISOString()) : null, score: Number.isFinite(score) ? score : 0, notes: clean(input.notes || "", 1600) }; if (!partial && (!fields.branch_id || !fields.training_key || !fields.title)) throw Object.assign(new Error("Antenne, cle et titre requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status", "score"]); }

function branchAssistant(branch, checklist = [], team = [], training = [], poles = []) {
  const doneChecklist = checklist.filter((item) => ["done", "waived"].includes(item.status)).length;
  const activeTeam = team.filter((item) => item.status === "active").length;
  const doneTraining = training.filter((item) => ["done", "waived"].includes(item.status)).length;
  const activePoles = poles.filter((item) => item.status === "active").length;
  const checklistScore = percent(doneChecklist, checklist.length);
  const trainingScore = percent(doneTraining, training.length);
  const teamScore = Math.min(100, activeTeam * 25);
  const polesScore = Math.min(100, activePoles * 25);
  const readinessScore = Math.round(checklistScore * 0.4 + trainingScore * 0.2 + teamScore * 0.2 + polesScore * 0.2);
  const blockers = checklist.filter((item) => item.status === "blocked" || item.priority_level === "critique" && item.status !== "done").map((item) => item.label).slice(0, 5);
  const suggestedMaturity = readinessScore >= 90 ? "confirmee" : readinessScore >= 72 ? "operationnelle" : readinessScore >= 45 ? "lancement" : branch.status === "prefiguration" ? "prefiguration" : "idee";
  return {
    readiness_score: readinessScore,
    checklist_score: checklistScore,
    training_score: trainingScore,
    active_team: activeTeam,
    active_poles: activePoles,
    blockers,
    suggested_maturity: suggestedMaturity,
    summary: `${branch.name || "Antenne"} : ${readinessScore}% de preparation, ${activeTeam} membre(s) actif(s), ${activePoles} pole(s) actif(s).`,
    next_actions: blockers.length ? blockers.map((label) => `Debloquer : ${label}`) : ["Planifier le prochain point national", "Mettre a jour les indicateurs locaux"],
  };
}
function enrichBranches(branches = [], checklist = [], team = [], training = [], poles = []) { return branches.map((branch) => ({ ...branch, assistant: branchAssistant(branch, checklist.filter((i) => i.branch_id === branch.id), team.filter((i) => i.branch_id === branch.id), training.filter((i) => i.branch_id === branch.id), poles.filter((i) => i.branch_id === branch.id)) })); }

function addFilters(params, url) { const status = clean(url.searchParams.get("status") || "", 80); const maturity = clean(url.searchParams.get("maturity") || "", 80); const q = clean(url.searchParams.get("q") || "", 180).replace(/[*,()]/g, " "); if (status && status !== "all" && BRANCH_STATUSES.has(status)) params.set("status", `eq.${status}`); if (maturity && maturity !== "all" && MATURITY_LEVELS.has(maturity)) params.set("maturity_level", `eq.${maturity}`); if (q) params.set("or", `(name.ilike.*${q}*,code.ilike.*${q}*,territory_name.ilike.*${q}*,city.ilike.*${q}*,department.ilike.*${q}*,region.ilike.*${q}*)`); }
async function listBranches(req) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order: "updated_at.desc", limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 160), 1), 500)) }); addFilters(params, url); const branches = await supabaseRequest(`branches?${params.toString()}`) || []; const ids = branches.map((b) => b.id); if (!ids.length) return []; const filter = `branch_id=in.(${ids.join(",")})`; const [checklist, team, training, poles] = await Promise.all([supabaseRequest(`branch_launch_checklist_items?select=*&${filter}&limit=1000`), supabaseRequest(`branch_team_members?select=*&${filter}&limit=1000`), supabaseRequest(`branch_training_items?select=*&${filter}&limit=1000`), supabaseRequest(`branch_poles?select=*&${filter}&limit=1000`)]); return enrichBranches(branches, checklist || [], team || [], training || [], poles || []); }
async function listEntity(req, table, order = "updated_at.desc") { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order, limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 260), 1), 800)) }); const branchId = validateUuid(url.searchParams.get("branch_id") || "", "Antenne"); if (branchId) params.set("branch_id", `eq.${branchId}`); return supabaseRequest(`${table}?${params.toString()}`); }
async function dashboard() { const [branches, checklist, team, training, poles] = await Promise.all([supabaseRequest("branches?select=*&limit=500"), supabaseRequest("branch_launch_checklist_items?select=*&limit=2000"), supabaseRequest("branch_team_members?select=*&limit=2000"), supabaseRequest("branch_training_items?select=*&limit=2000"), supabaseRequest("branch_poles?select=*&limit=2000")]); const enriched = enrichBranches(branches || [], checklist || [], team || [], training || [], poles || []); const avgReadiness = percent(enriched.reduce((sum, item) => sum + (item.assistant.readiness_score || 0), 0), Math.max(enriched.length, 1) * 100); return { total: enriched.length, launching: enriched.filter((b) => b.status === "launching").length, operational: enriched.filter((b) => b.status === "operational").length, validated: enriched.filter((b) => b.national_validation_status === "validated").length, blocked_items: (checklist || []).filter((i) => i.status === "blocked").length, active_team: (team || []).filter((i) => i.status === "active").length, active_poles: (poles || []).filter((i) => i.status === "active").length, average_readiness: avgReadiness, alerts: enriched.filter((b) => b.assistant.blockers.length || b.assistant.readiness_score < 45).slice(0, 8).map((b) => ({ branch_id: b.id, branch_name: b.name, readiness_score: b.assistant.readiness_score, blockers: b.assistant.blockers })), assistant: { summary: `${enriched.length} antenne(s), ${avgReadiness}% de preparation moyenne, ${(checklist || []).filter((i) => i.status === "blocked").length} blocage(s).`, priorities: enriched.flatMap((b) => b.assistant.next_actions.map((action) => ({ branch_id: b.id, branch_name: b.name, action }))).slice(0, 8) } }; }
async function createRecord(table, payload) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function updateRecord(table, id, payload) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function createDefaultLaunchItems(branchId) { const due = new Date(); return Promise.all(DEFAULT_CHECKLIST.map(([item_key, label, category, priority], index) => createRecord("branch_launch_checklist_items", { branch_id: branchId, item_key, label, category, priority_level: priority, status: "todo", due_date: new Date(due.getTime() + (index + 1) * 7 * 86400000).toISOString().slice(0, 10) }).catch(() => null))); }
async function createDefaultTraining(branchId) { return Promise.all(DEFAULT_TRAINING.map(([training_key, title], index) => createRecord("branch_training_items", { branch_id: branchId, training_key, title, status: "todo", due_date: new Date(Date.now() + (index + 2) * 7 * 86400000).toISOString().slice(0, 10), score: 0 }).catch(() => null))); }
async function createBranch(input) { const branch = await createRecord("branches", branchPayload(input)); await Promise.all([createDefaultLaunchItems(branch.id), createDefaultTraining(branch.id)]); return branch; }
async function generateLaunchPack(branchId) { const branches = await supabaseRequest(`branches?${new URLSearchParams({ select: "*", id: `eq.${branchId}`, limit: "1" }).toString()}`); const branch = branches?.[0]; if (!branch) throw Object.assign(new Error("Antenne introuvable."), { statusCode: 404 }); const [checklist, team, training, poles] = await Promise.all([supabaseRequest(`branch_launch_checklist_items?select=*&branch_id=eq.${branchId}&limit=500`), supabaseRequest(`branch_team_members?select=*&branch_id=eq.${branchId}&limit=500`), supabaseRequest(`branch_training_items?select=*&branch_id=eq.${branchId}&limit=500`), supabaseRequest(`branch_poles?select=*&branch_id=eq.${branchId}&limit=500`)]); const assistant = branchAssistant(branch, checklist || [], team || [], training || [], poles || []); return { branch, assistant, pack: { title: `Pack de lancement - ${branch.name}`, generated_at: new Date().toISOString(), documents: ["Fiche antenne", "Checklist lancement", "Modele mail partenaires", "Plan de formation", "Tableau de bord local"], next_actions: assistant.next_actions, missing_items: assistant.blockers } };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    if (req.method === "GET") {
      const entity = clean(queryUrl(req).searchParams.get("entity") || "dashboard", 80);
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboard() });
      if (entity === "branches") return sendJson(res, 200, { ok: true, branches: await listBranches(req) });
      if (entity === "poles") return sendJson(res, 200, { ok: true, poles: await supabaseRequest("poles?select=*&order=pole_name.asc&limit=200") });
      if (entity === "branch_poles") return sendJson(res, 200, { ok: true, branch_poles: await listEntity(req, "branch_poles") });
      if (entity === "checklist") return sendJson(res, 200, { ok: true, checklist: await listEntity(req, "branch_launch_checklist_items", "created_at.asc") });
      if (entity === "team") return sendJson(res, 200, { ok: true, team: await listEntity(req, "branch_team_members") });
      if (entity === "training") return sendJson(res, 200, { ok: true, training: await listEntity(req, "branch_training_items", "created_at.asc") });
      throw Object.assign(new Error("Entite inconnue."), { statusCode: 400 });
    }
    const input = await readJsonBody(req);
    const type = clean(input.type || "branch", 80);
    if (req.method === "POST") {
      if (type === "branch") return sendJson(res, 201, { ok: true, branch: await createBranch(input) });
      if (type === "pole") return sendJson(res, 201, { ok: true, branch_pole: await createRecord("branch_poles", polePayload(input)) });
      if (type === "checklist") return sendJson(res, 201, { ok: true, checklist_item: await createRecord("branch_launch_checklist_items", checklistPayload(input)) });
      if (type === "team") return sendJson(res, 201, { ok: true, team_member: await createRecord("branch_team_members", teamPayload(input)) });
      if (type === "training") return sendJson(res, 201, { ok: true, training_item: await createRecord("branch_training_items", trainingPayload(input)) });
      if (type === "generate_pack") return sendJson(res, 200, { ok: true, launch_pack: await generateLaunchPack(validateUuid(input.branch_id || "", "Antenne")) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(input.id || "", "Identifiant");
      if (!id) throw Object.assign(new Error("Identifiant requis."), { statusCode: 400 });
      if (type === "branch") return sendJson(res, 200, { ok: true, branch: await updateRecord("branches", id, branchPayload(input, true)) });
      if (type === "pole") return sendJson(res, 200, { ok: true, branch_pole: await updateRecord("branch_poles", id, polePayload(input, true)) });
      if (type === "checklist") return sendJson(res, 200, { ok: true, checklist_item: await updateRecord("branch_launch_checklist_items", id, checklistPayload(input, true)) });
      if (type === "team") return sendJson(res, 200, { ok: true, team_member: await updateRecord("branch_team_members", id, teamPayload(input, true)) });
      if (type === "training") return sendJson(res, 200, { ok: true, training_item: await updateRecord("branch_training_items", id, trainingPayload(input, true)) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Gestion des antennes indisponible pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
};

module.exports._private = { normalizeSupabaseRestUrl, branchPayload, checklistPayload, teamPayload, trainingPayload, polePayload, branchAssistant, percent };
