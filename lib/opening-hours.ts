/**
 * Tiny parser for the common subset of OpenStreetMap `opening_hours`.
 *
 * Supported: "Mo-Su 09:00-17:00", several rules separated by ";", extra time
 * ranges separated by ",", day lists ("Mo,We,Fr"), wrapping day ranges
 * ("Su-We"), "off", "24/7", and hours that run past midnight ("10:00-02:00").
 * "PH off" / "SH off" are ignored.
 *
 * Anything else (sunrise/sunset, months, week numbers, "+" open-ended times...)
 * makes the parser give up and return null, so the UI simply shows nothing
 * instead of a wrong answer.
 */

const DAY_INDEX: Record<string, number> = {
  Mo: 0,
  Tu: 1,
  We: 2,
  Th: 3,
  Fr: 4,
  Sa: 5,
  Su: 6,
};

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_FROM_INTL: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const DAY = "(?:Mo|Tu|We|Th|Fr|Sa|Su)";
const DAY_SELECTOR = new RegExp(`^(${DAY}(?:-${DAY})?)(?:\\s+(.+))?$`);
const TIME_RANGE = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;
const OFF = /^(off|closed)$/i;

/** [start, end] in minutes from 00:00 of that day. End may exceed 1440. */
type Range = [number, number];
type Schedule = Range[][];
type Parsed = Schedule | "always";

export type OpenState = "open" | "closing-soon" | "closed";

export type OpenStatus = {
  state: OpenState;
  /** Short bold part, e.g. "Open" */
  headline: string;
  /** Muted part, e.g. "until 9 PM". May be empty. */
  detail: string;
};

function expandDays(selector: string): number[] {
  const [from, to] = selector.split("-");
  const start = DAY_INDEX[from];
  const end = DAY_INDEX[to ?? from];
  const days = [start];

  for (let day = start; day !== end; ) {
    day = (day + 1) % 7;
    days.push(day);
  }

  return days;
}

function parseTimeRange(value: string): Range | null {
  const match = TIME_RANGE.exec(value.trim());
  if (!match) return null;

  const [startH, startM, endH, endM] = match.slice(1).map(Number);

  if (startH > 23 || endH > 24 || startM > 59 || endM > 59) return null;
  if (endH === 24 && endM !== 0) return null;

  const start = startH * 60 + startM;
  let end = endH * 60 + endM;

  if (end <= start) end += 1440; // runs past midnight (or all day)

  return [start, end];
}

const parseCache = new Map<string, Parsed | null>();

function parse(raw: string): Parsed | null {
  const text = raw.trim();

  if (/^24\/7$/i.test(text)) return "always";

  const schedule: Schedule = [[], [], [], [], [], [], []];

  for (const part of text.split(";").map((p) => p.trim()).filter(Boolean)) {
    const partDays = new Map<number, Range[]>();
    const add = (days: number[], range: Range) => {
      for (const day of days) {
        partDays.set(day, [...(partDays.get(day) ?? []), range]);
      }
    };

    let pending: number[] = [];
    let lastDays: number[] | null = null;

    for (const fragment of part.split(",").map((f) => f.trim()).filter(Boolean)) {
      if (/\b(PH|SH)\b/.test(fragment)) {
        if (/off|closed/i.test(fragment)) continue;
        return null;
      }

      const dayMatch = DAY_SELECTOR.exec(fragment);

      if (dayMatch) {
        const days = expandDays(dayMatch[1]);
        const rest = dayMatch[2]?.trim();

        if (!rest) {
          pending.push(...days); // "Mo,Tu,We 09:00-17:00": days come first
          continue;
        }

        const allDays = [...pending, ...days];
        pending = [];

        if (OFF.test(rest)) {
          for (const day of allDays) partDays.set(day, []);
          lastDays = allDays;
          continue;
        }

        const range = parseTimeRange(rest);
        if (!range) return null;

        add(allDays, range);
        lastDays = allDays;
        continue;
      }

      const bareRange = parseTimeRange(fragment);

      if (bareRange) {
        add(lastDays ?? [0, 1, 2, 3, 4, 5, 6], bareRange);
        continue;
      }

      if (OFF.test(fragment)) {
        for (let day = 0; day < 7; day++) partDays.set(day, []);
        continue;
      }

      return null; // sunrise, months, week numbers, "open", ...
    }

    if (pending.length > 0) return null;

    // A new ";" rule replaces whatever those days had before.
    for (const [day, ranges] of partDays) schedule[day] = ranges;
  }

  if (schedule.every((ranges) => ranges.length === 0)) return null;

  for (const ranges of schedule) ranges.sort((a, b) => a[0] - b[0]);

  return schedule;
}

