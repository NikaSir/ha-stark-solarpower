# Stark SolarPower Panel UI 0.4.2 — native Home Assistant menu acceptance

Primary target: iPhone Pro Max, portrait.

## Requirement

The top-left hamburger belongs to the Home Assistant application shell. It must open the native Home Assistant system/sidebar menu and must not render a Stark-specific drawer.

## Implementation contract

- Header icon: `mdi:menu`.
- Touch target: at least 44×44 px.
- Tap dispatches the standard bubbling/composed `hass-toggle-menu` event from the custom panel element.
- No panel-specific menu drawer, backdrop, device list, refresh item or custom parent-navigation menu is rendered.
- Device selection remains in the persistent `UPS Интернет / UPS Котёл` selector below the Header.
- Header Refresh remains the only Stark-specific global action in the Header.
- The panel keeps its canonical parent route metadata for generated-UI/deep-link contracts, but Header menu behavior is owned by Home Assistant.

## Home Assistant compatibility basis

Home Assistant frontend uses `hass-toggle-menu` for its own sidebar toggle and forwards the same event from custom panels to the main application shell.

## Preserved UI invariants

- Overview UI 0.4.0 Hero, factual power flow, state tiles and recent events;
- fixed UPS selector order;
- selected-device-only content;
- `Обзор / Диагностика / История` full-width Bottom Tab Bar;
- long press → native Home Assistant more-info for factual entities;
- 60 s cloud polling;
- 360 s stale threshold;
- read-only SolarPower boundary;
- strict `unknown` / `unavailable` semantics;
- one self-contained production frontend bundle.

## Phone release gate

Accept only when:

1. one tap on the top-left hamburger opens the native Home Assistant sidebar/system menu;
2. no Stark-specific drawer appears;
3. HA sidebar navigation works normally;
4. closing the HA menu returns to the unchanged Stark panel state;
5. the selected UPS is preserved;
6. Bottom Tab Bar remains stable;
7. no horizontal scroll appears.
