const TVF_ADMIN_TOKEN_KEY = "tvfAdminToken";
const TVF_ADMIN_COOKIE_SENTINEL = "__tvf_cookie_session__";
const TVF_ADMIN_COOKIE_CHECK_KEY = "tvfAdminCookieHydrated";
const TVF_ADMIN_LOGIN_ROUTE = "admin-login";

const TVF_ADMIN_GROUPS = [
  {
    label: "Demarrer",
    description: "Vue simple",
    modules: [
      { href: "admin", label: "Accueil", icon: "&#8962;" },
      { href: "dashboard", label: "Tableau de bord", icon: "&#9638;" },
    ],
  },
  {
    label: "A traiter",
    description: "Demandes et contacts",
    modules: [
      { href: "admin-demandes", label: "Demandes", icon: "&#9993;" },
      { href: "admin-emails", label: "Boite mail", icon: "@" },
      { href: "admin-crm", label: "Contacts", icon: "&#9673;" },
    ],
  },
  {
    label: "Instruction",
    description: "Dossiers et action",
    modules: [
      { href: "admin-dossiers", label: "Dossiers", icon: "&#9635;" },
      { href: "admin-dossiers?create=client", label: "Creer dossier", icon: "+" },
      { href: "admin-work", label: "Taches", icon: "&#10003;" },
      { href: "admin-documents", label: "Documents", icon: "&#9633;" },
      { href: "admin-procedures", label: "Methodes", icon: "&#167;" },
    ],
  },
  {
    label: "Suivi",
    description: "Carte et resultats",
    modules: [
      { href: "admin-map", label: "Carte", icon: "&#8982;" },
      { href: "admin-observatoire", label: "Observatoire", icon: "&#9676;" },
      { href: "admin-impact", label: "Resultats", icon: "%" },
    ],
  },
  {
    label: "Pilotage",
    description: "Budget et journal",
    modules: [
      { href: "admin-finances", label: "Finances", icon: "&euro;" },
      { href: "admin-activity", label: "Journal", icon: "&#8635;" },
    ],
  },
  {
    label: "Outils",
    description: "Reglages utiles",
    modules: [
      { href: "admin-users", label: "Utilisateurs", icon: "&#9678;" },
      { href: "admin-settings", label: "Reglages", icon: "&#9881;" },
      { href: "admin-knowledge", label: "Base utile", icon: "i" },
      { href: "admin-ai", label: "Assistant", icon: "&#10022;" },
    ],
  },
];

const TVF_ADMIN_MODULES = TVF_ADMIN_GROUPS.flatMap((group) => group.modules);

