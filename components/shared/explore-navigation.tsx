"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type ExploreNavigation = {
  /** True from the click until the new results have arrived. */
  isPending: boolean;
  /** What is being waited for, e.g. "Understanding your search…" */
  pendingLabel: string;
  navigate: (url: string, label?: string) => void;
};

const DEFAULT_LABEL = "Updating places…";

const ExploreNavigationContext = createContext<ExploreNavigation | null>(null);

/**
 * One loading state for everything that changes the results: the search bar,
 * the category buttons, "Open now" and the page buttons. Before, only the
 * results component had one, so searching showed nothing while it waited.
 *
 * Takes `push` as a prop so it can be tested without Next's router.
 */
export function NavigationState({
  push,
  children,
}: {
  push: (url: string) => void;
  children: ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingLabel, setPendingLabel] = useState(DEFAULT_LABEL);

  const navigate = useCallback(
    (url: string, label: string = DEFAULT_LABEL) => {
      setPendingLabel(label);

      startTransition(() => {
        push(url);
      });
    },
    [push],
  );

  const value = useMemo(
    () => ({ isPending, pendingLabel, navigate }),
    [isPending, pendingLabel, navigate],
  );

  return (
    <ExploreNavigationContext.Provider value={value}>
      {children}
    </ExploreNavigationContext.Provider>
  );
}

export function ExploreNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const push = useCallback((url: string) => router.push(url), [router]);

  return <NavigationState push={push}>{children}</NavigationState>;
}

/** Null when used outside the provider (like the search bar on the home page). */
export function useExploreNavigation() {
  return useContext(ExploreNavigationContext);
}

/** Dims what is on the page while new results are loading. */
export function PendingFade({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const isPending = useExploreNavigation()?.isPending ?? false;

  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity duration-200 ${
        isPending ? "opacity-50" : "opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
