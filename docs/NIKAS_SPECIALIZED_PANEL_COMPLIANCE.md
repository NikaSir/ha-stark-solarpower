# NikaS specialized-panel compliance — Stark SolarPower

**Audit date:** 2026-08-26
**Standard:** NikaS Specialized Panel UI Standard v1.6
**Audited production path:** `panel.py` → `stark-solarpower-panel-bundle.js?v=0.7.1` → `stark-solarpower-panel`
**Scope:** implemented in UI v0.7.1; phone field acceptance remains required

| Area | Result | Evidence |
|---|---|---|
| Integration-owned fixed shell | PASS | Final `frontend/stark-solarpower-panel-v071.js` locks the host/app height; Header, device selector and Bottom Tab Bar stay outside the only scrolling/scaling work viewport. |
| One zoom viewport / idempotence | PASS | Final canvas layer `v065.js` installs one `zoom-viewport-v065`; v071 changes only its work-surface children and never nests a viewport. |
| Scale 75–200%, focal pinch, per-UPS persistence | PASS | `v065.js` clamps focal pinch and stores scale plus x/y under a selected-device key; its controller switches the existing canvas between UPS states. |
| 97–103% snap, two-finger double tap and toast | PASS | `v065.js`: snap/reset and `Масштаб 100%`. |
| Native HA menu | PASS | `frontend/stark-solarpower-panel-v056.js`: `mdi:menu`, bubbling/composed `hass-toggle-menu`. |
| Safe area and fixed Bottom Tab Bar | PASS | `v053.js`, `v065.js`, `v071.js`: top/bottom safe-area handling, fixed full-width Tab Bar and a height-locked shell outside transform. |
| Header reference geometry | PASS | `v065.js` + final `v071.js` set 52/48 rails, 62/60 height, matched 44×44 radius-16 plaques, 25px icons, and 23/14 wide plus 21/13 narrow typography. |
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
| Live telemetry and tab stability | PASS | `v069.js` reconciles all five views in place; `v071.js` lazily caches visited work-view nodes and reattaches the same nodes, preserving Header, selector, viewport, loaded images and Bottom Tab Bar. |
| Requested two-level indicator | PASS | `v066.js` derives factual cloud/freshness labels; final `v071.js` applies the LIDER same-status lamp/text, 8–12% tint, ~30% border and 16/13px roles. `Онлайн` is forbidden by contract. |
| Meaningful typography 12–25px | PASS | Final `v071.js` raises meaningful labels to at least 12px, caps the hero status at 25px and preserves 9–10px only for redundant schematic annotation. |
| Battery detail surface | PASS | `frontend/stark-solarpower-panel-v070.js` lowers the capacity plaque and adds only verified battery entities; no output-current/charge-current substitution is made. |
| Production delivery | PASS | `panel.py` uses one cache-busted autonomous bundle URL and UI version `0.7.1`. |

## Remaining follow-up

Complete the phone field checks below. Preserve the approved icon and add optional theme/logo variants only if a real surface requires them.

## Phone verification still required

Long Diagnostics scrolling at 100%; no horizontal/top-edge displacement; pan axes at >100%; bounds after release/resize/tab change; pinch without snap-back; tap/hold behavior; fixed Header/selector/tab bar; Home Indicator clearance.


<!-- v1.6-adoption -->
## v1.6 adoption delta — 2026-08-26

This section is normative and implemented by the final v0.7.1 layer.

- **Indicator policy:** **ENABLED by explicit request** for the currently selected UPS. The primary channel is derived from the factual integration path and is never hard-coded as `Онлайн`; the secondary line reports freshness.
- **Indicator surface:** use the LIDER treatment: status-colored primary text/lamp, 8–12% tinted plaque, approximately 30% same-color border, and 16px/13px typography.
- A failed current poll immediately marks cached UPS values `Данные устарели`.
- **Stable DOM:** selected-UPS telemetry and indicator changes patch existing nodes only; Header, selector, image, one viewport and Bottom Tab Bar retain identity.
- **Fixed chrome:** Header, selector and Bottom Tab Bar stay at fixed screen coordinates; short UPS/history views may not pull either menu.
- **Typography:** enforce the 12–25px meaningful-text range; 9–10px is reserved only for redundant schematic annotation.
