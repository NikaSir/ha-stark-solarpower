from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import importlib
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
import unittest


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_DIR = ROOT / "custom_components" / "stark_solarpower"


def _module(name: str) -> ModuleType:
    module = ModuleType(name)
    module.__path__ = []  # type: ignore[attr-defined]
    sys.modules[name] = module
    return module


def _install_import_stubs() -> None:
    """Provide the small HA surface needed to execute the real platforms."""
    custom_components = _module("custom_components")
    package = _module("custom_components.stark_solarpower")
    custom_components.stark_solarpower = package
    package.__path__ = [str(PACKAGE_DIR)]

    homeassistant = _module("homeassistant")
    components = _module("homeassistant.components")
    homeassistant.components = components

    binary_sensor = _module("homeassistant.components.binary_sensor")
    components.binary_sensor = binary_sensor

    @dataclass(frozen=True, kw_only=True)
    class BinarySensorEntityDescription:
        key: str
        translation_key: str | None = None
        device_class: object | None = None

    class BinarySensorDeviceClass:
        CONNECTIVITY = "connectivity"
        PROBLEM = "problem"

    binary_sensor.BinarySensorDeviceClass = BinarySensorDeviceClass
    binary_sensor.BinarySensorEntity = type("BinarySensorEntity", (), {})
    binary_sensor.BinarySensorEntityDescription = BinarySensorEntityDescription

    event = _module("homeassistant.components.event")
    components.event = event

    @dataclass(frozen=True, kw_only=True)
    class EventEntityDescription:
        key: str
        translation_key: str | None = None
        event_types: list[str] | None = None
        entity_category: object | None = None
        entity_registry_enabled_default: bool = True

    class EventEntity:
        def _trigger_event(self, event_type: str) -> None:
            self._events.append(event_type)

    event.EventEntity = EventEntity
    event.EventEntityDescription = EventEntityDescription

    config_entries = _module("homeassistant.config_entries")
    config_entries.ConfigEntry = type("ConfigEntry", (), {})

    core = _module("homeassistant.core")
    core.HomeAssistant = type("HomeAssistant", (), {})
    core.callback = lambda func: func

    const = _module("homeassistant.const")
    const.EntityCategory = type("EntityCategory", (), {"DIAGNOSTIC": "diagnostic"})

    helpers = _module("homeassistant.helpers")
    entity_platform = _module("homeassistant.helpers.entity_platform")
    helpers.entity_platform = entity_platform
    entity_platform.AddEntitiesCallback = object

    api = ModuleType("custom_components.stark_solarpower.api")

    @dataclass(frozen=True)
    class StarkDeviceSnapshot:
        values: dict[str, object]
        available: bool = True
        stale: bool = False
        fetched_at: datetime = datetime.now(tz=UTC)

    api.StarkDeviceSnapshot = StarkDeviceSnapshot
    sys.modules[api.__name__] = api

    coordinator = ModuleType("custom_components.stark_solarpower.coordinator")
    coordinator.StarkSolarPowerCoordinator = type(
        "StarkSolarPowerCoordinator", (), {}
    )
    sys.modules[coordinator.__name__] = coordinator

    entity_module = ModuleType("custom_components.stark_solarpower.entity")

    class StarkSolarPowerEntity:
        def __init__(self, coordinator, device, entity_key: str) -> None:
            self.coordinator = coordinator
            self.device = device
            self.entity_key = entity_key
            self._events: list[str] = []
            self.write_count = 0

        @property
        def snapshot(self):
            return (self.coordinator.data or {}).get(self.device.pn)

        async def async_added_to_hass(self) -> None:
            return None

        def async_write_ha_state(self) -> None:
            self.write_count += 1

    entity_module.StarkSolarPowerEntity = StarkSolarPowerEntity
    sys.modules[entity_module.__name__] = entity_module

    helper_module = ModuleType("custom_components.stark_solarpower.helpers")
    helper_module.is_data_stale = lambda snapshot: snapshot.stale
    sys.modules[helper_module.__name__] = helper_module


_install_import_stubs()
constants = importlib.import_module("custom_components.stark_solarpower.const")
mode = importlib.import_module("custom_components.stark_solarpower.mode")
binary_platform = importlib.import_module(
    "custom_components.stark_solarpower.binary_sensor"
)
event_platform = importlib.import_module("custom_components.stark_solarpower.event")
Snapshot = sys.modules[
    "custom_components.stark_solarpower.api"
].StarkDeviceSnapshot


