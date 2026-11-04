"use client";

import { PLAN_DAYS, currentWeek, longestStreak, weekCompletedCount } from "@/lib/plan";
import type { DayState } from "@/lib/types";

function StatCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-4">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-2xl font-semibold">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-muted">{unit}</span>}
      </span>
    </div>
  );
}

export default function StatsScreen({
  nickname,
  dayState,
}: {
  nickname: string;
  dayState: DayState;
}) {
  const doneCount = PLAN_DAYS.filter((d) => dayState.get(d.day) === "check").length;
  const progress = Math.round((doneCount / PLAN_DAYS.length) * 100);
  const week = currentWeek(dayState);
  const thisWeek = weekCompletedCount(dayState, week);
  const streak = longestStreak(dayState);
  const remaining = PLAN_DAYS.length - doneCount;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <p className="mb-1 text-sm text-muted">{nickname}님의 기록</p>
      <h1 className="mb-6 text-2xl font-semibold">내 통계</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="읽은 날" value={doneCount} unit="일" />
        <StatCard label="진행률" value={progress} unit="%" />
        <StatCard label={`${week}주차 완료`} value={thisWeek} unit="/7일" />
        <StatCard label="연속 완독" value={streak} unit="일" />
      </div>

      <div className="mt-3 rounded-xl border border-border bg-card px-4 py-4">
        <p className="text-xs text-muted">완주까지 남은 날</p>
        <p className="mt-1 text-2xl font-semibold">
          {remaining === 0 ? "완주! 🎉" : `${remaining}일`}
        </p>
      </div>
    </div>
  );
}
