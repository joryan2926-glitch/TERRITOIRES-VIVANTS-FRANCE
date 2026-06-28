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

  const handledForms = new WeakSet();

  function labelKey(label) {
    return String(label || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60);
  }

  function inferFormPayload(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const inferred = {};
    form.querySelectorAll("label").forEach((label) => {
      const control = label.querySelector("input, select, textarea");
      if (!control || control.type === "checkbox") return;
      const key = control.name || labelKey(label.childNodes[0]?.textContent || label.textContent);
      if (key && !inferred[key]) inferred[key] = control.value;
    });
    const fields = { ...inferred, ...data };
    const heading = form.closest("section, article")?.querySelector("h2, h3")?.textContent?.trim();
    const button = form.querySelector("button")?.textContent?.trim();
    const details = Object.entries(fields)
      .filter(([, value]) => value && typeof value === "string")
      .map(([key, value]) => `${key.replaceAll("_", " ")} : ${value}`)
      .join("\n");
    return {
      profil: fields.profil || "formulaire_public",
      nom: fields.nom || fields.name || fields.nom_organisation || fields.structure || fields.organisation || "",
      organisation: fields.organisation || fields.structure || "",
      email: fields.email || fields.reply || fields.contact || fields.coordonnée_de_réponse || fields.coordonnee_de_reponse || "",
      telephone: fields.telephone || "",
      territoire: fields.territoire || fields.territoire_concerne || fields.commune || fields.ville_ou_territoire || "",
      sujet: fields.sujet || fields.topic || heading || button || "Demande depuis le site",
      message: fields.message || fields.description || fields.contexte_local || details,
      source_page: fields.source_page || window.location.pathname.split("/").pop() || "site",
      consentement: fields.consentement === "on" || fields.consentement === "true"
    };
  }

  function wireContactForm(form) {
    if (handledForms.has(form)) return;
    handledForms.add(form);
    let status = form.querySelector("[data-form-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("data-form-status", "");
      status.textContent = "La demande sera transmise pour qualification avant toute suite.";
      form.append(status);
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type='submit']");
      const payload = inferFormPayload(form);
      if (!payload.message?.trim()) {
        if (status) {
          status.textContent = "Merci de préciser votre demande avant l'envoi.";
          status.classList.add("error");
        }
        return;
      }
      if (status) {
        status.textContent = "Transmission en cours...";
        status.classList.remove("error");
      }
      if (submit) submit.disabled = true;
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "La demande n'a pas pu être transmise.");
        form.reset();
        if (status) status.textContent = "Demande transmise. Elle sera qualifiée avant toute réponse ou publication.";
      } catch (error) {
        if (status) {
          status.textContent = error.message;
          status.classList.add("error");
        }
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  document.querySelectorAll("[data-public-contact-form]").forEach(wireContactForm);

  document.querySelectorAll(".contact-form:not([data-signup-form]):not([data-login-form]):not([data-reset-form]):not([data-profile-form]):not([data-signalement-form]):not([data-materiau-form]):not([data-bien-form]):not([data-document-form]):not([data-prepared-form])").forEach((form) => {
    wireContactForm(form);
    form.querySelectorAll("button[type='button']").forEach((button) => {
      button.addEventListener("click", () => form.requestSubmit());
    });
  });

  const revealItems = document.querySelectorAll(
    "main > section, .content-panel, .document-card, .dossier-card, .opportunity-card, .case-card, .doc-card, .data-card, .content-card, .impact-card, .project-card, .strategy-card, .resource-card, .resources-card, .metric-card, .audience-card, .journey-card, .faq-card"
  );
  revealItems.forEach((item) => item.classList.add("tvf-reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  function formatCounter(value, decimals) {
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  const counters = document.querySelectorAll("[data-count]");
  function animateCounter(counter) {
    if (counter.dataset.animated === "true") return;
    counter.dataset.animated = "true";
    const target = Number(counter.dataset.count || 0);
    const decimals = Number(counter.dataset.decimals || 0);
    const suffix = counter.dataset.suffix || "";
    const duration = 1100;
    const start = performance.now();
    const initialText = counter.textContent;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${formatCounter(target * eased, decimals)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = initialText;
      }
    }

    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
});
