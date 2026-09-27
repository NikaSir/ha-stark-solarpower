"""Behavioral tests for UPS cloud polling during an outage."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime
import importlib
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "custom_components" / "stark_solarpower"


def _module(name: str) -> ModuleType:
    module = ModuleType(name)
    module.__path__ = []  # type: ignore[attr-defined]
    sys.modules[name] = module
    return module


def _load_coordinator():
    package = _module("custom_components.stark_solarpower")
    package.__path__ = [str(PACKAGE)]
    _module("homeassistant")
    entries = _module("homeassistant.config_entries")
    entries.ConfigEntry = type("ConfigEntry", (), {})
    core = _module("homeassistant.core")
    core.HomeAssistant = type("HomeAssistant", (), {})
    exceptions = _module("homeassistant.exceptions")
    exceptions.ConfigEntryAuthFailed = type("ConfigEntryAuthFailed", (Exception,), {})
    _module("homeassistant.helpers")
    update = _module("homeassistant.helpers.update_coordinator")

    class DataUpdateCoordinator:
        def __class_getitem__(cls, item):
            return cls

        def __init__(self, hass, logger, **kwargs):
            self.data = None
            self.update_interval = kwargs["update_interval"]

        async def async_request_refresh(self):
            self.data = await self._async_update_data()

    update.DataUpdateCoordinator = DataUpdateCoordinator
    update.UpdateFailed = type("UpdateFailed", (Exception,), {})

    api = ModuleType("custom_components.stark_solarpower.api")
    api.SolarPowerAuthError = type("SolarPowerAuthError", (Exception,), {})
    api.SolarPowerError = type("SolarPowerError", (Exception,), {})

    @dataclass(frozen=True)
    class StarkDeviceInfo:
        pn: str
        name: str

    @dataclass(frozen=True)
    class StarkDeviceSnapshot:
        device: StarkDeviceInfo
        values: dict
        cloud_timestamp: datetime | None
        fetched_at: datetime
        available: bool = True
        error: str | None = None

    api.StarkDeviceInfo = StarkDeviceInfo
    api.StarkDeviceSnapshot = StarkDeviceSnapshot
    api.StarkSolarPowerApi = type("StarkSolarPowerApi", (), {})
    sys.modules[api.__name__] = api
    extended = ModuleType("custom_components.stark_solarpower.extended")

    async def async_get_extended_values(api, device):
        api.extended_calls += 1
        return {}

    extended.async_get_extended_values = async_get_extended_values
    sys.modules[extended.__name__] = extended
    sys.modules.pop("custom_components.stark_solarpower.coordinator", None)
    coordinator = importlib.import_module("custom_components.stark_solarpower.coordinator")
    return coordinator, StarkDeviceInfo, StarkDeviceSnapshot


COORDINATOR, Device, Snapshot = _load_coordinator()


class ScriptedCloud:
    def __init__(self, device, results):
        self.device = device
        self.results = iter(results)
        self.calls = 0
        self.extended_calls = 0

    async def async_get_snapshot(self, device):
        self.calls += 1
        result = next(self.results)
        if isinstance(result, Exception):
            raise result
        return result


def snapshot(device, mode="Line Mode"):
    return Snapshot(device, {"bt_model": mode}, datetime.now(UTC), datetime.now(UTC))


class CloudPollingBackoffTests(unittest.TestCase):
    def test_recovery_refreshes_old_extended_values_before_reusing_them(self):
        device = Device("UPS-1", "UPS Интернет")
        api = ScriptedCloud(device, [OSError("cloud down"), snapshot(device)])
        coordinator = COORDINATOR.StarkSolarPowerCoordinator(None, None, api)
        coordinator.devices = {device.pn: device}
        coordinator.data = {device.pn: snapshot(device)}
        coordinator._force_extended_refresh = False
        coordinator._last_extended_refresh = 100.0
        coordinator.extended_values[device.pn] = {"positive_bus_voltage": 300}
        coordinator.extended_errors[device.pn] = None
        clock = [160.0]

        async def run():
            with patch.object(COORDINATOR.time, "monotonic", side_effect=lambda: clock[0]):
                with self.assertLogs(COORDINATOR._LOGGER, level="INFO"):
                    coordinator.data = await coordinator._async_update_data()
                    clock[0] = 220.0
                    coordinator.data = await coordinator._async_update_data()
                self.assertEqual(api.extended_calls, 1)
                self.assertNotIn(
                    "ext_positive_bus_voltage", coordinator.data[device.pn].values
                )

        asyncio.run(run())

    def test_repeated_failure_backs_off_without_repeated_warnings_and_recovers(self):
        device = Device("UPS-1", "UPS Интернет")
        api = ScriptedCloud(device, [OSError("cloud down")] * 3 + [snapshot(device)] * 2)
        coordinator = COORDINATOR.StarkSolarPowerCoordinator(None, None, api)
        coordinator.devices = {device.pn: device}
        coordinator.data = {device.pn: snapshot(device)}
        clock = [100.0]

        async def run():
            with patch.object(COORDINATOR.time, "monotonic", side_effect=lambda: clock[0]):
                with self.assertLogs(COORDINATOR._LOGGER, level="INFO") as logged:
                    for moment, expected_calls in (
                        (100, 1), (160, 2), (220, 2),
                        (280, 3), (340, 3), (520, 4), (580, 5),
                    ):
                        clock[0] = moment
                        coordinator.data = await coordinator._async_update_data()
                        self.assertEqual(api.calls, expected_calls, f"at t={moment}")
                        self.assertEqual(
                            coordinator.data[device.pn].available,
                            moment >= 520,
                        )
                    warnings = [r for r in logged.records if r.levelname == "WARNING"]
                    self.assertEqual(len(warnings), 1)
                    self.assertIn("UPS Интернет", warnings[0].getMessage())
                    self.assertTrue(any("restored" in r.getMessage().lower() for r in logged.records))
                self.assertEqual(api.extended_calls, 1)  # Only when primary data recovers.

        asyncio.run(run())

    def test_battery_mode_keeps_one_minute_attempts_during_outage(self):
        device = Device("UPS-1", "UPS Котёл")
        api = ScriptedCloud(device, [OSError("cloud down")] * 3)
        coordinator = COORDINATOR.StarkSolarPowerCoordinator(None, None, api)
        coordinator.devices = {device.pn: device}
        coordinator.data = {device.pn: snapshot(device, "Battery Mode")}
        clock = [100.0]

        async def run():
            with patch.object(COORDINATOR.time, "monotonic", side_effect=lambda: clock[0]):
                with self.assertLogs(COORDINATOR._LOGGER, level="WARNING") as logged:
                    for moment in (100, 160, 220):
                        clock[0] = moment
                        coordinator.data = await coordinator._async_update_data()
                    self.assertEqual(api.calls, 3)
                    self.assertEqual(len(logged.records), 1)

        asyncio.run(run())

    def test_manual_refresh_bypasses_backoff_and_restores_data(self):
        device = Device("UPS-1", "UPS Интернет")
        api = ScriptedCloud(device, [OSError("cloud down"), snapshot(device)])
        coordinator = COORDINATOR.StarkSolarPowerCoordinator(None, None, api)
        coordinator.devices = {device.pn: device}
        coordinator.data = {device.pn: snapshot(device)}
        clock = [100.0]

        async def run():
            with patch.object(COORDINATOR.time, "monotonic", side_effect=lambda: clock[0]):
                with self.assertLogs(COORDINATOR._LOGGER, level="INFO"):
                    coordinator.data = await coordinator._async_update_data()
                    clock[0] = 120.0
                    self.assertTrue(await coordinator.async_manual_refresh())
                    self.assertTrue(coordinator.data[device.pn].available)
                    self.assertEqual(api.calls, 2)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
