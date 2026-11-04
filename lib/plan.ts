export interface PlanDay {
  day: number;
  /** human-readable range shown in the UI, e.g. "창세기 1–2장" */
  range: string;
}

// 28-day Genesis reading plan.
// 1–22일: 2장씩 (1~44장)
// 23–28일: 1장씩 (45~50장) + 28일차는 완주 회고
export const PLAN_DAYS: PlanDay[] = [
  { day: 1, range: "창세기 1–2장" },
  { day: 2, range: "창세기 3–4장" },
  { day: 3, range: "창세기 5–6장" },
  { day: 4, range: "창세기 7–8장" },
  { day: 5, range: "창세기 9–10장" },
  { day: 6, range: "창세기 11–12장" },
  { day: 7, range: "창세기 13–14장" },
  { day: 8, range: "창세기 15–16장" },
  { day: 9, range: "창세기 17–18장" },
  { day: 10, range: "창세기 19–20장" },
  { day: 11, range: "창세기 21–22장" },
  { day: 12, range: "창세기 23–24장" },
  { day: 13, range: "창세기 25–26장" },
  { day: 14, range: "창세기 27–28장" },
  { day: 15, range: "창세기 29–30장" },
  { day: 16, range: "창세기 31–32장" },
  { day: 17, range: "창세기 33–34장" },
  { day: 18, range: "창세기 35–36장" },
  { day: 19, range: "창세기 37–38장" },
  { day: 20, range: "창세기 39–40장" },
  { day: 21, range: "창세기 41–42장" },
  { day: 22, range: "창세기 43–44장" },
  { day: 23, range: "창세기 45장" },
  { day: 24, range: "창세기 46장" },
  { day: 25, range: "창세기 47장" },
  { day: 26, range: "창세기 48장" },
  { day: 27, range: "창세기 49장" },
  { day: 28, range: "창세기 50장 · 통독 회고" },
];

/** Longest run of consecutive days where the last known state is "check". */
export function longestStreak(stateByDay: Map<number, "check" | "uncheck">): number {
  let best = 0;
  let run = 0;
  for (let d = 1; d <= 28; d += 1) {
    if (stateByDay.get(d) === "check") {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/** The 1-indexed week (1-4) containing the first unread day, or 4 once all 28 days are read. */
export function currentWeek(stateByDay: Map<number, "check" | "uncheck">): number {
  for (let d = 1; d <= 28; d += 1) {
    if (stateByDay.get(d) !== "check") {
      return Math.ceil(d / 7);
    }
  }
  return 4;
}

/** Count of checked days within a given 1-indexed week (1-4, 7 days each). */
export function weekCompletedCount(
  stateByDay: Map<number, "check" | "uncheck">,
  week: number
): number {
  const start = (week - 1) * 7 + 1;
  const end = Math.min(start + 6, 28);
  let count = 0;
  for (let d = start; d <= end; d += 1) {
    if (stateByDay.get(d) === "check") count += 1;
  }
  return count;
}
