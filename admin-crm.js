const CRM_TOKEN_KEY = "tvfAdminToken";
const contactTypeLabels = {
  proprietaire: "Proprietaire",
  elu: "Elu",
  technicien: "Technicien",
  entreprise_contact: "Entreprise",
  benevole: "Benevole",
  financeur: "Financeur",
  journaliste: "Journaliste",
  citoyen: "Citoyen",
  partenaire: "Partenaire",
  autre: "Autre",
};
const consentLabels = {
  unknown: "Inconnu",
  pending: "A demander",
  granted: "Accorde",
  refused: "Refuse",
  expired: "Expire",
};
const confidentialityLabels = {
  public: "Public",
  standard: "Standard",
  confidentiel: "Confidentiel",
  sensible: "Sensible",
};
const organizationTypeLabels = {
  collectivite: "Collectivite",
  entreprise: "Entreprise",
  association: "Association",
  financeur: "Financeur",
  institution: "Institution",
  media: "Media",
  proprietaire_personne_morale: "Proprietaire moral",
  partenaire: "Partenaire",
  fournisseur: "Fournisseur",
  autre: "Autre",
};
const relationLabels = {
  prospect: "Prospect",
  actif: "Actif",
  conventionne: "Conventionne",
  ancien: "Ancien",
  sensible: "Sensible",
};
const historyLabels = {
  note: "Note",
  email: "E-mail",
  appel: "Appel",
  rendez_vous: "Rendez-vous",
  document: "Document",
  demande: "Demande",
  relance: "Relance",
  decision: "Decision",
};

const loginSection = document.querySelector("[data-crm-login]");
const appSection = document.querySelector("[data-crm-app]");
const tokenForm = document.querySelector("[data-crm-token-form]");
const loginStatus = document.querySelector("[data-crm-login-status]");
const filtersForm = document.querySelector("[data-crm-filters]");
const listEl = document.querySelector("[data-crm-list]");
const detailEl = document.querySelector("[data-crm-detail]");
const countEl = document.querySelector("[data-crm-count]");
const emptyEl = document.querySelector("[data-crm-empty]");
const kpisEl = document.querySelector("[data-crm-kpis]");
const refreshButton = document.querySelector("[data-crm-refresh]");
const logoutButton = document.querySelector("[data-crm-logout]");
const exportButton = document.querySelector("[data-crm-export]");
const createContactButton = document.querySelector("[data-crm-create-contact]");
const createOrganizationButton = document.querySelector("[data-crm-create-organization]");
const viewButtons = document.querySelectorAll("[data-crm-view]");
const contactFilters = document.querySelectorAll("[data-contact-filter]");
const organizationFilters = document.querySelectorAll("[data-organization-filter]");
const modal = document.querySelector("[data-crm-modal]");
const modalForm = document.querySelector("[data-crm-form]");
const modalTitle = document.querySelector("[data-crm-modal-title]");
const modalKicker = document.querySelector("[data-crm-modal-kicker]");
const closeModalButton = document.querySelector("[data-crm-close-modal]");

let currentView = "contacts";
let contacts = [];
let organizations = [];
let duplicates = [];
let history = [];
let selectedId = null;
let dashboard = null;
let modalType = "contact";
let debounceTimer;

function token() {
  try { return sessionStorage.getItem(CRM_TOKEN_KEY) || ""; } catch { return ""; }
}

function setToken(value) {
  try {
    if (value) sessionStorage.setItem(CRM_TOKEN_KEY, value);
    else sessionStorage.removeItem(CRM_TOKEN_KEY);
  } catch {}
}

function setStatus(message, type = "info") {
  if (!loginStatus) return;
  loginStatus.hidden = !message;
  loginStatus.textContent = message;
  loginStatus.dataset.status = type;
}

function showApp() {
  if (loginSection) loginSection.hidden = true;
  if (appSection) appSection.hidden = false;
}

function showLogin() {
  if (loginSection) loginSection.hidden = false;
  if (appSection) appSection.hidden = true;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function label(map, value) {
  return map[value] || value || "Non renseigne";
}

function formatDate(value) {
  if (!value) return "Non renseigne";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) {
    const error = new Error(result.error || "Action impossible.");
    error.status = response.status;
    error.code = result.code;
    throw error;
  }
  return result;
}

