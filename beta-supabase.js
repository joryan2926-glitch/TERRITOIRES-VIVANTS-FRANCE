(function () {
  const TOKEN_KEY = "tvf_supabase_session";

  const state = {
    config: null,
    session: null
  };

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function readSession() {
    try {
      state.session = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
    } catch {
      state.session = null;
    }
    return state.session;
  }

  function saveSession(session) {
    state.session = session;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  }

  function clearSession() {
    state.session = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  async function init() {
    try {
      const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
      state.config = await response.json();
    } catch {
      state.config = { configured: false, supabaseUrl: "", supabaseAnonKey: "" };
    }
    readSession();
    document.querySelectorAll("[data-config-status]").forEach((node) => {
      node.textContent = state.config.configured
        ? "Supabase configuré : la bêta peut envoyer des données."
        : "Supabase non configuré : ajoutez SUPABASE_URL, SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY dans Vercel.";
    });
    document.body.classList.toggle("supabase-ready", Boolean(state.config.configured));
    return state.config;
  }

  function authHeaders(extra = {}) {
    readSession();
    return {
      "Content-Type": "application/json",
      ...(state.session?.access_token ? { Authorization: `Bearer ${state.session.access_token}` } : {}),
      ...extra
    };
  }

  async function authFetch(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: authHeaders(options.headers || {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.msg || "Erreur plateforme");
    return data;
  }

  async function supabaseAuth(path, body) {
    if (!state.config?.configured) throw new Error("Supabase n'est pas configuré.");
    const response = await fetch(`${state.config.supabaseUrl}${path}`, {
      method: "POST",
      headers: {
        apikey: state.config.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.msg || data.error_description || data.message || "Erreur d'authentification");
    return data;
  }

  async function signUp({ email, password, role, fullName }) {
    const data = await supabaseAuth("/auth/v1/signup", {
      email,
      password,
      data: { role, full_name: fullName }
    });
    if (data.access_token) saveSession(data);
    if (data.user?.id && data.access_token) await saveProfile({ role });
    return data;
  }

  async function signIn({ email, password }) {
    const data = await supabaseAuth("/auth/v1/token?grant_type=password", { email, password });
    saveSession(data);
    return data;
  }

  async function resetPassword(email) {
    return supabaseAuth("/auth/v1/recover", { email });
  }

  async function saveProfile(profile) {
    return authFetch("/api/profile", { method: "POST", body: JSON.stringify(profile) });
  }

  async function getProfile() {
    return authFetch("/api/profile");
  }

  async function uploadFile(bucket, file, folder = "uploads") {
    if (!file) return "";
    if (!state.config?.configured) throw new Error("Supabase n'est pas configuré.");
    readSession();
    if (!state.session?.access_token) throw new Error("Connexion requise pour envoyer un fichier.");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9_.-]+/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;
    const response = await fetch(`${state.config.supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        apikey: state.config.supabaseAnonKey,
        Authorization: `Bearer ${state.session.access_token}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false"
      },
      body: file
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Upload impossible");
    return path;
  }

  function formToObject(form) {
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => {
      if (value instanceof File) return;
      obj[key] = value;
    });
    ["latitude", "longitude"].forEach((key) => {
      if (obj[key] === "") delete obj[key];
      else if (obj[key]) obj[key] = Number(obj[key]);
    });
    return obj;
  }

  function setStatus(form, message, isError = false) {
    const node = $("[data-form-status]", form) || form.nextElementSibling;
    if (node) {
      node.textContent = message;
      node.classList.toggle("error", isError);
    }
  }

  window.TVF = {
    init,
    state,
    readSession,
    clearSession,
    signUp,
    signIn,
    resetPassword,
    saveProfile,
    getProfile,
    uploadFile,
    authFetch,
    formToObject,
    setStatus
  };
})();
