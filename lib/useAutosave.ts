"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, retryAfterMs } from "@/lib/errors";

/**
 * Autosave for a quiz or a code task: the latest value per question, sent in
 * order, never lost on the way.
 *
 * - A change waits `delay` ms for the next keystroke, but never more than
 *   MAX_WAIT_MS in total while it keeps changing.
 * - A failed save puts that question and everything queued behind it back in
 *   the queue and retries by itself, backing off from a second to half a
 *   minute (or exactly as long as a rate limit asked for).
 * - Everything not yet confirmed by the server is also kept in this tab's
 *   sessionStorage, so a reload in the middle of an exam picks it up again.
 *   It is a cache, not a record: the server's `savedAt` is the only time that counts.
 * - Submit can ask whether anything is still unconfirmed and refuse until it is saved.
 */

export type SaveState = "saved" | "unsaved" | "saving" | "error";
export type Draft<P> = { item: P; at: number };

const MAX_WAIT_MS = 10_000;
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/** Unconfirmed work left in this tab by an earlier render of the same attempt. */
export function loadDrafts<K extends string, P>(key: string): Map<K, Draft<P>> {
  try {
    const raw = typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(key);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, Draft<P>>;
    return new Map(Object.entries(parsed) as [K, Draft<P>][]);
  } catch {
    return new Map();
  }
}

function storeDrafts<K extends string, P>(key: string, drafts: Map<K, Draft<P>>) {
  try {
    if (drafts.size === 0) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(Object.fromEntries(drafts)));
  } catch {
    // Storage full or blocked: the retry loop above is the safety net.
  }
}

export function useAutosave<K extends string, P>({
  save,
  draftKey,
  now,
}: {
  /** Sends one question's latest value. Rejects on refusal; the hook retries. */
  save: (key: K, item: P) => Promise<unknown>;
  /** Where this attempt's unconfirmed work lives in sessionStorage. */
  draftKey: string;
  /** The server-aligned clock, so draft times compare with the server's `savedAt`. */
  now: () => number;
}) {
  // Everything the server hasn't confirmed, by question; `pending` is what the next flush sends.
  const unconfirmed = useRef(new Map<K, Draft<P>>());
  const pending = useRef(new Set<K>());
  const inFlight = useRef<Promise<boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirtySince = useRef<number | null>(null);
  const retryDelay = useRef(RETRY_MIN_MS);
  const saveRef = useRef(save);
  const nowRef = useRef(now);
  const [state, setState] = useState<SaveState>("saved");
  const [error, setError] = useState<string | null>(null);
  const [unsavedCount, setUnsavedCount] = useState(0);

  useEffect(() => {
    saveRef.current = save;
    nowRef.current = now;
  });

  const sync = useCallback(() => {
    storeDrafts(draftKey, unconfirmed.current);
    setUnsavedCount(unconfirmed.current.size);
  }, [draftKey]);

  // Timers set inside flush call the latest flush through this ref.
  const flushRef = useRef<() => Promise<boolean>>(async () => true);

  const flush = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current);
    if (inFlight.current) await inFlight.current;
    if (pending.current.size === 0) return unconfirmed.current.size === 0;
    const keys = [...pending.current];
    pending.current.clear();
    setState("saving");
    const run = (async () => {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const draft = unconfirmed.current.get(key);
        if (draft === undefined) continue;
        try {
          await saveRef.current(key, draft.item);
          // Confirmed, unless the student changed it again while it was on its way.
          if (unconfirmed.current.get(key) === draft) unconfirmed.current.delete(key);
        } catch (caught) {
          // This one and everything behind it go back in line, in order.
          for (const rest of keys.slice(i)) pending.current.add(rest);
          setError(errorMessage(caught));
          setState("error");
          const wait = retryAfterMs(caught) ?? retryDelay.current;
          retryDelay.current = Math.min(RETRY_MAX_MS, retryDelay.current * 2);
          timer.current = setTimeout(() => void flushRef.current(), wait);
          sync();
          return false;
        }
      }
      retryDelay.current = RETRY_MIN_MS;
      setError(null);
      if (unconfirmed.current.size === 0) {
        dirtySince.current = null;
        setState("saved");
      } else {
        setState("unsaved");
      }
      sync();
      return true;
    })();
    inFlight.current = run;
    try {
      return await run;
    } finally {
      inFlight.current = null;
    }
  }, [sync]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  /** Records a new value and schedules the save. */
  const queue = useCallback(
    (key: K, item: P, delay: number) => {
      const at = nowRef.current();
      unconfirmed.current.set(key, { item, at });
      pending.current.add(key);
      if (dirtySince.current === null) dirtySince.current = at;
      setState("unsaved");
      sync();
      clearTimeout(timer.current);
      const waited = at - dirtySince.current;
      timer.current = setTimeout(() => void flush(), Math.min(delay, Math.max(0, MAX_WAIT_MS - waited)));
    },
    [flush, sync],
  );

  /** Takes over drafts found in sessionStorage and sends them right away. */
  const adopt = useCallback(
    (drafts: Iterable<[K, Draft<P>]>) => {
      let any = false;
      for (const [key, draft] of drafts) {
        unconfirmed.current.set(key, draft);
        pending.current.add(key);
        any = true;
      }
      if (any) {
        setState("unsaved");
        sync();
        clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), 0);
      }
    },
    [flush, sync],
  );

  /** After a successful submit: nothing is unsaved any more, by definition. */
  const clear = useCallback(() => {
    clearTimeout(timer.current);
    unconfirmed.current.clear();
    pending.current.clear();
    dirtySince.current = null;
    setState("saved");
    setError(null);
    sync();
  }, [sync]);

  const isUnsaved = useCallback((key: K) => unconfirmed.current.has(key), []);
  const unsavedKeys = useCallback(() => [...unconfirmed.current.keys()], []);

  // Warn when the tab closes with work on its way; save on the way out.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (unconfirmed.current.size > 0 || inFlight.current !== null) {
        void flush();
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      clearTimeout(timer.current);
      void flush();
    };
  }, [flush]);

  return { queue, flush, adopt, clear, isUnsaved, unsavedKeys, state, error, unsavedCount };
}

/** The status line next to the Submit button. */
export function saveLabel(state: SaveState, error: string | null, unsaved: number): string {
  switch (state) {
    case "saved":
      return "Saved";
    case "saving":
      return "Saving…";
    case "unsaved":
      return "Unsaved";
    case "error":
      return `${error ?? "Couldn't save."} Retrying… (${unsaved} unsaved)`;
  }
}
