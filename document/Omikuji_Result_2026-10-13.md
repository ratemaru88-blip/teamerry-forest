# Omikuji Result Layout

## Scope

Result view plus the subsequently requested entry redesign; uniform random draw,
25 Japanese records and original shake audio remain unchanged.
No Forest runtime or shared navigation files are changed.
Root and docs copies match.

## Three Stages

1. Result paper: title, main text, love, money and lucky item. 400 ms entrance.
2. Existing full-body character and separate HTML speech bubble: 600 ms delay,
   then 400 ms entrance. The original quip and character association are preserved.
3. Image actions below the first viewport: retry on its own upper row, map on the
   lower left and Forest return on the lower right.

The result-main minimum height leaves room for the forest background and puts actions
below the initial viewport rather than compressing all three stages into one screen.
Text is dark brown on the existing paper texture. Lucky item label has its own full row.
Speech bubble and character have separate grid tracks, so neither obscures the other.
Reduced-motion mode skips animations. Hidden-tab handling pauses result animations
as well as the existing reveal timer; only dedicated omikuji audio is reset.

## Supplied Images

Original images are used unchanged:

- assets/images/buttan/mouikkai.webp
- assets/images/buttan/annaizuwomiru.webp
- assets/images/buttan/forest_go_buttan_d1.webp
- assets/images/omikuji/cyokopa_front.webp (original result-01 character)
- assets/images/omikuji/hoippu_front.webp (result-02)
- assets/images/omikuji/kakao_front.webp (result-03 and result-05)
- assets/images/omikuji/peapea_front..webp (result-04; original filename has two dots)
- assets/images/omikuji/pakku_front.webp (result-06)
- assets/images/omikuji/chachaji_front.webp (result-07)

No new character generation or asset retouching. Matching assets copied into docs.
Original cropped result PNGs and user-provided alternate WebPs remain untouched.
Accessible command names are もう一回ひく, 案内図を見る and 森へ戻る.
The supplied Forest artwork reads 森へ; accessible name describes the complete action.

## Map

A native modal dialog shows the existing forest-guide-evening.webp and 7 corner links.
Links and thumbnails are read from the authoritative index.html portal elements through
DOMParser. Forest scripts, guide characters and ambient audio are not executed.
No duplicated route table. Close button and Escape return focus to the map button.
Read failure allows retry by closing and reopening; reopening does not duplicate links.
Result stays in place when the map closes.

## Changed Files

omikuji.html, css/omikuji.css, js/omikuji.js, data/omikuji/config.json and docs mirrors;
9 supplied images and their docs copies; tools/tests/omikuji.cjs; this record.
The 25-result ja.json is unchanged.

## Verification

node tools/tests/omikuji.cjs checks root 320x568, 360x800, 375x667, 390x844, 412x915,
430x932, 667x375 landscape, 1366x900 desktop and docs 390x844.
Includes original-data parity, delayed comment, non-overlap, first-view actions below fold,
upper retry/lower map-return layout, actual image decoding, all 7 map links, Escape and
close button, repeat open, retry draw, rapid-tap guard, hidden-tab pause/resume,
audio playing/stopped state, safe text, reduced motion and data-loading recovery.
Screenshots are saved outside the repository under the omikuji-result visualization folder.
Tests use browser mobile emulation; physical iPhone/Safari and listening on a device
remain manual checks.

## Git and Deferred Work

Task started with 20 tracked modifications and pre-existing untracked user assets.
Only relevant omikuji files and the 9 explicitly requested/used images are staged.
Unrelated changes and all unused image files are left in place.
User explicitly approved publishing entry and result together after tests.

## Additional Entry Request

The ordinary white draw label is replaced by おみくじを引く on a wooden plate.
Its texture is a separately saved blank wooden plate, draw-sign-v1.webp,
edited with the built-in image generator from the supplied mouikkai.webp.
No existing asset is overwritten or new fairy generated. HTML lettering stays separate.
The label and tube belong to the same native button, so either target triggers the same
guarded draw, existing 420 ms shake and 2000 ms result delay with the original audio.
No perpetual shaking or new sounds are added.

Fairy box is 130x180 px in portrait, 84x104 in short landscape (previously 86x116).
Peek duration is 2400 ms plus the existing 350 ms entrance delay.
Random choice uses the same 10 candidates, excludes Elder and avoids immediate repeats
when localStorage is available. Desktop keeps the existing no-peek behavior.

The white upper-left Forest return is removed. Entry has one right-bottom wooden arrow
using forest_go_buttan_d1.webp, accessible name 森へ戻る. Its responsive 100-124 px square
does not cover the tube. Entry is a no-scroll full-height view.
TeaMerry Forest remains a small upper-right label. Existing shrine background is unchanged.
Tests exercise both the wood label and actual tube image as click targets, recognize the
larger fairy, verify it stays past 1.5 seconds, check entry has no scroll and verify sign bounds.
Android physical-device testing and final PC overlay redesign remain outside this change.

### Wooden Plate Asset

Project paths: assets/images/omikuji/draw-sign-v1.webp and docs mirror (720x240, alpha).
Original generated output:
C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-9a4ab3a8-68a5-429a-bf8f-52e06af77e85.png

Built-in image tool prompt:

> Use case: precise-object-edit. Edit target: the supplied TeaMerry wooden button. Make one blank horizontal old wooden sign plate for a Japanese forest shrine UI, about 3:1 ratio, isolated on genuine transparent background. Preserve its handmade warm timber grain and slightly worn irregular beveled edges. REMOVE all lettering, the repeat-arrow symbol, moss, leaves and every other decoration; fill them naturally with uninterrupted wood grain. The central face should be flat and moderately dark so cream HTML lettering is legible. Reduce glossy inflated CG feel, use gently weathered matte wood with restrained shallow depth. Front-on straight view, no perspective tilt, no support posts, no holes, no brackets, no additional objects, no text or symbols anywhere, no scenery, no cast shadow outside the plate. Do not create any character. Leave only small transparent margins around the plate.

CTA-triggered alternative remarks are not implemented: existing quips remain unchanged.
No English data, new result text, other-corner changes or final PC redesign.
