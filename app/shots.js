// Screenshot scenes. ?shot=cover|detail|roadmap|missables seeds the same
// fixed progress (13 of 55 earned, counters part way) and opens one view,
// so the four screenshots are deterministic renders of the app's own code.
// Real users never see these: without ?shot= the app opens empty, as new.
import { saveState } from './store.js';

const SEED_EARNED = [2, 3, 8, 15, 16, 20, 21, 33, 35, 42, 53, 54, 55];
const SEED_COUNTS = {
  15: 250, 17: 12, 18: 6, 25: 3, 28: 9, 30: 1, 31: 64, 32: 31,
  35: 100, 40: 2, 43: 5, 52: 140000, 53: 100000, 54: 8, 55: 10,
};

export const SHOTS = {
  cover: { tab: 'checklist', selectedId: null, spoiler: false },
  detail: { tab: 'checklist', selectedId: 17, spoiler: false },
  roadmap: { tab: 'roadmap', selectedId: null, spoiler: false },
  missables: { tab: 'missables', selectedId: null, spoiler: true },
};

export function shotFromUrl() {
  const name = new URLSearchParams(window.location.search).get('shot');
  return name && SHOTS[name] ? name : null;
}

export function applyShotSeed(state, shotName) {
  const shot = SHOTS[shotName];
  state.earned = {};
  for (const id of SEED_EARNED) state.earned[id] = true;
  state.counts = { ...SEED_COUNTS };
  state.spoiler = shot.spoiler;
  saveState(state);
  return shot;
}
