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

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

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
  const isReady = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

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
    () => ({ favoritePlaceIds, isFavorite, toggleFavorite, isReady }),
    [favoritePlaceIds, isFavorite, toggleFavorite, isReady],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
