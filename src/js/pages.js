import {
  venues,
  getVenueById,
  locationLabel,
  scareLabel,
  priceBandLabel,
  uniqueCities,
  filterVenues,
  venueMapPercent,
  catalogMeta,
} from './data.js';
import {
  loadLog,
  setVenueLog,
  toggleVisited,
  clearLog,
  formatBestTime,
  isVisited,
} from './log.js';

import demoBoard from '../../data/leaderboard-demo.json';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusBadge(status) {
  return `<span class="badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function venueCard(v) {
  const metro = v.metro_accessible
    ? '<span class="badge metro">Metro</span>'
    : '';
  const visited = isVisited(v.id)
    ? '<span class="badge open">In my log</span>'
    : '';
  return `
    <article class="card">
      <div class="badges">
        ${statusBadge(v.status)}
        <span class="badge scare">${escapeHtml(scareLabel(v.scare_level))}</span>
        ${metro}
        ${visited}
      </div>
      <h2><a href="/venue/${escapeHtml(v.id)}">${escapeHtml(v.name)}</a></h2>
      <div class="meta">${escapeHtml(locationLabel(v))}</div>
      <div class="meta">${escapeHtml(v.price_band_pp || 'Price TBD')} · ~${v.approx_rooms ?? '?'} rooms</div>
    </article>
  `;
}

export function renderHome(root) {
  const params = new URLSearchParams(location.search);
  const filters = {
    city: params.get('city') || '',
    neighborhood: params.get('neighborhood') || '',
    scare_level: params.get('scare_level') || '',
    price_band: params.get('price_band') || '',
    metro_accessible: params.get('metro') || '',
    status: params.get('status') || 'open_only',
  };

  const list = filterVenues(filters);
  const cities = uniqueCities();

  root.innerHTML = `
    <h1 class="page-title">DMV escape rooms</h1>
    <p class="lede">Curated list for DC proper, Arlington, Alexandria, and North Bethesda. Filter by area, scare, price band, and Metro access. Keep a private completion log in your browser — no accounts.</p>
    <form class="filters" id="filters">
      <label>City
        <select name="city">
          <option value="">All cities</option>
          ${cities.map((c) => `<option value="${escapeHtml(c)}" ${filters.city === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </label>
      <label>Neighborhood
        <input type="search" name="neighborhood" placeholder="e.g. Clarendon" value="${escapeHtml(filters.neighborhood)}" />
      </label>
      <label>Scare level
        <select name="scare_level">
          <option value="">Any</option>
          ${['none','mild','mixed','horror_available','unknown'].map((s) =>
            `<option value="${s}" ${filters.scare_level === s ? 'selected' : ''}>${escapeHtml(scareLabel(s))}</option>`
          ).join('')}
        </select>
      </label>
      <label>Price band
        <select name="price_band">
          <option value="">Any</option>
          ${['under_30','30_40','40_50','50_plus'].map((b) =>
            `<option value="${b}" ${filters.price_band === b ? 'selected' : ''}>${escapeHtml(priceBandLabel(b))}</option>`
          ).join('')}
        </select>
      </label>
      <label>Metro
        <select name="metro">
          <option value="">Any</option>
          <option value="yes" ${filters.metro_accessible === 'yes' ? 'selected' : ''}>Metro-accessible</option>
          <option value="no" ${filters.metro_accessible === 'no' ? 'selected' : ''}>Not Metro / weak</option>
        </select>
      </label>
      <label>Status
        <select name="status">
          <option value="open_only" ${filters.status === 'open_only' ? 'selected' : ''}>Open only (default)</option>
          <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All (show badges)</option>
          <option value="uncertain" ${filters.status === 'uncertain' ? 'selected' : ''}>Uncertain</option>
          <option value="closed" ${filters.status === 'closed' ? 'selected' : ''}>Closed</option>
          <option value="open" ${filters.status === 'open' ? 'selected' : ''}>Open</option>
        </select>
      </label>
    </form>
    <p class="results-meta">${list.length} venue${list.length === 1 ? '' : 's'}</p>
    <div class="venue-grid">
      ${list.length ? list.map(venueCard).join('') : '<p class="empty">No venues match these filters.</p>'}
    </div>
  `;

  const form = root.querySelector('#filters');
  const apply = () => {
    const fd = new FormData(form);
    const q = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v) q.set(k === 'metro' ? 'metro' : k, v);
    }
    // normalize status default
    if (!q.get('status')) q.set('status', 'open_only');
    const qs = q.toString();
    const url = '/' + (qs ? '?' + qs : '');
    history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply();
  });
  let t;
  form.querySelector('[name=neighborhood]').addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(apply, 250);
  });
}

