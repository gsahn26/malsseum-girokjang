import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await authed.client
    .from("church_profiles")
    .select("*")
    .eq("id", authed.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}

export async function POST(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const nickname = typeof body?.nickname === "string" ? body.nickname.trim() : "";
  if (nickname.length < 2 || nickname.length > 12) {
    return NextResponse.json({ error: "닉네임은 2~12자여야 합니다." }, { status: 400 });
  }

  const { data, error } = await authed.client
    .from("church_profiles")
    .insert({ id: authed.user.id, nickname })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}
