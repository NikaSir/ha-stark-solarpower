from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
SOURCE = INTEGRATION / "frontend" / "stark-solarpower-panel-v065.js"


class PanelUiStandardV15Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_native_scroll_at_100_and_bounded_pan_above(self) -> None:
        self.assertIn("state.scale <= 1", self.source)
        self.assertIn("overflow-x:hidden!important", self.source)
        self.assertIn("overflow-y:auto!important", self.source)
        self.assertIn("touch-action:pan-y!important", self.source)
        self.assertIn("if (b.overflowX) state.x", self.source)
        self.assertIn("if (b.overflowY) state.y", self.source)

    def test_gesture_contract(self) -> None:
        self.assertIn("const MIN_SCALE = 0.75", self.source)
        self.assertIn("const MAX_SCALE = 2", self.source)
        self.assertIn("const SNAP_MIN = 0.97", self.source)
        self.assertIn("const SNAP_MAX = 1.03", self.source)
        self.assertIn('toast.textContent = "Масштаб 100%"', self.source)
        self.assertIn('new PointerEvent("pointercancel"', self.source)
        self.assertIn("event.stopImmediatePropagation()", self.source)

    def test_shell_geometry(self) -> None:
        self.assertIn("grid-template-columns:52px minmax(0,1fr) 52px", self.source)
        self.assertIn("grid-template-columns:48px minmax(0,1fr) 48px", self.source)
        self.assertIn("border-radius:16px", self.source)
        self.assertIn("--mdc-icon-size:25px", self.source)
        self.assertIn("--mdc-icon-size:28px", self.source)
        self.assertIn("min-height:52px", self.source)

    def test_manifest_matches_runtime(self) -> None:
        self.assertEqual(self.manifest["ui_version"], "0.6.5")
        zoom = self.manifest["zoom"]
        self.assertEqual(
            zoom["engine"], "native_vertical_at_100_transform_pan_above_100"
        )
        self.assertTrue(zoom["native_vertical_scroll_at_100_percent"])
        self.assertFalse(zoom["horizontal_scroll_at_100_percent"])
        self.assertTrue(zoom["pan_only_above_100_percent"])


if __name__ == "__main__":
    unittest.main()
