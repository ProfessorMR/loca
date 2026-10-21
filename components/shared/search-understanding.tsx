import { Sparkles } from "lucide-react";

import { getCategoryLabel } from "@/lib/category-labels";
import { formatMiles } from "@/lib/nyc-areas";
import { formatTag } from "@/lib/osm-tags";
import type { SearchIntent } from "@/types/search";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildChips(intent: SearchIntent): string[] {
  const chips: string[] = [];

  for (const category of intent.categories ?? []) {
    chips.push(getCategoryLabel(category));
  }

  for (const cuisine of intent.cuisines ?? []) {
    chips.push(formatTag(cuisine));
  }

  for (const term of intent.terms ?? []) {
    chips.push(capitalize(term));
  }

  for (const feature of intent.features ?? []) {
    chips.push(formatTag(feature));
  }

  if (intent.openAt) {
    chips.push(`Open ${intent.openAt.label}`);
  } else if (intent.openNow) {
    chips.push("Open now");
  }

  if (intent.near) {
    chips.push(
      `Near ${intent.near.label} · within ${formatMiles(intent.near.radiusKm)}`,
    );
  }

  return chips;
}

/**
 * Shows what the search understood: a one-line summary (when the AI wrote
 * one), the filters that were really applied, and anything the data can't
 * answer. Nothing here is claimed unless it was actually used.
 */
export function SearchUnderstanding({ intent }: { intent: SearchIntent }) {
  const chips = buildChips(intent);
  const unsupported = intent.unsupported ?? [];
  const isAi = intent.source === "ai";

  if (
    !intent.summary &&
    !intent.relaxed &&
    !intent.notice &&
    chips.length === 0 &&
    unsupported.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      {intent.notice && (
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          {intent.notice}
        </p>
      )}

      {intent.relaxed && (
        <p className="mb-3 rounded-xl bg-signal/30 px-3 py-2 text-sm leading-6">
          No exact match. {intent.relaxed}
        </p>
      )}

      {intent.summary && (
        <p className="flex items-start gap-3 text-base font-medium leading-7" dir="auto">
          {isAi && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-signal text-signal-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" />
            </span>
          )}

          <span>{intent.summary}</span>
        </p>
      )}

      {chips.length > 0 && (
        <div
          className={`flex flex-wrap items-center gap-2 ${
            intent.summary ? "mt-3" : ""
          }`}
        >
          <span className="mr-1 text-sm text-muted-foreground">
            {isAi ? "Applied:" : "Understood as:"}
          </span>

          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-secondary px-3 py-1 text-sm font-medium"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {(intent.features?.length ?? 0) > 0 && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Features come from OpenStreetMap volunteers, so a place that has one
          may not be listed here.
        </p>
      )}

      {unsupported.length > 0 && (
        <p
          className="mt-1 text-xs leading-5 text-muted-foreground"
          dir="auto"
        >
          Can&apos;t filter by {unsupported.join(", ")}, because there is no
          data on that yet.
        </p>
      )}
    </div>
  );
}
