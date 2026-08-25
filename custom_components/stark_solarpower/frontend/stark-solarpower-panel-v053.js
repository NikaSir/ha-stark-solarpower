import "./stark-solarpower-panel-v052.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.3";

if (Panel && !Panel.prototype.__starkUiV053) {
  Panel.prototype.__starkUiV053 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v053]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV053 = "true";
      style.textContent = `
        /*
         * UI 0.5.3: keep the panel header below the iOS Dynamic Island.
         * panel_custom already owns the Home Assistant shell; only this
         * integration panel consumes the remaining top safe-area inset.
         */
        :host {
          --stark-safe-top-v053:
            max(
              10px,
              var(
                --safe-area-inset-top,
                env(safe-area-inset-top, 0px)
              )
            );
          margin-top:0 !important;
          padding-top:0 !important;
        }
        .app {
          padding-top:var(--stark-safe-top-v053) !important;
        }
        .app-header {
          margin-top:0 !important;
        }

        @media (display-mode:browser) and (min-width:760px) {
          :host { --stark-safe-top-v053:10px; }
        }
      `;
      root.append(style);
    }
  };
}
