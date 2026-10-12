# Compact Evening Mobile Guide - 2026-10-12

## Scope
Guide UI only. Existing camera/stick, Mint, sounds, events, desktop interface and TBalance core are unchanged.
The same seven portal names, routes and numbering remain authoritative.

## Appearance
- Removed the prior introductory explanation, row descriptions, large card layout and "いく" labels.
- Small evening overview above compact number + original portal artwork + name rows.
- Map markers are 17px including 1px borders (formerly 28px content size); glyphs are 14px (formerly 22px).
- Row number: 14px. Original artwork: 42x36px, visible at every mobile width including SE.
- Rows: minimum 48px height, entire row clickable; subtle border, 5px corner radius and faint shadow.
- Names: 16px; the long fortune-cookie name can break at its word boundary if required.
- Map note: "時間とともに、森の表情が変わります。" at 12px, below the overview.
- White dialog background and fixed close/header maintained.
- Scrollable content retained only where necessary. Short landscape viewport keeps the 280px overview cap.
- Marker/card numbers remain ① game, ② fortune cookie, ③ shrine, ④ hot spring, ⑤ cave, ⑥ tea room, ⑦ observatory.

## Image
Source: assets/backgrounds/Forest_Master_evening_A_v..png. This is the brighter existing evening variant; no scenery was redrawn.
Output: assets/backgrounds/forest-guide-evening.webp and identical docs copy.
Conversion: Sharp resize to 960x540, WebP quality 86, effort 6. No cropping or pixel-level color change.
Output size: 194382 bytes, versus the former day overview PNG's 4656655 bytes (approximately 96% smaller).
A guide-image-only CSS brightness(1.08) makes terrain readable while retaining the sunset appearance.
Source/master images were not edited.

## Changed Files
- css/forest-mobile-navigation.css and docs/css/forest-mobile-navigation.css
- js/forest-mobile-navigation.js and docs/js/forest-mobile-navigation.js
- index.html and docs/index.html: only the mobile guide CSS/JS cache references
- assets/backgrounds/forest-guide-evening.webp and docs/assets/backgrounds/forest-guide-evening.webp
- tools/tests/mobile-forest-guide-map.cjs
- document/Mobile_Guide_Compact_Evening_2026-10-12.md

## Verification
Updated guide tests cover 320x568, 375x667, 390x844, 412x915, 667x375 and docs mirror:
- Evening WebP decodes; seven small markers match seven row numbers.
- All existing UI images remain visible, including 320px width.
- Explanatory introduction, descriptions and "いく" controls are absent.
- Rows remain 44-56px high and fit without overflow.
- Taller phones show all seven rows without scrolling; SE needs less than half a screen of scrolling.
- All seven existing link targets are checked through whole-row clicks with navigation-request interception.
- Native touch scrolling when needed, close/Escape, unchanged camera position and stick restoration.
Existing navigation regression tests verify camera, stick, names, Mint and PC/time presets.
Physical Safari/device checks remain outstanding.
Local Chrome and Edge guide checks passed for all listed sizes and docs mirror. Camera/stick/Mint/PC regression checks passed. Screenshots confirm 390x844 shows the full overview and all seven rows without scrolling.

