document.addEventListener("DOMContentLoaded", async () => {
  await window.TVF.init();

  const page = document.body.dataset.betaPage;
  if (page === "auth") setupAuth();
  if (page === "signalements") setupSignalements();
  if (page === "materiaux") setupMateriaux();
  if (page === "admin") setupAdmin();
  if (page === "collectivites") setupSimplePost("collectivite-form", dataEndpoint("projets"));
  if (page === "entreprises") setupSimplePost("entreprise-form", dataEndpoint("partenaires"));
  if (page === "bien-solidaire") setupSimplePost("bien-form", dataEndpoint("biens-candidats"));
  if (page === "investisseur") setupSimplePost("investisseur-form", dataEndpoint("investisseurs"));
  if (page === "mecene") setupSimplePost("mecene-form", dataEndpoint("mecenes"));
  if (page === "documents") setupDocuments();
  if (page === "dashboard") loadStats();
});

function dataEndpoint(resource) {
  return `/api/${encodeURIComponent(resource)}`;
}

function renderList(container, rows, emptyText) {
  if (!container) return;
  if (!rows?.length) {
    container.innerHTML = `<article class="empty-state"><p>${emptyText}</p></article>`;
    return;
  }
  container.innerHTML = rows.map((row) => `
    <article class="platform-card">
      <h3>${escapeHtml(row.titre || row.type_signalement || row.type || row.nom || "Élément")}</h3>
      <p>${escapeHtml(row.commune || row.localisation || row.territoire || row.description || "")}</p>
      <span class="status-chip">${escapeHtml(row.statut_validation || row.statut || row.disponibilite || "validé")}</span>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}

function setupAuth() {
  const session = window.TVF.readSession();
  const sessionNode = document.querySelector("[data-session-status]");
  if (sessionNode) sessionNode.textContent = session ? "Session active." : "Aucune session active.";

  document.querySelector("[data-signup-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = window.TVF.formToObject(form);
    try {
      await window.TVF.signUp({ email: data.email, password: data.password, role: data.role, fullName: data.full_name });
      window.TVF.setStatus(form, "Compte créé. Vérifiez votre email si la confirmation est activée.");
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });

  document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = window.TVF.formToObject(form);
    try {
      await window.TVF.signIn(data);
      window.TVF.setStatus(form, "Connexion réussie.");
      window.location.reload();
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });

  document.querySelector("[data-reset-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await window.TVF.resetPassword(new FormData(form).get("email"));
      window.TVF.setStatus(form, "Email de réinitialisation demandé.");
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });

  document.querySelector("[data-profile-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await window.TVF.saveProfile(window.TVF.formToObject(form));
      window.TVF.setStatus(form, "Profil enregistré.");
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    window.TVF.clearSession();
    window.location.reload();
  });
}

async function setupSignalements() {
  const list = document.querySelector("[data-signalements-list]");
  try {
    const response = await fetch(dataEndpoint("signalements"));
    const json = await response.json();
    renderList(list, json.data, "Aucun signalement validé n'est publié pour le moment.");
  } catch {
    renderList(list, [], "Signalements indisponibles tant que Supabase n'est pas configuré.");
  }
  document.querySelector("[data-signalement-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = window.TVF.formToObject(form);
      const file = new FormData(form).get("photo");
      if (file?.size) data.photo_url = await window.TVF.uploadFile("signalements", file, "photos");
      await window.TVF.authFetch(dataEndpoint("signalements"), { method: "POST", body: JSON.stringify(data) });
      window.TVF.setStatus(form, "Signalement enregistré. Il sera publié après validation.");
      form.reset();
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });
}

async function setupMateriaux() {
  const list = document.querySelector("[data-materiaux-list]");
  try {
    const response = await fetch(dataEndpoint("materiaux"));
    const json = await response.json();
    renderList(list, json.data, "Aucun matériau validé n'est publié pour le moment.");
  } catch {
    renderList(list, [], "Matériaux indisponibles tant que Supabase n'est pas configuré.");
  }
  document.querySelector("[data-materiau-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = window.TVF.formToObject(form);
      const file = new FormData(form).get("photo");
      if (file?.size) data.photo_url = await window.TVF.uploadFile("materiaux", file, "photos");
      await window.TVF.authFetch(dataEndpoint("materiaux"), { method: "POST", body: JSON.stringify(data) });
      window.TVF.setStatus(form, "Matériau enregistré. Il sera publié après validation.");
      form.reset();
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });
}

async function loadStats() {
  const container = document.querySelector("[data-stats]");
  try {
    const response = await fetch("/api/stats");
    const json = await response.json();
    const data = json.data || {};
    container.innerHTML = Object.entries({
      "Signalements validés": data.signalements_valides,
      "Matériaux disponibles": data.materiaux_valides,
      "Projets actifs": data.projets_en_cours,
      "Territoires couverts": data.territoires_actifs
    }).map(([label, value]) => `<article class="metric-card"><span class="dashboard-number">${value ?? "À venir"}</span><strong>${label}</strong></article>`).join("");
  } catch {
    container.innerHTML = `<article class="empty-state"><p>Statistiques indisponibles tant que Supabase n'est pas configuré.</p></article>`;
  }
}

