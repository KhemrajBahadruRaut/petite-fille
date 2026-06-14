import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: qty } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "petite_cart_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ── Derived selectors ─────────────────────────────────────────────────────
export const useCartTotalItems = () =>
  useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0));

export const useCartTotalPrice = () =>
  useCartStore((state) =>
    state.items.reduce((s, i) => s + i.price * i.quantity, 0)
  );