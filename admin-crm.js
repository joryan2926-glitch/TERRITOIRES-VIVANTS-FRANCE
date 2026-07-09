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
const partnerProfiles = {
  collectivite: {
    title: "Collectivite / EPCI",
    contribution: "Local de stockage, orientation des biens vacants, relais institutionnel, mise en relation territoriale.",
    documents: ["Courrier de sollicitation", "Note de presentation TVF", "Fiche besoin local", "Projet de convention de cooperation", "Calendrier de rendez-vous"],
    approach: "Proposer un rendez-vous de cadrage avec les services habitat, commerce, ESS, transition ecologique ou patrimoine.",
    benefit: "Aide a structurer un outil local complementaire des politiques publiques, sans remplacer les dispositifs existants."
  },
  entreprise: {
    title: "Entreprise / artisan / BTP",
    contribution: "Dons ou mise a disposition de materiaux, vehicule, competences, stockage, mecenat ou chantier solidaire.",
    documents: ["Fiche entreprise", "Liste des materiaux disponibles", "Photos et volumes", "Conditions d'enlevement", "Attestation ou convention de valorisation"],
    approach: "Identifier le responsable RSE, dirigeant, chef de depot ou conducteur de travaux et proposer une valorisation territoriale claire.",
    benefit: "Valorisation RSE, reduction du gaspillage, ancrage local et contribution visible a des projets utiles."
  },
  association: {
    title: "Association / insertion / ESS",
    contribution: "Benevolat, chantier participatif, accompagnement social, formation, mobilisation citoyenne ou gestion d'un lieu.",
    documents: ["Presentation de la structure", "Assurance", "References d'actions", "Capacites d'encadrement", "Besoins humains et materiels"],
    approach: "Qualifier les capacites terrain et cadrer un premier chantier ou une action commune simple.",
    benefit: "Acces a des projets concrets, visibilite locale et cooperation avec des acteurs publics et prives."
  },
  financeur: {
    title: "Financeur / mecene / fondation",
    contribution: "Financement de demarrage, fonds d'amorcage, soutien projet, mecenat financier ou accompagnement methodologique.",
    documents: ["Dossier de presentation", "Budget previsionnel", "Objectifs d'impact", "Gouvernance", "Modalites de reporting"],
    approach: "Presenter un besoin clair, un territoire pilote, des indicateurs suivis et une trajectoire de deploiement.",
    benefit: "Financement a impact territorial lisible, suivi, documente et rattache a des usages concrets."
  },
  institution: {
    title: "Institution / service de l'Etat",
    contribution: "Orientation, cadre public, dispositifs compatibles, expertise, donnees territoriales et mise en reseau.",
    documents: ["Note d'alignement territorial", "Statuts TVF", "Recepisse", "Dossier pilote", "Matrice besoins / reponse TVF"],
    approach: "Se positionner comme outil de coordination et demander un avis de cadrage ou une mise en relation technique.",
    benefit: "Meilleure coordination locale, tracabilite des besoins, mobilisation citoyenne et appui au passage a l'action."
  },
  proprietaire_personne_morale: {
    title: "Proprietaire / bailleur / fonciere",
    contribution: "Bien vacant, local, terrain, convention d'usage, projet de rehabilitation ou occupation temporaire.",
    documents: ["Adresse du bien", "Titre ou justificatif de propriete", "Photos", "Etat connu", "Objectif souhaite", "Contraintes juridiques"],
    approach: "Clarifier la situation du bien, les contraintes et l'interet d'une convention de valorisation territoriale.",
    benefit: "Valorisation patrimoniale, remise en usage progressive, securisation d'un cadre conventionnel et utilite locale."
  },
  fournisseur: {
    title: "Fournisseur / logistique",
    contribution: "Materiel, transport, stockage, outillage, assurance, maintenance, equipement technique.",
    documents: ["Fiche materiel", "Conditions de mise a disposition", "Duree", "Assurance", "Responsable operationnel"],
    approach: "Qualifier la capacite disponible, le calendrier et les conditions pratiques avant toute mobilisation.",
    benefit: "Participation concrete au lancement TVF, visibilite locale et contribution utile au territoire pilote."
  },
  partenaire: {
    title: "Partenaire territorial",
    contribution: "Mise en relation, expertise, appui projet, relais local, mobilisation de ressources ou contribution ponctuelle.",
    documents: ["Presentation de la structure", "Contacts utiles", "Contribution possible", "Territoire concerne", "Contraintes ou disponibilites"],
    approach: "Qualifier le role exact attendu et proposer une prochaine action simple, datee et suivie.",
    benefit: "Cooperation claire, traçable et orientee impact territorial."
  },
  autre: {
    title: "Acteur a qualifier",
    contribution: "Contribution a preciser selon le besoin TVF : local, materiaux, financement, expertise, benevolat ou relais.",
    documents: ["Coordonnees", "Presentation", "Contribution possible", "Territoire concerne", "Prochaine action"],
    approach: "Commencer par une qualification courte avant d'engager une demande formelle.",
    benefit: "Orientation rapide vers le bon parcours de cooperation."
  }
};
const contactProfiles = {
  elu: "collectivite",
  technicien: "institution",
  entreprise_contact: "entreprise",
  benevole: "association",
  financeur: "financeur",
  proprietaire: "proprietaire_personne_morale",
  partenaire: "partenaire",
  journaliste: "institution",
  citoyen: "partenaire",
  autre: "autre"
};
const profileCaseTypes = {
  collectivite: "collectivite",
  entreprise: "entreprise",
  association: "benevole",
  financeur: "financeur",
  institution: "gouvernance",
  proprietaire_personne_morale: "bien_vacant",
  fournisseur: "materiaux",
  partenaire: "autre",
  autre: "autre"
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
const controlEl = document.querySelector("[data-crm-control]");
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

function notify(message, type = "info") {
  if (window.tvfAdminNotice) window.tvfAdminNotice(message, type);
  else if (type === "error") console.error(message);
  else console.log(message);
}

function notifyError(error, fallback = "Action impossible pour le moment.") {
  notify(error?.message || fallback, "error");
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
  renderControlPanel();
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

function renderControlPanel() {
  if (!controlEl || !dashboard) return;
  const contacts = Number(dashboard.contacts_total || 0);
  const orgs = Number(dashboard.organizations_total || 0);
  const missingConsent = Number(dashboard.consent_missing || 0);
  const overdue = Number(dashboard.overdue_actions || 0);
  const duplicates = Number(dashboard.duplicates_pending || 0);
  const collectivites = Number(dashboard.collectivites || 0);
  const entreprises = Number(dashboard.entreprises || 0);
  const financeurs = Number(dashboard.financeurs || 0);
  const proprietaires = Number(dashboard.proprietaires || 0);
  const nextDecision = overdue ? "Relancer les contacts" : missingConsent ? "Verifier les consentements" : duplicates ? "Fusionner les doublons" : contacts ? "Qualifier en dossier" : "Creer les premiers contacts";
  const status = overdue || missingConsent ? "Suivi requis" : duplicates ? "Nettoyage requis" : "CRM exploitable";
  controlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Conversion relationnelle</p><h3>Transformer les contacts en parcours utiles</h3><p>Cette synthese aide a passer du contact au parcours operationnel : consentement, relance, dossier, pieces, tache et decision.</p></div><strong>${escapeHtml(status)}</strong></div><div class="crm-control-grid"><article><span>Decision suivante</span><strong>${escapeHtml(nextDecision)}</strong><small>priorite</small></article><article><span>Collectivites</span><strong>${escapeHtml(collectivites)}</strong><small>territoires</small></article><article><span>Entreprises</span><strong>${escapeHtml(entreprises)}</strong><small>RSE / materiaux</small></article><article><span>Proprietaires</span><strong>${escapeHtml(proprietaires)}</strong><small>biens ou foncier</small></article><article><span>Financeurs</span><strong>${escapeHtml(financeurs)}</strong><small>mecenat</small></article><article data-tone="warning"><span>Relances</span><strong>${escapeHtml(overdue)}</strong><small>en retard</small></article></div><div class="crm-control-links"><button class="btn secondary" type="button" data-crm-switch="organizations">Voir organisations</button><button class="btn secondary" type="button" data-crm-switch="contacts">Voir contacts</button><a class="btn secondary" href="admin-demandes">Demandes</a><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-documents">Pieces</a><a class="btn secondary" href="admin-work">Taches</a></div>`;
}function currentItems() {
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

function isCrmOverdue(item) {
  return item?.next_action_due_at && new Date(item.next_action_due_at).getTime() < Date.now();
}

function crmSectorKey(item = {}, type = "contact") {
  if (type === "organization") return item.organization_type || "partenaire";
  return contactProfiles[item.contact_type || "autre"] || "autre";
}
function crmPartnerProfile(item = {}, type = "contact") {
  return partnerProfiles[crmSectorKey(item, type)] || partnerProfiles.autre;
}
function partnerCooperationPanel(item, type) {
  const profile = crmPartnerProfile(item, type);
  return `<section class="crm-cooperation-panel"><div><p class="section-kicker">Cooperation territoriale</p><h4>${escapeHtml(profile.title)}</h4><p>${escapeHtml(profile.contribution)}</p></div><div><span>Approche recommandee</span><p>${escapeHtml(profile.approach)}</p><span>Interet pour TVF</span><p>${escapeHtml(profile.benefit)}</p></div></section>`;
}
function partnerDocumentsPanel(item, type) {
  const profile = crmPartnerProfile(item, type);
  return `<section class="crm-documents-panel"><div class="admin-panel-head"><div><p class="section-kicker">Pieces a demander</p><h4>Dossier de qualification</h4></div><strong>${escapeHtml(profile.documents.length)} pieces</strong></div><ul>${profile.documents.map((doc) => `<li>${escapeHtml(doc)}</li>`).join("")}</ul></section>`;
}
function relationPathPanel(item, type) {
  const stage = type === "organization" ? item.relation_status : item.consent_status;
  const steps = type === "organization"
    ? [
        ["prospect", "Identifier"],
        ["actif", "Qualifier"],
        ["conventionne", "Conventionner"],
        ["ancien", "Capitaliser"],
      ]
    : [
        ["unknown", "Identifier"],
        ["pending", "Consentement"],
        ["granted", "Qualifier"],
        ["granted", "Mobiliser"],
      ];
  const doneIndex = Math.max(0, steps.findIndex(([key]) => key === stage));
  return `<ol class="crm-relation-path" aria-label="Parcours relationnel">
    ${steps.map(([key, text], index) => `<li class="${index <= doneIndex ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(text)}</strong><small>${escapeHtml(key)}</small></li>`).join("")}
  </ol>`;
}

function quickDue(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
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
    ${relationPathPanel(item, "contact")}
    ${partnerCooperationPanel(item, "contact")}
    ${partnerDocumentsPanel(item, "contact")}
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
    <div class="admin-detail-actions"><button class="btn primary" type="submit">Enregistrer</button><button class="btn secondary" type="button" data-crm-quick="relance_7j">Relance 7 jours</button><button class="btn secondary" type="button" data-crm-quick="consent_granted">Consentement OK</button><button class="btn secondary" type="button" data-crm-partner-action="qualify">Qualifier partenariat</button><button class="btn secondary" type="button" data-crm-partner-action="task">Creer tache de contact</button><button class="btn secondary" type="button" data-crm-partner-action="case">Ouvrir dossier</button><a class="btn secondary" href="mailto:${escapeHtml(item.email || "")}">Ecrire</a><a class="btn secondary" href="tel:${escapeHtml(item.phone || item.mobile || "")}">Appeler</a></div>
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
    ${relationPathPanel(item, "organization")}
    ${partnerCooperationPanel(item, "organization")}
    ${partnerDocumentsPanel(item, "organization")}
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
    <div class="admin-detail-actions"><button class="btn primary" type="submit">Enregistrer</button><button class="btn secondary" type="button" data-crm-quick="relance_7j">Relance 7 jours</button><button class="btn secondary" type="button" data-crm-quick="relation_active">Relation active</button><button class="btn secondary" type="button" data-crm-partner-action="qualify">Qualifier partenariat</button><button class="btn secondary" type="button" data-crm-partner-action="task">Creer tache de contact</button><button class="btn secondary" type="button" data-crm-partner-action="case">Ouvrir dossier</button><a class="btn secondary" href="mailto:${escapeHtml(item.email || "")}">Ecrire</a><button class="btn secondary" type="button" data-crm-create-linked-contact>Creer contact rattache</button></div>
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
  if (!items.length) return notify("Aucune donnee a exporter.", "warning");
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
  notify("Export CRM prepare.", "success");
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
    notify("Fiche CRM enregistree.", "success");
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
    notifyError(error);
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
      notify("Note CRM ajoutee.", "success");
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
    notify("Fiche CRM creee.", "success");
  } catch (error) {
    if (statusEl) statusEl.textContent = error.message;
    notifyError(error);
  }
}

async function updateDuplicate(id, status) {
  await api("/api/admin-crm", { method: "PATCH", body: JSON.stringify({ type: "duplicate", id, status }) });
  duplicates = duplicates.filter((item) => item.id !== id);
  selectedId = duplicates[0]?.id || null;
  renderList();
  await renderDetail();
  await loadDashboard().catch(() => {});
  notify("Doublon CRM traite.", "success");
}

function crmCaseType(profileKey) {
  return profileCaseTypes[profileKey] || "autre";
}
function crmCaseTitle(item, type, profile) {
  return type === "organization" ? `${profile.title} - ${item.name}` : `${profile.title} - ${item.display_name}`;
}
async function createCrmCase(item, type, profile) {
  const profileKey = crmSectorKey(item, type);
  const territory = item.city || item.department || item.region || "";
  const summary = [
    `Origine CRM : ${type === "organization" ? item.name : item.display_name}`,
    `Contribution possible : ${profile.contribution}`,
    `Approche recommandee : ${profile.approach}`,
    `Pieces a demander : ${profile.documents.join("; ")}`,
    item.notes ? `Notes CRM : ${item.notes}` : ""
  ].filter(Boolean).join("\n\n");
  await api("/api/admin-cases", { method: "POST", body: JSON.stringify({ type: "case", case_type: crmCaseType(profileKey), title: crmCaseTitle(item, type, profile), status: "qualification", priority: profileKey === "financeur" || profileKey === "collectivite" ? "haute" : "normale", main_pole: profileKey === "fournisseur" ? "Materiautheque solidaire" : profileKey === "proprietaire_personne_morale" ? "Habitat vivant" : "Partenariats", assigned_to: "TVF", summary, territory, next_action: `Qualifier la demande et demander les pieces : ${profile.documents.slice(0, 3).join(", ")}`, risk_level: profileKey === "proprietaire_personne_morale" || profileKey === "fournisseur" ? "modere" : "faible", decision_status: "non_preparee" }) });
}
async function createCrmWorkTask(item, type, profile) {
  const title = type === "organization" ? `Contacter ${item.name}` : `Contacter ${item.display_name}`;
  const description = `Objectif : ${profile.approach}\nPieces a demander : ${profile.documents.join("; ")}`;
  await api("/api/admin-work", { method: "POST", body: JSON.stringify({ type: "task", related_object_type: type === "organization" ? "organization" : "contact", related_object_id: item.id, title, description, status: "todo", priority: "P2", pole: "Partenariats", assigned_to: "TVF", due_at: quickDue(7) }) });
}
async function createCrmQualificationNote(item, type, profile) {
  await api("/api/admin-crm", { method: "POST", body: JSON.stringify({ type: "history", interaction_type: "demande", subject: `Qualification partenariat - ${profile.title}`, summary: `Contribution possible : ${profile.contribution}\nApproche : ${profile.approach}\nPieces a demander : ${profile.documents.join("; ")}`, contact_id: type === "contact" ? item.id : "", organization_id: type === "organization" ? item.id : "" }) });
}
async function applyPartnerAction(action) {
  const item = selectedItem();
  if (!item || currentView === "duplicates") return;
  const type = currentView === "organizations" ? "organization" : "contact";
  const profile = crmPartnerProfile(item, type);
  if (action === "qualify") await createCrmQualificationNote(item, type, profile);
  if (action === "task") await createCrmWorkTask(item, type, profile);
  await loadDashboard().catch(() => {});
  await renderDetail();
  notify("Action partenaire appliquee.", "success");
}
async function quickCrmAction(action) {
  const item = selectedItem();
  if (!item || currentView === "duplicates") return;
  const type = currentView === "organizations" ? "organization" : "contact";
  const data = { type, id: item.id };
  if (action === "relance_7j") {
    data.next_action = "Relancer et mettre a jour la fiche relationnelle";
    data.next_action_due_at = quickDue(7);
  }
  if (action === "consent_granted" && type === "contact") {
    data.consent_status = "granted";
    data.consent_source = item.consent_source || "Validation manuelle TVF OS";
    data.next_action = "Qualifier la relation et rattacher une organisation si besoin";
    data.next_action_due_at = quickDue(14);
  }
  if (action === "relation_active" && type === "organization") {
    data.relation_status = "actif";
    data.next_action = "Planifier un echange de cadrage ou une proposition de cooperation";
    data.next_action_due_at = quickDue(14);
  }
  const result = await api("/api/admin-crm", { method: "PATCH", body: JSON.stringify(data) });
  if (type === "organization") organizations = organizations.map((entry) => entry.id === item.id ? result.organization : entry);
  else contacts = contacts.map((entry) => entry.id === item.id ? result.contact : entry);
  renderList();
  await renderDetail();
  await loadDashboard().catch(() => {});
  notify("Action CRM appliquee.", "success");
}

function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = String(new FormData(tokenForm).get("token") || "").trim();
    if (!value) return setStatus("Entrez le token admin.", "error");
    setToken(value);
    try { showApp(); await loadCurrent(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); }
  });
  viewButtons.forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.crmView; selectedId = null; loadCurrent().catch((error) => notifyError(error)); }));
  filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadCurrent().catch((error) => notifyError(error)), 280); });
  filtersForm?.addEventListener("change", () => loadCurrent().catch((error) => notifyError(error)));
  refreshButton?.addEventListener("click", () => loadCurrent().catch((error) => notifyError(error)));
  logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; });
  exportButton?.addEventListener("click", exportCsv);
  createContactButton?.addEventListener("click", () => openModal("contact"));
  createOrganizationButton?.addEventListener("click", () => openModal("organization"));
  closeModalButton?.addEventListener("click", closeModal);
  controlEl?.addEventListener("click", (event) => { const switcher = event.target.closest("[data-crm-switch]"); if (!switcher) return; currentView = switcher.dataset.crmSwitch || "contacts"; selectedId = null; loadCurrent().catch((error) => notifyError(error)); }); modal?.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-crm-close-modal]")) closeModal(); });
  modalForm?.addEventListener("submit", submitModal);
  listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-crm-id]"); if (!button) return; selectedId = button.dataset.crmId; renderList(); renderDetail(); });
  detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-crm-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form); });
  detailEl?.addEventListener("click", async (event) => {
    try {
      const quickButton = event.target.closest("[data-crm-quick]");
      if (quickButton) { await quickCrmAction(quickButton.dataset.crmQuick); return; }
      const partnerButton = event.target.closest("[data-crm-partner-action]");
      if (partnerButton) { await applyPartnerAction(partnerButton.dataset.crmPartnerAction); return; }
      const historyButton = event.target.closest("[data-crm-add-history]");
      if (historyButton) { const item = selectedItem(); openModal("history", { id: item.id, type: currentView === "organizations" ? "organization" : "contact" }); return; }
      const linkedContact = event.target.closest("[data-crm-create-linked-contact]");
      if (linkedContact) { const org = selectedItem(); openModal("contact", { notes: `Contact rattache a ${org?.name || "organisation"}` }); return; }
      const duplicateButton = event.target.closest("[data-crm-duplicate-status]");
      if (duplicateButton) { const item = selectedItem(); if (item) await updateDuplicate(item.id, duplicateButton.dataset.crmDuplicateStatus); }
    } catch (error) {
      notifyError(error);
    }
  });
}

bindEvents();
if (token()) {
  showApp();
  loadCurrent().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); });
} else {
  showLogin();
}
