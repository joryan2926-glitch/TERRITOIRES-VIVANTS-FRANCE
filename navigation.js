document.addEventListener("DOMContentLoaded", () => {
  const margin = 18;
  const desktopQuery = window.matchMedia("(min-width: 861px)");
  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

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
});
