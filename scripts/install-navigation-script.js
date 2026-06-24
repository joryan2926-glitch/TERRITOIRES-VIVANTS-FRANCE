const fs = require("fs");
const path = require("path");

const root = process.cwd();
const tag = '    <script defer src="navigation.js"></script>';
let changed = 0;

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  html = html.replace(/\s*<script\s+defer\s+src="navigation\.js"><\/script>/gi, "");
  html = html.replace(/\s*<\/body>/i, `\n${tag}\n  </body>`);
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
