from __future__ import annotations

from pathlib import Path
import json
import unittest


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"
SOURCE = FRONTEND / "stark-solarpower-panel-v098.js"


class PanelOverviewHeaderUiV098Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8") if SOURCE.exists() else ""
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(encoding="utf-8")
        cls.adoption = json.loads((ROOT / ".nikas-ui-standard.json").read_text(encoding="utf-8"))
        cls.integration_manifest = json.loads(
            (ROOT / "custom_components" / "stark_solarpower" / "manifest.json").read_text(encoding="utf-8")
        )
        cls.panel_manifest = json.loads(
            (ROOT / "custom_components" / "stark_solarpower" / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_photo_is_a_lower_inset_scene_below_the_status_header(self) -> None:
        self.assertIn("Stark UI 0.9.9", self.source)
        self.assertIn("background-image:none!important", self.source)
        self.assertIn("background-image:linear-gradient", self.source)
        self.assertIn("var(--hero-background-v051)", self.source)
        self.assertIn("border-radius:20px!important", self.source)
        self.assertIn("height:300px!important", self.source)
        self.assertIn("z-index:2!important", self.source)
        self.assertIn("section.startup-overview-v086 .hero-scene-v051", self.source)

    def test_blue_corner_matches_the_locked_keenetic_decoration(self) -> None:
        self.assertIn("width:205px!important", self.source)
        self.assertIn("height:205px!important", self.source)
        self.assertIn("top:-92px!important", self.source)
        self.assertIn("right:-70px!important", self.source)
        self.assertIn("background:color-mix(in srgb,var(--primary-color,#03a9d9) 12%,var(--card-background-color,#fff))!important", self.source)

    def test_composition_keeps_the_stable_dom_contract(self) -> None:
        self.assertNotIn("innerHTML", self.source)
        self.assertNotIn("replaceChildren", self.source)
        self.assertIn("previousRender.call(this)", self.source)

    def test_delivery_versions_and_bundle_source_are_coherent(self) -> None:
        self.assertIn('FRONTEND / "stark-solarpower-panel-v098.js"', self.builder)
        self.assertIn(
            "custom_components/stark_solarpower/frontend/stark-solarpower-panel-v098.js",
            self.adoption["build_source_files"],
        )
        self.assertEqual(self.adoption["ui_version"], "0.9.9")
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.9")
        self.assertEqual(self.integration_manifest["version"], "1.9.11-b1")


if __name__ == "__main__":
    unittest.main()
