const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const root = process.cwd();
const python = process.env.TVF_PYTHON || "C:\\Users\\jowst\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";

function walk(dir) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) entries.push(...walk(full));
    else entries.push(full);
  }
  return entries;
}

function minifyCss(css) {
  let out = "";
  let quote = null;
  let inComment = false;
  let pendingSpace = false;
  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    const next = css[i + 1];
    if (inComment) {
      if (char === "*" && next === "/") {
        inComment = false;
        i += 1;
      }
      continue;
    }
    if (!quote && char === "/" && next === "*") {
      inComment = true;
      i += 1;
      continue;
    }
    if (quote) {
      out += char;
      if (char === "\\" && next) {
        out += next;
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      if (pendingSpace && out && !/[{\[:;,>+~(]$/.test(out)) out += " ";
      pendingSpace = false;
      quote = char;
      out += char;
      continue;
    }
    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }
    if (/[{}:;,>+~()]/.test(char)) {
      out = out.replace(/\s+$/g, "");
      out += char;
      pendingSpace = false;
      continue;
    }
    if (pendingSpace && out && !/[{\[:;,>+~(]$/.test(out)) out += " ";
    pendingSpace = false;
    out += char;
  }
  return out.trim();
}

function runPythonImageOptimization() {
  const script = String.raw`
from pathlib import Path
from PIL import Image, ImageOps
root = Path.cwd()
changed = []
for src in (root / "assets" / "photos").glob("*"):
    if src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        continue
    dst = src.with_suffix(".webp")
    try:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGB")
            width, height = im.size
            max_width = 1440
            if width > max_width:
                ratio = max_width / float(width)
                im = im.resize((max_width, max(1, int(height * ratio))), Image.Resampling.LANCZOS)
            im.save(dst, "WEBP", quality=76, method=6)
            changed.append((src.name, dst.name, src.stat().st_size, dst.stat().st_size))
    except Exception as exc:
        print(f"SKIP {src}: {exc}")
before = sum(item[2] for item in changed)
after = sum(item[3] for item in changed)
print({"optimized": len(changed), "before": before, "after": after, "saved": before - after})
`;
  return childProcess.execFileSync(python, ["-c", script], { cwd: root, encoding: "utf8" }).trim();
}

function updateHtmlImageReferences() {
  const imageMap = new Map();
  for (const file of walk(path.join(root, "assets", "photos"))) {
    if (path.extname(file).toLowerCase() === ".webp") {
      const rel = path.relative(root, file).replace(/\\/g, "/");
      imageMap.set(rel.replace(/\.webp$/i, ".jpg"), rel);
      imageMap.set(rel.replace(/\.webp$/i, ".jpeg"), rel);
      imageMap.set(rel.replace(/\.webp$/i, ".png"), rel);
    }
  }
  let changed = 0;
  for (const htmlFile of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
    const full = path.join(root, htmlFile);
    let html = fs.readFileSync(full, "utf8");
    const before = html;
    for (const [from, to] of imageMap) {
      html = html.split(from).join(to);
    }
    if (html !== before) {
      fs.writeFileSync(full, html, "utf8");
      changed += 1;
    }
  }
  return changed;
}

function generateMinifiedCss() {
  const cssPath = path.join(root, "styles.css");
  const minPath = path.join(root, "styles.min.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const minified = minifyCss(css);
  fs.writeFileSync(minPath, minified + "\n", "utf8");
  let htmlChanged = 0;
  for (const htmlFile of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
    const full = path.join(root, htmlFile);
    const before = fs.readFileSync(full, "utf8");
    const after = before.replace(/href="styles\.css"/g, 'href="styles.min.css"');
    if (after !== before) {
      fs.writeFileSync(full, after, "utf8");
      htmlChanged += 1;
    }
  }
  return { original: css.length, minified: minified.length, htmlChanged };
}

const images = runPythonImageOptimization();
const htmlImages = updateHtmlImageReferences();
const css = generateMinifiedCss();
console.log(JSON.stringify({ images, htmlImages, css }, null, 2));
