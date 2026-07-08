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

tokenForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = String(new FormData(tokenForm).get("token") || "").trim();
  if (!value) return setStatus("Entrez le token admin.", "error");
  setToken(value);
  setStatus("");
  showApp();
});

logoutButton?.addEventListener("click", () => {
  setToken("");
  showLogin();
});

if (token()) showApp();
else showLogin();
