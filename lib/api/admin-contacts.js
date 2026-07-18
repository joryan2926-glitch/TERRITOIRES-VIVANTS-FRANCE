const crypto = require("crypto");
const { writeAdminAudit } = require("./admin-audit");

const CONTACT_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contacts";
const MOBILE_REQUESTS_TABLE = process.env.SUPABASE_MOBILE_REQUESTS_TABLE || "mobile_requests";
const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const STATUS_VALUES = new Set(["nouveau", "a_qualifier", "en_cours", "rendez_vous", "en_attente", "accepte", "refuse", "archive"]);
const PRIORITY_VALUES = new Set(["normale", "haute", "urgente"]);
const CHANNEL_VALUES = new Set(["site_web", "email", "telephone", "whatsapp", "rendez_vous", "import"]);
const MOBILE_FLOW_LABELS = {
  signal: "Signalement terrain",
  materials: "Materiaux disponibles",
  property: "Bien propose",
  volunteer: "Engagement benevole",
};
const CATEGORY_VALUES = new Set([
  "collectivite-territoire",
  "bien-vacant-proprietaire",
  "materiaux-reemploi",
  "entreprise-partenariat",
  "benevolat-insertion",
  "financement-mecenat",
  "presse-institutionnel",
  "demande-generale",
]);

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
    if (body.length > 24 * 1024) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      throw error;
    }
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("JSON invalide.");
    error.statusCode = 400;
    throw error;
  }
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
    const error = new Error("Back-office non configure : ajoutez TVF_ADMIN_TOKEN dans Vercel.");
    error.statusCode = 503;
    error.code = "ADMIN_TOKEN_MISSING";
    throw error;
  }
  if (!safeEqual(tokenFromRequest(req), expected)) {
    const error = new Error("Acces admin refuse.");
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

function supabaseHeaders(key, extra = {}) {
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    ...extra,
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

function sanitizeSearch(value) {
  return clean(value, 120).replace(/[*,()]/g, " ");
}

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function inferCategory(input) {
  const text = normalizeForMatch([input.profile, input.subject, input.message, input.source_page, input.channel].join(" "));
  if (/presse|journaliste|media|communication|institution/.test(text)) return "presse-institutionnel";
  if (/materiau|materiaux|reemploi|stock|palette|bois|fenetre|porte|mobilier|depose/.test(text)) return "materiaux-reemploi";
  if (/financeur|mecene|mecenat|fondation|investisseur|subvention|don\b|financement/.test(text)) return "financement-mecenat";
  if (/collectivite|mairie|commune|epci|metropole|departement|region|territoire|diagnostic|elu/.test(text)) return "collectivite-territoire";
  if (/proprietaire|logement|immeuble|bien|local|commerce|terrain|friche|batiment|vacant/.test(text)) return "bien-vacant-proprietaire";
  if (/entreprise|artisan|rse|competence|partenariat|partenaire|local de stockage/.test(text)) return "entreprise-partenariat";
  if (/benevole|citoyen|insertion|chantier|association|volontaire/.test(text)) return "benevolat-insertion";
  return "demande-generale";
}

function inferPriority(input) {
  const text = normalizeForMatch([input.profile, input.subject, input.message, input.source_page, input.channel].join(" "));
  if (/urgent|danger|securite|sinistre|risque|insalubre|habitat indigne|demain|immediat/.test(text)) return "urgente";
  if (/collectivite|mairie|commune|epci|metropole|financeur|mecene|fondation|rendez-vous|elu/.test(text)) return "haute";
  return "normale";
}

function poleFromCategory(category) {
  const map = {
    "collectivite-territoire": "Developpement territorial",
    "bien-vacant-proprietaire": "Habitat vivant",
    "materiaux-reemploi": "Materiautheque solidaire",
    "entreprise-partenariat": "Partenariats & RSE",
    "benevolat-insertion": "Mobilisation citoyenne",
    "financement-mecenat": "Financement & mecenat",
    "presse-institutionnel": "Communication institutionnelle",
    "demande-generale": "Accueil & orientation",
  };
  return map[category || "demande-generale"] || map["demande-generale"];
}

function slaDays(priority) {
  if (priority === "urgente") return 1;
  if (priority === "haute") return 2;
  return 5;
}

function addDaysIso(value, days) {
  const base = value ? new Date(value) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

function requestNumber(row) {
  if (row.request_number) return row.request_number;
  const year = new Date(row.created_at || Date.now()).getFullYear();
  const tail = String(row.id || "0000").replace(/-/g, "").slice(-4).toUpperCase().padStart(4, "0");
  return `TVF-${year}-${tail}`;
}

function missingPieces(category, message = "") {
  const text = normalizeForMatch(message);
  const has = (pattern) => pattern.test(text);
  const common = [];
  if (!has(/commune|territoire|adresse|ville|epci/)) common.push("territoire ou adresse precise");
  if (!has(/delai|date|calendrier|urgent/)) common.push("delai souhaite");

  const map = {
    "collectivite-territoire": ["besoin public identifie", "perimetre geographique", "interlocuteur referent"],
    "bien-vacant-proprietaire": ["adresse du bien", "photos recentes", "etat apparent", "situation de propriete ou mandat"],
    "materiaux-reemploi": ["nature des materiaux", "quantite estimee", "photos", "conditions d'enlevement"],
    "entreprise-partenariat": ["type de contribution", "contact referent", "contraintes RSE ou reporting"],
    "benevolat-insertion": ["disponibilites", "competences ou envies", "mobilite"],
    "financement-mecenat": ["type de soutien", "criteres de selection", "attentes de reporting"],
    "presse-institutionnel": ["media ou institution", "format attendu", "deadline"],
    "demande-generale": ["profil demandeur", "objet exact", "suite attendue"],
  };

  return [...common, ...(map[category || "demande-generale"] || map["demande-generale"])]
    .filter((item, index, values) => values.indexOf(item) === index)
    .slice(0, 6);
}

function qualificationScore(row, assistant) {
  let score = 25;
  if (row.email) score += 15;
  if (row.subject) score += 15;
  if ((row.message || "").length > 120) score += 20;
  if (row.category && row.category !== "demande-generale") score += 10;
  if (row.assigned_to) score += 10;
  if (assistant.missing_pieces.length === 0) score += 5;
  return Math.min(score, 100);
}

function buildAssistant(row) {
  const category = row.category || inferCategory(row);
  const priority = row.priority || inferPriority(row);
  const pole = row.pole || poleFromCategory(category);
  const pieces = Array.isArray(row.missing_pieces) && row.missing_pieces.length
    ? row.missing_pieces
    : missingPieces(category, row.message);
  const dueAt = row.next_action_due_at || addDaysIso(row.last_follow_up_at || row.updated_at || row.created_at, slaDays(priority));
  const nextAction = row.next_action || (pieces.length ? "Demander les pieces manquantes" : "Qualifier puis proposer la suite");
  const summary = row.ai_summary || `${pole} - ${category}. Priorite ${priority}. ${nextAction}.`;
  const assistant = {
    request_number: requestNumber(row),
    suggested_category: category,
    suggested_priority: priority,
    suggested_pole: pole,
    missing_pieces: pieces,
    next_action: nextAction,
    next_action_due_at: dueAt,
    ai_summary: summary,
    ai_confidence: Number(row.ai_confidence || 0.72),
  };
  assistant.qualification_score = row.qualification_score || qualificationScore(row, assistant);
  return assistant;
}

function enrichContact(row) {
  const assistant = buildAssistant(row || {});
  return {
    ...row,
    request_number: row.request_number || assistant.request_number,
    channel: row.channel || "site_web",
    pole: row.pole || assistant.suggested_pole,
    next_action: row.next_action || assistant.next_action,
    next_action_due_at: row.next_action_due_at || assistant.next_action_due_at,
    ai_summary: row.ai_summary || assistant.ai_summary,
    ai_confidence: row.ai_confidence || assistant.ai_confidence,
    qualification_score: row.qualification_score || assistant.qualification_score,
    missing_pieces: Array.isArray(row.missing_pieces) ? row.missing_pieces : assistant.missing_pieces,
    assistant,
  };
}

function mobileFlowLabel(flow) {
  return MOBILE_FLOW_LABELS[flow] || "Demande mobile";
}

function mobileRequestSelectColumns() {
  return [
    "id",
    "reference",
    "flow",
    "category",
    "status",
    "raw_address",
    "latitude",
    "longitude",
    "photo_bucket",
    "photo_path",
    "contact_name",
    "contact_email",
    "contact_phone",
    "payload",
    "created_at",
    "updated_at",
  ].join(",");
}

function mobileCategoryFromRequest(row) {
  const flow = clean(row?.flow || "", 80);
  const text = normalizeForMatch([row?.category, row?.payload?.category, row?.payload?.categoryLabel, row?.payload?.details?.title, row?.payload?.details?.description].join(" "));
  if (flow === "materials" || /materiau|materiaux|bois|fenetre|porte|stock|carrelage|mobilier/.test(text)) return "materiaux-reemploi";
  if (flow === "volunteer" || /benevole|chantier|insertion|volontaire/.test(text)) return "benevolat-insertion";
  if (/commerce|boutique|local commercial/.test(text)) return "bien-vacant-proprietaire";
  if (/terrain|friche|batiment|immeuble|logement|vacant|abandonne/.test(text) || ["signal", "property"].includes(flow)) return "bien-vacant-proprietaire";
  return "demande-generale";
}

function mobilePriorityFromRequest(row) {
  const text = normalizeForMatch([row?.category, row?.raw_address, row?.payload?.details?.title, row?.payload?.details?.description].join(" "));
  if (/danger|securite|sinistre|insalubre|urgence|risque/.test(text)) return "urgente";
  if (row?.flow === "property" || /collectivite|mairie|commerce|immeuble|batiment/.test(text)) return "haute";
  return "normale";
}

function enrichMobileRequest(row) {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const details = payload.details || {};
  const contact = payload.contact || {};
  const categoryLabel = clean(payload.categoryLabel || row?.category || payload.category || "", 160);
  return {
    ...row,
    display_label: mobileFlowLabel(row?.flow),
    category_label: categoryLabel || "Non classe",
    title: clean(details.title || categoryLabel || mobileFlowLabel(row?.flow), 180),
    description: clean(details.description || "", 1600),
    contact_name: row?.contact_name || contact.name || "",
    contact_email: row?.contact_email || contact.email || "",
    contact_phone: row?.contact_phone || contact.phone || "",
    target_category: mobileCategoryFromRequest(row),
    target_priority: mobilePriorityFromRequest(row),
    has_photo: Boolean(row?.photo_path || payload.media?.storagePath),
  };
}

function mobileMessage(row) {
  const item = enrichMobileRequest(row);
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const details = payload.details || {};
  const lines = [
    "Demande recue depuis TVF Mobile.",
    `Reference mobile : ${item.reference || "non renseignee"}`,
    `Type : ${item.display_label}`,
    `Categorie terrain : ${item.category_label}`,
    item.raw_address ? `Adresse / localisation : ${item.raw_address}` : "",
    item.latitude || item.longitude ? `Coordonnees : ${item.latitude || "?"}, ${item.longitude || "?"}` : "",
    details.quantity ? `Quantite : ${details.quantity}` : "",
    details.condition ? `Etat : ${details.condition}` : "",
    details.availability ? `Disponibilite : ${details.availability}` : "",
    details.objective ? `Objectif : ${details.objective}` : "",
    details.skills ? `Competences / disponibilites : ${details.skills}` : "",
    item.description ? `Description : ${item.description}` : "",
    item.photo_path ? `Photo : bucket ${item.photo_bucket || "non renseigne"} / ${item.photo_path}` : "Photo : aucune photo rattachee",
  ];
  return lines.filter(Boolean).join("\n");
}

function contactPayloadFromMobile(row) {
  const item = enrichMobileRequest(row);
  const category = item.target_category;
  const priority = item.target_priority;
  const subjectParts = [item.display_label, item.title, item.raw_address].filter(Boolean);
  const subject = subjectParts.join(" - ").slice(0, 260) || `Demande mobile ${item.reference || "TVF"}`;
  return {
    channel: "import",
    full_name: item.contact_name || "Contact mobile TVF",
    email: item.contact_email || "",
    subject,
    message: mobileMessage(row),
    category,
    priority,
    pole: poleFromCategory(category),
    source_page: "tvf-mobile",
    form_code: "MOB-01",
    internal_notes: [
      "Import depuis TVF Mobile.",
      `Reference mobile : ${item.reference || "non renseignee"}`,
      item.contact_phone ? `Telephone : ${item.contact_phone}` : "",
      item.photo_path ? `Piece photo a consulter dans Supabase Storage : ${item.photo_bucket || "bucket"}/${item.photo_path}` : "",
    ].filter(Boolean).join("\n"),
    next_action: "Qualifier la demande mobile et verifier les pieces disponibles",
  };
}
function caseTypeFromContactCategory(category, sourceText = "") {
  const text = normalizeForMatch(sourceText);
  if (category === "materiaux-reemploi") return "materiaux";
  if (category === "collectivite-territoire") return "collectivite";
  if (category === "entreprise-partenariat") return "entreprise";
  if (category === "benevolat-insertion") return "benevole";
  if (category === "financement-mecenat") return "financeur";
  if (category === "presse-institutionnel") return "presse";
  if (/commerce|boutique|local commercial|vitrine/.test(text)) return "commerce_inoccupe";
  if (/friche|terrain/.test(text)) return "friche_terrain";
  if (category === "bien-vacant-proprietaire") return "bien_vacant";
  if (/signalement/.test(text)) return "signalement";
  return "autre";
}

function casePoleFromType(type) {
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
    signalement: "Accueil & orientation",
  }[type] || "Accueil & orientation";
}

function casePayloadFromImportedContact(contact, mobileRequest) {
  const sourceText = [contact?.subject, contact?.message, mobileRequest?.category_label, mobileRequest?.raw_address].join(" ");
  const type = caseTypeFromContactCategory(contact?.category, sourceText);
  const photoLine = mobileRequest?.photo_path ? `Photo terrain rattachee : ${mobileRequest.photo_bucket || "bucket"}/${mobileRequest.photo_path}` : "Aucune photo terrain rattachee au depart.";
  return {
    source_request_id: contact?.id || "",
    case_type: type,
    title: contact?.subject || `Dossier mobile ${mobileRequest?.reference || "TVF"}`,
    status: "qualification",
    priority: contact?.priority || "normale",
    main_pole: contact?.pole || casePoleFromType(type),
    assigned_to: contact?.assigned_to || "",
    confidentiality_level: "standard",
    summary: [
      contact?.message || "Demande mobile importee dans TVF OS.",
      photoLine,
      mobileRequest?.reference ? `Reference mobile : ${mobileRequest.reference}` : "",
    ].filter(Boolean).join("\n\n"),
    next_action: mobileRequest?.has_photo ? "Verifier la photo terrain et completer l'instruction" : "Demander les pieces ou photos utiles",
    territory: mobileRequest?.raw_address || "",
    decision_status: "non_preparee",
    risk_level: ["bien_vacant", "commerce_inoccupe", "friche_terrain", "materiaux"].includes(type) ? "modere" : "faible",
    ai_summary: `${casePoleFromType(type)} - dossier cree depuis TVF Mobile, qualification initiale ${type}.`,
  };
}

function historyPayload(caseId, note) {
  return { case_id: caseId, from_status: null, to_status: "qualification", note: clean(note || "Creation du dossier depuis TVF Mobile", 1200), created_by: "TVF OS" };
}

async function createCaseFromImportedContact(contact, mobileRequest) {
  const payload = casePayloadFromImportedContact(contact, mobileRequest);
  const rows = await supabaseRequest("cases?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const created = rows?.[0] || null;
  if (created?.id) {
    await supabaseRequest("case_status_history", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(historyPayload(created.id, `Creation depuis la demande mobile ${mobileRequest?.reference || "TVF"}`)),
    }).catch(() => null);
  }
  return created;
}

function mobilePhotoFilename(mobileRequest) {
  const raw = String(mobileRequest?.photo_path || "photo-terrain-mobile.jpg").split("/").pop() || "photo-terrain-mobile.jpg";
  return raw.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 140) || "photo-terrain-mobile.jpg";
}

function mobilePhotoMimeType(fileName) {
  const text = String(fileName || "").toLowerCase();
  if (text.endsWith(".png")) return "image/png";
  if (text.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function findOrCreateMobilePhotoFile(mobileRequest) {
  if (!mobileRequest?.photo_path) return null;
  const bucket = clean(mobileRequest.photo_bucket || (mobileRequest.flow === "materials" ? "materiaux" : "signalements"), 120);
  const storagePath = clean(mobileRequest.photo_path, 500);
  const query = new URLSearchParams({ select: "*", storage_path: `eq.${storagePath}`, limit: "1" });
  const existing = await supabaseRequest(`files?${query.toString()}`).catch(() => []);
  if (existing?.[0]?.id) return existing[0];
  const filename = mobilePhotoFilename(mobileRequest);
  const payload = {
    storage_bucket: bucket,
    storage_path: storagePath,
    original_filename: filename,
    mime_type: mobilePhotoMimeType(filename),
    uploaded_by: "TVF Mobile",
    confidentiality_level: "interne",
    virus_scan_status: "pending",
    ai_summary: `Photo terrain recue via TVF Mobile - ${mobileRequest.reference || "reference mobile"}.`,
    sensitive_detected: false,
  };
  const rows = await supabaseRequest("files?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return rows?.[0] || null;
}

async function createMobilePhotoDocument(caseRow, mobileRequest) {
  if (!caseRow?.id || !mobileRequest?.photo_path) return null;
  const file = await findOrCreateMobilePhotoFile(mobileRequest);
  const payload = {
    title: `Photo terrain - ${mobileRequest.reference || caseRow.case_number || "TVF Mobile"}`,
    document_type: "photo",
    status: "a_classer",
    file_id: file?.id || null,
    related_object_type: "case",
    related_object_id: caseRow.id,
    confidentiality_level: "interne",
    ai_summary: `Photo transmise depuis TVF Mobile pour le dossier ${caseRow.case_number || caseRow.title || caseRow.id}.`,
    classification_notes: JSON.stringify({ source: "tvf-mobile", mobile_request_id: mobileRequest.id, reference: mobileRequest.reference, bucket: mobileRequest.photo_bucket, path: mobileRequest.photo_path, address: mobileRequest.raw_address || null }),
  };
  const rows = await supabaseRequest("documents?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return rows?.[0] || null;
}

async function tryCreateMobilePhotoDocument(caseRow, mobileRequest, req) {
  try {
    const document = await createMobilePhotoDocument(caseRow, mobileRequest);
    return { document, warning: null };
  } catch (error) {
    await writeAdminAudit({ supabaseRequest, req, moduleKey: "requests", action: "mobile_photo_document_failed", objectType: "case", objectId: caseRow?.id, summary: `Photo mobile non rattachee automatiquement au dossier ${caseRow?.case_number || caseRow?.id || "TVF"}.`, metadata: { mobile_request_id: mobileRequest?.id || null, error: clean(error?.message || "Erreur document", 500) } }).catch(() => null);
    return { document: null, warning: "Photo mobile non rattachee automatiquement : verifier le module Documents." };
  }
}
function selectColumns() {
  return [
    "id",
    "request_number",
    "full_name",
    "email",
    "subject",
    "message",
    "consent",
    "source_page",
    "channel",
    "form_code",
    "status",
    "priority",
    "category",
    "pole",
    "assigned_to",
    "internal_notes",
    "last_follow_up_at",
    "next_action",
    "next_action_due_at",
    "ai_summary",
    "ai_confidence",
    "qualification_score",
    "missing_pieces",
    "closure_reason",
    "closed_at",
    "created_at",
    "updated_at",
  ].join(",");
}

async function listMobileRequests(req) {
  const { restUrl, key } = supabaseConfig();
  const url = queryUrl(req);
  const params = new URLSearchParams();
  params.set("select", mobileRequestSelectColumns());
  params.set("order", "created_at.desc");
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 80)));
  const status = clean(url.searchParams.get("mobile_status") || "received_mobile", 80);
  if (status && status !== "all") params.set("status", `eq.${status}`);

  const response = await fetchWithTimeout(`${restUrl}/${MOBILE_REQUESTS_TABLE}?${params.toString()}`, {
    headers: supabaseHeaders(key),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Lecture des demandes mobile impossible.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  const rows = text ? JSON.parse(text) : [];
  return rows.map(enrichMobileRequest);
}

async function getMobileRequestById(id) {
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);
  params.set("select", mobileRequestSelectColumns());
  params.set("limit", "1");
  const rows = await supabaseRequest(`${MOBILE_REQUESTS_TABLE}?${params.toString()}`);
  return rows?.[0] ? enrichMobileRequest(rows[0]) : null;
}

async function markMobileImported(row, contact, req, context = {}) {
  const importedAt = new Date().toISOString();
  const payload = row?.payload && typeof row.payload === "object" ? { ...row.payload } : {};
  payload.tvf_os_import = {
    imported_at: importedAt,
    contact_id: contact?.id || null,
    request_number: contact?.request_number || null,
    case_id: context.caseRow?.id || null,
    case_number: context.caseRow?.case_number || null,
    document_id: context.document?.id || null,
    warning: context.warning || null,
    imported_by: clean(req?.headers?.["x-admin-user"] || "TVF OS", 120),
  };
  const updatePayload = {
    status: "imported_tvf_os",
    payload,
    updated_at: importedAt,
  };
  await supabaseRequest(`${MOBILE_REQUESTS_TABLE}?id=eq.${row.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(updatePayload),
  });
  return { ...row, status: updatePayload.status, payload };
}

async function importMobileRequest(data, req, options = {}) {
  const id = clean(data.mobile_request_id || data.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) {
    const error = new Error("Identifiant mobile invalide.");
    error.statusCode = 400;
    throw error;
  }
  const mobileRequest = await getMobileRequestById(id);
  if (!mobileRequest) {
    const error = new Error("Demande mobile introuvable.");
    error.statusCode = 404;
    throw error;
  }
  if (String(mobileRequest.status || "") === "imported_tvf_os") {
    const error = new Error("Cette demande mobile est deja importee dans TVF OS.");
    error.statusCode = 409;
    throw error;
  }

  let contact = await createContact(contactPayloadFromMobile(mobileRequest), req);
  let caseRow = null;
  let document = null;
  let warning = null;

  if (options.createCase) {
    caseRow = await createCaseFromImportedContact(contact, mobileRequest);
    const photoResult = await tryCreateMobilePhotoDocument(caseRow, mobileRequest, req);
    document = photoResult.document;
    warning = photoResult.warning;
    contact = await updateContact({
      id: contact.id,
      status: "accepte",
      next_action: `Dossier cree : ${caseRow?.case_number || caseRow?.title || "TVF OS"}`,
      internal_notes: [
        contact.internal_notes || "",
        caseRow?.case_number ? `Dossier cree automatiquement : ${caseRow.case_number}` : "Dossier cree automatiquement depuis TVF Mobile.",
        document?.document_number ? `Photo rattachee : ${document.document_number}` : "",
        warning || "",
      ].filter(Boolean).join("\n"),
    }, req) || contact;
  }

  const imported = await markMobileImported(mobileRequest, contact, req, { caseRow, document, warning });
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "requests", action: options.createCase ? "import_mobile_request_case" : "import_mobile_request", objectType: "mobile_request", objectId: mobileRequest.id, summary: `Import de la demande mobile ${mobileRequest.reference || mobileRequest.id} vers ${contact?.request_number || "TVF OS"}.`, metadata: { contact_id: contact?.id || null, case_id: caseRow?.id || null, document_id: document?.id || null, flow: mobileRequest.flow || null, category: mobileRequest.target_category || null, warning } });
  return { contact, case: caseRow, document, warning, mobileRequest: enrichMobileRequest(imported) };
}
async function listContacts(req) {
  const { restUrl, key } = supabaseConfig();
  const url = queryUrl(req);
  const params = new URLSearchParams();
  params.set("select", selectColumns());
  params.set("order", "created_at.desc");
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 80), 1), 200)));

  const status = clean(url.searchParams.get("status") || "", 80);
  const priority = clean(url.searchParams.get("priority") || "", 80);
  const category = clean(url.searchParams.get("category") || "", 120);
  const search = sanitizeSearch(url.searchParams.get("q") || "");

  if (status && status !== "all" && STATUS_VALUES.has(status)) params.set("status", `eq.${status}`);
  if (priority && priority !== "all" && PRIORITY_VALUES.has(priority)) params.set("priority", `eq.${priority}`);
  if (category && category !== "all" && CATEGORY_VALUES.has(category)) params.set("category", `eq.${category}`);
  if (search) {
    const pattern = `*${search}*`;
    const idClause = /^[0-9a-f-]{32,36}$/i.test(search) ? `,id.eq.${search}` : "";
    params.set("or", `(full_name.ilike.${pattern},email.ilike.${pattern},subject.ilike.${pattern},message.ilike.${pattern},category.ilike.${pattern},request_number.ilike.${pattern}${idClause})`);
  }

  const response = await fetchWithTimeout(`${restUrl}/${CONTACT_TABLE}?${params.toString()}`, {
    headers: supabaseHeaders(key),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Lecture Supabase impossible.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  const rows = text ? JSON.parse(text) : [];
  return rows.map(enrichContact);
}

function updatePayload(input) {
  const payload = {};
  const status = clean(input.status || "", 80);
  const priority = clean(input.priority || "", 80);
  const category = clean(input.category || "", 120);
  const channel = clean(input.channel || "", 80);

  if (status) {
    if (!STATUS_VALUES.has(status)) throw Object.assign(new Error("Statut invalide."), { statusCode: 400 });
    payload.status = status;
    if (status === "archive" && !input.closed_at) payload.closed_at = new Date().toISOString();
    if (status !== "archive" && input.reopen === true) payload.closed_at = null;
  }
  if (priority) {
    if (!PRIORITY_VALUES.has(priority)) throw Object.assign(new Error("Priorite invalide."), { statusCode: 400 });
    payload.priority = priority;
  }
  if (category) {
    if (!CATEGORY_VALUES.has(category)) throw Object.assign(new Error("Categorie invalide."), { statusCode: 400 });
    payload.category = category;
  }
  if (channel) {
    if (!CHANNEL_VALUES.has(channel)) throw Object.assign(new Error("Canal invalide."), { statusCode: 400 });
    payload.channel = channel;
  }
  if (Object.prototype.hasOwnProperty.call(input, "assigned_to")) payload.assigned_to = clean(input.assigned_to || "", 180) || null;
  if (Object.prototype.hasOwnProperty.call(input, "internal_notes")) payload.internal_notes = clean(input.internal_notes || "", 5000) || null;
  if (Object.prototype.hasOwnProperty.call(input, "last_follow_up_at")) payload.last_follow_up_at = clean(input.last_follow_up_at || "", 80) || null;
  if (Object.prototype.hasOwnProperty.call(input, "pole")) payload.pole = clean(input.pole || "", 160) || null;
  if (Object.prototype.hasOwnProperty.call(input, "next_action")) payload.next_action = clean(input.next_action || "", 260) || null;
  if (Object.prototype.hasOwnProperty.call(input, "next_action_due_at")) payload.next_action_due_at = clean(input.next_action_due_at || "", 80) || null;
  if (Object.prototype.hasOwnProperty.call(input, "closure_reason")) payload.closure_reason = clean(input.closure_reason || "", 800) || null;
  if (Object.prototype.hasOwnProperty.call(input, "missing_pieces")) {
    payload.missing_pieces = Array.isArray(input.missing_pieces)
      ? input.missing_pieces.map((item) => clean(item, 160)).filter(Boolean).slice(0, 12)
      : String(input.missing_pieces || "").slice(0, 1000).split(/[;\n,]/).map((item) => clean(item, 160)).filter(Boolean).slice(0, 12);
  }

  return payload;
}

async function updateContact(data, req) {
  const id = clean(data.id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) {
    const error = new Error("Identifiant de demande invalide.");
    error.statusCode = 400;
    throw error;
  }
  const payload = updatePayload(data);
  if (!Object.keys(payload).length) {
    const error = new Error("Aucune modification a enregistrer.");
    error.statusCode = 400;
    throw error;
  }

  const { restUrl, key } = supabaseConfig();
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);
  params.set("select", selectColumns());

  const response = await fetchWithTimeout(`${restUrl}/${CONTACT_TABLE}?${params.toString()}`, {
    method: "PATCH",
    headers: supabaseHeaders(key, { Prefer: "return=representation" }),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Mise a jour Supabase impossible.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  const rows = text ? JSON.parse(text) : [];
  const contact = rows[0] ? enrichContact(rows[0]) : null;
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "requests", action: "update_request", objectType: "contact_request", objectId: contact?.id || id, summary: `Mise a jour de la demande ${contact?.request_number || contact?.subject || id}.`, metadata: { status: contact?.status || payload.status || null, priority: contact?.priority || payload.priority || null, changed_fields: Object.keys(payload || {}) } });
  return contact;
}

function createPayload(input) {
  const fullName = clean(input.full_name || input.name || "", 180) || "Contact TVF";
  const email = clean(input.email || "", 220).toLowerCase() || "contact@territoiresvivantsfrance.fr";
  const subject = clean(input.subject || "", 260);
  const message = clean(input.message || "", 5000);
  const channel = clean(input.channel || "import", 80);
  if (!CHANNEL_VALUES.has(channel)) throw Object.assign(new Error("Canal invalide."), { statusCode: 400 });
  if (!subject && !message) throw Object.assign(new Error("La demande doit contenir un objet ou un message."), { statusCode: 400 });

  const category = clean(input.category || "", 120) || inferCategory({ ...input, channel, subject, message });
  const priority = clean(input.priority || "", 80) || inferPriority({ ...input, channel, subject, message });
  if (!CATEGORY_VALUES.has(category)) throw Object.assign(new Error("Categorie invalide."), { statusCode: 400 });
  if (!PRIORITY_VALUES.has(priority)) throw Object.assign(new Error("Priorite invalide."), { statusCode: 400 });
  const status = clean(input.status || "nouveau", 80);
  if (!STATUS_VALUES.has(status)) throw Object.assign(new Error("Statut invalide."), { statusCode: 400 });

  const pieces = missingPieces(category, message);
  return {
    full_name: fullName,
    email,
    subject: subject || `Demande ${channel}`,
    message: message || "Demande creee manuellement dans TVF OS.",
    consent: true,
    source_page: clean(input.source_page || `admin-demandes-${channel}`, 160),
    channel,
    form_code: clean(input.form_code || "F-00", 40),
    status,
    priority,
    category,
    pole: clean(input.pole || "", 160) || poleFromCategory(category),
    assigned_to: clean(input.assigned_to || "", 180) || null,
    internal_notes: clean(input.internal_notes || "", 5000) || "Creation manuelle depuis le module Demandes entrantes.",
    next_action: clean(input.next_action || "", 260) || (pieces.length ? "Demander les pieces manquantes" : "Qualifier la demande"),
    next_action_due_at: clean(input.next_action_due_at || "", 80) || addDaysIso(new Date().toISOString(), slaDays(priority)),
    missing_pieces: pieces,
    ai_summary: `${poleFromCategory(category)} - demande creee manuellement, qualification initiale ${category}.`,
    ai_confidence: 0.68,
    qualification_score: 45,
  };
}

async function createContact(data, req) {
  const payload = createPayload(data);
  const { restUrl, key } = supabaseConfig();
  const params = new URLSearchParams();
  params.set("select", selectColumns());

  const response = await fetchWithTimeout(`${restUrl}/${CONTACT_TABLE}?${params.toString()}`, {
    method: "POST",
    headers: supabaseHeaders(key, { Prefer: "return=representation" }),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Creation Supabase impossible.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  const rows = text ? JSON.parse(text) : [];
  const contact = rows[0] ? enrichContact(rows[0]) : null;
  await writeAdminAudit({ supabaseRequest, req, moduleKey: "requests", action: "create_request", objectType: "contact_request", objectId: contact?.id, summary: `Creation de la demande ${contact?.request_number || contact?.subject || "TVF"}.`, metadata: { category: contact?.category || payload.category, priority: contact?.priority || payload.priority, channel: contact?.channel || payload.channel } });
  return contact;
}

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    requireAdmin(req);
    if (req.method === "GET") {
      const action = clean(queryUrl(req).searchParams.get("action") || "", 80);
      if (action === "mobile-pending") {
        const mobileRequests = await listMobileRequests(req);
        sendJson(res, 200, { ok: true, mobileRequests });
        return;
      }
      const contacts = await listContacts(req);
      sendJson(res, 200, { ok: true, contacts });
      return;
    }
    if (req.method === "PATCH") {
      const data = await readJsonBody(req);
      const contact = await updateContact(data, req);
      sendJson(res, 200, { ok: true, contact });
      return;
    }
    if (req.method === "POST") {
      const data = await readJsonBody(req);
      if (data.type === "mobile-import" || data.type === "mobile-import-case") {
        const result = await importMobileRequest(data, req, { createCase: data.type === "mobile-import-case" });
        sendJson(res, 201, { ok: true, ...result });
        return;
      }
      const contact = await createContact(data, req);
      sendJson(res, 201, { ok: true, contact });
      return;
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      error: statusCode >= 500 ? "Action admin impossible pour le moment." : error.message,
      code: error.code || undefined,
      details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined,
    });
  }
}

module.exports = handler;
module.exports._private = {
  normalizeSupabaseRestUrl,
  inferCategory,
  inferPriority,
  poleFromCategory,
  missingPieces,
  buildAssistant,
  enrichContact,
  createPayload,
  updatePayload,
  enrichMobileRequest,
  contactPayloadFromMobile,
};
