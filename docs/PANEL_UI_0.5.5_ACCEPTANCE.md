# Stark SolarPower Panel UI 0.5.5 — gesture-only zoom hotfix

## Field defect fixed

- The panel never renders `− / percentage / +` controls.
- Repeated Home Assistant state updates do not add blank space, duplicate controls or progressively shrink the UPS content.
- Any nested UI 0.5.4 work viewports already present in the live DOM are unwrapped before one clean UI 0.5.5 viewport is installed.

## Gesture behavior retained

- A two-finger pinch scales only the selected-UPS work viewport.
- Scaling remains centered on the point between the fingers.
- Enlarged content pans and scrolls to every region.
- Scale remains limited to 75–200% and persists locally per panel client and selected UPS.
- Header, device selector and Bottom Tab Bar remain at native scale.

## Regression checks

- Safe Area, explicit Back and Refresh behavior are unchanged.
- All five views and selected-device context are unchanged.
- UPS telemetry, state trust, stale handling, more-info and refresh commands are unchanged.
- The production browser continues to load only the deterministic self-contained bundle.
