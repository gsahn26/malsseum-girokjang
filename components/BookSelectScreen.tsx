"use client";

import { useState } from "react";
import { booksOf, type Testament } from "@/lib/books";
import { buildPlanDays } from "@/lib/plan";

export default function BookSelectScreen({
  nickname,
  saving,
  error,
  onSelect,
}: {
  nickname: string;
  saving: boolean;
  error: string | null;
  onSelect: (bookId: string) => void;
}) {
  const [testament, setTestament] = useState<Testament>("old");
  const books = booksOf(testament);

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-6 pt-8">
      <p className="mb-1 text-sm text-muted">{nickname}님, 반가워요</p>
      <h1 className="mb-5 text-2xl font-semibold">어떤 책을 읽으시겠어요?</h1>

      <div className="mb-4 flex rounded-xl border border-border bg-card p-1">
        {(["old", "new"] as Testament[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTestament(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              testament === t ? "bg-accent text-white" : "text-muted"
            }`}
          >
            {t === "old" ? "구약" : "신약"}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {books.map((book) => {
            const totalDays = buildPlanDays(book).length;
            return (
              <button
                key={book.id}
                type="button"
                disabled={saving}
                onClick={() => onSelect(book.id)}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition active:scale-[0.99] disabled:opacity-50"
              >
                <span className="text-sm font-medium">{book.nameKo}</span>
                <span className="text-xs text-muted">
                  {book.chapters}장 · {totalDays}일 플랜
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
