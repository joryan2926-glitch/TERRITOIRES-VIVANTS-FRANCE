document.addEventListener("DOMContentLoaded", () => {
  const margin = 18;
  const desktopQuery = window.matchMedia("(min-width: 861px)");
  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const siteHeader = document.querySelector(".site-header");

  if (siteHeader && !document.querySelector(".quick-journey-bar")) {
    const quickJourney = document.createElement("nav");
    quickJourney.className = "quick-journey-bar";
    quickJourney.setAttribute("aria-label", "Acces rapides Territoires Vivants France");
    quickJourney.innerHTML = `
      <a href="signalement.html"><span>Signaler</span><strong>un lieu vacant</strong></a>
      <a href="bien-solidaire-usage-partage.html"><span>Proposer</span><strong>un bien</strong></a>
      <a href="banque-materiaux.html"><span>Valoriser</span><strong>des matériaux</strong></a>
      <a href="contact.html"><span>Contact</span><strong>parler à TVF</strong></a>
    `;
    siteHeader.insertAdjacentElement("afterend", quickJourney);
  }

  function reset(menu) {
    menu.style.setProperty("--nav-menu-shift", "0px");
  }

  function fitMenu(dropdown) {
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!menu) return;
    reset(menu);

    if (!desktopQuery.matches) return;

    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const rect = menu.getBoundingClientRect();
    let shift = 0;

    if (rect.left < margin) {
      shift = margin - rect.left;
    } else if (rect.right > viewportWidth - margin) {
      shift = viewportWidth - margin - rect.right;
    }

    menu.style.setProperty("--nav-menu-shift", `${Math.round(shift)}px`);
  }

  dropdowns.forEach((dropdown) => {
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    const toggle = dropdown.querySelector(".nav-drop-toggle");
    if (!menu || !toggle) return;

    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    dropdown.addEventListener("pointerenter", () => fitMenu(dropdown));
    dropdown.addEventListener("focusin", () => fitMenu(dropdown));

    toggle.addEventListener("click", (event) => {
      if (desktopQuery.matches) {
        if (event.detail !== 0) fitMenu(dropdown);
        return;
      }

      event.preventDefault();
      const willOpen = !dropdown.classList.contains("is-open");
      dropdowns.forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  function closeMobileNavigation() {
    document.body.classList.remove("mobile-nav-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
    });
  }

  mobileMenuToggle?.addEventListener("click", () => {
    const willOpen = !document.body.classList.contains("mobile-nav-open");
    document.body.classList.toggle("mobile-nav-open", willOpen);
    mobileMenuToggle.setAttribute("aria-expanded", String(willOpen));
    if (!willOpen) {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("is-open");
        dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  window.addEventListener("resize", () => {
    dropdowns.forEach((dropdown) => {
      fitMenu(dropdown);
      if (desktopQuery.matches) {
        dropdown.classList.remove("is-open");
        dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
      }
    });
    if (desktopQuery.matches) {
      document.body.classList.remove("mobile-nav-open");
      mobileMenuToggle?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", (event) => {
    if (desktopQuery.matches || event.target.closest(".nav-dropdown") || event.target.closest(".mobile-menu-toggle")) return;
    closeMobileNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeMobileNavigation();
  });

  const counters = Array.from(document.querySelectorAll("[data-counter-value]"));
  if (counters.length) {
    const formatCounter = (value, element) => {
      const prefix = element.dataset.counterPrefix || "";
      const suffix = element.dataset.counterSuffix || "";
      const format = element.dataset.counterFormat;
      if (format === "compact") {
        return `${prefix}${new Intl.NumberFormat("fr-FR", {
          notation: "compact",
          maximumFractionDigits: 2,
        }).format(value)}${suffix}`;
      }
      return `${prefix}${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(value)}${suffix}`;
    };

    const animateCounter = (element) => {
      if (element.dataset.counterDone === "true") return;
      element.dataset.counterDone = "true";
      const target = Number(element.dataset.counterValue || 0);
      const duration = 950;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatCounter(Math.round(target * eased), element);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.35 },
      );
      counters.forEach((counter) => observer.observe(counter));
    } else {
      counters.forEach(animateCounter);
    }
  }

  document.documentElement.classList.add("js-enabled");

  const progressBar = document.createElement("div");
  progressBar.className = "site-progress-bar";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  const updateReadingProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  };

  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);

  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.innerHTML = `
    <span class="sr-only">Revenir en haut de page</span>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5 5.5 11.5l1.4 1.4 4.1-4.08V20h2V8.82l4.1 4.08 1.4-1.4L12 5Z" fill="currentColor"/>
    </svg>
  `;
  document.body.appendChild(backToTop);

  const toggleBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 520);
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".footer-back-top").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".footer-social-grid a[href='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
  });

  document.querySelectorAll(".interactive-france-card").forEach((card) => {
    const tooltip = card.querySelector(".map-tooltip");
    const nodes = Array.from(card.querySelectorAll(".map-node"));
    if (!tooltip || !nodes.length) return;
    nodes.forEach((node) => {
      const label = node.dataset.label || "Territoire &agrave; qualifier";
      const activate = () => {
        nodes.forEach((item) => item.classList.remove("active"));
        node.classList.add("active");
        tooltip.textContent = label;
      };
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", label);
      node.addEventListener("mouseenter", activate);
      node.addEventListener("focus", activate);
      node.addEventListener("click", activate);
      node.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activate();
      });
    });
  });

  const revealTargets = Array.from(
    document.querySelectorAll(
      [
        ".submenu-card",
        ".strategy-card",
        ".case-card",
        ".data-card",
        ".indicator-card",
        ".document-card",
        ".dossier-card",
        ".workflow-step",
        ".map-layer-card",
        ".material-record",
        ".territory-map-card",
        ".territory-process li",
        ".analysis-note",
        ".impact-section",
        ".doc-section",
        ".faq-item",
        ".doc-faq article",
        ".tvf-page-faq",
        ".tvf-page-faq details",
        "[data-engagement-upgrade='true']",
        ".journey-card",
        ".engagement-action-grid article",
        ".future-counter-grid article",
        ".trust-placeholder-grid article",
      ].join(", "),
    ),
  );

  revealTargets.forEach((target) => target.classList.add("reveal-on-scroll"));

  if ("IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const faqItems = Array.from(document.querySelectorAll(".faq-item, .doc-faq article"));
  if (faqItems.length) {
    document.documentElement.classList.add("js-enhanced-faq");
    faqItems.forEach((item, index) => {
      const heading = item.querySelector("h2, h3, h4, strong");
      if (!heading) return;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-expanded", "false");
      item.classList.add("is-collapsed");
      if (index === 0) {
        item.classList.remove("is-collapsed");
        item.classList.add("is-open");
        item.setAttribute("aria-expanded", "true");
      }

      const toggleItem = () => {
        const willOpen = !item.classList.contains("is-open");
        item.classList.toggle("is-open", willOpen);
        item.classList.toggle("is-collapsed", !willOpen);
        item.setAttribute("aria-expanded", String(willOpen));
      };

      item.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        toggleItem();
      });

      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleItem();
      });
    });
  }
});
