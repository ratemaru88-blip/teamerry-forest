# Omikuji Branch Layout and Second Quip

## Scope

- Result screen only. Entry artwork/signs, all 25 original results, uniform draw selection, original character associations and dedicated shake SFX are preserved.
- The supplied woodland composition is the baseline. A clean background plate retains the upper-right branch and mossy stump, without baked-in paper, fairy or buttons.
- Existing entry fairy is reused at the branch; per-image alpha baselines align its feet. The visible branch and fairy scroll together.
- Angled paper, delivering fairy, existing quip character and first bubble fit the first portrait screen. Smaller screens prioritize this content; CTA requires scrolling.
- Navigation now follows DOM/tab order: map, Forest return, retry. Map and return share a row as in the reference; retry is below. Existing supplied button images are retained.
- A complete transparent tactile bubble bitmap replaces the clipped-looking CSS shape.

## Second Quip

Exactly the following three texts are available, chosen once per result:

1. もう一回ひく？　でも、未来が2倍分かるわけじゃないよ。
2. もう一回ひく？　いいことだけ信じる。それもあり。
3. 納得いくまで何度でもどうぞ。\n運命は自分で切り開くもの…　らしいから…

Switch only after actual scrolling (at least 32px), when CTA approaches the visible area and the first quip has finished appearing. Keep the same character DOM node/image. Only safe textContent changes, with a soft opacity/blur reveal unless reduced motion is requested. Do not reroll when scrolling back. Retry resets first/second state.

A single IntersectionObserver and passive scroll listener are installed per page. Pause disconnects the observer and cancels the text animation; resume observes again. No extra timers or Audio objects are introduced.

## Validation

- All 25 results: 320x568, 360x800, 375x667, 390x844, 412x915, 430x932 and 418x486.
- All three second-quip variants: 320px and 390px; first text retained until scroll, same character node, hidden-view pause, no reroll and retry reset.
- Stage reveal order, SFX lifecycle, map/return/retry, safe text, error recovery and docs mirrors pass the existing regression suite.
- PC Forest overlay: 1366x900, 1024x600, 1920x1080 and docs mirror. Bounds are compared to the outer iframe rectangle, because Playwright boundingBox uses top-level page coordinates.
- Screenshots inspected for initial and scrolled states, including the longest second quip.
- Physical mobile hardware and manual audible playback have not been tested.

## Artwork

Built-in image_gen was used, not the API/CLI fallback. Existing characters were not regenerated. Generated PNG originals remain under the Codex generated_images directory. Project WebP assets (format conversion only) are:

- assets/images/omikuji/result-forest-branch-v1.webp
- assets/images/omikuji/comment-bubble-soft-v1.webp
- Both are mirrored into docs/assets/images/omikuji/.

### Background Final Prompt

Use case: precise-object-edit. Asset type: portrait background plate for TeaMerry Forest omikuji result web page. Edit the supplied image non-destructively. Remove ONLY the entire parchment paper, the leaf fairy character, and all three wooden UI buttons/signs and all lettering near the bottom. Fill the removed areas naturally with the same sun-dappled clay/felt miniature forest, blurred woodland steps, moss and tiny daisies. Keep the horizontal wooden branch at the upper right in exactly its original position (about 20% of image height) and make its upper standing surface clear, without any fairy. Keep the large mossy stump in exactly its original position at about 72% height, with a clear round top. Preserve the camera, warm daylight, leaf canopy, miniature 3D handmade material, staircase, composition and colors of this reference. No paper, no characters, no text, no signs, no buttons, no new buildings. Portrait 9:16 composition. The output is ONLY a clean forest background with branch and stump, not a finished UI.

### Bubble Final Prompt

Use case: precise-object-edit. Asset type: reusable transparent speech bubble for TeaMerry Forest, text overlaid separately in HTML. Use supplied speech bubble as a starting shape. Make one complete rounded softly asymmetrical cream parchment/felt/clay speech bubble, subtle warm cream edges, gentle tactile paper grain and soft shaded 3D thickness, NOT a brown dark outline. Keep both left and right ends fully intact, never cut off, no pinched side or notch. Place a smoothly integrated curved pointed speech tail at the LOWER RIGHT edge, pointing diagonally right toward a character placed to the right of the bubble. Broad empty central area for 3 short lines of Japanese HTML text. No text, no characters, no icons, no background, genuine alpha transparency outside the whole bubble. Wide horizontal composition about 2.2:1. Keep safe transparent margins on every edge so the entire bubble and tail are visible.

## Files and Git

omikuji.html, css/omikuji.css, js/omikuji.js and their docs mirrors; the four new mirrored image assets; tools/tests/omikuji.cjs, tools/tests/omikuji-composition.cjs, tools/tests/omikuji-overlay.cjs and this record. Config and result JSON are unchanged. Unrelated modified/untracked files are preserved. Publication was approved by the user on 2026-10-13 for detailed review on their mobile phone after deployment.
