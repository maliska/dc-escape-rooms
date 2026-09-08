import {
  venues,
  getVenueById,
  locationLabel,
  scareLabel,
  priceBandLabel,
  uniqueCities,
  filterVenues,
} from './data.js';
import {
  loadLog,
  setVenueLog,
  toggleVisited,
  clearLog,
  formatBestTime,
  isVisited,
} from './log.js';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet marker paths under Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
    <p class="lede">Curated starter list for DC and nearby VA/MD. Filter by area, scare, price band, and Metro access. Keep a private completion log in your browser — no accounts.</p>
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
  const withCoords = venues.filter((v) => v.lat != null && v.lng != null);
  const without = venues.filter((v) => v.lat == null || v.lng == null);

  root.innerHTML = `
    <h1 class="page-title">Map</h1>
    <p class="lede">Pins use coordinates geocoded once from venue addresses via Nominatim (OSM) and committed in <code>data/venues.json</code>. OSM tiles — no API key.</p>
    <div id="map"></div>
    <p class="map-legend">${withCoords.length} pins · ${without.length} without coordinates${without.length ? ': ' + without.map((v) => v.name).join(', ') : ''}</p>
  `;

  const map = L.map('map').setView([38.9, -77.1], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const bounds = [];
  for (const v of withCoords) {
    const marker = L.marker([v.lat, v.lng]).addTo(map);
    marker.bindPopup(
      `<strong><a href="#/venue/${escapeHtml(v.id)}">${escapeHtml(v.name)}</a></strong><br/>${escapeHtml(locationLabel(v))}<br/>${statusBadge(v.status)}`
    );
    bounds.push([v.lat, v.lng]);
  }
  if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });

  // invalidate size after layout
  setTimeout(() => map.invalidateSize(), 50);
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