function filtersParams() {
  const data = new FormData(filtersForm);
  const params = new URLSearchParams();
  params.set("entity", currentView === "organizations" ? "organizations" : currentView === "duplicates" ? "duplicates" : "contacts");
  params.set("limit", "120");
  ["q", "contact_type", "consent_status", "organization_type", "relation_status"].forEach((name) => {
    const value = String(data.get(name) || "").trim();
    if (value) params.set(name, value);
  });
  return params;
}

async function loadDashboard() {
  const result = await api("/api/admin-crm?entity=dashboard");
  dashboard = result.dashboard || {};
  renderKpis();
}

async function loadCurrent() {
  if (countEl) countEl.textContent = "Chargement du CRM...";
  updateViewUi();
  const result = await api(`/api/admin-crm?${filtersParams().toString()}`);
  if (currentView === "contacts") {
    contacts = result.contacts || [];
    if (!contacts.some((item) => item.id === selectedId)) selectedId = contacts[0]?.id || null;
  } else if (currentView === "organizations") {
    organizations = result.organizations || [];
    if (!organizations.some((item) => item.id === selectedId)) selectedId = organizations[0]?.id || null;
  } else {
    duplicates = result.duplicates || [];
    selectedId = duplicates[0]?.id || null;
  }
  await loadDashboard().catch(() => {});
  renderList();
  await renderDetail();
}

function updateViewUi() {
  viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.crmView === currentView));
  contactFilters.forEach((item) => { item.hidden = currentView !== "contacts"; });
  organizationFilters.forEach((item) => { item.hidden = currentView !== "organizations"; });
  if (filtersForm) filtersForm.hidden = currentView === "duplicates";
}

function renderKpis() {
  if (!kpisEl || !dashboard) return;
  kpisEl.innerHTML = `
    <article><span>Contacts</span><strong>${escapeHtml(dashboard.contacts_total || 0)}</strong><small>Personnes actives</small></article>
    <article><span>Organisations</span><strong>${escapeHtml(dashboard.organizations_total || 0)}</strong><small>Structures suivies</small></article>
    <article data-tone="warning"><span>Consentements</span><strong>${escapeHtml(dashboard.consent_missing || 0)}</strong><small>A verifier</small></article>
    <article data-tone="danger"><span>Relances</span><strong>${escapeHtml(dashboard.overdue_actions || 0)}</strong><small>En retard</small></article>
    <article data-tone="info"><span>Doublons</span><strong>${escapeHtml(dashboard.duplicates_pending || 0)}</strong><small>A verifier</small></article>`;
}

function currentItems() {
  if (currentView === "organizations") return organizations;
  if (currentView === "duplicates") return duplicates;
  return contacts;
}

function selectedItem() {
  return currentItems().find((item) => item.id === selectedId) || null;
}

