const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const CONTACT_TYPES = new Set(["proprietaire", "elu", "technicien", "entreprise_contact", "benevole", "financeur", "journaliste", "citoyen", "partenaire", "autre"]);
const CONSENT_VALUES = new Set(["unknown", "pending", "granted", "refused", "expired"]);
const CONFIDENTIALITY_VALUES = new Set(["public", "standard", "confidentiel", "sensible"]);
const ORG_TYPES = new Set(["collectivite", "entreprise", "association", "financeur", "institution", "media", "proprietaire_personne_morale", "partenaire", "fournisseur", "autre"]);
const RELATION_VALUES = new Set(["prospect", "actif", "conventionne", "ancien", "sensible"]);
const HISTORY_TYPES = new Set(["note", "email", "appel", "rendez_vous", "document", "demande", "relance", "decision"]);
const DUPLICATE_STATUS = new Set(["pending", "confirmed", "ignored", "merged"]);

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
    if (body.length > 32 * 1024) {
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
  const headers = { apikey: key, "Content-Type": "application/json", ...extra };
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
  return new URL(req.url, "https://admin.local");
}

function normalizeForMatch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeKey(value) {
  return normalizeForMatch(value).replace(/[^a-z0-9@.+-]+/g, "");
}

function splitName(displayName) {
  const name = clean(displayName || "", 180);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length <= 1) return { first_name: name, last_name: "" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts.slice(-1).join(" ") };
}

function inferContactType(input) {
  const text = normalizeForMatch([input.contact_type, input.role_label, input.display_name, input.email, input.notes, input.tags?.join(" ")].join(" "));
  if (/maire|elu|elue|adjoint/.test(text)) return "elu";
  if (/technicien|charge de mission|urbanisme|habitat/.test(text)) return "technicien";
  if (/proprietaire|bailleur/.test(text)) return "proprietaire";
  if (/financeur|mecene|fondation|banque/.test(text)) return "financeur";
  if (/presse|journaliste|media/.test(text)) return "journaliste";
  if (/benevole|volontaire/.test(text)) return "benevole";
  if (/entreprise|dirigeant|rse|artisan/.test(text)) return "entreprise_contact";
  if (/partenaire/.test(text)) return "partenaire";
  if (/citoyen|habitante|habitant/.test(text)) return "citoyen";
  return "autre";
}

function inferOrganizationType(input) {
  const text = normalizeForMatch([input.organization_type, input.name, input.sub_type, input.email, input.website, input.notes, input.tags?.join(" ")].join(" "));
  if (/mairie|commune|metropole|epci|departement|region|collectivite/.test(text)) return "collectivite";
  if (/fondation|financeur|mecene|banque|subvention/.test(text)) return "financeur";
  if (/journal|media|presse|radio|tv/.test(text)) return "media";
  if (/association|asso/.test(text)) return "association";
  if (/institution|prefecture|etat|agence/.test(text)) return "institution";
  if (/sarl|sas|entreprise|btp|artisan|rse|transport/.test(text)) return "entreprise";
  if (/proprietaire|fonciere|sci/.test(text)) return "proprietaire_personne_morale";
  if (/fournisseur|prestataire/.test(text)) return "fournisseur";
  return "partenaire";
}

function nextActionForContact(row) {
  if (row.next_action) return row.next_action;
  if (row.consent_status !== "granted") return "Verifier ou demander le consentement RGPD";
  if (!row.email && !row.phone && !row.mobile) return "Completer les coordonnees";
  return "Qualifier la relation et rattacher une organisation si besoin";
}

function nextActionForOrganization(row) {
  if (row.next_action) return row.next_action;
  if (row.relation_status === "prospect") return "Qualifier le potentiel de partenariat";
  if (row.relation_status === "conventionne") return "Verifier la prochaine echeance de convention";
  return "Planifier une relance relationnelle";
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function tagsArray(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 80)).filter(Boolean).slice(0, 20);
  return clean(value || "", 1000).split(/[;,\n]/).map((item) => clean(item, 80)).filter(Boolean).slice(0, 20);
}

