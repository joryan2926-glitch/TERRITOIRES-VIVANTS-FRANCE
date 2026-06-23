const fs = require("fs");

const files = fs.readdirSync(".").filter((file) => file.endsWith(".html")).sort();
const obviousPatterns = [
  "Developpement",
  "operationnelle",
  "donnees",
  "materiaux",
  "proprietaire",
  "reponse",
  "methode",
  "securite",
  "fonctionnalites",
  "verification",
  "acces",
  "deja",
  "honnete",
];

const issues = [];
const idIssues = [];

function slugFor(file) {
  return file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const sections = html.match(/<section class="longform-section" data-copy-expansion=[\s\S]*?<\/section>/g) || [];
  const expectedId = `copy-${slugFor(file)}`;
  if (!html.includes(`aria-labelledby="${expectedId}"`)) idIssues.push(`${file}: missing aria ${expectedId}`);
  if (!html.includes(`<h2 id="${expectedId}"`)) idIssues.push(`${file}: missing h2 ${expectedId}`);
  for (const section of sections) {
    const visibleText = section.replace(/<[^>]+>/g, " ");
    for (const pattern of obviousPatterns) {
      if (visibleText.includes(pattern)) issues.push(`${file}: ${pattern}`);
    }
  }
}

if (idIssues.length || issues.length) {
  console.log(JSON.stringify({ idIssues, copyIssues: issues.slice(0, 120), totalCopyIssues: issues.length }, null, 2));
  process.exitCode = 1;
} else {
  console.log("Expanded copy checks passed");
}
