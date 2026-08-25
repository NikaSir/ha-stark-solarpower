# NikaS Specialized Panel UI Standard v1.3

**Status:** REQUIRED  
**Canonical source:** `NikaSir/ha-contract-generated-ui`  
**Field reference:** Stark SolarPower mobile panel  
**Local role:** synchronized implementation snapshot.

## Shell

- Safe area consumed exactly once; no device-specific offsets.
- Permanent left Header control is Home Assistant `☰` and MUST dispatch `hass-toggle-menu`.
- Never use Back, browser history, integration drawer or device action there; parent navigation belongs inside work area.
- Title is geometrically centered; Header/right action remain native scale below notch/Dynamic Island.
- Peer-device selector, when present, is directly below Header, native scale, fixed order and selected-device-only.
- Primary 3–5 sections use full-width fixed edge-attached safe-area-aware Bottom Tab Bar at native scale.

## Zoom — field-tested baseline

- Exactly one zoomable work viewport per panel instance.
- Only work area scales; Header, Device Selector and Bottom Tab Bar stay native.
- Two-finger focal-point pinch; enlarged content pans/scrolls.
- Permanent `− / % / +` controls are not used.
- Pinch end at **97–103%** snaps to exactly **100%**.
- **Two-finger double tap** resets scale and work-area scroll to **100%**.
- Reset briefly shows native-scale `Масштаб 100%`.
- Scale persists locally per panel/client and preferably per peer device where applicable.
- Shell lifecycle is idempotent: never wrap an already zoomable area again.
- Repeated HA updates must not create nested wrappers, duplicate handlers, blank wrapper space or progressive shrinkage.

## Stark-derived visual/data/delivery rules

- Normal measurements neutral; semantic colors only for confirmed health/warning/fault.
- `unknown`, `unavailable`, stale/source loss never healthy.
- Backend semantic entities/thresholds own factual meaning; unsupported derived values are not invented.
- Panel-critical artwork ships locally; no external CDN/Base64 production images; background art contains no live HA values; dynamic layers remain runtime UI; asset URLs use cache busting.
- Prefer native more-info/history where appropriate.
- Avoid full rebuilds for unrelated HA churn while preserving shell topology/context/zoom.
- Production frontend uses one deterministic entry module and CI validation.

**Migration rule:** do not refactor domain UI while adopting shell v1.3.

> Canonical documents in `ha-contract-generated-ui` win on conflict.