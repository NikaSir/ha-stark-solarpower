from __future__ import annotations

import hashlib
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelUiStandardV22Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.profile = json.loads((ROOT / ".nikas-ui-standard.json").read_text(encoding="utf-8"))
        cls.manifest = json.loads((INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8"))
        cls.runtime = (FRONTEND / "stark-solarpower-panel-v096.js").read_text(encoding="utf-8")
        cls.bundle = (FRONTEND / "stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")
        cls.panel_registration = (INTEGRATION / "panel.py").read_text(encoding="utf-8")

    def test_canonical_documents_and_shell_source_are_pinned(self) -> None:
        self.assertEqual(self.profile["version"], "2.2")
        self.assertEqual(self.profile["navigation_contract_version"], "1.2")
        for path_key, hash_key in (
            ("standard_path", "standard_sha256"),
            ("navigation_contract_path", "navigation_contract_sha256"),
        ):
            content = (ROOT / self.profile[path_key]).read_bytes()
            self.assertEqual(hashlib.sha256(content).hexdigest(), self.profile[hash_key])
        shell = self.profile["shell_source"]
        self.assertEqual(shell["delivery"], "vendored-build-time")
        self.assertFalse(shell["runtime_dependency"])
        self.assertEqual(
            hashlib.sha256((ROOT / shell["path"]).read_bytes()).hexdigest(),
            shell["sha256"],
        )
        self.assertIn(f"BEGIN {shell['path']}", self.bundle)
        self.assertIn("BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v096.js", self.bundle)

    def test_shell_and_chrome_publish_exact_v22_geometry(self) -> None:
        shell = self.profile["shell_contract"]
        self.assertEqual(shell["host_boundary"], "ha-panel")
        self.assertEqual(shell["header_body_px"], 60)
        self.assertEqual(shell["peer_selector_px"], 52)
        self.assertEqual(shell["bottom_nav_body_px"], 64)
        self.assertEqual(shell["content_max_width_px"], 1280)
        for marker in (
            "position:relative!important",
            'grid-template-areas:\"header\" \"peer\" \"viewport\" \"tabs\"',
            "width:min(360px,100%)!important",
            "height:52px!important",
            "max-width:1280px!important",
            "--mdc-icon-size:26px!important",
            "line-height:14px!important",
        ):
            self.assertIn(marker, self.runtime)

    def test_connection_and_decoration_tokens_are_locked(self) -> None:
        plaque = self.profile["connection_plaque_reference"]
        self.assertEqual((plaque["width_px"], plaque["height_px"]), (168, 58))
        self.assertEqual((plaque["top_px"], plaque["right_px"]), (13, 13))
        self.assertEqual(plaque["padding_px"], "11 12")
        self.assertEqual(plaque["main_font"], "16px/700")
        self.assertEqual(plaque["freshness_font"], "13px/600")
        for marker in (
            "width:168px!important",
            "height:58px!important",
            "top:13px!important",
            "right:13px!important",
            "padding:11px 12px!important",
            "width:205px!important",
            "height:205px!important",
            "top:-92px!important",
            "right:-70px!important",
            "background:rgba(3,169,217,0.07)!important",
        ):
            self.assertIn(marker, self.runtime)

    def test_peer_health_is_fail_closed_and_independent(self) -> None:
        lamp = self.profile["peer_device_status_lamp_reference"]
        self.assertEqual(lamp["state_priority"], ["fault", "warning", "good", "unknown"])
        self.assertTrue(lamp["selection_is_independent"])
        self.assertIn('tone:"unknown"', self.runtime)
        self.assertIn('mode && mode !== "unknown"', self.runtime)
        self.assertIn(".global-device-context button.active", (FRONTEND / "stark-solarpower-panel-v095.js").read_text(encoding="utf-8"))

    def test_route_collision_and_unload_respect_ownership(self) -> None:
        self.assertIn('PANEL_OWNED = "panel_owned"', self.panel_registration)
        collision = self.panel_registration.index("if frontend.async_panel_exists")
        register = self.panel_registration.index("await panel_custom.async_register_panel")
        own = self.panel_registration.index("domain_data[PANEL_OWNED] = True")
        self.assertLess(collision, register)
        self.assertLess(register, own)
        self.assertIn("if not domain_data.get(PANEL_OWNED)", self.panel_registration)
        self.assertIn("domain_data[PANEL_OWNED] = False", self.panel_registration)


if __name__ == "__main__":
    unittest.main()
