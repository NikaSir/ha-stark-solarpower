import "./stark-solarpower-panel-v091.js";

const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV092) {
  Panel.prototype.__starkUiV092 = true;
  const previousSyncControls = Panel.prototype._syncShellControlsV080;

  Panel.prototype._installDeviceStatusLampsV092 = function () {
    const root = this.shadowRoot;
    if (!root || root.querySelector("style[data-stark-ui-v092]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV092 = "true";
    style.textContent = `
      /* StarLine-style peer status lamps; selector geometry remains unchanged. */
      .global-device-context .device-health-dot {
        display:block!important;
        width:9px!important;
        height:9px!important;
        flex:0 0 9px!important;
        border-radius:50%!important;
        background:var(--disabled-text-color,#9ea3a8)!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--disabled-text-color,#9ea3a8) 12%,transparent)!important;
      }
      .global-device-context .device-health-dot.good {
        background:var(--success-color,#2eae55)!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--success-color,#2eae55) 12%,transparent)!important;
      }
      .global-device-context .device-health-dot.warn {
        background:var(--warning-color,#ed8b00)!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--warning-color,#ed8b00) 12%,transparent)!important;
      }
      .global-device-context .device-health-dot.bad {
        background:var(--error-color,#d93b3b)!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--error-color,#d93b3b) 12%,transparent)!important;
      }
    `;
    root.append(style);
  };

  Panel.prototype._syncShellControlsV080 = function () {
    previousSyncControls?.call(this);
    this._installDeviceStatusLampsV092();

    const selector = this.__starkShellV080?.selector
      || this.shadowRoot?.querySelector(".global-device-context");
    selector?.querySelectorAll("[data-ups-device]").forEach((button) => {
      const device = this._devices?.find((item) => item.id === button.dataset.upsDevice);
      if (!device) return;
      const status = this._status?.(device);
      const statusLabel = status?.label || status?.title || "Состояние неизвестно";
      const label = `${device.name}: ${statusLabel}`;
      if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
      const dot = button.querySelector(".device-health-dot");
      if (dot?.getAttribute("title") !== statusLabel) dot?.setAttribute("title", statusLabel);
    });
  };
}
