from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github/workflows/repository-checks.yml"


class RequiredFrontendDeliveryGateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow_text = WORKFLOW.read_text(encoding="utf-8")

    def test_required_validate_checks_deterministic_bundle_and_delivery_contract(self):
        self.assertIn("python scripts/build_frontend_bundle.py --check", self.workflow_text)
        self.assertIn("python scripts/check_frontend_delivery.py", self.workflow_text)


if __name__ == "__main__":
    unittest.main()
