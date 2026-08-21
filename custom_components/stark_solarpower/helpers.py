"""Time helpers for Stark SolarPower snapshots."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from .api import StarkDeviceSnapshot
from .const import STALE_AFTER


def data_age(
    snapshot: StarkDeviceSnapshot,
    *,
    now: datetime | None = None,
) -> timedelta | None:
    """Return the age of the vendor data sample, clamped at zero."""
    if snapshot.cloud_timestamp is None:
        return None

    current = now or datetime.now(tz=UTC)
    age = current - snapshot.cloud_timestamp
    return max(age, timedelta(0))


def data_age_seconds(
    snapshot: StarkDeviceSnapshot,
    *,
    now: datetime | None = None,
) -> int | None:
    """Return the vendor data age as whole seconds."""
    age = data_age(snapshot, now=now)
    if age is None:
        return None
    return round(age.total_seconds())


def is_data_stale(
    snapshot: StarkDeviceSnapshot,
    *,
    now: datetime | None = None,
) -> bool:
    """Return whether the vendor data sample is missing or too old."""
    age = data_age(snapshot, now=now)
    return age is None or age > STALE_AFTER
