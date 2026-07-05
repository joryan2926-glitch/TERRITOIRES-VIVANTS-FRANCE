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
const responseTemplates = {
  auto: "Modele adapte a la categorie",
  "collectivite-territoire": "Reponse collectivite",
  "bien-vacant-proprietaire": "Reponse proprietaire",
  "materiaux-reemploi": "Reponse materiaux",
  "entreprise-partenariat": "Reponse entreprise",
  "benevolat-insertion": "Reponse benevole / association",
  "financement-mecenat": "Reponse financeur / mecene",
  "presse-institutionnel": "Reponse presse / institution",
  pieces: "Demande de pieces complementaires",
  rendezvous: "Proposer un rendez-vous",
  refus: "Reponse non compatible",
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
    .replace(/\"/g, "&quot;")
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

function contactName(contact) {
  return contact?.full_name || "Madame, Monsieur";
}

function templateCategory(contact, key) {
  if (!key || key === "auto") return contact?.category || "demande-generale";
  return key;
}

function responseSubject(contact) {
  return `Suite a votre demande TVF - ${contact?.subject || "contact"}`;
}

function responseTemplate(contact, key = "auto") {
  const name = contactName(contact);
  const category = templateCategory(contact, key);
  const commonIntro = `Bonjour ${name},\n\nMerci pour votre message et pour l'interet porte a Territoires Vivants France. Votre demande a bien ete recue et va etre qualifiee afin d'identifier la suite la plus adaptee.`;
  const signature = `\n\nCordialement,\n\nTerritoires Vivants France\ncontact@territoiresvivantsfrance.fr\n06 22 03 93 24`;

  const templates = {
    "collectivite-territoire": `${commonIntro}\n\nPour preparer un premier echange territorial, pouvez-vous nous transmettre les elements suivants :\n\n- commune ou EPCI concerne ;\n- besoin public identifie ;\n- perimetre geographique ;\n- donnees deja disponibles ;\n- interlocuteur referent ;\n- calendrier souhaite.\n\nNous pourrons ensuite proposer un rendez-vous de cadrage afin d'evaluer les modalites possibles de cooperation.`,
    "bien-vacant-proprietaire": `${commonIntro}\n\nPour qualifier le bien propose, pouvez-vous nous transmettre :\n\n- adresse precise du bien ;\n- type de bien : logement, immeuble, commerce, local, terrain ou friche ;\n- etat apparent ;\n- photos recentes ;\n- contraintes connues ;\n- situation de propriete ou mandat ;\n- objectif recherche : remise en usage, convention, location solidaire ou autre scenario.\n\nApres reception, nous pourrons indiquer si une visite ou une etude preliminaire est pertinente.`,
    "materiaux-reemploi": `${commonIntro}\n\nPour etudier la valorisation des materiaux, merci de preciser :\n\n- nature des materiaux ;\n- quantite approximative ;\n- etat ;\n- localisation ;\n- delai de disponibilite ;\n- conditions d'enlevement ;\n- photos si disponibles.\n\nTVF n'est pas une plateforme de distribution libre : les materiaux sont qualifies puis orientes vers des projets compatibles avec l'interet territorial.`,
    "entreprise-partenariat": `${commonIntro}\n\nPour evaluer une cooperation avec votre entreprise, pouvez-vous preciser :\n\n- type de contribution envisagee : materiaux, locaux, competences, transport, mecanat, financement ;\n- localisation ;\n- calendrier ;\n- contact referent ;\n- contraintes RSE ou reporting attendues.\n\nNous pourrons ensuite proposer un cadre de partenariat adapte et tracable.`,
    "benevolat-insertion": `${commonIntro}\n\nPour vous orienter vers une mission adaptee, merci de nous indiquer :\n\n- commune ou secteur d'intervention ;\n- disponibilites ;\n- competences ou envies ;\n- mobilite ;\n- limites d'intervention ;\n- experience eventuelle sur chantier, animation, diagnostic ou mobilisation citoyenne.\n\nLes missions TVF doivent rester encadrees et compatibles avec la securite des personnes.`,
    "financement-mecenat": `${commonIntro}\n\nPour preparer un echange financeur ou mecene, pouvez-vous nous indiquer :\n\n- type de soutien envisage ;\n- territoire ou thematique prioritaire ;\n- calendrier de decision ;\n- criteres de selection ;\n- attentes de reporting ;\n- personne referente.\n\nTVF pourra ensuite transmettre une note d'opportunite ou un dossier adapte.`,
    "presse-institutionnel": `${commonIntro}\n\nPour orienter votre demande, pouvez-vous nous preciser :\n\n- media ou institution ;\n- sujet souhaite ;\n- format attendu ;\n- delai ;\n- contact referent.\n\nNous pouvons transmettre les elements de presentation, le kit media et les informations institutionnelles disponibles.`,
    pieces: `${commonIntro}\n\nPour poursuivre l'instruction, il nous manque quelques elements :\n\n- commune ou territoire concerne ;\n- description precise de la situation ;\n- photos ou documents utiles ;\n- delai souhaite ;\n- interlocuteur a contacter ;\n- contraintes deja identifiees.\n\nDes reception, nous pourrons qualifier la demande et proposer une suite adaptee.`,
    rendezvous: `${commonIntro}\n\nVotre demande semble justifier un premier echange. Nous vous proposons d'organiser un rendez-vous court afin de cadrer :\n\n- le besoin ;\n- le territoire ;\n- les acteurs concernes ;\n- les pieces disponibles ;\n- les suites possibles.\n\nMerci de nous transmettre deux ou trois disponibilites.`,
    refus: `Bonjour ${name},\n\nMerci pour votre message et pour l'interet porte a Territoires Vivants France.\n\nApres premiere lecture, votre demande ne semble pas entrer dans le cadre d'intervention actuel de TVF, ou elle necessite des conditions qui ne sont pas reunies a ce stade.\n\nNous conservons une trace de votre message afin de pouvoir le reexaminer si le cadre evolue.`,
    "demande-generale": `${commonIntro}\n\nPour bien orienter votre demande, pouvez-vous nous transmettre les precisions suivantes :\n\n- votre profil ;\n- territoire concerne ;\n- objet exact de la demande ;\n- pieces ou photos disponibles ;\n- suite attendue.\n\nNous reviendrons ensuite vers vous avec l'orientation la plus adaptee.`,
  };

  return `${templates[category] || templates["demande-generale"]}${signature}`;
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

function templateOptions(contact) {
  return Object.entries(responseTemplates)
    .map(([value, text]) => `<option value="${value}" ${value === "auto" ? "selected" : ""}>${escapeHtml(text)}</option>`)
    .join("");
}

function renderDetail() {
  if (!detailEl) return;
  const contact = selectedContact();
  if (!contact) {
    detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez une demande</h3><p>Aucune demande disponible avec ces filtres.</p></div>`;
    return;
  }

  const initialTemplate = responseTemplate(contact);
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

    <div class="admin-quick-actions" aria-label="Actions rapides">
      <button class="btn secondary" type="button" data-quick-status="a_qualifier">A qualifier</button>
      <button class="btn secondary" type="button" data-quick-status="en_cours">En cours</button>
      <button class="btn secondary" type="button" data-quick-status="rendez_vous">Rendez-vous</button>
      <button class="btn ghost" type="button" data-quick-status="archive">Archiver</button>
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

    <section class="admin-response-panel" aria-label="Modele de reponse">
      <div class="admin-response-head">
        <div>
          <p class="section-kicker">Reponse</p>
          <h4>Modele pret a adapter</h4>
        </div>
        <label>Modele
          <select data-response-template>
            ${templateOptions(contact)}
          </select>
        </label>
      </div>
      <textarea data-response-body rows="11">${escapeHtml(initialTemplate)}</textarea>
      <div class="admin-detail-actions">
        <button class="btn secondary" type="button" data-admin-copy-response>Copier la reponse</button>
        <button class="btn secondary" type="button" data-admin-open-response>Ouvrir l'e-mail prepare</button>
      </div>
    </section>

    <div class="admin-message">
      <h4>Message recu</h4>
      <pre>${escapeHtml(contact.message || "Non renseigne")}</pre>
    </div>

    <div class="admin-detail-actions">
      <button class="btn primary" type="submit">Enregistrer</button>
      <a class="btn secondary" href="mailto:${escapeHtml(contact.email || "")}?subject=${encodeURIComponent(responseSubject(contact))}">Repondre par e-mail</a>
      <button class="btn ghost" type="button" data-admin-copy-email>Copier l'e-mail</button>
    </div>
    <p class="form-note" data-admin-save-status role="status" hidden></p>
  </form>`;
}

async function updateSelected(data, statusEl) {
  const contact = selectedContact();
  if (!contact) return;
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
    } else {
      alert(error.message);
    }
  }
}

async function saveSelected(form) {
  const statusEl = form.querySelector("[data-admin-save-status]");
  const data = Object.fromEntries(new FormData(form));
  await updateSelected(data, statusEl);
}

async function copyText(text, button, doneLabel) {
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      const initial = button.textContent;
      button.textContent = doneLabel;
      window.setTimeout(() => { button.textContent = initial; }, 1600);
    }
  } catch {
    window.prompt("Copiez le texte", text);
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

  detailEl?.addEventListener("change", (event) => {
    const select = event.target.closest("[data-response-template]");
    if (!select) return;
    const contact = selectedContact();
    const textarea = detailEl.querySelector("[data-response-body]");
    if (contact && textarea) textarea.value = responseTemplate(contact, select.value);
  });

  detailEl?.addEventListener("click", async (event) => {
    const contact = selectedContact();
    if (!contact) return;

    const quickStatus = event.target.closest("[data-quick-status]");
    if (quickStatus) {
      await updateSelected({ status: quickStatus.dataset.quickStatus });
      return;
    }

    const copyEmail = event.target.closest("[data-admin-copy-email]");
    if (copyEmail) {
      if (!contact.email) return;
      await copyText(contact.email, copyEmail, "E-mail copie");
      return;
    }

    const copyResponse = event.target.closest("[data-admin-copy-response]");
    if (copyResponse) {
      const textarea = detailEl.querySelector("[data-response-body]");
      await copyText(textarea?.value || "", copyResponse, "Reponse copiee");
      return;
    }

    const openResponse = event.target.closest("[data-admin-open-response]");
    if (openResponse) {
      const textarea = detailEl.querySelector("[data-response-body]");
      const body = textarea?.value || "";
      const href = `mailto:${encodeURIComponent(contact.email || "")}?subject=${encodeURIComponent(responseSubject(contact))}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
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
