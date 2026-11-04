import { createClient } from "@supabase/supabase-js";

// Two values travel in the bundle on purpose: the publishable anon key is
// public to everyone who visits the site, just like in the other project.
// Row Level Security is what actually decides what can be done.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. Copy .env.local.example to .env.local and fill them in."
  );
}

export const supabase = createClient(url, anonKey);
