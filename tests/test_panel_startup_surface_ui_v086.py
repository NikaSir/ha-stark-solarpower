from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelStartupSurfaceUiV086Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v086.js").read_text(
            encoding="utf-8"
        )
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_neutral_overview_replaces_loading_empty_state(self) -> None:
        self.assertIn("startupOverviewV086", self.source)
        self.assertIn("empty.replaceWith(template.content)", self.source)
        self.assertIn("Получение данных", self.source)
        self.assertIn("Проверка состояния АКБ", self.source)
        self.assertNotIn("Загрузка UPS", self.source)

    def test_startup_scene_contains_real_visual_assets(self) -> None:
        self.assertIn("stark-hero-internet-v063.webp?v=0.6.3", self.source)
        self.assertIn("stark-country-1000-online.png?v=0.6.6", self.source)
        self.assertIn('decoding="sync"', self.source)
        self.assertIn('fetchpriority="high"', self.source)

    def test_startup_scene_is_factual_until_registry_arrives(self) -> None:
        self.assertIn("aria-busy=\"true\"", self.source)
        self.assertIn("<strong>—</strong>", self.source)
        self.assertIn("if (this._registryLoaded || this._registryError) return", self.source)

    def test_final_layer_preserves_permanent_runtime_shell(self) -> None:
        self.assertNotIn("shadowRoot.innerHTML", self.source)
        self.assertEqual(self.manifest["ui_version"], "0.9.4")
        self.assertEqual(
            self.manifest["frontend_delivery"]["startup_surface"],
            "immediate_neutral_overview_before_registry",
        )
        self.assertIn('FRONTEND / "stark-solarpower-panel-v086.js"', self.builder)


if __name__ == "__main__":
    unittest.main()
