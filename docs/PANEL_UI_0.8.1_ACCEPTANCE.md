# Stark SolarPower panel UI 0.8.1 acceptance

**Standard:** NikaS Specialized Panel UI Standard v1.6

**Primary device:** iPhone Pro Max portrait

**Delivery:** HACS from accepted `main`; no GitHub Release or automatic tag

## Automated gate

- [x] Registration, manifest and cache-busting version agree on `0.8.1`.
- [x] The phone photographic scene is 336 CSS pixels high without a new UPS-artwork size override.
- [x] The battery-capacity plaque is raised and remains independent from the UPS cabinet.
- [x] Input and load plaques retain their vertical alignment after the scene adjustment.
- [x] The reserve surface and battery-detail card use compact final geometry.
- [x] `АКБ, шт.` stays on one line and meaningful text remains at least 12px.
- [x] The battery card reserves 16px above the fixed Bottom Tab Bar.
- [x] Final geometry is part of the initial cached-view markup; no full-DOM render was added.
- [x] Syntax, unit tests and deterministic rebuild pass locally.

## Phone field pass

- [ ] The battery plaque has a calm gap above the UPS cabinet on both UPS backgrounds.
- [ ] The UPS remains visually grounded and is not noticeably smaller than UI 0.8.0.
- [ ] The complete battery card, including its lower border, remains visible above navigation at 100%.
- [ ] `Напряжение`, `АКБ, шт.`, `Темп. ЗУ` and `Остаток RAW` remain on one aligned label row.
- [ ] Header, selector and Bottom Tab Bar remain fixed while the work viewport scrolls.
- [ ] Telemetry updates do not flicker, reload the photograph or change the current scale/position.
- [ ] Pinch and two-finger reset do not activate History, graphs or more-info.
