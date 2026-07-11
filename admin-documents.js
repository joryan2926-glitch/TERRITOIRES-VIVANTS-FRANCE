const DOCUMENTS_TOKEN_KEY = "tvfAdminToken";
const documentTypeLabels = { piece: "Piece", photo: "Photo", convention: "Convention", courrier: "Courrier", email: "E-mail", budget: "Budget", compte_rendu: "Compte rendu", fiche: "Fiche", registre: "Registre", formulaire: "Formulaire", kit: "Kit", preuve: "Preuve", modele_genere: "Modele genere", autre: "Autre" };
const documentStatusLabels = { brouillon: "Brouillon", a_classer: "A classer", a_valider: "A valider", valide: "Valide", remplace: "Remplace", archive: "Archive" };
const templateTypeLabels = { courrier: "Courrier", email: "E-mail", convention: "Convention", fiche: "Fiche", registre: "Registre", budget: "Budget", formulaire: "Formulaire", grille: "Grille", compte_rendu: "Compte rendu", financeur: "Financeur", autre: "Autre" };
const templateStatusLabels = { brouillon: "Brouillon", a_valider: "A valider", officiel: "Officiel", remplace: "Remplace", archive: "Archive" };
const confidentialityLabels = { public: "Public", interne: "Interne", confidentiel: "Confidentiel", sensible: "Sensible" };
const relatedLabels = { case: "Dossier", request: "Demande", contact: "Contact", organization: "Organisation", project: "Projet", template: "Modele", none: "Aucun" };

const loginSection = document.querySelector("[data-documents-login]");
const appSection = document.querySelector("[data-documents-app]");
const tokenForm = document.querySelector("[data-documents-token-form]");
const loginStatus = document.querySelector("[data-documents-login-status]");
const filtersForm = document.querySelector("[data-documents-filters]");
const listEl = document.querySelector("[data-documents-list]");
const detailEl = document.querySelector("[data-documents-detail]");
const countEl = document.querySelector("[data-documents-count]");
const emptyEl = document.querySelector("[data-documents-empty]");
const kpisEl = document.querySelector("[data-documents-kpis]");
const globalControlEl = document.querySelector("[data-documents-control-global]");
const refreshButton = document.querySelector("[data-documents-refresh]");
const logoutButton = document.querySelector("[data-documents-logout]");
const exportButton = document.querySelector("[data-documents-export]");
const createButton = document.querySelector("[data-documents-create]");
const templateCreateButton = document.querySelector("[data-templates-create]");
const modal = document.querySelector("[data-documents-modal]");
const templateModal = document.querySelector("[data-templates-modal]");
const modalForm = document.querySelector("[data-documents-form]");
const templateForm = document.querySelector("[data-templates-form]");
const closeModalButtons = document.querySelectorAll("[data-documents-close-modal]");
const closeTemplateModalButtons = document.querySelectorAll("[data-templates-close-modal]");
const viewButtons = document.querySelectorAll("[data-documents-view]");
const relatedPresetButtons = document.querySelectorAll("[data-documents-related-preset]");

let documents = [];
let templates = [];
let dashboard = null;
let selectedId = null;
let view = "documents";
let debounceTimer;

