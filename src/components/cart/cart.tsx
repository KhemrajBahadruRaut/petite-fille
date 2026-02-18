// pages/cart.tsx (or app/cart/page.tsx if using App Router)
"use client";

import React, { useState } from "react";
// import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContexts";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CartPage: React.FC = () => {
  const {
    items,
    totalItems,
    totalPrice,
    foodItems,
    merchItems,
    foodTotal,
    merchTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearFoodCart,
    clearMerchCart,
    isHydrated,
  } = useCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<"all" | "food" | "merch">("all");
  const [foodSectionOpen, setFoodSectionOpen] = useState(true);
  const [merchSectionOpen, setMerchSectionOpen] = useState(true);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const incrementQuantity = (id: string, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const decrementQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleClearCart = (type: "all" | "food" | "merch") => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    switch (clearType) {
      case "all":
        clearCart();
        break;
      case "food":
        clearFoodCart();
        break;
      case "merch":
        clearMerchCart();
        break;
    }
    setShowClearConfirm(false);
  };

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-linear-to-b from-amber-50 to-stone-100 py-12"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full"
              ></motion.div>
              <p className="text-gray-600">Loading your cart...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-linear-to-b from-amber-50 to-stone-100 py-12"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              href="/menu"
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-light text-gray-800">Your Cart</h1>
          </motion.div>

          {/* Empty cart state */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold text-gray-800 mb-3"
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-8 max-w-md mx-auto"
            >
              Looks like you haven&apos;t added any delicious items to your cart
              yet. Browse our menu and discover amazing dishes!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                Browse Menu
              </Link>
              <Link
                href="/merchandise"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-medium transition-colors"
              >
                Browse Merchandise
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Define CartItemComponent with proper TypeScript typing
  const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* Item Image */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200"
        >
          <img
            src={
              item.image.startsWith("http")
                ? item.image
                : `https://api.gr8.com.np/petite-backend/${item.image}`
            }
            alt={item.alt || item.name}
            className="object-cover"
            sizes="96px"
          />
        </motion.div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {item.name}
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {item.category === "merchandise" ? "Merchandise" : "Food"}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRemoveItem(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Date added */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
            <Calendar className="w-3 h-3" />
            Added {formatDate(new Date(item.addedAt))}
          </div>

          {/* Quantity and Price Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 text-black rounded-full px-3 py-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => decrementQuantity(item.id, item.quantity)}
                  disabled={item.quantity <= 1}
                  className="w-6 h-6 rounded-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </motion.button>
                <motion.span
                  key={item.quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-medium text-sm min-w-5 text-center"
                >
                  {item.quantity}
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => incrementQuantity(item.id, item.quantity)}
                  className="w-6 h-6 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </motion.button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">${item.price} each</div>
              <motion.div
                key={item.price * item.quantity}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-semibold text-lg text-gray-800"
              >
                ${(item.price * item.quantity).toFixed(2)}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-b from-amber-50 to-stone-100 py-12"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/menu"
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1
                className="text-3xl font-light text-gray-800"
                style={{ fontFamily: "fairplaybold" }}
              >
                Your Cart
              </h1>
              <motion.p
                key={totalItems}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-gray-600"
              >
                {totalItems} {totalItems === 1 ? "item" : "items"} • $
                {totalPrice.toFixed(2)}
              </motion.p>
            </div>
          </div>

          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClearCart("all")}
              className="text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Clear All
            </motion.button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Food Items Section */}
            {foodItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <motion.div
                  whileHover={{ backgroundColor: "#FEF3C7" }}
                  className="flex items-center justify-between p-6 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => setFoodSectionOpen(!foodSectionOpen)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="currentColor"
                          d="M1.338 1.961C1.495 1.362 2.041 1 2.615 1c.354 0 .676.133.921.35a1.5 1.5 0 0 1 1.928 0A1.38 1.38 0 0 1 6.385 1c.574 0 1.12.362 1.277.961C7.812 2.533 8 3.455 8 4.5a3.5 3.5 0 0 1-1.595 2.936c-.271.177-.405.405-.405.6v.396q0 .034.004.066c.034.248.157 1.169.272 2.124c.113.937.224 1.959.224 2.378a2 2 0 1 1-4 0c0-.42.111-1.44.224-2.378c.115-.955.238-1.876.272-2.124L3 8.432v-.396c0-.195-.134-.423-.405-.6A3.5 3.5 0 0 1 1 4.5c0-1.045.188-1.967.338-2.539M6 5a.5.5 0 0 1-1 0V2.5a.5.5 0 0 0-1 0V5a.5.5 0 0 1-1 0V2.385A.385.385 0 0 0 2.615 2c-.166 0-.28.099-.31.215A9.2 9.2 0 0 0 2 4.5a2.5 2.5 0 0 0 1.14 2.098c.439.285.86.786.86 1.438v.396q0 .1-.013.2c-.034.246-.156 1.161-.27 2.11c-.116.965-.217 1.914-.217 2.258a1 1 0 1 0 2 0c0-.344-.1-1.293-.217-2.259c-.114-.948-.236-1.863-.27-2.11A2 2 0 0 1 5 8.433v-.396c0-.652.421-1.153.86-1.438A2.5 2.5 0 0 0 7 4.5c0-.932-.168-1.764-.305-2.285C6.665 2.1 6.55 2 6.385 2A.385.385 0 0 0 6 2.385zm3 .5A4.5 4.5 0 0 1 13.5 1a.5.5 0 0 1 .5.5v5.973l.019.177a261 261 0 0 1 .229 2.24c.123 1.256.252 2.664.252 3.11a2 2 0 1 1-4 0c0-.446.129-1.854.252-3.11c.063-.637.126-1.247.173-1.699l.02-.191H10a1 1 0 0 1-1-1zm2.997 2.053l-.021.202a386 386 0 0 0-.228 2.233c-.127 1.287-.248 2.63-.248 3.012a1 1 0 1 0 2 0c0-.383-.121-1.725-.248-3.012a315 315 0 0 0-.228-2.233l-.021-.201L13 7.5V2.035A3.5 3.5 0 0 0 10 5.5V7h1.5a.5.5 0 0 1 .497.553"
                        />
                      </svg>
                    </div>
                    <h2
                      className="text-xl text-gray-800"
                      style={{ fontFamily: "fairplay" }}
                    >
                      Food Items ({foodItems.length})
                    </h2>
                    <span className="text-sm text-gray-600">
                      ${foodTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearCart("food");
                      }}
                      className="text-red-500 hover:text-red-600 text-xs font-medium"
                    >
                      Clear Food
                    </motion.button>
                    <motion.div
                      animate={{ rotate: foodSectionOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {foodSectionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4 bg-white">
                        {foodItems.map((item) => (
                          <CartItemComponent key={item.id} item={item} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Merchandise Items Section */}
            {merchItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <motion.div
                  whileHover={{ backgroundColor: "#DBEAFE" }}
                  className="flex items-center justify-between p-6 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setMerchSectionOpen(!merchSectionOpen)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M16 21H8a1 1 0 0 1-1-1v-7.93l-1.3 1.05c-.39.38-1.02.38-1.41 0l-2.83-2.83a.996.996 0 0 1 0-1.41L7.34 3H9c0 1.1 1 3 3 4.25C14 6 15 4.1 15 3h1.66l5.88 5.88c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.38-1.02.38-1.41 0L17 12.07V20a1 1 0 0 1-1 1m4.42-11.42l-4.31-4.3C15 7 14 8.25 12 9.25c-2-1-3-2.25-4.11-3.97l-4.31 4.3L5 11l3-2h1v10h6V9h1l3 2z"
                        />
                      </svg>
                    </div>
                    <h2
                      className="text-xl text-gray-800"
                      style={{ fontFamily: "fairplay" }}
                    >
                      Merchandise ({merchItems.length})
                    </h2>
                    <span className="text-sm text-gray-600">
                      ${merchTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearCart("merch");
                      }}
                      className="text-red-500 hover:text-red-600 text-xs font-medium"
                    >
                      Clear Merch
                    </motion.button>
                    <motion.div
                      animate={{ rotate: merchSectionOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {merchSectionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-4 bg-white">
                        {merchItems.map((item) => (
                          <CartItemComponent key={item.id} item={item} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
            style={{ fontFamily: "arial" }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {foodItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      Food (
                      {foodItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>${foodTotal.toFixed(2)}</span>
                  </motion.div>
                )}

                {merchItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      Merch (
                      {merchItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>${merchTotal.toFixed(2)}</span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-between text-gray-600"
                >
                  <span>Delivery Fee</span>
                  <span>$3.99</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-between text-gray-600"
                >
                  <span>Service Fee</span>
                  <span>$2.99</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total</span>
                    <span>${(totalPrice + 3.99 + 2.99).toFixed(2)}</span>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-full font-medium transition-colors"
                >
                  Proceed to Checkout
                </motion.button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/menu"
                    className="text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-full text-sm font-medium transition-colors"
                  >
                    Menu
                  </Link>
                  <Link
                    href="/merchandise"
                    className="text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-full text-sm font-medium transition-colors"
                  >
                    Merch
                  </Link>
                </div>
              </div>

              {/* Estimated delivery time */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-amber-50 rounded-lg"
              >
                <div className="flex items-center gap-2 text-amber-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Estimated Delivery
                  </span>
                </div>
                <p className="text-sm text-amber-700 mt-1">25-35 minutes</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {clearType === "all"
                  ? "Clear Entire Cart?"
                  : clearType === "food"
                    ? "Clear Food Items?"
                    : "Clear Merchandise?"}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove{" "}
                {clearType === "all"
                  ? "all items"
                  : clearType === "food"
                    ? "all food items"
                    : "all merchandise items"}{" "}
                from your cart? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmClearCart}
                  className="flex-1 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Clear{" "}
                  {clearType === "all"
                    ? "All"
                    : clearType === "food"
                      ? "Food"
                      : "Merch"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

CartPage.displayName = "CartPage";

export default CartPage;
