"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";
import { ensureServiceWorker, isIos, isSecure, isStandalone, pushSupported, urlBase64ToUint8Array } from "@/lib/pwa";

/**
 * Where push stands on this device:
 * - loading: still finding out
 * - insecure: a plain http address (not localhost); browsers hide push there
 * - unavailable: the server has no push keys yet
 * - unsupported: this browser can't do push
 * - needs-install: an iPhone in Safari; push only works from the Home Screen app
 * - no-worker: the browser wouldn't start Kalami's background worker
 * - blocked: the person said no in the browser; only the browser's settings can undo that
 * - off / on: for this device
 */
export type PushState =
  | "loading"
  | "insecure"
  | "unavailable"
  | "unsupported"
  | "needs-install"
  | "no-worker"
  | "blocked"
  | "off"
  | "on";

const noChange = () => () => undefined;

function sameKey(current: ArrayBuffer | null, wanted: Uint8Array): boolean {
  if (current === null) return false;
  const bytes = new Uint8Array(current);
  return bytes.length === wanted.length && bytes.every((b, i) => b === wanted[i]);
}

export function usePush() {
  const secure = useSyncExternalStore(noChange, isSecure, () => true);
  const supported = useSyncExternalStore(noChange, pushSupported, () => false);
  const key = useQuery(api.push.vapidPublicKey, {});
  const devices = useQuery(api.push.mine, {});
  const subscribeDevice = useMutation(api.push.subscribe);
  const unsubscribeDevice = useMutation(api.push.unsubscribe);
  const requestTest = useMutation(api.push.requestTest);
  // Whether the worker is up; this device's subscription endpoint (null when there is none).
  const [worker, setWorker] = useState<"pending" | "ready" | "failed">("pending");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    ensureServiceWorker()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (cancelled) return;
        setPermission(Notification.permission);
        setEndpoint(subscription?.endpoint ?? null);
        setWorker("ready");
      })
      .catch(() => {
        if (!cancelled) setWorker("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [supported]);

  let state: PushState;
  if (!secure) state = "insecure";
  else if (!supported) state = isIos() && !isStandalone() ? "needs-install" : "unsupported";
  else if (key === null) state = "unavailable";
  else if (worker === "failed") state = "no-worker";
  else if (key === undefined || devices === undefined || worker === "pending") state = "loading";
  else if (permission === "denied") state = "blocked";
  else if (endpoint !== null && devices.some((device) => device.endpoint === endpoint)) state = "on";
  else state = "off";

  async function enable() {
    if (!key) return;
    setBusy(true);
    setError(null);
    setTested(null);
    try {
      // The permission prompt first, while the tap still counts as a gesture.
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
      const registration = await ensureServiceWorker();
      const wanted = urlBase64ToUint8Array(key);
      let subscription = await registration.pushManager.getSubscription();
      // A subscription made with an older key can't be used by this server: start afresh.
      if (subscription !== null && !sameKey(subscription.options.applicationServerKey, wanted)) {
        await subscription.unsubscribe();
        subscription = null;
      }
      if (subscription === null) {
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: wanted });
      }
      const json = subscription.toJSON();
      if (!json.keys?.p256dh || !json.keys.auth) throw new Error("The browser gave no encryption keys for this device.");
      await subscribeDevice({
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        userAgent: navigator.userAgent,
      });
      setEndpoint(subscription.endpoint);
      setWorker("ready");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    setTested(null);
    try {
      const registration = await ensureServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription !== null) {
        await unsubscribeDevice({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setEndpoint(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setError(null);
    try {
      const count = await requestTest();
      setTested(
        count === 0
          ? "No device has notifications on."
          : `Sent to ${count} device${count === 1 ? "" : "s"}. It should arrive in a moment.`,
      );
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return { state, busy, error, tested, enable, disable, test };
}