## Git Safety
Only task-related paths/hunks are staged. Existing name-message changes in both HTML files are not included.
No existing modified/untracked content is reverted, deleted, reset, cleaned or moved.
Baseline:
```text
M css/observatory.css
 M data/tbalance/project-assets.json
 M docs/forest.js
 M docs/index.html
 M docs/observatory.js
 M docs/tools/tbalance/tbalance-renderer.js
 M forest.js
 M index.html
 M observatory.js
 M tools/tbalance/ai-bridge/server.mjs
 M tools/tbalance/index.html
 M tools/tbalance/launch-tbalance.ps1
 M tools/tbalance/native/native-asset-storage.mjs
 M tools/tbalance/native/native-assets.js
 M tools/tbalance/native/native-migration.js
 M tools/tbalance/native/native-schema.js
 M tools/tbalance/tbalance-renderer.js
 M tools/tbalance/tbalance.css
 M tools/tbalance/tbalance.js
 M tools/tests/submissions.cjs
?? TeaMerry_Dialogue_Spreadsheet_Template.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template.xlsx
?? TeaMerry_Dialogue_Spreadsheet_Template_Elder.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Forest.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Lil.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Maroud.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Mint.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Other.tsv
?? _codex_screenshots/
?? assets/backgrounds/external-background-test-20260921-02.webp
?? assets/backgrounds/external-background-test-20260921-03.webp
?? assets/backgrounds/external-background-test-20260921.webp
?? assets/backgrounds/observatory_day_pc_v02.webp
?? assets/backgrounds/observatory_night_pc_v02.webp
?? assets/characters/
?? assets/icons/tbalance.ico
?? "assets/images/Corel 自動保持/"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Berry_ a small ch_.png"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Bumpy_ a small ro_.png"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Lemon_ a small ch_ (1).png"
?? assets/images/tea_room/tea_room_mobile_bg_03.webp
?? assets/images/ui/ぼつ/
?? assets/images/yunokaori/chachaji_front_正面１.png
?? assets/images/吹きだし画像/
?? assets/other/
?? assets/sounds/bottle_water_landing_v01.mp3
?? assets/sounds/kan_ge_kawa06.mp3
?? assets/sounds/sei_ge_mizu_chapon02.mp3
?? assets/sounds/soundreality-bubble-pop-reverb-424582.mp3
?? assets/sounds/yunokaori_bgm.mp3
?? assets/tbalance-projects/
?? data/bottle_mail/Lill_Action_Reactions_v01.csv
?? data/bottle_mail/Lill_Action_Reactions_v01.xlsx
?? data/dialogue/Lill_Action_Reactions_v01.xlsx
?? data/dialogue/dialogue.connection-test.json
?? data/tbalance/projects/
?? document/Forest_2026-10-06_ぼくの宝物SNS導入.md
?? document/Security_Backup_Codex_Audit_2026-10-07.md
?? document/Submission_System_2026-10-08.md
?? document/TBalance_2026-10-04_TESTの画面内スクロール.md
?? document/TBalance_2026-10-04_作品別ライブラリーと容量.md
?? document/TBalance_2026-10-04_再開と背景保存.md
?? document/TBalance_2026-10-04_当たり判定とページ内スクロール.md
?? document/TBalance_2026-10-04_画像ライブラリー整理.md
?? document/TBalance_2026-10-04_画面ごとの編集.md
?? document/TBalance_2026-10-04_縦スクロール.md
?? document/TBalance_2026-10-06_Mobile本編制作中札.md
?? document/TBalance_2026-10-06_PC-Mobileカラー白黒ペア展開.md
?? document/TBalance_2026-10-06_PC1カラー白黒ペア_Phase1.md
?? document/TBalance_2026-10-06_カカオ吹き出し対応.md
?? document/drift-bottle-letter-mobile-after-rebase.png
?? document/drift-bottle-letter-mobile-final.png
?? document/drift-bottle-letter-mobile.png
?? document/drift-bottle-letter-pc-after-rebase.png
?? document/drift-bottle-letter-pc-final.png
?? document/drift-bottle-letter-pc.png
?? document/submissions-test/
?? musical/boku-no-takaramono/README.md
?? musical/boku-no-takaramono/all-color-reveal-complete.tbalance
?? musical/boku-no-takaramono/all-color-reveal.tbalance
?? musical/boku-no-takaramono/assets/
?? musical/boku-no-takaramono/bridge-core.js
?? musical/boku-no-takaramono/chapter-01.tbalance
?? musical/boku-no-takaramono/chapter-02.tbalance
?? musical/boku-no-takaramono/chapters.json
?? musical/boku-no-takaramono/editor.css
?? musical/boku-no-takaramono/editor.js
?? musical/boku-no-takaramono/index.html
?? musical/boku-no-takaramono/kakao-message.tbalance
?? musical/boku-no-takaramono/launch-phase1.ps1
?? musical/boku-no-takaramono/layout-isolation.js
?? musical/boku-no-takaramono/mobile-production-label.tbalance
?? musical/boku-no-takaramono/page.css
?? musical/boku-no-takaramono/page.js
?? musical/boku-no-takaramono/pc1-color-reveal.tbalance
?? musical/boku-no-takaramono/pc1-preview.html
?? musical/boku-no-takaramono/pc1-preview.js
?? musical/boku-no-takaramono/serve-phase1.cjs
?? tools/maroudo-board-editor/まろーど掲示板エディター＿手順書.png
?? tools/tbalance/native/add-mobile-production-label.mjs
?? tools/tbalance/native/configure-kakao-message.mjs
?? tools/tbalance/native/create-pc1-background-pair.mjs
?? tools/tbalance/native/extend-background-pairs.mjs
?? tools/tbalance/normal-web-workflow.js
?? tools/tbalance/project-size.js
?? tools/tbalance/recent-projects.js
?? tools/tbalance/scroll-layout.js
?? tools/tbalance/tests/
?? tools/tests/mint-name-message.cjs
```
