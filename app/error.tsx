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

      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-medium text-emerald-600">Something broke</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We couldn&apos;t load this page
        </h1>

        <p className="mt-3 text-muted-foreground">
          It&apos;s not you. Please try again, and if it keeps happening come
          back in a little while.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
          >
            Try again
          </button>

          <Link
            href="/"
            className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
