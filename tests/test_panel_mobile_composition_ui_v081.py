from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelMobileCompositionUiV081Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v081.js").read_text(
            encoding="utf-8"
        )
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )
        cls.bundle_builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_v081_composition_source_remains_in_bundle(self) -> None:
        self.assertIn('"stark-solarpower-panel-v081.js"', self.bundle_builder)

    def test_scene_is_compact_without_resizing_the_ups_artwork(self) -> None:
        self.assertIn("height:336px !important", self.source)
        self.assertNotIn(".ups-art-v051", self.source)
        self.assertEqual(
            self.manifest["layout"]["overview_mobile_hero_scene_px"], 336
        )

    def test_capacity_plaque_is_raised_and_side_metrics_keep_alignment(self) -> None:
        self.assertIn("top:38px !important", self.source)
        self.assertIn("top:54% !important", self.source)

    def test_battery_card_clears_fixed_navigation(self) -> None:
        self.assertIn("padding-bottom:16px", self.source)
        self.assertIn("min-height:44px !important", self.source)
        self.assertIn("min-height:15px", self.source)
        self.assertEqual(
            self.manifest["layout"]["overview_mobile_bottom_clearance_px"], 16
        )
        self.assertTrue(
            self.manifest["layout"]["content_clears_bottom_navigation"]
        )

    def test_battery_count_label_is_one_line(self) -> None:
        self.assertIn('"АКБ, шт."', self.source)
        self.assertIn("white-space:nowrap", self.source)

    def test_composition_layer_keeps_stable_dom_contract(self) -> None:
        self.assertIn("previousOverview.call(this)", self.source)
        self.assertIn("data-stark-overview-v081", self.source)
        self.assertNotIn("shadowRoot.innerHTML", self.source)


if __name__ == "__main__":
    unittest.main()
