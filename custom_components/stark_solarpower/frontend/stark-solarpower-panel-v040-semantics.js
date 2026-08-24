import "./stark-solarpower-panel-v040.js";

const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV040Semantics) {
  Panel.prototype.__starkUiV040Semantics = true;

  const previousStateTile = Panel.prototype._overviewStateTile;

  Panel.prototype._overviewStateTile = function (device, kind) {
    if (kind === "grid") {
      const mode = this._mode(device);
      const inputVoltage = this._numeric(device, "input_voltage");
      if (mode === "battery_mode") {
        return {
          icon: "mdi:transmission-tower-off",
          title: "Сеть",
          primary: "Нет входа",
          secondary: this._format(device, "input_voltage", "0 V"),
          tone: "warn",
          entity: this._entityId(device, "input_voltage"),
        };
      }
      if (inputVoltage !== null && inputVoltage > 0) {
        return {
          icon: "mdi:transmission-tower",
          title: "Сеть",
          primary: "Есть питание",
          secondary: this._format(device, "input_voltage"),
          tone: "good",
          entity: this._entityId(device, "input_voltage"),
        };
      }
      return {
        icon: "mdi:transmission-tower",
        title: "Сеть",
        primary: "Неизвестно",
        secondary: "Нет достоверных данных",
        tone: "unknown",
        entity: this._entityId(device, "input_voltage"),
      };
    }

    if (kind === "battery") {
      const tile = previousStateTile.call(this, device, kind);
      const battery = this._numeric(device, "battery_capacity");
      const mode = this._mode(device);
      if (mode !== "battery_mode" && battery !== null) {
        tile.secondary = battery >= 95 ? "Заряжен" : "Доступен";
      }
      return tile;
    }

    return previousStateTile.call(this, device, kind);
  };
}
