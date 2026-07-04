const MAX_BODY_SIZE = 32 * 1024;
const CONTACT_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contacts";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function normalizeSupabaseRestUrl(rawUrl) {
  if (!rawUrl) return "";
  const trimmed = String(rawUrl).trim().replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY_SIZE) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      throw error;
    }
  }

  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    throw error;
  }
}

function clean(value, max = 1200) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanMultiline(value, max = 5000) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim().slice(0, max);
}

function validEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function compactObject(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== "" && value !== undefined && value !== null));
}

function buildSubmission(data, req) {
  const fields = data.fields && typeof data.fields === "object" ? data.fields : {};
  const profile = clean(fields.profil || data.profile, 120);
  const name = clean(fields.nom || fields.name || data.name, 180);
  const email = clean(fields.email || data.email, 220).toLowerCase();
  const phone = clean(fields.telephone || fields.phone || data.phone, 80);
  const territory = clean(fields.territoire || fields.location || data.territory, 240);
  const subject = clean(fields.objet || fields.subject || data.subject, 260);
  const message = cleanMultiline(fields.message || data.message, 5000);
  const formKind = clean(data.formKind || data.kind || "contact", 80);
  const summary = cleanMultiline(data.summary || "", 5000);
  const page = clean(data.page || "", 500);
  const section = clean(data.section || "", 160);

  return {
    profile,
    name,
    email,
    phone,
    territory,
    subject,
    message,
    formKind,
    summary,
    page,
    section,
    userAgent: clean(req.headers["user-agent"] || "", 500),
    referer: clean(req.headers.referer || req.headers.referrer || "", 500),
    ip: clean(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "", 120),
    raw: fields,
  };
}

function validateSubmission(data, submission) {
  if (clean(data.website || data.site || data.honeypot, 200)) {
    const error = new Error("Spam detected");
    error.statusCode = 204;
    throw error;
  }

  if (!validEmail(submission.email)) {
    const error = new Error("Adresse e-mail invalide.");
    error.statusCode = 400;
    throw error;
  }

  const hasMeaningfulContent = Boolean(submission.subject || submission.message || submission.summary || submission.territory);
  if (!hasMeaningfulContent) {
    const error = new Error("La demande est trop courte.");
    error.statusCode = 400;
    throw error;
  }
}

function candidateRows(submission) {
  const metadata = compactObject({
    form_kind: submission.formKind,
    page: submission.page,
    section: submission.section,
    summary: submission.summary,
    user_agent: submission.userAgent,
    referer: submission.referer,
    ip: submission.ip,
    raw_fields: submission.raw,
  });

  return [
    compactObject({
      profile: submission.profile,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      territory: submission.territory,
      subject: submission.subject,
      message: submission.message || submission.summary,
      status: "nouveau",
      source: "site_web",
      metadata,
    }),
    compactObject({
      profil: submission.profile,
      nom: submission.name,
      email: submission.email,
      telephone: submission.phone,
      territoire: submission.territory,
      objet: submission.subject,
      message: submission.message || submission.summary,
      statut: "nouveau",
      source: "site_web",
      metadata,
    }),
    compactObject({
      type: submission.formKind,
      nom: submission.name,
      email: submission.email,
      telephone: submission.phone,
      sujet: submission.subject,
      message: submission.message || submission.summary,
      donnees: metadata,
      statut: "nouveau",
    }),
    compactObject({
      name: submission.name,
      email: submission.email,
      subject: submission.subject,
      message: submission.message || submission.summary,
      metadata,
    }),
    compactObject({
      email: submission.email || "non-renseigne@territoiresvivantsfrance.fr",
      message: submission.message || submission.summary || submission.subject,
    }),
  ].filter((row) => Object.keys(row).length > 0);
}

async function insertIntoSupabase(submission) {
  const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!restUrl || !key) {
    const error = new Error("Supabase n'est pas configure sur Vercel.");
    error.statusCode = 503;
    throw error;
  }

  const endpoint = `${restUrl}/${CONTACT_TABLE}`;
  const rows = candidateRows(submission);
  let lastError = null;

  for (const row of rows) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (response.ok) return true;

    const errorText = await response.text().catch(() => "");
    lastError = { status: response.status, body: errorText };

    if (![400, 404, 409].includes(response.status)) {
      break;
    }
  }

  const error = new Error("Supabase a refuse l'enregistrement du formulaire.");
  error.statusCode = 502;
  error.details = lastError;
  throw error;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
    return;
  }

  try {
    const data = await readJsonBody(req);
    const submission = buildSubmission(data, req);
    validateSubmission(data, submission);
    await insertIntoSupabase(submission);
    sendJson(res, 200, { ok: true, message: "Demande enregistree." });
  } catch (error) {
    if (error.statusCode === 204) {
      res.statusCode = 204;
      res.end();
      return;
    }

    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      error: statusCode >= 500 ? "Le formulaire n'a pas pu etre enregistre pour le moment." : error.message,
      details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined,
    });
  }
};