function token() { try { return sessionStorage.getItem(DOCUMENTS_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(DOCUMENTS_TOKEN_KEY, value); else sessionStorage.removeItem(DOCUMENTS_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function openDocumentsEntryModal(config) {
  return new Promise((resolve) => {
    const wrapper = document.createElement("section");
    wrapper.className = "admin-modal";
    wrapper.setAttribute("aria-label", config.title || "Saisie documentaire");
    const fields = (config.fields || []).map((field) => {
      const required = field.required ? "required" : "";
      const value = escapeHtml(field.value || "");
      if (field.type === "textarea") return `<label>${escapeHtml(field.label)}<textarea name="${escapeHtml(field.name)}" rows="${field.rows || 4}" ${required} placeholder="${escapeHtml(field.placeholder || "")}">${value}</textarea></label>`;
      if (field.type === "select") return `<label>${escapeHtml(field.label)}<select name="${escapeHtml(field.name)}" ${required}>${Object.entries(field.options || {}).map(([key, labelText]) => `<option value="${escapeHtml(key)}" ${field.value === key ? "selected" : ""}>${escapeHtml(labelText)}</option>`).join("")}</select></label>`;
      return `<label>${escapeHtml(field.label)}<input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type || "text")}" value="${value}" ${required} placeholder="${escapeHtml(field.placeholder || "")}"></label>`;
    }).join("");
    wrapper.innerHTML = `<div class="admin-modal-panel documents-entry-panel"><div class="admin-modal-head"><div><p class="section-kicker">Bibliotheque documentaire</p><h2>${escapeHtml(config.title || "Nouvelle saisie")}</h2><p>${escapeHtml(config.description || "Completez les informations necessaires au document.")}</p></div><button class="btn ghost" type="button" data-entry-cancel>Fermer</button></div><form class="admin-create-form documents-entry-form" data-entry-form>${fields}<div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">${escapeHtml(config.submitLabel || "Enregistrer")}</button><button class="btn secondary" type="button" data-entry-cancel>Annuler</button></div></form></div>`;
    const close = (value = null) => { wrapper.remove(); resolve(value); };
    wrapper.addEventListener("click", (event) => { if (event.target === wrapper || event.target.closest("[data-entry-cancel]")) close(null); });
    wrapper.querySelector("[data-entry-form]")?.addEventListener("submit", (event) => { event.preventDefault(); close(Object.fromEntries(new FormData(event.currentTarget))); });
    document.body.appendChild(wrapper);
    wrapper.querySelector("input, textarea, select")?.focus();
  });
}
function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function label(map, value) { return map[value] || value || "Non renseigne"; }
function formatDate(value) { if (!value) return "Non renseigne"; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date); }
function toDateTimeLocal(value) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000); return local.toISOString().slice(0, 16); }
function fromDateTimeLocal(value) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toISOString(); }
async function api(path, options = {}) { const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(options.headers || {}) } }); const text = await response.text(); const result = text ? JSON.parse(text) : { ok: response.ok }; if (!response.ok || result.ok === false) throw new Error(result.error || "Action impossible."); return result; }
function fileToBase64(file) { return new Promise((resolve, reject) => { if (!file) return resolve(null); const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = () => reject(reader.error || new Error("Lecture fichier impossible.")); reader.readAsDataURL(file); }); }
function currentItems() { return view === "templates" ? templates : documents; }
function selectedItem() { return currentItems().find((item) => item.id === selectedId) || null; }
function filtersParams() { const data = new FormData(filtersForm); const params = new URLSearchParams(); ["q", "document_type", "confidentiality_level", "related_object_type", "related_object_id"].forEach((name) => { const value = String(data.get(name) || "").trim(); if (value) params.set(name, value); }); params.set("limit", "120"); return params; }
function documentParamsForView() { const params = filtersParams(); if (["a_classer", "a_valider", "valide", "archive"].includes(view)) params.set("status", view); return params; }
async function loadDashboard() { const result = await api("/api/admin-documents?entity=dashboard"); dashboard = result.dashboard || {}; renderKpis(); renderGlobalControlPanel(); }
async function loadItems() { if (countEl) countEl.textContent = view === "templates" ? "Chargement des modeles..." : "Chargement des documents..."; if (view === "templates") { const result = await api(`/api/admin-documents?entity=templates&${filtersParams().toString()}`); templates = result.templates || []; if (!templates.some((item) => item.id === selectedId)) selectedId = templates[0]?.id || null; } else { const result = await api(`/api/admin-documents?${documentParamsForView().toString()}`); documents = result.documents || []; if (!documents.some((item) => item.id === selectedId)) selectedId = documents[0]?.id || null; } await loadDashboard().catch(() => {}); renderTabs(); renderList(); renderDetail(); }
function renderKpis() { if (!kpisEl || !dashboard) return; kpisEl.innerHTML = `<article><span>Documents</span><strong>${dashboard.documents_total || 0}</strong><small>Total</small></article><article data-tone="warning"><span>A classer</span><strong>${dashboard.a_classer || 0}</strong><small>Tri requis</small></article><article data-tone="info"><span>A valider</span><strong>${dashboard.a_valider || 0}</strong><small>Decision humaine</small></article><article data-tone="danger"><span>Sensibles</span><strong>${dashboard.sensibles || 0}</strong><small>Acces prudent</small></article><article><span>Modeles</span><strong>${dashboard.templates_officiels || 0}/${dashboard.templates_total || 0}</strong><small>Officiels</small></article>`; }
function renderGlobalControlPanel() {
  if (!globalControlEl || !dashboard) return;
  const toClassify = Number(dashboard.a_classer || 0);
  const toValidate = Number(dashboard.a_valider || 0);
  const sensitive = Number(dashboard.sensibles || 0);
  const official = Number(dashboard.templates_officiels || 0);
  const totalTemplates = Number(dashboard.templates_total || 0);
  const linkedCases = Number(dashboard.linked_cases || 0);
  const unlinked = Number(dashboard.non_rattaches || 0);
  const nextDecision = toClassify ? "Classer les documents" : toValidate ? "Valider les pieces" : unlinked ? "Rattacher les pieces" : sensitive ? "Controler les acces" : "Maintenir la bibliotheque";
  globalControlEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Pilotage documentaire</p><h3>Garder des pieces propres, tracables et utilisables</h3><p>Cette synthese distingue les documents a classer, les pieces a valider, les elements sensibles, les documents rattaches aux dossiers et les modeles officiels.</p></div><strong>${escapeHtml(nextDecision)}</strong></div><div class="documents-control-grid"><article data-tone="warning"><span>A classer</span><strong>${escapeHtml(toClassify)}</strong><small>tri requis</small></article><article data-tone="success"><span>A valider</span><strong>${escapeHtml(toValidate)}</strong><small>decision humaine</small></article><article data-tone="danger"><span>Sensibles</span><strong>${escapeHtml(sensitive)}</strong><small>acces prudent</small></article><article data-tone="success"><span>Dossiers</span><strong>${escapeHtml(linkedCases)}</strong><small>pieces rattachees</small></article><article data-tone="warning"><span>Non rattaches</span><strong>${escapeHtml(unlinked)}</strong><small>a affecter</small></article><article><span>Modeles officiels</span><strong>${escapeHtml(official)}/${escapeHtml(totalTemplates)}</strong><small>national</small></article></div><div class="documents-control-actions"><button class="btn secondary" type="button" data-documents-related-preset="case">Voir pieces dossiers</button><button class="btn secondary" type="button" data-documents-related-preset="none">Pieces non rattachees</button><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-procedures">Procedures</a></div>`;
}function renderTabs() { viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.documentsView === view)); }
function renderList() { if (!listEl) return; const items = currentItems(); listEl.innerHTML = items.map((item) => view === "templates" ? templateCard(item) : documentCard(item)).join(""); if (emptyEl) emptyEl.hidden = items.length !== 0; if (countEl) countEl.textContent = `${items.length} ${view === "templates" ? "modele" : "document"}${items.length > 1 ? "s" : ""} affiche${items.length > 1 ? "s" : ""}`; }
function documentCard(item) { const assistant = item.assistant || {}; return `<button class="admin-request documents-card${item.id === selectedId ? " is-active" : ""}${item.confidentiality_level === "sensible" ? " is-sensitive" : ""}" type="button" data-item-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(item.document_number || "Document")}</strong><small>${escapeHtml(label(documentStatusLabels, item.status))}</small></span><span>${escapeHtml(item.title)}</span><span class="admin-request-sub">${escapeHtml(label(documentTypeLabels, item.document_type))} - ${escapeHtml(label(relatedLabels, item.related_object_type))}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(label(confidentialityLabels, item.confidentiality_level))}</em><em data-kind="category">v${escapeHtml(item.version || 1)}</em><em data-kind="status">${assistant.knowledge_ready ? "Indexable" : "A traiter"}</em></span></button>`; }
function templateCard(item) { const assistant = item.assistant || {}; return `<button class="admin-request documents-card${item.id === selectedId ? " is-active" : ""}" type="button" data-item-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(item.template_key || "Modele")}</strong><small>${escapeHtml(label(templateStatusLabels, item.status))}</small></span><span>${escapeHtml(item.title)}</span><span class="admin-request-sub">${escapeHtml(label(templateTypeLabels, item.template_type))} - version ${escapeHtml(item.version || 1)}</span><span class="admin-badges"><em data-kind="priority">${item.national_validated ? "National" : "Local"}</em><em data-kind="category">${(item.required_fields || []).length} champs</em><em data-kind="status">${assistant.generation_ready ? "Pret" : "Brouillon"}</em></span></button>`; }
function options(map, selected) { return Object.entries(map).map(([value, text]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join(""); }
function assistantDocumentPanel(item) { const assistant = item.assistant || {}; const missing = assistant.missing_fields || []; return `<section class="admin-ai-panel documents-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant documentaire</p><h4>Classement et prudence</h4></div><strong>${assistant.sensitive_detected ? "Sensible" : "OK"}</strong></div><p>${escapeHtml(assistant.summary || "Synthese indisponible.")}</p><div class="admin-ai-grid"><div><span>Statut propose</span><strong>${escapeHtml(label(documentStatusLabels, assistant.suggested_status))}</strong></div><div><span>Confidentialite</span><strong>${escapeHtml(label(confidentialityLabels, assistant.suggested_confidentiality))}</strong></div><div><span>Connaissance</span><strong>${assistant.knowledge_ready ? "Indexable" : "Non"}</strong></div><div><span>Expiration</span><strong>${escapeHtml(formatDate(item.expires_at))}</strong></div></div><div class="admin-missing-pieces"><span>Elements a completer</span>${missing.length ? `<ul>${missing.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>` : "<p>Classement suffisant.</p>"}</div></section>`; }
function assistantTemplatePanel(item) { const assistant = item.assistant || {}; return `<section class="admin-ai-panel documents-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant modele</p><h4>Generation</h4></div><strong>${assistant.generation_ready ? "Pret" : "A valider"}</strong></div><p>${escapeHtml(assistant.summary || "Synthese indisponible.")}</p><div class="admin-ai-grid"><div><span>Champs requis</span><strong>${escapeHtml(String((item.required_fields || []).length))}</strong></div><div><span>Usage</span><strong>${escapeHtml(assistant.suggested_use || "A definir")}</strong></div><div><span>National</span><strong>${item.national_validated ? "Oui" : "Non"}</strong></div><div><span>Version</span><strong>${escapeHtml(String(item.version || 1))}</strong></div></div></section>`; }
function documentWorkflowPanel(item) {
  const hasFile = Boolean(item.file_id || item.files?.id);
  const isLinked = Boolean(item.related_object_id && item.related_object_type && item.related_object_type !== "none");
  const isClassified = Boolean(item.document_type && item.document_type !== "piece" && item.status !== "a_classer");
  const isValidated = item.status === "valide";
  const steps = [
    ["Depot", hasFile, "Fichier ou piece enregistree"],
    ["Rattachement", isLinked, "Lien avec dossier, demande ou structure"],
    ["Classement", isClassified, "Type, confidentialite et resume"],
    ["Validation", isValidated, "Document utilisable officiellement"],
    ["Exploitation", isValidated && isLinked, "Pret pour instruction ou reporting"]
  ];
  return `<ol class="documents-workflow-path" aria-label="Parcours documentaire">${steps.map((step, index) => `<li class="${step[1] ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[2])}</small></li>`).join("")}</ol>`;
}
function instructionPiecesPanel(item) {
  const related = item.related_object_type || "none";
  const packs = {
    case: ["fiche dossier ou besoin", "pieces justificatives", "photos ou preuves", "note d'instruction", "decision ou convention"],
    request: ["message initial", "coordonnees", "pieces recues", "qualification", "reponse envoyee"],
    organization: ["fiche structure", "interlocuteur", "capacite d'engagement", "proposition de cooperation", "convention ou compte rendu"],
    contact: ["coordonnees", "consentement RGPD", "historique echange", "rattachement structure", "prochaine action"],
    project: ["note projet", "budget", "calendrier", "points de vigilance", "indicateurs"],
    branch: ["territoire", "responsable", "plan d'action", "documents de lancement", "reporting"]
  };
  const pieces = packs[related] || ["objet a rattacher", "type a preciser", "resume de classement", "confidentialite", "validation humaine"];
  return `<section class="documents-panel documents-instruction-pack"><div class="admin-panel-head"><div><p class="section-kicker">Pieces attendues</p><h4>Controle d'instruction</h4></div><strong>${escapeHtml(label(relatedLabels, related))}</strong></div><ul>${pieces.map((piece) => `<li>${escapeHtml(piece)}</li>`).join("")}</ul><p>Ce bloc sert de repere interne : il aide a verifier que le document est utile, rattache au bon objet et exploitable dans un dossier TVF.</p></section>`;
}
function templateWorkflowPanel(item) {
  const hasFile = Boolean(item.file_id || item.files?.id);
  const hasFields = Array.isArray(item.required_fields) && item.required_fields.length > 0;
  const isValidated = item.status === "officiel" && item.national_validated === true;
  const steps = [
    ["Redaction", Boolean(item.description || item.ai_summary), "Usage et limites decrits"],
    ["Fichier", hasFile, "Modele source rattache"],
    ["Champs", hasFields, "Variables a completer"],
    ["Validation", isValidated, "Modele officiel TVF"],
    ["Generation", isValidated && hasFields, "Brouillon utilisable"]
  ];
  return `<ol class="templates-workflow-path" aria-label="Parcours de validation du modele">${steps.map((step, index) => `<li class="${step[1] ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[2])}</small></li>`).join("")}</ol>`;
}
function templateUsePanel(item) {
  const guides = {
    convention: ["Parties signataires", "Objet de la cooperation", "Duree", "Engagements reciproques", "Validation et signature"],
    courrier: ["Destinataire", "Objet", "Contexte", "Demande precise", "Pieces jointes"],
    email: ["Destinataire", "Objet", "Message", "Prochaine etape", "Signature"],
    fiche: ["Objet", "Contexte", "Acteurs", "Pieces", "Decision attendue"],
    budget: ["Postes", "Montants", "Hypotheses", "Financements", "Justificatifs"],
    financeur: ["Dispositif", "Eligibilite", "Budget", "Impact", "Pieces attendues"],
    compte_rendu: ["Date", "Participants", "Points abordes", "Decisions", "Actions"],
  };
  const checklist = guides[item.template_type] || ["Usage", "Champs", "Limites", "Validation", "Archivage"];
  return `<section class="documents-panel templates-use-panel"><div class="admin-panel-head"><div><p class="section-kicker">Cadre d'utilisation</p><h4>${escapeHtml(label(templateTypeLabels, item.template_type))}</h4></div><strong>${item.national_validated ? "National" : "A valider"}</strong></div><ul>${checklist.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul><p>Un modele engageant doit rester un brouillon tant qu'il n'a pas ete relu et valide humainement.</p></section>`;
}
function documentControlPanel(item) {
  const assistant = item.assistant || {};
  const missing = assistant.missing_fields || [];
  const hasFile = Boolean(item.file_id || item.files?.id);
  const isLinked = Boolean(item.related_object_id && item.related_object_type && item.related_object_type !== "none");
  const isValidated = item.status === "valide";
  const isSensitive = item.confidentiality_level === "sensible" || assistant.sensitive_detected;
  const isExpired = item.expires_at && new Date(item.expires_at).getTime() < Date.now();
  const usable = hasFile && isLinked && isValidated && !isExpired;
  const cards = [
    { label: "Etat", value: usable ? "Exploitable" : label(documentStatusLabels, item.status), detail: usable ? "Pret pour instruction" : "Validation ou classement requis", tone: usable ? "success" : "neutral" },
    { label: "Fichier", value: hasFile ? "Present" : "Manquant", detail: item.files?.original_filename || "Aucun fichier source", tone: hasFile ? "success" : "warning" },
    { label: "Rattachement", value: isLinked ? label(relatedLabels, item.related_object_type) : "A classer", detail: item.related_object_id || "Aucun objet lie", tone: isLinked ? "success" : "warning" },
    { label: "Prudence", value: isSensitive ? "Sensible" : label(confidentialityLabels, item.confidentiality_level), detail: missing.length ? `${missing.length} point(s) a completer` : "Controle suffisant", tone: isSensitive ? "danger" : "neutral" },
    { label: "Validite", value: isExpired ? "Expire" : formatDate(item.expires_at), detail: isExpired ? "A renouveler ou archiver" : "Echeance documentaire", tone: isExpired ? "danger" : "neutral" },
  ];
  return `<section class="documents-control-panel" aria-label="Pilotage documentaire">
    <div class="admin-panel-head">
      <div>
        <p class="section-kicker">Pilotage documentaire</p>
        <h4>Verifier avant usage officiel</h4>
        <p>Un document n'est exploitable que s'il est rattache, classe, valide et compatible avec son niveau de confidentialite.</p>
      </div>
      <a class="text-link" href="admin-dossiers">Retour dossiers</a>
    </div>
    <div class="documents-control-grid">
      ${cards.map((card) => `<article data-tone="${escapeHtml(card.tone)}"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.detail)}</small></article>`).join("")}
    </div>
  </section>`;
}

function templateControlPanel(item) {
  const assistant = item.assistant || {};
  const hasFile = Boolean(item.file_id || item.files?.id);
  const hasFields = Array.isArray(item.required_fields) && item.required_fields.length > 0;
  const official = item.status === "officiel" && item.national_validated === true;
  const cards = [
    { label: "Etat", value: official ? "Officiel" : label(templateStatusLabels, item.status), detail: official ? "Utilisable comme modele TVF" : "Validation nationale requise", tone: official ? "success" : "neutral" },
    { label: "Fichier", value: hasFile ? "Present" : "Manquant", detail: item.files?.original_filename || "Source a rattacher", tone: hasFile ? "success" : "warning" },
    { label: "Champs", value: String((item.required_fields || []).length), detail: hasFields ? "Variables declarees" : "Aucun champ declare", tone: hasFields ? "success" : "warning" },
    { label: "Generation", value: assistant.generation_ready ? "Prete" : "A valider", detail: assistant.suggested_use || "Usage a cadrer", tone: assistant.generation_ready ? "success" : "neutral" },
  ];
  return `<section class="documents-control-panel" aria-label="Pilotage modele">
    <div class="admin-panel-head">
      <div>
        <p class="section-kicker">Pilotage du modele</p>
        <h4>Controler avant diffusion interne</h4>
        <p>Un modele officiel doit comporter un usage clair, un fichier source, des champs utiles et une validation nationale.</p>
      </div>
      <a class="text-link" href="admin-documents">Bibliotheque</a>
    </div>
    <div class="documents-control-grid documents-control-grid-template">
      ${cards.map((card) => `<article data-tone="${escapeHtml(card.tone)}"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.detail)}</small></article>`).join("")}
    </div>
  </section>`;
}
function renderDetail() { const item = selectedItem(); if (!detailEl) return; if (!item) { detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez un element</h3><p>Aucun element disponible.</p></div>`; return; } detailEl.innerHTML = view === "templates" ? templateDetail(item) : documentDetail(item); }
function relatedContextPanel(item) {
  const type = item.related_object_type || "none";
  const relatedId = item.related_object_id || "";
  const hasContext = type && type !== "none" && relatedId;
  return `<section class="documents-panel documents-context-panel"><div class="admin-panel-head"><div><p class="section-kicker">Contexte lie</p><h4>${escapeHtml(label(relatedLabels, type))}</h4></div><strong>${hasContext ? "Rattache" : "A classer"}</strong></div><div class="documents-context-grid"><div><span>Objet</span><strong>${escapeHtml(label(relatedLabels, type))}</strong></div><div><span>Identifiant</span><code>${escapeHtml(relatedId || "Non renseigne")}</code></div><div><span>Usage</span><strong>${hasContext ? "Instruction et suivi" : "Classement a completer"}</strong></div></div><div class="admin-detail-actions"><button class="btn secondary" type="button" data-filter-related="same" ${hasContext ? "" : "disabled"}>Voir documents lies</button>${type === "case" && relatedId ? `<a class="btn secondary" href="admin-dossiers?q=${encodeURIComponent(relatedId)}">Ouvrir le dossier</a>` : ""}<button class="btn secondary" type="button" data-copy-related-id="${escapeHtml(relatedId)}" ${relatedId ? "" : "disabled"}>Copier ID</button></div></section>`;
}
function documentFilePanel(item) {
  const assistant = item.assistant || {};
  const file = item.files || {};
  const hasFile = Boolean(item.file_id || file.id);
  const isLinked = Boolean(item.related_object_id && item.related_object_type && item.related_object_type !== "none");
  const isValidated = item.status === "valide";
  const isSensitive = item.confidentiality_level === "sensible" || assistant.sensitive_detected;
  const usage = isLinked ? "Piece exploitable dans un parcours d'instruction" : "Piece a rattacher avant usage";
  const fileLabel = file.original_filename || (hasFile ? "Fichier rattache" : "Aucun fichier source");
  return `<section class="documents-file-panel" aria-label="Fichier documentaire"><div class="admin-panel-head"><div><p class="section-kicker">Fichier documentaire</p><h4>${escapeHtml(item.document_number || "Document TVF")}</h4><p>Vue de controle pour savoir si la piece est rattachee au bon dossier, suffisamment classee et utilisable avant envoi ou decision.</p></div><strong>${escapeHtml(label(documentStatusLabels, item.status))}</strong></div><div class="documents-file-grid"><article><span>Document</span><strong>${escapeHtml(item.title || "A nommer")}</strong><small>${escapeHtml(label(documentTypeLabels, item.document_type))}</small></article><article><span>Fichier</span><strong>${escapeHtml(fileLabel)}</strong><small>${file.size_bytes ? `${Math.round(file.size_bytes / 1024)} Ko` : "Taille non renseignee"}</small></article><article><span>Rattachement</span><strong>${escapeHtml(isLinked ? label(relatedLabels, item.related_object_type) : "A classer")}</strong><small>${escapeHtml(item.related_object_id || "ID a renseigner")}</small></article><article><span>Usage</span><strong>${escapeHtml(usage)}</strong><small>${escapeHtml(label(confidentialityLabels, item.confidentiality_level))}</small></article></div><div class="documents-register-grid"><article><h5>Controle</h5><p>${escapeHtml(assistant.summary || item.ai_summary || "Document a qualifier et valider humainement.")}</p></article><article><h5>Validation</h5><p>${escapeHtml(isValidated ? "Document valide pour l'instruction." : "Validation humaine requise avant usage officiel.")}</p></article><article><h5>Prudence</h5><p>${escapeHtml(isSensitive ? "Document sensible : diffusion limitee et controle d'acces requis." : "Confidentialite standard selon le dossier.")}</p></article></div></section>`;
}

function documentActionsPanel(item) {
  const file = item.files || {};
  const hasContext = item.related_object_id && item.related_object_type && item.related_object_type !== "none";
  return `<section class="documents-action-panel"><div class="admin-panel-head"><div><p class="section-kicker">Actions documentaires</p><h4>Classer, rattacher, valider et exploiter</h4><p>Les actions sont regroupees pour eviter les doublons et garder une logique simple entre document, dossier, validation et telechargement.</p></div></div><div class="documents-action-groups"><article><h5>1. Enregistrer</h5><button class="btn primary" type="submit">Enregistrer</button><button class="btn secondary" type="button" data-document-quick="a_classer">A classer</button></article><article><h5>2. Rattacher</h5><button class="btn secondary" type="button" data-filter-related="same" ${hasContext ? "" : "disabled"}>Voir documents lies</button><button class="btn secondary" type="button" data-copy-related-id="${escapeHtml(item.related_object_id || "")}" ${item.related_object_id ? "" : "disabled"}>Copier ID rattache</button></article><article><h5>3. Valider</h5><button class="btn secondary" type="button" data-document-quick="a_valider">Soumettre validation</button><button class="btn secondary" type="button" data-document-quick="valide">Valider</button></article><article><h5>4. Exploiter</h5><a class="btn secondary" href="admin-dossiers">Dossiers</a><a class="btn secondary" href="admin-work">Taches</a>${file.id ? `<button class="btn secondary" type="button" data-download-file="${escapeHtml(file.id)}">Telecharger</button>` : ""}<button class="btn ghost" type="button" data-document-quick="archive">Archiver</button></article></div><p class="form-note" data-documents-save-status hidden></p></section>`;
}
function documentDetail(item) { const file = item.files || {}; return `<form class="admin-detail-form documents-detail-form" data-document-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(item.document_number || "Document")}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(label(documentTypeLabels, item.document_type))} - ${escapeHtml(label(documentStatusLabels, item.status))}</p></div><div class="admin-meta-grid"><div><span>Fichier</span><strong>${escapeHtml(file.original_filename || "Aucun")}</strong></div><div><span>Taille</span><strong>${file.size_bytes ? Math.round(file.size_bytes / 1024) + " Ko" : "Non renseigne"}</strong></div><div><span>Scan</span><strong>${escapeHtml(file.virus_scan_status || "Non renseigne")}</strong></div><div><span>Creation</span><strong>${escapeHtml(formatDate(item.created_at))}</strong></div></div>${assistantDocumentPanel(item)}${documentFilePanel(item)}${documentControlPanel(item)}${documentWorkflowPanel(item)}${relatedContextPanel(item)}${instructionPiecesPanel(item)}<label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Statut<select name="status">${options(documentStatusLabels, item.status)}</select></label><label>Type<select name="document_type">${options(documentTypeLabels, item.document_type)}</select></label><label>Confidentialite<select name="confidentiality_level">${options(confidentialityLabels, item.confidentiality_level)}</select></label><label>Rattachement<select name="related_object_type">${options(relatedLabels, item.related_object_type)}</select></label><label>ID rattache<input name="related_object_id" value="${escapeHtml(item.related_object_id || "")}"></label><label>Expiration<input name="expires_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.expires_at))}"></label><label>Nouvelle version<input name="file" type="file" accept=".pdf,.docx,.xlsx,.pptx,.txt,.md,.csv,.jpg,.jpeg,.png,.webp,application/pdf,image/*"></label><label class="documents-wide-field">Resume IA<textarea name="ai_summary" rows="4">${escapeHtml(item.ai_summary || "")}</textarea></label><label class="documents-wide-field">Notes de classement<textarea name="classification_notes" rows="4">${escapeHtml(item.classification_notes || "")}</textarea></label>${documentActionsPanel(item)}</form>`; }
function templateDetail(item) { const file = item.files || {}; return `<form class="admin-detail-form documents-detail-form" data-template-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(item.template_key || "Modele")}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(label(templateTypeLabels, item.template_type))} - ${escapeHtml(label(templateStatusLabels, item.status))}</p></div><div class="admin-meta-grid"><div><span>Fichier</span><strong>${escapeHtml(file.original_filename || "Aucun")}</strong></div><div><span>National</span><strong>${item.national_validated ? "Oui" : "Non"}</strong></div><div><span>Version</span><strong>${escapeHtml(String(item.version || 1))}</strong></div><div><span>Creation</span><strong>${escapeHtml(formatDate(item.created_at))}</strong></div></div>${assistantTemplatePanel(item)}${templateControlPanel(item)}${templateWorkflowPanel(item)}${templateUsePanel(item)}<label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Cle modele<input name="template_key" value="${escapeHtml(item.template_key || "")}"></label><label>Type<select name="template_type">${options(templateTypeLabels, item.template_type)}</select></label><label>Statut<select name="status">${options(templateStatusLabels, item.status)}</select></label><label>Validation nationale<select name="national_validated"><option value="false" ${!item.national_validated ? "selected" : ""}>Non</option><option value="true" ${item.national_validated ? "selected" : ""}>Oui</option></select></label><label>Fichier modele<input name="file" type="file" accept=".pdf,.docx,.xlsx,.pptx,.txt,.md,.csv,application/pdf"></label><label class="documents-wide-field">Champs requis<input name="required_fields" value="${escapeHtml((item.required_fields || []).join(", "))}"></label><label class="documents-wide-field">Description<textarea name="description" rows="4">${escapeHtml(item.description || "")}</textarea></label><section class="documents-panel"><p class="section-kicker">Actions</p><div class="admin-detail-actions"><button class="btn primary" type="submit">Enregistrer</button><button class="btn secondary" type="button" data-generate-template="${escapeHtml(item.id)}">Generer brouillon</button><button class="btn secondary" type="button" data-template-quick="officiel">Valider national</button><button class="btn ghost" type="button" data-template-quick="archive">Archiver</button>${file.id ? `<button class="btn secondary" type="button" data-download-file="${escapeHtml(file.id)}">Telecharger</button>` : ""}</div><p class="form-note" data-documents-save-status hidden></p></section></form>`; }
async function payloadFromForm(form, base = {}) { const data = Object.fromEntries(new FormData(form)); Object.assign(data, base); if (data.expires_at) data.expires_at = fromDateTimeLocal(data.expires_at); const file = form.querySelector('input[type="file"]')?.files?.[0]; if (file) { data.file_base64 = await fileToBase64(file); data.file_name = file.name; data.mime_type = file.type || "application/octet-stream"; } return data; }
async function saveDocument(form) { const statusEl = form.querySelector("[data-documents-save-status]"); try { statusEl.hidden = false; statusEl.textContent = "Enregistrement..."; const data = await payloadFromForm(form, { type: "document" }); const result = await api("/api/admin-documents", { method: "PATCH", body: JSON.stringify(data) }); documents = documents.map((item) => item.id === data.id ? result.document : item); renderList(); renderDetail(); await loadDashboard().catch(() => {}); notify("Document enregistre.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); } }
async function saveTemplate(form) { const statusEl = form.querySelector("[data-documents-save-status]"); try { statusEl.hidden = false; statusEl.textContent = "Enregistrement..."; const data = await payloadFromForm(form, { type: "template" }); const result = await api("/api/admin-documents", { method: "PATCH", body: JSON.stringify(data) }); templates = templates.map((item) => item.id === data.id ? result.template : item); renderList(); renderDetail(); await loadDashboard().catch(() => {}); notify("Modele enregistre.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); } }
async function quickDocument(status) { const item = selectedItem(); if (!item || view === "templates") return; const result = await api("/api/admin-documents", { method: "PATCH", body: JSON.stringify({ type: "document", id: item.id, status, audit_note: "Action rapide" }) }); documents = documents.map((doc) => doc.id === item.id ? result.document : doc); renderList(); renderDetail(); await loadDashboard().catch(() => {}); }
async function quickTemplate(status) { const item = selectedItem(); if (!item || view !== "templates") return; const result = await api("/api/admin-documents", { method: "PATCH", body: JSON.stringify({ type: "template", id: item.id, status, national_validated: status === "officiel" ? "true" : item.national_validated }) }); templates = templates.map((tpl) => tpl.id === item.id ? result.template : tpl); renderList(); renderDetail(); await loadDashboard().catch(() => {}); }
async function createDocument(event) { event.preventDefault(); const statusEl = modalForm.querySelector("[data-documents-modal-status]"); try { statusEl.hidden = false; statusEl.textContent = "Depot..."; const data = await payloadFromForm(modalForm, { type: "document" }); const result = await api("/api/admin-documents", { method: "POST", body: JSON.stringify(data) }); documents = [result.document, ...documents]; selectedId = result.document.id; modalForm.reset(); closeModal(); view = "documents"; renderTabs(); renderList(); renderDetail(); await loadDashboard().catch(() => {}); notify("Document enregistre.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); } }
async function createTemplate(event) { event.preventDefault(); const statusEl = templateForm.querySelector("[data-templates-modal-status]"); try { statusEl.hidden = false; statusEl.textContent = "Creation..."; const data = await payloadFromForm(templateForm, { type: "template" }); const result = await api("/api/admin-documents", { method: "POST", body: JSON.stringify(data) }); templates = [result.template, ...templates]; selectedId = result.template.id; templateForm.reset(); closeTemplateModal(); view = "templates"; renderTabs(); renderList(); renderDetail(); await loadDashboard().catch(() => {}); notify("Modele cree.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); } }
async function generateFromTemplate(id) {
  const template = templates.find((item) => item.id === id) || selectedItem();
  if (!template) return;
  const requiredFields = (template.required_fields || []).slice(0, 12);
  const fields = [
    { name: "title", label: "Titre du brouillon", required: true, value: template.title ? `Brouillon - ${template.title}` : "Brouillon TVF" },
    { name: "relatedType", label: "Rattachement", type: "select", value: "case", options: relatedLabels },
    { name: "relatedId", label: "ID de l'objet rattache", placeholder: "UUID du dossier, de la demande ou de l'organisation" },
    ...requiredFields.map((field, index) => ({ name: `field_${index}`, label: `Champ requis - ${field}`, type: "textarea", rows: 3, placeholder: "Valeur a injecter dans le modele" }))
  ];
  const data = await openDocumentsEntryModal({ title: "Generer un brouillon", description: "Renseignez les informations utiles avant de creer un document issu du modele selectionne.", submitLabel: "Generer le brouillon", fields });
  if (!data?.title) return;
  const relatedType = data.relatedType || "none";
  const fieldValues = {};
  requiredFields.forEach((field, index) => { fieldValues[field] = data[`field_${index}`] || ""; });
  const result = await api("/api/admin-documents", { method: "POST", body: JSON.stringify({ type: "generated", template_id: id, title: data.title, generated_from_object_type: relatedType, generated_from_object_id: relatedType !== "none" ? (data.relatedId || "") : "", field_values: fieldValues }) });
  view = "documents";
  documents = [result.document, ...documents];
  selectedId = result.document.id;
  renderTabs();
  renderList();
  renderDetail();
  await loadDashboard().catch(() => {});
  notify("Brouillon genere dans la bibliotheque documentaire.", "success");
}
function setRelatedPreset(value) {
  if (!filtersForm) return;
  const typeInput = filtersForm.querySelector("[name='related_object_type']");
  const idInput = filtersForm.querySelector("[name='related_object_id']");
  if (typeInput) typeInput.value = value === "all" ? "all" : value;
  if (idInput && value !== "same") idInput.value = "";
  view = "documents";
  selectedId = null;
  loadItems().catch((e) => notifyError(e));
}
function filterSameRelated() {
  const item = selectedItem();
  if (!item || !filtersForm) return;
  const typeInput = filtersForm.querySelector("[name='related_object_type']");
  const idInput = filtersForm.querySelector("[name='related_object_id']");
  if (typeInput) typeInput.value = item.related_object_type || "all";
  if (idInput) idInput.value = item.related_object_id || "";
  view = "documents";
  selectedId = null;
  loadItems().catch((e) => notifyError(e));
}
async function copyRelatedId(id) { if (!id) return; try { await navigator.clipboard.writeText(id); notify("ID rattache copie.", "success"); } catch { notify("Copie automatique impossible. Copiez l\'ID depuis le champ affiche.", "warning"); } }
async function downloadFile(fileId) { const response = await fetch(`/api/admin-documents?entity=file&file_id=${encodeURIComponent(fileId)}`, { headers: { Authorization: `Bearer ${token()}` } }); if (!response.ok) throw new Error("Telechargement impossible."); const blob = await response.blob(); const disposition = response.headers.get("Content-Disposition") || ""; const match = disposition.match(/filename="([^"]+)"/); const filename = match ? match[1] : "document-tvf"; const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); notify("Export documents prepare.", "success"); }
function exportCsv() { const items = currentItems(); if (!items.length) return notify("Aucun element a exporter.", "warning"); const headers = view === "templates" ? ["Cle", "Titre", "Type", "Statut", "National", "Version"] : ["Numero", "Titre", "Type", "Statut", "Confidentialite", "Rattachement", "Version"]; const rows = view === "templates" ? items.map((item) => [item.template_key, item.title, label(templateTypeLabels, item.template_type), label(templateStatusLabels, item.status), item.national_validated ? "Oui" : "Non", item.version]) : items.map((item) => [item.document_number, item.title, label(documentTypeLabels, item.document_type), label(documentStatusLabels, item.status), label(confidentialityLabels, item.confidentiality_level), label(relatedLabels, item.related_object_type), item.version]); const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `documents-tvf-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); notify("Export documents prepare.", "success"); }
function openModal() { if (modal) modal.hidden = false; modalForm?.querySelector("input, select, textarea")?.focus(); }
function closeModal() { if (modal) modal.hidden = true; }
function openTemplateModal() { if (templateModal) templateModal.hidden = false; templateForm?.querySelector("input, select, textarea")?.focus(); }
function closeTemplateModal() { if (templateModal) templateModal.hidden = true; }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadItems(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadItems().catch((e) => notifyError(e)), 280); }); filtersForm?.addEventListener("change", () => loadItems().catch((e) => notifyError(e))); viewButtons.forEach((button) => button.addEventListener("click", () => { view = button.dataset.documentsView || "documents"; selectedId = null; loadItems().catch((e) => notifyError(e)); })); relatedPresetButtons.forEach((button) => button.addEventListener("click", () => setRelatedPreset(button.dataset.documentsRelatedPreset || "all"))); refreshButton?.addEventListener("click", () => loadItems().catch((e) => notifyError(e))); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; }); exportButton?.addEventListener("click", exportCsv); createButton?.addEventListener("click", openModal); templateCreateButton?.addEventListener("click", openTemplateModal); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); closeTemplateModalButtons.forEach((button) => button.addEventListener("click", closeTemplateModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); templateModal?.addEventListener("click", (event) => { if (event.target === templateModal) closeTemplateModal(); }); modalForm?.addEventListener("submit", createDocument); templateForm?.addEventListener("submit", createTemplate); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-item-id]"); if (!button) return; selectedId = button.dataset.itemId; renderList(); renderDetail(); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-document-detail-form], [data-template-detail-form]"); if (!form) return; event.preventDefault(); if (form.matches("[data-template-detail-form]")) saveTemplate(form); else saveDocument(form); }); detailEl?.addEventListener("click", (event) => { const documentQuick = event.target.closest("[data-document-quick]"); if (documentQuick) quickDocument(documentQuick.dataset.documentQuick).catch((e) => notifyError(e)); const templateQuick = event.target.closest("[data-template-quick]"); if (templateQuick) quickTemplate(templateQuick.dataset.templateQuick).catch((e) => notifyError(e)); const generator = event.target.closest("[data-generate-template]"); if (generator) generateFromTemplate(generator.dataset.generateTemplate).catch((e) => notifyError(e)); const sameRelated = event.target.closest("[data-filter-related]"); if (sameRelated) filterSameRelated(); const copyRelated = event.target.closest("[data-copy-related-id]"); if (copyRelated) copyRelatedId(copyRelated.dataset.copyRelatedId); const download = event.target.closest("[data-download-file]"); if (download) downloadFile(download.dataset.downloadFile).catch((e) => notifyError(e)); }); }
globalControlEl?.addEventListener("click", (event) => { const preset = event.target.closest("[data-documents-related-preset]"); if (preset) setRelatedPreset(preset.dataset.documentsRelatedPreset || "all"); });
bindEvents();
if (token()) { showApp(); loadItems().catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); }); } else { showLogin(); }
