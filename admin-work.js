const WORK_TOKEN_KEY = "tvfAdminToken";
const labels = { todo: "A faire", doing: "En cours", waiting: "Attente", done: "Termine", cancelled: "Annule", archive: "Archive", active: "Actif", paused: "Pause", completed: "Termine", scheduled: "Planifie", confirmed: "Confirme", P1: "P1", P2: "P2", P3: "P3" };
const viewLabels = { tasks: "Taches", events: "Agenda", projects: "Projets", rules: "Automatisations" };
const loginSection = document.querySelector("[data-work-login]");
const appSection = document.querySelector("[data-work-app]");
const tokenForm = document.querySelector("[data-work-token-form]");
const loginStatus = document.querySelector("[data-work-login-status]");
const filtersForm = document.querySelector("[data-work-filters]");
const kpisEl = document.querySelector("[data-work-kpis]");
const listEl = document.querySelector("[data-work-list]");
const detailEl = document.querySelector("[data-work-detail]");
const countEl = document.querySelector("[data-work-count]");
const listCountEl = document.querySelector("[data-work-list-count]");
const listTitleEl = document.querySelector("[data-work-list-title]");
const emptyEl = document.querySelector("[data-work-empty]");
const aiScoreEl = document.querySelector("[data-work-ai-score]");
const aiSummaryEl = document.querySelector("[data-work-ai-summary]");
const aiGridEl = document.querySelector("[data-work-ai-grid]");
const tabs = document.querySelectorAll("[data-work-view]");
const createButton = document.querySelector("[data-work-create]");
const refreshButton = document.querySelector("[data-work-refresh]");
const exportButton = document.querySelector("[data-work-export]");
const logoutButton = document.querySelector("[data-work-logout]");
const modal = document.querySelector("[data-work-modal]");
const modalForm = document.querySelector("[data-work-form]");
const closeModalButtons = document.querySelectorAll("[data-work-close-modal]");
let view = "tasks";
let dashboard = null;
let data = { tasks: [], events: [], projects: [], rules: [] };
let selectedId = null;
let debounceTimer;
function token() { try { return sessionStorage.getItem(WORK_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(WORK_TOKEN_KEY, value); else sessionStorage.removeItem(WORK_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(value) { return labels[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date); }
function toDateTimeLocal(value) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000); return local.toISOString().slice(0, 16); }
function currentItems() { return data[view] || []; }
function selectedItem() { return currentItems().find((item) => item.id === selectedId) || currentItems()[0] || null; }
async function api(path, options = {}) { const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } }); const text = await response.text(); const result = text ? JSON.parse(text) : { ok: response.ok }; if (!response.ok || result.ok === false) { const error = new Error(result.error || "Action impossible."); error.status = response.status; throw error; } return result; }
function filtersParams(entity) { const formData = new FormData(filtersForm); const params = new URLSearchParams({ entity, limit: "260" }); const q = String(formData.get("q") || "").trim(); const status = String(formData.get("status") || "").trim(); if (q) params.set("q", q); if (status && status !== "all") params.set("status", status); return params; }
async function loadAll() { if (countEl) countEl.textContent = "Chargement du planning..."; const overview = await api("/api/admin-work?entity=dashboard"); const [tasks, events, projects, rules] = await Promise.all([api(`/api/admin-work?${filtersParams("tasks").toString()}`), api(`/api/admin-work?${filtersParams("events").toString()}`), api(`/api/admin-work?${filtersParams("projects").toString()}`), api("/api/admin-work?entity=rules&limit=200")]); dashboard = overview.dashboard || {}; data = { tasks: tasks.tasks || [], events: events.events || [], projects: projects.projects || [], rules: rules.rules || [] }; if (!currentItems().some((item) => item.id === selectedId)) selectedId = currentItems()[0]?.id || null; renderAll(); }
function renderAll() { renderKpis(); renderAssistant(); renderTabs(); renderList(); renderDetail(); }
function renderKpis() { if (!kpisEl) return; kpisEl.innerHTML = `<article><span>Projets actifs</span><strong>${dashboard?.active_projects || 0}</strong><small>en cours</small></article><article><span>Taches ouvertes</span><strong>${dashboard?.open_tasks || 0}</strong><small>a suivre</small></article><article data-tone="danger"><span>Retards</span><strong>${dashboard?.overdue_tasks || 0}</strong><small>a traiter</small></article><article><span>Aujourd'hui</span><strong>${dashboard?.today_events || 0}</strong><small>agenda</small></article><article><span>Regles</span><strong>${dashboard?.active_rules || 0}</strong><small>actives</small></article>`; if (countEl) countEl.textContent = `${dashboard?.open_tasks || 0} tache(s), ${dashboard?.overdue_tasks || 0} retard(s), ${dashboard?.today_events || 0} evenement(s) aujourd'hui.`; }
function renderAssistant() { const item = selectedItem(); const assistant = item?.assistant || dashboard?.assistant || {}; if (aiScoreEl) aiScoreEl.textContent = item?.assistant?.urgency_score ? `${item.assistant.urgency_score}%` : `${dashboard?.overdue_tasks || 0}`; if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || dashboard?.assistant?.summary || "Analyse en attente."; if (!aiGridEl) return; const actions = assistant.next_actions || dashboard?.assistant?.priorities || []; aiGridEl.innerHTML = actions.length ? actions.slice(0, 4).map((action) => `<div><span>Action</span><strong>${escapeHtml(action)}</strong></div>`).join("") : `<div><span>Action</span><strong>Planning sous controle</strong></div>`; }
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.workView === view)); }
function titleFor(item) { return item.title || item.rule_key || "Element"; }
function subFor(item) { return item.assigned_to || item.owner_name || item.organizer_name || item.pole || item.trigger_type || "TVF OS"; }
function itemStatus(item) { return item.status || item.priority || ""; }
function itemDate(item) { return item.due_at || item.starts_at || item.updated_at || item.created_at; }
function itemCard(item) { const risk = item.assistant?.overdue || item.priority === "P1" ? " is-risk" : ""; return `<button class="admin-request work-card${item.id === selectedId ? " is-active" : ""}${risk}" type="button" data-work-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(titleFor(item))}</strong><small>${escapeHtml(label(itemStatus(item)))}</small></span><span>${escapeHtml(subFor(item))}</span><span class="admin-request-sub">${escapeHtml(item.description || item.summary || item.notes || item.ai_summary || "")}</span><span class="admin-badges"><em>${escapeHtml(viewLabels[view])}</em><em>${escapeHtml(formatDate(itemDate(item)))}</em></span></button>`; }
function renderList() { if (listTitleEl) listTitleEl.textContent = viewLabels[view]; if (listCountEl) listCountEl.textContent = String(currentItems().length); if (emptyEl) emptyEl.hidden = currentItems().length > 0; if (listEl) listEl.innerHTML = currentItems().map(itemCard).join(""); }
function projectProgressStage(project = {}) {
  const progress = Number(project.progress || 0);
  if (["completed", "done"].includes(project.status) || progress >= 100) return 4;
  if (progress >= 70) return 3;
  if (progress >= 35) return 2;
  if (progress > 0 || project.status === "active") return 1;
  return 0;
}
function projectPortfolioPanel(project = {}) {
  const steps = [
    ["Idee", "Besoin et opportunite"],
    ["Etude", "Cadrage et acteurs"],
    ["Mobilisation", "Partenaires et moyens"],
    ["Execution", "Actions et suivi"],
    ["Bilan", "Impact et cloture"]
  ];
  const current = projectProgressStage(project);
  return `<ol class="work-project-path" aria-label="Parcours projet TVF">${steps.map((step, index) => `<li class="${index <= current ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[1])}</small></li>`).join("")}</ol>`;
}
function projectControlPanel(project = {}) {
  const due = project.due_at ? new Date(project.due_at).getTime() : 0;
  const overdue = due && due < Date.now() && !["completed", "cancelled", "archive"].includes(project.status);
  const controls = [
    ["Priorite", label(project.priority)],
    ["Progression", `${Number(project.progress || 0)}%`],
    ["Echeance", formatDate(project.due_at)],
    ["Situation", overdue ? "Retard a traiter" : "Sous controle"]
  ];
  return `<section class="work-project-control"><div class="admin-panel-head"><div><p class="section-kicker">Portefeuille operationnel</p><h3>Suivi projet</h3></div><strong>${escapeHtml(project.status || "active")}</strong></div><div class="work-project-control-grid">${controls.map((item) => `<div><span>${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong></div>`).join("")}</div><div class="admin-detail-actions"><button class="btn secondary" type="button" data-project-action="kickoff">Creer taches de lancement</button><button class="btn secondary" type="button" data-project-action="review">Planifier revue</button><button class="btn secondary" type="button" data-project-action="report">Preparer reporting</button></div></section>`;
}
function statusOptions(current) { const values = view === "tasks" ? ["todo", "doing", "waiting", "done", "cancelled", "archive"] : view === "events" ? ["scheduled", "confirmed", "done", "cancelled", "archive"] : ["draft", "active", "paused", "completed", "cancelled", "archive"]; return values.map((value) => `<option value="${value}" ${value === current ? "selected" : ""}>${escapeHtml(label(value))}</option>`).join(""); }
function renderDetail() {
  const item = selectedItem();
  if (!detailEl) return;
  if (!item) { detailEl.innerHTML = `<p class="form-note">Aucun element selectionne.</p>`; return; }
  const type = view === "projects" ? "project" : view === "events" ? "event" : "task";
  const editable = view !== "rules";
  const projectPanels = view === "projects" ? `${projectPortfolioPanel(item)}${projectControlPanel(item)}` : "";
  const projectFields = view === "projects" ? `<label>Progression<input name="progress" type="number" min="0" max="100" value="${escapeHtml(item.progress || 0)}"></label><label>Debut<input name="start_at" type="date" value="${escapeHtml((item.start_at || "").slice(0, 10))}"></label><label>Echeance<input name="due_at" type="date" value="${escapeHtml((item.due_at || "").slice(0, 10))}"></label>` : "";
  const dateField = view === "tasks" ? `<label>Echeance<input name="due_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.due_at))}"></label>` : view === "events" ? `<label>Debut<input name="starts_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.starts_at))}"></label>` : "";
  const form = editable ? `<form class="work-detail-form" data-work-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${escapeHtml(type)}"><label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Statut<select name="status">${statusOptions(item.status)}</select></label><label>Responsable<input name="assigned_to" value="${escapeHtml(item.assigned_to || item.owner_name || item.organizer_name || "")}"></label><label>Pole<input name="pole" value="${escapeHtml(item.pole || "")}"></label>${dateField}${projectFields}<label class="work-wide-field">Description<textarea name="summary" rows="5">${escapeHtml(item.description || item.summary || item.notes || "")}</textarea></label><button class="btn primary" type="submit">Enregistrer</button></form>` : `<pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre>`;
  detailEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">${escapeHtml(viewLabels[view])}</p><h2>${escapeHtml(titleFor(item))}</h2><p>${escapeHtml(subFor(item))}</p></div><span>${escapeHtml(label(itemStatus(item)))}</span></div>${projectPanels}${form}`;
}
function openModal() { if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; modalForm?.reset(); }
function payloadFromForm(form) { const payload = Object.fromEntries(new FormData(form)); Object.keys(payload).forEach((key) => { payload[key] = String(payload[key] || "").trim(); if (!payload[key]) delete payload[key]; }); if (payload.type === "event") { payload.starts_at = payload.due_at || payload.starts_at; delete payload.due_at; }
  if (payload.type === "project" && payload.assigned_to) { payload.owner_name = payload.assigned_to; delete payload.assigned_to; }
  if (payload.summary) payload.description = payload.summary;
  return payload; }
async function createProjectTask(project, title, description, days = 7, priority = "P2") {
  const due = new Date();
  due.setDate(due.getDate() + days);
  due.setHours(17, 0, 0, 0);
  await api("/api/admin-work", { method: "POST", body: JSON.stringify({ type: "task", project_id: project.id, title, description, status: "todo", priority, pole: project.pole || "Pilotage", assigned_to: project.owner_name || "TVF", due_at: due.toISOString() }) });
}
async function applyProjectAction(action) {
  const project = selectedItem();
  if (!project || view !== "projects") return;
  if (action === "kickoff") {
    await createProjectTask(project, `Cadrer le projet - ${titleFor(project)}`, "Formaliser objectif, acteurs, pieces et risques du projet.", 3, "P2");
    await createProjectTask(project, `Lister les partenaires - ${titleFor(project)}`, "Identifier collectivite, proprietaire, entreprise, financeur ou benevoles utiles.", 7, "P2");
    await createProjectTask(project, `Preparer documents - ${titleFor(project)}`, "Rattacher note, budget, convention ou courrier au projet.", 10, "P3");
  }
  if (action === "review") await createProjectTask(project, `Revue projet - ${titleFor(project)}`, "Faire le point sur avancement, blocages, echeances et prochaine decision.", 5, "P2");
  if (action === "report") await createProjectTask(project, `Reporting projet - ${titleFor(project)}`, "Preparer elements de suivi : actions, pieces, partenaires, risques et indicateurs.", 14, "P3");
  await loadAll();
}
async function createItem(event) { event.preventDefault(); await api("/api/admin-work", { method: "POST", body: JSON.stringify(payloadFromForm(modalForm)) }); closeModal(); await loadAll(); }
async function saveDetail(form) { const payload = payloadFromForm(form); await api("/api/admin-work", { method: "PATCH", body: JSON.stringify(payload) }); await loadAll(); }
function exportCsv() { const rows = [["Vue", "Titre", "Statut", "Responsable", "Date"], ...currentItems().map((item) => [viewLabels[view], titleFor(item), label(itemStatus(item)), subFor(item), formatDate(itemDate(item))])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `planning-tvf-os-${view}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadAll(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadAll().catch((e) => alert(e.message)), 260); }); filtersForm?.addEventListener("change", () => loadAll().catch((e) => alert(e.message))); tabs.forEach((button) => button.addEventListener("click", () => { view = button.dataset.workView || "tasks"; selectedId = currentItems()[0]?.id || null; renderAll(); })); refreshButton?.addEventListener("click", () => loadAll().catch((e) => alert(e.message))); createButton?.addEventListener("click", openModal); exportButton?.addEventListener("click", exportCsv); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin"; }); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalForm?.addEventListener("submit", createItem); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-work-id]"); if (!button) return; selectedId = button.dataset.workId; renderAll(); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-work-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form).catch((e) => alert(e.message)); }); detailEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-project-action]"); if (button) applyProjectAction(button.dataset.projectAction).catch((e) => alert(e.message)); }); }
bindEvents();
if (token()) { showApp(); loadAll().catch((error) => { setToken(""); showLogin(); setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error"); }); } else { showLogin(); }
