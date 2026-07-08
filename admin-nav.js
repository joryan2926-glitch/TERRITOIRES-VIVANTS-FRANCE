const TVF_ADMIN_MODULES = [
  { href: "admin", label: "Accueil" },
  { href: "dashboard", label: "Dashboard" },
  { href: "admin-demandes", label: "Demandes" },
  { href: "admin-emails", label: "E-mails" },
  { href: "admin-crm", label: "CRM" },
  { href: "admin-dossiers", label: "Dossiers" },
  { href: "admin-documents", label: "Documents" },
  { href: "admin-procedures", label: "Procedures" },
  { href: "admin-knowledge", label: "Connaissances" },
  { href: "admin-ai", label: "Assistant IA" },
  { href: "admin-map", label: "Cartographie" },
  { href: "admin-observatoire", label: "Observatoire" },
  { href: "admin-finances", label: "Finances" },
  { href: "admin-impact", label: "Impact" },
  { href: "admin-branches", label: "Antennes" },
  { href: "admin-governance", label: "Gouvernance" },
  { href: "admin-risks", label: "Risques" },
  { href: "admin-users", label: "Utilisateurs" }
];

function normalizePath(pathname) {
  const clean = String(pathname || "").split("/").filter(Boolean).pop() || "index";
  return clean.replace(/\.html$/i, "") || "index";
}

function createAdminModuleNav() {
  if (!document.body?.classList.contains("admin-body")) return;
  if (document.querySelector("[data-admin-module-nav]")) return;
  const topbar = document.querySelector(".admin-topbar");
  if (!topbar) return;
  const current = normalizePath(window.location.pathname);
  const nav = document.createElement("nav");
  nav.className = "admin-module-nav";
  nav.dataset.adminModuleNav = "";
  nav.setAttribute("aria-label", "Navigation complete TVF OS");
  nav.innerHTML = `<div class="admin-module-nav-inner">${TVF_ADMIN_MODULES.map((module) => {
    const active = current === module.href || (current === "dashboard" && module.href === "dashboard") || (current === "admin" && module.href === "admin");
    return `<a href="${module.href}"${active ? ' aria-current="page" class="is-active"' : ""}>${module.label}</a>`;
  }).join("")}</div>`;
  topbar.insertAdjacentElement("afterend", nav);
}

createAdminModuleNav();
