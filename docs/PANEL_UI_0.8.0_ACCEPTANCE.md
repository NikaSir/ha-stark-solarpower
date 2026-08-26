# Stark SolarPower panel UI 0.8.0 acceptance

**Standard:** NikaS Specialized Panel UI Standard v1.6

**Primary device:** iPhone Pro Max portrait

**Delivery:** HACS from accepted `main`; no GitHub Release or automatic tag

## Automated gate

- [x] One deterministic self-contained production bundle.
- [x] Registration, manifest and cache-busting version agree on `0.8.0`.
- [x] Header, selector, one viewport/canvas and Bottom Tab Bar mount once after initial loading.
- [x] Routine `hass` updates point-patch the active cached view.
- [x] Visited tab/UPS views are lazily cached and reused.
- [x] Meaningful typography uses the v1.6 `12–25px` envelope.
- [x] The requested cloud/freshness indicator uses a stable status-tinted plaque.
- [x] Gesture range, focal pinch, snap, reset, per-UPS persistence and navigation guard remain covered.
- [x] Syntax, unit tests and deterministic rebuild pass locally.

## Phone field pass

- [ ] Header and selector remain below Dynamic Island and do not move while scrolling.
- [ ] Bottom Tab Bar remains fixed above Home Indicator on short and long views.
- [ ] Ten consecutive tab/device switches show no white frame, lost image or duplicate viewport.
- [ ] Overview, UPS, Events, History and Diagnostics scroll normally at 100%.
- [ ] At 100%, the canvas cannot move sideways or away from the top origin.
- [ ] Above 100%, each overflowing axis pans to both real content edges without blank field or rebound.
- [ ] Two-finger double tap returns scale/position/native scroll to 100%/origin and shows `Масштаб 100%`.
- [ ] Pinch/reset never opens History, a graph or more-info; intentional hold still opens more-info.
- [ ] Cloud loss, stale data and recovery update in place without flicker.
- [ ] Battery plaque, UPS cabinet and battery-detail card remain visually separated on both peer devices.
