"use client";

import { FormEvent, useState, useTransition } from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useExploreNavigation } from "@/components/shared/explore-navigation";

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
};

export function SearchBar({
  initialQuery = "",
  placeholder = "What are you looking for?",
}: SearchBarProps) {
  const router = useRouter();

  // On the explore page the loading state is shared with the results. On the
  // home page there is no results area, so the bar keeps its own.
  const navigation = useExploreNavigation();
  const [isLocalPending, startLocalTransition] = useTransition();
  const isPending = navigation ? navigation.isPending : isLocalPending;

  const [query, setQuery] = useState(initialQuery);

  function go(url: string, label?: string) {
    if (navigation) {
      navigation.navigate(url, label);
      return;
    }

    startLocalTransition(() => {
      router.push(url);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      go("/explore");
      return;
    }

    const params = new URLSearchParams();

    params.set("q", trimmedQuery);

    go(`/explore?${params.toString()}`, "Understanding your search…");
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      role="search"
      className="flex items-center gap-2 rounded-2xl border bg-card p-1.5 shadow-[0_1px_0_rgba(19,32,58,0.04),0_14px_32px_-16px_rgba(19,32,58,0.25)] transition-colors focus-within:border-foreground"
    >
      <Search
        className="ml-3 size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Describe the place you want"
        className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />

      <button
        type="submit"
        className="group flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-signal px-4 text-sm font-bold text-signal-foreground transition-[filter] hover:brightness-95 sm:px-5"
        aria-label={isPending ? "Searching" : "Search"}
      >
        {isPending ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <span className="hidden sm:inline">Search</span>
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </form>
  );
}
