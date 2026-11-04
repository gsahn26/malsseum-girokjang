"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchBookSelection,
  fetchProfile,
  fetchUserEvents,
  insertEvent,
  saveBookSelection,
  stateFromEvents,
} from "@/lib/data";
import { findBook, type Book } from "@/lib/books";
import { buildPlanDays, type PlanDay } from "@/lib/plan";
import type { DayState, Profile } from "@/lib/types";
import LoginScreen from "@/components/LoginScreen";
import NicknameScreen from "@/components/NicknameScreen";
import BookSelectScreen from "@/components/BookSelectScreen";
import PlanScreen from "@/components/PlanScreen";
import StatsScreen from "@/components/StatsScreen";
import ChurchScreen from "@/components/ChurchScreen";
import ShareScreen from "@/components/ShareScreen";
import BottomNav, { type Tab } from "@/components/BottomNav";

type Phase = "loading" | "login" | "nickname" | "selectBook" | "app" | "error";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [dayState, setDayState] = useState<DayState>(new Map());
  const [tab, setTab] = useState<Tab>("plan");
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [bookSaving, setBookSaving] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

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

        const selection = await fetchBookSelection(nextSession.user.id);
        if (cancelled) return;
        const selectedBook = selection ? findBook(selection.book_id) : undefined;
        if (!selectedBook) {
          setPhase("selectBook");
          return;
        }
        const days = buildPlanDays(selectedBook);
        const events = await fetchUserEvents(nextSession.user.id, selectedBook.id);
        if (cancelled) return;
        setBook(selectedBook);
        setPlanDays(days);
        setDayState(stateFromEvents(events, nextSession.user.id, selectedBook.id));
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

  async function proceedToBookOrApp(userId: string) {
    try {
      const selection = await fetchBookSelection(userId);
      const selectedBook = selection ? findBook(selection.book_id) : undefined;
      if (!selectedBook) {
        setPhase("selectBook");
        return;
      }
      const days = buildPlanDays(selectedBook);
      const events = await fetchUserEvents(userId, selectedBook.id);
      setBook(selectedBook);
      setPlanDays(days);
      setDayState(stateFromEvents(events, userId, selectedBook.id));
      setPhase("app");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "불러오는 중 문제가 발생했습니다.");
      setPhase("error");
    }
  }

  async function handleSelectBook(bookId: string) {
    if (!session || bookSaving) return;
    setBookSaving(true);
    setBookError(null);
    try {
      await saveBookSelection(session.user.id, bookId);
      const selectedBook = findBook(bookId);
      if (!selectedBook) throw new Error("알 수 없는 책입니다.");
      const days = buildPlanDays(selectedBook);
      const events = await fetchUserEvents(session.user.id, selectedBook.id);
      setBook(selectedBook);
      setPlanDays(days);
      setDayState(stateFromEvents(events, session.user.id, selectedBook.id));
      setTab("plan");
      setPhase("app");
    } catch (err) {
      setBookError(err instanceof Error ? err.message : "책을 선택하지 못했습니다.");
    } finally {
      setBookSaving(false);
    }
  }

  async function handleToggle(day: number) {
    if (!session || !book || pendingDay !== null) return;
    const current = dayState.get(day) === "check" ? "check" : "uncheck";
    const next = current === "check" ? "uncheck" : "check";
    setPendingDay(day);
    try {
      await insertEvent(session.user.id, book.id, day, next);
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
          proceedToBookOrApp(session.user.id);
        }}
      />
    );
  }

  if (phase === "selectBook" && profile) {
    return (
      <BookSelectScreen
        nickname={profile.nickname}
        saving={bookSaving}
        error={bookError}
        onSelect={handleSelectBook}
      />
    );
  }

  if (phase === "app" && session && profile && book) {
    return (
      <div className="flex min-h-dvh flex-col">
        {tab === "plan" && (
          <PlanScreen
            nickname={profile.nickname}
            bookName={book.nameKo}
            planDays={planDays}
            dayState={dayState}
            pendingDay={pendingDay}
            onToggle={handleToggle}
            onChangeBook={() => setPhase("selectBook")}
          />
        )}
        {tab === "stats" && (
          <StatsScreen
            nickname={profile.nickname}
            bookName={book.nameKo}
            planDays={planDays}
            dayState={dayState}
          />
        )}
        {tab === "church" && <ChurchScreen myUserId={session.user.id} />}
        {tab === "share" && (
          <ShareScreen
            nickname={profile.nickname}
            bookName={book.nameKo}
            planDays={planDays}
            dayState={dayState}
          />
        )}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    );
  }

  return null;
}
