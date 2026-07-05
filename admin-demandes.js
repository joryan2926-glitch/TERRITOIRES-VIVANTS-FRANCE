const ADMIN_TOKEN_KEY = "tvfAdminToken";
const statusLabels = {
  nouveau: "Nouveau",
  a_qualifier: "A qualifier",
  en_cours: "En cours",
  rendez_vous: "Rendez-vous",
  en_attente: "En attente",
  accepte: "Accepte",
  refuse: "Refuse",
  archive: "Archive",
};
const priorityLabels = {
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};
const categoryLabels = {
  "collectivite-territoire": "Collectivite",
  "bien-vacant-proprietaire": "Bien vacant",
  "materiaux-reemploi": "Materiaux",
  "entreprise-partenariat": "Entreprise",
  "benevolat-insertion": "Benevolat / insertion",
  "financement-mecenat": "Financement",
  "presse-institutionnel": "Presse",
  "demande-generale": "Generale",
};

const loginSection = document.querySelector("[data-admin-login]");
const appSection = document.querySelector("[data-admin-app]");
const tokenForm = document.querySelector("[data-admin-token-form]");
const loginStatus = document.querySelector("[data-admin-login-status]");
const filtersForm = document.querySelector("[data-admin-filters]");
const listEl = document.querySelector("[data-admin-list]");
const detailEl = document.querySelector("[data-admin-detail]");
const countEl = document.querySelector("[data-admin-count]");
const emptyEl = document.querySelector("[data-admin-empty]");
const refreshButton = document.querySelector("[data-admin-refresh]");
const logoutButton = document.querySelector("[data-admin-logout]");

let contacts = [];
let selectedId = null;
let debounceTimer;

