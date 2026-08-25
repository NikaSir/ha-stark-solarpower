# Stark SolarPower Panel UI 0.5.1 — target-composition acceptance

Primary target: iPhone Pro Max, portrait.

## First viewport

- Header and persistent `UPS Интернет / UPS Котёл` selector remain fully visible.
- The photographic hero is materially shorter than UI 0.5.0.
- The complete input/output/load metric row is visible.
- The `Состояние` heading and state content enter the first viewport above the fixed navigation.
- No horizontal scrolling or clipped controls.

## Context scene

- `UPS Интернет` uses the local network-room plate.
- `UPS Котёл` uses the local boiler-room plate.
- Stark Country product artwork is a separate foreground layer and is not baked into either background.
- Grid, load, battery nodes and power paths remain HTML/SVG layers using selected-device entities.
- No text, value or operational state is embedded in the background image.

## Data and colour semantics

- Normal measurements use neutral text.
- Green, amber and red are reserved for confirmed state semantics.
- Cloud loss, stale data and unavailable entities never render as healthy.
- Runtime is not synthesized from battery percentage or load.
- When no proven runtime entity/unit is available, the reserve strip reports factual battery readiness only.

## Navigation

- Fixed bottom order: `Обзор / ИБП / История / События / Диагн.`.
- Selection persists across all five views.
- Every view is scoped to the selected UPS only.
- Long press on factual entities opens native Home Assistant more-info.

## Release gate

1. Deterministic bundle rebuild produces no diff.
2. All JavaScript files pass `node --check`.
3. JSON and Python validation pass.
4. HACS and Hassfest checks pass.
5. Both context images load after HACS update and Home Assistant restart.
6. Normal, battery, stale and source-unavailable states remain distinguishable.
