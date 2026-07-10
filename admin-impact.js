const IMPACT_TOKEN_KEY = "tvfAdminToken";
const viewLabels = { metrics: "Indicateurs", values: "Valeurs", proofs: "Preuves", reports: "Bilans", exports: "Exports" };
const typeMaps = {
  metrics: { activity: "Activite", impact: "Impact", finance: "Finance", territory: "Territoire", volunteer: "Benevolat", material: "Materiaux", partner: "Partenaires", case: "Dossiers", other: "Autre" },
  proofs: { document: "Document", photo: "Photo", report: "Rapport", invoice: "Facture", attendance: "Emargement", decision: "Decision", external_source: "Source externe", other: "Autre" },
  reports: { national: "National", branch: "Antenne", pole: "Pole", project: "Projet", funder: "Financeur", public: "Public" },
  values: {},
  exports: {}
};
const statusMaps = {
  metrics: { active: "Actif", draft: "Brouillon", archive: "Archive" },
  values: { draft: "Brouillon", validated: "Valide", rejected: "Rejete", archive: "Archive" },
  proofs: { pending: "A verifier", validated: "Validee", rejected: "Rejetee", archive: "Archive" },
  reports: { draft: "Brouillon", to_validate: "A valider", validated: "Valide", published: "Publie", archive: "Archive" },
  exports: { queued: "En file", ready: "Pret", failed: "Echoue", expired: "Expire" }
};
const scopeLabels = { national: "National", branch: "Antenne", pole: "Pole", project: "Projet", case: "Dossier" };

const loginSection = document.querySelector("[data-impact-login]");
const appSection = document.querySelector("[data-impact-app]");
const tokenForm = document.querySelector("[data-impact-token-form]");
const loginStatus = document.querySelector("[data-impact-login-status]");
const filtersForm = document.querySelector("[data-impact-filters]");
const typeFilter = document.querySelector("[data-impact-type-filter]");
const statusFilter = document.querySelector("[data-impact-status-filter]");
const kpisEl = document.querySelector("[data-impact-kpis]");
const controlEl = document.querySelector("[data-impact-control]");
const listEl = document.querySelector("[data-impact-list]");
const detailEl = document.querySelector("[data-impact-detail]");
const countEl = document.querySelector("[data-impact-count]");
const emptyEl = document.querySelector("[data-impact-empty]");
const aiScoreEl = document.querySelector("[data-impact-ai-score]");
const aiSummaryEl = document.querySelector("[data-impact-ai-summary]");
const aiGridEl = document.querySelector("[data-impact-ai-grid]");
const tabs = document.querySelectorAll("[data-impact-view]");
const createButton = document.querySelector("[data-impact-create]");
const reportButton = document.querySelector("[data-impact-report]");
const refreshButton = document.querySelector("[data-impact-refresh]");
const exportButton = document.querySelector("[data-impact-export]");
const logoutButton = document.querySelector("[data-impact-logout]");
const modal = document.querySelector("[data-impact-modal]");
const modalForm = document.querySelector("[data-impact-form]");
const entitySelect = document.querySelector("[data-impact-entity-select]");
const closeModalButtons = document.querySelectorAll("[data-impact-close-modal]");

