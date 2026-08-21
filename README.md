# Stark SolarPower for Home Assistant

Custom Home Assistant integration for **STARK Country Online** UPS devices monitored through the SolarPower / ShineMonitor cloud backend.

## Status

Current production baseline: **v1.2.0 (build b001)**. Extended telemetry work is staged for **v1.3.0**.

The integration has been tested on two STARK Country Online 1000 VA UPS devices with SolarPower Wi-Fi cards.

## Features

- Cloud polling every 60 seconds.
- Read-only operation: the integration does not send UPS control or configuration commands.
- Automatic device discovery from the SolarPower account.
- Stable device identity based on Wi-Fi module PN.
- Input/output voltage and frequency.
- Output current and load.
- Battery voltage and charge.
- Positive/negative DC bus voltage and four internal temperature channels.
- Optional battery/runtime and internal power-stage/relay diagnostics from the detailed SolarPower endpoint.
- Operating mode and on-battery state.
- Cloud telemetry availability.
- UPS data timestamp and data age.
- Stale-data protection: operational entities become unavailable when cloud data is too old.
- Manual **Refresh all UPS** button.
- HTTPS transport when supported by the SolarPower endpoint.
- Detailed SolarPower telemetry is sampled every 5 minutes without changing the 60-second primary polling interval.
- Diagnostics retain the full normalized detailed field set with credentials and tokens excluded.

## Installation with HACS

1. Open HACS in Home Assistant.
2. Add this repository as a custom repository:
   `https://github.com/NikaSir/ha-stark-solarpower`
3. Category: **Integration**.
4. Install **Stark SolarPower**.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration** and search for **Stark SolarPower**.
7. Enter the SolarPower username and password.

## Manual installation

Copy:

```text
custom_components/stark_solarpower/
```

to:

```text
/config/custom_components/stark_solarpower/
```

and restart Home Assistant.

## Data freshness model

SolarPower cloud updates can lag the physical UPS by roughly 2–3 minutes. The integration therefore distinguishes between:

- successful cloud communication;
- the timestamp of the actual UPS data snapshot;
- the calculated age of that snapshot.

The default stale threshold is **360 seconds (6 minutes)**. When data is stale, operational values are intentionally marked unavailable instead of presenting old measurements as current.

## Security

- Passwords, API tokens, account secrets and private diagnostic payloads must never be committed to this repository.
- The integration is read-only.
- HTTPS is preferred automatically; compatibility fallback is retained for the SolarPower backend if required.

## License

MIT
