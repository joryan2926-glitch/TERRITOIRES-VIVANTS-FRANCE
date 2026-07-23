const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
let ok = true;

function read(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    console.error(`MOBILE_CONTRACT_MISSING_FILE ${relativePath}`);
    ok = false;
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function requireToken(source, token, label) {
  if (!source.includes(token)) {
    console.error(`MOBILE_CONTRACT_MISSING_TOKEN ${label}: ${token}`);
    ok = false;
  }
}

const payload = read("src/services/requestPayload.js");
const repository = read("src/services/requestRepository.js");
const data = read("src/data.js");
const sqlPath = path.resolve(root, "../../supabase/tvf-mobile-requests.sql");
const verificationPath = path.resolve(root, "../../supabase/verify-tvf-mobile-requests.sql");
const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, "utf8") : "";
const verification = fs.existsSync(verificationPath) ? fs.readFileSync(verificationPath, "utf8") : "";
const contractDoc = read("TVF_OS_SYNC_CONTRACT.md");

for (const flow of ["signal", "materials", "property", "volunteer"]) {
  requireToken(payload, flow, "requestPayload.js flow");
  requireToken(data, flow, "data.js flow");
}

for (const token of [
  "reference", "source", "flow", "status", "category", "summary", "classification", "location", "media", "contact", "details", "nextSystemTarget"
]) {
  requireToken(payload, token, "payload contract");
}

for (const token of [
  "mobile_requests", "received_mobile", "raw_address", "latitude", "longitude", "photo_bucket", "photo_path", "contact_name", "contact_email", "contact_phone", "payload"
]) {
  requireToken(repository, token, "repository insert");
}

for (const token of ["signalements", "materiaux", "supabase.storage.from", "uploadPhotoIfNeeded"]) {
  requireToken(repository, token, "storage contract");
}

for (const token of ["create table", "mobile_requests", "reference", "flow", "payload"]) {
  requireToken(sql.toLowerCase(), token, "supabase migration");
}

for (const token of ["mobile_requests", "mobile_request_photos", "TVF Mobile", "TVF OS", "Go / No-Go"]) {
  requireToken(contractDoc, token, "TVF_OS_SYNC_CONTRACT.md");
}

if (!verification.includes("mobile_requests")) {
  console.error("MOBILE_CONTRACT_VERIFICATION_SQL_MISSING mobile_requests");
  ok = false;
}

if (!ok) process.exit(1);
console.log("TVF_MOBILE_OS_CONTRACT_OK");