function crmAssistant(entity, type) {
  if (type === "organization") {
    const missing = [];
    if (!entity.organization_type) missing.push("type organisation");
    if (!entity.city && !entity.department && !entity.region) missing.push("territoire");
    if (!entity.email && !entity.phone && !entity.website) missing.push("coordonnees");
    const nextAction = nextActionForOrganization(entity);
    return {
      summary: entity.ai_summary || `Organisation ${entity.organization_type || inferOrganizationType(entity)} - relation ${entity.relation_status || "prospect"}.`,
      missing_fields: missing,
      next_action: nextAction,
      next_action_due_at: entity.next_action_due_at || addDaysIso(entity.relation_status === "sensible" ? 2 : 14),
      duplicate_key: entity.duplicate_key || normalizeKey(entity.siret || entity.email || entity.name),
    };
  }
  const missing = [];
  if (!entity.email && !entity.phone && !entity.mobile) missing.push("coordonnees");
  if (entity.consent_status !== "granted") missing.push("consentement RGPD");
  if (!entity.contact_type || entity.contact_type === "autre") missing.push("role externe");
  const nextAction = nextActionForContact(entity);
  return {
    summary: entity.ai_summary || `Contact ${entity.contact_type || inferContactType(entity)} - consentement ${entity.consent_status || "unknown"}.`,
    missing_fields: missing,
    next_action: nextAction,
    next_action_due_at: entity.next_action_due_at || addDaysIso(missing.includes("consentement RGPD") ? 3 : 14),
    duplicate_key: entity.duplicate_key || normalizeKey(entity.email || entity.display_name),
  };
}

function enrichContact(row) {
  const assistant = crmAssistant(row || {}, "contact");
  return {
    ...row,
    contact_type: row.contact_type || inferContactType(row),
    consent_status: row.consent_status || "unknown",
    confidentiality_level: row.confidentiality_level || "standard",
    next_action: row.next_action || assistant.next_action,
    next_action_due_at: row.next_action_due_at || assistant.next_action_due_at,
    duplicate_key: row.duplicate_key || assistant.duplicate_key,
    assistant,
  };
}

function enrichOrganization(row) {
  const assistant = crmAssistant(row || {}, "organization");
  return {
    ...row,
    organization_type: row.organization_type || inferOrganizationType(row),
    relation_status: row.relation_status || "prospect",
    confidentiality_level: row.confidentiality_level || "standard",
    next_action: row.next_action || assistant.next_action,
    next_action_due_at: row.next_action_due_at || assistant.next_action_due_at,
    duplicate_key: row.duplicate_key || assistant.duplicate_key,
    assistant,
  };
}

function validateEnum(set, value, message) {
  if (value && !set.has(value)) throw Object.assign(new Error(message), { statusCode: 400 });
}

function contactPayload(input, partial = false) {
  const display = clean(input.display_name || input.full_name || input.name || "", 180);
  const split = splitName(display);
  const payload = {};
  const fields = {
    first_name: clean(input.first_name || split.first_name, 100),
    last_name: clean(input.last_name || split.last_name, 100),
    display_name: display,
    email: clean(input.email || "", 220).toLowerCase(),
    phone: clean(input.phone || "", 80),
    mobile: clean(input.mobile || "", 80),
    contact_type: clean(input.contact_type || "", 80),
    consent_status: clean(input.consent_status || "", 80),
    consent_source: clean(input.consent_source || "", 180),
    confidentiality_level: clean(input.confidentiality_level || "", 80),
    source: clean(input.source || "", 100),
    notes: clean(input.notes || "", 5000),
    next_action: clean(input.next_action || "", 260),
    next_action_due_at: clean(input.next_action_due_at || "", 80),
  };
  if (!partial) {
    fields.display_name = fields.display_name || fields.email || "Contact TVF";
    fields.contact_type = fields.contact_type || inferContactType({ ...input, display_name: fields.display_name });
    fields.consent_status = fields.consent_status || "unknown";
    fields.confidentiality_level = fields.confidentiality_level || "standard";
    fields.source = fields.source || "manual";
  }
  validateEnum(CONTACT_TYPES, fields.contact_type, "Type de contact invalide.");
  validateEnum(CONSENT_VALUES, fields.consent_status, "Statut de consentement invalide.");
  validateEnum(CONFIDENTIALITY_VALUES, fields.confidentiality_level, "Niveau de confidentialite invalide.");
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["display_name", "contact_type", "consent_status", "confidentiality_level", "source"].includes(key)) {
      if (value) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (Object.prototype.hasOwnProperty.call(input, "tags")) payload.tags = tagsArray(input.tags);
  const assistant = crmAssistant(payload, "contact");
  if (!partial || Object.prototype.hasOwnProperty.call(input, "next_action")) payload.next_action = payload.next_action || assistant.next_action;
  if (!partial || Object.prototype.hasOwnProperty.call(input, "next_action_due_at")) payload.next_action_due_at = payload.next_action_due_at || assistant.next_action_due_at;
  payload.ai_summary = assistant.summary;
  return payload;
}

