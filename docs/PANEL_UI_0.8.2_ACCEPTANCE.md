# Stark SolarPower panel UI 0.8.2 acceptance

**Standard:** NikaS Specialized Panel UI Standard v1.6

**Primary device:** iPhone Pro Max portrait

**Delivery:** HACS from accepted `main`; no GitHub Release or automatic tag

## Automated gate

- [x] Registration, manifest and cache-busting version agree on `0.8.2`.
- [x] `_showMoreInfo()` checks the current v0.6.5 guard before dispatching `hass-more-info`.
- [x] The legacy guard remains respected for compatibility with older canvas layers.
- [x] A second finger cancels hold timers on all entity-bound nodes in the permanent work surface.
- [x] Cancellation does not depend on `elementFromPoint` crossing the iOS Shadow DOM boundary.
- [x] No structural render, image replacement or zoom-engine change was introduced.
- [x] Intentional one-finger hold remains available outside a gesture guard interval.
- [x] Syntax, unit tests and deterministic rebuild pass locally.

## Phone field pass

- [ ] Pinch over the UPS artwork never opens «Режим работы» more-info.
- [ ] Pinch over input, load, battery and lower battery facts never opens their more-info.
- [ ] Pinch and two-finger reset never activate the fixed History tab.
- [ ] An intentional stationary one-finger hold still opens the selected entity more-info.
- [ ] Normal one-finger scrolling at 100% remains native.
- [ ] One-finger panning above 100% remains bounded to real overflow axes.
- [ ] Repeated gestures do not flicker, reload the photograph or move fixed navigation.
