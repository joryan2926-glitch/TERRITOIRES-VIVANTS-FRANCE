const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 12000);
const MAX_FILE_BYTES = Number(process.env.TVF_DOCUMENT_MAX_BYTES || 8 * 1024 * 1024);
const DOCUMENT_BUCKET = process.env.TVF_DOCUMENT_BUCKET || "tvf-documents";
const DOCUMENT_TYPES = new Set(["piece", "photo", "convention", "courrier", "email", "budget", "compte_rendu", "fiche", "registre", "formulaire", "kit", "preuve", "modele_genere", "autre"]);
const DOCUMENT_STATUSES = new Set(["brouillon", "a_classer", "a_valider", "valide", "remplace", "archive"]);
const TEMPLATE_TYPES = new Set(["courrier", "email", "convention", "fiche", "registre", "budget", "kit_antenne", "formulaire", "grille", "compte_rendu", "financeur", "autre"]);
const TEMPLATE_STATUSES = new Set(["brouillon", "a_valider", "officiel", "remplace", "archive"]);
const CONFIDENTIALITY = new Set(["public", "interne", "confidentiel", "sensible"]);
const RELATED_TYPES = new Set(["case", "request", "contact", "organization", "project", "branch", "template", "none"]);
const GENERATED_STATUSES = new Set(["draft_created", "missing_fields", "submitted", "validated", "failed"]);
const VALIDATION_STATUSES = new Set(["non_soumis", "a_valider", "valide", "refuse"]);

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
function normalizeSupabaseUrl(rawUrl) {
  return cleanEnvUrl(rawUrl).replace(/\/+(rest\/v1)?$/, "");
}
function normalizeSupabaseRestUrl(rawUrl) {
  const root = normalizeSupabaseUrl(rawUrl);
  return root ? `${root}/rest/v1` : "";
}
function normalizeForMatch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_FILE_BYTES * 1.6 + 80 * 1024) throw Object.assign(new Error("Fichier ou payload trop volumineux."), { statusCode: 413 });
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
  const rootUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const restUrl = normalizeSupabaseRestUrl(rootUrl);
  const key = cleanEnvToken(process.env.SUPABASE_SERVICE_ROLE_KEY || "", 3000);
  if (!rootUrl || !restUrl || !key) throw Object.assign(new Error("Supabase admin non configure : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."), { statusCode: 503, code: "SUPABASE_ADMIN_NOT_CONFIGURED" });
  return { rootUrl, restUrl, key };
}
function supabaseHeaders(key, extra = {}) {
  const headers = { apikey: key, "Content-Type": "application/json", ...extra };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}