function readSessionToken() {
  try { return sessionStorage.getItem(TVF_ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}

function writeSessionToken(value) {
  try { if (value) sessionStorage.setItem(TVF_ADMIN_TOKEN_KEY, value); else sessionStorage.removeItem(TVF_ADMIN_TOKEN_KEY); } catch {}
  syncAdminSessionPanels();
}


function isAdminPanel(element, suffix) {
  if (!element?.attributes) return false;
  return Array.from(element.attributes).some((attribute) => /^data-[a-z0-9-]+$/.test(attribute.name) && attribute.name.endsWith(suffix));
}

function currentAdminRoute() {
  return normalizePath(window.location.pathname);
}

function isAdminLoginRoute() {
  return currentAdminRoute() === TVF_ADMIN_LOGIN_ROUTE;
}

function redirectToAdminLogin() {
  if (isAdminLoginRoute()) return;
  const target = `${TVF_ADMIN_LOGIN_ROUTE}?next=${encodeURIComponent(currentAdminRoute())}`;
  window.location.replace(target);
}

function syncAdminSessionPanels() {
  const active = Boolean(readSessionToken());
  const loginRoute = isAdminLoginRoute();
  document.body?.classList.toggle("admin-session-active", active);
  document.body?.classList.toggle("admin-session-required", !active && !loginRoute);
  document.querySelectorAll("section, div, main").forEach((element) => {
    if (isAdminPanel(element, "-login")) {
      element.hidden = active || !loginRoute;
      element.classList.toggle("tvf-admin-login-panel", true);
    }
    if (isAdminPanel(element, "-app")) {
      element.classList.toggle("tvf-admin-app-panel", true);
      element.hidden = !active;
      if (active) element.hidden = false;
    }
  });
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
  if (readSessionToken()) {
    syncAdminSessionPanels();
    return;
  }
  if (cookieChecked()) {
    syncAdminSessionPanels();
    redirectToAdminLogin();
    return;
  }
  markCookieChecked(true);
  document.body?.classList.add("admin-session-checking");
  try {
    const response = await fetch("/api/admin-session", { method: "GET", headers: { "Content-Type": "application/json" } });
    if (!response.ok) {
      syncAdminSessionPanels();
      redirectToAdminLogin();
      return;
    }
    writeSessionToken(TVF_ADMIN_COOKIE_SENTINEL);
    window.location.reload();
  } catch {
    syncAdminSessionPanels();
    redirectToAdminLogin();
  } finally {
    document.body?.classList.remove("admin-session-checking");
  }
}

function bindAdminSessionBridge() {
  document.addEventListener("submit", (event) => {
    const form = event.target?.closest?.("form");
    if (!form || !form.matches('[data-admin-home-token-form], [data-dashboard-token-form], [data-admin-token-form], [data-crm-token-form], [data-cases-token-form], [data-documents-token-form], [data-procedures-token-form], [data-knowledge-token-form], [data-ai-token-form], [data-map-token-form], [data-observatoire-token-form], [data-finances-token-form], [data-impact-token-form], [data-branches-token-form], [data-governance-token-form], [data-risks-token-form], [data-users-token-form], [data-emails-token-form], [data-work-token-form], [data-settings-token-form], [data-activity-token-form]')) return;
    const value = String(new FormData(form).get("token") || "").trim();
    if (!value) return;
    markCookieChecked(false);
    try { fetch("/api/admin-session", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${value}` }, keepalive: true }); } catch {}
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('[data-admin-home-logout], [data-dashboard-logout], [data-admin-logout], [data-crm-logout], [data-cases-logout], [data-documents-logout], [data-procedures-logout], [data-knowledge-logout], [data-ai-logout], [data-map-logout], [data-observatoire-logout], [data-finances-logout], [data-impact-logout], [data-branches-logout], [data-governance-logout], [data-risks-logout], [data-users-logout], [data-emails-logout], [data-work-logout], [data-settings-logout], [data-activity-logout]')) clearAdminSession();
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

function moduleRoute(moduleHref) {
  return String(moduleHref || "").split(/[?#]/)[0];
}

function moduleIsActive(current, moduleHref) {
  const route = moduleRoute(moduleHref);
  return current === route || (current === "dashboard" && route === "dashboard") || (current === "admin" && route === "admin");
}

function groupIsActive(current, group) {
  return group.modules.some((module) => moduleIsActive(current, module.href));
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
  nav.setAttribute("aria-label", "Navigation TVF OS");
  nav.innerHTML = `
    <div class="admin-module-shell">
      <div class="admin-module-title">
        <span>TVF OS</span>
        <strong>Centre operationnel</strong>
      </div>
      <div class="admin-module-groups">
        ${TVF_ADMIN_GROUPS.map((group) => {
          const activeGroup = groupIsActive(current, group);
          return `<section class="admin-module-group${activeGroup ? " is-active is-open" : ""}">
            <button class="admin-module-group-head" type="button" aria-expanded="${activeGroup ? "true" : "false"}">
              <span>${group.label}</span>
              <small>${group.description}</small>
            </button>
            <div class="admin-module-links">
              ${group.modules.map((module) => {
                const active = moduleIsActive(current, module.href);
                return `<a href="${module.href}"${active ? ' aria-current="page" class="is-active"' : ""}><i>${module.icon}</i><span>${module.label}</span></a>`;
              }).join("")}
            </div>
          </section>`;
        }).join("")}
      </div>
    </div>`;
  topbar.insertAdjacentElement("afterend", nav);

  nav.addEventListener("click", (event) => {
    const button = event.target.closest(".admin-module-group-head");
    if (!button) return;
    const group = button.closest(".admin-module-group");
    const open = !group.classList.contains("is-open");
    group.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  });
}

function showAdminNotice(message, type = "info") {
  const text = String(message || "").trim();
  if (!text) return;
  let stack = document.querySelector("[data-admin-notice-stack]");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "admin-notice-stack";
    stack.dataset.adminNoticeStack = "";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const notice = document.createElement("div");
  const tone = ["success", "error", "warning", "info"].includes(type) ? type : "info";
  notice.className = `admin-notice admin-notice-${tone}`;
  notice.setAttribute("role", tone === "error" ? "alert" : "status");
  const label = document.createElement("span");
  label.textContent = text;
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Fermer la notification");
  closeButton.innerHTML = "&times;";
  notice.append(label, closeButton);
  stack.appendChild(notice);
  const close = () => {
    notice.classList.add("is-leaving");
    window.setTimeout(() => notice.remove(), 180);
  };
  closeButton.addEventListener("click", close);
  window.setTimeout(close, tone === "error" ? 6200 : 4200);
}

function installAdminDialogPolish() {
  if (!document.body?.classList.contains("admin-body")) return;
  if (window.__tvfAdminDialogPolish) return;
  window.__tvfAdminDialogPolish = true;
  const nativeAlert = window.alert?.bind(window);
  window.alert = (message) => {
    if (window.tvfAdminNotice) window.tvfAdminNotice(message, "info");
    else if (nativeAlert) nativeAlert(message);
  };
}
window.tvfAdminNotice = showAdminNotice;
installAdminDialogPolish();
syncAdminSessionPanels();
bindAdminSessionBridge();
hydrateSessionFromCookie();
createAdminModuleNav();
syncAdminSessionPanels();
