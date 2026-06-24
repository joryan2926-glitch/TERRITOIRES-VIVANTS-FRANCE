const fs = require("fs");
const path = require("path");

const root = process.cwd();

function replaceInFile(file, replacements) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after !== before) fs.writeFileSync(full, after, "utf8");
  return after !== before;
}

const oldGovernance = `<aside class="dossier-summary"><strong>Pr&eacute;sident fondateur</strong><p>Edryan Rangoly porte la phase de cr&eacute;ation et la pr&eacute;figuration du projet. Les autres fonctions et instances seront publi&eacute;es apr&egrave;s leur constitution effective.</p></aside>`;
const newGovernance = `<aside class="dossier-summary"><strong>Bureau en structuration</strong><p><b>Pr&eacute;sident fondateur :</b> Edryan Rangoly.<br /><b>Secr&eacute;taire et tr&eacute;sorier :</b> Jordan Lambeau.</p><p>Les autres fonctions et instances seront publi&eacute;es apr&egrave;s leur constitution effective.</p></aside>`;

const oldTransparency = `<li>Pr&eacute;sident fondateur : Edryan Rangoly</li><li>Stade : association en cr&eacute;ation</li>`;
const newTransparency = `<li>Pr&eacute;sident fondateur : Edryan Rangoly</li><li>Secr&eacute;taire et tr&eacute;sorier : Jordan Lambeau</li><li>Stade : association en cr&eacute;ation</li>`;

const oldPrivacy = `Le president fondateur indique sur le site est M. Edryan Rangoly. Ces informations pourront`;
const newPrivacy = `Le pr&eacute;sident fondateur indiqu&eacute; sur le site est M. Edryan Rangoly. Le secr&eacute;taire et tr&eacute;sorier indiqu&eacute; est M. Jordan Lambeau. Ces informations pourront`;

const changed = [];
for (const file of ["gouvernance.html", "scripts/build-institutional-dossiers.js"]) {
  if (replaceInFile(file, [[oldGovernance, newGovernance]])) changed.push(file);
}
for (const file of ["transparence.html", "scripts/build-institutional-dossiers.js"]) {
  if (replaceInFile(file, [[oldTransparency, newTransparency]]) && !changed.includes(file)) changed.push(file);
}
for (const file of ["politique-confidentialite.html", "scripts/complete-public-trust-content.js"]) {
  if (replaceInFile(file, [[oldPrivacy, newPrivacy]])) changed.push(file);
}

console.log(JSON.stringify({ changed }, null, 2));
