"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { fetchProfile, insertEvent, stateFromEvents } from "@/lib/data";
import type { DayState, Profile } from "@/lib/types";
import LoginScreen from "@/components/LoginScreen";
import NicknameScreen from "@/components/NicknameScreen";
import PlanScreen from "@/components/PlanScreen";
import StatsScreen from "@/components/StatsScreen";
import ChurchScreen from "@/components/ChurchScreen";
import ShareScreen from "@/components/ShareScreen";
import BottomNav, { type Tab } from "@/components/BottomNav";

type Phase = "loading" | "login" | "nickname" | "app" | "error";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dayState, setDayState] = useState<DayState>(new Map());
  const [tab, setTab] = useState<Tab>("plan");
  const [pendingDay, setPendingDay] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleSession(nextSession: Session | null) {
      setSession(nextSession);
      if (!nextSession) {
        setPhase("login");
        return;
      }
      try {
        const existingProfile = await fetchProfile(nextSession.user.id);
        if (cancelled) return;
        if (!existingProfile) {
          setPhase("nickname");
          return;
        }
        setProfile(existingProfile);
        const { data: events, error } = await supabase
          .from("church_reading_events")
          .select("*")
          .eq("user_id", nextSession.user.id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (cancelled) return;
        setDayState(stateFromEvents(events ?? [], nextSession.user.id));
        setPhase("app");
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "불러오는 중 문제가 발생했습니다.");
        setPhase("error");
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) handleSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSession(nextSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleToggle(day: number) {
    if (!session || pendingDay !== null) return;
    const current = dayState.get(day) === "check" ? "check" : "uncheck";
    const next = current === "check" ? "uncheck" : "check";
    setPendingDay(day);
    try {
      await insertEvent(session.user.id, day, next);
      setDayState((prev) => {
        const copy = new Map(prev);
        copy.set(day, next);
        return copy;
      });
    } catch {
      // leave state unchanged — the next sync will reflect the true server state
    } finally {
      setPendingDay(null);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        불러오는 중...
      </div>
    );
  }

  if (phase === "login") {
    return <LoginScreen />;
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-red-600">{loadError ?? "불러오는 중 문제가 발생했습니다."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (phase === "nickname" && session) {
    return (
      <NicknameScreen
        userId={session.user.id}
        onDone={(created) => {
          setProfile(created);
          setPhase("app");
        }}
      />
    );
  }

  if (phase === "app" && session && profile) {
    return (
      <div className="flex min-h-dvh flex-col">
        {tab === "plan" && (
          <PlanScreen
            nickname={profile.nickname}
            dayState={dayState}
            pendingDay={pendingDay}
            onToggle={handleToggle}
          />
        )}
        {tab === "stats" && <StatsScreen nickname={profile.nickname} dayState={dayState} />}
        {tab === "church" && <ChurchScreen myUserId={session.user.id} />}
        {tab === "share" && <ShareScreen nickname={profile.nickname} dayState={dayState} />}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    );
  }

  return null;
}
