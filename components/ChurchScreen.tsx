"use client";

import { useEffect, useState } from "react";
import { findBook } from "@/lib/books";
import {
  completedDayCount,
  fetchAllBookSelections,
  fetchAllEvents,
  fetchAllProfiles,
  stateByUserAndBook,
} from "@/lib/data";
import { buildPlanDays } from "@/lib/plan";
import type { Profile } from "@/lib/types";

interface Row {
  profile: Profile;
  bookName: string | null;
  completed: number;
  total: number;
}

export default function ChurchScreen({ myUserId }: { myUserId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profiles, selections, events] = await Promise.all([
          fetchAllProfiles(),
          fetchAllBookSelections(),
          fetchAllEvents(),
        ]);
        const selectionByUser = new Map(selections.map((s) => [s.user_id, s.book_id]));
        const states = stateByUserAndBook(events);
        const built: Row[] = profiles
          .map((profile) => {
            const bookId = selectionByUser.get(profile.id);
            const book = bookId ? findBook(bookId) : undefined;
            const total = book ? buildPlanDays(book).length : 0;
            const state = bookId ? states.get(`${profile.id}|${bookId}`) ?? new Map() : new Map();
            return {
              profile,
              bookName: book?.nameKo ?? null,
              completed: completedDayCount(state),
              total,
            };
          })
          .sort((a, b) => {
            const ap = a.total > 0 ? a.completed / a.total : -1;
            const bp = b.total > 0 ? b.completed / b.total : -1;
            return bp - ap || a.profile.nickname.localeCompare(b.profile.nickname);
          });
        if (!cancelled) setRows(built);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "현황을 불러오지 못했습니다.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 text-sm text-red-600">{error}</div>
    );
  }

  if (!rows) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        불러오는 중...
      </div>
    );
  }

  const finishers = rows.filter((r) => r.total > 0 && r.completed === r.total).length;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <h1 className="mb-6 text-2xl font-semibold">목양교회 현황</h1>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted">참여 인원</p>
          <p className="mt-1 text-2xl font-semibold">{rows.length}명</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted">완주자</p>
          <p className="mt-1 text-2xl font-semibold">{finishers}명</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ profile, bookName, completed, total }) => {
          const isMe = profile.id === myUserId;
          return (
            <div
              key={profile.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                isMe ? "border-accent bg-accent-soft" : "border-border bg-card"
              }`}
            >
              <span className={`text-sm ${isMe ? "font-semibold" : ""}`}>
                {profile.nickname}
                {isMe && <span className="ml-1.5 text-xs text-accent">(나)</span>}
                {total > 0 && completed === total && <span className="ml-1.5">🏆</span>}
                {bookName && <span className="block text-xs text-muted">{bookName}</span>}
              </span>
              <span className="text-sm text-muted">
                {total > 0 ? `${completed}/${total}일` : "책 미선택"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
