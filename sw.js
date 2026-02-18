
const CACHE_NAME = 'adaptu-crm-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// ESCUTA MENSAGENS DO APP PARA MOSTRAR NOTIFICAÇÃO
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon } = event.data.payload;
    
    const options = {
      body: body,
      icon: icon || 'https://lh3.googleusercontent.com/d/1suIG32h-jC6OdCnx5Xfz9CzGi7gKqEkO',
      badge: 'https://lh3.googleusercontent.com/d/1suIG32h-jC6OdCnx5Xfz9CzGi7gKqEkO',
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450],
      tag: 'urgent-lead',
      renotify: true,
      requireInteraction: true,
      priority: 2, // Prioridade máxima para Android
      data: { url: '/' }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
