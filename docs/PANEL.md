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
- Panel UI version: `0.6.2`
- Primary navigation: full-width fixed bottom Tab Bar

The same metadata is shipped in `custom_components/stark_solarpower/panel_manifest.json` for `ha-contract-generated-ui` and other consumers.

## NikaS application shell

UI v0.6.2 uses the NikaS specialized-panel shell with a single fixed-layout transform canvas:

`Safe Area → Header → Device Selector → zoomable selected-UPS viewport → Bottom Tab Bar`

The Header belongs to the specialized-panel shell and remains at native scale. Its permanent left control opens the native Home Assistant main-system menu; Refresh remains the single right-side shell action. `Stark SolarPower` is geometrically centered between symmetric Menu and Refresh zones. No decorative battery/brand icon is shown in the Header.

Only the selected-UPS work viewport scales. Its complete live DOM is measured once and transformed as one canvas, so no card, SVG path or overlay is independently reflowed during pinch. Zoom and pan are represented by one persistent `translate3d(x,y,0) scale(s)` transform. The viewport does not use native overflow scrolling, so iOS cannot expose a temporary rubber-band position and return it to the origin after touch release. This applies to ordinary vertical movement at 100% as well as panning an enlarged canvas. Two-finger pinch uses the point between the fingers; one finger changes the canvas translation horizontally and vertically. The transform state survives selected-UPS telemetry DOM replacement. Pinch and drag cancel pending entity holds and suppress post-gesture clicks so native more-info graphs open only from an intentional stationary hold. No on-screen zoom buttons are rendered. A two-finger double tap resets scale and translation to 100%/origin; a completed pinch between 97% and 103% snaps to exactly 100%.

The primary bottom navigation is full-width, fixed to the bottom edge, iOS-safe and contains `Обзор`, `ИБП`, `История`, `События`, and `Диагн.`. Active state remains inside the common bar. Factual entities keep long press → native Home Assistant more-info.

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
- stale/fresh data status and age;
- compact input/output/load metrics;
- explicit non-disconnectable-line and battery state rows.

The photographic hero is the only standalone Overview presentation of input voltage, load and battery charge. A repeated three-card Input/Output/Load row is not rendered; output voltage and the complete factual set remain available in the compact state summary and the dedicated UPS view. The photographic room uses the available height: the UPS is enlarged and grounded on the floor, while the battery card sits above the cabinet with its own live path. The reserve-ready strip is a separate surface below the photograph rather than an overlay on the room. The normal target-phone Overview remains vertically compacted so both state rows stay visible above the fixed Bottom Tab Bar without an initial scroll.

The hero uses a local context plate selected from the device name: a network room for `UPS Интернет` and a boiler room for `UPS Котёл`. The background is decorative only. The product, power paths, status nodes and values are independent runtime layers and remain factual.

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
| Normal line mode | Healthy status, current operating measurements visible |
| Battery mode | Visually prominent `От батареи`, battery/load remain visible |
| `data_stale = on` | `Данные устарели`, never healthy |
| Primary cloud unavailable | `Облако недоступно`, live measurements unavailable |
| Entity `unknown` / `unavailable` | Explicit unknown/unavailable presentation, never healthy |
| Extended telemetry failure | Main UPS state remains usable; BUS/temperature diagnostics unavailable |
| Switch UPS context | Selector positions stay fixed; only active state/content changes |
| Third UPS added | New selector item/template appears without a separate dashboard |

## Relationship with `ha-contract-generated-ui`

`ha-contract-generated-ui` retains only a compact UPS summary and a deep link to `/dashboard-ups`. Detailed UPS diagnostics are owned by this integration and are not duplicated in the central Infrastructure panel.
