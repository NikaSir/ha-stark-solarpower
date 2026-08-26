from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"


class PanelGestureGuardUiV071Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.gesture = (FRONTEND / "stark-solarpower-panel-v065.js").read_text(
            encoding="utf-8"
        )
        cls.layout = (FRONTEND / "stark-solarpower-panel-v071.js").read_text(
            encoding="utf-8"
        )

    def test_first_finger_lift_preserves_two_finger_tap(self) -> None:
        partial_lift = self.gesture.split(
            "if (multi && event.touches.length === 1)", 1
        )[1].split("if (event.touches.length) return", 1)[0]
        self.assertNotIn("pinch=null", partial_lift)
        self.assertIn("event.preventDefault()", partial_lift)

    def test_post_pinch_click_cannot_activate_bottom_navigation(self) -> None:
        nav_guard = self.gesture.split(
            'root.querySelectorAll(".bottom-nav-v051 [data-view-v051]")', 1
        )[1].split("const resize", 1)[0]
        self.assertIn("__starkGuardUntilV065", nav_guard)
        self.assertIn("event.preventDefault()", nav_guard)
        self.assertIn("event.stopImmediatePropagation()", nav_guard)

    def test_unknown_power_title_is_one_line(self) -> None:
        self.assertIn("white-space:nowrap", self.layout)
        self.assertIn("font-size:clamp(23px,6.4vw,29px)", self.layout)

    def test_battery_plaque_has_clearance_above_cabinet(self) -> None:
        self.assertIn("top:58px !important", self.layout)


if __name__ == "__main__":
    unittest.main()
