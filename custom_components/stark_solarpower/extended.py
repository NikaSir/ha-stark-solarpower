"""Detailed read-only telemetry helpers for Stark SolarPower."""

from __future__ import annotations

import re
from typing import Any

from .api import (
    SolarPowerConnectionError,
    StarkDeviceInfo,
    StarkSolarPowerApi,
    _to_number,
)


def _normalize_detail_title(title: str) -> str:
    """Normalize a detailed telemetry title to a stable internal key."""
    normalized = re.sub(r"[^a-z0-9]+", "_", title.casefold()).strip("_")
    return normalized or "field"


async def async_get_extended_values(
    api: StarkSolarPowerApi,
    device: StarkDeviceInfo,
) -> dict[str, Any]:
    """Fetch the vendor's detailed read-only telemetry for one UPS.

    ``queryDeviceLastData`` identifies fields by localized titles rather than
    protocol IDs. The integration uses the fixed ``en_US`` SolarPower app
    profile and normalizes those titles to stable internal keys. Duplicate
    titles are preserved with numeric suffixes rather than overwritten.
    """
    payload = await api._async_request(  # noqa: SLF001 - package-internal API
        "queryDeviceLastData",
        [
            ("pn", device.pn),
            ("devcode", device.devcode),
            ("devaddr", device.devaddr),
            ("sn", device.sn),
        ],
    )
    data = payload.get("dat")
    if not isinstance(data, list):
        raise SolarPowerConnectionError(
            f"{device.name}: detailed-data response has no data list"
        )

    values: dict[str, Any] = {}
    for item in data:
        if not isinstance(item, dict):
            continue
        title = item.get("title")
        if not isinstance(title, str) or not title.strip():
            continue

        base_key = _normalize_detail_title(title)
        key = base_key
        suffix = 2
        while key in values:
            key = f"{base_key}_{suffix}"
            suffix += 1
        values[key] = _to_number(item.get("val"))

    if not values:
        raise SolarPowerConnectionError(
            f"{device.name}: detailed-data response contains no values"
        )
    return values
