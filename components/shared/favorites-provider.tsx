"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  FAVORITES_KEY,
  parseFavorites,
  toggleFavoriteId,
} from "@/lib/favorites-store";

type FavoritesContextValue = {
  favoritePlaceIds: string[];
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (placeId: string) => void;
  /** False until the saved list has been read from this browser */
  isReady: boolean;
};

type StoredFavorites = Omit<FavoritesContextValue, "isReady">;

const FavoritesContext = createContext<StoredFavorites | null>(null);

const CHANGE_EVENT = "loca:favorites-changed";

// Only used when the browser blocks localStorage (private mode): the list then
// lasts until the tab is closed instead of failing.
let memory: string | null = null;

function readRaw(): string {
  if (memory !== null) return memory;

  try {
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeRaw(raw: string) {
  memory = raw;

  try {
    window.localStorage.setItem(FAVORITES_KEY, raw);
  } catch {
    // storage is blocked or full: keep the list in memory for this visit
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // Another tab changed the list.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FAVORITES_KEY) {
      memory = null;
      onChange();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const getServerSnapshot = () => "[]";

const subscribeNothing = () => () => {};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot);

  const favoritePlaceIds = useMemo(() => parseFavorites(raw), [raw]);

  const isFavorite = useCallback(
    (placeId: string) => favoritePlaceIds.includes(placeId),
    [favoritePlaceIds],
  );

  const toggleFavorite = useCallback((placeId: string) => {
    const current = parseFavorites(readRaw());

    writeRaw(JSON.stringify(toggleFavoriteId(current, placeId)));
  }, []);

  const value = useMemo(
    () => ({ favoritePlaceIds, isFavorite, toggleFavorite }),
    [favoritePlaceIds, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * The saved places of this visitor.
 *
 * Every component that calls this shows "nothing saved" while IT is being
 * hydrated, and the real list right after. That matters because the cards sit
 * inside a Suspense boundary that is streamed in and hydrated later than the
 * provider: if they read the real list straight away, the server HTML ("not
 * saved") would not match the first browser render ("saved") and React would
 * report a hydration mismatch.
 */
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  // false while this component is hydrating, true from then on
  const isReady = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  return useMemo(
    () =>
      isReady
        ? { ...context, isReady: true }
        : {
            favoritePlaceIds: [],
            isFavorite: () => false,
            toggleFavorite: context.toggleFavorite,
            isReady: false,
          },
    [context, isReady],
  );
}
