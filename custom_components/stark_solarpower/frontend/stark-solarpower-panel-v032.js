import "./stark-solarpower-panel-v031.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.2";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV032) {
  Panel.prototype.__starkUiV032 = true;

  const previousInstallDeviceContext = Panel.prototype._installDeviceContext;
  const previousRender = Panel.prototype._render;

  Panel.prototype._stableDeviceContextOrder = function () {
    const devices = Array.isArray(this._devices) ? this._devices : [];
    if (!Array.isArray(this._deviceContextOrder) || !this._deviceContextOrder.length) {
      this._deviceContextOrder = devices.map((device) => device.id);
    } else {
      for (const device of devices) {
        if (!this._deviceContextOrder.includes(device.id)) this._deviceContextOrder.push(device.id);
      }
      this._deviceContextOrder = this._deviceContextOrder.filter((id) => devices.some((device) => device.id === id));
    }
    return this._deviceContextOrder
      .map((id) => devices.find((device) => device.id === id))
      .filter(Boolean);
  };

  Panel.prototype._installDeviceContext = function () {
    previousInstallDeviceContext.call(this);

    const root = this.shadowRoot;
    const selector = root?.querySelector(".global-device-context");
    if (!selector || !this._devices?.length) return;

    const selectedId = this._selectedUpsId();
    const orderedDevices = this._stableDeviceContextOrder();
    selector.innerHTML = orderedDevices
      .map((device) => {
        const tone = this._status?.(device)?.tone || "bad";
        const active = device.id === selectedId;
        return `<button type="button" data-ups-device="${esc(device.id)}" class="${active ? "active" : ""}" aria-pressed="${active ? "true" : "false"}">
          <span class="device-health-dot ${esc(tone)}" aria-hidden="true"></span>
          <span class="device-name">${esc(device.name)}</span>
        </button>`;
      })
      .join("");

    selector.querySelectorAll("button[data-ups-device]").forEach((button) => {
      button.addEventListener("click", () => {
        const deviceId = button.dataset.upsDevice;
        if (!deviceId || deviceId === this._selectedUpsId()) return;
        this._diagnosticDeviceId = deviceId;
        this._prioritizeSelectedUps();
        this._queueRender();
      });
    });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;
  };
}
