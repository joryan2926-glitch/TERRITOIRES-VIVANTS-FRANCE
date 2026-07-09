const ADMIN_HOME_TOKEN_KEY = "tvfAdminToken";

const pageMode = document.body?.dataset.adminPage || "portal";
const isLoginPage = pageMode === "login";
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

function adminUrl(path) {
  return path;
}

function goToPortal() {
  window.location.href = adminUrl("admin");
}

function goToLogin() {
  window.location.replace(adminUrl("admin-login"));
}

function showApp() {
  if (loginSection) loginSection.hidden = true;
  if (appSection) appSection.hidden = false;
  document.body?.classList.add("admin-session-active");
}

function showLogin() {
  if (loginSection) loginSection.hidden = false;
  if (appSection) appSection.hidden = true;
  document.body?.classList.remove("admin-session-active");
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
  setStatus("Verification du code d'acces...", "info");
  await validateToken(value);
  setToken(value);
  if (isLoginPage) {
    setStatus("Acces valide. Ouverture de TVF OS...", "success");
    window.setTimeout(goToPortal, 180);
    return;
  }
  setStatus("");
  showApp();
}

tokenForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = String(new FormData(tokenForm).get("token") || "").trim();
  if (!value) return setStatus("Entrez le code d'acces admin.", "error");
  try {
    await unlockAdmin(value);
  } catch (error) {
    setToken("");
    showLogin();
    setStatus(error.status === 401 ? "Code d'acces invalide." : error.message, "error");
  }
});

logoutButton?.addEventListener("click", () => {
  setToken("");
  setStatus("Session TVF OS fermee.", "info");
  goToLogin();
});

if (isLoginPage) {
  showLogin();
  if (token()) {
    unlockAdmin(token()).catch(() => {
      setToken("");
      showLogin();
      setStatus("Session expiree. Entrez a nouveau le code d'acces.", "info");
    });
  }
} else if (token()) {
  unlockAdmin(token()).catch((error) => {
    setToken("");
    setStatus(error.status === 401 ? "Session expiree ou code invalide." : error.message, "error");
    goToLogin();
  });
} else {
  showLogin();
  goToLogin();
}
