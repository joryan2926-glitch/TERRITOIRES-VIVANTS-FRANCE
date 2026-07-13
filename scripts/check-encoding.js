const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", "output", "tmp", "dist", "build"]);
const textExts = new Set([".html", ".js", ".css", ".md", ".json", ".txt", ".xml", ".svg", ".py", ".sql"]);
const brokenPatterns = [
  { name: "mojibake U+00C3", regex: /\u00c3/ },
  { name: "mojibake U+00C2", regex: /\u00c2/ },
  { name: "replacement char", regex: /\ufffd/ },
  { name: "smart punctuation mojibake", regex: /\u00e2\u20ac|\u00e2\u201a|\u00e2\u20ac\u2122/ },
  { name: "emoji mojibake", regex: /\u00f0\u0178/ },
  { name: "Saint-Etienne question mark", regex: /Saint-\?tienne/ },
  { name: "Elise question mark", regex: /\?lise/ },
  { name: "common French question marks", regex: /R\?f\?rences|T\?l\?phone|Pr\?sentation|Mat\?riauth\?que|Pr\?sident|Si\?ge/ }
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function scanText(label, text, failures) {
  for (const pattern of brokenPatterns) {
    if (pattern.regex.test(text)) failures.push(`${label}: ${pattern.name}`);
  }
}

function readZipEntries(buffer) {
  const entries = [];
  let offset = 0;
  while (offset + 30 < buffer.length) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (nameEnd > buffer.length || dataEnd > buffer.length || compressedSize === 0xffffffff) break;
    const name = buffer.slice(nameStart, nameEnd).toString("utf8");
    const payload = buffer.slice(dataStart, dataEnd);
    let content = null;
    try {
      if (method === 0) content = payload;
      else if (method === 8) content = zlib.inflateRawSync(payload);
    } catch (_) {
      content = null;
    }
    if (content) entries.push({ name, content });
    offset = dataEnd;
  }
  return entries;
}

function readDocxText(file) {
  const entries = readZipEntries(fs.readFileSync(file));
  const wanted = entries.filter((entry) => /^word\/(document|header\d+|footer\d+)\.xml$/.test(entry.name));
  return wanted.map((entry) => entry.content.toString("utf8")).join("\n");
}

const failures = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (rel === path.join("scripts", "check-encoding.js")) continue;
  const ext = path.extname(file).toLowerCase();
  if (textExts.has(ext)) {
    const text = fs.readFileSync(file, "utf8");
    scanText(rel, text, failures);
  } else if (ext === ".docx" && rel.includes(path.join("documents", "courriers-lancement-saint-etienne"))) {
    scanText(rel, readDocxText(file), failures);
  }
}

if (failures.length) {
  console.error("ENCODING_CHECK_FAILED");
  for (const failure of failures.slice(0, 80)) console.error("- " + failure);
  process.exit(1);
}
console.log("ENCODING_CHECK_OK");
