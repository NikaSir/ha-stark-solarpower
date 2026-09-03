import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"


class PeerDeviceSelectorUiV095Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (FRONTEND / "stark-solarpower-panel-v095.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")
        cls.panel_manifest = json.loads(
            (ROOT / "custom_components" / "stark_solarpower" / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_selector_uses_starline_geometry(self):
        for marker in (
            "height:52px!important",
            "height:44px!important",
            "gap:8px!important",
            "padding:0 14px!important",
            "border-radius:15px!important",
            "justify-content:flex-start!important",
        ):
            self.assertIn(marker, self.source)

    def test_selection_surface_is_independent_from_status_lamp(self):
        self.assertIn(".global-device-context button.active", self.source)
        self.assertIn("var(--primary-color,#03a9d9) 10%", self.source)
        self.assertIn("var(--primary-color,#03a9d9) 65%", self.source)
        self.assertNotIn("device-health-dot.good", self.source)
        self.assertNotIn("device-health-dot.warn", self.source)
        self.assertNotIn("device-health-dot.bad", self.source)

    def test_manifest_and_bundle_publish_v095(self):
        context = self.panel_manifest["device_context"]
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.5")
        self.assertEqual(context["visual_reference"], "StarLine UI 0.6.8")
        self.assertEqual(context["row_height_px"], 52)
        self.assertEqual(context["touch_target_px"], 44)
        self.assertEqual(context["status_lamp"]["diameter_px"], 9)
        self.assertIn("BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v095.js", self.bundle)


if __name__ == "__main__":
    unittest.main()
