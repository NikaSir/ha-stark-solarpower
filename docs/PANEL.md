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
- Panel UI version: `0.3.0`
- Primary navigation: fixed bottom bar

The same metadata is shipped in `custom_components/stark_solarpower/panel_manifest.json` for `ha-contract-generated-ui` and other consumers.

## NikaS application shell

UI v0.3.0 follows the shared Home Assistant NikaS specialized-panel shell:

`Header → current UPS screen → fixed bottom navigation`

The header is reserved for leaving the specialized panel and for global panel actions. The left Back control performs an explicit Home Assistant navigation to `/dashboard-infrastructure/overview`; it never uses browser history. The existing refresh action remains the single global action on the right.

The bottom navigation is fixed in the iPhone thumb zone and contains `Обзор`, `Диагностика`, and `История`. It accounts for the iOS bottom safe area and never performs entity-specific actions. Factual entities continue to use long press → native Home Assistant more-info.

## Product intent

The panel is mobile-first and targets iPhone Pro Max in portrait orientation. It is a device-centric application rather than a registry of Home Assistant entities.

The information hierarchy is:

`UPS → operating state → power path → battery/load → data trust → diagnostics`

The integration remains the single source of truth. The panel does not call Stark/SolarPower APIs directly and does not introduce control commands outside integration entities.

## Views

### Overview

One card per UPS. The card shows:

- overall status;
- operating mode and battery-mode state;
- input → UPS → output power path;
- battery percentage;
- output load;
- primary cloud availability;
- stale/fresh data status and age;
- compact input/output/battery/load metrics.

The status is green only when the primary cloud source is available, data is fresh, the UPS is in line mode, and the required operating measurements are available. `unknown` and `unavailable` are never converted into a healthy status.

The v0.1 Overview information architecture was accepted on a real iPhone Pro Max and remains the baseline rather than being redesigned during shell changes.

### Diagnostics

A device selector is followed by four groups:

1. data quality;
2. electrical parameters;
3. extended telemetry;
4. service/vendor diagnostics.

The view explicitly distinguishes the primary SolarPower telemetry channel from the intermittent extended telemetry endpoint. When extended data is unavailable, BUS voltages and temperatures are shown as unavailable rather than reusing stale values.

UPS data timestamps and last-successful-update timestamps are formatted in the Home Assistant configured timezone instead of exposing raw ISO strings. Technical values use a tighter mobile layout for iPhone-sized viewports.

### History

The panel keeps the mobile history view compact. Key measurements are listed with current values and open Home Assistant's native more-info/history on interaction. The same view summarizes the latest integration event entities for battery mode, cloud telemetry, freshness and fault mode.

The current operating mode is shown on each history card and latest integration events carry relative timestamps while preserving the exact local timestamp as detail.

This avoids placing four large charts on the iPhone overview while still using Home Assistant's native recorder/history implementation.

## Entity discovery

The frontend discovers Stark SolarPower entities dynamically through Home Assistant's entity and device registries. It groups entities by `device_id` and maps them using stable integration `unique_id` suffixes.

This means a third UPS can be added without creating a separate dashboard implementation. The same UI template is applied to every discovered Stark SolarPower device.

## Interaction rules

- Header Back: explicit navigate to `/dashboard-infrastructure/overview`.
- Bottom navigation: section switching only.
- Large touch targets are used for navigation and actions.
- Long press on factual metrics opens standard Home Assistant more-info.
- The History view also opens native more-info/history directly for the selected measurement.
- The top-right refresh action presses the integration's existing `Обновить все ИБП` button entity; it does not call the vendor API from JavaScript.
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
| Third UPS added | New card/device selector appears automatically |

## Relationship with `ha-contract-generated-ui`

`ha-contract-generated-ui` retains only a compact UPS summary and a deep link to `/dashboard-ups`. Detailed UPS diagnostics are owned by this integration and are not duplicated in the central Infrastructure panel.
