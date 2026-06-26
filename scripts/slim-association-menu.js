const fs = require("fs");

const removableLinks = [
  {
    label: "Pourquoi TVF existe",
    pattern: /<a class="mega-link" href="pourquoi-tvf-existe\.html">[\s\S]*?<\/a>(?=<a class="mega-link" href="ce-que-fait-tvf\.html">)/g,
  },
  {
    label: "Vision France 2035",
    pattern: /<a class="mega-link" href="vision-france-2035\.html">[\s\S]*?<\/a>(?=<\/div><\/div><div class="nav-dropdown"><a class="nav-drop-toggle" href="nos-actions\.html">)/g,
  },
];

let changed = 0;

for (const file of fs.readdirSync(".").filter((name) => name.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  for (const link of removableLinks) {
    html = html.replace(link.pattern, "");
  }

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

console.log(`Association menu simplified in ${changed} HTML files.`);
