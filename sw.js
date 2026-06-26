// Lapsr service worker — app-shell cache for offline + installable PWA.
// ponytail: bump CACHE on any shell change; cache-first for shell + CDN libs.
const CACHE = "lapsr-v36";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "https://cdn.jsdelivr.net/npm/chart.js@4"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // cache-first for the shell + CDN libs; fall back to network and cache new GETs
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
