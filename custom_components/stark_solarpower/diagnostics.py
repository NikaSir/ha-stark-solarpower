"""Diagnostics support for Stark SolarPower."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_USERNAME
from homeassistant.core import HomeAssistant

from .const import EXTENDED_UPDATE_INTERVAL, STALE_AFTER
from .coordinator import StarkSolarPowerCoordinator
from .helpers import data_age_seconds, is_data_stale


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict:
    """Return diagnostics without password, token or API secret."""
    coordinator: StarkSolarPowerCoordinator = entry.runtime_data
    return {
        "account": {
            "username": entry.data.get(CONF_USERNAME),
            "profile": "wifiapp.volfw.solarpower",
            "polling_seconds": int(coordinator.update_interval.total_seconds()),
            "extended_polling_seconds": int(
                EXTENDED_UPDATE_INTERVAL.total_seconds()
            ),
            "stale_after_seconds": int(STALE_AFTER.total_seconds()),
            "read_only": True,
            "api_transport": coordinator.api.transport_scheme,
        },
        "devices": {
            pn: {
                "name": snapshot.device.name,
                "pn": snapshot.device.pn,
                "sn": snapshot.device.sn,
                "devcode": snapshot.device.devcode,
                "devaddr": snapshot.device.devaddr,
                "timezone_offset_seconds": snapshot.device.timezone_offset,
                "cloud_timestamp": (
                    snapshot.cloud_timestamp.isoformat()
                    if snapshot.cloud_timestamp is not None
                    else None
                ),
                "data_age_seconds": data_age_seconds(snapshot),
                "data_stale": is_data_stale(snapshot),
                "fetched_at": snapshot.fetched_at.isoformat(),
                "available": snapshot.available,
                "error": snapshot.error,
                "values": {
                    key: value
                    for key, value in snapshot.values.items()
                    if not key.startswith("ext_")
                },
                "extended_fetched_at": (
                    coordinator.extended_fetched_at[pn].isoformat()
                    if pn in coordinator.extended_fetched_at
                    else None
                ),
                "extended_error": coordinator.extended_errors.get(pn),
                "extended_values": coordinator.extended_values.get(pn, {}),
            }
            for pn, snapshot in (coordinator.data or {}).items()
        },
    }
