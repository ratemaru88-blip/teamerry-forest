# Musical Mobile Scroll Rail

## Scope

Added mobile-scroll-rail.js/css to the musical pair-preview page and docs mirror. No changes to scratch.js, pair-preview.js, Native data, renderer, drawing/reveal algorithms, hit areas, persistence or feedback behavior.

## Behavior

- Only the musical's mobile layout at viewport width <=720px gets the rail; normal/forced PC mode is hidden. Other forest/blog pages do not load these files.
- A fixed 32px touch target at the right edge contains a low-contrast 6px track and 12px thumb. Safe-area insets are respected.
- Drag down to scroll down, up to scroll up. Delta maps to the viewport's scroll range and thumb travel, clamped to valid bounds.
- Track touches retain the initial scroll position; there is no jump-to-position behavior.
- Pointer capture allows the finger to leave the rail without losing the drag. A second non-primary touch cannot start another drag.
- Pointerup, pointercancel, lost capture, blur, pagehide, hidden document and resize release drag state.
- The rail is outside the stage, so its gestures do not reach any drawing listener. Existing canvas touch-action:none remains unchanged.
- Thumb/ARIA position follows existing scrolling, content size and viewport changes. Scrollbar keyboard controls support arrows, PageUp/PageDown and Home/End.

## Verification

tools/tests/musical-scroll-rail.cjs: Android/iPhone-equivalent native Chromium touch input at 390x844, 375x667 and compact 320x568, plus docs mirror. No initial/regrab jump, bidirectional movement, no drift after release, capture outside the rail, cancel/restart, keyboard limits, untouched drawing counters, canvas draw/no-scroll, blur and resize cleanup passed. PC and forced-PC rail-hidden checks passed.

Existing desktop/mobile musical image/layout/reveal/message/dependency regression passed. Existing scratch-touch-scroll regression verifies independent canvas drawing, outside scrolling, cancellation/reset and PC mouse reveal.

Screenshots reviewed. These are emulated touch tests, not physical iPhone/Safari or Android hardware checks. No commit or push requested.
