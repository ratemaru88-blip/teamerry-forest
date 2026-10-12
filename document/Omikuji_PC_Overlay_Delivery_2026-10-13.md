# Omikuji: PC Overlay and Delivering Fairy

## Scope

- Desktop Forest keeps its existing page, camera and ambient audio. The shrine portal opens a native dialog containing the existing omikuji page in a portrait iframe.
- Window width is at most 420px; height is 88dvh, capped at 900px. Its contents scroll internally. Mobile remains a full-page experience.
- Forest return, close icon and Escape stop only dedicated omikuji audio/timers before removing the iframe. Direct desktop omikuji links open the same window after the existing Forest welcome dialog.
- Entry fairy stands in front of the tube without cropping, stays approximately 3 seconds and fades over 800ms. The existing sign is smaller (at most 255px).
- The selected entry fairy is retained for the draw and appears at the top edge of the result paper. Elder remains excluded.
- Reveal order: paper, title/body/ratings/item, delivering fairy at 1500ms, quip character and bubble at 2100ms. Retry selects the next entry fairy.
- Result spacing no longer stretches the first screen merely to hide buttons. All original 25 fortunes and their quip character associations remain unchanged.

## Files

- `omikuji.html`, `css/omikuji.css`, `js/omikuji.js`, `data/omikuji/config.json` and their `docs/` mirrors.
- New `css/forest-omikuji-overlay.css`, `js/forest-omikuji-overlay.js` and their `docs/` mirrors.
- `index.html` and `docs/index.html`: only the new overlay stylesheet/script imports belong to this change. Preexisting welcome-message edits must not be staged with this work.
- `tools/tests/omikuji.cjs`, `tools/tests/omikuji-overlay.cjs`.

## Verification

Headless Microsoft Edge / Playwright:

- Mobile: 320x568, 360x800, 375x667, 390x844, 412x915, 430x932; landscape 667x375; docs mirror 390x844.
- All 25 results: first-screen fit and identical entry/result fairy at 320x568, 390x844 and the compact PC iframe size 418x486.
- Desktop: 1366x900, 1024x600, 1920x1080; docs mirror 1366x900.
- Windows with a portrait content height of at most 520px use tighter spacing while preserving readable text; no artificial blank space is added to push buttons below the fold.
- Forest video renders behind the dialog. Return preserves the camera snapshot and parent looping-audio state; dedicated sound is stopped before iframe removal.
- Repeated open/close, Escape, retry, map, direct desktop links, visibility pause, safe text rendering and data-load recovery pass.
- Visual screenshots inspected for mobile entry/result and desktop Forest overlay.
- Real physical mobile hardware and manual audible playback have not been tested.

Unrelated modified/untracked files are preserved. The user confirmed publication after local verification.
