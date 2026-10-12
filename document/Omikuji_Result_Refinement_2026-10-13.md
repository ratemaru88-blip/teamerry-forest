# Omikuji Result Refinement - 2026-10-13

## Scope

- Result paper reduced from 80% to 72% width, left margin from 8% to 4%, and 430px/54svh to 400px/50svh minimum height. Upper spacing increased on regular portrait screens; short-screen text remains readable.
- Entry-selected fairy moved outward and aligned by its existing alpha foot baseline with the branch in the single background. ResizeObserver keeps the branch position synchronized with the complete result document height, including longer second quips.
- Removed the separate first-viewport background layer. One scrolling background image stretches over the complete result page, including map, Forest return and retry controls.
- Same character retained for the second quip. The bubble becomes taller, changes tilt/position and reappears with a 650ms fade/pop animation. Reduced-motion mode changes shape without animation. Existing pause/reset behavior cancels the animation.
- Replaced the baked-in downward bubble tail with a single upper-right side tail. Removed the supplementary CSS tail. Existing character and button assets preserved.
- Three second quips, original 25 results, draw logic, SFX and entry layout preserved.
- Bubble text reduced to 13px (12px on narrow/short portrait screens). Increased internal top/bottom padding and reserved 22% on the tail side and 12% on the left. Verified long second quips visually at 320px and 390px without crossing the rounded edge.

## Verification

- Composition tests: all 25 results at 320x568, 360x800, 375x667, 390x844, 412x915, 430x932 and 418x486.
- Three second-quips at 320px and 390px: same character, no reroll, retry reset and hidden-tab protection.
- Regression suite: mobile/landscape, docs mirror, safe text, loading recovery, navigation and audio state.
- PC overlay suite: 1366x900, 1024x600, 1920x1080 and docs mirror; Forest state preserved.
- Physical mobile hardware and audible playback not tested.

## Publication

Publication approved by the user on 2026-10-13 after final tail correction and verification. Unrelated modified and untracked files preserved.

## Side Tail Asset

Built-in image_gen edit mode, transparent output, inspected before use. Original bitmap preserved. Format conversion only via sharp.

Saved project asset: assets/images/omikuji/comment-bubble-side-v2.webp

Deployment mirror: docs/assets/images/omikuji/comment-bubble-side-v2.webp

Original output: C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-f49feeee-d715-4c3c-ae96-4b53999a7805.png

Final prompt:

Use case: precise-object-edit. Edit target: supplied TeaMerry cream speech bubble. Keep the same warm rounded soft 3D paper/clay material and wide empty text area. Remove the existing downward tail COMPLETELY. Instead make ONE clearly visible tapered curved tail protruding from the RIGHT SIDE at about 40 percent of bubble height, pointing horizontally right and slightly upward toward a speaker's face, never downward. Tail root smoothly merges with the rounded right edge, tail tip at far right around 30 percent height. Broad main bubble about 85 percent of total width, tail about 12 percent. Complete intact left/right curves, safe margins, subtle texture and soft shaded thickness. Genuine transparent alpha outside. No text, no character, no shadow backdrop, no bottom tail, no second tail. Wide landscape reusable UI asset.

## Final Face-Directed Tail

The upward horn was replaced following user feedback. Only comment-bubble-face-v3.webp is referenced in the final CSS. The intermediate side-v2 asset remains local and is not needed for deployment.

Built-in image_gen edit mode, transparent output. Saved asset: assets/images/omikuji/comment-bubble-face-v3.webp; mirrored in docs/assets/images/omikuji/comment-bubble-face-v3.webp.

Original output: C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-d3b1634c-3e83-4f90-a7f8-d5cb586a69c3.png

Final prompt:

Use case: precise-object-edit. Input is the edit target, a TeaMerry cream rounded dimensional speech bubble on transparent alpha. Preserve its broad empty rounded main body, soft warm paper/felt/clay texture and thickness. Change ONLY the right side tail: REMOVE the upward-pointing horn completely. Add ONE small tapered gently curved tail rooted at the UPPER RIGHT shoulder at 30 percent height, extending horizontally to the right and bending SLIGHTLY DOWN so its tip is at 50 percent height (the vertical middle of the bubble). It points toward the face of a speaker beside the bubble at the right, NOT into the sky and NOT toward the ground. Root near x84%,y30%; tip near x97%,y50%. Keep intact round ends and margins, no extra bottom or top tail, no text, no character, no background. Genuine alpha outside. Wide horizontal asset.
