// ══════════════════════════════════════════
// Grateful 서비스 워커 — sw.js
// GitHub Pages 배포용 (MIME: application/javascript)
// ══════════════════════════════════════════

const CACHE_NAME = 'grateful-v1';

let _swTimer = null;
let _swSchedule = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  Promise.all([
    self.clients.claim(),
    // 이전 버전 캐시 삭제
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  ])
));

// 오프라인 캐시 (index.html + 아이콘)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // 같은 origin의 핵심 파일만 캐시
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});

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
      icon: self.registration.scope + 'icons/icon-192.png',
      badge: self.registration.scope + 'icons/icon-192.png',
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

self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'SET_REMINDER')    _scheduleSW(d.schedule);
  if (d.type === 'CANCEL_REMINDER') { clearTimeout(_swTimer); _swTimer = null; }
  if (d.type === 'TEST_REMINDER') {
    self.registration.showNotification('테스트 알림 🌿', {
      body: '백그라운드 알림이 정상 작동해요 ✦',
      tag: 'grateful-test',
    });
  }
  if (d.type === 'CHECK_TODAY') {
    // index.html에서 오는 오늘 기록 확인 요청에 응답
  }
});

self.addEventListener('push', e => {
  const d = e.data?.json() || {};
  e.waitUntil(self.registration.showNotification(
    d.title || '오늘의 감사를 기록해 보세요 🌿',
    { body: d.body || '하루의 따뜻한 순간들을 기억해요 ✦', tag: 'grateful-push' }
  ));
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'grateful-daily-reminder') e.waitUntil(_fireReminder());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const w = list.find(c => 'focus' in c);
      return w ? w.focus() : self.clients.openWindow(self.registration.scope);
    })
  );
});
