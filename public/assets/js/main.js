const storageKeys = {
  nickname: 'jejak-mbako.nickname',
  storyProgress: 'jejak-mbako.story-progress',
  missionProgress: 'jejak-mbako.mission-progress',
  quizResult: 'jejak-mbako.quiz-result'
};
const memoryStorage = {};
const visitedChapters = new Set();
let storyData;
let storyProgress = { read: [], current: null };
let chapterObserver;
let activeHotspot;
let parallaxAnimation;
let isLoading = false;

function readLocalData(name, fallback) {
  if (!Object.hasOwn(storageKeys, name)) return fallback;
  try {
    const value = localStorage.getItem(storageKeys[name]);
    if (value === null) return memoryStorage[name] ?? fallback;
    return JSON.parse(value);
  } catch {
    document.getElementById('storage-notice').hidden = false;
    return memoryStorage[name] ?? fallback;
  }
}

function saveLocalData(name, value) {
  if (!Object.hasOwn(storageKeys, name)) return;
  memoryStorage[name] = value;
  try {
    localStorage.setItem(storageKeys[name], JSON.stringify(value));
  } catch {
    document.getElementById('storage-notice').hidden = false;
  }
}

function removeLocalData(name) {
  if (!Object.hasOwn(storageKeys, name)) return;
  delete memoryStorage[name];
  try {
    localStorage.removeItem(storageKeys[name]);
  } catch {
    document.getElementById('storage-notice').hidden = false;
  }
}

function loadProgress() {
  const saved = readLocalData('storyProgress', {});
  const validIds = new Set(storyData.bab.map(function (chapter) { return chapter.id; }));
  const read = [];
  if (saved && Array.isArray(saved.read)) {
    for (const id of saved.read) {
      if (validIds.has(id) && !read.includes(id)) read.push(id);
    }
  }
  const current = saved && validIds.has(saved.current) ? saved.current : null;
  storyProgress = { read, current };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getImagePath(photo, fallback) {
  if (typeof photo.src !== 'string') return fallback;
  if (!photo.src.startsWith('/assets/images/') || photo.src.includes('..') || photo.src.includes('\\')) return fallback;
  return photo.src;
}

function configurePhoto(image, badge, photo, fallback) {
  const source = getImagePath(photo, fallback);
  image.alt = photo.alt;
  badge.hidden = photo.status === 'siap';
  image.addEventListener('error', function () {
    badge.hidden = false;
    badge.textContent = 'foto sementara';
    image.alt = 'Ilustrasi pengganti; foto belum tersedia.';
    if (image.getAttribute('src') !== fallback) image.src = fallback;
  });
  image.src = source;
}

function closeHotspot(restoreFocus = false) {
  document.getElementById('hotspot-panel').hidden = true;
  if (activeHotspot) {
    activeHotspot.setAttribute('aria-expanded', 'false');
    if (restoreFocus) activeHotspot.focus();
  }
  activeHotspot = null;
}

function renderHero() {
  const hero = storyData.hero;
  document.getElementById('hero-eyebrow').textContent = hero.eyebrow;
  const title = document.getElementById('hero-title');
  const words = hero.judul.split(' ');
  title.replaceChildren(document.createTextNode(`${words.shift()} `), createElement('em', '', `${words.join(' ')}.`));
  document.getElementById('hero-tagline').textContent = hero.subjudul;
  document.getElementById('hero-description').textContent = hero.deskripsi;
  document.getElementById('hero-visual-note').textContent = hero.catatanVisual;
  const startLink = document.getElementById('start-story');
  startLink.replaceChildren(document.createTextNode(`${hero.tombol} `), createElement('span', '', '↗'));
  startLink.lastChild.setAttribute('aria-hidden', 'true');
  startLink.href = `#${storyData.bab[0].id}`;
  configurePhoto(document.getElementById('hero-image'), document.getElementById('hero-photo-badge'), hero.foto, '/assets/images/lereng-temanggung.svg');
  const container = document.getElementById('hero-hotspots');
  container.replaceChildren();
  for (const hotspot of hero.hotspot) {
    const button = createElement('button', `hotspot hotspot-${hotspot.id}`);
    const symbol = createElement('span', 'hotspot-symbol', '+');
    const label = createElement('span', 'hotspot-label', hotspot.label);
    symbol.setAttribute('aria-hidden', 'true');
    label.setAttribute('aria-hidden', 'true');
    button.append(symbol, label);
    button.type = 'button';
    button.setAttribute('aria-label', hotspot.label);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'hotspot-panel');
    button.addEventListener('click', function () {
      const wasOpen = activeHotspot === button;
      closeHotspot();
      if (wasOpen) return;
      document.getElementById('hotspot-title').textContent = hotspot.label;
      document.getElementById('hotspot-description').textContent = hotspot.teks;
      document.getElementById('hotspot-panel').hidden = false;
      button.setAttribute('aria-expanded', 'true');
      activeHotspot = button;
    });
    container.append(button);
  }
}

