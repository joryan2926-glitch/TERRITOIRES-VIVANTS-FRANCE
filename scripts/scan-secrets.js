const fs = require("fs");
const path = require("path");

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", ".vercel"]);
const ignoredFiles = new Set([".env.example"]);
const patterns = [
  { name: "Supabase service role secret", regex: /sb_secret_[A-Za-z0-9_=-]+/ },
  { name: "JWT-like token", regex: /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/ },
  { name: "Hardcoded service role assignment", regex: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/ },
  { name: "Raw service role key in env file", regex: /^SUPABASE_SERVICE_ROLE_KEY=.+/m }
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk(root);
const findings = [];

for (const file of allFiles) {
  const relative = path.relative(root, file);
  if (ignoredFiles.has(relative) || relative.startsWith(".env")) continue;
  const ext = path.extname(file).toLowerCase();
  if (!["", ".css", ".html", ".js", ".json", ".md", ".sql", ".txt", ".xml", ".yml", ".yaml"].includes(ext)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    const match = content.match(pattern.regex);
    if (match) {
      findings.push({ file: relative, pattern: pattern.name, sample: match[0].slice(0, 24) });
    }
  }
}

if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, scannedFiles: allFiles.length }, null, 2));
