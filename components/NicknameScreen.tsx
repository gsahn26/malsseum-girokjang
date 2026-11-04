"use client";

import { useState } from "react";
import { createProfile } from "@/lib/data";
import type { Profile } from "@/lib/types";

export default function NicknameScreen({
  userId,
  onDone,
}: {
  userId: string;
  onDone: (profile: Profile) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = nickname.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 12;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const profile = await createProfile(userId, trimmed);
      onDone(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "닉네임을 저장하지 못했습니다.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold">닉네임을 정해주세요</h1>
        <p className="text-sm text-muted">
          목양교회 성도들에게 보여질 이름이에요. 한 번 정하면 바꿀 수 없어요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="예: 은혜자매"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-lg outline-none focus:border-accent"
        />
        <p className="text-xs text-muted">{trimmed.length}/12자 (2자 이상)</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!valid || saving}
          className="mt-2 w-full rounded-xl bg-accent px-6 py-3.5 font-medium text-white shadow-sm transition active:scale-[0.99] disabled:opacity-40"
        >
          {saving ? "저장하는 중..." : "시작하기"}
        </button>
      </form>
    </div>
  );
}
