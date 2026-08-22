const PanelV033 = customElements.get("stark-solarpower-panel");
const UI_VERSION_V033 = "0.3.3";

if (PanelV033 && !PanelV033.prototype.__starkUiV033) {
  PanelV033.prototype.__starkUiV033 = true;
  const previousRenderV033 = PanelV033.prototype._render;

  PanelV033.prototype._render = function () {
    previousRenderV033.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION_V033}`;
  };
}
