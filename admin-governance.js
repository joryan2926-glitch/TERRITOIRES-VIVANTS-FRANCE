const GOVERNANCE_TOKEN_KEY = "tvfAdminToken";
const statusLabels = { draft: "Brouillon", to_validate: "A valider", validated: "Validee", rejected: "Refusee", executing: "Execution", done: "Terminee", archive: "Archive", scheduled: "Planifie", in_progress: "En cours", closed: "Clos", cancelled: "Annule", active: "Active", paused: "En pause", expired: "Expiree", revoked: "Revoquee", todo: "A faire", blocked: "Bloque" };
const typeLabels = { decisions: "Decisions", committees: "Comites", actions: "Actions", delegations: "Delegations" };
const entityByView = { decisions: "decisions", committees: "committees", actions: "actions", delegations: "delegations" };

const loginSection = document.querySelector("[data-governance-login]");
const appSection = document.querySelector("[data-governance-app]");
const tokenForm = document.querySelector("[data-governance-token-form]");
const loginStatus = document.querySelector("[data-governance-login-status]");
const filtersForm = document.querySelector("[data-governance-filters]");
const kpisEl = document.querySelector("[data-governance-kpis]");
const controlEl = document.querySelector("[data-governance-control]");
const listEl = document.querySelector("[data-governance-list]");
const detailEl = document.querySelector("[data-governance-detail]");
const countEl = document.querySelector("[data-governance-count]");
const listCountEl = document.querySelector("[data-governance-list-count]");
const listTitleEl = document.querySelector("[data-governance-list-title]");
const emptyEl = document.querySelector("[data-governance-empty]");
const aiScoreEl = document.querySelector("[data-governance-ai-score]");
const aiSummaryEl = document.querySelector("[data-governance-ai-summary]");
const aiGridEl = document.querySelector("[data-governance-ai-grid]");
const tabs = document.querySelectorAll("[data-governance-view]");
const createButton = document.querySelector("[data-governance-create]");
const minutesButton = document.querySelector("[data-governance-minutes]");
const refreshButton = document.querySelector("[data-governance-refresh]");
const exportButton = document.querySelector("[data-governance-export]");
const logoutButton = document.querySelector("[data-governance-logout]");
const modal = document.querySelector("[data-governance-modal]");
const modalForm = document.querySelector("[data-governance-form]");
const committeeInput = document.querySelector("[data-governance-committee-id]");
const decisionInput = document.querySelector("[data-governance-decision-id]");
const closeModalButtons = document.querySelectorAll("[data-governance-close-modal]");

