"use client";

import { useRouter } from "next/navigation";

type SearchSuggestionsProps = {
  suggestions: string[];
};

export function SearchSuggestions({ suggestions }: SearchSuggestionsProps) {
  const router = useRouter();

  function handleSuggestion(query: string) {
    const params = new URLSearchParams();
    params.set("q", query);

    router.push(`/explore?${params.toString()}`);
  }

  if (suggestions.length === 0) return null;

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
