const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const ARTICLE_TYPES = new Set(["article", "faq", "retour_experience", "decision_type", "erreur_a_eviter", "cas_usage", "source_territoriale", "lecon_apprise", "procedure", "modele", "autre"]);
const ARTICLE_STATUSES = new Set(["brouillon", "a_valider", "valide", "en_revision", "archive"]);
const CONFIDENTIALITY = new Set(["public", "interne", "confidentiel", "sensible"]);
const RELATED_TYPES = new Set(["case", "request", "document", "procedure", "contact", "organization", "project", "branch", "none"]);
const LESSON_TYPES = new Set(["bonne_pratique", "risque", "erreur", "amelioration", "decision", "terrain", "autre"]);
const QUESTION_STATUSES = new Set(["answered", "unanswered", "needs_review"]);

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
  const cleaned = cleanEnvUrl(rawUrl).replace(/\/+$|\/rest\/v1$/g, "");
  return cleaned ? `${cleaned}/rest/v1` : "";
}
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 120 * 1024) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 });
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
  return normalizeForMatch(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 110) || "connaissance";
}
function arrayValue(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 160)).filter(Boolean).slice(0, 30);
  return clean(value || "", 3000).split(/[;,\n]/).map((item) => clean(item, 160)).filter(Boolean).slice(0, 30);
}
function inferArticleType(input) {
  const text = normalizeForMatch([input.article_type, input.title, input.content, input.summary].join(" "));
  if (/faq|question|reponse/.test(text)) return "faq";
  if (/retour|experience|rex/.test(text)) return "retour_experience";
  if (/decision|arbitrage/.test(text)) return "decision_type";
  if (/erreur|eviter|piege/.test(text)) return "erreur_a_eviter";
  if (/cas|usage|exemple/.test(text)) return "cas_usage";
  if (/source|territoire|donnee|insee|urbanisme/.test(text)) return "source_territoriale";
  if (/lecon|apprise|enseignement/.test(text)) return "lecon_apprise";
  if (/procedure|methode|circuit/.test(text)) return "procedure";
  if (/modele|courrier|fiche|convention/.test(text)) return "modele";
  return "article";
}
function inferConfidentiality(input) {
  const text = normalizeForMatch([input.title, input.content, input.summary].join(" "));
  if (/rib|iban|identite|cni|sante|medical|adresse personnelle|donnees personnelles|confidentiel/.test(text)) return "sensible";
  if (/partenaire|convention|budget|finance|strategie/.test(text)) return "confidentiel";
  return "interne";
}
function articleAssistant(row) {
  const missing = [];
  if (!row.content || row.content.length < 80) missing.push("contenu detaille");
  if (!row.tags || !row.tags.length) missing.push("tags");
  if (!row.knowledge_sources || !row.knowledge_sources.length) missing.push("sources citees");
  if (row.status === "brouillon") missing.push("validation editoriale");
  const reviewOverdue = row.next_review_at && new Date(row.next_review_at).getTime() < Date.now();
  return {
    missing_fields: missing,
    review_overdue: reviewOverdue,
    suggested_status: reviewOverdue ? "en_revision" : missing.length ? "a_valider" : row.status || "valide",
    can_answer: row.status === "valide" && !reviewOverdue,
    summary: row.ai_summary || row.summary || `${row.title || "Article"} - ${row.article_type || "connaissance"}.`,
  };
}
function lessonAssistant(row) {
  const impact = row.impact_level || "moyen";
  return {
    article_ready: Boolean(row.title && row.lesson && row.status === "a_capitaliser"),
    suggested_article_type: row.lesson_type === "erreur" ? "erreur_a_eviter" : "retour_experience",
    priority: impact === "fort" ? "haute" : "normale",
  };
}
function enrichArticle(row) {
  return { ...row, assistant: articleAssistant(row || {}) };
}
function enrichLesson(row) {
  return { ...row, assistant: lessonAssistant(row || {}) };
}
function articlePayload(input, partial = false) {
  const type = clean(input.article_type || "", 80) || (!partial ? inferArticleType(input) : "");
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  const confidentiality = clean(input.confidentiality_level || "", 80) || (!partial ? inferConfidentiality(input) : "");
  const sourceType = clean(input.source_object_type || "", 80) || (!partial ? "none" : "");
  validateEnum(ARTICLE_TYPES, type, "Type d'article invalide.");
  validateEnum(ARTICLE_STATUSES, status, "Statut d'article invalide.");
  validateEnum(CONFIDENTIALITY, confidentiality, "Niveau de confidentialite invalide.");
  validateEnum(RELATED_TYPES, sourceType, "Type de source invalide.");
  const title = clean(input.title || "", 260);
  const fields = {
    article_key: clean(input.article_key || "", 180),
    title,
    article_type: type,
    status,
    content: clean(input.content || "", 12000),
    summary: clean(input.summary || "", 2400),
    ai_summary: clean(input.ai_summary || input.summary || "", 2400),
    source_object_type: sourceType,
    source_object_id: clean(input.source_object_id || "", 80),
    validated_by: clean(input.validated_by || "", 180),
    validated_at: clean(input.validated_at || "", 80),
    next_review_at: clean(input.next_review_at || "", 80),
    confidentiality_level: confidentiality,
  };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre d'article requis."), { statusCode: 400 });
  if (!partial && !fields.article_key) fields.article_key = slugify(`${type}-${title}`);
  if (!partial && !fields.next_review_at) { const d = new Date(); d.setMonth(d.getMonth() + 12); fields.next_review_at = d.toISOString(); }
  const payload = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["article_type", "status", "source_object_type", "confidentiality_level"].includes(key)) {
      if (value) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (Object.prototype.hasOwnProperty.call(input, "tags")) payload.tags = arrayValue(input.tags);
  if (!payload.ai_summary) payload.ai_summary = `${payload.title || title} - ${type}.`;
  return payload;
}
function sourcePayload(input) {
  return {
    article_id: clean(input.article_id || "", 80),
    source_label: clean(input.source_label || input.title || "", 260),
    source_type: clean(input.source_type || "document", 80),
    source_url: clean(input.source_url || "", 800) || null,
    related_object_type: clean(input.related_object_type || "none", 80),
    related_object_id: clean(input.related_object_id || "", 80) || null,
    citation_note: clean(input.citation_note || "", 1600) || null,
  };
}
function lessonPayload(input) {
  const lessonType = clean(input.lesson_type || "autre", 80);
  validateEnum(LESSON_TYPES, lessonType, "Type de retour d'experience invalide.");
  const title = clean(input.title || "", 260);
  if (!title) throw Object.assign(new Error("Titre de retour requis."), { statusCode: 400 });
  return {
    title,
    lesson_type: lessonType,
    source_object_type: clean(input.source_object_type || "none", 80),
    source_object_id: clean(input.source_object_id || "", 80) || null,
    context: clean(input.context || "", 3000),
    lesson: clean(input.lesson || "", 5000),
    impact_level: clean(input.impact_level || "moyen", 80),
    proposed_action: clean(input.proposed_action || "", 2400) || null,
    status: clean(input.status || "a_capitaliser", 80),
    tags: arrayValue(input.tags),
  };
}
function questionPayload(question, answer, sources, status = "answered") {
  validateEnum(QUESTION_STATUSES, status, "Statut de question invalide.");
  return { question, answer, sources, status, confidence: sources.length ? 0.78 : 0.22, created_by: "TVF OS" };
}
function articleSelect() {
  return "*,knowledge_sources(*)";
}
async function listArticles(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: articleSelect(), order: "updated_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("article_type") || "", 80);
  const confidentiality = clean(url.searchParams.get("confidentiality_level") || "", 80);
  const q = clean(url.searchParams.get("q") || "", 140).replace(/[*,()]/g, " ");
  if (status && status !== "all" && ARTICLE_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && ARTICLE_TYPES.has(type)) params.set("article_type", `eq.${type}`);
  if (confidentiality && confidentiality !== "all" && CONFIDENTIALITY.has(confidentiality)) params.set("confidentiality_level", `eq.${confidentiality}`);
  if (q) params.set("or", `(article_key.ilike.*${q}*,title.ilike.*${q}*,summary.ilike.*${q}*,content.ilike.*${q}*)`);
  const rows = await supabaseRequest(`knowledge_articles?${params.toString()}`);
  return (rows || []).map(enrichArticle);
}
async function listLessons(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: "*", order: "created_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const rows = await supabaseRequest(`lessons_learned?${params.toString()}`);
  return (rows || []).map(enrichLesson);
}
async function dashboardKnowledge() {
  const articles = await supabaseRequest("knowledge_articles?select=id,status,article_type,confidentiality_level,next_review_at&limit=1000");
  const lessons = await supabaseRequest("lessons_learned?select=id,status,impact_level&limit=1000");
  const now = Date.now();
  return {
    articles_total: articles.length,
    valides: articles.filter((a) => a.status === "valide").length,
    a_valider: articles.filter((a) => a.status === "a_valider").length,
    revision: articles.filter((a) => a.status === "en_revision" || (a.next_review_at && new Date(a.next_review_at).getTime() < now)).length,
    faq: articles.filter((a) => a.article_type === "faq").length,
    sensibles: articles.filter((a) => a.confidentiality_level === "sensible").length,
    lessons_total: lessons.length,
    lessons_to_capitalize: lessons.filter((l) => l.status === "a_capitaliser").length,
  };
}
async function createArticle(input) {
  const payload = articlePayload(input);
  const rows = await supabaseRequest(`knowledge_articles?select=${encodeURIComponent(articleSelect())}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichArticle(rows?.[0]);
}
async function updateArticle(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant d'article invalide."), { statusCode: 400 });
  const payload = articlePayload(input, true);
  const params = new URLSearchParams({ id: `eq.${id}`, select: articleSelect() });
  const rows = await supabaseRequest(`knowledge_articles?${params.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichArticle(rows?.[0]);
}
async function createSource(input) {
  const payload = sourcePayload(input);
  if (!payload.article_id || !payload.source_label) throw Object.assign(new Error("Source incomplete."), { statusCode: 400 });
  const rows = await supabaseRequest("knowledge_sources?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0] || null;
}
async function createLesson(input) {
  const payload = lessonPayload(input);
  const rows = await supabaseRequest("lessons_learned?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichLesson(rows?.[0]);
}
async function articleFromLesson(input) {
  const lessonId = clean(input.lesson_id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(lessonId)) throw Object.assign(new Error("Retour d'experience requis."), { statusCode: 400 });
  const lesson = (await supabaseRequest(`lessons_learned?id=eq.${lessonId}&select=*`))?.[0];
  if (!lesson) throw Object.assign(new Error("Retour d'experience introuvable."), { statusCode: 404 });
  const article = await createArticle({
    title: lesson.title,
    article_type: lesson.lesson_type === "erreur" ? "erreur_a_eviter" : "retour_experience",
    status: "a_valider",
    content: `${lesson.context || "Contexte a completer."}\n\nEnseignement : ${lesson.lesson || "A completer."}\n\nAction proposee : ${lesson.proposed_action || "A definir."}`,
    summary: lesson.lesson,
    source_object_type: lesson.source_object_type,
    source_object_id: lesson.source_object_id,
    tags: lesson.tags || [],
  });
  await supabaseRequest(`lessons_learned?id=eq.${lessonId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "capitalise", article_id: article.id }) });
  return article;
}
async function askKnowledge(input) {
  const question = clean(input.question || "", 600);
  if (!question) throw Object.assign(new Error("Question requise."), { statusCode: 400 });
  const q = normalizeForMatch(question).split(/\s+/).filter((w) => w.length > 3).slice(0, 12);
  const params = new URLSearchParams({ status: "eq.valide", select: articleSelect(), limit: "40" });
  const rows = await supabaseRequest(`knowledge_articles?${params.toString()}`);
  const scored = (rows || []).map((article) => {
    const haystack = normalizeForMatch([article.title, article.summary, article.content, (article.tags || []).join(" ")].join(" "));
    const score = q.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
    return { article, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  const sources = scored.map((item) => item.article.article_key || item.article.title);
  const answer = scored.length
    ? `Reponse TVF OS : ${scored[0].article.summary || scored[0].article.ai_summary || scored[0].article.content.slice(0, 280)} Sources : ${sources.join(", ")}.`
    : "Aucune connaissance valide ne repond clairement a cette question. Proposer un article ou poser la question au referent national.";
  const saved = await supabaseRequest("knowledge_questions?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(questionPayload(question, answer, sources, scored.length ? "answered" : "unanswered")) });
  return saved?.[0] || questionPayload(question, answer, sources, scored.length ? "answered" : "unanswered");
}
async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "articles", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardKnowledge() });
      if (entity === "lessons") return sendJson(res, 200, { ok: true, lessons: await listLessons(req) });
      return sendJson(res, 200, { ok: true, articles: await listArticles(req) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "article", 80);
    if (req.method === "POST") {
      if (type === "article") return sendJson(res, 201, { ok: true, article: await createArticle(data) });
      if (type === "source") return sendJson(res, 201, { ok: true, source: await createSource(data) });
      if (type === "lesson") return sendJson(res, 201, { ok: true, lesson: await createLesson(data) });
      if (type === "article_from_lesson") return sendJson(res, 201, { ok: true, article: await articleFromLesson(data) });
      if (type === "question") return sendJson(res, 201, { ok: true, response: await askKnowledge(data) });
    }
    if (req.method === "PATCH") {
      if (type === "article") return sendJson(res, 200, { ok: true, article: await updateArticle(data) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Base de connaissances temporairement non chargee : vérifiez la configuration Supabase du module." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}
module.exports = handler;
module.exports._private = { normalizeSupabaseRestUrl, slugify, inferArticleType, inferConfidentiality, articleAssistant, lessonAssistant, articlePayload, sourcePayload, lessonPayload, questionPayload };
