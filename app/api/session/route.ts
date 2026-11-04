import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await authed.client
    .from("church_profiles")
    .select("session_token")
    .eq("id", authed.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sessionToken: data?.session_token ?? null });
}

export async function POST(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = randomUUID();
  const { error } = await authed.client
    .from("church_profiles")
    .update({ session_token: token })
    .eq("id", authed.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sessionToken: token });
}
