from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INIT = ROOT / "custom_components" / "stark_solarpower" / "__init__.py"


class PanelStartupLifecycleContractTests(unittest.TestCase):
    """Keep /dashboard-ups independent of the first cloud refresh."""

    @classmethod
    def setUpClass(cls) -> None:
        source = INIT.read_text(encoding="utf-8")
        cls.setup = source.split("async def async_setup_entry", 1)[1].split(
            "async def async_unload_entry", 1
        )[0]

    def test_runtime_ownership_and_panel_precede_first_refresh(self) -> None:
        runtime = self.setup.index("entry.runtime_data = coordinator")
        ownership = self.setup.index("entry_ids.add(entry.entry_id)")
        panel = self.setup.index("await async_register_ups_panel(hass)")
        refresh = self.setup.index(
            "await coordinator.async_config_entry_first_refresh()"
        )
        platforms = self.setup.index(
            "await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)"
        )
        self.assertLess(runtime, ownership)
        self.assertLess(ownership, panel)
        self.assertLess(panel, refresh)
        self.assertLess(refresh, platforms)

    def test_failed_first_refresh_does_not_unregister_route(self) -> None:
        self.assertNotIn("async_unregister_ups_panel", self.setup)
        self.assertIn("ConfigEntryNotReady retry", self.setup)
        self.assertIn("/dashboard-ups disappear", self.setup)


if __name__ == "__main__":
    unittest.main()
