"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The integrity collector (KALAMI.md §6): counters, never recordings.
 *
 * - every level: blocked shortcuts (print, view source, devtools)
 * - standard and strict: tab switches and time away, the task open in a
 *   second tab
 * - strict: fullscreen required; leaving it is counted, and the work is
 *   hidden while the window is out of focus
 *
 * Counters are sent in small batches every few seconds while they change,
 * and at once for serious events. They are what this browser reports: advice
 * for the lecturer, never proof, and a few things that happen to honest
 * students (a notification popping up, a laptop going to sleep) are filtered
 * out below rather than counted against them.
 */

export type Level = "off" | "standard" | "strict";

export type Counts = {
  pasteBlocked?: number;
  dropBlocked?: number;
  largeInserts?: number;
  copyBlocked?: number;
  tabSwitches?: number;
  awayMs?: number;
  fullscreenExits?: number;
  shortcutsBlocked?: number;
  multiTab?: number;
};

const FLUSH_MS = 10_000;
/** Focus lost and back within this isn't a tab switch: a notification, Ctrl+F, a password manager. */
const SHORT_BLUR_MS = 2_000;
/** One episode away counts at most this much: a closed laptop isn't ten hours of cheating. */
const MAX_AWAY_PER_EPISODE_MS = 10 * 60_000;

function isBlockedShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  if (key === "f12") return true;
  if (mod && (key === "p" || key === "u")) return true;
  if (mod && event.shiftKey && (key === "i" || key === "j" || key === "c")) return true;
  return false;
}

export function useIntegrity({
  level,
  enabled,
  channelKey,
  report,
}: {
  level: Level;
  /** False once the work is submitted or the task closed. */
  enabled: boolean;
  /** Same key in two tabs means the task is open twice. */
  channelKey: string;
  report: (counts: Counts) => Promise<unknown>;
}) {
  const counts = useRef<Counts>({});
  const reportRef = useRef(report);
  const awaySince = useRef<number | null>(null);
  const [away, setAway] = useState(false);
  // Rendered only in the browser (after the task loads), so document exists.
  const [fullscreen, setFullscreen] = useState(() => typeof document === "undefined" || document.fullscreenElement !== null);
  const watching = enabled && level !== "off";
  const strict = enabled && level === "strict";

  useEffect(() => {
    reportRef.current = report;
  });

  const flush = useCallback(async () => {
    const batch = counts.current;
    if (Object.keys(batch).length === 0) return;
    counts.current = {};
    try {
      await reportRef.current(batch);
    } catch {
      // Keep them for the next try.
      for (const [key, value] of Object.entries(batch) as [keyof Counts, number][]) {
        counts.current[key] = (counts.current[key] ?? 0) + value;
      }
    }
  }, []);

  const count = useCallback(
    (key: keyof Counts, by = 1, urgent = false) => {
      counts.current[key] = (counts.current[key] ?? 0) + by;
      if (urgent) void flush();
    },
    [flush],
  );

  // Batches every few seconds, and whatever is left when the page goes.
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => void flush(), FLUSH_MS);
    return () => {
      clearInterval(timer);
      void flush();
    };
  }, [enabled, flush]);

  // Shortcuts, at every level.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (isBlockedShortcut(event)) {
        event.preventDefault();
        count("shortcutsBlocked");
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [enabled, count]);

  // Leaving the tab or the window. The work hides at once (strict); the counters
  // only move once the student has really been gone for a moment.
  useEffect(() => {
    if (!watching) return;
    const leave = () => {
      if (awaySince.current !== null) return;
      awaySince.current = Date.now();
      setAway(true);
    };
    const back = () => {
      if (awaySince.current === null) return;
      const gone = Date.now() - awaySince.current;
      awaySince.current = null;
      setAway(false);
      if (gone >= SHORT_BLUR_MS) {
        count("tabSwitches");
        count("awayMs", Math.min(gone, MAX_AWAY_PER_EPISODE_MS));
      }
    };
    const onVisibility = () => (document.hidden ? leave() : back());
    const onBlur = () => {
      // Clicking into the preview moves focus into its iframe: that isn't leaving.
      setTimeout(() => {
        if (!document.hasFocus() && document.activeElement?.tagName !== "IFRAME") leave();
      }, 0);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", back);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", back);
      back();
    };
  }, [watching, count]);

  // The same task open in a second tab.
  useEffect(() => {
    if (!watching || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(`kalami:${channelKey}`);
    channel.onmessage = (event) => {
      if (event.data === "open") {
        count("multiTab", 1, true);
        channel.postMessage("also-open");
      } else if (event.data === "also-open") {
        count("multiTab", 1, true);
      }
    };
    channel.postMessage("open");
    return () => channel.close();
  }, [watching, channelKey, count]);

  // Strict: fullscreen is required, and leaving it counts.
  useEffect(() => {
    if (!strict) return;
    let was = document.fullscreenElement !== null;
    const update = () => {
      const now = document.fullscreenElement !== null;
      if (was && !now) count("fullscreenExits", 1, true);
      was = now;
      setFullscreen(now);
    };
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [strict, count]);

  const enterFullscreen = useCallback(() => {
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, []);

  return {
    count,
    /** Strict mode: hide the work while true. */
    blocked: strict && (!fullscreen || away),
    needsFullscreen: strict && !fullscreen,
    enterFullscreen,
  };
}
