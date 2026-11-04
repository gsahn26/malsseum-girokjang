import { supabase } from "./supabaseClient";
import type { BookSelection, DayState, EventKind, Profile } from "./types";

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `요청에 실패했습니다 (${res.status})`);
  return body as T;
}

async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `요청에 실패했습니다 (${res.status})`);
  return body as T;
}

export async function fetchProfile(): Promise<Profile | null> {
  const { profile } = await apiGet<{ profile: Profile | null }>("/api/profile");
  return profile;
}

export async function createProfile(nickname: string): Promise<Profile> {
  const { profile } = await apiPost<{ profile: Profile }>("/api/profile", { nickname });
  return profile;
}

export async function fetchBookSelection(): Promise<BookSelection | null> {
  const { selection } = await apiGet<{ selection: BookSelection | null }>("/api/book-selection");
  return selection;
}

export async function saveBookSelection(bookId: string): Promise<BookSelection> {
  const { selection } = await apiPost<{ selection: BookSelection }>("/api/book-selection", { bookId });
  return selection;
}

export async function fetchUserEvents(bookId: string): Promise<DayState> {
  const { dayState } = await apiGet<{ dayState: Record<number, EventKind> }>(
    `/api/events?bookId=${encodeURIComponent(bookId)}`
  );
  return new Map(Object.entries(dayState).map(([day, kind]) => [Number(day), kind]));
}

export async function insertEvent(bookId: string, day: number, kind: EventKind): Promise<void> {
  await apiPost<{ ok: true }>("/api/events", { bookId, day, kind });
}

export interface ChurchRow {
  userId: string;
  nickname: string;
  bookName: string | null;
  completed: number;
  total: number;
}

export async function fetchChurchOverview(): Promise<{
  rows: ChurchRow[];
  participantCount: number;
  finisherCount: number;
}> {
  return apiGet("/api/church");
}
