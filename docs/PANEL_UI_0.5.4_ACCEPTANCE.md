# Stark SolarPower Panel UI 0.5.4 — specialized shell acceptance

UI 0.5.4 migrates the existing UPS domain interface to the required NikaS specialized-panel shell. UPS entities, source trust, stale thresholds, statuses, routes, confirmations and commands are unchanged.

## Native shell

- The panel consumes `env(safe-area-inset-top)` once at the application boundary; Header controls never render below the notch or Dynamic Island.
- Back is an explicit 44 px-class control and always navigates to `/dashboard-infrastructure/overview`.
- Refresh remains the only right Header action and the title stays geometrically centered.
- Header, UPS selector, zoom controls and fixed full-width Bottom Tab Bar remain at native scale.
- Bottom navigation continues to clear `env(safe-area-inset-bottom)` and the iOS Home Indicator.

## Zoom contract

- Only the selected-UPS work viewport scales.
- Two-finger pinch scales around the midpoint between the touches.
- Enlarged content pans and scrolls horizontally and vertically inside the work viewport.
- Native `− / percentage / +` controls use 75–200% limits and 10% button steps.
- Tapping the percentage resets the work viewport to 100%.
- The chosen scale is stored locally per Stark SolarPower panel client and selected UPS.
- Switching between `UPS Интернет` and `UPS Котёл` restores each device's own scale.
- Mobile, tablet and desktop responsive layout is resolved at the viewport width before user zoom is applied.

## Regression checks

- All five views remain available: `Обзор`, `ИБП`, `История`, `События`, `Диагн.`.
- Device selection remains stable across views and only the selected UPS is shown.
- Long press still opens native Home Assistant more-info where supported.
- Manual Refresh still presses the integration's existing `refresh_now` button entity.
- `unknown`, `unavailable`, stale data and source failure never appear healthy.
- The production browser loads only `stark-solarpower-panel-bundle.js`; historical UI modules remain build-time sources.
