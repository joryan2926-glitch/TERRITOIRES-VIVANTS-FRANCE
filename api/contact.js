const tls = require("tls");
const { consumeRateLimit } = require("../lib/api/rate-limit");
const MAX_BODY_SIZE = Number(process.env.TVF_CONTACT_MAX_BODY_SIZE || 6 * 1024 * 1024);
const CONTACT_TABLE = process.env.SUPABASE_CONTACTS_TABLE || "contacts";
const DEFAULT_CONTACT_EMAIL = "contact@territoiresvivantsfrance.fr";
const DEFAULT_NOTIFICATION_EMAIL = "territoiresvivantsfrance@gmail.com";
const FALLBACK_NOTIFICATION_EMAIL = "territoiresvivantsfrance@gmail.com";
const DEFAULT_FROM = "Territoires Vivants France <notifications@territoiresvivantsfrance.fr>";
const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const MAX_ATTACHMENT_BYTES = Number(process.env.TVF_CONTACT_MAX_ATTACHMENT_BYTES || 4 * 1024 * 1024);
const MAX_TOTAL_ATTACHMENT_BYTES = Number(process.env.TVF_CONTACT_MAX_TOTAL_ATTACHMENT_BYTES || 8 * 1024 * 1024);

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function cleanEnvToken(value, max = 3000) {
  return clean(value || "", max)
    .replace(/^[`'",;]+|[`'",;]+$/g, "")
    .replace(/\s+/g, "");
}

function cleanEnvUrl(value) {
  return clean(value || "", 600).replace(/^[`'",;]+|[`'",;]+$/g, "");
}

function normalizeSupabaseRestUrl(rawUrl) {
  const cleaned = cleanEnvUrl(rawUrl);
  if (!cleaned) return "";
  const trimmed = cleaned.replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = OUTBOUND_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
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
function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function inferCategory(input) {
  const text = normalizeForMatch([
    input.profile,
    input.subject,
    input.message,
    input.summary,
    input.page,
    input.section,
    input.formKind,
  ].join(" "));

  if (/presse|journaliste|media|communication/.test(text)) return "presse-institutionnel";
  if (/financeur|mecene|mecenat|fondation|investisseur|subvention|don\b|financement/.test(text)) return "financement-mecenat";
  if (/materiau|materiaux|reemploi|stock|palettes|bois|fenetre|porte|mobilier|don de materiaux/.test(text)) return "materiaux-reemploi";
  if (/collectivite|mairie|commune|epci|metropole|departement|region|territoire partenaire|diagnostic/.test(text)) return "collectivite-territoire";
  if (/proprietaire|logement|immeuble|bien|local|commerce|terrain|friche|batiment/.test(text)) return "bien-vacant-proprietaire";
  if (/entreprise|artisan|rse|competence|partenariat|partenaire|local de stockage/.test(text)) return "entreprise-partenariat";
  if (/benevole|citoyen|insertion|chantier|association|volontaire/.test(text)) return "benevolat-insertion";
  return "demande-generale";
}

function inferPriority(input) {
  const text = normalizeForMatch([
    input.profile,
    input.subject,
    input.message,
    input.summary,
    input.page,
    input.section,
    input.formKind,
  ].join(" "));

  if (/urgent|danger|securite|sinistre|risque|insalubre|habitat indigne/.test(text)) return "urgente";
  if (/collectivite|mairie|commune|epci|metropole|financeur|mecene|fondation|rendez-vous/.test(text)) return "haute";
  return "normale";
}

function safeFilename(value, fallback = "piece-jointe") {
  const cleaned = clean(String(value || ""), 180)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function normalizeAttachment(input, index) {
  if (!input || typeof input !== "object") return null;
  const filename = safeFilename(input.filename || input.name, `piece-jointe-${index + 1}`);
  const contentType = clean(input.contentType || input.type || "application/octet-stream", 120).toLowerCase();
  const rawContent = String(input.content || input.base64 || input.data || "").replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
  if (!rawContent) return null;
  if (!/^[a-z0-9+/=]+$/i.test(rawContent)) return null;
  const bytes = Buffer.byteLength(rawContent, "base64");
  if (!bytes || bytes > MAX_ATTACHMENT_BYTES) return null;
  const allowed = /^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/i.test(contentType);
  if (!allowed) return null;
  return { filename, contentType, content: rawContent, bytes };
}

function normalizeAttachments(data) {
  const raw = Array.isArray(data.attachments) ? data.attachments : Array.isArray(data.files) ? data.files : [];
  const accepted = [];
  let total = 0;
  for (const [index, item] of raw.entries()) {
    const attachment = normalizeAttachment(item, index);
    if (!attachment) continue;
    if (total + attachment.bytes > MAX_TOTAL_ATTACHMENT_BYTES) break;
    accepted.push(attachment);
    total += attachment.bytes;
  }
  return accepted;
}

function pdfEscape(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 900);
}

function wrapPdfLine(label, value) {
  const text = `${label}: ${display(value)}`;
  const chunks = [];
  for (let i = 0; i < text.length; i += 90) chunks.push(text.slice(i, i + 90));
  return chunks;
}

function createSubmissionPdf(submission) {
  const title = "Formulaire de contact TVF";
  const lines = [
    title,
    `Reference: ${submission.reference || "Demande site"}`,
    `Date: ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
    "",
    ...submissionRows(submission).flatMap(([label, value]) => wrapPdfLine(label, value)),
    "",
    "Message:",
    ...String(submission.message || submission.summary || "Non renseigne").split(/\r?\n/).flatMap((line) => wrapPdfLine("", line || " ")),
    "",
    `Pieces jointes transmises: ${submission.attachments?.length || 0}`,
    "Document genere automatiquement par Territoires Vivants France."
  ].slice(0, 55);

  const textStream = ["BT", "/F1 11 Tf", "50 790 Td"];
  lines.forEach((line, index) => {
    if (index > 0) textStream.push("0 -15 Td");
    textStream.push(`(${pdfEscape(line)}) Tj`);
  });
  textStream.push("ET");
  const stream = textStream.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`
  ];
  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  for (const obj of objects) {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
    offset += Buffer.byteLength(obj, "utf8");
  }
  const body = `%PDF-1.4\n${objects.join("")}`;
  const trailer = `xref\n0 ${objects.length + 1}\n${xref.join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${Buffer.byteLength(body, "utf8")}\n%%EOF\n`;
  return Buffer.from(body + trailer, "utf8").toString("base64");
}

function emailAttachments(submission) {
  return [
    {
      filename: `formulaire-tvf-${Date.now()}.pdf`,
      contentType: "application/pdf",
      content: createSubmissionPdf(submission),
    },
    ...(submission.attachments || []),
  ];
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
  const consent = ["true", "1", "yes", "oui", "on"].includes(String(fields.consent || data.consent || "").toLowerCase());
  const submittedAfterMs = Number(data.submittedAfterMs || 0) || 0;
  const classificationInput = { profile, subject, message, summary, page, section, formKind };
  const category = clean(fields.categorie || fields.category || data.category || inferCategory(classificationInput), 120);
  const priority = clean(fields.priorite || fields.priority || data.priority || inferPriority(classificationInput), 80);
  const status = "nouveau";

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
    category,
    priority,
    status,
    consent,
    submittedAfterMs,
    userAgent: clean(req.headers["user-agent"] || "", 500),
    referer: clean(req.headers.referer || req.headers.referrer || "", 500),
    ip: clean(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "", 120),
    raw: fields,
    attachments: normalizeAttachments(data),
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

  if (!submission.consent) {
    const error = new Error("Vous devez accepter l'utilisation de vos informations pour que TVF puisse traiter votre demande.");
    error.statusCode = 400;
    error.code = "CONSENT_REQUIRED";
    throw error;
  }

  if (submission.submittedAfterMs > 0 && submission.submittedAfterMs < 1200) {
    const error = new Error("L'envoi a ete effectue trop rapidement. Merci de relire votre demande avant validation.");
    error.statusCode = 400;
    error.code = "TOO_FAST";
    throw error;
  }

  const hasMeaningfulContent = Boolean(submission.subject || submission.message || submission.summary || submission.territory);
  if (!hasMeaningfulContent) {
    const error = new Error("La demande est trop courte.");
    error.statusCode = 400;
    throw error;
  }
}


function formatSubmissionForStorage(submission) {
  const lines = [
    ["Profil", submission.profile],
    ["Nom / structure", submission.name],
    ["E-mail", submission.email],
    ["Telephone", submission.phone],
    ["Territoire", submission.territory],
    ["Objet", submission.subject],
    ["Categorie interne", submission.category],
    ["Priorite", submission.priority],
    ["Statut interne", submission.status],
    ["Page", submission.page],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label} : ${value}`);

  const message = submission.message || submission.summary || "Demande transmise depuis le site TVF.";
  const summary = submission.summary && submission.summary !== message ? `\n\nResume prepare :\n${submission.summary}` : "";
  return `${lines.join("\n")}\n\nMessage :\n${message}${summary}`.trim();
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
    consent: submission.consent,
    submitted_after_ms: submission.submittedAfterMs,
    category: submission.category,
    priority: submission.priority,
    status: submission.status,
  });

  return [
    compactObject({
      full_name: submission.name || submission.profile || "Contact TVF",
      email: submission.email || "contact@territoiresvivantsfrance.fr",
      subject: submission.subject || submission.formKind || "Demande TVF",
      message: formatSubmissionForStorage(submission),
      consent: submission.consent,
      source_page: submission.page || submission.referer,
      user_agent: submission.userAgent,
      status: submission.status,
      priority: submission.priority,
      category: submission.category,
      assigned_to: "",
      internal_notes: "",
    }),
    compactObject({
      full_name: submission.name || submission.profile || "Contact TVF",
      email: submission.email || "contact@territoiresvivantsfrance.fr",
      subject: submission.subject || submission.formKind || "Demande TVF",
      message: formatSubmissionForStorage(submission),
      consent: submission.consent,
      source_page: submission.page || submission.referer,
      user_agent: submission.userAgent,
    }),
    compactObject({
      profile: submission.profile,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      territory: submission.territory,
      subject: submission.subject,
      message: submission.message || submission.summary,
      status: submission.status,
      priority: submission.priority,
      category: submission.category,
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
      statut: submission.status,
      priorite: submission.priority,
      categorie: submission.category,
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
      statut: submission.status,
      priorite: submission.priority,
      categorie: submission.category,
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

function supabaseKeys() {
  return Array.from(
    new Set(
      [process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_ANON_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY]
        .map((value) => cleanEnvToken(value, 3000))
        .filter(Boolean)
    )
  );
}

function supabaseHeadersForKey(key) {
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  // Legacy anon/service_role keys are JWTs. New sb_secret_/sb_publishable_ keys are not.
  if (!key.startsWith("sb_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

async function insertIntoSupabase(submission) {
  const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const keys = supabaseKeys();

  if (!restUrl || keys.length === 0) {
    const error = new Error("Supabase n'est pas configure sur Vercel.");
    error.statusCode = 503;
    error.code = "SUPABASE_NOT_CONFIGURED";
    error.publicDetails = { stage: "supabase_config" };
    throw error;
  }

  const endpoint = `${restUrl}/${CONTACT_TABLE}`;
  const rows = candidateRows(submission);
  let lastError = null;

  for (const key of keys) {
    for (const row of rows) {
      const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: supabaseHeadersForKey(key),
        body: JSON.stringify(row),
      });

      if (response.ok) return true;

      const errorText = await response.text().catch(() => "");
      lastError = { status: response.status, body: errorText };

      if (response.status === 401 || response.status === 403) {
        break;
      }

      if (![400, 404, 409].includes(response.status)) {
        break;
      }
    }
  }

  const error = new Error("Supabase a refuse l'enregistrement du formulaire.");
  error.statusCode = 502;
  error.code = "SUPABASE_INSERT_FAILED";
  error.details = lastError;
  error.publicDetails = { stage: "supabase_insert", upstreamStatus: lastError?.status || null, attemptedKeys: keys.length };
  throw error;
}
function parseAddress(value, fallbackEmail = DEFAULT_CONTACT_EMAIL) {
  const input = clean(value || fallbackEmail, 300);
  const match = input.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return {
      name: clean(match[1].replace(/^"|"$/g, ""), 120) || undefined,
      email: clean(match[2], 220),
    };
  }
  return { email: input };
}

function parseRecipients(value) {
  return String(value || DEFAULT_CONTACT_EMAIL)
    .split(/[;,]/)
    .map((item) => parseAddress(item.trim()))
    .filter((item) => validEmail(item.email));
}

function uniqueEmails(items) {
  return Array.from(new Set(items.filter(Boolean).map((item) => String(item).trim().toLowerCase())));
}

function routeInternalNotificationEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "";
  // L'adresse contact@ reste l'adresse publique/reply-to. Les notifications internes vont vers Gmail.
  if (normalized === DEFAULT_CONTACT_EMAIL) return DEFAULT_NOTIFICATION_EMAIL;
  return normalized;
}

function configuredRecipients(...values) {
  return uniqueEmails(values.flatMap((value) => parseRecipients(value).map((item) => routeInternalNotificationEmail(item.email))));
}

function normalizedEmailFrom(value) {
  const configured = String(value || DEFAULT_FROM).trim();
  const lower = configured.toLowerCase();
  if (lower.includes("<contact@territoiresvivantsfrance.fr>") || lower === "contact@territoiresvivantsfrance.fr") return DEFAULT_FROM;
  return configured;
}

function emailConfig() {
  const notificationRecipients = configuredRecipients(
    process.env.TVF_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL,
    process.env.TVF_NOTIFICATION_BACKUP_EMAIL || process.env.NOTIFICATION_BACKUP_EMAIL || FALLBACK_NOTIFICATION_EMAIL,
    DEFAULT_NOTIFICATION_EMAIL
  );

  const gmailUser = cleanEnvToken(process.env.GMAIL_SMTP_USER || process.env.GMAIL_USER || "", 320);
  const gmailPassword = cleanEnvToken(process.env.GMAIL_SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || "", 320);
  const provider = gmailUser && gmailPassword ? "gmail" : process.env.RESEND_API_KEY ? "resend" : "";
  const configuredFrom = process.env.TVF_EMAIL_FROM || process.env.EMAIL_FROM || DEFAULT_FROM;

  return {
    provider,
    resendKey: process.env.RESEND_API_KEY || "",
    gmailUser,
    gmailPassword,
    gmailHost: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
    gmailPort: Number(process.env.GMAIL_SMTP_PORT || 465),
    from: provider === "gmail" ? `Territoires Vivants France <${gmailUser}>` : normalizedEmailFrom(configuredFrom),
    replyTo: process.env.TVF_EMAIL_REPLY_TO || process.env.EMAIL_REPLY_TO || DEFAULT_CONTACT_EMAIL,
    notifyTo: notificationRecipients,
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function display(value, fallback = "Non renseigne") {
  return clean(value, 500) || fallback;
}

function submissionRows(submission) {
  return [
    ["Profil", submission.profile],
    ["Nom / structure", submission.name],
    ["E-mail", submission.email],
    ["Telephone", submission.phone],
    ["Territoire", submission.territory],
    ["Objet", submission.subject],
    ["Categorie interne", submission.category],
    ["Priorite", submission.priority],
    ["Statut interne", submission.status],
    ["Page", submission.page],
  ];
}

function submissionText(submission) {
  const rows = submissionRows(submission)
    .map(([label, value]) => `${label}: ${display(value)}`)
    .join("\n");
  return `${rows}\n\nMessage:\n${submission.message || submission.summary || "Non renseigne"}`;
}

function baseEmailLayout(title, intro, bodyHtml) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f4f7f1;color:#102236;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:680px;margin:0 auto;padding:28px 16px;"><div style="background:#ffffff;border:1px solid #dbe6d7;border-radius:18px;overflow:hidden;"><div style="background:#123047;color:#ffffff;padding:22px 26px;"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#cfe6c8;">Territoires Vivants France</p><h1 style="margin:0;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1></div><div style="padding:26px;"><p style="font-size:16px;line-height:1.65;margin:0 0 20px;">${escapeHtml(intro)}</p>${bodyHtml}<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#53616c;">Ce message est envoye automatiquement depuis le site territoiresvivantsfrance.fr. Pour toute question, contactez ${escapeHtml(DEFAULT_CONTACT_EMAIL)}.</p></div></div></div></body></html>`;
}

function submissionTableHtml(submission) {
  const rows = submissionRows(submission)
    .map(([label, value]) => `<tr><th align="left" style="width:190px;padding:10px 12px;background:#eef5ea;border-bottom:1px solid #dbe6d7;color:#123047;">${escapeHtml(label)}</th><td style="padding:10px 12px;border-bottom:1px solid #dbe6d7;">${escapeHtml(display(value))}</td></tr>`)
    .join("");
  const message = escapeHtml(submission.message || submission.summary || "Non renseigne").replace(/\n/g, "<br>");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #dbe6d7;border-radius:12px;overflow:hidden;font-size:14px;">${rows}</table><div style="margin-top:18px;padding:16px 18px;background:#f8faf5;border:1px solid #dbe6d7;border-radius:12px;"><p style="margin:0 0 8px;font-weight:700;color:#123047;">Message</p><p style="margin:0;line-height:1.65;">${message}</p></div>`;
}

function internalEmail(submission) {
  const subject = `Nouvelle demande TVF - ${submission.subject || submission.formKind || "formulaire"}`.slice(0, 180);
  const text = `Une nouvelle demande a ete envoyee depuis le site TVF.\n\n${submissionText(submission)}\n\nAction conseillee: qualifier la demande, verifier le territoire, puis repondre au contact.`;
  const html = baseEmailLayout(
    "Nouvelle demande recue depuis le site",
    "Une nouvelle demande a ete enregistree dans Supabase et doit etre qualifiee par l'equipe TVF.",
    `${submissionTableHtml(submission)}<p style="margin:22px 0 0;"><strong>Suite conseillee :</strong> qualifier la demande, verifier le territoire, puis repondre au contact.</p>`
  );
  return { subject, text, html };
}

function confirmationEmail(submission) {
  const subject = "TVF - confirmation de reception de votre demande";
  const text = `Bonjour,\n\nTerritoires Vivants France confirme la reception de votre demande.\n\n${submissionText(submission)}\n\nL'equipe TVF pourra revenir vers vous pour qualifier la situation, demander des pieces complementaires ou proposer un rendez-vous.\n\nContact: ${DEFAULT_CONTACT_EMAIL}`;
  const html = baseEmailLayout(
    "Votre demande a bien ete recue",
    "Merci pour votre message. Territoires Vivants France confirme la reception de votre demande. Elle pourra etre qualifiee afin d'identifier la suite la plus adaptee.",
    `${submissionTableHtml(submission)}<p style="margin:22px 0 0;line-height:1.65;">L'equipe TVF pourra revenir vers vous pour qualifier la situation, demander des pieces complementaires ou proposer un rendez-vous.</p>`
  );
  return { subject, text, html };
}

async function sendWithResend(config, message) {
  if (!config.resendKey) throw new Error("RESEND_API_KEY manquante.");
  const response = await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: message.to,
      reply_to: message.replyTo || config.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text().catch(() => "")}`);
}

function foldBase64(value) {
  return String(value || "").replace(/(.{76})/g, "$1\r\n");
}

function encodeHeader(value) {
  const text = String(value || "");
  return /^[\x00-\x7F]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

function normalizeToList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function buildMimeMessage(config, message) {
  const mixedBoundary = `tvf-mixed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const altBoundary = `tvf-alt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const to = normalizeToList(message.to);
  const headers = [
    `From: ${config.from}`,
    `To: ${to.join(", ")}`,
    `Reply-To: ${message.replyTo || config.replyTo}`,
    `Subject: ${encodeHeader(message.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
  ];
  const parts = [
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    "",
    `--${altBoundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    message.text || "",
    `--${altBoundary}`,
    'Content-Type: text/html; charset="utf-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    message.html || "",
    `--${altBoundary}--`,
  ];

  for (const attachment of message.attachments || []) {
    parts.push(
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType || "application/octet-stream"}; name="${safeFilename(attachment.filename)}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${safeFilename(attachment.filename)}"`,
      "",
      foldBase64(attachment.content)
    );
  }
  parts.push(`--${mixedBoundary}--`, "");
  return `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
}

function smtpRead(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    const onError = (error) => { cleanup(); reject(error); };
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (/^\d{3} /.test(last)) {
        cleanup();
        resolve(buffer);
      }
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function smtpCommand(socket, command, expected) {
  if (command) socket.write(`${command}\r\n`);
  const response = await smtpRead(socket);
  const code = Number(response.slice(0, 3));
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(code)) throw new Error(`SMTP ${code}: ${response.trim()}`);
  return response;
}

async function sendWithGmail(config, message) {
  if (!config.gmailUser || !config.gmailPassword) throw new Error("Gmail SMTP non configure.");
  const raw = buildMimeMessage(config, message);
  const fromEmail = parseAddress(config.from).email || config.gmailUser;
  const recipients = normalizeToList(message.to);
  const socket = await new Promise((resolve, reject) => {
    const client = tls.connect({ host: config.gmailHost, port: config.gmailPort, servername: config.gmailHost }, () => resolve(client));
    client.setTimeout(OUTBOUND_TIMEOUT_MS, () => reject(new Error("SMTP timeout")));
    client.once("error", reject);
  });
  try {
    await smtpCommand(socket, null, 220);
    await smtpCommand(socket, "EHLO territoiresvivantsfrance.fr", 250);
    await smtpCommand(socket, "AUTH LOGIN", 334);
    await smtpCommand(socket, Buffer.from(config.gmailUser).toString("base64"), 334);
    await smtpCommand(socket, Buffer.from(config.gmailPassword).toString("base64"), 235);
    await smtpCommand(socket, `MAIL FROM:<${fromEmail}>`, 250);
    for (const recipient of recipients) await smtpCommand(socket, `RCPT TO:<${recipient}>`, [250, 251]);
    await smtpCommand(socket, "DATA", 354);
    socket.write(`${raw.replace(/\r?\n\./g, "\r\n..")}\r\n.\r\n`);
    await smtpCommand(socket, null, 250);
    await smtpCommand(socket, "QUIT", 221).catch(() => null);
  } finally {
    socket.end();
  }
}
async function sendEmail(config, message) {
  if (process.env.NODE_ENV === "test" && process.env.TVF_EMAIL_DRY_RUN === "1") {
    if (Array.isArray(global.__TVF_EMAIL_DRY_RUN__)) global.__TVF_EMAIL_DRY_RUN__.push({ provider: config.provider, message });
    return;
  }
  if (config.provider === "gmail") return sendWithGmail(config, message);
  if (config.provider === "resend") return sendWithResend(config, message);
  throw new Error("Aucun fournisseur e-mail configure.");
}

async function notifyByEmail(submission) {
  const config = emailConfig();
  if (!config.provider) {
    return { configured: false, internal: "skipped", confirmation: submission.email ? "skipped" : "no_email" };
  }

  const results = { configured: true, internal: "skipped", confirmation: submission.email ? "skipped" : "no_email" };
  const internal = internalEmail(submission);
  try {
    await sendEmail(config, {
      to: config.notifyTo,
      replyTo: submission.email || config.replyTo,
      ...internal,
      attachments: emailAttachments(submission),
    });
    results.internal = "sent";
  } catch (error) {
    results.internal = "failed";
    console.error("TVF internal email failed", error.message);
  }

  if (submission.email) {
    const confirmation = confirmationEmail(submission);
    try {
      await sendEmail(config, {
        to: [submission.email],
        replyTo: config.replyTo,
        ...confirmation,
      });
      results.confirmation = "sent";
    } catch (error) {
      results.confirmation = "failed";
      console.error("TVF confirmation email failed", error.message);
    }
  }

  return results;
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
    consumeRateLimit(req, res, { scope: "public-contact", limit: process.env.TVF_CONTACT_RATE_LIMIT || 8, windowMs: process.env.TVF_CONTACT_RATE_WINDOW_MS || 10 * 60 * 1000 });
    const data = await readJsonBody(req);
    const submission = buildSubmission(data, req);
    validateSubmission(data, submission);
    await insertIntoSupabase(submission);
    const email = await notifyByEmail(submission);
    sendJson(res, 200, { ok: true, message: "Demande enregistree.", email });
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
      code: error.code || undefined,
      diagnostic: error.publicDetails || undefined,
      details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined,
    });
  }
};



