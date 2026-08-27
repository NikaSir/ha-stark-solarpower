# Stark SolarPower panel

The Stark SolarPower integration owns a dedicated Home Assistant panel for day-to-day UPS monitoring.

## Navigation contract

- Panel ID: `ups`
- Owner: `stark_solarpower`
- Stable route: `/dashboard-ups`
- Explicit parent route: `/dashboard-infrastructure/overview`
- Sidebar title: `UPS`
- Icon: `mdi:battery-charging`
- Preferred view: `overview`
- Panel UI version: `0.8.4`
- Primary navigation: full-width fixed bottom Tab Bar

The same metadata is shipped in `custom_components/stark_solarpower/panel_manifest.json` for `ha-contract-generated-ui` and other consumers.

## NikaS application shell

UI v0.8.4 uses NikaS Specialized Panel UI Standard v1.6 with one height-locked shell and one working viewport:

`Safe Area → Header → Device Selector → zoomable selected-UPS viewport → Bottom Tab Bar`

The Header belongs to the specialized-panel shell and remains at native scale. Its permanent left control opens the native Home Assistant main-system menu; Refresh remains the single right-side shell action. `Stark SolarPower` is geometrically centered between symmetric Menu and Refresh zones. No decorative battery/brand icon is shown in the Header.

Only the selected-UPS work viewport scales. At 100% it uses native vertical-only scrolling, fixes transform offsets to `x=0,y=0` and does not install one-finger custom pan. Above 100%, one finger pans only axes whose measured scaled content exceeds the viewport; both offsets are clamped to real content edges and recalculated after resize. Two-finger focal pinch uses 75–200%, snaps 97–103% to 100%, persists scale per UPS and supports a two-finger double-tap reset with `Масштаб 100%`. Tab changes reset scroll and offsets before remeasuring. When the second finger arrives, every pending entity hold in the permanent work surface receives `pointercancel`; the same gesture interval also guards the final `_showMoreInfo()` dispatch, not only generated clicks. Untouched native scroll and intentional stationary one-finger hold remain available. No on-screen zoom buttons are rendered.

The primary bottom navigation is full-width, fixed to the bottom edge, iOS-safe and contains `Обзор`, `ИБП`, `События`, `История`, and `Диагн.`. Active state remains inside the common bar. Factual entities keep long press → native Home Assistant more-info.

## Device context

Stark SolarPower is the reference multi-device panel in NikaS.

The Device Selector is persistent directly below the Header on every primary view:

`UPS Интернет | UPS Котёл`

Rules:

- the order is fixed and never changes because of selection;
- only active styling changes when another UPS is selected;
- selected UPS context is preserved across all five primary views;
- all primary content below the selector belongs only to the selected UPS;
- the second full UPS card/history block is not duplicated below;
- a future third peer UPS joins the same selector/template without a new dashboard implementation.

## Product intent

The panel is mobile-first and targets iPhone Pro Max in portrait orientation. It is a device-centric application rather than a registry of Home Assistant entities.

The information hierarchy is:

`UPS → operating state → power path → battery/load → data trust → diagnostics`

The integration remains the single source of truth. The panel does not call Stark/SolarPower APIs directly and does not introduce control commands outside integration entities.

## Views

### Overview

The selected UPS receives one full status-first operating card showing:

- overall status;
- operating mode and battery-mode state;
- the real Stark Country 1000 ONLINE (16A) cabinet;
- non-disconnectable line → UPS → load power path;
- battery percentage;
- output load;
- primary cloud availability;
- stale/fresh status independently from the cloud channel;
- output voltage and frequency in the operating-mode copy.

The photographic hero is the only Overview presentation of input voltage, output voltage/frequency, load and battery charge. The repeated metric row and the repeated `Состояние` summary are not rendered. A compact reserve-readiness plaque sits below the hero, followed by a battery-detail card containing actual bank voltage, confirmed battery count, charger temperature and vendor remaining time converted from minutes to hours/minutes. `Резерв готов` is reserved for Line Mode with at least 95% charge; a lower charge is explicitly `Резерв неполный`. On the target phone the photographic scene is 336 CSS pixels high: the UPS remains enlarged and grounded on the floor, while the battery-capacity plaque is raised into the clear space above the cabinet. The input and load plaques retain their cabinet alignment, the battery-count label stays on one line, and a 16px bottom inset keeps the complete battery card above the fixed Bottom Tab Bar. Decorative flow connectors are not rendered. Battery charge current is not displayed because the current backend does not expose a verified charge-current entity.

