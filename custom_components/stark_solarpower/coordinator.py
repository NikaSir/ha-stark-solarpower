"""Data coordinator for Stark SolarPower."""

from __future__ import annotations

import asyncio
from dataclasses import replace
import logging
import time

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import (
    SolarPowerAuthError,
    SolarPowerError,
    StarkDeviceInfo,
    StarkDeviceSnapshot,
    StarkSolarPowerApi,
)
from .const import DOMAIN, MANUAL_REFRESH_COOLDOWN_SECONDS, UPDATE_INTERVAL

_LOGGER = logging.getLogger(__name__)


class StarkSolarPowerCoordinator(
    DataUpdateCoordinator[dict[str, StarkDeviceSnapshot]]
):
    """Poll current data for all Stark UPS devices on the account."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        api: StarkSolarPowerApi,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=UPDATE_INTERVAL,
            always_update=True,
        )
        self.api = api
        self.devices: dict[str, StarkDeviceInfo] = {}
        self._manual_refresh_lock = asyncio.Lock()
        self._last_manual_refresh = 0.0

    async def async_manual_refresh(self) -> bool:
        """Request an immediate account refresh with anti-repeat protection."""
        async with self._manual_refresh_lock:
            now = time.monotonic()
            if (
                now - self._last_manual_refresh
                < MANUAL_REFRESH_COOLDOWN_SECONDS
            ):
                _LOGGER.debug("Manual refresh ignored during cooldown")
                return False
            self._last_manual_refresh = now

        await self.async_request_refresh()
        return True

    async def _async_setup(self) -> None:
        """Authenticate and discover devices once during setup."""
        try:
            discovered = await self.api.async_discover_devices()
        except SolarPowerAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except SolarPowerError as err:
            raise UpdateFailed(f"Device discovery failed: {err}") from err

        self.devices = {device.pn: device for device in discovered}

    async def _async_update_data(self) -> dict[str, StarkDeviceSnapshot]:
        """Fetch current telemetry, retaining stale snapshots per device."""
        if not self.devices:
            raise UpdateFailed("No Stark SolarPower devices were discovered")

        results = await asyncio.gather(
            *(
                self.api.async_get_snapshot(device)
                for device in self.devices.values()
            ),
            return_exceptions=True,
        )

        updated: dict[str, StarkDeviceSnapshot] = {}
        successes = 0
        auth_error: SolarPowerAuthError | None = None

        for device, result in zip(self.devices.values(), results, strict=True):
            if isinstance(result, StarkDeviceSnapshot):
                updated[device.pn] = result
                successes += 1
                continue

            if isinstance(result, SolarPowerAuthError):
                auth_error = result

            previous = (self.data or {}).get(device.pn)
            error_text = str(result)
            _LOGGER.warning("Cannot update %s: %s", device.name, error_text)

            if previous is not None:
                updated[device.pn] = replace(
                    previous,
                    available=False,
                    error=error_text,
                )

        if auth_error is not None:
            raise ConfigEntryAuthFailed(str(auth_error)) from auth_error

        if successes == 0 and not updated:
            first_error = next(
                (str(result) for result in results if isinstance(result, Exception)),
                "unknown error",
            )
            raise UpdateFailed(f"All UPS updates failed: {first_error}")

        return updated
