"use client";

import type { BookEntry } from "@/app/page";
import type { PlanDay } from "@/lib/plan";

export default function PlanScreen({
  nickname,
  books,
  activeBookId,
  pendingDay,
  onChangeActive,
  onToggle,
  onAddBook,
  onRemoveBook,
}: {
  nickname: string;
  books: BookEntry[];
  activeBookId: string;
  pendingDay: number | null;
  onChangeActive: (bookId: string) => void;
  onToggle: (day: number) => void;
  onAddBook: () => void;
  onRemoveBook: (bookId: string) => void;
}) {
  const active = books.find((e) => e.book.id === activeBookId) ?? books[0];
  const { book, planDays, dayState } = active;
  const doneCount = planDays.filter((d) => dayState.get(d.day) === "check").length;
  const progress = planDays.length > 0 ? Math.round((doneCount / planDays.length) * 100) : 0;
  const weeks: PlanDay[][] = [];
  for (let i = 0; i < planDays.length; i += 7) {
    weeks.push(planDays.slice(i, i + 7));
  }

  function handleRemove() {
    if (window.confirm(`${book.nameKo} 통독을 그만할까요? 기록은 사라지지 않아요.`)) {
      onRemoveBook(book.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <div className="mb-5">
        <p className="mb-2 text-sm text-muted">{nickname}님, 통독 중</p>
        <div className="flex flex-wrap items-center gap-2">
          {books.map((entry) => (
            <button
              key={entry.book.id}
              type="button"
              onClick={() => onChangeActive(entry.book.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                entry.book.id === book.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-card text-muted"
              }`}
            >
              {entry.book.nameKo}
            </button>
          ))}
          <button
            type="button"
            onClick={onAddBook}
            className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted"
          >
            + 책 추가
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{book.nameKo} 통독</p>
          <button type="button" onClick={handleRemove} className="text-xs text-muted underline">
            그만 읽기
          </button>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-2xl font-semibold">
            {doneCount}
            <span className="text-base font-normal text-muted"> / {planDays.length}일</span>
          </h1>
          <span className="text-sm font-medium text-accent">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-accent-soft">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {weeks.map((week, i) => (
          <div key={i}>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted">
              {i + 1}주차
            </p>
            <div className="flex flex-col gap-2">
              {week.map((d) => {
                const checked = dayState.get(d.day) === "check";
                const isPending = pendingDay === d.day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    disabled={isPending}
                    onClick={() => onToggle(d.day)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                      checked
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-card"
                    } ${isPending ? "opacity-60" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                        checked
                          ? "border-accent bg-accent text-white"
                          : "border-border text-muted"
                      }`}
                    >
                      {checked ? "✓" : d.day}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">Day {d.day}</span>
                      <span className="block text-sm text-muted">{d.range}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
