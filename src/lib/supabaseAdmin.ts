import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only use (bypasses RLS). Never import this
// from client components or expose the key via NEXT_PUBLIC_*.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";
