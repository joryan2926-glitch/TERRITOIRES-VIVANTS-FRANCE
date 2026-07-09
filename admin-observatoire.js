const OBS_TOKEN_KEY = "tvfAdminToken";
const viewLabels = { sources: "Sources", indicators: "Indicateurs", diagnostics: "Diagnostics", watch: "Veille" };
const sourceTypes = { public_data: "Donnee publique", internal: "Interne", partner: "Partenaire", field: "Terrain", press: "Presse", funding: "Financement", legal: "Reglementaire", map: "Carte", other: "Autre" };
const indicatorTypes = { logements_vacants: "Logements vacants", commerces_vacants: "Commerces vacants", friches: "Friches", materiaux: "Materiaux", insertion: "Insertion", partenaires: "Partenaires", financement: "Financement", risques: "Risques", population: "Population", autre: "Autre" };
const watchTypes = { appel_a_projet: "Appel a projet", actualite: "Actualite", dispositif: "Dispositif", donnee_publique: "Donnee publique", risque: "Risque", partenaire: "Partenaire", autre: "Autre" };
const sourceStatuses = { active: "Active", a_verifier: "A verifier", archive: "Archive" };
const indicatorStatuses = { brouillon: "Brouillon", valide: "Valide", a_reviser: "A reviser", archive: "Archive" };
const diagnosticStatuses = { brouillon: "Brouillon", a_valider: "A valider", valide: "Valide", en_revision: "En revision", archive: "Archive" };
const watchStatuses = { a_qualifier: "A qualifier", utile: "Utile", ignore: "Ignore", archive: "Archive" };
const priorityLabels = { faible: "Faible", moyen: "Moyen", fort: "Fort", critique: "Critique" };
const trendLabels = { hausse: "Hausse", stable: "Stable", baisse: "Baisse", inconnu: "Inconnue" };
const maturityLabels = { idee: "Idee", prefiguration: "Prefiguration", lancement: "Lancement", operationnelle: "Operationnelle", confirmee: "Confirmee" };

const loginSection = document.querySelector("[data-observatoire-login]");
const appSection = document.querySelector("[data-observatoire-app]");
const tokenForm = document.querySelector("[data-observatoire-token-form]");
const loginStatus = document.querySelector("[data-observatoire-login-status]");
const filtersForm = document.querySelector("[data-observatoire-filters]");
const typeFilter = document.querySelector("[data-observatoire-type-filter]");
const statusFilter = document.querySelector("[data-observatoire-status-filter]");
const kpisEl = document.querySelector("[data-observatoire-kpis]");
const listEl = document.querySelector("[data-observatoire-list]");
const detailEl = document.querySelector("[data-observatoire-detail]");
const countEl = document.querySelector("[data-observatoire-count]");
const emptyEl = document.querySelector("[data-observatoire-empty]");
const aiScoreEl = document.querySelector("[data-observatoire-ai-score]");
const aiSummaryEl = document.querySelector("[data-observatoire-ai-summary]");
const aiGridEl = document.querySelector("[data-observatoire-ai-grid]");
const tabs = document.querySelectorAll("[data-observatoire-view]");
const createButton = document.querySelector("[data-observatoire-create]");
const diagnosticButton = document.querySelector("[data-observatoire-diagnostic]");
const refreshButton = document.querySelector("[data-observatoire-refresh]");
const exportButton = document.querySelector("[data-observatoire-export]");
const logoutButton = document.querySelector("[data-observatoire-logout]");
const modal = document.querySelector("[data-observatoire-modal]");
const modalForm = document.querySelector("[data-observatoire-form]");
const entitySelect = document.querySelector("[data-observatoire-entity-select]");
const closeModalButtons = document.querySelectorAll("[data-observatoire-close-modal]");

