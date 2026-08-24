"""Integration-owned Stark SolarPower frontend panel."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN

PANEL_ID = "ups"
PANEL_TITLE = "UPS"
PANEL_URL_PATH = "dashboard-ups"
PANEL_PARENT_ROUTE = "/dashboard-infrastructure/overview"
PANEL_ICON = "mdi:battery-charging"
PANEL_WEB_COMPONENT = "stark-solarpower-panel"
PANEL_UI_VERSION = "0.4.1"
PANEL_TEMPLATE_VERSION = "1.0"
PANEL_STATIC_URL = "/stark_solarpower_panel"
PANEL_STATIC_REGISTERED = "panel_static_registered"
PANEL_DIRECTORY = Path(__file__).parent / "frontend"
PANEL_BUNDLE = "stark-solarpower-panel-bundle.js"

PANEL_METADATA = {
    "id": PANEL_ID,
    "title": PANEL_TITLE,
    "path": f"/{PANEL_URL_PATH}",
    "parent_route": PANEL_PARENT_ROUTE,
    "icon": PANEL_ICON,
    "owner": DOMAIN,
    "expose_in_generated_ui": True,
    "preferred_view": "overview",
    "ui_version": PANEL_UI_VERSION,
    "template_version": PANEL_TEMPLATE_VERSION,
    "frontend_bundle": PANEL_BUNDLE,
}


async def async_register_ups_panel(hass: HomeAssistant) -> None:
    """Register the Stark SolarPower panel and its static assets."""
    domain_data = hass.data.setdefault(DOMAIN, {})

    if not domain_data.get(PANEL_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    PANEL_STATIC_URL,
                    str(PANEL_DIRECTORY),
                    cache_headers=False,
                )
            ]
        )
        domain_data[PANEL_STATIC_REGISTERED] = True

    if frontend.async_panel_exists(hass, PANEL_URL_PATH):
        return

    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_WEB_COMPONENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{PANEL_STATIC_URL}/{PANEL_BUNDLE}?v={PANEL_UI_VERSION}",
        embed_iframe=False,
        require_admin=False,
        handle_safe_area=True,
        config=PANEL_METADATA,
    )


def async_unregister_ups_panel(hass: HomeAssistant) -> None:
    """Remove the panel when its owning config entry is unloaded."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
