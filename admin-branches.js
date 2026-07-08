const BRANCHES_TOKEN_KEY = "tvfAdminToken";
const statusLabels = { prefiguration: "Prefiguration", launching: "Lancement", operational: "Operationnelle", paused: "En pause", closed: "Cloturee", archive: "Archive", todo: "A faire", in_progress: "En cours", blocked: "Bloque", done: "Fait", waived: "Ignore", invited: "Invite", active: "Actif", left: "Parti", planned: "Planifie" };
const maturityLabels = { idee: "Idee", prefiguration: "Prefiguration", lancement: "Lancement", operationnelle: "Operationnelle", confirmee: "Confirmee", formatrice: "Formatrice" };

const loginSection = document.querySelector("[data-branches-login]");
const appSection = document.querySelector("[data-branches-app]");
const tokenForm = document.querySelector("[data-branches-token-form]");
const loginStatus = document.querySelector("[data-branches-login-status]");
const filtersForm = document.querySelector("[data-branches-filters]");
const kpisEl = document.querySelector("[data-branches-kpis]");
const listEl = document.querySelector("[data-branches-list]");
const detailEl = document.querySelector("[data-branches-detail]");
const countEl = document.querySelector("[data-branches-count]");
const listCountEl = document.querySelector("[data-branches-list-count]");
const emptyEl = document.querySelector("[data-branches-empty]");
const aiScoreEl = document.querySelector("[data-branches-ai-score]");
const aiSummaryEl = document.querySelector("[data-branches-ai-summary]");
const aiGridEl = document.querySelector("[data-branches-ai-grid]");
const tabs = document.querySelectorAll("[data-branches-view]");
const createButton = document.querySelector("[data-branches-create]");
const packButton = document.querySelector("[data-branches-pack]");
const refreshButton = document.querySelector("[data-branches-refresh]");
const exportButton = document.querySelector("[data-branches-export]");
const logoutButton = document.querySelector("[data-branches-logout]");
const modal = document.querySelector("[data-branches-modal]");
const modalForm = document.querySelector("[data-branches-form]");
const relatedIdInput = document.querySelector("[data-branches-related-id]");
const closeModalButtons = document.querySelectorAll("[data-branches-close-modal]");

let view = "overview";
let dashboard = null;
let branches = [];
let branchData = { checklist: [], team: [], training: [], branch_poles: [], poles: [] };
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(BRANCHES_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(BRANCHES_TOKEN_KEY, value); else sessionStorage.removeItem(BRANCHES_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(map, value) { return map[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date); }
function selectedBranch() { return branches.find((branch) => branch.id === selectedId) || branches[0] || null; }
function selectedItems(key) { return (branchData[key] || []).filter((item) => item.branch_id === selectedId); }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) {
    const error = new Error(result.error || "Action impossible.");
    error.status = response.status;
    throw error;
  }
  return result;
}

function filtersParams() {
  const data = new FormData(filtersForm);
  const params = new URLSearchParams({ entity: "branches", limit: "220" });
  ["q", "status", "maturity"].forEach((name) => { const value = String(data.get(name) || "").trim(); if (value && value !== "all") params.set(name, value); });
  return params;
}

async function loadAll() {
  if (countEl) countEl.textContent = "Chargement des antennes...";
  const overview = await api("/api/admin-branches?entity=dashboard");
  const result = await api(`/api/admin-branches?${filtersParams().toString()}`);
  const [checklist, team, training, branchPoles, poles] = await Promise.all([
    api("/api/admin-branches?entity=checklist&limit=1000"),
    api("/api/admin-branches?entity=team&limit=1000"),
    api("/api/admin-branches?entity=training&limit=1000"),
    api("/api/admin-branches?entity=branch_poles&limit=1000"),
    api("/api/admin-branches?entity=poles"),
  ]);
  dashboard = overview.dashboard || {};
  branches = result.branches || [];
  branchData = { checklist: checklist.checklist || [], team: team.team || [], training: training.training || [], branch_poles: branchPoles.branch_poles || [], poles: poles.poles || [] };
  if (!branches.some((branch) => branch.id === selectedId)) selectedId = branches[0]?.id || null;
  renderAll();
}

