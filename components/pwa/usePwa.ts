"use client";

import { useSyncExternalStore } from "react";
import { installPromptStore, isStandalone } from "@/lib/pwa";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Whether the browser thinks it has a connection. True while rendering on the server. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

function subscribeDisplayMode(onChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Opened as the installed app (home screen / desktop), not in a browser tab. */
export function useStandalone(): boolean {
  return useSyncExternalStore(subscribeDisplayMode, isStandalone, () => false);
}

/** Chrome's deferred install prompt, if it offered one ("prompt"), or "installed" right after installing. */
export function useInstallPrompt() {
  const state = useSyncExternalStore(installPromptStore.subscribe, installPromptStore.snapshot, () => "none" as const);
  return { state, prompt: installPromptStore.prompt };
}
