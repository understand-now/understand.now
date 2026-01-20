loadBooks = async () => {
  const lines = (await (await fetch("/book.md")).text()).trim().split("\n");
  const files = [];
  let book;
  let chapter;
  let section;
  lines.forEach((l, i) => {
    if (l.startsWith("Book ")) {
      book = l.trim();
    } else if (l.startsWith("  Chapter ")) {
      chapter = l.trim();
    } else {
      section = l.trim();
      files.push(`/${book}/${chapter}/${section}.md`);
    }
  });

  return files;
};

const CACHE_NAME = 'site_assets_v1';
const site = [
  '/',
  '/404.html',
  '/apple-touch-icon.png',
  '/book.md',
  '/favicon-96x96.png',
  '/favicon.ico',
  '/favicon.svg',
  '/for-love.js',
  '/index.html',
  '/offline.html',
  '/script.js',
  '/site.webmanifest',
  '/style.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const files = site.concat(await loadBooks());
      return cache.addAll(files);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Offline only, and return the index for all 404s! :D
      return response || caches.match("/index.html"); // || fetch(event.request);
    })
  );
});
