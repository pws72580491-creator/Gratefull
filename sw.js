// ══════════════════════════════════════════
// Grateful 서비스 워커 — sw.js
// ══════════════════════════════════════════

// 버전을 올리면 이전 캐시가 자동 삭제됩니다
const CACHE_VERSION = 'v5';
const CACHE_NAME = `grateful-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png',
];

// 설치 시 새 캐시 저장
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW] 일부 캐시 실패 (무시):', err);
      });
    })
  );
});

// 활성화 시 이전 버전 캐시 전부 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] 이전 캐시 삭제:', key);
              return caches.delete(key);
            }
          })
        )
      )
    ])
  );
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// 알림 스케줄러
let _swTimer = null;
let _swSchedule = null;

function _msUntil(h, m) {
  const now = new Date(), t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return t - now;
}

async function _fireReminder() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  let hasRecord = false;
  if (clients.length > 0) {
    hasRecord = await new Promise(res => {
      const mc = new MessageChannel();
      mc.port1.onmessage = e => res(!!e.data?.hasRecord);
      clients[0].postMessage({ type: 'CHECK_TODAY' }, [mc.port2]);
      setTimeout(() => res(false), 2000);
    });
  }
  if (!hasRecord) {
    await self.registration.showNotification('오늘의 감사를 기록해 보세요 🌿', {
      body: '하루의 따뜻한 순간들을 기억해요 ✦',
      icon: self.registration.scope + 'icon-192.png',
      badge: self.registration.scope + 'icon-192.png',
      tag: 'grateful-reminder',
      vibrate: [200, 100, 200],
    });
  }
  _scheduleSW(_swSchedule);
}

function _scheduleSW(s) {
  clearTimeout(_swTimer); _swTimer = null; _swSchedule = s;
  if (!s?.on || !s?.time) return;
  const [h, m] = s.time.split(':').map(Number);
  _swTimer = setTimeout(() => _fireReminder(), _msUntil(h, m));
}

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'SET_REMINDER')    _scheduleSW(d.schedule);
  if (d.type === 'CANCEL_REMINDER') { clearTimeout(_swTimer); _swTimer = null; }
  if (d.type === 'TEST_REMINDER') {
    self.registration.showNotification('테스트 알림 🌿', {
      body: '알림이 정상 작동해요 ✦', tag: 'grateful-test'
    });
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const w = list.find(c => 'focus' in c);
      return w ? w.focus() : self.clients.openWindow(self.registration.scope);
    })
  );
});
