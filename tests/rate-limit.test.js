const assert = require("assert");
const { consumeRateLimit, resetRateLimit, requestFingerprint, _store } = require("../lib/api/rate-limit");

function response() { return { headers: {}, setHeader(name, value) { this.headers[name] = value; } }; }

_store.clear();
const req = { headers: { "x-forwarded-for": "203.0.113.40" }, socket: {} };
const res = response();
assert.strictEqual(requestFingerprint(req).length, 24);
consumeRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60000 });
consumeRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60000 });
assert.throws(() => consumeRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60000 }), (error) => error.statusCode === 429 && error.code === "RATE_LIMITED");
assert.ok(res.headers["Retry-After"]);
resetRateLimit(req, "test");
assert.doesNotThrow(() => consumeRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60000 }));
_store.clear();
console.log("Rate limit tests passed");