"use client";

import { useState } from "react";
import { PLAN_DAYS } from "@/lib/plan";
import type { DayState } from "@/lib/types";

export default function ShareScreen({
  nickname,
  dayState,
}: {
  nickname: string;
  dayState: DayState;
}) {
  const [copied, setCopied] = useState(false);
  const doneCount = PLAN_DAYS.filter((d) => dayState.get(d.day) === "check").length;
  const progress = Math.round((doneCount / PLAN_DAYS.length) * 100);

  const text =
    doneCount === PLAN_DAYS.length
      ? `📖 ${nickname}, 말씀기록장에서 창세기 28일 통독을 완주했어요! 🎉\n함께 읽어요 ✨`
      : `📖 ${nickname}, 말씀기록장에서 창세기를 ${doneCount}/28일 읽었어요 (${progress}%)\n함께 창세기를 읽어요 ✨`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall back to copy
      }
    }
    await handleCopy();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-8">
      <h1 className="mb-6 text-2xl font-semibold">진행률 공유</h1>

      <div className="rounded-xl border border-border bg-card px-5 py-6 text-center">
        <p className="text-sm text-muted">나의 진행률</p>
        <p className="mt-1 text-3xl font-semibold text-accent">{progress}%</p>
        <p className="mt-1 text-sm text-muted">{doneCount}/28일 읽음</p>
      </div>

      <div className="mt-4 whitespace-pre-line rounded-xl border border-border bg-accent-soft px-4 py-4 text-sm leading-6">
        {text}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="w-full rounded-xl bg-accent px-6 py-3.5 font-medium text-white shadow-sm transition active:scale-[0.99]"
        >
          공유하기
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-xl border border-border bg-card px-6 py-3.5 font-medium transition active:scale-[0.99]"
        >
          {copied ? "복사됐어요 ✓" : "텍스트 복사"}
        </button>
      </div>
    </div>
  );
}
