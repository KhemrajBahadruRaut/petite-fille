"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { ShieldCheck, KeyRound } from "lucide-react";
import { apiUrl } from "@/utils/api";
import { getAdminSession } from "@/utils/adminAuth";

interface ChangePasswordResponse {
  status?: string;
  message?: string;
}

export default function AdminSettingsPage() {
  const session = useMemo(() => getAdminSession(), []);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!session?.email) {
      setFeedback({
        type: "error",
        message: "Session is missing. Please log in again.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({
        type: "error",
        message: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("auth/change_password.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.email,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const raw = await response.text();
      let data: ChangePasswordResponse = {};
      try {
        data = JSON.parse(raw) as ChangePasswordResponse;
      } catch {
        data = {};
      }

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to change password.");
      }

      setFeedback({
        type: "success",
        message: "Password changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to change password right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your admin account settings.</p>
      </div>

      {feedback.message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Account Security
              </h2>
              <p className="text-sm text-gray-600">
                Email: {session?.email || "Unknown"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFeedback({ type: "idle", message: "" });
              setShowChangePassword((prev) => !prev);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {showChangePassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {!showChangePassword ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <KeyRound className="h-4 w-4" />
              <span className="text-sm">
                Click <strong>Change Password</strong> to update your login
                password.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Previous Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter previous password"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

