const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicPages = fs
  .readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8")
  .match(/^- (.+\.html)$/gm)
  .map((line) => line.replace(/^- /, ""));

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, html) {
  fs.writeFileSync(path.join(root, file), html, "utf8");
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pageTitle(html, file) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : file.replace(/\.html$/i, "").replace(/-/g, " ");
}

function demoteH2(html, max = 16) {
  let openCount = 0;
  const stack = [];
  return html.replace(/<(\/?)h2(\b[^>]*)>/gi, (match, slash, attrs) => {
    if (!slash) {
      openCount += 1;
      const demote = openCount > max;
      stack.push(demote);
      return demote ? `<h3${attrs}>` : match;
    }
    const demote = stack.pop();
    return demote ? "</h3>" : match;
  });
}

function findSectionEnd(html, startIndex) {
  const open = /<section\b/gi;
  const close = /<\/section>/gi;
  open.lastIndex = startIndex + 1;
  close.lastIndex = startIndex + 1;
  let depth = 1;
  while (depth > 0) {
    const nextOpen = open.exec(html);
    const nextClose = close.exec(html);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      close.lastIndex = open.lastIndex;
    } else {
      depth -= 1;
      if (depth === 0) return close.lastIndex;
      open.lastIndex = close.lastIndex;
    }
  }
  return -1;
}

function addInternalNav(html, file) {
  if (html.includes('class="in-page-nav"')) return html;
  const h2s = [...html.matchAll(/<h2(?:\s+id="([^"]+)")?[^>]*>([\s\S]*?)<\/h2>/gi)].slice(0, 7);
  if (h2s.length < 4) return html;
  const links = [];
  let next = html;
  h2s.forEach((match, index) => {
    const title = stripTags(match[2]);
    const id = match[1] || `section-${file.replace(/\.html$/i, "")}-${index + 1}`;
    if (!match[1]) next = next.replace(match[0], match[0].replace("<h2", `<h2 id="${id}"`));
    links.push(`<a href="#${id}">${title}</a>`);
  });
  const nav = `\n      <nav class="in-page-nav" aria-label="Dans cette page"><strong>Dans cette page</strong><div>${links.join("")}</div></nav>\n`;
  const firstSection = next.indexOf("<section");
  if (firstSection === -1) return next;
  const sectionEnd = findSectionEnd(next, firstSection);
  if (sectionEnd === -1) return next;
  return `${next.slice(0, sectionEnd)}${nav}${next.slice(sectionEnd)}`;
}

function addReferenceTable(html, file) {
  if (html.includes('data-reference-table="true"')) return html;
  if ((html.match(/<table\b/g) || []).length > 0) return html;
  if (/^(index|faq|contact|mentions-legales|politique-confidentialite|statuts)\.html$/.test(file)) return html;
  const title = pageTitle(html, file);
  const block = `
      <section class="reference-table-module" data-reference-table="true" aria-labelledby="reference-table-${file.replace(/[^a-z0-9]/gi, "-")}">
        <span class="dossier-kicker">Rep&egrave;res de lecture</span>
        <h2 id="reference-table-${file.replace(/[^a-z0-9]/gi, "-")}">Ce que cette page permet de d&eacute;cider</h2>
        <div class="table-scroll"><table class="stat-comparison"><thead><tr><th>Point &agrave; comprendre</th><th>Application pour ${title}</th><th>Document ou action utile</th></tr></thead><tbody>
          <tr><td>Besoin trait&eacute;</td><td>Clarifier le sujet, le public concern&eacute; et les limites d'intervention.</td><td>Fiche de lecture et sources.</td></tr>
          <tr><td>Cadre de coop&eacute;ration</td><td>Identifier les parties, les responsabilit&eacute;s, les pi&egrave;ces et les conditions de validation.</td><td>Trame de convention ou fiche projet.</td></tr>
          <tr><td>Passage &agrave; l'action</td><td>Orienter vers le bon parcours sans multiplier les d&eacute;marches.</td><td>Formulaire, contact ou document t&eacute;l&eacute;chargeable.</td></tr>
        </tbody></table></div>
      </section>
`;
  const needle = html.includes('<section class="institutional-storyline"') ? '<section class="institutional-storyline"' : "</main>";
  const index = html.indexOf(needle);
  if (index === -1) return html;
  return `${html.slice(0, index)}${block}${html.slice(index)}`;
}

function cleanMojibakeQuestionMarks(html) {
  return html
    .replace(/Tra\?abilit\?/g, "Tra&ccedil;abilit&eacute;")
    .replace(/tra\?abilit\?/g, "tra&ccedil;abilit&eacute;")
    .replace(/pr\?sentation/g, "pr&eacute;sentation")
    .replace(/pr\?senter/g, "pr&eacute;senter")
    .replace(/d\?montrer/g, "d&eacute;montrer")
    .replace(/d\?cision/g, "d&eacute;cision")
    .replace(/d\?cisions/g, "d&eacute;cisions")
    .replace(/Compl\?t/g, "Compl&eacute;t")
    .replace(/compl\?t/g, "compl&eacute;t")
    .replace(/p\?rim\?tre/g, "p&eacute;rim&egrave;tre")
    .replace(/int\?r\?t/g, "int&eacute;r&ecirc;t")
    .replace(/\?cologique/g, "&eacute;cologique")
    .replace(/\?conomique/g, "&eacute;conomique")
    .replace(/pr\?visionnel/g, "pr&eacute;visionnel")
    .replace(/pi\?ces/g, "pi&egrave;ces")
    .replace(/rep\?rer/g, "rep&eacute;rer")
    .replace(/D\?finitions/g, "D&eacute;finitions")
    .replace(/d\?finitions/g, "d&eacute;finitions")
    .replace(/r\?sultat/g, "r&eacute;sultat")
    .replace(/r\?sultats/g, "r&eacute;sultats")
    .replace(/pr\?sent\?/g, "pr&eacute;sent&eacute;");
}

let changed = [];
for (const file of publicPages) {
  let html = read(file);
  const before = html;
  if (file === "kit-media.html") {
    html = html.replace(/<main\b(?![^>]*data-professional-enrichment)/i, '<main data-professional-enrichment="public-page"');
  }
  html = addInternalNav(html, file);
  html = addReferenceTable(html, file);
  html = demoteH2(html, 16);
  html = cleanMojibakeQuestionMarks(html);
  html = html.replace(/\n[ \t]*\n[ \t]*\n+/g, "\n\n");
  if (html !== before) {
    write(file, html);
    changed.push(file);
  }
}

console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