function renderList() {
  if (!listEl) return;
  const items = currentItems();
  listEl.innerHTML = items.map((item) => {
    const active = item.id === selectedId ? " is-active" : "";
    if (currentView === "organizations") {
      return `<button class="admin-request crm-card${active}" type="button" data-crm-id="${escapeHtml(item.id)}">
        <span class="admin-request-head"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(label(relationLabels, item.relation_status))}</small></span>
        <span>${escapeHtml(label(organizationTypeLabels, item.organization_type))} - ${escapeHtml(item.city || item.department || item.region || "Territoire non renseigne")}</span>
        <span class="admin-badges"><em data-kind="category">${escapeHtml(label(organizationTypeLabels, item.organization_type))}</em><em data-kind="status">${escapeHtml(label(confidentialityLabels, item.confidentiality_level))}</em></span>
      </button>`;
    }
    if (currentView === "duplicates") {
      return `<button class="admin-request crm-card${active}" type="button" data-crm-id="${escapeHtml(item.id)}">
        <span class="admin-request-head"><strong>${escapeHtml(item.entity_type || "Doublon")}</strong><small>${escapeHtml(String(Math.round((item.confidence || 0) * 100)))}%</small></span>
        <span>${escapeHtml(item.reason || "Suggestion a verifier")}</span>
        <span class="admin-badges"><em data-kind="priority">${escapeHtml(item.status || "pending")}</em></span>
      </button>`;
    }
    return `<button class="admin-request crm-card${active}" type="button" data-crm-id="${escapeHtml(item.id)}">
      <span class="admin-request-head"><strong>${escapeHtml(item.display_name)}</strong><small>${escapeHtml(label(consentLabels, item.consent_status))}</small></span>
      <span>${escapeHtml(item.email || item.phone || item.mobile || "Coordonnees a completer")}</span>
      <span class="admin-badges"><em data-kind="category">${escapeHtml(label(contactTypeLabels, item.contact_type))}</em><em data-kind="status">${escapeHtml(label(confidentialityLabels, item.confidentiality_level))}</em></span>
    </button>`;
  }).join("");
  if (emptyEl) emptyEl.hidden = items.length !== 0;
  if (countEl) countEl.textContent = `${items.length} element${items.length > 1 ? "s" : ""} affiche${items.length > 1 ? "s" : ""}`;
}

async function loadHistoryFor(item, type) {
  if (!item) return [];
  const params = new URLSearchParams({ entity: "history", limit: "40" });
  if (type === "contact") params.set("contact_id", item.id);
  else params.set("organization_id", item.id);
  const result = await api(`/api/admin-crm?${params.toString()}`);
  return result.history || [];
}

function assistantPanel(item, type) {
  const assistant = item?.assistant || {};
  const missing = assistant.missing_fields || [];
  return `<section class="admin-ai-panel crm-ai-panel">
    <div class="admin-panel-head">
      <div><p class="section-kicker">Assistant IA</p><h4>Synthese relationnelle</h4></div>
      <strong>${escapeHtml(String(missing.length ? "A faire" : "OK"))}</strong>
    </div>
    <p>${escapeHtml(assistant.summary || item.ai_summary || "Synthese indisponible.")}</p>
    <div class="admin-ai-grid">
      <div><span>Prochaine action</span><strong>${escapeHtml(item.next_action || assistant.next_action || "A definir")}</strong></div>
      <div><span>Echeance</span><strong>${escapeHtml(formatDate(item.next_action_due_at || assistant.next_action_due_at))}</strong></div>
      <div><span>Cle doublon</span><strong>${escapeHtml(item.duplicate_key || assistant.duplicate_key || "Non calculee")}</strong></div>
      <div><span>Type</span><strong>${escapeHtml(type === "contact" ? label(contactTypeLabels, item.contact_type) : label(organizationTypeLabels, item.organization_type))}</strong></div>
    </div>
    <div class="admin-missing-pieces"><span>Points a completer</span>${missing.length ? `<ul>${missing.map((field) => `<li>${escapeHtml(field)}</li>`).join("")}</ul>` : "<p>Fiche suffisamment qualifiee.</p>"}</div>
  </section>`;
}

function historyPanel(items) {
  return `<section class="crm-history-panel">
    <div class="admin-panel-head"><div><p class="section-kicker">Historique</p><h4>Echanges et notes</h4></div><button class="btn secondary" type="button" data-crm-add-history>Ajouter note</button></div>
    <div class="crm-history-list">${items.length ? items.map((item) => `<article><span>${escapeHtml(label(historyLabels, item.interaction_type))} - ${escapeHtml(formatDate(item.occurred_at))}</span><strong>${escapeHtml(item.subject)}</strong><p>${escapeHtml(item.summary || "")}</p></article>`).join("") : "<p>Aucun historique pour le moment.</p>"}</div>
  </section>`;
}

