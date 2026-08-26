from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelUiStandardV16UiV071Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v071.js").read_text(
            encoding="utf-8"
        )
        cls.canvas = (FRONTEND / "stark-solarpower-panel-v065.js").read_text(
            encoding="utf-8"
        )
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(
            encoding="utf-8"
        )
        cls.panel = (INTEGRATION / "panel.py").read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_shell_is_stationary_and_work_views_are_cached(self) -> None:
        self.assertIn("height:100dvh !important", self.source)
        self.assertIn("overflow:hidden !important", self.source)
        self.assertIn("flex:1 1 auto !important", self.source)
        self.assertIn("position:fixed !important", self.source)
        self.assertIn("position:absolute !important", self.source)
        self.assertIn("this.__starkViewCacheV071 ||= new Map()", self.source)
        self.assertIn("surface.append(cached)", self.source)
        self.assertNotIn("surface.replaceChildren", self.source)
        self.assertNotIn("shadowRoot.innerHTML", self.source)

    def test_header_and_bottom_navigation_match_reference_geometry(self) -> None:
        for token in (
            "font-size:23px !important",
            "font-size:14px !important",
            "font-size:21px !important",
            "font-size:13px !important",
            "width:44px !important",
            "border-radius:16px !important",
            "--mdc-icon-size:25px !important",
        ):
            self.assertIn(token, self.source)
        for token in (
            "--mdc-icon-size:28px!important",
            "font-size:12px!important",
            "font-weight:700!important",
        ):
            self.assertIn(token, self.canvas)

    def test_requested_indicator_uses_lider_tint_and_font_roles(self) -> None:
        for percentage in ("30%", "11%", "10%", "8%"):
            self.assertIn(percentage, self.source)
        self.assertIn("font-size:16px !important", self.source)
        self.assertIn("font-size:13px !important", self.source)
        indicator = self.manifest["overview"]["connection_indicator"]
        self.assertTrue(indicator["enabled"])
        self.assertEqual(indicator["activation"], "explicit_request")
        self.assertTrue(indicator["online_label_forbidden"])
        self.assertNotIn('label: "Онлайн"', self.bundle)
        self.assertNotIn('? "Онлайн"', self.bundle)

    def test_per_device_transform_includes_scale_and_position(self) -> None:
        self.assertIn("stark-solarpower:state:${key}", self.canvas)
        self.assertIn("JSON.stringify({ scale:state.scale, x:state.x, y:state.y })", self.canvas)
        self.assertIn("switchKey:(nextKey)", self.canvas)
        self.assertIn("origin:()", self.canvas)

    def test_runtime_version_is_consistent(self) -> None:
        self.assertEqual(self.manifest["ui_version"], "0.7.1")
        self.assertIn('PANEL_UI_VERSION = "0.7.1"', self.panel)
        self.assertIn('const UI_VERSION = "0.7.1"', self.source)


if __name__ == "__main__":
    unittest.main()
