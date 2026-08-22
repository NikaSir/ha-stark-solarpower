import "./stark-solarpower-panel-v030.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.1";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV031) {
  Panel.prototype.__starkUiV031 = true;

  const baseRender = Panel.prototype._render;

  Panel.prototype._selectedUpsId = function () {
    return this._diagnosticDeviceId || this._devices?.[0]?.id || null;
  };

  Panel.prototype._prioritizeSelectedUps = function () {
    const selectedId = this._selectedUpsId();
    if (!selectedId || !Array.isArray(this._devices) || this._devices.length < 2) return;
    const index = this._devices.findIndex((device) => device.id === selectedId);
    if (index <= 0) return;
    const selected = this._devices[index];
    this._devices = [selected, ...this._devices.filter((device) => device.id !== selectedId)];
  };

  Panel.prototype._installDeviceContext = function () {
    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    if (!root || !header || !this._devices?.length) return;

    // Diagnostics had its own local switcher in the first UI revisions.
    // The NikaS app shell now owns one device-context selector shared by all views.
    root.querySelectorAll(".device-switcher").forEach((node) => node.remove());
    root.querySelector(".global-device-context")?.remove();

    if (!root.querySelector("style[data-stark-device-context]")) {
      const style = document.createElement("style");
      style.dataset.starkDeviceContext = "true";
      style.textContent = `
        .global-device-context {
          display: grid;
          grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr));
          gap: 8px;
          margin: 0 2px 12px;
        }
        .global-device-context button {
          min-width: 0;
          min-height: 48px;
          border: 1px solid var(--divider-color);
          border-radius: 15px;
          padding: 7px 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.15;
          text-align: center;
          -webkit-tap-highlight-color: transparent;
        }
        .global-device-context button.active {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 7%, var(--card-background-color));
          font-weight: 750;
        }
        .global-device-context button:active { transform: scale(.98); }
        .device-health-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: var(--secondary-text-color);
        }
        .device-health-dot.good { background: var(--success-color, #2e7d32); }
        .device-health-dot.warn { background: var(--warning-color, #ed6c02); }
        .device-health-dot.bad { background: var(--error-color, #d32f2f); }
        .global-device-context .device-name {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        @media (max-width: 380px) {
          .global-device-context { gap: 6px; margin-left: 0; margin-right: 0; }
          .global-device-context button { padding: 6px; font-size: 11px; }
        }
      `;
      root.append(style);
    }

    const selectedId = this._selectedUpsId();
    const selector = document.createElement("div");
    selector.className = "global-device-context";
    selector.setAttribute("aria-label", "Выбор UPS");
    selector.style.setProperty("--ups-count", String(Math.max(1, this._devices.length)));
    selector.innerHTML = this._devices
      .map((device) => {
        const tone = this._status?.(device)?.tone || "bad";
        const active = device.id === selectedId;
        return `<button type="button" data-ups-device="${esc(device.id)}" class="${active ? "active" : ""}" aria-pressed="${active ? "true" : "false"}">
          <span class="device-health-dot ${esc(tone)}" aria-hidden="true"></span>
          <span class="device-name">${esc(device.name)}</span>
        </button>`;
      })
      .join("");

    header.insertAdjacentElement("afterend", selector);

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
    this._prioritizeSelectedUps();
    baseRender.call(this);

    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    this._installDeviceContext();
  };
}