function getParsed(raw: string): Parsed | null {
  if (!parseCache.has(raw)) parseCache.set(raw, parse(raw));
  return parseCache.get(raw) ?? null;
}

/** Day of week (0 = Monday) and minutes after midnight in the given time zone. */
export function localTime(
  now: Date,
  timeZone = "America/New_York",
): { day: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: WEEKDAY_FROM_INTL[get("weekday")] ?? 0,
    minute: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

export function formatTime(minuteOfDay: number): string {
  const total = ((minuteOfDay % 1440) + 1440) % 1440;
  if (total === 0) return "midnight";

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return minutes === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Absolute minute (from today 00:00) when the current open period ends. */
function findClosing(schedule: Schedule, day: number, minute: number): number | null {
  let closeAt: number | null = null;

  for (const [start, end] of schedule[day]) {
    if (minute >= start && minute < end) closeAt = end;
  }

  if (closeAt === null) {
    // spill-over from yesterday's late-night hours
    for (const [, end] of schedule[(day + 6) % 7]) {
      if (end > 1440 && minute < end - 1440) closeAt = end - 1440;
    }
  }

  if (closeAt === null) return null;

  let end: number = closeAt;

  // Join periods that start exactly when this one ends.
  for (let i = 0; i < 14; i++) {
    const dayOffset = Math.floor(end / 1440);
    const minuteOfDay = end % 1440;
    const next = schedule[(day + dayOffset) % 7].find(
      ([start]) => start === minuteOfDay,
    );

    if (!next) break;
    end = dayOffset * 1440 + next[1];
  }

  return end;
}

function findNextOpening(
  schedule: Schedule,
  day: number,
  minute: number,
): string | null {
  for (let offset = 0; offset <= 7; offset++) {
    const weekday = (day + offset) % 7;
    const next = schedule[weekday].find(
      ([start]) => offset > 0 || start > minute,
    );

    if (!next) continue;

    const time = formatTime(next[0]);

    if (offset === 0) return `opens ${time}`;
    if (offset === 1) return `opens tomorrow ${time}`;
    return `opens ${DAY_NAMES[weekday]} ${time}`;
  }

  return null;
}

export function getOpenStatus(
  raw: string | null | undefined,
  now: Date = new Date(),
  timeZone = "America/New_York",
): OpenStatus | null {
  if (!raw) return null;

  const parsed = getParsed(raw);
  if (!parsed) return null;

  if (parsed === "always") {
    return { state: "open", headline: "Open", detail: "24 hours" };
  }

  const { day, minute } = localTime(now, timeZone);
  const closeAt = findClosing(parsed, day, minute);

  if (closeAt !== null) {
    const remaining = closeAt - minute;

    if (remaining >= 1440) {
      return { state: "open", headline: "Open", detail: "24 hours" };
    }

    if (remaining <= 60) {
      return {
        state: "closing-soon",
        headline: "Closing soon",
        detail: `closes ${formatTime(closeAt)}`,
      };
    }

    return {
      state: "open",
      headline: "Open",
      detail: `until ${formatTime(closeAt)}`,
    };
  }

  return {
    state: "closed",
    headline: "Closed",
    detail: findNextOpening(parsed, day, minute) ?? "",
  };
}

/**
 * Is the place open at this weekday and time? Returns null when the hours
 * can't be read, so callers can treat "unknown" differently from "closed".
 */
export function isOpenAt(
  raw: string | null | undefined,
  day: number,
  minute: number,
): boolean | null {
  if (!raw) return null;

  const parsed = getParsed(raw);
  if (!parsed) return null;
  if (parsed === "always") return true;

  if (parsed[day].some(([start, end]) => minute >= start && minute < end)) {
    return true;
  }

  // late-night hours that started yesterday
  return parsed[(day + 6) % 7].some(
    ([, end]) => end > 1440 && minute < end - 1440,
  );
}
