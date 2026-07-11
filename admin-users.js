const USERS_TOKEN_KEY = "tvfAdminToken";
const statusLabels = {
  invited: "Invite",
  active: "Actif",
  paused: "En pause",
  suspended: "Suspendu",
  left: "Sorti",
  archive: "Archive",
  pending: "En attente",
  accepted: "Accepte",
  expired: "Expire",
  cancelled: "Annule",
  valid: "Valide",
  changes_required: "Actions requises",
  revoked: "Revoque",
  global: "Global",
  national: "National",
  pole: "Pole",
  module: "Module",
  temporary: "Temporaire"
};
const viewLabels = { profiles: "Profils", roles: "Roles", permissions: "Permissions", invitations: "Invitations", reviews: "Revues d'acces" };
const entityByView = { profiles: "profiles", roles: "roles", permissions: "permissions", invitations: "invitations", reviews: "reviews" };

const loginSection = document.querySelector("[data-users-login]");
const appSection = document.querySelector("[data-users-app]");
const tokenForm = document.querySelector("[data-users-token-form]");
const loginStatus = document.querySelector("[data-users-login-status]");
const filtersForm = document.querySelector("[data-users-filters]");
const kpisEl = document.querySelector("[data-users-kpis]");
const controlEl = document.querySelector("[data-users-control]");
const listEl = document.querySelector("[data-users-list]");
const detailEl = document.querySelector("[data-users-detail]");
const countEl = document.querySelector("[data-users-count]");
const listCountEl = document.querySelector("[data-users-list-count]");
const listTitleEl = document.querySelector("[data-users-list-title]");
const emptyEl = document.querySelector("[data-users-empty]");
const aiScoreEl = document.querySelector("[data-users-ai-score]");
const aiSummaryEl = document.querySelector("[data-users-ai-summary]");
const aiGridEl = document.querySelector("[data-users-ai-grid]");
const tabs = document.querySelectorAll("[data-users-view]");
const createButton = document.querySelector("[data-users-create]");
const refreshButton = document.querySelector("[data-users-refresh]");
const exportButton = document.querySelector("[data-users-export]");
const logoutButton = document.querySelector("[data-users-logout]");
const modal = document.querySelector("[data-users-modal]");
const modalForm = document.querySelector("[data-users-form]");
const closeModalButtons = document.querySelectorAll("[data-users-close-modal]");
let view = "profiles";
let dashboard = null;
let data = { profiles: [], roles: [], permissions: [], invitations: [], reviews: [] };
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(USERS_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(USERS_TOKEN_KEY, value); else sessionStorage.removeItem(USERS_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(value) { return statusLabels[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date); }
function currentItems() { return data[view] || []; }
function selectedItem() { return currentItems().find((item) => item.id === selectedId) || currentItems()[0] || null; }
async function api(path, options = {}) { const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } }); const text = await response.text(); const result = text ? JSON.parse(text) : { ok: response.ok }; if (!response.ok || result.ok === false) { const error = new Error(result.error || "Action impossible."); error.status = response.status; throw error; } return result; }
function filtersParams(entity) { const formData = new FormData(filtersForm); const params = new URLSearchParams({ entity, limit: "280" }); const q = String(formData.get("q") || "").trim(); const status = String(formData.get("status") || "").trim(); if (q && entity !== "permissions") params.set("q", q); if (status && status !== "all" && entity !== "permissions") params.set("status", status); return params; }
async function loadAll() {
  if (countEl) countEl.textContent = "Chargement des acces...";
  const overview = await api("/api/admin-users?entity=dashboard");
  const [profiles, roles, permissions, invitations, reviews] = await Promise.all([
    api(`/api/admin-users?${filtersParams("profiles").toString()}`),
    api(`/api/admin-users?${filtersParams("roles").toString()}`),
    api("/api/admin-users?entity=permissions"),
    api(`/api/admin-users?${filtersParams("invitations").toString()}`),
    api(`/api/admin-users?${filtersParams("reviews").toString()}`)
  ]);
  dashboard = overview.dashboard || {};
  data = { profiles: profiles.profiles || [], roles: roles.roles || [], permissions: permissions.permissions || [], invitations: invitations.invitations || [], reviews: reviews.reviews || [] };
  if (!currentItems().some((item) => item.id === selectedId)) selectedId = currentItems()[0]?.id || null;
  renderAll();
}
function renderAll() { renderKpis(); renderControlPanel(); renderAssistant(); renderTabs(); renderList(); renderDetail(); }
function renderKpis() { if (!kpisEl) return; kpisEl.innerHTML = `<article><span>Score acces</span><strong>${dashboard?.access_score || 0}%</strong><small>controle IA</small></article><article><span>Profils actifs</span><strong>${dashboard?.active_profiles || 0}</strong><small>${dashboard?.total_profiles || 0} au total</small></article><article data-tone="warning"><span>Invitations</span><strong>${dashboard?.pending_invitations || 0}</strong><small>en attente</small></article><article><span>Roles</span><strong>${dashboard?.roles_total || 0}</strong><small>${dashboard?.permissions_total || 0} permissions</small></article><article data-tone="danger"><span>Revues</span><strong>${dashboard?.pending_reviews || 0}</strong><small>${dashboard?.sensitive_assignments || 0} roles sensibles</small></article>`; if (countEl) countEl.textContent = `${dashboard?.total_profiles || 0} profil(s), ${dashboard?.pending_invitations || 0} invitation(s), ${dashboard?.pending_reviews || 0} revue(s) en attente.`; }
function renderControlPanel() {
  if (!controlEl || !dashboard) return;
  const score = Number(dashboard.access_score || 0);
  const profiles = Number(dashboard.active_profiles || 0);
  const invitations = Number(dashboard.pending_invitations || 0);
  const reviews = Number(dashboard.pending_reviews || 0);
  const sensitive = Number(dashboard.sensitive_assignments || 0);
  const nextDecision = reviews ? "Faire la revue d'acces" : invitations ? "Traiter les invitations" : sensitive ? "Verifier les roles sensibles" : "Maintenir les acces";
  const status = reviews || sensitive ? "Controle requis" : score >= 80 ? "Acces maitrises" : "Acces a renforcer";
  controlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Securite des acces</p><h3>Attribuer les bons droits au bon moment</h3><p>Cette synthese evite les acces inutiles, les invitations dormantes et les roles sensibles non revus.</p></div><strong>${escapeHtml(status)}</strong></div><div class="users-control-grid"><article><span>Decision suivante</span><strong>${escapeHtml(nextDecision)}</strong><small>priorite</small></article><article><span>Score</span><strong>${escapeHtml(score)}%</strong><small>controle</small></article><article><span>Profils actifs</span><strong>${escapeHtml(profiles)}</strong><small>utilisateurs</small></article><article><span>Invitations</span><strong>${escapeHtml(invitations)}</strong><small>en attente</small></article><article><span>Roles sensibles</span><strong>${escapeHtml(sensitive)}</strong><small>a revoir</small></article></div><div class="users-control-links"><a class="btn secondary" href="admin-settings">Parametres</a><a class="btn secondary" href="admin-work">Taches</a></div>`;
}function renderAssistant() { const item = selectedItem(); const assistant = item?.assistant || dashboard?.assistant || {}; if (aiScoreEl) aiScoreEl.textContent = item?.assistant?.access_score !== undefined ? `${item.assistant.access_score}%` : `${dashboard?.access_score || 0}%`; if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || dashboard?.assistant?.summary || "Analyse en attente."; if (!aiGridEl) return; const actions = assistant.next_actions || dashboard?.assistant?.priorities || []; aiGridEl.innerHTML = actions.length ? actions.slice(0, 4).map((action) => `<div><span>Action</span><strong>${escapeHtml(action)}</strong></div>`).join("") : `<div><span>Action</span><strong>Acces sous controle</strong></div>`; }
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.usersView === view)); }
function titleFor(item) { if (view === "profiles") return [item.first_name, item.last_name].filter(Boolean).join(" ") || item.email || "Profil"; if (view === "roles") return item.role_name || item.role_key || "Role"; if (view === "permissions") return item.permission_name || item.permission_key || "Permission"; if (view === "invitations") return item.email || "Invitation"; return item.reviewer_name || item.profile_id || "Revue d'acces"; }
function subFor(item) { if (view === "profiles") return item.email || item.notes || ""; if (view === "roles") return item.role_key || item.role_family || ""; if (view === "permissions") return `${item.module_key || "module"} / ${item.permission_key || "permission"}`; if (view === "invitations") return item.invited_role_key || item.message || ""; return item.risk_level || item.findings || ""; }
function itemStatus(item) { return item.status || item.review_status || item.risk_level || ""; }
function itemCard(item) { const tone = item.assistant?.should_review || item.is_sensitive || item.risk_level === "critical" ? " is-risk" : ""; return `<button class="admin-request users-card${item.id === selectedId ? " is-active" : ""}${tone}" type="button" data-users-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(titleFor(item))}</strong><small>${escapeHtml(label(itemStatus(item)))}</small></span><span>${escapeHtml(subFor(item))}</span><span class="admin-request-sub">${escapeHtml(item.notes || item.description || item.message || item.findings || "")}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(viewLabels[view])}</em><em data-kind="category">${escapeHtml(formatDate(item.updated_at || item.created_at || item.expires_at || item.due_at))}</em></span></button>`; }
function filteredItems() { const formData = new FormData(filtersForm); const q = String(formData.get("q") || "").trim().toLowerCase(); if (!q || view !== "permissions") return currentItems(); return currentItems().filter((item) => JSON.stringify(item).toLowerCase().includes(q)); }
function renderList() { const items = filteredItems(); if (listTitleEl) listTitleEl.textContent = viewLabels[view]; if (listCountEl) listCountEl.textContent = String(items.length); if (emptyEl) emptyEl.hidden = items.length > 0; if (listEl) listEl.innerHTML = items.map(itemCard).join(""); }
function statusOptions(current) { const values = view === "profiles" ? ["invited", "active", "paused", "suspended", "left", "archive"] : view === "roles" ? ["active", "paused", "archive"] : view === "invitations" ? ["pending", "accepted", "expired", "cancelled", "archive"] : ["pending", "valid", "changes_required", "revoked", "archive"]; return values.map((value) => `<option value="${value}" ${value === current ? "selected" : ""}>${escapeHtml(label(value))}</option>`).join(""); }
function rolesList(profile) { const rows = profile.roles || []; if (!rows.length) return `<p class="form-note">Aucun role attribue.</p>`; return `<div class="users-row-list">${rows.map((row) => `<article><div><strong>${escapeHtml(row.role?.role_name || row.role_id || "Role")}</strong><span>${escapeHtml(label(row.scope))} - ${escapeHtml(label(row.status))}</span></div><small>${escapeHtml(formatDate(row.valid_until || row.created_at))}</small></article>`).join("")}</div>`; }
function membershipsList(profile) { const rows = profile.memberships || []; if (!rows.length) return `<p class="form-note">Aucun rattachement supplementaire.</p>`; return `<div class="users-row-list">${rows.map((row) => `<article><div><strong>${escapeHtml(row.primary_role_label || row.branch_id || "Fiche")}</strong><span>${escapeHtml(label(row.membership_status))}</span></div><small>${escapeHtml(formatDate(row.joined_at || row.updated_at))}</small></article>`).join("")}</div>`; }
function renderDetail() {
  const item = selectedItem();
  if (!detailEl) return;
  if (!item) { detailEl.innerHTML = `<p class="form-note">Aucun element selectionne.</p>`; return; }
  const type = view === "profiles" ? "profile" : view === "roles" ? "role" : view === "invitations" ? "invitation" : view === "reviews" ? "review" : "permission";
  const editable = view !== "permissions";
  const assistant = item.assistant || {};
  const profileBlocks = view === "profiles" ? `<section class="users-readiness"><article><span>Score</span><strong>${escapeHtml(assistant.access_score ?? "--")}%</strong></article><article><span>Roles actifs</span><strong>${escapeHtml(assistant.active_roles ?? 0)}</strong></article><article><span>Revues</span><strong>${escapeHtml(assistant.pending_reviews ?? 0)}</strong></article></section><h3>Roles attribues</h3>${rolesList(item)}${membershipsList(item)}` : "";
  const form = editable ? `<form class="users-detail-form" data-users-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${escapeHtml(type)}">${view === "profiles" ? `<label>Prenom<input name="first_name" value="${escapeHtml(item.first_name || "")}"></label><label>Nom<input name="last_name" value="${escapeHtml(item.last_name || "")}"></label><label>Email<input name="email" type="email" value="${escapeHtml(item.email || "")}"></label><label>Statut<select name="status">${statusOptions(item.status)}</select></label><label class="users-wide-field">Notes<textarea name="summary" rows="4">${escapeHtml(item.notes || "")}</textarea></label>` : view === "roles" ? `<label>Cle role<input name="role_key" value="${escapeHtml(item.role_key || "")}"></label><label>Nom role<input name="role_name" value="${escapeHtml(item.role_name || "")}"></label><label>Famille<input name="role_family" value="${escapeHtml(item.role_family || "")}"></label><label>Statut<select name="status">${statusOptions(item.status)}</select></label><label>Sensible<select name="is_sensitive"><option value="false" ${!item.is_sensitive ? "selected" : ""}>Non</option><option value="true" ${item.is_sensitive ? "selected" : ""}>Oui</option></select></label><label class="users-wide-field">Description<textarea name="summary" rows="4">${escapeHtml(item.description || "")}</textarea></label>` : view === "invitations" ? `<label>Email<input name="email" type="email" value="${escapeHtml(item.email || "")}"></label><label>Role propose<input name="invited_role_key" value="${escapeHtml(item.invited_role_key || "")}"></label><label>Inviteur<input name="invited_by" value="${escapeHtml(item.invited_by || "")}"></label><label>Statut<select name="status">${statusOptions(item.status)}</select></label><label>Expiration<input name="expires_at" type="datetime-local" value=""></label><label class="users-wide-field">Message<textarea name="summary" rows="4">${escapeHtml(item.message || "")}</textarea></label>` : `<label>Profil ID<input name="profile_id" value="${escapeHtml(item.profile_id || "")}"></label><label>Relecteur<input name="reviewer_name" value="${escapeHtml(item.reviewer_name || "")}"></label><label>Risque<input name="risk_level" value="${escapeHtml(item.risk_level || "medium")}"></label><label>Statut<select name="status">${statusOptions(item.review_status)}</select></label><label>Echeance<input name="due_at" type="datetime-local" value=""></label><label class="users-wide-field">Constats<textarea name="summary" rows="4">${escapeHtml(item.findings || "")}</textarea></label>`}<button class="btn primary" type="submit">Enregistrer</button></form>` : `<pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre>`;
  detailEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">${escapeHtml(viewLabels[view])}</p><h2>${escapeHtml(titleFor(item))}</h2><p>${escapeHtml(subFor(item))}</p></div><span>${escapeHtml(label(itemStatus(item)))}</span></div>${profileBlocks}${form}`;
}
function openModal() { if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; modalForm?.reset(); }
function payloadFromForm(form) { const formData = new FormData(form); const payload = {}; formData.forEach((value, key) => { const text = String(value || "").trim(); if (text) payload[key] = text; }); if (payload.type === "profile") payload.notes = payload.summary || ""; if (payload.type === "role") { payload.role_name = payload.role_name || payload.last_name || payload.role_key; payload.description = payload.summary || ""; payload.role_family = payload.role_family || "operations"; }
  if (payload.type === "invitation") { payload.invited_role_key = payload.role_key || payload.invited_role_key || "lecteur_interne"; payload.message = payload.summary || ""; }
  if (payload.type === "review") { payload.findings = payload.summary || ""; payload.risk_level = payload.risk_level || "medium"; }
  return payload; }
