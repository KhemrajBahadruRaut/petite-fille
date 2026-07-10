"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  PackageOpen,
  AlertCircle,
  X,
  Loader2,
  Truck,
  Store,
  ArrowLeft,
} from "lucide-react";
import { useCartStore, useCartTotalItems, useCartTotalPrice } from "@/stores/cartStore";
import { useCartHydrated } from "@/stores/useCartHydrated";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { apiUrl } from "../../utils/api";

type FulfillmentMethod = "delivery" | "pickup";

export default function CartPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useUserAuth();

  const cartItems = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalItems = useCartTotalItems();
  const totalPrice = useCartTotalPrice();
  const isHydrated = useCartHydrated();

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [onlinePurchaseEnabled, setOnlinePurchaseEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMerchSettings = async () => {
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

    fetchMerchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Redirect to Stripe Checkout
  // fulfillmentMethod is now included in the dependency array so pickup works correctly
  const redirectToStripe = useCallback(async (authToken: string, method: FulfillmentMethod) => {
    if (cartItems.length === 0) return;
    setIsRedirecting(true);
    setOrderError("");

    try {
      const res = await fetch(apiUrl("orders/create_checkout_session.php"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_id:   item.id,
            product_name: item.title,
            category:     item.category,
            image:        item.image,
            quantity:     item.quantity,
            unit_price:   item.price,
          })),
          fulfillment_method: method,   
          success_url: `${window.location.origin}/merchandise/success`,
          cancel_url:  `${window.location.origin}/cart`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setIsRedirecting(false);
          router.push(`/auth/login?next=${encodeURIComponent("/cart")}`);
          return;
        }
        setOrderError(data.message || "Could not start checkout. Please try again.");
        setIsRedirecting(false);
        return;
      }

      if (!data.checkout_url) {
        setOrderError("No checkout URL returned. Please try again.");
        setIsRedirecting(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setOrderError("Network error. Please check your connection.");
      setIsRedirecting(false);
    }
  }, [cartItems, router]);   // fulfillmentMethod removed from deps — passed as argument instead

  // ── Checkout button handler ───────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (authLoading) return;
    if (!onlinePurchaseEnabled) {
      setOrderError("Online merchandise purchases are currently disabled. Please visit us in store.");
      return;
    }

    if (!isAuthenticated || !token) {
      router.push(`/auth/login?next=${encodeURIComponent("/cart")}`);
      return;
    }

    redirectToStripe(token, fulfillmentMethod);   // ← pass current value directly
  }, [authLoading, isAuthenticated, token, fulfillmentMethod, onlinePurchaseEnabled, redirectToStripe, router]);

  // ─────────────────────────────────────────────────────────────────────────

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white pt-25">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 pb-20 pt-25 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/merchandise"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            style={{ fontFamily: "arial" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800 md:text-3xl" style={{ fontFamily: "fairplaybold" }}>
            Your Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800" style={{ fontFamily: "fairplaybold" }}>
              Your cart is empty
            </h2>
            <p className="mb-6 text-sm text-gray-500" style={{ fontFamily: "arial" }}>
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/merchandise"
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
              style={{ fontFamily: "arial" }}
            >
              Browse Merch
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            {/* ── Items list ── */}
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  {/* Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <PackageOpen className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-medium text-gray-800" style={{ fontFamily: "fairplay" }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: "arial" }}>
                          {item.priceDisplay}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-800"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "arial" }}>
                        ${(item.price * item.quantity).toFixed(2)} AUD
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Summary ── */}
            <div className="h-fit space-y-5 rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "fairplaybold" }}>
                Order Summary
              </h2>

              {/* Fulfillment method */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500" style={{ fontFamily: "arial" }}>
                  How would you like your order?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("delivery")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                      fulfillmentMethod === "delivery"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    style={{ fontFamily: "arial" }}
                  >
                    <Truck className="h-4 w-4" />
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("pickup")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                      fulfillmentMethod === "pickup"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    style={{ fontFamily: "arial" }}
                  >
                    <Store className="h-4 w-4" />
                    Pickup
                  </button>
                </div>

                {/* Fulfillment hint */}
                <p className="mt-2 text-xs text-gray-400" style={{ fontFamily: "arial" }}>
                  {fulfillmentMethod === "pickup"
                    ? "📍 You'll collect your order in-store. No shipping fee."
                    : "🚚 We'll ship your order to your address."}
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600" style={{ fontFamily: "arial" }}>
                  <span>Items ({totalItems})</span>
                  <span>${totalPrice.toFixed(2)} AUD</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold text-gray-800" style={{ fontFamily: "fairplaybold" }}>
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)} AUD</span>
                </div>
              </div>

              {!settingsLoading && !onlinePurchaseEnabled ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                  <Store className="mx-auto mb-2 h-5 w-5 text-amber-700" />
                  <p className="text-sm font-medium text-amber-900" style={{ fontFamily: "arial" }}>
                    Merchandise checkout is available in store.
                  </p>
                  <Link
                    href="/contacts"
                    className="mt-3 inline-flex rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    style={{ fontFamily: "arial" }}
                  >
                    Go to store
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={settingsLoading || isRedirecting || authLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                  style={{ fontFamily: "arial" }}
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    `Checkout via ${fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Order error banner ── */}
        <AnimatePresence>
          {orderError && (
            <motion.div
              className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-white shadow-2xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm" style={{ fontFamily: "arial" }}>{orderError}</p>
              <button type="button" onClick={() => setOrderError("")}>
                <X className="h-4 w-4 opacity-70 hover:opacity-100" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
