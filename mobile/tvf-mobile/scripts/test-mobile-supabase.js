const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const mobileRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(mobileRoot, "..", "..");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

function normalizeSupabaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

loadEnv(path.join(repoRoot, ".env"));
loadEnv(path.join(mobileRoot, ".env"));

const supabaseUrl = normalizeSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error("TVF_MOBILE_SUPABASE_TEST_SKIPPED missing=EXPO_PUBLIC_SUPABASE_URL_or_SUPABASE_URL,EXPO_PUBLIC_SUPABASE_ANON_KEY_or_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!supabaseUrl.startsWith("https://")) {
  console.error("TVF_MOBILE_SUPABASE_TEST_FAILED invalid_supabase_url");
  process.exit(1);
}

const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});
const serviceClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

function explainSupabaseError(error) {
  const message = error?.message || String(error);
  if (message.includes("mobile_requests") && message.includes("schema cache")) {
    return [
      message,
      "Action requise : executer supabase/tvf-mobile-requests.sql dans Supabase SQL Editor, puis supabase/verify-tvf-mobile-requests.sql."
    ].join(" | ");
  }
  return message;
}

async function main() {
  const reference = `TEST-MOBILE-${Date.now()}`;
  const payload = {
    reference,
    source: "tvf-mobile-test-script",
    test: true,
    flow: "signal",
    details: {
      title: "Test technique TVF Mobile",
      description: "Ligne creee automatiquement pour verifier l'enregistrement mobile, puis supprimee."
    },
    contact: {
      name: "Controle TVF Mobile",
      email: "contact@territoiresvivantsfrance.fr",
      phone: "04 65 81 54 69"
    }
  };

  const row = {
    reference,
    flow: "signal",
    category: "logement",
    status: "received_mobile",
    raw_address: "Test technique TVF Mobile - Saint-Etienne",
    contact_name: "Controle TVF Mobile",
    contact_email: "contact@territoiresvivantsfrance.fr",
    contact_phone: "04 65 81 54 69",
    payload
  };

  let inserted = null;
  try {
    const insertResult = await publicClient
      .from("mobile_requests")
      .insert(row)
      .select("id,reference,status,flow")
      .single();

    if (insertResult.error) throw insertResult.error;
    inserted = insertResult.data;
    if (!inserted?.id || inserted.reference !== reference) throw new Error("Insertion mobile non confirmee.");
    console.log(`TVF_MOBILE_SUPABASE_INSERT_OK reference=${inserted.reference}`);
  } finally {
    if (inserted?.id) {
      const deleteResult = await serviceClient.from("mobile_requests").delete().eq("id", inserted.id);
      if (deleteResult.error) throw deleteResult.error;
      console.log(`TVF_MOBILE_SUPABASE_CLEANUP_OK reference=${reference}`);
    }
  }
}

main().catch((error) => {
  console.error(`TVF_MOBILE_SUPABASE_TEST_FAILED ${explainSupabaseError(error)}`);
  process.exitCode = 1;
});