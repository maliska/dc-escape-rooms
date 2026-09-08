# DMV Escape Rooms — V1 Starter Directory

**Compiled:** 2026-09-05 (America/New_York)  
**Scope:** DC + nearby VA/MD suburbs people actually reach from DC  
**Rule:** No invented facts; prices/room counts from venue sites or secondary listings; stale/uncertain flagged.

---

## V1 Venue Card Schema

Designed for a later map + personal checklist/best-times; **leaderboards out of scope**.

### Venue fields (shared / catalog)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable slug, e.g. `teg-penn-quarter` |
| `name` | string | Public venue name |
| `brand` | string | Parent brand if multi-location |
| `ownership` | enum | `chain` \| `franchise` \| `indie` |
| `city` | string | City |
| `neighborhood` | string \| null | e.g. Penn Quarter, Clarendon |
| `address` | string \| null | Full street address when known |
| `lat` / `lng` | number \| null | For map pins (fill later via geocode) |
| `website_url` | string | Marketing home |
| `booking_url` | string \| null | Direct book-now if different |
| `approx_rooms` | number \| null | Themes/experiences currently listed |
| `scare_level` | enum | `none` \| `mild` \| `mixed` \| `horror_available` \| `unknown` |
| `private_only` | boolean \| null | `true` = no shared public slots |
| `metro_accessible` | boolean \| null | Walkable or short hop from Metro |
| `metro_notes` | string \| null | Stations / caveats |
| `price_band_pp` | string \| null | Rough per-person band, e.g. `$35–45` |
| `difficulty_notes` | string \| null | Venue-level summary (per-room difficulty later) |
| `status` | enum | `open` \| `uncertain` \| `closed` |
| `last_verified` | date | ISO date of source check |
| `sources` | string[] | URLs / citations |
| `staleness_flags` | string[] | Anything outdated or conflicting |

### Personal overlay fields (per user; not on public card)

| Field | Type | Notes |
| --- | --- | --- |
| `completed_room_ids` | string[] | Checklist of finished themes |
| `personal_best_times` | map room_id → seconds | Best clear time only |
| `visited_venue_ids` | string[] | Optional venue-level checklist |
| `user_difficulty_rating` | map room_id → 1–5 | Personal feel, not public leaderboard |
| `personal_notes` | string \| null | Private notes |

### Out of scope for V1

- Global / friend leaderboards, rankings, public best times  
- Live inventory / real-time availability sync  

### Suggested room sub-entity (optional V1.1)

`room_id`, `venue_id`, `title`, `duration_min`, `max_players`, `difficulty_label`, `scare_flag`, `active`

---

## Venue table (starter list)

