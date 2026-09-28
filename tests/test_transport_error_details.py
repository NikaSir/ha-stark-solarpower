"""Transport errors should be useful without exposing signed request URLs."""

from __future__ import annotations

import asyncio
import importlib
from pathlib import Path
import sys
from types import ModuleType
import unittest
from unittest.mock import patch


PACKAGE = Path(__file__).resolve().parents[1] / "custom_components" / "stark_solarpower"
SECRET_URL = "https://example.test/api?token=private-token&sign=private-signature"


class ClientError(Exception):
    """Stand-in for aiohttp's transport error base class."""


class ClientResponseError(ClientError):
    """Stand-in for an HTTP error whose text includes the signed URL."""

    def __init__(self, status: int) -> None:
        self.status = status
        super().__init__(f"HTTP {status} at {SECRET_URL}")


class ClientConnectorError(ClientError):
    """Stand-in for a connection failure whose text includes the URL."""


class FakeResponse:
    def __init__(self, error: Exception | None = None, payload=None) -> None:
        self.error = error
        self.payload = payload if payload is not None else {"err": 0}

    async def __aenter__(self):
        if isinstance(self.error, TimeoutError):
            raise self.error
        return self

    async def __aexit__(self, *args):
        return False

    def raise_for_status(self) -> None:
        if isinstance(self.error, ClientError):
            raise self.error

    async def json(self, *, content_type=None):
        if isinstance(self.error, ValueError):
            raise self.error
        return self.payload


class FakeSession:
    def __init__(self, response: FakeResponse) -> None:
        self.response = response

    def get(self, url: str) -> FakeResponse:
        return self.response


def load_api():
    package = ModuleType("stark_transport_test")
    package.__path__ = [str(PACKAGE)]
    aiohttp = ModuleType("aiohttp")
    aiohttp.ClientError = ClientError
    aiohttp.ClientResponseError = ClientResponseError
    aiohttp.ClientSession = FakeSession
    with patch.dict(sys.modules, {"stark_transport_test": package, "aiohttp": aiohttp}):
        return importlib.import_module("stark_transport_test.api")


API = load_api()


class TransportErrorDetailsTests(unittest.TestCase):
    def assert_safe_error(self, error: Exception, expected: str) -> None:
        client = API.StarkSolarPowerApi(FakeSession(FakeResponse(error)), "user", "password")
        with self.assertRaises(API.SolarPowerConnectionError) as raised:
            asyncio.run(client._get_json_from_url(SECRET_URL))
        self.assertIn(expected, str(raised.exception))
        self.assertNotIn("private-token", str(raised.exception))
        self.assertNotIn("private-signature", str(raised.exception))

    def test_timeout_identifies_expired_request(self):
        self.assert_safe_error(TimeoutError(), "timed out")

    def test_http_error_reports_status_without_signed_url(self):
        self.assert_safe_error(ClientResponseError(503), "HTTP 503")

    def test_connection_error_reports_type_without_signed_url(self):
        self.assert_safe_error(
            ClientConnectorError(f"Connection failed at {SECRET_URL}"),
            "ClientConnectorError",
        )

    def test_invalid_json_is_identified_without_response_body(self):
        self.assert_safe_error(ValueError(f"Invalid JSON at {SECRET_URL}"), "invalid JSON")


if __name__ == "__main__":
    unittest.main()
