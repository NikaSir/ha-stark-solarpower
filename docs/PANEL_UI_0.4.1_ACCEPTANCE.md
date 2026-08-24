# Stark SolarPower Panel UI 0.4.1 — application menu acceptance

Primary target: iPhone Pro Max, portrait.

## Header

- Left Header control is `mdi:menu`, not Back.
- Menu touch target remains at least 44×44 px.
- `Stark SolarPower` remains geometrically centered between symmetric 52 px Header zones.
- Right Header control remains the existing global Refresh action.
- No domain command is executed by long press or double tap on Header controls.

## Application menu

The menu opens as a left drawer above panel content and the fixed Bottom Tab Bar.

Required items:

1. `Инфраструктура` — explicit Home Assistant navigation to `/dashboard-infrastructure/overview`.
2. One row for every discovered Stark UPS device, in the same stable order as the persistent Device Selector.
3. `Обновить все ИБП` — reuses the existing integration-owned refresh button entity; no new cloud command path is added.
4. Read-only panel/version information in the drawer footer.

The selected UPS is highlighted in the menu but device selection never reorders the rows. Selecting a UPS updates the existing application device context and closes the drawer.

## Drawer behavior

- Drawer width is capped for phone use and cannot create horizontal page scroll.
- Backdrop tap closes the drawer.
- Explicit close button is at least 44×44 px.
- iOS top and bottom safe areas are respected.
- The underlying panel cannot be activated through the backdrop.
- Reduced-motion preference removes drawer animation.

## Existing UI invariants

UI 0.4.1 changes only Header exit/navigation presentation. It preserves:

- Overview UI 0.4.0 Hero, factual power flow, state tiles and recent events;
- fixed `UPS Интернет` / `UPS Котёл` selector order;
- selected-device-only content;
- `Обзор / Диагностика / История` full-width edge-attached Bottom Tab Bar;
- long press → native Home Assistant more-info for factual entities;
- 60 s cloud polling and 360 s stale threshold;
- read-only SolarPower integration boundary;
- strict `unknown` / `unavailable` semantics;
- one self-contained production frontend bundle.

## Release gate

Accept on real iPhone only when:

- hamburger opens the drawer in one tap;
- drawer closes through X and backdrop;
- `Инфраструктура` goes to the canonical parent route;
- selecting either UPS changes device context without moving buttons;
- Refresh from the drawer invokes the same action as Header Refresh;
- no horizontal scrolling appears with the drawer open or closed;
- Bottom Tab Bar remains stable after closing the drawer.
