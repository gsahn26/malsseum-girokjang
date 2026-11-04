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

async function apiDelete<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${query}`, { method: "DELETE", headers: await authHeaders() });
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

export async function fetchBookSelections(): Promise<BookSelection[]> {
  const { selections } = await apiGet<{ selections: BookSelection[] }>("/api/book-selection");
  return selections;
}

export async function addBookSelection(bookId: string): Promise<BookSelection[]> {
  const { selections } = await apiPost<{ selections: BookSelection[] }>("/api/book-selection", { bookId });
  return selections;
}

export async function removeBookSelection(bookId: string): Promise<void> {
  await apiDelete("/api/book-selection", { bookId });
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

export async function claimSessionToken(): Promise<string> {
  const { sessionToken } = await apiPost<{ sessionToken: string }>("/api/session", {});
  return sessionToken;
}

export async function fetchSessionToken(): Promise<string | null> {
  const { sessionToken } = await apiGet<{ sessionToken: string | null }>("/api/session");
  return sessionToken;
}

export interface ChurchRow {
  userId: string;
  nickname: string;
  books: {
    bookName: string;
    completed: number;
    total: number;
    chaptersDone: number;
    totalChapters: number;
  }[];
  totalCompleted: number;
  totalDays: number;
  totalChaptersDone: number;
  totalChapters: number;
}

export async function fetchChurchOverview(): Promise<{
  rows: ChurchRow[];
  participantCount: number;
  finisherCount: number;
}> {
  return apiGet("/api/church");
}
