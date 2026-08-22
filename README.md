# Stark SolarPower for Home Assistant

Custom Home Assistant integration for **STARK Country Online** UPS devices monitored through the SolarPower / ShineMonitor cloud backend.

## Status

Current production baseline: **v1.3.0**.

The integration has been field-tested on two STARK Country Online 1000 VA UPS devices with SolarPower Wi-Fi cards.

## Features

- Cloud polling every 60 seconds.
- Read-only operation: the integration does not send UPS control or configuration commands.
- Automatic device discovery from the SolarPower account.
- Stable device identity based on Wi-Fi module PN.
- Input/output voltage and frequency.
- Output current and load.
- Battery voltage and charge.
- Positive/negative DC bus voltage and four internal temperature channels.
- Optional vendor RAW battery/runtime and internal power-stage/relay diagnostics from the detailed SolarPower endpoint.
- Operating mode and on-battery state.
- Cloud telemetry availability.
- UPS data timestamp and data age.
- Stale-data protection: operational entities become unavailable when cloud data is too old.
- Manual **Refresh all UPS** button.
- HTTPS transport when supported by the SolarPower endpoint.
- Detailed SolarPower telemetry is sampled every 5 minutes without changing the 60-second primary polling interval.
- Failed detailed telemetry is retried on the next normal 60-second coordinator pass.
- Diagnostics retain the full normalized detailed field set with credentials and tokens excluded.

## Installation and updates with HACS

1. Open HACS in Home Assistant.
2. Add this repository as a custom repository:
   `https://github.com/NikaSir/ha-stark-solarpower`
3. Category: **Integration**.
4. Install **Stark SolarPower**.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration** and search for **Stark SolarPower**.
7. Enter the SolarPower username and password when configuring the integration for the first time.

For routine upgrades, update **Stark SolarPower** from HACS and restart Home Assistant when requested. Do not remove the Home Assistant config entry during normal upgrades. Manual ZIP installation is retained only as an emergency recovery path.

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
- the calculated age of that snapshot;
- the slower detailed-telemetry endpoint.

The default primary stale threshold is **360 seconds (6 minutes)**. When data is stale, operational values are intentionally marked unavailable instead of presenting old measurements as current.

Detailed telemetry is intentionally sampled every 5 minutes. If the latest detailed request for one UPS fails, cached detailed values remain in diagnostics but are not merged into live entities. The integration retries the detailed request on the next normal 60-second pass.

## Validated detailed fields

On both field UPS devices, the following were confirmed:

- protocol ID `PI01`;
- battery piece count `2`;
- positive and negative DC bus voltages;
- UPS, PFC, ambient and charger temperature channels;
- vendor `Open` / `Closed` values for DC-DC, PFC, inverter, input relay and output relay.

The vendor field named `Battery Group NNumber` contains values that differ between the two otherwise similar UPS devices. It is therefore exposed only as **vendor RAW** diagnostics, not as a physical group count. The integration preserves the vendor's misspelled raw key and also provides a stable internal alias so entity unique IDs do not depend on that typo.

`Battery Remain Time` is also kept as a unitless vendor RAW value until its unit and interpretation are proven.

`Fault Kind` and the associated pre-fault snapshot are retained only in diagnostics. `Fault Kind = 14` was observed while both UPS devices were operating normally, so it must not be interpreted as an active alarm.

## Security

- Passwords, API tokens, account secrets and private diagnostic payloads must never be committed to this repository.
- The integration is read-only.
- HTTPS is preferred automatically; compatibility fallback is retained for the SolarPower backend if required.

## License

MIT
