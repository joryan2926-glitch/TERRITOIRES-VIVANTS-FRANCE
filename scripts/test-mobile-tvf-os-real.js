const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

process.env.TVF_DISABLE_ADMIN_AUDIT = "1";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnv(path.resolve(__dirname, "..", ".env"));
loadEnv(path.resolve(__dirname, "..", "mobile", "tvf-mobile", ".env"));

const adminContactsHandler = require("../lib/api/admin-contacts");

function cleanEnv(value) {
  return String(value || "").trim().replace(/^[`'\",;]+|[`'\",;]+$/g, "").replace(/\s+/g, "");
}

function normalizeSupabaseRestUrl(rawUrl) {
  const cleaned = String(rawUrl || "").trim().replace(/^[`'\",;]+|[`'\",;]+$/g, "");
  if (!cleaned) return "";
  const trimmed = cleaned.replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

const restUrl = normalizeSupabaseRestUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL);
const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonKey = cleanEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const adminToken = cleanEnv(process.env.TVF_ADMIN_TOKEN || process.env.ADMIN_TOKEN);

function assertEnv() {
  const missing = [];
  if (!restUrl) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY ou EXPO_PUBLIC_SUPABASE_ANON_KEY");
  if (!adminToken) missing.push("TVF_ADMIN_TOKEN");
  if (missing.length) {
    throw new Error(`Variables manquantes pour la recette mobile TVF OS : ${missing.join(", ")}`);
  }
}

function headersFor(key, extra = {}) {
  const headers = { apikey: key, "Content-Type": "application/json", ...extra };
  if (!String(key).startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function rest(pathname, options = {}) {
  const key = options.key || serviceKey;
  const response = await fetch(`${restUrl}/${pathname}`, {
    ...options,
    headers: headersFor(key, options.headers || {}),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`Supabase ${options.method || "GET"} ${pathname} failed (${response.status})`);
    error.details = text;
    throw error;
  }
  return text ? JSON.parse(text) : null;
}

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value || ""; },
  };
}

function createAdminRequest(body) {
  const req = Readable.from([JSON.stringify(body)]);
  req.method = "POST";
  req.url = "/api/admin-contacts";
  req.headers = {
    "content-type": "application/json",
    authorization: `Bearer ${adminToken}`,
    "x-admin-user": "Recette TVF Mobile",
    "user-agent": "TVF mobile to OS real test",
  };
  return req;
}

async function runAdminImport(mobileRequestId) {
  const res = createResponse();
  await adminContactsHandler(createAdminRequest({ type: "mobile-import-case", mobile_request_id: mobileRequestId }), res);
  const json = res.body ? JSON.parse(res.body) : null;
  if (res.statusCode < 200 || res.statusCode >= 300 || json?.ok === false) {
    const error = new Error(json?.error || "Import TVF OS impossible.");
    error.statusCode = res.statusCode;
    error.details = json?.details || json;
    throw error;
  }
  return json;
}

async function deleteWhere(table, filter) {
  if (!filter) return;
  await rest(`${table}?${filter}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }).catch((error) => {
    console.warn(`TVF_MOBILE_OS_CLEANUP_WARNING ${table} ${error.message}`);
  });
}

async function cleanup(created) {
  const caseId = created.caseId;
  const contactId = created.contactId;
  const mobileRequestId = created.mobileRequestId;

  if (caseId) {
    await deleteWhere("documents", `related_object_type=eq.case&related_object_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("case_status_history", `case_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("case_checklist_items", `case_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("case_participants", `case_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("case_risks", `case_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("case_decisions", `case_id=eq.${encodeURIComponent(caseId)}`);
    await deleteWhere("cases", `id=eq.${encodeURIComponent(caseId)}`);
  }
  if (contactId) await deleteWhere("contacts", `id=eq.${encodeURIComponent(contactId)}`);
  if (mobileRequestId) await deleteWhere("mobile_requests", `id=eq.${encodeURIComponent(mobileRequestId)}`);
}

async function main() {
  assertEnv();
  const reference = `TEST-MOBILE-OS-${Date.now()}`;
  const created = { mobileRequestId: null, contactId: null, caseId: null };

  try {
    const mobilePayload = {
      reference,
      source: "tvf-mobile-to-os-real-test",
      flow: "property",
      categoryLabel: "Logement vacant",
      details: {
        title: "Logement vacant a qualifier",
        description: "Recette technique : demande mobile creee pour verifier le passage vers TVF OS, puis supprimee automatiquement.",
        objective: "Ouvrir un dossier d'instruction test sans conservation de donnee.",
      },
      contact: {
        name: "Recette TVF Mobile",
        email: "contact@territoiresvivantsfrance.fr",
        phone: "04 65 81 54 69",
      },
      location: {
        rawAddress: "Saint-Etienne - test technique TVF Mobile",
      },
    };

    await rest("mobile_requests", {
      method: "POST",
      key: anonKey,
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        reference,
        flow: "property",
        category: "logement",
        status: "received_mobile",
        raw_address: "Saint-Etienne - test technique TVF Mobile",
        contact_name: "Recette TVF Mobile",
        contact_email: "contact@territoiresvivantsfrance.fr",
        contact_phone: "04 65 81 54 69",
        payload: mobilePayload,
      }),
    });

    const mobileRows = await rest(`mobile_requests?reference=eq.${encodeURIComponent(reference)}&select=id,reference,status,flow&limit=1`);
    const mobileRow = mobileRows?.[0];
    assert.ok(mobileRow?.id, "la demande mobile doit etre retrouvee apres insertion");
    created.mobileRequestId = mobileRow.id;

    const importResult = await runAdminImport(mobileRow.id);
    assert.strictEqual(importResult.ok, true);
    assert.ok(importResult.contact?.id, "un contact/demande TVF OS doit etre cree");
    assert.ok(importResult.case?.id, "un dossier TVF OS doit etre cree");
    assert.strictEqual(importResult.mobileRequest?.status, "imported_tvf_os");
    assert.strictEqual(importResult.contact.source_page, "tvf-mobile");

    created.contactId = importResult.contact.id;
    created.caseId = importResult.case.id;

    const verifyCaseRows = await rest(`cases?id=eq.${encodeURIComponent(created.caseId)}&select=id,source_request_id,status,case_type,title&limit=1`);
    assert.strictEqual(verifyCaseRows?.[0]?.source_request_id, created.contactId);
    assert.strictEqual(verifyCaseRows?.[0]?.status, "qualification");

    const verifyMobileRows = await rest(`mobile_requests?id=eq.${encodeURIComponent(created.mobileRequestId)}&select=id,status,payload&limit=1`);
    assert.strictEqual(verifyMobileRows?.[0]?.status, "imported_tvf_os");
    assert.strictEqual(verifyMobileRows?.[0]?.payload?.tvf_os_import?.contact_id, created.contactId);
    assert.strictEqual(verifyMobileRows?.[0]?.payload?.tvf_os_import?.case_id, created.caseId);

    console.log(`TVF_MOBILE_TO_OS_OK reference=${reference} contact=${importResult.contact.request_number || created.contactId} dossier=${importResult.case.case_number || created.caseId}`);
  } finally {
    await cleanup(created);
  }
}

main().catch((error) => {
  console.error(`TVF_MOBILE_TO_OS_FAILED ${error.message}`);
  if (error.details) console.error(String(typeof error.details === "string" ? error.details : JSON.stringify(error.details)).slice(0, 1000));
  process.exit(1);
});