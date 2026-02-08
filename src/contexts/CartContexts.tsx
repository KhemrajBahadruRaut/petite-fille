"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

// Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  alt: string;
  quantity: number;
  addedAt: string;
  category?: "food" | "merchandise";
}

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  alt: string;
  category?: "food" | "merchandise";
}

interface CartState {
  items: CartItem[];
  favorites: FavoriteItem[];
  totalItems: number;
  totalPrice: number;
  foodItems: CartItem[];
  merchItems: CartItem[];
  foodTotal: number;
  merchTotal: number;
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: {
        item: Omit<CartItem, "quantity" | "addedAt">;
        quantity: number;
      };
    }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { id: string } }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR_FOOD_CART" }
  | { type: "CLEAR_MERCH_CART" }
  | { type: "ADD_TO_FAVORITES"; payload: { item: FavoriteItem } }
  | { type: "REMOVE_FROM_FAVORITES"; payload: { id: string } }
  | { type: "HYDRATE"; payload: { state: CartState } };

interface CartContextType extends CartState {
  addToCart: (
    item: Omit<CartItem, "quantity" | "addedAt">,
    quantity?: number,
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  clearFoodCart: () => void;
  clearMerchCart: () => void;
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial state
const initialState: CartState = {
  items: [],
  favorites: [],
  totalItems: 0,
  totalPrice: 0,
  foodItems: [],
  merchItems: [],
  foodTotal: 0,
  merchTotal: 0,
};

// Local storage keys
const CART_STORAGE_KEY = "restaurant_cart";
const FAVORITES_STORAGE_KEY = "restaurant_favorites";

// Helper functions for localStorage
const saveToLocalStorage = (key: string, data: CartItem[] | FavoriteItem[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // console.log(`✅ Saved to localStorage ${key}:`, data);
    } catch (error) {
      console.error("❌ Failed to save to localStorage:", error);
    }
  }
};

const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : null;
      // console.log(`✅ Loaded from localStorage ${key}:`, parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Failed to load from localStorage:", error);
      return null;
    }
  }
  return null;
};

