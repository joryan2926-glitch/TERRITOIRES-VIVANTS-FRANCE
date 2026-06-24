const fs = require("fs");
const path = require("path");

const root = process.cwd();
const architecture = fs.readFileSync(path.join(root, "PUBLIC_ARCHITECTURE.md"), "utf8");
const publicPages = [...architecture.matchAll(/^- ([^\r\n]+\.html)$/gm)].map((match) => match[1]);

const patterns = [
  /\s*<section class="editorial-section"\s+data-audit-enrichment="true"[\s\S]*?<\/section>/gi,
  /\s*<section class="evidence-section"\s+data-professional-enrichment="[^"]*"[\s\S]*?<\/section>/gi,
  /\s*<h2 class="section-heading">Retours terrain[^<]*<\/h2>\s*<section class="listening-grid"[\s\S]*?<\/section>/gi,
  /\s*<div class="impact-empty"[\s\S]*?<\/div>/gi
];

let changed = 0;
for (const file of publicPages) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  for (const pattern of patterns) html = html.replace(pattern, "");

  if (/class="longform-section"/i.test(html) && /class="doc-section/i.test(html)) {
    html = html.replace(/\s*<section class="longform-section"[\s\S]*?<\/section>/i, "");
    const copyId = `copy-${file.replace(/\.html$/, "")}`;
    html = html.replace(/(<section class="doc-section[^>]*?)\s+aria-labelledby="[^"]*"/i, `$1 data-copy-expansion="documentary" aria-labelledby="${copyId}"`);
    html = html.replace(/(<section class="doc-section[\s\S]*?<h2)\s+id="[^"]*"/i, `$1 id="${copyId}"`);
  }

  const markers = (html.match(/data-professional-enrichment=/g) || []).length;
  if (markers === 0) {
    html = html.replace(/<main\b([^>]*)>/i, '<main$1 data-professional-enrichment="public-page">');
  }

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ publicPages: publicPages.length, changed }, null, 2));
