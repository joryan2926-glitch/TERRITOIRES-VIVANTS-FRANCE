const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function serviceKey() {
  return SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Payload trop volumineux"));
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function supabaseFetch(path, options = {}) {
  const key = options.token || serviceKey();
  const apiKey = options.token ? SUPABASE_ANON_KEY : serviceKey();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error_description || "Erreur Supabase";
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function requireUser(req) {
  const token = bearerToken(req);
  if (!token) {
    const error = new Error("Authentification requise");
    error.status = 401;
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  const user = await response.json();
  if (!response.ok) {
    const error = new Error("Session invalide");
    error.status = 401;
    throw error;
  }
  return { user, token };
}

async function isAdmin(authUserId) {
  const rows = await supabaseFetch(`/rest/v1/user_profiles?select=id&auth_user_id=eq.${encodeURIComponent(authUserId)}&role=eq.administrateur&limit=1`);
  return rows.length > 0;
}

function pick(input, allowed) {
  return allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(input, key)) acc[key] = input[key];
    return acc;
  }, {});
}

async function logActivity({ actorAuthUserId, action, tableName, recordId, metadata }) {
  try {
    await supabaseFetch("/rest/v1/activity_log", {
      method: "POST",
      body: {
        actor_auth_user_id: actorAuthUserId,
        action,
        table_name: tableName,
        record_id: recordId || null,
        metadata: metadata || {}
      }
    });
  } catch {
    // Le journal ne doit jamais bloquer une contribution utilisateur.
  }
}

async function handleCollection(req, res, table, config) {
  if (!isConfigured()) return sendJson(res, 503, { error: "Supabase n'est pas configuré sur Vercel." });
  try {
    if (req.method === "GET") {
      const query = config.publicQuery || `select=${encodeURIComponent(config.select || "*")}`;
      const rows = await supabaseFetch(`/rest/v1/${table}?${query}`, { prefer: "" });
      return sendJson(res, 200, { data: rows });
    }
    if (req.method === "POST") {
      const { user } = await requireUser(req);
      const body = await readBody(req);
      const row = {
        ...pick(body, config.allowedPost || []),
        created_by: user.id
      };
      if (config.defaultStatus) row[config.statusField || "statut_validation"] = config.defaultStatus;
      const inserted = await supabaseFetch(`/rest/v1/${table}`, { method: "POST", body: row });
      await logActivity({
        actorAuthUserId: user.id,
        action: "create",
        tableName: table,
        recordId: inserted?.[0]?.id,
        metadata: { endpoint: table }
      });
      return sendJson(res, 201, { data: inserted?.[0] || inserted });
    }
    return sendJson(res, 405, { error: "Méthode non autorisée" });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.details });
  }
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isConfigured,
  sendJson,
  readBody,
  supabaseFetch,
  requireUser,
  isAdmin,
  pick,
  logActivity,
  handleCollection
};
