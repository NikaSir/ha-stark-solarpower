"""Button platform for Stark SolarPower."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .coordinator import StarkSolarPowerCoordinator
from .entity import StarkSolarPowerEntity

REFRESH_BUTTON = ButtonEntityDescription(
    key="refresh_now",
    translation_key="refresh_now",
    icon="mdi:refresh",
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up one manual refresh button per UPS device."""
    coordinator: StarkSolarPowerCoordinator = entry.runtime_data
    async_add_entities(
        StarkSolarPowerRefreshButton(coordinator, device)
        for device in coordinator.devices.values()
    )


class StarkSolarPowerRefreshButton(StarkSolarPowerEntity, ButtonEntity):
    """Request an immediate cloud refresh for the account."""

    entity_description = REFRESH_BUTTON

    def __init__(self, coordinator: StarkSolarPowerCoordinator, device) -> None:
        """Initialize the refresh button."""
        super().__init__(coordinator, device, REFRESH_BUTTON.key)

    @property
    def available(self) -> bool:
        """Keep manual refresh available while the integration is loaded."""
        return True

    async def async_press(self) -> None:
        """Request an immediate coordinator refresh."""
        await self.coordinator.async_manual_refresh()
