# Boku no Takaramono Publication

## Scope

- GitHub Pages: `main:/docs`, verified using the repository Pages API.
- Public origin: `https://ratemaru88-blip.github.io/teamerry-forest/`.
- SNS entrance: `?story=bokunotakaramono`.
- Final destination: `musical/boku-no-takaramono/pair-preview.html`.
- Root `index.html`, `forest.js`, `forest.css` mirrored to `docs`.
- Dedicated page HTML, JS, scratch implementation, document and seven runtime files published beneath `docs/musical/boku-no-takaramono/`.
- Sixteen referenced WebP images published beneath `docs/assets/musical/boku-no-takaramono/`: 6,304,576 bytes total.
- Public document retains the original page definition and links; unused editing-library assets are excluded. Original source project remains untouched.
- Runtime copies are isolated from the existing public TBalance editor.

## Verification

Run with Node and Playwright Chrome:

```powershell
$env:FOREST_TEST_BASE_URL='http://127.0.0.1:8788/docs'
node tools/tests/forest-musical-arrival.cjs
node tools/tests/published-musical.cjs
```

Both suites passed for PC and Mobile against the actual publication output.
Coverage includes normal/unknown-query arrivals, first/recent/15-day returning visits, saved-name reuse/change, walk-only revisit, SNS destination, Scene and Walker debug controls, four-screen asset loading, pair alignment and color reveal, Mobile production label and Kakao message.
No JavaScript page errors or missing required resources. Existing favicon 404 is excluded.

## Git Safety

- Stage only explicit publication paths and these publication tests/tools.
- Preserve unrelated modified/untracked assets, source TBalance work, and `css/observatory.css`.
- Remote main was ahead at `4c93afe`; its debug and returning-name behavior was incorporated without discarding SNS additions.
- No rename of the destination, no prototype index publication, no new Bottle Mail flow, no unrelated cleanup.

## Repeat Preparation

`node tools/tests/prepare-musical-docs.mjs` mechanically copies the required output and extracts referenced original image bytes without image conversion or giant-image merging. It requires the local original `kakao-message.tbalance` and current source runtime, which are intentionally not included as unrelated editing work in this publication commit.
