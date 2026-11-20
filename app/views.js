// Rendering: the checklist rows, the guide detail pane, the roadmap and the
// missables pages. All of it is plain DOM built from app/data/trophies.json.
import { isEarned, getCount } from './store.js';

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: 'Completion',
  online: 'Online',
};

const GRADE_LETTER = { platinum: 'PL', gold: 'G', silver: 'S', bronze: 'B' };

// A story trophy stays masked while the spoiler setting is on and it is
// not earned yet: no name, no description, no guide.
export function isMasked(state, trophy) {
  return state.spoiler && trophy.kind === 'story' && !isEarned(state, trophy.id);
}

export function displayName(state, trophy) {
  return isMasked(state, trophy) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(state, trophy) {
  return isMasked(state, trophy)
    ? 'Earn this trophy to reveal its name and description.'
    : trophy.description;
}

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function medalHtml(trophy) {
  return `<span class="medal ${trophy.grade}" title="${trophy.grade}">${GRADE_LETTER[trophy.grade]}</span>`;
}

function tagHtml(trophy) {
  const tags = [];
  tags.push(`<span class="tag">${KIND_LABELS[trophy.kind] || trophy.kind}</span>`);
  if (trophy.hidden) tags.push('<span class="tag hidden">Hidden</span>');
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  return tags.join('');
}

function counterHtml(state, trophy) {
  if (!trophy.target) return '';
  const n = getCount(state, trophy.id);
  const step = trophy.target >= 100000 ? 10000 : trophy.target >= 1000 ? 1000 : trophy.target >= 100 ? 10 : 1;
  const shown = trophy.target >= 1000 ? n.toLocaleString('en-US') : String(n);
  const targetShown = trophy.target >= 1000 ? trophy.target.toLocaleString('en-US') : String(trophy.target);
  return `<div class="counter">
    <button data-counter="${trophy.id}" data-delta="${-step}" aria-label="Decrease count">−</button>
    <span class="count-num"><b>${shown}</b> / ${targetShown} ${esc(trophy.targetLabel || '')}</span>
    <button data-counter="${trophy.id}" data-delta="${step}" aria-label="Increase count">+</button>
  </div>`;
}

export function trophyRowHtml(state, trophy, selectedId) {
  const earned = isEarned(state, trophy.id);
  const selected = selectedId === trophy.id ? ' selected' : '';
  const earnedCls = earned ? ' earned' : '';
  return `<div class="trophy-row${selected}${earnedCls}" data-trophy="${trophy.id}" role="button" tabindex="0">
    <span class="check" data-check="${trophy.id}" role="checkbox" aria-checked="${earned}" aria-label="Mark ${esc(displayName(state, trophy))} earned">${earned ? '✓' : ''}</span>
    ${medalHtml(trophy)}
    <span class="trophy-main">
      <span class="trophy-name">${esc(displayName(state, trophy))}</span>
      <span class="trophy-desc">${esc(displayDescription(state, trophy))}</span>
      <span class="trophy-tags">${tagHtml(trophy)}</span>
      ${counterHtml(state, trophy)}
    </span>
  </div>`;
}

export function matchesFilters(state, trophy, filters) {
  if (filters.kind === 'online') return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.hideEarned && isEarned(state, trophy.id)) return false;
  if (filters.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function renderChecklist(state, trophies, filters, selectedId) {
  if (filters.kind === 'online') {
    return `<div class="empty"><p><b>No online trophies.</b></p><p>All 55 trophies are single-player — PowerPyx confirms there is no online trophy and no multiplayer requirement for the platinum.</p></div>`;
  }
  const shown = trophies.filter((t) => matchesFilters(state, t, filters));
  if (shown.length === 0) {
    return '<div class="empty"><p>Nothing matches those filters.</p><p>Try clearing the search or picking another kind.</p></div>';
  }
  return shown.map((t) => trophyRowHtml(state, t, selectedId)).join('');
}

function sourceListHtml(trophy) {
  const items = trophy.sources.map((s) => {
    if (s.url) return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`;
    return `<li>${esc(s.label)}</li>`;
  });
  return `<ul class="sources">${items.join('')}</ul>`;
}

export function renderDetail(state, trophy) {
  if (!trophy) {
    return `<div class="detail-card"><h2>Pick a trophy</h2><p class="detail-official">Select any trophy on the left to see its guide and sources here — what to do, where and how, and when it can be missed.</p></div>`;
  }
  if (isMasked(state, trophy)) {
    return `<div class="detail-card"><h2>Hidden story trophy</h2><p class="detail-official">This is a story trophy you have not earned yet, and the spoiler setting is on.</p><p class="detail-guide">Its name, description and guide stay hidden until you earn it. Turn the spoiler setting off in the toolbar if you want to see it now.</p></div>`;
  }
  const earned = isEarned(state, trophy.id);
  return `<div class="detail-card">
    <div class="trophy-tags">${tagHtml(trophy)}</div>
    <h2>${esc(trophy.name)}</h2>
    <p class="detail-official">Official description: “${esc(trophy.description)}” — ${trophy.grade}, as PlayStation publishes it.</p>
    ${counterHtml(state, trophy)}
    <p class="detail-label">Guide</p>
    <p class="detail-guide">${esc(trophy.guide)}</p>
    <p class="detail-label">Sources</p>
    ${sourceListHtml(trophy)}
    <div class="detail-actions">
      <button class="btn primary" data-earn="${trophy.id}">${earned ? 'Mark as not earned' : 'Mark earned'}</button>
    </div>
  </div>`;
}

export function renderProgress(state, trophies) {
  const earned = trophies.filter((t) => isEarned(state, t.id)).length;
  const pct = Math.round((earned / trophies.length) * 100);
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && isEarned(state, t.id)).length;
    return `${got}/${total} ${g}`;
  });
  return { earned, pct, byGrade: byGrade.join(' · ') };
}

// The roadmap: three stages built from the official descriptions, in the
// order PowerPyx's roadmap gives them. Times and counts are PowerPyx's.
const ROADMAP = [
  {
    title: 'Stage 1 — Story first, and the things to do along the way',
    time: 'About 60–80 hours',
    note: 'Play the story at your own pace. The 100% checklist is not viewable until after the story, but any progress you make during the story already counts toward it.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    extra: 'While you play: do the Chapter 1 balcony meditation (see Missables), take optional missions as they appear — 100% needs any 100 of them — scan every new vehicle with the WAiNK app, and study new animals through the binoculars. Turn on progress and criminal-profile notifications in the UI settings so you can see what counts.',
  },
  {
    title: 'Stage 2 — The 100% checklist and the challenges',
    time: 'About 100 hours',
    note: 'After the story, open Progress, then Stats, then 100% Completion. PowerPyx calls the checklist lenient — closer to 60% true completion — but it still takes the longest. You need 70 of the 80 challenges, 15 of the 18 meditation spots and 300 stunts; every robbery, underwater discovery, shooting range, drone race and Bret quest is required.',
    trophyIds: [14, 15, 17, 32, 40, 43, 30, 31, 35, 42, 29, 52],
    extra: 'Robberies need everything: 39 gang operations, 22 bank jobs, 7 payday loan jobs and 8 bank vault robberies. Collectibles need 15 of the 18 card sets, 100 WAiNK locations, 33 underwater discoveries and 100 Cocaine Flamingos.',
  },
  {
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    time: 'About 10 hours',
    note: 'Most trophies should be done by now. Strangers & Freaks is not part of 100% completion, so its strands are often what is left, together with any stray trophies that did not pop on their own.',
    trophyIds: [25, 22, 23, 24, 26, 27],
    extra: 'Every quest giver tied to a trophy comes back after the story, so nothing in this stage can be missed. Clean up the counters, then the platinum follows.',
  },
];

export function renderRoadmap(state, trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const stages = ROADMAP.map((stage) => {
    const names = stage.trophyIds.map((id) => {
      const t = byId.get(id);
      return isMasked(state, t) ? '<span class="masked">Hidden story trophy</span>' : `<b>${esc(t.name)}</b>`;
    });
    return `<div class="stage">
      <div class="stage-head"><h3>${esc(stage.title)}</h3><span class="stage-time">${esc(stage.time)}</span></div>
      <p>${esc(stage.note)}</p>
      <p class="stage-trophies">${names.join(' · ')}</p>
      <p>${esc(stage.extra)}</p>
    </div>`;
  });
  return `<div class="section">
    <h2>Roadmap to the platinum</h2>
    <p>Three stages, in the order PowerPyx's roadmap gives them. One playthrough is enough — there is no mission replay, but free roam continues after the story and everything needed stays accessible. Estimated total: about 200 hours at difficulty 4 out of 10.</p>
    ${stages.join('')}
    <div class="warn"><b>Save advice.</b> The game has 15 manual save slots and 1 autosave. Because missions cannot be replayed, PowerPyx suggests keeping a save at the start and end of each chapter, then rotating the rest during free roam.</div>
    <div class="warn"><b>Cheats disable trophies.</b> PowerPyx and Push Square both say so, and PowerPyx adds that cheats also stop the game from saving. Keep them off the file you use for your platinum run.</div>
  </div>`;
}

export function renderMissables(state, trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const pma = byId.get(28);
  const maskedStory = trophies.filter((t) => t.kind === 'story' && !isEarned(state, t.id));
  return `<div class="section">
    <h2>Missable trophies</h2>
    <div class="warn"><b>Only one trophy may be missable: Positive Mental Attitude.</b> PowerPyx flags it. Push Square lists no known missables. Nobody has confirmed either way yet — so do the safe thing below.</div>
    <div class="stage">
      <div class="stage-head"><h3>${esc(pma.name)} — ${esc(pma.description)}</h3><span class="stage-time">Bronze · 18 spots</span></div>
      <p>${esc(pma.guide)}</p>
      <p class="stage-trophies">Sources: ${pma.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' · ')}</p>
    </div>
    <h3>Spoiler setting at work</h3>
    ${state.spoiler && maskedStory.length > 0 ? `<p>With spoilers hidden, ${maskedStory.length} story trophies are masked in this guide until earned:</p><p class="stage-trophies">${maskedStory.map(() => '<span class="masked">Hidden story trophy</span>').join(' · ')}</p><p>Turn the spoiler setting off in the toolbar to reveal their names and guides.</p>` : '<p>Turn the spoiler setting on in the toolbar and the story trophies mask themselves until earned.</p>'}
    <h3>Looks missable, but is not</h3>
    <ul>
      <li><b>Kenton goes quiet.</b> Kenton disappears after Chapter 1 and comes back later — his strand is not missable.</li>
      <li><b>Optional missions vanish.</b> Many disappear after a while, but there are far more than the 100 the checklist needs.</li>
      <li><b>Fences leave for good.</b> None of them has a trophy quest.</li>
      <li><b>Magazines in story buildings.</b> A few sit in buildings that close off — they also spawn elsewhere.</li>
      <li><b>Hourglass quests.</b> Quests with an hourglass icon can fail on a timer. None is tied to a trophy.</li>
      <li><b>Jason and Lucia's relationship.</b> It does not matter for trophies.</li>
    </ul>
    <div class="warn"><b>One warning that is not about trophies:</b> PowerPyx says the Irredeemable criminal profile is permanent and makes police more aggressive. You can still earn everything, but it makes the cleanup harder.</div>
    <p class="stage-trophies">Sources: PowerPyx — GTA 6 Trophy Guide &amp; Roadmap; Six Shore — GTA 6 Trophy and Achievement List.</p>
  </div>`;
}
