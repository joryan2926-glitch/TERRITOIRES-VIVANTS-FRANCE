const crypto = require("crypto");

const STORE_KEY = "__tvfRateLimitStore";
const store = globalThis[STORE_KEY] || new Map();
globalThis[STORE_KEY] = store;

function clean(value, max = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function requestFingerprint(req) {
  const forwarded = clean(req?.headers?.["x-forwarded-for"] || "", 500).split(",")[0].trim();
  const source = forwarded || clean(req?.headers?.["x-real-ip"] || req?.socket?.remoteAddress || "unknown", 180);
  return crypto.createHash("sha256").update(source || "unknown").digest("hex").slice(0, 24);
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.round(number), min), max);
}

function prune(now) {
  if (store.size < 2000) return;
  for (const [key, entry] of store.entries()) {
    if (!entry || entry.resetAt <= now) store.delete(key);
  }
}

function rateKey(req, scope) {
  return `${clean(scope || "default", 80)}:${requestFingerprint(req)}`;
}

function setHeaders(res, limit, remaining, resetAt) {
  if (!res?.setHeader) return;
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
}

function consumeRateLimit(req, res, options = {}) {
  const now = Date.now();
  const limit = normalizeNumber(options.limit, 8, 1, 500);
  const windowMs = normalizeNumber(options.windowMs, 10 * 60 * 1000, 1000, 24 * 60 * 60 * 1000);
  const key = rateKey(req, options.scope);
  prune(now);
  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) entry = { count: 0, resetAt: now + windowMs };
  if (entry.count >= limit) {
    setHeaders(res, limit, 0, entry.resetAt);
    if (res?.setHeader) res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
    const error = new Error("Trop de tentatives. Merci de patienter avant de recommencer.");
    error.statusCode = 429;
    error.code = "RATE_LIMITED";
    throw error;
  }
  entry.count += 1;
  store.set(key, entry);
  setHeaders(res, limit, limit - entry.count, entry.resetAt);
  return { limit, remaining: limit - entry.count, resetAt: entry.resetAt };
}

function resetRateLimit(req, scope = "default") {
  store.delete(rateKey(req, scope));
}

module.exports = { consumeRateLimit, resetRateLimit, requestFingerprint, _store: store };