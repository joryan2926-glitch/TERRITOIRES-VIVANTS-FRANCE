const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const CONTEXT_TYPES = new Set(["none", "request", "case", "document", "procedure", "knowledge", "contact", "organization", "branch", "email"]);
const INTERACTION_TYPES = new Set(["question", "classification", "synthesis", "draft", "search", "risk_alert", "workflow_help", "email_analysis", "other"]);
const SUGGESTION_TYPES = new Set(["classification", "priority", "pole", "responsible", "next_action", "draft_response", "missing_pieces", "checklist", "procedure", "risk", "knowledge", "email_triage", "other"]);
const SUGGESTION_STATUSES = new Set(["proposed", "accepted", "modified", "rejected", "ignored", "applied"]);
const FEEDBACK_TYPES = new Set(["useful", "incorrect", "incomplete", "unsafe", "source_missing", "other"]);
const POLES = [
  "Habitat Vivant",
  "Commerce Vivant",
  "Materiautheque Solidaire",
  "Friches & Terrains Vivants",
  "Solidarite & Insertion",
  "Collectivites & Territoires",
  "Financement & Mecenat",
  "Observatoire & Donnees",
  "Communication & Plaidoyer",
  "Gouvernance & Conformite",
];

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
    if (body.length > 140 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 });
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
async function supabaseRequest(path, options = {}) {
  const { restUrl, key } = supabaseConfig();
  const response = await fetchWithTimeout(`${restUrl}/${path}`, { ...options, headers: supabaseHeaders(key, options.headers || {}) });
  const text = await response.text();
  if (!response.ok) throw Object.assign(new Error("Requete Supabase impossible."), { statusCode: 502, details: text, path });
  return text ? JSON.parse(text) : null;
}
async function optionalSupabaseRequest(path, fallback = []) {
  try { return await supabaseRequest(path); } catch { return fallback; }
}
function queryUrl(req) {
  return new URL(req.url, "https://admin.local");
}
function normalizeForMatch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function keywords(value) {
  return normalizeForMatch(value).split(/[^a-z0-9]+/).filter((word) => word.length > 3).slice(0, 28);
}
function arrayValue(value, max = 30) {
  if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 180)).filter(Boolean).slice(0, max);
  return clean(value || "", 3000).split(/[;,\n]/).map((item) => clean(item, 180)).filter(Boolean).slice(0, max);
}
function validateEnum(set, value, message) {
  if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 });
}
function validateUuid(value, label = "Identifiant") {
  const cleaned = clean(value || "", 80);
  if (cleaned && !/^[0-9a-f-]{32,36}$/i.test(cleaned)) throw Object.assign(new Error(`${label} invalide.`), { statusCode: 400 });
  return cleaned || null;
}
function inferPole(text) {
  const source = normalizeForMatch(text);
  if (/materiau|materiaux|reemploi|stock|mobilier|equipement/.test(source)) return "Materiautheque Solidaire";
  if (/commerce|boutique|rez de chaussee|local commercial/.test(source)) return "Commerce Vivant";
  if (/friche|terrain|foncier|delaisse/.test(source)) return "Friches & Terrains Vivants";
  if (/benevole|habitant|insertion|chantier|association/.test(source)) return "Solidarite & Insertion";
  if (/mairie|commune|metropole|epci|collectivite|territoire/.test(source)) return "Collectivites & Territoires";
  if (/finance|mecene|fondation|subvention|appel a projet|budget/.test(source)) return "Financement & Mecenat";
  if (/presse|media|communication|interview|journaliste/.test(source)) return "Communication & Plaidoyer";
  if (/risque|rgpd|convention|decision|validation|gouvernance/.test(source)) return "Gouvernance & Conformite";
  if (/donnee|carte|observatoire|indicateur|signalement/.test(source)) return "Observatoire & Donnees";
  return "Habitat Vivant";
}
function inferPriority(text) {
  const source = normalizeForMatch(text);
  if (/urgent|danger|securite|expulsion|demain|critique|blocage/.test(source)) return "P1";
  if (/relance|echeance|visite|rendez|signature|financement|partenaire/.test(source)) return "P2";
  return "P3";
}
function inferCategory(text) {
  const source = normalizeForMatch(text);
  if (/materiau|materiaux|reemploi|stock|mobilier/.test(source)) return "materiaux";
  if (/collectivite|mairie|commune|epci|metropole/.test(source)) return "collectivite";
  if (/commerce|boutique|local commercial/.test(source)) return "commerce_inoccupe";
  if (/friche|terrain/.test(source)) return "friche_terrain";
  if (/benevole|mission|insertion/.test(source)) return "benevole";
  if (/financeur|mecene|subvention|fondation/.test(source)) return "financeur";
  if (/presse|journaliste|media/.test(source)) return "presse";
  if (/signalement|observatoire/.test(source)) return "signalement";
  if (/entreprise|rse|don|partenariat/.test(source)) return "entreprise";
  return "bien_vacant";
}
function missingPiecesForCategory(category) {
  return {
    bien_vacant: ["adresse precise", "photos", "autorisation de visite", "contact proprietaire"],
    commerce_inoccupe: ["adresse du local", "surface approximative", "contraintes connues", "contact gestionnaire"],
    materiaux: ["liste des materiaux", "quantites", "photos", "delai d'enlevement", "adresse de retrait"],
    collectivite: ["territoire concerne", "interlocuteur", "besoin prioritaire", "calendrier politique ou technique"],
    entreprise: ["type de contribution", "contact decisionnaire", "delai", "contraintes logistiques"],
    financeur: ["dispositif vise", "montant indicatif", "echeance", "pieces attendues"],
    benevole: ["disponibilites", "competences", "zone d'intervention", "consentement donnees"],
    presse: ["angle souhaite", "date limite", "support", "personne a interviewer"],
    signalement: ["localisation", "photos", "description du risque", "source du signalement"],
  }[category] || ["contexte", "contact", "territoire", "delai attendu"];
}
function titleForSource(kind, row) {
  if (kind === "knowledge") return row.article_key || row.title;
  if (kind === "procedure") return row.procedure_key || row.title;
  if (kind === "document") return row.document_number || row.title;
  if (kind === "case") return row.case_number || row.title;
  return row.title || kind;
}
function textForSource(kind, row) {
  if (kind === "knowledge") return [row.title, row.article_key, row.article_type, row.summary, row.ai_summary, row.content, (row.tags || []).join(" ")].join(" ");
  if (kind === "procedure") return [row.title, row.procedure_key, row.module_key, row.pole, row.summary, row.ai_summary, (row.tags || []).join(" ")].join(" ");
  if (kind === "document") return [row.title, row.document_number, row.document_type, row.status, row.ai_summary, row.classification_notes].join(" ");
  if (kind === "case") return [row.title, row.case_number, row.case_type, row.status, row.priority, row.main_pole, row.summary, row.next_action, row.ai_summary, row.risk_level].join(" ");
  return JSON.stringify(row || {});
}
function scoreSources(prompt, groups) {
  const words = keywords(prompt);
  const items = [];
  Object.entries(groups).forEach(([kind, rows]) => {
    (rows || []).forEach((row) => {
      const haystack = normalizeForMatch(textForSource(kind, row));
      const score = words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
      if (score > 0) items.push({ kind, row, score, label: `${kind}:${titleForSource(kind, row)}` });
    });
  });
  return items.sort((a, b) => b.score - a.score).slice(0, 8);
}
async function fetchContextSources() {
  const [knowledge, procedures, documents, cases] = await Promise.all([
    optionalSupabaseRequest(`knowledge_articles?${new URLSearchParams({ status: "eq.valide", select: "id,article_key,title,article_type,summary,ai_summary,content,tags,knowledge_sources(source_label,source_type,citation_note)", limit: "80" }).toString()}`),
    optionalSupabaseRequest(`procedures?${new URLSearchParams({ status: "eq.active", select: "id,procedure_key,title,module_key,pole,summary,ai_summary,tags", limit: "80" }).toString()}`),
    optionalSupabaseRequest(`documents?${new URLSearchParams({ select: "id,document_number,title,document_type,status,ai_summary,classification_notes,confidentiality_level,indexed_in_knowledge", limit: "80", order: "updated_at.desc" }).toString()}`),
    optionalSupabaseRequest(`cases?${new URLSearchParams({ select: "id,case_number,title,case_type,status,priority,main_pole,summary,next_action,ai_summary,risk_level,decision_status", limit: "80", order: "updated_at.desc" }).toString()}`),
  ]);
  return { knowledge, procedures, documents, cases };
}
function buildAnswer(prompt, contextSources) {
  const scored = scoreSources(prompt, contextSources);
  const text = clean(prompt, 2500);
  const category = inferCategory(text);
  const pole = inferPole(text);
  const priority = inferPriority(text);
  const missing = missingPiecesForCategory(category);
  const sourceLabels = scored.map((item) => item.label).slice(0, 6);
  const top = scored[0];
  const facts = top ? `Source principale trouvee : ${top.label}.` : "Aucune source interne ne couvre completement la demande.";
  const recommendation = `Orientation proposee : categorie ${category}, pole ${pole}, priorite ${priority}. Validation humaine obligatoire avant decision, envoi externe ou engagement.`;
  const nextActions = [
    "Verifier les informations manquantes",
    `Confirmer le rattachement au pole ${pole}`,
    "Ouvrir ou rattacher l'objet metier concerne",
    "Valider la reponse ou la suggestion avant envoi",
  ];
  const answerText = sourceLabels.length
    ? `${facts} ${recommendation} Prochaine action : ${nextActions[0]}. Sources : ${sourceLabels.join(", ")}.`
    : `${facts} ${recommendation} Creer une connaissance ou demander arbitrage au referent national si le cas est nouveau.`;
  return {
    answer_text: answerText,
    facts,
    hypotheses: [`La classification est deduite du texte fourni et des sources disponibles.`],
    recommendation,
    next_actions: nextActions,
    missing_information: missing,
    suggested_category: category,
    suggested_pole: pole,
    suggested_priority: priority,
    sources: sourceLabels,
    confidence: sourceLabels.length ? Math.min(0.92, 0.55 + sourceLabels.length * 0.06) : 0.34,
  };
}
function interactionPayload(input, response, interactionType = "question") {
  validateEnum(INTERACTION_TYPES, interactionType, "Type d'interaction IA invalide.");
  const contextType = clean(input.context_object_type || input.context_type || "none", 80) || "none";
  validateEnum(CONTEXT_TYPES, contextType, "Type de contexte invalide.");
  return {
    branch_id: validateUuid(input.branch_id || "", "Antenne"),
    user_label: clean(input.user_label || "TVF OS", 180),
    context_object_type: contextType,
    context_object_id: validateUuid(input.context_object_id || input.context_id || "", "Objet contexte"),
    interaction_type: interactionType,
    prompt: clean(input.prompt || input.question || input.message || "", 6000),
    prompt_summary: clean(input.prompt_summary || input.prompt || input.question || input.message || "", 900),
    response,
    response_summary: clean(response.answer_text || response.recommendation || "", 1400),
    sources: arrayValue(response.sources || []),
    confidence: Number(response.confidence || 0.5),
    model_used: clean(process.env.TVF_AI_MODEL || "tvf-os-deterministic-v1", 160),
    status: response.confidence >= 0.5 ? "completed" : "needs_review",
  };
}
function suggestionPayload(input, answer = null) {
  const relatedType = clean(input.related_object_type || input.context_object_type || "none", 80) || "none";
  const suggestionType = clean(input.suggestion_type || "next_action", 80);
  validateEnum(CONTEXT_TYPES, relatedType, "Type d'objet lie invalide.");
  validateEnum(SUGGESTION_TYPES, suggestionType, "Type de suggestion invalide.");
  const proposed = input.proposed_value && typeof input.proposed_value === "object" ? input.proposed_value : {
    category: answer?.suggested_category || inferCategory(input.prompt || input.message || input.title || ""),
    pole: answer?.suggested_pole || inferPole(input.prompt || input.message || input.title || ""),
    priority: answer?.suggested_priority || inferPriority(input.prompt || input.message || input.title || ""),
    next_actions: answer?.next_actions || [clean(input.title || "Verifier et qualifier", 200)],
    missing_information: answer?.missing_information || [],
  };
  return {
    branch_id: validateUuid(input.branch_id || "", "Antenne"),
    user_label: clean(input.user_label || "TVF OS", 180),
    related_object_type: relatedType,
    related_object_id: validateUuid(input.related_object_id || input.context_object_id || "", "Objet lie"),
    suggestion_type: suggestionType,
    title: clean(input.title || `Suggestion ${suggestionType}`, 260),
    proposed_value: proposed,
    explanation: clean(input.explanation || answer?.recommendation || "Suggestion produite par TVF OS a valider par un humain.", 2400),
    sources: arrayValue(input.sources || answer?.sources || []),
    confidence: Number(input.confidence || answer?.confidence || 0.62),
    status: "proposed",
  };
}
function emailAnalysisPayload(input, answer) {
  const message = clean(input.message || input.email_body || input.prompt || "", 8000);
  if (!message) throw Object.assign(new Error("Message e-mail requis."), { statusCode: 400 });
  const category = inferCategory(message);
  const pole = inferPole(message);
  const priority = inferPriority(message);
  return suggestionPayload({
    ...input,
    related_object_type: "email",
    suggestion_type: "email_triage",
    title: clean(input.subject || "Analyse e-mail entrant", 260),
    proposed_value: {
      category,
      pole,
      priority,
      needs_case: priority !== "P3" || category !== "bien_vacant",
      missing_information: missingPiecesForCategory(category),
      draft_response: `Bonjour, merci pour votre message. Nous l'avons bien recu et allons le qualifier avec le pole ${pole}. Pour avancer, pouvez-vous transmettre les elements manquants suivants : ${missingPiecesForCategory(category).join(", ")} ?`,
      tasks: ["Verifier contact et organisation", "Qualifier la demande", "Controler les pieces", "Proposer une reponse a valider"],
    },
    explanation: `Lecture automatique : categorie ${category}, pole ${pole}, priorite ${priority}. Aucune reponse externe ne doit partir sans validation humaine.`,
    sources: answer.sources,
    confidence: Math.max(answer.confidence || 0.5, 0.68),
  }, answer);
}
async function createInteraction(input, interactionType = "question") {
  const prompt = clean(input.prompt || input.question || input.message || "", 8000);
  if (!prompt) throw Object.assign(new Error("Question ou contexte requis."), { statusCode: 400 });
  const contextSources = await fetchContextSources();
  const answer = buildAnswer(prompt, contextSources);
  const rows = await supabaseRequest("ai_interactions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(interactionPayload(input, answer, interactionType)) });
  return { interaction: rows?.[0] || null, response: answer };
}
async function createSuggestion(input, answer = null) {
  const payload = suggestionPayload(input, answer);
  const rows = await supabaseRequest("ai_suggestions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0] || null;
}
async function analyzeEmail(input) {
  const created = await createInteraction({ ...input, prompt: input.message || input.email_body || input.prompt }, "email_analysis");
  const suggestion = emailAnalysisPayload(input, created.response);
  const rows = await supabaseRequest("ai_suggestions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(suggestion) });
  return { interaction: created.interaction, response: created.response, suggestion: rows?.[0] || null };
}
async function listInteractions(req) {
  const url = queryUrl(req);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 60), 1), 200);
  const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(limit) });
  const type = clean(url.searchParams.get("interaction_type") || "", 80);
  if (type && INTERACTION_TYPES.has(type)) params.set("interaction_type", `eq.${type}`);
  return supabaseRequest(`ai_interactions?${params.toString()}`);
}
async function listSuggestions(req) {
  const url = queryUrl(req);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 80), 1), 200);
  const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(limit) });
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("suggestion_type") || "", 80);
  if (status && status !== "all" && SUGGESTION_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && SUGGESTION_TYPES.has(type)) params.set("suggestion_type", `eq.${type}`);
  return supabaseRequest(`ai_suggestions?${params.toString()}`);
}
async function listAutomations() {
  const rules = await optionalSupabaseRequest("ai_automation_rules?select=*&order=created_at.desc&limit=100");
  const runs = await optionalSupabaseRequest("ai_automation_runs?select=*&order=started_at.desc&limit=50");
  return { rules, runs };
}
async function sourceStats() {
  const context = await fetchContextSources();
  return {
    knowledge: context.knowledge.length,
    procedures: context.procedures.length,
    documents: context.documents.length,
    cases: context.cases.length,
  };
}
async function dashboardAi() {
  const [interactions, suggestions, feedback, automations, sources] = await Promise.all([
    optionalSupabaseRequest("ai_interactions?select=id,status,interaction_type,confidence,created_at&limit=1000"),
    optionalSupabaseRequest("ai_suggestions?select=id,status,suggestion_type,confidence,created_at&limit=1000"),
    optionalSupabaseRequest("ai_feedback?select=id,feedback_type,created_at&limit=1000"),
    listAutomations(),
    sourceStats(),
  ]);
  const accepted = suggestions.filter((item) => ["accepted", "applied"].includes(item.status)).length;
  const reviewed = suggestions.filter((item) => item.status !== "proposed").length;
  return {
    interactions_total: interactions.length,
    suggestions_total: suggestions.length,
    suggestions_pending: suggestions.filter((item) => item.status === "proposed").length,
    suggestions_accepted: accepted,
    acceptance_rate: reviewed ? Math.round((accepted / reviewed) * 100) : 0,
    needs_review: interactions.filter((item) => item.status === "needs_review").length,
    feedback_total: feedback.length,
    automation_rules: automations.rules.length,
    automation_runs: automations.runs.length,
    sources,
  };
}
async function reviewSuggestion(input) {
  const id = validateUuid(input.id || "", "Suggestion");
  if (!id) throw Object.assign(new Error("Suggestion requise."), { statusCode: 400 });
  const status = clean(input.status || input.action || "", 80);
  validateEnum(SUGGESTION_STATUSES, status, "Statut de suggestion invalide.");
  const payload = {
    status,
    reviewed_by: clean(input.reviewed_by || input.user_label || "TVF OS", 180),
    reviewed_at: new Date().toISOString(),
    rejected_reason: status === "rejected" ? clean(input.rejected_reason || input.reason || "Refuse par l'utilisateur.", 900) : null,
  };
  if (input.proposed_value && typeof input.proposed_value === "object") payload.proposed_value = input.proposed_value;
  const rows = await supabaseRequest(`ai_suggestions?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0] || null;
}
async function createFeedback(input) {
  const feedbackType = clean(input.feedback_type || "other", 80);
  validateEnum(FEEDBACK_TYPES, feedbackType, "Type de retour IA invalide.");
  const payload = {
    interaction_id: validateUuid(input.interaction_id || "", "Interaction"),
    suggestion_id: validateUuid(input.suggestion_id || "", "Suggestion"),
    feedback_type: feedbackType,
    note: clean(input.note || "", 1800),
    created_by: clean(input.created_by || input.user_label || "TVF OS", 180),
  };
  if (!payload.interaction_id && !payload.suggestion_id) throw Object.assign(new Error("Retour lie a une interaction ou suggestion requis."), { statusCode: 400 });
  const rows = await supabaseRequest("ai_feedback?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0] || null;
}
async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "dashboard", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardAi() });
      if (entity === "suggestions") return sendJson(res, 200, { ok: true, suggestions: await listSuggestions(req) });
      if (entity === "interactions") return sendJson(res, 200, { ok: true, interactions: await listInteractions(req) });
      if (entity === "automations") return sendJson(res, 200, { ok: true, automations: await listAutomations() });
      if (entity === "sources") return sendJson(res, 200, { ok: true, sources: await sourceStats() });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "ask", 80);
    if (req.method === "POST") {
      if (type === "ask") return sendJson(res, 201, { ok: true, ...(await createInteraction(data, "question")) });
      if (type === "suggestion") return sendJson(res, 201, { ok: true, suggestion: await createSuggestion(data) });
      if (type === "email_analysis") return sendJson(res, 201, { ok: true, ...(await analyzeEmail(data)) });
      if (type === "feedback") return sendJson(res, 201, { ok: true, feedback: await createFeedback(data) });
    }
    if (req.method === "PATCH") {
      if (type === "suggestion") return sendJson(res, 200, { ok: true, suggestion: await reviewSuggestion(data) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Assistant IA temporairement non charge : vérifiez la configuration Supabase et IA du module." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}

module.exports = handler;
module.exports._private = {
  normalizeSupabaseRestUrl,
  normalizeForMatch,
  keywords,
  inferPole,
  inferPriority,
  inferCategory,
  missingPiecesForCategory,
  buildAnswer,
  interactionPayload,
  suggestionPayload,
  emailAnalysisPayload,
};
