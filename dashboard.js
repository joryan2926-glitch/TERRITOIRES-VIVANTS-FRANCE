const DASHBOARD_TOKEN_KEY = "tvfAdminToken";

const labels = {
  status: {
    nouveau: "Nouveau",
    a_qualifier: "A qualifier",
    en_cours: "En cours",
    rendez_vous: "Rendez-vous",
    en_attente: "En attente",
    accepte: "Accepte",
    refuse: "Refuse",
    archive: "Archive",
  },
  priority: {
    normale: "Normale",
    haute: "Haute",
    urgente: "Urgente",
  },
  category: {
    "collectivite-territoire": "Collectivite",
    "bien-vacant-proprietaire": "Bien vacant",
    "materiaux-reemploi": "Materiaux",
    "entreprise-partenariat": "Entreprise",
    "benevolat-insertion": "Benevolat / insertion",
    "financement-mecenat": "Financement",
    "presse-institutionnel": "Presse",
    "demande-generale": "Generale",
    non_classe: "Non classe",
  },
  caseStatus: {
    ouvert: "Ouvert",
    qualification: "Qualification",
    instruction: "Instruction",
    attente_pieces: "Attente pieces",
    visite: "Visite",
    a_decision: "A decision",
    decision_validee: "Decision validee",
    cloture: "Cloture",
    archive: "Archive",
  },
  caseType: {
    bien_vacant: "Bien vacant",
    commerce_inoccupe: "Commerce inoccupe",
    materiaux: "Materiaux",
    collectivite: "Collectivite",
    entreprise: "Entreprise",
    benevole: "Benevole",
    financeur: "Financeur",
    signalement: "Signalement",
    friche_terrain: "Friche / terrain",
    presse: "Presse",
    autre: "Autre",
  },
};

const loginSection = document.querySelector("[data-dashboard-login]");
const appSection = document.querySelector("[data-dashboard-app]");
const tokenForm = document.querySelector("[data-dashboard-token-form]");
const loginStatus = document.querySelector("[data-dashboard-login-status]");
const controls = document.querySelector("[data-dashboard-controls]");
const summaryEl = document.querySelector("[data-dashboard-summary]");
const kpisEl = document.querySelector("[data-dashboard-kpis]");
const flowEl = document.querySelector("[data-dashboard-flow]");
const nextActionsEl = document.querySelector("[data-dashboard-next-actions]");
const trendEl = document.querySelector("[data-dashboard-trend]");
const statusEl = document.querySelector("[data-dashboard-status]");
const priorityEl = document.querySelector("[data-dashboard-priority]");
const categoryEl = document.querySelector("[data-dashboard-category]");
const poleEl = document.querySelector("[data-dashboard-pole]");
const sourceEl = document.querySelector("[data-dashboard-source]");
const viewsEl = document.querySelector("[data-dashboard-views]");
const coverageEl = document.querySelector("[data-dashboard-coverage]");
const coverageScoreEl = document.querySelector("[data-dashboard-coverage-score]");
const alertsEl = document.querySelector("[data-dashboard-alerts]");
const recentEl = document.querySelector("[data-dashboard-recent]");
const activityEl = document.querySelector("[data-dashboard-activity]");
const activitySummaryEl = document.querySelector("[data-dashboard-activity-summary]");
const casesEl = document.querySelector("[data-dashboard-cases]");
const generatedEl = document.querySelector("[data-dashboard-generated]");
const aiSummaryEl = document.querySelector("[data-dashboard-ai-summary]");
const insightsEl = document.querySelector("[data-dashboard-insights]");
const refreshButton = document.querySelector("[data-dashboard-refresh]");
const exportButton = document.querySelector("[data-dashboard-export]");
const printButton = document.querySelector("[data-dashboard-print]");
const logoutButton = document.querySelector("[data-dashboard-logout]");
const runtimeStatus = document.querySelector("[data-dashboard-runtime-status]");
let currentDashboard = null;

