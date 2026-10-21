"use client";

import { getOpenStatus } from "@/lib/opening-hours";
import { useMinute } from "@/lib/use-minute";
import { cn } from "@/lib/utils";

type OpenStatusProps = {
  openingHours: string | null | undefined;
  className?: string;
};

const dotColors = {
  open: "bg-open",
  "closing-soon": "bg-soon",
  closed: "bg-closed",
} as const;

const headlineColors = {
  open: "text-open",
  "closing-soon": "text-soon",
  closed: "text-foreground",
} as const;

export function OpenStatus({ openingHours, className }: OpenStatusProps) {
  const minute = useMinute();

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
