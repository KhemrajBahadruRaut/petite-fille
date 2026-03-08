"use client";

import Link from "next/link";

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Ordering Disabled</h1>
        <p className="mt-2 text-sm text-gray-600">
          Order management has been removed. Please manage reservations instead.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/reservations"
            className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Go to Reservations
          </Link>
        </div>
      </div>
    </div>
  );
}
