# Omikuji Staged Reveal and Specified Sign

## Files and Preservation

Changed: omikuji.html, css/omikuji.css, js/omikuji.js, data/omikuji/config.json,
their docs copies, tools/tests/omikuji.cjs, this record.
Assets: supplied omikuji_kanban2A.webp and new paper-deckle-v1.webp, with docs copies.
The Japanese 25-record JSON, equal-probability selector, original character associations,
quip texts and original shake audio are unchanged.
No Forest, observatory or TBalance runtime files are modified by this task.

## Entry

assets.drawSign in data/omikuji/config.json is the authoritative replacement path:
./assets/images/omikuji/omikuji_kanban2A.webp.
The HTML image fallback is marked with a comment; load() uses the configured path.
The supplied sign already contains lettering, so no visible HTML label is overlaid.
An offscreen label and native button accessible name remain おみくじを引く.
Sign and tube share the guarded native draw button.
The sign no longer changes to explanatory text while drawing.

Existing 10-fairy random pool, Elder exclusion and no-immediate-repeat selection are retained.
Peek lasts 4000 ms after the 350 ms entry delay.
The 130x180 portrait/84x104 landscape fairy fades over 800 ms in both directions,
without the former quick sideways slide or rotation change.
Desktop remains no-peek. Right-bottom Forest return is preserved.
Draw wait remains 2000 ms and shake remains 420 ms with the original sound.

## Result Sequence

The reference image is a visual guide, not replacement fortune text.
Paper has torn edges and is rotated -1.4 degrees with readable dark text.
The former eyebrow 森から届いた、今日の一枚 is removed.
All text remains separate editable HTML, not baked into paper.

CSS animation schedule relative to result reveal:

- 0 ms: paper fades/rises over 400 ms.
- 300 ms: title fades from a subtle blur over 450 ms.
- 500 ms: main text appears over 550 ms.
- 800 ms: love rating appears over 400 ms.
- 950 ms: money rating appears over 400 ms.
- 1100 ms: lucky item appears over 400 ms.
- 1800 ms: existing character and bubble appear together over 450 ms.

Animations use is-revealing; retry restarts the same timeline without new timers/listeners.
Hidden-tab pause freezes animation play state, alongside the existing timer/audio handling.
Reduced-motion preference displays content without animations.
The bubble/character grid has zero gap and a speech tail into the character's transparent
margin; character does not cover paper or bubble text.
Existing upper retry/lower map-return action arrangement stays below the first viewport.
Accessible retry label/title/alt are もう一回引く. The unchanged supplied mouikkai.webp
artwork reads もう一回ひく, as in the supplied final reference image.

## Paper Asset

Built-in image tool, transparent edit of:
C:/Users/kakao/Desktop/森の大吉 fortune card.png

Generated original:
C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-903323a9-38de-4965-b654-9c074244b3a8.png

Project outputs: assets/images/omikuji/paper-deckle-v1.webp and docs mirror,
resized to width 640 with alpha retained. Existing paper and character assets are untouched.

Prompt:

> Edit target: the supplied Japanese forest fortune illustration. Extract ONLY its large pale warm cream handmade aged-paper sheet as a standalone transparent-background website asset. Remove ALL characters, ALL writing, icons, ratings, decorative lines, buttons, tree/forest background, speech bubble and objects; fill their areas with uninterrupted subtle paper fibers. Keep softly torn irregular deckle edges and gentle aged-paper texture, matte low contrast and light enough for dark brown HTML text. No leaves or decorations inside the writing area, no baked-in shadows from characters. Make the paper straight upright, near-rectangular portrait 3:4, filling the canvas with only a tiny transparent margin. The website adds a slight rotation and all text separately. No new fairy or character, no text anywhere, no border/frame. Genuine alpha transparency around the paper.

## Verification and Publication

node tools/tests/omikuji.cjs covers 320, 360, 375, 390, 412 and 430 portrait widths,
667x375 landscape, 1366x900 desktop and docs mobile.
Checks specified sign decode, unchanged sign text while drawing, paper before title,
ordered animation delays, no eyebrow, result data/source parity, non-overlap, below-fold
actions, retry, map open/close, actual corner navigation, Forest return, hidden-tab audio
stop/pause, safe text, reduced motion and failed-load recovery.
Screenshots: external omikuji-staged visualization folder.
Physical Android/Safari testing remains manual.

Git commit/push is not automatic: request explicitly requires final user approval.
User reviewed the local version and explicitly approved publishing after tests.
Existing unrelated modifications and untracked assets are preserved.
