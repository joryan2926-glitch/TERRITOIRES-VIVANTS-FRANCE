const ADMIN_HOME_TOKEN_KEY = "tvfAdminToken";

const pageMode = document.body?.dataset.adminPage || "portal";
const isLoginPage = pageMode === "login";
const loginSection = document.querySelector("[data-admin-home-login]");
const appSection = document.querySelector("[data-admin-home-app]");
const tokenForm = document.querySelector("[data-admin-home-token-form]");
const loginStatus = document.querySelector("[data-admin-home-login-status]");
const logoutButton = document.querySelector("[data-admin-home-logout]");
const todayPanelEl = document.querySelector("[data-admin-today-panel]");
const todayStatusEl = document.querySelector("[data-admin-today-status]");
const todayKpisEl = document.querySelector("[data-admin-today-kpis]");
const todayRequestsEl = document.querySelector("[data-admin-today-requests]");
const todayCasesEl = document.querySelector("[data-admin-today-cases]");
const todayTasksEl = document.querySelector("[data-admin-today-tasks]");

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

function escapeHome(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function apiHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}

async function adminHomeApi(path) {
  const response = await fetch(path, { headers: apiHeaders() });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) throw new Error(result.error || "Lecture impossible.");
  return result;
}

function isLate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

function shortDate(value) {
  if (!value) return "A planifier";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

function activeRequest(item) {
  return !["accepte", "refuse", "archive"].includes(item.status || "");
}

function activeCase(item) {
  return !["cloture", "archive"].includes(item.status || "");
}

function openTask(item) {
  return !["done", "archive", "cancelled", "canceled"].includes(item.status || "");
}

function requestScore(item) {
  let score = 0;
  if (item.priority === "urgente") score += 80;
  if (item.priority === "haute") score += 45;
  if (["nouveau", "a_qualifier"].includes(item.status)) score += 30;
  if (isLate(item.next_action_due_at)) score += 50;
  return score;
}

function caseScore(item) {
  let score = 0;
  if (item.priority === "urgente") score += 70;
  if (item.priority === "haute") score += 38;
  if (isLate(item.next_action_due_at)) score += 70;
  if (["a_decision", "attente_pieces"].includes(item.status)) score += 30;
  return score;
}

function itemCard({ href, title, meta, tag }) {
  return `<a class="admin-today-item" href="${href}"><span><strong>${escapeHome(title)}</strong><small>${escapeHome(meta)}</small></span>${tag ? `<em>${escapeHome(tag)}</em>` : ""}</a>`;
}

function renderTodayList(element, items, emptyText) {
  if (!element) return;
  element.innerHTML = items.length ? items.join("") : `<p class="form-note">${escapeHome(emptyText)}</p>`;
}

async function loadAdminHomeOps() {
  if (!todayPanelEl || !token()) return;
  if (todayStatusEl) todayStatusEl.textContent = "Lecture en cours";
  try {
    const [requestsResult, casesResult, tasksResult] = await Promise.allSettled([
      adminHomeApi("/api/admin-contacts?limit=80"),
      adminHomeApi("/api/admin-cases?limit=80"),
      adminHomeApi("/api/admin-work?entity=tasks&limit=80"),
    ]);
    const requests = requestsResult.status === "fulfilled" ? requestsResult.value.contacts || [] : [];
    const cases = casesResult.status === "fulfilled" ? casesResult.value.cases || [] : [];
    const tasks = tasksResult.status === "fulfilled" ? tasksResult.value.tasks || [] : [];

    const activeRequests = requests.filter(activeRequest).sort((a, b) => requestScore(b) - requestScore(a));
    const activeCases = cases.filter(activeCase).sort((a, b) => caseScore(b) - caseScore(a));
    const openTasks = tasks.filter(openTask).sort((a, b) => new Date(a.due_at || 8640000000000000) - new Date(b.due_at || 8640000000000000));
    const lateCount = activeRequests.filter((item) => isLate(item.next_action_due_at)).length + activeCases.filter((item) => isLate(item.next_action_due_at)).length + openTasks.filter((item) => isLate(item.due_at)).length;

    if (todayKpisEl) {
      todayKpisEl.innerHTML = [
        ["Demandes", activeRequests.length, "A qualifier"],
        ["Dossiers", activeCases.length, "Actifs"],
        ["Taches", openTasks.length, "Ouvertes"],
        ["Alertes", lateCount, "Retards"],
      ].map(([label, value, detail]) => `<article><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join("");
    }

    renderTodayList(todayRequestsEl, activeRequests.slice(0, 4).map((item) => itemCard({ href: `admin-demandes?q=${encodeURIComponent(item.request_number || item.full_name || item.subject || "")}`, title: item.subject || item.full_name || item.request_number || "Demande TVF", meta: `${item.full_name || "Interlocuteur"} - ${item.status || "a qualifier"}`, tag: item.priority || "normale" })), "Aucune demande prioritaire." );
    renderTodayList(todayCasesEl, activeCases.slice(0, 4).map((item) => itemCard({ href: `admin-dossiers?q=${encodeURIComponent(item.case_number || item.title || "")}`, title: item.case_number || item.title || "Dossier TVF", meta: item.next_action || item.status || "Suite a definir", tag: shortDate(item.next_action_due_at) })), "Aucun dossier actif prioritaire." );
    renderTodayList(todayTasksEl, openTasks.slice(0, 4).map((item) => itemCard({ href: `admin-work?q=${encodeURIComponent(item.title || "")}`, title: item.title || "Tache TVF", meta: item.assigned_to || item.status || "A traiter", tag: shortDate(item.due_at) })), "Aucune tache ouverte prioritaire." );
    if (todayStatusEl) todayStatusEl.textContent = "A jour";
  } catch (error) {
    if (todayStatusEl) todayStatusEl.textContent = "Lecture partielle";
    renderTodayList(todayRequestsEl, [], "Synthese indisponible pour le moment.");
  }
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
  loadAdminHomeOps().catch(() => {});
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
