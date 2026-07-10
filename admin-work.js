const WORK_TOKEN_KEY = "tvfAdminToken";
const labels = { todo: "A faire", doing: "En cours", waiting: "Attente", done: "Termine", cancelled: "Annule", archive: "Archive", active: "Actif", paused: "Pause", completed: "Termine", scheduled: "Planifie", confirmed: "Confirme", P1: "P1", P2: "P2", P3: "P3" };
const viewLabels = { tasks: "Taches", events: "Agenda", projects: "Projets", rules: "Automatisations" };
const loginSection = document.querySelector("[data-work-login]");
const appSection = document.querySelector("[data-work-app]");
const tokenForm = document.querySelector("[data-work-token-form]");
const loginStatus = document.querySelector("[data-work-login-status]");
const filtersForm = document.querySelector("[data-work-filters]");
const kpisEl = document.querySelector("[data-work-kpis]");
const briefingEl = document.querySelector("[data-work-briefing]");
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
let workScope = "all";
let debounceTimer;
function token() { try { return sessionStorage.getItem(WORK_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(WORK_TOKEN_KEY, value); else sessionStorage.removeItem(WORK_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(value) { return labels[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date); }
function toDateTimeLocal(value) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000); return local.toISOString().slice(0, 16); }
function currentItems() { return data[view] || []; }
function selectedItem() { return displayItems().find((item) => item.id === selectedId) || displayItems()[0] || null; }
async function api(path, options = {}) { const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } }); const text = await response.text(); const result = text ? JSON.parse(text) : { ok: response.ok }; if (!response.ok || result.ok === false) { const error = new Error(result.error || "Action impossible."); error.status = response.status; throw error; } return result; }
function filtersParams(entity) { const formData = new FormData(filtersForm); const params = new URLSearchParams({ entity, limit: "260" }); const q = String(formData.get("q") || "").trim(); const status = String(formData.get("status") || "").trim(); if (q) params.set("q", q); if (status && status !== "all") params.set("status", status); return params; }
async function loadAll() { if (countEl) countEl.textContent = "Chargement du planning..."; const overview = await api("/api/admin-work?entity=dashboard"); const [tasks, events, projects, rules] = await Promise.all([api(`/api/admin-work?${filtersParams("tasks").toString()}`), api(`/api/admin-work?${filtersParams("events").toString()}`), api(`/api/admin-work?${filtersParams("projects").toString()}`), api("/api/admin-work?entity=rules&limit=200")]); dashboard = overview.dashboard || {}; data = { tasks: tasks.tasks || [], events: events.events || [], projects: projects.projects || [], rules: rules.rules || [] }; if (!currentItems().some((item) => item.id === selectedId)) selectedId = currentItems()[0]?.id || null; renderAll(); }
function renderAll() { renderKpis(); renderAssistant(); renderTabs(); renderWorkQueue(); renderDailyBriefing(); renderList(); renderDetail(); }
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }
function taskIsOpen(task) { return !["done", "cancelled", "archive"].includes(task.status); }
function taskIsOverdue(task) { return taskIsOpen(task) && task.due_at && new Date(task.due_at).getTime() < Date.now(); }
function taskIsToday(task) { return taskIsOpen(task) && task.due_at && new Date(task.due_at).getTime() <= endOfToday(); }
function taskIsLinkedToCase(task) { return task.related_object_type === "case" && Boolean(task.related_object_id); }
function scopedTasks() {
  const tasks = data.tasks || [];
  if (workScope === "today") return tasks.filter(taskIsToday);
  if (workScope === "overdue") return tasks.filter(taskIsOverdue);
  if (workScope === "p1") return tasks.filter((task) => task.priority === "P1" && taskIsOpen(task));
  if (workScope === "unassigned") return tasks.filter((task) => taskIsOpen(task) && !task.assigned_to);
  if (workScope === "cases") return tasks.filter((task) => taskIsOpen(task) && taskIsLinkedToCase(task));
  return tasks;
}
function renderWorkQueue() {
  const panel = document.querySelector("[data-work-queue]");
  if (!panel) return;
  const tasks = data.tasks || [];
  const today = tasks.filter(taskIsToday).length;
  const overdue = tasks.filter(taskIsOverdue).length;
  const p1 = tasks.filter((task) => task.priority === "P1" && taskIsOpen(task)).length;
  const unassigned = tasks.filter((task) => taskIsOpen(task) && !task.assigned_to).length;
  const caseTasks = tasks.filter((task) => taskIsOpen(task) && taskIsLinkedToCase(task)).length;
  const cards = [
    { key: "today", label: "Aujourd'hui", value: today, detail: "A traiter avant ce soir" },
    { key: "overdue", label: "Retards", value: overdue, detail: "Relance ou replanification" },
    { key: "p1", label: "P1", value: p1, detail: "Priorites fortes" },
    { key: "cases", label: "Dossiers", value: caseTasks, detail: "Actions rattachees" },
    { key: "unassigned", label: "Sans responsable", value: unassigned, detail: "A affecter" },
    { key: "all", label: "Toutes", value: tasks.filter(taskIsOpen).length, detail: "File active" },
  ];
  panel.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">File de travail</p><h3>Priorites du jour</h3><p>Cette vue sert a ouvrir TVF OS le matin : traiter les retards, affecter les responsables et preparer les prochaines actions.</p></div><a class="text-link" href="dashboard">Dashboard</a></div><div class="work-queue-grid">${cards.map((card) => `<button type="button" data-work-scope="${escapeHtml(card.key)}" class="${workScope === card.key ? "is-active" : ""}"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.detail)}</small></button>`).join("")}</div>`;
}