let view = "decisions";
let dashboard = null;
let data = { decisions: [], committees: [], actions: [], delegations: [] };
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(GOVERNANCE_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(GOVERNANCE_TOKEN_KEY, value); else sessionStorage.removeItem(GOVERNANCE_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(value) { return statusLabels[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date); }
function currentItems() { return data[view] || []; }
function selectedItem() { return currentItems().find((item) => item.id === selectedId) || currentItems()[0] || null; }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) { const error = new Error(result.error || "Action impossible."); error.status = response.status; throw error; }
  return result;
}
function filtersParams(entity) { const formData = new FormData(filtersForm); const params = new URLSearchParams({ entity, limit: "240" }); const q = String(formData.get("q") || "").trim(); const status = String(formData.get("status") || "").trim(); if (q) params.set("q", q); if (status && status !== "all") params.set("status", status); return params; }
async function loadAll() {
  if (countEl) countEl.textContent = "Chargement de la gouvernance...";
  const overview = await api("/api/admin-governance?entity=dashboard");
  const [decisions, committees, actions, delegations] = await Promise.all([
    api(`/api/admin-governance?${filtersParams("decisions").toString()}`),
    api(`/api/admin-governance?${filtersParams("committees").toString()}`),
    api(`/api/admin-governance?${filtersParams("actions").toString()}`),
    api(`/api/admin-governance?${filtersParams("delegations").toString()}`),
  ]);
  dashboard = overview.dashboard || {};
  data = { decisions: decisions.decisions || [], committees: committees.committees || [], actions: actions.actions || [], delegations: delegations.delegations || [] };
  if (!currentItems().some((item) => item.id === selectedId)) selectedId = currentItems()[0]?.id || null;
  renderAll();
}
function renderAll() { renderKpis(); renderControlPanel(); renderAssistant(); renderTabs(); renderList(); renderDetail(); }
function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `<article><span>Decisions</span><strong>${dashboard.total_decisions || 0}</strong><small>${dashboard.validated || 0} validees</small></article><article data-tone="warning"><span>A valider</span><strong>${dashboard.to_validate || 0}</strong><small>decision humaine</small></article><article><span>Comites ouverts</span><strong>${dashboard.committees_open || 0}</strong><small>agenda/PV</small></article><article data-tone="danger"><span>Actions retard</span><strong>${dashboard.overdue_actions || 0}</strong><small>${dashboard.open_actions || 0} ouvertes</small></article><article data-tone="info"><span>Delegations</span><strong>${dashboard.active_delegations || 0}</strong><small>actives</small></article>`;
  if (countEl) countEl.textContent = `${dashboard.total_decisions || 0} decision(s), ${dashboard.open_actions || 0} action(s) ouverte(s), ${dashboard.minutes_to_validate || 0} PV a valider.`;
}
function renderControlPanel() {
  if (!controlEl || !dashboard) return;
  const toValidate = Number(dashboard.to_validate || 0);
  const overdue = Number(dashboard.overdue_actions || 0);
  const minutes = Number(dashboard.minutes_to_validate || 0);
  const openActions = Number(dashboard.open_actions || 0);
  const delegations = Number(dashboard.active_delegations || 0);
  const nextDecision = toValidate ? "Valider les decisions" : minutes ? "Valider les PV" : overdue ? "Relancer les actions" : "Maintenir le registre";
  const status = overdue ? "Arbitrage urgent" : toValidate || minutes ? "Validation requise" : "Gouvernance tenue";
  controlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Decision humaine</p><h3>Suivre les validations engageantes</h3><p>Cette synthese relie decisions, comites, PV, delegations et actions pour eviter toute decision non tracee.</p></div><strong>${escapeHtml(status)}</strong></div><div class="governance-control-grid"><article><span>Decision suivante</span><strong>${escapeHtml(nextDecision)}</strong><small>priorite</small></article><article><span>A valider</span><strong>${escapeHtml(toValidate)}</strong><small>decisions</small></article><article><span>PV</span><strong>${escapeHtml(minutes)}</strong><small>a valider</small></article><article><span>Actions retard</span><strong>${escapeHtml(overdue)}</strong><small>${escapeHtml(openActions)} ouvertes</small></article><article><span>Delegations</span><strong>${escapeHtml(delegations)}</strong><small>actives</small></article></div><div class="governance-control-links"><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-risks">Risques</a><a class="btn secondary" href="admin-documents">PV / pieces</a><a class="btn secondary" href="admin-work">Actions</a><a class="btn secondary" href="admin-finances">Finances</a></div>`;
}function renderAssistant() {
  const item = selectedItem(); const assistant = item?.assistant || dashboard?.assistant || {};
  if (aiScoreEl) aiScoreEl.textContent = item?.assistant?.validation_score !== undefined ? `${item.assistant.validation_score}%` : `${dashboard?.to_validate || 0}`;
  if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || dashboard?.assistant?.summary || "Aucune analyse disponible.";
  if (!aiGridEl) return; const priorities = assistant.next_actions || dashboard?.assistant?.priorities || [];
  aiGridEl.innerHTML = priorities.length ? priorities.slice(0, 4).map((action) => `<div><span>Priorite</span><strong>${escapeHtml(action)}</strong></div>`).join("") : `<div><span>Priorite</span><strong>Registre a jour</strong></div>`;
}
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.governanceView === view)); }
function titleFor(item) { return item.title || item.action_title || item.delegated_to || "Element"; }
function subFor(item) { return item.decision_number || item.committee_key || item.owner_name || item.scope || item.committee_type || ""; }
function itemCard(item) { const score = item.assistant?.validation_score ?? item.priority_level ?? item.minutes_status ?? ""; return `<button class="admin-request governance-card${item.id === selectedId ? " is-active" : ""}" type="button" data-governance-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(titleFor(item))}</strong><small>${escapeHtml(label(item.status))}</small></span><span>${escapeHtml(subFor(item))}</span><span class="admin-request-sub">${escapeHtml(item.summary || item.agenda_summary || item.notes || item.limits || "")}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(score)}</em><em data-kind="category">${escapeHtml(formatDate(item.updated_at || item.scheduled_at || item.due_at || item.created_at))}</em></span></button>`; }
function renderList() { if (listTitleEl) listTitleEl.textContent = typeLabels[view]; if (listCountEl) listCountEl.textContent = String(currentItems().length); if (emptyEl) emptyEl.hidden = currentItems().length > 0; if (listEl) listEl.innerHTML = currentItems().map(itemCard).join(""); }
function statusOptions(kind, current) { const maps = { decisions: ["draft", "to_validate", "validated", "rejected", "executing", "done", "archive"], committees: ["scheduled", "in_progress", "closed", "cancelled", "archive"], actions: ["todo", "in_progress", "blocked", "done", "cancelled", "archive"], delegations: ["draft", "active", "paused", "expired", "revoked", "archive"] }; return (maps[kind] || []).map((value) => `<option value="${value}" ${value === current ? "selected" : ""}>${escapeHtml(label(value))}</option>`).join(""); }
function renderDetail() {
  const item = selectedItem(); if (!detailEl) return; if (!item) { detailEl.innerHTML = `<p class="form-note">Aucun element selectionne.</p>`; return; }
  const assistant = item.assistant || {};
  detailEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">${escapeHtml(typeLabels[view])}</p><h2>${escapeHtml(titleFor(item))}</h2><p>${escapeHtml(subFor(item))}</p></div><span>${escapeHtml(item.status || "")}</span></div><section class="governance-readiness"><article><span>Validation</span><strong>${escapeHtml(assistant.validation_score ?? "--")}${assistant.validation_score !== undefined ? "%" : ""}</strong></article><article><span>Votes favorables</span><strong>${escapeHtml(assistant.approvals ?? "--")}</strong></article><article><span>Actions ouvertes</span><strong>${escapeHtml(assistant.open_actions ?? (item.status && !["done", "archive"].includes(item.status) ? 1 : 0))}</strong></article><article><span>Echeance</span><strong>${escapeHtml(formatDate(item.due_at || item.scheduled_at || item.ends_at))}</strong></article></section><form class="governance-detail-form" data-governance-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${view === "decisions" ? "decision" : view === "committees" ? "committee" : view === "actions" ? "action" : "delegation"}"><label>Titre<input name="title" value="${escapeHtml(titleFor(item))}"></label><label>Statut<select name="status">${statusOptions(view, item.status)}</select></label><label>Responsable<input name="owner_name" value="${escapeHtml(item.owner_name || item.delegated_to || item.facilitator_name || item.decided_by || "")}"></label><label>Priorite<input name="priority_level" value="${escapeHtml(item.priority_level || "")}"></label><label class="governance-wide-field">Resume<textarea name="summary" rows="5">${escapeHtml(item.summary || item.agenda_summary || item.notes || item.scope || "")}</textarea></label><button class="btn primary" type="submit">Enregistrer</button></form>`;
}
function openModal() { const item = selectedItem(); if (committeeInput) committeeInput.value = item?.committee_id || (view === "committees" ? item?.id || "" : ""); if (decisionInput) decisionInput.value = item?.decision_id || (view === "decisions" ? item?.id || "" : ""); if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; modalForm?.reset(); }
function payloadFromForm(form) { const data = new FormData(form); const payload = {}; data.forEach((value, key) => { const text = String(value || "").trim(); if (text) payload[key] = text; }); if (payload.type === "action") { payload.action_title = payload.title || "Action issue"; payload.notes = payload.summary || ""; } if (payload.type === "delegation") { payload.delegated_to = payload.owner_name || payload.title || "Delegataire"; payload.scope = payload.summary || payload.title || "Delegation"; } if (payload.type === "committee") { payload.agenda_summary = payload.summary || ""; } return payload; }
async function createItem(event) { event.preventDefault(); await api("/api/admin-governance", { method: "POST", body: JSON.stringify(payloadFromForm(modalForm)) }); closeModal(); await loadAll(); }
async function saveDetail(form) { const payload = Object.fromEntries(new FormData(form)); if (payload.type === "action") payload.action_title = payload.title; if (payload.type === "delegation") { payload.delegated_to = payload.owner_name || payload.title; payload.scope = payload.summary; } if (payload.type === "committee") payload.agenda_summary = payload.summary; await api("/api/admin-governance", { method: "PATCH", body: JSON.stringify(payload) }); await loadAll(); }
async function generateMinutes() { const item = selectedItem(); const committeeId = view === "committees" ? item?.id : item?.committee_id; if (!committeeId) return alert("Selectionnez un comite ou un element lie a un comite."); const result = await api("/api/admin-governance", { method: "POST", body: JSON.stringify({ type: "generate_minutes", committee_id: committeeId }) }); const minutes = result.minutes_pack.minutes; alert(`${minutes.title}\n\n${minutes.summary}\n\nDecisions : ${minutes.decisions.join("; ") || "aucune"}`); }
function exportCsv() { const rows = [["Vue", "Titre", "Statut", "Reference"], ...currentItems().map((item) => [typeLabels[view], titleFor(item), label(item.status), subFor(item)])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `gouvernance-tvf-os-${view}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadAll(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadAll().catch((e) => alert(e.message)), 260); }); filtersForm?.addEventListener("change", () => loadAll().catch((e) => alert(e.message))); tabs.forEach((button) => button.addEventListener("click", () => { view = button.dataset.governanceView || "decisions"; selectedId = currentItems()[0]?.id || null; renderAll(); })); refreshButton?.addEventListener("click", () => loadAll().catch((e) => alert(e.message))); createButton?.addEventListener("click", openModal); minutesButton?.addEventListener("click", () => generateMinutes().catch((e) => alert(e.message))); exportButton?.addEventListener("click", exportCsv); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin"; }); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalForm?.addEventListener("submit", createItem); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-governance-id]"); if (!button) return; selectedId = button.dataset.governanceId; renderAll(); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-governance-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form).catch((e) => alert(e.message)); }); }

bindEvents();
if (token()) { showApp(); loadAll().catch((error) => { setToken(""); showLogin(); setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error"); }); } else { showLogin(); }
