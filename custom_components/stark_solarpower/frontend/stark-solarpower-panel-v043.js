import "./stark-solarpower-panel-v042.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.3";

if (Panel && !Panel.prototype.__starkUiV043) {
  Panel.prototype.__starkUiV043 = true;

  const previousKeyFromUniqueId = Panel.prototype._keyFromUniqueId;
  const previousExtendedAvailable = Panel.prototype._extendedAvailable;
  const previousHeadline = Panel.prototype._overviewHeadline;
  const previousBindEvents = Panel.prototype._bindEvents;
  const previousRender = Panel.prototype._render;

  // UI 0.4.3 hardening: PFC status is a real backend diagnostic entity and
  // must participate in the frontend entity map even though older bundles did
  // not include it in ENTITY_KEYS.
  Panel.prototype._keyFromUniqueId = function (uniqueId) {
    if (uniqueId?.endsWith("_pfc_status")) return "pfc_status";
    return previousKeyFromUniqueId.call(this, uniqueId);
  };

  // Do not infer extended-channel health from only three values. Treat the
  // detailed telemetry surface as available when any confirmed extended field
  // is live for the selected UPS.
  Panel.prototype._extendedAvailable = function (device) {
    const keys = [
      "positive_bus_voltage",
      "negative_bus_voltage",
      "ups_temperature",
      "pfc_temperature",
      "ambient_temperature",
      "charger_temperature",
      "battery_piece_number",
      "battery_group_number",
      "battery_remain_time",
      "protocol_id",
      "dctodc_status",
      "pfc_status",
      "inverter_status",
      "input_relay_status",
      "output_relay_status",
    ];
    if (keys.some((key) => this._available(this._state(device, key)))) return true;
    return previousExtendedAvailable.call(this, device);
  };

  // The backend owns the stale threshold. The UI only reports the current
  // stale state and observed age, so a future threshold change cannot make the
  // explanatory text lie.
  Panel.prototype._overviewHeadline = function (device) {
    const headline = previousHeadline.call(this, device);
    if (this._isOn(device, "data_stale") === true) {
      const age = this._format(device, "data_age", "Неизвестно");
      headline.detail = age === "Неизвестно"
        ? "Возраст последнего snapshot неизвестен"
        : `Последний snapshot: ${age} назад`;
    }
    return headline;
  };

  Panel.prototype._setRefreshFeedbackV043 = function (state) {
    this._refreshFeedbackV043 = state;
    const button = this.shadowRoot?.querySelector(".refresh");
    if (!button) return;

    button.classList.toggle("is-refreshing-v043", state === "busy");
    button.classList.toggle("is-ok-v043", state === "ok");
    button.classList.toggle("is-error-v043", state === "error");
    button.disabled = state === "busy";
    button.setAttribute("aria-busy", state === "busy" ? "true" : "false");

    const icon = button.querySelector("ha-icon");
    if (icon) {
      icon.setAttribute(
        "icon",
        state === "busy"
          ? "mdi:loading"
          : state === "ok"
            ? "mdi:check"
            : state === "error"
              ? "mdi:alert-circle-outline"
              : "mdi:refresh"
      );
    }

    const label = state === "busy"
      ? "Обновление UPS…"
      : state === "ok"
        ? "UPS обновлены"
        : state === "error"
          ? "Ошибка обновления UPS"
          : "Обновить все ИБП";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  };

  // Replace the old fire-and-forget refresh listener with a single listener
  // that provides visual progress/success/error feedback and prevents repeated
  // taps while the coordinator refresh is in flight.
  Panel.prototype._bindEvents = function () {
    previousBindEvents.call(this);

    const root = this.shadowRoot;
    const oldButton = root?.querySelector(".refresh");
    if (!root || !oldButton) return;

    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    this._setRefreshFeedbackV043(this._refreshFeedbackV043 || null);

    button.addEventListener("click", async () => {
      if (this._refreshFeedbackV043 === "busy" || !this._hass) return;
      const entityId = this._devices
        .map((device) => this._entityId(device, "refresh_now"))
        .find(Boolean);
      if (!entityId) return;

      this._setRefreshFeedbackV043("busy");
      try {
        await this._hass.callService("button", "press", { entity_id: entityId });
        this._setRefreshFeedbackV043("ok");
        window.setTimeout(() => {
          if (this._refreshFeedbackV043 !== "ok") return;
          this._setRefreshFeedbackV043(null);
        }, 850);
      } catch (err) {
        console.warn("Stark SolarPower refresh failed", err);
        this._setRefreshFeedbackV043("error");
        window.setTimeout(() => {
          if (this._refreshFeedbackV043 !== "error") return;
          this._setRefreshFeedbackV043(null);
        }, 1400);
      }
    });
  };

  Panel.prototype._renderFingerprintV043 = function () {
    const devices = Array.isArray(this._devices) ? this._devices : [];
    const states = [];
    for (const device of devices) {
      const entities = device?.entities || {};
      for (const [key, entityId] of Object.entries(entities)) {
        const stateObj = this._hass?.states?.[entityId];
        states.push([
          device.id,
          key,
          entityId,
          stateObj?.state ?? null,
          stateObj?.last_updated ?? null,
          stateObj?.attributes?.event_type ?? null,
          stateObj?.attributes?.unit_of_measurement ?? null,
        ]);
      }
    }
    return JSON.stringify([
      this._view,
      this._diagnosticDeviceId,
      this._loadingRegistry,
      this._registryLoaded,
      this._registryError,
      devices.map((device) => [device.id, device.name, device.model]),
      states,
    ]);
  };

  Panel.prototype._render = function () {
    // Home Assistant may update hundreds of unrelated entities while this
    // panel is open. Avoid rebuilding the complete Shadow DOM unless the
    // selected view/device or a Stark entity actually changed.
    const fingerprint = this._renderFingerprintV043();
    if (this._renderFingerprintCacheV043 === fingerprint && this.shadowRoot?.childElementCount) {
      return;
    }
    this._renderFingerprintCacheV043 = fingerprint;

    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // Battery copy must describe the observed capacity, not label every
    // non-battery-mode state as fully charged.
    if (this._view === "overview") {
      const selectedId = this._selectedUpsId?.();
      const device = this._devices.find((item) => item.id === selectedId) || this._devices[0];
      const battery = device ? this._numeric(device, "battery_capacity") : null;
      const mode = device ? this._mode(device) : null;
      const copy = root.querySelector(".overview-v040 .battery-node small");
      if (copy) {
        copy.textContent = mode === "battery_mode"
          ? "Питает нагрузку"
          : battery === null
            ? "Состояние неизвестно"
            : battery >= 95
              ? "Заряжен"
              : "Доступен";
      }
    }

    if (!root.querySelector("style[data-stark-ui-v043]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV043 = "true";
      style.textContent = `
        /* Normal data stays neutral. Semantic colors are reserved for status. */
        .ups-hero-v040.good,
        .overview-state-tile.good {
          color: var(--primary-text-color) !important;
        }
        .hero-metric-v040:nth-child(3) ha-icon,
        .hero-metric-v040:nth-child(4) ha-icon {
          color: var(--primary-color) !important;
        }
        .battery-node {
          background: color-mix(in srgb, var(--primary-color) 7%, var(--card-background-color)) !important;
        }
        .battery-node ha-icon {
          color: var(--primary-color) !important;
        }
        .battery-flow .battery-node {
          background: color-mix(in srgb, var(--warning-color,#ed6c02) 9%, var(--card-background-color)) !important;
        }
        .battery-flow .battery-node ha-icon {
          color: var(--warning-color,#ed6c02) !important;
        }

        /* Compact the hero without reducing mobile-readable typography. */
        .ups-power-diagram { margin-top: 22px !important; margin-bottom: 18px !important; }
        .diagram-node { min-height: 102px !important; }
        .battery-link { height: 30px !important; }
        .battery-node { min-height: 94px !important; }
        .hero-metric-v040 { min-height: 70px !important; }

        .refresh.is-refreshing-v043 ha-icon {
          animation: stark-refresh-spin-v043 .8s linear infinite;
        }
        .refresh.is-ok-v043 { color: var(--success-color,#2e7d32) !important; }
        .refresh.is-error-v043 { color: var(--error-color,#d32f2f) !important; }
        @keyframes stark-refresh-spin-v043 { to { transform: rotate(360deg); } }

        @media (max-width:430px) {
          .diagram-node { min-height: 98px !important; }
          .battery-node { min-height: 90px !important; }
          .hero-metric-v040 { min-height: 68px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .refresh.is-refreshing-v043 ha-icon { animation: none !important; }
        }
      `;
      root.append(style);
    }

    this._setRefreshFeedbackV043(this._refreshFeedbackV043 || null);
  };
}