function dueTime(item) {
  const value = item?.due_at || item?.starts_at || item?.updated_at || item?.created_at;
  const date = value ? new Date(value).getTime() : 0;
  return Number.isNaN(date) ? 0 : date;
}

function taskPriorityScore(task) {
  let score = 0;
  if (taskIsOverdue(task)) score += 100;
  if (task.priority === "P1") score += 50;
  if (task.priority === "P2") score += 25;
  if (!task.assigned_to && taskIsOpen(task)) score += 18;
  if (taskIsLinkedToCase(task)) score += 12;
  if (taskIsToday(task)) score += 10;
  const due = dueTime(task);
  if (due) score += Math.max(0, 10 - Math.floor((due - Date.now()) / 86400000));
  return score;
}

function briefingRows(items, target, emptyText) {
  if (!items.length) return `<p class="form-note">${escapeHtml(emptyText)}</p>`;
  return items.map((item) => `<button type="button" class="work-briefing-row" data-work-briefing-target="${escapeHtml(target)}" data-work-briefing-id="${escapeHtml(item.id)}">
    <span><strong>${escapeHtml(titleFor(item))}</strong><small>${escapeHtml(subFor(item))}</small></span>
    <em>${escapeHtml(label(itemStatus(item)))}</em>
    <small>${escapeHtml(formatDate(itemDate(item)))}</small>
  </button>`).join("");
}

