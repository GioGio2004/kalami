"use client";

/**
 * What the installed app and push notifications need from the browser:
 * platform sniffing (iPhones have no install API and get push only from the
 * Home Screen), the deferred install prompt Chrome hands us, and the key
 * conversion the Push API wants.
 */

/** The Push API wants the VAPID public key as bytes; the server hands it over as URL-safe base64. */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** iPhones and iPads (iPadOS reports itself as a Mac, with a touch screen). */
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Opened from the home screen (or installed on a computer), not in a browser tab. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Browsers hide service workers and push on plain http (localhost excepted): the usual trap when testing on a phone over the LAN. */
export function isSecure(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

/** In development the worker runs in its no-caching mode; push works the same. */
export const SERVICE_WORKER_URL = process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?mode=dev";

/**
 * The app's worker, registered if it isn't yet, and active. Registering twice
 * is fine (the browser returns the existing registration). Fails, instead of
 * hanging, when the browser never activates it (private browsing, a blocked
 * script), so the caller can say what to do.
 */
export async function ensureServiceWorker(timeoutMs = 8000): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) throw new Error("This browser has no service workers.");
  await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/" });
  return await new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Kalami's background worker didn't start.")), timeoutMs);
    navigator.serviceWorker.ready.then(
      (registration) => {
        clearTimeout(timer);
        resolve(registration);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// --- The install prompt -----------------------------------------------------------------
//
// Chrome fires `beforeinstallprompt` once, early, when the page qualifies. It is
// caught here at module load (the root layout imports this), kept, and offered
// to the dashboard's install card, which calls prompt() on tap.

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

export const installPromptStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** "prompt": Chrome will show its install dialog; "installed": just added; "none": no prompt here. */
  snapshot(): "prompt" | "installed" | "none" {
    return installed ? "installed" : deferredPrompt !== null ? "prompt" : "none";
  },
  async prompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
    const event = deferredPrompt;
    if (event === null) return "unavailable";
    deferredPrompt = null;
    notify();
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  },
};

// --- "Not now" ----------------------------------------------------------------------------

const DISMISS_KEY = "kalami-install-dismissed-until";

export function installDismissed(): boolean {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export function dismissInstall(days = 14): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
  } catch {
    // Private windows may refuse; the card just comes back next time.
  }
}
