// Lapsr service worker — app-shell cache for offline + installable PWA.
// ponytail: bump CACHE on any shell change; cache-first for shell.
const CACHE = "lapsr-v73";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
  "./fonts/inter.woff2", "./fonts/jbmono.woff2"
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
self.addEventListener("notificationclick", (e) => {
  // "Start next" action on the session-done / break-over notification — focus the app
  // and let the page start the session (it owns the timer state), or cold-start via URL.
  e.notification.close();
  const wantStart = e.action === "start";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      const c = cs[0];
      if (c) { c.focus(); if (wantStart) c.postMessage({ cmd: "startNext" }); }
      else return clients.openWindow(wantStart ? "./index.html?start=next" : "./");
    })
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // cache-first; only cache OK responses (a transient 404/500 must never get pinned),
  // ignoreSearch so ./?test=1 etc. hit the shell entry instead of accumulating variants,
  // and the offline index.html fallback applies to navigations only — an image/font
  // request must fail cleanly, not decode HTML.
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit || fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        if (e.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      })
    )
  );
});
