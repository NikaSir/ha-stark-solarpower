"""Sensor platform for Stark SolarPower."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    EntityCategory,
    UnitOfElectricCurrent,
    UnitOfElectricPotential,
    UnitOfFrequency,
    UnitOfTemperature,
    UnitOfTime,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import StarkDeviceSnapshot
from .const import (
    MODE_BATTERY,
    MODE_BYPASS,
    MODE_FAULT,
    MODE_LINE,
    MODE_OPTIONS,
    MODE_SHUTDOWN,
    MODE_STANDBY,
    MODE_UNKNOWN,
)
from .coordinator import StarkSolarPowerCoordinator
from .entity import StarkSolarPowerEntity
from .helpers import data_age_seconds, is_data_stale


def _normalize_mode(value: Any) -> str:
    """Normalize vendor mode text to stable enum values."""
    text = str(value or "").strip().casefold()
    mapping = {
        "line mode": MODE_LINE,
        "battery mode": MODE_BATTERY,
        "standby mode": MODE_STANDBY,
        "bypass mode": MODE_BYPASS,
        "fault mode": MODE_FAULT,
        "shutdown mode": MODE_SHUTDOWN,
    }
    return mapping.get(text, MODE_UNKNOWN)


def _extended_value(snapshot: StarkDeviceSnapshot, key: str) -> Any:
    """Return one normalized detailed-telemetry value."""
    return snapshot.values.get(f"ext_{key}")


@dataclass(frozen=True, kw_only=True)
class StarkSolarPowerSensorDescription(SensorEntityDescription):
    """Sensor description with a snapshot value extractor."""

    value_fn: Callable[[StarkDeviceSnapshot], Any]
    requires_live_data: bool = True


SENSORS: tuple[StarkSolarPowerSensorDescription, ...] = (
    StarkSolarPowerSensorDescription(
        key="mode",
        translation_key="mode",
        device_class=SensorDeviceClass.ENUM,
        value_fn=lambda snapshot: _normalize_mode(snapshot.values.get("bt_model")),
    ),
    StarkSolarPowerSensorDescription(
        key="input_voltage",
        translation_key="input_voltage",
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_mains_voltage"),
    ),
    StarkSolarPowerSensorDescription(
        key="input_frequency",
        translation_key="input_frequency",
        device_class=SensorDeviceClass.FREQUENCY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfFrequency.HERTZ,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_mains_frequency"),
    ),
    StarkSolarPowerSensorDescription(
        key="output_voltage",
        translation_key="output_voltage",
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_output_voltage"),
    ),
    StarkSolarPowerSensorDescription(
        key="output_frequency",
        translation_key="output_frequency",
        device_class=SensorDeviceClass.FREQUENCY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfFrequency.HERTZ,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_output_frequency"),
    ),
    StarkSolarPowerSensorDescription(
        key="output_current",
        translation_key="output_current",
        device_class=SensorDeviceClass.CURRENT,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricCurrent.AMPERE,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_output_current"),
    ),
    StarkSolarPowerSensorDescription(
        key="output_load",
        translation_key="output_load",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
        value_fn=lambda snapshot: snapshot.values.get("bt_output_load_percent"),
    ),
    StarkSolarPowerSensorDescription(
        key="battery_voltage",
        translation_key="battery_voltage",
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        suggested_display_precision=1,
        value_fn=lambda snapshot: snapshot.values.get("bt_battery_voltage"),
    ),
    StarkSolarPowerSensorDescription(
        key="battery_capacity",
        translation_key="battery_capacity",
        device_class=SensorDeviceClass.BATTERY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
        value_fn=lambda snapshot: snapshot.values.get("bt_battery_capacity"),
    ),
    StarkSolarPowerSensorDescription(
        key="positive_bus_voltage",
        translation_key="positive_bus_voltage",
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "positive_bus_voltage"),
    ),
    StarkSolarPowerSensorDescription(
        key="negative_bus_voltage",
        translation_key="negative_bus_voltage",
        device_class=SensorDeviceClass.VOLTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "negative_bus_voltage"),
    ),
    StarkSolarPowerSensorDescription(
        key="ups_temperature",
        translation_key="ups_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "temperature"),
    ),
    StarkSolarPowerSensorDescription(
        key="pfc_temperature",
        translation_key="pfc_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "temperature1_pfc_ntc"),
    ),
    StarkSolarPowerSensorDescription(
        key="ambient_temperature",
        translation_key="ambient_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "temperature2_ambient_ntc"),
    ),
    StarkSolarPowerSensorDescription(
        key="charger_temperature",
        translation_key="charger_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=0,
        value_fn=lambda snapshot: _extended_value(snapshot, "temperature3_charger_ntc"),
    ),
    StarkSolarPowerSensorDescription(
        key="battery_remain_time",
        translation_key="battery_remain_time",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "battery_remain_time"),
    ),
    StarkSolarPowerSensorDescription(
        key="battery_piece_number",
        translation_key="battery_piece_number",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        requires_live_data=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "battery_piece_number"),
    ),
    StarkSolarPowerSensorDescription(
        key="battery_group_number",
        translation_key="battery_group_number",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        requires_live_data=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "battery_group_number"),
    ),
    StarkSolarPowerSensorDescription(
        key="protocol_id",
        translation_key="protocol_id",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        requires_live_data=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "protocol_id"),
    ),
    StarkSolarPowerSensorDescription(
        key="dctodc_status",
        translation_key="dctodc_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "dctodc"),
    ),
    StarkSolarPowerSensorDescription(
        key="pfc_status",
        translation_key="pfc_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "pfc"),
    ),
    StarkSolarPowerSensorDescription(
        key="inverter_status",
        translation_key="inverter_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "inverter"),
    ),
    StarkSolarPowerSensorDescription(
        key="input_relay_status",
        translation_key="input_relay_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "input_relay"),
    ),
    StarkSolarPowerSensorDescription(
        key="output_relay_status",
        translation_key="output_relay_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: _extended_value(snapshot, "o_p_relay"),
    ),
    StarkSolarPowerSensorDescription(
        key="data_timestamp",
        translation_key="data_timestamp",
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda snapshot: snapshot.cloud_timestamp,
        requires_live_data=False,
    ),
    StarkSolarPowerSensorDescription(
        key="data_age",
        translation_key="data_age",
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        suggested_unit_of_measurement=UnitOfTime.MINUTES,
        suggested_display_precision=1,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=data_age_seconds,
        requires_live_data=False,
    ),
    StarkSolarPowerSensorDescription(
        key="last_successful_update",
        translation_key="last_successful_update",
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: snapshot.fetched_at,
        requires_live_data=False,
    ),
    StarkSolarPowerSensorDescription(
        key="firmware",
        translation_key="firmware",
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
        value_fn=lambda snapshot: snapshot.values.get("sy_firmware_version"),
        requires_live_data=False,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Stark SolarPower sensors."""
    coordinator: StarkSolarPowerCoordinator = entry.runtime_data
    async_add_entities(
        StarkSolarPowerSensor(coordinator, device, description)
        for device in coordinator.devices.values()
        for description in SENSORS
    )


class StarkSolarPowerSensor(StarkSolarPowerEntity, SensorEntity):
    """One read-only SolarPower sensor."""

    entity_description: StarkSolarPowerSensorDescription

    def __init__(
        self,
        coordinator: StarkSolarPowerCoordinator,
        device,
        description: StarkSolarPowerSensorDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, device, description.key)
        self.entity_description = description
        if description.device_class == SensorDeviceClass.ENUM:
            self._attr_options = MODE_OPTIONS

    @property
    def available(self) -> bool:
        """Keep stored diagnostics visible when the latest poll fails."""
        snapshot = self.snapshot
        if snapshot is None or not self.coordinator.last_update_success:
            return False
        if self.entity_description.value_fn(snapshot) is None:
            return False
        if self.entity_description.requires_live_data:
            return snapshot.available and not is_data_stale(snapshot)
        return True

    @property
    def native_value(self) -> Any:
        """Return the current native value."""
        snapshot = self.snapshot
        if snapshot is None:
            return None
        return self.entity_description.value_fn(snapshot)
