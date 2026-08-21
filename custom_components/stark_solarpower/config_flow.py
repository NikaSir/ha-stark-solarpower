"""Config flow for Stark SolarPower."""

from __future__ import annotations

from collections.abc import Mapping
import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import (
    SolarPowerAuthError,
    SolarPowerConnectionError,
    SolarPowerNoDevicesError,
    StarkSolarPowerApi,
)
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
    }
)


class StarkSolarPowerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Stark SolarPower."""

    VERSION = 1

    async def _validate(self, username: str, password: str) -> None:
        """Validate credentials and confirm at least one device exists."""
        api = StarkSolarPowerApi(
            async_get_clientsession(self.hass),
            username,
            password,
        )
        await api.async_login()
        await api.async_discover_devices()

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle the initial setup step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            username = user_input[CONF_USERNAME].strip()
            password = user_input[CONF_PASSWORD]

            await self.async_set_unique_id(username.casefold())
            self._abort_if_unique_id_configured()

            try:
                await self._validate(username, password)
            except SolarPowerAuthError:
                errors["base"] = "invalid_auth"
            except SolarPowerNoDevicesError:
                errors["base"] = "no_devices"
            except SolarPowerConnectionError:
                errors["base"] = "cannot_connect"
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Unexpected Stark SolarPower setup error")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(
                    title=f"Stark SolarPower · {username}",
                    data={
                        CONF_USERNAME: username,
                        CONF_PASSWORD: password,
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=USER_SCHEMA,
            errors=errors,
        )

    async def async_step_reauth(
        self,
        entry_data: Mapping[str, Any],
    ) -> ConfigFlowResult:
        """Start reauthentication."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Confirm a new password."""
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()

        if user_input is not None:
            password = user_input[CONF_PASSWORD]
            try:
                await self._validate(entry.data[CONF_USERNAME], password)
            except SolarPowerAuthError:
                errors["base"] = "invalid_auth"
            except SolarPowerConnectionError:
                errors["base"] = "cannot_connect"
            except SolarPowerNoDevicesError:
                errors["base"] = "no_devices"
            else:
                return self.async_update_reload_and_abort(
                    entry,
                    data={**entry.data, CONF_PASSWORD: password},
                )

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_PASSWORD): str}),
            errors=errors,
            description_placeholders={
                "username": entry.data[CONF_USERNAME],
            },
        )
