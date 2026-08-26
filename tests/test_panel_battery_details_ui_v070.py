from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"
SENSOR = ROOT / "custom_components" / "stark_solarpower" / "sensor.py"


class PanelBatteryDetailsUiV070Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v070.js").read_text(
            encoding="utf-8"
        )
        cls.navigation = (FRONTEND / "stark-solarpower-panel-v051.js").read_text(
            encoding="utf-8"
        )
        cls.sensor = SENSOR.read_text(encoding="utf-8")

    def test_battery_plaque_is_lowered_inside_scene(self) -> None:
        self.assertIn(".scene-node-v051.battery", self.source)
        self.assertIn("top:72px !important", self.source)
        self.assertIn("bottom:auto !important", self.source)

    def test_battery_card_uses_confirmed_entities(self) -> None:
        for key in (
            "battery_voltage",
            "battery_piece_number",
            "charger_temperature",
            "battery_remain_time",
        ):
            self.assertIn(f'"{key}"', self.source)
        self.assertNotIn("charge_current", self.source)

    def test_events_precede_history_in_navigation(self) -> None:
        events = self.navigation.index('["events", "mdi:bell", "События"]')
        history = self.navigation.index('["history", "mdi:chart-line", "История"]')
        self.assertLess(events, history)

    def test_required_extended_entities_are_enabled_by_default(self) -> None:
        for key in ("battery_piece_number", "battery_remain_time"):
            description = self.sensor.split(f'key="{key}"', 1)[1].split(
                "StarkSolarPowerSensorDescription(", 1
            )[0]
            self.assertIn("entity_registry_enabled_default=True", description)


if __name__ == "__main__":
    unittest.main()
