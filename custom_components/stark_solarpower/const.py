"""Constants for the Stark SolarPower integration."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "stark_solarpower"
MANUFACTURER = "STARK Country"

API_URLS = (
    "https://android.shinemonitor.com/public/",
    "http://android.shinemonitor.com/public/",
)
APP_ID = "wifiapp.volfw.solarpower"
APP_VERSION = "1.4.0"
COMPANY_KEY = "bnrl_frRFjEz8Mkn"

UPDATE_INTERVAL = timedelta(seconds=60)
STALE_AFTER = timedelta(minutes=5)
MANUAL_REFRESH_COOLDOWN_SECONDS = 10

# Numeric `gts` values are encoded by the vendor as local wall time in UTC+8.
VENDOR_GTS_BASE_OFFSET_SECONDS = 8 * 60 * 60

MODE_LINE = "line_mode"
MODE_BATTERY = "battery_mode"
MODE_STANDBY = "standby_mode"
MODE_BYPASS = "bypass_mode"
MODE_FAULT = "fault_mode"
MODE_SHUTDOWN = "shutdown_mode"
MODE_UNKNOWN = "unknown"

MODE_OPTIONS = [
    MODE_LINE,
    MODE_BATTERY,
    MODE_STANDBY,
    MODE_BYPASS,
    MODE_FAULT,
    MODE_SHUTDOWN,
    MODE_UNKNOWN,
]
