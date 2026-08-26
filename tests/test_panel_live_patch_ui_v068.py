from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    ROOT
    / "custom_components"
    / "stark_solarpower"
    / "frontend"
    / "stark-solarpower-panel-v068.js"
)


class PanelLivePatchUiV068Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8")

    def test_same_overview_structure_uses_in_place_patch(self) -> None:
        self.assertIn("_overviewStructureKeyV068", self.source)
        self.assertIn("_overviewStructureCacheV068 === structureKey", self.source)
        self.assertIn("_patchOverviewV068(device)", self.source)
        self.assertIn("return;", self.source)

    def test_live_values_and_statuses_are_patched(self) -> None:
        for selector in (
            ".hero-copy-v051 h2",
            ".connection-copy-v066 strong",
            ".scene-node-v051.grid strong",
            ".scene-node-v051.load strong",
            ".scene-node-v051.battery strong",
            ".reserve-strip-v067 strong",
        ):
            self.assertIn(selector, self.source)

    def test_patch_does_not_replace_scene_or_image(self) -> None:
        patch_body = self.source.split(
            "Panel.prototype._patchOverviewV068 = function (device) {", 1
        )[1].split("Panel.prototype._render = function () {", 1)[0]
        self.assertNotIn("innerHTML", patch_body)
        self.assertNotIn("replaceWith", patch_body)
        self.assertNotIn("ups-art-v051", patch_body)
        self.assertNotIn("--hero-background-v051", patch_body)

    def test_structure_key_ignores_live_hass_state(self) -> None:
        key_body = self.source.split(
            "Panel.prototype._overviewStructureKeyV068 = function (device) {", 1
        )[1].split("Panel.prototype._patchOverviewV068", 1)[0]
        self.assertIn("device?.entities", key_body)
        self.assertNotIn("this._hass", key_body)
        self.assertNotIn("stateObj", key_body)


if __name__ == "__main__":
    unittest.main()
