import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, unlinkSync, rmdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server.js';

let server;
let database;
let origin;
let story;

before(async function () {
  const application = createApp({ databasePath: ':memory:' });
  database = application.database;
  server = await new Promise(function (resolve) {
    const listener = application.app.listen(0, '127.0.0.1', function () { resolve(listener); });
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  story = await (await fetch(`${origin}/api/story`)).json();
});

after(async function () {
  await new Promise(function (resolve) { server.close(resolve); });
  database.close();
});

function postVisit(body, headers = {}) {
  return fetch(`${origin}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

test('halaman, aset lokal, health, dan API cerita dapat dibuka dengan header keamanan', async function () {
  for (const path of ['/', '/assets/css/style.css', '/assets/js/main.js', '/assets/images/lereng-temanggung.svg', '/api/story', '/api/health']) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.deepEqual(await (await fetch(`${origin}/api/health`)).json(), { status: 'ok' });
});

test('struktur cerita lengkap dan seluruh rujukan internal serta foto valid', async function () {
  for (const key of ['meta', 'hero', 'bab', 'peta', 'motifHotspot', 'proses', 'galeri', 'kuis', 'misi', 'ideUsaha', 'sumber']) assert.ok(story[key], key);
  assert.equal(story.bab.length, 5);
  assert.equal(new Set(story.bab.map(function (chapter) { return chapter.id; })).size, 5);
  const sources = new Set(story.sumber.map(function (source) { return source.id; }));
  const photos = [story.hero.foto];
  for (const chapter of story.bab) {
    photos.push(chapter.foto);
    for (const fact of chapter.fakta) {
      for (const source of fact.sumberIds) assert.ok(sources.has(source), source);
    }
  }
  for (const item of story.galeri) photos.push(item.foto);
  for (const photo of photos) {
    assert.ok(photo.alt && photo.kredit);
    assert.ok(['sementara', 'siap'].includes(photo.status));
    assert.equal((await fetch(`${origin}${photo.src}`)).status, 200);
  }
  for (const question of story.kuis) {
    assert.ok(question.jawaban >= 0 && question.jawaban < question.pilihan.length);
    assert.equal(question.umpanBalik.length, question.pilihan.length);
  }
});

test('kunjungan menambah hitungan saja, dan tidak menyimpan identitas', async function () {
  const chapterId = story.bab[0].id;
  assert.equal((await postVisit({ chapterId })).status, 201);
  assert.equal((await postVisit({ chapterId })).status, 201);
  const row = database.prepare('SELECT * FROM chapter_visits WHERE chapter_id = ?').get(chapterId);
  assert.deepEqual(row, { chapter_id: chapterId, visits: 2 });
  const columns = database.prepare('PRAGMA table_info(chapter_visits)').all();
  assert.deepEqual(columns.map(function (column) { return column.name; }), ['chapter_id', 'visits']);
});

test('ID asing, SQL, data pribadi, array, dan field tambahan ditolak', async function () {
  const totalBefore = database.prepare('SELECT SUM(visits) AS total FROM chapter_visits').get().total;
  for (const body of [{}, { chapterId: 'asing' }, { chapterId: "'; DROP TABLE chapter_visits; --" }, { chapterId: story.bab[0].id, nickname: 'Rahasia' }, [], { chapterId: 1 }, { chapterId: {} }]) {
    const response = await postVisit(body);
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
  assert.equal(database.prepare('SELECT SUM(visits) AS total FROM chapter_visits').get().total, totalBefore);
});

test('body besar, JSON rusak, format salah, dan origin luar ditolak', async function () {
  assert.equal((await postVisit({ chapterId: 'x'.repeat(1500) })).status, 413);
  const malformed = await fetch(`${origin}/api/visit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{rusak' });
  assert.equal(malformed.status, 400);
  assert.equal((await postVisit({ chapterId: story.bab[0].id }, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await postVisit({ chapterId: story.bab[0].id }, { Origin: 'https://example.org' })).status, 403);
  assert.equal((await postVisit({ chapterId: story.bab[0].id }, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
});

test('database dan file server tidak terekspos sebagai file statis', async function () {
  for (const path of ['/server.js', '/package.json', '/data/story.json', '/data/jejak-mbako.db', '/.env', '/api/tidak-ada']) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Halaman atau alamat API tidak ditemukan.' });
  }
});

test('SQLite mempertahankan hitungan setelah koneksi dibuka ulang', function () {
  const directory = mkdtempSync(join(tmpdir(), 'jejak-mbako-test-'));
  const path = join(directory, 'test.db');
  const first = createApp({ databasePath: path });
  first.database.prepare('INSERT INTO chapter_visits (chapter_id, visits) VALUES (?, ?)').run(story.bab[0].id, 7);
  first.database.close();
  const second = createApp({ databasePath: path });
  assert.equal(second.database.prepare('SELECT visits FROM chapter_visits').get().visits, 7);
  second.database.close();
  for (const file of [path, `${path}-wal`, `${path}-shm`]) {
    if (existsSync(file)) unlinkSync(file);
  }
  rmdirSync(directory);
});

test('rate limit menghentikan banjir kunjungan tanpa menyimpan IP', async function () {
  let limited;
  for (let index = 0; index < 121; index += 1) {
    const response = await postVisit({ chapterId: story.bab[1].id });
    if (response.status === 429) {
      limited = response;
      break;
    }
    assert.equal(response.status, 201);
  }
  assert.ok(limited);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal((await fetch(`${origin}/api/health`)).status, 200);
});
