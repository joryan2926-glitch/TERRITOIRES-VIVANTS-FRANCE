const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

const documentSearch = document.querySelector("#document-search");
const documentCards = Array.from(document.querySelectorAll("[data-doc-card]"));
const documentFilters = Array.from(document.querySelectorAll("[data-doc-filter]"));
const documentCount = document.querySelector("[data-doc-count]");
const documentEmpty = document.querySelector("[data-doc-empty]");

function normalizeSearch(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateDocumentLibrary() {
  if (!documentCards.length) return;

  const term = normalizeSearch(documentSearch?.value || "");
  const activeFilter = document.querySelector("[data-doc-filter].is-active")?.dataset.docFilter || "all";
  let visibleCount = 0;

  documentCards.forEach((card) => {
    const matchesTerm = !term || normalizeSearch(card.textContent || "").includes(term);
    const matchesFilter = activeFilter === "all" || card.dataset.docCategory === activeFilter;
    const isVisible = matchesTerm && matchesFilter;

    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  if (documentCount) {
    documentCount.textContent = `${visibleCount} document${visibleCount > 1 ? "s" : ""} affiché${visibleCount > 1 ? "s" : ""}`;
  }

  if (documentEmpty) {
    documentEmpty.hidden = visibleCount !== 0;
  }
}

if (documentCards.length) {
  documentSearch?.addEventListener("input", updateDocumentLibrary);
  documentFilters.forEach((button) => {
    button.addEventListener("click", () => {
      documentFilters.forEach((filter) => {
        filter.classList.remove("is-active");
        filter.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
      updateDocumentLibrary();
    });
  });
  updateDocumentLibrary();
}

const pageNavLinks = Array.from(document.querySelectorAll(".page-nav a"));
const pageSections = pageNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (pageNavLinks.length && pageSections.length && "IntersectionObserver" in window) {
  const pageNavObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeHref = `#${entry.target.id}`;
        pageNavLinks.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === activeHref);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  pageSections.forEach((section) => pageNavObserver.observe(section));
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".card, .timeline article, .split, .feature-grid").forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(14px)";
    item.style.transition = "opacity .45s ease, transform .45s ease";
    observer.observe(item);
  });

  const style = document.createElement("style");
  style.textContent = `.is-visible{opacity:1!important;transform:none!important}`;
  document.head.appendChild(style);
}
