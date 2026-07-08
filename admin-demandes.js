const ADMIN_TOKEN_KEY = "tvfAdminToken";
const statusLabels = {
  nouveau: "Nouveau",
  a_qualifier: "A qualifier",
  en_cours: "En cours",
  rendez_vous: "Rendez-vous",
  en_attente: "En attente",
  accepte: "Accepte pour etude",
  refuse: "Refuse",
  archive: "Archive",
};
const priorityLabels = {
  normale: "P3 - Normale",
  haute: "P2 - Haute",
  urgente: "P1 - Urgente",
};
const channelLabels = {
  site_web: "Site web",
  email: "E-mail",
  telephone: "Telephone",
  whatsapp: "WhatsApp",
  rendez_vous: "Rendez-vous",
  import: "Import manuel",
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
const exportButton = document.querySelector("[data-admin-export]");
const logoutButton = document.querySelector("[data-admin-logout]");
const createButton = document.querySelector("[data-admin-create]");
const createModal = document.querySelector("[data-admin-create-modal]");
const createForm = document.querySelector("[data-admin-create-form]");
const createStatus = document.querySelector("[data-admin-create-status]");
const closeCreateButtons = document.querySelectorAll("[data-admin-close-create]");
const statusShortcuts = document.querySelectorAll("[data-status-shortcut]");
const priorityShortcuts = document.querySelectorAll("[data-priority-shortcut]");
const kpiEl = document.querySelector("[data-admin-kpis]");

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

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function label(map, value) {
  return map[value] || value || "Non classe";
}

function contactName(contact) {
  return contact?.full_name || "Madame, Monsieur";
}

function templateCategory(contact, key) {
  if (!key || key === "auto") return contact?.category || contact?.assistant?.suggested_category || "demande-generale";
  return key;
}

function responseSubject(contact) {
  return `Suite a votre demande ${contact?.request_number || "TVF"} - ${contact?.subject || "contact"}`;
}

function piecesText(contact) {
  const pieces = contact?.missing_pieces || contact?.assistant?.missing_pieces || [];
  return Array.isArray(pieces) ? pieces.join("\n") : String(pieces || "");
}

function responseTemplate(contact, key = "auto") {
  const name = contactName(contact);
  const category = templateCategory(contact, key);
  const missing = piecesText(contact)
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
  const commonIntro = `Bonjour ${name},\n\nMerci pour votre message et pour l'interet porte a Territoires Vivants France. Votre demande ${contact?.request_number || "TVF"} a bien ete recue et va etre qualifiee afin d'identifier la suite la plus adaptee.`;
  const signature = `\n\nCordialement,\n\nTerritoires Vivants France\ncontact@territoiresvivantsfrance.fr\n06 22 03 93 24`;

  const templates = {
    "collectivite-territoire": `${commonIntro}\n\nPour preparer un premier echange territorial, pouvez-vous nous transmettre les elements suivants :\n\n- commune ou EPCI concerne ;\n- besoin public identifie ;\n- perimetre geographique ;\n- donnees deja disponibles ;\n- interlocuteur referent ;\n- calendrier souhaite.\n\nNous pourrons ensuite proposer un rendez-vous de cadrage afin d'evaluer les modalites possibles de cooperation.`,
    "bien-vacant-proprietaire": `${commonIntro}\n\nPour qualifier le bien propose, pouvez-vous nous transmettre :\n\n- adresse precise du bien ;\n- type de bien : logement, immeuble, commerce, local, terrain ou friche ;\n- etat apparent ;\n- photos recentes ;\n- contraintes connues ;\n- situation de propriete ou mandat ;\n- objectif recherche : remise en usage, convention, location solidaire ou autre scenario.\n\nApres reception, nous pourrons indiquer si une visite ou une etude preliminaire est pertinente.`,
    "materiaux-reemploi": `${commonIntro}\n\nPour etudier la valorisation des materiaux, merci de preciser :\n\n- nature des materiaux ;\n- quantite approximative ;\n- etat ;\n- localisation ;\n- delai de disponibilite ;\n- conditions d'enlevement ;\n- photos si disponibles.\n\nTVF n'est pas une plateforme de distribution libre : les materiaux sont qualifies puis orientes vers des projets compatibles avec l'interet territorial.`,
    "entreprise-partenariat": `${commonIntro}\n\nPour evaluer une cooperation avec votre entreprise, pouvez-vous preciser :\n\n- type de contribution envisagee : materiaux, locaux, competences, transport, mecanat, financement ;\n- localisation ;\n- calendrier ;\n- contact referent ;\n- contraintes RSE ou reporting attendues.\n\nNous pourrons ensuite proposer un cadre de partenariat adapte et tracable.`,
    "benevolat-insertion": `${commonIntro}\n\nPour vous orienter vers une mission adaptee, merci de nous indiquer :\n\n- commune ou secteur d'intervention ;\n- disponibilites ;\n- competences ou envies ;\n- mobilite ;\n- limites d'intervention ;\n- experience eventuelle sur chantier, animation, diagnostic ou mobilisation citoyenne.\n\nLes missions TVF doivent rester encadrees et compatibles avec la securite des personnes.`,
    "financement-mecenat": `${commonIntro}\n\nPour preparer un echange financeur ou mecene, pouvez-vous nous indiquer :\n\n- type de soutien envisage ;\n- territoire ou thematique prioritaire ;\n- calendrier de decision ;\n- criteres de selection ;\n- attentes de reporting ;\n- personne referente.\n\nTVF pourra ensuite transmettre une note d'opportunite ou un dossier adapte.`,
    "presse-institutionnel": `${commonIntro}\n\nPour orienter votre demande, pouvez-vous nous preciser :\n\n- media ou institution ;\n- sujet souhaite ;\n- format attendu ;\n- delai ;\n- contact referent.\n\nNous pouvons transmettre les elements de presentation, le kit media et les informations institutionnelles disponibles.`,
    pieces: `${commonIntro}\n\nPour poursuivre l'instruction, il nous manque les elements suivants :\n\n${missing || "- commune ou territoire concerne ;\n- description precise de la situation ;\n- photos ou documents utiles ;\n- delai souhaite ;\n- interlocuteur a contacter."}\n\nDes reception, nous pourrons qualifier la demande et proposer une suite adaptee.`,
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
  renderStatusShortcuts();
  renderList();
  renderDetail();
}

function isOverdue(contact) {
  if (!contact?.next_action_due_at || ["archive", "refuse"].includes(contact.status)) return false;
  return new Date(contact.next_action_due_at).getTime() < Date.now();
}

function averageScore() {
  if (!contacts.length) return 0;
  const total = contacts.reduce((sum, contact) => sum + Number(contact.qualification_score || contact.assistant?.qualification_score || 0), 0);
  return Math.round(total / contacts.length);
}

function updateKpis() {
  if (!kpiEl) return;
  const values = [
    contacts.length,
    contacts.filter((contact) => ["nouveau", "a_qualifier"].includes(contact.status)).length,
    contacts.filter(isOverdue).length,
    contacts.filter((contact) => contact.status === "rendez_vous").length,
    `${averageScore()}%`,
  ];
  kpiEl.querySelectorAll("strong").forEach((node, index) => { node.textContent = values[index] ?? 0; });
}

function renderStatusShortcuts() {
  const currentStatus = filtersForm?.elements.status?.value || "all";
  const currentPriority = filtersForm?.elements.priority?.value || "all";
  statusShortcuts.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.statusShortcut === currentStatus && currentPriority === "all");
  });
  priorityShortcuts.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.priorityShortcut === currentPriority);
  });
}