function renderDailyBriefing() {
  if (!briefingEl) return;
  const tasks = data.tasks || [];
  const events = data.events || [];
  const projects = data.projects || [];
  const immediate = tasks
    .filter(taskIsOpen)
    .sort((a, b) => taskPriorityScore(b) - taskPriorityScore(a) || dueTime(a) - dueTime(b))
    .slice(0, 5);
  const upcoming = [
    ...events.filter((event) => !["done", "cancelled", "archive"].includes(event.status)).sort((a, b) => dueTime(a) - dueTime(b)).slice(0, 3),
    ...tasks.filter(taskIsToday).sort((a, b) => dueTime(a) - dueTime(b)).slice(0, 2),
  ].slice(0, 5);
  const decisions = projects
    .filter((project) => !["completed", "cancelled", "archive"].includes(project.status))
    .sort((a, b) => {
      const bRisk = Number(b.progress || 0) < 35 ? 1 : 0;
      const aRisk = Number(a.progress || 0) < 35 ? 1 : 0;
      return bRisk - aRisk || dueTime(a) - dueTime(b);
    })
    .slice(0, 5);

  briefingEl.innerHTML = `<div class="admin-panel-head">
    <div>
      <p class="section-kicker">Brief operationnel</p>
      <h3>Ce qu'il faut ouvrir en premier</h3>
      <p>Un resume court pour relier les taches, rendez-vous et projets avant la mise a jour des fiches.</p>
    </div>
  </div>
  <div class="work-briefing-grid">
    <article><h4>Actions immediates</h4>${briefingRows(immediate, "tasks", "Aucune action urgente identifiee.")}</article>
    <article><h4>Agenda et echeances</h4>${briefingRows(upcoming, "events", "Aucun rendez-vous proche avec les filtres actuels.")}</article>
    <article><h4>Decisions a preparer</h4>${briefingRows(decisions, "projects", "Aucun projet a arbitrer pour le moment.")}</article>
  </div>`;
}
function displayItems() { return view === "tasks" ? scopedTasks() : currentItems(); }
function renderKpis() { if (!kpisEl) return; kpisEl.innerHTML = `<article><span>Projets actifs</span><strong>${dashboard?.active_projects || 0}</strong><small>en cours</small></article><article><span>Taches ouvertes</span><strong>${dashboard?.open_tasks || 0}</strong><small>a suivre</small></article><article data-tone="danger"><span>Retards</span><strong>${dashboard?.overdue_tasks || 0}</strong><small>a traiter</small></article><article><span>Aujourd'hui</span><strong>${dashboard?.today_events || 0}</strong><small>agenda</small></article><article><span>Regles</span><strong>${dashboard?.active_rules || 0}</strong><small>actives</small></article>`; if (countEl) countEl.textContent = `${dashboard?.open_tasks || 0} tache(s), ${dashboard?.overdue_tasks || 0} retard(s), ${dashboard?.today_events || 0} evenement(s) aujourd'hui.`; }
function renderAssistant() { const item = selectedItem(); const assistant = item?.assistant || dashboard?.assistant || {}; if (aiScoreEl) aiScoreEl.textContent = item?.assistant?.urgency_score ? `${item.assistant.urgency_score}%` : `${dashboard?.overdue_tasks || 0}`; if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || dashboard?.assistant?.summary || "Analyse en attente."; if (!aiGridEl) return; const actions = assistant.next_actions || dashboard?.assistant?.priorities || []; aiGridEl.innerHTML = actions.length ? actions.slice(0, 4).map((action) => `<div><span>Action</span><strong>${escapeHtml(action)}</strong></div>`).join("") : `<div><span>Action</span><strong>Planning sous controle</strong></div>`; }
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.workView === view)); }
function titleFor(item) { return item.title || item.rule_key || "Element"; }
function subFor(item) { return item.assigned_to || item.owner_name || item.organizer_name || item.pole || item.trigger_type || "TVF OS"; }
function itemStatus(item) { return item.status || item.priority || ""; }
function itemDate(item) { return item.due_at || item.starts_at || item.updated_at || item.created_at; }
function itemCard(item) { const risk = item.assistant?.overdue || item.priority === "P1" ? " is-risk" : ""; const relationBadge = view === "tasks" && taskIsLinkedToCase(item) ? `<em data-kind="case">Dossier lie</em>` : ""; return `<button class="admin-request work-card${item.id === selectedId ? " is-active" : ""}${risk}" type="button" data-work-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(titleFor(item))}</strong><small>${escapeHtml(label(itemStatus(item)))}</small></span><span>${escapeHtml(subFor(item))}</span><span class="admin-request-sub">${escapeHtml(item.description || item.summary || item.notes || item.ai_summary || "")}</span><span class="admin-badges"><em>${escapeHtml(viewLabels[view])}</em>${relationBadge}<em>${escapeHtml(formatDate(itemDate(item)))}</em></span></button>`; }
function workScopeLabel() { return { today: "aujourd hui", overdue: "en retard", p1: "P1", unassigned: "sans responsable", cases: "liees aux dossiers", all: "" }[workScope] || workScope; }
function renderList() { const items = displayItems(); if (listTitleEl) listTitleEl.textContent = view === "tasks" && workScope !== "all" ? `${viewLabels[view]} - ${workScopeLabel()}` : viewLabels[view]; if (listCountEl) listCountEl.textContent = String(items.length); if (emptyEl) emptyEl.hidden = items.length > 0; if (listEl) listEl.innerHTML = items.map(itemCard).join(""); }
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
function taskControlPanel(item = {}) {
  const overdue = view === "tasks" && taskIsOverdue(item);
  const today = view === "tasks" && taskIsToday(item);
  const linkedCase = view === "tasks" && taskIsLinkedToCase(item);
  const cards = [
    ["Statut", label(item.status), overdue ? "Retard detecte" : "Suivi operationnel", overdue ? "danger" : "neutral"],
    ["Priorite", label(item.priority), item.priority === "P1" ? "A traiter rapidement" : "Priorite courante", item.priority === "P1" ? "warning" : "neutral"],
    ["Responsable", item.assigned_to || "A affecter", item.pole || "Pole non renseigne", item.assigned_to ? "success" : "warning"],
    ["Echeance", formatDate(item.due_at), today ? "Dans la file du jour" : "A surveiller", overdue ? "danger" : "neutral"],
    ["Rattachement", linkedCase ? "Dossier" : "Libre", linkedCase ? "Issue du module Dossiers" : "Sans dossier lie", linkedCase ? "success" : "neutral"],
  ];
  const relation = linkedCase ? `<div class="work-related-case"><span>Dossier rattache</span><strong>${escapeHtml(item.related_object_id)}</strong><a class="text-link" href="admin-dossiers">Ouvrir les dossiers</a></div>` : "";
  return `<section class="work-task-control" aria-label="Pilotage de la tache"><div class="admin-panel-head"><div><p class="section-kicker">Execution</p><h3>Suivi de la tache</h3></div><a class="text-link" href="admin-dossiers">Dossiers</a></div><div class="work-task-control-grid">${cards.map((card) => `<article data-tone="${escapeHtml(card[3])}"><span>${escapeHtml(card[0])}</span><strong>${escapeHtml(card[1])}</strong><small>${escapeHtml(card[2])}</small></article>`).join("")}</div>${relation}<div class="admin-detail-actions work-task-actions"><button class="btn secondary" type="button" data-task-quick="doing">Demarrer</button><button class="btn secondary" type="button" data-task-quick="waiting">Mettre en attente</button><button class="btn secondary" type="button" data-task-replan="48h">Replanifier 48h</button><button class="btn primary" type="button" data-task-quick="done">Terminer</button></div></section>`;
}
function renderDetail() {
  const item = selectedItem();
  if (!detailEl) return;
  if (!item) { detailEl.innerHTML = `<p class="form-note">Aucun element selectionne.</p>`; return; }
  const type = view === "projects" ? "project" : view === "events" ? "event" : "task";
  const editable = view !== "rules";
  const projectPanels = view === "projects" ? `${projectPortfolioPanel(item)}${projectControlPanel(item)}` : view === "tasks" ? taskControlPanel(item) : "";
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
async function updateTaskQuick(status) {
  const item = selectedItem();
  if (!item || view !== "tasks") return;
  await api("/api/admin-work", { method: "PATCH", body: JSON.stringify({ type: "task", id: item.id, status }) });
  await loadAll();
  notify("Tache mise a jour.", "success");
}
async function replanTask() {
  const item = selectedItem();
  if (!item || view !== "tasks") return;
  const due = new Date();
  due.setDate(due.getDate() + 2);
  due.setHours(17, 0, 0, 0);
  await api("/api/admin-work", { method: "PATCH", body: JSON.stringify({ type: "task", id: item.id, status: item.status === "done" ? "done" : "todo", due_at: due.toISOString() }) });
  await loadAll();
  notify("Tache replanifiee.", "success");
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
  notify("Action projet appliquee.", "success");
}
async function createItem(event) { event.preventDefault(); await api("/api/admin-work", { method: "POST", body: JSON.stringify(payloadFromForm(modalForm)) }); closeModal(); await loadAll(); notify("Element de travail cree.", "success"); }
async function saveDetail(form) { const payload = payloadFromForm(form); await api("/api/admin-work", { method: "PATCH", body: JSON.stringify(payload) }); await loadAll(); notify("Element de travail enregistre.", "success"); }
function exportCsv() { const rows = [["Vue", "Titre", "Statut", "Responsable", "Date"], ...currentItems().map((item) => [viewLabels[view], titleFor(item), label(itemStatus(item)), subFor(item), formatDate(itemDate(item))])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")).join("\\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `planning-tvf-os-${view}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); notify("Export planning prepare.", "success"); }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadAll(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadAll().catch((e) => notifyError(e)), 260); }); filtersForm?.addEventListener("change", () => loadAll().catch((e) => notifyError(e))); tabs.forEach((button) => button.addEventListener("click", () => { view = button.dataset.workView || "tasks"; if (view !== "tasks") workScope = "all"; selectedId = displayItems()[0]?.id || null; renderAll(); })); refreshButton?.addEventListener("click", () => loadAll().catch((e) => notifyError(e))); createButton?.addEventListener("click", openModal); exportButton?.addEventListener("click", exportCsv); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; }); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalForm?.addEventListener("submit", createItem); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-work-id]"); if (!button) return; selectedId = button.dataset.workId; renderAll(); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-work-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form).catch((e) => notifyError(e)); }); document.addEventListener("click", (event) => { const scope = event.target.closest("[data-work-scope]"); if (scope) { workScope = scope.dataset.workScope || "all"; view = "tasks"; selectedId = displayItems()[0]?.id || null; renderAll(); return; } const briefing = event.target.closest("[data-work-briefing-id]"); if (briefing) { view = briefing.dataset.workBriefingTarget || "tasks"; if (view !== "tasks") workScope = "all"; selectedId = briefing.dataset.workBriefingId; renderAll(); } }); detailEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-project-action]"); if (button) applyProjectAction(button.dataset.projectAction).catch((e) => notifyError(e)); const taskQuick = event.target.closest("[data-task-quick]"); if (taskQuick) updateTaskQuick(taskQuick.dataset.taskQuick).catch((e) => notifyError(e)); const replan = event.target.closest("[data-task-replan]"); if (replan) replanTask(replan.dataset.taskReplan).catch((e) => notifyError(e)); }); }
bindEvents();
if (token()) { showApp(); loadAll().catch((error) => { setToken(""); showLogin(); setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error"); }); } else { showLogin(); }
