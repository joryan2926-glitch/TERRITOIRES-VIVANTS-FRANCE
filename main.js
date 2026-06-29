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

function setCurrentPageSection(activeHref) {
  pageNavLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === activeHref;
    link.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (pageNavLinks.length && pageSections.length) {
  setCurrentPageSection(`#${pageSections[0].id}`);
}

if (pageNavLinks.length && pageSections.length && "IntersectionObserver" in window) {
  const pageNavObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setCurrentPageSection(`#${entry.target.id}`);
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  pageSections.forEach((section) => pageNavObserver.observe(section));
}

function labelForField(field) {
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id.replace(/"/g, '\\"')}"]`);
    if (label) return label.textContent.trim();
  }

  return field.name || "Champ";
}

function valueForField(field) {
  if (field.tagName === "SELECT") {
    return field.options[field.selectedIndex]?.textContent.trim() || field.value.trim();
  }

  return field.value.trim();
}

function summaryForForm(form) {
  const fields = Array.from(form.querySelectorAll("input, select, textarea"));
  const lines = fields
    .map((field) => [labelForField(field), valueForField(field)])
    .filter(([, value]) => value)
    .map(([label, value]) => `${label} : ${value}`);

  return {
    lines,
    text: lines.length
      ? `Résumé de la demande\n\n${lines.join("\n")}`
      : "Renseignez au moins un champ pour préparer un résumé de demande.",
  };
}

const contactMessage = document.querySelector("#contact-message");
if (contactMessage) {
  try {
    const draft = sessionStorage.getItem("tvfContactDraft");
    if (draft && !contactMessage.value.trim()) {
      contactMessage.value = draft;
    }
    sessionStorage.removeItem("tvfContactDraft");
  } catch {
    // Le parcours reste utilisable si le stockage local est indisponible.
  }
}

document.querySelectorAll("[data-prepare-form]").forEach((form) => {
  const button = form.querySelector("[data-prepare-summary]");
  const copyButton = form.querySelector("[data-copy-summary]");
  const downloadButton = form.querySelector("[data-download-summary]");
  const transferLink = form.querySelector("[data-transfer-summary]");
  const output = form.querySelector("[data-form-summary]");
  if (!button || !output) return;

  async function copySummary() {
    const text = output.textContent.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    if (copyButton) {
      const initialLabel = copyButton.textContent;
      copyButton.textContent = "Résumé copié";
      window.setTimeout(() => {
        copyButton.textContent = initialLabel;
      }, 1800);
    }
  }

  function downloadSummary() {
    const text = output.textContent.trim();
    if (!text) return;

    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resume-demande-tvf-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function transferSummary() {
    const summary = summaryForForm(form);
    if (!summary.lines.length) return;

    try {
      sessionStorage.setItem("tvfContactDraft", summary.text);
    } catch {
      // Le lien continue vers la page contact même si le stockage local échoue.
    }
  }

  button.addEventListener("click", () => {
    const summary = summaryForForm(form);

    output.hidden = false;
    output.textContent = summary.text;

    if (copyButton) {
      copyButton.hidden = !summary.lines.length;
    }

    if (downloadButton) {
      downloadButton.hidden = !summary.lines.length;
    }
  });

  copyButton?.addEventListener("click", copySummary);
  downloadButton?.addEventListener("click", downloadSummary);
  transferLink?.addEventListener("click", transferSummary);
});

const printDetailsState = [];

window.addEventListener("beforeprint", () => {
  printDetailsState.length = 0;
  document.querySelectorAll("details").forEach((detail) => {
    printDetailsState.push([detail, detail.open]);
    detail.open = true;
  });
});

window.addEventListener("afterprint", () => {
  printDetailsState.forEach(([detail, wasOpen]) => {
    detail.open = wasOpen;
  });
  printDetailsState.length = 0;
});

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
