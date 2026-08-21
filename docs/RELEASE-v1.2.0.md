# Stark SolarPower v1.2.0 (build b001)

Verified hardening release candidate for Home Assistant.

## Verified on real hardware

- Home Assistant 2026.8.2.
- Two STARK Country Online 1000 VA UPS devices.
- SolarPower Wi-Fi cloud telemetry.
- HTTPS API transport.
- 60-second polling.
- 5-minute stale-data threshold.
- Operational entities become unavailable when data is stale or the current cloud update fails.
- Read-only behavior.

## Device identity

Stable Home Assistant device identity is based on the SolarPower Wi-Fi module PN, not the UPS serial number.

## Release path

This release is intended to become the first GitHub/HACS-managed baseline after the previously field-tested ZIP builds.
