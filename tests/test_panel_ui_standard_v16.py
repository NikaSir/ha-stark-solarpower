from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
GESTURES = INTEGRATION / "frontend" / "stark-solarpower-panel-v065.js"
STANDARD = INTEGRATION / "frontend" / "stark-solarpower-panel-v080.js"
ADOPTION = INTEGRATION / "frontend" / "stark-solarpower-panel-v096.js"
REFRESH = ADOPTION


class PanelUiStandardV16Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.gestures = GESTURES.read_text(encoding="utf-8")
        cls.standard = STANDARD.read_text(encoding="utf-8")
        cls.adoption = ADOPTION.read_text(encoding="utf-8")
        cls.refresh = REFRESH.read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_native_scroll_and_gesture_contract(self) -> None:
        self.assertIn("const MIN_SCALE = 0.75", self.gestures)
        self.assertIn("const MAX_SCALE = 2", self.gestures)
        self.assertIn("const SNAP_MIN = 0.97", self.gestures)
        self.assertIn("const SNAP_MAX = 1.03", self.gestures)
        self.assertIn("state.scale <= 1", self.gestures)
        self.assertIn("if (b.overflowX) state.x", self.gestures)
        self.assertIn("if (b.overflowY) state.y", self.gestures)
        self.assertIn('toast.textContent = "Масштаб 100%"', self.gestures)
        self.assertIn("switchContext", self.gestures)
        self.assertIn("resetPosition", self.gestures)
        self.assertIn("stark-solarpower:transform:${key}", self.gestures)

    def test_host_bound_four_row_shell(self) -> None:
        self.assertIn("position:relative!important", self.adoption)
        self.assertIn("height:100%!important", self.adoption)
        self.assertIn('grid-template-areas:"header" "peer" "viewport" "tabs"', self.adoption)
        self.assertIn("calc(60px + env(safe-area-inset-top,0px))", self.adoption)
        self.assertIn("52px minmax(0,1fr)", self.adoption)
        self.assertIn("calc(64px + env(safe-area-inset-bottom,0px))", self.adoption)

    def test_bottom_navigation_geometry(self) -> None:
        self.assertIn("height:52px!important", self.adoption)
        self.assertIn("padding:2px 3px 6px!important", self.adoption)
        self.assertIn("--mdc-icon-size:26px!important", self.adoption)
        self.assertIn("line-height:14px!important", self.adoption)

    def test_lazy_view_cache_preserves_shell(self) -> None:
        self.assertIn("cache:new Map", self.standard)
        self.assertIn("shell.cache.get(key)", self.standard)
        self.assertIn("shell.surface.append(view)", self.standard)
        self.assertIn(
            "if (this.__starkShellV080 && this._reconcileShellV080()) return",
            self.standard,
        )
        self.assertNotIn("shadowRoot.innerHTML", self.standard)

    def test_v16_typography_and_indicator(self) -> None:
        self.assertIn("font-size:23px!important", self.standard)
        self.assertIn("font-size:14px!important", self.standard)
        self.assertIn("font-size:21px!important", self.standard)
        self.assertIn("font-size:13px!important", self.standard)
        self.assertIn(".hero-copy-v051 h2 { font-size:25px!important", self.standard)
        self.assertIn(
            ".connection-copy-v066 strong { font-size:16px!important",
            self.standard,
        )
        self.assertIn("10%,var(--card-background-color)", self.standard)
        self.assertIn("30%,var(--divider-color)", self.standard)
        self.assertIn(".metric-copy-v051 span,.metric-copy-v051 small", self.standard)

    def test_manifest_matches_runtime(self) -> None:
        self.assertEqual(self.manifest["ui_version"], "0.9.6")
        self.assertEqual(self.manifest["template"]["version"], "2.2")
        self.assertEqual(
            self.manifest["navigation"]["views"],
            ["overview", "ups", "events", "history", "diagnostics"],
        )
        self.assertEqual(
            self.manifest["typography"]["minimum_meaningful_text_px"], 12
        )
        self.assertEqual(
            self.manifest["typography"]["maximum_meaningful_text_px"], 25
        )
        self.assertEqual(
            self.manifest["quality"]["shell_mount"], "once_per_panel_instance"
        )
        self.assertEqual(
            self.manifest["quality"]["visited_views"], "lazy_dom_cache"
        )

    def test_refresh_fails_closed_without_optimistic_success(self) -> None:
        self.assertIn('["unknown", "unavailable"].includes', self.refresh)
        self.assertIn("Запрос обновления выполнен", self.refresh)
        self.assertIn("Promise.allSettled", self.refresh)
        self.assertIn("REFRESH_MINIMUM_MS = 900", self.refresh)
        self.assertIn("REFRESH_RESULT_MS = 1400", self.refresh)
        self.assertNotIn("UPS обновлены", self.refresh)


if __name__ == "__main__":
    unittest.main()
