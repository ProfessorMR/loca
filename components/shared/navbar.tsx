import Link from "next/link";

import { LogoMark } from "@/components/shared/logo";
import { NavLinks } from "@/components/shared/nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          aria-label="LOCA, home"
          className="flex items-center gap-2.5"
        >
          <LogoMark className="size-8" />

          <span className="display text-lg">LOCA</span>
        </Link>

        <NavLinks />
      </div>
    </header>
  );
}
