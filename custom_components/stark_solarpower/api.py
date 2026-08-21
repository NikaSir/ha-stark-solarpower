"""Minimal read-only client for the Stark SolarPower cloud API."""

from __future__ import annotations

import asyncio
from collections import Counter
from dataclasses import dataclass, replace
from datetime import UTC, datetime, timedelta, timezone
import hashlib
import logging
import time
from typing import Any
from urllib.parse import quote

from aiohttp import ClientError, ClientSession

from .const import (
    API_URLS,
    APP_ID,
    APP_VERSION,
    COMPANY_KEY,
    VENDOR_GTS_BASE_OFFSET_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


class SolarPowerError(Exception):
    """Base SolarPower error."""


class SolarPowerAuthError(SolarPowerError):
    """Authentication failed."""


class SolarPowerConnectionError(SolarPowerError):
    """Network or response error."""


class SolarPowerApiError(SolarPowerError):
    """The SolarPower backend returned an error."""

    def __init__(self, code: int | str, description: str) -> None:
        """Initialize an API error."""
        self.code = code
        self.description = description
        super().__init__(f"{description} (code {code})")


class SolarPowerNoDevicesError(SolarPowerError):
    """The account contains no devices."""


@dataclass(frozen=True, slots=True)
class StarkDeviceInfo:
    """Identifiers required by the SolarPower API."""

    pn: str
    name: str
    sn: str
    devcode: int
    devaddr: int
    timezone_offset: int | None = None


@dataclass(frozen=True, slots=True)
class StarkDeviceSnapshot:
    """Latest read-only telemetry for one UPS."""

    device: StarkDeviceInfo
    values: dict[str, Any]
    cloud_timestamp: datetime | None
    fetched_at: datetime
    available: bool = True
    error: str | None = None


def _sha1(value: str) -> str:
    """Return a SHA-1 digest required by the vendor protocol."""
    return hashlib.sha1(value.encode("utf-8"), usedforsecurity=False).hexdigest()


def _encoded(value: Any) -> str:
    """Encode one query-string value and preserve signing order."""
    return quote(str(value), safe="")


def _to_number(value: Any) -> Any:
    """Convert numeric strings while preserving textual states and versions."""
    if value is None or isinstance(value, (int, float, bool)):
        return value
    if not isinstance(value, str):
        return value

    stripped = value.strip()
    if not stripped:
        return None

    # Preserve firmware strings such as 02345.0102 and identifiers with leading zeroes.
    if (
        (stripped.startswith("0") and len(stripped) > 1 and stripped[1].isdigit())
        or any(char.isalpha() for char in stripped)
    ):
        return stripped

    try:
        if any(char in stripped.lower() for char in (".", "e")):
            return float(stripped)
        return int(stripped)
    except ValueError:
        return stripped


def _parse_cloud_timestamp(
    raw: Any,
    timezone_offset: int | None,
) -> datetime | None:
    """Parse and normalize the vendor `gts` timestamp to UTC.

    Numeric `gts` values are not conventional Unix timestamps for this
    SolarPower profile.  The backend encodes the device local wall clock as
    an epoch value in its fixed UTC+8 base zone.  Correct it using the device
    timezone reported by `queryDevices`.
    """
    try:
        if isinstance(raw, (int, float)) or str(raw).strip().isdigit():
            value = float(raw)
            if value > 10_000_000_000:
                value /= 1000
            timestamp = datetime.fromtimestamp(value, tz=UTC)
            if timezone_offset is not None:
                correction = (
                    VENDOR_GTS_BASE_OFFSET_SECONDS - timezone_offset
                )
                timestamp += timedelta(seconds=correction)
        else:
            parsed = datetime.strptime(
                str(raw).strip(),
                "%Y-%m-%d %H:%M:%S",
            )
            if timezone_offset is None:
                timestamp = parsed.replace(tzinfo=UTC)
            else:
                device_tz = timezone(timedelta(seconds=timezone_offset))
                timestamp = parsed.replace(tzinfo=device_tz).astimezone(UTC)
    except (TypeError, ValueError, OSError, OverflowError):
        return None

    if not 2000 <= timestamp.year <= 2100:
        return None
    return timestamp


def _looks_like_auth_error(code: Any, description: str) -> bool:
    """Return whether an API error indicates expired or invalid credentials."""
    text = description.upper()
    return code in {12, 13, 16, 17, 18} or any(
        marker in text for marker in ("TOKEN", "AUTH", "PASSWORD", "LOGIN")
    )


class StarkSolarPowerApi:
    """Read-only API client using the exact Stark SolarPower app profile."""

    def __init__(
        self,
        session: ClientSession,
        username: str,
        password: str,
        fallback_timezone_offset: int | None = None,
    ) -> None:
        """Initialize the client."""
        self._session = session
        self._username = username
        self._password = password
        self._fallback_timezone_offset = fallback_timezone_offset
        self._token: str | None = None
        self._secret: str | None = None
        self._token_valid_until = 0.0
        self._api_url: str | None = None

    @staticmethod
    def _salt() -> str:
        """Return the millisecond salt used by the mobile application."""
        return str(int(time.time() * 1000))

    @staticmethod
    def _context() -> list[tuple[str, Any]]:
        """Return ordered white-label application parameters."""
        return [
            ("i18n", "en_US"),
            ("lang", "en_US"),
            ("source", 1),
            ("_app_client_", "android"),
            ("_app_id_", APP_ID),
            ("_app_version_", APP_VERSION),
        ]

    @classmethod
    def _base(cls, action: str, params: list[tuple[str, Any]]) -> str:
        """Build the exact ordered query fragment used for signing."""
        ordered = [("action", action), *params, *cls._context()]
        return "".join(f"&{key}={_encoded(value)}" for key, value in ordered)

    @property
    def transport_scheme(self) -> str | None:
        """Return the selected vendor API transport scheme."""
        if self._api_url is None:
            return None
        return self._api_url.split(":", 1)[0]

    async def _get_json_from_url(self, url: str) -> dict[str, Any]:
        """Fetch one API response from an exact URL."""
        try:
            async with asyncio.timeout(15):
                async with self._session.get(url) as response:
                    response.raise_for_status()
                    payload = await response.json(content_type=None)
        except (TimeoutError, ClientError, ValueError) as err:
            raise SolarPowerConnectionError(
                f"Cannot communicate with SolarPower: {err}"
            ) from err

        if not isinstance(payload, dict):
            raise SolarPowerConnectionError(
                "SolarPower returned a non-object response"
            )
        return payload

    async def _get_json(self, query: str) -> dict[str, Any]:
        """Fetch one API response, preferring HTTPS when supported."""
        if self._api_url is not None:
            return await self._get_json_from_url(f"{self._api_url}{query}")

        first_error: SolarPowerConnectionError | None = None
        for base_url in API_URLS:
            try:
                payload = await self._get_json_from_url(f"{base_url}{query}")
            except SolarPowerConnectionError as err:
                if first_error is None:
                    first_error = err
                _LOGGER.debug("SolarPower transport %s failed: %s", base_url, err)
                continue

            self._api_url = base_url
            if base_url.startswith("http://"):
                _LOGGER.warning(
                    "SolarPower API does not appear reachable over HTTPS; "
                    "falling back to vendor HTTP transport"
                )
            else:
                _LOGGER.info("SolarPower API transport selected: HTTPS")
            return payload

        if first_error is not None:
            raise first_error
        raise SolarPowerConnectionError("No SolarPower API transport is available")

    async def async_login(self) -> None:
        """Authenticate without transmitting the clear-text password."""
        salt = self._salt()
        base = self._base(
            "authSource",
            [
                ("usr", self._username),
                ("company-key", COMPANY_KEY),
            ],
        )
        sign = _sha1(f"{salt}{_sha1(self._password)}{base}")
        query = f"?sign={sign}&salt={salt}{base}"
        payload = await self._get_json(query)

        code = payload.get("err", -1)
        description = str(payload.get("desc", "Unknown authentication error"))
        if code != 0:
            raise SolarPowerAuthError(f"{description} (code {code})")

        data = payload.get("dat")
        if not isinstance(data, dict):
            raise SolarPowerAuthError("SolarPower login response has no data")

        token = data.get("token")
        secret = data.get("secret")
        if not isinstance(token, str) or not isinstance(secret, str):
            raise SolarPowerAuthError(
                "SolarPower login response has no token or secret"
            )

        try:
            expires_in = int(data.get("expire", 3600))
        except (TypeError, ValueError):
            expires_in = 3600

        self._token = token
        self._secret = secret
        self._token_valid_until = time.monotonic() + max(60, expires_in - 60)

    async def _async_request(
        self,
        action: str,
        params: list[tuple[str, Any]] | None = None,
        *,
        retry_auth: bool = True,
    ) -> dict[str, Any]:
        """Perform one signed, read-only request."""
        if (
            self._token is None
            or self._secret is None
            or time.monotonic() >= self._token_valid_until
        ):
            await self.async_login()

        assert self._token is not None
        assert self._secret is not None

        salt = self._salt()
        base = self._base(action, params or [])
        sign = _sha1(f"{salt}{self._secret}{self._token}{base}")
        query = (
            f"?sign={sign}&salt={salt}"
            f"&token={_encoded(self._token)}{base}"
        )
        payload = await self._get_json(query)

        code = payload.get("err", -1)
        description = str(payload.get("desc", payload.get("errorMessage", "API error")))
        if code == 0:
            return payload

        if retry_auth and _looks_like_auth_error(code, description):
            self._token = None
            self._secret = None
            await self.async_login()
            return await self._async_request(action, params, retry_auth=False)

        raise SolarPowerApiError(code, description)

    async def async_discover_devices(self) -> list[StarkDeviceInfo]:
        """Discover every UPS on the SolarPower account."""
        devices: dict[str, StarkDeviceInfo] = {}

        # The Stark white-label account exposes the two UPS devices through
        # slightly different list endpoints.  Query the exact calls observed
        # in the mobile app first, then try their paginated variants to remain
        # robust if the account grows beyond the backend's default page size.
        responses: list[dict[str, Any]] = []
        for action, params in (
            ("queryDevices", []),
            ("webQueryDeviceEs", []),
            ("queryDevices", [("page", 0), ("pagesize", 50)]),
            ("webQueryDeviceEs", [("page", 0), ("pagesize", 50)]),
        ):
            try:
                responses.append(await self._async_request(action, params))
            except SolarPowerApiError as err:
                _LOGGER.debug("%s did not return devices: %s", action, err)

        for payload in responses:
            data = payload.get("dat")
            if not isinstance(data, dict):
                continue
            raw_devices = data.get("device")
            if not isinstance(raw_devices, list):
                continue

            for raw in raw_devices:
                if not isinstance(raw, dict):
                    continue
                pn = str(raw.get("pn") or raw.get("collalias") or "").strip()
                if not pn:
                    continue

                name = str(
                    raw.get("alias")
                    or raw.get("devalias")
                    or raw.get("collalias")
                    or f"UPS {pn[-4:]}"
                ).strip()
                sn = str(raw.get("sn") or pn).strip()

                try:
                    devcode = int(raw.get("devcode", 3841))
                    devaddr = int(raw.get("devaddr", 1))
                except (TypeError, ValueError):
                    devcode = 3841
                    devaddr = 1

                try:
                    timezone_offset = int(raw["timezone"])
                except (KeyError, TypeError, ValueError):
                    timezone_offset = None

                existing = devices.get(pn)
                if timezone_offset is None and existing is not None:
                    timezone_offset = existing.timezone_offset

                devices[pn] = StarkDeviceInfo(
                    pn=pn,
                    name=name,
                    sn=sn,
                    devcode=devcode,
                    devaddr=devaddr,
                    timezone_offset=timezone_offset,
                )

        if not devices:
            raise SolarPowerNoDevicesError(
                "The SolarPower account returned no compatible devices"
            )

        known_offsets = [
            device.timezone_offset
            for device in devices.values()
            if device.timezone_offset is not None
        ]
        account_offset = (
            Counter(known_offsets).most_common(1)[0][0]
            if known_offsets
            else self._fallback_timezone_offset
        )
        if account_offset is not None:
            devices = {
                pn: (
                    device
                    if device.timezone_offset is not None
                    else replace(device, timezone_offset=account_offset)
                )
                for pn, device in devices.items()
            }

        return sorted(devices.values(), key=lambda item: item.name.casefold())

    async def async_get_snapshot(
        self,
        device: StarkDeviceInfo,
    ) -> StarkDeviceSnapshot:
        """Fetch structured current data for one UPS."""
        payload = await self._async_request(
            "querySPDeviceLastData",
            [
                ("pn", device.pn),
                ("devcode", device.devcode),
                ("devaddr", device.devaddr),
                ("sn", device.sn),
            ],
        )
        data = payload.get("dat")
        if not isinstance(data, dict):
            raise SolarPowerConnectionError(
                f"{device.name}: current-data response has no data object"
            )

        groups = data.get("pars")
        if not isinstance(groups, dict):
            raise SolarPowerConnectionError(
                f"{device.name}: current-data response has no parameter groups"
            )

        values: dict[str, Any] = {}
        for group in groups.values():
            if not isinstance(group, list):
                continue
            for item in group:
                if not isinstance(item, dict):
                    continue
                key = item.get("id")
                if not isinstance(key, str) or not key:
                    continue
                values[key] = _to_number(item.get("val"))

        if not values:
            raise SolarPowerConnectionError(
                f"{device.name}: current-data response contains no values"
            )

        now = datetime.now(tz=UTC)
        return StarkDeviceSnapshot(
            device=device,
            values=values,
            cloud_timestamp=_parse_cloud_timestamp(
                data.get("gts"),
                device.timezone_offset,
            ),
            fetched_at=now,
        )