function renderChapterPhoto(chapter) {
  const figure = createElement('figure', 'chapter-visual');
  const frame = createElement('div', 'photo-window');
  const image = createElement('img');
  image.width = chapter.foto.lebar || 800;
  image.height = chapter.foto.tinggi || 600;
  image.loading = 'lazy';
  image.decoding = 'async';
  const badge = createElement('span', 'photo-badge', 'foto sementara');
  configurePhoto(image, badge, chapter.foto, '/assets/images/placeholder.svg');
  frame.append(image, badge);
  const caption = createElement('figcaption');
  if (chapter.catatanVisual) caption.append(createElement('span', 'photo-note', chapter.catatanVisual));
  const credit = createElement('details', 'photo-credit');
  credit.append(createElement('summary', '', 'Tentang foto'), createElement('p', '', chapter.foto.kredit));
  const original = createElement('a', '', 'Lihat foto utuh ↗');
  original.href = getImagePath(chapter.foto, '/assets/images/placeholder.svg');
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  credit.append(original);
  caption.append(credit);
  figure.append(frame, caption);
  return figure;
}

function renderNarrative(chapter) {
  const narrative = createElement('div', 'chapter-narrative');
  for (const paragraph of chapter.isi) {
    const text = createElement('p', '', paragraph.teks);
    for (const sourceId of paragraph.sumberIds) {
      const sourceIndex = storyData.sumber.findIndex(function (source) { return source.id === sourceId; });
      if (sourceIndex === -1) continue;
      const reference = createElement('a', 'source-reference', `[${sourceIndex + 1}]`);
      reference.href = `#source-${sourceId}`;
      reference.setAttribute('aria-label', `Rujukan ${sourceIndex + 1}: ${storyData.sumber[sourceIndex].judul}`);
      text.append(document.createTextNode(' '), reference);
    }
    narrative.append(text);
  }
  const reflection = createElement('aside', 'chapter-reflection');
  reflection.setAttribute('aria-label', 'Untuk direnungkan');
  reflection.append(createElement('span', 'eyebrow', 'SEJENAK SEBELUM MELANJUTKAN'), createElement('p', '', chapter.renungan));
  narrative.append(reflection);
  return narrative;
}

function renderManifesto(chapter) {
  const manifesto = createElement('div', 'youth-manifesto');
  const year = createElement('span', 'manifesto-year', '2045');
  year.setAttribute('aria-hidden', 'true');
  const title = createElement('h4', '', chapter.manifesto.judul);
  manifesto.append(year, createElement('p', 'eyebrow', 'MASA DEPAN PUNYA JEJAKMU'), title, createElement('p', 'manifesto-intro', chapter.manifesto.pengantar));
  for (const [index, step] of chapter.manifesto.langkah.entries()) {
    const details = createElement('details', 'manifesto-step');
    const summary = createElement('summary');
    summary.append(createElement('span', 'step-number', `0${index + 1}`), createElement('span', '', step.judul));
    const plus = createElement('span', 'step-plus', '+');
    plus.setAttribute('aria-hidden', 'true');
    summary.append(plus);
    details.append(summary, createElement('p', '', step.teks));
    manifesto.append(details);
  }
  manifesto.append(createElement('p', 'manifesto-signature', 'SATU CERITA LOKAL. SATU LANGKAH NYATA.'));
  return manifesto;
}

