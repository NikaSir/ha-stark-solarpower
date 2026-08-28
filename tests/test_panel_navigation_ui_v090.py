from __future__ import annotations

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelNavigationUiV090Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v090.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")
        cls.builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(encoding="utf-8")
        cls.panel_manifest = json.loads((INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8"))

    def test_source_route_is_captured_once_with_required_precedence(self) -> None:
        self.assertIn('current.searchParams.get("return_to")', self.source)
        self.assertIn('current.searchParams.get("from")', self.source)
        self.assertIn('sessionStorage.getItem(SOURCE_ROUTE_KEY)', self.source)
        self.assertIn('sessionStorage.removeItem(SOURCE_ROUTE_KEY)', self.source)
        self.assertIn('rawRoute === null || rawTimestamp === null', self.source)
        self.assertIn('age < 0', self.source)
        self.assertIn('if (!this.__starkReturnRouteV090)', self.source)
        self.assertIn('document.referrer', self.source)
        self.assertIn('parent_route', self.source)

    def test_only_canonical_base_routes_are_accepted(self) -> None:
        for route in (
            "/dashboard-house-v11/home",
            "/dashboard-actions/home",
            "/dashboard-infrastructure/overview",
        ):
            self.assertIn(route, self.source)
        self.assertNotIn('"/dashboard-house"', self.source)
        self.assertNotIn("history.back(", self.bundle)

    def test_title_is_persistent_semantic_version_only_button(self) -> None:
        self.assertIn('document.createElement("button")', self.source)
        self.assertIn('title-return-v090', self.source)
        self.assertIn('version.textContent = `UI v${UI_VERSION}`', self.source)
        self.assertIn('.title-return-v090:focus-visible', self.source)
        self.assertIn('.title-return-v090:active', self.source)
        self.assertNotIn("shadowRoot.innerHTML", self.source)

    def test_explicit_ha_navigation_and_delivery_versions(self) -> None:
        self.assertIn('window.history.pushState(null, "", target)', self.source)
        self.assertIn('new Event("location-changed")', self.source)
        self.assertEqual(self.panel_manifest["ui_version"], "0.9.1")
        self.assertEqual(self.panel_manifest["shell"]["standard_version"], "1.9")
        self.assertIn('FRONTEND / "stark-solarpower-panel-v090.js"', self.builder)


if __name__ == "__main__":
    unittest.main()
