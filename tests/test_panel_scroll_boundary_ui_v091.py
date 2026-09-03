from __future__ import annotations

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelScrollBoundaryUiV091Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v091.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")
        cls.registration = (INTEGRATION / "panel.py").read_text(encoding="utf-8")
        cls.integration_manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
        cls.panel_manifest = json.loads((INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8"))

    def test_guard_matches_confirmed_shell_v21_behavior(self) -> None:
        self.assertIn("shouldBlockNikasShellBoundaryMove", self.source)
        self.assertIn("createNikasShellScrollBoundaryGuard", self.source)
        self.assertIn("NIKAS_SHELL_BOUNDARY_THRESHOLD_PX = 4", self.source)
        self.assertIn("if (!inViewport) return true", self.source)
        self.assertIn("if (maximumScroll <= 1) return true", self.source)
        self.assertIn("currentScroll <= 1", self.source)
        self.assertIn("currentScroll >= maximumScroll - 1", self.source)

    def test_capture_listener_blocks_host_before_home_assistant(self) -> None:
        self.assertIn('host.addEventListener("touchstart"', self.source)
        self.assertIn('host.addEventListener("touchmove"', self.source)
        self.assertIn("passive: false, capture: true", self.source)
        self.assertIn("event.cancelable", self.source)
        self.assertIn("event.preventDefault()", self.source)
        self.assertIn("event.touches.length !== 1", self.source)

    def test_cleanup_is_bound_to_panel_disconnect(self) -> None:
        self.assertIn("Panel.prototype.disconnectedCallback", self.source)
        self.assertIn("__starkScrollGuardCleanupV091?.()", self.source)
        self.assertIn('host.removeEventListener("touchmove", moveTouch, true)', self.source)

    def test_delivery_versions_and_standard_are_coherent(self) -> None:
        self.assertEqual(self.integration_manifest["version"], "1.9.5")
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.5")
        self.assertEqual(self.panel_manifest["shell"]["standard_version"], "2.1")
        self.assertEqual(self.panel_manifest["nikas_ui_standard"], "2.1")
        self.assertIn('PANEL_UI_VERSION = "0.9.5"', self.registration)
        self.assertIn("BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v091.js", self.bundle)


if __name__ == "__main__":
    unittest.main()