function renderChapter(chapter, index) {
  const section = createElement('article', `chapter chapter-${chapter.nomor}`);
  section.id = chapter.id;
  section.setAttribute('aria-labelledby', `${chapter.id}-title`);
  const heading = createElement('div', 'chapter-heading');
  const headingCopy = createElement('div');
  headingCopy.append(createElement('p', 'eyebrow', `BAB ${chapter.nomor} / ${chapter.label}`));
  const title = createElement('h3', '', chapter.judul);
  title.id = `${chapter.id}-title`;
  headingCopy.append(title);
  const number = createElement('span', 'chapter-number', chapter.nomor);
  number.setAttribute('aria-hidden', 'true');
  heading.append(headingCopy, number);
  const visual = renderChapterPhoto(chapter);
  const actions = createElement('div', 'chapter-actions');
  const markButton = createElement('button', 'button', 'Tandai sudah dibaca');
  markButton.type = 'button';
  markButton.dataset.chapterId = chapter.id;
  markButton.setAttribute('aria-label', `Tandai sudah dibaca: ${chapter.judul}`);
  markButton.setAttribute('aria-pressed', 'false');
  markButton.addEventListener('click', function () {
    const readIndex = storyProgress.read.indexOf(chapter.id);
    if (readIndex === -1) storyProgress.read.push(chapter.id);
    else storyProgress.read.splice(readIndex, 1);
    storyProgress.current = chapter.id;
    saveLocalData('storyProgress', storyProgress);
    updateProgress();
  });
  actions.append(markButton);
  if (index > 0) {
    const previous = createElement('a', '', '← Sebelumnya');
    previous.href = `#${storyData.bab[index - 1].id}`;
    actions.append(previous);
  }
  const next = createElement('a', '', index < storyData.bab.length - 1 ? 'Lanjut →' : 'Lihat perjalanan berikutnya →');
  next.href = index < storyData.bab.length - 1 ? `#${storyData.bab[index + 1].id}` : '#perjalanan';
  actions.append(next);
  const content = createElement('div', 'chapter-content');
  content.append(createElement('p', 'chapter-summary', chapter.ringkasan), renderNarrative(chapter));
  if (chapter.visual === 'manifesto') content.append(renderManifesto(chapter));
  content.append(actions);
  section.append(heading, visual, content);
  return section;
}

function renderChapters() {
  const navigation = document.getElementById('chapter-nav');
  const chapters = document.getElementById('chapters');
  navigation.replaceChildren();
  chapters.replaceChildren();
  for (const [index, chapter] of storyData.bab.entries()) {
    const link = createElement('a', 'chapter-nav-link');
    link.href = `#${chapter.id}`;
    link.dataset.chapterId = chapter.id;
    link.append(createElement('span', '', chapter.nomor), createElement('span', '', chapter.judul));
    link.addEventListener('click', function () { activateChapter(chapter.id); });
    navigation.append(link);
    chapters.append(renderChapter(chapter, index));
  }
}

function updateProgress() {
  const total = storyData.bab.length;
  const count = storyProgress.read.length;
  const progress = document.getElementById('story-progress');
  progress.max = total;
  progress.value = count;
  progress.textContent = `${count} dari ${total} bab`;
  document.getElementById('progress-label').textContent = `${count} dari ${total} bab sudah dibaca`;
  for (const link of document.querySelectorAll('.chapter-nav-link')) {
    link.classList.toggle('is-read', storyProgress.read.includes(link.dataset.chapterId));
    if (link.dataset.chapterId === storyProgress.current) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  }
  for (const button of document.querySelectorAll('.chapter-actions button')) {
    const isRead = storyProgress.read.includes(button.dataset.chapterId);
    const chapter = storyData.bab.find(function (item) { return item.id === button.dataset.chapterId; });
    button.setAttribute('aria-pressed', String(isRead));
    button.textContent = isRead ? 'Sudah dibaca ✓' : 'Tandai sudah dibaca';
    button.setAttribute('aria-label', `${isRead ? 'Batalkan tanda sudah dibaca' : 'Tandai sudah dibaca'}: ${chapter.judul}`);
  }
  const resume = document.getElementById('resume-story');
  const current = storyData.bab.find(function (chapter) { return chapter.id === storyProgress.current; });
  resume.hidden = !current;
  if (current) {
    resume.href = `#${current.id}`;
    resume.textContent = `Lanjutkan bab ${current.nomor} — ${current.judul} →`;
  }
  document.getElementById('reset-progress').disabled = count === 0 && !current;
}

