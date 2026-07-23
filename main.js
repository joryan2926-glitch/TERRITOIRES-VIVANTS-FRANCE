
function insertSiteWorkNotice() {
  const header = document.querySelector(".site-header");
  if (!header || document.querySelector(".tvf-site-work-notice")) return;

  const notice = document.createElement("div");
  notice.className = "tvf-site-work-notice";
  notice.setAttribute("role", "status");
  notice.innerHTML = '<div class="container"><span>Site en cours de construction</span><small>Certaines informations peuvent encore être complétées.</small></div>';
  header.insertAdjacentElement("afterend", notice);
}

insertSiteWorkNotice();

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

function isUserField(field) {
  return !field.closest(".hp-field") && field.type !== "hidden" && !field.disabled;
}

function valueForField(field) {
  if (field.type === "checkbox" || field.type === "radio") {
    return field.checked ? field.dataset.summaryValue || "Oui" : "";
  }

  if (field.tagName === "SELECT") {
    return field.options[field.selectedIndex]?.textContent.trim() || field.value.trim();
  }

  return field.value.trim();
}

function summaryForForm(form) {
  const fields = fieldsForForm(form);
  const hasTypedValue = fields.some((field) => field.tagName !== "SELECT" && field.type !== "checkbox" && field.type !== "radio" && valueForField(field));
  const lines = fields
    .filter((field) => {
      if (field.tagName !== "SELECT") return valueForField(field);
      return hasTypedValue || field.selectedIndex > 0;
    })
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

function clearFieldErrors(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function focusFirstRequiredField(form) {
  const field =
    fieldsForForm(form).find((item) => item.required && !valueForField(item)) ||
    fieldsForForm(form).find((item) => item.tagName !== "SELECT" && !valueForField(item));
  if (!field) return;

  field.setAttribute("aria-invalid", "true");
  field.focus();
}

function fieldsForForm(form) {
  return Array.from(form.querySelectorAll("input, select, textarea")).filter(isUserField);
}

function storageKeyForForm(form, index) {
  const section = form.closest("section[id]");
  return `tvfFormDraft:${window.location.pathname}:${section?.id || index}`;
}

function saveLocalFormDraft(form, key) {
  try {
    if (!summaryForForm(form).lines.length) {
      sessionStorage.removeItem(key);
      return;
    }

    const draft = {};
    fieldsForForm(form).forEach((field) => {
      draft[field.id || field.name] = field.type === "checkbox" || field.type === "radio" ? field.checked : field.value;
    });
    sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // La sauvegarde locale est une aide : le formulaire reste utilisable sans elle.
  }
}

function clearLocalFormDraft(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Sans stockage local, rien n'est à nettoyer.
  }
}

function restoreLocalFormDraft(form, key) {
  try {
    const rawDraft = sessionStorage.getItem(key);
    if (!rawDraft) return false;

    const draft = JSON.parse(rawDraft);
    if (!draft || typeof draft !== "object") return false;

    fieldsForForm(form).forEach((field) => {
      const value = draft[field.id || field.name];
      if (typeof value === "boolean" && (field.type === "checkbox" || field.type === "radio")) {
        field.checked = value;
      } else if (typeof value === "string") {
        field.value = value;
      }
    });

    return summaryForForm(form).lines.length > 0;
  } catch {
    return false;
  }
}

let contactDraftRecovered = false;
const contactMessage = document.querySelector("#contact-message");
if (contactMessage) {
  try {
    const draft = sessionStorage.getItem("tvfContactDraft");
    if (draft && !contactMessage.value.trim()) {
      contactMessage.value = draft;
      contactDraftRecovered = true;
      const draftStatus = document.querySelector("[data-draft-status]");
      if (draftStatus) {
        draftStatus.hidden = false;
      }
    }
    sessionStorage.removeItem("tvfContactDraft");
  } catch {
    // Le parcours reste utilisable si le stockage local est indisponible.
  }
}

document.querySelectorAll("[data-prepare-form]").forEach((form, index) => {
  form.dataset.loadedAt = String(Date.now());
  const button = form.querySelector("[data-prepare-summary]");
  const copyButton = form.querySelector("[data-copy-summary]");
  const downloadButton = form.querySelector("[data-download-summary]");
  const resetButton = form.querySelector("[data-reset-form]");
  const transferLink = form.querySelector("[data-transfer-summary]");
  const mailtoLink = form.querySelector("[data-mailto-summary]");
  const output = form.querySelector("[data-form-summary]");
  const localDraftStatus = form.querySelector("[data-local-draft-status]");
  const saveStatus = form.querySelector("[data-save-status]");
  const submitButton = form.querySelector("[data-submit-form]");
  const submitStatus = form.querySelector("[data-submit-status]");
  if (!button || !output) return;

  const localDraftKey = storageKeyForForm(form, index);
  const skipLocalRestore = contactDraftRecovered && contactMessage && form.contains(contactMessage);
  if (skipLocalRestore) {
    clearLocalFormDraft(localDraftKey);
  }
  const localDraftRestored = skipLocalRestore ? false : restoreLocalFormDraft(form, localDraftKey);
  const initialDirty = localDraftRestored || (contactDraftRecovered && contactMessage && form.contains(contactMessage));
  form.dataset.draftDirty = String(initialDirty);
  form.dataset.draftHandled = "false";
  if (localDraftStatus) {
    localDraftStatus.hidden = !localDraftRestored;
  }
  if (resetButton) {
    resetButton.hidden = !initialDirty;
  }

  let saveStatusTimer;

  function hideSaveStatus() {
    if (saveStatus) {
      saveStatus.hidden = true;
    }
    window.clearTimeout(saveStatusTimer);
  }

  function showSaveStatus() {
    if (!saveStatus) return;
    saveStatus.hidden = false;
    window.clearTimeout(saveStatusTimer);
    saveStatusTimer = window.setTimeout(() => {
      saveStatus.hidden = true;
    }, 2200);
  }

  function setSubmitStatus(message, type = "") {
    if (!submitStatus) return;
    submitStatus.hidden = false;
    submitStatus.textContent = message;
    submitStatus.classList.toggle("is-success", type === "success");
    submitStatus.classList.toggle("is-error", type === "error");
  }

  function hideSubmitStatus() {
    if (!submitStatus) return;
    submitStatus.hidden = true;
    submitStatus.textContent = "";
    submitStatus.classList.remove("is-success", "is-error");
  }

  function payloadForForm(summary) {
    const fields = {};
    Array.from(form.querySelectorAll("input, select, textarea")).forEach((field) => {
      if (!field.name) return;
      if (field.type === "checkbox" || field.type === "radio") {
        fields[field.name] = field.checked ? field.value || "true" : "";
        return;
      }
      fields[field.name] = field.value.trim();
    });

    const section = form.closest("section[id]");
    return {
      formKind: form.dataset.formKind || "contact",
      page: window.location.pathname,
      section: section?.id || "",
      summary: summary.text,
      fields,
      submittedAfterMs: Date.now() - Number(form.dataset.loadedAt || Date.now()),
      site: fields.site || fields.website || "",
    };
  }

  async function submitConnectedForm() {
    const summary = summaryForForm(form);
    const hasSummary = summary.lines.length > 0;

    output.hidden = false;
    output.textContent = summary.text;

    if (!hasSummary) {
      focusFirstRequiredField(form);
      if (submitButton) submitButton.hidden = true;
      setSubmitStatus("Renseignez au moins un champ avant l'envoi.", "error");
      return;
    }

    if (!submitButton) return;

    clearFieldErrors(form);
    if (form.querySelector("[required]") && typeof form.reportValidity === "function" && !form.reportValidity()) {
      focusFirstRequiredField(form);
      setSubmitStatus("Complétez les champs obligatoires avant l'envoi.", "error");
      return;
    }

    const consentField = form.querySelector("[name=\"consent\"]");
    if (consentField && !consentField.checked) {
      consentField.setAttribute("aria-invalid", "true");
      consentField.focus();
      setSubmitStatus("Vous devez accepter l'utilisation de vos informations pour que TVF puisse traiter votre demande.", "error");
      return;
    }

    hideSubmitStatus();
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForForm(summary)),
      });

      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : { ok: response.ok };

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "L'enregistrement a echoue.");
      }

      markHandled();
      submitButton.hidden = true;
      if (mailtoLink) mailtoLink.hidden = true;
      setSubmitStatus("Votre demande a ete transmise a TVF. Conservez une copie du resume si necessaire.", "success");
    } catch (error) {
      updateMailtoLink(summary);
      if (mailtoLink) mailtoLink.hidden = false;
      setSubmitStatus(`${error.message} Vous pouvez utiliser le bouton e-mail en secours.`, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer à TVF";
    }
  }

  function markDirty(event) {
    const hasDraft = summaryForForm(form).lines.length > 0;
    form.dataset.draftDirty = String(hasDraft);
    form.dataset.draftHandled = "false";
    saveLocalFormDraft(form, localDraftKey);
    if (hasDraft) {
      showSaveStatus();
    } else {
      hideSaveStatus();
    }

    if (event?.target && valueForField(event.target)) {
      event.target.removeAttribute("aria-invalid");
    }

    if (!output.hidden) {
      output.textContent = "Le formulaire a été modifié. Cliquez à nouveau sur Préparer pour générer un résumé à jour.";
    }

    if (copyButton) {
      copyButton.hidden = true;
    }

    if (downloadButton) {
      downloadButton.hidden = true;
    }

    if (mailtoLink) {
      mailtoLink.hidden = true;
    }

    if (submitButton) {
      submitButton.hidden = true;
    }

    hideSubmitStatus();

    if (resetButton) {
      resetButton.hidden = !hasDraft;
    }
  }

  function markHandled() {
    form.dataset.draftDirty = "false";
    form.dataset.draftHandled = "true";
    clearLocalFormDraft(localDraftKey);
    hideSaveStatus();
    if (localDraftStatus) {
      localDraftStatus.hidden = true;
    }
  }

  function resetDraft() {
    form.reset();
    clearFieldErrors(form);
    markHandled();
    output.hidden = true;
    output.textContent = "";

    const draftStatus = form.querySelector("[data-draft-status]");
    if (draftStatus) {
      draftStatus.hidden = true;
    }

    if (localDraftStatus) {
      localDraftStatus.hidden = true;
    }

    if (copyButton) {
      copyButton.hidden = true;
    }

    if (downloadButton) {
      downloadButton.hidden = true;
    }

    if (mailtoLink) {
      mailtoLink.hidden = true;
      mailtoLink.removeAttribute("href");
    }

    if (submitButton) {
      submitButton.hidden = true;
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer à TVF";
    }

    hideSubmitStatus();

    if (resetButton) {
      resetButton.hidden = true;
    }
  }

  function updateMailtoLink(summary) {
    if (!mailtoLink) return;

    const hasSummary = summary.lines.length > 0;
    mailtoLink.hidden = !hasSummary;

    if (!hasSummary) {
      mailtoLink.removeAttribute("href");
      return;
    }

    const recipient = mailtoLink.dataset.mailtoTo || "contact@territoiresvivantsfrance.fr";
    const subject = mailtoLink.dataset.mailtoSubject || "Demande Territoires Vivants France";
    mailtoLink.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.text)}`;
  }

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

    markHandled();
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
    markHandled();
  }

  function transferSummary() {
    const summary = summaryForForm(form);
    if (!summary.lines.length) return;

    markHandled();
    try {
      sessionStorage.setItem("tvfContactDraft", summary.text);
    } catch {
      // Le lien continue vers la page contact même si le stockage local échoue.
    }
  }

  form.addEventListener("input", markDirty);

  button.addEventListener("click", () => {
    const summary = summaryForForm(form);
    const hasSummary = summary.lines.length > 0;

    output.hidden = false;
    output.textContent = summary.text;

    if (hasSummary) {
      clearFieldErrors(form);
    } else {
      focusFirstRequiredField(form);
    }

    if (copyButton) {
      copyButton.hidden = !hasSummary;
    }

    if (downloadButton) {
      downloadButton.hidden = !hasSummary;
    }

    updateMailtoLink(summary);

    if (submitButton) {
      submitButton.hidden = !hasSummary;
    }

    hideSubmitStatus();

    if (resetButton) {
      resetButton.hidden = !hasSummary;
    }
  });

  copyButton?.addEventListener("click", copySummary);
  downloadButton?.addEventListener("click", downloadSummary);
  resetButton?.addEventListener("click", resetDraft);
  submitButton?.addEventListener("click", submitConnectedForm);
  transferLink?.addEventListener("click", transferSummary);
  mailtoLink?.addEventListener("click", () => {
    if (!mailtoLink.hidden) {
      markHandled();
    }
  });
});

window.addEventListener("beforeunload", (event) => {
  const hasUnsavedDraft = Array.from(document.querySelectorAll("[data-prepare-form]")).some(
    (form) => form.dataset.draftDirty === "true" && form.dataset.draftHandled !== "true"
  );

  if (!hasUnsavedDraft) return;
  event.preventDefault();
  event.returnValue = "";
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
