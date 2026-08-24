from __future__ import annotations

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
    content = build()
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(content)} bytes)")
