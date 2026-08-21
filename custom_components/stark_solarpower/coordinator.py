"""Data coordinator for Stark SolarPower."""

from __future__ import annotations

import asyncio
from dataclasses import replace
from datetime import UTC, datetime
import logging
import time
from typing import Any

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
from .const import (
    DOMAIN,
    EXTENDED_UPDATE_INTERVAL,
    MANUAL_REFRESH_COOLDOWN_SECONDS,
    UPDATE_INTERVAL,
)
from .extended import async_get_extended_values

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
        self._last_extended_refresh = 0.0
        self._force_extended_refresh = True
        self.extended_values: dict[str, dict[str, Any]] = {}
        self.extended_fetched_at: dict[str, datetime] = {}
        self.extended_errors: dict[str, str | None] = {}

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
            self._force_extended_refresh = True

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

    def _extended_refresh_due(self) -> bool:
        """Return whether slow-changing detailed telemetry should be refreshed."""
        return self._force_extended_refresh or (
            time.monotonic() - self._last_extended_refresh
            >= EXTENDED_UPDATE_INTERVAL.total_seconds()
        )

    async def _async_update_data(self) -> dict[str, StarkDeviceSnapshot]:
        """Fetch current telemetry, retaining stale snapshots per device."""
        if not self.devices:
            raise UpdateFailed("No Stark SolarPower devices were discovered")

        devices = list(self.devices.values())
        refresh_extended = self._extended_refresh_due()
        requests = [self.api.async_get_snapshot(device) for device in devices]
        if refresh_extended:
            requests.extend(
                async_get_extended_values(self.api, device) for device in devices
            )

        results = await asyncio.gather(*requests, return_exceptions=True)
        current_results = results[: len(devices)]
        extended_results = results[len(devices) :] if refresh_extended else []

        auth_error: SolarPowerAuthError | None = None

        if refresh_extended:
            self._last_extended_refresh = time.monotonic()
            self._force_extended_refresh = False
            fetched_at = datetime.now(tz=UTC)
            for device, result in zip(devices, extended_results, strict=True):
                if isinstance(result, dict):
                    self.extended_values[device.pn] = result
                    self.extended_fetched_at[device.pn] = fetched_at
                    self.extended_errors[device.pn] = None
                    continue
                if isinstance(result, SolarPowerAuthError):
                    auth_error = result
                error_text = str(result)
                self.extended_errors[device.pn] = error_text
                _LOGGER.debug(
                    "Cannot update extended telemetry for %s: %s",
                    device.name,
                    error_text,
                )

        updated: dict[str, StarkDeviceSnapshot] = {}
        successes = 0

        for device, result in zip(devices, current_results, strict=True):
            if isinstance(result, StarkDeviceSnapshot):
                values = dict(result.values)
                values.update(
                    {
                        f"ext_{key}": value
                        for key, value in self.extended_values.get(
                            device.pn, {}
                        ).items()
                    }
                )
                updated[device.pn] = replace(result, values=values)
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
                (
                    str(result)
                    for result in current_results
                    if isinstance(result, Exception)
                ),
                "unknown error",
            )
            raise UpdateFailed(f"All UPS updates failed: {first_error}")

        return updated
