const FIN_TOKEN_KEY = "tvfAdminToken";
const viewLabels = { budgets: "Budgets", expenses: "Depenses", funders: "Financeurs", opportunities: "Appels a projets", applications: "Demandes", payments: "Paiements", reports: "Reporting" };
const typeMaps = {
  budgets: { project: "Projet", branch: "Antenne", national: "National", action: "Action", grant: "Subvention" },
  opportunities: { grant: "Subvention", sponsorship: "Mecenat", call_for_projects: "Appel a projets", donation: "Don", public_subsidy: "Aide publique", loan: "Pret", other: "Autre" },
  funders: { public: "Public", private: "Prive", foundation: "Fondation", corporate: "Entreprise", individual: "Particulier", institution: "Institution", other: "Autre" },
  reports: { funder_report: "Financeur", budget_review: "Revue budget", expense_summary: "Depenses", grant_report: "Subvention" },
  expenses: {},
  applications: {},
  payments: {}
};
const statusMaps = {
  budgets: { draft: "Brouillon", active: "Actif", to_review: "A reviser", closed: "Clos", archive: "Archive" },
  expenses: { draft: "Brouillon", to_approve: "A approuver", approved: "Approuvee", paid: "Payee", rejected: "Rejetee", archive: "Archive" },
  funders: { prospect: "Prospect", active: "Actif", paused: "Suspendu", archive: "Archive" },
  opportunities: { veille: "Veille", a_qualifier: "A qualifier", eligible: "Eligible", candidature: "Candidature", en_attente: "En attente", accepte: "Accepte", refuse: "Refuse", archive: "Archive" },
  applications: { brouillon: "Brouillon", a_deposer: "A deposer", deposee: "Deposee", en_instruction: "En instruction", acceptee: "Acceptee", refusee: "Refusee", archive: "Archive" },
  payments: { pending: "En attente", succeeded: "Reussi", failed: "Echoue", refunded: "Rembourse", cancelled: "Annule" },
  reports: { draft: "Brouillon", to_send: "A transmettre", sent: "Transmis", validated: "Valide", archive: "Archive" }
};
const riskLabels = { faible: "Faible", modere: "Modere", eleve: "Eleve", critique: "Critique" };

const loginSection = document.querySelector("[data-finances-login]");
const appSection = document.querySelector("[data-finances-app]");
const tokenForm = document.querySelector("[data-finances-token-form]");
const loginStatus = document.querySelector("[data-finances-login-status]");
const filtersForm = document.querySelector("[data-finances-filters]");
const typeFilter = document.querySelector("[data-finances-type-filter]");
const statusFilter = document.querySelector("[data-finances-status-filter]");
const kpisEl = document.querySelector("[data-finances-kpis]");
const controlEl = document.querySelector("[data-finances-control]");
const listEl = document.querySelector("[data-finances-list]");
const detailEl = document.querySelector("[data-finances-detail]");
const countEl = document.querySelector("[data-finances-count]");
const emptyEl = document.querySelector("[data-finances-empty]");
const aiScoreEl = document.querySelector("[data-finances-ai-score]");
const aiSummaryEl = document.querySelector("[data-finances-ai-summary]");
const aiGridEl = document.querySelector("[data-finances-ai-grid]");
const tabs = document.querySelectorAll("[data-finances-view]");
const createButton = document.querySelector("[data-finances-create]");
const reportButton = document.querySelector("[data-finances-report]");
const refreshButton = document.querySelector("[data-finances-refresh]");
const exportButton = document.querySelector("[data-finances-export]");
const logoutButton = document.querySelector("[data-finances-logout]");
const modal = document.querySelector("[data-finances-modal]");
const modalForm = document.querySelector("[data-finances-form]");
const entitySelect = document.querySelector("[data-finances-entity-select]");
const closeModalButtons = document.querySelectorAll("[data-finances-close-modal]");

