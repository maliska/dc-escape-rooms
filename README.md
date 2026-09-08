# DMV Escape Rooms

Open-source directory of escape rooms in Washington DC proper, Arlington, Alexandria, and North Bethesda, plus a private personal completion log in your browser.

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
- Custom illustrated map (public/map/dmv-art.jpg) with logo badges
- Hash routing for home, map, venue detail, and log

## Data provenance

- Seed list: docs/dmv-escape-rooms-v1.md
- Catalog: data/venues.json (no invented facts)
- Geographic focus: DC proper + Arlington + Alexandria + North Bethesda
- Out-of-focus venues remain in JSON with excluded true and are filtered from the UI
- Escape Artist DC is status uncertain (dimmed on map; hidden by default Open only filter)
- Coordinates from Nominatim 2026-09-07; map badges use hand-tuned map_x/map_y on neighborhood-labeled art

## Features

1. Home/list with filters
2. Illustrated neighborhood map with venue logo badges, overlap nudge, mobile pan/pinch
3. Venue detail with curator notes and private log fields
4. My log in localStorage only

## Logos and trademarks

Venue logos under public/logos/ are from public brand assets or favicons where available, or monogram fallbacks. All logos and brand names are trademarks of their respective owners. This project is an unofficial fan directory and is not affiliated with or endorsed by any venue.

## License

MIT — see LICENSE. Third-party logos are not covered by the MIT license.
