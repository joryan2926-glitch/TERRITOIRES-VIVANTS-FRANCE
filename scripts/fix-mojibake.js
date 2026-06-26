const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const exts = new Set([".html", ".md", ".js"]);
const skipDirs = new Set([".git", "node_modules"]);

const replacements = [
  ["\u00c3\u20ac", "\u00c0"],
  ["\u00c3\u201a", "\u00c2"],
  ["\u00c3\u2021", "\u00c7"],
  ["\u00c3\u2030", "\u00c9"],
  ["\u00c3\u02c6", "\u00c8"],
  ["\u00c3\u0160", "\u00ca"],
  ["\u00c3\u2039", "\u00cb"],
  ["\u00c3\u017d", "\u00ce"],
  ["\u00c3\u201d", "\u00d4"],
  ["\u00c3\u2122", "\u00d9"],
  ["\u00c3\u203a", "\u00db"],
  ["\u00c3\u0152", "\u00dc"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a1", "\u00e1"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00a4", "\u00e4"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ab", "\u00eb"],
  ["\u00c3\u00ae", "\u00ee"],
  ["\u00c3\u00af", "\u00ef"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b6", "\u00f6"],
  ["\u00c3\u00b9", "\u00f9"],
  ["\u00c3\u00bb", "\u00fb"],
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00c3\u00bf", "\u00ff"],
  ["\u00c5\u201c", "\u0153"],
  ["\u00c5\u2019", "\u0152"],
  ["\u00c2\u00b0", "\u00b0"],
  ["\u00c2\u00b7", "\u00b7"],
  ["\u00c2\u00ab", "\u00ab"],
  ["\u00c2\u00bb", "\u00bb"],
  ["\u00c2", ""],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u02dc", "\u2018"],
  ["\u00e2\u20ac\u0153", "\u201c"],
  ["\u00e2\u20ac\u009d", "\u201d"],
  ["\u00e2\u20ac\u201c", "\u2013"],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00e2\u20ac\u00a6", "\u2026"],
  ["\u00e2\u20ac\u00a2", "\u2022"],
];

function listFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else if (exts.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
const touched = [];

for (const file of listFiles(root)) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [bad, good] of replacements) {
    text = text.split(bad).join(good);
  }
  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    changed += 1;
    touched.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ changed, touched }, null, 2));
