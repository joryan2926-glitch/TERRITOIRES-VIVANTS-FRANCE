import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"));
}


export function getSupabaseConfigStatus() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      title: "Mode local",
      message: "Les demandes restent preparees sur ce telephone tant que l'envoi TVF OS n'est pas actif."
    };
  }

  if (!supabaseUrl.startsWith("https://")) {
    return {
      configured: false,
      title: "Connexion a verifier",
      message: "La connexion aux services TVF doit etre verifiee avant l'envoi reel."
    };
  }

  return {
    configured: true,
    title: "Envoi TVF OS actif",
    message: "Les demandes peuvent etre transmises vers TVF OS."
  };
}
export const supabase = hasSupabaseConfig()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;