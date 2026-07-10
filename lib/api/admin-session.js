const crypto = require("crypto");
const { consumeRateLimit, resetRateLimit } = require("./rate-limit");

const ADMIN_COOKIE_NAME = "tvf_admin_session";

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

function adminToken() {
  return cleanEnvToken(process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "", 3000);
}

function adminCookieSignature() {
  const token = adminToken();
  if (!token) return "";
  return crypto.createHmac("sha256", token).update("tvf-os-admin-session-v1").digest("hex");
}

function cookieValue(req, name) {
  const cookieHeader = clean(req.headers.cookie || "", 6000);
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  return found ? cleanEnvToken(decodeURIComponent(found.slice(name.length + 1)), 3000) : "";
}

function tokenFromRequest(req) {
  const expectedCookie = adminCookieSignature();
  const receivedCookie = cookieValue(req, ADMIN_COOKIE_NAME);
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

function validateAdmin(req) {
  const expected = adminToken();
  if (!expected) throw Object.assign(new Error("Back-office non configure : ajoutez TVF_ADMIN_TOKEN dans Vercel."), { statusCode: 503, code: "ADMIN_TOKEN_MISSING" });
  if (!safeEqual(tokenFromRequest(req), expected)) throw Object.assign(new Error("Acces admin refuse."), { statusCode: 401, code: "ADMIN_UNAUTHORIZED" });
}

function setAdminCookie(res) {
  const signature = adminCookieSignature();
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE_NAME}=${encodeURIComponent(signature)}; Path=/; HttpOnly; Secure; SameSite=Strict`);
}

function clearAdminCookie(res) {
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "DELETE") {
      clearAdminCookie(res);
      sendJson(res, 200, { ok: true, session: { authenticated: false } });
      return;
    }
    if (req.method !== "GET" && req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "Methode non autorisee." });
      return;
    }
    if (req.method === "POST") consumeRateLimit(req, res, { scope: "admin-login", limit: process.env.TVF_ADMIN_LOGIN_LIMIT || 8, windowMs: process.env.TVF_ADMIN_LOGIN_WINDOW_MS || 15 * 60 * 1000 });
    validateAdmin(req);
    if (req.method === "POST") resetRateLimit(req, "admin-login");
    setAdminCookie(res);
    sendJson(res, 200, { ok: true, session: { role: "admin", scope: "tvf-os", authenticated: true } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 401) clearAdminCookie(res);
    sendJson(res, statusCode, { ok: false, error: error.message || "Session admin indisponible.", code: error.code || undefined });
  }
};

module.exports._private = { adminToken, adminCookieSignature, cookieValue, tokenFromRequest, safeEqual };
