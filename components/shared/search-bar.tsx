"use client";

import { FormEvent, useState, useTransition } from "react";
import { ArrowUpRight, LoaderCircle, Search } from "lucide-react";
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
      className="flex items-center gap-3 rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md"
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
        className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
      />

      <button
        type="submit"
        className="group flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-[1.03]"
        aria-label={isPending ? "Searching" : "Search"}
      >
        {isPending ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowUpRight
            className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </button>
    </form>
  );
}
