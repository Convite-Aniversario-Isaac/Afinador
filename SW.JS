// Afinador Múltiplo: funciona sem internet depois da primeira visita.
// Ao publicar uma versão nova, troque o número abaixo (v2, v3...) para os celulares atualizarem.
const CACHE = 'afinador-multiplo-v5';
const ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icone.png', 'icone-192.png', 'icone-maskable.png', 'privacidade.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Página: tenta a internet primeiro (pega atualizações), usa a cópia salva se estiver offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // Ícones e fontes: usa a cópia salva, busca na internet se não tiver
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
    if (resp.ok && (new URL(req.url).origin === location.origin )) {
      const copia = resp.clone(); caches.open(CACHE).then(c => c.put(req, copia));
    }
    return resp;
  })));
});
