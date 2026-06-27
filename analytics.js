(() => {
  function track(name, props = {}) {
    const payload = {
      page: window.location.pathname,
      ...props
    };
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: payload });
    } else if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.classList.contains("button") || link.classList.contains("donate-button") || link.classList.contains("footer-contact-button")) {
      track("cta_click", {
        label: link.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
        href: link.getAttribute("href") || ""
      });
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form");
    if (!form) return;
    track("form_submit", {
      form: form.getAttribute("data-form-name") || form.getAttribute("data-supabase-table") || form.closest("section, article")?.querySelector("h2, h3")?.textContent?.trim() || "formulaire"
    });
  });
})();
