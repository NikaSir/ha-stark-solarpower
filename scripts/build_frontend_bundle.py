from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components" / "stark_solarpower" / "frontend"
OUTPUT = FRONTEND / "stark-solarpower-panel-bundle.js"
SOURCES = [
    FRONTEND / "stark-solarpower-panel.js",
    FRONTEND / "stark-solarpower-panel-v020.js",
    FRONTEND / "stark-solarpower-panel-v021.js",
    FRONTEND / "stark-solarpower-panel-v030.js",
    FRONTEND / "stark-solarpower-panel-v031.js",
    FRONTEND / "stark-solarpower-panel-v032.js",
    FRONTEND / "stark-solarpower-panel-v033.js",
    FRONTEND / "stark-solarpower-panel-v034.js",
    FRONTEND / "stark-solarpower-panel-v035.js",
    FRONTEND / "stark-solarpower-panel-v040.js",
    FRONTEND / "stark-solarpower-panel-v040-semantics.js",
    FRONTEND / "stark-solarpower-panel-v041.js",
    FRONTEND / "stark-solarpower-panel-v042.js",
    FRONTEND / "stark-solarpower-panel-v043.js",
    FRONTEND / "stark-solarpower-panel-v050.js",
    FRONTEND / "stark-solarpower-panel-v051.js",
    FRONTEND / "stark-solarpower-panel-v052.js",
    FRONTEND / "stark-solarpower-panel-v053.js",
    FRONTEND / "stark-solarpower-panel-v054.js",
    FRONTEND / "stark-solarpower-panel-v055.js",
    FRONTEND / "stark-solarpower-panel-v056.js",
    FRONTEND / "stark-solarpower-panel-v057.js",
    FRONTEND / "stark-solarpower-panel-v058.js",
    FRONTEND / "stark-solarpower-panel-v059.js",
    FRONTEND / "stark-solarpower-panel-v060.js",
    FRONTEND / "stark-solarpower-panel-v061.js",
    FRONTEND / "stark-solarpower-panel-v062.js",
    FRONTEND / "stark-solarpower-panel-v063.js",
    FRONTEND / "stark-solarpower-panel-v064.js",
    FRONTEND / "stark-solarpower-panel-v065.js",
    FRONTEND / "stark-solarpower-panel-v066.js",
    FRONTEND / "stark-solarpower-panel-v067.js",
    FRONTEND / "stark-solarpower-panel-v068.js",
    FRONTEND / "stark-solarpower-panel-v069.js",
    FRONTEND / "stark-solarpower-panel-v070.js",
    FRONTEND / "stark-solarpower-panel-v071.js",
    FRONTEND / "stark-solarpower-panel-v080.js",
    FRONTEND / "stark-solarpower-panel-v081.js",
    FRONTEND / "stark-solarpower-panel-v082.js",
    FRONTEND / "stark-solarpower-panel-v083.js",
    FRONTEND / "stark-solarpower-panel-v084.js",
    FRONTEND / "stark-solarpower-panel-v085.js",
    FRONTEND / "stark-solarpower-panel-v086.js",
    FRONTEND / "stark-solarpower-panel-v090.js",
    FRONTEND / "stark-solarpower-panel-v091.js",
]
IMPORT_RE = re.compile(r"^\s*import\s+[\"']\./[^\"']+[\"'];?\s*$", re.MULTILINE)


def _clean(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    text = IMPORT_RE.sub("", text).strip()
    if re.search(r"^\s*(?:import|export)\b", text, re.MULTILINE):
        raise SystemExit(f"Unsupported ES module statement remains in {path}")
    return text


def build() -> str:
    parts = [
        "// GENERATED FILE. DO NOT EDIT DIRECTLY.",
        "// Stark SolarPower self-contained Home Assistant panel bundle.",
        "// Source history is composed at build time; no previous UI file is loaded at runtime.",
        "",
    ]
    for path in SOURCES:
        if not path.exists():
            raise SystemExit(f"Missing frontend source: {path}")
        relative = path.relative_to(ROOT).as_posix()
        parts.extend(
            [
                f"// BEGIN {relative}",
                "(() => {",
                _clean(path),
                "})();",
                f"// END {relative}",
                "",
            ]
        )
    return "\n".join(parts).rstrip() + "\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = build()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
            raise SystemExit("Frontend production bundle is missing or stale")
        raise SystemExit(0)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(content)} bytes)")
