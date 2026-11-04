"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm tracking-[0.3em] text-muted">목양교회</span>
        <h1 className="text-3xl font-semibold">말씀기록장</h1>
        <p className="max-w-xs text-sm leading-6 text-muted">
          하루 1~2장씩, 28일이면 창세기를 끝까지 읽습니다.
          <br />
          목양교회 성도와 함께 읽은 날을 기록해 보세요.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-medium text-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.2-17.1 10.3z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.9 39.7 16.4 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.5C41.6 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
          />
        </svg>
        {loading ? "연결하는 중..." : "Google로 시작하기"}
      </button>

      {error && <p className="max-w-xs text-sm text-red-600">{error}</p>}
    </div>
  );
}