| Name | City / neighborhood | Address | Website / booking | ~Rooms | Notes | Price band (pp) | Status / sources |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **The Escape Game DC — Penn Quarter** | DC / Penn Quarter | 950 F St NW, Suite 106, Washington, DC 20004 | [theescapegame.com/dc](https://theescapegame.com/dc/) · [book](https://theescapegame.com/dc/book-now/) | 4 themes (Prison Break, The Depths, The Heist, Special Ops: Mysterious Market) | **Chain.** Family-friendly / low scare. Shared slots possible when not full. **Metro: yes** — Gallery Pl–Chinatown / Metro Center. | Group pkgs from ~$42; walk-up bands often ~$37–45 (verify at book) | **Open.** Sources: venue site 2026-09-05; washington.org listing. |
| **The Escape Game DC — Georgetown** | DC / Georgetown | 3345 M St NW, Washington, DC 20007 | [theescapegame.com/dc](https://theescapegame.com/dc/) · [book](https://theescapegame.com/dc/book-now/) | 5 themes (Titanic, Curse of the Mummy, Dr. Whack’s, The Cabin, Pirate’s Adventure) | **Chain.** Low scare / all-ages. Shared possible. **Metro: no direct** — bus/Circulator/rideshare; Georgetown has no Metro station. | Same brand band ~$37–45+ | **Open.** Sources: venue book-now page 2026-09-05. |
| **The Escape Game — Tysons** | Tysons, VA | 1961 Chain Bridge Rd, Unit N9L, Tysons, VA 22102 (Tysons Corner Center) | [theescapegame.com/tysons](https://theescapegame.com/tysons/) · [book](https://theescapegame.com/tysons/book-now/) | 6 themes (Prison Break, Playground, The Depths, Timeliner, Ruins, Cosmic Crisis) | **Chain.** Low scare. Shared possible. **Metro: yes** — Tysons Corner station + mall. Opened Feb 2026 (FFXnow). | Press/AAA ~$41–45; event pkgs from ~$42 | **Open.** Sources: venue site; [FFXnow 2026-02-09](https://www.ffxnow.com/2026/02/09/the-escape-game-to-open-first-virginia-venue-in-tysons-tomorrow/). |
| **Escape The Room DC — Penn Quarter** | DC / Penn Quarter | 409 7th St NW, Lower Level, Washington, DC 20004 | [escapetheroom.com/dc](https://escapetheroom.com/dc/) | 3 escape rooms (Jurassic Escape, The Dig, The Agency) | **Chain.** Mixed intensity (Jurassic hardest; not “actor scare”). Private upgrade available. **Metro: yes** — Gallery Place / Archives. | From **$37** | **Open.** Source: venue DC page 2026-09-05. |
| **Escape The Room DC — I Street** | DC / Golden Triangle / Farragut | 1720 I St NW, Washington, DC 20006 | [escapetheroom.com/dc](https://escapetheroom.com/dc/) | 5 experiences (Agency, Outbreak, Old West, Submarine + Quiz Boxing trivia) | **Chain.** Outbreak more intense; Old West family-friendly. Quiz Boxing ≠ escape room. **Metro: yes** — Farragut North/West. | From **$37** | **Open.** Brand markets **8 experiences across 2 DC sites**. Source: venue site 2026-09-05. |
| **Insomnia Escape Room DC** | DC / Glover Park | 2300 Wisconsin Ave NW #200B (also lists G-102 basement), Washington, DC 20007 | [insomniaescaperoomdc.com](https://insomniaescaperoomdc.com/) | **4 live + 1 coming** — Alchemist, Mafia, Dungeon Things, The Patient; Oblivion soon. Site also markets “5 unique rooms.” | **Indie.** **Private only.** Difficulty 7–10/10 on their scale; Patient/Dungeon more thriller. **Metro: weak** — bus on Wisconsin; nearest Metro ~30+ min walk (Woodley Park). | From **~$35** ($34.99 FAQ) | **Open.** Sources: home + FAQ 2026-09-05. Flag: room count marketing vs live list. |
| **Escape Artist DC** | DC / Near Eastern Market / Barracks Row | 720 I St SE, Washington, DC 20003 | escapeartistdc.com (**404** as of 2026-09-05) | Historically ~3 (Gallery Heist, House of Pawns, Night at the Museum) | **Indie** (one of DC’s earliest). Often cited as budget / BYOB in older writeups. **Metro: yes** — Eastern Market (Orange/Blue/Silver). | Older listings **~$20–25** — **stale** | **UNCERTAIN / likely closed or paused.** Morty marks rooms “Temporarily Closed”; official site 404; community plays logged into 2024–2025 on Morty. **Do not book without phone confirm:** (202) 999-0087. Sources: Morty; escaperoom.com; LinkedIn founder tenure end 2021 (may be incomplete). |
| **Escape Room Herndon** | Herndon, VA | 404 Elden St, Herndon, VA 20170 | [escaperoomherndon.com](https://escaperoomherndon.com/) | **6** (Operation Mittens, Maritime Mutiny, 8-Bit, Magician’s Workshop, Graverobber’s Dilemma, Cryptid Grove) | **Indie**, in-house builds since ~2016. **Private only.** Most not scary; **Graverobber’s creepier** (13+ suggested). **Metro: no** — car/Silver Line + local transit; Reston/Herndon area. | **$36–48** by group size (2/$48, 3/$42, 4/$38, 5+/$36 per FAQ) | **Open.** Sources: home + rooms + FAQ 2026-09-05. |
| **Cyber Raccoon Escape Room** | Falls Church, VA | 7201 Lee Hwy, Falls Church, VA 22046 | [dcescaperoom.com](https://dcescaperoom.com/) | **2** (Train Robbery, Space Guard) — multi-room sets, no padlocks | **Indie.** **Private games.** Story/tech-forward; family-friendly per site. **Metro: limited** — East Falls Church / drive; free parking on-site. | Group-size based; third-party ~**$40** typical / older reviews $26–50 — **verify at book** | **Open.** Sources: venue site + contact/directions 2026-09-05; wheretoescape ~$40. |
| **Bond’s Escape Room / Entertainment Center — Fairfax** | Fairfax City, VA / Old Town | 3949 University Dr Ste A, Fairfax, VA 22030 | [bondsescaperoom.com](https://bondsescaperoom.com/) | **~9** escape rooms at Fairfax (+ VR / game show at center) | **Indie multi-site** (largest selection locally). **Private.** **Horror available** (Molly’s Horror, Frightful Feast, etc.) + beginner rooms. **Metro: no** — drive / bus. Rebranded Bond’s Entertainment Center (2026). | Escape rooms **$34**/person (site) | **Open.** Sources: venue escape-rooms list 2026-09-05; Patch rebrand coverage. |
| **Bond’s Escape Room — Arlington** | Arlington, VA / Clarendon | 2800 Clarendon Blvd, Suite 910, Arlington, VA 22201 | [bondsescaperoom.com](https://bondsescaperoom.com/) | **~6** (Death by Chocolate, Sleepover Slaughterhouse, Elven Forest, Enchanted Castle, Dr. Panic’s Asylum, Saddlewood Saloon) | Same brand. **Private.** Mixed scare (Sleepover / Asylum). **Metro: yes** — Clarendon. This is the strong “Escape Room Arlington” option. | **$34**/person | **Open.** Sources: venue room list + StayArlington directory. |
| **Clue IQ** | Frederick, MD / Downtown | 103 S Carroll St #1A, Frederick, MD 21701 | [clueiq.com](https://clueiq.com/) | **4** active (Operation Jingle Bells, Crane Manor 75 min, Excalibur, Blitzkrieg) + mobile Ruluco; larger room coming | **Indie**, enthusiast-owned; award-heavy (TERPECA nominee Crane Manor). Appointment-oriented. Mild–atmospheric scare (Crane Manor Horseman theme). **Metro: no** — ~45–60+ min drive from DC; MARC possible. Relevant as “worth the trip” MD option. | 60-min **~$32–41**; 75-min **~$36–46** (birthday page tiers; +MD amusement tax) | **Open.** Sources: clueiq.com home + birthday pricing + contact 2026-09-05. |
| **Escapology — North Bethesda** | North Bethesda, MD / Pike & Rose | 11572 Old Georgetown Rd, North Bethesda, MD 20852 | [escapology.com/en/bethesda-md](https://www.escapology.com/en/bethesda-md) | **4** (Antidote, Mansion Murder, Budapest Express, Mayday) | **Franchise chain.** **Always private.** Low–moderate scare (murder-mystery themes, not jump-scare actors). **Metro: yes** — North Bethesda (Red). | ~**$36**/player (Our Kids; verify) | **Open.** Sources: Escapology Bethesda page 2026-09-05; Our Kids. |
| **Escape Room Live — Alexandria** | Alexandria, VA / Old Town | 814 King St, Floor 2, Alexandria, VA 22314 | [escaperoomlive.com](https://www.escaperoomlive.com/) | **4** (per homepage) | **Indie / regional.** Shared-by-default possible (familydaysout). **Metro: yes** — ~15-min walk from King St–Old Town. Strong DC-adjacent night-out pick. | FAQ/third-party ~**$32–38** (often cited **$37.99**) — confirm | **Open (ALX).** Sources: homepage 2026-09-05; FAQ snippets via search. **Note:** older LinkedIn also lists a Georgetown address shared with TEG — treat DC ERL as **stale/unverified**; use Alexandria. |

---

## Quick picks for Joel

| Goal | Start here |
| --- | --- |
| Metro + downtown density | Escape The Room (both), TEG Penn Quarter |
| Highest production / multi-room sets | The Escape Game (PQ, Georgetown, Tysons) |
| Private-only indie in DC | Insomnia (Glover Park) |
| Horror / scare options | Bonds (Molly’s, Sleepover, Frightful Feast, Asylum); Insomnia Patient/Dungeon |
| Best “drive to NOVA” deep cuts | Escape Room Herndon; Cyber Raccoon |
| Worth-the-drive MD | Clue IQ (Frederick); Escapology (Pike & Rose, Metro) |
| Skip / verify first | **Escape Artist DC** (site down; Morty temporarily closed) |

---

## Source & staleness log

| Claim | Source | Staleness |
| --- | --- | --- |
| TEG PQ/GT own addresses, themes, Metro notes | theescapegame.com/dc + book-now | Fresh 2026-09-05 |
| TEG Tysons open, 6 themes, mall address | theescapegame.com/tysons; FFXnow 2026-02 | Fresh |
| Escape The Room DC 2 sites, from $37, 8 experiences | escapetheroom.com/dc | Fresh |
| Insomnia address, private, from $34.99, room list | insomniaescaperoomdc.com + /faq/ | Fresh; “5 rooms” marketing vs 4 live + 1 soon |
| Escape Artist address historically SE | escaperoom.com, directories | **Stale ops status** — site 404; Morty Temporarily Closed |
| Herndon 6 rooms, private, $36–48 | escaperoomherndon.com | Fresh; FAQ 4-player price $38 vs some homepage $36 for 4+ — use FAQ |
| Cyber Raccoon address, 2 games, private | dcescaperoom.com | Fresh; exact $ band needs checkout |
| Bonds 15 rooms / $34 / Fairfax+Arlington | bondsescaperoom.com/escape-rooms | Fresh; Fairfax ~9 + Arlington ~6 |
| Clue IQ 4 rooms + pricing tiers | clueiq.com | Fresh |
| Escapology Bethesda 4 rooms, private | escapology.com Bethesda | Fresh; $36 from secondary (Our Kids) |
| Escape Room Live ALX 4 rooms | escaperoomlive.com | Fresh location; price from FAQ/third-party |

**Prices move with group size, daypart, and promos — treat bands as planning ranges, not quotes.**
