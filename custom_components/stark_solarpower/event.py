"""Event platform for Stark SolarPower."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.event import EventEntity, EventEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import StarkDeviceSnapshot
from .const import MODE_BATTERY, MODE_FAULT
from .coordinator import StarkSolarPowerCoordinator
from .entity import StarkSolarPowerEntity
from .helpers import is_data_stale
from .sensor import _normalize_mode


EventStateFn = Callable[
    [StarkDeviceSnapshot, StarkSolarPowerCoordinator, str], bool
]


def _is_on_battery(
    snapshot: StarkDeviceSnapshot,
    coordinator: StarkSolarPowerCoordinator,
    pn: str,
) -> bool:
    """Return whether the UPS is currently in battery mode."""
    return _normalize_mode(snapshot.values.get("bt_model")) == MODE_BATTERY


def _is_fault_mode(
    snapshot: StarkDeviceSnapshot,
    coordinator: StarkSolarPowerCoordinator,
    pn: str,
) -> bool:
    """Return whether the UPS reports the explicit Fault Mode state."""
    return _normalize_mode(snapshot.values.get("bt_model")) == MODE_FAULT


def _is_cloud_connected(
    snapshot: StarkDeviceSnapshot,
    coordinator: StarkSolarPowerCoordinator,
    pn: str,
) -> bool:
    """Return whether the latest primary telemetry request succeeded."""
    return snapshot.available


def _is_data_stale(
    snapshot: StarkDeviceSnapshot,
    coordinator: StarkSolarPowerCoordinator,
    pn: str,
) -> bool:
    """Return whether the actual cloud snapshot is stale."""
    return is_data_stale(snapshot)


def _is_extended_available(
    snapshot: StarkDeviceSnapshot,
    coordinator: StarkSolarPowerCoordinator,
    pn: str,
) -> bool:
    """Return whether the latest detailed telemetry request is valid."""
    return (
        coordinator.extended_errors.get(pn) is None
        and pn in coordinator.extended_values
    )


@dataclass(frozen=True, kw_only=True)
class StarkSolarPowerEventDescription(EventEntityDescription):
    """Describe one transition-oriented Stark SolarPower event entity."""

    state_fn: EventStateFn
    active_event_type: str
    inactive_event_type: str


EVENTS: tuple[StarkSolarPowerEventDescription, ...] = (
    StarkSolarPowerEventDescription(
        key="battery_mode_events",
        translation_key="battery_mode_events",
        event_types=["battery_mode_entered", "battery_mode_exited"],
        state_fn=_is_on_battery,
        active_event_type="battery_mode_entered",
        inactive_event_type="battery_mode_exited",
    ),
    StarkSolarPowerEventDescription(
        key="fault_mode_events",
        translation_key="fault_mode_events",
        event_types=["fault_mode_entered", "fault_mode_cleared"],
        state_fn=_is_fault_mode,
        active_event_type="fault_mode_entered",
        inactive_event_type="fault_mode_cleared",
    ),
    StarkSolarPowerEventDescription(
        key="cloud_telemetry_events",
        translation_key="cloud_telemetry_events",
        event_types=["telemetry_restored", "telemetry_lost"],
        state_fn=_is_cloud_connected,
        active_event_type="telemetry_restored",
        inactive_event_type="telemetry_lost",
    ),
    StarkSolarPowerEventDescription(
        key="data_freshness_events",
        translation_key="data_freshness_events",
        event_types=["data_stale", "data_fresh"],
        state_fn=_is_data_stale,
        active_event_type="data_stale",
        inactive_event_type="data_fresh",
    ),
    StarkSolarPowerEventDescription(
        key="extended_telemetry_events",
        translation_key="extended_telemetry_events",
        event_types=[
            "extended_telemetry_restored",
            "extended_telemetry_lost",
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        state_fn=_is_extended_available,
        active_event_type="extended_telemetry_restored",
        inactive_event_type="extended_telemetry_lost",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Stark SolarPower event entities."""
    coordinator: StarkSolarPowerCoordinator = entry.runtime_data
    async_add_entities(
        StarkSolarPowerEvent(coordinator, device, description)
        for device in coordinator.devices.values()
        for description in EVENTS
    )


class StarkSolarPowerEvent(StarkSolarPowerEntity, EventEntity):
    """Expose meaningful UPS state transitions as Home Assistant events."""

    _attr_should_poll = False
    entity_description: StarkSolarPowerEventDescription

    def __init__(
        self,
        coordinator: StarkSolarPowerCoordinator,
        device,
        description: StarkSolarPowerEventDescription,
    ) -> None:
        """Initialize the event entity."""
        super().__init__(coordinator, device, description.key)
        self.entity_description = description
        self._attr_event_types = list(description.event_types)
        self._last_transition_state: bool | None = None

    @property
    def available(self) -> bool:
        """Keep event entities available so they can report failure transitions."""
        return True

    def _current_transition_state(self) -> bool | None:
        """Return the current boolean state used for edge detection."""
        snapshot = self.snapshot
        if snapshot is None:
            return None
        return self.entity_description.state_fn(
            snapshot,
            self.coordinator,
            self.device.pn,
        )

    async def async_added_to_hass(self) -> None:
        """Seed edge detection without replaying an event at startup."""
        self._last_transition_state = self._current_transition_state()
        await super().async_added_to_hass()

    @callback
    def _handle_coordinator_update(self) -> None:
        """Fire one event only when the underlying state changes."""
        current = self._current_transition_state()
        previous = self._last_transition_state
        self._last_transition_state = current

        if current is None or previous is None or current == previous:
            return

        event_type = (
            self.entity_description.active_event_type
            if current
            else self.entity_description.inactive_event_type
        )
        self._trigger_event(event_type)
        self.async_write_ha_state()
