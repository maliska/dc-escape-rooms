import catalog from '../../data/venues.json';

export const venues = catalog.venues;
export const catalogMeta = {
  generatedFrom: catalog.generated_from,
  compiled: catalog.compiled,
  geocode: catalog.geocode,
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
