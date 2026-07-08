const TVF_ADMIN_TOKEN_KEY = "tvfAdminToken";
const TVF_ADMIN_COOKIE_SENTINEL = "__tvf_cookie_session__";
const TVF_ADMIN_COOKIE_CHECK_KEY = "tvfAdminCookieHydrated";
const TVF_ADMIN_MODULES = [
  { href: "admin", label: "Accueil" },
  { href: "dashboard", label: "Dashboard" },
  { href: "admin-demandes", label: "Demandes" },
  { href: "admin-emails", label: "E-mails" },
  { href: "admin-work", label: "Taches" },
  { href: "admin-crm", label: "CRM" },
  { href: "admin-dossiers", label: "Dossiers" },
  { href: "admin-documents", label: "Documents" },
  { href: "admin-procedures", label: "Procedures" },
  { href: "admin-knowledge", label: "Connaissances" },
  { href: "admin-ai", label: "Assistant IA" },
  { href: "admin-map", label: "Cartographie" },
  { href: "admin-observatoire", label: "Observatoire" },
  { href: "admin-finances", label: "Finances" },
  { href: "admin-impact", label: "Impact" },
  { href: "admin-branches", label: "Antennes" },
  { href: "admin-governance", label: "Gouvernance" },
  { href: "admin-risks", label: "Risques" },
  { href: "admin-users", label: "Utilisateurs" }
];

function readSessionToken() {
  try { return sessionStorage.getItem(TVF_ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}

function writeSessionToken(value) {
  try { if (value) sessionStorage.setItem(TVF_ADMIN_TOKEN_KEY, value); else sessionStorage.removeItem(TVF_ADMIN_TOKEN_KEY); } catch {}
}

function markCookieChecked(value) {
  try { if (value) sessionStorage.setItem(TVF_ADMIN_COOKIE_CHECK_KEY, "1"); else sessionStorage.removeItem(TVF_ADMIN_COOKIE_CHECK_KEY); } catch {}
}

function cookieChecked() {
  try { return sessionStorage.getItem(TVF_ADMIN_COOKIE_CHECK_KEY) === "1"; } catch { return false; }
}

function clearAdminSession() {
  writeSessionToken("");
  markCookieChecked(false);
  try { fetch("/api/admin-session", { method: "DELETE", keepalive: true }); } catch {}
}

async function hydrateSessionFromCookie() {
  if (readSessionToken() || cookieChecked()) return;
  markCookieChecked(true);
  try {
    const response = await fetch("/api/admin-session", { method: "GET", headers: { "Content-Type": "application/json" } });
    if (!response.ok) return;
    writeSessionToken(TVF_ADMIN_COOKIE_SENTINEL);
    window.location.reload();
  } catch {}
}

function bindAdminSessionBridge() {
  document.addEventListener("submit", (event) => {
    const form = event.target?.closest?.("form");
    if (!form || !form.matches('[data-admin-home-token-form], [data-dashboard-token-form], [data-admin-token-form], [data-crm-token-form], [data-cases-token-form], [data-documents-token-form], [data-procedures-token-form], [data-knowledge-token-form], [data-ai-token-form], [data-map-token-form], [data-observatoire-token-form], [data-finances-token-form], [data-impact-token-form], [data-branches-token-form], [data-governance-token-form], [data-risks-token-form], [data-users-token-form], [data-emails-token-form], [data-work-token-form]')) return;
    const value = String(new FormData(form).get("token") || "").trim();
    if (!value) return;
    markCookieChecked(false);
    try { fetch("/api/admin-session", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${value}` }, keepalive: true }); } catch {}
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('[data-admin-home-logout], [data-dashboard-logout], [data-admin-logout], [data-crm-logout], [data-cases-logout], [data-documents-logout], [data-procedures-logout], [data-knowledge-logout], [data-ai-logout], [data-map-logout], [data-observatoire-logout], [data-finances-logout], [data-impact-logout], [data-branches-logout], [data-governance-logout], [data-risks-logout], [data-users-logout], [data-emails-logout], [data-work-logout]')) clearAdminSession();
  }, true);

  if (window.fetch && !window.fetch.__tvfAdminTokenGuard) {
    const originalFetch = window.fetch.bind(window);
    const guardedFetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = String(args[0]?.url || args[0] || "");
      if (response.status === 401 && url.includes("/api/admin")) clearAdminSession();
      return response;
    };
    guardedFetch.__tvfAdminTokenGuard = true;
    window.fetch = guardedFetch;
  }
}

function normalizePath(pathname) {
  const clean = String(pathname || "").split("/").filter(Boolean).pop() || "index";
  return clean.replace(/\.html$/i, "") || "index";
}

function createAdminModuleNav() {
  if (!document.body?.classList.contains("admin-body")) return;
  if (document.querySelector("[data-admin-module-nav]")) return;
  const topbar = document.querySelector(".admin-topbar");
  if (!topbar) return;
  const current = normalizePath(window.location.pathname);
  const nav = document.createElement("nav");
  nav.className = "admin-module-nav";
  nav.dataset.adminModuleNav = "";
  nav.setAttribute("aria-label", "Navigation complete TVF OS");
  nav.innerHTML = `<div class="admin-module-nav-inner">${TVF_ADMIN_MODULES.map((module) => {
    const active = current === module.href || (current === "dashboard" && module.href === "dashboard") || (current === "admin" && module.href === "admin");
    return `<a href="${module.href}"${active ? ' aria-current="page" class="is-active"' : ""}>${module.label}</a>`;
  }).join("")}</div>`;
  topbar.insertAdjacentElement("afterend", nav);
}

bindAdminSessionBridge();
hydrateSessionFromCookie();
createAdminModuleNav();
