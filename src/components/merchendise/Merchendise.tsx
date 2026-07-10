"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Heart,
  PackageOpen,
  X,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContexts";
import {
  useCartStore,
  useCartTotalItems,
  type CartItem,
} from "@/stores/cartStore";
import { apiUrl, normalizeApiAssetUrl } from "../../utils/api";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
}

interface BackendProduct {
  id: number;
  name: string;
  price: string | number;
  description: string;
  image: string;
  image_url?: string;
  category: string;
}

interface MerchCategory {
  id: number;
  name: string;
}

interface CategorySection {
  categoryName: string;
  displayName: string;
  products: Product[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

const formatCategoryName = (categoryName: string): string =>
  categoryName
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const transformProduct = (item: BackendProduct): Product => {
  const parsedPrice =
    typeof item.price === "number" ? item.price : Number(item.price);
  const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const imagePath = item.image_url || `merch/uploads/${item.image || ""}`;

  return {
    id: `${item.category}-${item.id}`,
    title: item.name,
    description: item.description || "",
    price: safePrice,
    priceDisplay: `$${safePrice.toFixed(2)} AUD`,
    image: normalizeApiAssetUrl(imagePath),
    category: item.category,
  };
};

// ─── Added to Cart Toast ──────────────────────────────────────────────────────

function AddedToCartToast({
  product,
  onDismiss,
}: {
  product: Product;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3.5 text-white shadow-2xl"
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 32, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="h-9 w-9 rounded-md object-cover flex-shrink-0"
        />
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-gray-400" style={{ fontFamily: "arial" }}>
          Added to cart
        </span>
        <span
          className="text-sm font-medium max-w-[180px] truncate"
          style={{ fontFamily: "fairplay" }}
        >
          {product.title}
        </span>
      </div>
      <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 ml-1" />
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 text-gray-400 hover:text-white transition"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  cartItems,
  totalItems,
  onClose,
  onRemove,
  onUpdateQty,
}: {
  cartItems: CartItem[];
  totalItems: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      <motion.aside
        className="relative z-10 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2
            className="text-lg font-semibold text-gray-800"
            style={{ fontFamily: "fairplaybold" }}
          >
            Your Cart ({totalItems})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm" style={{ fontFamily: "arial" }}>
                Your cart is empty.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4">
                  {/* Image */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <PackageOpen className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="line-clamp-2 text-sm font-medium text-gray-800"
                        style={{ fontFamily: "fairplay" }}
                      >
                        {item.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.id, item.quantity + 1)
                          }
                          className="text-gray-500 hover:text-gray-800"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span
                        className="text-sm font-medium text-gray-600"
                        style={{ fontFamily: "arial" }}
                      >
                        ${(item.price * item.quantity).toFixed(2)} AUD
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center pb-5">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <ShoppingCart size={18} />
            <span>Buy in Store</span>
          </Link>
        </div>
      </motion.aside>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = React.memo(function ProductCard({
  product,
  onBuyNow,
  canPurchase,
  showStorePrompt,
}: {
  product: Product;
  onBuyNow: (product: Product) => void;
  canPurchase: boolean;
  showStorePrompt: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useCart();
  const isItemFavorite = isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isItemFavorite) {
      removeFromFavorites(product.id);
      return;
    }
    addToFavorites({
      id: product.id,
      name: product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      alt: product.title,
      category: "merchandise",
    });
  };

  return (
    <article className="group flex w-full flex-col items-center text-center">
      {/* ── Image ── */}
      <div className="relative aspect-square w-full overflow-hidden shadow-md sm:max-w-sm">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageError(true)}
            onClick={() => setIsPreviewOpen(true)}
          />
        ) : (
          <div className="w-full h-full border border-blue-500 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {product.title}
              </p>
            </div>
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-md backdrop-blur-sm opacity-100 transition-all duration-300 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
          aria-label={
            isItemFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isItemFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Hover overlay: View Image + Add to Cart */}
        {!imageError && product.image && (
          <div className="absolute inset-0 hidden flex-col items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800"
            >
              View Image
            </button>
            {canPurchase && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-amber-600 active:scale-95"
                style={{ fontFamily: "arial" }}
              >
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="mt-4 space-y-2 w-full">
        <h3
          className="line-clamp-2 text-base font-medium text-gray-800 transition-colors duration-200 group-hover:text-amber-600 sm:text-lg"
          style={{ fontFamily: "fairplay" }}
        >
          {product.title}
        </h3>
        <p
          className="line-clamp-2 text-sm text-gray-700"
          style={{ fontFamily: "arial" }}
        >
          {product.description}
        </p>
        <span
          className="text-base font-medium text-gray-500 pr-5"
          style={{ fontFamily: "arial" }}
        >
          {product.priceDisplay}
        </span>
        {showStorePrompt && (
          <Link
            href="/contacts"
            className="mx-auto mt-2 inline-flex rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            style={{ fontFamily: "arial" }}
          >
            Go to store
          </Link>
        )}
      </div>

      {/* ── Image Preview Modal ── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800"
            onClick={() => setIsPreviewOpen(false)}
            aria-label="Close image preview"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
});

// ─── Product Grid 

function ProductGrid({
  items,
  onBuyNow,
  canPurchase,
  showStorePrompt,
}: {
  items: Product[];
  onBuyNow: (product: Product) => void;
  canPurchase: boolean;
  showStorePrompt: boolean;
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onBuyNow={onBuyNow}
          canPurchase={canPurchase}
          showStorePrompt={showStorePrompt}
        />
      ))}
    </div>
  );
}

// ─── Main Page 

export default function Merchendise() {
  const [categorySections, setCategorySections] = useState<CategorySection[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [onlinePurchaseEnabled, setOnlinePurchaseEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Cart state (Zustand, persisted to localStorage)
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalItems = useCartTotalItems();

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastProduct, setToastProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const response = await fetch(apiUrl("merch/get_settings.php"), {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch merch settings");
        }

        if (isMounted) {
          setOnlinePurchaseEnabled(
            data.settings?.online_purchase_enabled !== false,
          );
        }
      } catch {
        if (isMounted) {
          setOnlinePurchaseEnabled(true);
        }
      } finally {
        if (isMounted) {
          setSettingsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Fetch products 
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(apiUrl("merch/categories/get_categories.php"), {
            signal: controller.signal,
          }),
          fetch(apiUrl("merch/get_merch_items.php"), {
            signal: controller.signal,
          }),
        ]);

        if (!categoriesResponse.ok)
          throw new Error("Failed to fetch categories");
        if (!productsResponse.ok) throw new Error("Failed to fetch products");

        const categories: MerchCategory[] = await categoriesResponse.json();
        const products: BackendProduct[] = await productsResponse.json();

        const groupedProducts = new Map<string, Product[]>();
        for (const item of products) {
          const key = normalizeCategoryKey(item.category);
          const transformed = transformProduct(item);
          const existing = groupedProducts.get(key);
          if (existing) existing.push(transformed);
          else groupedProducts.set(key, [transformed]);
        }

        const sections: CategorySection[] = categories
          .map((category) => ({
            categoryName: category.name,
            displayName: formatCategoryName(category.name),
            products:
              groupedProducts.get(normalizeCategoryKey(category.name)) || [],
          }))
          .filter((section) => section.products.length > 0);

        if (isMounted) setCategorySections(sections);
      } catch (error) {
        if ((error as Error).name !== "AbortError")
          console.error("Error fetching merch data:", error);
        if (isMounted) setCategorySections([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // ── Buy Now / Add to Cart handler 
  const canPurchase = !settingsLoading && onlinePurchaseEnabled;
  const showStorePrompt = !settingsLoading && !onlinePurchaseEnabled;

  useEffect(() => {
    if (!canPurchase) {
      setIsCartOpen(false);
    }
  }, [canPurchase]);

  const handleBuyNow = useCallback(
    (product: Product) => {
      if (!canPurchase) return;
      addToCart(product);
      // Show toast, auto-dismiss after 3 s
      setToastProduct(product);
      const timer = setTimeout(() => setToastProduct(null), 3000);
      return () => clearTimeout(timer);
    },
    [addToCart, canPurchase],
  );

  return (
    <div className="bg-white pt-25">
      <h1 className="sr-only">Merchandise | Petite Fille Cafe Rosanna</h1>
      {/* ── Floating Cart Button ── */}
      {canPurchase && totalItems > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
          style={{ fontFamily: "arial" }}
          aria-label={`Open cart, ${totalItems} items`}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems}
        </button>
      )}

      {/* ── Hero Section (unchanged) ── */}
      <section className="container mx-auto flex w-full flex-col items-center justify-between gap-8 bg-white px-4 py-10 sm:px-6 sm:py-12 md:flex-row lg:px-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1 text-center md:text-left"
        >
          <motion.h2
            className="mb-4 text-3xl font-semibold text-gray-800 sm:text-4xl md:text-5xl"
            style={{ fontFamily: "fairplaybold" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Petite fille Merch
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6 max-w-md"
            style={{ fontFamily: "arial" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </motion.p>
          <motion.div
            className="flex justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-400 px-6 py-3 text-gray-700 transition hover:bg-gray-100 sm:w-auto"
              style={{ fontFamily: "arial" }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => {
                const firstSection = document.querySelector(
                  "section[data-category-section]",
                );
                firstSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Take a look at our merch {"->"}
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden md:flex flex-1 relative w-full max-w-lg h-125"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="absolute top-14 left-14 w-40 h-48 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute bottom-28 right-14 w-40 h-48 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute bottom-20 left-5 w-32 h-24 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute top-0 right-12 w-28 h-24 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-48"
            initial={{ opacity: 0, y: -20, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: -2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/merch1.webp"
              alt="T-Shirts"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>
          <motion.div
            className="absolute top-28 left-0 w-40 h-48"
            initial={{ opacity: 0, x: -20, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: 2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/coffee.webp"
              alt="Coffee Bag"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>
          <motion.div
            className="absolute top-61 left-1/2 -translate-x-1/2 w-40 h-48"
            initial={{ opacity: 0, y: 20, rotate: 5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: -2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/bag1.webp"
              alt="Tote Bag"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>
          <motion.div
            className="absolute top-18 right-0 w-40 h-48"
            initial={{ opacity: 0, x: 20, rotate: -5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: 2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/cup2.webp"
              alt="Mugs"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="w-full py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-amber-500" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* ── Category sections ── */}
      {!isLoading &&
        categorySections.map((section) => (
          <section
            key={section.categoryName}
            data-category-section
            className="w-full bg-white px-4 py-6 sm:px-6 md:px-12 lg:px-20"
          >
            <h2
              className="mb-8 text-center text-2xl font-semibold text-gray-700 md:text-3xl"
              style={{ fontFamily: "fairplaybold" }}
            >
              {section.displayName}
            </h2>
            <ProductGrid
              items={section.products}
              onBuyNow={handleBuyNow}
              canPurchase={canPurchase}
              showStorePrompt={showStorePrompt}
            />
          </section>
        ))}

      {/* ── Empty state ── */}
      {!isLoading && categorySections.length === 0 && (
        <div className="w-full py-20 bg-gray-50">
          <div className="max-w-md mx-auto text-center px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <PackageOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3
              className="text-2xl font-semibold text-gray-800 mb-3"
              style={{ fontFamily: "fairplaybold" }}
            >
              No Products Available
            </h3>
            <p className="text-gray-500 text-lg mb-2">
              We&apos;re currently updating our merchandise collection.
            </p>
            <p className="text-gray-400 text-sm">
              Please check back later for exciting new products!
            </p>
          </div>
        </div>
      )}

      {/* ── Added to Cart Toast ── */}
      <AnimatePresence>
        {toastProduct && (
          <AddedToCartToast
            product={toastProduct}
            onDismiss={() => setToastProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {canPurchase && isCartOpen && (
          <CartDrawer
            cartItems={cartItems}
            totalItems={totalItems}
            onClose={() => setIsCartOpen(false)}
            onRemove={removeFromCart}
            onUpdateQty={updateQuantity}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