async function createItem(event) { event.preventDefault(); await api("/api/admin-users", { method: "POST", body: JSON.stringify(payloadFromForm(modalForm)) }); closeModal(); await loadAll(); notify("Element utilisateur cree.", "success"); }
async function saveDetail(form) { const payload = Object.fromEntries(new FormData(form)); if (payload.type === "profile") payload.notes = payload.summary; if (payload.type === "role") { payload.description = payload.summary; payload.is_sensitive = payload.is_sensitive === "true"; } if (payload.type === "invitation") payload.message = payload.summary; if (payload.type === "review") { payload.review_status = payload.status; payload.findings = payload.summary; } await api("/api/admin-users", { method: "PATCH", body: JSON.stringify(payload) }); await loadAll(); notify("Element utilisateur enregistre.", "success"); }
function exportCsv() { const rows = [["Vue", "Titre", "Statut", "Reference"], ...filteredItems().map((item) => [viewLabels[view], titleFor(item), label(itemStatus(item)), subFor(item)])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `utilisateurs-tvf-os-${view}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); notify("Export utilisateurs prepare.", "success"); }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadAll(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadAll().catch((e) => notifyError(e)), 260); }); filtersForm?.addEventListener("change", () => loadAll().catch((e) => notifyError(e))); tabs.forEach((button) => button.addEventListener("click", () => { view = button.dataset.usersView || "profiles"; selectedId = currentItems()[0]?.id || null; renderAll(); })); refreshButton?.addEventListener("click", () => loadAll().catch((e) => notifyError(e))); createButton?.addEventListener("click", openModal); exportButton?.addEventListener("click", exportCsv); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; }); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalForm?.addEventListener("submit", createItem); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-users-id]"); if (!button) return; selectedId = button.dataset.usersId; renderAll(); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-users-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form).catch((e) => notifyError(e)); }); }

bindEvents();
if (token()) { showApp(); loadAll().catch((error) => { setToken(""); showLogin(); setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error"); }); } else { showLogin(); }