function storageHeaders(key, mimeType) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": mimeType || "application/octet-stream" };
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
function validateEnum(set, value, message) {
  if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 });
}
function arrayValue(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 120)).filter(Boolean).slice(0, 30);
  return clean(value || "", 2000).split(/[;,\n]/).map((item) => clean(item, 120)).filter(Boolean).slice(0, 30);
}
function safeFilename(value) {
  const base = clean(value || "document", 160).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return base || "document";
}
function inferDocumentType(input) {
  const text = normalizeForMatch([input.document_type, input.template_type, input.title, input.original_filename, input.description].join(" "));
  if (/photo|image|jpg|jpeg|png|webp/.test(text)) return "photo";
  if (/convention|partenariat|mise a disposition/.test(text)) return "convention";
  if (/courrier|lettre/.test(text)) return "courrier";
  if (/email|mail/.test(text)) return "email";
  if (/budget|finance|financement|devis|facture/.test(text)) return "budget";
  if (/compte rendu|proces verbal|reunion|cr/.test(text)) return "compte_rendu";
  if (/fiche|formulaire|grille/.test(text)) return text.includes("formulaire") ? "formulaire" : "fiche";
  if (/registre|suivi|tableau/.test(text)) return "registre";
  if (/kit|pack/.test(text)) return "kit";
  if (/preuve|justificatif|attestation|rib|cni|identite/.test(text)) return "preuve";
  return "piece";
}
function inferTemplateType(input) {
  const type = inferDocumentType(input);
  return {
    piece: "autre",
    photo: "autre",
    modele_genere: "autre",
    preuve: "autre",
    kit: "kit_antenne",
  }[type] || type;
}
function detectSensitive(input) {
  const text = normalizeForMatch([input.title, input.original_filename, input.description, input.ai_summary, input.summary].join(" "));
  return /(rib|iban|piece d identite|identite|cni|passeport|avis d impot|impot|salaire|medical|sante|signature|donnees personnelles|rgpd|contrat|mandat)/.test(text);
}
function documentAssistant(row) {
  const missing = [];
  if (!row.related_object_id && row.related_object_type !== "none") missing.push("objet rattache");
  if (!row.document_type || row.document_type === "piece") missing.push("type precise");
  if (!row.file_id) missing.push("fichier source");
  if (row.status === "a_classer") missing.push("classement");
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) missing.push("document expire");
  const sensitive = row.sensitive_detected || detectSensitive(row);
  return {
    sensitive_detected: sensitive,
    suggested_confidentiality: sensitive ? "sensible" : row.confidentiality_level || "interne",
    suggested_status: missing.length ? "a_classer" : row.status === "brouillon" ? "a_valider" : row.status,
    missing_fields: missing,
    summary: row.ai_summary || `${row.document_type || "document"} - ${row.status || "statut a definir"}.`,
    knowledge_ready: row.status === "valide" && !sensitive,
  };
}
function templateAssistant(row) {
  const required = row.required_fields || [];
  return {
    generation_ready: row.status === "officiel" && row.national_validated === true,
    missing_fields_count: required.length,
    suggested_use: required.length ? `Champs a renseigner : ${required.slice(0, 5).join(", ")}` : "Modele utilisable sans champ obligatoire declare.",
    summary: row.ai_summary || `${row.template_type || "modele"} - version ${row.version || 1}.`,
  };
}
function enrichDocument(row) {
  return { ...row, assistant: documentAssistant(row || {}) };
}
function enrichTemplate(row) {
  return { ...row, assistant: templateAssistant(row || {}) };
}
function documentPayload(input, partial = false) {
  const payload = {};
  const type = clean(input.document_type || "", 80) || (!partial ? inferDocumentType(input) : "");
  const status = clean(input.status || "", 80) || (!partial ? "a_classer" : "");
  const confidentiality = clean(input.confidentiality_level || "", 80) || (!partial ? (detectSensitive(input) ? "sensible" : "interne") : "");
  const relatedType = clean(input.related_object_type || "", 80) || (!partial ? "none" : "");
  validateEnum(DOCUMENT_TYPES, type, "Type de document invalide.");
  validateEnum(DOCUMENT_STATUSES, status, "Statut de document invalide.");
  validateEnum(CONFIDENTIALITY, confidentiality, "Niveau de confidentialite invalide.");
  validateEnum(RELATED_TYPES, relatedType, "Type de rattachement invalide.");
  const fields = {
    title: clean(input.title || "", 260),
    document_type: type,
    status,
    file_id: clean(input.file_id || "", 80),
    branch_id: clean(input.branch_id || "", 80),
    related_object_type: relatedType,
    related_object_id: clean(input.related_object_id || "", 80),
    template_id: clean(input.template_id || "", 80),
    expires_at: clean(input.expires_at || "", 80),
    confidentiality_level: confidentiality,
    ai_summary: clean(input.ai_summary || input.summary || "", 2400),
    classification_notes: clean(input.classification_notes || "", 1600),
    sensitive_detected: detectSensitive(input),
  };
  if (!partial && !fields.title) fields.title = clean(input.original_filename || input.file_name || "Document TVF", 260);
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de document requis."), { statusCode: 400 });
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["document_type", "status", "related_object_type", "confidentiality_level"].includes(key)) {
      if (value !== "") payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (!payload.ai_summary) payload.ai_summary = `${payload.document_type || type} - ${payload.status || status}.`;
  return payload;
}
function templatePayload(input, partial = false) {
  const payload = {};
  const type = clean(input.template_type || "", 80) || (!partial ? inferTemplateType(input) : "");
  const status = clean(input.status || "", 80) || (!partial ? "brouillon" : "");
  validateEnum(TEMPLATE_TYPES, type, "Type de modele invalide.");
  validateEnum(TEMPLATE_STATUSES, status, "Statut de modele invalide.");
  const title = clean(input.title || "", 260);
  const fields = {
    template_key: clean(input.template_key || "", 160),
    title,
    template_type: type,
    status,
    national_validated: input.national_validated === true || input.national_validated === "true",
    file_id: clean(input.file_id || "", 80),
    required_fields: arrayValue(input.required_fields),
    description: clean(input.description || "", 2400),
    branch_id: clean(input.branch_id || "", 80),
    ai_summary: clean(input.ai_summary || input.description || "", 2400),
  };
  if (!partial && !fields.title) throw Object.assign(new Error("Titre de modele requis."), { statusCode: 400 });
  if (!partial && !fields.template_key) fields.template_key = safeFilename(`${type}-${title}`).toLowerCase();
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["template_type", "status", "national_validated"].includes(key)) {
      if (Array.isArray(value) || value !== "") payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (!payload.ai_summary) payload.ai_summary = `${payload.template_type || type} - ${payload.status || status}.`;
  return payload;
}
function decodeBase64File(input) {
  const base64 = clean(input.file_base64 || "", MAX_FILE_BYTES * 2);
  if (!base64) return null;
  const cleaned = base64.includes(",") ? base64.split(",").pop() : base64;
  const buffer = Buffer.from(cleaned, "base64");
  if (!buffer.length) throw Object.assign(new Error("Fichier vide."), { statusCode: 400 });
  if (buffer.length > MAX_FILE_BYTES) throw Object.assign(new Error("Fichier trop volumineux."), { statusCode: 413 });
  return buffer;
}
async function createFileFromPayload(input) {
  const buffer = decodeBase64File(input);
  if (!buffer) return null;
  const filename = safeFilename(input.file_name || input.original_filename || input.title || "document.bin");
  const mimeType = clean(input.mime_type || "application/octet-stream", 160);
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
  const date = new Date();
  const storagePath = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${filename}`;
  const { rootUrl, key } = supabaseConfig();
  const uploadUrl = `${rootUrl}/storage/v1/object/${DOCUMENT_BUCKET}/${storagePath}`;
  const response = await fetchWithTimeout(uploadUrl, { method: "POST", headers: storageHeaders(key, mimeType), body: buffer });
  const text = await response.text();
  if (!response.ok) throw Object.assign(new Error("Depot fichier impossible."), { statusCode: 502, details: text });
  const filePayload = {
    storage_bucket: DOCUMENT_BUCKET,
    storage_path: storagePath,
    original_filename: filename,
    mime_type: mimeType,
    size_bytes: buffer.length,
    checksum,
    uploaded_by: clean(input.uploaded_by || "TVF OS", 160),
    branch_id: clean(input.branch_id || "", 80) || null,
    confidentiality_level: clean(input.confidentiality_level || "", 80) || (detectSensitive({ ...input, original_filename: filename }) ? "sensible" : "interne"),
    virus_scan_status: "pending",
    ai_summary: clean(input.ai_summary || input.summary || "", 1200) || `${filename} depose dans TVF OS.`,
    sensitive_detected: detectSensitive({ ...input, original_filename: filename }),
  };
  const rows = await supabaseRequest("files?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(filePayload) });
  return rows?.[0] || null;
}
function documentSelect() {
  return "*,files(*),templates(*)";
}
function templateSelect() {
  return "*,files(*)";
}
async function listDocuments(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: documentSelect(), order: "updated_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("document_type") || "", 80);
  const confidentiality = clean(url.searchParams.get("confidentiality_level") || "", 80);
  const related = clean(url.searchParams.get("related_object_type") || "", 80);
  const q = clean(url.searchParams.get("q") || "", 120).replace(/[*,()]/g, " ");
  if (status && status !== "all" && DOCUMENT_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && DOCUMENT_TYPES.has(type)) params.set("document_type", `eq.${type}`);
  if (confidentiality && confidentiality !== "all" && CONFIDENTIALITY.has(confidentiality)) params.set("confidentiality_level", `eq.${confidentiality}`);
  if (related && related !== "all" && RELATED_TYPES.has(related)) params.set("related_object_type", `eq.${related}`);
  if (q) params.set("or", `(document_number.ilike.*${q}*,title.ilike.*${q}*,ai_summary.ilike.*${q}*,classification_notes.ilike.*${q}*)`);
  const rows = await supabaseRequest(`documents?${params.toString()}`);
  return (rows || []).map(enrichDocument);
}
async function listTemplates(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams({ select: templateSelect(), order: "updated_at.desc" });
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200)));
  const status = clean(url.searchParams.get("status") || "", 80);
  const type = clean(url.searchParams.get("template_type") || "", 80);
  const q = clean(url.searchParams.get("q") || "", 120).replace(/[*,()]/g, " ");
  if (status && status !== "all" && TEMPLATE_STATUSES.has(status)) params.set("status", `eq.${status}`);
  if (type && type !== "all" && TEMPLATE_TYPES.has(type)) params.set("template_type", `eq.${type}`);
  if (q) params.set("or", `(template_key.ilike.*${q}*,title.ilike.*${q}*,description.ilike.*${q}*,ai_summary.ilike.*${q}*)`);
  const rows = await supabaseRequest(`templates?${params.toString()}`);
  return (rows || []).map(enrichTemplate);
}
async function dashboardDocuments() {
  const docs = await supabaseRequest("documents?select=id,status,document_type,confidentiality_level,sensitive_detected,expires_at,created_at&limit=1000");
  const templates = await supabaseRequest("templates?select=id,status,national_validated&limit=1000");
  const now = Date.now();
  return {
    documents_total: docs.length,
    a_classer: docs.filter((d) => d.status === "a_classer").length,
    a_valider: docs.filter((d) => d.status === "a_valider").length,
    sensibles: docs.filter((d) => d.sensitive_detected || d.confidentiality_level === "sensible").length,
    expires: docs.filter((d) => d.expires_at && new Date(d.expires_at).getTime() < now).length,
    templates_total: templates.length,
    templates_officiels: templates.filter((t) => t.status === "officiel" && t.national_validated).length,
  };
}
async function createAudit(documentId, action, details) {
  if (!documentId) return;
  await supabaseRequest("document_audit_logs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ document_id: documentId, action, details: clean(details || "", 1600), created_by: "TVF OS" }) });
}
async function createDocument(input) {
  const createdFile = await createFileFromPayload(input);
  const payload = documentPayload({ ...input, file_id: input.file_id || createdFile?.id, original_filename: createdFile?.original_filename || input.original_filename || input.file_name });
  const rows = await supabaseRequest(`documents?select=${encodeURIComponent(documentSelect())}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  const document = rows?.[0];
  if (document?.id) await createAudit(document.id, "creation", "Creation du document");
  return enrichDocument(document);
}
async function updateDocument(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant de document invalide."), { statusCode: 400 });
  const createdFile = await createFileFromPayload(input);
  const payload = documentPayload({ ...input, file_id: input.file_id || createdFile?.id }, true);
  const params = new URLSearchParams({ id: `eq.${id}`, select: documentSelect() });
  const rows = await supabaseRequest(`documents?${params.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  if (rows?.[0]?.id) await createAudit(rows[0].id, "mise_a_jour", input.audit_note || "Mise a jour du document");
  return enrichDocument(rows?.[0]);
}
async function createTemplate(input) {
  const createdFile = await createFileFromPayload(input);
  const payload = templatePayload({ ...input, file_id: input.file_id || createdFile?.id, original_filename: createdFile?.original_filename || input.original_filename || input.file_name });
  const rows = await supabaseRequest(`templates?select=${encodeURIComponent(templateSelect())}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichTemplate(rows?.[0]);
}
async function updateTemplate(input) {
  const id = clean(input.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error("Identifiant de modele invalide."), { statusCode: 400 });
  const createdFile = await createFileFromPayload(input);
  const payload = templatePayload({ ...input, file_id: input.file_id || createdFile?.id }, true);
  const params = new URLSearchParams({ id: `eq.${id}`, select: templateSelect() });
  const rows = await supabaseRequest(`templates?${params.toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
  return enrichTemplate(rows?.[0]);
}
async function generateDocument(input) {
  const templateId = clean(input.template_id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(templateId)) throw Object.assign(new Error("Modele requis."), { statusCode: 400 });
  const template = (await supabaseRequest(`templates?id=eq.${templateId}&select=*`))?.[0];
  if (!template) throw Object.assign(new Error("Modele introuvable."), { statusCode: 404 });
  const required = template.required_fields || [];
  const fieldValues = typeof input.field_values === "object" && input.field_values ? input.field_values : {};
  const missing = required.filter((field) => !clean(String(fieldValues[field] || ""), 500));
  const document = await createDocument({
    title: clean(input.title || `Brouillon - ${template.title}`, 260),
    document_type: "modele_genere",
    status: missing.length ? "brouillon" : "a_valider",
    template_id: templateId,
    related_object_type: clean(input.generated_from_object_type || "none", 80),
    related_object_id: clean(input.generated_from_object_id || "", 80),
    confidentiality_level: "interne",
    ai_summary: missing.length ? `Champs manquants : ${missing.join(", ")}.` : `Brouillon genere depuis le modele ${template.title}.`,
    classification_notes: clean(JSON.stringify(fieldValues), 1600),
  });
  const generationStatus = missing.length ? "missing_fields" : "draft_created";
  const generatedRows = await supabaseRequest("generated_documents?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ template_id: templateId, document_id: document.id, generated_by: clean(input.generated_by || "TVF OS", 160), generated_from_object_type: clean(input.generated_from_object_type || "none", 80), generated_from_object_id: clean(input.generated_from_object_id || "", 80) || null, generation_status: generationStatus, validation_status: "non_soumis", missing_fields: missing, field_values: fieldValues }) });
  return { document, generated: generatedRows?.[0] || null };
}
async function downloadFile(req, res) {
  const url = queryUrl(req);
  const fileId = clean(url.searchParams.get("file_id") || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(fileId)) throw Object.assign(new Error("Identifiant fichier invalide."), { statusCode: 400 });
  const file = (await supabaseRequest(`files?id=eq.${fileId}&select=*`))?.[0];
  if (!file) throw Object.assign(new Error("Fichier introuvable."), { statusCode: 404 });
  const { rootUrl, key } = supabaseConfig();
  const storagePath = `${file.storage_bucket}/${file.storage_path}`.split("/").map(encodeURIComponent).join("/");
  const response = await fetchWithTimeout(`${rootUrl}/storage/v1/object/${storagePath}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw Object.assign(new Error("Lecture fichier impossible."), { statusCode: 502 });
  const arrayBuffer = await response.arrayBuffer();
  res.statusCode = 200;
  res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(file.original_filename)}"`);
  res.setHeader("Cache-Control", "private, no-store");
  res.end(Buffer.from(arrayBuffer));
}
async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "documents", 80);
    if (req.method === "GET") {
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardDocuments() });
      if (entity === "templates") return sendJson(res, 200, { ok: true, templates: await listTemplates(req) });
      if (entity === "file") return await downloadFile(req, res);
      return sendJson(res, 200, { ok: true, documents: await listDocuments(req) });
    }
    const data = await readJsonBody(req);
    const type = clean(data.type || "document", 80);
    if (req.method === "POST") {
      if (type === "document") return sendJson(res, 201, { ok: true, document: await createDocument(data) });
      if (type === "template") return sendJson(res, 201, { ok: true, template: await createTemplate(data) });
      if (type === "generated") return sendJson(res, 201, { ok: true, ...(await generateDocument(data)) });
    }
    if (req.method === "PATCH") {
      if (type === "document") return sendJson(res, 200, { ok: true, document: await updateDocument(data) });
      if (type === "template") return sendJson(res, 200, { ok: true, template: await updateTemplate(data) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Documents indisponibles pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
}
module.exports = handler;
module.exports._private = { normalizeSupabaseUrl, normalizeSupabaseRestUrl, inferDocumentType, inferTemplateType, detectSensitive, documentAssistant, templateAssistant, documentPayload, templatePayload, decodeBase64File, safeFilename };
