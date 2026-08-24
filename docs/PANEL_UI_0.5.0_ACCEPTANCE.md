# Stark SolarPower Panel UI 0.5.0 — status-first dashboard acceptance

Primary target: iPhone Pro Max, portrait.

## Visual baseline

- Header: native Home Assistant hamburger, centered `Stark SolarPower`, `UPS Control Center · UI v0.5.0`, Refresh.
- Persistent selector directly below Header: `UPS Интернет / UPS Котёл`, fixed order, selected UPS only below.
- Overview Hero: large factual state, data freshness, real Stark Country 1000 ONLINE (16A), line → UPS → load flow and battery branch.
- Key metrics: input voltage/frequency, output voltage/frequency and output load/current.
- State summary: `Неотключаемая линия` and `АКБ` as distinct objects.
- Primary navigation remains the full-width fixed `Обзор / Диагностика / История` Bottom Tab Bar.

## Data contract

- Every numeric value comes from the selected UPS Home Assistant entities.
- No runtime, power or derived vendor value is displayed unless its entity and unit are proven.
- Input voltage is semantically the non-disconnectable line.
- `data_stale = on` has priority over the last reported UPS mode.
- Cloud loss, unknown freshness and unavailable entities never render as healthy.
- Normal measurements remain visually neutral; green, amber and red are reserved for state semantics.

## Product artwork

- Asset: `frontend/assets/stark-country-1000-online.png`.
- Transparent local PNG, optimized for the integration package.
- No network image request and no retail-page/browser content.
- Alt text identifies `Stark Country 1000 ONLINE (16A)`.

## Preserved behavior

- Read-only integration boundary.
- 60 s primary polling and backend-owned 360 s stale threshold.
- Native Home Assistant menu via `hass-toggle-menu`.
- Refresh reuses the integration-owned button entity and shows progress/result feedback.
- Long press on factual content opens native Home Assistant more-info.
- One deterministic self-contained production bundle; no runtime imports of historical UI modules.

## Release gate

1. HACS and Hassfest checks pass.
2. Deterministic bundle rebuild produces no diff.
3. All JavaScript files pass `node --check`.
4. JSON and Python validation pass.
5. No horizontal scrolling on iPhone Pro Max portrait.
6. Both UPS selector positions remain fixed while content changes.
7. Normal, battery, stale and source-unavailable states remain distinguishable.
8. Product image loads after a HACS update and Home Assistant restart.
