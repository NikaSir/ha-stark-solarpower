from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelFieldAuditUiV084Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v084.js").read_text(
            encoding="utf-8"
        )
        cls.coordinator = (INTEGRATION / "coordinator.py").read_text(
            encoding="utf-8"
        )
        cls.registration = (INTEGRATION / "panel.py").read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "manifest.json").read_text(encoding="utf-8")
        )
        cls.panel_manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_delivery_versions_agree(self) -> None:
        self.assertEqual(self.manifest["version"], "1.9.0")
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.1")
        self.assertIn('PANEL_UI_VERSION = "0.9.1"', self.registration)
        self.assertIn('FRONTEND / "stark-solarpower-panel-v084.js"', self.builder)

    def test_partial_reserve_is_not_reported_ready(self) -> None:
        self.assertIn('mode === "line_mode" && battery < 95', self.source)
        self.assertIn("Резерв неполный · АКБ", self.source)
        self.assertIn('tone: "warn"', self.source)
        self.assertIn('mode !== "line_mode"', self.source)
        self.assertIn("Готовность резерва не подтверждена", self.source)

    def test_battery_mode_refreshes_detailed_runtime_each_primary_pass(self) -> None:
        self.assertIn("_snapshot_reports_battery_mode", self.coordinator)
        self.assertIn('result.values.get("bt_model")', self.coordinator)
        self.assertIn('mode == "battery mode"', self.coordinator)
        current_fetch = self.coordinator.index("current_results = await asyncio.gather")
        battery_decision = self.coordinator.index(
            "refresh_extended = self._extended_refresh_due() or any"
        )
        extended_fetch = self.coordinator.index(
            "async_get_extended_values(self.api, device) for device in devices"
        )
        self.assertLess(current_fetch, battery_decision)
        self.assertLess(battery_decision, extended_fetch)
        self.assertEqual(
            self.panel_manifest["overview"]["battery_runtime"][
                "battery_mode_polling_seconds"
            ],
            60,
        )

    def test_v084_does_not_remount_panel_structure(self) -> None:
        self.assertNotIn("shadowRoot.innerHTML", self.source)
        self.assertNotIn("replaceChildren", self.source)


if __name__ == "__main__":
    unittest.main()
