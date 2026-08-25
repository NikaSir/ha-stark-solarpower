# Stark SolarPower Panel UI 0.5.6 — menu, reset and battery path

## Header

- The permanent left Header control is the `mdi:menu` Home Assistant system-menu button.
- Tapping it dispatches the composed, bubbling `hass-toggle-menu` event.
- The title remains geometrically centered and Refresh remains the only right action.

## Gesture-only zoom

- No persistent zoom controls are rendered.
- Two-finger pinch remains focal, pannable and stored locally per selected UPS.
- Two consecutive stationary two-finger taps within 360 ms reset scale and scroll position to 100%.
- A completed pinch in the 97–103% range snaps to exactly 100%.
- Reset confirmation appears transiently and does not participate in scaling or layout.

## Battery path

- The battery SVG path runs from `y=62` through `y=97`, continuing beneath the UPS artwork and battery node.
- The exposed segment is visibly green in line mode and amber in battery mode.
- Endpoint overlap cannot reveal a visual gap when the panel is resized or zoomed.

## Regression

- UI 0.5.4 zoom controls and nested wrappers remain absent.
- Safe-area, device selection, five views, Bottom Tab Bar, telemetry semantics, more-info and Refresh are unchanged.
