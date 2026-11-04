import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabaseServer";
import { findBook } from "@/lib/books";
import { buildPlanDays } from "@/lib/plan";
import type { EventKind } from "@/lib/types";

export async function GET(request: Request) {
  const authed = await requireUser(request);
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [profilesRes, selectionsRes, eventsRes] = await Promise.all([
    authed.client.from("church_profiles").select("id, nickname"),
    authed.client.from("church_book_selections").select("user_id, book_id"),
    authed.client.from("church_reading_events").select("user_id, book_id, day, kind"),
  ]);
  if (profilesRes.error) return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
  if (selectionsRes.error) return NextResponse.json({ error: selectionsRes.error.message }, { status: 500 });
  if (eventsRes.error) return NextResponse.json({ error: eventsRes.error.message }, { status: 500 });

  const bookByUser = new Map(selectionsRes.data.map((s) => [s.user_id, s.book_id]));
  const stateByKey = new Map<string, Map<number, EventKind>>();
  for (const e of eventsRes.data) {
    const key = `${e.user_id}|${e.book_id}`;
    let state = stateByKey.get(key);
    if (!state) {
      state = new Map();
      stateByKey.set(key, state);
    }
    state.set(e.day, e.kind as EventKind);
  }

  const rows = profilesRes.data
    .map((profile) => {
      const bookId = bookByUser.get(profile.id);
      const book = bookId ? findBook(bookId) : undefined;
      const total = book ? buildPlanDays(book).length : 0;
      const state = bookId ? stateByKey.get(`${profile.id}|${bookId}`) : undefined;
      const completed = state ? [...state.values()].filter((k) => k === "check").length : 0;
      return { userId: profile.id, nickname: profile.nickname, bookName: book?.nameKo ?? null, completed, total };
    })
    .sort((a, b) => {
      const ap = a.total > 0 ? a.completed / a.total : -1;
      const bp = b.total > 0 ? b.completed / b.total : -1;
      return bp - ap || a.nickname.localeCompare(b.nickname);
    });

  const finishers = rows.filter((r) => r.total > 0 && r.completed === r.total).length;

  return NextResponse.json({ rows, participantCount: rows.length, finisherCount: finishers });
}
