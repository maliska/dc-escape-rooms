import catalog from '../../data/venues.json';

/** Active catalog: geographic focus only (excluded suburbs filtered out of UI). */
export const venues = catalog.venues.filter((v) => !v.excluded);
export const allVenuesIncludingExcluded = catalog.venues;

export const catalogMeta = {
  generatedFrom: catalog.generated_from,
  compiled: catalog.compiled,
  geocode: catalog.geocode,
  geoFocus: catalog.geo_focus,
};

export function getVenueById(id) {
  return venues.find((v) => v.id === id) || null;
}

export function locationLabel(v) {
  const parts = [v.city];
  if (v.neighborhood) parts.push(v.neighborhood);
  return parts.join(' / ');
}

export function scareLabel(level) {
  const map = {
    none: 'None / family',
    mild: 'Mild',
    mixed: 'Mixed',
    horror_available: 'Horror available',
    unknown: 'Scare unknown',
  };
  return map[level] || level;
}

export function priceBandLabel(band) {
  const map = {
    under_30: 'Under $30',
    '30_40': '$30–40',
    '40_50': '$40–50',
    '50_plus': '$50+',
    unknown: 'Unknown',
  };
  return map[band] || band;
}

export function uniqueCities() {
  return [...new Set(venues.map((v) => v.city))].sort();
}

export function filterVenues(filters) {
  return venues.filter((v) => {
    if (filters.city && v.city !== filters.city) return false;
    if (filters.neighborhood) {
      const n = (v.neighborhood || '').toLowerCase();
      if (!n.includes(filters.neighborhood.toLowerCase())) return false;
    }
    if (filters.scare_level && v.scare_level !== filters.scare_level) return false;
    if (filters.price_band && v.price_band !== filters.price_band) return false;
    if (filters.metro_accessible === 'yes' && v.metro_accessible !== true) return false;
    if (filters.metro_accessible === 'no' && v.metro_accessible !== false) return false;
    if (filters.status === 'open_only') {
      if (v.status !== 'open') return false;
    } else if (filters.status && filters.status !== 'all') {
      if (v.status !== filters.status) return false;
    }
    return true;
  });
}

/** Project WGS84 into % of illustrated map image using committed bounds. */
export function latLngToPercent(lat, lng) {
  const b = catalog.geo_focus?.map_bounds || {
    north: 39.08,
    south: 38.78,
    west: -77.15,
    east: -76.97,
  };
  const x = ((lng - b.west) / (b.east - b.west)) * 100;
  const y = ((b.north - lat) / (b.north - b.south)) * 100;
  return {
    x: Math.min(98, Math.max(2, x)),
    y: Math.min(98, Math.max(2, y)),
  };
}

/** Prefer hand-tuned map_x/map_y; fall back to lat/lng projection. */
export function venueMapPercent(v) {
  if (v.map_x != null && v.map_y != null) {
    return { x: v.map_x, y: v.map_y };
  }
  if (v.lat != null && v.lng != null) {
    return latLngToPercent(v.lat, v.lng);
  }
  return null;
}
