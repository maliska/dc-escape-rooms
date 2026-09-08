const KEY = 'dmv-escape-rooms-my-log-v1';

function emptyLog() {
  return {
    visited_venue_ids: [],
    completed_room_ids: [],
    personal_best_times: {},
    personal_notes: {},
    venue_notes: {},
  };
}

export function loadLog() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyLog();
    return { ...emptyLog(), ...JSON.parse(raw) };
  } catch {
    return emptyLog();
  }
}

export function saveLog(log) {
  localStorage.setItem(KEY, JSON.stringify(log));
}

export function isVisited(venueId) {
  return loadLog().visited_venue_ids.includes(venueId);
}

export function toggleVisited(venueId) {
  const log = loadLog();
  const set = new Set(log.visited_venue_ids);
  if (set.has(venueId)) set.delete(venueId);
  else set.add(venueId);
  log.visited_venue_ids = [...set];
  saveLog(log);
  return log;
}

export function setVenueLog(venueId, { bestTimeMinutes, notes, visited }) {
  const log = loadLog();
  const set = new Set(log.visited_venue_ids);
  if (visited) set.add(venueId);
  else set.delete(venueId);
  log.visited_venue_ids = [...set];

  if (bestTimeMinutes === '' || bestTimeMinutes == null) {
    delete log.personal_best_times[venueId];
  } else {
    const mins = Number(bestTimeMinutes);
    if (!Number.isNaN(mins) && mins >= 0) {
      log.personal_best_times[venueId] = Math.round(mins * 60);
    }
  }

  if (notes && notes.trim()) log.venue_notes[venueId] = notes.trim();
  else delete log.venue_notes[venueId];

  saveLog(log);
  return log;
}

export function clearLog() {
  localStorage.removeItem(KEY);
}

export function formatBestTime(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
