"use client";

import { useEffect, useRef } from "react";

const DEFAULT_REFRESH_INTERVAL_MS = 5_000;

type RefreshCallback = (signal: AbortSignal) => void | Promise<void>;

/**
 * Refreshes server-backed state while the page is visible, and immediately
 * refreshes again when the tab regains focus. Overlapping requests are skipped.
 */
export function useLiveRefresh(
  refresh: RefreshCallback,
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS,
) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    let active = true;
    let running = false;
    let currentController: AbortController | null = null;

    const runRefresh = async () => {
      if (!active || running) return;

      running = true;
      const controller = new AbortController();
      currentController = controller;

      try {
        await refreshRef.current(controller.signal);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          console.error("Live refresh failed:", error);
        }
      } finally {
        if (currentController === controller) currentController = null;
        running = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void runRefresh();
    };

    void runRefresh();
    const intervalId = window.setInterval(refreshWhenVisible, intervalMs);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      currentController?.abort();
    };
  }, [intervalMs]);
}
