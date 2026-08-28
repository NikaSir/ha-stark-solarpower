from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
FRONTEND = INTEGRATION / "frontend"


class PanelPinchMoreInfoGuardUiV082Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FRONTEND / "stark-solarpower-panel-v082.js").read_text(
            encoding="utf-8"
        )
        cls.panel_registration = (INTEGRATION / "panel.py").read_text(
            encoding="utf-8"
        )
        cls.integration_manifest = json.loads(
            (INTEGRATION / "manifest.json").read_text(encoding="utf-8")
        )
        cls.panel_manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )
        cls.bundle_builder = (ROOT / "scripts" / "build_frontend_bundle.py").read_text(
            encoding="utf-8"
        )

    def test_delivery_versions_and_bundle_source_agree(self) -> None:
        self.assertEqual(self.integration_manifest["version"], "1.8.27")
        self.assertEqual(self.panel_manifest["ui_version"], "0.8.5")
        self.assertIn('PANEL_UI_VERSION = "0.8.5"', self.panel_registration)
        self.assertIn('"stark-solarpower-panel-v082.js"', self.bundle_builder)

    def test_more_info_dispatch_checks_current_and_legacy_guards(self) -> None:
        dispatch_guard = self.source.split(
            "Panel.prototype._showMoreInfo = function", 1
        )[1].split("Panel.prototype._cancelEntityHoldsV082", 1)[0]
        self.assertIn("gestureGuardActiveV082(this)", dispatch_guard)
        self.assertIn("previousShowMoreInfo.call(this, entityId)", dispatch_guard)
        self.assertLess(
            dispatch_guard.index("gestureGuardActiveV082(this)"),
            dispatch_guard.index("previousShowMoreInfo.call(this, entityId)"),
        )
        self.assertIn("__starkGuardUntilV065", self.source)
        self.assertIn("__starkGestureGuardUntilV058", self.source)

    def test_second_finger_cancels_every_pending_entity_hold(self) -> None:
        touch_guard = self.source.split(
            'viewport.addEventListener("touchstart"', 1
        )[1].split("Panel.prototype._render", 1)[0]
        self.assertIn("event.touches.length < 2", touch_guard)
        self.assertIn("Number.POSITIVE_INFINITY", touch_guard)
        self.assertIn("this._cancelEntityHoldsV082(surface)", touch_guard)
        self.assertIn('querySelectorAll("[data-entity]")', self.source)
        self.assertIn('new PointerEvent("pointercancel"', self.source)
        self.assertIn("capture:true", touch_guard)

    def test_single_finger_hold_and_stable_dom_remain_available(self) -> None:
        self.assertNotIn("preventDefault", self.source)
        self.assertNotIn("shadowRoot.innerHTML", self.source)
        self.assertEqual(
            self.panel_manifest["zoom"]["more_info_guard"],
            "unified_at_dispatch_boundary",
        )
        self.assertEqual(
            self.panel_manifest["zoom"]["multitouch_hold_cancel"],
            "all_entities_in_work_surface",
        )


if __name__ == "__main__":
    unittest.main()
