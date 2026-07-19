const CASES_TOKEN_KEY = "tvfAdminToken";
const typeLabels = { bien_vacant: "Bien vacant", commerce_inoccupe: "Commerce inoccupe", materiaux: "Materiaux", collectivite: "Collectivite", entreprise: "Entreprise", benevole: "Benevole", financeur: "Financeur", signalement: "Signalement", friche_terrain: "Friche / terrain", presse: "Presse", gouvernance: "Autre", autre: "Autre" };
const statusLabels = { ouvert: "Ouvert", qualification: "Qualification", instruction: "Instruction", attente_pieces: "Attente pieces", visite: "Visite", a_decision: "A decision", decision_validee: "Decision validee", cloture: "Cloture", archive: "Archive" };
const priorityLabels = { normale: "Normale", haute: "Haute", urgente: "Urgente" };
const decisionLabels = { non_preparee: "Non preparee", a_preparer: "A preparer", proposee: "Proposee", validee: "Validee", refusee: "Refusee", ajournee: "Ajournee" };
const riskLabels = { faible: "Faible", modere: "Modere", eleve: "Eleve", critique: "Critique" };
const checklistLabels = { a_verifier: "A verifier", manquant: "Manquant", recu: "Recu", valide: "Valide", non_applicable: "N/A" };

const loginSection = document.querySelector("[data-cases-login]");
const appSection = document.querySelector("[data-cases-app]");
const tokenForm = document.querySelector("[data-cases-token-form]");
const loginStatus = document.querySelector("[data-cases-login-status]");
const filtersForm = document.querySelector("[data-cases-filters]");
const listEl = document.querySelector("[data-cases-list]");
const detailEl = document.querySelector("[data-cases-detail]");
const countEl = document.querySelector("[data-cases-count]");
const emptyEl = document.querySelector("[data-cases-empty]");
const kpisEl = document.querySelector("[data-cases-kpis]");
const priorityPanelEl = document.querySelector("[data-cases-priority-panel]");
const refreshButton = document.querySelector("[data-cases-refresh]");
const logoutButton = document.querySelector("[data-cases-logout]");
const exportButton = document.querySelector("[data-cases-export]");
const createButton = document.querySelector("[data-cases-create]");
const modal = document.querySelector("[data-cases-modal]");
const modalForm = document.querySelector("[data-cases-form]");
const closeModalButtons = document.querySelectorAll("[data-cases-close-modal]");
const statusButtons = document.querySelectorAll("[data-case-status]");
const statusFilter = document.querySelector("[data-cases-status-filter]");

let cases = [];
let dashboard = null;
let selectedId = null;
let debounceTimer;

