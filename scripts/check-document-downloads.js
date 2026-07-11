const fs = require("fs");
const path = require("path");

const root = process.cwd();
const kitDir = path.join(root, "documents", "kit-formulaires-conventions-tvf");
const archive = path.join(root, "documents", "TVF-kit-formulaires-conventions-prets-a-utiliser.zip");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function fail(message) {
  console.error(`DOCUMENT_INTERNAL_CHECK_FAIL=${message}`);
  process.exitCode = 1;
}

const docxFiles = walk(kitDir).filter((file) => file.toLowerCase().endsWith(".docx"));
if (!fs.existsSync(archive)) fail("archive_zip_missing");
if (docxFiles.length < 21) fail(`docx_count_${docxFiles.length}`);

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const rewriteMap = new Map((vercel.rewrites || []).map((item) => [item.source, item.destination]));
if (rewriteMap.get("/api/admin-:module") !== "/api/admin/:module") fail("admin_api_rewrite_missing");
const adminFunction = vercel.functions && vercel.functions["api/admin/[module].js"];
if (!adminFunction || adminFunction.includeFiles !== "documents/**") fail("admin_function_include_documents_missing");
const redirectSources = new Set((vercel.redirects || []).map((item) => item.source));
["/documents", "/documents.html", "/documents/:path*"].forEach((source) => {
  if (!redirectSources.has(source)) fail(`redirect_missing_${source}`);
});

const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
if (!robots.includes("Disallow: /documents")) fail("robots_documents_missing");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
if (sitemap.includes("/documents")) fail("sitemap_exposes_documents");

const adminHtml = fs.readFileSync(path.join(root, "admin-documents.html"), "utf8");
const adminJs = fs.readFileSync(path.join(root, "admin-documents.js"), "utf8");
const adminApi = fs.readFileSync(path.join(root, "lib", "api", "admin-documents.js"), "utf8");
if (!adminHtml.includes("data-documents-kit")) fail("admin_kit_panel_missing");
if (!adminJs.includes("entity=kit") || !adminJs.includes("data-kit-download")) fail("admin_kit_ui_missing");
if (!adminApi.includes('entity === "kit_file"') || !adminApi.includes("downloadInternalKitFile")) fail("admin_kit_api_missing");

if (process.exitCode) process.exit(process.exitCode);
console.log(`DOCUMENT_INTERNAL_DOCX=${docxFiles.length}`);
console.log("DOCUMENT_INTERNAL_EXPOSURE=blocked");
console.log("DOCUMENT_INTERNAL_TVF_OS=ready");
