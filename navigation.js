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

    dropdown.addEventListener("pointerenter", () => fitMenu(dropdown));
    dropdown.addEventListener("focusin", () => fitMenu(dropdown));

    toggle.addEventListener("click", (event) => {
      if (!desktopQuery.matches) return;
      if (event.detail === 0) return;
      fitMenu(dropdown);
    });
  });

  window.addEventListener("resize", () => {
    dropdowns.forEach((dropdown) => fitMenu(dropdown));
  });
});