The final hero geometry is present before the zoom engine measures the work surface. A transient zero-width iOS layout frame reuses the previous real canvas width instead of collapsing the surface to one pixel.

Normal telemetry refreshes update existing text, icons, classes and status tones in place on all five primary views. They do not replace the work canvas, reload image layers or reset the current zoom, pan and native scroll position. Visited tab/UPS combinations are cached as stable work-view subtrees; switching context reuses them and restores the selected UPS scale before display. Only a genuine registry/configuration topology change may replace the affected work-view subtree, never the fixed shell.

The hero connection plaque is calculated for the selected UPS only. Its first line is the current cloud channel (`Облако`, `Нет связи`, `Нет данных`); its second line independently reports freshness (`Данные актуальны`, `Данные устарели`, `Нет данных`). Primary polling runs every 60 seconds and becomes stale after 360 seconds. Extended telemetry is polled separately every five minutes and never changes the primary connection indicator by itself. `Нет связи · Данные актуальны` is valid immediately after a failed cloud poll while the last confirmed snapshot remains inside the freshness window.

The hero uses a local context plate selected from the device name: a network room for `UPS Интернет` and a boiler room for `UPS Котёл`. The network rack includes restrained blue and green equipment-status lights. The background is decorative only. The product, status nodes and values are independent runtime layers and remain factual.

The status is green only when the primary cloud source is available, data is fresh, the UPS is in line mode, and the required operating measurements are available. `unknown` and `unavailable` are never converted into a healthy status.

### UPS

The selected-UPS view keeps device identity, mode, line/battery state and compact working parameters together without duplicating the complete diagnostic registry.

### Diagnostics

The same persistent Device Selector remains above the selected UPS diagnostic card. The diagnostic content contains four groups:

1. data quality;
2. electrical parameters;
3. extended telemetry;
4. service/vendor diagnostics.

The view explicitly distinguishes the primary SolarPower telemetry channel from the intermittent extended telemetry endpoint. When extended data is unavailable, BUS voltages and temperatures are shown as unavailable rather than reusing stale values.

UPS data timestamps and last-successful-update timestamps are formatted in the Home Assistant configured timezone instead of exposing raw ISO strings.

### History

History shows measurements for the selected UPS only. Key measurements open Home Assistant native more-info/history.

This avoids duplicating long history blocks and keeps the iPhone information hierarchy consistent with Diagnostics.

### Events

Events summarizes the latest selected-device integration event entities for battery mode, cloud telemetry, freshness, fault mode and optional extended telemetry.

## Entity discovery

The frontend discovers Stark SolarPower entities dynamically through Home Assistant's entity and device registries. It groups entities by `device_id` and maps them using stable integration `unique_id` suffixes.

This means another UPS can be added without creating a separate dashboard implementation. The same UI template is applied to every discovered Stark SolarPower device.

## Interaction rules

- Header Menu: open the native Home Assistant sidebar/system menu.
- Device Selector: peer-device context only; no device/domain action.
- Bottom Tab Bar: section switching only.
- Device order is stable and never follows the active selection.
- Large touch targets are used for navigation and actions.
- Long press on factual metrics opens standard Home Assistant more-info.
- The History view also opens native more-info/history for the selected measurement.
- The top-right Refresh action presses the integration's existing `Обновить все ИБП` button entity; it does not call the vendor API from JavaScript.
- No write/control path is introduced.

## Failure-state acceptance matrix

The panel must be field-tested on iPhone Pro Max for these cases:

| Scenario | Expected panel behavior |
| --- | --- |
| Normal line mode | `От сети`; `Облако · Данные актуальны`; current operating measurements visible |
| Battery mode | Visually prominent `От батареи`, battery/load remain visible |
| `data_stale = on` | Freshness line says `Данные устарели` |
| Primary cloud unavailable, recent snapshot retained | `Нет связи · Данные актуальны` |
| Primary cloud unavailable, old snapshot retained | `Нет связи · Данные устарели` |
| Primary cloud unavailable, no snapshot | `Нет связи · Нет данных` |
| Entity `unknown` / `unavailable` | Explicit unknown/unavailable presentation, never healthy |
| Extended telemetry failure | Main UPS state remains usable; BUS/temperature diagnostics unavailable |
| Switch UPS context | Selector positions stay fixed; only active state/content changes |
| Third UPS added | New selector item/template appears without a separate dashboard |

## Relationship with `ha-contract-generated-ui`

`ha-contract-generated-ui` retains only a compact UPS summary and a deep link to `/dashboard-ups`. Detailed UPS diagnostics are owned by this integration and are not duplicated in the central Infrastructure panel.
