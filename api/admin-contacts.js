const crypto = require("crypto");

const CONTACT_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contacts";
const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const STATUS_VALUES = new Set(["nouveau", "a_qualifier", "en_cours", "rendez_vous", "en_attente", "accepte", "refuse", "archive"]);
const PRIORITY_VALUES = new Set(["normale", "haute", "urgente"]);
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

function tokenFromRequest(req) {
  const authorization = clean(req.headers.authorization || "", 4000);
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return cleanEnvToken(authorization.slice(7), 3000);
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

function queryUrl(req) {
  return new URL(req.url, "https://admin.local");
}

function sanitizeSearch(value) {
  return clean(value, 120).replace(/[*,()]/g, " ");
}

function selectColumns() {
  return [
    "id",
    "full_name",
    "email",
    "subject",
    "message",
    "consent",
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
    params.set("or", `(full_name.ilike.${pattern},email.ilike.${pattern},subject.ilike.${pattern},message.ilike.${pattern},category.ilike.${pattern})`);
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
  return text ? JSON.parse(text) : [];
}

function updatePayload(input) {
  const payload = {};
  const status = clean(input.status || "", 80);
  const priority = clean(input.priority || "", 80);
  const category = clean(input.category || "", 120);

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
  if (Object.prototype.hasOwnProperty.call(input, "assigned_to")) payload.assigned_to = clean(input.assigned_to || "", 180) || null;
  if (Object.prototype.hasOwnProperty.call(input, "internal_notes")) payload.internal_notes = clean(input.internal_notes || "", 5000) || null;
  if (Object.prototype.hasOwnProperty.call(input, "last_follow_up_at")) payload.last_follow_up_at = clean(input.last_follow_up_at || "", 80) || null;

  return payload;
}

async function updateContact(data) {
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
  return rows[0] || null;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    requireAdmin(req);
    if (req.method === "GET") {
      const contacts = await listContacts(req);
      sendJson(res, 200, { ok: true, contacts });
      return;
    }
    if (req.method === "PATCH") {
      const data = await readJsonBody(req);
      const contact = await updateContact(data);
      sendJson(res, 200, { ok: true, contact });
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
};
