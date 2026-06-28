const fs = require("fs");
const path = require("path");

const root = process.cwd();

function themeFor(file) {
  if (file === "index.html") return "tvf-v1 theme-home";
  if (/nos-actions|notre-methode|vision-france|vision-2035|action-/i.test(file)) return "tvf-v1 theme-actions";
  if (/nos-poles|pole-/i.test(file)) return "tvf-v1 theme-poles";
  if (/saint-etienne|dossier-saint|etude-impact|sources-etude|tvf-enjeux/i.test(file)) return "tvf-v1 theme-territory";
  if (/logement|habitat|proprietaire|bien-solidaire|proposer-un-bien/i.test(file)) return "tvf-v1 theme-habitat";
  if (/commerce|commerces/i.test(file)) return "tvf-v1 theme-commerce";
  if (/materiau|materiautheque|reemploi|banque-materiaux/i.test(file)) return "tvf-v1 theme-materials";
  if (/friche|terrain|espaces-abandonnes/i.test(file)) return "tvf-v1 theme-friches";
  if (/solidarite|insertion|benevole|recrutement|adherent/i.test(file)) return "tvf-v1 theme-solidarity";
  if (/observatoire|carte|impact|tableau|statistique|donnees|territoire/i.test(file)) return "tvf-v1 theme-observatory";
  if (/collectivite|entreprise|partenaire|mecene|investisseur|financer|don|fonds/i.test(file)) return "tvf-v1 theme-partners";
  return "tvf-v1 theme-institution";
}

let changed = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  const theme = themeFor(file);
  const after = before.replace(/<body\s+class="([^"]*)"/i, (_, classes) => {
    const tokens = classes.split(/\s+/).filter(Boolean).filter((token) => !/^theme-/.test(token) && token !== "tvf-v1");
    return `<body class="${[...tokens, ...theme.split(/\s+/)].join(" ")}"`;
  });
  if (after !== before) {
    fs.writeFileSync(full, after, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
