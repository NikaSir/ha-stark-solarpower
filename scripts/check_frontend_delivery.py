from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "custom_components/stark_solarpower/frontend/stark-solarpower-panel-bundle.js"
PANEL = ROOT / "custom_components/stark_solarpower/panel.py"
MANIFEST = ROOT / "custom_components/stark_solarpower/panel_manifest.json"
EXPECTED_BUNDLE = "stark-solarpower-panel-bundle.js"


def main() -> int:
    bundle = BUNDLE.read_text(encoding="utf-8")
    panel = PANEL.read_text(encoding="utf-8")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    if re.search(r"(?m)^\s*(?:import|export)\s", bundle):
        raise SystemExit("Production panel bundle must be self-contained")
    if f'PANEL_BUNDLE = "{EXPECTED_BUNDLE}"' not in panel:
        raise SystemExit("panel.py must declare the self-contained production bundle")
    if 'module_url=f"{PANEL_STATIC_URL}/{PANEL_BUNDLE}?v={PANEL_UI_VERSION}"' not in panel:
        raise SystemExit("module_url must point to PANEL_BUNDLE with query-string cache busting")

    delivery = manifest.get("frontend_delivery", {})
    if delivery.get("mode") != "self_contained_bundle":
        raise SystemExit("panel_manifest.json must declare self_contained_bundle delivery")
    if delivery.get("module") != EXPECTED_BUNDLE:
        raise SystemExit("panel_manifest.json module does not match production registration")
    if delivery.get("runtime_previous_version_imports") is not False:
        raise SystemExit("runtime_previous_version_imports must be false")

    print("Frontend delivery contract OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
