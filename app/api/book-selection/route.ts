import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabaseServer";
import { findBook } from "@/lib/books";

export async function GET(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await authed.client
    .from("church_book_selections")
    .select("*")
    .eq("user_id", authed.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ selection: data });
}

export async function POST(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookId = typeof body?.bookId === "string" ? body.bookId : "";
  if (!findBook(bookId)) {
    return NextResponse.json({ error: "알 수 없는 책입니다." }, { status: 400 });
  }

  const { data, error } = await authed.client
    .from("church_book_selections")
    .upsert({ user_id: authed.user.id, book_id: bookId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ selection: data });
}
