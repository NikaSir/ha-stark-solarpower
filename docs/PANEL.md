# Stark SolarPower panel

The Stark SolarPower integration owns a dedicated Home Assistant panel for day-to-day UPS monitoring.

## Navigation contract

- Panel ID: `ups`
- Owner: `stark_solarpower`
- Stable route: `/dashboard-ups`
- Sidebar title: `UPS`
- Icon: `mdi:battery-charging`
- Preferred view: `overview`
- Panel UI version: `0.1.0`

The same metadata is shipped in `custom_components/stark_solarpower/panel_manifest.json` for `ha-contract-generated-ui` and other consumers.

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

### Diagnostics

A device selector is followed by four groups:

1. data quality;
2. electrical parameters;
3. extended telemetry;
4. service/vendor diagnostics.

The view explicitly distinguishes the primary SolarPower telemetry channel from the intermittent extended telemetry endpoint. When extended data is unavailable, BUS voltages and temperatures are shown as unavailable rather than reusing stale values.

### History

The panel keeps the mobile history view compact. Key measurements are listed with current values and open Home Assistant's native more-info/history on interaction. The same view summarizes the latest integration event entities for battery mode, cloud telemetry, freshness and fault mode.

This avoids placing four large charts on the iPhone overview while still using Home Assistant's native recorder/history implementation.

## Entity discovery

The frontend discovers Stark SolarPower entities dynamically through Home Assistant's entity and device registries. It groups entities by `device_id` and maps them using stable integration `unique_id` suffixes.

This means a third UPS can be added without creating a separate dashboard implementation. The same UI template is applied to every discovered Stark SolarPower device.

## Interaction rules

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

`ha-contract-generated-ui` should retain only a compact UPS summary and a `Подробнее` link to `/dashboard-ups`. Detailed UPS diagnostics should not be duplicated after this panel becomes the canonical UPS interface.