async function renderDetail() {
  if (!detailEl) return;
  const item = selectedItem();
  if (!item) {
    detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez une fiche</h3><p>Aucun element disponible.</p></div>`;
    return;
  }
  if (currentView === "duplicates") {
    detailEl.innerHTML = `<div class="admin-detail-form">
      <div class="admin-detail-title"><p class="section-kicker">Doublon a verifier</p><h3>${escapeHtml(item.entity_type || "Suggestion")}</h3><p>${escapeHtml(item.reason || "A verifier")}</p></div>
      <div class="admin-meta-grid"><div><span>Confiance</span><strong>${escapeHtml(String(Math.round((item.confidence || 0) * 100)))}%</strong></div><div><span>Statut</span><strong>${escapeHtml(item.status)}</strong></div></div>
      <div class="admin-detail-actions"><button class="btn secondary" type="button" data-crm-duplicate-status="ignored">Ignorer</button><button class="btn primary" type="button" data-crm-duplicate-status="confirmed">Confirmer</button></div>
    </div>`;
    return;
  }
  const type = currentView === "organizations" ? "organization" : "contact";
  history = await loadHistoryFor(item, type).catch(() => []);
  if (type === "organization") renderOrganizationDetail(item, history);
  else renderContactDetail(item, history);
}

function renderContactDetail(item, historyItems) {
  const orgs = item.organization_contacts || [];
  detailEl.innerHTML = `<form class="admin-detail-form crm-detail-form" data-crm-detail-form data-type="contact">
    <input type="hidden" name="id" value="${escapeHtml(item.id)}">
    <div class="admin-detail-title"><p class="section-kicker">Fiche contact</p><h3>${escapeHtml(item.display_name)}</h3><p>${escapeHtml(item.email || item.phone || "Coordonnees a completer")}</p></div>
    <div class="admin-meta-grid"><div><span>E-mail</span><a href="mailto:${escapeHtml(item.email || "")}">${escapeHtml(item.email || "Non renseigne")}</a></div><div><span>Telephone</span><strong>${escapeHtml(item.phone || item.mobile || "Non renseigne")}</strong></div><div><span>Consentement</span><strong>${escapeHtml(label(consentLabels, item.consent_status))}</strong></div><div><span>Dernier echange</span><strong>${escapeHtml(formatDate(item.last_interaction_at))}</strong></div></div>
    ${assistantPanel(item, "contact")}
    <label>Nom affiche<input name="display_name" value="${escapeHtml(item.display_name || "")}"></label>
    <label>Type contact<select name="contact_type">${options(contactTypeLabels, item.contact_type)}</select></label>
    <label>Consentement RGPD<select name="consent_status">${options(consentLabels, item.consent_status)}</select></label>
    <label>Source consentement<input name="consent_source" value="${escapeHtml(item.consent_source || "")}" placeholder="Formulaire, e-mail, appel..."></label>
    <label>Niveau confidentialite<select name="confidentiality_level">${options(confidentialityLabels, item.confidentiality_level)}</select></label>
    <label>E-mail<input name="email" type="email" value="${escapeHtml(item.email || "")}"></label>
    <label>Telephone<input name="phone" value="${escapeHtml(item.phone || "")}"></label>
    <label>Mobile<input name="mobile" value="${escapeHtml(item.mobile || "")}"></label>
    <label>Prochaine action<input name="next_action" value="${escapeHtml(item.next_action || "")}"></label>
    <label>Echeance<input name="next_action_due_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.next_action_due_at))}"></label>
    <label class="crm-wide-field">Tags<textarea name="tags" rows="3">${escapeHtml((item.tags || []).join("\n"))}</textarea></label>
    <label class="crm-wide-field">Notes internes<textarea name="notes" rows="5">${escapeHtml(item.notes || "")}</textarea></label>
    <section class="crm-relations"><p class="section-kicker">Organisations rattachees</p>${orgs.length ? orgs.map((link) => `<article><strong>${escapeHtml(link.organizations?.name || "Organisation")}</strong><span>${escapeHtml(link.role_label || "Role non renseigne")}${link.is_primary ? " - principal" : ""}</span></article>`).join("") : "<p>Aucune organisation rattachee.</p>"}</section>
    ${historyPanel(historyItems)}
    <div class="admin-detail-actions"><button class="btn primary" type="submit">Enregistrer</button><a class="btn secondary" href="mailto:${escapeHtml(item.email || "")}">Ecrire</a><a class="btn secondary" href="tel:${escapeHtml(item.phone || item.mobile || "")}">Appeler</a></div>
    <p class="form-note" data-crm-save-status role="status" hidden></p>
  </form>`;
}

function renderOrganizationDetail(item, historyItems) {
  const links = item.organization_contacts || [];
  detailEl.innerHTML = `<form class="admin-detail-form crm-detail-form" data-crm-detail-form data-type="organization">
    <input type="hidden" name="id" value="${escapeHtml(item.id)}">
    <div class="admin-detail-title"><p class="section-kicker">Fiche organisation</p><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(label(organizationTypeLabels, item.organization_type))} - ${escapeHtml(label(relationLabels, item.relation_status))}</p></div>
    <div class="admin-meta-grid"><div><span>E-mail</span><a href="mailto:${escapeHtml(item.email || "")}">${escapeHtml(item.email || "Non renseigne")}</a></div><div><span>Telephone</span><strong>${escapeHtml(item.phone || "Non renseigne")}</strong></div><div><span>Territoire</span><strong>${escapeHtml(item.city || item.department || item.region || "Non renseigne")}</strong></div><div><span>Dernier echange</span><strong>${escapeHtml(formatDate(item.last_interaction_at))}</strong></div></div>
    ${assistantPanel(item, "organization")}
    <label>Nom organisation<input name="name" value="${escapeHtml(item.name || "")}"></label>
    <label>Type organisation<select name="organization_type">${options(organizationTypeLabels, item.organization_type)}</select></label>
    <label>Niveau relation<select name="relation_status">${options(relationLabels, item.relation_status)}</select></label>
    <label>Niveau confidentialite<select name="confidentiality_level">${options(confidentialityLabels, item.confidentiality_level)}</select></label>
    <label>SIRET<input name="siret" value="${escapeHtml(item.siret || "")}"></label>
    <label>Site web<input name="website" value="${escapeHtml(item.website || "")}"></label>
    <label>E-mail<input name="email" type="email" value="${escapeHtml(item.email || "")}"></label>
    <label>Telephone<input name="phone" value="${escapeHtml(item.phone || "")}"></label>
    <label>Ville<input name="city" value="${escapeHtml(item.city || "")}"></label>
    <label>Departement<input name="department" value="${escapeHtml(item.department || "")}"></label>
    <label>Region<input name="region" value="${escapeHtml(item.region || "")}"></label>
    <label>Prochaine action<input name="next_action" value="${escapeHtml(item.next_action || "")}"></label>
    <label>Echeance<input name="next_action_due_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.next_action_due_at))}"></label>
    <label class="crm-wide-field">Contributions possibles<textarea name="contribution_potential" rows="4">${escapeHtml(item.contribution_potential || "")}</textarea></label>
    <label class="crm-wide-field">Tags<textarea name="tags" rows="3">${escapeHtml((item.tags || []).join("\n"))}</textarea></label>
    <label class="crm-wide-field">Notes internes<textarea name="notes" rows="5">${escapeHtml(item.notes || "")}</textarea></label>
    <section class="crm-relations"><p class="section-kicker">Contacts associes</p>${links.length ? links.map((link) => `<article><strong>${escapeHtml(link.crm_contacts?.display_name || "Contact")}</strong><span>${escapeHtml(link.role_label || link.crm_contacts?.contact_type || "Role non renseigne")}${link.is_primary ? " - principal" : ""}</span></article>`).join("") : "<p>Aucun contact rattache.</p>"}</section>
    ${historyPanel(historyItems)}
    <div class="admin-detail-actions"><button class="btn primary" type="submit">Enregistrer</button><a class="btn secondary" href="mailto:${escapeHtml(item.email || "")}">Ecrire</a><button class="btn secondary" type="button" data-crm-create-linked-contact>Creer contact rattache</button></div>
    <p class="form-note" data-crm-save-status role="status" hidden></p>
  </form>`;
}

function options(map, selected) {
  return Object.entries(map).map(([value, text]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join("");
}

function csvCell(value) {
  const text = String(value || "").replace(/\r?\n|\r/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCsv() {
  const items = currentItems();
  if (!items.length) return alert("Aucune donnee a exporter.");
  const headers = currentView === "organizations" ? ["Nom", "Type", "Relation", "Email", "Telephone", "Ville", "Prochaine action"] : ["Nom", "Type", "Consentement", "Email", "Telephone", "Prochaine action"];
  const rows = currentView === "organizations"
    ? organizations.map((item) => [item.name, label(organizationTypeLabels, item.organization_type), label(relationLabels, item.relation_status), item.email, item.phone, item.city, item.next_action])
    : contacts.map((item) => [item.display_name, label(contactTypeLabels, item.contact_type), label(consentLabels, item.consent_status), item.email, item.phone || item.mobile, item.next_action]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `crm-tvf-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openModal(type, defaults = {}) {
  modalType = type;
  if (!modal || !modalForm) return;
  modal.hidden = false;
  modalTitle.textContent = type === "organization" ? "Nouvelle organisation" : type === "history" ? "Ajouter une note" : "Nouveau contact";
  modalKicker.textContent = type === "organization" ? "Organisation" : type === "history" ? "Historique" : "Contact";
  if (type === "organization") modalForm.innerHTML = organizationForm();
  else if (type === "history") modalForm.innerHTML = historyForm(defaults);
  else modalForm.innerHTML = contactForm(defaults);
  modalForm.querySelector("input, select, textarea")?.focus();
}

function closeModal() {
  if (modal) modal.hidden = true;
}

function contactForm(defaults = {}) {
  return `<label>Nom affiche<input name="display_name" value="${escapeHtml(defaults.display_name || "")}" required></label>
    <label>E-mail<input name="email" type="email" value="${escapeHtml(defaults.email || "")}"></label>
    <label>Telephone<input name="phone" value="${escapeHtml(defaults.phone || "")}"></label>
    <label>Type contact<select name="contact_type">${options(contactTypeLabels, defaults.contact_type || "autre")}</select></label>
    <label>Consentement<select name="consent_status">${options(consentLabels, defaults.consent_status || "unknown")}</select></label>
    <label>Confidentialite<select name="confidentiality_level">${options(confidentialityLabels, defaults.confidentiality_level || "standard")}</select></label>
    <label class="admin-create-wide">Notes<textarea name="notes" rows="5">${escapeHtml(defaults.notes || "")}</textarea></label>
    <div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">Creer</button><button class="btn secondary" type="button" data-crm-close-modal>Annuler</button></div><p class="form-note admin-create-wide" data-crm-modal-status hidden></p>`;
}

function organizationForm() {
  return `<label>Nom organisation<input name="name" required></label>
    <label>Type organisation<select name="organization_type">${options(organizationTypeLabels, "partenaire")}</select></label>
    <label>Niveau relation<select name="relation_status">${options(relationLabels, "prospect")}</select></label>
    <label>Confidentialite<select name="confidentiality_level">${options(confidentialityLabels, "standard")}</select></label>
    <label>E-mail<input name="email" type="email"></label>
    <label>Telephone<input name="phone"></label>
    <label>Ville<input name="city"></label>
    <label>Departement<input name="department"></label>
    <label class="admin-create-wide">Contributions possibles<textarea name="contribution_potential" rows="4"></textarea></label>
    <label class="admin-create-wide">Notes<textarea name="notes" rows="5"></textarea></label>
    <div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">Creer</button><button class="btn secondary" type="button" data-crm-close-modal>Annuler</button></div><p class="form-note admin-create-wide" data-crm-modal-status hidden></p>`;
}

function historyForm(defaults = {}) {
  return `<input type="hidden" name="${defaults.type === "organization" ? "organization_id" : "contact_id"}" value="${escapeHtml(defaults.id || "")}">
    <label>Type<select name="interaction_type">${options(historyLabels, "note")}</select></label>
    <label>Sujet<input name="subject" required placeholder="Ex. Appel de qualification"></label>
    <label class="admin-create-wide">Resume<textarea name="summary" rows="5" required></textarea></label>
    <div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">Ajouter</button><button class="btn secondary" type="button" data-crm-close-modal>Annuler</button></div><p class="form-note admin-create-wide" data-crm-modal-status hidden></p>`;
}

async function saveDetail(form) {
  const statusEl = form.querySelector("[data-crm-save-status]");
  const data = Object.fromEntries(new FormData(form));
  const type = form.dataset.type;
  data.type = type;
  data.next_action_due_at = fromDateTimeLocal(data.next_action_due_at);
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Enregistrement...";
    const result = await api("/api/admin-crm", { method: "PATCH", body: JSON.stringify(data) });
    if (type === "organization") organizations = organizations.map((item) => item.id === data.id ? result.organization : item);
    else contacts = contacts.map((item) => item.id === data.id ? result.contact : item);
    renderList();
    await renderDetail();
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
  }
}

