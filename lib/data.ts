import { supabase } from "./supabaseClient";
import type { BookSelection, DayState, EventKind, Profile, ReadingEvent } from "./types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("church_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProfile(userId: string, nickname: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("church_profiles")
    .insert({ id: userId, nickname })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("church_profiles").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchBookSelection(userId: string): Promise<BookSelection | null> {
  const { data, error } = await supabase
    .from("church_book_selections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveBookSelection(userId: string, bookId: string): Promise<BookSelection> {
  const { data, error } = await supabase
    .from("church_book_selections")
    .upsert({ user_id: userId, book_id: bookId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAllBookSelections(): Promise<BookSelection[]> {
  const { data, error } = await supabase.from("church_book_selections").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserEvents(userId: string, bookId: string): Promise<ReadingEvent[]> {
  const { data, error } = await supabase
    .from("church_reading_events")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllEvents(): Promise<ReadingEvent[]> {
  const { data, error } = await supabase
    .from("church_reading_events")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertEvent(
  userId: string,
  bookId: string,
  day: number,
  kind: EventKind
): Promise<void> {
  const { error } = await supabase
    .from("church_reading_events")
    .insert({ user_id: userId, book_id: bookId, day, kind });
  if (error) throw error;
}

/** Reduces an ordered event history down to the latest kind per day, for one user+book. */
export function stateFromEvents(events: ReadingEvent[], userId: string, bookId: string): DayState {
  const state: DayState = new Map();
  for (const event of events) {
    if (event.user_id !== userId || event.book_id !== bookId) continue;
    state.set(event.day, event.kind);
  }
  return state;
}

/** Groups all events by `userId|bookId`, each reduced to its latest per-day state. */
export function stateByUserAndBook(events: ReadingEvent[]): Map<string, DayState> {
  const result = new Map<string, DayState>();
  for (const event of events) {
    const key = `${event.user_id}|${event.book_id}`;
    let state = result.get(key);
    if (!state) {
      state = new Map();
      result.set(key, state);
    }
    state.set(event.day, event.kind);
  }
  return result;
}

export function completedDayCount(state: DayState): number {
  let count = 0;
  for (const kind of state.values()) {
    if (kind === "check") count += 1;
  }
  return count;
}
