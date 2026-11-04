import { supabase } from "./supabaseClient";
import type { DayState, EventKind, Profile, ReadingEvent } from "./types";

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

export async function fetchAllEvents(): Promise<ReadingEvent[]> {
  const { data, error } = await supabase
    .from("church_reading_events")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertEvent(userId: string, day: number, kind: EventKind): Promise<void> {
  const { error } = await supabase
    .from("church_reading_events")
    .insert({ user_id: userId, day, kind });
  if (error) throw error;
}

/** Reduces an ordered event history down to the latest kind per day. */
export function stateFromEvents(events: ReadingEvent[], userId: string): DayState {
  const state: DayState = new Map();
  for (const event of events) {
    if (event.user_id !== userId) continue;
    state.set(event.day, event.kind);
  }
  return state;
}

/** Groups all events by user, each reduced to its latest per-day state. */
export function stateByUser(events: ReadingEvent[]): Map<string, DayState> {
  const result = new Map<string, DayState>();
  for (const event of events) {
    let state = result.get(event.user_id);
    if (!state) {
      state = new Map();
      result.set(event.user_id, state);
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
