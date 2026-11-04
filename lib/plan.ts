import type { Book } from "./books";

export interface PlanDay {
  day: number;
  /** human-readable range shown in the UI, e.g. "창세기 1–2장" */
  range: string;
}

/**
 * Builds a day-by-day reading plan for a book: 2 chapters/day, tapering to a
 * single chapter on the last day when the chapter count is odd. The final
 * day is marked as the completion/reflection day.
 */
export function buildPlanDays(book: Book): PlanDay[] {
  const days: PlanDay[] = [];
  let chapter = 1;
  let day = 1;
  while (chapter <= book.chapters) {
    const remaining = book.chapters - chapter + 1;
    const take = remaining === 1 ? 1 : 2;
    const start = chapter;
    const end = Math.min(chapter + take - 1, book.chapters);
    const range = start === end ? `${book.nameKo} ${start}장` : `${book.nameKo} ${start}–${end}장`;
    days.push({ day, range });
    chapter = end + 1;
    day += 1;
  }
  if (days.length > 0) {
    days[days.length - 1] = {
      ...days[days.length - 1],
      range: `${days[days.length - 1].range} · 통독 회고`,
    };
  }
  return days;
}

/** Longest run of consecutive days (1..totalDays) where the last known state is "check". */
export function longestStreak(
  stateByDay: Map<number, "check" | "uncheck">,
  totalDays: number
): number {
  let best = 0;
  let run = 0;
  for (let d = 1; d <= totalDays; d += 1) {
    if (stateByDay.get(d) === "check") {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/** The 1-indexed week containing the first unread day, or the last week once all days are read. */
export function currentWeek(
  stateByDay: Map<number, "check" | "uncheck">,
  totalDays: number
): number {
  const lastWeek = Math.max(1, Math.ceil(totalDays / 7));
  for (let d = 1; d <= totalDays; d += 1) {
    if (stateByDay.get(d) !== "check") {
      return Math.ceil(d / 7);
    }
  }
  return lastWeek;
}

/** "YYYY.MM.DD" for a date or ISO timestamp, in the local timezone. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

/**
 * The plan's start date (when the book was selected) and its target end date,
 * assuming one plan-day is read per calendar day.
 */
export function planDateRange(selectedAt: string, totalDays: number): { start: Date; end: Date } {
  const start = new Date(selectedAt);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(totalDays - 1, 0));
  return { start, end };
}

/** Count of checked days within a given 1-indexed week (7 days each). */
export function weekCompletedCount(
  stateByDay: Map<number, "check" | "uncheck">,
  week: number,
  totalDays: number
): number {
  const start = (week - 1) * 7 + 1;
  const end = Math.min(start + 6, totalDays);
  let count = 0;
  for (let d = start; d <= end; d += 1) {
    if (stateByDay.get(d) === "check") count += 1;
  }
  return count;
}
