# Forest Home Screen Guidance

## Existing Setup

The existing manifest contained only 192px and 512px TeaMerry icons. The entry page also references the existing Apple touch icon. No service worker, browser-install event handler, standalone display setting, or visit counter existed.

The existing teaMerryLastVisitAt timestamp is read before forest.js updates it. A valid previous timestamp makes the current entry a returning visit. No separate visit counter or name storage is added. If storage is unavailable, optional guidance stays suppressed.

## Implementation

- Manifest now supplies name, short_name, relative id/start_url/scope, standalone display and forest theme colors; existing icons are retained.
- No service worker or asset caching is added. This avoids introducing stale video/audio/page caches into the existing website. Native promotion is browser-dependent.
- forest-home-screen.js captures beforeinstallprompt without invoking prompt automatically.
- Only the explicit affirmative button calls the retained browser confirmation, within the click's user activation. A browser decision remains required.
- Without a browser confirmation, iOS receives the short Safari share-menu instruction; Android receives a short browser-menu instruction. Neither claims that the icon was added.
- display-mode standalone, navigator.standalone and the recorded appinstalled event suppress further offers.
- Standard browser tabs cannot reliably detect every icon previously added externally. This limitation remains.
- Mobile OS detection plus the existing 759px mobile breakpoint prevents PC offers, including narrow desktop windows.
- The dialogue and button labels live in forest-guide.json, not Mint-specific code. Current actor and renderer are reused.
- Offers wait at least 15 seconds after entering, five seconds without interaction, and until welcome/other speech has finished.
- Existing guide readiness blocks name input, any open dialog, map, hidden tab and blur. Active movement blocks offers. Eligible corner-specific dialogue takes precedence over the offer; the offer takes precedence over ordinary chatter.
- The small buttons use the existing guide bubble. They do not initiate forest dragging.
- Each page visit can show at most one offer. Explicit dismissal and the manual-help path record teaMerryHomeScreenDismissedAt; offers are suppressed for seven days.
- No automatic addition, notification permission, or device upload is performed.

## Changed Files

manifest.json, index.html, data/forest-guide.json, css/forest-mobile-guide.css, js/forest-mobile-guide.js, new js/forest-home-screen.js, and their docs mirrors. New test: tools/tests/forest-home-screen.cjs.

## Verification

Automated Edge tests with Android/iPhone user agents cover first visit, returning visit, user-gesture-only native prompt invocation (simulated event), iOS/manual Android instructions, seven-day suppression and expiration, installed/standalone states, PC and narrow PC suppression, map/modal and movement suppression, blocked storage and docs mirror. Compact 320x568 screenshots and button hit-testing verified.

Existing name/welcome, idle/corner dialogue, mobile navigation and omikuji overlay regression tests passed. Actual Android/iPhone OS confirmation and home-icon launch still need physical-device verification after publication. The user approved committing and publishing only this batch on 2026-10-14.

## References

- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://support.apple.com/en-gb/guide/iphone/iph42ab2f3a7/ios
