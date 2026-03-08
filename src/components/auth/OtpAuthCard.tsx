"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlowMode, useUserAuth } from "@/contexts/UserAuthContext";

interface OtpAuthCardProps {
  mode: AuthFlowMode;
}

function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const MIN_PASSWORD_LENGTH = 8;

export default function OtpAuthCard({ mode }: OtpAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/profile";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/profile";

  const {
    isAuthenticated,
    isLoading,
    requestSignupOtp,
    signupWithOtp,
    loginWithPassword,
  } = useUserAuth();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleHref = useMemo(() => {
    const path = isSignup ? "/auth/login" : "/auth/signup";
    return `${path}?next=${encodeURIComponent(nextPath)}`;
  }, [isSignup, nextPath]);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  const validatePasswordFields = (): string => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }
    return "";
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!isValidEmailAddress(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (isSignup && !fullName.trim()) {
      setError("Full name is required for signup.");
      return;
    }

    if (isSignup) {
      const passwordError = validatePasswordFields();
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsSending(true);
    try {
      const result = await requestSignupOtp(email.trim(), fullName.trim());
      setOtpToken(result.otpToken);
      setMessage("Verification code sent. Please check your email.");
    } catch (sendError) {
      const text =
        sendError instanceof Error ? sendError.message : "Unable to send OTP.";
      setError(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!otpToken) {
      setError("Request a verification code first.");
      return;
    }

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    const passwordError = validatePasswordFields();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsVerifying(true);
    try {
      await signupWithOtp(
        email.trim(),
        otpCode.trim(),
        otpToken,
        fullName.trim(),
        password,
      );
      router.replace(nextPath);
    } catch (verifyError) {
      const text =
        verifyError instanceof Error
          ? verifyError.message
          : "Unable to verify code.";
      setError(text);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordLogin = async () => {
    setError("");
    setMessage("");

    if (!isValidEmailAddress(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginWithPassword(email.trim(), password);
      router.replace(nextPath);
    } catch (loginError) {
      const text =
        loginError instanceof Error ? loginError.message : "Unable to login.";
      setError(text);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">
          {isSignup ? "Create Account" : "Login"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isSignup
            ? "Verify your email once during signup, then login with password."
            : "Login with your email and password."}
        </p>

        <div className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setOtpToken("");
                setOtpCode("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                isSignup
                  ? `Minimum ${MIN_PASSWORD_LENGTH} characters`
                  : "Your password"
              }
            />
          </div>

          {isSignup ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat your password"
                />
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSending ? "Sending..." : "Send verification code"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handlePasswordLogin}
              disabled={isLoggingIn}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          )}

          {otpToken && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <label className="block text-xs font-medium text-blue-700">
                Enter 6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(event) =>
                  setOtpCode(event.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full rounded-lg border border-blue-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
              >
                {isVerifying ? "Verifying..." : "Verify and create account"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
          {isSignup ? "Already registered?" : "New here?"}{" "}
          <Link href={toggleHref} className="font-medium text-blue-700 hover:underline">
            {isSignup ? "Go to Login" : "Create an account"}
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