function organizationPayload(input, partial = false) {
  const payload = {};
  const fields = {
    name: clean(input.name || "", 220),
    organization_type: clean(input.organization_type || "", 100),
    sub_type: clean(input.sub_type || "", 160),
    siret: clean(input.siret || "", 40),
    website: clean(input.website || "", 260),
    email: clean(input.email || "", 220).toLowerCase(),
    phone: clean(input.phone || "", 80),
    address: clean(input.address || "", 260),
    city: clean(input.city || "", 120),
    department: clean(input.department || "", 120),
    region: clean(input.region || "", 120),
    relation_status: clean(input.relation_status || "", 80),
    confidentiality_level: clean(input.confidentiality_level || "", 80),
    contribution_potential: clean(input.contribution_potential || "", 1200),
    next_action: clean(input.next_action || "", 260),
    next_action_due_at: clean(input.next_action_due_at || "", 80),
    notes: clean(input.notes || "", 5000),
  };
  if (!partial) {
    if (!fields.name) throw Object.assign(new Error("Nom organisation requis."), { statusCode: 400 });
    fields.organization_type = fields.organization_type || inferOrganizationType(fields);
    fields.relation_status = fields.relation_status || "prospect";
    fields.confidentiality_level = fields.confidentiality_level || "standard";
  }
  validateEnum(ORG_TYPES, fields.organization_type, "Type d'organisation invalide.");
  validateEnum(RELATION_VALUES, fields.relation_status, "Niveau de relation invalide.");
  validateEnum(CONFIDENTIALITY_VALUES, fields.confidentiality_level, "Niveau de confidentialite invalide.");
  Object.entries(fields).forEach(([key, value]) => {
    if (!partial || Object.prototype.hasOwnProperty.call(input, key) || ["organization_type", "relation_status", "confidentiality_level"].includes(key)) {
      if (value) payload[key] = value;
      else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null;
    }
  });
  if (Object.prototype.hasOwnProperty.call(input, "tags")) payload.tags = tagsArray(input.tags);
  const assistant = crmAssistant(payload, "organization");
  if (!partial || Object.prototype.hasOwnProperty.call(input, "next_action")) payload.next_action = payload.next_action || assistant.next_action;
  if (!partial || Object.prototype.hasOwnProperty.call(input, "next_action_due_at")) payload.next_action_due_at = payload.next_action_due_at || assistant.next_action_due_at;
  payload.ai_summary = assistant.summary;
  return payload;
}

function searchParamsForList(url, entity) {
  const params = new URLSearchParams();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 120), 1), 200);
  params.set("limit", String(limit));
  params.set("order", "updated_at.desc");
  const q = clean(url.searchParams.get("q") || "", 120).replace(/[*,()]/g, " ");
  if (entity === "contacts") {
    params.set("select", "*,organization_contacts(id,role_label,is_primary,organizations(id,name,organization_type,relation_status))");
    const type = clean(url.searchParams.get("contact_type") || "", 80);
    const consent = clean(url.searchParams.get("consent_status") || "", 80);
    if (type && type !== "all" && CONTACT_TYPES.has(type)) params.set("contact_type", `eq.${type}`);
    if (consent && consent !== "all" && CONSENT_VALUES.has(consent)) params.set("consent_status", `eq.${consent}`);
    if (q) params.set("or", `(display_name.ilike.*${q}*,email.ilike.*${q}*,phone.ilike.*${q}*,notes.ilike.*${q}*)`);
  } else {
    params.set("select", "*,organization_contacts(id,role_label,is_primary,crm_contacts(id,display_name,email,contact_type))");
    const type = clean(url.searchParams.get("organization_type") || "", 100);
    const relation = clean(url.searchParams.get("relation_status") || "", 80);
    if (type && type !== "all" && ORG_TYPES.has(type)) params.set("organization_type", `eq.${type}`);
    if (relation && relation !== "all" && RELATION_VALUES.has(relation)) params.set("relation_status", `eq.${relation}`);
    if (q) params.set("or", `(name.ilike.*${q}*,email.ilike.*${q}*,city.ilike.*${q}*,siret.ilike.*${q}*,notes.ilike.*${q}*)`);
  }
  return params;
}