let currentView = "sources";
let data = { sources: [], indicators: [], diagnostics: [], watch: [] };
let dashboard = null;
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(OBS_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(OBS_TOKEN_KEY, value); else sessionStorage.removeItem(OBS_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function openObservatoireEntryModal(config) {
  return new Promise((resolve) => {
    const wrapper = document.createElement("section");
    wrapper.className = "admin-modal";
    wrapper.setAttribute("aria-label", config.title || "Saisie observatoire");
    const fields = (config.fields || []).map((field) => {
      const required = field.required ? "required" : "";
      const value = escapeHtml(field.value || "");
      if (field.type === "textarea") return `<label>${escapeHtml(field.label)}<textarea name="${escapeHtml(field.name)}" rows="${field.rows || 4}" ${required} placeholder="${escapeHtml(field.placeholder || "")}">${value}</textarea></label>`;
      return `<label>${escapeHtml(field.label)}<input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type || "text")}" value="${value}" ${required} placeholder="${escapeHtml(field.placeholder || "")}"></label>`;
    }).join("");
    wrapper.innerHTML = `<div class="admin-modal-panel observatoire-entry-panel"><div class="admin-modal-head"><div><p class="section-kicker">Observatoire territorial</p><h2>${escapeHtml(config.title || "Nouvelle saisie")}</h2><p>${escapeHtml(config.description || "Completez les informations necessaires a l observatoire.")}</p></div><button class="btn ghost" type="button" data-entry-cancel>Fermer</button></div><form class="admin-create-form observatoire-entry-form" data-entry-form>${fields}<div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">${escapeHtml(config.submitLabel || "Enregistrer")}</button><button class="btn secondary" type="button" data-entry-cancel>Annuler</button></div></form></div>`;
    const close = (value = null) => { wrapper.remove(); resolve(value); };
    wrapper.addEventListener("click", (event) => { if (event.target === wrapper || event.target.closest("[data-entry-cancel]")) close(null); });
    wrapper.querySelector("[data-entry-form]")?.addEventListener("submit", (event) => { event.preventDefault(); close(Object.fromEntries(new FormData(event.currentTarget))); });
    document.body.appendChild(wrapper);
    wrapper.querySelector("input, textarea")?.focus();
  });
}
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(map, value) { return map[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date); }
function optionList(map, selected) { return Object.entries(map).map(([value, text]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join(""); }
function arrayText(value) { return Array.isArray(value) ? value.join("; ") : String(value || ""); }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) throw new Error(result.error || "Action impossible.");
  return result;
}
function filtersParams() {
  const formData = new FormData(filtersForm);
  const params = new URLSearchParams({ entity: currentView, limit: "220" });
  ["q", "territory_label", "type", "status"].forEach((name) => {
    const value = String(formData.get(name) || "").trim();
    if (value) params.set(name, value);
  });
  return params;
}
async function loadItems() {
  if (countEl) countEl.textContent = "Chargement de l'observatoire...";
  const [overview, result] = await Promise.all([
    api("/api/admin-observatoire?entity=dashboard").catch(() => ({ dashboard: dashboard || {} })),
    api(`/api/admin-observatoire?${filtersParams().toString()}`)
  ]);
  dashboard = overview.dashboard || {};
  if (currentView === "sources") data.sources = result.sources || [];
  if (currentView === "indicators") data.indicators = result.indicators || [];
  if (currentView === "diagnostics") data.diagnostics = result.diagnostics || [];
  if (currentView === "watch") data.watch = result.watch || [];
  if (!items().some((item) => item.id === selectedId)) selectedId = items()[0]?.id || null;
  renderAll();
}
function items() { return data[currentView] || []; }
function selectedItem() { return items().find((item) => item.id === selectedId); }
function renderAll() { renderFilters(); renderTabs(); renderKpis(); renderAssistant(); renderList(); renderDetail(); }
function renderFilters() {
  const typeMaps = { sources: sourceTypes, indicators: indicatorTypes, diagnostics: {}, watch: watchTypes };
  const statusMaps = { sources: sourceStatuses, indicators: indicatorStatuses, diagnostics: diagnosticStatuses, watch: watchStatuses };
  if (typeFilter) typeFilter.innerHTML = `<option value="all">Tous</option>${optionList(typeMaps[currentView] || {}, typeFilter.value)}`;
  if (statusFilter) statusFilter.innerHTML = `<option value="all">Tous</option>${optionList(statusMaps[currentView] || {}, statusFilter.value)}`;
}
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.observatoireView === currentView)); }
function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `<article><span>Territoires</span><strong>${dashboard.territories_total || 0}</strong><small>Suivis</small></article><article><span>Sources</span><strong>${dashboard.sources_total || 0}</strong><small>${dashboard.official_sources || 0} officielles</small></article><article data-tone="warning"><span>A verifier</span><strong>${dashboard.sources_to_verify || 0}</strong><small>Sources</small></article><article data-tone="danger"><span>Priorites fortes</span><strong>${dashboard.high_priorities || 0}</strong><small>Indicateurs</small></article><article data-tone="info"><span>Diagnostics</span><strong>${dashboard.diagnostics_total || 0}</strong><small>${dashboard.diagnostics_to_validate || 0} a valider</small></article>`;
}
function renderAssistant() {
  const item = selectedItem();
  const maxScore = Math.max(0, ...items().map((entry) => Number(entry.priority_score || entry.assistant?.priority_score || 0)));
  if (aiScoreEl) aiScoreEl.textContent = String(maxScore || dashboard?.high_priorities || 0);
  if (aiSummaryEl) aiSummaryEl.textContent = item?.assistant?.summary || item?.ai_summary || `${items().length} element(s) dans la vue ${viewLabels[currentView]}.`;
  if (!aiGridEl) return;
  aiGridEl.innerHTML = `<div><span>Vue</span><strong>${viewLabels[currentView]}</strong></div><div><span>A qualifier</span><strong>${dashboard?.watch_to_qualify || 0}</strong></div><div><span>Sources a verifier</span><strong>${dashboard?.sources_to_verify || 0}</strong></div><div><span>Diagnostics a valider</span><strong>${dashboard?.diagnostics_to_validate || 0}</strong></div>`;
}
function itemTitle(item) { return item.source_name || item.label || item.title || item.territory_label || "Element observatoire"; }
function itemType(item) {
  if (currentView === "sources") return label(sourceTypes, item.source_type);
  if (currentView === "indicators") return label(indicatorTypes, item.indicator_type);
  if (currentView === "diagnostics") return label(maturityLabels, item.maturity_level);
  return label(watchTypes, item.watch_type);
}
function itemStatus(item) {
  if (currentView === "sources") return label(sourceStatuses, item.status);
  if (currentView === "indicators") return label(indicatorStatuses, item.status);
  if (currentView === "diagnostics") return label(diagnosticStatuses, item.status);
  return label(watchStatuses, item.status);
}
function itemCard(item) {
  const score = item.priority_score || item.assistant?.priority_score || item.reliability_level || item.opportunity_level || "-";
  return `<button class="admin-request observatoire-card${item.id === selectedId ? " is-active" : ""}" type="button" data-item-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(itemType(item))}</strong><small>${escapeHtml(itemStatus(item))}</small></span><span>${escapeHtml(itemTitle(item))}</span><span class="admin-request-sub">${escapeHtml(item.territory_label || item.url || "Territoire a renseigner")}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(String(score))}</em><em data-kind="category">${escapeHtml(formatDate(item.updated_at || item.created_at))}</em></span></button>`;
}
function renderList() {
  if (!listEl) return;
  listEl.innerHTML = items().map(itemCard).join("");
  if (emptyEl) emptyEl.hidden = items().length !== 0;
  if (countEl) countEl.textContent = `${items().length} element${items().length > 1 ? "s" : ""} - ${viewLabels[currentView]}`;
}
function renderDetail() {
  if (!detailEl) return;
  const item = selectedItem();
  if (!item) { detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez un element</h3><p>Aucun element disponible.</p></div>`; return; }
  const content = currentView === "sources" ? sourceDetail(item) : currentView === "indicators" ? indicatorDetail(item) : currentView === "diagnostics" ? diagnosticDetail(item) : watchDetail(item);
  detailEl.innerHTML = content;
}
function headerDetail(item, type) {
  return `<input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${type}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(itemType(item))}</p><h3>${escapeHtml(itemTitle(item))}</h3><p>${escapeHtml(item.territory_label || "Territoire a completer")}</p></div>`;
}
function sourceDetail(item) {
  return `<form class="admin-detail-form observatoire-detail-form" data-observatoire-detail-form>${headerDetail(item, "source")}<div class="admin-meta-grid"><div><span>Fiabilite</span><strong>${escapeHtml(label({ faible: "Faible", moyen: "Moyen", fort: "Fort", officiel: "Officiel" }, item.reliability_level))}</strong></div><div><span>Statut</span><strong>${escapeHtml(itemStatus(item))}</strong></div><div><span>Controle</span><strong>${escapeHtml(formatDate(item.last_checked_at))}</strong></div><div><span>Prochaine revue</span><strong>${escapeHtml(formatDate(item.next_check_at))}</strong></div></div><label>Nom<input name="source_name" value="${escapeHtml(item.source_name || "")}"></label><label>Territoire<input name="territory_label" value="${escapeHtml(item.territory_label || "")}"></label><label>Type<select name="source_type">${optionList(sourceTypes, item.source_type)}</select></label><label>Fiabilite<select name="reliability_level">${optionList({ faible: "Faible", moyen: "Moyen", fort: "Fort", officiel: "Officiel" }, item.reliability_level)}</select></label><label>Statut<select name="status">${optionList(sourceStatuses, item.status)}</select></label><label>Confidentialite<select name="confidentiality_level">${optionList({ public: "Public", interne: "Interne", confidentiel: "Confidentiel", sensible: "Sensible" }, item.confidentiality_level)}</select></label><label class="observatoire-wide-field">URL<input name="url" value="${escapeHtml(item.url || "")}"></label><label class="observatoire-wide-field">Notes<textarea name="notes" rows="5">${escapeHtml(item.notes || "")}</textarea></label>${detailActions("Archiver")}</form>`;
}
function indicatorDetail(item) {
  return `<form class="admin-detail-form observatoire-detail-form" data-observatoire-detail-form>${headerDetail(item, "indicator")}<div class="admin-meta-grid"><div><span>Score</span><strong>${escapeHtml(String(item.priority_score || 0))}</strong></div><div><span>Priorite</span><strong>${escapeHtml(label(priorityLabels, item.priority_level))}</strong></div><div><span>Tendance</span><strong>${escapeHtml(label(trendLabels, item.trend))}</strong></div><div><span>Confiance</span><strong>${escapeHtml(String(item.confidence ?? "-"))}</strong></div></div><section class="admin-ai-panel observatoire-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant</p><h4>Lecture indicateur</h4></div><strong>${escapeHtml(String(item.priority_score || 0))}</strong></div><p>${escapeHtml(item.ai_summary || "Synthese a completer.")}</p></section><label>Libelle<input name="label" value="${escapeHtml(item.label || "")}"></label><label>Territoire<input name="territory_label" value="${escapeHtml(item.territory_label || "")}"></label><label>Type<select name="indicator_type">${optionList(indicatorTypes, item.indicator_type)}</select></label><label>Statut<select name="status">${optionList(indicatorStatuses, item.status)}</select></label><label>Valeur<input name="value_numeric" value="${escapeHtml(item.value_numeric ?? "")}"></label><label>Unite<input name="unit" value="${escapeHtml(item.unit || "")}"></label><label>Tendance<select name="trend">${optionList(trendLabels, item.trend)}</select></label><label>Priorite<select name="priority_level">${optionList(priorityLabels, item.priority_level)}</select></label><label class="observatoire-wide-field">Synthese IA<textarea name="ai_summary" rows="4">${escapeHtml(item.ai_summary || "")}</textarea></label>${detailActions("Archiver")}</form>`;
}
function diagnosticDetail(item) {
  const assistant = item.assistant || {};
  const missing = assistant.missing_fields || [];
  return `<form class="admin-detail-form observatoire-detail-form" data-observatoire-detail-form>${headerDetail(item, "diagnostic")}<div class="admin-meta-grid"><div><span>Priorite</span><strong>${escapeHtml(String(assistant.priority_score || item.priority_score || 0))}</strong></div><div><span>Qualite</span><strong>${escapeHtml(String(assistant.data_quality_score || item.data_quality_score || 0))}</strong></div><div><span>Carte</span><strong>${escapeHtml(String(item.map_readiness_score || 0))}</strong></div><div><span>Statut suggere</span><strong>${escapeHtml(label(diagnosticStatuses, assistant.suggested_status))}</strong></div></div><section class="admin-ai-panel observatoire-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant</p><h4>Diagnostic territorial</h4></div><strong>${escapeHtml(String(assistant.priority_score || item.priority_score || 0))}</strong></div><p>${escapeHtml(assistant.summary || item.ai_summary || "Diagnostic a enrichir.")}</p><div class="admin-missing-pieces"><span>Elements manquants</span>${missing.length ? `<ul>${missing.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>` : "<p>Diagnostic suffisamment renseigne.</p>"}</div></section><label>Territoire<input name="territory_label" value="${escapeHtml(item.territory_label || "")}"></label><label>Statut<select name="status">${optionList(diagnosticStatuses, item.status)}</select></label><label>Maturite<select name="maturity_level">${optionList(maturityLabels, item.maturity_level)}</select></label><label>Prochaine revue<input name="next_review_at" type="date" value="${escapeHtml((item.next_review_at || "").slice(0, 10))}"></label><label>Score carte<input name="map_readiness_score" value="${escapeHtml(item.map_readiness_score ?? 0)}"></label><label>Score qualite<input name="data_quality_score" value="${escapeHtml(item.data_quality_score ?? 0)}"></label><label class="observatoire-wide-field">Synthese<textarea name="summary" rows="5">${escapeHtml(item.summary || "")}</textarea></label><label class="observatoire-wide-field">Opportunites<textarea name="opportunities" rows="3">${escapeHtml(arrayText(item.opportunities))}</textarea></label><label class="observatoire-wide-field">Risques<textarea name="risks" rows="3">${escapeHtml(arrayText(item.risks))}</textarea></label><label class="observatoire-wide-field">Actions recommandees<textarea name="recommended_actions" rows="3">${escapeHtml(arrayText(item.recommended_actions))}</textarea></label>${detailActions("Archiver")}</form>`;
}
function watchDetail(item) {
  return `<form class="admin-detail-form observatoire-detail-form" data-observatoire-detail-form>${headerDetail(item, "watch")}<div class="admin-meta-grid"><div><span>Opportunite</span><strong>${escapeHtml(label(priorityLabels, item.opportunity_level))}</strong></div><div><span>Statut</span><strong>${escapeHtml(itemStatus(item))}</strong></div><div><span>Echeance</span><strong>${escapeHtml(formatDate(item.due_at))}</strong></div><div><span>Type</span><strong>${escapeHtml(itemType(item))}</strong></div></div><label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Territoire<input name="territory_label" value="${escapeHtml(item.territory_label || "")}"></label><label>Type<select name="watch_type">${optionList(watchTypes, item.watch_type)}</select></label><label>Statut<select name="status">${optionList(watchStatuses, item.status)}</select></label><label>Opportunite<select name="opportunity_level">${optionList(priorityLabels, item.opportunity_level)}</select></label><label>Echeance<input name="due_at" type="date" value="${escapeHtml((item.due_at || "").slice(0, 10))}"></label><label class="observatoire-wide-field">URL<input name="url" value="${escapeHtml(item.url || "")}"></label><label class="observatoire-wide-field">Synthese<textarea name="summary" rows="5">${escapeHtml(item.summary || "")}</textarea></label>${detailActions("Archiver")}</form>`;
}
function detailActions(archiveLabel) { return `<div class="admin-detail-actions observatoire-wide-field"><button class="btn primary" type="submit">Enregistrer</button><button class="btn ghost" type="button" data-observatoire-archive>${archiveLabel}</button></div><p class="form-note observatoire-wide-field" data-observatoire-save-status hidden></p>`; }
function normalizeModalPayload(raw) {
  const payload = { ...raw };
  if (payload.type === "source") { payload.source_name = payload.title; payload.notes = payload.summary; }
  if (payload.type === "indicator") payload.label = payload.label || payload.title;
  if (payload.type === "diagnostic") payload.summary = payload.summary || payload.label;
  if (payload.type === "watch") payload.opportunity_level = payload.priority_level;
  return payload;
}
async function createElement(event) {
  event.preventDefault();
  const statusEl = modalForm.querySelector("[data-observatoire-modal-status]");
  const payload = normalizeModalPayload(Object.fromEntries(new FormData(modalForm)));
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Creation...";
    await api("/api/admin-observatoire", { method: "POST", body: JSON.stringify(payload) });
    closeModal();
    modalForm.reset();
    updateModalFields();
    await loadItems();
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
  }
}
async function saveElement(form) {
  const statusEl = form.querySelector("[data-observatoire-save-status]");
  const payload = Object.fromEntries(new FormData(form));
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Enregistrement...";
    await api("/api/admin-observatoire", { method: "PATCH", body: JSON.stringify(payload) });
    await loadItems();
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
  }
}
async function generateDiagnostic() {
  const territory = selectedItem()?.territory_label || String(filtersForm?.territory_label?.value || "").trim();
  const data = territory ? { territory_label: territory } : await openObservatoireEntryModal({ title: "Generer un diagnostic", description: "Indiquez le territoire a analyser a partir des indicateurs disponibles.", submitLabel: "Generer le diagnostic", fields: [{ name: "territory_label", label: "Territoire", required: true, placeholder: "Ex. Saint-Etienne, quartier, commune, EPCI" }] });
  const value = String(data?.territory_label || "").trim();
  if (!value) return;
  await api("/api/admin-observatoire", { method: "POST", body: JSON.stringify({ type: "diagnostic_from_indicators", territory_label: value }) });
  currentView = "diagnostics";
  selectedId = null;
  await loadItems();
  notify("Diagnostic territorial genere.", "success");
}
function exportCsv() {
  const rows = items();
  if (!rows.length) return notify("Aucun element a exporter.", "warning");
  const headers = ["Vue", "Titre", "Territoire", "Type", "Statut", "Score", "Mis a jour"];
  const csvRows = rows.map((item) => [viewLabels[currentView], itemTitle(item), item.territory_label, itemType(item), itemStatus(item), item.priority_score || item.reliability_level || item.opportunity_level || "", item.updated_at || item.created_at || ""]);
  const csv = [headers, ...csvRows].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `observatoire-tvf-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify("Export observatoire prepare.", "success");
}
function openModal() { if (modal) modal.hidden = false; updateModalFields(); modalForm?.querySelector("input, select, textarea")?.focus(); }
function closeModal() { if (modal) modal.hidden = true; }
function updateModalFields() {
  const selected = entitySelect?.value || "source";
  modalForm?.querySelectorAll("[class*='observatoire-field-']").forEach((field) => {
    const visible = field.classList.contains(`observatoire-field-${selected}`);
    field.hidden = !visible;
  });
}
function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = String(new FormData(tokenForm).get("token") || "").trim();
    if (!value) return setStatus("Entrez le token admin.", "error");
    setToken(value);
    try { showApp(); await loadItems(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); }
  });
  tabs.forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.observatoireView; selectedId = null; loadItems().catch((error) => notifyError(error)); }));
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadItems().catch((error) => notifyError(error)), 280); });
  filtersForm?.addEventListener("change", () => loadItems().catch((error) => notifyError(error)));
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-item-id]"); if (!button) return; selectedId = button.dataset.itemId; renderAll(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-observatoire-detail-form]"); if (!form) return; event.preventDefault(); saveElement(form); });
  detailEl?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-observatoire-archive]")) return;
    const form = detailEl.querySelector("[data-observatoire-detail-form]");
    if (!form) return;
    if (form.status) form.status.value = "archive";
    saveElement(form);
  });
  createButton?.addEventListener("click", openModal);
  diagnosticButton?.addEventListener("click", () => generateDiagnostic().catch((error) => notifyError(error)));
  refreshButton?.addEventListener("click", () => loadItems().catch((error) => notifyError(error)));
  exportButton?.addEventListener("click", exportCsv);
  logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin"; });
  closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  entitySelect?.addEventListener("change", updateModalFields);
  modalForm?.addEventListener("submit", createElement);
}

bindEvents();
updateModalFields();
if (token()) {
  showApp();
  loadItems().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); });
} else {
  showLogin();
}
