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

  const bookIdsByUser = new Map<string, string[]>();
  for (const s of selectionsRes.data) {
    const list = bookIdsByUser.get(s.user_id) ?? [];
    list.push(s.book_id);
    bookIdsByUser.set(s.user_id, list);
  }
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
      const bookIds = bookIdsByUser.get(profile.id) ?? [];
      const books = bookIds.flatMap((bookId) => {
        const book = findBook(bookId);
        if (!book) return [];
        const total = buildPlanDays(book).length;
        const state = stateByKey.get(`${profile.id}|${bookId}`);
        const completed = state ? [...state.values()].filter((k) => k === "check").length : 0;
        return [{ bookName: book.nameKo, completed, total }];
      });
      const totalDays = books.reduce((sum, b) => sum + b.total, 0);
      const totalCompleted = books.reduce((sum, b) => sum + b.completed, 0);
      return { userId: profile.id, nickname: profile.nickname, books, totalCompleted, totalDays };
    })
    .sort((a, b) => {
      const ap = a.totalDays > 0 ? a.totalCompleted / a.totalDays : -1;
      const bp = b.totalDays > 0 ? b.totalCompleted / b.totalDays : -1;
      return bp - ap || a.nickname.localeCompare(b.nickname);
    });

  const finishers = rows.filter((r) => r.books.some((b) => b.total > 0 && b.completed === b.total)).length;

  return NextResponse.json({ rows, participantCount: rows.length, finisherCount: finishers });
}
