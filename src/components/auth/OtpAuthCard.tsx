"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  XCircle,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeField, setActiveField] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isSignup) return;
    let strength = 0;
    if (password.length >= MIN_PASSWORD_LENGTH) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password, isSignup]);

  const validatePasswordFields = (): string => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
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
      setError("Full name is required.");
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

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-stone-200";
    if (passwordStrength === 1) return "bg-rose-400";
    if (passwordStrength === 2) return "bg-amber-400";
    if (passwordStrength === 3) return "bg-emerald-400";
    return "bg-emerald-600";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          <p className="text-sm text-stone-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm mb-4">
            {isSignup ? (
              <User className="h-6 w-6" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-stone-900">
            {isSignup ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {isSignup
              ? "Get started with a secure account"
              : "Login to access your account"}
          </p>
        </div>

        {/* Main card */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-stone-100/40 blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-40 w-40 rounded-full bg-stone-100/40 blur-2xl" />

          <div className="relative p-6 md:p-8">
            <div className="space-y-5">
              {/* Full Name - Signup only */}
              {isSignup && (
                <div className="group">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                    Full name
                  </label>
                  <div
                    className={`flex items-center gap-2 rounded-xl border transition-all ${
                      activeField === "name"
                        ? "border-stone-400 ring-4 ring-stone-100"
                        : "border-stone-200"
                    }`}
                  >
                    <div className="pl-3 text-stone-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setActiveField("name")}
                      onBlur={() => setActiveField(null)}
                      className="w-full bg-transparent py-2.5 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                      placeholder="John Carter"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="group">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Email address
                </label>
                <div
                  className={`flex items-center gap-2 rounded-xl border transition-all ${
                    activeField === "email"
                      ? "border-stone-400 ring-4 ring-stone-100"
                      : "border-stone-200"
                  }`}
                >
                  <div className="pl-3 text-stone-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpToken("");
                      setOtpCode("");
                    }}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    className="w-full bg-transparent py-2.5 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                    placeholder="hello@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Password
                </label>
                <div
                  className={`flex items-center gap-2 rounded-xl border transition-all ${
                    activeField === "password"
                      ? "border-stone-400 ring-4 ring-stone-100"
                      : "border-stone-200"
                  }`}
                >
                  <div className="pl-3 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActiveField("password")}
                    onBlur={() => setActiveField(null)}
                    className="w-full bg-transparent py-2.5 pr-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                    placeholder={
                      isSignup
                        ? `Min. ${MIN_PASSWORD_LENGTH} characters`
                        : "Your password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicator - Signup only */}
                {isSignup && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-1 gap-0.5 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all duration-300 ${
                            passwordStrength >= level
                              ? getStrengthColor()
                              : "bg-stone-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-right text-[11px] font-medium text-stone-400">
                      {getStrengthText()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password - Signup only */}
              {isSignup && (
                <div className="group">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                    Confirm password
                  </label>
                  <div
                    className={`flex items-center gap-2 rounded-xl border transition-all ${
                      activeField === "confirm"
                        ? "border-stone-400 ring-4 ring-stone-100"
                        : "border-stone-200"
                    }`}
                  >
                    <div className="pl-3 text-stone-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setActiveField("confirm")}
                      onBlur={() => setActiveField(null)}
                      className="w-full bg-transparent py-2.5 pr-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="pr-3 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {isSignup ? (
                <>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800 hover:shadow-md disabled:opacity-60"
                  >
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send verification code
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  {/* OTP Section */}
                  <AnimatePresence>
                    {otpToken && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-stone-600">
                          <AtSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Verification required</span>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-center text-lg font-mono tracking-widest text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
                          placeholder="000000"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifying}
                          className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {isVerifying ? "Verifying..." : "Verify & create account"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handlePasswordLogin}
                  disabled={isLoggingIn}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800 hover:shadow-md disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Toggle link */}
            <div className="mt-6 pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <Link
                  href={toggleHref}
                  className="font-medium text-stone-700 underline underline-offset-4 hover:text-stone-900 transition-colors"
                >
                  {isSignup ? "Sign in" : "Create one"}
                </Link>
              </p>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-800">{message}</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle footer note */}
        <p className="mt-6 text-center text-[11px] text-stone-400">
          {isSignup
            ? "By creating an account, you agree to our terms."
            : "Secure login with password authentication."}
        </p>
      </div>
    </div>
  );
}