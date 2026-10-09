import express from 'express';
import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const story = JSON.parse(readFileSync(join(projectDirectory, 'data/story.json'), 'utf8'));
const chapterIds = new Set(story.bab.map(function (chapter) { return chapter.id; }));

export function createApp(options = {}) {
  const databasePath = options.databasePath || join(projectDirectory, 'data/jejak-mbako.db');
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.exec('CREATE TABLE IF NOT EXISTS chapter_visits (chapter_id TEXT PRIMARY KEY, visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0))');
  const incrementVisit = database.prepare('INSERT INTO chapter_visits (chapter_id, visits) VALUES (?, 1) ON CONFLICT(chapter_id) DO UPDATE SET visits = visits + 1');
  const checkDatabase = database.prepare('SELECT 1 AS ready');
  const app = express();
  let requestCount = 0;
  let windowStarted = Date.now();

  app.disable('x-powered-by');
  app.use(function (request, response, next) {
    response.set({
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    });
    next();
  });

  app.use('/api', function (request, response, next) {
    response.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', function (request, response) {
    checkDatabase.get();
    response.json({ status: 'ok' });
  });

  app.get('/api/story', function (request, response) {
    response.json(story);
  });

  app.post('/api/visit', function (request, response, next) {
    if (request.get('sec-fetch-site') === 'cross-site') {
      return response.status(403).json({ error: 'Permintaan harus berasal dari aplikasi ini.' });
    }
    const origin = request.get('origin');
    if (origin && origin !== `${request.protocol}://${request.get('host')}`) {
      return response.status(403).json({ error: 'Asal permintaan tidak diizinkan.' });
    }
    if (Date.now() - windowStarted >= 60000) {
      windowStarted = Date.now();
      requestCount = 0;
    }
    requestCount += 1;
    if (requestCount > 120) {
      const secondsLeft = Math.max(1, Math.ceil((60000 - (Date.now() - windowStarted)) / 1000));
      response.set('Retry-After', String(secondsLeft));
      return response.status(429).json({ error: 'Terlalu banyak kunjungan. Silakan coba sebentar lagi.' });
    }
    if (!request.is('application/json')) {
      return response.status(415).json({ error: 'Gunakan format JSON.' });
    }
    next();
  }, express.json({ limit: '1kb', strict: true, inflate: false }), function (request, response) {
    const body = request.body;
    if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !chapterIds.has(body.chapterId)) {
      return response.status(400).json({ error: 'Kirim hanya chapterId dari daftar bab yang tersedia.' });
    }
    incrementVisit.run(body.chapterId);
    response.status(201).json({ ok: true });
  });

  app.use(express.static(join(projectDirectory, 'public'), { dotfiles: 'deny', index: 'index.html' }));
  app.use(function (request, response) {
    response.status(404).json({ error: 'Halaman atau alamat API tidak ditemukan.' });
  });
  app.use(function (error, request, response, next) {
    if (response.headersSent) return next(error);
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Data terlalu besar. Batasnya 1 KB.' });
    }
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'Format JSON tidak valid.' });
    }
    if (error.status === 415) {
      return response.status(415).json({ error: 'Format atau kompresi data tidak didukung.' });
    }
    response.status(500).json({ error: 'Server mengalami kendala. Silakan coba kembali.' });
  });
  return { app, database };
}

function warnTemporaryPhotos() {
  const photos = [story.hero.foto];
  for (const chapter of story.bab) photos.push(chapter.foto);
  for (const item of story.galeri) photos.push(item.foto);
  const temporaryPhotos = photos.filter(function (photo) { return photo.status === 'sementara'; });
  if (temporaryPhotos.length === 0) return;
  console.warn('Foto sementara: ganti dengan foto berizin sebelum pengumpulan.');
  for (const photo of temporaryPhotos) console.warn(`- ${photo.id}: ${photo.src}`);
}

function startServer() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT harus berupa bilangan antara 1 dan 65535.');
    process.exitCode = 1;
    return;
  }
  try {
    const { app, database } = createApp();
    const server = app.listen(port, process.env.HOST || '127.0.0.1', function () {
      console.log(`Jejak Mbako siap di http://localhost:${port}`);
      warnTemporaryPhotos();
    });
    server.on('error', function () {
      console.error('Server belum dapat berjalan. Periksa apakah port sedang dipakai.');
      database.close();
      process.exitCode = 1;
    });
    function shutdown() {
      server.close(function () { database.close(); });
    }
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch {
    console.error('Server belum dapat disiapkan. Periksa instalasi dependensi dan izin folder data.');
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) startServer();
