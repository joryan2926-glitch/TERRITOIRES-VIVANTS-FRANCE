document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const targetSelector = group.getAttribute("data-filter-target");
    const cards = targetSelector ? document.querySelectorAll(targetSelector) : [];
    group.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      const value = button.getAttribute("data-filter");
      group.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      cards.forEach((card) => {
        const category = card.getAttribute("data-category") || "";
        card.hidden = value !== "all" && category !== value;
      });
    });
  });

  document.querySelectorAll("[data-prepared-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = "Formulaire prêt pour Supabase : aucune donnée n'est envoyée dans cette version statique.";
      }
    });
  });
});