function token() { try { return sessionStorage.getItem(CASES_TOKEN_KEY) || ""; } catch { return ""; } }
function setToken(value) { try { if (value) sessionStorage.setItem(CASES_TOKEN_KEY, value); else sessionStorage.removeItem(CASES_TOKEN_KEY); } catch {} }
function showApp() { if (loginSection) loginSection.hidden = true; if (appSection) appSection.hidden = false; }
function showLogin() { if (loginSection) loginSection.hidden = false; if (appSection) appSection.hidden = true; }
function setStatus(message, type = "info") { if (!loginStatus) return; loginStatus.hidden = !message; loginStatus.textContent = message; loginStatus.dataset.status = type; }
function notify(message, type = "info") { if (window.tvfAdminNotice) window.tvfAdminNotice(message, type); else if (type === "error") console.error(message); else console.log(message); }
function notifyError(error, fallback = "Action impossible pour le moment.") { notify(error?.message || fallback, "error"); }
function openCaseEntryModal(config) {
  return new Promise((resolve) => {
    const wrapper = document.createElement("section");
    wrapper.className = "admin-modal";
    wrapper.setAttribute("aria-label", config.title || "Saisie dossier");
    const fields = (config.fields || []).map((field) => {
      const required = field.required ? "required" : "";
      const value = escapeHtml(field.value || "");
      if (field.type === "textarea") return `<label>${escapeHtml(field.label)}<textarea name="${escapeHtml(field.name)}" rows="${field.rows || 4}" ${required} placeholder="${escapeHtml(field.placeholder || "")}">${value}</textarea></label>`;
      if (field.type === "select") return `<label>${escapeHtml(field.label)}<select name="${escapeHtml(field.name)}" ${required}>${Object.entries(field.options || {}).map(([key, labelText]) => `<option value="${escapeHtml(key)}" ${field.value === key ? "selected" : ""}>${escapeHtml(labelText)}</option>`).join("")}</select></label>`;
      return `<label>${escapeHtml(field.label)}<input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type || "text")}" value="${value}" ${required} placeholder="${escapeHtml(field.placeholder || "")}"></label>`;
    }).join("");
    wrapper.innerHTML = `<div class="admin-modal-panel cases-modal-panel cases-entry-panel"><div class="admin-modal-head"><div><p class="section-kicker">Instruction dossier</p><h2>${escapeHtml(config.title || "Nouvelle saisie")}</h2><p>${escapeHtml(config.description || "Completez les informations utiles au suivi du dossier.")}</p></div><button class="btn ghost" type="button" data-entry-cancel>Fermer</button></div><form class="admin-create-form cases-create-form" data-entry-form>${fields}<div class="admin-detail-actions admin-create-wide"><button class="btn primary" type="submit">${escapeHtml(config.submitLabel || "Enregistrer")}</button><button class="btn secondary" type="button" data-entry-cancel>Annuler</button></div></form></div>`;
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
function filtersParams() { const data = new FormData(filtersForm); const params = new URLSearchParams(); ["q", "status", "case_type", "priority"].forEach((name) => { const value = String(data.get(name) || "").trim(); if (value) params.set(name, value); }); params.set("limit", "120"); return params; }
async function loadDashboard() { const result = await api("/api/admin-cases?entity=dashboard"); dashboard = result.dashboard || {}; renderKpis(); }
async function loadCases() { if (countEl) countEl.textContent = "Chargement des dossiers..."; const result = await api(`/api/admin-cases?${filtersParams().toString()}`); cases = result.cases || []; if (!cases.some((item) => item.id === selectedId)) selectedId = cases[0]?.id || null; await loadDashboard().catch(() => {}); renderTabs(); renderPriorityPanel(); renderList(); renderDetail(); }
function renderKpis() { if (!kpisEl || !dashboard) return; kpisEl.innerHTML = `<article><span>Total</span><strong>${dashboard.total || 0}</strong><small>Dossiers</small></article><article><span>Actifs</span><strong>${dashboard.active || 0}</strong><small>En cours</small></article><article data-tone="warning"><span>A decision</span><strong>${dashboard.a_decision || 0}</strong><small>Validation humaine</small></article><article data-tone="danger"><span>Retards</span><strong>${dashboard.overdue || 0}</strong><small>Echeances</small></article><article data-tone="info"><span>Maturite</span><strong>${dashboard.average_maturity || 0}%</strong><small>Moyenne</small></article>`; }
function renderTabs() { const current = statusFilter?.value || "all"; statusButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.caseStatus === current)); }
function selectedCase() { return cases.find((item) => item.id === selectedId) || null; }
function isOverdue(item) { return item.next_action_due_at && !["cloture", "archive"].includes(item.status) && new Date(item.next_action_due_at).getTime() < Date.now(); }
function caseNeedsPieces(item) {
  const assistantMissing = item.assistant?.missing_items || [];
  const checklistMissing = (item.case_checklist_items || []).filter((piece) => piece.required && ["a_verifier", "manquant"].includes(piece.status));
  return assistantMissing.length > 0 || checklistMissing.length > 0 || item.status === "attente_pieces";
}
function casePriorityScore(item) {
  let score = 0;
  if (isOverdue(item)) score += 80;
  if (item.priority === "urgente") score += 55;
  if (item.priority === "haute") score += 32;
  if (item.status === "a_decision") score += 42;
  if (item.decision_status === "proposee" || item.decision_status === "a_preparer") score += 24;
  if (caseNeedsPieces(item)) score += 20;
  if (item.risk_level === "critique") score += 35;
  if (item.risk_level === "eleve") score += 18;
  score += Math.max(0, 100 - Number(item.maturity_score || 0)) / 10;
  return score;
}
function casePriorityReason(item) {
  if (isOverdue(item)) return "Echeance depassee";
  if (item.status === "a_decision") return "Decision a preparer";
  if (caseNeedsPieces(item)) return "Pieces a completer";
  if (item.priority === "urgente") return "Priorite urgente";
  if (item.risk_level === "critique" || item.risk_level === "eleve") return "Point de vigilance a cadrer";
  return item.next_action || "Suite a definir";
}
function renderPriorityPanel() {
  if (!priorityPanelEl) return;
  const active = cases.filter((item) => !["cloture", "archive"].includes(item.status));
  const stats = [
    { label: "A traiter", value: active.length, detail: "Dossiers actifs", tone: "neutral" },
    { label: "Retards", value: active.filter(isOverdue).length, detail: "Echeances depassees", tone: "danger" },
    { label: "Pieces", value: active.filter(caseNeedsPieces).length, detail: "Elements a completer", tone: "warning" },
    { label: "Decision", value: active.filter((item) => item.status === "a_decision" || ["a_preparer", "proposee"].includes(item.decision_status)).length, detail: "Validation humaine", tone: "info" }
  ];
  const priorityItems = [...active].sort((a, b) => casePriorityScore(b) - casePriorityScore(a)).slice(0, 4);
  priorityPanelEl.innerHTML = `<div class="admin-panel-head"><div><p class="section-kicker">Pilotage operationnel</p><h3>Dossiers a traiter en priorite</h3><p>Cette synthese classe les dossiers selon les retards, les pieces manquantes, les points de vigilance et les decisions a preparer.</p></div><button class="btn secondary" type="button" data-cases-refresh>Actualiser</button></div><div class="cases-priority-grid">${stats.map((stat) => `<article data-tone="${escapeHtml(stat.tone)}"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong><small>${escapeHtml(stat.detail)}</small></article>`).join("")}</div><div class="cases-priority-list">${priorityItems.length ? priorityItems.map((item) => `<button class="cases-priority-item${item.id === selectedId ? " is-active" : ""}" type="button" data-priority-case-id="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.case_number || "Dossier")}</strong><em>${escapeHtml(casePriorityReason(item))}</em></span><small>${escapeHtml(label(typeLabels, item.case_type))} - ${escapeHtml(label(priorityLabels, item.priority))}</small></button>`).join("") : `<p class="form-note">Aucun dossier actif ne necessite d'arbitrage immediat.</p>`}</div>`;
}
function caseInstructionIndex(status) { const order = ["ouvert", "qualification", "instruction", "attente_pieces", "visite", "a_decision", "decision_validee", "cloture"]; return Math.max(0, order.indexOf(status || "ouvert")); }
function quickDue(days = 7) { const date = new Date(); date.setDate(date.getDate() + days); date.setHours(17, 0, 0, 0); return date.toISOString(); }
function workPriorityFromCase(item) { if (item.priority === "urgente") return "p1"; if (item.priority === "haute") return "p2"; return "p3"; }
const caseWorkflows = {
  bien_vacant: {
    title: "Bien vacant / proprietaire",
    objective: "Verifier la qualite du demandeur, comprendre l'etat du bien et cadrer une suite prudente avant toute visite ou convention.",
    steps: ["Verifier le proprietaire ou mandataire", "Demander adresse, photos et situation connue", "Evaluer securite, acces et contraintes", "Obtenir autorisation de visite", "Preparer scenario d'usage ou orientation"],
    pieces: ["Coordonnees du proprietaire", "Adresse precise", "Photos recentes", "Elements de propriete ou mandat", "Autorisation de visite"],
    risks: ["Propriete non verifiee", "Acces dangereux", "Promesse d'usage trop precoce", "Donnees personnelles", "Assurance et responsabilite"]
  },
  commerce_inoccupe: {
    title: "Commerce inoccupe",
    objective: "Qualifier le local, le contexte de rue et les usages possibles avant mobilisation d'acteurs economiques ou associatifs.",
    steps: ["Identifier le local et son statut", "Qualifier surface, vitrine et accessibilite", "Recenser contraintes techniques", "Evaluer usages possibles", "Preparer contact proprietaire ou collectivite"],
    pieces: ["Adresse", "Photos vitrine/interieur", "Surface approximative", "Contact proprietaire ou gestionnaire", "Contraintes connues"],
    risks: ["Bail ou droit d'usage incertain", "Travaux lourds", "Normes ERP", "Conflit avec acteur existant", "Communication prematuree"]
  },
  materiaux: {
    title: "Materiaux de reemploi",
    objective: "Verifier la nature, l'etat, le volume et la logistique avant acceptation, stockage ou affectation a un projet.",
    steps: ["Identifier donneur et localisation", "Qualifier categories et volumes", "Verifier etat et delai de retrait", "Decider stockage ou affectation", "Tracer remise ou refus"],
    pieces: ["Photos", "Liste des materiaux", "Quantites", "Etat general", "Adresse et delai d'enlevement"],
    risks: ["Materiaux dangereux", "Volume incompatible", "Stockage indisponible", "Transport non organise", "Confusion avec distribution libre"]
  },
  collectivite: {
    title: "Collectivite / territoire",
    objective: "Comprendre le besoin public, le service referent et le cadre de cooperation avant proposition TVF.",
    steps: ["Identifier l'interlocuteur habilite", "Qualifier besoin territorial", "Rattacher aux politiques publiques", "Preparer rendez-vous de cadrage", "Proposer cooperation ou diagnostic"],
    pieces: ["Nom collectivite", "Service referent", "Besoin exprime", "Perimetre territorial", "Calendrier attendu"],
    risks: ["Interlocuteur non decisionnaire", "Attentes hors perimetre", "Confusion avec prestataire", "Absence de cadre juridique", "Engagement financier premature"]
  },
  entreprise: {
    title: "Entreprise / contribution",
    objective: "Identifier la contribution possible, les contraintes et le cadre RSE ou mecenat avant toute valorisation publique.",
    steps: ["Qualifier l'entreprise", "Identifier contribution", "Verifier contraintes", "Proposer cadre de cooperation", "Preparer convention ou suivi"],
    pieces: ["Fiche entreprise", "Contact referent", "Contribution proposee", "Contraintes logistiques", "Accord de principe"],
    risks: ["Promesse non formalisee", "Visibilite avant validation", "Materiaux non conformes", "Responsabilite transport", "Donnees commerciales sensibles"]
  },
  benevole: {
    title: "Benevole / mission solidaire",
    objective: "Orienter la personne vers une mission encadree, compatible avec ses disponibilites et le niveau de vigilance.",
    steps: ["Verifier coordonnees", "Identifier disponibilites", "Qualifier competences", "Associer a une mission", "Transmettre consignes et suivi"],
    pieces: ["Coordonnees", "Disponibilites", "Competences", "Territoire", "Accord de contact"],
    risks: ["Mission non encadree", "Securite terrain", "Donnees personnelles", "Promesse de mission inexistante", "Absence de consignes"]
  },
  financeur: {
    title: "Financeur / mecene",
    objective: "Qualifier les criteres, le calendrier et les pieces attendues avant preparation d'une demande de soutien.",
    steps: ["Identifier financeur", "Analyser criteres", "Selectionner projet compatible", "Preparer note et budget", "Organiser depot ou rendez-vous"],
    pieces: ["Fiche financeur", "Criteres", "Calendrier", "Budget previsionnel", "Note d'opportunite"],
    risks: ["Projet non eligible", "Chiffres non prouves", "Delai court", "Engagement non valide", "Reporting sous-estime"]
  },
  signalement: {
    title: "Signalement citoyen",
    objective: "Verifier prudemment les informations sans publication ni accusation, puis classer, completer ou transformer en dossier.",
    steps: ["Verifier localisation", "Controler photos et description", "Rechercher doublon", "Qualifier type de sujet", "Classer ou transformer en dossier"],
    pieces: ["Adresse ou localisation", "Photos", "Description", "Contact facultatif", "Date du signalement"],
    risks: ["Atteinte a la reputation", "Erreur de proprietaire", "Publication non autorisee", "Donnees personnelles", "Signalement incomplet"]
  },
  friche_terrain: {
    title: "Friche / terrain delaisse",
    objective: "Qualifier le site, les contraintes d'acces et les usages temporaires possibles avant mobilisation territoriale.",
    steps: ["Localiser le site", "Identifier proprietaire ou gestionnaire", "Evaluer acces et contraintes", "Imaginer usages compatibles", "Preparer cadrage territorial"],
    pieces: ["Localisation", "Photos", "Surface approximative", "Proprietaire connu", "Contraintes visibles"],
    risks: ["Pollution", "Securite", "Propriete incertaine", "Usage non autorise", "Cout de remise en etat"]
  },
  autre: {
    title: "Dossier general",
    objective: "Qualifier le besoin, rattacher les bons acteurs et choisir le workflow specialise si necessaire.",
    steps: ["Identifier demandeur", "Qualifier sujet", "Rattacher pole", "Lister pieces", "Decider suite"],
    pieces: ["Coordonnees", "Contexte", "Besoin", "Pieces disponibles", "Prochaine action"],
    risks: ["Sujet flou", "Mauvais rattachement", "Pieces absentes", "Delai non precise", "Decision prematuree"]
  }
};
function workflowForCase(item) { return caseWorkflows[item.case_type] || caseWorkflows.autre; }
function workflowPanel(item) {
  const workflow = workflowForCase(item);
  return `<section class="cases-panel cases-workflow-panel"><div class="admin-panel-head"><div><p class="section-kicker">Procedure applicable</p><h4>${escapeHtml(workflow.title)}</h4></div><strong>${escapeHtml(label(typeLabels, item.case_type))}</strong></div><p>${escapeHtml(workflow.objective)}</p><div class="cases-workflow-grid"><div><h5>Etapes</h5><ol>${workflow.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div><div><h5>Pieces a demander</h5><ul>${workflow.pieces.map((piece) => `<li>${escapeHtml(piece)}</li>`).join("")}</ul></div><div><h5>Points de vigilance</h5><ul>${workflow.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}</ul></div></div></section>`;
}
function nextActionForWorkflow(item, action) {
  const workflow = workflowForCase(item);
  if (action === "pieces") return `Demander les pieces : ${workflow.pieces.slice(0, 4).join(", ")}`;
  if (action === "rdv") return `Preparer rendez-vous de cadrage - ${workflow.title}`;
  if (action === "convention") return `Preparer cadre de cooperation ou convention - ${workflow.title}`;
  return item.next_action || "Action a definir";
}
function instructionPathPanel(item) {
  const current = caseInstructionIndex(item.status);
  const steps = [
    ["Reception", "Demande enregistree"],
    ["Qualification", "Besoin et acteur identifies"],
    ["Instruction", "Pieces et faisabilite"],
    ["Visite", "Terrain ou echange technique"],
    ["Decision", "Validation humaine"],
    ["Suite", "Convention ou cloture"]
  ];
  const statusToStep = item.status === "attente_pieces" ? 2 : item.status === "visite" ? 3 : item.status === "a_decision" ? 4 : item.status === "decision_validee" || item.status === "cloture" ? 5 : Math.min(current, 2);
  return `<ol class="cases-instruction-path" aria-label="Parcours d'instruction du dossier">${steps.map((step, index) => `<li class="${index <= statusToStep ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[1])}</small></li>`).join("")}</ol>`;
}
function moduleChainPanel(item) {
  const decisionReady = ["a_decision", "decision_validee", "cloture"].includes(item.status) || ["a_preparer", "proposee", "validee"].includes(item.decision_status);
  const decisionValidated = item.status === "decision_validee" || item.decision_status === "validee" || item.status === "cloture";
  const steps = [
    { label: "Instruction", detail: "Dossier, pieces et responsable", href: "admin-dossiers", state: "is-current" },
    { label: "Finances", detail: "Budget et justificatifs", href: "admin-finances", state: decisionValidated ? "is-ready" : "" },
    { label: "Impact", detail: "Valeurs, preuves et bilan", href: "admin-impact", state: decisionValidated ? "is-ready" : "" }
  ];
  return `<nav class="cases-module-chain" aria-label="Chaine de traitement du dossier">
    <div class="admin-panel-head"><div><p class="section-kicker">Suite du dossier</p><h4>Instruction, moyens et impact</h4><p>Suite logique du dossier.</p></div></div>
    <ol>${steps.map((step, index) => `<li class="${escapeHtml(step.state)}"><a href="${escapeHtml(step.href)}"><span>${index + 1}</span><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.detail)}</small></a></li>`).join("")}</ol>
  </nav>`;
}function documentPackForCase(item) {
  const workflow = workflowForCase(item);
  return [
    { key: "fiche", title: "Fiche d'instruction", type: "fiche", summary: `Synthese du dossier, workflow applicable, pieces attendues et points de vigilance. Procedure : ${workflow.title}.` },
    { key: "pieces", title: "Demande de pieces", type: "courrier", summary: `Courrier ou message de demande des pieces : ${workflow.pieces.join("; ")}.` },
    { key: "convention", title: "Cadre de cooperation", type: "convention", summary: `Brouillon de convention ou cadre de cooperation a adapter apres validation humaine. Vigilances : ${workflow.risks.join("; ")}.` },
    { key: "decision", title: "Note de decision", type: "compte_rendu", summary: `Note preparatoire pour decision humaine : contexte, points de vigilance, pieces, recommandation et prochaine etape.` }
  ];
}
function documentsPanel(item) {
  const docs = documentPackForCase(item);
  return `<section class="cases-panel cases-documents-panel"><div class="admin-panel-head"><div><p class="section-kicker">Documents utiles</p><h4>Preparer les pieces du dossier</h4></div><strong>${docs.length}</strong></div><p>Brouillons a verifier avant usage officiel.</p><div class="cases-documents-grid">${docs.map((doc) => `<article><strong>${escapeHtml(doc.title)}</strong><span>${escapeHtml(label(typeLabels, item.case_type))}</span><p>${escapeHtml(doc.summary)}</p><button class="btn secondary" type="button" data-case-document="${escapeHtml(doc.key)}">Preparer</button></article>`).join("")}</div><div class="admin-detail-actions"><button class="btn primary" type="button" data-case-document="pack">Creer le pack documentaire</button><a class="btn secondary" href="admin-documents#bibliotheque-interne-tvf">Ouvrir Documents</a></div></section>`;
}
function renderList() { if (!listEl) return; listEl.innerHTML = cases.map((item) => `<button class="admin-request cases-card${item.id === selectedId ? " is-active" : ""}${isOverdue(item) ? " is-overdue" : ""}" type="button" data-case-id="${escapeHtml(item.id)}"><span class="admin-request-head"><strong>${escapeHtml(item.case_number || "Dossier")}</strong><small>${escapeHtml(label(statusLabels, item.status))}</small></span><span>${escapeHtml(item.title)}</span><span class="admin-request-sub">${escapeHtml(label(typeLabels, item.case_type))} - ${escapeHtml(item.main_pole || "Pole non renseigne")}</span><span class="admin-badges"><em data-kind="priority">${escapeHtml(label(priorityLabels, item.priority))}</em><em data-kind="category">${escapeHtml(item.maturity_score || 0)}%</em><em data-kind="status">${escapeHtml(label(riskLabels, item.risk_level))}</em></span></button>`).join(""); if (emptyEl) emptyEl.hidden = cases.length !== 0; if (countEl) countEl.textContent = `${cases.length} dossier${cases.length > 1 ? "s" : ""} affiche${cases.length > 1 ? "s" : ""}`; }
function options(map, selected) { return Object.entries(map).map(([value, text]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join(""); }
function assistantPanel(item) { const assistant = item.assistant || {}; const missing = assistant.missing_items || []; return `<section class="admin-ai-panel cases-ai-panel"><div class="admin-panel-head"><div><p class="section-kicker">Assistant dossier</p><h4>Synthese d'instruction</h4></div><strong>${escapeHtml(String(item.maturity_score || assistant.maturity_score || 0))}%</strong></div><p>${escapeHtml(assistant.summary || item.ai_summary || "Synthese indisponible.")}</p><div class="admin-ai-grid"><div><span>Statut propose</span><strong>${escapeHtml(label(statusLabels, assistant.suggested_status))}</strong></div><div><span>Decision</span><strong>${escapeHtml(assistant.suggested_decision || "A preparer")}</strong></div><div><span>Blocage</span><strong>${assistant.blocked ? "Oui" : "Non"}</strong></div><div><span>Echeance</span><strong>${escapeHtml(formatDate(item.next_action_due_at))}</strong></div></div><div class="admin-missing-pieces"><span>Elements manquants</span>${missing.length ? `<ul>${missing.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>` : "<p>Checklist suffisamment avancee.</p>"}</div></section>`; }
function instructionControlPanel(item) {
  const assistant = item.assistant || {};
  const missing = assistant.missing_items || [];
  const risks = item.case_risks || [];
  const decisions = item.case_decisions || [];
  const maturity = Number(item.maturity_score || assistant.maturity_score || 0);
  const riskLevel = item.risk_level || "modere";
  const isLate = item.next_action_due_at && !["cloture", "archive"].includes(item.status) && new Date(item.next_action_due_at).getTime() < Date.now();
  const readyForDecision = maturity >= 80 && missing.length === 0 && riskLevel !== "critique";
  const statusText = readyForDecision ? "Decision possible" : assistant.blocked ? "Instruction bloquee" : "Instruction en cours";
  const statusTone = readyForDecision ? "success" : assistant.blocked || isLate ? "warning" : "neutral";
  const cards = [
    { label: "Etat", value: statusText, detail: label(statusLabels, item.status), tone: statusTone },
    { label: "Maturite", value: `${maturity}%`, detail: missing.length ? `${missing.length} element(s) a completer` : "Pieces principales couvertes", tone: maturity >= 80 ? "success" : "neutral" },
    { label: "Vigilance", value: label(riskLabels, riskLevel), detail: `${risks.length} point(s) de vigilance trace(s)`, tone: riskLevel === "critique" || riskLevel === "eleve" ? "danger" : "neutral" },
    { label: "Echeance", value: formatDate(item.next_action_due_at), detail: isLate ? "Retard a traiter" : item.next_action || "Action a definir", tone: isLate ? "danger" : "neutral" },
    { label: "Decision", value: label(decisionLabels, item.decision_status), detail: `${decisions.length} decision(s) tracee(s)`, tone: readyForDecision ? "success" : "neutral" },
  ];
  return `<section class="cases-control-panel" aria-label="Pilotage du dossier">
    <div class="admin-panel-head">
      <div>
        <p class="section-kicker">Pilotage du dossier</p>
        <h4>Priorite d'instruction et suite a donner</h4>
        <p>Prochaine action et niveau de maturite.</p>
      </div>
      <a class="text-link" href="admin-demandes">Retour demandes</a>
    </div>
    <div class="cases-control-grid">
      ${cards.map((card) => `<article data-tone="${escapeHtml(card.tone)}"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small>${escapeHtml(card.detail)}</small></article>`).join("")}
    </div>
    <div class="cases-control-actions">
      <button class="btn secondary" type="button" data-case-workflow="pieces">Demander les pieces</button>
      <button class="btn secondary" type="button" data-case-create-task>Creer une tache</button>
      <button class="btn secondary" type="button" data-case-quick="a_decision">Preparer decision</button>
      <a class="btn secondary" href="admin-documents#bibliotheque-interne-tvf">Documents</a>
      <a class="btn secondary" href="admin-work">Taches</a>
    </div>
  </section>`;
}
function clientDossierSchemaPanel(item) {
  const source = sourceRequestLabel(item);
  const category = label(typeLabels, item.case_type) || "Categorie a definir";
  const status = label(statusLabels, item.status) || "Statut a definir";
  const steps = [
    ["Coordonnees", primaryParticipant(item)?.display_name || item.assigned_to || item.territory || "Contact et territoire a completer"],
    ["Categorie", category],
    ["Statut", status],
    ["Numero dossier", item.case_number || "Generation automatique"],
    ["Fichier client", source],
    ["Documents", "Pieces rattachees"],
    ["Instruction", item.next_action || "Prochaine action a definir"]
  ];
  const dossierQuery = encodeURIComponent(item.case_number || item.title || item.source_request_id || "");
  const demandHref = sourceRequestHref(item);
  const documentsHref = dossierQuery ? `admin-documents?q=${dossierQuery}#bibliotheque-interne-tvf` : "admin-documents#bibliotheque-interne-tvf";
  const tasksHref = dossierQuery ? `admin-work?q=${dossierQuery}` : "admin-work";
  return `<section class="cases-panel cases-client-schema-panel" aria-label="Schema de construction du dossier client">
    <div class="admin-panel-head"><div><p class="section-kicker">Fichier client</p><h4>Construction du dossier par etape</h4><p>Vue directe : demande, pieces, instruction et prochaine action.</p></div><strong>${escapeHtml(item.case_number || "Dossier")}</strong></div>
    <ol class="cases-instruction-path cases-client-file-path">${steps.map((step, index) => `<li class="${index <= caseInstructionIndex(item.status) + 2 ? "is-done" : ""}"><span>${index + 1}</span><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[1])}</small></li>`).join("")}</ol>
    <div class="admin-detail-actions"><a class="btn secondary" href="${demandHref}">Demande source</a><a class="btn secondary" href="${documentsHref}">Documents du dossier</a><a class="btn secondary" href="${tasksHref}">Taches d'instruction</a></div>
  </section>`;
}
function sourceRequestLabel(item) {
  if (!item?.source_request_id) return "Non rattachee";
  const participant = primaryParticipant(item);
  if (participant?.display_name) return `Demande source - ${participant.display_name}`;
  return "Demande source rattachee";
}

function sourceRequestHref(item) {
  return item?.source_request_id ? `admin-demandes?q=${encodeURIComponent(item.source_request_id)}` : "admin-demandes";
}
function primaryParticipant(item) {
  const participants = item.case_participants || [];
  return participants.find((participant) => participant.is_primary) || participants[0] || null;
}
function caseFilePanel(item) {
  const workflow = workflowForCase(item);
  const checklist = item.case_checklist_items || [];
  const risks = item.case_risks || [];
  const decisions = item.case_decisions || [];
  const required = checklist.filter((piece) => piece.required);
  const received = checklist.filter((piece) => ["recu", "valide"].includes(piece.status));
  const missing = checklist.filter((piece) => piece.required && ["a_verifier", "manquant"].includes(piece.status));
  const source = sourceRequestLabel(item);
  const participant = primaryParticipant(item);
  const participantName = participant?.display_name || source;
  const participantRole = participant?.role_label || (item.source_request_id ? "Demande source" : "A rattacher");
  const next = item.next_action || nextActionForWorkflow(item, "pieces");
  return `<section class="cases-file-panel" aria-label="Fichier dossier complet"><div class="admin-panel-head"><div><p class="section-kicker">Dossier complet</p><h4>${escapeHtml(item.case_number || "Dossier TVF")}</h4><p>Synthese du dossier, des pieces et de la suite.</p></div><strong>${escapeHtml(label(statusLabels, item.status))}</strong></div><div class="cases-file-grid"><article><span>Objet</span><strong>${escapeHtml(item.title || "A qualifier")}</strong><small>${escapeHtml(label(typeLabels, item.case_type))}</small></article><article><span>Territoire</span><strong>${escapeHtml(item.territory || "A preciser")}</strong><small>${escapeHtml(item.main_pole || "Pole a definir")}</small></article><article><span>Responsable</span><strong>${escapeHtml(item.assigned_to || "Non assigne")}</strong><small>${escapeHtml(label(priorityLabels, item.priority))}</small></article><article><span>Interlocuteur</span><strong>${escapeHtml(participantName)}</strong><small>${escapeHtml(participantRole)}</small></article></div><div class="cases-register-grid"><article><h5>Instruction</h5><p>${escapeHtml(workflow.objective)}</p><ul><li>${escapeHtml(workflow.steps[0] || "Qualifier")}</li><li>${escapeHtml(workflow.steps[1] || "Verifier")}</li><li>${escapeHtml(workflow.steps[2] || "Decider")}</li></ul></article><article><h5>Pieces</h5><p>${escapeHtml(received.length)} piece(s) recue(s) sur ${escapeHtml(required.length || checklist.length)} attendue(s).</p>${missing.length ? `<ul>${missing.slice(0, 4).map((piece) => `<li>${escapeHtml(piece.label)}</li>`).join("")}</ul>` : "<p>Pas de piece obligatoire manquante identifiee.</p>"}</article><article><h5>Vigilance</h5><p>${escapeHtml(risks.length)} point(s) de vigilance trace(s), ${escapeHtml(decisions.length)} decision(s) enregistree(s).</p><p>${escapeHtml(item.decision_summary || label(decisionLabels, item.decision_status))}</p></article><article><h5>Prochaine suite</h5><p>${escapeHtml(next)}</p><small>${escapeHtml(formatDate(item.next_action_due_at))}</small></article></div></section>`;
}

function renderDetail() { const item = selectedCase(); if (!detailEl) return; if (!item) { detailEl.innerHTML = `<div class="admin-detail-empty"><p class="section-kicker">Detail</p><h3>Selectionnez un dossier</h3><p>Aucun dossier disponible.</p></div>`; return; } const checklist = item.case_checklist_items || []; const risks = item.case_risks || []; const decisions = item.case_decisions || []; const history = item.case_status_history || []; detailEl.innerHTML = `<form class="admin-detail-form cases-detail-form" data-cases-detail-form><input type="hidden" name="id" value="${escapeHtml(item.id)}"><div class="admin-detail-title"><p class="section-kicker">${escapeHtml(item.case_number || "Dossier")}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(label(typeLabels, item.case_type))} - ${escapeHtml(item.territory || "Territoire non renseigne")}</p></div><div class="admin-meta-grid"><div><span>Responsable</span><strong>${escapeHtml(item.assigned_to || "Non assigne")}</strong></div><div><span>Pole</span><strong>${escapeHtml(item.main_pole || "Non renseigne")}</strong></div><div><span>Decision</span><strong>${escapeHtml(label(decisionLabels, item.decision_status))}</strong></div><div><span>Ouverture</span><strong>${escapeHtml(formatDate(item.opened_at))}</strong></div><div><span>Demande source</span><strong>${item.source_request_id ? `<a class="text-link" href="${sourceRequestHref(item)}">${escapeHtml(sourceRequestLabel(item))}</a>` : "Non rattachee"}</strong></div></div>${caseFilePanel(item)}${instructionControlPanel(item)}${workflowPanel(item)}${documentsPanel(item)}<label>Titre<input name="title" value="${escapeHtml(item.title || "")}"></label><label>Statut<select name="status">${options(statusLabels, item.status)}</select></label><label>Type<select name="case_type">${options(typeLabels, item.case_type)}</select></label><label>Priorite<select name="priority">${options(priorityLabels, item.priority)}</select></label><label>Pole principal<input name="main_pole" value="${escapeHtml(item.main_pole || "")}"></label><label>Responsable<input name="assigned_to" value="${escapeHtml(item.assigned_to || "")}"></label><label>Territoire<input name="territory" value="${escapeHtml(item.territory || "")}"></label><label>Prochaine action<input name="next_action" value="${escapeHtml(item.next_action || "")}"></label><label>Echeance<input name="next_action_due_at" type="datetime-local" value="${escapeHtml(toDateTimeLocal(item.next_action_due_at))}"></label><label>Statut decision<select name="decision_status">${options(decisionLabels, item.decision_status)}</select></label><label class="cases-wide-field">Resume<textarea name="summary" rows="5">${escapeHtml(item.summary || "")}</textarea></label><label class="cases-wide-field">Synthese decision<textarea name="decision_summary" rows="4">${escapeHtml(item.decision_summary || "")}</textarea></label>${checklistPanel(checklist)}${decisionsPanel(decisions)}${historyPanel(history)}<p class="form-note" data-cases-save-status hidden></p></form>`; }
function checklistPanel(items) { return `<section class="cases-panel cases-checklist"><div class="admin-panel-head"><div><p class="section-kicker">Checklist</p><h4>Instruction</h4></div></div>${items.length ? items.map((item) => `<article><div><strong>${escapeHtml(item.label)}</strong><span>${item.required ? "Obligatoire" : "Optionnel"}</span></div><select data-checklist-id="${escapeHtml(item.id)}">${options(checklistLabels, item.status)}</select></article>`).join("") : "<p>Checklist non generee.</p>"}</section>`; }
function risksPanel(items) { return `<section class="cases-panel"><div class="admin-panel-head"><div><p class="section-kicker">Risques</p><h4>Mesures de maitrise</h4></div><button class="btn secondary" type="button" data-add-risk>Ajouter risque</button></div>${items.length ? items.map((r) => `<article><strong>${escapeHtml(r.risk_label)}</strong><span>${escapeHtml(label(riskLabels, r.risk_level))} - ${escapeHtml(r.mitigation || "Mesure a definir")}</span></article>`).join("") : "<p>Aucun risque saisi.</p>"}</section>`; }
function decisionsPanel(items) { return `<section class="cases-panel"><div class="admin-panel-head"><div><p class="section-kicker">Decision</p><h4>Validation humaine</h4></div><button class="btn secondary" type="button" data-add-decision>Ajouter decision</button></div>${items.length ? items.map((d) => `<article><strong>${escapeHtml(d.proposed_decision)}</strong><span>${escapeHtml(d.final_decision || label(decisionLabels, d.decision_status))}</span></article>`).join("") : "<p>Aucune decision tracee.</p>"}</section>`; }
function historyPanel(items) {
  const sorted = [...items].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return `<section class="cases-panel cases-history-panel"><div class="admin-panel-head"><div><p class="section-kicker">Journal d'audit</p><h4>Historique des actions</h4></div><strong>${sorted.length}</strong></div>${sorted.length ? `<div class="cases-history-list">${sorted.map((h) => `<article><div><strong>${escapeHtml(label(statusLabels, h.to_status) || "Action")}</strong><small>${escapeHtml(formatDate(h.created_at))}</small></div><span>${escapeHtml(h.note || "Changement de statut")}</span>${h.from_status ? `<em>${escapeHtml(label(statusLabels, h.from_status))} -> ${escapeHtml(label(statusLabels, h.to_status))}</em>` : ""}</article>`).join("")}</div>` : "<p>Aucun historique trace pour le moment.</p>"}</section>`;
}
async function saveDetail(form) { const statusEl = form.querySelector("[data-cases-save-status]"); const data = Object.fromEntries(new FormData(form)); data.type = "case"; data.next_action_due_at = fromDateTimeLocal(data.next_action_due_at); try { statusEl.hidden = false; statusEl.textContent = "Enregistrement..."; const result = await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify(data) }); cases = cases.map((item) => item.id === data.id ? result.case : item); renderPriorityPanel(); renderList(); renderDetail(); await loadDashboard().catch(() => {}); notify("Dossier enregistre.", "success"); } catch (error) { statusEl.hidden = false; statusEl.textContent = error.message; notifyError(error); } }
async function updateChecklist(id, status) { await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify({ type: "checklist", id, status }) }); await loadCases(); }
async function quickStatus(status) {
  const item = selectedCase();
  if (!item) return;
  const payload = { type: "case", id: item.id, status, status_note: "Action rapide TVF OS" };
  if (status === "attente_pieces") { payload.decision_status = item.decision_status; payload.next_action = "Relancer les pieces manquantes"; payload.next_action_due_at = quickDue(7); }
  if (status === "visite") { payload.decision_status = item.decision_status; payload.next_action = "Planifier ou confirmer la visite terrain"; payload.next_action_due_at = quickDue(7); }
  if (status === "a_decision") { payload.decision_status = "a_preparer"; payload.next_action = "Preparer la decision humaine argumentee"; payload.next_action_due_at = quickDue(5); }
  if (status === "decision_validee") { payload.decision_status = "validee"; payload.next_action = "Formaliser la suite operationnelle"; payload.next_action_due_at = quickDue(7); }
  if (status === "cloture") { payload.decision_status = item.decision_status === "non_preparee" ? "ajournee" : item.decision_status; payload.next_action = "Dossier cloture"; }
  await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify(payload) });
  await loadCases();
}
async function applyWorkflowAction(action) {
  const item = selectedCase();
  if (!item) return;
  const next_action = nextActionForWorkflow(item, action);
  const status = action === "convention" ? "a_decision" : action === "rdv" ? "visite" : "attente_pieces";
  await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify({ type: "case", id: item.id, status, next_action, next_action_due_at: quickDue(action === "rdv" ? 5 : 7), decision_status: action === "convention" ? "a_preparer" : item.decision_status, status_note: "Workflow applique" }) });
  await loadCases();
}
async function createCaseDocument(kind) {
  const item = selectedCase();
  if (!item) return;
  const pack = documentPackForCase(item);
  const targets = kind === "pack" ? pack : pack.filter((doc) => doc.key === kind);
  for (const doc of targets) {
    await api("/api/admin-documents", {
      method: "POST",
      body: JSON.stringify({
        type: "document",
        title: `${doc.title} - ${item.case_number || item.title || "Dossier TVF"}`,
        document_type: doc.type,
        status: "brouillon",
        related_object_type: "case",
        related_object_id: item.id,
        confidentiality_level: item.confidentiality_level || "interne",
        ai_summary: doc.summary,
        classification_notes: `Document prepare depuis le dossier ${item.case_number || item.id}. Validation humaine obligatoire avant usage officiel.`
      })
    });
  }
  await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify({ type: "case", id: item.id, next_action: kind === "pack" ? "Verifier le pack documentaire prepare" : "Verifier le document prepare", next_action_due_at: item.next_action_due_at || quickDue(3), status_note: "Document prepare depuis le dossier" }) });
  await loadCases();
}
async function createFollowupTask() {
  const item = selectedCase();
  if (!item) return;
  await api("/api/admin-work", {
    method: "POST",
    body: JSON.stringify({
      type: "task",
      related_object_type: "case",
      related_object_id: item.id,
      title: `Suivi dossier - ${item.case_number || item.title || "TVF"}`,
      description: item.next_action || item.summary || "Tache de suivi creee depuis le module Dossiers.",
      status: "todo",
      priority: workPriorityFromCase(item),
      pole: item.main_pole || "Instruction TVF",
      assigned_to: item.assigned_to || "TVF",
      due_at: item.next_action_due_at || quickDue(7)
    })
  });
  await api("/api/admin-cases", { method: "PATCH", body: JSON.stringify({ type: "case", id: item.id, next_action: "Tache de suivi creee dans TVF OS", next_action_due_at: item.next_action_due_at || quickDue(7), status_note: "Tache de suivi creee" }) });
  await loadCases();
}
async function addRisk() { const item = selectedCase(); if (!item) return; const data = await openCaseEntryModal({ title: "Ajouter un risque", description: "Tracez le risque, son niveau et la mesure de maitrise prevue avant decision.", submitLabel: "Ajouter le risque", fields: [{ name: "risk_label", label: "Risque identifie", required: true, placeholder: "Ex. acces dangereux, propriete non verifiee" }, { name: "risk_level", label: "Niveau de risque", type: "select", value: "modere", options: riskLabels }, { name: "mitigation", label: "Mesure de maitrise", type: "textarea", rows: 4, placeholder: "Action prevue pour limiter le risque" }] }); if (!data?.risk_label) return; await api("/api/admin-cases", { method: "POST", body: JSON.stringify({ type: "risk", case_id: item.id, risk_label: data.risk_label, risk_level: data.risk_level || "modere", mitigation: data.mitigation || "A definir" }) }); notify("Risque ajoute au dossier.", "success"); await loadCases(); }
async function addDecision() { const item = selectedCase(); if (!item) return; const data = await openCaseEntryModal({ title: "Ajouter une decision", description: "Formalisez une proposition ou une orientation avant validation humaine.", submitLabel: "Ajouter la decision", fields: [{ name: "proposed_decision", label: "Decision proposee", required: true, placeholder: "Ex. ouvrir une phase de diagnostic terrain" }, { name: "decision_status", label: "Statut", type: "select", value: "proposee", options: decisionLabels }, { name: "final_decision", label: "Commentaire / reserve", type: "textarea", rows: 4, placeholder: "Precisions, conditions, points a verifier" }] }); if (!data?.proposed_decision) return; await api("/api/admin-cases", { method: "POST", body: JSON.stringify({ type: "decision", case_id: item.id, proposed_decision: data.proposed_decision, decision_status: data.decision_status || "proposee", final_decision: data.final_decision || "" }) }); notify("Decision ajoutee au dossier.", "success"); await loadCases(); }
function manualCasePayload(formData) {
  const raw = Object.fromEntries(formData);
  const data = { ...raw, type: "case" };
  const clientName = String(raw.client_name || "").trim();
  const clientType = String(raw.client_type || "").trim();
  const theme = String(raw.request_theme || "").trim();
  const origin = String(raw.intake_origin || "").trim();
  const caseTypeLabel = label(typeLabels, raw.case_type) || "Dossier";
  const titleParts = [caseTypeLabel, clientName || raw.territory || theme || "dossier manuel"].filter(Boolean);
  data.title = String(raw.title || "").trim() || titleParts.join(" - ");
  data.status = raw.status || "qualification";
  data.priority = raw.priority || "normale";
  data.next_action = String(raw.next_action || "").trim() || "Qualifier le dossier et demander les pieces utiles";

  const summaryBlocks = [
    "Creation manuelle TVF OS",
    `Interlocuteur : ${clientName || "Non renseigne"}`,
    `Type d'interlocuteur : ${clientType || "Non renseigne"}`,
    origin ? `Origine : ${origin}` : "",
    raw.client_email ? `E-mail : ${raw.client_email}` : "",
    raw.client_phone ? `Telephone : ${raw.client_phone}` : "",
    raw.client_address ? `Adresse / commune : ${raw.client_address}` : "",
    theme ? `Thematique : ${theme}` : "",
    raw.territory ? `Territoire : ${raw.territory}` : "",
    raw.summary ? `Demande : ${raw.summary}` : "Demande : a completer",
    raw.known_documents ? `Pieces deja connues : ${raw.known_documents}` : "",
    raw.manual_risks ? `Points de vigilance : ${raw.manual_risks}` : ""
  ].filter(Boolean);
  data.summary = summaryBlocks.join("\n");
  data.decision_summary = raw.manual_risks ? `Points de vigilance initiaux : ${raw.manual_risks}` : "";

  return data;
}
function shouldOpenCreateModal() {
  const params = new URLSearchParams(window.location.search);
  return params.get("create") === "client" || window.location.hash === "#creer-dossier";
}

