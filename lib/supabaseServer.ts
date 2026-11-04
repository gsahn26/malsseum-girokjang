import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing."
  );
}

/**
 * A Supabase client scoped to one request, authenticated as the calling user
 * (via their own access token). Every query still goes through Postgres RLS
 * exactly as it would from the browser — this layer adds request/response
 * handling and server-side aggregation, not a bypass of row ownership.
 */
export function supabaseAs(accessToken: string): SupabaseClient {
  return createClient(url!, anonKey!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuthedRequest {
  user: { id: string };
  client: SupabaseClient;
}

/** Resolves the bearer token on an API route request to a user + RLS-scoped client. */
export async function requireUser(request: Request): Promise<AuthedRequest | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const client = supabaseAs(token);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;

  return { user: { id: data.user.id }, client };
}
