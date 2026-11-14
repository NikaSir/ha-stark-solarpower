from pathlib import Path
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


class TwoUpsOverviewTests(unittest.TestCase):
    def test_overview_renders_each_device_and_only_uses_live_metrics(self):
        subprocess.run(["node", "tests/stark_two_ups_overview.mjs"], cwd=ROOT, check=True)
