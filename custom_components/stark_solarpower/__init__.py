"""The Stark SolarPower integration."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .api import StarkSolarPowerApi
from .const import DOMAIN
from .coordinator import StarkSolarPowerCoordinator
from .panel import async_register_ups_panel, async_unregister_ups_panel

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.EVENT,
]

PANEL_ENTRY_IDS = "panel_entry_ids"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Stark SolarPower from a config entry."""
    utc_offset = dt_util.now().utcoffset()
    fallback_timezone_offset = (
        int(utc_offset.total_seconds()) if utc_offset is not None else None
    )
    api = StarkSolarPowerApi(
        async_get_clientsession(hass),
        entry.data[CONF_USERNAME],
        entry.data[CONF_PASSWORD],
        fallback_timezone_offset=fallback_timezone_offset,
    )
    coordinator = StarkSolarPowerCoordinator(hass, entry, api)
    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    domain_data = hass.data.setdefault(DOMAIN, {})
    entry_ids = domain_data.setdefault(PANEL_ENTRY_IDS, set())
    if isinstance(entry_ids, set):
        entry_ids.add(entry.entry_id)

    try:
        await async_register_ups_panel(hass)
    except (OSError, RuntimeError, ValueError) as err:
        # The monitoring integration must stay operational even if the optional
        # frontend panel cannot be registered on a particular HA frontend build.
        _LOGGER.warning("Cannot register Stark SolarPower UPS panel: %s", err)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Stark SolarPower config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        domain_data = hass.data.setdefault(DOMAIN, {})
        entry_ids = domain_data.get(PANEL_ENTRY_IDS)
        if isinstance(entry_ids, set):
            entry_ids.discard(entry.entry_id)
            if not entry_ids:
                async_unregister_ups_panel(hass)
        else:
            async_unregister_ups_panel(hass)
    return unloaded
