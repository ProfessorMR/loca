"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFavorites } from "@/components/shared/favorites-provider";

const links = [
  { label: "Explore", href: "/explore" },
  { label: "Saved", href: "/saved" },
];

export function NavLinks() {
  const pathname = usePathname();
  const { favoritePlaceIds } = useFavorites();

  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const count = link.href === "/saved" ? favoritePlaceIds.length : 0;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {link.label}

            {count > 0 && (
              <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-xs font-bold text-signal-foreground">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
