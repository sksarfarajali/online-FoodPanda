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
