from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    ROOT
    / "custom_components"
    / "stark_solarpower"
    / "frontend"
    / "stark-solarpower-panel-v069.js"
)


class PanelLivePatchUiV069Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = SOURCE.read_text(encoding="utf-8")

    def test_every_primary_view_has_detached_live_markup(self) -> None:
        expected = {
            '"overview") return this._renderOverviewV051()',
            '"ups") return this._renderUpsV051()',
            '"history") return this._renderHistory()',
            '"events") return this._renderEventsV051()',
            '"diagnostics") return this._renderDiagnostics()',
        }
        for snippet in expected:
            self.assertIn(snippet, self.source)

    def test_live_update_preserves_existing_work_canvas(self) -> None:
        self.assertIn("sameChildrenShape(current, template.content)", self.source)
        self.assertIn("syncChildren(current, template.content)", self.source)
        self.assertIn("_liveStructureCacheV069 === structureKey", self.source)
        self.assertIn("return;", self.source)
        self.assertIn("!node.nodeValue.trim()", self.source)

    def test_sync_changes_attributes_and_text_without_replacement(self) -> None:
        sync_body = self.source.split("function syncTree(current, desired) {", 1)[1].split(
            "if (Panel &&", 1
        )[0]
        self.assertIn("current.nodeValue = desired.nodeValue", sync_body)
        self.assertIn("syncAttributes(current, desired)", sync_body)
        self.assertNotIn("innerHTML", sync_body)
        self.assertNotIn("replaceWith", sync_body)
        self.assertNotIn("replaceChildren", sync_body)

    def test_structure_key_ignores_live_entity_state(self) -> None:
        key_body = self.source.split("_liveStructureKeyV069 = function () {", 1)[1].split(
            "_renderLiveViewV069", 1
        )[0]
        self.assertIn("device.entities", key_body)
        self.assertNotIn("this._hass.states", key_body)
        self.assertNotIn("last_updated", key_body)


if __name__ == "__main__":
    unittest.main()
