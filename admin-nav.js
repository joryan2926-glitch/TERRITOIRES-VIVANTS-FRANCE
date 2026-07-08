const TVF_ADMIN_TOKEN_KEY = "tvfAdminToken";
const TVF_ADMIN_COOKIE_SENTINEL = "__tvf_cookie_session__";
const TVF_ADMIN_COOKIE_CHECK_KEY = "tvfAdminCookieHydrated";

const TVF_ADMIN_GROUPS = [
  {
    label: "Pilotage",
    description: "Vue d'ensemble et priorites",
    modules: [
      { href: "admin", label: "Accueil", icon: "âŒ‚" },
      { href: "dashboard", label: "Dashboard", icon: "â–¦" },
    ],
  },
  {
    label: "Demandes & relation",
    description: "Entrants, contacts et suivi",
    modules: [
      { href: "admin-demandes", label: "Demandes", icon: "âœ‰" },
      { href: "admin-crm", label: "CRM", icon: "â—Ž" },
      { href: "admin-emails", label: "E-mails", icon: "@" },
      { href: "admin-work", label: "Taches", icon: "âœ“" },
      { href: "admin-dossiers", label: "Dossiers", icon: "â–£" },
    ],
  },
  {
    label: "Ressources",
    description: "Documents, procedures et savoir",
    modules: [
      { href: "admin-documents", label: "Documents", icon: "â–¡" },
      { href: "admin-procedures", label: "Procedures", icon: "Â§" },
      { href: "admin-knowledge", label: "Connaissances", icon: "i" },
      { href: "admin-ai", label: "Assistant IA", icon: "âœ¦" },
    ],
  },
  {
    label: "Territoires & impact",
    description: "Carte, observatoire et resultats",
    modules: [
      { href: "admin-map", label: "Cartographie", icon: "âŒ–" },
      { href: "admin-observatoire", label: "Observatoire", icon: "â—Œ" },
      { href: "admin-finances", label: "Finances", icon: "â‚¬" },
      { href: "admin-impact", label: "Impact", icon: "%" },
      { href: "admin-branches", label: "Antennes", icon: "âŒ¬" },
    ],
  },
  {
    label: "Administration",
    description: "Gouvernance, risques et acces",
    modules: [
      { href: "admin-governance", label: "Gouvernance", icon: "â—‡" },
      { href: "admin-risks", label: "Risques", icon: "!" },
      { href: "admin-users", label: "Utilisateurs", icon: "â—‰" },
      { href: "admin-settings", label: "Parametres", icon: "âš™" },
    ],
  },
];

const TVF_ADMIN_MODULES = TVF_ADMIN_GROUPS.flatMap((group) => group.modules);

function readSessionToken() {
  try { return sessionStorage.getItem(TVF_ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}

function writeSessionToken(value) {
  try { if (value) sessionStorage.setItem(TVF_ADMIN_TOKEN_KEY, value); else sessionStorage.removeItem(TVF_ADMIN_TOKEN_KEY); } catch {}
  document.body?.classList.toggle("admin-session-active", Boolean(value));
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
    document.body?.classList.add("admin-session-active");
    return;
  }
  if (cookieChecked()) return;
  markCookieChecked(true);
  document.body?.classList.add("admin-session-checking");
  try {
    const response = await fetch("/api/admin-session", { method: "GET", headers: { "Content-Type": "application/json" } });
    if (!response.ok) return;
    writeSessionToken(TVF_ADMIN_COOKIE_SENTINEL);
    window.location.reload();
  } catch {
    // La page affichera son ecran de connexion si aucune session valide n'existe.
  } finally {
    document.body?.classList.remove("admin-session-checking");
  }
}

function bindAdminSessionBridge() {
  document.addEventListener("submit", (event) => {
    const form = event.target?.closest?.("form");
    if (!form || !form.matches('[data-admin-home-token-form], [data-dashboard-token-form], [data-admin-token-form], [data-crm-token-form], [data-cases-token-form], [data-documents-token-form], [data-procedures-token-form], [data-knowledge-token-form], [data-ai-token-form], [data-map-token-form], [data-observatoire-token-form], [data-finances-token-form], [data-impact-token-form], [data-branches-token-form], [data-governance-token-form], [data-risks-token-form], [data-users-token-form], [data-emails-token-form], [data-work-token-form], [data-settings-token-form]')) return;
    const value = String(new FormData(form).get("token") || "").trim();
    if (!value) return;
    markCookieChecked(false);
    try { fetch("/api/admin-session", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${value}` }, keepalive: true }); } catch {}
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('[data-admin-home-logout], [data-dashboard-logout], [data-admin-logout], [data-crm-logout], [data-cases-logout], [data-documents-logout], [data-procedures-logout], [data-knowledge-logout], [data-ai-logout], [data-map-logout], [data-observatoire-logout], [data-finances-logout], [data-impact-logout], [data-branches-logout], [data-governance-logout], [data-risks-logout], [data-users-logout], [data-emails-logout], [data-work-logout], [data-settings-logout]')) clearAdminSession();
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

function moduleIsActive(current, moduleHref) {
  return current === moduleHref || (current === "dashboard" && moduleHref === "dashboard") || (current === "admin" && moduleHref === "admin");
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
          return `<section class="admin-module-group${activeGroup ? " is-active" : ""}">
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

document.body?.classList.toggle("admin-session-active", Boolean(readSessionToken()));
bindAdminSessionBridge();
hydrateSessionFromCookie();
createAdminModuleNav();