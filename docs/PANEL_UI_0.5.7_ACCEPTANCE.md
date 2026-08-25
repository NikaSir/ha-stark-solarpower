# Stark SolarPower Panel UI 0.5.7 — fixed transform canvas

## Unified composition

- Exactly one `.zoom-viewport-v057` and one `.zoom-content-v057` exist after every render.
- The complete selected-UPS work area is transformed through `transform: scale()`; CSS `zoom` is not applied to the v0.5.7 canvas.
- Backgrounds, UPS artwork, SVG power paths, endpoint nodes, metrics and state cards keep their relative coordinates throughout a pinch.
- Runtime values, clicks and native more-info remain live; the canvas is not rasterized.

## Geometry and navigation

- Stage width and height compensate for the visual transform, making every enlarged edge reachable by scrolling.
- Pinch remains focal around the midpoint between touches.
- Mobile/tablet/desktop layout is selected before scaling and only remeasured after an actual viewport/content resize.
- A scale below 100% is centered inside the native-width viewport.
- Header, HA menu, UPS selector and Bottom Tab Bar remain outside the canvas at native scale.

## Reset and persistence

- Scale remains within 75–200% and persists per selected UPS/client.
- Two-finger double tap resets scale and scroll to 100%/origin.
- A completed 97–103% pinch snaps to 100% and shows the transient confirmation.
- Optimized HA state updates cannot nest old v0.5.4–v0.5.7 wrappers.

## Regression

- Safe area, system menu, Refresh, five views, device selection and battery path remain unchanged.
- UPS semantics, stale/source trust and unavailable handling are unchanged.