function token() {
  try {
    return sessionStorage.getItem(DASHBOARD_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setToken(value) {
  try {
    if (value) sessionStorage.setItem(DASHBOARD_TOKEN_KEY, value);
    else sessionStorage.removeItem(DASHBOARD_TOKEN_KEY);
  } catch {
    // Le dashboard reste utilisable sans stockage de session.
  }
}

function showApp() {
  if (loginSection) loginSection.hidden = true;
  if (appSection) appSection.hidden = false;
}

function showLogin() {
  if (loginSection) loginSection.hidden = false;
  if (appSection) appSection.hidden = true;
}

function setLoginStatus(message, type = "info") {
  if (!loginStatus) return;
  loginStatus.hidden = !message;
  loginStatus.textContent = message;
  loginStatus.dataset.status = type;
}

function setRuntimeStatus(message, type = "info") {
  if (!runtimeStatus) return;
  runtimeStatus.hidden = !message;
  runtimeStatus.textContent = message;
  runtimeStatus.dataset.status = type;
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
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function label(kind, value) {
  return labels[kind]?.[value] || value || "Non classe";
}

function selectedFilters() {
  const data = new FormData(controls);
  return {
    range: String(data.get("range") || "30"),
    status: String(data.get("status") || "all"),
    priority: String(data.get("priority") || "all"),
    category: String(data.get("category") || "all"),
  };
}

function dashboardParams() {
  const filters = selectedFilters();
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => params.set(key, value));
  return params.toString();
}

async function api(path) {
  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : { ok: response.ok };
  if (!response.ok || result.ok === false) {
    const error = new Error(result.error || "Dashboard indisponible.");
    error.code = result.code;
    error.status = response.status;
    throw error;
  }
  return result;
}

function kpiCard(labelText, value, detail, tone = "neutral") {
  return `<article class="dashboard-kpi" data-tone="${escapeHtml(tone)}">
    <span>${escapeHtml(labelText)}</span>
    <strong>${escapeHtml(value)}</strong>
    <small>${escapeHtml(detail)}</small>
  </article>`;
}

function renderKpis(metrics) {
  if (!kpisEl) return;
  kpisEl.innerHTML = [
    kpiCard("Demandes", metrics.total, "periode selectionnee"),
    kpiCard("Actives", metrics.open, "a suivre", metrics.open ? "info" : "neutral"),
    kpiCard("En retard", metrics.overdue, "delai cible depasse", metrics.overdue ? "danger" : "success"),
    kpiCard("Sans responsable", metrics.unassigned, "assignation manquante", metrics.unassigned ? "warning" : "success"),
    kpiCard("Qualification", `${metrics.qualificationRate}%`, "hors statut nouveau"),
    kpiCard("Cloture", `${metrics.closureRate}%`, "refusees ou archivees"),
  ].join("");
}

function renderFlow(dashboard) {
  if (!flowEl) return;
  const metrics = dashboard.metrics || {};
  const cards = [
    {
      step: "01",
      title: "Demandes entrantes",
      value: metrics.total || 0,
      detail: `${metrics.open || 0} active(s) a suivre`,
      href: "admin-demandes",
      tone: metrics.overdue ? "danger" : "info",
    },
    {
      step: "02",
      title: "CRM partenaires",
      value: metrics.unassigned ? "A qualifier" : "A jour",
      detail: "Identifier l'acteur, le besoin, le niveau d'engagement et la prochaine relance.",
      href: "admin-crm",
      tone: metrics.unassigned ? "warning" : "success",
    },
    {
      step: "03",
      title: "Dossiers",
      value: "Instruction",
      detail: "Transformer une sollicitation qualifiee en dossier suivi, avec pieces et responsable.",
      href: "admin-dossiers",
      tone: "neutral",
    },
    {
      step: "04",
      title: "Documents",
      value: "Preuves",
      detail: "Classer les courriers, conventions, pieces et modeles rattaches au dossier.",
      href: "admin-documents",
      tone: "neutral",
    },
    {
      step: "05",
      title: "Taches et agenda",
      value: "Execution",
      detail: "Planifier appels, visites, relances, rendez-vous et actions terrain.",
      href: "admin-work",
      tone: "neutral",
    },
    {
      step: "06",
      title: "Suivi & impact",
      value: "Pilotage",
      detail: "Consolider les resultats documentes, les preuves et les prochaines decisions TVF.",
      href: "admin-impact",
      tone: "neutral",
    },
  ];
  flowEl.innerHTML = cards
    .map((card) => `<a class="dashboard-flow-card" data-tone="${escapeHtml(card.tone)}" href="${escapeHtml(card.href)}">
      <span>${escapeHtml(card.step)}</span>
      <div>
        <strong>${escapeHtml(card.title)}</strong>
        <em>${escapeHtml(card.value)}</em>
        <small>${escapeHtml(card.detail)}</small>
      </div>
    </a>`)
    .join("");
}

function renderNextActions(dashboard) {
  if (!nextActionsEl) return;
  const metrics = dashboard.metrics || {};
  const actions = [];
  if (metrics.overdue > 0) {
    actions.push({ label: "Traiter les retards", detail: `${metrics.overdue} demande(s) depassent le delai cible.`, href: "admin-demandes" });
  }
  if (metrics.unassigned > 0) {
    actions.push({ label: "Assigner les responsables", detail: `${metrics.unassigned} demande(s) actives sans pilote.`, href: "admin-demandes" });
  }
  if ((metrics.open || 0) > 0) {
    actions.push({ label: "Qualifier en CRM", detail: "Relier les demandes utiles aux acteurs et organisations.", href: "admin-crm" });
    actions.push({ label: "Ouvrir les dossiers", detail: "Passer des contacts qualifies aux dossiers operationnels.", href: "admin-dossiers" });
  }
  actions.push({ label: "Preparer les pieces", detail: "Verifier les conventions, courriers et justificatifs avant transmission.", href: "admin-documents" });
  actions.push({ label: "Suivre l'impact TVF", detail: "Consolider les resultats documentes et les preuves associees aux dossiers.", href: "admin-impact" });
  nextActionsEl.innerHTML = actions.slice(0, 5)
    .map((action) => `<a href="${escapeHtml(action.href)}"><strong>${escapeHtml(action.label)}</strong><span>${escapeHtml(action.detail)}</span></a>`)
    .join("");
}

function maxValue(items) {
  return Math.max(1, ...items.map((item) => item.count || 0));
}

function renderTrend(trend) {
  if (!trendEl) return;
  const max = maxValue(trend);
  trendEl.innerHTML = trend
    .map((item) => {
      const height = Math.max(4, Math.round((item.count / max) * 100));
      const labelDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(new Date(item.date));
      return `<div class="dashboard-trend-bar" title="${escapeHtml(labelDate)} : ${escapeHtml(item.count)}">
        <span style="height:${height}%"></span>
        <small>${escapeHtml(labelDate)}</small>
      </div>`;
    })
    .join("");
}

function sortedEntries(data) {
  return Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
}

function renderBars(target, data, kind) {
  if (!target) return;
  const entries = sortedEntries(data);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  target.innerHTML = entries.length
    ? entries
        .map(([key, value]) => {
          const width = Math.round((value / max) * 100);
          return `<div class="dashboard-bar-row">
            <div><strong>${escapeHtml(label(kind, key))}</strong><span>${escapeHtml(value)}</span></div>
            <em><i style="width:${width}%"></i></em>
          </div>`;
        })
        .join("")
    : `<p class="form-note">Aucune donnee.</p>`;
}

function renderAlerts(alerts) {
  if (!alertsEl) return;
  alertsEl.innerHTML = alerts.length
    ? alerts
        .map((alert) => `<article class="dashboard-alert">
          <div>
            <strong>${escapeHtml(alert.title)}</strong>
            <span>${escapeHtml(label("priority", alert.priority))} - ${escapeHtml(label("status", alert.status))}</span>
          </div>
          <em>${escapeHtml(alert.age_days)} j</em>
        </article>`)
        .join("")
    : `<p class="form-note">Aucun retard detecte sur la periode.</p>`;
}

function renderRecent(recent) {
  if (!recentEl) return;
  recentEl.innerHTML = recent.length
    ? recent
        .map((item) => `<tr class="${item.overdue ? "is-overdue" : ""}">
          <td><strong>${escapeHtml(item.subject)}</strong><small>${escapeHtml(item.full_name)} - ${escapeHtml(formatDate(item.created_at))}</small></td>
          <td>${escapeHtml(label("status", item.status))}</td>
          <td>${escapeHtml(label("priority", item.priority))}</td>
          <td>${escapeHtml(label("category", item.category))}</td>
          <td>${escapeHtml(item.assigned_to || "Non assigne")}</td>
        </tr>`)
        .join("")
    : `<tr><td colspan="5">Aucune demande sur la periode.</td></tr>`;
}


function renderActivity(activity = {}) {
  if (activitySummaryEl) {
    activitySummaryEl.innerHTML = [
      kpiCard("Actions tracees", activity.total || 0, "periode selectionnee", activity.total ? "info" : "neutral"),
      kpiCard("Aujourd'hui", activity.today || 0, "evenements du jour", activity.today ? "success" : "neutral"),
      kpiCard("Modules actifs", activity.modules_active || 0, "sources d'activite", activity.modules_active ? "info" : "neutral"),
    ].join("");
  }
  if (!activityEl) return;
  const recent = activity.recent || [];
  activityEl.innerHTML = recent.length
    ? recent.map((item) => `<article class="dashboard-activity-item"><div><strong>${escapeHtml(item.action || "Action")}</strong><p>${escapeHtml(item.summary || "Action TVF OS tracee.")}</p></div><span>${escapeHtml(item.module_key || "tvf_os")}</span><small>${escapeHtml(formatDate(item.created_at))}</small></article>`).join("")
    : `<p class="form-note">Aucune action tracee sur la periode selectionnee.</p>`;
}

function renderCasesSummary(cases = {}) {
  if (!casesEl) return;
  const stats = [
    kpiCard("Actifs", cases.active || 0, "dossiers ouverts", cases.active ? "info" : "neutral"),
    kpiCard("Retards", cases.overdue || 0, "echeances depassees", cases.overdue ? "danger" : "success"),
    kpiCard("Pieces", cases.awaiting_pieces || 0, "dossiers en attente", cases.awaiting_pieces ? "warning" : "success"),
    kpiCard("Decision", cases.decision || 0, "arbitrage humain", cases.decision ? "warning" : "neutral"),
    kpiCard("Maturite", `${cases.average_maturity || 0}%`, "moyenne active", "info"),
  ].join("");
  const priority = cases.priority || [];
  const list = priority.length
    ? priority.map((item) => `<a class="dashboard-case-item" href="admin-dossiers" title="Ouvrir le module Dossiers"><div><strong>${escapeHtml(item.case_number || "Dossier")}</strong><p>${escapeHtml(item.title || "Dossier sans titre")}</p></div><span>${escapeHtml(item.reason || "Suite a definir")}</span><small>${escapeHtml(label("caseType", item.case_type))} - ${escapeHtml(label("priority", item.priority))} - ${escapeHtml(item.maturity_score || 0)}%</small></a>`).join("")
    : `<p class="form-note">Aucun dossier sensible a traiter immediatement.</p>`;
  casesEl.innerHTML = `<div class="dashboard-cases-summary">${stats}</div><div class="dashboard-cases-list">${list}</div>`;
}

function renderViews(views) {
  if (!viewsEl) return;
  viewsEl.innerHTML = Object.entries(views || {}).filter(([key]) => key !== "branch").map(([, view]) => `<div class="dashboard-view-item">
      <strong>${escapeHtml(view.label)}</strong>
      <span>${escapeHtml(view.available ? "Disponible" : "A venir")}</span>
      <small>${escapeHtml(view.source || "")}</small>
    </div>`)
    .join("");
}

function renderCoverage(coverage) {
  if (coverageScoreEl) coverageScoreEl.textContent = coverage ? `${coverage.percent}%` : "--";
  if (!coverageEl) return;
  coverageEl.innerHTML = (coverage?.requirements || []).filter((item) => !/antenne/i.test(item.label || "")).map((item) => `<div class="dashboard-compliance-item" data-covered="${item.covered ? "true" : "false"}">
      <span>${item.covered ? "OK" : "A corriger"}</span>
      <strong>${escapeHtml(item.label)}</strong>
    </div>`)
    .join("");
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n|\r/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function exportDashboard() {
  if (!currentDashboard) {
    setRuntimeStatus("Aucun rapport a exporter.", "error");
    return;
  }
  const metrics = currentDashboard.metrics;
  const rows = [
    ["Indicateur", "Valeur"],
    ["Periode jours", currentDashboard.rangeDays],
    ["Demandes", metrics.total],
    ["Actives", metrics.open],
    ["Cloturees", metrics.closed],
    ["En retard", metrics.overdue],
    ["Sans responsable", metrics.unassigned],
    ["Qualification", `${metrics.qualificationRate}%`],
    ["Cloture", `${metrics.closureRate}%`],
    ["Conformite", `${currentDashboard.coverage?.percent || 0}%`],
    ["Actions TVF OS", currentDashboard.activity?.total || 0],
    ["Modules actifs", currentDashboard.activity?.modules_active || 0],
    ["Dossiers actifs", currentDashboard.cases?.active || 0],
    ["Dossiers en retard", currentDashboard.cases?.overdue || 0],
    ["Dossiers a decision", currentDashboard.cases?.decision || 0],
  ];
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-tvf-os-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderInsights(assistant) {
  if (aiSummaryEl) aiSummaryEl.textContent = assistant.summary || "";
  if (!insightsEl) return;
  insightsEl.innerHTML = (assistant.insights || [])
    .map((insight) => `<article class="dashboard-insight" data-level="${escapeHtml(insight.level)}">
      <strong>${escapeHtml(insight.title)}</strong>
      <p>${escapeHtml(insight.body)}</p>
      <span>Etat : ${escapeHtml(insight.state || "propose")} - Confiance : ${escapeHtml(insight.confidence || "moyenne")}</span><small>Sources : ${escapeHtml((insight.sources || []).join(", "))}</small><span>${escapeHtml(insight.action)}</span>
    </article>`)
    .join("");
}

function renderDashboard(data) {
  const dashboard = data.dashboard;
  currentDashboard = dashboard;
  const metrics = dashboard.metrics;
  if (summaryEl) summaryEl.textContent = dashboard.assistant.summary;
  if (generatedEl) generatedEl.textContent = `Mis a jour : ${formatDate(dashboard.generatedAt)}`;
  renderKpis(metrics);
  renderFlow(dashboard);
  renderNextActions(dashboard);
  renderTrend(metrics.trend || []);
  renderBars(statusEl, metrics.byStatus, "status");
  renderBars(priorityEl, metrics.byPriority, "priority");
  renderBars(categoryEl, metrics.byCategory, "category");
  renderBars(poleEl, metrics.byPole, "pole");
  renderBars(sourceEl, metrics.bySource, "source");
  renderViews(dashboard.views);
  renderCoverage(dashboard.coverage);
  renderAlerts(dashboard.alerts || []);
  renderRecent(dashboard.recent || []);
  renderActivity(dashboard.activity || {});
  renderCasesSummary(dashboard.cases || {});
  renderInsights(dashboard.assistant || {});
}

async function loadDashboard() {
  setRuntimeStatus("");
  if (summaryEl) summaryEl.textContent = "Chargement du tableau de bord...";
  const result = await api(`/api/dashboard?${dashboardParams()}`);
  renderDashboard(result);
}

async function unlockDashboard(value) {
  setToken(value);
  showApp();
  try {
    await loadDashboard();
    setLoginStatus("");
  } catch (error) {
    if (error.status === 401) {
      setToken("");
      showLogin();
      setLoginStatus("Token admin invalide.", "error");
      return;
    }
    setRuntimeStatus(error.message, "error");
  }
}

tokenForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(tokenForm);
  const value = String(data.get("token") || "").trim();
  if (!value) {
    setLoginStatus("Veuillez saisir le token admin.", "error");
    return;
  }
  unlockDashboard(value);
});

refreshButton?.addEventListener("click", () => {
  loadDashboard().catch((error) => setRuntimeStatus(error.message, "error"));
});

exportButton?.addEventListener("click", exportDashboard);

printButton?.addEventListener("click", () => window.print());

controls?.addEventListener("change", () => {
  loadDashboard().catch((error) => setRuntimeStatus(error.message, "error"));
});

logoutButton?.addEventListener("click", () => { setToken(""); window.location.href = "admin-login"; });

if (token()) {
  unlockDashboard(token());
} else {
  showLogin();
}


