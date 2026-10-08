"use client";

import { useRouter } from "next/navigation";

const suggestions = [
  "A quiet cafe for working",
  "A cheap restaurant for dinner",
  "A cozy place for a date",
  "A peaceful place outdoors",
];

export function SearchSuggestions() {
  const router = useRouter();

  function handleSuggestion(query: string) {
    const params = new URLSearchParams();
    params.set("q", query);

    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => handleSuggestion(suggestion)}
          className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
