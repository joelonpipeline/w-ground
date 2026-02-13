import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_supabase_url") {
    // Return a dummy client during build time or when env vars are not set
    return createClient("https://placeholder.supabase.co", "placeholder-key");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = getSupabaseClient();