function token() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setToken(value) {
  try {
    if (value) sessionStorage.setItem(ADMIN_TOKEN_KEY, value);
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // La page reste utilisable sans stockage de session.
  }
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

function formatDate(value) {
  if (!value) return "Non renseigne";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function label(map, value) {
  return map[value] || value || "Non classe";
}

function filtersParams() {
  const data = new FormData(filtersForm);
  const params = new URLSearchParams();
  ["q", "status", "priority", "category"].forEach((name) => {
    const value = String(data.get(name) || "").trim();
    if (value) params.set(name, value);
  });
  params.set("limit", "120");
  return params;
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
    error.code = result.code;
    error.status = response.status;
    throw error;
  }
  return result;
}

async function loadContacts() {
  if (countEl) countEl.textContent = "Chargement des demandes...";
  const result = await api(`/api/admin-contacts?${filtersParams().toString()}`);
  contacts = result.contacts || [];
  if (!contacts.some((item) => item.id === selectedId)) selectedId = contacts[0]?.id || null;
  renderList();
  renderDetail();
}

function renderList() {
  if (!listEl) return;
  listEl.innerHTML = contacts
    .map((contact) => {
      const active = contact.id === selectedId ? " is-active" : "";
      return `<button class="admin-request${active}" type="button" data-contact-id="${escapeHtml(contact.id)}">
        <span class="admin-request-head"><strong>${escapeHtml(contact.full_name || "Contact sans nom")}</strong><small>${escapeHtml(formatDate(contact.created_at))}</small></span>
        <span>${escapeHtml(contact.subject || "Sans objet")}</span>
        <span class="admin-badges">
          <em data-kind="status">${escapeHtml(label(statusLabels, contact.status))}</em>
          <em data-kind="priority">${escapeHtml(label(priorityLabels, contact.priority))}</em>
          <em data-kind="category">${escapeHtml(label(categoryLabels, contact.category))}</em>
        </span>
      </button>`;
    })
    .join("");

  if (emptyEl) emptyEl.hidden = contacts.length !== 0;
  if (countEl) countEl.textContent = `${contacts.length} demande${contacts.length > 1 ? "s" : ""} affichee${contacts.length > 1 ? "s" : ""}`;
}

function selectedContact() {
  return contacts.find((item) => item.id === selectedId) || null;
}

function renderDetail() {
  if (!detailEl) return;
  const contact = selectedContact();
  if (!contact) {
    detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez une demande</h3><p>Aucune demande disponible avec ces filtres.</p></div>`;
    return;
  }

  detailEl.innerHTML = `<form class="admin-detail-form" data-admin-detail-form>
    <div class="admin-detail-title">
      <p class="section-kicker">Demande recue le ${escapeHtml(formatDate(contact.created_at))}</p>
      <h3>${escapeHtml(contact.subject || "Demande TVF")}</h3>
      <p>${escapeHtml(contact.full_name || "Nom non renseigne")}</p>
    </div>

    <div class="admin-meta-grid">
      <div><span>E-mail</span><a href="mailto:${escapeHtml(contact.email || "")}">${escapeHtml(contact.email || "Non renseigne")}</a></div>
      <div><span>Source</span><strong>${escapeHtml(contact.source_page || "Site TVF")}</strong></div>
      <div><span>Creation</span><strong>${escapeHtml(formatDate(contact.created_at))}</strong></div>
      <div><span>Mise a jour</span><strong>${escapeHtml(formatDate(contact.updated_at))}</strong></div>
    </div>

    <label>Statut
      <select name="status">
        ${Object.entries(statusLabels).map(([value, text]) => `<option value="${value}" ${contact.status === value ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </label>

    <label>Priorite
      <select name="priority">
        ${Object.entries(priorityLabels).map(([value, text]) => `<option value="${value}" ${contact.priority === value ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </label>

    <label>Categorie
      <select name="category">
        ${Object.entries(categoryLabels).map(([value, text]) => `<option value="${value}" ${contact.category === value ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </label>

    <label>Charge du suivi
      <input name="assigned_to" type="text" value="${escapeHtml(contact.assigned_to || "")}" placeholder="Ex. TVF, Edryan, Jordan">
    </label>

    <label>Notes internes
      <textarea name="internal_notes" rows="6" placeholder="Historique, relance, prochaine action...">${escapeHtml(contact.internal_notes || "")}</textarea>
    </label>

    <div class="admin-message">
      <h4>Message recu</h4>
      <pre>${escapeHtml(contact.message || "Non renseigne")}</pre>
    </div>

    <div class="admin-detail-actions">
      <button class="btn primary" type="submit">Enregistrer</button>
      <a class="btn secondary" href="mailto:${escapeHtml(contact.email || "")}?subject=${encodeURIComponent(`Suite a votre demande TVF - ${contact.subject || "contact"}`)}">Repondre par e-mail</a>
      <button class="btn ghost" type="button" data-admin-copy-email>Copier l'e-mail</button>
    </div>
    <p class="form-note" data-admin-save-status role="status" hidden></p>
  </form>`;
}

async function saveSelected(form) {
  const contact = selectedContact();
  if (!contact) return;
  const statusEl = form.querySelector("[data-admin-save-status]");
  const data = Object.fromEntries(new FormData(form));
  data.id = contact.id;
  try {
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = "Enregistrement...";
    }
    const result = await api("/api/admin-contacts", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    contacts = contacts.map((item) => (item.id === contact.id ? result.contact : item));
    renderList();
    renderDetail();
  } catch (error) {
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = error.message;
    }
  }
}

function bindEvents() {
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = String(new FormData(tokenForm).get("token") || "").trim();
    if (!value) {
      setStatus("Entrez le token admin.", "error");
      return;
    }
    setToken(value);
    try {
      showApp();
      await loadContacts();
      setStatus("", "info");
    } catch (error) {
      setToken("");
      showLogin();
      setStatus(error.message, "error");
    }
  });

  filtersForm?.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => loadContacts().catch((error) => alert(error.message)), 280);
  });
  filtersForm?.addEventListener("change", () => loadContacts().catch((error) => alert(error.message)));
  refreshButton?.addEventListener("click", () => loadContacts().catch((error) => alert(error.message)));
  logoutButton?.addEventListener("click", () => {
    setToken("");
    showLogin();
  });

  listEl?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-contact-id]");
    if (!button) return;
    selectedId = button.dataset.contactId;
    renderList();
    renderDetail();
  });

  detailEl?.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-admin-detail-form]");
    if (!form) return;
    event.preventDefault();
    saveSelected(form);
  });

  detailEl?.addEventListener("click", async (event) => {
    if (!event.target.closest("[data-admin-copy-email]")) return;
    const contact = selectedContact();
    if (!contact?.email) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      event.target.textContent = "E-mail copie";
      window.setTimeout(() => { event.target.textContent = "Copier l'e-mail"; }, 1600);
    } catch {
      alert(contact.email);
    }
  });
}

bindEvents();
if (token()) {
  showApp();
  loadContacts().catch((error) => {
    setToken("");
    showLogin();
    setStatus(error.message, "error");
  });
} else {
  showLogin();
}
