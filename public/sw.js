/* global self, caches, clients, URL, Response */
// Kalami's service worker: the installed app's shell offline, and push notifications.
//
// Caching, in production only:
//   - Page loads go to the network; when that fails, the cached /offline page.
//   - Next's hashed static files (/_next/static) are cached on first use and
//     served from the cache after that: they never change under one name.
//   - Icons and the manifest are precached and refreshed in the background.
//   - Everything else (Convex, Clerk, API routes, other origins) is never touched.
// In development (registered as /sw.js?mode=dev) nothing is cached, so hot
// reloading keeps working; push still arrives.
//
// Push: the backend (kalami-stuff convex/pushDelivery.ts) sends
// { title, body, url, tag, lang }; a tap opens `url` in the app's window.

const VERSION = "kalami-sw-v1";
const CACHE = `${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/badge-96.png"];
const DEV = new URL(self.location.href).searchParams.get("mode") === "dev";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      if (!DEV) {
        const cache = await caches.open(CACHE);
        await Promise.all(
          PRECACHE.map(async (url) => {
            try {
              await cache.add(new Request(url, { cache: "reload" }));
            } catch {
              // A missing file must not stop the worker from installing.
            }
          }),
        );
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      if ("navigationPreload" in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          // Not everywhere.
        }
      }
      await clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/** Only our own pages and files; never the backend, auth or API traffic. */
function ours(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  if (path.startsWith("/api/") || path.startsWith("/__clerk") || path.startsWith("/dev/")) return false;
  if (path.startsWith("/_next/webpack-hmr") || path.includes("hot-update")) return false;
  return true;
}

function isStatic(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isAsset(url) {
  const path = url.pathname;
  return (
    path.startsWith("/icons/") ||
    path.startsWith("/_next/image") ||
    path === "/manifest.webmanifest" ||
    path === "/icon.svg" ||
    path === "/apple-icon.png" ||
    path === "/favicon.ico" ||
    path === "/phone-frame.png"
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return hit || (await refresh) || Response.error();
}

async function pageOrOffline(event) {
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;
    return await fetch(event.request);
  } catch {
    const cache = await caches.open(CACHE);
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  if (DEV) return;
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!ours(url)) return;
  if (request.mode === "navigate") {
    event.respondWith(pageOrOffline(event));
  } else if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// --- Push --------------------------------------------------------------------------------

function parsePush(event) {
  try {
    const data = event.data ? event.data.json() : {};
    return {
      title: typeof data.title === "string" && data.title ? data.title : "Kalami",
      body: typeof data.body === "string" ? data.body : "",
      url: typeof data.url === "string" ? data.url : "/dashboard",
      tag: typeof data.tag === "string" ? data.tag : undefined,
      lang: data.lang === "ka" ? "ka" : "en",
    };
  } catch {
    return { title: "Kalami", body: event.data ? event.data.text() : "", url: "/dashboard", tag: undefined, lang: "en" };
  }
}

self.addEventListener("push", (event) => {
  const message = parsePush(event);
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: message.tag,
      lang: message.lang,
      data: { url: message.url },
    }),
  );
});

/** Opens the notification's page in the app's window if one is open, or a new one. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : "/dashboard", self.location.origin);
  // Only our own pages: a payload can't send the student elsewhere.
  const url = target.origin === self.location.origin ? target.href : `${self.location.origin}/dashboard`;
  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(url);
            } catch {
              // Some browsers refuse; the window is focused at least.
            }
          }
          return;
        }
      }
      await clients.openWindow(url);
    })(),
  );
});

// The push service rotated the subscription: the app re-registers it on its next open (usePush).
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const options = event.oldSubscription ? event.oldSubscription.options : null;
      if (!options || !options.applicationServerKey) return;
      try {
        await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: options.applicationServerKey });
      } catch {
        // Then the next app open asks again.
      }
    })(),
  );
});
