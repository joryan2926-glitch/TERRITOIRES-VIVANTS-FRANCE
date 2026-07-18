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
      message: "Supabase n'est pas encore configuré pour cette préversion."
    };
  }

  if (!supabaseUrl.startsWith("https://")) {
    return {
      configured: false,
      title: "Configuration à vérifier",
      message: "L'URL Supabase doit commencer par https://."
    };
  }

  return {
    configured: true,
    title: "Supabase prêt",
    message: "Les demandes peuvent être envoyées vers la base configurée."
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