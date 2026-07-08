const crypto = require("crypto");

const OUTBOUND_TIMEOUT_MS = Number(process.env.TVF_OUTBOUND_TIMEOUT_MS || 9000);
const PROFILE_STATUSES = new Set(["invited", "active", "paused", "suspended", "left", "archive"]);
const ROLE_STATUSES = new Set(["active", "paused", "archive"]);
const USER_ROLE_STATUSES = new Set(["active", "paused", "expired", "revoked", "archive"]);
const MEMBERSHIP_STATUSES = new Set(["invited", "active", "paused", "left", "archive"]);
const INVITATION_STATUSES = new Set(["pending", "accepted", "expired", "cancelled", "archive"]);
const REVIEW_STATUSES = new Set(["pending", "valid", "changes_required", "revoked", "archive"]);
const SCOPES = new Set(["global", "national", "branch", "pole", "module", "temporary"]);
const RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);

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
function dateTimeValue(value) { const text = clean(value || "", 80); if (!text) return null; const time = new Date(text).getTime(); return Number.isNaN(time) ? null : new Date(time).toISOString(); }
function arrayValue(value, maxItems = 18) { if (Array.isArray(value)) return value.map((item) => clean(String(item || ""), 180)).filter(Boolean).slice(0, maxItems); return clean(String(value || ""), 2000).split(/[;\n]/).map((item) => clean(item, 180)).filter(Boolean).slice(0, maxItems); }
function compactPayload(fields, input, partial, defaults = []) { const payload = {}; Object.entries(fields).forEach(([key, value]) => { if (!partial || Object.prototype.hasOwnProperty.call(input, key) || defaults.includes(key)) { if (value !== "" && value !== undefined) payload[key] = value; else if (partial && Object.prototype.hasOwnProperty.call(input, key)) payload[key] = null; } }); return payload; }
function percent(done, total) { if (!total) return 100; return Math.round((done / total) * 100); }

function profilePayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "invited" : ""); validateEnum(PROFILE_STATUSES, status, "Statut profil invalide."); const fields = { auth_user_id: validateUuid(input.auth_user_id || "", "Utilisateur Auth"), first_name: clean(input.first_name || "", 120), last_name: clean(input.last_name || "", 120), email: clean(input.email || "", 220).toLowerCase(), phone: clean(input.phone || "", 80), status, default_branch_id: validateUuid(input.default_branch_id || "", "Antenne"), avatar_file_id: validateUuid(input.avatar_file_id || "", "Avatar"), last_seen_at: dateTimeValue(input.last_seen_at), onboarding_completed_at: dateTimeValue(input.onboarding_completed_at), notes: clean(input.notes || input.summary || "", 1800) }; if (!partial && !fields.email) throw Object.assign(new Error("E-mail requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status"]); }
function rolePayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "active" : ""); validateEnum(ROLE_STATUSES, status, "Statut role invalide."); const fields = { role_key: clean(input.role_key || "", 120), role_name: clean(input.role_name || input.title || "", 220), role_family: clean(input.role_family || "operations", 80), description: clean(input.description || input.summary || "", 1600), is_sensitive: input.is_sensitive === true || input.is_sensitive === "true", status }; if (!partial && (!fields.role_key || !fields.role_name)) throw Object.assign(new Error("Cle et nom du role requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status", "is_sensitive"]); }
function userRolePayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "active" : ""); const scope = clean(input.scope || "", 80) || (!partial ? "global" : ""); validateEnum(USER_ROLE_STATUSES, status, "Statut attribution invalide."); validateEnum(SCOPES, scope, "Portee invalide."); const fields = { profile_id: validateUuid(input.profile_id || "", "Profil"), role_id: validateUuid(input.role_id || "", "Role"), branch_id: validateUuid(input.branch_id || "", "Antenne"), scope, status, valid_from: dateValue(input.valid_from) || (!partial ? new Date().toISOString().slice(0, 10) : null), valid_until: dateValue(input.valid_until), assigned_by: clean(input.assigned_by || "TVF OS", 180) }; if (!partial && (!fields.profile_id || !fields.role_id)) throw Object.assign(new Error("Profil et role requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["scope", "status"]); }
function membershipPayload(input, partial = false) { const status = clean(input.membership_status || input.status || "", 80) || (!partial ? "active" : ""); validateEnum(MEMBERSHIP_STATUSES, status, "Statut rattachement invalide."); const fields = { profile_id: validateUuid(input.profile_id || "", "Profil"), branch_id: validateUuid(input.branch_id || "", "Antenne"), membership_status: status, joined_at: dateTimeValue(input.joined_at), left_at: dateTimeValue(input.left_at), primary_role_label: clean(input.primary_role_label || "", 180), notes: clean(input.notes || input.summary || "", 1600) }; if (!partial && (!fields.profile_id || !fields.branch_id)) throw Object.assign(new Error("Profil et antenne requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["membership_status"]); }
function invitationPayload(input, partial = false) { const status = clean(input.status || "", 80) || (!partial ? "pending" : ""); validateEnum(INVITATION_STATUSES, status, "Statut invitation invalide."); const fields = { email: clean(input.email || "", 220).toLowerCase(), invited_by: clean(input.invited_by || "TVF OS", 180), invited_role_key: clean(input.invited_role_key || "lecteur_interne", 120), branch_id: validateUuid(input.branch_id || "", "Antenne"), status, expires_at: dateTimeValue(input.expires_at) || (!partial ? new Date(Date.now() + 14 * 86400000).toISOString() : null), accepted_at: dateTimeValue(input.accepted_at), message: clean(input.message || input.summary || "", 1600) }; if (!partial && !fields.email) throw Object.assign(new Error("E-mail invitation requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["status"]); }
function reviewPayload(input, partial = false) { const status = clean(input.review_status || input.status || "", 80) || (!partial ? "pending" : ""); const risk = clean(input.risk_level || "", 80) || (!partial ? "medium" : ""); validateEnum(REVIEW_STATUSES, status, "Statut revue invalide."); validateEnum(RISK_LEVELS, risk, "Niveau de risque invalide."); const fields = { profile_id: validateUuid(input.profile_id || "", "Profil"), reviewer_name: clean(input.reviewer_name || "", 180), review_status: status, risk_level: risk, due_at: dateTimeValue(input.due_at), reviewed_at: status !== "pending" ? (dateTimeValue(input.reviewed_at) || new Date().toISOString()) : null, findings: clean(input.findings || input.summary || "", 2400), required_actions: arrayValue(input.required_actions || "") }; if (!partial && !fields.profile_id) throw Object.assign(new Error("Profil requis."), { statusCode: 400 }); return compactPayload(fields, input, partial, ["review_status", "risk_level"]); }

function profileAssistant(profile = {}, roles = [], memberships = [], reviews = []) { const activeRoles = roles.filter((r) => r.status === "active"); const activeMemberships = memberships.filter((m) => m.membership_status === "active"); const sensitive = activeRoles.filter((r) => r.role?.is_sensitive || r.is_sensitive).length; const pendingReviews = reviews.filter((r) => r.review_status === "pending" || r.review_status === "changes_required"); const onboarding = profile.onboarding_completed_at ? 100 : profile.status === "active" ? 65 : 25; const accessScore = Math.max(0, Math.min(100, onboarding - pendingReviews.length * 20 - sensitive * 8 + activeMemberships.length * 5)); return { access_score: accessScore, active_roles: activeRoles.length, active_memberships: activeMemberships.length, sensitive_roles: sensitive, pending_reviews: pendingReviews.length, should_review: sensitive > 0 || pendingReviews.length > 0, summary: `${profile.email || "Profil"} : ${activeRoles.length} role(s), ${activeMemberships.length} antenne(s), ${pendingReviews.length} revue(s) en attente.`, next_actions: pendingReviews.length ? ["Finaliser la revue d'acces", "Verifier les roles sensibles"] : profile.status !== "active" ? ["Terminer l'onboarding", "Confirmer l'invitation"] : ["Acces sous controle", "Planifier la prochaine revue"] }; }
function enrichProfiles(profiles = [], roles = [], userRoles = [], memberships = [], reviews = []) { return profiles.map((profile) => { const assigned = userRoles.filter((ur) => ur.profile_id === profile.id).map((ur) => ({ ...ur, role: roles.find((r) => r.id === ur.role_id) || null, is_sensitive: roles.find((r) => r.id === ur.role_id)?.is_sensitive || false })); return { ...profile, roles: assigned, memberships: memberships.filter((m) => m.profile_id === profile.id), reviews: reviews.filter((r) => r.profile_id === profile.id), assistant: profileAssistant(profile, assigned, memberships.filter((m) => m.profile_id === profile.id), reviews.filter((r) => r.profile_id === profile.id)) }; }); }
function addFilters(params, url, set, searchColumns = ["email", "first_name", "last_name"]) { const status = clean(url.searchParams.get("status") || "", 80); const q = clean(url.searchParams.get("q") || "", 180).replace(/[*,()]/g, " "); if (status && status !== "all" && set.has(status)) params.set("status", `eq.${status}`); if (q) params.set("or", `(${searchColumns.map((c) => `${c}.ilike.*${q}*`).join(",")})`); }
async function listTable(req, table, set, order = "updated_at.desc", searchColumns) { const url = queryUrl(req); const params = new URLSearchParams({ select: "*", order, limit: String(Math.min(Math.max(Number(url.searchParams.get("limit") || 260), 1), 900)) }); addFilters(params, url, set, searchColumns); return supabaseRequest(`${table}?${params.toString()}`); }
async function listProfiles(req) { const profiles = await listTable(req, "profiles", PROFILE_STATUSES, "updated_at.desc", ["email", "first_name", "last_name", "notes"]); const [roles, userRoles, memberships, reviews] = await Promise.all([supabaseRequest("roles?select=*&limit=200"), supabaseRequest("user_roles?select=*&limit=1200"), supabaseRequest("user_branch_memberships?select=*&limit=1200"), supabaseRequest("access_reviews?select=*&limit=1200")]); return enrichProfiles(profiles || [], roles || [], userRoles || [], memberships || [], reviews || []); }
async function dashboard() { const [profiles, roles, permissions, userRoles, memberships, invitations, reviews] = await Promise.all([supabaseRequest("profiles?select=*&limit=900"), supabaseRequest("roles?select=*&limit=300"), supabaseRequest("permissions?select=*&limit=400"), supabaseRequest("user_roles?select=*&limit=1500"), supabaseRequest("user_branch_memberships?select=*&limit=1500"), supabaseRequest("user_invitations?select=*&limit=800"), supabaseRequest("access_reviews?select=*&limit=800")]); const enriched = enrichProfiles(profiles || [], roles || [], userRoles || [], memberships || [], reviews || []); const pendingReviews = (reviews || []).filter((r) => ["pending", "changes_required"].includes(r.review_status)); const sensitiveAssignments = (userRoles || []).filter((ur) => (roles || []).some((r) => r.id === ur.role_id && r.is_sensitive) && ur.status === "active"); const avgScore = Math.round(enriched.reduce((sum, p) => sum + (p.assistant.access_score || 0), 0) / Math.max(enriched.length, 1)); return { total_profiles: enriched.length, active_profiles: enriched.filter((p) => p.status === "active").length, pending_invitations: (invitations || []).filter((i) => i.status === "pending").length, roles_total: (roles || []).length, permissions_total: (permissions || []).length, active_memberships: (memberships || []).filter((m) => m.membership_status === "active").length, sensitive_assignments: sensitiveAssignments.length, pending_reviews: pendingReviews.length, access_score: avgScore, alerts: enriched.filter((p) => p.assistant.should_review || p.status !== "active").slice(0, 8), assistant: { summary: `${enriched.length} profil(s), ${sensitiveAssignments.length} role(s) sensible(s), ${pendingReviews.length} revue(s) en attente.`, priorities: [pendingReviews.length ? "Finaliser les revues d'acces" : "Revues sous controle", sensitiveAssignments.length ? "Verifier les roles sensibles" : "Aucun role sensible actif", (invitations || []).some((i) => i.status === "pending") ? "Suivre les invitations" : "Invitations a jour"] } }; }
async function createRecord(table, payload) { const rows = await supabaseRequest(`${table}?select=*`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }
async function updateRecord(table, id, payload) { const rows = await supabaseRequest(`${table}?${new URLSearchParams({ select: "*", id: `eq.${id}` }).toString()}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }); return rows?.[0] || null; }

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    requireAdmin(req);
    if (req.method === "GET") {
      const entity = clean(queryUrl(req).searchParams.get("entity") || "dashboard", 80);
      if (entity === "dashboard") return sendJson(res, 200, { ok: true, dashboard: await dashboard() });
      if (entity === "profiles") return sendJson(res, 200, { ok: true, profiles: await listProfiles(req) });
      if (entity === "roles") return sendJson(res, 200, { ok: true, roles: await listTable(req, "roles", ROLE_STATUSES, "role_name.asc", ["role_name", "role_key", "description"]) });
      if (entity === "permissions") return sendJson(res, 200, { ok: true, permissions: await supabaseRequest("permissions?select=*&order=module_key.asc,permission_key.asc&limit=500") });
      if (entity === "role_permissions") return sendJson(res, 200, { ok: true, role_permissions: await supabaseRequest("role_permissions?select=*&limit=1200") });
      if (entity === "user_roles") return sendJson(res, 200, { ok: true, user_roles: await supabaseRequest("user_roles?select=*&order=created_at.desc&limit=1200") });
      if (entity === "memberships") return sendJson(res, 200, { ok: true, memberships: await supabaseRequest("user_branch_memberships?select=*&order=updated_at.desc&limit=1200") });
      if (entity === "invitations") return sendJson(res, 200, { ok: true, invitations: await listTable(req, "user_invitations", INVITATION_STATUSES, "created_at.desc", ["email", "message", "invited_role_key"]) });
      if (entity === "reviews") return sendJson(res, 200, { ok: true, reviews: await listTable(req, "access_reviews", REVIEW_STATUSES, "due_at.asc", ["reviewer_name", "findings"]) });
      throw Object.assign(new Error("Entite inconnue."), { statusCode: 400 });
    }
    const input = await readJsonBody(req);
    const type = clean(input.type || "profile", 80);
    if (req.method === "POST") {
      if (type === "profile") return sendJson(res, 201, { ok: true, profile: await createRecord("profiles", profilePayload(input)) });
      if (type === "role") return sendJson(res, 201, { ok: true, role: await createRecord("roles", rolePayload(input)) });
      if (type === "user_role") return sendJson(res, 201, { ok: true, user_role: await createRecord("user_roles", userRolePayload(input)) });
      if (type === "membership") return sendJson(res, 201, { ok: true, membership: await createRecord("user_branch_memberships", membershipPayload(input)) });
      if (type === "invitation") return sendJson(res, 201, { ok: true, invitation: await createRecord("user_invitations", invitationPayload(input)) });
      if (type === "review") return sendJson(res, 201, { ok: true, review: await createRecord("access_reviews", reviewPayload(input)) });
    }
    if (req.method === "PATCH") {
      const id = validateUuid(input.id || "", "Identifiant"); if (!id) throw Object.assign(new Error("Identifiant requis."), { statusCode: 400 });
      if (type === "profile") return sendJson(res, 200, { ok: true, profile: await updateRecord("profiles", id, profilePayload(input, true)) });
      if (type === "role") return sendJson(res, 200, { ok: true, role: await updateRecord("roles", id, rolePayload(input, true)) });
      if (type === "user_role") return sendJson(res, 200, { ok: true, user_role: await updateRecord("user_roles", id, userRolePayload(input, true)) });
      if (type === "membership") return sendJson(res, 200, { ok: true, membership: await updateRecord("user_branch_memberships", id, membershipPayload(input, true)) });
      if (type === "invitation") return sendJson(res, 200, { ok: true, invitation: await updateRecord("user_invitations", id, invitationPayload(input, true)) });
      if (type === "review") return sendJson(res, 200, { ok: true, review: await updateRecord("access_reviews", id, reviewPayload(input, true)) });
    }
    sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, { ok: false, error: statusCode >= 500 ? "Utilisateurs et permissions indisponibles pour le moment." : error.message, code: error.code || undefined, details: process.env.NODE_ENV === "development" ? error.details || error.message : undefined });
  }
};

module.exports._private = { normalizeSupabaseRestUrl, profilePayload, rolePayload, userRolePayload, membershipPayload, invitationPayload, reviewPayload, profileAssistant, enrichProfiles, percent };
