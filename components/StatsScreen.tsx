"use client";

import { currentWeek, formatDate, longestStreak, planDateRange, planPaceDiff, weekCompletedCount } from "@/lib/plan";
import type { BookEntry } from "@/app/page";

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

function BookStats({ entry }: { entry: BookEntry }) {
  const { book, planDays, dayState, selectedAt } = entry;
  const totalDays = planDays.length;
  const doneCount = planDays.filter((d) => dayState.get(d.day) === "check").length;
  const progress = totalDays > 0 ? Math.round((doneCount / totalDays) * 100) : 0;
  const week = currentWeek(dayState, totalDays);
  const thisWeek = weekCompletedCount(dayState, week, totalDays);
  const streak = longestStreak(dayState, totalDays);
  const remaining = totalDays - doneCount;
  const { start, end } = planDateRange(selectedAt, totalDays);
  const paceDiff = planPaceDiff(selectedAt, totalDays, doneCount);

  return (
    <div className="mb-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{book.nameKo}</h2>
        <span className="text-xs text-muted">
          {formatDate(start)} ~ {formatDate(end)}
          {remaining > 0 && " (목표)"}
        </span>
      </div>
      <p
        className={`mb-3 text-xs font-medium ${
          paceDiff > 0 ? "text-accent" : paceDiff < 0 ? "text-red-600" : "text-muted"
        }`}
      >
        {paceDiff > 0 && `목표보다 ${paceDiff}일 일찍 ${remaining === 0 ? "완독했어요" : "가고 있어요"}`}
        {paceDiff < 0 && `목표보다 ${-paceDiff}일 초과됐어요`}
        {paceDiff === 0 && "계획대로 진행 중이에요"}
      </p>
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

export default function StatsScreen({
  nickname,
  books,
}: {
  nickname: string;
  books: BookEntry[];
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <p className="mb-1 text-sm text-muted">{nickname}님의 기록</p>
      <h1 className="mb-6 text-2xl font-semibold">내 통계</h1>

      {books.map((entry) => (
        <BookStats key={entry.book.id} entry={entry} />
      ))}
    </div>
  );
}
