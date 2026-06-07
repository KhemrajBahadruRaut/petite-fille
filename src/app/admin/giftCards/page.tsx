"use client";

import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../../../utils/api";

interface GiftCardOrder {
  id: number;
  recipient: string;
  recipient_email: string;
  sender_name: string;
  sender_email: string;
  message: string | null;
  quantity: number;
  gift_card_amount: number;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  ip_address: string | null;
  created_at: string;
}

interface GiftCard {
  id: number;
  code: string;
  amount: number;
  status: "active" | "redeemed";
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  failed: "bg-red-100 text-red-700 border border-red-200",
};

const CARD_STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 border border-blue-200",
  redeemed: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function GiftCardsAdminPage() {
  const [orders, setOrders] = useState<GiftCardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [giftCodes, setGiftCodes] = useState<Record<number, GiftCard[]>>({});
  const [loadingCodes, setLoadingCodes] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("giftCards/get_gift_card_orders.php"), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (err) {
      setError("Could not load gift card orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchCodes = async (orderId: number) => {
    if (giftCodes[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    setLoadingCodes(orderId);
    try {
      const res = await fetch(
        apiUrl(`giftCards/get_gift_codes.php?order_id=${orderId}`)
      );
      const data = await res.json();
      setGiftCodes((prev) => ({ ...prev, [orderId]: data.codes ?? [] }));
      setExpandedOrder(orderId);
    } catch {
      // silent
    } finally {
      setLoadingCodes(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.recipient.toLowerCase().includes(search.toLowerCase()) ||
      o.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      o.sender_email.toLowerCase().includes(search.toLowerCase()) ||
      o.recipient_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amount_cents, 0);

  const totalPaid = orders.filter((o) => o.status === "paid").length;
  const totalPending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gift Card Orders</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All eGift card purchases and generated codes
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-800">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Paid Orders</p>
          <p className="text-2xl font-bold text-green-700">{totalPaid}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-700">{totalPending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading orders...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Order Row */}
              <div className="p-4 flex flex-wrap items-center gap-3">
                {/* Order ID */}
                <div className="text-xs font-mono text-slate-400 w-10">
                  #{order.id}
                </div>

                {/* Recipient */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm font-semibold text-slate-800">{order.recipient}</p>
                  <p className="text-xs text-slate-400">{order.recipient_email}</p>
                </div>

                {/* Sender */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-xs text-slate-500">From</p>
                  <p className="text-sm font-medium text-slate-700">{order.sender_name}</p>
                  <p className="text-xs text-slate-400">{order.sender_email}</p>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-sm font-bold text-slate-800">
                    ${order.gift_card_amount} × {order.quantity}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${(order.amount_cents / 100).toFixed(2)} total
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {order.status}
                  </span>
                </div>

                {/* Date */}
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Expand button */}
                <button
                  onClick={() => fetchCodes(order.id)}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  {loadingCodes === order.id ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      Codes
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Message */}
              {order.message && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;{order.message}&rdquo;
                  </p>
                </div>
              )}

              {/* Stripe ID */}
              {order.stripe_payment_intent_id && (
                <div className="px-4 pb-3">
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {order.stripe_payment_intent_id}
                  </p>
                </div>
              )}

              {/* Gift Codes Expanded */}
              {expandedOrder === order.id && giftCodes[order.id] && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                    Gift Codes
                  </p>
                  {giftCodes[order.id].length === 0 ? (
                    <p className="text-xs text-slate-400">No codes generated yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {giftCodes[order.id].map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"
                        >
                          <span className="font-mono text-sm font-bold text-amber-700 tracking-widest">
                            {card.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CARD_STATUS_STYLES[card.status]}`}>
                            {card.status}
                          </span>
                          <span className="text-xs text-slate-400">${card.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}