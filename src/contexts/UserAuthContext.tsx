"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiUrl } from "@/utils/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type AuthFlowMode = "login" | "signup";

interface StoredSession {
  token: string;
  user: AuthUser;
  expiresAt: string;
}

interface SignupOtpResult {
  otpToken: string;
  expiresInSeconds?: number;
}

interface UserAuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestSignupOtp: (email: string, fullName?: string) => Promise<SignupOtpResult>;
  signupWithOtp: (
    email: string,
    otpCode: string,
    otpToken: string,
    fullName?: string,
    password?: string,
  ) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const USER_SESSION_STORAGE_KEY = "petite_user_session_v1";
const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

function saveSessionToStorage(session: StoredSession | null): void {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function loadSessionFromStorage(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token || !parsed?.user?.email || !parsed?.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function mapUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  const name = `${record.name ?? ""}`.trim();
  const email = `${record.email ?? ""}`.trim();
  const role = `${record.role ?? "user"}`.trim() || "user";

  if (!Number.isFinite(id) || id <= 0 || !email) return null;

  return {
    id,
    name: name || "User",
    email,
    role,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    saveSessionToStorage(null);
  }, []);

  const applySession = useCallback((session: StoredSession) => {
    setUser(session.user);
    setToken(session.token);
    saveSessionToStorage(session);
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = loadSessionFromStorage();
    if (!stored?.token) {
      clearSession();
      return;
    }

    const response = await fetch(apiUrl("auth/customer_session.php"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${stored.token}`,
      },
      cache: "no-store",
    });

    const data = await parseJson<{
      success?: boolean;
      user?: unknown;
      expiresAt?: string;
      message?: string;
    }>(response);

    if (!response.ok || !data.success) {
      clearSession();
      throw new Error(data.message || "Session expired.");
    }

    const normalizedUser = mapUser(data.user);
    if (!normalizedUser) {
      clearSession();
      throw new Error("Invalid session user.");
    }

    applySession({
      token: stored.token,
      user: normalizedUser,
      expiresAt: data.expiresAt || stored.expiresAt,
    });
  }, [applySession, clearSession]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await refreshSession();
      } catch {
        // Session invalid is handled by clearSession.
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const requestSignupOtp = useCallback(
    async (email: string, fullName = ""): Promise<SignupOtpResult> => {
      const response = await fetch(apiUrl("auth/customer_send_otp.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          mode: "signup",
        }),
      });

      const data = await parseJson<{
        success?: boolean;
        message?: string;
        otpToken?: string;
        expiresInSeconds?: number;
      }>(response);

      if (!response.ok || !data.success || !data.otpToken) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      return {
        otpToken: data.otpToken,
        expiresInSeconds: data.expiresInSeconds,
      };
    },
    [],
  );

  const signupWithOtp = useCallback(
    async (
      email: string,
      otpCode: string,
      otpToken: string,
      fullName = "",
      password = "",
    ): Promise<void> => {
      const response = await fetch(apiUrl("auth/customer_verify_otp.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otpCode: otpCode.trim(),
          otpToken: otpToken.trim(),
          fullName: fullName.trim(),
          password,
          mode: "signup",
        }),
      });

      const data = await parseJson<{
        success?: boolean;
        message?: string;
        token?: string;
        expiresAt?: string;
        user?: unknown;
      }>(response);

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Unable to verify OTP.");
      }

      const normalizedUser = mapUser(data.user);
      if (!normalizedUser) {
        throw new Error("Invalid user session returned.");
      }

      applySession({
        token: data.token,
        user: normalizedUser,
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      });
    },
    [applySession],
  );

  const loginWithPassword = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await fetch(apiUrl("auth/customer_password_login.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await parseJson<{
        success?: boolean;
        message?: string;
        token?: string;
        expiresAt?: string;
        user?: unknown;
      }>(response);

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Unable to login.");
      }

      const normalizedUser = mapUser(data.user);
      if (!normalizedUser) {
        throw new Error("Invalid user session returned.");
      }

      applySession({
        token: data.token,
        user: normalizedUser,
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      });
    },
    [applySession],
  );

  const logout = useCallback(async (): Promise<void> => {
    const currentToken = token;
    clearSession();

    if (!currentToken) return;

    try {
      await fetch(apiUrl("auth/customer_logout.php"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
    } catch {
      // no-op
    }
  }, [clearSession, token]);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      requestSignupOtp,
      signupWithOtp,
      loginWithPassword,
      refreshSession,
      logout,
    }),
    [
      user,
      token,
      isLoading,
      requestSignupOtp,
      signupWithOtp,
      loginWithPassword,
      refreshSession,
      logout,
    ],
  );

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  );
}

export function useUserAuth(): UserAuthContextValue {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return context;
}
