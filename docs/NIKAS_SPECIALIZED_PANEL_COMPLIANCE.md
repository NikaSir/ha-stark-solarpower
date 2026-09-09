# NikaS specialized-panel compliance — Stark SolarPower

**Audit date:** 2026-09-09
**Standard:** NikaS Specialized Panel UI Standard v2.2 / Navigation Contract v1.2
**Audited production path:** `panel.py` → `stark-solarpower-panel-bundle.js?v=0.9.6` → `stark-solarpower-panel`
**Scope:** implemented in UI v0.9.6 / integration 1.9.8; production browser and phone acceptance remain required

| Area | Result | Evidence |
|---|---|---|
| Canonical StarLine peer selector | PASS | Final `frontend/stark-solarpower-panel-v095.js` uses the shared 52 px row, two separate 44 px buttons, 8 px gap, left-aligned labels, primary selection surface/border and the existing independent 9 px status lamps. |
| Integration-owned host-bound shell | PASS (static) | Final `frontend/stark-solarpower-panel-v096.js` binds an absolute four-row grid to the Home Assistant panel host with 60 px Header, 52 px selector, `minmax(0,1fr)` work row and 64 px Bottom Tab Bar. Browser rectangle measurements remain required. |
| One zoom viewport / idempotence | PASS | `frontend/stark-solarpower-panel-v060.js` replaces the prior viewport, marks `data-stark-transform-pan-v060` and detaches older resize engines. |
| Scale 75–200%, focal pinch, per-UPS persistence | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: clamp, focal content coordinates and device-keyed local storage/state. |
| 97–103% snap, two-finger double tap and toast | PASS | `frontend/stark-solarpower-panel-v056.js`, `v060.js`: snap/reset and `Масштаб 100%`. |
| Native HA menu | PASS | `frontend/stark-solarpower-panel-v056.js`: `mdi:menu`, bubbling/composed `hass-toggle-menu`. |
| Safe area and fixed Bottom Tab Bar | PASS (static) | `v096.js` owns safe-area insets once in the host grid; chrome is outside the transform canvas and browser-window fixed positioning is superseded. |
| Header reference geometry | PASS (static) | `v096.js` applies the exact v2.2 60 px body, 52/48 rails, 44×44 radius-16 side plaques, 25 px icons, S8 surface and 52 px center title. |
| Source-aware title return | PASS | Final navigation layer mounts one semantic 52 px center button, keeps the second line exactly `UI v0.9.6`, requires and validates the route/timestamp pair once, rejects future/stale hand-offs and performs explicit HA navigation without `history.back()`. |
| iOS scroll boundary | PASS | Final `v091.js` uses the confirmed Shell v2.1 capture/non-passive host guard: it contains short views and real top/bottom edges while allowing inner scrolling, taps and multitouch pinch. |
| Navigation contract | PASS | `.nikas-ui-standard.json` pins canonical v2.2 / Navigation 1.2 documents. Runtime accepts current House v13, Rooms v11, Actions and Infrastructure routes, consumes the one-shot hand-off and stores only a validated same-origin return. |
| Bottom Tab geometry | PASS (static) | Final v096 layer uses the 64 px host row, exact 52 px controls, `ha-icon` at 26 px, 12/14 px labels, 1 px stack gap and 11% primary active fill. |
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
| Connection/freshness plaque and blue corner | PASS (static) | Final `v096.js` keeps the requested two-level semantics and locks the plaque to 168×58 px at 13/13 px with 11×12 padding, 10 px lamp, 16/13 typography and exact state tints. The persistent corner is 205×205 px at −92/−70 with fixed `rgba(3,169,217,0.07)`. Browser geometry remains a GAP. |
| Peer-device status lamps | PASS | Final `v092.js` restores one 9px lamp inside each selector button and point-patches good/warn/bad/unknown tone plus accessible status text without replacing selector nodes. |
| Refresh contract v1.1 | PASS (runtime harness) | The production bundle starts all discovered UPS refresh entities immediately, blocks duplicate activation, keeps busy for at least 900 ms, treats partial/unavailable targets as failure, exposes ARIA state and shows the 1400 ms check/error result. Retry cancels the old result timer. Browser animation remains a GAP. |
| Panel lifecycle v1.0 | PASS (static/runtime order) | Registration precedes first cloud refresh. Shared entry ownership is retained; a foreign `/dashboard-ups` route is not removed on unload. Empty/unavailable frontend states remain explicit. Full HA retry acceptance remains required. |
| Production delivery | PASS | `panel.py` uses one cache-busted autonomous bundle URL, UI version `0.9.6` and cache headers for its versioned static files. The exact canonical Shell v2.1 source is vendored and concatenated at build time. |
| Data truth and command policy | PASS | Telemetry comes from integration/registry evidence; unknown/unavailable remain explicit. Peer status remains gray until enough facts exist. The sole action is integration-owned read-only refresh; completion does not fabricate a new sample or freshness. |
| Deterministic bundle check | PASS | `build_frontend_bundle.py --check` fails on stale output; CI syntax-checks the single autonomous entrypoint and rejects runtime imports. |

## Remaining follow-up

Complete the full v2.2 browser matrix and phone field checks below. Preserve the approved icon and add optional theme/logo variants only if a real surface requires them.

## Phone verification still required

Long Diagnostics scrolling at 100%; no horizontal/top-edge displacement; pan axes at >100%; bounds after release/resize/tab/device change; pinch without snap-back; tap/hold behavior; fixed Header/selector/tab bar; ten repeated tab/device switches without white frames; loss/recovery without remount; Home Indicator clearance.
