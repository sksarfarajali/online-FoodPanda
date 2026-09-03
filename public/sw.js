// Minimal service worker: offline fallback only, NOT an app-shell cache.
//
// This app's content (menu, prices, availability, orders, settings) is live, admin-editable
// data — caching pages or API responses here would risk showing stale prices/availability
// offline, which is worse than showing nothing. So this worker does exactly one thing: if a
// page navigation fails because the network is unreachable, show a static offline notice
// instead of the browser's default error page. Everything else always goes to the network.

const OFFLINE_URL = "/offline.html";
const CACHE_NAME = "offline-fallback-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});

// --- Web Push: order/rider status notifications, delivered even with no tab open ---

self.addEventListener("push", (event) => {
  let data = { title: "Swaad-e-Mehfil", body: "You have an update.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
