"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiUrl } from "../../../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GiftCardOrder {
  id: number;
  recipient: string;
  recipient_email: string;
  sender_name: string;
  sender_email: string;
  message: string | null;
  quantity: number;
  gift_card_amount: number;
  amount_cents: number; // The total order amount in cents (Stripe convention) — divide by 100 for display
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
  recipient?: string;
  recipient_email?: string;
  sender_name?: string;
  sender_email?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// "redeemed" / "partially_redeemed" are derived client-side (see getDisplayStatus)
// from the actual gift_cards rows tied to an order — they don't exist on the
// order itself in the DB.
const STATUS_STYLES: Record<string, string> = {
  paid:               "bg-green-100 text-green-700 border border-green-200",
  completed:          "bg-green-100 text-green-700 border border-green-200",
  pending:            "bg-yellow-100 text-yellow-700 border border-yellow-200",
  failed:             "bg-red-100 text-red-700 border border-red-200",
  email_failed:       "bg-orange-100 text-orange-700 border border-orange-200",
  redeemed:           "bg-red-100 text-red-700 border border-red-200",
  partially_redeemed: "bg-purple-100 text-purple-700 border border-purple-200",
};

const STATUS_LABELS: Record<string, string> = {
  paid:               "Paid",
  completed:          "Completed",
  pending:            "Pending",
  failed:             "Failed",
  email_failed:       "Email Failed",
  redeemed:           "Redeemed",
  partially_redeemed: "Partially Redeemed",
};

const CARD_STATUS_STYLES: Record<string, string> = {
  active:   "bg-blue-100 text-blue-700 border border-blue-200",
  redeemed: "bg-red-100 text-red-700 border border-red-200", 
};

// ─── Redeem Panel ─────────────────────────────────────────────────────────────

function RedeemPanel() {
  const [code, setCode]           = useState("");
  const [verifying, setVerifying] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [verified, setVerified]   = useState<GiftCard | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const reset = () => {
    setCode("");
    setVerified(null);
    setError(null);
    setSuccess(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleVerify = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setVerifying(true);
    setError(null);
    setVerified(null);
    setSuccess(false);

    try {
      const res  = await fetch(apiUrl("payment/verify_gift_code.php"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error ?? "Invalid or already redeemed code.");
      } else {
        setVerified(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    if (!verified) return;
    setRedeeming(true);
    setError(null);

    try {
      const res  = await fetch(apiUrl("payment/redeem_gift_code.php"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: verified.code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to redeem.");
      } else {
        setSuccess(true);
        setVerified(null);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Verify & Redeem Gift Card</h3>
        <p className="text-amber-100 text-sm mt-0.5">
          Enter the customer's gift card code to verify and redeem it
        </p>
      </div>

      <div className="p-6 space-y-5">

        {/* Success state */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-800 font-semibold text-lg">Gift Card Redeemed!</p>
            <p className="text-green-600 text-sm">The card has been marked as used.</p>
            <button
              onClick={reset}
              className="mt-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
            >
              Redeem Another
            </button>
          </div>
        )}

        {/* Input */}
        {!success && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gift Card Code
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                    setVerified(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !verified && handleVerify()}
                  placeholder="GIFT-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-base
                             tracking-widest text-slate-800 placeholder:text-slate-300
                             focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || !code.trim()}
                  className="px-5 py-3 bg-slate-800 text-white rounded-xl text-sm font-medium
                             hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {verifying ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : "Verify"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Format: GIFT-XXXX-XXXX-XXXX &nbsp;·&nbsp; Press Enter to verify
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Verified card details */}
            {verified && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 space-y-4">
                {/* Valid badge */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-700 font-semibold text-sm">Valid Gift Card</span>
                </div>

                {/* Code + amount */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xl tracking-widest text-amber-800">
                    {verified.code}
                  </span>
                  <span className="text-3xl font-bold text-amber-700">
                    ${verified.amount}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {verified.recipient && (
                    <div>
                      <p className="text-slate-500 text-xs">Recipient</p>
                      <p className="font-medium text-slate-800">{verified.recipient}</p>
                    </div>
                  )}
                  {verified.recipient_email && (
                    <div>
                      <p className="text-slate-500 text-xs">Recipient email</p>
                      <p className="font-medium text-slate-800 truncate">{verified.recipient_email}</p>
                    </div>
                  )}
                  {verified.sender_name && (
                    <div>
                      <p className="text-slate-500 text-xs">Gifted by</p>
                      <p className="font-medium text-slate-800">{verified.sender_name}</p>
                    </div>
                  )}
                  {verified.created_at && (
                    <div>
                      <p className="text-slate-500 text-xs">Issued on</p>
                      <p className="font-medium text-slate-800">
                        {new Date(verified.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl
                               text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white
                               rounded-xl text-sm font-bold hover:from-amber-600 hover:to-yellow-600
                               disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md
                               flex items-center justify-center gap-2"
                  >
                    {redeeming ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Redeeming…
                      </>
                    ) : (
                      `✓ Mark as Redeemed — $${verified.amount}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Orders Table ─────────────────────────────────────────────────────────────

function OrdersTable() {
  const [orders, setOrders]           = useState<GiftCardOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [giftCodes, setGiftCodes]     = useState<Record<number, GiftCard[]>>({});
  const [loadingCodes, setLoadingCodes] = useState<number | null>(null);

  // The order's own `status` only ever reflects payment/processing state
  // (paid, pending, failed…) — it never gets updated when someone later
  // redeems the gift card(s) that came out of that order. To show a true
  // "Redeemed" / "Partially Redeemed" badge we look at the actual codes
  // tied to the order and derive the status from those instead.
  const getDisplayStatus = useCallback((order: GiftCardOrder): string => {
    const codes = giftCodes[order.id];
    if (!codes || codes.length === 0) return order.status;

    const allRedeemed = codes.every((c) => c.status === "redeemed");
    if (allRedeemed) return "redeemed";

    const anyRedeemed = codes.some((c) => c.status === "redeemed");
    if (anyRedeemed) return "partially_redeemed";

    return order.status;
  }, [giftCodes]);

  // Quietly fetches codes for every paid/completed order in the background
  // so badges can flip to "Redeemed" without the user needing to click
  // "Codes" first. Fire-and-forget — doesn't block the table from rendering.
  const prefetchCodes = useCallback((list: GiftCardOrder[]) => {
    const relevant = list.filter((o) => ["paid", "completed"].includes(o.status));
    relevant.forEach((o) => {
      fetch(apiUrl(`giftCards/getGiftCodes.php?order_id=${o.id}`))
        .then((res) => res.json())
        .then((data) => {
          setGiftCodes((prev) => ({ ...prev, [o.id]: data.codes ?? [] }));
        })
        .catch(() => {
          // silent — badge just falls back to showing the raw order status
        });
    });
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("giftCards/get_gift_card_orders.php"), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const rawOrders: GiftCardOrder[] = data.orders ?? [];

      // PHP/PDO sends numeric DB columns as strings in JSON (e.g.
      // "amount_cents": "50"). Coerce them to real numbers here so every
      // calculation below (.toFixed, +, etc.) is safe no matter what the
      // API returns.
      const fetchedOrders: GiftCardOrder[] = rawOrders.map((o) => ({
        ...o,
        amount_cents: Number(o.amount_cents),
        gift_card_amount: Number(o.gift_card_amount),
        quantity: Number(o.quantity),
      }));

      setOrders(fetchedOrders);
      prefetchCodes(fetchedOrders);
    } catch {
      setError("Could not load gift card orders.");
    } finally {
      setLoading(false);
    }
  }, [prefetchCodes]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fetchCodes = async (orderId: number) => {
    if (giftCodes[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }
    setLoadingCodes(orderId);
    try {
      const res  = await fetch(apiUrl(`giftCards/getGiftCodes.php?order_id=${orderId}`));
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
    const matchesStatus = statusFilter === "all" || getDisplayStatus(o) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // amount_cents is the order total in cents (Stripe's convention), unlike
  // gift_card_amount which is a plain dollar face value — so this one DOES
  // need the /100 conversion for display.
  const totalRevenueCents = orders
    .filter((o) => ["paid", "completed"].includes(o.status))
    .reduce((sum, o) => sum + o.amount_cents, 0);
  const totalRevenue  = totalRevenueCents / 100;
  const totalPaid     = orders.filter((o) => ["paid", "completed"].includes(o.status)).length;
  const totalPending  = orders.filter((o) => o.status === "pending").length;
  const totalRedeemed = orders.filter((o) => getDisplayStatus(o) === "redeemed").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">All Orders</h3>
          <p className="text-sm text-slate-500">Purchase history and generated codes</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700
                     border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-slate-800">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Paid</p>
          <p className="text-xl font-bold text-green-700">{totalPaid}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-700">{totalPending}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Redeemed</p>
          <p className="text-xl font-bold text-red-700">{totalRedeemed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 text-sm border border-slate-200 rounded-lg
                     focus:outline-none focus:border-blue-400 bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg
                     focus:outline-none focus:border-blue-400 bg-white text-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="redeemed">Redeemed</option>
          <option value="partially_redeemed">Partially Redeemed</option>
        </select>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading orders…
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const displayStatus = getDisplayStatus(order);
            return (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="p-4 flex flex-wrap items-center gap-3">
                <div className="text-xs font-mono text-slate-400 w-10">#{order.id}</div>

                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm font-semibold text-slate-800">{order.recipient}</p>
                  <p className="text-xs text-slate-400">{order.recipient_email}</p>
                </div>

                <div className="flex-1 min-w-[140px]">
                  <p className="text-xs text-slate-500">From</p>
                  <p className="text-sm font-medium text-slate-700">{order.sender_name}</p>
                  <p className="text-xs text-slate-400">{order.sender_email}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-sm font-bold text-slate-800">
                    ${order.gift_card_amount} × {order.quantity}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${(order.amount_cents / 100).toFixed(2)} total
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${STATUS_STYLES[displayStatus] ?? "bg-slate-100 text-slate-600"}`}>
                  {STATUS_LABELS[displayStatus] ?? displayStatus}
                </span>

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

                <button
                  onClick={() => fetchCodes(order.id)}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-600
                             hover:text-blue-800 font-medium transition"
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

              {order.message && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-slate-400 italic">&ldquo;{order.message}&rdquo;</p>
                </div>
              )}

              {order.stripe_payment_intent_id && (
                <div className="px-4 pb-3">
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {order.stripe_payment_intent_id}
                  </p>
                </div>
              )}

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
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium
                            ${CARD_STATUS_STYLES[card.status]}`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GiftCardsAdminPage() {
  const [tab, setTab] = useState<"redeem" | "orders">("redeem");

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gift Cards</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Verify customer codes or browse purchase history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("redeem")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "redeem"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Verify & Redeem
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "orders"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Order History
        </button>
      </div>

      {/* Tab content */}
      {tab === "redeem" ? <RedeemPanel /> : <OrdersTable />}
    </div>
  );
}