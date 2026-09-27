import "./stark-solarpower-panel-v098.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.11-beta001";

if (Panel && !Panel.prototype.__starkUiV099) {
  Panel.prototype.__starkUiV099 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".title-return-v090 .subtitle");
    if (!subtitle) return;

    const panelVersion = this._panel?.config?.ui_version || UI_VERSION;
    const integrationVersion = this._panel?.config?.integration_version || "—";
    const label = `UI v${panelVersion} · Интеграция v${integrationVersion}`;
    if (subtitle.textContent !== label) subtitle.textContent = label;

    if (!this.shadowRoot.querySelector("style[data-stark-ui-v099]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV099 = "true";
      style.textContent = `
        .title-return-v090 .subtitle {
          font-size:11px!important;
          line-height:1.1!important;
          white-space:normal!important;
          overflow-wrap:normal!important;
        }
      `;
      this.shadowRoot.append(style);
    }
  };
}
