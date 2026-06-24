document.addEventListener("DOMContentLoaded", () => {
  const margin = 18;
  const desktopQuery = window.matchMedia("(min-width: 861px)");
  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));

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

  window.addEventListener("resize", () => {
    dropdowns.forEach((dropdown) => {
      fitMenu(dropdown);
      if (desktopQuery.matches) {
        dropdown.classList.remove("is-open");
        dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (desktopQuery.matches || event.target.closest(".nav-dropdown")) return;
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-drop-toggle")?.setAttribute("aria-expanded", "false");
    });
  });
});