function renderAll() { renderKpis(); renderAssistant(); renderTabs(); renderList(); renderDetail(); }
function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `<article><span>Antennes</span><strong>${dashboard.total || 0}</strong><small>${dashboard.validated || 0} validees</small></article><article><span>En lancement</span><strong>${dashboard.launching || 0}</strong><small>suivi national</small></article><article><span>Operationnelles</span><strong>${dashboard.operational || 0}</strong><small>terrain actif</small></article><article data-tone="warning"><span>Blocages</span><strong>${dashboard.blocked_items || 0}</strong><small>checklist</small></article><article data-tone="info"><span>Preparation</span><strong>${dashboard.average_readiness || 0}%</strong><small>moyenne</small></article>`;
  if (countEl) countEl.textContent = `${branches.length} antenne(s) affichee(s) - ${dashboard.total || 0} au total.`;
}
function renderAssistant() {
  const branch = selectedBranch();
  const assistant = branch?.assistant || dashboard?.assistant || {};
  if (aiScoreEl) aiScoreEl.textContent = `${assistant.readiness_score ?? dashboard?.average_readiness ?? 0}%`;
  if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || dashboard?.assistant?.summary || "Aucune analyse disponible.";
  if (!aiGridEl) return;
  const actions = assistant.next_actions || dashboard?.assistant?.priorities?.map((item) => `${item.branch_name} : ${item.action}`) || [];
  aiGridEl.innerHTML = actions.length ? actions.slice(0, 4).map((action) => `<div><span>Action</span><strong>${escapeHtml(action)}</strong></div>`).join("") : `<div><span>Action</span><strong>Creer une premiere antenne</strong></div>`;
}
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.branchesView === view)); }
function branchCard(branch) {
  const assistant = branch.assistant || {};
  return `<button class="admin-request branches-card${branch.id === selectedId ? " is-active" : ""}" type="button" data-branch-id="${escapeHtml(branch.id)}"><span class="admin-request-head"><strong>${escapeHtml(branch.name)}</strong><small>${escapeHtml(branch.code)}</small></span><span>${escapeHtml(branch.territory_name || branch.city || "Territoire non renseigne")}</span><span class="admin-request-sub">${escapeHtml(label(statusLabels, branch.status))} - ${escapeHtml(label(maturityLabels, branch.maturity_level))}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(assistant.readiness_score ?? 0)}%</em><em data-kind="category">${escapeHtml(branch.region || branch.department || "National")}</em></span></button>`;
}
function renderList() {
  if (listCountEl) listCountEl.textContent = String(branches.length);
  if (emptyEl) emptyEl.hidden = branches.length > 0;
  if (!listEl) return;
  listEl.innerHTML = branches.length ? branches.map(branchCard).join("") : "";
}
function statusSelect(type, current) {
  const maps = {
    branch: ["prefiguration", "launching", "operational", "paused", "closed", "archive"],
    maturity: ["idee", "prefiguration", "lancement", "operationnelle", "confirmee", "formatrice"],
    checklist: ["todo", "in_progress", "blocked", "done", "waived"],
    team: ["invited", "active", "paused", "left", "archive"],
    training: ["todo", "in_progress", "done", "waived"],
    pole: ["planned", "active", "paused", "archive"],
  };
  return (maps[type] || []).map((value) => `<option value="${value}" ${value === current ? "selected" : ""}>${escapeHtml(label(type === "maturity" ? maturityLabels : statusLabels, value))}</option>`).join("");
}
function overview(branch) {
  return `<form class="branches-detail-form" data-branch-detail-form><input type="hidden" name="id" value="${escapeHtml(branch.id)}"><input type="hidden" name="type" value="branch"><label>Nom<input name="name" value="${escapeHtml(branch.name)}"></label><label>Code<input name="code" value="${escapeHtml(branch.code)}"></label><label>Statut<select name="status">${statusSelect("branch", branch.status)}</select></label><label>Maturite<select name="maturity_level">${statusSelect("maturity", branch.maturity_level)}</select></label><label>Validation nationale<select name="national_validation_status"><option value="draft" ${branch.national_validation_status === "draft" ? "selected" : ""}>Brouillon</option><option value="to_review" ${branch.national_validation_status === "to_review" ? "selected" : ""}>A verifier</option><option value="validated" ${branch.national_validation_status === "validated" ? "selected" : ""}>Validee</option><option value="rejected" ${branch.national_validation_status === "rejected" ? "selected" : ""}>Refusee</option><option value="suspended" ${branch.national_validation_status === "suspended" ? "selected" : ""}>Suspendue</option></select></label><label>Territoire<input name="territory_name" value="${escapeHtml(branch.territory_name)}"></label><label>Ville<input name="city" value="${escapeHtml(branch.city)}"></label><label>Departement<input name="department" value="${escapeHtml(branch.department)}"></label><label>Region<input name="region" value="${escapeHtml(branch.region)}"></label><label>Responsable<input name="responsible_name" value="${escapeHtml(branch.responsible_name)}"></label><label>E-mail<input name="responsible_email" value="${escapeHtml(branch.responsible_email)}"></label><label class="branches-wide-field">Description<textarea name="description" rows="4">${escapeHtml(branch.description)}</textarea></label><button class="btn primary" type="submit">Enregistrer</button></form>`;
}
function rowList(items, type) {
  if (!items.length) return `<p class="form-note">Aucun element dans cette vue.</p>`;
  return `<div class="branches-row-list">${items.map((item) => `<article><div><strong>${escapeHtml(item.label || item.full_name || item.title || item.pole_key || "Element")}</strong><span>${escapeHtml(item.category || item.role_label || item.assigned_to || item.referent_name || item.notes || "")}</span></div><form data-branches-inline-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${type}"><select name="status">${statusSelect(type, item.status)}</select><button class="btn secondary" type="submit">OK</button></form></article>`).join("")}</div>`;
}
function renderDetail() {
  const branch = selectedBranch();
  if (!detailEl) return;
  if (!branch) { detailEl.innerHTML = `<p class="form-note">Aucune antenne selectionnee.</p>`; return; }
  const assistant = branch.assistant || {};
  const blocks = { overview: overview(branch), checklist: rowList(selectedItems("checklist"), "checklist"), team: rowList(selectedItems("team"), "team"), training: rowList(selectedItems("training"), "training"), poles: rowList(selectedItems("branch_poles"), "pole") };
  detailEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">${escapeHtml(branch.code)}</p><h2>${escapeHtml(branch.name)}</h2><p>${escapeHtml(branch.territory_name || "Territoire non renseigne")}</p></div><span>${escapeHtml(assistant.readiness_score ?? 0)}%</span></div><section class="branches-readiness"><article><span>Checklist</span><strong>${escapeHtml(assistant.checklist_score ?? 0)}%</strong></article><article><span>Formation</span><strong>${escapeHtml(assistant.training_score ?? 0)}%</strong></article><article><span>Equipe active</span><strong>${escapeHtml(assistant.active_team ?? 0)}</strong></article><article><span>Poles actifs</span><strong>${escapeHtml(assistant.active_poles ?? 0)}</strong></article></section>${blocks[view] || blocks.overview}`;
}

