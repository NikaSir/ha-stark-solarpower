import "./stark-solarpower-panel-v098.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.11-beta005";

if (Panel) {
  Panel.prototype._headerVersionLabelV090 = function () {
    const integrationVersion = this._panel?.config?.integration_version || "—";
    return `UI v${UI_VERSION} / ${integrationVersion}`;
  };
}
