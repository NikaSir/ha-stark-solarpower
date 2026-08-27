import "./stark-solarpower-panel-v083.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.4";

if (Panel && !Panel.prototype.__starkUiV084) {
  Panel.prototype.__starkUiV084 = true;

  const previousReserve = Panel.prototype._reserveV050;
  const previousRender = Panel.prototype._render;

  Panel.prototype._reserveV050 = function (device, trusted) {
    const reserve = previousReserve.call(this, device, trusted);
    const battery = this._numeric(device, "battery_capacity");
    const mode = this._mode(device);
    const onBattery = mode === "battery_mode"
      || this._isOn(device, "on_battery") === true;

    if (!trusted || battery === null || onBattery || battery <= 20) {
      return reserve;
    }

    if (mode === "line_mode" && battery < 95) {
      return {
        label: `Резерв неполный · АКБ ${Math.round(battery)} %`,
        tone: "warn",
        icon: "mdi:battery-medium",
      };
    }

    if (mode !== "line_mode") {
      return {
        label: "Готовность резерва не подтверждена",
        tone: "unknown",
        icon: "mdi:battery-unknown",
      };
    }

    return reserve;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
