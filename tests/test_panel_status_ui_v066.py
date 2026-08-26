from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRATION = ROOT / "custom_components" / "stark_solarpower"
SOURCE = INTEGRATION / "frontend" / "stark-solarpower-panel-v066.js"


class PanelStatusUiV066Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (INTEGRATION / "panel_manifest.json").read_text(encoding="utf-8")
        )

    def test_connection_and_freshness_are_independent(self) -> None:
        for label in (
            'label:"Облако"',
            'label:"Нет связи"',
            'label:"Нет данных"',
            'label:"Данные актуальны"',
            'label:"Данные устарели"',
        ):
            self.assertIn(label, self.source)
        self.assertTrue(
            self.manifest["overview"]["connection_indicator"][
                "channel_and_freshness_independent"
            ]
        )

    def test_power_mode_is_separate(self) -> None:
        self.assertIn('title:"От сети"', self.source)
        self.assertIn('title:"От батареи"', self.source)
        self.assertIn('title:"Не определено"', self.source)
        self.assertIn('detail:"UPS сообщает аварийный режим"', self.source)
        self.assertTrue(self.manifest["overview"]["power_mode_separate_from_connection"])

    def test_overview_has_no_duplicate_summary_or_metric_row(self) -> None:
        overview = self.source.split(
            "Panel.prototype._renderOverviewV051 = function () {", 1
        )[1].split("const previousRender", 1)[0]
        self.assertNotIn("_renderStateSummaryV051", overview)
        self.assertNotIn("metrics-row-v051", overview)
        self.assertNotIn("reserve-strip-v051", overview)

    def test_indicator_geometry_matches_contract(self) -> None:
        self.assertIn("width:10px", self.source)
        self.assertIn("gap:10px", self.source)
        self.assertIn("padding:12px 14px", self.source)
        self.assertIn("font-size:15px", self.source)
        self.assertIn("font-size:12px", self.source)


if __name__ == "__main__":
    unittest.main()
