import Link from "next/link";

import { Navbar } from "@/components/shared/navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p
          aria-hidden="true"
          className="display flex size-28 items-center justify-center rounded-full bg-foreground text-4xl text-signal"
        >
          404
        </p>

        <h1 className="display mt-8 text-4xl">Nothing at this address</h1>

        <p className="mt-4 text-muted-foreground">
          The place or page you&apos;re looking for doesn&apos;t exist or was
          moved.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/explore"
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Explore places
          </Link>

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
