# Omikuji Result Composition

## Visual Baseline

Use the supplied `森の大吉 fortune card.png` as the composition baseline, not merely a list of elements to fit. Existing result data, draw selection, dedicated shake sound, entry fairy identity and navigation remain unchanged.

## Layout

- Paper layout width: 80%, left offset: 8%, rotation: -4 degrees. The delivering fairy rests near its upper-right corner.
- Body: 15px / 1.5; short portrait windows: 14px / 1.4. The title is centered, with a leaf divider and dotted separators between rating rows.
- The fairy is 140x160px, or 116x134px in shorter windows, instead of the previous 84x100px.
- Quip character: 144x184px at lower right; smaller-window variants keep the full character visible. The parchment-shaped bubble sits to its left and slightly above, with its tail pointing toward the character.
- The paper and quip area are closely connected. Buttons follow naturally with a 12px margin; no artificial viewport-height spacer hides them.
- Retry remains above the side-by-side map and Forest-return buttons. Existing supplied button assets are preserved.
- Paper, text, fairy and quip continue to reveal in that order. Text retains opacity/blur ink animation.

## Validation

- `tools/tests/omikuji-composition.cjs`: all 25 results at 320x568, 360x800, 375x667, 390x844, 412x915, 430x932 and 418x486. Checks paper width/angle, full first-screen content, connected bubble/character, unchanged fairy identity and text/viewport overflow.
- `tools/tests/omikuji.cjs`: data, uniform selection, assets/docs mirror, stage timing, SFX lifecycle, retry, visibility pause, safe text, error recovery and navigation.
- `tools/tests/omikuji-overlay.cjs`: three PC viewport sizes plus docs mirror, Forest preservation, iframe result/map/retry, repeated close, Escape, sound stop and direct-link handling.
- Screenshots inspected against the supplied composition, including `森の大吉` with Mint and Cacao and the longest result on a small screen.
- Physical mobile devices and manual audible playback have not been tested.

## Files and Safety

Only `css/omikuji.css`, `omikuji.html`, their docs mirrors, related tests and this note are changed. Entry layout, Forest scripts, config, JSON result data and omikuji JavaScript are untouched. Preexisting unrelated modified/untracked files are preserved. The user approved publication after reviewing the composition.
