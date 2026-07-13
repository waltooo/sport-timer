// Service worker — precache l'app shell + images d'exercices → 100% offline.
// Bump la version pour forcer la mise à jour du cache.
const CACHE = 'sport-timer-v2'
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/timer.js',
  './js/data.js',
  './js/ex-images.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/ex/bear_crawl-0.jpg',
  './icons/ex/bear_crawl-1.jpg',
  './icons/ex/bicycle-0.jpg',
  './icons/ex/bicycle-1.jpg',
  './icons/ex/crunchs-0.jpg',
  './icons/ex/crunchs-1.jpg',
  './icons/ex/dips-0.jpg',
  './icons/ex/dips-1.jpg',
  './icons/ex/fentes_arriere-0.jpg',
  './icons/ex/fentes_arriere-1.jpg',
  './icons/ex/fentes_marchees-0.jpg',
  './icons/ex/fentes_marchees-1.jpg',
  './icons/ex/mollets-0.jpg',
  './icons/ex/mollets-1.jpg',
  './icons/ex/mountain_climbers-0.jpg',
  './icons/ex/mountain_climbers-1.jpg',
  './icons/ex/planche-0.jpg',
  './icons/ex/planche-1.jpg',
  './icons/ex/planche_laterale-0.jpg',
  './icons/ex/planche_laterale-1.jpg',
  './icons/ex/pompes-0.jpg',
  './icons/ex/pompes-1.jpg',
  './icons/ex/pompes_diamant-0.jpg',
  './icons/ex/pompes_diamant-1.jpg',
  './icons/ex/pont_dynamique-0.jpg',
  './icons/ex/pont_dynamique-1.jpg',
  './icons/ex/pont_fessier-0.jpg',
  './icons/ex/pont_fessier-1.jpg',
  './icons/ex/rdl-0.jpg',
  './icons/ex/rdl-1.jpg',
  './icons/ex/releves_jambes-0.jpg',
  './icons/ex/releves_jambes-1.jpg',
  './icons/ex/rowing-0.jpg',
  './icons/ex/rowing-1.jpg',
  './icons/ex/russian_twists-0.jpg',
  './icons/ex/russian_twists-1.jpg',
  './icons/ex/shoulder_taps-0.jpg',
  './icons/ex/shoulder_taps-1.jpg',
  './icons/ex/speed_skaters-0.jpg',
  './icons/ex/speed_skaters-1.jpg',
  './icons/ex/squats-0.jpg',
  './icons/ex/squats-1.jpg',
  './icons/ex/squats_sautes-0.jpg',
  './icons/ex/squats_sautes-1.jpg',
  './icons/ex/superman-0.jpg',
  './icons/ex/superman-1.jpg',
  './icons/ex/superman_tirage-0.jpg',
  './icons/ex/superman_tirage-1.jpg',
  './icons/ex/walkouts-0.jpg',
  './icons/ex/walkouts-1.jpg'
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {})
        return res
      }).catch(() => caches.match('./index.html'))
    )
  )
})
