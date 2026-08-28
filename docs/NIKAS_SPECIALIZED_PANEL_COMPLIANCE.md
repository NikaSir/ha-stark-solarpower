# NikaS specialized-panel compliance — Stark SolarPower

**Audit date:** 2026-08-28
**Standard:** NikaS Specialized Panel UI and Navigation Standard v1.8
**Audited production path:** `panel.py` → `stark-solarpower-panel-bundle.js?v=0.9.0` → `stark-solarpower-panel`
**Scope:** implemented in UI v0.9.0; phone field acceptance remains required

| Area | Result | Evidence |
|---|---|---|
| Integration-owned height-locked shell | PASS | Final `frontend/stark-solarpower-panel-v080.js` locks the application to `100dvh`; Header, selector and Bottom Tab Bar remain outside the only flexible work viewport. |
| One zoom viewport / idempotence | PASS | `frontend/stark-solarpower-panel-v060.js` replaces the prior viewport, marks `data-stark-transform-pan-v060` and detaches older resize engines. |
| Scale 75–200%, focal pinch, per-UPS persistence | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: clamp, focal content coordinates and device-keyed local storage/state. |
| 97–103% snap, two-finger double tap and toast | PASS | `frontend/stark-solarpower-panel-v056.js`, `v060.js`: snap/reset and `Масштаб 100%`. |
| Native HA menu | PASS | `frontend/stark-solarpower-panel-v056.js`: `mdi:menu`, bubbling/composed `hass-toggle-menu`. |
| Safe area and fixed Bottom Tab Bar | PASS | `frontend/stark-solarpower-panel-v053.js`, `v052.js`: top and bottom safe-area handling; shell elements remain outside transform. |
| Header reference geometry | PASS | `v065.js` provides 52/48 rails, 62/60 height, matched 44×44 radius-16 plaques and 25px icons; final `v080.js` applies v1.6 typography at 23/14 px and 21/13 px narrow. |
| Source-aware title return | PASS | Final `v090.js` mounts one semantic 44px+ center button, keeps the second line exactly `UI v0.9.0`, captures the validated source once and performs explicit HA navigation without `history.back()`. |
| Navigation contract | PASS | `.nikas-ui-standard.json` pins the canonical v1.8 documents; `scripts/check_nikas_ui_standard.py` validates the three base routes, one-shot hand-off, saved fallback and runtime markers. |
| Bottom Tab geometry | PASS | Final v065 layer uses fixed full-width safe-area bar, minimum 52px controls, `ha-icon` at 28px, 12/700 labels and 11% primary active fill. |
| Native vertical scroll at 100% | PASS | v065 switches to `overflow-y:auto`, `overflow-x:hidden`, `touch-action:pan-y` at scale ≤100%; transform offsets are zero. |
| Origin fixed at 100%; no one-finger pan | PASS | v065 creates a single-finger pan candidate only when `state.scale > 1`; clamp fixes `x=y=0` at or below 100%. |
| Pan only above 100% / overflowing axes | PASS | v065 independently mutates x/y only when calculated content bounds overflow that axis and clamps both edges. |
| Tab reset to page start | PASS | v065 capture handler resets native scroll and transform offsets before the existing view render while preserving scale. |
| Resize clamp | PASS | v065 remeasures and clamps through `ResizeObserver`, window resize and `visualViewport.resize`. |
| Gesture/more-info protection | PASS | Final `v082.js` cancels every pending entity hold when the second finger arrives and guards the final `_showMoreInfo()` dispatch with both current and legacy intervals; untouched native scroll and stationary one-finger holds remain available. |
| Repository icon | PASS | README displays the approved existing `custom_components/stark_solarpower/brand/icon.png`; no new identity was invented. |
| Integration icon assets | PASS | `custom_components/stark_solarpower/brand/icon.png` is a valid 512×512 RGBA icon and satisfies the HACS minimum. Add dark/logo variants only if theme legibility requires them. |
| HACS packaging | PASS | `hacs.json` identifies the integration and the component-local brand icon ships with `custom_components/stark_solarpower`. |
| Stable shell and lazy view cache | PASS | `frontend/stark-solarpower-panel-v080.js` mounts the shell/canvas once, caches tab/UPS work subtrees and bypasses the legacy complete renderer after stabilization. |
| Live telemetry stability | PASS | `v080.js` renders desired markup in a detached template and writes only changed text/attributes/classes into the active cached view; unchanged image `src`, artwork, canvas and fixed chrome remain untouched. |
| Gesture completion guard | PASS | `frontend/stark-solarpower-panel-v065.js` retains the two-finger tap until both fingers lift and blocks the post-pinch synthetic click before fixed navigation can receive it. |
| Battery detail surface | PASS | `frontend/stark-solarpower-panel-v070.js` adds only verified battery entities; final `v081.js` uses the one-line `АКБ, шт.` label and keeps all meaningful labels at 12px or larger. |
| Runtime field validation | PASS | `v083.js` treats the vendor value as minutes; the coordinator refreshes detailed telemetry every 60 seconds in Battery Mode, matching the physical countdown cadence. |
| Reserve readiness semantics | PASS | `v084.js` reserves `Резерв готов` for Line Mode at 95% or more; 21–94% is explicitly `Резерв неполный`. |
| Cold-start image pipeline | PASS | Final `v085.js` begins fetch/decode for the UPS artwork and both v063 backgrounds during bundle evaluation, parallel to registry discovery; the visible artwork is eager/high-priority and synchronously decoded for its first paint. |
| Immediate startup surface | PASS | Final `v086.js` replaces the legacy empty/loading viewport with a complete neutral Overview and factual placeholders before the registries resolve; the runtime stable shell still takes ownership after discovery. |
| Mobile Overview composition | PASS | Final `v081.js` uses a 336px phone scene, raises the capacity plaque, preserves the side-metric alignment, compacts the two lower surfaces and reserves 16px above fixed navigation without resizing the UPS artwork. |
| Typography envelope | PASS | Final `v080.js` enforces the v1.6 12–25px phone envelope, with explicit 23/14 and 21/13 Header pairs and a 25px hero ceiling. |
| Connection/freshness plaque | PASS | Final `v080.js` keeps the requested selected-UPS two-level semantics and applies 16/13 typography, 10% status tint and 30% status border without animation/remount. |
| Production delivery | PASS | `panel.py` uses one cache-busted autonomous bundle URL, UI version `0.9.0` and cache headers for its versioned static files. |

## Remaining follow-up

Complete the phone field checks below. Preserve the approved icon and add optional theme/logo variants only if a real surface requires them.

## Phone verification still required

Long Diagnostics scrolling at 100%; no horizontal/top-edge displacement; pan axes at >100%; bounds after release/resize/tab/device change; pinch without snap-back; tap/hold behavior; fixed Header/selector/tab bar; ten repeated tab/device switches without white frames; loss/recovery without remount; Home Indicator clearance.
