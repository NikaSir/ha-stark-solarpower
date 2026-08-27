from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"


class PanelRuntimeUiV083Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v083.js").read_text(
            encoding="utf-8"
        )
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_vendor_runtime_is_interpreted_as_minutes(self) -> None:
        self.assertIn('data-runtime-source="vendor-raw-minutes"', self.source)
        self.assertIn("Math.floor(totalMinutes / 60)", self.source)
        self.assertIn("const minutes = totalMinutes % 60", self.source)

    def test_overview_uses_human_readable_runtime(self) -> None:
        self.assertIn("<span>Автономия</span>", self.source)
        self.assertIn('return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;', self.source)
        self.assertNotIn("Остаток RAW", self.source)

    def test_raw_entity_remains_the_source(self) -> None:
        self.assertIn('key !== "battery_remain_time"', self.source)
        self.assertIn("this._numeric(device, key)", self.source)

    def test_v083_is_in_production_bundle_sources(self) -> None:
        self.assertIn('FRONTEND / "stark-solarpower-panel-v083.js"', self.builder)


if __name__ == "__main__":
    unittest.main()
