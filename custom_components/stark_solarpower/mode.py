"""Truth-preserving Stark operating-mode helpers."""

from __future__ import annotations

from typing import Any

from .const import (
    MODE_BATTERY,
    MODE_BYPASS,
    MODE_FAULT,
    MODE_LINE,
    MODE_SHUTDOWN,
    MODE_STANDBY,
    MODE_UNKNOWN,
)


def normalize_mode(value: Any) -> str:
    """Normalize vendor mode text to stable enum values."""
    text = str(value or "").strip().casefold()
    mapping = {
        "line mode": MODE_LINE,
        "battery mode": MODE_BATTERY,
        "standby mode": MODE_STANDBY,
        "bypass mode": MODE_BYPASS,
        "fault mode": MODE_FAULT,
        "shutdown mode": MODE_SHUTDOWN,
    }
    return mapping.get(text, MODE_UNKNOWN)


def mode_is(value: Any, expected: str) -> bool | None:
    """Compare a vendor mode without turning unknown into a false fact."""
    mode = normalize_mode(value)
    if mode == MODE_UNKNOWN:
        return None
    return mode == expected
