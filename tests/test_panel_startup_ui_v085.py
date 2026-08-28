from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelStartupUiV085Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v085.js").read_text(
            encoding="utf-8"
        )
        cls.overview = (FRONTEND / "stark-solarpower-panel-v066.js").read_text(
            encoding="utf-8"
        )
        cls.registration = (INTEGRATION / "panel.py").read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_all_visible_startup_assets_are_prewarmed(self) -> None:
        self.assertIn("stark-country-1000-online.png?v=0.6.6", self.source)
        self.assertIn("stark-hero-internet-v063.webp?v=0.6.3", self.source)
        self.assertIn("stark-hero-boiler-v063.webp?v=0.6.3", self.source)
        self.assertIn("prewarmStartupAssetsV085();", self.source)
        self.assertIn("Promise.allSettled", self.source)
        self.assertIn("image.decode()", self.source)

    def test_final_artwork_requests_complete_first_paint(self) -> None:
        self.assertIn('loading="eager"', self.overview)
        self.assertIn('decoding="sync"', self.overview)
        self.assertIn('fetchpriority="high"', self.overview)

    def test_delivery_cache_and_bundle_are_current(self) -> None:
        self.assertIn("cache_headers=True", self.registration)
        self.assertIn('PANEL_UI_VERSION = "0.9.1"', self.registration)
        self.assertIn('FRONTEND / "stark-solarpower-panel-v085.js"', self.builder)
        self.assertEqual(
            self.manifest["frontend_delivery"]["startup_assets"],
            "preloaded_and_decoded_parallel_to_registry",
        )

    def test_optimization_does_not_replace_stable_dom(self) -> None:
        self.assertNotIn("shadowRoot.innerHTML", self.source)
        self.assertNotIn("replaceChildren", self.source)


if __name__ == "__main__":
    unittest.main()
