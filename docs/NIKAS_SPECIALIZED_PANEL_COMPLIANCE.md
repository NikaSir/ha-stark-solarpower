# NikaS specialized-panel compliance — Stark SolarPower

**Audit date:** 2026-08-26
**Standard:** NikaS Specialized Panel UI Standard v1.4
**Audited production path:** `panel.py` → `stark-solarpower-panel-bundle.js?v=0.6.4` → `stark-solarpower-panel`
**Scope:** audit only; runtime deliberately unchanged in this PR

| Area | Result | Evidence |
|---|---|---|
| Integration-owned fixed shell | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: Header, device selector and Bottom Tab Bar are outside the single work viewport. |
| One zoom viewport / idempotence | PASS | `frontend/stark-solarpower-panel-v060.js` replaces the prior viewport, marks `data-stark-transform-pan-v060` and detaches older resize engines. |
| Scale 75–200%, focal pinch, per-UPS persistence | PASS | `frontend/stark-solarpower-panel-v054.js`, `v060.js`: clamp, focal content coordinates and device-keyed local storage/state. |
| 97–103% snap, two-finger double tap and toast | PASS | `frontend/stark-solarpower-panel-v056.js`, `v060.js`: snap/reset and `Масштаб 100%`. |
| Native HA menu | PASS | `frontend/stark-solarpower-panel-v056.js`: `mdi:menu`, bubbling/composed `hass-toggle-menu`. |
| Safe area and fixed Bottom Tab Bar | PASS | `frontend/stark-solarpower-panel-v053.js`, `v052.js`: top and bottom safe-area handling; shell elements remain outside transform. |
| Header reference geometry | GAP | Final layered CSS does not establish the complete v1.4 contract in one authoritative rule: exact `52/1fr/52` and `48/1fr/48` rails, matched `44×44` plaques with radius `16px`, border/card background/shadow, menu/refresh colours and `25px` icons. `v052.js`, `v055.js`, `v056.js` and bundle overrides compete. |
| Bottom Tab geometry | GAP | `frontend/stark-solarpower-panel-v051.js` sets icons to `24px`; later `v052.js`/bundle sets `22px`, not required `28px`. Narrow `370px` labels fall to `10px`, not `12px`. |
| Native vertical scroll at 100% | GAP | `frontend/stark-solarpower-panel-v060.js` forces `.zoom-viewport-v060 { overflow:hidden; touch-action:none }` and represents vertical position with transform `state.y`; therefore 100% is not native vertical scrolling. |
| Origin fixed at 100%; no one-finger pan | GAP | `v060.js` calls `beginPan` for every single touch and changes `state.x/state.y` at scale `1`. This conflicts with strict `x=0,y=0` and immediate native taps/scroll. |
| Pan only above 100% / overflowing axes | GAP | `v060.js` starts pan at all scales. Bounds are clamped, but the handler still captures one-finger gestures when an axis fits or scale is at/below 100%. Below 100%, a fitting canvas is horizontally centered rather than anchored at origin. |
| Tab reset to page start | GAP | `frontend/stark-solarpower-panel-v051.js::_installNavigationV051` only changes `this._view` and rerenders. `v059.js`/ `v060.js` preserve canvas position, so the new tab is not guaranteed to start at origin. |
| Resize clamp | PASS | `v060.js` remeasures and clamps via `ResizeObserver`, window resize and `visualViewport.resize`. |
| Gesture/more-info protection | PASS | `v060.js` sends `pointercancel` after movement/second finger and guards post-gesture clicks while stationary holds remain available. |
| Repository icon | GAP | README has no icon/logo reference. Add an approved repository-facing asset/reference; do not redraw without source approval. |
| Integration icon assets | PARTIAL | `custom_components/stark_solarpower/brand/icon.png` is a valid 512×512 RGBA icon. No dark icon or logo variants are present. The repo contains no evidence that this local folder is published through the currently supported HA/HACS brand-display path; verify/publish the `stark_solarpower` domain asset upstream as required. |
| HACS packaging | PASS | `hacs.json` identifies the integration and the component-local icon is shipped with `custom_components/stark_solarpower`. Packaging alone does not prove frontend brand display. |
| Production delivery | PASS | `panel.py` uses one cache-busted bundle URL and UI version `0.6.4`. |

## Required runtime follow-up

1. Replace transform-owned 100% movement with native vertical scrolling and strict origin.
2. Gate one-finger pan on `scale > 1`, then gate/clamp each axis independently.
3. Reset native scroll and transform offsets on tab change; re-clamp after render/resize.
4. Consolidate Header/Bottom Tab geometry into one final shell layer and set bottom icons to `28px`.
5. Add approved repository visual identity and verify the supported HA/HACS integration-brand publication path.

## Phone verification still required

Long Diagnostics scrolling at 100%; no horizontal/top-edge displacement; pan axes at >100%; bounds after release/resize/tab change; pinch without snap-back; tap/hold behavior; fixed Header/selector/tab bar; Home Indicator clearance.
