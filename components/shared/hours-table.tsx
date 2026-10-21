"use client";

import { OpenStatus } from "@/components/shared/open-status";
import { getWeeklyHours, localTime } from "@/lib/opening-hours";
import { useMinute } from "@/lib/use-minute";

/** The opening hours of the week, with today highlighted. */
export function HoursTable({ openingHours }: { openingHours: string }) {
  const weekly = getWeeklyHours(openingHours);
  const minute = useMinute();

  // Today in New York, known only once the page is in the browser.
  const today = minute === null ? null : localTime(new Date(minute * 60_000)).day;

  if (!weekly) {
    // Hours written in a way we can't read: show them exactly as listed.
    return (
      <p className="break-words rounded-xl bg-secondary px-4 py-3 font-mono text-sm leading-6">
        {openingHours}
      </p>
    );
  }

  return (
    <div>
      <OpenStatus openingHours={openingHours} className="mb-4 text-base" />

      <ul className="divide-y rounded-xl border">
        {weekly.days.map((day, index) => {
          const isToday = today === index;

          return (
            <li
              key={day.name}
              aria-current={isToday ? "date" : undefined}
              className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                isToday ? "bg-secondary font-semibold" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {isToday && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-foreground"
                  />
                )}
                {day.name}
              </span>

              <span
                className={`tabular text-right ${
                  day.text === "Closed" ? "text-muted-foreground" : ""
                }`}
              >
                {day.text}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">New York time.</p>
    </div>
  );
}