export function renderVenue(root, id) {
  const v = getVenueById(id);
  if (!v) {
    root.innerHTML = `<p class="empty">Venue not found. <a href="/">Back to list</a></p>`;
    return;
  }
  const log = loadLog();
  const visited = log.visited_venue_ids.includes(v.id);
  const bestSec = log.personal_best_times[v.id];
  const notes = log.venue_notes[v.id] || '';
  const bestMins = bestSec != null ? (bestSec / 60).toFixed(bestSec % 60 === 0 ? 0 : 1) : '';

  root.innerHTML = `
    <p><a href="/">← All venues</a></p>
    <article class="detail">
      <div class="badges">
        ${statusBadge(v.status)}
        <span class="badge scare">${escapeHtml(scareLabel(v.scare_level))}</span>
        ${v.metro_accessible ? '<span class="badge metro">Metro</span>' : ''}
        <span class="badge">${escapeHtml(v.ownership)}</span>
      </div>
      <h1>${escapeHtml(v.name)}</h1>
      <p class="meta">${escapeHtml(locationLabel(v))}${v.brand ? ` · ${escapeHtml(v.brand)}` : ''}</p>
      <dl>
        <dt>Address</dt><dd>${escapeHtml(v.address || '—')}</dd>
        <dt>Rooms</dt><dd>~${v.approx_rooms ?? '?'}</dd>
        <dt>Price band</dt><dd>${escapeHtml(v.price_band_pp || '—')} <span class="meta">(${escapeHtml(priceBandLabel(v.price_band))})</span></dd>
        <dt>Private only</dt><dd>${v.private_only == null ? '—' : v.private_only ? 'Yes' : 'No / shared possible'}</dd>
        <dt>Metro</dt><dd>${escapeHtml(v.metro_notes || (v.metro_accessible ? 'Yes' : 'No / limited'))}</dd>
        <dt>Verified</dt><dd>${escapeHtml(v.last_verified || '—')}</dd>
      </dl>
      <h2>Curator notes</h2>
      <div class="notes-box">${escapeHtml(v.curator_notes || v.difficulty_notes || '—')}</div>
      ${v.staleness_flags?.length ? `<p class="meta"><strong>Flags:</strong> ${escapeHtml(v.staleness_flags.join('; '))}</p>` : ''}
      <div class="actions">
        <a class="btn" href="${escapeHtml(v.website_url)}" target="_blank" rel="noopener noreferrer">Website</a>
        ${v.booking_url ? `<a class="btn secondary" href="${escapeHtml(v.booking_url)}" target="_blank" rel="noopener noreferrer">Book</a>` : ''}
        <a class="btn secondary" href="/log">My log</a>
      </div>
      <h2 style="margin-top:1.5rem">My log (private)</h2>
      <p class="meta">Stored only in this browser’s localStorage. Not uploaded anywhere.</p>
      <form class="log-form" id="venue-log">
        <label class="checkbox-row" style="display:flex;align-items:center;gap:0.5rem">
          <input type="checkbox" name="visited" ${visited ? 'checked' : ''} /> Visited / completed at least one room
        </label>
        <div class="row">
          <label>Personal best (minutes)
            <input type="number" name="best" min="0" step="0.5" value="${escapeHtml(bestMins)}" placeholder="e.g. 42" />
          </label>
          <label>Current best
            <input type="text" disabled value="${escapeHtml(formatBestTime(bestSec))}" />
          </label>
        </div>
        <label>Notes
          <textarea name="notes" placeholder="Spoilers stay private…">${escapeHtml(notes)}</textarea>
        </label>
        <button type="submit" class="btn">Save to my log</button>
      </form>
    </article>
  `;

  root.querySelector('#venue-log').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setVenueLog(v.id, {
      visited: fd.get('visited') === 'on',
      bestTimeMinutes: fd.get('best'),
      notes: fd.get('notes'),
    });
    renderVenue(root, id);
  });
}

