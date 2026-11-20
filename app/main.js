// Leonida Trophy Guide — boot and wiring. Loads the trophy data, keeps the
// checklist, detail pane, roadmap and missables in sync with the store, and
// applies a ?shot= scene for screenshots.
import {
  loadState, saveState, isEarned, setEarned, bumpCount,
  exportProgress, importProgress, resetProgress,
} from './store.js';
import {
  renderChecklist, renderDetail, renderRoadmap, renderMissables, renderProgress,
} from './views.js';
import { shotFromUrl, applyShotSeed } from './shots.js';

const listPane = document.getElementById('listPane');
const detailPane = document.getElementById('detailPane');
const layout = document.querySelector('.layout');
const toolbar = document.getElementById('toolbar');

const state = loadState();
let trophies = [];
let byId = new Map();
let tab = 'checklist';
let selectedId = null;
const filters = { kind: 'all', grade: 'all', search: '', hideEarned: false };

function renderAll() {
  const progress = renderProgress(state, trophies);
  document.getElementById('earnedCount').textContent = String(progress.earned);
  document.getElementById('progressFill').style.width = `${progress.pct}%`;
  document.getElementById('progressGrades').textContent = progress.byGrade;
  document.getElementById('spoilerToggle').checked = state.spoiler;

  if (tab === 'checklist') {
    layout.classList.remove('single');
    toolbar.classList.remove('compact');
    listPane.innerHTML = renderChecklist(state, trophies, filters, selectedId);
    detailPane.innerHTML = renderDetail(state, selectedId ? byId.get(selectedId) : null);
  } else if (tab === 'roadmap') {
    layout.classList.add('single');
    toolbar.classList.add('compact');
    listPane.innerHTML = renderRoadmap(state, trophies);
    detailPane.innerHTML = '';
  } else {
    layout.classList.add('single');
    toolbar.classList.add('compact');
    listPane.innerHTML = renderMissables(state, trophies);
    detailPane.innerHTML = '';
  }
}

function setTab(next) {
  tab = next;
  for (const button of document.querySelectorAll('.tab')) {
    const active = button.dataset.tab === next;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  }
  renderAll();
}

function setKind(kind) {
  filters.kind = kind;
  for (const chip of document.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.kind === kind);
  }
  renderAll();
}

// One delegated click handler for the whole page: rows, checkboxes,
// counters, earn buttons and tabs.
document.addEventListener('click', (event) => {
  const check = event.target.closest('[data-check]');
  if (check) {
    event.stopPropagation();
    const id = Number(check.dataset.check);
    setEarned(state, id, !isEarned(state, id));
    renderAll();
    return;
  }
  const counter = event.target.closest('[data-counter]');
  if (counter) {
    event.stopPropagation();
    const trophy = byId.get(Number(counter.dataset.counter));
    if (trophy) bumpCount(state, trophy, Number(counter.dataset.delta));
    renderAll();
    return;
  }
  const earn = event.target.closest('[data-earn]');
  if (earn) {
    const id = Number(earn.dataset.earn);
    setEarned(state, id, !isEarned(state, id));
    renderAll();
    return;
  }
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    setTab(tabButton.dataset.tab);
    return;
  }
  const chip = event.target.closest('[data-kind]');
  if (chip) {
    setKind(chip.dataset.kind);
    return;
  }
  const row = event.target.closest('[data-trophy]');
  if (row) {
    selectedId = Number(row.dataset.trophy);
    renderAll();
  }
});

document.getElementById('search').addEventListener('input', (event) => {
  filters.search = event.target.value.trim();
  renderAll();
});
document.getElementById('gradeFilter').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  renderAll();
});
document.getElementById('hideEarned').addEventListener('change', (event) => {
  filters.hideEarned = event.target.checked;
  renderAll();
});
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  state.spoiler = event.target.checked;
  saveState(state);
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state));
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const error = await importProgress(state, file);
  if (error) window.alert(error);
  event.target.value = '';
  renderAll();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies and counters?')) {
    resetProgress(state);
    selectedId = null;
    renderAll();
  }
});

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;
  byId = new Map(trophies.map((t) => [t.id, t]));

  const shot = shotFromUrl();
  if (shot) {
    const scene = applyShotSeed(state, shot);
    setTab(scene.tab);
    selectedId = scene.selectedId;
    renderAll();
  } else {
    renderAll();
  }
  window.__shotReady = true;
}

boot().catch((err) => {
  listPane.innerHTML = `<div class="empty"><p>Could not load the trophy list.</p><p>${err.message}</p></div>`;
  window.__shotReady = true;
});