let currentView = "budgets";
let dashboard = null;
let data = { budgets: [], expenses: [], funders: [], opportunities: [], applications: [], payments: [], reports: [] };
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(FIN_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(FIN_TOKEN_KEY, value); else sessionStorage.removeItem(FIN_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function money(value) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(value || 0)); }
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
  ["q", "type", "status"].forEach((name) => {
    const value = String(formData.get(name) || "").trim();
    if (value) params.set(name, value);
  });
  return params;
}
async function loadItems() {
  if (countEl) countEl.textContent = "Chargement des finances...";
  const [overview, result] = await Promise.all([
    api("/api/admin-finances?entity=dashboard").catch(() => ({ dashboard: dashboard || {} })),
    api(`/api/admin-finances?${filtersParams().toString()}`)
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
function renderTabs() { tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.financesView === currentView)); }
function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `<article><span>Budgets</span><strong>${dashboard.budgets_total || 0}</strong><small>${dashboard.active_budgets || 0} actifs</small></article><article><span>Depenses</span><strong>${money(dashboard.spent_amount || 0)}</strong><small>${dashboard.execution_ratio || 0}% execute</small></article><article data-tone="warning"><span>A approuver</span><strong>${dashboard.expenses_to_approve || 0}</strong><small>Depenses</small></article><article data-tone="danger"><span>Justificatifs</span><strong>${dashboard.missing_receipts || 0}</strong><small>Manquants</small></article><article data-tone="info"><span>Financements</span><strong>${money(dashboard.funding_granted || 0)}</strong><small>Confirmes</small></article>`;
}
function renderControlPanel() {
  if (!controlEl || !dashboard) return;
  const toApprove = Number(dashboard.expenses_to_approve || 0);
  const missingReceipts = Number(dashboard.missing_receipts || 0);
  const reportsDue = Number(dashboard.reports_due || 0);
  const execution = Number(dashboard.execution_ratio || 0);
  const granted = Number(dashboard.funding_granted || 0);
  const nextDecision = missingReceipts ? "Completer les justificatifs" : toApprove ? "Arbitrer les depenses" : reportsDue ? "Preparer les reportings" : granted ? "Suivre les financements" : "Qualifier les financeurs";
  const status = missingReceipts || toApprove ? "Controle requis" : execution > 85 ? "Budget a surveiller" : "Pilotage stable";
  controlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Decision financiere</p><h3>Relier besoins, budgets et preuves</h3><p>Cette synthese aide a savoir ce qui peut etre engage, finance ou presente a un financeur sans perdre les justificatifs.</p></div><strong>${escapeHtml(status)}</strong></div><div class="finances-control-grid"><article><span>Decision suivante</span><strong>${escapeHtml(nextDecision)}</strong><small>priorite immediate</small></article><article><span>Execution</span><strong>${escapeHtml(execution)}%</strong><small>budget consomme</small></article><article><span>A approuver</span><strong>${escapeHtml(toApprove)}</strong><small>depenses</small></article><article><span>Justificatifs</span><strong>${escapeHtml(missingReceipts)}</strong><small>pieces manquantes</small></article><article><span>Finance confirme</span><strong>${money(granted)}</strong><small>accorde</small></article></div><div class="finances-control-links"><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-impact">Impact</a><a class="btn secondary" href="admin-documents">Justificatifs</a><a class="btn secondary" href="admin-crm">Financeurs</a><a class="btn secondary" href="admin-governance">Decision</a></div>`;
}function renderAssistant() {
  const item = selectedItem();
  const assistant = item?.assistant || {};
  if (aiScoreEl) aiScoreEl.textContent = `${dashboard?.execution_ratio || assistant.execution_ratio || 0}%`;
  if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || `${items().length} element(s) dans la vue ${viewLabels[currentView]}.`;
  if (!aiGridEl) return;
  aiGridEl.innerHTML = `<div><span>Budget prevu</span><strong>${money(dashboard?.planned_expenses || 0)}</strong></div><div><span>Depense</span><strong>${money(dashboard?.spent_amount || 0)}</strong></div><div><span>Justificatifs</span><strong>${dashboard?.missing_receipts || 0}</strong></div><div><span>Reporting</span><strong>${dashboard?.reports_due || 0}</strong></div>`;
}
function itemTitle(item) { return item.budget_name || item.label || item.funder_name || item.title || item.application_title || item.report_title || item.provider_payment_id || "Element financier"; }
function itemStatus(item) { const key = currentView === "payments" ? item.payment_status : item.status; return label(statusMaps[currentView] || {}, key); }
function itemType(item) {
  if (currentView === "budgets") return label(typeMaps.budgets, item.budget_type);
  if (currentView === "opportunities") return label(typeMaps.opportunities, item.opportunity_type);
  if (currentView === "funders") return label(typeMaps.funders, item.funder_type);
  if (currentView === "reports") return label(typeMaps.reports, item.report_type);
  return viewLabels[currentView];
}
function itemAmount(item) { return item.planned_expenses ?? item.amount ?? item.requested_amount ?? item.granted_amount ?? item.amount_max ?? ""; }
function itemCard(item) {
  const amount = itemAmount(item);
  const tone = item.assistant?.alerts?.length || item.assistant?.requires_receipt ? " is-risk" : "";
  return `<button class="admin-request finances-card${item.id === selectedId ? " is-active" : ""}${tone}" type="button" data-item-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(itemType(item))}</strong><small>${escapeHtml(itemStatus(item))}</small></span><span>${escapeHtml(itemTitle(item))}</span><span class="admin-request-sub">${escapeHtml(item.territory_label || item.vendor_name || item.owner_name || formatDate(item.deadline_at || item.due_at || item.updated_at))}</span><span class="admin-badges"><em data-kind="priority">${amount !== "" ? escapeHtml(money(amount)) : "Suivi"}</em><em data-kind="category">${escapeHtml(formatDate(item.updated_at || item.created_at))}</em></span></button>`;
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
  const renderers = { budgets: budgetDetail, expenses: expenseDetail, funders: funderDetail, opportunities: opportunityDetail, applications: applicationDetail, payments: paymentDetail, reports: reportDetail };
  detailEl.innerHTML = renderers[currentView](item);
}
function headerDetail(item, type) { return `<input type="hidden" name="id" value="${escapeHtml(item.id)}"><input type="hidden" name="type" value="${type}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(itemType(item))}</p><h3>${escapeHtml(itemTitle(item))}</h3><p>${escapeHtml(itemStatus(item))}</p></div>`; }
function actions() { return `<div class="admin-detail-actions finances-wide-field"><button class="btn primary" type="submit">Enregistrer</button><button class="btn ghost" type="button" data-finances-archive>Archiver</button></div><p class="form-note finances-wide-field" data-finances-save-status hidden></p>`; }
function budgetDetail(item) {
  const a = item.assistant || {};
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "budget")}<div class="admin-meta-grid"><div><span>Prevues</span><strong>${money(a.planned_expenses || item.planned_expenses)}</strong></div><div><span>Depense</span><strong>${money(a.spent_amount || item.spent_amount)}</strong></div><div><span>Reste</span><strong>${money(a.remaining_amount || 0)}</strong></div><div><span>Risque</span><strong>${escapeHtml(label(riskLabels, a.risk_level || item.risk_level))}</strong></div></div><section class="admin-ai-panel finances-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant finance</p><h4>Controle budget</h4></div><strong>${escapeHtml(String(a.execution_ratio || 0))}%</strong></div><p>${escapeHtml(a.summary || "Budget a completer.")}</p><div class="admin-missing-pieces"><span>Alertes</span>${a.alerts?.length ? `<ul>${a.alerts.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : "<p>Aucune alerte budgetaire.</p>"}</div></section><label>Nom<input name="budget_name" value="${escapeHtml(item.budget_name || "")}"></label><label>Type<select name="budget_type">${optionList(typeMaps.budgets, item.budget_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.budgets, item.status)}</select></label><label>Risque<select name="risk_level">${optionList(riskLabels, item.risk_level)}</select></label><label>Recettes prevues<input name="planned_income" value="${escapeHtml(item.planned_income ?? 0)}"></label><label>Depenses prevues<input name="planned_expenses" value="${escapeHtml(item.planned_expenses ?? 0)}"></label><label>Recettes confirmees<input name="confirmed_income" value="${escapeHtml(item.confirmed_income ?? 0)}"></label><label>Depenses engagees<input name="committed_expenses" value="${escapeHtml(item.committed_expenses ?? 0)}"></label><label class="finances-wide-field">Restrictions<textarea name="restrictions" rows="3">${escapeHtml(item.restrictions || "")}</textarea></label>${actions()}</form>`;
}
function expenseDetail(item) {
  const a = item.assistant || {};
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "expense")}<div class="admin-meta-grid"><div><span>Montant</span><strong>${money(item.amount)}</strong></div><div><span>Justificatif</span><strong>${item.receipt_document_id ? "Oui" : "Manquant"}</strong></div><div><span>Date</span><strong>${escapeHtml(formatDate(item.expense_date))}</strong></div><div><span>Statut suggere</span><strong>${escapeHtml(label(statusMaps.expenses, a.suggested_status))}</strong></div></div><section class="admin-ai-panel finances-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant finance</p><h4>Controle depense</h4></div><strong>${a.requires_receipt ? "!" : "OK"}</strong></div><p>${escapeHtml(a.summary || "Depense a verifier.")}</p></section><label>Libelle<input name="label" value="${escapeHtml(item.label || "")}"></label><label>Fournisseur<input name="vendor_name" value="${escapeHtml(item.vendor_name || "")}"></label><label>Montant<input name="amount" value="${escapeHtml(item.amount ?? 0)}"></label><label>Statut<select name="status">${optionList(statusMaps.expenses, item.status)}</select></label><label>Date<input name="expense_date" type="date" value="${escapeHtml((item.expense_date || "").slice(0, 10))}"></label><label>Mode paiement<input name="payment_method" value="${escapeHtml(item.payment_method || "")}"></label><label class="finances-wide-field">Notes<textarea name="notes" rows="4">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function funderDetail(item) {
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "funder")}<label>Nom<input name="funder_name" value="${escapeHtml(item.funder_name || "")}"></label><label>Type<select name="funder_type">${optionList(typeMaps.funders, item.funder_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.funders, item.status)}</select></label><label>Priorite<select name="priority_level">${optionList({ faible: "Faible", moyen: "Moyen", fort: "Fort", critique: "Critique" }, item.priority_level)}</select></label><label>Email<input name="contact_email" value="${escapeHtml(item.contact_email || "")}"></label><label>Site<input name="website" value="${escapeHtml(item.website || "")}"></label><label class="finances-wide-field">Notes<textarea name="notes" rows="5">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function opportunityDetail(item) {
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "opportunity")}<div class="admin-meta-grid"><div><span>Score</span><strong>${escapeHtml(String(item.priority_score || 0))}</strong></div><div><span>Min</span><strong>${money(item.amount_min)}</strong></div><div><span>Max</span><strong>${money(item.amount_max)}</strong></div><div><span>Echeance</span><strong>${escapeHtml(formatDate(item.deadline_at))}</strong></div></div><label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Type<select name="opportunity_type">${optionList(typeMaps.opportunities, item.opportunity_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.opportunities, item.status)}</select></label><label>Echeance<input name="deadline_at" type="date" value="${escapeHtml((item.deadline_at || "").slice(0, 10))}"></label><label>Montant min<input name="amount_min" value="${escapeHtml(item.amount_min ?? "")}"></label><label>Montant max<input name="amount_max" value="${escapeHtml(item.amount_max ?? "")}"></label><label class="finances-wide-field">Eligibilite<textarea name="eligibility_notes" rows="4">${escapeHtml(item.eligibility_notes || "")}</textarea></label><label class="finances-wide-field">Restrictions<textarea name="restrictions" rows="3">${escapeHtml(item.restrictions || "")}</textarea></label>${actions()}</form>`;
}
function applicationDetail(item) {
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "application")}<div class="admin-meta-grid"><div><span>Demande</span><strong>${money(item.requested_amount)}</strong></div><div><span>Accorde</span><strong>${money(item.granted_amount)}</strong></div><div><span>Depot</span><strong>${escapeHtml(formatDate(item.deadline_at))}</strong></div><div><span>Reporting</span><strong>${escapeHtml(formatDate(item.reporting_due_at))}</strong></div></div><label>Titre<input name="application_title" value="${escapeHtml(item.application_title || "")}"></label><label>Statut<select name="status">${optionList(statusMaps.applications, item.status)}</select></label><label>Montant demande<input name="requested_amount" value="${escapeHtml(item.requested_amount ?? 0)}"></label><label>Montant accorde<input name="granted_amount" value="${escapeHtml(item.granted_amount ?? "")}"></label><label>Responsable<input name="owner_name" value="${escapeHtml(item.owner_name || "")}"></label><label>Reporting du<input name="reporting_due_at" type="date" value="${escapeHtml((item.reporting_due_at || "").slice(0, 10))}"></label><label class="finances-wide-field">Notes<textarea name="notes" rows="5">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function paymentDetail(item) {
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "payment")}<label>Fournisseur<input name="provider" value="${escapeHtml(item.provider || "manual")}"></label><label>Reference<input name="provider_payment_id" value="${escapeHtml(item.provider_payment_id || "")}"></label><label>Montant<input name="amount" value="${escapeHtml(item.amount ?? 0)}"></label><label>Statut<select name="payment_status">${optionList(statusMaps.payments, item.payment_status)}</select></label><label>Date paiement<input name="paid_at" type="date" value="${escapeHtml((item.paid_at || "").slice(0, 10))}"></label><label class="finances-wide-field">Notes<textarea name="notes" rows="4">${escapeHtml(item.notes || "")}</textarea></label>${actions()}</form>`;
}
function reportDetail(item) {
  const a = item.assistant || {};
  return `<form class="admin-detail-form finances-detail-form" data-finances-detail-form>${headerDetail(item, "report")}<section class="admin-ai-panel finances-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant reporting</p><h4>Pieces financeur</h4></div><strong>${a.missing_documents?.length || 0}</strong></div><p>${escapeHtml(a.summary || "Reporting a verifier.")}</p></section><label>Titre<input name="report_title" value="${escapeHtml(item.report_title || "")}"></label><label>Type<select name="report_type">${optionList(typeMaps.reports, item.report_type)}</select></label><label>Statut<select name="status">${optionList(statusMaps.reports, item.status)}</select></label><label>Echeance<input name="due_at" type="date" value="${escapeHtml((item.due_at || "").slice(0, 10))}"></label><label class="finances-wide-field">Synthese<textarea name="summary" rows="5">${escapeHtml(item.summary || "")}</textarea></label><label class="finances-wide-field">Pieces requises<textarea name="required_documents" rows="3">${escapeHtml(arrayText(item.required_documents))}</textarea></label><label class="finances-wide-field">Pieces manquantes<textarea name="missing_documents" rows="3">${escapeHtml(arrayText(item.missing_documents))}</textarea></label>${actions()}</form>`;
}
function normalizePayload(raw) {
  const payload = { ...raw };
  if (payload.budget_status) payload.status = payload.budget_status;
  if (payload.expense_status) payload.status = payload.expense_status;
  if (payload.type === "budget") payload.budget_name = payload.title;
  if (payload.type === "expense") payload.label = payload.title;
  if (payload.type === "funder") { payload.funder_name = payload.title; payload.notes = payload.summary; }
  if (payload.type === "opportunity") { payload.title = payload.title; payload.eligibility_notes = payload.summary; }
  if (payload.type === "application") { payload.application_title = payload.title; payload.notes = payload.summary; }
  if (payload.type === "report") { payload.report_title = payload.title; payload.summary = payload.summary; }
  return payload;
}
async function createElement(event) {
  event.preventDefault();
  const statusEl = modalForm.querySelector("[data-finances-modal-status]");
  const payload = normalizePayload(Object.fromEntries(new FormData(modalForm)));
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Creation...";
    await api("/api/admin-finances", { method: "POST", body: JSON.stringify(payload) });
    closeModal();
    modalForm.reset();
    updateModalFields();
    await loadItems();
    notify("Element financier cree.", "success");
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
    notifyError(error);
  }
}
async function saveElement(form) {
  const statusEl = form.querySelector("[data-finances-save-status]");
  const payload = Object.fromEntries(new FormData(form));
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Enregistrement...";
    await api("/api/admin-finances", { method: "PATCH", body: JSON.stringify(payload) });
    await loadItems();
    notify("Element financier enregistre.", "success");
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
    notifyError(error);
  }
}
async function generateReport() {
  const item = selectedItem();
  const body = { type: "generate_report", report_title: "Reporting financeur TVF" };
  if (currentView === "budgets") body.budget_id = item?.id;
  if (currentView === "applications") body.application_id = item?.id;
  await api("/api/admin-finances", { method: "POST", body: JSON.stringify(body) });
  currentView = "reports";
  selectedId = null;
  await loadItems();
  notify("Reporting financeur genere.", "success");
}
function exportCsv() {
  if (!items().length) return notify("Aucun element a exporter.", "warning");
  const headers = ["Vue", "Titre", "Type", "Statut", "Montant", "Date"];
  const rows = items().map((item) => [viewLabels[currentView], itemTitle(item), itemType(item), itemStatus(item), itemAmount(item), item.updated_at || item.created_at || ""]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finances-tvf-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify("Export finances prepare.", "success");
}
function openModal() { if (modal) modal.hidden = false; updateModalFields(); modalForm?.querySelector("input, select, textarea")?.focus(); }
function closeModal() { if (modal) modal.hidden = true; }
function updateModalFields() {
  const selected = entitySelect?.value || "budget";
  modalForm?.querySelectorAll("[class*='finances-field-']").forEach((field) => { field.hidden = !field.classList.contains(`finances-field-${selected}`); });
}
function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = String(new FormData(tokenForm).get("token") || "").trim();
    if (!value) return setStatus("Entrez le token admin.", "error");
    setToken(value);
    try { showApp(); await loadItems(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); }
  });
  tabs.forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.financesView; selectedId = null; loadItems().catch((error) => notifyError(error)); }));
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadItems().catch((error) => notifyError(error)), 280); });
  filtersForm?.addEventListener("change", () => loadItems().catch((error) => notifyError(error)));
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-item-id]"); if (!button) return; selectedId = button.dataset.itemId; renderAll(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-finances-detail-form]"); if (!form) return; event.preventDefault(); saveElement(form); });
  detailEl?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-finances-archive]")) return;
    const form = detailEl.querySelector("[data-finances-detail-form]");
    if (!form) return;
    if (form.status) form.status.value = "archive";
    if (form.payment_status) form.payment_status.value = "cancelled";
    saveElement(form);
  });
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
if (token()) {
  showApp();
  loadItems().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); });
} else {
  showLogin();
}
