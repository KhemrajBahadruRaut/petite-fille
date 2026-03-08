"use client";

import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 to-stone-100 px-4 py-24">
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Ordering Disabled</h1>
        <p className="mt-2 text-sm text-gray-600">
          Online ordering has been removed. Please use reservations instead.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/reservation"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Make Reservation
          </Link>
          <Link
            href="/menu"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
