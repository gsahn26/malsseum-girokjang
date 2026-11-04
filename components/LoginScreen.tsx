"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleKakaoLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
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
        onClick={handleKakaoLogin}
        disabled={loading}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-6 py-3.5 font-medium text-[#191919] shadow-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? "연결하는 중..." : "카카오로 시작하기"}
      </button>

      {error && <p className="max-w-xs text-sm text-red-600">{error}</p>}
    </div>
  );
}