function openModal() { if (relatedIdInput) relatedIdInput.value = selectedId || ""; if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; modalForm?.reset(); }
function payloadFromForm(form) { const data = new FormData(form); const payload = {}; data.forEach((value, key) => { const text = String(value || "").trim(); if (text) payload[key] = text; }); if (payload.type !== "branch" && !payload.branch_id && selectedId) payload.branch_id = selectedId; if (payload.type === "checklist") { payload.item_key = payload.item_key || payload.code || `item_${Date.now()}`; payload.label = payload.name || payload.description || "Etape de lancement"; payload.notes = payload.description || ""; } if (payload.type === "team") { payload.full_name = payload.name || "Membre antenne"; payload.role_label = payload.category || "Membre antenne"; payload.notes = payload.description || ""; } if (payload.type === "training") { payload.training_key = payload.item_key || payload.code || `formation_${Date.now()}`; payload.title = payload.name || "Formation antenne"; payload.notes = payload.description || ""; } if (payload.type === "pole") { payload.pole_key = payload.item_key || payload.code || "habitat_vivant"; payload.objectives = payload.description || ""; } return payload; }
async function saveInline(form) { await api("/api/admin-branches", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); await loadAll(); }
async function saveBranch(form) { await api("/api/admin-branches", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); await loadAll(); }
async function createItem(event) { event.preventDefault(); await api("/api/admin-branches", { method: "POST", body: JSON.stringify(payloadFromForm(modalForm)) }); closeModal(); await loadAll(); }
async function generatePack() { const branch = selectedBranch(); if (!branch) return alert("Selectionnez une antenne."); const result = await api("/api/admin-branches", { method: "POST", body: JSON.stringify({ type: "generate_pack", branch_id: branch.id }) }); const pack = result.launch_pack; alert(`${pack.pack.title}\n\nPreparation : ${pack.assistant.readiness_score}%\nActions : ${pack.pack.next_actions.join("; ")}`); }
function exportCsv() { const rows = [["Code", "Nom", "Territoire", "Statut", "Maturite", "Preparation"], ...branches.map((branch) => [branch.code, branch.name, branch.territory_name, label(statusLabels, branch.status), label(maturityLabels, branch.maturity_level), `${branch.assistant?.readiness_score || 0}%`])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `antennes-tvf-os-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }

function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadAll(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.status === 401 ? "Token admin invalide." : error.message, "error"); } });
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadAll().catch((e) => alert(e.message)), 260); });
  filtersForm?.addEventListener("change", () => loadAll().catch((e) => alert(e.message)));
  tabs.forEach((button) => button.addEventListener("click", () => { view = button.dataset.branchesView || "overview"; renderAll(); }));
  refreshButton?.addEventListener("click", () => loadAll().catch((e) => alert(e.message)));
  createButton?.addEventListener("click", openModal);
  closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  modalForm?.addEventListener("submit", createItem);
  packButton?.addEventListener("click", () => generatePack().catch((e) => alert(e.message)));
  exportButton?.addEventListener("click", exportCsv);
  logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin"; });
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-branch-id]"); if (!button) return; selectedId = button.dataset.branchId; renderAll(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-branch-detail-form], [data-branches-inline-form]"); if (!form) return; event.preventDefault(); if (form.matches("[data-branch-detail-form]")) saveBranch(form).catch((e) => alert(e.message)); else saveInline(form).catch((e) => alert(e.message)); });
}

bindEvents();
if (token()) { showApp(); loadAll().catch((error) => { setToken(""); showLogin(); setStatus(error.status === 401 ? "Session expiree ou token invalide." : error.message, "error"); }); } else { showLogin(); }
