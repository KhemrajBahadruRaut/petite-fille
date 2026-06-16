"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShoppingBag, Home } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

type OrderStatus = "loading" | "success" | "error";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<OrderStatus>("loading");
  const [orderInfo, setOrderInfo] = useState<{
    orderNumber?: string;
    email?: string;
    fulfillmentMethod?: string;
  }>({});

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Clear cart immediately on success landing
    clearCart();

    // Optionally verify the session with your backend
    // If you don't have a verify endpoint yet, just mark success
    const verifySession = async () => {
      try {
        // If you have a verify endpoint, uncomment and adjust:
        // const res = await fetch(apiUrl(`orders/verify_session.php?session_id=${sessionId}`));
        // const data = await res.json();
        // if (data.success) {
        //   setOrderInfo({ orderNumber: data.order_number, email: data.email, fulfillmentMethod: data.fulfillment_method });
        // }

        // For now, just show success with the session ID
        setOrderInfo({ orderNumber: sessionId.slice(-8).toUpperCase() });
        setStatus("success");
      } catch {
        // Even if verify fails, session_id presence means Stripe succeeded
        setStatus("success");
      }
    };

    verifySession();
  }, [sessionId, clearCart]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white pt-25">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-sm text-gray-500" style={{ fontFamily: "arial" }}>
            Confirming your order…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 pt-25">
        <div className="max-w-md text-center">
          <p className="mb-4 text-gray-600" style={{ fontFamily: "arial" }}>
            We couldn&apos;t confirm your order. If payment was taken, please
            contact us and we&apos;ll sort it out right away.
          </p>
          <Link
            href="/cart"
            className="inline-block rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            style={{ fontFamily: "arial" }}
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 pb-20 pt-25">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 p-10 shadow-sm text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <CheckCircle2 className="h-10 w-10 text-amber-500" />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="mb-2 text-2xl font-semibold text-gray-800 md:text-3xl"
          style={{ fontFamily: "fairplaybold" }}
        >
          Order Confirmed!
        </h1>
        <p className="mb-6 text-sm text-gray-500" style={{ fontFamily: "arial" }}>
          Thanks for your purchase. You&apos;ll receive a confirmation email shortly.
        </p>

        {/* Order details */}
        {orderInfo.orderNumber && (
          <div className="mb-6 rounded-lg bg-gray-50 px-5 py-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500" style={{ fontFamily: "arial" }}>
                Order ref
              </span>
              <span className="font-medium text-gray-800" style={{ fontFamily: "arial" }}>
                #{orderInfo.orderNumber}
              </span>
            </div>
            {orderInfo.fulfillmentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500" style={{ fontFamily: "arial" }}>
                  Fulfillment
                </span>
                <span
                  className="font-medium capitalize text-gray-800"
                  style={{ fontFamily: "arial" }}
                >
                  {orderInfo.fulfillmentMethod}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/merchandise"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
            style={{ fontFamily: "arial" }}
          >
            <ShoppingBag className="h-4 w-4" />
            Shop More
          </Link>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
            style={{ fontFamily: "arial" }}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}