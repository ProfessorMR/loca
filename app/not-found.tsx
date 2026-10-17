import Link from "next/link";

import { Navbar } from "@/components/shared/navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-medium text-emerald-600">404</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>

        <p className="mt-3 text-muted-foreground">
          The place or page you&apos;re looking for doesn&apos;t exist or was
          moved.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
          >
            Explore places
          </Link>

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
