# Mobile Forest Guide Phase

## Implementation

The existing `.mobile-walker` Mint image and `showMintSpeech` bubble renderer are reused. On mobile (up to 759px), Mint remains at 50% / 60% of the viewport with a 56px image. The actor and bubble do not intercept pointer input. Movement dismisses speech; the name modal, guide map, background tab and window blur pause the guide. Desktop does not fetch guide data or run the guide heartbeat.

`data/forest-guide.json` selects `guideCharacterId`, character image and dialogue. `js/forest-mobile-guide.js` contains a small visit policy and browser adapter, outside the navigation core. All dialogue has stable IDs and uses plain text. The existing display-name accessor supplies the saved name or おさんぽさん.

## Dialogue

- `guide_entry`: short greeting with the visitor's display name and both navigation choices.
- `guide_map_hint`: the upper-right guide map.
- `guide_stroll_hint`: walking farther with the lower-left stick.
- `guide_pc_sunset`: the gradually changing sunset on desktop.
- `guide_cacao_hint`: an occasional appearance by Cacao.
- `guide_observatory`: bottle letters and wishing stars, when its world anchor is visible.
- `guide_omikuji`: the forest fortune, when the shrine is visible.

The complete Japanese text is in the JSON. Future characters can supply another character ID, image and matching dialogue. Random character selection and new events are intentionally not implemented.

## Frequency

Entry speech occurs once after the existing entrance/name flow. Subsequent speech requires at least 120 seconds since the last speech. Idle hints require 45 seconds without interaction, occur at most once per visit, and alternate between two hints across visits when storage is available. Walking hints require at least 15 seconds of observed walking and movement within the last 30 seconds; they wait until input is released. Nearby corner hints have priority. Each ID is used at most once; the whole visit is capped at four speeches. Each bubble closes after six seconds. Returning from a paused state restarts the quiet cooldown; no queued speech is replayed immediately.

Existing mobile speech filtering is retained, and `.forest-narration` is hidden only on mobile. Desktop narration, time presets, background effects, audio and events are not redesigned. The compact evening guide-map UI is unchanged; only its former entry-speech timer is removed to avoid duplicate guidance.

## Changed Files

- `index.html`, `forest.js`, `js/forest-mobile-navigation.js`: stylesheet/script wiring, small shared speech adapter and removal of duplicate entry speech.
- `css/forest-mobile-guide.css`, `js/forest-mobile-guide.js`, `data/forest-guide.json`: guide display, policy and configuration.
- The same six files under `docs/`: deployment mirror.
- `tools/tests/mobile-forest-guide.cjs`: deterministic policy tests.
- `tools/tests/mobile-forest-navigation.cjs`: companion, names, bubble dismissal, paused display and existing navigation/desktop regression assertions.
- This implementation record.

## Verification

Policy tests cover cooldown, idle after a full day, alternate idle hints, walking input, proximity priority, pause, four-speech limit and future character selection. Browser regression checks cover 320x568 (SE-sized), 375x667, 390x844, 412x915 and the docs mirror; real Chromium touch input, keyboard directions, swipe, boundaries, map links and images, named/anonymous visitors, automatic bubble closure and window blur. Desktop checks cover Mint, camera drag, background media, day/evening-a/evening-b/night and responsive transitions. The existing guide-map suite also checks all seven destination rows and compact map layout.

Physical iOS/Safari and Android devices remain a follow-up check. This phase does not implement character rotation, short videos, new forest events, sound changes or TBalance changes.

## Git Safety

The initial checkout had 20 modified tracked paths and 89 untracked path groups. Existing name-modal copy and unrelated observatory/TBalance/assets changes are left unstaged. Only guide changes are committed, using partial staging for shared HTML/JS files. No restore/reset/clean or force push is used.