function renderList() {
  if (!listEl) return;
  listEl.innerHTML = contacts
    .map((contact) => {
      const active = contact.id === selectedId ? " is-active" : "";
      const overdue = isOverdue(contact) ? " is-overdue" : "";
      return `<button class="admin-request${active}${overdue}" type="button" data-contact-id="${escapeHtml(contact.id)}">
        <span class="admin-request-head"><strong>${escapeHtml(contact.request_number || contact.full_name || "Demande TVF")}</strong><small>${escapeHtml(formatDate(contact.created_at))}</small></span>
        <span>${escapeHtml(contact.subject || "Sans objet")}</span>
        <span class="admin-request-sub">${escapeHtml(contact.full_name || "Contact sans nom")} - ${escapeHtml(label(channelLabels, contact.channel))}</span>
        <span class="admin-badges">
          <em data-kind="status">${escapeHtml(label(statusLabels, contact.status))}</em>
          <em data-kind="priority">${escapeHtml(label(priorityLabels, contact.priority))}</em>
          <em data-kind="category">${escapeHtml(label(categoryLabels, contact.category))}</em>
          <em data-kind="score">${escapeHtml(String(contact.qualification_score || contact.assistant?.qualification_score || 0))}%</em>
        </span>
      </button>`;
    })
    .join("");

  if (emptyEl) emptyEl.hidden = contacts.length !== 0;
  if (countEl) {
    const late = contacts.filter(isOverdue).length;
    countEl.textContent = `${contacts.length} demande${contacts.length > 1 ? "s" : ""} affichee${contacts.length > 1 ? "s" : ""}${late ? ` - ${late} en retard` : ""}`;
  }
}

