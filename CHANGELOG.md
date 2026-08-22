# Changelog

All notable project changes are recorded here.

## [1.4.0] - 2026-08-22

### Added

- Home Assistant event entities for UPS state transitions.
- Battery-mode entered/exited events.
- Explicit Fault Mode entered/cleared events based only on the validated operating-mode field.
- Cloud telemetry lost/restored events.
- UPS data stale/fresh events using the existing 6-minute freshness model.
- Optional extended-telemetry lost/restored diagnostic events.
- English and Russian event names and event-type translations.

### Design

- Event entities are edge-triggered and do not replay an event when Home Assistant starts.
- No new device-automation trigger API is added. Home Assistant developer guidance currently recommends event entities for integration events, while legacy device automations are being phased away for new integrations.
- Event reporting remains read-only and does not add any UPS control commands.

## [1.3.0] - 2026-08-22

### Added

- Detailed `queryDeviceLastData` read-only telemetry sampled every 5 minutes.
- Positive and negative DC bus voltage sensors.
- UPS, PFC, ambient and charger temperature sensors.
- Optional diagnostics for vendor battery runtime RAW value, battery piece/group fields, protocol ID, DC-DC/PFC/inverter states and input/output relay states.
- Full normalized detailed telemetry payload in Home Assistant diagnostics for future field mapping without exposing credentials or API secrets.

### Changed

- Stale-data threshold increased from 5 to 6 minutes (360 seconds).
- Manual **Refresh all UPS** also forces an immediate detailed-telemetry refresh.
- Primary cloud polling remains 60 seconds.
- Battery remaining-time value is exposed as a unitless RAW diagnostic until the SolarPower cloud field unit is verified on real hardware.
- Extended telemetry is no longer merged into live entities after a failed latest detailed poll; cached values remain available only in diagnostics until a successful retry.
- Failed detailed telemetry is retried on the next normal 60-second coordinator pass instead of waiting another full 5-minute interval.

### Field validation

- UPS protocol ID `PI01` confirmed on both field UPS devices.
- Battery piece count reported as `2` on both field UPS devices.
- The vendor field `Battery Group NNumber` normalizes to `battery_group_nnumber`; a stable internal alias is retained without changing entity unique IDs. Field values differ between the two UPS devices, so it remains a RAW diagnostic rather than a physical group count.
- Input/output relay and DC-DC/PFC/inverter fields return vendor `Open`/`Closed` text; semantics remain diagnostic-only pending state-transition verification.
- `Fault Kind = 14` is present while both UPS devices are operating normally, so it is treated as historical/vendor RAW data rather than an active alarm.

### Safety

- Ambiguous vendor fields such as `Fault Kind`, pre-fault snapshots, `battery_voltage_2`, high/low voltage fields, and vendor runtime/group semantics are collected in diagnostics first and are not promoted to active alarm/control semantics until verified on real hardware.

## [1.2.0] - 2026-08-21

### Added

- HTTPS-first SolarPower API transport with compatibility fallback.
- API transport information in diagnostics.
- Stale-data hardening: operational entities become unavailable when the actual UPS snapshot is older than 5 minutes.
- Manual **Refresh all UPS** action with debounce protection.
- Integration-local brand icon and logo.

### Preserved

- 60-second automatic polling interval.
- Existing entity unique IDs and device identifiers.
- Read-only cloud access model.

### Verified

- Tested on Home Assistant 2026.8.2.
- Verified with two STARK Country Online 1000 VA UPS devices.
- Verified HTTPS transport.
- Verified stale-data and cloud-unavailable behavior on real hardware.

## [1.1.0] - 2026-08-20

### Added

- UPS data timestamp based on SolarPower `gts`.
- Data age sensor.
- Stale-data binary sensor based on the actual cloud snapshot timestamp.
- Manual refresh action.

### Changed

- Automatic polling remains 60 seconds.

## [1.0.0] - 2026-08-20

### Added

- Initial working Stark SolarPower Home Assistant integration.
- Two-device SolarPower account discovery.
- Read-only telemetry for input/output power parameters, load and battery.