async function submitModal(event) {
  event.preventDefault();
  const statusEl = modalForm.querySelector("[data-crm-modal-status]");
  const data = Object.fromEntries(new FormData(modalForm));
  data.type = modalType;
  try {
    if (statusEl) { statusEl.hidden = false; statusEl.textContent = "Enregistrement..."; }
    const result = await api("/api/admin-crm", { method: "POST", body: JSON.stringify(data) });
    if (modalType === "organization") {
      organizations = [result.organization, ...organizations];
      currentView = "organizations";
      selectedId = result.organization.id;
    } else if (modalType === "history") {
      closeModal();
      await renderDetail();
      return;
    } else {
      contacts = [result.contact, ...contacts];
      currentView = "contacts";
      selectedId = result.contact.id;
    }
    closeModal();
    updateViewUi();
    renderList();
    await renderDetail();
    await loadDashboard().catch(() => {});
  } catch (error) {
    if (statusEl) statusEl.textContent = error.message;
  }
}

async function updateDuplicate(id, status) {
  await api("/api/admin-crm", { method: "PATCH", body: JSON.stringify({ type: "duplicate", id, status }) });
  duplicates = duplicates.filter((item) => item.id !== id);
  selectedId = duplicates[0]?.id || null;
  renderList();
  await renderDetail();
  await loadDashboard().catch(() => {});
}

