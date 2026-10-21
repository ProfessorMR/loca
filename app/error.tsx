"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Navbar } from "@/components/shared/navbar";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p
          aria-hidden="true"
          className="display flex size-28 items-center justify-center rounded-full bg-closed text-5xl text-white"
        >
          !
        </p>

        <h1 className="display mt-8 text-4xl">Something went wrong</h1>

        <p className="mt-4 text-muted-foreground">
          It&apos;s not you. Please try again, and if it keeps happening come
          back in a little while.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border bg-card px-6 text-sm font-semibold transition-colors hover:border-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