async function supabaseRequest(path, options = {}) {
  const { restUrl, key } = supabaseConfig();
  const response = await fetchWithTimeout(`${restUrl}/${path}`, {
    ...options,
    headers: supabaseHeaders(key, options.headers || {}),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Requete Supabase impossible.");
    error.statusCode = 502;
    error.details = text;
    throw error;
  }
  return text ? JSON.parse(text) : null;
}

async function listContacts(req) {
  const params = searchParamsForList(queryUrl(req), "contacts");
  const rows = await supabaseRequest(`crm_contacts?${params.toString()}`);
  return (rows || []).map(enrichContact);
}

async function listOrganizations(req) {
  const params = searchParamsForList(queryUrl(req), "organizations");
  const rows = await supabaseRequest(`organizations?${params.toString()}`);
  return (rows || []).map(enrichOrganization);
}

async function listHistory(req) {
  const url = queryUrl(req);
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("order", "occurred_at.desc");
  params.set("limit", String(Math.min(Math.max(Number(url.searchParams.get("limit") || 80), 1), 200)));
  const contactId = clean(url.searchParams.get("contact_id") || "", 80);
  const organizationId = clean(url.searchParams.get("organization_id") || "", 80);
  if (contactId) params.set("related_contact_id", `eq.${contactId}`);
  if (organizationId) params.set("related_organization_id", `eq.${organizationId}`);
  return (await supabaseRequest(`relationship_history?${params.toString()}`)) || [];
}

async function listDuplicates(req) {
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("status", "eq.pending");
  params.set("order", "confidence.desc");
  params.set("limit", "100");
  return (await supabaseRequest(`crm_duplicate_suggestions?${params.toString()}`)) || [];
}

async function createRow(table, payload, enrich) {
  const params = new URLSearchParams();
  params.set("select", "*");
  const rows = await supabaseRequest(`${table}?${params.toString()}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return enrich ? enrich(rows?.[0] || null) : rows?.[0] || null;
}

async function updateRow(table, id, payload, enrich) {
  const cleanId = clean(id || "", 80);
  if (!/^[0-9a-f-]{32,36}$/i.test(cleanId)) throw Object.assign(new Error("Identifiant invalide."), { statusCode: 400 });
  if (!Object.keys(payload).length) throw Object.assign(new Error("Aucune modification a enregistrer."), { statusCode: 400 });
  const params = new URLSearchParams();
  params.set("id", `eq.${cleanId}`);
  params.set("select", "*");
  const rows = await supabaseRequest(`${table}?${params.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return enrich ? enrich(rows?.[0] || null) : rows?.[0] || null;
}

function historyPayload(input) {
  const interactionType = clean(input.interaction_type || "note", 80);
  validateEnum(HISTORY_TYPES, interactionType, "Type d'interaction invalide.");
  const subject = clean(input.subject || "", 260);
  if (!subject) throw Object.assign(new Error("Sujet d'historique requis."), { statusCode: 400 });
  const payload = {
    related_contact_id: clean(input.related_contact_id || input.contact_id || "", 80) || null,
    related_organization_id: clean(input.related_organization_id || input.organization_id || "", 80) || null,
    interaction_type: interactionType,
    subject,
    summary: clean(input.summary || "", 5000) || null,
    channel: clean(input.channel || "", 80) || null,
    occurred_at: clean(input.occurred_at || "", 80) || new Date().toISOString(),
    created_by: clean(input.created_by || "TVF OS", 180),
  };
  if (!payload.related_contact_id && !payload.related_organization_id) throw Object.assign(new Error("Un contact ou une organisation doit etre rattache."), { statusCode: 400 });
  return payload;
}

function linkPayload(input) {
  const organizationId = clean(input.organization_id || "", 80);
  const contactId = clean(input.contact_id || "", 80);
  if (!organizationId || !contactId) throw Object.assign(new Error("Contact et organisation requis."), { statusCode: 400 });
  return {
    organization_id: organizationId,
    contact_id: contactId,
    role_label: clean(input.role_label || "", 160) || null,
    is_primary: input.is_primary === true || String(input.is_primary || "").toLowerCase() === "true",
    notes: clean(input.notes || "", 1200) || null,
  };
}

async function dashboardCrm() {
  const [contacts, organizations, duplicates] = await Promise.all([
    supabaseRequest("crm_contacts?select=id,contact_type,consent_status,next_action_due_at,archived_at&limit=1000"),
    supabaseRequest("organizations?select=id,organization_type,relation_status,next_action_due_at,archived_at&limit=1000"),
    supabaseRequest("crm_duplicate_suggestions?select=id,status&status=eq.pending&limit=1000"),
  ]);
  const activeContacts = (contacts || []).filter((item) => !item.archived_at);
  const activeOrgs = (organizations || []).filter((item) => !item.archived_at);
  const now = Date.now();
  return {
    contacts_total: activeContacts.length,
    organizations_total: activeOrgs.length,
    consent_missing: activeContacts.filter((item) => item.consent_status !== "granted").length,
    overdue_actions: [...activeContacts, ...activeOrgs].filter((item) => item.next_action_due_at && new Date(item.next_action_due_at).getTime() < now).length,
    duplicates_pending: (duplicates || []).length,
  };
}

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  try {
    requireAdmin(req);
    const url = queryUrl(req);
    const entity = clean(url.searchParams.get("entity") || "contacts", 80);

    if (req.method === "GET") {
      if (entity === "contacts") return sendJson(res, 200, { ok: true, contacts: await listContacts(req) });
      if (entity === "organizations") return sendJson(res, 200, { ok: true, organizations: await listOrganizations(req) });
      if (entity === "history") return sendJson(res, 200, { ok: true, history: await listHistory(req) });
      if (entity === "duplicates") return sendJson(res, 200, { ok: true, duplicates: await listDuplicates(req) });
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboardCrm() });
      return sendJson(res, 400, { ok: false, error: "Entite CRM inconnue." });
    }

    const data = await readJsonBody(req);
    const type = clean(data.type || entity, 80);

    if (req.method === "POST") {
      if (type === "contact") return sendJson(res, 201, { ok: true, contact: await createRow("crm_contacts", contactPayload(data), enrichContact) });
      if (type === "organization") return sendJson(res, 201, { ok: true, organization: await createRow("organizations", organizationPayload(data), enrichOrganization) });
      if (type === "history") return sendJson(res, 201, { ok: true, item: await createRow("relationship_history", historyPayload(data)) });
      if (type === "link") return sendJson(res, 201, { ok: true, link: await createRow("organization_contacts", linkPayload(data)) });
    }

    if (req.method === "PATCH") {
      if (type === "contact") return sendJson(res, 200, { ok: true, contact: await updateRow("crm_contacts", data.id, contactPayload(data, true), enrichContact) });
      if (type === "organization") return sendJson(res, 200, { ok: true, organization: await updateRow("organizations", data.id, organizationPayload(data, true), enrichOrganization) });
      if (type === "duplicate") {
        const status = clean(data.status || "", 80);
        validateEnum(DUPLICATE_STATUS, status, "Statut de doublon invalide.");
        return sendJson(res, 200, { ok: true, duplicate: await updateRow("crm_duplicate_suggestions", data.id, { status, reviewed_by: clean(data.reviewed_by || "TVF OS", 180), reviewed_at: new Date().toISOString() }) });
      }
    }

    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      error: statusCode >= 500 ? "CRM indisponible pour le moment." : error.message,
      code: error.code || undefined,
      details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined,
    });
  }
}

module.exports = handler;
module.exports._private = {
  normalizeSupabaseRestUrl,
  inferContactType,
  inferOrganizationType,
  crmAssistant,
  enrichContact,
  enrichOrganization,
  contactPayload,
  organizationPayload,
  historyPayload,
  linkPayload,
};
