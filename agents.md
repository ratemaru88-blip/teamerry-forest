# TeaMerry Forest Development Guide

## Project Root

Use this repository root as the current TeaMerry Forest website source:

`C:\Users\kakao\Projects\TeaMerry_Project\WEBSITE（ホームページ）\新HP_Tea Merry Forest`

## Public Entry Files

- `index.html` is the GitHub Pages entry page.
- `forest.css` is the main stylesheet.
- `forest.js` is the main script.
- The expected GitHub Pages source is the repository root on `main`.

## Current Asset Layout

Use the current asset layout below for new references:

- UI images: `ASSETS/images/ui/`
- Effect images: `ASSETS/images/effects　/`
- Event images: `ASSETS/images/events/`
- Bird images: `ASSETS/images/events/birds/`
- Forest fairy images: `ASSETS/images/Forest Fairy（森の妖精画像）/`
- Current background videos: `ASSETS/backgrounds/決定稿_Webｍ/`
- Background master images and maps: `ASSETS/backgrounds/`
- Documents: `DOCUMENT/`

## Avoid Old Asset References

Do not add new references to these old paths unless the folders are restored intentionally:

- `ASSETS/ui/`
- `ASSETS/effects/`
- `ASSETS/events/`
- `ASSETS/birds/`
- `ASSETS/backgrounds/forest_*.webm`
- `ASSETS/Forest_Master_Map_v1.png`

When editing asset paths, verify referenced local files exist before finishing.

## Documentation

Keep project management notes in `DOCUMENT/`. `DOCUMENT/FOREST_MASTER_MAP.md` is the current master map note.

## Master Map

Use `Forest_Master_Map_v1` as the official baseline map ID for all future event placement, character movement, and lantern management.
The image file for this map is `ASSETS/backgrounds/Forest_Master_Map_v1.png`.
