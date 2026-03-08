"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  ReactNode,
} from "react";

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  alt: string;
  category?: "food" | "merchandise";
}

interface FavoritesState {
  favorites: FavoriteItem[];
}

type FavoritesAction =
  | { type: "HYDRATE"; payload: FavoriteItem[] }
  | { type: "ADD_TO_FAVORITES"; payload: FavoriteItem }
  | { type: "REMOVE_FROM_FAVORITES"; payload: string };

export interface CartContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isHydrated: boolean;
}

const FAVORITES_STORAGE_KEY = "restaurant_favorites";

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: FavoritesState = {
  favorites: [],
};

const saveFavorites = (favorites: FavoriteItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
};

const loadFavorites = (): FavoriteItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
};

const favoritesReducer = (
  state: FavoritesState,
  action: FavoritesAction,
): FavoritesState => {
  switch (action.type) {
    case "HYDRATE":
      return { favorites: action.payload };
    case "ADD_TO_FAVORITES": {
      if (state.favorites.some((item) => item.id === action.payload.id)) {
        return state;
      }
      const updated = [...state.favorites, action.payload];
      saveFavorites(updated);
      return { favorites: updated };
    }
    case "REMOVE_FROM_FAVORITES": {
      const updated = state.favorites.filter((item) => item.id !== action.payload);
      saveFavorites(updated);
      return { favorites: updated };
    }
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", payload: loadFavorites() });
    setIsHydrated(true);
  }, []);

  const addToFavorites = useCallback((item: FavoriteItem) => {
    dispatch({ type: "ADD_TO_FAVORITES", payload: item });
  }, []);

  const removeFromFavorites = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: id });
  }, []);

  const isFavorite = useCallback(
    (id: string) => state.favorites.some((item) => item.id === id),
    [state.favorites],
  );

  const value = useMemo<CartContextType>(
    () => ({
      favorites: state.favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      isHydrated,
    }),
    [addToFavorites, isFavorite, isHydrated, removeFromFavorites, state.favorites],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