function setupSimplePost(formName, endpoint) {
  document.querySelector(`[data-${formName}]`)?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await window.TVF.authFetch(endpoint, { method: "POST", body: JSON.stringify(window.TVF.formToObject(form)) });
      window.TVF.setStatus(form, "Demande enregistrée pour validation.");
      form.reset();
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });
}

function setupDocuments() {
  document.querySelector("[data-document-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = window.TVF.formToObject(form);
      const file = new FormData(form).get("document");
      if (file?.size) data.storage_path = await window.TVF.uploadFile("documents", file, "pdf");
      await window.TVF.authFetch(dataEndpoint("documents"), { method: "POST", body: JSON.stringify(data) });
      window.TVF.setStatus(form, "Document envoyé pour validation.");
      form.reset();
    } catch (error) {
      window.TVF.setStatus(form, error.message, true);
    }
  });
}

async function setupAdmin() {
  const container = document.querySelector("[data-admin-lists]");
  try {
    const json = await window.TVF.authFetch("/api/admin");
    const groups = json.data || {};
    container.innerHTML = Object.entries(groups).map(([table, rows]) => `
      <section class="content-panel">
        <h2>${escapeHtml(table)}</h2>
        ${(rows || []).length ? rows.map((row) => `
          <article class="admin-row">
            <span>${escapeHtml(row.type_signalement || row.type || row.type_bien || row.nom || row.nom_structure || row.titre || row.commune || row.action || row.id)}</span>
            ${table === "activity_log" ? "" : `<button class="button secondary" type="button" data-admin-validate data-table="${table}" data-id="${row.id}">Valider</button>`}
          </article>
        `).join("") : "<p>Aucun élément en attente.</p>"}
      </section>
    `).join("");
  } catch (error) {
    container.innerHTML = `<article class="empty-state"><p>${escapeHtml(error.message)}</p></article>`;
  }
  container?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-validate]");
    if (!button) return;
    const table = button.dataset.table;
    const body = { table, id: button.dataset.id };
    if (table === "partenaires") body.statut = "valide";
    else if (table === "antennes") body.statut = "active";
    else if (table === "investisseurs" || table === "mecenes") body.statut = "valide";
    else if (table === "projets") {
      body.statut_validation = "valide";
      body.statut = "mobilisation";
    } else if (table === "projets_financement") {
      body.statut_validation = "valide";
      body.statut_publication = "publie";
    } else if (table === "biens_candidats") {
      body.statut_validation = "valide";
      body.confidentialite = "public";
    }
    else body.statut_validation = "valide";
    try {
      await window.TVF.authFetch("/api/admin", { method: "PATCH", body: JSON.stringify(body) });
      button.closest(".admin-row")?.remove();
    } catch (error) {
      alert(error.message);
    }
  });
}