export function renderMap(root) {
  const pinned = venues
    .map((v) => {
      const pct = venueMapPercent(v);
      return pct ? { v, x: pct.x, y: pct.y } : null;
    })
    .filter(Boolean);

  /** Group pins within ~5% Euclidean distance, then fan around centroid. */
  const CLUSTER_DIST = 5;
  const FAN_RADIUS = 3;
  const parent = pinned.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const unite = (a, b) => {
    a = find(a);
    b = find(b);
    if (a !== b) parent[a] = b;
  };
  for (let i = 0; i < pinned.length; i++) {
    for (let j = i + 1; j < pinned.length; j++) {
      if (Math.hypot(pinned[i].x - pinned[j].x, pinned[i].y - pinned[j].y) <= CLUSTER_DIST) {
        unite(i, j);
      }
    }
  }
  const groups = new Map();
  pinned.forEach((p, i) => {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(p);
  });

  const placed = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      placed.push({ ...group[0], badge: null });
      continue;
    }
    const cx = group.reduce((s, p) => s + p.x, 0) / group.length;
    const cy = group.reduce((s, p) => s + p.y, 0) / group.length;
    group.forEach((p, i) => {
      const angle = (Math.PI * 2 * i) / group.length - Math.PI / 2;
      placed.push({
        ...p,
        x: cx + FAN_RADIUS * Math.cos(angle),
        y: cy + FAN_RADIUS * Math.sin(angle),
        // Badge on primary when 3+ would still collide after nudging
        badge: group.length >= 3 && i === 0 ? group.length - 1 : null,
      });
    });
  }

  const art = catalogMeta.geoFocus?.map_art || '/map/dmv-art.jpg';
  const shortLabel = (v) => {
    const raw = v.brand || v.name || '';
    const cut = raw.split('—')[0].split('–')[0].trim();
    return cut.length > 22 ? cut.slice(0, 20) + '…' : cut;
  };

  root.innerHTML = `
    <div class="map-fullscreen">
      <div class="illustrated-map-viewport" id="map-viewport">
        <div class="illustrated-map-stage" id="map-stage">
          <img class="map-art" id="map-art" src="${art}" alt="Illustrated map of DC, Arlington, Alexandria, and Bethesda" draggable="false" />
          <div class="map-pins" id="map-pins">
            ${placed
              .map(({ v, x, y, badge }) => {
                const uncertain = v.status === 'uncertain' || v.status === 'closed';
                const logo = v.logo || `/logos/${v.id}.png`;
                return `
                <a class="map-pin${uncertain ? ' uncertain' : ''}${badge ? ' has-badge' : ''}"
                   href="/venue/${escapeHtml(v.id)}"
                   style="left:${x}%; top:${y}%"
                   title="${escapeHtml(v.name)}"
                   aria-label="${escapeHtml(v.name)}">
                  <img src="${escapeHtml(logo)}" alt="" loading="lazy" />
                  ${badge != null ? `<span class="map-pin-badge">+${badge}</span>` : ''}
                  <span class="map-pin-label">${escapeHtml(shortLabel(v))}</span>
                </a>`;
              })
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const viewport = root.querySelector('#map-viewport');
  const stage = root.querySelector('#map-stage');
  const img = root.querySelector('#map-art');

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let iw = 0;
  let ih = 0;
  let minScale = 1;
  let maxScale = 4;

  const apply = () => {
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const clampPan = () => {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = iw * scale;
    const sh = ih * scale;
    if (sw <= vw) tx = (vw - sw) / 2;
    else tx = Math.min(0, Math.max(vw - sw, tx));
    if (sh <= vh) ty = (vh - sh) / 2;
    else ty = Math.min(0, Math.max(vh - sh, ty));
  };

  const fitCover = () => {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    if (!iw || !ih || !vw || !vh) return;
    const cover = Math.max(vw / iw, vh / ih);
    // Gentler initial zoom (~4% padding) so compass/edges aren't clipped as hard.
    // Pinch out can still reach true cover; pinch in up to maxScale.
    minScale = cover;
    maxScale = cover * 4;
    scale = cover * 0.92;
    tx = (vw - iw * scale) / 2;
    ty = (vh - ih * scale) / 2;
    clampPan();
    apply();
  };

  const zoomAt = (clientX, clientY, nextScale) => {
    const rect = viewport.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const imgX = (x - tx) / scale;
    const imgY = (y - ty) / scale;
    // Allow zooming out slightly past cover (to the gentler 0.92×) and in to maxScale.
    const floor = minScale * 0.92;
    scale = Math.min(maxScale, Math.max(floor, nextScale));
    tx = x - imgX * scale;
    ty = y - imgY * scale;
    clampPan();
    apply();
  };

  const onReady = () => {
    iw = img.naturalWidth;
    ih = img.naturalHeight;
    fitCover();
  };

  if (img.complete && img.naturalWidth) onReady();
  else img.addEventListener('load', onReady);

  const onResize = () => {
    if (!document.body.contains(viewport)) {
      window.removeEventListener('resize', onResize);
      return;
    }
    fitCover();
  };
  window.addEventListener('resize', onResize);

  const pointers = new Map();
  let panStart = null;
  let pinchStart = null;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-pin') && pointers.size === 0) return;
    viewport.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.classList.add('dragging');

    if (pointers.size === 1) {
      panStart = { x: e.clientX, y: e.clientY, tx, ty };
      pinchStart = null;
    } else if (pointers.size >= 2) {
      const pts = [...pointers.values()].slice(0, 2);
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const rect = viewport.getBoundingClientRect();
      const lx = cx - rect.left;
      const ly = cy - rect.top;
      pinchStart = {
        dist,
        scale,
        imgX: (lx - tx) / scale,
        imgY: (ly - ty) / scale,
      };
      panStart = null;
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2 && pinchStart) {
      const pts = [...pointers.values()].slice(0, 2);
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const rect = viewport.getBoundingClientRect();
      const lx = cx - rect.left;
      const ly = cy - rect.top;
      const floor = minScale * 0.92;
      scale = Math.min(maxScale, Math.max(floor, pinchStart.scale * (dist / pinchStart.dist)));
      tx = lx - pinchStart.imgX * scale;
      ty = ly - pinchStart.imgY * scale;
      clampPan();
      apply();
    } else if (pointers.size === 1 && panStart) {
      tx = panStart.tx + (e.clientX - panStart.x);
      ty = panStart.ty + (e.clientY - panStart.y);
      clampPan();
      apply();
    }
  });

  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      panStart = null;
      pinchStart = null;
      viewport.classList.remove('dragging');
    } else if (pointers.size === 1) {
      const pt = [...pointers.values()][0];
      panStart = { x: pt.x, y: pt.y, tx, ty };
      pinchStart = null;
    }
  };
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomAt(e.clientX, e.clientY, scale * factor);
    },
    { passive: false }
  );
}

export function renderLog(root) {
  const log = loadLog();
  const visited = venues.filter((v) => log.visited_venue_ids.includes(v.id));

  root.innerHTML = `
    <h1 class="page-title">My log</h1>
    <div class="privacy-note">
      <strong>Private by design.</strong> Checklist, best times, and notes live in <code>localStorage</code> on this device only.
      No accounts, no public leaderboard, nothing synced to a server.
    </div>
    <p class="results-meta">${visited.length} of ${venues.length} venues marked visited</p>
    <div class="log-list">
      ${venues.map((v) => {
        const on = log.visited_venue_ids.includes(v.id);
        const best = log.personal_best_times[v.id];
        const notes = log.venue_notes[v.id] || '';
        return `
          <div class="log-item" data-id="${escapeHtml(v.id)}">
            <h3><a href="/venue/${escapeHtml(v.id)}">${escapeHtml(v.name)}</a></h3>
            <div class="meta">${escapeHtml(locationLabel(v))} · ${statusBadge(v.status)}</div>
            <form class="log-form quick-log">
              <label style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem">
                <input type="checkbox" name="visited" ${on ? 'checked' : ''} /> Visited
              </label>
              <div class="row">
                <label>Best time (minutes)
                  <input type="number" name="best" min="0" step="0.5" value="${best != null ? escapeHtml(String(best / 60)) : ''}" />
                </label>
                <label>Formatted
                  <input type="text" disabled value="${escapeHtml(formatBestTime(best))}" />
                </label>
              </div>
              <label>Notes
                <textarea name="notes">${escapeHtml(notes)}</textarea>
              </label>
              <button type="submit" class="btn secondary">Save</button>
            </form>
          </div>
        `;
      }).join('')}
    </div>
    <p style="margin-top:1.5rem">
      <button type="button" class="btn danger" id="clear-log">Clear all local log data</button>
    </p>
  `;

  root.querySelectorAll('.quick-log').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = form.closest('[data-id]').dataset.id;
      const fd = new FormData(form);
      setVenueLog(id, {
        visited: fd.get('visited') === 'on',
        bestTimeMinutes: fd.get('best'),
        notes: fd.get('notes'),
      });
      renderLog(root);
    });
  });

  root.querySelector('#clear-log').addEventListener('click', () => {
    if (confirm('Delete all personal log data from this browser?')) {
      clearLog();
      renderLog(root);
    }
  });
}


function formatClearTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function daysAgo(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  const now = new Date();
  return (now - d) / (1000 * 60 * 60 * 24);
}

/** Synthetic demo leaderboard — not linked from nav; fake venues only. */
export function renderLeaderboardDemo(root) {
  const params = new URLSearchParams(location.search);
  const venueFilter = params.get('venue') || '';
  const period = params.get('period') || 'all';

  const venues = demoBoard.venues || [];
  let rows = (demoBoard.clears || []).filter((c) => c.escaped !== false);
  if (venueFilter) rows = rows.filter((c) => c.venue === venueFilter);
  if (period === '30') rows = rows.filter((c) => daysAgo(c.date) <= 30);

  rows = [...rows].sort((a, b) => a.time_seconds - b.time_seconds);

  root.innerHTML = `
    <div class="demo-banner" role="status">
      <strong>Demo — example data only. Not real venues or times.</strong>
    </div>
    <h1 class="page-title">Leaderboard (demo)</h1>
    <p class="lede">Synthetic sample clears for mock venues. Private log and real directory are unchanged.</p>
    <form class="filters" id="lb-filters">
      <label>Venue
        <select name="venue">
          <option value="">All venues</option>
          ${venues.map((v) =>
            `<option value="${escapeHtml(v)}" ${venueFilter === v ? 'selected' : ''}>${escapeHtml(v)}</option>`
          ).join('')}
        </select>
      </label>
      <label>Period
        <select name="period">
          <option value="all" ${period === 'all' ? 'selected' : ''}>All time</option>
          <option value="30" ${period === '30' ? 'selected' : ''}>Last 30 days</option>
        </select>
      </label>
    </form>
    <p class="results-meta">${rows.length} escape${rows.length === 1 ? '' : 's'} · ranked by clear time</p>
    <div class="lb-table-wrap">
      <table class="lb-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Team</th>
            <th scope="col">Venue</th>
            <th scope="col">Room</th>
            <th scope="col">Time</th>
            <th scope="col">Date</th>
            <th scope="col">Escaped</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (c, i) => `
            <tr>
              <td class="lb-rank">${i + 1}</td>
              <td>${escapeHtml(c.team)}</td>
              <td>${escapeHtml(c.venue)}</td>
              <td>${escapeHtml(c.room)}</td>
              <td class="lb-time">${formatClearTime(c.time_seconds)}</td>
              <td>${escapeHtml(c.date)}</td>
              <td><span class="badge open">Yes</span></td>
            </tr>`
                  )
                  .join('')
              : `<tr><td colspan="7" class="empty">No clears match these filters.</td></tr>`
          }
        </tbody>
      </table>
    </div>
    <p class="lb-demo-note meta">Interested in a real feed from your venue? Ask Joel / Side Project Manager.</p>
  `;

  const form = root.querySelector('#lb-filters');
  const apply = () => {
    const fd = new FormData(form);
    const q = new URLSearchParams();
    const v = fd.get('venue');
    const p = fd.get('period');
    if (v) q.set('venue', v);
    if (p && p !== 'all') q.set('period', p);
    const qs = q.toString();
    const url = '/leaderboard-demo' + (qs ? '?' + qs : '');
    history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply();
  });
}