function openCreateModalFromMenu() {
  if (!shouldOpenCreateModal()) return;
  window.setTimeout(() => openModal(), 120);
}
function openModal() { if (modal) modal.hidden = false; modalForm?.querySelector("input, select, textarea")?.focus(); }
function closeModal() { if (modal) modal.hidden = true; }
async function createCase(event) {
  event.preventDefault();
  const statusEl = modalForm.querySelector("[data-cases-modal-status]");
  const data = manualCasePayload(new FormData(modalForm));
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Creation...";
    const result = await api("/api/admin-cases", { method: "POST", body: JSON.stringify(data) });
    cases = [result.case, ...cases];
    selectedId = result.case.id;
    modalForm.reset();
    closeModal();
    renderPriorityPanel();
    renderList();
    renderDetail();
    await loadDashboard().catch(() => {});
    notify("Fichier client cree et dossier ouvert.", "success");
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent = error.message;
    notifyError(error);
  }
}
function exportCsv() { if (!cases.length) return notify("Aucun dossier a exporter.", "warning"); const headers = ["Numero", "Titre", "Type", "Statut", "Priorite", "Pole", "Responsable", "Maturite", "Prochaine action"]; const rows = cases.map((item) => [item.case_number, item.title, label(typeLabels, item.case_type), label(statusLabels, item.status), label(priorityLabels, item.priority), item.main_pole, item.assigned_to, item.maturity_score, item.next_action]); const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(";")).join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `dossiers-tvf-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); notify("Export prepare.", "success"); }
function bindEvents() { tokenForm?.addEventListener("submit", async (event) => { event.preventDefault(); const value = String(new FormData(tokenForm).get("token") || "").trim(); if (!value) return setStatus("Entrez le token admin.", "error"); setToken(value); try { showApp(); await loadCases(); setStatus(""); } catch (error) { setToken(""); showLogin(); setStatus(error.message, "error"); } }); filtersForm?.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadCases().catch((e) => notifyError(e)), 280); }); filtersForm?.addEventListener("change", () => loadCases().catch((e) => notifyError(e))); statusButtons.forEach((button) => button.addEventListener("click", () => { if (statusFilter) statusFilter.value = button.dataset.caseStatus || "all"; loadCases().catch((e) => notifyError(e)); })); refreshButton?.addEventListener("click", () => loadCases().catch((e) => notifyError(e))); logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; }); exportButton?.addEventListener("click", exportCsv); createButton?.addEventListener("click", openModal); closeModalButtons.forEach((button) => button.addEventListener("click", closeModal)); modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalForm?.addEventListener("submit", createCase); listEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-case-id]"); if (!button) return; selectedId = button.dataset.caseId; renderPriorityPanel(); renderList(); renderDetail(); }); priorityPanelEl?.addEventListener("click", (event) => { const button = event.target.closest("[data-priority-case-id]"); if (!button) return; selectedId = button.dataset.priorityCaseId; renderPriorityPanel(); renderList(); renderDetail(); detailEl?.scrollIntoView({ behavior: "smooth", block: "start" }); }); priorityPanelEl?.addEventListener("click", (event) => { if (event.target.closest("[data-cases-refresh]")) loadCases().catch((e) => notifyError(e)); }); detailEl?.addEventListener("submit", (event) => { const form = event.target.closest("[data-cases-detail-form]"); if (!form) return; event.preventDefault(); saveDetail(form); }); detailEl?.addEventListener("change", (event) => { const select = event.target.closest("[data-checklist-id]"); if (select) updateChecklist(select.dataset.checklistId, select.value).catch((e) => notifyError(e)); }); detailEl?.addEventListener("click", (event) => {
    const quick = event.target.closest("[data-case-quick]");
    if (quick) quickStatus(quick.dataset.caseQuick).catch((e) => notifyError(e));
    const workflow = event.target.closest("[data-case-workflow]");
    if (workflow) applyWorkflowAction(workflow.dataset.caseWorkflow).catch((e) => notifyError(e));
    const docButton = event.target.closest("[data-case-document]");
    if (docButton) createCaseDocument(docButton.dataset.caseDocument).catch((e) => notifyError(e));
    if (event.target.closest("[data-case-create-task]")) createFollowupTask().catch((e) => notifyError(e));
    if (event.target.closest("[data-add-risk]")) addRisk().catch((e) => notifyError(e));
    if (event.target.closest("[data-add-decision]")) addDecision().catch((e) => notifyError(e));
  }); }
bindEvents();
if (token()) { showApp(); loadCases().then(openCreateModalFromMenu).catch((error) => { setToken(""); showLogin(); setStatus(error.message, "error"); }); } else { showLogin(); }