function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = String(new FormData(tokenForm).get("token") || "").trim();
    if (!value) return setStatus("Entrez le token admin.", "error");
    setToken(value);
    try { showApp(); await loadCurrent(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); }
  });
  viewButtons.forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.crmView; selectedId = null; loadCurrent().catch((error) => alert(error.message)); }));
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadCurrent().catch((error) => alert(error.message)), 280); });
  filtersForm?.addEventListener("change", () => loadCurrent().catch((error) => alert(error.message)));
  refreshButton?.addEventListener("click", () => loadCurrent().catch((error) => alert(error.message)));
  logoutButton?.addEventListener("click", () => { setToken(""); showLogin(); });
  exportButton?.addEventListener("click", exportCsv);
  createContactButton?.addEventListener("click", () => openModal("contact"));
  createOrganizationButton?.addEventListener("click", () => openModal("organization"));
  closeModalButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-crm-close-modal]")) closeModal(); });
  modalForm?.addEventListener("submit", submitModal);
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-crm-id]"); if (!button) return; selectedId = button.dataset.crmId; renderList(); renderDetail(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-crm-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form); });
  detailEl?.addEventListener("click", async (event) => {
    const historyButton = event.target.closest("[data-crm-add-history]");
    if (historyButton) { const item = selectedItem(); openModal("history", { id: item.id, type: currentView === "organizations" ? "organization" : "contact" }); return; }
    const linkedContact = event.target.closest("[data-crm-create-linked-contact]");
    if (linkedContact) { const org = selectedItem(); openModal("contact", { notes: `Contact rattache a ${org?.name || "organisation"}` }); return; }
    const duplicateButton = event.target.closest("[data-crm-duplicate-status]");
    if (duplicateButton) { const item = selectedItem(); if (item) await updateDuplicate(item.id, duplicateButton.dataset.crmDuplicateStatus); }
  });
}

bindEvents();
if (token()) {
  showApp();
  loadCurrent().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); });
} else {
  showLogin();
}