async function recordVisit(chapterId) {
  if (visitedChapters.has(chapterId)) return;
  visitedChapters.add(chapterId);
  try {
    const response = await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId }),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('visit-unavailable');
    document.getElementById('visit-notice').hidden = true;
  } catch {
    document.getElementById('visit-notice').hidden = false;
  }
}

function activateChapter(chapterId) {
  if (!storyData.bab.some(function (chapter) { return chapter.id === chapterId; })) return;
  if (storyProgress.current !== chapterId) {
    storyProgress.current = chapterId;
    saveLocalData('storyProgress', storyProgress);
    updateProgress();
  }
  recordVisit(chapterId);
}

function observeChapters() {
  if (chapterObserver) chapterObserver.disconnect();
  if (!('IntersectionObserver' in window)) return;
  chapterObserver = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-entering');
      activateChapter(entry.target.id);
    }
  }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
  for (const chapter of document.querySelectorAll('.chapter')) chapterObserver.observe(chapter);
}

function renderSources() {
  const list = document.getElementById('sources-list');
  list.replaceChildren();
  for (const [index, source] of storyData.sumber.entries()) {
    if (source.status !== 'diperiksa') continue;
    const item = createElement('li');
    item.id = `source-${source.id}`;
    item.value = index + 1;
    item.tabIndex = -1;
    const link = createElement('a', '', source.judul);
    const url = new URL(source.url);
    if (url.protocol !== 'https:') continue;
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${source.judul} — buka tab baru`);
    item.append(link);
    item.append(createElement('p', 'source-meta', `${source.penerbit} · ${source.tahun}`));
    list.append(item);
  }
}

async function loadStory() {
  if (isLoading) return;
  isLoading = true;
  const notice = document.getElementById('load-notice');
  const retry = document.getElementById('retry-story');
  notice.hidden = false;
  retry.hidden = true;
  document.getElementById('load-message').textContent = 'Menyiapkan perjalananmu…';
  try {
    const response = await fetch('/api/story', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('story-unavailable');
    storyData = await response.json();
    if (!storyData.hero || !Array.isArray(storyData.bab) || storyData.bab.length === 0) throw new Error('story-invalid');
    loadProgress();
    renderHero();
    renderChapters();
    renderSources();
    updateProgress();
    notice.hidden = true;
    observeChapters();
    const initialChapter = storyData.bab.find(function (chapter) { return `#${chapter.id}` === location.hash; });
    if (initialChapter) {
      document.getElementById(initialChapter.id).scrollIntoView();
      activateChapter(initialChapter.id);
    }
  } catch {
    document.getElementById('load-message').textContent = 'Cerita belum bisa dimuat. Pastikan server lokal berjalan, lalu coba lagi.';
    retry.hidden = false;
  } finally {
    isLoading = false;
  }
}

function setupParallax() {
  const landscape = document.getElementById('beranda');
  const image = document.getElementById('hero-image');
  const motion = window.matchMedia('(min-width: 1000px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  function resetParallax() {
    if (parallaxAnimation) parallaxAnimation.cancel();
  }
  landscape.addEventListener('pointermove', function (event) {
    if (!motion.matches || !image.animate) return;
    const bounds = landscape.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 6;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 6;
    resetParallax();
    parallaxAnimation = image.animate([{ transform: `translate(${x}px, ${y}px) scale(1.025)` }], { duration: 180, fill: 'forwards' });
  });
  landscape.addEventListener('pointerleave', resetParallax);
  motion.addEventListener('change', resetParallax);
}

document.getElementById('retry-story').addEventListener('click', loadStory);
document.getElementById('close-hotspot').addEventListener('click', function () { closeHotspot(true); });
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && activeHotspot) closeHotspot(true);
});
document.getElementById('reset-progress').addEventListener('click', function () {
  storyProgress = { read: [], current: null };
  removeLocalData('storyProgress');
  updateProgress();
});
window.addEventListener('hashchange', function () {
  if (storyData) activateChapter(location.hash.slice(1));
});
setupParallax();
loadStory();
