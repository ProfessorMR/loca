"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
};

export function SearchBar({
  initialQuery = "",
  placeholder = "What are you looking for?",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/explore");
      return;
    }

    router.push(`/explore?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
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
        aria-label="Search"
      >
        <ArrowUpRight
          className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
