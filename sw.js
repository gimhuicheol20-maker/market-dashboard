/* 시스템 트레이딩 앱: 푸시 알림 받기 + 오프라인일 때 마지막으로 본 화면 보여주기 */
var CACHE = "md-v1";

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 항상 새 데이터를 먼저 받고, 인터넷이 안 될 때만 저장해 둔 것을 보여줘요.
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true });
    })
  );
});

self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  var title = d.title || "시스템 트레이딩";
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    icon: "assets/icons/icon-192.png",
    badge: "assets/icons/badge-96.png",
    tag: d.tag || undefined,
    data: { url: d.url || "index.html" }
  }));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || "index.html", self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ("focus" in list[i]) { list[i].navigate(url); return list[i].focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
