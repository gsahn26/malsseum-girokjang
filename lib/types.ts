export interface Profile {
  id: string;
  nickname: string;
  created_at: string;
}

export type EventKind = "check" | "uncheck";

export interface ReadingEvent {
  id: number;
  user_id: string;
  day: number;
  kind: EventKind;
  created_at: string;
}

/** Latest kind per day, derived from a user's event history. */
export type DayState = Map<number, EventKind>;
