// ACTure Service Worker
const CACHE_NAME = "acture-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

// Push notification 수신
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "ACTure";
  const options = {
    body: data.body || "식사를 기록해보세요!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "acture-notification",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 시 앱 열기
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || "/");
    })
  );
});