function csvCell(value) {
  const text = String(value || "").replace(/\r?\n|\r/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function exportContactsCsv() {
  if (!contacts.length) {
    alert("Aucune demande a exporter avec les filtres actuels.");
    return;
  }
  const headers = [
    "Numero",
    "Date",
    "Statut",
    "Priorite",
    "Categorie",
    "Pole",
    "Canal",
    "Nom",
    "Email",
    "Sujet",
    "Prochaine action",
    "Echeance",
    "Score qualification",
    "Pieces manquantes",
    "Charge du suivi",
    "Notes internes",
  ];
  const rows = contacts.map((contact) => [
    contact.request_number,
    formatDate(contact.created_at),
    label(statusLabels, contact.status),
    label(priorityLabels, contact.priority),
    label(categoryLabels, contact.category),
    contact.pole,
    label(channelLabels, contact.channel),
    contact.full_name,
    contact.email,
    contact.subject,
    contact.next_action,
    formatDate(contact.next_action_due_at),
    contact.qualification_score,
    piecesText(contact),
    contact.assigned_to,
    contact.internal_notes,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `demandes-tvf-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function selectedContact() {
  return contacts.find((item) => item.id === selectedId) || null;
}

function templateOptions() {
  return Object.entries(responseTemplates)
    .map(([value, text]) => `<option value="${value}" ${value === "auto" ? "selected" : ""}>${escapeHtml(text)}</option>`)
    .join("");
}

function selectOptions(map, selected) {
  return Object.entries(map)
    .map(([value, text]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(text)}</option>`)
    .join("");
}

function renderAssistant(contact) {
  const assistant = contact.assistant || {};
  const pieces = piecesText(contact)
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  return `<section class="admin-ai-panel" aria-label="Qualification assistee">
    <div class="admin-panel-head">
      <div>
        <p class="section-kicker">Assistant IA</p>
        <h4>Qualification proposee</h4>
      </div>
      <strong>${escapeHtml(String(contact.qualification_score || assistant.qualification_score || 0))}%</strong>
    </div>
    <div class="admin-ai-grid">
      <div><span>Categorie</span><strong>${escapeHtml(label(categoryLabels, assistant.suggested_category || contact.category))}</strong></div>
      <div><span>Pole</span><strong>${escapeHtml(assistant.suggested_pole || contact.pole || "Accueil & orientation")}</strong></div>
      <div><span>Priorite</span><strong>${escapeHtml(label(priorityLabels, assistant.suggested_priority || contact.priority))}</strong></div>
      <div><span>Echeance</span><strong>${escapeHtml(formatDate(assistant.next_action_due_at || contact.next_action_due_at))}</strong></div>
    </div>
    <p>${escapeHtml(assistant.ai_summary || contact.ai_summary || "Analyse automatique indisponible.")}</p>
    <div class="admin-missing-pieces">
      <span>Pieces manquantes</span>
      ${pieces.length ? `<ul>${pieces.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>Aucune piece bloquante detectee.</p>"}
    </div>
  </section>`;
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
      <p class="section-kicker">${escapeHtml(contact.request_number || "Demande TVF")} - recue le ${escapeHtml(formatDate(contact.created_at))}</p>
      <h3>${escapeHtml(contact.subject || "Demande TVF")}</h3>
      <p>${escapeHtml(contact.full_name || "Nom non renseigne")}</p>
    </div>

    <div class="admin-meta-grid">
      <div><span>E-mail</span><a href="mailto:${escapeHtml(contact.email || "")}">${escapeHtml(contact.email || "Non renseigne")}</a></div>
      <div><span>Canal</span><strong>${escapeHtml(label(channelLabels, contact.channel))}</strong></div>
      <div><span>Source</span><strong>${escapeHtml(contact.source_page || "Site TVF")}</strong></div>
      <div><span>Mise a jour</span><strong>${escapeHtml(formatDate(contact.updated_at))}</strong></div>
      <div><span>Suivi</span><strong>${escapeHtml(contact.assigned_to || "A affecter")}</strong></div>
      <div><span>Prochaine action</span><strong>${escapeHtml(contact.next_action || contact.assistant?.next_action || "A definir")}</strong></div>
    </div>

    <ol class="admin-case-flow" aria-label="Parcours de traitement">
      <li class="${contact.status ? "is-done" : ""}"><span>1</span><strong>Reception</strong><small>Demande enregistree</small></li>
      <li class="${["a_qualifier", "en_cours", "rendez_vous", "en_attente", "accepte", "refuse", "archive"].includes(contact.status) ? "is-done" : ""}"><span>2</span><strong>Qualification</strong><small>Categorie, pieces, priorite</small></li>
      <li class="${["en_cours", "rendez_vous", "en_attente", "accepte", "archive"].includes(contact.status) ? "is-done" : ""}"><span>3</span><strong>Suivi</strong><small>Relance ou rendez-vous</small></li>
      <li class="${["accepte", "refuse", "archive"].includes(contact.status) ? "is-done" : ""}"><span>4</span><strong>Decision</strong><small>Dossier, refus ou archive</small></li>
    </ol>

    ${renderAssistant(contact)}

    <div class="admin-quick-actions" aria-label="Actions rapides">
      <button class="btn secondary" type="button" data-quick-status="a_qualifier">A qualifier</button>
      <button class="btn secondary" type="button" data-quick-status="en_cours">En cours</button>
      <button class="btn secondary" type="button" data-quick-status="rendez_vous">Rendez-vous</button>
      <button class="btn secondary" type="button" data-quick-template="pieces">Demander pieces</button>
      <button class="btn secondary" type="button" data-quick-followup="48h">Relance 48h</button>
      <button class="btn secondary" type="button" data-prepare-case>Preparer dossier</button>
      <button class="btn ghost" type="button" data-quick-status="refuse">Refuser</button>
      <button class="btn ghost" type="button" data-quick-status="archive">Archiver</button>
    </div>

    <label>Statut
      <select name="status">
        ${selectOptions(statusLabels, contact.status)}
      </select>
    </label>

    <label>Priorite
      <select name="priority">
        ${selectOptions(priorityLabels, contact.priority)}
      </select>
    </label>

    <label>Categorie
      <select name="category">
        ${selectOptions(categoryLabels, contact.category)}
      </select>
    </label>

    <label>Canal
      <select name="channel">
        ${selectOptions(channelLabels, contact.channel)}
      </select>
    </label>

    <label>Pole concerne
      <input name="pole" type="text" value="${escapeHtml(contact.pole || "")}" placeholder="Ex. Habitat vivant">
    </label>

    <label>Charge du suivi
      <input name="assigned_to" type="text" value="${escapeHtml(contact.assigned_to || "")}" placeholder="Ex. TVF, Edryan, Jordan">
    </label>

    <label>Prochaine action
      <input name="next_action" type="text" value="${escapeHtml(contact.next_action || "")}" placeholder="Ex. Relancer pour les photos">
    </label>

    <label>Echeance prochaine action
      <input name="next_action_due_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(contact.next_action_due_at))}">
    </label>

    <label>Pieces manquantes
      <textarea name="missing_pieces" rows="4" placeholder="Une piece par ligne">${escapeHtml(piecesText(contact))}</textarea>
    </label>

    <label>Motif de cloture ou refus
      <textarea name="closure_reason" rows="3" placeholder="A renseigner si refus, reorientation ou archivage">${escapeHtml(contact.closure_reason || "")}</textarea>
    </label>

    <label>Notes internes
      <textarea name="internal_notes" rows="6" placeholder="Historique, relance, prochaine action...">${escapeHtml(contact.internal_notes || "")}</textarea>
    </label>

    <section class="admin-response-panel" aria-label="Modele de reponse">
      <div class="admin-response-head">
        <div>
          <p class="section-kicker">Reponse externe</p>
          <h4>Brouillon pret a adapter</h4>
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

    <section class="admin-conversion-panel" aria-label="Conversion future en dossier">
      <div>
        <p class="section-kicker">Conversion dossier</p>
        <h4>Prete pour le module Dossiers</h4>
        <p>Cette action marque la demande comme acceptee pour etude et conserve la prochaine action. La creation du dossier metier sera activee quand le module Dossiers sera developpe.</p>
      </div>
      <button class="btn secondary" type="button" data-prepare-case>Marquer pret dossier</button>
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
    renderStatusShortcuts();
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
  data.next_action_due_at = fromDateTimeLocal(data.next_action_due_at);
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

function openCreateModal() {
  if (!createModal) return;
  createModal.hidden = false;
  createForm?.querySelector("input, select, textarea")?.focus();
}

function closeCreateModal() {
  if (!createModal) return;
  createModal.hidden = true;
  if (createStatus) createStatus.hidden = true;
}

async function createContactFromForm(event) {
  event.preventDefault();
  if (!createForm) return;
  const data = Object.fromEntries(new FormData(createForm));
  if (createStatus) {
    createStatus.hidden = false;
    createStatus.textContent = "Creation de la demande...";
  }
  try {
    const result = await api("/api/admin-contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    createForm.reset();
    contacts = [result.contact, ...contacts.filter((item) => item.id !== result.contact.id)];
    selectedId = result.contact.id;
    closeCreateModal();
    renderStatusShortcuts();
    renderList();
    renderDetail();
  } catch (error) {
    if (createStatus) createStatus.textContent = error.message;
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
  exportButton?.addEventListener("click", exportContactsCsv);
  logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin"; });
  createButton?.addEventListener("click", openCreateModal);
  createForm?.addEventListener("submit", createContactFromForm);
  closeCreateButtons.forEach((button) => button.addEventListener("click", closeCreateModal));
  createModal?.addEventListener("click", (event) => {
    if (event.target === createModal) closeCreateModal();
  });

  statusShortcuts.forEach((button) => {
    button.addEventListener("click", () => {
      const statusSelect = filtersForm?.elements.status;
      const prioritySelect = filtersForm?.elements.priority;
      if (!statusSelect) return;
      statusSelect.value = button.dataset.statusShortcut || "all";
      if (prioritySelect) prioritySelect.value = "all";
      loadContacts().catch((error) => alert(error.message));
    });
  });

  priorityShortcuts.forEach((button) => {
    button.addEventListener("click", () => {
      const statusSelect = filtersForm?.elements.status;
      const prioritySelect = filtersForm?.elements.priority;
      if (!prioritySelect) return;
      prioritySelect.value = button.dataset.priorityShortcut || "all";
      if (statusSelect) statusSelect.value = "all";
      loadContacts().catch((error) => alert(error.message));
    });
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

    const quickTemplate = event.target.closest("[data-quick-template]");
    if (quickTemplate) {
      await updateSelected({ status: "en_attente", next_action: "Attendre les pieces demandees" });
      const updated = selectedContact();
      const select = detailEl.querySelector("[data-response-template]");
      const textarea = detailEl.querySelector("[data-response-body]");
      if (select) select.value = quickTemplate.dataset.quickTemplate;
      if (textarea) textarea.value = responseTemplate(updated || contact, quickTemplate.dataset.quickTemplate);
      return;
    }

    const quickFollowup = event.target.closest("[data-quick-followup]");
    if (quickFollowup) {
      const due = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      await updateSelected({ status: "en_cours", next_action: "Relancer le demandeur sous 48h", next_action_due_at: due });
      return;
    }

    const prepareCase = event.target.closest("[data-prepare-case]");
    if (prepareCase) {
      await updateSelected({ status: "accepte", next_action: "Creer le dossier metier quand le module Dossiers sera ouvert" });
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