let currentView = "metrics";
let dashboard = null;
let data = { metrics: [], values: [], proofs: [], reports: [], exports: [] };
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(IMPACT_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(IMPACT_TOKEN_KEY, value); else sessionStorage.removeItem(IMPACT_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
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
function items() { return data[currentView] || []; }
function selectedItem() { return items().find((item) => item.id === selectedId); }
function filtersParams() {
  const formData = new FormData(filtersForm);
  const params = new URLSearchParams({ entity: currentView, limit: "220" });
  ["q", "type", "status"].forEach((name) => { const value = String(formData.get(name) || "").trim(); if (value) params.set(name, value); });
  return params;
}
async function loadItems() {
  if (countEl) countEl.textContent = "Chargement de l'impact...";
  const [overview, result] = await Promise.all([
    api("/api/admin-impact?entity=dashboard").catch(() => ({ dashboard: dashboard || {} })),
    api(`/api/admin-impact?${filtersParams().toString()}`)
  ]);
  dashboard = overview.dashboard || {};
  data[currentView] = result[currentView] || [];
  if (!items().some((item) => item.id === selectedId)) selectedId = items()[0]?.id || null;
  renderAll();
}
function renderAll() { renderFilters(); renderTabs(); renderKpis(); renderControlPanel(); renderAssistant(); renderList(); renderDetail(); }
function renderFilters() {
  if (typeFilter) typeFilter.innerHTML = `<option value="all">Tous</option>${optionList(typeMaps[currentView] || {}, typeFilter.value)}`;
  if (statusFilter) statusFilter.innerHTML = `<option value="all">Tous</option>${optionList(statusMaps[currentView] || {}, statusFilter.value)}`;
}
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.impactView === currentView)); }
function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `<article><span>Indicateurs</span><strong>${dashboard.metrics_total || 0}</strong><small>${dashboard.active_metrics || 0} actifs</small></article><article><span>Valeurs validees</span><strong>${dashboard.validated_values || 0}</strong><small>${dashboard.publishable_ratio || 0}% validable</small></article><article data-tone="warning"><span>Brouillons</span><strong>${dashboard.draft_values || 0}</strong><small>Exclus bilans</small></article><article data-tone="danger"><span>Preuves a verifier</span><strong>${dashboard.pending_proofs || 0}</strong><small>Controle</small></article><article data-tone="info"><span>Bilans</span><strong>${dashboard.reports_total || 0}</strong><small>${dashboard.reports_to_validate || 0} a valider</small></article>`;
}
function renderControlPanel() {
  if (!controlEl || !dashboard) return;
  const publishableRatio = Number(dashboard.publishable_ratio || 0);
  const pendingProofs = Number(dashboard.pending_proofs || 0);
  const draftValues = Number(dashboard.draft_values || 0);
  const reportsToValidate = Number(dashboard.reports_to_validate || 0);
  const validatedValues = Number(dashboard.validated_values || 0);
  const proofFlow = [
    { view: "metrics", label: "Indicateur", detail: `${dashboard.active_metrics || 0} actif(s)`, done: Number(dashboard.active_metrics || 0) > 0 },
    { view: "values", label: "Valeur", detail: `${validatedValues} validee(s)`, done: validatedValues > 0 },
    { view: "proofs", label: "Preuve", detail: `${dashboard.validated_proofs || 0} validee(s)`, done: Number(dashboard.validated_proofs || 0) > 0 },
    { view: "reports", label: "Bilan", detail: `${dashboard.reports_total || 0} prepare(s)`, done: Number(dashboard.reports_total || 0) > 0 },
    { view: "exports", label: "Transmission", detail: "Export controle", done: publishableRatio >= 80 && pendingProofs === 0 }
  ];
  const nextDecision = pendingProofs ? "Verifier les preuves" : draftValues ? "Valider les valeurs" : reportsToValidate ? "Valider les bilans" : validatedValues ? "Preparer le bilan public" : "Creer les premiers indicateurs";
  const reportStatus = publishableRatio >= 80 && pendingProofs === 0 ? "Bilan exploitable" : publishableRatio >= 50 ? "Bilan a consolider" : "Base a documenter";
  controlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Pilotage impact</p><h3>Passer des actions aux resultats prouvables</h3><p>Cette synthese distingue les donnees internes, les preuves a verifier et les elements pouvant alimenter un bilan presentable a une collectivite ou a un financeur.</p></div><strong>${escapeHtml(reportStatus)}</strong></div><div class="impact-control-grid"><article><span>Decision suivante</span><strong>${escapeHtml(nextDecision)}</strong><small>priorite immediate</small></article><article><span>Taux publiable</span><strong>${escapeHtml(publishableRatio)}%</strong><small>qualite des donnees</small></article><article><span>Preuves ouvertes</span><strong>${escapeHtml(pendingProofs)}</strong><small>controle requis</small></article><article><span>Valeurs brouillon</span><strong>${escapeHtml(draftValues)}</strong><small>hors bilan</small></article><article><span>Bilans a valider</span><strong>${escapeHtml(reportsToValidate)}</strong><small>decision interne</small></article></div><ol class="impact-proof-flow" aria-label="Parcours de preuve de l impact">${proofFlow.map((step, index) => `<li class="${step.done ? "is-done" : ""}${step.view === currentView ? " is-current" : ""}"><button type="button" data-impact-flow-view="${escapeHtml(step.view)}"><span>${index + 1}</span><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.detail)}</small></button></li>`).join("")}</ol><div class="impact-control-links"><a class="btn secondary" href="admin-demandes">Demandes</a><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-map">Carte</a><a class="btn secondary" href="admin-documents">Preuves</a><a class="btn secondary" href="admin-finances">Finances</a></div>`;
}
function renderAssistant() {
  const item = selectedItem();
  const assistant = item?.assistant || {};
  if (aiScoreEl) aiScoreEl.textContent = `${assistant.reliability_score ?? dashboard?.publishable_ratio ?? 0}%`;
  if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || `${items().length} element(s) dans la vue ${viewLabels[currentView]}.`;
  if (!aiGridEl) return;
  aiGridEl.innerHTML = `<div><span>Valeurs validees</span><strong>${dashboard?.validated_values || 0}</strong></div><div><span>Preuves validees</span><strong>${dashboard?.validated_proofs || 0}</strong></div><div><span>Preuves a verifier</span><strong>${dashboard?.pending_proofs || 0}</strong></div><div><span>Bilans a valider</span><strong>${dashboard?.reports_to_validate || 0}</strong></div>`;
}
function itemTitle(item) { return item.metric_name || item.value_text || item.proof_title || item.report_title || item.export_title || "Element impact"; }
function itemStatus(item) { return label(statusMaps[currentView] || {}, item.status); }
function itemType(item) {
  if (currentView === "metrics") return label(typeMaps.metrics, item.metric_type);
  if (currentView === "proofs") return label(typeMaps.proofs, item.proof_type);
  if (currentView === "reports") return label(typeMaps.reports, item.report_type);
  if (currentView === "exports") return item.export_format || "Export";
  return viewLabels[currentView];
}
function itemCard(item) {
  const score = item.assistant?.reliability_score ?? item.value_numeric ?? item.status ?? "-";
  const tone = item.assistant?.publishable === false || item.status === "pending" || item.status === "draft" ? " is-risk" : "";
  return `<button class="admin-request impact-card${item.id === selectedId ? " is-active" : ""}${tone}" type="button" data-item-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(itemType(item))}</strong><small>${escapeHtml(itemStatus(item))}</small></span><span>${escapeHtml(itemTitle(item))}</span><span class="admin-request-sub">${escapeHtml(item.unit || item.source_label || item.url || formatDate(item.updated_at || item.created_at))}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(String(score))}</em><em data-kind="category">${escapeHtml(formatDate(item.updated_at || item.created_at))}</em></span></button>`;
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
  const renderers = { metrics: metricDetail, values: valueDetail, proofs: proofDetail, reports: reportDetail, exports: exportDetail };
  detailEl.innerHTML = renderers[currentView](item);
}
function headerDetail(item, type) { return `<input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${type}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(itemType(item))}</p><h3>${escapeHtml(itemTitle(item))}</h3><p>${escapeHtml(itemStatus(item))}</p></div>`; }
function actions() { return `<div class="admin-detail-actions impact-wide-field"><button class="btn primary" type="submit">Enregistrer</button><button class="btn ghost" type="button" data-impact-archive>Archiver</button></div><p class="form-note impact-wide-field" data-impact-save-status hidden></p>`; }
function metricDetail(item) {
  const a = item.assistant || {};
  return `<form class="admin-detail-form impact-detail-form" data-impact-detail-form>${headerDetail(item, "metric")}<div class="admin-meta-grid"><div><span>Fiabilite</span><strong>${escapeHtml(String(a.reliability_score || 0))}%</strong></div><div><span>Valeurs</span><strong>${escapeHtml(String(a.validated_count || 0))}</strong></div><div><span>Portee</span><strong>${escapeHtml(label(scopeLabels, item.metric_scope))}</strong></div><div><span>Publiable</span><strong>${a.publishable ? "Oui" : "Non"}</strong></div></div><section class="admin-ai-panel impact-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant impact</p><h4>Controle preuve</h4></div><strong>${escapeHtml(String(a.reliability_score || 0))}%</strong></div><p>${escapeHtml(a.summary || "Indicateur a documenter.")}</p></section><label>Nom<input name="metric_name" value="${escapeHtml(item.metric_name || "")}"></label><label>Type<select name="metric_type">${optionList(typeMaps.metrics, item.metric_type)}</select></label><label>Portee<select name="metric_scope">${optionList(scopeLabels, item.metric_scope)}</select></label><label>Statut<select name="status">${optionList(statusMaps.metrics, item.status)}</select></label><label>Unite<input name="unit" value="${escapeHtml(item.unit || "")}"></label><label>Preuve requise<input name="required_proof_type" value="${escapeHtml(item.required_proof_type || "")}"></label><label class="impact-wide-field">Description<textarea name="description" rows="4">${escapeHtml(item.description || "")}</textarea></label><label class="impact-wide-field">Methode de calcul<textarea name="calculation_method" rows="4">${escapeHtml(item.calculation_method || "")}</textarea></label>${actions()}</form>`;
}
function valueDetail(item) {
  return `<form class="admin-detail-form impact-detail-form" data-impact-detail-form>${headerDetail(item, "value")}<div class="admin-meta-grid"><div><span>Valeur</span><strong>${escapeHtml(String(item.value_numeric ?? 0))}</strong></div><div><span>Avant</span><strong>${escapeHtml(String(item.before_value ?? 0))}</strong></div><div><span>Apres</span><strong>${escapeHtml(String(item.after_value ?? 0))}</strong></div><div><span>Fiabilite</span><strong>${escapeHtml(item.reliability_level || "-")}</strong></div></div><label>Valeur<input name="value_numeric" value="${escapeHtml(item.value_numeric ?? 0)}"></label><label>Statut<select name="status">${optionList(statusMaps.values, item.status)}</select></label><label>Avant<input name="before_value" value="${escapeHtml(item.before_value ?? 0)}"></label><label>Apres<input name="after_value" value="${escapeHtml(item.after_value ?? 0)}"></label><label>Fiabilite<select name="reliability_level">${optionList({ faible: "Faible", moyen: "Moyen", fort: "Fort", verifie: "Verifie" }, item.reliability_level)}</select></label><label>Source<input name="source_label" value="${escapeHtml(item.source_label || "")}"></label><label class="impact-wide-field">Notes<textarea name="notes" rows="4">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function proofDetail(item) {
  return `<form class="admin-detail-form impact-detail-form" data-impact-detail-form>${headerDetail(item, "proof")}<label>Titre<input name="proof_title" value="${escapeHtml(item.proof_title || "")}"></label><label>Type<select name="proof_type">${optionList(typeMaps.proofs, item.proof_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.proofs, item.status)}</select></label><label>Confidentialite<input name="confidentiality_level" value="${escapeHtml(item.confidentiality_level || "interne")}"></label><label class="impact-wide-field">URL<input name="url" value="${escapeHtml(item.url || "")}"></label><label>Controle par<input name="checked_by" value="${escapeHtml(item.checked_by || "")}"></label><label>Controle le<input name="checked_at" type="date" value="${escapeHtml((item.checked_at || "").slice(0, 10))}"></label><label class="impact-wide-field">Notes<textarea name="notes" rows="4">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function reportDetail(item) {
  return `<form class="admin-detail-form impact-detail-form" data-impact-detail-form>${headerDetail(item, "report")}<label>Titre<input name="report_title" value="${escapeHtml(item.report_title || "")}"></label><label>Type<select name="report_type">${optionList(typeMaps.reports, item.report_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.reports, item.status)}</select></label><label>Valide par<input name="validated_by" value="${escapeHtml(item.validated_by || "")}"></label><label class="impact-wide-field">Synthese<textarea name="summary" rows="5">${escapeHtml(item.summary || "")}</textarea></label><label class="impact-wide-field">Indicateurs<textarea name="metric_ids" rows="3">${escapeHtml(arrayText(item.metric_ids))}</textarea></label><label class="impact-wide-field">Preuves<textarea name="proof_ids" rows="3">${escapeHtml(arrayText(item.proof_ids))}</textarea></label>${actions()}</form>`;
}
function exportDetail(item) {
  return `<form class="admin-detail-form impact-detail-form" data-impact-detail-form>${headerDetail(item, "export")}<label>Titre<input name="export_title" value="${escapeHtml(item.export_title || "")}"></label><label>Format<input name="export_format" value="${escapeHtml(item.export_format || "csv")}"></label><label>Statut<select name="status">${optionList(statusMaps.exports, item.status)}</select></label><label class="impact-wide-field">Fichier<input name="file_url" value="${escapeHtml(item.file_url || "")}"></label>${actions()}</form>`;
}
function normalizePayload(raw) {
  const payload = { ...raw };
  if (payload.type === "metric") { payload.metric_name = payload.title; payload.description = payload.summary; }
  if (payload.type === "proof") { payload.proof_title = payload.title; payload.notes = payload.summary; }
  if (payload.type === "report") { payload.report_title = payload.title; payload.summary = payload.summary; }
  if (payload.type === "export") payload.export_title = payload.title;
  return payload;
}
async function createElement(event) {
  event.preventDefault();
  const statusEl = modalForm.querySelector("[data-impact-modal-status]");
  const payload = normalizePayload(Object.fromEntries(new FormData(modalForm)));
  try { statusEl.hidden = false; statusEl.textContent = "Creation..."; await api("/api/admin-impact", { method: "POST", body: JSON.stringify(payload) }); closeModal(); modalForm.reset(); updateModalFields(); await loadItems(); notify("Element impact cree.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); }
}
async function saveElement(form) {
  const statusEl = form.querySelector("[data-impact-save-status]");
  const payload = Object.fromEntries(new FormData(form));
  try { statusEl.hidden = false; statusEl.textContent = "Enregistrement..."; await api("/api/admin-impact", { method: "PATCH", body: JSON.stringify(payload) }); await loadItems(); notify("Element impact enregistre.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); }
}
async function generateReport() {
  await api("/api/admin-impact", { method: "POST", body: JSON.stringify({ type: "generate_report", report_title: "Bilan impact TVF" }) });
  currentView = "reports";
  selectedId = null;
  await loadItems();
  notify("Bilan impact genere.", "success");
}
function exportCsv() {
  if (!items().length) return notify("Aucun element a exporter.", "warning");
  const headers = ["Vue", "Titre", "Type", "Statut", "Score", "Date"];
  const rows = items().map((item) => [viewLabels[currentView], itemTitle(item), itemType(item), itemStatus(item), item.assistant?.reliability_score ?? item.value_numeric ?? "", item.updated_at || item.created_at || ""]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `impact-tvf-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify("Export impact prepare.", "success");
}
function openModal() { if (modal) modal.hidden = false; updateModalFields(); modalForm?.querySelector("input, select, textarea")?.focus(); }
function closeModal() { if (modal) modal.hidden = true; }
function updateModalFields() { const selected = entitySelect?.value || "metric"; modalForm?.querySelectorAll("[class*='impact-field-']").forEach((field) => { field.hidden = !field.classList.contains(`impact-field-${selected}`); }); }
function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadItems(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); } });
  tabs.forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.impactView; selectedId = null; loadItems().catch((error) => notifyError(error)); }));
  controlEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-impact-flow-view]"); if (!button) return; currentView = button.dataset.impactFlowView || "metrics"; selectedId = null; loadItems().catch((error) => notifyError(error)); });
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadItems().catch((error) => notifyError(error)), 280); });
  filtersForm?.addEventListener("change", () => loadItems().catch((error) => notifyError(error)));
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-item-id]"); if (!button) return; selectedId = button.dataset.itemId; renderAll(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-impact-detail-form]"); if (!form) return; event.preventDefault(); saveElement(form); });
  detailEl?.addEventListener("click", (event) => { if (!event.target.closest("[data-impact-archive]")) return; const form = detailEl.querySelector("[data-impact-detail-form]"); if (!form) return; if (form.status) form.status.value = "archive"; saveElement(form); });
  createButton?.addEventListener("click", openModal);
  reportButton?.addEventListener("click", () => generateReport().catch((error) => notifyError(error)));
  refreshButton?.addEventListener("click", () => loadItems().catch((error) => notifyError(error)));
  exportButton?.addEventListener("click", exportCsv);
  logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; });
  closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  entitySelect?.addEventListener("change", updateModalFields);
  modalForm?.addEventListener("submit", createElement);
}

bindEvents();
updateModalFields();
if (token()) { showApp(); loadItems().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); }); } else { showLogin(); }
