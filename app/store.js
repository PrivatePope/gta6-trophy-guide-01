// Progress store: earned trophies, per-trophy counters and the spoiler setting,
// saved in the browser only (localStorage). Export writes a JSON file; import
// reads one back. Nothing leaves the machine.
const KEY = 'leonida-trophy-guide-v1';

function blankState() {
  return { earned: {}, counts: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: parsed.spoiler === true,
    };
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full or blocked: the app still works for this visit.
  }
}

export function isEarned(state, id) {
  return state.earned[id] === true;
}

export function setEarned(state, id, earned) {
  if (earned) state.earned[id] = true;
  else delete state.earned[id];
  saveState(state);
}

export function getCount(state, id) {
  const n = state.counts[id];
  return typeof n === 'number' && n > 0 ? n : 0;
}

// Bump a trophy's counter by delta, clamped to [0, target]. Reaching the
// target marks the trophy earned; dropping below it unmarks it.
export function bumpCount(state, trophy, delta) {
  const target = trophy.target || 0;
  const next = Math.max(0, Math.min(target, getCount(state, trophy.id) + delta));
  if (next === 0) delete state.counts[trophy.id];
  else state.counts[trophy.id] = next;
  if (target > 0) setEarned(state, trophy.id, next >= target);
  else saveState(state);
  return next;
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function exportProgress(state) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b),
    counts: state.counts,
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Read an exported progress file and apply it. Returns an error string, or ''.
export function importProgress(state, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const earned = {};
        if (Array.isArray(parsed.earned)) {
          for (const id of parsed.earned) {
            if (Number.isInteger(id) && id >= 1 && id <= 55) earned[id] = true;
          }
        }
        const counts = {};
        if (parsed.counts && typeof parsed.counts === 'object') {
          for (const [k, v] of Object.entries(parsed.counts)) {
            const id = Number(k);
            if (Number.isInteger(id) && id >= 1 && id <= 55 && typeof v === 'number' && v > 0) counts[id] = v;
          }
        }
        state.earned = earned;
        state.counts = counts;
        if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
        saveState(state);
        resolve('');
      } catch (err) {
        resolve('That file is not a progress export from this guide.');
      }
    };
    reader.onerror = () => resolve('Could not read that file.');
    reader.readAsText(file);
  });
}

export function resetProgress(state) {
  state.earned = {};
  state.counts = {};
  saveState(state);
}
