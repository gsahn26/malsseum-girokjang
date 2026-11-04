"use client";

import { PLAN_DAYS } from "@/lib/plan";
import type { DayState } from "@/lib/types";

export default function PlanScreen({
  nickname,
  dayState,
  pendingDay,
  onToggle,
}: {
  nickname: string;
  dayState: DayState;
  pendingDay: number | null;
  onToggle: (day: number) => void;
}) {
  const doneCount = PLAN_DAYS.filter((d) => dayState.get(d.day) === "check").length;
  const progress = Math.round((doneCount / PLAN_DAYS.length) * 100);
  const weeks = [0, 1, 2, 3].map((w) => PLAN_DAYS.slice(w * 7, w * 7 + 7));

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <div className="mb-6">
        <p className="text-sm text-muted">{nickname}님, 창세기 28일 통독</p>
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-2xl font-semibold">
            {doneCount}
            <span className="text-base font-normal text-muted"> / 28일</span>
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
