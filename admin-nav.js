const TVF_ADMIN_TOKEN_KEY = "tvfAdminToken";
const TVF_ADMIN_COOKIE_SENTINEL = "__tvf_cookie_session__";
const TVF_ADMIN_COOKIE_CHECK_KEY = "tvfAdminCookieHydrated";
const TVF_ADMIN_LOGIN_ROUTE = "admin-login";

const TVF_ADMIN_GROUPS = [
  { label: "Piloter", description: "Vue territoriale", modules: [
    { href: "admin", label: "Tableau de bord", icon: "?", badge: "" },
    { href: "admin-map", label: "Carte territoriale", icon: "?", badge: "" },
    { href: "admin-demandes", label: "Signalements", icon: "?", badge: "" },
  ] },
  { label: "Observer", description: "Biens et donnees", modules: [
    { href: "admin-observatoire", label: "Observatoire", icon: "?", badge: "" },
    { href: "admin-dossiers?case_type=bien_vacant", label: "Habitat", icon: "?", badge: "" },
    { href: "admin-dossiers?case_type=commerce_inoccupe", label: "Commerce", icon: "?", badge: "" },
    { href: "admin-map", label: "Friches et terrains", icon: "?", badge: "" },
  ] },
  { label: "Instruire", description: "Dossiers actifs", modules: [
    { href: "admin-dossiers", label: "Dossiers", icon: "?", badge: "" },
    { href: "admin-dossiers?create=client", label: "Creer un dossier", icon: "+", badge: "" },
    { href: "admin-work", label: "Agenda et taches", icon: "?", badge: "" },
  ] },
  { label: "Acteurs", description: "Reseau territorial", modules: [
    { href: "admin-crm", label: "Proprietaires", icon: "?", badge: "" },
    { href: "admin-crm?profile=collectivite", label: "Collectivites", icon: "?", badge: "" },
    { href: "admin-crm?profile=entreprise", label: "Entreprises", icon: "?", badge: "" },
    { href: "admin-crm?profile=partenaire", label: "Partenaires", icon: "?", badge: "" },
  ] },
  { label: "Ressources", description: "Documents et materiaux", modules: [
    { href: "admin-documents#bibliotheque-interne-tvf", label: "Materiatheque", icon: "?", badge: "" },
    { href: "admin-documents", label: "Documents", icon: "?", badge: "" },
    { href: "admin-emails", label: "Courriers et e-mails", icon: "@", badge: "" },
    { href: "admin-procedures", label: "Modeles et procedures", icon: "?", badge: "" },
  ] },
  { label: "Analyser", description: "Impact et IA", modules: [
    { href: "dashboard", label: "Statistiques", icon: "?", badge: "" },
    { href: "admin-impact", label: "Rapports", icon: "?", badge: "" },
    { href: "admin-ai", label: "TVF IA", icon: "?", badge: "" },
    { href: "admin-users", label: "Utilisateurs", icon: "?", badge: "" },
    { href: "admin-settings", label: "Parametres", icon: "?", badge: "" },
  ] },
];
const TVF_ADMIN_MODULES = TVF_ADMIN_GROUPS.flatMap((group) => group.modules);
const TVF_ADMIN_QUICK_ACTIONS = [
  { href: "admin-demandes", label: "Nouveau signalement", tone: "primary" },
  { href: "admin-dossiers?create=client", label: "Creer un dossier", tone: "strong" },
  { href: "admin-map", label: "Ouvrir la carte", tone: "neutral" },
  { href: "admin-ai", label: "TVF IA", tone: "neutral" },
];
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
      <div class="admin-module-title"><img src="assets/logo-territoires-vivants-france-web.png" alt="TVF" width="220" height="68"><span>TVF OS</span><strong>Systeme territorial</strong></div>
      <div class="admin-os-quickbar" aria-label="Actions rapides TVF OS">
        <div class="admin-os-quicklinks">
          ${TVF_ADMIN_QUICK_ACTIONS.map((action) => `<a class="admin-os-quicklink is-${action.tone}" href="${action.href}">${action.label}</a>`).join("")}
        </div>
        <form class="admin-os-search" data-admin-global-search>
          <label class="sr-only" for="admin-global-search">Recherche TVF OS</label>
          <input id="admin-global-search" name="q" type="search" placeholder="Rechercher un bien, dossier, proprietaire, commune...">
          <button type="submit">Rechercher</button>
        </form>
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
                return `<a href="${module.href}"${active ? ' aria-current="page" class="is-active"' : ""}><i>${module.icon}</i><span>${module.label}</span>${module.badge ? `<b>${module.badge}</b>` : ""}</a>`;
              }).join("")}
            </div>
          </section>`;
        }).join("")}
      </div>
    </div>`;
  topbar.insertAdjacentElement("afterend", nav);

  const groups = Array.from(nav.querySelectorAll(".admin-module-group"));
  const desktopHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let hoverOpenTimer = null;
  let hoverCloseTimer = null;

  function setGroupOpen(group, open) {
    if (!group) return;
    const button = group.querySelector(".admin-module-group-head");
    group.classList.toggle("is-open", open);
    group.classList.toggle("is-hover", false);
    button?.setAttribute("aria-expanded", String(open));
  }

  function closeGroups(except = null) {
    groups.forEach((group) => {
      if (group !== except) setGroupOpen(group, false);
    });
  }

  function openGroup(group, hover = false) {
    window.clearTimeout(hoverCloseTimer);
    closeGroups(group);
    if (!group) return;
    const button = group.querySelector(".admin-module-group-head");
    group.classList.add("is-open");
    group.classList.toggle("is-hover", hover);
    button?.setAttribute("aria-expanded", "true");
  }

  function scheduleHoverOpen(group) {
    if (!desktopHover()) return;
    window.clearTimeout(hoverOpenTimer);
    window.clearTimeout(hoverCloseTimer);
    hoverOpenTimer = window.setTimeout(() => openGroup(group, true), 90);
  }

  function scheduleHoverClose() {
    if (!desktopHover()) return;
    window.clearTimeout(hoverOpenTimer);
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = window.setTimeout(() => closeGroups(), 170);
  }

  groups.forEach((group) => {
    group.addEventListener("pointerenter", () => scheduleHoverOpen(group));
    group.addEventListener("pointerleave", scheduleHoverClose);
    group.addEventListener("focusin", () => openGroup(group));
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest(".admin-module-links a, .admin-os-quicklink");
    if (link) {
      closeGroups();
      return;
    }
    const button = event.target.closest(".admin-module-group-head");
    if (!button) return;
    const group = button.closest(".admin-module-group");
    const open = !group.classList.contains("is-open");
    closeGroups(group);
    setGroupOpen(group, open);
  });

  nav.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!nav.contains(document.activeElement)) closeGroups();
    }, 0);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) closeGroups();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeGroups();
  });
  nav.addEventListener("submit", (event) => {
    const form = event.target?.closest?.("[data-admin-global-search]");
    if (!form) return;
    event.preventDefault();
    const query = String(new FormData(form).get("q") || "").trim();
    window.location.href = query ? `admin-dossiers?q=${encodeURIComponent(query)}` : "admin-dossiers";
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
