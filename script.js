/* ═══════════════════════════════════════════════════════════════
   script.js — Prompt Gallery
═══════════════════════════════════════════════════════════════ */

/* ─── CONFIG ─────────────────────────────────────────────────── */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7eYzloBaEPNkc_K8rPZqJ08XV0tWAmcrk6xP87WAyO92UHAz-FoW_Xt1knOwyrUSE/exec';
const PAGE_SIZE  = 40;

/* ─── STATE ──────────────────────────────────────────────────── */
let allPrompts      = [];
let filteredPrompts = [];
let visibleCount    = 0;
let selectedCat     = 'all';

/* ─── DOM REFS ───────────────────────────────────────────────── */
const $panel     = document.getElementById('categoryPanel');
const $title     = document.getElementById('categoryTitle');
const $count     = document.getElementById('promptCount');
const $grid      = document.getElementById('promptContainer');
const $loadBtn   = document.getElementById('loadMoreBtn');
const $loadLabel = document.getElementById('loadMoreLabel');
const $loadInfo  = document.getElementById('loadMoreInfo');
const $toast     = document.getElementById('toast');
const $toggle    = document.getElementById('themeToggle');
const colBtns    = document.querySelectorAll('.col-btn');

/* ═══════════════════════════════════════════════════════════════
   THEME — dark / light persisted in localStorage
═══════════════════════════════════════════════════════════════ */
(function initTheme() {
  const saved = localStorage.getItem('pg-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  $toggle.checked = (saved === 'light');
})();

$toggle.addEventListener('change', () => {
  const next = $toggle.checked ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pg-theme', next);
});

/* ═══════════════════════════════════════════════════════════════
   COLUMN SWITCHER — desktop only (CSS hides on mobile)
═══════════════════════════════════════════════════════════════ */
(function initCols() {
  const saved = localStorage.getItem('pg-cols') || '3';
  setColumns(saved, false);
})();

colBtns.forEach(btn =>
  btn.addEventListener('click', () => setColumns(btn.dataset.col, true))
);

function setColumns(n, save) {
  document.body.setAttribute('data-cols', n);
  colBtns.forEach(b =>
    b.classList.toggle('active', b.dataset.col === String(n))
  );
  if (save) localStorage.setItem('pg-cols', n);
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════════════════════════ */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════════════════════════
   FETCH
═══════════════════════════════════════════════════════════════ */
async function fetchData() {
  showSkeletons(8);
  try {
    const res  = await fetch(SCRIPT_URL);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Fetch error:', e);
    showToast('⚠ Could not load prompts');
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════════ */
function showSkeletons(n) {
  $grid.innerHTML = Array.from({ length: n }, () => `
    <div class="skeleton-card">
      <div class="sk-img"></div>
      <div class="sk-body">
        <div class="sk-line"></div>
        <div class="sk-line s"></div>
        <div class="sk-line xs"></div>
        <div class="sk-line btn"></div>
      </div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY PILLS
═══════════════════════════════════════════════════════════════ */
function renderPills(counts, total) {
  $panel.innerHTML = '';
  const entries = [
    ['all', total],
    ...Object.entries(counts).sort((a, b) => b[1] - a[1])
  ];
  entries.forEach(([cat, n]) => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn' + (selectedCat === cat ? ' selected' : '');
    btn.innerHTML = `${cap(cat)} <span class="pill-count">(${n})</span>`;
    btn.addEventListener('click', () => {
      selectedCat = cat;
      renderPills(counts, total);
      applyFilter();
    });
    $panel.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════════════════
   FILTER
═══════════════════════════════════════════════════════════════ */
function applyFilter() {
  filteredPrompts = selectedCat === 'all'
    ? allPrompts
    : allPrompts.filter(p => p.category === selectedCat);

  visibleCount    = 0;
  $grid.innerHTML = '';
  $title.textContent = selectedCat === 'all' ? 'All Prompts' : cap(selectedCat);
  $count.textContent =
    `${filteredPrompts.length} prompt${filteredPrompts.length !== 1 ? 's' : ''}`;

  loadBatch();
}

/* ═══════════════════════════════════════════════════════════════
   LOAD BATCH
═══════════════════════════════════════════════════════════════ */
function loadBatch() {
  const slice = filteredPrompts.slice(visibleCount, visibleCount + PAGE_SIZE);

  if (!slice.length && visibleCount === 0) {
    $grid.innerHTML = `
      <div class="empty-state">
        <span class="icon">🔍</span>
        <p>No prompts found in this category yet.</p>
      </div>`;
    $loadBtn.classList.remove('visible');
    $loadInfo.textContent = '';
    return;
  }

  slice.forEach((item, i) => $grid.appendChild(buildCard(item, i)));
  visibleCount += slice.length;
  syncLoadMore();
}

/* ═══════════════════════════════════════════════════════════════
   BUILD CARD
═══════════════════════════════════════════════════════════════ */
function buildCard(item, idx) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.animationDelay = `${Math.min(idx, 7) * 0.045}s`;

  const wrap = document.createElement('div');
  wrap.className = 'card-img-wrap loading';

  if (item.img) {
    const img   = new Image();
    img.alt     = item.category || '';
    img.onload  = () => { wrap.classList.remove('loading'); wrap.appendChild(img); };
    img.onerror = () => { wrap.classList.remove('loading'); wrap.style.display = 'none'; };
    img.src     = item.img;
  } else {
    wrap.classList.remove('loading');
    wrap.style.display = 'none';
  }

  const badge       = document.createElement('span');
  badge.className   = 'card-badge';
  badge.textContent = cap(item.category || 'general');
  wrap.appendChild(badge);

  const content     = document.createElement('div');
  content.className = 'card-content';

  const p         = document.createElement('p');
  p.className     = 'prompt-text';
  p.textContent   = item.prompt || '';

  const actions     = document.createElement('div');
  actions.className = 'card-actions';

  const copyBtn       = document.createElement('button');
  copyBtn.className   = 'copy-btn';
  copyBtn.innerHTML   = copyIcon() + ' Copy';
  copyBtn.addEventListener('click', () => doCopy(item.prompt, copyBtn));

  const expandBtn       = document.createElement('button');
  expandBtn.className   = 'expand-btn';
  expandBtn.textContent = 'See more';
  expandBtn.addEventListener('click', () => {
    const open            = p.classList.toggle('expanded');
    expandBtn.textContent = open ? 'See less' : 'See more';
  });

  actions.append(copyBtn, expandBtn);
  content.append(p, actions);
  card.append(wrap, content);
  return card;
}

/* ═══════════════════════════════════════════════════════════════
   LOAD MORE STATE
═══════════════════════════════════════════════════════════════ */
function syncLoadMore() {
  const left = filteredPrompts.length - visibleCount;
  if (left > 0) {
    $loadBtn.classList.add('visible');
    $loadLabel.textContent = `Load ${Math.min(left, PAGE_SIZE)} More`;
    $loadInfo.textContent  = `Showing ${visibleCount} of ${filteredPrompts.length}`;
  } else {
    $loadBtn.classList.remove('visible');
    $loadInfo.textContent = visibleCount > 0
      ? `✓ All ${filteredPrompts.length} prompts loaded`
      : '';
  }
}

$loadBtn.addEventListener('click', loadBatch);

/* ═══════════════════════════════════════════════════════════════
   COPY TO CLIPBOARD
═══════════════════════════════════════════════════════════════ */
function doCopy(text, btn) {
  navigator.clipboard.writeText(text)
    .then(() => {
      btn.classList.add('copied');
      btn.innerHTML = '✓ Copied';
      if (navigator.vibrate) navigator.vibrate(40);
      showToast('✓ Prompt copied!');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = copyIcon() + ' Copy';
      }, 2000);
    })
    .catch(() => showToast('⚠ Copy failed'));
}

function copyIcon() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  $toast.textContent = msg;
  $toast.classList.add('show');
  toastTimer = setTimeout(() => $toast.classList.remove('show'), 2300);
}

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
async function setup() {
  allPrompts = await fetchData();

  const counts = {};
  allPrompts.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  renderPills(counts, allPrompts.length);
  applyFilter();
}

document.addEventListener('DOMContentLoaded', setup);
