"use client";

import { useSyncExternalStore } from "react";

import { getOpenStatus } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

type OpenStatusProps = {
  openingHours: string | null | undefined;
  className?: string;
};

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

// Current time rounded to the minute. The server snapshot is null, so the
// server and the first client render both show nothing (no hydration mismatch)
// and the real status appears right after mount.
const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => null;

const dotColors = {
  open: "bg-emerald-500",
  "closing-soon": "bg-amber-500",
  closed: "bg-red-500/80",
} as const;

const headlineColors = {
  open: "text-emerald-700 dark:text-emerald-400",
  "closing-soon": "text-amber-700 dark:text-amber-400",
  closed: "text-muted-foreground",
} as const;

export function OpenStatus({ openingHours, className }: OpenStatusProps) {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!openingHours) return null;

  // Reserve one text line until the real time is known, so cards don't jump.
  if (minute === null) {
    return <div aria-hidden="true" className={cn("h-5", className)} />;
  }

  const status = getOpenStatus(openingHours, new Date(minute * 60_000));

  if (!status) return null;

  return (
    <p className={cn("flex items-center gap-2 text-sm", className)}>
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full", dotColors[status.state])}
      />
      <span className="truncate">
        <span className={cn("font-medium", headlineColors[status.state])}>
          {status.headline}
        </span>
        {status.detail && (
          <span className="text-muted-foreground"> · {status.detail}</span>
        )}
      </span>
    </p>
  );
}
