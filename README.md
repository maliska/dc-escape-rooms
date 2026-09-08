# DMV Escape Rooms

Open-source starter directory of escape rooms in **Washington, DC** and nearby **VA/MD** suburbs, plus a **private** personal completion log (checklist, best times, notes) stored in your browser only.

V1 is intentionally small: filterable list, OSM map pins, venue detail pages with curator notes, and localStorage "My log." No accounts, no public leaderboards, no live booking inventory.

## How to run

```bash
npm i && npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

## Stack

- Vite + vanilla JavaScript (ES modules)
- Leaflet + OpenStreetMap tiles (no API key)
- Hash routing (`#/`, `#/map`, `#/venue/:id`, `#/log`)

## Data provenance

- Seed list and schema: `docs/dmv-escape-rooms-v1.md` (compiled 2026-09-05).
- Structured catalog: `data/venues.json` — converted from that table; **no invented facts**.
- **Escape Artist DC** is kept as `status: "uncertain"` (site 404 / Morty temporarily closed) and is hidden by the default "Open only" filter, but still appears when status = All / Uncertain (with badge).
- Coordinates: geocoded once with Nominatim (OpenStreetMap) on 2026-09-07 and **committed** in `venues.json`. User-Agent documented in the JSON `geocode` block. If a venue cannot be geocoded, it stays in the list without a map pin.
- Prices are planning bands only — they move with group size, daypart, and promos.

## Features (V1)

1. **Home / list** — filters for city, neighborhood text, scare level, coarse price band, Metro access, and status (default hides closed/uncertain).
2. **Map** — Leaflet + OSM pins for venues with lat/lng.
3. **Venue detail** — curator notes from the seed Notes column, links, and inline private log fields.
4. **My log** — visited checklist, personal best times, and notes in localStorage only.

## Out of scope (V1)

- Global / friend leaderboards or public best times
- Live inventory / real-time availability
- Accounts, auth, or cloud sync
- Monetization / paid map keys
- Hosting (TBD — static `dist/` is fine for any static host)

## License

MIT — see LICENSE.