// Calculate totals and separate items by category
const calculateTotalsAndCategories = (items: CartItem[]) => {
  const foodItems = items.filter((item) => item.category !== "merchandise");
  const merchItems = items.filter((item) => item.category === "merchandise");

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const foodTotal = foodItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const merchTotal = merchItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    totalItems,
    totalPrice,
    foodItems,
    merchItems,
    foodTotal,
    merchTotal,
  };
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log("🔄 Cart Action:", action.type, action);

  switch (action.type) {
    case "HYDRATE": {
      // console.log('💧 Hydrating cart state:', action.payload.state);
      return action.payload.state;
    }

    case "ADD_TO_CART": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.item.id,
      );
      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = state.items.map((item) =>
          item.id === action.payload.item.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item,
        );
      } else {
        const newItem: CartItem = {
          ...action.payload.item,
          quantity: action.payload.quantity,
          addedAt: new Date().toISOString(),
          category: action.payload.item.category || "food",
        };
        updatedItems = [...state.items, newItem];
      }

      const calculatedData = calculateTotalsAndCategories(updatedItems);
      const newState = {
        ...state,
        items: updatedItems,
        ...calculatedData,
      };

      saveToLocalStorage(CART_STORAGE_KEY, updatedItems);
      return newState;
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      const calculatedData = calculateTotalsAndCategories(updatedItems);
      const newState = {
        ...state,
        items: updatedItems,
        ...calculatedData,
      };

      saveToLocalStorage(CART_STORAGE_KEY, updatedItems);
      return newState;
    }

    case "REMOVE_FROM_CART": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload.id,
      );
      const calculatedData = calculateTotalsAndCategories(updatedItems);
      const newState = {
        ...state,
        items: updatedItems,
        ...calculatedData,
      };

      saveToLocalStorage(CART_STORAGE_KEY, updatedItems);
      return newState;
    }

    case "CLEAR_CART": {
      const newState = {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        foodItems: [],
        merchItems: [],
        foodTotal: 0,
        merchTotal: 0,
      };

      saveToLocalStorage(CART_STORAGE_KEY, []);
      return newState;
    }

    case "CLEAR_FOOD_CART": {
      const updatedItems = state.items.filter(
        (item) => item.category === "merchandise",
      );
      const calculatedData = calculateTotalsAndCategories(updatedItems);
      const newState = {
        ...state,
        items: updatedItems,
        ...calculatedData,
      };

      saveToLocalStorage(CART_STORAGE_KEY, updatedItems);
      return newState;
    }

    case "CLEAR_MERCH_CART": {
      const updatedItems = state.items.filter(
        (item) => item.category !== "merchandise",
      );
      const calculatedData = calculateTotalsAndCategories(updatedItems);
      const newState = {
        ...state,
        items: updatedItems,
        ...calculatedData,
      };

      saveToLocalStorage(CART_STORAGE_KEY, updatedItems);
      return newState;
    }

    case "ADD_TO_FAVORITES": {
      const existingFavorite = state.favorites.find(
        (fav) => fav.id === action.payload.item.id,
      );
      if (existingFavorite) return state;

      const updatedFavorites = [...state.favorites, action.payload.item];
      const newState = {
        ...state,
        favorites: updatedFavorites,
      };

      saveToLocalStorage(FAVORITES_STORAGE_KEY, updatedFavorites);
      return newState;
    }

    case "REMOVE_FROM_FAVORITES": {
      const updatedFavorites = state.favorites.filter(
        (fav) => fav.id !== action.payload.id,
      );
      const newState = {
        ...state,
        favorites: updatedFavorites,
      };

      saveToLocalStorage(FAVORITES_STORAGE_KEY, updatedFavorites);
      return newState;
    }

    default:
      return state;
  }
};

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after component mounts (client-side only)
  useEffect(() => {
    // console.log('🚀 CartProvider mounting...');

    const savedCart = loadFromLocalStorage(CART_STORAGE_KEY) || [];
    const savedFavorites = loadFromLocalStorage(FAVORITES_STORAGE_KEY) || [];

    // console.log('📦 Loaded data:', { savedCart, savedFavorites });

    const calculatedData = calculateTotalsAndCategories(savedCart);
    const hydratedState: CartState = {
      items: savedCart,
      favorites: savedFavorites,
      ...calculatedData,
    };

    // console.log('💧 Hydrating with state:', hydratedState);

    dispatch({ type: "HYDRATE", payload: { state: hydratedState } });
    setIsHydrated(true);
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log("🔍 Cart State Updated:", {
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
      foodItems: state.foodItems.length,
      merchItems: state.merchItems.length,
      foodTotal: state.foodTotal,
      merchTotal: state.merchTotal,
      isHydrated,
    });
  }, [state, isHydrated]);

  // Context methods
  // Context methods wrapped in useCallback
  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity" | "addedAt">, quantity: number = 1) => {
      dispatch({ type: "ADD_TO_CART", payload: { item, quantity } });
    },
    [],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const clearFoodCart = useCallback(() => {
    dispatch({ type: "CLEAR_FOOD_CART" });
  }, []);

  const clearMerchCart = useCallback(() => {
    dispatch({ type: "CLEAR_MERCH_CART" });
  }, []);

  const addToFavorites = useCallback((item: FavoriteItem) => {
    dispatch({ type: "ADD_TO_FAVORITES", payload: { item } });
  }, []);

  const removeFromFavorites = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: { id } });
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return state.favorites.some((fav) => fav.id === id);
    },
    [state.favorites],
  );

  const value: CartContextType = useMemo(
    () => ({
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      clearFoodCart,
      clearMerchCart,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      isHydrated,
    }),
    [
      state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      clearFoodCart,
      clearMerchCart,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      isHydrated,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Export types for use in other components
export type { CartContextType };
