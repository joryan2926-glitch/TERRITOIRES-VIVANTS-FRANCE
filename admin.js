const ADMIN_HOME_TOKEN_KEY = "tvfAdminToken";

const loginSection = document.querySelector("[data-admin-home-login]");
const appSection = document.querySelector("[data-admin-home-app]");
const tokenForm = document.querySelector("[data-admin-home-token-form]");
const loginStatus = document.querySelector("[data-admin-home-login-status]");
const logoutButton = document.querySelector("[data-admin-home-logout]");

function token() {
  try { return sessionStorage.getItem(ADMIN_HOME_TOKEN_KEY) || ""; } catch { return ""; }
}

function setToken(value) {
  try {
    if (value) sessionStorage.setItem(ADMIN_HOME_TOKEN_KEY, value);
    else sessionStorage.removeItem(ADMIN_HOME_TOKEN_KEY);
  } catch {}
}

function showApp() {
  if (loginSection) loginSection.hidden = true;
  if (appSection) appSection.hidden = false;
}

function showLogin() {
  if (loginSection) loginSection.hidden = false;
  if (appSection) appSection.hidden = true;
}

function setStatus(message, type = "info") {
  if (!loginStatus) return;
  loginStatus.hidden = !message;
  loginStatus.textContent = message;
  loginStatus.dataset.status = type;
}

async function validateToken(value) {
  const response = await fetch("/api/admin-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${value}`,
    },
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) {
    const error = new Error(result.error || "Token admin invalide.");
    error.status = response.status;
    error.code = result.code;
    throw error;
  }
  return result;
}

async function unlockAdmin(value) {
  setStatus("Verification du token admin...", "info");
  await validateToken(value);
  setToken(value);
  setStatus("");
  showApp();
}

tokenForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = String(new FormData(tokenForm).get("token") || "").trim();
  if (!value) return setStatus("Entrez le token admin.", "error");
  try {
    await unlockAdmin(value);
  } catch (error) {
    setToken("");
    showLogin();
    setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error");
  }
});

logoutButton?.addEventListener("click", () => {
  setToken("");
  showLogin();
  setStatus("Session TVF OS fermee.", "info");
});

if (token()) {
  showLogin();
  unlockAdmin(token()).catch((error) => {
    setToken("");
    showLogin();
    setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error");
  });
} else {
  showLogin();
}
