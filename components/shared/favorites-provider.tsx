"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FavoritesContextValue = {
  favoritePlaceIds: string[];
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (placeId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

type FavoritesProviderProps = {
  children: ReactNode;
};

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>([]);

  function isFavorite(placeId: string) {
    return favoritePlaceIds.includes(placeId);
  }

  function toggleFavorite(placeId: string) {
    setFavoritePlaceIds((current) => {
      if (current.includes(placeId)) {
        return current.filter((id) => id !== placeId);
      }

      return [...current, placeId];
    });
  }

  const value = useMemo(
    () => ({
      favoritePlaceIds,
      isFavorite,
      toggleFavorite,
    }),
    [favoritePlaceIds],
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
