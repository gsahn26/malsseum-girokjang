import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabaseServer";
import { findBook } from "@/lib/books";
import type { EventKind } from "@/lib/types";

export async function GET(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const bookId = new URL(request.url).searchParams.get("bookId") ?? "";
  if (!findBook(bookId)) {
    return NextResponse.json({ error: "알 수 없는 책입니다." }, { status: 400 });
  }

  const { data, error } = await authed.client
    .from("church_reading_events")
    .select("day, kind")
    .eq("user_id", authed.user.id)
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const dayState: Record<number, EventKind> = {};
  for (const row of data ?? []) {
    dayState[row.day] = row.kind as EventKind;
  }
  return NextResponse.json({ dayState });
}

export async function POST(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookId = typeof body?.bookId === "string" ? body.bookId : "";
  const day = typeof body?.day === "number" ? body.day : NaN;
  const kind = body?.kind;

  if (!findBook(bookId)) {
    return NextResponse.json({ error: "알 수 없는 책입니다." }, { status: 400 });
  }
  if (!Number.isInteger(day) || day < 1 || day > 100) {
    return NextResponse.json({ error: "잘못된 날짜입니다." }, { status: 400 });
  }
  if (kind !== "check" && kind !== "uncheck") {
    return NextResponse.json({ error: "잘못된 상태입니다." }, { status: 400 });
  }

  const { error } = await authed.client
    .from("church_reading_events")
    .insert({ user_id: authed.user.id, book_id: bookId, day, kind });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
