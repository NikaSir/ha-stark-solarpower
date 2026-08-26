from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"


class PanelStabilityUiV067Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.zoom = (FRONTEND / "stark-solarpower-panel-v065.js").read_text(
            encoding="utf-8"
        )
        cls.source = (FRONTEND / "stark-solarpower-panel-v067.js").read_text(
            encoding="utf-8"
        )

    def test_zero_width_frame_cannot_collapse_surface(self) -> None:
        self.assertIn("Number.parseFloat(surface.style.width)", self.zoom)
        self.assertIn('root.querySelector(".global-device-context")', self.zoom)
        self.assertIn("root.host?.clientWidth", self.zoom)
        self.assertIn("directWidth > 1", self.zoom)
        self.assertIn("if (measuredWidth > 1) baseWidth", self.zoom)
        self.assertIn("if (baseWidth > 1) surface.style.width", self.zoom)

    def test_final_overview_geometry_exists_before_zoom_measurement(self) -> None:
        self.assertIn("data-stark-overview-v067", self.source)
        self.assertIn("height:360px !important", self.source)
        self.assertIn("stableStyle + html.replace", self.source)

    def test_reserve_status_is_visible_without_summary_duplication(self) -> None:
        self.assertIn("reserve-strip-v067", self.source)
        self.assertIn("this._reserveV050", self.source)
        self.assertNotIn("_renderStateSummaryV051", self.source)


if __name__ == "__main__":
    unittest.main()
