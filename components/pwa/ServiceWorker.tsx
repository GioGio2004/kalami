"use client";

import { useEffect } from "react";
import { SERVICE_WORKER_URL } from "@/lib/pwa";

/**
 * Registers public/sw.js once the page is up. In development it registers the
 * worker in its no-caching mode (push still works, hot reloading keeps
 * working); in production the worker also keeps the app shell for offline.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/" }).catch(() => {
      // Without a worker the app still works in the browser; only offline and push are off.
    });
  }, []);
  return null;
}
