# Musical Feedback Connection 2026-10-08

## Authority / Actions

- Saved source: C:/Users/kakao/Downloads/僕の宝物 (11).tbalance (2026-10-08 05:15 JST).
- Connected Native output: musical/boku-no-takaramono/feedback-flow.tbalance; same page in docs copy.
- PC: lyr_db4f6f6480b84ae3; 1920x1080 screen, four-screen page.
- Mobile: lyr_81d9c73753d44c63; 1080x1920 screen, four-screen page.
- Both saved HitAreas retain every layout, appearance, override and Stable ID.
- Action: page -> #musical-feedback -> page Adapter -> dialog -> existing TeaMerrySubmissions.send(musical_feedback).
- Native behaviors array remains empty. No TeaMerry-specific Core changes.
- User approved retaining published message Action for lyr_e0e27ee946f94375, absent in latest saved file.
- Original Downloads file and old Native copies were not rewritten.

## Workflow / Verification

1. Source inspected; two Actions connected; approved message Action retained.
2. Local Native renderer / Standard Web preview: PC and Mobile HitAreas open dialog.
3. Isolated Native editor import, PC/Mobile TEST rendering, saved Action check and FINAL completion PASS.
4. Standard Web artifacts regenerated from the same Native page after FINAL, with byte-identical image extraction.
5. Root/docs 1440px/390px: layout equals saved Native coordinates, dialog bounds, optional name, anonymous 300, 301/empty refusal, success, failure retention, retry ID PASS.
6. Reduced 360px viewport height: form remains in viewport, textarea internal scrolling PASS. Physical phone keyboard was not tested.
7. Existing four-screen color reveal, assets, Mobile production label and approved Kakao message PASS.
8. Bottle/wish mocked sends, failure retention, localStorage, existing Reaction Set and 3-line progression + initial Dialogue restoration PASS.
9. Live Google via new HitArea: 2026-10-08 05:28:24 JST, anonymous TEST saved as 未確認; musical count2 / total4. Existing TEST rows retained.

Native editor TEST verifies Native rendering/Action; site-specific form Adapter is exercised in Standard Web preview, not installed into Core. FINAL itself is the repository's existing checklist; actual layout/form/network checks are separate automated and live tests.

## Narrow Regression Fix

Existing fairy-area pointer-events:none blocked PC 3-line progression. Reaction start/end now toggles is-reaction-active on existing fairy/bubble; shared CSS allows clicks only during the sequence. No random conversation behavior, placement or dialogue data changes.

## Publication Scope

- root/docs js/submission-config.js, js/submissions.js, js/musical-feedback.js, css/submissions.css.
- root/docs observatory.html/js: previously implemented saving prerequisites plus reaction-only pointer fix; root/docs differences preserved.
- root/docs musical/boku-no-takaramono pair-preview.html/js and feedback-flow.tbalance.
- root musical assets (16 byte-identical copies of existing docs assets), scratch.js and fixed runtime copies required by generated Standard Web output.
- tools/submissions-gas receiver source/manifest/README and readonly preview server; existing deployed API unchanged.
- tools/tests/submissions.cjs, submissions-live.cjs, prepare-feedback-flow.mjs, feedback-native-final.cjs; this record.

TBalance Core changes, registry changes, user-adjusted css/observatory.css positions, unrelated untracked assets/materials/Native projects remain outside staging. No broad git add, restore, clean, reset, deletion or force push.

## Public Verification

Pending publication commit/push and one TEST submission from GitHub Pages. Final SHA, sync status and live counts are reported in the chat after verification.
