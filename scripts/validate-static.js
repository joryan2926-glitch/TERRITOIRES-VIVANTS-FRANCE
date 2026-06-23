const fs = require("fs");
const path = require("path");

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const existing = new Set(fs.readdirSync(root));

function stripHash(url) {
  return url.split("#")[0].split("?")[0];
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|#|javascript:)/i.test(url);
}

function checkLocalTarget(file, value, attr) {
  const target = stripHash(value);
  if (!target || isExternal(value)) return null;
  const normalized = target.replace(/^\.\//, "");
  const full = path.join(root, normalized);
  if (!fs.existsSync(full)) {
    return { file, attr, value };
  }
  return null;
}

const broken = [];
const missingSeo = [];
const enrichmentIssues = [];
const imageIssues = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");

  const seoChecks = [
    ["title", /<title>[^<]+<\/title>/i],
    ["description", /<meta\s+name="description"\s+content="[^"]+"/i],
    ["canonical", /<link\s+rel="canonical"\s+href="[^"]+"/i],
    ["og:title", /property="og:title"/i],
  ];
  const missing = seoChecks.filter(([, pattern]) => !pattern.test(html)).map(([name]) => name);
  if (missing.length) missingSeo.push({ file, missing: missing.join(", ") });

  const markers = (html.match(/data-professional-enrichment=/g) || []).length;
  if (markers !== 1) enrichmentIssues.push({ file, markers });

  for (const match of html.matchAll(/\shref="([^"]+)"/g)) {
    const issue = checkLocalTarget(file, match[1], "href");
    if (issue) broken.push(issue);
  }
  for (const match of html.matchAll(/\ssrc="([^"]+)"/g)) {
    const issue = checkLocalTarget(file, match[1], "src");
    if (issue) imageIssues.push(issue);
  }
}

console.log(JSON.stringify({
  pages: htmlFiles.length,
  enrichmentIssues,
  missingSeo,
  brokenLinks: broken,
  missingImages: imageIssues,
}, null, 2));
