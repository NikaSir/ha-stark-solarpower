import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"


class DeviceStatusLampsUiV092Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (FRONTEND / "stark-solarpower-panel-v092.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")
        cls.integration_manifest = json.loads(
            (ROOT / "custom_components" / "stark_solarpower" / "manifest.json").read_text(encoding="utf-8")
        )
        cls.panel_manifest = json.loads(
            (ROOT / "custom_components" / "stark_solarpower" / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_selector_lamps_are_visible_and_keep_all_status_tones(self):
        self.assertIn(".global-device-context .device-health-dot", self.source)
        self.assertIn("display:block!important", self.source)
        for tone in ("good", "warn", "bad"):
            self.assertIn(f".device-health-dot.{tone}", self.source)
        self.assertIn("--disabled-text-color", self.source)

    def test_status_updates_patch_existing_selector_nodes(self):
        self.assertIn("previousSyncControls?.call(this)", self.source)
        self.assertIn('querySelectorAll("[data-ups-device]")', self.source)
        self.assertIn('button.setAttribute("aria-label", label)', self.source)
        self.assertNotIn("innerHTML", self.source)
        self.assertNotIn("replaceChildren", self.source)

    def test_delivery_versions_and_bundle_are_current(self):
        self.assertEqual(self.integration_manifest["version"], "1.9.4")
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.4")
        self.assertIn("BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v092.js", self.bundle)


if __name__ == "__main__":
    unittest.main()
