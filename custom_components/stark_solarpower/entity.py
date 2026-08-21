"""Shared entities for Stark SolarPower."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .api import StarkDeviceInfo, StarkDeviceSnapshot
from .const import DOMAIN, MANUFACTURER
from .coordinator import StarkSolarPowerCoordinator


class StarkSolarPowerEntity(CoordinatorEntity[StarkSolarPowerCoordinator]):
    """Base entity bound to one SolarPower Wi-Fi module."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: StarkSolarPowerCoordinator,
        device: StarkDeviceInfo,
        entity_key: str,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator, context=f"{device.pn}:{entity_key}")
        self.device = device
        self._attr_unique_id = f"{device.pn}_{entity_key}"

    @property
    def snapshot(self) -> StarkDeviceSnapshot | None:
        """Return the latest snapshot for this device."""
        return (self.coordinator.data or {}).get(self.device.pn)

    @property
    def device_info(self) -> DeviceInfo:
        """Return device-registry information."""
        snapshot = self.snapshot
        firmware = None
        rated_power = None
        if snapshot is not None:
            firmware = snapshot.values.get("sy_firmware_version")
            rated_power = snapshot.values.get("gd_output_rated")

        model = "Country Online"
        if isinstance(rated_power, (int, float)):
            model = f"Country Online {rated_power:g} VA"

        return DeviceInfo(
            identifiers={(DOMAIN, self.device.pn)},
            name=self.device.name,
            manufacturer=MANUFACTURER,
            model=model,
            sw_version=str(firmware) if firmware is not None else None,
        )

    @property
    def available(self) -> bool:
        """Return whether live data for this device is available."""
        snapshot = self.snapshot
        return (
            super().available
            and snapshot is not None
            and snapshot.available
        )