def _description(platform, key: str):
    return next(item for item in platform if item.key == key)


class PowerModeTruthTests(unittest.TestCase):
    def test_known_modes_remain_boolean_facts(self) -> None:
        matrix = {
            "Battery Mode": (True, False),
            "Line Mode": (False, False),
            "Standby Mode": (False, False),
            "Bypass Mode": (False, False),
            "Fault Mode": (False, True),
            "Shutdown Mode": (False, False),
        }
        for raw, expected in matrix.items():
            with self.subTest(raw=raw):
                self.assertEqual(
                    (
                        mode.mode_is(raw, constants.MODE_BATTERY),
                        mode.mode_is(raw, constants.MODE_FAULT),
                    ),
                    expected,
                )

    def test_missing_null_and_unknown_modes_remain_unknown(self) -> None:
        for raw in (None, "", "   ", "Unknown", "Eco Mode", 0, False):
            with self.subTest(raw=raw):
                self.assertIsNone(mode.mode_is(raw, constants.MODE_BATTERY))
                self.assertIsNone(mode.mode_is(raw, constants.MODE_FAULT))

    def test_on_battery_sensor_is_unavailable_when_mode_is_unknown(self) -> None:
        description = _description(binary_platform.BINARY_SENSORS, "on_battery")
        device = SimpleNamespace(pn="UPS-1")
        coordinator = SimpleNamespace(data={}, last_update_success=True)
        entity = binary_platform.StarkSolarPowerBinarySensor(
            coordinator, device, description
        )

        for values in ({}, {"bt_model": None}, {"bt_model": "Eco Mode"}):
            with self.subTest(values=values):
                coordinator.data = {device.pn: Snapshot(values)}
                self.assertIsNone(entity.is_on)
                self.assertFalse(entity.available)

        coordinator.data = {
            device.pn: Snapshot({"bt_model": "Line Mode"})
        }
        self.assertIs(entity.is_on, False)
        self.assertTrue(entity.available)

        coordinator.data = {
            device.pn: Snapshot({"bt_model": "Battery Mode"})
        }
        self.assertIs(entity.is_on, True)
        self.assertTrue(entity.available)

    def test_partial_snapshot_does_not_reuse_or_negate_previous_mode(self) -> None:
        description = _description(binary_platform.BINARY_SENSORS, "on_battery")
        device = SimpleNamespace(pn="UPS-1")
        coordinator = SimpleNamespace(
            data={device.pn: Snapshot({"bt_model": "Battery Mode"})},
            last_update_success=True,
        )
        entity = binary_platform.StarkSolarPowerBinarySensor(
            coordinator, device, description
        )
        self.assertIs(entity.is_on, True)

        coordinator.data = {device.pn: Snapshot({"bt_output_load_percent": 18})}
        self.assertIsNone(entity.is_on)
        self.assertFalse(entity.available)

    def test_unknown_mode_never_emits_battery_exit_or_fault_clear(self) -> None:
        device = SimpleNamespace(pn="UPS-1")
        for key, active_mode, inactive_event in (
            ("battery_mode_events", "Battery Mode", "battery_mode_exited"),
            ("fault_mode_events", "Fault Mode", "fault_mode_cleared"),
        ):
            with self.subTest(key=key):
                description = _description(event_platform.EVENTS, key)
                coordinator = SimpleNamespace(
                    data={device.pn: Snapshot({"bt_model": active_mode})},
                    extended_errors={},
                    extended_values={},
                )
                entity = event_platform.StarkSolarPowerEvent(
                    coordinator, device, description
                )
                entity._suppress_next_coordinator_edge = False
                entity._last_transition_state = True

                coordinator.data = {device.pn: Snapshot({})}
                entity._handle_coordinator_update()
                self.assertEqual(entity._events, [])
                self.assertIsNone(entity._last_transition_state)

                coordinator.data = {
                    device.pn: Snapshot({"bt_model": "Line Mode"})
                }
                entity._handle_coordinator_update()
                self.assertNotIn(inactive_event, entity._events)


if __name__ == "__main__":
    unittest.main()
