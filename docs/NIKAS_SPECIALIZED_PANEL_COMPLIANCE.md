# NikaS specialized-panel compliance — Stark SolarPower

**Audit date:** 2026-08-26
**Standard:** NikaS Specialized Panel UI Standard v1.5
**Audited production path:** `panel.py` → `stark-solarpower-panel-bundle.js?v=0.6.9` → `stark-solarpower-panel`
**Scope:** implemented in UI v0.6.9; phone field acceptance remains required

| Area | Result | Evidence |
|---|---|---|
| Integration-owned fixed shell | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: Header, device selector and Bottom Tab Bar are outside the single work viewport. |
| One zoom viewport / idempotence | PASS | `frontend/stark-solarpower-panel-v060.js` replaces the prior viewport, marks `data-stark-transform-pan-v060` and detaches older resize engines. |
| Scale 75–200%, focal pinch, per-UPS persistence | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: clamp, focal content coordinates and device-keyed local storage/state. |
| 97–103% snap, two-finger double tap and toast | PASS | `frontend/stark-solarpower-panel-v056.js`, `v060.js`: snap/reset and `Масштаб 100%`. |
| Native HA menu | PASS | `frontend/stark-solarpower-panel-v056.js`: `mdi:menu`, bubbling/composed `hass-toggle-menu`. |
| Safe area and fixed Bottom Tab Bar | PASS | `frontend/stark-solarpower-panel-v053.js`, `v052.js`: top and bottom safe-area handling; shell elements remain outside transform. |
| Header reference geometry | PASS | Final `frontend/stark-solarpower-panel-v065.js` authoritatively sets 52/48 rails, 62/60 height, matched 44×44 radius-16 plaques, themed colours, 25px icons and 21/12 typography. |
| Bottom Tab geometry | PASS | Final v065 layer uses fixed full-width safe-area bar, minimum 52px controls, `ha-icon` at 28px, 12/700 labels and 11% primary active fill. |
| Native vertical scroll at 100% | PASS | v065 switches to `overflow-y:auto`, `overflow-x:hidden`, `touch-action:pan-y` at scale ≤100%; transform offsets are zero. |
| Origin fixed at 100%; no one-finger pan | PASS | v065 creates a single-finger pan candidate only when `state.scale > 1`; clamp fixes `x=y=0` at or below 100%. |
| Pan only above 100% / overflowing axes | PASS | v065 independently mutates x/y only when calculated content bounds overflow that axis and clamps both edges. |
| Tab reset to page start | PASS | v065 capture handler resets native scroll and transform offsets before the existing view render while preserving scale. |
| Resize clamp | PASS | v065 remeasures and clamps through `ResizeObserver`, window resize and `visualViewport.resize`. |
| Gesture/more-info protection | PASS | v065 cancels entity hold on second finger/actual pan and guards generated clicks while untouched native scroll and stationary holds remain available. |
| Repository icon | PASS | README displays the approved existing `custom_components/stark_solarpower/brand/icon.png`; no new identity was invented. |
| Integration icon assets | PASS | `custom_components/stark_solarpower/brand/icon.png` is a valid 512×512 RGBA icon and satisfies the HACS minimum. Add dark/logo variants only if theme legibility requires them. |
| HACS packaging | PASS | `hacs.json` identifies the integration and the component-local brand icon ships with `custom_components/stark_solarpower`. |
| Live telemetry stability | PASS | `frontend/stark-solarpower-panel-v069.js` reconciles all five primary views in place without replacing the work canvas, images or gesture handlers. |
| Production delivery | PASS | `panel.py` uses one cache-busted autonomous bundle URL and UI version `0.6.9`. |

## Remaining follow-up

Complete the phone field checks below. Preserve the approved icon and add optional theme/logo variants only if a real surface requires them.

## Phone verification still required

Long Diagnostics scrolling at 100%; no horizontal/top-edge displacement; pan axes at >100%; bounds after release/resize/tab change; pinch without snap-back; tap/hold behavior; fixed Header/selector/tab bar; Home Indicator clearance.
