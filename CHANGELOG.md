# Changelog

All notable project changes are recorded here.

## [1.3.0] - 2026-08-22

### Added

- Detailed `queryDeviceLastData` read-only telemetry sampled every 5 minutes.
- Positive and negative DC bus voltage sensors.
- UPS, PFC, ambient and charger temperature sensors.
- Optional diagnostics for vendor battery runtime estimate, battery piece/group counts, protocol ID, DC-DC/PFC/inverter states and input/output relay states.
- Full normalized detailed telemetry payload in Home Assistant diagnostics for future field mapping without exposing credentials or API secrets.

### Changed

- Stale-data threshold increased from 5 to 6 minutes (360 seconds).
- Manual **Refresh all UPS** also forces an immediate detailed-telemetry refresh.
- Primary cloud polling remains 60 seconds.
- Battery remaining-time value is exposed as a unitless RAW diagnostic until the SolarPower cloud field unit is verified on real hardware.

### Field validation

- UPS protocol ID `PI01` confirmed on real hardware.
- Battery piece count reported as `2` on UPS Boiler.
- Battery group count may be absent for this model and correctly remains unavailable.
- Input/output relay and DC-DC/PFC/inverter fields return vendor `Open`/`Closed` text; semantics remain diagnostic-only pending state-transition verification.

### Safety

- Ambiguous vendor fields such as `Fault Kind`, pre-fault snapshots, high/low voltage fields and vendor runtime units are collected in diagnostics first and are not promoted to active alarm/control semantics until verified on real hardware.

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
