import "./stark-solarpower-panel-v031.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.2";

if (Panel && !Panel.prototype.__starkUiV032) {
  Panel.prototype.__starkUiV032 = true;

  // Device order is a stable UI contract: UPS Internet stays first, UPS Boiler second.
  // Selection changes only active state and content context; it never reorders controls.
  Panel.prototype._prioritizeSelectedUps = function () {};

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // UI Standard v1.2: no decorative brand/device icon in the Header and
    // title is geometrically centered against symmetric Back/Refresh zones.
    root.querySelector(".title-icon")?.remove();

    if (!root.querySelector("style[data-stark-ui-v032]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV032 = "true";
      style.textContent = `
        .app-header {
          display: grid !important;
          grid-template-columns: 52px minmax(0, 1fr) 52px !important;
          align-items: center !important;
          gap: 0 !important;
        }
        .header-main { display: contents !important; }
        .back {
          grid-column: 1 !important;
          justify-self: start !important;
          width: 44px !important;
          min-width: 44px !important;
          height: 44px !important;
        }
        .title-wrap {
          grid-column: 2 !important;
          min-width: 0 !important;
          display: block !important;
          text-align: center !important;
        }
        .title-wrap > div { min-width: 0 !important; }
        .app-header h1 {
          margin: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          text-align: center !important;
        }
        .subtitle { text-align: center !important; }
        .refresh {
          grid-column: 3 !important;
          justify-self: end !important;
          width: 44px !important;
          min-width: 44px !important;
        }

        .global-device-context {
          grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr)) !important;
        }
        .global-device-context button {
          min-height: 48px !important;
        }

        @media (max-width: 430px) {
          .app-header {
            grid-template-columns: 48px minmax(0, 1fr) 48px !important;
          }
          .app-header h1 { font-size: 23px !important; }
        }
      `;
      root.append(style);
    }

    // Multi-device content follows Diagnostics: one selected physical UPS only.
    // The selector stays in its fixed order above; only the active content changes.
    const selectedId = this._selectedUpsId?.();
    const selectedIndex = Array.isArray(this._devices)
      ? this._devices.findIndex((device) => device.id === selectedId)
      : -1;

    if (selectedIndex >= 0) {
      if (this._view === "overview") {
        root.querySelectorAll(".overview-grid > .ups-card").forEach((card, index) => {
          if (index !== selectedIndex) card.remove();
        });
      }
      if (this._view === "history") {
        root.querySelectorAll(".history-grid > .history-card").forEach((card, index) => {
          if (index !== selectedIndex) card.remove();
        });
      }
    }
  };
}
