"""Binary sensor platform for Stark SolarPower."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import StarkDeviceSnapshot
from .const import MODE_BATTERY
from .coordinator import StarkSolarPowerCoordinator
from .entity import StarkSolarPowerEntity
from .helpers import is_data_stale
from .sensor import _normalize_mode


@dataclass(frozen=True, kw_only=True)
class StarkSolarPowerBinarySensorDescription(BinarySensorEntityDescription):
    """Binary sensor description with a snapshot value extractor."""

    value_fn: Callable[[StarkDeviceSnapshot], bool]
    requires_live_data: bool = False


BINARY_SENSORS: tuple[StarkSolarPowerBinarySensorDescription, ...] = (
    StarkSolarPowerBinarySensorDescription(
        key="on_battery",
        translation_key="on_battery",
        value_fn=lambda snapshot: (
            _normalize_mode(snapshot.values.get("bt_model")) == MODE_BATTERY
        ),
        requires_live_data=True,
    ),
    StarkSolarPowerBinarySensorDescription(
        key="cloud_connected",
        translation_key="cloud_connected",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda snapshot: snapshot.available,
    ),
    StarkSolarPowerBinarySensorDescription(
        key="data_stale",
        translation_key="data_stale",
        device_class=BinarySensorDeviceClass.PROBLEM,
        value_fn=is_data_stale,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Stark SolarPower binary sensors."""
    coordinator: StarkSolarPowerCoordinator = entry.runtime_data
    async_add_entities(
        StarkSolarPowerBinarySensor(coordinator, device, description)
        for device in coordinator.devices.values()
        for description in BINARY_SENSORS
    )


class StarkSolarPowerBinarySensor(StarkSolarPowerEntity, BinarySensorEntity):
    """One derived Stark SolarPower state."""

    entity_description: StarkSolarPowerBinarySensorDescription

    def __init__(
        self,
        coordinator: StarkSolarPowerCoordinator,
        device,
        description: StarkSolarPowerBinarySensorDescription,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator, device, description.key)
        self.entity_description = description

    @property
    def available(self) -> bool:
        """Keep connectivity and stale diagnostics visible during failures."""
        snapshot = self.snapshot
        if snapshot is None or not self.coordinator.last_update_success:
            return False
        if self.entity_description.requires_live_data:
            return snapshot.available and not is_data_stale(snapshot)
        return True

    @property
    def is_on(self) -> bool | None:
        """Return the binary state."""
        snapshot = self.snapshot
        if snapshot is None:
            return None
        return self.entity_description.value_fn(snapshot)
