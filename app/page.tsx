"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  addBookSelection,
  fetchBookSelections,
  fetchProfile,
  fetchUserEvents,
  insertEvent,
  removeBookSelection,
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

const IDLE_LOGOUT_MS = 5 * 60 * 1000;

export interface BookEntry {
  book: Book;
  planDays: PlanDay[];
  dayState: DayState;
  selectedAt: string;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("plan");
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [bookSaving, setBookSaving] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [addingBook, setAddingBook] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);
  const claimedTokenRef = useRef<string | null>(null);

  function claimSession(userId: string) {
    const token = crypto.randomUUID();
    claimedTokenRef.current = token;
    supabase.from("church_profiles").update({ session_token: token }).eq("id", userId).then(() => {});
  }

  async function loadBooksAndEvents() {
    const selections = await fetchBookSelections();
    const knownSelections = selections.filter((s) => findBook(s.book_id));
    if (knownSelections.length === 0) {
      setBooks([]);
      setActiveBookId(null);
      setPhase("selectBook");
      return;
    }
    const entries = await Promise.all(
      knownSelections.map(async (selection) => {
        const book = findBook(selection.book_id) as Book;
        const planDays = buildPlanDays(book);
        const dayState = await fetchUserEvents(book.id);
        return { book, planDays, dayState, selectedAt: selection.selected_at };
      })
    );
    setBooks(entries);
    setActiveBookId((prev) => (prev && entries.some((e) => e.book.id === prev) ? prev : entries[0].book.id));
    setPhase("app");
  }

  useEffect(() => {
    let cancelled = false;

    async function handleSession(nextSession: Session | null, event?: string) {
      setSession(nextSession);
      if (!nextSession) {
        setPhase("login");
        return;
      }
      setKickedOut(false);
      try {
        const existingProfile = await fetchProfile();
        if (cancelled) return;
        if (!existingProfile) {
          setPhase("nickname");
          return;
        }
        setProfile(existingProfile);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          claimSession(nextSession.user.id);
        }
        if (cancelled) return;
        await loadBooksAndEvents();
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "불러오는 중 문제가 발생했습니다.");
        setPhase("error");
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) handleSession(data.session, "INITIAL_SESSION");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      handleSession(nextSession, event);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 5분 동안 아무 활동이 없으면 자동 로그아웃.
  useEffect(() => {
    if (!session) return;

    let timer: ReturnType<typeof setTimeout>;
    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        supabase.auth.signOut();
      }, IDLE_LOGOUT_MS);
    }

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [session]);

  // 다른 기기/탭에서 같은 계정으로 로그인하면 session_token이 덮어써지고,
  // 이 쪽은 그 변경을 realtime으로 감지해서 자동 로그아웃된다.
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`profile-session-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "church_profiles",
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          const newToken = (payload.new as { session_token: string | null }).session_token;
          if (claimedTokenRef.current && newToken && newToken !== claimedTokenRef.current) {
            setKickedOut(true);
            supabase.auth.signOut();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleSelectBook(bookId: string) {
    if (!session || bookSaving) return;
    setBookSaving(true);
    setBookError(null);
    try {
      await addBookSelection(bookId);
      await loadBooksAndEvents();
      setActiveBookId(bookId);
      setAddingBook(false);
      setTab("plan");
    } catch (err) {
      setBookError(err instanceof Error ? err.message : "책을 선택하지 못했습니다.");
    } finally {
      setBookSaving(false);
    }
  }

  async function handleRemoveBook(bookId: string) {
    if (!session) return;
    try {
      await removeBookSelection(bookId);
      await loadBooksAndEvents();
    } catch {
      // leave state unchanged — the next sync will reflect the true server state
    }
  }

  async function handleToggle(bookId: string, day: number) {
    if (!session || pendingDay !== null) return;
    const entry = books.find((e) => e.book.id === bookId);
    if (!entry) return;
    const current = entry.dayState.get(day) === "check" ? "check" : "uncheck";
    const next = current === "check" ? "uncheck" : "check";
    setPendingDay(day);
    try {
      await insertEvent(bookId, day, next);
      setBooks((prev) =>
        prev.map((e) => {
          if (e.book.id !== bookId) return e;
          const copy = new Map(e.dayState);
          copy.set(day, next);
          return { ...e, dayState: copy };
        })
      );
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
    return (
      <LoginScreen
        notice={kickedOut ? "다른 기기에서 로그인되어 자동 로그아웃되었습니다." : undefined}
      />
    );
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
        onDone={(created) => {
          setProfile(created);
          if (session) claimSession(session.user.id);
          loadBooksAndEvents().catch((err) => {
            setLoadError(err instanceof Error ? err.message : "불러오는 중 문제가 발생했습니다.");
            setPhase("error");
          });
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

  if (phase === "app" && session && profile && books.length > 0) {
    const activeEntry = books.find((e) => e.book.id === activeBookId) ?? books[0];

    if (addingBook) {
      return (
        <BookSelectScreen
          nickname={profile.nickname}
          saving={bookSaving}
          error={bookError}
          title="어떤 책을 더 읽으시겠어요?"
          excludeIds={books.map((e) => e.book.id)}
          onSelect={handleSelectBook}
          onCancel={() => {
            setAddingBook(false);
            setBookError(null);
          }}
        />
      );
    }

    return (
      <div className="flex min-h-dvh flex-col">
        <div className="flex justify-end px-5 pt-3">
          <button type="button" onClick={handleLogout} className="text-xs text-muted underline">
            로그아웃
          </button>
        </div>
        {tab === "plan" && (
          <PlanScreen
            nickname={profile.nickname}
            books={books}
            activeBookId={activeEntry.book.id}
            pendingDay={pendingDay}
            onChangeActive={setActiveBookId}
            onToggle={(day) => handleToggle(activeEntry.book.id, day)}
            onAddBook={() => setAddingBook(true)}
            onRemoveBook={handleRemoveBook}
          />
        )}
        {tab === "stats" && <StatsScreen nickname={profile.nickname} books={books} />}
        {tab === "church" && <ChurchScreen myUserId={session.user.id} />}
        {tab === "share" && (
          <ShareScreen
            nickname={profile.nickname}
            bookName={activeEntry.book.nameKo}
            planDays={activeEntry.planDays}
            dayState={activeEntry.dayState}
          />
        )}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    );
  }

  return null;
}
