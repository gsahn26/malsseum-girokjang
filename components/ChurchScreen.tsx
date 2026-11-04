"use client";

import { useEffect, useState } from "react";
import { fetchChurchOverview, type ChurchRow } from "@/lib/data";

export default function ChurchScreen({ myUserId }: { myUserId: string }) {
  const [rows, setRows] = useState<ChurchRow[] | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [finisherCount, setFinisherCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const overview = await fetchChurchOverview();
        if (cancelled) return;
        setRows(overview.rows);
        setParticipantCount(overview.participantCount);
        setFinisherCount(overview.finisherCount);
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

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <h1 className="mb-6 text-2xl font-semibold">목양교회 현황</h1>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted">참여 인원</p>
          <p className="mt-1 text-2xl font-semibold">{participantCount}명</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted">완주자</p>
          <p className="mt-1 text-2xl font-semibold">{finisherCount}명</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ userId, nickname, bookName, completed, total }) => {
          const isMe = userId === myUserId;
          return (
            <div
              key={userId}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                isMe ? "border-accent bg-accent-soft" : "border-border bg-card"
              }`}
            >
              <span className={`text-sm ${isMe ? "font-semibold" : ""}`}>
                {nickname}
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
