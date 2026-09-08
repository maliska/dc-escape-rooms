import {
  venues,
  getVenueById,
  locationLabel,
  scareLabel,
  priceBandLabel,
  uniqueCities,
  filterVenues,
  venueMapPercent,
  latLngToPercent,
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
      <h2><a href="#/venue/${escapeHtml(v.id)}">${escapeHtml(v.name)}</a></h2>
      <div class="meta">${escapeHtml(locationLabel(v))}</div>
      <div class="meta">${escapeHtml(v.price_band_pp || 'Price TBD')} · ~${v.approx_rooms ?? '?'} rooms</div>
    </article>
  `;
}

export function renderHome(root) {
  const params = new URLSearchParams((location.hash.split('?')[1] || ''));
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
    location.hash = '#/?' + q.toString();
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
    root.innerHTML = `<p class="empty">Venue not found. <a href="#/">Back to list</a></p>`;
    return;
  }
  const log = loadLog();
  const visited = log.visited_venue_ids.includes(v.id);
  const bestSec = log.personal_best_times[v.id];
  const notes = log.venue_notes[v.id] || '';
  const bestMins = bestSec != null ? (bestSec / 60).toFixed(bestSec % 60 === 0 ? 0 : 1) : '';

  root.innerHTML = `
    <p><a href="#/">← All venues</a></p>
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
        <a class="btn secondary" href="#/log">My log</a>
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
  const pinned = venues.filter((v) => venueMapPercent(v));
  const art = catalogMeta.geoFocus?.map_art || '/map/dmv-art.png';

  root.innerHTML = `
    <h1 class="page-title">Map</h1>
    <p class="lede">Illustrated DMV map with venue logos. Pins are hand-tuned to neighborhoods on the art (Downtown, Georgetown, Arlington, Alexandria, Bethesda, Capitol Hill). Tap a logo for details. Uncertain venues appear dimmed.</p>
    <div class="map-toolbar">
      <button type="button" class="btn" id="locate-me">Locate me</button>
      <button type="button" class="btn secondary" id="map-zoom-in" aria-label="Zoom in">+</button>
      <button type="button" class="btn secondary" id="map-zoom-out" aria-label="Zoom out">−</button>
      <button type="button" class="btn secondary" id="map-zoom-reset">Reset</button>
      <span class="map-locate-status" id="locate-status" hidden></span>
    </div>
    <div class="illustrated-map-viewport" id="map-viewport">
      <div class="illustrated-map-stage" id="map-stage" style="--map-scale: 1">
        <img class="map-art" src="${art}" alt="Illustrated map of DC, Arlington, Alexandria, and Bethesda" draggable="false" />
        <div class="map-pins" id="map-pins">
          ${pinned
            .map((v) => {
              const { x, y } = venueMapPercent(v);
              const uncertain = v.status === 'uncertain' || v.status === 'closed';
              const logo = v.logo || `/logos/${v.id}.png`;
              return `
              <a class="map-pin${uncertain ? ' uncertain' : ''}"
                 href="#/venue/${escapeHtml(v.id)}"
                 style="left:${x}%; top:${y}%"
                 title="${escapeHtml(v.name)}"
                 aria-label="${escapeHtml(v.name)}">
                <img src="${escapeHtml(logo)}" alt="" loading="lazy" />
                <span class="map-pin-label">${escapeHtml(v.brand || v.name)}</span>
              </a>`;
            })
            .join('')}
        </div>
        <div class="you-marker" id="you-marker" hidden>
          <span class="you-dot"></span>
          <span class="you-label">You</span>
        </div>
      </div>
    </div>
    <p class="map-legend">${pinned.length} venues on map · scroll / pinch or use +/− to zoom · logos are trademarks of their owners</p>
  `;

  const viewport = root.querySelector('#map-viewport');
  const stage = root.querySelector('#map-stage');
  const you = root.querySelector('#you-marker');
  const statusEl = root.querySelector('#locate-status');
  let scale = 1;

  const applyScale = () => {
    stage.style.setProperty('--map-scale', String(scale));
    stage.style.width = `${scale * 100}%`;
  };

  root.querySelector('#map-zoom-in').addEventListener('click', () => {
    scale = Math.min(3, scale + 0.25);
    applyScale();
  });
  root.querySelector('#map-zoom-out').addEventListener('click', () => {
    scale = Math.max(1, scale - 0.25);
    applyScale();
  });
  root.querySelector('#map-zoom-reset').addEventListener('click', () => {
    scale = 1;
    applyScale();
    viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  });

  // Basic touch drag-pan when zoomed (in addition to native overflow scroll)
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-pin')) return;
    dragging = true;
    viewport.classList.add('dragging');
    startX = e.clientX;
    startY = e.clientY;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
    viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    viewport.scrollLeft = scrollLeft - (e.clientX - startX);
    viewport.scrollTop = scrollTop - (e.clientY - startY);
  });
  const endDrag = () => {
    dragging = false;
    viewport.classList.remove('dragging');
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  root.querySelector('#locate-me').addEventListener('click', () => {
    statusEl.hidden = false;
    statusEl.textContent = 'Locating…';
    if (!navigator.geolocation) {
      statusEl.textContent = 'Geolocation not supported in this browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const { x, y } = latLngToPercent(latitude, longitude);
        you.hidden = false;
        you.style.left = `${x}%`;
        you.style.top = `${y}%`;
        const inBounds =
          latitude <= 39.08 &&
          latitude >= 38.78 &&
          longitude >= -77.15 &&
          longitude <= -76.97;
        statusEl.textContent = inBounds
          ? 'You are on the map.'
          : 'Located — outside the illustrated focus area (marker clamped to edge).';
        // Scroll marker into view roughly
        const rect = stage.getBoundingClientRect();
        viewport.scrollTo({
          left: (x / 100) * stage.scrollWidth - viewport.clientWidth / 2,
          top: (y / 100) * stage.scrollHeight - viewport.clientHeight / 2,
          behavior: 'smooth',
        });
      },
      (err) => {
        statusEl.textContent =
          err.code === 1
            ? 'Location permission denied.'
            : 'Could not get your location.';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
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
            <h3><a href="#/venue/${escapeHtml(v.id)}">${escapeHtml(v.name)}</a></h3>
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
