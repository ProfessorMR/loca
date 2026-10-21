"use client";

import { useRouter } from "next/navigation";

import { useExploreNavigation } from "@/components/shared/explore-navigation";

type SearchSuggestionsProps = {
  suggestions: string[];
};

export function SearchSuggestions({ suggestions }: SearchSuggestionsProps) {
  const router = useRouter();
  const navigation = useExploreNavigation();

  function handleSuggestion(query: string) {
    const params = new URLSearchParams();
    params.set("q", query);

    const url = `/explore?${params.toString()}`;

    // Same loading state as typing a search.
    if (navigation) {
      navigation.navigate(url, "Understanding your search…");
    } else {
      router.push(url);
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">Try</span>

      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => handleSuggestion(suggestion)}
          className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
